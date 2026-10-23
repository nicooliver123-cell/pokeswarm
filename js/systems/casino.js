/* ============ casino.js — el PokéCasino, «Danilo's Gamblers Club» (MOD nico) ============
 * Petición de Nico (22-10-2026), con el regalo «buen humor» (G.MODS.regaloBuenHumor): en el menú, el PokéCasino;
 * dentro, el cartel «Danilo's Gamblers Club» y una ruleta europea (0-36) donde se apuestan Pokémonedas sólo a
 * rojo, a negro (pagan 1 a 1) o al 0 (paga 35 a 1). La crupier es Meowth, el del Team Rocket, y detrás de la
 * cortina asoman los dos del Team Rocket clásico (dibujados aquí en píxeles, como los iconos de icons.js). Todo en una
 * escena (#cas-escena): la ruleta va integrada en la mesa, en perspectiva, con la bola corriendo por la pista.
 *
 * La lógica (girar, apostar) es pura y no sabe de pantallas: check.js §28 la prueba con un azar de mentira.
 * Se apuesta contra la partida guardada (save.coins) y se guarda con commit(true) tras cada tirada; las
 * estadísticas de la ruleta van en save.casino { tiradas, apostado, ganado, robado }. Sin G.MODS.casino, ni botón ni pantalla.
 * Petición de Nico (22-10-2026): con un 1 % por tirada el Team Rocket roba la mitad de la apuesta, como mucho 2000.
 * Ganchos de una línea: menu.js (init: el icono y abrir) y dev.html (el botón del menú, la pantalla y el script).
 */
G.Casino = (() => {
  /** Los 18 rojos de la ruleta europea; el resto, menos el 0, negros. */
  const ROJOS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  /** El orden de los números en la rueda europea, en el sentido de las agujas del reloj desde el 0. */
  const RUEDA = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  /** Lo que devuelve cada apuesta ganadora por moneda apostada (la apuesta incluida). */
  const PAGO = { rojo: 2, negro: 2, cero: 36 };
  const MIN = 10;

  const activo = () => !!(G.MODS && G.MODS.casino);
  const color = n => n === 0 ? 'cero' : ROJOS.includes(n) ? 'rojo' : 'negro';

  /** Un número de 0 a 36 con `rnd` (por defecto Math.random). */
  function girar(rnd = Math.random) {
    return Math.min(36, Math.floor(rnd() * 37));
  }

  /** ¿Se puede apostar `cantidad` a `tipo` con `save`? → texto del error o '' si vale. */
  function error(save, tipo, cantidad) {
    if (!PAGO[tipo]) return 'Elige rojo, negro o el 0.';
    if (!Number.isInteger(cantidad) || cantidad < MIN) return `La apuesta mínima es de ${MIN} Pokémonedas.`;
    if (!save || !(save.coins >= cantidad)) return 'No tienes tantas Pokémonedas.';
    return '';
  }

  /** Apuesta `cantidad` a `tipo` ('rojo', 'negro' o 'cero') y gira. Cobra, paga y apunta en `save`. Después,
   *  con probabilidad G.MODS.casino.robo (1 %), el Team Rocket se lleva roboParte de la apuesta (la mitad), como
   *  mucho roboTope (2000: no les cabe más en la bolsa) y nunca más de lo que te queda.
   *  → { n, color, gana, premio, robo, coins } o { error }. */
  function apostar(save, tipo, cantidad, rnd = Math.random) {
    const e = error(save, tipo, cantidad);
    if (e) return { error: e };
    const n = girar(rnd), c = color(n), gana = c === tipo;
    const premio = gana ? cantidad * PAGO[tipo] : 0;
    save.coins += premio - cantidad;
    const cfg = (G.MODS && G.MODS.casino) || {};
    const robo = rnd() < (+cfg.robo || 0) ? Math.max(0, Math.min(Math.floor(cantidad * (+cfg.roboParte || 0)), +cfg.roboTope || 0, save.coins)) : 0;
    save.coins -= robo;
    const st = save.casino = Object.assign({ tiradas: 0, apostado: 0, ganado: 0 }, save.casino);
    st.tiradas++; st.apostado += cantidad; st.ganado += premio; st.robado = (st.robado || 0) + robo;
    return { n, color: c, gana, premio, robo, coins: save.coins };
  }

  // ---------------- La pantalla: una sola escena ----------------
  /* Todo se pinta en #cas-escena, en coordenadas lógicas de 480x270 escaladas a los píxeles reales del
   * dispositivo (devicePixelRatio): la pared con la cortina de terciopelo y el letrero de neón, los dos del Team
   * Rocket asomando por detrás de la cortina, Meowth de crupier detrás de la mesa, la mesa en perspectiva con la
   * rueda (una elipse: el círculo aplastado por la vista), las casillas de apuesta y las fichas, la luz cenital y la
   * viñeta. Meowth es el sprite real del juego: G.UI lo anima en #cas-meowth (invisible) y aquí se copia. */
  const $ = id => document.getElementById(id);
  const W = 480, H = 270;
  const MESA_Y = 168;                                   // borde de atrás de la mesa
  const RU = { x: 168, y: 214, k: 0.4, R: 100 };        // la rueda: centro, aplastado de la vista y radio del cuenco
  const PASO = Math.PI * 2 / RUEDA.length;
  let tipo = 'rojo', girando = false, angulo = 0, ultimo = null, giro = null, bucle = 0, tAnt = 0, robT = 0, reloj = 0;
  const quieto = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Jessie y James asomando por la cortina, en píxeles como los iconos de icons.js (k = contorno). Pelo con
   *  luz (H), medio (h) y sombra (d); piel (p) y su sombra (o); ojos (e); labios (l); pendientes (g); camiseta
   *  negra (b); uniforme blanco (w) con su sombra (s) y la R roja (r). */
  const ROCKET = {
    jessie: { pal: { H: '#ff6fa5', h: '#d9306f', d: '#8f1747', p: '#ffe2cc', o: '#f0b493', e: '#2f4fb0', l: '#e0405a', g: '#38c46a', b: '#26222c', w: '#f7f7fb', s: '#c9cad8', r: '#e3262f' }, rows: [
      '...kkkkkkk....', '..kHHHHHHHkk..', '.kHHHHhhhHHHk.', 'kHHhhhhhhhhHHk', 'kHhhkkkkkkhhHk', 'kHhkppppppkhHk',
      'kHkpppppppokHk', 'kHkpekppekpkdk', 'kHgpppppppogdk', 'kHkppplppookdk', 'khdkopppookhdk', 'khdhkkppkkhddk',
      'khdkbbbbbbkddk', 'kddkwwwwwwkddk', 'kdkwwwwwwwwkdk', 'kdkwwwrrwwskdk', 'kdkwwwrwrwskdk', 'kdkwwwrrwwskd.',
      '.kkwwwrwrwsk..', '..kwwwwwwwsk..', '..kswwwwwssk..', '..kkkkkkkkkk..'] },
    james: { pal: { H: '#b4c0ff', h: '#7f8fe0', d: '#4a55a3', p: '#ffe6d2', o: '#eebc9f', e: '#2f8a4f', l: '#c9786a', b: '#26222c', w: '#f7f7fb', s: '#c9cad8', r: '#e3262f' }, rows: [
      '...kkkkkkk....', '..kHHHHHHHk...', '.kHHHhhhHHHk..', '.kHhhhhhhhHHk.', 'kHhhhhhhhhhHk.', 'kHhkkppppkhhk.',
      'khkpppppppkhk.', 'khkpekppekpkk.', '.kkpppppppok..', '..kppplpppok..', '..kkopppook...', '...kkppkkk....',
      '..kbbbbbbbk...', '.kwwwwwwwwwk..', 'kwwwwwwwwwwsk.', 'kwwwwrrwwwwsk.', 'kwwwwrwrwwwsk.', 'kwwwwrrwwwwsk.',
      'kwwwwrwrwwwsk.', 'kwwwwwwwwwwsk.', 'kswwwwwwwwssk.', 'kkkkkkkkkkkkk.'] }
  };

  function pixel(ctx, def, x, y, s) {
    def.rows.forEach((fila, j) => [...fila].forEach((ch, i) => {
      if (ch === '.') return;
      ctx.fillStyle = ch === 'k' ? '#1a1220' : def.pal[ch];
      ctx.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s);
    }));
  }

  const lin = (ctx, x0, y0, x1, y1, paradas) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); paradas.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  const rad = (ctx, x, y, r0, r1, paradas) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); paradas.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  const elipse = (ctx, x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); };

  /** Un paño de la cortina entre x0 y x1, con pliegues de luz y sombra y el bajo recogido. */
  function cortina(ctx, x0, x1, y1, luz) {
    const n = Math.max(2, Math.round((x1 - x0) / 14)), a = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * a;
      ctx.fillStyle = lin(ctx, x, 0, x + a, 0, [[0, '#4a0718'], [0.35, luz ? '#c42446' : '#a51a3a'], [0.55, luz ? '#d8355a' : '#b0213f'], [1, '#4a0718']]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + a, 0);
      ctx.quadraticCurveTo(x + a + 1, y1 * 0.6, x + a - 1, y1); ctx.quadraticCurveTo(x + a / 2, y1 + 5, x + 1, y1);
      ctx.quadraticCurveTo(x - 1, y1 * 0.6, x, 0); ctx.fill();
    }
    ctx.fillStyle = lin(ctx, 0, y1 - 30, 0, y1 + 4, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.35)']]);
    ctx.fillRect(x0, y1 - 30, x1 - x0, 34);
  }

  /** El letrero de neón con sus bombillas (parpadean salvo con movimiento reducido). */
  function letrero(ctx) {
    const x = 132, y = 16, w = 216, h = 50;
    ctx.fillStyle = lin(ctx, 0, y, 0, y + h, [[0, '#2a1630'], [1, '#160a1a']]);
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 18; i++) {
      const bx = x + 8 + i * ((w - 16) / 17), on = quieto() || ((Math.floor(reloj * 3) + i) % 3) !== 0;
      for (const by of [y + 4, y + h - 4]) {
        ctx.fillStyle = on ? '#ffe9a8' : '#6a5320';
        if (on) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 6; }
        elipse(ctx, bx, by, 1.6, 1.6); ctx.fill(); ctx.shadowBlur = 0;
      }
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'italic 700 11px Georgia, "Times New Roman", serif';
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 8; ctx.fillStyle = '#ffe9a8';
    ctx.fillText("Danilo's", x + w / 2, y + 15);
    ctx.font = 'italic 700 20px Georgia, "Times New Roman", serif';
    ctx.shadowColor = '#ff3d8b'; ctx.shadowBlur = 14; ctx.fillStyle = '#ff7ab0';
    ctx.fillText('Gamblers Club', x + w / 2, y + 33);
    ctx.shadowBlur = 4; ctx.fillStyle = '#fff0f6'; ctx.fillText('Gamblers Club', x + w / 2, y + 33);
    ctx.shadowBlur = 0;
  }

  /** Pared, cortinas, letrero y los dos del Team Rocket (que salen un poco con el robo). */
  function fondo(ctx) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, MESA_Y, [[0, '#1d0b22'], [1, '#3a1430']]);
    ctx.fillRect(0, 0, W, MESA_Y + 2);
    // Paneles de madera de la pared, entre las cortinas.
    for (let x = 96; x < 384; x += 48) {
      ctx.fillStyle = lin(ctx, x, 0, x + 48, 0, [[0, '#2b1220'], [0.5, '#3b1a2a'], [1, '#22101a']]);
      ctx.fillRect(x + 2, 76, 44, MESA_Y - 80);
      ctx.strokeStyle = 'rgba(201,162,39,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 6.5, 82.5, 35, MESA_Y - 92);
    }
    letrero(ctx);
    // Los del Team Rocket, detrás de los paños de los lados: con el robo asoman más.
    const sale = robT > 0 ? Math.sin(Math.min(1, robT / 1.6) * Math.PI) * 26 : 0;
    ctx.imageSmoothingEnabled = false;
    pixel(ctx, ROCKET.jessie, 70 + sale, 94, 3);
    pixel(ctx, ROCKET.james, 364 - sale, 98, 3);
    ctx.imageSmoothingEnabled = true;
    cortina(ctx, 0, 80, MESA_Y + 4, false);
    cortina(ctx, 400, W, MESA_Y + 4, false);
    // Bambalina de arriba, con flecos dorados.
    ctx.fillStyle = lin(ctx, 0, 0, 0, 18, [[0, '#6e0f28'], [1, '#a51a3a']]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 12);
    for (let x = W; x >= 0; x -= 24) ctx.quadraticCurveTo(x - 12, 22, x - 24, 12);
    ctx.fill();
    ctx.fillStyle = '#c9a227';
    for (let x = 6; x < W; x += 6) ctx.fillRect(x, 13 + 5 * Math.abs(Math.sin((x % 24) / 24 * Math.PI)), 1.5, 4);
  }

  /** Meowth de crupier, detrás de la mesa (el borde le tapa los pies). */
  function crupier(ctx) {
    const m = $('cas-meowth');
    if (!m || !m.width) return;
    ctx.fillStyle = rad(ctx, 272, MESA_Y - 2, 2, 46, [[0, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]);
    elipse(ctx, 272, MESA_Y - 2, 46, 10); ctx.fill();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(m, 272 - 48, MESA_Y - 90, 96, 96);
    ctx.imageSmoothingEnabled = true;
  }

  /** La mesa: el tapete, el borde de madera, las casillas de apuesta (la elegida, iluminada) y las fichas. */
  function mesa(ctx) {
    ctx.fillStyle = lin(ctx, 0, MESA_Y, 0, H, [[0, '#0d5530'], [0.5, '#127a40'], [1, '#0b4a29']]);
    ctx.beginPath(); ctx.moveTo(24, MESA_Y); ctx.lineTo(456, MESA_Y); ctx.lineTo(W + 40, H); ctx.lineTo(-40, H); ctx.closePath(); ctx.fill();
    // Trama del fieltro.
    ctx.fillStyle = 'rgba(255,255,255,.025)';
    for (let y = MESA_Y + 3; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    // Borde de atrás, de madera con brillo.
    ctx.fillStyle = lin(ctx, 0, MESA_Y - 6, 0, MESA_Y + 3, [[0, '#a8662a'], [0.4, '#6b3a12'], [1, '#3b1e08']]);
    ctx.beginPath(); ctx.moveTo(18, MESA_Y - 5); ctx.lineTo(462, MESA_Y - 5); ctx.lineTo(458, MESA_Y + 3); ctx.lineTo(22, MESA_Y + 3); ctx.closePath(); ctx.fill();
    // Casillas de apuesta pintadas en el tapete, en perspectiva: el 0, rojo y negro.
    const cas = [['cero', '0', '#1f9a4a'], ['rojo', '', '#c8102e'], ['negro', '', '#141414']];
    cas.forEach(([id, txt, col], i) => {
      const x0 = 290 + i * 52, y0 = 192, w = 48, h = 34, inc = 10;
      ctx.beginPath(); ctx.moveTo(x0 + inc, y0); ctx.lineTo(x0 + w + inc, y0); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.closePath();
      const on = id === tipo;
      ctx.fillStyle = on ? 'rgba(255,210,63,.22)' : 'rgba(0,0,0,.12)'; ctx.fill();
      ctx.lineWidth = on ? 2 : 1; ctx.strokeStyle = on ? '#ffd23f' : 'rgba(240,230,190,.7)';
      if (on) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10; }
      ctx.stroke(); ctx.shadowBlur = 0;
      const cx = x0 + w / 2 + inc / 2, cy = y0 + h / 2;
      if (txt) { ctx.fillStyle = '#fff'; ctx.font = '700 15px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, cx, cy + 1); }
      else { ctx.fillStyle = col; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx + 13, cy); ctx.lineTo(cx, cy + 10); ctx.lineTo(cx - 13, cy); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      if (on && girando) ficha(ctx, cx + 8, cy + 8, '#ffd23f', 3);
    });
    // Montones de fichas de la banca.
    [['#c8102e', 5, 300], ['#2a6fd6', 7, 322], ['#ffd23f', 4, 344], ['#141414', 6, 366]].forEach(([c, n, x]) => ficha(ctx, x, 252, c, n));
    // Barandilla de delante, acolchada.
    ctx.fillStyle = lin(ctx, 0, H - 16, 0, H, [[0, '#5a2a0e'], [0.3, '#8b4a1c'], [0.6, '#4a2208'], [1, '#2a1204']]);
    ctx.fillRect(0, H - 16, W, 16);
    ctx.fillStyle = 'rgba(255,220,170,.25)'; ctx.fillRect(0, H - 14, W, 1.5);
  }

  /** Un montón de `n` fichas de color `c` con su canto a rayas. */
  function ficha(ctx, x, y, c, n) {
    for (let i = 0; i < n; i++) {
      const yy = y - i * 2.6;
      ctx.fillStyle = 'rgba(0,0,0,.35)'; elipse(ctx, x, yy + 1.6, 8.5, 3.6); ctx.fill();
      ctx.fillStyle = c; elipse(ctx, x, yy, 8.5, 3.4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 2.2]); elipse(ctx, x, yy, 7.2, 2.7); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  /** La rueda en la mesa: el cuenco de madera, la pista de la bola, las casillas con sus números, el cono y la
   *  cruz del centro; y la bola donde diga `bola` ({ a: ángulo en la mesa, r: radio }). */
  function rueda(ctx, bola) {
    const { x, y, k, R } = RU;
    // Sombra y canto del cuenco (lo que se ve por debajo de la elipse).
    ctx.fillStyle = 'rgba(0,0,0,.45)'; elipse(ctx, x + 4, y + 12, R + 6, (R + 6) * k); ctx.fill();
    ctx.fillStyle = lin(ctx, x - R, 0, x + R, 0, [[0, '#2e1606'], [0.5, '#7a4318'], [1, '#2e1606']]);
    ctx.beginPath(); ctx.ellipse(x, y, R, R * k, 0, 0, Math.PI); ctx.lineTo(x - R, y + 9); ctx.ellipse(x, y + 9, R, R * k, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    const bolaDelante = bola && Math.sin(bola.a) > 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, k);
    // Cuenco y pista.
    ctx.fillStyle = rad(ctx, 0, 0, R * 0.5, R, [[0, '#4a2508'], [0.75, '#8a4d1c'], [0.9, '#c48a4a'], [1, '#5a2e0e']]);
    elipse(ctx, 0, 0, R, R); ctx.fill();
    ctx.fillStyle = rad(ctx, 0, 0, R * 0.78, R * 0.94, [[0, '#e8cf9a'], [0.6, '#cfae72'], [1, '#8a6232']]);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.94, 0, Math.PI * 2); ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2, true); ctx.fill();
    // Las 37 casillas, que giran con la rueda.
    ctx.rotate(angulo);
    const r1 = R * 0.8, r2 = R * 0.5;
    RUEDA.forEach((n, i) => {
      const a = i * PASO - PASO / 2;
      ctx.fillStyle = n === 0 ? '#1f9a4a' : ROJOS.includes(n) ? '#c8102e' : '#171717';
      ctx.beginPath(); ctx.arc(0, 0, r1, a, a + PASO); ctx.arc(0, 0, r2, a + PASO, a, true); ctx.closePath(); ctx.fill();
    });
    // Fondo de las casillas, más oscuro, y los separadores dorados.
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.beginPath(); ctx.arc(0, 0, R * 0.64, 0, Math.PI * 2); ctx.arc(0, 0, r2, 0, Math.PI * 2, true); ctx.fill();
    ctx.strokeStyle = '#d9b44a'; ctx.lineWidth = 1;
    for (let i = 0; i < RUEDA.length; i++) { const a = i * PASO - PASO / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, r1, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r2, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '700 9px "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    RUEDA.forEach((n, i) => { ctx.save(); ctx.rotate(i * PASO); ctx.translate(R * 0.72, 0); ctx.rotate(Math.PI / 2); ctx.fillText(String(n), 0, 0); ctx.restore(); });
    // Cono de madera y la cruz dorada.
    ctx.fillStyle = rad(ctx, -12, -12, 2, r2, [[0, '#c4874a'], [0.5, '#7a4318'], [1, '#3a1c06']]);
    ctx.beginPath(); ctx.arc(0, 0, r2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e6c25a'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.stroke(); }
    ctx.restore();
    if (bola && !bolaDelante) pintaBola(ctx, bola);
    // Torreta del centro (de pie, sin aplastar).
    ctx.fillStyle = lin(ctx, x - 8, 0, x + 8, 0, [[0, '#8a6a1a'], [0.5, '#ffe9a0'], [1, '#8a6a1a']]);
    ctx.fillRect(x - 4, y - 14, 8, 14);
    ctx.fillStyle = '#ffd23f'; elipse(ctx, x, y - 14, 5, 2.4); ctx.fill();
    ctx.fillStyle = rad(ctx, x - 2, y - 18, 1, 6, [[0, '#fff6c8'], [1, '#c9a227']]); elipse(ctx, x, y - 17, 4.5, 4.5); ctx.fill();
    if (bola && bolaDelante) pintaBola(ctx, bola);
    // Brillo del barniz.
    ctx.fillStyle = 'rgba(255,255,255,.08)'; elipse(ctx, x - R * 0.3, y - R * k * 0.5, R * 0.5, R * k * 0.25); ctx.fill();
  }

  function pintaBola(ctx, b) {
    const px = RU.x + Math.cos(b.a) * b.r, py = RU.y + Math.sin(b.a) * b.r * RU.k - (b.h || 0);
    ctx.fillStyle = 'rgba(0,0,0,.4)'; elipse(ctx, px + 1.5, py + 2 + (b.h || 0), 4, 1.8); ctx.fill();
    ctx.fillStyle = rad(ctx, px - 1.3, py - 1.5, 0.3, 4.2, [[0, '#ffffff'], [0.6, '#e8e8ee'], [1, '#8f93a3']]);
    elipse(ctx, px, py, 3.6, 3.6); ctx.fill();
  }

  /** La luz cálida de arriba sobre la mesa y la viñeta de los bordes. */
  function luz(ctx) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rad(ctx, 240, 200, 10, 210, [[0, 'rgba(255,190,110,.13)'], [0.6, 'rgba(255,150,80,.05)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = lin(ctx, 0, 0, 0, MESA_Y, [[0, 'rgba(255,220,160,.06)'], [1, 'rgba(0,0,0,0)']]);
    ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(280, 0); ctx.lineTo(420, MESA_Y); ctx.lineTo(60, MESA_Y); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = rad(ctx, W / 2, H / 2, H * 0.45, W * 0.62, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.6)']]);
    ctx.fillRect(0, 0, W, H);
  }

  /** Dónde va la bola: girando, por la pista y luego cae en su casilla; quieta, en la del último número. */
  function posBola() {
    if (giro) {
      const k = Math.min(1, (performance.now() - giro.t0) / giro.dur);
      const e = 1 - Math.pow(1 - k, 2.2);
      const casilla = angulo + giro.idx * PASO;
      if (k < 0.72) {   // por la pista exterior, al revés que la rueda
        return { a: casilla + giro.vueltasBola * (1 - e), r: RU.R * 0.87 };
      }
      const q = (k - 0.72) / 0.28;   // cae hacia las casillas con un par de botes
      const r = RU.R * (0.87 - 0.21 * Math.min(1, q * 1.6));
      return { a: casilla + giro.vueltasBola * (1 - e), r, h: Math.abs(Math.sin(q * Math.PI * 3)) * (1 - q) * 6 };
    }
    return ultimo == null ? null : { a: angulo + RUEDA.indexOf(ultimo) * PASO, r: RU.R * 0.66 };
  }

  /** Ajusta el lienzo a los píxeles reales y pinta la escena. */
  function pintar() {
    const cv = $('cas-escena');
    if (!cv) return;
    const dpr = Math.min(3, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
    const cw = Math.max(1, Math.round((cv.clientWidth || W) * dpr)), ch = Math.round(cw * H / W);
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    const ctx = cv.getContext('2d');
    ctx.setTransform(cw / W, 0, 0, ch / H, 0, 0);
    ctx.imageSmoothingEnabled = true;
    fondo(ctx);
    crupier(ctx);
    mesa(ctx);
    rueda(ctx, posBola());
    luz(ctx);
  }

  /** El bucle de la escena mientras la pantalla está abierta: la rueda gira despacio (salvo con movimiento
   *  reducido), parpadean las bombillas y Meowth se mueve. */
  function animar(t) {
    if (!G.UI.isOpen('scr-casino')) { bucle = 0; return; }
    const dt = tAnt ? Math.min(0.1, (t - tAnt) / 1000) : 0;
    tAnt = t; reloj += dt;
    if (robT > 0) robT = Math.max(0, robT - dt);
    if (giro) {
      const k = Math.min(1, (t - giro.t0) / giro.dur), e = 1 - Math.pow(1 - k, 3);
      angulo = giro.desde + (giro.destino - giro.desde) * e;
      if (k >= 1) acabarGiro();
    } else if (!quieto()) angulo += dt * 0.25;
    pintar();
    bucle = requestAnimationFrame(animar);
  }

  const NOMBRE = { rojo: 'Rojo', negro: 'Negro', cero: 'El 0' };
  const dice = t => { const d = $('cas-dice'); if (d) d.textContent = G.T ? G.T(t) : t; };
  const tr = t => G.T ? G.T(t) : t;

  function pintarApuesta() {
    document.querySelectorAll('#scr-casino [data-apuesta]').forEach(b => b.classList.toggle('on', b.dataset.apuesta === tipo));
    const s = G.DB.save, inp = $('cas-cant');
    const cant = Math.floor(+inp.value || 0);
    const e = girando ? 'gira' : error(s, tipo, cant);
    $('cas-girar').disabled = !!e;
    $('cas-saldo').textContent = (s.coins || 0).toLocaleString('es-ES');
  }

  function abrir() {
    if (!activo() || !$('scr-casino')) return;
    G.UI.show('scr-casino', true);
    const s = G.DB.save, m = $('cas-meowth');
    if (m) G.UI.sprite(m, 52, { lively: true, scale: 3, hero: true });   // Meowth, el del Team Rocket
    dice('¡Bienvenidos al club, nya! Rojo, negro o el 0: hagan sus apuestas.');
    const inp = $('cas-cant');
    if (!(+inp.value >= MIN)) inp.value = Math.min(1000, Math.max(MIN, s.coins || 0));
    document.querySelectorAll('#scr-casino [data-apuesta]').forEach(b => { b.onclick = () => { tipo = b.dataset.apuesta; G.Audio.sfx('select'); pintarApuesta(); }; });
    document.querySelectorAll('#scr-casino [data-ficha]').forEach(b => {
      b.onclick = () => {
        const f = b.dataset.ficha, c = G.DB.save.coins || 0;
        inp.value = f === 'todo' ? c : f === 'mitad' ? Math.floor(c / 2) : Math.min(c, Math.floor(+inp.value || 0) + +f);
        G.Audio.sfx('click'); pintarApuesta();
      };
    });
    inp.oninput = pintarApuesta;
    $('cas-girar').onclick = tirar;
    pintarApuesta();
    if (!bucle) { tAnt = 0; bucle = requestAnimationFrame(animar); }
  }

  let resultado = null;
  function tirar() {
    if (girando) return;
    const s = G.DB.save, cant = Math.floor(+$('cas-cant').value || 0);
    const r = apostar(s, tipo, cant);
    if (r.error) { dice(r.error); return; }
    girando = true; resultado = r; pintarApuesta();
    G.DB.commit(true);
    G.Audio.sfx('confirm');
    dice('No va más, nya…');
    // La rueda da unas vueltas y frena; la bola corre al revés por la pista y cae en la casilla ganadora.
    const desde = angulo, dur = quieto() ? 400 : 4200;
    giro = { t0: performance.now(), dur, desde, destino: desde + Math.PI * 2 * (quieto() ? 0.2 : 3.2), idx: RUEDA.indexOf(r.n), vueltasBola: -Math.PI * 2 * (quieto() ? 0.3 : 5) };
    if (!bucle) { tAnt = 0; bucle = requestAnimationFrame(animar); }
  }

  function acabarGiro() {
    const r = resultado;
    giro = null; girando = false; ultimo = r.n; resultado = null;
    G.UI.refreshCoins();
    const sale = `${tr('Sale el')} ${r.n} (${tr(NOMBRE[r.color]).toLowerCase()}).`;
    if (r.gana) { G.Audio.sfx('buy'); dice(`${sale} ${tr('¡Ganas')} ${r.premio.toLocaleString('es-ES')} ${tr('Pokémonedas, nya!')}`); }
    else dice(`${sale} ${tr('La casa gana, nya… ¿Otra?')}`);
    if (r.robo) robado(r.robo);
    pintarApuesta();
  }

  /** Lo que dice el Team Rocket al robarte (petición de Nico, 22-10-2026). */
  const FRASE_ROBO = '«Mejor me quedo este oro, al menos yo lo usaré para robar Pokémons y no lo tiraré aquí...»';

  /** El Team Rocket sale de la cortina, se lleva su parte y vuelve a esconderse. */
  function robado(n) {
    const d = $('cas-dice');
    if (d) d.textContent += ' ' + `${tr('¡Prepárate para los problemas! El Team Rocket te ha robado')} ${n.toLocaleString('es-ES')} ${tr('Pokémonedas.')} ${tr(FRASE_ROBO)}`;
    robT = quieto() ? 0 : 1.6;
    G.Audio.sfx('back');
    G.UI.refreshCoins();
  }

  /** El botón «PokéCasino» de la pantalla del Gacha (con Dex, la entrada al casino: css/nico.css lo quita del menú). */
  function enganchar() {
    const b = $('gacha-casino');
    if (!b) return;
    b.hidden = !activo();
    b.onclick = () => { G.Audio.sfx('click'); abrir(); };
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enganchar); else enganchar();
  }

  return { FRASE_ROBO, ROJOS, RUEDA, PAGO, MIN, activo, color, girar, error, apostar, abrir, ROCKET };
})();
