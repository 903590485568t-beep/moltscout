@echo off
title Moltseek Hunter Bot
color 0c

:loop
cls
echo ==========================================
echo    MOLTSEEK HUNTER BOT - ACTIVATED
echo ==========================================
echo.
echo Starting surveillance...
echo.

call npm run hunt

echo.
echo Connection lost. Restarting in 5 seconds...
timeout /t 5 >nul
goto loop