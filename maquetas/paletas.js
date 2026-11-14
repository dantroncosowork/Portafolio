// Paletas de prueba para Daniel OS. Cada una cambia sólo las variables de color del index;
// la estructura, el fondo de fragmentos, los iconos y el centro de avisos son los mismos.
// La usan maquetas/paletas.html (para probarlas en vivo) y el script que saca las capturas.
// Daniel eligió la 7, «claro», el 14-nov-2026: es la que tiene el index. El número de cada una no se
// mueve, porque él las nombra por su número.
window.PALETAS = [
  { id: 'ahora', nombre: 'Verde azulado y amarillo (la de antes)',
    por: 'La que había hasta el 14-nov-2026. El amarillo de taxi sobre el verde azulado es la que más se ve de lejos.',
    v: { mesa: '#2B4A52', papel: '#FBFBF8', negro: '#000000', activa: '#F0C419', inactiva: '#D6D3C9', gris: '#55575B', raya: '#CFCCC2', 'sobre-mesa': '#FFFFFF', fragmento: '232, 240, 243' } },
  { id: 'plano', nombre: 'Plano de arquitecto: azul y naranja',
    por: 'Azul de plano, con los fragmentos como trazos de dibujo técnico, y el naranja de las marcas de obra.',
    v: { mesa: '#1E3A5C', papel: '#F6F8FB', negro: '#0B1A2C', activa: '#FF9142', inactiva: '#CDD6E1', gris: '#4A5568', raya: '#CBD4DF', 'sobre-mesa': '#FFFFFF', fragmento: '175, 205, 255' } },
  { id: 'grafito', nombre: 'Grafito y menta',
    por: 'Casi neutro: la menta es lo único con color, así que la ventana de delante manda.',
    v: { mesa: '#26292D', papel: '#F8F8F6', negro: '#0E0F10', activa: '#6EE7B7', inactiva: '#D5D7D9', gris: '#54575B', raya: '#D0D2D4', 'sobre-mesa': '#FFFFFF', fragmento: '170, 240, 210' } },
  { id: 'topografico', nombre: 'Mapa topográfico: musgo y azul agua',
    por: 'Verde monte con fragmentos color arena, y el acento en el azul de los ríos.',
    v: { mesa: '#2F3B2B', papel: '#F7F7F1', negro: '#172014', activa: '#8FD3E8', inactiva: '#D6D9CC', gris: '#535A4C', raya: '#CDD1C3', 'sobre-mesa': '#FFFFFF', fragmento: '222, 205, 150' } },
  { id: 'coral', nombre: 'Noche y coral',
    por: 'El escritorio más oscuro, con ventanas blancas puras: el coral es cálido sin ser amarillo.',
    v: { mesa: '#191D2B', papel: '#FFFFFF', negro: '#141726', activa: '#FF7A6B', inactiva: '#D9DBE3', gris: '#545968', raya: '#D4D7DF', 'sobre-mesa': '#FFFFFF', fragmento: '255, 170, 160' } },
  { id: 'lima', nombre: 'Violeta y lima',
    por: 'La más atrevida: dos colores que chocan a propósito, para que se recuerde.',
    v: { mesa: '#423C66', papel: '#FBFAFF', negro: '#16132A', activa: '#C6F25E', inactiva: '#D9D6E9', gris: '#55516C', raya: '#D2CFE3', 'sobre-mesa': '#FFFFFF', fragmento: '210, 200, 255' } },
  { id: 'claro', nombre: 'Escritorio claro y rojo señal (la elegida)',
    por: 'La única clara: papel gris con fragmentos de lápiz. El rojo va en las barras; la mira y el foco, en negro, porque rojo sobre gris claro no se distingue.',
    v: { mesa: '#D3D1C9', papel: '#FFFFFF', negro: '#111111', activa: '#E8432E', inactiva: '#E6E4DE', gris: '#54555A', raya: '#D7D5CE', mira: '#111111', 'sobre-mesa': '#141414', 'sombra-nombre': 'none', fragmento: '40, 40, 40' } },
  { id: 'gemini', nombre: 'Verde azulado y menta (los colores del fichero de Gemini)',
    por: 'El verde azulado y la menta que traía portafolio-combinado.html. Para verla como allí, pon el panel en cristal oscuro.',
    v: { mesa: '#2B4A52', papel: '#F6F8F8', negro: '#0E1315', activa: '#6EE7B7', inactiva: '#D3DCDD', gris: '#4F5A5D', raya: '#CCD6D8', 'sobre-mesa': '#FFFFFF', fragmento: '232, 240, 243' } },
];
window.ELEGIDA = 6; // la posición de «claro» en la lista

// El aspecto del centro de avisos. «papel» es el del index y no cambia nada.
window.PANELES = [
  { id: 'papel', nombre: 'Papel, como las ventanas (el del index)',
    por: 'Las tarjetas son como las ventanas: blancas, con borde negro y sombra dura. Todo el escritorio habla igual.',
    v: {} },
  { id: 'cristal-claro', nombre: 'Cristal claro',
    por: 'Como Windows 11 en modo claro: esquinas redondas, medio transparente, y lo de detrás se ve desenfocado.',
    v: { panel: 'rgba(255, 255, 255, 0.8)', 'panel-tinta': '#111111', 'panel-gris': '#4A4B50', 'panel-borde': '1px solid rgba(0, 0, 0, 0.16)', 'panel-radio': '14px', 'panel-sombra': '0 18px 44px rgba(0, 0, 0, 0.24)', 'panel-niebla': 'blur(22px) saturate(1.4)' } },
  { id: 'cristal-oscuro', nombre: 'Cristal oscuro',
    por: 'El del fichero de Gemini, y el de Windows 11 en modo oscuro: se separa de las ventanas como una capa del sistema.',
    v: { panel: 'rgba(22, 24, 28, 0.86)', 'panel-tinta': '#F4F6F7', 'panel-gris': '#B9BEC4', 'panel-borde': '1px solid rgba(255, 255, 255, 0.16)', 'panel-radio': '14px', 'panel-sombra': '0 20px 48px rgba(0, 0, 0, 0.4)', 'panel-niebla': 'blur(20px)' } },
];

// El CSS que pone una paleta (y, si se dice, un aspecto del panel) encima del index.
// Lo que una paleta no dice se pone aquí, para que no herede lo de la elegida (la mira negra, sin sombra).
window.cssPaleta = function (p, panel) {
  var v = Object.assign({ mira: 'var(--activa)', 'sombra-nombre': '0 1px 2px rgba(0, 0, 0, 0.6)' }, p.v, panel ? panel.v : {});
  return ':root{' + Object.keys(v).map(function (k) { return '--' + k + ':' + v[k]; }).join(';') + '}';
};
