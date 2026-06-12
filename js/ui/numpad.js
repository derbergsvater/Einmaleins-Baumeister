// Touch-Ziffernblock: max. 3 Stellen, ⌫ löscht, ✓ schickt ab.
// onChange(wert) bei jeder Änderung, onSubmit(wert) beim Abschicken.
export function createNumpad(el, { onChange, onSubmit }) {
  let wert = '';
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
    if (taste.dataset.ziffer !== undefined && wert.length < 3) wert += taste.dataset.ziffer;
    if (taste.dataset.aktion === 'loeschen') wert = wert.slice(0, -1);
    if (taste.dataset.aktion === 'ok') {
      if (!wert) return;
      const abgeschickt = wert;
      wert = '';
      onChange('');
      onSubmit(abgeschickt);
      return;
    }
    onChange(wert);
  });
}
