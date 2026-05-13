# MPM Projekt Team 2

Basisprojekt für das MPM-Gruppenprojekt.

## Projektstruktur

- `CSS/` enthält Stylesheets.
- `JS/` enthält eigene JavaScript-Dateien.
- `JS/lib/gsap/` enthält GSAP für die Offline-Nutzung.
- `Dokumente/` enthält zentrale Projektdokumentation wie Definition of Done, Retrospektive und Bildquellen.
- `data/` enthält bereitgestellte Projektdaten.

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
