# Scrum-Protokoll Git-Aktivitäten

Stand: 20.05.2026

Repository: `mibmpm2026/mpm-projekt-team-2`

Dieses Protokoll fasst die Git-Aktivitäten der letzten Projekttage vereinfacht zusammen. Es ist für die Erklärung im Team bzw. durch den Scrum Master gedacht und ersetzt keine detaillierte technische Code-Review.

## Kurzüberblick

- Das Basisprojekt wurde eingerichtet und dokumentiert.
- GSAP wurde lokal ins Repository eingebunden und mit einer Testseite überprüfbar gemacht.
- Tailwind CSS wurde vorbereitet und in `master` übernommen.
- Die JSON-Datenstruktur wurde zur Laufzeit ladbar gemacht.
- Eine allgemeine API-Abfrage per JavaScript wurde implementiert.
- Eine GSAP-Recherche mit Animationsbeispiel wurde ergänzt.
- Mehrere Teammitglieder haben ihre Namen in der README ergänzt.

## Beiträge nach Personen

### Benjamin Einert

- Hat das ursprüngliche Repository angelegt.
- Hat den Ordner `data/` vorbereitet.
- Hat die Datei `data/module-mib.json` mit den Modulhandbuch-Daten hochgeladen.

Wichtige Commits:

- `413f8f0` Initial commit
- `6e0da65` Add new directory
- `35215ca` Upload New File

### Emanuele Salafrica

- Hat die Basisstruktur des Projekts eingerichtet.
- Hat die Ordner `CSS`, `JS` und `Dokumente` angelegt.
- Hat GSAP lokal/offline in `JS/lib/gsap/` eingebunden.
- Hat Dokumente wie Definition of Done, Bildquellen und Retrospektive vorbereitet.
- Hat eine GSAP-Testseite erstellt.
- Hat die README um Git-Anleitung und Branch-Arbeitsweise ergänzt.
- Hat die Datenstruktur aus `data/module-mib.json` zur Laufzeit ladbar gemacht.
- Hat eine allgemeine API-Abfrage per JavaScript implementiert.
- Hat die Branches für Datenstruktur und API in `master` gemerged.

Wichtige Commits:

- `93ac061` Basisprojektstruktur einrichten
- `467df95` GSAP Testseite ergänzen
- `b07c0b8` Git-Anleitung für Team ergänzen
- `86edfaf` Branch-Arbeitsweise dokumentieren
- `65987bd` Datenstruktur zur Laufzeit laden
- `0bd31c0` API-Abfrage per JavaScript implementieren
- `0714e6d` Merge Datenstruktur laden
- `c826e3d` Merge API Anbindung herstellen

### Schabana Ghazizadeh

- Hat ihren Namen in der README ergänzt.
- Hat Tailwind CSS vorbereitet.
- Hat `package.json`, `package-lock.json`, `tailwind.config.js` und `postcss.config.js` ergänzt.
- Hat `CSS/tailwind.css` angelegt und `CSS/style.css` als generierte Tailwind-Ausgabe vorbereitet.

Wichtige Commits:

- `a3e6e29` Add contributor name
- `473025c` Configure Tailwind CSS

### Annette Taborik / Anky

- Hat einen Namen in der README ergänzt.
- Hat eine GSAP-Recherche mit Animationsbeispiel ergänzt.
- Hat dafür den Ordner `GSAP/` mit HTML, CSS, JavaScript und Recherche-Dokumentation angelegt.
- Hat den Branch zur GSAP-Recherche in `master` übernommen.

Wichtige Commits:

- `fa3ac4b` Name hinzugefügt
- `8528a37` gsap recherche mit Animation
- `f75da3c` Merge branch `MPM202602-13-recherche-zu-gsap-animation`

### Jeannett Rudi

- Hat ihren Namen in der README ergänzt.

Wichtiger Commit:

- `a6dd3a8` Name hinzugefügt

### Morrigan Schuh

- Hat einen Authors-Eintrag in der README ergänzt.

Wichtiger Commit:

- `fedeaf2` Added authors entry in README

## Technischer Stand nach den Arbeiten

### GSAP

- GSAP liegt lokal im Repository unter `JS/lib/gsap/`.
- Die Testdatei `gsap-test.html` zeigt visuell, ob GSAP funktioniert.
- Eine zusätzliche GSAP-Recherche mit Beispielanimation liegt im Ordner `GSAP/`.

### Tailwind CSS

- Tailwind ist über `package.json` und `tailwind.config.js` vorbereitet.
- Die CSS-Ausgabe liegt in `CSS/style.css`.
- Eigene Tailwind-Erweiterungen können in `CSS/tailwind.css` gepflegt werden.

### Datenstruktur

- Die Datei `data/module-mib.json` enthält die Modulhandbuch-Daten.
- `JS/data-loader.js` lädt diese JSON-Datei zur Laufzeit.
- Die Daten sind im Browser unter `window.MPMProjekt.moduldaten` und `window.MPMProjekt.module` verfügbar.
- `datenstruktur-test.html` dient als Testseite.

### API-Anbindung

- `JS/api-client.js` enthält eine allgemeine Funktion für API-Abfragen.
- Die Funktion ist über `window.MPMProjekt.api.starteApiAbfrage(url)` verfügbar.
- `api-test.html` dient als Testseite.

## Noch offene Themen-Branches

- `MPM202602-8-grundlagen-struktur-und-analyse`
- `MPM202602-11-storyboard-zum-modulhandbuch`
- `MPM202602-12-storyboard-zur-schwerpunktwahl`
- `MPM202602-16-layout-zum-modulhandbuch-am-smartphone`
- `MPM202602-17-layout-zum-modulhandbuch-in-fullhd`
- `MPM202602-18-modulhandbuch-seiten-struktur`
- `MPM202602-19-modulhandbuch-struktur-inhalt`
- `MPM202602-20-modulhandbuch-seiten-formatierung`

## Erklärung für Scrum Master

Als Scrum Master kann man zusammenfassen:

- Das Team hat zuerst die technische Projektbasis geschaffen.
- Danach wurden Bibliotheken und Arbeitsregeln dokumentiert.
- Anschließend wurden Datenquellen vorbereitet: lokal per JSON und extern per API.
- Damit kann das Modulhandbuch später dynamisch aufgebaut werden, statt Inhalte fest in HTML zu schreiben.
- Parallel wurde bereits eine GSAP-Recherche mit Beispielanimation ergänzt.
- Die nächsten sinnvollen Schritte liegen bei Analyse, Storyboard, Inhalt, Seitenstruktur und Layout.
