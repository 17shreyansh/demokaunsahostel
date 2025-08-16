@echo off
echo Starting KaunsaHostel Application...

echo.
echo Starting MongoDB (make sure MongoDB is installed)...
start "MongoDB" mongod

echo.
echo Installing Backend Dependencies...
cd backend
call npm install

echo.
echo Seeding Database...
call npm run seed

echo.
echo Starting Backend Server...
start "Backend" cmd /k "npm run dev"

echo.
echo Installing Frontend Dependencies...
cd ..\frontend
call npm install

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo Application started successfully!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin: http://localhost:3000/admin (admin/admin123)
pause