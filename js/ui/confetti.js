// Konfetti-Regen für Feier-Momente. Räumt sich selbst wieder auf.
export function feuerKonfetti(el, anzahl = 70) {
  const farben = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5'];
  for (let i = 0; i < anzahl; i++) {
    const stueck = document.createElement('span');
    stueck.className = 'konfetti';
    stueck.style.left = Math.random() * 100 + 'vw';
    stueck.style.background = farben[i % farben.length];
    stueck.style.animationDuration = 1200 + Math.random() * 1400 + 'ms';
    stueck.style.animationDelay = Math.random() * 500 + 'ms';
    el.appendChild(stueck);
    stueck.addEventListener('animationend', () => stueck.remove());
  }
}
