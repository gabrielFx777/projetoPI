// Converte "07:00 AM" para minutos
function toMin(horaStr) {
  const [horaMin, periodo] = horaStr.split(" ");
  const [hora, min] = horaMin.split(":").map(Number);
  return ((hora % 12) + (periodo.toUpperCase() === "PM" ? 12 : 0)) * 60 + min;
}

// Verifica se horário em texto cobre um intervalo alvo (usado com weekday_text)
function contemIntervalo(horarioTexto, inicioAlvo, fimAlvo) {
  if (horarioTexto.includes("Open 24 hours")) {
    return true;
  }

  const intervalos = horarioTexto.split(",").map((i) => i.trim());

  for (const intervalo of intervalos) {
    const regex =
      /(\d{1,2}:\d{2})\s?(AM|PM)\s?[–-]\s?(\d{1,2}:\d{2})\s?(AM|PM)/i;
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

// Converte "0900" ou "1830" (string) em minutos
function timeStringToMin(str) {
  if (!str || str.length < 4) return null;
  const hora = parseInt(str.slice(0, 2));
  const min = parseInt(str.slice(2, 4));
  return hora * 60 + min;
}

// Verifica se o restaurante atende café, almoço, jantar baseado nos periods
function verificarHorariosRestaurante(periods) {
  const cafe = { inicio: 6 * 60, fim: 10 * 60 + 30 }; // 06:00 – 10:30
  const almoco = { inicio: 11 * 60, fim: 14 * 60 + 30 }; // 11:00 – 14:30
  const jantar = { inicio: 18 * 60, fim: 22 * 60 + 30 }; // 18:00 – 22:30

  let serve_cafe = false;
  let serve_almoco = false;
  let serve_jantar = false;

  for (const p of periods || []) {
    const openStr = p.open?.time;
    const closeStr = p.close?.time;

    if (!openStr || !closeStr) continue;

    const openMin = timeStringToMin(openStr);
    const closeMin = timeStringToMin(closeStr);

    if (openMin === null || closeMin === null) continue;

    if (openMin <= cafe.fim && closeMin >= cafe.inicio) serve_cafe = true;
    if (openMin <= almoco.fim && closeMin >= almoco.inicio) serve_almoco = true;
    if (openMin <= jantar.fim && closeMin >= jantar.inicio) serve_jantar = true;
  }

  return { serve_cafe, serve_almoco, serve_jantar };
}

module.exports = {
  toMin,
  contemIntervalo,
  verificarHorariosRestaurante,
};
