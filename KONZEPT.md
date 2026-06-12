# 1x1 Baumeister — Konzept

> Arbeitstitel: **1x1 Baumeister** · „Rechne richtig — bau dein Ding!"
> Stand: 12.06.2026 · Status: Entwurf zur Abstimmung

## 1. Vision

Eine Webapp (mobile first), die Grundschülern das kleine Einmaleins (Reihen 1 bis 10)
beibringt, indem das Rechnen selbst zur Belohnung wird: Jede richtig gelöste Aufgabe
baut sichtbar an einem Wunschobjekt weiter. Das Kind sucht sich aus, **was** es bauen
will (z. B. einen Rennwagen) — die Mathematik ist das Werkzeug, mit dem gebaut wird.

**Zielgruppe:** Kinder der Klassen 2 bis 4 (ca. 7–10 Jahre), Nutzung auf dem
Familien-Tablet oder Eltern-Smartphone, kurze Sessions (5–15 Minuten).

## 2. Pädagogisches Konzept

### Lernziele
- Automatisierung des kleinen Einmaleins (1·1 bis 10·10)
- Reihenverständnis: jede Zahlenreihe wird einzeln trainiert und geprüft
- Fehler sind Teil des Spiels: falsche Antworten kosten nichts, sie verzögern nur den Bau

### Didaktische Prinzipien
1. **Eine Reihe nach der anderen.** Das Kind wählt eine Zahlenreihe (z. B. die 4er-Reihe)
   und trainiert sie, bis die Meisterprüfung freigeschaltet ist.
2. **Gemischte Abfrage.** Innerhalb einer Reihe werden Aufgaben gemischt gestellt
   (4·7, 7·4, 4·3 …), inklusive Tauschaufgaben.
3. **Schwache Aufgaben kommen öfter.** Die Aufgaben-Engine merkt sich pro Profil,
   welche Aufgaben falsch oder langsam beantwortet wurden, und stellt diese häufiger
   (einfache Gewichtung, kein komplexes Spaced-Repetition-System).
4. **Kein Strafdruck.** Bei einer falschen Antwort wird die richtige Lösung gezeigt
   und die Aufgabe kommt später noch einmal. Es gibt keine Leben, keinen Game-Over.
5. **Zeit ist optional.** Im Werkstatt-Modus gibt es kein Zeitlimit. Tempo kommt erst
   später freiwillig dazu (Blitzrunde, Phase 3).

## 3. Spielkonzept

### Kernschleife (Game Loop)
```
Aufgabe lösen → richtig? → Bauteil wird sichtbar montiert (Animation + Sound)
                → falsch? → Lösung kurz zeigen, Aufgabe kommt später erneut
```

### 3.1 Bauprojekte (Themen)

Das Kind wählt beim Start ein Bauprojekt. Jedes Projekt besteht aus ca. **12 Bauteilen**
(Grundbau) und **10 Addons** (eines pro gemeisterter Zahlenreihe).

| Projekt | Grundbau (Beispiele) | Addons (Beispiele) |
|---------|---------------------|--------------------|
| **Rennwagen** (MVP) | Chassis, Räder, Motor, Sitz, Lenkrad, Karosserie, Scheinwerfer, Startnummer | Sport-Auspuff, Rennreifen, Heckflügel, Turbo, Neon-Unterboden, Rennlackierung, Flügeltüren, Raketenantrieb, Boost-Knopf, **Fliegendes Auto** (alle 10 Reihen) |
| **Zauberschloss** (MVP) | Fundament, Mauern, Türme, Tor, Fenster, Dächer, Fahne | Zugbrücke, Drachenwache, Regenbogen, Zaubergarten, Glitzertürme, Geheimgang, Einhornstall, Sternenhimmel, Feuerwerk, **Schwebendes Schloss** |
| Rakete (Phase 2) | … | … |
| Dino-Park (Phase 2) | … | … |
| Piratenschiff (Phase 2) | … | … |
| Roboter (Phase 2) | … | … |

- Grafiken als **SVG mit benannten Ebenen**: Jedes Bauteil ist eine SVG-Gruppe, die
  erst unsichtbar ist und beim Freischalten mit Animation eingeblendet wird.
  Dadurch sind keine einzelnen Bilddateien pro Bauzustand nötig.
- Die Addon-Reihenfolge ist pro Projekt fest an die Reihen gekoppelt
  (Reihe 1 → Addon 1, … Reihe 10 → Addon 10). Das stärkste Addon
  („Fliegendes Auto") gibt es erst, wenn **alle 10 Reihen** gemeistert sind.

### 3.2 Modi

| Modus | Beschreibung | Phase |
|-------|-------------|-------|
| **Werkstatt** (Hauptmodus) | Reihe wählen, Aufgaben lösen, Bauteile montieren. Pro richtiger Antwort füllt sich zusätzlich der Trainingsbalken der Reihe. | MVP |
| **Meisterprüfung** | Freigeschaltet, wenn der Trainingsbalken einer Reihe voll ist: 12 gemischte Aufgaben der Reihe, höchstens 1 Fehler erlaubt. Bestanden → Addon + Pokal. Nicht bestanden → kein Verlust, einfach weiter trainieren. | MVP |
| **Garage / Schlosshof** (Sammlung) | Das gebaute Objekt mit allen Addons bestaunen, drehen, Addons an-/abschalten. Pokal-Regal mit den gemeisterten Reihen. | MVP (einfach), Ausbau Phase 2 |
| **Blitzrunde** | Freiwilliger Tempomodus: so viele Aufgaben wie möglich in 60 Sekunden, Highscore pro Profil. | Phase 3 |

### 3.3 Fortschritt & Motivation

- **Trainingsbalken pro Reihe:** füllt sich durch richtige Antworten (z. B. 20 richtige
  Antworten = voll). Erst dann ist die Meisterprüfung wählbar — verhindert, dass Kinder
  sich durch Raten zur Prüfung mogeln.
- **Pokale:** ein Pokal pro gemeisterter Reihe, sichtbar im Pokal-Regal.
- **Baufortschritt bleibt erhalten:** Das Objekt wird nie zurückgebaut. Wer eine
  Prüfung nicht besteht, verliert nichts.
- **Projektwechsel möglich:** Gemeisterte Reihen gelten profilweit. Wechselt das Kind
  vom Rennwagen zum Zauberschloss, sind die Addons der bereits gemeisterten Reihen
  dort sofort freigeschaltet — kein Zwang, alles doppelt zu rechnen. Nur der Grundbau
  wird pro Projekt neu erbaut (das ist der schnelle, spaßige Teil).

## 4. Benutzeraccounts: lokal und kindersicher

„Einfachste Benutzeraccounts" wird wörtlich genommen — **Geräte-Profile ohne Server**:

- Beim ersten Start: „Wie heißt du?" + Avatar aussuchen (Emoji/Icon-Auswahl). Fertig.
- Mehrere Profile pro Gerät (Geschwister), Profilwahl auf dem Startbildschirm.
- Kein Passwort, keine E-Mail, keine Registrierung, keine personenbezogenen Daten
  auf einem Server → DSGVO-unkritisch, was bei einer Kinder-App das stärkste Argument ist.
- Speicherung in `localStorage` (JSON pro Profil).
- **Später (Phase 4, optional):** Übertrags-Code zum Mitnehmen des Fortschritts auf
  ein anderes Gerät (Profil als kompakter Code/QR exportieren und importieren) —
  Geräte-Sync ohne Backend.

*Verworfene Alternative:* Server-Accounts (Node/Express + SQLite). Bietet
geräteübergreifenden Fortschritt von Anfang an, kostet aber Hosting, Wartung und
DSGVO-Aufwand (Kinderdaten!). Bei Bedarf später nachrüstbar, die Datenstruktur
(JSON-Profil) ist darauf vorbereitet.

## 5. UI/UX — Mobile First

- **Portrait-Layout** als Standard (Smartphone), Tablet bekommt mehr Luft.
- Aufbau Werkstatt-Screen: oben das Bauobjekt (immer sichtbar — die Belohnung vor
  Augen), Mitte die Aufgabe groß („7 · 4 = ?"), unten ein **eigener Ziffernblock**
  (große Touch-Flächen, kein System-Keyboard, kein Zoom-Gehopse).
- Antwort-Eingabe: Ziffern tippen + Häkchen, oder Auto-Submit bei eindeutiger Stellenzahl.
- Animation und Sound bei Montage (Schrauber-Geräusch, Funken), abschaltbar.
- Große Schrift, hoher Kontrast, keine Werbung, keine externen Links — Eltern-tauglich.
- Kindgerechte Sprache, kurze Texte, Vorlese-Icons sind nicht nötig (Zielgruppe kann lesen).

## 6. Technik

### Empfehlung: Vanilla JS (ES-Module) + GitHub Pages
Wie beim Bruchland-Spiel bewährt: kein Build-Tool, kein Backend, kein Framework.

- **HTML/CSS/JS (ES-Module)**, eine Single-Page-App mit einfachem Screen-Router.
- **SVG-Grafiken** inline, Bauteile als Gruppen mit IDs, Einblendung per CSS-Klassen.
- **`localStorage`** für Profile und Fortschritt.
- **PWA-Basics** (Manifest + simpler Service Worker) → „Zum Homescreen hinzufügen",
  offline spielbar. Geht ohne Bundler.
- **Hosting: GitHub Pages** — kostenlos, kein Server, sofort deploybar.
- Tests: kleine Pure-Function-Module (Aufgaben-Engine, Fortschrittslogik) ohne
  DOM-Abhängigkeit, testbar mit Node (`node --test`).

*Alternativen (verworfen für den MVP):*
- **React + Vite:** angenehmer bei wachsender UI-Komplexität, aber Build-Pipeline
  und Abhängigkeiten für ein Spiel dieser Größe nicht nötig.
- **FastAPI/Node-Backend:** nur nötig, wenn Server-Accounts kommen (siehe Abschnitt 4).

### Projektstruktur (geplant)
```
Einmaleins-Baumeister/
├── index.html
├── css/
├── js/
│   ├── app.js            # Screen-Router, Init
│   ├── engine/
│   │   ├── tasks.js      # Aufgaben-Generierung + Gewichtung (pure functions)
│   │   └── progress.js   # Trainingsbalken, Prüfungslogik, Freischaltungen
│   ├── store/profile.js  # Profile, localStorage, Migration
│   └── screens/          # start, profilwahl, werkstatt, pruefung, garage
├── assets/
│   ├── projects/         # SVGs der Bauprojekte (rennwagen.svg, schloss.svg …)
│   └── sounds/
├── tests/
└── docs/                 # Konzept, Plan
```

### Datenmodell (localStorage, JSON pro Profil)
```json
{
  "id": "p1",
  "name": "Ella",
  "avatar": "🦄",
  "aktivesProjekt": "zauberschloss",
  "reihen": {
    "4": { "training": 14, "gemeistert": false },
    "5": { "training": 20, "gemeistert": true }
  },
  "aufgabenStats": { "7x8": { "falsch": 3, "richtig": 5 } },
  "projekte": { "rennwagen": { "grundbau": 8 }, "zauberschloss": { "grundbau": 12 } }
}
```
(Addons ergeben sich aus `reihen.*.gemeistert` — keine doppelte Buchführung.)

## 7. Roadmap

| Phase | Inhalt | Ergebnis |
|-------|--------|----------|
| **1 — MVP** | Profile (Name + Avatar), Werkstatt-Modus, Aufgaben-Engine mit Gewichtung, 1 Bauprojekt (Rennwagen) komplett mit 12 Bauteilen + 10 Addons, Meisterprüfung, einfache Garage | Spielbar, mit eigenen Kindern testbar |
| **2 — Zweites Projekt + Politur** | Zauberschloss, Projektwechsel, Pokal-Regal, Sounds & Animationen verfeinern | Wahlfreiheit „Junge/Mädchen/Geschmack" |
| **3 — Tempo & Tiefe** | Blitzrunde mit Highscore, PWA offline, weitere Bauprojekte (Rakete, Dino, Piratenschiff, Roboter) | Langzeitmotivation |
| **4 — Optional** | Profil-Übertrags-Code (QR), Eltern-Ansicht (welche Reihen sitzen, welche Aufgaben haken) | Mehrgeräte-Nutzung, Eltern-Mehrwert |

## 8. Offene Fragen (zur Abstimmung)

1. **Name:** „1x1 Baumeister" ist Arbeitstitel — andere Ideen willkommen.
2. **Meisterprüfungs-Härte:** 12 Aufgaben / max. 1 Fehler ohne Zeitlimit — streng genug?
   Alternativ mit sanftem Zeitlimit (z. B. 10 Sekunden pro Aufgabe) für echte Automatisierung.
3. **Divisionsaufgaben** (Umkehraufgaben, 28 : 4 = ?) als Bonus in höheren Reihen — gewünscht
   oder bewusst draußen lassen?
4. **Grafikstil:** selbstgebaute Flat-SVGs (machbar ohne Grafiker) — reicht das, oder soll
   ein illustrativerer Stil angestrebt werden (mehr Aufwand)?
