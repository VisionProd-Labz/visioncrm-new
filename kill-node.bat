@echo off
echo Arret de tous les processus Node.js...
taskkill /F /IM node.exe /T 2>nul
echo.
echo Tous les processus Node.js ont ete arretes!
echo.
pause
