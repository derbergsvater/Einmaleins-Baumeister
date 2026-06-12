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
