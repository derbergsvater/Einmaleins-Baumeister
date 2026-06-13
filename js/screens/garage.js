// Generischer Sammlung-Screen (Garage / Tier-Stall …). Der Rahmen ist projektneutral,
// der Inhalt kommt vom aktiven Projekt-Descriptor.
import { getProjekt } from '../projects/registry.js';

export function showGarage(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const projekt = getProjekt(profil.aktivesProjekt);

  root.innerHTML = `
    <div class="screen sammlung">
      <header>
        <button type="button" class="btn klein zurueck">← Zurück</button>
        <h2>${projekt.sammlungIcon} ${projekt.sammlungName}</h2>
        <span></span>
      </header>
      <div class="sammlung-body"></div>
    </div>`;

  projekt.zeichneSammlung(root.querySelector('.sammlung-body'), profil, ctx, navigate);
  root.querySelector('.zurueck').onclick = () => navigate('hub');
}
