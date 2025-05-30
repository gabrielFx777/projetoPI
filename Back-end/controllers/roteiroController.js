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

  const prefereCafeDaManha = preferencias?.includes("breakfast");
  const restaurantesPorDia = prefereCafeDaManha ? 3 : 2;
  const extrasPorDia = 2;

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

    const pontosTuristicos = pontosLimitados.filter((p) => !isRestaurant(p));
    const restaurantesLimitados = pontosLimitados.filter(isRestaurant);

    for (let i = 0; i < pontosTuristicos.length; i++) {
      const p = pontosTuristicos[i];
      await client.query(
        `INSERT INTO roteiro_pontos
       (roteiro_id, ponto_id, ponto_nome, ponto_tipo, ponto_endereco,
        ponto_lat, ponto_lon, ponto_kinds, ponto_wikidata, ponto_coordenadas,
        ponto_rating, ponto_origem, ordem)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
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
          i, // 👈 salva a posição do ponto no roteiro
        ]
      );
    }

    const dias = Math.max(
      1,
      Math.ceil(
        (new Date(dataVolta).getTime() - new Date(dataIda).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );

    const { lat, lon } = pontosTuristicos[0]?.coordenadas || { lat: 0, lon: 0 };
    let encontrados = await buscarRestaurantes(
      lat,
      lon,
      null,
      dias * (restaurantesPorDia + extrasPorDia),
      3000,
      preferencias
    );

    // Forçar inclusão de padaria se necessário
    if (prefereCafeDaManha && !encontrados.some((r) => r.serve_cafe)) {
      const padariaBusca = await axios.get(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        {
          params: {
            location: `${lat},${lon}`,
            radius: 3000,
            keyword: "padaria",
            type: "restaurant",
            key: process.env.GOOGLE_PLACES_API_KEY,
          },
        }
      );

      const padaria = padariaBusca.data.results[0];
      if (padaria) {
        const horarios = await completarHorariosRestaurante(padaria.place_id);
        encontrados.unshift({
          id: padaria.place_id,
          nome: padaria.name,
          tipo: "restaurante",
          endereco: padaria.vicinity || "Endereço não disponível",
          coordenadas: {
            lat: padaria.geometry.location.lat,
            lon: padaria.geometry.location.lng,
          },
          rating: padaria.rating || null,
          origem: "google",
          serve_cafe: true,
          serve_almoco: horarios.serve_almoco,
          serve_jantar: horarios.serve_jantar,
        });
      }
    }

    // AGORA sim, depois de forçar padaria:
    const principais = encontrados.slice(0, dias * restaurantesPorDia);
    const extras = encontrados.slice(
      dias * restaurantesPorDia,
      dias * (restaurantesPorDia + extrasPorDia)
    );

    for (let i = 0; i < principais.length; i++) {
      const r = principais[i];
      await client.query(
        `INSERT INTO restaurantes
       (roteiro_id, nome, tipo, endereco, lat, lon, rating,
        coordenadas, origem, serve_cafe, serve_almoco, serve_jantar, ordem)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
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
          i, // <-- posição correta no roteiro
        ]
      );
    }

    for (const r of extras) {
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

    // Primeiro, filtra todos os pontosExtras que realmente não foram usados
    const pontosExtrasReais = pontosExtras.filter(
      (pe) => !pontosLimitados.some((pl) => pl.id === pe.id)
    );

    // Separa entre pontos turísticos e restaurantes
    const extrasNaoUsados = pontosExtrasReais.filter((pe) => !isRestaurant(pe));
    const restaurantesExtras = pontosExtrasReais.filter((pe) =>
      isRestaurant(pe)
    );

    // Insere pontos turísticos extras na tabela pontos_extras
    for (const ex of extrasNaoUsados) {
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

    // Insere restaurantes extras na tabela restaurantes_extras
    for (const r of restaurantesExtras) {
      await client.query(
        `INSERT INTO restaurantes_extras
       (roteiro_id, nome, tipo, endereco, lat, lon, rating,
        coordenadas, origem, serve_cafe, serve_almoco, serve_jantar)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          roteiroId,
          r.nome || null,
          Array.isArray(r.types) ? r.types.join(",") : r.tipo || null,
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
      "SELECT * FROM roteiro_pontos WHERE roteiro_id = $1 ORDER BY ordem ASC",
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
      "SELECT * FROM roteiro_pontos WHERE roteiro_id = $1 ORDER BY ordem ASC",
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
  const { roteiroId, pontoId } = req.params;
  const { newPontoExtraId } = req.body;

  if (!newPontoExtraId) {
    return res
      .status(400)
      .json({ error: "ID do novo ponto extra é obrigatório" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Busca o ponto original que será substituído
    const originalRes = await client.query(
      "SELECT * FROM roteiro_pontos WHERE id = $1 AND roteiro_id = $2",
      [pontoId, roteiroId]
    );
    if (originalRes.rows.length === 0) {
      return res.status(404).json({ error: "Ponto original não encontrado." });
    }
    const pontoOriginal = originalRes.rows[0];

    // Busca o novo ponto extra
    const extraRes = await client.query(
      "SELECT * FROM pontos_extras WHERE id = $1 AND roteiro_id = $2",
      [newPontoExtraId, roteiroId]
    );
    if (extraRes.rows.length === 0) {
      return res.status(404).json({ error: "Ponto extra não encontrado." });
    }
    const pontoExtra = extraRes.rows[0];

    // Atualiza roteiro_pontos com os dados do ponto extra
    await client.query(
      `UPDATE roteiro_pontos SET 
        ponto_id = $1,
        ponto_nome = $2,
        ponto_tipo = $3,
        ponto_endereco = $4,
        ponto_lat = $5,
        ponto_lon = $6,
        ponto_coordenadas = $7,
        ponto_origem = $8
       WHERE id = $9 AND roteiro_id = $10`,
      [
        pontoExtra.xid,
        pontoExtra.nome,
        pontoExtra.tipo,
        pontoExtra.endereco,
        pontoExtra.lat,
        pontoExtra.lon,
        JSON.stringify(pontoExtra.coordenadas),
        pontoExtra.origem,
        pontoId,
        roteiroId,
      ]
    );

    // Move o ponto original para a tabela pontos_extras
    await client.query(
      `INSERT INTO pontos_extras
        (roteiro_id, xid, nome, tipo, endereco, lat, lon, coordenadas, origem)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        roteiroId,
        pontoOriginal.ponto_id,
        pontoOriginal.ponto_nome,
        pontoOriginal.ponto_tipo,
        pontoOriginal.ponto_endereco,
        pontoOriginal.ponto_lat,
        pontoOriginal.ponto_lon,
        pontoOriginal.ponto_coordenadas,
        pontoOriginal.ponto_origem,
      ]
    );

    // Remove o ponto extra que foi usado
    await client.query(
      "DELETE FROM pontos_extras WHERE id = $1 AND roteiro_id = $2",
      [newPontoExtraId, roteiroId]
    );

    await client.query("COMMIT");

    res.status(200).json({ message: "Ponto substituído com sucesso." });
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

    const categoriasValidas = [
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

    const kindsSet = new Set();
    (preferencias || []).forEach((pref) => {
      const categoria = mapaCategorias[pref];
      if (!categoria) return;
      categoria.split(",").forEach((k) => {
        if (categoriasValidas.includes(k)) {
          kindsSet.add(k);
        }
      });
    });

    const categorias = Array.from(kindsSet);

    if (!categorias.length) {
      return res
        .status(400)
        .json({ error: "Nenhuma preferência válida enviada." });
    }

    // Buscar pontos
    let pontosBrutos = await buscarPontosTuristicos(
      lat,
      lon,
      categorias,
      1,
      10
    );

    if (!pontosBrutos || pontosBrutos.length === 0) {
      console.warn("Nenhum ponto com categorias. Tentando fallback...");
      const pontosFallback = await buscarPontosTuristicos(
        lat,
        lon,
        "interesting_places",
        1,
        10
      );

      if (!pontosFallback || pontosFallback.length === 0) {
        console.warn("Nem fallback retornou pontos.");
        return res.status(404).json({
          sucesso: false,
          error:
            "Nenhum ponto turístico encontrado mesmo com categorias genéricas.",
        });
      }

      pontosBrutos = pontosFallback;
    }

    if (!Array.isArray(pontosBrutos) || pontosBrutos.length === 0) {
      return res.status(404).json({
        sucesso: false,
        error: "Nenhum ponto turístico disponível para detalhar.",
      });
    }

    let pontosDetalhados = [];
    try {
      pontosDetalhados = await detalharPontos(pontosBrutos);
    } catch (e) {
      console.error("Erro ao detalhar pontos:", e);
      return res.status(500).json({
        sucesso: false,
        error: "Erro ao detalhar pontos turísticos.",
      });
    }

    const agruparPorCategoria = (pontos, categorias) => {
      const grupos = {};
      categorias.forEach((c) => (grupos[c] = []));
      pontos.forEach((p) => {
        for (const c of categorias) {
          if (p.tipo && p.tipo.includes(c)) {
            grupos[c].push(p);
            break;
          }
        }
      });
      return grupos;
    };

    const intercalarGrupos = (grupos, limiteTotal = 20) => {
      const resultado = [];
      let adicionados = true;
      while (resultado.length < limiteTotal && adicionados) {
        adicionados = false;
        for (const cat in grupos) {
          const item = grupos[cat].shift();
          if (item) {
            resultado.push(item);
            adicionados = true;
          }
          if (resultado.length >= limiteTotal) break;
        }
      }
      return resultado;
    };

    const grupos = agruparPorCategoria(pontosDetalhados, categorias);
    const intercalados = intercalarGrupos(grupos, 20);

    const pontosLimitados = intercalados.slice(0, 10);
    const pontosExtras = intercalados.slice(10, 20);

    const restaurantes = await buscarRestaurantes(lat, lon);

    return res.status(200).json({
      sucesso: true,
      pontosLimitados,
      pontosExtras,
      restaurantes,
    });
  } catch (error) {
    console.error("Erro final no buscarRoteiro:", error);
    return res.status(500).json({
      sucesso: false,
      error: "Erro ao buscar roteiro.",
    });
  }
}

async function moverPontoParaExtras(req, res) {
  const { pontoId, roteiroId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Buscar o ponto que será removido
    const pontoRes = await client.query(
      "SELECT * FROM roteiro_pontos WHERE id = $1 AND roteiro_id = $2",
      [pontoId, roteiroId]
    );

    if (pontoRes.rows.length === 0) {
      return res.status(404).json({ error: "Ponto não encontrado." });
    }

    const ponto = pontoRes.rows[0];

    // 2. Inserir esse ponto na tabela pontos_extras
    await client.query(
      `INSERT INTO pontos_extras
        (roteiro_id, xid, nome, tipo, endereco, lat, lon, coordenadas, origem)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        roteiroId,
        ponto.ponto_id,
        ponto.ponto_nome,
        ponto.ponto_tipo,
        ponto.ponto_endereco,
        ponto.ponto_lat,
        ponto.ponto_lon,
        ponto.ponto_coordenadas,
        ponto.ponto_origem || "opentripmap",
      ]
    );

    // 3. Excluir da tabela roteiro_pontos
    await client.query(
      "DELETE FROM roteiro_pontos WHERE id = $1 AND roteiro_id = $2",
      [pontoId, roteiroId]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Ponto movido para extras com sucesso." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao mover ponto:", error);
    res.status(500).json({ error: "Erro ao mover ponto para extras." });
  } finally {
    client.release();
  }
}

async function atualizarRestauranteDoRoteiro(req, res) {
  const { roteiroId, restauranteId } = req.params;
  const { novoRestauranteExtraId } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Buscar o restaurante extra que vai substituir
    const extraRes = await client.query(
      "SELECT * FROM restaurantes_extras WHERE id = $1 AND roteiro_id = $2",
      [novoRestauranteExtraId, roteiroId]
    );

    if (extraRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Restaurante extra não encontrado." });
    }

    const novo = extraRes.rows[0];

    // 2. Buscar o restaurante original que será substituído
    const originalRes = await client.query(
      "SELECT * FROM restaurantes WHERE id = $1 AND roteiro_id = $2",
      [restauranteId, roteiroId]
    );

    if (originalRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Restaurante original não encontrado." });
    }

    const original = originalRes.rows[0];

    // 3. Atualizar restaurante original com os dados do novo
    await client.query(
      `UPDATE restaurantes
       SET nome = $1,
           endereco = $2,
           rating = $3,
           serve_cafe = $4,
           serve_almoco = $5,
           serve_jantar = $6,
           lat = $7,
           lon = $8,
           ordem = $9
       WHERE id = $10 AND roteiro_id = $11`,
      [
        novo.nome,
        novo.endereco,
        novo.rating,
        novo.serve_cafe,
        novo.serve_almoco,
        novo.serve_jantar,
        novo.lat,
        novo.lon,
        original.ordem, // manter a ordem original
        restauranteId,
        roteiroId,
      ]
    );

    // 4. Inserir o restaurante original na tabela de extras
    await client.query(
      `INSERT INTO restaurantes_extras
       (roteiro_id, nome, tipo, endereco, lat, lon, rating,
        coordenadas, origem, serve_cafe, serve_almoco, serve_jantar)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        roteiroId,
        original.nome,
        original.tipo,
        original.endereco,
        original.lat,
        original.lon,
        original.rating,
        original.coordenadas,
        original.origem,
        original.serve_cafe,
        original.serve_almoco,
        original.serve_jantar,
      ]
    );

    // 5. Remover o restaurante novo da tabela de extras
    await client.query(
      "DELETE FROM restaurantes_extras WHERE id = $1 AND roteiro_id = $2",
      [novoRestauranteExtraId, roteiroId]
    );

    await client.query("COMMIT");
    return res
      .status(200)
      .json({ message: "Restaurante substituído com sucesso" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao substituir restaurante:", err);
    return res.status(500).json({ error: "Erro ao substituir restaurante" });
  } finally {
    client.release();
  }
}

async function listarRestaurantesExtras(req, res) {
  const { roteiro_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM restaurantes_extras WHERE roteiro_id = $1",
      [roteiro_id]
    );
    // ✅ Mesmo que não tenha nenhum, retorna array vazio com status 200
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar restaurantes extras:", error);
    res.status(500).json({ message: "Erro ao buscar restaurantes extras" });
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
  moverPontoParaExtras,
  atualizarRestauranteDoRoteiro,
  listarRestaurantesExtras,
};
