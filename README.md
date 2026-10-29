# Portafolio

Los proyectos que Daniel construye con IA (Claude Code, Gemini, Antigravity) y
lo que va logrando en cada uno. Es una web estática en Vercel que se actualiza
sola: cada push a `main` la publica.

```
index.html                 la web: lee los dos JSON y pinta proyectos y logros
proyectos.json             el perfil y cada proyecto (nombre, tipo, estado, qué es, con qué IA, url)
logros.json                cada avance, el más nuevo primero (lo escribe herramientas/logro.js)
capturas/<proyecto>/       las imágenes de cada logro
herramientas/              lo que apunta los logros. No se publica (.vercelignore)
  logro.js                 captura o copia, añade la entrada y hace el commit; el push no
  capturar.json            de dónde sale la captura de cada proyecto, y cuáles nunca por url
  antigravity/logro.md     el workflow /logro para Antigravity
```

## Apuntar un logro

- **Claude Code**: `/logro`, la skill global de `~/.claude/skills/logro/`. Se
  dispara sola al dejar construida una fase con capturas.
- **Antigravity**: copia `herramientas/antigravity/logro.md` a
  `.agent/workflows/logro.md` en el proyecto, y escribe `/logro`.
- **A mano**:

  ```bash
  node herramientas/logro.js <proyecto> --titulo "…" --texto "…" --ia "Gemini" --url https://…
  ```

La primera vez, `cd herramientas && npm install`.

## Antes de publicar

```bash
node herramientas/logro.js ver
```

Lo sirve en http://localhost:4321 tal como saldrá. **El repositorio es
público:** una captura con datos reales queda en el historial aunque se borre
después. Por eso el script hace el commit, pero el push no.
