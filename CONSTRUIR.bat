@echo off
echo ========================================
echo   CURSOAPP - Construccion para Produccion
echo ========================================
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    pause
    exit /b 1
)

echo [INFO] Construyendo aplicacion...
echo.

call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   [EXITO] Construccion completada
    echo ========================================
    echo.
    echo Los archivos estan en la carpeta: dist\
    echo.
    echo Para probar la version de produccion:
    echo   npm run preview
    echo.
    echo Para desplegar:
    echo   - Sube la carpeta 'dist' a tu servidor
    echo   - O usa Vercel/Netlify (ver deploy.md)
    echo.
) else (
    echo.
    echo [ERROR] Fallo la construccion
    echo.
)

pause
