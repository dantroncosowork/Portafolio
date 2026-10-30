#!/usr/bin/env node
// Apunta un logro en el portafolio: saca (o copia) sus capturas, añade la entrada
// a logros.json y hace el commit. El push NO: lo decide Daniel, después de mirarlo.
//
//   node herramientas/logro.js <proyecto> --titulo "…" --texto "…" [--ia "Claude Code"]
//        [--url <url o ruta de un .html>] [--desde <carpeta con .png>] [--sin-captura]
//        [--hito] [--etapa "Rediseño"] [--fecha AAAA-MM-DD] [--sin-commit] [--coautor "Nombre <correo>"]
//
// --hito marca un paso de la historia del proyecto (su página enseña sólo ésos,
// y los demás tras un botón). --etapa es una etiqueta corta del paso.
//   node herramientas/logro.js ver          sirve la web en http://localhost:4321
//   node herramientas/logro.js proyectos    lista los ids y de dónde se captura cada uno
//   node herramientas/logro.js bandeja [--desde AAAA-MM-DD]
//        las capturas de la bandeja de Greenshot que aún no se han usado, en una
//        sola hoja de miniaturas numeradas, para elegir sin abrirlas una a una
//
// Sin --url ni --desde, la fuente sale de herramientas/capturar.json.
// Lo usan igual la skill /logro de Claude Code y el workflow de Antigravity.

'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const RAIZ = path.resolve(__dirname, '..');
const ANCHOS = [{ ancho: 1440, alto: 900 }, { ancho: 390, alto: 844 }];
const MAX_COPIADAS = 6;

function salir(msg) { console.error('✗ ' + msg); process.exit(1); }
function leerJSON(f) { return JSON.parse(fs.readFileSync(path.join(RAIZ, f), 'utf8')); }
function escribirJSON(f, dato) {
  // A temporal y luego se reemplaza: si algo falla a mitad, el original sigue entero.
  const destino = path.join(RAIZ, f);
  fs.writeFileSync(destino + '.tmp', JSON.stringify(dato, null, 2) + '\n');
  fs.renameSync(destino + '.tmp', destino);
}
function hoy() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function slug(s) {
  const largo = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Corta por la última palabra entera, no a mitad.
  const corto = largo.length > 40 ? largo.slice(0, 41).replace(/-[^-]*$/, '') : largo;
  return corto || 'logro';
}
function argumentos(lista) {
  const r = { _: [] };
  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    if (!a.startsWith('--')) { r._.push(a); continue; }
    const clave = a.slice(2);
    const sig = lista[i + 1];
    if (sig === undefined || sig.startsWith('--')) r[clave] = true;
    else { r[clave] = sig; i++; }
  }
  return r;
}

async function capturarURL(destino, url, base) {
  let playwright;
  try { playwright = require('playwright'); }
  catch (e) { salir('Falta Playwright. Una vez: cd herramientas && npm install'); }
  const dir = /^https?:\/\//.test(url) ? url : pathToFileURL(path.resolve(url)).href;
  const navegador = await playwright.chromium.launch();
  const hechas = [];
  try {
    for (const { ancho, alto } of ANCHOS) {
      const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
      await pagina.goto(dir, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => pagina.waitForTimeout(2000));
      await pagina.waitForTimeout(800);
      const nombre = base + '-' + ancho + '.png';
      await pagina.screenshot({ path: path.join(destino, nombre) });
      hechas.push(nombre);
      await pagina.close();
    }
  } finally { await navegador.close(); }
  return hechas;
}

function copiarCarpeta(destino, carpeta, base) {
  if (!fs.existsSync(carpeta)) salir('No existe la carpeta ' + carpeta);
  const pngs = fs.readdirSync(carpeta).filter(f => /\.png$/i.test(f)).sort();
  if (!pngs.length) salir('No hay ningún .png en ' + carpeta);
  // Las anchas primero: la web usa la primera de 1440 como portada del proyecto.
  const orden = pngs.filter(f => /1440/.test(f)).concat(pngs.filter(f => !/1440/.test(f)));
  const elegidas = orden.slice(0, MAX_COPIADAS);
  if (pngs.length > MAX_COPIADAS) console.log('· ' + pngs.length + ' capturas en la carpeta; entran ' + MAX_COPIADAS + '. Para elegir otras, deja sólo ésas en una carpeta aparte.');
  return elegidas.map(f => {
    const nombre = base + '-' + slug(f.replace(/\.png$/i, '')) + '.png';
    fs.copyFileSync(path.join(carpeta, f), path.join(destino, nombre));
    return nombre;
  });
}

function git(args) { return execFileSync('git', ['-C', RAIZ].concat(args), { encoding: 'utf8' }); }

async function apuntar(a) {
  const id = a._[0];
  const { proyectos } = leerJSON('proyectos.json');
  const proyecto = proyectos.find(p => p.id === id);
  if (!proyecto) salir('No hay ningún proyecto «' + id + '». Los que hay: ' + proyectos.map(p => p.id).join(', ') + '. Se añade a proyectos.json.');
  if (!a.titulo || a.titulo === true) salir('Falta --titulo "…"');

  const fuentes = fs.existsSync(path.join(__dirname, 'capturar.json')) ? leerJSON('herramientas/capturar.json') : {};
  const fuente = fuentes[id] || {};
  const fecha = typeof a.fecha === 'string' ? a.fecha : hoy();
  const base = fecha + '-' + slug(a.titulo);
  const destino = path.join(RAIZ, 'capturas', id);

  let nombres = [];
  if (!a['sin-captura']) {
    const url = typeof a.url === 'string' ? a.url : null;
    const desde = typeof a.desde === 'string' ? a.desde : null;
    if (url && fuente.nunca) salir('«' + id + '» enseña datos reales: no se captura por url. Usa --desde con una carpeta revisada, o --sin-captura.');
    fs.mkdirSync(destino, { recursive: true });
    if (desde) nombres = copiarCarpeta(destino, desde, base);
    else if (url) nombres = await capturarURL(destino, url, base);
    else if (fuente.url && !fuente.nunca) nombres = await capturarURL(destino, fuente.url, base);
    else if (fuente.desde) salir('«' + id + '» copia sus capturas de ' + fuente.desde + ': pásala con --desde y el hueco relleno.');
    else console.log('· «' + id + '» no tiene de dónde capturar: entra sin imagen.');
  }

  const logro = {
    id: base,
    fecha,
    proyecto: id,
    titulo: a.titulo,
    texto: typeof a.texto === 'string' ? a.texto : '',
    hito: !!a.hito,
    etapa: typeof a.etapa === 'string' ? a.etapa : '',
    ia: typeof a.ia === 'string' ? a.ia.split(',').map(s => s.trim()).filter(Boolean) : (proyecto.ia || []),
    capturas: nombres.map(n => 'capturas/' + id + '/' + n)
  };
  const logros = leerJSON('logros.json');
  if (logros.some(l => l.id === logro.id)) salir('Ya hay un logro «' + logro.id + '». Cambia el título o la fecha.');
  logros.unshift(logro);
  escribirJSON('logros.json', logros);

  console.log('✓ ' + proyecto.nombre + ': ' + logro.titulo);
  logro.capturas.forEach(c => console.log('  ' + path.join(RAIZ, c)));

  if (a['sin-commit']) { console.log('· Sin commit, como pediste.'); return; }
  git(['add', 'logros.json'].concat(logro.capturas));
  let mensaje = 'Logro · ' + proyecto.nombre + ': ' + logro.titulo;
  if (typeof a.coautor === 'string') mensaje += '\n\nCo-Authored-By: ' + a.coautor;
  git(['commit', '-q', '-m', mensaje]);
  console.log('✓ Commit hecho. Falta el push: revisa la entrada con «node herramientas/logro.js ver» y súbela (GitHub Desktop o git push). Vercel la publica sola.');
}

function ver() {
  const TIPOS = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript' };
  const puerto = Number(process.env.PUERTO) || 4321;
  http.createServer((req, res) => {
    const ruta = decodeURIComponent(req.url.split('?')[0]);
    const fichero = path.join(RAIZ, ruta === '/' ? 'index.html' : ruta);
    if (!fichero.startsWith(RAIZ + path.sep) || !fs.existsSync(fichero) || fs.statSync(fichero).isDirectory()) {
      res.writeHead(404); res.end('No está'); return;
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(fichero).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(fichero).pipe(res);
  }).listen(puerto, () => console.log('El portafolio, como saldrá publicado: http://localhost:' + puerto + '  (Ctrl+C para parar)'));
}

function listar() {
  const { proyectos } = leerJSON('proyectos.json');
  const fuentes = fs.existsSync(path.join(__dirname, 'capturar.json')) ? leerJSON('herramientas/capturar.json') : {};
  for (const p of proyectos) {
    const f = fuentes[p.id] || {};
    const de = f.nunca ? 'nunca por url (datos reales)' : f.url ? 'url ' + f.url : f.desde ? 'copia de ' + f.desde : 'sin captura';
    console.log(p.id.padEnd(18) + p.nombre.padEnd(22) + de);
  }
}

// La bandeja es la carpeta donde Greenshot guarda las capturas. Lo que está suelto
// en ella está por mirar; lo usado va a usadas/<proyecto>/ y lo que no sirve, a no-va/.
async function bandeja(a) {
  const fuentes = fs.existsSync(path.join(__dirname, 'capturar.json')) ? leerJSON('herramientas/capturar.json') : {};
  const dir = typeof a.carpeta === 'string' ? a.carpeta : fuentes._bandeja;
  if (!dir || !fs.existsSync(dir)) salir('No encuentro la bandeja. Ponla en herramientas/capturar.json como "_bandeja", o pásala con --carpeta.');
  // Greenshot nombra «2026-10-16 18_17_57-Título.png» o «2026_10_05_23_37_09_.png».
  const fechaDe = f => { const m = /^(\d{4})[-_](\d{2})[-_](\d{2})/.exec(f); return m ? m[1] + '-' + m[2] + '-' + m[3] : ''; };
  const desde = typeof a.desde === 'string' ? a.desde : '';
  const sueltas = fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f) && fs.statSync(path.join(dir, f)).isFile())
    .filter(f => !desde || fechaDe(f) >= desde).sort();
  if (!sueltas.length) { console.log('· La bandeja no tiene nada por mirar' + (desde ? ' desde el ' + desde : '') + '.'); return; }
  sueltas.forEach((f, i) => console.log(String(i + 1).padStart(3) + '. ' + f));

  let playwright;
  try { playwright = require('playwright'); }
  catch (e) { salir('Falta Playwright. Una vez: cd herramientas && npm install'); }
  const salida = path.join(require('os').tmpdir(), 'portafolio-bandeja.png');
  const html = '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#111;color:#ddd;font:13px system-ui}' +
    '.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}.c{background:#222;padding:4px}' +
    '.c img{width:100%;height:220px;object-fit:contain;background:#000;display:block}.c b{display:block;margin-top:4px;word-break:break-all}</style><div class="g">' +
    sueltas.map((f, i) => '<div class="c"><img src="' + pathToFileURL(path.join(dir, f)).href + '"><b>' + (i + 1) + '. ' + f.replace(/[<&]/g, '') + '</b></div>').join('') + '</div>';
  const tmp = salida.replace(/\.png$/, '.html');
  fs.writeFileSync(tmp, html);
  const navegador = await playwright.chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: 1600, height: 900 } });
    await pagina.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    await pagina.screenshot({ path: salida, fullPage: true });
  } finally { await navegador.close(); fs.unlinkSync(tmp); }
  console.log('✓ ' + sueltas.length + ' por mirar. La hoja: ' + salida);
}

// Lo que mira publicar.bat antes de subir nada: el repo es público y lo subido se
// queda en el historial. Sale con 1 y la lista si algo no cuadra.
function revisar() {
  const MAX_MB = 10;
  const problemas = [];
  const logros = leerJSON('logros.json');
  const { proyectos } = leerJSON('proyectos.json');
  const fuentes = fs.existsSync(path.join(__dirname, 'capturar.json')) ? leerJSON('herramientas/capturar.json') : {};
  const usadas = new Map();
  for (const l of logros) for (const c of l.capturas || []) usadas.set(c, l);
  for (const p of proyectos) if (p.video) usadas.set(p.video, { revisadoPorDaniel: true });

  const enDisco = [];
  const recorrer = d => { for (const e of fs.readdirSync(path.join(RAIZ, d), { withFileTypes: true })) {
    const r = d + '/' + e.name;
    if (e.isDirectory()) recorrer(r); else enDisco.push(r);
  } };
  if (fs.existsSync(path.join(RAIZ, 'capturas'))) recorrer('capturas');

  for (const f of enDisco) {
    const id = f.split('/')[1];
    const l = usadas.get(f);
    if (!l) problemas.push(f + ': no sale en la web, así que «Ver» no la enseña, pero se subiría igual');
    else if (fuentes[id] && fuentes[id].nunca && !l.revisadoPorDaniel)
      problemas.push(f + ': «' + id + '» enseña datos reales (capturar.json, "nunca"); sólo entra con "revisadoPorDaniel": true en su logro');
    const mb = fs.statSync(path.join(RAIZ, f)).size / 1048576;
    if (mb > MAX_MB) problemas.push(f + ': ' + mb.toFixed(1) + ' MB, más de ' + MAX_MB);
  }
  for (const c of usadas.keys()) if (!fs.existsSync(path.join(RAIZ, c))) problemas.push(c + ': la web la enseña y no existe');

  // Lo que lee la web no lleva rutas del disco ni direcciones que sólo existen en este ordenador.
  for (const f of ['index.html', 'proyectos.json', 'logros.json']) {
    const texto = fs.readFileSync(path.join(RAIZ, f), 'utf8');
    for (const m of texto.match(/[A-Za-z]:[\\/]{1,2}Users[\\/][^"'\s<]*/g) || []) problemas.push(f + ': ruta del disco «' + m + '»');
    for (const m of texto.match(/https?:\/\/(?:localhost|127\.0\.0\.1)[^"'\s<]*/g) || []) problemas.push(f + ': dirección de este ordenador «' + m + '»');
  }

  if (!problemas.length) { console.log('✓ Revisado: ' + usadas.size + ' capturas, todas en la web, nada privado a la vista.'); return; }
  console.log('✗ No se publica: ' + problemas.length + (problemas.length === 1 ? ' cosa' : ' cosas') + ' que mirar.');
  problemas.forEach(p => console.log('  · ' + p));
  process.exit(1);
}

const a = argumentos(process.argv.slice(2));
if (a._[0] === 'ver') ver();
else if (a._[0] === 'revisar') revisar();
else if (a._[0] === 'proyectos') listar();
else if (a._[0] === 'bandeja') bandeja(a).catch(e => salir(e.message));
else if (!a._[0]) salir('Uso: node herramientas/logro.js <proyecto> --titulo "…" --texto "…"   ·   ver   ·   proyectos');
else apuntar(a).catch(e => salir(e.message));
