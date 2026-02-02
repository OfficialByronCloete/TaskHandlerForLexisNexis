@echo off
title TaskHandler - Local Startup

REM Always run from script directory
cd /d "%~dp0"

echo Starting .NET Web API...
:: Note: dotnet run --project works best with absolute paths or very clean relative ones
start "TaskHandler API" cmd /k "dotnet run --project "%~dp0backend\TaskHandlerAPI\TaskHandlerAPI\TaskHandler.WebAPI.csproj""

timeout /t 5 > nul

echo Starting Angular Frontend...
:: Using /d within the start command to ensure the new window opens in the right spot
start "TaskHandler Frontend" /d "%~dp0frontend\LexisNexisFrontend" cmd /k "npm start"

timeout /t 10 > nul
echo Opening browser...
start http://localhost:4200