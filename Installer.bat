@echo off
title Package Installer
color 0E
cls

:: Change to script directory
cd /d "%~dp0"

echo Crypto Trading Bot - Package Installer
echo ====================================
echo.

:: Check for Python installation
echo Checking Python installation...
echo -----------------------------
python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo Found: %PYTHON_VERSION%
    goto :install_packages
)

:: Try py launcher
py --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('py --version') do set PYTHON_VERSION=%%i
    echo Found: %PYTHON_VERSION%
    goto :install_packages
)

:: Python not found, proceed with installation
echo Python not found. Installing Python 3.13.0...
echo -------------------------------------------
echo.

:: Download Python installer
echo Downloading Python installer...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.13.0/python-3.13.0-amd64.exe', 'python_installer.exe')"

:: Install Python
echo Installing Python (this may take a few minutes)...
start /wait python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_pip=1

:: Clean up installer
del python_installer.exe

:: Refresh environment variables
echo Refreshing environment variables...
call refreshenv.cmd >nul 2>&1
if %errorlevel% neq 0 (
    :: Manually refresh PATH
    for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "PATH=%%b"
    for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path') do set "PATH=%%b;%PATH%"
)

echo Python installation completed!
echo.

:install_packages
echo Installing/Updating required packages...
echo --------------------------------------
echo.

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install required packages
echo Installing required packages...
python -m pip install ccxt numpy pandas ta

echo.
echo All installations completed successfully!
echo ---------------------------------------
echo Python Version: 3.12.2
echo Required Packages: ccxt, numpy, pandas, ta
echo.
echo Starting Bybit Signal Monitor...
timeout /t 3 >nul

:: Start the monitor and close this window
start "" "Bybit Signal Monitor.bat"
exit