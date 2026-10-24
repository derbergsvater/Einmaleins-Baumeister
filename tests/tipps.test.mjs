import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tippStufen, waehleTrick } from '../js/engine/tipps.js';

const alle = [];
for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) alle.push({ a, b });
const texte = s => [s.titel, ...s.marken, ...s.zeilen];
const enthaeltZahl = (text, zahl) => new RegExp(`(^|\\D)${zahl}(\\D|$)`).test(text);

test('Tipp verrät nie das Ergebnis (außer bei ·1, da steht es schon in der Aufgabe)', () => {
  for (const t of alle) {
    if (t.a === 1 || t.b === 1) continue;
    for (const stufe of tippStufen(t)) {
      for (const text of texte(stufe)) {
        assert.ok(!enthaeltZahl(text, t.a * t.b), `${t.a}·${t.b}: „${text}“ verrät ${t.a * t.b}`);
      }
    }
  }
});

test('Rechenweg geht für alle 100 Aufgaben auf und endet mit der Lösung', () => {
  for (const t of alle) {
    const k = waehleTrick(t);
    const R = t.a * t.b;
    assert.equal(k.anzahl * k.zahl, R, `${t.a}·${t.b}`);
    assert.deepEqual(k.tausch ? [k.zahl, k.anzahl] : [k.anzahl, k.zahl], [t.a, t.b]);
    if (k.art === 'plus') assert.equal(k.teile[0] + k.teile[1], k.anzahl);
    if (k.art === 'minus') assert.equal(k.teile[0] - k.teile[1], k.anzahl);
    const [erklaerung] = tippStufen(t, true);
    assert.ok(erklaerung.zeilen.at(-1).endsWith(`= ${R}`), `${t.a}·${t.b}: ${erklaerung.zeilen.at(-1)}`);
  }
});

test('Beispiele: Plus-Aufgabe zuerst, dann leichter Weg', () => {
  const [plus, trick] = tippStufen({ a: 3, b: 5 });
  assert.equal(plus.zeilen[0], '5 + 5 + 5 = ?');
  assert.equal(trick.art, 'plus');
  assert.deepEqual(trick.zeilen, ['10 + 5 = ?']);

  const neun = tippStufen({ a: 9, b: 5 })[1];
  assert.equal(neun.art, 'minus');
  assert.deepEqual(neun.marken, ['10 · 5 = 50', '− 1 · 5 = 5']);
  assert.deepEqual(neun.zeilen, ['50 − 5 = ?']);
});

test('Tauschen, wenn es leichter wird: 8 · 7 → 7 · 8 = 40 + 16 statt 70 − 14', () => {
  const k = tippStufen({ a: 8, b: 7 })[1];
  assert.ok(k.tausch);
  assert.deepEqual(k.zeilen, ['Tauschaufgabe: 8 · 7 = 7 · 8', '40 + 16 = ?']);
  assert.equal(waehleTrick({ a: 7, b: 2 }).art, 'doppelt'); // 7 · 2 → 2 · 7 = 7 + 7
  assert.equal(waehleTrick({ a: 10, b: 4 }).art, 'zehn');   // 10 · 4 → 4 Zehner
});

test('Bei 1 · 7 und 2 · 7 gibt es nur eine Stufe (Plus-Aufgabe = Trick)', () => {
  assert.equal(tippStufen({ a: 1, b: 7 }).length, 1);
  assert.equal(tippStufen({ a: 2, b: 7 }).length, 1);
  assert.equal(tippStufen({ a: 7, b: 2 }).length, 2);
});
