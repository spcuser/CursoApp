@echo off
echo ========================================
echo Exportar Documentacion a Obsidian
echo ========================================
echo.

REM Cambia esta ruta a la ubicacion de tu vault de Obsidian
set OBSIDIAN_VAULT=C:\Users\%USERNAME%\Documents\Obsidian\CursoAPP

echo Vault de Obsidian: %OBSIDIAN_VAULT%
echo.

REM Crear carpeta si no existe
if not exist "%OBSIDIAN_VAULT%" (
    echo Creando carpeta del vault...
    mkdir "%OBSIDIAN_VAULT%"
)

REM Copiar archivos de documentacion
echo Copiando archivos...
copy "INTEGRACION-FIREBASE-PASOS.md" "%OBSIDIAN_VAULT%\" >nul
copy "FIREBASE-SETUP.md" "%OBSIDIAN_VAULT%\" >nul
copy "DEPLOY.md" "%OBSIDIAN_VAULT%\" >nul
copy "IMPLEMENTACION-FIREBASE.md" "%OBSIDIAN_VAULT%\" >nul
copy "README.md" "%OBSIDIAN_VAULT%\" >nul
copy "FAQ.md" "%OBSIDIAN_VAULT%\" >nul
copy "INSTRUCCIONES.md" "%OBSIDIAN_VAULT%\" >nul
copy "RESUMEN-PROYECTO.md" "%OBSIDIAN_VAULT%\" >nul

echo.
echo ========================================
echo Exportacion completada!
echo ========================================
echo.
echo Los archivos se copiaron a:
echo %OBSIDIAN_VAULT%
echo.
echo Abre Obsidian para verlos.
echo.
pause
