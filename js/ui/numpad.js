// Touch-Ziffernblock + PC-Tastatur (Ziffern, Backspace, Enter).
// onChange(wert) bei jeder Änderung, onSubmit(wert) beim Abschicken.
// erwarteteStellen(): Stellenzahl der Lösung → Auto-Submit, sobald erreicht.
import { sound } from '../audio.js';

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

  // PC-Tastatur. Der Listener räumt sich selbst weg, sobald der Numpad-DOM
  // nicht mehr im Dokument hängt (Screen-Wechsel).
  function onKeydown(e) {
    if (!el.isConnected) {
      document.removeEventListener('keydown', onKeydown);
      return;
    }
    if (e.key >= '0' && e.key <= '9') ziffer(e.key);
    else if (e.key === 'Backspace') loeschen();
    else if (e.key === 'Enter') abschicken();
    else return;
    e.preventDefault();
  }
  document.addEventListener('keydown', onKeydown);

  return {
    reset() {
      wert = '';
      onChange('');
    },
  };
}
