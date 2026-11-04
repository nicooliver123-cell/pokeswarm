/* ============ invocar.js — «¡Te elijo a ti!»: los Pokémon de Ash (MOD nico) ============
 * Petición de Nico (23-10-2026): Ash, del Multiverso, ataca invocando a sus Pokémon. Es una forma de ataque nueva,
 * `summon`: al lanzarla sale un Pokémon de la Poké Ball (`pk`, su número en la Pokédex; `pkEvo` al evolucionar el
 * ataque) que durante `dur` segundos corre hacia el enemigo más cercano sin alejarse de su entrenador (CORREA) y usa
 * él solo su golpe (`golpe`: una forma de las de siempre —proyectil, abanico, golpe, embestida, bumerán, aura— con
 * sus números) y vuelve a la Poké Ball. `count` Pokémon a la vez (`evoMas` más al evolucionar: la Escuadra Squirtle).
 *
 * Cómo pega: el golpe lo lanza G.Combat.castAs() con un «lanzador delegado»: la posición y el apuntado son los del
 * Pokémon; el ataque (pl.atk, con sus potenciadores) y todo lo demás, los de Ash. Así cada golpe se ve, suena y daña
 * igual que esa forma, y en cooperativo funciona como cualquier ataque: lo simula quien lo lanza y los demás lo ven
 * como fantasma (sin daño), porque la invocación llega por ghostCast igual que las demás.
 *
 * Extras: `cura` (vida por segundo a Ash mientras está fuera: Bulbasaur) y `atrae` (atrae a los enemigos de su radio
 * `radioAtrae` hacia él: Snorlax, el escudo; sólo quien manda en los enemigos, en solitario o el anfitrión).
 * Los invocados no reciben daño ni chocan con los enemigos (no hay vida que sincronizar en cooperativo).
 *
 * Cómo se ve (pulido del 24-10-2026): Ash lanza la Poké Ball hacia delante, el Pokémon sale donde cae con un destello y
 * su nombre («¡Charizard!»), espera a un lado de Ash (según su tamaño, sin amontonarse con él) y vuelve con el rayo rojo
 * de la Poké Ball. Se dibuja ordenado por Y con la escena (drawables, gancho en drawScene de game.js; así no tapa a Ash);
 * la Poké Ball y el rayo, por encima (draw, en drawAirFields). La primera vez de la partida que Ash tiene dos, el
 * rótulo «Cambia de ataque: ¡puedes tener a todos tus Pokémon fuera a la vez!».
 *
 * Sin tope de Pokémon fuera (Nico, 04-11-2026: «quita el límite de Pokémons a la vez de ash»; MAX_FUERA era 3, y 2
 * hasta el 02-11-2026): sigue fuera cada uno que se lanzó mientras le dure su tiempo (`dur`). El tope natural son los
 * huecos (4) más los `evoMas` (la Escuadra Squirtle); con «Lanzar todos los ataques a la vez» (js/ui/inicio-dev.js)
 * salen los cuatro juntos.
 *
 * Ganchos de una línea en combat.js (run, updateFields, drawAirFields, clearFields y castAs), game.js (drawScene),
 * moves.js (expone EVO_MODS) e icons.js (la insignia de la forma); la escalera y la evolución de la forma, en multiverso.js.
 */
G.Invocar = (() => {
  const CORREA = 190;       // px: lo más lejos de su entrenador que va un invocado
  const VISTA = 300;        // px: a qué distancia busca enemigos
  const VELOCIDAD = 200;    // px/s (165 hasta el 02-11-2026: tardaban en llegar a los enemigos)
  const ESCALA = 0.9;       // un poco más pequeños que Ash
  const precargados = new Set();
  const VUELO = 0.32;       // s: la Poké Ball volando de Ash a su sitio («¡Te elijo a ti!»)
  const VUELTA = 0.4;       // s: el rayo rojo que lo devuelve a la Poké Ball
  let lista = [];
  let consejo = false;      // el consejo de cambiar de ataque, una vez por partida

  /** Radio del cuerpo del Pokémon (los grandes, como Snorlax, se ponen más lejos de Ash). */
  const radio = dex => (G.Sprites && G.Sprites.bodyRadius ? G.Sprites.bodyRadius(dex, ESCALA) : 9) || 9;

  /** Lo que lanza combat.js (run) al usar un ataque `summon`. Sólo se lanza el ataque ACTIVO (combat.js): mientras lo
   *  está, su Pokémon se queda fuera (cada lanzamiento le renueva el tiempo, recarga < tiempo fuera); al cambiar de
   *  ataque, sigue peleando hasta agotar su tiempo. Así Ash junta a todos cambiando de ranura (sin tope desde el
   *  04-11-2026). */
  function lanzar(pl, m, ghost) {
    const n = Math.max(1, (m.count | 0) || 1) + (m.evolved ? (m.evoMas | 0) : 0);
    const dex = (m.evolved && m.pkEvo) || m.pk;
    const shiny = !!m.pkShiny && !!(G.Sprites && G.Sprites.hasShiny && G.Sprites.hasShiny(dex));   // el Noctowl de Ash de Johto era variocolor
    if (G.Sprites && G.Sprites.preload && !precargados.has(dex + (shiny ? 's' : ''))) { precargados.add(dex + (shiny ? 's' : '')); G.Sprites.preload([dex], undefined, shiny); }   // si no, sale una bolita gris mientras baja
    const suyos = lista.filter(s => s.owner === pl && s.id === m.id && !s.vuelve);
    if (suyos.length === n && suyos.every(s => s.dex === dex)) {   // ya está fuera: más tiempo y su nivel de ahora
      for (const s of suyos) { s.t = 0; s.life = m.dur || 6; s.m = m; }
      return;
    }
    for (const s of suyos) s.vuelve = VUELTA;   // otro número u otra forma (ha evolucionado): vuelven y salen los nuevos
    // «¡Te elijo a ti!»: Ash lanza la Poké Ball hacia delante y el Pokémon sale donde cae (VUELO s después).
    const r = radio(dex), lejos = (pl.r || 10) + r + 22;
    for (let i = 0; i < n; i++) {
      const a = (pl.aim || 0) + (i - (n - 1) / 2) * 0.7;
      const s = { owner: pl, ghost, id: m.id, m, dex, i, x: pl.x + Math.cos(a) * lejos, y: pl.y + Math.sin(a) * lejos * 0.75,
                  desdeX: pl.x, desdeY: pl.y, t: -VUELO, life: m.dur || 6, golpeT: 0.35 + i * 0.12, vuelve: 0, r,
                  anim: G.Sprites ? new G.Sprites.Animator(dex, ESCALA, shiny) : null };
      lista.push(s);
    }
    // El consejo, la primera vez en la partida que Ash tiene dos Pokémon: cambiar de ataque para juntarlos.
    if (!ghost && !consejo && G.Game && G.Game.player === pl && (pl.moves || []).filter(x => x.kind === 'summon').length >= 2 && G.Spawner && G.Spawner.say) {
      consejo = true;
      G.Spawner.say('Cambia de ataque: ¡puedes tener a todos tus Pokémon fuera a la vez!', 3.6, true);
    }
  }

  /** El nombre del Pokémon que sale (el evolucionado, si lo es: «¡Charizard!»). */
  const nombre = s => (G.DEX_BY && G.DEX_BY[s.dex] ? G.DEX_BY[s.dex].name : s.m.name);

  /** Al caer la Poké Ball: el destello y su nombre. */
  function sale(s) {
    if (!G.FX) return;
    G.FX.ring(s.x, s.y, 4, 30, '#ffffff', 0.35, 2);
    G.FX.burst(s.x, s.y - 12, '#ffffff', 10, 110);
    if (s.i === 0) G.FX.dmgText(s.x, s.y - s.r * 2 - 10, '¡' + nombre(s) + '!', (G.U.TYPE_COLOR || {})[s.m.type] || '#ffffff');
  }

  /** El golpe del Pokémon con los números del ataque: el daño (`dmg`) sube con la escalera y la evolución. */
  function golpe(s) {
    const m = s.m, g = m.golpe || {};
    return Object.assign({ id: m.id + '#golpe', name: m.name, type: m.type, vis: m.vis, lvl: m.lvl, t: 0 }, g,
      { dmg: m.dmg * (g.dmgK || 1), count: (g.count || 1) + (m.evolved && g.evoCount ? g.evoCount : 0), cd: (g.cd || 0.6) * (m.rate || 1) });
  }

  /** Lanzador delegado: el Pokémon en su sitio, apuntando a su blanco; lo demás (ataque, vida…), del entrenador. */
  function delegado(s, tg) {
    const pl = s.owner;
    const d = Object.create(pl);
    Object.defineProperties(d, {
      x: { value: s.x, writable: true }, y: { value: s.y, writable: true },
      aim: { value: Math.atan2(tg.y - s.y, tg.x - s.x), writable: true },
      target: { value: tg, writable: true }, r: { value: s.r, writable: true },
      invuln: { value: 0, writable: true }, lastPatch: { value: null, writable: true },
      hp: { get: () => pl.hp, set: v => { pl.hp = v; } },
      dmgDealt: { get: () => pl.dmgDealt, set: v => { pl.dmgDealt = v; } },
      bellHeal: { get: () => pl.bellHeal, set: v => { pl.bellHeal = v; } }   // el Cascabel Concha cura a Ash con todos sus golpes
    });
    return d;
  }

  const alcanceDe = g => g.kind === 'melee' ? g.radius + 20 : g.kind === 'aura' ? g.radius : g.kind === 'dash' ? g.radius + 40
    : g.kind === 'boomerang' ? g.radius : g.kind === 'chain' ? 240 : g.kind === 'cone' ? (g.speed || 300) * (g.life || 0.4) + 20 : (g.speed || 300) * (g.life || 1);

  /** Blanco del invocado, con el criterio del jugador (player.js) desde su sitio y sin salirse de la correa: un cofre
   *  pequeño cerca de él (G.MODS.cofreCercano: a menos de cofreBlanco px y sin pared por medio) por delante del enemigo
   *  vivo más cercano; sin enemigos a la vista, la roca o el cofre más cercano (G.World.nearestBreakable). Arreglo del
   *  04-11-2026 (Nico: «Los Pokémon de Ash no atacan a los cofres»): antes sólo buscaban enemigos y, como Ash no ataca
   *  él mismo, los cofres pequeños no recibían nunca un golpe. El blanco puede ser un objeto ({ x, y, r, hp }): sus
   *  golpes (castAs) dañan objetos como los del jugador, con propsInCircle; los de un fantasma, no. */
  function blanco(s, pl, enemigos) {
    const enCorrea = o => (o.x - pl.x) ** 2 + (o.y - pl.y) ** 2 < (CORREA + 60) ** 2;
    const objetos = !(s.m && s.m.golpe && s.m.golpe.kind === 'chain');   // la cadena (Rayo) no daña objetos, como la de upstream
    const cofre = objetos && G.MODS && G.MODS.cofreCercano ? G.MODS.cofreCercano(s, 0, null) : null;
    if (cofre && enCorrea(cofre)) return cofre;
    let tg = null, mejor = VISTA * VISTA;
    for (const e of enemigos) {
      if (e.dead) continue;
      const d2 = (e.x - s.x) ** 2 + (e.y - s.y) ** 2;
      if (d2 < mejor && enCorrea(e)) { mejor = d2; tg = e; }
    }
    if (tg) return tg;
    const roca = objetos && G.World && G.World.nearestBreakable ? G.World.nearestBreakable(s.x, s.y, 200) : null;
    return roca && enCorrea(roca) ? roca : null;
  }

  function update(dt) {
    const enemigos = G.EnemyMgr ? G.EnemyMgr.all() : [];
    const manda = !(G.Coop && G.Coop.active) || G.Coop.isHost;
    for (let k = lista.length - 1; k >= 0; k--) {
      const s = lista[k], pl = s.owner, m = s.m;
      const antes = s.t;
      s.t += dt;
      if (antes < 0 && s.t >= 0) sale(s);
      if (s.t < 0) continue;   // la Poké Ball aún vuela
      if (pl.dead || s.t >= s.life) s.vuelve = s.vuelve || VUELTA;
      if (s.vuelve) {
        s.vuelve -= dt;
        if (s.vuelve <= 0) lista.splice(k, 1);
        if (s.anim) s.anim.update(dt);
        continue;
      }
      const tg = blanco(s, pl, enemigos);
      const g = m.golpe || {}, alc = alcanceDe(g);
      let ax, ay;
      if (tg) {
        const d = Math.hypot(tg.x - s.x, tg.y - s.y);
        // Se acerca hasta su alcance (los de cuerpo a cuerpo, pegados); los de lejos se quedan a distancia.
        const quiere = Math.max(10, alc * (g.kind === 'melee' || g.kind === 'aura' ? 0.55 : 0.7));
        if (d > quiere) { ax = (tg.x - s.x) / d; ay = (tg.y - s.y) / d; }
      } else {
        // Sin enemigos: a un lado de Ash (el primero a la derecha, el segundo a la izquierda), sin amontonarse con él;
        // los de la Escuadra Squirtle, en fila por detrás de ese lado.
        const grupos = [...new Set(lista.filter(o => o.owner === pl && !o.vuelve).map(o => o.id))];
        const lado = grupos.indexOf(s.id) % 2 ? -1 : 1, lejos = (pl.r || 10) + s.r * 1.4 + 14 + s.i * s.r * 1.6;
        const a = (pl.aim || 0) + lado * (Math.PI / 2 + s.i * 0.35);
        const ox = pl.x + Math.cos(a) * lejos, oy = pl.y + Math.sin(a) * lejos * 0.75, d = Math.hypot(ox - s.x, oy - s.y);
        if (d > 8) { ax = (ox - s.x) / d; ay = (oy - s.y) / d; }
      }
      const moviendo = ax != null;
      if (moviendo) {
        s.x += ax * VELOCIDAD * dt; s.y += ay * VELOCIDAD * dt;
        if (G.World && G.World.collide) G.World.collide(s);
      }
      // La correa: nunca más lejos de CORREA de Ash.
      const dx = s.x - pl.x, dy = s.y - pl.y, dd = Math.hypot(dx, dy);
      if (dd > CORREA) { s.x = pl.x + dx / dd * CORREA; s.y = pl.y + dy / dd * CORREA; }
      if (s.anim) {
        const mira = tg ? Math.atan2(tg.y - s.y, tg.x - s.x) : moviendo ? Math.atan2(ay, ax) : null;
        if (mira != null && G.Sprites.dirFromAngle) s.anim.dir = G.Sprites.dirFromAngle(mira);
        s.anim.loop(moviendo ? 'Walk' : 'Idle', moviendo ? 1.3 : 1);
        s.anim.update(dt);
      }
      // Su golpe.
      s.golpeT -= dt;
      if (tg && s.golpeT <= 0 && (tg.x - s.x) ** 2 + (tg.y - s.y) ** 2 <= alc * alc) {
        const gi = golpe(s), d = delegado(s, tg);
        s.golpeT = gi.cd || 0.6;
        if (G.Combat && G.Combat.castAs) G.Combat.castAs(d, gi, s.ghost);
        if (gi.kind === 'dash') { s.x = d.x; s.y = d.y; }   // la embestida lo lleva consigo (Pidgeot)
        if (s.anim) s.anim.play(gi.kind === 'melee' || gi.kind === 'dash' ? 'Attack' : 'Shoot', { speed: 1.4 });
      }
      // Extras: curar a Ash (Bulbasaur) y atraer a los enemigos (Snorlax).
      if (m.cura && !s.ghost && pl.heal) { s.curaT = (s.curaT || 0) + dt; if (s.curaT >= 1) { s.curaT -= 1; pl.heal(m.cura); } }
      if (m.atrae && manda) {
        const R = m.radioAtrae || 150;
        for (const e of enemigos) {
          if (e.dead || e.boss) continue;
          const ex = s.x - e.x, ey = s.y - e.y, de = Math.hypot(ex, ey);
          if (de > 22 && de < R) { e.x += ex / de * m.atrae * dt; e.y += ey / de * m.atrae * dt; }
        }
      }
    }
  }

  /** El Pokémon, ordenado por Y con los enemigos, los objetos y Ash (gancho en drawScene de game.js). */
  function dibujarPokemon(ctx, s) {
    if (s.t < 0) return;
    const entra = Math.min(1, s.t * 6), sale = s.vuelve ? Math.max(0, s.vuelve / VUELTA) : 1, a = Math.min(entra, sale);
    ctx.save();
    ctx.globalAlpha = 0.28 * a; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 1.1, s.r * 0.45, 0, 0, 6.2832); ctx.fill();
    ctx.restore();
    // Al salir, blanco que se desvanece; al volver, se encoge en blanco hacia la Poké Ball.
    if (s.anim) {
      const k = s.vuelve ? 0.35 + 0.65 * sale : 1;
      if (k < 1) { ctx.save(); ctx.translate(s.x, s.y); ctx.scale(k, k); ctx.translate(-s.x, -s.y); }
      s.anim.draw(ctx, s.x, s.y, { alpha: a, flash: s.t < 0.18 || s.vuelve > 0, softFlash: true });
      if (k < 1) ctx.restore();
    }
  }

  /** Los que se ven, para game.js: { y, draw(ctx) }. */
  function drawables() {
    const out = [];
    for (const s of lista) if (s.t >= 0 && (!G.Camera || G.Camera.sees(s.x, s.y, 60))) out.push({ y: s.y, x: s.x, draw: ctx => dibujarPokemon(ctx, s) });
    return out;
  }

  /** Lo de arriba: la Poké Ball volando y el rayo rojo de vuelta (gancho en drawAirFields de combat.js). */
  function draw(ctx) {
    for (const s of lista) {
      if (G.Camera && !G.Camera.sees(s.x, s.y, 120)) continue;
      const pl = s.owner;
      if (s.t < 0) {
        // La Poké Ball, en arco de Ash a su sitio, girando.
        const k = 1 + s.t / VUELO, x = s.desdeX + (s.x - s.desdeX) * k, y = s.desdeY + (s.y - s.desdeY) * k - 14 - Math.sin(k * Math.PI) * 26;
        bola(ctx, x, y, k * 14);
      } else if (s.vuelve > 0) {
        // El rayo rojo que lo devuelve, de Ash al Pokémon.
        const f = s.vuelve / VUELTA;
        ctx.save();
        ctx.globalAlpha = 0.85 * f; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,70,90,0.55)'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(pl.x, pl.y - 14); ctx.lineTo(s.x, s.y - s.r); ctx.stroke();
        ctx.strokeStyle = '#ffd0d6'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pl.x, pl.y - 14); ctx.lineTo(s.x, s.y - s.r); ctx.stroke();
        ctx.restore();
      }
    }
  }

  /** Una Poké Ball de 5 px de radio, girada `giro` radianes. */
  function bola(ctx, x, y, giro) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(giro);
    ctx.fillStyle = '#1a1220'; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#ff4a5a'; ctx.beginPath(); ctx.arc(0, 0, 4.5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#1a1220'; ctx.fillRect(-4.5, -0.6, 9, 1.2);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  function clear(owner) { lista = owner ? lista.filter(s => s.owner !== owner) : []; if (!owner) consejo = false; }
  const todos = () => lista;

  /** Tiempo fuera de la Poké Ball (0..1) mientras su ataque está activo: dur / recarga, como mucho 1. */
  const tiempoFuera = m => Math.min(1, (m.dur || 0) / (m.cd || 1));

  return { lanzar, update, draw, drawables, clear, todos, golpe, blanco, tiempoFuera, CORREA, VISTA };
})();
