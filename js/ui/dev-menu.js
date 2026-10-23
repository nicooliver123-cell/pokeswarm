/* ============ dev-menu.js — menú de pruebas de Nico (MOD nico) ============
 * Petición de Nico (14-10-2026): en Ajustes > Cuenta, sólo con su cuenta, botones para sumarse tickets del gacha y
 * Pokémonedas y probar el gacha, las mejoras y la guardería sin jugar horas. Desde el 15-10-2026, también uno que
 * desbloquea toda la colección (los 966 y el Multiverso) con su shiny (desbloquearTodo). Desde el 22-10-2026, otro que
 * además sube al máximo todas las mejoras de cada uno (maximizarTodo).
 *
 * Quién lo ve: una sesión de la nube (no invitado) cuyo uid de Firebase tiene una huella de G.MODS.devHuellas. El
 * repositorio es público, así que no se guarda el uid sino su SHA-256 con la sal de abajo (como tools/nico/base.js).
 * Para añadir una cuenta: su UID (Firebase > Authentication > Usuarios) y
 *   node -e "console.log(require('crypto').createHash('sha256').update('pokeswarm/dev/1\0' + '<UID>').digest('hex'))"
 * Es una comodidad, no seguridad: la partida la guarda el propio navegador, así que quien tenga una cuenta ya podía
 * cambiar la suya desde la consola. Lo que se suma no toca el ranking (que es de tiempo) ni las estadísticas.
 *
 * Gancho de una línea en settings-ui.js (render, con los de Estilo y Encuadre). Sin este fichero, Ajustes como antes.
 */
G.DevMenu = (() => {
  const SAL = 'pokeswarm/dev/1\0';
  const cache = new Map();   // uid -> Promise<bool>

  async function huella(texto) {
    const datos = new TextEncoder().encode(SAL + texto);
    const h = await crypto.subtle.digest('SHA-256', datos);
    return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /** ¿La sesión es de una cuenta con menú de pruebas? → Promise<bool>. */
  function permitido() {
    const lista = (G.MODS && G.MODS.devHuellas) || [];
    const fb = G.DB && G.DB.fb;
    if (!lista.length || !fb || !fb.uid || G.DB.guest || typeof crypto === 'undefined' || !crypto.subtle) return Promise.resolve(false);
    if (!cache.has(fb.uid)) cache.set(fb.uid, huella(fb.uid).then(h => lista.includes(h)).catch(() => false));
    return cache.get(fb.uid);
  }

  const BOTONES = [
    { id: 't1', txt: '+10 tickets', fn: s => { s.tickets.t1 += 10; } },
    { id: 't10', txt: '+1 ticket ×10', fn: s => { s.tickets.t10 += 1; } },
    { id: 'c1', txt: '+1.000 Pokémonedas', fn: s => { s.coins += 1000; } },
    { id: 'c10', txt: '+10.000 Pokémonedas', fn: s => { s.coins += 10000; } },
    // Petición de Nico (15-10-2026): toda la colección, también el Multiverso, con su shiny si el juego lo tiene.
    { id: 'todo', txt: 'Desbloquear todos (con shiny)', fn: s => {
      const r = desbloquearTodo(s);
      return `Desbloqueados ${r.nuevos} Pokémon y ${r.shinies} shiny (${r.total} en la colección)`;
    } },
    // Petición de Nico (22-10-2026): todos, Multiverso incluido, y con todas sus mejoras al máximo.
    { id: 'max', txt: 'Todos al máximo', fn: s => {
      const r = maximizarTodo(s);
      return `${r.total} Pokémon con todas las mejoras al máximo (${r.subidas} niveles subidos)`;
    } }
  ];

  /** Todo G.DEX (los 966 y el Multiverso) en owned y, si su sprite tiene versión shiny, en shiny. No quita nada ni
   *  pisa lo que ya estaba (conserva su fecha y su origen); lo nuevo, con from: 'dev'. → { nuevos, shinies, total }. */
  function desbloquearTodo(s) {
    const ahora = Date.now(), conShiny = d => !!(G.Sprites && G.Sprites.hasShiny ? G.Sprites.hasShiny(d) : false);
    s.owned = s.owned || {};
    s.shiny = s.shiny || {};
    let nuevos = 0, shinies = 0;
    for (const p of G.DEX) {
      if (!s.owned[p.dex]) { s.owned[p.dex] = { at: ahora, from: 'dev' }; nuevos++; }
      if (conShiny(p.dex) && !s.shiny[p.dex]) { s.shiny[p.dex] = { at: ahora, from: 'dev' }; shinies++; }
    }
    return { nuevos, shinies, total: Object.keys(s.owned).length };
  }

  /** desbloquearTodo() y, para cada uno de G.DEX, cada mejora de G.Upgrades.LIST a su máximo (en save.pupg, como la
   *  tienda). Nunca baja un nivel. → { total, subidas } (subidas: niveles sumados). */
  function maximizarTodo(s) {
    desbloquearTodo(s);
    s.pupg = s.pupg || {};
    let subidas = 0;
    for (const p of G.DEX) {
      const lv = s.pupg[p.dex] = s.pupg[p.dex] || {};
      for (const u of G.Upgrades.LIST) if ((lv[u.id] || 0) < u.max) { subidas += u.max - (lv[u.id] || 0); lv[u.id] = u.max; }
    }
    return { total: G.DEX.length, subidas };
  }

  /** Gancho de settings-ui.js (render): la sección al final de Cuenta, si la cuenta tiene permiso. */
  function ajustes(box, tab) {
    if (!box || tab !== 'acc') return;
    permitido().then(ok => {
      if (!ok || !box.isConnected || box.querySelector('#dev-menu')) return;
      box.insertAdjacentHTML('beforeend', `<div id="dev-menu"><h3 class="set-h">Menú de pruebas</h3>
        <p class="sub">Sólo lo ve tu cuenta. Suma a tu partida guardada; no cuenta para el ranking.</p>
        <div class="row wrap" style="gap:8px">${BOTONES.map(b => `<button class="btn small" data-dev="${b.id}">${b.txt}</button>`).join('')}</div></div>`);
      box.querySelectorAll('[data-dev]').forEach(el => {
        el.onclick = () => {
          const b = BOTONES.find(x => x.id === el.dataset.dev), s = G.DB.save;
          if (!b || !s) return;
          s.tickets = Object.assign({ t1: 0, t10: 0 }, s.tickets);
          const msg = b.fn(s);
          G.DB.commit(true);
          G.Audio.sfx('buy');
          G.UI.refreshCoins();
          G.UI.toast(msg || b.txt);   // los totales ya están en la barra de arriba
        };
      });
    });
  }

  return { ajustes, permitido, huella, desbloquearTodo, maximizarTodo };
})();
