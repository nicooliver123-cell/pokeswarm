/* ============ tools/nico/buzon-e2e.js — el buzón de sugerencias de punta a punta (Playwright + emulador) ============
 *   node tools/nico/buzon-e2e.js [--puerto 8096]
 *
 * Con el emulador de Firebase (auth, firestore y database en 9099/8080/9000, proyecto demo-ps, el JDK de
 * ~/.cache/temurin-21, como coop-e2e.js) y el juego en index.html?emu (js/ui/sugerencias.js):
 * - un invitado (sin sesión) y una cuenta mandan una sugerencia por la interfaz y el juego dice «Enviado»;
 * - una cuenta normal no puede leer el buzón (las reglas de firestore.rules lo cierran) ni ve su entrada en Ajustes;
 * - la cuenta del buzón (en la prueba, una cuenta del emulador cuya huella se pone en G.MODS.devHuellas y en una copia
 *   de las reglas que se carga en el emulador: las de verdad sólo llevan la de Nico) ve el número de las que no ha
 *   leído en el botón de la barra, abre el buzón con él (las dos, la más nueva arriba, con su tipo, texto, contacto,
 *   jugador y datos técnicos), marca una como leída (el número baja y queda en Firestore), cambia a «Todas», borra
 *   una (desaparece también de Firestore), lo abre también desde Ajustes > Cuenta y cabe en una pantalla de 844x390.
 * Consola sin errores y nada pedido a la infraestructura de producción. Deja capturas en out/buzon/. Un par de
 * minutos. No va en npm test.
 */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), net = require('net'), crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { startServer } = require('./serve.js');
const ROOT = path.resolve(__dirname, '..', '..');
const ip = process.argv.indexOf('--puerto');
const PORT = ip > 0 ? +process.argv[ip + 1] : 8096;
const OUT = path.join(__dirname, 'out', 'buzon');
fs.mkdirSync(OUT, { recursive: true });
const EMU_PORTS = [9099, 8080, 9000];
const BASE = `http://127.0.0.1:${PORT}/index.html?emu`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [];
const t = (name, ok, det) => { res.push({ name, ok: !!ok }); console.log(`[${ok ? 'OK' : 'FALLO'}] ${name}${ok ? '' : ' :: ' + JSON.stringify(det).slice(0, 700)}`); };
const huella = uid => crypto.createHash('sha256').update('pokeswarm/dev/1\0' + uid).digest('hex');
const PROD = /^https?:\/\/(firestore|identitytoolkit|securetoken|firebaseinstallations|firebase)\.googleapis\.com|firebaseio\.com|firebasedatabase\.app|web3forms/i;

function findJdk() {
  if (process.env.PS_JDK) return process.env.PS_JDK;
  const base = path.join(os.homedir(), '.cache', 'temurin-21');
  const java = d => path.join(d, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  if (fs.existsSync(java(base))) return base;
  const sub = fs.existsSync(base) ? fs.readdirSync(base).map(n => path.join(base, n)).find(d => fs.existsSync(java(d))) : null;
  if (!sub) throw new Error('No encuentro el JDK 21 en ' + base + ' (o define PS_JDK).');
  return sub;
}
const portOpen = port => new Promise(r => {
  const s = net.connect({ host: '127.0.0.1', port });
  s.once('connect', () => { s.destroy(); r(true); });
  s.once('error', () => r(false));
  s.setTimeout(800, () => { s.destroy(); r(false); });
});
async function arrancarEmulador() {
  const ocupados = EMU_PORTS.filter((p, i) => false);
  for (const p of EMU_PORTS) if (await portOpen(p)) ocupados.push(p);
  if (ocupados.length) throw new Error('Puertos del emulador ocupados: ' + ocupados.join(', '));
  const jdk = findJdk();
  const env = Object.assign({}, process.env, { JAVA_HOME: jdk, PATH: path.join(jdk, 'bin') + path.delimiter + process.env.PATH });
  const cli = require.resolve('firebase-tools/lib/bin/firebase.js');
  const child = spawn(process.execPath, [cli, 'emulators:start', '--project', 'demo-ps', '--only', 'auth,firestore,database',
    '--config', path.join(ROOT, 'firebase.json')], { cwd: OUT, env, windowsHide: true });
  let text = '', exited = null;
  child.stdout.on('data', d => { text += d; });
  child.stderr.on('data', d => { text += d; });
  child.on('exit', c => { exited = c; });
  const t0 = Date.now();
  while (Date.now() - t0 < 180000) {
    if (exited !== null) throw new Error('El emulador se cerró: ' + text.slice(-1500));
    if (/All emulators ready/i.test(text) && (await Promise.all(EMU_PORTS.map(portOpen))).every(Boolean)) return child;
    await sleep(500);
  }
  throw new Error('El emulador no arrancó: ' + text.slice(-1500));
}
function pararEmulador(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGINT');
  } catch (e) { /* ya cerrado */ }
}
/** Carga en el emulador las reglas de verdad con la lista de huellas del buzón cambiada por la de `uid`. */
async function reglasConBuzon(uid) {
  const src = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
  const m = /(function buzon\(\)[\s\S]*?in \[)([\s\S]*?)(\])/.exec(src);
  if (!m) throw new Error('No encuentro buzon() en firestore.rules');
  const rules = src.replace(m[0], m[1] + `'${huella(uid)}'` + m[3]);
  const r = await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-ps:securityRules', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rules: { files: [{ name: 'firestore.rules', content: rules }] } }) });
  if (!r.ok) throw new Error('No se pudieron cargar las reglas: ' + r.status + ' ' + await r.text());
}

async function jugador(browser, tag, v = { w: 1440, h: 900, dpr: 1 }) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr, hasTouch: !!v.tactil, isMobile: !!v.tactil,
    serviceWorkers: 'block', locale: 'es-ES' });
  // El aviso de novedad tiene su prueba (sugerencias-e2e.js): aquí, dado por visto.
  await ctx.addInitScript(() => { try { localStorage.setItem('ps.aviso.sugerencias-1', '1'); } catch (e) { /* nada */ } });
  const page = await ctx.newPage();
  const P = { ctx, page, tag, errores: [], prod: [] };
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) P.errores.push(m.text()); });
  page.on('pageerror', e => P.errores.push('pageerror: ' + e.message));
  page.on('request', r => { if (PROD.test(r.url())) P.prod.push(r.url()); });
  page.on('dialog', d => d.accept());
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('boot') && document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
  await sleep(300);
  if (await page.locator('#tap-start').isVisible().catch(() => false)) await page.click('#tap-start');
  await page.locator('#scr-login').waitFor({ state: 'visible', timeout: 20000 });
  const modo = await page.evaluate(() => ({ mode: G.DB.mode, emu: !!(G.FIREBASE_CONFIG || {}).emulator }));
  if (modo.mode !== 'cloud' || !modo.emu) throw new Error(tag + ': no está contra el emulador');
  return P;
}
async function companero(page) {
  await page.waitForFunction(() => ['scr-starters', 'scr-test', 'scr-menu'].some(id => !document.getElementById(id).classList.contains('hidden')), null, { timeout: 20000 });
  if (await page.locator('#scr-starters.sin-test').isVisible().catch(() => false)) {
    await page.locator('#starter-grid .ec-celda').nth(4).click();
    await page.click('#ec-ok');
  }
  await page.locator('#scr-menu').waitFor({ state: 'visible', timeout: 20000 });
}
async function registrar(P, nombre, antesDelMenu) {
  const { page } = P;
  await page.click('#scr-login .tab[data-tab="register"]');
  await page.fill('#f-user', nombre);
  await page.fill('#f-pass', 'prueba-buzon-1');
  await page.click('#btn-auth');
  await page.waitForFunction(() => ['scr-starters', 'scr-test', 'scr-menu'].some(id => !document.getElementById(id).classList.contains('hidden'))
    || (document.getElementById('login-err').textContent || '').length > 0, null, { timeout: 20000 });
  const err = (await page.textContent('#login-err')).trim();
  if (err) throw new Error(P.tag + ': crear cuenta: ' + err);
  const uid = await page.evaluate(() => G.DB.fb.uid);
  if (antesDelMenu) await antesDelMenu(uid);
  await companero(page);
  return uid;
}
async function mandar(P, tipo, texto, contacto, tecnicos) {
  const { page } = P;
  await page.click('#btn-sugerencias');
  await page.locator('#scr-sugerencias').waitFor({ state: 'visible' });
  await page.click(`[data-tipo="${tipo}"]`);
  await page.fill('#sug-texto', texto);
  if (contacto) await page.fill('#sug-contacto', contacto);
  if (!tecnicos) await page.uncheck('#sug-tecnicos');
  const listo = await page.textContent('#sug-estado');
  await page.click('#sug-enviar');
  await page.waitForFunction(() => /sug-estado (bien|mal)/.test(document.getElementById('sug-estado').className), null, { timeout: 20000 }).catch(() => {});
  const r = { listo, estado: await page.textContent('#sug-estado') };
  await page.waitForFunction(() => !G.Sugerencias.abierto(), null, { timeout: 5000 }).catch(() => {});
  return r;
}
const foto = (page, n) => page.screenshot({ path: path.join(OUT, n + '.png') });

(async () => {
  let emu = null, srv = null, browser = null;
  const t0 = Date.now();
  try {
    emu = await arrancarEmulador();
    srv = await startServer(ROOT, PORT);
    browser = await chromium.launch();

    // 1. Un invitado manda un fallo.
    const I = await jugador(browser, 'invitado');
    await I.page.click('#btn-guest');
    await companero(I.page);
    const ri = await mandar(I, 'fallo', 'Al volver de la grieta me quedo sin poder moverme un segundo.', '', true);
    t('un invitado (sin sesión) manda un fallo y el juego dice «Enviado»', /Enviado/.test(ri.estado) && !/no está listo/.test(ri.listo), ri);
    await sleep(1200);   // la de la cuenta, después: más nueva

    // 2. Una cuenta normal manda una idea y no puede leer el buzón.
    const C = await jugador(browser, 'cuenta');
    await registrar(C, 'Amiga');
    const rc = await mandar(C, 'sugerencia', 'Estaría bien poder cambiar de compañero desde la sala.', 'amiga@example.com', false);
    t('una cuenta manda una idea con su contacto y el juego dice «Enviado»', /Enviado/.test(rc.estado), rc);
    const lee = await C.page.evaluate(() => G.DB.fb.fs.collection('sugerencias').get().then(() => 'leída', e => e.code));
    t('una cuenta normal no puede leer el buzón (permission-denied)', lee === 'permission-denied', lee);
    await C.page.click('#btn-settings').catch(() => {});
    await C.page.evaluate(() => G.SettingsUI.open('acc'));
    await sleep(800);
    t('una cuenta normal no tiene «Buzón de sugerencias» en Ajustes > Cuenta', await C.page.locator('#buz-ajustes').count() === 0);
    t('…ni número ni buzón en su botón', await C.page.locator('#btn-sugerencias .buz-num').count() === 0
      && await C.page.getAttribute('#btn-sugerencias', 'title') === 'Sugerencias y fallos');

    // 3. La cuenta del buzón.
    const N = await jugador(browser, 'buzon');
    const uidN = await registrar(N, 'Buzonero', async uid => {
      await reglasConBuzon(uid);
      await N.page.evaluate(h => { G.MODS.devHuellas = [h]; }, huella(uid));
    });
    await N.page.locator('#btn-sugerencias .buz-num').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const num = await N.page.textContent('#btn-sugerencias .buz-num').catch(() => '');
    t('la cuenta del buzón ve en su botón las 2 sin leer', num === '2', { num, uidN });
    t('…y el botón dice «Buzón de sugerencias»', await N.page.getAttribute('#btn-sugerencias', 'title') === 'Buzón de sugerencias');
    await foto(N.page, 'menu-con-numero');
    await N.page.click('#btn-sugerencias');
    await N.page.locator('#scr-buzon .buz-item').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const lista = await N.page.evaluate(() => [...document.querySelectorAll('#scr-buzon .buz-item')].map(e => ({ meta: e.querySelector('.buz-meta').innerText,
      texto: e.querySelector('.buz-texto').innerText, contacto: (e.querySelector('.buz-contacto') || {}).innerText || '', tec: (e.querySelector('pre') || {}).textContent || '', nueva: e.classList.contains('nueva') })));
    t('el buzón se abre con el botón y enseña las 2, la más nueva arriba', lista.length === 2 && /cambiar de compañero/.test(lista[0].texto) && /grieta/.test(lista[1].texto) && lista.every(x => x.nueva), lista);
    t('…con su tipo, fecha, contacto y, la del invitado, jugador y datos técnicos', /^Idea · \d\d-\d\d-\d{4} \d\d:\d\d$/.test(lista[0].meta) && /amiga@example\.com/.test(lista[0].contacto) && !lista[0].tec
      && /^Fallo · .* · Invitado$/.test(lista[1].meta) && /jugador: Invitado/.test(lista[1].tec) && /ventana 1440x900/.test(lista[1].tec), lista);
    t('el título lleva el número', /Buzón de sugerencias \(2\)/.test(await N.page.textContent('#buz-titulo')));
    await sleep(600);
    await foto(N.page, 'buzon');

    // Marcar como leída.
    await N.page.locator('#scr-buzon .buz-item').first().locator('[data-accion="leida"]').click();
    await sleep(600);
    const tras = await N.page.evaluate(async () => ({ items: document.querySelectorAll('#scr-buzon .buz-item').length, num: (document.querySelector('#btn-sugerencias .buz-num') || {}).textContent || '',
      nube: (await G.DB.fb.fs.collection('sugerencias').where('leida', '==', true).get({ source: 'server' })).docs.map(d => d.data().mensaje) }));
    t('marcar como leída: sale de «Sin leer», el número baja a 1 y queda en Firestore', tras.items === 1 && tras.num === '1' && tras.nube.length === 1 && /compañero/.test(tras.nube[0]), tras);
    await N.page.click('#scr-buzon [data-filtro="todas"]');
    await sleep(200);
    t('«Todas» enseña también la leída', await N.page.locator('#scr-buzon .buz-item').count() === 2 && await N.page.locator('#scr-buzon .buz-item.nueva').count() === 1);

    // Borrar.
    await N.page.locator('#scr-buzon .buz-item.nueva [data-accion="borrar"]').click();
    await sleep(800);
    const borr = await N.page.evaluate(async () => ({ items: document.querySelectorAll('#scr-buzon .buz-item').length, num: (document.querySelector('#btn-sugerencias .buz-num') || {}).textContent || '',
      nube: (await G.DB.fb.fs.collection('sugerencias').get({ source: 'server' })).size }));
    t('borrar: desaparece del buzón y de Firestore, y sin ninguna sin leer el botón ya no lleva número', borr.items === 1 && borr.nube === 1 && borr.num === '', borr);
    await N.page.keyboard.press('Escape');
    t('Esc cierra el buzón', !(await N.page.locator('#scr-buzon').isVisible()));

    // Ajustes > Cuenta.
    await N.page.evaluate(() => G.SettingsUI.open('acc'));
    await N.page.locator('#buz-abrir').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    t('la cuenta del buzón tiene «Abrir el buzón» en Ajustes > Cuenta', await N.page.locator('#buz-abrir').isVisible());
    await N.page.click('#buz-abrir');
    await N.page.locator('#scr-buzon .buz-item').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const z = await N.page.evaluate(() => { const r = document.querySelector('.buz-caja').getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + 20); return !!(e && e.closest('#scr-buzon')); });
    t('…y abre el buzón por encima de Ajustes', z);
    await sleep(600);
    await foto(N.page, 'buzon-desde-ajustes');

    // En una pantalla de móvil (la misma página, a 844x390).
    const M = N;
    await N.page.evaluate(() => { G.Sugerencias.cerrarBuzon(); G.SettingsUI.close(); });
    await N.page.setViewportSize({ width: 844, height: 390 });
    await sleep(500);
    await M.page.evaluate(() => G.Sugerencias.abrirBuzon());
    await M.page.locator('#scr-buzon .buz-item').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const mv = await M.page.evaluate(() => { const c = document.querySelector('.buz-caja').getBoundingClientRect(), b = document.getElementById('buz-cerrar').getBoundingClientRect();
      return { caja: [c.top, c.bottom], cerrar: [b.top, b.bottom, b.height], alto: innerHeight, items: document.querySelectorAll('.buz-item').length }; });
    t('en un móvil (844x390) el buzón cabe y «Cerrar» se ve sin desplazar', mv.items === 1 && mv.caja[0] >= 0 && mv.caja[1] <= mv.alto + 0.5 && mv.cerrar[1] <= mv.alto && mv.cerrar[2] >= 40, mv);
    await sleep(600);
    await foto(M.page, 'buzon-movil');

    for (const P of [I, C, N]) {
      t(`${P.tag}: consola sin errores`, P.errores.length === 0, P.errores);
      t(`${P.tag}: nada pedido a la infraestructura de producción`, P.prod.length === 0, P.prod);
    }
  } catch (e) {
    t('sin excepciones', false, String(e && e.stack || e));
  } finally {
    if (browser) await browser.close();
    if (srv) srv.close();
    pararEmulador(emu);
  }
  const mal = res.filter(r => !r.ok);
  console.log(`\n${res.length - mal.length} OK, ${mal.length} fallos (${Math.round((Date.now() - t0) / 1000)} s). Capturas en ${OUT}`);
  process.exit(mal.length ? 1 : 0);
})();
