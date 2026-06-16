#!/bin/bash
cd "$(dirname "$0")"
echo "Starte Gemüsekiste ..."
echo "Sobald der Server läuft, im Browser http://localhost:3000 öffnen."
echo "Zum Beenden dieses Fenster schließen oder Strg+C drücken."
node server.js
