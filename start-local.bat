@echo off
echo ===================================================
echo Starting VentureVital Locally (Backend + Frontend)
echo ===================================================

cd /d "%~dp0"

echo [1/2] Launching Spring Boot Backend on http://localhost:8081 ...
start "VentureVital Backend (Port 8081)" cmd /k "cd /d %~dp0backend && maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
start "VentureVital Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Both servers have been launched in dedicated windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8081
echo ===================================================
pause
