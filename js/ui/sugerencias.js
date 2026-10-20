/* ============ sugerencias.js — sugerencias y fallos por correo (MOD nico) ============
 * Petición de Nico (20-10-2026): «pon un botón de sugerencias / reportar bug (que salga un aviso del nuevo botón cuando
 * abran el juego por primera vez con la actualización). Que me llegue por email».
 *
 * - Botón con un bocadillo en la barra superior de los menús (antes del de sonido) y otro en la pausa.
 * - Formulario propio (#scr-sugerencias, fuera de la lista de pantallas de G.UI: se abre encima del menú o de la pausa
 *   sin cerrarlos): sugerencia o fallo, el texto, un contacto opcional y, marcado por defecto, los datos técnicos
 *   (versión, navegador, pantalla, estilo, idioma, dónde estaba y su nombre de jugador), que se enseñan antes de enviar.
 * - Se manda con fetch a Web3Forms (https://web3forms.com, plan gratuito), que lo reenvía al correo de Nico. Su
 *   «access key» va en G.MODS.sugerenciasClave y es pública a propósito: es un alias de su correo, no una contraseña.
 *   El Firebase va en Spark (sin Cloud Functions), así que no puede mandar correos él solo.
 * - Aviso de novedad: una vez por navegador (localStorage ps.aviso.<G.MODS.sugerenciasAviso>), al llegar al menú, un
 *   bocadillo junto al botón con «Escribir» y «Entendido»; hasta cerrarlo, el botón lleva un punto dorado.
 * - Mientras está abierto, las teclas no llegan al juego (escribir una «p» en la pausa la quitaba).
 *
 * Ningún gancho en el código de upstream: el fichero mete sus botones al cargar y mira el menú con un MutationObserver.
 * dev.html lo carga tras dev-menu.js. Sin este fichero, todo como antes.
 */
G.Sugerencias = (() => {
  const URL_ENVIO = 'https://api.web3forms.com/submit';
  const MAX = 3000, MIN = 10;
  const VERSION = '1.0';   // la de Ajustes > Acerca de (VERSION de settings-ui.js)
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = s => (G.T ? G.T(s) : s);

  // ---------------- icono (12×12, como los de js/ui/icons.js): un bocadillo con una exclamación ----------------
  // Hueco, como los de sonido y pantalla completa: en el menú Dex de un móvil la pantalla opaca va al límite del 25 %.
  const FILAS = [
    '.kkkkkkkkkk.', 'kwwwwwwwwwwk', 'kw...kk...wk', 'kw..kyyk..wk', 'kw..kyyk..wk', 'kw...kk...wk',
    'kw..kyyk..wk', 'kw...kk...wk', 'kwwwwwwwwwwk', '.kwwkkkkkkk.', '.kwk........', '.kk.........'];
  const PAL = { k: '#1b1528', w: '#e8eef8', y: '#e8a33a' };
  let icono = '';
  function iconoUrl() {
    if (icono) return icono;
    let r = '';
    FILAS.forEach((fila, y) => [...fila].forEach((c, x) => { if (PAL[c]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[c]}"/>`; }));
    icono = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${r}</svg>`);
    return icono;
  }
  const img = (px = 24) => `<img class="pix" src="${iconoUrl()}" width="${px}" height="${px}" alt="" draggable="false">`;

  // ---------------- estado ----------------
  let tipo = 'fallo';
  let enviando = false;
  let volverA = null;   // el elemento que tenía el foco al abrir

  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* nada */ } };
  const claveAviso = () => (G.MODS && G.MODS.sugerenciasAviso) ? 'ps.aviso.' + G.MODS.sugerenciasAviso : '';
  const avisoVisto = () => { const k = claveAviso(); return !k || leer(k) === '1'; };

  // ---------------- datos técnicos ----------------
  function donde() {
    const st = G.Game && G.Game.state;
    if (G.UI && G.UI.isOpen && $('scr-pause') && G.UI.isOpen('scr-pause')) return (G.Coop && G.Coop.active ? 'pausa en grupo' : 'pausa') + (st ? ' (' + st + ')' : '');
    return st ? String(st) : 'menú';
  }
  function datos() {
    const db = G.DB || {}, fb = db.fb || {};
    const s = typeof screen !== 'undefined' ? screen : {};
    return {
      jugador: db.guest ? 'Invitado' : (db.user || '¿?'),
      uid: (!db.guest && fb.uid) || '',
      version: VERSION + (/dev\.html$/.test(location.pathname) ? ' (dev.html)' : ''),
      pagina: location.origin + location.pathname,
      navegador: navigator.userAgent,
      pantalla: `ventana ${innerWidth}x${innerHeight} · pantalla ${s.width || '?'}x${s.height || '?'} · dpr ${Math.round((devicePixelRatio || 1) * 100) / 100}` + (matchMedia && matchMedia('(pointer: coarse)').matches ? ' · táctil' : ''),
      estilo: document.documentElement.classList.contains('estilo-dex') ? 'Dex' : 'Clásico',
      idioma: (G.I18n && G.I18n.lang) || navigator.language || '',
      donde: donde()
    };
  }

  /** Lo que se manda a Web3Forms. Puro: sólo lee sus argumentos. */
  function cuerpo(clave, t, mensaje, contacto, tecnicos, botcheck) {
    const titulo = mensaje.replace(/\s+/g, ' ').trim().slice(0, 60);
    const c = {
      access_key: clave,
      subject: `PokéSwarm · ${t === 'sugerencia' ? 'Sugerencia' : 'Fallo'}: ${titulo}${mensaje.trim().length > 60 ? '…' : ''}`,
      from_name: 'PokéSwarm',
      botcheck: !!botcheck,
      tipo: t === 'sugerencia' ? 'Sugerencia' : 'Fallo',
      mensaje,
      contacto: contacto || '(sin contacto)'
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto || '')) c.replyto = contacto;
    if (tecnicos) Object.assign(c, tecnicos);
    return c;
  }

  /** Comprueba el formulario. → '' si vale, o el texto del error. */
  function validar(mensaje, ahora, ultimo) {
    const m = (mensaje || '').trim();
    if (m.length < MIN) return 'Cuéntalo con un poco más de detalle (al menos 10 letras).';
    if (m.length > MAX) return 'Es demasiado largo: como mucho 3.000 letras.';
    const espera = Math.max(0, +((G.MODS && G.MODS.sugerenciasEsperaS) || 0)) * 1000;
    if (ultimo && ahora - ultimo < espera) return 'Espera unos segundos antes de enviar otro.';
    return '';
  }

  async function enviar(c) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctl && setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(URL_ENVIO, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(c), signal: ctl && ctl.signal });
      let j = {};
      try { j = await r.json(); } catch (e) { /* nada */ }
      if (!r.ok || j.success === false) throw new Error((j && j.message) || 'HTTP ' + r.status);
      return j;
    } finally { if (t) clearTimeout(t); }
  }

  // ---------------- interfaz ----------------
  function crear() {
    if ($('scr-sugerencias')) return;
    const sec = document.createElement('section');
    sec.id = 'scr-sugerencias';
    sec.className = 'scr dim hidden';
    sec.setAttribute('role', 'dialog');
    sec.setAttribute('aria-modal', 'true');
    sec.setAttribute('aria-labelledby', 'sug-titulo');
    sec.innerHTML = `<div class="box sug-caja">
      <h2 id="sug-titulo">Sugerencias y fallos</h2>
      <p class="sub">Cuéntame qué mejorarías o qué ha fallado: le llega a Nico por correo.</p>
      <div class="sug-tipos" role="radiogroup" aria-label="¿Qué quieres contar?">
        <button type="button" class="btn small" role="radio" data-tipo="fallo">Algo ha fallado</button>
        <button type="button" class="btn small" role="radio" data-tipo="sugerencia">Tengo una idea</button>
      </div>
      <label class="sug-et" for="sug-texto" id="sug-et-texto"></label>
      <textarea id="sug-texto" class="field" rows="5" maxlength="${MAX}" translate="no"></textarea>
      <div class="sug-cuenta" id="sug-cuenta" aria-hidden="true"></div>
      <label class="sug-et" for="sug-contacto">Contacto (opcional, por si hay que preguntarte algo)</label>
      <input id="sug-contacto" class="field" type="text" maxlength="120" autocomplete="email" translate="no" placeholder="Tu correo o tu nombre en el juego">
      <input id="sug-bot" type="checkbox" tabindex="-1" aria-hidden="true" class="sug-bot">
      <label class="sug-chk"><input id="sug-tecnicos" type="checkbox" checked> Incluir datos técnicos (versión, navegador, pantalla y tu nombre de jugador)</label>
      <details class="sug-ver"><summary>Ver qué se envía</summary><pre id="sug-datos" translate="no"></pre></details>
      <div class="row sug-pie">
        <p class="sug-estado" id="sug-estado" role="status" aria-live="polite"></p>
        <button type="button" class="btn" id="sug-cancelar">Cerrar</button>
        <button type="button" class="btn gold" id="sug-enviar">Enviar</button>
      </div>
    </div>`;
    document.body.appendChild(sec);
    sec.querySelectorAll('[data-tipo]').forEach(b => { b.onclick = () => ponerTipo(b.dataset.tipo); });
    sec.querySelector('.sug-tipos').addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      ponerTipo(tipo === 'fallo' ? 'sugerencia' : 'fallo');
      sec.querySelector(`[data-tipo="${tipo}"]`).focus();
    });
    $('sug-texto').addEventListener('input', cuenta);
    $('sug-tecnicos').addEventListener('change', verDatos);
    $('sug-cancelar').onclick = cerrar;
    $('sug-enviar').onclick = mandar;
    sec.addEventListener('click', e => { if (e.target === sec) cerrar(); });
    // Las teclas, para el formulario: ni Esc ni la «p» ni WASD llegan al juego (G.Input escucha en window, sin captura).
    addEventListener('keydown', e => {
      if (!abierto()) return;
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
      else if (e.key === 'Tab') atraparFoco(e);
    }, true);
    addEventListener('keyup', e => { if (abierto()) e.stopPropagation(); }, true);
    ponerTipo(tipo);
  }

  function atraparFoco(e) {
    const f = [...$('scr-sugerencias').querySelectorAll('button, textarea, input:not(.sug-bot), summary')].filter(el => el.offsetParent !== null && !el.disabled);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }

  function ponerTipo(t) {
    tipo = t === 'sugerencia' ? 'sugerencia' : 'fallo';
    document.querySelectorAll('#scr-sugerencias [data-tipo]').forEach(b => {
      const on = b.dataset.tipo === tipo;
      b.classList.toggle('gold', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    const et = $('sug-et-texto'), ta = $('sug-texto');
    if (!et) return;
    et.textContent = tipo === 'fallo' ? '¿Qué ha pasado?' : '¿Qué te gustaría cambiar o añadir?';
    ta.placeholder = T(tipo === 'fallo' ? 'Qué estabas haciendo, qué esperabas y qué ha pasado. Si se repite, cómo.' : 'Cuanto más concreto, mejor.');
  }

  function cuenta() {
    const n = $('sug-texto').value.length;
    $('sug-cuenta').textContent = n > MAX * 0.8 ? `${n} / ${MAX}` : '';
  }

  function verDatos() {
    const on = $('sug-tecnicos').checked;
    $('sug-datos').textContent = on ? Object.entries(datos()).filter(([, v]) => v !== '').map(([k, v]) => `${k}: ${v}`).join('\n') : T('Sólo el tipo, el texto y el contacto.');
  }

  function estado(txt, clase = '') {
    const el = $('sug-estado');
    el.textContent = txt;
    el.className = 'sug-estado' + (clase ? ' ' + clase : '');
  }

  const abierto = () => { const s = $('scr-sugerencias'); return !!s && !s.classList.contains('hidden'); };

  function abrir() {
    crear();
    vistoAviso();
    volverA = document.activeElement;
    estado(G.MODS && G.MODS.sugerenciasClave ? '' : 'El buzón aún no está listo: de momento no se puede enviar.', G.MODS && G.MODS.sugerenciasClave ? '' : 'mal');
    verDatos();
    cuenta();
    $('sug-enviar').disabled = false;
    $('scr-sugerencias').classList.remove('hidden');
    setTimeout(() => { const ta = $('sug-texto'); if (ta && abierto()) ta.focus(); }, 30);
  }

  function cerrar() {
    if (!abierto()) return;
    $('scr-sugerencias').classList.add('hidden');
    if (volverA && volverA.focus && volverA.isConnected) volverA.focus();
    volverA = null;
  }

  async function mandar() {
    if (enviando) return;
    const clave = G.MODS && G.MODS.sugerenciasClave;
    if (!clave) { estado('El buzón aún no está listo: de momento no se puede enviar.', 'mal'); return; }
    const texto = $('sug-texto').value;
    const err = validar(texto, Date.now(), +leer('ps.sugerencias.ultimo') || 0);
    if (err) { estado(err, 'mal'); if (!texto.trim() || texto.trim().length < MIN) $('sug-texto').focus(); return; }
    enviando = true;
    $('sug-enviar').disabled = true;
    estado('Enviando…');
    const c = cuerpo(clave, tipo, texto.trim(), $('sug-contacto').value.trim(), $('sug-tecnicos').checked ? datos() : null, $('sug-bot').checked);
    try {
      await enviar(c);
      escribir('ps.sugerencias.ultimo', String(Date.now()));
      $('sug-texto').value = '';
      cuenta();
      estado('¡Enviado! Gracias por contarlo.', 'bien');
      if (G.Audio && G.Audio.sfx) G.Audio.sfx('buy');
      setTimeout(() => { if (abierto() && $('sug-estado').classList.contains('bien')) cerrar(); }, 1800);
    } catch (e) {
      estado(navigator.onLine === false ? 'Sin conexión: no se ha enviado. Tu texto sigue aquí; prueba otra vez.' : 'No se ha podido enviar. Tu texto sigue aquí; prueba otra vez en un rato.', 'mal');
      $('sug-enviar').disabled = false;
    } finally { enviando = false; }
  }

  // ---------------- botones ----------------
  function botones() {
    const bar = $('topbar');
    if (bar && !$('btn-sugerencias')) {
      const b = document.createElement('button');
      b.id = 'btn-sugerencias';
      b.className = 'btn small ghost';
      b.type = 'button';
      b.title = 'Sugerencias y fallos';
      b.setAttribute('aria-label', 'Sugerencias y fallos');
      b.innerHTML = img(24);
      b.onclick = abrir;
      const antes = $('btn-sound');
      if (antes && antes.parentNode === bar) bar.insertBefore(b, antes); else bar.appendChild(b);
      b.classList.toggle('sug-nuevo', !avisoVisto());
    }
    const fila = $('btn-quit') && $('btn-quit').parentNode;
    if (fila && !$('btn-pause-sugerencias')) {
      const b = document.createElement('button');
      b.id = 'btn-pause-sugerencias';
      b.className = 'btn';
      b.type = 'button';
      b.innerHTML = img(24) + ' <span>Sugerencia o fallo</span>';
      b.onclick = abrir;
      fila.appendChild(b);
    }
  }

  // ---------------- aviso de novedad ----------------
  let avisoT = 0;
  function vistoAviso() {
    const k = claveAviso();
    if (k) escribir(k, '1');
    const b = $('btn-sugerencias');
    if (b) b.classList.remove('sug-nuevo');
    const a = $('sug-aviso');
    if (a) a.remove();
    removeEventListener('resize', colocarAviso);
  }

  /** ¿Se puede enseñar ahora? El menú principal a la vista, sin un submenú, otra capa ni un aviso de logro. */
  function menuLibre() {
    const m = $('scr-menu'), bar = $('topbar'), b = $('btn-sugerencias');
    if (!m || m.classList.contains('hidden') || !bar || bar.classList.contains('hidden') || !b || !b.offsetParent) return false;
    if (document.querySelector('.scr.dim:not(.hidden), .tapstart:not(.hidden), #boot:not(.hidden), #pull-fx:not(.hidden), #ach-pop:not(.hidden)')) return false;   // ni encima de un aviso de logro (el de «Primer compañero» sale al llegar al menú)
    return true;
  }

  function colocarAviso() {
    const a = $('sug-aviso'), b = $('btn-sugerencias');
    if (!a || !b) return;
    const r = b.getBoundingClientRect(), w = a.offsetWidth;
    const x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w + 28));
    a.style.left = x + 'px';
    a.style.top = (r.bottom + 10) + 'px';
    a.style.setProperty('--sug-flecha', Math.max(12, Math.min(w - 20, r.left + r.width / 2 - x - 7)) + 'px');
  }

  function enseñarAviso() {
    if (avisoVisto() || $('sug-aviso') || !menuLibre()) return;
    const a = document.createElement('div');
    a.id = 'sug-aviso';
    a.className = 'box sug-aviso';
    a.setAttribute('role', 'dialog');
    a.setAttribute('aria-label', 'Novedad');
    a.innerHTML = `<b class="sug-novedad">Novedad</b>
      <p>¿Tienes una idea o has visto algún fallo? Cuéntamelo desde este botón: me llega por correo.</p>
      <div class="row sug-botones"><button type="button" class="btn small" id="sug-aviso-ok">Entendido</button>
      <button type="button" class="btn small gold" id="sug-aviso-ir">Escribir</button></div>`;
    document.body.appendChild(a);
    $('sug-aviso-ok').onclick = vistoAviso;
    $('sug-aviso-ir').onclick = abrir;
    colocarAviso();
    addEventListener('resize', colocarAviso);
  }

  /** Mira el menú: al llegar a él (y sin nada encima un momento), el aviso; si se abre otra cosa, se esconde. */
  function vigilar() {
    if (typeof MutationObserver === 'undefined') return;
    const mirar = () => {
      const a = $('sug-aviso');
      if (a) { a.classList.toggle('hidden', !menuLibre()); if (!a.classList.contains('hidden')) colocarAviso(); return; }
      if (avisoVisto()) return;
      clearTimeout(avisoT);
      avisoT = setTimeout(() => { if (menuLibre()) enseñarAviso(); }, 1200);
    };
    new MutationObserver(mirar).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    mirar();
  }

  function iniciar() {
    if (!document.body || !$('topbar')) return;
    botones();
    vigilar();
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
  }

  return { abrir, cerrar, abierto, cuerpo, validar, datos, iconoUrl, enseñarAviso, vistoAviso, URL_ENVIO };
})();
