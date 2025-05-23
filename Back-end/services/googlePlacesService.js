const axios = require("axios");
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function buscarRestaurantes(lat, lon, keyword = "restaurante", maxResults = 60, radius = 3000) {
  let results = [];
  let pagetoken = null;
  const paramsBase = {
    location: `${lat},${lon}`,
    radius,
    type: "restaurant",
    keyword,
    key: GOOGLE_PLACES_API_KEY,
  };

  do {
    const params = { ...paramsBase };
    if (pagetoken) params.pagetoken = pagetoken;

    const { data } = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });
    results.push(...data.results);

    pagetoken = data.next_page_token;
    if (pagetoken) await new Promise((r) => setTimeout(r, 2000));
  } while (pagetoken && results.length < maxResults);

  return results.slice(0, maxResults).map((place) => ({
    id: place.place_id,
    nome: place.name,
    tipo: "restaurante",
    endereco: place.vicinity || "Endereço não disponível",
    coordenadas: {
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
    },
    rating: place.rating || null,
    origem: "google",
  }));
}

async function verificarHorariosRestaurante(placeId) {
  try {
    const resp = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "opening_hours,name",
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    return resp.data.result?.opening_hours?.weekday_text || [];
  } catch (error) {
    console.warn("Erro ao verificar horários:", error.message);
    return [];
  }
}

async function obterPlaceId(nome, endereco) {
  const query = `${nome}, ${endereco}`;
  try {
    const resp = await axios.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json", {
      params: {
        input: query,
        inputtype: "textquery",
        fields: "place_id",
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    return resp.data.candidates?.[0]?.place_id || null;
  } catch (error) {
    console.warn("Erro ao obter place_id:", error.message);
    return null;
  }
}

module.exports = {
  buscarRestaurantes,
  verificarHorariosRestaurante,
  obterPlaceId,
};
