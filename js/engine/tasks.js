// Aufgaben-Engine: pure functions, kein DOM. Eine Aufgabe ist { a, b }.
export const ANKER = [1, 2, 5, 10];

export function taskKey(t) {
  return `${t.a}x${t.b}`;
}

export function loesung(t) {
  return t.a * t.b;
}

// Pool einer Reihe: reihe·1..10 plus Tauschaufgaben n·reihe (n ≠ reihe) → 19 Aufgaben
export function buildPool(reihe) {
  const pool = [];
  for (let n = 1; n <= 10; n++) {
    pool.push({ a: reihe, b: n });
    if (n !== reihe) pool.push({ a: n, b: reihe });
  }
  return pool;
}

// Der "Partner-Faktor" ist der Faktor, der nicht die Reihe ist (bei reihe·reihe: die Reihe selbst)
function partnerFaktor(t, reihe) {
  return t.a === reihe ? t.b : t.a;
}

export function istAnker(t, reihe) {
  return ANKER.includes(partnerFaktor(t, reihe));
}

// Solange das Kind weniger als 6 richtige Antworten in der Reihe hat → nur Anker-Aufgaben
export const ANKER_PHASE_BIS = 6;

function stat(stats, t) {
  return stats[taskKey(t)] || { richtig: 0, falsch: 0 };
}

export function totalRichtig(stats, reihe) {
  return buildPool(reihe).reduce((summe, t) => summe + stat(stats, t).richtig, 0);
}

// Gewichtung: falsche Aufgaben drängeln sich vor, sitzende treten zurück
export function gewicht(s) {
  if (s.richtig >= 3 && s.falsch === 0) return 0.5;
  return 1 + 2 * s.falsch;
}

export function pickTask({ reihe, stats = {}, lastKey = null, wrongStreak = 0 }, rng = Math.random) {
  const pool = buildPool(reihe);
  let kandidaten = pool;

  if (totalRichtig(stats, reihe) < ANKER_PHASE_BIS) {
    kandidaten = pool.filter(t => istAnker(t, reihe));
  }

  if (wrongStreak >= 3) {
    const sichere = pool.filter(t => {
      const s = stat(stats, t);
      return s.richtig >= 2 && s.falsch === 0;
    });
    kandidaten = sichere.length ? sichere : pool.filter(t => istAnker(t, reihe));
  }

  const ohneWiederholung = kandidaten.filter(t => taskKey(t) !== lastKey);
  if (ohneWiederholung.length) kandidaten = ohneWiederholung;

  const gewichte = kandidaten.map(t => gewicht(stat(stats, t)));
  const summe = gewichte.reduce((a, b) => a + b, 0);
  let r = rng() * summe;
  for (let i = 0; i < kandidaten.length; i++) {
    r -= gewichte[i];
    if (r <= 0) return kandidaten[i];
  }
  return kandidaten[kandidaten.length - 1];
}
