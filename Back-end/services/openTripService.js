
// services/openTripService.js
const axios = require("axios");
const OTP_API_KEY = process.env.OTP_API_KEY;
const { formatarEndereco } = require("../utils/formatEndereco");

async function buscarPontosTuristicos(lat, lon, categorias, rate = 7, limitPorCategoria = 20) {
  const resultados = [];

  for (const categoria of categorias) {
    try {
      const resp = await axios.get("https://api.opentripmap.com/0.1/en/places/radius", {
        params: {
          radius: 20000,
          lon,
          lat,
          kinds: categoria,
          rate,
          sort: "rate", // ✅ correto aqui!
          format: "json",
          limit: limitPorCategoria,
          apikey: OTP_API_KEY,
        },
      });

      const filtrados = resp.data.filter(
        (p) => p.name && p.name.toLowerCase() !== "nome não disponível"
      );

      resultados.push(...filtrados);
    } catch (err) {
      console.warn(`Erro ao buscar pontos para kind "${categoria}":`, err.message);
    }
  }

  return resultados;
}

async function detalharPontos(pontos) {
  return await Promise.all(
    pontos.map(async (ponto) => {
      let enderecoFormatado = "Endereço indisponível";
      try {
        const det = await axios.get(
          `https://api.opentripmap.com/0.1/en/places/xid/${ponto.xid}`,
          { params: { apikey: OTP_API_KEY } }
        );
        enderecoFormatado = formatarEndereco(det.data.address || {});
      } catch {}
      return {
        id: ponto.xid,
        nome: ponto.name,
        tipo: ponto.kinds,
        endereco: enderecoFormatado,
        coordenadas: { lat: ponto.point.lat, lon: ponto.point.lon },
        rating: ponto.rate || null,
        kinds: ponto.kinds || null,
        wikidata: ponto.wikidata || null,
        origem: "opentripmap",
      };
    })
  );
}

module.exports = {
  buscarPontosTuristicos,
  detalharPontos,
};