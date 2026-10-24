import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPool, taskKey, loesung, istAnker } from '../js/engine/tasks.js';

test('buildPool liefert 19 eindeutige Aufgaben inkl. Tauschaufgaben', () => {
  const pool = buildPool(4);
  assert.equal(pool.length, 19);
  assert.equal(new Set(pool.map(taskKey)).size, 19);
  assert.ok(pool.some(t => t.a === 4 && t.b === 7), '4·7 fehlt');
  assert.ok(pool.some(t => t.a === 7 && t.b === 4), 'Tauschaufgabe 7·4 fehlt');
  assert.ok(pool.every(t => t.a === 4 || t.b === 4), 'Aufgabe ohne Bezug zur Reihe');
});

test('taskKey und loesung', () => {
  assert.equal(taskKey({ a: 4, b: 7 }), '4x7');
  assert.equal(taskKey({ a: 7, b: 4 }), '7x4');
  assert.equal(loesung({ a: 7, b: 8 }), 56);
});

test('istAnker erkennt 1, 2, 5, 10 als leichten Partner-Faktor', () => {
  assert.ok(istAnker({ a: 4, b: 5 }, 4));
  assert.ok(istAnker({ a: 10, b: 4 }, 4));
  assert.ok(!istAnker({ a: 4, b: 7 }, 4));
  assert.ok(!istAnker({ a: 7, b: 4 }, 4));
});

import { pickTask, gewicht, totalRichtig, ANKER_PHASE_BIS, normKey } from '../js/engine/tasks.js';

// Deterministischer Pseudo-Zufall für Tests (LCG)
function lcg(seed = 42) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

test('Anker-Phase: ohne Erfahrung kommen nur Anker-Aufgaben', () => {
  const rng = lcg(1);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 4, stats: {}, letzte: [], wrongStreak: 0 }, rng);
    assert.ok(istAnker(t, 4), `Nicht-Anker in Anker-Phase: ${taskKey(t)}`);
  }
});

test('nach der Anker-Phase kommen auch schwere Aufgaben', () => {
  const stats = { '4x1': { richtig: 3, falsch: 0 }, '4x2': { richtig: 3, falsch: 0 } };
  assert.ok(totalRichtig(stats, 4) >= ANKER_PHASE_BIS);
  const rng = lcg(7);
  const gesehen = new Set();
  for (let i = 0; i < 200; i++) {
    gesehen.add(taskKey(pickTask({ reihe: 4, stats, letzte: [], wrongStreak: 0 }, rng)));
  }
  assert.ok([...gesehen].some(k => k.includes('7') || k.includes('8')), 'nur leichte Aufgaben');
});

test('gewicht: oft falsche Aufgaben wiegen mehr, sitzende weniger', () => {
  assert.ok(gewicht({ richtig: 0, falsch: 3 }) > gewicht({ richtig: 0, falsch: 0 }));
  assert.ok(gewicht({ richtig: 5, falsch: 0 }) < gewicht({ richtig: 0, falsch: 0 }));
});

test('schwache Aufgaben kommen statistisch häufiger', () => {
  const stats = { '4x1': { richtig: 4, falsch: 0 }, '4x2': { richtig: 4, falsch: 0 } };
  for (let n = 1; n <= 10; n++) stats[`4x${n}`] = stats[`4x${n}`] || { richtig: 1, falsch: 0 };
  stats['4x7'] = { richtig: 0, falsch: 5 };
  const rng = lcg(99);
  let schwach = 0, sicher = 0;
  for (let i = 0; i < 600; i++) {
    const k = taskKey(pickTask({ reihe: 4, stats, letzte: [], wrongStreak: 0 }, rng));
    if (k === '4x7') schwach++;
    if (k === '4x1') sicher++;
  }
  assert.ok(schwach > sicher * 2, `4x7=${schwach} sollte deutlich öfter kommen als 4x1=${sicher}`);
});

test('Frust-Bremse: nach 3 Fehlern kommen sichere Aufgaben', () => {
  const stats = {
    '4x3': { richtig: 4, falsch: 0 },
    '4x6': { richtig: 3, falsch: 0 },
    '4x7': { richtig: 0, falsch: 4 },
    '4x8': { richtig: 0, falsch: 3 },
  };
  const rng = lcg(5);
  for (let i = 0; i < 50; i++) {
    const k = taskKey(pickTask({ reihe: 4, stats, letzte: [], wrongStreak: 3 }, rng));
    assert.ok(['4x3', '4x6'].includes(k), `unsichere Aufgabe trotz Frust-Bremse: ${k}`);
  }
});

test('vermeidet zuletzt gestellte Aufgaben (auch Tauschaufgaben 5·1 = 1·5)', () => {
  const stats = { '4x1': { richtig: 10, falsch: 0 } };
  const rng = lcg(13);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 4, stats, letzte: ['1x4'], wrongStreak: 0 }, rng);
    assert.notEqual(normKey(t), '1x4', `4·1/1·4 trotz Tabu: ${taskKey(t)}`);
  }
});

test('keine Wiederholung innerhalb der letzten 3 Aufgaben (laufende Auswahl)', () => {
  const rng = lcg(123);
  // Reihe ohne Anker-Phasen-Einschränkung, damit der Pool groß genug ist
  const stats = {};
  for (let n = 1; n <= 10; n++) stats[`4x${n}`] = { richtig: 1, falsch: 0 };
  let letzte = [];
  const verlauf = [];
  for (let i = 0; i < 60; i++) {
    const t = pickTask({ reihe: 4, stats, letzte, wrongStreak: 0 }, rng);
    const k = normKey(t);
    assert.ok(!letzte.includes(k), `Wiederholung in Fenster: ${k} nach [${letzte}]`);
    verlauf.push(k);
    letzte = [k, ...letzte].slice(0, 3);
  }
  assert.ok(new Set(verlauf).size >= 6, 'zu wenig Abwechslung insgesamt');
});

test('gewicht: alte Fehler werden durch spätere richtige Antworten abgebaut', () => {
  assert.equal(gewicht({ richtig: 0, falsch: 5 }), 11);
  assert.ok(gewicht({ richtig: 6, falsch: 5 }) < gewicht({ richtig: 0, falsch: 5 }));
  assert.equal(gewicht({ richtig: 40, falsch: 5 }), 0.5);
});

test('Anker-Phase hängt am Trainingsstand der Reihe, nicht an Tauschaufgaben anderer Reihen', () => {
  // 2·7 und 7·2 je 3x richtig (aus der 2er-Reihe) → ohne training würde die 7er-Reihe die Aufwärmphase überspringen
  const stats = { '2x7': { richtig: 3, falsch: 0 }, '7x2': { richtig: 3, falsch: 0 } };
  const rng = lcg(7);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 7, stats, training: 0 }, rng);
    assert.ok([1, 2, 5, 10].includes(t.a === 7 ? t.b : t.a), `keine Ankeraufgabe: ${t.a}·${t.b}`);
  }
});
