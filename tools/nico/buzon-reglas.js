/* ============ tools/nico/buzon-reglas.js — reglas del buzón de sugerencias contra el emulador ============
 *   node tools/nico/buzon-reglas.js
 *
 * Arranca sólo el emulador de Firestore (puerto 8085, proyecto demo-ps, el JDK de ~/.cache/temurin-21 como
 * coop-e2e.js) con una copia de firestore.rules en la que la lista de huellas del buzón es la de una cuenta de
 * prueba (el resto, tal cual: así las reglas de verdad no llevan ninguna cuenta de prueba). Por REST, con tokens sin
 * firmar (los acepta el emulador), comprueba sugerencias/{id}:
 * - crear: un invitado sin sesión y una cuenta, con los campos y tamaños de las reglas; se rechazan los que no cuadran
 *   (tipo raro, texto corto o largo, campos de más, uid ajeno, hora puesta por el cliente, «leida» en true);
 * - leer, listar, marcar como leída y borrar: sólo la cuenta del buzón (la huella SHA-256 de su uid con la sal de
 *   js/ui/dev-menu.js calculada por las propias reglas: si las reglas no calculan la misma huella que el juego, falla);
 *   ni un invitado, ni otra cuenta, ni cambiar otra cosa que «leida».
 * Y que la lista de firestore.rules es la de G.MODS.devHuellas. Unos 20 s. Sale con 1 si algo falla.
 */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), net = require('net'), crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const PORT = 8085, PROJ = 'demo-ps';
const OUT = path.join(__dirname, 'out', 'buzon');
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [];
const t = (name, ok, det) => { res.push({ name, ok: !!ok }); console.log(`[${ok ? 'OK' : 'FALLO'}] ${name}${ok ? '' : ' :: ' + JSON.stringify(det).slice(0, 600)}`); };

const SAL = 'pokeswarm/dev/1\0';
const huella = uid => crypto.createHash('sha256').update(SAL + uid).digest('hex');
const ADMIN = 'buzon-prueba-admin', OTRO = 'buzon-prueba-otro';

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

/** Las reglas de verdad, con la lista de huellas del buzón cambiada por la de la cuenta de prueba. */
function reglasDePrueba() {
  const src = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
  const m = /(function buzon\(\)[\s\S]*?in \[)([\s\S]*?)(\])/.exec(src);
  if (!m) throw new Error('No encuentro la lista de huellas de buzon() en firestore.rules');
  const lista = [...m[2].matchAll(/'([0-9a-f]{64})'/g)].map(x => x[1]);
  return { lista, rules: src.replace(m[0], m[1] + `\n          '${huella(ADMIN)}'\n        ` + m[3]) };
}

async function arrancar(dir) {
  if (await portOpen(PORT)) throw new Error(`El puerto ${PORT} está ocupado.`);
  const jdk = findJdk();
  const env = Object.assign({}, process.env, { JAVA_HOME: jdk, PATH: path.join(jdk, 'bin') + path.delimiter + process.env.PATH });
  const cli = require.resolve('firebase-tools/lib/bin/firebase.js');
  const child = spawn(process.execPath, [cli, 'emulators:start', '--project', PROJ, '--only', 'firestore', '--config', path.join(dir, 'firebase.json')],
    { cwd: OUT, env, windowsHide: true });
  let text = '', exited = null;
  child.stdout.on('data', d => { text += d; });
  child.stderr.on('data', d => { text += d; });
  child.on('exit', c => { exited = c; });
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    if (exited !== null) throw new Error('El emulador se cerró: ' + text.slice(-1500));
    if (/All emulators ready/i.test(text) && await portOpen(PORT)) return child;
    await sleep(400);
  }
  throw new Error('El emulador no arrancó: ' + text.slice(-1500));
}
function parar(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGINT');
  } catch (e) { /* ya cerrado */ }
}

// ---------------- REST ----------------
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
function token(uid) {
  if (!uid) return null;
  const now = Math.floor(Date.now() / 1000);
  return b64({ alg: 'none', typ: 'JWT' }) + '.' + b64({ iss: 'https://securetoken.google.com/' + PROJ, aud: PROJ, auth_time: now, user_id: uid, sub: uid,
    iat: now, exp: now + 3600, firebase: { sign_in_provider: 'password', identities: {} } }) + '.';
}
const BASE = `http://127.0.0.1:${PORT}/v1/projects/${PROJ}/databases/(default)/documents`;
async function rest(metodo, url, uid, cuerpo) {
  const h = { 'Content-Type': 'application/json' };
  const tk = token(uid);
  if (tk) h.Authorization = 'Bearer ' + tk;
  const r = await fetch(url, { method: metodo, headers: h, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  let j = null;
  try { j = await r.json(); } catch (e) { /* vacío */ }
  return { status: r.status, j };
}
const val = v => typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) };
let n = 0;
/** Crea sugerencias/{id} con «at» = hora del servidor (como serverTimestamp() del juego) salvo horaCliente. */
async function crear(uid, datos, { horaCliente = false } = {}) {
  const id = 'p' + (++n);
  const fields = {};
  for (const [k, v] of Object.entries(datos)) fields[k] = val(v);
  if (horaCliente) fields.at = { timestampValue: new Date().toISOString() };
  const w = { update: { name: `projects/${PROJ}/databases/(default)/documents/sugerencias/${id}`, fields }, currentDocument: { exists: false } };
  if (!horaCliente) w.updateTransforms = [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }];
  const r = await rest('POST', `${BASE}:commit`, uid, { writes: [w] });
  return { id, ok: r.status === 200, r };
}
const buena = (uid = '') => ({ tipo: 'fallo', mensaje: 'El jefe se queda quieto al caer.', contacto: '', tecnicos: 'version: 1.0', uid, leida: false });

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-buzon-'));
  const { lista, rules } = reglasDePrueba();
  fs.writeFileSync(path.join(dir, 'firestore.rules'), rules);
  fs.writeFileSync(path.join(dir, 'firebase.json'), JSON.stringify({ firestore: { rules: 'firestore.rules' },
    emulators: { firestore: { port: PORT }, ui: { enabled: false }, singleProjectMode: true } }));
  const mods = fs.readFileSync(path.join(ROOT, 'js', 'core', 'mods.js'), 'utf8');
  const dev = /devHuellas:\s*\[([^\]]*)\]/.exec(mods);
  const devLista = dev ? [...dev[1].matchAll(/'([0-9a-f]{64})'/g)].map(x => x[1]) : [];
  t('las huellas del buzón en firestore.rules son las de G.MODS.devHuellas', lista.length > 0 && JSON.stringify(lista) === JSON.stringify(devLista), { lista, devLista });

  let emu = null;
  try {
    emu = await arrancar(dir);
    // Crear.
    const inv = await crear(null, buena(''));
    t('un invitado sin sesión deja una sugerencia', inv.ok, inv.r);
    const cta = await crear(OTRO, Object.assign(buena(OTRO), { tipo: 'sugerencia', contacto: 'amigo@example.com' }));
    t('una cuenta deja una sugerencia con su uid', cta.ok, cta.r);
    const malas = [
      ['tipo raro', null, Object.assign(buena(''), { tipo: 'queja' })],
      ['texto de menos de 10', null, Object.assign(buena(''), { mensaje: 'corto' })],
      ['texto de más de 3.000', null, Object.assign(buena(''), { mensaje: 'x'.repeat(3001) })],
      ['contacto de más de 120', null, Object.assign(buena(''), { contacto: 'x'.repeat(121) })],
      ['datos técnicos de más de 2.000', null, Object.assign(buena(''), { tecnicos: 'x'.repeat(2001) })],
      ['un campo de más', null, Object.assign(buena(''), { extra: 'hola' })],
      ['ya leída', null, Object.assign(buena(''), { leida: true })],
      ['un invitado con un uid', null, buena(OTRO)],
      ['una cuenta con el uid de otra', OTRO, buena(ADMIN)],
      ['una cuenta sin su uid', OTRO, buena('')]
    ];
    for (const [nom, uid, d] of malas) { const r = await crear(uid, d); t(`se rechaza: ${nom}`, !r.ok && r.r.status === 403, r.r.status); }
    const hora = await crear(null, buena(''), { horaCliente: true });
    t('se rechaza: la hora puesta por el cliente', !hora.ok && hora.r.status === 403, hora.r.status);

    // Leer y listar.
    const doc = id => `${BASE}/sugerencias/${id}`;
    for (const [quien, uid] of [['un invitado', null], ['otra cuenta (también la que la escribió)', OTRO]]) {
      const g = await rest('GET', doc(cta.id), uid);
      const l = await rest('GET', `${BASE}/sugerencias`, uid);
      t(`${quien} no puede leerlas ni listarlas`, g.status === 403 && l.status === 403, [g.status, l.status]);
    }
    const g = await rest('GET', doc(cta.id), ADMIN);
    t('la cuenta del buzón la lee (las reglas calculan la misma huella que el juego)', g.status === 200 && g.j.fields.mensaje.stringValue === buena().mensaje
      && g.j.fields.uid.stringValue === OTRO && !!g.j.fields.at.timestampValue, g);
    const q = await rest('POST', `${BASE}:runQuery`, ADMIN, { structuredQuery: { from: [{ collectionId: 'sugerencias' }], orderBy: [{ field: { fieldPath: 'at' }, direction: 'DESCENDING' }], limit: 100 } });
    const docs = (q.j || []).filter(x => x.document);
    t('la cuenta del buzón las lista de la más nueva a la más vieja', q.status === 200 && docs.length === 2 && docs[0].document.name.endsWith('/' + cta.id), q.status);

    // Marcar como leída.
    const patch = (uid, id, campos) => rest('PATCH', `${doc(id)}?${campos.map(c => 'updateMask.fieldPaths=' + c).join('&')}`, uid,
      { fields: Object.fromEntries(campos.map(c => [c, c === 'leida' ? { booleanValue: true } : { stringValue: 'cambiado' }])) });
    t('ni un invitado ni otra cuenta la marcan como leída', (await patch(null, inv.id, ['leida'])).status === 403 && (await patch(OTRO, cta.id, ['leida'])).status === 403);
    t('la cuenta del buzón no puede cambiar el texto', (await patch(ADMIN, cta.id, ['mensaje'])).status === 403);
    const p = await patch(ADMIN, cta.id, ['leida']);
    t('la cuenta del buzón la marca como leída', p.status === 200 && p.j.fields.leida.booleanValue === true, p);

    // Borrar.
    t('ni un invitado ni otra cuenta la borran', (await rest('DELETE', doc(inv.id), null)).status === 403 && (await rest('DELETE', doc(cta.id), OTRO)).status === 403);
    const d = await rest('DELETE', doc(inv.id), ADMIN);
    const tras = await rest('GET', doc(inv.id), ADMIN);
    t('la cuenta del buzón la borra', d.status === 200 && tras.status === 404, [d.status, tras.status]);

    // El resto de la base sigue cerrado.
    t('lo demás sigue cerrado (un invitado no lee saves/)', (await rest('GET', `${BASE}/saves/${OTRO}`, null)).status === 403);
  } catch (e) {
    t('sin excepciones', false, String(e && e.stack || e));
  } finally {
    parar(emu);
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* nada */ }
  }
  const mal = res.filter(r => !r.ok);
  console.log(`\n${res.length - mal.length} OK, ${mal.length} fallos`);
  process.exit(mal.length ? 1 : 0);
})();
