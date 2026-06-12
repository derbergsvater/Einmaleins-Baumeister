// Maskottchen: kleiner Werkstatt-Roboter. setMood('jubel'|'trost') zeigt
// kurz Animation + Spruch, danach zurück zu neutral.
const SPRUECHE = {
  jubel: ['Super!', 'Stark gerechnet!', 'Weiter so!', 'Wow, das saß!'],
  trost: ['Gleich klappt’s!', 'Schau genau hin!', 'Nicht aufgeben!', 'Du schaffst das!'],
};

export function createSchrauber(el) {
  el.innerHTML = `
    <div class="schrauber">
      <svg viewBox="0 0 120 140" class="schrauber-svg" role="img" aria-label="Schrauber der Roboter">
        <circle cx="60" cy="8" r="5" fill="#ffd166"/>
        <line x1="60" y1="10" x2="60" y2="16" stroke="#8d99ae" stroke-width="3"/>
        <rect x="22" y="16" width="76" height="46" rx="14" fill="#a8b3c5"/>
        <circle class="auge" cx="45" cy="38" r="7" fill="#1b2432"/>
        <circle class="auge" cx="75" cy="38" r="7" fill="#1b2432"/>
        <path class="mund" d="M46 50 Q60 58 74 50" stroke="#1b2432" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="32" y="64" width="56" height="52" rx="12" fill="#8d99ae"/>
        <rect x="8" y="70" width="22" height="10" rx="5" fill="#8d99ae" transform="rotate(-22 19 75)"/>
        <text x="0" y="66" font-size="20">🔧</text>
        <rect x="90" y="74" width="22" height="10" rx="5" fill="#8d99ae" transform="rotate(16 101 79)"/>
      </svg>
      <p class="schrauber-text" aria-live="polite"></p>
    </div>`;
  const figur = el.querySelector('.schrauber');
  const text = el.querySelector('.schrauber-text');
  let zaehler = 0;
  let timer = null;
  return {
    setMood(mood) {
      if (!SPRUECHE[mood]) return;
      clearTimeout(timer);
      figur.classList.remove('jubel', 'trost');
      void figur.offsetWidth; // Animation neu starten
      figur.classList.add(mood);
      const liste = SPRUECHE[mood];
      text.textContent = liste[zaehler++ % liste.length];
      timer = setTimeout(() => {
        figur.classList.remove(mood);
        text.textContent = '';
      }, 1500);
    },
  };
}
