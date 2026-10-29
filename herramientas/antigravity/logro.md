---
description: Apuntar un avance en el portafolio de Daniel (captura, entrada y commit; el push lo hace él)
---

# /logro

El portafolio es `C:/Users/dantr/Portafolio`, y su repositorio es **público**: lo
que entra en un commit queda para siempre en el historial. Todo lo hace
`herramientas/logro.js`; este workflow sólo decide qué entra.

1. Busca el `id` del proyecto en `C:/Users/dantr/Portafolio/proyectos.json`. Si
   no está, añádelo con `id`, `nombre`, `tipo` (`app`, `juego`, `automatizacion`
   o `flujo`), `estado`, `que`, `ia` y `url`.

2. Escribe el texto para alguien que no conoce el proyecto:
   - un título de 70 caracteres como mucho, con lo que ahora se puede hacer;
   - de una a tres frases con qué hace y cómo se hizo;
   - sin datos reales de Daniel.

3. Corre el script sin commit. Con `--url` va la dirección de Vercel o la ruta
   del `.html`; si no lo pones, usa la fuente de `herramientas/capturar.json`:

   ```
   node C:/Users/dantr/Portafolio/herramientas/logro.js <id> --titulo "…" --texto "…" --ia "Antigravity" --url <url> --sin-commit
   ```

4. Abre cada captura que imprimió. Si alguna enseña un nombre, un correo, un
   teléfono, una cuenta o un tablero real, bórrala y quítala de su entrada en
   `logros.json`.

5. **No hagas commit ni push.** En Antigravity, git es de Daniel. Dile qué entró,
   qué ficheros cambiaste y estos comandos, por si los quiere correr él (o
   dejárselos a Claude Code, que hace el commit y revisa las capturas):

   ```
   git -C C:/Users/dantr/Portafolio add proyectos.json herramientas/capturar.json logros.json capturas/<id>
   git -C C:/Users/dantr/Portafolio commit -m "Logro · <Nombre>: <título>"
   ```
