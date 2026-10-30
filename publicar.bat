@echo off
chcp 65001 > nul
echo ========================================================
echo   🚀 Publicando cambios del Portafolio a GitHub y Vercel...
echo ========================================================
echo.

cd /d "C:\Users\dantr\Portafolio"

rem El repo es público y lo subido se queda en el historial: primero se revisa,
rem y si algo no cuadra no se sube nada (herramientas\logro.js, función revisar).
echo [1/4] Revisando lo que se va a publicar...
node herramientas\logro.js revisar
if errorlevel 1 (
    echo.
    echo   No se ha publicado nada. Arregla lo de arriba, o pídeselo a Claude.
    goto fallo
)

echo [2/4] Añadiendo cambios...
git add index.html proyectos.json logros.json capturas/ herramientas/

echo [3/4] Creando commit...
git diff --cached --quiet || git commit -q -m "Actualización de logros y novedades del portafolio"

echo [4/4] Subiendo a GitHub (Vercel lo publicará automáticamente)...
git push
if errorlevel 1 (
    echo.
    echo   El push ha fallado: mira el mensaje de git de arriba.
    goto fallo
)

echo.
echo ========================================================
echo   ✅ ¡Listo! Vercel desplegará los cambios en ~15 segundos.
echo ========================================================
echo.
if not "%1"=="--no-pause" pause
exit /b 0

:fallo
echo.
if not "%1"=="--no-pause" pause
exit /b 1
