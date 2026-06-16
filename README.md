# Gemüsekiste

Web-App zur Auswahl von Gemüsesorten per Kachel-Tipp, mit Live-Gesamtpreis und Admin-Verwaltung für Sorten/Preise.

Es gibt zwei Varianten:

- **Hauptversion (dieser Ordner):** Node.js-Server, Daten in einer CSV-Datei – geeignet wenn mehrere Geräte auf dieselben Preise/Sorten zugreifen sollen.
- **`static-version/`:** Reines HTML/CSS/JS ohne Server. Einfach `static-version/index.html` doppelklicken oder die Dateien auf einen geteilten Ordner/Webspace legen. Daten liegen dann im Browser-Speicher (localStorage) – das heißt, Änderungen in der Verwaltung gelten nur für den Browser/Rechner, auf dem man sie vornimmt, nicht automatisch für alle Geräte.

## Start

**Per Doppelklick:**
- Windows: `start.bat` doppelklicken
- Mac: `start.command` doppelklicken (beim ersten Mal ggf. Rechtsklick → "Öffnen" wegen Sicherheitswarnung)

**Per Terminal:**
```
node server.js
```

Danach im Browser `http://localhost:3000` öffnen. Standardport: `3000` (mit `PORT` env var anpassbar).

## Bedienung

- Kachel antippen: +1
- Kachel lange drücken (ca. 0,5s): -1
- "Auswahl zurücksetzen": alle Mengen auf 0

## Verwaltung

Aufrufbar unter `/admin/`. Standardpasswort: `gemuese123` (über env var `ADMIN_PASSWORD` änderbar).

In der Verwaltung können Gemüsesorten angelegt, Preise gepflegt und Sorten aktiv/inaktiv gesetzt werden. Nur aktive Sorten erscheinen als Kachel auf der Startseite.

## Daten

Gemüsesorten und Preise liegen in `data/vegetables.csv`.
