// Rennwagen als SVG-String. Konvention: Bauteile <g id="teil-X" class="teil">,
// Addons <g id="addon-X" class="addon">. Sichtbarkeit steuert carRenderer via Klasse "sichtbar".
export const RENNWAGEN_SVG = `
<svg viewBox="0 0 480 320" class="rennwagen" role="img" aria-label="Rennwagen">
  <defs>
    <linearGradient id="lackRot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#d62828"/>
    </linearGradient>
    <linearGradient id="metall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfd8e3"/><stop offset="1" stop-color="#8d99ae"/>
    </linearGradient>
    <linearGradient id="glanz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <ellipse class="schatten" cx="240" cy="284" rx="190" ry="14" fill="#1b2432" opacity="0.15"/>

  <g id="addon-neon" class="addon">
    <rect x="100" y="258" width="270" height="6" rx="3" fill="#06d6a0">
      <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g id="addon-rakete" class="addon">
    <rect x="40" y="198" width="54" height="22" rx="11" fill="url(#metall)"/>
    <path d="M40 198 l-16 11 l16 11 Z" fill="#ef233c"/>
    <path d="M24 204 q-22 5 0 10 Z" fill="#ff9f1c"/>
  </g>

  <g id="addon-auspuff" class="addon">
    <rect x="56" y="234" width="34" height="12" rx="6" fill="url(#metall)"/>
    <path d="M56 240 q-16 -9 -26 0 q10 9 26 0" fill="#ff9f1c"/>
  </g>

  <g id="addon-heckfluegel" class="addon">
    <rect x="96" y="142" width="10" height="42" fill="#2b2d42"/>
    <rect x="72" y="130" width="72" height="14" rx="6" fill="#d62828"/>
    <rect x="72" y="130" width="72" height="6" rx="3" fill="url(#glanz)"/>
  </g>

  <g id="teil-chassis" class="teil">
    <rect x="80" y="228" width="312" height="26" rx="13" fill="#2b2d42"/>
  </g>

  <g id="teil-motor" class="teil">
    <rect x="118" y="180" width="82" height="50" rx="8" fill="url(#metall)"/>
    <rect x="128" y="190" width="62" height="6" rx="3" fill="#5c677d"/>
    <rect x="128" y="202" width="62" height="6" rx="3" fill="#5c677d"/>
    <rect x="128" y="214" width="62" height="6" rx="3" fill="#5c677d"/>
  </g>

  <g id="addon-turbo" class="addon">
    <rect x="130" y="158" width="58" height="22" rx="11" fill="#118ab2"/>
    <text x="159" y="174" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">TURBO</text>
  </g>

  <g id="teil-rad-hinten" class="teil">
    <circle cx="142" cy="254" r="42" fill="#1b2432"/>
    <circle cx="142" cy="254" r="20" fill="url(#metall)"/>
    <circle cx="142" cy="254" r="7" fill="#5c677d"/>
  </g>

  <g id="teil-rad-vorne" class="teil">
    <circle cx="362" cy="254" r="36" fill="#1b2432"/>
    <circle cx="362" cy="254" r="17" fill="url(#metall)"/>
    <circle cx="362" cy="254" r="6" fill="#5c677d"/>
  </g>

  <g id="addon-rennreifen" class="addon">
    <circle cx="142" cy="254" r="42" fill="none" stroke="#ef233c" stroke-width="6"/>
    <circle cx="362" cy="254" r="36" fill="none" stroke="#ef233c" stroke-width="6"/>
  </g>

  <g id="teil-sitz" class="teil">
    <path d="M222 176 h30 v46 h-40 z" fill="#1b2432"/>
  </g>

  <g id="teil-karosserie" class="teil">
    <path d="M82 228 L98 198 Q122 170 172 170 L258 170 Q304 170 352 198 L434 214 Q448 220 442 228 Z" fill="url(#lackRot)"/>
    <path d="M98 198 Q150 178 250 176 L250 170 L172 170 Q122 170 98 198 Z" fill="url(#glanz)"/>
  </g>

  <g id="addon-lackierung" class="addon">
    <path d="M176 172 L204 172 L262 228 L234 228 Z" fill="#ffd166" opacity="0.9"/>
    <path d="M218 171 L238 171 L296 228 L276 228 Z" fill="#ffd166" opacity="0.9"/>
  </g>

  <g id="addon-fluegeltueren" class="addon">
    <path d="M252 168 L292 120 L300 128 L266 170 Z" fill="url(#metall)"/>
  </g>

  <g id="teil-windschutz" class="teil">
    <path d="M260 170 L286 146 L306 170 Z" fill="#bde0fe" opacity="0.85"/>
  </g>

  <g id="teil-lenkrad" class="teil">
    <rect x="254" y="158" width="6" height="20" rx="3" fill="#5c677d" transform="rotate(-18 257 168)"/>
    <circle cx="252" cy="156" r="8" fill="#1b2432"/>
  </g>

  <g id="teil-frontfluegel" class="teil">
    <path d="M432 246 L470 240 q8 0 6 8 l-2 6 L432 258 Z" fill="#2b2d42"/>
  </g>

  <g id="teil-scheinwerfer" class="teil">
    <circle cx="432" cy="220" r="7" fill="#ffd166"/>
    <circle cx="432" cy="220" r="3" fill="#fff3b0"/>
  </g>

  <g id="teil-startnummer" class="teil">
    <circle cx="202" cy="202" r="17" fill="#ffffff" stroke="#1b2432" stroke-width="2"/>
    <text x="202" y="209" text-anchor="middle" font-size="20" font-weight="bold" fill="#d62828">7</text>
  </g>

  <g id="teil-fahrer" class="teil">
    <circle cx="270" cy="152" r="14" fill="#ffd166"/>
    <rect x="258" y="146" width="24" height="9" rx="4" fill="#118ab2"/>
  </g>

  <g id="addon-boost" class="addon">
    <circle cx="294" cy="188" r="11" fill="#ef233c" stroke="#ffffff" stroke-width="3"/>
    <text x="294" y="193" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">B</text>
  </g>

  <g id="addon-fliegen" class="addon">
    <path d="M150 212 q-62 -42 -124 -28 q42 44 114 38 Z" fill="#bde0fe" opacity="0.9"/>
    <path d="M330 208 q62 -44 132 -30 q-46 46 -120 42 Z" fill="#bde0fe" opacity="0.9"/>
  </g>
</svg>`;
