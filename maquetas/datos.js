// Lo común de las maquetas: leen los mismos proyectos.json y logros.json que la web,
// así que ninguna cifra va escrita a mano.
(function () {
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var TIPOS = { app: 'Apps', juego: 'Juegos', automatizacion: 'Automatizaciones', flujo: 'Flujos de trabajo' };
  var TIPO_UNO = { app: 'App', juego: 'Juego', automatizacion: 'Automatización', flujo: 'Flujo de trabajo' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fecha(iso) {
    var p = String(iso).split('-');
    return p.length === 3 ? (+p[2]) + ' ' + MESES[+p[1] - 1] + ' ' + p[0] : esc(iso);
  }
  function mesLargo(iso) {
    var p = String(iso).split('-');
    return MESES_LARGOS[+p[1] - 1] + ' ' + p[0];
  }
  function esImagen(c) { return /\.(png|jpe?g|webp|gif)$/i.test(c); }

  window.Portafolio = {
    esc: esc, fecha: fecha, mesLargo: mesLargo, TIPOS: TIPOS, TIPO_UNO: TIPO_UNO,
    cargar: function () {
      function leer(f) { return fetch(f, { cache: 'no-cache' }).then(function (r) { return r.json(); }); }
      return Promise.all([leer('../proyectos.json'), leer('../logros.json')]).then(function (r) {
        var d = {
          perfil: r[0].perfil || {},
          certificaciones: r[0].certificaciones || [],
          proyectos: r[0].proyectos || [],
          logros: (r[1] || []).slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0; })
        };
        d.foto = d.perfil.foto ? '../' + d.perfil.foto : null;
        d.logrosDe = function (id) { return d.logros.filter(function (l) { return l.proyecto === id; }); };
        d.pasos = function (id) { return d.logrosDe(id).filter(function (l) { return l.hito; }).length || d.logrosDe(id).length; };
        d.imagenes = function (l) { return (l.capturas || []).filter(esImagen).map(function (c) { return '../' + c; }); };
        d.portada = function (id) {
          var ls = d.logrosDe(id);
          for (var i = 0; i < ls.length; i++) {
            var cs = d.imagenes(ls[i]);
            var ancha = cs.filter(function (c) { return !/-390\./.test(c); })[0];
            if (ancha) return ancha;
          }
          return null;
        };
        d.proyecto = function (id) { return d.proyectos.filter(function (p) { return p.id === id; })[0] || { nombre: id, tipo: 'app' }; };
        d.cifras = {
          proyectos: d.proyectos.length,
          certificaciones: d.certificaciones.length,
          avances: d.logros.length,
          ultimo: d.logros[0] ? d.logros[0].fecha : null
        };
        d.tiposUsados = Object.keys(TIPOS).filter(function (t) { return d.proyectos.some(function (p) { return p.tipo === t; }); });
        return d;
      });
    }
  };
})();
