# Gemüsekiste

Web-App zur Auswahl von Gemüsesorten per Kachel-Tipp, mit Live-Gesamtpreis und Admin-Verwaltung für Sorten/Preise.

## Start

```
node server.js
```

Standardport: `3000` (mit `PORT` env var anpassbar).

## Bedienung

- Kachel antippen: +1
- Kachel lange drücken (ca. 0,5s): -1
- "Auswahl zurücksetzen": alle Mengen auf 0

## Verwaltung

Aufrufbar unter `/admin/`. Standardpasswort: `gemuese123` (über env var `ADMIN_PASSWORD` änderbar).

In der Verwaltung können Gemüsesorten angelegt, Preise gepflegt und Sorten aktiv/inaktiv gesetzt werden. Nur aktive Sorten erscheinen als Kachel auf der Startseite.

## Daten

Gemüsesorten und Preise liegen in `data/vegetables.csv`.
