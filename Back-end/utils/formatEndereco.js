function formatarEndereco(endereco) {
  if (!endereco || !Object.keys(endereco).length) return "Endereço indisponível";

  const {
    road = "",
    pedestrian = "",
    suburb = "",
    neighbourhood = "",
    city = "",
    state = "",
    country = "",
  } = endereco;

  return `${road || pedestrian}, ${suburb || neighbourhood}, ${city} - ${state}, ${country}`
    .replace(/^, |, ,| - ,| -$/, "")
    .trim();
}

module.exports = { formatarEndereco };
