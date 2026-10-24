// Tipp-Karte: zeigt den Rechenweg als animiertes Punktefeld (Malfeld).
// a · b = a Reihen mit je b Punkten, Fünfer-Lücke wie im Hunderterfeld (Kraft der Fünf).
// Jede Tipp-Art spielt ein kleines Drehbuch ab: Reihen poppen auf, Gruppen färben sich,
// Klammern beschriften die leichten Teilaufgaben, zuletzt erscheint die Rechnung.
import { tippStufen } from '../engine/tipps.js';
import { sound } from '../audio.js';

const P = 22;                         // Abstand der Punkte
const RAD = 8.5;
const LUECKE = 8;                     // Extra-Abstand der Fünfer-Lücke
const SLOT = 10 * P + LUECKE;         // Platz für ein 10 × 10-Feld
const ZEICHEN = 11.5;                   // ponytail: geschätzte Breite eines Zeichens der Beschriftung, reicht für den Bildausschnitt

const pos = (i, luecke) => i * P + (i >= luecke ? LUECKE : 0) + P / 2;
const ausdehnung = (n, luecke) => n * P + (n > luecke ? LUECKE : 0);

// Drehbuch: welche Reihe wann in welcher Farbe erscheint, welche Klammer wann was sagt.
function drehbuch({ art, anzahl: n, teile, marken, zahl: z }) {
  const reihen = [], klammern = [], schilder = [], striche = [];
  let luecke = 5, ende;
  if (art === 'reihe') {
    // 5 + 5 + 5: jede Reihe ist ein Summand, sie kommen nacheinander dazu
    for (let i = 0; i < n; i++) {
      reihen.push({ farbe: i % 2 ? 'a2' : 'a', d: 0.2 + 0.35 * i });
      schilder.push({ r: i, text: i ? `+ ${z}` : `${z}`, d: 0.2 + 0.35 * i });
    }
    ende = 0.4 + 0.35 * n;
  } else if (art === 'eins') {
    reihen.push({ farbe: 'a', d: 0.2 });
    klammern.push({ von: 0, bis: 0, text: marken[0], d: 0.6 });
    ende = 1;
  } else if (art === 'doppelt') {
    // Die zweite Reihe ist eine Kopie der ersten — sie rutscht aus ihr heraus
    reihen.push({ farbe: 'a', d: 0.2 }, { farbe: 'b', d: 0.9, kopie: true });
    schilder.push({ r: 0, text: marken[0], d: 0.4 }, { r: 1, text: marken[1], d: 1.4 });
    ende = 1.9;
  } else if (art === 'zehn') {
    for (let i = 0; i < n; i++) reihen.push({ farbe: 'a', d: 0.2 + 0.15 * i, stange: true });
    klammern.push({ von: 0, bis: n - 1, text: marken[0], d: 0.4 + 0.15 * n });
    ende = 0.8 + 0.15 * n;
  } else if (art === 'plus') {
    // 7 · 8: erst das ganze Feld, dann reißt es in 5 · 8 und 2 · 8 auseinander
    const [p] = teile;
    luecke = p;
    for (let i = 0; i < n; i++) {
      reihen.push(i < p ? { farbe: 'a', d: 0.05 * i } : { farbe: 'b', d: 0.05 * i, d2: 0.8, teilen: true });
    }
    klammern.push({ von: 0, bis: p - 1, text: marken[0], d: 1.3 }, { von: p, bis: n - 1, text: marken[1], d: 1.9 });
    ende = 2.5;
  } else {
    // minus (9 · 5) und haelfte (5 · 7): zum leichten 10er-Feld ergänzen, dann wegnehmen/halbieren
    luecke = n;
    for (let i = 0; i < 10; i++) {
      reihen.push(i < n ? { farbe: 'a', d: 0.05 * i } : { farbe: 'c', d: 0.8 + 0.1 * (i - n), d2: 2.3, weg: true });
    }
    if (art === 'minus') {
      klammern.push({ von: 0, bis: 9, textVon: 0, textBis: n - 1, text: marken[0], d: 1.5 });
      klammern.push({ von: n, bis: 9, text: marken[1], d: 2.7, ebene: 1, warn: true });
      for (let i = n; i < 10; i++) striche.push({ r: i, d: 2.3 });
    } else {
      klammern.push({ von: 0, bis: 9, text: marken[0], d: 1.5, aus: 2.7 });
      klammern.push({ von: 0, bis: 4, text: marken[1], d: 2.9 });
      striche.push({ schnitt: true, d: 2.0 });
    }
    ende = 3.3;
  }
  const zeilenZahl = art === 'minus' || art === 'haelfte' ? 10 : n;
  return { reihen, klammern, schilder, striche, luecke, ende, zeilenZahl };
}

function feldSvg(stufe) {
  const b = drehbuch(stufe);
  const spalten = stufe.zahl;
  const w = ausdehnung(spalten, 5);
  const ox = (SLOT - w) / 2;
  const oy = (SLOT - ausdehnung(b.zeilenZahl, b.luecke)) / 2;
  const y = r => oy + pos(r, b.luecke);
  const rechts = ox + w;

  const reihen = b.reihen.map((r, i) => {
    const kreise = Array.from({ length: spalten }, (_, c) =>
      `<circle cx="${ox + pos(c, 5)}" cy="${y(i)}" r="${RAD}"/>`).join('');
    const stange = r.stange ? `<rect class="stange" x="${ox - 3}" y="${y(i) - P / 2 + 1}" width="${w + 6}" height="${P - 2}" rx="10"/>` : '';
    const klassen = ['reihe', `f-${r.farbe}`, r.weg && 'weg', r.kopie && 'kopie', r.teilen && 'teilen'].filter(Boolean).join(' ');
    return `<g class="${klassen}" style="--d:${r.d}s;--d2:${r.d2 ?? 0}s">${stange}${kreise}</g>`;
  }).join('');

  const schilder = b.schilder.map(s =>
    `<text class="schild an" x="${rechts + 10}" y="${y(s.r) + 6}" style="--d:${s.d}s">${s.text}</text>`).join('');

  const striche = b.striche.map(s => s.schnitt
    ? `<line class="strich schnitt" x1="${ox - 12}" x2="${rechts + 12}" y1="${oy + 5 * P + LUECKE / 2}" y2="${oy + 5 * P + LUECKE / 2}" style="--d:${s.d}s"/>`
    : `<line class="strich" x1="${ox - 6}" x2="${rechts + 6}" y1="${y(s.r)}" y2="${y(s.r)}" style="--d:${s.d}s"/>`).join('');

  let rand = rechts + 14; // rechter Rand des Bildausschnitts, wächst mit der Beschriftung
  b.schilder.forEach(s => { rand = Math.max(rand, rechts + 10 + s.text.length * ZEICHEN); });
  const klammern = b.klammern.map(k => {
    const x = rechts + 8 + (k.ebene || 0) * 14;
    rand = Math.max(rand, x + 14 + k.text.length * ZEICHEN);
    const y1 = y(k.von) - P / 2 + 2, y2 = y(k.bis) + P / 2 - 2;
    const ty = (y(k.textVon ?? k.von) + y(k.textBis ?? k.bis)) / 2 + 6;
    const klassen = ['klammer', 'an', k.aus && 'aus', k.warn && 'warn'].filter(Boolean).join(' ');
    return `<g class="${klassen}" style="--d:${k.d}s;--d2:${k.aus ?? 0}s">
      <path d="M${x} ${y1} h6 V${y2} h-6"/><text x="${x + 14}" y="${ty}">${k.text}</text></g>`;
  }).join('');

  // Ausschnitt eng um Feld + Beschriftung → Punkte so groß wie möglich
  const x0 = ox - 14, y0 = oy - 4, hoehe = ausdehnung(b.zeilenZahl, b.luecke) + 8;
  return {
    svg: `<svg class="malfeld" viewBox="${x0} ${y0} ${rand - x0} ${hoehe}" role="img" aria-label="Punktefeld">${reihen}${striche}${klammern}${schilder}</svg>`,
    ende: b.ende,
  };
}

// Tauschaufgabe: das Feld der gestellten Aufgabe dreht sich um 90° — gleich viele Punkte.
function drehSvg({ a, b }) {
  const w = ausdehnung(b, 5), h = ausdehnung(a, 5);
  const ox = (SLOT - w) / 2, oy = (SLOT - h) / 2;
  let kreise = '';
  for (let r = 0; r < a; r++) for (let c = 0; c < b; c++) {
    kreise += `<circle cx="${ox + pos(c, 5)}" cy="${oy + pos(r, 5)}" r="${RAD}"/>`;
  }
  // verschachtelte translate-Gruppen: Drehpunkt = Feldmitte, ohne transform-box (läuft auch auf altem Safari)
  const seite = Math.max(w, h) + 8, x0 = (SLOT - seite) / 2;
  return `<svg class="malfeld" viewBox="${x0} ${x0} ${seite} ${seite}" role="img" aria-label="Punktefeld wird gedreht">
    <g transform="translate(${SLOT / 2} ${SLOT / 2})"><g class="dreh"><g class="f-a" transform="translate(${-SLOT / 2} ${-SLOT / 2})">${kreise}</g></g></g>
  </svg>`;
}

const zeileHtml = (text, d, rechnung) =>
  `<p class="${rechnung ? 'rechnung' : ''}" style="--d:${d}s">${text
    .replace(/= \?$/, '= <span class="frage">?</span>')
    .replace(/= (\d+)$/, '= <span class="loesung">$1</span>')}</p>`;

// mitLoesung: Erklärung nach einem Fehler (mit Ergebnis und „Weiter“-Knopf), sonst Tipp mit ✕.
export function zeigeTipp(el, aufgabe, { mitLoesung = false, onZu }) {
  const stufen = tippStufen(aufgabe, mitLoesung);
  let nr = 0;

  function zeige() {
    const s = stufen[nr];
    const mehr = nr < stufen.length - 1;
    el.innerHTML = `
      <div class="tipp-kopf">
        <span class="tipp-titel">${mitLoesung ? '🔧' : '💡'} ${s.titel}</span>
        ${mitLoesung ? '' : '<button type="button" class="tipp-zu" aria-label="Tipp schließen">✕</button>'}
      </div>
      <div class="tipp-bild"></div>
      <div class="tipp-zeilen" aria-live="polite"></div>
      <div class="tipp-knoepfe">
        ${mehr ? '<button type="button" class="btn klein tipp-mehr">Noch ein Tipp 💡</button>' : ''}
        ${mitLoesung ? '<button type="button" class="btn gross tipp-weiter">Weiter 👍</button>' : ''}
      </div>`;
    const bild = el.querySelector('.tipp-bild');
    const zeilen = el.querySelector('.tipp-zeilen');
    const rechnung = s.zeilen.at(-1);
    const vorne = s.zeilen.slice(0, -1);

    const male = () => {
      const { svg, ende } = feldSvg(s);
      bild.innerHTML = svg;
      // nach dem Drehen ist das Feld schon da → nicht noch einmal aufpoppen lassen
      if (s.tausch) bild.firstElementChild.classList.add('direkt');
      zeilen.innerHTML = vorne.map(t => zeileHtml(t, 0)).join('') + zeileHtml(rechnung, ende, true);
    };

    if (!s.tausch) { male(); return; }
    bild.innerHTML = drehSvg(s.von);
    zeilen.innerHTML = zeileHtml(vorne[0], 0) + zeileHtml('Dreh das Feld: Es bleiben gleich viele Punkte!', 0.3);
    let fertig = false;
    const weiter = () => {
      if (fertig || !bild.isConnected) return;
      fertig = true;
      male();
    };
    bild.querySelector('.dreh').addEventListener('animationend', weiter);
    setTimeout(weiter, 2600); // Rückfall, falls animationend ausbleibt
  }

  el.onclick = (e) => {
    if (e.target.closest('.tipp-zu, .tipp-weiter')) onZu();
    else if (e.target.closest('.tipp-mehr')) { nr++; sound.tipp(); zeige(); }
  };
  if (!mitLoesung) sound.tipp(); // nach einem Fehler kein Pling — das klänge wie Lob
  zeige();
}
