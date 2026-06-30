@echo off
REM Double-clique ce fichier apres avoir edite badges.txt.
cd /d "%~dp0"
python generate-badges.py
echo.
pause
