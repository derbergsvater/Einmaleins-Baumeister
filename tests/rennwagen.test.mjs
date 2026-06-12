import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARTS, ADDONS, addonsUnlocked, addonFuerReihe, gemeisterteReihen } from '../js/projects/rennwagen.js';

test('12 Bauteile mit eindeutigen IDs', () => {
  assert.equal(PARTS.length, 12);
  assert.equal(new Set(PARTS.map(p => p.id)).size, 12);
  assert.ok(PARTS.every(p => p.label.length > 0));
});

test('10 Addons, je eines pro Reihe 1–10', () => {
  assert.equal(ADDONS.length, 10);
  assert.deepEqual(ADDONS.map(a => a.reihe).sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('addonsUnlocked: gemeisterte Reihe schaltet ihr Addon frei', () => {
  const reihen = { '3': { training: 20, gemeistert: true }, '4': { training: 10, gemeistert: false } };
  const frei = addonsUnlocked(reihen);
  assert.deepEqual(frei, ['heckfluegel']);
});

test('Fliegendes Auto erst, wenn ALLE 10 Reihen gemeistert sind', () => {
  const neunFertig = {};
  for (let r = 1; r <= 9; r++) neunFertig[r] = { training: 20, gemeistert: true };
  neunFertig['10'] = { training: 20, gemeistert: false };
  assert.ok(!addonsUnlocked(neunFertig).includes('fliegen'));

  const nurZehn = { '10': { training: 20, gemeistert: true } };
  assert.ok(!addonsUnlocked(nurZehn).includes('fliegen'), 'Reihe 10 allein reicht nicht');

  const alleFertig = { ...neunFertig, '10': { training: 20, gemeistert: true } };
  const frei = addonsUnlocked(alleFertig);
  assert.ok(frei.includes('fliegen'));
  assert.equal(frei.length, 10);
});

test('addonFuerReihe und gemeisterteReihen', () => {
  assert.equal(addonFuerReihe(1).id, 'auspuff');
  assert.equal(addonFuerReihe(10).id, 'fliegen');
  assert.equal(addonFuerReihe(11), null);
  assert.deepEqual(
    gemeisterteReihen({ '2': { gemeistert: true }, '5': { gemeistert: true }, '7': { gemeistert: false } }),
    [2, 5]
  );
});
