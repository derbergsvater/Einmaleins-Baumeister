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
