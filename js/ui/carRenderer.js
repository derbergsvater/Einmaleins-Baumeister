// Hängt das SVG ein und steuert Sichtbarkeit der Gruppen. Kein Spielzustand hier.
export function mountCar(el, svgString) {
  el.innerHTML = svgString;
}

export function updateCar(el, { teile = [], addons = [] }) {
  el.querySelectorAll('.teil, .addon').forEach(g => {
    g.classList.remove('sichtbar', 'bauplan');
    g.style.opacity = '';
  });
  for (const id of teile) el.querySelector(`#teil-${id}`)?.classList.add('sichtbar');
  for (const id of addons) el.querySelector(`#addon-${id}`)?.classList.add('sichtbar');
  el.querySelector('svg')?.classList.toggle('fliegt', addons.includes('fliegen'));
}

// Bauplan-Vorschau: das Addon der trainierten Reihe wird mit jedem Fortschritt "realer".
// Die Meisterprüfung schaltet es dann in voller Farbe frei (Klasse "sichtbar").
export function zeigeVorschau(el, addonId, anteil) {
  const g = el.querySelector(`#addon-${addonId}`);
  if (!g || g.classList.contains('sichtbar')) return;
  g.classList.add('bauplan');
  g.style.opacity = (0.15 + 0.55 * Math.min(1, anteil)).toFixed(2);
}

// Kurzes Wackeln der Bühne — Feedback für richtige Antworten nach fertigem Grundbau
export function wackel(el) {
  el.classList.remove('wackelt');
  void el.offsetWidth; // Reflow, damit die Animation neu startet
  el.classList.add('wackelt');
}

// Montage-Animation für ein frisch gebautes Teil (Klasse triggert CSS-Keyframe)
export function montiere(el, teilId) {
  const g = el.querySelector(`#teil-${teilId}`);
  if (!g) return;
  g.classList.add('sichtbar', 'montiert');
  setTimeout(() => g.classList.remove('montiert'), 700);
}

// Addon in der Garage anbauen — gleiche Pop-Animation wie ein Bauteil
export function montiereAddon(el, addonId) {
  const g = el.querySelector(`#addon-${addonId}`);
  if (!g) return;
  g.classList.add('sichtbar', 'montiert');
  setTimeout(() => g.classList.remove('montiert'), 700);
}

// Warnblinken: ein Teil/Addon droht sich zu lösen (Fehler-Feedback, kein echter Verlust)
export function warneTeil(el, id) {
  const g = el.querySelector(`#teil-${id}`) || el.querySelector(`#addon-${id}`);
  if (!g) return;
  g.classList.add('warnung');
  setTimeout(() => g.classList.remove('warnung'), 800);
}

// Großer Freude-Hüpfer der ganzen Bühne (neues Teil/Addon angebaut)
export function feiere(el) {
  el.classList.remove('feiert');
  void el.offsetWidth;
  el.classList.add('feiert');
  setTimeout(() => el.classList.remove('feiert'), 900);
}
