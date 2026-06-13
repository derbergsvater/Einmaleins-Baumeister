import { createExam, evalExam, naechsteReihe } from '../engine/progress.js';
import { loesung } from '../engine/tasks.js';
import { PARTS, addonFuerReihe } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar } from '../ui/carRenderer.js';
import { createNumpad } from '../ui/numpad.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

export function showPruefung(root, ctx, navigate, { reihe }) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const bau = profil.projekte.rennwagen;
  const gewinn = addonFuerReihe(reihe);
  const aufgaben = createExam(reihe);
  const ergebnisse = [];
  let index = 0;

  root.innerHTML = `
    <div class="screen pruefung">
      <header>
        <button type="button" class="btn klein abbrechen">✕</button>
        <span class="reihe-titel">🏆 Meisterprüfung: ${reihe}er</span>
        <span></span>
      </header>
      <div class="gewinn-vorschau">
        <div class="auto-buehne klein gewinn-buehne"></div>
        <p class="gewinn-text">🎁 Das gewinnst du: <strong>${gewinn.label}</strong></p>
      </div>
      <div class="punkte">${aufgaben.map(() => '<span class="punkt"></span>').join('')}</div>
      <div class="aufgabe"></div>
      <div class="numpad"></div>
    </div>`;

  // Vorschau: aktuelles Auto + der neue Gewinn golden pulsierend obendrauf
  const gewinnEl = root.querySelector('.gewinn-buehne');
  mountCar(gewinnEl, RENNWAGEN_SVG);
  updateCar(gewinnEl, {
    teile: PARTS.slice(0, bau.grundbau).map(p => p.id),
    addons: [...bau.montierteAddons, gewinn.id],
  });
  gewinnEl.querySelector(`#addon-${gewinn.id}`)?.classList.add('gewinn-glanz');

  const aufgabeEl = root.querySelector('.aufgabe');
  const punkte = [...root.querySelectorAll('.punkt')];

  function zeige() {
    const t = aufgaben[index];
    aufgabeEl.innerHTML = `<span class="term">${t.a} · ${t.b} = <span class="eingabe">?</span></span>`;
  }

  function fertig() {
    const { bestanden, fehler } = evalExam(ergebnisse);
    if (bestanden) {
      profil.reihen[reihe] = { ...(profil.reihen[reihe] || { training: 0 }), gemeistert: true };
      ctx.store.update(profil);
      const naechste = naechsteReihe(profil.reihen, reihe);
      sound.fanfare();
      root.innerHTML = `
        <div class="screen ergebnis">
          <h2>🏆 Gemeistert!</h2>
          <p class="gross-text">Du bist jetzt Meister der ${reihe}er-Reihe!</p>
          <p class="addon-neu">🎁 Gewonnen: <strong>${gewinn.label}</strong><br><small>Jetzt selbst in der Garage anbauen!</small></p>
          ${naechste ? '' : '<p class="gross-text">⭐ ALLE 10 Reihen gemeistert — du bist 1x1-MEISTER!</p>'}
          <button type="button" class="btn gross weiter">🏁 ${gewinn.label} anbauen!</button>
          ${naechste ? `<button type="button" class="btn weiter-reihe-btn">Weiter: ${naechste}er-Reihe 🔧</button>` : ''}
        </div>`;
      feuerKonfetti(root);
      root.querySelector('.weiter').onclick = () => navigate('garage');
      const reiheBtn = root.querySelector('.weiter-reihe-btn');
      if (reiheBtn) reiheBtn.onclick = () => navigate('werkstatt', { reihe: naechste });
    } else {
      root.innerHTML = `
        <div class="screen ergebnis">
          <h2>Fast geschafft!</h2>
          <p class="gross-text">${fehler} Fehler — beim nächsten Mal klappt es! Schrauber glaubt an dich. 💪</p>
          <button type="button" class="btn gross weiter">Weiter trainieren 🔧</button>
        </div>`;
      root.querySelector('.weiter').onclick = () => navigate('werkstatt', { reihe });
    }
  }

  createNumpad(root.querySelector('.numpad'), {
    onChange: (wert) => {
      const eingabe = aufgabeEl.querySelector('.eingabe');
      if (eingabe) eingabe.textContent = wert || '?';
    },
    erwarteteStellen: () => (index < aufgaben.length ? String(loesung(aufgaben[index])).length : 99),
    onSubmit: (wert) => {
      if (index >= aufgaben.length) return;
      const richtig = Number(wert) === loesung(aufgaben[index]);
      ergebnisse.push(richtig);
      punkte[index].classList.add(richtig ? 'ok' : 'nok');
      richtig ? sound.richtig() : sound.falsch();
      index++;
      if (index < aufgaben.length) {
        zeige();
      } else {
        setTimeout(fertig, 400);
      }
    },
  });

  root.querySelector('.abbrechen').onclick = () => navigate('werkstatt', { reihe });
  zeige();
}
