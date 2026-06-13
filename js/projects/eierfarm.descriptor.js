// Eierfarm als Projekt-Descriptor (gleiche Schnittstelle wie der Rennwagen).
// Nutzt dieselben Reihen-Trainings-/Meister-Daten; eigene Visuals (Eier/Tiere).
import { TIERE, ACCESSOIRE, RISS_MAX, eiMarkup, tierMarkup, familieGridMarkup } from './eierfarm.js';
import { TRAINING_ZIEL } from '../engine/progress.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

function szene(el) { return el.querySelector('.ei-szene'); }

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
      <p class="stall-hinweis">Tippe ein fertiges Ei zum Schlüpfen! 🥚→🐣<br>
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
          sound.knack();
          sound.fanfare();
          feuerKonfetti(el, 50);
          render();
        };
      });
    }
    render();
  },
};
