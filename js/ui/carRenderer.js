// Hängt das SVG ein und steuert Sichtbarkeit der Gruppen. Kein Spielzustand hier.
export function mountCar(el, svgString) {
  el.innerHTML = svgString;
}

export function updateCar(el, { teile = [], addons = [] }) {
  el.querySelectorAll('.teil, .addon').forEach(g => g.classList.remove('sichtbar'));
  for (const id of teile) el.querySelector(`#teil-${id}`)?.classList.add('sichtbar');
  for (const id of addons) el.querySelector(`#addon-${id}`)?.classList.add('sichtbar');
  el.querySelector('svg')?.classList.toggle('fliegt', addons.includes('fliegen'));
}

// Montage-Animation für ein frisch gebautes Teil (Klasse triggert CSS-Keyframe)
export function montiere(el, teilId) {
  const g = el.querySelector(`#teil-${teilId}`);
  if (!g) return;
  g.classList.add('sichtbar', 'montiert');
  setTimeout(() => g.classList.remove('montiert'), 700);
}
