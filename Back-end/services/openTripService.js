const axios = require("axios");
const OTP_API_KEY = process.env.OTP_API_KEY;
const { formatarEndereco } = require("../utils/formatEndereco");

async function buscarPontosTuristicos(lat, lon, kinds, rate = 3, limit = 50) {
  try {
    const resp = await axios.get("https://api.opentripmap.com/0.1/en/places/radius", {
      params: {
        radius: 10000,
        lon,
        lat,
        kinds,
        rate,
        format: "json",
        limit,
        apikey: OTP_API_KEY,
      },
    });

    return resp.data.filter((p) => p.name && p.name.toLowerCase() !== "nome não disponível");
  } catch (err) {
    console.warn(`Erro ao buscar pontos para kind "${kinds}":`, err.message);
    return [];
  }
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
      };
    })
  );
}

module.exports = {
  buscarPontosTuristicos,
  detalharPontos,
};
