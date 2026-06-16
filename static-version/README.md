# Gemüsekiste – Static-Version (ohne Server)

Reines HTML/CSS/JavaScript, kein Node.js, keine Installation nötig.

## Start

Einfach `index.html` doppelklicken – öffnet sich im Standardbrowser.

Alternativ: den ganzen Ordner `static-version` auf einen geteilten Netzlaufwerk-Ordner oder einen Webspace (z.B. normales Hosting per FTP) legen und `index.html` aufrufen.

## Bedienung

- Kachel antippen: +1
- Kachel lange drücken (ca. 0,5s): -1
- "Auswahl zurücksetzen": alle Mengen auf 0

## Verwaltung

Aufrufbar über `admin/index.html` (Link "Verwaltung" oben auf der Startseite). Standardpasswort: `gemuese123`. Kann in der Verwaltung selbst geändert werden.

## Wichtige Einschränkung

Es gibt keine zentrale Datenbank. Gemüsesorten, Preise und das Admin-Passwort werden im **localStorage des jeweiligen Browsers** gespeichert. Das bedeutet:

- Änderungen in der Verwaltung wirken sich nur auf den Browser/Rechner aus, auf dem man sie vornimmt.
- Öffnet jemand die Seite auf einem anderen Gerät oder in einem anderen Browser, sieht er ggf. die Standard-Voreinstellungen statt der eigenen Änderungen.
- Löscht man den Browser-Speicher (z.B. "Browserdaten löschen"), gehen die Anpassungen verloren.

Für mehrere Geräte mit gemeinsam gepflegten Preisen ist die Hauptversion mit Node.js-Server (siehe `../README.md`) besser geeignet.
