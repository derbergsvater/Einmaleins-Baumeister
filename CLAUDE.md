# 1x1 Baumeister

Lernspiel-Webapp: Grundschüler trainieren das kleine Einmaleins (Reihen 1–10),
indem richtige Antworten sichtbar ein Wunschobjekt (z. B. Rennwagen) zusammenbauen.
Gemeisterte Zahlenreihen schalten Addons frei.

**Konzept:** siehe `KONZEPT.md` (maßgeblich für alle Design-Entscheidungen).

## Tech-Stack
- Vanilla JS (ES-Module), kein Build-Tool, kein Backend
- SVG-Grafiken mit benannten Bauteil-Gruppen, Einblendung per CSS
- Profile/Fortschritt in `localStorage` (Geräte-Profile, keine Server-Accounts)
- Hosting: GitHub Pages aus `main` (Root), public Repo → https://derbergsvater.github.io/Einmaleins-Baumeister/
- PWA: `manifest.webmanifest` + `sw.js` (Netz zuerst, Cache als Offline-Rückfall — Updates kommen ohne Versionspflege an)
- Browser-Check aller Bildschirmgrößen: `e2e/rundgang.mjs` (iPad hoch/quer, altes iPad, Handy) — Überlauf muss 0 sein
- Tests: `node --test` für Engine-Module (`js/engine/` muss DOM-frei bleiben)

## Regeln
- Mobile first (Portrait, Touch-Ziffernblock, kein System-Keyboard)
- Sprache im UI: Deutsch, kindgerecht, echte Umlaute
- Keine Tracker, keine externen Requests zur Laufzeit, keine personenbezogenen Daten
- Aufgaben-/Fortschrittslogik als pure functions halten (testbar ohne Browser)
- **Nur Multiplikation** (1·1 bis 10·10) — keine Division, kein Scope-Creep
- **Qualitätsanspruch:** muss Kinder begeistern — Animationen, Sound und
  Feier-Momente sind Kernfeatures, kein Beiwerk (KONZEPT.md Abschnitt 5)
- Schwierigkeit immer dynamisch am eigenen Niveau des Kindes, nie absolute
  Zeitlimits als Bedingung (KONZEPT.md Abschnitt 3.4)
