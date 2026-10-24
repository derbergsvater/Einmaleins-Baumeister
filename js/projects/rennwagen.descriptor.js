// Rennwagen als Projekt-Descriptor: implementiert die einheitliche Schnittstelle,
// die alle Screens nutzen (mountBuehne/zeichne/beiRichtig/… siehe registry.js).
import { PARTS, ADDONS, addonsUnlocked, addonFuerReihe, gemeisterteReihen } from './rennwagen.js';
import { RENNWAGEN_SVG } from './rennwagen.svg.js';
import { mountCar, updateCar, montiere, montiereAddon, zeigeVorschau, wackel, warneTeil, feiere } from '../ui/carRenderer.js';
import { TRAINING_ZIEL } from '../engine/progress.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

function auto(el) { return el.querySelector('.auto-buehne'); }

export const rennwagenProjekt = {
  id: 'rennwagen',
  name: 'Rennwagen',
  emoji: '🏎️',
  slogan: 'Rechne richtig — bau deinen Rennwagen!',
  sammlungName: 'Garage',
  sammlungIcon: '🏁',

  mountBuehne(el) {
    el.innerHTML = '<div class="auto-buehne"></div>';
    mountCar(auto(el), RENNWAGEN_SVG);
  },

  zeichne(el, profil, reihe) {
    const bau = profil.projekte.rennwagen;
    updateCar(auto(el), {
      teile: PARTS.slice(0, bau.grundbau).map(p => p.id),
      addons: bau.montierteAddons,
    });
    const stand = profil.reihen[reihe];
    const addon = addonFuerReihe(reihe);
    if (addon && stand && !stand.gemeistert) {
      zeigeVorschau(auto(el), addon.id, (stand.training || 0) / TRAINING_ZIEL);
    }
  },

  beiRichtig(el, profil, reihe) {
    const bau = profil.projekte.rennwagen;
    if (bau.grundbau < PARTS.length) {
      bau.grundbau++;
      this.zeichne(el, profil, reihe);
      montiere(auto(el), PARTS[bau.grundbau - 1].id);
      sound.montage();
      return { gebaut: true, lob: `${PARTS[bau.grundbau - 1].label} montiert! 🔧` };
    }
    this.zeichne(el, profil, reihe); // Bauplan-Vorschau wächst weiter, auch bei fertigem Grundbau
    wackel(auto(el));
    return { gebaut: false };
  },

  beiFalsch(el, profil) {
    const bau = profil.projekte.rennwagen;
    const id = bau.montierteAddons.at(-1) || (bau.grundbau > 0 ? PARTS[bau.grundbau - 1].id : null);
    if (id) warneTeil(auto(el), id);
  },

  beiPruefungBestanden() { /* Addon wird über reihen.gemeistert freigeschaltet, kein Extra nötig */ },

  belohnungFrei(profil, reihe) { return addonsUnlocked(profil.reihen).includes(addonFuerReihe(reihe).id); },
  belohnungLabel(reihe) { return addonFuerReihe(reihe).label; },
  belohnungAktion(reihe) { return `${addonFuerReihe(reihe).label} anbauen!`; },
  belohnungHinweis() { return 'Jetzt selbst in der Garage anbauen!'; },

  belohnungVorschau(el, profil, reihe) {
    el.innerHTML = '<div class="auto-buehne"></div>';
    mountCar(auto(el), RENNWAGEN_SVG);
    const bau = profil.projekte.rennwagen;
    const addon = addonFuerReihe(reihe);
    updateCar(auto(el), {
      teile: PARTS.slice(0, bau.grundbau).map(p => p.id),
      addons: [...bau.montierteAddons, addon.id],
    });
    auto(el).querySelector(`#addon-${addon.id}`)?.classList.add('gewinn-glanz');
  },

  zeichneVorschau(el, profil) {
    el.innerHTML = '<div class="auto-buehne"></div>';
    mountCar(auto(el), RENNWAGEN_SVG);
    const bau = profil.projekte.rennwagen;
    updateCar(auto(el), {
      teile: PARTS.slice(0, bau.grundbau).map(p => p.id),
      addons: bau.montierteAddons,
    });
  },

  offeneBelohnungen(profil) {
    const m = profil.projekte.rennwagen.montierteAddons;
    return addonsUnlocked(profil.reihen).filter(id => !m.includes(id)).length;
  },

  zeichneSammlung(el, profil, ctx) {
    const bau = profil.projekte.rennwagen;
    const freigeschaltet = addonsUnlocked(profil.reihen);
    const montiert = new Set(bau.montierteAddons);
    const pokale = gemeisterteReihen(profil.reihen);

    el.innerHTML = `
      <div class="showroom">
        <div class="drehteller"></div>
        <div class="auto-buehne dreh"></div>
      </div>
      <p class="dreh-hinweis">↔ Zum Drehen wischen</p>
      <h3>Bau dein Auto aus 🔧</h3>
      <div class="addon-liste"></div>
      <h3>Pokal-Regal</h3>
      <div class="pokal-regal">
        ${Array.from({ length: 10 }, (_, i) => `
          <span class="pokal-platz ${pokale.includes(i + 1) ? 'gewonnen' : ''}">
            <span class="pokal-icon">${pokale.includes(i + 1) ? '🏆' : '·'}</span>
            <small>${i + 1}er</small>
          </span>`).join('')}
      </div>`;

    const buehne = el.querySelector('.auto-buehne');
    mountCar(buehne, RENNWAGEN_SVG);

    function speichern() { bau.montierteAddons = [...montiert]; ctx.store.update(profil); }
    function zeichne() {
      updateCar(buehne, { teile: PARTS.slice(0, bau.grundbau).map(p => p.id), addons: [...montiert] });
    }

    // Drehteller (Faux-3D)
    const grundDreh = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.25;
    let winkel = -20, vel = grundDreh, ziehen = false, letzteX = 0, raf = 0;
    function frame() {
      if (!buehne.isConnected) { cancelAnimationFrame(raf); return; }
      if (!ziehen) { winkel += vel; vel += (grundDreh - vel) * 0.04; }
      buehne.style.setProperty('--dreh', `${winkel.toFixed(1)}deg`);
      raf = requestAnimationFrame(frame);
    }
    const showroom = el.querySelector('.showroom');
    showroom.addEventListener('pointerdown', (e) => { ziehen = true; letzteX = e.clientX; showroom.setPointerCapture?.(e.pointerId); });
    showroom.addEventListener('pointermove', (e) => { if (!ziehen) return; winkel += (e.clientX - letzteX) * 0.6; vel = (e.clientX - letzteX) * 0.12; letzteX = e.clientX; });
    const los = () => { ziehen = false; };
    showroom.addEventListener('pointerup', los);
    showroom.addEventListener('pointercancel', los);
    showroom.addEventListener('pointerleave', los);
    raf = requestAnimationFrame(frame);

    const liste = el.querySelector('.addon-liste');
    function zeichneListe() {
      liste.innerHTML = '';
      for (const addon of ADDONS) {
        const offen = freigeschaltet.includes(addon.id);
        const istMontiert = montiert.has(addon.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn addon-knopf'
          + (!offen ? ' gesperrt' : '')
          + (offen && !istMontiert ? ' neu' : '')
          + (istMontiert ? ' montiert' : '');
        btn.textContent = !offen
          ? `🔒 ${addon.alleReihen ? 'Alle 10 Reihen!' : `${addon.reihe}er meistern`}`
          : (istMontiert ? `✅ ${addon.label}` : `✨ Anbauen: ${addon.label}`);
        if (offen) {
          btn.onclick = () => {
            if (montiert.has(addon.id)) {
              montiert.delete(addon.id); speichern(); zeichne(); zeichneListe();
            } else {
              montiert.add(addon.id); speichern(); zeichne();
              montiereAddon(buehne, addon.id); feiere(buehne); sound.luftschrauber(); feuerKonfetti(el, 40);
              zeichneListe();
            }
          };
        }
        liste.appendChild(btn);
      }
    }

    zeichne();
    zeichneListe();
  },
};
