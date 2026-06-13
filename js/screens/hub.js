import { TRAINING_ZIEL, naechsteReihe } from '../engine/progress.js';
import { getProjekt } from '../projects/registry.js';
import { sound } from '../audio.js';

export function showHub(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const projekt = getProjekt(profil.aktivesProjekt);
  const offene = projekt.offeneBelohnungen(profil);

  root.innerHTML = `
    <div class="screen hub">
      <header>
        <button type="button" class="btn klein profil-wechsel">👤</button>
        <h2>${profil.avatar} ${profil.name}</h2>
        <div class="kopf-knoepfe">
          <button type="button" class="btn klein stumm">${sound.istStumm() ? '🔇' : '🔊'}</button>
          <button type="button" class="btn klein zur-sammlung${offene ? ' hat-neues' : ''}">${projekt.sammlungIcon}${offene ? `<span class="badge">${offene}</span>` : ''}</button>
        </div>
      </header>
      <div class="projekt-buehne klein"></div>
      <button type="button" class="btn klein projekt-wechsel">${projekt.emoji} ${projekt.name} ⇄</button>
      <h3>Wähle deine Reihe:</h3>
      <div class="reihen-grid"></div>
    </div>`;

  const buehne = root.querySelector('.projekt-buehne');
  projekt.zeichneVorschau(buehne, profil);

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
  root.querySelector('.projekt-wechsel').onclick = () => navigate('projektwahl');
  root.querySelector('.zur-sammlung').onclick = () => navigate('garage');
  root.querySelector('.stumm').onclick = (e) => {
    e.target.textContent = sound.toggleStumm() ? '🔇' : '🔊';
  };
}
