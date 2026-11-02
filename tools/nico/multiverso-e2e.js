/* ============ tools/nico/multiverso-e2e.js — el Multiverso jugando (Playwright, modo local) ============
 *   node tools/nico/multiverso-e2e.js [carpeta de salida] [--puerto 8093]     (por defecto tools/nico/out/multiverso)
 *
 * Un invitado sin nube (G.FIREBASE_CONFIG en null, como estilo-e2e.js) en 1440x900 y en un móvil (844x390@3,
 * táctil), con Dex y con Clásico: la pestaña «Multiverso» de la colección y la ficha de uno que no tienes; el
 * banner del gacha (pestaña «Otros mundos», cartel, probabilidades y destacados); tiradas ×1, un shiny forzado
 * y ×10 por la interfaz (cada repetido paga 300, 900 un shiny, y los nuevos nada); los diez de compañero desde la
 * colección; y una partida con cada uno (1440x900 Dex, los diez; los demás, un reparto): eres él, dispara su ataque,
 * ningún enemigo es del Multiverso, al subir de nivel las cartas de ataque nuevo sólo traen los de su mundo (8
 * subidas, eligiendo por la interfaz) y su ataque evoluciona al máximo. Consola sin errores y nada pedido fuera de
 * 127.0.0.1. Deja capturas en la carpeta de salida. Unos 4 min. No va en npm test.
 */
'use strict';
const path = require('path'), fs = require('fs');
const REPO = path.resolve(__dirname, '..', '..');
const { chromium } = require('playwright');
const { startServer } = require('./serve.js');
// --puerto N si el 8093 está ocupado (otra prueba en marcha); el primer argumento suelto, la carpeta de salida.
const ip = process.argv.indexOf('--puerto');
const PORT = ip > 0 ? +process.argv[ip + 1] : 8093;
const OUT = process.argv.slice(2).find((a, i, v) => !a.startsWith('--') && v[i - 1] !== '--puerto') || path.join(__dirname, 'out', 'multiverso');
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [];
const t = (name, ok, det) => { res.push({ name, ok: !!ok, det }); console.log(`[${ok ? 'OK' : 'FALLO'}] ${name}${ok ? '' : ' :: ' + JSON.stringify(det).slice(0, 800)}`); };
const SIN_NUBE = () => {
  window.G = window.G || {};
  Object.defineProperty(window.G, 'FIREBASE_CONFIG', { get: () => null, set() {}, configurable: true, enumerable: true });
};

async function jugador(browser, v, estilo) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr, hasTouch: !!v.tactil, isMobile: !!v.tactil,
    serviceWorkers: 'block', locale: 'es-ES' });
  await ctx.addInitScript(SIN_NUBE);
  await ctx.addInitScript(x => { try { localStorage.setItem('ps.settings', JSON.stringify({ estilo: x })); } catch (e) { /* nada */ } }, estilo);
  const page = await ctx.newPage();
  const P = { ctx, page, errores: [], fuera: [] };
  page.on('console', m => { if (m.type() === 'error') P.errores.push(m.text()); });
  page.on('pageerror', e => P.errores.push('pageerror: ' + e.message));
  page.on('request', r => { if (!r.url().startsWith(`http://127.0.0.1:${PORT}/`) && !/^(data|blob):/.test(r.url())) P.fuera.push(r.url()); });
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('boot') && document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
  await sleep(200);
  if (await page.locator('#tap-start').isVisible().catch(() => false)) await page.click('#tap-start');
  await page.locator('#btn-guest').click();
  await page.waitForFunction(() => ['scr-starters', 'scr-test', 'scr-menu'].some(id => !document.getElementById(id).classList.contains('hidden')), null, { timeout: 15000 });
  if (await page.locator('#scr-starters.sin-test').isVisible().catch(() => false)) {
    await page.locator('#starter-grid .ec-celda').nth(3).click();
    await page.click('#ec-ok');
  }
  await page.locator('#scr-menu').waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => { G.DB.save.tickets = { t1: 60, t10: 15 }; });
  return P;
}
const foto = async (page, nombre) => { await page.screenshot({ path: path.join(OUT, nombre + '.png') }); };

async function tirar(page, boton, nombre) {
  await page.click(boton);
  for (let i = 0; i < 60; i++) {
    if (await page.locator('#pull-close').isVisible().catch(() => false)) break;
    await page.locator('#slot').click({ force: true }).catch(() => {});
    await sleep(250);
  }
  await sleep(500);
  await foto(page, nombre);
  const cartas = await page.evaluate(() => [...document.querySelectorAll('#pull-fx .card, #pull-fx .pull-card, #pull-cards > *')].map(c => c.textContent.replace(/\s+/g, ' ').trim()).slice(0, 12));
  await page.click('#pull-close');
  await sleep(300);
  return cartas;
}

const PJS = [[10001, 'Agumon', 'llama-bebe', 'Llama Bebé', 'Mega Llama'], [10002, 'Doom Slayer', 'super-escopeta', 'Súper Escopeta', 'Súper Escopeta Maestra'],
  [10003, 'Cacodemonio', 'rayo-bola', 'Rayo Bola', 'Tormenta Infernal'],
  // Segundo lote (15-10-2026).
  [10004, 'Kirby', 'bala-estelar', 'Bala Estelar', 'Bala Penetrante'], [10005, 'Link', 'espada-maestra', 'Espada Maestra', 'Gran Ataque Circular'],
  [10006, 'Samus', 'rayo-de-poder', 'Rayo de Poder', 'Rayo Phazon'], [10007, 'Pac-Man', 'waka-waka', 'Waka Waka', 'Super Pac-Man'],
  [10008, 'Blinky', 'pandilla-fantasma', 'Pandilla Fantasma', 'Pac-Mania'], [10009, 'Drácula', 'fuego-infernal', 'Fuego Infernal', 'Infierno Oscuro'],
  [10010, 'Ojo de Cthulhu', 'siervo-de-cthulhu', 'Siervo de Cthulhu', 'Ojos Fantasmales'],
  // Tercer lote (23-10-2026) y Ash.
  [10011, 'Jefe Maestro', 'rifle-de-asalto', 'Rifle de Asalto', 'Rifle de Batalla'], [10012, 'Kratos', 'espadas-del-caos', 'Espadas del Caos', 'Ciclón del Caos'],
  [10013, 'Ash', 'pikachu', 'Pikachu', 'Gigavoltio Destructor']];
const SAGAS = 'Digimon, DOOM, Kirby, Zelda, Metroid, Pac-Man, Castlevania, Terraria, Halo, God of War, Pokémon (anime)';

async function caso(browser, v, estilo, partidas) {
  const tag = `${v.n}-${estilo}`;
  const P = await jugador(browser, v, estilo), { page } = P;
  // 1. La colección antes de tenerlos: pestaña Multiverso (0/10) y la ficha.
  await page.evaluate(() => document.querySelector('#scr-menu [data-go=dex]').click());
  await page.locator('#scr-dex').waitFor({ state: 'visible' });
  const tabDex = page.locator('#dex-gens .gen-tab', { hasText: 'Multiverso' });
  t(`${tag}: la colección tiene la pestaña «Multiverso» (0/${PJS.length})`, await tabDex.count() === 1 && (await tabDex.textContent()).includes('0/' + PJS.length), await page.locator('#dex-gens').textContent());
  await tabDex.click();
  await page.locator('#dex-grid .cell').first().click();
  await sleep(200);
  const ficha = await page.locator('#dex-detail').textContent();
  t(`${tag}: ficha sin tenerlo: «???», N.º 10001 y «Sólo sale en el banner del Multiverso»`, /Sólo sale en el banner del Multiverso/.test(ficha) && !/shiny\./.test(ficha) && /10001/.test(ficha), ficha.replace(/\s+/g, ' '));
  await foto(page, `${tag}-1-coleccion-sin`);
  await page.evaluate(() => { G.UI.hideAll(); G.MenuUI.open(); });
  // 2. El gacha: la pestaña dice «Otros mundos» desde que se abre; el banner del Multiverso.
  await page.evaluate(() => { G.GachaUI.open(); });
  await sleep(300);
  const pest = await page.locator('#gacha-gens .gen-tab[data-gen="10"]').textContent();
  t(`${tag}: pestaña del gacha «Multiverso · Otros mundos» al abrir (en Kanto)`, /Multiverso/.test(pest) && /Otros mundos/.test(pest) && !/Gen 10/.test(pest), pest);
  await page.locator('#gacha-gens .gen-tab[data-gen="10"]').click();
  await sleep(700);
  const cartel = await page.evaluate(() => ({ titulo: document.getElementById('banner-title').textContent, desc: document.getElementById('banner-desc').textContent,
    rates: document.getElementById('gacha-rates').textContent.replace(/\s+/g, ' '), feat: document.querySelectorAll('#gacha-feat canvas').length,
    pity: document.getElementById('gacha-pity').textContent, scrollX: document.documentElement.scrollWidth > innerWidth + 1 }));
  const pct = +(100 / PJS.length).toFixed(2) + '%';
  t(`${tag}: cartel del Multiverso (título, sus sagas, cada uno al ${pct}, shiny 1,5 %, sin Legendaria, tres destacados)`, cartel.titulo === 'Multiverso' &&
    cartel.desc.includes(SAGAS) && PJS.every(([, n]) => cartel.rates.includes(n + ' ' + pct)) &&
    /Shiny\s*1\.5%/.test(cartel.rates) && !/Legendaria|Épica/.test(cartel.rates) && cartel.feat === 3 && !cartel.pity && !cartel.scrollX, cartel);
  await foto(page, `${tag}-2-banner`);
  // El banner del Multiverso cuesta tickets ×10 (G.MODS.multiversoTicketLila): 1 la ×1, 10 la ×10 y sin el tercer botón.
  const botones = await page.evaluate(() => ({ c1: document.getElementById('cost-1').textContent.trim(), c10: document.getElementById('cost-10').textContent.trim(),
    tercero: getComputedStyle(document.getElementById('pull-10b')).display, nota: /Cada tirada cuesta un ticket ×10/.test(document.getElementById('gacha-rates').textContent),
    ajuste: G.MODS.multiversoTicketLila, ok1: !document.getElementById('pull-1').disabled, ok10: !document.getElementById('pull-10').disabled }));
  t(`${tag}: el Multiverso cuesta tickets ×10 (1 y 10), sin el botón «×10 por 1 ticket ×10», y el cartel lo dice`,
    botones.ajuste === true && botones.c1 === '1' && botones.c10 === '10' && botones.tercero === 'none' && botones.nota && botones.ok1 && botones.ok10, botones);
  // 3. Tiradas: ×1, un shiny forzado (para ver su carta) y ×10.
  const c1 = await tirar(page, '#pull-1', `${tag}-3-tirada1`);
  const mv1 = await page.evaluate(() => Object.keys(G.DB.save.owned).map(Number).filter(d => G.DEX_BY[d] && G.DEX_BY[d].mv));
  t(`${tag}: la ×1 da uno del Multiverso, nuevo, y queda en la colección`, mv1.length === 1, { mv1, c1 });
  await page.evaluate(() => G.Gacha.debugForceShiny(1));
  const cs = await tirar(page, '#pull-1', `${tag}-4-shiny`);
  t(`${tag}: el shiny forzado es uno del Multiverso en su variocolor`, await page.evaluate(() => Object.keys(G.DB.save.shiny || {}).some(d => G.DEX_BY[d] && G.DEX_BY[d].mv)), cs);
  await page.evaluate(() => { const o = G.Gacha.pull; G.Gacha.pull = (...x) => { const r = o(...x); window.__ult = r; return r; }; });
  const antes = await page.evaluate(() => G.DB.save.coins);
  const c10 = await tirar(page, '#pull-10', `${tag}-5-tirada10`);
  const r10 = await page.evaluate(() => ({ coins: G.DB.save.coins, res: (window.__ult || []).map(x => ({ dex: x.dex, mv: !!G.DEX_BY[x.dex].mv, shiny: x.shiny, isNew: x.isNew, refund: x.refund })) }));
  const pagado = r10.res.reduce((sum, x) => sum + x.refund, 0);
  t(`${tag}: la ×10 son 10 del Multiverso; los nuevos (también un shiny nuevo) no pagan y cada repetido da 300 Pokémonedas (900 un shiny), lo que suben las monedas`,
    r10.res.length === 10 && r10.res.every(x => x.mv && (x.isNew ? x.refund === 0 : x.refund === (x.shiny ? 900 : 300))) && r10.coins - antes === pagado, { r10, antes, c10 });
  const gastado = await page.evaluate(() => G.DB.save.tickets);
  // Los normales no bajan (pueden subir: los logros de las primeras tiradas dan tickets).
  t(`${tag}: las 12 tiradas del Multiverso gastan 12 tickets ×10 y ningún ticket normal`, gastado.t10 === 3 && gastado.t1 >= 60, gastado);
  await page.locator('#gacha-gens .gen-tab[data-gen="1"]').click();
  await sleep(300);
  const kanto = await page.evaluate(() => ({ tercero: getComputedStyle(document.getElementById('pull-10b')).display, c1: document.getElementById('cost-1').textContent.trim() }));
  t(`${tag}: en Kanto vuelve el botón «×10 por 1 ticket ×10»`, kanto.tercero !== 'none' && kanto.c1 === '1', kanto);
  // Todos en la colección, pase lo que pase con el azar, para probarlos todos.
  await page.evaluate(ds => { for (const d of ds) G.DB.save.owned[d] = G.DB.save.owned[d] || { at: Date.now(), from: 'gacha' }; G.DB.commit(); }, PJS.map(x => x[0]));
  for (const [dex, nombre, mid, ataque, evoNombre] of PJS) {
    const corto = nombre.split(' ')[0].toLowerCase();
    // 4. Colección: elegirlo de compañero.
    await page.evaluate(() => { G.UI.hideAll(); G.MenuUI.open(); document.querySelector('#scr-menu [data-go=dex]').click(); });
    await page.locator('#scr-dex').waitFor({ state: 'visible' });
    await page.locator('#dex-gens .gen-tab', { hasText: 'Multiverso' }).click();
    // Por su número: «Link» también está dentro de «Blinky».
    await page.locator('#dex-grid .cell', { hasText: String(dex) }).click();
    await sleep(300);
    await foto(page, `${tag}-6-coleccion-${corto}`);
    const fichaYa = (await page.locator('#dex-detail').textContent()).replace(/\s+/g, ' ');
    t(`${tag}: ficha de ${nombre}: su nombre y «Empieza con ${ataque}»`, fichaYa.includes(nombre) && fichaYa.includes('Empieza con ' + ataque), fichaYa);
    await page.click('#dex-pick');
    t(`${tag}: ${nombre} es tu compañero`, await page.evaluate(d => G.DB.save.partner === d, dex));
    await page.evaluate(() => { G.UI.hideAll(); G.MenuUI.open(); });
    await sleep(600);
    await foto(page, `${tag}-7-menu-${corto}`);
    if (!partidas.includes(dex)) continue;
    // 5. Una partida con él.
    await page.evaluate(() => G.Flow.play());
    await page.waitForFunction(() => G.Game.state === 'playing' && G.Game.player, null, { timeout: 20000 });
    let disparos = 0, enemigosMv = 0, enemigos = 0, cerca = Infinity, danio = 0;
    for (let i = 0; i < 140 && !(i >= 24 && danio > 0); i++) {
      await sleep(250);
      const m = await page.evaluate(() => {
        const pl = G.Game.player, mv = new Set(G.DEX.filter(p => p.mv).map(p => p.dex));
        const es = G.EnemyMgr.all();
        return { d: G.Projectiles.all().filter(p => p.owner === pl).length, e: es.length, emv: es.filter(e => mv.has(e.dex)).length, h: pl.dmgDealt || 0,
          c: Math.min(Infinity, ...es.map(e => Math.hypot(e.x - pl.x, e.y - pl.y))) };
      });
      disparos = Math.max(disparos, m.d); enemigos = Math.max(enemigos, m.e); enemigosMv += m.emv; cerca = Math.min(cerca, m.c); danio = m.h;
    }
    const pl = await page.evaluate(() => { const p = G.Game.player; return { dex: p.dex, move: p.moves[0] && p.moves[0].id, scale: p.scale, r: p.r, anim: p.anim && p.anim.dex, hv: G.Sprites.hovers(p.dex) }; });
    t(`${tag}: en partida eres ${nombre} con ${ataque} y ataca (${Math.round(danio)} de daño hecho; ${disparos} proyectiles a la vez como mucho; enemigo más cercano a ${Math.round(cerca)} px)`,
      pl.dex === dex && pl.move === mid && pl.anim === dex && pl.scale === 1 && danio > 0, { pl, disparos, danio });
    t(`${tag}: con ${nombre}, ningún enemigo es del Multiverso (${enemigos} enemigos como mucho)`, enemigosMv === 0 && enemigos > 0, { enemigosMv, enemigos });
    await foto(page, `${tag}-8-partida-${corto}`);
    const c = await page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.screenshot({ path: path.join(OUT, `${tag}-9-${corto}.png`), clip: { x: Math.max(0, c.x - 120), y: Math.max(0, c.y - 110), width: 240, height: 200 } });
    // 6. Subir de nivel: las cartas de ataque nuevo sólo traen ataques de su mundo (se anota lo que devuelve
    //    G.LevelUp.offer() y se mira el texto de las cartas); se elige por la interfaz el primero nuevo de cada vez.
    await page.evaluate(() => {
      window.__ofertas = [];
      if (G.LevelUp.offer.__anota) return;   // envuelto una sola vez por página (cada personaje vacía la lista)
      const o = G.LevelUp.offer;
      G.LevelUp.offer = (...a) => { const r = o(...a); window.__ofertas.push(r.map(k => ({ key: k.key, title: k.title }))); return r; };
      G.LevelUp.offer.__anota = true;
    });
    const textos = [];
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => G.Game.debugLevelUp());
      await page.locator('#scr-levelup').waitFor({ state: 'visible', timeout: 5000 });
      await sleep(150);
      if (i === 0) await foto(page, `${tag}-9b-nivel-${corto}`);
      const nuevo = await page.evaluate(() => {
        const ult = window.__ofertas[window.__ofertas.length - 1];
        return ult.findIndex(k => k.key.startsWith('new:'));
      });
      textos.push(await page.locator('#cards').textContent());
      await page.locator('#cards .card').nth(Math.max(0, nuevo)).click();
      await page.waitForFunction(() => G.Game.state === 'playing', null, { timeout: 5000 });
    }
    const niv = await page.evaluate(d => {
      const p = G.DEX_BY[d], nuevos = window.__ofertas.flat().filter(k => k.key.startsWith('new:')).map(k => k.key.slice(4));
      const pk = new Set(G.Moves.ALL.filter(m => !G.MULTIVERSO.ATAQUES.some(a => a.id === m.id)).map(m => m.id));
      return { nuevos: [...new Set(nuevos)], ajenos: nuevos.filter(id => !p.pool.includes(id) || pk.has(id)), nombres: [...new Set(nuevos)].map(id => G.Moves.BY_ID[id].name),
        tiene: G.Game.player.moves.map(m => m.id), tieneSuyos: G.Game.player.moves.every(m => p.pool.includes(m.id)), subidas: window.__ofertas.length };
    }, dex);
    const enCartas = niv.nombres.every(n => textos.some(x => x.includes(n)));
    t(`${tag}: ${nombre} sube ${niv.subidas} niveles y las cartas de ataque nuevo sólo traen los de su mundo (${niv.nombres.join(', ')}); aprende ${niv.tiene.length}`,
      niv.subidas >= 8 && niv.nuevos.length >= 3 && !niv.ajenos.length && enCartas && niv.tiene.length >= 3 && niv.tieneSuyos, niv);
    const evo = await page.evaluate(() => {
      const pl = G.Game.player, m = pl.moves[0];
      while (m.lvl < m.def.maxLvl) G.Moves.levelUp ? G.Moves.levelUp(m) : m.lvl++;
      const need = G.Moves.EVO[m.id][1];
      const info = G.Moves.evoInfo(m, { [need]: 1 });
      const okE = G.Moves.evolve(m);
      return { lvl: m.lvl, max: m.def.maxLvl, info: info && info.name, ready: info && info.ready, okE, name: m.name };
    });
    t(`${tag}: ${ataque} sube a su nivel máximo y evoluciona a «${evoNombre}»`, evo.lvl === evo.max && evo.info === evoNombre && evo.ready && evo.okE && evo.name === evoNombre, evo);
    await sleep(1200);
    await foto(page, `${tag}-10-evolucionado-${corto}`);
    await page.evaluate(() => { G.UI.hideAll(); G.Game.quit(); G.Flow.goMenu(); });
  }
  t(`${tag}: sin errores en la consola ni peticiones fuera de 127.0.0.1`, !P.errores.length && !P.fuera.length, { errores: P.errores.slice(0, 5), fuera: P.fuera.slice(0, 5) });
  await P.ctx.close();
}

(async () => {
  const srv = await startServer(REPO, PORT);
  const browser = await chromium.launch();
  try {
    const V = [{ n: '1440x900', w: 1440, h: 900, dpr: 1 }, { n: '844x390', w: 844, h: 390, dpr: 3, tactil: true }];
    // Una partida con cada uno en escritorio con Dex; en los demás, un reparto (cada uno juega en al menos dos).
    const PLAN = { '1440x900-dex': PJS.map(x => x[0]), '1440x900-clasico': [10002, 10005, 10009, 10012], '844x390-dex': [10003, 10006, 10007, 10010, 10013],
      '844x390-clasico': [10001, 10004, 10008, 10011] };
    for (const v of V) for (const e of ['dex', 'clasico']) {
      try { await caso(browser, v, e, PLAN[v.n + '-' + e]); } catch (err) { t(`${v.n}-${e}: el recorrido`, false, String(err && err.stack || err)); }
    }
  } finally {
    await browser.close(); srv.close();
    fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify(res, null, 2));
    const f = res.filter(r => !r.ok).length;
    console.log(`\n${res.length - f}/${res.length} bien`);
    process.exit(f ? 1 : 0);
  }
})();
