const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// Conexão com o banco PostgreSQL (Neon.tech)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Mapeamento das categorias, incluindo todas que você mencionou
const mapaCategorias = {
  aventura: "sport",
  cultural: "cultural",
  relaxamento: "natural",
  gastronomico: "foods",
  compras: "shops",
  romantico: "architecture",
  museus: "museums",
  praias: "beaches",
  parques: "parks",
  montanhas: "mountains",
  vidaNoturna: "adult,nightclubs",
  esportes: "sport",
  toursGuiados: "tourist_facilities",
  festivais: "cultural,festivals",
  shows: "cultural,events",
  natureza: "natural",
  historia: "historic",
  fastFood: "foods,fast_food",
  gourmet: "foods,gourmet",
  vegetariano: "foods,vegetarian",
  vegano: "foods,vegan",
  frutosDoMar: "foods,seafood",
  comidaDeRua: "foods,street_food",
  cafeDaManha: "foods,breakfast",
  almoco: "foods,lunch",
  jantar: "foods,dinner",
};

// Exemplo de rota no seu server.js ou controller
app.get("/api/roteiros/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM roteiros WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Roteiro não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar roteiro" });
  }
});

// Rota de busca de pontos turísticos
app.post("/api/search", async (req, res) => {
  const { cidade, pais, preferencias, dataIda, dataVolta, maxPontos } = req.body;

  try {
    // Validações existentes
    if (!pais || pais.length !== 2) {
      return res.status(400).json({
        message: "O país deve ser um código ISO-3166 de 2 letras (ex: BR, US).",
      });
    }

    if (!Array.isArray(preferencias) || preferencias.length === 0) {
      return res
        .status(400)
        .json({ message: "Selecione pelo menos uma preferência." });
    }

    if (!dataIda || !dataVolta) {
      return res
        .status(400)
        .json({ message: "Data de ida e volta são obrigatórias." });
    }

    const inicio = new Date(dataIda);
    const fim = new Date(dataVolta);
    const diffDias = Math.max(
      1,
      Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24))
    );

    const limite = Math.min(maxPontos || diffDias * 5, 100);

    const preferenciasValidas = preferencias
      .map((p) => p.toLowerCase())
      .map((p) => mapaCategorias[p])
      .filter(Boolean);

    if (preferenciasValidas.length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhuma preferência válida foi fornecida." });
    }

    const coordsResp = await axios.get(
      `https://api.opentripmap.com/0.1/en/places/geoname`,
      {
        params: {
          name: cidade,
          country: pais,
          apikey: process.env.OTP_API_KEY,
        },
      }
    );

    const { lat, lon } = coordsResp.data;

    if (!lat || !lon) {
      return res.status(500).json({
        message: "Coordenadas não encontradas para a cidade especificada.",
      });
    }

    const kinds = preferenciasValidas.join(",");

    const poisResp = await axios.get(
      `https://api.opentripmap.com/0.1/en/places/radius`,
      {
        params: {
          radius: 10000,
          lon,
          lat,
          kinds,
          rate: 3,
          format: "json",
          limit: 100,
          apikey: process.env.OTP_API_KEY,
        },
      }
    );

    const pontosValidos = poisResp.data.filter(
      (ponto) =>
        ponto.name && ponto.name.trim().toLowerCase() !== "nome não disponível"
    );

    const pontosLimitados = pontosValidos.slice(0, limite);

    // NOVA PARTE: Obtenção do clima para cada dia na latitude e longitude da cidade
    const climaPorDia = [];
    for (let i = 0; i < diffDias; i++) {
      const dataAtual = new Date(inicio);
      dataAtual.setDate(inicio.getDate() + i);

      try {
        const climaResp = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              lat: lat, // latitude da cidade
              lon: lon, // longitude da cidade
              appid: process.env.OPENWEATHERMAP_API_KEY,
              units: "metric",
            },
          }
        );

        climaPorDia.push({
          data: dataAtual.toISOString().split('T')[0], // YYYY-MM-DD
          temperatura: climaResp.data.main.temp,
          descricao: climaResp.data.weather[0].description,
        });
      } catch (e) {
        console.warn(`⚠️ Falha ao obter clima para ${dataAtual.toISOString().split('T')[0]}`);
      }
    }

    // Detalhar os pontos limitados e incluir climaPorDia para cada um
    const pontosDetalhados = await Promise.all(
      pontosLimitados.map(async (ponto) => {
        let endereco = {};
        try {
          const detalhe = await axios.get(
            `https://api.opentripmap.com/0.1/en/places/xid/${ponto.xid}`,
            {
              params: {
                apikey: process.env.OTP_API_KEY,
              },
            }
          );
          endereco = detalhe.data?.address || {};
        } catch (e) {
          console.warn(`⚠️ Falha ao obter endereço para ${ponto.name}`);
        }

        return {
          id: ponto.xid,
          nome: ponto.name,
          tipo: ponto.kinds,
          endereco,
          coordenadas: {
            lat: ponto.point.lat,
            lon: ponto.point.lon,
          },
          clima: climaPorDia, // array de clima para os dias da viagem
        };
      })
    );

    res.json(pontosDetalhados);
  } catch (error) {
    console.error(
      "❌ Erro:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      message: "Erro ao buscar pontos turísticos",
      error: error.message,
    });
  }
});


// Rota de registro
app.post("/api/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, password]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Erro ao registrar usuário" });
  }
});

// Rota de login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    // Verifica a senha
    if (user.password !== password) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Gerar o token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Enviar a resposta com o token JWT, o nome do usuário e o id do usuário
    res.json({
      message: "Login bem-sucedido",
      token,
      userName: user.name,
      userId: user.id,
    }); // Inclua userId
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para adicionar ao banco
app.post("/api/roteiros", async (req, res) => {
  const {
    usuarioId,
    cidade,
    pais,
    dataIda,
    dataVolta,
    preferencias,
    pontosLimitados,
    pontosExtras,
  } = req.body;

  if (
    !usuarioId ||
    !cidade ||
    !pais ||
    !dataIda ||
    !dataVolta ||
    !Array.isArray(pontosLimitados) ||
    !Array.isArray(pontosExtras)
  ) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resultadoRoteiro = await client.query(
      `INSERT INTO roteiros (usuario_id, cidade, pais, data_ida, data_volta, preferencias, pontos, alternativas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        usuarioId,
        cidade,
        pais,
        dataIda,
        dataVolta,
        preferencias,
        JSON.stringify(pontosLimitados),
        JSON.stringify(pontosExtras),
      ]
    );

    const roteiroId = resultadoRoteiro.rows[0].id;

    // Insere os pontosExtras na tabela separada
    for (const ponto of pontosExtras) {
      let lat = null;
      let lon = null;
      if (
        ponto.coordenadas &&
        ponto.coordenadas.type === "Point" &&
        Array.isArray(ponto.coordenadas.coordinates)
      ) {
        lon = ponto.coordenadas.coordinates[0];
        lat = ponto.coordenadas.coordinates[1];
      }

      await client.query(
        `INSERT INTO pontos_extras 
         (roteiro_id, xid, nome, tipo, endereco, lat, lon, kinds, wikidata, coordenadas, dados_completos)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          roteiroId,
          ponto.xid || null,
          ponto.nome || null,
          ponto.tipo || ponto.kinds || null,
          ponto.endereco ? JSON.stringify(ponto.endereco) : null,
          lat,
          lon,
          ponto.kinds || null,
          ponto.wikidata || null,
          ponto.coordenadas || null,
          ponto,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      sucesso: true,
      roteiroId,
      mensagem: "Roteiro salvo com sucesso",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar roteiro:", err);
    res.status(500).json({
      sucesso: false,
      error: "Erro no servidor ao salvar roteiro",
    });
  } finally {
    client.release();
  }
});


// Rota para buscar todos os roteiros ou os de um usuário específico
app.get("/api/roteiros", async (req, res) => {
  const { usuarioId } = req.query;

  try {
    let resultado;

    if (usuarioId) {
      // Busca só os roteiros daquele usuário
      resultado = await pool.query(
        "SELECT * FROM roteiros WHERE usuario_id = $1 ORDER BY data_ida ASC",
        [usuarioId]
      );
    } else {
      // Busca todos os roteiros
      resultado = await pool.query(
        "SELECT * FROM roteiros ORDER BY data_ida ASC"
      );
    }

    // Converte o campo JSONB de string para objeto JavaScript, se necessário
    const roteiros = resultado.rows.map((r) => {
      let pontos;
      try {
        pontos = typeof r.pontos === "string" ? JSON.parse(r.pontos) : r.pontos;
      } catch (e) {
        pontos = r.pontos; // Se o campo 'pontos' não for um JSON válido, mantém o valor original
      }

      return {
        ...r,
        pontos,
      };
    });

    res.status(200).json({ sucesso: true, roteiros });
  } catch (err) {
    console.error("Erro ao buscar roteiros:", err);
    res.status(500).json({ sucesso: false, error: "Erro ao buscar roteiros" });
  }
});

// Rota para buscar os roteiros de um usuário específico
app.get("/api/roteiros/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM roteiros WHERE usuario_id = $1",
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum roteiro encontrado para este usuário" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar roteiros do usuário:", error);
    res.status(500).json({ message: "Erro ao buscar roteiros do usuário" });
  }
});

app.get("/api/cidade-imagem", async (req, res) => {
  const { cidade } = req.query;

  if (!cidade) {
    return res.status(400).json({ error: "Nome da cidade é obrigatório" });
  }

  try {
    const unsplashResp = await axios.get(
      `https://api.unsplash.com/search/photos`,
      {
        params: {
          query: cidade,
          per_page: 1,
          client_id: process.env.UNSPLASH_ACCESS_KEY,
        },
      }
    );

    if (unsplashResp.data.results.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhuma imagem encontrada para a cidade" });
    }

    const imagemUrl = unsplashResp.data.results[0].urls.regular;

    res.json({ imagemUrl });
  } catch (error) {
    console.error("Erro ao buscar imagem da cidade:", error.message);
    res.status(500).json({ error: "Erro ao buscar imagem da cidade" });
  }
});

app.get("/api/pontos-extras/:roteiro_id", async (req, res) => {
  const { roteiro_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM pontos_extras WHERE roteiro_id = $1 ORDER BY criado_em DESC",
      [roteiro_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar pontos extras:", error);
    res.status(500).json({ message: "Erro ao buscar pontos extras" });
  }
});

// Substituir um ponto no roteiro por um ponto extra
app.post("/api/roteiros/:roteiroId/substituir-ponto", async (req, res) => {
  const { roteiroId } = req.params;
  const { pontoExtraId, pontoOriginalId } = req.body;

  if (!pontoExtraId || !pontoOriginalId) {
    return res
      .status(400)
      .json({ error: "ID do ponto extra e original são obrigatórios." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Buscar o ponto extra
    const pontoExtraRes = await client.query(
      "SELECT * FROM pontos_extras WHERE id = $1 AND roteiro_id = $2",
      [pontoExtraId, roteiroId]
    );

    if (pontoExtraRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Ponto extra não encontrado para este roteiro." });
    }

    const pontoExtra = pontoExtraRes.rows[0];

    // Buscar o roteiro
    const roteiroRes = await client.query(
      "SELECT pontos FROM roteiros WHERE id = $1",
      [roteiroId]
    );

    if (roteiroRes.rows.length === 0) {
      return res.status(404).json({ error: "Roteiro não encontrado." });
    }

    let pontos = roteiroRes.rows[0].pontos;

    // Verificar se o ponto original existe
    const indexOriginal = pontos.findIndex((p) => p.id === pontoOriginalId);
    if (indexOriginal === -1) {
      return res
        .status(404)
        .json({ error: "Ponto original não encontrado no roteiro." });
    }

    // Criar o novo ponto com base no ponto extra
    const novoPonto = {
      id: pontoExtra.xid,
      nome: pontoExtra.nome,
      tipo: pontoExtra.tipo,
      endereco: pontoExtra.endereco,
      coordenadas: pontoExtra.coordenadas,
      clima: null, // ou algum valor padrão
    };

    // Substituir o ponto
    pontos[indexOriginal] = novoPonto;

    // Atualizar o roteiro
    await client.query("UPDATE roteiros SET pontos = $1 WHERE id = $2", [
      JSON.stringify(pontos),
      roteiroId,
    ]);

    await client.query("COMMIT");

    res
      .status(200)
      .json({ message: "Ponto substituído com sucesso.", novoPonto });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao substituir ponto:", error);
    res.status(500).json({ error: "Erro ao substituir ponto." });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
