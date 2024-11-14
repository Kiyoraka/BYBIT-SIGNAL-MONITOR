@echo off
title Bybit Trading Monitor

:: Change to the directory where the batch file is located
cd /d "%~dp0"

echo Starting Bybit Trading Monitor...
echo ================================
echo Current Directory: %CD%
echo.
echo Press Ctrl+C to stop the monitor
echo.
timeout /t 3

:: Start with correct paths
start wt cmd /k "cd /d "%~dp0" && color 0C && python "%~dp0Bybit-SSM.py"" ; ^
new-tab cmd /k "cd /d "%~dp0" && color 0A && python "%~dp0Bybit-LSM.py""

echo Monitors are running in Windows Terminal tabs.
echo Close Windows Terminal to stop all monitors.
echo.
pause