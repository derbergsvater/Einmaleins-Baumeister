// Projekt-Register: alle wählbaren Bauprojekte. Screens arbeiten nur gegen diese
// einheitliche Schnittstelle, nie direkt gegen ein konkretes Projekt.
import { rennwagenProjekt } from './rennwagen.descriptor.js';
import { eierfarmProjekt } from './eierfarm.descriptor.js';

export const PROJEKTE = {
  rennwagen: rennwagenProjekt,
  eierfarm: eierfarmProjekt,
};

export const PROJEKT_LISTE = Object.values(PROJEKTE);

export function getProjekt(id) {
  return PROJEKTE[id] || rennwagenProjekt;
}
