@echo off
echo Setting up Kaunsa College Development Environment...
echo.

echo Installing Backend Dependencies...
cd backend
call npm install
echo Backend dependencies installed.
echo.

echo Installing Frontend Dependencies...
cd ..\frontend
call npm install
echo Frontend dependencies installed.
echo.

echo Starting Development Servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin/login
echo.
echo Demo Credentials:
echo Username: admin
echo Password: admin123
echo.
pause