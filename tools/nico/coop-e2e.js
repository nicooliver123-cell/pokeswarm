/* ============ tools/nico/coop-e2e.js — E2E del cooperativo de nuestra versión ============
 *   cd tools/nico && npm install   (la primera vez)
 *   node coop-e2e.js [--dev] [--headed] [--grande 799] [--normal 25] [--puerto 8090]
 *                    [--latencia 150] [--reutilizar-emulador]
 *
 * Qué hace, todo en este PC y sin tocar ningún servicio real:
 *   1. Arranca el emulador de Firebase (Auth 9099, Firestore 8080, RTDB 9000; proyecto
 *      demo-ps) con el JDK portable de ~/.cache/temurin-21 (sólo en el entorno del
 *      proceso, sin tocar el PATH del sistema). Si esos puertos ya están ocupados, para
 *      con un mensaje claro; con --reutilizar-emulador usa el que haya (y no lo cierra).
 *   2. Sirve el repo en http://127.0.0.1:8090 y abre index.html?emu (el paquete
 *      js/app.min.js; con --dev, dev.html con los scripts sueltos).
 *   3. Dos jugadores en dos navegadores aislados (Playwright/Chromium): crean cuenta de
 *      prueba y eligen su inicial en «Elige a tu compañero» (sin el test de personalidad,
 *      G.MODS.sinTest: el test no sale nunca; inicial, compañero y personalidad null en la
 *      nube), A elige después un Pokémon GRANDE (Guzzlord) y B uno normal
 *      (Pikachu), se hacen amigos, A invita, B entra y juegan una partida en grupo.
 *      A es el anfitrión; B, el invitado (como jugará el amigo de Nico).
 *   4. Comprueba que cada uno ve al otro moverse, que el grande sale reducido en los dos
 *      clientes (misma escala, hitbox, alto y sprite) y el normal intacto.
 *   5. Transporte (obligatorio): los dos se ven por el canal directo (G.Net.mode 'direct'),
 *      el par de candidatos elegido de WebRTC está conectado y no pasa por un TURN, el canal
 *      del juego lleva mensajes en los dos sentidos, y durante la partida no se manda nada
 *      por el relé de la base de datos.
 *   6. Vida de los enemigos, con una TRAMPA en el setter de `hp` de G.Enemy (cada
 *      escritura, sin huecos de muestreo), en los dos clientes:
 *      - Anfitrión: con el mod no sube nunca (curandera forzada incluida); como control,
 *        activa un momento curacionEnemiga=true y exige que SÍ suba.
 *      - Invitado: con latencia simulada en su canal (--latencia ms por sentido), golpes
 *        suyos y escudos forzados, no puede verse ninguna subida que dure más de un
 *        fotograma de red (150 ms) salvo la resincronización legítima tras la ventana
 *        (ver CRITERIO abajo); con escudo no predice el golpe. Control: el invitado sin
 *        el mod (curacionEnemiga=true en su cliente) SÍ ve subidas largas y predice con
 *        escudo, así que la prueba sabe detectarlo.
 *      - Vuelta de la grieta: el invitado borra sus copias y el anfitrión las vuelve a
 *        anunciar ('ne'), como en rift.js; las copias nacen con la vida real.
 *   7. Falla si algún cliente habla con la infraestructura del proyecto base, si hay
 *      errores de JavaScript o si el aviso legal no lleva el contacto del fork.
 *   9. Grieta garantizada (G.MODS.grietaGarantizadaAntesDe), al final de la partida: hasta
 *      entonces está desactivada en los dos para que no interfiera. A (anfitrión) adelanta su
 *      reloj hasta la hora elegida (ayuda de depuración: sólo en esta prueba; el juego nunca la
 *      usa); B la recibe en las mismas x e y y no abre ninguna por su cuenta aunque también le
 *      toque; B entra, los dos acaban en la arena, el legendario tiene el 60 % de la vida que
 *      tendría sin el mod y, al vencerlo, los dos tienen un vínculo (bonds === 1). Después, la
 *      vuelta real, con la cuenta atrás de B retrasada 1 s (así fallaba): B vuelve con A ('af'),
 *      sin quedarse en pausa dentro de la arena, con la copia de todos los enemigos vivos de A,
 *      y ninguno ve su propio nombre en el aviso «Pausa: … elige fusión».
 *  10. Tickets ganados ×2 (G.MODS.ticketsMult), en plena partida: A (anfitrión) suelta a sus
 *      pies un ticket y un ticket ×10 y los recoge; el contador de la partida sube 1 (es lo que
 *      viaja por la red) y cada uno apunta +2 en su partida guardada. Después, con
 *      ticketsMult = 1 sólo en B, otro ticket: A +2 y B +1.
 *  11. Gacha (A, a 844x390): un Pokémon que A tiene (su inicial), con una evolución que no
 *      tiene, sale repetido por la interfaz real (el azar sigue un guion sólo dentro de esa tirada):
 *      la carta dice «¡Repetido! Desbloqueas …» con su sprite, se apunta con from 'evo' y no da
 *      monedas; el cartel dice 1.5% de shiny y la nota nueva de los repetidos.
 *  12. Claridad en partida (js/entities/claridad.js), en el invitado: mientras golpea, un único
 *      número vivo por enemigo que suma sus golpes y los que anuncia el anfitrión; la barra de vida
 *      de cada copia que acaba de golpear se ve (la vida le llega por red) y una copia herida cuya
 *      vida no cambia (escudo permanente) no la lleva; y los disparos que A hace salir hacia B (con
 *      'es') se pintan en B con el contorno rojo, que se comprueba en el lienzo de verdad (#ff2440).
 *  13. Mapas propios (G.MODS.mapasPropios, js/world/mapas.js): al empezar la partida, A y B calculan G.Mapas.huella (códigos
 *      de casilla y objetos del escenario) de los mismos 50 chunks (10x5) alrededor de A, cada uno con su semilla, y salen
 *      iguales; y lo mismo en la arena de la grieta garantizada, alrededor de su centro y con la G.World.arena de cada uno.
 *      (Con mapasPropios = false en los dos, no se comparan.)
 *  14. Apariciones con vistas distintas (G.MODS.aparicionVistas, js/net/vistas.js), antes de la grieta: A a 1440x900 y B a
 *      844x390@3 (con CDP), así que B ve más mundo (1266x585 frente a 720x450). Juntos y quietos, con oleadas forzadas (12 s):
 *      ninguna copia nueva nace con los pies dentro de la vista de B. B corriendo 7 s con A lejos y unos Gastly detrás a su
 *      velocidad, dentro de su vista pero más lejos de lo que ve A: ningún rezagado sale de la vista de B ni vuelve dentro.
 *      No cuentan el duende del tesoro ni los esbirros que un invocador saca a su lado (salen a la vista a propósito).
 *      Y la bomba de B (G.MODS.bombaVistas): con A lejos, B coge una bomba (A se la suelta a los pies de su copia) y daña a
 *      los Gastly que A ha puesto a los lados de la vista de B (más allá del círculo de upstream) y no a los de arriba y
 *      abajo, fuera de ella (dentro de ese círculo).
 *      Cada fase, también de control con el ajuste apagado en A (upstream): ahí SÍ pasa. Al terminar, todo como estaba.
 *
 * CRITERIO del invitado. Cada subida de vida de una copia se clasifica según el tiempo
 * desde el último golpe que el propio invitado predijo en ella (lo mide la trampa):
 *   - 'dentro-ventana': menos de G.MODS.ventanaVidaMs (600 ms). Es el rebote que se veía
 *     antes; con el mod no puede pasar: debe haber 0.
 *   - 'resincronizacion': pasada la ventana. El anfitrión manda y su vida es la buena (el
 *     golpe no llegó a contar, p. ej. por un escudo): legítima.
 *   - 'sin-golpe': sin golpe predicho en esa copia. Sólo puede ser una curación real o un
 *     dato viejo: falla si dura más de 150 ms.
 * La duración va desde la subida hasta que la vida vuelve a estar a su nivel anterior (o
 * la copia desaparece). Las fases en las que el anfitrión cura a propósito (su control)
 * no cuentan para el invitado.
 *
 * Resultado en tools/nico/out/: informe.json, capturas, consolas y log del emulador.
 * Código de salida 0 = todo bien.
 */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), net = require('net'), crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { startServer } = require('./serve.js');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out'), SHOTS = path.join(OUT, 'capturas');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = +arg('--puerto', 8090);
const PAGE = process.argv.includes('--dev') ? 'dev.html' : 'index.html';
const BASE = `http://127.0.0.1:${PORT}/${PAGE}?emu`;
const BIG = +arg('--grande', 799), NORMAL = +arg('--normal', 25);
const HEADLESS = !process.argv.includes('--headed');
const REUSE = process.argv.includes('--reutilizar-emulador');
const LAT = +arg('--latencia', 150);          // ms por sentido en el canal del invitado durante su prueba
const VISIBLE_MS = 150;                       // una subida que dura más que esto se ve (un fotograma de red)
const EMU_PORTS = [9099, 8080, 9000];
const FORK_ISSUES = 'https://github.com/nicooliver123-cell/pokeswarm/issues';
const FORK_REPO = 'https://github.com/nicooliver123-cell/pokeswarm';

fs.rmSync(SHOTS, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const report = { inicio: new Date().toISOString(), url: BASE, grande: BIG, normal: NORMAL, latenciaInvitadoMs: LAT, pasos: [], comprobaciones: [], red: {} };
const save = () => fs.writeFileSync(path.join(OUT, 'informe.json'), JSON.stringify(report, null, 2));
function step(name, result) { report.pasos.push({ paso: name, resultado: result }); console.log(`[PASO] ${name} -> ${result}`); save(); }
function check(name, okv, detail) {
  report.comprobaciones.push({ comprobacion: name, ok: !!okv, detalle: detail });
  console.log(`[${okv ? 'OK' : 'FALLO'}] ${name}${detail !== undefined ? ' :: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
  save();
}
let shotN = 0;
async function shot(page, label, opts = {}) {
  const f = path.join(SHOTS, String(++shotN).padStart(2, '0') + '_' + label + '.png');
  await page.screenshot(Object.assign({ path: f }, opts));
  return path.relative(OUT, f);
}

// ---------------- emulador de Firebase ----------------
function findJdk() {
  if (process.env.PS_JDK) return process.env.PS_JDK;
  const base = path.join(os.homedir(), '.cache', 'temurin-21');
  const java = d => path.join(d, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  if (fs.existsSync(java(base))) return base;
  const sub = fs.existsSync(base) ? fs.readdirSync(base).map(n => path.join(base, n)).find(d => fs.existsSync(java(d))) : null;
  if (!sub) throw new Error('No encuentro el JDK 21 en ' + base + ' (o define PS_JDK). Ver tools/nico/README.md.');
  return sub;
}
const portOpen = port => new Promise(res => {
  const s = net.connect({ host: '127.0.0.1', port });
  s.once('connect', () => { s.destroy(); res(true); });
  s.once('error', () => res(false));
  s.setTimeout(800, () => { s.destroy(); res(false); });
});
async function startEmulator() {
  const open = await Promise.all(EMU_PORTS.map(portOpen));
  const busy = EMU_PORTS.filter((p, i) => open[i]);
  if (busy.length) {
    if (!REUSE) throw new Error(`Puertos del emulador ocupados: ${busy.join(', ')}. Cierra lo que los usa (¿otro emulador de Firebase en marcha?) ` +
      'o, si es un emulador del proyecto demo-ps que quieres aprovechar, repite con --reutilizar-emulador.');
    if (busy.length < EMU_PORTS.length) throw new Error(`--reutilizar-emulador necesita un emulador con los tres puertos (${EMU_PORTS.join(', ')}); ` +
      `sólo están ocupados ${busy.join(', ')}, así que es otra cosa. Ciérrala y repite.`);
    step('Emulador', 'se reutiliza el que ya estaba en marcha en 9099/8080/9000 (--reutilizar-emulador; no se cierra al terminar)');
    return null;
  }
  const jdk = findJdk();
  const env = Object.assign({}, process.env, { JAVA_HOME: jdk, PATH: path.join(jdk, 'bin') + path.delimiter + process.env.PATH });
  const cli = require.resolve('firebase-tools/lib/bin/firebase.js');
  const log = fs.createWriteStream(path.join(OUT, 'emulador.log'));
  // cwd = out/: los firebase-debug.log / firestore-debug.log / database-debug.log quedan ahí.
  const child = spawn(process.execPath, [cli, 'emulators:start', '--project', 'demo-ps', '--only', 'auth,firestore,database',
    '--config', path.join(ROOT, 'firebase.json')], { cwd: OUT, env, windowsHide: true });
  let text = '', exited = null;
  child.stdout.on('data', d => { text += d; log.write(d); });
  child.stderr.on('data', d => { text += d; log.write(d); });
  child.on('exit', c => { exited = c; });
  const t0 = Date.now();
  while (Date.now() - t0 < 180000) {
    if (exited !== null) throw new Error('El emulador se cerró (código ' + exited + '). Ver out/emulador.log');
    if (/All emulators ready/i.test(text) && (await Promise.all(EMU_PORTS.map(portOpen))).every(Boolean)) {
      step('Emulador', `arrancado en ${((Date.now() - t0) / 1000).toFixed(1)} s con el JDK de ${jdk}`);
      return child;
    }
    await sleep(500);
  }
  throw new Error('El emulador no arrancó en 3 minutos. Ver out/emulador.log');
}
function stopEmulator(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGINT');
  } catch (e) { /* ya cerrado */ }
}

// ---------------- jugadores ----------------
// Patrones de la infraestructura del proyecto base: ningún cliente debe tocarlos.
const SENAS = require('./base.js');   // las huellas de las señas del proyecto base
const PROD = [{ test: u => SENAS.nombra(u, ['dominio', 'firebase']).length > 0 }, /firebaseio\.com/i, /firebasedatabase\.app/i,
  /^https?:\/\/(firestore|identitytoolkit|securetoken|firebaseinstallations|firebase)\.googleapis\.com/i];
// Antes que el juego: guarda las RTCPeerConnection (para leer el par de candidatos elegido) y
// permite simular latencia en el canal directo (window.__lat ms por sentido, 0 = nada). La
// latencia retrasa lo que se manda y lo que llega sin desordenarlo. No cambia nada más del juego.
const INIT = `(() => {
  const O = window.RTCPeerConnection; if (!O) return; window.__pcs = [];
  window.RTCPeerConnection = function (...a) { const pc = new O(...a); window.__pcs.push(pc); return pc; };
  window.RTCPeerConnection.prototype = O.prototype; Object.setPrototypeOf(window.RTCPeerConnection, O);
  window.__lat = 0;
  const D = window.RTCDataChannel && RTCDataChannel.prototype; if (!D) return;
  const send = D.send, onm = Object.getOwnPropertyDescriptor(D, 'onmessage');
  const later = (ch, k, fn) => {
    const now = performance.now();
    if (!window.__lat && !(ch[k] > now)) return fn();
    const due = Math.max(now + window.__lat, ch[k] || 0); ch[k] = due;
    setTimeout(fn, due - now);
  };
  D.send = function (d) { const ch = this; return later(ch, '__dueOut', () => { if (ch.readyState === 'open' || !(ch.__dueOut > 0)) send.call(ch, d); }); };
  if (onm && onm.set) Object.defineProperty(D, 'onmessage', { configurable: true, enumerable: onm.enumerable,
    get() { return onm.get.call(this); },
    set(fn) { const ch = this; onm.set.call(this, typeof fn === 'function' ? function (ev) { later(ch, '__dueIn', () => fn.call(ch, ev)); } : fn); } });
})();`;

/** Vigilante del test de personalidad: apunta si #scr-test llega a verse (con sinTest, nunca debe). */
const VIGIA_TEST = `(() => {
  window.__testVisto = false;
  const mirar = () => { const t = document.getElementById('scr-test'); if (t && !t.classList.contains('hidden')) window.__testVisto = true; };
  document.addEventListener('DOMContentLoaded', () => new MutationObserver(mirar).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }));
})();`;

/** Trampa en el setter de la vida de los enemigos (G.Enemy.prototype.hp): ve CADA escritura.
 *  Sólo cuenta enemigos ya registrados (G.EnemyMgr.get(id) === e): lo que pasa al crearlos
 *  (shiny, élite, vida inicial de una copia) no es una subida. Se instala antes de la partida. */
const TRAP = `(() => {
  if (window.__hpTrap) return 'ya estaba';
  const K = Symbol('hp'), P = G.Enemy.prototype;
  const T = window.__hpTrap = { fase: 'menu', ventanaRef: +G.MODS.ventanaVidaMs || 600, subidas: [], abiertas: new Map(),
    golpeT: new WeakMap(), c: {}, enGolpe: null, enGolpeEscudo: false };
  const cnt = () => T.c[T.fase] || (T.c[T.fase] = { escrituras: 0, golpes: 0, golpesConEscudo: 0, predichas: 0, predichasConEscudo: 0 });
  const vigilado = e => G.EnemyMgr.get(e.id) === e && !e.dead;
  Object.defineProperty(P, 'hp', { configurable: true,
    get() { return this[K]; },
    set(v) {
      const old = this[K];
      this[K] = v;
      if (old === undefined || !vigilado(this)) return;
      const c = cnt(), now = performance.now();
      c.escrituras++;
      if (T.enGolpe === this) {                       // golpe predicho por el invitado (hurt de la copia)
        c.predichas++; if (T.enGolpeEscudo) c.predichasConEscudo++;
        T.enGolpe = null;
        T.golpeT.set(this, now);
      } else if (v > old + 1e-6) {
        const g = T.golpeT.get(this), ms = g === undefined ? null : now - g;
        const rec = { fase: T.fase, id: this.id, nombre: this.name, de: Math.round(old * 10) / 10, a: Math.round(v * 10) / 10,
          max: Math.round(this.maxHp), t: Math.round(now), msDesdeGolpe: ms === null ? null : Math.round(ms), dura: null,
          clase: !this.remote ? 'anfitrion' : ms === null ? 'sin-golpe' : ms < T.ventanaRef ? 'dentro-ventana' : 'resincronizacion' };
        T.subidas.push(rec);
        const prev = T.abiertas.get(this);
        if (prev) { prev.rec.dura = Math.round(now - prev.rec.t); prev.rec.cierre = 'otra subida'; }
        T.abiertas.set(this, { rec, base: old });
      }
      const ab = T.abiertas.get(this);
      if (ab && v <= ab.base + 1e-6) { ab.rec.dura = Math.round(now - ab.rec.t); T.abiertas.delete(this); }
    } });
  // G.Coop.hit va justo antes de restar en la copia la vida predicha (enemy.js, hurt).
  const hit = G.Coop.hit;
  G.Coop.hit = function (e, ...a) {
    const c = cnt(); c.golpes++;
    const esc = !!(e.net && (e.net.st & 4)); if (esc) c.golpesConEscudo++;
    T.enGolpe = e; T.enGolpeEscudo = esc;
    queueMicrotask(() => { if (T.enGolpe === e) T.enGolpe = null; });
    return hit.call(this, e, ...a);
  };
  T.timer = setInterval(() => {
    const now = performance.now();
    for (const [e, ab] of T.abiertas) if (!vigilado(e)) { ab.rec.dura = Math.round(now - ab.rec.t); ab.rec.cierre = 'desaparece'; T.abiertas.delete(e); }
  }, 50);
  T.cerrar = () => {
    const now = performance.now();
    for (const [, ab] of T.abiertas) { ab.rec.dura = Math.round(now - ab.rec.t); ab.rec.cierre = 'abierta al final'; }
    T.abiertas.clear(); clearInterval(T.timer);
  };
  return 'instalada';
})();`;

async function newPlayer(browser, tag) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block', locale: 'es-ES' });
  await ctx.addInitScript(INIT);
  await ctx.addInitScript(VIGIA_TEST);
  const page = await ctx.newPage();
  const P = { tag, ctx, page, requests: [], prodHits: [], failed: [], consoleLines: [], pageErrors: [] };
  page.on('request', r => { P.requests.push(r.url()); if (PROD.some(p => p.test(r.url()))) P.prodHits.push(r.url()); });
  page.on('websocket', ws => { P.requests.push(ws.url()); if (PROD.some(p => p.test(ws.url()))) P.prodHits.push('WS ' + ws.url()); });
  page.on('requestfailed', r => P.failed.push(r.url() + ' :: ' + ((r.failure() || {}).errorText || '')));
  page.on('console', m => P.consoleLines.push(`[${new Date().toISOString()}] ${m.type()}: ${m.text()}`));
  page.on('pageerror', e => { P.pageErrors.push(e.message); P.consoleLines.push(`[${new Date().toISOString()}] PAGEERROR: ${e.message}`); });
  return P;
}
const visible = (page, sel) => page.locator(sel).first().isVisible().catch(() => false);
const waitVisible = (page, sel, timeout = 20000) => page.locator(sel).first().waitFor({ state: 'visible', timeout });
const text = (page, sel) => page.locator(sel).first().innerText().catch(() => '');

async function boot(P) {
  const { page, tag } = P;
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('boot') && document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
  await sleep(300);
  if (await visible(page, '#tap-start')) await page.click('#tap-start');
  await waitVisible(page, '#scr-login');
  const m = await page.evaluate(() => ({ mode: G.DB.mode, emulator: !!(G.FIREBASE_CONFIG || {}).emulator, project: (G.FIREBASE_CONFIG || {}).projectId }));
  step(`${tag}: arranque`, `modo ${m.mode}, emulador=${m.emulator}, proyecto=${m.project}`);
  if (m.mode !== 'cloud' || !m.emulator || m.project !== 'demo-ps') throw new Error(tag + ': no está en modo nube contra el emulador (¿falta ?emu o el interruptor?)');
  step(`${tag}: trampa de vida`, await page.evaluate(TRAP));
}

/** Aviso legal: contacto y código del fork, sin correo ni donaciones. */
async function legalNotice(P) {
  const { page } = P;
  await page.click('#scr-login [data-legal]');
  await waitVisible(page, '#scr-legal');
  await sleep(900);   // que termine la transición, para la captura
  const r = await page.evaluate(([repo]) => {
    const m = document.getElementById('legal-mail'), rp = document.getElementById('legal-repo'), box = document.getElementById('scr-legal');
    return { contacto: m.href, textoContacto: m.textContent, abreAparte: m.target === '_blank', repo: rp.href,
      correo: /mailto:|@gmail\.com/i.test(box.innerHTML), donaciones: /donaci[oó]n/i.test(box.textContent),
      // Ningún enlace a otro repositorio que el nuestro (salvo los sprites de SpriteCollab), ni el nombre anterior.
      ajenos: [...box.querySelectorAll('a[href*="github.com/"]')].map(a => a.href).filter(h => !h.startsWith(repo) && !h.startsWith('https://github.com/PMDCollab/')),
      texto: box.textContent,   // el nombre anterior se busca fuera, con las huellas de tools/nico/base.js
      licencia: !!box.querySelector('a[href="https://creativecommons.org/licenses/by-nc/4.0/"]'),
      listaBlanca: [...(G.FIREBASE_PROYECTOS || [])], rechazaAjeno: G.FIREBASE_PERMITIDA({ projectId: 'proyecto-ajeno' }) === false };
  }, [FORK_REPO]);
  r.nombre = /PokéSwarm/.test(r.texto) && !SENAS.nombra(r.texto, ['nombre']).length;
  r.rechazaOriginal = r.rechazaAjeno && r.listaBlanca.length > 0 && !r.listaBlanca.some(p => SENAS.nombra(String(p), ['firebase']).length);
  delete r.texto;
  report.capturaAvisoLegal = await shot(page, P.tag + '_aviso_legal');
  await page.click('#legal-close');
  await waitVisible(page, '#scr-login');
  check('Aviso legal: contacto = avisos del repositorio, código = el repositorio, PokéSwarm sin el nombre anterior, ningún enlace a otro repositorio (salvo SpriteCollab), la licencia de los sprites enlazada, sin correo ni donaciones',
    r.contacto === FORK_ISSUES && r.abreAparte && r.repo === FORK_REPO && !r.correo && !r.donaciones && !r.ajenos.length && r.nombre && r.licencia, r);
  check('En la página, G.FIREBASE_PERMITIDA rechaza los proyectos fuera de la lista blanca, y el del proyecto base no está en ella', r.rechazaOriginal);
}

async function register(P, name, pass) {
  const { page, tag } = P;
  await page.click('#scr-login .tab[data-tab="register"]');
  await page.fill('#f-user', name);
  await page.fill('#f-pass', pass);
  await page.click('#btn-auth');
  await page.waitForFunction(() => {
    const v = id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
    return v('scr-starters') || v('scr-test') || v('scr-menu') || (document.getElementById('login-err').textContent || '').length > 0;
  }, null, { timeout: 20000 });
  const err = (await text(page, '#login-err')).trim();
  if (err) throw new Error(tag + ': crear cuenta: ' + err);
  step(`${tag}: cuenta de prueba`, 'creada en el emulador (uid ' + await page.evaluate(() => G.DB.fb && G.DB.fb.uid) + ')');
}

/** Cuenta nueva: «Elige a tu compañero» (sin el test de personalidad, G.MODS.sinTest), por la interfaz: la celda `n`
 *  y «Elegir a X». El test no sale en ningún momento (un vigilante en la página lo apunta desde el arranque); se guarda
 *  el inicial como compañero, la personalidad en null y el Pokémon en la colección, y llega así a Firestore. */
async function elegirCompanero(P, n) {
  const { page, tag } = P;
  await waitVisible(page, '#scr-starters');
  const antes = await page.evaluate(() => ({ clase: document.getElementById('scr-starters').classList.contains('sin-test'),
    celdas: document.querySelectorAll('#starter-grid .ec-celda').length, desactivado: document.getElementById('ec-ok').disabled }));
  const celda = page.locator('#starter-grid .ec-celda').nth(n);
  const dex = +(await celda.getAttribute('data-dex'));
  await celda.click();
  const boton = (await text(page, '#ec-ok')).trim();
  await page.click('#ec-ok');
  await waitVisible(page, '#scr-menu');
  // Como el test, guarda con commit() (sube en el siguiente envío o al salir de la página): aquí se fuerza el envío.
  // (El estado puede seguir en «pendiente»: al abrir el menú se apunta el logro «Primer compañero» y se vuelve a guardar.)
  await page.evaluate(() => G.DB.flush());
  const r = await page.evaluate(async () => {
    const s = G.DB.save, fb = G.DB.fb, snap = await fb.fs.collection('saves').doc(fb.uid).get({ source: 'server' }), nube = snap.data().save;
    return { starter: s.starter, partner: s.partner, personality: s.personality, origen: s.owned[s.partner] && s.owned[s.partner].from, sync: G.DB.syncState,
      nube: { starter: nube.starter, partner: nube.partner, personality: nube.personality, owned: !!nube.owned[s.partner] }, test: window.__testVisto === true };
  });
  check(`${tag}: cuenta nueva sin el test de personalidad: «Elige a tu compañero» con los 29 iniciales, «Elegir a X» y en la nube el inicial como compañero y la personalidad en null`,
    antes.clase && antes.celdas === 29 && antes.desactivado && boton === 'Elegir a ' + (await page.evaluate(d => G.DEX_BY[d].name, dex)) && !r.test &&
    r.starter === dex && r.partner === dex && r.personality === null && r.origen === 'starter' &&
    r.nube.starter === dex && r.nube.partner === dex && r.nube.personality === null && r.nube.owned, { antes, boton, dex, r });
  step(`${tag}: elige compañero`, `${boton} (#${dex}), menú principal`);
}

/** Pone de compañero un Pokémon concreto (como elegirlo en la colección). */
async function setPartner(P, dex) {
  const r = await P.page.evaluate(d => {
    G.DB.grant(d, 'gacha');
    G.DB.save.partner = d; G.DB.save.partnerShiny = false;
    G.DB.commit();
    return { dex: G.DB.save.partner, name: G.DEX_BY[d].name, escalaEsperada: G.MODS.escalaJugador(d) };
  }, dex);
  step(`${P.tag}: compañero`, `${r.name} (#${r.dex}), escala esperada ${r.escalaEsperada.toFixed(3)}`);
  return r;
}

async function openFriends(P) {
  const { page, tag } = P;
  await page.click('#scr-menu [data-go="friends"]');
  await page.waitForFunction(() => {
    const v = id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
    return v('scr-friends') || v('scr-nick');
  }, null, { timeout: 20000 });
  if (await visible(page, '#scr-nick')) {
    await page.fill('#nick-in', await page.evaluate(() => G.DB.user));
    await page.click('#nick-ok');
    await waitVisible(page, '#scr-friends');
  }
  await sleep(500);
  step(`${tag}: Amigos`, (await text(page, '#fr-me')).trim().replace(/\s+/g, ' '));
}
const friendRow = (page, name) => page.locator('#fr-list .fr-row', { hasText: name });

/** En partida: elige solo las cartas de nivel / vínculo / objeto para que nada se quede parado. */
const UNBLOCK = `window.__unblock = setInterval(() => {
  const open = id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
  try {
    if (open('scr-levelup')) { const c = document.querySelector('#cards:not(.done) > *'); if (c) c.click(); }
    if (open('scr-bond')) G.RunUI.pickBond(0);
    if (open('scr-item')) { const c = document.querySelector('#item-cards > *'); if (c) c.click(); }
  } catch (e) { /* nada */ }
}, 400);`;

async function sizes(P) {
  return P.page.evaluate(() => {
    const info = p => ({ dex: p.dex, nombre: p.mon.name, escala: +((p.scale === undefined ? 1 : p.scale)).toFixed(4),
      r: +p.r.toFixed(2), alto: +p.bodyH.toFixed(2), escalaSprite: +p.anim.scale.toFixed(4) });
    const exp = d => { const s = G.MODS.escalaJugador(d); return { escala: +s.toFixed(4), r: +G.Sprites.bodyRadius(d, s).toFixed(2),
      alto: +G.Sprites.bodyHeight(d, s).toFixed(2), rOriginal: +G.Sprites.bodyRadius(d, 1).toFixed(2), altoOriginal: +G.Sprites.bodyHeight(d, 1).toFixed(2) }; };
    return { local: info(G.Coop.local), companeros: G.Coop.mates.map(m => Object.assign({ uid: m.uid, nombreJugador: m.name }, info(m.pl))),
      esperado: { [G.Coop.local.dex]: exp(G.Coop.local.dex), ...Object.fromEntries(G.Coop.mates.map(m => [m.pl.dex, exp(m.pl.dex)])) } };
  });
}

/** Recorte de la pantalla alrededor de los dos jugadores (para ver el tamaño). */
async function shotPlayers(P, label) {
  const box = await P.page.evaluate(() => {
    const cam = G.Camera, ps = [G.Coop.local, ...G.Coop.mates.map(m => m.pl)];
    const xs = ps.map(p => (p.x - cam.left()) * cam.scale), ys = ps.map(p => (p.y - cam.top()) * cam.scale);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2 - 30;
    const w = Math.max(360, Math.max(...xs) - Math.min(...xs) + 260), h = 260;
    return { x: Math.max(0, cx - w / 2), y: Math.max(0, cy - h / 2), width: Math.min(w, innerWidth), height: h };
  });
  box.width = Math.min(box.width, 1280 - box.x); box.height = Math.min(box.height, 720 - box.y);
  return shot(P.page, label, { clip: box });
}

/** Transporte: modo de G.Net y par de candidatos elegido por WebRTC (getStats). */
async function transport(P, peer) {
  return P.page.evaluate(async u => {
    const pares = [];
    for (const pc of window.__pcs || []) {
      if (pc.connectionState !== 'connected') continue;
      const st = await pc.getStats();
      let pair = null;
      st.forEach(s => { if (s.type === 'transport' && s.selectedCandidatePairId) pair = st.get(s.selectedCandidatePairId); });
      if (!pair) st.forEach(s => { if (s.type === 'candidate-pair' && s.nominated && s.state === 'succeeded') pair = s; });
      if (!pair) continue;
      const l = st.get(pair.localCandidateId) || {}, r = st.get(pair.remoteCandidateId) || {};
      // Lo que lleva el canal de datos del juego ('g'): los contadores de bytes del par a veces
      // se quedan atrás en Chromium; los mensajes del canal no.
      let canal = null;
      st.forEach(s => { if (s.type === 'data-channel' && s.label === 'g') canal = { estado: s.state, mensajesEnviados: s.messagesSent, mensajesRecibidos: s.messagesReceived }; });
      pares.push({ estado: pair.state, local: l.candidateType, remoto: r.candidateType, protocolo: l.protocol,
        bytesEnviados: pair.bytesSent, bytesRecibidos: pair.bytesReceived, rttMs: pair.currentRoundTripTime != null ? Math.round(pair.currentRoundTripTime * 1000) : null, canal });
    }
    return { modo: G.Net.mode(u), viaTurn: G.Net.viaTurn(u), pares, rele: G.Net.stats.relaySent, enviados: G.Net.stats.sent };
  }, peer);
}
const directOk = t => t.modo === 'direct' && !t.viaTurn && t.pares.length > 0 &&
  t.pares.every(p => p.estado === 'succeeded' && p.local && p.remoto && p.local !== 'relay' && p.remoto !== 'relay' &&
    p.canal && p.canal.estado === 'open' && p.canal.mensajesEnviados > 0 && p.canal.mensajesRecibidos > 0);

/** Resumen de la trampa de vida de un cliente. */
async function trapSummary(P) {
  return P.page.evaluate(() => {
    const T = window.__hpTrap;
    T.cerrar();
    return { contadores: T.c, ventanaRefMs: T.ventanaRef, subidas: T.subidas };
  });
}

/**
 * Grieta garantizada en grupo (estaba desactivada en los dos para no interferir). Primero sólo B, el invitado,
 * la tiene activa y su reloj (que manda A) pasa de su hora sin grieta: no puede abrir ninguna. Después A la
 * activa con su reloj 0,3 s antes de su hora (G.Game.debugTime, ayuda de depuración: sólo aquí, en la
 * prueba) y tiene que abrirla al llegar a ella. B entra en la que recibe; el legendario sale con el 60 % de
 * la vida; al vencerlo, un vínculo cada uno.
 */
/**
 * Gacha (A, a 844x390): un repetido desbloquea su evolución. Se elige un Pokémon que A tiene, con una sola
 * evolución que no tiene, y sólo durante esa tirada (dentro de G.Gacha.pull) el azar sale de un guion para que
 * toque ése y no shiny: la interfaz, la tirada y el paquete son los reales. También mira el cartel (1,5 % y la nota).
 */
async function gachaRepetido(P) {
  const { page, tag } = P;
  await page.setViewportSize({ width: 844, height: 390 });
  await page.evaluate(() => { const s = G.DB.save; if (s.tickets.t1 < 1) { s.tickets.t1 = 1; G.DB.commit(); } });   // un ticket para la tirada
  await page.click('#scr-menu [data-go="gacha"]');
  await waitVisible(page, '#scr-gacha');
  const plan = await page.evaluate(() => {
    const s = G.DB.save, BANDA = [0, 45, 75, 92, 98.5, 100];
    const dex = Object.keys(s.owned).map(Number).sort((a, b) => a - b)
      .find(d => G.EVO[d] && G.EVO[d].length === 1 && !s.owned[G.EVO[d][0]] && G.DEX_BY[d] && G.DEX_BY[d].rarity < 5);
    if (!dex) return null;
    const p = G.DEX_BY[dex], lista = G.Gacha.pool(p.rarity, p.gen), i = lista.findIndex(x => x.dex === dex);
    const guion = [(BANDA[p.rarity - 1] + BANDA[p.rarity]) / 200, (i + 0.5) / lista.length];
    if (G.Sprites.hasShiny(dex)) guion.push(0.999);
    const pull = G.Gacha.pull;
    G.Gacha.pull = function () {
      const R = Math.random, q = guion.slice();
      Math.random = () => (q.length ? q.shift() : R());
      try { return pull.apply(this, arguments); } finally { Math.random = R; G.Gacha.pull = pull; }
    };
    const evo = G.EVO[dex][0];
    return { dex, nombre: p.name, gen: p.gen, evo, nombreEvo: G.DEX_BY[evo].name, coins: s.coins, t1: s.tickets.t1, t10: s.tickets.t10, ach: Object.keys(s.ach || {}) };
  });
  if (!plan) { check('Gacha: hay un Pokémon de A con una evolución que no tiene (para probar el repetido)', false, 'ninguno'); return; }
  await page.click(`#gacha-gens .gen-tab[data-gen="${plan.gen}"]`);
  const cartel = (await text(page, '#gacha-rates')).replace(/\s+/g, ' ');
  await page.click('#pull-1');
  await page.locator('#slot').click().catch(() => {});   // «Clic para acelerar»
  await waitVisible(page, '#pull-close', 20000);
  await sleep(500);
  report.capturaGachaRepetido = await shot(page, tag + '_gacha_repetido_844x390');
  const r = await page.evaluate(plan => {
    const cards = [...document.querySelectorAll('#pull-results .pcard')], c = cards[0], t = c && c.querySelector('.tag'), cv = t && t.querySelector('canvas');
    const caja = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const s = G.DB.save;
    // Lo que hayan dado los logros conseguidos con esta tirada (con el premio de G.MODS, como grant()).
    const lg = G.AchDefs.LIST.filter(a => s.ach[a.id] && !plan.ach.includes(a.id)).map(a => G.MODS.premio(a.reward) || {})
      .reduce((x, w) => ({ t1: x.t1 + (w.t1 || 0), t10: x.t10 + (w.t10 || 0), coins: x.coins + (w.coins || 0) }), { t1: 0, t10: 0, coins: 0 });
    return { cartas: cards.length, nombre: c && c.querySelector('b').textContent.trim(), tag: t && t.textContent.trim(), dorado: !!(t && t.querySelector('span.new')),
      sprite: cv ? { ancho: cv.width, alto: cv.height, caja: caja(cv) } : null, cartaVisible: c ? (b => b.top >= 0 && b.bottom <= innerHeight + 1)(c.getBoundingClientRect()) : false,
      owned: s.owned[plan.evo] || null, coins: s.coins - plan.coins - lg.coins, t1: s.tickets.t1 - plan.t1 - lg.t1, t10: s.tickets.t10 - plan.t10 - lg.t10, logros: lg };
  }, plan);
  check(`Gacha (844x390): ${plan.nombre} repetido (sin ${plan.nombreEvo}) desbloquea ${plan.nombreEvo}: la carta lo dice en dorado con su sprite pequeño (40x40), se apunta con from 'evo' y no da monedas`,
    r.cartas === 1 && r.nombre === plan.nombre && r.tag === `¡Repetido! Desbloqueas ${plan.nombreEvo}` && r.dorado && r.sprite && r.sprite.ancho === 40 && r.sprite.caja.w === 40 &&
    r.owned && r.owned.from === 'evo' && r.coins === 0 && r.t1 === -1 && r.t10 === 0, { plan: { dex: plan.dex, evo: plan.evo }, r });
  check('Gacha: el cartel de probabilidades dice 1.5% de shiny y la nota nueva de los repetidos',
    /Shiny\s*1\.5%/.test(cartel) && !/Shiny\s*1%/.test(cartel) && cartel.includes('Un repetido desbloquea su siguiente evolución') && !cartel.includes('Los repetidos dan Pokémonedas'),
    cartel.slice(cartel.indexOf('Shiny') - 2, cartel.indexOf('Shiny') + 260));
  await page.click('#pull-close');
  await page.click('#scr-gacha [data-back]');
  await waitVisible(page, '#scr-menu');
  await page.setViewportSize({ width: 1280, height: 720 });
}

/** Tickets ganados ×ticketsMult en grupo. Por si cae algún otro ticket o salta un logro durante la prueba, se
 *  compara cada partida guardada con SU contador de la partida y los logros nuevos (lo que daría grant()). */
async function ticketsCoop(A, B) {
  const leer = P => P.page.evaluate(() => {
    const s = G.DB.save, p = G.Game.player;
    return { pl: [p.t1, p.t10], sv: [s.tickets.t1, s.tickets.t10], ach: Object.keys(s.ach || {}), mult: G.MODS.multTickets() };
  });
  // Tickets que han dado los logros conseguidos desde `antes` (con el premio de G.MODS, como grant()).
  const deLogros = (P, antes) => P.page.evaluate(ids => G.AchDefs.LIST.filter(a => G.DB.save.ach[a.id] && !ids.includes(a.id))
    .map(a => G.MODS.premio(a.reward) || {}).reduce((x, r) => [x[0] + (r.t1 || 0), x[1] + (r.t10 || 0)], [0, 0]), antes.ach);
  const igualados = async () => {
    const a = await leer(A);
    await B.page.waitForFunction(tk => G.Game.player.t1 >= tk[0] && G.Game.player.t10 >= tk[1], a.pl, { timeout: 8000 });
  };
  /** A suelta `kinds` a sus pies; espera a recogerlos y a que B reciba el contador. Devuelve lo que cambió en cada uno. */
  async function ronda(kinds) {
    await igualados();
    const a0 = await leer(A), b0 = await leer(B);
    await A.page.evaluate(ks => { const p = G.Game.player; for (const k of ks) G.Pickups.drop(k, p.x, p.y, 1); }, kinds);
    const n1 = kinds.filter(k => k === 'ticket').length, n10 = kinds.length - n1;
    await A.page.waitForFunction(([t1, t10]) => G.Game.player.t1 >= t1 && G.Game.player.t10 >= t10, [a0.pl[0] + n1, a0.pl[1] + n10], { timeout: 8000 });
    await sleep(400);
    await igualados();
    await sleep(300);
    const a1 = await leer(A), b1 = await leer(B);
    const cambio = async (P, x0, x1) => {
      const lg = await deLogros(P, x0);
      return { mult: x1.mult, partida: [x1.pl[0] - x0.pl[0], x1.pl[1] - x0.pl[1]], guardada: [x1.sv[0] - x0.sv[0], x1.sv[1] - x0.sv[1]], logros: lg };
    };
    return { A: await cambio(A, a0, a1), B: await cambio(B, b0, b1) };
  }
  const cuadra = c => c.guardada[0] === c.partida[0] * c.mult + c.logros[0] && c.guardada[1] === c.partida[1] * c.mult + c.logros[1];
  const r1 = await ronda(['ticket', 'ticket10']);
  check('Tickets ×2: A (anfitrión) recoge un ticket y un ticket ×10; el contador de la partida (lo que viaja por la red) sube 1 por objeto, igual en A y B, y los dos apuntan el doble en su partida guardada',
    r1.A.mult === 2 && r1.B.mult === 2 && r1.A.partida[0] >= 1 && r1.A.partida[1] >= 1 && r1.B.partida[0] === r1.A.partida[0] && r1.B.partida[1] === r1.A.partida[1] &&
    cuadra(r1.A) && cuadra(r1.B), r1);
  await B.page.evaluate(() => { G.MODS.ticketsMult = 1; });
  const r2 = await ronda(['ticket']);
  await B.page.evaluate(() => { G.MODS.ticketsMult = 2; });
  check('Tickets: con ticketsMult = 1 sólo en B, otro ticket: A apunta +2 y B +1',
    r2.A.mult === 2 && r2.B.mult === 1 && r2.A.partida[0] >= 1 && r2.B.partida[0] === r2.A.partida[0] && cuadra(r2.A) && cuadra(r2.B), r2);
  report.tickets = { r1, r2 };
}

/** Mapas propios (G.MODS.mapasPropios, js/world/mapas.js): los dos clientes calculan G.Mapas.huella (los códigos de cada
 *  casilla y los objetos del escenario) de la misma zona de 10x5 chunks (50) alrededor del punto (x, y) de A, cada uno con
 *  su semilla y, en la arena, con su propia G.World.arena: con la misma versión tienen que salir iguales. */
async function huellasMapa(A, B, nombre, enArena) {
  const zona = await A.page.evaluate(arena => {
    const p = arena ? G.Rift.arena : G.Game.player, CW = G.World.CW;
    return { cx0: Math.floor(p.x / CW) - 5, cy0: Math.floor(p.y / CW) - 2, w: 10, h: 5, arena };
  }, enArena);
  const HUELLA = z => {
    const activo = !!(G.Mapas && G.Mapas.activo), a = z.arena ? G.World.arena : null, t0 = performance.now();
    const huella = activo ? G.Mapas.huella(G.World.semilla, z.cx0, z.cy0, z.w, z.h, a) : null;
    return { activo, semilla: G.World.semilla, arena: a && { tx: a.tx, ty: a.ty, r: a.r, type: a.type }, huella, ms: +(performance.now() - t0).toFixed(1) };
  };
  const hA = await A.page.evaluate(HUELLA, zona), hB = await B.page.evaluate(HUELLA, zona);
  (report.huellasMapa = report.huellasMapa || {})[nombre] = { zona, A: hA, B: hB };
  const n = zona.w * zona.h, iguales = hA.huella === hB.huella && hA.semilla === hB.semilla && JSON.stringify(hA.arena) === JSON.stringify(hB.arena);
  if (!hA.activo && !hB.activo) { check(`Mapas propios (${nombre}): desactivados en los dos clientes (G.MODS.mapasPropios = false): no se comparan huellas`, true, { A: hA, B: hB }); return; }
  check(`Mapas propios (${nombre}): A y B calculan la misma huella de ${n} chunks alrededor de ${enArena ? 'la arena' : 'A'} (G.Mapas.huella: códigos de casilla y objetos; semilla ${hA.semilla}${hA.arena ? `, arena ${hA.arena.type} en (${hA.arena.tx}, ${hA.arena.ty})` : ''}): ${hA.huella}`,
    hA.activo && hB.activo && iguales && new RegExp('^' + n + ':[0-9a-f]{16}:\\d+$').test(hA.huella || ''), { zona, A: hA, B: hB });
}

async function guaranteedRift(A, B) {
  const LIM = 120, TTL = 45;
  // Lo que ve cada cliente: las grietas que aparecen, las veces que G.MODS pide abrir una y, en el anfitrión,
  // el legendario al crearlo (antes de añadirlo a los enemigos), con el reloj y los jugadores de ese momento.
  const VIGIA = `(() => {
    const V = window.__grieta = { grietas: [], pide: 0, legendario: null };
    const vistas = new WeakSet(), gg = G.MODS.grietaGarantizada, add = G.EnemyMgr.add;
    // Que exista ya el estado de esta partida (su hora): sin grieta y sin mandar, no abre nada.
    const lim0 = G.MODS.grietaGarantizadaAntesDe;
    G.MODS.grietaGarantizadaAntesDe = 120; gg.call(G.MODS, G.Game.player, 0, false, false); G.MODS.grietaGarantizadaAntesDe = lim0;
    G.MODS.grietaGarantizada = function (...a) { const x = gg.apply(this, a); if (x) V.pide++; return x; };
    G.EnemyMgr.add = function (e) {
      if (e && e.legend && !V.legendario) V.legendario = { id: e.id, max: e.maxHp, hp: e.hp, shiny: !!e.shiny, t: G.Game.st.time, n: G.Game.everyone().length };
      return add.apply(this, arguments);
    };
    V.timer = setInterval(() => {
      const r = G.Rift.rift;
      if (r && !vistas.has(r)) { vistas.add(r); V.grietas.push({ x: r.x, y: r.y, t: Math.round(G.Game.st.time * 100) / 100 }); }
    }, 20);
    return 'vigilando';
  })()`;
  const leer = P => P.page.evaluate(() => { const V = window.__grieta; return { grietas: V.grietas, pide: V.pide, legendario: V.legendario, t: G.Game.st.time }; });
  for (const P of [A, B]) await P.page.evaluate(VIGIA);
  const hora = P => P.page.evaluate(() => G.MODS.grietaGarantizadaHora(G.Game.player));
  const horaA = await hora(A), horaB = await hora(B);
  // 1. Sólo B la tiene activa; A pone el reloj de los dos medio segundo después de la hora de B.
  await B.page.evaluate(lim => { G.MODS.grietaGarantizadaAntesDe = lim; }, LIM);
  await A.page.evaluate(h => G.Game.debugTime(h), horaB + 0.5);
  await B.page.waitForFunction(h => G.Game.st.time > h + 1, horaB, { timeout: 10000 });
  const soloB = await leer(B), soloA = await leer(A);
  check('Grieta garantizada: el invitado, pasada su hora y sin ninguna grieta, no abre ninguna por su cuenta',
    horaB >= LIM - 45 && horaB <= LIM - 10 && soloB.t > horaB && soloB.pide === 0 && !soloB.grietas.length && !soloA.grietas.length,
    { horaB, relojB: soloB.t, pideB: soloB.pide, grietasB: soloB.grietas.length });
  // 2. A pone su reloj 0,3 s antes de su hora (hacia delante o, si la de B era más tarde, hacia atrás) y,
  // en el mismo instante, la activa: tiene que abrirla al llegar a su hora, ni antes ni mucho después.
  const aEnHora = await A.page.evaluate(({ lim, h }) => {
    G.Game.debugTime(h - 0.3);
    G.MODS.grietaGarantizadaAntesDe = lim;
    return G.Game.st.time;
  }, { lim: LIM, h: horaA });
  await A.page.waitForFunction(() => !!G.Rift.rift, null, { timeout: 10000 });
  await B.page.waitForFunction(() => !!G.Rift.rift, null, { timeout: 10000 });
  await sleep(300);
  const ga = await leer(A), gb = await leer(B);
  const a0 = ga.grietas[0], b0 = gb.grietas[0];
  check('Grieta garantizada: A (anfitrión) la abre a su hora, antes de los 120 s, y B la recibe en las mismas x e y; B no abre ninguna',
    a0 && b0 && ga.grietas.length === 1 && gb.grietas.length === 1 && a0.t >= horaA - 0.01 && a0.t < horaA + 1 && a0.t < LIM &&
    b0.x === Math.round(a0.x) && b0.y === Math.round(a0.y) && ga.pide === 1 && gb.pide === 0,
    { horaA, relojAlActivar: aEnHora, abierta: a0, recibida: b0, pideA: ga.pide, pideB: gb.pide });
  report.capturasGrieta = [await shot(A.page, 'A_grieta_garantizada'), await shot(B.page, 'B_grieta_garantizada')];
  // 3. B entra (el invitado pide entrar y el anfitrión crea la arena para los dos). Antes, los enemigos del mapa
  // de A: los guarda durante la arena y los vuelve a anunciar al volver (tienen que llegar a B).
  const mapaAntes = await A.page.evaluate(() => G.EnemyMgr.all().filter(e => !e.dead && !e.remote).map(e => e.id));
  await B.page.evaluate(() => { const r = G.Rift.rift, p = G.Game.player; p.x = r.x; p.y = r.y - 10; });
  await Promise.all([A, B].map(P => P.page.waitForFunction(() => G.Rift.inArena, null, { timeout: 10000 })));
  await A.page.waitForFunction(() => !!window.__grieta.legendario, null, { timeout: 5000 });
  const leg = (await leer(A)).legendario;
  await B.page.waitForFunction(id => { const e = G.EnemyMgr.get(id); return !!e && e.maxHp > 0; }, leg.id, { timeout: 5000 });
  const enArena = P => P.page.evaluate(id => {
    const a = G.Rift.arena, p = G.Game.player, ts = G.Tiles.T * G.Sprites.PX, e = G.EnemyMgr.get(id);
    return { forzada: a.forzada, dentro: Math.hypot(p.x - a.x, p.y - a.y) < a.r * ts, copia: e ? e.maxHp : null };
  }, leg.id);
  const arA = await enArena(A), arB = await enArena(B);
  check('Grieta garantizada: entra B y los dos están en la arena, marcada como la de la grieta garantizada',
    arA.dentro && arB.dentro && arA.forzada === 1 && arB.forzada === 1, { A: arA, B: arB });
  await huellasMapa(A, B, 'arena de la grieta', true);
  const sinMod = Math.round((3200 + leg.t * 9) * (1 + 0.3 * Math.max(0, leg.n - 1)) * (leg.n > 1 ? 1.4 : 1));   // spawnLegend
  const esperada = Math.round(sinMod * 0.6) * (leg.shiny ? 2 : 1);
  check('Grieta garantizada: el legendario tiene el 60 % de la vida que tendría sin el mod (y B recibe la del anfitrión)',
    leg.n === 2 && leg.max === esperada && leg.hp === leg.max && arB.copia === leg.max,
    { reloj: Math.round(leg.t * 100) / 100, jugadores: leg.n, vida: leg.max, sinMod: sinMod * (leg.shiny ? 2 : 1), proporcion: +(leg.max / (sinMod * (leg.shiny ? 2 : 1))).toFixed(4), enB: arB.copia });
  await sleep(1300);   // que pase el destello del viaje a la arena
  report.capturasArena = [await shot(A.page, 'A_arena_garantizada'), await shot(B.page, 'B_arena_garantizada')];
  // La vuelta, vista en cada cliente: cuándo sale de la arena, si se queda en pausa dentro de ella (el invitado,
  // esperando a que el anfitrión elija su fusión), si se abre su diálogo de fusión y si el aviso «Pausa: … elige
  // fusión» llega a decir su propio nombre.
  const VUELTA = `(() => {
    const W = window.__vuelta = { volvio: null, pausaEnArena: 0, dialogo: false, avisosPropios: [] };
    const yo = G.Social.me && G.Social.me.name;
    W.timer = setInterval(() => {
      const enArena = G.Rift.inArena;
      if (!enArena && W.volvio === null) W.volvio = Date.now();
      if (enArena && G.Game.state === 'held') W.pausaEnArena++;
      if (G.UI.isOpen('scr-bond')) W.dialogo = true;
      const b = G.Spawner.banner(), m = b && /^Pausa: (.+) eligen? fusión…$/.exec(b.text);
      if (m && yo && m[1].split(', ').includes(yo) && !W.avisosPropios.includes(b.text)) W.avisosPropios.push(b.text);
    }, 10);
    return yo;
  })()`;
  const nombres = { A: await A.page.evaluate(VUELTA), B: await B.page.evaluate(VUELTA) };
  // 4. Lo vence el anfitrión (es quien decide); 'aw' llega al invitado.
  await A.page.evaluate(() => { const e = G.EnemyMgr.get(G.Rift.arena.bossId); e.shield = 0; e.hurt(e.hp + 10); });
  const vinculo = P => P.page.waitForFunction(() => G.Rift.arena && G.Rift.arena.phase === 'won', null, { timeout: 8000 })
    .then(() => P.page.evaluate(() => G.Game.player.bonds));
  const [bA, bB] = await Promise.all([vinculo(A), vinculo(B)]);   // a la vez: la fase 'won' dura 5 s
  const bonds = { A: bA, B: bB };
  check('Grieta garantizada: al vencer al legendario, los dos tienen un vínculo (bonds === 1)', bonds.A === 1 && bonds.B === 1, bonds);
  // La cuenta atrás de B (5 s desde que le llega 'aw') va por detrás de la de A: lo normal con latencia o con el envío
  // cada 1/15 s, pero aquí, con los dos en el mismo PC, a veces va por delante. Se retrasa 1 s (sólo en la prueba) para
  // que sea siempre el caso que fallaba: B volvía por su cuenta después de recibir los enemigos que A anunciaba al volver.
  const retrasoB = await B.page.evaluate(() => { const a = G.Rift.arena; if (!a || a.phase !== 'won') return null; a.endT += 1; return Math.round(a.endT * 100) / 100; });
  await Promise.all([A, B].map(P => P.page.waitForFunction(() => !G.Rift.inArena, null, { timeout: 15000 })));
  const fin = { A: await leer(A), B: await leer(B) };
  for (const P of [A, B]) await P.page.evaluate(() => clearInterval(window.__grieta.timer));
  check('Grieta garantizada: los dos vuelven al mapa y no se ha abierto ninguna otra', fin.A.grietas.length === 1 && fin.B.grietas.length === 1 && fin.B.pide === 0,
    { A: fin.A.grietas.length, B: fin.B.grietas.length });
  // 5. La vuelta real (no simulada). La marca el anfitrión ('af', antes de anunciar con 'ne' los enemigos que guardó):
  // B tiene que volver con A, no quedarse en pausa dentro de la arena, y quedarse con la copia de todos los enemigos
  // vivos de A. Las fusiones las elige solo el arnés (UNBLOCK); se espera a que los dos sigan jugando.
  await Promise.all([A, B].map(P => P.page.waitForFunction(() => !G.Rift.inArena && G.Game.state === 'playing' && !G.UI.isOpen('scr-bond'), null, { timeout: 15000 })));
  await sleep(1000);
  const vivosA = () => A.page.evaluate(() => G.EnemyMgr.all().filter(e => !e.dead && !e.remote).map(e => e.id));
  const vA0 = await vivosA();
  await sleep(700);
  const copiasB = new Set(await B.page.evaluate(() => G.EnemyMgr.all().filter(e => e.remote && !e.dead).map(e => e.id)));
  const vA1 = new Set(await vivosA());
  const vuelta = {};
  for (const P of [A, B]) vuelta[P.tag] = await P.page.evaluate(() => { const W = window.__vuelta; clearInterval(W.timer); return W; });
  const esperadas = vA0.filter(id => vA1.has(id)), faltan = esperadas.filter(id => !copiasB.has(id));
  const delMapa = mapaAntes.filter(id => vA1.has(id)), faltanMapa = delMapa.filter(id => !copiasB.has(id));
  // Copias de B que no están vivas en A en ninguna de las dos lecturas (informativo: puede ser uno nacido y caído entre ellas).
  const deMas = [...copiasB].filter(id => !vA1.has(id) && !vA0.includes(id));
  report.vueltaGrieta = { nombres, vuelta, retrasoB, mapaAntes: mapaAntes.length, delMapaVivos: delMapa.length, faltanDelMapa: faltanMapa.length,
    vivosEnA: esperadas.length, copiasEnB: copiasB.size, faltan: faltan.slice(0, 20), copiasDeMas: deMas.slice(0, 20) };
  report.capturasVuelta = [await shot(A.page, 'A_vuelta_grieta'), await shot(B.page, 'B_vuelta_grieta')];
  check('Vuelta de la grieta (real): B tiene la copia de todos los enemigos vivos de A, también de los del mapa que A guardó durante la arena',
    delMapa.length > 0 && esperadas.length > 0 && faltan.length === 0 && faltanMapa.length === 0,
    `del mapa antes de la arena ${mapaAntes.length}, siguen vivos en A ${delMapa.length} (sin copia en B: ${faltanMapa.length}); ` +
    `vivos en A ${esperadas.length}, sin copia en B ${faltan.length}; copias en B ${copiasB.size} (de enemigos que A no tiene en ninguna de las dos lecturas: ${deMas.length})`);
  const desfase = vuelta.A.volvio && vuelta.B.volvio ? vuelta.B.volvio - vuelta.A.volvio : null;
  check('Vuelta de la grieta: B vuelve con A (lo marca el anfitrión) y no se queda en pausa dentro de la arena; eligen la fusión a la vez',
    retrasoB !== null && desfase !== null && Math.abs(desfase) < 500 && vuelta.B.pausaEnArena === 0,
    { cuentaAtrasDeBconElRetraso: retrasoB, msBdespuesDeA: desfase, muestrasDeBenPausaEnLaArena: vuelta.B.pausaEnArena, dialogoA: vuelta.A.dialogo, dialogoB: vuelta.B.dialogo });
  check('Fusión: nadie ve su propio nombre en el aviso «Pausa: … elige fusión» (A y B abren su diálogo)',
    vuelta.A.dialogo && vuelta.B.dialogo && !vuelta.A.avisosPropios.length && !vuelta.B.avisosPropios.length,
    { nombres, dialogoA: vuelta.A.dialogo, dialogoB: vuelta.B.dialogo, propiosA: vuelta.A.avisosPropios, propiosB: vuelta.B.avisosPropios });
  report.grietaGarantizada = { horaA, horaB, abierta: a0, recibida: b0, legendario: leg, sinMod, esperada, bonds, ttl: TTL };
}

// ---------------- apariciones con vistas distintas (G.MODS.aparicionVistas, js/net/vistas.js) ----------------
// Recogedor del invitado: cada copia nueva ('ne') que nace con los pies dentro de su vista (G.Camera.sees con margen 0), cada
// copia que se quita sin caer estando a la vista, y cada salto de más de 200 px entre dos fotogramas seguidos del anfitrión
// (un rezagado que vuelve a salir por delante) que sale de su vista o cae en ella. No cuentan los que salen a la vista a
// propósito, como en upstream: el duende del tesoro (a 230-300 px de un jugador, con su anillo dorado) y los esbirros que un
// invocador saca a su lado (los apunta el anfitrión: H.invocados; se descuentan al evaluar, por su id).
const VISTAS_B = `(() => {
  const H = window.__vistas = { on: false, fase: '', f: {}, ej: [], ult: new Map(), n: 0, vistos: [] };
  H.c = () => (H.f[H.fase] = H.f[H.fase] || { nacen: 0, nacenVista: 0, saltos: 0, saltosDesde: 0, saltosHasta: 0, quitados: 0, quitadosVista: 0, fotos: 0 });
  const ej = (tipo, x, y, extra) => { if (H.ej.filter(e => e.fase === H.fase).length < 8) { const c = G.Camera; H.ej.push(Object.assign({ fase: H.fase, tipo, dx: Math.round(x - c.x), dy: Math.round(y - c.y), w: Math.round(c.w), h: Math.round(c.h) }, extra || {})); } };
  const ar = G.EnemyMgr.addRemote;
  G.EnemyMgr.addRemote = function (o) {
    const nuevo = !G.EnemyMgr.get(o.id), e = ar.apply(this, arguments);
    if (nuevo && H.on && o.beh !== 'thief') {
      const c = H.c(); c.nacen++;
      if (G.Camera.sees(o.x, o.y, 0)) { c.nacenVista++; H.vistos.push({ fase: H.fase, id: o.id }); ej('nace', o.x, o.y, { id: o.id, jefe: !!o.boss }); }
    }
    return e;
  };
  const rr = G.EnemyMgr.removeRemote;
  G.EnemyMgr.removeRemote = function (id, died) {
    const e = G.EnemyMgr.get(id);
    // (En las fases «quietos» quita el arnés: vaciar() del anfitrión. Sólo cuenta en las de los rezagados.)
    if (H.on && e && !died && e.behavior !== 'thief' && !/^quietos/.test(H.fase)) { const c = H.c(); c.quitados++; if (G.Camera.sees(e.x, e.y, 0)) { c.quitadosVista++; ej('quitado', e.x, e.y); } }
    return rr.apply(this, arguments);
  };
  G.Net.on((from, msg) => {
    if (!H.on || !msg || msg.k !== 'f' || !msg.e) return;
    const c = H.c(), cam = G.Camera, ahora = new Map();
    H.n++; c.fotos++;
    for (const a of msg.e) {
      const p = H.ult.get(a[0]);
      if (p && p.n === H.n - 1 && Math.hypot(a[1] - p.x, a[2] - p.y) > 200) {
        c.saltos++;
        const desde = cam.sees(p.x, p.y, 0), hasta = cam.sees(a[1], a[2], 0);
        if (desde) c.saltosDesde++;
        if (hasta) c.saltosHasta++;
        if (desde || hasta) ej('salto', a[1], a[2], { desde: [Math.round(p.x - cam.x), Math.round(p.y - cam.y)] });
      }
      ahora.set(a[0], { x: a[1], y: a[2], n: H.n });
    }
    H.ult = ahora;
  });
  return 'instalado';
})()`;
// Control del anfitrión: lo que crea dentro de su propia vista (upstream ya lo evitaba: tiene que seguir en 0), sin el duende ni
// los esbirros de un invocador, que apunta aparte (sus ids, para descontarlos en B). vaciar() quita los enemigos (sin caer, como
// un rezagado perdido) para que el tope de 64 no frene las apariciones.
const VISTAS_A = `(() => {
  const H = window.__vistasA = { on: false, fase: '', f: {}, invocados: [], invocando: false };
  H.c = () => (H.f[H.fase] = H.f[H.fase] || { nacen: 0, nacenVista: 0 });
  const su = G.Enemy.prototype.summon;
  G.Enemy.prototype.summon = function () { H.invocando = true; try { return su.apply(this, arguments); } finally { H.invocando = false; } };
  const add = G.EnemyMgr.add;
  G.EnemyMgr.add = function (e) {
    if (H.on && !e.remote) {
      if (H.invocando) H.invocados.push(e.id);
      else if (e.behavior !== 'thief') { const c = H.c(); c.nacen++; if (G.Camera.sees(e.x, e.y, 0)) c.nacenVista++; }
    }
    return add.apply(this, arguments);
  };
  H.vaciar = () => { const L = G.EnemyMgr.all(); for (let i = L.length - 1; i >= 0; i--) { const e = L[i]; if (e.boss || e.dead) continue; L.splice(i, 1); e.dead = true; G.Coop.enemyGone(e, false); } };
  return 'instalado';
})()`;

/**
 * El anfitrión decide dónde nacen los enemigos. A (anfitrión) juega en un PC a 1440x900 y B (invitado) en un móvil a 844x390@3:
 * con el píxel nítido B ve mucho más mundo que A (1266x585 frente a 720x450). Nada puede nacer, ni reaparecer como rezagado,
 * dentro de la vista de B.
 *   1. Juntos y quietos: A provoca oleadas (G.Spawner.burst: el anillo de aparición de siempre) además del goteo, 12 s.
 *   2. Rezagados: A se va lejos; A crea detrás de B, dentro de su vista pero más lejos de lo que A ve, unos Gastly que le siguen
 *      a su misma velocidad, y B corre en línea recta 7 s.
 *   3. La bomba de B (G.MODS.bombaVistas), con A lejos: daña a los de su pantalla, no al círculo de la vista de A.
 * Cada fase con G.MODS.aparicionVistas (la 3, con bombaVistas) y, de control, con el ajuste apagado en el anfitrión (como
 * upstream): ahí tiene que pasar.
 */
async function vistasCoop(A, B, uidB) {
  await A.page.setViewportSize({ width: 1440, height: 900 });
  const cdp = await B.ctx.newCDPSession(B.page);   // el dpr no se cambia con setViewportSize
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 3, mobile: false });
  await sleep(1200);
  const vista = P => P.page.evaluate(() => ({ w: Math.round(G.Camera.w), h: Math.round(G.Camera.h), dpr: devicePixelRatio, estilo: G.Estilo ? G.Estilo.actual : '' }));
  const vA = await vista(A), vB = await vista(B);
  check('Vistas distintas: B (móvil 844x390@3, con el píxel nítido) ve bastante más mundo que A (PC 1440x900)', vB.dpr === 3 && vB.w > vA.w * 1.4, { A: vA, B: vB });
  step('A: recogedor de apariciones', await A.page.evaluate(VISTAS_A));
  step('B: recogedor de apariciones', await B.page.evaluate(VISTAS_B));
  const fase = (P, f, on) => P.page.evaluate(([f, on]) => { const H = window.__vistas || window.__vistasA; H.fase = f; H.on = on; }, [f, on]);
  const ajuste = v => A.page.evaluate(v => { G.MODS.aparicionVistas = v; }, v);

  // 1. Juntos y quietos.
  for (const [nombre, conAjuste] of [['quietos', true], ['quietos-control', false]]) {
    await ajuste(conAjuste);
    const junto = await B.page.evaluate(() => {
      const a = G.Coop.mates[0].pl, p = G.Game.player;
      for (const [dx, dy] of [[90, 20], [-90, 20], [0, 70], [0, -70], [150, 0], [-150, 0]]) if (G.World.isFree(a.x + dx, a.y + dy, 14)) { p.x = a.x + dx; p.y = a.y + dy; return [dx, dy]; }
      p.x = a.x; p.y = a.y; return [0, 0];
    });
    await sleep(1500);
    await A.page.evaluate(() => { window.__vistasA.vaciar(); window.__oleadasT = setInterval(() => { if (G.EnemyMgr.count > 48) window.__vistasA.vaciar(); G.Spawner.burst(4); }, 400); });
    await fase(A, nombre, true); await fase(B, nombre, true);
    await sleep(12000);
    await fase(A, nombre, false); await fase(B, nombre, false);
    await A.page.evaluate(() => clearInterval(window.__oleadasT));
    step(`Apariciones ${nombre}`, `B junto a A (${junto.join(', ')}), ajuste ${conAjuste ? 'activado' : 'apagado'} en el anfitrión`);
  }

  // 2. Rezagados. B busca un pasillo horizontal libre (sólo en horizontal B ve más que A: 633 frente a 360 de media vista;
  // en vertical, 292 frente a 225, ambos por debajo del radio con el que A da por perdido de vista a un rezagado).
  for (const [nombre, conAjuste] of [['rezagados', true], ['rezagados-control', false]]) {
    await ajuste(conAjuste);
    await A.page.evaluate(() => window.__vistasA.vaciar());
    const ruta = await B.page.evaluate(() => {
      const p = G.Game.player, libre = (x, y, s) => { for (let i = 1; i <= 70; i++) if (!G.World.isFree(x + s * 20 * i, y, 16)) return i * 20; return 1400; };
      for (let r = 0; r <= 2400; r += 120) for (let k = 0; k < (r ? 12 : 1); k++) {
        const x = p.x + Math.cos(k * 0.5236) * r, y = p.y + Math.sin(k * 0.5236) * r;
        if (!G.World.isFree(x, y, 16)) continue;
        for (const s of [-1, 1]) if (libre(x, y, s) >= 1400 && libre(x, y, -s) >= 600) { p.x = x; p.y = y; return { tecla: s < 0 ? 'KeyA' : 'KeyD', s, spd: p.spd, x: Math.round(x), y: Math.round(y) }; }
      }
      return null;
    });
    if (!ruta) { check(`Apariciones ${nombre}: B encuentra un pasillo horizontal libre para correr`, false); continue; }
    await sleep(1200);   // la cámara de B llega a su sitio y A recibe su posición
    const escolta = await A.page.evaluate(({ s, spd, uidB }) => {
      const a = G.Game.player, b = G.Coop.mate(uidB).pl;
      a.x = b.x - s * 2600; a.y = b.y;                    // A, lejos (su vista no ve nada de lo de B)
      const def = { dex: 92, name: 'Gastly', hp: 1e6, spd, dmg: 0, xp: 0, behavior: 'chase' }, ids = [];
      for (let i = 0; i < 6; i++) { const e = G.EnemyMgr.add(new G.Enemy(def, b.x - s * (520 + i * 12), b.y + (i - 2.5) * 36, { hp: 1, spd: 1, dmg: 1 })); ids.push(e.id); }
      return ids;
    }, { s: ruta.s, spd: ruta.spd, uidB });
    await sleep(700);
    await fase(A, nombre, true); await fase(B, nombre, true);
    const x0 = await B.page.evaluate(() => G.Game.player.x);
    await B.page.keyboard.down(ruta.tecla); await sleep(7000); await B.page.keyboard.up(ruta.tecla);
    const x1 = await B.page.evaluate(() => G.Game.player.x);
    await fase(A, nombre, false); await fase(B, nombre, false);
    await A.page.evaluate(() => window.__vistasA.vaciar());
    step(`Apariciones ${nombre}`, `B corre con ${ruta.tecla} desde ${ruta.x},${ruta.y} (velocidad ${Math.round(ruta.spd)}): ${Math.round(Math.abs(x1 - x0))} px en 7 s; ` +
      `${escolta.length} Gastly detrás a su velocidad; ajuste ${conAjuste ? 'activado' : 'apagado'} en el anfitrión`);
  }

  const rB = await B.page.evaluate(() => ({ f: window.__vistas.f, ej: window.__vistas.ej, vistos: window.__vistas.vistos }));
  const { f: rA, invocados } = await A.page.evaluate(() => ({ f: window.__vistasA.f, invocados: window.__vistasA.invocados }));
  // Los esbirros de un invocador nacen a su lado a propósito: fuera de la cuenta (y apuntados aparte).
  const inv = new Set(invocados);
  for (const [f, c] of Object.entries(rB.f)) {
    const esb = rB.vistos.filter(v => v.fase === f && inv.has(v.id)).length;
    c.esbirrosVista = esb; c.nacenVista -= esb;
  }
  report.vistasCoop = { vistas: { A: vA, B: vB }, invitado: rB.f, anfitrion: rA, esbirros: invocados.length, ejemplos: rB.ej };
  const q = rB.f.quietos || {}, qc = rB.f['quietos-control'] || {}, z = rB.f.rezagados || {}, zc = rB.f['rezagados-control'] || {};
  const visto = x => (x.nacenVista || 0) + (x.saltosDesde || 0) + (x.saltosHasta || 0) + (x.quitadosVista || 0);
  check('Apariciones (A en un PC, B en un móvil): con el ajuste ningún enemigo nace dentro de la vista de B, y A sigue sin crear ninguno dentro de la suya (sin contar el duende del tesoro ni los esbirros que un invocador saca a su lado, que salen a la vista a propósito)',
    (q.nacen || 0) >= 60 && q.nacenVista === 0 && rA.quietos && rA.quietos.nacenVista === 0,
    { invitado: q, anfitrion: rA.quietos, ejemplos: rB.ej.filter(e => e.fase === 'quietos').slice(0, 5) });
  check('Apariciones, control: sin el ajuste en el anfitrión (como upstream) SÍ nacen enemigos dentro de la vista de B (la prueba lo detecta)',
    (qc.nacenVista || 0) > 0, { invitado: qc, ejemplos: rB.ej.filter(e => e.fase === 'quietos-control').slice(0, 5) });
  check('Rezagados (B corre, A lejos): con el ajuste ninguno desaparece de la vista de B ni vuelve a salir dentro de ella, y nada nace en ella (lo mismo: sin el duende ni los esbirros)',
    (z.fotos || 0) > 40 && visto(z) === 0, { invitado: z, ejemplos: rB.ej.filter(e => e.fase === 'rezagados').slice(0, 5) });
  check('Rezagados, control: sin el ajuste en el anfitrión SÍ saltan rezagados desde la vista de B o hasta ella (la prueba lo detecta)',
    (zc.saltosDesde || 0) + (zc.saltosHasta || 0) > 0, { invitado: zc, ejemplos: rB.ej.filter(e => e.fase === 'rezagados-control').slice(0, 5) });

  // 3. La bomba de B (G.MODS.bombaVistas). A, lejos, pone Gastly quietos a los lados de la vista de B (dentro de ella y fuera
  // del círculo con el que upstream mide la bomba de un compañero: el radio de la vista de A) y arriba y abajo (fuera de ella y
  // dentro de ese círculo), y suelta una bomba a los pies de la copia de B: la coge B, por el recorrido de siempre.
  const bombas = {};
  await A.page.evaluate(() => {
    const H = window.__bombaA = { fase: '', ids: new Map() }, hu = G.Enemy.prototype.hurt;
    G.Enemy.prototype.hurt = function (d, col, kx, ky, kb) { if (H.fase && col === '#ff7b3d' && kb === 160) H.ids.set(this.id, H.fase); return hu.apply(this, arguments); };
  });
  for (const [nombre, conAjuste] of [['bomba', true], ['bomba-control', false]]) {
    await A.page.evaluate(([v, uidB]) => { const a = G.Game.player, b = G.Coop.mate(uidB).pl; window.__bombaA.antes = G.MODS.bombaVistas; G.MODS.bombaVistas = v; window.__vistasA.vaciar(); a.x = b.x - 2600; a.y = b.y; }, [conAjuste, uidB]);
    await sleep(1000);   // la cámara de B, quieta en su sitio
    const vb = await B.page.evaluate(() => { const c = G.Camera, p = G.Game.player; return { x: c.x, y: c.y, w: c.w, h: c.h, px: p.x, py: p.y }; });
    const sitios = { derecha: [vb.x + vb.w / 2 - 50, vb.y], izquierda: [vb.x - vb.w / 2 + 50, vb.y], arriba: [vb.px, vb.y - vb.h / 2 - 70], abajo: [vb.px, vb.y + vb.h / 2 + 70], cerca: [vb.px + 120, vb.py] };
    const puestos = await A.page.evaluate(([sitios, uidB]) => {
      const b = G.Coop.mate(uidB).pl, R = G.Camera.outerRadius(), def = { dex: 92, name: 'Gastly', hp: 1e6, spd: 0, dmg: 0, xp: 0, behavior: 'chase' }, out = {};
      for (const [k, [x, y]] of Object.entries(sitios)) { const e = G.EnemyMgr.add(new G.Enemy(def, x, y, { hp: 1, spd: 1, dmg: 1 })); out[k] = { id: e.id, aB: Math.round(Math.hypot(x - b.x, y - b.y)), R: Math.round(R) }; }
      return { out, vista: G.Vistas && G.Vistas.vista(uidB) };
    }, [sitios, uidB]);
    await sleep(500);
    const enVistaB = await B.page.evaluate(ids => Object.fromEntries(Object.entries(ids).map(([k, id]) => { const e = G.EnemyMgr.get(id); return [k, e ? G.Camera.sees(e.x, e.y, 0) : null]; })),
      Object.fromEntries(Object.entries(puestos.out).map(([k, v]) => [k, v.id])));
    await A.page.evaluate(([f, uidB]) => { const b = G.Coop.mate(uidB).pl; window.__bombaA.fase = f; G.Pickups.drop('bomb', b.x, b.y, 0); }, [nombre, uidB]);
    await sleep(800);
    const dados = await A.page.evaluate(f => { const H = window.__bombaA; H.fase = ''; G.MODS.bombaVistas = H.antes; return [...H.ids].filter(([, g]) => g === f).map(([id]) => id); }, nombre);
    bombas[nombre] = { vistaDeB: puestos.vista, enVistaB, distanciaAB: puestos.out, danados: Object.fromEntries(Object.entries(puestos.out).map(([k, v]) => [k, dados.includes(v.id)])) };
    await A.page.evaluate(() => window.__vistasA.vaciar());
    step(`Bomba ${nombre}`, `B coge una bomba; ajuste ${conAjuste ? 'activado' : 'apagado'} en el anfitrión: ` + JSON.stringify(bombas[nombre].danados));
  }
  report.vistasCoop.bombas = bombas;
  const bo = bombas.bomba, bc = bombas['bomba-control'];
  const premisa = x => x && x.vistaDeB && x.enVistaB.derecha && x.enVistaB.izquierda && x.enVistaB.cerca && x.enVistaB.arriba === false && x.enVistaB.abajo === false &&
    ['derecha', 'izquierda'].every(k => x.distanciaAB[k].aB > x.distanciaAB[k].R) && ['arriba', 'abajo', 'cerca'].every(k => x.distanciaAB[k].aB < x.distanciaAB[k].R);
  check('Bomba de B (bombaVistas): daña a los enemigos de los lados de su pantalla, que B ve, y no a los de arriba y abajo, que no ve (con la vista que manda B)',
    premisa(bo) && bo.danados.derecha && bo.danados.izquierda && bo.danados.cerca && !bo.danados.arriba && !bo.danados.abajo, bo);
  check('Bomba de B, control: sin el ajuste (upstream, el círculo del radio de la vista de A) no llega a los de los lados y sí a los de arriba y abajo',
    premisa(bc) && !bc.danados.derecha && !bc.danados.izquierda && bc.danados.cerca && bc.danados.arriba && bc.danados.abajo, bc);

  // Como estaban: A junto a B, los dos a 1280x720, el ajuste activado.
  await ajuste(true);
  await A.page.evaluate(uidB => { const a = G.Game.player, b = G.Coop.mate(uidB).pl; a.x = b.x + 80; a.y = b.y; }, uidB);
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await cdp.detach().catch(() => {});
  await A.page.setViewportSize({ width: 1280, height: 720 });
  await B.page.setViewportSize({ width: 1280, height: 720 });
  await sleep(1000);
}

(async () => {
  let emu = null, srv = null, browser = null, A = null, B = null, code = 0;
  try {
    if (await portOpen(PORT)) throw new Error(`El puerto ${PORT} (la web de la prueba) está ocupado: ciérralo o usa --puerto <otro>.`);
    emu = await startEmulator();
    srv = await startServer(ROOT, PORT);
    step('Servidor', `${ROOT} en http://127.0.0.1:${PORT}/ (página ${PAGE})`);
    browser = await chromium.launch({ headless: HEADLESS });
    report.navegador = browser.version();
    A = await newPlayer(browser, 'A');
    B = await newPlayer(browser, 'B');
    // De uno en uno: así no se juntan cientos de peticiones de sprites a la vez.
    await boot(A); await boot(B);
    await legalNotice(A);
    const tag = crypto.randomBytes(3).toString('hex'), pw = () => crypto.randomBytes(12).toString('base64url');
    const cred = { A: { nombre: 'e2eA_' + tag, pass: pw() }, B: { nombre: 'e2eB_' + tag, pass: pw() } };  // sólo existen en el emulador
    await register(A, cred.A.nombre, cred.A.pass);
    await register(B, cred.B.nombre, cred.B.pass);
    await elegirCompanero(A, 1); await elegirCompanero(B, 26);   // Charmander y Quaxly (luego se cambian; el gacha usa a Charmander, que tiene una sola evolución)
    await gachaRepetido(A);    // Gacha: un repetido desbloquea su evolución (y el cartel con 1,5 % de shiny)
    const monA = await setPartner(A, BIG), monB = await setPartner(B, NORMAL);
    check('El Pokémon grande de la prueba es de los que se reducen', monA.escalaEsperada < 1, `${monA.name}: ${monA.escalaEsperada.toFixed(3)}`);
    check('El Pokémon normal de la prueba no se reduce', monB.escalaEsperada === 1, `${monB.name}: ${monB.escalaEsperada}`);
    await openFriends(A); await openFriends(B);

    // Amistad: A añade a B, B acepta.
    await A.page.fill('#fr-name', cred.B.nombre);
    await A.page.click('#fr-add button[type="submit"]');
    await A.page.waitForFunction(() => (document.getElementById('fr-msg').textContent || '').length > 0, null, { timeout: 15000 });
    step('A: añade a B', (await text(A.page, '#fr-msg')).trim());
    await friendRow(B.page, cred.A.nombre).locator('button', { hasText: 'Aceptar' }).waitFor({ timeout: 20000 });
    await friendRow(B.page, cred.A.nombre).locator('button', { hasText: 'Aceptar' }).click();
    await B.page.waitForFunction(() => (document.getElementById('fr-msg').textContent || '').length > 0, null, { timeout: 15000 });
    step('B: acepta', (await text(B.page, '#fr-msg')).trim());

    // A ve a B en línea (la presencia leída vale 1 min: si no sale, se reabre Amigos como haría un jugador).
    let inv = friendRow(A.page, cred.B.nombre).locator('button', { hasText: 'Invitar' });
    try { await inv.waitFor({ timeout: 15000 }); }
    catch (e) {
      step('A: Invitar aún no sale', 'se reabre Amigos tras 61 s (caché de presencia)');
      await sleep(61000);
      await A.page.click('#scr-friends [data-back]');
      await waitVisible(A.page, '#scr-menu');
      await A.page.click('#scr-menu [data-go="friends"]');
      await waitVisible(A.page, '#scr-friends');
      inv = friendRow(A.page, cred.B.nombre).locator('button', { hasText: 'Invitar' });
      await inv.waitFor({ timeout: 20000 });
    }
    await inv.click();
    await waitVisible(A.page, '#scr-lobby', 20000);
    await waitVisible(B.page, '#invite-pop', 20000);
    await B.page.click('#inv-yes');
    await waitVisible(B.page, '#scr-lobby', 20000);
    const t0 = Date.now();
    await A.page.waitForFunction(() => { const b = document.getElementById('lobby-start'); return b && !b.disabled && G.Social.room && G.Social.room.members.length >= 2; }, null, { timeout: 45000 });
    const lobby = await A.page.evaluate(() => G.Social.room.members.map(m => ({ nombre: m.name, dex: m.dex, modo: G.Net.mode(m.uid) })));
    step('Sala lista', `en ${Date.now() - t0} ms: ${JSON.stringify(lobby)}`);
    report.capturaSala = await shot(A.page, 'A_sala');

    // Partida
    const uidA = await A.page.evaluate(() => G.DB.fb.uid), uidB = await B.page.evaluate(() => G.DB.fb.uid);
    await A.page.click('#lobby-start');
    await Promise.all([A, B].map(P => P.page.waitForFunction(() => G.Coop.active && G.Game.state !== 'ui', null, { timeout: 25000 })));
    // Instrumentación de prueba: cartas automáticas y sin morir (la prueba no va de esquivar). La grieta
    // garantizada, desactivada hasta su fase, al final (si no, a partir de los 75 s podría abrirse en medio).
    for (const P of [A, B]) await P.page.evaluate(`${UNBLOCK}; G.Coop.local.hurt = function () {}; window.__hpTrap.fase = 'partida'; G.MODS.grietaGarantizadaAntesDe = 0;`);
    // Contadores de golpes del invitado: los que B manda ('h') y los que le llegan a A.
    await B.page.evaluate(() => {
      window.__hEnv = 0;
      const th = G.Net.toHost;
      G.Net.toHost = function (msg) { for (const ev of (msg && msg.ev) || []) if (ev[0] === 'h') window.__hEnv++; return th.call(this, msg); };
    });
    await A.page.evaluate(() => {
      window.__hRec = 0;
      G.Net.on((from, msg) => { if (msg && msg.k === 'f') for (const ev of msg.ev || []) if (ev[0] === 'h') window.__hRec++; });
    });
    const host = await A.page.evaluate(() => G.Coop.isHost);
    check('A es el anfitrión (quien decide la vida de los enemigos)', host === true, host);
    step('Partida en grupo', 'G.Coop.active en los dos clientes');
    await sleep(3500);   // que carguen los sprites y se coloquen
    const rele0 = { A: (await transport(A, uidB)).rele, B: (await transport(B, uidA)).rele };

    // Mapas propios: el mismo mundo en los dos clientes (la semilla la manda el anfitrión).
    await huellasMapa(A, B, 'mapa', false);

    // Tamaños, en cruz
    const sA = await sizes(A), sB = await sizes(B);
    report.tamanos = { A: sA, B: sB };
    const big = sA.esperado[BIG], mateA = sB.companeros.find(m => m.uid === uidA), mateB = sA.companeros.find(m => m.uid === uidB);
    const same = (x, y) => x && y && x.escala === y.escala && x.r === y.r && x.alto === y.alto && x.escalaSprite === y.escalaSprite;
    check('A (grande) se ve reducido en su propio cliente', sA.local.dex === BIG && sA.local.escala === big.escala && sA.local.escala < 1 &&
      sA.local.r === big.r && sA.local.r < big.rOriginal && sA.local.escalaSprite === sA.local.escala && sA.local.alto === big.alto,
      `${sA.local.nombre}: escala ${sA.local.escala}, hitbox ${sA.local.r} (original ${big.rOriginal}), alto ${sA.local.alto} (original ${big.altoOriginal})`);
    check('B ve al compañero grande reducido igual que A', mateA && mateA.dex === BIG && same(mateA, sA.local),
      mateA ? `en B: escala ${mateA.escala}, hitbox ${mateA.r}, alto ${mateA.alto}, sprite ${mateA.escalaSprite}` : 'B no tiene a A como compañero');
    check('B (normal) queda intacto en su cliente y en el de A', sB.local.escala === 1 && mateB && same(mateB, sB.local) && sB.local.r === sB.esperado[NORMAL].rOriginal,
      mateB ? `${sB.local.nombre}: escala ${sB.local.escala} / en A ${mateB.escala}, hitbox ${sB.local.r} / en A ${mateB.r}` : 'A no tiene a B como compañero');

    // Se ven y se mueven
    const pos = (P, u) => P.page.evaluate(u => { const m = G.Coop.mate(u); return m ? { x: Math.round(m.pl.x), y: Math.round(m.pl.y), conectado: m.connected } : null; }, u);
    const before = { AveB: await pos(A, uidB), BveA: await pos(B, uidA) };
    await Promise.all([
      (async () => { await A.page.keyboard.down('KeyD'); await sleep(1500); await A.page.keyboard.up('KeyD'); })(),
      (async () => { await B.page.keyboard.down('KeyS'); await sleep(1500); await B.page.keyboard.up('KeyS'); })()
    ]);
    await sleep(1500);
    const after = { AveB: await pos(A, uidB), BveA: await pos(B, uidA) };
    const moved = (a, b) => a && b && (a.x !== b.x || a.y !== b.y);
    check('A ve a B y lo ve moverse', moved(before.AveB, after.AveB), { antes: before.AveB, despues: after.AveB });
    check('B ve a A y lo ve moverse', moved(before.BveA, after.BveA), { antes: before.BveA, despues: after.BveA });
    // Se acercan para las capturas (A se queda un poco a la derecha de B, para verlos uno al lado del otro).
    await Promise.all([
      (async () => { await A.page.keyboard.down('KeyA'); await sleep(600); await A.page.keyboard.up('KeyA'); })(),
      (async () => { await B.page.keyboard.down('KeyW'); await sleep(1400); await B.page.keyboard.up('KeyW'); })()
    ]);
    await sleep(1200);
    report.capturas = [await shot(A.page, 'A_partida_juntos'), await shot(B.page, 'B_partida_juntos'),
      await shotPlayers(A, 'A_recorte_jugadores'), await shotPlayers(B, 'B_recorte_jugadores')];

    // Transporte (obligatorio)
    const trA = await transport(A, uidB), trB = await transport(B, uidA);
    report.transporte = { A: trA, B: trB };
    check('Transporte: A y B se hablan por el canal directo de WebRTC: par elegido conectado, sin TURN, y el canal del juego abierto con mensajes en los dos sentidos', directOk(trA) && directOk(trB),
      { A: { modo: trA.modo, pares: trA.pares }, B: { modo: trB.modo, pares: trB.pares } });

    // ---- Tickets ganados ×2, en los dos clientes ----
    await ticketsCoop(A, B);

    // ---- Vida en el ANFITRIÓN: curandera forzada, y control con la curación activada ----
    const healer = await A.page.evaluate(() => {
      const pl = G.Coop.local;
      const def = { dex: 113, name: 'Chansey', hp: 1e6, spd: 0, dmg: 1, xp: 0, behavior: 'healer', shotCd: 0.5, range: 9999 };
      const h = new G.Enemy(def, pl.x + 150, pl.y, { hp: 1, spd: 1, dmg: 1 });
      G.EnemyMgr.add(h);
      window.__healer = h;
      // Cada segundo se hiere a la curandera y a los de alrededor (sin matarlos), para que tengan vida que recuperar.
      window.__woundT = setInterval(() => {
        for (const e of G.EnemyMgr.queryCircle(h.x, h.y, 170)) if (!e.dead && e.hp > 2) e.hp = Math.max(1, e.hp * 0.6);
      }, 1000);
      window.__hpTrap.fase = 'mod';
      return { id: h.id, comportamiento: h.behavior, curacionEnemiga: G.MODS.curacionEnemiga };
    });
    step('Curandera forzada en el anfitrión', JSON.stringify(healer));
    await sleep(8000);
    // Control del anfitrión: el invitado verá curaciones reales, que no cuentan para él.
    await B.page.evaluate(() => { window.__hpTrap.fase = 'control-anfitrion'; });
    await A.page.evaluate(() => { G.MODS.curacionEnemiga = true; window.__hpTrap.fase = 'control'; });
    await sleep(5000);
    await A.page.evaluate(() => { G.MODS.curacionEnemiga = false; window.__hpTrap.fase = 'mod-otra-vez'; });
    await sleep(1500);
    await B.page.evaluate(() => { window.__hpTrap.fase = 'partida'; });
    await sleep(2500);
    const healerAlive = await A.page.evaluate(() => { clearInterval(window.__woundT); return !window.__healer.dead; });

    // ---- Vida en el INVITADO: latencia, golpes suyos y escudos forzados ----
    // Dos dianas de mucha vida al lado de B (una con escudo permanente) y escudos en la mitad de
    // los enemigos de su alrededor, desde el anfitrión, que es quien los decide.
    const dianas = await A.page.evaluate(() => {
      const b = G.Coop.mates[0].pl;
      const mk = (dex, dx) => { const e = new G.Enemy({ dex, hp: 1e6, spd: 0, dmg: 0, xp: 0, behavior: 'healer', shotCd: 99, range: 0 }, b.x + dx, b.y - 60, { hp: 1, spd: 1, dmg: 1 }); G.EnemyMgr.add(e); return e; };
      const libre = mk(143, -70), conEscudo = mk(242, 70);
      // Para la claridad: un enemigo normal, herido desde que nace y con escudo permanente (su vida no cambia).
      const quieta = new G.Enemy({ dex: 19, hp: 1e6, spd: 0, dmg: 0, xp: 0, behavior: 'ranged', shotCd: 99, range: 0 }, b.x, b.y - 150, { hp: 1, spd: 1, dmg: 1 });
      quieta.hp = quieta.maxHp * 0.5; quieta.shield = quieta.maxHp; quieta.shieldT = 8;
      G.EnemyMgr.add(quieta);
      window.__escudoT = setInterval(() => {
        conEscudo.shield = conEscudo.maxHp; conEscudo.shieldT = 8;
        quieta.shield = quieta.maxHp; quieta.shieldT = 8;
        for (const e of G.EnemyMgr.queryCircle(b.x, b.y, 420)) if (!e.dead && e !== libre && e.id % 2 === 0) { e.shield = Math.max(e.shield, e.maxHp * 0.35); e.shieldT = 8; }
      }, 300);
      window.__hpTrap.fase = 'invitado';
      return { libre: libre.id, conEscudo: conEscudo.id, quieta: quieta.id };
    });
    await sleep(800);   // que lleguen las copias y el bit de escudo
    // Claridad en el invitado, mientras golpea (js/entities/claridad.js): un único número vivo por enemigo (sus
    // golpes y los que anuncia el anfitrión, sumados) y la barra de cada copia que acaba de golpear (sin escudo:
    // con escudo la vida no cambia), visible; una copia herida cuya vida no cambia (la 'quieta'), sin barra.
    await B.page.evaluate(() => {
      const M = window.__claridad = { muestras: 0, maxPorClave: 0, golpesMax: 0, golpes: 0, barraTrasGolpe: 0, ocultas: 0 };
      M.timer = setInterval(() => {
        const vivos = G.Claridad.numeros.filter(n => !n.suelto), por = new Map();
        for (const n of vivos) por.set(n.clave, (por.get(n.clave) || 0) + 1);
        M.muestras++;
        M.maxPorClave = Math.max(M.maxPorClave, 0, ...por.values());
        M.golpesMax = Math.max(M.golpesMax, 0, ...vivos.map(n => n.golpes));
      }, 100);
      const pend = new Set(), hu = G.Enemy.prototype.hurt, br = G.Claridad.barra;
      M.hurt = hu; M.barra = br;
      G.Enemy.prototype.hurt = function () { if (this.remote && !this.dead && !(this.net && this.net.st & 4)) pend.add(this); return hu.apply(this, arguments); };
      G.Claridad.barra = function (e) {
        const v = br.call(this, e);
        if (pend.has(e)) { pend.delete(e); M.golpes++; if (v) M.barraTrasGolpe++; }
        if (!v) M.ocultas++;
        return v;
      };
    });
    // Golpes del invitado cada 400 ms por el camino de un ataque (hurt de la copia): a las dianas y a
    // los 6 enemigos más cercanos con vida. (Además ataca solo, como siempre.)
    await B.page.evaluate(({ d, lat }) => {
      window.__lat = lat;
      window.__golpesT = setInterval(() => {
        const me = G.Coop.local;
        const near = G.EnemyMgr.all().filter(e => e.remote && !e.dead && e.hp > 5 && e.id !== d.libre && e.id !== d.conEscudo)
          .sort((a, b) => G.U.dist2(a.x, a.y, me.x, me.y) - G.U.dist2(b.x, b.y, me.x, me.y)).slice(0, 6);
        for (const e of [G.EnemyMgr.get(d.libre), G.EnemyMgr.get(d.conEscudo), ...near]) if (e && !e.dead) e.hurt(3, '#fff');
      }, 400);
      window.__hpTrap.fase = 'B-mod';
    }, { d: dianas, lat: LAT });
    await sleep(8000);
    const claridadB = await B.page.evaluate(id => {
      const M = window.__claridad;
      clearInterval(M.timer); G.Enemy.prototype.hurt = M.hurt; G.Claridad.barra = M.barra;
      // La copia herida que no cambia (escudo permanente): en el proyecto base llevaría barra; aquí, no.
      const q = G.EnemyMgr.get(id);
      const quieta = q ? { herida: q.hp < q.maxHp, escudo: !!(q.net && q.net.st & 4), barra: G.Claridad.barra(q) } : null;
      return { muestras: M.muestras, maxPorClave: M.maxPorClave, golpesMax: M.golpesMax, golpes: M.golpes, barraTrasGolpe: M.barraTrasGolpe, ocultas: M.ocultas, quieta };
    }, dianas.quieta);
    report.claridadInvitado = claridadB;
    check('Claridad en el invitado: un único número vivo por enemigo, que suma sus golpes y los del anfitrión',
      claridadB.muestras >= 40 && claridadB.maxPorClave === 1 && claridadB.golpesMax >= 2, claridadB);
    check('Claridad en el invitado: la barra de vida se ve tras cada golpe suyo (la vida le llega por red) y una copia herida sin cambios no la lleva',
      claridadB.golpes >= 10 && claridadB.barraTrasGolpe === claridadB.golpes && claridadB.quieta && claridadB.quieta.herida && claridadB.quieta.escudo &&
      claridadB.quieta.barra === false, claridadB);
    // Control del invitado: su cliente como el proyecto base (curacionEnemiga=true sólo en B: no cambia
    // nada del anfitrión). Debe ver el rebote que la prueba tiene que saber detectar.
    await B.page.evaluate(() => { G.MODS.curacionEnemiga = true; window.__hpTrap.fase = 'B-original'; });
    await sleep(6000);
    await B.page.evaluate(() => { G.MODS.curacionEnemiga = false; clearInterval(window.__golpesT); window.__lat = 0; window.__hpTrap.fase = 'final'; });
    await sleep(2000);
    await A.page.evaluate(() => { clearInterval(window.__escudoT); });

    // ---- Disparos enemigos con contorno rojo, también en el invitado (le llegan con 'es') ----
    await B.page.evaluate(() => {
      const D = window.__disparos = { hostiles: 0, contorneados: 0, llamadas: 0, dibujos: 0, enLista: 0, pos: [], estado: G.Game.state };
      const sp = G.Projectiles.spawn, dh = G.Claridad.disparoHostil, dr = G.Projectiles.draw;
      D.sp = sp; D.dh = dh; D.dr = dr;
      G.Projectiles.spawn = function (o) {
        if (o && o.friendly === false) { D.hostiles++; const p = G.Game.player; D.pos.push([Math.round(o.x - p.x), Math.round(o.y - p.y)]); }
        return sp.apply(this, arguments);
      };
      G.Projectiles.draw = function () { D.dibujos++; D.enLista = Math.max(D.enLista, G.Projectiles.all().filter(p => !p.friendly).length); return dr.apply(this, arguments); };
      G.Claridad.disparoHostil = function () { D.llamadas++; const r = dh.apply(this, arguments); if (r) D.contorneados++; return r; };
    });
    const tiros = await A.page.evaluate(() => {
      const b = G.Coop.mates[0].pl;
      const cerca = G.EnemyMgr.all().filter(e => !e.dead && !e.boss).sort((x, y) => G.U.dist2(x.x, x.y, b.x, b.y) - G.U.dist2(y.x, y.y, b.x, b.y)).slice(0, 3);
      // A unos 180 de B: lejos, sus disparos se descartan fuera de cámara, y encima de B le dan en el mismo fotograma,
      // antes de pintarse.
      cerca.forEach((e, i) => { e.x = b.x + Math.cos(i * 2.1) * 180; e.y = b.y + Math.sin(i * 2.1) * 130; });
      for (const e of cerca) e.shoot(b.x - e.x, b.y - e.y, 0.5, 3, 0.2);   // su propio shoot(): lo anuncia con 'es'
      return cerca.length * 3;
    });
    await sleep(900);
    const disparosB = await B.page.evaluate(() => {
      const D = window.__disparos;
      G.Projectiles.spawn = D.sp; G.Claridad.disparoHostil = D.dh; G.Projectiles.draw = D.dr;
      // El sprite contorneado de verdad (lienzo del navegador): 1 píxel de arte más por lado y píxeles #ff2440.
      const cv = G.VFX.sprite('fire', 'fire', 0), c = G.Claridad.conContorno(cv);
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let rojos = 0; for (let i = 0; i < d.length; i += 4) if (d[i] === 0xff && d[i + 1] === 0x24 && d[i + 2] === 0x40 && d[i + 3] === 255) rojos++;
      return { hostiles: D.hostiles, contorneados: D.contorneados, sprite: [cv.width, cv.height], contorno: [c.width, c.height], pixelesRojos: rojos,
        llamadas: D.llamadas, dibujos: D.dibujos, enLista: D.enLista, posRespectoB: D.pos.slice(0, 9), estado: D.estado, estadoAhora: G.Game.state };
    });
    report.disparosInvitado = Object.assign({ disparadosPorA: tiros }, disparosB);
    check('Disparos enemigos: en el invitado (llegan del anfitrión con \'es\') se pintan con su contorno rojo #ff2440 de 1 píxel de arte',
      tiros > 0 && disparosB.hostiles >= tiros && disparosB.contorneados > 0 && disparosB.contorno[0] === disparosB.sprite[0] + 2 && disparosB.contorno[1] === disparosB.sprite[1] + 2 &&
      disparosB.pixelesRojos > 0, report.disparosInvitado);

    // ---- HUD Dex en el invitado (B en Dex y A en Clásico: el estilo es de cada uno y no viaja por la red) ----
    // B pinta su HUD en un lienzo aparte con G.HUD.draw (el de verdad, con el gancho) y se apunta lo que escribe y rellena.
    const HUD_B = () => B.page.evaluate(() => {
      const cv = document.createElement('canvas'); cv.width = innerWidth; cv.height = innerHeight;
      const ctx = cv.getContext('2d'), rec = { textos: [], rellenos: [] };
      const ft = ctx.fillText.bind(ctx), fr = ctx.fillRect.bind(ctx);
      ctx.fillText = (t, x, y) => { rec.textos.push(String(t)); return ft(t, x, y); };
      ctx.fillRect = (x, y, w, h) => { rec.rellenos.push({ x, y, w, h, c: String(ctx.fillStyle).toLowerCase() }); return fr(x, y, w, h); };
      G.HUD.draw(ctx, innerWidth, innerHeight, G.Game.player, G.Game.st);
      const Bd = G.HudDex.bandas(), fila = Bd.piezas.companeros[0], ps = ['#58d873', '#ffcb3d', '#f2493b', '#ff8a80'];
      const barra = !!fila && rec.rellenos.some(r => ps.includes(r.c) && r.y >= fila.y - 1 && r.y + r.h <= fila.y + fila.h + 1 && r.x > fila.x && r.w > 2);
      return { estilo: G.Estilo.actual, textos: rec.textos, barra, flechas: Bd.flechas.map(f => f.tipo), variante: Bd.variante, nombreA: G.Coop.mates[0].name };
    });
    const estilos = { A: await A.page.evaluate(() => { G.Estilo.set('clasico'); return G.Estilo.actual; }), B: await B.page.evaluate(() => { G.Estilo.set('dex'); return G.Estilo.actual; }) };
    await sleep(300);
    const h1 = await HUD_B();
    check('HUD Dex en el invitado: B (en Dex; A sigue en Clásico) pinta la barra de vida de A en su panel de compañeros, con su nombre',
      estilos.A === 'clasico' && h1.estilo === 'dex' && h1.barra && h1.textos.includes(h1.nombreA), { estilos, variante: h1.variante, barra: h1.barra, nombreA: h1.nombreA, textos: h1.textos.slice(0, 30) });
    // A se pone a 1.100 px a la derecha de B (de la copia de B que tiene A): si sólo sumara 1.100 a su x, la distancia
    // dependería de dónde haya quedado B en la partida (con B 200 px a su derecha salían 28 m).
    const antesFlecha = await A.page.evaluate(() => {
      const p = G.Game.player, b = G.Coop.puppets()[0], antes = { x: p.x, y: p.y };
      if (b) { p.x = b.x + 1100; p.y = b.y; } else p.x += 1100;
      return antes;
    });
    await sleep(700);
    const h2 = await HUD_B();
    const etiqueta = h2.textos.find(x => x.startsWith(h2.nombreA + ' · ') && / \d+ m$/.test(x));
    check('HUD Dex en el invitado: con A a más de 1.000 px, B pinta la flecha «A · N m» hacia él', !!etiqueta && +/(\d+) m$/.exec(etiqueta)[1] >= 30 && h2.flechas.includes('companero'),
      { etiqueta, flechas: h2.flechas });
    await A.page.evaluate(() => { G.Game.player.dead = true; });
    await sleep(700);
    const h3 = await HUD_B();
    await A.page.evaluate(a => { const p = G.Game.player; p.dead = false; p.hp = p.maxHp; p.x = a.x; p.y = a.y; }, antesFlecha);
    check('HUD Dex en el invitado: con A caído, B pinta «Caído» en su panel y la flecha «¡A necesita ayuda! · N m»',
      h3.textos.includes('Caído') && h3.textos.some(x => x.startsWith('¡' + h3.nombreA + ' necesita ayuda! · ')) && h3.flechas.includes('caido'),
      { textos: h3.textos.filter(x => /Caído|ayuda/.test(x)), flechas: h3.flechas });
    await sleep(500);

    // ---- Vuelta de la grieta: el invitado borra sus copias y el anfitrión las anuncia de nuevo ----
    await B.page.evaluate(() => {
      window.__hpTrap.fase = 'grieta';
      window.__ne = [];
      const ar = G.EnemyMgr.addRemote;
      G.EnemyMgr.addRemote = function (o) { const had = G.EnemyMgr.get(o.id); const e = ar.call(this, o); if (!had) window.__ne.push({ id: o.id, max: o.hp, vida: o.vida, nace: e.hp }); return e; };
      G.EnemyMgr.clearRemote();                       // como rift.js en el invitado
    });
    const grietaA = await A.page.evaluate(() => {
      const heridos = {}; let n = 0;
      for (const e of G.EnemyMgr.all()) {
        if (e.dead) continue;
        if (e.hp < e.maxHp - 1) heridos[e.id] = Math.ceil(e.hp);
        G.Coop.enemyAdded(e); n++;                    // lo mismo que hace restore() -> add() al volver
      }
      window.__hpTrap.fase = 'grieta';
      return { anunciados: n, heridos };
    });
    await sleep(1200);
    const grietaB = await B.page.evaluate(() => {
      const compat = G.EnemyMgr.addRemote({ id: 987654321, dex: 25, x: 0, y: 0, boss: false, shiny: false, hp: 50, dmg: 1, beh: 'remote' });
      const sinDato = compat.hp; G.EnemyMgr.removeRemote(987654321, false);
      return { recreadas: window.__ne, sinDato };
    });
    const heridosIds = Object.keys(grietaA.heridos).map(Number);
    const nace = new Map(grietaB.recreadas.map(r => [r.id, r]));
    const bien = heridosIds.filter(id => nace.has(id) && nace.get(id).nace === grietaA.heridos[id]);
    report.grieta = { anfitrion: grietaA, invitado: grietaB.recreadas.length, bien: bien.length };
    check("Vuelta de la grieta: las copias heridas nacen en el invitado con la vida real ('ne'), no con la máxima",
      heridosIds.length > 0 && bien.length === heridosIds.length,
      `${grietaA.anunciados} anunciadas, ${grietaB.recreadas.length} recreadas en B; heridas ${heridosIds.length}, con su vida ${bien.length}` +
      (bien.length < heridosIds.length ? '; mal: ' + JSON.stringify(heridosIds.filter(id => !bien.includes(id)).slice(0, 5).map(id => ({ id, anfitrion: grietaA.heridos[id], invitado: nace.get(id) || null }))) : ''));
    check("Compatibilidad: un 'ne' sin la vida real crea la copia con la máxima, como antes", grietaB.sinDato === 50, grietaB.sinDato);

    // ---- Resultados de las trampas ----
    const hA = await trapSummary(A), hB = await trapSummary(B);
    report.vidaAnfitrion = { contadores: hA.contadores, subidas: hA.subidas.slice(0, 50), totalSubidas: hA.subidas.length };
    const upsA = hA.subidas.filter(s => s.fase !== 'control');
    const ctlA = hA.subidas.filter(s => s.fase === 'control');
    const escA = Object.values(hA.contadores).reduce((a, c) => a + c.escrituras, 0);
    check('Anfitrión: ninguna subida de vida de enemigos con el mod (trampa en el setter, toda la partida)', upsA.length === 0,
      `${escA} escrituras de vida vigiladas; subidas fuera del control: ${upsA.length}${upsA.length ? ' p. ej. ' + JSON.stringify(upsA.slice(0, 3)) : ''}`);
    check('Control del anfitrión: con curacionEnemiga=true la misma curandera SÍ cura (la prueba lo detecta)', ctlA.length > 0 && healerAlive,
      `${ctlA.length} subidas en 5 s; p. ej. ${JSON.stringify(ctlA[0] || null)}`);

    const VALEN = ['partida', 'invitado', 'B-mod', 'final', 'grieta'];       // fases en las que cuenta el criterio del invitado
    const ups = hB.subidas.filter(s => VALEN.includes(s.fase));
    const byClass = k => ups.filter(s => s.clase === k);
    const visibles = ups.filter(s => s.clase !== 'resincronizacion' && (s.dura === null || s.dura > VISIBLE_MS));
    const dentro = byClass('dentro-ventana');
    const cB = hB.contadores, cMod = cB['B-mod'] || {}, cOrig = cB['B-original'] || {};
    report.vidaInvitado = { criterio: `fallo = subida 'dentro-ventana' o subida de más de ${VISIBLE_MS} ms que no sea 'resincronizacion'`,
      ventanaRefMs: hB.ventanaRefMs, contadores: cB, totalSubidas: hB.subidas.length,
      porFase: Object.fromEntries([...new Set(hB.subidas.map(s => s.fase))].map(f => [f, hB.subidas.filter(s => s.fase === f).length])),
      visibles: visibles.slice(0, 20), resincronizaciones: byClass('resincronizacion').slice(0, 10),
      control: hB.subidas.filter(s => s.fase === 'B-original').slice(0, 20) };
    const maxDur = ups.filter(s => s.clase !== 'resincronizacion').reduce((m, s) => Math.max(m, s.dura || 0), 0);
    check(`Invitado: ninguna subida de vida de enemigos de más de ${VISIBLE_MS} ms fuera de la resincronización tras la ventana (latencia ${LAT} ms por sentido, golpes y escudos)`,
      visibles.length === 0 && dentro.length === 0,
      `${ups.length} subidas en las fases que cuentan: dentro de la ventana ${dentro.length}, sin golpe ${byClass('sin-golpe').length} (la más larga ${maxDur} ms), ` +
      `resincronización legítima ${byClass('resincronizacion').length}; visibles ${visibles.length}${visibles.length ? ' p. ej. ' + JSON.stringify(visibles.slice(0, 3)) : ''}`);
    check('Invitado: la prueba ejercita la predicción (golpes suyos en copias, con y sin escudo)',
      (cMod.golpes || 0) >= 50 && (cMod.predichas || 0) >= 15 && (cMod.golpesConEscudo || 0) >= 10,
      { golpes: cMod.golpes, predichas: cMod.predichas, golpesConEscudo: cMod.golpesConEscudo });
    check('Invitado: con escudo activo no predice el golpe', (cMod.golpesConEscudo || 0) > 0 && (cMod.predichasConEscudo || 0) === 0,
      { golpesConEscudo: cMod.golpesConEscudo, predichasConEscudo: cMod.predichasConEscudo });
    const ctlB = hB.subidas.filter(s => s.fase === 'B-original' && s.clase === 'dentro-ventana' && s.dura > VISIBLE_MS);
    check(`Control del invitado: sin el mod SÍ se ven rebotes de más de ${VISIBLE_MS} ms y predice con escudo (la prueba lo detecta)`,
      ctlB.length > 0 && (cOrig.predichasConEscudo || 0) > 0,
      `${ctlB.length} rebotes visibles en 6 s (p. ej. ${JSON.stringify(ctlB[0] || null)}); predichas con escudo ${cOrig.predichasConEscudo || 0}`);

    // Ningún golpe del invitado se pierde por el camino (tampoco con la latencia simulada).
    const env1 = await B.page.evaluate(() => window.__hEnv);
    await sleep(600);
    const rec = await A.page.evaluate(() => window.__hRec), env2 = await B.page.evaluate(() => window.__hEnv);
    check('Todos los golpes que manda el invitado le llegan al anfitrión', env1 > 0 && rec >= env1 && rec <= env2,
      { enviadosAntes: env1, recibidos: rec, enviadosDespues: env2 });

    // ---- Apariciones con vistas distintas: A en un PC y B en un móvil (G.MODS.aparicionVistas) ----
    await vistasCoop(A, B, uidB);

    // ---- Grieta garantizada, al final (hasta aquí, desactivada) ----
    await guaranteedRift(A, B);

    // Relé: nada por la base de datos durante la partida.
    const rele1 = { A: (await transport(A, uidB)).rele, B: (await transport(B, uidA)).rele };
    check('Transporte: durante la partida no se manda nada por el relé de la Realtime Database', rele1.A === rele0.A && rele1.B === rele0.B,
      { A: rele1.A - rele0.A, B: rele1.B - rele0.B });

    const st = { A: await A.page.evaluate(() => G.Game.state), B: await B.page.evaluate(() => G.Game.state) };
    check('La partida sigue viva en los dos clientes al terminar', st.A !== 'ui' && st.B !== 'ui' && st.A !== 'over' && st.B !== 'over', st);
    report.capturasFinal = [await shot(A.page, 'A_final'), await shot(B.page, 'B_final')];
  } catch (e) {
    code = 1;
    report.error = String(e && e.stack || e);
    console.error('[ERROR]', e && e.message || e);
    try { if (A) await shot(A.page, 'A_error'); if (B) await shot(B.page, 'B_error'); } catch (e2) { /* nada */ }
  } finally {
    for (const P of [A, B].filter(Boolean)) {
      fs.writeFileSync(path.join(OUT, `consola-${P.tag}.log`), P.consoleLines.join('\n'));
      const hosts = {};
      for (const u of P.requests) { try { const h = new URL(u).host; hosts[h] = (hosts[h] || 0) + 1; } catch (e) { /* data: */ } }
      report.red[P.tag] = { hosts, infraOriginal: P.prodHits, fallidas: P.failed.slice(0, 20), erroresDePagina: P.pageErrors };
    }
    if (A && B) {
      check('Ningún cliente habla con la infraestructura del proyecto base', !A.prodHits.length && !B.prodHits.length, { A: A.prodHits, B: B.prodHits });
      const ext = Object.keys(Object.assign({}, report.red.A.hosts, report.red.B.hosts)).filter(h => !/^127\.0\.0\.1(:\d+)?$/.test(h) && h !== 'www.gstatic.com');
      check('Sólo hosts locales y el SDK de Firebase (www.gstatic.com)', ext.length === 0, ext.length ? ext : Object.keys(Object.assign({}, report.red.A.hosts, report.red.B.hosts)));
      check('Sin errores de JavaScript en las páginas', !A.pageErrors.length && !B.pageErrors.length, { A: A.pageErrors, B: B.pageErrors });
    }
    if (report.comprobaciones.some(c => !c.ok)) code = 1;
    report.fin = new Date().toISOString();
    report.resultado = code ? 'FALLO' : 'OK';
    save();
    if (A) await A.ctx.close().catch(() => {});
    if (B) await B.ctx.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (srv) srv.close();
    stopEmulator(emu);
    console.log(`\nRESULTADO: ${report.resultado} · informe en ${path.join(OUT, 'informe.json')}`);
    process.exit(code);
  }
})();
