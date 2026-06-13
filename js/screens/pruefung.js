import { createExam, evalExam, naechsteReihe } from '../engine/progress.js';
import { loesung } from '../engine/tasks.js';
import { getProjekt } from '../projects/registry.js';
import { createNumpad } from '../ui/numpad.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

export function showPruefung(root, ctx, navigate, { reihe }) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const projekt = getProjekt(profil.aktivesProjekt);
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
        <div class="projekt-buehne klein gewinn-buehne"></div>
        <p class="gewinn-text">🎁 Das gewinnst du: <strong>${projekt.belohnungLabel(reihe)}</strong></p>
      </div>
      <div class="punkte">${aufgaben.map(() => '<span class="punkt"></span>').join('')}</div>
      <div class="aufgabe"></div>
      <div class="numpad"></div>
    </div>`;

  projekt.belohnungVorschau(root.querySelector('.gewinn-buehne'), profil, reihe);

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
      projekt.beiPruefungBestanden(profil, reihe, fehler);
      ctx.store.update(profil);
      const naechste = naechsteReihe(profil.reihen, reihe);
      sound.fanfare();
      root.innerHTML = `
        <div class="screen ergebnis">
          <h2>🏆 Gemeistert!</h2>
          <p class="gross-text">Du bist jetzt Meister der ${reihe}er-Reihe!</p>
          <p class="addon-neu">🎁 Gewonnen: <strong>${projekt.belohnungLabel(reihe)}</strong><br><small>${projekt.belohnungHinweis()}</small></p>
          ${fehler === 0 ? '<p class="bonus-text">⭐ Perfekt — 0 Fehler! Bonus verdient!</p>' : ''}
          ${naechste ? '' : '<p class="gross-text">⭐ ALLE 10 Reihen gemeistert — du bist 1x1-MEISTER!</p>'}
          <button type="button" class="btn gross weiter">${projekt.sammlungIcon} ${projekt.belohnungAktion(reihe)}</button>
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
