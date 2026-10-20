/* ============ sugerencias.js — buzón de sugerencias y fallos (MOD nico) ============
 * Peticiones de Nico (20-10-2026): «pon un botón de sugerencias / reportar bug (que salga un aviso del nuevo botón cuando
 * abran el juego por primera vez con la actualización). Que me llegue por email» y, después, «monta una manera de que yo
 * pueda ver las sugerencias sin tener que ayudarte a montarlo en ningún punto».
 *
 * - Botón con un bocadillo en la barra superior de los menús (antes del de sonido) y otro en la pausa.
 * - Formulario propio (#scr-sugerencias, fuera de la lista de pantallas de G.UI: se abre encima del menú o de la pausa
 *   sin cerrarlos): sugerencia o fallo, el texto, un contacto opcional y, marcado por defecto, los datos técnicos
 *   (versión, navegador, pantalla, estilo, idioma, dónde estaba y su nombre de jugador), que se enseñan antes de enviar.
 * - Se guarda en Firestore, en sugerencias/{id} del Firebase propio (también desde un invitado, sin sesión: las reglas
 *   de firestore.rules sólo dejan crear, con sus campos y tamaños). Sólo las cuentas del buzón las leen: las de
 *   G.MODS.devHuellas (la huella de su uid, que las reglas calculan igual: tools/nico/buzon-reglas.js lo prueba).
 * - Buzón (#scr-buzon): para esas cuentas, el botón de la barra superior lleva el número de las que no han leído y abre
 *   el buzón (de la más nueva a la más vieja, «Sin leer» / «Todas», marcar como leída y borrar); también desde
 *   Ajustes > Cuenta, junto al menú de pruebas. Desde el buzón se puede escribir una, como cualquiera.
 * - Correo, opcional: con una «access key» de Web3Forms en G.MODS.sugerenciasClave (pública a propósito: un alias del
 *   correo), además se manda allí, que la reenvía por correo. Sin clave, sólo el buzón. El Firebase va en Spark (sin
 *   Cloud Functions), así que no puede mandar correos él solo.
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

  /** Los datos técnicos en texto («clave: valor» por línea), como los guarda Firestore (≤ 2.000 letras). */
  function tecnicosTexto(d) {
    if (!d) return '';
    return Object.entries(d).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}: ${v}`).join('\n').slice(0, 2000);
  }

  /** Firestore del juego si hay nube (también para un invitado); si no, null. */
  function nube() {
    const fb = G.DB && G.DB.fb;
    return fb && fb.fs && typeof firebase !== 'undefined' && firebase.firestore ? fb : null;
  }
  /** ¿Se puede mandar? Con la nube o con la clave de Web3Forms. */
  const listo = () => !!nube() || !!(G.MODS && G.MODS.sugerenciasClave);

  /** Lo que se guarda en sugerencias/{id} (las reglas lo exigen así). Puro salvo la hora, que pone el servidor. */
  function documento(t, mensaje, contacto, tecnicos, uid) {
    return { tipo: t === 'sugerencia' ? 'sugerencia' : 'fallo', mensaje: String(mensaje).slice(0, MAX), contacto: String(contacto || '').slice(0, 120),
      tecnicos: tecnicosTexto(tecnicos), uid: uid || '', leida: false };
  }

  /** Lo guarda en el buzón. → Promise (falla a los 15 s sin respuesta). */
  function guardar(doc) {
    const fb = nube();
    if (!fb) return Promise.reject(new Error('sin-nube'));
    const u = fb.auth && fb.auth.currentUser;
    const d = Object.assign({}, doc, { uid: u ? u.uid : '', at: firebase.firestore.FieldValue.serverTimestamp() });
    return Promise.race([fb.fs.collection('sugerencias').add(d), new Promise((_, no) => setTimeout(() => no(new Error('tiempo')), 15000))]);
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
      <p class="sub">Cuéntame qué mejorarías o qué ha fallado: le llega directamente a Nico.</p>
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
    estado(listo() ? '' : 'El buzón aún no está listo: de momento no se puede enviar.', listo() ? '' : 'mal');
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
    if (!listo()) { estado('El buzón aún no está listo: de momento no se puede enviar.', 'mal'); return; }
    const texto = $('sug-texto').value;
    const err = validar(texto, Date.now(), +leer('ps.sugerencias.ultimo') || 0);
    if (err) { estado(err, 'mal'); if (!texto.trim() || texto.trim().length < MIN) $('sug-texto').focus(); return; }
    enviando = true;
    $('sug-enviar').disabled = true;
    estado('Enviando…');
    const contacto = $('sug-contacto').value.trim(), tec = $('sug-tecnicos').checked ? datos() : null, bot = $('sug-bot').checked;
    try {
      if (navigator.onLine === false) throw new Error('sin-red');
      // El buzón (Firestore) y, si hay clave, el correo (Web3Forms). Vale con que llegue a uno de los dos.
      const envios = [];
      if (nube() && !bot) envios.push(guardar(documento(tipo, texto.trim(), contacto, tec)));
      if (clave) envios.push(enviar(cuerpo(clave, tipo, texto.trim(), contacto, tec, bot)));
      const r = await Promise.allSettled(envios);
      if (!r.some(x => x.status === 'fulfilled')) throw (r[0] && r[0].reason) || new Error('nada');
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


  // ---------------- buzón (sólo las cuentas de G.MODS.devHuellas; las reglas lo exigen igual) ----------------
  let esBuzon = false, sinLeer = 0, filtro = 'sinleer', ultimaCuenta = 0;
  const buzonAbierto = () => { const s = $('scr-buzon'); return !!s && !s.classList.contains('hidden'); };
  const permitido = () => (G.DevMenu && G.DevMenu.permitido && nube()) ? G.DevMenu.permitido() : Promise.resolve(false);

  function fecha(ts) {
    const d = ts && ts.toDate ? ts.toDate() : null;
    if (!d) return '';
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  const jugadorDe = tec => { const m = /^jugador: (.*)$/m.exec(tec || ''); return m ? m[1] : ''; };

  function crearBuzon() {
    if ($('scr-buzon')) return;
    const sec = document.createElement('section');
    sec.id = 'scr-buzon';
    sec.className = 'scr dim hidden';
    sec.setAttribute('role', 'dialog');
    sec.setAttribute('aria-modal', 'true');
    sec.setAttribute('aria-labelledby', 'buz-titulo');
    sec.innerHTML = `<div class="box buz-caja">
      <div class="buz-cab"><h2 id="buz-titulo">Buzón de sugerencias</h2>
        <div class="buz-filtro" role="radiogroup" aria-label="Qué enseñar">
          <button type="button" class="btn small" role="radio" data-filtro="sinleer">Sin leer</button>
          <button type="button" class="btn small" role="radio" data-filtro="todas">Todas</button>
        </div></div>
      <p class="sub">Sólo lo ve tu cuenta. Las más nuevas, arriba.</p>
      <div class="buz-lista" id="buz-lista" aria-live="polite"></div>
      <div class="row sug-pie">
        <p class="sug-estado" id="buz-estado" role="status"></p>
        <button type="button" class="btn" id="buz-escribir">Escribir una</button>
        <button type="button" class="btn gold" id="buz-cerrar">Cerrar</button>
      </div>
    </div>`;
    document.body.appendChild(sec);
    sec.querySelectorAll('[data-filtro]').forEach(b => { b.onclick = () => { filtro = b.dataset.filtro; pintarBuzon(); }; });
    $('buz-cerrar').onclick = cerrarBuzon;
    $('buz-escribir').onclick = () => { cerrarBuzon(); abrir(); };
    sec.addEventListener('click', e => { if (e.target === sec) cerrarBuzon(); });
    // Las teclas, para el buzón: ni Esc ni la «p» llegan al juego.
    addEventListener('keydown', e => {
      if (!buzonAbierto()) return;
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); cerrarBuzon(); }
    }, true);
    addEventListener('keyup', e => { if (buzonAbierto()) e.stopPropagation(); }, true);
  }

  let docs = [];
  async function cargar() {
    const fb = nube();
    if (!fb) throw new Error('sin-nube');
    const q = await fb.fs.collection('sugerencias').orderBy('at', 'desc').limit(200).get();
    docs = q.docs.map(d => Object.assign({ id: d.id }, d.data()));
    sinLeer = docs.filter(d => !d.leida).length;
    marcarBoton();
  }

  function pintarBuzon() {
    document.querySelectorAll('#scr-buzon [data-filtro]').forEach(b => {
      const on = b.dataset.filtro === filtro;
      b.classList.toggle('gold', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    const ver = filtro === 'todas' ? docs : docs.filter(d => !d.leida);
    const lista = $('buz-lista');
    if (!ver.length) {
      lista.innerHTML = `<p class="buz-vacio">${esc(T(filtro === 'todas' ? 'Todavía no ha llegado ninguna.' : 'No hay ninguna sin leer.'))}</p>`;
    } else {
      lista.innerHTML = ver.map(d => `<article class="buz-item${d.leida ? '' : ' nueva'}" data-id="${esc(d.id)}">
        <div class="buz-meta"><b>${esc(T(d.tipo === 'sugerencia' ? 'Idea' : 'Fallo'))}</b> · ${esc(fecha(d.at))}${jugadorDe(d.tecnicos) ? ' · <span translate="no">' + esc(jugadorDe(d.tecnicos)) + '</span>' : ''}</div>
        <p class="buz-texto" translate="no">${esc(d.mensaje || '')}</p>
        ${d.contacto ? `<p class="buz-contacto">${esc(T('Contacto:'))} <span translate="no">${esc(d.contacto)}</span></p>` : ''}
        ${d.tecnicos ? `<details class="sug-ver"><summary>${esc(T('Datos técnicos'))}</summary><pre translate="no">${esc(d.tecnicos)}</pre></details>` : ''}
        <div class="row buz-acciones">
          <button type="button" class="btn small" data-accion="leida">${esc(T(d.leida ? 'Marcar como no leída' : 'Marcar como leída'))}</button>
          <button type="button" class="btn small danger" data-accion="borrar">${esc(T('Borrar'))}</button>
        </div></article>`).join('');
      lista.querySelectorAll('[data-accion]').forEach(b => { b.onclick = () => accion(b.closest('.buz-item').dataset.id, b.dataset.accion); });
    }
    $('buz-titulo').textContent = T('Buzón de sugerencias') + (sinLeer ? ` (${sinLeer})` : '');
  }

  async function accion(id, que) {
    const fb = nube(), d = docs.find(x => x.id === id);
    if (!fb || !d) return;
    try {
      if (que === 'borrar') {
        if (!window.confirm(T('¿Borrar esta sugerencia? No se puede deshacer.'))) return;
        await fb.fs.collection('sugerencias').doc(id).delete();
        docs = docs.filter(x => x.id !== id);
      } else {
        await fb.fs.collection('sugerencias').doc(id).update({ leida: !d.leida });
        d.leida = !d.leida;
      }
      sinLeer = docs.filter(x => !x.leida).length;
      marcarBoton();
      $('buz-estado').textContent = '';
      pintarBuzon();
    } catch (e) {
      $('buz-estado').textContent = T('No se ha podido guardar el cambio. Prueba otra vez.');
      $('buz-estado').className = 'sug-estado mal';
    }
  }

  async function abrirBuzon() {
    crearBuzon();
    vistoAviso();
    volverA = document.activeElement;
    $('scr-buzon').classList.remove('hidden');
    $('buz-lista').innerHTML = `<p class="buz-vacio">${esc(T('Cargando…'))}</p>`;
    $('buz-estado').textContent = '';
    try { await cargar(); pintarBuzon(); } catch (e) {
      $('buz-lista').innerHTML = '';
      $('buz-estado').textContent = T('No se ha podido abrir el buzón. Prueba otra vez en un rato.');
      $('buz-estado').className = 'sug-estado mal';
    }
    setTimeout(() => { const b = $('buz-cerrar'); if (b && buzonAbierto()) b.focus(); }, 30);
  }
  function cerrarBuzon() {
    if (!buzonAbierto()) return;
    $('scr-buzon').classList.add('hidden');
    if (volverA && volverA.focus && volverA.isConnected) volverA.focus();
    volverA = null;
  }

  /** El botón de la barra, en una cuenta del buzón: abre el buzón y lleva el número de las que no ha leído. */
  function marcarBoton() {
    const b = $('btn-sugerencias');
    if (!b) return;
    let n = b.querySelector('.buz-num');
    if (!esBuzon || !sinLeer) { if (n) n.remove(); return; }
    if (!n) { n = document.createElement('span'); n.className = 'buz-num'; b.appendChild(n); }
    n.textContent = sinLeer > 99 ? '99+' : String(sinLeer);
  }
  /** Al llegar al menú: ¿es una cuenta del buzón? Entonces cuenta las que no ha leído (como mucho una vez por minuto). */
  function mirarBuzon() {
    permitido().then(ok => {
      const antes = esBuzon;
      esBuzon = !!ok;
      const b = $('btn-sugerencias');
      if (b && antes !== esBuzon) { b.title = T(esBuzon ? 'Buzón de sugerencias' : 'Sugerencias y fallos'); b.setAttribute('aria-label', b.title); }
      if (!esBuzon) { sinLeer = 0; marcarBoton(); return; }
      if (Date.now() - ultimaCuenta < 60000) return;
      ultimaCuenta = Date.now();
      nube().fs.collection('sugerencias').where('leida', '==', false).limit(100).get()
        .then(q => { sinLeer = q.size; marcarBoton(); }).catch(() => { ultimaCuenta = 0; });
    });
  }

  /** Gancho de settings-ui.js (render, tras el menú de pruebas): en Ajustes > Cuenta, la entrada al buzón. */
  function ajustes(box, tab) {
    if (!box || tab !== 'acc') return;
    permitido().then(ok => {
      if (!ok || !box.isConnected || box.querySelector('#buz-ajustes')) return;
      box.insertAdjacentHTML('beforeend', `<div id="buz-ajustes"><h3 class="set-h">${esc(T('Buzón de sugerencias'))}</h3>
        <p class="sub">${esc(T('Lo que mandan los jugadores desde «Sugerencias y fallos». Sólo lo ve tu cuenta.'))}</p>
        <button class="btn small" type="button" id="buz-abrir">${esc(T('Abrir el buzón'))}</button></div>`);
      $('buz-abrir').onclick = abrirBuzon;
    });
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
      b.onclick = () => (esBuzon ? abrirBuzon() : abrir());
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
      <p>¿Tienes una idea o has visto algún fallo? Cuéntamelo desde este botón: me llega directamente.</p>
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
    let enMenu = false;
    const mirar = () => {
      // Al llegar al menú, si es una cuenta del buzón, cuenta las que no ha leído.
      const m = $('scr-menu'), ahora = !!m && !m.classList.contains('hidden');
      if (ahora && !enMenu) mirarBuzon();
      enMenu = ahora;
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

  return { abrir, cerrar, abierto, cuerpo, validar, datos, documento, tecnicosTexto, iconoUrl, enseñarAviso, vistoAviso, abrirBuzon, cerrarBuzon, ajustes, URL_ENVIO };
})();
