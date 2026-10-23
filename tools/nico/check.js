/* ============ tools/nico/check.js — comprobación rápida del fork (sin navegador) ============
 *   node tools/nico/check.js            (desde la raíz del repo o desde tools/nico)
 *
 * Pasarlo SIEMPRE tras `git merge upstream/main` y antes de publicar. Comprueba:
 *   1. Higiene de fork: nada del Firebase/TURN/dominio/correo del proyecto base en lo que se
 *      sirve; que no han vuelto CNAME, robots.txt, sitemap.xml, en/, las páginas SEO, etc.;
 *      y Firebase: la config publicada es null o de un proyecto de la lista blanca
 *      (G.FIREBASE_PROYECTOS en js/core/firebase-config.js), igual que toda URL de
 *      Firebase en la nube que aparezca en lo servido. Y nada de lo publicado (todo el
 *      repositorio salvo LICENSE, que conserva el aviso MIT) nombra el proyecto base: su nombre,
 *      su autor, su dominio, su Firebase, su apiKey ni su correo (sus huellas, en tools/nico/base.js).
 *      Y lo que publica Pages (tools/nico/sitio.js): sólo el juego, con todo lo que el juego carga.
 *   2. index.html y dev.html (también se publica): noindex, sin SEO del proyecto base, sin
 *      enlaces a páginas borradas, y que el ?v= de index.html coincide con js/app.min.js.
 *      Y que el paquete js/app.min.js está al día con las fuentes (lo reconstruye en una
 *      carpeta temporal con los mismos parámetros que tools/build.js y compara).
 *   3. Que siguen los ganchos "// MOD nico" y js/core/mods.js se carga en dev.html.
 *   4. Curación: simula 2.000 runs con el código real (node:vm) y exige 0 curanderos,
 *      y que con curacionEnemiga=true sí salgan (control: la prueba sabe detectarlos).
 *   5. Tamaño: escala de los 966 Pokémon con el código real; normales intactos.
 *   6. Invitado del cooperativo: la ventana que evita el rebote de vida (js/core/mods.js).
 *   7. Busca en TODO js/ (menos js/app.min.js) asignaciones de vida que no estén en la
 *      lista de conocidas: una nueva es FALLO hasta revisarla (posible curación de upstream).
 *   9. Grieta garantizada: la lógica de js/core/mods.js (hora, una por partida, reintentos, jefe,
 *      quién manda) y js/systems/rift.js real con el juego simulado, en solitario y en grupo
 *      (anfitrión e invitado): el legendario de esa grieta con el 60 % y las naturales intactas. Y la
 *      vuelta en grupo con js/net/coop.js real y la red simulada: el invitado vuelve con el anfitrión
 *      ('af') y conserva las copias de los enemigos del mapa; fusiones y aviso «Pausa: …» sin tu nombre.
 *  10. Gacha y tickets: tickets ganados ×2 (bankTickets, syncTeam y la recogida de game.js, los
 *      premios de progress.js; sin cobro doble, sin restas, sin tocar las definiciones ni traer dos
 *      veces la partida oficial) y shiny ×1,5 (el gacha real sembrado, rollShiny de spawner.js y la línea
 *      del legendario de rift.js tal cual, y el cartel del gacha con el refresh() real de gacha-ui.js) y
 *      repetido -> su evolución (js/data/evolutions.js sin ciclos y sólo con especies del juego; pull() real
 *      con las tiradas guionizadas: Bulbasaur, Eevee, shiny, ×10 en orden, ramas; la carta y el inglés).
 *      La grieta: también la primera natural antes del límite lleva el 60 % (las posteriores, enteras).
 *      Avisos de logro: los de una tirada esperan a que cierres el resultado (progress.js real).
 *  11. Claridad en partida (js/entities/claridad.js con fx.js, enemy.js y mods.js reales): números de daño
 *      sumados por enemigo (también el invitado; el escudo aparte, a la derecha sin tocarlo), su vida y su
 *      subida sin depender de los FPS; barras de vida sólo 1,5 s tras un cambio (y quién las conserva); qué
 *      tapa a tu Pokémon (también lo alto con los pies lejos y lo que salta), el contorno a escala, el aro, el chevrón y los
 *      compañeros; el borde rojo (golpe, vida baja, «menos sacudidas»). Y que lo que copia de upstream sigue
 *      igual: disparoHostil() frente a G.VFX.draw (vfx.js real) y a la llamada de projectile.js, y repintar()
 *      frente a Animator.draw (sprites.js real), y el salto de cada enemigo, frente al lift de enemy.js draw().
 *  12. Arreglos de upstream: el bioma a los 0-120 min con world.js y tiles.js reales (nombre, líquido y daño de
 *      los charcos; control: upstream da «Grieta · …» a los 12 min y se rompe a los 84) y el fogonazo de la
 *      grieta, que se apaga también al elegir fusión (frame() de game.js tal cual).
 *  13. Pantallas: «Gira el móvil» sólo en un móvil en vertical (pedirGiro de mods.js y checkOrientation() de
 *      game.js tal cual): un plegable desplegado o una tableta juegan; la pantalla completa sólo fija la
 *      horizontal en un móvil.
 *  14. Identidad visual «Dex de Expedición»: las fuentes de M PLUS Rounded 1c en local (su tabla name: copyright
 *      y OFL; los glifos de los textos; «…» fuera de su unicode-range), su licencia y CREDITS.md; css/tokens-dex.css y js/ui/marca.js con las
 *      mismas cifras; G.Estilo (js/ui/estilo.js) con settings.js real: valor por defecto de mods.js, guardado,
 *      fuente del lienzo (setter: con Dex, Pixelify -> M PLUS; con Clásico, nada; también las cadenas que upstream
 *      monta en hud.js, fx.js y claridad.js), Ajustes (Estilo primero, créditos, controles), cartas (franja,
 *      filo, foco, píldora), contraste de la franja en los 18 tipos, lienzos del compañero y del premio (los de
 *      upstream en Clásico), Tab (tabLibre) y disposicion() (bandas y zona libre del HUD, ≤ 20 % en compacto y
 *      escala ≤ 1,25, criterio de Nico; pantalla dividida);
 *      css/nico.css (arreglos en los dos estilos, piel sólo bajo html.estilo-dex), inglés, finales de línea
 *      y que cada ajuste de mods.js está en la tabla de CLAUDE.md.
 *  15. HUD Dex (js/ui/hud-dex.js, con hud.js y events.js reales y un lienzo de mentira que apunta cada operación):
 *      ≤ 20 % del alto en compacto con todo a la vez (criterio de Nico) y columnas ≤ 22 % del ancho; sin solapes
 *      en escritorio, móvil (con muesca) y el plegable; escala ≤ 1,25; bandas iguales a G.Estilo.disposicion(); barra
 *      del jefe en #9B6BFF con 3 marcas y más gruesa que tus PS; flechas (fuera de pantalla o tapado, dentro de la
 *      zona libre); ranura de avisos con cola; toques donde se pintan (≥ 44 px); cooperativo; contraste de cada texto;
 *      red de seguridad (fallback a upstream, Clásico = upstream, huellas e inventario de hud.js y events.js);
 *      pantalla dividida preparada (rectángulos de juego y de controles) e inglés. Y los arreglos de la verificación
 *      del lote 2: nombres de bioma y arena enteros en Rotom, pista de controles corta, flechas fuera de la píldora
 *      del ataque, «Caído» con muesca, nada sobre el pliegue del plegable, aire en las filas de compañeros y el
 *      aviso de logro bajo el HUD. Y los de la verificación de los lotes 1 y 2: flechas del mismo cuadrante sin pisarse
 *      y con su etiqueta entera en la zona libre (cuatro esquinas, 9 pantallas, ocho a la vez, el caído en las
 *      esquinas), los avisos de la fila 2 a un lado del pliegue, el pliegue de la pantalla y no de la ventana, y la
 *      caché de anchos que se vacía al cargar una fuente. Y el acabado de las flechas (verificación de la tanda
 *      PokéSwarm): 12 px de texto a texto entre etiquetas, el cuerpo a 8 px o más de las piezas, de la píldora y de la
 *      ranura activa (donde se pinta, corrida), y nada sobre el pliegue (también con la barra del navegador).
 *  16. Entornos del Gremio, clima y horneado escalonado (js/world/entorno.js y horno.js con tiles.js, world.js y weather.js
 *      reales): paletas (el suelo, el de upstream; Clásico vuelve a upstream), el chunk de Clásico byte a byte el de upstream,
 *      gradación sólo en el suelo, determinista y sin trazos; horno (precalentado desde t % 240 = 237, 0 horneados al cambiar,
 *      como mucho 1 chunk por fotograma con un paintChunk lento, la imagen vieja sólo con fundido o cambio de estilo, una
 *      grieta, otro mundo o el estilo descartan lo precalentado, el fondo de los menús, y sin ganchos igual que upstream);
 *      tabla de Calidad (farol, halos y motas; ningún halo de disparos enemigos por defecto; halos sin bordes duros);
 *      viñeta cálida con el centro intacto y clima de dos tonos (con Clásico, los de upstream).
 *  17. Ajustes de juego (lote 4): píxel nítido, encuadre, iris, rótulo de zona y golpe final.
 *  18. Pantalla dividida estilo Nintendo DS (lote 5).
 *  19. Sin el test de personalidad (G.MODS.sinTest): afterLogin() de js/game.js tal cual abre «Elige a tu compañero»
 *      (js/ui/elegir-companero.js) y no el test, y con sinTest = false o sin el fichero, el test de siempre; test.js y
 *      starters.js de upstream intactos (huella); disposicion() con las medidas de Chromium en 12 pantallas y los dos
 *      estilos (los 29 sin desplazar, píxel de arte entero, nombres y tipos dentro); confirmar() guarda como el test
 *      (personalidad null, el logro «Primer compañero» con achievements.js real); inglés, estilos y paquete.
 *  23. Mapas propios (G.MODS.mapasPropios; js/world/mapas-datos.js, mapas.js, mapas-pintar.js y mapas-sprites.js con tiles.js,
 *      world.js y weather.js reales, cargados con new Function en este reino como tools/nico/mapas/vista.js: en node:vm el
 *      generador va unas 40 veces más lento): el interruptor (con false, el proyecto base tal cual); pureza (sin azar ni reloj, la
 *      misma huella en cualquier orden y en otro reino) y suma de control fija; estructura en 4 semillas × 384² (pared, líquido,
 *      pasillos de 1, suelo encerrado, holgura), el claro de salida, los objetos (recuentos del §6, separación, cruces) y la
 *      aparición (spawner, grieta, ladrón y perdido con isFree de verdad); las 18 arenas en 40 posiciones y en el mundo de verdad;
 *      paletas (campos, legibilidad con L*, contraste y ΔE2000, y lejos de las originales), nombres e inglés; el pintor (sólo
 *      ImageData, determinista, no más lento que el de upstream, gradación sólo en el suelo); los sprites (tamaño, contorno, el
 *      orbe del altar, trampas); la semilla del menú; el clima al azar; y que el terreno no depende del bioma. §12, §15 (M1) y §16
 *      también corren con los mapas propios (§16 B, el «Clásico byte a byte», sin ellos).
 *  24. Multiverso (js/data/multiverso.js): los personajes de otros mundos en G.DEX sin chocar con upstream (gen 10, desde el
 *      10001), sus hojas con el tamaño de su meta, sus ataques (la lista que validó Nico, cada uno con la escalera de su forma y
 *      su evolución, fuera de los pools de tipo; sólo esos en poolFor(), con control sin el gancho; dentro del rango de daño y
 *      alcance de los ataques Pokémon de su forma; las cartas de offer() de levelup.js real, «Repertorio» y su aspecto en vfx.js),
 *      nunca de enemigo (2.000 runs con enemies.js real, con control sin los ganchos; el Pokémon perdido de events.js),
 *      su banner en el gacha real (siempre uno suyo, su coste en tickets ×10 y el premio de un repetido, por ticket por
 *      debajo del techo de un banner normal, los demás banners sin ellos), el cartel y
 *      la ficha (refresh() real de gacha-ui.js), el inglés, los ganchos, el paquete y CREDITS.md; sus hojas (de PixelLab, montadas por
 *      tools/nico/multiverso/montar.py) con el tamaño, el radio y la escala de un Pokémon normal.
 *  25. Apariciones en grupo con vistas distintas (js/net/vistas.js, G.MODS.aparicionVistas): spawner.js real con un PC
 *      (720x450 de mundo) de anfitrión y un móvil (1266x585, con el encuadre) de invitado en 10 posiciones: ningún enemigo ni
 *      jefe nace dentro de la vista de nadie, sin perder más apariciones que upstream (control: sin el ajuste, sí nacen en la
 *      del móvil); en solitario, con el ajuste apagado o sin vistas.js, las mismas apariciones que upstream con el mismo azar;
 *      los rezagados con el bloque de enemy.js tal cual (el que el móvil ve no vuelve; el que nadie ve, sí); y la red con
 *      coop.js real (el invitado manda ['vista', ...] al empezar, al cambiar y cada 2 s; el anfitrión la apunta, con topes).
 *      Y la bomba de un compañero (G.MODS.bombaVistas) con el trozo de onCollect() de game.js tal cual, sobre una rejilla
 *      de enemigos: con el ajuste, exactamente los del rectángulo de SU vista (un móvil y un PC); sin él, sin sus datos,
 *      sin vistas.js o con la línea de upstream reconstruida, el círculo de upstream; y la tuya, siempre tu pantalla.
 * Sale con código 1 si algo falla.
 *  26. Relieve, sombras y luz (2.5D falsa; js/world/relieve.js, sombras.js y luz.js con el mundo real): el lienzo del relieve
 *      (tramos = paredes, techo subido y cara de 8 + H, el resto transparente), el orden en la escena (norte detrás, sur
 *      delante, lo que vuela encima), su caja para Claridad, el dibujo y el fundido de bioma, la caché; la luz (sólo con
 *      Calidad Alta y con el mundo Dex, sus fuentes, sin parpadeo con «Menos sacudidas», el búfer en la rejilla del mundo y
 *      multiplicado, los avisos a 1, el brillo encima); y las sombras de las paredes (hacia el sureste, sólo en el suelo).
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto'), os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ex = f => fs.existsSync(path.join(ROOT, f));
let fails = 0, warns = 0;
const ok = m => console.log('  ok    ' + m);
const bad = m => { fails++; console.log('  FALLO ' + m); };
const warn = m => { warns++; console.log('  aviso ' + m); };

function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

// ---------------- 1. higiene de fork ----------------
console.log('1. Higiene de fork');
const SERVED = ['index.html', 'dev.html', '404.html', 'sw.js', 'manifest.webmanifest', 'contacto/index.html',
  ...walk('js').filter(f => f.endsWith('.js')), ...walk('css')].filter(ex);
// Las señas del proyecto base (dominio, proyecto Firebase, apiKey, autor, su correo y el nombre del juego): en
// tools/nico/base.js sólo están sus huellas, para que no salgan en lo que se publica. nombra() las busca.
const BASE = require('./base.js');
const nombraDominio = s => BASE.nombra(s, ['dominio']).length > 0, nombraAutor = s => BASE.nombra(s, ['autor']).length > 0;
// La búsqueda por huellas sabe encontrar: señas inventadas con las reglas de cada una, en las formas en que salían.
{
  const P = { dominio: BASE.crear('dominio', 'juego-ajeno.example'), firebase: BASE.crear('firebase', 'proyecto-ajeno-123'),
    apikey: BASE.crear('apikey', 'AIzaSyQwErTy'), autor: BASE.crear('autor', 'zorro'), correo: BASE.crear('correo', 'ana.perez.lopez'),
    nombre: BASE.crear('nombre', 'JuegoAjéno') };
  const casos = [
    ['dominio', 'ver https://turn.JUEGO-AJENO.example/x', true], ['dominio', 'juego-ajeno.examples', true], ['dominio', 'juego_ajeno.example', false],
    ['firebase', '"proyecto-ajeno-123-default-rtdb.firebaseio.com"', true], ['firebase', 'proyecto-ajeno-12', false],
    ['apikey', 'apiKey: "AIzaSyQwErTyUiOp"', true], ['apikey', 'apiKey: "AIzaSyqwertyUiOp"', false],
    ['autor', 'Copyright ZORRO78 y ko-fi.com/zorro', true], ['autor', 'zorr o', false],
    ['correo', 'mailto:Ana.Perez.Lopez@gmail.com', true], ['correo', 'ana-perez-lopez', false],
    ['nombre', 'JuegoAjéno', true], ['nombre', 'el JuegoAjeno', true], ['nombre', 'Juego Ajéno y más', true], ['nombre', 'juegoajeno-partida', false]];
  const malos = casos.filter(([id, txt, sale]) => (BASE.nombra(txt, [P[id]]).length > 0) !== sale);
  // Y la línea: la aparición de la línea 3 se da en su sitio.
  const enLinea = BASE.nombra('a\nb\nx Juego Ajeno', [P.nombre]), lineaOk = enLinea.length === 1 && 'a\nb\nx Juego Ajeno'.slice(0, enLinea[0].i).split('\n').length === 3;
  const huellasOk = BASE.SENAS.length === 6 && BASE.CREDITO.join() === 'autor,nombre' && BASE.SENAS.every(s => /^[0-9a-f]{64}$/.test(s.h) && s.n > 0);
  if (!malos.length && lineaOk && huellasOk) ok(`base.js: la búsqueda por huellas encuentra las señas (${casos.length} casos inventados, con mayúsculas, tilde, espacio, subdominio y dentro de una URL) y no da falsos positivos`);
  else bad(`base.js: la búsqueda por huellas falla: ${JSON.stringify(malos)}${lineaOk ? '' : ' (línea mal)'}${huellasOk ? '' : ' (huellas mal formadas)'}`);
}
// Los mensajes de commit también se ven en GitHub: el hook tools/nico/hooks/commit-msg los mira con base.js. Existe, es
// ejecutable en git, deja pasar un mensaje limpio y, en este clon (no en el de GitHub Actions), está activo.
{
  const sh = 'tools/nico/hooks/commit-msg', js = 'tools/nico/hooks/commit-msg.js';
  let modo = '', activo = '', limpio = false;
  try { modo = execFileSync('git', ['ls-files', '-s', sh], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(' ')[0]; } catch (e) { /* sin git */ }
  try { activo = execFileSync('git', ['config', '--get', 'core.hooksPath'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { /* sin configurar */ }
  if (ex(js)) {
    const tmp = path.join(os.tmpdir(), `ps-msg-${process.pid}.txt`);
    fs.writeFileSync(tmp, 'Arreglo del gacha\n\nSin nombres de nadie\n# comentario de git\n');
    try { execFileSync(process.execPath, [path.join(ROOT, js), tmp], { stdio: 'ignore' }); limpio = true; } catch (e) { limpio = false; }
    fs.rmSync(tmp, { force: true });
  }
  if (modo !== '100755' || !ex(js) || !limpio || !/BASE\.nombra\(msg, BASE\.VIGILADAS\)/.test(rd(js))) bad(`hook de los mensajes de commit: ${sh} (ejecutable en git: ${modo || 'no está'}) o ${js} no funciona`);
  else ok('hook de los mensajes de commit: ejecutable, busca las señas de base.js y deja pasar un mensaje limpio');
  if (!process.env.CI && activo !== 'tools/nico/hooks') warn('el hook de los mensajes de commit no está activo en este clon: git config core.hooksPath tools/nico/hooks');
}
// Firebase: lista blanca y config, con el código real de js/core/firebase-config.js.
function loadFirebaseConfig(host, search) {
  const ctx = { URL, URLSearchParams, location: { hostname: host, search } };
  vm.createContext(ctx);
  ctx.G = {};
  vm.runInContext(rd('js/core/firebase-config.js'), ctx, { filename: 'js/core/firebase-config.js' });
  return ctx.G;
}
let FB = null, ALLOWED = [];
try { FB = loadFirebaseConfig('nicooliver123-cell.github.io', ''); ALLOWED = Array.isArray(FB.FIREBASE_PROYECTOS) ? [...FB.FIREBASE_PROYECTOS] : []; }
catch (e) { bad('no se pudo evaluar js/core/firebase-config.js: ' + e.message); }
// Toda URL de Firebase en la nube (Realtime Database, Auth/Hosting) debe ser de un proyecto de la lista.
const FB_HOST = /(?<![\w<>.-])([a-z0-9][a-z0-9-]*)((?:\.[a-z0-9-]+)*)\.(firebasedatabase\.app|firebaseio\.com|firebaseapp\.com|web\.app)\b/g;
let hits = 0;
for (const f of SERVED) {
  const s = rd(f);
  for (const what of new Set(BASE.nombra(s, BASE.CREDITO_EN.includes(f) ? BASE.VIGILADAS : undefined).map(o => o.que))) { hits++; bad(`${f}: ${what}`); }
  for (const m of s.matchAll(FB_HOST)) {
    const id = m[1].replace(/-default-rtdb$/, '');
    if (!ALLOWED.includes(id)) { hits++; bad(`${f}: URL de Firebase de un proyecto fuera de la lista blanca: ${m[0]}`); }
  }
}
if (!hits) ok(`${SERVED.length} ficheros servidos sin referencias a la infraestructura ni al correo del proyecto base`);
// Y en TODO lo publicado (el repositorio es público: también README, CREDITS, CLAUDE.md, PLAN.md y tools/), ni el
// nombre del proyecto base, ni su dominio, su Firebase, su apiKey, su autor (ni su repositorio) ni su correo. Sólo
// LICENSE conserva el aviso MIT, que es obligatorio. Los binarios (imágenes, fuentes, sonido) no se miran.
{
  let pub = null;
  // El índice y también los ficheros nuevos sin añadir (no ignorados): uno creado a mano no se escapa hasta el commit.
  try { pub = [...new Set([['ls-files'], ['ls-files', '--others', '--exclude-standard']].flatMap(a => execFileSync('git', [...a, '-z'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean)))]; }
  catch (e) { pub = ['.'].flatMap(d => walk(d)).map(f => f.replace(/^\.\//, '')).filter(f => !/^(\.git|tools\/nico\/(node_modules|out)|tools\/cache)\//.test(f)); }
  const BIN = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|mp3|ogg|wav|zip|gz)$/i;
  const malos = [];
  for (const f of pub.filter(f => f !== 'LICENSE' && !BIN.test(f) && ex(f))) {
    const txt = rd(f), vistos = new Set();
    for (const o of BASE.nombra(txt, BASE.CREDITO_EN.includes(f) ? BASE.VIGILADAS : undefined)) {   // el crédito, sólo en CREDITO_EN
      const m = `${f}:${txt.slice(0, o.i).split('\n').length} (${o.que})`;
      if (!vistos.has(m)) { vistos.add(m); malos.push(m); }
    }
  }
  if (malos.length) bad(`lo publicado nombra el proyecto base (${malos.length}): ${malos.slice(0, 12).join('; ')}${malos.length > 12 ? '…' : ''}`);
  else ok(`${pub.length} ficheros publicados sin el dominio, el Firebase, la apiKey ni el correo del proyecto base, y con su nombre y su autor sólo en el aviso MIT de LICENSE y en los créditos (${BASE.CREDITO_EN.join(', ')})`);
  // El crédito al juego original (decisión de Nico, 14-10-2026): Ajustes > Acerca de lo dice, con nombre y autor.
  const cred = () => { const x = { console }; x.window = x; x.G = {}; vm.createContext(x); vm.runInContext(rd('js/core/mods.js'), x); return x.G.MODS.creditoOriginal ? x.G.MODS.creditoOriginal() : ''; };
  let credTxt = ''; try { credTxt = cred(); } catch (e) { credTxt = ''; }
  if (BASE.CREDITO.every(id => BASE.nombra(credTxt, [id]).length) && /MOD nico/.test((rd('js/ui/settings-ui.js').split(/\r?\n/).find(l => l.includes('creditoOriginal')) || '')))
    ok('crédito al juego original: Ajustes > Acerca de nombra el juego y a su autor (G.MODS.creditoOriginal)');
  else bad('crédito al juego original: G.MODS.creditoOriginal() no nombra el juego y su autor, o falta su gancho en settings-ui.js');
  // Y LICENSE conserva el aviso MIT tal cual (la única excepción): el bloque entero, de «MIT License» a «SOFTWARE.»
  // (copyright, permiso, condición y exención de garantía), sin CR, tiene la huella del de upstream. Si upstream lo
  // cambia (por ejemplo, el año), se copia su bloque literal y se pone aquí la huella nueva.
  const FIN_MIT = 'OTHER DEALINGS IN THE\nSOFTWARE.';
  const lic = rd('LICENSE').replace(/\r/g, ''), iMit = lic.indexOf('MIT License\n'), fMit = lic.indexOf(FIN_MIT);
  const bloqueMit = iMit >= 0 && fMit > iMit ? lic.slice(iMit, fMit + FIN_MIT.length) : '';
  const HUELLA_MIT = 'a61999a8cb8613b5c638c292d7cad1ea23c815b4';
  if (bloqueMit && nombraAutor(bloqueMit) && crypto.createHash('sha1').update(bloqueMit).digest('hex') === HUELLA_MIT)
    ok('LICENSE conserva el aviso MIT del proyecto base entero y literal (copyright, permiso, condición y exención de garantía)');
  else bad('LICENSE: el aviso MIT no está entero y literal (de «MIT License» a «SOFTWARE.»: es obligatorio conservarlo tal cual)');
  // «Mundo Misterioso» (el subtítulo del proyecto base) no vuelve a la interfaz: ni en las páginas, ni en el manifiesto,
  // ni en las hojas de estilo fuera de sus comentarios, ni en el paquete (terser quita los comentarios: lo que quede en
  // js/app.min.js es texto o claves). Sigue donde describe el origen de los sprites (CREDITS.md y comentarios).
  const RE_MM = /Mundo Misterioso|Mystery Dungeon/i, mm = [];
  for (const f of pub.filter(f => /\.(html|webmanifest|css)$/.test(f) || f === 'js/app.min.js').filter(ex)) {
    const txt = /\.css$/.test(f) ? rd(f).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')) : rd(f);
    txt.split('\n').forEach((l, i) => { if (RE_MM.test(l)) mm.push(`${f}:${i + 1}`); });
  }
  if (mm.length) bad(`«Mundo Misterioso» vuelve a la interfaz (el subtítulo o una clave del proyecto base): ${mm.slice(0, 8).join(', ')}`);
  else ok('«Mundo Misterioso» fuera de la interfaz (páginas, manifiesto, estilos y paquete; queda sólo donde describe los sprites)');
}
// Lo que publica Pages (tools/nico/sitio.js, desde el workflow .github/workflows/publicar.yml): sólo el juego, sin las
// notas de trabajo ni las herramientas, y con todo lo que el juego carga. Una página, un estilo o un script que cite
// un fichero del repositorio que no está en el sitio funcionaría en local y daría 404 en la web publicada.
{
  let enSitio = null;
  try { enSitio = new Set(require('./sitio.js').ficheros(ROOT)); } catch (e) { bad('tools/nico/sitio.js: no se pudo listar el sitio: ' + e.message); }
  if (enSitio) {
    const privados = ['CLAUDE.md', 'PLAN.md', 'README.md', 'tools/nico/check.js', 'tools/nico/base.js', 'tools/nico/sitio.js',
      'firestore.rules', 'database.rules.json', '.firebaserc', '.github/workflows/publicar.yml'].filter(f => enSitio.has(f));
    const faltanBase = ['index.html', 'dev.html', '404.html', 'sw.js', 'manifest.webmanifest', 'favicon.ico', 'js/app.min.js',
      'LICENSE', 'CREDITS.md', 'contacto/index.html'].filter(f => !enSitio.has(f));
    // Atributos href/src, url() de los estilos y cadenas del código que son la ruta de un fichero.
    const RE_REF = /(?:\b(?:href|src)\s*=\s*\\?["']|url\(\s*["']?|["'`])((?:\.\.?\/)?(?:[\w@%+-][\w.@%+-]*\/)*[\w@%+-][\w.@%+-]*\.(?:html|js|css|png|webp|jpe?g|gif|ico|svg|json|webmanifest|woff2?|ttf|otf|md|txt|mp3|ogg|wav))(?=[?#"'`)\s\\])/g;
    const fuera = new Set();
    let refs = 0;
    for (const f of [...enSitio].filter(f => /\.(html|css|js|webmanifest)$/.test(f))) {
      const base = /\.(html|css)$/.test(f) ? path.posix.dirname(f) : '.';   // el código se carga desde la página (la raíz)
      for (const m of rd(f).matchAll(RE_REF)) {
        const destino = path.posix.normalize(path.posix.join(base, m[1]));
        if (!ex(destino)) continue;   // una cadena que no es un fichero (o uno que se arma con variables)
        refs++;
        if (!enSitio.has(destino)) fuera.add(`${destino} (en ${f})`);
      }
    }
    if (privados.length || faltanBase.length || fuera.size)
      bad(`sitio publicado (tools/nico/sitio.js): ${privados.length ? 'publica ' + privados.join(', ') + '; ' : ''}${faltanBase.length ? 'falta ' + faltanBase.join(', ') + '; ' : ''}${fuera.size ? 'el juego cita ficheros que no se publican: ' + [...fuera].slice(0, 10).join(', ') : ''}`);
    else ok(`sitio publicado: ${enSitio.size} ficheros del juego, sin notas de trabajo ni herramientas, y las ${refs} referencias a ficheros de las páginas, estilos y código están dentro`);
    const wf = ex('.github/workflows/publicar.yml') ? rd('.github/workflows/publicar.yml') : '';
    const pasos = ['node tools/nico/check.js', 'needs: comprobar', 'node tools/nico/sitio.js _site', 'path: _site', 'actions/deploy-pages'];
    const faltanPasos = pasos.filter(p => !wf.includes(p));
    if (!wf || faltanPasos.length || wf.indexOf('node tools/nico/check.js') > wf.indexOf('actions/deploy-pages'))
      bad(`.github/workflows/publicar.yml: falta o no comprueba antes de publicar el sitio (${faltanPasos.join(', ') || 'orden'})`);
    else ok('workflow: check.js en cada push y pull request; en main, y sólo si pasa, publica el sitio de sitio.js');
  }
}
const GONE = ['CNAME', 'robots.txt', 'sitemap.xml', 'en', 'guia', 'pokedex', 'legendarios', 'shinies', 'tipos', 'movimientos',
  'objetos', 'logros', 'novedades', 'apoyar', 'functions', 'tools/activar_dominio.sh', '.github/FUNDING.yml',
  // PokéSwarm (12-10-2026): documentación, Worker y generadores del proyecto base, donaciones y el generador del
  // icono anterior (los iconos de PokéSwarm salen de tools/nico/iconos.py).
  'docs', 'GDD.md', 'cloudflare', 'tools/make_seo_pages.py', 'tools/export_data.js', 'assets/og-image.jpg', 'tools/make_icons.py',
  'js/data/funding.js', 'js/ui/support-ui.js'];
// Y los iconos del proyecto base (assets/icons/icon-*): los de PokéSwarm son swarm-* y favicon.ico.
if (ex('assets/icons')) GONE.push(...fs.readdirSync(path.join(ROOT, 'assets/icons')).filter(f => /^icon-/.test(f)).map(f => 'assets/icons/' + f));
const back = GONE.filter(ex);
if (back.length) bad(`han vuelto (seguramente por un merge de upstream): ${back.join(', ')}. Quitar con: git rm -r ${back.join(' ')}`);
else ok('sin CNAME, robots.txt, sitemap.xml, en/, páginas SEO, functions/, docs/, GDD.md, cloudflare/, donaciones, el generador del icono anterior ni sus iconos (assets/icons/icon-*)');
// Cada icono que citan las páginas y el manifiesto existe (un merge mal resuelto dejaría la PWA o la pestaña sin icono).
{
  const citados = new Set();
  for (const f of ['index.html', 'dev.html', '404.html', 'contacto/index.html', 'manifest.webmanifest'].filter(ex))
    for (const m of rd(f).matchAll(/(?:assets\/icons\/[\w.-]+|favicon\.ico)(?=["')\s?#])/g)) citados.add(m[0]);
  const faltan = [...citados].filter(f => !ex(f));
  if (!citados.size || faltan.length) bad(`iconos citados que no existen: ${faltan.join(', ') || '(no se encontró ninguno citado)'}`);
  else ok(`los ${citados.size} iconos que citan las páginas y el manifiesto existen (${[...citados].sort().join(', ')})`);
}
if (/(href|src)="\//.test(rd('404.html'))) bad('404.html vuelve a tener rutas absolutas (no sirve en una subruta de GitHub Pages): ¿se ejecutó make_seo_pages.py?');
else ok('404.html sin rutas absolutas (vale en subruta)');
if (/"default"\s*:\s*"demo-ps"/.test(rd('.firebaserc'))) ok('.firebaserc apunta a demo-ps'); else bad('.firebaserc no apunta a demo-ps');
if (/"functions"/.test(rd('firebase.json'))) bad('firebase.json vuelve a tener el bloque functions'); else ok('firebase.json sin functions');
if (FB) {
  const okList = ALLOWED.length && ALLOWED.every(x => typeof x === 'string' && x && !BASE.nombra(x, ['autor', 'firebase']).length) && ALLOWED.includes('demo-ps');
  if (okList) ok(`lista blanca de Firebase: ${ALLOWED.join(', ')} (sin el proyecto del proyecto base)`); else bad(`lista blanca de Firebase incorrecta: ${JSON.stringify(ALLOWED)}`);
  const P = FB.FIREBASE_PERMITIDA, cfg = FB.FIREBASE_CONFIG;
  if (typeof P !== 'function') bad('falta G.FIREBASE_PERMITIDA en firebase-config.js (db.js no conectaría con nada)');
  else {
    // Controles: lo que debe rechazar. El proyecto del proyecto base no puede estar en la lista blanca (lo mira okList,
    // por su huella); aquí, uno cualquiera de fuera de la lista y un dominio ajeno.
    const no = [
      { projectId: 'proyecto-ajeno', authDomain: 'proyecto-ajeno.firebaseapp.com' },
      { projectId: 'otro-proyecto' },
      { projectId: 'demo-ps', databaseURL: 'https://otro-default-rtdb.europe-west1.firebasedatabase.app' },
      { projectId: 'demo-ps', authDomain: 'otro.firebaseapp.com' },
      { projectId: 'demo-ps', authDomain: 'juego-ajeno.example', databaseURL: 'https://demo-ps-default-rtdb.europe-west1.firebasedatabase.app' },
      { projectId: 'demo-ps', authDomain: 'demo-ps.firebaseapp.com' },
      { projectId: 'demo-ps', authDomain: 'demo-ps.firebaseapp.com', databaseURL: 'https://otro.example.com/?ns=demo-ps-default-rtdb' },
      { projectId: 'demo-ps', authDomain: 'demo-ps.firebaseapp.com', databaseURL: 'http://demo-ps-default-rtdb.europe-west1.firebasedatabase.app' }].filter(c => P(c));
    if (no.length) bad('G.FIREBASE_PERMITIDA acepta configs ajenas: ' + JSON.stringify(no)); else ok('G.FIREBASE_PERMITIDA rechaza proyectos fuera de la lista (el del proyecto base no está en ella) y URLs de otro proyecto');
    if (cfg === null) ok('config publicada en null (modo local) hasta tener el Firebase propio');
    else if (!cfg || !ALLOWED.includes(cfg.projectId) || !P(cfg) || cfg.emulator || /^demo-/.test(cfg.projectId))
      bad(`config publicada NO permitida: proyecto ${cfg && cfg.projectId} (lista blanca: ${ALLOWED.join(', ')}; sin emulator ni demo-)`);
    else ok(`config publicada del proyecto propio ${cfg.projectId} (en la lista blanca)`);
    const emu = loadFirebaseConfig('127.0.0.1', '?emu').FIREBASE_CONFIG;
    if (emu && emu.emulator && emu.projectId === 'demo-ps' && P(emu)) ok('?emu en 127.0.0.1 usa el emulador (demo-ps)'); else bad('?emu en local no da la config del emulador demo-ps');
    const emuFuera = loadFirebaseConfig('nicooliver123-cell.github.io', '?emu').FIREBASE_CONFIG;
    if (emuFuera && emuFuera.emulator) bad('?emu activa el emulador fuera de este PC'); else ok('?emu no hace nada fuera de localhost');
  }
}

// ---------------- 2. index.html y paquete ----------------
console.log('2. index.html y js/app.min.js');
const idx = rd('index.html');
if (/<meta name="robots" content="noindex">/.test(idx)) ok('index.html lleva noindex'); else bad('index.html sin noindex: construir con node tools/build.js --privado');
if (nombraDominio(idx) || /rel="canonical"/.test(idx)) bad('index.html conserva SEO del proyecto base (canonical/og): construir con --privado');
else ok('index.html sin canonical ni enlaces al dominio del proyecto base');
// dev.html también se publica (GitHub Pages sirve todo el repo).
const devH = rd('dev.html');
const robots = [...devH.matchAll(/<meta name="robots" content="([^"]*)">/g)].map(m => m[1]);
if (robots.length && robots.every(c => /noindex/.test(c))) ok('dev.html lleva noindex y ningún robots "index"');
else bad(`dev.html: robots ${JSON.stringify(robots)} (debe haber noindex y ningún "index")`);
if (nombraDominio(devH) || /rel="canonical"/.test(devH)) bad('dev.html conserva el SEO del proyecto base (canonical/og a su dominio)');
else ok('dev.html sin canonical ni enlaces al dominio del proyecto base');
if (/window\.PS_PAGES = false;/.test(devH) && !/PS_PAGES\s*=\s*true/.test(devH)) ok('dev.html: window.PS_PAGES = false (sin botones a guía, Pokédex ni apoyar)');
else bad('dev.html: falta window.PS_PAGES = false o vuelve a ponerse a true');
const noidx = ['404.html', 'contacto/index.html'].filter(f => !/<meta name="robots" content="noindex">/.test(rd(f)));
if (noidx.length) bad('sin noindex: ' + noidx.join(', ')); else ok('404.html y contacto/ llevan noindex');
// Enlaces a páginas que el fork borró, en las páginas que se sirven.
const DEAD = /href="(\.\.\/|\.\/|\/)?(en|guia|pokedex|legendarios|shinies|tipos|movimientos|objetos|logros|novedades|apoyar)\//;
const deadIn = ['index.html', 'dev.html', '404.html', 'contacto/index.html'].filter(f => DEAD.test(rd(f)));
if (deadIn.length) bad('enlaces a páginas que el fork borró en: ' + deadIn.join(', '));
else ok('ninguna página enlaza a las que borró el fork (guia/, pokedex/, en/, apoyar/...)');
const domIn = ['index.html', 'dev.html', '404.html', 'contacto/index.html'].filter(f => nombraDominio(rd(f)));
if (domIn.length) bad('el dominio del proyecto base aparece en páginas publicadas: ' + domIn.join(', '));
else ok('ninguna página HTML publicada menciona el dominio del proyecto base');
const min =fs.readFileSync(path.join(ROOT, 'js/app.min.js'));
const hash = crypto.createHash('sha1').update(min).digest('hex').slice(0, 10);
if (idx.includes(`js/app.min.js?v=${hash}`)) ok('index.html carga js/app.min.js?v=' + hash); else bad('index.html no apunta a la huella actual de js/app.min.js');
if (!process.argv.includes('--sin-paquete')) {
  // Igual que tools/build.js, pero a una carpeta temporal.
  const dev = rd('dev.html');
  const i = dev.indexOf('<!-- scripts:begin -->'), j = dev.indexOf('<!-- scripts:end -->');
  const files = [...dev.slice(i, j).matchAll(/<script[^>]*src="(js\/[^"]+\.js)"/g)].map(m => m[1]);
  const joined = files.map(f => `/* ${f} */\n` + rd(f)).join('\n;\n');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-check-'));
  const tmp = path.join(tmpDir, 'app.js'), out = path.join(tmpDir, 'app.min.js');
  fs.writeFileSync(tmp, joined);
  try {
    execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', 'terser@5.51.2', tmp, '--compress', 'passes=1', '--mangle', '--comments', 'false', '--ecma', '2020', '-o', out],
      { stdio: ['ignore', 'ignore', 'inherit'], shell: process.platform === 'win32' });
    if (fs.readFileSync(out).equals(min)) ok('js/app.min.js está al día con las fuentes (' + files.length + ' scripts)');
    else bad('js/app.min.js NO coincide con las fuentes: ejecutar node tools/build.js --privado y commitear index.html + js/app.min.js');
  } catch (e) { warn('no se pudo reconstruir el paquete para comparar (' + e.message.split('\n')[0] + ')'); }
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
const minS = min.toString('utf8');
if (['curacionEnemiga', 'anchoMaxJugador', 'grietaGarantizadaAntesDe', 'ticketsMult', 'shinyMult', 'repetidoDaEvolucion'].every(k => minS.includes(k))) ok('el paquete incluye js/core/mods.js');
else bad('el paquete no incluye js/core/mods.js (o una versión vieja)');
if (minS.includes('G.EVO={1:[2],')) ok('el paquete incluye js/data/evolutions.js'); else bad('el paquete no incluye js/data/evolutions.js');
if (!minS.includes('G.Importar') && !minS.includes('imp-box')) ok('el paquete ya no incluye el importador de partidas (se quitó el 22-10-2026)');
else bad('el paquete aún incluye el importador de partidas (js/core/importar.js o js/ui/importar-ui.js)');
if (minS.includes('G.MARCA=') && minS.includes('G.Estilo=') && minS.includes('G.HudDex=') && minS.includes('estiloPorDefecto') && minS.includes('pedirGiro')) ok('el paquete incluye la identidad visual (js/ui/marca.js, js/ui/estilo.js y el HUD Dex de js/ui/hud-dex.js) y lo de los plegables');
else bad('el paquete no incluye js/ui/marca.js, js/ui/estilo.js, js/ui/hud-dex.js o los ajustes de estilo y plegables de js/core/mods.js');
if (/<link rel="stylesheet" href="css\/tokens-dex\.css">/.test(idx) && /<link rel="stylesheet" href="css\/nico\.css">/.test(idx)) ok('index.html carga css/tokens-dex.css y css/nico.css');
else bad('index.html no carga css/tokens-dex.css o css/nico.css: reconstruir con node tools/build.js --privado');
if (minS.includes('G.Claridad=') && ['jugadorVisible', 'numerosAgrupados', 'contornoDisparos', 'barrasTrasGolpe', 'vinetaDanio', 'biomasEnCiclo', 'destelloSinCongelar'].every(k => minS.includes(k)))
  ok('el paquete incluye la claridad en partida (js/entities/claridad.js) y sus ajustes');
else bad('el paquete no incluye js/entities/claridad.js o sus ajustes de js/core/mods.js');

// ---------------- 3. ganchos ----------------
console.log('3. Ganchos "// MOD nico"');
const HOOKS = [
  ['dev.html', /src="js\/core\/util\.js"><\/script>\r?\n<script defer src="js\/core\/mods\.js">/, 'mods.js se carga justo después de util.js'],
  ['js/data/enemies.js', /HEAL\.has\(p\.dex\) && G\.MODS && G\.MODS\.curacionEnemiga\) return 'healer';\s*\/\/ MOD nico/, 'gancho A (sin curanderos) en behaviorOf'],
  ['js/entities/enemy.js', /healAround\(\) \{\r?\n\s*if \(!\(G\.MODS && G\.MODS\.curacionEnemiga\)\) return;/, 'gancho B (red de seguridad) en healAround'],
  ['js/entities/player.js', /this\.scale = G\.MODS \? G\.MODS\.escalaJugador\(mon\.dex\) : 1;/, 'escala del jugador en el constructor'],
  ['js/entities/player.js', /new G\.Sprites\.Animator\(mon\.dex, this\.scale, this\.shiny\)/, 'sprite a escala'],
  ['js/entities/player.js', /this\.r = G\.Sprites\.bodyRadius\(mon\.dex, this\.scale\)/, 'hitbox a escala'],
  ['js/entities/player.js', /this\.bodyH = G\.Sprites\.bodyHeight\(mon\.dex, this\.scale\)/, 'alto (nombre/números) a escala'],
  ['js/entities/player.js', /drawShadow\(ctx, this\.dex, this\.x, this\.y, this\.scale\)/, 'sombra a escala'],
  ['js/net/net.js', /const TURN_URL = '';/, 'TURN apagado'],
  ['js/core/db.js', /\/\\x6a\\x70\\x74\\x65\\x72\/i\.test\(/, 'db.js rechaza el proyecto base (su autor, en hexadecimal)'],
  ['js/core/db.js', /if \(!\(G\.FIREBASE_PERMITIDA && G\.FIREBASE_PERMITIDA\(cfg\)\) \|\|/, 'db.js sólo conecta con la lista blanca (si falta, con nada)'],
  ['js/core/db.js', /\(cfg\.emulator && !\/\^\(localhost\|127/, 'db.js rechaza configs de emulador fuera de este PC'],
  ['js/ui/ui.js', /const CONTACT = 'https:\/\/github\.com\/nicooliver123-cell\/pokeswarm\/issues';/, 'contacto del aviso legal: avisos del repositorio'],
  ['js/ui/settings-ui.js', /const REPO = 'https:\/\/github\.com\/nicooliver123-cell\/pokeswarm';/, 'Ajustes > Acerca de: repositorio de PokéSwarm'],
  ['js/entities/enemy.js', /if \(!G\.MODS \|\| G\.MODS\.predecirGolpe\(this\)\) this\.hp = /, 'invitado: sin predecir golpes con escudo'],
  ['js/net/coop.js', /e\.hp = G\.MODS \? G\.MODS\.vidaDelAnfitrion\(e, a\[3\]\) :/, 'invitado: ventana sin subidas tras un golpe predicho'],
  ['js/net/coop.js', /e\.behavior, Math\.ceil\(e\.hp\)\]\);/, "'ne' lleva la vida real (vuelta de la grieta)"],
  ['js/net/coop.js', /beh: ev\[9\], vida: ev\[10\] \}\);/, "el invitado lee la vida real de 'ne'"],
  ['js/ui/settings-ui.js', /Crear cuenta o entrar<\/button>`;\r?\n\s*return;/, 'Ajustes > Cuenta (invitado): la línea de upstream, intacta'],
  ['js/ui/settings-ui.js', /id="set-msg"><\/p>`;\r?\n\s*\}/, 'Ajustes > Cuenta (con cuenta): la línea de upstream, intacta'],
  ['js/systems/rift.js', /function update\(dt, pl, time\) \{\r?\n\s*if \(G\.MODS && G\.MODS\.grietaGarantizada && G\.MODS\.grietaGarantizada\(pl, time, !!\(rift \|\| arena\), authority\(\)\)\) \{ open\(\); if \(rift\) \{ checkT = CHECK; G\.MODS\.grietaAbierta\(pl, rift, time\); \} \}\s*\/\/ MOD nico/,
    'grieta garantizada: gancho al principio de update()'],
  ['js/systems/rift.js', /\};\r?\n\s*if \(G\.MODS && G\.MODS\.arenaGarantizada\) cfg\.forzada = G\.MODS\.arenaGarantizada\(G\.Game\.player, rift, G\.Game\.st\.time\);\s*\/\/ MOD nico[^\n]*\r?\n\s*if \(G\.Coop\.isHost\) G\.Coop\.broadcast\(\['arena', cfg\]\);/,
    'grieta garantizada: start() marca su arena antes de anunciarla'],
  ['js/systems/rift.js', /const e = new G\.Enemy\(def, [^\n]*\r?\n\s*if \(G\.MODS && G\.MODS\.vidaLegendario\) G\.MODS\.vidaLegendario\(e, arena\);\s*\/\/ MOD nico/,
    'grieta garantizada: spawnLegend() rebaja la vida de su legendario'],
  ['js/systems/rift.js', /G\.Weather\.clear\(\);\r?\n\s*if \(G\.Coop\.isHost\) G\.Coop\.broadcast\(\['af'\]\);\s*\/\/ MOD nico[^\n]*\r?\n\s*if \(authority\(\)\) G\.EnemyMgr\.restore\(\); else G\.EnemyMgr\.clearRemote\(\);/,
    "vuelta de la grieta: el anfitrión avisa ('af') antes de restore(), que anuncia con 'ne' los enemigos del mapa"],
  ['js/systems/rift.js', /arena\.endT -= dt;\r?\n\s*if \(!authority\(\) && arena\.endT > -3\) return;\s*\/\/ MOD nico[^\n]*\r?\n\s*if \(arena\.endT <= 0\) finish\(\);/,
    "vuelta de la grieta: el invitado no vuelve por su cuenta (espera 'af'; si no llega, 3 s más)"],
  ['js/systems/rift.js', /case 'al': lost\(\); break;\r?\n\s*case 'af': if \(arena\) finish\(\); break;\s*\/\/ MOD nico/, "vuelta de la grieta: el invitado vuelve al recibir 'af'"],
  ['js/net/coop.js', /case 'aw': case 'al': G\.Rift\.onEvent\(ev\); break;\r?\n\s*case 'af': G\.Rift\.onEvent\(ev\); break;\s*\/\/ MOD nico/, "vuelta de la grieta: coop.js pasa 'af' a rift.js"],
  ['js/game.js', /const others = holdBy\.filter\(n => n !== \(G\.Social\.me && G\.Social\.me\.name\)\);\s*\/\/ MOD nico[^\n]*\r?\n\s*if \(!mine && others\.length\) G\.Spawner\.say\('Pausa: ' \+ others\.join\(', '\) \+ ' ' \+ \(others\.length > 1 \? 'eligen' : 'elige'\) \+ ' fusión…', 999, true\);/,
    'fusión: el aviso «Pausa: … elige fusión» nunca lleva tu propio nombre (coopApi.hold)'],
  ['js/game.js', /sv\.tickets\.t1 \+= G\.MODS && G\.MODS\.tickets \? G\.MODS\.tickets\(d1\) : d1; sv\.tickets\.t10 \+= G\.MODS && G\.MODS\.tickets \? G\.MODS\.tickets\(d10\) : d10;\s*\/\/ MOD nico/,
    'tickets ×2: bankTickets() apunta en la partida guardada los nuevos multiplicados'],
  ['js/game.js', /if \(p\.kind === 'ticket'\) pl\.t1\+\+; else pl\.t10\+\+;\r?\n\s*bankTickets\(\);/, 'tickets ×2: la recogida sigue contando 1 por objeto (pl.t1++, lo que viaja por la red)'],
  ['js/game.js', /t1: G\.MODS && G\.MODS\.tickets \? G\.MODS\.tickets\(pl\.t1\) : pl\.t1, t10: G\.MODS && G\.MODS\.tickets \? G\.MODS\.tickets\(pl\.t10\) : pl\.t10,\s*\/\/ MOD nico/,
    'tickets ×2: la pantalla final enseña los que se apuntaron'],
  ['js/game.js', /G\.MODS && G\.MODS\.textoTicket \? G\.MODS\.textoTicket\(p\.kind\) : p\.kind === 'ticket' \? '\+1 ticket' : '¡Ticket ×10!'/, 'tickets ×2: el texto que flota al coger uno'],
  ['js/systems/progress.js', /function grant\(r\) \{\r?\n\s*const s = G\.DB\.save;\r?\n\s*if \(!r\) return;\r?\n\s*if \(G\.MODS && G\.MODS\.premio\) r = G\.MODS\.premio\(r\);\s*\/\/ MOD nico/,
    'tickets ×2: premios de misiones y logros (grant)'],
  ['js/systems/progress.js', /function rewardText\(r\) \{\r?\n\s*if \(G\.MODS && G\.MODS\.premio\) r = G\.MODS\.premio\(r\);\s*\/\/ MOD nico/, 'tickets ×2: el premio que se enseña (rewardText)'],
  ['js/systems/spawner.js', /return Math\.random\(\) < \(G\.MODS && G\.MODS\.probShiny \? G\.MODS\.probShiny\(SHINY_RATE\) : SHINY_RATE\);\s*\/\/ MOD nico/, 'shiny ×1,5: salvajes y jefes (rollShiny)'],
  // Apariciones en grupo con vistas distintas (js/net/vistas.js)
  ['dev.html', /src="js\/net\/coop\.js"><\/script>\r?\n<script defer src="js\/net\/vistas\.js"><\/script><!-- MOD nico/, 'apariciones en grupo: vistas.js justo después de coop.js'],
  ['js/systems/spawner.js', /const d = \(G\.Vistas \? G\.Vistas\.radio\(players, pl, angle\) : G\.Camera\.outerRadius\(\)\) \+ G\.U\.rand\(10, 70\);\s*\/\/ MOD nico/, 'apariciones en grupo: el anillo, fuera de la vista de todos en cada dirección (ringPoint)'],
  ['js/systems/spawner.js', /function seenByAnyone\(x, y\) \{\r?\n\s*if \(G\.Vistas && G\.Vistas\.activo\(players\)\) return G\.Vistas\.vistoPorAlguien\(players, x, y\);\s*\/\/ MOD nico[^\n]*\r?\n\s*const r = G\.Camera\.outerRadius\(\) - 30;/,
    'apariciones en grupo: «¿lo ve alguien?» con la vista de cada uno (seenByAnyone; la línea de upstream sigue detrás)'],
  ['js/systems/spawner.js', /const \[x, y\] = \(G\.Vistas && G\.Vistas\.activo\(players\) && freePoint\(pl, Math\.random\(\) \* 6\.2832, true\)\) \|\| ringPoint\(pl, Math\.random\(\) \* 6\.2832\);\s*\/\/ MOD nico/,
    'apariciones en grupo: el jefe, también fuera de la vista de todos (spawnBoss)'],
  ['js/entities/enemy.js', /const unseen = \(G\.Vistas && G\.Vistas\.activo\(players\) \? G\.Vistas\.fueraDeTodas\(players, e\.x, e\.y, 40\) : d2 > R \* R\) && !G\.Camera\.sees\(e\.x, e\.y, 60\);\s*\/\/ MOD nico/,
    'apariciones en grupo: un rezagado sólo vuelve si nadie lo ve (EnemyMgr.update)'],
  ['js/net/coop.js', /function tick\(dt\) \{\r?\n\s*if \(!active\) return;\r?\n\s*if \(G\.Vistas\) G\.Vistas\.tick\(dt, host\);\s*\/\/ MOD nico/, 'apariciones en grupo: el invitado manda su vista (tick)'],
  ['js/net/coop.js', /case 'vista': if \(G\.Vistas\) G\.Vistas\.deRed\(from, ev\); break;\s*\/\/ MOD nico/, "apariciones en grupo: el anfitrión apunta la vista de cada invitado ('vista')"],
  ['js/game.js', /const R = G\.Camera\.outerRadius\(\);\r?\n[^\n]*\r?\n\s*for \(const e of G\.EnemyMgr\.all\(\)\) \{\r?\n\s*if \(G\.Vistas && G\.Vistas\.bombaEnSuVista\(who, mine\) \? !G\.Vistas\.enSuVista\(who, e\.x, e\.y\) : mine \? !G\.Camera\.sees\(e\.x, e\.y, 0\) : G\.U\.dist2\(e\.x, e\.y, who\.x, who\.y\) > R \* R\) continue;\s*\/\/ MOD nico/,
    'la bomba de un compañero, en SU vista (onCollect; detrás, la condición de upstream tal cual)'],
  ['js/systems/rift.js', /shiny: G\.Sprites\.hasShiny\(mon\.dex\) && Math\.random\(\) < \(G\.MODS && G\.MODS\.probShiny \? G\.MODS\.probShiny\(1 \/ 512\) : 1 \/ 512\),\s*\/\/ MOD nico/, 'shiny ×1,5: legendario de la grieta'],
  ['js/systems/gacha.js', /Math\.random\(\) < \(G\.MODS && G\.MODS\.probShiny \? G\.MODS\.probShiny\(SHINY_RATE, i < regalo\) : SHINY_RATE\)\);\s*\/\/ MOD nico/, 'shiny ×1,5: gacha (y ×3 con el regalo)'],
  ['js/systems/gacha.js', /save\.tickets\.t10 -= cost\.t10;\r?\n\s*const regalo = G\.MODS && G\.MODS\.gastarRegalo \? G\.MODS\.gastarRegalo\(save, n, cost\) : 0;\s*\/\/ MOD nico/, 'regalo «buen humor»: pull() gasta los tickets del regalo tras cobrar'],
  ['js/entities/player.js', /const tg = \(ranged \? boss \|\| threat : threat \|\| boss\)\r?\n\s*\|\| \(G\.MODS && G\.MODS\.cofreCercano \? G\.MODS\.cofreCercano\(this\) : null\)\s*\/\/ MOD nico[^\n]*\r?\n\s*\|\| G\.Projectiles\.nearest\(all, this\.x, this\.y, 520\)/, 'cofres pequeños: blanco tras lo que te toca y el jefe, antes del enemigo más cercano'],
  ['js/game.js', /G\.Audio\.music\('village'\);\r?\n\s*if \(G\.MODS && G\.MODS\.darRegalo && G\.MODS\.darRegalo\(G\.DB\.save\)\) \{ G\.DB\.commit\(true\); G\.UI\.toast\(G\.T\(G\.MODS\.regaloBuenHumor\.texto\), 12000\); G\.UI\.refreshCoins\(\); \}\s*\/\/ MOD nico/, 'regalo «buen humor»: afterLogin() lo da una vez y avisa'],
  ['js/ui/gacha-ui.js', /<span>1%<\/span><\/div>[\s\S]*?<\/p>`;\r?\n\s*if \(G\.MODS && G\.MODS\.notasGacha\) \$\('gacha-rates'\)\.innerHTML = G\.MODS\.notasGacha\(\$\('gacha-rates'\)\.innerHTML\);\s*\/\/ MOD nico/,
    'shiny ×1,5: el cartel del gacha (el «1%» de upstream sigue ahí y el gancho lo cambia después de pintarlo)'],
  ['dev.html', /src="js\/data\/sprites-meta\.js"><\/script>\r?\n<script defer src="js\/data\/evolutions\.js"><\/script><!-- MOD nico/, 'repetidos: evolutions.js se carga justo después de sprites-meta.js'],
  ['js/systems/gacha.js', /else refund = REFUND\[rarity\];\r?\n\s*\}\r?\n(?:\s*if \(!isNew && G\.MULTIVERSO[^\n]*\/\/ MOD nico[^\n]*\n)?\s*const evo = !isNew && G\.MODS && G\.MODS\.evolucionDeRepetido \? G\.MODS\.evolucionDeRepetido\(save, mon\.dex, shiny\) : 0; if \(evo\) refund = 0;\s*\/\/ MOD nico[^\n]*\n\s*save\.coins \+= refund;\r?\n\s*out\.push\(\{ dex: mon\.dex, rarity, shiny, isNew, refund \}\);\r?\n\s*if \(evo\) out\[out\.length - 1\]\.evo = evo;\s*\/\/ MOD nico/,
    'repetidos: pull() pregunta por la evolución antes de dar las monedas y la apunta en el resultado'],
  ['js/ui/gacha-ui.js', /<div class="tag">\$\{tag\}<\/div>`\);\r?\n\s*if \(r\.evo && G\.MODS && G\.MODS\.marcarEvolucion\) G\.MODS\.marcarEvolucion\(c, r\);\s*\/\/ MOD nico/, 'repetidos: la carta enseña la evolución desbloqueada'],
  ['js/ui/gacha-ui.js', /· Los repetidos dan Pokémonedas \(los shiny repetidos, el triple\)\.<br>/, 'repetidos: la nota de upstream que cambia notasGacha() sigue ahí'],
  // Claridad en partida (js/entities/claridad.js)
  ['dev.html', /src="js\/entities\/player\.js"><\/script>\r?\n<script defer src="js\/entities\/claridad\.js"><\/script><!-- MOD nico/, 'claridad: claridad.js se carga justo después de player.js'],
  ['js/game.js', /items\.sort\(\(a, b\) => a\.y - b\.y\);\r?\n\s*if \(G\.Claridad\) G\.Claridad\.escenaOrdenada\(items\);\s*\/\/ MOD nico/, 'claridad: drawScene pasa la escena ordenada (qué tapa a cada jugador)'],
  ['js/game.js', /drawScene\(G\.Camera, [^\n]*\r?\n\s*if \(G\.Claridad\) G\.Claridad\.encima\(ctx\);\s*\/\/ MOD nico[^\n]*\r?\n(\s*if \(G\.Luz\) G\.Luz\.pintar\(ctx, G\.Camera\);\s*\/\/ MOD nico[^\n]*\r?\n)?\s*G\.Projectiles\.draw\(ctx\);/, 'claridad: tu Pokémon tapado, encima de la escena y debajo de disparos y efectos (entre los dos, como mucho el búfer de luz)'],
  ['js/game.js', /G\.FX\.draw\(ctx\);\r?\n\s*if \(G\.Claridad\) G\.Claridad\.chevron\(ctx\);\s*\/\/ MOD nico/, 'claridad: el chevrón, después de los números'],
  ['js/game.js', /if \(G\.Claridad\) G\.Claridad\.vineta\(ctx, w, h, pl\);\s*\/\/ MOD nico[^\n]*\r?\n\s*G\.HUD\.draw\(ctx, w, h, pl, st\);/, 'claridad: el borde rojo, antes del HUD'],
  ['js/entities/fx.js', /function dmgText\(x, y, value, color = '#ffffff', big = false\) \{\r?\n\s*if \(arguments\[5\] && G\.Claridad && G\.Claridad\.sumar\(arguments\[5\], value, color, big, arguments\[6\]\)\) return;\s*\/\/ MOD nico/, 'claridad: dmgText suma los golpes de cada enemigo'],
  ['js/entities/fx.js', /if \(G\.Claridad\) G\.Claridad\.actualizar\(dt\);\s*\/\/ MOD nico/, 'claridad: FX.update mueve los números agrupados'],
  ['js/entities/fx.js', /if \(G\.Claridad\) G\.Claridad\.dibujarNumeros\(ctx\);\s*\/\/ MOD nico/, 'claridad: FX.draw pinta los números agrupados'],
  ['js/entities/enemy.js', /this\.boss \|\| eff === 'super', this\);\s*\/\/ MOD nico/, 'claridad: showHurt pasa el enemigo (también los golpes que anuncia el anfitrión)'],
  ['js/entities/enemy.js', /G\.FX\.dmgText\(this\.x, this\.y - this\.bodyH - 4, d, '#9fd8ff', false, this, true\);/, 'claridad: el escudo pasa el enemigo y que es su escudo'],
  ['js/entities/enemy.js', /if \(\(this\.boss \|\| this\.hp < this\.maxHp\) && \(!G\.Claridad \|\| G\.Claridad\.barra\(this\)\)\) \{\s*\/\/ MOD nico/, 'claridad: barra de vida sólo tras un golpe reciente'],
  ['js/entities/player.js', /drawShadow\(ctx, this\.dex, this\.x, this\.y, this\.scale\);[^\n]*\r?\n\s*if \(G\.Claridad\) G\.Claridad\.aro\(ctx, this\);\s*\/\/ MOD nico/, 'claridad: el aro a los pies, debajo del sprite'],
  ['js/entities/player.js', /G\.Camera\.kick\(0\.28\);\r?\n\s*if \(G\.Claridad\) G\.Claridad\.golpe\(this, d\);\s*\/\/ MOD nico/, 'claridad: el golpe recibido, para el borde rojo'],
  ['js/entities/projectile.js', /if \(!p\.friendly && G\.Claridad && G\.Claridad\.disparoHostil\(ctx, shape, v\.pal, p\.x, p\.y - L, angle, a, p\.r >= 8 \? 1\.5 : 1, Math\.floor\(p\.t \* 12\)\)\) continue;\s*\/\/ MOD nico/,
    'claridad: los disparos enemigos, con su contorno rojo'],
  ['js/entities/claridad.js', /if \(it\.prop\) q = rectProp\(it\.prop\);\r?\n\s*else if \(it\.ent && it\.ent\.caja\) q = it\.ent\.caja;/, 'claridad: una pared con altura tapa con su rectángulo (js/world/relieve.js)'],
  // Relieve y búfer de luz (PROTOTIPO, js/world/relieve.js y luz.js)
  ['dev.html', /src="js\/world\/horno\.js"><\/script>[^\n]*\r?\n<script defer src="js\/world\/relieve\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/luz\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/sombras\.js"><\/script><!-- MOD nico/, 'relieve, luz y sombras: relieve.js, luz.js y sombras.js se cargan tras horno.js'],
  ['js/systems/combat.js', /get campos\(\) \{ return fields; \} \};\s*\/\/ MOD nico/, 'luz: combat.js da los campos de tus ataques (getter aditivo)'],
  ['js/world/entorno.js', /if \(G\.Sombras\) G\.Sombras\.paredes\(P, cx, cy, n, at, g\.sombra\);/, 'sombras: gradar() hornea la sombra de las paredes'],
  ['js/world/entorno.js', /if \(G\.Sombras\) G\.Sombras\.objetos\(ctx, cam\);/, 'sombras: la capa del suelo pinta la sombra de los objetos'],
  ['js/game.js', /if \(G\.Relieve\) G\.Relieve\.escena\(items, cam\);\s*\/\/ MOD nico[^\n]*\r?\n\s*items\.sort\(\(a, b\) => a\.y - b\.y\);/, 'relieve: las paredes con altura entran en la escena antes de ordenarla'],
  ['js/game.js', /G\.Claridad\.encima\(ctx\);[^\n]*\r?\n\s*if \(G\.Luz\) G\.Luz\.pintar\(ctx, G\.Camera\);\s*\/\/ MOD nico[^\n]*\r?\n\s*G\.Projectiles\.draw\(ctx\);/, 'luz: el búfer de luz, después de la escena y antes de los disparos (nunca oscurece un disparo enemigo)'],
  ['js/world/world.js', /fundido\(\) \{ return fade \? \{ from: fade\.from, k: fadeK\(\) \} : null; \},\s*\/\/ MOD nico/, 'relieve: world.js da el fundido de bioma'],
  // Arreglos de upstream
  ['js/game.js', /G\.World\.setBiome\(G\.MODS && G\.MODS\.biomaNormal \? G\.MODS\.biomaNormal\(b\) : b\);\s*\/\/ MOD nico/, 'biomas: desde el minuto 12, el mapa sigue en sus biomas normales'],
  ['js/game.js', /if \(state !== 'playing' && flashT > 0 && G\.MODS && G\.MODS\.destelloSinCongelar\) flashT -= dt;\s*\/\/ MOD nico/, 'fogonazo de la grieta: se apaga también al elegir fusión'],
  ['js/systems/progress.js', /function showNext\(\) \{\r?\n\s*const n = toastQ\[0\];\r?\n\s*if \(!n\) return;\r?\n\s*if \(G\.MODS && G\.MODS\.avisoEnEspera && G\.MODS\.avisoEnEspera\(showNext\)\) return;\s*\/\/ MOD nico/,
    'gacha: los avisos de logro de una tirada esperan a «Continuar» (showNext)'],
  ['css/style.css', /\.mod-avisos-tras-gacha body:has\(#pull-fx:not\(\.hidden\)\) \.ach-pop \{ visibility: hidden; \}/, 'gacha: un aviso que ya estaba en pantalla al tirar no se ve encima del resultado'],
  // Pantallas: móviles en vertical y plegables
  ['js/game.js', /const portrait = G\.Touch\.active && innerHeight > innerWidth && \(!G\.MODS \|\| !G\.MODS\.pedirGiro \|\| G\.MODS\.pedirGiro\(innerWidth, innerHeight\)\);\s*\/\/ MOD nico/,
    'plegables: «Gira el móvil» sólo en un móvil en vertical (checkOrientation)'],
  ['js/ui/settings-ui.js', /if \(!G\.MODS \|\| !G\.MODS\.fijarHorizontal \|\| G\.MODS\.fijarHorizontal\(\)\) screen\.orientation\.lock\('landscape'\)/, 'plegables: la pantalla completa sólo fija la horizontal en un móvil'],
  // Identidad visual «Dex de Expedición» (js/ui/estilo.js, js/ui/marca.js, css/tokens-dex.css, css/nico.css)
  ['dev.html', /<link rel="stylesheet" href="css\/style\.css">\r?\n<link rel="stylesheet" href="css\/tokens-dex\.css"><!-- MOD nico[^\n]*\r?\n<link rel="stylesheet" href="css\/nico\.css"><!-- MOD nico/,
    'estilo: tokens-dex.css y nico.css, justo después de style.css'],
  ['dev.html', /src="js\/core\/mods\.js"><\/script>[^\n]*\r?\n<script defer src="js\/ui\/marca\.js"><\/script><!-- MOD nico/, 'estilo: marca.js justo después de mods.js'],
  ['dev.html', /src="js\/core\/settings\.js"><\/script>\r?\n<script defer src="js\/ui\/estilo\.js"><\/script><!-- MOD nico/, 'estilo: estilo.js justo después de settings.js (antes de cualquier lienzo)'],
  ['dev.html', /originales del proyecto\. <span>Letra del estilo Dex: M PLUS Rounded 1c \(OFL\)\.<\/span><!-- MOD nico --><\/p>/, 'estilo: el aviso legal cita la letra (OFL), sin tocar el texto de upstream'],
  ['js/ui/settings-ui.js', /<\/div>`;\r?\n    \}\r?\n    if \(G\.Estilo\) G\.Estilo\.ajustes\(box, tab\);\s*\/\/ MOD nico[^\n]*\r?\n(    if \(G\.\w+\) G\.\w+\.ajustes\(box, tab\);\s*\/\/ MOD nico[^\n]*\r?\n)*    wire\(box\);/, 'estilo: Ajustes pinta lo nuestro antes de wire(box) (render)'],
  ['js/ui/run-ui.js', /<div class="key">\$\{i \+ 1\}<\/div>`;\r?\n      if \(G\.Estilo\) G\.Estilo\.carta\(el, c\);\s*\/\/ MOD nico/, 'estilo: cada carta de nivel (franja, icono y foco)'],
  ['js/ui/menu.js', /G\.UI\.sprite\(\$\('menu-partner'\), mon\.dex, \{ lively: true, scale: 4, hero: true, shiny \}\);\r?\n    if \(G\.Estilo\) G\.Estilo\.companero\(\$\('menu-partner'\), mon\.dex, \{ shiny \}\);\s*\/\/ MOD nico/, 'estilo: el compañero del menú, a su tamaño'],
  ['js/ui/gacha-ui.js', /c\.appendChild\(G\.UI\.spriteCanvas\(r\.dex, 132, 120, [^\n]*\r?\n      if \(G\.Estilo\) G\.Estilo\.premio\(c, r, n\);\s*\/\/ MOD nico/, 'estilo: el premio del gacha, a su tamaño'],
  ['js/ui/gacha-ui.js', /feat\.appendChild\(G\.UI\.spriteCanvas\(dex, 170, 190, \{ lively: true, scale: 2, dir: 1 \}\)\);\r?\n      if \(G\.Estilo\) G\.Estilo\.destacado\(feat\.lastChild, dex\);\s*\/\/ MOD nico/, 'estilo: los destacados del gacha, sin cortar'],
  ['js/core/input.js', /'tab'\]\.includes\(c\) && !\(c === 'tab' && G\.Estilo && G\.Estilo\.tabLibre\(\)\)\) e\.preventDefault\(\);\s*\/\/ MOD nico/, 'estilo: Tab recorre los menús (input.js sólo lo anula jugando)'],
  // HUD Dex (js/ui/hud-dex.js)
  ['dev.html', /src="js\/ui\/hud\.js"><\/script>\r?\n<script defer src="js\/ui\/hud-dex\.js"><\/script><!-- MOD nico/, 'HUD Dex: hud-dex.js justo después de hud.js'],
  ['js/ui/hud.js', /function draw\(ctx, w, h, pl, st\) \{\r?\n    if \(G\.Estilo && G\.Estilo\.hud\(ctx, w, h, pl, st\)\) return;\s*\/\/ MOD nico[^\n]*\r?\n    ctx\.save\(\);/, 'HUD Dex: primera línea de G.HUD.draw (con Clásico, o si falla, sigue el de upstream)'],
  ['js/systems/events.js', /get current\(\) \{ return cur \? cur\.id : null; \},\r?\n    get estado\(\) \{ return cur \|\| lost \? \{[^\n]*\} : null; \},\s*\/\/ MOD nico/, 'HUD Dex: getter aditivo del evento en curso (events.js)'],
  // Entornos del Gremio y horneado escalonado (js/world/entorno.js y horno.js)
  ['dev.html', /src="js\/world\/world\.js"><\/script>\r?\n<script defer src="js\/world\/entorno\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/horno\.js"><\/script><!-- MOD nico/, 'entornos: entorno.js y horno.js justo después de world.js'],
  ['js/world/tiles.js', /\}\r?\n    \}\r?\n    if \(G\.Entorno\) G\.Entorno\.gradar\(P, cx, cy, n, at, bi\);\s*\/\/ MOD nico[^\n]*\r?\n    return P\.canvas\(\);\r?\n  \}\r?\n\r?\n  function paintFloor/, 'entornos: la gradación del suelo en paintChunk, antes de devolver el lienzo'],
  ['js/world/world.js', /let img = cache\.get\(k\);\r?\n    if \(img\) return img;\r?\n    if \(G\.Horno\) \{ const o = G\.Horno\.aplazar\(k, fade, cache === images\); if \(o\) return o; \}\s*\/\/ MOD nico/, 'horno: chunkImage aplaza con la imagen vieja (sin guardarla)'],
  ['js/world/world.js', /biome = b;\r?\n    images = new Map\(\);\r?\n    if \(G\.Horno\) G\.Horno\.alCambiar\(b, images\);\s*\/\/ MOD nico/, 'horno: setBiome pasa lo precalentado al mapa nuevo'],
  ['js/world/world.js', /function drawVignette\(ctx, w, h\) \{\r?\n    if \(G\.Entorno && G\.Entorno\.vineta\(ctx, w, h\)\) return;\s*\/\/ MOD nico/, 'entornos: primera línea de drawVignette (con Dex, la viñeta cálida)'],
  ['js/world/world.js', /damageProp, breakAt, specialsNear, update,\r?\n    chunkImage, get semilla\(\) \{ return seed; \}, rehornear\(\) \{ const v = images; images = new Map\(\); fade = null; return v; \},\s*\/\/ MOD nico/, 'horno: world.js expone chunkImage, la semilla y rehornear()'],
  ['js/game.js', /G\.World\.drawLiquid\(ctx, cam, t\);\r?\n    if \(G\.Entorno\) G\.Entorno\.suelo\(ctx, cam, t\);\s*\/\/ MOD nico[^\n]*\r?\n    G\.Hazards\.draw\(ctx\);/, 'entornos: la capa del suelo (y el horno) en drawScene, tras drawLiquid'],
  ['js/systems/weather.js', /function draw\(ctx, w, h, dt\) \{\r?\n    if \(G\.Entorno && G\.Entorno\.clima\(ctx, w, h, dt, cur && cur\.kind, level\(\)\)\) return;\s*\/\/ MOD nico/, 'entornos: primera línea de G.Weather.draw (con Dex, el clima de dos tonos)'],
  // Mapas propios (js/world/mapas-datos.js, mapas.js, mapas-pintar.js y mapas-sprites.js; G.MODS.mapasPropios)
  ['dev.html', /src="js\/world\/tiles\.js"><\/script>\r?\n<script defer src="js\/world\/mapas-datos\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/mapas\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/mapas-pintar\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/mapas-sprites\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/world\/world\.js">/,
    'mapas propios: mapas-datos.js, mapas.js, mapas-pintar.js y mapas-sprites.js, en ese orden, entre tiles.js y world.js (antes que entorno.js, que copia las paletas al cargar)'],
  ['js/world/world.js', /function terrainRaw\(tx, ty\) \{\r?\n    if \(G\.Mapas && G\.Mapas\.activo\) return G\.Mapas\.terreno\(tx, ty, seed, arena\);\s*\/\/ MOD nico/, 'mapas propios: primera línea de terrainRaw (el terreno de G.Mapas)'],
  ['js/world/world.js', /function placeProps\(c\) \{\r?\n    if \(G\.Mapas && G\.Mapas\.activo\) return G\.Mapas\.props\(c, N, seed, arena, broken, makeProp\);\s*\/\/ MOD nico/, 'mapas propios: primera línea de placeProps (los objetos de G.Mapas)'],
  ['js/world/world.js', /a\.th = G\.Tiles\.ARENA_THEMES\[a\.type\] \|\| G\.Tiles\.ARENA_THEMES\.normal;\r?\n      if \(G\.Mapas && G\.Mapas\.activo\) return G\.Mapas\.olvidarArena\(a, data, images, N\);\s*\/\/ MOD nico[^\n]*\r?\n      \/\/ Olvida los chunks de esa zona/,
    'mapas propios: setArena olvida los chunks que cambia la arena (G.Mapas.olvidarArena), justo antes de lo que olvida upstream'],
  ['js/systems/weather.js', /function pick\(biome\) \{\r?\n    if \(G\.Mapas && G\.Mapas\.activo\) return G\.Mapas\.climaAlAzar\(biome\);\s*\/\/ MOD nico/, 'mapas propios: primera línea de pick (el clima al azar de los biomas propios)'],
  ['js/game.js', /function init\(\) \{\r?\n      G\.World\.reset\(4242\);\r?\n      if \(G\.Mapas && G\.Mapas\.activo\) G\.World\.reset\(G\.Mapas\.SEMILLA_MENU\);\s*\/\/ MOD nico[^\n]*\r?\n      G\.World\.setBiome\(0, true\);/,
    'mapas propios: el fondo de los menús con G.Mapas.SEMILLA_MENU (init, justo tras el reset(4242) de upstream)'],
  ['js/game.js', /function restore\(\) \{\r?\n      G\.World\.reset\(4242\);\r?\n      if \(G\.Mapas && G\.Mapas\.activo\) G\.World\.reset\(G\.Mapas\.SEMILLA_MENU\);\s*\/\/ MOD nico[^\n]*\r?\n      G\.World\.setBiome\(bi, true\);/,
    'mapas propios: el fondo de los menús con G.Mapas.SEMILLA_MENU (restore, justo tras el reset(4242) de upstream)'],
  // Lote 4: ajustes de juego (js/ui/encuadre.js, transicion.js y golpe-final.js)
  ['dev.html', /src="js\/ui\/hud-dex\.js"><\/script>[^\n]*\r?\n<script defer src="js\/ui\/encuadre\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/ui\/transicion\.js"><\/script><!-- MOD nico[^\n]*\r?\n<script defer src="js\/ui\/golpe-final\.js"><\/script><!-- MOD nico/,
    'lote 4: encuadre.js, transicion.js y golpe-final.js, tras hud-dex.js'],
  ['js/game.js', /dpr = Math\.min\(1\.5, window\.devicePixelRatio \|\| 1\);\r?\n    if \(G\.Encuadre\) dpr = G\.Encuadre\.resolucion\(cv, dpr\);\s*\/\/ MOD nico[^\n]*\r?\n    w = cv\.clientWidth; h = cv\.clientHeight;/,
    'píxel nítido: game.js resize() pide la resolución (y coloca el lienzo) antes de medirlo'],
  ['js/core/camera.js', /this\.scale = Math\.min\(cssW \/ this\.VIEW_W, cssH \/ this\.MIN_VIEW_H\);\r?\n    if \(G\.Encuadre\) this\.scale = G\.Encuadre\.escala\(this\.scale, cssW, cssH, dpr\);\s*\/\/ MOD nico/, 'píxel nítido: camera.js resize() redondea la escala'],
  ['js/core/camera.js', /follow\(tx, ty, dt\) \{\r?\n    if \(G\.Encuadre\) \{ const o = G\.Encuadre\.desplazamiento\(dt\); tx \+= o\[0\]; ty \+= o\[1\]; \}\s*\/\/ MOD nico/, 'encuadre: camera.js follow() corre el objetivo'],
  ['js/core/camera.js', /\} else \{ this\._sx = this\._sy = 0; \}\r?\n    if \(G\.GolpeFinal\) G\.GolpeFinal\.sacudida\(this, dt\);\s*\/\/ MOD nico/, 'golpe final: la sacudida amortiguada, tras el temblor de upstream (follow)'],
  ['js/game.js', /function update\(dt\) \{\r?\n    if \(G\.GolpeFinal && G\.GolpeFinal\.congelar\(\)\) return;\s*\/\/ MOD nico/, 'golpe final: primera línea de update() (el juego, quieto)'],
  ['js/entities/enemy.js', /\r?\n        return;\r?\n      \}\r?\n      if \(G\.GolpeFinal\) G\.GolpeFinal\.derrotado\(this\);\s*\/\/ MOD nico[^\n]*\r?\n      if \(this\.boss\) \{/, 'golpe final: die(), tras descartar las copias de la red'],
  ['js/game.js', /ctx\.fillRect\(0, 0, w, h\);\r?\n      ctx\.restore\(\);\r?\n    \}\r?\n    if \(G\.Transicion\) G\.Transicion\.dibujar\(ctx, w, h, pl\);\s*\/\/ MOD nico/, 'iris: después del fogonazo, encima de todo (render)'],
  ['js/ui/settings-ui.js', /if \(G\.Encuadre\) G\.Encuadre\.ajustes\(box, tab\);\s*\/\/ MOD nico/, 'píxel nítido: la fila de Ajustes > Gráficos > Pantalla'],
  // Lote 5: pantalla dividida estilo Nintendo DS (js/ui/pantalla-dividida.js)
  ['dev.html', /src="js\/ui\/golpe-final\.js"><\/script>[^\n]*\r?\n<script defer src="js\/ui\/pantalla-dividida\.js"><\/script><!-- MOD nico/, 'pantalla dividida: pantalla-dividida.js tras golpe-final.js'],
  ['js/game.js', /if \(G\.Transicion\) G\.Transicion\.dibujar\(ctx, w, h, pl\);\s*\/\/ MOD nico[^\n]*\r?\n    if \(G\.Dividida\) G\.Dividida\.pintar\(pl, st\);\s*\/\/ MOD nico/, 'pantalla dividida: el panel, en la última línea de render()'],
  ['js/core/touch.js', /function vector\(\) \{\r?\n    const dv = G\.Dividida && G\.Dividida\.vector\(\); if \(dv\) return dv;\s*\/\/ MOD nico/, 'pantalla dividida: el joystick del panel manda en G.Touch.vector() (touch.js)'],
  ['js/ui/settings-ui.js', /if \(G\.Dividida\) G\.Dividida\.ajustes\(box, tab\);\s*\/\/ MOD nico/, 'pantalla dividida: la sección de Ajustes > Controles'],
  // Sin el test de personalidad (js/ui/elegir-companero.js)
  ['dev.html', /src="js\/ui\/test\.js"><\/script>\r?\n<script defer src="js\/ui\/elegir-companero\.js"><\/script><!-- MOD nico/, 'sin test: elegir-companero.js justo después de test.js'],
  ['js/game.js', /afterLogin\(\) \{\r?\n    G\.Audio\.music\('village'\);\r?\n(?:    if \(G\.MODS && G\.MODS\.darRegalo[^\n]*\/\/ MOD nico[^\n]*\r?\n)?    if \(!G\.DB\.save\.partner && G\.ElegirCompanero && G\.ElegirCompanero\.activo\(\)\) return G\.ElegirCompanero\.abrir\(\);\s*\/\/ MOD nico[^\n]*\r?\n    if \(!G\.DB\.save\.partner\) G\.TestUI\.start\(\);\r?\n    else this\.goMenu\(\);/,
    'sin test: afterLogin() abre «Elige a tu compañero» antes de la línea de upstream que abre el test (intacta)'],
  ['js/ui/estilo.js', /const hudDex = \(\) => actual === 'dex' \|\| !!\(G\.Dividida && G\.Dividida\.activa && G\.Dividida\.activa\(\)\);\r?\n  function hud\(ctx, w, h, pl, st\) \{\r?\n    if \(!hudDex\(\) \|\| !G\.HudDex \|\| !pl\) return false;/, 'pantalla dividida: el HUD Dex también con Clásico mientras va (estilo.js)']
];
for (const [f, re, what] of HOOKS) (re.test(rd(f)) ? ok : bad)(`${what} (${f})`);

// ---------------- 4. simulación de curación ----------------
console.log('4. Curación de enemigos (simulación con el código real)');
function loadGame(curacion) {
  const ctx = { console, window: {} };
  vm.createContext(ctx);
  ctx.window = ctx; ctx.G = {};
  for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/core/sprites.js', 'js/data/starters.js', 'js/data/enemies.js'])
    vm.runInContext(rd(f), ctx, { filename: f });
  ctx.G.MODS.curacionEnemiga = curacion;
  ctx.G.Events = ctx.G.Events || { bag: () => null };
  return ctx.G;
}
function healersIn(G, runs) {
  let defs = 0, boss = 0, horde = 0, badSupport = 0;
  for (let k = 0; k < runs; k++) {
    const r = G.Enemies.rollRun() || {};
    const cast = r.cast || G.Enemies.cast, bosses = r.bosses || G.Enemies.BOSSES;
    cast.forEach(tier => {
      if (!['healer', 'shielder', 'summoner'].includes(tier.list[0].behavior)) badSupport++;
      defs += tier.list.filter(d => d.behavior === 'healer').length;
    });
    boss += bosses.filter(b => b.behavior === 'healer').length;
  }
  for (const t of [0, 100, 200, 300, 450, 600]) for (const ty of G.Enemies.hordeTypes(t)) for (let r = 0; r < 10; r++)
    horde += G.Enemies.hordeDefs(ty, t).filter(d => d.behavior === 'healer').length;
  return { defs, boss, horde, badSupport };
}
try {
  const on = healersIn(loadGame(false), 2000);
  if (on.defs + on.boss + on.horde === 0) ok(`2.000 runs con el mod: 0 curanderos (elencos ${on.defs}, jefes ${on.boss}, hordas ${on.horde})`);
  else bad(`con el mod aparecen curanderos: elencos ${on.defs}, jefes ${on.boss}, hordas ${on.horde}`);
  if (on.badSupport === 0) ok('el hueco de apoyo de cada tramo sigue saliendo (escudo o invocador)'); else bad(`${on.badSupport} tramos sin apoyo`);
  const off = healersIn(loadGame(true), 300);
  if (off.defs > 0) ok(`control: con curacionEnemiga=true sí salen curanderos (${off.defs} en 300 runs)`);
  else bad('control: con curacionEnemiga=true no sale ningún curandero (la prueba no detectaría el fallo)');
} catch (e) { bad('no se pudo simular: ' + (e && e.stack || e)); }

// ---------------- 5. tamaño ----------------
console.log('5. Tamaño de los Pokémon del jugador');
try {
  const G = loadGame(false);
  const S = G.Sprites, max = G.MODS.anchoMaxJugador;
  const dexes = Object.keys(G.SPRITE_META).map(Number);
  let reduced = 0, maxR = 0, minS = 1, wrong = 0, bigName = '';
  for (const d of dexes) {
    const m = S.animMeta(d, 'Idle'), s = G.MODS.escalaJugador(d), w = m ? m.w : 32;
    if (w <= max && s !== 1) wrong++;
    if (w > max && !(s < 1)) wrong++;
    if (s < 1) reduced++;
    const r = S.bodyRadius(d, s);
    if (r > maxR) { maxR = r; }
    if (s < minS) { minS = s; bigName = (G.DEX_BY[d] || {}).name || d; }
  }
  if (!wrong) ok(`ancho máximo ${max}: ${reduced} de ${dexes.length} reducidos; hitbox máxima ${maxR.toFixed(1)}; escala mínima ${minS.toFixed(3)} (${bigName})`);
  else bad(`${wrong} Pokémon con una escala incoherente con el límite`);
  const st = (G.STARTERS || []).map(x => typeof x === 'object' ? x.dex : x).filter(Boolean);
  const touched = st.filter(d => G.MODS.escalaJugador(d) !== 1);
  if (st.length && !touched.length) ok(`los ${st.length} iniciales y Pikachu (escala ${G.MODS.escalaJugador(25)}) quedan intactos`);
  else if (touched.length) bad('se reducen iniciales: ' + touched.join(', '));
} catch (e) { bad('no se pudo calcular el tamaño: ' + (e && e.stack || e)); }

// ---------------- 6. invitado del cooperativo: lógica de la ventana de vida ----------------
console.log('6. Invitado del cooperativo: sin rebote de vida (lógica de js/core/mods.js)');
try {
  let now = 1000, rele = false;
  const ctx = { performance: { now: () => now } };
  vm.createContext(ctx);
  ctx.G = { Net: { hostUid: 'H', slow: () => rele } };
  vm.runInContext(rd('js/core/mods.js'), ctx, { filename: 'js/core/mods.js' });
  const M = ctx.G.MODS, W = M.ventanaVidaMs, WR = M.ventanaVidaReleMs;
  const e = { maxHp: 100, hp: 100, net: { st: 0 } };
  const r = [];
  // Golpe predicho de 10; el anfitrión aún manda 100 (todavía no le ha llegado): no sube.
  r.push(['predice el golpe sin escudo', M.predecirGolpe(e) === true]); e.hp = 90;
  now += 100; r.push(['dentro de la ventana no acepta una vida mayor', M.vidaDelAnfitrion(e, 100) === 90]);
  r.push(['dentro de la ventana sí acepta una menor', M.vidaDelAnfitrion(e, 85) === 85]);
  now += W; r.push(['pasada la ventana acepta la del anfitrión', M.vidaDelAnfitrion(e, 100) === 100]);
  rele = true; e.hp = 90; M.predecirGolpe(e); now += W + 1;
  r.push([`por el relé la ventana es mayor (${WR} ms)`, WR > W && M.vidaDelAnfitrion(e, 100) === 90]);
  now += WR; r.push(['por el relé, pasada su ventana, acepta', M.vidaDelAnfitrion(e, 100) === 100]);
  const s = { maxHp: 100, hp: 100, net: { st: 4 } };
  r.push(['con escudo (bit 4) no predice', M.predecirGolpe(s) === false && s.golpePredichoT === undefined]);
  r.push(['sin golpe predicho acepta la del anfitrión', M.vidaDelAnfitrion({ maxHp: 100, hp: 50 }, 60) === 60]);
  r.push(['nunca por encima de la vida máxima', M.vidaDelAnfitrion({ maxHp: 100, hp: 50 }, 130) === 100]);
  M.curacionEnemiga = true;
  const o = { maxHp: 100, hp: 90, golpePredichoT: now, net: { st: 4 } };
  r.push(['con curacionEnemiga=true, como el proyecto base', M.predecirGolpe(o) === true && M.vidaDelAnfitrion(o, 100) === 100]);
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`ventana ${W} ms directo / ${WR} ms por el relé: ${r.length} casos bien`);
  else failed.forEach(x => bad('ventana de vida: ' + x[0]));
} catch (e) { bad('no se pudo probar la ventana de vida: ' + (e && e.stack || e)); }

// ---------------- 7. asignaciones de vida en todo js/ ----------------
console.log('7. Asignaciones de vida en js/ (detección de curaciones nuevas de upstream)');
// Cada línea que asigna vida (=, +=, -=, *=, ++...), revisada a mano, con las veces que puede salir.
// Si upstream añade una nueva o repite una conocida en otro sitio, es FALLO hasta revisarla:
// si no puede subir la vida de un enemigo, se añade aquí con su motivo.
const KNOWN = [
  // enemigos
  ['js/entities/enemy.js|this.hp = this.maxHp;', 1, 'constructor (enemigo nuevo)'],
  ['js/entities/enemy.js|this.maxHp *= 2; this.hp = this.maxHp;', 1, 'makeShiny (sólo enemigos nuevos)'],
  ['js/entities/enemy.js|if (!G.MODS || G.MODS.predecirGolpe(this)) this.hp = Math.max(1, this.hp - d);', 1, 'golpe predicho en el invitado (baja)'],
  ['js/entities/enemy.js|this.hp -= Math.max(1, Math.round(amount));', 1, 'golpe en el anfitrión o en solitario (baja)'],
  ['js/entities/enemy.js|if (this.pt <= 0) { this.hp = 0; this.die(); }', 1, 'mecha del bomber: muere'],
  ['js/entities/enemy.js|e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.07);', 1, 'healAround: CURA, bloqueada por el gancho B'],
  ['js/entities/enemy.js|e.maxHp = o.hp; e.hp = o.vida > 0 && o.vida < o.hp ? o.vida : o.hp;', 1, "copia nueva en el invitado ('ne'), nunca por encima de la máxima"],
  ['js/net/coop.js|e.hp = G.MODS ? G.MODS.vidaDelAnfitrion(e, a[3]) : Math.min(e.maxHp, a[3]);', 1, 'sincronización del invitado (ventana en mods.js)'],
  ["js/data/enemies.js|if (behavior === 'bomber') { d.spd = Math.round(d.spd * 1.25); d.hp = Math.round(d.hp * 0.8); }", 1, 'definición, no instancia'],
  ["js/data/enemies.js|if (r) { r.behavior = 'runner'; r.spd = Math.round(r.spd * 1.6); r.hp = Math.round(r.hp * 0.7); }", 1, 'definición, no instancia'],
  ['js/systems/spawner.js|function scaled(sc, k) { return k === 1 ? sc : Object.assign({}, sc, { hp: sc.hp * k }); }', 1, 'escala de la definición, antes de crear'],
  ['js/systems/spawner.js|if (G.EnemyMgr.count >= CAP * ELITE_FROM) { e.maxHp = e.hp = Math.round(e.maxHp * 1.6); e.dmg *= 1.25; e.xp = Math.round(e.xp * 1.6); }', 1, 'élite, antes de add'],
  ['js/systems/weather.js|e.hp -= e.maxHp * 0.02 + 1;', 1, 'clima: daño a enemigos (baja)'],
  ['js/core/mods.js|e.maxHp = e.hp = Math.max(1, Math.round(e.maxHp * f));', 1,
    'legendario de la grieta garantizada (vidaLegendario): su vida al crearlo, antes de añadirlo; no es una curación'],
  // jugador, compañero perdido y objetos del mapa (no son enemigos)
  ['js/entities/player.js|this.hp = this.maxHp;', 1, 'jugador: constructor'],
  ['js/entities/player.js|this.hp = Math.max(1, this.hp - Math.max(1, this.maxHp * 0.01));', 1, 'jugador: daño'],
  ['js/entities/player.js|this.hp -= d;', 1, 'jugador: daño'],
  ['js/entities/player.js|this.hp = 1; this.invuln = 1.2;', 1, 'jugador: aguante'],
  ['js/entities/player.js|this.hp = 0; this.dead = true;', 1, 'jugador: KO'],
  ['js/entities/player.js|this.hp = Math.min(this.maxHp, this.hp + amount);', 1, 'jugador: curación'],
  ['js/entities/player.js|addMaxHp(amount) { this.maxHp += amount; this.hp += amount; }', 1, 'jugador: más vida máxima'],
  ['js/entities/player.js|if (this.bellHeal > 0) { const h = Math.min(this.bellHeal, 4 * dt); this.hp = Math.min(this.maxHp, this.hp + h); this.bellHeal -= h; }', 1, 'jugador: Cascabel'],
  ['js/entities/player.js|if (this.regen > 0) this.hp = Math.min(this.maxHp, this.hp + this.regen * dt);', 1, 'jugador: regeneración'],
  ['js/entities/player.js|this.hp = Math.max(1, this.maxHp * frac);', 1, 'jugador: reanimado'],
  ['js/systems/evo-partida.js|if (!pl.remote) pl.hp = Math.min(pl.maxHp, Math.max(1, pl.hp + Math.max(0, d)));', 1, 'jugador: evoluciona en partida (sólo el suyo; nunca un enemigo)'],
  ['js/entities/player.js|this.hp = n.hp; this.maxHp = n.maxHp;', 1, 'compañero remoto: su vida por red'],
  ['js/systems/interact.js|pl.hp = Math.min(pl.maxHp, pl.hp + pl.maxHp * 0.14 * dt);', 1, 'manantial: cura al JUGADOR'],
  ['js/systems/weather.js|pl.hp -= d;', 1, 'clima: daño al jugador'],
  ['js/systems/events.js|L.hp -= Math.min(30, hits.reduce((a, e) => a + 4 + e.dmg * 0.12, 0));', 1, 'Pokémon perdido que escoltas (baja)'],
  ['js/world/world.js|p.hp -= amount;', 1, 'rocas y cofres (baja)']
];
const HP_RE = /\.hp\s*(\+\+|--|[-+*\/]?=(?!=))|\bhp\s*(\+\+|--)|\[\s*['"]hp['"]\s*\]\s*[-+*\/]?=(?!=)|Object\.assign\([^)]*\bhp\s*:/;
const SCAN = walk('js').filter(f => f.endsWith('.js') && f !== 'js/app.min.js');
const found = new Map();
for (const f of SCAN) rd(f).split(/\r?\n/).forEach((line, n) => {
  if (!HP_RE.test(line)) return;
  const key = f + '|' + line.trim().replace(/\s*\/\/.*$/, '');
  if (!found.has(key)) found.set(key, []);
  found.get(key).push(n + 1);
});
const expected = new Map(KNOWN.map(([k, c]) => [k, c]));
let unknown = 0;
for (const [key, lines] of found) {
  const f = key.slice(0, key.indexOf('|')), code = key.slice(key.indexOf('|') + 1);
  if (!expected.has(key)) { unknown++; bad(`${f}:${lines.join(',')} asignación de vida no revisada: ${code}`); }
  else if (lines.length > expected.get(key)) { unknown++; bad(`${f}:${lines.join(',')} asignación conocida repetida (${lines.length} veces, esperadas ${expected.get(key)}): ${code}`); }
}
const stale = KNOWN.filter(([k]) => !found.has(k));
if (stale.length) warn(`${stale.length} línea(s) de la lista ya no están (actualizar KNOWN): ${stale.map(([k]) => k).join(' · ')}`);
if (!unknown) ok(`${SCAN.length} ficheros de js/: sólo las ${KNOWN.length} asignaciones de vida revisadas`);
else console.log('        Revisa si alguna puede subir la vida de un enemigo; si no, añádela a KNOWN en tools/nico/check.js con su motivo.');

// ---------------- 9. grieta garantizada ----------------
// A: la lógica de js/core/mods.js, fotograma a fotograma. B: js/systems/rift.js real con el juego simulado
// (sin navegador): solitario, anfitrión e invitado. Nada de esto usa las ayudas de depuración del juego.
function grietaChecks() {
  console.log('9. Grieta garantizada (js/core/mods.js y js/systems/rift.js con el código real)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const DT = 1 / 30, CERCA = (a, b, e = 1e-6) => Math.abs(a - b) < e;

  // ---- A. lógica de mods.js ----
  let jefe = false;
  const cm = { performance: { now: () => 0 } };
  vm.createContext(cm);
  cm.G = { EnemyMgr: { bossAlive: () => jefe } };
  vm.runInContext(rd('js/core/mods.js'), cm, { filename: 'js/core/mods.js' });
  const M = cm.G.MODS, LIM = M.grietaGarantizadaAntesDe;
  const azar = v => vm.runInContext(`Math.random = () => ${v}`, cm);
  t('por defecto: antes de los 120 s y el legendario con el 60 % de la vida', LIM === 120 && M.grietaGarantizadaVida === 0.6);
  const horas = [0, 0.5, 0.999].map(v => { azar(v); const pl = {}; M.grietaGarantizada(pl, 0, false, true); return M.grietaGarantizadaHora(pl); });
  t('la hora cae en [límite-45, límite-10] = [75, 110] s (azar 0, 0,5 y 0,999)',
    horas.every(h => h >= LIM - 45 && h <= LIM - 10) && CERCA(horas[0], 75) && CERCA(horas[1], 92.5) && CERCA(horas[2], 109.965), horas);

  /** Fotogramas de 0 a `hasta` s. Devuelve los instantes en que pide abrirla. `fallos`: veces que open() no
   *  encuentra sitio; la grieta dura `ttl` s. `natural`: [desde, hasta) con una grieta natural; `jefes`: con un jefe. */
  function simular({ v = 0.5, manda = true, fallos = 0, ttl = 45, natural = null, jefes = null, hasta = 130, pl = {} } = {}) {
    azar(v);
    const pide = [];
    let fin = -1;
    for (let k = 0; k * DT <= hasta; k++) {
      const time = k * DT;
      jefe = !!(jefes && time >= jefes[0] && time < jefes[1]);
      const hay = !!(natural && time >= natural[0] && time < natural[1]) || time < fin;
      if (M.grietaGarantizada(pl, time, hay, manda)) { pide.push(time); if (fallos-- <= 0) fin = time + ttl; }
    }
    jefe = false;
    return { pide, hora: M.grietaGarantizadaHora(pl) };
  }
  const s1 = simular(), s2 = simular({ v: 0.999 });
  t('se abre una sola vez, en el primer fotograma tras su hora y antes de los 120 s',
    [s1, s2].every(s => s.pide.length === 1 && s.pide[0] >= s.hora && s.pide[0] < s.hora + DT + 1e-9 && s.pide[0] < LIM), { s1: s1.pide, s2: s2.pide });
  const corta = simular({ ttl: 2 });
  t('si no entráis antes de que se cierre, no se reabre (cerrada a los 94,5 s, nada hasta los 130)', corta.pide.length === 1, corta.pide);
  const invitado = simular({ manda: false });
  M.grietaGarantizadaAntesDe = 0;
  const apagada = simular();
  M.grietaGarantizadaAntesDe = LIM;
  t('nunca si no manda este cliente (invitado) ni con el ajuste a 0', invitado.pide.length === 0 && apagada.pide.length === 0 && apagada.hora === null);
  const nat1 = simular({ natural: [80, 125] }), nat2 = simular({ natural: [76, 78] }), nat3 = simular({ natural: [95, 140] });
  t('si ya hubo una natural (abierta o ya cerrada), no se fuerza otra', nat1.pide.length === 0 && nat2.pide.length === 0 && nat3.pide.length === 1 && nat3.pide[0] < 95,
    { nat1: nat1.pide, nat2: nat2.pide, nat3: nat3.pide });
  const sinSitio = simular({ fallos: 1e9 }), huecos = sinSitio.pide.slice(1).map((x, i) => x - sinSitio.pide[i]);
  t('si open() no encuentra sitio, lo reintenta cada segundo (nunca antes) hasta el límite',
    sinSitio.pide.length >= 25 && huecos.every(h => h >= 1 - 1e-9 && h < 1 + DT + 1e-6) && sinSitio.pide[sinSitio.pide.length - 1] < LIM,
    { veces: sinSitio.pide.length, minimo: Math.min(...huecos), maximo: Math.max(...huecos) });
  const dosFallos = simular({ fallos: 2 });
  t('tras dos intentos sin sitio, al tercero se abre y ya no pide más', dosFallos.pide.length === 3 && CERCA(dosFallos.pide[2] - dosFallos.pide[0], 2, DT + 1e-6), dosFallos.pide);
  const conJefe = simular({ jefes: [80, 100] }), jefeSiempre = simular({ jefes: [80, 130] });
  t('con un jefe vivo no: espera a que caiga (si cae antes del límite)', conJefe.pide.length === 1 && conJefe.pide[0] >= 100 && conJefe.pide[0] < 100 + DT + 1e-9 &&
    jefeSiempre.pide.length === 0, { conJefe: conJefe.pide, jefeSiempre: jefeSiempre.pide });
  const plA = {}, plB = {};
  const pA = simular({ v: 0, pl: plA }), pB = simular({ v: 0.999, pl: plB });
  t('otra partida (otro jugador local) vuelve a elegir hora y vuelve a tener su grieta', CERCA(pA.hora, 75) && CERCA(pB.hora, 109.965) &&
    pA.pide.length === 1 && pB.pide.length === 1 && CERCA(M.grietaGarantizadaHora(plA), 75), { A: pA, B: pB });
  // La marca de su arena y la vida del legendario.
  const plM = {}; M.grietaGarantizada(plM, 0, false, true);
  const forzada = { ttl: 45 }, otra = { ttl: 45 };
  M.grietaAbierta(plM, forzada, 92.5);
  const a1 = M.arenaGarantizada(plM, forzada, 93), a2 = M.arenaGarantizada(plM, forzada, 93.5), a3 = M.arenaGarantizada(plM, otra, 200);
  t('la arena de la grieta garantizada sale marcada una vez; otra grieta (natural) no', a1 === 1 && a2 === 0 && a3 === 0 && M.arenaGarantizada({}, otra, 100) === 0);
  const plT = {}, plU = {}; M.grietaGarantizada(plT, 0, false, true); M.grietaGarantizada(plU, 0, false, true);
  M.grietaAbierta(plT, { ttl: 45 }, 92.5); M.grietaAbierta(plU, { ttl: 45 }, 92.5);
  t('si aquí ya se cerró (el invitado entró en sus últimos instantes), vale hasta 5 s después; luego no',
    M.arenaGarantizada(plT, null, 92.5 + 45 + 4.9) === 1 && M.arenaGarantizada(plU, null, 92.5 + 45 + 5.1) === 0);
  const eF = { maxHp: 4190, hp: 4190 }, eN = { maxHp: 4190, hp: 4190 };
  M.vidaLegendario(eF, { forzada: 1 }); M.vidaLegendario(eN, { forzada: 0 });
  t('vidaLegendario: el de su arena, con el 60 % (4.190 -> 2.514); el de otra, igual', eF.maxHp === 2514 && eF.hp === 2514 && eN.maxHp === 4190 && eN.hp === 4190);
  // La PRIMERA grieta de la partida, si es la natural y se abre antes del límite, cuenta como la garantizada.
  {
    const natural = { ttl: 45 }, despues = { ttl: 45 };
    cm.G.Rift = { rift: null };
    const plN = {}; M.grietaGarantizada(plN, 0, false, true);
    cm.G.Rift.rift = natural;
    const pide = M.grietaGarantizada(plN, 105, true, true);
    const n1 = M.arenaGarantizada(plN, natural, 106), n2 = M.arenaGarantizada(plN, natural, 107), n3 = M.arenaGarantizada(plN, despues, 200);
    const plTarde = {}; M.grietaGarantizada(plTarde, 0, false, true);
    cm.G.Rift.rift = despues; M.grietaGarantizada(plTarde, 125, true, true);
    const tarde = M.arenaGarantizada(plTarde, despues, 126);
    const plInv = {}; M.grietaGarantizada(plInv, 0, false, false);
    cm.G.Rift.rift = natural; M.grietaGarantizada(plInv, 105, true, false);
    const inv = M.arenaGarantizada(plInv, natural, 106);
    M.grietaGarantizadaAntesDe = 0;
    const plOff = {}; M.grietaGarantizada(plOff, 105, true, true);
    M.grietaGarantizadaAntesDe = LIM;
    const off = M.arenaGarantizada(plOff, natural, 106);
    delete cm.G.Rift;
    t('la primera grieta, si es natural y se abre antes del límite, queda marcada (una vez); pasada la hora límite, en el invitado o con el ajuste a 0, no',
      pide === false && n1 === 1 && n2 === 0 && n3 === 0 && tarde === 0 && inv === 0 && off === 0, { pide, n1, n2, n3, tarde, inv, off });
  }

  // ---- B. js/systems/rift.js real ----
  const scaleHp = n => 1 + 0.3 * Math.max(0, n - 1);
  const vidaNormal = (t, n) => Math.round((3200 + t * 9) * scaleHp(n) * (n > 1 ? 1.4 : 1));   // la fórmula de spawnLegend
  function juego({ papel = 'solo' } = {}) {
    const S = { time: 0, rnd: 0.5, enemigos: new Map(), creados: [], banderas: [], enviados: [], alHost: [], vinculos: 0, grietas: [], pide: 0 };
    const c = { console };
    vm.createContext(c);
    c.window = c; c.G = {}; c.__rnd = () => S.rnd;
    for (const f of ['js/core/util.js', 'js/core/mods.js']) vm.runInContext(rd(f), c, { filename: f });
    vm.runInContext('Math.random = () => __rnd()', c);
    const G = c.G, nop = () => {};
    const pl = { x: 2000, y: 2000, dead: false, bonds: 0, bodyH: 30, revive: nop }, mate = { x: 2040, y: 2000, dead: false };
    let nid = 0;
    Object.assign(G, {
      Tiles: { T: 16, arenaBiome: () => 0, ARENA_THEMES: {}, propSprite: () => ({ width: 1, height: 1 }) },
      Sprites: { PX: 2, hasShiny: () => false },
      Coop: { active: papel !== 'solo', isHost: papel === 'anfitrion', scaleHp,
        broadcast: m => S.enviados.push(JSON.parse(JSON.stringify(m))), toHost: m => S.alHost.push(m) },
      Game: { get player() { return pl; }, st: { get time() { return S.time; } }, everyone: () => (papel === 'solo' ? [pl] : [pl, mate]), flash: nop,
        offerBond: () => { S.vinculos++; } },
      EnemyMgr: { bossAlive: () => [...S.enemigos.values()].some(e => e.boss && !e.dead), stash: nop, restore: nop, clearRemote: nop,
        add: e => { S.enemigos.set(e.id, e); S.creados.push({ e, t: S.time }); }, get: id => S.enemigos.get(id), all: () => [...S.enemigos.values()] },
      World: { isFree: () => true, setArena: nop, setBiome: nop, biome: 0 },
      Projectiles: { clear: nop }, Combat: { clearFields: nop }, Hazards: { clear: nop }, Weather: { force: nop, clear: nop },
      Camera: { x: 0, y: 0, kick: nop }, Audio: { sfx: nop }, FX: { ring: nop, dmgText: nop, px: nop }, Spawner: { say: nop },
      Progress: { event: nop }, Pickups: { pullAll: nop }, Guard: { flag: w => S.banderas.push(w) },
      DEX: [{ dex: 150, name: 'Mewtwo', leg: true, types: ['psychic'], spd: 130 }], SPRITE_META: { 150: {} },
      Enemy: class { constructor(def, x, y, sc, boss) { this.id = ++nid; this.def = def; this.name = def.name; this.x = x; this.y = y; this.boss = boss;
        this.maxHp = Math.round(def.hp * sc.hp); this.hp = this.maxHp; this.dead = false; } makeShiny() { this.maxHp *= 2; this.hp = this.maxHp; } }
    });
    G.DEX_BY = { 150: G.DEX[0] };
    vm.runInContext(rd('js/systems/rift.js'), c, { filename: 'js/systems/rift.js' });
    const R = G.Rift, M2 = G.MODS, gg = M2.grietaGarantizada;
    M2.grietaGarantizada = function (...a) { const x = gg.apply(this, a); if (x) S.pide++; return x; };
    const paso = () => {
      S.time += DT; R.update(DT, pl, S.time);
      if (R.rift && !S.grietas.includes(R.rift)) S.grietas.push(R.rift);
    };
    const hastaQue = (cond, max) => { while (!cond() && S.time < max) paso(); return cond(); };
    const entrar = () => { pl.x = R.rift.x; pl.y = R.rift.y - 10; paso(); };
    const legendario = () => S.creados.length ? S.creados[S.creados.length - 1] : null;
    return { S, R, pl, G, paso, hastaQue, entrar, legendario };
  }

  // Solitario: la garantizada a su hora, su legendario con el 60 %, el vínculo; después una natural intacta.
  {
    const J1 = juego(), { S, R } = J1;
    J1.hastaQue(() => R.rift, 130);
    const g0 = R.rift, tAbre = S.time, d = g0 ? Math.hypot(g0.x - J1.pl.x, (g0.y - J1.pl.y) / 0.85) : 0;
    t('solitario: la grieta se abre a su hora (92,5 s con azar 0,5) a 380-560 px del jugador', g0 && tAbre >= 92.5 && tAbre < 92.5 + 2 * DT && d >= 380 && d <= 560,
      { t: tAbre, distancia: Math.round(d) });
    for (let i = 0; i < 60; i++) J1.paso();
    J1.entrar();
    const L1 = J1.legendario();
    t('solitario: su legendario sale con el 60 % de la vida que tendría sin el mod (arena marcada)', R.inArena && R.arena.forzada === 1 && L1 &&
      L1.e.maxHp === Math.round(vidaNormal(L1.t, 1) * 0.6) && L1.e.hp === L1.e.maxHp, L1 && { t: L1.t, vida: L1.e.maxHp, sinMod: vidaNormal(L1.t, 1) });
    L1.e.dead = true; J1.paso();
    const bonds = J1.pl.bonds;
    J1.hastaQue(() => !R.inArena, S.time + 10);
    const tFin = S.time;
    t('solitario: al vencerlo, vínculo (bonds 1) y la fusión se ofrece al volver', bonds === 1 && !R.inArena && S.vinculos === 1, { bonds, vinculos: S.vinculos });
    // Natural después: la tirada de cada 30 s empieza de nuevo al cerrarse la garantizada (si no, a los ~12,5 s).
    S.rnd = 0.1;
    J1.hastaQue(() => R.rift, tFin + 40);
    const g1 = R.rift, tNat = S.time;
    t('solitario: la siguiente natural sale 30 s después de volver de la arena (la tirada vuelve a empezar)', g1 && g1 !== g0 && tNat - tFin >= 30 - DT && tNat - tFin < 30 + 2 * DT,
      { vuelta: tFin, natural: tNat });
    J1.entrar();
    const L2 = J1.legendario();
    t('solitario: el legendario de una grieta natural posterior sale con su vida completa (arena sin marca)', R.inArena && R.arena.forzada === 0 && L2 && L2.e !== L1.e &&
      L2.e.maxHp === vidaNormal(L2.t, 1), L2 && { t: L2.t, vida: L2.e.maxHp, normal: vidaNormal(L2.t, 1) });
    L2.e.dead = true; J1.paso(); J1.hastaQue(() => !R.inArena, S.time + 10);
    S.rnd = 0.5;
    J1.hastaQue(() => false, 400);
    t('solitario: en toda la partida (400 s) sólo la garantizada y la natural; se pidió abrir una vez y nada marcó la partida como debug',
      S.grietas.length === 2 && S.pide === 1 && S.banderas.length === 0 && J1.pl.bonds === 2, { grietas: S.grietas.length, pide: S.pide, banderas: S.banderas });
  }
  // Solitario: una natural antes de la hora (hora 106,5 s; la tirada de los 105 s sale) -> no se fuerza, y como es la
  // PRIMERA de la partida y se abre antes de los 120 s, su legendario sale con el 60 % (~3 % de las partidas). La
  // siguiente natural, ya con su vida completa.
  {
    const J2 = juego(), { S, R } = J2;
    S.rnd = 0.9; J2.paso(); S.rnd = 0.1;
    J2.hastaQue(() => R.rift, 130);
    const tNat = S.time;
    J2.entrar();
    const L = J2.legendario(), marca = R.arena && R.arena.forzada;
    L.e.dead = true; J2.paso(); J2.hastaQue(() => !R.inArena, S.time + 10);
    const tFin = S.time;
    S.rnd = 0.5; J2.hastaQue(() => false, 130);
    t('solitario: si a los 105 s sale una natural (hora 106,5), no se fuerza ninguna; es la primera: su legendario, con el 60 % (arena marcada)',
      tNat >= 105 - DT && tNat < 105 + 2 * DT && S.grietas.length === 1 && S.pide === 0 && R.arena === null && marca === 1 &&
      L.e.maxHp === Math.round(vidaNormal(L.t, 1) * 0.6) && L.e.hp === L.e.maxHp, { natural: tNat, grietas: S.grietas.length, vida: L.e.maxHp, sinMod: vidaNormal(L.t, 1) });
    S.rnd = 0.1;
    J2.hastaQue(() => R.rift, tFin + 40);
    J2.entrar();
    const L2 = J2.legendario();
    t('solitario: tras esa natural, la siguiente natural sale con su legendario entero (arena sin marca)',
      S.grietas.length === 2 && R.inArena && R.arena.forzada === 0 && L2 && L2.e !== L.e && L2.e.maxHp === vidaNormal(L2.t, 1), L2 && { t: L2.t, vida: L2.e.maxHp });
  }
  // Grupo: la primera natural del anfitrión antes del límite también lleva el 60 % (el invitado recibe la arena marcada).
  {
    const H = juego({ papel: 'anfitrion' }), I = juego({ papel: 'invitado' });
    const reparte = () => {
      for (const m of H.S.enviados.splice(0)) I.R.onEvent(m);
      for (const m of I.S.alHost.splice(0)) if (m[0] === 're') H.R.enterRequest();
    };
    const ambos = () => { H.paso(); I.paso(); reparte(); };
    H.S.rnd = 0.9; I.S.rnd = 0.9; ambos(); H.S.rnd = 0.1;
    while (!H.R.rift && H.S.time < 130) ambos();
    ambos();
    I.entrar(); reparte(); ambos();
    const L = H.legendario();
    t('grupo: la primera natural (105 s, antes de la hora 106,5) del anfitrión: arena marcada en los dos y su legendario con el 60 % de la vida de dos',
      H.S.pide === 0 && H.R.inArena && I.R.inArena && H.R.arena.forzada === 1 && I.R.arena.forzada === 1 && L && L.e.maxHp === Math.round(vidaNormal(L.t, 2) * 0.6),
      L && { t: L.t, vida: L.e.maxHp, sinMod: vidaNormal(L.t, 2) });
  }
  // Grupo: el anfitrión la abre y la anuncia; el invitado no abre ninguna, la recibe en el mismo sitio, entra,
  // el anfitrión crea la arena marcada y su legendario (60 % de la vida de grupo); al vencerlo, los dos con vínculo.
  {
    const H = juego({ papel: 'anfitrion' }), I = juego({ papel: 'invitado' });
    const reparte = () => {
      for (const m of H.S.enviados.splice(0)) I.R.onEvent(m);
      for (const m of I.S.alHost.splice(0)) if (m[0] === 're') H.R.enterRequest();
    };
    const ambos = () => { H.paso(); I.paso(); reparte(); };
    let invitadoSolo = false;
    while (!H.R.rift && H.S.time < 130) { ambos(); if (I.R.rift && !H.R.rift) invitadoSolo = true; }
    const anuncio = H.S.grietas.length ? [Math.round(H.R.rift.x), Math.round(H.R.rift.y)] : null;
    ambos();
    t('grupo: el anfitrión abre la grieta a su hora y la anuncia; el invitado no abre ninguna y la recibe en las mismas x e y',
      anuncio && I.R.rift && I.R.rift.x === anuncio[0] && I.R.rift.y === anuncio[1] && !invitadoSolo && I.S.pide === 0 && H.S.pide === 1,
      { anfitrion: anuncio, invitado: I.R.rift && [I.R.rift.x, I.R.rift.y], pideInvitado: I.S.pide });
    for (let i = 0; i < 30; i++) ambos();
    I.entrar(); reparte(); ambos();
    const L = H.legendario();
    t('grupo: entra el invitado, la arena (marcada) es para los dos y el legendario lo crea sólo el anfitrión, con el 60 % de la vida de dos',
      H.R.inArena && I.R.inArena && H.R.arena.forzada === 1 && I.R.arena.forzada === 1 && I.S.creados.length === 0 && L &&
      L.e.maxHp === Math.round(vidaNormal(L.t, 2) * 0.6), L && { t: L.t, vida: L.e.maxHp, sinMod: vidaNormal(L.t, 2) });
    L.e.dead = true; ambos();
    t('grupo: al vencerlo, los dos tienen bonds === 1', H.pl.bonds === 1 && I.pl.bonds === 1, { anfitrion: H.pl.bonds, invitado: I.pl.bonds });
    while ((H.R.inArena || I.R.inArena) && H.S.time < 200) ambos();
    t('grupo: vuelven los dos y nada marca la partida como debug', !H.R.inArena && !I.R.inArena && !H.S.banderas.length && !I.S.banderas.length);
  }
  // Grupo: el invitado entra cuando en el anfitrión ya se ha cerrado (su reloj va algo por detrás).
  {
    const tarde = espera => {
      const H = juego({ papel: 'anfitrion' });
      H.hastaQue(() => H.R.rift, 130);
      const fin = H.S.time + 45 + espera;
      H.hastaQue(() => false, fin);
      const sinGrieta = !H.R.rift;
      H.R.enterRequest();
      const L = H.legendario();
      return { sinGrieta, forzada: H.R.arena && H.R.arena.forzada, vida: L && L.e.maxHp, normal: L && vidaNormal(L.t, 2) };
    };
    const t1 = tarde(1), t2 = tarde(8);
    t('grupo: si el invitado entra justo cuando en el anfitrión ya se cerró, sigue siendo la garantizada (hasta 5 s); más tarde, no',
      t1.sinGrieta && t1.forzada === 1 && t1.vida === Math.round(t1.normal * 0.6) && t2.sinGrieta && t2.forzada === 0 && t2.vida === t2.normal, { t1, t2 });
  }

  // ---- C. La vuelta de la grieta en grupo, con la red simulada ----
  // Dos clientes en node:vm con util.js, mods.js, js/net/coop.js y js/systems/rift.js reales y, de js/game.js tal cual,
  // offerBond() y coopApi.hold() (la fusión y su pausa común). El resto, mínimo: un gestor de enemigos como el de
  // enemy.js (add() anuncia con 'ne', stash/restore, las copias del invitado), el bucle (sólo 'playing' hace avanzar el
  // juego; la red se atiende siempre) y el diálogo de fusión, que el arnés elige a los `elige` s. La red entrega en
  // orden, `lat` fotogramas más tarde. Antes del arreglo el invitado volvía con su propia cuenta atrás (5 s desde 'aw'),
  // después de recibir los 'ne' con los que el anfitrión anuncia al volver los enemigos que guardó, y los borraba.
  try {
    const gsrc9 = rd('js/game.js');
    const trozo9 = (re, que) => { const m = gsrc9.match(re); if (!m) throw new Error('no encuentro en js/game.js: ' + que); return m[0]; };
    const fOffer = trozo9(/  function offerBond\(quiet = false\) \{[\s\S]*?\r?\n  \}\r?\n/, 'offerBond');
    const fHold = trozo9(/    hold\(names\) \{[\s\S]*?\r?\n    \}\r?\n/, 'coopApi.hold');
    const enRed = ({ lat = 0, ritmoInvitado = 1, elige = 0.6, eligeInvitado = elige, pierden = false, n = 12 } = {}) => {
      const cola = [], C = {};
      let f = 0;
      const envia = (de, a, msg) => cola.push({ llega: f + lat, de, a, msg: JSON.parse(JSON.stringify(msg)) });
      function cliente(uid, nombre, anfitrion) {
        const S = { time: 80, propios: 0, enArenaEnPausa: 0, estuvo: false, vuelta: null, dialogos: 0, eligeF: 0, banderas: [] };
        const c = { console, performance: { now: () => f * DT * 1000 } };
        vm.createContext(c);
        c.window = c; c.G = {};
        for (const fl of ['js/core/util.js', 'js/core/mods.js']) vm.runInContext(rd(fl), c, { filename: fl });
        vm.runInContext('Math.random = () => 0.5', c);
        const G = c.G, nop = () => {};
        G.MODS.grietaGarantizadaAntesDe = 0;   // la arena la empieza la prueba (el invitado pide entrar)
        let nid = anfitrion ? 0 : 1e6;
        const enemigo = (id, x, y, hp) => ({ id, x, y, hp, maxHp: hp, dead: false, boss: false, remote: false, dex: 19, dmg: 5, behavior: 'chaser',
          anim: { cur: 'Idle', dir: 0 }, burn: 0, poison: 0, shield: 0 });
        const lista = [], porId = new Map();
        let guardados = null;
        const quita = e => { porId.delete(e.id); const i = lista.indexOf(e); if (i >= 0) lista.splice(i, 1); };
        const EM = {
          all: () => lista, get: id => porId.get(id), bossAlive: () => lista.some(e => e.boss && !e.dead),
          add(e) { lista.push(e); porId.set(e.id, e); if (G.Coop.isHost) G.Coop.enemyAdded(e); return e; },
          addRemote(o) {
            if (porId.has(o.id)) return porId.get(o.id);
            const e = Object.assign(enemigo(o.id, o.x, o.y, o.hp), { remote: true, net: { x: o.x, y: o.y, vx: 0, vy: 0, age: 0, dir: 0, anim: 0, st: 0 } });
            lista.push(e); porId.set(e.id, e); return e;
          },
          removeRemote(id) { const e = porId.get(id); if (e) quita(e); },
          stash() { guardados = lista.filter(e => !e.dead); lista.length = 0; porId.clear(); },
          restore() {
            for (const e of lista.splice(0)) { porId.delete(e.id); if (G.Coop.isHost) G.Coop.enemyGone(e, false); }
            for (const e of guardados || []) EM.add(e);
            guardados = null;
          },
          clearRemote() { for (const e of lista.filter(x => x.remote)) quita(e); }
        };
        const ui = new Set();
        let bond = null, announce = '', announceT = 0;
        const pl = { x: 0, y: 0, dead: false, bonds: 0, bodyH: 30, hp: 100, maxHp: 100, moveAngle: 0, walking: false, magnet: 78, aim: 0, xpMul: 1, reviveT: 0,
          revive: nop, activeGroup: () => [], bondOptions: () => ({ mode: 'pair', group: [], loose: [{ name: 'a' }, { name: 'b' }] }),
          fuse(p) { this.bonds--; return p; } };
        Object.assign(G, {
          Net: { uid, on: fn => { S.recibe = fn; }, onPeer: nop, slow: () => false, viaTurn: () => false,
            send: (to, msg) => envia(uid, to, msg), toHost: msg => envia(uid, 'A', msg) },
          Player: class { constructor(mon) { Object.assign(this, { mon, dex: mon.dex, x: 0, y: 0, hp: 100, maxHp: 100, dead: false }); } },
          startMoveOf: () => 'tackle',
          Tiles: { T: 16, arenaBiome: () => 0, ARENA_THEMES: {} }, Sprites: { PX: 2, hasShiny: () => false, preload: nop },
          Game: { get player() { return pl; }, st: { get time() { return S.time; } }, everyone: () => G.Coop.players(), flash: nop, offerBond: () => c.__J.offerBond() },
          EnemyMgr: EM, World: { isFree: () => true, setArena: nop, setBiome: nop, biome: 0 },
          Projectiles: { clear: nop, clearOrbs: nop }, Combat: { clearFields: nop }, Hazards: { clear: nop }, Weather: { force: nop, clear: nop },
          Camera: { x: 0, y: 0, kick: nop }, Audio: { sfx: nop }, FX: { ring: nop, dmgText: nop, burst: nop, px: nop },
          Spawner: { say(txt, secs) { announce = txt; announceT = secs; }, banner: () => (announceT > 0 ? { text: announce, t: announceT } : null) },
          Progress: { event: nop }, Pickups: { pullAll: nop }, Guard: { flag: w => S.banderas.push(w) },
          UI: { isOpen: id => ui.has(id) },
          RunUI: { showBond: (opt, cb) => { ui.add('scr-bond'); bond = cb; S.dialogos++; S.eligeF = Math.round((anfitrion ? elige : eligeInvitado) / DT); } },
          Social: { me: { name: nombre } },
          DEX: [{ dex: 150, name: 'Mewtwo', leg: true, types: ['psychic'], spd: 130 }], SPRITE_META: { 150: {} },
          Enemy: class { constructor(def, x, y, sc, boss) { Object.assign(this, enemigo(++nid, x, y, Math.round(def.hp * sc.hp)), { boss, name: def.name, dex: def.dex, dmg: def.dmg }); } makeShiny() {} }
        });
        G.DEX_BY = { 150: G.DEX[0] };
        vm.runInContext(rd('js/net/coop.js'), c, { filename: 'js/net/coop.js' });
        vm.runInContext(rd('js/systems/rift.js'), c, { filename: 'js/systems/rift.js' });
        c.__pl = pl;
        vm.runInContext(`var __J = (() => {
          let pl = __pl, state = 'playing', holdBy = [];
${fOffer}
          const coopApi = {
${fHold}          };
          return { offerBond, coopApi, get state() { return state; } };
        })();`, c, { filename: 'js/game.js (offerBond y coopApi.hold)' });
        const J = c.__J;
        G.Coop.begin({ host: 'A', members: [{ uid: 'A', name: 'Ana', dex: 150 }, { uid: 'B', name: 'Bea', dex: 150 }] }, pl, Object.assign({
          team: () => ({ time: S.time, level: 1, xp: 0, xpNext: 10, kills: 0, bosses: 0, coins: 0, t1: 0, t10: 0 }),
          syncTeam: tm => { if (tm.time != null) S.time = tm.time; },
          levelStart: nop, waiting: nop, resume: nop, shiny: nop, over: nop, lost: nop, item: nop, mateLeft: nop
        }, J.coopApi));
        function fotograma() {
          const dt = DT * (anfitrion ? 1 : ritmoInvitado);
          if (J.state === 'playing') { S.time += dt; G.Rift.update(dt, pl, S.time); if (pl.bonds > 0) J.offerBond(true); }
          if (bond && --S.eligeF <= 0) { const cb = bond; bond = null; ui.delete('scr-bond'); cb(['a', 'b']); }
          // Lo que se ve al pintar este fotograma: el aviso «Pausa: …» con tu propio nombre no debe salir nunca.
          const b = G.Spawner.banner(), m = b && /^Pausa: (.+) eligen? fusión…$/.exec(b.text);
          if (m && m[1].split(', ').includes(nombre)) S.propios++;
          if (G.Rift.inArena) { S.estuvo = true; if (J.state === 'held') S.enArenaEnPausa++; } else if (S.estuvo && S.vuelta === null) S.vuelta = f;
          G.Coop.tick(dt);
        }
        return (C[uid] = { S, G, pl, J, EM, fotograma, nuevo: (x, y) => EM.add(enemigo(++nid, x, y, 50)) });
      }
      const H = cliente('A', 'Ana', true), I = cliente('B', 'Bea', false);
      const paso = () => {
        while (cola.length && cola[0].llega <= f) { const m = cola.shift(); C[m.a].S.recibe(m.de, m.msg); }
        H.fotograma(); I.fotograma(); f++;
      };
      const copias = () => I.EM.all().filter(e => e.remote).map(e => e.id).sort((a, b) => a - b);
      for (let i = 0; i < n; i++) H.nuevo(40 * i, 120);
      for (let i = 0; i < 20; i++) paso();
      const antes = copias().length;
      I.G.Coop.toHost(['re']);                       // el invitado entra en la grieta: el anfitrión empieza la arena para los dos
      for (let i = 0; i < 40; i++) paso();
      const enArena = H.G.Rift.inArena && I.G.Rift.inArena, jefe = H.EM.get(H.G.Rift.arena && H.G.Rift.arena.bossId);
      const copiaJefe = !!(jefe && I.EM.get(jefe.id)), sinMapa = copias().length === 1;
      if (pierden) H.G.Rift.arena.t = 1e9; else jefe.dead = true;
      const listos = () => !H.G.Rift.inArena && !I.G.Rift.inArena && H.J.state === 'playing' && I.J.state === 'playing' && !H.S.eligeF && !I.S.eligeF;
      for (let i = 0; i < 30 * 30 && !listos(); i++) paso();
      for (let i = 0; i < 30; i++) paso();
      const vivos = H.EM.all().filter(e => !e.dead && !e.remote).map(e => e.id).sort((a, b) => a - b), cs = copias();
      return { antes, enArena, copiaJefe, sinMapa, vivos: vivos.length, copias: cs.length, iguales: vivos.join() === cs.join(), listos: listos(),
        vueltaA: H.S.vuelta, vueltaB: I.S.vuelta, pausaB: I.S.enArenaEnPausa, dialogos: [H.S.dialogos, I.S.dialogos], bonds: [H.pl.bonds, I.pl.bonds],
        propios: [H.S.propios, I.S.propios], banderas: H.S.banderas.length + I.S.banderas.length };
    };
    const casos = [
      ['sin latencia', { lat: 0 }], ['150 ms', { lat: 4 }], ['150 ms y el reloj del invitado un 15 % más rápido', { lat: 4, ritmoInvitado: 1.15 }],
      ['70 ms y el reloj del invitado a la mitad', { lat: 2, ritmoInvitado: 0.5 }],
      // Los dos eligen en el mismo fotograma: al invitado le llega después un 'hp' que aún le incluye (el anfitrión no ha recibido su 'he').
      ['150 ms y eligen a la vez', { lat: 4, eligeInvitado: 0.45 }]
    ].map(([k, o]) => [k, o, enRed(o)]);
    const base = x => x.antes === 12 && x.enArena && x.copiaJefe && x.sinMapa && x.listos && x.banderas === 0;
    t('vuelta (coop.js real, red simulada): ganada, el invitado se queda con la copia de los 12 enemigos del mapa (sin latencia, 150 ms, su reloj más rápido o más lento, eligen a la vez)',
      casos.every(([, , x]) => base(x) && x.vivos === 12 && x.iguales), casos.map(([k, , x]) => ({ k, vivos: x.vivos, copias: x.copias, iguales: x.iguales })));
    t("vuelta: el invitado vuelve cuando le llega 'af' (lat fotogramas después que el anfitrión) y no se queda en pausa dentro de la arena",
      casos.every(([, o, x]) => x.pausaB === 0 && x.vueltaB - x.vueltaA >= 0 && x.vueltaB - x.vueltaA <= o.lat + 2),
      casos.map(([k, , x]) => ({ k, vueltaA: x.vueltaA, vueltaB: x.vueltaB, pausaB: x.pausaB })));
    t('fusión: los dos eligen (un diálogo cada uno, bonds a 0) y nadie ve su propio nombre en «Pausa: … elige fusión»',
      casos.every(([, , x]) => x.dialogos.join() === '1,1' && x.bonds.join() === '0,0' && x.propios.join() === '0,0'),
      casos.map(([k, , x]) => ({ k, dialogos: x.dialogos, bonds: x.bonds, propios: x.propios })));
    const rapido = enRed({ lat: 2, ritmoInvitado: 2.5 }), perdida = enRed({ lat: 2, pierden: true });
    t("vuelta: si 'af' no llega a tiempo (reloj del invitado 2,5 veces más rápido), vuelve 3 s después por su cuenta y aun así tiene todas las copias",
      base(rapido) && rapido.vueltaB < rapido.vueltaA && rapido.vivos === 12 && rapido.iguales && rapido.propios.join() === '0,0',
      { vueltaA: rapido.vueltaA, vueltaB: rapido.vueltaB, vivos: rapido.vivos, copias: rapido.copias });
    t('vuelta: perdida (se acaba el tiempo), sin vínculo; el invitado vuelve con el anfitrión y tiene todas las copias',
      base(perdida) && perdida.vivos === 12 && perdida.iguales && perdida.pausaB === 0 && perdida.vueltaB - perdida.vueltaA >= 0 && perdida.vueltaB - perdida.vueltaA <= 4 &&
      perdida.dialogos.join() === '0,0', { vueltaA: perdida.vueltaA, vueltaB: perdida.vueltaB, vivos: perdida.vivos, copias: perdida.copias, dialogos: perdida.dialogos });
  } catch (e) { t('vuelta de la grieta con la red simulada (coop.js real)', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`grieta garantizada: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`grieta: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 10. gacha y tickets ----------------
// Con el código real en node:vm: js/core/mods.js, trozos de js/game.js (bankTickets, syncTeam y la recogida de
// tickets, tal cual), js/systems/progress.js con las misiones y los logros reales, y el importador.
function gachaChecks() {
  console.log('10. Gacha y tickets (js/core/mods.js con el código real)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const medidas = [];
  const nuevoMods = () => { const c = { console }; vm.createContext(c); c.G = {}; vm.runInContext(rd('js/core/mods.js'), c, { filename: 'js/core/mods.js' }); return c; };
  /** G.I18n.t real en inglés (i18n.js con lang-en.js y lang-en-mod.js), con un navegador mínimo. */
  function traductorIngles() {
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {};
    c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    if (c.G.I18n.lang !== 'en') throw new Error('i18n.js no ha elegido inglés');
    return c.G.I18n.t;
  }
  const EN = traductorIngles();

  // ---- A. Tickets ganados ×ticketsMult ----
  {
    const M = nuevoMods().G.MODS;
    t('tickets: por defecto ×2 (entero)', M.ticketsMult === 2 && M.multTickets() === 2 && M.tickets(3) === 6 && M.tickets(0) === 0);
    const raros = [0, -2, NaN, 'x', Infinity, 0.5, 2.7].map(v => { M.ticketsMult = v; return M.multTickets(); });
    M.ticketsMult = 2;
    t('tickets: un ajuste no válido (0, negativo, NaN, texto, infinito, <1) vale 1; con decimales, la parte entera', raros.join() === '1,1,1,1,1,1,2', raros);
    const def = { t1: 3, t10: 1, coins: 150 }, antes = JSON.stringify(def), p = M.premio(def);
    t('premio(): una copia con los tickets ×2, las Pokémonedas igual y la definición intacta', p !== def && p.t1 === 6 && p.t10 === 2 && p.coins === 150 &&
      JSON.stringify(def) === antes, p);
    const soloMonedas = M.premio({ coins: 100 });
    t('premio(): sin tickets no inventa ninguno; null y undefined pasan', soloMonedas.coins === 100 && !('t1' in soloMonedas) && !('t10' in soloMonedas) &&
      M.premio(null) === null && M.premio(undefined) === undefined);
    M.ticketsMult = 1;
    t('premio() y textos con ticketsMult = 1: como el proyecto base', M.premio(def) === def && M.textoTicket('ticket') === '+1 ticket' && M.textoTicket('ticket10') === '¡Ticket ×10!');
    M.ticketsMult = 2;
    t('texto que flota con ×2: «+2 tickets» y «¡2 tickets ×10!»', M.textoTicket('ticket') === '+2 tickets' && M.textoTicket('ticket10') === '¡2 tickets ×10!');
    const en = ['+2 tickets', '¡2 tickets ×10!', '+1 ticket', '¡Ticket ×10!'].map(EN);
    t('texto que flota, en inglés (i18n.js real): «+2 tickets», «2 ×10 tickets!» y los del proyecto base', en.join('|') === '+2 tickets|2 ×10 tickets!|+1 ticket|Ticket ×10!', en);
  }

  // Trozos de js/game.js, tal cual: si upstream los cambia, esto falla y hay que revisarlo.
  const gsrc = rd('js/game.js');
  const trozo = (re, que) => { const m = gsrc.match(re); if (!m) throw new Error('no encuentro en js/game.js: ' + que); return m[0]; };
  const fBank = trozo(/  let banked = \{ t1: 0, t10: 0 \};\r?\n  function bankTickets\(save_ = true\) \{[\s\S]*?\r?\n  \}\r?\n/, 'bankTickets');
  const fSync = trozo(/    syncTeam\(t\) \{[\s\S]*?\r?\n    \},\r?\n/, 'coopApi.syncTeam');
  const fTicket = trozo(/    if \(p\.kind === 'ticket' \|\| p\.kind === 'ticket10'\) \{[\s\S]*?\r?\n      return;\r?\n    \}\r?\n/, 'la recogida de tickets (onCollect)');
  const fOver = trozo(/t1: G\.MODS && G\.MODS\.tickets \? G\.MODS\.tickets\(pl\.t1\) : pl\.t1, t10: G\.MODS && G\.MODS\.tickets \? G\.MODS\.tickets\(pl\.t10\) : pl\.t10,/, 'la pantalla final');
  /** Una partida con la partida guardada `t1`/`t10` y el ajuste `mult`. nueva() = startRun; final() = endRun. */
  function partida({ mult = 2, t1 = 10, t10 = 1 } = {}) {
    const c = nuevoMods(), G = c.G, S = { commits: 0, textos: [], sfx: [] };
    G.MODS.ticketsMult = mult;
    G.DB = { save: { tickets: { t1, t10 } }, commit: () => { S.commits++; } };
    G.Audio = { sfx: k => S.sfx.push(k) };
    G.FX = { dmgText: (x, y, txt) => S.textos.push(txt), ring() {} };
    vm.runInContext(`var __J = (() => {
      let pl = null, time = 0;
${fBank}
      const coopApi = {
${fSync}      };
      function recoge(p, who = pl) {
${fTicket}      }
      function final() { bankTickets(false); return { ${fOver} }; }
      return { nueva(p) { pl = p; banked = { t1: 0, t10: 0 }; }, bankTickets, coopApi, recoge, final, get pl() { return pl; } };
    })();`, c, { filename: 'js/game.js (trozos)' });
    const J = c.__J, sv = G.DB.save.tickets;
    const jugador = () => ({ t1: 0, t10: 0, x: 0, y: 0, bodyH: 30, level: 1, xp: 0, xpNext: 10, kills: 0, bosses: 0, coins: 0 });
    return { J, S, sv, G, jugador, equipo: tk => ({ time: 1, level: 1, xp: 0, xpNext: 10, kills: 0, bosses: 0, coins: 0, t1: tk[0], t10: tk[1] }) };
  }
  try {
    // Solitario o anfitrión.
    const P = partida();
    P.J.nueva(P.jugador());
    P.J.recoge({ kind: 'ticket' });
    const uno = { pl: P.J.pl.t1, sv: P.sv.t1, commits: P.S.commits };
    P.J.recoge({ kind: 'ticket' }); P.J.recoge({ kind: 'ticket10' });
    t('recogida: cada objeto sigue sumando 1 al contador de la partida (pl.t1++, lo que viaja por la red)', uno.pl === 1 && P.J.pl.t1 === 2 && P.J.pl.t10 === 1, P.J.pl);
    t('bankTickets: +2 en la partida guardada por cada ticket (y por cada ticket ×10), guardando al momento', uno.sv === 12 && uno.commits === 1 && P.sv.t1 === 14 && P.sv.t10 === 3,
      { primero: uno, t1: P.sv.t1, t10: P.sv.t10 });
    t('recogida: el texto que flota dice «+2 tickets» y «¡2 tickets ×10!»', P.S.textos.join('|') === '+2 tickets|+2 tickets|¡2 tickets ×10!', P.S.textos);
    const otra = P.J.bankTickets(), fin = P.J.final();
    t('al terminar no se cobra otra vez (bankTickets sin nada nuevo y endRun) y la pantalla final dice lo apuntado (+4 y +2 ×10)',
      P.sv.t1 === 14 && P.sv.t10 === 3 && fin.t1 === 4 && fin.t10 === 2 && otra === undefined, { t1: P.sv.t1, t10: P.sv.t10, fin });
    // Otra partida: el contador vuelve a 0 y no se apunta nada al empezar.
    P.J.nueva(P.jugador()); P.J.bankTickets();
    t('otra partida empieza sin apuntar nada', P.sv.t1 === 14 && P.sv.t10 === 3);
    // Invitado: el anfitrión manda el contador del equipo (tk) y cada uno lo apunta con SU ajuste.
    const B = partida({ mult: 2, t1: 0, t10: 0 }), B1 = partida({ mult: 1, t1: 0, t10: 0 });
    for (const X of [B, B1]) X.J.nueva(X.jugador());
    const pasos = [[1, 0], [1, 0], [3, 1], [2, 1], [4, 1]];   // [t1, t10] del equipo; el 4.º baja (no debería pasar)
    const visto = pasos.map(tk => { for (const X of [B, B1]) X.J.coopApi.syncTeam(X.equipo(tk)); return [B.sv.t1, B.sv.t10, B1.sv.t1, B1.sv.t10].join(','); });
    t('invitado (syncTeam): con ×2 apunta +2 por ticket del equipo; un dato repetido no suma y uno menor no resta', visto.join(' ') === '2,0,1,0 2,0,1,0 6,2,3,1 6,2,3,1 8,2,4,1', visto);
    const finB = B.J.final(), finB1 = B1.J.final();
    t('invitado: al terminar no se cobra otra vez; la pantalla final dice lo apuntado (×2: +8 y +2 ×10; ×1: +4 y +1)',
      B.sv.t1 === 8 && B.sv.t10 === 2 && finB.t1 === 8 && finB.t10 === 2 && B1.sv.t1 === 4 && finB1.t1 === 4 && finB1.t10 === 1, { finB, finB1 });
    // Con ticketsMult = 1: el proyecto base.
    const O = partida({ mult: 1 });
    O.J.nueva(O.jugador()); O.J.recoge({ kind: 'ticket' }); O.J.recoge({ kind: 'ticket10' });
    t('con ticketsMult = 1, como el proyecto base: +1 por ticket y los textos de siempre', O.sv.t1 === 11 && O.sv.t10 === 2 && O.S.textos.join('|') === '+1 ticket|¡Ticket ×10!', O.S.textos);
  } catch (e) { t('trozos de js/game.js en node:vm', false, String(e && e.stack || e)); }

  // Premios de misiones y logros: js/systems/progress.js con las definiciones reales.
  try {
    const c = { console, setTimeout: () => 0, clearTimeout() {}, performance: { now: () => 0 } };
    vm.createContext(c);
    c.window = c; c.G = {};
    c.document = { getElementById: () => null, createElement: () => ({ classList: { add() {}, remove() {} }, prepend() {} }), body: { appendChild() {} } };
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/moves.js', 'js/data/types.js',
      'js/data/missions.js', 'js/data/achievements.js', 'js/systems/progress.js']) vm.runInContext(rd(f), c, { filename: f });
    const G = c.G;
    Object.assign(G, { Ranking: { periodIds: () => ({ d: 'd1', w: 'w1' }) }, Icons: { html: k => `[${k}]` }, Audio: { sfx() {} } });
    const defs = JSON.stringify([G.MissionDefs.daily, G.MissionDefs.weekly, G.AchDefs.LIST].map(l => l.map(d => d.reward)));
    const s = { coins: 0, tickets: { t1: 0, t10: 0 }, stats: {}, owned: {}, shiny: {}, created: 1 };
    s.ach = Object.fromEntries(G.AchDefs.LIST.map(a => [a.id, 1]));   // todos ya conseguidos: sólo cuenta lo que se prueba
    G.DB = { save: s, commit() {} };
    const surv = G.MissionDefs.BY.survive.reward;
    const m = { id: 'survive', goal: 5, param: null, prog: 5, claimed: false, told: true };
    const okClaim = G.Progress.claim(m);
    const tras = { t1: s.tickets.t1, t10: s.tickets.t10, coins: s.coins };
    t(`misión (premio ${JSON.stringify(surv)}): se recoge con los tickets ×2 y las Pokémonedas igual`, okClaim && tras.t1 === surv.t1 * 2 && tras.coins === surv.coins && tras.t10 === 0, tras);
    t('misión: recogerla otra vez no da nada', G.Progress.claim(m) === false && s.tickets.t1 === tras.t1 && s.coins === tras.coins);
    const A = id => G.AchDefs.LIST.find(a => a.id === id);
    delete s.ach.evo1; delete s.ach.evo25; delete s.ach.own1;
    s.stats.evolutions = 25; s.owned[1] = { at: 1, from: 'gacha' };
    G.Progress.checkAch();
    const logro = { t1: s.tickets.t1 - tras.t1, t10: s.tickets.t10 - tras.t10, coins: s.coins - tras.coins };
    const esperado = { t1: (A('evo1').reward.t1 || 0) * 2, t10: (A('evo25').reward.t10 || 0) * 2, coins: A('own1').reward.coins || 0 };
    t('logros (evo1, evo25 y own1): tickets y tickets ×10 ×2; las Pokémonedas igual', logro.t1 === esperado.t1 && logro.t10 === esperado.t10 && logro.coins === esperado.coins &&
      esperado.t1 > 0 && esperado.t10 > 0 && esperado.coins > 0, { logro, esperado });
    G.Progress.checkAch();
    t('logros: no se dan dos veces', s.tickets.t1 - tras.t1 === logro.t1 && s.tickets.t10 - tras.t10 === logro.t10);
    const txt = G.Progress.rewardText(surv), txt10 = G.Progress.rewardText(A('evo25').reward);
    t('rewardText enseña lo que se da (×2) y las monedas igual', txt === `[ticket] ${surv.t1 * 2} &nbsp;<span class="coin"></span> ${surv.coins}` && txt10 === `[ticket10] ${A('evo25').reward.t10 * 2} ×10`, [txt, txt10]);
    t('las definiciones de misiones y logros no cambian', JSON.stringify([G.MissionDefs.daily, G.MissionDefs.weekly, G.AchDefs.LIST].map(l => l.map(d => d.reward))) === defs);
  } catch (e) { t('js/systems/progress.js en node:vm', false, String(e && e.stack || e)); }

  // Avisos de logro y el resultado del gacha: progress.js real (notify/showNext) con un DOM y un reloj de mentira.
  // pull() de gacha-ui.js llama a checkAch() y, en el mismo turno, abre el resultado (#pull-fx).
  try {
    const aviso = ({ mods = {} } = {}) => {
      const reloj = { t: 0, q: [] };
      const els = {};
      const elemento = (id, oculto) => { const cl = new Set(oculto ? ['hidden'] : []); return { id, className: '', innerHTML: '', classList: { add: k => cl.add(k), remove: k => cl.delete(k), contains: k => cl.has(k) }, prepend() {} }; };
      els['pull-fx'] = elemento('pull-fx', true); els['scr-gacha'] = elemento('scr-gacha', true);
      const c = { console, performance: { now: () => reloj.t }, clearTimeout() {},
        setTimeout: (f, ms) => { reloj.q.push({ f, at: reloj.t + (ms || 0) }); return reloj.q.length; } };
      const raiz = elemento('html', false);
      raiz.classList.toggle = (k, si) => (si ? raiz.classList.add(k) : raiz.classList.remove(k));
      c.document = { documentElement: raiz, getElementById: id => els[id] || null, createElement: () => elemento('', false), body: { appendChild: e => { els[e.id] = e; } } };
      vm.createContext(c);
      c.window = c; c.G = {};
      for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/moves.js', 'js/data/types.js',
        'js/data/missions.js', 'js/data/achievements.js', 'js/systems/progress.js']) vm.runInContext(rd(f), c, { filename: f });
      const G = c.G;
      Object.assign(G.MODS, mods);
      Object.assign(G, { Ranking: { periodIds: () => ({ d: 'd1', w: 'w1' }) }, Icons: { html: k => `[${k}]` }, Audio: { sfx() {} }, UI: { spriteCanvas: () => ({}) } });
      const s = { coins: 0, tickets: { t1: 0, t10: 0 }, stats: {}, owned: {}, shiny: {}, created: 1 };
      s.ach = Object.fromEntries(G.AchDefs.LIST.map(a => [a.id, 1]));
      G.DB = { save: s, commit() {} };
      const avanzar = ms => { const fin = reloj.t + ms; for (;;) { reloj.q.sort((a, b) => a.at - b.at); const x = reloj.q[0]; if (!x || x.at > fin) break; reloj.q.shift(); reloj.t = x.at; x.f(); } reloj.t = fin; };
      const visible = () => !!els['ach-pop'] && !els['ach-pop'].classList.contains('hidden');
      const logro = () => { delete s.ach.own1; s.owned[1] = { at: 1, from: 'gacha' }; G.Progress.checkAch(); };
      return { els, avanzar, visible, logro, G, clase: () => raiz.classList.contains('mod-avisos-tras-gacha') };
    };
    // Tirada en la pantalla del gacha: el logro sale con el resultado abierto y espera a «Continuar».
    const A = aviso();
    A.els['scr-gacha'].classList.remove('hidden');
    A.logro(); A.els['pull-fx'].classList.remove('hidden');   // lo que hace pull(): checkAch() y abrir el resultado
    const alTirar = A.visible();
    A.avanzar(6000);
    const conResultado = A.visible();
    A.els['pull-fx'].classList.add('hidden');                  // «Continuar»
    A.avanzar(300);
    const trasContinuar = A.visible();
    A.avanzar(3000);
    const seVa = A.visible();
    // Fuera del gacha (en partida o en el menú), al momento, como el proyecto base.
    const B = aviso();
    B.logro();
    const enMenu = B.visible();
    // avisosTrasGacha = false: como el proyecto base, también con el resultado abierto.
    const O = aviso({ mods: { avisosTrasGacha: false } });
    O.els['scr-gacha'].classList.remove('hidden');
    O.logro(); O.els['pull-fx'].classList.remove('hidden');
    const original = O.visible();
    t('avisos de logro: los de una tirada esperan a que cierres el resultado del gacha (después salen sus 2,8 s); fuera del gacha y con avisosTrasGacha = false, al momento',
      !alTirar && !conResultado && trasContinuar && !seVa && enMenu && original, { alTirar, conResultado, trasContinuar, seVa, enMenu, original });
    // La clase de <html> con la que style.css esconde, con el resultado abierto, un aviso que ya estaba en pantalla.
    t('avisos de logro: <html> lleva mod-avisos-tras-gacha con el ajuste (y no con avisosTrasGacha = false)', A.clase() && B.clase() && !O.clase(), { A: A.clase(), B: B.clase(), O: O.clase() });
  } catch (e) { t('avisos de logro y el gacha', false, String(e && e.stack || e)); }

  // ---- B. Shiny ×shinyMult ----
  /** Azar reproducible (mulberry32). */
  const semilla = s => () => { s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  /** El gacha real (y lo que le haga falta) con Math.random controlado: primero `R.cola`, luego `R.gen`. */
  function gacha(extra = []) {
    const c = { console };
    vm.createContext(c);
    c.window = c; c.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', ...extra, 'js/core/sprites.js', 'js/systems/gacha.js'])
      vm.runInContext(rd(f), c, { filename: f });
    const R = { cola: [], gen: semilla(1) };
    c.__rnd = () => (R.cola.length ? R.cola.shift() : R.gen());
    vm.runInContext('Math.random = () => __rnd()', c);
    return { c, G: c.G, R };
  }
  const trozoDe = (f, re, que) => { const m = rd(f).match(re); if (!m) throw new Error(`no encuentro en ${f}: ${que}`); return m[0]; };
  /** El cartel de probabilidades que pinta el refresh() real de js/ui/gacha-ui.js, con un DOM mínimo. */
  function cartelGacha({ mult = 1.5, evo = true, repetidos = true } = {}) {
    const { c, G } = gacha(evo ? ['js/data/evolutions.js'] : []);
    G.MODS.shinyMult = mult; G.MODS.repetidoDaEvolucion = repetidos;
    const els = {};
    const el = id => els[id] || (els[id] = { id, innerHTML: '', textContent: '', disabled: false, style: {}, classList: { toggle() {}, add() {}, remove() {} }, appendChild() {} });
    G.UI = { $: el, show() {}, stars: () => '*', spriteCanvas: () => ({}), refreshCoins() {} };
    G.Icons = { html: k => `[${k}]` };
    G.DB = { save: { owned: {}, shiny: {}, pity: {}, tickets: { t1: 0, t10: 0 } } };
    c.document = { querySelectorAll: () => [] };
    vm.runInContext(rd('js/ui/gacha-ui.js'), c, { filename: 'js/ui/gacha-ui.js' });
    G.GachaUI.open();
    return els['gacha-rates'].innerHTML;
  }
  try {
    const M = nuevoMods().G.MODS;
    const p = [1 / 4096, 1 / 512, 1 / 100].map(x => M.probShiny(x));
    t('shiny: por defecto ×1,5 (1/4096 -> 1/2731, 1/512 -> 1/341, 1 % -> 1,5 %), nunca más de 1', M.shinyMult === 1.5 && Math.abs(p[0] - 1.5 / 4096) < 1e-15 &&
      Math.abs(p[1] - 1.5 / 512) < 1e-15 && Math.abs(p[2] - 0.015) < 1e-15 && M.probShiny(0.9) === 1, p);
    const raros = [0, -1, NaN, 'x', Infinity].map(v => { M.shinyMult = v; return M.probShiny(0.01); });
    M.shinyMult = 1;
    t('shiny: con un ajuste no válido o con 1, la del proyecto base', raros.every(x => x === 0.01) && M.probShiny(0.01) === 0.01, raros);
    // Gacha real, 100.000 tiradas sembradas en los 9 banners: proporción de shiny entre los que tienen sprite shiny.
    const tasa = (mult, s, n = 100000) => {
      const { G, R } = gacha();
      R.gen = semilla(s); G.MODS.shinyMult = mult;
      const save = { tickets: { t1: n, t10: 0 }, owned: {}, shiny: {}, coins: 0, stats: {}, pity: {} };
      let sh = 0, con = 0;
      for (let i = 0; i < n / 10; i++) for (const x of G.Gacha.pull(save, 10, 1 + (i % 9))) if (G.Sprites.hasShiny(x.dex)) { con++; if (x.shiny) sh++; }
      return +(sh / con * 100).toFixed(3);
    };
    const g15 = tasa(1.5, 7), g1 = tasa(1, 8);
    medidas.push(`gacha ${g15} % (con 1: ${g1} %)`);
    t(`gacha real con shinyMult 1,5: ${g15} % de shiny en 100.000 tiradas (1,35-1,65 %); con 1: ${g1} % (0,85-1,15 %)`, g15 >= 1.35 && g15 <= 1.65 && g1 >= 0.85 && g1 <= 1.15, { g15, g1 });
    // Salvajes y jefes: rollShiny de js/systems/spawner.js, tal cual.
    const fRoll = trozoDe('js/systems/spawner.js', /  function rollShiny\(dex\) \{[\s\S]*?\r?\n  \}\r?\n/, 'rollShiny');
    const fRate = trozoDe('js/systems/spawner.js', /const SHINY_RATE = [^;\n]+;/, 'SHINY_RATE');
    const salvaje = (mult, s, n) => {
      const { c, G, R } = gacha();
      R.gen = semilla(s); G.MODS.shinyMult = mult; G.Sprites.hasShiny = () => true;
      vm.runInContext(`var __roll = (() => { let forceShiny = 0; ${fRate}\n${fRoll}\n return rollShiny; })();`, c, { filename: 'js/systems/spawner.js (rollShiny)' });
      let k = 0;
      for (let i = 0; i < n; i++) if (c.__roll(1)) k++;
      return +(k / n * 4096).toFixed(3);
    };
    const s15 = salvaje(1.5, 11, 2e6), s1 = salvaje(1, 12, 2e6);
    medidas.push(`salvajes ×${s15} (con 1: ×${s1})`);
    t(`salvajes y jefes (rollShiny real): ${s15} veces 1/4096 con 1,5 (1,35-1,65); con 1, ${s1} (0,85-1,15)`, s15 >= 1.35 && s15 <= 1.65 && s1 >= 0.85 && s1 <= 1.15, { s15, s1 });
    // Legendario de la grieta: la línea de start() en js/systems/rift.js, tal cual.
    const fLeg = trozoDe('js/systems/rift.js', /dex: mon\.dex, shiny: G\.Sprites\.hasShiny\(mon\.dex\) && Math\.random\(\) < [^\n]*?,(?=\s*\/\/)/, 'el shiny del legendario');
    const grieta = (mult, s, n) => {
      const { c, G, R } = gacha();
      R.gen = semilla(s); G.MODS.shinyMult = mult; G.Sprites.hasShiny = () => true;
      vm.runInContext(`var __leg = mon => ({ ${fLeg} });`, c, { filename: 'js/systems/rift.js (start)' });
      let k = 0;
      for (let i = 0; i < n; i++) if (c.__leg({ dex: 150 }).shiny) k++;
      return +(k / n * 512).toFixed(3);
    };
    const r15 = grieta(1.5, 21, 4e5), r1 = grieta(1, 22, 4e5);
    medidas.push(`grieta ×${r15} (con 1: ×${r1})`);
    t(`legendario de la grieta (start() real): ${r15} veces 1/512 con 1,5 (1,35-1,65); con 1, ${r1} (0,85-1,15)`, r15 >= 1.35 && r15 <= 1.65 && r1 >= 0.85 && r1 <= 1.15, { r15, r1 });
    // Cartel del gacha: refresh() real de js/ui/gacha-ui.js con un DOM mínimo.
    const c15 = cartelGacha({ mult: 1.5 }), c1 = cartelGacha({ mult: 1 });
    t('cartel del gacha (refresh() real): «1.5%» de shiny con 1,5 y «1%» con 1, como el proyecto base', /\[shiny\] Shiny<\/span><span>1\.5%<\/span>/.test(c15) && !c15.includes('<span>1%</span>') &&
      /\[shiny\] Shiny<\/span><span>1%<\/span>/.test(c1), c15.slice(c15.indexOf('[shiny]'), c15.indexOf('[shiny]') + 60));
  } catch (e) { t('shiny con el código real', false, String(e && e.stack || e)); }

  // ---- B2. Regalo «buen humor» (22-10-2026): 10 tickets ×10 una vez, y shiny ×3 sólo en las tiradas que pagan ----
  try {
    const { G } = gacha(['js/data/multiverso.js']);
    const M = G.MODS, rg = M.regaloBuenHumor;
    t('regalo: probShiny con el regalo es ×3 sobre el ×1,5 (1 % → 4,5 %) y sin él, igual que antes',
      Math.abs(M.probShiny(0.01, true) - 0.045) < 1e-12 && Math.abs(M.probShiny(0.01) - 0.015) < 1e-12 && M.probShiny(0.5, true) === 1, [M.probShiny(0.01, true), M.probShiny(0.01)]);
    const nueva = () => ({ owned: {}, shiny: {}, pity: {}, stats: {}, coins: 0, tickets: { t1: 30, t10: 2 } });
    const s = nueva(), d1 = M.darRegalo(s), d2 = M.darRegalo(s);
    t('regalo: da 10 tickets ×10, 20.000 Pokémonedas y su cuenta de shiny una vez, y lo apunta; la segunda vez, nada',
      d1 && !d2 && rg.t10 === 10 && rg.coins === 20000 && s.coins === 20000 && s.tickets.t10 === 12 && s.tickets.t1 === 30 && s.regaloShiny === 10 && s.regalos[rg.id] > 0 && /buen humor/.test(rg.texto), { d1, d2, s: s.tickets, r: s.regaloShiny });
    // Qué tiradas piden el shiny del regalo: se apunta el segundo argumento de cada probShiny().
    const pide = [], orig = M.probShiny;
    M.probShiny = function (p, regalo) { pide.push(!!regalo); return orig.call(this, p, regalo); };
    const tira = (sv, n, gen, use) => { pide.length = 0; const r = G.Gacha.pull(sv, n, gen, use); return { ok: !!r, con: pide.filter(x => x).length, sin: pide.filter(x => !x).length }; };
    const a = nueva(); a.regaloShiny = 1;
    const x1 = tira(a, 1, 1, 't1'), x10 = tira(a, 10, 1, 't10'), x10b = tira(a, 10, 1, 't10');
    t('regalo: con tickets normales no se gasta; la ×10 con un ticket ×10 del regalo va entera con shiny ×3 y la siguiente, ya sin regalo, normal',
      x1.ok && x1.con === 0 && x10.ok && x10.con > 0 && x10.sin === 0 && x10b.ok && x10b.con === 0 && x10b.sin > 0 && a.regaloShiny === 0 && a.tickets.t10 === 0, { x1, x10, x10b, r: a.regaloShiny });
    // Multiverso (cada tirada, un ticket ×10): con 3 del regalo, sólo las 3 primeras de una ×10.
    const b = nueva(); b.tickets.t10 = 10; b.regaloShiny = 3;
    const mv = M.multiversoTicketLila ? tira(b, 10, G.MULTIVERSO.GEN, 't1') : null;
    t('regalo: en el Multiverso, con 3 tickets del regalo, sólo las 3 primeras tiradas de una ×10 llevan el shiny ×3',
      !mv || (mv.ok && mv.con === 3 && mv.sin === 7 && b.regaloShiny === 0 && b.tickets.t10 === 0), mv);
    M.probShiny = orig;
    M.regaloBuenHumor = null;
    t('regalo: con regaloBuenHumor = null no se da nada y el shiny es el de siempre', !M.darRegalo(nueva()) && Math.abs(M.probShiny(0.01, true) - 0.015) < 1e-12);
  } catch (e) { t('regalo «buen humor» con el gacha real', false, String(e && e.stack || e)); }

  // ---- C. Repetido -> su evolución (js/data/evolutions.js y pull() real con las tiradas guionizadas) ----
  try {
    const { G } = gacha(['js/data/evolutions.js']);
    const E = G.EVO, enJuego = d => !!(G.DEX_BY[d] && G.SPRITE_META[d]);
    const padres = Object.keys(E).map(Number), hijos = padres.flatMap(p => E[p]);
    const malos = padres.filter(p => !enJuego(p) || !Array.isArray(E[p]) || !E[p].length || E[p].some(h => !enJuego(h) || h === p) || new Set(E[p]).size !== E[p].length);
    let ciclo = null;
    for (const p of padres) {
      const pila = [[p, [p]]];
      while (pila.length && !ciclo) { const [n, cam] = pila.pop(); for (const h of E[n] || []) { if (cam.includes(h)) ciclo = [...cam, h]; else pila.push([h, [...cam, h]]); } }
    }
    const conDosPadres = hijos.filter((h, i) => hijos.indexOf(h) !== i);
    t(`evolutions.js: ${padres.length} especies con evolución y ${hijos.length} evoluciones, todas del juego (G.DEX_BY con G.SPRITE_META), sin ciclos ni hijos con dos padres`,
      padres.length > 400 && !malos.length && !ciclo && !conDosPadres.length, { malos, ciclo, conDosPadres });
    t('evolutions.js: Eevee con sus 8, Tyrogue con 3, Pidove -> Unfezant (sin Tranquill, que no está en el juego) y Meowth -> Persian y Perrserker (forma regional)',
      E[133].join() === '134,135,136,196,197,470,471,700' && E[236].join() === '106,107,237' && E[519].join() === '521' && !enJuego(520) && E[52].join() === '53,863',
      { 133: E[133], 236: E[236], 519: E[519], 52: E[52] });
  } catch (e) { t('datos de js/data/evolutions.js', false, String(e && e.stack || e)); }
  try {
    const { G, R } = gacha(['js/data/evolutions.js']);
    const RE = G.Gacha.REFUND;
    // Valores de Math.random para que la tirada sea `dex` (normal o shiny) en su banner y, si hay que elegir rama, `rama`.
    const BANDA = [0, 45, 75, 92, 98.5, 100];
    const guion = (dex, shiny = false, rama) => {
      const p = G.DEX_BY[dex], lista = G.Gacha.pool(p.rarity, p.gen), i = lista.findIndex(x => x.dex === dex);
      if (i < 0) throw new Error('no está en su banner: ' + dex);
      const v = [(BANDA[p.rarity - 1] + BANDA[p.rarity]) / 200, (i + 0.5) / lista.length];
      if (G.Sprites.hasShiny(dex)) v.push(shiny ? 0 : 0.999);
      if (rama !== undefined) v.push(rama);
      return v;
    };
    const partida = (owned = [], shinies = [], coins = 1000) => ({ coins, tickets: { t1: 500, t10: 0 }, stats: {}, pity: {},
      owned: Object.fromEntries(owned.map(d => [d, { at: 1, from: 'gacha' }])), shiny: Object.fromEntries(shinies.map(d => [d, { at: 1, from: 'gacha' }])) });
    /** Tira `n` en el banner del primero, con el guion de cada [dex, shiny?, rama?]; falla si sobra algún valor del guion. */
    const tira = (save, dexes, n = dexes.length) => {
      R.cola = dexes.flatMap(x => guion(...x));
      const res = G.Gacha.pull(save, n, G.DEX_BY[dexes[0][0]].gen);
      const sobran = R.cola.length;
      R.cola = [];
      if (sobran) throw new Error(`sobran ${sobran} valores del guion`);
      return res;
    };
    const res1 = (s, ...x) => tira(s, [x])[0];
    t('por defecto: repetidoDaEvolucion = true', G.MODS.repetidoDaEvolucion === true);
    // Bulbasaur repetido.
    let s = partida([1]);
    let x = res1(s, 1);
    t('repetido de Bulbasaur sin Ivysaur: desbloquea Ivysaur (from evo), 0 monedas, gasta su ticket',
      x.dex === 1 && !x.isNew && x.evo === 2 && x.refund === 0 && s.coins === 1000 && s.owned[2] && s.owned[2].from === 'evo' && s.tickets.t1 === 499 && !s.shiny[2], x);
    x = res1(s, 1);
    t(`repetido de Bulbasaur con Ivysaur: las monedas del proyecto base (${RE[1]}) y no desbloquea Venusaur`, !x.evo && x.refund === RE[1] && s.coins === 1000 + RE[1] && !s.owned[3], x);
    // Eevee: 8 repetidos -> sus 8 evoluciones, cada una entre las que faltan; el noveno, monedas.
    s = partida([133]);
    const vistas = [];
    let soloFaltan = true;
    for (const v of [0, 0.999, 0.5, 0.3, 0.999, 0, 0.7, 0.2]) {
      const antes = new Set(Object.keys(s.owned).map(Number));
      const quedan = G.EVO[133].filter(d => !s.owned[d]).length;   // con una sola, no se sortea
      const y = tira(s, [quedan > 1 ? [133, false, v] : [133]])[0];
      if (!y.evo || antes.has(y.evo) || !G.EVO[133].includes(y.evo)) soloFaltan = false;
      vistas.push(y.evo);
    }
    const y9 = res1(s, 133), ER = G.DEX_BY[133].rarity;
    t('Eevee: 8 repetidos dan sus 8 evoluciones distintas, cada una de las que faltaban; el noveno da monedas', soloFaltan && new Set(vistas).size === 8 &&
      vistas.slice().sort((a, b) => a - b).join() === G.EVO[133].join() && !y9.evo && y9.refund === RE[ER] && vistas.every(d => s.owned[d].from === 'evo'), { vistas, noveno: y9 });
    // Shiny.
    s = partida([1], [1]);
    x = res1(s, 1, true);
    t('shiny repetido (ya tenías el shiny de Bulbasaur): desbloquea Ivysaur en shiny (y en normal), 0 monedas', x.shiny && !x.isNew && x.evo === 2 && x.refund === 0 &&
      s.shiny[2] && s.shiny[2].from === 'evo' && s.owned[2] && s.owned[2].from === 'evo' && s.coins === 1000, x);
    s = partida([1, 2], [1]);
    x = res1(s, 1, true);
    t('shiny repetido con Ivysaur normal pero sin su shiny: da el shiny de Ivysaur (la normal se queda como estaba)', x.evo === 2 && s.shiny[2].from === 'evo' && s.owned[2].from === 'gacha', x);
    s = partida([1, 2], [1, 2]);
    x = res1(s, 1, true);
    t(`shiny repetido con el shiny de Ivysaur: el triple del proyecto base (${RE[1] * 3}) y nada de Venusaur`, !x.evo && x.refund === RE[1] * 3 && !s.owned[3] && !s.shiny[3], x);
    s = partida([1]);
    x = res1(s, 1, true);
    t('shiny NUEVO de Bulbasaur con la normal ya tenida: es nuevo (no repetido), sin evolución ni monedas', x.shiny && x.isNew && !x.evo && x.refund === 0 && s.shiny[1].from === 'gacha' && !s.owned[2], x);
    // Evolución sin sprite shiny (Skwovet -> Greedent): el shiny repetido no se rebaja a un desbloqueo normal.
    const sinSh = [...new Set(Object.values(G.EVO).flat())].filter(d => !G.Sprites.hasShiny(d)).sort((a, b) => a - b);
    s = partida([819], [819]);
    x = res1(s, 819, true);
    const sN = partida([819]), xN = res1(sN, 819);
    t(`evoluciones sin sprite shiny (${sinSh.join(', ')}): un shiny repetido de Skwovet da el triple; uno normal sí desbloquea Greedent`,
      sinSh.join() === '820,847,916,933' && G.Sprites.hasShiny(819) && !x.evo && x.refund === RE[G.DEX_BY[819].rarity] * 3 && !s.owned[820] && xN.evo === 820 && !sN.shiny[820], { x, xN });
    // Orden en la ×10: lo desbloqueado en una tirada cuenta para las siguientes. Con el mod apagado, mismas rarezas y mismo pity.
    const seq = [[1], [1], [2], [3], [4], [5], [7], [7], [133], [133, false, 0.5]];
    const orden = on => {
      G.MODS.repetidoDaEvolucion = on;
      const sv = partida([1, 4]), res = tira(sv, on ? seq : seq.map(z => z.slice(0, 2)), 10);
      G.MODS.repetidoDaEvolucion = true;
      return { sv, res };
    };
    const A = orden(true), B = orden(false);
    const resumen = A.res.map(z => (z.isNew ? 'nuevo' : z.evo ? 'evo' + z.evo : '+' + z.refund));
    t('×10 en orden: Bulbasaur -> Ivysaur, Bulbasaur otra vez -> monedas, Ivysaur (desbloqueado en esta ×10) -> Venusaur, Venusaur -> monedas...; pity y rarezas como sin el mod',
      resumen.slice(0, 9).join() === `evo2,+${RE[1]},evo3,+${RE[G.DEX_BY[3].rarity]},evo5,evo6,nuevo,evo8,nuevo` && G.EVO[133].includes(A.res[9].evo) &&
      A.sv.pity[1] === 10 && B.sv.pity[1] === 10 && A.res.map(z => z.rarity).join() === B.res.map(z => z.rarity).join() && A.sv.stats.pulls === 10 &&
      B.res.every(z => !z.evo) && A.sv.coins === 1000 + RE[1] + RE[G.DEX_BY[3].rarity] && B.sv.coins === 1000 + B.res.reduce((k, z) => k + z.refund, 0),
      { resumen, sinMod: B.res.map(z => (z.isNew ? 'nuevo' : '+' + z.refund)) });
    // Ramas sólo entre las que faltan y nada fuera del juego (520, Tranquill, no está; 99999 no existe).
    const E1 = G.EVO[1];
    G.EVO[1] = [520, 2, 99999];
    const fuera = [0, 0.3, 0.6, 0.9999999].map(v => { R.cola = [v]; const d = G.MODS.evolucionDeRepetido(partida([1]), 1, false); R.cola = []; return d; });
    G.EVO[1] = E1;
    const tyro = [0, 0.5, 0.999].map(v => { R.cola = [v]; const d = G.MODS.evolucionDeRepetido(partida([236, 106, 237]), 236, false); R.cola = []; return d; });
    t('ramas: sólo entre las que faltan (Tyrogue con Hitmonlee y Hitmontop: siempre Hitmonchan) y nunca una especie que no está en el juego',
      fuera.every(d => d === 2) && tyro.every(d => d === 107), { fuera, tyro });
    // Sin G.EVO o con el ajuste en false: el proyecto base.
    const EVO = G.EVO;
    delete G.EVO;
    s = partida([1]); x = res1(s, 1);
    G.EVO = EVO; G.MODS.repetidoDaEvolucion = false;
    const s2 = partida([1]), x2 = res1(s2, 1);
    G.MODS.repetidoDaEvolucion = true;
    t('sin js/data/evolutions.js (G.EVO) o con repetidoDaEvolucion = false: monedas como el proyecto base', !x.evo && x.refund === RE[1] && !s.owned[2] && !x2.evo && x2.refund === RE[1] && !s2.owned[2]);
  } catch (e) { t('pull() real con las evoluciones', false, String(e && e.stack || e)); }
  // La carta, el inglés y el cartel.
  try {
    const { c, G } = gacha(['js/data/evolutions.js']);
    c.document = { createElement: tag => ({ tag, className: '', textContent: '' }) };
    G.UI = { spriteCanvas: (dex, w, h, o) => ({ tag: 'canvas', dex, w, h, o, style: {} }) };
    const carta = () => { const tag = { textContent: 'Repetido · +0', hijos: [], appendChild(n) { this.hijos.push(n); } }; return { tag, querySelector: q => (q === '.tag' ? tag : null) }; };
    const k1 = carta(), k2 = carta();
    G.MODS.marcarEvolucion(k1, { dex: 1, evo: 2, shiny: false });
    G.MODS.marcarEvolucion(k2, { dex: 439, evo: 122, shiny: true });
    const [a, b] = [k1.tag.hijos, k2.tag.hijos];
    t('carta: «¡Repetido! Desbloqueas Ivysaur» (y «… Mr. Mime shiny») en dorado y la evolución en pequeño (40x40, shiny si lo es)',
      k1.tag.textContent === '' && a.length === 2 && a[0].className === 'new' && a[0].textContent === '¡Repetido! Desbloqueas Ivysaur' && a[1].dex === 2 && a[1].w === 40 &&
      a[1].o.shiny === false && /width:40px/.test(a[1].style.cssText) && b[0].textContent === '¡Repetido! Desbloqueas Mr. Mime shiny' && b[1].o.shiny === true, [a, b]);
    const en = ['¡Repetido! Desbloqueas Ivysaur', '¡Repetido! Desbloqueas Mr. Mime shiny', G.MODS.NOTA_REPETIDOS].map(EN);
    t('inglés (i18n.js real): «Duplicate! You unlock Ivysaur», «… shiny Mr. Mime» y la nota del cartel', en[0] === 'Duplicate! You unlock Ivysaur' &&
      en[1] === 'Duplicate! You unlock shiny Mr. Mime' && /^· A duplicate unlocks its next evolution/.test(en[2]), en);
    const VIEJA = '· Los repetidos dan Pokémonedas (los shiny repetidos, el triple).';
    const h1 = cartelGacha(), h2 = cartelGacha({ repetidos: false }), h3 = cartelGacha({ evo: false });
    t('cartel del gacha (refresh() real): la nota de los repetidos habla de la evolución; con el ajuste en false o sin G.EVO, la del proyecto base',
      h1.includes(G.MODS.NOTA_REPETIDOS) && !h1.includes(VIEJA) && h2.includes(VIEJA) && h3.includes(VIEJA) && !h3.includes(G.MODS.NOTA_REPETIDOS));
  } catch (e) { t('la carta y el cartel del gacha', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`gacha y tickets: ${r.length} casos bien` + (medidas.length ? ` (shiny: ${medidas.join(', ')})` : ''));
  for (const [name, , detail] of failed) bad(`gacha: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 11. claridad en partida ----------------
function claridadChecks() {
  console.log('11. Claridad en partida (js/entities/claridad.js con fx.js, enemy.js y mods.js reales)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** El juego mínimo: util.js, mods.js, fx.js, enemy.js y claridad.js reales; sprites, ajustes y red, de mentira. */
  function mundo({ numeros = true, fx = 2, calm = false, mods = {} } = {}) {
    const S = { reloj: 1000, ajustes: { dmgNumbers: numeros, calm }, red: [], dibujados: [] };
    // Un document mínimo: sus lienzos pintan (tinte del contorno) pero no se pueden leer.
    const document = { createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage() {}, fillRect() {} }) }) };
    const c = { console, document, performance: { now: () => S.reloj } };
    vm.createContext(c);
    c.window = c; c.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js']) vm.runInContext(rd(f), c, { filename: f });
    const G = c.G;
    Object.assign(G.MODS, mods);
    G.Sprites = { PX: 2, bodyRadius: () => 10, bodyHeight: () => 30, hovers: () => false, drawShadow() {}, white: img => img,
      Animator: class { constructor(dex, scale) { this.dex = dex; this.scale = scale; this.cur = 'Idle'; this.frame = 0; this.dir = 0; }
        busy() { return false; } play() {} loop() {} update() {} draw(ctx, x, y, o) { S.dibujados.push({ x, y, o }); } },
      // Geometría de un fotograma de 40x40 con los pies en (20, 30); la imagen no se puede leer en node (sin document):
      // claridad.js usa entonces la caja del cuerpo (radio y alto), como con el juego abierto con file://.
      animMeta: () => ({ w: 40, h: 40, ax: 20, ay: 30, n: 1, r: 8 }), sheet: () => S.hoja || (S.hoja = { ready: true, img: { width: 40, height: 320 } }) };
    G.Settings = { get: k => S.ajustes[k], get fx() { return fx; } };
    G.Audio = { sfx() {} };
    G.Coop = { isHost: false, active: false, hit: (...a) => S.red.push(a), puppets: () => [] };
    G.DEX_BY = {}; G.Events = { golden: false }; G.Icons = { draw() {} };
    G.Game = { player: { x: 0, y: 0, hp: 100, maxHp: 100, r: 10, bodyH: 30 } };
    for (const f of ['js/entities/fx.js', 'js/entities/enemy.js', 'js/entities/claridad.js']) vm.runInContext(rd(f), c, { filename: f });
    const enemigo = (o = {}) => {
      const e = new G.Enemy({ dex: 1, name: 'Prueba', hp: o.hp || 1000, spd: 1, dmg: 1, xp: 1, behavior: o.behavior || 'charger' }, o.x || 0, o.y || 0, { hp: 1, spd: 1, dmg: 1 }, !!o.boss);
      if (o.remote) { e.remote = true; e.net = { st: 0 }; }
      G.EnemyMgr.add(e);
      return e;
    };
    return { c, G, S, C: G.Claridad, enemigo };
  }
  /** Un lienzo de mentira que apunta lo que se pinta. */
  function lienzo() {
    const L = { textos: [], rects: [], imgs: [], elipses: [], lineas: 0, fillStyle: '', strokeStyle: '', font: '', lineWidth: 1, globalAlpha: 1, textAlign: 'start' };
    const nop = () => {};
    return new Proxy(L, {
      get(o, k) {
        if (k in o) return o[k];
        if (k === 'fillText') return (s, x, y) => o.textos.push({ s: String(s), color: o.fillStyle, font: o.font, borde: o.lineWidth, alinea: o.textAlign, x, y });
        // Ancho de una letra de tamaño N: 0,6·N (como Pixelify en negrita, más o menos).
        if (k === 'measureText') return s => { const m = /(\d+(?:\.\d+)?)px/.exec(o.font || ''); return { width: String(s).length * 0.6 * (m ? +m[1] : 10) }; };
        if (k === 'fillRect') return (x, y, w, h) => o.rects.push({ x, y, w, h, color: o.fillStyle });
        if (k === 'drawImage') return (...a) => o.imgs.push(a);
        if (k === 'ellipse') return (...a) => o.elipses.push({ a, color: o.strokeStyle });
        if (k === 'moveTo') return () => { o.lineas++; };
        if (k === 'createRadialGradient') return () => ({ addColorStop: (p, col) => o.rects.push({ parada: p, color: col }) });
        return nop;
      },
      set(o, k, v) { o[k] = v; return true; }
    });
  }
  const digitos = L => L.textos.filter(x => /^\d+$/.test(x.s));

  // ---- A. Números de daño: uno por enemigo mientras vive ----
  try {
    const W = mundo(), { G, C } = W;
    const e1 = W.enemigo(), e2 = W.enemigo({ x: 200 });
    e1.hurt(10); e1.hurt(12); e1.hurt(8);
    let n = C.numeros, L = lienzo();
    G.FX.draw(L);
    t('tres golpes al mismo enemigo (por su id): un único número con la suma (30), en el hueco de fx.js', n.length === 1 && n[0].id === e1.id && n[0].suma === 30 &&
      n[0].golpes === 3 && !n[0].suelto && digitos(L).length === 1 && digitos(L)[0].s === '30', { n, textos: L.textos });
    t('tamaño 11 (con el saltito de cada golpe, más) y contorno de 2', /^700 1[1-5]px Pixelify/.test(digitos(L)[0].font) && digitos(L)[0].borde === 2, digitos(L)[0]);
    e2.hurt(5);
    e2.shield = 100; e2.shieldT = 8;
    e2.hurt(20); e2.hurt(20);
    n = C.numeros;
    const n2 = n.find(x => x.id === e2.id && !x.escudo), esc = n.find(x => x.escudo);
    t('otro enemigo, otro número; los del escudo (azules), aparte del suyo', n.length === 3 && n2 && n2.suma === 5 && esc && esc.id === e2.id && esc.suma === 40 &&
      esc.clave === e2.id + ':e' && esc.color === '#9fd8ff', n);
    e1.hurt(10, '#fff', 0, 0, 0, 'super');
    const s1 = C.numeros.find(x => x.id === e1.id);
    t('un «muy eficaz» tiñe el número de amarillo y lo hace grande', s1.suma === 40 && s1.color === '#ffe14d' && s1.big, s1);
    G.FX.update(0.2);
    L = lienzo(); G.FX.draw(L);
    const f16 = digitos(L).find(x => x.s === '40');
    t('grande, ya sin el saltito: 16', f16 && /^700 16px/.test(f16.font), f16);
    G.FX.update(0.3);
    e1.hurt(1);
    const r1 = C.numeros.find(x => x.id === e1.id);
    G.FX.update(0.9);
    const vivo = C.numeros.find(x => x.id === e1.id);
    G.FX.update(0.15);
    const suelto = C.numeros.find(x => x.id === e1.id);
    t('se renueva mientras recibe (0,5 s después suma al mismo) y tras ~1 s sin golpes se suelta', r1.suma === 41 && r1.golpes === 5 && !vivo.suelto && suelto.suelto,
      { r1, vivo, suelto });
    const y0 = suelto.y;
    G.FX.update(0.1);
    const y1 = C.numeros.find(x => x.id === e1.id).y;
    e1.hurt(3);
    const nuevo = C.numeros.filter(x => x.id === e1.id && !x.escudo);
    t('suelto, sube; un golpe nuevo empieza otro número', y1 < y0 && nuevo.length === 2 && nuevo.some(x => !x.suelto && x.suma === 3), { y0, y1, nuevo });
    for (let i = 0; i < 12; i++) G.FX.update(0.1);
    t('el suelto se desvanece (los grandes, en 0,95 s)', !C.numeros.some(x => x.id === e1.id && x.suma === 41));
    e2.dead = true;
    G.FX.update(0.016);
    t('al caer el enemigo, sus números se sueltan', C.numeros.filter(x => x.id === e2.id).every(x => x.suelto));
    // Invitado: golpes suyos a una copia (hurt, remote) y los del anfitrión ('hn' -> showHurt), juntos.
    const e3 = W.enemigo({ remote: true });
    e3.hurt(4); e3.hurt(4); e3.showHurt(7, '#fff');
    const g3 = C.numeros.find(x => x.id === e3.id);
    t('invitado: sus golpes a una copia (los manda al anfitrión) y los que anuncia el anfitrión, en un único número', W.S.red.length === 2 && g3 && g3.suma === 15 && g3.golpes === 3, g3);
  } catch (e) { t('números agrupados', false, String(e && e.stack || e)); }
  // El número del escudo, a la derecha del de su enemigo sin tocarlo (con 4 cifras grandes y su saltito, también al soltarse).
  try {
    const W = mundo(), { G, C } = W, e = W.enemigo({ boss: true, hp: 1e6 });
    const AZUL = '#9fd8ff';
    const medir = () => {
      const L = lienzo(); G.FX.draw(L);
      const d = digitos(L), s = d.find(x => x.color === AZUL), p = d.find(x => x.color !== AZUL);
      if (!p || !s) return { p, s };
      const tam = +/(\d+)px/.exec(p.font)[1], borde = p.x + p.s.length * 0.6 * tam / 2;   // borde derecho del número de los golpes
      return { hueco: +(s.x - borde).toFixed(2), golpes: p.s, escudo: s.s, alineaGolpes: p.alinea, alineaEscudo: s.alinea, tam };
    };
    e.hurt(1060, '#fff', 0, 0, 0, 'super');
    e.shield = 1000; e.shieldT = 8; e.hurt(172);
    const conSalto = medir();
    G.FX.update(0.3);
    const quieto = medir();
    // Sin más golpes al escudo, el suyo se suelta (1 s) mientras el jefe sigue recibiendo: sube desde donde estaba.
    e.shield = 0;
    for (let i = 0; i < 6; i++) { e.hurt(1); G.FX.update(0.15); medir(); }
    const esc = C.numeros.find(x => x.escudo), suelto = medir();
    // Un escudo que lo absorbe todo (sin número de golpes), su número se suelta y el jefe estrena número debajo.
    const W2 = mundo(), e2 = W2.enemigo({ boss: true, hp: 1e6 });
    e2.shield = 1000; e2.shieldT = 8; e2.hurt(172);
    W2.G.FX.draw(lienzo()); W2.G.FX.update(1.05);
    e2.shield = 0; e2.hurt(1060, '#fff', 0, 0, 0, 'super');
    const L2 = lienzo(); W2.G.FX.draw(L2);
    const d2 = digitos(L2), s2 = d2.find(x => x.color === AZUL), p2 = d2.find(x => x.color !== AZUL);
    const estrena = s2 && p2 ? +(s2.x - (p2.x + p2.s.length * 0.6 * +/(\d+)px/.exec(p2.font)[1] / 2)).toFixed(2) : null;
    t('escudo: su número a la derecha del de los golpes, sin tocarlo (1060 grande y 172; con el saltito, quieto, al soltarse y si el jefe estrena número con el del escudo ya suelto)',
      conSalto.hueco >= 3 && quieto.hueco >= 3 && suelto.hueco >= 3 && esc && esc.suelto && estrena >= 3 && W2.C.numeros.find(x => x.escudo).suelto &&
      conSalto.tam > quieto.tam && quieto.alineaGolpes === 'center' && quieto.alineaEscudo === 'left', { conSalto, quieto, suelto, escSuelto: esc && esc.suelto, estrena });
    // El de los golpes se suelta (sin más golpes) mientras el escudo sigue absorbiendo: el azul no lo pisa mientras
    // sube (casi a su altura) ni salta hacia el centro cuando se desvanece.
    const W3 = mundo(), e3 = W3.enemigo({ boss: true, hp: 1e6 });
    e3.hurt(1060, '#fff', 0, 0, 0, 'super');
    e3.shield = 1e6; e3.shieldT = 99; e3.hurt(172);
    const huecos = [], dxs = [];
    let vioSuelto = false, sueltoT = -1;
    for (let i = 0; i < 18; i++) {
      e3.hurt(40); W3.G.FX.update(0.15);
      const L3 = lienzo(); W3.G.FX.draw(L3);
      const d3 = digitos(L3), s3 = d3.find(x => x.color === AZUL), p3 = d3.find(x => x.color !== AZUL);
      const n3 = W3.C.numeros.find(x => !x.escudo);
      if (n3 && n3.suelto && !vioSuelto) { vioSuelto = true; sueltoT = i; }
      if (s3 && p3) huecos.push(+(s3.x - (p3.x + p3.s.length * 0.6 * +/(\d+)px/.exec(p3.font)[1] / 2)).toFixed(2));
      if (s3 && vioSuelto) dxs.push(+(s3.x - e3.x).toFixed(2));
    }
    const desaparece = !W3.C.numeros.some(x => !x.escudo), escVivo = W3.C.numeros.find(x => x.escudo);
    t('escudo: si el de los golpes se suelta mientras el escudo sigue absorbiendo, el azul se queda a su derecha sin tocarlo mientras sube y, al desvanecerse, no salta',
      vioSuelto && desaparece && escVivo && !escVivo.suelto && huecos.length > 8 && Math.min(...huecos) >= 3 && dxs.length > 4 && dxs.every(d => Math.abs(d - dxs[0]) < 0.01),
      { sueltoT, huecos, dxs });
  } catch (e) { t('escudo al lado del número', false, String(e && e.stack || e)); }
  // La subida al soltarse no depende de los FPS (fx.js frena ×0,94 por fotograma: a 144 FPS sube la mitad que a 30).
  try {
    const subida = dt => {
      const W = mundo(), e = W.enemigo();
      e.hurt(10);
      W.G.FX.update(1.05);
      const y0 = W.C.numeros[0].y;
      for (let k = 0; k < Math.round(0.5 / dt); k++) W.G.FX.update(dt);
      return y0 - W.C.numeros[0].y;
    };
    const a = subida(1 / 30), b = subida(1 / 144);
    t('frenado de la subida independiente de los FPS (0,5 s a 30 y a 144 FPS)', a > 8 && Math.abs(a - b) < 1, { a30: +a.toFixed(2), a144: +b.toFixed(2) });
  } catch (e) { t('subida independiente de los FPS', false, String(e && e.stack || e)); }
  // Ajustes: sin números de daño, nada; con numerosAgrupados = false, como el proyecto base (uno por golpe).
  try {
    const sin = mundo({ numeros: false }), e = sin.enemigo();
    e.hurt(10); e.hurt(10);
    const L1 = lienzo(); sin.G.FX.draw(L1);
    const orig = mundo({ mods: { numerosAgrupados: false } }), o = orig.enemigo();
    o.hurt(10); o.hurt(11); o.hurt(12);
    const L2 = lienzo(); orig.G.FX.draw(L2);
    t('Ajustes > Números de daño apagado: ningún número; numerosAgrupados = false: uno por golpe (13 px, contorno 3)',
      !sin.C.numeros.length && !digitos(L1).length && !orig.C.numeros.length && digitos(L2).length === 3 && /^700 13px/.test(digitos(L2)[0].font), digitos(L2));
    const tope = mundo({ fx: 0 });
    for (let i = 0; i < 30; i++) tope.enemigo({ x: i * 40 }).hurt(5);
    t('calidad baja: como mucho 25 números a la vez (los topes de fx.js)', tope.C.numeros.length === 25, tope.C.numeros.length);
  } catch (e) { t('ajustes de los números', false, String(e && e.stack || e)); }

  // ---- B. Barras de vida sólo tras un golpe reciente (enemy.js draw real) ----
  try {
    const W = mundo(), { G, S } = W;
    const barra = e => { const L = lienzo(); e.draw(L); return L.rects.some(x => x.color === '#ff5f6d' || x.color === '#ffcb3d'); };
    const e = W.enemigo();
    const b0 = barra(e);
    e.hurt(10);
    const b1 = barra(e);
    S.reloj += 1400; const b2 = barra(e);
    S.reloj += 200; const b3 = barra(e);
    e.hurt(5); const b4 = barra(e);
    t('enemigo normal: sin barra entero; con el golpe, 1,5 s y se esconde; otro golpe, otra vez', !b0 && b1 && b2 && !b3 && b4, { b0, b1, b2, b3, b4 });
    S.reloj += 5000;
    const casos = { jefe: W.enemigo({ boss: true }), escudo: W.enemigo({ behavior: 'shielder' }), invocador: W.enemigo({ behavior: 'summoner' }),
      curandero: W.enemigo({ behavior: 'healer' }), duende: W.enemigo({ behavior: 'thief' }), shiny: W.enemigo(), legendario: W.enemigo() };
    casos.shiny.shiny = true; casos.legendario.legend = true;
    const siempre = {};
    for (const [k, x] of Object.entries(casos)) { if (k !== 'jefe') x.hp -= 100; barra(x); S.reloj += 3000; siempre[k] = barra(x); }
    t('jefes, legendarios, shiny, duendes del tesoro y apoyos (escudo, invocador, curandero) la conservan', Object.values(siempre).every(Boolean), siempre);
    const h = W.enemigo(); h.hp -= 50; barra(h); S.reloj += 3000;
    G.MODS.barrasTrasGolpe = 0; const orig = barra(h); G.MODS.barrasTrasGolpe = 1.5;
    t('barrasTrasGolpe = 0: como el proyecto base (siempre que esté herido)', orig && !barra(h));
    // Invitado: la vida le llega por red (la línea de coop.js con la ventana de mods.js).
    const cp = W.enemigo({ remote: true });
    barra(cp);
    cp.hp = G.MODS.vidaDelAnfitrion(cp, 700);
    const r1 = barra(cp);
    S.reloj += 1600; cp.hp = G.MODS.vidaDelAnfitrion(cp, 700);
    const r2 = barra(cp);
    t('invitado: la vida que llega por red enseña la barra 1,5 s; si no cambia, se esconde', r1 && !r2, { r1, r2 });
  } catch (e) { t('barras de vida', false, String(e && e.stack || e)); }

  // ---- C. Tu Pokémon siempre visible (cajas de los sprites; aquí, las del cuerpo) ----
  try {
    const W = mundo(), { G, C, S } = W;
    G.World = { biome: 0 };
    G.Tiles = { propSprite: () => ({ width: 24, height: 40 }) };
    const jugador = (o = {}) => Object.assign(new (function Jugador() {})(), { x: 0, y: 0, r: 10, bodyH: 40, dead: false, invuln: 0, flash: 0,
      anim: Object.assign(new G.Sprites.Animator(25, o.escala || 1), {}) }, o);
    const pl = jugador();
    G.Game.player = pl;
    const ene = (x, y, extra = {}) => Object.assign(W.enemigo({ x, y }), extra);
    const escena = (...cosas) => cosas.map(c => (c.prop ? { y: c.prop.y, prop: c.prop } : { y: c.y, ent: c })).sort((a, b) => a.y - b.y);
    const delante = ene(0, 12), detras = ene(0, -12), lado = ene(60, 12), muerto = ene(0, 14, { dead: true }), rozando = ene(19, 12);
    const arbol = { prop: { x: 4, y: 20, type: 'tree' } }, plano = { prop: { x: 0, y: 10, type: 'spring', flat: true } };
    const casos = {
      delante: C.tapado(pl, escena(pl, delante)), detras: C.tapado(pl, escena(pl, detras)), lado: C.tapado(pl, escena(pl, lado)),
      muerto: C.tapado(pl, escena(pl, muerto)), rozando: C.tapado(pl, escena(pl, rozando)), arbol: C.tapado(pl, escena(pl, arbol)),
      plano: C.tapado(pl, escena(pl, plano))
    };
    t('tapado: un enemigo delante encima de él o un árbol, sí; detrás, al lado, caído, rozando o un objeto plano, no',
      casos.delante && !casos.detras && !casos.lado && !casos.muerto && !casos.rozando && casos.arbol && !casos.plano, casos);
    // Lo alto tapa con los pies muy por debajo (antes se dejaba de mirar a 48 px de los pies del jugador:
    // un jefe de ~110-160 de alto o un árbol de 80 no contaban justo cuando más tapan).
    const alto = (x, y, boss = true) => Object.assign(W.enemigo({ x, y, boss, hp: 1e6 }), { r: 24, bodyH: 110 });
    const altos = {
      jefe80: C.tapado(pl, escena(pl, alto(0, 80))), arbol60: C.tapado(pl, escena(pl, { prop: { x: 0, y: 60, type: 'tree' } })),
      // Con la imagen sin leer (file://) cuenta la caja del cuerpo, aunque sea más alta que su fotograma.
      cuerpoMasAltoQueSuFotograma: C.tapado(pl, escena(pl, alto(0, 80, false))),
      jefe80TrasMuchos: C.tapado(pl, escena(pl, ...Array.from({ length: 30 }, (_, k) => ene(200 + k * 30, 5 + k)), alto(0, 80))),
      jefe160: C.tapado(pl, escena(pl, alto(0, 160))), jefeAlLado: C.tapado(pl, escena(pl, alto(90, 80))),
      arbol100: C.tapado(pl, escena(pl, { prop: { x: 0, y: 100, type: 'tree' } }))
    };
    t('tapado por lo alto: un jefe de 110 de alto con los pies a 80 px (también detrás de 30 enemigos lejos, y con la caja del cuerpo si la imagen no se lee) y un árbol de 80 a 60 px, sí; el jefe a 160 px o a un lado y el árbol a 100 px, no',
      altos.jefe80 && altos.arbol60 && altos.jefe80TrasMuchos && altos.cuerpoMasAltoQueSuFotograma && !altos.jefe160 && !altos.jefeAlLado && !altos.arbol100, altos);
    // Lo que salta se pinta en y − lift (enemy.js draw): cuenta donde se ve, no donde tiene los pies.
    const saltos = {
      saltando: C.tapado(pl, escena(pl, ene(0, 50, { jumpLift: 46 }))), enSuelo: C.tapado(pl, escena(pl, ene(0, 50))),
      bajandoLejos: C.tapado(pl, escena(pl, ene(0, 90, { jumpLift: 10 })))
    };
    t('tapado por lo que salta: con los pies a 50 px, en lo alto de su salto (46 px), sí; el mismo en el suelo o uno a 90 px que apenas se levanta, no',
      saltos.saltando && !saltos.enSuelo && !saltos.bajandoLejos, saltos);
    // encima(): aro + contorno de 1 píxel de arte (4 copias desplazadas) + el sprite; y el chevrón después.
    const L = lienzo();
    C.escenaOrdenada(escena(pl, delante));
    S.dibujados.length = 0;
    C.encima(L);
    const desp = L.imgs.map(a => a[5]).sort((a, b) => a - b);
    const L2 = lienzo(); C.chevron(L2);
    t('tapado: aro dorado encima, contorno blanco (4 copias a ±1 píxel de arte) y el sprite; chevrón después de los números',
      C.tapados.length === 1 && L.elipses.some(x => x.color === '#ffcb3d') && L.imgs.length === 4 && desp[3] - desp[0] === 4 && S.dibujados.length === 1 && L2.lineas === 1,
      { tapados: C.tapados.length, imgs: L.imgs.length, desp, sprite: S.dibujados.length, chevron: L2.lineas });
    // Sin nada encima: sólo el aro (lo pinta player.js debajo del sprite) y sin chevrón.
    const L3 = lienzo(); C.escenaOrdenada(escena(pl, detras)); C.encima(L3);
    const L4 = lienzo(); C.chevron(L4);
    const L5 = lienzo(); C.aro(L5, pl);
    const ar = L5.elipses[0] && L5.elipses[0].a;
    t('sin nada encima: nada repintado ni chevrón; el aro a los pies (1,65 r × 0,66 r), dorado', !C.tapados.length && !L3.imgs.length && !L4.lineas &&
      ar && Math.abs(ar[2] - 16.5) < 1e-9 && Math.abs(ar[3] - 6.6) < 1e-9 && L5.elipses[0].color === '#ffcb3d', { ar });
    // Grande reducido (anchoMaxJugador): el contorno, a 1 píxel de arte de SU sprite; y su caja, a escala.
    const gr = jugador({ escala: 0.47, r: 11, bodyH: 22 });
    G.Game.player = gr;
    const L6 = lienzo(); C.escenaOrdenada(escena(gr, ene(0, 6))); C.encima(L6);
    const d6 = L6.imgs.map(a => a[5]).sort((a, b) => a - b);
    t('Pokémon grande reducido: contorno a 1 píxel de arte de su sprite (0,94 -> 1 unidad) y a escala', L6.imgs.length === 4 && d6[3] - d6[0] === 2 && L6.imgs[0][7] === 40 * 2 * 0.47,
      { d6, ancho: L6.imgs[0] && L6.imgs[0][7] });
    // Compañero: aro y contorno en blanco frío (el tuyo, dorado y blanco).
    G.Game.player = pl;
    const amigo = jugador({ x: 300 });
    G.Coop.active = true; G.Coop.puppets = () => [amigo];
    const L7 = lienzo(); C.aro(L7, amigo);
    const L8 = lienzo(); C.escenaOrdenada(escena(pl, amigo, ene(300, 12))); C.encima(L8);
    G.Coop.active = false;
    t('compañero: aro y contorno en blanco frío (#cfe8ff), sin chevrón', L7.elipses[0] && L7.elipses[0].color === '#cfe8ff' && C.tapados.length === 1 && C.tapados[0] === amigo &&
      L8.elipses.some(x => x.color === '#cfe8ff'), { aro: L7.elipses[0] && L7.elipses[0].color, tapados: C.tapados.length });
    G.MODS.jugadorVisible = false;
    const L9 = lienzo(); C.escenaOrdenada(escena(pl, delante)); C.encima(L9); C.aro(L9, pl); C.chevron(L9);
    t('jugadorVisible = false: ni aro, ni contorno, ni chevrón', !L9.elipses.length && !L9.imgs.length && !L9.lineas);
  } catch (e) { t('tu Pokémon siempre visible', false, String(e && e.stack || e)); }

  // ---- D. Borde rojo: golpe recibido y vida baja ----
  try {
    const W = mundo(), { G, C, S } = W, pl = G.Game.player;
    C.vineta(lienzo(), 800, 400, pl);   // el primer fotograma de la partida
    C.golpe(pl, 1); const a1 = C.alfaVineta(pl);
    C.golpe(pl, 30); const a2 = C.alfaVineta(pl);
    S.reloj += 175; const a3 = C.alfaVineta(pl);
    S.reloj += 200; const a4 = C.alfaVineta(pl);
    t('golpe: alfa de 0,2 (poco daño) a 0,45 (un cuarto de la vida o más) que se apaga en ~0,35 s', Math.abs(a1 - 0.21) < 1e-9 && Math.abs(a2 - 0.45) < 1e-9 &&
      Math.abs(a3 - 0.225) < 1e-6 && a4 === 0, { a1, a2, a3, a4 });
    C.golpe({ hp: 100, maxHp: 100 }, 50);
    t('el golpe a otro jugador (un compañero) no pinta tu borde', C.alfaVineta(pl) === 0);
    pl.hp = 20;
    const latido = []; for (let i = 0; i < 40; i++) { S.reloj += 50; latido.push(C.alfaVineta(pl)); }
    pl.hp = 40; const sano = C.alfaVineta(pl);
    pl.hp = 0; pl.dead = true; const ko = C.alfaVineta(pl);
    t('por debajo del 30 %: latido lento (sube y baja en 2 s, sin llegar al golpe más fuerte); con más vida o KO, nada', Math.min(...latido) > 0.1 && Math.max(...latido) < 0.3 && Math.max(...latido) - Math.min(...latido) > 0.08 &&
      sano === 0 && ko === 0, { min: Math.min(...latido), max: Math.max(...latido) });
    pl.dead = false; pl.hp = 100;
    C.golpe(pl, 30); const fuerte = C.alfaVineta(pl);
    S.ajustes.calm = true; const suave = C.alfaVineta(pl);
    const L = lienzo(); C.vineta(L, 800, 400, pl);
    G.MODS.vinetaDanio = false; const L2 = lienzo(); C.vineta(L2, 800, 400, pl);
    t('«Menos sacudidas y destellos»: a la mitad; vinetaDanio = false: no pinta nada', Math.abs(suave - fuerte / 2) < 1e-9 && L.rects.length > 0 && !L2.rects.length, { fuerte, suave });
  } catch (e) { t('borde rojo', false, String(e && e.stack || e)); }

  // ---- E. Disparos enemigos: el gancho y el ajuste (el contorno se mira en el navegador: coop-e2e.js) ----
  try {
    const W = mundo({ mods: { contornoDisparos: false } });
    W.G.VFX = { SHAPES: { ball: { w: 5, h: 5 } }, sprite: () => { throw new Error('no debería pedir el sprite'); } };
    t('contornoDisparos = false: projectile.js pinta como siempre', W.C.disparoHostil(lienzo(), 'ball', 'normal', 0, 0, 0, 1, 1, 0) === false);
  } catch (e) { t('disparos enemigos', false, String(e && e.stack || e)); }

  // ---- F. Lo que claridad.js repite de upstream sigue coincidiendo con él ----
  // disparoHostil() pinta como G.VFX.draw y repintar() elige celda y posición como Animator.draw: si upstream
  // cambia cualquiera de los dos, el disparo contorneado o tu Pokémon repintado dejarían de coincidir.
  /** Un lienzo de mentira que apunta las llamadas (con sus números) y lo que se le asigna, en orden. */
  const grabadora = () => {
    const o = { ops: [], imgs: [], globalAlpha: 0.8 };
    return new Proxy(o, {
      get(x, k) { if (k in x) return x[k]; return (...a) => { x.ops.push([k, ...a.map(v => (typeof v === 'number' ? +v.toFixed(4) : typeof v))]); if (k === 'drawImage') x.imgs.push(a); }; },
      set(x, k, v) { x[k] = v; x.ops.push(['=' + k, typeof v === 'number' ? +v.toFixed(4) : v]); return true; }
    });
  };
  /** Un canvas de mentira que guarda qué píxeles se pintan (para el contorno de claridad.js); legible o no. */
  const canvasPx = (legible = true) => {
    const c = { width: 0, height: 0 };
    let d = null;
    const x = {
      fillStyle: '', globalCompositeOperation: '',
      fillRect(px, py, w, h) {
        if (!d || d.length !== c.width * c.height * 4) d = new Uint8ClampedArray(c.width * c.height * 4);
        for (let yy = py; yy < py + h; yy++) for (let xx = px; xx < px + w; xx++) if (xx >= 0 && yy >= 0 && xx < c.width && yy < c.height) d[(yy * c.width + xx) * 4 + 3] = 255;
      },
      getImageData(px, py, w, h) {
        if (!legible) throw new Error('SecurityError: lienzo contaminado');
        return { data: d && w === c.width && h === c.height ? d : new Uint8ClampedArray(w * h * 4) };
      },
      clearRect() {}, drawImage() {}
    };
    c.getContext = () => x;
    return c;
  };
  try {
    // F1. projectile.js: el gancho recibe lo mismo que la llamada a G.VFX.draw que sustituye.
    const src = rd('js/entities/projectile.js');
    const m = /G\.Claridad\.disparoHostil\(([^\n]*)\)\) continue;[^\n]*\r?\n\s*G\.VFX\.draw\(([\s\S]*?)\);/.exec(src);
    const partir = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if ('([{'.includes(ch)) d++; if (')]}'.includes(ch)) d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
    const gancho = m ? partir(m[1]) : [], vfx = m ? partir(m[2]) : [];
    const op = {};
    if (vfx[5]) for (const kv of partir(vfx[5].replace(/^\{|\}$/g, ''))) { const i = kv.indexOf(':'); op[(i < 0 ? kv : kv.slice(0, i)).trim()] = (i < 0 ? kv : kv.slice(i + 1)).trim(); }
    t('projectile.js: el disparo contorneado recibe lo mismo que la llamada a G.VFX.draw que sustituye (posición, ángulo, alfa, escala y fotograma)',
      gancho.length === 9 && vfx.length === 6 && vfx.slice(0, 5).join('|') === gancho.slice(0, 5).join('|') && Object.keys(op).sort().join() === 'alpha,angle,frame,scale' &&
      op.angle === gancho[5] && op.alpha === gancho[6] && op.scale === gancho[7] && op.frame === gancho[8], { gancho, vfx: vfx.slice(0, 5), op });

    // F2. disparoHostil() frente a G.VFX.draw() real (vfx.js): mismo centro, giro, alfa y suavizado; 1 píxel de arte más por lado.
    const c = { console, document: { createElement: () => canvasPx() } };
    vm.createContext(c);
    c.window = c; c.G = { Sprites: { PX: 2 } };
    for (const f of ['js/core/util.js', 'js/entities/vfx.js', 'js/core/mods.js', 'js/entities/claridad.js']) vm.runInContext(rd(f), c, { filename: f });
    const G = c.G, PX = G.Sprites.PX;
    let casos = 0, mal = [];
    for (const shape of Object.keys(G.VFX.SHAPES)) for (const angle of [0, 0.3, 0.5, 1, 2, 2.9, -1.2]) for (const scale of [1, 1.5]) for (const alpha of [1, 0.5]) for (const frame of [0, 3]) {
      const a = grabadora(), b = grabadora();
      G.VFX.draw(a, shape, 'fire', 100.6, 50.2, { angle, alpha, scale, frame });
      const pinto = G.Claridad.disparoHostil(b, shape, 'fire', 100.6, 50.2, angle, alpha, scale, frame);
      const k = PX * scale, oa = a.ops, ob = b.ops;
      const ok1 = pinto && oa.length === ob.length && oa.every((x, i) => (x[0] === 'drawImage'
        ? ob[i][0] === 'drawImage' && Math.abs(ob[i][2] - (x[2] - k)) < 1e-6 && Math.abs(ob[i][3] - (x[3] - k)) < 1e-6 && Math.abs(ob[i][4] - (x[4] + 2 * k)) < 1e-6 && Math.abs(ob[i][5] - (x[5] + 2 * k)) < 1e-6
        : JSON.stringify(x) === JSON.stringify(ob[i])));
      const cv = b.imgs[0] && b.imgs[0][0], orig = a.imgs[0] && a.imgs[0][0];
      const ok2 = cv && orig && cv.width === orig.width + 2 && cv.height === orig.height + 2;
      casos++;
      if (!ok1 || !ok2) mal.push({ shape, angle, scale, alpha, frame, vfx: oa, claridad: ob });
    }
    t(`disparoHostil() pinta como G.VFX.draw (vfx.js real, ${casos} casos: todas las formas, giros, escalas, alfas y fotogramas), con el sprite 1 píxel de arte más grande por lado`,
      casos > 0 && !mal.length, mal.slice(0, 2));
  } catch (e) { t('disparoHostil frente a G.VFX.draw', false, String(e && e.stack || e)); }

  try {
    // F3. repintar() (tu Pokémon tapado) frente a Animator.draw real (sprites.js): misma hoja, celda y posición;
    // el contorno, a ±1 píxel de arte. Con una geometría de mentira en G.SPRITE_META y hojas que se cargan a mano.
    const fot = (w, h, ax, ay, n) => ({ w, h, ax, ay, n, r: 8, d: Array(n).fill(4) });
    const c = { console, performance: { now: () => 0 }, document: { createElement: () => canvasPx(false) } };
    c.Image = class { constructor() { this.width = 256; this.height = 512; this.onload = this.onerror = null; } set src(v) { this._src = v; } get src() { return this._src; } };
    vm.createContext(c);
    c.window = c;
    c.G = { SPRITE_META: { 25: { s: 1, sh: 1, a: { Idle: fot(32, 40, 16, 34, 2), Walk: fot(32, 40, 16, 34, 4), Attack: fot(48, 56, 24, 44, 3) }, sa: { Idle: fot(36, 44, 18, 38, 2) } } } };
    for (const f of ['js/core/util.js', 'js/core/sprites.js', 'js/core/mods.js', 'js/entities/claridad.js']) vm.runInContext(rd(f), c, { filename: f });
    const G = c.G, S = G.Sprites, C = G.Claridad;
    G.Coop = { active: false, puppets: () => [] };
    const cargar = (anim, shiny = false) => { const s = S.sheet(25, anim, shiny); s.img.onload(); return s; };
    cargar('Idle'); cargar('Idle', true);
    const casos = [
      { nombre: 'Idle cargada (fotograma 1, dirección 3)', cur: 'Idle', frame: 1, dir: 3 },
      { nombre: 'Attack sin cargar: enseña Idle, fotograma 0', cur: 'Attack', frame: 2, dir: 5 },
      { nombre: 'Attack cargada, fotograma y dirección fuera de la hoja', cur: 'Attack', frame: 7, dir: 11, carga: 'Attack' },
      { nombre: 'reducido ×0,47 (anchoMaxJugador)', cur: 'Walk', frame: 3, dir: 2, carga: 'Walk', escala: 0.47 },
      { nombre: 'shiny con su propia geometría', cur: 'Idle', frame: 1, dir: 6, shiny: true }
    ];
    const mal = [];
    for (const k of casos) {
      if (k.carga) cargar(k.carga, !!k.shiny);
      const anim = new S.Animator(25, k.escala || 1, !!k.shiny);
      Object.assign(anim, { cur: k.cur, frame: k.frame, dir: k.dir });
      const pl = { x: 100.7, y: 200.6, r: 10, bodyH: 40, dead: false, invuln: 0, flash: 0, anim };
      const delante = { x: 100, y: 210, r: 10, bodyH: 40, dead: false, anim: new S.Animator(25, 1) };
      G.Game = { player: pl };
      const L = grabadora();
      C.escenaOrdenada([{ y: pl.y, ent: pl }, { y: delante.y, ent: delante }]);
      C.encima(L);
      const im = L.imgs, real = im[4], copias = im.slice(0, 4), o = Math.max(1, S.PX * (k.escala || 1));
      const bien = im.length === 5 && copias.every(a => a[0] === S.white(real[0]) && [1, 2, 3, 4, 7, 8].every(i => Math.abs(a[i] - real[i]) < 1e-9)) &&
        copias.map(a => [a[5] - real[5], a[6] - real[6]].join()).sort().join('|') === [[-o, 0], [0, -o], [0, o], [o, 0]].map(v => v.join()).sort().join('|');
      if (!bien) mal.push({ caso: k.nombre, dibujos: im.length, real: real && real.slice(1), copias: copias.map(a => a.slice(1)) });
    }
    t(`repintar() elige la misma hoja, celda y posición que Animator.draw (sprites.js real, ${casos.length} casos: carga, respaldo de Idle, fuera de la hoja, reducido y shiny); el contorno, a ±1 píxel de arte`,
      !mal.length, mal);
  } catch (e) { t('repintar frente a Animator.draw', false, String(e && e.stack || e)); }

  try {
    // F4. El salto que tapado() suma a cada enemigo es el lift con el que lo pinta enemy.js draw().
    const m = /const lift = ([^;\n]+);\r?\n\s*this\.anim\.draw\(ctx, this\.x, this\.y - lift,/.exec(rd('js/entities/enemy.js'));
    const C = mundo().C, f = m && new Function('return ' + m[1]);
    const mal = [];
    for (const flying of [false, true]) for (const boss of [false, true]) for (const bob of [0, 1, 2.5, 4.4]) for (const jumpLift of [undefined, 0, 20, 46]) {
      const e = { flying, boss, bob, jumpLift }, a = f ? f.call(e) : NaN, b = C.alzado(e);
      if (!(Math.abs(a - b) < 1e-9)) mal.push({ e, enemy: a, claridad: b });
    }
    t('tapado(): el salto de cada enemigo es el lift con el que lo pinta enemy.js draw() (flota, salta, jefe)', !!m && !mal.length, m ? mal.slice(0, 3) : 'no encuentro el lift de draw() en enemy.js');
  } catch (e) { t('el salto de enemy.js', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`claridad en partida: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`claridad: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- mapas propios: carga compartida (la usan §12, §15, §16 y §23) ----------------
/** Los 4 ficheros de los mapas propios (G.MODS.mapasPropios), en el orden de dev.html: entre tiles.js y world.js. */
const MAPAS = ['js/world/mapas-datos.js', 'js/world/mapas.js', 'js/world/mapas-pintar.js', 'js/world/mapas-sprites.js'];
/** Carga los mapas propios en el contexto node:vm `c` (con util.js, mods.js, marca.js y tiles.js ya cargados) con
 *  G.MODS.mapasPropios = activo: mapas.js lo lee al cargar (con false no toca nada). Después va world.js. */
function cargarMapas(c, activo) {
  c.G.MODS.mapasPropios = !!activo;
  for (const f of MAPAS) vm.runInContext(rd(f), c, { filename: f });
}
/** Qué enseña cada píxel de un chunk normal (sin arena ni vacío) de 16×16 casillas que pinta mapas-pintar.js, según los
 *  códigos de `cod(tx, ty)` (kind | sub << 2) y lo que dice su cabecera: es lo que la máscara de suelo deja gradar a Dex
 *  (§16 C y §23 K). `SUB`: los subtipos de G.Mapas. Devuelve 256×256 clases, por filas:
 *  - 'triangulo': el triángulo de líquido de 5 px de una casilla de suelo que los pinta (llano, orilla, cauce, arcén,
 *    explanada y puerto) en la esquina donde hay líquido a los dos lados. Es líquido: no se gradúa.
 *  - 'suelo': el resto de las casillas de suelo. Se gradúa.
 *  - 'recorte': las esquinas de una pared (escalonadas 3-2-1 arriba y 2-1 abajo, sin pared a los dos lados) o de un
 *    líquido (en diagonal, 5 px, sin líquido a los dos lados ni en diagonal ni un vado o un puente al lado, y nunca en la
 *    pila de la fuente), que enseñan el suelo de al lado. Se gradúan.
 *  - 'otro': lo demás de las paredes y los líquidos. No se gradúa. */
function clasesChunk(SUB, cod, cx, cy) {
  const S = SUB, TRI = [S.LLANO, S.ORILLA, S.CAUCE, S.ARCEN, S.APRON, S.PUERTO], CRUCE = [S.VADO, S.PUENTE, S.A_PUENTE];
  const x0 = cx * 16 - 1, y0 = cy * 16 - 1, rej = new Int32Array(18 * 18);   // los códigos, con una casilla de faldón
  for (let j = 0; j < 18; j++) for (let i = 0; i < 18; i++) rej[j * 18 + i] = cod(x0 + i, y0 + j);
  const kd = (i, j) => { const k = rej[(j + 1) * 18 + i + 1] & 3; return k === 3 ? 1 : k; }, sb = (i, j) => rej[(j + 1) * 18 + i + 1] >> 2;
  const L = (i, j) => kd(i, j) === 2, X = (i, j) => kd(i, j) === 0 && CRUCE.includes(sb(i, j));
  const out = new Array(256 * 256);
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
    const k = kd(i, j);
    let clase;
    if (k === 0) {
      const tri = TRI.includes(sb(i, j));
      clase = (x, y) => {
        const ex = x < 8 ? -1 : 1, ey = y < 8 ? -1 : 1;
        return tri && Math.min(x, 15 - x) + Math.min(y, 15 - y) < 5 && L(i + ex, j) && L(i, j + ey) ? 'triangulo' : 'suelo';
      };
    } else if (k === 1) {
      const n = kd(i, j - 1) === 1, s = kd(i, j + 1) === 1, w = kd(i - 1, j) === 1, e = kd(i + 1, j) === 1;
      clase = (x, y) => ((!n && !w && y < 3 && x < 3 - y) || (!n && !e && y < 3 && x > 12 + y) ||
        (!s && !w && y > 13 && x < y - 13) || (!s && !e && y > 13 && x > 28 - y) ? 'recorte' : 'otro');
    } else {
      const pila = sb(i, j) === S.PILA, n = L(i, j - 1) || X(i, j - 1), s = L(i, j + 1) || X(i, j + 1), w = L(i - 1, j) || X(i - 1, j), e = L(i + 1, j) || X(i + 1, j);
      const cNW = !pila && !n && !w && !L(i - 1, j - 1), cNE = !pila && !n && !e && !L(i + 1, j - 1);
      const cSW = !pila && !s && !w && !L(i - 1, j + 1), cSE = !pila && !s && !e && !L(i + 1, j + 1);
      clase = (x, y) => ((cNW && x + y < 5) || (cNE && 15 - x + y < 5) || (cSW && x + 15 - y < 5) || (cSE && 30 - x - y < 5) ? 'recorte' : 'otro');
    }
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) out[(j * 16 + y) * 256 + i * 16 + x] = clase(x, y);
  }
  return out;
}

// ---------------- 12. arreglos de upstream: biomas desde el minuto 12 y el fogonazo de la grieta ----------------
function arreglosChecks() {
  console.log('12. Arreglos de upstream: biomas desde el minuto 12 (world.js y tiles.js reales) y el fogonazo de la grieta');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const gsrc = rd('js/game.js');
  const trozo = (re, que) => { const m = gsrc.match(re); if (!m) throw new Error('no encuentro en js/game.js: ' + que); return m[0]; };
  let resumen = '';
  // El cambio de bioma de update(), tal cual, con world.js y tiles.js reales; `mapas`: con los mapas propios (como el
  // juego) o sin ellos (G.MODS.mapasPropios = false: los biomas del proyecto base).
  function partida(biomasEnCiclo = true, mapas = true) {
    const c = { console, document: { createElement: () => ({ getContext: () => ({}) }) } };
    vm.createContext(c);
    c.window = c; c.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js']) vm.runInContext(rd(f), c, { filename: f });
    c.G.Sprites = { PX: 2 };
    vm.runInContext(rd('js/world/tiles.js'), c, { filename: 'js/world/tiles.js' });
    cargarMapas(c, mapas);
    vm.runInContext(rd('js/world/world.js'), c, { filename: 'js/world/world.js' });
    const G = c.G, avisos = [];
    G.MODS.biomasEnCiclo = biomasEnCiclo;
    Object.assign(G, { Rift: { inArena: false }, Audio: { sfx() {} }, Spawner: { say: s => avisos.push(s) }, FX: { ring() {} }, Camera: { outerRadius: () => 500 } });
    const cambio = trozo(/    const b = Math\.floor\(time \/ 240\);\r?\n    if \(b !== biome && !G\.Rift\.inArena\) \{[\s\S]*?\r?\n    \}\r?\n/, 'el cambio de bioma de update()');
    vm.runInContext(`var __P = (() => { let biome = 0, time = 0; const pl = { x: 0, y: 0 };
      G.World.reset(1234); G.World.setBiome(0, true);
      return { a(tt) { time = tt;
${cambio}      } }; })();`, c, { filename: 'js/game.js (cambio de bioma)' });
    let roto = null;
    const ver = min => {
      for (let s = 0; s <= min * 60; s += 5) { try { c.__P.a(s); } catch (e) { roto = roto || e.message; } }   // en el juego, el bucle lo atrapa y lo repite cada fotograma
      let nombre; try { nombre = roto ? 'ERROR: ' + roto : G.World.biomeName(); } catch (e) { nombre = 'ERROR: ' + e.message; }
      return { min, i: G.World.biome, nombre, liquido: G.World.biome < G.Tiles.BIOMES.length ? G.World.liquidKind() : null,
               danio: G.World.biome < G.Tiles.BIOMES.length ? !!G.World.liquidEffect(['normal']).dmg : null };
    };
    return { G, ver, avisos };
  }
  try {
    const P = partida(true), N = P.G.Tiles.NORMAL, B = P.G.Tiles.BIOMES;
    const fila = [0, 4, 8, 12, 16, 24, 60, 84, 120].map(P.ver);
    const esperado = fila.map(f => Math.floor(f.min / 4) % N);
    resumen = fila.map(f => `${f.min}′ ${f.i} ${f.nombre}`).join(', ');
    t('con el arreglo: a los 0, 4, 8, 12, 16, 24, 60, 84 y 120 min, el bioma normal que toca (cada 4 min, en ciclo de 3)',
      fila.every((f, k) => f.i === esperado[k] && f.nombre === B[esperado[k]].name), fila.map(f => `${f.min}: ${f.i} ${f.nombre}`));
    t('con el arreglo y los mapas propios: el líquido y el daño de los charcos, los del bioma normal (sólo quema el tramo 2, el ácido de la Vega Sulfúrea; a los 16 min, hielo)',
      fila.every(f => f.liquido === B[f.i].liquid && f.danio === (f.i === 2)) && fila.some(f => f.i === 2) && fila[4].liquido === 'ice' && !fila[4].danio,
      fila.map(f => `${f.min}: ${f.liquido}${f.danio ? ' (quema)' : ''}`));
    t('con el arreglo: el aviso de bioma nunca dice «Grieta»', P.avisos.length > 0 && !P.avisos.some(s => /Grieta/.test(s)), P.avisos.slice(0, 6));
    // Sin los mapas propios (mapasPropios = false), los biomas del proyecto base, como antes de los mapas.
    const Q = partida(true, false), BQ = Q.G.Tiles.BIOMES, filaQ = [0, 4, 8, 12, 16, 24, 60, 84, 120].map(Q.ver);
    t('con el arreglo y sin los mapas propios (mapasPropios = false): el bioma normal que toca, y el líquido y el daño de upstream (sólo el volcán quema; a los 16 min, agua)',
      filaQ.every((f, k) => f.i === esperado[k] && f.nombre === BQ[f.i].name && f.liquido === BQ[f.i].liquid && f.danio === (f.liquido === 'lava')) && filaQ[4].liquido === 'water' && !filaQ[4].danio,
      filaQ.map(f => `${f.min}: ${f.i} ${f.nombre} ${f.liquido}${f.danio ? ' (quema)' : ''}`));
    const O = partida(false, false);
    const ctl = [12, 16, 84].map(O.ver);
    t('control (biomasEnCiclo = false y sin los mapas propios, como upstream): a los 12 min «Grieta · …», a los 16 lava que quema y a los 84 se rompe (la prueba lo detecta)',
      /^Grieta · /.test(ctl[0].nombre) && ctl[1].liquido === 'lava' && ctl[1].danio && /^ERROR/.test(ctl[2].nombre), ctl.map(f => `${f.min}: ${f.i} ${f.nombre}`));
    const M = P.G.MODS;
    t('biomaNormal(): entero en [0, 3) también con negativos o decimales; con el ajuste en false, tal cual', M.biomaNormal(3) === 0 && M.biomaNormal(-1) === 2 &&
      M.biomaNormal(7.9) === 1 && (M.biomasEnCiclo = false, M.biomaNormal(5) === 5));
  } catch (e) { t('biomas', false, String(e && e.stack || e)); }

  // El fogonazo de la grieta en el estado 'choice' (elegir fusión): frame() de game.js, tal cual.
  try {
    const fFlash = trozo(/  let flashT = 0, flashDur = 1, flashCol = '#fff';\r?\n  function flash\(col, dur\) \{[^\n]*\}\r?\n/, 'flash()');
    const fFrame = trozo(/  function frame\(ts\) \{[\s\S]*?\r?\n  \}\r?\n/, 'frame()');
    const fogonazo = (activo, estado) => {
      const c = { console };
      vm.createContext(c);
      c.G = { MODS: { destelloSinCongelar: activo }, Settings: { sample() {} }, FX: { update() {} }, Coop: { active: false }, UI: { tick() {} }, Input: { endFrame() {} } };
      vm.runInContext(`var __F = (() => { let state = '${estado}', pl = { anim: { update() {} } }, last = 0, speedK = 1, frameDt = 0, fpsAcc = 0, fpsN = 0, fpsShown = 60;
        const w = 1, h = 1, dpr = 1, ctx = null; function handleKeys() {} function update() {} function render() {} const Backdrop = { render() {} };
${fFlash}${fFrame}        return { flash, frame, get flashT() { return flashT; } }; })();`, c, { filename: 'js/game.js (frame)' });
      const F = c.__F;
      F.flash('#c9a6ff', 0.8);
      for (let k = 1; k <= 45; k++) F.frame(k * 1000 / 60);   // 0,75 s
      return F.flashT;
    };
    const eleccion = fogonazo(true, 'choice'), espera = fogonazo(true, 'held'), ctl = fogonazo(false, 'choice');
    t("el fogonazo de la vuelta de la grieta se apaga también eligiendo la fusión ('choice') o esperando al otro ('held'); control como upstream: congelado",
      eleccion <= 0.06 && espera <= 0.06 && ctl === 0.8, { eleccion, espera, control: ctl });
  } catch (e) { t('fogonazo de la grieta', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`arreglos de upstream: ${r.length} casos bien (biomas: ${resumen})`);
  for (const [name, , detail] of failed) bad(`arreglos: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 13. pantallas: móviles en vertical y plegables ----------------
function pantallasChecks() {
  console.log('13. Pantallas: «Gira el móvil» sólo en un móvil en vertical (plegables y tabletas juegan)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const nuevo = (mods = {}) => {
    const c = { console };
    vm.createContext(c);
    c.window = c; c.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js']) vm.runInContext(rd(f), c, { filename: f });
    Object.assign(c.G.MODS, mods);
    return c;
  };
  try {
    const M = nuevo().G.MODS;
    const tabla = { '390x844': true, '412x915': true, '360x640': true, '430x932': true, '844x390': false, '800x870': false, '870x800': false,
      '900x1000': false, '1000x900': false, '768x1024': false, '600x960': false, '560x700': false,
      // Magic V6 (tamaños de la verificación): interior en vertical y en horizontal, exterior en horizontal y en vertical, y una mitad de la interior.
      '724x784': false, '784x724': false, '807x360': false, '360x807': true, '362x784': true };
    const mal = Object.entries(tabla).filter(([k, v]) => { const [w, h] = k.split('x').map(Number); return M.pedirGiro(w, h) !== v; });
    t('pedirGiro: un móvil en vertical (390x844, 412x915, 360x640, 430x932; el Magic V6 plegado, 360x807, y una mitad de su pantalla interior, 362x784) sí; en horizontal, un plegable desplegado (724x784, 784x724, 800x870, 900x1000 y girados) o una tableta en vertical (768x1024, 600x960), no',
      !mal.length, mal);
    const U = nuevo({ giroAspectoMax: 1, giroLadoMax: 0 }).G.MODS;
    t('con giroAspectoMax = 1 y giroLadoMax = 0, como upstream: cualquier pantalla con más alto que ancho (800x870, 768x1024) lo pide; en horizontal, no',
      U.pedirGiro(800, 870) && U.pedirGiro(768, 1024) && U.pedirGiro(390, 844) && !U.pedirGiro(870, 800));
    const fijar = (w, h) => { const c = nuevo(); c.screen = { width: w, height: h }; return c.G.MODS.fijarHorizontal(); };
    t('pantalla completa: fija la horizontal en un móvil (390x844 o 844x390), no en un plegable desplegado (870x800) ni en una tableta (1024x768)',
      fijar(390, 844) && fijar(844, 390) && !fijar(870, 800) && !fijar(1024, 768));
  } catch (e) { t('pedirGiro', false, String(e && e.stack || e)); }
  try {
    // checkOrientation() de game.js, tal cual, con un document y una ventana de mentira.
    const m = rd('js/game.js').match(/  function checkOrientation\(\) \{[\s\S]*?\r?\n  \}\r?\n/);
    if (!m) throw new Error('no encuentro checkOrientation() en js/game.js');
    const prueba = (w, h, tactil = true, mods = {}) => {
      const c = nuevo(mods), clase = new Set(['hidden']);
      const el = { classList: { toggle(k, on) { if (on) clase.add(k); else clase.delete(k); } } }, ico = { innerHTML: '' };
      c.innerWidth = w; c.innerHeight = h;
      c.document = { getElementById: id => (id === 'rotate' ? el : id === 'rotate-ico' ? ico : null) };
      Object.assign(c.G, { Touch: { active: tactil }, Icons: { html: () => '<i></i>' } });
      vm.runInContext('var __pausas = 0; function autoPause() { __pausas++; }\n' + m[0] + 'checkOrientation();', c, { filename: 'js/game.js (checkOrientation)' });
      return { gira: !clase.has('hidden'), pausa: c.__pausas > 0 };
    };
    const casos = {
      movilVertical: prueba(390, 844), movilHorizontal: prueba(844, 390), plegable800x870: prueba(800, 870), plegable870x800: prueba(870, 800),
      plegable900x1000: prueba(900, 1000), plegable1000x900: prueba(1000, 900), tableta: prueba(768, 1024), pcAlto: prueba(390, 844, false),
      upstream800x870: prueba(800, 870, true, { giroAspectoMax: 1, giroLadoMax: 0 })
    };
    t('checkOrientation() real: «Gira el móvil» y pausa en un móvil en vertical; un plegable desplegado (800x870, 870x800, 900x1000, 1000x900) o una tableta juegan; sin táctil, nunca; control como upstream: el plegable lo pedía',
      casos.movilVertical.gira && casos.movilVertical.pausa && !casos.movilHorizontal.gira && !casos.plegable800x870.gira && !casos.plegable800x870.pausa &&
      !casos.plegable870x800.gira && !casos.plegable900x1000.gira && !casos.plegable1000x900.gira && !casos.tableta.gira && !casos.pcAlto.gira && casos.upstream800x870.gira, casos);
  } catch (e) { t('checkOrientation', false, String(e && e.stack || e)); }
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`pantallas: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`pantallas: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 14. identidad visual «Dex de Expedición» ----------------
/** Tabla name y glifos (cmap) de un woff2, para comprobar la licencia y la cobertura sin herramientas de fuera. */
function leerWoff2(f) {
  const b = fs.readFileSync(path.join(ROOT, f));
  if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error(f + ' no es woff2');
  const TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH',
    'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln',
    'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];
  const n = b.readUInt16BE(12), comp = b.readUInt32BE(20);
  let o = 48;
  const b128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const c = b[o++]; v = (v << 7) | (c & 0x7f); if (!(c & 0x80)) return v >>> 0; } return v >>> 0; };
  const tabs = [];
  for (let i = 0; i < n; i++) {
    const fl = b[o++];
    let tag = TAGS[fl & 63];
    if ((fl & 63) === 63) { tag = b.toString('latin1', o, o + 4); o += 4; }
    const orig = b128(), trans = tag === 'glyf' || tag === 'loca' ? (fl >> 6) === 0 : (fl >> 6) !== 0;
    tabs.push({ tag, len: trans ? b128() : orig });
  }
  const data = require('zlib').brotliDecompressSync(b.subarray(o, o + comp));
  const T = {};
  let off = 0;
  for (const t of tabs) { T[t.tag] = { off, len: t.len }; off += t.len; }
  const d = data.subarray(T.name.off, T.name.off + T.name.len), nombres = {};
  for (let i = 0, cnt = d.readUInt16BE(2), so = d.readUInt16BE(4); i < cnt; i++) {
    const r = 6 + i * 12, pid = d.readUInt16BE(r), id = d.readUInt16BE(r + 6), l = d.readUInt16BE(r + 8), po = d.readUInt16BE(r + 10);
    const raw = Buffer.from(d.subarray(so + po, so + po + l));
    if (pid === 3 || pid === 0) nombres[id] = raw.swap16().toString('utf16le'); else if (!nombres[id]) nombres[id] = raw.toString('latin1');
  }
  const cm = data.subarray(T.cmap.off, T.cmap.off + T.cmap.len), glifos = new Set();
  for (let i = 0, nt = cm.readUInt16BE(2); i < nt; i++) {
    const so = cm.readUInt32BE(8 + i * 8), fmt = cm.readUInt16BE(so);
    if (fmt === 4) {
      const seg = cm.readUInt16BE(so + 6) / 2, fin = so + 14, ini = fin + seg * 2 + 2;
      for (let s = 0; s < seg; s++) for (let c = cm.readUInt16BE(ini + s * 2), e = cm.readUInt16BE(fin + s * 2); c <= e && c !== 0xffff; c++) glifos.add(c);
    } else if (fmt === 12) {
      for (let k = 0, g = cm.readUInt32BE(so + 12); k < g; k++) for (let c = cm.readUInt32BE(so + 16 + k * 12), e = cm.readUInt32BE(so + 20 + k * 12); c <= e; c++) glifos.add(c);
    }
  }
  return { nombres, glifos, bytes: b.length };
}

function identidadChecks() {
  console.log('14. Identidad visual «Dex de Expedición» (fuentes, licencia, estilo, menús)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);

  // ---- A. Fuentes en local y su licencia ----
  try {
    const FUENTES = { 'assets/fonts/MPLUSRounded1c-500-latin.woff2': 'Medium', 'assets/fonts/MPLUSRounded1c-800-latin.woff2': 'ExtraBold' };
    const info = {};
    for (const [f, peso] of Object.entries(FUENTES)) {
      if (!ex(f)) { info[f] = 'no existe'; continue; }
      const w = leerWoff2(f);
      info[f] = { kb: +(w.bytes / 1024).toFixed(1), copyright: w.nombres[0], nombre: w.nombres[4], licencia: w.nombres[14], glifos: w.glifos.size,
        faltan: [...'áéíóúñüÁÉÍÓÚÑÜ¡¿º×…·–—’“”«»%€'].filter(ch => !w.glifos.has(ch.codePointAt(0))).join('') , peso };
    }
    const bien = Object.values(info).every(x => x && x.kb > 12 && x.kb < 48 && x.copyright === 'Copyright 2016 The Rounded M+ Project Authors.' &&
      /scripts\.sil\.org\/OFL/.test(x.licencia || '') && x.nombre === 'Rounded Mplus 1c ' + x.peso && !x.faltan);
    t('las dos fuentes de M PLUS Rounded 1c (500 y 800) están en assets/fonts, en woff2, con su copyright (The Rounded M+ Project Authors) y la OFL en su tabla name, y con los acentos, ñ, ¡¿, «», ×, …, · y –— de los textos', bien, info);
    // «…» (U+2026) con la letra de reserva: M PLUS lo dibuja con los puntos a media altura. Las dos caras de M PLUS de
    // tokens-dex.css lo dejan fuera de su unicode-range y cubren el resto (los mismos caracteres de arriba y el latín).
    const caras = [...rd('css/tokens-dex.css').matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => m[1]).filter(b => /M PLUS Rounded 1c/.test(b));
    const rangos = caras.map(b => { const m = /unicode-range:\s*([^;]+);/.exec(b); return m ? m[1].split(',').map(x => x.trim().replace(/^U\+/i, '').split('-').map(h => parseInt(h, 16))).map(([a, z]) => [a, z === undefined ? a : z]) : null; });
    const cubre = (r, cp) => r.some(([a, z]) => cp >= a && cp <= z);
    const usados = [...'áéíóúñüÁÉÍÓÚÑÜ¡¿º×·–—’“”«»%€ AZaz09'].map(ch => ch.codePointAt(0));
    t('«…» con la letra de reserva (los puntos en la línea base, no a media altura): las dos caras de M PLUS de css/tokens-dex.css dejan U+2026 fuera de su unicode-range y cubren el resto de los caracteres de los textos',
      caras.length === 2 && rangos.every(r => r && !cubre(r, 0x2026) && usados.every(cp => cubre(r, cp))), rangos);
    const ofl = ex('assets/fonts/OFL-MPLUSRounded1c.txt') ? rd('assets/fonts/OFL-MPLUSRounded1c.txt') : '';
    t('assets/fonts/OFL-MPLUSRounded1c.txt: «SIL Open Font License, Version 1.1» y «Rounded M+ Project Authors»; se conserva OFL.txt (Pixelify Sans)',
      /SIL Open Font License, Version 1\.1/.test(ofl) && /Copyright 2016 The Rounded M\+ Project Authors/.test(ofl) && ex('assets/fonts/OFL.txt') && /Pixelify Sans/.test(rd('assets/fonts/OFL.txt')) && ex('assets/fonts/PixelifySans-ps2.ttf'));
    t('Pixelify con el «2» redibujado (tools/nico/fuente-dos.py): el fichero nuevo, sin el viejo, y ninguna página ni estilo cita el viejo (el service worker lo serviría para siempre)',
      !ex('assets/fonts/PixelifySans.ttf') && ['css/style.css', 'css/pages.css', 'dev.html', 'index.html'].every(f => !rd(f).includes('PixelifySans.ttf') && rd(f).includes('PixelifySans-ps2.ttf')) && /el «2» redibujado/.test(rd('CREDITS.md')));
    const cr = rd('CREDITS.md');
    t('CREDITS.md cita las dos fuentes con su licencia (M PLUS Rounded 1c y Pixelify Sans, OFL)',
      /M PLUS Rounded 1c/.test(cr) && /Rounded M\+ Project Authors/.test(cr) && /OFL-MPLUSRounded1c\.txt/.test(cr) && /Pixelify Sans/.test(cr) && /Open Font License/.test(cr));
  } catch (e) { t('fuentes y licencia', false, String(e && e.stack || e)); }


  // ---- B. Las cifras de css/tokens-dex.css y js/ui/marca.js coinciden (las comparte el DOM y el lienzo) ----
  /** G.MARCA real (marca.js) en un contexto aparte. */
  const marca = () => { const c = { console }; c.window = c; vm.createContext(c); vm.runInContext(rd('js/ui/marca.js'), c, { filename: 'js/ui/marca.js' }); return c.G.MARCA; };
  try {
    const M = marca(), css = rd('css/tokens-dex.css');
    const raiz = css.slice(css.indexOf(':root {'), css.indexOf('@media'));
    const vars = {};
    for (const m of raiz.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
    const norm = v => String(v).replace(/\s+/g, '').toLowerCase(), camel = k => k.replace(/-([a-z0-9])/g, (_, x) => x.toUpperCase());
    let iguales = 0;
    const mal = [];
    const cmp = (k, v) => { if (norm(vars[k]) === norm(v)) iguales++; else mal.push(`${k}: css=${vars[k]} js=${v}`); };
    const alias = { '--color-ps-bajo-destello': 'psBajoDestello', '--color-cristal-hud': 'cristalHUD' };
    for (const k of Object.keys(vars).filter(x => x.startsWith('--color-'))) {
      const jk = alias[k] || camel(k.slice(8));
      if (!(jk in M.color)) { mal.push(`${k}: no existe G.MARCA.color.${jk}`); continue; }
      cmp(k, M.color[jk]);
    }
    for (const [tipo, [fondo]] of Object.entries(M.tipoPildora)) cmp('--tipo-' + tipo, fondo);
    cmp('--tipo-filo', M.filoTipo);
    for (const [k, j] of Object.entries({ '--fs-1': 'sm', '--fs-2': 'md', '--fs-3': 'lg', '--fs-4': 'xl', '--fs-5': 'x2', '--fs-6': 'x3' })) cmp(k, M.escalaTipo[j] + 'px');
    M.espacio.forEach((v, i) => cmp('--space-' + i, v ? v + 'px' : '0'));
    for (const i of [0, 1, 2, 3]) cmp('--radius-' + i, M.radio['r' + i] + 'px');
    cmp('--font-peso-normal', M.peso.normal); cmp('--font-peso-fuerte', M.peso.fuerte);
    cmp('--dur-micro', M.tiempo.micro + 'ms'); cmp('--dur-entrada', M.tiempo.entrada + 'ms');
    const ps = [M.color.psAlto, M.color.psMedio, M.color.psBajo].map(norm);
    t(`css/tokens-dex.css y js/ui/marca.js dicen lo mismo (${iguales} cifras: colores, tipos, letra, espacio, radios, tiempos) y la barra rival no es un color de PS`,
      !mal.length && iguales >= 70 && !ps.includes(norm(M.color.rival)) && norm(M.color.rival) === '#9b6bff', mal);
    t('G.MARCA sólo lleva lo visual: el horno, el iris, el golpe final y la tabla de Calidad son ajustes de js/core/mods.js (revisión cruzada)',
      ['horneado', 'iris', 'golpeFinal', 'calidad'].every(k => !(k in M)) && M.escalaHUD(1440, 900) === 1.25 && M.escalaHUD(1920, 1080) === 1.25 && M.escalaHUD(2560, 1440) === 1.25 &&
      M.escalaHUD(1280, 720) === 1 && M.ESCALA_HUD_MAX === 1.25);
    t('escala del HUD con tope de 1,25 (Nico: «a veces creo que ocupa demasiado»; la guía llegaba a 1,5) y filas compactas de como mucho 40 + 26 px',
      M.ESCALA_HUD_MAX === 1.25 && M.hud.compacto.adaptable.fila1[2] === 40 && M.hud.compacto.adaptable.fila2[2] === 26 && M.hud.compacto.bandaSuperiorMax === 76,
      { max: M.ESCALA_HUD_MAX, adaptable: M.hud.compacto.adaptable });
  } catch (e) { t('tokens y marca', false, String(e && e.stack || e)); }

  // ---- C. G.Estilo (js/ui/estilo.js) con settings.js, mods.js y marca.js reales ----
  /** Un navegador mínimo para estilo.js: localStorage de mentira (que sobrevive a una «recarga»), un
   *  CanvasRenderingContext2D con su accesor font y un document sin pantallas. */
  const almacen = {};
  function cargarEstilo({ mods = {}, guardado = null, alto = 900, ancho = 1440, extra = {} } = {}) {
    if (guardado !== null) almacen['ps.settings'] = JSON.stringify(guardado);
    const clases = new Set();
    const c = {
      console, innerHeight: alto, innerWidth: ancho,
      localStorage: { getItem: k => (k in almacen ? almacen[k] : null), setItem: (k, v) => { almacen[k] = String(v); } },
      matchMedia: () => ({ matches: false }), navigator: {}, location: { protocol: 'file:' },
      document: { documentElement: { classList: { toggle: (k, on) => (on ? clases.add(k) : clases.delete(k)), contains: k => clases.has(k) } },
        getElementById: () => null, querySelector: () => null, fonts: { load: () => Promise.resolve([]) }, body: null }
    };
    function Ctx() { this._f = '10px sans-serif'; }
    Object.defineProperty(Ctx.prototype, 'font', { configurable: true, enumerable: true, get() { return this._f; }, set(v) { this._f = v; } });
    c.CanvasRenderingContext2D = Ctx;
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js', 'js/core/settings.js']) vm.runInContext(rd(f), c, { filename: f });
    Object.assign(c.G.MODS, mods);
    Object.assign(c.G, extra);
    vm.runInContext(rd('js/ui/estilo.js'), c, { filename: 'js/ui/estilo.js' });
    return { c, G: c.G, E: c.G.Estilo, clases, Ctx };
  }
  try {
    for (const k of Object.keys(almacen)) delete almacen[k];
    const a = cargarEstilo();
    const pd = { actual: a.E.actual, clase: a.clases.has('estilo-dex') };
    const b = cargarEstilo({ mods: { estiloPorDefecto: 'dex' } });
    const pdDex = { actual: b.E.actual, clase: b.clases.has('estilo-dex') };
    b.E.set('dex');
    const c2 = cargarEstilo();   // «recarga» con lo guardado: gana al valor de mods.js
    const recarga = c2.E.actual;
    c2.E.set('clasico');
    const vuelta = { actual: c2.E.actual, clase: c2.clases.has('estilo-dex'), guardado: JSON.parse(almacen['ps.settings']).estilo };
    const raro = cargarEstilo({ guardado: { estilo: 'arcoiris' } }).E.actual;
    const rechaza = c2.E.set('arcoiris') === false && c2.E.actual === 'clasico';
    t("estilo: el valor por defecto sale de G.MODS.estiloPorDefecto ('clasico' en este lote); la elección se guarda en G.Settings, sobrevive a una recarga y gana al de mods.js; un valor raro vale el de mods.js",
      pd.actual === 'clasico' && !pd.clase && pdDex.actual === 'dex' && pdDex.clase && recarga === 'dex' && vuelta.actual === 'clasico' && !vuelta.clase &&
      vuelta.guardado === 'clasico' && raro === 'clasico' && rechaza, { pd, pdDex, recarga, vuelta, raro });
    const mods = rd('js/core/mods.js');
    t("js/core/mods.js: estiloPorDefecto: 'clasico' mientras se implementa la identidad", /\n  estiloPorDefecto: 'clasico',/.test(mods));
  } catch (e) { t('interruptor de estilo', false, String(e && e.stack || e)); }

  try {
    // Fuente del lienzo: con Dex, «… Pixelify …» pasa a M PLUS (≥ 600 -> 800; el resto, 500); con Clásico, nada.
    for (const k of Object.keys(almacen)) delete almacen[k];
    const { E, Ctx } = cargarEstilo();
    const FAM = '"M PLUS Rounded 1c","Segoe UI",system-ui,sans-serif';
    const casos = {
      '700 13px Pixelify,"Segoe UI",sans-serif': '800 13px ' + FAM, '600 10px Pixelify, monospace': '800 10px ' + FAM,
      '400 11px Pixelify,"Segoe UI",system-ui,sans-serif': '500 11px ' + FAM, '16px Pixelify': '500 16px ' + FAM,
      'bold 12px Pixelify, monospace': '800 12px ' + FAM, '700 14.5px Pixelify': '800 14.5px ' + FAM,
      '12px sans-serif': '12px sans-serif', '700 20px "Segoe UI"': '700 20px "Segoe UI"'
    };
    const x = new Ctx(), clasico = {}, dex = {};
    for (const f of Object.keys(casos)) { x.font = f; clasico[f] = x.font; }
    E.set('dex');
    for (const f of Object.keys(casos)) { x.font = f; dex[f] = x.font; }
    const mal = Object.keys(casos).filter(f => clasico[f] !== f || dex[f] !== casos[f]);
    const cacheIgual = E.fuenteCanvas('700 13px Pixelify') === E.fuenteCanvas('700 13px Pixelify');
    // Las cadenas reales de upstream y de claridad.js: todas cambian con Dex.
    const reales = [];
    for (const f of ['js/ui/hud.js', 'js/entities/fx.js', 'js/entities/player.js', 'js/systems/events.js', 'js/game.js', 'js/ui/slots.js', 'js/entities/claridad.js']) {
      for (const m of rd(f).matchAll(/font = (['`])([^'`$]*?\d+px[^'`]*?Pixelify[^'`]*)\1/g)) reales.push(m[2]);
    }
    // Y las que upstream monta (F() de hud.js, la concatenación de fx.js y la de claridad.js): cada «ctx.font = …»
    // con Pixelify (o F(…) en hud.js) se evalúa tal cual, con las variables libres de comodín, en las dos ramas.
    const montadas = [];
    // F de hud.js (events.js la recibe de hud.js como parámetro).
    const defF = (/const F = \(w, s\) => `[^`]*`;/.exec(rd('js/ui/hud.js').replace(/\r/g, '')) || [''])[0].replace(/^const F = /, '').replace(/;$/, '');
    const evaluar = (expr, verdad) => {
      const comodin = new Proxy(function () {}, { get: (o, k) => (k === Symbol.toPrimitive ? () => 1 : typeof k === 'symbol' ? undefined : verdad ? comodin : undefined) });
      const libres = new Proxy({}, { has: (o, k) => typeof k === 'string' && !['Math', 'String', 'Number', 'F'].includes(k),
        get: (o, k) => (typeof k === 'symbol' ? undefined : verdad ? comodin : 0) });
      const c = { libres }; vm.createContext(c);
      return vm.runInContext('var F = ' + (defF || 'undefined') + '; with (libres) { (' + expr + '); }', c);
    };
    /** La expresión que se asigna a ctx.font: hasta el «;», la «,» o el «)» que la cierran (puede ir dentro de un paréntesis). */
    const expresion = (src, i) => {
      let prof = 0, j = i, cad = null;
      for (; j < src.length; j++) {
        const ch = src[j];
        if (cad) { if (ch === '\\') j++; else if (ch === cad) cad = null; continue; }
        if (ch === "'" || ch === '"' || ch === '`') { cad = ch; continue; }
        if (ch === '(') prof++;
        else if (ch === ')') { if (!prof) break; prof--; }
        else if ((ch === ';' || ch === ',' || ch === '\n') && !prof) break;
      }
      return src.slice(i, j).trim();
    };
    for (const f of ['js/ui/hud.js', 'js/entities/fx.js', 'js/entities/claridad.js', 'js/entities/player.js', 'js/systems/events.js', 'js/game.js', 'js/ui/slots.js']) {
      const src = rd(f).replace(/\r/g, '');
      for (const m of src.matchAll(/\bctx\.font = /g)) {
        const expr = expresion(src, m.index + m[0].length);
        if (!/Pixelify|\bF\(/.test(expr)) continue;
        for (const verdad of [true, false]) {
          try { montadas.push({ f, expr, font: evaluar(expr, verdad) }); } catch (e) { montadas.push({ f, expr, error: String(e.message || e) }); }
        }
      }
    }
    const porFichero = n => montadas.filter(x => x.f === n).length / 2;
    const sinCambio = reales.filter(f => !/^(500|800) \d+(\.\d+)?px "M PLUS Rounded 1c"/.test(E.fuenteCanvas(f)))
      .concat(montadas.filter(x => x.error || typeof x.font !== 'string' || !/Pixelify/.test(x.font) || !/^(500|800) \d+(\.\d+)?px "M PLUS Rounded 1c"/.test(E.fuenteCanvas(x.font))).map(x => x.f + ': ' + x.expr + ' -> ' + (x.error || x.font)));
    t(`fuente del lienzo (setter de CanvasRenderingContext2D.prototype.font): con Clásico ningún cambio; con Dex, «700 13px Pixelify…» -> «800 13px "M PLUS Rounded 1c"…», 600 -> 800, 400 y sin peso -> 500, «bold» -> 800; lo que no es Pixelify, igual; y cada «ctx.font = …» con Pixelify de upstream y de claridad.js, también las montadas (${porFichero('js/ui/hud.js')} con F() en hud.js, ${porFichero('js/entities/fx.js')} en fx.js, ${porFichero('js/entities/claridad.js')} en claridad.js), pasa a M PLUS`,
      !mal.length && cacheIgual && !sinCambio.length && porFichero('js/ui/hud.js') >= 20 && porFichero('js/entities/fx.js') >= 1 && porFichero('js/entities/claridad.js') >= 1 && reales.length >= 6,
      { mal: mal.map(f => ({ f, clasico: clasico[f], dex: dex[f] })), sinCambio, hud: porFichero('js/ui/hud.js'), reales: reales.length });
  } catch (e) { t('fuente del lienzo', false, String(e && e.stack || e)); }

  try {
    // Ajustes: la sección «Estilo» (la primera de Gráficos), los créditos y el texto de los controles.
    for (const k of Object.keys(almacen)) delete almacen[k];
    const { E, G, c: ctxE } = cargarEstilo();
    const caja = () => {
      const B = { html: '', pos: [], insertAdjacentHTML(p, h) { this.pos.push(p); this.html = p === 'afterbegin' ? h + this.html : this.html + h; },
        querySelectorAll(sel) {
          if (sel === '[data-estilo]') return [...B.html.matchAll(/data-estilo="([^"]+)"/g)].map(m => ({ dataset: { estilo: m[1] } }));
          if (sel === 'ul.credits li') return B.lis || [];
          if (sel === 'p.sub') return B.ps || [];
          return [];
        }, querySelector: () => null };
      return B;
    };
    const g = caja();
    g.html = '<h3 class="set-h">Idioma</h3>';
    E.ajustes(g, 'gfx');
    const botones = g.querySelectorAll('[data-estilo]');
    t('Ajustes > Gráficos: «Estilo» es la primera sección, con su texto y los dos botones (Dex y Clásico, el actual marcado)',
      g.pos[0] === 'afterbegin' && /^<h3 class="set-h">Estilo<\/h3>/.test(g.html) && g.html.indexOf('Estilo') < g.html.indexOf('Idioma') &&
      g.html.includes(E.TEXTO_ESTILO) && botones.map(b => b.dataset.estilo).join() === 'dex,clasico' &&
      /data-estilo="clasico" role="radio" aria-checked="true"/.test(g.html) && /data-estilo="dex" role="radio" aria-checked="false"/.test(g.html), g.html);
    const ab = caja(), li = { textContent: 'Fuente: Pixelify Sans (OFL).', despues: '', insertAdjacentHTML(p, h) { this.despues = p + ' ' + h; } };
    ab.lis = [{ textContent: 'Sprites: …', insertAdjacentHTML() {} }, li];
    E.ajustes(ab, 'about');
    t('Ajustes > Acerca de: «Letra del estilo Dex: M PLUS Rounded 1c (OFL)», justo después de Pixelify', /^afterend <li><b>Letra del estilo Dex:<\/b> M PLUS Rounded 1c \(OFL\)\.<\/li>$/.test(li.despues), li.despues);
    const TXT = 'Pon el dedo en cualquier parte y arrastra para moverte: el joystick aparece donde tocas. Toca un ataque de abajo para cambiarlo y el botón de arriba a la derecha para pausar. Se juega en horizontal.';
    const ctl = () => { const k = caja(); k.ps = [{ textContent: TXT }]; return k; };
    const k1 = ctl(); E.ajustes(k1, 'ctl');
    E.set('dex');
    const k2 = ctl(); E.ajustes(k2, 'ctl');
    G.HudDex = { columna: () => true };
    const k3 = ctl(); E.ajustes(k3, 'ctl');
    E.set('clasico');
    const k4 = ctl(); E.ajustes(k4, 'ctl');
    const PLEG = TXT.replace('Se juega en horizontal.', 'Se juega en horizontal (en un plegable abierto o en una tableta, también en vertical).');
    t('Ajustes > Controles: en los dos estilos, «Se juega en horizontal» añade que un plegable abierto o una tableta juegan también en vertical; «de abajo» pasa a «de la derecha» sólo con Dex y las ranuras en columna (G.HudDex, lote 2)',
      PLEG !== TXT && k1.ps[0].textContent === PLEG && k2.ps[0].textContent === PLEG && k3.ps[0].textContent === PLEG.replace('de abajo', 'de la derecha') && k4.ps[0].textContent === PLEG,
      [k1, k2, k3, k4].map(k => k.ps[0].textContent));
    // Tab (input.js): libre con una pantalla abierta o fuera de partida; anulado en partida sin pantalla.
    const tab = (estado, abierta) => { G.Game = estado === null ? undefined : { state: estado }; ctxE.document.querySelector = q => (abierta && /\.scr:not\(\.hidden\)/.test(q) ? {} : null); return E.tabLibre(); };
    const tabs = { ui: tab('ui', false), playing: tab('playing', false), held: tab('held', false), paused: tab('paused', false), levelup: tab('levelup', false),
      pausaAbierta: tab('paused', true), cartasAbiertas: tab('levelup', true), jugandoConPantalla: tab('playing', true), sinJuego: tab(null, false) };
    t("Tab (tabLibre, input.js): libre con una pantalla abierta o fuera de partida ('ui'); anulado en partida sin pantalla ('playing', 'held' mientras un compañero elige fusión, 'paused' o 'levelup' sin su pantalla)",
      tabs.ui && !tabs.playing && !tabs.held && !tabs.paused && !tabs.levelup && tabs.pausaAbierta && tabs.cartasAbiertas && tabs.jugandoConPantalla && tabs.sinJuego, tabs);
    delete G.Game;
    // Las cartas de subida de nivel: --tc, filo, foco con Tab y la píldora (Dex).
    G.Moves = { BY_ID: { ascuas: { type: 'fire' }, lenguetazo: { type: 'ghost' } } };
    const carta = () => {
      const nodo = { nodeType: 3, nodeValue: 'EVOLUCIÓN' }, chip = { style: {}, childNodes: [nodo] };
      return { css: {}, style: { setProperty(k, v) { this.owner.css[k] = v; } }, dataset: {}, clases: new Set(), attrs: {}, teclas: 0, tabIndex: -1,
        classList: { add(k) { this.owner.clases.add(k); } }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k) { if (k === 'keydown') this.teclas++; },
        querySelector: q => (q === '.tag-chip' ? chip : null), chip, nodo, init() { this.style.owner = this; this.classList.owner = this; return this; } }.init();
    };
    const cl = carta(); E.carta(cl, { key: 'new:ascuas', type: 'new', color: '#ff7b3d' });
    E.set('dex');
    const dx = carta(); E.carta(dx, { key: 'up:lenguetazo', type: 'up', color: '#7a6bc4' });
    const ev = carta(); E.carta(ev, { key: 'evo:ascuas', type: 'evo', color: '#ffd23f' });
    const st = carta(); E.carta(st, { key: 'stat:speed', type: 'stat', color: '#8fa3c4' });
    t('cartas de nivel: --tc con el color del tipo (evolución en oro, mejoras con el suyo), filo en Fantasma, tabindex y role=button con Intro en los dos estilos; la píldora con su tinta (Fantasma oscurecido) y sin mayúsculas sólo en Dex',
      cl.css['--tc'] === '#ff7b3d' && cl.tabIndex === 0 && cl.attrs.role === 'button' && cl.teclas === 1 && !cl.chip.style.background && cl.nodo.nodeValue === 'EVOLUCIÓN' &&
      dx.css['--tc'] === '#7a6bc4' && dx.clases.has('tc-filo') && dx.dataset.tipo === 'ghost' && dx.chip.style.background === '#7164B6' && dx.chip.style.color === '#FFFFFF' &&
      ev.css['--tc'] === '#FFCB3D' && ev.nodo.nodeValue === 'Evolución' && st.css['--tc'] === '#8fa3c4' && !st.dataset.tipo,
      { clasico: cl.css, fantasma: [dx.css, dx.chip.style], evo: [ev.css, ev.nodo.nodeValue], mejora: st.css });
  } catch (e) { t('Ajustes y cartas', false, String(e && e.stack || e)); }

  try {
    // Franja de tipo: ≥ 3:1 contra el fondo de la carta (cristal 2) en los 18 tipos, con el filo claro donde no llega.
    const M = marca(), c = { console }; c.window = c; c.G = {}; vm.createContext(c); vm.runInContext(rd('js/core/util.js'), c, { filename: 'js/core/util.js' });
    const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const lum = v => { const [r, g, b] = v.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const fondo = rgb(M.color.cristal2), filo = [238, 246, 247], af = 0.35;
    const tabla = {}, mal = [];
    for (const [tipo, col] of Object.entries(c.G.U.TYPE_COLOR)) {
      const base = ratio(rgb(col), fondo);
      const conFilo = M.tipoConFilo.includes(tipo) ? ratio(rgb(col).map((v, i) => Math.round(v * (1 - af) + filo[i] * af)), fondo) : null;
      tabla[tipo] = +(Math.max(base, conFilo || 0)).toFixed(2);
      if (!(base >= 3 || conFilo >= 3)) mal.push({ tipo, base: +base.toFixed(2), conFilo: conFilo && +conFilo.toFixed(2) });
    }
    t('franja de tipo: ≥ 3:1 contra el fondo de la carta en los 18 tipos (Fantasma, Dragón y Siniestro, con su filo claro de 1 px)', Object.keys(tabla).length === 18 && !mal.length, mal.length ? mal : tabla);
  } catch (e) { t('contraste de la franja', false, String(e && e.stack || e)); }

  try {
    // Lienzos al tamaño en que se ven y sin cortes: encaje() (pura) y los tamaños del compañero y del premio.
    for (const k of Object.keys(almacen)) delete almacen[k];
    const { E } = cargarEstilo();
    const dentro = (e, W, H) => e.fx - e.k * e.caja[0] >= 2 && e.fx + e.k * e.caja[2] <= W - 2 && e.fy - e.k * e.caja[1] >= 2 && e.fy + e.k * e.caja[3] <= H - 2;
    // Cajas opacas medidas en el navegador (píxeles de arte respecto a los pies, dirección 1): Mewtwo y Eternatus.
    const mewtwo = { Idle: [11.5, 32.5, 16.5, 3.5], Attack: [19.5, 31.5, 37.5, 25.5], Shoot: [18.5, 28.5, 25.5, 9.5], Charge: [13.5, 28.5, 15.5, 4.5] };
    const eternatus = { Idle: [48.5, 60.5, 59.5, 23.5], Attack: [48.5, 60.5, 59.5, 23.5] };
    const torchic = { Idle: [10, 23, 10, 2], Attack: [12, 25, 20, 15], Shoot: [11, 24, 14, 4], Charge: [10, 22, 10, 3] };
    const m = E.encaje(mewtwo, 170, 190, 2, true), et = E.encaje(eternatus, 170, 190, 2, true), tc = E.encaje(torchic, 320, 240, 6, true), tq = E.encaje(torchic, 96, 76, 2, false);
    // Upstream (ui.js): escala 2 y pies al 88 % de 190 = 167: el ataque de Mewtwo (25,5 por debajo de los pies) se salía 22 px.
    const upstreamSeSale = 167 + 2 * mewtwo.Attack[3] > 190;
    t('encaje(): Mewtwo en el destacado de 170x190 a ×2 con Idle, Charge, Shoot y Attack, todo dentro con 2 px de margen (con upstream, su ataque se salía por abajo); Eternatus, tan ancho, a ×1; Torchic en el compañero de 320x240 a ×6 sin el ataque que no cabe; sin «vida», sólo Idle',
      upstreamSeSale && m.k === 2 && m.vida.join() === 'Charge,Shoot,Attack' && dentro(m, 170, 190) && et.k === 1 && dentro(et, 170, 190) &&
      tc.k === 6 && !tc.vida.includes('Attack') && tc.vida.includes('Shoot') && dentro(tc, 320, 240) && tq.vida.length === 0 && dentro(tq, 96, 76), { m, et, tc, tq });
  } catch (e) { t('encaje de los sprites', false, String(e && e.stack || e)); }
  try {
    // Tamaños. Dex: compañero 320x240 (208x150 en pantallas bajas y en la columna estrecha), premio ×1 200x180 (160x140) y ×10
    // 132x120 (96x76). Clásico: los de upstream (compañero 260x200 hasta ×4; premio 132x120 a ×2; 96x76 en pantallas bajas).
    const prueba = (alto, estilo = 'dex', ancho = 1440) => {
      for (const k of Object.keys(almacen)) delete almacen[k];
      almacen['ps.settings'] = JSON.stringify({ estilo });
      const lienzo = () => ({ width: 300, height: 150, getContext: () => ({}), getAttribute: () => null, replaceWith(x) { this.por = x; } });
      const fot = (w, h, ax, ay) => ({ w, h, ax, ay, n: 1, r: 8 });
      const { E, c } = cargarEstilo({ alto, ancho, extra: { Sprites: { PX: 2, meta: () => ({ a: { Idle: 1, Attack: 1 } }), animMeta: (d, a) => (a === 'Idle' ? fot(24, 32, 12, 24) : fot(40, 48, 20, 30)),
        sheet: () => ({ ready: false }), preload: () => null, Animator: class { constructor() { this.scale = 1; } loop() {} } } } });
      c.document.createElement = lienzo;
      const viejo = Object.assign(lienzo(), { id: 'menu-partner', className: 'stage', width: 260, height: 200 });
      E.companero(viejo, 4, { shiny: false });
      const comp = { w: viejo.por.width, h: viejo.por.height, id: viejo.por.id, clase: viejo.por.className, e: E.colocacion(viejo.por) };
      const premio = (n, rareza) => {
        const v = lienzo(), card = { clases: [], querySelector: () => v, classList: { add: k => card.clases.push(k) } };
        E.premio(card, { dex: 150, rarity: rareza, shiny: false }, n);
        return { w: v.por.width, h: v.por.height, clase: card.clases[0], e: E.colocacion(v.por) };
      };
      return { comp, x1: premio(1, 5), x10: premio(10, 2) };
    };
    {
      const pc = prueba(900), mv = prueba(390), pl = prueba(784, 'dex', 724), plH = prueba(724, 'dex', 784);
      t('Dex: compañero del menú en un lienzo de 320x240 (208x150 en pantallas bajas y en la columna estrecha de un plegable en vertical, 724x784) que releva al de upstream con su id y su clase, hasta ×6; premio ×1 de 200x180 (160x140 en bajas) y ×10 de 132x120 (96x76; 120x110 en una pantalla alta de menos de 800 de ancho, 724x784 y 784x724), con su clase',
        pc.comp.w === 320 && pc.comp.h === 240 && pc.comp.id === 'menu-partner' && pc.comp.clase === 'stage' && pc.comp.e && pc.comp.e.k >= 1 && pc.comp.e.k <= 6 &&
        mv.comp.w === 208 && mv.comp.h === 150 && pl.comp.w === 208 && pl.comp.h === 150 && plH.comp.w === 320 &&
        pl.x10.w === 120 && pl.x10.h === 110 && plH.x10.w === 120 && plH.x1.w === 200 && pl.x10.e.k <= 3 &&
        pc.x1.w === 200 && pc.x1.h === 180 && pc.x1.clase === 'premio-1' && mv.x1.w === 160 && mv.x1.h === 140 &&
        pc.x10.w === 132 && pc.x10.h === 120 && mv.x10.w === 96 && mv.x10.h === 76 && mv.x10.clase === 'premio-10' && pc.x1.e.k <= 4 && mv.x10.e.k <= 2, { pc, mv, pl: pl.comp });
      const cpc = prueba(900, 'clasico'), cmv = prueba(390, 'clasico'), cpl = prueba(784, 'clasico', 724);
      t('Clásico = upstream: el compañero en el lienzo de upstream (260x200, hasta ×4) en todas las pantallas, y el premio en el suyo (132x120 a ×2; 96x76 en pantallas bajas y, en la ×10 de una pantalla alta y estrecha, 120x110), sin cortes',
        [cpc, cmv, cpl].every(x => x.comp.w === 260 && x.comp.h === 200 && x.comp.id === 'menu-partner' && x.comp.e && x.comp.e.k <= 4) &&
        cpc.x1.w === 132 && cpc.x1.h === 120 && cpc.x1.e.k <= 2 && cpc.x10.w === 132 && cpc.x10.h === 120 && cmv.x1.w === 96 && cmv.x1.h === 76 && cmv.x10.w === 96 && cmv.x10.h === 76 &&
        cpl.x1.w === 132 && cpl.x10.w === 120 && cpl.x10.h === 110 && cpl.x10.e.k <= 2,
        { cpc, cmv: cmv.comp });
    }
  } catch (e) { t('lienzos del compañero y del premio', false, String(e && e.stack || e)); }

  try {
    // disposicion(): bandas y zona libre del HUD (lote 2) y la pantalla dividida opcional.
    for (const k of Object.keys(almacen)) delete almacen[k];
    const { E } = cargarEstilo();
    const S0 = { sup: 0, der: 0, inf: 0, izq: 0 }, muesca = { sup: 0, der: 47, inf: 21, izq: 47 };
    const d = (w, h, op = {}) => E.disposicion(w, h, Object.assign({ seguras: S0 }, op));
    const m844 = d(844, 390), m780 = d(780, 360), m800 = d(800, 340), se = d(568, 320), ms = d(844, 390, { seguras: muesca, columnaIzq: 104 });
    const pc = d(1440, 900), fhd = d(1920, 1080), p1280 = d(1280, 720);
    const pleg = d(800, 870), plegH = d(870, 800);
    const dv = d(800, 870, { dividida: 'auto' }), dh = d(1440, 900, { dividida: 'auto' }), dm = d(844, 390, { dividida: 'derecha' }), dp = d(800, 870, { dividida: 'abajo', proporcion: 0.45 });
    const pct = x => +((x.bandas.sup + x.bandas.inf) / x.juego.h * 100).toFixed(1);
    const dentro = x => x.libre.x >= x.juego.x && x.libre.y >= x.juego.y && x.libre.x + x.libre.w <= x.juego.x + x.juego.w + 1e-9 && x.libre.y + x.libre.h <= x.juego.y + x.juego.h + 1e-9;
    const todas = [m844, m780, m800, se];
    t('disposición compacta (alto < 520), con el criterio de Nico (≤ 20 % del alto, objetivo 18-20 %): banda superior de 74 px a 844x390 (19,0 %), 69 a 780x360, 65 a 800x340 y 63 a 568x320, todas entre el 18 y el 20 %, y abajo nada; ranuras en columna a la derecha (62 px a 844x390, con ranuras de 48 y el margen; 54 si es estrecha y muy baja); con muesca, los márgenes la respetan',
      m844.variante === 'compacto' && m844.bandas.sup === 74 && m844.bandas.inf === 0 && m844.bandas.der === 62 && m844.ranuras === 'columna' &&
      m780.bandas.sup === 69 && m800.bandas.sup === 65 && se.bandas.sup === 63 && se.bandas.der === 6 + 44 + 4 && todas.every(x => pct(x) >= 18 && pct(x) <= 20) &&
      ms.bandas.der === 47 + 48 + 6 && ms.bandas.izq === 47 + 100 + 6 && ms.libre.w === 844 - 101 - 153 && dentro(ms),
      { m844: [m844.bandas, pct(m844)], m780: [m780.bandas, pct(m780)], m800: [m800.bandas, pct(m800)], se: [se.bandas, pct(se)], ms: ms.bandas });
    t('disposición de escritorio: escala 1,25 a 1440x900 y también a 1920x1080 (tope de Nico; 1 a 1280x720); pila de arriba de 203 px y fila de ranuras abajo de 129 a 1440x900 y a 1920x1080 (piezas más finas que las de la guía); un plegable desplegado estrecho (800x870, 870x800: la entrada del jefe no cabe entre las columnas) va en compacto, con las piezas ×1,15',
      pc.variante === 'escritorio' && pc.escala === 1.25 && pc.bandas.sup === 203 && pc.bandas.inf === 129 && pc.ranuras === 'fila' && fhd.escala === 1.25 && fhd.bandas.sup === 203 && p1280.escala === 1 &&
      pleg.variante === 'compacto' && plegH.variante === 'compacto' && pleg.kc === 1.15 && pleg.ranuras === 'columna' && dentro(pc) && dentro(pleg), { pc: pc.bandas, fhd: fhd.bandas, pleg: [pleg.variante, pleg.kc, pleg.bandas] });
    t("pantalla dividida (opcional, estilo DS): 'auto' pone los controles abajo en un plegable (800x870: juego arriba de 435) y a la derecha en apaisado; el juego y los controles no se pisan y la zona libre queda dentro del juego",
      dv.dividida === 'abajo' && dv.juego.h === 435 && dv.controles.y === 435 && dv.controles.h === 435 && dv.ranuras === 'controles' && dv.bandas.inf === 0 && dentro(dv) &&
      dh.dividida === 'derecha' && dh.juego.w === 720 && dh.controles.x === 720 && dentro(dh) && dm.variante === 'compacto' && dm.bandas.der === 0 && dm.juego.w === 422 &&
      dp.controles.h === Math.round(870 * 0.45) && dp.juego.h + dp.controles.h === 870,
      { dv: [dv.juego, dv.controles, dv.libre], dh: [dh.juego, dh.controles], dm: [dm.juego, dm.bandas], dp: [dp.juego, dp.controles] });
  } catch (e) { t('disposición del HUD', false, String(e && e.stack || e)); }

  // ---- D. css/nico.css: los arreglos van en los dos estilos y la piel sólo bajo html.estilo-dex ----
  try {
    const css = rd('css/nico.css').replace(/\/\*[\s\S]*?\*\//g, '');
    const corte = css.indexOf('html.estilo-dex body');
    const reglas = parte => {
      const out = [];
      for (const m of parte.matchAll(/([^{};]+)\{/g)) {
        const sel = m[1].trim();
        if (!sel || sel.startsWith('@') || /^(from|to|\d+%)$/.test(sel)) continue;
        let prof = 0, cur = '';
        for (const ch of sel) { if (ch === '(') prof++; if (ch === ')') prof--; if (ch === ',' && !prof) { out.push(cur.trim()); cur = ''; } else cur += ch; }
        out.push(cur.trim());
      }
      return out;
    };
    const siempre = reglas(css.slice(0, corte)), dex = reglas(css.slice(corte));
    const malSiempre = siempre.filter(s => /estilo-dex/.test(s)), malDex = dex.filter(s => !s.startsWith('html.estilo-dex'));
    // css/portada.css (la «Tarjeta de entrenador», PokéSwarm): todo con Dex, salvo esconder la tarjeta en Clásico.
    const pc = rd('css/portada.css').replace(/\/\*[\s\S]*?\*\//g, ''), rp = reglas(pc);
    const malPortada = rp.filter(s => s !== '#tc-card' && !s.startsWith('html.estilo-dex'));
    t('css/portada.css: la portada «Tarjeta de entrenador» sólo con Dex (en Clásico, sólo #tc-card { display: none }); el Rotom-Dex delante del nombre sale de --marca-rotom (css/tokens-dex.css)',
      rp.length > 80 && !malPortada.length && /#tc-card \{ display: none; \}/.test(pc) && /--marca-rotom: url\("data:image\/svg\+xml/.test(rd('css/tokens-dex.css')) &&
      /background: var\(--marca-rotom\)/.test(pc), malPortada.slice(0, 5));
    t('css/nico.css: el bloque «siempre» (arreglos de los dos estilos) no depende del estilo y toda la piel Dex va bajo html.estilo-dex (Clásico = upstream + arreglos)',
      corte > 0 && siempre.length > 20 && dex.length > 150 && !malSiempre.length && !malDex.length, { malSiempre, malDex: malDex.slice(0, 5) });
    t('css/nico.css: el menú principal se oculta con cualquier .scr.dim abierta, en los dos estilos',
      siempre.includes('body:has(.scr.dim:not(.hidden)) #scr-menu') && /body:has\(\.scr\.dim:not\(\.hidden\)\) #scr-menu \{ visibility: hidden; \}/.test(css));
    t('css/nico.css no escala por CSS los lienzos del premio ni los destacados del gacha (width/height: auto) y, en Dex, tampoco el del compañero (en Clásico, el de upstream con su escalado de upstream)',
      /html\.estilo-dex #scr-menu #menu-partner \{ width: auto; height: auto; \}/.test(css) && !/\n#scr-menu #menu-partner \{ width: auto; height: auto; \}/.test(css) &&
      /#pull-results \.pcard canvas \{ width: auto; height: auto;/.test(css) && /#banner \.feat canvas \{ width: auto; height: auto; \}/.test(css));
    t('css/nico.css: en el fin de partida las estadísticas no se encogen (la caja se desplaza bajo «Volver al menú») y la capa «Probabilidades» no hereda la rejilla del gacha de una pantalla baja',
      /#scr-over #over-stats \{ flex-shrink: 0; \}/.test(css) && !/#scr-over #over-stats \{ min-height: 0; \}/.test(css) &&
      /#scr-gacha > \.box:not\(#gacha-prob-capa\) \{/.test(css) && !/#scr-gacha > \.box \{/.test(css) && /#scr-gacha > \.box:not\(#gacha-prob-capa\) > \.row\.between \{ display: contents; \}/.test(css));
    t('avisos centrados (logros y mensajes): su animación de entrada conserva el translateX(-50%) (la «pop» de upstream lo anulaba y entraban desplazados)',
      /\.toast, \.ach-pop \{ animation-name: pop-centrado; \}/.test(css) && /@keyframes pop-centrado \{ from \{ transform: translateX\(-50%\) scale\(\.94\);[^}]*\} to \{ transform: translateX\(-50%\);/.test(css) &&
      /\.toast \{[^}]*transform: translateX\(-50%\)[^}]*animation: pop/.test(rd('css/style.css').replace(/\r/g, '')));
    const sw = rd('sw.js');
    t('sw.js guarda assets/fonts en caché (las fuentes de Dex funcionan sin internet tras la primera carga)', /assets\\\/\(pokemon\|icons\|fonts\)/.test(sw));
  } catch (e) { t('css/nico.css', false, String(e && e.stack || e)); }

  // ---- E. Inglés, finales de línea y ajustes documentados ----
  try {
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {};
    c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    const EN = c.G.I18n.t;
    const leg = /<span>([^<]+)<\/span><!-- MOD nico -->/.exec(rd('dev.html'));
    const textos = ['Estilo', 'Dex', 'Clásico', 'Dex: menús y HUD de Pokédex y letra redondeada. Clásico: menús de pixel art y letra pixelada.', 'Letra del estilo Dex:',
      'Probabilidades', 'Cerrar', leg ? leg[1] : '(falta el texto legal)',
      'Pon el dedo en cualquier parte y arrastra para moverte: el joystick aparece donde tocas. Toca un ataque de abajo para cambiarlo y el botón de arriba a la derecha para pausar. Se juega en horizontal (en un plegable abierto o en una tableta, también en vertical).',
      'Pon el dedo en cualquier parte y arrastra para moverte: el joystick aparece donde tocas. Toca un ataque de la derecha para cambiarlo y el botón de arriba a la derecha para pausar. Se juega en horizontal (en un plegable abierto o en una tableta, también en vertical).'];
    const sin = textos.filter(s => s !== 'Dex' && EN(s) === s);
    t('todos los textos nuevos tienen inglés (i18n.js real): Estilo, Clásico, su explicación, los créditos, «Probabilidades», «Cerrar», el aviso legal y los controles (el plegable en vertical, con las ranuras abajo y a la derecha)', !sin.length, sin);
  } catch (e) { t('inglés de la identidad', false, String(e && e.stack || e)); }
  try {
    // Los nuevos de los mapas propios (los que falten ya los apunta §23) y sus herramientas, si están.
    const NUEVOS_MAPAS = [...MAPAS, 'tools/nico/mapas/vista.js', 'tools/nico/mapas/medir.js'];
    const ficheros = ['dev.html', 'css/style.css', 'css/tokens-dex.css', 'css/nico.css', 'js/ui/marca.js', 'js/ui/estilo.js', 'js/ui/settings-ui.js', 'js/ui/run-ui.js',
      'js/ui/menu.js', 'js/ui/gacha-ui.js', 'js/game.js', 'js/core/mods.js', 'js/data/lang-en-mod.js', 'js/entities/claridad.js', 'CREDITS.md', 'assets/fonts/OFL-MPLUSRounded1c.txt',
      'tools/nico/check.js', 'js/ui/hud.js', 'js/ui/hud-dex.js', 'js/systems/events.js', 'tools/nico/coop-e2e.js', 'css/portada.css', 'js/ui/portada.js',
      'tools/nico/iconos.py', 'js/main.js', 'js/ui/ui.js', '404.html', 'contacto/index.html', 'manifest.webmanifest',
      'js/world/entorno.js', 'js/world/horno.js', 'js/world/tiles.js', 'js/world/world.js', 'js/systems/weather.js'].concat(ex('tools/nico/estilo-e2e.js') ? ['tools/nico/estilo-e2e.js'] : [], NUEVOS_MAPAS.filter(ex));
    const mezcla = ficheros.filter(f => { const s = rd(f), crlf = (s.match(/\r\n/g) || []).length, lf = (s.match(/\n/g) || []).length; return crlf && crlf !== lf; });
    const nuevosCRLF = ['css/tokens-dex.css', 'css/nico.css', 'js/ui/marca.js', 'js/ui/estilo.js', 'js/ui/hud-dex.js', 'assets/fonts/OFL-MPLUSRounded1c.txt',
      'css/portada.css', 'js/ui/portada.js', 'tools/nico/iconos.py', 'js/world/entorno.js', 'js/world/horno.js', ...NUEVOS_MAPAS.filter(ex)].filter(f => /\r/.test(rd(f)));
    t('finales de línea: ningún fichero tocado mezcla CRLF y LF, y los nuevos van en LF (también los 4 de los mapas propios y sus herramientas de tools/nico/mapas/)', !mezcla.length && !nuevosCRLF.length, { mezcla, nuevosCRLF });
  } catch (e) { t('finales de línea', false, String(e && e.stack || e)); }
  try {
    const c = { console }; c.window = c; c.G = {}; vm.createContext(c); vm.runInContext(rd('js/core/mods.js'), c, { filename: 'js/core/mods.js' });
    const md = rd('CLAUDE.md');
    const sin = Object.keys(c.G.MODS).filter(k => /^[a-z]/.test(k) && typeof c.G.MODS[k] !== 'function' && !md.includes('`' + k + '`'));
    t('cada ajuste de js/core/mods.js tiene su fila en la tabla de CLAUDE.md', !sin.length, sin);
  } catch (e) { t('ajustes documentados', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`identidad visual: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`identidad: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 15. HUD Dex (js/ui/hud-dex.js) y su red de seguridad ----------------
// Huellas de lo que upstream pinta en el HUD (sha1 sin CR y sin las líneas «MOD nico»). Si upstream cambia hud.js o
// la parte de dibujo de events.js, FALLO: hay que mirar el cambio, portarlo a js/ui/hud-dex.js y poner aquí la huella nueva.
const HUELLA_HUD = 'bf063dc4dcef03350fe2cd237b0bd752d23d4db2';
const HUELLA_EVENTOS_HUD = '4348077c74d1e2721c8baab78453d0d132f05768';
const sinModNico = s => s.replace(/\r/g, '').split('\n').filter(l => !/MOD nico/.test(l)).join('\n');
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex');
/** La parte de dibujo de events.js: drawHud y edgeArrow (de su comentario al return). */
const eventosHud = s => { const a = s.indexOf('  /** Flecha en el borde hacia el Pokémon perdido'), b = s.indexOf('  return {', a); return a < 0 || b < 0 ? '' : s.slice(a, b); };
/** Lo que lee el HUD de upstream: pl.x, st.x y G.Modulo.x (con lo que se llama encadenado). */
function inventarioHud(src) {
  const s = src.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, ''), out = new Set();
  for (const m of s.matchAll(/\bpl\.(\w+)/g)) out.add('pl.' + m[1]);
  for (const m of s.matchAll(/\bst\.(\w+)/g)) out.add('st.' + m[1]);
  for (const m of s.matchAll(/\bG\.(\w+)\.(\w+)/g)) if (!['HUD', 'MODS', 'Estilo'].includes(m[1])) out.add('G.' + m[1] + '.' + m[2]);
  return out;
}

/** Un CanvasRenderingContext2D de mentira que apunta cada operación con su caja en coordenadas de pantalla. */
class LienzoFalso {
  constructor() {
    this.ops = []; this.pila = []; this.m = [1, 0, 0, 1, 0, 0]; this.camino = null;
    Object.assign(this, { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic', globalAlpha: 1, lineJoin: 'miter' });
  }
  get profundidad() { return this.pila.length; }
  save() { this.pila.push({ m: this.m.slice(), fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, lineWidth: this.lineWidth, font: this.font, textAlign: this.textAlign, textBaseline: this.textBaseline, globalAlpha: this.globalAlpha, lineJoin: this.lineJoin }); }
  restore() { const e = this.pila.pop(); if (e) { const { m, ...r } = e; this.m = m; Object.assign(this, r); } }
  setTransform(a, b, c, d, e, f) { this.m = [a, b, c, d, e, f]; }
  translate(x, y) { const m = this.m; m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; }
  scale(x, y) { const m = this.m; m[0] *= x; m[1] *= x; m[2] *= y; m[3] *= y; }
  rotate() {}
  pt(x, y) { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  caja(x0, y0, x1, y1) { const a = this.pt(x0, y0), b = this.pt(x1, y1); return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), x2: Math.max(a[0], b[0]), y2: Math.max(a[1], b[1]) }; }
  beginPath() { this.camino = null; }
  anadir(c) { const p = this.camino; this.camino = p ? { x: Math.min(p.x, c.x), y: Math.min(p.y, c.y), x2: Math.max(p.x2, c.x2), y2: Math.max(p.y2, c.y2) } : c; }
  moveTo(x, y) { this.anadir(this.caja(x, y, x, y)); }
  lineTo(x, y) { this.anadir(this.caja(x, y, x, y)); }
  arcTo(x1, y1, x2, y2) { this.anadir(this.caja(x1, y1, x1, y1)); this.anadir(this.caja(x2, y2, x2, y2)); }
  arc(x, y, r) { this.anadir(this.caja(x - r, y - r, x + r, y + r)); }
  ellipse(x, y, rx, ry) { this.anadir(this.caja(x - rx, y - ry, x + rx, y + ry)); }
  rect(x, y, w, h) { this.anadir(this.caja(x, y, x + w, y + h)); }
  roundRect(x, y, w, h) { this.rect(x, y, w, h); }
  closePath() {}
  clip() {}
  apuntar(op, caja, estilo) { if (caja) this.ops.push({ op, ...caja, estilo, alfa: this.globalAlpha }); }
  fill() { this.apuntar('fill', this.camino, this.fillStyle); }
  stroke() { this.apuntar('stroke', this.camino, this.strokeStyle); }
  fillRect(x, y, w, h) { this.apuntar('fill', this.caja(x, y, x + w, y + h), this.fillStyle); }
  strokeRect(x, y, w, h) { this.apuntar('stroke', this.caja(x, y, x + w, y + h), this.strokeStyle); }
  clearRect() {}
  tam() { const m = /(\d+(?:\.\d+)?)px/.exec(this.font); return m ? +m[1] : 10; }
  measureText(t) { return { width: String(t).length * this.tam() * (/^8\d\d/.test(this.font) ? 0.62 : 0.56) }; }
  texto(op, t, x, y) {
    const w = this.measureText(t).width, s = this.tam(), al = this.textAlign;
    const x0 = al === 'center' ? x - w / 2 : al === 'right' || al === 'end' ? x - w : x;
    const p = this.pt(x0, y), q = this.pt(x0 + w, y);
    this.ops.push({ op, texto: String(t), x: p[0], y: p[1] - s * 0.72, x2: q[0], y2: p[1] + s * 0.2, base: p[1], estilo: op === 'texto' ? this.fillStyle : this.strokeStyle, fuente: this.font, tam: s, alfa: this.globalAlpha, ancla: this.pt(x, y) });
  }
  fillText(t, x, y) { this.texto('texto', t, x, y); }
  strokeText(t, x, y) { this.texto('contorno', t, x, y); }
  drawImage(img, ...a) { const [x, y, w, h] = a.length >= 8 ? a.slice(4) : a.length >= 4 ? a : [a[0], a[1], 0, 0]; this.apuntar('imagen', this.caja(x, y, x + w, y + h), null); }
  createRadialGradient() { const g = { paradas: [], addColorStop(o, c) { this.paradas.push(c); } }; return g; }
  createLinearGradient() { return this.createRadialGradient(); }
}

/** El juego mínimo para js/ui/hud-dex.js (y js/ui/hud.js de upstream), con los ficheros reales del HUD. */
function cargarHud({ w = 1440, h = 900, tactil = false, estilo = 'dex', seguras = { sup: 0, der: 0, inf: 0, izq: 0 }, hudSrc = null, fallar = false } = {}) {
  const reloj = { t: 1000 };
  const almacenH = {};
  const c = {
    console: { log() {}, warn() { c.__avisos.push([...arguments].map(String).join(' ')); }, error() {} }, __avisos: [],
    innerHeight: h, innerWidth: w, performance: { now: () => reloj.t },
    localStorage: { getItem: k => (k in almacenH ? almacenH[k] : null), setItem: (k, v) => { almacenH[k] = String(v); } },
    matchMedia: () => ({ matches: false }), navigator: {}, location: { protocol: 'file:' },
    document: { documentElement: { classList: { toggle() {}, contains: () => false } }, getElementById: () => null, querySelector: () => null, body: null,
      // document.fonts con su evento «loadingdone» (la prueba lo dispara: ver M9).
      fonts: { load: () => Promise.resolve([]), addEventListener(tipo, fn) { (c.__fuentes[tipo] = c.__fuentes[tipo] || []).push(fn); } } },
    __fuentes: {}
  };
  function Ctx() {}
  Object.defineProperty(Ctx.prototype, 'font', { configurable: true, enumerable: true, get() { return this._f; }, set(v) { this._f = v; } });
  c.CanvasRenderingContext2D = Ctx;
  c.window = c; c.G = {};
  vm.createContext(c);
  for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js', 'js/core/settings.js']) vm.runInContext(rd(f), c, { filename: f });
  const G = c.G;
  // Lo que el HUD lee del juego, a mano: cada prueba lo cambia.
  const botones = [];
  const juego = { banner: null, jefes: [], shinies: [], otros: [], rift: null, inArena: false, timeLeft: 0, mates: [], clima: null, bioma: 'Bosque Umbrío' };
  G.Touch = { active: tactil, clearButtons() { botones.length = 0; }, addButton(x, y, bw, bh, fn, pad = 6) { botones.push({ x, y, w: bw, h: bh, fn, pad }); } };
  G.Camera = { scale: 1, left: () => 0, top: () => 0 };
  G.EnemyMgr = { all: () => [...juego.jefes, ...juego.otros], shinies: () => juego.shinies.filter(e => !e.dead), bossAlive: () => juego.jefes.some(e => !e.dead) };
  G.World = { biomeName: () => juego.bioma };
  G.Weather = { get current() { return juego.clima; }, KINDS: { rain: { name: 'Lluvia', icon: 'wrain' }, sun: { name: 'Sol abrasador', icon: 'wsun' } } };
  G.Rift = { get rift() { return juego.rift; }, get inArena() { return juego.inArena; }, get timeLeft() { return juego.timeLeft; } };
  G.Spawner = { banner: () => juego.banner };
  G.Coop = { get active() { return juego.mates.length > 0; }, get mates() { return juego.mates; }, players: () => [juego.pl, ...juego.mates.map(m => m.pl)], isHost: false };
  G.Icons = { draw(ctx, n, x, y, s) { ctx.fillStyle = '#ICONO'; ctx.fillRect(x, y, s, s); } };
  class Animator { constructor(dex, scale) { this.dex = dex; this.scale = scale; this.dir = 0; } loop() {} update() {} draw(ctx, x, y) { ctx.drawImage({}, x - 10, y - 20, 20, 20); } }
  G.Sprites = { PX: 2, animMeta: () => { if (fallar) throw new Error('fallo forzado'); return { ay: 24 }; }, Animator, bodyRadius: () => 10, bodyHeight: () => 30 };
  G.Items = { BY: { leftovers: { name: 'Restos' } } };
  G.Player = { REVIVE_TIME: 3 };
  G.Audio = { sfx() {} };
  G.DEX_BY = { 25: { name: 'Pikachu' }, 52: { name: 'Meowth' } };
  G.Game = { state: 'playing', togglePause() { G.Game.pausado = !G.Game.pausado; }, st: { time: 100 } };
  vm.runInContext(rd('js/ui/estilo.js'), c, { filename: 'js/ui/estilo.js' });
  G.Estilo.set(estilo);
  vm.runInContext(rd('js/systems/events.js'), c, { filename: 'js/systems/events.js' });
  vm.runInContext(hudSrc || rd('js/ui/hud.js'), c, { filename: 'js/ui/hud.js' });
  vm.runInContext(rd('js/ui/hud-dex.js'), c, { filename: 'js/ui/hud-dex.js' });
  // Tu Pokémon: 4 ataques, objeto, vínculo y mejoras.
  const mov = (id, type, lvl, extra) => Object.assign({ id, type, name: id, lvl, t: 0, cd: 1, kind: 'shot', def: { maxLvl: 5 } }, extra);
  const pl = juego.pl = {
    x: 0, y: 0, dex: 25, mon: { name: 'Crabominable', dex: 25 }, anim: { shiny: false }, level: 12, hp: 41, maxHp: 90, xp: 30, xpNext: 100, kills: 1204, coins: 87,
    buffs: { atk: { n: 2 }, spd: { n: 1 }, def: { n: 1 }, regen: { n: 1 } }, power: { def: { name: 'Furia', color: '#FF7A5C' }, t: 12 },
    slots: [[mov('ember', 'fire', 3)], [mov('surf', 'water', 2)], [mov('tackle', 'normal', 5, { evolved: true })], [mov('a', 'grass', 1), mov('b', 'ice', 1)]],
    active: 1, cdMul: 1, setActive(i) { this.active = i; }, bonds: 2, item: 'leftovers', dead: false, reviveT: 0, bodyH: 30
  };
  const st = { time: 100 };
  const lienzo = () => new LienzoFalso();
  const pintar = (ctx = lienzo(), ww = w, hh = h) => { reloj.t += 16; G.HUD.draw(ctx, ww, hh, pl, st); return ctx; };
  G.Estilo.zonasSeguras = () => seguras;
  return { c, G, pl, st, juego, botones, reloj, pintar, lienzo, seguras };
}
/** Un jefe (o legendario) en coordenadas de mundo (con la cámara en 0,0 y escala 1, son las de pantalla). */
const jefeFalso = (x, y, f = 0.64, extra = {}) => Object.assign({ id: 7, boss: true, dead: false, dex: 983, name: 'Kingambit', types: ['dark', 'steel'], hp: 1000 * f, maxHp: 1000, x, y, bodyH: 60, shiny: false }, extra);
const mateFalso = (name, color, x, y, extra = {}) => ({ name, color, connected: true, pl: Object.assign({ x, y, hp: 50, maxHp: 80, dead: false, bodyH: 30 }, extra) });
/** Todo a la vez: jefe, aviso, 4 ranuras, objeto, vínculo, chips (4 mejoras, poder, horda), clima y 3 compañeros. */
function escenaCompleta(H, { lejos = false } = {}) {
  const { juego, G } = H;
  juego.jefes = [jefeFalso(H.c.innerWidth * 0.6, H.c.innerHeight * 0.55)];
  juego.banner = { text: '¡Kingambit salvaje apareció!', t: 3.2 };
  juego.clima = { name: 'Lluvia', icon: 'wrain', left: 67, mult: { water: 1.5, electric: 1.2, fire: 0.5 } };
  // Cerca: en la zona libre, a la vista (sin flechas); lejos: fuera de la pantalla (con flechas).
  const W = H.c.innerWidth, Hh = H.c.innerHeight, d = lejos ? 5000 : 0;
  juego.mates = [mateFalso('Ana', '#5FC8FF', W / 2 - 60 + d, Hh / 2), mateFalso('Leo', '#7EE07A', W / 2 + 60, Hh / 2 + 40 + d), mateFalso('Sol', '#FF8AD8', W / 2 - d, Hh / 2 - 40)];
  G.Events.onNet(['ev', 's', 'horde', 'fire']);
}

function hudDexChecks() {
  console.log('15. HUD Dex (js/ui/hud-dex.js): presupuesto, solapes, escala, jefe, flechas, avisos, toques, red de seguridad');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const solapan = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  /** Las piezas del último fotograma, como lista de rectángulos con nombre (la ranura activa, donde se pinta). */
  const piezas = (G, pl) => {
    const P = G.HudDex.bandas().piezas, L = [];
    for (const k of ['ficha', 'contador', 'rotom', 'pausa', 'jefe', 'aviso', 'objeto', 'grupo']) if (P[k]) L.push({ n: k, ...P[k] });
    (P.chips || []).forEach((x, i) => L.push({ n: 'chip' + i, ...x }));
    if (!P.grupo) (P.companeros || []).forEach((x, i) => L.push({ n: 'comp' + i, ...x }));
    const B = G.HudDex.bandas();
    (P.ranuras || []).forEach((x, i) => {
      const on = i === pl.active;
      L.push({ n: 'ranura' + i, x: x.x - (on && B.variante === 'compacto' && B.columna ? P.desplazamiento : 0), y: x.y - (on && !B.columna ? P.elevacion || 0 : 0), w: x.w, h: x.h });
    });
    if (P.vinculo && !P.vinculo.insignia) L.push({ n: 'vinculo', ...P.vinculo });
    return L;
  };

  // ---- A. Presupuesto en compacto (criterio de Nico: ≤ 20 % del alto arriba + abajo; columnas ≤ 22 % del ancho) ----
  try {
    const filas = [];
    for (const [w, h] of [[844, 390], [780, 360], [800, 340], [568, 320]]) {
      const H = cargarHud({ w, h, tactil: true });
      escenaCompleta(H);
      H.pintar(); H.reloj.t += 2000;
      const ctx = H.pintar();
      const B = H.G.HudDex.bandas();
      // Medido en lo pintado: lo más bajo de lo anclado arriba (todo lo que empieza en la mitad de arriba, menos
      // las columnas laterales y las flechas) y lo más alto de lo anclado abajo.
      const cols = B.izq + 0.5, colD = w - B.der - 0.5;
      const arriba = ctx.ops.filter(o => o.y < h / 2 && o.x2 > cols && o.x < colD && o.y2 < h / 2 + 40).map(o => o.y2);
      const sup = Math.max(...arriba), inf = 0;
      const pct = (sup + inf) / h * 100, lat = (B.izq + B.der) / w * 100;
      filas.push({ vp: `${w}x${h}`, sup: Math.round(sup), bandas: B.sup, pct: +pct.toFixed(1), laterales: +lat.toFixed(1), variante: B.variante });
    }
    t('compacto, con jefe, aviso, 4 ranuras, objeto, vínculo, chips, clima y 3 compañeros a la vez: arriba + abajo ≤ 20 % del alto (criterio de Nico; medido en lo pintado) a 844x390, 780x360, 800x340 y 568x320, y las columnas laterales ≤ 22 % del ancho',
      filas.every(f => f.variante === 'compacto' && f.pct <= 20 && f.sup <= f.bandas + 0.5 && f.laterales <= 22), filas);
  } catch (e) { t('presupuesto del HUD compacto', false, String(e && e.stack || e)); }

  // ---- B. Sin solapes, dentro de la pantalla y de las zonas seguras ----
  try {
    const malos = [], visto = [];
    const VPS = [[1024, 768], [1280, 720], [1366, 657], [1440, 900], [1920, 1080], [844, 390, true, { sup: 0, der: 47, inf: 21, izq: 47 }], [780, 360, true],
      [724, 784, true], [784, 724, true], [869, 941, true], [941, 869, true], [360, 807, true], [807, 360, true], [784, 362, true], [800, 870, true]];
    for (const [w, h, tactil = false, seguras] of VPS) {
      const H = cargarHud({ w, h, tactil, seguras: seguras || { sup: 0, der: 0, inf: 0, izq: 0 } });
      escenaCompleta(H);
      H.pintar();
      const L = piezas(H.G, H.pl), B = H.G.HudDex.bandas(), sg = H.seguras;
      visto.push(`${w}x${h}:${B.variante}`);
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) if (solapan(L[i], L[j])) malos.push(`${w}x${h} ${L[i].n}/${L[j].n}`);
      for (const p of L) if (p.x < sg.izq - 0.5 || p.y < sg.sup - 0.5 || p.x + p.w > w - sg.der + 0.5 || p.y + p.h > h - sg.inf + 0.5) malos.push(`${w}x${h} ${p.n} fuera`);
    }
    t('sin solapes entre las piezas del HUD (con todo a la vez), todas dentro de la pantalla y de las zonas seguras, a 1024x768, 1280x720, 1366x657, 1440x900, 1920x1080, 844x390 con muesca de 47/47/21, 780x360 y en el plegable (724x784, 784x724, 869x941, 941x869, 360x807, 807x360, la mitad de 784x362 y 800x870)',
      !malos.length, malos.length ? malos.slice(0, 8) : visto);
  } catch (e) { t('solapes del HUD', false, String(e && e.stack || e)); }

  // ---- C. Escala, variante y bandas iguales a las de G.Estilo.disposicion() ----
  try {
    const esc = {}, dif = [];
    for (const [w, h, tactil] of [[1440, 900], [1920, 1080], [1280, 720], [1024, 768], [844, 390, true], [780, 360, true], [724, 784, true], [784, 724, true], [941, 869, true]]) {
      const H = cargarHud({ w, h, tactil });
      escenaCompleta(H);
      H.pintar();
      const B = H.G.HudDex.bandas(), d = H.G.Estilo.disposicion(w, h, { seguras: H.seguras });
      esc[`${w}x${h}`] = `${B.variante} ${B.escala}`;
      if (B.sup !== d.bandas.sup || B.inf !== d.bandas.inf || B.der !== d.bandas.der || B.variante !== d.variante) dif.push({ vp: `${w}x${h}`, hud: [B.sup, B.inf, B.der, B.variante], disp: [d.bandas.sup, d.bandas.inf, d.bandas.der, d.variante] });
    }
    t('escala del HUD: 1,25 a 1440x900 y también a 1920x1080 (tope de Nico, no 1,5), 1 a 1280x720; el plegable abierto (724x784, 784x724) va en compacto (la entrada del jefe no cabe entre columnas) con las piezas un poco mayores (×1,13), y 941x869, en escritorio; las bandas del HUD son las de G.Estilo.disposicion()',
      esc['1440x900'] === 'escritorio 1.25' && esc['1920x1080'] === 'escritorio 1.25' && esc['1280x720'] === 'escritorio 1' && /^compacto 1\.1/.test(esc['724x784']) &&
      /^compacto 1\.1/.test(esc['784x724']) && esc['844x390'] === 'compacto 1' && /^escritorio/.test(esc['941x869']) && !dif.length, { esc, dif });
  } catch (e) { t('escala del HUD', false, String(e && e.stack || e)); }

  // ---- D. Barra del jefe: violeta #9B6BFF (nunca los colores de PS), con 3 marcas, y más gruesa que la tuya ----
  try {
    const res = [];
    for (const [w, h, tactil] of [[1440, 900, false], [844, 390, true]]) {
      for (const f of [1, 0.4, 0.1]) {
        const H = cargarHud({ w, h, tactil });
        H.juego.jefes = [jefeFalso(w / 2, h / 2, f)];
        const ctx = H.pintar();
        const M = H.G.MARCA.color;
        // El carril de la barra rival es el fill de 'rgba(2,8,11,0.6)' justo antes del primer fill violeta.
        const iv = ctx.ops.findIndex(o => o.op === 'fill' && o.estilo === M.rival);
        const carril = iv > 0 ? ctx.ops.slice(0, iv).reverse().find(o => o.op === 'fill' && o.estilo === M.carril) : null;
        if (!carril) { res.push({ w, f, mal: 'sin barra rival' }); continue; }
        const bw = carril.x2 - carril.x, bh = carril.y2 - carril.y;
        const px = carril.x + bw * f * 0.375, py = carril.y + bh * 0.65;
        const encima = ctx.ops.filter(o => o.op === 'fill' && px >= o.x && px <= o.x2 && py >= o.y && py <= o.y2).pop();
        const marcas = ctx.ops.filter(o => o.op === 'fill' && o.estilo === 'rgba(15,38,48,0.7)' && o.y === carril.y && o.x2 - o.x <= 3).length;
        // Tus PS: la barra de la ficha (el carril antes del primer fill de un color de PS).
        const ips = ctx.ops.findIndex(o => o.op === 'fill' && [M.psAlto, M.psMedio, M.psBajo, M.psBajoDestello].includes(o.estilo));
        const carrilPS = ctx.ops.slice(0, ips).reverse().find(o => o.op === 'fill' && o.estilo === M.carril);
        res.push({ w, f, color: encima && encima.estilo, marcas, alto: bh, altoPS: carrilPS ? carrilPS.y2 - carrilPS.y : null });
      }
    }
    t('barra del jefe: el píxel al 37,5 % del tramo lleno y al 65 % del alto es #9B6BFF con el jefe al 100, 40 y 10 %, en escritorio y en compacto; 3 marcas (25, 50 y 75 %); y más gruesa que tus PS en las dos variantes',
      res.length === 6 && res.every(x => x.color === '#9B6BFF' && x.marcas === 3 && x.altoPS && x.alto > x.altoPS), res);
  } catch (e) { t('barra del jefe', false, String(e && e.stack || e)); }

  // ---- E. Flechas: fuera de pantalla o detrás de un panel, y siempre dentro de la zona libre ----
  try {
    const res = [];
    for (const [w, h, tactil] of [[1440, 900, false], [844, 390, true], [724, 784, true]]) {
      const H = cargarHud({ w, h, tactil });
      const { juego, G } = H;
      // Fuera: el jefe a la derecha, la grieta arriba, un shiny abajo a la izquierda, Ana lejos (caída) y Leo lejos,
      // un ladrón a la izquierda y el Pokémon perdido abajo.
      juego.jefes = [jefeFalso(w + 900, h / 2)];
      juego.rift = { x: w / 2, y: -800, ttl: 30, t: 9 };
      juego.shinies = [{ x: -300, y: h + 300, dead: false }];
      juego.mates = [mateFalso('Ana', '#5FC8FF', w * 3, h * 2, { dead: true }), mateFalso('Leo', '#7EE07A', -2000, h / 3)];
      juego.otros = [{ behavior: 'thief', dead: false, x: -900, y: h * 0.7, name: 'Meowth' }];
      G.Events.onNet(['ev', 'lp', 52, w / 2, h + 2000, 100, 0, w / 2, h + 3000, 0, 0]);
      H.pintar();
      const B = G.HudDex.bandas(), Z = B.zona, tipos = B.flechas.map(f => f.tipo);
      const fuera = B.flechas.filter(f => f.x < Z.x + 20 || f.x > Z.x + Z.w - 20 || f.y < Z.y + 20 || f.y > Z.y + Z.h - 20);
      // Detrás de un panel: el jefe en mitad de la ficha (dentro de la pantalla) también lleva flecha; en la zona libre, no.
      const P = B.piezas.ficha;
      juego.jefes = [jefeFalso(P.x + P.w / 2, P.y + P.h / 2 + 30)];
      H.pintar();
      const tapado = G.HudDex.bandas().flechas.some(f => f.tipo === 'jefe');
      juego.jefes = [jefeFalso(Z.x + Z.w / 2, Z.y + Z.h / 2 + 30)];
      H.pintar();
      const libre = !G.HudDex.bandas().flechas.some(f => f.tipo === 'jefe');
      res.push({ vp: `${w}x${h}`, tipos, fuera: fuera.map(f => f.tipo), tapado, libre });
    }
    const todas = ['jefe', 'grieta', 'shiny', 'caido', 'companero', 'evento'];
    t('flechas comunes (jefe, grieta, shiny, compañero caído y lejos, ladrón y Pokémon perdido): salen si el objetivo está fuera de la pantalla o detrás de un panel (no si está en la zona libre) y quedan dentro de la zona libre con su margen',
      res.every(x => todas.every(k => x.tipos.includes(k)) && x.tipos.filter(k => k === 'evento').length === 2 && !x.fuera.length && x.tapado && x.libre), res);
  } catch (e) { t('flechas del HUD', false, String(e && e.stack || e)); }

  // ---- F. Avisos: una ranura con cola (prioridad, ≤ 2 en espera, persistentes, sin repetir) ----
  try {
    const H = cargarHud({ w: 1440, h: 900 });
    const { G, juego } = H, A = G.HudDex.Avisos, st = { time: 60 };
    let tt = 10;
    const paso = (s, n = 1) => { for (let i = 0; i < n; i++) { tt += s; A.actualizar(tt, st, false); } };
    const di = (text, t2) => { juego.banner = { text, t: t2 }; paso(0.016); };
    const vistos = [];
    const anota = () => { const v = A.visible; if (v && !v.saliendo && vistos[vistos.length - 1] !== v.texto) vistos.push(v.texto); };
    di('¡Un Pidgey shiny anda cerca!', 3.4); anota();
    di('Lluvia: el Agua se potencia y el Fuego se debilita', 3.4);
    di('¡Kingambit salvaje apareció!', 3.2);
    di('— Cueva Cristal —', 3);
    const cola = A.cola.map(x => x.tipo);
    for (let i = 0; i < 700; i++) { juego.banner = null; paso(0.016); anota(); }
    // Persistente: «Pausa: … elige fusión…» se queda mientras el origen lo mantenga, aunque pasen 20 s.
    di('Pausa: Ana elige fusión…', 999);
    for (let i = 0; i < 1250; i++) { juego.banner = { text: 'Pausa: Ana elige fusión…', t: 999 - i * 0.016 }; paso(0.016); }
    const sigue = A.visible && A.visible.texto === 'Pausa: Ana elige fusión…' && !A.visible.saliendo;
    juego.banner = null; paso(0.016, 40);
    const acaba = !A.visible || A.visible.tipo === 'pista' || A.visible.saliendo;
    // «— Bioma —» una sola vez (aunque se repita mientras se ve) y «Has entrado en la grieta…» como rótulo de zona.
    const zonas = [];
    di('— Bosque Umbrío —', 3); di('— Bosque Umbrío —', 3);
    for (let i = 0; i < 300; i++) { paso(0.016); const v = A.visible; if (v && v.tipo === 'zona' && zonas[zonas.length - 1] !== v.texto) zonas.push(v.texto); }
    juego.banner = null; paso(0.016, 300);
    juego.bioma = 'Grieta · Pradera Eterna';
    di('Has entrado en la grieta…', 2.4);
    const arena = A.visible && A.visible.tipo === 'zona' && A.visible.texto === 'Grieta · Pradera Eterna';
    // La pista de controles: sólo con la ranura libre y hasta los 14 s.
    juego.banner = null; paso(0.016, 400);
    const st2 = { time: 3 }; tt += 0.016; A.actualizar(tt, st2, true);
    const pista = A.visible && A.visible.tipo === 'pista' && /Arrastra el dedo/.test(A.visible.texto);
    t('avisos: una ranura con cola por prioridad (jefe > zona > clima > resto), como mucho 2 en espera (se pierde el clima), cada uno visible su tiempo; «Pausa: … elige fusión…» se queda 20 s mientras dure y se va al quitarse; «— Bioma —» sale una vez, sin guiones; «Has entrado en la grieta…» es el rótulo de la arena; y la pista de controles sólo con la ranura libre',
      JSON.stringify(cola) === '["jefe","zona"]' && JSON.stringify(vistos) === JSON.stringify(['¡Un Pidgey shiny anda cerca!', '¡Kingambit salvaje apareció!', 'Cueva Cristal']) &&
      sigue && acaba && JSON.stringify(zonas) === '["Bosque Umbrío"]' && arena && pista, { cola, vistos, sigue, acaba, zonas, arena, pista });
  } catch (e) { t('avisos del HUD', false, String(e && e.stack || e)); }

  // ---- G. Toques: las ranuras y la pausa se registran donde se pintan y miden ≥ 44 px ----
  try {
    const res = [];
    for (const [w, h] of [[844, 390], [568, 320], [724, 784], [1440, 900]]) {
      const H = cargarHud({ w, h, tactil: true });
      H.pintar();
      const B = H.G.HudDex.bandas(), P = B.piezas, pl = H.pl;
      const ran = piezas(H.G, pl).filter(p => /^ranura/.test(p.n));
      const casa = ran.every(p => H.botones.some(b => Math.abs(b.x - p.x) < 0.5 && Math.abs(b.y - p.y) < 0.5 && b.w === p.w && b.h === p.h && b.w >= 44 && b.h >= 44));
      const pz = H.botones.find(b => P.pausa && b.x === P.pausa.x && b.y === P.pausa.y);
      // Tocar la ranura 3 la activa; tocar la pausa pausa.
      const b3 = H.botones.find(b => Math.abs(b.y - ran[2].y) < 0.5 && Math.abs(b.x - ran[2].x) < 0.5);
      if (b3) b3.fn();
      if (pz) pz.fn();
      res.push({ vp: `${w}x${h}`, variante: B.variante, columna: B.columna, casa, pausa: pz ? [pz.w, pz.h] : null, activa: pl.active, pausado: !!H.G.Game.pausado });
    }
    t('toques: cada ranura y la pausa se registran justo donde se pintan, con ≥ 44 px (también a 568x320 y en el plegable); tocar la ranura 3 la activa y la pausa responde; en compacto, las ranuras van en columna (Ajustes dirá «de la derecha»)',
      res.every(x => x.casa && x.pausa && x.pausa[0] >= 44 && x.pausa[1] >= 44 && x.activa === 2 && x.pausado) && res.filter(x => x.columna).length === 3, res);
  } catch (e) { t('toques del HUD', false, String(e && e.stack || e)); }

  // ---- H. Cooperativo: barras, «Caído», flechas a los lejanos y «Has caído» con la barra de levantar ----
  try {
    const res = [];
    for (const [w, h, tactil] of [[1280, 720, false], [844, 390, true]]) {
      const H = cargarHud({ w, h, tactil });
      const { juego, G } = H;
      juego.mates = [mateFalso('Ana', '#5FC8FF', w / 2 + 100, h / 2), mateFalso('Leo', '#7EE07A', w / 2 - 100, h / 2 + 50, { dead: true }), mateFalso('Sol', '#FF8AD8', w + 1500, h / 2)];
      let ctx = H.pintar();
      const textos = ctx.ops.filter(o => o.op === 'texto').map(o => o.texto);
      const M = G.MARCA.color;
      const barras = ctx.ops.filter(o => o.op === 'fill' && [M.psAlto, M.psMedio, M.psBajo].includes(o.estilo)).length;
      const flechas = G.HudDex.bandas().flechas.map(f => f.tipo);
      const lab = textos.find(x => /^Sol · \d+ m$/.test(x));
      H.pl.dead = true; H.pl.reviveT = 1.5;
      ctx = H.pintar();
      const t2 = ctx.ops.filter(o => o.op === 'texto').map(o => o.texto);
      const levantar = ctx.ops.some(o => o.op === 'fill' && o.estilo === M.psAlto && o.x2 - o.x > 30);
      res.push({ vp: `${w}x${h}`, caido: textos.includes('Caído'), barras, flechas, lab, hasCaido: t2.includes('Has caído: un compañero puede levantarte'), levantar });
    }
    t('cooperativo: la barra de cada compañero, «Caído» en el caído, flecha «Nombre · N m» sólo al que está lejos (no a los que se ven) y, si caes tú, «Has caído: un compañero puede levantarte» con la barra de levantar',
      res.every(x => x.caido && x.barras >= 3 && JSON.stringify(x.flechas) === '["companero"]' && x.lab && x.hasCaido && x.levantar), res);
  } catch (e) { t('cooperativo del HUD', false, String(e && e.stack || e)); }

  // ---- I. Contraste de cada texto (calculado con los tokens, contra lo que tiene debajo sobre el peor fondo) ----
  try {
    const rgba = s => { if (/^#/.test(s)) return [...hexRgb(s), 1]; const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const v = m[1].split(',').map(Number); return [v[0], v[1], v[2], v[3] === undefined ? 1 : v[3]]; };
    const hexRgb = h => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const sobre = (c, f) => [0, 1, 2].map(i => c[i] * c[3] + f[i] * (1 - c[3]));
    const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const malos = [];
    let n = 0;
    for (const [w, h, tactil] of [[1440, 900, false], [844, 390, true]]) {
      const H = cargarHud({ w, h, tactil });
      escenaCompleta(H, { lejos: true });
      H.juego.rift = { x: w / 2, y: -800, ttl: 30, t: 1 };
      H.juego.mates[0].pl.dead = true;
      H.pintar(); H.reloj.t += 600;
      const ctx = H.pintar();
      ctx.ops.forEach((o, i) => {
        if (o.op !== 'texto' || !/\p{L}|\d/u.test(o.texto)) return;
        const col = rgba(o.estilo);
        if (!col) return;
        const c0 = sobre(col, [255, 255, 255]);
        const trazo = ctx.ops.slice(Math.max(0, i - 3), i).reverse().find(p => p.op === 'contorno' && p.texto === o.texto);
        let fondo, donde;
        if (trazo) { fondo = sobre(rgba(trazo.estilo), [255, 255, 255]); donde = 'contorno'; }
        else {
          const cx = (o.x + o.x2) / 2, cy = (o.y + o.base) / 2;
          const bajo = ctx.ops.slice(0, i).filter(p => p.op === 'fill' && typeof p.estilo === 'string' && p.estilo !== '#ICONO' && cx >= p.x && cx <= p.x2 && cy >= p.y && cy <= p.y2).pop();
          if (!bajo) { malos.push({ texto: o.texto, por: 'sin panel ni contorno' }); return; }
          fondo = sobre(rgba(bajo.estilo), [255, 255, 255]); donde = bajo.estilo;
        }
        n++;
        const q = ratio(c0, fondo);
        if (q < 4.5) malos.push({ texto: o.texto, color: o.estilo, fondo: donde, ratio: +q.toFixed(2) });
      });
    }
    t(`contraste: cada texto del HUD Dex (${n}, en escritorio y en compacto, con todo a la vez y la grieta) da ≥ 4,5:1 contra su panel al 92 % sobre blanco (el peor fondo) o, si va suelto, contra su contorno`, n > 60 && !malos.length, malos.slice(0, 8));
  } catch (e) { t('contraste del HUD', false, String(e && e.stack || e)); }

  // ---- J. Red de seguridad (U6): fallback, Clásico = upstream, huellas e inventario ----
  try {
    const H = cargarHud({ w: 1440, h: 900, fallar: true });
    const ctx = H.pintar();
    const textos = ctx.ops.filter(o => o.op === 'texto').map(o => o.texto);
    const upstream = textos.some(x => /DERROTADOS/.test(x));
    t('fallback: una excepción dentro del HUD Dex hace que ese fotograma lo pinte upstream (se avisa una vez en la consola) y el contexto del lienzo queda como estaba',
      upstream && ctx.profundidad === 0 && H.c.__avisos.length === 1 && /HUD Dex ha fallado/.test(H.c.__avisos[0]), { upstream, profundidad: ctx.profundidad, avisos: H.c.__avisos });
  } catch (e) { t('fallback del HUD', false, String(e && e.stack || e)); }
  try {
    // Clásico: G.HUD.draw con el gancho pinta exactamente lo mismo que el hud.js de upstream sin él.
    const sinGancho = rd('js/ui/hud.js').split('\n').filter(l => !/MOD nico/.test(l)).join('\n');
    const graba = src => { const H = cargarHud({ w: 1280, h: 720, estilo: 'clasico', hudSrc: src }); escenaCompleta(H); H.juego.rift = { x: 300, y: -500, ttl: 30, t: 2 }; return H.pintar().ops; };
    const a = JSON.stringify(graba(null)), b = JSON.stringify(graba(sinGancho));
    t('Clásico = upstream: con el estilo Clásico, G.HUD.draw con el gancho graba los mismos textos, rectángulos y caminos que el hud.js de upstream sin él', a === b && a.length > 1000, { iguales: a === b, ops: a.length });
  } catch (e) { t('Clásico = upstream', false, String(e && e.stack || e)); }
  try {
    const hud = rd('js/ui/hud.js'), ev = rd('js/systems/events.js');
    const hHud = sha1(sinModNico(hud)), hEv = sha1(eventosHud(sinModNico(ev)));
    const mutadoHud = sha1(sinModNico(hud.replace('const touch = G.Touch.active;', 'const touch = G.Touch.active; const combo = pl.combo;')));
    const mutadoEv = sha1(eventosHud(sinModNico(ev.replace("'#ffd23f', e.name, F);", "'#ffd23f', e.name + ' ' + e.loot, F);"))));
    t(`huellas de lo que pinta upstream: js/ui/hud.js y drawHud/edgeArrow de js/systems/events.js siguen como cuando se portaron al HUD Dex (si no: «hud.js de upstream ha cambiado: revisa git diff -- js/ui/hud.js js/systems/events.js, porta lo nuevo a js/ui/hud-dex.js y actualiza HUELLA_HUD y HUELLA_EVENTOS_HUD»); una copia cambiada da otra huella`,
      hHud === HUELLA_HUD && hEv === HUELLA_EVENTOS_HUD && mutadoHud !== HUELLA_HUD && mutadoEv !== HUELLA_EVENTOS_HUD, { hud: hHud, eventos: hEv });
    // Inventario: cada dato que lee hud.js (y drawHud de events.js) lo cubre el HUD Dex (G.HudDex.CUBRE).
    const H = cargarHud({ w: 1440, h: 900 }), CU = H.G.HudDex.CUBRE;
    const cubre = new Set([...CU.pl.map(x => 'pl.' + x), ...CU.st.map(x => 'st.' + x), ...CU.G.map(x => 'G.' + x)]);
    const faltan = src => [...inventarioHud(src)].filter(x => !cubre.has(x));
    const real = faltan(sinModNico(hud)).concat(faltan(eventosHud(sinModNico(ev))).filter(x => /^pl\.|^st\./.test(x)));
    const mut = faltan(sinModNico(hud.replace('const touch = G.Touch.active;', 'const touch = G.Touch.active; const combo = pl.combo + G.Weather.racha;')));
    t('inventario: todo lo que lee el HUD de upstream (pl.*, st.*, G.*.*) está en G.HudDex.CUBRE; una copia de hud.js que lea pl.combo y G.Weather.racha da FALLO con sus nombres',
      !real.length && JSON.stringify(mut) === '["pl.combo","G.Weather.racha"]', { real, mutado: mut });
  } catch (e) { t('huellas e inventario', false, String(e && e.stack || e)); }

  // ---- K. Pantalla dividida (interfaz preparada): el HUD se maqueta contra los rectángulos de juego y de controles ----
  try {
    const H = cargarHud({ w: 784, h: 724, tactil: true });
    escenaCompleta(H);
    H.G.HudDex.ponerMarco((w, h) => { const d = H.G.Estilo.disposicion(w, h, { dividida: 'abajo', proporcion: 0.4, seguras: H.seguras }); return { juego: d.juego, controles: d.controles }; });
    H.pintar();
    const B = H.G.HudDex.bandas(), P = B.piezas, J = B.juego, K = B.controles;
    const dentro = (r, R) => r.x >= R.x - 0.5 && r.y >= R.y - 0.5 && r.x + r.w <= R.x + R.w + 0.5 && r.y + r.h <= R.y + R.h + 0.5;
    const datos = ['ficha', 'contador', 'rotom', 'jefe', 'aviso'].every(k => !P[k] || dentro(P[k], J)) && P.chips.every(x => dentro(x, J));
    const mandos = P.ranuras.length === 4 && P.ranuras.every(x => dentro(x, K) && x.w >= 48) && P.pausa && dentro(P.pausa, K);
    const zona = B.zona.y + B.zona.h <= J.y + J.h + 0.5 && B.der === 0;
    const colm = H.G.HudDex.columna();
    H.G.HudDex.ponerMarco(null);
    H.pintar();
    const vuelta = H.G.HudDex.bandas().controles === null && H.G.HudDex.bandas().columna;
    t('pantalla dividida (preparada, sin activar): con G.HudDex.ponerMarco() los datos van en el rectángulo de juego, las ranuras (≥ 48 px) y la pausa en el de controles, la zona libre no pasa del juego; ponerMarco(null) vuelve a la pantalla entera',
      datos && mandos && zona && !colm && vuelta, { juego: J, controles: K, ranuras: P.ranuras, pausa: P.pausa, zona: B.zona });
  } catch (e) { t('pantalla dividida del HUD', false, String(e && e.stack || e)); }

  // ---- L. Inglés de los textos nuevos del HUD (i18n.js real) ----
  try {
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {};
    c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    const EN = c.G.I18n.t;
    const textos = ['PS', 'N.º', 'Nv.', 'Despejado', 'Caído', 'Ataque ×2', 'Atq ×2', 'Velocidad ×1', 'Vel ×1', 'Defensa ×1', 'Regenera ×3', 'Horda Fuego · 18 s', 'Hora dorada · 30 s',
      'Grieta 0:45', 'Grieta · 30 s', 'Grieta · 24 m · 30 s', '¡Se ha abierto una grieta!', 'Sigue la flecha morada: dentro te espera un legendario',
      '¡Grieta abierta! Sigue la flecha morada', '¡Ana necesita ayuda! · 12 m', 'Marca · 12 m', 'Has caído: un compañero puede levantarte', 'Habéis caído todos…',
      'Arrastra el dedo para moverte  ·  toca un ataque para cambiarlo', 'WASD moverse  ·  1-4 / Q / E o clic en un ataque para cambiarlo  ·  Esc pausa', 'Lluvia · 67 s'];
    const sin = textos.filter(s => EN(s) === s);
    t('inglés de los textos del HUD Dex (i18n.js real): PS, N.º, Despejado, Caído, los chips, la horda y la hora dorada, la grieta, los compañeros, «Has caído», la pista de controles y el clima', !sin.length, sin);
    const cortas = ['WASD moverse  ·  1-4, Q, E o clic: cambiar ataque  ·  Esc pausa', 'WASD  ·  1-4 / Q / E  ·  Esc pausa', 'Arrastra para moverte  ·  toca un ataque para cambiarlo', 'Arrastra  ·  toca un ataque'];
    const cortasSin = cortas.filter(s => EN(s) === s || /[áéíóú]|moverse|ataque|pausa|Arrastra/.test(EN(s)));
    t('inglés de las versiones cortas de la pista de controles', !cortasSin.length, cortasSin.length ? cortasSin : cortas.map(EN));
  } catch (e) { t('inglés del HUD', false, String(e && e.stack || e)); }

  // ---- M. Arreglos de la verificación del lote 2 ----
  const enRect = (o, R) => o.ancla && o.ancla[0] >= R.x - 0.5 && o.ancla[0] <= R.x + R.w + 0.5 && o.ancla[1] >= R.y - 0.5 && o.ancla[1] <= R.y + R.h + 0.5;
  const cortaUp = s => /…$/.test(s) && !/(elige fusión|todos|grieta)…$/.test(s);
  // M1. Nombres de arena enteros en el sensor de Rotom (sin «Grieta · »; con la letra un punto menor o en dos líneas).
  try {
    // Los nombres de verdad: G.Tiles.BIOMES con los mapas propios cargados (los 3 biomas y las 18 arenas, ya con «Grieta · »).
    const cm = { console, document: { createElement: () => ({ getContext: () => ({}) }) } };
    vm.createContext(cm); cm.window = cm; cm.G = {}; cm.G.Sprites = { PX: 2 };
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js', 'js/world/tiles.js']) vm.runInContext(rd(f), cm, { filename: f });
    cargarMapas(cm, true);
    const nombres = cm.G.Tiles.BIOMES.map(b => b.name), arenas = nombres.filter(n => /^Grieta · /.test(n));
    const malos = [], vistos = {};
    for (const [w, h, tactil] of [[1440, 900], [1920, 1080], [1024, 768], [724, 784, true], [784, 724, true], [844, 390, true], [780, 360, true], [568, 320, true]]) {
      const H = cargarHud({ w, h, tactil });
      for (const clima of [null, { name: 'Lluvia', icon: 'wrain', left: 67, mult: { water: 1.5, fire: 0.5 } }]) {
        H.juego.clima = clima;
        for (const n of nombres) {
          H.juego.bioma = n;
          const ctx = H.pintar(), B = H.G.HudDex.bandas(), R = B.piezas.rotom;
          if (R.modo === 'cara') { vistos[`${w}x${h}`] = 'cara'; continue; }
          const tx = ctx.ops.filter(o => o.op === 'texto' && enRect(o, R)).map(o => o.texto);
          const limpio = n.replace(/^Grieta · /, ''), junto = tx.join(' ');
          const debeVerse = !clima || B.variante !== 'compacto';
          if (tx.some(x => /…/.test(x) || /^Grieta ·/.test(x)) || (debeVerse && !junto.includes(limpio))) malos.push({ vp: `${w}x${h}`, clima: !!clima, n, tx });
          vistos[`${w}x${h}`] = (vistos[`${w}x${h}`] || 0) + 1;
        }
      }
    }
    t(`sensor de Rotom: los ${nombres.length} nombres de los mapas propios (G.Tiles.BIOMES: 3 biomas y ${arenas.length} arenas) enteros, sin «Grieta · » ni «…», con y sin clima, en escritorio (1440x900, 1920x1080, 1024x768), el plegable abierto (724x784, 784x724) y los móviles (844x390, 780x360, 568x320)`,
      arenas.length === 18 && nombres.length === 21 && !malos.length, malos.length ? malos.slice(0, 6) : vistos);
    // Un nombre que no cabe ni con la letra menor (Rotom estrecho): en dos líneas, entero y sin «Despejado».
    const H = cargarHud({ w: 844, h: 390, tactil: true });
    H.juego.bioma = 'Grieta · Bosque Encantado de las Hadas Eternas';
    const ctx = H.pintar(), R = H.G.HudDex.bandas().piezas.rotom;
    const tx = ctx.ops.filter(o => o.op === 'texto' && enRect(o, R)).map(o => o.texto);
    t('sensor de Rotom: un nombre que no cabe en una línea ni con la letra un punto menor va en dos líneas, entero (sin «…» ni «Despejado»)',
      tx.length === 2 && tx.join(' ') === 'Bosque Encantado de las Hadas Eternas' && !tx.some(x => /…/.test(x)), tx);
  } catch (e) { t('nombres de arena en Rotom', false, String(e && e.stack || e)); }
  // M2. La pista de controles: si la larga no cabe, una más corta entera (no «… · Es…»).
  try {
    const res = [];
    for (const [w, h, tactil, jefe] of [[1024, 768, false], [1280, 720, false], [568, 320, true, true], [844, 390, true]]) {
      const H = cargarHud({ w, h, tactil });
      H.st.time = 3; H.juego.banner = null;
      if (jefe) H.juego.jefes = [jefeFalso(w * 0.6, h * 0.6)];
      H.pintar(); H.reloj.t += 400;
      const ctx = H.pintar(), A = H.G.HudDex.bandas().piezas.aviso;
      const tx = A ? ctx.ops.filter(o => o.op === 'texto' && enRect(o, A)).map(o => o.texto) : [];
      const vs = H.G.HudDex.Avisos.visible && H.G.HudDex.Avisos.visible.variantes || [];
      res.push({ vp: `${w}x${h}`, tx, ok: tx.length === 1 && vs.includes(tx[0]) && !/…/.test(tx[0]) });
    }
    // (Con la letra de verdad, a 1024x768 cabe la del medio y a 1280x720 la larga: lo mira estilo-e2e.js; aquí el ancho es
    // el de mentira, más ancho que el real.)
    t('pista de controles: a 1024x768 (y en un móvil pequeño con el jefe al lado) sale una versión que cabe entera, sin «…»; con sitio, la larga', res.every(x => x.ok) && res[3].tx[0] === 'Arrastra el dedo para moverte  ·  toca un ataque para cambiarlo', res);
  } catch (e) { t('pista de controles', false, String(e && e.stack || e)); }
  // M3. La píldora del ataque activo (compacto, dentro de la zona libre) no la pisa ninguna flecha ni su etiqueta.
  try {
    const res = [];
    for (const [w, h, seguras, caida] of [[844, 390], [844, 390, null, true], [844, 390, { sup: 0, der: 47, inf: 21, izq: 47 }], [724, 784]]) {
      const H = cargarHud({ w, h, tactil: true, seguras: seguras || { sup: 0, der: 0, inf: 0, izq: 0 } });
      H.pl.slots[1][0].name = 'Danza Espada';   // un nombre largo: la píldora llega hasta donde va la etiqueta de la flecha
      H.pintar();
      const S1 = H.G.HudDex.bandas().piezas.ranuras[1], yc = S1.y + S1.h / 2;
      // Sol (o Ana, caída) lejos a la derecha, justo a la altura de la ranura activa, donde va la píldora.
      H.juego.mates = [caida ? mateFalso('Ana', '#5FC8FF', w + 2500, yc + 15, { dead: true }) : mateFalso('Sol', '#FF8AD8', w + 2000, yc + 15)];
      const ctx = H.pintar(), B = H.G.HudDex.bandas();
      // La píldora, en lo pintado: el relleno bajo el nombre del ataque activo.
      const it = ctx.ops.findIndex(o => o.op === 'texto' && o.texto === 'Danza Espada');
      const fp = it > 0 ? ctx.ops.slice(0, it).reverse().find(o => o.op === 'fill' && o.ancla === undefined && o.x <= o.x2 && (ctx.ops[it].ancla[0] >= o.x && ctx.ops[it].ancla[0] <= o.x2 && ctx.ops[it].ancla[1] >= o.y && ctx.ops[it].ancla[1] - 8 <= o.y2)) : null;
      const pil = fp ? { x: fp.x, y: fp.y, w: fp.x2 - fp.x, h: fp.y2 - fp.y } : null;
      const choca = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      const cajas = B.flechas.flatMap(f => f.cajas || []);
      const etiquetas = ctx.ops.filter(o => o.op === 'texto' && /· \d+ m$/.test(o.texto)).map(o => ({ x: o.x, y: o.y, w: o.x2 - o.x, h: o.y2 - o.y, t: o.texto }));
      const pisan = pil ? [...cajas, ...etiquetas].filter(c => choca(c, pil)) : null;
      res.push({ vp: `${w}x${h}${seguras ? ' muesca' : ''}${caida ? ' caída' : ''}`, pildora: pil, igualQueBandas: !!(B.pildora && pil && Math.abs(B.pildora.x - pil.x) < 1 && Math.abs(B.pildora.y - pil.y) < 1), flechas: B.flechas.map(f => [f.tipo, Math.round(f.y)]), pisan: pisan && pisan.map(c => c.t || 'cuerpo') });
    }
    t('flechas y píldora del ataque: en compacto, ninguna flecha ni su etiqueta pisa la píldora del ataque activo (también con muesca y en el plegable), aunque el compañero (o el caído) esté a su altura y el ataque tenga un nombre largo',
      res.every(x => x.pildora && x.igualQueBandas && x.flechas.length === 1 && x.pisan && !x.pisan.length), res);
  } catch (e) { t('flechas y píldora', false, String(e && e.stack || e)); }
  // M4. «Caído» en una columna estrecha (muesca): una cruz y la barra vacía, nunca «Ca…».
  try {
    const H = cargarHud({ w: 844, h: 390, tactil: true, seguras: { sup: 0, der: 47, inf: 21, izq: 47 } });
    H.juego.mates = [mateFalso('Ana', '#5FC8FF', 400, 200, { dead: true }), mateFalso('Leo', '#7EE07A', 450, 220)];
    const ctx = H.pintar(), C0 = H.G.HudDex.bandas().piezas.companeros[0];
    const tx = ctx.ops.filter(o => o.op === 'texto' && o.y >= C0.y - 1 && o.y2 <= C0.y + C0.h + 1 && o.x >= C0.x - 1 && o.x2 <= C0.x + C0.w + 2).map(o => o.texto);
    const cruz = ctx.ops.some(o => o.op === 'stroke' && o.x >= C0.x && o.x2 <= C0.x + C0.w && o.y >= C0.y && o.y2 <= C0.y + C0.h && o.x2 - o.x <= 12 && o.x2 - o.x >= 5);
    const ancho = C0.w;
    // Y sin muesca, con sitio, sigue diciendo «Caído».
    const H2 = cargarHud({ w: 844, h: 390, tactil: true });
    H2.juego.mates = H.juego.mates;
    const tx2 = H2.pintar().ops.filter(o => o.op === 'texto').map(o => o.texto);
    t('«Caído» en la columna estrecha de compañeros (844x390 con muesca de 47/47/21): una cruz y la barra vacía en vez de «Ca…»; con sitio, «Caído»',
      !tx.some(x => /…/.test(x)) && (tx.includes('Caído') || cruz) && tx2.includes('Caído'), { ancho, tx, cruz });
  } catch (e) { t('«Caído» en columna estrecha', false, String(e && e.stack || e)); }
  // M5. Plegable abierto: nada del HUD encima del pliegue (por si está a medio plegar: libro o mesa).
  try {
    const res = [];
    for (const [w, h, jefe] of [[724, 784, true], [724, 784, false], [784, 724, true], [800, 870, true], [869, 941, true]]) {
      const H = cargarHud({ w, h, tactil: true });
      escenaCompleta(H);
      // Un aviso que cabe entero a un lado del pliegue (uno que no cabe lo cruza: antes eso que recortarlo).
      H.juego.banner = { text: '¡Onix salvaje apareció!', t: 3.2 };
      if (!jefe) H.juego.jefes = [];
      H.pintar();
      const B = H.G.HudDex.bandas(), pg = B.pliegue;
      const L = piezas(H.G, H.pl);
      const pisa = pg ? L.filter(p => pg.eje === 'x' ? p.x < pg.pos + pg.ancho / 2 && p.x + p.w > pg.pos - pg.ancho / 2 : p.y < pg.pos + pg.ancho / 2 && p.y + p.h > pg.pos - pg.ancho / 2).map(p => p.n) : null;
      res.push({ vp: `${w}x${h}${jefe ? '' : ' sin jefe'}`, pliegue: pg, pisa });
    }
    const sin = [[724, 784, false], [844, 390, true], [1024, 768, true], [1440, 900, true]].map(([w, h, tactil]) => { const H = cargarHud({ w, h, tactil }); H.pintar(); return H.G.HudDex.bandas().pliegue; });
    t('plegable abierto (táctil, casi cuadrado, lado corto ≥ 600): el pliegue parte el lado corto (724x784: vertical en x = 362; 784x724: horizontal en y = 362) y ninguna pieza del HUD lo pisa (contador, jefe, aviso que cabe a un lado, ranuras, objeto, compañeros, chips); con ratón, en un móvil o en una tableta 4:3, no hay pliegue',
      res.every(x => x.pliegue && !x.pisa.length) && res[0].pliegue.eje === 'x' && res[0].pliegue.pos === 362 && res[2].pliegue.eje === 'y' && res[2].pliegue.pos === 362 && sin.every(x => x === null), { res, sin });
  } catch (e) { t('pliegue del plegable', false, String(e && e.stack || e)); }
  // M6. Filas de compañeros en escritorio: aire entre la insignia y el nombre, y entre el nombre y la barra.
  try {
    const res = [];
    for (const [w, h] of [[1024, 768], [1440, 900]]) {
      const H = cargarHud({ w, h });
      H.juego.mates = [mateFalso('Ana', '#5FC8FF', w / 2 + 100, h / 2), mateFalso('e2eA_deaa94', '#7EE07A', w / 2 - 100, h / 2)];
      const ctx = H.pintar(), B = H.G.HudDex.bandas(), k = B.escala, E = H.G.MARCA.hud.escritorio.companeros;
      B.piezas.companeros.forEach((R, i) => {
        const nom = ctx.ops.find(o => o.op === 'texto' && o.y >= R.y - 2 && o.y2 <= R.y + R.h + 2 && o.x > R.x + 4 && o.texto !== 'Caído' && !/^[A-Z]$/.test(o.texto));
        const finInsignia = R.x + Math.round(6 * k) + 2 * Math.round(E.insignia * k), barra = R.x + Math.round(E.barra.x * k);
        res.push({ vp: `${w}x${h}`, n: nom && nom.texto, aire: nom && +(nom.x - finInsignia).toFixed(1), hastaBarra: nom && +(barra - nom.x2).toFixed(1) });
      });
    }
    t('compañeros en escritorio: al menos 4 px entre la insignia y el nombre, y entre el nombre y su barra', res.length === 4 && res.every(x => x.n && x.aire >= 4 && x.hastaBarra >= 4), res);
  } catch (e) { t('filas de compañeros', false, String(e && e.stack || e)); }
  // M7. Avisos de logro en partida con el HUD Dex: bajo su banda de arriba (G.MODS.avisoEnEspera -> G.Estilo.colocarLogro).
  try {
    const H = cargarHud({ w: 1440, h: 900 });
    H.pintar();
    const clases = new Set(), props = {};
    H.c.document.documentElement = { classList: { toggle(c, v) { if (v) clases.add(c); else clases.delete(c); }, contains: c => clases.has(c) }, style: { setProperty(k, v) { props[k] = v; } } };
    // Lo reservado arriba más lo que pasa de su hueco un aviso de dos líneas (la grieta abierta o el rótulo de una arena):
    // con el aviso de logro 8 px por debajo de la banda reservada, un logro tapaba «Grieta de tipo Fuego» al entrar en la arena.
    const A2 = H.G.MARCA.hud.escritorio.aviso, k2 = H.G.HudDex.bandas().escala;
    const sup = H.G.HudDex.bandas().sup + Math.round(A2.grieta.h * k2) - Math.round(A2.h * k2);
    H.juego.jefes = [jefeFalso(1100, 200)]; H.juego.bioma = 'Grieta · Volcán Ígneo';
    H.G.Rift = { get rift() { return null; }, get inArena() { return true; }, get timeLeft() { return 40; }, arena: { type: 'fire', t: 0 } };
    for (let i = 0; i < 3; i++) H.pintar();
    const dos = H.G.HudDex.bandas().piezas.aviso, vis2 = H.G.HudDex.Avisos.visible;
    const debajo = !!(dos && vis2 && vis2.sub && dos.y + dos.h <= sup && H.G.HudDex.bandaSup() === sup);
    H.juego.jefes = []; H.G.Rift = { get rift() { return null; }, get inArena() { return false; }, get timeLeft() { return 0; } };
    H.G.Game.state = 'playing'; H.G.MODS.avisoEnEspera(() => {});
    const jugando = clases.has('hud-dex-logro') && props['--hud-dex-sup'] === sup + 'px' && debajo;
    H.G.Game.state = 'ui'; H.G.MODS.avisoEnEspera(() => {});
    const menu = !clases.has('hud-dex-logro');
    // Un aviso que salió en el menú (sin la clase) baja al empezar la partida: lo mira el HUD Dex al pintarse.
    H.G.Game.state = 'playing'; H.pintar();
    const alEmpezar = clases.has('hud-dex-logro');
    H.G.Game.state = 'levelup'; H.pintar();
    const cartas = !clases.has('hud-dex-logro');
    H.G.Game.state = 'playing'; H.G.Estilo.set('clasico'); H.G.MODS.avisoEnEspera(() => {});
    const clasico = !clases.has('hud-dex-logro');
    const css = rd('css/nico.css');
    const regla = /@media \(min-height: 521px\) \{\s*html\.estilo-dex\.hud-dex-logro \.ach-pop \{ top: calc\(var\(--hud-dex-sup, 56px\) \+ 8px\); \}\s*\}/.test(css);
    t(`avisos de logro en partida con el HUD Dex: la clase hud-dex-logro y --hud-dex-sup (${sup} px a 1440x900: la banda de arriba y lo que pasa de ella un aviso de dos líneas, que así queda encima del logro con la entrada del jefe y el rótulo de una arena) al salir cada aviso y al pintarse el HUD (un aviso del menú baja al empezar la partida), y css/nico.css lo pone 8 px por debajo (en pantallas de 521 px de alto o más); en el menú, con las cartas de nivel o con Clásico, donde siempre`,
      jugando && menu && alEmpezar && cartas && clasico && regla, { jugando, debajo, dos, sup, menu, alEmpezar, cartas, clasico, regla, props });
  } catch (e) { t('avisos de logro bajo el HUD Dex', false, String(e && e.stack || e)); }

  // ---- N. Arreglos de la verificación de los lotes 1 y 2 ----
  const cruzan = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const pisaPliegueR = (r, pg) => (pg.eje === 'x' ? r.x < pg.pos + pg.ancho / 2 && r.x + r.w > pg.pos - pg.ancho / 2 : r.y < pg.pos + pg.ancho / 2 && r.y + r.h > pg.pos - pg.ancho / 2);
  const dentroDe = (a, R) => a.x >= R.x - 0.5 && a.y >= R.y - 0.5 && a.x + a.w <= R.x + R.w + 0.5 && a.y + a.h <= R.y + R.h + 0.5;
  /** Las etiquetas de flecha pintadas (texto con «· N m» o «Grieta · …»), como rectángulos. */
  const etiquetasPintadas = ctx => ctx.ops.filter(o => o.op === 'texto' && (/· \d+ m$/.test(o.texto) || /^Grieta · \d+ m/.test(o.texto) || /^Meowth$/.test(o.texto)))
    .map(o => ({ t: o.texto, x: o.x, y: o.y, w: o.x2 - o.x, h: o.y2 - o.y }));
  /** Los problemas de las flechas del último fotograma: dos flechas (cuerpo o etiqueta) que se pisan, etiquetas fuera de la
   *  zona libre o encima de una pieza del HUD, y etiquetas pintadas que se pisan, se salen de la pantalla o no están donde
   *  dice flechas(). */
  function problemasFlechas(H, ctx) {
    const B = H.G.HudDex.bandas(), F = B.flechas, Z = B.zona, mal = [];
    const pzs = piezas(H.G, H.pl).concat(B.pildora ? [{ n: 'pildora', ...B.pildora }] : []);
    for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
      if (F[i].cajas.some(a => F[j].cajas.some(b => cruzan(a, b)))) mal.push(`${F[i].tipo}/${F[j].tipo} se pisan`);
    }
    for (const f of F) for (const c of f.cajas.filter(x => x.etiqueta)) {
      if (!dentroDe(c, Z)) mal.push(`etiqueta de ${f.tipo} fuera de la zona libre`);
      const p = pzs.find(q => cruzan(c, q));
      if (p) mal.push(`etiqueta de ${f.tipo} sobre ${p.n}`);
    }
    const E = etiquetasPintadas(ctx), W = H.c.innerWidth, Hh = H.c.innerHeight;
    for (let i = 0; i < E.length; i++) {
      if (E[i].x < -0.5 || E[i].x + E[i].w > W + 0.5 || E[i].y < -0.5 || E[i].y + E[i].h > Hh + 0.5) mal.push(`«${E[i].t}» pintada fuera de la pantalla`);
      for (let j = i + 1; j < E.length; j++) if (cruzan(E[i], E[j])) mal.push(`«${E[i].t}» y «${E[j].t}» pintadas una encima de otra`);
    }
    const cajasEt = F.flatMap(f => f.cajas.filter(x => x.etiqueta));
    for (const e of E) if (!cajasEt.some(c => e.x >= c.x - 1 && e.x + e.w <= c.x + c.w + 1)) mal.push(`«${e.t}» no está donde la colocó flechas()`);
    return { mal, n: F.length, etiquetas: E.length };
  }
  // N1. Flechas del mismo cuadrante (cooperativo con 3 compañeros y el jefe), en las cuatro esquinas: ni las flechas ni
  //     sus etiquetas se pisan, y cada etiqueta queda entera dentro de la zona libre y fuera de los paneles.
  try {
    const res = [];
    const ESQ = { 'arriba-der': [1, -1], 'abajo-der': [1, 1], 'arriba-izq': [-1, -1], 'abajo-izq': [-1, 1] };
    const VPS = [[1440, 900], [1024, 768], [1920, 1080], [1280, 720], [844, 390, true], [844, 390, true, { sup: 0, der: 47, inf: 21, izq: 47 }], [780, 360, true], [724, 784, true], [784, 724, true]];
    for (const [w, h, tactil = false, seguras] of VPS) {
      for (const [esq, [sx, sy]] of Object.entries(ESQ)) {
        const H = cargarHud({ w, h, tactil, seguras: seguras || { sup: 0, der: 0, inf: 0, izq: 0 } });
        const cx = sx > 0 ? w : 0, cy = sy > 0 ? h : 0;
        H.juego.jefes = [jefeFalso(cx + sx * 900, cy + sy * 500)];
        H.juego.mates = [mateFalso('Ana', '#5FC8FF', cx + sx * 1500, cy + sy * 300, { dead: true }), mateFalso('Leo', '#7EE07A', cx + sx * 600, cy + sy * 1400),
          mateFalso('Sol', '#FF8AD8', cx + sx * 2000, cy + sy * 900)];
        const ctx = H.pintar();
        const p = problemasFlechas(H, ctx);
        if (p.mal.length || p.n !== 4 || p.etiquetas !== 4) res.push({ vp: `${w}x${h}${seguras ? ' muesca' : ''}`, esq, ...p });
      }
    }
    t(`flechas del mismo cuadrante (jefe, compañero caído y dos compañeros, en las cuatro esquinas, en ${VPS.length} pantallas: escritorio, móvil con y sin muesca y el plegable): ni las flechas ni sus etiquetas se pisan, y cada etiqueta queda entera en la zona libre, fuera de los paneles y donde la colocó flechas()`,
      !res.length, res.slice(0, 4));
  } catch (e) { t('flechas del mismo cuadrante', false, String(e && e.stack || e)); }
  // N2. Muchas a la vez en un cuadrante (jefe, 3 compañeros, la grieta, un shiny, el ladrón y el Pokémon perdido), y el
  //     caído solo, justo en las esquinas de la derecha (su etiqueta se salía de la pantalla a 1440x900 y 1024x768).
  try {
    const res = [];
    for (const [w, h, tactil = false] of [[1440, 900], [1024, 768], [1920, 1080], [724, 784, true]]) {
      const H = cargarHud({ w, h, tactil });
      const { juego, G } = H;
      juego.jefes = [jefeFalso(w + 900, -500)];
      juego.mates = [mateFalso('Ana', '#5FC8FF', w + 1500, -300, { dead: true }), mateFalso('Leo', '#7EE07A', w + 600, -1400), mateFalso('Sol', '#FF8AD8', w + 2000, -900)];
      juego.rift = { x: w + 700, y: -700, ttl: 30, t: 9 };
      juego.shinies = [{ x: w + 300, y: -200, dead: false }];
      juego.otros = [{ behavior: 'thief', dead: false, x: w + 1200, y: -1200, name: 'Meowth' }];
      G.Events.onNet(['ev', 'lp', 52, w + 800, -2000, 100, 0, w + 800, -2100, 0, 0]);
      const ctx = H.pintar();
      const p = problemasFlechas(H, ctx);
      res.push({ vp: `${w}x${h}`, flechas: p.n, mal: p.mal.slice(0, 4) });
    }
    for (const [w, h, tactil = false] of [[1440, 900], [1024, 768], [844, 390, true], [724, 784, true]]) {
      for (const y of [-400, h + 400, 0.62 * h]) {
        const H = cargarHud({ w, h, tactil });
        H.juego.mates = [mateFalso('Ana', '#5FC8FF', w + 3000, y, { dead: true })];
        const ctx = H.pintar();
        const p = problemasFlechas(H, ctx);
        res.push({ vp: `${w}x${h} caído en y=${Math.round(y)}`, flechas: p.n, mal: p.mal.slice(0, 4) });
      }
    }
    t('flechas: ocho a la vez en el mismo cuadrante (jefe, caído, dos compañeros, grieta, shiny, ladrón y Pokémon perdido) sin pisarse, en escritorio y en el plegable; y el compañero caído en las esquinas de la derecha y a media altura: su etiqueta, entera dentro de la zona libre (antes se salía de la pantalla a 1440x900 y 1024x768)',
      res.every(x => !x.mal.length) && res.slice(0, 4).every(x => x.flechas === 8) && res.slice(4).every(x => x.flechas === 1), res);
  } catch (e) { t('flechas: muchas a la vez y el caído en la esquina', false, String(e && e.stack || e)); }
  // N3. Plegable abierto en vertical: los avisos de la fila 2 respetan el pliegue (con y sin jefe, también los largos).
  try {
    const AVISOS = ['¡Kingambit salvaje apareció!', 'Guardas el vínculo: aprende otro movimiento para usarlo', '¡Un Meowth con un ticket ×10! ¡Atrápalo antes de que huya!',
      'Pausa: Ana, Leo eligen fusión…', '¡Poder Furia! Tu ataque sube un 30 % durante 30 s', 'grieta', 'pista'];
    const res = [];
    for (const [w, h, pantalla] of [[724, 784], [724, 700, { w: 724, h: 784 }], [800, 870], [869, 941]]) {
      for (const jefe of [true, false]) {
        for (const a of AVISOS) {
          const H = cargarHud({ w, h, tactil: true });
          if (pantalla) H.G.Estilo.pantalla = () => pantalla;   // el Magic V6 en vertical con la barra del navegador
          if (jefe) H.juego.jefes = [jefeFalso(w * 0.6, h * 0.6)];
          if (a === 'grieta') H.juego.rift = { x: w * 0.3, y: h * 0.7, ttl: 30, t: 1 };
          else if (a === 'pista') { H.st.time = 3; H.juego.banner = null; }
          else H.juego.banner = { text: a, t: 3.2 };
          H.pintar(); H.reloj.t += 400;
          const ctx = H.pintar(), B = H.G.HudDex.bandas(), A = B.piezas.aviso, pg = B.pliegue;
          if (!A || !pg) { res.push({ vp: `${w}x${h}`, a, mal: 'sin aviso o sin pliegue' }); continue; }
          const tx = ctx.ops.filter(o => o.op === 'texto' && enRect(o, A));
          const pisa = pisaPliegueR(A, pg) || tx.some(o => o.x < pg.pos + pg.ancho / 2 && o.x2 > pg.pos - pg.ancho / 2);
          const recortado = tx.some(o => /…$/.test(o.texto) && !cortaUp(o.texto));
          const j = B.piezas.jefe;
          if (pisa || recortado || (j && pisaPliegueR(j, pg)) || (j && cruzan(j, A))) res.push({ vp: `${w}x${h}${jefe ? ' con jefe' : ''}`, a, aviso: A, textos: tx.map(o => o.texto), pisa, recortado });
        }
      }
    }
    t(`plegable abierto en vertical (724x784, 724x700 con la barra del navegador, 800x870 y 869x941; con y sin jefe): los avisos de la fila 2 (${AVISOS.length} textos: el del jefe, los largos de upstream, la grieta y la pista) quedan enteros a un lado del pliegue (con la letra un punto menor o en dos líneas si hace falta), sin «…» y sin pisar al jefe`,
      !res.length, res.slice(0, 4));
  } catch (e) { t('avisos y pliegue', false, String(e && e.stack || e)); }
  // N5. El pliegue es de la pantalla, no de la ventana: con la barra del navegador (724x700 dentro de 724x784) sigue
  //     vertical en x = 362; girado (784x640 dentro de 784x724), horizontal a 362 px de lo alto de la pantalla; en una
  //     ventana del sistema partida o en un portátil táctil con la ventana casi cuadrada, sin pliegue.
  try {
    const H = cargarHud({ w: 724, h: 700, tactil: true }), E = H.G.Estilo, PG = H.G.MARCA.hud.compacto.pliegue;
    const casos = {
      'vertical con barra': E.plieguePantalla(724, 700, { w: 724, h: 784 }, PG), 'vertical': E.plieguePantalla(724, 784, { w: 724, h: 784 }, PG),
      'girado con barra': E.plieguePantalla(784, 640, { w: 784, h: 724 }, PG), 'girado': E.plieguePantalla(784, 724, { w: 784, h: 724 }, PG),
      'ventana partida': E.plieguePantalla(362, 784, { w: 724, h: 784 }, PG), 'portátil táctil': E.plieguePantalla(700, 650, { w: 1920, h: 1080 }, PG),
      'sin pantalla (la ventana)': E.plieguePantalla(784, 724, null, PG)
    };
    H.G.Estilo.pantalla = () => ({ w: 724, h: 784 });
    H.pintar();
    const enHud = H.G.HudDex.bandas().pliegue;
    const q = (k, eje, pos) => casos[k] && casos[k].eje === eje && casos[k].pos === pos;
    t('el pliegue sale de la pantalla y no de la ventana: el Magic V6 en vertical con la barra del navegador (724x700) lo tiene vertical en x = 362 (también en el HUD), girado con la barra (784x640) horizontal en y = 278; sin pliegue en una ventana partida del sistema ni en un portátil táctil (pantalla 16:9)',
      q('vertical con barra', 'x', 362) && q('vertical', 'x', 362) && q('girado con barra', 'y', 278) && q('girado', 'y', 362) && !casos['ventana partida'] && !casos['portátil táctil'] &&
      q('sin pantalla (la ventana)', 'y', 362) && enHud && enHud.eje === 'x' && enHud.pos === 362, { casos, enHud });
  } catch (e) { t('pliegue de la pantalla', false, String(e && e.stack || e)); }
  // N4. La caché de anchos del HUD se vacía cuando termina de cargar una fuente (document.fonts «loadingdone»).
  try {
    const H = cargarHud({ w: 844, h: 390, tactil: true });
    H.juego.banner = { text: '¡Kingambit salvaje apareció!', t: 30 };
    let f = 1.1;   // la letra de reserva, más ancha
    const lienzo = () => { const c = new LienzoFalso(); c.measureText = s => ({ width: String(s).length * c.tam() * f }); return c; };
    H.pintar(lienzo()); H.reloj.t += 400;
    const w0 = (H.pintar(lienzo()), H.G.HudDex.bandas().piezas.aviso.w);
    f = 0.6;   // llega M PLUS (más estrecha): sin el evento, el aviso conserva el ancho viejo
    const w1 = (H.pintar(lienzo()), H.G.HudDex.bandas().piezas.aviso.w);
    const oyentes = (H.c.__fuentes.loadingdone || []).length;
    (H.c.__fuentes.loadingdone || []).forEach(fn => fn({}));
    const w2 = (H.pintar(lienzo()), H.G.HudDex.bandas().piezas.aviso.w);
    t('caché de anchos del HUD Dex: se vacía al terminar de cargar una fuente (document.fonts, evento «loadingdone»; y con fonts.ready): el aviso pasa a medir con la letra nueva',
      oyentes >= 1 && w1 === w0 && w2 < w1, { oyentes, w0, w1, w2 });
  } catch (e) { t('caché de anchos y fuentes', false, String(e && e.stack || e)); }

  // ---- P. Acabado de las flechas (verificación de la tanda PokéSwarm) ----
  // P1. Entre dos etiquetas, 12 px de texto a texto (a 6, «Kingambit · 18 m» y «Sol · 33 m» se leían como una frase); el
  //     cuerpo de cada flecha, con su punta, a 8 px o más de las piezas del HUD y de la píldora del ataque (a 1,3 px
  //     parecía señalar la ranura); y, en el plegable abierto, ninguna flecha ni su etiqueta sobre el pliegue (también con
  //     la barra del navegador, con el pliegue de la pantalla).
  try {
    const res = [];
    /** Hueco entre dos cajas (negativo si se pisan). */
    const hueco = (a, b) => Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), b.y - (a.y + a.h), a.y - (b.y + b.h));
    const revisar = (H, nombre, n) => {
      const ctx = H.pintar(), B = H.G.HudDex.bandas(), F = B.flechas, mal = [];
      const pzs = piezas(H.G, H.pl).concat(B.pildora ? [{ n: 'pildora', ...B.pildora }] : []);
      const et = F.flatMap(f => f.cajas.filter(c => c.etiqueta).map(c => Object.assign({ f: f.tipo }, c)));
      // Las cajas de etiqueta llevan 2 px de relleno por lado: 8 entre cajas son 12 entre textos.
      for (let i = 0; i < et.length; i++) for (let j = i + 1; j < et.length; j++) {
        const g = hueco(et[i], et[j]);
        if (g < 8 - 0.5) mal.push(`etiquetas de ${et[i].f} y ${et[j].f} a ${Math.round(g + 4)} px de texto a texto`);
      }
      for (const f of F) {
        const c = f.cajas.find(x => !x.etiqueta), p = c && pzs.find(q => hueco(c, q) < 8 - 0.5);
        if (p) mal.push(`${f.tipo} a ${Math.round(hueco(c, p))} px de ${p.n}`);
      }
      if (B.pliegue) for (const f of F) for (const c of f.cajas) if (pisaPliegueR(c, B.pliegue)) mal.push(`${c.etiqueta ? 'etiqueta' : 'flecha'} de ${f.tipo} sobre el pliegue`);
      const p = problemasFlechas(H, ctx);
      if (mal.length || p.mal.length || p.n !== n) res.push({ caso: nombre, flechas: p.n, mal: mal.concat(p.mal).slice(0, 4) });
    };
    // Todos arriba (móvil y escritorio): el jefe y tres compañeros, uno caído, por encima de la pantalla.
    for (const [w, h, tactil = false] of [[844, 390, true], [780, 360, true], [1440, 900], [1024, 768], [724, 784, true]]) {
      const H = cargarHud({ w, h, tactil });
      H.juego.jefes = [jefeFalso(w * 0.35, -700)];
      H.juego.mates = [mateFalso('Ana', '#5FC8FF', w * 0.45, -500, { dead: true }), mateFalso('Leo', '#7EE07A', w * 0.6, -1200), mateFalso('Sol', '#FF8AD8', w * 0.42, -1000)];
      revisar(H, `${w}x${h} todos arriba`, 4);
    }
    // En línea a la derecha, a la altura de la ranura activa (con la píldora del ataque, de nombre largo, a la vista).
    for (const [w, h] of [[844, 390], [780, 360], [807, 360], [724, 784]]) {
      const H = cargarHud({ w, h, tactil: true });
      H.pl.slots[1][0].name = 'Danza Espada';
      H.pintar();
      const S1 = H.G.HudDex.bandas().piezas.ranuras[1], yc = S1.y + S1.h / 2;
      H.juego.jefes = [jefeFalso(w + 900, yc)];
      H.juego.mates = [mateFalso('Ana', '#5FC8FF', w + 300, yc + 10, { dead: true }), mateFalso('Leo', '#7EE07A', w + 1500, yc - 10), mateFalso('Sol', '#FF8AD8', w + 2000, yc + 20)];
      revisar(H, `${w}x${h} en línea a la derecha`, 4);
    }
    // Las cuatro esquinas (las de N1), en el móvil, con muesca y en el plegable.
    const ESQ = [[1, -1], [1, 1], [-1, -1], [-1, 1]];
    for (const [w, h, seguras] of [[844, 390], [844, 390, { sup: 0, der: 47, inf: 21, izq: 47 }], [724, 784], [784, 724]]) {
      for (const [sx, sy] of ESQ) {
        const H = cargarHud({ w, h, tactil: true, seguras: seguras || { sup: 0, der: 0, inf: 0, izq: 0 } });
        const cx = sx > 0 ? w : 0, cy = sy > 0 ? h : 0;
        H.juego.jefes = [jefeFalso(cx + sx * 900, cy + sy * 500)];
        H.juego.mates = [mateFalso('Ana', '#5FC8FF', cx + sx * 1500, cy + sy * 300, { dead: true }), mateFalso('Leo', '#7EE07A', cx + sx * 600, cy + sy * 1400),
          mateFalso('Sol', '#FF8AD8', cx + sx * 2000, cy + sy * 900)];
        revisar(H, `${w}x${h}${seguras ? ' muesca' : ''} esquina ${sx},${sy}`, 4);
      }
    }
    // El pliegue: el jefe justo encima (vertical, x = 362) o los compañeros en el horizonte (horizontal, y = 362; girado con
    // la barra del navegador, y = 278).
    for (const [w, h, pantalla] of [[724, 784], [724, 700, { w: 724, h: 784 }], [784, 724], [784, 640, { w: 784, h: 724 }]]) {
      const H = cargarHud({ w, h, tactil: true });
      if (pantalla) H.G.Estilo.pantalla = () => pantalla;
      const vertical = (pantalla || { w, h }).w < (pantalla || { w, h }).h, pos = vertical ? 362 : (pantalla ? 278 : 362);
      if (vertical) {
        H.juego.jefes = [jefeFalso(pos, -800)];
        H.juego.mates = [mateFalso('Ana', '#5FC8FF', pos, -1500, { dead: true }), mateFalso('Leo', '#7EE07A', pos, h + 900)];
      } else {
        H.juego.jefes = [jefeFalso(-900, pos)];
        H.juego.mates = [mateFalso('Ana', '#5FC8FF', w + 1500, pos, { dead: true }), mateFalso('Leo', '#7EE07A', w + 700, pos)];
      }
      H.pintar();
      const pg = H.G.HudDex.bandas().pliegue;
      if (!pg || pg.pos !== pos) { res.push({ caso: `${w}x${h} pliegue`, mal: ['el pliegue no es el esperado', pg] }); continue; }
      revisar(H, `${w}x${h}${pantalla ? ' con la barra' : ''}: pliegue ${pg.eje === 'x' ? 'vertical' : 'horizontal'} en ${pos}`, 3);
    }
    t('acabado de las flechas: 12 px de texto a texto entre etiquetas, el cuerpo de cada flecha a 8 px o más de las piezas del HUD y de la píldora del ataque, y nada sobre el pliegue del plegable abierto (todos arriba, en línea a la altura de la ranura activa, en las cuatro esquinas y con el jefe o los compañeros sobre el pliegue; escritorio, móvil, muesca y el Magic V6, también con la barra del navegador)',
      !res.length, res.slice(0, 6));
  } catch (e) { t('acabado de las flechas', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`HUD Dex: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`HUD Dex: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 16. Entornos del Gremio, clima de dos tonos y horneado escalonado (lote 3) ----------------
function entornoChecks() {
  console.log('16. Entornos del Gremio, clima y horneado escalonado (js/world/entorno.js y horno.js con tiles.js, world.js y weather.js reales)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** Un canvas de mentira: guarda lo que se pone con putImageData (los chunks y los halos se leen así). */
  const lienzoFalso = () => {
    const cv = { width: 0, height: 0, _img: null };
    cv.getContext = () => ({ createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData(img) { cv._img = img; } });
    return cv;
  };
  /** Un contexto 2D de mentira que apunta cada llamada (y el alfa con que se pinta cada imagen). */
  const ctxFalso = () => {
    const o = { ops: [], imgs: [], grads: [], alfas: [], estilos: [], globalAlpha: 1 };
    return new Proxy(o, {
      get(x, k) {
        if (k in x) return x[k];
        if (k === 'createRadialGradient') return (...a) => { const g = { args: a, stops: [], addColorStop(p, c) { g.stops.push([p, c]); } }; x.grads.push(g); x.ops.push([k]); return g; };
        return (...a) => { x.ops.push([k, ...a]); if (k === 'drawImage') { x.imgs.push(a); x.alfas.push(x.globalAlpha); } };
      },
      set(x, k, v) { if (k === 'fillStyle') x.estilos.push(v); x[k] = v; return true; }
    });
  };
  const camara = (x, y, w = 768, h = 432) => ({ x, y, w, h, scale: 1, left() { return this.x - this.w / 2; }, top() { return this.y - this.h / 2; },
    sees(px, py, pad = 60) { return px > this.left() - pad && px < this.left() + this.w + pad && py > this.top() - pad && py < this.top() + this.h + pad; } });
  /** El mundo real (tiles.js y world.js; `upstream`: sin las líneas «MOD nico») con entorno.js y horno.js si se piden, un reloj
   *  de mentira y un estilo de mentira con la interfaz de G.Estilo (actual, dex, on). paintChunk apunta cada horneado (y lo
   *  alarga `lento` ms en el reloj) y marca el lienzo con su bioma, su estilo y su chunk. `mapas`: los mapas propios entre
   *  tiles.js y world.js con G.MODS.mapasPropios = mapas (como el juego, true; con false, el mundo del proyecto base).
   *  `mundoDex` es G.MODS.mundoDex: aquí, false por omisión (los casos A-F son los del lote 3, con Clásico = el mundo de
   *  upstream, la red de seguridad frente a upstream); el G mira el del juego (true: el mundo Dex con los dos estilos). */
  function mundo({ estilo = 'dex', entorno = true, horno = true, upstream = false, lento = 0, mapas = true, mundoDex = false } = {}) {
    const reloj = { t: 1000 };
    const c = { console, performance: { now: () => reloj.t }, document: { createElement: lienzoFalso } };
    vm.createContext(c);
    c.window = c; c.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js']) vm.runInContext(rd(f), c, { filename: f });
    const G = c.G, oyentes = [];
    G.MODS.mundoDex = mundoDex;
    G.Estilo = { actual: estilo, get dex() { return this.actual === 'dex'; }, on(fn) { oyentes.push(fn); }, set(v) { this.actual = v; oyentes.forEach(fn => fn(v)); } };
    G.Settings = { fx: 2, get: () => false };
    G.Sprites = { PX: 2 };
    G.Game = { state: 'playing', st: { time: 10 }, player: { x: 0, y: 0 } };
    G.Rift = { inArena: false, rift: null };
    const src = f => (upstream ? rd(f).split(/\r?\n/).filter(l => !/MOD nico/.test(l)).join('\n') : rd(f));
    vm.runInContext(src('js/world/tiles.js'), c, { filename: 'js/world/tiles.js' });
    if (!upstream) cargarMapas(c, mapas);
    vm.runInContext(src('js/world/world.js'), c, { filename: 'js/world/world.js' });
    if (entorno) vm.runInContext(rd('js/world/entorno.js'), c, { filename: 'js/world/entorno.js' });
    if (horno) vm.runInContext(rd('js/world/horno.js'), c, { filename: 'js/world/horno.js' });
    const pinta = G.Tiles.paintChunk, hornos = [];
    G.Tiles.paintChunk = function (cx, cy, n, at, df, bi) {
      const cv = pinta.apply(this, arguments);
      reloj.t += lento;
      cv.__bi = bi; cv.__estilo = G.Estilo.actual; cv.__k = cx + ',' + cy; cv.__sem = G.World.semilla;
      hornos.push(cv.__k);
      return cv;
    };
    return { G, c, reloj, hornos };
  }
  /** Un fotograma como en el juego: el terreno (drawGround), el horno (tick, que llama G.Entorno.suelo) y update().
   *  Devuelve cuántos chunks se han horneado, cuáles y el contexto con lo pintado. */
  function fotograma(M, cam, dt = 1 / 60) {
    const ctx = ctxFalso(), antes = M.hornos.length;
    M.G.World.drawGround(ctx, cam);
    if (M.G.Horno && M.G.Entorno) M.G.Horno.tick(cam);
    M.reloj.t += dt * 1000;
    M.G.World.update(dt, cam);
    return { n: M.hornos.length - antes, ctx, hechos: M.hornos.slice(antes) };
  }
  const visibles = (cam, CW = 512) => {
    const out = [];
    for (let cy = Math.floor(cam.top() / CW); cy <= Math.floor((cam.top() + cam.h) / CW); cy++)
      for (let cx = Math.floor(cam.left() / CW); cx <= Math.floor((cam.left() + cam.w) / CW); cx++) out.push(cx + ',' + cy);
    return out;
  };
  const bytes = cv => cv && cv._img && cv._img.data;
  const iguales = (a, b) => !!(a && b && a.length === b.length && a.every((v, i) => v === b[i]));
  const SEMILLA = 1234;

  // ---- A. Paletas: el suelo conserva su tono; Clásico vuelve a upstream (sin los mapas propios); con ellos, sin recoloreo ----
  try {
    const U = mundo({ upstream: true, entorno: false, horno: false }).G, D = mundo({ mapas: false }).G;
    const BU = U.Tiles.BIOMES, BD = D.Tiles.BIOMES, PAL = D.MARCA.biomas;
    const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const suelo = [0, 1, 2].every(i => ['floor', 'dirt', 'speck'].every(k => eq(BD[i][k], BU[i][k])));
    const gremio = [0, 1, 2].every(i => Object.keys(PAL[i]).filter(k => k !== 'nombre' && k[0] !== '_').every(k => eq(BD[i][k], PAL[i][k])));
    const luz = [0, 1, 2].map(i => BD[i].light !== BU[i].light);
    t('sin los mapas propios (mapasPropios = false), paletas del Gremio con Dex: floor, dirt y speck idénticos a upstream en los 3 biomas; paredes, agua, flores, hojas, troncos, rocas y hierba de G.MARCA.biomas; `light` cambia sólo en cueva y volcán (algo más oscuro)',
      suelo && gremio && !luz[0] && luz[1] && luz[2] && D.Entorno.aplicada === 'dex', { luz, light: [0, 1, 2].map(i => [BU[i].light, BD[i].light]) });
    const arenas = BD.slice(3).every((b, i) => eq(b, BU[3 + i]));
    D.Estilo.set('clasico');
    const vuelta = [0, 1, 2].every(i => D.Entorno.CAMPOS.every(k => eq(BD[i][k], BU[i][k])) && eq(BD[i], BU[i])) && BD.length === BU.length;
    t('sin los mapas propios, con Clásico las paletas vuelven a las de upstream (copia ORIG, campo a campo) y las arenas de la grieta no se tocan nunca (con mundoDex = false)', arenas && vuelta && D.Entorno.aplicada === 'clasico');
    // Con los mapas propios (como el juego): G.MARCA.biomas sólo lleva { nombre, _g }, así que Dex no recolorea nada; la
    // gradación, el farol y las motas siguen (aplicada 'dex').
    const MD = mundo().G, MC = mundo({ estilo: 'clasico' }).G, BM = MD.Tiles.BIOMES, DAT = MD.MapasDatos.BIOMAS;
    const deDatos = [0, 1, 2].every(i => Object.keys(DAT[i]).every(k => eq(BM[i][k], DAT[i][k])));
    t('con los mapas propios, Dex no recolorea: los 3 biomas llevan las paletas de G.MapasDatos (CAMPOS vacío), los 21 iguales que con Clásico, y la gradación sigue (aplicada «dex»)',
      deDatos && !MD.Entorno.CAMPOS.length && eq(BM, MC.Tiles.BIOMES) && MD.Entorno.aplicada === 'dex', { CAMPOS: MD.Entorno.CAMPOS, aplicada: MD.Entorno.aplicada });
    const antes = JSON.stringify(BM);
    MD.Estilo.set('clasico');
    t('con los mapas propios, pasar a Clásico (con mundoDex = false) no cambia ningún color (ni de los biomas ni de las arenas)', JSON.stringify(BM) === antes && MD.Entorno.aplicada === 'clasico');
  } catch (e) { t('paletas', false, String(e && e.stack || e)); }

  // ---- B. Con Clásico, el chunk es byte a byte el de upstream (también tras ir y volver de Dex); sin los mapas propios ----
  try {
    const U = mundo({ upstream: true, entorno: false, horno: false }), C = mundo({ estilo: 'dex', mapas: false });
    C.G.Estilo.set('clasico');
    let casos = 0;
    const mal = [];
    for (const bi of [0, 1, 2, U.G.Tiles.arenaBiome('fire')]) for (const [x, y] of [[0, 0], [2600, -1800], [-4100, 3300]]) {
      for (const M of [U, C]) { M.G.World.reset(SEMILLA); M.G.World.setBiome(bi, true); }
      const cam = camara(x, y), a = ctxFalso(), b = ctxFalso();
      U.G.World.drawGround(a, cam); C.G.World.drawGround(b, cam);
      a.imgs.forEach((im, i) => { casos++; if (!iguales(bytes(im[0]), bytes(b.imgs[i] && b.imgs[i][0]))) mal.push({ bi, x, y, i }); });
    }
    t(`sin los mapas propios (mapasPropios = false, con sus 4 ficheros cargados), con mundoDex = false y con Clásico, cada chunk horneado es byte a byte el de upstream (${casos} chunks: bosque, cueva, volcán y una arena, con paredes y charcos, después de pasar por Dex)`, casos >= 24 && !mal.length, mal.slice(0, 4));
  } catch (e) { t('Clásico = upstream', false, String(e && e.stack || e)); }

  // ---- C. Gradación: sólo el suelo, determinista y sin trazos ----
  try {
    const M = mundo(), G = M.G, W = G.World, TS = W.TS;
    W.reset(SEMILLA);
    const at = (tx, ty) => W.kindAt(tx * TS + 1, ty * TS + 1);
    // Chunks con paredes y con charcos cerca del centro.
    const cand = [];
    for (let cy = -6; cy <= 6 && cand.length < 6; cy++) for (let cx = -6; cx <= 6 && cand.length < 6; cx++) {
      let p = 0, l = 0;
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const k = at(cx * 16 + i, cy * 16 + j); if (k === 'wall') p++; else if (k === 'liquid') l++; }
      if (p > 8 && l > 8) cand.push([cx, cy]);
    }
    let determinista = true, maxGrad = 0;
    const df = (gx, gy) => (Math.sin(gx / 90) + Math.cos(gy / 70)) / 4 + 0.5;
    // Por píxel, con la máscara de suelo de mapas-pintar.js (clasesChunk): [píxeles, gradados] de cada clase.
    const SUB = Object.assign({}, G.Mapas.SUB), cuenta = { suelo: [0, 0], triangulo: [0, 0], recorte: [0, 0], otro: [0, 0] };
    for (const [cx, cy] of cand.slice(0, 3)) {
      const clases = clasesChunk(SUB, (tx, ty) => G.Mapas.codigo(tx, ty, SEMILLA, null), cx, cy);
      for (const bi of [0, 1, 2, G.Tiles.arenaBiome('fire')]) {
        const pinta = () => G.Tiles.paintChunk(cx, cy, 16, at, df, bi, SEMILLA);
        const con = bytes(pinta());
        const otra = bytes(pinta());
        const E = G.Entorno; G.Entorno = null; const sin = bytes(pinta()); G.Entorno = E;
        if (!iguales(con, otra)) determinista = false;
        for (let p = 0; p < 256 * 256; p++) {
          const o = p * 4, c = cuenta[clases[p]];
          c[0]++;
          if (con[o] !== sin[o] || con[o + 1] !== sin[o + 1] || con[o + 2] !== sin[o + 2] || con[o + 3] !== sin[o + 3]) c[1]++;
        }
      }
    }
    const pct = c => Math.round(100 * c[1] / Math.max(1, c[0]));
    t(`gradación con los mapas propios (mapas-pintar.js), por píxel con su máscara de suelo: el ${pct(cuenta.suelo)} % del suelo (> 60) y el ${pct(cuenta.recorte)} % de los ${cuenta.recorte[0]} píxeles de los recortes de las esquinas de paredes y charcos, que enseñan el suelo de al lado (> 90), y ${cuenta.triangulo[1]} de los ${cuenta.triangulo[0]} de los triángulos de charco de las orillas y ${cuenta.otro[1]} de los ${cuenta.otro[0]} del resto de paredes y charcos (0) (chunks ${cand.slice(0, 3).map(c => c.join(',')).join(' ')}, en 3 biomas y una arena de lava)`,
      cand.length >= 3 && cuenta.suelo[1] / cuenta.suelo[0] > 0.6 && cuenta.recorte[0] > 0 && cuenta.recorte[1] / cuenta.recorte[0] > 0.9 &&
      cuenta.triangulo[0] > 0 && !cuenta.triangulo[1] && !cuenta.otro[1], cuenta);
    t('gradación determinista: dos horneados del mismo chunk dan los mismos bytes', determinista);
    // Sin los mapas propios (mapasPropios = false), tiles.js no trae máscara: la gradación sigue como antes, por casilla.
    {
      const Gf = mundo({ mapas: false }).G, Wf = Gf.World;
      Wf.reset(SEMILLA);
      const atf = (tx, ty) => Wf.kindAt(tx * TS + 1, ty * TS + 1), candf = [];
      for (let cy = -6; cy <= 6 && candf.length < 3; cy++) for (let cx = -6; cx <= 6 && candf.length < 3; cx++) {
        let p = 0, l = 0;
        for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const k = atf(cx * 16 + i, cy * 16 + j); if (k === 'wall') p++; else if (k === 'liquid') l++; }
        if (p > 8 && l > 8) candf.push([cx, cy]);
      }
      let fuera = 0, suelo = 0, gradados = 0;
      for (const [cx, cy] of candf) {
        const kinds = [];
        for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) kinds.push(atf(cx * 16 + i, cy * 16 + j));
        for (const bi of [0, 1, 2]) {
          const pinta = () => Gf.Tiles.paintChunk(cx, cy, 16, atf, df, bi, SEMILLA);
          const con = bytes(pinta()), E = Gf.Entorno; Gf.Entorno = null; const sin = bytes(pinta()); Gf.Entorno = E;
          for (let p = 0; p < 256 * 256; p++) {
            const o = p * 4, dif = con[o] !== sin[o] || con[o + 1] !== sin[o + 1] || con[o + 2] !== sin[o + 2] || con[o + 3] !== sin[o + 3];
            if (kinds[(p >> 12) * 16 + ((p & 255) >> 4)] === 'floor') { suelo++; if (dif) gradados++; } else if (dif) fuera++;
          }
        }
      }
      t(`sin los mapas propios (mapasPropios = false: tiles.js, sin máscara de suelo), la gradación sigue por casilla: ${fuera} píxeles cambiados fuera de las casillas de suelo y el ${Math.round(100 * gradados / Math.max(1, suelo))} % del suelo graduado (chunks ${candf.map(c => c.join(',')).join(' ')}, en los 3 biomas)`,
        candf.length === 3 && !fuera && gradados / suelo > 0.6, { candf, fuera, gradados, suelo });
    }
    // Sin trazos: sobre un suelo liso, la diferencia entre dos píxeles de suelo vecinos ≤ 6/255 por canal.
    let lisos = 0;
    for (const bi of [0, 1, 2, G.Tiles.arenaBiome('fire'), G.Tiles.arenaBiome('water')]) for (const [cx, cy] of cand.slice(0, 3)) {
      const col = parseInt(G.Tiles.BIOMES[bi].floor[0].slice(1), 16), base = ((255 << 24) | ((col & 255) << 16) | (col & 0xff00) | (col >> 16)) >>> 0;
      const buf = new Uint32Array(256 * 256).fill(base);
      G.Entorno.gradar({ w: 256, h: 256, get: (x, y) => buf[y * 256 + x], set(x, y, v) { buf[y * 256 + x] = v; } }, cx, cy, 16, at, bi);
      const ch = (v, s) => (v >>> s) & 255;
      for (let py = 0; py < 256; py++) for (let px = 0; px < 256; px++) {
        if (at(cx * 16 + (px >> 4), cy * 16 + (py >> 4)) !== 'floor') continue;
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
          const qx = px + dx, qy = py + dy;
          if (qx > 255 || qy > 255 || at(cx * 16 + (qx >> 4), cy * 16 + (qy >> 4)) !== 'floor') continue;
          const a = buf[py * 256 + px], b = buf[qy * 256 + qx];
          for (const s of [0, 8, 16]) maxGrad = Math.max(maxGrad, Math.abs(ch(a, s) - ch(b, s)));
        }
      }
      lisos++;
    }
    t(`gradación sin trazos: sobre un suelo liso, la diferencia entre dos píxeles de suelo vecinos es como mucho ${maxGrad}/255 por canal (≤ 6: todo en baja frecuencia), en 3 biomas y 2 arenas`, lisos >= 15 && maxGrad <= 6, { maxGrad });
    // Con Clásico, gradar no hace nada.
    G.Estilo.set('clasico');
    const buf = new Uint32Array(256 * 256).fill(0xff336699);
    G.Entorno.gradar({ w: 256, h: 256, get: (x, y) => buf[y * 256 + x], set(x, y, v) { buf[y * 256 + x] = v; } }, cand[0][0], cand[0][1], 16, at, 0);
    t('con Clásico, gradar() no toca ningún píxel (con mundoDex = false)', buf.every(v => v === 0xff336699));
  } catch (e) { t('gradación', false, String(e && e.stack || e)); }

  // ---- D. Horno ----
  /** Lo visible y el anillo ya horneados (como al llevar un rato quieto). */
  const asentar = (M, cam, n = 80) => { for (let i = 0; i < n; i++) fotograma(M, cam); };
  try {
    // D1. Precalentado desde t % 240 = 237 (no antes), primero el chunk de tu Pokémon; al cambiar, 0 horneados.
    const M = mundo(), G = M.G, cam = camara(300, 200);
    G.Game.player = { x: 300, y: 200 };
    G.World.reset(SEMILLA); G.World.setBiome(0, true);
    G.Game.st.time = 236.9; asentar(M, cam);
    const antes = G.Horno.stats.precalentados;
    G.Game.st.time = 237;
    const f1 = fotograma(M, cam), f2 = fotograma(M, cam);
    const primero = [...f1.hechos, ...f2.hechos][0];
    for (let i = 0; i < 60; i++) fotograma(M, cam);
    const pre = G.Horno.precalentado;
    G.Game.st.time = 240;
    G.World.setBiome(1);                                   // lo que hace game.js al cambiar de tramo
    const cambio = fotograma(M, cam);
    const vis = visibles(cam), dibujados = cambio.ctx.imgs.filter((im, i) => i % 2 === 1).map(im => im[0].__bi);
    t(`precalentado (con los mapas propios): nada antes de t % 240 = 237 (${antes} a los 236,9 s); desde ahí el bioma siguiente, primero el chunk de tu Pokémon (${primero}); al cambiar, 0 chunks horneados en ese fotograma (${pre && pre.n} precalentados) y el bioma nuevo ya pintado en los ${vis.length} visibles`,
      antes === 0 && primero === '0,0' && pre && pre.bioma === 1 && pre.n >= vis.length && cambio.n === 0 && G.Horno.stats.ultimoCambio.horneados === 0 && dibujados.length === vis.length && dibujados.every(b => b === 1),
      { antes, primero, pre, cambio: cambio.n, ultimo: G.Horno.stats.ultimoCambio, dibujados });
    G.Rift.inArena = true; G.Game.st.time = 477;
    t('precalentado: nunca en la arena de la grieta', G.Horno.siguiente() === null);
    G.Rift.inArena = false;
    G.Game.st.time = 717; G.World.setBiome(2, true);
    t('precalentado: el bioma siguiente sale de G.MODS.biomaNormal (a los 717 s, del volcán al bosque)', G.Horno.siguiente() === 0);
  } catch (e) { t('precalentado', false, String(e && e.stack || e)); }
  try {
    // D2. Sin precalentado (un salto de reloj), con un paintChunk lento (12 ms): como mucho 1 chunk por fotograma, uno cada
    // ceil(12 / 4) = 3, del más cercano al más lejano; mientras, la imagen vieja (sin guardarla en el mapa nuevo).
    const M = mundo({ lento: 12 }), G = M.G, cam = camara(300, 200);
    G.Game.player = { x: 300, y: 200 };
    G.World.reset(SEMILLA); G.World.setBiome(0, true); G.Game.st.time = 100;
    asentar(M, cam, 120);
    G.World.setBiome(1);
    const ns = [], hechos = [];
    let primeras = null;
    for (let i = 0; i < 90; i++) { const f = fotograma(M, cam); ns.push(f.n); hechos.push(...f.hechos.map(k => [i, k])); if (i === 0) primeras = f.ctx.imgs.map(im => im[0]); }
    const vis = visibles(cam), cuando = vis.map(k => (hechos.find(h => h[1] === k) || [Infinity])[0]);
    const enVis = hechos.filter(h => vis.includes(h[1])).map(h => h[0]);
    const juntos = enVis.filter((v, i, a) => i > 0 && v - a[i - 1] < 3);
    // En el primer fotograma del fundido, la capa nueva de cada chunk aplazado es la MISMA imagen vieja.
    const viejaEnNueva = primeras.length === 2 * vis.length && primeras.every((im, i) => i % 2 === 0 || im === primeras[i - 1]);
    // Pasado el fundido, lo que hay en el mapa del bioma es del bioma nuevo (la vieja nunca se guardó).
    const finales = vis.map(k => { const [cx, cy] = k.split(',').map(Number); return G.World.chunkImage(cx, cy).__bi; });
    t(`horneado escalonado con un chunk de 12 ms (presupuesto 4): como mucho 1 por fotograma (máximo ${Math.max(...ns)}), uno cada 3 fotogramas o más, primero el de tu Pokémon (fotogramas ${cuando.join(', ')}); mientras, la imagen vieja, nunca guardada en el mapa nuevo`,
      Math.max(...ns) <= 1 && !juntos.length && cuando.every(c => c < 90) && cuando[vis.indexOf('0,0')] === Math.min(...cuando) && viejaEnNueva && finales.every(b => b === 1),
      { ns: ns.slice(0, 20), cuando, juntos: juntos.slice(0, 5), viejaEnNueva, finales });
    // Durante el fundido, un chunk que no se había visto: la capa vieja se hornea en el acto (como upstream) y cuenta: ese
    // fotograma el horno no añade otro. Fuera del fundido (sin imagen vieja), aplazar no hace nada: se hornea ya.
    const lejos = camara(9000, 9000), fv = fotograma(M, lejos), nv = visibles(lejos).length;
    for (let i = 0; i < 160; i++) fotograma(M, cam);
    const lejos2 = camara(-9000, 9000), f = fotograma(M, lejos2);
    t(`aplazar sólo con imagen vieja: durante el fundido, un sitio nunca visto hornea su capa vieja como upstream (${fv.n} de ${nv}) y el horno no añade nada; fuera del fundido, cada chunk nuevo se hornea en el acto (${f.n} de ${visibles(lejos2).length})`,
      fv.n === nv && fv.ctx.imgs.every(im => im[0].__bi === 0) && f.n === visibles(lejos2).length && f.ctx.imgs.every(im => im[0].__bi === 1), { fv: fv.n, f: f.n });
  } catch (e) { t('horneado escalonado', false, String(e && e.stack || e)); }
  try {
    // D3. Lo precalentado se descarta con una grieta, con otro mundo o al cambiar de estilo.
    const M = mundo(), G = M.G, cam = camara(300, 200);
    G.World.reset(SEMILLA); G.World.setBiome(0, true); G.Game.st.time = 237.5;
    asentar(M, cam, 40);
    const n0 = G.Horno.precalentado && G.Horno.precalentado.n;
    G.World.setArena({ tx: 400, ty: 400, r: 12, type: 'fire' }); fotograma(M, cam);
    const n1 = G.Horno.precalentado && G.Horno.precalentado.n;
    asentar(M, cam, 40);
    G.World.reset(99); fotograma(M, cam);
    const n2 = G.Horno.precalentado && G.Horno.precalentado.n;
    asentar(M, cam, 40);
    G.Estilo.set('clasico');
    const n3 = G.Horno.precalentado;
    t(`una grieta, otro mundo (reset con otra semilla) o un cambio de estilo (con mundoDex = false) descartan lo precalentado (${n0} → ${n1}, ${n2} y ${n3 && n3.n})`, n0 >= 6 && n1 <= 1 && n2 <= 1 && !n3, { n0, n1, n2, n3 });
  } catch (e) { t('invalidación del precalentado', false, String(e && e.stack || e)); }
  try {
    // D4. Cambio de estilo (en la pausa): 0 horneados de golpe; el suelo se rehornea de uno en uno desde tu Pokémon.
    const M = mundo(), G = M.G, cam = camara(-700, 900);
    G.Game.player = { x: -700, y: 900 }; G.Game.state = 'paused';
    G.World.reset(SEMILLA); G.World.setBiome(2, true);
    asentar(M, cam);
    G.Estilo.set('clasico');
    const ns = [], hechos = [];
    for (let i = 0; i < 30; i++) { const f = fotograma(M, cam, 0); ns.push(f.n); hechos.push(...f.hechos); }
    const vis = visibles(cam), mio = Math.floor(-700 / 512) + ',' + Math.floor(900 / 512);
    const finales = vis.map(k => { const [cx, cy] = k.split(',').map(Number); return G.World.chunkImage(cx, cy).__estilo; });
    t(`al cambiar de estilo (en la pausa, con mundoDex = false): ningún horneado de golpe, como mucho 1 por fotograma (${ns.slice(0, vis.length + 1).join(',')}), el de tu Pokémon primero (${hechos[0]}) y, en ${vis.length + 1} fotogramas, todo lo visible en Clásico`,
      Math.max(...ns) <= 1 && hechos[0] === mio && finales.every(e => e === 'clasico') && !G.Horno.conViejas, { ns: ns.slice(0, 12), hechos: hechos.slice(0, 4), finales });
    // Y si justo después empieza otra partida (otro mundo) o se abre una arena, nada de las imágenes viejas.
    G.World.reset(SEMILLA); G.World.setBiome(0, true); asentar(M, cam);
    G.Estilo.set('dex'); G.World.reset(777); G.World.setBiome(1, true);
    const f = fotograma(M, cam);
    G.Estilo.set('clasico'); G.World.setArena({ tx: Math.floor(-700 / 32), ty: Math.floor(900 / 32), r: 10, type: 'water' }); G.World.setBiome(G.Tiles.arenaBiome('water'), true);
    const g = fotograma(M, cam);
    t('tras cambiar de estilo, si empieza otra partida (otro mundo) o se abre una arena, no se pinta ninguna imagen vieja: se hornea lo de ese mundo, como upstream',
      f.ctx.imgs.length && f.ctx.imgs.every(im => im[0].__sem === 777 && im[0].__bi === 1) && g.ctx.imgs.length && g.ctx.imgs.every(im => im[0].__sem === 777 && im[0].__bi === G.Tiles.arenaBiome('water')),
      { f: f.ctx.imgs.map(im => [im[0].__sem, im[0].__bi]), g: g.ctx.imgs.map(im => [im[0].__sem, im[0].__bi]) });
  } catch (e) { t('cambio de estilo', false, String(e && e.stack || e)); }
  try {
    // D5. El fondo de los menús: siempre precalentado el bioma siguiente; el cambio de cada 30 s no hornea nada.
    const M = mundo(), G = M.G, cam = camara(100, -50);
    G.Game.state = 'ui'; G.Game.player = null;
    G.World.reset(4242); G.World.setBiome(0, true);
    asentar(M, cam);
    const sig = G.Horno.siguiente();
    G.World.setBiome(1);                                   // Backdrop.step(), cada 30 s
    const f = fotograma(M, cam);
    t(`fondo de los menús: el bioma siguiente (${sig}) siempre precalentado; el cambio de cada 30 s hornea 0 chunks en su fotograma`, sig === 1 && f.n === 0, { sig, n: f.n });
  } catch (e) { t('fondo de los menús', false, String(e && e.stack || e)); }
  try {
    // D6. Sin horno.js, sin entorno.js (que es quien llama a tick) o sin los dos: como upstream, fotograma a fotograma.
    const guion = M => {
      const cam = camara(300, 200), out = [];
      M.G.World.reset(SEMILLA); M.G.World.setBiome(0, true);
      for (let i = 0; i < 6; i++) out.push(fotograma(M, cam).n);
      M.G.World.setBiome(1);
      for (let i = 0; i < 6; i++) out.push(fotograma(M, cam).n);
      cam.x += 900;
      for (let i = 0; i < 4; i++) out.push(fotograma(M, cam).n);
      return out.join(',');
    };
    const up = guion(mundo({ upstream: true, entorno: false, horno: false }));
    const sinNada = guion(mundo({ entorno: false, horno: false })), sinEntorno = guion(mundo({ entorno: false })), sinHorno = guion(mundo({ horno: false, estilo: 'clasico' }));
    t(`sin horno.js, sin entorno.js (nadie llama a tick) o sin los dos, world.js hornea como upstream, fotograma a fotograma (${up})`, sinNada === up && sinEntorno === up && sinHorno === up, { up, sinNada, sinEntorno, sinHorno });
  } catch (e) { t('sin ganchos', false, String(e && e.stack || e)); }

  // ---- E. Calidad: farol, halos y motas; nunca halos de disparos enemigos por defecto ----
  try {
    const M = mundo(), G = M.G, cam = camara(0, 0);
    G.World.reset(SEMILLA); G.World.setBiome(0, true);
    G.Game.player = { x: 0, y: 0 };
    G.Rift.rift = { x: 120, y: 60, t: 2, ttl: 10 };
    const jefe = { boss: true, dead: false, x: -150, y: 40, r: 20, types: ['fire'] };
    const disparos = [...Array(10)].map((_, i) => ({ friendly: false, x: 10 * i - 100, y: 100, color: '#ff7a9e' }))
      .concat([...Array(30)].map((_, i) => ({ friendly: true, x: 8 * i - 120, y: -60, color: '#4b9bff' })));
    G.EnemyMgr = { all: () => [jefe] }; G.Projectiles = { all: () => disparos };
    G.Weather = { current: null, KINDS: {} };
    const pinta = fx => { G.Settings.fx = fx; const ctx = ctxFalso(); G.Entorno.suelo(ctx, cam, M.reloj.t / 1000); M.reloj.t += 16; return ctx; };
    pinta(2);
    const c0 = pinta(0), c1 = pinta(1), c2 = pinta(2);
    const motas = c => c.ops.filter(o => o[0] === 'fillRect').length - c.grads.length;   // menos el rectángulo del farol
    const color = im => { const d = bytes(im[0]), n = im[0].width, o = ((n >> 1) * n + (n >> 1)) * 4; return [d[o], d[o + 1], d[o + 2]].join(); };
    const halosDe = (c, col) => c.imgs.filter(im => color(im) === col).length;
    const Q = G.MODS.calidadEntorno;
    t(`Calidad Baja: sin farol, sin halos y sin motas (${c0.grads.length}, ${c0.imgs.length} y ${motas(c0)})`, !c0.grads.length && !c0.imgs.length && !motas(c0));
    t(`Calidad Media: el farol, el halo de la grieta y las motas ×0,7 (${motas(c1)} de 26), sin halos del jefe ni de los disparos`,
      c1.grads.length === 1 && c1.imgs.length === 1 && halosDe(c1, '180,138,255') === 1 && motas(c1) === Math.round(26 * 0.7), { grads: c1.grads.length, imgs: c1.imgs.length, motas: motas(c1) });
    const amigos = halosDe(c2, '75,155,255'), hostiles = halosDe(c2, '255,36,64');
    t(`Calidad Alta: además, el halo del jefe (color de su tipo) y los de tus disparos (${amigos}, como mucho 24), ninguno de los 10 disparos enemigos por defecto (${hostiles}), y las 26 motas del bosque`,
      c2.grads.length === 1 && halosDe(c2, '255,123,61') === 1 && amigos === 24 && hostiles === 0 && motas(c2) === 26 && G.MODS.halosDisparosHostiles === false, { amigos, hostiles, motas: motas(c2) });
    G.MODS.halosDisparosHostiles = true;
    const c3 = pinta(2);
    G.MODS.halosDisparosHostiles = false;
    t(`con halosDisparosHostiles = true (y Calidad Alta), los disparos enemigos llevan halo en el rojo de peligro (${halosDe(c3, '255,36,64')}; 24 en total)`, halosDe(c3, '255,36,64') === 10 && halosDe(c3, '75,155,255') === 14);
    // La luz nunca va encima de un sprite: todo se pinta en la capa del suelo (drawScene, tras drawLiquid y antes de lo que tiene pies).
    t('el farol, los halos, las motas y las salpicaduras van en la capa del suelo: drawScene los pinta tras drawLiquid y antes de avisos, objetos, Pokémon y disparos; la tabla de Calidad, en mods.js',
      /G\.World\.drawLiquid\(ctx, cam, t\);\r?\n\s*if \(G\.Entorno\) G\.Entorno\.suelo\(ctx, cam, t\);[^\n]*\r?\n\s*G\.Hazards\.draw\(ctx\);/.test(rd('js/game.js')) && Q.length === 3 && !Q[0].farol && Q[1].farol && Q[2].halos.includes('disparos'));
    // Halos sin bordes duros: entre dos píxeles de arte vecinos del halo, el alfa salta como mucho 0,05.
    let salto = 0;
    c2.imgs.forEach((im, i) => {
      const d = bytes(im[0]), n = im[0].width, a = c2.alfas[i];
      for (let y = 0; y < n; y++) for (let x = 0; x + 1 < n; x++)
        salto = Math.max(salto, Math.abs(d[(y * n + x) * 4 + 3] - d[(y * n + x + 1) * 4 + 3]) / 255 * a, Math.abs(d[(x * n + y) * 4 + 3] - d[((x + 1) * n + y) * 4 + 3]) / 255 * a);
    });
    t(`halos pixelados sin bordes duros: el alfa salta como mucho ${salto.toFixed(3)} entre dos píxeles de arte vecinos (≤ 0,05)`, salto > 0 && salto <= 0.05);
    // Movimiento reducido: el halo de la grieta no late.
    G.Settings.get = k => k === 'calm';
    const a1 = pinta(1).alfas[0]; M.reloj.t += 250; const a2 = pinta(1).alfas[0];
    G.Settings.get = () => false;
    t('con «Menos sacudidas y destellos», el halo de la grieta no late', a1 === a2, { a1, a2 });
    // Con Clásico, nada en la capa del suelo (el horno sigue).
    G.Estilo.set('clasico');
    const cc = pinta(2);
    t('con Clásico, la capa del suelo no pinta nada (farol, halos, motas ni salpicaduras) (con mundoDex = false)', !cc.ops.length && !cc.grads.length);
  } catch (e) { t('Calidad', false, String(e && e.stack || e)); }

  // ---- F. Viñeta cálida y clima de dos tonos ----
  try {
    const M = mundo(), G = M.G, W = 1280, Hh = 720;
    const v = ctxFalso(), hizo = G.Entorno.vineta(v, W, Hh), g = v.grads[0];
    t('viñeta con Dex: cálida y suave (rgba(24,12,5) de 0 a 0,26 en las esquinas) desde el 46 % del lado menor: el centro, intacto',
      hizo && g && g.args[2] === Hh * 0.46 && g.args[5] === W * 0.8 && g.stops[0][1] === 'rgba(24,12,5,0)' && g.stops[1][1] === 'rgba(24,12,5,0.26)', g && { args: g.args, stops: g.stops });
    const vw = ctxFalso(); G.World.drawVignette(vw, W, Hh);
    G.Estilo.set('clasico');
    const vc = ctxFalso(), noHizo = G.Entorno.vineta(vc, W, Hh); G.World.drawVignette(vc, W, Hh);
    t('drawVignette (world.js): con Dex, la cálida; con Clásico, vineta() devuelve false y sale la negra de upstream (0,5, desde el 34 %) (con mundoDex = false)',
      vw.grads.length === 1 && vw.grads[0].args[2] === Hh * 0.46 && !noHizo && vc.grads.length === 1 && vc.grads[0].args[2] === Hh * 0.34 && vc.grads[0].stops[1][1] === 'rgba(0,0,0,.5)');
    G.Estilo.set('dex');
    // El clima, con weather.js real.
    G.Spawner = { say() {} }; G.Audio = { sfx() {} }; G.Coop = { active: false, isHost: false }; G.EnemyMgr = { all: () => [] };
    vm.runInContext('Math.random = () => 0.5;', M.c);      // gotas en sitios fijos, todas dentro (si no, alguna nace fuera y no se pinta)
    vm.runInContext(rd('js/systems/weather.js'), M.c, { filename: 'js/systems/weather.js' });
    const clima = (seg, fx = 2, kind = 'rain') => {
      G.Settings.fx = fx;
      G.Weather.reset(); G.Weather.force(kind, 70);
      if (seg > 0) G.Weather.update(seg, 0, null);
      const ctx = ctxFalso();
      G.Weather.draw(ctx, W, Hh, 0);
      const rects = ctx.ops.filter(o => o[0] === 'fillRect');
      return { rects: rects.length, gotas: Math.max(0, rects.length - 1) / (kind === 'rain' ? 10 : 2), ctx };
    };
    const l1 = clima(3), l05 = clima(1.5), l0 = clima(0), baja = clima(3, 0), niebla = clima(3, 2, 'fog'), nieve = clima(3, 2, 'snow');
    t(`clima Dex con weather.js real: la lluvia sigue a level() (${l1.gotas} gotas con el clima entero, ${l05.gotas} a mitad de la entrada de 3 s, ${l0.rects} rectángulos al empezar), a la mitad con Calidad Baja (${baja.gotas}); con niebla, sólo el tinte; nieve de dos tonos (${nieve.gotas})`,
      l1.gotas === 120 && l05.gotas === 60 && l0.rects === 0 && baja.gotas === 60 && niebla.rects === 1 && nieve.gotas === 70, { l1: l1.rects, l05: l05.rects, l0: l0.rects, baja: baja.rects, niebla: niebla.rects, nieve: nieve.rects });
    // Dos tonos: borde oscuro debajo y núcleo claro encima, en píxeles enteros; el tinte, con su tope.
    const enteros = l1.ctx.ops.filter(o => o[0] === 'fillRect').slice(1).every(o => o.slice(1).every(n => Number.isInteger(n)));
    const est = l1.ctx.estilos;
    t(`lluvia de dos tonos (#1d4a78 debajo y #e6f2ff encima, en píxeles enteros) y tinte con tope (${est[0]}: 0,09 × 1,6, como mucho 0,16)`,
      est[0] === 'rgba(50,90,170,0.144)' && est.indexOf('#1d4a78') > 0 && est.indexOf('#e6f2ff') > est.indexOf('#1d4a78') && enteros, { tinte: est[0], enteros });
    // La nieve: cada copo mide como poco un píxel de arte (verificación del 13-10-2026: a 1440x900 eran 2 px con el píxel
    // de arte de 4 y apenas se veía); en el móvil, como la guía (2 px).
    const copo = escala => { const antes = G.Camera; G.Camera = { scale: escala }; const n = clima(3, 2, 'snow'); G.Camera = antes;
      return [...new Set(n.ctx.ops.filter(o => o[0] === 'fillRect').slice(1).map(o => o[3] + 'x' + o[4]))]; };
    const escritorio = copo(2), movil = copo(2 / 3), sinCamara = copo(0);
    t(`nieve Dex: el copo mide un píxel de arte si es mayor que el de la guía (con la cámara de 1440x900, ×2: ${escritorio}; de un móvil, ×0,667: ${movil}; sin cámara: ${sinCamara})`,
      JSON.stringify(escritorio) === '["4x4"]' && JSON.stringify(movil) === '["2x2"]' && JSON.stringify(sinCamara) === '["2x2"]', { escritorio, movil, sinCamara });
    G.Estilo.set('clasico');
    const cu = clima(3);
    t(`con mundoDex = false y Clásico, el clima de upstream (70 gotas de 4 trazos y su tinte: ${cu.rects} rectángulos)`, cu.rects === 1 + 70 * 4, cu.rects);
  } catch (e) { t('viñeta y clima', false, String(e && e.stack || e)); }

  // ---- G. El mundo Dex con los dos estilos (G.MODS.mundoDex, como el juego desde el 14-10-2026: el estilo sólo cambia la interfaz) ----
  try {
    const D = mundo({ mundoDex: true, estilo: 'dex' }), C = mundo({ mundoDex: true, estilo: 'clasico' }), U = mundo({ upstream: true, entorno: false, horno: false });
    const BD = JSON.stringify(D.G.Tiles.BIOMES);
    t('con mundoDex, Clásico lleva las mismas paletas que Dex (aplicada «dex» en los dos) y pasar de uno a otro no cambia ningún color',
      JSON.stringify(C.G.Tiles.BIOMES) === BD && C.G.Entorno.aplicada === 'dex' && (D.G.Estilo.set('clasico'), JSON.stringify(D.G.Tiles.BIOMES) === BD && D.G.Entorno.aplicada === 'dex'));
    D.G.Estilo.set('dex');
    // Sin los mapas propios, también las paletas del Gremio con Clásico.
    const SD = mundo({ mundoDex: true, mapas: false }), SC = mundo({ mundoDex: true, mapas: false, estilo: 'clasico' });
    t('con mundoDex y sin los mapas propios, Clásico lleva las paletas del Gremio, como Dex', JSON.stringify(SD.G.Tiles.BIOMES) === JSON.stringify(SC.G.Tiles.BIOMES) && SC.G.Entorno.aplicada === 'dex');
    // Los chunks horneados: byte a byte iguales con Dex y con Clásico, y graduados (distintos de los de upstream sin entorno.js).
    let casos = 0, distintosUp = 0;
    const mal = [];
    for (const bi of [0, 1, 2]) for (const [x, y] of [[0, 0], [2600, -1800]]) {
      for (const M of [D, C, U]) { M.G.World.reset(SEMILLA); M.G.World.setBiome(bi, true); }
      const cam = camara(x, y), a = ctxFalso(), b = ctxFalso(), u = ctxFalso();
      D.G.World.drawGround(a, cam); C.G.World.drawGround(b, cam);
      a.imgs.forEach((im, i) => { casos++; if (!iguales(bytes(im[0]), bytes(b.imgs[i] && b.imgs[i][0]))) mal.push({ bi, x, y, i }); });
      const M2 = mundo({ mundoDex: true, entorno: false, horno: false }); M2.G.World.reset(SEMILLA); M2.G.World.setBiome(bi, true); M2.G.World.drawGround(u, cam);
      a.imgs.forEach((im, i) => { if (!iguales(bytes(im[0]), bytes(u.imgs[i] && u.imgs[i][0]))) distintosUp++; });
    }
    t(`con mundoDex, cada chunk horneado es el mismo con Dex y con Clásico (${casos} chunks de los 3 biomas) y lleva la gradación (${distintosUp} distintos del mismo pintor sin entorno.js)`, casos >= 12 && !mal.length && distintosUp === casos, mal.slice(0, 4));
    // La capa del suelo, la viñeta cálida y el clima de dos tonos, también con Clásico.
    const cam = camara(0, 0), cs = ctxFalso();
    C.G.Entorno.suelo(cs, cam, 1);
    const vc = ctxFalso(), vin = C.G.Entorno.vineta(vc, 1280, 720);
    C.G.Spawner = { say() {} }; C.G.Audio = { sfx() {} }; C.G.Coop = { active: false, isHost: false }; C.G.EnemyMgr = { all: () => [] };
    vm.runInContext('Math.random = () => 0.5;', C.c);
    vm.runInContext(rd('js/systems/weather.js'), C.c, { filename: 'js/systems/weather.js' });
    C.G.Weather.reset(); C.G.Weather.force('rain', 70); C.G.Weather.update(3, 0, null);
    const cw = ctxFalso(); C.G.Weather.draw(cw, 1280, 720, 0);
    t(`con mundoDex y Clásico: la capa del suelo pinta (el farol: ${cs.grads.length} degradado), la viñeta es la cálida y la lluvia, la de dos tonos (#1d4a78 y #e6f2ff)`,
      cs.grads.length >= 1 && vin && vc.grads.length === 1 && vc.grads[0].stops[1][1] === 'rgba(24,12,5,0.26)' && cw.estilos.includes('#1d4a78') && cw.estilos.includes('#e6f2ff'), { farol: cs.grads.length, vin, estilos: cw.estilos.slice(0, 4) });
    // Cambiar de estilo no rehornea nada (el mundo no cambia): 0 chunks en los fotogramas siguientes.
    const H = mundo({ mundoDex: true }), camH = camara(300, 200);
    H.G.World.reset(SEMILLA); H.G.World.setBiome(0, true);
    for (let i = 0; i < 40; i++) fotograma(H, camH);
    H.G.Estilo.set('clasico');
    const ns = [];
    for (let i = 0; i < 8; i++) ns.push(fotograma(H, camH).n);
    t(`con mundoDex, cambiar de estilo no rehornea ni descarta nada (${ns.join(',')} chunks en los 8 fotogramas siguientes)`, ns.every(n => n === 0), ns);
  } catch (e) { t('mundo Dex con los dos estilos', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`entornos del Gremio: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`entornos: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 17. ajustes de juego (lote 4): píxel nítido, encuadre, iris, rótulo de zona y golpe final ----------------
function juegoChecks() {
  console.log('17. Ajustes de juego (lote 4): píxel nítido, encuadre, iris, rótulo de zona y golpe final');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const casi = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
  /** El juego mínimo con mods.js, marca.js, settings.js y camera.js reales y los módulos pedidos. */
  const nuevo = ({ mods = {}, ajustes = {}, dpr = 1, ficheros = [] } = {}) => {
    const almacen = { 'ps.settings': JSON.stringify(ajustes) }, reloj = { t: 1000 };
    const c = { console, devicePixelRatio: dpr, performance: { now: () => reloj.t }, matchMedia: () => ({ matches: false }),
      localStorage: { getItem: k => (k in almacen ? almacen[k] : null), setItem: (k, v) => { almacen[k] = String(v); } } };
    c.window = c; c.G = {}; c.__reloj = reloj;
    vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js', 'js/core/settings.js', 'js/core/camera.js']) vm.runInContext(rd(f), c, { filename: f });
    Object.assign(c.G.MODS, mods);
    c.G.Sprites = { PX: 2 };
    for (const f of ficheros) vm.runInContext(rd(f), c, { filename: f });
    return c;
  };

  // ---- A. Píxel nítido: tabla de devicePixelRatio y pantallas ----
  try {
    const c = nuevo({ ficheros: ['js/ui/encuadre.js'] }), E = c.G.Encuadre;
    const DPR = [1, 1.25, 1.5, 1.75, 2, 2.625, 3], VPS = [[1440, 900], [1920, 1080], [1366, 768], [1280, 720], [1024, 768], [844, 390], [780, 360], [807, 360],
      [784, 724], [724, 784], [784, 362], [724, 392], [1000, 900], [900, 1000], [568, 320]];
    const mal = [], filas = [];
    for (const d of DPR) for (const [w, h] of VPS) {
      const k = E.calcular(w, h, d);
      const entero = casi(k.fisicos, Math.round(k.fisicos)) && casi(k.k, Math.round(k.k)) && casi(k.m, Math.round(k.m)) && k.m >= 1;
      if (!entero || k.perdida > 0.07 + 1e-9 || k.dprInt > Math.min(1.5, d) + 1e-9) mal.push({ w, h, d, ...k });
      if ([1, 2.625, 3].includes(d) && [[1440, 900], [844, 390], [784, 724], [784, 362]].some(v => v[0] === w && v[1] === h)) filas.push(`${w}x${h}@${d}: ${k.antes.toFixed(2)} -> ${+k.fisicos.toFixed(3)} px (${(k.perdida * 100).toFixed(1)} %)`);
    }
    t(`píxel nítido: en ${DPR.length * VPS.length} combinaciones (dpr ${DPR.join(', ')} y ${VPS.length} pantallas) el píxel de arte mide un número entero de píxeles físicos, el navegador amplía por un entero, nunca se pintan más píxeles que en upstream (resolución ≤ min(1,5, dpr)) y se deja de ver como mucho un 7 % del mundo (${filas.join('; ')})`,
      !mal.length, mal.slice(0, 4));
    const a = E.calcular(1440, 900, 1), b = E.calcular(844, 390, 3), d = E.calcular(1366, 768, 1), e = E.calcular(844, 390, 2.625);
    t('píxel nítido: 1440x900 pasa de 3,75 a 4 px (6,25 % menos de mundo); 1366x768 no sube a 4 (perdería un 11 %) y baja a 3; 844x390 a dpr 3, resolución 1,5 ×2 y 4 px; a dpr 2,625, resolución 1,3125 ×2',
      casi(a.fisicos, 4) && casi(a.perdida, 0.0625) && casi(d.fisicos, 3) && d.perdida < 0 && casi(b.fisicos, 4) && b.dprInt === 1.5 && casi(b.k, 2) && e.dprInt === 1.3125 && casi(e.k, 2), { a, b, d, e });
    t('resolución interna: hasta 1,5 la de la pantalla; con más, dpr / ceil(dpr / 1,5): 2 -> 1, 2,625 -> 1,3125, 3 -> 1,5, 1,75 -> 0,875',
      E.dprInterno(1) === 1 && E.dprInterno(1.25) === 1.25 && E.dprInterno(1.5) === 1.5 && E.dprInterno(2) === 1 && E.dprInterno(2.625) === 1.3125 && E.dprInterno(3) === 1.5 && E.dprInterno(1.75) === 0.875);
  } catch (e) { t('píxel nítido (tabla)', false, String(e && e.stack || e)); }
  try {
    // game.js resize() con camera.js reales: el lienzo y la cámara, con y sin el ajuste.
    const m = rd('js/game.js').match(/  function resize\(\) \{[\s\S]*?\r?\n  \}\r?\n/);
    if (!m) throw new Error('no encuentro resize() en js/game.js');
    const prueba = (w, h, d, ajustes) => {
      const c = nuevo({ dpr: d, ajustes, ficheros: ['js/ui/encuadre.js'] });
      const cv = { style: {}, get clientWidth() { return this.style.width ? Math.round(parseFloat(this.style.width)) : w; }, get clientHeight() { return this.style.height ? Math.round(parseFloat(this.style.height)) : h; } };
      c.__cv = cv;
      vm.runInContext('var cv = __cv, dpr = 1, w = 0, h = 0; function checkOrientation() {}\n' + m[0] + 'resize();', c, { filename: 'js/game.js (resize)' });
      return { cam: c.G.Camera, cv };
    };
    const res = [];
    for (const [w, h, d] of [[1440, 900, 1], [844, 390, 3], [844, 390, 2.625], [845, 391, 3], [784, 724, 3]]) {
      const on = prueba(w, h, d, {}), off = prueba(w, h, d, { pixelNitido: false });
      const fis = 2 * on.cam.scale * d, ancho = parseFloat(on.cv.style.width), k = d / on.cam.dpr;
      res.push({ vp: `${w}x${h}@${d}`, fis, k, lienzo: on.cv.width, css: ancho, exacto: casi(on.cv.width * k, ancho * d, 1e-6),
        apagado: off.cam.scale === Math.min(w / 768, h / 420) && off.cam.dpr === Math.min(1.5, d) && !off.cv.style.width });
    }
    t('game.js resize() y camera.js reales: con píxel nítido (por defecto), el píxel de arte en px físicos enteros y el lienzo con un tamaño CSS que el navegador amplía exactamente ×k (844 a 2,625: 1108 px en 844,19 CSS); apagado, como upstream (escala min(w/768, h/420) y resolución min(1,5, dpr))',
      res.every(x => casi(x.fis, Math.round(x.fis)) && casi(x.k, Math.round(x.k)) && x.exacto && x.apagado), res);
  } catch (e) { t('píxel nítido (game.js y camera.js)', false, String(e && e.stack || e)); }

  // ---- B. Encuadre: tu Pokémon en el centro de la zona libre (HUD Dex compacto) ----
  try {
    const caso = ({ variante = 'compacto', dex = true, estado = 'playing', mods = {} } = {}) => {
      const c = nuevo({ mods, ficheros: ['js/ui/encuadre.js'] }), G = c.G;
      G.Game = { state: estado, player: {} };
      G.Estilo = { dex, hudDex: () => dex };
      // 844x390: dos filas arriba (74 px) y la columna de ataques a la derecha (62 px).
      G.HudDex = { bandas: () => ({ variante, sup: 74, inf: 0, izq: 0, der: 62, juego: { x: 0, y: 0, w: 844, h: 390 }, zona: { x: 0, y: 74, w: 782, h: 316 } }) };
      G.Camera.resize(844, 390, 1);
      G.Camera.x = 0; G.Camera.y = 0;
      const s = G.Camera.scale;
      for (let i = 0; i < 24; i++) G.Camera.follow(0, 0, 1 / 60);   // 0,4 s
      const a400 = [G.Camera.x * s, G.Camera.y * s];
      for (let i = 0; i < 240; i++) G.Camera.follow(0, 0, 1 / 60);
      // Tu Pokémon (en 0,0) en la pantalla: (0 − left) · escala.
      return { s, a400, pantalla: [(0 - G.Camera.left()) * s, (0 - G.Camera.top()) * s] };
    };
    const comp = caso(), esc = caso({ variante: 'escritorio' }), clas = caso({ dex: false }), menu = caso({ estado: 'ui' }), sin = caso({ mods: { encuadreMovil: false } });
    const centro = [782 / 2, 74 + 316 / 2];
    t('encuadre: con el HUD Dex compacto (844x390, filas de 74 px arriba y columna de 62 a la derecha), tu Pokémon acaba en el centro de la zona libre (391, 232) ±1 px y a los 400 ms ya ha hecho el 80 % del camino; con el HUD de escritorio, con Clásico, en los menús o con encuadreMovil = false, en el centro de la pantalla',
      Math.abs(comp.pantalla[0] - centro[0]) <= 1 && Math.abs(comp.pantalla[1] - centro[1]) <= 1 && comp.a400[0] >= 0.8 * 31 &&
      [esc, clas, menu, sin].every(x => Math.abs(x.pantalla[0] - 422) <= 0.5 && Math.abs(x.pantalla[1] - 195) <= 0.5), { comp, esc: esc.pantalla, clas: clas.pantalla, menu: menu.pantalla, sin: sin.pantalla });
  } catch (e) { t('encuadre', false, String(e && e.stack || e)); }

  // ---- C. Iris: cuándo salta ----
  try {
    // `mundo` es G.MODS.mundoDex: false en los casos de siempre (el iris, sólo con el estilo Dex); con true (el juego), también con Clásico.
    const caso = ({ dex = true, calma = false, mundo = false } = {}) => {
      const c = nuevo({ ajustes: calma ? { calm: true } : {}, ficheros: ['js/ui/transicion.js'] }), G = c.G, R = c.__reloj;
      const juego = { inArena: false, arena: null, st: { time: 0 } };
      G.Estilo = { dex };
      G.MODS.mundoDex = mundo;
      G.Game = { get st() { return juego.st; }, state: 'playing' };
      G.Rift = { get inArena() { return juego.inArena; }, get arena() { return juego.arena; } };
      G.Camera.resize(1440, 900, 1); G.Camera.x = 0; G.Camera.y = 0;
      const pl = { x: 0, y: 0, bodyH: 30 }, ctx = new LienzoFalso();
      const log = [];
      const paso = (ms = 16, n = 1) => { for (let i = 0; i < n; i++) { R.t += ms; juego.st.time += ms / 1000; ctx.ops.length = 0; G.Transicion.dibujar(ctx, 1440, 900, pl); log.push(G.Transicion.fase); } };
      return { G, R, juego, pl, ctx, log, paso, apertura: () => G.Transicion.apertura(R.t / 1000) };
    };
    const S = caso();
    S.paso(16); const alEmpezar = { fase: S.G.Transicion.fase, a: S.apertura() };
    S.paso(16, 20); const abierto = S.G.Transicion.fase;
    S.juego.st.time += 240; S.paso(16, 30); const bioma = S.log.slice(-30).every(f => f === null);   // pasa un cambio de bioma (sólo el reloj)
    S.G.Game.state = 'paused'; S.paso(16, 30); S.G.Game.state = 'playing'; S.paso(16, 10); const pausa = S.log.slice(-40).every(f => f === null);
    S.juego.inArena = true; S.juego.arena = { phase: 'fight', endT: 0 }; S.paso(16);
    const entrada = { fase: S.G.Transicion.fase, a: S.apertura(), negro: S.ctx.ops.some(o => o.op === 'fill' && o.x <= 0 && o.y <= 0 && o.x2 >= 1440 && o.y2 >= 900) };
    S.paso(16, 25); const abiertaArena = S.G.Transicion.fase;
    S.juego.arena = { phase: 'won', endT: 5 };
    let cierre = null;
    for (let i = 0; i < 400 && S.juego.inArena; i++) {
      S.juego.arena.endT -= 0.016; S.paso(16);
      if (cierre === null && S.G.Transicion.fase === 'cerrando') cierre = +S.juego.arena.endT.toFixed(3);
      if (S.juego.arena.endT <= 0) S.juego.inArena = false;
    }
    S.paso(16);   // el fotograma de la vuelta
    // Negro desde que se cerró hasta que empieza a abrirse (el fotograma de la vuelta, aún negro).
    const iniNegro = S.log.indexOf('negro'), finNegro = S.log.indexOf('abriendo', iniNegro);
    const vuelta = { cierre, negroMs: (finNegro - iniNegro) * 16, fase: S.G.Transicion.fase, a: S.apertura() };
    // El invitado: vuelve ('af') antes de cerrarse: negro al instante y se abre.
    const I = caso(); I.paso(16, 30); I.juego.inArena = true; I.juego.arena = { phase: 'fight', endT: 0 }; I.paso(16, 30); I.juego.arena = { phase: 'won', endT: 2 }; I.paso(16);
    I.juego.inArena = false; I.paso(16); const invitado = { fase: I.G.Transicion.fase, a: I.apertura() };
    const C = caso({ dex: false }); C.paso(16, 5); C.juego.inArena = true; C.paso(16, 5); const clasico = C.log.every(f => f === null) && !C.ctx.ops.length;
    const CM = caso({ dex: false, mundo: true }); CM.paso(16, 5); const clasicoMundo = CM.log[0] === 'abriendo';
    const M = caso({ calma: true }); M.paso(16); M.paso(16, 10); const fundido = M.G.Transicion.fase;   // 150 ms: ya abierto a los 176
    // Un diálogo en la arena durante la espera (cambiar de objeto: estado 'choice', la cuenta atrás se para): se abre y no
    // vuelve a cerrarse en bucle (fallo visto en estilo-e2e: cerraba y abría cada 0,8 s detrás del diálogo).
    const D = caso(); D.paso(16, 30); D.juego.inArena = true; D.juego.arena = { phase: 'fight', endT: 0 }; D.paso(16, 30); D.juego.arena = { phase: 'won', endT: 0.25 }; D.paso(16, 5);
    const cerrandoAntes = D.G.Transicion.fase;
    D.G.Game.state = 'choice'; D.paso(16, 150);
    const tramos = D.log.slice(-150).filter((f, i, a) => f === 'cerrando' && a[i - 1] !== 'cerrando').length;
    const dialogo = { cerrandoAntes, tramos, fin: D.G.Transicion.fase };
    t('iris (sólo Dex): salta al empezar (negro y se abre en 280 ms), al entrar en la arena (el fotograma del tirón, negro) y al salir (se cierra con endT ≤ 0,3 s, 80 ms o más de negro y se abre); no en el cambio de bioma ni al volver de la pausa; el invitado que vuelve antes de cerrarse, negro al instante; un diálogo durante la espera lo abre y no se vuelve a cerrar en bucle; con Clásico, nada si mundoDex = false y lo mismo que con Dex con mundoDex (el juego); con «Menos sacudidas», fundidos de 150 ms',
      alEmpezar.fase === 'abriendo' && alEmpezar.a < 0.1 && abierto === null && bioma && pausa && entrada.fase === 'abriendo' && entrada.a < 0.1 && entrada.negro &&
      abiertaArena === null && vuelta.cierre <= 0.3 && vuelta.cierre > 0.26 && vuelta.negroMs >= 80 && vuelta.fase === 'abriendo' && vuelta.a < 0.1 &&
      invitado.fase === 'abriendo' && invitado.a < 0.1 && clasico && clasicoMundo && fundido === null && dialogo.cerrandoAntes === 'cerrando' && dialogo.tramos === 0 && dialogo.fin === null,
      { alEmpezar, abierto, bioma, pausa, entrada, abiertaArena, vuelta, invitado, clasico, clasicoMundo, fundido, dialogo });
  } catch (e) { t('iris', false, String(e && e.stack || e)); }

  // ---- D. Golpe final: 140 ms quieto sólo en solitario con jefe o legendario ----
  try {
    const caso = ({ coop = false, host = false, remota = false, jefe = true, legend = false, caido = false, calma = false, reducido = false } = {}) => {
      const c = nuevo({ ajustes: calma ? { calm: true } : {}, ficheros: ['js/ui/golpe-final.js'] }), G = c.G, R = c.__reloj;
      if (reducido) c.matchMedia = q => ({ matches: /reduced-motion/.test(q) });
      G.Coop = { active: coop, isHost: host };
      G.Game = { player: { x: 0, y: 0, dead: caido } };
      const e = { x: 30, y: 40, boss: jefe, legend, remote: remota, flash: 0 };
      const hay = G.GolpeFinal.derrotado(e);
      let quieto = 0, blanco = 0;
      const t0 = R.t;
      if (e.flash > 0) blanco++;   // el fotograma en que cae
      while (R.t - t0 < 400) { const q = G.GolpeFinal.congelar(); if (q) quieto = R.t + 8 - t0; if (e.flash > 0) blanco++; R.t += 8; }
      // La sacudida, tras la congelación: la cámara de verdad (follow).
      G.Camera.resize(1440, 900, 1);
      const sx = [];
      for (let i = 0; i < 30; i++) { G.Camera.follow(0, 0, 1 / 60); sx.push([G.Camera._sx, G.Camera._sy]); }
      return { hay, quieto, blanco, sx };
    };
    const solo = caso(), leg = caso({ jefe: false, legend: true }), normal = caso({ jefe: false }), host = caso({ coop: true, host: true }), inv = caso({ coop: true, remota: true }),
      remota = caso({ remota: true }), caido = caso({ caido: true }), calma = caso({ calma: true }), red = caso({ reducido: true });
    const amp = v => Math.max(...v.sx.map(p => Math.hypot(p[0], p[1])));
    // Dirección: de tu Pokémon (0, 0) al derrotado (30, 40), es decir (0,6; 0,8).
    const dir = solo.sx.filter(p => Math.hypot(p[0], p[1]) > 0.5).every(p => casi(p[0] * 0.8, p[1] * 0.6, 1e-6));
    t('golpe final: sólo en solitario con un jefe o el legendario, el juego quieto 140 ms (± 8, en tiempo real), el derrotado blanco 2 fotogramas y una sacudida amortiguada (hasta 4 px de mundo, de tu Pokémon hacia él); nada con un enemigo normal, en grupo (anfitrión o invitado), con una copia de la red ni con tu Pokémon caído; «Menos sacudidas», ×0,25 y sin destello; movimiento reducido, sin sacudida',
      solo.hay && Math.abs(solo.quieto - 140) <= 8 && solo.blanco === 2 && amp(solo) > 2 && amp(solo) <= 4 && dir && leg.hay && Math.abs(leg.quieto - 140) <= 8 &&
      [normal, host, inv, remota, caido].every(x => !x.hay && x.quieto === 0 && x.blanco === 0 && amp(x) < 1e-9) &&
      calma.hay && calma.blanco === 0 && amp(calma) > 0 && amp(calma) <= 1.01 && red.hay && amp(red) < 1e-9 && red.blanco === 2,
      { solo: [solo.hay, solo.quieto, solo.blanco, amp(solo), dir], leg: [leg.hay, leg.quieto], normal: normal.hay, host: host.hay, inv: inv.hay, remota: remota.hay, caido: caido.hay,
        calma: [calma.blanco, amp(calma)], red: [red.blanco, amp(red)] });
  } catch (e) { t('golpe final', false, String(e && e.stack || e)); }

  // ---- E. Rótulo de zona (HUD Dex): al empezar la partida y, en la arena, con su tipo ----
  try {
    const H = cargarHud({ w: 1440, h: 900 }), { G, juego } = H, A = G.HudDex.Avisos;
    let tt = 10;
    tt += 0.016; A.actualizar(tt, { time: 0.1 }, false);
    const inicio = !!(A.visible && A.visible.tipo === 'zona' && A.visible.texto === 'Bosque Umbrío');
    for (let i = 0; i < 400; i++) { tt += 0.016; A.actualizar(tt, { time: 0.1 + i * 0.016 }, false); }
    const pista = !!(A.visible && A.visible.tipo === 'pista');
    // En la arena: «Has entrado en la grieta…» con el tipo de la arena -> dos líneas en escritorio.
    juego.bioma = 'Grieta · Volcán Ígneo';
    G.Rift = { get rift() { return null; }, get inArena() { return true; }, get timeLeft() { return 40; }, arena: { type: 'fire' } };
    juego.banner = { text: 'Has entrado en la grieta…', t: 2.4 };
    let ctx = null;
    for (let i = 0; i < 40; i++) ctx = H.pintar();   // la pista de controles sale (0,4 s) y entra el rótulo
    const v = A.visible, B = G.HudDex.bandas(), P = B.piezas.aviso, E = G.MARCA.hud.escritorio.aviso;
    const textos = ctx.ops.filter(o => o.op === 'texto').map(o => o.texto);
    t('rótulo de zona (Dex): al empezar la partida, el bioma por la ranura de avisos («Bosque Umbrío») y después la pista de controles; al entrar en una arena, en escritorio, su nombre y «Grieta de tipo Fuego» en dos líneas',
      inicio && pista && v && v.tipo === 'zona' && v.titulo === 'Volcán Ígneo' && v.sub === 'Grieta de tipo Fuego' && P && P.h === Math.round(E.grieta.h * B.escala) &&
      textos.includes('Volcán Ígneo') && textos.includes('Grieta de tipo Fuego'), { inicio, pista, v, P, textos: textos.slice(0, 12) });
  } catch (e) { t('rótulo de zona', false, String(e && e.stack || e)); }
  // E2. Con rift.js, weather.js y say()/banner() de spawner.js de verdad (verificación del 13-10-2026: en solitario,
  // start() dice «Has entrado en la grieta…» y, en la misma llamada, «¡X te esperaba en la grieta!», y el rótulo no salía).
  try {
    const arenaReal = ({ invitado = false } = {}) => {
      const H = cargarHud({ w: 1440, h: 900 }), { G, juego, c } = H, A = G.HudDex.Avisos;
      const sp = rd('js/systems/spawner.js');
      const trozo = re => { const m = sp.match(re); if (!m) throw new Error('no encuentro ' + re + ' en js/systems/spawner.js'); return m[0]; };
      const fSay = trozo(/  function say\(text, secs = 2\.6, local = false\) \{[\s\S]*?\r?\n  \}\r?\n/), fBan = trozo(/  function banner\(\) \{[^\n]*\r?\n/),
        fTick = trozo(/  function tickBanner\(dt\) \{[^\n]*\r?\n/);
      vm.runInContext(`G.Spawner = (() => { let announce = '', announceT = 0;\n${fSay}${fBan}${fTick} return { say, banner, tickBanner }; })();`, c, { filename: 'js/systems/spawner.js (say y banner)' });
      const nop = () => {};
      if (invitado) juego.mates = [mateFalso('Ana', '#7fd3ff', 40, 0)];
      Object.assign(G, {
        Tiles: { T: 16, arenaBiome: () => 4, ARENA_THEMES: { fire: { weather: 'sun' } } },
        Projectiles: { clear: nop }, Combat: { clearFields: nop }, Hazards: { clear: nop }, Guard: { flag: nop }, FX: { ring: nop, dmgText: nop, px: nop },
        DEX: [{ dex: 643, name: 'Reshiram', leg: true, types: ['dragon', 'fire'], spd: 90 }], SPRITE_META: { 643: {} },
        Enemy: class { constructor(def, x, y, sc, boss) { Object.assign(this, { id: 77, name: def.name, dex: def.dex, types: ['dragon', 'fire'], x, y, boss, dead: false, bodyH: 60, shiny: false, maxHp: def.hp, hp: def.hp }); } makeShiny() {} }
      });
      G.DEX_BY[643] = G.DEX[0];
      Object.assign(G.Sprites, { hasShiny: () => false });
      Object.assign(G.World, { isFree: () => true, setArena: nop, setBiome: () => { juego.bioma = 'Grieta · Volcán Ígneo'; }, biome: 0 });
      Object.assign(G.EnemyMgr, { stash: nop, restore: nop, clearRemote: nop, add: e => juego.jefes.push(e), get: id => juego.jefes.find(e => e.id === id) });
      Object.assign(G.Camera, { kick: nop });
      Object.assign(G.Game, { player: H.pl, everyone: () => [H.pl], flash: nop });
      Object.assign(G.Coop, { scaleHp: () => 1, broadcast: nop, say: nop, toHost: nop });
      vm.runInContext(rd('js/systems/weather.js'), c, { filename: 'js/systems/weather.js' });
      vm.runInContext(rd('js/systems/rift.js'), c, { filename: 'js/systems/rift.js' });
      const vistos = [], paso = () => { G.Spawner.tickBanner(0.016); H.pintar(); const v = A.visible; if (v && !v.saliendo && (!vistos.length || vistos[vistos.length - 1].texto !== v.texto)) vistos.push({ tipo: v.tipo, texto: v.texto, titulo: v.titulo, sub: v.sub }); };
      G.Spawner.say('— Bosque Umbrío —', 3);   // un aviso del mapa a la vista al entrar: se corta
      for (let i = 0; i < 20; i++) paso();
      if (invitado) G.Rift.onEvent(['arena', { tx: 5000, ty: 5000, r: 11, dex: 643, shiny: false, type: 'fire' }]);
      else G.Rift.debugArena('fire');
      for (let i = 0; i < 600; i++) paso();
      return { vistos };
    };
    const solo = arenaReal(), inv = arenaReal({ invitado: true });
    const i0 = solo.vistos.findIndex(v => v.texto === 'Grieta · Volcán Ígneo'), tras = solo.vistos.slice(i0);
    const zonas = x => x.vistos.filter(v => v.tipo === 'zona' && v.texto === 'Grieta · Volcán Ígneo').length;
    t('rótulo de zona con rift.js real: en solitario (start() dice «Has entrado en la grieta…» y «¡Reshiram te esperaba en la grieta!» en la misma llamada) sale el de la arena, «Volcán Ígneo» y «Grieta de tipo Fuego», justo al entrar (corta el aviso del mapa) y después el del legendario; de invitado (sólo begin()), una vez',
      i0 === 1 && tras.length >= 2 && tras[0].titulo === 'Volcán Ígneo' && tras[0].sub === 'Grieta de tipo Fuego' && tras[1].texto === '¡Reshiram te esperaba en la grieta!' &&
      zonas(solo) === 1 && zonas(inv) === 1, { solo: solo.vistos, invitado: inv.vistos });
  } catch (e) { t('rótulo de zona con rift.js real', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`ajustes de juego: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`ajustes de juego: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 18. pantalla dividida estilo Nintendo DS (lote 5) ----------------
function divididaChecks() {
  console.log('18. Pantalla dividida estilo Nintendo DS (js/ui/pantalla-dividida.js): reparto, postura, panel, HUD y toques');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const solapan = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  /** pantalla-dividida.js con settings.js, mods.js, marca.js, estilo.js, touch.js y camera.js reales; un documento de mentira
   *  que guarda los manejadores del lienzo del panel (para tocarlo) y su contexto (un LienzoFalso). */
  const nuevo = ({ ajustes = {}, w = 784, h = 724, dpr = 3, estilo = 'clasico', tactil = true } = {}) => {
    const almacen = { 'ps.settings': JSON.stringify(Object.assign({ estilo }, ajustes)) };
    const lienzos = [];
    const elemento = () => ({ style: {}, classList: { toggle() {}, contains: () => false }, setAttribute() {}, insertAdjacentElement() {}, appendChild() {},
      _m: {}, addEventListener(tipo, fn) { this._m[tipo] = fn; }, getContext() { return this._ctx || (this._ctx = new LienzoFalso()); }, setPointerCapture() {} });
    const c = {
      console, innerWidth: w, innerHeight: h, devicePixelRatio: dpr, performance: { now: () => 1000 }, matchMedia: () => ({ matches: false }), navigator: {},
      localStorage: { getItem: k => (k in almacen ? almacen[k] : null), setItem: (k, v) => { almacen[k] = String(v); } }, location: { protocol: 'file:' },
      __eventos: [], dispatchEvent(e) { c.__eventos.push(e.type); }, Event: function (tipo) { this.type = tipo; }
    };
    c.document = { documentElement: { classList: { toggle() {}, contains: () => false }, style: { setProperty() {} } }, body: null,
      getElementById: id => (id === 'game' ? (c.__juego = c.__juego || elemento()) : null), querySelector: () => null,
      createElement: () => { const e = elemento(); lienzos.push(e); return e; }, addEventListener() {}, fonts: null };
    c.window = c; c.G = {}; c.__lienzos = lienzos;
    vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js', 'js/core/settings.js', 'js/ui/estilo.js', 'js/core/camera.js']) vm.runInContext(rd(f), c, { filename: f });
    vm.runInContext(rd('js/core/touch.js'), c, { filename: 'js/core/touch.js' });
    vm.runInContext(rd('js/ui/pantalla-dividida.js'), c, { filename: 'js/ui/pantalla-dividida.js' });
    const G = c.G;
    G.Estilo.zonasSeguras = () => ({ sup: 0, der: 0, inf: 0, izq: 0 });
    Object.defineProperty(G.Touch, 'active', { get: () => tactil, configurable: true });
    const mov = id => [{ id, type: 'fire', name: id, lvl: 1, t: 0, cd: 1, kind: 'shot', def: { maxLvl: 5 } }];
    const pl = { x: 0, y: 0, slots: [mov('a'), mov('b'), mov('c'), mov('d')], active: 0, setActive(i) { this.active = i; }, level: 7, hp: 50, maxHp: 80, xp: 3, xpNext: 10, mon: { name: 'Pikachu' }, bonds: 1, item: null, dead: false };
    G.Game = { state: 'playing', player: pl, pausas: 0, togglePause() { this.pausas++; } };
    G.Icons = { draw() {} };
    return { c, G, pl, panel: () => lienzos.find(e => e._m.pointerdown) };
  };

  // ---- A. El reparto (puro): modos, bisagra (Viewport Segments), máscara, mitad exacta y postura ----
  try {
    const { G } = nuevo(), D = G.Dividida;
    const seg = (x, y, w, h) => ({ x, y, w, h });
    const mesa = [seg(0, 0, 784, 362), seg(0, 362, 784, 362)], mascara = [seg(0, 0, 784, 352), seg(0, 372, 784, 352)], libro = [seg(0, 0, 362, 784), seg(362, 0, 362, 784)];
    const c = {
      no: D.reparto(784, 724, 'no', 'derecha', {}),
      abajo: D.reparto(784, 724, 'abajo', 'derecha', {}),
      abajoMesa: D.reparto(784, 724, 'abajo', 'derecha', { postura: 'folded', segmentos: mesa }),
      abajoMascara: D.reparto(784, 724, 'abajo', 'derecha', { postura: 'folded', segmentos: mascara }),
      abajoLibro: D.reparto(724, 784, 'abajo', 'derecha', { postura: 'folded', segmentos: libro }),
      abajoSupuesto: D.reparto(724, 784, 'abajo', 'derecha', { pliegue: { eje: 'x', pos: 362, ancho: 24 } }),
      ladoDer: D.reparto(1440, 900, 'lado', 'derecha', {}), ladoIzq: D.reparto(1440, 900, 'lado', 'izquierda', {}),
      ladoLibro: D.reparto(724, 784, 'lado', 'izquierda', { postura: 'folded', segmentos: libro }),
      ladoMesa: D.reparto(784, 724, 'lado', 'derecha', { postura: 'folded', segmentos: mesa }),
      autoPlano: D.reparto(784, 724, 'auto', 'derecha', { postura: 'continuous', segmentos: [seg(0, 0, 784, 724)] }),
      autoSinApi: D.reparto(784, 724, 'auto', 'derecha', { postura: null, segmentos: null }),
      autoMesa: D.reparto(784, 724, 'auto', 'derecha', { postura: 'folded', segmentos: mesa }),
      autoLibro: D.reparto(724, 784, 'auto', 'derecha', { postura: 'folded', segmentos: libro }),
      d2625: D.reparto(723, 701, 'abajo', 'derecha', { dpr: 2.625 })
    };
    const R = (o, x, y, w, h) => o && o.x === x && o.y === y && o.w === w && o.h === h;
    t('reparto: desactivada, nada; «abajo» a 784x724, juego 784x362 arriba y mandos abajo (la mitad exacta); con la bisagra de Viewport Segments, justo en ella (y con una máscara de 20 px, fuera de las dos mitades); «a un lado», mitad y mitad (mandos a la derecha o a la izquierda); con la bisagra vertical (libro), en ella; una bisagra que cruza las dos mitades se pasa al panel para que la esquive (también la supuesta sin postura); la automática, sólo plegado en modo mesa (ni plano, ni sin la API, ni en libro); con dpr 2,625, la división en px físicos enteros',
      c.no === null && R(c.abajo.juego, 0, 0, 784, 362) && R(c.abajo.controles, 0, 362, 784, 362) && c.abajo.costura === 'sup' && c.abajo.fuente === 'mitad' &&
      R(c.abajoMesa.juego, 0, 0, 784, 362) && R(c.abajoMesa.controles, 0, 362, 784, 362) && c.abajoMesa.fuente === 'bisagra' && c.abajoMesa.bisagra === null &&
      R(c.abajoMascara.juego, 0, 0, 784, 352) && R(c.abajoMascara.controles, 0, 372, 784, 352) && R(c.abajoMascara.bisagra, 0, 352, 784, 20) &&
      R(c.abajoLibro.juego, 0, 0, 724, 392) && c.abajoLibro.pliegue && c.abajoLibro.pliegue.eje === 'x' && c.abajoLibro.pliegue.pos === 362 &&
      c.abajoSupuesto.pliegue && c.abajoSupuesto.pliegue.pos === 362 &&
      R(c.ladoDer.juego, 0, 0, 720, 900) && R(c.ladoDer.controles, 720, 0, 720, 900) && c.ladoDer.costura === 'izq' && R(c.ladoIzq.juego, 720, 0, 720, 900) && R(c.ladoIzq.controles, 0, 0, 720, 900) && c.ladoIzq.costura === 'der' &&
      R(c.ladoLibro.juego, 362, 0, 362, 784) && R(c.ladoLibro.controles, 0, 0, 362, 784) && c.ladoLibro.fuente === 'bisagra' &&
      c.ladoMesa.pliegue && c.ladoMesa.pliegue.eje === 'y' && c.ladoMesa.pliegue.pos === 362 &&
      c.autoPlano === null && c.autoSinApi === null && R(c.autoMesa.juego, 0, 0, 784, 362) && c.autoMesa.fuente === 'bisagra' && c.autoLibro === null &&
      Number.isInteger(c.d2625.juego.h * 2.625) && Math.abs(c.d2625.juego.h - 350.5) <= 4, c);
  } catch (e) { t('reparto', false, String(e && e.stack || e)); }

  // ---- B. El panel: todo dentro, sin solapes, ≥ 44 px de toque y nada junto a la división ni sobre el pliegue ----
  try {
    const { G } = nuevo(), D = G.Dividida, mg = G.MODS.divididaMargenBisagra;
    const casos = [
      { n: 'mesa 784x362', w: 784, h: 362, op: { costura: 'sup' } },
      { n: 'vertical 724x392 con el pliegue en 362', w: 724, h: 392, op: { costura: 'sup', pliegue: { eje: 'x', pos: 362, ancho: 24 } } },
      { n: 'a la derecha 392x724 con el pliegue en 362', w: 392, h: 724, op: { costura: 'izq', pliegue: { eje: 'y', pos: 362, ancho: 0 } } },
      { n: 'libro 362x784', w: 362, h: 784, op: { costura: 'der' } },
      { n: 'escritorio 1440x450', w: 1440, h: 450, op: { costura: 'sup' } },
      { n: 'escritorio 720x900', w: 720, h: 900, op: { costura: 'izq' } },
      { n: 'móvil 844x195 con muesca', w: 844, h: 195, op: { costura: 'sup', seguras: { izq: 47, der: 47, inf: 21 } } },
      { n: 'exterior 807x180', w: 807, h: 180, op: { costura: 'sup' } }
    ];
    const mal = [];
    for (const k of casos) {
      const L = D.maquetarPanel(k.w, k.h, Object.assign({ n: 4 }, k.op)), S = L.stick;
      const base = { x: S.cx - S.r, y: S.cy - S.r, w: 2 * S.r, h: 2 * S.r };
      const piezas = [['info', L.info], ['objeto', L.objeto], ['pausa', L.pausa], ...L.ranuras.map((x, i) => ['ataque' + (i + 1), x]), ['joystick', base]];
      const sg = Object.assign({ sup: 0, der: 0, inf: 0, izq: 0 }, k.op.seguras || {});
      const lim = { x0: Math.max(sg.izq, k.op.costura === 'izq' ? mg : 0), y0: Math.max(sg.sup, k.op.costura === 'sup' ? mg : 0),
        x1: k.w - Math.max(sg.der, k.op.costura === 'der' ? mg : 0), y1: k.h - sg.inf };
      for (const [n, p] of piezas) {
        if (p.x < lim.x0 - 0.5 || p.y < lim.y0 - 0.5 || p.x + p.w > lim.x1 + 0.5 || p.y + p.h > lim.y1 + 0.5) mal.push(`${k.n}: ${n} fuera (${JSON.stringify(p)})`);
        const pg = k.op.pliegue;
        if (pg) { const a = pg.pos - pg.ancho / 2 - mg + 0.5, b = pg.pos + pg.ancho / 2 + mg - 0.5; if (pg.eje === 'x' ? p.x < b && p.x + p.w > a : p.y < b && p.y + p.h > a) mal.push(`${k.n}: ${n} sobre el pliegue`); }
      }
      for (let i = 0; i < piezas.length; i++) for (let j = i + 1; j < piezas.length; j++) if (solapan(piezas[i][1], piezas[j][1])) mal.push(`${k.n}: ${piezas[i][0]} y ${piezas[j][0]} se pisan`);
      if (L.lado < 44 || L.pausa.w < 44 || S.r < 44) mal.push(`${k.n}: toque pequeño (ataques ${L.lado}, pausa ${L.pausa.w}, joystick ${S.r})`);
    }
    t(`panel de mandos en ${casos.length} tamaños (el Magic V6 en mesa, en vertical con el pliegue cruzando, a un lado, en libro; escritorio; móvil con muesca; la exterior): todo dentro, sin solapes, ataques, pausa y joystick de 44 px o más, nada a menos de ${mg} px de la división y nada sobre el pliegue que lo cruza`,
      !mal.length, mal.slice(0, 8));
  } catch (e) { t('panel', false, String(e && e.stack || e)); }

  // ---- C. En partida: el lienzo del juego en su rectángulo, el HUD Dex (también con Clásico), los toques y el teclado ----
  try {
    const { c, G, pl, panel } = nuevo({ ajustes: { dividida: 'abajo' }, w: 784, h: 724 });
    const D = G.Dividida;
    const antes = { hudDex: G.Estilo.hudDex(), rect: D.rectJuego() };
    D.recolocar();
    const activo = D.activa(), hudDexDentro = G.Estilo.hudDex(), juegoCv = c.__juego && Object.assign({}, c.__juego.style);
    const P = panel(), K = activo && activo.controles;
    const ev = (x, y, id = 1) => ({ clientX: x, clientY: y, pointerId: id, preventDefault() {} });
    const B = D.botonesPantalla(), b2 = B.find(b => b.que === 'ataque2'), bp = B.find(b => b.que === 'pausa');
    P._m.pointerdown(ev(b2.x + b2.w / 2, b2.y + b2.h / 2, 2));
    P._m.pointerdown(ev(bp.x + 5, bp.y + 5, 3));
    // El joystick: en su círculo (fijo) y arrastrando a la derecha.
    const S = D.panel.stick, cx = S.cx + K.x, cy = S.cy + K.y;
    const sinDedo = G.Touch.vector();
    P._m.pointerdown(ev(cx, cy, 4)); P._m.pointermove(ev(cx + S.r, cy, 4));
    const v = G.Touch.vector();
    P._m.pointerup(ev(cx + S.r, cy, 4));
    const suelto = G.Touch.vector();
    // Donde tocas (fuera del círculo, dentro de su zona): aparece ahí.
    const Z = S.zona, zx = K.x + Z.x + 4, zy = K.y + Z.y + Z.h - 4;   // una esquina de su zona, lejos del círculo
    P._m.pointerdown(ev(zx, zy, 5)); const libre = D.stick; P._m.pointerup(ev(zx, zy, 5));
    const cambiado = {};
    // En plena partida: a un lado (derecha), sin reiniciar; fuera de partida, la pantalla entera.
    G.Settings.set('dividida', 'lado'); D.recolocar(); cambiado.lado = D.rectJuego();
    G.Game.state = 'ui'; D.recolocar(); cambiado.menu = D.rectJuego(); cambiado.hudDex = G.Estilo.hudDex();
    t('en partida: con «abajo», el lienzo del juego mide 784x362 (G.Encuadre.resolucion lo coloca), el HUD es el Dex también con Clásico, tocar el ataque 2 lo elige, la pausa pausa, el joystick del panel manda en G.Touch.vector() (a la derecha, a toda velocidad; suelto, nada) y aparece donde tocas dentro de su zona; cambiarlo en plena partida recoloca sin reiniciar; en el menú, la pantalla entera y el HUD de su estilo',
      antes.rect === null && !antes.hudDex && activo && activo.juego.w === 784 && activo.juego.h === 362 && hudDexDentro && juegoCv.pointerEvents === 'none' &&
      pl.active === 1 && G.Game.pausas === 1 && sinDedo === null && v && v[0] > 0.99 && Math.abs(v[1]) < 0.01 && suelto === null && libre && !libre.fijo &&
      cambiado.lado && cambiado.lado.w === 392 && cambiado.lado.h === 724 && cambiado.menu === null && cambiado.hudDex === false && c.__eventos.includes('resize'),
      { antes, activo, hudDexDentro, juegoCv, activa: pl.active, pausas: G.Game.pausas, sinDedo, v, suelto, libre, cambiado, eventos: c.__eventos.length });
  } catch (e) { t('en partida', false, String(e && e.stack || e)); }

  // ---- D. El HUD Dex en el rectángulo de juego: sin ranuras, objeto, pausa ni ficha (van en el panel) y lejos de la división ----
  try {
    const res = [];
    for (const [w, h, inf] of [[784, 362, 16], [724, 392, 16], [392, 724, 0]]) {
      const H = cargarHud({ w, h, tactil: true });
      escenaCompleta(H);
      const seguras = { sup: 0, izq: 0, der: inf ? 0 : 16, inf };
      H.G.HudDex.ponerMarco((ww, hh) => ({ juego: { x: 0, y: 0, w: ww, h: hh }, controles: { x: 0, y: hh + 8, w: 8, h: 8, lado: 'abajo', aparte: true }, seguras }));
      H.pintar(); const ctx = H.pintar();
      const B = H.G.HudDex.bandas(), P = B.piezas;
      const fuera = Object.entries(P).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x, i) => [k + i, x]) : [[k, v]])).filter(([, v]) => v && v.w && v.h)
        .filter(([, v]) => v.y + v.h > h - inf + 0.5 || v.x + v.w > w - seguras.der + 0.5).map(([k]) => k);
      const pintado = ctx.ops.filter(o => o.op !== 'texto' || true).filter(o => o.y2 > h - inf + 0.5 && o.alfa > 0).length;
      res.push({ vp: `${w}x${h}`, ficha: !!P.ficha, ranuras: P.ranuras.length, objeto: !!P.objeto, pausa: !!P.pausa, botones: H.botones.length, fuera, pintado, variante: B.variante });
    }
    t('HUD Dex con el panel aparte (ponerMarco con controles.aparte): en el rectángulo de juego no van la ficha, las ranuras, el objeto ni la pausa (ningún toque registrado: van en el panel) y nada se pinta a menos de 16 px de la división (784x362 y 724x392 con el panel debajo, 392x724 con el panel a la derecha)',
      res.every(x => !x.ficha && !x.ranuras && !x.objeto && !x.pausa && !x.botones && !x.fuera.length && !x.pintado), res);
  } catch (e) { t('HUD Dex con el panel aparte', false, String(e && e.stack || e)); }

  // ---- E. Local de cada jugador, el ajuste y el manifiesto ----
  try {
    const src = rd('js/ui/pantalla-dividida.js');
    const red = /G\.(Net|Coop)\.|broadcast|\bsend\(/.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''));
    const { G } = nuevo();
    const porDefecto = G.Dividida.modo();
    const man = JSON.parse(rd('manifest.webmanifest'));
    const M = G.MODS;
    t('local: pantalla-dividida.js no habla con la red (ni G.Net ni G.Coop); por defecto desactivada (divididaPorDefecto = \'no\'); el manifiesto ya no fija la horizontal ("orientation": "any", la pantalla interior del plegable en vertical para «abajo») y «Gira el móvil» sigue sólo en una pantalla estrecha en vertical (390x844, 360x807 y la mitad de 362x784 sí; el Magic V6 abierto, 724x784 y 784x724, no)',
      !red && porDefecto === 'no' && man.orientation === 'any' && M.pedirGiro(390, 844) && M.pedirGiro(360, 807) && !M.pedirGiro(724, 784) && !M.pedirGiro(784, 724) && M.pedirGiro(362, 784),
      { red, porDefecto, orientacion: man.orientation });
  } catch (e) { t('local y manifiesto', false, String(e && e.stack || e)); }

  // ---- E2. La cámara en una franja alta (juego a un lado): el lado largo ve 768 de mundo ----
  try {
    const { c } = nuevo();
    vm.runInContext(rd('js/ui/encuadre.js'), c, { filename: 'js/ui/encuadre.js' });
    const E = c.G.Encuadre, s0 = (w, h) => Math.min(w / 768, h / 420);
    const alta = E.escalaVertical(s0(392, 724), 392, 724, true), sinDividir = E.escalaVertical(s0(724, 784), 724, 784, false), mesa = E.escalaVertical(s0(784, 362), 784, 362, true);
    const k = E.calcular(392, 724, 3);   // sin la regla: 1176 x 2172 de mundo con el píxel nítido
    t('cámara de la pantalla dividida: con el juego en una franja alta (392x724, a un lado) el lado largo ve 768 de mundo (sin la regla, 768 de ANCHO: 768x1418, y con el píxel nítido 1176x2172); en apaisado (784x362) y sin dividir (724x784), la regla de upstream',
      Math.abs(724 / alta - 768) < 1e-6 && sinDividir === s0(724, 784) && mesa === s0(784, 362) && Math.round(392 / k.escala) === 1176, { alta, sinDividir, mesa, sinRegla: 392 / k.escala });
  } catch (e) { t('cámara de la franja alta', false, String(e && e.stack || e)); }

  // ---- E3. El tamaño del mundo en la mitad de juego (verificación del 13-10-2026: Pokémon de 16 px CSS en un móvil) ----
  // Con resize() de game.js, camera.js, encuadre.js y pantalla-dividida.js reales: el reparto aplicado, el lienzo y la escala.
  try {
    const rz = rd('js/game.js').match(/  function resize\(\) \{[\s\S]*?\r?\n  \}\r?\n/);
    if (!rz) throw new Error('no encuentro resize() en js/game.js');
    const medir = (w, h, dpr, md, ajustes = {}) => {
      const { c, G } = nuevo({ w, h, dpr, ajustes: Object.assign({ dividida: md, divididaLado: 'derecha' }, ajustes) });
      vm.runInContext(rd('js/ui/encuadre.js'), c, { filename: 'js/ui/encuadre.js' });
      G.Dividida.recolocar();
      const cv = { style: {}, get clientWidth() { return this.style.width ? Math.round(parseFloat(this.style.width)) : w; }, get clientHeight() { return this.style.height ? Math.round(parseFloat(this.style.height)) : h; } };
      c.__cv = cv;
      vm.runInContext('var cv = __cv, dpr = 1, w = 0, h = 0; function checkOrientation() {}\n' + rz[0] + 'resize();', c, { filename: 'js/game.js (resize)' });
      const s = G.Camera.scale, R = G.Dividida.activa();
      return { vp: `${w}x${h}@${dpr} ${md}`, rect: R ? `${R.juego.w}x${R.juego.h}` : 'entera', escala: +s.toFixed(4), css: 2 * s, fisicos: 2 * s * dpr,
        mundo: `${Math.round(cv.clientWidth / s)}x${Math.round(cv.clientHeight / s)}` };
    };
    const ent = x => Math.abs(x.fisicos - Math.round(x.fisicos)) < 1e-6;
    const movil = [[844, 390, 3, 'abajo'], [844, 390, 3, 'lado'], [780, 360, 3, 'abajo'], [780, 360, 3, 'lado'], [844, 390, 2.625, 'abajo'], [844, 390, 2.625, 'lado'], [1024, 768, 1, 'abajo']].map(v => medir(...v));
    const v6 = { mesa: medir(784, 724, 3, 'abajo'), vertical: medir(724, 784, 3, 'abajo'), lado: medir(784, 724, 3, 'lado'), barra: medir(724, 700, 3, 'abajo') };
    const entera = { m844: medir(844, 390, 3, 'no'), m1024: medir(1024, 768, 1, 'no') };
    const sinNitido = medir(844, 390, 3, 'abajo', { pixelNitido: false });
    t(`pantalla dividida: en un móvil y a 1024x768 los Pokémon no se quedan en puntos: un píxel de arte mide como poco 1,2 px CSS (divididaEscalaMin 0,6) y un número entero de píxeles físicos (${movil.map(x => `${x.vp}: ${x.rect}, ×${x.escala}, ${+x.fisicos.toFixed(2)} px, ${x.mundo}`).join('; ')}; antes, 0,333 en el móvil y 0,5 a 1024x768); el Magic V6 igual (mesa 0,667, en vertical y a un lado 1, con la barra 0,667) y a pantalla entera nada cambia; sin el píxel nítido, el mínimo (0,6)`,
      movil.every(x => x.css >= 1.2 - 1e-9 && ent(x)) && movil.slice(0, 4).every(x => Math.abs(x.escala - 0.6667) < 1e-3) && Math.abs(movil[6].escala - 1) < 1e-9 &&
      Math.abs(v6.mesa.escala - 0.6667) < 1e-3 && v6.vertical.escala === 1 && v6.lado.escala === 1 && Math.abs(v6.barra.escala - 0.6667) < 1e-3 &&
      Math.abs(entera.m844.escala - 0.6667) < 1e-3 && entera.m1024.escala === 1 && Math.abs(sinNitido.escala - 0.6) < 1e-9, { movil, v6, entera, sinNitido });
    const c = nuevo().c;
    vm.runInContext(rd('js/ui/encuadre.js'), c, { filename: 'js/ui/encuadre.js' });
    const E = c.G.Encuadre;
    const tabla = [[844, 195, 3], [422, 390, 3], [780, 180, 3], [390, 360, 3], [1024, 384, 1], [784, 362, 3], [724, 392, 3], [392, 724, 3], [1440, 450, 1], [720, 900, 1], [640, 180, 2], [1280, 400, 2]]
      .map(([w, h, d]) => Object.assign({ vp: `${w}x${h}@${d}` }, E.calcular(w, h, d, { dividida: true })));
    const base = (w, h) => Math.max(E.escalaVertical(Math.min(w / 768, h / 420), w, h, true), 0.6);
    const mal = tabla.filter(x => { const [w, h] = x.vp.split('@')[0].split('x').map(Number); return !(Math.abs(x.fisicos - Math.round(x.fisicos)) < 1e-6) || x.escala < base(w, h) * 0.75 - 1e-9; });
    t('pantalla dividida (calcular con dividida): en 12 mitades de juego, el píxel de arte en px físicos enteros y la escala nunca por debajo del 75 % de la de partida (la regla de upstream, la franja alta y el mínimo de 0,6): divididaEncogeMax',
      !mal.length, mal.length ? mal : tabla.map(x => `${x.vp}: ×${+x.escala.toFixed(3)}`));
  } catch (e) { t('tamaño del mundo en la pantalla dividida', false, String(e && e.stack || e)); }

  // ---- E4. Tu Pokémon, fuera del pliegue que cruza la mitad de juego ----
  try {
    const casos = [];
    for (const [w, h, md, segs, eje] of [[724, 784, 'abajo', [[0, 0, 362, 784], [362, 0, 362, 784]], 'x'], [784, 724, 'lado', [[0, 0, 784, 362], [0, 362, 784, 362]], 'y'], [724, 784, 'abajo', null, 'x']]) {
      const { c, G } = nuevo({ w, h, dpr: 3, ajustes: { dividida: md, divididaLado: 'derecha' } });
      if (segs) { c.navigator.devicePosture = { type: 'folded' }; c.viewport = { segments: segs.map(([x, y, sw, sh]) => ({ x, y, width: sw, height: sh })) }; }
      vm.runInContext(rd('js/ui/encuadre.js'), c, { filename: 'js/ui/encuadre.js' });
      G.Dividida.recolocar();
      const R = G.Dividida.activa(), pg = R && R.pliegue;
      Object.assign(G.Game.player, { r: 14, bodyH: 40 });
      const s = 1, X = R.juego.w / 2, Y = R.juego.h / 2, d = G.Encuadre.apartarDelPliegue(X, Y, s, { x: 0, y: 0, w: R.juego.w, h: R.juego.h });
      const pos = pg ? (pg.eje === 'x' ? pg.pos - R.juego.x : pg.pos - R.juego.y) : null, banda = pg ? (pg.ancho || 0) / 2 + 16 : 0;
      const caja = pg && pg.eje === 'x' ? [X + d[0] - 20, X + d[0] + 20] : [Y + d[1] - 40, Y + d[1] + 6];
      const fuera = pg && (caja[1] <= pos - banda + 1e-6 || caja[0] >= pos + banda - 1e-6);
      c.navigator.devicePosture = { type: 'continuous' };
      const plano = G.Encuadre.apartarDelPliegue(X, Y, s, null);
      casos.push({ vp: `${w}x${h} ${md}${segs ? ' (segmentos)' : ' (supuesto)'}`, eje: pg && pg.eje, esperado: eje, d, fuera, plano, desplaza: Math.hypot(d[0], d[1]) });
    }
    t('pantalla dividida con un pliegue que cruza la mitad de juego (724x784 «abajo» en libro o con el supuesto, 784x724 «a un lado» en mesa): tu Pokémon, con su sprite fuera de la franja de la bisagra y su margen de 16 px, lo justo (≤ 60 px); con el móvil plano, en su sitio',
      casos.every(x => x.eje === x.esperado && x.fuera && x.desplaza <= 60 && x.plano[0] === 0 && x.plano[1] === 0), casos);
    // Por objetivo() del encuadre, con el HUD Dex de verdad: lo que pide la zona libre más lo del pliegue.
    const H = cargarHud({ w: 724, h: 392, tactil: true });
    escenaCompleta(H);
    H.G.HudDex.ponerMarco((ww, hh) => ({ juego: { x: 0, y: 0, w: ww, h: hh }, controles: { x: 0, y: hh + 8, w: 8, h: 8, lado: 'abajo', aparte: true }, seguras: { sup: 0, izq: 0, der: 0, inf: 16 } }));
    H.G.Dividida = { activa: () => ({ juego: { x: 0, y: 0, w: 724, h: 392 }, pliegue: { eje: 'x', pos: 362, ancho: 24 } }), postura: () => null };
    vm.runInContext(rd('js/ui/encuadre.js'), H.c, { filename: 'js/ui/encuadre.js' });
    H.G.Game.player = H.pl; H.pl.r = 14;
    H.pintar(); H.pintar();
    const B = H.G.HudDex.bandas(), o = H.G.Encuadre.objetivo(), x = 362 - o[0] * H.G.Camera.scale;
    t('encuadre con el pliegue (objetivo() con el HUD Dex real, 724x392 con el pliegue en 362): tu Pokémon queda fuera de la franja de 12 + 16 px a cada lado',
      B.variante === 'compacto' && (x + 15 <= 362 - 28 + 1e-6 || x - 15 >= 362 + 28 - 1e-6), { x, objetivo: o, zona: B.zona });
  } catch (e) { t('tu Pokémon fuera del pliegue', false, String(e && e.stack || e)); }

  // ---- E5. La pista de controles y la nota de Ajustes con la pantalla dividida ----
  try {
    const H = cargarHud({ w: 784, h: 362, tactil: true }), A = H.G.HudDex.Avisos;
    H.G.Dividida = { activa: () => ({ juego: { x: 0, y: 0, w: 784, h: 362 } }) };
    A.actualizar(50, { time: 3 }, true);
    const conPanel = A.visible && A.visible.texto;
    H.G.Dividida = { activa: () => null }; A.reiniciar();
    A.actualizar(51, { time: 3 }, true);
    const sinPanel = A.visible && A.visible.texto;
    const notas = {};
    const seg = (x, y, w, h) => ({ x, y, width: w, height: h });
    for (const [k, postura, segs] of [['mesa', 'folded', [seg(0, 0, 784, 362), seg(0, 362, 784, 362)]], ['libro', 'folded', [seg(0, 0, 362, 784), seg(362, 0, 362, 784)]],
      ['plegadoSinBisagra', 'folded', null], ['plano', 'continuous', [seg(0, 0, 784, 724)]]]) {
      const { c, G } = nuevo({ ajustes: { dividida: 'auto' } });
      c.navigator.devicePosture = { type: postura };
      if (segs) c.viewport = { segments: segs };
      notas[k] = G.Dividida.nota();
    }
    t('pantalla dividida: la pista de controles habla del joystick del panel («Mueve con el joystick · …»; sin dividir, «Arrastra el dedo…»); y con la automática, la nota dice cómo está el móvil: plegado en mesa (se divide), en libro (no se divide: «Juego a un lado») o plegado sin saber la bisagra, y abierto sólo si lo está (antes, en libro decía «abierto»)',
      /^Mueve con el joystick/.test(conPanel) && /^Arrastra el dedo/.test(sinPanel) && /Ahora: plegado\.$/.test(notas.mesa) && /Ahora: plegado en libro/.test(notas.libro) && /Juego a un lado/.test(notas.libro) &&
      /Ahora: plegado, pero el navegador no dice/.test(notas.plegadoSinBisagra) && /Ahora: abierto\.$/.test(notas.plano), { conPanel, sinPanel, notas });
  } catch (e) { t('pista y nota de la pantalla dividida', false, String(e && e.stack || e)); }

  // ---- F. Inglés de lo nuevo de los lotes 4 y 5 (i18n.js real) ----
  try {
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {};
    c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    const EN = c.G.I18n.t, { G } = nuevo(), D = G.Dividida;
    const textos = ['Píxel nítido', vm.runInContext('G.Encuadre.TEXTO', (() => { const k = nuevo().c; vm.runInContext(rd('js/ui/encuadre.js'), k); return k; })()),
      'Grieta de tipo Fuego', 'Pantalla dividida', D.TEXTO, ...D.OPCIONES.map(o => o[1]), ...D.OPCIONES_LADO.map(o => o[1]), 'Lado de los mandos'];
    for (const md of ['abajo', 'auto']) { G.Settings.set('dividida', md); textos.push(D.nota()); }
    // Las notas de la automática según la postura (mesa, libro, plegado sin bisagra y plano) y la pista con el panel.
    const seg = (x, y, w, h) => ({ x, y, width: w, height: h });
    for (const [postura, segs] of [['folded', [seg(0, 0, 784, 362), seg(0, 362, 784, 362)]], ['folded', [seg(0, 0, 362, 784), seg(362, 0, 362, 784)]], ['folded', null], ['continuous', null]]) {
      const k = nuevo({ ajustes: { dividida: 'auto' } });
      k.c.navigator.devicePosture = { type: postura };
      if (segs) k.c.viewport = { segments: segs };
      textos.push(k.G.Dividida.nota());
    }
    textos.push('Mueve con el joystick  ·  toca un ataque para cambiarlo', 'Joystick para moverte  ·  toca un ataque', 'Joystick  ·  toca un ataque');
    const sin = textos.filter(s => EN(s) === s || /Ahora|plegado|Mueve|toca/.test(EN(s)));
    t('inglés (i18n.js real) de lo nuevo: «Píxel nítido» y su explicación, «Grieta de tipo Fuego» y la sección «Pantalla dividida» (explicación, opciones, lado y las notas de la automática en mesa, en libro, plegado sin bisagra y plano), y la pista del joystick del panel', !sin.length, sin);
  } catch (e) { t('inglés', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`pantalla dividida: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`pantalla dividida: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 19. sin el test de personalidad: «Elige a tu compañero» ----------------
// Huellas de test.js y starters.js de upstream (sha1 sin CR): la pantalla nueva reutiliza #scr-starters y los datos de
// G.STARTERS. Si upstream los cambia, FALLO: mirar el cambio (git diff ORIG_HEAD..HEAD -- js/ui/test.js js/data/starters.js),
// adaptar js/ui/elegir-companero.js si hace falta y poner aquí la huella nueva.
const HUELLA_TEST = '344ea44331bde1b47e0b443cb819bff70b91ae9a';
const HUELLA_INICIALES = '2051878c97c65f420adf2970c59b8c9babfe0478';
/** Medidas de Chromium (13-10-2026, index.html, G.ElegirCompanero.medidas) en cada pantalla y estilo:
 *  [ancho, alto, dpr, hueco, nombre, tipo1, tipo2, emblemas, relleno, rellenoH, lineaNombre, lineaTipo, lineaTipo2]. */
const MEDIDAS_COMPANERO = {
  '1440x900 clasico': [980, 694, 1, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '1440x900 dex': [1000, 733, 1, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31],
  '1920x1080 clasico': [980, 874, 1, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '1920x1080 dex': [1000, 913, 1, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31],
  '1024x768 clasico': [940, 562, 1, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '1024x768 dex': [960, 601, 1, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31],
  '844x390 clasico': [784, 295, 3, 3, 64, 49, 92, 30, 8, 2, 14, 14, 29], '844x390 dex': [792, 303, 3, 3, 68, 51, 90, 30, 8, 2, 14, 14, 29],
  '780x360 clasico': [720, 265, 3, 3, 64, 49, 92, 30, 8, 2, 14, 14, 29], '780x360 dex': [728, 273, 3, 3, 68, 51, 90, 30, 8, 2, 14, 14, 29],
  '807x360 clasico': [747, 265, 3, 3, 64, 49, 92, 30, 8, 2, 14, 14, 29], '807x360 dex': [755, 273, 3, 3, 68, 51, 90, 30, 8, 2, 14, 14, 29],
  '784x362 clasico': [724, 267, 3, 3, 64, 49, 92, 30, 8, 2, 14, 14, 29], '784x362 dex': [732, 275, 3, 3, 68, 51, 90, 30, 8, 2, 14, 14, 29],
  '784x724 clasico': [700, 518, 3, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '784x724 dex': [720, 551, 3, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31],
  '724x784 clasico': [640, 578, 3, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '724x784 dex': [660, 611, 3, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31],
  '1000x900 clasico': [916, 694, 2.5, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '1000x900 dex': [936, 727, 2.5, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31],
  '900x1000 clasico': [816, 794, 2.5, 5, 83, 55, 103, 30, 12, 8, 16, 15, 31], '900x1000 dex': [836, 827, 2.5, 5, 81, 57, 102, 30, 10, 6, 16, 15, 31]
};
const medidaCompanero = v => ({ ancho: v[0], alto: v[1], n: 29, dpr: v[2], hueco: v[3], nombre: v[4], tipo1: v[5], tipo2: v[6], emblemas: v[7],
  relleno: v[8], rellenoH: v[9], lineaNombre: v[10], lineaTipo: v[11], lineaTipo2: v[12] });
function companeroChecks() {
  console.log('19. Sin el test de personalidad (js/ui/elegir-companero.js): flujo, rejilla, guardado e inglés');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** util.js, mods.js, la Pokédex (con sprites-meta.js), moves.js, starters.js, achievements.js y elegir-companero.js reales en node:vm (sin documento). */
  const nuevo = (mods = {}) => {
    const c = { console };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/moves.js', 'js/data/starters.js', 'js/data/achievements.js', 'js/ui/elegir-companero.js'])
      vm.runInContext(rd(f), c, { filename: f });
    Object.assign(c.G.MODS, mods);
    return c;
  };
  // ---- A. upstream intacto y datos ----
  try {
    const sinCR = f => rd(f).replace(/\r/g, '');
    t('js/ui/test.js y js/data/starters.js, los de upstream sin tocar (huella; ninguna línea MOD nico)',
      sha1(sinCR('js/ui/test.js')) === HUELLA_TEST && sha1(sinCR('js/data/starters.js')) === HUELLA_INICIALES && !/MOD nico/.test(rd('js/ui/test.js') + rd('js/data/starters.js')),
      { test: sha1(sinCR('js/ui/test.js')), iniciales: sha1(sinCR('js/data/starters.js')) });
    const c = nuevo(), G = c.G;
    const ini = G.STARTERS.map(s => ({ dex: s.dex, mon: G.DEX_BY[s.dex], mov: G.Moves.BY_ID[s.start] }));
    t('los 29 iniciales de G.STARTERS están en la Pokédex con nombre y tipos y su movimiento existe, sin repetir (lo que pinta cada celda y la fila de abajo)',
      ini.length === 29 && new Set(ini.map(x => x.dex)).size === 29 && ini.every(x => x.mon && x.mon.name && x.mov && x.mon.types.length >= 1 &&
        x.mon.types.every(ty => G.U.TYPE_NAME[ty] && G.U.TYPE_COLOR[ty])), ini.filter(x => !x.mon || !x.mov).map(x => x.dex));
    t('G.MODS.sinTest es true por defecto y G.ElegirCompanero.activo() lo sigue', G.MODS.sinTest === true && G.ElegirCompanero.activo() && !nuevo({ sinTest: false }).G.ElegirCompanero.activo());
  } catch (e) { t('upstream intacto', false, String(e && e.stack || e)); }

  // ---- B. afterLogin() de game.js, tal cual ----
  try {
    const m = rd('js/game.js').match(/  afterLogin\(\) \{[\s\S]*?\r?\n  \},\r?\n/);
    if (!m) throw new Error('no encuentro afterLogin() en js/game.js');
    const caso = ({ partner = null, mods = {}, sinFichero = false } = {}) => {
      const c = { console }, llamadas = [];
      c.window = c; c.G = {};
      vm.createContext(c);
      for (const f of ['js/core/util.js', 'js/core/mods.js']) vm.runInContext(rd(f), c, { filename: f });
      Object.assign(c.G.MODS, mods);
      Object.assign(c.G, { Audio: { music: x => llamadas.push('música ' + x) }, DB: { save: { partner }, commit: () => llamadas.push('guarda') }, TestUI: { start: () => llamadas.push('test') },
        UI: { toast: (x, ms) => llamadas.push(`aviso ${ms}: ${x}`), refreshCoins() {} }, T: x => x });
      if (!mods.conRegalo) c.G.MODS.regaloBuenHumor = null;   // el regalo, aparte (abajo)
      if (!sinFichero) c.G.ElegirCompanero = { activo: () => !!(c.G.MODS && c.G.MODS.sinTest), abrir: () => llamadas.push('elegir') };
      vm.runInContext('var Flujo = {\n' + m[0] + '  goMenu() { G.__menu = true; }\n};\nFlujo.afterLogin();', c, { filename: 'js/game.js (afterLogin)' });
      if (c.G.__menu) llamadas.push('menú');
      return llamadas.join(', ');
    };
    const conRegalo = caso({ partner: 4, mods: { conRegalo: true } });
    t('afterLogin() real con el regalo «buen humor»: guarda y avisa con su texto 12 s, y luego el menú como siempre',
      conRegalo === 'música village, guarda, aviso 12000: Nico se ha despertado de buen humor. Estos tickets tienen posibilidad de shiny x3. Aquí tenéis algo de oro de regalo para mejorar Pokémons, o probar novedades, menú', conRegalo);
    const casos = { nueva: caso(), conTest: caso({ mods: { sinTest: false } }), conCompanero: caso({ partner: 4 }), sinFichero: caso({ sinFichero: true }), sinAjuste: caso({ mods: { sinTest: undefined } }) };
    t('afterLogin() real: sin compañero, «Elige a tu compañero» (nunca el test); con sinTest = false, el test; con compañero, el menú; si falta elegir-companero.js tras un merge, o el ajuste, el test de upstream',
      casos.nueva === 'música village, elegir' && casos.conTest === 'música village, test' && casos.conCompanero === 'música village, menú' &&
      casos.sinFichero === 'música village, test' && casos.sinAjuste === 'música village, test', casos);
  } catch (e) { t('afterLogin', false, String(e && e.stack || e)); }

  // ---- C. disposicion(): la rejilla con las medidas de verdad ----
  try {
    const E = nuevo().G.ElegirCompanero, D = E.disposicion;
    const mal = [], filas = {};
    for (const [k, v] of Object.entries(MEDIDAS_COMPANERO)) {
      const m = medidaCompanero(v), d = D(m);
      const tipoW = d.modo === 'texto' ? m.tipo2 : d.modo === 'texto2' ? m.tipo1 : m.emblemas;
      const lineaT = d.modo === 'texto2' ? m.lineaTipo2 : m.lineaTipo;
      const bien = d.cabe && Number.isInteger(d.k) && d.k >= 1 && Math.abs(d.a - d.k / m.dpr) < 1e-9 && d.a <= E.A_MAX + 1e-9 && d.a >= E.A_MIN - 1e-9 &&
        d.cols * d.filas >= 29 && d.cols * (d.filas - 1) < 29 && d.altoRejilla <= m.alto + 1e-6 &&
        d.celdaW - m.rellenoH >= Math.max(m.nombre, tipoW) && d.celdaW - m.rellenoH >= E.ANCHO_ARTE * d.a &&
        Math.abs(d.celdaH - (m.relleno + m.lineaNombre + lineaT + E.ALTO_ARTE * d.a)) < 1e-6 && d.cols * d.celdaW + (d.cols - 1) * m.hueco <= m.ancho + 1e-6;
      filas[k] = `${d.cols}x${d.filas} k${d.k} ${d.modo}`;
      if (!bien) mal.push([k, d]);
    }
    t('disposicion() con las medidas de Chromium en 12 pantallas y los dos estilos: los 29 caben sin desplazar, el píxel de arte en px físicos enteros (≤ 2,5 px CSS), nombre, tipos y sprite (24 px de arte de ancho, lo que miden con su sombra) dentro de cada celda',
      !mal.length, mal.length ? mal.slice(0, 3) : filas);
    const movil = ['844x390', '780x360', '807x360', '784x362'].flatMap(p => ['clasico', 'dex'].map(e => D(medidaCompanero(MEDIDAS_COMPANERO[p + ' ' + e]))));
    t('en un móvil en horizontal y en el exterior del Magic V6 (y la mitad de la pantalla dividida, 784x362): 10 columnas y 3 filas, el Pokémon a 4 o 5 px físicos por píxel de arte',
      movil.every(d => d.cols === 10 && d.filas === 3 && d.k >= 4), movil.map(d => `${d.cols}x${d.filas} k${d.k}`));
    const pc = D(medidaCompanero(MEDIDAS_COMPANERO['1440x900 dex']));
    t('en escritorio (1440x900): los tipos con su nombre en una línea y el píxel de arte a 2 px', pc.modo === 'texto' && pc.k === 2, pc);
    // Más sitio nunca da una rejilla peor (barrido de alto a partir del móvil): la nota (el tamaño del Pokémon por el peso de
    // cómo van los tipos) no baja; con el mismo modo, el Pokémon tampoco. Al pasar de emblemas a nombres puede encoger un poco.
    const base = medidaCompanero(MEDIDAS_COMPANERO['844x390 dex']);
    let previo = 0, porModo = {}, baja = null;
    for (let alto = 200; alto <= 900; alto += 7) {
      const d = D(Object.assign({}, base, { alto })), nota = d.cabe ? d.nota : 0;
      if (nota + 1e-9 < previo || (d.cabe && d.a + 1e-9 < (porModo[d.modo] || 0))) baja = { alto, d, previo, porModo };
      previo = Math.max(previo, nota);
      if (d.cabe) porModo[d.modo] = Math.max(porModo[d.modo] || 0, d.a);
    }
    t('más alto disponible nunca da una rejilla peor (barrido de 200 a 900 px): la nota no baja y, con la misma forma de los tipos, el Pokémon no encoge', !baja, baja);
    const holgado = D(Object.assign({}, base, { ancho: 1000, alto: 600, dpr: 1 }));
    t('con sitio para los nombres de los tipos y el mismo tamaño de Pokémon, gana el nombre del tipo (no el emblema)', holgado.modo === 'texto', holgado);
    // Una pantalla en la que no cabe (568x320): se desplaza la rejilla, con emblemas y el píxel de arte a A_MIN.
    const chica = D(Object.assign({}, base, { ancho: 516, alto: 233, dpr: 2 }));
    t('si no cabe (568x320): cabe = false (la rejilla se desplaza en vertical), con emblemas, el píxel de arte a 1 px CSS en px físicos enteros y columnas en las que caben los nombres',
      !chica.cabe && chica.modo === 'emblema' && chica.k === 2 && chica.celdaW - base.rellenoH >= base.nombre && chica.cols * chica.filas >= 29, chica);
  } catch (e) { t('disposicion', false, String(e && e.stack || e)); }

  // ---- D. confirmar(): lo que guardaba el test, con la personalidad en null ----
  try {
    const c = nuevo(), G = c.G, hechos = [];
    const save = { coins: 0, owned: {}, shiny: {}, starter: null, partner: null, partnerShiny: false, personality: { trait: 'viejo' }, ach: {}, stats: {} };
    Object.assign(G, {
      DB: { save, grant(d, from) { if (!save.owned[d]) save.owned[d] = { at: 1, from }; }, commit() { hechos.push('guardar'); } },
      UI: { toast: m => hechos.push('aviso ' + m) }, Flow: { goMenu: () => hechos.push('menú') }
    });
    const no = G.ElegirCompanero.confirmar(25);   // Pikachu: no es inicial
    const sinElegir = G.ElegirCompanero.confirmar();
    const intacta = save.personality && save.personality.trait === 'viejo' && save.partner === null && !Object.keys(save.owned).length && !hechos.length;
    const si = G.ElegirCompanero.confirmar(4);
    const own1 = G.AchDefs.LIST.find(a => a.id === 'own1');
    t('confirmar(): inicial y compañero = el elegido, personalidad null, en la colección como inicial, guardado, «¡Charmander se une a ti!» y al menú; sin elegir o con uno que no es inicial, nada',
      !no && !sinElegir && intacta && si && save.starter === 4 && save.partner === 4 && save.personality === null && save.owned[4] && save.owned[4].from === 'starter' &&
      hechos.join(' | ') === 'guardar | aviso ¡Charmander se une a ti! | menú', { save, hechos });
    t('el logro «Primer compañero» (achievements.js real) se cumple con el inicial elegido', own1 && own1.value(save) >= own1.goal, own1 && { valor: own1.value(save), meta: own1.goal });
    // Sin la pantalla (si upstream la quita), abrir() cae en el test de siempre.
    const c2 = nuevo(), llamadas = [];
    c2.document = { getElementById: () => null };
    c2.G.TestUI = { start: () => llamadas.push('test') };
    c2.G.ElegirCompanero.abrir();
    t('sin #scr-starters en la página (si upstream la quita), abrir() abre el test de siempre', llamadas.join() === 'test', llamadas);
  } catch (e) { t('confirmar', false, String(e && e.stack || e)); }

  // ---- E. inglés, estilos, paquete y finales de línea ----
  try {
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {};
    c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    const EN = c.G.I18n.t;
    const casos = { 'Elige a tu compañero': 'Choose your partner', 'Al azar': 'Random', 'Elegir': 'Choose', 'Elegir a Charmander': 'Choose Charmander',
      'Elige uno o déjalo al azar.': 'Pick one or leave it to chance.', 'Iniciales': 'Starters', '¡Charmander se une a ti!': 'Charmander joins you!',
      'Tu apodo, tus misiones de hoy y tu inicial no cambian.': "Your nickname, today's missions and your starter don't change." };
    const mal = Object.entries(casos).filter(([es, en]) => EN(es) !== en).map(([es]) => [es, EN(es)]);
    const etiqueta = EN('Bulbasaur (Planta, Veneno)'), titulo = EN('Bulbasaur · Planta / Veneno');
    t('inglés (i18n.js real): el título, «Al azar», «Elegir a X», la pista, la etiqueta de la rejilla, el aviso, la nota de Ajustes > Cuenta sin la personalidad y los tipos de la etiqueta accesible',
      !mal.length && /Grass/.test(etiqueta) && /Poison/.test(etiqueta) && /Grass/.test(titulo), { mal, etiqueta, titulo });
  } catch (e) { t('inglés', false, String(e && e.stack || e)); }
  try {
    const css = rd('css/nico.css'), js = rd('js/ui/elegir-companero.js');
    const usadas = ['--ec-cols', '--ec-nombre', '--ec-tipo', '--ec-tipo2', 'ec-texto', 'ec-texto2', 'ec-emblema', 'ec-midiendo', 'ec-desplaza', 'ec-celda', 'ec-tipos', 'ec-txt', 'ec-emb', 'ec-pie', 'sin-test'];
    const faltan = usadas.filter(k => !css.includes(k) || !js.includes(k));
    const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
    t('css/nico.css tiene las variables y clases que usa elegir-companero.js (columnas, altos de línea, modos de los tipos), también en pantallas bajas',
      !faltan.length && /@media \(max-height: 519\.98px\) \{[^@]*#scr-starters\.sin-test #starter-grid \{ --ec-nombre: 14px/.test(sinComentarios), faltan);
    const min = rd('js/app.min.js');
    t('el paquete js/app.min.js lleva G.ElegirCompanero y el ajuste sinTest', /ElegirCompanero/.test(min) && /sinTest/.test(min));
    t('finales de línea: elegir-companero.js, nuevo, en LF', !/\r/.test(js));
  } catch (e) { t('estilos y paquete', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`sin test: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`sin test: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

function guarderiaChecks() {
  console.log('20. Guardería Pokémon (js/systems/guarderia.js): plazas, precio, reparto por tiempo y ganchos');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** util.js, mods.js, upgrades.js y guarderia.js reales en node:vm, con una Pokédex de mentira (sin documento). */
  const nuevo = (mods = {}) => {
    const c = { console, Math };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/upgrades.js', 'js/systems/guarderia.js']) vm.runInContext(rd(f), c, { filename: f });
    Object.assign(c.G.MODS, mods);
    c.G.DEX_BY = {}; for (let d = 1; d <= 9; d++) c.G.DEX_BY[d] = { dex: d, name: 'P' + d };
    return c;
  };
  const partida = coins => ({ coins, owned: Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map(d => [d, { at: 1 }])), pupg: {} });
  try {
    const { G } = nuevo(), GU = G.Guarderia, s = partida(3000);
    t('ajustes por defecto: 5 plazas y 500 Pokémonedas', GU.plazas() === 5 && GU.precio() === 500);
    const r1 = GU.meter(s, 1);
    t('dejar a un Pokémon cobra 500', r1.ok && s.coins === 2500 && GU.esta(s, 1), { r1, coins: s.coins });
    t('no entra dos veces ni uno que no tienes', !GU.meter(s, 1).ok && !GU.meter(s, 9).ok && s.coins === 2500);
    for (const d of [2, 3, 4, 5]) GU.meter(s, d);
    const lleno = GU.meter(s, 6);
    t('5 plazas: el sexto no entra y no se cobra', !lleno.ok && s.coins === 500 && GU.estado(s).mons.length === 5, { lleno, coins: s.coins });
    t('sacar es gratis y libera la plaza', GU.sacar(s, 5).ok && s.coins === 500 && GU.meter(s, 6).ok && s.coins === 0);
    t('sin monedas no entra', GU.sacar(s, 6).ok && !GU.meter(s, 6).ok && s.coins === 0);
    const sp = partida(1000); sp.partner = 3;
    t('tu compañero no puede entrar (y no se cobra)', !GU.meter(sp, 3).ok && sp.coins === 1000 && GU.meter(sp, 2).ok && sp.coins === 500);
    // Reparto: 250 s = 2 puntos y sobran 10 para la siguiente run; cada uno sube 2 niveles.
    const sumas = () => [1, 2, 3, 4].map(d => Object.values(s.pupg[d] || {}).reduce((a, b) => a + b, 0));
    const g1 = GU.repartir(s, 250);
    t('250 s: 2 niveles a cada uno y sobran 10 s', sumas().every(n => n === 2) && GU.estado(s).resto === 10 && g1.length === 4, { sumas: sumas(), resto: GU.estado(s).resto });
    GU.repartir(s, 110);
    t('lo que sobra cuenta en la siguiente run (10 + 110 = 1 nivel más)', sumas().every(n => n === 3) && GU.estado(s).resto === 0, sumas());
    t('nunca «Repertorio» y nunca por encima del máximo', [1, 2, 3, 4].every(d => !s.pupg[d].moves && G.Upgrades.LIST.every(u => (s.pupg[d][u.id] || 0) <= u.max)));
    // Al máximo: un Pokémon con todo lleno no gana nada y no rompe.
    const s2 = partida(500); s2.pupg[1] = Object.fromEntries(G.Upgrades.LIST.filter(u => u.id !== 'moves').map(u => [u.id, u.max]));
    GU.meter(s2, 1);
    t('con todas las mejoras al máximo no gana nada', GU.repartir(s2, 600).length === 0);
    // Lo sacado conserva lo ganado; con la guardería vacía no se acumula tiempo.
    const antes = JSON.stringify(s.pupg[1]);
    GU.sacar(s, 1); GU.sacar(s, 2); GU.sacar(s, 3); GU.sacar(s, 4);
    t('al sacarlo conserva las mejoras ganadas', JSON.stringify(s.pupg[1]) === antes);
    GU.repartir(s, 1000);
    t('vacía: no acumula tiempo para luego', GU.estado(s).resto === 0);
    // alAcabar: una run sospechosa no reparte; una limpia sí.
    const s3 = partida(500); GU.meter(s3, 7);
    const sucia = GU.alAcabar(s3, 600, false);
    const limpia = GU.alAcabar(s3, 240, true);
    t('alAcabar: la run sospechosa no reparte; la limpia sí (240 s = 2)', sucia && !sucia.ganado.length && limpia && limpia.ganado[0].dex === 7
      && Object.values(s3.pupg[7]).reduce((a, b) => a + b, 0) === 2, { sucia, limpia });
    const { G: G0 } = nuevo({ guarderiaPlazas: 0 }), s4 = partida(1000);
    t('guarderiaPlazas: 0 = sin guardería', !G0.Guarderia.meter(s4, 1).ok && s4.coins === 1000 && G0.Guarderia.alAcabar(s4, 600, true) === null);
  } catch (e) { t('lógica de la guardería', false, String(e && e.stack || e)); }
  try {
    const gancho = (f, re) => rd(f).split(/\r?\n/).some(l => re.test(l) && /MOD nico/.test(l));
    const menu = rd('js/ui/menu.js');
    t('uno de la guardería no se puede elegir de compañero: marcarDex en showDetail de menu.js, antes del botón de elegir',
      gancho('js/ui/menu.js', /G\.Guarderia\.marcarDex\(dex\)/) && menu.indexOf('G.Guarderia.marcarDex(dex)') < menu.indexOf("const pick = $('dex-pick')"));
    const html = rd('dev.html');
    t('su pantalla: el botón «Guardería» del menú justo tras «Mejoras», #scr-guarderia en dev.html y en la lista de pantallas de ui.js',
      /data-go="upgrades"[^\n]*\r?\n\s*<button class="menu-item" data-go="guarderia">Guardería/.test(html) && /<section id="scr-guarderia" class="scr dim hidden">/.test(html)
      && /id="gd-mon"/.test(html) && /id="gd-panel"/.test(html) && gancho('js/ui/ui.js', /SCREENS\.push\('scr-guarderia'\)/)
      && gancho('js/ui/menu.js', /ICON\.guarderia = 'luckyegg'/) && gancho('js/ui/menu.js', /go === 'guarderia'.*G\.Guarderia\.abrir\(\)/)
      && !/G\.Guarderia\.pintar/.test(rd('js/ui/menu.js')));
    t('Mejoras se abre siempre con tu compañero elegido', gancho('js/ui/menu.js', /if \(s\.partner && s\.owned\[s\.partner\]\) upgDex = s\.partner;/));
    t('ganchos de una línea: endRun de game.js y showOver de run-ui.js',
      gancho('js/game.js', /G\.Guarderia\.alAcabar\(save, time, clean\)/)
      && gancho('js/ui/run-ui.js', /G\.Guarderia\.enFin\(/));
    t('dev.html carga guarderia.js y el paquete lo lleva', /src="js\/systems\/guarderia\.js"/.test(rd('dev.html')) && /Guarderia/.test(rd('js/app.min.js')));
    t('inglés de la guardería en lang-en-mod.js', /'Guardería': 'Daycare'/.test(rd('js/data/lang-en-mod.js')));
    t('finales de línea: guarderia.js, nuevo, en LF', !/\r/.test(rd('js/systems/guarderia.js')));
  } catch (e) { t('ganchos de la guardería', false, String(e && e.stack || e)); }
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`guardería: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`guardería: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

function trampasChecks() {
  console.log('22. Trampas del suelo (G.MODS.pisarTrampas): jefes y cerca de los invitados');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** mods.js real con un mundo de mentira: trampas en (0,0) y (5000,0), y los enemigos que se le den. */
  const montar = ({ host = true, coop = false, enemigos = [], mods = {} } = {}) => {
    const c = { console }; c.window = c; c.G = {}; vm.createContext(c); vm.runInContext(rd('js/core/mods.js'), c);
    Object.assign(c.G.MODS, mods);
    const traps = [{ type: 'trap', tx: 0, ty: 0, x: 0, y: 8 }, { type: 'trap', tx: 100, ty: 0, x: 5000, y: 8 }];
    const rotas = [];
    c.G.World = { specialsNear: (x, y, rr) => traps.filter(p => (p.x - x) ** 2 + (p.y - y) ** 2 <= rr * rr), breakProp: p => rotas.push(p.tx) };
    c.G.EnemyMgr = { queryCircle: (x, y, rr) => enemigos.filter(e => (e.x - x) ** 2 + (e.y - y) ** 2 <= (rr + 10) ** 2) };
    c.G.Coop = { active: coop, isHost: host, puppets: () => [{ x: 5000, y: 0 }] };
    return { G: c.G, rotas };
  };
  const pl = { x: 0, y: 0 };
  try {
    let m = montar({ enemigos: [{ x: 0, y: 0, flying: true, boss: true }] }); m.G.MODS.pisarTrampas(pl);
    t('un jefe (marcado como volador) hace saltar la trampa', m.rotas.includes(0), m.rotas);
    m = montar({ enemigos: [{ x: 0, y: 0, flying: true }] }); m.G.MODS.pisarTrampas(pl);
    t('uno que flota pasa por encima sin activarla', !m.rotas.length, m.rotas);
    m = montar({ coop: true, enemigos: [{ x: 5000, y: 0 }] }); m.G.MODS.pisarTrampas(pl);
    t('en grupo, el anfitrión mira también las trampas junto al invitado (a 5.000 px)', m.rotas.includes(100), m.rotas);
    m = montar({ coop: true, host: false, enemigos: [{ x: 0, y: 0 }] }); m.G.MODS.pisarTrampas(pl);
    t('el invitado no decide (lo hace el anfitrión)', !m.rotas.length);
    m = montar({ enemigos: [{ x: 0, y: 0, boss: true, flying: true }], mods: { trampasPisadas: false } }); m.G.MODS.pisarTrampas(pl);
    t('trampasPisadas: false = como el original', !m.rotas.length);
    m = montar({ enemigos: [{ x: 0, y: 0, remote: true }] }); m.G.MODS.pisarTrampas(pl);
    t('las copias de la red no cuentan', !m.rotas.length);
    t('gancho de una línea al final de update de interact.js', rd('js/systems/interact.js').split(/\r?\n/).some(l => /G\.MODS\.pisarTrampas\(pl\)/.test(l) && /MOD nico/.test(l)));
  } catch (e) { t('trampas', false, String(e && e.stack || e)); }
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`trampas: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`trampas: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

function evoPartidaChecks() {
  console.log('25. Evolución dentro de la partida (js/systems/evo-partida.js): niveles, cartas, cambio de Pokémon y red');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** util.js, mods.js, la Pokédex, evolutions.js y evo-partida.js reales; sprites, efectos y red de mentira. */
  const montar = ({ coop = false, host = true, local = 'yo', mates = {} } = {}) => {
    const c = { console, Math }; c.window = c; c.G = {}; vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/evolutions.js', 'js/systems/evo-partida.js'])
      vm.runInContext(rd(f), c, { filename: f });
    const red = [];
    c.G.Sprites = { Animator: function (dex, sc, sh) { this.dex = dex; this.scale = sc; this.shiny = sh; }, hasShiny: () => true, preload: () => {}, animMeta: () => null,
      bodyRadius: d => 10 + (d % 5), bodyHeight: d => 20 + (d % 7) };
    c.G.FX = { ring() {}, burst() {} }; c.G.Audio = { sfx() {} }; c.G.Camera = { sees: () => true }; c.G.Spawner = { say() {} };
    c.G.Coop = { active: coop, isHost: coop && host, local: { uid: local }, mate: u => mates[u], broadcast: ev => red.push(['todos', ev]), toHost: ev => red.push(['anfitrion', ev]) };
    return { G: c.G, red };
  };
  const jugador = (G, dex, level, extra = {}) => Object.assign({ mon: G.DEX_BY[dex], dex, level, shiny: false, x: 0, y: 0, maxHp: G.DEX_BY[dex].hp + 40, hp: 50,
    baseSpd: G.DEX_BY[dex].spd, baseAtk: G.DEX_BY[dex].atk, scale: 1, uid: 'yo' }, extra);
  const normales = () => [{ key: 'a', type: 'stat' }, { key: 'b', type: 'stat' }, { key: 'c', type: 'up' }];
  try {
    const { G, red } = montar(), E = G.EvoPartida;
    t('niveles: el real × 0,5 hacia arriba (Charmeleon 8, Charizard 18, Dragonite 28); sin nivel, 20 (Raichu)',
      E.nivelDe(5) === 8 && E.nivelDe(6) === 18 && E.nivelDe(149) === 28 && E.nivelDe(26) === 20, [E.nivelDe(5), E.nivelDe(6), E.nivelDe(149), E.nivelDe(26)]);
    t('Charmander: nada a nivel 7, Charmeleon a nivel 8', !E.disponibles(jugador(G, 4, 7)).length && E.disponibles(jugador(G, 4, 8)).join() === '5');
    const p1 = E.cartas(jugador(G, 4, 9), normales(), 3);
    t('la carta va delante y siguen siendo 3 (2 normales)', p1.length === 3 && p1[0].evoDex === 5 && p1[0].type === 'evo' && p1.filter(c => !c.evoDex).length === 2, p1.map(c => c.key));
    const p2 = E.cartas(jugador(G, 133, 20), normales(), 3);
    t('Eevee a nivel 20: 2 ramas al azar y 1 carta normal para no evolucionar', p2.filter(c => c.evoDex).length === 2 && p2.length === 3 && p2.filter(c => c.evoDex).every(c => G.EVO[133].includes(c.evoDex)), p2.map(c => c.key));
    const pl = jugador(G, 4, 9), antes = { max: pl.maxHp, hp: pl.hp };
    p1[0].apply(pl);
    const d = G.DEX_BY[5].hp - G.DEX_BY[4].hp;
    t('al elegirla es Charmeleon: sprite, especie, ataque, velocidad y vida (+diferencia)', pl.dex === 5 && pl.mon.name === 'Charmeleon' && pl.anim.dex === 5
      && pl.baseAtk === G.DEX_BY[5].atk && pl.baseSpd === G.DEX_BY[5].spd && pl.maxHp === antes.max + d && pl.hp === antes.hp + Math.max(0, d), { pl: [pl.maxHp, pl.hp], antes, d });
    t('en solitario no manda nada por la red', !red.length);
    t('sin la siguiente fase a su nivel, no hay más carta (Charmeleon a nivel 9)', !E.disponibles(pl).length);
    const { G: G0 } = montar(); G0.MODS.evoEnPartida = false;
    t('evoEnPartida: false = sin cartas', G0.EvoPartida.cartas(jugador(G0, 4, 30), normales(), 3).every(c => !c.evoDex));
  } catch (e) { t('lógica de la evolución en partida', false, String(e && e.stack || e)); }
  try {
    // Red: el invitado avisa al anfitrión; el anfitrión aplica y reenvía a todos; cada uno ignora el eco de lo suyo.
    let m = montar({ coop: true, host: false, local: 'inv' });
    const yo = jugador(m.G, 4, 9, { uid: 'inv' });
    m.G.EvoPartida.evolucionar(yo, 5);
    t('el invitado avisa al anfitrión con [evo, uid, dex, shiny]', m.red.length === 1 && m.red[0][0] === 'anfitrion' && JSON.stringify(m.red[0][1]) === '["evo","inv",5,0]', m.red);
    const copia = { pl: null };
    m = montar({ coop: true, host: true, local: 'anf', mates: { inv: copia } });
    copia.pl = jugador(m.G, 4, 9, { uid: 'inv', remote: true, hp: 77 });
    m.G.EvoPartida.deRed(['evo', 'inv', 5, 0], 'inv');
    t('el anfitrión cambia la copia del invitado (sin tocar su vida, que llega por la red) y lo reenvía a todos',
      copia.pl.dex === 5 && copia.pl.hp === 77 && m.red.length === 1 && m.red[0][0] === 'todos', { dex: copia.pl.dex, hp: copia.pl.hp, red: m.red });
    m.G.EvoPartida.deRed(['evo', 'otro', 6, 0], 'inv');
    t('nadie avisa por otro jugador', m.red.length === 1);
    m = montar({ coop: true, host: false, local: 'inv' });
    m.G.EvoPartida.deRed(['evo', 'inv', 5, 0]);
    t('el eco de lo tuyo no hace nada', !m.red.length);
    const gancho = (f, re) => rd(f).split(/\r?\n/).some(l => re.test(l) && /MOD nico/.test(l));
    t('ganchos de una línea: offer de levelup.js, renderCards de run-ui.js y los dos sentidos de coop.js',
      gancho('js/systems/levelup.js', /G\.EvoPartida\.cartas\(pl, picked, n\)/) && gancho('js/ui/run-ui.js', /G\.EvoPartida\.pintarCarta\(el, c\)/)
      && gancho('js/net/coop.js', /G\.EvoPartida\.deRed\(ev, from\)/) && gancho('js/net/coop.js', /G\.EvoPartida\.deRed\(ev\); break;/));
    t('dev.html carga evo-partida.js y el paquete lo lleva', /src="js\/systems\/evo-partida\.js"/.test(rd('dev.html')) && /EvoPartida/.test(rd('js/app.min.js')));
    t('G.EVO_NIVEL generado: 327 niveles', rd('js/data/evolutions.js').match(/^  \d+: \d+,/gm).length === 327);
  } catch (e) { t('red de la evolución en partida', false, String(e && e.stack || e)); }
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`evolución en partida: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`evolución en partida: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

function devMenuChecks() {
  console.log('21. Menú de pruebas (js/ui/dev-menu.js): sólo con una huella de G.MODS.devHuellas');
  const src = rd('js/ui/dev-menu.js'), mods = rd('js/core/mods.js');
  const c = { console }; c.window = c; c.G = {}; vm.createContext(c); vm.runInContext(mods, c);
  const lista = c.G.MODS.devHuellas;
  const bien = Array.isArray(lista) && lista.every(h => /^[0-9a-f]{64}$/.test(h));
  const sal = (/const SAL = '([^']*)'/.exec(src) || [])[1];
  const gancho = rd('js/ui/settings-ui.js').split(/\r?\n/).some(l => /G\.DevMenu\.ajustes\(box, tab\)/.test(l) && /MOD nico/.test(l));
  // Ningún uid en claro: los uid de Firebase son 28 caracteres alfanuméricos; en mods.js sólo huellas.
  const uidEnClaro = /devHuellas:[^\]]*['"][A-Za-z0-9]{28}['"]/.test(mods);
  if (bien && sal === 'pokeswarm/dev/1\\0' && gancho && !uidEnClaro && /G\.DB\.guest/.test(src) && /DevMenu/.test(rd('js/app.min.js')))
    ok(`menú de pruebas: ${lista.length} cuenta(s) por huella SHA-256 (ningún uid en claro), nunca a invitados, con su gancho en settings-ui.js y en el paquete`);
  else bad(`menú de pruebas: huellas ${bien ? 'bien' : 'mal formadas'}, sal ${JSON.stringify(sal)}, gancho ${gancho}, uid en claro ${uidEnClaro}`);
  // «Desbloquear todos (con shiny)» (15-10-2026), con la Pokédex, los sprites y el Multiverso reales.
  const d = { console }; d.window = d; d.G = {}; vm.createContext(d);
  for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/evolutions.js', 'js/core/sprites.js', 'js/data/moves.js', 'js/data/multiverso.js', 'js/ui/dev-menu.js'])
    vm.runInContext(rd(f), d, { filename: f });
  const G = d.G, s = { owned: { 4: { at: 1, from: 'starter' } }, shiny: { 25: { at: 2, from: 'gacha' } } };
  const r1 = G.DevMenu.desbloquearTodo(s), r2 = G.DevMenu.desbloquearTodo(s);
  const dex = G.DEX.map(p => p.dex), conShiny = dex.filter(x => G.Sprites.hasShiny(x)), mv = dex.filter(x => x >= 10001);
  const fallos = [];
  if (!dex.every(x => s.owned[x])) fallos.push('falta alguno en owned');
  if (!conShiny.every(x => s.shiny[x]) || Object.keys(s.shiny).some(x => !G.Sprites.hasShiny(+x))) fallos.push('shiny: no cuadra con hasShiny');
  if (s.owned[4].from !== 'starter' || s.owned[4].at !== 1 || s.shiny[25].from !== 'gacha') fallos.push('pisó lo que ya había');
  if (r1.nuevos !== dex.length - 1 || r1.shinies !== conShiny.length - 1 || r2.nuevos || r2.shinies || r1.total !== dex.length) fallos.push('cuentas ' + JSON.stringify([r1, r2]));
  if (mv.length < 10 || !mv.every(x => s.owned[x] && s.shiny[x])) fallos.push('Multiverso incompleto');
  if (!fallos.length) ok(`menú de pruebas: «Desbloquear todos» da los ${dex.length} (${mv.length} del Multiverso) y ${conShiny.length} shiny (los que tienen sprite shiny), sin pisar lo que ya había; repetirlo no suma nada`);
  else bad('menú de pruebas, desbloquear todos: ' + fallos.join('; '));
  // «Todos al máximo» (22-10-2026): todos y cada mejora a su máximo, sin bajar nada; repetirlo no sube nada.
  vm.runInContext(rd('js/data/upgrades.js'), d, { filename: 'js/data/upgrades.js' });
  const m = { owned: {}, shiny: {}, pupg: { 25: { hp: 3 }, 10001: { atk: 99 } } };
  const m1 = G.DevMenu.maximizarTodo(m), m2 = G.DevMenu.maximizarTodo(m);
  const alMax = dex.every(x => m.owned[x] && G.Upgrades.LIST.every(u => m.pupg[x][u.id] >= u.max));
  if (alMax && m.pupg[10001].atk === 99 && m.pupg[25].hp === 10 && m1.subidas > 0 && m2.subidas === 0 && mv.every(x => m.pupg[x].moves === 1))
    ok(`menú de pruebas: «Todos al máximo» deja los ${dex.length} (Multiverso incluido) con todas las mejoras al máximo, sin bajar ninguna; repetirlo no sube nada`);
  else bad('menú de pruebas, todos al máximo: ' + JSON.stringify({ alMax, m1, m2 }));
}

// ---------------- 23. mapas propios: biomas, terreno, objetos, arenas, pintor y sprites (G.Mapas) ----------------
/* Sumas de control del generador (caso C): sha1 (12 cifras) de los códigos, los objetos y G.Mapas.huella de 64×64 casillas
 * de la semilla 1234 (de −32 a 31) y de la arena fire en (5008, 5008). El mundo de una partida es función de la semilla:
 * si cambian sin querer, dos versiones del juego ya no generan el mismo mapa (en grupo, el invitado vería otro). Si el
 * cambio del generador es A PROPÓSITO, se ponen aquí las que imprime el FALLO y se vuelve a mirar SEMILLA_MENU (caso M). */
// 14-10-2026, a propósito, tras la verificación: la vega, por el puente sólo sobre agua (11 casillas de puente sobre el
// cauce seco pasan a calzada, sin cambiar ningún objeto; antes, a8c439f3b65d), y la fire, por la pared de la arena hasta
// 36 casillas en vez de 32 (502 casillas de r = 32 a 35,9 pasan a pared de la arena, A_VACIO, sin cambiar ningún objeto;
// antes, d801989ee1a3). SEMILLA_MENU sigue cumpliendo el caso M.
const HUELLAS_MAPAS = { vega: '8b0287753a40', fire: '8e4945bb2d41' };
function mapasChecks() {
  console.log('23. Mapas propios (js/world/mapas-datos.js, mapas.js, mapas-pintar.js y mapas-sprites.js con tiles.js, world.js y weather.js reales)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const inicio = Date.now();
  const faltan = MAPAS.filter(f => !ex(f));
  if (faltan.length) { bad('mapas: faltan ' + faltan.join(', ') + ' (sin ellos no se puede probar nada más)'); return; }
  const N = 16, TS = 32, KIND = ['floor', 'wall', 'liquid'];
  const SOLIDO = new Set(['tree', 'rock', 'chest', 'altar', 'bigchest']), INTER = new Set(['altar', 'spring', 'bigchest', 'trap']);
  const RADIO = { tree: 13, rock: 12, chest: 12, grass: 14, altar: 9, spring: 22, bigchest: 14, trap: 9 };   // los de PROP de world.js
  const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
  const xorshift = s => { let x = s >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const bytes = cv => cv && cv._img && cv._img.data;
  const iguales = (a, b) => !!(a && b && a.length === b.length && a.every((v, i) => v === b[i]));
  const clave = p => `${p.type}${p.kind || 0}@${p.tx},${p.ty}`;
  const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  /** Una cámara que ve w×h casillas desde (x0, y0) (para visibleProps, que añade un chunk alrededor). */
  const camaraTodo = (x0, y0, w, h) => ({ left: () => x0 * TS, top: () => y0 * TS, w: w * TS, h: h * TS, sees: () => true });

  /** Lienzo de mentira: guarda el ImageData de putImageData; cualquier otra llamada a su contexto se apunta en `usos`. */
  const fabrica = usos => () => {
    const cv = { width: 0, height: 0, _img: null };
    const base = { createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData(img) { cv._img = img; } };
    const ctx = new Proxy(base, { get: (o, k) => (k in o ? o[k] : typeof k === 'string' ? () => { usos.push(k); } : undefined) });
    cv.getContext = () => ctx;
    return cv;
  };
  const lanza = que => () => { throw new Error(que + ' al generar o pintar el mapa'); };
  const mocks = (G, estilo) => {
    const oyentes = [];
    G.Estilo = { actual: estilo, get dex() { return this.actual === 'dex'; }, on(fn) { oyentes.push(fn); }, set(v) { this.actual = v; oyentes.forEach(fn => fn(v)); } };
    G.Settings = { fx: 2, get: () => false };
    G.Sprites = { PX: 2 };
    G.Game = { state: 'playing', st: { time: 10 }, player: { x: 0, y: 0 } };
    G.Rift = { inArena: false, rift: null };
    G.Coop = { active: false, isHost: false };
  };
  /** El juego real en ESTE reino, con new Function como tools/nico/mapas/vista.js (en node:vm cada acceso a G cruza el
   *  contexto y todo va unas 40 veces más lento): util.js, mods.js, marca.js, tiles.js, los 4 de los mapas con
   *  G.MODS.mapasPropios = mapas (null = sin cargarlos: el proyecto base tal cual), world.js, weather.js y, si se pide,
   *  entorno.js. Con `trampa`, Math.random, Date y performance.now lanzan un error. `orig`: lo de tiles.js y G.MARCA antes de
   *  los mapas. `M.random` se puede cambiar después (caso N). */
  function reino({ mapas = true, estilo = 'clasico', entorno = false, trampa = false } = {}) {
    const M = Object.create(Math, { random: { value: trampa ? lanza('Math.random') : Math.random, writable: true } });
    const D = trampa ? Object.assign(function () { throw new Error('Date al generar o pintar el mapa'); }, { now: lanza('Date.now') }) : Date;
    const usos = [], c = { console, document: { createElement: fabrica(usos) }, performance: { now: trampa ? lanza('performance.now') : () => 1000 } };
    c.window = c; c.G = {};
    const correr = f => new Function('window', 'G', 'document', 'performance', 'Math', 'Date', rd(f) + '\n//# sourceURL=' + f)(c, c.G, c.document, c.performance, M, D);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js']) correr(f);
    const G = c.G;
    mocks(G, estilo);
    correr('js/world/tiles.js');
    const T = G.Tiles, orig = { BIOMES: T.BIOMES, temas: T.ARENA_THEMES, fire: T.ARENA_THEMES.fire, biomas: G.MARCA.biomas,
      paintChunk: T.paintChunk, propSprite: T.propSprite, clearProps: T.clearProps };
    if (mapas !== null) { G.MODS.mapasPropios = mapas; for (const f of MAPAS) correr(f); }
    for (const f of ['js/world/world.js', 'js/systems/weather.js'].concat(entorno ? ['js/world/entorno.js'] : [])) correr(f);
    return { G, M, usos, orig };
  }
  /** Arena como la monta world.js (setArena le añade `th`). */
  const arenaDe = (G, type, tx, ty) => ({ tx, ty, r: 11, type, th: G.Tiles.ARENA_THEMES[type] });
  /** Códigos (kind | sub << 2) de w×h casillas desde (x0, y0), leídos de las capas de chunk (G.Mapas.capa). */
  function codigos(G, seed, x0, y0, w, h, arena = null) {
    const out = new Uint8Array(w * h);
    for (let cy = Math.floor(y0 / N); cy * N < y0 + h; cy++) for (let cx = Math.floor(x0 / N); cx * N < x0 + w; cx++) {
      const cod = G.Mapas.capa(cx, cy, seed, arena).cod;
      for (let j = 0; j < N; j++) {
        const y = cy * N + j - y0;
        if (y >= 0 && y < h) for (let i = 0; i < N; i++) { const x = cx * N + i - x0; if (x >= 0 && x < w) out[y * w + x] = cod[j * N + i]; }
      }
    }
    return out;
  }
  /** Los objetos del chunk (cx, cy) como los pone world.js (chunkData → placeProps → G.Mapas.props), con un makeProp de mentira. */
  function objetos(G, seed, cx, cy, arena = null) {
    const c = { cx, cy, terr: new Uint8Array(N * N), props: [], propAt: new Map(), liquids: [] }, cod = G.Mapas.capa(cx, cy, seed, arena).cod;
    for (let o = 0; o < N * N; o++) { c.terr[o] = cod[o] & 3; if (c.terr[o] === 2) c.liquids.push(cx * N + o % N, cy * N + (o >> 4)); }
    G.Mapas.props(c, N, seed, arena, new Set(), (type, tx, ty, kind = 0) => ({ type, tx, ty, kind, solid: SOLIDO.has(type), r: RADIO[type], x: tx * TS + TS / 2, y: ty * TS + TS - 4 }));
    return c.props;
  }
  // Color (los mismos cálculos que midieron la especificación): luminancia relativa, contraste, CIELAB y ΔE2000.
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lumRgb = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const lumi = h => lumRgb(...hexRgb(h));
  const contraste = (a, b) => { const y1 = lumi(a), y2 = lumi(b); return (Math.max(y1, y2) + 0.05) / (Math.min(y1, y2) + 0.05); };
  function lab(h) {
    const [r, g, b] = hexRgb(h).map(lin);
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = v => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }
  function de00(h1, h2) {
    const [L1, a1, b1] = lab(h1), [L2, a2, b2] = lab(h2), R = Math.PI / 180;
    const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2, Gk = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
    const a1p = (1 + Gk) * a1, a2p = (1 + Gk) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
    const h1p = (Math.atan2(b1, a1p) / R + 360) % 360, h2p = (Math.atan2(b2, a2p) / R + 360) % 360;
    let dhp = h2p - h1p;
    if (C1p * C2p === 0) dhp = 0; else if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * R / 2), Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
    let hbp = h1p + h2p;
    if (C1p * C2p !== 0) hbp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
    const T = 1 - 0.17 * Math.cos((hbp - 30) * R) + 0.24 * Math.cos(2 * hbp * R) + 0.32 * Math.cos((3 * hbp + 6) * R) - 0.2 * Math.cos((4 * hbp - 63) * R);
    const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)), RT = -Math.sin(2 * 30 * Math.exp(-(((hbp - 275) / 25) ** 2)) * R) * RC;
    const SL = 1 + 0.015 * (Lbp - 50) ** 2 / Math.sqrt(20 + (Lbp - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
    return Math.sqrt(((L2 - L1) / SL) ** 2 + ((C2p - C1p) / SC) ** 2 + (dHp / SH) ** 2 + RT * ((C2p - C1p) / SC) * (dHp / SH));
  }

  let N0, F, T;
  try { N0 = reino({ mapas: null }); F = reino({ mapas: false }); T = reino(); }
  catch (e) { bad('mapas: no se pudieron cargar los mapas propios en node: ' + (e && e.stack || e)); return; }
  const G = T.G, Gm = G.Mapas, SUB = (Gm && Gm.SUB) || {};

  // ---- A. Interruptor: con true, todo lo nuevo en su sitio; con false, el proyecto base tal cual ----
  try {
    const TT = G.Tiles, MD = G.MapasDatos, U = N0.G;
    const tipos = Object.keys(TT.ARENA_THEMES), nombres = TT.BIOMES.slice(0, 3).map(b => b.name);
    const arenasBien = tipos.every((k, i) => TT.BIOMES[3 + i] && TT.BIOMES[3 + i].name === 'Grieta · ' + MD.ARENAS[k].name && TT.ARENA_THEMES[k].name === MD.ARENAS[k].name &&
      ['familia', 'variante', 'sueloMat', 'paredMat'].every(c => TT.ARENA_THEMES[k][c] === MD.ARENAS[k][c]));
    const enSuSitio = TT.BIOMES === T.orig.BIOMES && TT.ARENA_THEMES === T.orig.temas && TT.ARENA_THEMES.fire === T.orig.fire && G.MARCA.biomas === T.orig.biomas;
    t('interruptor (mapasPropios = true): G.Mapas.activo; los 3 biomas nuevos; las 18 arenas con las mismas claves y en el mismo orden que upstream (con nombre, familia, variante, sueloMat y paredMat de G.MapasDatos); BIOMES de 21 con «Grieta · »; todo mutado en su sitio (los mismos objetos de tiles.js y G.MARCA)',
      Gm.activo === true && eq(nombres, MD.BIOMAS.map(b => b.name)) && eq(tipos, Object.keys(U.Tiles.ARENA_THEMES)) && tipos.length === 18 && eq(TT.ARENA_TYPES, tipos) &&
      TT.BIOMES.length === 21 && arenasBien && enSuSitio && TT.arenaBiome('fire') === 4 && Gm.SEMILLA_MENU === MD.SEMILLA_MENU,
      { activo: Gm.activo, nombres, n: TT.BIOMES.length, arenasBien, enSuSitio, semilla: Gm.SEMILLA_MENU });
    const rift = [0, 1, 2, 3].every(f => iguales(bytes(TT.propSprite(0, 'rift', f)), bytes(U.Tiles.propSprite(0, 'rift', f))));
    const marca = G.MARCA.biomas.length === 3 && G.MARCA.biomas.every((b, i) => Object.keys(b).every(k => k === 'nombre' || k === '_g') &&
      b.nombre === nombres[i] && eq(b._g, MD.MARCA_G[MD.BIOMAS[i].motivo]));
    const motas = eq(G.MARCA.motas.escarcha, MD.MOTAS.escarcha) && eq(G.MARCA.motas.esporas, MD.MOTAS.esporas) && Object.keys(U.MARCA.motas).every(k => eq(G.MARCA.motas[k], U.MARCA.motas[k]));
    t('interruptor (true): paintChunk = G.Mapas.pintar; propSprite nuevo (la grieta, «rift», byte a byte la de upstream) y clearProps envuelto; G.MARCA.biomas sólo con { nombre, _g } de G.MapasDatos.MARCA_G y las motas escarcha y esporas (las demás, intactas)',
      TT.paintChunk === Gm.pintar && typeof Gm.sprite === 'function' && TT.propSprite !== T.orig.propSprite && TT.clearProps !== T.orig.clearProps && rift && marca && motas, { rift, marca, motas });
    const FG = F.G, FT = FG.Tiles;
    const igual = eq(FT.BIOMES, U.Tiles.BIOMES) && eq(FT.ARENA_THEMES, U.Tiles.ARENA_THEMES) && eq(FG.MARCA.biomas, U.MARCA.biomas) && eq(FG.MARCA.motas, U.MARCA.motas);
    const funciones = FT.paintChunk === F.orig.paintChunk && FT.propSprite === F.orig.propSprite && FT.clearProps === F.orig.clearProps;
    const mundoDe = R => {
      const W = R.G.World, s = [];
      W.reset(1234); W.setBiome(0, true);
      for (let ty = -32; ty < 32; ty++) for (let tx = -32; tx < 32; tx++) s.push(W.kindAt(tx * TS + 1, ty * TS + 1)[0]);
      return s.join('') + '|' + W.visibleProps(camaraTodo(-32, -32, 64, 64)).map(clave).join(';');
    };
    t('interruptor (mapasPropios = false): G.Mapas no activo; BIOMES, ARENA_THEMES y G.MARCA (biomas y motas) iguales a los del proyecto base; paintChunk, propSprite y clearProps, los de tiles.js; y el mismo mundo (64×64 casillas con sus objetos)',
      !(FG.Mapas && FG.Mapas.activo) && igual && funciones && mundoDe(F) === mundoDe(N0), { activo: FG.Mapas && FG.Mapas.activo, igual, funciones });
    const min = rd('js/app.min.js');
    t('el paquete (js/app.min.js) lleva los mapas propios (si no: node tools/build.js --privado)', ['mapasPropios', 'climaAlAzar', 'SEMILLA_MENU', 'Vega Sulfúrea', 'Corro de Hadas'].every(k => min.includes(k)));
  } catch (e) { t('interruptor', false, String(e && e.stack || e)); }

  // ---- B. Pureza: función de (semilla, casilla, arena), sin azar ni reloj, igual en cualquier orden y en cualquier reino ----
  try {
    const sinComentarios = s => s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:\\])\/\/[^\n]*/gm, '$1');
    /** Quita (con espacios: las líneas no cambian) el cuerpo entre llaves de cada definición de `nombre`. */
    const sinCuerpo = (s, nombre) => {
      let out = s;
      const defs = [];
      for (const m of s.matchAll(new RegExp('\\b' + nombre + '\\b', 'g'))) {
        const resto = s.slice(m.index + nombre.length), k = resto.indexOf('{');
        if (k < 0 || !/^\s*(?:[:=]\s*(?:function\s*[\w$]*\s*)?)?(?:\([^()]*\)|[A-Za-z_$][\w$]*)\s*(?:=>\s*)?$/.test(resto.slice(0, k))) continue;
        let b = m.index + nombre.length + k, prof = 0;
        const a = b;
        for (; b < s.length; b++) { if (s[b] === '{') prof++; else if (s[b] === '}' && --prof === 0) break; }
        defs.push([a, b + 1]);
      }
      for (const [a, b] of defs) out = out.slice(0, a) + out.slice(a, b).replace(/[^\n]/g, ' ') + out.slice(b);
      return { out, n: defs.length };
    };
    const donde = (s, re) => [...s.matchAll(re)].map(m => (s.slice(0, m.index).match(/\n/g) || []).length + 1 + ': ' + m[0]);
    const gen = sinCuerpo(sinComentarios(rd('js/world/mapas.js')), 'climaAlAzar');
    const PROHIBIDO = /\bMath\s*\.\s*(?:random|hypot|sqrt|cbrt|sinh?|cosh?|tanh?|asinh?|acosh?|atan2?|atanh|pow|exp|expm1|log1p|log2|log10|log)\b|\bDate\b|\bperformance\b|\*\*|\{[^{}]*\}\s*=\s*Math\b/g;
    const enGen = donde(gen.out, PROHIBIDO);
    const enOtros = ['js/world/mapas-datos.js', 'js/world/mapas-pintar.js', 'js/world/mapas-sprites.js'].flatMap(f => donde(sinComentarios(rd(f)), /\bMath\s*\.\s*random\b|\bDate\b|\bperformance\b/g).map(x => f + ':' + x));
    t('pureza en el código: mapas.js (sin comentarios y salvo climaAlAzar) no usa Math.random, hypot, sqrt, sin, cos, tan, atan, pow ni **, exp, log, Date ni performance; mapas-datos.js, mapas-pintar.js y mapas-sprites.js, ni Math.random, Date ni performance',
      gen.n >= 1 && !enGen.length && !enOtros.length, { climaAlAzar: gen.n, mapas: enGen.slice(0, 8), otros: enOtros.slice(0, 8) });
  } catch (e) { t('pureza en el código', false, String(e && e.stack || e)); }
  try {
    const lista = [];
    for (let cy = -5; cy < 5; cy++) for (let cx = -10; cx < 10; cx++) lista.push([cx, cy, null]);           // 200 alrededor del claro
    for (let cy = 311; cy < 315; cy++) for (let cx = 310; cx < 316; cx++) lista.push([cx, cy, 'fire']);       // la arena fire en (5008, 5008)
    const firma = (Gx, [cx, cy, tipo]) => {
      const a = tipo ? arenaDe(Gx, tipo, 5008, 5008) : null, uno = [];
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) uno.push(Gx.Mapas.codigo(cx * N + i, cy * N + j, 1234, a) + ':' + Gx.Mapas.terreno(cx * N + i, cy * N + j, 1234, a));
      return sha([...Gx.Mapas.capa(cx, cy, 1234, a).cod].join() + '|' + uno.join() + '|' + objetos(Gx, 1234, cx, cy, a).map(clave).sort().join(';') + '|' + Gx.Mapas.huella(1234, cx, cy, 1, 1, a));
    };
    // Las capas, lo mismo que casilla a casilla (y terreno = codigo & 3).
    let incoherentes = 0;
    for (const [cx, cy, tipo] of lista) {
      const a = tipo ? arenaDe(G, tipo, 5008, 5008) : null, cod = Gm.capa(cx, cy, 1234, a).cod;
      for (let o = 0; o < N * N; o++) {
        const c = Gm.codigo(cx * N + o % N, cy * N + (o >> 4), 1234, a);
        if (cod[o] !== c || Gm.terreno(cx * N + o % N, cy * N + (o >> 4), 1234, a) !== (c & 3)) incoherentes++;
      }
    }
    t(`capa(cx, cy) da los mismos códigos que codigo() casilla a casilla y terreno() = codigo() & 3 (${lista.length} chunks, ${incoherentes} distintos)`, !incoherentes, incoherentes);
    const A = reino({ trampa: true }), B = reino({ trampa: true });
    const fa = lista.map(k => firma(A.G, k));
    const orden = lista.map((k, i) => i), rnd = xorshift(99);
    for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
    const fb = [];
    for (const i of orden) fb[i] = firma(B.G, lista[i]);
    // Y un contexto node:vm (otro reino de verdad), con unos cuantos al revés.
    const cv = { console, document: { createElement: fabrica([]) }, performance: { now: lanza('performance.now') } };
    vm.createContext(cv); cv.window = cv; cv.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js']) vm.runInContext(rd(f), cv, { filename: f });
    mocks(cv.G, 'clasico');
    vm.runInContext(rd('js/world/tiles.js'), cv, { filename: 'js/world/tiles.js' });
    cargarMapas(cv, true);
    vm.runInContext(rd('js/world/world.js'), cv, { filename: 'js/world/world.js' });
    vm.runInContext('Math.random = () => { throw new Error("Math.random al generar el mapa"); }; Date.now = Math.random;', cv);
    const sub = [];
    for (let i = lista.length - 1; i >= 0; i -= 8) sub.push(i);
    const fv = sub.map(i => firma(cv.G, lista[i]));
    const distintas = fa.filter((h, i) => h !== fb[i]).length, distintasVm = sub.filter((i, k) => fa[i] !== fv[k]).length;
    t(`determinismo: los ${lista.length} chunks (200 alrededor del claro y 24 con la arena fire) dan la misma huella (códigos, capa, objetos y G.Mapas.huella) en orden, barajados en otro reino y ${sub.length} al revés en un contexto node:vm, con Math.random, Date.now y performance.now lanzando un error`,
      !distintas && !distintasVm, { distintas, distintasVm });
    // El pintor y los sprites tampoco: con la trampa puesta, 4 chunks (3 biomas y la arena fire) y todos los objetos de 5 biomas.
    const AG = A.G, kinds = (tx, ty) => KIND[AG.Mapas.terreno(tx, ty, 1234, AG.World.arena)];
    AG.World.reset(1234);
    for (const [bi, cx, cy] of [[0, 0, 0], [1, -3, 2], [2, 5, -4]]) AG.Mapas.pintar(cx, cy, N, kinds, null, bi, 1234);
    AG.World.setArena({ tx: 5008, ty: 5008, r: 11, type: 'fire' });
    AG.Mapas.pintar(312, 312, N, kinds, null, AG.Tiles.arenaBiome('fire'), 1234);
    for (const bi of [0, 1, 2, 4, 15]) for (const [ty, vs] of Object.entries({ tree: [0], rock: [0, 1], grass: [0, 1], chest: [0], bigchest: [0], altar: [0, 1, 2, 3, 4, 5, 6, 7], spring: [0, 1], trap: [0, 1, 2] }))
      for (const v of vs) AG.Tiles.propSprite(bi, ty, v);
    t('pureza al pintar: 4 chunks (los 3 biomas y la arena fire) y todos los objetos de 5 biomas sin Math.random, Date ni performance.now', true);
  } catch (e) { t('determinismo y pureza en marcha', false, String(e && e.stack || e)); }

  // ---- C. Suma de control (se cambia SÓLO a propósito) ----
  try {
    const suma = (seed, cx0, cy0, a) => {
      const partes = [];
      for (let cy = cy0; cy < cy0 + 4; cy++) for (let cx = cx0; cx < cx0 + 4; cx++)
        partes.push([...Gm.capa(cx, cy, seed, a).cod].join(), objetos(G, seed, cx, cy, a).map(clave).sort().join(';'));
      return sha(partes.join('|') + '|' + Gm.huella(seed, cx0, cy0, 4, 4, a));
    };
    const vega = suma(1234, -2, -2, null), fire = suma(1234, 311, 311, arenaDe(G, 'fire', 5008, 5008));
    t(`suma de control del generador (64×64 casillas de la semilla 1234 y la arena fire: ${vega} y ${fire}); si el cambio es a propósito, ponerlas en HUELLAS_MAPAS de check.js y volver a mirar SEMILLA_MENU`,
      vega === HUELLAS_MAPAS.vega && fire === HUELLAS_MAPAS.fire, { esperadas: HUELLAS_MAPAS, actuales: { vega, fire } });
  } catch (e) { t('suma de control', false, String(e && e.stack || e)); }

  // ---- D, F y G. Estructura, objetos y aparición en 4 semillas × 384² casillas (147.456, como la tabla del §6) ----
  const SEMILLAS = [1234, 777, 4242, 31337], RV = 192, WV = 2 * RV;
  const RANGOS = { tree: [2128, 2584], rock: [862, 1025], chest: [48, 69], trap: [217, 275], spring: [27, 53], altar: [20, 53], bigchest: [23, 39] }, HIERBA = [10.7, 11.5];
  /** Distancia (chaflán 1 y √2) a la casilla más cercana que cumple `es`. */
  const distancia = (k, es) => {
    const W = WV, d = new Float64Array(W * W), b = Math.SQRT2;
    for (let o = 0; o < W * W; o++) d[o] = es(k[o]) ? 0 : 1e9;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const o = y * W + x; let v = d[o];
      if (x > 0) v = Math.min(v, d[o - 1] + 1); if (y > 0) v = Math.min(v, d[o - W] + 1);
      if (x > 0 && y > 0) v = Math.min(v, d[o - W - 1] + b); if (x < W - 1 && y > 0) v = Math.min(v, d[o - W + 1] + b);
      d[o] = v;
    }
    for (let y = W - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
      const o = y * W + x; let v = d[o];
      if (x < W - 1) v = Math.min(v, d[o + 1] + 1); if (y < W - 1) v = Math.min(v, d[o + W] + 1);
      if (x < W - 1 && y < W - 1) v = Math.min(v, d[o + W + 1] + b); if (x > 0 && y < W - 1) v = Math.min(v, d[o + W - 1] + b);
      d[o] = v;
    }
    return d;
  };
  /** Lo que se alcanza desde el borde de la ventana sin pasar por lo que `bloquea`. */
  const alcanzable = bloquea => {
    const W = WV, vis = new Uint8Array(W * W), q = [];
    const push = o => { if (!vis[o] && !bloquea(o)) { vis[o] = 1; q.push(o); } };
    for (let i = 0; i < W; i++) { push(i); push((W - 1) * W + i); push(i * W); push(i * W + W - 1); }
    while (q.length) { const o = q.pop(), x = o % W, y = (o / W) | 0; if (x > 0) push(o - 1); if (x < W - 1) push(o + 1); if (y > 0) push(o - W); if (y < W - 1) push(o + W); }
    return vis;
  };
  const est = [], ap = { n: 0, esc: 0, mov: 0, grieta: 0, ladron: 0, perdido: 0 }, objMal = [];
  const OUT_ESC = Math.hypot(768, 480) / 2 + 40, OUT_MOV = Math.hypot(1266, 585) / 2 + 40;   // Camera.outerRadius() en 1440x900 y en un móvil (844x390)
  try {
    const CRUCE = new Set([SUB.VADO, SUB.PUENTE, SUB.PUERTO, SUB.CALZADA, SUB.PRETIL, SUB.PLAZA]), SIN_HIERBA = new Set([SUB.LOSA, SUB.ANILLO]);
    for (const seed of SEMILLAS) {
      const cod = codigos(G, seed, -RV, -RV, WV, WV), k = new Uint8Array(WV * WV);
      for (let o = 0; o < k.length; o++) k[o] = cod[o] & 3;
      const kAt = (tx, ty) => (tx >= -RV && ty >= -RV && tx < RV && ty < RV ? k[(ty + RV) * WV + tx + RV] : Gm.codigo(tx, ty, seed, null) & 3);
      const props = [];
      for (let cy = -RV / N; cy < RV / N; cy++) for (let cx = -RV / N; cx < RV / N; cx++) props.push(...objetos(G, seed, cx, cy));
      const solido = new Uint8Array(WV * WV);
      for (const p of props) if (SOLIDO.has(p.type)) solido[(p.ty + RV) * WV + p.tx + RV] = 1;
      // D. Estructura (sin el radio 20 del claro).
      const dW = distancia(k, v => v === 1);
      let n = 0, w = 0, l = 0, pas = 0, pasL = 0, fl = 0, lejos = 0;
      for (let j = 1; j < WV - 1; j++) for (let i = 1; i < WV - 1; i++) {
        const x = i - RV, y = j - RV;
        if (x * x + y * y < 400) continue;
        n++;
        const o = j * WV + i, v = k[o];
        if (v === 1) { w++; continue; }
        if (v === 2) { l++; continue; }
        fl++;
        if (dW[o] >= 4) lejos++;
        const P = (a, b) => k[o + b * WV + a] === 1, O = (a, b) => k[o + b * WV + a] !== 0;
        if ((P(-1, 0) && P(1, 0) && !P(0, -1) && !P(0, 1)) || (P(0, -1) && P(0, 1) && !P(-1, 0) && !P(1, 0))) pas++;
        if ((O(-1, 0) && O(1, 0) && !O(0, -1) && !O(0, 1)) || (O(0, -1) && O(0, 1) && !O(-1, 0) && !O(1, 0))) pasL++;
      }
      const alc = [alcanzable(o => k[o] === 1), alcanzable(o => k[o] !== 0), alcanzable(o => k[o] !== 0 || solido[o])];
      // Suelo encerrado (en la 3.ª, la casilla de un sólido no cuenta: es el sólido).
      const bolsas = alc.map((a, m) => { let b = 0; for (let o = 0; o < k.length; o++) if (k[o] === 0 && !a[o] && !(m === 2 && solido[o])) b++; return b; });
      // F. Objetos: recuentos y reglas.
      const cuenta = {};
      for (const p of props) cuenta[p.type] = (cuenta[p.type] || 0) + 1;
      const pos = new Set(props.filter(p => SOLIDO.has(p.type)).map(p => p.tx + ',' + p.ty));
      let vecinos = 0, aDos = 0, sinHueco = 0, enCruce = 0;
      for (const p of props) {
        const s = cod[(p.ty + RV) * WV + p.tx + RV] >> 2;
        if (kAt(p.tx, p.ty) !== 0 || CRUCE.has(s) || (p.type === 'grass' && SIN_HIERBA.has(s))) enCruce++;
        if (!SOLIDO.has(p.type)) continue;
        for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) {
          if ((!a && !b) || !pos.has((p.tx + a) + ',' + (p.ty + b))) continue;
          if (Math.abs(a) <= 1 && Math.abs(b) <= 1) vecinos++; else if (!a || !b) aDos++;
        }
        if (![-1, 0, 1].every(b => [-1, 0, 1].every(a => kAt(p.tx + a, p.ty + b) === 0))) sinHueco++;
      }
      const fueraDeRango = Object.entries(RANGOS).filter(([ty, [lo, hi]]) => (cuenta[ty] || 0) < lo * 0.85 || (cuenta[ty] || 0) > hi * 1.15).map(([ty]) => ty + ' ' + (cuenta[ty] || 0));
      const hierba = 100 * (cuenta.grass || 0) / (WV * WV);
      if (hierba < HIERBA[0] * 0.85 || hierba > HIERBA[1] * 1.15) fueraDeRango.push('hierba ' + hierba.toFixed(1) + ' %');
      if (fueraDeRango.length || vecinos || aDos || sinHueco || enCruce) objMal.push({ seed, fueraDeRango, vecinos: vecinos / 2, aDos: aDos / 2, sinHueco, enCruce });
      est.push({ seed, pared: 100 * w / n, liq: 100 * l / n, pas, pasL, lejos: 100 * lejos / fl, bolsas, cuenta, hierba });
      // G. Aparición, con world.js de verdad (isFree con terreno y objetos): el jugador en suelo alcanzable sin objeto sólido.
      const Wd = G.World, rnd = xorshift(seed * 7 + 1), muestras = [];
      Wd.reset(seed); Wd.setBiome(0, true);
      for (let m = 0; m < 1400; m++) {
        const tx = Math.floor((rnd() - 0.5) * 2 * (RV - 40)), ty = Math.floor((rnd() - 0.5) * 2 * (RV - 40)), o = (ty + RV) * WV + tx + RV;
        if (k[o] === 0 && alc[0][o] && !solido[o]) muestras.push([tx, ty]);
      }
      muestras.sort((a, b) => Math.floor(a[1] / N) - Math.floor(b[1] / N) || Math.floor(a[0] / N) - Math.floor(b[0] / N));   // por chunks: la caché de world.js no da vueltas
      const anillo = (px, py, outer) => {
        const ang = rnd() * 6.2832;
        for (let i = 0; i < 8; i++) { const a = ang + (i === 0 ? 0 : rnd() * 1.8 - 0.9), d = outer + 10 + rnd() * 60; if (Wd.isFree(px + Math.cos(a) * d, py + Math.sin(a) * d * 0.9, 14)) return true; }
        return false;
      };
      for (const [tx, ty] of muestras) {
        const px = tx * TS + TS / 2, py = ty * TS + TS / 2;
        ap.n++;
        if (anillo(px, py, OUT_ESC)) ap.esc++;
        if (anillo(px, py, OUT_MOV)) ap.mov++;
        for (let i = 0; i < 24; i++) { const a = rnd() * 6.2832, d = 380 + rnd() * 180; if (Wd.isFree(px + Math.cos(a) * d, py + Math.sin(a) * d * 0.85, 22)) { ap.grieta++; break; } }
        for (let i = 0; i < 12; i++) { const a = rnd() * 6.2832, d = 230 + rnd() * 70; if (Wd.isFree(px + Math.cos(a) * d, py + Math.sin(a) * d * 0.8, 14)) { ap.ladron++; break; } }
        let at = null, to = null;
        for (let i = 0; i < 20 && !at; i++) { const a = rnd() * 6.2832, d = 220 + rnd() * 80, x = px + Math.cos(a) * d, y = py + Math.sin(a) * d * 0.8; if (Wd.isFree(x, y, 16)) at = [x, y]; }
        for (let i = 0; i < 30 && at && !to; i++) { const a = rnd() * 6.2832, d = 700 + rnd() * 150, x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d * 0.85; if (Wd.isFree(x, y, 30)) to = [x, y]; }
        if (at && to) ap.perdido++;
      }
    }
    const media = c => est.reduce((s, e) => s + e[c], 0) / est.length, f1 = v => v.toFixed(1);
    t(`estructura en 4 semillas × 384² casillas: pared ${est.map(e => f1(e.pared)).join(' / ')} % (4-9,5; media ${f1(media('pared'))}, 5,5-7,5), líquido ${est.map(e => f1(e.liq)).join(' / ')} % (5-11; media ${f1(media('liq'))}, 6,5-9)`,
      est.every(e => e.pared >= 4 && e.pared <= 9.5 && e.liq >= 5 && e.liq <= 11) && media('pared') >= 5.5 && media('pared') <= 7.5 && media('liq') >= 6.5 && media('liq') <= 9, est.map(e => [e.seed, f1(e.pared), f1(e.liq)]));
    t(`estructura: pasillos de 1 casilla (entre paredes / entre paredes o líquido) ${est.map(e => e.pas + '/' + e.pasL).join(', ')} (≤ 2), ningún suelo encerrado por paredes, por paredes y líquido ni por paredes, líquido y objetos sólidos, y suelo a 4 casillas o más de una pared: ${est.map(e => f1(e.lejos)).join(' / ')} % (media ≥ 75)`,
      est.every(e => e.pas <= 2 && e.pasL <= 2 && e.bolsas.every(b => !b)) && media('lejos') >= 75, est.map(e => ({ seed: e.seed, pas: e.pas, pasL: e.pasL, bolsas: e.bolsas })));
    t(`objetos por 147.456 casillas dentro de los rangos del §6 ±15 % (árboles ${est.map(e => e.cuenta.tree || 0).join('/')}, hierba ${est.map(e => f1(e.hierba)).join('/')} %, rocas ${est.map(e => e.cuenta.rock || 0).join('/')}, cofres ${est.map(e => e.cuenta.chest || 0).join('/')}, trampas ${est.map(e => e.cuenta.trap || 0).join('/')}, manantiales ${est.map(e => e.cuenta.spring || 0).join('/')}, altares ${est.map(e => e.cuenta.altar || 0).join('/')}, cofres grandes ${est.map(e => e.cuenta.bigchest || 0).join('/')}); ningún sólido junto a otro ni a 2 en línea, todos con 3×3 de suelo, nada en vados, puentes, puertos, calzadas, pretiles ni la plaza (ni hierba en losas)`,
      !objMal.length, objMal);
    const pc = v => (100 * v / Math.max(1, ap.n)).toFixed(2);
    t(`aparición con world.js (isFree con terreno y objetos), ${ap.n} sitios: anillo de spawner.js ${pc(ap.esc)} % en escritorio y ${pc(ap.mov)} % en el móvil (≥ 99,5), grieta ${pc(ap.grieta)} % (≥ 99,9), ladrón ${pc(ap.ladron)} % y Pokémon perdido con destino ${pc(ap.perdido)} % (≥ 99)`,
      ap.n >= 3000 && ap.esc >= 0.995 * ap.n && ap.mov >= 0.995 * ap.n && ap.grieta >= 0.999 * ap.n && ap.ladron >= 0.99 * ap.n && ap.perdido >= 0.99 * ap.n, ap);
  } catch (e) { t('estructura, objetos y aparición', false, String(e && e.stack || e)); }

  // ---- E. El claro de salida ----
  try {
    const W = G.World, malos = [];
    for (let k = 0; k < 20; k++) {
      const seed = 101 + 97 * k;
      W.reset(seed); W.setBiome(0, true);
      let suelo = true;
      for (let ty = -9; ty <= 9; ty++) for (let tx = -9; tx <= 9; tx++) if (tx * tx + ty * ty < 81 && W.kindAt(tx * TS + 16, ty * TS + 16) !== 'floor') suelo = false;
      const ps = W.visibleProps(camaraTodo(-16, -16, 32, 32));
      const cerca = ps.filter(p => p.tx * p.tx + p.ty * p.ty < 49).map(clave), inter = ps.filter(p => INTER.has(p.type) && p.tx * p.tx + p.ty * p.ty <= 144).map(clave);
      const libre = [-51, -17, 17, 51].every(x => W.isFree(x, 0, 26));
      if (!suelo || cerca.length || inter.length || !libre) malos.push({ seed, suelo, cerca, inter, libre });
    }
    t('el claro de salida en 20 semillas: suelo a menos de 9 casillas, ningún objeto a menos de 7, ningún interactivo a 12 o menos y sitio (isFree con radio 26) donde aparecéis, de x = −51 a 51', !malos.length, malos.slice(0, 3));
  } catch (e) { t('claro de salida', false, String(e && e.stack || e)); }

  // ---- H. Arenas: las 18 en 40 posiciones, sus objetos y el mundo real ----
  try {
    const TT = G.Tiles, tipos = TT.ARENA_TYPES, QUEMA = new Set(['lava', 'poison', 'spark']), SEM = 4242, R = 13, D = 2 * R + 1, malos = [], peor = {};
    const pasillo = (lx, ly) => (Math.abs(lx) <= 2 && ly >= -6 && ly <= 5) || lx * lx + ly * ly < 6.25;
    // Las mismas 40 posiciones por tipo que midió el prototipo de la especificación (final/arenas.js, por familias).
    const ORDEN = ['normal', 'fighting', 'steel', 'flying', 'fire', 'water', 'ice', 'electric', 'psychic', 'dragon', 'grass', 'bug', 'fairy', 'poison', 'ground', 'rock', 'ghost', 'dark'];
    tipos.forEach(type => {
      const idx = ORDEN.indexOf(type), quema = QUEMA.has(TT.BIOMES[TT.arenaBiome(type)].liquid);
      const p = { suelo: Infinity, pared: 0, liq: 0, pasillo: 0, fuera: 0, inalcanzable: 0, pinzas: 0, legendario: true, muro: 0 };
      for (let k = 0; k < 40; k++) {
        const a = arenaDe(G, type, 5000 + k * 97 + idx * 13, 7000 - k * 53), g = new Uint8Array(D * D);
        for (let ly = -R; ly <= R; ly++) for (let lx = -R; lx <= R; lx++) g[(ly + R) * D + lx + R] = Gm.codigo(a.tx + lx, a.ty + ly, SEM, a) & 3;
        const K = (lx, ly) => (Math.abs(lx) > R || Math.abs(ly) > R ? 1 : g[(ly + R) * D + lx + R]);
        const tapa = (lx, ly) => { const v = K(lx, ly); return v === 1 || (quema && v === 2); };
        let suelo = 0, pared = 0, liq = 0;
        for (let ly = -R; ly <= R; ly++) for (let lx = -R; lx <= R; lx++) {
          const v = K(lx, ly), q = lx * lx + ly * ly;
          if (pasillo(lx, ly) && v !== 0) p.pasillo++;
          if (q >= 121) { if (v === 0) p.fuera++; continue; }
          if (v === 0) {
            suelo++;
            if ((tapa(lx - 1, ly) && tapa(lx + 1, ly) && !tapa(lx, ly - 1) && !tapa(lx, ly + 1)) || (tapa(lx, ly - 1) && tapa(lx, ly + 1) && !tapa(lx - 1, ly) && !tapa(lx + 1, ly))) p.pinzas++;
          } else if (v === 2) liq++; else pared++;
        }
        const vistos = new Set(['0,3']), cola = [[0, 3]];
        while (cola.length) {
          const [x, y] = cola.pop();
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy, kk = xx + ',' + yy; if (!vistos.has(kk) && !tapa(xx, yy)) { vistos.add(kk); cola.push([xx, yy]); } }
        }
        for (let ly = -R; ly <= R; ly++) for (let lx = -R; lx <= R; lx++) if (K(lx, ly) === 0 && !vistos.has(lx + ',' + ly)) p.inalcanzable++;
        if (!vistos.has('0,-4') || !vistos.has('0,-3')) p.legendario = false;
        const tot = suelo + pared + liq;
        p.suelo = Math.min(p.suelo, suelo); p.pared = Math.max(p.pared, 100 * pared / tot); p.liq = Math.max(p.liq, 100 * liq / tot);
        // Pared desde el borde hasta 32 casillas: ni terreno normal ni nada transitable (en 2 de las 40).
        if (k < 2) for (let ly = -31; ly <= 31; ly++) for (let lx = -31; lx <= 31; lx++) { const q = lx * lx + ly * ly; if (q >= 121 && q < 1024 && (Gm.codigo(a.tx + lx, a.ty + ly, SEM, a) & 3) !== 1) p.muro++; }
      }
      peor[type] = p;
      if (p.pasillo || p.fuera || p.inalcanzable || p.pinzas || !p.legendario || p.muro || p.suelo < 245 || p.pared > 25 || p.liq > 19) malos.push(Object.assign({ type }, p));
    });
    const suelos = Object.values(peor).map(p => p.suelo), maxDe = c => Math.max(...Object.values(peor).map(p => p[c])).toFixed(1);
    t(`arenas: las 18 en 40 posiciones con el pasillo libre, nada de suelo desde el radio 11 y pared hasta el 32, todo el suelo alcanzable desde la entrada (el líquido que quema, cerrado) con el legendario en (0, −4), sin pasillos de 1, pared ≤ ${maxDe('pared')} % (25), líquido ≤ ${maxDe('liq')} % (19) y ${Math.min(...suelos)}-${Math.max(...suelos)} casillas de suelo (≥ 245)`,
      !malos.length && tipos.every(ty => ORDEN.includes(ty)), malos.slice(0, 4));
    // Sus objetos: sólo árboles, rocas y hierba dentro (fuera del pasillo y con 3×3 de suelo los sólidos), nada más hasta r + 40.
    const objMalos = [], fijos = {};
    tipos.forEach((type, idx) => {
      const a = arenaDe(G, type, 6000 + idx * 211, 6400), ps = [];
      for (let cy = Math.floor((a.ty - 51) / N); cy <= Math.floor((a.ty + 51) / N); cy++) for (let cx = Math.floor((a.tx - 51) / N); cx <= Math.floor((a.tx + 51) / N); cx++)
        for (const p of objetos(G, SEM, cx, cy, a)) { const lx = p.tx - a.tx, ly = p.ty - a.ty; if (lx * lx + ly * ly < 51 * 51) ps.push([p, lx, ly]); }
      const mal = ps.filter(([p, lx, ly]) => !['tree', 'rock', 'grass'].includes(p.type) || lx * lx + ly * ly >= 121 || pasillo(lx, ly) ||
        (SOLIDO.has(p.type) && [-1, 0, 1].some(b => [-1, 0, 1].some(c => (Gm.codigo(p.tx + c, p.ty + b, SEM, a) & 3) !== 0))));
      fijos[type] = ps.filter(([p]) => p.type !== 'grass').length;
      if (mal.length) objMalos.push({ type, mal: mal.slice(0, 3).map(([p]) => clave(p)) });
    });
    t(`arenas: dentro sólo árboles, rocas y hierba (nunca en el pasillo; los sólidos con 3×3 de suelo) y nada más hasta r + 40; los fijos del §7 salen (claro: ${fijos.grass}/${fijos.fairy} árboles; plataforma, cañones y callejón: ${fijos.flying}/${fijos.ground}/${fijos.rock}/${fijos.dark} rocas)`,
      !objMalos.length && fijos.grass >= 1 && fijos.fairy >= 1 && fijos.flying >= 1 && fijos.ground >= 1 && fijos.rock >= 1 && fijos.dark >= 1, { objMalos, fijos });
    // Con world.js de verdad: setArena, kindAt, walkable, isFree y collide, coherentes con G.Mapas.
    const W = G.World, inco = [];
    tipos.forEach((type, idx) => {
      W.reset(SEM); W.setArena({ tx: 9000 + idx * 200, ty: 9000, r: 11, type }); W.setBiome(TT.arenaBiome(type), true);
      const a = W.arena, ax = a.tx * TS + TS / 2, ay = a.ty * TS + TS / 2;
      let distinto = 0, transitable = 0, encajado = 0;
      for (let ly = -31; ly <= 31; ly++) for (let lx = -31; lx <= 31; lx++) {
        const q = lx * lx + ly * ly;
        if (q >= 1024) continue;
        const tx = a.tx + lx, ty = a.ty + ly, kk = KIND[Gm.codigo(tx, ty, SEM, a) & 3];
        if (W.kindAt(tx * TS + 16, ty * TS + 16) !== kk) distinto++;
        if (q >= 121 && W.walkable(tx, ty)) transitable++;
        if (q < 121 && kk === 'floor') { const e = { x: tx * TS + 16, y: ty * TS + 16, r: 12 }; W.collide(e); if (W.kindAt(e.x, e.y) === 'wall') encajado++; }
      }
      const sitios = [1, 2, 3, 4].flatMap(n => [...Array(n)].map((_, i) => [ax + (i - (n - 1) / 2) * 34, ay + TS * 3]));
      const libres = sitios.every(([x, y]) => W.isFree(x, y, 24) && !W.collide({ x, y, r: 24 })) && W.isFree(ax, ay - TS * 3.5, 22);
      if (distinto || transitable || encajado || !libres) inco.push({ type, distinto, transitable, encajado, libres });
    });
    t('arenas en el mundo de verdad (setArena, kindAt, walkable, isFree y collide de world.js): lo mismo que G.Mapas.codigo hasta 31 casillas, nada transitable desde el radio 11, collide nunca deja a nadie dentro de una pared, y sitio para 1-4 jugadores (radio 24) y el legendario donde los pone rift.js',
      !inco.length, inco.slice(0, 4));
  } catch (e) { t('arenas', false, String(e && e.stack || e)); }

  // ---- I. Paletas: campos, legibilidad y que no se parezcan ----
  try {
    const TT = G.Tiles, U = N0.G.Tiles, B = TT.BIOMES, HEX = /^#[0-9a-f]{6}$/i;
    const BASE = { name: 's', liquid: 's', prop: 's', floor: 3, dirt: 3, speck: 1, light: 1, flowers: 3, wallTop: 3, wallLight: 1, wallEdge: 1, wallFace: 2, wallFaceDark: 1,
      liq: 1, liqDeep: 1, foam: 1, shore: 1, leaf: 4, trunk: 2, rock: 3, grass: 3 };
    const PINTOR = { sueloMat: 's', paredMat: 's', motivo: 's', senda: 3, vado: 3, puente: 3, cauce: 2, losa: 3, ruina: 3, acento: 1 };
    const mal = (b, campos) => Object.entries(campos).filter(([k, n]) => (n === 's' ? typeof b[k] !== 'string' || !b[k] : n === 1 ? !HEX.test(b[k])
      : !(Array.isArray(b[k]) && b[k].length === n && b[k].every(h => HEX.test(h))))).map(([k]) => k);
    const incompletos = B.map((b, i) => [i, mal(b, i < 3 ? Object.assign({}, BASE, PINTOR) : BASE)]).filter(x => x[1].length);
    const LIQ = [...(/const LIQ = \{([\s\S]*?)\r?\n {2}\};/.exec(rd('js/world/world.js')) || ['', ''])[1].matchAll(/^\s*(\w+):/gm)].map(m => m[1]);
    const KINDS = G.Weather.KINDS, temas = TT.ARENA_TYPES.map(k => [k, TT.ARENA_THEMES[k]]);
    const liquidos = B.filter(b => !LIQ.includes(b.liquid)).map(b => b.name), climas = temas.filter(([, a]) => a.weather != null && !(a.weather in KINDS)).map(([k]) => k);
    const comoAntes = temas.filter(([k, a]) => a.liquid !== U.ARENA_THEMES[k].liquid || (a.weather || null) !== (U.ARENA_THEMES[k].weather || null)).map(([k]) => k);
    const temasMal = temas.filter(([, a]) => mal(a, { name: 's', liquid: 's', prop: 's', familia: 's', variante: 's', sueloMat: 's', paredMat: 's', floor: 1, wall: 1, liq: 1, leaf: 1, trunk: 1, grass: 1, rock: 1, flowers: 3 }).length).map(([k]) => k);
    // Y cada campo que tenga el del proyecto base: si upstream añade uno (a un bioma, a una arena o a su tema), hay que llevarlo a mapas-datos.js.
    // foam es opcional en los temas de upstream (sin él, arenaBiome lo deriva del líquido): las arenas «auto» no lo llevan.
    const sinCampo = (nuevos, base) => base.map((b, i) => [i, Object.keys(b || {}).filter(k => !(k in (nuevos[i] || {})) && !(k === 'foam' && !('liqDeep' in b)))]).filter(x => x[1].length);
    const faltan = sinCampo(B, U.BIOMES).concat(sinCampo(TT.ARENA_TYPES.map(k => TT.ARENA_THEMES[k]), U.ARENA_TYPES.map(k => U.ARENA_THEMES[k])).map(([i, ks]) => ['tema ' + TT.ARENA_TYPES[i], ks]));
    t(`paletas: los 21 BIOMES con todos sus campos en hex válido (los 3 biomas, también los del pintor: senda, vado, puente, cauce, losa, ruina, acento y materiales) y con cada campo de los del proyecto base, las 18 arenas con los suyos (y los de su tema de upstream), líquidos de world.js (${LIQ.join(', ')}), climas de weather.js y, en las arenas, el líquido y el clima del proyecto base (el equilibrio no cambia)`,
      LIQ.length >= 6 && !incompletos.length && !faltan.length && !temasMal.length && !liquidos.length && !climas.length && !comoAntes.length, { incompletos, faltan, temasMal, liquidos, climas, comoAntes });
    const DISPARO = '#ff2440', NEGRO = '#181818', sup = [];
    for (let i = 0; i < 3; i++) {
      const b = B[i];
      for (const [k, n] of [['floor', 3], ['dirt', 3], ['senda', 2], ['losa', 2], ['cauce', 1]]) b[k].slice(0, n).forEach(h => sup.push([b.name + ' ' + k, h]));
    }
    for (const [k, a] of temas) sup.push(['arena ' + k, a.floor]);
    const Ls = sup.map(([, h]) => lab(h)[0]), cs = sup.map(([, h]) => contraste(h, NEGRO)), ds = sup.map(([, h]) => de00(h, DISPARO)), dl = B.map(b => de00(b.liq, DISPARO));
    const fuera = sup.filter((s, i) => Ls[i] < 36 || Ls[i] > 56 || cs[i] < 2.5 || ds[i] < 28).map(([n, h]) => n + ' ' + h);
    const f1 = v => v.toFixed(1);
    t(`legibilidad: las ${sup.length} superficies de suelo con L* ${f1(Math.min(...Ls))}-${f1(Math.max(...Ls))} (36-56), contraste frente a #181818 ≥ ${Math.min(...cs).toFixed(2)} (2,5) y ΔE00 frente al disparo #ff2440 ≥ ${f1(Math.min(...ds))} (28); los 21 líquidos a ΔE00 ≥ ${f1(Math.min(...dl))} del disparo (30)`,
      sup.length === 51 && !fuera.length && Math.min(...dl) >= 30, { fuera, liquidos: B.filter((b, i) => dl[i] < 30).map(b => b.name + ' ' + b.liq) });
    const sueloOrig = [0, 1, 2].map(i => U.BIOMES[i].floor[0]);
    const dBio = [0, 1, 2].map(i => Math.min(...sueloOrig.map(o => de00(B[i].floor[0], o))));
    const dAre = temas.map(([k, a]) => [k, de00(a.floor, U.ARENA_THEMES[k].floor), de00(a.wall, U.ARENA_THEMES[k].wall)]);
    t(`no se parecen: el suelo de cada bioma a ΔE00 ≥ ${f1(Math.min(...dBio))} de los 3 suelos originales (≥ 15) y el suelo y la pared de cada arena a ≥ ${f1(Math.min(...dAre.map(x => Math.min(x[1], x[2]))))} de los de su arena original (≥ 15)`,
      dBio.every(d => d >= 15) && dAre.every(x => x[1] >= 15 && x[2] >= 15), dAre.filter(x => x[1] < 15 || x[2] < 15));
    // El cauce seco no se lee como otra calzada (verificación del 14-10-2026: antes, ΔE00 2,1 / 3,5 / 1,7): las medias de
    // lo pintado (Clásico, sin los 2 px del borde de cada casilla) en sus casillas, 2 semillas × 36 chunks por bioma.
    const GC = reino().G, medias = [];
    for (let bi = 0; bi < 3; bi++) {
      const acc = { [SUB.CAUCE]: [0, 0, 0, 0], [SUB.CALZADA]: [0, 0, 0, 0] };
      for (const seed of [1234, 777]) {
        GC.World.reset(seed);
        for (let cy = -3; cy < 3; cy++) for (let cx = -3; cx < 3; cx++) {
          const px = new Uint32Array(bytes(GC.Mapas.pintar(cx, cy, N, null, null, bi, seed)).buffer), cod = GC.Mapas.capa(cx, cy, seed, null).cod;
          for (let o = 0; o < N * N; o++) {
            const a = (cod[o] & 3) === 0 && acc[cod[o] >> 2], i = o % N, j = o >> 4;
            if (a) for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) {
              const v = px[(j * 16 + y) * 256 + i * 16 + x];
              a[0] += v & 255; a[1] += (v >>> 8) & 255; a[2] += (v >>> 16) & 255; a[3]++;
            }
          }
        }
      }
      const media = a => '#' + a.slice(0, 3).map(v => Math.round(v / a[3]).toString(16).padStart(2, '0')).join('');
      medias.push({ bioma: B[bi].name, cauce: media(acc[SUB.CAUCE]), calzada: media(acc[SUB.CALZADA]), px: [acc[SUB.CAUCE][3], acc[SUB.CALZADA][3]] });
    }
    const dCC = medias.map(m => (m.px[0] && m.px[1] ? de00(m.cauce, m.calzada) : 0));
    t(`el cauce seco no se lee como otra calzada: ΔE00 entre las medias pintadas (Clásico, sin el borde de cada casilla) del cauce y de la calzada de ${dCC.map(f1).join(' / ')} en los 3 biomas (≥ 8)`,
      dCC.every(d => d >= 8), medias);
  } catch (e) { t('paletas', false, String(e && e.stack || e)); }

  // ---- J. Nombres ----
  try {
    const TT = G.Tiles, nombres = [...TT.BIOMES.slice(0, 3).map(b => b.name), ...TT.ARENA_TYPES.map(k => TT.ARENA_THEMES[k].name)];
    const VETADAS = ['Bosque', 'Cueva', 'Volcán', 'Pradera', 'Gruta', 'Selva', 'Central', 'Glaciar', 'Dojo', 'Ciénaga', 'Desierto', 'Pico', 'Templo', 'Colmena', 'Cantera',
      'Cementerio', 'Santuario', 'Callejón', 'Fortaleza', 'Encantado'];
    const largo = Math.max(...nombres.map(n => [...n].length));
    const vetados = nombres.filter(n => VETADAS.some(v => new RegExp('(^|[^\\p{L}])' + v, 'iu').test(n)));
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {};
    c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {};
    vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    const EN = c.G.I18n.t, NE = G.MapasDatos.NOMBRES_EN;
    const sinIngles = nombres.filter(n => !NE[n] || EN(n) !== NE[n] || EN('Grieta · ' + n) !== 'Rift · ' + NE[n]);
    t(`nombres: los 21 (3 biomas y 18 arenas) distintos, de 18 caracteres o menos (el más largo, ${largo}), sin palabras de los del proyecto base (Bosque, Cueva, Volcán, Pradera, Gruta, Callejón…) y con su inglés de verdad (i18n.js y lang-en-mod.js; también «Grieta · …»)`,
      nombres.length === 21 && new Set(nombres).size === 21 && largo <= 18 && !vetados.length && !sinIngles.length, { vetados, sinIngles: sinIngles.map(n => [n, EN(n)]) });
  } catch (e) { t('nombres', false, String(e && e.stack || e)); }

  // ---- K. Pintor: sólo ImageData, determinista, no más lento que el de upstream y la gradación sólo en el suelo ----
  try {
    const Ku = reino({ mapas: null }), Kn = reino();
    const chunks = [];
    for (let cy = -2; cy < 3; cy++) for (let cx = -3; cx < 3; cx++) chunks.push([cx, cy]);
    for (const R of [Ku, Kn]) R.G.World.reset(1234);
    const pinta = (R, cx, cy, bi) => {
      R.G.World.setBiome(bi, true); R.G.World.rehornear();
      const t0 = process.hrtime.bigint(), cv = R.G.World.chunkImage(cx, cy);
      return [Number(process.hrtime.bigint() - t0) / 1e6, cv];
    };
    const hechos = chunks.map(([cx, cy], i) => { pinta(Ku, cx, cy, i % 3); return pinta(Kn, cx, cy, i % 3)[1]; });   // calentar (y la caché de datos)
    const malHechos = hechos.filter(cv => !cv._img || cv._img.width !== 256 || cv._img.height !== 256 || cv._img.data.some((v, o) => (o & 3) === 3 && v !== 255)).length;
    t(`pintor: sólo createImageData y putImageData (${Kn.usos.length ? 'usa también ' + [...new Set(Kn.usos)].join(', ') : 'nada más'}); 30 chunks de 256×256 opacos del todo`, !Kn.usos.length && !malHechos, { usos: [...new Set(Kn.usos)], malHechos });
    const otra = reino();
    otra.G.World.reset(1234);
    const repetidos = chunks.slice(0, 6).reverse().map(([cx, cy], i) => iguales(bytes(pinta(otra, cx, cy, (5 - i) % 3)[1]), bytes(pinta(Kn, cx, cy, (5 - i) % 3)[1])));
    t('pintor determinista: los mismos bytes al repetir y en otro reino, en otro orden', repetidos.every(Boolean), repetidos);
    let razon = Infinity, medidas = null;
    for (let ronda = 0; ronda < 3 && razon > 1; ronda++) {
      const tu = [], tn = [];
      chunks.forEach(([cx, cy], i) => { tu.push(pinta(Ku, cx, cy, i % 3)[0]); tn.push(pinta(Kn, cx, cy, i % 3)[0]); });
      const rz = mediana(tn) / mediana(tu);
      if (rz < razon) { razon = rz; medidas = { upstream: +mediana(tu).toFixed(3), nuevo: +mediana(tn).toFixed(3) }; }
    }
    t(`pintor: mediana de 30 chunks ${medidas.nuevo} ms frente a ${medidas.upstream} ms del paintChunk de upstream en este mismo proceso (×${razon.toFixed(2)}, ≤ 1,0)`, razon <= 1, medidas);
    // Gradación (entorno.js): con Dex, sólo píxeles de casillas de suelo; con Clásico, nada.
    const Ed = reino({ entorno: true, estilo: 'dex' }), EG = Ed.G;
    EG.World.reset(1234);
    const cand = [];
    for (let cy = -6; cy <= 6 && cand.length < 3; cy++) for (let cx = -6; cx <= 6 && cand.length < 3; cx++) {
      const cod = EG.Mapas.capa(cx, cy, 1234, null).cod;
      let p = 0, l = 0;
      for (let o = 0; o < 256; o++) { if ((cod[o] & 3) === 1) p++; else if ((cod[o] & 3) === 2) l++; }
      if (p > 8 && l > 8) cand.push([cx, cy]);
    }
    const kinds = (tx, ty) => KIND[EG.Mapas.terreno(tx, ty, 1234, null)];
    const conSin = (cx, cy, bi) => { const con = bytes(EG.Mapas.pintar(cx, cy, N, kinds, null, bi, 1234)); const E = EG.Entorno; EG.Entorno = null; const sin = bytes(EG.Mapas.pintar(cx, cy, N, kinds, null, bi, 1234)); EG.Entorno = E; return [con, sin]; };
    // Por píxel (clasesChunk): la máscara de suelo del pintor deja gradar el suelo y los recortes de las esquinas de
    // paredes y líquidos, que enseñan el suelo de al lado, y no los triángulos de líquido de las orillas (casillas de suelo).
    const cuenta = { suelo: [0, 0], triangulo: [0, 0], recorte: [0, 0], recPared: [0, 0], recLiq: [0, 0], otro: [0, 0] };   // [píxeles, gradados]
    let mascara = true;
    for (const [cx, cy] of cand) {
      const clases = clasesChunk(SUB, (tx, ty) => EG.Mapas.codigo(tx, ty, 1234, null), cx, cy);
      for (const bi of [0, 1, 2]) {
        const [con, sin] = conSin(cx, cy, bi);
        for (let p = 0; p < 256 * 256; p++) {
          const o = p * 4, dif = con[o] !== sin[o] || con[o + 1] !== sin[o + 1] || con[o + 2] !== sin[o + 2], cl = clases[p];
          const de = cl !== 'recorte' ? [cuenta[cl]] : [cuenta.recorte, kinds(cx * N + ((p & 255) >> 4), cy * N + (p >> 12)) === 'wall' ? cuenta.recPared : cuenta.recLiq];
          for (const c of de) { c[0]++; if (dif) c[1]++; }
        }
      }
      // La máscara que entrega el pintor (Pix.suelo, la que lee gradar) dice lo mismo, píxel a píxel.
      let P = null;
      const gradar = EG.Entorno.gradar;
      EG.Entorno.gradar = (px) => { P = px; };
      try { EG.Mapas.pintar(cx, cy, N, kinds, null, 0, 1234); } finally { EG.Entorno.gradar = gradar; }
      if (!P || typeof P.suelo !== 'function') mascara = false;
      else for (let p = 0; p < 256 * 256 && mascara; p++) if (P.suelo(p & 255, p >> 8) !== (clases[p] === 'suelo' || clases[p] === 'recorte')) mascara = false;
    }
    // Con el mundo Dex (G.MODS.mundoDex, el juego), Clásico gradúa igual que Dex; con mundoDex = false, nada.
    const conDex = cand.map(([cx, cy]) => conSin(cx, cy, 0)[0]);
    EG.Estilo.set('clasico');
    const mundoIgual = cand.every(([cx, cy], i) => iguales(conSin(cx, cy, 0)[0], conDex[i]));
    EG.MODS.mundoDex = false;
    const clasico = cand.every(([cx, cy]) => { const [con, sin] = conSin(cx, cy, 0); return iguales(con, sin); });
    EG.MODS.mundoDex = true;
    const pct = c => Math.round(100 * c[1] / Math.max(1, c[0]));
    t(`gradación de entorno.js sobre el pintor nuevo, por píxel con su máscara de suelo (Pix.suelo, ${mascara ? 'igual a la esperada' : 'DISTINTA de la esperada'}): con Dex, el ${pct(cuenta.suelo)} % del suelo (> 60), el ${pct(cuenta.recPared)} % y el ${pct(cuenta.recLiq)} % de los ${cuenta.recPared[0]} y ${cuenta.recLiq[0]} píxeles de los recortes de las esquinas de paredes y ríos (> 90), y ${cuenta.triangulo[1]} de los ${cuenta.triangulo[0]} de los triángulos de río y ${cuenta.otro[1]} de los ${cuenta.otro[0]} del resto de paredes y ríos (0), en ${cand.length} chunks con paredes y río y los 3 biomas; con Clásico, los mismos que con Dex (mundoDex) y, con mundoDex = false, ninguno`,
      cand.length === 3 && mascara && cuenta.suelo[1] / cuenta.suelo[0] > 0.6 && cuenta.recPared[0] > 0 && cuenta.recPared[1] / cuenta.recPared[0] > 0.9 &&
      cuenta.recLiq[0] > 0 && cuenta.recLiq[1] / cuenta.recLiq[0] > 0.9 && cuenta.triangulo[0] > 0 && !cuenta.triangulo[1] && !cuenta.otro[1] && clasico && mundoIgual, { cand, cuenta, mascara, clasico, mundoIgual });
  } catch (e) { t('pintor', false, String(e && e.stack || e)); }

  // ---- L. Sprites de los objetos ----
  try {
    const TT = G.Tiles, U = N0.G.Tiles;
    const VAR = { tree: [0], rock: [0, 1], grass: [0, 1], chest: [0], bigchest: [0], altar: [0, 1, 2, 3, 4, 5, 6, 7], spring: [0, 1], trap: [0, 1, 2] };
    const img = cv => cv && cv._img;
    const maxU = {};
    for (const ty in VAR) {
      maxU[ty] = [0, 0];
      for (let bi = 0; bi < U.BIOMES.length; bi++) for (const v of VAR[ty]) { const im = img(U.propSprite(bi, ty, v)); maxU[ty] = [Math.max(maxU[ty][0], im.width), Math.max(maxU[ty][1], im.height)]; }
    }
    const grandes = [], sinContorno = [];
    let n = 0, peorY = 0;
    for (let bi = 0; bi < TT.BIOMES.length; bi++) for (const ty in VAR) for (const v of VAR[ty]) {
      const im = img(TT.propSprite(bi, ty, v));
      n++;
      if (!im) { grandes.push(`${bi}/${ty}/${v} sin imagen`); continue; }
      if (im.width > maxU[ty][0] || im.height > maxU[ty][1]) grandes.push(`${bi}/${ty}/${v} ${im.width}×${im.height}`);
      // Borde de la silueta: lo opaco junto a un píxel transparente o a un lado del lienzo; la fila de abajo es el pie (la
      // hierba sale del suelo y ahí no lleva contorno, como en el proyecto base).
      const d = im.data, w = im.width, h = im.height, op = (x, y) => x >= 0 && y >= 0 && x < w && (y >= h || d[(y * w + x) * 4 + 3] > 0);
      let claros = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!op(x, y) || (op(x + 1, y) && op(x - 1, y) && op(x, y + 1) && op(x, y - 1))) continue;
        const o = (y * w + x) * 4, Y = lumRgb(d[o], d[o + 1], d[o + 2]);
        peorY = Math.max(peorY, Y);
        if (Y > 0.06) claros++;
      }
      if (claros) sinContorno.push(`${bi}/${ty}/${v} (${claros} px)`);
    }
    t(`sprites: ${n} (los 21 biomas × todos los objetos y variantes) no más grandes que los del proyecto base por tipo (árbol ${maxU.tree.join('×')}, roca ${maxU.rock.join('×')}…) y con contorno oscuro de 1 px (luminancia del borde ≤ 0,06; la más clara, ${peorY.toFixed(3)})`,
      !grandes.length && !sinContorno.length, { grandes: grandes.slice(0, 6), sinContorno: sinContorno.slice(0, 6) });
    const cuenta = (im, hex) => { const [rr, gg, bb] = hexRgb(hex); let c = 0; for (let o = 0; o < im.data.length; o += 4) if (im.data[o + 3] && im.data[o] === rr && im.data[o + 1] === gg && im.data[o + 2] === bb) c++; return c; };
    const ORBE = ['#ff5f6d', '#5fd4ff', '#ff8ad8', '#ffd23f'], TRAMPA = ['#b45ec4', '#8bd94a', '#ff7b3d'], orbes = [];
    for (const bi of [0, 1, 2, 4]) {
      const sp = [0, 2, 4, 6].map(v => img(TT.propSprite(bi, 'altar', v))), w = sp[0].width, h = sp[0].height;
      // El orbe: la mancha conexa más grande de lo que cambia entre el poder 0 y el 1 (la otra es la runa).
      const dif = new Uint8Array(w * h);
      for (let o = 0; o < w * h; o++) for (let c = 0; c < 4; c++) if (sp[0].data[o * 4 + c] !== sp[1].data[o * 4 + c]) dif[o] = 1;
      let mejor = null;
      const visto = new Uint8Array(w * h);
      for (let o0 = 0; o0 < w * h; o0++) {
        if (!dif[o0] || visto[o0]) continue;
        const pila = [o0], caja = [w, h, -1, -1];
        let tam = 0;
        visto[o0] = 1;
        while (pila.length) {
          const o = pila.pop(), x = o % w, y = (o / w) | 0;
          tam++; caja[0] = Math.min(caja[0], x); caja[1] = Math.min(caja[1], y); caja[2] = Math.max(caja[2], x); caja[3] = Math.max(caja[3], y);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy, oo = yy * w + xx; if (xx >= 0 && yy >= 0 && xx < w && yy < h && dif[oo] && !visto[oo]) { visto[oo] = 1; pila.push(oo); } }
        }
        if (!mejor || tam > mejor.tam) mejor = { tam, caja };
      }
      const cx = mejor ? (mejor.caja[0] + mejor.caja[2] + 1) / 2 : NaN, cy = mejor ? (mejor.caja[1] + mejor.caja[3] + 1) / 2 : NaN;
      const colores = sp.every((im, q) => cuenta(im, ORBE[q]) >= 4), gastado = [1, 3, 5, 7].every(v => cuenta(img(TT.propSprite(bi, 'altar', v)), '#6b7380') >= 4);
      orbes.push({ bi, w, cx, cy, ok: Math.abs(cx - w / 2) <= 1 && Math.abs(cy - 11) <= 1 && colores && gastado, colores, gastado });
    }
    const trampas = [0, 1, 2, 4].every(bi => [0, 1, 2].every(v => cuenta(img(TT.propSprite(bi, 'trap', v)), TRAMPA[v]) >= 8));
    const pozas = [0, 1, 2].every(bi => cuenta(img(TT.propSprite(bi, 'spring', 0)), '#2ba8b8') + cuenta(img(TT.propSprite(bi, 'spring', 0)), '#5fe8d8') >= 8 &&
      cuenta(img(TT.propSprite(bi, 'spring', 1)), '#2f5f68') + cuenta(img(TT.propSprite(bi, 'spring', 1)), '#3a6f7a') >= 8);
    const caja = [0, 1, 2].every(bi => { const im = img(TT.propSprite(bi, 'chest', 0)); return cuenta(im, '#d7263d') >= 2 && cuenta(im, '#62e3dd') >= 2 && cuenta(im, '#f2c443') >= 1; });
    t(`sprites: el orbe del altar centrado donde world.js pinta su halo (x = w/2 ± 1, y = 11 ± 1: ${orbes.map(o => `(${o.cx}, ${o.cy}) de ${o.w}`).join(', ')}) con los 4 colores de interact.js y el gris de gastado; las 3 trampas con su color; el manantial con su agua (cian, y la de agotado); la caja de expedición con su banda roja, la lente de Rotom y el cierre`,
      orbes.every(o => o.ok) && trampas && pozas && caja, { orbes, trampas, pozas, caja });
    const distintos = ['tree', 'rock', 'grass', 'chest'].every(ty => [0, 1, 2].every(bi => !iguales(bytes(TT.propSprite(bi, ty, 0)), bytes(U.propSprite(bi, ty, 0)))));
    const a1 = TT.propSprite(0, 'tree', 0);
    TT.clearProps();
    const a2 = TT.propSprite(0, 'tree', 0);
    t('sprites: árbol, roca, hierba y cofre distintos de los del proyecto base en los 3 biomas; G.Tiles.clearProps vacía también la caché de los nuevos (y vuelve a llenarse igual)',
      distintos && a1 !== a2 && iguales(bytes(a1), bytes(a2)) && TT.propSprite(0, 'tree', 0) === a2, { distintos });
  } catch (e) { t('sprites', false, String(e && e.stack || e)); }

  // ---- M. Fondo de los menús ----
  try {
    const s = Gm.SEMILLA_MENU, RIO = new Set([SUB.RIO_H, SUB.RIO_V, SUB.RIO_D1, SUB.RIO_D2]), sitios = new Set();
    let n = 0, w = 0, l = 0, rio = 0, puente = 0, vado = 0, puerto = 0, cresta = 0;
    for (let y = -16; y <= 16; y++) for (let x = -21; x <= 21; x++) {
      const c = Gm.codigo(x, y, s, null), k = c & 3, sb = c >> 2;
      n++;
      if (k === 1) { w++; if (sb === SUB.CRESTA) cresta++; } else if (k === 2) { l++; if (RIO.has(sb)) rio++; }
      if (sb === SUB.PUENTE) puente++; else if (sb === SUB.VADO) vado++; else if (sb === SUB.PUERTO) puerto++;
      const z = Gm.sitio(x, y, s);
      if (z && z.m <= z.h) sitios.add(z.tipo + '@' + z.cx + ',' + z.cy);
    }
    const pw = 100 * w / n, pl = 100 * l / n;
    t(`fondo de los menús: SEMILLA_MENU = ${s} cumple el criterio del §8 en lo que recorre la cámara (±21 × ±16 casillas): río con agua (${rio}), ${pl.toFixed(1)} % de líquido (5-12) y ${pw.toFixed(1)} % de pared (3-9), puente o vado (${puente}/${vado}), cresta (${cresta}) con puerto (${puerto}) y ${sitios.size} sitio(s)`,
      rio > 0 && pl >= 5 && pl <= 12 && pw >= 3 && pw <= 9 && (puente || vado) && puerto && cresta >= 8 && sitios.size >= 1, [...sitios]);
  } catch (e) { t('fondo de los menús', false, String(e && e.stack || e)); }

  // ---- N. Clima al azar ----
  try {
    const KINDS = Object.keys(G.Weather.KINDS), CL = G.MapasDatos.CLIMA, malos = [];
    T.M.random = xorshift(2026);
    for (let b = 0; b < 3; b++) {
      const n = 20000, cuenta = {}, pesos = CL[b], total = Object.values(pesos).reduce((a, v) => a + v, 0);
      for (let i = 0; i < n; i++) { const k = Gm.climaAlAzar(b); cuenta[k] = (cuenta[k] || 0) + 1; }
      const ajenas = Object.keys(cuenta).filter(k => !(k in pesos) || !KINDS.includes(k));
      const lejos = Object.keys(pesos).filter(k => !KINDS.includes(k) || Math.abs((cuenta[k] || 0) / n - pesos[k] / total) > 0.03);
      if (ajenas.length || lejos.length) malos.push({ b, ajenas, lejos, cuenta });
    }
    const otros = [3, 4, 20].map(b => Gm.climaAlAzar(b)).filter(k => !KINDS.includes(k));
    T.M.random = Math.random;
    t('clima al azar (G.Mapas.climaAlAzar, la primera línea de pick de weather.js): 20.000 tiradas por bioma con Math.random sembrado, sólo climas de G.Weather.KINDS de los pesos de G.MapasDatos.CLIMA y cada uno a ±3 % de su peso; con el índice de una arena, también un clima válido (como upstream, que hace % 3)',
      !malos.length && !otros.length, { malos, otros });
  } catch (e) { t('clima al azar', false, String(e && e.stack || e)); }

  // ---- O. El terreno no depende del bioma (el fundido de world.js y el horno lo dan por hecho) ----
  try {
    const W = G.World, firmas = [];
    for (let b = 0; b < 3; b++) {
      W.reset(1234); W.setBiome(b, true);
      const s = [];
      for (let ty = -48; ty < 48; ty++) for (let tx = -48; tx < 48; tx++) s.push(W.kindAt(tx * TS + 1, ty * TS + 1)[0]);
      firmas.push(s.join('') + '|' + W.visibleProps(camaraTodo(-48, -48, 96, 96)).map(clave).join(';'));
    }
    t('el terreno y los objetos no dependen del bioma: 96×96 casillas iguales en la Vega del Alba, la Helada y la Sulfúrea (§16 D, con los mapas: 0 chunks horneados en el cambio)',
      firmas[0] === firmas[1] && firmas[1] === firmas[2]);
  } catch (e) { t('terreno y bioma', false, String(e && e.stack || e)); }

  // ---- P. setArena olvida lo que la arena cambia (gancho de world.js: G.Mapas.olvidarArena) ----
  // La arena cambia el terreno hasta ARENA_CERCA y quita objetos hasta sinObjetos más la ventana de colocar(), más lejos de
  // lo que olvida upstream (los chunks con el centro a menos de r + 9 + N casillas). Un chunk de esa franja generado antes
  // de abrirse la grieta se quedaba como estaba, y el anfitrión y el invitado, con cachés distintas, veían otra cosa.
  try {
    /** Casillas (kindAt) y objetos (visibleProps) de world.js en w×h casillas desde (x0, y0). */
    const ventana = (Gx, x0, y0, w, h) => {
      const W = Gx.World, s = [];
      for (let ty = y0; ty < y0 + h; ty++) for (let tx = x0; tx < x0 + w; tx++) s.push(W.kindAt(tx * TS + 1, ty * TS + 1)[0]);
      return { terr: s.join(''), props: W.visibleProps(camaraTodo(x0, y0, w, h)).filter(p => p.tx >= x0 && p.tx < x0 + w && p.ty >= y0 && p.ty < y0 + h).map(clave).sort() };
    };
    /** Casillas y objetos distintos entre dos ventanas. */
    const difs = (a, b) => {
      let n = 0;
      for (let i = 0; i < a.terr.length; i++) if (a.terr[i] !== b.terr[i]) n++;
      return n + a.props.filter(p => !b.props.includes(p)).length + b.props.filter(p => !a.props.includes(p)).length;
    };
    // a) ±64 casillas alrededor de la arena, con la zona (±80, cada 8 casillas) generada ANTES de setArena y sin generar.
    let llamadas = 0;
    const antesDespues = (mapas, tx) => {
      const ty = 6002, PRE = reino({ mapas }), POST = reino({ mapas });
      for (const R of [PRE, POST]) {
        if (mapas === false) R.G.Mapas.olvidarArena = () => { llamadas++; };   // con false, el gancho no debe llamarla
        R.G.World.reset(31); R.G.World.setBiome(0, true);
      }
      for (let y = ty - 80; y < ty + 80; y += 8) for (let x = tx - 80; x < tx + 80; x += 8) PRE.G.World.kindAt(x * TS, y * TS);
      for (const R of [PRE, POST]) R.G.World.setArena({ tx, ty, r: 11, type: 'fire' });
      const a = ventana(PRE.G, tx - 64, ty - 64, 128, 128);
      return { d: difs(a, ventana(POST.G, tx - 64, ty - 64, 128, 128)), a };
    };
    const conMapas = [5008, 5011].map(tx => antesDespues(true, tx).d), sin = antesDespues(false, 5008), base = antesDespues(null, 5008);
    t(`setArena olvida lo que la arena cambia: ±64 casillas alrededor de la arena generadas antes de abrirse la grieta dan los mismos códigos y objetos que sin generar (${conMapas.join(' y ')} distintos, con la arena en x = 5008 y 5011); con mapasPropios = false, como upstream (${sin.d} distintos, el mismo mundo que el proyecto base y sin llamar a G.Mapas.olvidarArena)`,
      conMapas.every(d => !d) && !sin.d && !base.d && !difs(sin.a, base.a) && !llamadas, { conMapas, sin: sin.d, base: base.d, igualQueBase: !difs(sin.a, base.a), llamadas });
    // b) Dos grietas en la misma partida: el anfitrión tenía en caché ±40 casillas de la primera y el invitado ±16. Alrededor
    //    de la segunda (±60), lo mismo los dos y lo mismo que un mundo sin nada en caché (olvida también la zona de la primera).
    const A1 = { tx: 6003, ty: 6010, r: 11, type: 'fire' }, dos = [];
    for (const sep of [40, 56, 70]) {
      const H = reino(), I = reino(), F = reino();
      for (const R of [H, I, F]) { R.G.World.reset(777); R.G.World.setArena(Object.assign({}, A1)); }
      ventana(H.G, A1.tx - 40, A1.ty - 40, 80, 80); ventana(I.G, A1.tx - 16, A1.ty - 16, 32, 32);
      const A2 = { tx: A1.tx + sep, ty: A1.ty + 3, r: 11, type: 'water' };
      for (const R of [H, I, F]) R.G.World.setArena(Object.assign({}, A2));
      const [h, i, f] = [H, I, F].map(R => ventana(R.G, A2.tx - 60, A2.ty - 60, 120, 120));
      dos.push(difs(h, i) + difs(h, f) + difs(i, f));
    }
    t(`setArena con dos grietas en la misma partida (la segunda a 40, 56 y 70 casillas; el anfitrión con ±40 casillas de la primera en caché y el invitado con ±16): alrededor de la segunda ven los mismos códigos y objetos, y los de un mundo sin nada en caché (${dos.join(', ')} distintos)`,
      dos.every(d => !d), dos);
  } catch (e) { t('setArena olvida lo que la arena cambia', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  const seg = ((Date.now() - inicio) / 1000).toFixed(1);
  if (!failed.length) ok(`mapas propios: ${r.length} casos bien (${seg} s)`);
  else console.log(`  (mapas propios: ${r.length - failed.length} de ${r.length} bien, ${seg} s)`);
  for (const [name, , detail] of failed) bad(`mapas: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

function multiversoChecks() {
  console.log('24. Multiverso (js/data/multiverso.js): personajes de otros mundos, su banner, sus ataques y nunca de enemigo');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  const BASE_FILES = ['js/core/util.js', 'js/core/mods.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/evolutions.js', 'js/core/sprites.js', 'js/data/moves.js'];
  /** Los ficheros reales en node:vm; `con` = con multiverso.js (en su sitio de dev.html, tras moves.js); `cambia` reescribe un fichero antes de cargarlo. */
  const montar = ({ con = true, extra = [], cambia = {} } = {}) => {
    const c = { console }; c.window = c; c.G = {}; vm.createContext(c);
    for (const f of [...BASE_FILES, ...(con ? ['js/data/multiverso.js'] : []), ...extra]) {
      vm.runInContext(cambia[f] ? cambia[f](rd(f)) : rd(f), c, { filename: f });
    }
    return c;
  };
  const semilla = s => () => { s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  const sembrar = (c, s) => { c.__rnd = semilla(s); vm.runInContext('Math.random = () => __rnd()', c); };
  const pngTam = f => { const b = fs.readFileSync(path.join(ROOT, f)); return b.toString('ascii', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
  let MV = null;
  // ---- A. Datos: la entrada de la Pokédex, sus hojas y su ataque ----
  try {
    const sin = montar({ con: false }).G, c = montar(), G = c.G;
    MV = G.MULTIVERSO;
    const lista = MV.lista();
    t('G.MULTIVERSO: gen 10 «Multiverso» con al menos un personaje, todos con mv, gen 10, número desde 10001 y en G.DEX_BY',
      MV.GEN === 10 && MV.BANNER.gen === 10 && MV.BANNER.name === 'Multiverso' && lista.length >= 1 &&
      lista.every(p => p.mv === true && p.gen === 10 && p.dex >= 10001 && G.DEX_BY[p.dex] === p && !('hojasDe' in p)), lista.map(p => p.dex));
    const rarezas = [...new Set(lista.map(p => p.rarity))];
    t('todos los del Multiverso con la misma rareza, menor que 5: su banner reparte a partes iguales (lo que dice el cartel) aunque su pity nunca vuelva a 0 (para mezclar rarezas, darle su propio sorteo en gacha.js)',
      rarezas.length === 1 && rarezas[0] < 5, rarezas);
    const agu = G.DEX_BY[10001];
    t('Agumon: 10001, Fuego / Dragón, rareza 2, no es inicial ni legendario y empieza con Llama Bebé',
      agu && agu.name === 'Agumon' && agu.types.join() === 'fire,dragon' && agu.rarity === 2 && !agu.starter && !agu.leg && G.Moves.startFor(agu) === 'llama-bebe');
    const sly = G.DEX_BY[10002], caco = G.DEX_BY[10003];
    t('Doom Slayer (10002, Lucha / Acero, empieza con Súper Escopeta) y Cacodemonio (10003, Siniestro / Eléctrico, empieza con Rayo Bola), los dos de DOOM',
      sly && sly.name === 'Doom Slayer' && sly.types.join() === 'fighting,steel' && G.Moves.startFor(sly) === 'super-escopeta' && sly.serie === 'DOOM' &&
      caco && caco.name === 'Cacodemonio' && caco.types.join() === 'dark,electric' && G.Moves.startFor(caco) === 'rayo-bola' && caco.serie === 'DOOM' &&
      lista.every(p => !p.starter && !p.leg));
    const choques = sin.DEX.filter(p => p.dex >= 10001 || p.gen === MV.GEN || p.mv).map(p => p.dex);
    const metaUp = Object.keys(sin.SPRITE_META).map(Number).filter(d => d >= 10001);
    t('upstream no usa ni la generación 10 ni los números desde 10001 (si un merge los trae, hay que mover el Multiverso)', !choques.length && !metaUp.length, { choques, metaUp });
    t('G.DEX crece sólo con los del Multiverso y sin repetidos (cargar multiverso.js dos veces no duplica nada)', (() => {
      const n = G.DEX.length, m = G.Moves.ALL.length;
      vm.runInContext(rd('js/data/multiverso.js'), c, { filename: 'js/data/multiverso.js (otra vez)' });
      return n === sin.DEX.length + lista.length && G.DEX.length === n && G.Moves.ALL.length === m && new Set(G.DEX.map(p => p.dex)).size === G.DEX.length;
    })());
    const malas = [];
    for (const p of lista) {
      const meta = G.SPRITE_META[p.dex];
      for (const [anim, a] of Object.entries(meta.a)) for (const sub of meta.s ? ['', 's/'] : ['']) {
        const f = `assets/pokemon/${p.dex}/${sub}${anim}.png`;
        const tam = ex(f) ? pngTam(f) : null;
        if (!tam || tam[0] !== a.w * a.n || tam[1] !== a.h * a.r) malas.push(`${f}: ${tam ? tam.join('x') : 'falta'} (meta ${a.w * a.n}x${a.h * a.r})`);
      }
    }
    t('las hojas de cada personaje están en assets/pokemon/{dex}/ (y s/ si tiene variocolor) con el tamaño de su G.SPRITE_META', !malas.length, malas);
    const S = G.Sprites;
    const geo = lista.map(p => {
      const meta = G.SPRITE_META[p.dex], A = Object.entries(meta.a);
      return { dex: p.dex, idle: !!meta.a.Idle && !!meta.a.Walk, filas: A.every(([, a]) => a.r === 8 && a.d.length === a.n && a.ax > 0 && a.ax < a.w && a.ay > 0 && a.ay < a.h),
        sh: S.hasShiny(p.dex), radio: S.bodyRadius(p.dex, 1) === S.bodyRadius(4, 1), escala: G.MODS.escalaJugador(p.dex) === 1, flota: S.hovers(p.dex) };
    });
    const FLOTAN = [10003, 10008, 10010];   // el Cacodemonio, Blinky y el Ojo de Cthulhu (Drácula se desliza por el suelo)
    t('geometría propia (META de multiverso.js, la escribe montar.py): las 7 animaciones en 8 direcciones con su ancla dentro, variocolor, el radio y el tamaño de un Pokémon normal (Idle de 32 de ancho, como Charmander), y sólo flotan el Cacodemonio, Blinky y el Ojo de Cthulhu',
      lista.length === 12 && geo.every(g => g.idle && g.filas && g.sh && g.radio && g.escala && g.flota === FLOTAN.includes(g.dex)) && lista.every(p => Object.keys(G.SPRITE_META[p.dex].a).length === 7), geo);
    // La lista que validó Nico el 14-10-2026: [id, nombre, forma, tipo, evolución, lo que pide] (sin evolución, un potenciador).
    const LISTA = {
      10001: [['llama-bebe', 'Llama Bebé', 'projectile', 'fire', 'Mega Llama', 'atk'], ['garra-afilada', 'Garra Afilada', 'melee', 'dragon', 'Brazo Tridente', 'atk'],
        ['escupefuego', 'Escupefuego', 'cone', 'fire', 'Gigadestructor', 'cd'], ['cabezazo', 'Cabezazo', 'dash', 'normal', 'Gran Cuerno', 'hp'],
        ['lluvia-fuego', 'Lluvia de Fuego', 'meteor', 'fire', 'Fuerza de Gaia', 'atk'], ['torbellino', 'Torbellino', 'orbit', 'dragon', 'Gran Tornado', 'spd'],
        ['emblema-valor', 'Emblema del Valor', 'buff', 'dragon']],
      10002: [['super-escopeta', 'Súper Escopeta', 'cone', 'steel', 'Súper Escopeta Maestra', 'cd'], ['lanzacohetes', 'Lanzacohetes', 'projectile', 'fire', 'Ráfaga de Cohetes', 'atk'],
        ['rifle-plasma', 'Rifle de Plasma', 'beam', 'electric', 'BFG 9000', 'atk'], ['motosierra', 'Motosierra', 'melee', 'steel', 'Crisol', 'atk'],
        ['gancho-carne', 'Gancho de Carne', 'dash', 'fighting', 'Gancho Ardiente', 'spd'], ['granada', 'Granada', 'meteor', 'steel', 'Granada de Racimo', 'cd'],
        ['eructo-llamas', 'Eructo de Llamas', 'cone', 'fire', 'Eructo Infernal', 'def'], ['berserker', 'Berserker', 'buff', 'fighting']],
      10003: [['rayo-bola', 'Rayo Bola', 'projectile', 'electric', 'Tormenta Infernal', 'def'], ['mordisco-infernal', 'Mordisco Infernal', 'melee', 'dark', 'Fauces del Abismo', 'atk'],
        ['embestida', 'Embestida', 'dash', 'dark', 'Carga Demoníaca', 'hp'], ['lluvia-bolas', 'Lluvia de Bolas', 'meteor', 'electric', 'Aguacero de Plasma', 'cd'],
        ['mirada-ojo', 'Mirada del Ojo', 'beam', 'dark', 'Ojo del Infierno', 'atk'], ['aura-infernal', 'Aura Infernal', 'aura', 'dark', 'Círculo Infernal', 'rgn'],
        ['pellejo-grueso', 'Pellejo Grueso', 'buff', 'dark']],
      // Segundo lote (15-10-2026): las fichas salen de estudiar a cada uno en su saga.
      10004: [['bala-estelar', 'Bala Estelar', 'projectile', 'normal', 'Bala Penetrante', 'mag'], ['copia-cuchillo', 'Cuchillo', 'boomerang', 'steel', 'Cuchillo Chakram', 'cd'],
        ['copia-espada', 'Espada', 'melee', 'fighting', 'Gran Espada', 'atk'], ['copia-fuego', 'Fuego', 'cone', 'fire', 'Fuego Dragontino', 'spd'],
        ['copia-martillo', 'Martillo', 'melee', 'normal', 'Gran Martillo', 'hp'], ['copia-bomba', 'Bomba', 'mine', 'fire', 'Bomba en Cadena', 'xp'],
        ['superabsorcion', 'Superabsorción', 'aura', 'flying', 'Hipernova', 'rgn'], ['maxi-tomate', 'Maxi Tomate', 'buff', 'normal']],
      10005: [['espada-maestra', 'Espada Maestra', 'melee', 'steel', 'Gran Ataque Circular', 'atk'], ['rayo-espada', 'Rayo de Espada', 'beam', 'fairy', 'Rayo Celestial', 'hp'],
        ['arco-hadas', 'Arco de las Hadas', 'projectile', 'fairy', 'Flecha de Luz', 'xp'], ['bumeran', 'Bumerán', 'boomerang', 'flying', 'Bumerán Tornado', 'mag'],
        ['bomba-mecha', 'Bomba de Mecha', 'mine', 'normal', 'Bomba Remota', 'cd'], ['botas-pegaso', 'Botas de Pegaso', 'dash', 'steel', 'Epona', 'spd'],
        ['fuego-din', 'Fuego de Din', 'nova', 'fire', 'Medallón Bombos', 'atk'], ['escudo-hyliano', 'Escudo Hyliano', 'buff', 'steel']],
      10006: [['rayo-de-poder', 'Rayo de Poder', 'projectile', 'normal', 'Rayo Phazon', 'def'], ['lanzamisiles', 'Lanzamisiles', 'projectile', 'steel', 'Supermisil', 'atk'],
        ['rayo-de-ondas', 'Rayo de Ondas', 'chain', 'electric', 'Látigo de Ondas', 'mag'], ['rayo-de-hielo', 'Rayo de Hielo', 'beam', 'ice', 'Difusor de Hielo', 'atk'],
        ['rayo-de-plasma', 'Rayo de Plasma', 'cone', 'fire', 'Lanzallamas de Plasma', 'cd'], ['bomba-morfosfera', 'Bomba de Morfosfera', 'mine', 'ground', 'Bomba de Energía', 'hp'],
        ['turbosfera', 'Turbosfera', 'dash', 'steel', 'Hiperesfera', 'spd'], ['rayo-recarga', 'Rayo Recarga', 'buff', 'electric']],
      10007: [['waka-waka', 'Waka Waka', 'melee', 'dark', 'Super Pac-Man', 'hp'], ['fruta-bonificacion', 'Fruta de Bonificación', 'projectile', 'grass', 'Llave de Bonificación', 'xp'],
        ['pildora-poder', 'Píldora de Poder', 'buff', 'electric'], ['combo-fantasmas', 'Combo de Fantasmas', 'chain', 'dark', 'Tren de Fantasmas', 'mag'],
        ['boca-riego', 'Boca de Riego', 'turret', 'water', 'Géiser', 'def'], ['rodada-turbo', 'Rodada Turbo', 'dash', 'normal', 'Pac-Man Gigante', 'spd'],
        ['pac-bomba', 'Pac-Bomba', 'nova', 'normal', 'Combo 256', 'cd'], ['rastro-fuego', 'Rastro de Fuego', 'trail', 'fire', 'Pyro', 'atk']],
      10008: [['pandilla-fantasma', 'Pandilla Fantasma', 'orbit', 'dark', 'Pac-Mania', 'xp'], ['persecucion', 'Persecución', 'projectile', 'dark', 'Sombra', 'spd'],
        ['carga-de-toro', 'Carga de Toro', 'dash', 'normal', 'Superfantasma', 'hp'], ['dispersion', 'Dispersión', 'nova', 'dark', 'Cuatro Esquinas', 'cd'],
        ['vuelta-a-casa', 'Vuelta a Casa', 'boomerang', 'ghost', 'Caja de Regeneración', 'rgn'], ['minifantasmas', 'Minifantasmas', 'meteor', 'ghost', 'Platillo Volante', 'atk'],
        ['toque-fantasma', 'Toque Fantasma', 'aura', 'ghost', 'Game Over', 'def'], ['cruise-elroy', 'Cruise Elroy', 'buff', 'dark']],
      10009: [['fuego-infernal', 'Fuego Infernal', 'projectile', 'fire', 'Infierno Oscuro', 'atk'], ['alas-demoniacas', 'Alas Demoníacas', 'melee', 'dark', 'Forma Verdadera', 'hp'],
        ['enjambre-murcielagos', 'Enjambre de Murciélagos', 'dash', 'flying', 'Luna de Murciélagos', 'spd'], ['rayo-fatal', 'Rayo Fatal', 'meteor', 'dark', 'Rayo de Destrucción', 'mag'],
        ['ola-oscuridad', 'Ola de Oscuridad', 'nova', 'dark', 'Megiddo Demoníaco', 'atk'], ['robo-almas', 'Robo de Almas', 'aura', 'ghost', 'Poder de Dominación', 'rgn'],
        ['guadana-muerte', 'Guadaña de la Muerte', 'boomerang', 'ghost', 'Hoz Llameante', 'def'], ['metamorfosis-oscura', 'Metamorfosis Oscura', 'buff', 'dark']],
      10010: [['siervo-de-cthulhu', 'Siervo de Cthulhu', 'projectile', 'psychic', 'Ojos Fantasmales', 'cd'], ['embestida-nocturna', 'Embestida Nocturna', 'dash', 'dark', 'Escudo de Cthulhu', 'def'],
        ['dentellada', 'Dentellada', 'melee', 'dark', 'Espasmatizador', 'atk'], ['embestidas-en-cadena', 'Embestidas en Cadena', 'chain', 'dark', 'El Ojo de Cthulhu', 'spd'],
        ['iris-roto', 'Iris Roto', 'nova', 'psychic', 'Esferas Fantasmales', 'rgn'], ['presencia-maligna', 'Presencia Maligna', 'aura', 'psychic', 'Infierno Inminente', 'xp'],
        ['segunda-forma', 'Segunda Forma', 'buff', 'dark']],
      // Tercer lote (23-10-2026; tools/nico/multiverso/FICHAS.md)
      10011: [['rifle-de-asalto', 'Rifle de Asalto', 'projectile', 'normal', 'Rifle de Batalla', 'cd'], ['aguijoneador', 'Aguijoneador', 'projectile', 'rock', 'Supercombinación', 'mag'],
        ['granada-de-plasma', 'Granada de Plasma', 'meteor', 'fire', 'Cañón de Combustible', 'atk'], ['culatazo', 'Culatazo', 'melee', 'fighting', 'Martillo Gravitatorio', 'hp'],
        ['espada-de-energia', 'Espada de Energía', 'dash', 'fire', 'Espada Duelista', 'spd'], ['rifle-de-precision', 'Rifle de Precisión', 'beam', 'steel', 'Láser Spartan', 'atk'],
        ['warthog', 'Warthog', 'turret', 'ground', 'Scorpion', 'def'], ['sobreescudo', 'Sobreescudo', 'buff', 'electric']],
      10012: [['espadas-del-caos', 'Espadas del Caos', 'melee', 'fire', 'Ciclón del Caos', 'cd'], ['arpon-de-orion', 'Arpón de Orión', 'boomerang', 'fighting', 'Espadas de Atenea', 'atk'],
        ['furia-de-zeus', 'Furia de Zeus', 'projectile', 'electric', 'Ira de Cronos', 'mag'], ['ira-de-poseidon', 'Ira de Poseidón', 'meteor', 'water', 'Diluvio de Poseidón', 'spd'],
        ['mirada-de-medusa', 'Mirada de Medusa', 'beam', 'rock', 'Cabeza de Euríale', 'def'], ['ejercito-de-hades', 'Ejército de Hades', 'orbit', 'ghost', 'Ejército de Esparta', 'hp'],
        ['terremoto-de-atlas', 'Terremoto de Atlas', 'nova', 'ground', 'Tierra Destructiva', 'xp'], ['ira-de-esparta', 'Ira de Esparta', 'buff', 'fighting']]
    };
    const malLista = [];
    for (const [dex, at] of Object.entries(LISTA)) {
      const p = G.DEX_BY[dex], pool = G.Moves.poolFor(p);
      if (JSON.stringify(pool) !== JSON.stringify(at.map(a => a[0])) || pool[0] !== G.Moves.startFor(p)) malLista.push(`${dex}: aprende ${pool.join()}`);
      for (const [id, nombre, kind, ty, evo, need] of at) {
        const m = G.Moves.BY_ID[id], igual = sin.Moves.ALL.find(x => x.kind === kind && x.ups);
        if (!m || m.name !== nombre || m.kind !== kind || m.type !== ty || m.ups !== G.Moves.BY_ID[igual.id].ups || m.maxLvl !== igual.maxLvl || 'evo' in m ||
          JSON.stringify(G.Moves.EVO[id] || null) !== JSON.stringify(evo ? [evo, need] : null) || (evo && !G.Moves.NEED_NAME[need])) malLista.push(id);
      }
    }
    t('cada personaje aprende sólo su lista (poolFor() real, el inicial el primero): 7 de Agumon, 8 del Doom Slayer y 7 del Cacodemonio (validadas por Nico) y las del segundo lote (8 cada uno, 7 el Ojo de Cthulhu), cada uno con su nombre, su forma, su tipo, la escalera de mejoras de su forma y su evolución (Llama Bebé -> Mega Llama, Rifle de Plasma -> BFG 9000, Súper Escopeta -> Súper Escopeta Maestra...); los potenciadores, sin evolución',
      !malLista.length && Object.keys(LISTA).length === 12 && MV.ATAQUES.length === 93, malLista);
    const nuevos = G.Moves.ALL.filter(x => !sin.Moves.BY_ID[x.id]).map(x => x.id);
    const enPool = Object.entries(G.Moves.POOL).filter(([, ids]) => nuevos.some(id => ids.includes(id))).map(([k]) => k);
    const otros = G.DEX.filter(p => !p.mv && G.Moves.poolFor(p).some(id => nuevos.includes(id))).map(p => p.dex);
    const ajenos = lista.flatMap(p => G.Moves.poolFor(p).filter(id => sin.Moves.BY_ID[id]).map(id => p.dex + ':' + id));
    const deDos = nuevos.filter(id => lista.filter(p => p.pool.includes(id)).length !== 1);
    t(`los ${nuevos.length} ataques del Multiverso no entran en ningún pool de tipo ni los aprende ningún Pokémon (${G.DEX.length - lista.length} mirados), ninguno de los del Multiverso aprende un ataque Pokémon y cada uno de los suyos es de un solo personaje`,
      nuevos.length === 93 && !enPool.length && !otros.length && !ajenos.length && !deDos.length, { enPool, otros: otros.slice(0, 5), ajenos, deDos });
    // Control: sin el gancho de poolFor() (moves.js), Agumon aprendería los de Fuego, Dragón y Normal.
    const sinPool = montar({ cambia: { 'js/data/moves.js': s => s.replace(/^\s*if \(mon\.pool\)[^\n]*MOD nico[^\n]*\n/m, '') } }).G;
    const ctrl = sinPool.Moves.poolFor(sinPool.DEX_BY[10001]);
    t(`control: sin el gancho de poolFor() de moves.js, Agumon aprendería ${ctrl.length} ataques Pokémon (la prueba sabe verlo)`,
      ctrl.length > 10 && ctrl.includes('flamethrower') && ctrl.includes('tackle') && !ctrl.includes('garra-afilada'), ctrl);
    // Equilibrio: daño nominal (daño × proyectiles ÷ recarga) y alcance dentro del rango de los ataques Pokémon de su forma;
    // un potenciador, con los números de uno de upstream de la misma estadística.
    const nominal = m => m.dmg * (m.count || 1) / m.cd;
    const alcance = m => ['projectile', 'cone', 'nova'].includes(m.kind) ? m.speed * m.life : m.kind === 'turret' ? m.range : m.radius;   // la torreta, por su alcance (range)
    const fuera = [];
    for (const id of nuevos) {
      const m = G.Moves.BY_ID[id], misma = sin.Moves.ALL.filter(x => x.kind === m.kind);
      if (m.kind === 'buff') {
        if (!misma.some(x => x.stat === m.stat && x.amount === m.amount && x.stacks === m.stacks && x.dur === m.dur && x.cd === m.cd)) fuera.push(id + ': potenciador sin pareja');
        continue;
      }
      for (const [que, f] of [['daño', nominal], ['alcance', alcance]]) {
        const v = f(m), vs = misma.map(f);
        if (!(v >= Math.min(...vs) - 1e-9 && v <= Math.max(...vs) + 1e-9)) fuera.push(`${id}: ${que} ${v.toFixed(1)} fuera de ${Math.min(...vs).toFixed(1)}-${Math.max(...vs).toFixed(1)}`);
      }
    }
    t('equilibrio: el daño nominal (daño × proyectiles ÷ recarga) y el alcance de cada ataque del Multiverso, dentro del rango de los ataques Pokémon de su forma; cada potenciador, con los números de uno de upstream (Danza Dragón, Danza Espada, Fortaleza)',
      !fuera.length, fuera);
    const inst = G.Moves.instance('llama-bebe', 3), base = G.Moves.instance('llama-bebe', 1);
    const evos = nuevos.filter(id => G.Moves.EVO[id]).filter(id => {
      const m = G.Moves.instance(id, 1), e = G.Moves.EVO[id];
      while (G.Moves.levelUp(m));
      const info = G.Moves.evoInfo(m, { [e[1]]: 1 });
      return !(m.lvl === m.def.maxLvl && info && info.ready && info.name === e[0] && G.Moves.evolve(m) && m.name === e[0] && m.evolved);
    });
    t('suben de nivel con su escalera (instance() real: nivel 3 distinto del 1, sin la escalera dentro) y los 67 que evolucionan llegan al máximo y evolucionan (evoInfo() y evolve() reales)',
      inst.lvl === 3 && !('ups' in inst) && JSON.stringify(inst) !== JSON.stringify(base) && nuevos.filter(id => G.Moves.EVO[id]).length === 81 && !evos.length, evos);
  } catch (e) { t('datos del Multiverso', false, String(e && e.stack || e)); }
  // ---- A2. Sus ataques en partida: las cartas de subida de nivel, la mejora «Repertorio» y cómo se ven ----
  try {
    const c = montar({ extra: ['js/systems/levelup.js', 'js/entities/vfx.js'] }), G = c.G;
    sembrar(c, 11);
    /** Un jugador de mentira recién empezado con su ataque inicial (lo que lee candidates() de levelup.js). */
    const jugador = p => ({ mon: p, slots: [[0]], maxMoves: 4, statsTaken: {}, moves: [G.Moves.instance(G.Moves.startFor(p), 1)],
      hasMove(id) { return this.moves.some(m => m.id === id); } });
    const malCartas = [];
    for (const p of G.MULTIVERSO.lista()) {
      const vistos = new Set();
      for (let i = 0; i < 400; i++) for (const k of G.LevelUp.offer(jugador(p))) if (k.type === 'new') vistos.add(k.key.slice(4));
      const esperado = p.pool.filter(id => id !== p.start);
      if ([...vistos].sort().join() !== [...esperado].sort().join()) malCartas.push({ dex: p.dex, vistos: [...vistos], esperado });
    }
    const pk = G.DEX_BY[4], vistosPk = new Set();
    for (let i = 0; i < 400; i++) for (const k of G.LevelUp.offer(jugador(pk))) if (k.type === 'new') vistosPk.add(k.key.slice(4));
    const mvIds = new Set(G.MULTIVERSO.ATAQUES.map(a => a.id));
    t('cartas de subida de nivel (offer() real de levelup.js, 400 subidas de cada uno): un personaje del Multiverso sólo ve ataques nuevos de su lista y le salen todos; Charmander, ninguno del Multiverso',
      !malCartas.length && vistosPk.size > 5 && ![...vistosPk].some(id => mvIds.has(id)), { malCartas, charmander: [...vistosPk] });
    const linea = (rd('js/game.js').match(/const pool = G\.Moves\.poolFor\(mon\)[^\n]*;/) || [])[0];
    const rep = linea ? G.MULTIVERSO.lista().map(p => {
      const pl = jugador(p);
      const pool = vm.runInContext(`(() => { ${linea} return pool; })()`, Object.assign(c, { mon: p, pl }));
      return { dex: p.dex, ok: pool.length > 0 && pool.every(id => p.pool.includes(id) && id !== p.start && G.Moves.BY_ID[id].kind !== 'buff') };
    }) : null;
    t('mejora «Repertorio» (la línea de startRun() de game.js, tal cual): el segundo ataque sale de su lista, sin el inicial ni potenciadores',
      rep && rep.every(x => x.ok), rep || 'no encuentro la línea');
    const vis = id => G.VFX.forMove(G.Moves.instance(id, 1));
    const v = { moto: vis('motosierra'), mordisco: vis('mordisco-infernal'), cohete: vis('lanzacohetes'), mirada: vis('mirada-ojo'), cabezazo: vis('cabezazo'), ascuas: vis('ember'), garra: vis('metal-claw') };
    t('cómo se ven (forMove() real de vfx.js): la motosierra con zarpazo, el mordisco con fauces, el cohete como pedrusco con estela, la mirada como rayo de sombra; sin `vis`, la forma de su tipo; los ataques Pokémon, como upstream',
      v.moto.melee === 'claw' && v.moto.pal === 'steel' && v.mordisco.melee === 'jaws' && v.cohete.proj === 'rock' && v.cohete.trail === 'ember' && v.cohete.pal === 'fire' &&
      v.mirada.beam === 'shadow' && v.cabezazo.proj === 'star' && !v.cabezazo.melee && v.ascuas.proj === 'fire' && v.ascuas.trail === 'ember' && v.garra.melee === 'claw', v);
  } catch (e) { t('ataques en partida', false, String(e && e.stack || e)); }
  // ---- B. Nunca de enemigo: elencos, jefes, hordas y el Pokémon perdido ----
  try {
    const enemigos = (cambia = {}) => {
      const c = montar({ extra: ['js/data/starters.js', 'js/data/enemies.js'], cambia });
      c.G.Events = { bag: () => null };
      sembrar(c, 23);
      return c.G;
    };
    const cuenta = (G, runs) => {
      const mv = new Set(G.DEX.filter(p => p.mv).map(p => p.dex)), vistos = [];
      for (let k = 0; k < runs; k++) {
        const rr = G.Enemies.rollRun() || {};
        for (const tier of rr.cast || G.Enemies.cast) for (const d of tier.list) if (mv.has(d.dex)) vistos.push('elenco ' + d.dex);
        for (const b of rr.bosses || G.Enemies.BOSSES) if (mv.has(b.dex)) vistos.push('jefe ' + b.dex);
      }
      for (const tt of [0, 100, 200, 300, 450, 600]) for (const ty of G.Enemies.hordeTypes(tt)) for (let i = 0; i < 10; i++)
        for (const d of G.Enemies.hordeDefs(ty, tt)) if (mv.has(d.dex)) vistos.push('horda ' + d.dex);
      for (const tt of [0, 100, 200, 300, 450, 600]) if (G.Enemies.hordeTypes(tt).some(p => mv.has(p.dex))) vistos.push('tipo de horda');
      return vistos;
    };
    const vistos = cuenta(enemigos(), 2000);
    // Control: sin los ganchos de enemies.js, Agumon sí saldría (la prueba sabe verlo).
    const sinGancho = s => s.replace(/ && !p\.mv\);(\s*\/\/ MOD nico)/, ');$1').replace(/ && !p\.mv;(\s*\/\/ MOD nico)/, ';$1');
    const control = cuenta(enemigos({ 'js/data/enemies.js': sinGancho }), 2000);
    t(`2.000 runs: ningún personaje del Multiverso en elencos, jefes ni hordas (control sin los ganchos: ${control.length} apariciones)`, !vistos.length && control.length > 0, { vistos: vistos.slice(0, 5), control: control.length });
    const G = enemigos();
    const linea = (rd('js/systems/events.js').match(/const pool = G\.DEX\.filter\(p => [^\n]*?\);(?=\s*\/\/ MOD nico)/) || [])[0];
    const perdidos = linea ? vm.runInContext(`(() => { ${linea} return pool; })()`, Object.assign(vm.createContext({ G: Object.assign(G, { Sprites: Object.assign({}, G.Sprites, { hovers: () => false }) }) }))) : null;
    t('Pokémon perdido (la línea de spawnLost() de events.js, tal cual): sin los del Multiverso', perdidos && perdidos.length > 100 && !perdidos.some(p => p.mv), linea ? perdidos.length : 'no encuentro la línea');
    const leg = G.DEX.filter(p => p.mv && p.leg).map(p => p.dex);
    t('ninguno es legendario: el legendario de la grieta (rift.js, sólo p.leg) nunca es uno de ellos', !leg.length, leg);
  } catch (e) { t('nunca de enemigo', false, String(e && e.stack || e)); }
  // ---- C. El gacha real: su banner y los demás ----
  try {
    const c = montar({ extra: ['js/systems/gacha.js'] }), G = c.G, Ga = G.Gacha;
    sembrar(c, 5);
    t('BANNERS: los 9 de upstream y el Multiverso al final, cada uno en su índice (gacha-ui.js usa BANNERS[gen - 1])',
      Ga.BANNERS.length === 10 && Ga.BANNERS.every((b, i) => b.gen === i + 1) && Ga.BANNERS[9] === G.MULTIVERSO.BANNER, Ga.BANNERS.map(b => b.gen));
    const save = { tickets: { t1: 500, t10: 10000 }, owned: {}, shiny: {}, coins: 0, stats: {}, pity: {} };
    const res = [];
    for (let i = 0; i < 1000; i++) res.push(...Ga.pull(save, 10, 10));
    t('multiversoTicketLila: las 10.000 tiradas del Multiverso gastan 10.000 tickets ×10 (uno cada una) y ningún ticket normal',
      G.MODS.multiversoTicketLila === true && save.tickets.t10 === 0 && save.tickets.t1 === 500 && res.length === 10000, save.tickets);
    // El coste de cada botón, en el Multiverso y en un banner de región (gacha-ui.js: pull(1), pull(10, 't1') y pull(10, 't10')).
    const sv = (t1, t10) => ({ tickets: { t1, t10 }, owned: {}, shiny: {}, coins: 0, stats: {}, pity: {} });
    const gasto = (s, n, gen, use) => { const r = Ga.pull(s, n, gen, use); return r ? [r.length, s.tickets.t1, s.tickets.t10] : null; };
    const costes = {
      mv1: gasto(sv(100, 1), 1, 10), mv1sin: gasto(sv(100, 0), 1, 10), mv10: gasto(sv(100, 10), 10, 10, 't1'), mv10corto: gasto(sv(100, 9), 10, 10, 't1'),
      mv10b: gasto(sv(100, 5), 10, 10, 't10'), kanto1: gasto(sv(3, 3), 1, 1), kanto10: gasto(sv(10, 3), 10, 1, 't1'), kanto10b: gasto(sv(0, 3), 10, 1, 't10')
    };
    t('Multiverso con tickets ×10: la ×1 gasta uno, la ×10 diez (con nueve, nada), sin ninguno no tira y la ×10 «por 1 ticket ×10» no vale; Kanto, como upstream (1 y 10 tickets, o 1 ticket ×10 la ×10)',
      JSON.stringify(costes) === JSON.stringify({ mv1: [1, 100, 0], mv1sin: null, mv10: [10, 100, 0], mv10corto: null, mv10b: null, kanto1: [1, 2, 3], kanto10: [10, 0, 3], kanto10b: [10, 0, 2] }), costes);
    G.MODS.multiversoTicketLila = false;
    const sinAjuste = { mv1: gasto(sv(3, 3), 1, 10), mv10b: gasto(sv(0, 3), 10, 10, 't10') };
    G.MODS.multiversoTicketLila = true;
    t('con multiversoTicketLila = false, el Multiverso cuesta como los demás (costOf() de upstream)', JSON.stringify(sinAjuste) === JSON.stringify({ mv1: [1, 2, 3], mv10b: [10, 0, 2] }), sinAjuste);
    const fuera = res.filter(x => !G.DEX_BY[x.dex].mv);
    const sh = res.filter(x => x.shiny).length / res.length * 100;
    const nuevos = res.filter(x => x.isNew).length, monedas = res.reduce((a, x) => a + x.refund, 0) / res.length;
    const mvs = G.MULTIVERSO.lista().map(p => p.dex), cuantos = mvs.map(d => res.filter(x => x.dex === d).length);
    // Nuevos: el shiny de cada uno y su versión normal, salvo si lo primero que salió de él fue el shiny, que ya
    // lo deja en la colección (gacha.js de upstream). Con diez personajes pasa en ~14 % de las tandas.
    const nuevosEsperados = mvs.length + mvs.filter(d => !res.find(x => x.dex === d).shiny).length;
    t(`10.000 tiradas en el Multiverso: siempre uno suyo, a partes iguales (${cuantos.join(' / ')}); cada uno y su shiny, nuevos una vez (el normal no, si salió antes el shiny); el resto, 300 Pokémonedas (900 un shiny: multiversoRepetidoPorCoste, 30 por cada ticket que vale el ×10); shiny ${sh.toFixed(2)} % (1,2-1,8)`,
      !fuera.length && nuevos === nuevosEsperados && res.every(x => x.isNew ? x.refund === 0 : x.refund === (x.shiny ? 900 : 300)) && sh >= 1.2 && sh <= 1.8 &&
      G.MODS.multiversoRepetidoPorCoste === true &&
      mvs.every(d => save.owned[d] && save.shiny[d]) && cuantos.every(k => Math.abs(k / res.length - 1 / mvs.length) < 0.02), { fuera: fuera.length, nuevos, nuevosEsperados, sh, cuantos });
    // El techo: una tirada ×1 de un banner normal en el que todo sale repetido vale de media 38,25 Pokémonedas (las rarezas
    // de RATES por REFUND; su ×10, con la Épica garantizada, unas 46 por ticket) y cuesta un ticket. La del Multiverso cuesta
    // un ticket ×10, que vale 10 (la ×10 de upstream cuesta 10 tickets o uno ×10): por ticket gastado, menos que ese techo.
    // Ojo: un banner normal poco avanzado paga menos (sus nuevos y los repetidos que desbloquean su evolución no dan
    // monedas, aunque dan Pokémon): ver multiversoRepetidoPorCoste en CLAUDE.md.
    const media = Ga.RATES.reduce((a, [rr, w]) => a + w / 100 * Ga.REFUND[rr], 0), porTicket = monedas / 10;
    t(`por ticket gastado, menos que el techo de un banner normal (todo repetido): ${monedas.toFixed(2)} Pokémonedas por tirada del Multiverso, ${porTicket.toFixed(2)} por ticket (un ticket ×10 vale 10), frente a ${media.toFixed(2)}`,
      porTicket < media && monedas > 10 * Ga.REFUND[2] * 0.9, { monedas, porTicket, media });
    // premio(): sólo en su banner, sólo con el ajuste y según lo que cuesta la tirada.
    const M = G.MULTIVERSO, premios = { mv: M.premio(10, 30), mvSh: M.premio(10, 90), kanto: M.premio(1, 30), kantoSh: M.premio(1, 90) };
    // Con pull() real, partidas que ya los tienen todos (también en shiny) y 3 shiny forzados por tanda: todo es repetido.
    const todosYa = () => Object.fromEntries(mvs.map(d => [d, { at: 1 }]));
    const tanda = (t1, t10) => { Ga.debugForceShiny(3); return Ga.pull(Object.assign(sv(t1, t10), { owned: todosYa(), shiny: todosYa() }), 10, 10, 't1'); };
    const resumen = r => r && r.map(x => (x.shiny ? 's' : '') + x.refund).join(' ');
    G.MODS.multiversoTicketLila = false; premios.mvSinLila = M.premio(10, 30); premios.mvShSinLila = M.premio(10, 90);
    const sinLila = tanda(10, 0);   // sin el ticket lila cuesta tickets normales: 30 por repetido (90 un shiny)
    G.MODS.multiversoTicketLila = true;
    G.MODS.multiversoRepetidoPorCoste = false; premios.mvSinAjuste = M.premio(10, 30); premios.mvShSinAjuste = M.premio(10, 90);
    const sinPremio = tanda(0, 10);
    G.MODS.multiversoRepetidoPorCoste = true;
    const conPremio = tanda(0, 10);
    const pagan = (r, n, sh) => !!r && r.length === 10 && r.filter(x => x.shiny).length >= 3 && r.every(x => !x.isNew && x.refund === (x.shiny ? sh : n));
    t('premio(): en el Multiverso, 300 (900 un shiny) con el ticket ×10; sin multiversoTicketLila, 30 (la tirada cuesta un ticket normal); en Kanto, el de upstream; y con multiversoRepetidoPorCoste = false, 30 (90 un shiny) como upstream; con pull() real y shiny repetidos en las tres',
      JSON.stringify(premios) === JSON.stringify({ mv: 300, mvSh: 900, kanto: 30, kantoSh: 90, mvSinLila: 30, mvShSinLila: 90, mvSinAjuste: 30, mvShSinAjuste: 90 }) &&
      pagan(conPremio, 300, 900) && pagan(sinLila, 30, 90) && pagan(sinPremio, 30, 90),
      { premios, conPremio: resumen(conPremio), sinLila: resumen(sinLila), sinPremio: resumen(sinPremio) });
    const save2 = { tickets: { t1: 20000, t10: 0 }, owned: {}, shiny: {}, coins: 0, stats: {}, pity: {} };
    const otros = [];
    for (let i = 0; i < 900; i++) otros.push(...Ga.pull(save2, 10, 1 + (i % 9)));
    t('9.000 tiradas en los banners de upstream: ninguno del Multiverso, y sus repetidos dan lo de upstream (o su evolución): el premio del Multiverso no los toca',
      !otros.some(x => G.DEX_BY[x.dex].mv) && otros.every(x => x.isNew || x.evo || x.refund === Ga.REFUND[x.rarity] * (x.shiny ? 3 : 1)));
    const evo = G.MODS.evolucionDeRepetido({ owned: { 10001: { at: 1 } }, shiny: {} }, 10001, false);
    t('repetido -> evolución: Agumon no evoluciona (sin entrada en G.EVO), así que da sus Pokémonedas', !evo && !(G.EVO && G.EVO[10001]));
  } catch (e) { t('gacha', false, String(e && e.stack || e)); }
  // ---- D. El cartel del banner y la ficha de la colección (refresh() real de gacha-ui.js con un DOM mínimo) ----
  try {
    const c = montar({ extra: ['js/systems/gacha.js'] }), G = c.G;
    const els = {}, tabs = [];
    const el = id => els[id] || (els[id] = { id, innerHTML: '', textContent: '', disabled: false, style: {}, children: [], dataset: {},
      classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, appendChild(x) { this.children.push(x); if (id === 'gacha-gens') tabs.push(x); return x; },
      get lastChild() { return this.children[this.children.length - 1]; } });
    G.UI = { $: el, show() {}, stars: n => '★'.repeat(n), spriteCanvas: dex => ({ dex }), refreshCoins() {} };
    G.Icons = { html: k => `[${k}]` };
    G.DB = { save: { owned: {}, shiny: {}, pity: {}, tickets: { t1: 0, t10: 0 } }, ownsShiny: () => false };
    const small = { textContent: 'Gen 10' };
    c.document = { getElementById: el, querySelectorAll: () => [], querySelector: q => (/gen-tab\[data-gen="10"\] small/.test(q) ? small : q === '#dex-detail p.center' ? el('nota') : null),
      createElement: () => ({ dataset: {}, className: '', innerHTML: '' }) };
    vm.runInContext(rd('js/ui/gacha-ui.js'), c, { filename: 'js/ui/gacha-ui.js' });
    G.GachaUI.init();
    G.GachaUI.open();
    const enKanto = small.textContent;
    const kantoAntes = [els['cost-1'].innerHTML, els['cost-10'].innerHTML, els['cost-10b'].innerHTML, els['pull-10b'].style.display];
    els['gacha-feat'].innerHTML = ''; els['gacha-feat'].children = [];
    tabs.find(b => +b.dataset.gen === 10).onclick();
    const rates = els['gacha-rates'].innerHTML;
    const btn = () => [els['cost-1'].innerHTML, els['cost-10'].innerHTML, els['pull-10b'].style.display, els['pull-1'].disabled, els['pull-10'].disabled];
    const sinLila = btn();
    G.DB.save.tickets = { t1: 50, t10: 1 }; tabs.find(b => +b.dataset.gen === 10).onclick();
    const conUno = btn();
    G.DB.save.tickets = { t1: 0, t10: 10 }; tabs.find(b => +b.dataset.gen === 10).onclick();
    const conDiez = btn();
    tabs.find(b => +b.dataset.gen === 1).onclick();
    const kantoDespues = [els['cost-1'].innerHTML, els['cost-10'].innerHTML, els['cost-10b'].innerHTML, els['pull-10b'].style.display];
    G.DB.save.tickets = { t1: 0, t10: 0 };
    tabs.find(b => +b.dataset.gen === 10).onclick();
    t('botones del Multiverso (refresh() real): cuestan 1 y 10 tickets ×10, sin el tercero, y se activan según los tickets ×10 (con 50 normales, la ×10 no); al volver a Kanto, los de upstream y el tercero otra vez',
      JSON.stringify(sinLila) === JSON.stringify(['[ticket10] 1', '[ticket10] 10', 'none', true, true]) && JSON.stringify(conUno) === JSON.stringify(['[ticket10] 1', '[ticket10] 10', 'none', false, true]) &&
      JSON.stringify(conDiez) === JSON.stringify(['[ticket10] 1', '[ticket10] 10', 'none', false, false]) &&
      JSON.stringify(kantoDespues) === JSON.stringify(['[ticket] 1', '[ticket] 10', '[ticket10] 1', '']) && kantoAntes[0] === '[ticket] 1' && kantoAntes[3] !== 'none',
      { sinLila, conUno, conDiez, kantoAntes, kantoDespues });
    t('el cartel del Multiverso dice que cada tirada cuesta un ticket ×10', rates.includes('· Cada tirada cuesta un ticket ×10, el lila (la ×10, diez).<br>'), rates);
    t('pestaña del gacha: «Otros mundos» en vez de «Gen 10» desde que se abre el gacha (en Kanto)', enKanto === 'Otros mundos', enKanto);
    t('cartel del Multiverso: título, sus sagas sin repetir, sin el pity de la legendaria y los tres primeros de destacados',
      els['banner-title'].textContent === 'Multiverso' && els['banner-desc'].textContent === 'Personajes de otros mundos que se cuelan en el enjambre: Digimon, DOOM, Kirby, Zelda, Metroid, Pac-Man, Castlevania, Terraria, Halo, God of War.' &&
      els['gacha-pity'].textContent === '' && [10001, 10002, 10003].every(d => els['gacha-feat'].children.some(x => x.dex === d)), { titulo: els['banner-title'].textContent, desc: els['banner-desc'].textContent });
    const pct = +(100 / G.MULTIVERSO.lista().length).toFixed(2) + '%';
    // Con multiversoRepetidoPorCoste apagado (o sin el ticket lila), el cartel vuelve a decir 30.
    const cartelCon = (k, v) => { const antes = G.MODS[k]; G.MODS[k] = v; tabs.find(b => +b.dataset.gen === 10).onclick(); const r = els['gacha-rates'].innerHTML; G.MODS[k] = antes; return r; };
    const ratesSinAjuste = cartelCon('multiversoRepetidoPorCoste', false), ratesSinLila = cartelCon('multiversoTicketLila', false);
    tabs.find(b => +b.dataset.gen === 10).onclick();
    const dice = r => (r.match(/Un repetido da (\d+) Pokémonedas/) || [])[1];
    t(`probabilidades del Multiverso: cada personaje con su ${pct}, el shiny del ajuste (1,5 %), los repetidos a 300 (a 30 sin multiversoRepetidoPorCoste o sin el ticket lila) y sin la Épica de la ×10 ni la Legendaria`,
      G.MULTIVERSO.lista().every(p => rates.includes(`${p.name}</span>\n      <span>${pct}</span>`)) &&
      /\[shiny\] Shiny<\/span><span>1\.5%<\/span>/.test(rates) && rates.includes('· Un repetido da 300 Pokémonedas (un shiny repetido, el triple).') &&
      dice(ratesSinAjuste) === '30' && dice(ratesSinLila) === '30' && dice(els['gacha-rates'].innerHTML) === '300' &&
      !/Épica|Legendaria|Común/.test(rates), { rates, sinAjuste: dice(ratesSinAjuste), sinLila: dice(ratesSinLila) });
    // La ficha de la colección.
    el('nota').innerHTML = 'Aún no lo tienes.<br>Consíguelo en el banner de <b class="gold">Multiverso</b> o derrotándolo cuando salga shiny.';
    G.MULTIVERSO.ficha(10001);
    const sinTener = el('nota').innerHTML;
    el('nota').innerHTML = 'x'; G.MULTIVERSO.ficha(4);
    const pokemon = el('nota').innerHTML;
    G.DB.save.owned[10001] = { at: 1 }; G.MULTIVERSO.ficha(10001);
    t('ficha de la colección: sin tenerlo, «Sólo sale en el banner del Multiverso» (no «derrotándolo cuando salga shiny»); un Pokémon o uno que ya tienes, como upstream',
      sinTener === 'Aún no lo tienes.<br>Sólo sale en el banner del Multiverso, en el gacha.' && pokemon === 'x' && el('nota').innerHTML === 'x', { sinTener, pokemon });
  } catch (e) { t('cartel y ficha', false, String(e && e.stack || e)); }
  // ---- E. Inglés, ganchos, paquete y créditos ----
  try {
    const c = { console, navigator: { language: 'en-US', languages: ['en-US'] }, location: { pathname: '/' },
      localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, confirm: () => true, alert() {} };
    c.CanvasRenderingContext2D = function () {}; c.CanvasRenderingContext2D.prototype = { fillText() {}, strokeText() {}, measureText() {} };
    c.window = c; c.G = {}; vm.createContext(c);
    for (const f of ['js/core/i18n.js', 'js/data/lang-en.js', 'js/data/lang-en-mod.js']) vm.runInContext(rd(f), c, { filename: f });
    const EN = c.G.I18n.t;
    const casos = { 'Multiverso': 'Multiverse', 'Otros mundos': 'Other worlds', 'Llama Bebé': 'Pepper Breath', 'Mega Llama': 'Nova Blast',
      'Personajes de otros mundos que se cuelan en el enjambre: Digimon, DOOM, Kirby, Zelda, Metroid, Pac-Man, Castlevania, Terraria, Halo, God of War.': 'Characters from other worlds who slip into the swarm: Digimon, DOOM, Kirby, Zelda, Metroid, Pac-Man, Castlevania, Terraria, Halo, God of War.',
      'Ojo de Cthulhu': 'Eye of Cthulhu', 'Drácula': 'Dracula', 'Espada Maestra': 'Master Sword', 'Píldora de Poder': 'Power Pellet', 'Fuego Infernal': 'Hellfire',
      'Cacodemonio': 'Cacodemon', 'Súper Escopeta': 'Super Shotgun', 'Rayo Bola': 'Ball Lightning', 'Tormenta Infernal': 'Hellstorm',
      'Escopeta de dos cañones: una ráfaga corta de perdigones que empuja.': 'Double-barrelled shotgun: a short burst of pellets that knocks back.',
      'Escupe una bola de rayos lenta y grande que atraviesa y frena.': 'Spits a big, slow ball of lightning that goes through and slows down.',
      '· Cada tirada trae a uno de estos personajes, todos con la misma probabilidad.': '· Each pull brings one of these characters, all equally likely.',
      '· No hay legendarios, así que tampoco pity.': '· There are no legendaries, so there is no pity either.',
      '· Un repetido da 300 Pokémonedas (un shiny repetido, el triple).': '· A duplicate gives 300 PokéCoins (a shiny duplicate, triple).',
      '· Nunca salen de enemigos: sólo se consiguen aquí.': '· They never show up as enemies: you can only get them here.',
      'Sólo sale en el banner del Multiverso, en el gacha.': 'Only in the Multiverse banner of the gacha.',
      'Escupe una bola de fuego grande al enemigo más cercano. Quema.': 'Spits a big fireball at the nearest enemy. Burns.' };
    const mal = Object.entries(casos).filter(([es, en]) => EN(es) !== en).map(([es]) => [es, EN(es)]);
    t('inglés (i18n.js real): el banner, la pestaña, la descripción, las notas de las probabilidades, la ficha y el ataque', !mal.length, mal);
    // Cada ataque del Multiverso: su nombre, su descripción, su evolución y la carta dorada de evolucionar («X → Y»).
    const textos = MV ? MV.ATAQUES.flatMap(a => [a.name, a.desc].concat(a.evo ? [a.evo[0], a.name + ' → ' + a.evo[0]] : [])) : [];
    // Los que se llaman igual en inglés (nombres propios de su saga): se miran sólo por si traen algo en español.
    const IGUALES = new Set(['BFG 9000', 'Epona', 'Waka Waka', 'Super Pac-Man', 'Waka Waka → Super Pac-Man', 'Pyro', 'Pac-Mania', 'Game Over', 'Cruise Elroy', 'Warthog', 'Scorpion', 'Warthog → Scorpion']);
    const sinIngles = textos.filter(x => (!IGUALES.has(x) && EN(x) === x) || /[áéíóúñ¿¡]/i.test(EN(x)));
    const cartas = { 'Rifle de Plasma → BFG 9000': 'Plasma Rifle → BFG 9000', 'Granada → Granada de Racimo': 'Frag Grenade → Cluster Grenade',
      'Súper Escopeta → Súper Escopeta Maestra': 'Super Shotgun → Super Shotgun Mastery', 'Torbellino → Gran Tornado': 'Whirlwind → Great Tornado' };
    const malCartas = Object.entries(cartas).filter(([es, en]) => EN(es) !== en).map(([es]) => [es, EN(es)]);
    t(`inglés de los ${MV ? MV.ATAQUES.length : 0} ataques del Multiverso: nombre, descripción, evolución y la carta de evolucionar, sin nada en español`,
      MV && textos.length > 60 && !sinIngles.length && !malCartas.length, { sinIngles, malCartas });
  } catch (e) { t('inglés', false, String(e && e.stack || e)); }
  try {
    const gancho = (f, re) => rd(f).split(/\r?\n/).some(l => re.test(l) && /MOD nico/.test(l));
    const ui = rd('js/ui/gacha-ui.js');
    t('ganchos de una línea del ticket ×10: el coste en pull() de gacha.js (con el costOf() de upstream detrás), el premio de un repetido tras calcular el de upstream y antes de la evolución, y los botones al final de refresh() de gacha-ui.js, tras los de upstream',
      /const cost = G\.MULTIVERSO && G\.MULTIVERSO\.coste \? G\.MULTIVERSO\.coste\(save, n, gen, use, costOf\) : costOf\(save, n, use\);\s*\/\/ MOD nico/.test(rd('js/systems/gacha.js')) &&
      /else refund = REFUND\[rarity\];\r?\n\s*\}\r?\n\s*if \(!isNew && G\.MULTIVERSO && G\.MULTIVERSO\.premio\) refund = G\.MULTIVERSO\.premio\(gen, refund\);\s*\/\/ MOD nico[^\n]*\n\s*const evo = /.test(rd('js/systems/gacha.js')) &&
      /\$\('pull-10b'\)\.disabled = !G\.Gacha\.costOf\(s, 10, 't10'\);\r?\n\s*if \(G\.MULTIVERSO && G\.MULTIVERSO\.botones\) G\.MULTIVERSO\.botones\(gen, s\);\s*\/\/ MOD nico/.test(ui));
    t('ganchos de una línea: el banner en gacha.js, el cartel en gacha-ui.js tras las notas, «Multiverso» y la ficha en menu.js, fuera de los enemigos en enemies.js (elenco y jefes) y events.js, sus ataques en la primera línea de poolFor() de moves.js y su aspecto en forMove() de vfx.js',
      gancho('js/systems/gacha.js', /BANNERS\.push\(G\.MULTIVERSO\.BANNER\)/) && gancho('js/ui/gacha-ui.js', /G\.MULTIVERSO\.cartel\(gen\)/) &&
      ui.indexOf('G.MULTIVERSO.cartel(gen)') > ui.indexOf('G.MODS.notasGacha($(') && gancho('js/ui/menu.js', /GEN_NAMES\.push\(G\.MULTIVERSO\.BANNER\.name\)/) &&
      gancho('js/ui/menu.js', /G\.MULTIVERSO\.ficha\(dex\)/) && gancho('js/data/enemies.js', /p\.bst <= tier\.bst\[1\] && G\.SPRITE_META\[p\.dex\] && !p\.mv\)/) &&
      gancho('js/data/enemies.js', /const ok = p => [^\n]*&& !p\.mv;/) && gancho('js/systems/events.js', /!G\.Sprites\.hovers\(p\.dex\) && !p\.mv\)/) &&
      /function poolFor\(mon\) \{\r?\n\s*if \(mon\.pool\) return mon\.pool\.filter\(id => BY_ID\[id\]\);\s*\/\/ MOD nico/.test(rd('js/data/moves.js')) &&
      gancho('js/entities/vfx.js', /const v = MOVE\[m\.id\] \|\| m\.vis \|\| \{\};/));
    t('dev.html carga multiverso.js justo después de moves.js (y antes de achievements.js, gacha.js y menu.js); el paquete lo lleva',
      /src="js\/data\/moves\.js"><\/script>\r?\n<script defer src="js\/data\/multiverso\.js">/.test(rd('dev.html')) && /MULTIVERSO/.test(rd('js/app.min.js')));
    const cred = rd('CREDITS.md');
    t('CREDITS.md cuenta de dónde salen las hojas del Multiverso (PixelLab, dibujar.py y montar.py) y de quién es cada saga (Bandai, id Software, Nintendo, HAL, Bandai Namco, Konami, Re-Logic)',
      ['Agumon', 'Doom Slayer', 'Cacodemonio', 'Kirby', 'Link', 'Samus', 'Pac-Man', 'Blinky', 'Drácula', 'Ojo de Cthulhu', 'PixelLab', 'tools/nico/multiverso/montar.py',
        'tools/nico/multiverso/dibujar.py', 'Bandai', 'id Software', 'Nintendo', 'HAL', 'Bandai Namco', 'Konami', 'Re-Logic'].every(x => cred.includes(x)));
    const DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
    const faltan = ['agumon', 'slayer', 'caco', 'kirby', 'link', 'samus', 'pacman', 'blinky', 'dracula', 'cthulhu']
      .flatMap(k => DIRS.map(d => `tools/nico/multiverso/fuentes/${k}/rot-${d}.png`)).filter(f => !ex(f));
    t('lo que dibujó PixelLab está en tools/nico/multiverso/fuentes/ (las 8 rotaciones de cada uno) junto a montar.py, que rehace las hojas; multiverso.js y montar.py, nuevos, en LF',
      !faltan.length && ex('tools/nico/multiverso/montar.py') && !/\r/.test(rd('js/data/multiverso.js')) && !/\r/.test(rd('tools/nico/multiverso/montar.py')), faltan);
  } catch (e) { t('ganchos y paquete', false, String(e && e.stack || e)); }
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`multiverso: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`multiverso: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 26. Relieve, sombras y luz (2.5D falsa, aprobada por Nico el 14-10-2026) ----------------
function relieveChecks() {
  console.log('26. Relieve, sombras y luz (js/world/relieve.js, sombras.js y luz.js con tiles.js, mapas*.js, world.js y entorno.js reales)');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** Un contexto 2D de mentira que apunta cada llamada con el modo de mezcla, el alfa, el color y el suavizado de ese momento. */
  const ctx2d = cv => {
    const o = { ops: [], globalAlpha: 1, globalCompositeOperation: 'source-over', imageSmoothingEnabled: true, fillStyle: '#000',
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData(img) { if (cv) cv._img = img; } };
    return new Proxy(o, {
      get(x, k) { if (k in x) return x[k]; return (...a) => { x.ops.push([k, a, x.globalCompositeOperation, x.globalAlpha, x.fillStyle, x.imageSmoothingEnabled]); }; },
      set(x, k, v) { x[k] = v; return true; }
    });
  };
  const lienzo = () => { const cv = { width: 0, height: 0, _img: null }; const c = ctx2d(cv); cv.getContext = () => c; return cv; };
  const camara = (x, y, w = 768, h = 432) => ({ x, y, w, h, scale: 1, left() { return this.x - this.w / 2; }, top() { return this.y - this.h / 2; },
    sees(px, py, pad = 60) { return px > this.left() - pad && px < this.left() + this.w + pad && py > this.top() - pad && py < this.top() + this.h + pad; } });
  const SEM = 1234, PX = 2, T = 16, TS = 32;
  /** El mundo real (mapas propios) con entorno.js, horno.js, relieve.js, luz.js y sombras.js; estilo y Calidad de mentira. */
  function mundo({ estilo = 'dex', mundoDex = true } = {}) {
    const reloj = { t: 1000 };
    const c = { console, performance: { now: () => reloj.t }, document: { createElement: lienzo }, matchMedia: () => ({ matches: false }) };
    vm.createContext(c);
    c.window = c; c.G = {};
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/ui/marca.js']) vm.runInContext(rd(f), c, { filename: f });
    const G = c.G;
    G.MODS.mundoDex = mundoDex;
    G.Estilo = { actual: estilo, get dex() { return this.actual === 'dex'; }, on() {} };
    G.Settings = { fx: 2, get: () => false };
    G.Sprites = { PX };
    G.Game = { state: 'playing', st: { time: 10 }, player: { x: 0, y: 0 } };
    G.Rift = { inArena: false, rift: null };
    G.Hazards = { all: [] }; G.Projectiles = { all: () => [] }; G.Combat = { campos: [] };
    vm.runInContext(rd('js/world/tiles.js'), c, { filename: 'js/world/tiles.js' });
    cargarMapas(c, true);
    for (const f of ['js/world/world.js', 'js/world/entorno.js', 'js/world/horno.js', 'js/world/relieve.js', 'js/world/luz.js', 'js/world/sombras.js'])
      vm.runInContext(rd(f), c, { filename: f });
    G.World.reset(SEM); G.World.setBiome(0, true);
    return { G, c, reloj };
  }
  /** Una casilla de pared cerca del principio con suelo al norte (dos casillas) y al sur: la cresta. */
  function sitio(G) {
    const kind = (tx, ty) => G.World.kindAt(tx * TS + 16, ty * TS + 16);
    for (let cy = -2; cy <= 2; cy++) for (let cx = -2; cx <= 2; cx++) {
      for (let j = 2; j < 15; j++) for (let i = 1; i < 15; i++) {
        const tx = cx * 16 + i, ty = cy * 16 + j;
        if (kind(tx, ty) === 'wall' && kind(tx, ty - 1) === 'floor' && kind(tx, ty + 1) === 'floor' && kind(tx, ty - 2) === 'floor') return { cx, cy, tx, ty, kind };
      }
    }
    return null;
  }
  /** Varios fotogramas de escena (el relieve hornea uno o dos lienzos por fotograma): la última lista, ordenada. */
  function escena(G, cam, extra = [], n = 14) {
    let items = [];
    for (let k = 0; k < n; k++) { items = extra.map(e => ({ y: e.y, ent: e })); G.Relieve.escena(items, cam); }
    items.sort((a, b) => a.y - b.y);
    return items;
  }

  // ---- A. El lienzo del relieve: los tramos son las paredes del chunk; techo subido y cara de 8 + H; el resto, transparente ----
  try {
    const M = mundo(), G = M.G, S = sitio(G);
    t('hay una cresta (pared con suelo al norte y al sur) cerca del principio con la semilla 1234', !!S, S);
    const H = 8, R = G.Mapas.pintarRelieve(S.cx, S.cy, 16, 0, SEM, H), d = R.cv && R.cv._img && R.cv._img.data;
    const k = (i, j) => S.kind(S.cx * 16 + i, S.cy * 16 + j);
    let malTramo = 0, paredes = 0, malCara = 0;
    const cubre = new Map();
    for (const tr of R.tramos) for (let i = tr.i0; i <= tr.i1; i++) {
      cubre.set(i + ',' + tr.j, (cubre.get(i + ',' + tr.j) || 0) + 1);
      if (tr.cara !== (k(i, tr.j + 1) !== 'wall')) malCara++;
    }
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const w = k(i, j) === 'wall'; if (w) paredes++; if ((cubre.get(i + ',' + j) || 0) !== (w ? 1 : 0)) malTramo++; }
    t(`relieve: los tramos cubren cada pared del chunk una vez y nada más (${paredes} paredes en ${R.tramos.length} tramos) y llevan cara donde al sur no hay pared`, paredes > 0 && !malTramo && !malCara, { malTramo, malCara });
    // En la columna del centro de cada pared, opacos el techo (16 filas) y, con cara, 8 + H más; debajo, transparente.
    const W = 16 * T, alfa = (x, y) => d[(y * W + x) * 4 + 3];
    let malCol = 0, casos = 0;
    for (const tr of R.tramos) for (let i = tr.i0; i <= tr.i1; i++) {
      const x = i * T + 8, y0 = tr.j * T, alto = T + (tr.cara ? H : 0);
      casos++;
      for (let y = y0; y < y0 + alto; y++) if (alfa(x, y) !== 255) { malCol++; break; }
      if (tr.cara && tr.j + 2 < 16 && k(i, tr.j + 2) !== 'wall') for (let y = y0 + alto; y < (tr.j + 2) * T; y++) if (alfa(x, y) !== 0) { malCol++; break; }
    }
    // Lo que no es pared, transparente: cada píxel opaco cae en el rectángulo de algún tramo.
    let fuera = 0;
    const dentro = (x, y) => R.tramos.some(tr => x >= tr.i0 * T && x < (tr.i1 + 1) * T && y >= tr.j * T && y < tr.j * T + T + (tr.cara ? H : 0));
    for (let y = 0; y < 16 * T + H; y++) for (let x = 0; x < W; x++) if (alfa(x, y) && !dentro(x, y)) fuera++;
    t(`relieve: el techo sube ${H} px y la cara mide 8 + ${H} (${casos} columnas de pared, ${malCol} mal); fuera de los tramos, todo transparente (${fuera} píxeles opacos fuera)`,
      casos > 0 && !malCol && !fuera, { malCol, fuera });
    t('relieve: el lienzo mide 16·16 de ancho y 16·16 + H de alto (H px por encima del chunk)', R.cv.width === 256 && R.cv.height === 256 + H, [R.cv.width, R.cv.height]);
  } catch (e) { t('lienzo del relieve', false, String(e && e.stack || e)); }

  // ---- B. La escena: lo del norte de la cresta, detrás; lo del sur, delante; lo que vuela por encima, encima ----
  try {
    const M = mundo(), G = M.G, S = sitio(G), x = S.tx * TS + 16, y0 = S.ty * TS;
    const cam = camara(x, y0);
    const norte = { x, y: y0 - 6, n: 'norte' }, sur = { x, y: y0 + TS + 6, n: 'sur' }, vuela = { x, y: y0 + 16, n: 'vuela' };
    const items = escena(G, cam, [norte, sur, vuela]);
    const tramo = items.find(it => it.ent.relieve && it.ent.caja[0] <= x && it.ent.caja[2] > x && it.y === y0);
    const i = e => items.findIndex(it => it.ent === e), it = tramo ? items.indexOf(tramo) : -1;
    const c = tramo && tramo.ent.caja;
    t(`escena: el tramo de la cresta (orden ${tramo && tramo.y} = su borde norte) va después de lo que tiene los pies 6 px al norte y antes de lo de debajo; lo que vuela sobre ella, después de su último tramo`,
      !!tramo && i(norte) < it && it < i(sur) && i(vuela) > it, { tramo: tramo && tramo.y, orden: items.map(q => q.ent.n || (q.ent.relieve ? 'pared@' + q.y : '?')).slice(0, 40) });
    const Hm = G.Relieve.altura() * PX;
    t(`escena: la caja del tramo (la que cuenta G.Claridad) va de H·${PX} = ${Hm} px por encima de la casilla (el techo subido) a su pie con la cara (${c && c[1] - y0} y ${c && c[3] - y0})`,
      !!c && Hm > 0 && c[1] === y0 - Hm && c[3] === y0 + TS, c);
    // Sin relieve (altura 0) o con mundoDex = false y Clásico, nada; con mundoDex, también con Clásico.
    const H0 = G.MODS.relieveAltura;
    G.MODS.relieveAltura = 0;
    const sin = escena(G, cam, [norte], 2).filter(q => q.ent.relieve).length;
    G.MODS.relieveAltura = H0;
    const MC = mundo({ estilo: 'clasico', mundoDex: false }), MCD = mundo({ estilo: 'clasico' });
    const cla = escena(MC.G, cam, [], 4).filter(q => q.ent.relieve).length, claD = escena(MCD.G, cam, [], 14).filter(q => q.ent.relieve).length;
    t(`escena: sin tramos con relieveAltura = 0 (${sin}) y con mundoDex = false y Clásico (${cla}); con mundoDex, también con Clásico (${claD})`, !sin && !cla && claD > 0);
  } catch (e) { t('escena del relieve', false, String(e && e.stack || e)); }

  // ---- C. Dibujo: un drawImage del trozo del lienzo; en el fundido de bioma, el viejo debajo y el nuevo con su alfa ----
  try {
    const M = mundo(), G = M.G, S = sitio(G), x = S.tx * TS + 16, y0 = S.ty * TS, cam = camara(x, y0);
    let items = escena(G, cam);
    const tr = items.find(it => it.ent.relieve), c1 = ctx2d();
    tr.ent.draw(c1);
    const d1 = c1.ops.filter(o => o[0] === 'drawImage');
    t('dibujo: cada tramo, un drawImage de su trozo del lienzo a su caja', d1.length === 1 && d1[0][1].length === 9 && d1[0][1][5] === tr.ent.caja[0] && d1[0][1][6] === tr.ent.caja[1], d1[0] && d1[0][1].slice(1));
    G.World.setBiome(1);                       // con fundido
    G.World.update(0.5, cam);
    items = escena(G, cam);
    const tr2 = items.find(it => it.ent.relieve && it.ent.caja[0] === tr.ent.caja[0] && it.y === tr.y), c2 = ctx2d();
    tr2.ent.draw(c2);
    const d2 = c2.ops.filter(o => o[0] === 'drawImage'), fu = G.World.fundido();
    t(`dibujo: en el fundido de bioma, el relieve viejo debajo (alfa 1) y el nuevo encima con el del fundido (${fu && fu.k.toFixed(2)})`,
      !!fu && d2.length === 2 && d2[0][3] === 1 && Math.abs(d2[1][3] - fu.k) < 1e-9 && d2[0][1][0] !== d2[1][1][0], d2.map(o => o[3]));
    const antes = G.Relieve.cache.geo;
    G.World.reset(SEM + 1); G.Relieve.escena([], cam);
    t(`caché: con otro mundo se olvidan los tramos (${antes} → ${G.Relieve.cache.geo})`, antes > 0 && G.Relieve.cache.geo <= 2);
  } catch (e) { t('dibujo del relieve', false, String(e && e.stack || e)); }

  // ---- D. Luz ----
  try {
    const M = mundo(), G = M.G, cam = camara(0, 0);
    const act = [];
    for (const fx of [2, 1, 0]) { G.Settings.fx = fx; act.push(G.Luz.activo()); }
    G.Settings.fx = 2; G.MODS.luz = false; act.push(G.Luz.activo()); G.MODS.luz = true;
    const MC = mundo({ estilo: 'clasico', mundoDex: false }), MD = mundo({ estilo: 'dex', mundoDex: false }), MK = mundo({ estilo: 'clasico' });
    t(`luz: sólo con Calidad Alta (Alta, Media, Baja: ${act.slice(0, 3)}), nada con luz = false (${act[3]}); va con el mundo Dex: con mundoDex = false, sólo con Dex (${MD.G.Luz.activo()}; Clásico, ${MC.G.Luz.activo()}) y con mundoDex, también con Clásico (${MK.G.Luz.activo()})`,
      act.join() === 'true,false,false,false' && MD.G.Luz.activo() && !MC.G.Luz.activo() && MK.G.Luz.activo());
    const vis = p => ({ pal: p });
    G.Projectiles.all = () => [{ x: 10, y: 10, r: 6, friendly: true, vis: vis('fire') }, { x: 40, y: 10, r: 6, friendly: true, vis: vis('electric') },
      { x: 70, y: 10, r: 6, friendly: true, vis: vis('water') }, { x: 100, y: 10, r: 6, friendly: false, vis: vis('fire') }];
    G.Combat.campos = [{ kind: 'patch', x: 0, y: 60, r: 40, t: 1, life: 3, m: { type: 'fire' } }, { kind: 'mine', x: 30, y: 60, t: 1, life: 5, m: { type: 'water' } }];
    G.Rift.rift = { x: 120, y: 80, t: 2, ttl: 9 };
    const L = G.Luz.luces(cam, 1, false), cols = L.map(l => l.col);
    t(`luz: alumbran tus disparos de fuego y eléctricos (no los de agua ni los de un enemigo), tus campos de fuego y la grieta (${L.length} luces: ${cols.join(', ')})`,
      L.length === 4 && cols[0] === '#ffae3a' && cols[1] === '#fff06a' && cols.includes('#B48AFF'), cols);
    const a1 = G.Luz.luces(cam, 1, true).map(l => l.a), a2 = G.Luz.luces(cam, 1.37, true).map(l => l.a);
    t('luz: con «Menos sacudidas y destellos» (reducido), ninguna parpadea ni late: el mismo alfa en dos momentos', JSON.stringify(a1) === JSON.stringify(a2), { a1, a2 });
    // El ácido de la Vega Sulfúrea: una luz por casilla visible, sólo en el búfer.
    G.Projectiles.all = () => []; G.Combat.campos = []; G.Rift.rift = null;
    G.World.setBiome(2, true);
    let liq = null;
    for (let r2 = 0; r2 < 40 && !liq; r2 += 2) for (let a = 0; a < 6.28 && !liq; a += 0.5) {
      const Lq = G.Luz.luces(camara(Math.cos(a) * r2 * TS, Math.sin(a) * r2 * TS), 1, false);
      if (Lq.length >= 6) liq = { n: Lq.length, solo: Lq.every(l => l.solo), col: Lq[0].col };
    }
    t(`luz: en la Vega Sulfúrea, el ácido alumbra (una luz por casilla visible, sólo en el búfer: ${liq && liq.n}, ${liq && liq.col})`, !!liq && liq.solo && liq.col === '#a8f060', liq);
    G.World.setBiome(0, true);
    // pintar(): el búfer alineado con la rejilla del mundo y multiplicado; los avisos, a 1 en el búfer; el brillo, encima.
    G.Projectiles.all = () => [{ x: 0, y: 0, r: 6, friendly: true, vis: vis('fire') }];
    G.Hazards.all = [{ kind: 'zone', x: 100, y: 50, r: 44, hit: false }, { kind: 'beam', x: -100, y: 0, angle: 0.3, len: 120, w: 20, hit: false }, { kind: 'zone', x: 0, y: 0, r: 30, hit: true }];
    const c3 = camara(3.7, 1.3, 777, 431), main = ctx2d();
    G.Luz.pintar(main, c3);
    const mult = main.ops.find(o => o[0] === 'drawImage' && o[2] === 'multiply'), Wb = Math.ceil(777 / PX) + 2, Hb = Math.ceil(431 / PX) + 2;
    const ox = mult && mult[1][5], oy = mult && mult[1][6];
    t(`luz: el búfer mide ceil(vista / ${PX}) + 2 píxeles de arte (${mult && mult[1][3]}×${mult && mult[1][4]}), empieza en la rejilla del mundo (${ox}, ${oy}: múltiplos de ${PX}) y se multiplica ×${PX} sin suavizar`,
      !!mult && mult[1][3] === Wb && mult[1][4] === Hb && ox % PX === 0 && oy % PX === 0 && mult[1][7] === Wb * PX && mult[1][8] === Hb * PX && mult[5] === false, mult && mult[1].slice(1));
    const brillo = main.ops.filter(o => o[0] === 'drawImage' && o[2] === 'lighter');
    t(`luz: después, el brillo de cada luz con 'lighter' en la rejilla (${brillo.length}, alfa ${brillo[0] && brillo[0][3].toFixed(3)} ≈ 0,62 × 0,28) y sólo un drawImage con 'multiply'`,
      brillo.length === 1 && Math.abs(brillo[0][3] - 0.62 * 0.28) < 0.05 && brillo[0][1][1] % PX === 0 && main.ops.filter(o => o[2] === 'multiply' && o[0] === 'drawImage').length === 1, brillo.map(o => o[1].slice(1)));
    const bo = mult[1][0].getContext().ops;
    const iAmb = bo.findIndex(o => o[0] === 'fillRect' && o[2] === 'source-over'), iLuz = bo.findIndex(o => o[0] === 'drawImage' && o[2] === 'lighter');
    const fills = bo.filter((o, i) => o[0] === 'fill' && i > iLuz), amb = bo[iAmb] && bo[iAmb][4];
    t(`luz: en el búfer, el ambiente del bioma primero (${amb}: 0,88 × su tinte), las luces con 'lighter' y, al final, los ${fills.length} avisos sin golpear rellenos de blanco con 'source-over' (nunca se oscurecen)`,
      iAmb === 0 && amb === 'rgb(231,227,236)' && iLuz > iAmb && fills.length === 2 && fills.every(o => o[2] === 'source-over' && o[4] === '#fff'), { amb, fills: fills.length });
  } catch (e) { t('luz', false, String(e && e.stack || e)); }

  // ---- E. Sombras de las paredes (horneadas): hacia el sureste, sólo en el suelo, con penumbra al final ----
  try {
    const M = mundo(), G = M.G, h = G.Sombras.alturaPared(), SX = G.Sombras.SOL.x, SY = G.Sombras.SOL.y, GRIS = 0xff808080 >>> 0;
    const caso = (esPared, sombras = true) => {
      G.MODS.sombras = sombras;
      const W = 256, b = new Uint32Array(W * W).fill(GRIS);
      const at = (tx, ty) => (esPared(tx, ty) ? 'wall' : 'floor');
      const P = { w: W, h: W, get: (x, y) => b[y * W + x], set(x, y, v) { b[y * W + x] = v; }, suelo: (x, y) => !esPared(x >> 4, y >> 4) };
      G.Sombras.paredes(P, 0, 0, 16, at, '#204060');
      G.MODS.sombras = true;
      return b;
    };
    const tocado = (b, x, y) => b[y * 256 + x] !== GRIS;
    const col = caso(tx => tx === 5), ancho = [];                 // una pared de norte a sur en la columna de casillas 5
    for (let x = 0; x < 256; x++) if (tocado(col, x, 100)) ancho.push(x);
    const filaS = caso((tx, ty) => ty === 5), alto = [];          // una fila de paredes de oeste a este en la fila 5
    for (let y = 0; y < 256; y++) if (tocado(filaS, 100, y)) alto.push(y);
    const pen = col[100 * 256 + ancho[ancho.length - 1]], lleno = col[100 * 256 + 96];
    t(`sombras: una pared de ${h} px de alto deja ${ancho.length} px de sombra al este (x ${ancho[0]}-${ancho[ancho.length - 1]}; el sol, ${SX} px por píxel de alto) y ${alto.length} al sur de una fila de paredes (y ${alto[0]}-${alto[alto.length - 1]}); nada al oeste, al norte ni en la pared; la última, en penumbra (más clara)`,
      ancho[0] === 96 && ancho.length === Math.floor(h * SX - 0.5) + 1 && alto[0] === 96 && alto.length === Math.floor(h * SY - 0.5) + 1 && (pen & 255) > (lleno & 255), { ancho, alto });
    t('sombras: con sombras = false, no se pintan', caso(tx => tx === 5, false).every(v => v === GRIS));
    t('sombras: van con el mundo Dex (con mundoDex = false y Clásico, apagadas; con mundoDex, también con Clásico)', !mundo({ estilo: 'clasico', mundoDex: false }).G.Sombras.activas() && mundo({ estilo: 'clasico' }).G.Sombras.activas());
  } catch (e) { t('sombras', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`relieve, sombras y luz: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`relieve, sombras y luz: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 27. apariciones en grupo con vistas distintas (js/net/vistas.js) ----------------
function vistasChecks() {
  console.log('27. Apariciones en grupo con vistas distintas (js/net/vistas.js): anillo, «¿lo ve alguien?», jefes, rezagados y red');
  const r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  // Las vistas medidas en el E2E (px de mundo, con el píxel nítido): un PC a 1440x900 (A, anfitrión) y un móvil a 844x390@3
  // (B, invitado), con el encuadre del HUD Dex compacto (31 a la izquierda y 37 abajo de su Pokémon).
  const VA = { w: 720, h: 450 }, VB = { w: 1266, h: 585, ox: -31, oy: 37 };
  const AZAR = s => `(() => { let s = ${s} >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let q = s; q = Math.imul(q ^ (q >>> 15), q | 1);
    q ^= q + Math.imul(q ^ (q >>> 7), q | 61); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; })();`;
  /** util.js, mods.js, camera.js, vistas.js (si `vistas`) y spawner.js reales; lo demás, de mentira. */
  const montar = ({ vistas = true, ajuste = true, coop = true, semilla = 7 } = {}) => {
    const c = { console }; c.window = c; c.G = {}; vm.createContext(c);
    for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/core/camera.js']) vm.runInContext(rd(f), c, { filename: f });
    vm.runInContext(AZAR(semilla), c);
    const G = c.G, nop = () => {}, nacen = [];
    G.MODS.aparicionVistas = ajuste;
    const yo = { x: 0, y: 0, dead: false }, otro = { x: 0, y: 0, dead: false, remote: true, uid: 'B' };
    Object.assign(G, {
      Settings: { get: () => false },
      Coop: { active: coop, isHost: coop, local: coop ? yo : null, scaleRate: () => 1, scaleHp: () => 1, say: nop, enemyGone: nop },
      Enemies: { rollRun: nop, upcomingDex: () => [], bagAt: () => [{ dex: 19 }], scale: () => ({ hp: 1, spd: 1, dmg: 1 }), bossScale: () => ({ hp: 1, spd: 1, dmg: 1 }), BOSSES: [] },
      Sprites: { preload: nop, hovers: () => false, hasShiny: () => false },
      EnemyMgr: { count: 0, add: e => nacen.push(e), bossAlive: () => false },
      Enemy: class { constructor(def, x, y, sc, boss) { Object.assign(this, { x, y, boss: !!boss, dmg: 1, xp: 1, maxHp: 1, hp: 1, name: '' }); } makeShiny() {} makeGolden() {} },
      World: { isFree: () => true }, Events: { golden: false }, Rift: { inArena: false }, Audio: { sfx: nop }, Guard: { flag: nop },
      Game: { get player() { return yo; }, st: { time: 60 } }
    });
    if (vistas) vm.runInContext(rd('js/net/vistas.js'), c, { filename: 'js/net/vistas.js' });
    vm.runInContext(rd('js/systems/spawner.js'), c, { filename: 'js/systems/spawner.js' });
    Object.assign(G.Camera, { x: 0, y: 0, w: VA.w, h: VA.h });
    return { c, G, yo, otro, nacen };
  };
  /** Ráfagas (G.Spawner.burst: el anillo con su «¿lo ve alguien?») y jefes (update() con un jefe pendiente por llamada). */
  const jugar = (m, en, { rafagas = 300, jefes = 150, datos = true } = {}) => {
    const { G, yo, otro, nacen } = m;
    Object.assign(otro, en);
    if (datos && G.Vistas) G.Vistas.deRed('B', ['vista', VB.w, VB.h, VB.ox, VB.oy]);
    const ps = G.Coop.active ? [yo, otro] : [yo];
    G.Spawner.update(1e-6, ps, 60);
    for (let i = 0; i < rafagas; i++) G.Spawner.burst(5);
    const n = nacen.length;
    G.Enemies.BOSSES = Array.from({ length: jefes }, () => ({ dex: 150, at: 0 }));
    for (let i = 0; i < jefes; i++) G.Spawner.update(1e-6, ps, 60);
    const enB = e => Math.abs(e.x - (otro.x + VB.ox)) < VB.w / 2 && Math.abs(e.y - (otro.y + VB.oy)) < VB.h / 2;
    const enA = e => Math.abs(e.x) < VA.w / 2 && Math.abs(e.y) < VA.h / 2;
    const normales = nacen.slice(0, n), js = nacen.slice(n);
    return { intentos: rafagas * 5, nacen: n, fallan: rafagas * 5 - n, enB: normales.filter(enB).length, enA: normales.filter(enA).length,
      jefes: js.length, jefesEnB: js.filter(enB).length, jefesEnA: js.filter(enA).length, pos: nacen.map(e => [Math.round(e.x * 100), Math.round(e.y * 100)]) };
  };
  try {
    // Dónde está B respecto a A: juntos, a un lado, arriba, en diagonal y lejos.
    const SEP = [[0, 0], [90, 20], [-150, 0], [300, 0], [600, 0], [0, 350], [400, 300], [900, 0], [1300, 0], [2500, 0]];
    const con = SEP.map((s, i) => [s, jugar(montar({ semilla: 11 + i }), { x: s[0], y: s[1] })]);
    const sin = SEP.map((s, i) => [s, jugar(montar({ ajuste: false, semilla: 11 + i }), { x: s[0], y: s[1] })]);
    const fila = ([s, x]) => ({ B: s.join(','), nacen: x.nacen, enB: x.enB, enA: x.enA, jefesEnB: x.jefesEnB, fallan: x.fallan });
    t('con el ajuste, ningún enemigo ni jefe nace dentro de la vista del móvil (B) ni de la del PC (A), esté B donde esté (10 posiciones, 1.500 apariciones y 150 jefes en cada una)',
      con.every(([, x]) => x.enB === 0 && x.enA === 0 && x.jefesEnB === 0 && x.jefesEnA === 0 && x.jefes === 150), con.map(fila));
    t('control: sin el ajuste (upstream) nacen enemigos y jefes dentro de la vista de B en todas las posiciones (la prueba lo detecta), y ninguno en la de A',
      sin.every(([, x]) => x.enB > 50 && x.jefesEnB > 0 && x.enA === 0), sin.map(fila));
    // El anillo más lejano no puede dejar sin enemigos: como mucho un 3 % de apariciones fallidas más que upstream en cada posición.
    t('con el ajuste no se pierden más apariciones que en upstream (8 intentos por enemigo; como mucho 3 puntos más en cada posición)',
      con.every(([, x], i) => x.fallan / x.intentos <= sin[i][1].fallan / sin[i][1].intentos + 0.03),
      con.map(([s, x], i) => ({ B: s.join(','), conAjuste: +(x.fallan / x.intentos).toFixed(3), upstream: +(sin[i][1].fallan / sin[i][1].intentos).toFixed(3) })));
    // Lo que no cambia: en solitario, con el ajuste apagado o sin vistas.js, exactamente lo de upstream (mismo azar, mismas posiciones).
    const igual = (a, b) => JSON.stringify(a.pos) === JSON.stringify(b.pos) && a.pos.length > 0;
    const solo = [jugar(montar({ coop: false }), { x: 0, y: 0 }), jugar(montar({ coop: false, vistas: false }), { x: 0, y: 0 })];
    const apagado = [jugar(montar({ ajuste: false }), { x: 90, y: 20 }), jugar(montar({ vistas: false }), { x: 90, y: 20 })];
    t('en solitario, las mismas apariciones que sin vistas.js (upstream), con el mismo azar', igual(solo[0], solo[1]), { n: solo[0].pos.length });
    t('con aparicionVistas: false, las mismas apariciones que sin vistas.js, también en grupo', igual(apagado[0], apagado[1]), { n: apagado[0].pos.length });
    const m0 = montar(), V0 = m0.G.Vistas, up = m0.G.Camera.outerRadius(), ps0 = [m0.yo, m0.otro];
    t('sin datos del invitado (otra versión o aún no ha llegado), su vista se supone la del anfitrión', V0.radioDe(m0.otro) === up && V0.radio(ps0, m0.otro, 0) === up,
      { radioDeB: V0.radioDe(m0.otro), upstream: up });
    V0.deRed('B', ['vista', VB.w, VB.h, VB.ox, VB.oy]);
    m0.otro.x = 90; m0.otro.y = 20;
    const esperado = Math.hypot(VB.w, VB.h) / 2 + 40 + Math.hypot(VB.ox, VB.oy);
    const rumbo = a => +V0.radio(ps0, m0.yo, a).toFixed(1);
    const dir = { derecha: rumbo(0), izquierda: rumbo(Math.PI), abajo: rumbo(Math.PI / 2), arriba: rumbo(-Math.PI / 2), diagonal: rumbo(0.6) };
    // B junto a A (90, 20): por los lados, justo fuera de la vista de B con el margen (sus bordes, a 90 - 31 + 673 = 732 y a
    // 673 - 90 + 31 = 614 de A); arriba y abajo, la distancia de upstream (la vista de B, 292 de media altura, queda dentro del anillo de A).
    t('con B (móvil) junto a A (PC), el anillo de A sólo se aleja por los lados, hasta salir de la vista de B; arriba y abajo, el de upstream',
      dir.abajo === +up.toFixed(1) && dir.arriba === +up.toFixed(1) && Math.abs(dir.derecha + 10 - 733) < 0.5 && Math.abs(dir.izquierda + 10 - 615) < 0.5 && dir.diagonal > up,
      Object.assign({ upstream: +up.toFixed(1) }, dir));
    t('alrededor de B, su propia vista (con lo que la tiene corrida): el anillo empieza en su círculo', Math.abs(V0.radioDe(m0.otro) - esperado) < 1e-9 && V0.radio(ps0, m0.otro, Math.PI / 2) === V0.radioDe(m0.otro),
      { radioDeB: V0.radioDe(m0.otro), esperado });
    const deRed = ev => { const m = montar(); m.G.Vistas.deRed('B', ev); return m.G.Vistas.vista('B'); };
    const hostiles = [deRed(['vista', 1e9, 585, 0, 0]), deRed(['vista', 'x', 585, 0, 0]), deRed(['vista', 1266, 50, 0, 0]), deRed(['vista']), deRed(['vista', 1266, 585, 9999, -9999])];
    t('el anfitrión no se fía de lo que llega: tamaños fuera de 100-3.000 o que no son números se ignoran, y la vista corrida, como mucho 400 px',
      hostiles.slice(0, 4).every(v => v === null) && hostiles[4] && hostiles[4].ox === 400 && hostiles[4].oy === -400, hostiles);
  } catch (e) { t('apariciones con spawner.js real', false, String(e && e.stack || e)); }

  // Rezagados: el bloque de enemy.js tal cual. A lejos; B corre hacia la izquierda; uno detrás a 560 (dentro de la vista de B, que
  // llega a 602 por la derecha) y otro a 900 (fuera de ella y del radio de su vista más 40, 826).
  try {
    const src = rd('js/entities/enemy.js');
    const m = src.match(/        const d2 = G\.U\.dist2\(e\.x, e\.y, near\.x, near\.y\);\r?\n[\s\S]*?\r?\n        if \(\(unseen && e\.lagT > LAG_T\) \|\| d2 > 1400 \* 1400\) \{\r?\n[\s\S]*?\r?\n        \}\r?\n/);
    if (!m) throw new Error('no encuentro el bloque de los rezagados en js/entities/enemy.js');
    const rezagados = ({ vistas = true, ajuste = true, coop = true } = {}) => {
      const c = { console }; c.window = c; c.G = {}; vm.createContext(c);
      for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/core/camera.js']) vm.runInContext(rd(f), c, { filename: f });
      const G = c.G, vuelven = [];
      G.MODS.aparicionVistas = ajuste;
      const yo = { x: coop ? -2600 : 0, y: 0, dead: false, _vx: coop ? 0 : -116, _vy: 0 }, otro = { x: 0, y: 0, dead: false, remote: true, uid: 'B', _vx: -116, _vy: 0 };
      G.Coop = { active: coop, isHost: coop, local: yo, enemyGone: () => {} };
      G.Spawner = { ahead: (e, near) => { vuelven.push({ x: e.x, t: e.t }); e.x = near.x - 700; return true; } };
      Object.assign(G.Camera, { x: yo.x, y: 0, w: VA.w, h: VA.h });
      if (vistas) vm.runInContext(rd('js/net/vistas.js'), c, { filename: 'js/net/vistas.js' });
      if (vistas && coop) G.Vistas.deRed('B', ['vista', VB.w, VB.h, VB.ox, VB.oy]);
      vm.runInContext(`var __rez = (e, near, players, dt, i, list, byId, LAG_T) => {\n${m[0]}};`, c, { filename: 'js/entities/enemy.js (rezagados)' });
      const players = coop ? [yo, otro] : [yo], near = coop ? otro : yo;
      const es = [{ id: 1, x: near.x + 560, y: near.y + 10, lagT: 0 }, { id: 2, x: near.x + 900, y: near.y, lagT: 0 }];
      for (let f = 0; f < 240; f++) for (const e of es) { e.t = f / 60; if (e.x > near.x) c.__rez(e, near, players, 1 / 60, 0, [e], new Map(), 2.5); }
      return { a560: vuelven.filter(v => v.x < near.x + 700).map(v => +v.t.toFixed(2)), a900: vuelven.filter(v => v.x >= near.x + 700).map(v => +v.t.toFixed(2)) };
    };
    const con = rezagados(), sin = rezagados({ ajuste: false });
    t('rezagados (el bloque de enemy.js tal cual): con el ajuste, el que B ve a 560 px no vuelve a salir por delante; el de 900 sí, a los 2,5 s',
      con.a560.length === 0 && con.a900.length === 1 && con.a900[0] >= 2.5 && con.a900[0] < 2.6, con);
    t('rezagados, control: sin el ajuste (upstream, con la vista del anfitrión) también el de 560 px, que B está viendo', sin.a560.length === 1 && sin.a900.length === 1, sin);
    const s1 = rezagados({ coop: false }), s2 = rezagados({ coop: false, vistas: false });
    // (En solitario la vista es la del PC, 720 de ancho: los dos están fuera de ella y los dos vuelven, como en upstream.)
    t('rezagados en solitario: igual que sin vistas.js', JSON.stringify(s1) === JSON.stringify(s2) && s1.a560.length === 1 && s1.a900.length === 1, { conVistas: s1, sinVistas: s2 });
  } catch (e) { t('rezagados con el bloque de enemy.js', false, String(e && e.stack || e)); }

  // Red: coop.js real en los dos lados. El invitado manda ['vista', ...] al empezar, al cambiar y cada 2 s; el anfitrión la apunta.
  try {
    const cliente = (uid, anfitrion, ajuste = true, bombaAj = false) => {
      const c = { console, performance: { now: () => 0 } }; c.window = c; c.G = {}; vm.createContext(c);
      for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/core/camera.js']) vm.runInContext(rd(f), c, { filename: f });
      const G = c.G, nop = () => {}, S = { enviados: [], mandados: [], dts: [] };
      G.MODS.aparicionVistas = ajuste; G.MODS.bombaVistas = bombaAj;
      const pl = { x: 100, y: 50, dead: false, hp: 100, maxHp: 100, moveAngle: 0, walking: false, magnet: 78, aim: 0, xpMul: 1, reviveT: 0, activeGroup: () => [] };
      Object.assign(G, {
        Net: { uid, on: fn => { S.recibe = fn; }, onPeer: nop, slow: () => false, viaTurn: () => false,
          send: (to, msg) => S.mandados.push(JSON.parse(JSON.stringify(msg))), toHost: msg => S.enviados.push(JSON.parse(JSON.stringify(msg))) },
        Player: class { constructor(mon) { Object.assign(this, { mon, dex: mon.dex, x: 0, y: 0, hp: 100, maxHp: 100, dead: false }); } },
        startMoveOf: () => 'tackle', Sprites: { preload: nop }, DEX_BY: { 25: { dex: 25, name: 'Pikachu' } }, Spawner: { say: nop }, Projectiles: { clearOrbs: nop },
        EnemyMgr: { all: () => [] },
        Encuadre: { desplazamiento: dt => { S.dts.push(dt); return [VB.ox, VB.oy]; } }   // el HUD Dex compacto corre la cámara
      });
      vm.runInContext(rd('js/net/vistas.js'), c, { filename: 'js/net/vistas.js' });
      vm.runInContext(rd('js/net/coop.js'), c, { filename: 'js/net/coop.js' });
      G.Coop.begin({ host: 'A', members: [{ uid: 'A', name: 'Ana', dex: 25 }, { uid: 'B', name: 'Bea', dex: 25 }] }, pl, { team: () => ({}) });
      return { G, S, pl };
    };
    const B = cliente('B', false), A = cliente('A', true);
    const camara = (o = 0) => Object.assign(B.G.Camera, { x: B.pl.x + VB.ox + o, y: B.pl.y + VB.oy, w: VB.w, h: VB.h });
    const vistasDe = () => B.S.enviados.flatMap(m => (m.ev || []).filter(ev => ev[0] === 'vista'));
    for (let f = 0; f < 600; f++) { camara(f % 30 < 15 ? 13 : -13); B.G.Coop.tick(1 / 60); }   // 10 s; la cámara va y viene 13 px (su retraso al moverse)
    const diez = vistasDe().length;
    const primera = vistasDe()[0];
    t('lo corrida que está la vista lo pide al encuadre sin hacerlo avanzar (dt 0)', B.S.dts.length > 0 && B.S.dts.every(d => d === 0), { llamadas: B.S.dts.length });
    for (let f = 0; f < 120; f++) { Object.assign(B.G.Camera, { w: VB.w - 3 * f, h: VB.h - f }); B.G.Coop.tick(1 / 60); }   // 2 s cambiando de tamaño cada fotograma
    const cambiando = vistasDe().length - diez;
    t("el invitado manda su vista al empezar (['vista', 1266, 585, -31, 37]) y luego cada 2 s; el vaivén de la cámara no la vuelve a mandar",
      primera && primera.join() === ['vista', VB.w, VB.h, VB.ox, VB.oy].join() && diez >= 5 && diez <= 6, { primera, en10s: diez });
    t('si cambia de tamaño, la vuelve a mandar enseguida, como mucho 2 veces por segundo', cambiando >= 3 && cambiando <= 5, { en2s: cambiando });
    // El anfitrión recibe esos mensajes (coop.js, onClientFrame) y apunta la última.
    for (const msg of B.S.enviados) A.S.recibe('B', msg);
    const ultima = vistasDe().slice(-1)[0], v = A.G.Vistas.vista('B');
    t("el anfitrión apunta la vista de B con coop.js real (case 'vista')", v && v.w === ultima[1] && v.h === ultima[2] && v.ox === ultima[3] && v.oy === ultima[4], { recibida: v, ultima });
    A.S.recibe('Z', { k: 'f', ev: [['vista', 2000, 2000, 0, 0]] });
    t('de alguien que no está en la partida, nada', A.G.Vistas.vista('Z') === null);
    const Bsin = cliente('B', false, false);
    for (let f = 0; f < 300; f++) Bsin.G.Coop.tick(1 / 60);
    t('con aparicionVistas y bombaVistas en false el invitado no manda nada nuevo (como upstream)', Bsin.S.enviados.length > 0 && Bsin.S.enviados.every(m => !(m.ev || []).some(ev => ev[0] === 'vista')),
      { mensajes: Bsin.S.enviados.length });
    const Bbomba = cliente('B', false, false, true);
    for (let f = 0; f < 300; f++) { Object.assign(Bbomba.G.Camera, { w: VB.w, h: VB.h }); Bbomba.G.Coop.tick(1 / 60); }
    const vb = Bbomba.S.enviados.flatMap(m => (m.ev || []).filter(ev => ev[0] === 'vista'));
    t('con sólo bombaVistas (aparicionVistas en false) el invitado también manda su vista, que necesita la bomba', vb.length >= 2 && vb.length <= 4 && vb[0][1] === VB.w, { vistas: vb.length, primera: vb[0] });
    for (let f = 0; f < 120; f++) A.G.Coop.tick(1 / 60);
    t('el anfitrión no manda su vista a nadie', A.S.mandados.length > 0 && !A.S.enviados.length && A.S.mandados.every(m => !(m.ev || []).some(ev => ev[0] === 'vista')),
      { mensajes: A.S.mandados.length });
  } catch (e) { t('red con coop.js real', false, String(e && e.stack || e)); }

  // La bomba de un compañero (G.MODS.bombaVistas): el trozo de onCollect() de js/game.js tal cual, sobre una rejilla de
  // enemigos (cada 24 px, en posiciones impares para no caer justo en un borde). A, el anfitrión (PC), lejos; B la coge.
  try {
    const m = rd('js/game.js').match(/    if \(p\.kind === 'bomb'\) \{\r?\n[\s\S]*?\r?\n    \}\r?\n/);
    if (!m) throw new Error('no encuentro la bomba en onCollect() de js/game.js');
    const GANCHO = /G\.Vistas && G\.Vistas\.bombaEnSuVista\(who, mine\) \? !G\.Vistas\.enSuVista\(who, e\.x, e\.y\) : /;
    if (!GANCHO.test(m[0])) throw new Error('la bomba de onCollect() no lleva el gancho');
    // Upstream: el mismo trozo sin el gancho ni su comentario (lo que queda detrás del gancho es su condición tal cual).
    const UPSTREAM = m[0].replace(GANCHO, '').replace(/\s*\/\/ MOD nico[^\r\n]*/, '');
    const R = Math.hypot(VA.w, VA.h) / 2 + 40;   // G.Camera.outerRadius() del anfitrión: 464,5
    const bomba = ({ trozo = m[0], vistas = true, ajuste = true, apariciones = true, coop = true, host = true, datos = VB, mia = false } = {}) => {
      const c = { console }; c.window = c; c.G = {}; vm.createContext(c);
      for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/core/camera.js']) vm.runInContext(rd(f), c, { filename: f });
      const G = c.G, golpes = [], aros = [];
      G.MODS.bombaVistas = ajuste; G.MODS.aparicionVistas = apariciones;
      const yo = { x: -2600, y: 0, level: 7 }, otro = { x: 90, y: 20, remote: true, uid: 'B', level: 3 }, who = mia ? yo : otro;
      Object.assign(G, { Settings: { get: () => false }, Coop: { active: coop, isHost: coop && host, local: yo }, FX: { ring: (x, y, r0, r1) => aros.push(Math.round(r1)) } });
      Object.assign(G.Camera, { x: yo.x, y: yo.y, w: VA.w, h: VA.h });
      const es = [];
      for (let dx = -983; dx <= 985; dx += 24) for (let dy = -695; dy <= 697; dy += 24)
        es.push({ x: who.x + dx, y: who.y + dy, hurt(d, col, kx, ky, kb) { golpes.push({ x: this.x, y: this.y, d, col, kx, ky, kb }); } });
      G.EnemyMgr = { all: () => es };
      if (vistas) vm.runInContext(rd('js/net/vistas.js'), c, { filename: 'js/net/vistas.js' });
      if (vistas && datos) G.Vistas.deRed('B', ['vista', datos.w, datos.h, datos.ox || 0, datos.oy || 0]);
      vm.runInContext(`var __bomba = (p, who, pl) => { const mine = who === pl;\n${trozo}};`, c, { filename: 'js/game.js (la bomba de onCollect)' });
      c.__bomba({ kind: 'bomb' }, who, yo);
      const clave = e => Math.round(e.x) + ',' + Math.round(e.y);
      return { G, who, es, golpes, aros, k: new Set(golpes.map(clave)), clave, dmg: 60 + yo.level * 14 };
    };
    const igual = (x, quien) => { const q = new Set(x.es.filter(quien).map(x.clave)); return q.size > 0 && q.size === x.k.size && [...q].every(k => x.k.has(k)); };
    const rect = (v, w) => e => Math.abs(e.x - (w.x + (v.ox || 0))) < v.w / 2 && Math.abs(e.y - (w.y + (v.oy || 0))) < v.h / 2;
    const d2 = (a, b) => (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    const circulo = w => e => d2(e, w) <= R * R;
    const cuenta = x => x.k.size;

    // Un móvil de invitado (1266x585, corrida 31 a la izquierda y 37 abajo, como manda el HUD Dex compacto).
    const movil = bomba(), movilUp = bomba({ trozo: UPSTREAM }), sinAj = bomba({ ajuste: false }), sinDatos = bomba({ datos: null }), sinVistas = bomba({ vistas: false });
    const lados = [...movil.k].filter(k => !movilUp.k.has(k)).length, noVe = [...movilUp.k].filter(k => !movil.k.has(k)).length;
    t('bomba de un compañero con un móvil (bombaVistas): daña exactamente a los enemigos del rectángulo de SU vista (1266x585, con lo que la tiene corrida)',
      igual(movil, rect(VB, movil.who)), { golpeados: cuenta(movil), enSuVista: movil.es.filter(rect(VB, movil.who)).length });
    t('control: la condición de upstream (el trozo sin el gancho) daña al círculo del radio de la vista del ANFITRIÓN (465 px) alrededor del compañero; el ajuste alcanza a los de los lados de su pantalla y deja a los de arriba y abajo que no ve',
      igual(movilUp, circulo(movilUp.who)) && lados > 0 && noVe > 0, { upstream: cuenta(movilUp), conAjuste: cuenta(movil), soloConAjuste: lados, soloUpstream: noVe });
    t('sin el ajuste, sin la vista del compañero (otra versión, o aún no ha llegado) o sin vistas.js, exactamente lo de upstream',
      [sinAj, sinDatos, sinVistas].every(x => igual(x, circulo(x.who))), { sinAjuste: cuenta(sinAj), sinDatos: cuenta(sinDatos), sinVistas: cuenta(sinVistas), upstream: cuenta(movilUp) });
    // Un PC de invitado (720x450, sin corrimiento): su vista es más pequeña que el círculo de upstream; su bomba, como jugando solo.
    const pc = bomba({ datos: { w: VA.w, h: VA.h } }), pcUp = bomba({ trozo: UPSTREAM, datos: { w: VA.w, h: VA.h } });
    t('con un PC de invitado (720x450), su rectángulo: menos que el círculo de upstream (lo mismo que su bomba jugando solo)',
      igual(pc, rect({ w: VA.w, h: VA.h }, pc.who)) && cuenta(pc) < cuenta(pcUp), { conAjuste: cuenta(pc), upstream: cuenta(pcUp) });
    // La tuya, la del anfitrión: su pantalla (G.Camera.sees(x, y, 0)), con el ajuste o sin él.
    const tuya = bomba({ mia: true }), tuyaUp = bomba({ mia: true, trozo: UPSTREAM }), cam = tuya.G.Camera;
    t('tu bomba no cambia: tu pantalla, con el ajuste y con la condición de upstream', igual(tuya, e => cam.sees(e.x, e.y, 0)) && igual(tuyaUp, e => cam.sees(e.x, e.y, 0)),
      { conAjuste: cuenta(tuya), upstream: cuenta(tuyaUp) });
    const soloAj = bomba({ apariciones: false });
    t('bombaVistas no depende de aparicionVistas (sólo de la vista que manda el invitado)', igual(soloAj, rect(VB, soloAj.who)), { golpeados: cuenta(soloAj) });
    const inv = bomba({ host: false });
    t('sólo lo decide el anfitrión: en el invitado (que no aplica la bomba), bombaEnSuVista() dice que no', inv.G.Vistas.bombaEnSuVista(inv.who, false) === false && movil.G.Vistas.bombaEnSuVista(movil.who, false) === true,
      { invitado: inv.G.Vistas.bombaEnSuVista(inv.who, false) });
    t('el daño, el empuje y el aro, como upstream (60 + nivel × 14, el empuje desde quien la coge; el aro, del radio del anfitrión)',
      movil.golpes.every(g => g.d === movil.dmg && g.col === '#ff7b3d' && g.kb === 160 && g.kx === g.x - movil.who.x && g.ky === g.y - movil.who.y) && movil.aros.join() === movilUp.aros.join() && movil.aros[0] === Math.round(R),
      { aros: movil.aros, aroUpstream: movilUp.aros });
  } catch (e) { t('la bomba de un compañero con el trozo de onCollect()', false, String(e && e.stack || e)); }

  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`apariciones en grupo: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`apariciones en grupo: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

// ---------------- 29. cofres pequeños como blanco (G.MODS.cofreCercano) ----------------
function cofresChecks() {
  console.log('29. Cofres pequeños: tu Pokémon los ataca también con enemigos cerca (G.MODS.cofreCercano)');
  const c = { console }; c.window = c; c.G = {}; vm.createContext(c);
  for (const f of ['js/core/util.js', 'js/core/mods.js']) vm.runInContext(rd(f), c, { filename: f });
  const M = c.G.MODS, props = [
    { type: 'chest', x: 100, y: 0, hp: 22 }, { type: 'chest', x: 60, y: 0, hp: 0 }, { type: 'bigchest', x: 20, y: 0, hp: Infinity },
    { type: 'rock', x: 10, y: 0, hp: 10 }, { type: 'chest', x: 0, y: 140, hp: 5 }];
  c.G.World = { propsInCircle: (x, y, r) => props.filter(p => (p.x - x) ** 2 + (p.y - y) ** 2 <= r * r) };
  const pl = { x: 0, y: 0 }, r = [];
  r.push(['el cofre pequeño vivo más cercano (ni el roto, ni el del candado, ni la roca)', M.cofreBlanco === 150 && M.cofreCercano(pl) === props[0]]);
  props[0].hp = 0;
  r.push(['roto el primero, el siguiente a tiro', M.cofreCercano(pl) === props[4]]);
  r.push(['fuera de cofreBlanco, ninguno', M.cofreCercano({ x: 1000, y: 1000 }) === null]);
  M.cofreBlanco = 0;
  r.push(['con cofreBlanco = 0, como upstream', M.cofreCercano(pl) === null]);
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`cofres pequeños: ${r.length} casos bien`);
  for (const [name] of failed) bad('cofres pequeños: ' + name);
}

// ---------------- 28. el PokéCasino (js/systems/casino.js) ----------------
function casinoChecks() {
  console.log('28. PokéCasino «Danilo\'s Gamblers Club» (js/systems/casino.js): ruleta, pagos y el robo del Team Rocket');
  const c = { console }; c.window = c; c.G = {}; vm.createContext(c);
  for (const f of ['js/core/util.js', 'js/core/mods.js', 'js/systems/casino.js']) vm.runInContext(rd(f), c, { filename: f });
  const G = c.G, C = G.Casino, r = [];
  const t = (name, cond, detail) => r.push([name, !!cond, detail]);
  /** Azar de mentira: primero el número (n), luego la tirada del robo. */
  const azar = (n, robo = 0.5) => { const q = [(n + 0.5) / 37, robo]; return () => q.shift(); };
  const num = [...Array(37).keys()];
  t('la rueda europea: 37 casillas sin repetir, 18 rojos, 18 negros y el 0',
    C.RUEDA.length === 37 && new Set(C.RUEDA).size === 37 && num.filter(n => C.color(n) === 'rojo').length === 18 && num.filter(n => C.color(n) === 'negro').length === 18 && C.color(0) === 'cero');
  t('girar() da de 0 a 36 también en los extremos del azar', C.girar(() => 0) === 0 && C.girar(() => 0.999999) === 36);
  const s = () => ({ coins: 5000 });
  const a = s(), ra = C.apostar(a, 'rojo', 1000, azar(1)), b = s(), rb = C.apostar(b, 'negro', 1000, azar(1)), z = s(), rz = C.apostar(z, 'cero', 100, azar(0)), zr = s(), rzr = C.apostar(zr, 'rojo', 100, azar(0));
  t('pagos: rojo y negro 1 a 1, el 0 35 a 1, y con el 0 pierden rojo y negro',
    ra.gana && a.coins === 6000 && !rb.gana && b.coins === 4000 && rz.gana && z.coins === 5000 - 100 + 3600 && !rzr.gana && zr.coins === 4900, [a.coins, b.coins, z.coins, zr.coins]);
  t('estadísticas en save.casino', a.casino.tiradas === 1 && a.casino.apostado === 1000 && a.casino.ganado === 2000 && a.casino.robado === 0, a.casino);
  const e = [C.apostar(s(), 'verde', 100).error, C.apostar(s(), 'rojo', 5).error, C.apostar(s(), 'rojo', 6000).error, C.apostar(s(), 'rojo', 10.5).error];
  t('sólo rojo, negro o el 0, con la mínima y sin pasar de lo que tienes (y sin tocar la partida)', e.every(Boolean), e);
  const p1 = s(), r1 = C.apostar(p1, 'rojo', 1000, azar(2, 0.005)), p2 = { coins: 20000 }, r2 = C.apostar(p2, 'rojo', 10000, azar(1, 0.001)), p3 = s(), r3 = C.apostar(p3, 'rojo', 1000, azar(2, 0.01));
  t('robo del Team Rocket: con el 1 %, la mitad de la apuesta y como mucho 2000; con 0,01 o más, nada',
    r1.robo === 500 && p1.coins === 5000 - 1000 - 500 && r2.robo === 2000 && p2.coins === 20000 + 10000 - 2000 && r3.robo === 0 && p1.casino.robado === 500, [r1, r2, r3]);
  const p4 = { coins: 1000 }, r4 = C.apostar(p4, 'negro', 1000, azar(1, 0));
  t('el robo nunca deja las Pokémonedas en negativo', r4.robo === 0 && p4.coins === 0, r4);
  G.MODS.casino = null;
  t('sin G.MODS.casino, ni casino (activo() false) ni robo', !C.activo() && C.apostar(s(), 'rojo', 100, azar(2, 0)).robo === 0);
  const html = rd('dev.html');
  t('la pantalla: el cartel «Danilo\'s Gamblers Club», el botón «PokéCasino» del menú y las tres apuestas',
    /<h2 class="cas-cartel"[^>]*>Danilo's Gamblers Club<\/h2>/.test(html) && /data-go="casino">PokéCasino</.test(html) && ['rojo', 'negro', 'cero'].every(x => html.includes(`data-apuesta="${x}"`)));
  t('con Dex se entra desde el Gacha (#gacha-casino) y el botón del menú se esconde; con Clásico, desde el menú',
    /id="gacha-casino"/.test(html) && /html\.estilo-dex #scr-menu \.menu-item\[data-go="casino"\] \{ display: none; \}/.test(rd('css/nico.css')) && /\$\('gacha-casino'\)/.test(rd('js/systems/casino.js')));
  t('Meowth (#52) de crupier y los dos del Team Rocket en píxeles con su paleta', /G\.UI\.sprite\(m, 52,/.test(rd('js/systems/casino.js')) &&
    ['jessie', 'james'].every(k => C.ROCKET[k].rows.every(f => [...f].every(ch => ch === '.' || ch === 'k' || C.ROCKET[k].pal[ch]))));
  const en = rd('js/data/lang-en-mod.js'), faltan = ['PokéCasino', 'Ruleta de Pokémonedas', 'Rojo', 'Negro', 'El 0', 'Girar', 'La casa gana, nya… ¿Otra?', '¡Prepárate para los problemas! El Team Rocket te ha robado', C.FRASE_ROBO].filter(x => !en.includes(`'${x}'`));
  t('al robarte, el Team Rocket dice la frase de Nico', C.FRASE_ROBO.includes('Mejor me quedo este oro, al menos yo lo usaré para robar Pokémons y no lo tiraré aquí...') && /tr\(FRASE_ROBO\)/.test(rd('js/systems/casino.js')));
  t('los textos del casino tienen inglés', !faltan.length, faltan);
  const failed = r.filter(x => !x[1]);
  if (!failed.length) ok(`casino: ${r.length} casos bien`);
  for (const [name, , detail] of failed) bad(`casino: ${name}${detail !== undefined ? ' · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
}

(() => {
  try { grietaChecks(); } catch (e) { bad('no se pudo probar la grieta garantizada: ' + (e && e.stack || e)); }
  try { gachaChecks(); } catch (e) { bad('no se pudo probar el gacha y los tickets: ' + (e && e.stack || e)); }
  try { claridadChecks(); } catch (e) { bad('no se pudo probar la claridad en partida: ' + (e && e.stack || e)); }
  try { arreglosChecks(); } catch (e) { bad('no se pudo probar los arreglos de upstream: ' + (e && e.stack || e)); }
  try { pantallasChecks(); } catch (e) { bad('no se pudo probar las pantallas: ' + (e && e.stack || e)); }
  try { identidadChecks(); } catch (e) { bad('no se pudo probar la identidad visual: ' + (e && e.stack || e)); }
  try { hudDexChecks(); } catch (e) { bad('no se pudo probar el HUD Dex: ' + (e && e.stack || e)); }
  try { entornoChecks(); } catch (e) { bad('no se pudo probar los entornos del Gremio: ' + (e && e.stack || e)); }
  try { juegoChecks(); } catch (e) { bad('no se pudo probar los ajustes de juego: ' + (e && e.stack || e)); }
  try { divididaChecks(); } catch (e) { bad('no se pudo probar la pantalla dividida: ' + (e && e.stack || e)); }
  try { companeroChecks(); } catch (e) { bad('no se pudo probar «Elige a tu compañero»: ' + (e && e.stack || e)); }
  try { guarderiaChecks(); } catch (e) { bad('no se pudo probar la guardería: ' + (e && e.stack || e)); }
  try { trampasChecks(); } catch (e) { bad('no se pudo probar las trampas: ' + (e && e.stack || e)); }
  try { evoPartidaChecks(); } catch (e) { bad('no se pudo probar la evolución en partida: ' + (e && e.stack || e)); }
  try { devMenuChecks(); } catch (e) { bad('no se pudo probar el menú de pruebas: ' + (e && e.stack || e)); }
  try { mapasChecks(); } catch (e) { bad('no se pudo probar los mapas propios: ' + (e && e.stack || e)); }
  try { multiversoChecks(); } catch (e) { bad('no se pudo probar el Multiverso: ' + (e && e.stack || e)); }
  try { relieveChecks(); } catch (e) { bad('no se pudo probar el relieve, las sombras y la luz: ' + (e && e.stack || e)); }
  try { vistasChecks(); } catch (e) { bad('no se pudo probar las apariciones en grupo: ' + (e && e.stack || e)); }
  try { cofresChecks(); } catch (e) { bad('no se pudo probar los cofres pequeños: ' + (e && e.stack || e)); }
  try { casinoChecks(); } catch (e) { bad('no se pudo probar el casino: ' + (e && e.stack || e)); }
  console.log(fails ? `\nRESULTADO: ${fails} fallo(s), ${warns} aviso(s)` : `\nRESULTADO: todo bien (${warns} aviso(s))`);
  process.exit(fails ? 1 : 0);
})();
