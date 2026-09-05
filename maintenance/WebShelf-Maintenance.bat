@echo off
setlocal
cd /d "%~dp0.."
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 22 or newer, then reopen this launcher.
 pause
 exit /b 1
)
node maintenance/setup.cjs
if errorlevel 1 (
 pause
 exit /b 1
)
:menu
echo.
echo WebShelf Maintenance
echo 1. Add a website
echo 2. Edit or reorder a website
echo 3. Update a favicon
echo 4. Remove a website
echo 5. Bulk import websites
echo 6. Validate project
echo 7. Rebuild production files
echo 8. Exit
choice /c 12345678 /n /m "Choose 1-8: "
set "selection=%errorlevel%"
if "%selection%"=="8" exit /b 0
if "%selection%"=="1" node maintenance/add-site.cjs
if "%selection%"=="2" node maintenance/edit-site.cjs
if "%selection%"=="3" node maintenance/update-icon.cjs
if "%selection%"=="4" node maintenance/remove-site.cjs
if "%selection%"=="5" node maintenance/import-sites.cjs
if "%selection%"=="6" node maintenance/validate.cjs
if "%selection%"=="7" node maintenance/build.cjs
pause
goto menu
