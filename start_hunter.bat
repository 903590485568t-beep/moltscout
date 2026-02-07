@echo off
title $MoltScout Hunter Bot
color 0A

:start
echo ---------------------------------------------------
echo   STARTING $MOLTSCOUT HUNTER BOT
echo ---------------------------------------------------
echo   Target: $MoltScout
echo   Mode: PERMANENT WATCH
echo ---------------------------------------------------

node scripts/hunter-bot.js

echo.
echo ---------------------------------------------------
echo   BOT CRASHED OR CLOSED. RESTARTING IN 3 SECONDS...
echo ---------------------------------------------------
timeout /t 3
goto start