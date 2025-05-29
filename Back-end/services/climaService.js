const axios = require("axios");

async function buscarClimaPorCoordenadas({ lat, lon, dias, lang = "pt" }) {
  try {
    const resp = await axios.get("https://api.weatherapi.com/v1/forecast.json", {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: `${lat},${lon}`,
        days: dias,
        lang,
      },
    });

    const forecast = resp.data.forecast.forecastday;

    // LOG para depuração — mostra os dias retornados pela API
    console.log("Dias retornados pela WeatherAPI:", forecast.map(d => d.date));

    return forecast;
  } catch (error) {
    console.error("Erro ao buscar clima na WeatherAPI:", error.message);
    throw error;
  }
}

module.exports = { buscarClimaPorCoordenadas };
