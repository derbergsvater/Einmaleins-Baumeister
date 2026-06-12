import { PARTS, ADDONS, addonsUnlocked, gemeisterteReihen } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar } from '../ui/carRenderer.js';

export function showGarage(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const freigeschaltet = addonsUnlocked(profil.reihen);
  const eingeschaltet = new Set(freigeschaltet);
  const pokale = gemeisterteReihen(profil.reihen);

  root.innerHTML = `
    <div class="screen garage">
      <header>
        <button type="button" class="btn klein zurueck">← Zurück</button>
        <h2>🏁 Garage</h2>
        <span></span>
      </header>
      <div class="auto-buehne"></div>
      <h3>Addons</h3>
      <div class="addon-liste"></div>
      <h3>Pokal-Regal</h3>
      <div class="pokal-regal">
        ${Array.from({ length: 10 }, (_, i) => `
          <span class="pokal-platz ${pokale.includes(i + 1) ? 'gewonnen' : ''}">
            <span class="pokal-icon">${pokale.includes(i + 1) ? '🏆' : '·'}</span>
            <small>${i + 1}er</small>
          </span>`).join('')}
      </div>
    </div>`;

  const buehne = root.querySelector('.auto-buehne');
  mountCar(buehne, RENNWAGEN_SVG);

  function zeichne() {
    updateCar(buehne, {
      teile: PARTS.slice(0, profil.projekte.rennwagen.grundbau).map(p => p.id),
      addons: [...eingeschaltet],
    });
  }

  const liste = root.querySelector('.addon-liste');
  for (const addon of ADDONS) {
    const offen = freigeschaltet.includes(addon.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn addon-knopf' + (offen ? '' : ' gesperrt');
    const beschriftung = () => `${eingeschaltet.has(addon.id) ? '✅' : '⬜'} ${addon.label}`;
    btn.textContent = offen
      ? beschriftung()
      : `🔒 ${addon.alleReihen ? 'Alle 10 Reihen meistern!' : `${addon.reihe}er-Reihe meistern`}`;
    if (offen) {
      btn.onclick = () => {
        eingeschaltet.has(addon.id) ? eingeschaltet.delete(addon.id) : eingeschaltet.add(addon.id);
        btn.textContent = beschriftung();
        zeichne();
      };
    }
    liste.appendChild(btn);
  }

  root.querySelector('.zurueck').onclick = () => navigate('hub');
  zeichne();
}
