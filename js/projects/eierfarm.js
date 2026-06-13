// Eierfarm-Projekt: pro Zahlenreihe ein Ei, das beim Rechnen Risse bekommt und zu
// einem Tier schlüpft. Am Ende: eine ganze Tierfamilie. Reine Daten + Markup-Helfer.
export const PROJEKT_ID = 'eierfarm';
export const ACCESSOIRE = '🎀';

// Reihe 1–10 → Tier der Familie (klein nach groß = stärkere Belohnung später)
export const TIERE = {
  1: { tier: 'Küken', emoji: '🐣' },
  2: { tier: 'Vogel', emoji: '🐥' },
  3: { tier: 'Hase', emoji: '🐰' },
  4: { tier: 'Katze', emoji: '🐱' },
  5: { tier: 'Hund', emoji: '🐶' },
  6: { tier: 'Fuchs', emoji: '🦊' },
  7: { tier: 'Panda', emoji: '🐼' },
  8: { tier: 'Tiger', emoji: '🐯' },
  9: { tier: 'Löwe', emoji: '🦁' },
  10: { tier: 'Drache', emoji: '🐲' },
};

// Risse als Zickzack-Linien auf der Schale; werden mit dem Fortschritt nacheinander sichtbar
const RISSE = [
  '<path d="M40 62 l8 8 l-6 8 l8 6" fill="none" stroke="#8a7c5e" stroke-width="2.5" stroke-linejoin="round"/>',
  '<path d="M82 74 l-8 8 l6 8 l-8 6" fill="none" stroke="#8a7c5e" stroke-width="2.5" stroke-linejoin="round"/>',
  '<path d="M56 38 l6 10 l-6 8 l6 8" fill="none" stroke="#8a7c5e" stroke-width="2.5" stroke-linejoin="round"/>',
  '<path d="M40 102 l10 6 l-8 8 l10 6" fill="none" stroke="#8a7c5e" stroke-width="2.5" stroke-linejoin="round"/>',
  '<path d="M78 104 l-10 6 l8 8 l-10 6" fill="none" stroke="#8a7c5e" stroke-width="2.5" stroke-linejoin="round"/>',
  '<path d="M50 126 l10 -6 l8 8 l10 -4" fill="none" stroke="#8a7c5e" stroke-width="2.5" stroke-linejoin="round"/>',
];
export const RISS_MAX = RISSE.length;

// Ei-SVG mit `stufe` sichtbaren Rissen (0..6); schlüpfbereit = voll gerissen + zittern
export function eiMarkup(stufe, schluepfbereit = false) {
  return `
    <svg viewBox="0 0 120 168" class="ei ${schluepfbereit ? 'schlupfbereit' : ''}" role="img" aria-label="Ei">
      <defs>
        <linearGradient id="eiVerlauf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f0e3c6"/>
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="156" rx="34" ry="8" fill="#1b2432" opacity="0.12"/>
      <path d="M60 16 C94 16 100 82 100 108 C100 138 82 152 60 152 C38 152 20 138 20 108 C20 82 26 16 60 16 Z"
            fill="url(#eiVerlauf)" stroke="#e3d6b6" stroke-width="2"/>
      <ellipse cx="47" cy="68" rx="9" ry="17" fill="#ffffff" opacity="0.55"/>
      ${RISSE.slice(0, Math.max(0, Math.min(RISS_MAX, stufe))).join('')}
      ${schluepfbereit ? '<text x="60" y="118" text-anchor="middle" font-size="24">🐣</text>' : ''}
    </svg>`;
}

// Geschlüpftes Tier (mit optionalem Zubehör) für die Werkstatt-Bühne
export function tierMarkup(reihe, hatAccessoire) {
  const t = TIERE[reihe];
  return `
    <div class="tier-szene">
      <div class="tier-emoji">${t.emoji}${hatAccessoire ? `<span class="tier-acc">${ACCESSOIRE}</span>` : ''}</div>
      <div class="tier-name">${t.tier}${hatAccessoire ? ` ${ACCESSOIRE}` : ''} geschlüpft!</div>
    </div>`;
}

// Übersichts-Raster der ganzen Familie (für Hub-Vorschau und Tier-Stall)
export function familieGridMarkup(profil) {
  const ef = profil.projekte.eierfarm;
  let zellen = '';
  for (let r = 1; r <= 10; r++) {
    const stand = profil.reihen[r] || {};
    let inhalt, cls;
    if (stand.gemeistert && ef.geschluepft[r]) {
      inhalt = `${TIERE[r].emoji}${ef.accessoires[r] ? `<span class="mini-acc">${ACCESSOIRE}</span>` : ''}`;
      cls = 'tier';
    } else if (stand.gemeistert) {
      inhalt = '🥚'; cls = 'schlupfbereit';
    } else {
      inhalt = '🥚'; cls = 'ei-locked';
    }
    zellen += `<div class="familie-zelle ${cls}" data-reihe="${r}"><span class="zelle-inhalt">${inhalt}</span><small>${r}er</small></div>`;
  }
  return `<div class="familie-grid">${zellen}</div>`;
}
