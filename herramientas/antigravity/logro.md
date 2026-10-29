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
   - sin datos reales de Daniel;
   - `--hito` si alguien de fuera lo notaría (una función o pantalla nueva, un
     rediseño, la primera vez que se publica), con `--etapa` en una o dos
     palabras: «Nueva función», «Rediseño», «Publicado». Los arreglos pequeños
     van sin `--hito`.

3. Mira primero la bandeja de Greenshot (`C:/Users/dantr/Desktop/portfolio Apps`):

   ```
   node C:/Users/dantr/Portafolio/herramientas/logro.js bandeja --desde <fecha del logro anterior>
   ```

   Saca una hoja de miniaturas numeradas. Vale la pantalla de una app de este
   proyecto, o un plano o plan suyo. No vale el escritorio entero, un chat con
   una IA, un editor, el Explorador ni una pantalla con datos reales. Copia las
   elegidas a una carpeta temporal y pásalas con `--desde`. Después, muévelas
   dentro de la bandeja: a `usadas/<id>/` las que entraron, y a `no-va/` las que
   no sirven. No borres nada.

4. Corre el script sin commit. Con `--url` va la dirección de Vercel o la ruta
   del `.html`; si no lo pones, usa la fuente de `herramientas/capturar.json`:

   ```
   node C:/Users/dantr/Portafolio/herramientas/logro.js <id> --titulo "…" --texto "…" --ia "Antigravity" --url <url> [--hito --etapa "…"] --sin-commit
   ```

5. Abre cada captura que imprimió. Si alguna enseña un nombre, un correo, un
   teléfono, una cuenta o un tablero real, bórrala y quítala de su entrada en
   `logros.json`.

6. **No hagas commit ni push.** En Antigravity, git es de Daniel. Dile qué entró,
   qué ficheros cambiaste y estos comandos, por si los quiere correr él (o
   dejárselos a Claude Code, que hace el commit y revisa las capturas):

   ```
   git -C C:/Users/dantr/Portafolio add proyectos.json herramientas/capturar.json logros.json capturas/<id>
   git -C C:/Users/dantr/Portafolio commit -m "Logro · <Nombre>: <título>"
   ```
