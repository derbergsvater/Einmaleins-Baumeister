import { pickTask, taskKey, loesung } from '../engine/tasks.js';
import { applyAnswer, pruefungBereit, TRAINING_ZIEL, comboStufe } from '../engine/progress.js';
import { PARTS, addonsUnlocked, addonFuerReihe } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar, montiere, zeigeVorschau, wackel } from '../ui/carRenderer.js';
import { createNumpad } from '../ui/numpad.js';
import { createSchrauber } from '../ui/schrauber.js';
import { sound } from '../audio.js';

export function showWerkstatt(root, ctx, navigate, { reihe }) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  if (!profil.reihen[reihe]) profil.reihen[reihe] = { training: 0, gemeistert: false };
  const stand = profil.reihen[reihe];

  let streak = 0;
  let wrongStreak = 0;
  let lastKey = null;
  let aufgabe = null;
  let gesperrt = false; // blockt Eingaben während Feedback-Animation
  let numpad = null;

  root.innerHTML = `
    <div class="screen werkstatt">
      <header>
        <button type="button" class="btn klein zurueck">← Reihen</button>
        <span class="reihe-titel">${reihe}er-Reihe</span>
        <span class="combo"></span>
      </header>
      <div class="auto-buehne"></div>
      <div class="status-zeile">
        <div class="schrauber-ecke"></div>
        <div class="balken gross"><span class="fuellung"></span></div>
      </div>
      <button type="button" class="btn gross pruefung-knopf verborgen">🏆 Zur Meisterprüfung!</button>
      <div class="aufgabe"></div>
      <div class="numpad"></div>
    </div>`;

  const buehne = root.querySelector('.auto-buehne');
  mountCar(buehne, RENNWAGEN_SVG);
  const schrauber = createSchrauber(root.querySelector('.schrauber-ecke'));
  const aufgabeEl = root.querySelector('.aufgabe');
  const comboEl = root.querySelector('.combo');
  const fuellungEl = root.querySelector('.balken .fuellung');
  const pruefungBtn = root.querySelector('.pruefung-knopf');

  function zeichneAuto() {
    updateCar(buehne, {
      teile: PARTS.slice(0, profil.projekte.rennwagen.grundbau).map(p => p.id),
      addons: addonsUnlocked(profil.reihen),
    });
  }

  function zeichneStatus() {
    fuellungEl.style.width = `${Math.min(100, Math.round((100 * stand.training) / TRAINING_ZIEL))}%`;
    const stufe = comboStufe(streak);
    comboEl.textContent = stufe > 1 ? `🔥 x${stufe}` : '';
    pruefungBtn.classList.toggle('verborgen', !pruefungBereit(stand.training) || stand.gemeistert);
    const addon = addonFuerReihe(reihe);
    if (addon) zeigeVorschau(buehne, addon.id, stand.training / TRAINING_ZIEL);
  }

  function naechsteAufgabe() {
    aufgabe = pickTask({ reihe, stats: profil.aufgabenStats, lastKey, wrongStreak });
    lastKey = taskKey(aufgabe);
    gesperrt = false;
    aufgabeEl.classList.remove('richtig', 'zeigt-loesung');
    aufgabeEl.innerHTML = `<span class="term">${aufgabe.a} · ${aufgabe.b} = <span class="eingabe">?</span></span>`;
    numpad?.reset();
  }

  function antwort(wert) {
    if (gesperrt) return;
    gesperrt = true;
    const key = taskKey(aufgabe);
    const s = profil.aufgabenStats[key] || (profil.aufgabenStats[key] = { richtig: 0, falsch: 0 });
    const richtig = Number(wert) === loesung(aufgabe);

    if (richtig) {
      s.richtig++;
      wrongStreak = 0;
      const neu = applyAnswer({ training: stand.training, streak }, true);
      stand.training = neu.training;
      streak = neu.streak;
      aufgabeEl.querySelector('.eingabe').textContent = wert;
      aufgabeEl.classList.add('richtig');
      navigator.vibrate?.(30);

      const bau = profil.projekte.rennwagen;
      if (bau.grundbau < PARTS.length) {
        bau.grundbau++;
        zeichneAuto();
        montiere(buehne, PARTS[bau.grundbau - 1].id);
        sound.montage();
        schrauber.setMood('jubel');
      } else {
        sound.richtig();
        wackel(buehne);
        if (neu.punkte > 1) schrauber.setMood('jubel');
      }
      ctx.store.update(profil);
      zeichneStatus();
      setTimeout(naechsteAufgabe, 750);
    } else {
      s.falsch++;
      streak = 0;
      wrongStreak++;
      sound.falsch();
      schrauber.setMood('trost');
      aufgabeEl.querySelector('.eingabe').textContent = loesung(aufgabe);
      aufgabeEl.classList.add('zeigt-loesung');
      ctx.store.update(profil);
      zeichneStatus();
      setTimeout(naechsteAufgabe, 1700);
    }
  }

  numpad = createNumpad(root.querySelector('.numpad'), {
    onChange: (wert) => {
      if (gesperrt) return;
      const eingabe = aufgabeEl.querySelector('.eingabe');
      if (eingabe) eingabe.textContent = wert || '?';
    },
    onSubmit: antwort,
    erwarteteStellen: () => (aufgabe ? String(loesung(aufgabe)).length : 99),
  });

  root.querySelector('.zurueck').onclick = () => navigate('hub');
  pruefungBtn.onclick = () => navigate('pruefung', { reihe });

  zeichneAuto();
  zeichneStatus();
  naechsteAufgabe();
}
