@echo off
title LockedIn
cd /d "%~dp0"

rem First run (or after a code change) needs a production build.
if not exist ".next\BUILD_ID" (
  echo Building LockedIn for first launch... this takes a minute.
  call npm run build
)

echo Starting LockedIn desktop app...
call npx electron .
