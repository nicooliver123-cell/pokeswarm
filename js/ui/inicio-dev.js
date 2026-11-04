/* ============ inicio-dev.js — «Inicio de partida (pruebas)» en Mejoras (MOD nico) ============
 * Petición de Nico (04-11-2026): «con mi user, tenga una opción en mejora para elegir a qué nivel empiezo y con qué
 * ataques». En la pantalla Mejoras, para el Pokémon elegido en su selector, un panel con:
 *   - el nivel con el que empieza la run (1 a NIVEL_MAX);
 *   - hasta 4 ataques (los huecos de pl.maxMoves) de los que puede aprender: los de G.Moves.poolFor() del Pokémon y
 *     de sus evoluciones (G.EVO, que puede alcanzar dentro de la partida con js/systems/evo-partida.js), cada uno con
 *     su nivel de mejora (1 a def.maxLvl) y, al máximo, «evolucionado» si el ataque tiene evolución (G.Moves.EVO).
 *
 * Quién lo ve y a quién se aplica: la misma condición que el menú de pruebas (G.DevMenu.permitido(): una sesión de la
 * nube, no invitado, cuyo uid tenga su huella en G.MODS.devHuellas). startRun es síncrono, así que al empezar se mira
 * G.DevMenu.permitidoYa(), que se adelanta al llegar al menú (goMenu) y al abrir Mejoras. Cualquier otra cuenta no ve el
 * panel y, aunque su partida guardada tuviera el campo, juega como siempre.
 *
 * Cómo arranca la run (aplicar(), al final de startRun):
 *   - Ataques: si hay alguno elegido, sustituyen al inicial y al segundo de «Repertorio»; sin ninguno, como siempre.
 *   - Nivel N (sólo en solitario): pl.level = N con xpNext = Player.xpFor(N) y N-1 subidas pendientes, que salen como
 *     cartas normales al empezar (maybeLevelUp). El nivel sólo da poder por sus cartas, así que significa lo mismo que
 *     si se hubiera ganado, y la evolución en partida sale según ese nivel. En grupo el nivel es del equipo (el
 *     invitado lo recibe del anfitrión en syncTeam), así que sólo se aplican los ataques, que son personales: los
 *     demás los ven como cualquier otro, por el id, el nivel y la evolución de cada lanzamiento ('c' de coop.js).
 *   - Ranking (decisión de Nico, 04-11-2026: «Quiero que cuenten para el ranking»): estas runs cuentan, sin ninguna
 *     marca de G.Guard. El aviso «nivel» de guard.js (p.level > 10 + tiempo / 4) saltaría al empezar alto, así que en
 *     ellas su umbral sube en los niveles de serie (margenNivel, gancho de una línea en guard.js); el resto de runs,
 *     igual. Los demás avisos no dependen de esto: los ataques mejorados no tocan pl.atk ni la vida, y las cartas de
 *     las subidas tienen sus topes de siempre. OJO: firestore.rules (validEntry) exige lv <= 10 + t / 4 y no se ha
 *     tocado, así que el servidor rechaza la marca de una run que acaba con más nivel que eso (empezar alto y morir
 *     pronto); la partida, las monedas y los récords locales sí cuentan.
 *
 * «Lanzar todos los ataques a la vez» (petición de Nico, 04-11-2026: «otra opción que haga que todas las habilidades se
 * tiren a la vez»): una casilla del mismo panel. Encendida, combat.js lanza los ataques de TODOS los huecos (pl.slots,
 * vínculos incluidos), no sólo el activo, cada uno con su recarga (m.t / m.cd); vale también para los que aprendes en
 * la run (lanzables() mira pl.slots en cada fotograma). Es GLOBAL (save.inicioDevTodos), no por Pokémon: es una forma
 * de jugar, no una preparación de un Pokémon concreto, y así no hay que encenderla en cada uno. Se aplica también en
 * grupo (los ataques son tuyos): cada lanzamiento viaja como siempre ('c' de coop.js) y los demás lo ven; las órbitas
 * de los huecos no activos, no (de las órbitas sólo viaja la del hueco activo, en el estado del jugador). Cambiar de
 * hueco sigue funcionando (elige cuál sale destacado en el HUD) y borra los orbes, que reaparecen al momento; la Cinta
 * Elección (+40 % de daño) se aplica a todos. Cuenta para el ranking, como el resto del panel.
 *
 * Datos: save.inicioDev[dex] = { activo, nivel, ataques: [{ id, lvl, evo }] }. Va dentro de la partida, que se sube
 * entera a la nube (firestore.rules sólo exige que `save` sea un mapa) y merge() de db.js se queda con la versión más
 * reciente: llega a los dos dispositivos de Nico. Se limpia al leerlo (normalizar): ids que no existen, repetidos,
 * niveles fuera de rango y más de 4 ataques se descartan.
 *
 * Ganchos de una línea (// MOD nico): game.js (startRun, tras G.Guard.start; goMenu, preparar), menu.js (final de
 * renderUpgrades, panel) y guard.js (tick, margenNivel). El script, en dev.html tras dev-menu.js. Estilos en css/nico.css (bloque 1), inglés en
 * js/data/lang-en-mod.js. Pruebas: tools/nico/check.js §31. Sin este fichero, Mejoras y las runs como antes.
 */
G.InicioDev = (() => {
  const NIVEL_MAX = 50;
  const HUECOS = 4;   // los de pl.maxMoves en player.js

  const puede = () => !!(G.DevMenu && G.DevMenu.permitidoYa && G.DevMenu.permitidoYa());

  /** Gancho de goMenu: calcula ya la huella para que startRun la tenga resuelta. */
  function preparar() {
    if (G.DevMenu && G.DevMenu.permitido) G.DevMenu.permitido().catch(() => false);
  }

  /** El Pokémon y todas sus evoluciones (G.EVO: padre -> hijos), sin repetir. */
  function linea(dex) {
    const out = [], ver = new Set([dex]);
    for (let i = 0, cola = [dex]; i < cola.length; i++) {
      const d = cola[i];
      if (G.DEX_BY && G.DEX_BY[d]) out.push(d);
      for (const h of (G.EVO && G.EVO[d]) || []) if (!ver.has(h)) { ver.add(h); cola.push(h); }
    }
    return out;
  }

  /** Ataques que puede llevar: los suyos y, detrás, los que sólo aprenden sus evoluciones. → [{ id, de }] (de: dex de
   *  la evolución que lo trae, o null si es suyo). */
  function ataquesDe(dex) {
    const [yo, ...evos] = linea(dex);
    if (!yo) return [];
    const propios = G.Moves.poolFor(G.DEX_BY[yo]);
    const out = propios.map(id => ({ id, de: null })), ya = new Set(propios);
    for (const e of evos) for (const id of G.Moves.poolFor(G.DEX_BY[e])) if (!ya.has(id)) { ya.add(id); out.push({ id, de: e }); }
    return out;
  }

  /** ¿Este ataque tiene evolución (al nivel máximo)? */
  const evolucionable = id => {
    const d = G.Moves.BY_ID[id];
    return !!(d && G.Moves.EVO[id] && G.Moves.EVO_MODS && G.Moves.EVO_MODS[d.kind]);
  };

  /** Lo guardado, limpio. → { activo, nivel, ataques } o null. */
  function normalizar(cfg, dex) {
    if (!cfg || typeof cfg !== 'object') return null;
    const validos = new Set(ataquesDe(dex).map(a => a.id)), ataques = [];
    for (const a of Array.isArray(cfg.ataques) ? cfg.ataques : []) {
      const d = a && G.Moves.BY_ID[a.id];
      if (!d || !validos.has(a.id) || ataques.some(x => x.id === a.id) || ataques.length >= HUECOS) continue;
      const lvl = Math.max(1, Math.min(d.maxLvl, Math.floor(+a.lvl || 1)));
      ataques.push({ id: a.id, lvl, evo: !!a.evo && lvl === d.maxLvl && evolucionable(a.id) });
    }
    return { activo: !!cfg.activo, nivel: Math.max(1, Math.min(NIVEL_MAX, Math.floor(+cfg.nivel || 1))), ataques };
  }

  const leer = (save, dex) => normalizar(save && save.inicioDev && save.inicioDev[dex], dex);

  /** Gancho de startRun (tras G.Guard.start). Prepara al jugador y devuelve las subidas de nivel pendientes. */
  function aplicar(pl, mon, coop) {
    if (!pl || !mon || !puede()) return 0;
    pl.todosALaVez = !!(G.DB.save && G.DB.save.inicioDevTodos);   // global, también en grupo (es de tu Pokémon)
    const cfg = leer(G.DB.save, mon.dex);
    if (!cfg || !cfg.activo) return 0;
    let pendientes = 0;
    if (cfg.ataques.length) {
      pl.moves = []; pl.slots = []; pl.active = 0;
      for (const a of cfg.ataques) {
        if (!pl.addMove(a.id)) continue;
        const m = pl.moves[pl.moves.length - 1];
        while (m.lvl < a.lvl && G.Moves.levelUp(m)) { /* sube por la escalera de su tipo */ }
        if (a.evo) G.Moves.evolve(m);
      }
      if (!pl.moves.length) pl.addMove(G.startMoveOf(mon.dex));   // nunca sin ataques
      pl.setActive(0);
    }
    if (!coop && cfg.nivel > 1) {
      pl.level = cfg.nivel; pl.xp = 0; pl.xpNext = G.Player.xpFor(cfg.nivel);
      pl.nivelInicioDev = cfg.nivel;   // para margenNivel (guard.js)
      pendientes = cfg.nivel - 1;
    }
    return pendientes;
  }

  /** Gancho de guard.js (tick, el aviso «nivel»): los niveles que la run trae de serie. El umbral de upstream
   *  (10 + tiempo / 4) sube en lo mismo, sólo en estas runs; las demás, igual que siempre. */
  const margenNivel = p => (p && p.nivelInicioDev > 1 ? p.nivelInicioDev - 1 : 0);

  /** Gancho de combat.js (tick): lo que se lanza este fotograma. Con «Todos a la vez», los ataques de todos los huecos
   *  (se mira cada fotograma, así que entran también los que aprendes en la run), cada uno con su recarga; si no, el
   *  hueco activo, como upstream. */
  const lanzables = pl => (pl.todosALaVez ? pl.slots.flat() : pl.activeGroup());

  // ---------------- el panel de Mejoras ----------------

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nombre = id => (G.Moves.BY_ID[id] || {}).name || id;

  function guardar(dex, cfg) {
    const s = G.DB.save;
    if (!s) return;
    s.inicioDev = s.inicioDev || {};
    if (cfg) s.inicioDev[dex] = cfg; else delete s.inicioDev[dex];
    G.DB.commit();
  }

  /** Gancho de renderUpgrades: el panel debajo de la lista de mejoras, si la cuenta tiene permiso. */
  function panel(lista, dex) {
    if (!lista || !G.DevMenu || !G.DevMenu.permitido) return;
    G.DevMenu.permitido().then(ok => {
      const viejo = document.getElementById('inicio-dev');
      if (!ok || !lista.isConnected || !G.DB.save || !G.DEX_BY[dex]) { if (viejo) viejo.remove(); return; }
      const el = document.createElement('div');
      el.id = 'inicio-dev';
      el.className = 'panel ini-dev';
      if (viejo) viejo.replaceWith(el); else lista.insertAdjacentElement('afterend', el);
      pintar(el, dex);
    }).catch(() => {});
  }

  function pintar(el, dex) {
    const mon = G.DEX_BY[dex];
    const cfg = leer(G.DB.save, dex) || { activo: false, nivel: 1, ataques: [] };
    const todos = ataquesDe(dex).sort((a, b) => (a.de !== null) - (b.de !== null) || nombre(a.id).localeCompare(nombre(b.id), 'es'));
    const filas = [];
    for (let i = 0; i < HUECOS; i++) {
      const a = cfg.ataques[i], d = a && G.Moves.BY_ID[a.id];
      const otros = new Set(cfg.ataques.filter((_, j) => j !== i).map(x => x.id));
      const ops = todos.filter(x => !otros.has(x.id)).map(x => {
        const def = G.Moves.BY_ID[x.id], tipo = (G.U.TYPE_NAME && G.U.TYPE_NAME[def.type]) || def.type;
        const extra = x.de ? ' · ' + (G.DEX_BY[x.de] ? G.DEX_BY[x.de].name : '') : '';
        return `<option value="${esc(x.id)}"${a && a.id === x.id ? ' selected' : ''}>${esc(def.name)} (${esc(tipo)}${esc(extra)})</option>`;
      }).join('');
      let niveles = '<option value="1">Nv. 1</option>';
      if (d) {
        niveles = '';
        for (let l = 1; l <= d.maxLvl; l++) niveles += `<option value="${l}"${!a.evo && a.lvl === l ? ' selected' : ''}>${l === d.maxLvl ? `Nv. ${l} (máx.)` : `Nv. ${l}`}</option>`;
        if (evolucionable(a.id)) niveles += `<option value="evo"${a.evo ? ' selected' : ''}>Evolucionado (${esc(G.Moves.EVO[a.id][0])})</option>`;
      }
      filas.push(`<div class="ini-ataque">
          <span class="ini-ic" aria-hidden="true">${d && G.Icons ? G.Icons.html('move:' + a.id, 24) : ''}</span>
          <label class="ini-n" for="ini-a${i}">Ataque ${i + 1}</label>
          <select id="ini-a${i}" class="field ini-mov" data-i="${i}"><option value="">Ninguno</option>${ops}</select>
          <select id="ini-l${i}" class="field ini-lvl" data-i="${i}" aria-label="Nivel del ataque ${i + 1}"${d ? '' : ' disabled'}>${niveles}</select>
        </div>`);
    }
    el.innerHTML = `<h3 class="set-h">Inicio de partida (pruebas)</h3>
      <p class="sub">Sólo lo ve tu cuenta. Cuenta para el ranking. En grupo sólo se aplican los ataques.</p>
      <label class="ini-usar"><input type="checkbox" id="ini-todos"${G.DB.save.inicioDevTodos ? ' checked' : ''}> <span>Lanzar todos los ataques a la vez</span></label>
      <p class="ini-nota ini-todos-nota">Con cualquier Pokémon: todos los huecos disparan, cada ataque con su recarga.</p>
      <label class="ini-usar"><input type="checkbox" id="ini-on"${cfg.activo ? ' checked' : ''}> <span>Empezar así con ${esc(mon.name)}</span></label>
      <div class="ini-nivel">
        <label for="ini-nivel">Nivel inicial</label>
        <input id="ini-nivel" class="field" type="number" min="1" max="${NIVEL_MAX}" step="1" inputmode="numeric" value="${cfg.nivel}">
        <span class="ini-nota">Las subidas salen como cartas al empezar.</span>
      </div>
      <div class="ini-ataques">${filas.join('')}</div>
      <div class="ini-pie">
        <span class="ini-nota">Sin ataques elegidos, empieza con el de siempre.</span>
        <button class="btn small ghost" id="ini-borrar" type="button">Restablecer</button>
      </div>`;

    const leerForm = () => {
      const ataques = [];
      for (let i = 0; i < HUECOS; i++) {
        const id = el.querySelector('#ini-a' + i).value, l = el.querySelector('#ini-l' + i).value;
        if (!id) continue;
        const d = G.Moves.BY_ID[id];
        const antes = cfg.ataques[i] && cfg.ataques[i].id === id;   // al cambiar de ataque, vuelve a nivel 1
        ataques.push(l === 'evo' && antes ? { id, lvl: d.maxLvl, evo: true } : { id, lvl: antes ? +l || 1 : 1, evo: false });
      }
      return { activo: el.querySelector('#ini-on').checked, nivel: el.querySelector('#ini-nivel').value, ataques };
    };
    const cambiar = (e, activar) => {
      const nuevo = leerForm();
      if (activar) nuevo.activo = true;   // tocar el nivel o un ataque lo activa; la casilla lo apaga sin perderlo
      const limpio = normalizar(nuevo, dex);
      guardar(dex, limpio);
      const foco = e && e.target && e.target.id;
      pintar(el, dex);
      const f = foco && el.querySelector('#' + foco);
      if (f) f.focus();
      if (G.Audio) G.Audio.sfx('select');
    };
    el.querySelector('#ini-on').onchange = e => cambiar(e, false);
    el.querySelector('#ini-todos').onchange = e => {
      G.DB.save.inicioDevTodos = !!e.target.checked;
      G.DB.commit();
      if (G.Audio) G.Audio.sfx('select');
    };
    el.querySelector('#ini-nivel').onchange = e => cambiar(e, true);
    el.querySelectorAll('.ini-mov, .ini-lvl').forEach(s => { s.onchange = e => cambiar(e, true); });
    el.querySelector('#ini-borrar').onclick = () => {
      guardar(dex, null);
      pintar(el, dex);
      el.querySelector('#ini-borrar').focus();
      if (G.UI) G.UI.toast(`${mon.name}: empieza como siempre`);
    };
  }

  return { preparar, aplicar, margenNivel, lanzables, panel, normalizar, leer, linea, ataquesDe, NIVEL_MAX, HUECOS };
})();
