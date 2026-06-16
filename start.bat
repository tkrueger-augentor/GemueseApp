@echo off
cd /d "%~dp0"
echo Starte Gemuesekiste ...
echo Sobald der Server laeuft, im Browser http://localhost:3000 oeffnen.
echo Zum Beenden dieses Fenster schliessen oder Strg+C druecken.
node server.js
pause
