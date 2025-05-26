const axios = require("axios");
const pool = require("../config/db");

const {
  buscarRestaurantes,
  verificarHorariosRestaurante,
  obterPlaceId,
} = require("../services/googlePlacesService");

const {
  buscarPontosTuristicos,
  detalharPontos,
} = require("../services/openTripService");

const { formatarEndereco } = require("../utils/formatEndereco");

const { toMin, contemIntervalo } = require("../utils/horarioUtils");

async function criarRoteiro(req, res) {
  const {
    usuarioId,
    cidade,
    pais,
    dataIda,
    dataVolta,
    preferencias,
    pontosLimitados,
    pontosExtras,
    restaurantes = [],
  } = req.body;

  function isRestaurant(item) {
    const tipoStr = (item.tipo || "").toLowerCase();
    const kindsStr = (item.kinds || "").toLowerCase();
    const typesStr = Array.isArray(item.types)
      ? item.types.map((t) => t.toLowerCase()).join(",")
      : "";

    const turismoRelevante = [
      "cultural",
      "architecture",
      "historic",
      "museums",
      "interesting_places",
      "natural",
      "beaches",
    ];
    const tiposTuristicos = turismoRelevante.some((k) => kindsStr.includes(k));

    const keywords = ["restaurant", "food", "bar", "cafe"];
    const ehRestaurante = keywords.some(
      (key) =>
        tipoStr.includes(key) ||
        kindsStr.includes(key) ||
        typesStr.includes(key)
    );

    return ehRestaurante && !tiposTuristicos;
  }

  // validação básica
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

    // 1️⃣ INSERT no roteiros2
    const roteiroBase = await client.query(
      `INSERT INTO roteiros2
         (usuario_id, cidade, pais, data_ida, data_volta, preferencias, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING roteiro_id`,
      [
        usuarioId,
        cidade,
        pais,
        dataIda,
        dataVolta,
        JSON.stringify(preferencias),
        "planejada",
      ]
    );
    const roteiroId = roteiroBase.rows[0].roteiro_id;

    // 2️⃣ separa pontos turísticos e restaurantes em pontosLimitados
    const pontosTuristicos = pontosLimitados.filter((p) => !isRestaurant(p));
    const restaurantesLimitados = pontosLimitados.filter(isRestaurant);

    console.log(
      "→ pontosTuristicos:",
      pontosTuristicos.map((p) => p.nome)
    );
    console.log(
      "→ restaurantesLimitados:",
      restaurantesLimitados.map((r) => r.nome)
    );

    // 3️⃣ INSERT de pontos turísticos
    for (const p of pontosTuristicos) {
      await client.query(
        `INSERT INTO roteiro_pontos
           (roteiro_id, ponto_id, ponto_nome, ponto_tipo, ponto_endereco,
            ponto_lat, ponto_lon, ponto_kinds, ponto_wikidata, ponto_coordenadas,
            ponto_rating, ponto_origem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          roteiroId,
          p.id,
          p.nome,
          p.tipo,
          p.endereco,
          p.coordenadas?.lat || null,
          p.coordenadas?.lon || null,
          p.kinds || null,
          p.wikidata || null,
          JSON.stringify(p.coordenadas || null),
          p.rating || null,
          p.origem || (p.rating ? "google" : "opentripmap"),
        ]
      );
    }

    // 4️⃣ calcula quantidade de dias
    const dias = Math.max(
      1,
      Math.ceil(
        (new Date(dataVolta).getTime() - new Date(dataIda).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );

    // 5️⃣ busca restaurantes no Google Places (até dias*4)
    const { lat, lon } = pontosTuristicos[0]?.coordenadas || { lat: 0, lon: 0 };
    const encontrados = await buscarRestaurantes(
      lat,
      lon,
      null,
      dias * 4,
      3000
    );

    console.log("🔍 Exemplo de restaurante retornado:", encontrados[0]);

    // 6️⃣ divide principais (2 por dia) e extras (mais 2 por dia)
    const principais = encontrados.slice(0, dias * 2);
    const extras = encontrados.slice(dias * 2, dias * 4);

    // 7️⃣ INSERT de restaurantes principais
    for (const r of principais) {
      console.log("⬇️ Inserindo restaurante principal:", r.nome);
      await client.query(
        `INSERT INTO restaurantes
           (roteiro_id, nome, tipo, endereco, lat, lon, rating,
            coordenadas, origem, serve_cafe, serve_almoco, serve_jantar)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          roteiroId,
          r.nome || null,
          Array.isArray(r.types) ? r.types.join(",") : null,
          r.endereco || null,
          r.coordenadas?.lat || null,
          r.coordenadas?.lon || null,
          r.rating || null,
          JSON.stringify(r.coordenadas || null),
          r.origem || "google",
          r.serve_cafe || false,
          r.serve_almoco || false,
          r.serve_jantar || false,
        ]
      );
    }

    // 8️⃣ INSERT de restaurantes extras
    for (const r of extras) {
      console.log("⬇️ Inserindo restaurante extra:", r.nome);
      await client.query(
        `INSERT INTO restaurantes_extras
           (roteiro_id, nome, tipo, endereco, lat, lon, rating,
            coordenadas, origem, serve_cafe, serve_almoco, serve_jantar)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          roteiroId,
          r.nome || null,
          Array.isArray(r.types) ? r.types.join(",") : null,
          r.endereco || null,
          r.coordenadas?.lat || null,
          r.coordenadas?.lon || null,
          r.rating || null,
          JSON.stringify(r.coordenadas || null),
          r.origem || "google",
          r.serve_cafe || false,
          r.serve_almoco || false,
          r.serve_jantar || false,
        ]
      );
    }

    // 9️⃣ INSERT dos pontos_extras (não-restaurantes)
    const extrasNaoUsados = pontosExtras
      .filter((pe) => !pontosLimitados.some((pl) => pl.id === pe.id))
      .filter((item) => !isRestaurant(item));

    console.log("🎯 Total para pontos_extras:", extrasNaoUsados.length);
    for (const ex of extrasNaoUsados) {
      console.log("⬇️ Inserindo ponto extra:", ex.nome, "ID:", ex.id);
      await client.query(
        `INSERT INTO pontos_extras
           (roteiro_id, xid, nome, tipo, endereco, lat, lon,
            coordenadas, origem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          roteiroId,
          ex.id || null,
          ex.nome || null,
          ex.tipo || null,
          ex.endereco || null,
          ex.coordenadas?.lat || null,
          ex.coordenadas?.lon || null,
          JSON.stringify(ex.coordenadas || null),
          ex.origem || "opentripmap",
        ]
      );
    }

    // 🔟 COMMIT e resposta
    await client.query("COMMIT");
    res.status(201).json({
      sucesso: true,
      mensagem: "Roteiro, pontos e restaurantes salvos com sucesso",
      roteiroId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro na transação:", err);
    res.status(500).json({ sucesso: false, error: "Erro ao salvar roteiro" });
  } finally {
    client.release();
  }
}

async function listarRoteirosPorUsuario(req, res) {
  const { usuario_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM roteiros2 WHERE usuario_id = $1 ORDER BY criado_em DESC",
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar roteiros:", error);
    res.status(500).json({ message: "Erro ao buscar roteiros" });
  }
}

async function listarTodosRoteiros(req, res) {
  const { usuarioId } = req.query;
  try {
    const resultado = usuarioId
      ? await pool.query(
          "SELECT * FROM roteiros2 WHERE usuario_id = $1 ORDER BY data_ida ASC",
          [usuarioId]
        )
      : await pool.query("SELECT * FROM roteiros2 ORDER BY data_ida ASC");

    const roteiros2 = await Promise.all(
      resultado.rows.map(async (r) => {
        const pontosExtras = await pool.query(
          "SELECT * FROM pontos_extras WHERE roteiro_id = $1",
          [r.id]
        );
        return { ...r, pontosExtras: pontosExtras.rows };
      })
    );

    res.status(200).json({ sucesso: true, roteiros2 });
  } catch (err) {
    console.error("Erro ao buscar roteiros2:", err);
    res.status(500).json({ sucesso: false, error: "Erro ao buscar roteiros2" });
  }
}

async function buscarRoteiroPorId(req, res) {
  const { roteiro_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM roteiros2 WHERE roteiro_id = $1",
      [roteiro_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Roteiro não encontrado" });
    }

    const roteiro = result.rows[0];
    const pontos = await pool.query(
      "SELECT * FROM roteiro_pontos WHERE roteiro_id = $1",
      [roteiro_id]
    );

    res.json({ ...roteiro, pontos: pontos.rows });
  } catch (error) {
    console.error("Erro ao buscar roteiro:", error);
    res.status(500).json({ message: "Erro ao buscar roteiro" });
  }
}

async function atualizarRoteiro(req, res) {
  const { roteiro_id } = req.params;
  const { cidade, pais, data_ida, data_volta, preferencias, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE roteiros2 SET cidade = $1, pais = $2, data_ida = $3, data_volta = $4, preferencias = $5, status = $6
       WHERE roteiro_id = $7 RETURNING *`,
      [
        cidade,
        pais,
        data_ida,
        data_volta,
        preferencias ? JSON.stringify(preferencias) : null,
        status,
        roteiro_id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Roteiro não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar roteiro:", error);
    res.status(500).json({ message: "Erro ao atualizar roteiro" });
  }
}

async function deletarRoteiro(req, res) {
  const { roteiro_id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM roteiros2 WHERE roteiro_id = $1 RETURNING *",
      [roteiro_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Roteiro não encontrado" });
    }
    res.json({ message: "Roteiro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir roteiro:", error);
    res.status(500).json({ message: "Erro ao excluir roteiro" });
  }
}

async function adicionarPonto(req, res) {
  const { roteiro_id } = req.params;
  const ponto = req.body;

  try {
    const cols = [
      "roteiro_id",
      "ponto_id",
      "ponto_nome",
      "ponto_tipo",
      "ponto_endereco",
      "ponto_lat",
      "ponto_lon",
      "ponto_kinds",
      "ponto_wikidata",
      "ponto_coordenadas",
      "alternativa_id",
      "alternativa_nome",
      "alternativa_tipo",
      "alternativa_endereco",
      "alternativa_lat",
      "alternativa_lon",
      "alternativa_kinds",
      "alternativa_wikidata",
      "alternativa_coordenadas",
    ];

    const values = cols.map((col) => ponto[col] || null);
    values[0] = roteiro_id;

    const queryText = `INSERT INTO roteiro_pontos (${cols.join(
      ","
    )}) VALUES (${cols.map((_, i) => "$" + (i + 1)).join(",")}) RETURNING *`;
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar ponto:", error);
    res.status(500).json({ message: "Erro ao adicionar ponto" });
  }
}

async function listarPontosDoRoteiro(req, res) {
  const { roteiro_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM roteiro_pontos WHERE roteiro_id = $1",
      [roteiro_id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum ponto encontrado para este roteiro." });
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar pontos:", error);
    res.status(500).json({ message: "Erro ao buscar pontos do roteiro" });
  }
}

async function deletarPontoDoRoteiro(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM roteiro_pontos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ponto não encontrado" });
    }
    res.json({ message: "Ponto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir ponto:", error);
    res.status(500).json({ message: "Erro ao excluir ponto" });
  }
}

async function listarRestaurantesDoRoteiro(req, res) {
  const { roteiro_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM restaurantes WHERE roteiro_id = $1",
      [roteiro_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error);
    res.status(500).json({ message: "Erro ao buscar restaurantes" });
  }
}

async function buscarPontosExtras(req, res) {
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
}

async function substituirPonto(req, res) {
  const { roteiroId } = req.params;
  const { pontoExtraId, pontoOriginalId } = req.body;

  if (!pontoExtraId || !pontoOriginalId) {
    return res.status(400).json({ error: "IDs obrigatórios ausentes." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pontoExtraRes = await client.query(
      "SELECT * FROM pontos_extras WHERE id = $1 AND roteiro_id = $2",
      [pontoExtraId, roteiroId]
    );

    if (pontoExtraRes.rows.length === 0) {
      return res.status(404).json({ error: "Ponto extra não encontrado." });
    }

    const pontoExtra = pontoExtraRes.rows[0];

    const novoPonto = {
      ponto_id: pontoExtra.xid,
      ponto_nome: pontoExtra.nome,
      ponto_tipo: pontoExtra.tipo,
      ponto_endereco: pontoExtra.endereco,
      ponto_lat: pontoExtra.lat,
      ponto_lon: pontoExtra.lon,
      ponto_coordenadas: JSON.stringify(pontoExtra.coordenadas),
      ponto_origem: pontoExtra.origem,
    };

    await client.query(
      `UPDATE roteiro_pontos SET 
        ponto_id = $1, ponto_nome = $2, ponto_tipo = $3, ponto_endereco = $4, 
        ponto_lat = $5, ponto_lon = $6, ponto_coordenadas = $7, ponto_origem = $8
       WHERE id = $9`,
      [
        novoPonto.ponto_id,
        novoPonto.ponto_nome,
        novoPonto.ponto_tipo,
        novoPonto.ponto_endereco,
        novoPonto.ponto_lat,
        novoPonto.ponto_lon,
        novoPonto.ponto_coordenadas,
        novoPonto.ponto_origem,
        pontoOriginalId,
      ]
    );

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
}

async function buscarImagemCidade(req, res) {
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
}

async function buscarRoteiro(req, res) {
  try {
    const { cidade, pais, dataIda, dataVolta, preferencias } = req.body;

    if (!cidade || !pais || !dataIda || !dataVolta) {
      return res
        .status(400)
        .json({ error: "Parâmetros obrigatórios ausentes." });
    }

    // 1. Geocodifica a cidade com Nominatim
    const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: `${cidade}, ${pais}`,
        format: "json",
        limit: 1,
      },
    });

    if (!geo.data || geo.data.length === 0) {
      return res.status(404).json({ error: "Cidade não encontrada" });
    }

    const { lat, lon } = geo.data[0];

    // 2. Mapeia categorias de preferências para kinds da OpenTripMap
    const mapaCategorias = {
      aventura: "sport",
      cultural: "cultural",
      relaxamento: "natural",
      gastronomico: "foods",
      compras: "shops",
      romantico: "architecture",
      museus: "museums",
      parques: "parks",
      vidaNoturna: "adult,nightclubs",
      toursGuiados: "tourist_facilities",
      shows: "cultural,events",
      natureza: "natural",
      praias: "beaches",
      montanhas: "mountains",
      fast_food: "fast_food",
      gourmet: "gourmet",
      vegetariano: "vegetarian",
      vegano: "vegan",
      seafood: "seafood",
      "street food": "street_food",
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
    };

    const gastronomicos = [
      "fast_food",
      "gourmet",
      "vegetariano",
      "vegano",
      "seafood",
      "street food",
      "breakfast",
      "lunch",
      "dinner",
    ];

    const kindsSet = new Set();

    (preferencias || []).forEach((pref) => {
      const categoria = mapaCategorias[pref];
      if (!categoria) return;

      // Somente adiciona `categoria` se for aceito pela OpenTripMap
      const categoriasValidasOpenTripMap = [
        "sport",
        "cultural",
        "natural",
        "foods",
        "shops",
        "architecture",
        "museums",
        "parks",
        "adult",
        "nightclubs",
        "tourist_facilities",
        "events",
        "beaches",
        "mountains",
        "vegetarian",
        "vegan",
        "seafood",
        "street_food",
      ];

      categoria.split(",").forEach((k) => {
        if (categoriasValidasOpenTripMap.includes(k)) {
          kindsSet.add(k);
        }
      });
    });

    const kinds = Array.from(kindsSet).join(",");

    if (!kinds) {
      return res
        .status(400)
        .json({ error: "Nenhuma preferência válida enviada." });
    }

    // 3. Buscar pontos turísticos
    const pontosBrutos = await buscarPontosTuristicos(lat, lon, kinds);
    const pontosLimitados = await detalharPontos(pontosBrutos.slice(0, 10));
    const pontosExtras = await detalharPontos(pontosBrutos.slice(10, 20));

    // 4. Buscar restaurantes via Google Places (baseado na cidade)
    const restaurantes = await buscarRestaurantes(lat, lon);

    // 5. Retornar tudo
    res.status(200).json({
      sucesso: true,
      pontosLimitados,
      pontosExtras,
      restaurantes,
    });
  } catch (error) {
    console.error("Erro ao buscar roteiro:", error.message);
    res.status(500).json({ error: "Erro ao buscar roteiro" });
  }
}

module.exports = {
  criarRoteiro,
  listarRoteirosPorUsuario,
  listarTodosRoteiros,
  buscarRoteiroPorId,
  atualizarRoteiro,
  deletarRoteiro,
  adicionarPonto,
  listarPontosDoRoteiro,
  deletarPontoDoRoteiro,
  listarRestaurantesDoRoteiro,
  buscarPontosExtras,
  substituirPonto,
  buscarImagemCidade,
  buscarRoteiroESeusPontos: listarPontosDoRoteiro,
  buscarRoteirosComExtras: listarTodosRoteiros,
  buscarRoteiro,
};
