/* ============ tools/nico/sugerencias-e2e.js — el buzón de sugerencias y fallos (Playwright, modo local) ============
 *   node tools/nico/sugerencias-e2e.js [carpeta de salida] [--puerto 8094]     (por defecto tools/nico/out/sugerencias)
 *
 * Un invitado sin nube (G.FIREBASE_CONFIG en null, como estilo-e2e.js) en escritorio, un móvil en horizontal, el
 * Magic V6 abierto y una ventana estrecha, con Dex y con Clásico (js/ui/sugerencias.js):
 * - el botón de la barra superior, dentro de la pantalla y sin pisar nada de la barra;
 * - el aviso de novedad: sale solo al llegar al menú, junto al botón y dentro de la pantalla; «Entendido» lo guarda
 *   y no vuelve al recargar; «Escribir» abre el formulario;
 * - el formulario entero a la vista (o desplazable dentro de su caja), sin buzón configurado no manda nada;
 * - con una clave de prueba y Web3Forms interceptado (nunca sale nada a internet): lo corto se rechaza, lo que se
 *   manda lleva la clave, el tipo, el texto, el contacto y los datos técnicos (o no, si se desmarcan), la espera
 *   entre dos envíos, y un error del servidor conserva el texto;
 * - en la pausa: su botón, y las teclas escritas (la «p», Esc) no llegan al juego;
 * - el inglés.
 * Consola sin errores y nada pedido fuera de 127.0.0.1 salvo lo interceptado. Deja capturas. Un par de minutos.
 * No va en npm test.
 */
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const { startServer } = require('./serve.js');
const ip = process.argv.indexOf('--puerto');
const PORT = ip > 0 ? +process.argv[ip + 1] : 8094;
const OUT = process.argv.slice(2).find((a, i, v) => !a.startsWith('--') && v[i - 1] !== '--puerto') || path.join(__dirname, 'out', 'sugerencias');
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [];
const t = (name, ok, det) => { res.push({ name, ok: !!ok, det }); console.log(`[${ok ? 'OK' : 'FALLO'}] ${name}${ok ? '' : ' :: ' + JSON.stringify(det).slice(0, 800)}`); };
const SIN_NUBE = () => {
  window.G = window.G || {};
  Object.defineProperty(window.G, 'FIREBASE_CONFIG', { get: () => null, set() {}, configurable: true, enumerable: true });
};
const WEB3 = 'https://api.web3forms.com/submit';

const VISTAS = [
  { n: 'pc', w: 1440, h: 900, dpr: 1 },
  { n: 'movil', w: 844, h: 390, dpr: 3, tactil: true },
  { n: 'v6', w: 724, h: 784, dpr: 3, tactil: true },
  { n: 'estrecha', w: 470, h: 800, dpr: 1 }
];

async function jugador(browser, v, estilo, { lang = 'es' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr, hasTouch: !!v.tactil, isMobile: !!v.tactil,
    serviceWorkers: 'block', locale: lang === 'en' ? 'en-US' : 'es-ES' });
  await ctx.addInitScript(SIN_NUBE);
  await ctx.addInitScript(([x, l]) => {
    try {
      if (!sessionStorage.getItem('__ya')) { localStorage.setItem('ps.settings', JSON.stringify({ estilo: x })); localStorage.setItem('ps.lang', l); sessionStorage.setItem('__ya', '1'); }
    } catch (e) { /* nada */ }
  }, [estilo, lang]);
  const page = await ctx.newPage();
  const P = { ctx, page, errores: [], fuera: [], envios: [], respuesta: { status: 200, body: { success: true, message: 'ok' } } };
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: the server responded with a status of 500/.test(m.text())) P.errores.push(m.text()); });
  page.on('pageerror', e => P.errores.push('pageerror: ' + e.message));
  page.on('request', r => { if (!r.url().startsWith(`http://127.0.0.1:${PORT}/`) && !/^(data|blob):/.test(r.url()) && r.url() !== WEB3) P.fuera.push(r.url()); });
  await page.route(WEB3, async route => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' } });
    P.envios.push(JSON.parse(req.postData() || '{}'));
    await route.fulfill({ status: P.respuesta.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(P.respuesta.body) });
  });
  return P;
}

async function alMenu(P) {
  const { page } = P;
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('boot') && document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
  await sleep(200);
  if (await page.locator('#tap-start').isVisible().catch(() => false)) await page.click('#tap-start');
  await page.locator('#btn-guest').click();
  await page.waitForFunction(() => ['scr-starters', 'scr-test', 'scr-menu'].some(id => !document.getElementById(id).classList.contains('hidden')), null, { timeout: 15000 });
  if (await page.locator('#scr-starters.sin-test').isVisible().catch(() => false)) {
    await page.locator('#starter-grid .ec-celda').nth(2).click();
    await page.click('#ec-ok');
  }
  await page.locator('#scr-menu').waitFor({ state: 'visible', timeout: 15000 });
}
const foto = async (page, nombre) => { await page.screenshot({ path: path.join(OUT, nombre + '.png') }); };
const caja = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, vis: !!e.offsetParent || getComputedStyle(e).position === 'fixed' }; }, sel);
const dentro = (c, v) => c && c.w > 0 && c.x >= -0.5 && c.y >= -0.5 && c.r <= v.w + 0.5 && c.b <= v.h + 0.5;
const pisa = (a, b) => a && b && a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;

async function probar(browser, v, estilo, primera) {
  const id = `${v.n}-${estilo}`;
  const P = await jugador(browser, v, estilo);
  const { page } = P;
  await alMenu(P);

  // El botón de la barra superior.
  const btn = await caja(page, '#btn-sugerencias');
  const otros = await page.evaluate(() => [...document.querySelectorAll('#topbar > *')].filter(e => e.id !== 'btn-sugerencias' && e.offsetParent)
    .map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className, x: r.left, y: r.top, r: r.right, b: r.bottom }; }));
  t(`${id}: botón en la barra superior, dentro y sin pisar nada`, btn && btn.w >= 30 && dentro(btn, v) && !otros.some(o => pisa(btn, o)), { btn, otros });
  t(`${id}: el botón lleva el punto de novedad`, await page.locator('#btn-sugerencias.sug-nuevo').count() === 1);

  // El aviso de novedad.
  await page.locator('#sug-aviso').waitFor({ state: 'visible', timeout: 9000 }).catch(() => {});
  await sleep(500);   // la animación de entrada de .box
  const av = await caja(page, '#sug-aviso');
  t(`${id}: el aviso de novedad sale solo, dentro de la pantalla y bajo el botón`, av && dentro(av, v) && av.y >= btn.b && av.y - btn.b < 20 && !pisa(av, btn), { av, btn });
  const logro = await page.evaluate(() => { const a = document.getElementById('ach-pop'); return !!a && !a.classList.contains('hidden'); });
  t(`${id}: el aviso de novedad no sale a la vez que un aviso de logro`, !logro);
  const botonesAviso = await page.evaluate(() => [...document.querySelectorAll('#sug-aviso button')].map(b => { const r = b.getBoundingClientRect(); return { w: r.width, h: r.height }; }));
  t(`${id}: los botones del aviso se pueden tocar`, botonesAviso.length === 2 && botonesAviso.every(b => b.h >= (v.tactil ? 44 : 24)), botonesAviso);
  await foto(page, `${id}-aviso`);

  if (primera) {
    await page.click('#sug-aviso-ok');
    t(`${id}: «Entendido» cierra el aviso, quita el punto y lo guarda`, await page.evaluate(() => !document.getElementById('sug-aviso') && !document.querySelector('#btn-sugerencias.sug-nuevo') && localStorage.getItem('ps.aviso.' + G.MODS.sugerenciasAviso) === '1'));
    await alMenu(P);
    await sleep(2200);
    t(`${id}: al volver a abrir el juego, ni aviso ni punto`, await page.evaluate(() => !document.getElementById('sug-aviso') && !document.querySelector('#btn-sugerencias.sug-nuevo')));
    await page.click('#btn-sugerencias');
  } else {
    await page.click('#sug-aviso-ir');
    t(`${id}: «Escribir» abre el formulario y da el aviso por visto`, await page.evaluate(() => G.Sugerencias.abierto() && !document.getElementById('sug-aviso') && localStorage.getItem('ps.aviso.' + G.MODS.sugerenciasAviso) === '1'));
  }

  // El formulario.
  await page.locator('#scr-sugerencias').waitFor({ state: 'visible' });
  await sleep(150);
  const form = await page.evaluate(() => {
    const c = document.querySelector('.sug-caja'), r = c.getBoundingClientRect();
    const env = document.getElementById('sug-enviar').getBoundingClientRect();
    return { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, desborda: c.scrollHeight > c.clientHeight + 1, sobra: c.scrollHeight - c.clientHeight, env: { x: env.left, y: env.top, r: env.right, b: env.bottom, w: env.width, h: env.height },
      foco: document.activeElement && document.activeElement.id, pagina: document.scrollingElement.scrollHeight > innerHeight + 1 };
  });
  t(`${id}: el formulario cabe en la pantalla (la caja se desplaza si hace falta) y el foco va al texto`, dentro(form, v) && !form.pagina && form.foco === 'sug-texto', form);
  t(`${id}: «Enviar» a la vista sin desplazar${form.desborda ? ' (la caja se desplaza)' : ''}`, dentro(form.env, v) && form.env.b <= form.b + 0.5 && form.env.h >= (v.tactil ? 36 : 28) || form.desborda, form.env);
  if (v.h < 520) t(`${id}: en una pantalla baja, la caja cabe sin desplazarse`, !form.desborda, form);
  await foto(page, `${id}-formulario`);

  // Sin clave: no se manda nada.
  await page.fill('#sug-texto', 'Esto es una prueba del buzón sin clave.');
  await page.click('#sug-enviar');
  await sleep(200);
  t(`${id}: sin buzón configurado lo dice y no manda nada`, P.envios.length === 0 && /no está listo/.test(await page.textContent('#sug-estado')));

  // Con clave de prueba.
  await page.evaluate(() => { G.MODS.sugerenciasClave = 'clave-de-prueba'; });
  await page.fill('#sug-texto', 'corto');
  await page.click('#sug-enviar');
  await sleep(200);
  t(`${id}: un texto demasiado corto se rechaza sin mandar`, P.envios.length === 0 && /al menos 10/.test(await page.textContent('#sug-estado')));
  await page.click('[data-tipo="sugerencia"]');
  const texto = `Me gustaría poder cambiar de compañero en la sala (${id}).`;
  await page.fill('#sug-texto', texto);
  await page.fill('#sug-contacto', 'amigo@example.com');
  await page.click('#sug-enviar');
  await page.waitForFunction(() => document.getElementById('sug-estado').classList.contains('bien'), null, { timeout: 5000 }).catch(() => {});
  const e1 = P.envios[0] || {};
  t(`${id}: se manda a Web3Forms con la clave, el tipo, el texto y el contacto`, P.envios.length === 1 && e1.access_key === 'clave-de-prueba' && e1.tipo === 'Sugerencia' && e1.mensaje === texto
    && e1.replyto === 'amigo@example.com' && e1.botcheck === false && /^PokéSwarm · Sugerencia: Me gustaría/.test(e1.subject), e1);
  t(`${id}: con los datos técnicos (jugador, versión, pantalla, estilo)`, e1.jugador === 'Invitado' && e1.version === '1.0' && new RegExp(`ventana ${v.w}x${v.h}`).test(e1.pantalla || '')
    && e1.estilo === (estilo === 'dex' ? 'Dex' : 'Clásico') && /^http:\/\/127\.0\.0\.1/.test(e1.pagina || '') && e1.donde === 'ui', e1);
  t(`${id}: dice «Enviado», vacía el texto y se cierra solo`, /Enviado/.test(await page.textContent('#sug-estado')) && await page.inputValue('#sug-texto') === '');
  await page.waitForFunction(() => !G.Sugerencias.abierto(), null, { timeout: 4000 }).catch(() => {});
  t(`${id}: …y se cierra solo`, !(await page.evaluate(() => G.Sugerencias.abierto())));

  // La espera entre dos envíos, sin datos técnicos y el error del servidor.
  await page.click('#btn-sugerencias');
  await page.click('[data-tipo="fallo"]');
  await page.fill('#sug-texto', 'Segundo envío seguido, debería esperar.');
  await page.click('#sug-enviar');
  await sleep(200);
  t(`${id}: un segundo envío seguido tiene que esperar`, P.envios.length === 1 && /Espera unos segundos/.test(await page.textContent('#sug-estado')));
  await page.evaluate(() => localStorage.removeItem('ps.sugerencias.ultimo'));
  P.respuesta = { status: 500, body: { success: false, message: 'caído' } };
  await page.uncheck('#sug-tecnicos');
  await page.click('#sug-enviar');
  await page.waitForFunction(() => document.getElementById('sug-estado').classList.contains('mal') && !document.getElementById('sug-enviar').disabled, null, { timeout: 5000 }).catch(() => {});
  const e2 = P.envios[1] || {};
  t(`${id}: sin datos técnicos sólo va el tipo, el texto y el contacto`, P.envios.length === 2 && e2.tipo === 'Fallo' && !('jugador' in e2) && !('navegador' in e2) && !('uid' in e2), e2);
  t(`${id}: si el servidor falla, lo dice y el texto sigue ahí`, /No se ha podido enviar/.test(await page.textContent('#sug-estado')) && await page.inputValue('#sug-texto') === 'Segundo envío seguido, debería esperar.');
  await foto(page, `${id}-error`);

  // Esc cierra y el menú sigue.
  await page.focus('#sug-texto');
  await page.keyboard.press('Escape');
  t(`${id}: Esc cierra el formulario y el menú sigue ahí`, await page.evaluate(() => !G.Sugerencias.abierto() && !document.getElementById('scr-menu').classList.contains('hidden')));

  // En la pausa.
  await page.evaluate(() => { localStorage.removeItem('ps.sugerencias.ultimo'); G.Flow.play(); });
  await page.waitForFunction(() => G.Game.state === 'playing', null, { timeout: 15000 });
  await sleep(600);
  await page.evaluate(() => { G.Game.togglePause(); });
  await page.locator('#scr-pause').waitFor({ state: 'visible' });
  const bp = await caja(page, '#btn-pause-sugerencias');
  const pausa = await caja(page, '#scr-pause .box');
  t(`${id}: la pausa lleva el botón, dentro de su caja`, bp && bp.w > 0 && bp.x >= pausa.x && bp.r <= pausa.r && bp.b <= pausa.b && dentro(bp, v), { bp, pausa });
  await sleep(400);
  await foto(page, `${id}-pausa`);
  await page.click('#btn-pause-sugerencias');
  await page.locator('#scr-sugerencias').waitFor({ state: 'visible' });
  await sleep(100);
  await page.keyboard.type('pp ppp');
  await sleep(150);
  t(`${id}: escribir una «p» en el formulario no quita la pausa`, await page.evaluate(() => G.Game.state === 'paused' && !document.getElementById('scr-pause').classList.contains('hidden')) && (await page.inputValue('#sug-texto')).endsWith('pp ppp'));
  const z = await page.evaluate(() => { const r = document.querySelector('.sug-caja').getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + 20); return !!(e && e.closest('#scr-sugerencias')); });
  t(`${id}: el formulario queda por encima de la pausa`, z);
  await foto(page, `${id}-pausa-formulario`);
  await page.keyboard.press('Escape');
  await sleep(150);
  t(`${id}: Esc cierra sólo el formulario: la pausa sigue`, await page.evaluate(() => !G.Sugerencias.abierto() && G.Game.state === 'paused' && !document.getElementById('scr-pause').classList.contains('hidden')));

  t(`${id}: consola sin errores`, P.errores.length === 0, P.errores);
  t(`${id}: nada pedido fuera de 127.0.0.1 (salvo Web3Forms, interceptado)`, P.fuera.length === 0, P.fuera);
  await P.ctx.close();
}

async function ingles(browser) {
  const v = VISTAS[0];
  const P = await jugador(browser, v, 'dex', { lang: 'en' });
  const { page } = P;
  await alMenu(P);
  await page.locator('#sug-aviso').waitFor({ state: 'visible', timeout: 9000 }).catch(() => {});
  await sleep(500);   // la animación de entrada de .box
  const aviso = await page.evaluate(() => document.getElementById('sug-aviso') && document.getElementById('sug-aviso').innerText);
  await page.click('#sug-aviso-ir');
  await sleep(200);
  const f = await page.evaluate(() => ({ txt: document.querySelector('.sug-caja').innerText, ph: document.getElementById('sug-texto').placeholder, bt: document.getElementById('btn-sugerencias').title }));
  t('inglés: el aviso y el formulario', /Got an idea/.test(aviso || '') && /Suggestions and bugs/.test(f.txt) && /Something broke/.test(f.txt) && /Include technical data/.test(f.txt)
    && /What you were doing/.test(f.ph) && f.bt === 'Suggestions and bugs' && !/[áéíóúñ¿]/i.test(f.txt.replace(/Pok[ée]Swarm/g, '')), { aviso, f });
  await foto(page, 'pc-dex-ingles');
  await page.fill('#sug-texto', 'x');
  await page.click('#sug-enviar');
  await sleep(150);
  t('inglés: los mensajes de estado', /mailbox isn't ready/.test(await page.textContent('#sug-estado')));
  t('inglés: consola sin errores', P.errores.length === 0, P.errores);
  await P.ctx.close();
}

(async () => {
  const srv = await startServer(path.resolve(__dirname, '..', '..'), PORT);
  const browser = await chromium.launch();
  const t0 = Date.now();
  try {
    let i = 0;
    for (const v of VISTAS) for (const estilo of ['dex', 'clasico']) await probar(browser, v, estilo, (i++ % 2) === 0);
    await ingles(browser);
  } catch (e) {
    t('sin excepciones', false, String(e && e.stack || e));
  } finally {
    await browser.close();
    srv.close();
  }
  const mal = res.filter(r => !r.ok);
  console.log(`\n${res.length - mal.length} OK, ${mal.length} fallos (${Math.round((Date.now() - t0) / 1000)} s). Capturas en ${OUT}`);
  process.exit(mal.length ? 1 : 0);
})();
