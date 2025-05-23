const axios = require("axios");
const pool = require("../config/db");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function obterClimaPorIntervalo(req, res) {
  const { cidade, estado, pais, dataIda, dataVolta, roteiro_id } = req.body;

  if (!dataIda || !dataVolta || !roteiro_id || (!cidade && !estado && !pais)) {
    return res
      .status(400)
      .json({ message: "Parâmetros obrigatórios ausentes." });
  }

  try {
    let queryLocal = "";
    if (cidade) queryLocal += cidade;
    if (estado) queryLocal += (queryLocal ? ", " : "") + estado;
    if (pais) queryLocal += (queryLocal ? ", " : "") + pais;

    const geoResp = await axios.get(NOMINATIM_URL, {
      params: { q: queryLocal, format: "json", limit: 1 },
    });

    if (!geoResp.data.length) {
      return res.status(404).json({ message: "Local não encontrado." });
    }

    const { lat, lon } = geoResp.data[0];
    const inicio = new Date(dataIda);
    const fim = new Date(dataVolta);
    const diffTime = Math.abs(fim - inicio);
    const diffDays = Math.min(
      10,
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    );

    const { buscarClimaPorCoordenadas } = require("../services/climaService");

    const forecastDays = await buscarClimaPorCoordenadas({
      lat,
      lon,
      dias: diffDays,
      lang: "pt",
    });

    const insercoes = forecastDays
      .filter((d) => new Date(d.date) >= inicio && new Date(d.date) <= fim)
      .map((d) =>
        pool
          .query(
            `INSERT INTO clima_diario (roteiro_id, data, temp_min, temp_max, descricao)
           VALUES ($1, $2, $3, $4, $5)`,
            [
              roteiro_id,
              d.date,
              d.day.mintemp_c,
              d.day.maxtemp_c,
              d.day.condition.text,
            ]
          )
          .then(() => ({
            data: d.date,
            tempMin: d.day.mintemp_c,
            tempMax: d.day.maxtemp_c,
            descricao: d.day.condition.text,
          }))
      );

    const resultados = await Promise.all(insercoes);
    res.json(resultados);
  } catch (error) {
    console.error("Erro no servidor:", error.response?.data || error.message);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

async function listarClimaPorRoteiro(req, res) {
  const { roteiro_id } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT * FROM clima_diario WHERE roteiro_id = $1 ORDER BY data`,
      [roteiro_id]
    );
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar clima:", error.message);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

module.exports = { obterClimaPorIntervalo, listarClimaPorRoteiro };
