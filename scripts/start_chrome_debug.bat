@echo off
setlocal
set "XYDY_CHROME_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "XYDY_CHROME_PROFILE=%LOCALAPPDATA%\ChromeDebugProfile"

if not exist "%XYDY_CHROME_EXE%" (
  echo [xyDouYinTools] Chrome was not found:
  echo "%XYDY_CHROME_EXE%"
  pause
  exit /b 1
)

echo [xyDouYinTools] Starting Chrome debug mode on port 9222.
echo Profile: "%XYDY_CHROME_PROFILE%"
echo This profile is reused to keep your logins and extensions.
echo.

start "" "%XYDY_CHROME_EXE%" --remote-debugging-port=9222 --user-data-dir="%XYDY_CHROME_PROFILE%"
if errorlevel 1 (
  echo [xyDouYinTools] Could not start Chrome.
  pause
  exit /b 1
)

echo Launch request sent.
timeout /t 3 /nobreak >nul
endlocal
