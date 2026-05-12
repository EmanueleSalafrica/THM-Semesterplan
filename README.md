# MPM Projekt Team 2

Basisprojekt für das MPM-Gruppenprojekt.

## Projektstruktur

- `CSS/` enthält Stylesheets.
- `JS/` enthält eigene JavaScript-Dateien.
- `JS/lib/gsap/` enthält GSAP für die Offline-Nutzung.
- `Dokumente/` enthält zentrale Projektdokumentation wie Definition of Done, Retrospektive und Bildquellen.
- `data/` enthält bereitgestellte Projektdaten.

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
