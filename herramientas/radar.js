#!/usr/bin/env node
/**
 * Radar de Proyectos - Barredora de fin de sesión para Antigravity y Claude.
 * Detecta qué proyectos tuvieron actividad en las últimas 24 horas y qué capturas nuevas hay.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ_PORTAFOLIO = path.resolve(__dirname, '..');
const PROYECTOS_FILE = path.join(RAIZ_PORTAFOLIO, 'proyectos.json');
const CAPTURAR_FILE = path.join(__dirname, 'capturar.json');
const BANDEJA_DIR = 'C:/Users/dantr/Desktop/portfolio Apps';

// Mapeo de rutas conocidas de proyectos
const RUTAS_CONOCIDAS = {
  'finance-os': 'C:/Users/dantr/Finance-OS',
  'trading-os': 'C:/Users/dantr/Trading-OS',
  'life-os': 'C:/Users/dantr/Life-OS',
  'teleoperador': 'C:/Users/dantr/Teleoperador-practica',
  'buscador-empleo': 'C:/Users/dantr/Buscador de empleo',
  'trello-gemini': 'C:/Users/dantr/.gemini/antigravity/scratch/trello-idea-researcher',
  'agent-monitor': 'C:/Users/dantr/.gemini/config/plugins/agent-monitor',
  'portafolio': RAIZ_PORTAFOLIO
};

const SCRATCH_DIR = 'C:/Users/dantr/.gemini/antigravity/scratch';

function obtenerModificadosRecientes(dir, horas = 24, maxArchivos = 5) {
  if (!fs.existsSync(dir)) return [];
  const ahora = Date.now();
  const limite = ahora - (horas * 60 * 60 * 1000);
  const ignorar = new Set(['node_modules', '.git', '__pycache__', '.venv', 'dist', '.next']);
  const resultados = [];

  function recorrer(actual, nivel = 0) {
    if (nivel > 4 || resultados.length >= 20) return;
    try {
      const items = fs.readdirSync(actual, { withFileTypes: true });
      for (const item of items) {
        if (ignorar.has(item.name)) continue;
        const rutaCompleta = path.join(actual, item.name);
        if (item.isDirectory()) {
          recorrer(rutaCompleta, nivel + 1);
        } else if (item.isFile()) {
          const stats = fs.statSync(rutaCompleta);
          if (stats.mtimeMs >= limite) {
            resultados.push({
              archivo: path.relative(dir, rutaCompleta),
              mtime: stats.mtime
            });
          }
        }
      }
    } catch (e) {}
  }

  recorrer(dir);
  resultados.sort((a, b) => b.mtime - a.mtime);
  return resultados.slice(0, maxArchivos);
}

function escanearBandejaCapturas(horas = 24) {
  if (!fs.existsSync(BANDEJA_DIR)) return [];
  const ahora = Date.now();
  const limite = ahora - (horas * 60 * 60 * 1000);
  try {
    return fs.readdirSync(BANDEJA_DIR)
      .filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'))
      .map(f => {
        const p = path.join(BANDEJA_DIR, f);
        const stats = fs.statSync(p);
        return { archivo: f, mtime: stats.mtime, ruta: p };
      })
      .filter(f => f.mtime.getTime() >= limite)
      .sort((a, b) => b.mtime - a.mtime);
  } catch (e) {
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  const horas = 24;

  let catalogo = { proyectos: [] };
  if (fs.existsSync(PROYECTOS_FILE)) {
    try {
      catalogo = JSON.parse(fs.readFileSync(PROYECTOS_FILE, 'utf8'));
    } catch (e) {}
  }

  const mapaProyectos = new Map();
  (catalogo.proyectos || []).forEach(p => mapaProyectos.set(p.id, p));

  const proyectosActivos = [];

  // 1. Escanear proyectos conocidos
  for (const [id, dir] of Object.entries(RUTAS_CONOCIDAS)) {
    const modificados = obtenerModificadosRecientes(dir, horas);
    if (modificados.length > 0) {
      const p = mapaProyectos.get(id) || { id, nombre: id, tipo: 'app' };
      proyectosActivos.push({
        id,
        nombre: p.nombre,
        tipo: p.tipo,
        directorio: dir,
        archivos: modificados.map(m => m.archivo),
        ultimaModificacion: modificados[0].mtime
      });
    }
  }

  // 2. Escanear scratch adicional de Antigravity
  if (fs.existsSync(SCRATCH_DIR)) {
    try {
      const subdirs = fs.readdirSync(SCRATCH_DIR, { withFileTypes: true });
      for (const sub of subdirs) {
        if (!sub.isDirectory()) continue;
        const dir = path.join(SCRATCH_DIR, sub.name);
        if (Object.values(RUTAS_CONOCIDAS).includes(dir)) continue; // ya escaneado
        const modificados = obtenerModificadosRecientes(dir, horas);
        if (modificados.length > 0) {
          proyectosActivos.push({
            id: sub.name,
            nombre: sub.name,
            tipo: 'prototipo',
            directorio: dir,
            archivos: modificados.map(m => m.archivo),
            ultimaModificacion: modificados[0].mtime
          });
        }
      }
    } catch (e) {}
  }

  // 3. Capturas recientes en bandeja
  const capturas = escanearBandejaCapturas(horas);

  const reporte = {
    fecha: new Date().toISOString(),
    proyectosActivos,
    capturasEnBandeja: capturas.map(c => c.archivo)
  };

  if (args.includes('--json')) {
    console.log(JSON.stringify(reporte, null, 2));
    return;
  }

  // Formato legible
  console.log('\n📡 [Radar de Proyectos] Actividad en las últimas 24h:');
  if (proyectosActivos.length === 0) {
    console.log('   (No se detectaron modificaciones de código recientes)');
  } else {
    proyectosActivos.forEach((p, idx) => {
      console.log(`\n ${idx + 1}. [${p.tipo.toUpperCase()}] ${p.nombre} (${p.id})`);
      console.log(`    Directorio: ${p.directorio}`);
      console.log(`    Archivos tocados: ${p.archivos.slice(0, 3).join(', ')}`);
    });
  }

  console.log(`\n📸 Capturas recientes en bandeja (${capturas.length}):`);
  capturas.slice(0, 4).forEach(c => console.log(`   - ${c.archivo}`));
  console.log('');
}

main();
