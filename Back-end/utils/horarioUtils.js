function toMin(horaStr) {
  const [horaMin, periodo] = horaStr.split(" ");
  const [hora, min] = horaMin.split(":").map(Number);
  return ((hora % 12) + (periodo.toUpperCase() === "PM" ? 12 : 0)) * 60 + min;
}

function contemIntervalo(horarioTexto, inicioAlvo, fimAlvo) {
  if (horarioTexto.includes("Open 24 hours")) {
    return true;
  }

  const intervalos = horarioTexto.split(",").map((i) => i.trim());

  for (const intervalo of intervalos) {
    const regex = /(\d{1,2}:\d{2})\s?(AM|PM)\s?[–-]\s?(\d{1,2}:\d{2})\s?(AM|PM)/i;
    const match = intervalo.match(regex);
    if (!match) continue;

    const horaInicio = `${match[1]} ${match[2]}`;
    const horaFim = `${match[3]} ${match[4]}`;

    const inicio = toMin(horaInicio);
    const fim = toMin(horaFim);

    if (fim >= inicioAlvo && inicio <= fimAlvo) return true;
  }

  return false;
}

module.exports = { toMin, contemIntervalo };
