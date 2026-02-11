@echo off
:: setup.bat: A script to set up the Smart Queue Management System environment on Windows.

ECHO Starting Smart Queue Management System setup...

:: --- Check for Python ---
python --version >nul 2>nul
if %errorlevel% neq 0 (
    ECHO Error: python could not be found.
    ECHO Please install Python 3.11 or higher and ensure it's in your PATH.
    GOTO :eof
)

:: --- Run the Python Setup Script ---
ECHO Executing setup.py...
python setup.py

:: --- Final Message ---
if %errorlevel% equ 0 (
    ECHO Setup script completed successfully.
) else (
    ECHO Setup script encountered errors.
)

:eof
PAUSE
