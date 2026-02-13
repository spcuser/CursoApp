@echo off
echo ========================================
echo   CURSOAPP - Inicio Rapido
echo ========================================
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    echo.
    echo Por favor, descarga e instala Node.js desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado
node --version
echo.

REM Verificar si node_modules existe
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias...
    echo Esto puede tardar unos minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas correctamente
    echo.
)

REM Verificar si existe .env.local
if not exist ".env.local" (
    echo [ADVERTENCIA] No se encontro el archivo .env.local
    echo.
    echo Por favor:
    echo 1. Abre el archivo .env.local
    echo 2. Reemplaza "tu_clave_api_aqui" con tu clave de Gemini
    echo 3. Obten tu clave en: https://ai.google.dev/
    echo.
    pause
)

echo ========================================
echo   Iniciando servidor de desarrollo...
echo ========================================
echo.
echo La aplicacion se abrira en: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev

pause
