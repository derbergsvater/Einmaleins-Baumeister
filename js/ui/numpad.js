// Touch-Ziffernblock + PC-Tastatur (Ziffern, Backspace, Enter).
// onChange(wert) bei jeder Änderung, onSubmit(wert) beim Abschicken.
// erwarteteStellen(): Stellenzahl der Lösung → Auto-Submit, sobald erreicht.
import { sound } from '../audio.js';

// Genau EIN globaler Tastatur-Listener für die ganze App. Tasten gehen immer nur an
// den zuletzt erstellten, noch sichtbaren Ziffernblock — kein Stör-Stacking bei
// Screen-Wechseln (z. B. Werkstatt → Meisterprüfung).
let aktiv = null;
let globalRegistriert = false;

function ensureGlobalKey() {
  if (globalRegistriert) return;
  globalRegistriert = true;
  document.addEventListener('keydown', (e) => {
    if (!aktiv || !aktiv.el || !aktiv.el.isConnected) return;
    if (e.key >= '0' && e.key <= '9') aktiv.ziffer(e.key);
    else if (e.key === 'Backspace') aktiv.loeschen();
    else if (e.key === 'Enter') aktiv.abschicken();
    else return;
    e.preventDefault();
  });
}

export function createNumpad(el, { onChange, onSubmit, erwarteteStellen = null }) {
  let wert = '';

  function abschicken() {
    if (!wert) return;
    const abgeschickt = wert;
    wert = '';
    onChange('');
    onSubmit(abgeschickt);
  }

  function ziffer(z) {
    if (wert.length >= 3) return;
    sound.klick();
    wert += z;
    onChange(wert);
    if (erwarteteStellen && wert.length >= erwarteteStellen()) abschicken();
  }

  function loeschen() {
    sound.klick();
    wert = wert.slice(0, -1);
    onChange(wert);
  }

  el.innerHTML = `
    <div class="numpad-grid">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" class="taste" data-ziffer="${n}">${n}</button>`).join('')}
      <button type="button" class="taste loeschen" data-aktion="loeschen">⌫</button>
      <button type="button" class="taste" data-ziffer="0">0</button>
      <button type="button" class="taste ok" data-aktion="ok">✓</button>
    </div>`;

  el.addEventListener('click', (e) => {
    const taste = e.target.closest('.taste');
    if (!taste) return;
    if (taste.dataset.ziffer !== undefined) ziffer(taste.dataset.ziffer);
    if (taste.dataset.aktion === 'loeschen') loeschen();
    if (taste.dataset.aktion === 'ok') abschicken();
  });

  // Diesen Ziffernblock zum aktiven Tastatur-Ziel machen.
  ensureGlobalKey();
  aktiv = { el, ziffer, loeschen, abschicken };

  return {
    reset() {
      wert = '';
      onChange('');
    },
  };
}
