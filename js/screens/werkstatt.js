import { pickTask, taskKey, normKey, loesung } from '../engine/tasks.js';
import { applyAnswer, pruefungBereit, TRAINING_ZIEL, comboStufe, naechsteReihe } from '../engine/progress.js';
import { getProjekt } from '../projects/registry.js';
import { createNumpad } from '../ui/numpad.js';
import { createSchrauber } from '../ui/schrauber.js';
import { zeigeTipp } from '../ui/tipp.js';
import { sound } from '../audio.js';

const TIPP_NACH_MS = 10000; // so lange ohne Eingabe, dann wackelt die Glühbirne

export function showWerkstatt(root, ctx, navigate, { reihe }) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const projekt = getProjekt(profil.aktivesProjekt);
  if (!profil.reihen[reihe]) profil.reihen[reihe] = { training: 0, gemeistert: false };
  const stand = profil.reihen[reihe];
  const naechsteOffene = naechsteReihe(profil.reihen, reihe);

  let streak = 0;
  let wrongStreak = 0;
  let erholung = 0; // Frust-Bremse: so viele sichere Aufgaben kommen noch (KONZEPT 3.4 Punkt 5)
  let letzte = [];
  let aufgabe = null;
  let gesperrt = false;
  let numpad = null;
  let tippUhr = null;
  let tippGenutzt = false;

  root.innerHTML = `
    <div class="screen werkstatt">
      <header>
        <button type="button" class="btn klein zurueck">← Reihen</button>
        <span class="reihe-titel">${reihe}er-Reihe</span>
        <span class="combo"></span>
      </header>
      <div class="spalte-links">
      <div class="tipp-karte"></div>
      <div class="projekt-buehne"></div>
      ${stand.gemeistert ? `
      <div class="gemeistert-banner">
        <span>🏆 Schon gemeistert!</span>
        ${naechsteOffene
          ? `<button type="button" class="btn klein weiter-reihe">Weiter: ${naechsteOffene}er →</button>`
          : '<span>Alle Reihen geschafft! 🎉</span>'}
      </div>` : ''}
      <div class="status-zeile">
        <div class="schrauber-ecke"></div>
        <div class="balken gross"><span class="fuellung"></span></div>
      </div>
      <button type="button" class="btn gross pruefung-knopf verborgen">🏆 Zur Meisterprüfung!</button>
      </div>
      <div class="spalte-rechts">
        <div class="aufgabe"></div>
        <div class="numpad"></div>
      </div>
    </div>`;

  const buehne = root.querySelector('.projekt-buehne');
  projekt.mountBuehne(buehne);
  const schrauber = createSchrauber(root.querySelector('.schrauber-ecke'));
  const aufgabeEl = root.querySelector('.aufgabe');
  const comboEl = root.querySelector('.combo');
  const fuellungEl = root.querySelector('.balken .fuellung');
  const pruefungBtn = root.querySelector('.pruefung-knopf');
  const screenEl = root.querySelector('.werkstatt');
  const tippEl = root.querySelector('.tipp-karte');

  // Glühbirne: 10 s ohne Eingabe → sie leuchtet und wackelt, Antippen öffnet den Tipp
  function starteTippUhr() {
    clearTimeout(tippUhr);
    const birne = aufgabeEl.querySelector('.birne');
    if (!birne || birne.classList.contains('leuchtet')) return;
    tippUhr = setTimeout(() => {
      if (gesperrt || !birne.isConnected) return;
      birne.classList.add('leuchtet');
      birne.disabled = false;
    }, TIPP_NACH_MS);
  }

  function oeffneTipp(mitLoesung) {
    screenEl.classList.add('tipp-offen');
    zeigeTipp(tippEl, aufgabe, { mitLoesung, onZu: mitLoesung ? naechsteAufgabe : schliesseTipp });
  }

  function schliesseTipp() {
    screenEl.classList.remove('tipp-offen');
    tippEl.innerHTML = '';
  }

  function zeigeLob(text, klasse = '') {
    const lob = document.createElement('span');
    lob.className = `lob ${klasse}`;
    lob.textContent = text;
    lob.style.left = `calc(50% + ${Math.round((Math.random() - 0.5) * 60)}px)`;
    buehne.appendChild(lob);
    lob.addEventListener('animationend', () => lob.remove());
  }

  function zeichneStatus() {
    fuellungEl.style.width = `${Math.min(100, Math.round((100 * stand.training) / TRAINING_ZIEL))}%`;
    const stufe = comboStufe(streak);
    comboEl.textContent = stufe > 1 ? `🔥 x${stufe}` : '';
    // Gemeisterte Reihe: Prüfung nur noch, wenn das Projekt für 0 Fehler einen Bonus vergibt, der noch fehlt
    const bonusPruefung = stand.gemeistert && !stand.perfekt && projekt.perfektBonus;
    pruefungBtn.textContent = bonusPruefung ? `⭐ Perfekt-Prüfung: ${projekt.perfektBonus} holen!` : '🏆 Zur Meisterprüfung!';
    pruefungBtn.classList.toggle('verborgen', !bonusPruefung && (!pruefungBereit(stand.training) || stand.gemeistert));
  }

  function naechsteAufgabe() {
    aufgabe = pickTask({ reihe, stats: profil.aufgabenStats, letzte, wrongStreak: erholung > 0 ? 3 : wrongStreak, training: stand.training });
    letzte = [normKey(aufgabe), ...letzte].slice(0, 3);
    gesperrt = false;
    aufgabeEl.classList.remove('richtig', 'zeigt-loesung');
    aufgabeEl.innerHTML = `<span class="term">${aufgabe.a} · ${aufgabe.b} = <span class="eingabe">?</span></span>
      <button type="button" class="birne" disabled aria-label="Tipp">💡</button>`;
    aufgabeEl.querySelector('.birne').onclick = () => {
      if (screenEl.classList.contains('tipp-offen')) { schliesseTipp(); return; }
      tippGenutzt = true;
      oeffneTipp(false);
    };
    tippGenutzt = false;
    schliesseTipp();
    numpad?.reset();
    starteTippUhr();
  }

  function antwort(wert) {
    if (gesperrt) return;
    gesperrt = true;
    clearTimeout(tippUhr);
    schliesseTipp(); // Bühne wieder zeigen, damit das Kind den Einbau sieht
    const key = taskKey(aufgabe);
    const s = profil.aufgabenStats[key] || (profil.aufgabenStats[key] = { richtig: 0, falsch: 0 });
    const richtig = Number(wert) === loesung(aufgabe);

    if (richtig) {
      if (!tippGenutzt) s.richtig++; // mit Tipp gelöst zählt fürs Training, gilt aber noch nicht als sicher
      wrongStreak = 0;
      if (erholung > 0) erholung--;
      const stufeVorher = comboStufe(streak);
      const warBereit = pruefungBereit(stand.training);
      const neu = applyAnswer({ training: stand.training, streak }, true);
      stand.training = neu.training;
      streak = neu.streak;
      const stufeJetzt = comboStufe(streak);
      aufgabeEl.querySelector('.eingabe').textContent = wert;
      aufgabeEl.classList.add('richtig');
      sound.vibriere(30);

      const res = projekt.beiRichtig(buehne, profil, reihe, { punkte: neu.punkte, streak }) || {};
      if (res.gebaut) schrauber.setMood('jubel');
      else sound.richtig(streak);
      zeigeLob(res.lob || `+${neu.punkte}`);

      if (stufeJetzt > stufeVorher) {
        zeigeLob(`🔥 COMBO x${stufeJetzt}!`, 'mega');
        sound.combo();
        schrauber.setMood('jubel');
      }
      if (!warBereit && pruefungBereit(stand.training) && !stand.gemeistert) {
        zeigeLob('Bereit zur Meisterprüfung! 🏆', 'mega');
        sound.combo();
      }
      ctx.store.update(profil);
      zeichneStatus();
      setTimeout(naechsteAufgabe, 750);
    } else {
      s.falsch++;
      streak = 0;
      wrongStreak++;
      if (wrongStreak >= 3) erholung = 2;
      sound.falsch();
      schrauber.setMood('trost');
      projekt.beiFalsch(buehne, profil, reihe);
      zeigeLob('Festhalten! 🔧', 'warn');
      aufgabeEl.querySelector('.eingabe').textContent = loesung(aufgabe);
      aufgabeEl.classList.add('zeigt-loesung');
      ctx.store.update(profil);
      zeichneStatus();
      // Statt nur die Lösung zu blitzen: Rechenweg im Punktefeld zeigen, Kind tippt „Weiter“
      setTimeout(() => { if (aufgabeEl.isConnected) oeffneTipp(true); }, 600);
    }
  }

  numpad = createNumpad(root.querySelector('.numpad'), {
    onChange: (wert) => {
      if (gesperrt) return;
      starteTippUhr();
      const eingabe = aufgabeEl.querySelector('.eingabe');
      if (eingabe) eingabe.textContent = wert || '?';
    },
    onSubmit: antwort,
    erwarteteStellen: () => (aufgabe ? String(loesung(aufgabe)).length : 99),
  });

  root.querySelector('.zurueck').onclick = () => navigate('hub');
  pruefungBtn.onclick = () => navigate('pruefung', { reihe });
  const weiterBtn = root.querySelector('.weiter-reihe');
  if (weiterBtn) weiterBtn.onclick = () => navigate('werkstatt', { reihe: naechsteOffene });

  projekt.zeichne(buehne, profil, reihe);
  zeichneStatus();
  naechsteAufgabe();
}
