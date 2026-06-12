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
