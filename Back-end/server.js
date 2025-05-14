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
  const { cidade, pais, preferencias, dataIda, dataVolta, maxPontos } =
    req.body;

  try {
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

    // Se o cliente enviar maxPontos, usamos ele (com um limite de segurança de até 100)
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

    // Limitar os pontos de acordo com o número máximo
    const pontosLimitados = pontosValidos.slice(0, limite);

    // Salvar pontos não visíveis como opção no banco de dados

    // Primeiro, salva o roteiro no banco
    const roteiroInsert = await pool.query(
      `INSERT INTO roteiros (usuario_id, cidade, pais, data_ida, data_volta, preferencias, pontos)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING id`,
      [
        req.body.usuarioId || null,
        cidade,
        pais,
        dataIda,
        dataVolta,
        preferencias,
        JSON.stringify(pontosLimitados),
      ]
    );

    const roteiroId = roteiroInsert.rows[0].id;

    // Agora salva os pontos extras com o roteiroId correto
    const pontosExtras = pontosValidos.slice(limite);
    console.log(pontosExtras); // Verifique os pontos extras antes de inseri-los

    if (pontosExtras.length > 0) {
      console.log(
        `Iniciando inserção de ${pontosExtras.length} pontos extras...`
      ); // Adicionando um log para saber quantos pontos estão sendo processados

      await Promise.all(
        pontosExtras.map(async (ponto) => {
          try {
            console.log(`Inserindo ponto extra: ${ponto.name}`); // Adicionando log antes de inserir
            await pool.query(
              `INSERT INTO pontos_extras (roteiro_id, criado_em, ponto)
           VALUES ($1, NOW(), $2)`,
              [
                roteiroId,
                JSON.stringify({
                  ponto_id: ponto.xid,
                  nome: ponto.name,
                  tipo: ponto.kinds,
                  coordenadas: {
                    lat: ponto.point.lat,
                    lon: ponto.point.lon,
                  },
                }),
              ]
            );
            console.log(`Ponto extra ${ponto.name} inserido com sucesso!`);
          } catch (error) {
            console.error("Erro ao inserir ponto extra:", error);
          }
        })
      );
    } else {
      console.log("Nenhum ponto extra encontrado para inserção.");
    }

    // Detalhar os pontos limitados
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

        // Clima
        let clima = {};
        try {
          const climaResp = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast`,
            {
              params: {
                lat: ponto.point.lat,
                lon: ponto.point.lon,
                appid: OPENWEATHERMAP_API_KEY,
                units: "metric",
              },
            }
          );

          const forecast = climaResp.data.list[0];
          clima = {
            temperatura: forecast.main.temp,
            descricao: forecast.weather[0].description,
            dataHora: forecast.dt_txt,
          };
        } catch (e) {
          console.warn(`⚠️ Falha ao obter clima para ${ponto.name}`);
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
          clima,
        };
      })
    );

    // ✅ Enviando resposta com pontos + clima
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

app.post("/api/roteiros", async (req, res) => {
  const { usuarioId, cidade, pais, dataIda, dataVolta, preferencias, pontos } =
    req.body;

  if (
    !usuarioId ||
    !cidade ||
    !pais ||
    !dataIda ||
    !dataVolta ||
    !Array.isArray(pontos)
  ) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO roteiros (usuario_id, cidade, pais, data_ida, data_volta, preferencias, pontos)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        usuarioId,
        cidade,
        pais,
        dataIda,
        dataVolta,
        preferencias,
        JSON.stringify(pontos),
      ]
    );

    res.status(201).json({ sucesso: true, roteiro: resultado.rows[0] });
  } catch (err) {
    console.error("Erro ao salvar roteiro:", err);
    res
      .status(500)
      .json({ sucesso: false, error: "Erro no servidor ao salvar roteiro" });
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
