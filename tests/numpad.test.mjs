import { test } from 'node:test';
import assert from 'node:assert/strict';

// Minimale DOM-Stubs, damit der Ziffernblock ohne Browser testbar ist.
function fakeEl() {
  return {
    innerHTML: '',
    isConnected: true,
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
}
let keyHandler = null;
globalThis.document = {
  addEventListener(typ, h) { if (typ === 'keydown') keyHandler = h; },
};

const { createNumpad } = await import('../js/ui/numpad.js');

function press(key) { keyHandler({ key, preventDefault() {} }); }

test('Tastatur: Ziffern + Auto-Submit bei voller Stellenzahl', () => {
  const el = fakeEl();
  let submitted = null;
  createNumpad(el, { onChange: () => {}, onSubmit: (w) => { submitted = w; }, erwarteteStellen: () => 2 });
  press('5'); press('6');
  assert.equal(submitted, '56');
});

test('Tastatur: Enter schickt ab, Backspace löscht', () => {
  const el = fakeEl();
  let submitted = null;
  createNumpad(el, { onChange: () => {}, onSubmit: (w) => { submitted = w; }, erwarteteStellen: () => 99 });
  press('4'); press('2'); press('Backspace'); press('Enter');
  assert.equal(submitted, '4');
});

test('nur der zuletzt erstellte (aktive) Ziffernblock bekommt Tasten', () => {
  // Bildet Werkstatt → Meisterprüfung nach: der alte Block darf nicht mehr stören.
  const werkstatt = fakeEl();
  let wSub = null;
  createNumpad(werkstatt, { onChange: () => {}, onSubmit: (w) => { wSub = w; }, erwarteteStellen: () => 99 });
  const pruefung = fakeEl();
  let pSub = null;
  createNumpad(pruefung, { onChange: () => {}, onSubmit: (w) => { pSub = w; }, erwarteteStellen: () => 99 });
  press('7'); press('Enter');
  assert.equal(wSub, null, 'alter Werkstatt-Block darf keine Tasten mehr bekommen');
  assert.equal(pSub, '7', 'Prüfungs-Block muss Tasten bekommen');
});

test('getrennter Ziffernblock bekommt keine Tasten', () => {
  const el = fakeEl();
  let submitted = null;
  createNumpad(el, { onChange: () => {}, onSubmit: (w) => { submitted = w; }, erwarteteStellen: () => 99 });
  el.isConnected = false;
  press('9'); press('Enter');
  assert.equal(submitted, null);
});
