@echo off
echo Installing backend dependencies...
cd backend
npm install cookie-parser
echo.
echo Backend dependencies installed successfully!
echo.
echo To start the application:
echo 1. Backend: cd backend && npm run dev
echo 2. Frontend: cd frontend && npm run dev
pause