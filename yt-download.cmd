@echo off
pwsh.exe -ExecutionPolicy Bypass -File "%~dp0yt-download.ps1" -url "%~1"
if errorlevel 1 (
  echo.
  echo Download failed. Press any key to close.
  pause >nul
)
exit /b
