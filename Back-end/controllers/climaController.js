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

    const geoResp = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        queryLocal
      )}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          limit: 1,
        },
      }
    );

    if (!geoResp.data.features || geoResp.data.features.length === 0) {
      return res.status(404).json({ message: "Local não encontrado." });
    }

    const [lon, lat] = geoResp.data.features[0].center;

    const hoje = new Date(); // Data atual no servidor
    const dataVoltaDate = new Date(dataVolta);
    const diffTime = Math.abs(dataVoltaDate - hoje);
    const diffDays = Math.min(
      3, // <= limite da API gratuita
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    );

    console.log("Dias solicitados à API:", diffDays);

    const { buscarClimaPorCoordenadas } = require("../services/climaService");

    const forecastDays = await buscarClimaPorCoordenadas({
      lat,
      lon,
      dias: diffDays,
      lang: "pt",
    });

    const insercoes = forecastDays
      .filter((d) => {
        const dia = d.date;
        return dia >= dataIda && dia <= dataVolta;
      })
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
