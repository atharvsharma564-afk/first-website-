@echo off
cd /d "%~dp0"
echo Starting Youthinity Local Server on http://localhost:8080 ...
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
