@echo off
title Bybit Trading Monitor
color 0A
cls

echo Starting Bybit Trading Monitor...
echo ================================
echo.
echo Press Ctrl+C to stop the monitor
echo.
timeout /t 3

REM Start Short Signal Monitor
start "SHORT SIGNAL MONITOR" cmd /k "color 0C && title === SHORT SIGNAL MONITOR === && echo. && echo SHORT SIGNAL MONITOR STARTED... && echo ================================ && echo. && python Bybit-SSM.py"

REM Start Long Signal Monitor
start "LONG SIGNAL MONITOR" cmd /k "color 0A && title === LONG SIGNAL MONITOR === && echo. && echo LONG SIGNAL MONITOR STARTED... && echo ================================ && echo. && python Bybit-LSM.py"

REM Wait indefinitely without creating new instances
:Wait
timeout /t 60 >nul
goto Wait