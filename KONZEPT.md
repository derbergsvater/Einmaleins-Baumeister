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
- Automatisierung des kleinen Einmaleins (1·1 bis 10·10) — **nur Multiplikation**,
  keine Division, kein Scope-Creep
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
5. **Dynamisch statt Stoppuhr.** Es gibt kein absolutes Zeitlimit und keine fremde
   Norm. Die App misst leise das eigene Niveau des Kindes (Trefferquote und Tempo
   pro Reihe) und passt die Anforderungen daran an — das Kind tritt immer nur gegen
   sich selbst an. Tempo-Elemente kommen erst später dazu und bleiben Bonus, nie
   Bedingung (siehe 3.4 Level-System).

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
- **Grafik-Anspruch:** liebevoll gestaltete Illustrationen mit Tiefe (Verläufe,
  Glanzlichter, weiche Schatten) statt simpler Flat-Formen. Die Objekte müssen
  „haben wollen" auslösen — das Kind baut sie schließlich Stunde um Stunde. Die
  SVGs werden mit entsprechendem Aufwand gestaltet und animiert (drehende Räder,
  flackernde Auspuff-Flammen, wehende Fahnen).
- Die Addon-Reihenfolge ist pro Projekt fest an die Reihen gekoppelt
  (Reihe 1 → Addon 1, … Reihe 10 → Addon 10). Das stärkste Addon
  („Fliegendes Auto") gibt es erst, wenn **alle 10 Reihen** gemeistert sind.

### 3.2 Modi

| Modus | Beschreibung | Phase |
|-------|-------------|-------|
| **Werkstatt** (Hauptmodus) | Reihe wählen, Aufgaben lösen, Bauteile montieren. Pro richtiger Antwort füllt sich zusätzlich der Trainingsbalken der Reihe. | MVP |
| **Meisterprüfung** | Freigeschaltet, wenn der Trainingsbalken einer Reihe voll ist: 12 gemischte Aufgaben der Reihe, höchstens 1 Fehler erlaubt, **kein Zeitlimit**. Bestanden → Addon + Pokal. Nicht bestanden → kein Verlust, einfach weiter trainieren. | MVP |
| **Turbo-Prüfung** | Wiederholbare Prüfung einer bereits gemeisterten Reihe mit **dynamischem Tempo-Ziel**: Das Kind muss nur sein eigenes Trainingstempo schlagen (siehe 3.4). Belohnung: Turbo-Stern auf dem Pokal. Reines Bonus-Ziel — Addons hängen nie an der Zeit. | Phase 3 |
| **Garage / Schlosshof** (Sammlung) | Das gebaute Objekt mit allen Addons bestaunen, drehen, Addons an-/abschalten. Pokal-Regal mit den gemeisterten Reihen. | MVP (einfach), Ausbau Phase 2 |
| **Blitzrunde** | Freiwilliger Tempomodus: so viele Aufgaben wie möglich in 60 Sekunden, Highscore pro Profil. | Phase 3 |

### 3.3 Fortschritt & Motivation

- **Trainingsbalken pro Reihe:** füllt sich durch richtige Antworten (Richtwert: 20
  Punkte = voll). Erst dann ist die Meisterprüfung wählbar — verhindert, dass Kinder
  sich durch Raten zur Prüfung mogeln.
- **Addon-Vorschau (Bauplan):** Während eine Reihe trainiert wird, erscheint ihr
  Addon als blasser Bauplan auf dem Auto und wird mit jedem richtigen Ergebnis
  sichtbarer. Die Meisterprüfung „schraubt es fest" (volle Farbe). So baut jedes
  Rechnen sichtbar weiter — auch wenn der Grundbau längst fertig ist.
- **Combo-Schrauber:** Mehrere richtige Antworten in Folge geben Bonuspunkte auf den
  Trainingsbalken (x1 → x2 → x3, sichtbar als glühender Schraubenschlüssel). Starke
  Rechner kommen so schneller voran und langweilen sich nicht; schwächere Kinder
  verlieren bei Fehlern nichts — die Combo beginnt einfach neu.
- **Pokale:** ein Pokal pro gemeisterter Reihe, sichtbar im Pokal-Regal.
- **Baufortschritt bleibt erhalten:** Das Objekt wird nie zurückgebaut. Wer eine
  Prüfung nicht besteht, verliert nichts.
- **Projektwechsel möglich:** Gemeisterte Reihen gelten profilweit. Wechselt das Kind
  vom Rennwagen zum Zauberschloss, sind die Addons der bereits gemeisterten Reihen
  dort sofort freigeschaltet — kein Zwang, alles doppelt zu rechnen. Nur der Grundbau
  wird pro Projekt neu erbaut (das ist der schnelle, spaßige Teil).

### 3.4 Dynamisches Level-System — Balance ohne Frust

Die Schwierigkeit passt sich unsichtbar an das einzelne Kind an. Es gibt keine
wählbaren Schwierigkeitsstufen und keine Vergleiche mit anderen — Bezugsgröße ist
immer die eigene bisherige Leistung:

1. **Niveau-Messung:** Die Engine führt pro Reihe zwei einfache Werte: Trefferquote
   (gleitender Durchschnitt der letzten 20 Antworten) und Median-Antwortzeit.
2. **Aufgabenauswahl:** Schwache Aufgaben (oft falsch / auffällig langsam) kommen
   häufiger, sichere Aufgaben seltener — das Kind übt automatisch da, wo es hakt,
   ohne es zu merken.
3. **Einstieg gestuft:** Neue Reihen beginnen mit den leichten Ankeraufgaben
   (·1, ·2, ·5, ·10), dann kommen die schweren Nachbarn dazu (·7, ·8, ·9 gemischt
   mit Tauschaufgaben). Wer schnell sicher ist, überspringt die Aufwärmphase.
4. **Tempo-Ziele nur relativ:** Wo später Zeit ins Spiel kommt (Turbo-Prüfung,
   Blitzrunde), ist das Ziel immer „schlag dein eigenes Tempo" — berechnet aus der
   eigenen Median-Antwortzeit mit großzügigem Puffer. Ein langsames Kind bekommt
   ein langsames, schaffbares Ziel; ein schnelles Kind ein sportliches.
5. **Frust-Bremse:** Nach 3 Fehlern in Folge schaltet die Engine automatisch zwei
   leichte Erfolgsaufgaben dazwischen (bekannte, sichere Aufgaben), damit das Kind
   wieder ein Erfolgserlebnis hat und im Spiel bleibt.

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

## 5. UI/UX — Mobile First, gebaut um zu begeistern

**Qualitätsanspruch:** Das Spiel muss Kinder begeistern — Grafik, Animation und Sound
sind Kernfeatures, kein Beiwerk. Messlatte ist eine moderne Kinder-App, nicht ein
Arbeitsblatt mit Buttons.

### Layout
- **Portrait-Layout** als Standard (Smartphone), Tablet bekommt mehr Luft.
- Aufbau Werkstatt-Screen: oben das Bauobjekt (immer sichtbar — die Belohnung vor
  Augen), Mitte die Aufgabe groß („7 · 4 = ?"), unten ein **eigener Ziffernblock**
  (große Touch-Flächen, kein System-Keyboard, kein Zoom-Gehopse).
- Antwort-Eingabe: Ziffern tippen + Häkchen, oder Auto-Submit bei eindeutiger Stellenzahl.
- Große Schrift, hoher Kontrast, keine Werbung, keine externen Links — Eltern-tauglich.
- Kindgerechte Sprache, kurze Texte, Vorlese-Icons sind nicht nötig (Zielgruppe kann lesen).

### Begeisterungs-Momente (Pflichtprogramm)
- **Jede Montage ist ein Mini-Event:** Bauteil schwebt ein, Schrauber-Sound, Funken,
  das Objekt wackelt kurz — richtige Antworten fühlen sich körperlich gut an
  („Game Juice": Easing-Animationen, Partikel, haptisches Feedback via Vibration API).
- **Addons verändern das Objekt spürbar:** Der Turbo lässt den Motor tiefer brummen,
  die Neon-Beleuchtung pulsiert, das fliegende Auto hebt in der Garage tatsächlich ab.
  Jedes Addon hat einen sichtbaren UND hörbaren Effekt — sonst fliegt es raus.
- **Feier-Momente:** Bestandene Meisterprüfung = große Konfetti-Sequenz, Pokal-Übergabe
  mit Fanfare, das neue Addon wird in einer kurzen Showfahrt präsentiert.
- **Maskottchen „Schrauber":** ein kleiner Werkstatt-Roboter, der mitfiebert — jubelt
  bei Combos, reicht Werkzeug bei der Montage, tröstet nach Fehlern („Gleich
  klappt's!"). Gibt dem Spiel ein Gesicht und den Texten eine Stimme.
- **Lebendige Garage:** Das fertige Objekt steht nie still — Räder federn, Fahnen
  wehen, Lichter blinken. Addons lassen sich antippen und reagieren.
- Sounds und Vibration abschaltbar (Eltern-Knopf), Animationen respektieren
  `prefers-reduced-motion`.

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
| **3 — Tempo & Tiefe** | Turbo-Prüfung (dynamisches Tempo-Ziel), Blitzrunde mit Highscore, PWA offline, weitere Bauprojekte (Rakete, Dino, Piratenschiff, Roboter) | Langzeitmotivation |
| **4 — Optional** | Profil-Übertrags-Code (QR), Eltern-Ansicht (welche Reihen sitzen, welche Aufgaben haken) | Mehrgeräte-Nutzung, Eltern-Mehrwert |

## 8. Entscheidungen (abgestimmt am 12.06.2026)

1. **Name:** „1x1 Baumeister" ist bestätigt.
2. **Prüfungs-Balance:** Meisterprüfung im MVP ohne Zeitlimit. Tempo kommt später
   (Phase 3) als Turbo-Prüfung dazu — dynamisch am eigenen Niveau des Kindes
   bemessen, immer Bonus, nie Bedingung. Das adaptive Level-System (3.4) hält die
   Balance: Das Kind darf den Spaß nicht verlieren.
3. **Nur Multiplikation:** keine Divisions-/Umkehraufgaben, auch nicht als Bonus.
4. **Grafik & Spielgefühl:** hoher Qualitätsanspruch — das Spiel muss Kinder
   begeistern (siehe Abschnitt 5). Aufwand für Illustrationen, Animationen und
   Sound wird bewusst eingeplant.
