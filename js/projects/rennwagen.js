// Rennwagen-Projekt: Bauteile in Montage-Reihenfolge + Addons je Reihe. Pure data + Logik.
export const PROJEKT_ID = 'rennwagen';

export const PARTS = [
  { id: 'chassis', label: 'Chassis' },
  { id: 'motor', label: 'Motor' },
  { id: 'rad-hinten', label: 'Hinterrad' },
  { id: 'rad-vorne', label: 'Vorderrad' },
  { id: 'sitz', label: 'Sitz' },
  { id: 'karosserie', label: 'Karosserie' },
  { id: 'windschutz', label: 'Windschutzscheibe' },
  { id: 'lenkrad', label: 'Lenkrad' },
  { id: 'frontfluegel', label: 'Frontflügel' },
  { id: 'scheinwerfer', label: 'Scheinwerfer' },
  { id: 'startnummer', label: 'Startnummer' },
  { id: 'fahrer', label: 'Fahrer mit Helm' },
];

export const ADDONS = [
  { id: 'auspuff', label: 'Sport-Auspuff', reihe: 1 },
  { id: 'rennreifen', label: 'Rennreifen', reihe: 2 },
  { id: 'heckfluegel', label: 'Heckflügel', reihe: 3 },
  { id: 'turbo', label: 'Turbo', reihe: 4 },
  { id: 'neon', label: 'Neon-Unterboden', reihe: 5 },
  { id: 'lackierung', label: 'Rennlackierung', reihe: 6 },
  { id: 'fluegeltueren', label: 'Flügeltüren', reihe: 7 },
  { id: 'rakete', label: 'Raketenantrieb', reihe: 8 },
  { id: 'boost', label: 'Boost-Knopf', reihe: 9 },
  { id: 'fliegen', label: 'Fliegendes Auto', reihe: 10, alleReihen: true },
];

export function gemeisterteReihen(reihen) {
  return Object.entries(reihen)
    .filter(([, stand]) => stand.gemeistert)
    .map(([nummer]) => Number(nummer))
    .sort((a, b) => a - b);
}

export function addonsUnlocked(reihen) {
  const fertig = new Set(gemeisterteReihen(reihen));
  return ADDONS
    .filter(a => (a.alleReihen ? fertig.size === 10 : fertig.has(a.reihe)))
    .map(a => a.id);
}

export function addonFuerReihe(reihe) {
  return ADDONS.find(a => a.reihe === reihe) || null;
}
