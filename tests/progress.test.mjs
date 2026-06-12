import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comboStufe, applyAnswer, pruefungBereit, TRAINING_ZIEL } from '../js/engine/progress.js';

test('comboStufe: x1 bis 2er-Serie, x2 ab 3, x3 ab 6', () => {
  assert.equal(comboStufe(0), 1);
  assert.equal(comboStufe(2), 1);
  assert.equal(comboStufe(3), 2);
  assert.equal(comboStufe(5), 2);
  assert.equal(comboStufe(6), 3);
  assert.equal(comboStufe(20), 3);
});

test('applyAnswer richtig: Streak wächst, Punkte = Combo-Stufe', () => {
  let s = { training: 0, streak: 0 };
  s = applyAnswer(s, true);
  assert.deepEqual(s, { training: 1, streak: 1, punkte: 1 });
  s = applyAnswer(s, true);
  s = applyAnswer(s, true); // 3. richtige → Stufe x2
  assert.equal(s.streak, 3);
  assert.equal(s.punkte, 2);
  assert.equal(s.training, 4); // 1 + 1 + 2
});

test('applyAnswer falsch: Streak weg, Training bleibt', () => {
  const s = applyAnswer({ training: 7, streak: 4 }, false);
  assert.deepEqual(s, { training: 7, streak: 0, punkte: 0 });
});

test('Training ist bei TRAINING_ZIEL gedeckelt', () => {
  const s = applyAnswer({ training: TRAINING_ZIEL - 1, streak: 10 }, true);
  assert.equal(s.training, TRAINING_ZIEL);
});

test('pruefungBereit erst bei vollem Balken', () => {
  assert.ok(!pruefungBereit(TRAINING_ZIEL - 1));
  assert.ok(pruefungBereit(TRAINING_ZIEL));
});

import { createExam, evalExam, PRUEFUNG_AUFGABEN } from '../js/engine/progress.js';
import { taskKey } from '../js/engine/tasks.js';

function lcg(seed = 42) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

test('createExam: 12 eindeutige Aufgaben aus der Reihe', () => {
  const exam = createExam(7, lcg(3));
  assert.equal(exam.length, PRUEFUNG_AUFGABEN);
  assert.equal(new Set(exam.map(taskKey)).size, PRUEFUNG_AUFGABEN);
  assert.ok(exam.every(t => t.a === 7 || t.b === 7));
});

test('createExam mischt (zwei Seeds, verschiedene Reihenfolge)', () => {
  const a = createExam(7, lcg(1)).map(taskKey).join(',');
  const b = createExam(7, lcg(2)).map(taskKey).join(',');
  assert.notEqual(a, b);
});

test('evalExam: 0 oder 1 Fehler bestanden, 2 Fehler nicht', () => {
  const alleRichtig = Array(PRUEFUNG_AUFGABEN).fill(true);
  assert.deepEqual(evalExam(alleRichtig), { fehler: 0, bestanden: true });

  const einFehler = [...alleRichtig];
  einFehler[4] = false;
  assert.deepEqual(evalExam(einFehler), { fehler: 1, bestanden: true });

  const zweiFehler = [...einFehler];
  zweiFehler[9] = false;
  assert.deepEqual(evalExam(zweiFehler), { fehler: 2, bestanden: false });
});

test('evalExam: abgebrochene Prüfung gilt nicht als bestanden', () => {
  assert.equal(evalExam([true, true, true]).bestanden, false);
});

import { naechsteReihe } from '../js/engine/progress.js';

test('naechsteReihe: nächste offene Reihe nach der aktuellen, mit Umlauf', () => {
  assert.equal(naechsteReihe({}, 0), 1);
  assert.equal(naechsteReihe({ '1': { gemeistert: true } }, 1), 2);

  const fastAlle = {};
  for (let r = 1; r <= 10; r++) fastAlle[r] = { gemeistert: true };
  fastAlle['3'] = { gemeistert: false };
  assert.equal(naechsteReihe(fastAlle, 7), 3, 'Umlauf über 10 hinaus zur offenen 3');

  const alle = {};
  for (let r = 1; r <= 10; r++) alle[r] = { gemeistert: true };
  assert.equal(naechsteReihe(alle, 5), null, 'alles gemeistert → null');
});
