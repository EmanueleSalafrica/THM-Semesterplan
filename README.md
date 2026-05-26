# MPM Projekt Team 2

Basisprojekt für das MPM-Gruppenprojekt.

## Projektstruktur

- `CSS/` enthält Stylesheets.
- `JS/` enthält eigene JavaScript-Dateien.
- `JS/lib/gsap/` enthält GSAP für die Offline-Nutzung.
- `Dokumente/` enthält zentrale Projektdokumentation wie Definition of Done, Retrospektive und Bildquellen.
- `data/` enthält bereitgestellte Projektdaten.

## Modulhandbuch Seiten-Struktur

Die CSS-freie Struktur-Preview für das Modulhandbuch liegt in:

[Modulhandbuch Struktur-Wireframe öffnen](./modulhandbuch-struktur-wireframe-preview.html)

Die gleiche Vorschau zeigt im Branch `MPM202602-19-modulhandbuch-struktur-inhalt` auch die eingebundenen Inhalte aus der geladenen Datenstruktur.

Damit die JSON-Daten geladen werden, muss die Vorschau über einen lokalen Server geöffnet werden:

[Modulhandbuch Struktur mit Inhalt lokal öffnen](http://127.0.0.1:8000/modulhandbuch-struktur-wireframe-preview.html)

Beim direkten Öffnen der Datei über `file://` kann der Browser das Laden der JSON-Datei blockieren; dann ist nur die Struktur ohne Inhalte sichtbar.

Die Vorschau zeigt den geplanten Ablauf der Seiten-Struktur:

- Startseite
- Semesterplan-Optionen
- Wahlpflichtfach-Auswahl
- generierter Semesterplan
- Schwerpunktwahl-Info
- Modulbeschreibung als Dialog

Offene Punkte:

- Der Inhalt für `Schwerpunktwahl-Info` fehlt noch, weil dafür noch keine finalen Inhalte vorliegen.
- Die englische Übersetzung fehlt noch, weil das Modulhandbuch bisher noch nicht auf Englisch bereitgestellt wurde.

## Git für das Team

Wer das Projekt noch nicht auf dem eigenen Rechner hat, klont es einmalig:

```bash
git clone https://git.thm.de/mibmpm2026/mpm-projekt-team-2.git
cd mpm-projekt-team-2
```

Wer das Projekt schon lokal hat, holt sich neue Änderungen mit:

```bash
git pull
```

Mit diesem Befehl kann geprüft werden, ob lokale Änderungen vorhanden sind:

```bash
git status
```

Wenn eigene Änderungen fertig sind, werden sie so gespeichert und hochgeladen:

```bash
git add .
git commit -m "Kurze Beschreibung der Änderung"
git push
```

## Arbeiten mit Branches

Jede Person arbeitet auf dem eigenen Ticket-Branch und nicht direkt auf `master`.

Vor der Arbeit zuerst den aktuellen Stand holen:

```bash
git checkout master
git pull
```

Dann in den passenden Branch wechseln:

```bash
git checkout BRANCH-NAME
```

Beispiel:

```bash
git checkout MPM202602-13-recherche-zu-gsap-animation
```

Während der Arbeit kann der aktuelle Stand geprüft werden:

```bash
git status
```

Wenn die Änderung fertig ist:

```bash
git add .
git commit -m "Kurze Beschreibung der Änderung"
git push
```

Falls der Branch lokal noch nicht bekannt ist, kann er so geholt werden:

```bash
git fetch
git checkout BRANCH-NAME
```

Änderungen aus einem Branch werden später über einen Merge Request in `master` übernommen.

## GSAP

GSAP ist lokal in Version `3.15.0` eingebunden.

Für HTML-Dateien kann GSAP so geladen werden:

```html
<script src="JS/lib/gsap/gsap.min.js"></script>
<script src="JS/api-client.js"></script>
<script src="JS/data-loader.js"></script>
<script src="JS/main.js"></script>
```

Die Anwendung soll GSAP nicht per CDN laden, damit sie offline lauffähig bleibt.

## GSAP testen

Jede Person im Team kann prüfen, ob GSAP nach dem Pull lokal funktioniert:

```bash
git pull
```

Danach die Datei `gsap-test.html` im Browser öffnen.

Der Test ist erfolgreich, wenn:

- sich das Quadrat bewegt,
- die Seite `GSAP ist lokal eingebunden` anzeigt,
- die Version `3.15.0` angezeigt wird.

Die Testdatei lädt GSAP direkt aus dem Repository:

```html
<script src="JS/lib/gsap/gsap.min.js"></script>
```

## Datenstruktur laden

Die vorgegebene JSON-Datei `data/module-mib.json` wird zur Laufzeit über `JS/data-loader.js` geladen.

HTML-Dateien binden den Loader vor `JS/main.js` ein:

```html
<script src="JS/data-loader.js"></script>
<script src="JS/main.js"></script>
```

Nach erfolgreichem Laden sind die Daten im Browser verfügbar:

```js
window.MPMProjekt.moduldaten
window.MPMProjekt.module
```

Zum Testen kann `datenstruktur-test.html` über einen lokalen Server geöffnet werden. Der Test ist erfolgreich, wenn die Seite `Moduldaten geladen` anzeigt und in der Browser-Konsole eine Tabelle mit den ersten Modulen ausgegeben wird.

## API-Anbindung testen

Die Datei `JS/api-client.js` stellt eine Funktion für die CurrGen-API bereit:

```js
window.MPMProjekt.api.generiereStudienplan({
  geschwindigkeit: 100,
  schwerpunkt: "WM",
  startJahreszeit: "W",
  vorhandeneModule: [1, 4, 5],
  ausgeschlosseneModule: [12],
  maxAnzahlLoesungen: 2
})
```

Die Funktion sendet einen JSON-POST an:

```text
https://turing.iem.thm.de/currgen/api/v1/generate-schedule
```

Die Antwort der API wird in der Browser-Konsole ausgegeben. Zum Testen kann `api-test.html` geöffnet werden. Dort können Geschwindigkeit, Schwerpunkt, Start-Jahreszeit und Modulnummern eingetragen werden.

Hinweis: Der Endpoint liefert serverseitig erfolgreich Daten. Falls ein Browser die Anfrage wegen CORS blockiert, muss die Anwendung später über eine freigegebene Herkunft oder einen Backend-Proxy angebunden werden.

## Tailwind CSS

Tailwind CSS ist zentral für das Team vorbereitet. Die Konfiguration liegt in `tailwind.config.js`; dort sind die THM-CD-Farben und die Schriftfamilie hinterlegt.

Verwendete THM-CD-Werte:

- Hauptfarbe Grün: `#80ba24`
- Hauptfarbe Grau: `#4a5c66`
- Zusatzfarben für Hervorhebungen und Infografiken: `thm-red`, `thm-yellow`, `thm-cyan`, `thm-blue`
- Schrift: `DIN Pro` mit `DIN 2014`, `Arial`, `Helvetica` und `sans-serif` als Fallbacks

Einmalig nach dem Klonen oder Pullen installieren:

```bash
npm install
```

Falls PowerShell die Ausführung von `npm` blockiert, können die Befehle mit `npm.cmd` ausgeführt werden.

CSS für die Anwendung bauen:

```bash
npm run build:css
```

Beim Entwickeln kann Tailwind automatisch neu gebaut werden:

```bash
npm run dev:css
```

HTML-Dateien binden weiterhin `CSS/style.css` ein. Eigene Tailwind-Erweiterungen gehören in `CSS/tailwind.css`, damit alle im Team dieselbe Grundlage nutzen.

## Grundregeln

- Die Anwendung wird mobile first entwickelt.
- Die Anwendung unterstützt mobile Geräte und FullHD-Auflösung `1920x1080`.
- Bilder und Dokumentation werden zentral über Git verfügbar gemacht.
- Alle verwendeten Bilder müssen frei nutzbar sein und in der Bildquellen-Dokumentation verzeichnet werden.
- Bei Fragen oder Unsicherheiten werden Product Owner oder Stakeholder aktiv eingebunden.

## Authors

- Emanuele Salafrica
- Morrigan Schuh
- Jeannett Rudi
- Annette Taborik
- Schabana Ghazizadeh
