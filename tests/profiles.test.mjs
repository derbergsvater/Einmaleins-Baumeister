import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/store/profiles.js';

function fakeStorage(anfang = {}) {
  const map = new Map(Object.entries(anfang));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

test('create legt Profil an und setzt es aktiv', () => {
  const store = createStore(fakeStorage());
  const profil = store.create('Ella', '🦄');
  assert.equal(profil.name, 'Ella');
  assert.equal(profil.avatar, '🦄');
  assert.equal(profil.aktivesProjekt, 'rennwagen');
  assert.deepEqual(profil.projekte.rennwagen, { grundbau: 0, montierteAddons: [] });
  assert.deepEqual(profil.projekte.eierfarm, { geschluepft: {}, accessoires: {} });
  assert.equal(store.getActive().id, profil.id);
});

test('list liefert alle Profile, setActive wechselt', () => {
  const store = createStore(fakeStorage());
  const a = store.create('Anna', '🦊');
  const b = store.create('Ben', '🦖');
  assert.equal(store.list().length, 2);
  store.setActive(a.id);
  assert.equal(store.getActive().name, 'Anna');
  store.setActive(b.id);
  assert.equal(store.getActive().name, 'Ben');
});

test('update persistiert Änderungen', () => {
  const storage = fakeStorage();
  const store = createStore(storage);
  const profil = store.create('Mia', '🐸');
  profil.reihen['4'] = { training: 12, gemeistert: false };
  profil.projekte.rennwagen.grundbau = 5;
  store.update(profil);
  const neuGeladen = createStore(storage).get(profil.id);
  assert.equal(neuGeladen.reihen['4'].training, 12);
  assert.equal(neuGeladen.projekte.rennwagen.grundbau, 5);
});

test('kaputtes JSON führt zu frischem Zustand', () => {
  const store = createStore(fakeStorage({ 'baumeister.v1': '{kaputt' }));
  assert.deepEqual(store.list(), []);
  assert.equal(store.getActive(), null);
});

test('zwei Profile mit gleichem Namen bekommen verschiedene IDs', () => {
  const store = createStore(fakeStorage());
  const a = store.create('Tom', '🐯');
  const b = store.create('Tom', '🚀');
  assert.notEqual(a.id, b.id);
  assert.equal(store.list().length, 2);
});

test('neues Profil startet mit leerer Montage-Liste', () => {
  const store = createStore(fakeStorage());
  const profil = store.create('Lea', '⭐');
  assert.deepEqual(profil.projekte.rennwagen.montierteAddons, []);
});

test('Migration: altes Profil ohne montierteAddons wird ergänzt', () => {
  const alt = {
    profiles: {
      p1_alt: {
        id: 'p1_alt', name: 'Alt', avatar: '🦊',
        aktivesProjekt: 'rennwagen',
        reihen: { '3': { training: 20, gemeistert: true } },
        aufgabenStats: {},
        projekte: { rennwagen: { grundbau: 5 } },
      },
    },
    activeId: 'p1_alt',
  };
  const store = createStore(fakeStorage({ 'baumeister.v1': JSON.stringify(alt) }));
  const profil = store.getActive();
  assert.deepEqual(profil.projekte.rennwagen.montierteAddons, []);
  assert.equal(profil.projekte.rennwagen.grundbau, 5, 'bestehende Werte bleiben erhalten');
});

test('Store übersteht strukturell falsche Daten im Speicher', () => {
  for (const kaputt of ['{}', '[]', '"x"', 'null', '{"profiles":{"p1":null}}']) {
    const s = createStore(fakeStorage({ 'baumeister.v1': kaputt }));
    assert.deepEqual(s.list(), [], kaputt);
    assert.equal(s.getActive(), null, kaputt);
  }
});

test('Store wirft nicht, wenn setItem scheitert (Speicher voll)', () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
  const s = createStore(storage);
  assert.doesNotThrow(() => s.create('Ella', '🦊'));
});
