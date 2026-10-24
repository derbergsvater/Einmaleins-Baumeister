// Rechen-Tipps: pure functions, kein DOM. a · b heißt „a-mal die b“ (3 · 5 = 5 + 5 + 5).
// Stufe 1 denkt die Aufgabe als Plus-Aufgabe, Stufe 2 zerlegt sie in leichte Kernaufgaben
// (·1, ·2, ·5, ·10) — wenn es leichter wird, nach dem Tauschen der Faktoren.
// Ohne mitLoesung steht das Ergebnis nie im Tipp (Test prüft das für alle 100 Aufgaben).

const mal = (n, z) => `${n} · ${z}`;

// Zerlegung der Anzahl in Kernaufgaben: 3 = 2 + 1, 7 = 5 + 2 …
const ZERLEGUNG = { 3: [2, 1], 4: [2, 2], 6: [5, 1], 7: [5, 2] };

function trickFuer(anzahl, zahl, tausch) {
  const k = { anzahl, zahl, tausch };
  if (anzahl === 1) return { ...k, art: 'eins', teile: [1] };
  if (zahl === 10) return { ...k, art: 'zehn', teile: [anzahl] };
  if (anzahl === 2) return { ...k, art: 'doppelt', teile: [1, 1] };
  if (anzahl === 5) return { ...k, art: 'haelfte', teile: [10] };
  if (anzahl >= 8) return { ...k, art: 'minus', teile: [10, 10 - anzahl] };
  return { ...k, art: 'plus', teile: ZERLEGUNG[anzahl] };
}

// Wie schwer ist der letzte Rechenschritt? Übertrag/Borgen und zweistellige Zahlen zählen extra.
function schwere({ art, zahl, teile }) {
  if (art === 'haelfte') return zahl % 2 ? 2 : 1; // 80 halbieren ist leichter als 70
  const [p, q] = teile.map(n => n * zahl);
  const uebertrag = art === 'plus' ? (p % 10) + (q % 10) >= 10 : (p % 10) < (q % 10);
  return 1 + (uebertrag ? 1 : 0) + (q >= 10 ? 0.5 : 0);
}

export function waehleTrick({ a, b }) {
  const gerade = trickFuer(a, b, false);
  const getauscht = trickFuer(b, a, true);
  // ·1, ·10 und ·2 machen jede Aufgabe sofort leicht — die gewinnen immer
  for (const art of ['eins', 'zehn', 'doppelt']) {
    if (gerade.art === art) return gerade;
    if (getauscht.art === art) return getauscht;
  }
  return schwere(getauscht) < schwere(gerade) ? getauscht : gerade;
}

// Liefert die Tipp-Stufen einer Aufgabe. Jede Stufe: { art, anzahl, zahl, teile, tausch, von,
// titel, marken (Beschriftung der Punkt-Gruppen), zeilen (Text unter dem Bild) }.
export function tippStufen(t, mitLoesung = false) {
  const ergebnis = t.a * t.b;
  const ende = mitLoesung ? `= ${ergebnis}` : '= ?';
  const k = waehleTrick(t);
  const { anzahl: n, zahl: z } = k;
  const von = { a: t.a, b: t.b };
  const zeilen = k.tausch ? [`Tauschaufgabe: ${mal(t.a, t.b)} = ${mal(n, z)}`] : [];
  let titel, marken;

  if (k.art === 'eins') {
    titel = 'Mal 1 ist leicht';
    marken = ['1-mal'];
    zeilen.push(mitLoesung ? `${mal(t.a, t.b)} = ${ergebnis}` : 'Die Zahl bleibt, wie sie ist!');
  } else if (k.art === 'zehn') {
    titel = 'Zehnerstangen';
    marken = [`${n} Zehner`];
    // ponytail: höchstens 3 Zählschritte und immer einer weniger als nötig → das Ergebnis fällt nie
    const schritte = [10, 20, 30].slice(0, Math.min(3, n - 1)).join(', ');
    zeilen.push(mitLoesung ? `${n} Zehner = ${ergebnis}` : `Zähl in Zehnerschritten: ${schritte} …`);
  } else if (k.art === 'doppelt') {
    titel = 'Verdoppeln';
    marken = [`${z}`, `+ ${z}`];
    zeilen.push(`${z} + ${z} ${ende}`);
  } else if (k.art === 'haelfte') {
    const T = 10 * z;
    titel = '5 ist die Hälfte von 10';
    marken = [`${mal(10, z)} = ${T}`, 'die Hälfte'];
    zeilen.push(`Hälfte von ${T} ${ende}`);
  } else {
    const [p, q] = k.teile;
    const P = p * z, Q = q * z;
    if (k.art === 'plus') {
      titel = `Zerlegen: ${n} = ${p} + ${q}`;
      marken = [`${mal(p, z)} = ${P}`, `${mal(q, z)} = ${Q}`];
      zeilen.push(`${P} + ${Q} ${ende}`);
    } else {
      titel = `Von der 10 aus: ${n} = 10 − ${q}`;
      marken = [`${mal(10, z)} = ${P}`, `− ${mal(q, z)} = ${Q}`];
      zeilen.push(`${P} − ${Q} ${ende}`);
    }
  }
  const trick = { ...k, von, titel, marken, zeilen };

  const plus = {
    art: 'reihe', anzahl: t.a, zahl: t.b, teile: [t.a], tausch: false, von,
    titel: `Plus-Aufgabe: ${t.a}-mal die ${t.b}`,
    marken: [],
    zeilen: [`${Array(t.a).fill(t.b).join(' + ')} ${ende}`],
  };

  // Nach einem Fehler: nur der Rechenweg mit Lösung. Sonst erst Plus, dann Trick —
  // außer der Trick ist nichts anderes als die Plus-Aufgabe (1 · 7, 2 · 7).
  if (mitLoesung) return [trick];
  const gleich = !k.tausch && (k.art === 'eins' || k.art === 'doppelt');
  return gleich ? [trick] : [plus, trick];
}
