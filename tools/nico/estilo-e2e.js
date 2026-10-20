/* ============ tools/nico/estilo-e2e.js — prueba de la identidad visual en el navegador ============
 *   cd tools/nico && node estilo-e2e.js [--dev] [--headed] [--puerto 8092] [--sin-capturas] [--solo-hud | --solo-portada | --solo-entornos | --solo-juego | --solo-companero | --solo-mapas | --solo-relieve]
 *
 * Arnés del estilo «Dex de Expedición» (lote 1: base del estilo y menús). Modo local, un jugador
 * invitado, sin emulador: abre index.html (con --dev, dev.html) en Chromium con Playwright y, en
 * los dos estilos (Dex y Clásico, cambiados con G.Estilo.set en la misma página):
 *
 *   1. Pantallas: recorre las 21 pantallas (.scr) en cada tamaño (escritorio 1440x900, 1920x1080 y
 *      1024x768; móvil táctil 844x390@3 y 780x360@3; el Magic V6 de Nico, con los tamaños que usó la
 *      verificación del 12-10-2026 (sin confirmar en el teléfono): interior 724x784 y 784x724 y exterior
 *      807x360 @3 táctil; y otros plegables o tabletas casi cuadrados, 1000x900 y 900x1000 @2,5 táctil) y
 *      exige: nada de desplazamiento horizontal (página, pantalla y caja), la caja dentro de la ventana, el
 *      menú principal oculto detrás de cualquier .scr.dim y la línea de créditos sin pisar la caja. Con Dex, que la piel está puesta en cada una
 *      (borde de la caja y letra y fondo de los botones: si upstream renombra .box o .btn, falla); con
 *      Clásico, que no. Y el menú principal: las 9 opciones a la vista sin desplazar, el logotipo libre de la
 *      barra superior y la línea de créditos sin pisar ninguna caja.
 *   2. Gacha en pantallas bajas y en los plegables: en los 10 banners (los 9 de upstream y el Multiverso), cada lienzo destacado dentro del
 *      banner y de la ventana, a su tamaño (alto CSS = alto del lienzo), y los tres botones de tirar a la
 *      vista sin desplazar; si las pestañas no caben, la elegida entera (fuera del degradado) y el
 *      degradado sólo donde hay más; en pantallas bajas, la capa «Probabilidades» (la tabla debajo del título, «Cerrar» entero
 *      y sin pisarla) y los avisos de logro sin tapar ni quedarse los toques de los botones de tirar.
 *      Tiradas ×1 y ×10 por la interfaz real: sin desplazar y «Continuar» a la vista sin tapar ninguna
 *      carta; y una ×10 con diez repetidos que desbloquean su evolución (las de nombre más largo; el azar
 *      de esa tirada, guionizado sólo en la prueba): cada etiqueta entera, con el nombre, y cada carta a la
 *      vista sin «Continuar» encima (en pantallas bajas, sin desplazar).
 *   3. Nada se corta: en los lienzos que anima G.Estilo (los 27 legendarios destacados, el compañero del
 *      menú con 37 Pokémon, iniciales y gigantes, y el premio de las tiradas) se dibuja cada fotograma de
 *      Idle y de las animaciones que se les dejan, con su colocación (escala y pies) y su sombra, y la caja
 *      de píxeles opacos no toca el borde; y además 30 fotogramas de verdad de cada lienzo.
 *   4. Fin de partida (con una partida larga, en todos los tamaños): «Volver al menú» a la vista, y cada
 *      panel de las estadísticas se llega a ver entero, sin el botón encima, desplazando la caja.
 *   5. Franja de tipo de 8 ± 1 px en las cartas de nivel de los 18 tipos (Dex), ≥ 3:1 contra la carta
 *      (con el filo claro en Fantasma, Dragón y Siniestro); sin franja en Clásico. Y las píldoras de tipo
 *      (G.UI.typeChips) de los 18 tipos con Dex, ≥ 4,5:1.
 *   6. Teclado (Dex, 1440x900): Tab recorre el menú, las cartas de nivel y Ajustes con el anillo de
 *      foco visible; «Estilo» es la primera sección de Gráficos y cambiarlo ahí funciona.
 *   7. «Gira el móvil»: sí en un móvil en vertical (390x844) y en el Magic V6 plegado en vertical
 *      (360x807), no en los plegables abiertos; con Dex, la capa opaca. Y la 404 en una ruta profunda (/a/b/c):
 *      con su hoja de estilo y sin peticiones fallidas.
 *   8. Sin internet: tras la primera carga (en Clásico, con el service worker), se corta la red y se
 *      pasa a Dex: la letra está (document.fonts.check) y no se pide nada fuera de assets/fonts.
 *   9. Consola sin errores ni avisos (menos los del entorno de la prueba: ver AVISOS_ENTORNO).
 *  10. HUD Dex en partida (lote 2), en escritorio, móvil y el Magic V6 (interior en horizontal y en vertical, exterior
 *      en horizontal y la mitad de arriba en modo mesa, 784x362): con un jefe a la vista, su aviso, lluvia, mejoras, objeto
 *      y cuatro ataques, la banda de arriba medida en píxeles (el HUD en un lienzo transparente aparte) es la de
 *      G.HudDex.bandas() y la de check.js (≤ 20 % del alto en un móvil); pares Dex/Clásico; tocar la ranura 2 la activa y
 *      la pausa responde (844x390, con el dedo); contraste de los textos en píxeles reales en bosque, cueva, volcán, arena
 *      y lluvia (p10 ≥ 3:1, mediana ≥ 4,5:1); el HUD Dex cuesta de media como mucho 0,3 ms más que el de upstream en la misma escena (escritorio); capturas con 4 jugadores; y
 *      con movimiento reducido no parpadea nada. Con la letra de verdad, cada bioma y cada arena salen enteros en el
 *      sensor de Rotom y la pista de controles del principio sale entera; el aviso de logro en partida va bajo la banda
 *      de arriba del HUD (también el que salió en el menú); en el plegable abierto nada pisa el pliegue; y las flechas
 *      del mismo cuadrante (jefe y tres compañeros, uno caído) no se pisan y sus etiquetas quedan en la zona libre.
 *  11. Arreglos de la verificación de los lotes 1 y 2: el Magic V6 con la barra del navegador (724x740 a 640 y 784x700
 *      a 640, con `screen` de la pantalla entera): el menú entero sin desplazar y sin los créditos encima, ni encima
 *      del gacha, la colección, las mejoras, las misiones o Ajustes (724x700, 724x640 y 784x640), el pliegue vertical a
 *      724x700 sin nada encima (tampoco un aviso largo) y las tiradas a 724x640 y 784x640; la ×10 de 640x360 y 667x375;
 *      la barra superior compacta a 640, 600, 520, 440 y 400 de ancho (con Dex, «PokéSwarm» entero en la tarjeta); el
 *      aviso flotante del menú, al empezar la partida, por encima de las ranuras; «…» con los puntos en la línea base;
 *      y zonas seguras simuladas (cada env(safe-area-inset-*) de lo que se sirve, cambiado por píxeles: 844x390 con
 *      47/24/47/21).
 *  12. Portada «Tarjeta de entrenador» (--solo-portada), con Dex, en 10 tamaños: «Pulsa para empezar», el inicio de
 *      sesión, el test, su resultado y el menú, cada cara entera; los 9 botones del menú de 44 px o más, sin textos
 *      cortados ni desbordados en vertical (el icono y la caja de la letra del nombre dentro del borde); el compañero a
 *      ×4 en el móvil; la pantalla opaca del menú ≤ 25 % en el móvil y el plegable; y Clásico.
 *  13. Entornos del Gremio, clima y horneado escalonado (--solo-entornos; lote 3). Capturas por pares de los tres biomas
 *      (en un sitio con paredes y charcos) a 1440x900, 844x390@3 y 724x784@3, una arena y la lluvia, la nieve y la arena.
 *      Imagen (1440x900): los píxeles de un Pokémon cerca del borde son idénticos con y sin el farol (que sólo va en el suelo);
 *      la viñeta cálida deja intacto el 46 % central; la lluvia de dos tonos da ≥ 2:1 por el mejor de sus dos tonos en cada
 *      color de suelo del juego (biomas y arenas) y, aparte, en cada suelo donde llueve (los 3 normales y las arenas con lluvia
 *      de G.Tiles.ARENA_THEMES); con los mapas propios todos los suelos son de tono medio, así que el borde oscuro contra el
 *      suelo más claro y el núcleo contra el más oscuro sólo van al informe, como extremos; y el contraste de los
 *      Pokémon contra el suelo (mediana de la silueta, 36 Pokémon) no empeora más de 0,05 frente a Clásico en los tres biomas
 *      ni, con lluvia, más de 0,1 frente a Clásico con lluvia (lo que la lluvia de Dex le quita a Dex, al informe). Horneado, con GPU (otro Chromium, con requestAnimationFrame y G.Tiles.paintChunk
 *      envueltos sólo en la prueba): en el fondo de los menús (el cambio de bioma de cada 30 s), de los 236 a los 244 s de
 *      partida en Dex y en Clásico y al cambiar de estilo en la pausa (con el mundo Dex, 0 chunks: el mundo no cambia):
 *      ningún fotograma de más de 20 ms, como mucho 1 chunk
 *      por fotograma (mediana ≤ 4 ms de horneado; como mucho un 15 % por encima y ninguno de más de 10 ms: un chunk no se
 *      parte) y 0 chunks en el fotograma del cambio; 844x390@3 con la CPU ×4: 1 chunk por fotograma y ningún fotograma de
 *      más de 33 ms (con su p95 en el informe). Rendimiento, minuto 8 con 80 Pokémon y lluvia: Dex frente a Clásico, Δ de
 *      la CPU media por fotograma ≤ 0,3 ms y del p95 ≤ 0,5 ms con GPU y calidad Alta, y ≤ 0,5 ms sin GPU y calidad Baja.
 *  14. Ajustes de juego del lote 4 (--solo-juego, con la 15): píxel nítido (un tablero de 8x8 píxeles de arte dibujado como
 *      un sprite: todas sus filas y columnas miden lo mismo en píxeles físicos a 1440x900@1, 844x390@3 y 844x390@2,625; sin
 *      el ajuste, como upstream) y su fila en Ajustes > Gráficos > Pantalla; el encuadre (tu Pokémon en el centro de la
 *      zona libre ±4 px a 844x390; en escritorio, en el centro); el golpe final (140 ± 17 ms quieto con el reloj de la
 *      partida); el iris (el fotograma del tirón al entrar en la arena, negro; una captura a mitad, con el fogonazo dentro;
 *      y la vuelta, cerrado antes y en negro); y el rótulo de la arena, lo primero que sale al entrar jugando solo.
 *  15. Pantalla dividida estilo Nintendo DS (lote 5): elegida por Ajustes > Controles, en el Magic V6 (724x784, 784x724,
 *      724x700 con la barra del navegador), plegado y emulado con CDP (Emulation.setDeviceMetricsOverride con devicePosture y
 *      displayFeature; capturas con Page.captureScreenshot, porque las de Playwright apagan los segmentos): en modo mesa la
 *      automática, por segmento (784x362 y 784x362), con una máscara de 20 px, en libro «a un lado» y en libro «abajo» (tu
 *      Pokémon, fuera de la bisagra); en escritorio (1440x900, abajo y a la izquierda en Clásico); y en un móvil (844x390,
 *      abajo y a un lado). El lienzo del juego y el panel donde toca, el HUD Dex sin ficha ni ranuras y nada junto a la
 *      división ni sobre el pliegue, botones de 44 px, un píxel de arte de 1,2 px CSS o más en px físicos enteros, el
 *      ataque 2 con el dedo o el ratón, el joystick del panel mueve a tu Pokémon, el teclado sigue, la pista del joystick, desplegar y replegar en plena partida, cambiar el modo
 *      desde la pausa sin reiniciar y, en el menú, la pantalla entera.
 *  16. «Elige a tu compañero» sin el test de personalidad (--solo-companero; G.MODS.sinTest): un invitado nuevo va directo
 *      a la pantalla (el test no sale nunca), en Dex y en Clásico, en escritorio, el móvil, el Magic V6 (las dos posturas
 *      abierto, con la barra del navegador, el exterior y la mitad de arriba en modo mesa) y los otros plegables: los 29
 *      iniciales a la vista sin desplazar (dentro de la caja y de la ventana), cada uno con su nombre entero, sus tipos
 *      (con nombre o con emblema, y en la etiqueta accesible) y su sprite a píxeles físicos enteros sin tocar el borde del
 *      lienzo; los botones de 44 px con Dex en táctil; elegir (con el dedo en táctil), «Al azar» (otro distinto) y
 *      «Elegir a X» guardan el inicial, el compañero, la personalidad en null y el logro «Primer compañero». Teclado en
 *      escritorio: un solo Tab para la rejilla, flechas, Inicio, Fin, Espacio, Intro hasta «Elegir a X» y el anillo de
 *      foco. Al cambiar de tamaño se recoloca; en vertical (360x807) sale «Gira el móvil» y al girar cabe; en inglés.
 *  17. Mapas propios (--solo-mapas; G.MODS.mapasPropios, js/world/mapas*.js): que están puestos (los 3 biomas con sus nombres,
 *      el pintor, los objetos y el fondo del menú con G.Mapas.SEMILLA_MENU) y capturas por pares Dex/Clásico del fondo del
 *      menú (sin la interfaz) y de los 3 biomas (en un sitio con paredes y líquido, sin clima) a 1440x900, 844x390@3 y
 *      724x784@3, y de las 18 arenas en Dex a 1440x900 (por G.Rift.debugArena, con tu Pokémon en el centro; el azar de cada
 *      entrada, sembrado sólo durante esa llamada: el mismo legendario y el mismo sitio en cada pasada). En el móvil
 *      (844x390@3), en las arenas de fuego (isla) y normal (octógono), con Dex y con Clásico, tu Pokémon en el límite de
 *      keepInside de rift.js ((r − 1,4) casillas) al este y al oeste, en la vista de la cámara: (a) lo que se pinta, 0 píxeles
 *      de terreno normal: en las casillas a q ≥ 32² (donde mapas.js deja de dar la arena), el suelo horneado del chunk es el
 *      vacío de la grieta (o el vacío retocado por la gradación de Dex), sin líquido con sus chispas ni objetos; y (b) el
 *      terreno: ninguna casilla a la vista a q ≥ 32² (la regla del §7 de la especificación) y todo lo de fuera del círculo,
 *      su borde o el vacío (G.Mapas.codigo A_BORDE o A_VACIO y pared para G.World.kindAt). Al informe, la cota con tu
 *      Pokémon en cualquier casilla transitable. Consola sin errores.
 *  18. Relieve, sombras y luz (--solo-relieve; js/world/relieve.js, sombras.js y luz.js), a 1440x900 y 844x390@3, en una cresta
 *      fina con la semilla 7: tu Pokémon con los pies 6 px al norte queda en parte detrás (píxeles a la vista con y sin relieve,
 *      sin el repintado) y un Pokémon al sur, entero; a 2 px, G.Claridad cuenta la pared y lo repinta; la luz con el píxel
 *      nítido (sobre un suelo liso, cada píxel de arte, m×m píxeles físicos de un solo color); con «Menos sacudidas», el búfer
 *      quieto; un aviso de zona y un disparo enemigo, iguales con y sin luz; la sombra de un árbol; sin el HUD, el lienzo igual
 *      con Dex y con Clásico (y distinto con mundoDex = false); con la pantalla dividida, la luz en la mitad del juego.
 *
 * Capturas en tools/nico/out/estilo/ (pares Dex/Clásico de menú, colección, gacha, tiradas, subida de
 * nivel con foco y con el ratón encima, Ajustes, pausa, fin, sala, iniciales, mejoras y tragaperras, a
 * 1440x900, 844x390 y 724x784; la capa «Probabilidades» y la ×10 de repetidos, en pantallas bajas) con una
 * hoja de contactos (indice.html) e informe.json.
 * Código de salida 0 = todo bien. Nada habla con servicios de fuera: sólo 127.0.0.1.
 */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { startServer } = require('./serve.js');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out', 'estilo');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = +arg('--puerto', 8092);
const PAGE = process.argv.includes('--dev') ? 'dev.html' : 'index.html';
const BASE = `http://127.0.0.1:${PORT}/${PAGE}`;
const HEADLESS = !process.argv.includes('--headed');
const CAPTURAS = !process.argv.includes('--sin-capturas');
const SOLO_HUD = process.argv.includes('--solo-hud');   // sólo el HUD Dex en partida (sección 10), para ir más rápido
const SOLO_PORTADA = process.argv.includes('--solo-portada');   // sólo la portada «Tarjeta de entrenador» (sección 12)
const SOLO_ENTORNOS = process.argv.includes('--solo-entornos');   // sólo los entornos del Gremio, el clima y el horneado (sección 13)
const SOLO_JUEGO = process.argv.includes('--solo-juego');   // sólo los ajustes de juego y la pantalla dividida (secciones 14 y 15)
const SOLO_COMPANERO = process.argv.includes('--solo-companero');   // sólo «Elige a tu compañero» sin el test (sección 16)
const SOLO_MAPAS = process.argv.includes('--solo-mapas');   // sólo los mapas propios (sección 17)
const SOLO_RELIEVE = process.argv.includes('--solo-relieve');   // sólo el relieve, las sombras y la luz (sección 18)
const OTRAS = !SOLO_HUD && !SOLO_PORTADA && !SOLO_ENTORNOS && !SOLO_JUEGO && !SOLO_COMPANERO && !SOLO_MAPAS && !SOLO_RELIEVE;      // todas las secciones
const ESTILOS = ['clasico', 'dex'];

/** Avisos de la consola que son del entorno de la prueba, no del juego. */
const AVISOS_ENTORNO = [
  /Service Worker registration blocked by Playwright/i,                         // la prueba bloquea el service worker (menos en la de sin internet)
  /AudioContext was not allowed to start/i,                                      // Chromium sin gesto del usuario al arrancar (upstream crea el audio al cargar)
  /Multiple readback operations using getImageData/i,                            // la prueba lee los píxeles de los lienzos del juego
  /partida no válida para el ranking: debug/i                                    // la prueba abre una arena con G.Rift.debugArena (sección 14)
];

const VP = {
  pc: { w: 1440, h: 900 }, fhd: { w: 1920, h: 1080 }, tab: { w: 1024, h: 768 },
  movil: { w: 844, h: 390, dpr: 3, tactil: true }, movilBajo: { w: 780, h: 360, dpr: 3, tactil: true },
  // El Honor Magic V6 de Nico (los tamaños de la verificación del 12-10-2026, sin confirmar en el teléfono):
  // pantalla interior en horizontal y en vertical, y exterior en horizontal.
  pleg1: { w: 784, h: 724, dpr: 3, tactil: true }, pleg2: { w: 724, h: 784, dpr: 3, tactil: true }, exterior: { w: 807, h: 360, dpr: 3, tactil: true },
  // Otros plegables o tabletas casi cuadrados.
  pleg3: { w: 1000, h: 900, dpr: 2.5, tactil: true }, pleg4: { w: 900, h: 1000, dpr: 2.5, tactil: true }
};
const nombreVp = v => `${v.w}x${v.h}${v.dpr ? '@' + v.dpr : ''}${v.seguras ? '-muesca' : ''}`;
const CON_CAPTURAS = ['pc', 'movil', 'pleg2'];
const GACHA_MOVIL = ['movil', 'movilBajo', 'exterior', 'pleg1', 'pleg2', 'pleg3', 'pleg4'];
const TIRADAS = ['movil', 'movilBajo', 'exterior', 'pc', 'pleg1', 'pleg2'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const report = { inicio: new Date().toISOString(), url: BASE, comprobaciones: [], capturas: [], medidas: {} };
const save = () => fs.writeFileSync(path.join(OUT, 'informe.json'), JSON.stringify(report, null, 2));
let fallos = 0;
function check(name, okv, detail) {
  if (!okv) fallos++;
  report.comprobaciones.push({ comprobacion: name, ok: !!okv, detalle: detail });
  const d = detail === undefined ? '' : ' :: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail));
  console.log(`[${okv ? 'OK' : 'FALLO'}] ${name}${okv ? '' : d.slice(0, 1500)}`);
  save();
}
async function captura(page, nombre) {
  if (!CAPTURAS) return null;
  const f = nombre + '.png';
  await page.screenshot({ path: path.join(OUT, f) });
  report.capturas.push(f);
  return f;
}

// ---------------- arranque de un jugador (invitado, modo local) ----------------
/** Modo local: la prueba es de un jugador invitado sin emulador. Desde el 13-10-2026 lo publicado lleva la config del
 *  Firebase propio, que cargaría el SDK de gstatic y hablaría con el proyecto de verdad: antes de que lo ponga
 *  firebase-config.js, G.FIREBASE_CONFIG se queda en null (sólo en la prueba; el juego no cambia). */
const SIN_NUBE = () => {
  window.G = window.G || {};
  Object.defineProperty(window.G, 'FIREBASE_CONFIG', { get: () => null, set() {}, configurable: true, enumerable: true });
};
/** El aviso de novedad del buzón de sugerencias (js/ui/sugerencias.js) sale una vez por navegador al llegar al menú, a
 *  una hora que no controla la prueba: se da por visto para medir y fotografiar las pantallas tal y como se quedan
 *  (como los avisos de logro, no cuenta para el 25 % de pantalla opaca). Su prueba es tools/nico/sugerencias-e2e.js. */
const AVISO_VISTO = (() => {
  const m = /sugerenciasAviso:\s*'([^']*)'/.exec(fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'core', 'mods.js'), 'utf8'));
  return { content: m && m[1] ? `try { localStorage.setItem('ps.aviso.${m[1]}', '1'); } catch (e) {}` : '' };
})();
async function nuevo(browser, v, { sw = false, perf = false } = {}) {
  // v.pantalla: [ancho, alto] de la pantalla entera si no es la ventana (el plegable con la barra del navegador).
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr || 1, hasTouch: !!v.tactil, isMobile: !!v.tactil,
    serviceWorkers: sw ? 'allow' : 'block', locale: 'es-ES', ...(v.pantalla ? { screen: { width: v.pantalla[0], height: v.pantalla[1] } } : {}) });
  await ctx.addInitScript(SIN_NUBE); await ctx.addInitScript(AVISO_VISTO);
  if (v.seguras) await simularSeguras(ctx, v.seguras);
  if (perf) await ctx.addInitScript(PERF_INIT);
  const page = await ctx.newPage();
  const P = { ctx, page, v, consola: [], fuera: [] };
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !AVISOS_ENTORNO.some(re => re.test(m.text()))) P.consola.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => P.consola.push('pageerror: ' + e.message));
  page.on('request', r => { if (!r.url().startsWith(`http://127.0.0.1:${PORT}/`) && !/^(data|blob):/.test(r.url())) P.fuera.push(r.url()); });
  return P;
}
async function entrar(P) {
  const { page } = P;
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('boot') && document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
  await sleep(200);
  const gira = await page.evaluate(() => !document.getElementById('rotate').classList.contains('hidden'));
  if (gira) return false;
  if (await page.locator('#tap-start').isVisible().catch(() => false)) await page.click('#tap-start');
  await page.locator('#btn-guest').click();
  // Sin el test (G.MODS.sinTest): «Elige a tu compañero», una celda y «Elegir a X». Con sinTest = false, el test.
  await page.waitForFunction(() => ['scr-starters', 'scr-test', 'scr-menu'].some(id => !document.getElementById(id).classList.contains('hidden')), null, { timeout: 15000 });
  if (await page.locator('#scr-starters.sin-test').isVisible().catch(() => false)) {
    await page.locator('#starter-grid .ec-celda').nth(1).click();
    await page.click('#ec-ok');
  }
  for (let n = 0; n < 40 && await page.locator('#scr-test').isVisible(); n++) { await page.locator('#test-a .answer').first().click(); await sleep(40); }
  if (await page.locator('#scr-result').isVisible()) await page.click('#res-ok');
  await page.locator('#scr-menu').waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => {
    G.DB.save.tickets = { t1: 60, t10: 6 };
    // Una sala de mentira para ver la pantalla de la sala (la que más usa Nico) sin red: sólo en la prueba.
    const sala = { id: 'prueba', isHost: true, host: 'u1', members: [{ uid: 'u1', name: 'Nico', dex: 255 }, { uid: 'u2', name: 'Ana', dex: 25, shiny: true }, { uid: 'u3', name: 'Leo', dex: 7 }] };
    window.__sala = sala;
    G.Social.refreshMember = () => {}; G.Social.refreshPresence = () => {};
    G.Net.mode = () => 'direct';
  });
  return true;
}
const estilo = (page, e) => page.evaluate(x => { G.Estilo.set(x); }, e);

// ---------------- las 21 pantallas ----------------
const MOVS = `Object.keys(G.Moves.BY_ID)`;
const PANTALLAS = [
  ['scr-login', 'G.UI.hideAll(); G.LoginUI.open();'],
  ['scr-test', 'G.UI.hideAll(); G.TestUI.start();'],
  ['scr-result', 'G.UI.hideAll(); G.UI.show("scr-result");'],
  ['scr-starters', 'G.UI.hideAll(); G.ElegirCompanero.abrir();'],   // «Elige a tu compañero» (sin el test, G.MODS.sinTest)
  ['scr-starters', 'G.UI.hideAll(); G.UI.show("scr-result"); document.getElementById("res-other").click();', '', 'test'],   // «Elegir otro» del test (sinTest = false)
  ['scr-menu', 'G.MenuUI.open();'],
  ['scr-settings', 'G.MenuUI.open(); G.SettingsUI.open("sound");', 'G.SettingsUI.close();'],
  ['scr-settings', 'G.MenuUI.open(); G.SettingsUI.open("gfx");', 'G.SettingsUI.close();', 'gfx'],
  ['scr-settings', 'G.MenuUI.open(); G.SettingsUI.open("ctl");', 'G.SettingsUI.close();', 'ctl'],
  ['scr-settings', 'G.MenuUI.open(); G.SettingsUI.open("acc");', 'G.SettingsUI.close();', 'acc'],
  ['scr-settings', 'G.MenuUI.open(); G.SettingsUI.open("about");', 'G.SettingsUI.close();', 'about'],
  ['scr-legal', 'G.MenuUI.open(); document.querySelector("[data-legal]").click();', 'document.getElementById("legal-close").click();'],
  ['scr-nick', 'G.MenuUI.open(); G.NickUI.open();'],
  // Amigos y ranking piden una cuenta en la nube: en modo local se abre la pantalla tal cual, para ver su piel.
  ['scr-friends', 'G.MenuUI.open(); G.FriendsUI.open(); if (!G.UI.isOpen("scr-friends")) G.UI.show("scr-friends", true);'],
  ['scr-lobby', 'G.MenuUI.open(); Object.defineProperty(G.Social, "room", { get: () => window.__sala, configurable: true }); G.LobbyUI.open();',
    'Object.defineProperty(G.Social, "room", { get: () => null, configurable: true });'],
  ['scr-rank', 'G.MenuUI.open(); G.RankingUI.open(); if (!G.UI.isOpen("scr-rank")) G.UI.show("scr-rank", true);'],
  ['scr-goals', 'G.MenuUI.open(); G.GoalsUI.open("missions");'],
  ['scr-goals', 'G.MenuUI.open(); G.GoalsUI.open("ach");', '', 'ach'],
  ['scr-goals', 'G.MenuUI.open(); G.GoalsUI.open("profile");', '', 'profile'],
  ['scr-profile', `G.MenuUI.open(); G.ProfileUI.showData({ name: 'Nico', title: 'Explorador', best: { solo: 754, group: 1203, level: 31, bosses: 12, legends: 3, kills: 4321, medals: 2 },
    favs: [{ dex: 255 }, { dex: 25, shiny: true }, { dex: 150 }], medals: Object.keys(G.AchDefs.BY).slice(0, 6) });`, 'document.getElementById("prof-close").click();'],
  ['scr-dex', 'G.MenuUI.open(); document.querySelector("#scr-menu [data-go=dex]").click();'],
  ['scr-upgrades', 'G.MenuUI.open(); document.querySelector("#scr-menu [data-go=upgrades]").click();'],
  ['scr-guarderia', 'G.MenuUI.open(); document.querySelector("#scr-menu [data-go=guarderia]").click();'],   // la guardería (MOD nico)
  ['scr-gacha', 'G.MenuUI.open(); G.GachaUI.open();'],
  // En partida (la run real; las pantallas se abren con sus funciones de run-ui.js).
  ['scr-levelup', `if (G.Game.state === 'ui') G.Flow.play(); G.RunUI.showLevelUp(7, G.LevelUp.offer(G.Game.player), () => {});`],
  ['scr-item', `if (G.Game.state === 'ui') G.Flow.play(); const it = Object.keys(G.Items.BY); G.RunUI.showItemChoice(it[0], it[1], () => {});`],
  ['scr-bond', `if (G.Game.state === 'ui') G.Flow.play(); const ids = ${MOVS}.slice(0, 4); G.RunUI.showBond({ mode: 'pair', group: [],
    loose: ids.map((id, i) => ({ id, name: G.Moves.BY_ID[id].name, type: G.Moves.BY_ID[id].type, lvl: 3 + i, desc: G.Moves.BY_ID[id].desc })) }, () => {});`],
  ['scr-pause', `if (G.Game.state === 'ui') G.Flow.play(); G.UI.hideAll(); G.RunUI.showPause();`],
  ['scr-over', `if (G.Game.state === 'ui') G.Flow.play(); G.UI.hideAll(); G.RunUI.showOver({ dead: true, time: 1754, level: 37, kills: 12345, bosses: 6, coins: 1234,
    breakdown: 'Tiempo +600 · Derrotados +400 · Jefes +234', t1: 7, t10: 2, moves: ${MOVS}.slice(0, 4).map((id, i) => ({ id, name: G.Moves.BY_ID[id].name, lvl: 5 + i })),
    caught: [{ dex: 25, isNew: true }, { dex: 133, isNew: false }, { dex: 150, isNew: true }], record: true }, () => {});`]
];
const salirDePartida = `G.UI.hideAll(); if (G.Game.state !== 'ui') { G.Game.quit(); } G.Flow.goMenu();`;

/** Mide la pantalla abierta: desplazamiento horizontal, caja dentro de la ventana, el menú de detrás y la línea de créditos
 *  (fija abajo) encima de la caja (en el plegable tapaba el pie del gacha, la colección, las mejoras y las misiones). */
const MEDIR_PANTALLA = id => {
  const scr = document.getElementById(id), box = scr && scr.querySelector('.box');
  const W = innerWidth, de = document.documentElement;
  const menu = document.getElementById('scr-menu'), cl = document.getElementById('credits-line');
  const dimAbierta = !!document.querySelector('.scr.dim:not(.hidden)');
  const r = box ? box.getBoundingClientRect() : null;
  const clVisible = !!cl && !cl.classList.contains('hidden') && getComputedStyle(cl).display !== 'none' && getComputedStyle(cl).visibility !== 'hidden';
  const c = clVisible ? cl.getBoundingClientRect() : null;
  return {
    visible: !!scr && !scr.classList.contains('hidden'),
    pagina: de.scrollWidth - de.clientWidth, cuerpo: document.body.scrollWidth - W,
    pantalla: scr ? scr.scrollWidth - scr.clientWidth : 0, caja: box ? box.scrollWidth - box.clientWidth : 0,
    cajaFuera: r ? Math.max(0, -r.left, r.right - W) : 0,
    menuDetras: dimAbierta && !menu.classList.contains('hidden') && getComputedStyle(menu).visibility !== 'hidden',
    creditosPisan: !!(c && r && c.width > 0 && id !== 'scr-menu' && c.left < r.right - 0.5 && c.right > r.left + 0.5 && c.top < r.bottom - 0.5 && c.bottom > r.top + 0.5)
  };
};

/** ¿Lleva la pantalla la piel Dex? Borde de su caja (--color-bisel) y letra y fondo de un botón normal (M PLUS y
 *  --color-cristal-2). Si upstream renombra .box o .btn, la piel deja de aplicarse: esto lo ve. */
const PIEL = id => {
  const scr = document.getElementById(id), box = scr && scr.querySelector('.box');
  const ref = document.createElement('div');
  ref.style.cssText = 'position:absolute;visibility:hidden;border-top:1px solid var(--color-bisel);background:var(--color-cristal-2)';
  document.body.appendChild(ref);
  const bisel = getComputedStyle(ref).borderTopColor, cristal2 = getComputedStyle(ref).backgroundColor;
  ref.remove();
  const btn = scr && [...scr.querySelectorAll('.btn')].find(b => b.offsetParent !== null && !b.matches('.gold, .danger, .google, .ghost, :hover, :focus'));
  const bc = box && getComputedStyle(box), tc = btn && getComputedStyle(btn);
  return { fuenteCaja: bc ? bc.fontFamily : '', bordeCaja: bc ? bc.borderTopColor : '', bisel, boton: btn ? (btn.id || btn.textContent.trim().slice(0, 16)) : null,
    fuenteBoton: tc ? tc.fontFamily : '', fondoBoton: tc ? tc.backgroundColor : '', cristal2 };
};
const conPiel = p => /M PLUS Rounded 1c/.test(p.fuenteCaja) && p.bordeCaja === p.bisel && (!p.boton || (/M PLUS Rounded 1c/.test(p.fuenteBoton) && p.fondoBoton === p.cristal2));
const sinPiel = p => /Pixelify/.test(p.fuenteCaja) && p.bordeCaja !== p.bisel && (!p.boton || !/M PLUS/.test(p.fuenteBoton));

/** Ajustes > Acerca de: el centro del título (el Rotom-Dex de su ::before y el nombre) y el de «Versión 1.0», frente al de
 *  la caja. En Dex, una regla de css/portada.css que pesaba menos que el :is() del nombre lo dejaba a la izquierda, y
 *  «Versión», centrado en su ancho de lectura (65ch) pegado a la izquierda, quedaba 37 px a la izquierda del centro. */
const MEDIR_ACERCA = () => {
  const lg = document.querySelector('#set-body .about-logo'), ver = lg && lg.nextElementSibling;
  if (!lg || !ver) return null;
  const texto = n => { const r = document.createRange(); r.selectNodeContents(n); return r.getBoundingClientRect(); };
  const t = texto(lg), s = getComputedStyle(lg), b = getComputedStyle(lg, '::before');
  const icono = b.content && b.content !== 'none' && b.display !== 'none' ? parseFloat(b.width) + (parseFloat(s.columnGap) || 0) : 0;
  const sb = document.getElementById('set-body'), cs = getComputedStyle(sb), v = texto(ver);
  const titulo = (t.left - icono + t.right) / 2, version = (v.left + v.right) / 2;
  // El centro de lo que se ve del cuerpo de Ajustes, sin su barra de desplazamiento ni su relleno. clientWidth no lleva
  // la escala de la animación de entrada de la pantalla (a los 30 ms aún va por ×0,95) y getBoundingClientRect sí: k.
  const r = sb.getBoundingClientRect(), k = r.width / (sb.offsetWidth || 1);
  const caja = r.left + k * (sb.clientLeft + (parseFloat(cs.paddingLeft) + sb.clientWidth - parseFloat(cs.paddingRight)) / 2);
  return { titulo: Math.round(titulo), version: Math.round(version), caja: Math.round(caja),
    dif: Math.round(Math.max(Math.abs(titulo - caja), Math.abs(version - caja)) * 10) / 10 };
};

async function recorrerPantallas(P) {
  const { page, v } = P, malas = [], piel = [], acerca = [];
  for (const e of ESTILOS) {
    await estilo(page, e);
    for (const [id, abrir, cerrar, sub] of PANTALLAS) {
      await page.evaluate(abrir);
      await sleep(id === 'scr-gacha' || id === 'scr-dex' ? 120 : 30);
      const m = await page.evaluate(MEDIR_PANTALLA, id);
      const mal = !m.visible || m.pagina > 0 || m.cuerpo > 0 || m.pantalla > 1 || m.caja > 1 || m.cajaFuera > 1 || m.menuDetras || m.creditosPisan;
      if (mal) malas.push({ estilo: e, cual: id + (sub ? '/' + sub : ''), ...m });
      const p = await page.evaluate(PIEL, id);
      if (!(e === 'dex' ? conPiel(p) : sinPiel(p))) piel.push({ estilo: e, cual: id + (sub ? '/' + sub : ''), ...p });
      if (sub === 'about') { const a = await page.evaluate(MEDIR_ACERCA); if (!a || a.dif > 2) acerca.push({ estilo: e, ...a }); }
      if (cerrar) await page.evaluate(cerrar);
    }
    await page.evaluate(salirDePartida);
  }
  return { malas, piel, acerca };
}

/** Menú principal: las 9 opciones a la vista sin desplazar nada (ni la pantalla ni una caja), el logotipo libre
 *  de la barra superior y la línea de créditos sin pisar ninguna caja (lo que se ve de ella: el menú acaba por encima
 *  de la línea y, si no cabe, se desplaza por encima de ella). sobra: lo que habría que desplazar para verlo todo. */
const MEDIR_MENU = () => {
  const H = innerHeight, W = innerWidth, rr = el => el.getBoundingClientRect();
  const cruza = (a, b) => a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5;
  /** Lo que se ve de un elemento: su caja recortada por los contenedores que recortan (con desplazamiento). */
  const visto = el => {
    const r = rr(el); let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowY + ' ' + cs.overflowX)) { const q = rr(p); x0 = Math.max(x0, q.left); y0 = Math.max(y0, q.top); x1 = Math.min(x1, q.right); y1 = Math.min(y1, q.bottom); }
    }
    return { left: x0, top: y0, right: Math.max(x0, x1), bottom: Math.max(y0, y1) };
  };
  const visible = el => !!el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
  const items = [...document.querySelectorAll('#scr-menu .menu-item')];
  const mal = items.filter(it => {
    const r = rr(it);
    if (r.top < -0.5 || r.bottom > H + 0.5 || r.left < -0.5 || r.right > W + 0.5) return true;
    for (let p = it.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden)/.test(cs.overflowY + ' ' + cs.overflowX)) { const q = rr(p); if (r.top < q.top - 0.5 || r.bottom > q.bottom + 0.5) return true; }
    }
    return false;
  }).map(it => it.dataset.go);
  const scr = document.getElementById('scr-menu'), tb = document.getElementById('topbar'), cl = document.getElementById('credits-line');
  // El logotipo que se ve: con Dex, el de la «Tarjeta de entrenador» (css/portada.css); con Clásico, el del proyecto base.
  const logo = [document.querySelector('#tc-card .tc-title'), document.querySelector('#scr-menu .logo')].find(el => el && el.getClientRects().length > 0);
  const cajas = [...document.querySelectorAll('#scr-menu .menu-right > .box, #tc-card')].filter(visible), mr = document.querySelector('#scr-menu .menu-right');
  return { opciones: items.length, mal, desplazada: scr.scrollTop + mr.scrollTop, sobra: Math.max(scr.scrollHeight - scr.clientHeight, mr.scrollHeight - mr.clientHeight),
    logoTapado: visible(tb) && cruza(rr(tb), rr(logo)), creditosPisan: visible(cl) && cajas.some(b => cruza(visto(b), rr(cl))),
    logo: [Math.round(rr(logo).top), Math.round(rr(logo).bottom)], barra: visible(tb) ? [Math.round(rr(tb).top), Math.round(rr(tb).bottom)] : null };
};

/** Fin de partida: para cada desplazamiento de la caja, ¿qué paneles se ven enteros (dentro de la caja y de la
 *  ventana) sin «Volver al menú» encima? Un panel que nunca se ve entero es información perdida. */
const FIN_PANELES = () => {
  const box = document.querySelector('#scr-over > .box'), st = document.getElementById('over-stats'), btn = document.getElementById('btn-again');
  const paneles = [...st.children], visto = paneles.map(() => false), max = box.scrollHeight - box.clientHeight;
  for (let y = 0; y <= max + 8; y += 4) {
    box.scrollTop = y;
    const b = box.getBoundingClientRect(), k = btn.getBoundingClientRect();
    paneles.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      if (r.top >= b.top - 0.5 && r.bottom <= b.bottom + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5 && !(r.top < k.bottom - 1 && r.bottom > k.top + 1)) visto[i] = true;
    });
  }
  box.scrollTop = 0;
  const k = btn.getBoundingClientRect();
  return { paneles: paneles.length, nunca: paneles.filter((p, i) => !visto[i]).map(p => (p.innerText || '').trim().split('\n')[0].slice(0, 24)),
    boton: [Math.round(k.top), Math.round(k.bottom)], botonVisible: k.top >= 0 && k.bottom <= innerHeight + 0.5 && k.height >= 40, alto: innerHeight };
};

/** Capa «Probabilidades» (pantallas bajas): dentro de la ventana, la tabla debajo del título y de «Cerrar», que
 *  no la pisa y con su texto entero dentro del botón. */
const MEDIR_PROB = () => {
  const capa = document.getElementById('gacha-prob-capa'), h = capa.querySelector('h3'), b = capa.querySelector('button'), t = capa.querySelector('.rates');
  const rr = el => el.getBoundingClientRect(), cruza = (x, y) => x.left < y.right - 0.5 && x.right > y.left + 0.5 && x.top < y.bottom - 0.5 && x.bottom > y.top + 0.5;
  const rango = document.createRange(); rango.selectNodeContents(b);
  const tx = rango.getBoundingClientRect(), R = rr(capa), B = rr(b);
  return { abierta: !capa.classList.contains('hidden'), debajo: rr(t).top >= Math.max(rr(h).bottom, B.bottom) - 0.5, pisa: cruza(B, rr(t)),
    textoDentro: tx.left >= B.left - 0.5 && tx.right <= B.right + 0.5 && tx.top >= B.top - 0.5 && tx.bottom <= B.bottom + 0.5,
    filas: t.querySelectorAll('div').length, dentro: R.top >= -0.5 && R.bottom <= innerHeight + 0.5 && R.left >= -0.5 && R.right <= innerWidth + 0.5, cerrar: Math.round(B.width) };
};

/** Tira de pestañas del gacha (si no caben, se desplaza en horizontal): la elegida, entera y fuera del degradado del lado por el que
 *  hay más; las clases mas-izq / mas-der, de acuerdo con el desplazamiento. */
const MEDIR_TIRA = () => {
  const tira = document.getElementById('gacha-gens'), on = tira.querySelector('.gen-tab.on'), q = tira.getBoundingClientRect(), r = on.getBoundingClientRect();
  const max = tira.scrollWidth - tira.clientWidth, F = 36, izq = tira.classList.contains('mas-izq'), der = tira.classList.contains('mas-der');
  return { gen: on.dataset.gen, entera: r.left >= q.left + (izq ? F : 0) - 0.5 && r.right <= q.right - (der ? F : 0) + 0.5,
    clases: izq === (max > 1 && tira.scrollLeft > 1) && der === (max > 1 && tira.scrollLeft < max - 1), desborda: max > 1, desplazada: Math.round(tira.scrollLeft), max };
};

/** Un aviso de logro con el gacha abierto (pantallas bajas): ¿tapa algún botón de tirar o se queda su toque? */
const AVISO_GACHA = () => {
  let el = document.getElementById('ach-pop'), creado = false;
  if (!el) { el = document.createElement('div'); el.id = 'ach-pop'; el.className = 'box ach-pop'; document.body.appendChild(el); creado = true; }
  const antes = el.innerHTML, oculto = el.classList.contains('hidden');
  el.innerHTML = '<div><b>Logro de prueba</b><small>Un aviso cualquiera</small></div>';
  el.classList.remove('hidden');
  const r = el.getBoundingClientRect(), bs = ['pull-1', 'pull-10', 'pull-10b'].map(id => document.getElementById(id).getBoundingClientRect());
  const tapa = bs.some(b => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top);
  const b = bs[1], hit = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2);
  const res = { tapa, toque: !!(hit && hit.closest('#pull-10')), eventos: getComputedStyle(el).pointerEvents, aviso: [Math.round(r.top), Math.round(r.bottom)] };
  if (creado) el.remove(); else { el.innerHTML = antes; el.classList.toggle('hidden', oculto); }
  return res;
};

/** Las píldoras de tipo (G.UI.typeChips) de los 18 tipos: contraste de la letra con su fondo. */
const PILDORAS = () => {
  const rgb = s => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const lum = v => { const [r, g, b] = v.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const caja = document.createElement('div');
  caja.innerHTML = G.UI.typeChips(Object.keys(G.U.TYPE_COLOR));
  document.body.appendChild(caja);
  const r = [...caja.children].map(el => { const cs = getComputedStyle(el); return { tipo: el.textContent, ratio: +ratio(rgb(cs.color), rgb(cs.backgroundColor)).toFixed(2) }; });
  caja.remove();
  return r;
};

// ---------------- gacha ----------------
const MEDIR_GACHA = () => {
  const W = innerWidth, H = innerHeight, b = document.getElementById('banner').getBoundingClientRect();
  const box = document.querySelector('#scr-gacha > .box');
  const lienzos = [...document.querySelectorAll('#gacha-feat canvas')].map(c => {
    const r = c.getBoundingClientRect();
    return { dentroBanner: r.left >= b.left - 0.5 && r.right <= b.right + 0.5 && r.top >= b.top - 0.5 && r.bottom <= b.bottom + 0.5,
      dentroVentana: r.left >= -0.5 && r.right <= W + 0.5 && r.top >= -0.5 && r.bottom <= H + 0.5, altoCss: +r.height.toFixed(2), alto: c.height, anchoCss: +r.width.toFixed(2), ancho: c.width };
  });
  const botones = ['pull-1', 'pull-10', 'pull-10b'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.top >= 0 && r.bottom <= H + 0.5 && r.left >= 0 && r.right <= W + 0.5; });
  return { lienzos, botones, desplaza: box.scrollHeight - box.clientHeight, banner: [Math.round(b.width), Math.round(b.height)] };
};

/** [banner, destacados que pinta]: los 3 legendarios más fuertes de cada generación; en el Multiverso, sus personajes
 *  (hasta 3: js/data/multiverso.js). */
const DESTACADOS = `G.Gacha.BANNERS.map(b => [b.gen, G.Gacha.featured(b.gen).length || (G.MULTIVERSO && b.gen === G.MULTIVERSO.GEN ? G.MULTIVERSO.lista().slice(0, 3).length : 0)])`;

async function gachaBanners(P) {
  const { page } = P, malos = [], innerAlto = P.v.h, tiras = [];
  for (const e of ESTILOS) {
    await estilo(page, e);
    await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
    await sleep(350);   // la caja entra con una animación de escala (pop, 0,22 s)
    for (const [g, esperados] of await page.evaluate(DESTACADOS)) {
      await page.click(`#gacha-gens .gen-tab[data-gen="${g}"]`);
      await sleep(60);
      { const t = await page.evaluate(MEDIR_TIRA); if (!t.entera || !t.clases) tiras.push({ estilo: e, ...t }); }
      const m = await page.evaluate(MEDIR_GACHA);
      // En pantallas bajas cabe todo sin desplazar; con más alto (un plegable), las probabilidades van debajo y se llega desplazando.
      const ok = m.lienzos.length === esperados && m.lienzos.every(l => l.dentroBanner && l.dentroVentana && Math.abs(l.altoCss - l.alto) < 0.01 && Math.abs(l.anchoCss - l.ancho) < 0.01) &&
        m.botones.every(Boolean) && (m.desplaza <= 1 || innerAlto >= 520);
      if (!ok) malos.push({ estilo: e, banner: g, ...m });
    }
  }
  return { malos, tiras };
}

/** Tira por la interfaz real y mide el resultado. La animación de la tragaperras se salta (sólo en la prueba:
 *  la tirada ya está hecha cuando empieza); se ve entera en su captura. */
async function tirar(P, boton) {
  const { page } = P;
  await page.evaluate(() => { if (!G.Slots.__play) G.Slots.__play = G.Slots.play; G.Slots.play = () => Promise.resolve(); });
  await page.click('#' + boton);
  const t0 = Date.now();
  while (Date.now() - t0 < 20000) {
    if (await page.locator('#pull-close').isVisible().catch(() => false)) break;
    if (await page.locator('#slot').isVisible().catch(() => false)) await page.locator('#slot').click({ force: true }).catch(() => {});
    await sleep(150);
  }
  await sleep(450);   // que termine la entrada de las cartas
  const bordes = await page.evaluate(BORDES, '#pull-results .pcard > canvas');
  const r = await page.evaluate(() => {
    const fx = document.getElementById('pull-fx'), c = document.getElementById('pull-close').getBoundingClientRect(), H = innerHeight, W = innerWidth;
    const cartas = [...document.querySelectorAll('#pull-results .pcard')].map(k => k.getBoundingClientRect());
    const pisa = cartas.filter(r => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top).length;
    const lienzos = [...document.querySelectorAll('#pull-results .pcard > canvas')].map(k => ({ w: k.width, h: k.height, css: [k.getBoundingClientRect().width, k.getBoundingClientRect().height] }));
    return { cartas: cartas.length, desplaza: fx.scrollHeight - fx.clientHeight, continuarVisible: c.top >= 0 && c.bottom <= H + 0.5 && c.left >= 0 && c.right <= W + 0.5,
      pisa, fuera: cartas.filter(r => r.bottom > H + 0.5 || r.right > W + 0.5 || r.left < -0.5 || r.top < -0.5).length,
      lienzos: lienzos.slice(0, 2), escalaCss: lienzos.every(l => Math.abs(l.css[0] - l.w) < 0.01 && Math.abs(l.css[1] - l.h) < 0.01) };
  });
  await page.evaluate(() => { if (G.Slots.__play) G.Slots.play = G.Slots.__play; });
  r.premioCortado = bordes.filter(x => x.sinColocar || x.toca).map(x => ({ nombre: x.nombre, lienzo: x.lienzo, k: x.k, peor: x.peor }));
  r.premioK = bordes.map(x => x.k).join('');
  return r;
}

/** Una ×10 por la interfaz real con diez repetidos que desbloquean su evolución: las diez de nombre más largo (el
 *  peor caso de la etiqueta), una de cada tres en shiny. Sólo dentro de esa tirada, G.Gacha.pull devuelve ese guion
 *  (y se gasta su ticket); la carta, la etiqueta y el premio los pintan gacha-ui.js, mods.js y estilo.js de verdad.
 *  Mide que cada etiqueta está entera (sin recortar, dentro de su carta y con el nombre de la evolución) y que cada
 *  carta se llega a ver entera sin «Continuar» encima (en una pantalla baja, sin desplazar nada). */
async function tirarRepetidos(P) {
  const { page } = P;
  await page.evaluate(() => {
    if (!G.Slots.__play) G.Slots.__play = G.Slots.play;
    G.Slots.play = () => Promise.resolve();
    const largos = Object.keys(G.EVO).map(Number).filter(d => G.DEX_BY[d]).map(d => ({ d, e: G.EVO[d][0] })).filter(x => G.DEX_BY[x.e])
      .sort((a, b) => G.DEX_BY[b.e].name.length - G.DEX_BY[a.e].name.length || a.d - b.d).slice(0, 10);
    const pull = G.Gacha.pull;
    G.Gacha.pull = function (save, n) {
      G.Gacha.pull = pull;
      save.tickets.t1 -= n;
      return largos.slice(0, n).map((x, i) => ({ dex: x.d, rarity: G.DEX_BY[x.d].rarity || 3, shiny: i % 3 === 0 && G.Sprites.hasShiny(x.d) && G.Sprites.hasShiny(x.e), isNew: false, refund: 0, evo: x.e }));
    };
    window.__evos = largos.map(x => G.DEX_BY[x.e].name);
  });
  await page.click('#pull-10');
  for (let i = 0; i < 130 && !(await page.locator('#pull-close').isVisible().catch(() => false)); i++) await sleep(150);
  await sleep(500);
  const r = await page.evaluate(() => {
    const fx = document.getElementById('pull-fx'), close = document.getElementById('pull-close'), H = innerHeight, W = innerWidth;
    const cartas = [...document.querySelectorAll('#pull-results .pcard')];
    const etiquetas = cartas.map((k, i) => {
      const t = k.querySelector('.tag'), tr = t.getBoundingClientRect(), kr = k.getBoundingClientRect(), cs = getComputedStyle(t);
      return { nombre: window.__evos[i], texto: t.innerText.replace(/\s+/g, ' ').trim(), conNombre: t.innerText.replace(/\s+/g, ' ').includes(window.__evos[i]),
        recortada: t.scrollHeight > t.clientHeight + 1 || t.scrollWidth > t.clientWidth + 1 || tr.bottom > kr.bottom + 0.5 || tr.top < kr.top - 0.5 || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') };
    });
    const vista = cartas.map(() => false), max = fx.scrollHeight - fx.clientHeight;
    for (let y = 0; y <= max + 8; y += 4) {
      fx.scrollTop = y;
      const c = close.getBoundingClientRect();
      cartas.forEach((k, i) => { const q = k.getBoundingClientRect();
        if (q.top >= -0.5 && q.bottom <= H + 0.5 && q.left >= -0.5 && q.right <= W + 0.5 && !(q.left < c.right && q.right > c.left && q.top < c.bottom && q.bottom > c.top)) vista[i] = true; });
    }
    fx.scrollTop = 0;
    const filas = {};
    cartas.forEach(k => { const t = Math.round(k.getBoundingClientRect().top); filas[t] = (filas[t] || 0) + 1; });
    return { cartas: cartas.length, desplaza: max, filas: Object.values(filas).join('+'), nuncaEnteras: vista.filter(x => !x).length,
      malas: etiquetas.filter(x => !x.conNombre || x.recortada), ejemplo: etiquetas.slice(0, 2) };
  });
  await page.evaluate(() => { if (G.Slots.__play) G.Slots.play = G.Slots.__play; });
  return r;
}

// ---------------- píxeles opacos de los lienzos (que no se corte ningún sprite) ----------------
/* Para cada lienzo que anima G.Estilo (destacados, compañero, premio): dibuja cada fotograma de Idle y de
 * las animaciones de vida que deja en ese lienzo, con su colocación (k y pies) y la sombra, y mide la caja
 * de píxeles opacos: no puede tocar el borde. */
const BORDES = async sel => {
  const S = G.Sprites, PX = S.PX, cvs = [...document.querySelectorAll(sel)];
  for (let i = 0; i < 200 && cvs.some(c => !G.Estilo.colocacion(c)); i++) await new Promise(r => setTimeout(r, 50));
  const tmp = document.createElement('canvas'), ctx = tmp.getContext('2d', { willReadFrequently: true }), out = [];
  for (const c of cvs) {
    const e = G.Estilo.colocacion(c);
    if (!e) { out.push({ sinColocar: true }); continue; }
    tmp.width = c.width; tmp.height = c.height;
    await S.preload([e.dex], 15000, e.shiny);
    let peor = null, toca = 0, fotogramas = 0;
    for (const anim of ['Idle', ...e.vida]) {
      const m = S.animMeta(e.dex, anim, e.shiny);
      for (let f = 0; f < m.n; f++) {
        const a = new S.Animator(e.dex, 1, e.shiny);
        a.scale = e.k / PX; a.dir = e.dir; a.cur = anim; a.frame = f;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(e.fx, e.fy, 9 * e.k, 3.4 * e.k, 0, 0, 6.2832); ctx.fill();
        a.draw(ctx, e.fx, e.fy);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
        fotogramas++;
        if (x1 < 0) continue;
        const margen = Math.min(x0, y0, c.width - 1 - x1, c.height - 1 - y1);
        if (margen <= 0) toca++;
        if (!peor || margen < peor.margen) peor = { anim, f, margen, caja: [x0, y0, x1, y1] };
      }
    }
    out.push({ dex: e.dex, nombre: (G.DEX_BY[e.dex] || {}).name, lienzo: c.width + 'x' + c.height, k: e.k, vida: e.vida, fotogramas, toca, peor });
  }
  return out;
};
/** 30 fotogramas de verdad de los lienzos de `sel`: ¿toca algún píxel opaco el borde? */
const BORDES_VIVOS = async sel => {
  const cvs = [...document.querySelectorAll(sel)], res = cvs.map(() => ({ toca: 0, minMargen: 1e9, vacios: 0 }));
  for (let i = 0; i < 30; i++) {
    await new Promise(r => requestAnimationFrame(r));
    cvs.forEach((c, j) => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
      if (x1 < 0) { res[j].vacios++; return; }
      const mg = Math.min(x0, y0, c.width - 1 - x1, c.height - 1 - y1);
      if (mg <= 0) res[j].toca++;
      res[j].minMargen = Math.min(res[j].minMargen, mg);
    });
  }
  return res;
};

// ---------------- franja de tipo en las cartas de nivel ----------------
const FRANJAS = () => {
  const porTipo = {};
  for (const [id, m] of Object.entries(G.Moves.BY_ID)) if (!porTipo[m.type]) porTipo[m.type] = id;
  const cartas = Object.entries(porTipo).map(([tipo, id]) => ({ w: 10, type: 'new', key: 'new:' + id, icon: 'move:' + id, color: G.U.TYPE_COLOR[tipo],
    tag: G.U.TYPE_NAME[tipo], title: G.Moves.BY_ID[id].name, desc: G.Moves.BY_ID[id].desc, apply() {} }));
  G.RunUI.showLevelUp(7, cartas, () => {});
  const rgb = s => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const lum = v => { const [r, g, b] = v.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  return [...document.querySelectorAll('#cards .card')].map(el => {
    const be = getComputedStyle(el, '::before'), fondo = rgb(getComputedStyle(el).backgroundColor), franja = rgb(be.backgroundColor);
    const filo = /inset/.test(be.boxShadow) && /238, 246, 247/.test(be.boxShadow);
    const conFilo = filo ? ratio(franja.map((v, i) => Math.round(v * 0.65 + [238, 246, 247][i] * 0.35)), fondo) : 0;
    return { tipo: el.dataset.tipo, contenido: be.content, ancho: parseFloat(be.width), alto: Math.round(parseFloat(be.height)), cartaAlto: Math.round(el.getBoundingClientRect().height),
      contraste: +ratio(franja, fondo).toFixed(2), conFilo: +conFilo.toFixed(2), tabindex: el.tabIndex, role: el.getAttribute('role') };
  });
};

// ---------------- teclado: Tab y el anillo de foco ----------------
async function tabula(page, n, sel) {
  const vistos = [];
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(s => {
      const a = document.activeElement;
      if (!a || !a.matches(s)) return null;
      const cs = getComputedStyle(a);
      return { que: (a.textContent || '').trim().slice(0, 24), anillo: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 ? cs.outlineColor : null };
    }, sel);
    if (f) vistos.push(f);
  }
  return vistos;
}

// ---------------- HUD Dex en partida (lote 2) ----------------
/** Escena de prueba en la partida real (sólo en la prueba): un jefe a la vista, su aviso, lluvia, mejoras, objeto,
 *  cuatro ataques y, si se pide, tres compañeros simulados (cambiando G.Coop sólo mientras se pinta el HUD). */
const ESCENA_HUD = op => {
  const pl = G.Game.player, W = innerWidth, H = innerHeight, cam = G.Camera;
  for (const x of document.querySelectorAll('.ach-pop, .toast')) x.remove();
  if (op.jefe !== false && !G.EnemyMgr.all().some(e => e.boss && !e.dead)) {
    // A la vista, en la zona libre (sin flecha): a la derecha y algo abajo de tu Pokémon.
    const b = new G.Enemy({ dex: 983, hp: 5000, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, pl.x + (op.jefeX || 0.18) * W / cam.scale, pl.y + 0.12 * H / cam.scale, { hp: 1, spd: 1, dmg: 1 }, true);
    b.hp = b.maxHp * 0.64; b.spd = 0; G.EnemyMgr.add(b);
  }
  if (op.lluvia !== false) G.Weather.onEvent(['w', 'rain', 90]);
  pl.buffs.atk.n = 2; pl.buffs.spd.n = 1;
  for (const id of Object.keys(G.Moves.BY_ID).filter(id => !pl.hasMove(id)).slice(0, Math.max(0, 4 - pl.slots.length))) pl.addMove(id);
  pl.item = Object.keys(G.Items.BY)[0];
  G.Coop.local && (G.Coop.local.hurt = function () {});
  pl.hurt = function () {};
  if (op.aviso !== false) G.Spawner.say('¡Kingambit salvaje apareció!', 600, true);
  if (op.companeros && !window.__hudCoop) {
    const mk = (name, color, dx, dy, dead) => ({ name, color, connected: true, pl: { x: pl.x + dx, y: pl.y + dy, hp: 50, maxHp: 80, dead: !!dead, bodyH: 30 } });
    const mates = [mk('Ana', '#5FC8FF', -1800, 200, true), mk('Leo', '#7EE07A', 60, 40), mk('Sol', '#FF8AD8', 300, 2200)];
    const orig = G.HUD.draw, C = G.Coop;
    window.__hudCoop = { orig, mates };
    G.HUD.draw = function (ctx, w, h, p, st) {
      const dA = Object.getOwnPropertyDescriptor(C, 'active'), dM = Object.getOwnPropertyDescriptor(C, 'mates'), pP = C.players;
      Object.defineProperty(C, 'active', { get: () => true, configurable: true });
      Object.defineProperty(C, 'mates', { get: () => mates, configurable: true });
      C.players = () => [p, ...mates.map(m => m.pl)];
      try { return orig.call(this, ctx, w, h, p, st); } finally { Object.defineProperty(C, 'active', dA); Object.defineProperty(C, 'mates', dM); C.players = pP; }
    };
  }
};
/** El HUD Dex pintado en un lienzo transparente aparte (sin mundo, dpr 1): la fila opaca más baja de la mitad de arriba
 *  (sin las columnas laterales) y las bandas que dice G.HudDex.bandas(). */
const BANDA_PIXELES = async () => {
  const W = innerWidth, H = innerHeight, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), pl = G.Game.player, st = { time: 100 };
  G.HudDex.draw(ctx, W, H, pl, st);
  await new Promise(r => setTimeout(r, 300));
  ctx.clearRect(0, 0, W, H);
  G.HudDex.draw(ctx, W, H, pl, st);
  const B = G.HudDex.bandas(), d = ctx.getImageData(0, 0, W, H).data;
  let fila = -1;
  for (let y = Math.floor(H / 2) - 1; y >= 0 && fila < 0; y--) {
    for (let x = Math.ceil(B.izq); x < W - B.der; x++) if (d[(y * W + x) * 4 + 3] > 8) { fila = y; break; }
  }
  return { sup: B.sup, inf: B.inf, izq: B.izq, der: B.der, variante: B.variante, escala: B.escala, filaOpaca: fila + 1, flechas: B.flechas.length };
};
/** Contraste de cada texto del HUD en los píxeles de verdad del lienzo del juego: color del texto frente a la mediana de
 *  lo que hay en su caja y no es texto (el panel, o el contorno si va suelto). Devuelve las razones. */
const CONTRASTE_PIXELES = async () => {
  const cv = document.getElementById('game'), ctx = cv.getContext('2d'), textos = [];
  const orig = G.HUD.draw;
  G.HUD.draw = function (c, w, h, p, st) {
    const ft = c.fillText;
    c.fillText = function (t, x, y) {
      const m = c.getTransform(), tam = +(/(\d+)px/.exec(c.font) || [0, 11])[1], wd = c.measureText(t).width;
      const al = c.textAlign, x0 = al === 'center' ? x - wd / 2 : al === 'right' ? x - wd : x;
      if (/\p{L}|\d/u.test(t) && c.globalAlpha > 0.95) textos.push({ t, col: String(c.fillStyle), x0: m.a * x0 + m.e, y0: m.d * (y - tam * 0.75) + m.f, x1: m.a * (x0 + wd) + m.e, y1: m.d * (y + tam * 0.1) + m.f });
      return ft.call(this, t, x, y);
    };
    try { return orig.call(this, c, w, h, p, st); } finally { delete c.fillText; }
  };
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  G.HUD.draw = orig;
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const rgb = s => { const p = document.createElement('canvas').getContext('2d'); p.fillStyle = s; const v = p.fillStyle; if (v[0] === '#') { const n = parseInt(v.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; } return (/\(([^)]+)\)/.exec(v) || [0, '0,0,0'])[1].split(',').slice(0, 3).map(Number); };
  const out = [];
  for (const T of textos) {
    const x = Math.max(0, Math.floor(T.x0)), y = Math.max(0, Math.floor(T.y0)), w = Math.min(cv.width - x, Math.ceil(T.x1 - T.x0)), h = Math.min(cv.height - y, Math.ceil(T.y1 - T.y0));
    if (w < 2 || h < 2) continue;
    const d = ctx.getImageData(x, y, w, h).data, c = rgb(T.col), lc = lum(c), fondo = [];
    for (let i = 0; i < d.length; i += 4) {
      const dist = Math.abs(d[i] - c[0]) + Math.abs(d[i + 1] - c[1]) + Math.abs(d[i + 2] - c[2]);
      if (dist > 90) fondo.push(lum([d[i], d[i + 1], d[i + 2]]));
    }
    if (fondo.length < 4) continue;
    fondo.sort((a, b) => a - b);
    const lf = fondo[Math.floor(fondo.length / 2)];
    out.push({ t: T.t, r: +((Math.max(lc, lf) + 0.05) / (Math.min(lc, lf) + 0.05)).toFixed(2) });
  }
  return out;
};
/** Con la letra de verdad: el sensor de Rotom con cada bioma y cada arena (con y sin clima) y la pista de controles del
 *  principio, pintados en un lienzo aparte. Devuelve los textos recortados con «…» o con «Grieta · » en Rotom, y la pista. */
const TEXTOS_ENTEROS = async () => {
  const W = innerWidth, H = innerHeight, pl = G.Game.player, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), textos = [], ft = ctx.fillText;
  ctx.fillText = function (t, x, y) { const m = ctx.getTransform(); textos.push({ t: String(t), x: m.a * x + m.e, y: m.d * y + m.f }); return ft.call(this, t, x, y); };
  const dentro = (o, R) => R && o.x >= R.x - 1 && o.x <= R.x + R.w + 1 && o.y >= R.y - 1 && o.y <= R.y + R.h + 1;
  const bn = G.World.biomeName, dW = Object.getOwnPropertyDescriptor(G.Weather, 'current'), ban = G.Spawner.banner;
  const lluvia = { name: 'Lluvia', icon: 'wrain', left: 67, mult: { water: 1.5, fire: 0.5 }, kind: 'rain' };
  const malos = [];
  let n = 0;
  try {
    for (const clima of [null, lluvia]) {
      Object.defineProperty(G.Weather, 'current', { get: () => clima, configurable: true });
      for (const b of G.Tiles.BIOMES) {
        G.World.biomeName = () => b.name;
        textos.length = 0;
        G.HudDex.draw(ctx, W, H, pl, { time: 100 });
        const B = G.HudDex.bandas(), R = B.piezas.rotom;
        if (R.modo === 'cara') continue;
        const tx = textos.filter(o => dentro(o, R)).map(o => o.t), limpio = b.name.replace(/^Grieta · /, '');
        const debe = !clima || B.variante !== 'compacto';
        if (tx.some(x => /…/.test(x) || /^Grieta ·/.test(x)) || (debe && !tx.join(' ').includes(limpio))) malos.push({ clima: !!clima, nombre: b.name, tx });
        n++;
      }
    }
  } finally { G.World.biomeName = bn; Object.defineProperty(G.Weather, 'current', dW); }
  // La pista de controles (los primeros 14 s, con la ranura de avisos libre).
  let pista = null;
  try {
    G.Spawner.banner = () => null;
    G.HudDex.Avisos.reiniciar();
    G.HudDex.draw(ctx, W, H, pl, { time: 3 });
    await new Promise(r => setTimeout(r, 350));
    textos.length = 0;
    G.HudDex.draw(ctx, W, H, pl, { time: 3.4 });
    const v = G.HudDex.Avisos.visible, A = G.HudDex.bandas().piezas.aviso;
    const tx = textos.filter(o => dentro(o, A)).map(o => o.t);
    pista = { tx, variantes: v && v.variantes, larga: !!(v && v.variantes && tx[0] === v.variantes[0]) };
  } finally { G.Spawner.banner = ban; G.HudDex.Avisos.reiniciar(); }
  return { n, malos, pista };
};
/** Las flechas del mismo cuadrante: el jefe y los tres compañeros simulados (ESCENA_HUD con compañeros) arriba a la
 *  derecha y lejos; el HUD pintado en un lienzo aparte con la letra de verdad, apuntando cada etiqueta. Devuelve los
 *  problemas: flechas o etiquetas que se pisan, o etiquetas fuera de la zona libre o de la pantalla. */
const FLECHAS_CUADRANTE = () => {
  const pl = G.Game.player, cam = G.Camera, W = innerWidth, H = innerHeight, k = 1 / cam.scale;
  for (const e of G.EnemyMgr.all()) if (e.boss && !e.dead) { e.x = pl.x + 1.4 * W * k; e.y = pl.y - 0.9 * H * k; }
  const m = window.__hudCoop && window.__hudCoop.mates;
  if (m) [[2.0, -0.4], [0.9, -1.5], [2.5, -1.1]].forEach(([dx, dy], i) => { m[i].pl.x = pl.x + dx * W * k; m[i].pl.y = pl.y + dy * H * k; });
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), ft = ctx.fillText, textos = [];
  ctx.fillText = function (t, x, y) {
    const tm = ctx.getTransform(), w = ctx.measureText(t).width, al = ctx.textAlign, x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    const tam = +(/(\d+)px/.exec(ctx.font) || [0, 11])[1];
    textos.push({ t: String(t), x: tm.a * x0 + tm.e, y: tm.d * (y - tam * 0.75) + tm.f, w, h: tam * 0.95 });
    return ft.call(this, t, x, y);
  };
  G.HUD.draw(ctx, W, H, pl, G.Game.st);
  const B = G.HudDex.bandas(), Z = B.zona, F = B.flechas;
  const cruzan = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const et = textos.filter(o => /· \d+ m$/.test(o.t)), mal = [];
  for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) if (F[i].cajas.some(a => F[j].cajas.some(b => cruzan(a, b)))) mal.push(F[i].tipo + '/' + F[j].tipo);
  for (let i = 0; i < et.length; i++) for (let j = i + 1; j < et.length; j++) if (cruzan(et[i], et[j])) mal.push('«' + et[i].t + '» y «' + et[j].t + '»');
  for (const o of et) if (o.x < Z.x - 0.5 || o.y < Z.y - 0.5 || o.x + o.w > Z.x + Z.w + 0.5 || o.y + o.h > Z.y + Z.h + 0.5) mal.push('«' + o.t + '» fuera de la zona libre');
  return { flechas: F.length, tipos: F.map(f => f.tipo), etiquetas: et.map(o => ({ t: o.t, x: Math.round(o.x), y: Math.round(o.y), w: Math.round(o.w) })), zona: Z, mal };
};
/** Un aviso de logro (el elemento de progress.js) en plena partida: dónde sale con el HUD Dex. */
const LOGRO = () => {
  let el = document.getElementById('ach-pop');
  if (!el) { el = document.createElement('div'); el.id = 'ach-pop'; el.className = 'box ach-pop'; document.body.appendChild(el); }
  el.innerHTML = '<div><b>¡Logro: Prueba!</b><small>Nuevo título: Prueba</small></div>';
  el.classList.remove('hidden');
  G.MODS.avisoEnEspera(() => {});
  const r = el.getBoundingClientRect(), B = G.HudDex.bandas();
  const out = { top: Math.round(r.top), bottom: Math.round(r.bottom), sup: Math.round(B.juego.y + B.sup), alto: innerHeight, estado: G.Game.state, clase: document.documentElement.classList.contains('hud-dex-logro') };
  el.remove();
  return out;
};
const percentil = (v, p) => { const s = v.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; };
const VP_HUD = {
  pc: VP.pc, movil: VP.movil, movilBajo: VP.movilBajo, pleg1: VP.pleg1, pleg2: VP.pleg2, exterior: VP.exterior,
  mesa: { w: 784, h: 362, dpr: 3, tactil: true },      // el Magic V6 a medio plegar en modo mesa: la mitad de arriba
  tab: VP.tab
};

async function pruebaHud(browser) {
  for (const [clave, v] of Object.entries(VP_HUD)) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: HUD: se entra a jugar`, false); await P.ctx.close(); continue; }
    await page.evaluate(() => { G.Estilo.set('dex'); G.Flow.play(); });
    await sleep(1200);
    // El aviso de logro que salió en el menú («Primer compañero», del invitado nuevo) baja al empezar la partida.
    const logroMenu = await page.evaluate(() => {
      const el = document.getElementById('ach-pop');
      if (!el || el.classList.contains('hidden')) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), sup: Math.round(G.HudDex.bandaSup()), alto: innerHeight, texto: el.textContent.trim().slice(0, 40) };
    });
    await page.evaluate(ESCENA_HUD, {});
    await sleep(2200);    // que se vaya la píldora del ataque y se horneen los sprites
    // La banda superior medida en píxeles (HUD sin mundo) es la que dice el HUD (y check.js).
    const b = await page.evaluate(BANDA_PIXELES);
    report.medidas['hud-' + nv] = b;
    const compacto = b.variante === 'compacto';
    check(`${nv}: HUD Dex (${b.variante}, ×${b.escala}): la banda de arriba medida en píxeles con el HUD en un lienzo aparte (${b.filaOpaca} px) es la de G.HudDex.bandas() (${b.sup})${compacto && v.h < 520 ? ', ≤ 20 % del alto (criterio de Nico)' : ''}`,
      b.flechas === 0 && Math.abs(b.filaOpaca - b.sup) <= 1 && (!compacto || v.h >= 520 || (b.sup + b.inf) / v.h <= 0.2), b);
    // Con la letra de verdad: ningún nombre de bioma o de arena recortado en Rotom y la pista de controles entera.
    const te = await page.evaluate(TEXTOS_ENTEROS);
    report.medidas['hud-textos-' + nv] = te;
    check(`${nv}: con la letra de verdad, el sensor de Rotom enseña entero cada bioma y cada arena (${te.n} casos, con y sin lluvia; sin «Grieta · » ni «…») y la pista de controles del principio sale entera${clave === 'pc' ? ' (la larga)' : ''}: «${te.pista && te.pista.tx[0]}»`,
      te.n >= 40 && !te.malos.length && te.pista && te.pista.tx.length === 1 && te.pista.variantes.includes(te.pista.tx[0]) && !/…/.test(te.pista.tx[0]) && (clave !== 'pc' || te.pista.larga),
      { malos: te.malos.slice(0, 5), pista: te.pista });
    await sleep(700);    // la ranura de avisos vuelve a enseñar el del jefe (se ha vaciado para mirar la pista)
    // El aviso de logro en partida: bajo la banda de arriba del HUD (en pantallas bajas, abajo, como upstream).
    if (['pc', 'tab', 'movil', 'pleg2'].includes(clave)) {
      const lg = await page.evaluate(LOGRO);
      report.medidas['hud-logro-' + nv] = lg;
      const bajo = v.h < 521;
      const menuOk = !logroMenu || (bajo ? logroMenu.bottom >= logroMenu.alto - 30 : logroMenu.top >= logroMenu.sup + 8 - 3);
      report.medidas['hud-logro-menu-' + nv] = logroMenu;
      check(`${nv}: un aviso de logro en partida con el HUD Dex sale ${bajo ? 'abajo (pantalla baja, como upstream)' : `bajo la banda de arriba del HUD (${lg.top} px ≥ ${lg.sup} + 8)`} y no tapa la ranura de avisos ni la entrada del jefe; ${logroMenu ? `el que salió en el menú («${logroMenu.texto}») también, al empezar la partida (${logroMenu.top} px)` : 'no quedaba ninguno del menú'}`,
        lg.estado === 'playing' && lg.clase && (bajo ? lg.bottom >= lg.alto - 30 && lg.top > lg.sup : lg.top >= lg.sup + 8 - 3) && menuOk, { lg, logroMenu });
    }
    // El plegable abierto: nada del HUD sobre el pliegue (por si está a medio plegar).
    if (clave === 'pleg1' || clave === 'pleg2') {
      const pg = await page.evaluate(() => {
        const B = G.HudDex.bandas(), P = B.piezas, g = B.pliegue, L = [];
        for (const k of ['ficha', 'contador', 'rotom', 'pausa', 'jefe', 'aviso', 'objeto', 'vinculo']) if (P[k]) L.push({ n: k, ...P[k] });
        ['ranuras', 'chips', 'companeros'].forEach(k => (P[k] || []).forEach((r, i) => L.push({ n: k + i, ...r })));
        const pisa = g ? L.filter(p => g.eje === 'x' ? p.x < g.pos + g.ancho / 2 && p.x + p.w > g.pos - g.ancho / 2 : p.y < g.pos + g.ancho / 2 && p.y + p.h > g.pos - g.ancho / 2).map(p => p.n) : null;
        return { pliegue: g, pisa };
      });
      report.medidas['hud-pliegue-' + nv] = pg;
      check(`${nv}: plegable abierto: ninguna pieza del HUD Dex (contador, jefe, aviso, ranuras, objeto…) pisa la franja del pliegue (${pg.pliegue ? `${pg.pliegue.eje === 'x' ? 'vertical en x' : 'horizontal en y'} = ${pg.pliegue.pos}` : 'sin pliegue'})`,
        pg.pliegue && !pg.pisa.length, pg);
    }
    // Pares Dex/Clásico del mismo momento (bosque, jefe con su aviso y lluvia).
    await captura(page, `hud-jefe-dex-${nv}`);
    await estilo(page, 'clasico');
    await sleep(250);
    await captura(page, `hud-jefe-clasico-${nv}`);
    await estilo(page, 'dex');
    if (v.tactil && clave === 'movil') {
      // Tocar la ranura 2 la activa; tocar la pausa pausa (con el dedo, por la interfaz real).
      const antes = await page.evaluate(() => { G.Game.player.setActive(0); return G.Game.player.active; });
      await sleep(100);
      const r2 = await page.evaluate(() => { const R = G.HudDex.bandas().piezas.ranuras[1]; return { x: R.x + R.w / 2, y: R.y + R.h / 2, w: R.w }; });
      await page.touchscreen.tap(r2.x, r2.y);
      await sleep(150);
      const despues = await page.evaluate(() => G.Game.player.active);
      const pz = await page.evaluate(() => { const R = G.HudDex.bandas().piezas.pausa; return R && { x: R.x + R.w / 2, y: R.y + R.h / 2, w: R.w, h: R.h }; });
      if (pz) await page.touchscreen.tap(pz.x, pz.y);
      await sleep(250);
      const estado = await page.evaluate(() => G.Game.state);
      check(`${nv}: tocar la ranura 2 del HUD Dex la activa (columna a la derecha, ${r2.w} px) y el botón de pausa (${pz && pz.w}x${pz && pz.h}) pausa`,
        antes === 0 && despues === 1 && pz && pz.w >= 44 && estado === 'paused', { antes, despues, pz, estado });
      await page.evaluate(() => { if (G.Game.state === 'paused') G.Game.togglePause(); G.UI.hideAll(); });
      await sleep(200);
    }
    if (clave === 'pc' || clave === 'movil') {
      // Contraste en píxeles reales, en los tres biomas, una arena y con lluvia.
      const res = {};
      for (const [n, fn] of [['bosque', 'G.Weather.onEvent(["w"]); G.World.setBiome(0, true)'], ['cueva', 'G.World.setBiome(1, true)'], ['volcan', 'G.World.setBiome(2, true)'],
        ['arena', 'G.World.setBiome(G.Tiles.arenaBiome("fire"), true)'], ['lluvia', 'G.World.setBiome(0, true); G.Weather.onEvent(["w", "rain", 90])']]) {
        await page.evaluate(fn);
        await sleep(n === 'lluvia' ? 3400 : 700);
        const r = (await page.evaluate(CONTRASTE_PIXELES)).map(x => x.r);
        res[n] = { textos: r.length, p10: percentil(r, 0.1), mediana: percentil(r, 0.5) };
        if (n === 'lluvia' || n === 'volcan') await captura(page, `hud-${n}-dex-${nv}`);
      }
      report.medidas['hud-contraste-' + nv] = res;
      check(`${nv}: contraste de los textos del HUD Dex en píxeles reales (bosque, cueva, volcán, arena y lluvia): p10 ≥ 3:1 y mediana ≥ 4,5:1`,
        Object.values(res).every(x => x.textos >= 10 && x.p10 >= 3 && x.mediana >= 4.5), res);
    }
    if (clave === 'pc') {
      // Rendimiento: G.HUD.draw, de media por fotograma, con el HUD Dex y con el de upstream (Clásico) en la misma escena.
      // En este Chromium de la prueba (sin pantalla) el de upstream ya ronda los 0,3 ms: se exige que el Dex no cueste
      // más de 0,3 ms por encima de él, y se apuntan los dos.
      const mide = e => page.evaluate(async est => {
        G.Estilo.set(est);
        const orig = G.HUD.draw, t = [];
        G.HUD.draw = function (...a) { const t0 = performance.now(); const r = orig.apply(this, a); t.push(performance.now() - t0); return r; };
        await new Promise(r => setTimeout(r, 2500));
        G.HUD.draw = orig;
        t.sort((a, b) => a - b);
        return { n: t.length, media: +(t.reduce((s, x) => s + x, 0) / t.length).toFixed(3), p95: +t[Math.floor(t.length * 0.95)].toFixed(3) };
      }, e);
      const msC = await mide('clasico'), ms = await mide('dex');
      report.medidas['hud-ms-' + nv] = { dex: ms, clasico: msC };
      check(`${nv}: el HUD Dex cuesta de media ${ms.media} ms por fotograma (p95 ${ms.p95}) y el de upstream ${msC.media} ms en la misma escena: como mucho 0,3 ms más`,
        ms.n > 60 && msC.n > 60 && ms.media <= msC.media + 0.3, { dex: ms, clasico: msC });
    }
    if (clave === 'pc' || clave === 'movil' || clave === 'pleg2' || clave === 'tab') {
      // Cuatro jugadores (tres compañeros simulados en el HUD: uno caído y lejos, otro a la vista y otro lejos) y el jefe lejos.
      await page.evaluate(() => { for (const e of G.EnemyMgr.all()) if (e.boss) { e.x += 3000; e.y -= 400; } });
      await page.evaluate(ESCENA_HUD, { companeros: true, jefe: false, aviso: false });
      await sleep(600);
      if (clave !== 'tab') await captura(page, `hud-4-jugadores-dex-${nv}`);
      // Flechas del mismo cuadrante (el jefe y los tres compañeros, arriba a la derecha y lejos) con la letra de verdad:
      // ni las flechas ni sus etiquetas se pisan, y cada etiqueta, entera dentro de la zona libre.
      const fq = await page.evaluate(FLECHAS_CUADRANTE);
      report.medidas['hud-flechas-' + nv] = fq;
      await sleep(300);
      await captura(page, `hud-flechas-dex-${nv}`);
      check(`${nv}: flechas del mismo cuadrante (jefe, compañero caído y dos compañeros, arriba a la derecha) con la letra de verdad: ${fq.flechas} flechas y ${fq.etiquetas.length} etiquetas, sin pisarse y enteras dentro de la zona libre`,
        fq.flechas === 4 && fq.etiquetas.length === 4 && !fq.mal.length, fq);
      await page.evaluate(() => { const m = window.__hudCoop && window.__hudCoop.mates, pl = G.Game.player; if (m) { [[-1800, 200], [60, 40], [300, 2200]].forEach(([dx, dy], i) => { m[i].pl.x = pl.x + dx; m[i].pl.y = pl.y + dy; }); } });
      // Movimiento reducido: con PS bajos, un compañero caído, flechas y la grieta, dos fotogramas a 400 ms son iguales.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => { if (G.Game.state === 'playing') G.Game.togglePause(); });
      const igual = await page.evaluate(async () => {
        const pl = G.Game.player, W = innerWidth, H = innerHeight, st = G.Game.st;
        pl.hp = pl.maxHp * 0.12;
        const pinta = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; G.HUD.draw(cv.getContext('2d'), W, H, pl, st); return cv.getContext('2d').getImageData(0, 0, W, H).data; };
        pinta(); await new Promise(r => setTimeout(r, 300));
        const a = pinta(); await new Promise(r => setTimeout(r, 400));
        const b = pinta();
        let dif = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) dif++;
        return { dif, flechas: G.HudDex.bandas().flechas.map(f => f.tipo) };
      });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(() => { if (G.Game.state === 'paused') G.Game.togglePause(); G.UI.hideAll(); });
      check(`${nv}: con movimiento reducido nada parpadea ni late en el HUD Dex (PS bajos, compañero caído y flechas: dos fotogramas a 400 ms, idénticos)`,
        igual.dif === 0 && igual.flechas.includes('caido'), igual);
    }
    check(`${nv}: HUD Dex: consola sin errores ni avisos`, !P.consola.length, P.consola.slice(0, 5));
    await P.ctx.close();
  }
}

// ---------------- 11. Arreglos de la verificación de los lotes 1 y 2 ----------------
/** Zonas seguras simuladas: Playwright no emula env(safe-area-inset-*), así que en lo que se sirve (las hojas de estilo,
 *  los scripts y la página) cada env(safe-area-inset-X) pasa a los píxeles de `s` ({sup, der, inf, izq}). Sólo en la
 *  prueba: así se ven las reglas que los usan (gacha y tiradas en pantallas bajas) y lo que lee G.Estilo.zonasSeguras(). */
async function simularSeguras(ctx, s) {
  const px = { top: s.sup, right: s.der, bottom: s.inf, left: s.izq };
  await ctx.route(/\/(css\/[^?]+\.css|js\/[^?]+\.js|index\.html|dev\.html)(\?.*)?$/, async route => {
    const r = await route.fetch();
    const body = (await r.text()).replace(/env\(\s*safe-area-inset-(top|right|bottom|left)\s*(?:,[^)]*)?\)/g, (_, k) => px[k] + 'px');
    await route.fulfill({ response: r, body });
  });
}
/** ¿Está el rectángulo r dentro de la ventana menos las zonas seguras s? */
const dentroSeguro = (r, s, W, H) => r.left >= s.izq - 0.5 && r.top >= s.sup - 0.5 && r.right <= W - s.der + 0.5 && r.bottom <= H - s.inf + 0.5;
/** El Magic V6 con la barra del navegador (la ventana, más baja que la pantalla; tamaños estimados por Nico). */
const VP_BARRA = {
  v740: { w: 724, h: 740, dpr: 3, tactil: true, pantalla: [724, 784] }, v700: { w: 724, h: 700, dpr: 3, tactil: true, pantalla: [724, 784] },
  v680: { w: 724, h: 680, dpr: 3, tactil: true, pantalla: [724, 784] }, v660: { w: 724, h: 660, dpr: 3, tactil: true, pantalla: [724, 784] },
  v640: { w: 724, h: 640, dpr: 3, tactil: true, pantalla: [724, 784] }, g700: { w: 784, h: 700, dpr: 3, tactil: true, pantalla: [784, 724] },
  g680: { w: 784, h: 680, dpr: 3, tactil: true, pantalla: [784, 724] }, g640: { w: 784, h: 640, dpr: 3, tactil: true, pantalla: [784, 724] }
};
/** La barra superior: dentro de la ventana, sin partirse en dos filas (con 480 px de ancho o más) y sin tapar el logotipo. */
const MEDIR_BARRA = () => {
  const ve = el => !!el && el.getClientRects().length > 0;
  const tb = document.getElementById('topbar'), q = tb.getBoundingClientRect();
  const logo = [document.querySelector('#tc-card .tc-title'), document.querySelector('#scr-menu .logo')].find(ve).getBoundingClientRect();
  const hijos = [...tb.children].filter(c => c.offsetParent !== null).map(c => c.getBoundingClientRect());
  const filas = [];
  for (const r of hijos) { const c = (r.top + r.bottom) / 2; if (!filas.some(f => Math.abs(f - c) < 12)) filas.push(c); }
  return { barra: [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)], filas: filas.length,
    fuera: hijos.filter(r => r.left < -0.5 || r.right > innerWidth + 0.5 || r.top < -0.5).length,
    logoTapado: q.bottom > logo.top + 0.5 && q.top < logo.bottom && q.left < logo.right && q.right > logo.left, pagina: document.documentElement.scrollWidth - innerWidth };
};
/** «…» con la letra del lienzo en Dex: sus puntos, en la línea base (como el de «.»), no a media altura (M PLUS); y las
 *  caras de M PLUS de la página (DOM y lienzo), sin U+2026 en su unicode-range. */
const PUNTOS = () => {
  const cv = document.createElement('canvas'); cv.width = 200; cv.height = 100;
  const c = cv.getContext('2d', { willReadFrequently: true });
  const tinta = t => {
    c.clearRect(0, 0, 200, 100); c.font = '700 48px Pixelify, "Segoe UI", sans-serif'; c.fillStyle = '#000'; c.textBaseline = 'alphabetic'; c.fillText(t, 20, 70);
    const d = c.getImageData(0, 0, 200, 100).data; let y0 = 100, y1 = -1;
    for (let y = 0; y < 100; y++) for (let x = 0; x < 200; x++) if (d[(y * 200 + x) * 4 + 3] > 40) { if (y < y0) y0 = y; y1 = y; }
    return { arriba: y0, abajo: y1, fuente: c.font };
  };
  const caras = [...document.fonts].filter(f => /M PLUS/.test(f.family)).map(f => f.unicodeRange);
  return { elipsis: tinta('…'), punto: tinta('.'), caras };
};
/** El aviso flotante (toast) al empezar la partida: ¿pisa la fila de ranuras? Clásico: la de upstream (54 px a 18 del
 *  borde, la activa 6 más arriba y su nombre encima: hasta unos 94 px); Dex: la banda de abajo del HUD Dex. */
const TOAST_PARTIDA = () => {
  const t = document.querySelector('.toast'), r = t.getBoundingClientRect(), H = innerHeight;
  const dex = G.Estilo.actual === 'dex', inf = dex ? G.HudDex.bandaInf() : 94;
  return { estado: G.Game.state, estilo: G.Estilo.actual, toast: [Math.round(r.top), Math.round(r.bottom)], limite: Math.round(H - inf), visible: getComputedStyle(t).display !== 'none',
    pisa: r.bottom > H - inf + 0.5 };
};

/** Tiradas ×1, ×10 y la ×10 de repetidos en los dos estilos (como en la sección 2, para las pantallas de la sección 11). */
async function comprobarTiradas(P, nv) {
  const { page } = P;
  for (const e of ESTILOS) {
    await estilo(page, e);
    await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
    const x1 = await tirar(P, 'pull-1');
    await page.click('#pull-close'); await sleep(200);
    const x10 = await tirar(P, 'pull-10');
    await page.click('#pull-close'); await sleep(200);
    check(`${nv} ${e}: tiradas ×1 y ×10 sin desplazar, con «Continuar» a la vista sin tapar ninguna carta y el premio sin cortes`,
      x1.cartas === 1 && x10.cartas === 10 && [x1, x10].every(x => x.desplaza <= 1 && x.continuarVisible && !x.pisa && !x.fuera && x.escalaCss && !x.premioCortado.length), { x1, x10 });
    const ev = await tirarRepetidos(P);
    await captura(page, `tirada-x10-repetidos-${e}-${nv}`);
    await page.click('#pull-close'); await sleep(200);
    check(`${nv} ${e}: ×10 de diez repetidos (nombres largos): cada etiqueta entera, cada carta a la vista sin «Continuar» encima y sin desplazar`,
      ev.cartas === 10 && !ev.malas.length && !ev.nuncaEnteras && ev.desplaza <= 1, ev);
  }
}

async function pruebaArreglos(browser) {
  // 11a. Menú del plegable con la barra del navegador: los créditos no pisan la caja de estadísticas y todo cabe.
  for (const [clave, v] of Object.entries(VP_BARRA)) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: se entra (barra del navegador)`, false); await P.ctx.close(); continue; }
    for (const e of ESTILOS) {
      await estilo(page, e);
      await page.evaluate(() => { G.MenuUI.open(); document.getElementById('scr-menu').scrollTop = 0; for (const x of document.querySelectorAll('.ach-pop, .toast')) x.classList.add('hidden'); });
      await sleep(300);
      const m = await page.evaluate(MEDIR_MENU);
      report.medidas[`menu-barra-${e}-${nv}`] = m;
      check(`${nv} ${e} (plegable con la barra del navegador): menú principal con las 9 opciones a la vista, entero sin desplazar (${m.sobra} px de más) y la línea de créditos sin pisar ninguna caja`,
        m.opciones === 9 && !m.mal.length && m.sobra <= 1 && !m.logoTapado && !m.creditosPisan, m);
      if (clave === 'v680' || clave === 'g680') await captura(page, `menu-barra-${e}-${nv}`);
      // Los submenús que llegan abajo (gacha, colección, mejoras, misiones y Ajustes): la línea de créditos, que sólo va con
      // el menú principal, no se monta en el pie de su caja (la verificación de PokéSwarm la vio sobre «Probabilidades»).
      if (clave === 'v700' || clave === 'v640' || clave === 'g640') {
        const malas = [];
        for (const [id, abrir, cerrar] of PANTALLAS.filter(([id, , , sub]) => ['scr-gacha', 'scr-dex', 'scr-upgrades', 'scr-goals', 'scr-settings'].includes(id) && !sub)) {
          await page.evaluate(abrir);
          await sleep(id === 'scr-gacha' || id === 'scr-dex' ? 150 : 60);
          const m = await page.evaluate(MEDIR_PANTALLA, id);
          if (!m.visible || m.creditosPisan) malas.push({ id, ...m });
          if (id === 'scr-gacha' && clave === 'v700') await captura(page, `gacha-creditos-${e}-${nv}`);
          if (cerrar) await page.evaluate(cerrar);
        }
        await page.evaluate(() => G.MenuUI.open());
        check(`${nv} ${e} (plegable con la barra del navegador): la línea de créditos no tapa el gacha, la colección, las mejoras, las misiones ni Ajustes`, !malas.length, malas);
      }
    }
    // El pliegue sale de la pantalla: en vertical con la barra (724x700), vertical en x = 362; y nada del HUD encima,
    // tampoco un aviso largo junto al jefe.
    if (clave === 'v700') {
      await page.evaluate(() => { G.Estilo.set('dex'); G.Flow.play(); });
      await sleep(1000);
      await page.evaluate(ESCENA_HUD, { aviso: false });
      await page.evaluate(() => G.Spawner.say('Guardas el vínculo: aprende otro movimiento para usarlo', 600, true));
      await sleep(2400);
      const pg = await page.evaluate(() => {
        const W = innerWidth, H = innerHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d'), ft = ctx.fillText, textos = [];
        ctx.fillText = function (t, x, y) {
          const m = ctx.getTransform(), w = ctx.measureText(t).width, al = ctx.textAlign, x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
          textos.push({ t: String(t), x0: m.a * x0 + m.e, x1: m.a * (x0 + w) + m.e, y: m.d * y + m.f });
          return ft.call(this, t, x, y);
        };
        G.HudDex.draw(ctx, W, H, G.Game.player, G.Game.st);
        const B = G.HudDex.bandas(), P = B.piezas, g = B.pliegue, A = P.aviso, L = [];
        for (const k of ['ficha', 'contador', 'rotom', 'pausa', 'jefe', 'aviso', 'objeto', 'vinculo']) if (P[k]) L.push({ n: k, ...P[k] });
        ['ranuras', 'chips', 'companeros'].forEach(k => (P[k] || []).forEach((r, i) => L.push({ n: k + i, ...r })));
        const pisa = g ? L.filter(p => g.eje === 'x' ? p.x < g.pos + g.ancho / 2 && p.x + p.w > g.pos - g.ancho / 2 : p.y < g.pos + g.ancho / 2 && p.y + p.h > g.pos - g.ancho / 2).map(p => p.n) : null;
        const tx = A ? textos.filter(o => o.y >= A.y - 1 && o.y <= A.y + A.h + 1 && o.x0 >= A.x - 1 && o.x1 <= A.x + A.w + 1) : [];
        return { pliegue: g, pisa, aviso: A, textos: tx.map(o => o.t), cruzan: g ? tx.filter(o => o.x0 < g.pos + g.ancho / 2 && o.x1 > g.pos - g.ancho / 2).map(o => o.t) : [] };
      });
      report.medidas['hud-pliegue-barra-' + nv] = pg;
      await captura(page, `hud-pliegue-barra-dex-${nv}`);
      check(`${nv} (Magic V6 en vertical con la barra del navegador; pantalla 724x784): el pliegue sigue siendo vertical en x = 362 y ninguna pieza del HUD Dex lo pisa, ni el aviso largo junto al jefe («${pg.textos.join(' / ')}», entero)`,
        pg.pliegue && pg.pliegue.eje === 'x' && pg.pliegue.pos === 362 && pg.pisa && !pg.pisa.length && !pg.cruzan.length && pg.textos.length >= 1 && !pg.textos.some(t => /…$/.test(t)), pg);
      await page.evaluate(salirDePartida);
    }
    // Tiradas ×1 y ×10 (también la de repetidos) con la barra del navegador.
    if (clave === 'v640' || clave === 'g640') await comprobarTiradas(P, nv);
    check(`${nv}: consola sin errores ni avisos (barra del navegador)`, !P.consola.length, P.consola.slice(0, 5));
    await P.ctx.close();
  }

  // 11b. ×10 en un móvil pequeño en horizontal (640x360, 667x375): seis y cuatro, «Continuar» en su esquina libre.
  for (const v of [{ w: 640, h: 360, dpr: 3, tactil: true }, { w: 667, h: 375, dpr: 2, tactil: true }]) {
    const P = await nuevo(browser, v), nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: se entra`, false); await P.ctx.close(); continue; }
    await comprobarTiradas(P, nv);
    check(`${nv}: consola sin errores ni avisos`, !P.consola.length, P.consola.slice(0, 5));
    await P.ctx.close();
  }

  // 11c. Barra superior en anchos de menos de 680 (en vertical): compacta, en una fila (dos, sin salirse, por debajo de 480).
  for (const v of [{ w: 640, h: 780, dpr: 3, tactil: true }, { w: 600, h: 740, dpr: 3, tactil: true }, { w: 520, h: 640 }, { w: 440, h: 760 }, { w: 400, h: 700 }]) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: se entra`, false); await P.ctx.close(); continue; }
    for (const e of ESTILOS) {
      await estilo(page, e);
      await page.evaluate(() => { G.MenuUI.open(); for (const x of document.querySelectorAll('.ach-pop, .toast')) x.classList.add('hidden'); });
      await sleep(250);
      const b = await page.evaluate(MEDIR_BARRA);
      report.medidas[`barra-${e}-${nv}`] = b;
      check(`${nv} ${e}: barra superior compacta: dentro de la ventana, ${v.w >= 480 ? 'en una fila' : 'en dos filas como mucho'}, sin desplazamiento horizontal y sin tapar el logotipo`,
        !b.fuera && b.filas <= (v.w >= 480 ? 1 : 2) && b.pagina <= 0 && !b.logoTapado, b);
      if (v.w === 600) await captura(page, `barra-${e}-${nv}`);
      // Con Dex, «PokéSwarm» entero en la tarjeta (por debajo de unos 450 px salía «PokéSwa», sin «…») y la cuenta sin cortar
      // (o sólo su icono).
      if (e === 'dex') {
        const tt = await page.evaluate(() => {
          const t = document.querySelector('#tc-card .tc-title'), u = document.querySelector('#tc-card .tc-user span'), g = document.createRange();
          g.selectNodeContents(t);
          const tx = g.getBoundingClientRect(), r = t.getBoundingClientRect(), card = document.getElementById('tc-card').getBoundingClientRect();
          const uVisible = u && getComputedStyle(u).clipPath === 'none';
          return { titulo: [Math.round(tx.left), Math.round(tx.right)], caja: [Math.round(r.left), Math.round(r.right)], tarjeta: [Math.round(card.left), Math.round(card.right)],
            entero: tx.right <= r.right + 0.5 && tx.right <= card.right + 0.5, cuenta: uVisible ? (u.scrollWidth <= u.clientWidth + 1 ? 'entera' : 'cortada') : 'icono' };
        });
        report.medidas[`titulo-tarjeta-${nv}`] = tt;
        check(`${nv} Dex: «PokéSwarm» entero en la tarjeta y la cuenta ${tt.cuenta === 'icono' ? 'en su icono' : 'entera'}`, tt.entero && tt.cuenta !== 'cortada', tt);
        if (v.w === 440) await captura(page, `tarjeta-estrecha-${e}-${nv}`);
      }
    }
    await P.ctx.close();
  }

  // 11d. El aviso flotante (toast) del menú, si sigue en pantalla al empezar la partida, no pisa la fila de ranuras.
  for (const v of [VP.pc, VP.tab, VP.movil]) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: se entra`, false); await P.ctx.close(); continue; }
    for (const e of ESTILOS) {
      await estilo(page, e);
      await page.evaluate(() => { G.UI.toast('¡Bulbasaur se une a ti!', 5000); G.Flow.play(); });
      await sleep(700);
      const t = await page.evaluate(TOAST_PARTIDA);
      report.medidas[`toast-${e}-${nv}`] = t;
      if (v === VP.pc) await captura(page, `toast-partida-${e}-${nv}`);
      check(`${nv} ${e}: el aviso «¡Bulbasaur se une a ti!» del menú, al empezar la partida, queda por encima de la fila de ranuras (${t.toast[1]} ≤ ${t.limite} px)`,
        t.estado === 'playing' && t.visible && !t.pisa, t);
      await page.evaluate(salirDePartida);
    }
    // Y «…» con los puntos abajo en Dex (la letra de reserva), en el lienzo y en las caras de M PLUS de la página.
    if (v === VP.pc) {
      await estilo(page, 'dex');
      const p = await page.evaluate(PUNTOS);
      report.medidas['puntos-suspensivos'] = p;
      check(`Dex: «…» con los puntos en la línea base (su tinta acaba a ${p.elipsis.abajo} px y la de «.» a ${p.punto.abajo}; empieza a ${p.elipsis.arriba}), no a media altura como en M PLUS; las ${p.caras.length} caras de M PLUS sin U+2026 (${p.caras[0]})`,
        Math.abs(p.elipsis.abajo - p.punto.abajo) <= 2 && p.elipsis.arriba >= p.punto.arriba - 3 && p.caras.length >= 2 && p.caras.every(u => /2025/.test(u) && /2027/.test(u)), p);
    }
    check(`${nv}: consola sin errores ni avisos (aviso flotante en partida)`, !P.consola.length, P.consola.slice(0, 5));
    await P.ctx.close();
  }

  // 11e. Zonas seguras simuladas (muesca de 47 px a los lados, 24 arriba y 21 abajo) en un móvil en horizontal: las reglas
  //      que usan env(safe-area-inset-*) (gacha, tiradas, avisos de logro en el gacha) y lo que lee el HUD Dex.
  {
    const s = { sup: 24, der: 47, inf: 21, izq: 47 }, v = { w: 844, h: 390, dpr: 3, tactil: true, seguras: s };
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) check(`${nv}: se entra`, false);
    else {
      const leidas = await page.evaluate(() => G.Estilo.zonasSeguras());
      check(`${nv}: la simulación llega al juego: G.Estilo.zonasSeguras() lee ${JSON.stringify(leidas)}`, leidas.sup === s.sup && leidas.der === s.der && leidas.inf === s.inf && leidas.izq === s.izq, leidas);
      for (const e of ESTILOS) {
        await estilo(page, e);
        await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
        await sleep(400);
        const g = await page.evaluate(() => {
          const r = el => { const q = el.getBoundingClientRect(); return { left: q.left, top: q.top, right: q.right, bottom: q.bottom }; };
          let a = document.getElementById('ach-pop'), creado = false;
          if (!a) { a = document.createElement('div'); a.id = 'ach-pop'; a.className = 'box ach-pop'; a.innerHTML = '<div><b>Logro</b></div>'; document.body.appendChild(a); creado = true; }
          a.classList.remove('hidden');
          const out = { caja: r(document.querySelector('#scr-gacha > .box')), botones: ['pull-1', 'pull-10', 'pull-10b'].map(id => r(document.getElementById(id))), logro: r(a) };
          if (creado) a.remove(); else a.classList.add('hidden');
          return out;
        });
        await page.evaluate(() => { if (!G.Slots.__play) G.Slots.__play = G.Slots.play; G.Slots.play = () => Promise.resolve(); });
        await page.click('#pull-10');
        for (let i = 0; i < 130 && !(await page.locator('#pull-close').isVisible().catch(() => false)); i++) await sleep(150);
        await sleep(500);
        const tiradas = await page.evaluate(() => {
          const r = el => { const q = el.getBoundingClientRect(); return { left: q.left, top: q.top, right: q.right, bottom: q.bottom }; };
          return { continuar: r(document.getElementById('pull-close')), cartas: [...document.querySelectorAll('#pull-results .pcard')].map(r) };
        });
        if (e === 'dex') await captura(page, `tirada-x10-muesca-${e}-${nv}`);
        await page.click('#pull-close');
        await page.evaluate(() => { if (G.Slots.__play) G.Slots.play = G.Slots.__play; });
        await sleep(200);
        const W = v.w, H = v.h;
        const fuera = [['caja del gacha', g.caja], ...g.botones.map((b, i) => ['botón ' + i, b]), ['aviso de logro', g.logro], ['Continuar', tiradas.continuar], ...tiradas.cartas.map((c, i) => ['carta ' + i, c])]
          .filter(([, r]) => !dentroSeguro(r, s, W, H)).map(([n, r]) => `${n} ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`);
        check(`${nv} ${e} (muesca simulada de 47/24/47/21): el gacha, sus botones, el aviso de logro, las diez cartas de la ×10 y «Continuar», dentro de las zonas seguras`,
          !fuera.length && tiradas.cartas.length === 10, fuera.slice(0, 6));
        await page.evaluate(salirDePartida);
      }
      // El HUD Dex en partida, con todo a la vez, dentro de las zonas seguras.
      await page.evaluate(() => { G.Estilo.set('dex'); G.Flow.play(); });
      await sleep(900);
      await page.evaluate(ESCENA_HUD, { companeros: true });
      await sleep(1800);
      const h = await page.evaluate(sg => {
        const B = G.HudDex.bandas(), P = B.piezas, L = [];
        for (const k of ['ficha', 'contador', 'rotom', 'pausa', 'jefe', 'aviso', 'objeto', 'vinculo']) if (P[k]) L.push({ n: k, ...P[k] });
        ['ranuras', 'chips', 'companeros'].forEach(k => (P[k] || []).forEach((r, i) => L.push({ n: k + i, ...r })));
        return L.filter(p => p.x < sg.izq - 0.5 || p.y < sg.sup - 0.5 || p.x + p.w > innerWidth - sg.der + 0.5 || p.y + p.h > innerHeight - sg.inf + 0.5).map(p => p.n);
      }, s);
      await captura(page, `hud-muesca-dex-${nv}`);
      check(`${nv} (muesca simulada): todas las piezas del HUD Dex, dentro de las zonas seguras`, !h.length, h);
    }
    check(`${nv}: consola sin errores ni avisos (zonas seguras simuladas)`, !P.consola.length, P.consola.slice(0, 5));
    await P.ctx.close();
  }
}

// ---------------- 12. Portada «Tarjeta de entrenador» (PokéSwarm, 12-10-2026) ----------------
/** Fracción de la pantalla opaca, medida como en la maqueta de la variante C: la interfaz sin el mundo, sobre negro y
 *  sobre blanco; por píxel a = 1 - (blanco - negro) / 255 (media de los canales) y opaco si a ≥ 0,6. */
async function opaco(page) {
  const fotos = [];
  for (const c of ['#000', '#fff']) {
    await page.evaluate(c => {
      let s = document.getElementById('__medir');
      if (!s) { s = document.createElement('style'); s.id = '__medir'; document.head.appendChild(s); }
      s.textContent = `#game{visibility:hidden!important} html,body{background:${c}!important} .ach-pop,.toast{display:none!important}`;
    }, c);
    await sleep(150);
    fotos.push((await page.screenshot({ scale: 'css' })).toString('base64'));
  }
  await page.evaluate(() => document.getElementById('__medir').remove());
  return page.evaluate(async ([n, b]) => {
    const px = async s => {
      const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob());
      const c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d');
      x.drawImage(im, 0, 0);
      return x.getImageData(0, 0, im.width, im.height).data;
    };
    const N = await px(n), B = await px(b);
    let op = 0;
    for (let i = 0; i < N.length; i += 4) if (1 - ((B[i] - N[i]) + (B[i + 1] - N[i + 1]) + (B[i + 2] - N[i + 2])) / 765 >= 0.6) op++;
    return Math.round(op / (N.length / 4) * 1000) / 10;
  }, fotos);
}

/** Cómo está la cara de la tarjeta que se ve: dentro de la ventana, sin desplazar, con el Rotom-Dex delante del nombre
 *  y sin la lengüeta roja de los paneles del Dex. */
const CARA = ([selCaja, selNombre]) => {
  const caja = document.querySelector(selCaja), nombre = document.querySelector(selNombre);
  const r = caja.getBoundingClientRect(), W = innerWidth, H = innerHeight;
  const antes = el => el ? getComputedStyle(el, '::before') : null;
  return {
    dentro: r.left >= -0.5 && r.top >= -0.5 && r.right <= W + 0.5 && r.bottom <= H + 0.5 && r.width > 0,
    desplaza: Math.max(0, caja.scrollHeight - caja.clientHeight),
    rotom: !!nombre && /url\("data:image\/svg/.test(antes(nombre).backgroundImage) && nombre.textContent.trim() === 'PokéSwarm',
    lengueta: antes(caja).display !== 'none' && antes(caja).content !== 'none' && /D7263D|215, 38, 61/i.test(antes(caja).backgroundColor),
    pagina: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
};

async function pruebaPortada(browser) {
  // Los tamaños que pidió Nico: escritorio, el móvil, el Magic V6 (abierto, en las dos posturas, con la barra del
  // navegador, plegado en horizontal y la mitad de arriba en modo mesa).
  const VPS = [
    { w: 1440, h: 900 }, { w: 1920, h: 1080 }, { w: 1024, h: 768 }, { w: 844, h: 390, dpr: 3, tactil: true },
    { w: 807, h: 360, dpr: 3, tactil: true }, { w: 784, h: 362, dpr: 3, tactil: true, pantalla: [784, 724] },
    { w: 724, h: 784, dpr: 3, tactil: true }, { w: 784, h: 724, dpr: 3, tactil: true },
    { w: 724, h: 700, dpr: 3, tactil: true, pantalla: [724, 784] }, { w: 784, h: 640, dpr: 3, tactil: true, pantalla: [784, 724] }
  ];
  for (const v of VPS) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    const movil = v.h < 520, plegable = !movil && v.w <= 920;
    // Como en una primera visita de verdad, el sonido espera al primer gesto: así sale «Pulsa para empezar».
    await page.addInitScript(() => {
      try { localStorage.setItem('ps.settings', JSON.stringify({ estilo: 'dex' })); } catch (e) {}
      let gesto = false;
      addEventListener('pointerdown', () => { gesto = true; }, true);
      addEventListener('keydown', () => { gesto = true; }, true);
      document.addEventListener('DOMContentLoaded', () => { if (window.G && G.Audio) { const o = G.Audio.canPlay.bind(G.Audio); G.Audio.canPlay = () => gesto && o(); } });
    });
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
    await sleep(500);
    const estiloInicial = await page.evaluate(() => G.Estilo.actual);
    // «Pulsa para empezar»: el dorso de la tarjeta, sin velo.
    const pulsa = await page.locator('#tap-start').isVisible();
    if (pulsa) {
      const c = await page.evaluate(CARA, ['#tap-start .boot-in', '#tap-start h1']);
      const velo = await page.evaluate(() => getComputedStyle(document.getElementById('tap-start')).backgroundImage);
      await captura(page, `portada-pulsa-dex-${nv}`);
      check(`${nv} Dex: «Pulsa para empezar», la tarjeta entera dentro de la ventana con el Rotom-Dex delante de «PokéSwarm» y sin velo sobre el mundo`,
        estiloInicial === 'dex' && c.dentro && c.rotom && !c.lengueta && velo === 'none' && c.pagina <= 0, { c, velo, estiloInicial });
      if (v.tactil) await page.tap('#tap-start'); else await page.click('#tap-start');
    } else check(`${nv}: sale «Pulsa para empezar» (el sonido espera al primer gesto)`, false);
    // Inicio de sesión: la cara del formulario; las dos pestañas con Tab y elegibles con Intro.
    await page.locator('#scr-login').waitFor({ state: 'visible' });
    await sleep(300);
    const lg = await page.evaluate(CARA, ['#scr-login > .box', '#scr-login .logo .t1']);
    const tabs = await page.evaluate(() => [...document.querySelectorAll('#scr-login .tab')].map(t => ({ rol: t.getAttribute('role'), tab: t.tabIndex, sel: t.getAttribute('aria-selected') })));
    await page.focus('#scr-login .tab[data-tab="login"]');
    await page.keyboard.press('Tab');
    const segunda = await page.evaluate(() => document.activeElement && document.activeElement.dataset.tab);
    await page.keyboard.press('Enter');
    const registro = await page.evaluate(() => document.querySelector('#scr-login .tab[data-tab="register"]').classList.contains('on') && document.querySelector('#scr-login .tab[data-tab="register"]').getAttribute('aria-selected') === 'true');
    await captura(page, `portada-login-foco-dex-${nv}`);
    await page.keyboard.press('ArrowLeft');
    const vuelta = await page.evaluate(() => document.querySelector('#scr-login .tab[data-tab="login"]').classList.contains('on') && document.activeElement.dataset.tab === 'login');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await captura(page, `portada-login-dex-${nv}`);
    const pLogin = movil ? await opaco(page) : null;
    check(`${nv} Dex: inicio de sesión entero sin desplazar, con el Rotom-Dex delante del nombre y sin lengüeta; las pestañas Entrar y Crear cuenta se alcanzan con Tab, Intro elige y las flechas cambian${movil ? ` (${pLogin} % opaco)` : ''}`,
      lg.dentro && lg.desplaza <= 1 && lg.rotom && !lg.lengueta && lg.pagina <= 0 && tabs.length === 2 && tabs.every(t => t.rol === 'tab' && t.tab === 0) &&
      segunda === 'register' && registro && vuelta, { lg, tabs, segunda, registro, vuelta, pLogin });
    // Sin el test (G.MODS.sinTest): «Elige a tu compañero», entera y sin desplazar.
    await page.click('#btn-guest');
    await page.locator('#scr-starters.sin-test').waitFor({ state: 'visible' });
    await sleep(500);
    const ec = await page.evaluate(CARA, ['#scr-starters .box', '#nada']);
    const ecTest = await page.evaluate(() => !document.getElementById('scr-test').classList.contains('hidden'));
    await captura(page, `portada-companero-dex-${nv}`);
    check(`${nv} Dex: tras «Jugar como invitado», «Elige a tu compañero» (no el test), entera dentro de la ventana y sin desplazar`,
      !ecTest && ec.dentro && ec.desplaza <= 1 && ec.pagina <= 0, { ec, ecTest });
    // Test y resultado (con sinTest = false): la misma tarjeta, sin oscurecido (retoque d).
    await page.evaluate(() => { G.UI.hideAll(); G.TestUI.start(); });
    await page.locator('#scr-test').waitFor({ state: 'visible' });
    await sleep(300);
    const te = await page.evaluate(CARA, ['#scr-test .test-box', '#nada']);
    const dim = await page.evaluate(() => { const cs = getComputedStyle(document.getElementById('scr-test')); return cs.backgroundImage === 'none' && /rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor); });
    const respuestas = await page.evaluate(() => [...document.querySelectorAll('#test-a .answer')].map(b => Math.round(b.getBoundingClientRect().height)));
    await captura(page, `portada-test-dex-${nv}`);
    check(`${nv} Dex: test sin oscurecido, la tarjeta dentro de la ventana y sin lengüeta, respuestas de 44 px o más`,
      dim && te.dentro && te.desplaza <= 1 && !te.lengueta && respuestas.length === 4 && respuestas.every(h => h >= 44), { te, dim, respuestas });
    for (let n = 0; n < 40 && await page.locator('#scr-test').isVisible(); n++) { await page.locator('#test-a .answer').first().click(); await sleep(40); }
    await page.locator('#scr-result').waitFor({ state: 'visible' });
    await sleep(600);
    const re = await page.evaluate(CARA, ['#scr-result .result', '#nada']);
    const dimR = await page.evaluate(() => getComputedStyle(document.getElementById('scr-result')).backgroundImage === 'none');
    await captura(page, `portada-resultado-dex-${nv}`);
    check(`${nv} Dex: resultado del test sin oscurecido, entero y sin lengüeta`, dimR && re.dentro && re.desplaza <= 1 && !re.lengueta, { re, dimR });
    await page.click('#res-ok');
    await page.locator('#scr-menu').waitFor({ state: 'visible' });
    // Menú: el anverso. Una partida con récord para que la tarjeta tenga sus cifras.
    const menu = async dex => {
      await page.evaluate(d => {
        Object.assign(G.DB.save.stats, { runs: 14, bestTime: 754, bestLevel: 31 });
        if (d) { G.DB.save.partner = d; G.DB.save.owned[d] = G.DB.save.owned[d] || 1; }
        G.MenuUI.open();
        for (const x of document.querySelectorAll('.ach-pop, .toast')) x.classList.add('hidden');
      }, dex);
      await page.waitForFunction(() => document.getElementById('tc-card').classList.contains('tc-listo'), null, { timeout: 15000 }).catch(() => {});
      await sleep(400);
      return page.evaluate(() => {
        const W = innerWidth, H = innerHeight, r = el => el.getBoundingClientRect();
        const dentro = b => b.left >= -0.5 && b.top >= -0.5 && b.right <= W + 0.5 && b.bottom <= H + 0.5 && b.width > 0;
        const card = document.getElementById('tc-card'), botones = [...document.querySelectorAll('#scr-menu .menu-item')];
        const cv = document.getElementById('tc-partner'), c = G.Estilo.colocacion(cv);
        const tb = [...document.querySelectorAll('#topbar > *')].filter(e => e.getClientRects().length).map(r);
        const cruza = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return {
          tarjeta: dentro(r(card)), izquierda: getComputedStyle(document.querySelector('#scr-menu > .menu-left')).display,
          rotom: /url\("data:image\/svg/.test(getComputedStyle(document.querySelector('#tc-card .tc-title'), '::before').backgroundImage),
          lengueta: getComputedStyle(card, '::before').display !== 'none',
          botones: botones.length, fuera: botones.filter(b => !dentro(r(b))).map(b => b.dataset.go), bajos: botones.filter(b => r(b).height < 44 - 0.5).map(b => b.dataset.go),
          cortados: botones.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.dataset.go),
          // Y en vertical: el contenido cabe (scrollHeight) y el icono y la caja de la letra del nombre quedan dentro del borde
          // interior (en el móvil, con 44 px, el nombre acababa 1,7 px por debajo y el icono tocaba arriba).
          desbordan: botones.filter(b => {
            const cs = getComputedStyle(b), q = r(b), top = q.top + parseFloat(cs.borderTopWidth), bot = q.bottom - parseFloat(cs.borderBottomWidth);
            const dentro = x => x.height === 0 || (x.top >= top - 0.5 && x.bottom <= bot + 0.5);
            const textos = [...b.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => { const g = document.createRange(); g.selectNodeContents(n); return g.getBoundingClientRect(); });
            const ico = b.querySelector('.mi-ico');
            return b.scrollHeight > b.clientHeight + 0.5 || !textos.every(dentro) || (ico && !dentro(r(ico)));
          }).map(b => b.dataset.go),
          pisaBarra: tb.some(t => cruza(t, r(card)) || botones.some(b => cruza(t, r(b)))),
          escala: c && c.k, escalaMax: +getComputedStyle(card).getPropertyValue('--tc-escala'), dex: c && c.dex,
          renglones: (() => {   // renglones de la tarjeta: los centros de sus piezas, agrupados con 8 px de tolerancia
            const cs = [...card.querySelectorAll('.tc-title, .tc-mon, .tc-stats, .tc-user')].filter(e => e.getClientRects().length).map(e => (r(e).top + r(e).bottom) / 2).sort((a, b) => a - b);
            return cs.reduce((n, y, i) => n + (i && y - cs[i - 1] <= 8 ? 0 : 1), 0);
          })(),
          pagina: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
    };
    const m = await menu(null);
    await captura(page, `portada-menu-dex-${nv}`);
    const pMenu = await opaco(page);
    report.medidas[`portada-opaco-${nv}`] = { menu: pMenu, login: pLogin };
    check(`${nv} Dex: menú «Tarjeta de entrenador»: la tarjeta y los 9 botones dentro de la ventana, de 44 px o más, sin textos cortados ni desbordados en vertical (icono y nombre dentro del borde) ni la barra superior encima; el Rotom-Dex delante del nombre, sin lengüeta; el compañero a ×${m.escalaMax}${movil ? ' (retoque a: ×4)' : ''}; ${pMenu} % de pantalla opaca${movil || plegable ? ' (≤ 25 %)' : ''}`,
      m.tarjeta && m.izquierda === 'none' && m.rotom && !m.lengueta && m.botones === 9 && !m.fuera.length && !m.bajos.length && !m.cortados.length && !m.desbordan.length && !m.pisaBarra &&
      m.escala === m.escalaMax && (!movil || m.escala === 4) && (!(movil || plegable) || pMenu <= 25) && m.pagina <= 0, { m, pMenu });
    if (movil) {
      // El peor caso: un compañero grande (Dragonite) a ×4 y un nombre largo con dos tipos (Crabominable, tan ancho que va a
      // ×3, como los gigantes: el 8 % de la Pokédex baja de ×4 para no cortarse).
      for (const dex of [149, 740]) {
        const g = await menu(dex);
        const pg = await opaco(page);
        report.medidas[`portada-opaco-${nv}-${dex}`] = pg;
        if (dex === 149) await captura(page, `portada-menu-grande-dex-${nv}`);
        check(`${nv} Dex: menú con ${dex === 149 ? 'Dragonite (grande), a ×4' : 'Crabominable (nombre largo, dos tipos; ancho: ×3)'}, dos renglones en la tarjeta, ${pg} % opaco (≤ 25 %)`,
          g.escala === (dex === 149 ? 4 : 3) && g.renglones === 2 && pg <= 25 && !g.fuera.length && !g.cortados.length && !g.desbordan.length, { g, pg });
      }
    }
    // Clásico: la composición del proyecto base, con el nombre y el lema.
    if (v.w === 1440 || v.w === 844 || (v.w === 724 && v.h === 784)) {
      await estilo(page, 'clasico');
      await page.evaluate(() => { G.MenuUI.open(); for (const x of document.querySelectorAll('.ach-pop, .toast')) x.classList.add('hidden'); });
      await sleep(300);
      const k = await page.evaluate(() => ({
        tarjeta: getComputedStyle(document.getElementById('tc-card')).display, izquierda: getComputedStyle(document.querySelector('#scr-menu > .menu-left')).display,
        nombre: document.querySelector('#scr-menu .logo .t1').textContent.trim(), lema: document.querySelector('#scr-menu .logo .t2').textContent.trim(),
        letra: getComputedStyle(document.querySelector('#scr-menu .logo .t1')).fontFamily
      }));
      await captura(page, `portada-menu-clasico-${nv}`);
      check(`${nv} Clásico: el menú del proyecto base (sin tarjeta) con «PokéSwarm» y el lema`,
        k.tarjeta === 'none' && k.izquierda !== 'none' && k.nombre === 'PokéSwarm' && k.lema === 'Roguelite de hordas Pokémon' && /Pixelify/.test(k.letra), k);
    }
    check(`${nv}: consola sin errores ni avisos (portada)`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    await P.ctx.close();
  }
}

// ---------------- 13. Entornos del Gremio, clima y horneado escalonado (lote 3) ----------------
const GPU = ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'];
/** Antes de cargar el juego (addInitScript): la CPU de cada fotograma (requestAnimationFrame envuelto), lo que se hornea en
 *  él (G.Tiles.paintChunk envuelto, en cuanto existe) y el bioma con que acaba. Sólo en la prueba. */
const PERF_INIT = () => {
  const raf = window.requestAnimationFrame.bind(window);
  const P = window.__perf = { on: false, f: [], cur: null };
  window.requestAnimationFrame = cb => raf(ts => {
    const fr = { t: performance.now(), ms: 0, hornos: 0, msHorno: 0, bi: -1 };
    P.cur = fr;
    try { cb(ts); } finally {
      fr.ms = performance.now() - fr.t; P.cur = null;
      if (P.on) { fr.bi = window.G && G.World ? G.World.biome : -1; P.f.push(fr); }
    }
  });
  const envolver = () => {
    if (!window.G || !G.Tiles || !G.Tiles.paintChunk) return setTimeout(envolver, 5);
    const pc = G.Tiles.paintChunk;
    G.Tiles.paintChunk = function () {
      const t0 = performance.now();
      try { return pc.apply(this, arguments); } finally { const c = window.__perf.cur; if (c) { c.hornos++; c.msHorno += performance.now() - t0; } }
    };
  };
  envolver();
};
/** Resumen de los fotogramas apuntados (y deja de apuntar). `desde`/`hasta`: ms de performance.now(). */
const RESUMEN_PERF = ({ desde = -Infinity, hasta = Infinity } = {}) => {
  const P = window.__perf; P.on = false;
  const f = P.f.filter(x => x.t >= desde && x.t <= hasta), ms = f.map(x => x.ms).sort((a, b) => a - b);
  const q = p => (ms.length ? +ms[Math.min(ms.length - 1, Math.floor(p * ms.length))].toFixed(2) : null);
  let cambio = null;
  for (let i = 1; i < f.length; i++) if (f[i].bi !== f[i - 1].bi) { cambio = { i, hornos: f[i].hornos, msHorno: +f[i].msHorno.toFixed(2), t: f[i].t }; break; }
  return { n: f.length, media: ms.length ? +(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(3) : null, p95: q(0.95), max: q(1),
    mas20: f.filter(x => x.ms > 20).length, mas33: f.filter(x => x.ms > 33).length, maxHornos: Math.max(0, ...f.map(x => x.hornos)),
    maxMsHorno: +Math.max(0, ...f.map(x => x.msHorno)).toFixed(2), hornos: f.reduce((a, x) => a + x.hornos, 0), cambio,
    // Lo horneado en los fotogramas que hornean: la mediana y cuántos pasan de 4 ms.
    conHorno: f.filter(x => x.hornos).length,
    medMsHorno: (() => { const h = f.filter(x => x.hornos).map(x => x.msHorno).sort((a, b) => a - b); return h.length ? +h[h.length >> 1].toFixed(2) : 0; })(),
    mas4: f.filter(x => x.msHorno > 4).length };
};
const apuntar = page => page.evaluate(() => { window.__perf.f = []; window.__perf.on = true; });
/** El horneado de un fotograma: como mucho 1 chunk, y el presupuesto de 4 ms. Un chunk Dex cuesta 2,3-2,8 ms (Clásico,
 *  1,7) y no se puede partir; en plena partida, alguno suelto tarda 4-6,5 ms (crear su lienzo y subirlo a la GPU en
 *  paintChunk de upstream coincide con el resto del fotograma, o una recolección de basura; aislado, el mismo chunk tarda
 *  lo de siempre, y en Clásico también salen). Así que: la mediana ≤ 4 ms, como mucho un 15 % de los fotogramas que hornean
 *  por encima de 4 ms y ninguno por encima de 10 (lo que se nota, ningún fotograma de más de 20 ms, se mide aparte). */
const horneadoOk = r => r.maxHornos <= 1 && r.medMsHorno <= 4 && r.mas4 <= Math.max(1, Math.floor(0.15 * r.conHorno)) && r.maxMsHorno <= 10;
const horneadoTxt = r => `como mucho 1 chunk por fotograma (${r.maxHornos}) y 4 ms de horneado (mediana ${r.medMsHorno} ms; ${r.mas4} de ${r.conHorno} por encima de 4 ms, el mayor ${r.maxMsHorno} ms)`;

/** Un sitio de suelo con paredes y charcos a la vista (cerca del principio): allí se pone tu Pokémon, sin enemigos ni
 *  oleadas (sólo en la prueba), para que las capturas enseñen la oclusión, la tierra mojada y el agua. Se busca en anillos
 *  hasta `rMax` casillas del principio (70 por omisión, como en la sección 13); con `aproximado`, si ningún sitio llega a 10
 *  de pared y 10 de líquido, el que más tenga de los dos (los mapas propios van por franjas: en algunas semillas las
 *  paredes y el agua quedan más lejos o no coinciden). */
const ESCENA_ENTORNO = ({ rMax = 70, aproximado = false } = {}) => {
  const pl = G.Game.player, W = G.World, TS = W.TS;
  for (const x of document.querySelectorAll('.ach-pop, .toast')) x.remove();   // los avisos del invitado nuevo, fuera de las capturas
  pl.hurt = function () {};
  G.Spawner.update = () => {};
  G.EnemyMgr.clear(); G.Projectiles.clear(); G.FX.clear();
  let mejor = null, casi = null;
  for (let r = 14; r < rMax && !mejor; r += 2) for (let a = 0; a < 6.283 && !mejor; a += 0.3) {
    const tx = Math.round(Math.cos(a) * r), ty = Math.round(Math.sin(a) * r);
    if (W.kindAt(tx * TS + 16, ty * TS + 16) !== 'floor') continue;
    let p = 0, l = 0;
    for (let j = -5; j <= 5; j++) for (let i = -9; i <= 9; i++) { const k = W.kindAt((tx + i) * TS + 16, (ty + j) * TS + 16); if (k === 'wall') p++; else if (k === 'liquid') l++; }
    if (p >= 10 && l >= 10 && p + l < 80) mejor = { tx, ty, p, l };
    else if (aproximado && p + l < 80 && (!casi || Math.min(p, l) > Math.min(casi.p, casi.l))) casi = { tx, ty, p, l, aproximado: true };
  }
  if (!mejor && casi) mejor = casi;
  if (mejor) { pl.x = mejor.tx * TS + 16; pl.y = mejor.ty * TS + 16; G.Camera.x = pl.x; G.Camera.y = pl.y; }
  return mejor;
};
/** Espera a que el suelo esté horneado con el estilo de ahora (sin imágenes viejas) y unos fotogramas más. */
const HORNEADO = async () => {
  for (let i = 0; i < 200 && G.Horno && G.Horno.conViejas; i++) await new Promise(r => requestAnimationFrame(r));
  for (let i = 0; i < 6; i++) await new Promise(r => requestAnimationFrame(r));
};

/** Los píxeles de un Pokémon son los mismos con y sin el farol (que sólo va en el suelo): un Pokémon quieto cerca del borde
 *  izquierdo, donde el farol oscurece el suelo; el mismo fotograma con la capa del suelo y sin ella, y sin el Pokémon para
 *  saber cuáles son los suyos. En la pausa, sin sombras ni brillos del agua (que se mueven solos). */
const FAROL_SPRITES = async () => {
  const fr = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const cam = G.Camera, cv = document.getElementById('game'), cx = cv.getContext('2d'), k = cam.scale * cam.dpr, W = cv.width;
  const e = new G.Enemy({ dex: 25, hp: 500, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, cam.left() + cam.w * 0.16, cam.top() + cam.h * 0.55, { hp: 1, spd: 1, dmg: 1 }, false);
  e.spd = 0; G.EnemyMgr.add(e);
  if (G.Game.state === 'playing') G.Game.togglePause();
  G.FX.clear();
  const sombra = G.Sprites.drawShadow, liquido = G.World.drawLiquid, suelo = G.Entorno.suelo;
  G.Sprites.drawShadow = () => {}; G.World.drawLiquid = () => {};
  try {
    await fr();
    const A = cx.getImageData(0, 0, W, cv.height).data.slice();
    G.Entorno.suelo = (c, cm) => { if (G.Horno) G.Horno.tick(cm); };
    await fr();
    const B = cx.getImageData(0, 0, W, cv.height).data.slice();
    G.Entorno.suelo = suelo;
    const dib = e.draw; e.draw = () => {};
    await fr();
    const C = cx.getImageData(0, 0, W, cv.height).data;
    e.draw = dib;
    const sx = (e.x - cam.left()) * k, sy = (e.y - cam.top()) * k, half = Math.max(e.r * 1.7, e.bodyH * 0.65) * k;
    const x0 = Math.max(0, Math.floor(sx - half)), x1 = Math.min(W - 1, Math.ceil(sx + half)), y0 = Math.max(0, Math.floor(sy - (e.bodyH + 6) * k)), y1 = Math.min(cv.height - 1, Math.ceil(sy + 4 * k));
    let sprite = 0, cambian = 0, suelo2 = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const o = (y * W + x) * 4, dAC = Math.abs(A[o] - C[o]) + Math.abs(A[o + 1] - C[o + 1]) + Math.abs(A[o + 2] - C[o + 2]);
      const dAB = A[o] !== B[o] || A[o + 1] !== B[o + 1] || A[o + 2] !== B[o + 2];
      if (dAC > 36) { sprite++; if (dAB) cambian++; } else if (dAB) suelo2++;
    }
    return { sprite, cambian, sueloConFarol: suelo2, calidad: G.Settings.fx };
  } finally {
    G.Sprites.drawShadow = sombra; G.World.drawLiquid = liquido; G.Entorno.suelo = suelo;
    e.dead = true; e.fade = 0;
    if (G.Game.state === 'paused') G.Game.togglePause();
  }
};
/** La viñeta, pintada sola en un lienzo transparente del tamaño de la ventana: alfa dentro del 46 % central y en las esquinas. */
const VINETA = () => {
  const W = innerWidth, H = innerHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); G.World.drawVignette(c, W, H);
  const d = c.getImageData(0, 0, W, H).data, R = Math.min(W, H) * 0.46;
  let centro = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (Math.hypot(x - W / 2, y - H / 2) < R - 1) centro = Math.max(centro, d[(y * W + x) * 4 + 3]);
  return { centro, esquina: +(d[3] / 255).toFixed(3), color: [d[0], d[1], d[2]] };
};
/** Contraste de los dos tonos de la lluvia (G.Entorno.clima de verdad, quieta, sobre un lienzo del color de un suelo; fondo =
 *  el color más repetido, el suelo con el tinte). Los píxeles del borde (oscuro) y del núcleo (claro) son los que salen del
 *  color del tono mezclado con el fondo con su alfa (±12 por canal). Los suelos de un bioma: floor, dirt, light y speck y, con
 *  los mapas propios, las superficies de suelo del pintor que mira check.js §23 I (senda y losa, sus dos primeros tonos, y
 *  cauce, el primero). Con los mapas propios todos los suelos son de tono medio, así que ningún tono sirve solo en todos:
 *  la gota se ve por el mejor de los dos. Devuelve, en TODOS los colores de suelo del juego (los 21 biomas: los 3 normales y
 *  las 18 arenas) y en los de donde llueve (los 3 normales y las arenas con weather 'rain' de G.Tiles.ARENA_THEMES), el
 *  suelo en el que el mejor de los dos tonos da menos; y, como extremos para el informe (como antes), el borde contra el suelo
 *  más claro del juego y el núcleo contra el más oscuro. */
const LLUVIA_CONTRASTE = () => {
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b), ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const B = G.Tiles.BIOMES, R = G.MARCA.clima.rain;
  const SUELOS = [['floor'], ['dirt'], ['light'], ['speck'], ['senda', 2], ['losa', 2], ['cauce', 1]];
  const colores = bis => {
    const out = [];
    for (const bi of bis) for (const [k, n] of SUELOS) {
      if (B[bi][k] === undefined) continue;
      [].concat(B[bi][k]).slice(0, n || Infinity).forEach(h => { if (/^#[0-9a-f]{6}$/i.test(h) && !out.includes(h)) out.push(h); });
    }
    return out.sort((a, b) => L(...hex(a)) - L(...hex(b)));
  };
  const medir = h => {
    const W = 320, H = 180, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.fillStyle = h; c.fillRect(0, 0, W, H);
    G.Entorno.clima(c, W, H, 0, 'rain', 1);
    const d = c.getImageData(0, 0, W, H).data, cuenta = new Map();
    for (let i = 0; i < d.length; i += 4) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; cuenta.set(k, (cuenta.get(k) || 0) + 1); }
    const fondo = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0][0], f = [(fondo >> 16) & 255, (fondo >> 8) & 255, fondo & 255], lf = L(...f), out = { suelo: h };
    for (const [nombre, [tono, alfa]] of [['borde', R.borde], ['nucleo', R.nucleo]]) {
      const esp = hex(tono).map((v, i) => v * alfa + f[i] * (1 - alfa)), rs = [];
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - esp[0]) <= 12 && Math.abs(d[i + 1] - esp[1]) <= 12 && Math.abs(d[i + 2] - esp[2]) <= 12) rs.push(ratio(L(d[i], d[i + 1], d[i + 2]), lf));
      rs.sort((a, b) => a - b);
      out[nombre] = rs.length > 50 ? +rs[rs.length >> 1].toFixed(2) : 0;
    }
    return out;
  };
  const conLluvia = G.Tiles.ARENA_TYPES.filter(t => G.Tiles.ARENA_THEMES[t] && G.Tiles.ARENA_THEMES[t].weather === 'rain');
  const llueveEn = new Set(colores([0, 1, 2].concat(conLluvia.map(t => G.Tiles.arenaBiome(t)))));
  const todos = colores(B.map((_, i) => i)).map(medir), mejor = x => Math.max(x.borde, x.nucleo);
  const peorDe = l => l.reduce((a, x) => (mejor(x) < mejor(a) ? x : a));
  const llueve = todos.filter(x => llueveEn.has(x.suelo));
  return { claro: todos[todos.length - 1], oscuro: todos[0], peorTodos: peorDe(todos), peor: peorDe(llueve),
    suelosTodos: todos.length, suelos: llueve.length, arenasConLluvia: conLluvia, biomas: B.length };
};
/** Contraste de los Pokémon contra el suelo (como medir.sprites() de la maqueta del Gremio): el mismo fotograma con y sin
 *  Pokémon (sin HUD, efectos ni disparos; con el clima si `clima`); por enemigo, la luminancia mediana de su silueta frente
 *  a la del suelo de su caja. Devuelve la mediana de esas razones. En la pausa (todo quieto, también la lluvia). */
const SPRITES = async ({ clima = false } = {}) => {
  const fr = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b), ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
  const cv = document.getElementById('game'), cx = cv.getContext('2d'), cam = G.Camera, k = cam.scale * cam.dpr, pl = G.Game.player;
  const undo = [], tapar = (o, key, fn) => { const own = Object.prototype.hasOwnProperty.call(o, key), prev = o[key]; o[key] = fn; undo.push(() => { if (own) o[key] = prev; else delete o[key]; }); };
  for (const [o, key] of [[G.HUD, 'draw'], [G.FX, 'draw'], [G.Projectiles, 'draw'], [G.Combat, 'drawAirFields'], [G.Combat, 'drawGroundFields'], [G.Hazards, 'draw'], [G.Pickups, 'draw'], [G.Touch, 'draw']].concat(clima ? [] : [[G.Weather, 'draw']])) tapar(o, key, () => {});
  try {
    await fr();
    const A = cx.getImageData(0, 0, cv.width, cv.height).data.slice();
    tapar(G.EnemyMgr, 'drawables', () => []); tapar(pl, 'draw', () => {});
    await fr();
    const Bd = cx.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, Hh = cv.height, res = [];
    for (const e of G.EnemyMgr.all().filter(e => !e.dead && cam.sees(e.x, e.y, -10))) {
      const sx = (e.x - cam.left()) * k, sy = (e.y - cam.top()) * k;
      const half = Math.max(e.r * 1.7, e.bodyH * 0.65) * k, top = sy - (e.bodyH + 6) * k, bot = sy - e.r * 0.45 * k;
      const x0 = Math.max(1, Math.floor(sx - half)), x1 = Math.min(W - 2, Math.ceil(sx + half)), y0 = Math.max(1, Math.floor(top)), y1 = Math.min(Hh - 2, Math.ceil(bot));
      if (x1 - x0 < 4 || y1 - y0 < 4) continue;
      const ls = [], lg = [];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const o = (y * W + x) * 4, dif = Math.abs(A[o] - Bd[o]) + Math.abs(A[o + 1] - Bd[o + 1]) + Math.abs(A[o + 2] - Bd[o + 2]);
        if (dif > 36) ls.push(L(A[o], A[o + 1], A[o + 2])); else lg.push(L(Bd[o], Bd[o + 1], Bd[o + 2]));
      }
      if (ls.length >= 30 && lg.length >= 30) res.push(ratio(q(ls, 0.5), q(lg, 0.5)));
    }
    return { enemigos: res.length, mediana: res.length ? +q(res, 0.5).toFixed(3) : null };
  } finally { for (const u of undo.reverse()) u(); await fr(); }
};
/** Pokémon salvajes quietos alrededor de tu Pokémon (sólo en la prueba), siempre los mismos y en los mismos sitios. */
const RODEAR = n => {
  const pl = G.Game.player, cam = G.Camera, dex = [1, 4, 7, 25, 52, 92, 129, 133, 143, 147, 16, 43, 60, 69, 74, 35, 39, 54, 79, 113, 197, 94, 248, 359, 302];
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996, r = 0.12 + 0.36 * ((i * 0.618) % 1);
    const x = pl.x + Math.cos(a) * r * cam.w, y = pl.y + Math.sin(a) * r * cam.h;
    const e = new G.Enemy({ dex: dex[i % dex.length], hp: 9999, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, x, y, { hp: 1, spd: 1, dmg: 1 }, false);
    e.spd = 0; G.EnemyMgr.add(e);
  }
};

async function pruebaEntornos(browser) {
  // --- Capturas: los tres biomas en Dex y en Clásico, en escritorio, móvil y el plegable abierto; una arena y el clima. ---
  for (const clave of ['pc', 'movil', 'pleg2']) {
    const v = VP[clave], P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: entornos: se entra a jugar`, false); await P.ctx.close(); continue; }
    await page.evaluate(() => { G.Estilo.set('dex'); G.Flow.play(); });
    await sleep(1200);
    const sitio = await page.evaluate(ESCENA_ENTORNO);
    report.medidas['entorno-sitio-' + nv] = sitio;
    for (const [n, b] of [['bosque', 0], ['cueva', 1], ['volcan', 2]]) {
      await page.evaluate(b => G.World.setBiome(b, true), b);
      for (const est of ['dex', 'clasico']) {
        await estilo(page, est);
        await page.evaluate(HORNEADO);
        await sleep(250);
        await captura(page, `entorno-${n}-${est}-${nv}`);
      }
      await estilo(page, 'dex');
    }
    if (clave === 'pc') {
      // Una arena (la del volcán ígneo) y el clima: lluvia, nieve y arena (y la lluvia de upstream en Clásico).
      await page.evaluate(() => G.World.setBiome(G.Tiles.arenaBiome('fire'), true));
      for (const est of ['dex', 'clasico']) { await estilo(page, est); await page.evaluate(HORNEADO); await sleep(250); await captura(page, `entorno-arena-${est}-${nv}`); }
      await estilo(page, 'dex');
      await page.evaluate(() => G.World.setBiome(0, true));
      for (const [n, kind] of [['lluvia', 'rain'], ['nieve', 'snow'], ['arena', 'sand']]) {
        await page.evaluate(k => G.Weather.onEvent(['w', k, 90]), kind);
        await sleep(3300);
        await captura(page, `clima-${n}-dex-${nv}`);
        if (kind === 'rain') { await estilo(page, 'clasico'); await page.evaluate(HORNEADO); await sleep(300); await captura(page, `clima-${n}-clasico-${nv}`); await estilo(page, 'dex'); await page.evaluate(HORNEADO); }
      }
      await page.evaluate(() => G.Weather.onEvent(['w']));
      await sleep(3200);

      // --- Imagen ---
      const fs1 = await page.evaluate(FAROL_SPRITES);
      report.medidas['entorno-farol-sprites'] = fs1;
      check(`${nv}: el farol sólo va en el suelo: los ${fs1.sprite} píxeles de un Pokémon cerca del borde son idénticos con y sin él (${fs1.cambian} cambian) y el suelo de su alrededor sí cambia (${fs1.sueloConFarol} píxeles)`,
        fs1.sprite >= 200 && fs1.cambian === 0 && fs1.sueloConFarol > 200, fs1);
      const vi = await page.evaluate(VINETA);
      report.medidas['entorno-vineta'] = vi;
      check(`${nv}: viñeta cálida: el 46 % central queda intacto (alfa ${vi.centro}) y en las esquinas llega a ${vi.esquina} (tope 0,26, en marrón ${vi.color.join(',')}; la negra de upstream, unos 0,33)`, vi.centro === 0 && vi.esquina > 0.1 && vi.esquina <= 0.26, vi);
      const ll = await page.evaluate(LLUVIA_CONTRASTE);
      report.medidas['entorno-lluvia-contraste'] = ll;
      // Con los mapas propios todos los suelos son de tono medio: el borde oscuro contra el suelo más claro y el núcleo contra
      // el más oscuro quedan al informe; lo que se exige es que en cada suelo se vea la gota por el mejor de sus dos tonos.
      const mj = x => Math.max(x.borde, x.nucleo);
      check(`${nv}: lluvia de dos tonos: en los ${ll.suelosTodos} colores de suelo del juego (${ll.biomas} biomas: los 3 normales y las arenas), el mejor de los dos tonos da al menos ${mj(ll.peorTodos)}:1 (${ll.peorTodos.suelo}), y en los ${ll.suelos} de donde llueve (los 3 normales y las arenas con lluvia: ${ll.arenasConLluvia.join(', ')}), al menos ${mj(ll.peor)}:1 (${ll.peor.suelo}) (≥ 2:1 los dos); extremos: el borde oscuro contra el suelo más claro (${ll.claro.suelo}) da ${ll.claro.borde}:1 y el núcleo claro contra el más oscuro (${ll.oscuro.suelo}), ${ll.oscuro.nucleo}:1`,
        mj(ll.peorTodos) >= 2 && mj(ll.peor) >= 2 && ll.suelosTodos >= 60 && ll.suelos >= 15 && ll.arenasConLluvia.length >= 1, ll);
      // Contraste de los Pokémon contra el suelo: Dex frente a Clásico en los tres biomas (≤ 0,05 peor) y con lluvia (≤ 0,1).
      // Sin ataques mientras se mide (sólo en la prueba): un golpe enseña la barra de vida o el destello del Pokémon.
      await page.evaluate(() => { G.EnemyMgr.clear(); G.Projectiles.clear(); window.__tick = G.Combat.tick; G.Combat.tick = () => {}; });
      await page.evaluate(RODEAR, 36);
      await page.evaluate(() => { if (G.Game.state === 'playing') G.Game.togglePause(); });
      const sp = {};
      for (const [n, b] of [['bosque', 0], ['cueva', 1], ['volcan', 2]]) {
        await page.evaluate(b => G.World.setBiome(b, true), b);
        sp[n] = {};
        for (const est of ['clasico', 'dex']) { await estilo(page, est); await page.evaluate(HORNEADO); sp[n][est] = await page.evaluate(SPRITES, {}); }
      }
      // La lluvia: el mismo sitio en Dex, tras 3,3 s de partida sin lluvia y tras 3,3 s con ella.
      await page.evaluate(() => { G.World.setBiome(0, true); G.Game.togglePause(); });
      await sleep(3300);
      await page.evaluate(() => { if (G.Game.state === 'playing') G.Game.togglePause(); });
      sp.sinLluvia = { dex: await page.evaluate(SPRITES, { clima: true }) };
      await page.evaluate(() => { G.Game.togglePause(); G.Weather.onEvent(['w', 'rain', 90]); });
      await sleep(3300);
      await page.evaluate(() => { if (G.Game.state === 'playing') G.Game.togglePause(); });
      sp.lluvia = { dex: await page.evaluate(SPRITES, { clima: true }) };
      // Y la de Clásico (la de upstream), en el mismo sitio y con la misma lluvia, para compararlas.
      await page.evaluate(() => { G.Estilo.set('clasico'); G.Game.togglePause(); });
      await page.evaluate(HORNEADO);
      await sleep(3300);
      await page.evaluate(() => { if (G.Game.state === 'playing') G.Game.togglePause(); });
      sp.lluvia.clasico = await page.evaluate(SPRITES, { clima: true });
      await estilo(page, 'dex');
      await page.evaluate(() => { G.Weather.onEvent(['w']); G.Combat.tick = window.__tick; });
      report.medidas['entorno-sprites'] = sp;
      const peor = Math.max(...['bosque', 'cueva', 'volcan'].map(n => sp[n].clasico.mediana - sp[n].dex.mediana));
      // Con lluvia, el criterio de la revisión: Dex como mucho 0,1 peor que Clásico con lluvia. Lo que la lluvia de Dex le
      // quita a Dex (de 0,04 a 0,18 según el mundo, que cambia en cada partida; la de upstream, de −0,06 a +0,06) va al
      // informe y al texto: Dex sin lluvia tiene más contraste que Clásico, así que con lluvia acaban parejos (±0,07).
      check(`${nv}: contraste de los Pokémon contra el suelo (mediana de la silueta, ${sp.bosque.dex.enemigos} Pokémon): Dex como mucho 0,05 peor que Clásico en los tres biomas (${['bosque', 'cueva', 'volcan'].map(n => `${n} ${sp[n].clasico.mediana} → ${sp[n].dex.mediana}`).join(', ')}) y, con lluvia, como mucho 0,1 peor que Clásico con lluvia (${sp.lluvia.clasico.mediana} → ${sp.lluvia.dex.mediana}; la lluvia de Dex le quita a Dex ${+(sp.sinLluvia.dex.mediana - sp.lluvia.dex.mediana).toFixed(3)}: ${sp.sinLluvia.dex.mediana} → ${sp.lluvia.dex.mediana})`,
        ['bosque', 'cueva', 'volcan'].every(n => sp[n].dex.enemigos >= 20 && sp[n].dex.mediana >= sp[n].clasico.mediana - 0.05) && sp.lluvia.clasico.enemigos >= 20 && sp.lluvia.dex.mediana >= sp.lluvia.clasico.mediana - 0.1, sp);
      await page.evaluate(() => { if (G.Game.state === 'paused') G.Game.togglePause(); });
    } else {
      await page.evaluate(() => G.Weather.onEvent(['w', 'rain', 90]));
      await sleep(3300);
      await captura(page, `clima-lluvia-dex-${nv}`);
    }
    check(`${nv}: entornos: consola sin errores ni avisos`, !P.consola.length, P.consola.slice(0, 5));
    await P.ctx.close();
  }

  // --- Horneado y rendimiento, con GPU (como el PC de Nico) ---
  const bGpu = await chromium.launch({ headless: HEADLESS, args: GPU });
  try {
    const P = await nuevo(bGpu, VP.pc, { perf: true }), { page } = P, nv = nombreVp(VP.pc);
    if (await entrar(P)) {
      const gpu = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : null; });
      report.medidas['entorno-gpu'] = gpu;
      // El fondo de los menús cambia de bioma cada 30 s (con Dex): los 2 s alrededor del cambio.
      await estilo(page, 'dex');
      await apuntar(page);
      const t0 = await page.evaluate(() => G.World.biome);
      await page.waitForFunction(b => G.World.biome !== b, t0, { timeout: 40000, polling: 50 });
      await sleep(1100);
      const menu = await page.evaluate(() => { const f = window.__perf.f; let t = null; for (let i = 1; i < f.length; i++) if (f[i].bi !== f[i - 1].bi) { t = f[i].t; break; } return t; });
      const rm = await page.evaluate(RESUMEN_PERF, { desde: menu - 1000, hasta: menu + 1000 });
      report.medidas['horno-menu-' + nv] = rm;
      check(`${nv} (GPU: ${gpu}): fondo de los menús, en los 2 s alrededor del cambio de bioma de cada 30 s: ningún fotograma pasa de 20 ms (máximo ${rm.max} ms, p95 ${rm.p95}), ${horneadoTxt(rm)} y 0 chunks en el fotograma del cambio (${rm.cambio && rm.cambio.hornos})`,
        rm.n > 60 && rm.mas20 === 0 && horneadoOk(rm) && rm.cambio && rm.cambio.hornos === 0, rm);
      // En partida: de debugTime(236) a los 244 s, en Dex y en Clásico.
      for (const est of ['dex', 'clasico']) {
        await page.evaluate(e => { G.Estilo.set(e); G.Flow.play(); }, est);
        await sleep(1500);
        await page.evaluate(() => { G.Game.player.hurt = function () {}; G.Game.debugTime(236); });
        await apuntar(page);
        await page.waitForFunction(() => G.Game.st.time >= 244, null, { timeout: 30000, polling: 100 });
        const r = await page.evaluate(RESUMEN_PERF, {});
        const enCambio = r.cambio ? await page.evaluate(RESUMEN_PERF, { desde: r.cambio.t - 1000, hasta: r.cambio.t + 1000 }) : null;
        report.medidas[`horno-partida-${est}-${nv}`] = { r, enCambio };
        check(`${nv} (GPU), ${est === 'dex' ? 'Dex' : 'Clásico'}: de los 236 a los 244 s de partida (cambio de bioma a los 240): ningún fotograma pasa de 20 ms (máximo ${r.max} ms, p95 ${r.p95}), ${horneadoTxt(r)} y 0 chunks en el fotograma del cambio (${r.cambio && r.cambio.hornos})`,
          r.n > 200 && r.mas20 === 0 && horneadoOk(r) && r.cambio && r.cambio.hornos === 0, { r, enCambio });
        // Cambiar de estilo en la pausa: con el mundo Dex (G.MODS.mundoDex, desde el 14-10-2026), el mundo no cambia y no se
        // rehornea nada (antes, con Clásico = upstream, se rehorneaba de uno en uno).
        if (est === 'dex') {
          await page.evaluate(() => G.Game.togglePause());
          await apuntar(page);
          for (const e of ['clasico', 'dex']) { await estilo(page, e); await sleep(1500); }
          const rs = await page.evaluate(RESUMEN_PERF, {});
          report.medidas['horno-estilo-pausa-' + nv] = rs;
          check(`${nv} (GPU): cambiar de estilo en la pausa (a Clásico y otra vez a Dex, 3 s): el mundo es el mismo (mundoDex), así que no se rehornea nada (${rs.hornos} chunks) y ningún fotograma pasa de 20 ms (máximo ${rs.max} ms)`,
            rs.n > 60 && rs.mas20 === 0 && rs.hornos === 0, rs);
          await page.evaluate(() => G.Game.togglePause());
        }
        await page.evaluate(() => G.Game.quit());
        await sleep(600);
        await page.evaluate(() => { if (G.Game.state !== 'ui') G.Flow.goMenu(); });
        await sleep(600);
      }
      // Rendimiento Dex frente a Clásico: minuto 8 (volcán), 80 Pokémon y lluvia; el mundo quieto (debugSpeed(0)) para medir
      // sólo el dibujo, con calidad Alta; ventanas de 2,5 s alternas (Clásico, Dex, Clásico, Dex).
      const comparar = async (pagina, calidad) => {
        await pagina.evaluate(q => { G.Settings.set('quality', q); G.Estilo.set('dex'); G.Flow.play(); }, calidad);
        await sleep(1500);
        await pagina.evaluate(n => {
          G.Game.player.hurt = function () {}; G.Spawner.update = () => {}; G.EnemyMgr.clear();
          G.Game.debugTime(480); G.World.setBiome(2, true);
          const pl = G.Game.player, cam = G.Camera;
          for (let i = 0; i < n; i++) {
            const a = i * 2.39996, r = 0.1 + 0.42 * ((i * 0.618) % 1);
            const e = new G.Enemy({ dex: [1, 4, 7, 25, 52, 92, 129, 133, 143, 147][i % 10], hp: 9999, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, pl.x + Math.cos(a) * r * cam.w, pl.y + Math.sin(a) * r * cam.h, { hp: 1, spd: 1, dmg: 1 }, false);
            e.spd = 0; G.EnemyMgr.add(e);
          }
          G.Weather.onEvent(['w', 'rain', 90]);
        }, 80);
        await sleep(3300);
        await pagina.evaluate(() => G.Game.debugSpeed(0));
        const r = { clasico: [], dex: [] };
        for (const est of ['clasico', 'dex', 'clasico', 'dex']) {
          await estilo(pagina, est); await pagina.evaluate(HORNEADO); await sleep(400);
          await apuntar(pagina); await sleep(2500);
          r[est].push(await pagina.evaluate(RESUMEN_PERF, {}));
        }
        const enemigos = await pagina.evaluate(() => G.EnemyMgr.all().filter(e => !e.dead).length);
        await pagina.evaluate(() => { G.Game.debugSpeed(1); G.Game.quit(); });
        await sleep(400);
        const m = k => +((r[k][0].media + r[k][1].media) / 2).toFixed(3), p = k => +((r[k][0].p95 + r[k][1].p95) / 2).toFixed(3);
        return { clasico: { media: m('clasico'), p95: p('clasico') }, dex: { media: m('dex'), p95: p('dex') }, enemigos, ventanas: r };
      };
      const cmp = await comparar(page, 'high');
      report.medidas['rendimiento-' + nv] = cmp;
      check(`${nv} (GPU), minuto 8 con ${cmp.enemigos} Pokémon y lluvia (calidad Alta): CPU por fotograma Dex ${cmp.dex.media} ms (p95 ${cmp.dex.p95}) frente a Clásico ${cmp.clasico.media} (p95 ${cmp.clasico.p95}): Δ media ≤ 0,3 ms y Δ p95 ≤ 0,5 ms`,
        cmp.dex.media <= cmp.clasico.media + 0.3 && cmp.dex.p95 <= cmp.clasico.p95 + 0.5, cmp);
      // debugTime (sólo en la prueba) marca la partida como de depuración: G.Guard lo avisa al terminarla, y es lo esperado.
      const consola = P.consola.filter(x => !/partida no válida para el ranking: (debug|reloj)$/.test(x));
      check(`${nv} (GPU): horneado y rendimiento: consola sin errores ni avisos (menos el aviso de G.Guard por debugTime)`, !consola.length, consola.slice(0, 5));
    } else check(`${nv} (GPU): se entra a jugar`, false);
    await P.ctx.close();
  } finally { await bGpu.close().catch(() => {}); }

  // --- Móvil con la CPU ×4 (aproximación a un teléfono): 844x390@3 ---
  const bMovil = await chromium.launch({ headless: HEADLESS, args: GPU });
  try {
    const v = VP.movil, P = await nuevo(bMovil, v, { perf: true }), { page } = P, nv = nombreVp(v);
    if (await entrar(P)) {
      await page.evaluate(() => { G.Estilo.set('dex'); G.Flow.play(); });
      await sleep(1500);
      const cdp = await P.ctx.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.evaluate(() => { G.Game.player.hurt = function () {}; G.Game.debugTime(236); });
      await apuntar(page);
      await page.waitForFunction(() => G.Game.st.time >= 244, null, { timeout: 60000, polling: 200 });
      const r = await page.evaluate(RESUMEN_PERF, {});
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      report.medidas['horno-movil-cpu4'] = r;
      check(`${nv} con la CPU ×4, Dex, de los 236 a los 244 s: como mucho 1 chunk por fotograma (${r.maxHornos}; el más caro, ${r.maxMsHorno} ms) y ningún fotograma pasa de 33 ms (máximo ${r.max} ms, p95 ${r.p95}); 0 chunks en el fotograma del cambio (${r.cambio && r.cambio.hornos})`,
        r.n > 100 && r.maxHornos <= 1 && r.mas33 === 0 && r.cambio && r.cambio.hornos === 0, r);
    } else check(`${nv}: CPU ×4: se entra a jugar`, false);
    await P.ctx.close();
  } finally { await bMovil.close().catch(() => {}); }

  // --- Sin GPU (SwiftShader) y con calidad Baja: Dex frente a Clásico ---
  const bSin = await chromium.launch({ headless: HEADLESS, args: ['--disable-gpu'] });
  try {
    const P = await nuevo(bSin, VP.pc, { perf: true }), { page } = P, nv = nombreVp(VP.pc);
    if (await entrar(P)) {
      await page.evaluate(() => { G.Settings.set('quality', 'low'); G.Estilo.set('dex'); G.Flow.play(); });
      await sleep(1500);
      await page.evaluate(n => {
        G.Game.player.hurt = function () {}; G.Spawner.update = () => {}; G.EnemyMgr.clear();
        G.Game.debugTime(480); G.World.setBiome(2, true);
        const pl = G.Game.player, cam = G.Camera;
        for (let i = 0; i < n; i++) {
          const a = i * 2.39996, r = 0.1 + 0.42 * ((i * 0.618) % 1);
          const e = new G.Enemy({ dex: [1, 4, 7, 25, 52, 92, 129, 133, 143, 147][i % 10], hp: 9999, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, pl.x + Math.cos(a) * r * cam.w, pl.y + Math.sin(a) * r * cam.h, { hp: 1, spd: 1, dmg: 1 }, false);
          e.spd = 0; G.EnemyMgr.add(e);
        }
        G.Weather.onEvent(['w', 'rain', 90]);
      }, 80);
      await sleep(3300);
      await page.evaluate(() => G.Game.debugSpeed(0));
      const r = { clasico: [], dex: [] };
      for (const est of ['clasico', 'dex', 'clasico', 'dex']) {
        await estilo(page, est); await page.evaluate(HORNEADO); await sleep(400);
        await apuntar(page); await sleep(2500);
        r[est].push(await page.evaluate(RESUMEN_PERF, {}));
      }
      await page.evaluate(() => G.Game.debugSpeed(1));
      const m = k => +((r[k][0].media + r[k][1].media) / 2).toFixed(3);
      report.medidas['rendimiento-sin-gpu-baja'] = { clasico: m('clasico'), dex: m('dex'), ventanas: r };
      check(`${nv} sin GPU y con calidad Baja, minuto 8 con 80 Pokémon y lluvia: CPU por fotograma Dex ${m('dex')} ms frente a Clásico ${m('clasico')} ms: Δ ≤ 0,5 ms`, m('dex') <= m('clasico') + 0.5, r);
    } else check(`${nv} sin GPU: se entra a jugar`, false);
    await P.ctx.close();
  } finally { await bSin.close().catch(() => {}); }
}

// ---------------- 14. Ajustes de juego (lote 4) ----------------
/** Un tablero de 8x8 píxeles de arte (magenta y cian) dibujado como un sprite (posición entera de mundo, PX px de mundo por
 *  píxel de arte, con la cámara de verdad) encima de los efectos, arriba a la izquierda de tu Pokémon. */
const PONER_TABLERO = () => {
  const img = document.createElement('canvas'); img.width = 8; img.height = 8;
  const g = img.getContext('2d');
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#ff00ff' : '#00ffff'; g.fillRect(x, y, 1, 1); }
  window.__tablero = { x: 0, y: 0 };
  const orig = G.FX.draw;
  G.FX.draw = function (ctx) {
    orig.apply(this, arguments);
    const pl = G.Game.player, k = G.Sprites.PX, x = Math.round(pl.x) - 60, y = Math.round(pl.y) - 90;
    ctx.drawImage(img, x, y, 8 * k, 8 * k);
    window.__tablero = { x, y };
  };
};
/** Dónde está el tablero en la pantalla (px CSS) y cuántos píxeles físicos debería medir cada píxel de arte. */
const DONDE_TABLERO = () => {
  const cam = G.Camera, T = window.__tablero, k = G.Sprites.PX, d = devicePixelRatio;
  return { x: (T.x - cam.left() + cam._sx) * cam.scale, y: (T.y - cam.top() + cam._sy) * cam.scale, lado: 8 * k * cam.scale, fisicos: k * cam.scale * d,
    calc: G.Encuadre.calcular(innerWidth, innerHeight, d), estado: G.Encuadre.estado, dpr: d };
};
/** Las rachas de un mismo color (magenta o cian) por filas y columnas de una captura del tablero (en la página: la
 *  imagen se lee con un lienzo). Devuelve las longitudes interiores (sin la primera ni la última de cada línea). */
const RACHAS = async b64 => {
  const im = new Image();
  await new Promise((ok, mal) => { im.onload = ok; im.onerror = mal; im.src = 'data:image/png;base64,' + b64; });
  const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d', { willReadFrequently: true }); c.drawImage(im, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
  const clase = i => { const r = d[i], g = d[i + 1], b = d[i + 2]; if (r > 170 && g < 90 && b > 170) return 1; if (r < 90 && g > 170 && b > 170) return 2; return 0; };
  const rachas = [];
  const linea = (n, at) => {
    let cur = -1, len = 0;
    const L = [];
    for (let i = 0; i < n; i++) { const k = at(i); if (k === cur) len++; else { if (cur > 0) L.push(len); cur = k; len = 1; } }
    if (cur > 0) L.push(len);
    rachas.push(...L.slice(1, -1));
  };
  for (const f of [0.3, 0.5, 0.7]) { const y = Math.floor(H * f); linea(W, x => clase((y * W + x) * 4)); }
  for (const f of [0.3, 0.5, 0.7]) { const x = Math.floor(W * f); linea(H, y => clase((y * W + x) * 4)); }
  return { W, H, rachas };
};
const MEDIR_GOLPE = () => new Promise(res => {
  const pl = G.Game.player;
  pl.hurt = function () {};
  const b = new G.Enemy({ dex: 983, hp: 50, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, pl.x + 70, pl.y + 10, { hp: 1, spd: 1, dmg: 1 }, true);
  b.spd = 0; G.EnemyMgr.add(b);
  const m = [];
  let n = 0;
  const paso = () => { m.push([performance.now(), G.Game.st.time]); if (++n < 50) requestAnimationFrame(paso); else res(m); };
  requestAnimationFrame(() => { m.push([performance.now(), G.Game.st.time]); b.hp = 0; b.die(); requestAnimationFrame(paso); });
});
/** El centro del lienzo del juego justo después de pintar el iris, en el primer fotograma de la arena y en el de la vuelta. */
const VIGILAR_TIRON = () => {
  const orig = G.Transicion.dibujar;
  let antes = G.Rift.inArena;
  window.__tiron = { entrada: null, vuelta: null, cerrando: false };
  G.Transicion.dibujar = function (ctx) {
    orig.apply(this, arguments);
    const ahora = G.Rift.inArena, cv = ctx.canvas;
    const px = () => Array.from(ctx.getImageData(cv.width >> 1, cv.height >> 1, 1, 1).data.slice(0, 3));
    if (ahora && !antes && !window.__tiron.entrada) window.__tiron.entrada = px();
    if (!ahora && antes && !window.__tiron.vuelta) window.__tiron.vuelta = px();
    if (G.Transicion.fase === 'cerrando') window.__tiron.cerrando = true;
    antes = ahora;
  };
};

async function pruebaJuego(browser) {
  // Píxel nítido: las columnas de un mismo píxel de arte miden lo mismo en píxeles físicos.
  for (const v of [{ w: 1440, h: 900, dpr: 1 }, { w: 844, h: 390, dpr: 3, tactil: true }, { w: 844, h: 390, dpr: 2.625, tactil: true }]) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: píxel nítido: se entra a jugar`, false); await P.ctx.close(); continue; }
    const res = {};
    for (const nitido of [true, false]) {
      await page.evaluate(n => { G.Settings.set('pixelNitido', n); dispatchEvent(new Event('resize')); if (G.Game.state === 'ui') G.Flow.play(); }, nitido);
      await page.evaluate(PONER_TABLERO);
      await sleep(1200);
      await page.evaluate(() => { G.Game.togglePause(); G.UI.hideAll(); });   // quieto: la cámara ya no se mueve
      await sleep(200);
      const t = await page.evaluate(DONDE_TABLERO);
      const shot = await page.screenshot({ clip: { x: t.x + 2, y: t.y + 2, width: t.lado - 4, height: t.lado - 4 } });
      const m = await page.evaluate(RACHAS, shot.toString('base64'));
      const n = Math.round(t.fisicos), iguales = m.rachas.length > 10 && m.rachas.every(x => x === m.rachas[0]);
      res[nitido ? 'nitido' : 'upstream'] = { fisicos: +t.fisicos.toFixed(3), rachas: [...new Set(m.rachas)], n, iguales, dentro: m.rachas.length, img: [m.W, m.H] };
      if (nitido) await captura(page, `pixel-nitido-${nv}`);
      await page.evaluate(() => { G.Game.togglePause(); });
    }
    report.medidas['pixel-' + nv] = res;
    const N = res.nitido;
    check(`${nv}: píxel nítido: cada píxel de arte mide ${N.fisicos} px físicos y todas las columnas y filas de un tablero dibujado como un sprite miden lo mismo (rachas: ${N.rachas.join(', ')}); sin el ajuste, como upstream, ${res.upstream.fisicos} px (rachas: ${res.upstream.rachas.join(', ')})`,
      N.iguales && Number.isInteger(N.fisicos) && N.rachas[0] === N.fisicos, res);
    check(`${nv}: consola sin errores ni avisos (píxel nítido)`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    await P.ctx.close();
  }

  // Encuadre, iris, golpe final y Ajustes en un móvil en horizontal (Dex) y en escritorio.
  for (const v of [VP.movil, VP.pc]) {
    const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: lote 4: se entra a jugar`, false); await P.ctx.close(); continue; }
    // Ajustes > Gráficos: «Píxel nítido», al final de la sección Pantalla, activado.
    const aj = await page.evaluate(() => {
      G.Estilo.set('dex'); G.SettingsUI.open('gfx');
      const filas = [...document.querySelectorAll('#set-body h3.set-h, #set-body .set-row')].map(e => (e.matches('h3') ? '# ' : '') + (e.querySelector('b') || e).textContent.trim());
      const b = document.querySelector('[data-pixel]');
      const r = { filas, boton: b && b.textContent };
      b.click();
      r.trasClic = G.Encuadre.nitido();
      document.querySelector('[data-pixel]').click();
      r.otraVez = G.Encuadre.nitido();
      G.SettingsUI.close();
      return r;
    });
    const iP = aj.filas.indexOf('# Pantalla'), iPx = aj.filas.indexOf('Píxel nítido');
    check(`${nv}: Ajustes > Gráficos > Pantalla: «Píxel nítido» (Sí por defecto) al final de la sección, y el botón lo cambia`,
      iP >= 0 && iPx > iP && aj.filas.slice(iP + 1).every((f, i) => i <= iPx - iP - 1 || f.startsWith('# ')) && aj.boton === 'Sí' && aj.trasClic === false && aj.otraVez === true, aj);
    await page.evaluate(() => { G.Flow.play(); });
    await sleep(1600);
    // Encuadre (sólo en compacto): tu Pokémon en el centro de la zona libre.
    const enc = await page.evaluate(() => {
      const B = G.HudDex.bandas(), cam = G.Camera, pl = G.Game.player;
      return { variante: B.variante, pl: [(pl.x - cam.left()) * cam.scale, (pl.y - cam.top()) * cam.scale], zona: [B.zona.x + B.zona.w / 2, B.zona.y + B.zona.h / 2], centro: [innerWidth / 2, innerHeight / 2] };
    });
    report.medidas['encuadre-' + nv] = enc;
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    check(enc.variante === 'compacto' ? `${nv}: encuadre: tu Pokémon en el centro de la zona libre del HUD compacto (a ${d(enc.pl, enc.zona).toFixed(1)} px, ±4)` : `${nv}: encuadre: con el HUD de escritorio, tu Pokémon en el centro de la pantalla`,
      enc.variante === 'compacto' ? d(enc.pl, enc.zona) <= 4 : d(enc.pl, enc.centro) <= 2, enc);
    // Golpe final: un jefe cae en solitario.
    const m = await page.evaluate(MEDIR_GOLPE);
    const per = m.slice(1).map((x, i) => x[0] - m[i][0]).sort((a, b) => a - b)[Math.floor(m.length / 2)];
    let i0 = 0;
    while (i0 + 1 < m.length && m[i0 + 1][1] > m[i0][1]) i0++;           // el último fotograma que avanzó antes de quedarse quieto
    let i1 = i0 + 1;
    while (i1 < m.length && m[i1][1] === m[i0][1]) i1++;                // el primero que vuelve a avanzar
    const quieto = i1 < m.length ? m[i1][0] - m[i0][0] - per : null;
    report.medidas['golpe-final-' + nv] = { quieto, periodo: per };
    check(`${nv}: golpe final: al caer un jefe en solitario el juego se queda quieto ${quieto && quieto.toFixed(0)} ms (140 ± 17, medido con el reloj de la partida)`, quieto !== null && Math.abs(quieto - 140) <= 17, { quieto, per, muestras: m.slice(0, 20) });
    if (v === VP.movil) {
      // Iris: el fotograma del tirón al entrar en la arena, negro; a mitad de la apertura (más lenta, sólo aquí), el fogonazo
      // dentro del círculo y negro fuera; y la vuelta (también en negro, tras cerrarse).
      await page.evaluate(VIGILAR_TIRON);
      // La apertura, más lenta sólo aquí (1,2 s en vez de 280 ms) para pillarla a medias con el fogonazo (0,9 s) aún encima.
      await page.evaluate(() => { G.Transicion.T.abrir = 1.2; G.Rift.debugArena('fire'); });
      await page.evaluate(GRABAR_AVISOS);   // después: lo que hubiera en la ranura antes de entrar no cuenta
      await sleep(300);
      const mitad = await page.evaluate(() => ({ fase: G.Transicion.fase, a: G.Transicion.apertura(performance.now() / 1000) }));
      await captura(page, 'iris-mitad-dex-' + nv);
      const px = await page.evaluate(() => { const cv = document.getElementById('game'), c = cv.getContext('2d'); const p = (x, y) => Array.from(c.getImageData(x, y, 1, 1).data.slice(0, 3)); return { esquina: p(2, 2), centro: p(cv.width >> 1, (cv.height >> 1) - 10) }; });
      await page.evaluate(() => { G.Transicion.T.abrir = 0.28; });
      await sleep(600);
      // El rótulo de la arena (verificación del 13-10-2026: en solitario no salía nunca; rift.js dice dos avisos seguidos).
      await captura(page, 'rotulo-arena-dex-' + nv);
      const avisos = await page.evaluate(() => window.__avisos);
      report.medidas['rotulo-arena-' + nv] = avisos;
      check(`${nv}: al entrar en la arena jugando solo, el rótulo de zona de la arena por la ranura de avisos (en compacto, una línea: «${avisos[0] && avisos[0].texto}»), lo primero que sale`,
        avisos.length >= 1 && avisos[0].tipo === 'zona' && /^Grieta · /.test(avisos[0].texto), avisos);
      // Se vence al legendario y la espera de la vuelta se acorta (sólo en la prueba).
      // (Sin su experiencia: las cartas de subir de nivel pararían la vuelta.)
      await page.evaluate(() => { const e = G.EnemyMgr.all().find(x => x.legend && !x.dead); if (e) { e.xp = 0; e.hp = 0; e.die(); } });
      await sleep(400);
      await page.evaluate(() => { if (G.Rift.arena) G.Rift.arena.endT = Math.min(G.Rift.arena.endT, 0.9); });
      const traza = [];
      // Si sale un diálogo (cambiar de objeto: el jefe de antes dejó uno), se elige el primero, como haría el jugador.
      for (let i = 0; i < 40 && await page.evaluate(() => G.Rift.inArena); i++) {
        traza.push(await page.evaluate(() => {
          if (G.Game.state === 'levelup') G.RunUI.pick(0);
          else if (G.UI.isOpen('scr-item')) document.querySelector('#item-cards .card').click();
          return [G.Game.state, G.Rift.arena && G.Rift.arena.phase, G.Rift.arena && +G.Rift.arena.endT.toFixed(2), G.Transicion.fase];
        }));
        await sleep(100);
      }
      report.medidas['iris-traza'] = traza;
      await sleep(300);
      const tiron = await page.evaluate(() => Object.assign({ fuera: !G.Rift.inArena }, window.__tiron));
      const negro = c => c && Math.max(Math.abs(c[0] - 5), Math.abs(c[1] - 14), Math.abs(c[2] - 18)) <= 3;
      report.medidas['iris-' + nv] = { mitad, px, tiron };
      check(`${nv}: iris: el fotograma del tirón al entrar en la arena es negro (${tiron.entrada}); a mitad de la apertura (${mitad.a.toFixed(2)}) negro fuera del círculo y el mundo con el fogonazo dentro; al volver, se cierra antes y el fotograma de la vuelta también es negro (${tiron.vuelta})`,
        negro(tiron.entrada) && mitad.fase === 'abriendo' && mitad.a > 0.2 && mitad.a < 0.8 && negro(px.esquina) && !negro(px.centro) && tiron.fuera && tiron.cerrando && negro(tiron.vuelta), { tiron, mitad, px });
    }
    if (v === VP.pc) {
      // El rótulo de la arena en escritorio, en dos líneas: su nombre y «Grieta de tipo Fuego».
      await page.evaluate(() => G.Rift.debugArena('fire'));
      await page.evaluate(GRABAR_AVISOS);
      await sleep(700);
      await captura(page, 'rotulo-arena-dex-' + nv);
      const av = await page.evaluate(() => window.__avisos);
      report.medidas['rotulo-arena-' + nv] = av;
      check(`${nv}: al entrar en la arena jugando solo, el rótulo de zona en dos líneas («${av[0] && av[0].titulo}» y «${av[0] && av[0].sub}»), lo primero que sale`,
        av.length >= 1 && av[0].tipo === 'zona' && !!av[0].titulo && av[0].sub === 'Grieta de tipo Fuego', av);
    }
    check(`${nv}: consola sin errores ni avisos (lote 4)`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    await P.ctx.close();
  }
}

// ---------------- 15. Pantalla dividida estilo Nintendo DS (lote 5) ----------------
/** Lo que se mide de la pantalla dividida en este momento. */
const MEDIR_DIVIDIDA = () => {
  const R = G.Dividida.activa(), cv = document.getElementById('game').getBoundingClientRect(), md = document.getElementById('mandos');
  const pm = md && md.style.display !== 'none' ? md.getBoundingClientRect() : null;
  const B = G.HudDex.bandas(), P = B.piezas, L = G.Dividida.panel;
  const piezas = [];
  for (const k of Object.keys(P)) { const v = P[k]; (Array.isArray(v) ? v : [v]).forEach((x, i) => { if (x && x.w && x.h) piezas.push({ n: k + (Array.isArray(v) ? i : ''), x: x.x, y: x.y, w: x.w, h: x.h }); }); }
  const r = o => o && { x: Math.round(o.x), y: Math.round(o.y), w: Math.round(o.width), h: Math.round(o.height) };
  return { R, juego: r(cv), panel: r(pm), piezas, botones: G.Dividida.botonesPantalla(), stick: L && L.stick, horizontal: L && L.horizontal, hudDex: G.Estilo.hudDex(),
    pagina: document.documentElement.scrollWidth - innerWidth, segs: G.Dividida.segmentos(), postura: G.Dividida.postura(), estado: G.Game.state, t: G.Game.st.time,
    escala: G.Camera.scale, dpr: devicePixelRatio,
    // Tu Pokémon en la ventana (px CSS) y la mitad de su sprite (como lo aparta G.Encuadre del pliegue).
    jugador: (() => { const pl = G.Game.player, cam = G.Camera, J = R ? R.juego : { x: 0, y: 0 }; return pl && { x: J.x + (pl.x - cam.left()) * cam.scale, y: J.y + (pl.y - cam.top()) * cam.scale,
      medio: Math.max(pl.r || 12, (pl.bodyH || 30) / 2) * cam.scale, alto: (pl.bodyH || 30) * cam.scale }; })() };
};
/** Apunta, fotograma a fotograma, cada aviso que se ve en la ranura del HUD Dex (window.__avisos). */
const GRABAR_AVISOS = () => {
  window.__avisos = [];
  const f = () => {
    const v = G.HudDex && G.HudDex.Avisos.visible, a = window.__avisos;
    if (v && !v.saliendo && (!a.length || a[a.length - 1].texto !== v.texto)) a.push({ tipo: v.tipo, texto: v.texto, titulo: v.titulo || null, sub: v.sub || null, tactil: !!G.Touch.active });
    if (a.length < 30) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
};
/** ¿Está todo donde debe? Devuelve la lista de problemas. */
function revisarDividida(m, mg) {
  const mal = [];
  if (!m.R) return ['sin dividir'];
  const J = m.R.juego, K = m.R.controles;
  const igual = (a, b) => a && b && Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.w - b.w) <= 1 && Math.abs(a.h - b.h) <= 1;
  if (!igual(m.juego, J)) mal.push(`el lienzo del juego (${JSON.stringify(m.juego)}) no es el rectángulo de juego`);
  if (!igual(m.panel, K)) mal.push(`el panel (${JSON.stringify(m.panel)}) no es el rectángulo de los mandos`);
  if (m.pagina > 0) mal.push('desplazamiento horizontal');
  if (!m.hudDex) mal.push('no va el HUD Dex');
  for (const p of m.piezas) {
    if (['ficha', 'pausa', 'objeto', 'vinculo'].includes(p.n) || /^ranuras/.test(p.n)) mal.push(`el HUD repite ${p.n}`);
    // Lejos de la división: en el lienzo del juego (px del lienzo), nada a menos de mg del borde que da al panel.
    const lado = K.lado;
    if (lado === 'abajo' && p.y + p.h > J.h - mg + 0.5) mal.push(`${p.n} junto a la división`);
    if (lado === 'derecha' && p.x + p.w > J.w - mg + 0.5) mal.push(`${p.n} junto a la división`);
    if (lado === 'izquierda' && p.x < mg - 0.5) mal.push(`${p.n} junto a la división`);
  }
  for (const b of m.botones) {
    if (b.x < K.x - 0.5 || b.y < K.y - 0.5 || b.x + b.w > K.x + K.w + 0.5 || b.y + b.h > K.y + K.h + 0.5) mal.push(`${b.que} fuera del panel`);
    if (b.w < 44 || b.h < 44) mal.push(`${b.que} de menos de 44 px`);
    const pg = m.R.pliegue;
    if (pg) { const a = pg.pos - pg.ancho / 2 - mg + 0.5, z = pg.pos + pg.ancho / 2 + mg - 0.5; if (pg.eje === 'x' ? b.x < z && b.x + b.w > a : b.y < z && b.y + b.h > a) mal.push(`${b.que} sobre el pliegue`); }
    if (K.lado === 'abajo' && b.y < K.y + mg - 0.5) mal.push(`${b.que} junto a la división`);
  }
  return mal;
}
async function preparar(page) {
  await page.evaluate(() => {
    const pl = G.Game.player;
    for (const id of Object.keys(G.Moves.BY_ID).filter(id => !pl.hasMove(id) && G.Moves.BY_ID[id].kind !== 'buff').slice(0, Math.max(0, 4 - pl.slots.length))) pl.addMove(id);
    pl.setActive(0); pl.item = Object.keys(G.Items.BY)[0]; pl.hurt = function () {};
  });
}
/** Arrastrar con el dedo (CDP: pointer events de tipo touch) de (x0, y0) a (x1, y1) y mantenerlo `ms`. */
async function arrastrar(cdp, x0, y0, x1, y1, ms = 600) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
  for (let i = 1; i <= 5; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 5, y: y0 + (y1 - y0) * i / 5, id: 1 }] }); await sleep(16); }
  await sleep(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function capturaCdp(cdp, nombre) {
  if (!CAPTURAS) return null;
  const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const f = nombre + '.png';
  fs.writeFileSync(path.join(OUT, f), Buffer.from(r.data, 'base64'));
  report.capturas.push(f);
  return f;
}

async function pruebaDividida(browser) {
  const MG = 16;
  const casos = [
    { n: 'interior-vertical', v: { w: 724, h: 784, dpr: 3, tactil: true }, modo: 'abajo', esperado: { juego: [0, 0, 724, 392], pliegue: 'x' } },
    { n: 'interior-horizontal', v: { w: 784, h: 724, dpr: 3, tactil: true }, modo: 'abajo', esperado: { juego: [0, 0, 784, 362] }, cambio: true },
    { n: 'barra-724x700', v: { w: 724, h: 700, dpr: 3, tactil: true, pantalla: [724, 784] }, modo: 'abajo', esperado: { juego: [0, 0, 724, 350], pliegue: 'x' } },
    { n: 'mesa-784x362', v: { w: 784, h: 724, dpr: 3, tactil: true }, modo: 'auto', plegar: { orientation: 'horizontal', offset: 362, maskLength: 0 }, esperado: { juego: [0, 0, 784, 362], controlesY: 362 } },
    { n: 'mesa-mascara', v: { w: 784, h: 724, dpr: 3, tactil: true }, modo: 'abajo', plegar: { orientation: 'horizontal', offset: 352, maskLength: 20 }, esperado: { juego: [0, 0, 784, 352], controlesY: 372 } },
    { n: 'libro-a-un-lado', v: { w: 724, h: 784, dpr: 3, tactil: true }, modo: 'lado', lado: 'derecha', plegar: { orientation: 'vertical', offset: 362, maskLength: 0 }, esperado: { juego: [0, 0, 362, 784] } },
    // Plegado en libro con «abajo»: la bisagra cruza la mitad de juego y tu Pokémon se aparta de ella (verificación del 13-10-2026).
    { n: 'libro-abajo', v: { w: 724, h: 784, dpr: 3, tactil: true }, modo: 'abajo', plegar: { orientation: 'vertical', offset: 362, maskLength: 0 }, esperado: { juego: [0, 0, 724, 392], pliegue: 'x' } },
    { n: 'escritorio-abajo', v: VP.pc, modo: 'abajo', esperado: { juego: [0, 0, 1440, 450] }, raton: true },
    { n: 'escritorio-izquierda', v: VP.pc, modo: 'lado', lado: 'izquierda', estilo: 'clasico', esperado: { juego: [720, 0, 720, 900] }, raton: true },
    // Un móvil (verificación del 13-10-2026: con el píxel nítido, la mitad de juego se quedaba a 0,333 y los Pokémon en puntos).
    { n: 'movil-abajo', v: VP.movil, modo: 'abajo', esperado: { juego: [0, 0, 844, 195] } },
    { n: 'movil-a-un-lado', v: VP.movil, modo: 'lado', lado: 'derecha', esperado: { juego: [0, 0, 422, 390] } }
  ];
  for (const k of casos) {
    const P = await nuevo(browser, k.v), { page } = P, nv = `dividida ${k.n} ${nombreVp(k.v)}`;
    if (!await entrar(P)) { check(`${nv}: se entra a jugar`, false); await P.ctx.close(); continue; }
    const cdp = await P.ctx.newCDPSession(page);
    const metricas = (postura, rasgo) => cdp.send('Emulation.setDeviceMetricsOverride', Object.assign({ width: k.v.w, height: k.v.h, deviceScaleFactor: k.v.dpr || 1, mobile: !!k.v.tactil,
      devicePosture: { type: postura } }, rasgo ? { displayFeature: rasgo } : {}));
    if (k.plegar) { await metricas('folded', k.plegar); await sleep(200); }
    // El ajuste, por la interfaz de Ajustes > Controles (en el menú).
    const ui = await page.evaluate(([modo, lado, estilo]) => {
      G.Estilo.set(estilo || 'dex');
      G.SettingsUI.open('ctl');
      const chips = [...document.querySelectorAll('[data-k="dividida"]')].map(b => b.textContent);
      const b = document.querySelector(`[data-k="dividida"][data-v="${modo}"]`); b.click();
      const l = lado && document.querySelector(`[data-k="divididaLado"][data-v="${lado}"]`); if (l) l.click();
      const nota = document.getElementById('set-dividida-nota');
      const r = { chips, modo: G.Dividida.modo(), lado: G.Dividida.lado(), nota: nota && nota.textContent };
      G.SettingsUI.close();
      return r;
    }, [k.modo, k.lado, k.estilo]);
    await page.evaluate(() => G.Flow.play());
    await page.evaluate(GRABAR_AVISOS);
    await sleep(900);
    if (k.plegar) { await metricas('folded', k.plegar); await sleep(300); }   // Playwright puede reaplicar sus métricas
    await preparar(page);
    await sleep(700);
    const m = await page.evaluate(MEDIR_DIVIDIDA);
    report.medidas[nv] = m;
    const J = m.R && m.R.juego, e = k.esperado;
    const mal = revisarDividida(m, MG);
    const juegoOk = J && J.x === e.juego[0] && J.y === e.juego[1] && J.w === e.juego[2] && J.h === e.juego[3] && (!e.controlesY || m.R.controles.y === e.controlesY) && (!e.pliegue || (m.R.pliegue && m.R.pliegue.eje === e.pliegue));
    check(`${nv}: Ajustes > Controles (${ui.chips.join(' · ')}) → «${k.modo}»${k.estilo ? ' en Clásico' : ''}${k.plegar ? `, plegado (${k.plegar.orientation}, máscara ${k.plegar.maskLength})` : ''}: juego ${J ? `${J.w}x${J.h} en ${J.x},${J.y}` : '—'}${m.R && m.R.fuente === 'bisagra' ? ' (en la bisagra)' : ''}, el HUD Dex sin ficha ni ranuras y nada a menos de ${MG} px de la división ni sobre el pliegue; botones del panel de 44 px o más`,
      ui.chips.length === 4 && ui.modo === k.modo && juegoOk && !mal.length, { ui, R: m.R, mal: mal.slice(0, 6), juego: m.juego, panel: m.panel });
    // Con el móvil plegado y la bisagra cruzando la mitad de juego, tu Pokémon fuera de su franja (y de 16 px más).
    if (m.R && m.R.pliegue && m.postura === 'folded') {
      const pg = m.R.pliegue, jx = m.jugador, banda = (pg.ancho || 0) / 2 + MG;
      const lejos = pg.eje === 'x' ? Math.abs(jx.x - pg.pos) - jx.medio : Math.max(pg.pos - jx.y, jx.y - jx.alto - pg.pos);
      check(`${nv}: plegado, con la bisagra cruzando la mitad de juego: tu Pokémon, apartado de ella (su sprite a ${lejos.toFixed(1)} px de la línea; la franja más el margen, ${banda} px)`,
        lejos >= banda - 2, { jugador: jx, pliegue: pg });
    }
    // El tamaño del mundo en la mitad de juego: un píxel de arte de 1,2 px CSS o más y un número entero de px físicos.
    const fis = 2 * m.escala * m.dpr;
    check(`${nv}: el mundo en la mitad de juego a ×${+m.escala.toFixed(3)}: un píxel de arte mide ${+(2 * m.escala).toFixed(2)} px CSS (≥ 1,2: los Pokémon no se quedan en puntos) y ${+fis.toFixed(3)} px físicos (entero)`,
      2 * m.escala >= 1.2 - 1e-9 && Math.abs(fis - Math.round(fis)) < 1e-6, { escala: m.escala, dpr: m.dpr });
    // Tocar el ataque 2 (dedo o ratón) y mover el joystick del panel.
    const b2 = m.botones.find(b => b.que === 'ataque2');
    if (k.raton) await page.mouse.click(b2.x + b2.w / 2, b2.y + b2.h / 2); else await page.touchscreen.tap(b2.x + b2.w / 2, b2.y + b2.h / 2);
    await sleep(150);
    const activo = await page.evaluate(() => G.Game.player.active);
    const S = m.stick, K = m.R.controles, cx = K.x + S.cx, cy = K.y + S.cy;
    const x0 = await page.evaluate(() => G.Game.player.x);
    if (k.raton) { await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + S.r, cy, { steps: 5 }); await sleep(600); await page.mouse.up(); }
    else await arrastrar(cdp, cx, cy, cx + S.r, cy);
    const x1 = await page.evaluate(() => G.Game.player.x);
    let teclado = null;
    if (k.raton) {
      await page.keyboard.down('KeyA'); await sleep(500); await page.keyboard.up('KeyA');
      teclado = (await page.evaluate(() => G.Game.player.x)) - x1;
    }
    check(`${nv}: ${k.raton ? 'con el ratón' : 'con el dedo'}, el ataque 2 del panel se elige y el joystick del panel mueve a tu Pokémon a la derecha (${Math.round(x1 - x0)} px de mundo)${k.raton ? `; el teclado sigue (A: ${Math.round(teclado)})` : ''}`,
      activo === 1 && x1 - x0 > 40 && (!k.raton || teclado < -40), { activo, dx: x1 - x0, teclado });
    // La pista de controles de la ranura de avisos: con el dedo, la del joystick del panel (no «Arrastra el dedo…»).
    await page.waitForFunction(() => (window.__avisos || []).some(a => a.tipo === 'pista'), null, { timeout: 6000 }).catch(() => {});
    const pista = await page.evaluate(() => (window.__avisos || []).find(a => a.tipo === 'pista') || null);
    check(`${nv}: la pista de controles ${k.raton ? 'con el ratón, la del teclado' : 'con el dedo, la del joystick del panel'} («${pista && pista.texto}»)`,
      pista && (k.raton ? /^WASD/.test(pista.texto) : pista.tactil && /^Mueve con el joystick/.test(pista.texto)), { pista, avisos: await page.evaluate(() => window.__avisos) });
    if (k.plegar) await capturaCdp(cdp, `dividida-${k.n}-${k.estilo || 'dex'}-${nombreVp(k.v)}`);
    else await captura(page, `dividida-${k.n}-${k.estilo || 'dex'}-${nombreVp(k.v)}`);
    if (k.plegar && k.modo === 'auto') {
      // Desplegar en plena partida: pantalla entera sin reiniciar; replegar: otra vez dividida.
      const t0 = m.t;
      await metricas('continuous', null); await sleep(400);
      const plano = await page.evaluate(MEDIR_DIVIDIDA);
      await metricas('folded', k.plegar); await sleep(400);
      const otra = await page.evaluate(MEDIR_DIVIDIDA);
      await capturaCdp(cdp, `dividida-${k.n}-replegado-dex-${nombreVp(k.v)}`);
      check(`${nv}: automática: al desplegar en plena partida, la pantalla entera (${plano.juego.w}x${plano.juego.h}, sin el panel) sin reiniciar; al volver a plegar, dividida otra vez en la bisagra`,
        !plano.R && !plano.panel && plano.juego.w === 784 && plano.juego.h === 724 && plano.t >= t0 && otra.R && otra.R.juego.h === 362 && otra.t >= plano.t, { plano: { R: plano.R, juego: plano.juego, t: plano.t }, otra: { R: otra.R, t: otra.t }, t0 });
    }
    if (k.cambio) {
      // Cambiar el modo en plena partida (desde la pausa): recoloca sin reiniciar.
      const antes = await page.evaluate(() => ({ t: G.Game.st.time, kills: G.Game.player.kills, id: (window.__pl = G.Game.player, 1) }));
      await page.evaluate(() => { G.Game.togglePause(); document.getElementById('btn-pause-settings').click(); G.SettingsUI.open('ctl'); document.querySelector('[data-k="dividida"][data-v="lado"]').click(); G.SettingsUI.close(); G.Game.togglePause(); });
      await sleep(500);
      const tras = await page.evaluate(MEDIR_DIVIDIDA);
      const mismo = await page.evaluate(() => window.__pl === G.Game.player);
      await page.evaluate(() => { G.Game.togglePause(); document.getElementById('btn-pause-settings').click(); G.SettingsUI.open('ctl'); document.querySelector('[data-k="dividida"][data-v="no"]').click(); G.SettingsUI.close(); G.Game.togglePause(); });
      await sleep(500);
      const sin = await page.evaluate(MEDIR_DIVIDIDA);
      check(`${nv}: cambiar el modo en plena partida desde la pausa recoloca sin reiniciar (a un lado: juego ${tras.R && tras.R.juego.w}x${tras.R && tras.R.juego.h}; desactivada: la pantalla entera, sin el panel), con la misma partida`,
        mismo && tras.R && tras.R.juego.w === 392 && tras.R.juego.h === 724 && !revisarDividida(tras, MG).length && !sin.R && !sin.panel && sin.juego.w === 784 && sin.juego.h === 724 && sin.t >= antes.t,
        { tras: tras.R, mal: revisarDividida(tras, MG), sin: { R: sin.R, juego: sin.juego }, mismo });
    }
    // Volver al menú: la pantalla entera otra vez.
    await page.evaluate(() => { G.UI.hideAll(); G.Game.quit(); G.Flow.goMenu(); });
    await sleep(400);
    const menu = await page.evaluate(MEDIR_DIVIDIDA);
    check(`${nv}: en el menú, la pantalla entera (sin panel) y el HUD de su estilo; consola sin errores ni avisos`,
      !menu.R && !menu.panel && menu.juego.w === k.v.w && menu.juego.h === k.v.h && !P.consola.length && !P.fuera.length, { menu: { R: menu.R, juego: menu.juego, panel: menu.panel }, consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    await P.ctx.close();
  }
}

// ---------------- 16. «Elige a tu compañero» sin el test de personalidad (G.MODS.sinTest) ----------------
// Los tamaños que pidió Nico (escritorio, el móvil y el Magic V6: abierto en las dos posturas y con la barra del navegador,
// el exterior y la mitad de arriba en modo mesa) y los otros plegables.
const COMPANERO_VP = [VP.pc, VP.fhd, VP.tab, VP.movil, VP.movilBajo, VP.exterior, { w: 784, h: 362, dpr: 3, tactil: true, pantalla: [784, 724] },
  VP.pleg1, VP.pleg2, { w: 724, h: 700, dpr: 3, tactil: true, pantalla: [724, 784] }, { w: 784, h: 640, dpr: 3, tactil: true, pantalla: [784, 724] }, VP.pleg3, VP.pleg4];

/** Vigilante del test de personalidad desde el arranque: apunta si #scr-test llega a verse (con sinTest, nunca). */
const VIGIA_TEST = () => {
  window.__testVisto = false;
  const mirar = () => { const t = document.getElementById('scr-test'); if (t && !t.classList.contains('hidden')) window.__testVisto = true; };
  document.addEventListener('DOMContentLoaded', () => new MutationObserver(mirar).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }));
};

/** «Elige a tu compañero» abierta: la caja, la rejilla y cada celda (nombre, tipos, lienzo) y los botones. */
const MEDIR_COMPANERO = () => {
  const W = innerWidth, H = innerHeight, rr = el => el.getBoundingClientRect(), de = document.documentElement;
  const scr = document.getElementById('scr-starters'), box = scr.querySelector('.box'), grid = document.getElementById('starter-grid');
  const B = rr(box), d = G.ElegirCompanero.disp, dpr = devicePixelRatio || 1;
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && rr(el).width > 0;
  const dentroDe = (q, r) => q.left >= r.left - 0.5 && q.right <= r.right + 0.5 && q.top >= r.top - 0.5 && q.bottom <= r.bottom + 0.5;
  const celdas = [...grid.querySelectorAll('.ec-celda')], fuera = [], cortados = [], tipos = [], lienzos = [];
  for (const c of celdas) {
    const r = rr(c), dex = +c.dataset.dex, mon = G.DEX_BY[dex];
    if (!dentroDe(r, B) || !dentroDe(r, { left: 0, top: 0, right: W, bottom: H }) || r.height < 44 || r.width < 44) fuera.push(dex);
    for (const x of c.querySelectorAll('canvas, b, .ec-tipos')) if (vis(x) && !dentroDe(rr(x), r)) fuera.push(dex + ':' + x.className + x.tagName);
    const b = c.querySelector('b');
    if (b.scrollWidth > b.clientWidth || b.textContent !== mon.name) cortados.push(dex);
    // Tipos: con su nombre (las píldoras de G.UI.typeChips) o con su emblema (uno por tipo); siempre en la etiqueta accesible.
    const nombres = mon.types.map(t => G.T(G.U.TYPE_NAME[t])), txt = c.querySelector('.ec-txt'), emb = c.querySelector('.ec-emb');
    const conTexto = vis(txt) && [...txt.children].map(x => x.textContent.trim()).join('|') === nombres.join('|') && [...txt.children].every(x => dentroDe(rr(x), r));
    const conEmblema = vis(emb) && emb.querySelectorAll('img').length === mon.types.length && dentroDe(rr(emb), r);
    const etiqueta = c.getAttribute('aria-label') || '';
    if (!(conTexto || conEmblema) || !etiqueta.includes(mon.name) || !nombres.every(n => etiqueta.includes(n))) tipos.push({ dex, conTexto, conEmblema, etiqueta });
    // El lienzo mide lo que se ve en píxeles físicos enteros y el sprite va a k píxeles físicos por píxel de arte.
    const cv = c.querySelector('canvas'), q = cv && rr(cv);
    if (!cv || Math.abs(cv.width - q.width * dpr) > 0.6 || cv.height !== G.ElegirCompanero.ALTO_ARTE * d.k || Math.abs(cv.height - q.height * dpr) > 0.6) lienzos.push(dex);
  }
  const botones = [...document.querySelectorAll('.ec-pie .btn')].map(b => ({ id: b.id, alto: Math.round(rr(b).height), dentro: dentroDe(rr(b), B) && dentroDe(rr(b), { left: 0, top: 0, right: W, bottom: H }) }));
  return {
    celdas: celdas.length, cols: d.cols, filas: d.filas, k: d.k, modo: d.modo, cabe: d.cabe,
    caja: dentroDe(B, { left: 0, top: 0, right: W, bottom: H }), desplazaCaja: Math.max(0, box.scrollHeight - box.clientHeight),
    desplazaRejilla: Math.max(0, grid.scrollHeight - grid.clientHeight), pagina: de.scrollWidth - de.clientWidth, paginaAlto: de.scrollHeight - de.clientHeight,
    pantalla: scr.scrollWidth - scr.clientWidth, fuera, cortados, tipos, lienzos, botones,
    clase: scr.classList.contains('sin-test'), visible: !scr.classList.contains('hidden'), test: window.__testVisto === true,
    volver: vis(document.getElementById('starter-back')), menuDetras: getComputedStyle(document.getElementById('scr-menu')).visibility !== 'hidden' && !document.getElementById('scr-menu').classList.contains('hidden')
  };
};
const bienCompanero = (m, tactilDex) => m.visible && m.clase && !m.test && m.celdas === 29 && m.cabe && m.caja && m.desplazaCaja <= 1 && m.desplazaRejilla <= 1 &&
  m.pagina <= 0 && m.paginaAlto <= 0 && m.pantalla <= 1 && !m.fuera.length && !m.cortados.length && !m.tipos.length && !m.lienzos.length && !m.volver && !m.menuDetras &&
  m.botones.length === 2 && m.botones.every(b => b.dentro && (!tactilDex || b.alto >= 44));

/** Que no se corte ningún sprite: en 45 fotogramas de verdad (su animación Idle), el borde de cada lienzo transparente
 *  (y algo pintado dentro). */
const BORDES_COMPANERO = async () => {
  const cvs = [...document.querySelectorAll('#starter-grid .ec-celda canvas')];
  const res = cvs.map(cv => ({ dex: +cv.closest('.ec-celda').dataset.dex, toca: false, opacos: 0 }));
  for (let f = 0; f < 45; f++) {
    await new Promise(r => requestAnimationFrame(r));
    cvs.forEach((cv, i) => {
      const w = cv.width, h = cv.height, px = cv.getContext('2d').getImageData(0, 0, w, h).data, a = (x, y) => px[(y * w + x) * 4 + 3];
      let toca = false, opacos = 0;
      for (let x = 0; x < w && !toca; x++) if (a(x, 0) > 8 || a(x, h - 1) > 8) toca = true;
      for (let y = 0; y < h && !toca; y++) if (a(0, y) > 8 || a(w - 1, y) > 8) toca = true;
      for (let j = 3; j < px.length; j += 4) if (px[j] > 8) opacos++;
      res[i].toca = res[i].toca || toca; res[i].opacos = Math.max(res[i].opacos, opacos);
    });
  }
  return res.map(x => ({ dex: x.dex, toca: x.toca, vacio: x.opacos < 40 }));
};

/** Un invitado nuevo en `estilo` (lo guardado antes de cargar) hasta «Elige a tu compañero». */
async function nuevoCompanero(browser, v, e) {
  const P = await nuevo(browser, v);
  await P.ctx.addInitScript(x => { try { localStorage.setItem('ps.settings', JSON.stringify({ estilo: x })); } catch (err) { /* nada */ } }, e);
  await P.ctx.addInitScript(VIGIA_TEST);
  const { page } = P;
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('boot') && document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
  await sleep(200);
  P.gira = await page.evaluate(() => !document.getElementById('rotate').classList.contains('hidden'));
  if (P.gira) {   // en vertical, «Gira el móvil» tapa los botones: se entra por código, como si se hubiera tocado
    await page.evaluate(() => { document.getElementById('tap-start').click(); G.DB.playAsGuest(); G.Flow.afterLogin(); });
  } else {
    if (await page.locator('#tap-start').isVisible().catch(() => false)) await page.click('#tap-start');
    await page.locator('#btn-guest').click();
  }
  await page.locator('#scr-starters.sin-test').waitFor({ state: P.gira ? 'attached' : 'visible', timeout: 15000 });
  await sleep(700);   // la animación de entrada de la caja y los sprites
  return P;
}

async function pruebaCompanero(browser) {
  const resumen = {};
  for (const v of COMPANERO_VP) for (const e of ESTILOS) {
    const P = await nuevoCompanero(browser, v, e), { page } = P, nv = nombreVp(v), tactilDex = !!v.tactil && e === 'dex';
    const m = await page.evaluate(MEDIR_COMPANERO);
    resumen[`${nv} ${e}`] = `${m.cols}x${m.filas} k${m.k} ${m.modo}`;
    await captura(page, `companero-${e}-${nv}`);
    check(`${nv} ${e}: un invitado nuevo va directo a «Elige a tu compañero» (el test no sale): los 29 a la vista sin desplazar (${m.cols}x${m.filas}, ${m.k} px físicos por píxel de arte, tipos ${m.modo === 'emblema' ? 'con emblema' : 'con nombre'}), cada uno con su nombre entero, sus tipos y su sprite dentro de la celda, sin «Volver»${tactilDex ? ', botones de 44 px' : ''}`,
      bienCompanero(m, tactilDex), m);
    const bordes = await page.evaluate(BORDES_COMPANERO);
    check(`${nv} ${e}: ningún sprite de los 29 toca el borde de su lienzo en 45 fotogramas de su animación (y todos se han pintado)`, bordes.length === 29 && bordes.every(b => !b.toca && !b.vacio), bordes.filter(b => b.toca || b.vacio));
    // Elegir (con el dedo en táctil), «Al azar» (otro distinto) y confirmar.
    const celda = page.locator('#starter-grid .ec-celda').nth(7);   // Torchic
    if (v.tactil) await celda.tap(); else await celda.click();
    await sleep(120);
    const elegido = await page.evaluate(() => ({ sel: G.ElegirCompanero.elegido, boton: document.getElementById('ec-ok').textContent, activo: !document.getElementById('ec-ok').disabled,
      marcadas: [...document.querySelectorAll('#starter-grid .ec-celda[aria-checked="true"].on')].map(c => +c.dataset.dex),
      info: document.getElementById('ec-info').textContent.replace(/\s+/g, ' ').trim() }));
    if (['pc', 'movil', 'pleg2'].some(k => VP[k] === v)) await captura(page, `companero-elegido-${e}-${nv}`);
    await page.click('#ec-azar');
    await sleep(80);
    const azar = await page.evaluate(() => G.ElegirCompanero.elegido);
    const nombreAzar = await page.evaluate(d => G.DEX_BY[d].name, azar);
    const botonAzar = await page.evaluate(() => document.getElementById('ec-ok').textContent);
    const m2 = await page.evaluate(MEDIR_COMPANERO);   // con la elegida (borde de oro) y el texto de abajo, todo sigue igual
    check(`${nv} ${e}: elegir marca uno (Torchic, «Elegir a Torchic», sus tipos y su movimiento abajo); «Al azar» elige otro distinto sin confirmar; nada se mueve`,
      elegido.sel === 255 && elegido.boton === 'Elegir a Torchic' && elegido.activo && elegido.marcadas.join() === '255' && /Fuego/.test(elegido.info) && /Ascuas/.test(elegido.info) &&
      azar && azar !== 255 && botonAzar === 'Elegir a ' + nombreAzar && bienCompanero(m2, tactilDex), { elegido, azar, botonAzar, m2: bienCompanero(m2, tactilDex) ? 'bien' : m2 });
    if (v.tactil) await page.tap('#ec-ok'); else await page.click('#ec-ok');
    await page.locator('#scr-menu').waitFor({ state: 'visible', timeout: 15000 });
    await sleep(200);
    const fin = await page.evaluate(() => { const s = G.DB.save; return { starter: s.starter, partner: s.partner, personality: s.personality, origen: s.owned[s.partner] && s.owned[s.partner].from,
      logro: !!(s.ach && s.ach.own1), test: window.__testVisto === true, clase: document.getElementById('scr-starters').classList.contains('sin-test') }; });
    check(`${nv} ${e}: «Elegir a ${nombreAzar}» guarda el inicial y el compañero, la personalidad en null y el logro «Primer compañero», y va al menú (la pantalla vuelve a ser la de upstream)`,
      fin.starter === azar && fin.partner === azar && fin.personality === null && fin.origen === 'starter' && fin.logro && !fin.test && !fin.clase, fin);
    check(`${nv} ${e}: consola sin errores ni avisos y nada pedido fuera de 127.0.0.1`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    await P.ctx.close();
  }
  report.medidas.companero = resumen;
  console.log('[INFO] «Elige a tu compañero»: ' + Object.entries(resumen).map(([k, x]) => `${k} ${x}`).join(' · '));

  // Teclado (escritorio, los dos estilos): una sola parada de Tab para la rejilla, flechas, Inicio, Fin, Espacio, Tab hasta los
  // botones e Intro: elige y lleva a «Elegir a X»; otro Intro confirma. Con el anillo de foco a la vista.
  for (const e of ESTILOS) {
    const P = await nuevoCompanero(browser, VP.pc, e), { page } = P;
    const estado = () => page.evaluate(() => {
      const cs = [...document.querySelectorAll('#starter-grid .ec-celda')], a = document.activeElement;
      return { foco: cs.indexOf(a), id: a && a.id, sel: cs.findIndex(c => c.getAttribute('aria-checked') === 'true'), paradas: cs.filter(c => c.tabIndex === 0).length,
        anillo: a && getComputedStyle(a).outlineStyle !== 'none' && parseFloat(getComputedStyle(a).outlineWidth) >= 2, cols: G.ElegirCompanero.disp.cols,
        rol: document.getElementById('starter-grid').getAttribute('role') };
    });
    const pasos = { inicio: await estado() };
    await page.keyboard.press('ArrowRight'); pasos.derecha = await estado();
    await page.keyboard.press('ArrowDown'); pasos.abajo = await estado();
    await page.keyboard.press('End'); pasos.fin = await estado();
    await page.keyboard.press('Home'); pasos.casa = await estado();
    await page.keyboard.press('ArrowLeft'); pasos.izquierda = await estado();   // del primero, al último (da la vuelta)
    await page.keyboard.press('Space'); pasos.espacio = await estado();
    await sleep(200);   // el botón «Elegir a X» acaba de activarse (su filtro tarda 0,12 s)
    await captura(page, `companero-foco-${e}-${nombreVp(VP.pc)}`);
    await page.keyboard.press('Tab'); pasos.tab1 = await estado();
    await page.keyboard.press('Tab'); pasos.tab2 = await estado();
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); pasos.vuelta = await estado();
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter'); pasos.intro = await estado();
    const c = pasos.inicio.cols;
    const bien = pasos.inicio.rol === 'radiogroup' && pasos.inicio.foco === 0 && pasos.inicio.paradas === 1 && pasos.derecha.foco === 1 && pasos.derecha.sel === 1 &&
      pasos.derecha.anillo && pasos.abajo.foco === 1 + c && pasos.abajo.sel === 1 + c && pasos.fin.sel === 28 && pasos.casa.sel === 0 && pasos.izquierda.sel === 28 &&
      pasos.espacio.sel === 28 && pasos.tab1.id === 'ec-azar' && pasos.tab2.id === 'ec-ok' && pasos.vuelta.foco === 28 && pasos.vuelta.paradas === 1 &&
      pasos.intro.id === 'ec-ok' && pasos.intro.sel === 0;
    const dexIntro = await page.evaluate(() => G.ElegirCompanero.elegido);
    await page.keyboard.press('Enter');
    await page.locator('#scr-menu').waitFor({ state: 'visible', timeout: 15000 });
    const guardado = await page.evaluate(() => G.DB.save.partner);
    check(`${e}: teclado: la rejilla es una sola parada de Tab (grupo de opciones) con el anillo de foco; flechas (también abajo, por columnas, y la vuelta), Inicio, Fin y Espacio eligen; Tab lleva a «Al azar» y a «Elegir a X»; Intro elige y lleva a «Elegir a X» y otro Intro confirma`,
      bien && guardado === dexIntro && dexIntro === 1, { pasos, dexIntro, guardado });
    await P.ctx.close();
  }

  // Cambiar de tamaño con la pantalla abierta (escritorio → móvil en horizontal) y el Magic V6 plegado en vertical: «Gira el
  // móvil» encima y, al girarlo, la pantalla cabe.
  {
    const P = await nuevoCompanero(browser, VP.pc, 'dex'), { page } = P;
    const antes = await page.evaluate(MEDIR_COMPANERO);
    await page.setViewportSize({ width: 844, height: 390 });
    await sleep(500);
    const m = await page.evaluate(MEDIR_COMPANERO);
    const igual = await page.evaluate(() => { const d = G.ElegirCompanero.disposicion(G.ElegirCompanero.medidas), e = G.ElegirCompanero.disp; return d.cols === e.cols && d.k === e.k && d.modo === e.modo; });
    check(`al cambiar de tamaño con la pantalla abierta (1440x900 → 844x390) se recoloca (${antes.cols}x${antes.filas} k${antes.k} → ${m.cols}x${m.filas} k${m.k}): los 29 caben sin desplazar`,
      bienCompanero(antes, false) && bienCompanero(m, false) && m.k < antes.k && igual, { antes, m, igual });
    await P.ctx.close();
  }
  for (const e of ESTILOS) {
    const v = { w: 360, h: 807, dpr: 3, tactil: true }, P = await nuevoCompanero(browser, v, e), { page } = P;
    const vertical = await page.evaluate(() => ({ gira: !document.getElementById('rotate').classList.contains('hidden'),
      encima: (() => { const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !!(el && el.closest('#rotate')); })(),
      pagina: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    await captura(page, `companero-gira-${e}-${nombreVp(v)}`);
    await page.setViewportSize({ width: 807, height: 360 });
    await sleep(600);
    const m = await page.evaluate(MEDIR_COMPANERO);
    const girado = await page.evaluate(() => document.getElementById('rotate').classList.contains('hidden'));
    await captura(page, `companero-girado-${e}-${nombreVp({ w: 807, h: 360, dpr: 3 })}`);
    check(`${e}: plegado en vertical (360x807), «Gira el móvil» tapa «Elige a tu compañero» sin desplazamiento; al girarlo (807x360), la pantalla cabe entera`,
      P.gira && vertical.gira && vertical.encima && vertical.pagina <= 0 && girado && bienCompanero(m, e === 'dex'), { vertical, girado, m });
    await P.ctx.close();
  }

  // En inglés (navegador en inglés), en el móvil: título, botones, la pista, el botón con el nombre y los tipos.
  {
    const v = VP.movil;
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr, hasTouch: true, isMobile: true, serviceWorkers: 'block', locale: 'en-US' });
    await ctx.addInitScript(SIN_NUBE); await ctx.addInitScript(AVISO_VISTO);
    await ctx.addInitScript(VIGIA_TEST);
    const page = await ctx.newPage(), consola = [], fuera = [];
    page.on('request', x => { if (!x.url().startsWith(`http://127.0.0.1:${PORT}/`) && !/^(data|blob):/.test(x.url())) fuera.push(x.url()); });
    page.on('console', x => { if ((x.type() === 'error' || x.type() === 'warning') && !AVISOS_ENTORNO.some(re => re.test(x.text()))) consola.push(x.text()); });
    page.on('pageerror', x => consola.push('pageerror: ' + x.message));
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
    await sleep(200);
    if (await page.locator('#tap-start').isVisible().catch(() => false)) await page.tap('#tap-start');
    await page.tap('#btn-guest');
    await page.locator('#scr-starters.sin-test').waitFor({ state: 'visible', timeout: 15000 });
    await sleep(600);
    const antes = await page.evaluate(() => ({ titulo: document.querySelector('#scr-starters h2').textContent.trim(), azar: document.getElementById('ec-azar').textContent.trim(),
      ok: document.getElementById('ec-ok').textContent.trim(), info: document.getElementById('ec-info').textContent.trim(), grupo: document.getElementById('starter-grid').getAttribute('aria-label'),
      etiqueta: document.querySelector('#starter-grid .ec-celda').getAttribute('aria-label') }));
    await page.locator('#starter-grid .ec-celda').nth(0).tap();
    await sleep(200);
    const despues = await page.evaluate(() => ({ ok: document.getElementById('ec-ok').textContent.trim(), info: document.getElementById('ec-info').textContent.replace(/\s+/g, ' ').trim() }));
    const m = await page.evaluate(MEDIR_COMPANERO);
    await captura(page, `companero-ingles-${nombreVp(v)}`);
    check('en inglés: «Choose your partner», «Random», «Choose», la pista y la etiqueta de la rejilla; al elegir, «Choose Bulbasaur» con «Grass» y «Poison»; los 29 caben',
      antes.titulo === 'Choose your partner' && antes.azar === 'Random' && antes.ok === 'Choose' && antes.info === 'Pick one or leave it to chance.' && antes.grupo === 'Starters' &&
      /Grass/.test(antes.etiqueta) && /Poison/.test(antes.etiqueta) && despues.ok === 'Choose Bulbasaur' && /Grass/.test(despues.info) && /Poison/.test(despues.info) &&
      bienCompanero(m, false) && !consola.length && !fuera.length, { antes, despues, m: bienCompanero(m, false) ? 'bien' : m, consola, fuera });
    await ctx.close();
  }
}

// ---------------- 17. Mapas propios (G.MODS.mapasPropios) ----------------
/** ¿Están puestos los mapas propios? Los 3 biomas con sus nombres, el pintor y los sprites de js/world/mapas*.js. */
const MAPAS_ACTIVOS = () => ({
  activo: !!(G.Mapas && G.Mapas.activo),
  nombres: G.Tiles.BIOMES.slice(0, 3).map(b => b.name),
  esperados: G.MapasDatos ? G.MapasDatos.BIOMAS.map(b => b.name) : [],
  pintor: G.Tiles.paintChunk === (G.Mapas && G.Mapas.pintar),
  sprites: G.Tiles.propSprite === (G.Mapas && G.Mapas.sprite),
  arenas: G.Tiles.ARENA_TYPES.length,
  semilla: G.World.semilla, semillaMenu: G.Mapas && G.Mapas.SEMILLA_MENU
});
/** Sólo el lienzo del juego (para ver el fondo del menú sin la interfaz encima) o todo otra vez. */
const SIN_INTERFAZ = quitar => {
  let s = document.getElementById('__sin-interfaz');
  if (quitar && !s) { s = document.createElement('style'); s.id = '__sin-interfaz'; s.textContent = 'body > :not(#game) { visibility: hidden !important; }'; document.head.appendChild(s); }
  if (!quitar && s) s.remove();
};
/** Entra en la arena `tipo` con G.Rift.debugArena (la de verdad: rift.js, con su legendario). Sólo durante esa llamada,
 *  Math.random es un generador sembrado con `i`: el legendario, el sitio (tx, ty) y que no sea shiny quedan siempre
 *  iguales y cada arena a más de 100 casillas de las otras (lo mira la prueba), para que no se mezclen sus chunks. El
 *  clima forzado de la anterior se quita antes (begin() sólo pone el de las arenas que lo tienen). Sin daño para tu
 *  Pokémon y con el legendario quieto (sólo en la prueba). */
const ENTRAR_ARENA = ({ tipo, i }) => {
  const r = Math.random;
  let s = (0x9e3779b9 * (i + 1)) >>> 0;
  Math.random = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  try {
    G.Rift.reset();
    G.Weather.clear();
    G.Rift.debugArena(tipo);
  } finally { Math.random = r; }
  const a = G.Rift.arena, pl = G.Game.player, W = G.World, TS = W.TS;
  pl.hurt = function () {};
  const e = G.EnemyMgr.get(a.bossId);
  if (e) e.spd = 0;
  return { tipo: a.type, tx: a.tx, ty: a.ty, bioma: W.biome, esperado: G.Tiles.arenaBiome(tipo), nombre: W.biomeName(),
    nombreDatos: G.MapasDatos && G.MapasDatos.ARENAS[tipo] ? G.MapasDatos.ARENAS[tipo].name : null,
    centro: W.kindAt(a.x, a.y), legendario: e ? e.name : null, shiny: !!(e && e.shiny), clima: G.Tiles.ARENA_THEMES[tipo].weather || null };
};
/** Tu Pokémon en el centro de la arena (para ver su forma en la captura). */
const AL_CENTRO = () => { const a = G.Rift.arena, pl = G.Game.player; pl.x = a.x; pl.y = a.y; G.Camera.x = pl.x; G.Camera.y = pl.y; };
/** Tu Pokémon en el límite de keepInside de rift.js ((r − 1,4) casillas del centro) al este (+1) o al oeste (−1), sin que
 *  las paredes lo saquen (sólo en la prueba: G.World.collide no lo toca a él), para ver hasta dónde llega la cámara. */
const AL_LIMITE = lado => {
  const a = G.Rift.arena, pl = G.Game.player, max = (a.r - 1.4) * G.World.TS;
  if (!window.__collide) {
    const c = window.__collide = G.World.collide;
    G.World.collide = function (e) { return e === G.Game.player ? false : c.apply(this, arguments); };
  }
  pl.x = a.x + lado * max; pl.y = a.y; pl.svx = pl.svy = 0;
  return max;
};
const SIN_LIMITE = () => { if (window.__collide) { G.World.collide = window.__collide; delete window.__collide; } };
/** Las casillas que se ven (la vista de la cámara, con su temblor) en la arena. Dos cosas:
 *  - El terreno (la regla del §7 de la especificación: pared desde el borde de la forma hasta q < 32² «para que no haya
 *    terreno normal ni chispas de líquido en ninguna pantalla»): ninguna casilla a la vista con q ≥ 32², donde mapas.js
 *    deja de dar la arena y vuelve el terreno normal (pared, suelo o líquido para G.World.kindAt y las colisiones); y las de
 *    fuera del círculo de la arena (q ≥ r²), su borde o el vacío (código A_BORDE o A_VACIO de G.Mapas.codigo y pared).
 *  - Lo que se pinta: en las casillas de terreno normal que se vean, lo que pinta mapas-pintar.js es todo del vacío de la
 *    grieta (#0d0a18, #7b3cff y #c9a6ff: pinta vacío todo lo que está a q ≥ borde² de la arena), sin chispas de líquido
 *    encima (drawLiquid las pinta en las casillas de líquido) ni objetos del escenario. Se mira el chunk pintado otra vez
 *    con G.Mapas.pintar sin gradación (su `at` dice pared en todas); el chunk horneado de verdad (G.World.chunkImage) se
 *    compara con él aparte, para el informe: con Dex, la gradación de entorno.js mira G.World.kindAt y no el código, así
 *    que en una casilla de terreno normal que sea suelo aclara u oscurece un poco el vacío.
 *  Devuelve los recuentos, los píxeles CSS de esas casillas a la vista, la casilla más lejana que se ve (q) y dónde están
 *  tu Pokémon y la cámara. */
const MEDIR_BORDE_ARENA = () => {
  const W = G.World, TS = W.TS, cam = G.Camera, A = W.arena, S = W.semilla, M = G.Mapas, pl = G.Game.player, ar = G.Rift.arena;
  const BORDE = 1 | (M.SUB.A_BORDE << 2), VACIO = 1 | (M.SUB.A_VACIO << 2), PARED2 = M.P.arena.pared * M.P.arena.pared, R2 = A.r * A.r;
  const L = cam.left() - cam._sx, T = cam.top() - cam._sy, Rx = L + cam.w, Ry = T + cam.h, k = cam.scale;
  const n = { arena: 0, borde: 0, vacio: 0, normal: 0, malas: 0 }, malas = [];
  const pintado = { casillas: 0, pixeles: 0, noVacio: 0, graduados: 0, liquido: 0, objetos: 0, colores: [] };
  const VACIO_RGB = new Set([0x0d0a18, 0x7b3cff, 0xc9a6ff]), N = 16, chunks = new Map();
  const leer = im => ({ w: im.width, d: im.getContext('2d').getImageData(0, 0, im.width, im.height).data });
  const pixelesChunk = (cx, cy) => {
    const key = cx + ',' + cy;
    if (!chunks.has(key)) chunks.set(key, { crudo: leer(M.pintar(cx, cy, N, () => 'wall', null, W.biome, S)), horneado: leer(W.chunkImage(cx, cy)) });
    return chunks.get(key);
  };
  let pxNormal = 0, qMax = 0, lejana = null;
  for (let ty = Math.floor(T / TS); ty * TS < Ry; ty++) for (let tx = Math.floor(L / TS); tx * TS < Rx; tx++) {
    const lx = tx - A.tx, ly = ty - A.ty, q = lx * lx + ly * ly;
    if (q > qMax) { qMax = q; lejana = [lx, ly]; }
    if (q >= PARED2) {
      n.normal++;
      pxNormal += (Math.min(Rx, (tx + 1) * TS) - Math.max(L, tx * TS)) * (Math.min(Ry, (ty + 1) * TS) - Math.max(T, ty * TS)) * k * k;
      // Lo que se pinta en ella: el suelo horneado (antes del tinte y la viñeta) y si es líquido (chispas de drawLiquid).
      const cx = Math.floor(tx / N), cy = Math.floor(ty / N), { crudo, horneado } = pixelesChunk(cx, cy), t = crudo.w / N;
      pintado.casillas++;
      for (let y = (ty - cy * N) * t; y < (ty - cy * N + 1) * t; y++) for (let x = (tx - cx * N) * t; x < (tx - cx * N + 1) * t; x++) {
        const o = (y * crudo.w + x) * 4, d = crudo.d, h = horneado.d, rgb = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2];
        pintado.pixeles++;
        if (!VACIO_RGB.has(rgb) || d[o + 3] !== 255) { pintado.noVacio++; if (pintado.colores.length < 6) pintado.colores.push('#' + rgb.toString(16).padStart(6, '0')); }
        if (horneado.w === crudo.w && (h[o] !== d[o] || h[o + 1] !== d[o + 1] || h[o + 2] !== d[o + 2])) pintado.graduados++;
      }
      if (W.kindAt(tx * TS + TS / 2, ty * TS + TS / 2) === 'liquid') pintado.liquido++;
      continue;
    }
    if (q < R2) { n.arena++; continue; }
    const c = M.codigo(tx, ty, S, A), kind = W.kindAt(tx * TS + TS / 2, ty * TS + TS / 2);
    if (c === BORDE && kind === 'wall') n.borde++;
    else if (c === VACIO && kind === 'wall') n.vacio++;
    else { n.malas++; if (malas.length < 8) malas.push({ lx, ly, codigo: c, kind }); }
  }
  // Cota del peor caso (para el informe): con la misma cámara (la misma vista y el mismo desplazamiento respecto a tu Pokémon,
  // el del encuadre en Dex), tu Pokémon en cualquier punto de cualquier casilla transitable de la arena (q < r², no pared):
  // la casilla más lejana que llegaría a verse. Sin descontar su radio (una cota algo por encima).
  const off = [(cam.x - pl.x) / TS, (cam.y - pl.y) / TS], hw = cam.w / 2 / TS, hh = cam.h / 2 / TS;
  const alcance = { q: 0, jugador: null, casilla: null };
  for (let ly = -A.r; ly <= A.r; ly++) for (let lx = -A.r; lx <= A.r; lx++) {
    if (lx * lx + ly * ly >= R2 || W.kindAt((A.tx + lx) * TS + TS / 2, (A.ty + ly) * TS + TS / 2) === 'wall') continue;
    for (const px of [lx - 0.5, lx + 0.5]) for (const py of [ly - 0.5, ly + 0.5]) for (const ex of [-hw, hw]) for (const ey of [-hh, hh]) {
      const vx = Math.round(px + off[0] + ex), vy = Math.round(py + off[1] + ey), q = vx * vx + vy * vy;
      if (q > alcance.q) Object.assign(alcance, { q, jugador: [lx, ly], casilla: [vx, vy] });
    }
  }
  // Objetos del escenario a la vista sobre terreno normal (en la arena no hay ninguno hasta q < 51²).
  for (const p of W.visibleProps(cam)) {
    const lx = p.tx - A.tx, ly = p.ty - A.ty;
    if (lx * lx + ly * ly >= PARED2 && cam.sees(p.x, p.y, 0)) pintado.objetos++;
  }
  return { n, malas, pintado, alcance, pxNormal: Math.round(pxNormal), qMax, lejana, limite: Math.sqrt(PARED2),
    jugador: [+((pl.x - ar.x) / TS).toFixed(2), +((pl.y - ar.y) / TS).toFixed(2)], camara: [+((cam.x - pl.x) / TS).toFixed(2), +((cam.y - pl.y) / TS).toFixed(2)],
    vista: [+(cam.w / TS).toFixed(1), +(cam.h / TS).toFixed(1)], escala: +k.toFixed(4) };
};
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function pruebaMapas(browser) {
  const t0 = Date.now();
  for (const clave of ['pc', 'movil', 'pleg2']) {
    const tv = Date.now(), v = VP[clave], P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: mapas: se entra a jugar`, false); await P.ctx.close(); continue; }
    const act = await page.evaluate(MAPAS_ACTIVOS);
    report.medidas['mapas-activos-' + nv] = act;
    check(`${nv}: mapas propios puestos: ${act.nombres.join(', ')}, el pintor y los objetos de js/world/mapas*.js, 18 arenas y el fondo del menú con la semilla ${act.semillaMenu} (${act.semilla})`,
      act.activo && act.pintor && act.sprites && act.arenas === 18 && act.nombres.length === 3 && act.nombres.every((x, i) => x === act.esperados[i]) && act.semilla === act.semillaMenu, act);
    // El fondo del menú, sin la interfaz encima, en los dos estilos.
    for (const est of ['dex', 'clasico']) {
      await estilo(page, est);
      await page.evaluate(HORNEADO);
      await page.evaluate(SIN_INTERFAZ, true);
      await sleep(250);
      await captura(page, `mapa-menu-${est}-${nv}`);
      await page.evaluate(SIN_INTERFAZ, false);
    }
    // Los tres biomas, en un sitio con paredes y líquido a la vista, en los dos estilos y sin clima.
    await page.evaluate(() => { G.Estilo.set('dex'); G.Flow.play(); });
    await sleep(1200);
    const sitio = await page.evaluate(ESCENA_ENTORNO, { rMax: 160, aproximado: true });
    report.medidas['mapa-sitio-' + nv] = sitio;
    // Sólo para las capturas (el mundo es otro en cada partida): al informe, no es una comprobación.
    console.log(`[INFO] ${nv}: sitio de las capturas de los biomas: ${sitio ? `${sitio.p} casillas de pared y ${sitio.l} de líquido en 19x11, a (${sitio.tx}, ${sitio.ty})${sitio.aproximado ? ' (el que más tenía: ninguno llegaba a 10 y 10)' : ''}` : 'ninguno: el principio'}`);
    for (let b = 0; b < 3; b++) {
      const nombre = await page.evaluate(b => { G.World.setBiome(b, true); G.Weather.clear(); return G.World.biomeName(); }, b);
      for (const est of ['dex', 'clasico']) {
        await estilo(page, est);
        await page.evaluate(HORNEADO);
        await sleep(250);
        await captura(page, `mapa-${slug(nombre)}-${est}-${nv}`);
      }
    }
    await estilo(page, 'dex');
    if (clave === 'pc') {
      // Las 18 arenas, en Dex, con tu Pokémon en el centro.
      const tipos = await page.evaluate(() => G.Tiles.ARENA_TYPES.slice()), arenas = [];
      for (const [i, tipo] of tipos.entries()) {
        const a = await page.evaluate(ENTRAR_ARENA, { tipo, i });
        await page.evaluate(AL_CENTRO);
        await sleep(1300);                       // el iris y el fogonazo del viaje
        await page.evaluate(HORNEADO);
        await captura(page, `mapa-arena-${tipo}-dex-${nv}`);
        arenas.push(a);
      }
      report.medidas['mapa-arenas-' + nv] = arenas;
      const lejos = Math.min(...arenas.flatMap((a, i) => arenas.slice(i + 1).map(b => Math.hypot(a.tx - b.tx, a.ty - b.ty))));
      const malas = arenas.filter(a => a.tipo !== tipos[arenas.indexOf(a)] || a.bioma !== a.esperado || a.nombre !== 'Grieta · ' + a.nombreDatos || a.centro !== 'floor');
      check(`${nv}: las 18 arenas por rift.js (G.Rift.debugArena): cada una con su bioma, su nombre de G.MapasDatos («Grieta · …») y suelo en el centro; a ${Math.round(lejos)} casillas o más unas de otras (> 100)`,
        arenas.length === 18 && !malas.length && lejos > 100, malas.length ? malas : arenas.map(a => `${a.tipo}: ${a.nombre} · ${a.legendario}`));
    }
    if (clave === 'movil') {
      // En el móvil, con tu Pokémon en el límite de keepInside al este y al oeste: nada de terreno normal a la vista.
      const res = [];
      for (const [i, tipo] of [[1, 'fire'], [0, 'normal']]) {
        await page.evaluate(ENTRAR_ARENA, { tipo, i });
        await sleep(1300);
        for (const est of ['dex', 'clasico']) {
          await estilo(page, est);
          for (const [lado, nombre] of [[1, 'este'], [-1, 'oeste']]) {
            await page.evaluate(AL_LIMITE, lado);
            await sleep(1200);                   // la cámara y, en Dex, el encuadre (unos 400 ms)
            await page.evaluate(HORNEADO);
            const m1 = await page.evaluate(MEDIR_BORDE_ARENA);
            await sleep(200);
            const m = await page.evaluate(MEDIR_BORDE_ARENA);
            Object.assign(m, { quieta: Math.abs(m.camara[0] - m1.camara[0]) < 0.02 && Math.abs(m.camara[1] - m1.camara[1]) < 0.02, tipo, estilo: est, lado: nombre });
            await captura(page, `mapa-arena-${tipo}-${nombre}-${est}-${nv}`);
            res.push(m);
          }
        }
        await page.evaluate(SIN_LIMITE);
      }
      report.medidas['mapa-borde-arena-' + nv] = res;
      const resumen = m => ({ tipo: m.tipo, estilo: m.estilo, lado: m.lado, n: m.n, malas: m.malas, pintado: m.pintado, alcance: m.alcance, pxNormal: m.pxNormal, qMax: m.qMax, lejana: m.lejana, jugador: m.jugador, camara: m.camara, vista: m.vista, quieta: m.quieta });
      const enSitio = res.length === 8 && res.every(m => m.quieta && Math.abs(Math.abs(m.jugador[0]) - 9.6) <= 0.05);
      // Lo que se ve: el vacío de la grieta, aunque la cámara llegue al terreno normal (lo pinta mapas-pintar.js).
      const malPintado = res.filter(m => m.pintado.noVacio || m.pintado.liquido || m.pintado.objetos);
      check(`${nv}: en la arena (fuego e isla, normal y octógono; Dex y Clásico) con tu Pokémon en el límite de keepInside (9,6 casillas) al este y al oeste: 0 píxeles de terreno normal a la vista: lo que se ve fuera del círculo es su borde o el vacío de la grieta, también en las casillas de terreno normal que alcanza la cámara (${res.map(m => m.pintado.casillas).join('/')} casillas: ${res.map(m => m.pintado.noVacio).join('/')} píxeles pintados que no son del vacío; en el chunk horneado, ${res.map(m => m.pintado.graduados).join('/')} del vacío retocados por la gradación de Dex, que toma esas casillas por suelo; ${res.map(m => m.pintado.liquido).join('/')} de líquido con sus chispas y ${res.map(m => m.pintado.objetos).join('/')} objetos)`,
        enSitio && !malPintado.length, enSitio ? malPintado.map(resumen) : res.map(resumen));
      // El terreno: la regla del §7 (pared hasta q < 32² para que ninguna pantalla vea terreno normal).
      const malTerreno = res.filter(m => m.n.normal || m.n.malas);
      const peor = res.reduce((a, m) => (m.qMax > a.qMax ? m : a)), cota = res.reduce((a, m) => (m.alcance.q > a.alcance.q ? m : a));
      check(`${nv}: en la arena, con tu Pokémon en el límite de keepInside al este y al oeste: ninguna casilla a la vista es terreno normal (q ≥ ${peor.limite}², donde mapas.js deja de dar la arena: ${res.map(m => m.n.normal).join('/')} casillas, ${res.map(m => m.pxNormal).join('/')} px CSS; para G.World.kindAt y las colisiones son pared o suelo, y un río ahí pintaría sus chispas) y todo lo de fuera del círculo es su borde o el vacío (${res.map(m => m.n.borde + '+' + m.n.vacio).join(', ')}; mal ${res.map(m => m.n.malas).join('/')}); la casilla más lejana a la vista, a √${peor.qMax} = ${Math.sqrt(peor.qMax).toFixed(1)} casillas del centro (${peor.lejana}; ${peor.tipo}, ${peor.estilo}, ${peor.lado}; la cámara, a (${peor.camara}) casillas de tu Pokémon). Al informe: con tu Pokémon en cualquier casilla transitable, se llegaría a ver hasta √${cota.alcance.q} = ${Math.sqrt(cota.alcance.q).toFixed(1)} (${cota.tipo}, ${cota.estilo}: desde (${cota.alcance.jugador}) se ve (${cota.alcance.casilla}))`,
        enSitio && !malTerreno.length, enSitio ? malTerreno.map(resumen) : res.map(resumen));
    }
    check(`${nv}: mapas: consola sin errores ni avisos y nada pedido fuera de 127.0.0.1`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    console.log(`[INFO] ${nv}: mapas en ${((Date.now() - tv) / 1000).toFixed(1)} s`);
    await P.ctx.close();
  }
  report.medidas['mapas-segundos'] = Math.round((Date.now() - t0) / 1000);
  console.log(`[INFO] mapas propios (sección 17): ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// ---------------- 18. Relieve, sombras y luz (2.5D falsa) ----------------
/** Prepara una escena quieta en una cresta fina (1 a 3 casillas de grueso, suelo encima y debajo) con la semilla `semilla`:
 *  sin oleadas ni ataques, tu Pokémon invulnerable, sin efectos; devuelve el sitio y deja la cámara encima. */
const RELIEVE_ESCENA = semilla => {
  const W = G.World, TS = W.TS, pl = G.Game.player, k = (tx, ty) => W.kindAt(tx * TS + 16, ty * TS + 16);
  for (const x of document.querySelectorAll('.ach-pop, .toast')) x.remove();
  pl.hurt = function () {}; G.Spawner.update = () => {}; G.Combat.tick = () => {};
  G.EnemyMgr.clear(); G.Projectiles.clear(); G.FX.clear(); G.Hazards.clear(); G.Weather.clear();
  W.reset(semilla); W.setBiome(0, true);
  // Grueso de la cresta, con dos filas de suelo debajo (lo de delante no queda detrás de otra pared).
  const grueso = (tx, ty) => { let d = 0; while (d < 8 && k(tx, ty + d) === 'wall') d++; return k(tx, ty + d) === 'floor' && k(tx, ty + d + 1) === 'floor' ? d : 99; };
  let s = null;
  for (let r = 6; r < 200 && !s; r++) for (let a = 0; a < 6.283 && !s; a += 0.05) {
    const tx = Math.round(Math.cos(a) * r), ty = Math.round(Math.sin(a) * r);
    let ok = true; const g = [];
    for (let i = -2; i <= 2 && ok; i++) {
      for (let j = 1; j <= 3 && ok; j++) if (k(tx + i, ty - j) !== 'floor') ok = false;
      const d = ok ? grueso(tx + i, ty) : 99;
      if (d < 1 || d > 3) ok = false; else g.push(d);
    }
    if (ok) s = { tx, ty, g };
  }
  if (!s) return null;
  pl.x = s.tx * TS + 16; pl.y = s.ty * TS - 6;
  G.Camera.x = pl.x; G.Camera.y = pl.y;
  return s;
};
/** El lienzo del juego (#game) con todo quieto: performance.now() congelado durante unos fotogramas (las animaciones que
 *  usan el reloj, como la hierba o los brillos del agua, no se mueven) y, en la pausa, nada avanza. Devuelve sus píxeles. */
const RELIEVE_FOTO = async () => {
  const cv = document.getElementById('game'), cx = cv.getContext('2d'), now = performance.now.bind(performance), t0 = now();
  performance.now = () => t0;
  try {
    for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r));
    return Array.from(cx.getImageData(0, 0, cv.width, cv.height).data);
  } finally { performance.now = now; }
};

async function pruebaRelieve(browser) {
  const t0 = Date.now(), SEMILLA = 7;
  for (const clave of ['pc', 'movil']) {
    const v = VP[clave], P = await nuevo(browser, v), { page } = P, nv = nombreVp(v);
    if (!await entrar(P)) { check(`${nv}: relieve: se entra a jugar`, false); await P.ctx.close(); continue; }
    await page.evaluate(() => { G.Settings.set('quality', 'high'); G.Estilo.set('dex'); G.Flow.play(); });
    await sleep(1200);
    const s = await page.evaluate(RELIEVE_ESCENA, SEMILLA);
    check(`${nv}: relieve: hay una cresta fina cerca del principio con la semilla ${SEMILLA}`, !!s, s);
    if (!s) { await P.ctx.close(); continue; }
    await page.evaluate(HORNEADO);
    await page.evaluate(() => { if (G.Game.state === 'playing') G.Game.togglePause(); G.UI.hideAll(); });

    // 1. Oclusión, con tu Pokémon pegado a la cresta desde el norte tanto como deja la colisión de world.js (los pies, a su
    //    radio del borde): con el relieve de por defecto queda en parte detrás (sin el repintado de Claridad: jugadorVisible =
    //    false) y un Pokémon con los pies al sur de la cresta, entero delante. Se mira por máscara: los píxeles del sprite
    //    (los que cambian al quitarlo, sin relieve) que siguen iguales con el relieve.
    const oc = await page.evaluate(async () => {
      const pl = G.Game.player, TS = G.World.TS, cam = G.Camera, H = G.MODS.relieveAltura;
      // La fila de la cresta: la primera pared bajo tu Pokémon (el juego en marcha lo ha podido apartar de ella).
      let ty = Math.floor(pl.y / TS);
      for (let n = 0; n < 4 && !G.World.isWall(pl.x, ty * TS + 1); n++) ty++;
      let d = 0; while (G.World.isWall(pl.x, (ty + d) * TS + 1)) d++;
      pl.y = ty * TS - pl.r - 0.1;
      const e = new G.Enemy({ dex: 1, hp: 9999, spd: 0, dmg: 0, xp: 0, behavior: 'melee' }, pl.x + 70, (ty + d) * TS + 20, { hp: 1, spd: 1, dmg: 1 }, false);
      e.spd = 0; G.EnemyMgr.add(e);
      const cv = document.getElementById('game'), W = cv.width, k = cam.scale * cam.dpr;
      // Tras cambiar la altura, el relieve se rehornea (uno o dos chunks por fotograma): 16 fotogramas.
      const foto = async (n = 3) => { for (let i = 0; i < n; i++) await new Promise(r => requestAnimationFrame(r)); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.slice(); };
      const difiere = (a, b, o) => Math.abs(a[o] - b[o]) + Math.abs(a[o + 1] - b[o + 1]) + Math.abs(a[o + 2] - b[o + 2]) > 40;
      const medir = async quien => {
        const dib = quien.draw;
        G.MODS.relieveAltura = 0;
        const A0 = await foto(16); quien.draw = () => {}; const B0 = await foto(); quien.draw = dib;
        G.MODS.relieveAltura = H;
        const A = await foto(16);
        const sx = (quien.x - cam.left()) * k, sy = (quien.y - cam.top()) * k, half = 40 * k;
        let n = 0, iguales = 0, abajo = 0, abajoIg = 0;
        for (let y = Math.max(0, Math.floor(sy - 90 * k)); y < Math.min(cv.height, sy + 8 * k); y++) for (let x = Math.max(0, Math.floor(sx - half)); x < Math.min(W, sx + half); x++) {
          const o = (y * W + x) * 4;
          if (!difiere(A0, B0, o)) continue;                 // no es del sprite
          const ig = !difiere(A, A0, o), baja = y > sy - 12 * k;
          n++; if (ig) iguales++;
          if (baja) { abajo++; if (ig) abajoIg++; }
        }
        return { n, iguales, abajo, abajoIg };
      };
      G.MODS.jugadorVisible = false;
      const anim = pl.anim.update; pl.anim.update = () => {};      // en la pausa, upstream sigue animando a tu Pokémon (a ×0,25)
      const res = { H, radio: pl.r, hueco: +(ty * TS - pl.y).toFixed(1), pl: await medir(pl), e: await medir(e) };
      pl.anim.update = anim;
      G.MODS.jugadorVisible = true;
      // G.Claridad cuenta la pared: con el relieve, la cresta tapa el 20 % o más de tu Pokémon y lo repinta; sin él, no.
      const esc = G.Claridad.escenaOrdenada;
      const tapa = async alt => {
        G.MODS.relieveAltura = alt; let items = null;
        for (let i = 0; i < 16; i++) await new Promise(r => requestAnimationFrame(r));
        G.Claridad.escenaOrdenada = it => { items = it.slice(); esc(it); };
        for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r));
        G.Claridad.escenaOrdenada = esc;
        return items ? G.Claridad.tapado(pl, items) : null;
      };
      res.tapado = await tapa(H); res.tapadoSin = await tapa(0);
      G.MODS.relieveAltura = H;
      e.dead = true; e.fade = 0;
      return res;
    });
    report.medidas['relieve-oclusion-' + nv] = oc;
    check(`${nv}: relieve (${oc.H} px): tu Pokémon pegado a la cresta desde el norte (los pies a ${oc.hueco} px, su radio) queda en parte detrás (siguen a la vista ${oc.pl.iguales} de ${oc.pl.n} píxeles; de los de abajo, ${oc.pl.abajoIg} de ${oc.pl.abajo}) y un Pokémon al sur de la cresta, entero delante (${oc.e.iguales} de ${oc.e.n})`,
      oc.pl.n > 100 && oc.pl.iguales < oc.pl.n * 0.9 && oc.pl.iguales > oc.pl.n * 0.4 && oc.pl.abajoIg < oc.pl.abajo * 0.2 && oc.e.n > 100 && oc.e.iguales >= oc.e.n * 0.98, oc);
    check(`${nv}: relieve: pegado a la cresta, G.Claridad cuenta la pared y lo repinta (${oc.tapado}); sin relieve, nada lo tapa (${oc.tapadoSin})`, oc.tapado === true && oc.tapadoSin === false, oc);

    // 2. La luz con el píxel nítido: con el suelo de un color liso (para ver sólo la luz) y sin sprites, en una zona con tres
    //    bolas de fuego tuyas (escondidas), cada píxel de arte mide m×m píxeles físicos enteros y es uniforme.
    const px = await page.evaluate(async () => {
      const pl = G.Game.player, cam = G.Camera, cv = document.getElementById('game'), W = cv.width;
      const deshacer = [], tapar = (o, k2, f) => { const prev = o[k2]; o[k2] = f; deshacer.push(() => { o[k2] = prev; }); };
      tapar(G.World, 'drawGround', (ctx, c) => { ctx.fillStyle = '#7f8f6f'; ctx.fillRect(c.left() - 64, c.top() - 64, c.w + 128, c.h + 128); });
      for (const [o, k2] of [[G.World, 'drawLiquid'], [G.World, 'visibleProps'], [G.Projectiles, 'draw'], [G.HUD, 'draw'], [G.EnemyMgr, 'drawables'], [pl, 'draw']]) tapar(o, k2, k2 === 'visibleProps' || k2 === 'drawables' ? () => [] : () => {});
      tapar(G.MODS, 'relieveAltura', 0); tapar(G.MODS, 'sombras', false);
      if (G.Entorno) tapar(G.Entorno, 'suelo', (c, cm) => { if (G.Horno) G.Horno.tick(cm); });
      tapar(G.World, 'drawVignette', () => {});
      for (const [dx, dy] of [[-90, -20], [60, 30], [10, -70]]) G.Projectiles.spawn({ x: pl.x + dx, y: pl.y + dy, vx: 0, vy: 0, dmg: 0, r: 7, life: 9999, vis: G.VFX.forType('fire'), friendly: true });
      const now = performance.now.bind(performance), t0 = now(); performance.now = () => t0;
      try {
        for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r));
        const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        const m = Math.round(cam.scale * cam.dpr * G.Sprites.PX), entero = Math.abs(cam.scale * cam.dpr * G.Sprites.PX - m) < 1e-6;
        // La zona: un cuadrado alrededor de tu Pokémon (donde alumbran las tres), lejos del HUD.
        const cx0 = Math.round((pl.x - cam.left()) * cam.scale * cam.dpr), cy0 = Math.round((pl.y - cam.top()) * cam.scale * cam.dpr), R = Math.round(110 * cam.scale * cam.dpr);
        const x0 = Math.max(0, cx0 - R), y0 = Math.max(0, cy0 - R), x1 = Math.min(W, cx0 + R), y1 = Math.min(cv.height, cy0 + R);
        let mejor = null, colores = new Set();
        for (let fy = 0; fy < m; fy++) for (let fx = 0; fx < m; fx++) {
          let bloques = 0, malos = 0;
          for (let by = y0 + fy; by + m <= y1; by += m) for (let bx = x0 + fx; bx + m <= x1; bx += m) {
            bloques++;
            const o0 = (by * W + bx) * 4;
            let igual = true;
            for (let y = 0; y < m && igual; y++) for (let x = 0; x < m; x++) { const o = ((by + y) * W + bx + x) * 4; if (d[o] !== d[o0] || d[o + 1] !== d[o0 + 1] || d[o + 2] !== d[o0 + 2]) { igual = false; break; } }
            if (!igual) malos++;
          }
          if (!mejor || malos < mejor.malos) mejor = { fx, fy, bloques, malos };
        }
        for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) { const o = (y * W + x) * 4; colores.add(d[o] + ',' + d[o + 1] + ',' + d[o + 2]); }
        return { m, entero, ...mejor, colores: colores.size };
      } finally { performance.now = now; G.Projectiles.clear(); for (const u of deshacer.reverse()) u(); }
    });
    report.medidas['relieve-luz-pixel-' + nv] = px;
    check(`${nv}: luz con el píxel nítido: cada píxel de arte mide ${px.m}×${px.m} píxeles físicos y, con la luz de tres bolas de fuego sobre un suelo liso, ${px.bloques - px.malos} de ${px.bloques} bloques son de un solo color (≥ 99,5 %; ${px.colores} tonos distintos: la luz se ve)`,
      px.entero && px.bloques > 200 && px.malos <= px.bloques * 0.005 && px.colores >= 6, px);

    // 3. «Menos sacudidas y destellos»: el búfer de luz no cambia entre dos fotogramas (con eléctricos, que parpadean, y la grieta).
    const calma = await page.evaluate(async () => {
      const pl = G.Game.player;
      for (const [dx, tipo] of [[-60, 'electric'], [60, 'fire']]) G.Projectiles.spawn({ x: pl.x + dx, y: pl.y, vx: 0, vy: 0, dmg: 0, r: 7, life: 9999, vis: G.VFX.forType(tipo), friendly: true });
      const foto = async () => { for (let i = 0; i < 2; i++) await new Promise(r => requestAnimationFrame(r)); const c = G.Luz.lienzo; return Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data); };
      const igual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
      G.Settings.set('calm', true);
      const a = await foto(); await new Promise(r => setTimeout(r, 400)); const b = await foto();
      G.Settings.set('calm', false);
      const c = await foto(); await new Promise(r => setTimeout(r, 400)); const d = await foto();
      G.Projectiles.clear();
      return { quieta: igual(a, b), cambiaSin: !igual(c, d) };
    });
    check(`${nv}: luz con «Menos sacudidas y destellos»: el búfer es el mismo en dos fotogramas a 400 ms (${calma.quieta}); sin él, los eléctricos parpadean (${calma.cambiaSin})`, calma.quieta && calma.cambiaSin, calma);

    // 4. Avisos del suelo y disparos enemigos: sus píxeles, iguales con y sin la luz; el suelo de alrededor, más oscuro con ella.
    const av = await page.evaluate(async () => {
      const pl = G.Game.player, cam = G.Camera, cv = document.getElementById('game'), W = cv.width, k = cam.scale * cam.dpr;
      const hx = pl.x - 160, hy = pl.y + 40, ex = pl.x + 150, ey = pl.y + 30;
      G.Hazards.add({ kind: 'zone', x: hx, y: hy, r: 40, delay: 9999, dmg: 0, type: 'poison', color: '#c04bff', t: 9999 * 0.8 }, true);
      G.Projectiles.spawn({ x: ex, y: ey, vx: 0, vy: 0, dmg: 0, r: 8, life: 9999, vis: G.VFX.forType('water'), friendly: false });
      const now = performance.now.bind(performance), t0 = now(); performance.now = () => t0;
      const foto = async () => { for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r)); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.slice(); };
      try {
        G.MODS.luz = true; const con = await foto();
        G.MODS.luz = false; const sin = await foto();
        G.MODS.luz = true;
        const zona = (x, y, rx, ry) => { let iguales = 0, n = 0; const sx = (x - cam.left()) * k, sy = (y - cam.top()) * k;
          for (let py = Math.floor(sy - ry * k); py < sy + ry * k; py++) for (let px2 = Math.floor(sx - rx * k); px2 < sx + rx * k; px2++) {
            if (((px2 - sx) / (rx * k)) ** 2 + ((py - sy) / (ry * k)) ** 2 > 1 || px2 < 0 || py < 0 || px2 >= W || py >= cv.height) continue;
            const o = (py * W + px2) * 4; n++; if (con[o] === sin[o] && con[o + 1] === sin[o + 1] && con[o + 2] === sin[o + 2]) iguales++; }
          return { n, iguales }; };
        const aviso = zona(hx, hy, 30, 22), disparo = zona(ex, ey - G.LIFT, 6, 6), suelo = zona(pl.x - 230, pl.y + 70, 24, 10);
        return { aviso, disparo, suelo };
      } finally { performance.now = now; G.Hazards.clear(); G.Projectiles.clear(); }
    });
    report.medidas['relieve-avisos-' + nv] = av;
    check(`${nv}: luz: dentro de un aviso de zona (${av.aviso.iguales} de ${av.aviso.n} píxeles) y en un disparo enemigo (${av.disparo.iguales} de ${av.disparo.n}), los mismos píxeles con y sin la luz; en el suelo de lejos, más oscuro (iguales: ${av.suelo.iguales} de ${av.suelo.n})`,
      av.aviso.n > 100 && av.aviso.iguales >= av.aviso.n * 0.99 && av.disparo.n > 20 && av.disparo.iguales >= av.disparo.n * 0.99 && av.suelo.iguales <= av.suelo.n * 0.05, av);

    // 5. Sombra de los objetos: al sureste del árbol más cercano, el suelo más oscuro con las sombras que sin ellas.
    const so = await page.evaluate(async () => {
      const pl = G.Game.player, cam = G.Camera, cv = document.getElementById('game'), W = cv.width, k = cam.scale * cam.dpr, PX = G.Sprites.PX;
      const arbol = G.World.visibleProps(cam).filter(p => p.type === 'tree' && cam.sees(p.x, p.y, -60)).sort((a, b) => Math.hypot(a.x - pl.x, a.y - pl.y) - Math.hypot(b.x - pl.x, b.y - pl.y))[0];
      if (!arbol) return null;
      const img = G.Tiles.propSprite(G.World.biome, 'tree', 0), h = img.height;
      // Un punto del suelo en la sombra: lo que proyecta la mitad del árbol (z = h/2): (x + z·0,55, pie + z·0,3), a la derecha del tronco.
      const z = h * 0.5, sx = arbol.x + (z * 0.55 + 3) * PX, sy = arbol.y + z * 0.3 * PX;
      const now = performance.now.bind(performance), t0 = now(); performance.now = () => t0;
      const foto = async () => { for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r)); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.slice(); };
      try {
        G.MODS.sombras = true; const con = await foto(); G.MODS.sombras = false; const sin = await foto(); G.MODS.sombras = true;
        const px2 = Math.round((sx - cam.left()) * k), py = Math.round((sy - cam.top()) * k), o = (py * W + px2) * 4;
        const l = (d) => d[o] * 0.299 + d[o + 1] * 0.587 + d[o + 2] * 0.114;
        return { con: Math.round(l(con)), sin: Math.round(l(sin)), arbol: [Math.round(arbol.x), Math.round(arbol.y)] };
      } finally { performance.now = now; }
    });
    check(`${nv}: sombras: al sureste de un árbol, el suelo más oscuro con las sombras (${so && so.con}) que sin ellas (${so && so.sin})`, so && so.con < so.sin - 5, so);

    if (clave === 'pc') {
      // 6. El estilo sólo cambia la interfaz: sin el HUD, el lienzo del juego es el mismo con Dex y con Clásico.
      const st = await page.evaluate(async () => {
        const pl = G.Game.player;
        for (const [dx, tipo] of [[-70, 'fire'], [80, 'electric']]) G.Projectiles.spawn({ x: pl.x + dx, y: pl.y - 30, vx: 0, vy: 0, dmg: 0, r: 7, life: 9999, vis: G.VFX.forType(tipo), friendly: true });
        const hud = G.HUD.draw; G.HUD.draw = () => {};
        const anim = pl.anim.update; pl.anim.update = () => {};      // en la pausa, upstream sigue animando a tu Pokémon (a ×0,25)
        G.Settings.set('calm', true);
        const cv = document.getElementById('game'), now = performance.now.bind(performance), t0 = now(); performance.now = () => t0;
        const foto = async () => { for (let i = 0; i < 4; i++) await new Promise(r => requestAnimationFrame(r)); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.slice(); };
        try {
          G.Estilo.set('dex'); const a = await foto();
          G.Estilo.set('clasico'); const b = await foto();
          G.Estilo.set('dex');
          let dif = 0, caja = null;
          for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) {
            dif++; const x = (i / 4) % cv.width, y = Math.floor(i / 4 / cv.width);
            caja = caja ? [Math.min(caja[0], x), Math.min(caja[1], y), Math.max(caja[2], x), Math.max(caja[3], y)] : [x, y, x, y];
          }
          G.MODS.mundoDex = false; G.Estilo.set('clasico');
          if (G.Horno) G.Horno.rehornear();
          for (let i = 0; i < 300 && G.Horno && G.Horno.conViejas; i++) await new Promise(r => requestAnimationFrame(r));
          const c = await foto();
          G.MODS.mundoDex = true; G.Estilo.set('dex'); if (G.Horno) G.Horno.rehornear();
          let difViejo = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== c[i] || a[i + 1] !== c[i + 1] || a[i + 2] !== c[i + 2]) difViejo++;
          return { dif, caja, difViejo, n: a.length / 4 };
        } finally { performance.now = now; G.HUD.draw = hud; pl.anim.update = anim; G.Settings.set('calm', false); G.Projectiles.clear(); }
      });
      report.medidas['relieve-estilo-' + nv] = st;
      check(`${nv}: el estilo sólo cambia la interfaz: sin el HUD, el lienzo del juego es el mismo con Dex y con Clásico (${st.dif} de ${st.n} píxeles distintos); con mundoDex = false, el de Clásico era otro (${st.difViejo})`,
        st.dif === 0 && st.difViejo > st.n * 0.2, st);
    }

    if (clave === 'movil') {
      // 7. Con la pantalla dividida («abajo»), la luz se pinta en la mitad del juego (su lienzo) y la de los mandos no cambia.
      const dv = await page.evaluate(async () => {
        G.Settings.set('dividida', 'abajo');
        window.dispatchEvent(new Event('resize'));
        for (let i = 0; i < 20; i++) await new Promise(r => requestAnimationFrame(r));
        const cv = document.getElementById('game'), cam = G.Camera, buf = G.Luz.lienzo;
        const pintadas = []; const p0 = G.Luz.pintar; G.Luz.pintar = function (ctx, c) { pintadas.push([c.w, c.h]); return p0.apply(this, arguments); };
        for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r));
        G.Luz.pintar = p0;
        const res = { juego: [cv.width, cv.height], camara: [Math.round(cam.w), Math.round(cam.h)], buf: buf && [buf.width, buf.height], pintadas: pintadas.length,
          bufEsperado: [Math.ceil(cam.w / G.Sprites.PX) + 2, Math.ceil(cam.h / G.Sprites.PX) + 2], dividida: !!(G.Dividida && G.Dividida.activa) || document.documentElement.classList.contains('pantalla-dividida') };
        G.Settings.set('dividida', 'no');
        window.dispatchEvent(new Event('resize'));
        for (let i = 0; i < 10; i++) await new Promise(r => requestAnimationFrame(r));
        return res;
      });
      report.medidas['relieve-dividida-' + nv] = dv;
      check(`${nv}: luz con la pantalla dividida («abajo»): se pinta cada fotograma (${dv.pintadas}) con la cámara de la mitad del juego (${dv.camara}) y el búfer de su tamaño (${dv.buf} = ${dv.bufEsperado})`,
        dv.dividida && dv.pintadas >= 2 && dv.buf && dv.buf[0] === dv.bufEsperado[0] && dv.buf[1] === dv.bufEsperado[1], dv);
    }

    await captura(page, `relieve-cresta-dex-${nv}`);
    await page.evaluate(() => G.Estilo.set('clasico'));
    await sleep(150);
    await captura(page, `relieve-cresta-clasico-${nv}`);
    check(`${nv}: relieve, sombras y luz: consola sin errores ni avisos y nada pedido fuera de 127.0.0.1`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
    await P.ctx.close();
  }
  report.medidas['relieve-segundos'] = Math.round((Date.now() - t0) / 1000);
  console.log(`[INFO] relieve, sombras y luz (sección 18): ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// ---------------- hoja de contactos ----------------
function hojaDeContactos() {
  const pares = {};
  for (const f of report.capturas) { const m = /^(.+)-(dex|clasico)-(.+)\.png$/.exec(f); if (!m) continue; const k = m[1] + ' · ' + m[3]; (pares[k] = pares[k] || {})[m[2]] = f; }
  const filas = Object.entries(pares).map(([k, p]) => `<tr><th>${k}</th><td>${p.clasico ? `<a href="${p.clasico}"><img src="${p.clasico}"></a>` : ''}</td><td>${p.dex ? `<a href="${p.dex}"><img src="${p.dex}"></a>` : ''}</td></tr>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'indice.html'), `<!doctype html><meta charset="utf-8"><title>Estilo: Clásico y Dex</title>
<style>body{font:14px system-ui;background:#111;color:#eee;margin:16px}table{border-collapse:collapse}th{text-align:left;padding:8px;vertical-align:top;width:180px}td{padding:4px}img{width:560px;display:block}</style>
<h1>Estilo: Clásico (izquierda) y Dex (derecha)</h1><p>${report.inicio} · ${BASE}</p><table>${filas}</table>`);
}

// ---------------- prueba ----------------
(async () => {
  const srv = await startServer(ROOT, PORT);
  const browser = await chromium.launch({ headless: HEADLESS });
  try {
    // 7. «Gira el móvil»: un móvil en vertical y el Magic V6 plegado en vertical, sí; los plegables abiertos, no (y entran a jugar más abajo).
    for (const v of !OTRAS ? [] : [{ w: 390, h: 844, dpr: 3, tactil: true }, { w: 360, h: 807, dpr: 3, tactil: true }]) {
      const P = await nuevo(browser, v);
      await P.page.goto(BASE, { waitUntil: 'load' });
      await P.page.waitForFunction(() => document.getElementById('boot').classList.contains('hidden'), null, { timeout: 30000 });
      await sleep(200);
      const gira = await P.page.evaluate(() => !document.getElementById('rotate').classList.contains('hidden'));
      check(`«Gira el móvil» en un móvil en vertical (${nombreVp(v)}, táctil)`, gira);
      // Con Dex, la capa es opaca: al 94 %, la tarjeta de «Pulsa para empezar» (más ancha, sin velo) asomaba detrás.
      if (v.w === 360) await captura(P.page, `gira-clasico-${nombreVp(v)}`);
      await P.page.evaluate(() => G.Estilo.set('dex'));
      await sleep(150);
      const fondo = await P.page.evaluate(() => getComputedStyle(document.getElementById('rotate')).backgroundColor);
      if (v.w === 360) await captura(P.page, `gira-dex-${nombreVp(v)}`);
      check(`«Gira el móvil» con Dex (${nombreVp(v)}): la capa es opaca (${fondo}), sin la tarjeta de «Pulsa para empezar» asomando detrás`, gira && /^rgb\(/.test(fondo), fondo);
      await P.ctx.close();
    }

    // 404 en una ruta profunda (/a/b/c): la hoja de estilo llega una vez y bien, sin un 404 de más en la consola (antes, el
    // escáner de precarga la pedía relativa a la ruta, /a/b/css/pages.css, antes de que el script escribiera la base).
    if (OTRAS) {
      const P = await nuevo(browser, VP.pc), { page } = P, url = `http://127.0.0.1:${PORT}/a/b/c`, fallidas = [];
      page.on('response', r => { if (r.status() >= 400 && r.url() !== url) fallidas.push(`${r.status()} ${r.url()}`); });
      page.on('requestfailed', r => fallidas.push(`falló ${r.url()}`));
      const res = await page.goto(url, { waitUntil: 'load' });
      await sleep(300);
      const d = await page.evaluate(() => ({ titulo: document.title, hojas: [...document.styleSheets].map(h => ({ href: h.href, reglas: (() => { try { return h.cssRules.length; } catch (e) { return -1; } })() })) }));
      // La consola sólo puede tener el 404 de la propia página (el servidor responde 404 a la ruta, como GitHub Pages).
      const ajenos = P.consola.filter(x => !/status of 404/.test(x));
      check(`404 en una ruta profunda (/a/b/c): «${d.titulo}» con su hoja de estilo (${d.hojas.map(h => h.href).join(', ')}), sin peticiones fallidas y como mucho el 404 de la propia página en la consola`,
        res.status() === 404 && /PokéSwarm/.test(d.titulo) && d.hojas.length === 1 && /\/css\/pages\.css$/.test(d.hojas[0].href) && d.hojas[0].reglas > 0 &&
        !fallidas.length && !ajenos.length && P.consola.length <= 1 && !P.fuera.length, { d, fallidas, consola: P.consola, fuera: P.fuera });
      await P.ctx.close();
    }

    for (const [clave, v] of !OTRAS ? [] : Object.entries(VP)) {
      const P = await nuevo(browser, v), { page } = P, nv = nombreVp(v), t0 = Date.now();
      const dentro = await entrar(P);
      if (v.tactil && v.w / v.h > 0.75) check(`${nv}: juega sin «Gira el móvil»`, dentro);
      if (!dentro) { await P.ctx.close(); continue; }

      // 1. Las 21 pantallas en los dos estilos (y la piel Dex puesta en cada una).
      const { malas, piel, acerca } = await recorrerPantallas(P);
      check(`${nv}: las 21 pantallas en Dex y Clásico sin desplazamiento horizontal, con la caja dentro, sin el menú detrás y sin la línea de créditos encima de la caja`, !malas.length, malas.slice(0, 6));
      check(`${nv}: la piel Dex está puesta en las 21 pantallas (borde de la caja, letra y fondo de los botones) y en Clásico no`, !piel.length, piel.slice(0, 4));
      check(`${nv}: Ajustes > Acerca de, el título «PokéSwarm» y «Versión» centrados en la caja (a 2 px o menos) en Dex y en Clásico`, !acerca.length, acerca);

      // El menú principal.
      for (const e of ESTILOS) {
        await estilo(page, e);
        await page.evaluate(() => { G.MenuUI.open(); document.getElementById('scr-menu').scrollTop = 0; for (const x of document.querySelectorAll('.ach-pop, .toast')) x.classList.add('hidden'); });
        await sleep(250);
        const m = await page.evaluate(MEDIR_MENU);
        check(`${nv} ${e}: menú principal con las 9 opciones a la vista sin desplazar, el logotipo libre de la barra superior y los créditos sin pisar ninguna caja`,
          m.opciones === 9 && !m.mal.length && !m.desplazada && !m.logoTapado && !m.creditosPisan, m);
      }

      // 4. Fin de partida: «Volver al menú» a la vista y cada panel, entero en algún momento.
      for (const e of ESTILOS) {
        await estilo(page, e);
        await page.evaluate(PANTALLAS.find(p => p[0] === 'scr-over')[1]);
        await sleep(300);
        const r = await page.evaluate(FIN_PANELES);
        check(`${nv} ${e}: fin de partida con las estadísticas de una partida larga: «Volver al menú» a la vista y los ${r.paneles} paneles se llegan a ver enteros, sin el botón encima, desplazando la caja`,
          r.botonVisible && r.paneles >= 8 && !r.nunca.length, r);
        await page.evaluate(salirDePartida);
      }

      // 2. Gacha: banners en pantallas de móvil y de plegable; tiradas.
      if (GACHA_MOVIL.includes(clave)) {
        const { malos, tiras } = await gachaBanners(P);
        check(`${nv}: gacha en los 9 banners (Dex y Clásico): destacados dentro del banner y de la ventana, a su tamaño (sin escalar), y los tres botones a la vista ${v.h < 520 ? 'sin desplazar nada' : 'sin desplazar (las probabilidades, debajo)'}`,
          !malos.length, malos.slice(0, 3));
        check(`${nv}: pestañas de región (Dex y Clásico): la elegida, entera y fuera del degradado, en los 9 banners; el degradado, sólo en el lado por el que hay más (si no caben)`, !tiras.length, tiras.slice(0, 4));
        if (v.h < 520) {
          for (const e of ESTILOS) {
            await estilo(page, e);
            await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
            await sleep(350);
            await page.click('#gacha-gens .gen-tab[data-gen="1"]');   // la tabla más larga (el gacha recuerda el último banner, el del Multiverso)
            const aviso = await page.evaluate(AVISO_GACHA);
            await page.click('#gacha-prob');
            await sleep(250);
            const prob = await page.evaluate(MEDIR_PROB);
            if (clave === 'movil') await captura(page, `probabilidades-${e}-${nv}`);
            await page.keyboard.press('Escape');
            await sleep(150);
            const trasEsc = await page.evaluate(() => ({ capa: !document.getElementById('gacha-prob-capa').classList.contains('hidden'), gacha: G.UI.isOpen('scr-gacha') }));
            check(`${nv} ${e}: capa «Probabilidades»: dentro de la ventana, la tabla debajo del título, «Cerrar» entero y sin pisarla; Esc la cierra sin cerrar el gacha`,
              prob.abierta && prob.dentro && prob.debajo && !prob.pisa && prob.textoDentro && prob.filas >= 6 && !trasEsc.capa && trasEsc.gacha, { prob, trasEsc });
            check(`${nv} ${e}: un aviso de logro con el gacha abierto no tapa los botones de tirar ni se queda sus toques`, !aviso.tapa && aviso.toque && aviso.eventos === 'none', aviso);
          }
        }
      }
      if (TIRADAS.includes(clave)) {
        for (const e of (v.h < 520 ? ESTILOS : ['dex'])) {
          await estilo(page, e);
          await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
          await page.click('#gacha-gens .gen-tab[data-gen="1"]');   // Kanto: el gacha recuerda el último banner, el del Multiverso, que se paga con tickets ×10
          const x1 = await tirar(P, 'pull-1');
          if (CON_CAPTURAS.includes(clave)) await captura(page, `tirada-x1-${e}-${nv}`);
          await page.click('#pull-close');
          await sleep(200);
          const x10 = await tirar(P, 'pull-10');
          if (CON_CAPTURAS.includes(clave)) await captura(page, `tirada-x10-${e}-${nv}`);
          await page.click('#pull-close');
          await sleep(200);
          check(`${nv} ${e}: tiradas ×1 y ×10 sin desplazar, con «Continuar» a la vista sin tapar ninguna carta y el premio en su lienzo, a su tamaño y sin cortes`,
            x1.cartas === 1 && x10.cartas === 10 && [x1, x10].every(x => x.desplaza <= 1 && x.continuarVisible && !x.pisa && !x.fuera && x.escalaCss && !x.premioCortado.length), { x1, x10 });
          const ev = await tirarRepetidos(P);
          if (CON_CAPTURAS.includes(clave) || clave === 'movilBajo') await captura(page, `tirada-x10-repetidos-${e}-${nv}`);
          await page.click('#pull-close');
          await sleep(200);
          check(`${nv} ${e}: ×10 de diez repetidos que desbloquean su evolución (nombres largos): cada etiqueta entera, con el nombre de la evolución, y cada carta a la vista sin «Continuar» encima${v.h < 520 ? ', sin desplazar' : ''}`,
            ev.cartas === 10 && !ev.malas.length && !ev.nuncaEnteras && (v.h >= 520 || ev.desplaza <= 1), ev);
        }
      }

      // 5. Franja de tipo (y foco en las cartas, en los dos estilos).
      if (clave === 'pc' || clave === 'movil') {
        for (const e of ESTILOS) {
          await estilo(page, e);
          await page.evaluate('G.Flow.play();');
          const f = await page.evaluate(FRANJAS);
          if (e === 'dex') {
            const mal = f.filter(x => !(Math.abs(x.ancho - 8) <= 1 && x.alto >= x.cartaAlto - 2 && (x.contraste >= 3 || x.conFilo >= 3)));
            check(`${nv} Dex: franja de tipo de 8 ± 1 px a todo el alto en las cartas de los 18 tipos, ≥ 3:1 contra la carta (con su filo en Fantasma, Dragón y Siniestro)`,
              f.length === 18 && !mal.length, mal.length ? mal : f.map(x => `${x.tipo} ${x.contraste}${x.conFilo ? '/' + x.conFilo : ''}`).join(', '));
            report.medidas['franjas-' + nv] = f;
          } else {
            check(`${nv} Clásico: sin franja de tipo (como upstream) y las cartas se pueden enfocar con Tab (tabindex 0, role=button)`,
              f.every(x => x.contenido === 'none' && x.tabindex === 0 && x.role === 'button'), f.slice(0, 2));
          }
          await page.evaluate(salirDePartida);
        }
      }

      // 6. Teclado y Ajustes (Dex, escritorio); y las píldoras de tipo con Dex.
      if (clave === 'pc') {
        await estilo(page, 'dex');
        const pild = await page.evaluate(PILDORAS);
        check('Dex: las píldoras de tipo (G.UI.typeChips: colección, menú, iniciales…) de los 18 tipos con ≥ 4,5:1 entre la letra y su fondo (Fantasma, Dragón y Siniestro, con letra clara)',
          pild.length === 18 && pild.every(x => x.ratio >= 4.5), pild.map(x => `${x.tipo} ${x.ratio}`).join(', '));
        await page.evaluate('G.MenuUI.open(); document.activeElement && document.activeElement.blur();');
        const menu = await tabula(page, 12, '.menu-item');
        await page.evaluate(`G.Flow.play(); G.RunUI.showLevelUp(3, G.LevelUp.offer(G.Game.player), () => {}); document.activeElement && document.activeElement.blur();`);
        const cartas = await tabula(page, 4, '#cards .card');
        await page.evaluate(salirDePartida);
        await page.evaluate('G.MenuUI.open(); G.SettingsUI.open("gfx"); document.activeElement && document.activeElement.blur();');
        const ajustes = await tabula(page, 12, '#set-body [data-estilo], #set-tabs .gen-tab, #set-close');
        const anillo = 'rgb(98, 227, 221)';
        check('Dex: Tab recorre el menú, las cartas de nivel y Ajustes con el anillo de foco visible (2 px, color pantalla)',
          menu.length >= 8 && cartas.length >= 3 && ajustes.length >= 3 && [...menu, ...cartas, ...ajustes].every(x => x.anillo === anillo), { menu, cartas, ajustes });
        const sec = await page.evaluate(() => [...document.querySelectorAll('#set-body .set-h')].map(h => h.textContent.trim()));
        await page.click('#set-body [data-estilo="clasico"]');
        await sleep(100);
        const trasClic = await page.evaluate(() => ({ estilo: G.Estilo.actual, clase: document.documentElement.classList.contains('estilo-dex'), primera: document.querySelector('#set-body .set-h').textContent,
          marcado: document.querySelector('#set-body [data-estilo].on').dataset.estilo, guardado: JSON.parse(localStorage.getItem('ps.settings') || '{}').estilo }));
        await page.click('#set-body [data-estilo="dex"]');
        await sleep(100);
        const vuelta = await page.evaluate(() => ({ estilo: G.Estilo.actual, clase: document.documentElement.classList.contains('estilo-dex'), fuente: (() => { const c = document.createElement('canvas').getContext('2d'); c.font = '700 13px Pixelify'; return c.font; })() }));
        check('Ajustes > Gráficos: «Estilo» es la primera sección y sus botones cambian el estilo al momento (clase de <html>, lo guardado y la letra del lienzo)',
          sec[0] === 'Estilo' && trasClic.estilo === 'clasico' && !trasClic.clase && trasClic.primera === 'Estilo' && trasClic.marcado === 'clasico' && trasClic.guardado === 'clasico' &&
          vuelta.estilo === 'dex' && vuelta.clase && /M PLUS Rounded 1c/.test(vuelta.fuente), { sec, trasClic, vuelta });
        await page.evaluate('G.SettingsUI.close();');
      }

      // Capturas por pares (los dos estilos, mismo momento).
      if (CON_CAPTURAS.includes(clave)) {
        const fotos = [
          ['menu', 'G.MenuUI.open();'], ['coleccion', 'G.MenuUI.open(); document.querySelector("#scr-menu [data-go=dex]").click();'],
          ['gacha', 'G.MenuUI.open(); G.GachaUI.open();'], ['ajustes', 'G.MenuUI.open(); G.SettingsUI.open("gfx");', 'G.SettingsUI.close();'],
          ['sala', PANTALLAS.find(p => p[0] === 'scr-lobby')[1], PANTALLAS.find(p => p[0] === 'scr-lobby')[2]],
          ['iniciales', PANTALLAS.find(p => p[0] === 'scr-starters')[1]], ['mejoras', 'G.MenuUI.open(); document.querySelector("#scr-menu [data-go=upgrades]").click();'],
          ['subida-nivel', `G.Flow.play(); G.RunUI.showLevelUp(7, G.LevelUp.offer(G.Game.player), () => {});`],
          ['pausa', PANTALLAS.find(p => p[0] === 'scr-pause')[1]], ['fin', PANTALLAS.find(p => p[0] === 'scr-over')[1]]
        ];
        for (const e of ESTILOS) {
          await estilo(page, e);
          for (const [n, abrir, cerrar] of fotos) {
            await page.evaluate(abrir);
            await sleep(n === 'gacha' || n === 'coleccion' ? 700 : 350);
            await page.mouse.move(2, 2);
            await captura(page, `${n}-${e}-${nv}`);
            if (n === 'subida-nivel') {
              await page.hover('#cards .card >> nth=1');
              await sleep(200);
              await captura(page, `subida-nivel-raton-${e}-${nv}`);
              await page.mouse.move(2, 2);
              await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
              for (let i = 0; i < 8 && !(await page.evaluate(() => !!(document.activeElement && document.activeElement.matches('#cards .card')))); i++) await page.keyboard.press('Tab');
              await sleep(150);
              await captura(page, `subida-nivel-foco-${e}-${nv}`);
            }
            if (cerrar) await page.evaluate(cerrar);
            if (['subida-nivel', 'pausa', 'fin'].includes(n)) await page.evaluate(salirDePartida);
          }
          // La tragaperras, a medio girar (escritorio y móvil).
          if (clave === 'pleg2') { await page.evaluate(salirDePartida); continue; }
          await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
          await page.click('#pull-1');
          await sleep(900);
          await captura(page, `tragaperras-${e}-${nv}`);
          for (let i = 0; i < 150 && !(await page.locator('#pull-close').isVisible().catch(() => false)); i++) { await page.locator('#slot').click({ force: true }).catch(() => {}); await sleep(150); }
          await page.click('#pull-close').catch(() => {});
          await page.evaluate(salirDePartida);
        }
      }

      // 3. Que no se corte ningún sprite: destacados de los 10 banners, compañero del menú (y el premio, en las tiradas).
      if (clave === 'pc' || clave === 'movil') {
        await estilo(page, 'dex');
        await page.evaluate('G.MenuUI.open(); G.GachaUI.open();');
        const feat = [], vivos = [], banners = await page.evaluate(DESTACADOS), total = banners.reduce((a, [, n]) => a + n, 0);
        for (const [g] of banners) {
          await page.click(`#gacha-gens .gen-tab[data-gen="${g}"]`);
          feat.push(...(await page.evaluate(BORDES, '#gacha-feat canvas')).map(x => ({ banner: g, ...x })));
          vivos.push(...(await page.evaluate(BORDES_VIVOS, '#gacha-feat canvas')).map((x, j) => ({ banner: g, j, ...x })));
        }
        const malos = feat.filter(x => x.sinColocar || x.toca);
        check(`${nv}: destacados del gacha: ningún fotograma que pueden pintar (Idle y las animaciones que caben) de los ${total} destacados (27 legendarios y los del Multiverso) toca el borde de su lienzo de 170x190 (${feat.reduce((s, x) => s + (x.fotogramas || 0), 0)} fotogramas), ni en 30 fotogramas de verdad`,
          feat.length === total && total >= 27 && !malos.length && vivos.every(x => !x.toca && !x.vacios), malos.length ? malos : vivos.filter(x => x.toca || x.vacios));
        report.medidas['destacados-' + nv] = feat.map(x => ({ banner: x.banner, nombre: x.nombre, k: x.k, vida: x.vida, margen: x.peor && x.peor.margen }));
        if (clave === 'pc') console.log('[INFO] destacados a ×2: ' + feat.filter(x => x.k === 2).length + ' de ' + total + '; a ×1: ' + feat.filter(x => x.k === 1).map(x => x.nombre).join(', '));
        const comp = await page.evaluate(() => [...new Set([...G.STARTERS.map(s => s.dex), 25, 133, 799, 321, 890, 384, 6, 150])]);
        const res = [];
        for (const dex of comp) {
          await page.evaluate(d => { G.DB.save.partner = d; G.DB.save.partnerShiny = false; G.MenuUI.open(); }, dex);
          res.push(...await page.evaluate(BORDES, '#tc-partner'));   // con Dex, el de la «Tarjeta de entrenador»
        }
        const vivoComp = await page.evaluate(BORDES_VIVOS, '#tc-partner');
        const malComp = res.filter(x => x.sinColocar || x.toca);
        check(`${nv}: compañero del menú (${res[0] && res[0].lienzo}): ningún fotograma de ${comp.length} Pokémon (iniciales y gigantes) toca el borde; la escala, entera hasta ×6`,
          !malComp.length && vivoComp.every(x => !x.toca) && res.every(x => x.k >= 1 && x.k <= 6), malComp.length ? malComp : vivoComp);
        report.medidas['companero-' + nv] = res.map(x => ({ nombre: x.nombre, k: x.k, vida: x.vida, margen: x.peor && x.peor.margen }));
        await page.evaluate(d => { G.DB.save.partner = d; G.MenuUI.open(); }, comp[0]);
      }

      check(`${nv}: consola sin errores ni avisos y nada pedido fuera de 127.0.0.1`, !P.consola.length && !P.fuera.length, { consola: P.consola.slice(0, 5), fuera: P.fuera.slice(0, 5) });
      console.log(`[INFO] ${nv}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      await P.ctx.close();
    }

    // 10. HUD Dex en partida (lote 2).
    if (OTRAS || SOLO_HUD) await pruebaHud(browser);

    // 11. Arreglos de la verificación de los lotes 1 y 2 (barra del navegador, móviles pequeños, barra superior estrecha,
    //     el aviso flotante al empezar, «…» y zonas seguras simuladas).
    if (OTRAS) await pruebaArreglos(browser);

    // 12. Portada «Tarjeta de entrenador» (Dex) y el menú del proyecto base con el nombre nuevo (Clásico).
    if (OTRAS || SOLO_PORTADA) await pruebaPortada(browser);

    // 13. Entornos del Gremio, clima de dos tonos y horneado escalonado (lote 3).
    if (OTRAS || SOLO_ENTORNOS) await pruebaEntornos(browser);

    // 14. Ajustes de juego (lote 4): píxel nítido, encuadre, golpe final e iris. 15. Pantalla dividida (lote 5).
    if (OTRAS || SOLO_JUEGO) { await pruebaJuego(browser); await pruebaDividida(browser); }

    // 16. «Elige a tu compañero» sin el test de personalidad.
    if (OTRAS || SOLO_COMPANERO) await pruebaCompanero(browser);

    // 17. Mapas propios: capturas de los biomas, las 18 arenas y el fondo del menú, y nada de terreno normal en la arena.
    if (OTRAS || SOLO_MAPAS) await pruebaMapas(browser);

    // 18. Relieve, sombras y luz (2.5D falsa): oclusión, Claridad, píxel nítido, «Menos sacudidas», avisos y disparos
    //     enemigos sin oscurecer, sombras, el estilo sólo en la interfaz y la pantalla dividida.
    if (OTRAS || SOLO_RELIEVE) await pruebaRelieve(browser);

    // 8. Sin internet: con el service worker y en Clásico, se cargan las fuentes en reposo; luego, sin red, a Dex.
    if (OTRAS) {
      const P = await nuevo(browser, VP.pc, { sw: true }), { page, ctx } = P;
      await page.goto(BASE, { waitUntil: 'load' });
      await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {});
      const control = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
      const bajadas = await page.evaluate(() => Promise.race([G.Estilo.descargaEnReposo(), new Promise(r => setTimeout(() => r('tiempo'), 25000))]));
      const antes = await page.evaluate(() => ({ estilo: G.Estilo.actual, fuente: document.fonts.check('800 16px "M PLUS Rounded 1c"') }));
      const pedidas = [];
      page.on('request', r => pedidas.push(r.url()));
      await ctx.setOffline(true);
      await page.evaluate(() => G.Estilo.set('dex'));
      const despues = await page.evaluate(async () => {
        await Promise.all(['500 16px "M PLUS Rounded 1c"', '800 16px "M PLUS Rounded 1c"'].map(f => document.fonts.load(f).catch(() => null)));
        return { estilo: G.Estilo.actual, f500: document.fonts.check('500 16px "M PLUS Rounded 1c"'), f800: document.fonts.check('800 16px "M PLUS Rounded 1c"'),
          cargadas: [...document.fonts].filter(f => /M PLUS/.test(f.family) && f.status === 'loaded').length };
      });
      await ctx.setOffline(false);
      const fueraDeFuentes = pedidas.filter(u => !/\/assets\/fonts\//.test(u));
      check('sin internet: tras la primera carga en Clásico (service worker al mando y fuentes bajadas en reposo), al pasar a Dex sin red la letra está y no se pide nada fuera de assets/fonts',
        control && bajadas === true && antes.estilo === 'clasico' && despues.f500 && despues.f800 && despues.cargadas >= 2 && !fueraDeFuentes.length,
        { control, bajadas, antes, despues, pedidas });
      await ctx.close();
    }
  } catch (e) {
    check('la prueba terminó sin excepciones', false, String(e && e.stack || e));
  } finally {
    hojaDeContactos();
    report.fin = new Date().toISOString();
    report.resultado = fallos ? `${fallos} fallo(s)` : 'todo bien';
    save();
    await browser.close().catch(() => {});
    srv.close();
  }
  console.log(fallos ? `\nRESULTADO: ${fallos} fallo(s). Informe: ${path.relative(process.cwd(), path.join(OUT, 'informe.json'))}` : `\nRESULTADO: todo bien. Capturas y hoja de contactos: ${path.relative(process.cwd(), path.join(OUT, 'indice.html'))}`);
  process.exit(fallos ? 1 : 0);
})();
