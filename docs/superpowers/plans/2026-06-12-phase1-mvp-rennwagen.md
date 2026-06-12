# 1x1 Baumeister — Phase 1 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spielbarer MVP von „1x1 Baumeister": Profile, adaptive Aufgaben-Engine, Werkstatt-Modus mit Rennwagen-Bau, Meisterprüfung mit Addon-Freischaltung, Garage.

**Architecture:** Vanilla JS (ES-Module) ohne Build-Tool und ohne Backend. Spiellogik (Aufgaben, Fortschritt, Profile, Projekt-Definition) liegt als pure functions in `js/engine/`, `js/store/`, `js/projects/` und wird mit `node --test` getestet. Screens sind dünne DOM-Module, die nur verdrahten. Der Rennwagen ist EIN SVG mit benannten Gruppen (`teil-*`, `addon-*`), die per CSS-Klasse `sichtbar` eingeblendet werden.

**Tech Stack:** HTML/CSS/JS (ES-Module), SVG, localStorage, WebAudio (synthetisierte Sounds, keine Audiodateien), `node --test` (Node ≥ 20). Kein npm-Paket, keine Abhängigkeiten.

**Maßgebliche Spec:** `KONZEPT.md` (Abschnitte 3.x, 4, 5, 6).

---

## Arbeitsumgebung

- Projektwurzel: `/mnt/c/Users/StefanBerg/Documents/GitHub/Einmaleins-Baumeister/`
- Alle Pfade in diesem Plan sind relativ zur Projektwurzel. Alle Befehle dort ausführen.
- Tests laufen mit `npm test` (= `node --test tests/`). Es gibt keine Abhängigkeiten, kein `npm install` nötig.
- Manueller Browser-Test: `python3 -m http.server 8080` starten, dann `http://localhost:8080` öffnen (ES-Module funktionieren nicht über `file://`). Mobile Ansicht über DevTools-Geräteemulation (z. B. iPhone SE, 375×667).
- Commits: deutsche Messages, nur die genannten Dateien stagen (kein `git add -A`).

## Datei-Landkarte (Endzustand Phase 1)

```
index.html                      Einstieg, lädt css + js/app.js
package.json                    type:module + test-Script (keine Dependencies)
css/styles.css                  Komplettes Styling inkl. Animationen
js/app.js                       Screen-Router, Init
js/audio.js                     WebAudio-Synth-Sounds (richtig/falsch/montage/fanfare)
js/engine/tasks.js              Aufgabenpool, adaptive Auswahl (Anker, Gewichtung, Frust-Bremse)
js/engine/progress.js           Trainingsbalken, Combo, Meisterprüfungs-Logik
js/store/profiles.js            Profil-CRUD auf localStorage (Storage injizierbar)
js/projects/rennwagen.js        Teile-/Addon-Definition, Freischalt-Logik
js/projects/rennwagen.svg.js    Rennwagen-SVG als Template-String
js/ui/carRenderer.js            SVG einhängen, Teile/Addons ein-/ausblenden, Montage-Animation
js/ui/numpad.js                 Touch-Ziffernblock
js/ui/schrauber.js              Maskottchen „Schrauber" (SVG-Roboter, Stimmungen, Sprüche)
js/ui/confetti.js               Konfetti-Effekt
js/screens/start.js             Profilwahl + Profil anlegen (Name + Avatar)
js/screens/hub.js               Reihen-Übersicht (Trainingsbalken, Pokale), Einstieg Garage
js/screens/werkstatt.js         Kernschleife: Aufgabe → Antwort → Bauteil-Montage
js/screens/pruefung.js          Meisterprüfung (12 Aufgaben, max. 1 Fehler) + Ergebnis
js/screens/garage.js            Auto mit Addons (an-/abschaltbar), Pokal-Regal
tests/tasks.test.mjs            Engine: Pool + adaptive Auswahl
tests/progress.test.mjs         Engine: Combo, Training, Prüfung
tests/profiles.test.mjs         Store (mit Fake-Storage)
tests/rennwagen.test.mjs        Projekt-Definition + Freischalt-Logik + SVG-Vollständigkeit
```

**Zentrale Datenform — Profil (localStorage-Key `baumeister.v1`):**

```json
{
  "profiles": {
    "p1_ella": {
      "id": "p1_ella",
      "name": "Ella",
      "avatar": "🦄",
      "aktivesProjekt": "rennwagen",
      "reihen": { "4": { "training": 14, "gemeistert": false } },
      "aufgabenStats": { "4x7": { "richtig": 5, "falsch": 3 } },
      "projekte": { "rennwagen": { "grundbau": 8 } }
    }
  },
  "activeId": "p1_ella"
}
```

---

### Task 1: Projekt-Gerüst (HTML, package.json, Router, Basis-CSS)

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`
- Create: `.gitignore`

Noch keine Tests (kein logiktragender Code) — der Router wird in Task 10–14 durch die Screens manuell mitgetestet. `js/app.js` importiert die Screens erst ab Task 10; bis dahin zeigt er einen Platzhalter.

- [ ] **Step 1: package.json anlegen**

```json
{
  "name": "einmaleins-baumeister",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: .gitignore anlegen**

```
node_modules/
*.log
```

- [ ] **Step 3: index.html anlegen**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#1b2432">
  <title>1x1 Baumeister</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <main id="app"></main>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: js/app.js anlegen (Router-Skelett mit Platzhalter)**

```js
// Screen-Router: Screens registrieren sich hier, navigate() tauscht den Inhalt.
// Die Screen-Importe kommen in späteren Tasks dazu.
const screens = {};
const root = document.getElementById('app');
const ctx = {};

export function navigate(name, params = {}) {
  const screen = screens[name];
  root.innerHTML = '';
  root.dataset.screen = name;
  if (screen) {
    screen(root, ctx, navigate, params);
  } else {
    root.innerHTML = `<div class="screen"><h1>1x1 Baumeister</h1><p>Baustelle: Screen „${name}" kommt noch. 🔧</p></div>`;
  }
}

navigate('start');
```

- [ ] **Step 5: css/styles.css anlegen (Basis: Variablen, Reset, Layout, Buttons)**

```css
/* ===== Variablen & Reset ===== */
:root {
  --bg: #fdf6e3;
  --bg-akzent: #ffe8c2;
  --tinte: #1b2432;
  --rot: #d62828;
  --gelb: #ffd166;
  --gruen: #06d6a0;
  --blau: #118ab2;
  --grau: #8d99ae;
  --radius: 18px;
  --schatten: 0 4px 0 rgba(27, 36, 50, 0.18);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body {
  font-family: "Comic Sans MS", "Segoe UI", system-ui, sans-serif;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-akzent) 100%);
  color: var(--tinte);
  min-height: 100dvh;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}
#app { max-width: 560px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; }

/* ===== Screens & Typo ===== */
.screen { flex: 1; display: flex; flex-direction: column; padding: 16px; gap: 14px; }
.screen header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
h1 { font-size: 2rem; text-align: center; }
h2 { font-size: 1.4rem; }
h3 { font-size: 1.1rem; }
.slogan { text-align: center; font-size: 1.1rem; }

/* ===== Buttons ===== */
.btn {
  font: inherit; font-size: 1.15rem; font-weight: bold;
  color: var(--tinte); background: #fff;
  border: 3px solid var(--tinte); border-radius: var(--radius);
  box-shadow: var(--schatten);
  padding: 12px 18px; cursor: pointer;
  transition: transform 0.08s ease-out;
}
.btn:active { transform: translateY(3px); box-shadow: none; }
.btn.gross { font-size: 1.4rem; padding: 16px 24px; background: var(--gelb); }
.btn.klein { font-size: 1rem; padding: 8px 12px; }
.verborgen { display: none !important; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 6: Syntax prüfen und manuell sichten**

Run: `node --check js/app.js`
Expected: kein Syntaxfehler. (`npm test` funktioniert erst ab Task 2, wenn `tests/` existiert.)

Dann `python3 -m http.server 8080` starten, `http://localhost:8080` öffnen: Platzhalter-Screen „Baustelle: Screen „start" kommt noch" erscheint auf beigem Hintergrund.

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore index.html css/styles.css js/app.js
git commit -m "Gerüst: HTML, Router-Skelett, Basis-Styles, Test-Setup"
```

---

### Task 2: Aufgabenpool (engine/tasks.js — Teil 1)

**Files:**
- Create: `js/engine/tasks.js`
- Create: `tests/tasks.test.mjs`

Der Pool einer Reihe enthält die Reihe selbst (z. B. 4·1 … 4·10) plus alle Tauschaufgaben (n·4 für n ≠ 4) → genau 19 Aufgaben. Eine Aufgabe ist `{ a, b }`, ihr Schlüssel `"4x7"`.

- [ ] **Step 1: Failing Tests schreiben**

`tests/tasks.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPool, taskKey, loesung, istAnker } from '../js/engine/tasks.js';

test('buildPool liefert 19 eindeutige Aufgaben inkl. Tauschaufgaben', () => {
  const pool = buildPool(4);
  assert.equal(pool.length, 19);
  assert.equal(new Set(pool.map(taskKey)).size, 19);
  assert.ok(pool.some(t => t.a === 4 && t.b === 7), '4·7 fehlt');
  assert.ok(pool.some(t => t.a === 7 && t.b === 4), 'Tauschaufgabe 7·4 fehlt');
  assert.ok(pool.every(t => t.a === 4 || t.b === 4), 'Aufgabe ohne Bezug zur Reihe');
});

test('taskKey und loesung', () => {
  assert.equal(taskKey({ a: 4, b: 7 }), '4x7');
  assert.equal(taskKey({ a: 7, b: 4 }), '7x4');
  assert.equal(loesung({ a: 7, b: 8 }), 56);
});

test('istAnker erkennt 1, 2, 5, 10 als leichten Partner-Faktor', () => {
  assert.ok(istAnker({ a: 4, b: 5 }, 4));
  assert.ok(istAnker({ a: 10, b: 4 }, 4));
  assert.ok(!istAnker({ a: 4, b: 7 }, 4));
  assert.ok(!istAnker({ a: 7, b: 4 }, 4));
});
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm test`
Expected: FAIL — `Cannot find module .../js/engine/tasks.js`

- [ ] **Step 3: Implementierung**

`js/engine/tasks.js`:

```js
// Aufgaben-Engine: pure functions, kein DOM. Eine Aufgabe ist { a, b }.
export const ANKER = [1, 2, 5, 10];

export function taskKey(t) {
  return `${t.a}x${t.b}`;
}

export function loesung(t) {
  return t.a * t.b;
}

// Pool einer Reihe: reihe·1..10 plus Tauschaufgaben n·reihe (n ≠ reihe) → 19 Aufgaben
export function buildPool(reihe) {
  const pool = [];
  for (let n = 1; n <= 10; n++) {
    pool.push({ a: reihe, b: n });
    if (n !== reihe) pool.push({ a: n, b: reihe });
  }
  return pool;
}

// Der "Partner-Faktor" ist der Faktor, der nicht die Reihe ist (bei reihe·reihe: die Reihe selbst)
function partnerFaktor(t, reihe) {
  return t.a === reihe ? t.b : t.a;
}

export function istAnker(t, reihe) {
  return ANKER.includes(partnerFaktor(t, reihe));
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm test`
Expected: PASS (3 Tests)

- [ ] **Step 5: Commit**

```bash
git add js/engine/tasks.js tests/tasks.test.mjs
git commit -m "Engine: Aufgabenpool mit Tauschaufgaben und Anker-Erkennung"
```

---

### Task 3: Adaptive Aufgabenauswahl (engine/tasks.js — Teil 2)

**Files:**
- Modify: `js/engine/tasks.js`
- Modify: `tests/tasks.test.mjs`

`pickTask()` setzt KONZEPT §3.4 um: Anker-Phase am Reihen-Anfang, Gewichtung schwacher Aufgaben, Frust-Bremse nach 3 Fehlern in Folge, keine direkte Wiederholung. Der Zufall (`rng`) ist injizierbar, damit Tests deterministisch sind.

- [ ] **Step 1: Failing Tests ergänzen**

An `tests/tasks.test.mjs` anhängen:

```js
import { pickTask, gewicht, totalRichtig, ANKER_PHASE_BIS } from '../js/engine/tasks.js';

// Deterministischer Pseudo-Zufall für Tests (LCG)
function lcg(seed = 42) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

test('Anker-Phase: ohne Erfahrung kommen nur Anker-Aufgaben', () => {
  const rng = lcg(1);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 4, stats: {}, lastKey: null, wrongStreak: 0 }, rng);
    assert.ok(istAnker(t, 4), `Nicht-Anker in Anker-Phase: ${taskKey(t)}`);
  }
});

test('nach der Anker-Phase kommen auch schwere Aufgaben', () => {
  const stats = { '4x1': { richtig: 3, falsch: 0 }, '4x2': { richtig: 3, falsch: 0 } };
  assert.ok(totalRichtig(stats, 4) >= ANKER_PHASE_BIS);
  const rng = lcg(7);
  const gesehen = new Set();
  for (let i = 0; i < 200; i++) {
    gesehen.add(taskKey(pickTask({ reihe: 4, stats, lastKey: null, wrongStreak: 0 }, rng)));
  }
  assert.ok([...gesehen].some(k => k.includes('7') || k.includes('8')), 'nur leichte Aufgaben');
});

test('gewicht: oft falsche Aufgaben wiegen mehr, sitzende weniger', () => {
  assert.ok(gewicht({ richtig: 0, falsch: 3 }) > gewicht({ richtig: 0, falsch: 0 }));
  assert.ok(gewicht({ richtig: 5, falsch: 0 }) < gewicht({ richtig: 0, falsch: 0 }));
});

test('schwache Aufgaben kommen statistisch häufiger', () => {
  const stats = { '4x1': { richtig: 4, falsch: 0 }, '4x2': { richtig: 4, falsch: 0 } };
  for (let n = 1; n <= 10; n++) stats[`4x${n}`] = stats[`4x${n}`] || { richtig: 1, falsch: 0 };
  stats['4x7'] = { richtig: 0, falsch: 5 };
  const rng = lcg(99);
  let schwach = 0, sicher = 0;
  for (let i = 0; i < 600; i++) {
    const k = taskKey(pickTask({ reihe: 4, stats, lastKey: null, wrongStreak: 0 }, rng));
    if (k === '4x7') schwach++;
    if (k === '4x1') sicher++;
  }
  assert.ok(schwach > sicher * 2, `4x7=${schwach} sollte deutlich öfter kommen als 4x1=${sicher}`);
});

test('Frust-Bremse: nach 3 Fehlern kommen sichere Aufgaben', () => {
  const stats = {
    '4x3': { richtig: 4, falsch: 0 },
    '4x6': { richtig: 3, falsch: 0 },
    '4x7': { richtig: 0, falsch: 4 },
    '4x8': { richtig: 0, falsch: 3 },
  };
  const rng = lcg(5);
  for (let i = 0; i < 50; i++) {
    const k = taskKey(pickTask({ reihe: 4, stats, lastKey: null, wrongStreak: 3 }, rng));
    assert.ok(['4x3', '4x6'].includes(k), `unsichere Aufgabe trotz Frust-Bremse: ${k}`);
  }
});

test('keine direkte Wiederholung derselben Aufgabe', () => {
  const stats = { '4x1': { richtig: 10, falsch: 0 } };
  const rng = lcg(13);
  for (let i = 0; i < 50; i++) {
    const t = pickTask({ reihe: 4, stats, lastKey: '4x5', wrongStreak: 0 }, rng);
    assert.notEqual(taskKey(t), '4x5');
  }
});
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm test`
Expected: FAIL — `pickTask`, `gewicht`, `totalRichtig`, `ANKER_PHASE_BIS` nicht exportiert

- [ ] **Step 3: Implementierung ergänzen**

An `js/engine/tasks.js` anhängen:

```js
// Solange das Kind weniger als 6 richtige Antworten in der Reihe hat → nur Anker-Aufgaben
export const ANKER_PHASE_BIS = 6;

function stat(stats, t) {
  return stats[taskKey(t)] || { richtig: 0, falsch: 0 };
}

export function totalRichtig(stats, reihe) {
  return buildPool(reihe).reduce((summe, t) => summe + stat(stats, t).richtig, 0);
}

// Gewichtung: falsche Aufgaben drängeln sich vor, sitzende treten zurück
export function gewicht(s) {
  if (s.richtig >= 3 && s.falsch === 0) return 0.5;
  return 1 + 2 * s.falsch;
}

export function pickTask({ reihe, stats = {}, lastKey = null, wrongStreak = 0 }, rng = Math.random) {
  const pool = buildPool(reihe);
  let kandidaten = pool;

  if (totalRichtig(stats, reihe) < ANKER_PHASE_BIS) {
    kandidaten = pool.filter(t => istAnker(t, reihe));
  }

  if (wrongStreak >= 3) {
    const sichere = pool.filter(t => {
      const s = stat(stats, t);
      return s.richtig >= 2 && s.falsch === 0;
    });
    kandidaten = sichere.length ? sichere : pool.filter(t => istAnker(t, reihe));
  }

  const ohneWiederholung = kandidaten.filter(t => taskKey(t) !== lastKey);
  if (ohneWiederholung.length) kandidaten = ohneWiederholung;

  const gewichte = kandidaten.map(t => gewicht(stat(stats, t)));
  const summe = gewichte.reduce((a, b) => a + b, 0);
  let r = rng() * summe;
  for (let i = 0; i < kandidaten.length; i++) {
    r -= gewichte[i];
    if (r <= 0) return kandidaten[i];
  }
  return kandidaten[kandidaten.length - 1];
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm test`
Expected: PASS (9 Tests)

- [ ] **Step 5: Commit**

```bash
git add js/engine/tasks.js tests/tasks.test.mjs
git commit -m "Engine: adaptive Aufgabenauswahl (Anker-Phase, Gewichtung, Frust-Bremse)"
```

---

### Task 4: Trainingsfortschritt & Combo (engine/progress.js — Teil 1)

**Files:**
- Create: `js/engine/progress.js`
- Create: `tests/progress.test.mjs`

Combo-Schrauber (KONZEPT §3.3): Serien richtiger Antworten geben Multiplikator x1/x2/x3 auf den Trainingsbalken (Ziel: 20 Punkte). Fehler setzen nur die Combo zurück, nie den Balken.

- [ ] **Step 1: Failing Tests schreiben**

`tests/progress.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comboStufe, applyAnswer, pruefungBereit, TRAINING_ZIEL } from '../js/engine/progress.js';

test('comboStufe: x1 bis 2er-Serie, x2 ab 3, x3 ab 6', () => {
  assert.equal(comboStufe(0), 1);
  assert.equal(comboStufe(2), 1);
  assert.equal(comboStufe(3), 2);
  assert.equal(comboStufe(5), 2);
  assert.equal(comboStufe(6), 3);
  assert.equal(comboStufe(20), 3);
});

test('applyAnswer richtig: Streak wächst, Punkte = Combo-Stufe', () => {
  let s = { training: 0, streak: 0 };
  s = applyAnswer(s, true);
  assert.deepEqual(s, { training: 1, streak: 1, punkte: 1 });
  s = applyAnswer(s, true);
  s = applyAnswer(s, true); // 3. richtige → Stufe x2
  assert.equal(s.streak, 3);
  assert.equal(s.punkte, 2);
  assert.equal(s.training, 4); // 1 + 1 + 2
});

test('applyAnswer falsch: Streak weg, Training bleibt', () => {
  const s = applyAnswer({ training: 7, streak: 4 }, false);
  assert.deepEqual(s, { training: 7, streak: 0, punkte: 0 });
});

test('Training ist bei TRAINING_ZIEL gedeckelt', () => {
  const s = applyAnswer({ training: TRAINING_ZIEL - 1, streak: 10 }, true);
  assert.equal(s.training, TRAINING_ZIEL);
});

test('pruefungBereit erst bei vollem Balken', () => {
  assert.ok(!pruefungBereit(TRAINING_ZIEL - 1));
  assert.ok(pruefungBereit(TRAINING_ZIEL));
});
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm test`
Expected: FAIL — `Cannot find module .../js/engine/progress.js`

- [ ] **Step 3: Implementierung**

`js/engine/progress.js`:

```js
// Fortschritts-Logik: pure functions, kein DOM.
import { buildPool } from './tasks.js';

export const TRAINING_ZIEL = 20;

export function comboStufe(streak) {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function applyAnswer({ training = 0, streak = 0 }, richtig) {
  if (!richtig) return { training, streak: 0, punkte: 0 };
  const neuerStreak = streak + 1;
  const punkte = comboStufe(neuerStreak);
  return {
    training: Math.min(TRAINING_ZIEL, training + punkte),
    streak: neuerStreak,
    punkte,
  };
}

export function pruefungBereit(training) {
  return training >= TRAINING_ZIEL;
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm test`
Expected: PASS (alle bisherigen + 5 neue)

- [ ] **Step 5: Commit**

```bash
git add js/engine/progress.js tests/progress.test.mjs
git commit -m "Engine: Trainingsbalken mit Combo-Schrauber (x1/x2/x3)"
```

---

### Task 5: Meisterprüfungs-Logik (engine/progress.js — Teil 2)

**Files:**
- Modify: `js/engine/progress.js`
- Modify: `tests/progress.test.mjs`

12 gemischte Aufgaben aus dem Reihen-Pool ohne Wiederholung, bestanden bei höchstens 1 Fehler, **ohne Zeitlimit** (KONZEPT §8 Punkt 2).

- [ ] **Step 1: Failing Tests ergänzen**

An `tests/progress.test.mjs` anhängen:

```js
import { createExam, evalExam, PRUEFUNG_AUFGABEN, PRUEFUNG_MAX_FEHLER } from '../js/engine/progress.js';
import { taskKey } from '../js/engine/tasks.js';

function lcg(seed = 42) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

test('createExam: 12 eindeutige Aufgaben aus der Reihe', () => {
  const exam = createExam(7, lcg(3));
  assert.equal(exam.length, PRUEFUNG_AUFGABEN);
  assert.equal(new Set(exam.map(taskKey)).size, PRUEFUNG_AUFGABEN);
  assert.ok(exam.every(t => t.a === 7 || t.b === 7));
});

test('createExam mischt (zwei Seeds, verschiedene Reihenfolge)', () => {
  const a = createExam(7, lcg(1)).map(taskKey).join(',');
  const b = createExam(7, lcg(2)).map(taskKey).join(',');
  assert.notEqual(a, b);
});

test('evalExam: 0 oder 1 Fehler bestanden, 2 Fehler nicht', () => {
  const alleRichtig = Array(PRUEFUNG_AUFGABEN).fill(true);
  assert.deepEqual(evalExam(alleRichtig), { fehler: 0, bestanden: true });

  const einFehler = [...alleRichtig];
  einFehler[4] = false;
  assert.deepEqual(evalExam(einFehler), { fehler: 1, bestanden: true });

  const zweiFehler = [...einFehler];
  zweiFehler[9] = false;
  assert.deepEqual(evalExam(zweiFehler), { fehler: 2, bestanden: false });
});

test('evalExam: abgebrochene Prüfung gilt nicht als bestanden', () => {
  assert.equal(evalExam([true, true, true]).bestanden, false);
});
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm test`
Expected: FAIL — `createExam` nicht exportiert

- [ ] **Step 3: Implementierung ergänzen**

An `js/engine/progress.js` anhängen:

```js
export const PRUEFUNG_AUFGABEN = 12;
export const PRUEFUNG_MAX_FEHLER = 1;

export function createExam(reihe, rng = Math.random) {
  const pool = buildPool(reihe).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, PRUEFUNG_AUFGABEN);
}

export function evalExam(ergebnisse) {
  const fehler = ergebnisse.filter(ok => !ok).length;
  return {
    fehler,
    bestanden: ergebnisse.length === PRUEFUNG_AUFGABEN && fehler <= PRUEFUNG_MAX_FEHLER,
  };
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/engine/progress.js tests/progress.test.mjs
git commit -m "Engine: Meisterprüfung (12 Aufgaben, max. 1 Fehler, ohne Zeitlimit)"
```

---

### Task 6: Profil-Store (store/profiles.js)

**Files:**
- Create: `js/store/profiles.js`
- Create: `tests/profiles.test.mjs`

Geräte-Profile ohne Server (KONZEPT §4). Storage wird injiziert, damit Tests ohne Browser laufen. Kaputtes JSON führt zu einem frischen Zustand statt Crash.

- [ ] **Step 1: Failing Tests schreiben**

`tests/profiles.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/store/profiles.js';

function fakeStorage(anfang = {}) {
  const map = new Map(Object.entries(anfang));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

test('create legt Profil an und setzt es aktiv', () => {
  const store = createStore(fakeStorage());
  const profil = store.create('Ella', '🦄');
  assert.equal(profil.name, 'Ella');
  assert.equal(profil.avatar, '🦄');
  assert.equal(profil.aktivesProjekt, 'rennwagen');
  assert.deepEqual(profil.projekte, { rennwagen: { grundbau: 0 } });
  assert.equal(store.getActive().id, profil.id);
});

test('list liefert alle Profile, setActive wechselt', () => {
  const store = createStore(fakeStorage());
  const a = store.create('Anna', '🦊');
  const b = store.create('Ben', '🦖');
  assert.equal(store.list().length, 2);
  store.setActive(a.id);
  assert.equal(store.getActive().name, 'Anna');
  store.setActive(b.id);
  assert.equal(store.getActive().name, 'Ben');
});

test('update persistiert Änderungen', () => {
  const storage = fakeStorage();
  const store = createStore(storage);
  const profil = store.create('Mia', '🐸');
  profil.reihen['4'] = { training: 12, gemeistert: false };
  profil.projekte.rennwagen.grundbau = 5;
  store.update(profil);
  const neuGeladen = createStore(storage).get(profil.id);
  assert.equal(neuGeladen.reihen['4'].training, 12);
  assert.equal(neuGeladen.projekte.rennwagen.grundbau, 5);
});

test('kaputtes JSON führt zu frischem Zustand', () => {
  const store = createStore(fakeStorage({ 'baumeister.v1': '{kaputt' }));
  assert.deepEqual(store.list(), []);
  assert.equal(store.getActive(), null);
});

test('zwei Profile mit gleichem Namen bekommen verschiedene IDs', () => {
  const store = createStore(fakeStorage());
  const a = store.create('Tom', '🐯');
  const b = store.create('Tom', '🚀');
  assert.notEqual(a.id, b.id);
  assert.equal(store.list().length, 2);
});
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm test`
Expected: FAIL — `Cannot find module .../js/store/profiles.js`

- [ ] **Step 3: Implementierung**

`js/store/profiles.js`:

```js
// Profil-Store auf localStorage. Storage ist injizierbar (Tests nutzen einen Fake).
const KEY = 'baumeister.v1';

export function createStore(storage) {
  function lesen() {
    try {
      return JSON.parse(storage.getItem(KEY)) || { profiles: {}, activeId: null };
    } catch {
      return { profiles: {}, activeId: null };
    }
  }
  function schreiben(daten) {
    storage.setItem(KEY, JSON.stringify(daten));
  }
  return {
    list() {
      return Object.values(lesen().profiles);
    },
    get(id) {
      return lesen().profiles[id] || null;
    },
    create(name, avatar) {
      const daten = lesen();
      const laufnummer = Object.keys(daten.profiles).length + 1;
      const id = `p${laufnummer}_${name.toLowerCase().replace(/[^a-zäöüß0-9]/gi, '')}_${laufnummer}`;
      const profil = {
        id,
        name,
        avatar,
        aktivesProjekt: 'rennwagen',
        reihen: {},
        aufgabenStats: {},
        projekte: { rennwagen: { grundbau: 0 } },
      };
      daten.profiles[id] = profil;
      daten.activeId = id;
      schreiben(daten);
      return profil;
    },
    update(profil) {
      const daten = lesen();
      daten.profiles[profil.id] = profil;
      schreiben(daten);
    },
    setActive(id) {
      const daten = lesen();
      daten.activeId = id;
      schreiben(daten);
    },
    getActive() {
      const daten = lesen();
      return daten.activeId ? daten.profiles[daten.activeId] || null : null;
    },
  };
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/store/profiles.js tests/profiles.test.mjs
git commit -m "Store: Geräte-Profile auf localStorage (injizierbarer Storage)"
```

---

### Task 7: Rennwagen-Definition & Freischalt-Logik (projects/rennwagen.js)

**Files:**
- Create: `js/projects/rennwagen.js`
- Create: `tests/rennwagen.test.mjs`

12 Bauteile in Montage-Reihenfolge, 10 Addons gekoppelt an Reihe 1–10. Das „Fliegende Auto" (Reihe 10) verlangt zusätzlich **alle** 10 Reihen (KONZEPT §3.1).

- [ ] **Step 1: Failing Tests schreiben**

`tests/rennwagen.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARTS, ADDONS, addonsUnlocked, addonFuerReihe, gemeisterteReihen } from '../js/projects/rennwagen.js';

test('12 Bauteile mit eindeutigen IDs', () => {
  assert.equal(PARTS.length, 12);
  assert.equal(new Set(PARTS.map(p => p.id)).size, 12);
  assert.ok(PARTS.every(p => p.label.length > 0));
});

test('10 Addons, je eines pro Reihe 1–10', () => {
  assert.equal(ADDONS.length, 10);
  assert.deepEqual(ADDONS.map(a => a.reihe).sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('addonsUnlocked: gemeisterte Reihe schaltet ihr Addon frei', () => {
  const reihen = { '3': { training: 20, gemeistert: true }, '4': { training: 10, gemeistert: false } };
  const frei = addonsUnlocked(reihen);
  assert.deepEqual(frei, ['heckfluegel']);
});

test('Fliegendes Auto erst, wenn ALLE 10 Reihen gemeistert sind', () => {
  const neunFertig = {};
  for (let r = 1; r <= 9; r++) neunFertig[r] = { training: 20, gemeistert: true };
  neunFertig['10'] = { training: 20, gemeistert: false };
  assert.ok(!addonsUnlocked(neunFertig).includes('fliegen'));

  const nurZehn = { '10': { training: 20, gemeistert: true } };
  assert.ok(!addonsUnlocked(nurZehn).includes('fliegen'), 'Reihe 10 allein reicht nicht');

  const alleFertig = { ...neunFertig, '10': { training: 20, gemeistert: true } };
  const frei = addonsUnlocked(alleFertig);
  assert.ok(frei.includes('fliegen'));
  assert.equal(frei.length, 10);
});

test('addonFuerReihe und gemeisterteReihen', () => {
  assert.equal(addonFuerReihe(1).id, 'auspuff');
  assert.equal(addonFuerReihe(10).id, 'fliegen');
  assert.equal(addonFuerReihe(11), null);
  assert.deepEqual(
    gemeisterteReihen({ '2': { gemeistert: true }, '5': { gemeistert: true }, '7': { gemeistert: false } }),
    [2, 5]
  );
});
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm test`
Expected: FAIL — `Cannot find module .../js/projects/rennwagen.js`

- [ ] **Step 3: Implementierung**

`js/projects/rennwagen.js`:

```js
// Rennwagen-Projekt: Bauteile in Montage-Reihenfolge + Addons je Reihe. Pure data + Logik.
export const PROJEKT_ID = 'rennwagen';

export const PARTS = [
  { id: 'chassis', label: 'Chassis' },
  { id: 'motor', label: 'Motor' },
  { id: 'rad-hinten', label: 'Hinterrad' },
  { id: 'rad-vorne', label: 'Vorderrad' },
  { id: 'sitz', label: 'Sitz' },
  { id: 'karosserie', label: 'Karosserie' },
  { id: 'windschutz', label: 'Windschutzscheibe' },
  { id: 'lenkrad', label: 'Lenkrad' },
  { id: 'frontfluegel', label: 'Frontflügel' },
  { id: 'scheinwerfer', label: 'Scheinwerfer' },
  { id: 'startnummer', label: 'Startnummer' },
  { id: 'fahrer', label: 'Fahrer mit Helm' },
];

export const ADDONS = [
  { id: 'auspuff', label: 'Sport-Auspuff', reihe: 1 },
  { id: 'rennreifen', label: 'Rennreifen', reihe: 2 },
  { id: 'heckfluegel', label: 'Heckflügel', reihe: 3 },
  { id: 'turbo', label: 'Turbo', reihe: 4 },
  { id: 'neon', label: 'Neon-Unterboden', reihe: 5 },
  { id: 'lackierung', label: 'Rennlackierung', reihe: 6 },
  { id: 'fluegeltueren', label: 'Flügeltüren', reihe: 7 },
  { id: 'rakete', label: 'Raketenantrieb', reihe: 8 },
  { id: 'boost', label: 'Boost-Knopf', reihe: 9 },
  { id: 'fliegen', label: 'Fliegendes Auto', reihe: 10, alleReihen: true },
];

export function gemeisterteReihen(reihen) {
  return Object.entries(reihen)
    .filter(([, stand]) => stand.gemeistert)
    .map(([nummer]) => Number(nummer))
    .sort((a, b) => a - b);
}

export function addonsUnlocked(reihen) {
  const fertig = new Set(gemeisterteReihen(reihen));
  return ADDONS
    .filter(a => (a.alleReihen ? fertig.size === 10 : fertig.has(a.reihe)))
    .map(a => a.id);
}

export function addonFuerReihe(reihe) {
  return ADDONS.find(a => a.reihe === reihe) || null;
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/projects/rennwagen.js tests/rennwagen.test.mjs
git commit -m "Projekt Rennwagen: 12 Bauteile, 10 Addons, Freischalt-Logik"
```

---

### Task 8: Rennwagen-SVG + Car-Renderer

**Files:**
- Create: `js/projects/rennwagen.svg.js`
- Create: `js/ui/carRenderer.js`
- Modify: `tests/rennwagen.test.mjs`
- Modify: `css/styles.css`

Das SVG ist ein JS-Template-String (kein `fetch`, funktioniert überall). Jedes Bauteil ist `<g id="teil-…" class="teil">`, jedes Addon `<g id="addon-…" class="addon">` — anfangs unsichtbar, per Klasse `sichtbar` eingeblendet. Der Test prüft maschinell, dass **alle** IDs aus Task 7 im SVG vorhanden sind (hält Definition und Grafik synchron).

- [ ] **Step 1: Failing Test ergänzen**

An `tests/rennwagen.test.mjs` anhängen:

```js
import { RENNWAGEN_SVG } from '../js/projects/rennwagen.svg.js';

test('SVG enthält jede Bauteil- und Addon-Gruppe genau einmal', () => {
  for (const p of PARTS) {
    const treffer = RENNWAGEN_SVG.split(`id="teil-${p.id}"`).length - 1;
    assert.equal(treffer, 1, `teil-${p.id}: ${treffer}x im SVG`);
  }
  for (const a of ADDONS) {
    const treffer = RENNWAGEN_SVG.split(`id="addon-${a.id}"`).length - 1;
    assert.equal(treffer, 1, `addon-${a.id}: ${treffer}x im SVG`);
  }
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npm test`
Expected: FAIL — `Cannot find module .../js/projects/rennwagen.svg.js`

- [ ] **Step 3: SVG implementieren**

`js/projects/rennwagen.svg.js`:

```js
// Rennwagen als SVG-String. Konvention: Bauteile <g id="teil-X" class="teil">,
// Addons <g id="addon-X" class="addon">. Sichtbarkeit steuert carRenderer via Klasse "sichtbar".
export const RENNWAGEN_SVG = `
<svg viewBox="0 0 480 320" class="rennwagen" role="img" aria-label="Rennwagen">
  <defs>
    <linearGradient id="lackRot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#d62828"/>
    </linearGradient>
    <linearGradient id="metall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfd8e3"/><stop offset="1" stop-color="#8d99ae"/>
    </linearGradient>
    <linearGradient id="glanz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <ellipse class="schatten" cx="240" cy="284" rx="190" ry="14" fill="#1b2432" opacity="0.15"/>

  <g id="addon-neon" class="addon">
    <rect x="100" y="258" width="270" height="6" rx="3" fill="#06d6a0">
      <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g id="addon-rakete" class="addon">
    <rect x="40" y="198" width="54" height="22" rx="11" fill="url(#metall)"/>
    <path d="M40 198 l-16 11 l16 11 Z" fill="#ef233c"/>
    <path d="M24 204 q-22 5 0 10 Z" fill="#ff9f1c"/>
  </g>

  <g id="addon-auspuff" class="addon">
    <rect x="56" y="234" width="34" height="12" rx="6" fill="url(#metall)"/>
    <path d="M56 240 q-16 -9 -26 0 q10 9 26 0" fill="#ff9f1c"/>
  </g>

  <g id="addon-heckfluegel" class="addon">
    <rect x="96" y="142" width="10" height="42" fill="#2b2d42"/>
    <rect x="72" y="130" width="72" height="14" rx="6" fill="#d62828"/>
    <rect x="72" y="130" width="72" height="6" rx="3" fill="url(#glanz)"/>
  </g>

  <g id="teil-chassis" class="teil">
    <rect x="80" y="228" width="312" height="26" rx="13" fill="#2b2d42"/>
  </g>

  <g id="teil-motor" class="teil">
    <rect x="118" y="180" width="82" height="50" rx="8" fill="url(#metall)"/>
    <rect x="128" y="190" width="62" height="6" rx="3" fill="#5c677d"/>
    <rect x="128" y="202" width="62" height="6" rx="3" fill="#5c677d"/>
    <rect x="128" y="214" width="62" height="6" rx="3" fill="#5c677d"/>
  </g>

  <g id="addon-turbo" class="addon">
    <rect x="130" y="158" width="58" height="22" rx="11" fill="#118ab2"/>
    <text x="159" y="174" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">TURBO</text>
  </g>

  <g id="teil-rad-hinten" class="teil">
    <circle cx="142" cy="254" r="42" fill="#1b2432"/>
    <circle cx="142" cy="254" r="20" fill="url(#metall)"/>
    <circle cx="142" cy="254" r="7" fill="#5c677d"/>
  </g>

  <g id="teil-rad-vorne" class="teil">
    <circle cx="362" cy="254" r="36" fill="#1b2432"/>
    <circle cx="362" cy="254" r="17" fill="url(#metall)"/>
    <circle cx="362" cy="254" r="6" fill="#5c677d"/>
  </g>

  <g id="addon-rennreifen" class="addon">
    <circle cx="142" cy="254" r="42" fill="none" stroke="#ef233c" stroke-width="6"/>
    <circle cx="362" cy="254" r="36" fill="none" stroke="#ef233c" stroke-width="6"/>
  </g>

  <g id="teil-sitz" class="teil">
    <path d="M222 176 h30 v46 h-40 z" fill="#1b2432"/>
  </g>

  <g id="teil-karosserie" class="teil">
    <path d="M82 228 L98 198 Q122 170 172 170 L258 170 Q304 170 352 198 L434 214 Q448 220 442 228 Z" fill="url(#lackRot)"/>
    <path d="M98 198 Q150 178 250 176 L250 170 L172 170 Q122 170 98 198 Z" fill="url(#glanz)"/>
  </g>

  <g id="addon-lackierung" class="addon">
    <path d="M176 172 L204 172 L262 228 L234 228 Z" fill="#ffd166" opacity="0.9"/>
    <path d="M218 171 L238 171 L296 228 L276 228 Z" fill="#ffd166" opacity="0.9"/>
  </g>

  <g id="addon-fluegeltueren" class="addon">
    <path d="M252 168 L292 120 L300 128 L266 170 Z" fill="url(#metall)"/>
  </g>

  <g id="teil-windschutz" class="teil">
    <path d="M260 170 L286 146 L306 170 Z" fill="#bde0fe" opacity="0.85"/>
  </g>

  <g id="teil-lenkrad" class="teil">
    <rect x="254" y="158" width="6" height="20" rx="3" fill="#5c677d" transform="rotate(-18 257 168)"/>
    <circle cx="252" cy="156" r="8" fill="#1b2432"/>
  </g>

  <g id="teil-frontfluegel" class="teil">
    <path d="M432 246 L470 240 q8 0 6 8 l-2 6 L432 258 Z" fill="#2b2d42"/>
  </g>

  <g id="teil-scheinwerfer" class="teil">
    <circle cx="432" cy="220" r="7" fill="#ffd166"/>
    <circle cx="432" cy="220" r="3" fill="#fff3b0"/>
  </g>

  <g id="teil-startnummer" class="teil">
    <circle cx="202" cy="202" r="17" fill="#ffffff" stroke="#1b2432" stroke-width="2"/>
    <text x="202" y="209" text-anchor="middle" font-size="20" font-weight="bold" fill="#d62828">7</text>
  </g>

  <g id="teil-fahrer" class="teil">
    <circle cx="270" cy="152" r="14" fill="#ffd166"/>
    <rect x="258" y="146" width="24" height="9" rx="4" fill="#118ab2"/>
  </g>

  <g id="addon-boost" class="addon">
    <circle cx="294" cy="188" r="11" fill="#ef233c" stroke="#ffffff" stroke-width="3"/>
    <text x="294" y="193" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">B</text>
  </g>

  <g id="addon-fliegen" class="addon">
    <path d="M150 212 q-62 -42 -124 -28 q42 44 114 38 Z" fill="#bde0fe" opacity="0.9"/>
    <path d="M330 208 q62 -44 132 -30 q-46 46 -120 42 Z" fill="#bde0fe" opacity="0.9"/>
  </g>
</svg>`;
```

- [ ] **Step 4: Test laufen lassen — muss bestehen**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Car-Renderer implementieren**

`js/ui/carRenderer.js`:

```js
// Hängt das SVG ein und steuert Sichtbarkeit der Gruppen. Kein Spielzustand hier.
export function mountCar(el, svgString) {
  el.innerHTML = svgString;
}

export function updateCar(el, { teile = [], addons = [] }) {
  el.querySelectorAll('.teil, .addon').forEach(g => g.classList.remove('sichtbar'));
  for (const id of teile) el.querySelector(`#teil-${id}`)?.classList.add('sichtbar');
  for (const id of addons) el.querySelector(`#addon-${id}`)?.classList.add('sichtbar');
  el.querySelector('svg')?.classList.toggle('fliegt', addons.includes('fliegen'));
}

// Montage-Animation für ein frisch gebautes Teil (Klasse triggert CSS-Keyframe)
export function montiere(el, teilId) {
  const g = el.querySelector(`#teil-${teilId}`);
  if (!g) return;
  g.classList.add('sichtbar', 'montiert');
  setTimeout(() => g.classList.remove('montiert'), 700);
}
```

- [ ] **Step 6: SVG-Styles in css/styles.css ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Auto-Bühne & SVG ===== */
.auto-buehne { width: 100%; }
.auto-buehne svg { width: 100%; height: auto; display: block; }
.auto-buehne.klein { max-width: 340px; margin: 0 auto; }
.teil, .addon { opacity: 0; transition: opacity 0.4s ease; }
.sichtbar { opacity: 1; }
@keyframes montage-pop {
  0% { transform: translateY(-40px) scale(0.3); opacity: 0; }
  60% { transform: translateY(4px) scale(1.12); opacity: 1; }
  100% { transform: none; opacity: 1; }
}
.teil.montiert { animation: montage-pop 0.6s ease-out; transform-box: fill-box; transform-origin: center; }
@keyframes schweben {
  from { transform: translateY(0); }
  to { transform: translateY(-22px); }
}
svg.fliegt { animation: schweben 2.2s ease-in-out infinite alternate; }
```

- [ ] **Step 7: Syntax-Check und Commit**

Run: `node --check js/ui/carRenderer.js && node --check js/projects/rennwagen.svg.js && npm test`
Expected: kein Fehler, alle Tests PASS

```bash
git add js/projects/rennwagen.svg.js js/ui/carRenderer.js tests/rennwagen.test.mjs css/styles.css
git commit -m "Rennwagen-SVG mit Bauteil-/Addon-Gruppen + Car-Renderer mit Montage-Animation"
```

---

### Task 9: Ziffernblock, Audio, Schrauber, Konfetti (UI-Bausteine)

**Files:**
- Create: `js/ui/numpad.js`
- Create: `js/audio.js`
- Create: `js/ui/schrauber.js`
- Create: `js/ui/confetti.js`
- Modify: `css/styles.css`

Reine UI-Bausteine ohne Spiellogik — Verifikation per `node --check` + manuellem Browsertest in Task 12/13.

- [ ] **Step 1: Ziffernblock implementieren**

`js/ui/numpad.js`:

```js
// Touch-Ziffernblock: max. 3 Stellen, ⌫ löscht, ✓ schickt ab.
// onChange(wert) bei jeder Änderung, onSubmit(wert) beim Abschicken.
export function createNumpad(el, { onChange, onSubmit }) {
  let wert = '';
  el.innerHTML = `
    <div class="numpad-grid">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" class="taste" data-ziffer="${n}">${n}</button>`).join('')}
      <button type="button" class="taste loeschen" data-aktion="loeschen">⌫</button>
      <button type="button" class="taste" data-ziffer="0">0</button>
      <button type="button" class="taste ok" data-aktion="ok">✓</button>
    </div>`;
  el.addEventListener('click', (e) => {
    const taste = e.target.closest('.taste');
    if (!taste) return;
    if (taste.dataset.ziffer !== undefined && wert.length < 3) wert += taste.dataset.ziffer;
    if (taste.dataset.aktion === 'loeschen') wert = wert.slice(0, -1);
    if (taste.dataset.aktion === 'ok') {
      if (!wert) return;
      const abgeschickt = wert;
      wert = '';
      onChange('');
      onSubmit(abgeschickt);
      return;
    }
    onChange(wert);
  });
}
```

- [ ] **Step 2: Audio implementieren (WebAudio-Synth, keine Dateien)**

`js/audio.js`:

```js
// Synthetisierte Sounds über WebAudio — keine Audiodateien nötig.
// AudioContext wird erst beim ersten Ton erzeugt (Browser verlangen eine User-Geste).
function createAudio() {
  let audioCtx = null;
  let stumm = false;

  function kontext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function ton(freq, dauer, typ = 'sine', startIn = 0, lautstaerke = 0.2) {
    if (stumm) return;
    try {
      const ac = kontext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = typ;
      osc.frequency.value = freq;
      const t = ac.currentTime + startIn;
      gain.gain.setValueAtTime(lautstaerke, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dauer);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + dauer);
    } catch { /* Audio darf nie das Spiel crashen */ }
  }

  return {
    richtig() { ton(660, 0.12); ton(880, 0.22, 'sine', 0.1); },
    falsch() { ton(180, 0.3, 'triangle', 0, 0.15); },
    montage() { ton(440, 0.06, 'square', 0, 0.12); ton(520, 0.06, 'square', 0.08, 0.12); ton(660, 0.12, 'square', 0.16, 0.12); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => ton(f, 0.3, 'sine', i * 0.15, 0.25)); },
    toggleStumm() { stumm = !stumm; return stumm; },
    istStumm() { return stumm; },
  };
}

export const sound = createAudio();
```

- [ ] **Step 3: Maskottchen „Schrauber" implementieren**

`js/ui/schrauber.js`:

```js
// Maskottchen: kleiner Werkstatt-Roboter. setMood('jubel'|'trost') zeigt
// kurz Animation + Spruch, danach zurück zu neutral.
const SPRUECHE = {
  jubel: ['Super!', 'Stark gerechnet!', 'Weiter so!', 'Wow, das saß!'],
  trost: ['Gleich klappt’s!', 'Schau genau hin!', 'Nicht aufgeben!', 'Du schaffst das!'],
};

export function createSchrauber(el) {
  el.innerHTML = `
    <div class="schrauber">
      <svg viewBox="0 0 120 140" class="schrauber-svg" role="img" aria-label="Schrauber der Roboter">
        <circle cx="60" cy="8" r="5" fill="#ffd166"/>
        <line x1="60" y1="10" x2="60" y2="16" stroke="#8d99ae" stroke-width="3"/>
        <rect x="22" y="16" width="76" height="46" rx="14" fill="#a8b3c5"/>
        <circle class="auge" cx="45" cy="38" r="7" fill="#1b2432"/>
        <circle class="auge" cx="75" cy="38" r="7" fill="#1b2432"/>
        <path class="mund" d="M46 50 Q60 58 74 50" stroke="#1b2432" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="32" y="64" width="56" height="52" rx="12" fill="#8d99ae"/>
        <rect x="8" y="70" width="22" height="10" rx="5" fill="#8d99ae" transform="rotate(-22 19 75)"/>
        <text x="0" y="66" font-size="20">🔧</text>
        <rect x="90" y="74" width="22" height="10" rx="5" fill="#8d99ae" transform="rotate(16 101 79)"/>
      </svg>
      <p class="schrauber-text" aria-live="polite"></p>
    </div>`;
  const figur = el.querySelector('.schrauber');
  const text = el.querySelector('.schrauber-text');
  let zaehler = 0;
  let timer = null;
  return {
    setMood(mood) {
      if (!SPRUECHE[mood]) return;
      clearTimeout(timer);
      figur.classList.remove('jubel', 'trost');
      void figur.offsetWidth; // Animation neu starten
      figur.classList.add(mood);
      const liste = SPRUECHE[mood];
      text.textContent = liste[zaehler++ % liste.length];
      timer = setTimeout(() => {
        figur.classList.remove(mood);
        text.textContent = '';
      }, 1500);
    },
  };
}
```

- [ ] **Step 4: Konfetti implementieren**

`js/ui/confetti.js`:

```js
// Konfetti-Regen für Feier-Momente. Räumt sich selbst wieder auf.
export function feuerKonfetti(el, anzahl = 70) {
  const farben = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5'];
  for (let i = 0; i < anzahl; i++) {
    const stueck = document.createElement('span');
    stueck.className = 'konfetti';
    stueck.style.left = Math.random() * 100 + 'vw';
    stueck.style.background = farben[i % farben.length];
    stueck.style.animationDuration = 1200 + Math.random() * 1400 + 'ms';
    stueck.style.animationDelay = Math.random() * 500 + 'ms';
    el.appendChild(stueck);
    stueck.addEventListener('animationend', () => stueck.remove());
  }
}
```

- [ ] **Step 5: Styles für die UI-Bausteine ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Ziffernblock ===== */
.numpad-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  max-width: 320px; margin: 0 auto; width: 100%;
}
.taste {
  font: inherit; font-size: 1.7rem; font-weight: bold;
  padding: 14px 0; min-height: 60px;
  background: #ffffff; color: var(--tinte);
  border: 3px solid var(--tinte); border-radius: var(--radius);
  box-shadow: var(--schatten); cursor: pointer;
  transition: transform 0.06s ease-out;
}
.taste:active { transform: translateY(3px); box-shadow: none; }
.taste.ok { background: var(--gruen); }
.taste.loeschen { background: var(--bg-akzent); }

/* ===== Schrauber ===== */
.schrauber { width: 84px; text-align: center; }
.schrauber-svg { width: 64px; height: auto; }
.schrauber-text { font-size: 0.85rem; font-weight: bold; min-height: 1.2em; }
@keyframes schrauber-hops {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(-12px) rotate(-4deg); }
  60% { transform: translateY(0) rotate(3deg); }
}
.schrauber.jubel .schrauber-svg { animation: schrauber-hops 0.5s ease-in-out 2; }
@keyframes schrauber-wackel {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
.schrauber.trost .schrauber-svg { animation: schrauber-wackel 0.6s ease-in-out 2; }

/* ===== Konfetti ===== */
@keyframes konfetti-fall {
  to { transform: translateY(110vh) rotate(720deg); }
}
.konfetti {
  position: fixed; top: -14px; width: 10px; height: 14px;
  border-radius: 3px; z-index: 9; pointer-events: none;
  animation: konfetti-fall linear forwards;
}
```

- [ ] **Step 6: Syntax-Check und Commit**

Run: `node --check js/ui/numpad.js && node --check js/audio.js && node --check js/ui/schrauber.js && node --check js/ui/confetti.js && npm test`
Expected: kein Fehler, Tests weiterhin PASS

```bash
git add js/ui/numpad.js js/audio.js js/ui/schrauber.js js/ui/confetti.js css/styles.css
git commit -m "UI-Bausteine: Ziffernblock, WebAudio-Sounds, Schrauber-Maskottchen, Konfetti"
```

---

### Task 10: Start-Screen (Profilwahl + Profil anlegen)

**Files:**
- Create: `js/screens/start.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`

- [ ] **Step 1: Screen implementieren**

`js/screens/start.js`:

```js
const AVATARE = ['🦊', '🦄', '🐯', '🐸', '🦖', '🐼', '🚀', '⭐'];

export function showStart(root, ctx, navigate) {
  root.innerHTML = `
    <div class="screen start">
      <h1>🏎️ 1x1 Baumeister</h1>
      <p class="slogan">Rechne richtig — bau dein Ding!</p>
      <div class="profil-liste"></div>
      <form class="profil-neu">
        <h3>Neues Profil</h3>
        <input class="name-eingabe" name="name" maxlength="12" placeholder="Wie heißt du?" required autocomplete="off">
        <div class="avatar-wahl">
          ${AVATARE.map((a, i) => `
            <label class="avatar-option">
              <input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}>
              <span>${a}</span>
            </label>`).join('')}
        </div>
        <button type="submit" class="btn gross">Los geht's! 🔧</button>
      </form>
    </div>`;

  const liste = root.querySelector('.profil-liste');
  const profile = ctx.store.list();
  if (profile.length) {
    liste.innerHTML = '<h3>Wer spielt?</h3>';
    for (const p of profile) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn profil-knopf';
      btn.textContent = `${p.avatar} ${p.name}`;
      btn.onclick = () => {
        ctx.store.setActive(p.id);
        navigate('hub');
      };
      liste.appendChild(btn);
    }
  }

  root.querySelector('.profil-neu').onsubmit = (e) => {
    e.preventDefault();
    const daten = new FormData(e.target);
    const name = String(daten.get('name') || '').trim();
    if (!name) return;
    ctx.store.create(name, daten.get('avatar'));
    navigate('hub');
  };
}
```

- [ ] **Step 2: Router verdrahten**

`js/app.js` komplett ersetzen durch:

```js
import { createStore } from './store/profiles.js';
import { showStart } from './screens/start.js';

const screens = { start: showStart };
const root = document.getElementById('app');
const ctx = { store: createStore(window.localStorage) };

export function navigate(name, params = {}) {
  const screen = screens[name];
  root.innerHTML = '';
  root.dataset.screen = name;
  if (screen) {
    screen(root, ctx, navigate, params);
  } else {
    root.innerHTML = `<div class="screen"><h1>1x1 Baumeister</h1><p>Baustelle: Screen „${name}" kommt noch. 🔧</p></div>`;
  }
}

navigate(ctx.store.getActive() ? 'hub' : 'start');
```

- [ ] **Step 3: Styles ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Start-Screen ===== */
.profil-liste { display: flex; flex-direction: column; gap: 10px; }
.profil-knopf { text-align: left; font-size: 1.3rem; }
.profil-neu { display: flex; flex-direction: column; gap: 12px; }
.name-eingabe {
  font: inherit; font-size: 1.2rem; padding: 12px;
  border: 3px solid var(--tinte); border-radius: var(--radius);
  background: #fff; width: 100%;
}
.avatar-wahl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.avatar-option { position: relative; display: block; }
.avatar-option input { position: absolute; opacity: 0; }
.avatar-option span {
  display: flex; align-items: center; justify-content: center;
  font-size: 1.9rem; padding: 8px;
  background: #fff; border: 3px solid var(--grau); border-radius: var(--radius);
  cursor: pointer;
}
.avatar-option input:checked + span { border-color: var(--tinte); background: var(--gelb); }
```

- [ ] **Step 4: Manuell testen**

Run: `node --check js/screens/start.js && node --check js/app.js`, dann Server starten und `http://localhost:8080` öffnen (vorher in DevTools → Application → Local Storage leeren).
Expected:
1. Start-Screen zeigt Titel, Namensfeld, 8 Avatare, Button.
2. Name „Test" + Avatar 🦖 → „Los geht's!" → Platzhalter „Baustelle: Screen „hub"" erscheint (Hub kommt in Task 11).
3. Seite neu laden → es geht direkt zum Hub-Platzhalter (aktives Profil erkannt).
4. Local Storage enthält Key `baumeister.v1` mit dem Profil.

- [ ] **Step 5: Commit**

```bash
git add js/screens/start.js js/app.js css/styles.css
git commit -m "Start-Screen: Profilwahl und Profil anlegen (Name + Avatar)"
```

---

### Task 11: Hub-Screen (Reihen-Übersicht)

**Files:**
- Create: `js/screens/hub.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`

- [ ] **Step 1: Screen implementieren**

`js/screens/hub.js`:

```js
import { TRAINING_ZIEL } from '../engine/progress.js';
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
  for (let r = 1; r <= 10; r++) {
    const stand = profil.reihen[r] || { training: 0, gemeistert: false };
    const prozent = Math.min(100, Math.round((100 * stand.training) / TRAINING_ZIEL));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn reihen-knopf' + (stand.gemeistert ? ' gemeistert' : '');
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
```

- [ ] **Step 2: Router erweitern**

In `js/app.js` Import und Registrierung ergänzen:

```js
import { showHub } from './screens/hub.js';
```

und die Screen-Tabelle erweitern zu:

```js
const screens = { start: showStart, hub: showHub };
```

- [ ] **Step 3: Styles ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Hub ===== */
.kopf-knoepfe { display: flex; gap: 6px; }
.reihen-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.reihen-knopf { display: flex; align-items: center; gap: 10px; justify-content: space-between; }
.reihen-knopf.gemeistert { background: var(--gelb); }
.reihe-zahl { font-size: 1.3rem; }
.balken {
  flex: 1; height: 14px; max-width: 110px;
  background: var(--bg-akzent); border: 2px solid var(--tinte); border-radius: 7px;
  overflow: hidden;
}
.balken .fuellung { display: block; height: 100%; background: var(--gruen); transition: width 0.3s ease; }
.pokal { font-size: 1.3rem; }
```

- [ ] **Step 4: Manuell testen**

Run: `node --check js/screens/hub.js && node --check js/app.js`, Browser neu laden.
Expected:
1. Hub zeigt Profilname, leere Auto-Bühne (Grundbau 0 → nur Schatten), 10 Reihen-Knöpfe mit leeren Balken.
2. 🔊-Knopf wechselt zu 🔇.
3. Klick auf „4er" → Platzhalter „Baustelle: Screen „werkstatt"".
4. 👤 führt zurück zum Start-Screen, 🏁 zum Garage-Platzhalter.

- [ ] **Step 5: Commit**

```bash
git add js/screens/hub.js js/app.js css/styles.css
git commit -m "Hub-Screen: Reihen-Übersicht mit Trainingsbalken, Pokalen und Auto-Vorschau"
```

---

### Task 12: Werkstatt-Screen (Kernschleife)

**Files:**
- Create: `js/screens/werkstatt.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`

Herzstück: Aufgabe → Antwort über Ziffernblock → richtig: Bauteil-Montage mit Sound + Vibration, Combo, Trainingsbalken; falsch: Lösung kurz zeigen, Schrauber tröstet, weiter. Bei vollem Balken erscheint der Prüfungs-Button.

- [ ] **Step 1: Screen implementieren**

`js/screens/werkstatt.js`:

```js
import { pickTask, taskKey, loesung } from '../engine/tasks.js';
import { applyAnswer, pruefungBereit, TRAINING_ZIEL, comboStufe } from '../engine/progress.js';
import { PARTS, addonsUnlocked } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar, montiere } from '../ui/carRenderer.js';
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
  }

  function naechsteAufgabe() {
    aufgabe = pickTask({ reihe, stats: profil.aufgabenStats, lastKey, wrongStreak });
    lastKey = taskKey(aufgabe);
    gesperrt = false;
    aufgabeEl.classList.remove('richtig', 'zeigt-loesung');
    aufgabeEl.innerHTML = `<span class="term">${aufgabe.a} · ${aufgabe.b} = <span class="eingabe">?</span></span>`;
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

  createNumpad(root.querySelector('.numpad'), {
    onChange: (wert) => {
      if (gesperrt) return;
      aufgabeEl.querySelector('.eingabe').textContent = wert || '?';
    },
    onSubmit: antwort,
  });

  root.querySelector('.zurueck').onclick = () => navigate('hub');
  pruefungBtn.onclick = () => navigate('pruefung', { reihe });

  zeichneAuto();
  zeichneStatus();
  naechsteAufgabe();
}
```

- [ ] **Step 2: Router erweitern**

In `js/app.js`:

```js
import { showWerkstatt } from './screens/werkstatt.js';
```

```js
const screens = { start: showStart, hub: showHub, werkstatt: showWerkstatt };
```

- [ ] **Step 3: Styles ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Werkstatt ===== */
.status-zeile { display: flex; align-items: center; gap: 12px; }
.balken.gross { flex: 1; height: 22px; max-width: none; border-radius: 11px; border-width: 3px; }
.aufgabe { text-align: center; min-height: 70px; display: flex; align-items: center; justify-content: center; }
.term { font-size: 2.6rem; font-weight: bold; }
.eingabe { display: inline-block; min-width: 1.6em; color: var(--blau); }
.aufgabe.richtig .eingabe { color: var(--gruen); }
.aufgabe.zeigt-loesung .eingabe { color: var(--rot); }
@keyframes aufgabe-schuettel {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
.aufgabe.zeigt-loesung { animation: aufgabe-schuettel 0.3s ease-in-out; }
.reihe-titel { font-size: 1.3rem; font-weight: bold; }
.combo { font-size: 1.2rem; font-weight: bold; min-width: 3.2em; text-align: right; }
.pruefung-knopf { background: var(--gelb); }
```

- [ ] **Step 4: Manuell testen (Kern-Durchlauf)**

Run: `node --check js/screens/werkstatt.js && node --check js/app.js && npm test`, Browser neu laden.
Expected:
1. Hub → „4er" → Werkstatt: Aufgabe wie „4 · 5 = ?" erscheint (Anker-Phase: nur ·1/·2/·5/·10).
2. Richtige Antwort eintippen + ✓: Bauteil ploppt mit Schrauber-Sound aufs Auto, Balken wächst, Schrauber jubelt, kurze Vibration (am Handy).
3. Falsche Antwort: rote Lösung erscheint, Aufgabe schüttelt, Schrauber tröstet, danach neue Aufgabe.
4. 3 richtige in Folge → „🔥 x2" erscheint.
5. Nach ~6 richtigen kommen auch schwere Aufgaben (4·7, 8·4 …).
6. Weiterrechnen bis Balken voll (ca. 12–20 richtige) → „🏆 Zur Meisterprüfung!" erscheint; Klick → Platzhalter „pruefung".
7. „← Reihen" → Hub zeigt Balkenstand der 4er-Reihe und das teilgebaute Auto.
8. Seite neu laden → Fortschritt ist noch da.

- [ ] **Step 5: Commit**

```bash
git add js/screens/werkstatt.js js/app.js css/styles.css
git commit -m "Werkstatt-Screen: Kernschleife mit Bauteil-Montage, Combo und Frust-Bremse"
```

---

### Task 13: Prüfungs-Screen (Meisterprüfung + Ergebnis)

**Files:**
- Create: `js/screens/pruefung.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`

- [ ] **Step 1: Screen implementieren**

`js/screens/pruefung.js`:

```js
import { createExam, evalExam } from '../engine/progress.js';
import { loesung } from '../engine/tasks.js';
import { addonFuerReihe } from '../projects/rennwagen.js';
import { createNumpad } from '../ui/numpad.js';
import { feuerKonfetti } from '../ui/confetti.js';
import { sound } from '../audio.js';

export function showPruefung(root, ctx, navigate, { reihe }) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
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
      <div class="punkte">${aufgaben.map(() => '<span class="punkt"></span>').join('')}</div>
      <div class="aufgabe"></div>
      <div class="numpad"></div>
    </div>`;

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
      const addon = addonFuerReihe(reihe);
      const addonText = addon.alleReihen
        ? `Dein Super-Addon <strong>${addon.label}</strong> wartet, sobald alle 10 Reihen gemeistert sind!`
        : `Neues Addon freigeschaltet: <strong>${addon.label}</strong> 🔧`;
      sound.fanfare();
      root.innerHTML = `
        <div class="screen ergebnis">
          <h2>🏆 Gemeistert!</h2>
          <p class="gross-text">Du bist jetzt Meister der ${reihe}er-Reihe!</p>
          <p class="addon-neu">${addonText}</p>
          <button type="button" class="btn gross weiter">Ab in die Garage! 🏁</button>
        </div>`;
      feuerKonfetti(root);
      root.querySelector('.weiter').onclick = () => navigate('garage');
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
      aufgabeEl.querySelector('.eingabe').textContent = wert || '?';
    },
    onSubmit: (wert) => {
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
```

- [ ] **Step 2: Router erweitern**

In `js/app.js`:

```js
import { showPruefung } from './screens/pruefung.js';
```

```js
const screens = { start: showStart, hub: showHub, werkstatt: showWerkstatt, pruefung: showPruefung };
```

- [ ] **Step 3: Styles ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Prüfung & Ergebnis ===== */
.punkte { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.punkt {
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2px solid var(--tinte);
}
.punkt.ok { background: var(--gruen); }
.punkt.nok { background: var(--rot); }
.ergebnis { align-items: center; justify-content: center; text-align: center; gap: 20px; }
.gross-text { font-size: 1.25rem; }
.addon-neu { font-size: 1.15rem; background: var(--gelb); padding: 12px 16px; border-radius: var(--radius); border: 3px solid var(--tinte); }
```

- [ ] **Step 4: Manuell testen**

Run: `node --check js/screens/pruefung.js && node --check js/app.js`, Browser neu laden.
Expected:
1. Werkstatt (Balken voll) → Prüfungs-Button → Prüfung: 12 leere Punkte, Aufgabe, Ziffernblock.
2. Richtige Antworten färben Punkte grün, falsche rot (ohne Lösung zu zeigen).
3. Mit 0–1 Fehlern: Fanfare, Konfetti, „Gemeistert!", Addon-Text „Sport-Auspuff" (bei 1er-Reihe) → „Ab in die Garage!" → Garage-Platzhalter.
4. Hub zeigt jetzt 🏆 bei der Reihe; Auto trägt das Addon (z. B. Auspuff sichtbar).
5. Mit 2+ Fehlern: „Fast geschafft!" → zurück in die Werkstatt; nichts ist verloren gegangen.
6. ✕ bricht ab und führt zurück in die Werkstatt.

- [ ] **Step 5: Commit**

```bash
git add js/screens/pruefung.js js/app.js css/styles.css
git commit -m "Prüfungs-Screen: Meisterprüfung mit Konfetti-Feier und Addon-Freischaltung"
```

---

### Task 14: Garage-Screen (Addons schalten, Pokal-Regal)

**Files:**
- Create: `js/screens/garage.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`

- [ ] **Step 1: Screen implementieren**

`js/screens/garage.js`:

```js
import { PARTS, ADDONS, addonsUnlocked, gemeisterteReihen } from '../projects/rennwagen.js';
import { RENNWAGEN_SVG } from '../projects/rennwagen.svg.js';
import { mountCar, updateCar } from '../ui/carRenderer.js';

export function showGarage(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }
  const freigeschaltet = addonsUnlocked(profil.reihen);
  const eingeschaltet = new Set(freigeschaltet);
  const pokale = gemeisterteReihen(profil.reihen);

  root.innerHTML = `
    <div class="screen garage">
      <header>
        <button type="button" class="btn klein zurueck">← Zurück</button>
        <h2>🏁 Garage</h2>
        <span></span>
      </header>
      <div class="auto-buehne"></div>
      <h3>Addons</h3>
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

  function zeichne() {
    updateCar(buehne, {
      teile: PARTS.slice(0, profil.projekte.rennwagen.grundbau).map(p => p.id),
      addons: [...eingeschaltet],
    });
  }

  const liste = root.querySelector('.addon-liste');
  for (const addon of ADDONS) {
    const offen = freigeschaltet.includes(addon.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn addon-knopf' + (offen ? '' : ' gesperrt');
    const beschriftung = () => `${eingeschaltet.has(addon.id) ? '✅' : '⬜'} ${addon.label}`;
    btn.textContent = offen
      ? beschriftung()
      : `🔒 ${addon.alleReihen ? 'Alle 10 Reihen meistern!' : `${addon.reihe}er-Reihe meistern`}`;
    if (offen) {
      btn.onclick = () => {
        eingeschaltet.has(addon.id) ? eingeschaltet.delete(addon.id) : eingeschaltet.add(addon.id);
        btn.textContent = beschriftung();
        zeichne();
      };
    }
    liste.appendChild(btn);
  }

  root.querySelector('.zurueck').onclick = () => navigate('hub');
  zeichne();
}
```

- [ ] **Step 2: Router komplettieren**

In `js/app.js`:

```js
import { showGarage } from './screens/garage.js';
```

```js
const screens = { start: showStart, hub: showHub, werkstatt: showWerkstatt, pruefung: showPruefung, garage: showGarage };
```

- [ ] **Step 3: Styles ergänzen**

An `css/styles.css` anhängen:

```css
/* ===== Garage ===== */
.addon-liste { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.addon-knopf { font-size: 0.95rem; padding: 10px 8px; text-align: left; }
.addon-knopf.gesperrt { background: var(--bg-akzent); color: var(--grau); border-color: var(--grau); box-shadow: none; cursor: default; }
.pokal-regal {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
  background: #fff; border: 3px solid var(--tinte); border-radius: var(--radius);
  padding: 12px;
}
.pokal-platz { display: flex; flex-direction: column; align-items: center; opacity: 0.4; }
.pokal-platz.gewonnen { opacity: 1; }
.pokal-icon { font-size: 1.5rem; min-height: 1.5em; }
```

- [ ] **Step 4: Manuell testen**

Run: `node --check js/screens/garage.js && node --check js/app.js && npm test`, Browser neu laden.
Expected:
1. Hub → 🏁: Garage zeigt das Auto im aktuellen Bauzustand mit allen freien Addons an.
2. Gesperrte Addons zeigen 🔒 mit der nötigen Reihe; freigeschaltete lassen sich an-/abschalten und das Auto reagiert sofort.
3. Pokal-Regal: gemeisterte Reihen leuchten mit 🏆, der Rest ist ausgegraut.
4. Zum Testen des Fliegens: in DevTools-Konsole `localStorage` manipulieren (alle 10 Reihen `gemeistert: true` setzen), neu laden → „Fliegendes Auto" schaltbar, Auto schwebt auf und ab.

- [ ] **Step 5: Commit**

```bash
git add js/screens/garage.js js/app.js css/styles.css
git commit -m "Garage-Screen: Addons an-/abschaltbar, Pokal-Regal"
```

---

### Task 15: Endabnahme (Gesamttest + README)

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Alle Tests laufen lassen**

Run: `npm test`
Expected: PASS, 0 Failures

- [ ] **Step 2: Manueller Gesamtdurchlauf (Mobile-Emulation, frischer Local Storage)**

Checkliste — jede Zeile muss stimmen:
1. Frischer Start → Profil „Ella" + 🦄 anlegen → Hub.
2. Zweites Profil „Ben" + 🦖 anlegen (über 👤) → beide erscheinen auf dem Start-Screen, Wechsel funktioniert, Fortschritt ist getrennt.
3. 2er-Reihe trainieren bis Prüfung, Prüfung bestehen → Konfetti, „Rennreifen" in Garage schaltbar.
4. Eine Prüfung absichtlich mit 2 Fehlern abschließen → „Fast geschafft!", Trainingsbalken und Auto unverändert.
5. Frust-Bremse: 3× absichtlich falsch → die nächsten Aufgaben sind spürbar leichter (Anker/sichere Aufgaben).
6. Stumm-Schalter unterdrückt alle Sounds.
7. Smartphone-Viewport 375×667: kein horizontales Scrollen, Ziffernblock gut tippbar, Auto vollständig sichtbar.
8. Reload an jeder Stelle: Zustand bleibt erhalten.

Begeisterungs-Check (KONZEPT §5 — bei Lücken nachbessern, bevor abgeschlossen wird):
- Montage fühlt sich gut an (Pop-Animation + Sound + Vibration gleichzeitig)?
- Combo „🔥 x2/x3" fällt auf?
- Prüfungs-Erfolg fühlt sich wie ein Fest an (Fanfare + Konfetti + Pokal)?
- Schrauber reagiert sichtbar auf Erfolg und Fehler?

- [ ] **Step 3: README aktualisieren**

In `README.md` die Status-Zeile ersetzen:

```markdown
- **Status:** Phase 1 (MVP) spielbar — Rennwagen, Reihen 1–10, Meisterprüfung, Garage
- **Lokal starten:** `python3 -m http.server 8080` und `http://localhost:8080` öffnen
- **Tests:** `npm test` (Node ≥ 20, keine Abhängigkeiten)
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Phase 1 (MVP) abgeschlossen: spielbarer Stand mit Rennwagen"
```

---

## Hinweise für die Ausführung

- **Reihenfolge einhalten:** Task 1–9 bauen die Fundamente, 10–14 die Screens, 15 schließt ab. Screens importieren nur, was in früheren Tasks entstanden ist.
- **Konventionen:** UI-Texte Deutsch mit echten Umlauten; interne Bezeichner Deutsch (wie im Code oben); keine zusätzlichen Abhängigkeiten einführen.
- **Engine bleibt DOM-frei:** In `js/engine/`, `js/store/`, `js/projects/` darf kein `window`/`document` auf Modulebene auftauchen — sonst brechen die Node-Tests.
- **Wenn ein manueller Check fehlschlägt:** erst Ursache verstehen (superpowers:systematic-debugging), nicht raten.
- **Design-Feinschliff:** Wer an Farben/Animationen schraubt, prüft gegen den Begeisterungs-Check in Task 15 Step 2 — das ist die Abnahme-Messlatte aus KONZEPT §5.
