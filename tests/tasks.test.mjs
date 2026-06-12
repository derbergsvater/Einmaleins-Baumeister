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

import { pickTask, gewicht, totalRichtig, ANKER_PHASE_BIS } from '../js/engine/tasks.js';

// Deterministischer Pseudo-Zufall für Tests (LCG)
function lcg(seed = 42) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

test('Anker-Phase: ohne Erfahrung kommen nur Anker-Aufgaben', () => {
  const rng = lcg(1);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 4, stats: {}, lastKey: null, wrongStreak: 0 }, rng);
    assert.ok(istAnker(t, 4), `Nicht-Anker in Anker-Phase: ${taskKey(t)}`);
  }
});

test('nach der Anker-Phase kommen auch schwere Aufgaben', () => {
  const stats = { '4x1': { richtig: 3, falsch: 0 }, '4x2': { richtig: 3, falsch: 0 } };
  assert.ok(totalRichtig(stats, 4) >= ANKER_PHASE_BIS);
  const rng = lcg(7);
  const gesehen = new Set();
  for (let i = 0; i < 200; i++) {
    gesehen.add(taskKey(pickTask({ reihe: 4, stats, lastKey: null, wrongStreak: 0 }, rng)));
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
    const k = taskKey(pickTask({ reihe: 4, stats, lastKey: null, wrongStreak: 0 }, rng));
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
    const k = taskKey(pickTask({ reihe: 4, stats, lastKey: null, wrongStreak: 3 }, rng));
    assert.ok(['4x3', '4x6'].includes(k), `unsichere Aufgabe trotz Frust-Bremse: ${k}`);
  }
});

test('keine direkte Wiederholung derselben Aufgabe', () => {
  const stats = { '4x1': { richtig: 10, falsch: 0 } };
  const rng = lcg(13);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 4, stats, lastKey: '4x5', wrongStreak: 0 }, rng);
    assert.notEqual(taskKey(t), '4x5');
  }
});
