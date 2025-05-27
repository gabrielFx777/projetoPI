const axios = require("axios");
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const { verificarHorariosRestaurante } = require("../utils/horarioUtils");

// 👉 NOVA FUNÇÃO: obtém horários detalhados e define serve_cafe, almoco e jantar
async function completarHorariosRestaurante(placeId) {
  try {
    const resp = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "opening_hours",
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    const periods = resp.data.result?.opening_hours?.periods || [];
    return verificarHorariosRestaurante(periods);
  } catch (error) {
    console.warn("Erro ao obter detalhes do restaurante:", error.message);
    return {
      serve_cafe: false,
      serve_almoco: false,
      serve_jantar: false,
    };
  }
}

async function buscarRestaurantes(
  lat,
  lon,
  keyword = "restaurant",
  maxResults = 60,
  radius = 5000,
  preferencias = []
) {
  console.log("🍞 Preferências recebidas:", preferencias);
  const incluirCafe = preferencias.includes("breakfast");
  console.log("🍳 Incluir café da manhã?", incluirCafe);

  // 🔍 Nome indica padaria/café
  function nomeIndicaCafeDaManha(nome) {
    const termos = [
      "padaria",
      "pão",
      "café",
      "cafeteria",
      "bakery",
      "breakfast",
      "coffee",
      "panificadora",
    ];
    return termos.some((termo) => nome.toLowerCase().includes(termo));
  }

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

    const { data } = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      { params }
    );
    results.push(...data.results);

    pagetoken = data.next_page_token;

    if (pagetoken) {
      console.log("⏳ Esperando 3 segundos para próxima página...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  } while (pagetoken && results.length < maxResults);

  console.log("🍽️ Total de restaurantes encontrados:", results.length);

  const restaurantes = [];

  for (const place of results.slice(0, maxResults)) {
    const horarios = await completarHorariosRestaurante(place.place_id);
    const nome = place.name || "";
    const ehPadaria = nomeIndicaCafeDaManha(nome);

    restaurantes.push({
      id: place.place_id,
      nome,
      tipo: "restaurante",
      endereco: place.vicinity || "Endereço não disponível",
      coordenadas: {
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
      },
      rating: place.rating || null,
      origem: "google",
      serve_cafe: ehPadaria,
      serve_almoco: horarios.serve_almoco,
      serve_jantar: horarios.serve_jantar,
    });
  }

  // ✅ GARANTE que venha pelo menos uma padaria se "breakfast" for escolhido
  if (incluirCafe && !restaurantes.some((r) => r.serve_cafe)) {
    console.log(
      "⚠️ Nenhuma padaria detectada, buscando uma padaria manualmente..."
    );

    const padariaBusca = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lon}`,
          radius,
          keyword: "padaria",
          type: "restaurant",
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    const padaria = padariaBusca.data.results[0];
    if (padaria) {
      const horarios = await completarHorariosRestaurante(padaria.place_id);

      restaurantes.push({
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
        serve_cafe: true, // ✅ força como café da manhã
        serve_almoco: horarios.serve_almoco,
        serve_jantar: horarios.serve_jantar,
      });

      console.log("✅ Padaria adicionada forçadamente:", padaria.name);
    }
  }

  return restaurantes;
}

async function verificarHorariosRestauranteTexto(placeId) {
  try {
    const resp = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "opening_hours",
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    return resp.data.result?.opening_hours?.weekday_text || [];
  } catch (error) {
    console.warn("Erro ao verificar horários (texto):", error.message);
    return [];
  }
}

async function obterPlaceId(nome, endereco) {
  const query = `${nome}, ${endereco}`;
  try {
    const resp = await axios.get(
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
      {
        params: {
          input: query,
          inputtype: "textquery",
          fields: "place_id",
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    return resp.data.candidates?.[0]?.place_id || null;
  } catch (error) {
    console.warn("Erro ao obter place_id:", error.message);
    return null;
  }
}

module.exports = {
  buscarRestaurantes,
  verificarHorariosRestauranteTexto,
  obterPlaceId,
};
