import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIERE, RISS_MAX, eiMarkup, tierMarkup, familieGridMarkup } from '../js/projects/eierfarm.js';

const RISS = /stroke="#8a7c5e"/g;
function risse(svg) { return (svg.match(RISS) || []).length; }

test('TIERE hat 10 Einträge mit Name und Emoji', () => {
  for (let r = 1; r <= 10; r++) {
    assert.ok(TIERE[r].tier.length > 0, `Reihe ${r} ohne Tiername`);
    assert.ok(TIERE[r].emoji.length > 0, `Reihe ${r} ohne Emoji`);
  }
});

test('eiMarkup: Anzahl Risse skaliert mit der Stufe und ist gedeckelt', () => {
  assert.equal(risse(eiMarkup(0)), 0);
  assert.equal(risse(eiMarkup(3)), 3);
  assert.equal(risse(eiMarkup(RISS_MAX)), RISS_MAX);
  assert.equal(risse(eiMarkup(99)), RISS_MAX, 'über Maximum wird gedeckelt');
  assert.equal(risse(eiMarkup(-5)), 0, 'unter 0 wird gedeckelt');
});

test('eiMarkup schlüpfbereit zeigt das Küken-Peek', () => {
  assert.ok(eiMarkup(RISS_MAX, true).includes('🐣'));
  assert.ok(!eiMarkup(2, false).includes('🐣'));
});

test('tierMarkup zeigt Tier und optionales Zubehör', () => {
  const ohne = tierMarkup(5, false);
  assert.ok(ohne.includes(TIERE[5].emoji));
  assert.ok(!ohne.includes('tier-acc'));
  assert.ok(tierMarkup(5, true).includes('tier-acc'));
});

test('familieGridMarkup: 10 Zellen mit korrekten Zuständen', () => {
  const profil = {
    reihen: {
      2: { gemeistert: true },          // gemeistert + geschlüpft → Tier
      3: { gemeistert: true },          // gemeistert, nicht geschlüpft → schlupfbereit
      4: { training: 5, gemeistert: false }, // gesperrt
    },
    projekte: { eierfarm: { geschluepft: { 2: true }, accessoires: { 2: true } } },
  };
  const html = familieGridMarkup(profil);
  assert.equal((html.match(/familie-zelle/g) || []).length, 10);
  assert.ok(html.includes(TIERE[2].emoji), 'geschlüpftes Tier 2 fehlt');
  assert.ok(html.includes('mini-acc'), 'Zubehör von Tier 2 fehlt');
  assert.ok((html.match(/schlupfbereit/g) || []).length === 1, 'genau Reihe 3 schlüpfbereit');
  assert.ok((html.match(/ei-locked/g) || []).length === 8, '8 gesperrte Eier (Reihen 1,4-10)');
});
