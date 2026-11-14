// Paletas de prueba para Daniel OS. Cada una cambia sólo las variables de color del index;
// la estructura, la malla y los iconos son los mismos. La primera es la que hay ahora.
// La usan maquetas/paletas.html (para probarlas en vivo) y el script que saca las capturas.
// Daniel eligió la 7, «claro», el 14-nov-2026: es la que tiene el index.
window.PALETAS = [
  { id: 'ahora', nombre: 'Verde azulado y amarillo (la de antes)',
    por: 'La que había hasta el 14-nov-2026. El amarillo de taxi sobre el verde azulado es la que más se ve de lejos.',
    v: { mesa: '#2B4A52', papel: '#FBFBF8', negro: '#000000', activa: '#F0C419', inactiva: '#D6D3C9', gris: '#55575B', raya: '#CFCCC2', 'sobre-mesa': '#FFFFFF', malla: '232, 240, 243' } },
  { id: 'plano', nombre: 'Plano de arquitecto: azul y naranja',
    por: 'Azul de plano con líneas como un dibujo técnico, y el naranja de las marcas de obra.',
    v: { mesa: '#1E3A5C', papel: '#F6F8FB', negro: '#0B1A2C', activa: '#FF9142', inactiva: '#CDD6E1', gris: '#4A5568', raya: '#CBD4DF', 'sobre-mesa': '#FFFFFF', malla: '175, 205, 255' } },
  { id: 'grafito', nombre: 'Grafito y menta',
    por: 'Casi neutro: la menta es lo único con color, así que la ventana de delante manda.',
    v: { mesa: '#26292D', papel: '#F8F8F6', negro: '#0E0F10', activa: '#6EE7B7', inactiva: '#D5D7D9', gris: '#54575B', raya: '#D0D2D4', 'sobre-mesa': '#FFFFFF', malla: '170, 240, 210' } },
  { id: 'topografico', nombre: 'Mapa topográfico: musgo y azul agua',
    por: 'La malla ya parece curvas de nivel: aquí son color arena sobre verde monte, y el acento es el azul de los ríos.',
    v: { mesa: '#2F3B2B', papel: '#F7F7F1', negro: '#172014', activa: '#8FD3E8', inactiva: '#D6D9CC', gris: '#535A4C', raya: '#CDD1C3', 'sobre-mesa': '#FFFFFF', malla: '222, 205, 150' } },
  { id: 'coral', nombre: 'Noche y coral',
    por: 'El escritorio más oscuro, con ventanas blancas puras: el coral es cálido sin ser amarillo.',
    v: { mesa: '#191D2B', papel: '#FFFFFF', negro: '#141726', activa: '#FF7A6B', inactiva: '#D9DBE3', gris: '#545968', raya: '#D4D7DF', 'sobre-mesa': '#FFFFFF', malla: '255, 170, 160' } },
  { id: 'lima', nombre: 'Violeta y lima',
    por: 'La más atrevida: dos colores que chocan a propósito, para que se recuerde.',
    v: { mesa: '#423C66', papel: '#FBFAFF', negro: '#16132A', activa: '#C6F25E', inactiva: '#D9D6E9', gris: '#55516C', raya: '#D2CFE3', 'sobre-mesa': '#FFFFFF', malla: '210, 200, 255' } },
  { id: 'claro', nombre: 'Escritorio claro y rojo señal (la elegida)',
    por: 'La única clara: papel gris con líneas de lápiz. El rojo va en las barras; la mira y el foco, en negro, porque rojo sobre gris claro no se distingue.',
    v: { mesa: '#D3D1C9', papel: '#FFFFFF', negro: '#111111', activa: '#E8432E', inactiva: '#E6E4DE', gris: '#54555A', raya: '#D7D5CE', mira: '#111111', 'sobre-mesa': '#141414', 'sombra-nombre': 'none', malla: '40, 40, 40' } },
];

// El CSS que pone una paleta encima del index.
// Lo que una paleta no dice se pone aquí, para que no herede lo de la elegida (la mira negra, sin sombra).
window.cssPaleta = function (p) {
  var v = Object.assign({ mira: 'var(--activa)', 'sombra-nombre': '0 1px 2px rgba(0, 0, 0, 0.6)' }, p.v);
  return ':root{' + Object.keys(v).map(function (k) { return '--' + k + ':' + v[k]; }).join(';') + '}';
};
