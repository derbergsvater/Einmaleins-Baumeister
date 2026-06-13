// Eierfarm als Projekt-Descriptor (gleiche Schnittstelle wie der Rennwagen).
// Nutzt dieselben Reihen-Trainings-/Meister-Daten; eigene Visuals (Eier/Tiere).
import { TIERE, ACCESSOIRE, RISS_MAX, eiMarkup, tierMarkup, familieGridMarkup } from './eierfarm.js';
import { TRAINING_ZIEL } from '../engine/progress.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

function szene(el) { return el.querySelector('.ei-szene'); }

// Vollbild-Show: Ei platzt, Tier schlüpft, danach kann man mit dem Tier spielen.
// neu=true → mit Schlüpf-Sequenz; neu=false → direkt Spielmodus für ein vorhandenes Tier.
function tierShow(host, profil, reihe, neu, onClose) {
  const ef = profil.projekte.eierfarm;
  const t = TIERE[reihe];
  const hatAcc = !!ef.accessoires[reihe];

  const overlay = document.createElement('div');
  overlay.className = 'schlupf-overlay';
  overlay.innerHTML = `
    <div class="schlupf-buehne">
      ${neu ? `<div class="schlupf-ei">${eiMarkup(RISS_MAX, false)}</div>` : ''}
      <div class="tier-gross ${neu ? 'verborgen' : ''}">
        <span class="tier-figur" role="button" aria-label="${t.tier}">${t.emoji}</span>
        ${hatAcc ? `<span class="tier-acc-gross">${ACCESSOIRE}</span>` : ''}
      </div>
    </div>
    <p class="schlupf-text">${neu ? '' : `Tippe deinen ${t.tier} zum Spielen! 🐾`}</p>
    <div class="schlupf-aktionen ${neu ? 'verborgen' : ''}">
      <button type="button" class="btn klein fuettern">🍎 Füttern</button>
      ${hatAcc ? `<button type="button" class="btn klein acc-toggle">${ACCESSOIRE} Schleife</button>` : ''}
      <button type="button" class="btn gross fertig">Fertig ✓</button>
    </div>`;
  host.appendChild(overlay);

  const figur = overlay.querySelector('.tier-figur');
  const tierGross = overlay.querySelector('.tier-gross');
  const text = overlay.querySelector('.schlupf-text');
  const aktionen = overlay.querySelector('.schlupf-aktionen');

  function herzen(n = 6) {
    const icons = ['❤️', '⭐', '✨', '💛'];
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'herz';
      h.textContent = icons[i % icons.length];
      h.style.left = `${40 + Math.random() * 20}%`;
      h.style.animationDelay = `${Math.random() * 200}ms`;
      overlay.appendChild(h);
      h.addEventListener('animationend', () => h.remove());
    }
  }
  function spielen() {
    tierGross.classList.remove('spielt');
    void tierGross.offsetWidth;
    tierGross.classList.add('spielt');
    herzen();
    sound.tierFreude();
    navigator.vibrate?.(20);
  }

  figur.addEventListener('click', spielen);
  overlay.querySelector('.fuettern').addEventListener('click', () => {
    const apfel = document.createElement('span');
    apfel.className = 'futter';
    apfel.textContent = '🍎';
    overlay.appendChild(apfel);
    apfel.addEventListener('animationend', () => { apfel.remove(); spielen(); });
  });
  overlay.querySelector('.acc-toggle')?.addEventListener('click', () => {
    overlay.querySelector('.tier-acc-gross')?.classList.toggle('verborgen');
  });
  overlay.querySelector('.fertig').addEventListener('click', () => { overlay.remove(); onClose?.(); });

  if (neu) {
    const ei = overlay.querySelector('.schlupf-ei');
    ei.classList.add('beben');
    sound.knack();
    setTimeout(() => sound.knack(), 300);
    setTimeout(() => { ei.classList.add('platzt'); sound.knack(); }, 600);
    setTimeout(() => {
      ei.remove();
      tierGross.classList.remove('verborgen');
      tierGross.classList.add('schluepft');
      sound.fanfare();
      feuerKonfetti(overlay, 60);
      herzen(8);
      text.textContent = `🎉 Geschlüpft! Dein ${t.tier}!`;
    }, 950);
    setTimeout(() => {
      aktionen.classList.remove('verborgen');
      text.textContent = `Tippe deinen ${t.tier} zum Spielen! 🐾`;
    }, 1750);
  }
}

export const eierfarmProjekt = {
  id: 'eierfarm',
  name: 'Tierfamilie',
  emoji: '🥚',
  slogan: 'Rechne und brüte deine Tierfamilie aus!',
  sammlungName: 'Tier-Stall',
  sammlungIcon: '🐾',

  mountBuehne(el) {
    el.innerHTML = '<div class="ei-szene"></div>';
  },

  zeichne(el, profil, reihe) {
    const stand = profil.reihen[reihe] || { training: 0, gemeistert: false };
    const ef = profil.projekte.eierfarm;
    const s = szene(el);
    if (!s) return;
    if (stand.gemeistert && ef.geschluepft[reihe]) {
      s.innerHTML = tierMarkup(reihe, ef.accessoires[reihe]);
    } else if (stand.gemeistert) {
      s.innerHTML = eiMarkup(RISS_MAX, true);
    } else {
      const stufe = Math.floor(RISS_MAX * (stand.training || 0) / TRAINING_ZIEL);
      s.innerHTML = eiMarkup(stufe, false);
    }
  },

  beiRichtig(el, profil, reihe) {
    const stand = profil.reihen[reihe];
    if (!stand.gemeistert) {
      this.zeichne(el, profil, reihe);
      const ei = el.querySelector('.ei');
      if (ei) { ei.classList.add('knackt'); setTimeout(() => ei.classList.remove('knackt'), 320); }
      sound.knack();
      return { gebaut: true, lob: 'Knack! 🥚' };
    }
    return { gebaut: false };
  },

  beiFalsch(el) {
    const ei = el.querySelector('.ei');
    if (ei) { ei.classList.add('ei-wackelt'); setTimeout(() => ei.classList.remove('ei-wackelt'), 400); }
  },

  beiPruefungBestanden(profil, reihe, fehler) {
    if (fehler === 0) profil.projekte.eierfarm.accessoires[reihe] = true;
  },

  belohnungLabel(reihe) { return `${TIERE[reihe].tier} ${TIERE[reihe].emoji}`; },
  belohnungAktion(reihe) { return `${TIERE[reihe].tier} schlüpfen lassen! ${TIERE[reihe].emoji}`; },
  belohnungHinweis() { return 'Im Tier-Stall zum Schlüpfen antippen!'; },

  belohnungVorschau(el, profil, reihe) {
    el.innerHTML = `<div class="ei-szene gewinn-ei">${eiMarkup(RISS_MAX - 1, false)}<div class="schlupf-peek">${TIERE[reihe].emoji}</div></div>`;
  },

  zeichneVorschau(el, profil) {
    el.innerHTML = familieGridMarkup(profil);
  },

  offeneBelohnungen(profil) {
    const ef = profil.projekte.eierfarm;
    let n = 0;
    for (let r = 1; r <= 10; r++) {
      if (profil.reihen[r] && profil.reihen[r].gemeistert && !ef.geschluepft[r]) n++;
    }
    return n;
  },

  zeichneSammlung(el, profil, ctx) {
    const ef = profil.projekte.eierfarm;
    el.innerHTML = `
      <p class="stall-hinweis">Tippe ein fertiges Ei zum Schlüpfen 🥚→🐣 — oder ein Tier zum Spielen 🐾<br>
        <small>0 Fehler in der Prüfung = Zubehör ${ACCESSOIRE} fürs Tier</small></p>
      <div class="familie-host"></div>`;
    const host = el.querySelector('.familie-host');

    function render() {
      host.innerHTML = familieGridMarkup(profil);
      host.querySelectorAll('.familie-zelle.schlupfbereit').forEach(zelle => {
        zelle.onclick = () => {
          const r = Number(zelle.dataset.reihe);
          ef.geschluepft[r] = true;
          ctx.store.update(profil);
          tierShow(el, profil, r, true, render);
        };
      });
      host.querySelectorAll('.familie-zelle.tier').forEach(zelle => {
        zelle.onclick = () => tierShow(el, profil, Number(zelle.dataset.reihe), false, null);
      });
    }
    render();
  },
};
