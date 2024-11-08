@echo off
title Bybit Trading Monitor
color 0A
cls

:: Change to the script's directory
cd /d "%~dp0"


echo.
echo Starting Bybit Trading Monitor...
echo ================================
echo.
echo Press Ctrl+C to stop the monitor
echo.
timeout /t 3

:: Check if Python scripts exist
if not exist "Crypto-SSM.py" (
    echo Error: Crypto-SSM.py not found!
    echo Please ensure all files are in the same directory.
    pause
    exit /b 1
)

if not exist "Crypto-LSM.py" (
    echo Error: Crypto-LSM.py not found!
    echo Please ensure all files are in the same directory.
    pause
    exit /b 1
)

:: Start Short Signal Monitor with full path
start "SHORT SIGNAL MONITOR" cmd /k "cd /d "%CD%" && color 0C && title === SHORT SIGNAL MONITOR === && echo. && echo SHORT SIGNAL MONITOR STARTED... && echo ================================ && echo. && python Crypto-SSM.py"

:: Start Long Signal Monitor with full path
start "LONG SIGNAL MONITOR" cmd /k "cd /d "%CD%" && color 0A && title === LONG SIGNAL MONITOR === && echo. && echo LONG SIGNAL MONITOR STARTED... && echo ================================ && echo. && python Crypto-LSM.py"

:: Wait indefinitely without creating new instances
:Wait
timeout /t 60 >nul
goto Wait