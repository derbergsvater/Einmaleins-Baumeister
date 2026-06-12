import { TRAINING_ZIEL, naechsteReihe } from '../engine/progress.js';
import { PARTS, addonsUnlocked } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar } from '../ui/carRenderer.js';
import { sound } from '../audio.js';

export function showHub(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }

  root.innerHTML = `
    <div class="screen hub">
      <header>
        <button type="button" class="btn klein profil-wechsel">👤</button>
        <h2>${profil.avatar} ${profil.name}</h2>
        <div class="kopf-knoepfe">
          <button type="button" class="btn klein stumm">${sound.istStumm() ? '🔇' : '🔊'}</button>
          <button type="button" class="btn klein zur-garage">🏁</button>
        </div>
      </header>
      <div class="auto-buehne klein"></div>
      <h3>Wähle deine Reihe:</h3>
      <div class="reihen-grid"></div>
    </div>`;

  const buehne = root.querySelector('.auto-buehne');
  mountCar(buehne, RENNWAGEN_SVG);
  updateCar(buehne, {
    teile: PARTS.slice(0, profil.projekte.rennwagen.grundbau).map(p => p.id),
    addons: addonsUnlocked(profil.reihen),
  });

  const grid = root.querySelector('.reihen-grid');
  const empfohlen = naechsteReihe(profil.reihen, 0);
  for (let r = 1; r <= 10; r++) {
    const stand = profil.reihen[r] || { training: 0, gemeistert: false };
    const prozent = Math.min(100, Math.round((100 * stand.training) / TRAINING_ZIEL));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn reihen-knopf'
      + (stand.gemeistert ? ' gemeistert' : '')
      + (r === empfohlen ? ' empfohlen' : '');
    btn.innerHTML = stand.gemeistert
      ? `<span class="reihe-zahl">${r}er</span><span class="pokal">🏆</span>`
      : `<span class="reihe-zahl">${r}er</span><span class="balken"><span class="fuellung" style="width:${prozent}%"></span></span>`;
    btn.onclick = () => navigate('werkstatt', { reihe: r });
    grid.appendChild(btn);
  }

  root.querySelector('.profil-wechsel').onclick = () => navigate('start');
  root.querySelector('.zur-garage').onclick = () => navigate('garage');
  root.querySelector('.stumm').onclick = (e) => {
    e.target.textContent = sound.toggleStumm() ? '🔇' : '🔊';
  };
}
