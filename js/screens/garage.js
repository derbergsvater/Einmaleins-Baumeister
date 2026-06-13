import { PARTS, ADDONS, addonsUnlocked, gemeisterteReihen } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar, montiereAddon, feiere } from '../ui/carRenderer.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

export function showGarage(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const bau = profil.projekte.rennwagen;
  const freigeschaltet = addonsUnlocked(profil.reihen);
  const montiert = new Set(bau.montierteAddons);
  const pokale = gemeisterteReihen(profil.reihen);

  root.innerHTML = `
    <div class="screen garage">
      <header>
        <button type="button" class="btn klein zurueck">← Zurück</button>
        <h2>🏁 Garage</h2>
        <span></span>
      </header>
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
      </div>
    </div>`;

  const buehne = root.querySelector('.auto-buehne');
  mountCar(buehne, RENNWAGEN_SVG);

  function speichern() {
    bau.montierteAddons = [...montiert];
    ctx.store.update(profil);
  }

  function zeichne() {
    updateCar(buehne, {
      teile: PARTS.slice(0, bau.grundbau).map(p => p.id),
      addons: [...montiert],
    });
  }

  // --- Drehteller-Steuerung (Faux-3D): Auto dreht sanft, lässt sich wischen ---
  let winkel = -20;
  let vel = 0.25;
  let ziehen = false;
  let letzteX = 0;
  let raf = 0;
  function frame() {
    if (!buehne.isConnected) { cancelAnimationFrame(raf); return; }
    if (!ziehen) {
      winkel += vel;
      vel += (0.25 - vel) * 0.04; // sanft zurück zur Leerlauf-Drehung
    }
    buehne.style.setProperty('--dreh', `${winkel.toFixed(1)}deg`);
    raf = requestAnimationFrame(frame);
  }
  const showroom = root.querySelector('.showroom');
  showroom.addEventListener('pointerdown', (e) => {
    ziehen = true; letzteX = e.clientX;
    showroom.setPointerCapture?.(e.pointerId);
  });
  showroom.addEventListener('pointermove', (e) => {
    if (!ziehen) return;
    const dx = e.clientX - letzteX;
    winkel += dx * 0.6;
    vel = dx * 0.12;
    letzteX = e.clientX;
  });
  function loslassen() { ziehen = false; }
  showroom.addEventListener('pointerup', loslassen);
  showroom.addEventListener('pointercancel', loslassen);
  showroom.addEventListener('pointerleave', loslassen);
  raf = requestAnimationFrame(frame);

  // --- Addon-Liste: anbauen / abbauen ---
  const liste = root.querySelector('.addon-liste');
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
      if (!offen) {
        btn.textContent = `🔒 ${addon.alleReihen ? 'Alle 10 Reihen!' : `${addon.reihe}er meistern`}`;
      } else if (!istMontiert) {
        btn.textContent = `✨ Anbauen: ${addon.label}`;
      } else {
        btn.textContent = `✅ ${addon.label}`;
      }
      if (offen) {
        btn.onclick = () => {
          if (montiert.has(addon.id)) {
            montiert.delete(addon.id);
            speichern();
            zeichne();
            zeichneListe();
          } else {
            montiert.add(addon.id);
            speichern();
            zeichne();
            montiereAddon(buehne, addon.id);
            feiere(buehne);
            sound.luftschrauber();
            feuerKonfetti(root, 40);
            zeichneListe();
          }
        };
      }
      liste.appendChild(btn);
    }
  }

  root.querySelector('.zurueck').onclick = () => navigate('hub');
  zeichne();
  zeichneListe();
}
