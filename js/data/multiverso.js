/* ============ multiverso.js — personajes de otras franquicias (MOD nico) ============
 * La generación «Multiverso»: personajes jugables de otros juegos y series, como
 * guiño, con las mismas reglas que un Pokémon (tipos, ataques con sus mejoras y
 * evoluciones, colección, gacha y compañero), salvo que sus ataques son de su
 * mundo. Se carga justo después de js/data/moves.js (dev.html), porque registra
 * sus ataques propios en G.Moves.
 *
 * Cada personaje:
 *   - una entrada de G.DEX con número 10001 en adelante, `gen: GEN` y `mv: true`
 *     (los enemigos, los jefes y el Pokémon perdido nunca la usan: ganchos de una
 *     línea en enemies.js y events.js);
 *   - sus hojas en assets/pokemon/{dex}/ con el formato de SpriteCollab (7
 *     animaciones, 8 direcciones; s/ es el variocolor) y su geometría en META, que
 *     pasa a G.SPRITE_META. Las dibuja PixelLab (8 rotaciones y la animación de
 *     andar), o tools/nico/multiverso/dibujar.py (Pac-Man y Blinky), y las monta
 *     tools/nico/multiverso/montar.py, que también escribe META (un personaje sin
 *     META, sin hojas aún, no se carga);
 *   - sus ataques, todos de su mundo (`pool`, con el inicial, `start`, el primero):
 *     al subir de nivel aprende sólo esos (gancho de una línea al principio de
 *     poolFor() de moves.js), y ningún Pokémon los aprende (no entran en el pool de
 *     ningún tipo). Cada uno sube con la escalera de su forma (`kind`) y evoluciona
 *     como los demás (EVO; los potenciadores, como Danza Espada, no). Cuentan para
 *     el logro «Maestro de movimientos», como el personaje cuenta para el de
 *     tenerlos todos. `vis` (gancho en forMove() de vfx.js) es cómo se ve: sin él,
 *     con la forma de su tipo.
 *
 * Equilibrio (lista del primer lote validada por Nico el 14-10-2026; la del
 * segundo, del 15-10-2026, sale de estudiar cada saga): el daño nominal de cada
 * ataque (daño × proyectiles ÷ recarga) y su alcance caen dentro del rango de los
 * ataques Pokémon de su misma forma, y lo que gana por un lado (empuje, quemar,
 * frenar, tamaño) lo paga con más recarga o menos arco; un potenciador copia los
 * números de uno de upstream de la misma estadística. Los números del cuerpo a
 * cuerpo ya llevan el +20 % de daño y +25 % de alcance y arco que moves.js aplica
 * a los suyos. check.js §24 lo comprueba.
 *
 * Todos con rareza 2: su banner los reparte a partes iguales (lo que dice el
 * cartel; con rarezas distintas haría falta un sorteo propio, porque el pity de un
 * banner sin legendarios nunca vuelve a 0) y un repetido da 30 Pokémonedas por cada
 * ticket que vale su tirada (con el ticket ×10, 300; premio()): por ticket gastado,
 * menos que un banner normal en el que ya todo sale repetido (uno poco avanzado paga
 * menos monedas, porque sus nuevos y sus evoluciones dan Pokémon: CLAUDE.md).
 * Stats de un Pokémon de segunda fase (Agumon, los de Charmeleon).
 *
 * Ganchos de una línea (// MOD nico): gacha.js (el banner, el coste y el premio de
 * un repetido), gacha-ui.js (el
 * cartel y sus probabilidades), menu.js (el nombre en la colección y la ficha),
 * enemies.js y events.js (nunca de enemigo), moves.js (poolFor: sus ataques) y
 * vfx.js (forMove: cómo se ven).
 */
G.MULTIVERSO = (() => {
  const GEN = 10;
  const BANNER = { gen: GEN, name: 'Multiverso', color: ['#14304a', '#3a1d6e', '#0f5a52'] };

  const PERSONAJES = [
    { dex: 10001, name: 'Agumon', types: ['fire', 'dragon'], hp: 96, spd: 112, atk: 1.14, rarity: 2, bst: 405,
      starter: false, gen: GEN, mv: true, start: 'llama-bebe', serie: 'Digimon',
      pool: ['llama-bebe', 'garra-afilada', 'escupefuego', 'cabezazo', 'lluvia-fuego', 'torbellino', 'emblema-valor'] },
    { dex: 10002, name: 'Doom Slayer', types: ['fighting', 'steel'], hp: 104, spd: 116, atk: 1.18, rarity: 2, bst: 425,
      starter: false, gen: GEN, mv: true, start: 'super-escopeta', serie: 'DOOM',
      pool: ['super-escopeta', 'lanzacohetes', 'rifle-plasma', 'motosierra', 'gancho-carne', 'granada', 'eructo-llamas', 'berserker'] },
    { dex: 10003, name: 'Cacodemonio', types: ['dark', 'electric'], hp: 126, spd: 92, atk: 1.08, rarity: 2, bst: 420,
      starter: false, gen: GEN, mv: true, start: 'rayo-bola', serie: 'DOOM',
      pool: ['rayo-bola', 'mordisco-infernal', 'embestida', 'lluvia-bolas', 'mirada-ojo', 'aura-infernal', 'pellejo-grueso'] },
    // Segundo lote (15-10-2026), elegido por Nico; las fichas salen de estudiar su saga.
    { dex: 10004, name: 'Kirby', types: ['normal', 'flying'], hp: 108, spd: 98, atk: 1.12, rarity: 2, bst: 410,
      starter: false, gen: GEN, mv: true, start: 'bala-estelar', serie: 'Kirby',
      pool: ['bala-estelar', 'copia-cuchillo', 'copia-espada', 'copia-fuego', 'copia-martillo', 'copia-bomba', 'superabsorcion', 'maxi-tomate'] },
    { dex: 10005, name: 'Link', types: ['fairy', 'steel'], hp: 110, spd: 108, atk: 1.12, rarity: 2, bst: 415,
      starter: false, gen: GEN, mv: true, start: 'espada-maestra', serie: 'Zelda',
      pool: ['espada-maestra', 'rayo-espada', 'arco-hadas', 'bumeran', 'bomba-mecha', 'botas-pegaso', 'fuego-din', 'escudo-hyliano'] },
    { dex: 10006, name: 'Samus', types: ['steel', 'electric'], hp: 116, spd: 100, atk: 1.1, rarity: 2, bst: 420,
      starter: false, gen: GEN, mv: true, start: 'rayo-de-poder', serie: 'Metroid',
      pool: ['rayo-de-poder', 'lanzamisiles', 'rayo-de-ondas', 'rayo-de-hielo', 'rayo-de-plasma', 'bomba-morfosfera', 'turbosfera', 'rayo-recarga'] },
    { dex: 10007, name: 'Pac-Man', types: ['normal', 'electric'], hp: 92, spd: 118, atk: 1.1, rarity: 2, bst: 410,
      starter: false, gen: GEN, mv: true, start: 'waka-waka', serie: 'Pac-Man',
      pool: ['waka-waka', 'fruta-bonificacion', 'pildora-poder', 'combo-fantasmas', 'boca-riego', 'rodada-turbo', 'pac-bomba', 'rastro-fuego'] },
    { dex: 10008, name: 'Blinky', types: ['ghost', 'dark'], hp: 100, spd: 110, atk: 1.16, rarity: 2, bst: 410,
      starter: false, gen: GEN, mv: true, start: 'pandilla-fantasma', serie: 'Pac-Man',
      pool: ['pandilla-fantasma', 'persecucion', 'carga-de-toro', 'dispersion', 'vuelta-a-casa', 'minifantasmas', 'toque-fantasma', 'cruise-elroy'] },
    { dex: 10009, name: 'Drácula', types: ['dark', 'fire'], hp: 110, spd: 96, atk: 1.2, rarity: 2, bst: 430,
      starter: false, gen: GEN, mv: true, start: 'fuego-infernal', serie: 'Castlevania',
      pool: ['fuego-infernal', 'alas-demoniacas', 'enjambre-murcielagos', 'rayo-fatal', 'ola-oscuridad', 'robo-almas', 'guadana-muerte', 'metamorfosis-oscura'] },
    { dex: 10010, name: 'Ojo de Cthulhu', types: ['psychic', 'ghost'], hp: 106, spd: 117, atk: 1.07, rarity: 2, bst: 415,
      starter: false, gen: GEN, mv: true, start: 'siervo-de-cthulhu', serie: 'Terraria',
      pool: ['siervo-de-cthulhu', 'embestida-nocturna', 'dentellada', 'embestidas-en-cadena', 'iris-roto', 'presencia-maligna', 'segunda-forma'] },
    // Tercer lote (23-10-2026; fichas en tools/nico/multiverso/FICHAS.md)
    { dex: 10011, name: 'Jefe Maestro', types: ['rock', 'fighting'], hp: 122, spd: 106, atk: 1.11, rarity: 2, bst: 425,
      starter: false, gen: GEN, mv: true, start: 'rifle-de-asalto', serie: 'Halo',
      pool: ['rifle-de-asalto', 'aguijoneador', 'granada-de-plasma', 'culatazo', 'espada-de-energia', 'rifle-de-precision', 'warthog', 'sobreescudo'] },
    { dex: 10012, name: 'Kratos', types: ['fighting', 'fire'], hp: 120, spd: 102, atk: 1.16, rarity: 2, bst: 430,
      starter: false, gen: GEN, mv: true, start: 'espadas-del-caos', serie: 'God of War',
      pool: ['espadas-del-caos', 'arpon-de-orion', 'furia-de-zeus', 'ira-de-poseidon', 'mirada-de-medusa', 'ejercito-de-hades', 'terremoto-de-atlas', 'ira-de-esparta'] }
  ];

  // En el comentario de cada uno, su daño nominal y el de ataques Pokémon de su forma.
  const ATAQUES = [
    // ---- Agumon (Digimon): sus evoluciones son ataques de sus digievoluciones ----
    { id: 'llama-bebe', name: 'Llama Bebé', type: 'fire', kind: 'projectile',          // 33,3 (Ascuas 34,6)
      desc: 'Escupe una bola de fuego grande al enemigo más cercano. Quema.',
      cd: 0.6, dmg: 20, speed: 300, count: 1, spread: 0.12, pierce: 0, life: 1.6, size: 9, burn: 1,
      evo: ['Mega Llama', 'atk'] },
    { id: 'garra-afilada', name: 'Garra Afilada', type: 'dragon', kind: 'melee',        // 34 (Garra Metal 36)
      desc: 'Zarpazo en arco amplio que empuja.',
      cd: 0.5, dmg: 17, radius: 62, arc: 2.0, knock: 50, vis: { melee: 'claw' },
      evo: ['Brazo Tridente', 'atk'] },
    { id: 'escupefuego', name: 'Escupefuego', type: 'fire', kind: 'cone',               // 66,7 (Lanzallamas 70)
      desc: 'Una ráfaga de bolitas de fuego en abanico estrecho. Quema.',
      cd: 0.72, dmg: 8, count: 6, arc: 0.7, speed: 380, life: 0.42, size: 6, pierce: 1, burn: 1,
      vis: { proj: 'fire', trail: 'ember' }, evo: ['Gigadestructor', 'cd'] },
    { id: 'cabezazo', name: 'Cabezazo', type: 'normal', kind: 'dash',                   // 26,3 (Ataque Rápido 26,7)
      desc: 'Cargas de cabeza hacia el enemigo y arrollas lo que cruzas.',
      cd: 0.8, dmg: 21, radius: 110, width: 36, knock: 70,
      evo: ['Gran Cuerno', 'hp'] },
    { id: 'lluvia-fuego', name: 'Lluvia de Fuego', type: 'fire', kind: 'meteor',        // 50,8 (Puño Meteoro 48,6; Granizo 60)
      desc: 'Bolas de fuego caen sobre los enemigos cercanos y los queman.',
      cd: 1.3, dmg: 22, count: 3, radius: 46, burn: 1, vis: { proj: 'fire', trail: 'ember' },
      evo: ['Fuerza de Gaia', 'atk'] },
    { id: 'torbellino', name: 'Torbellino', type: 'dragon', kind: 'orbit',              // 150 (Giro Fuego 140)
      desc: 'Giras tan rápido que unas llamas de dragón te rodean.',
      cd: 0.28, dmg: 14, count: 3, radius: 66, speed: 2.6, size: 8,
      evo: ['Gran Tornado', 'spd'] },
    { id: 'emblema-valor', name: 'Emblema del Valor', type: 'dragon', kind: 'buff',      // los números de Danza Dragón
      desc: 'No hace daño: acumula ATAQUE mientras esté activo.',
      cd: 0.7, stat: 'atk', amount: 0.11, dur: 7, stacks: 5 },

    // ---- Doom Slayer (DOOM) ----
    { id: 'super-escopeta', name: 'Súper Escopeta', type: 'steel', kind: 'cone',         // 70 (Lanzallamas 70)
      desc: 'Escopeta de dos cañones: una ráfaga corta de perdigones que empuja.',
      cd: 0.8, dmg: 7, count: 8, arc: 0.75, speed: 520, life: 0.3, size: 5, pierce: 1, knock: 60,
      evo: ['Súper Escopeta Maestra', 'cd'] },
    { id: 'lanzacohetes', name: 'Lanzacohetes', type: 'fire', kind: 'projectile',        // 32,9 (Lanzarrocas 34,3)
      desc: 'Un cohete lento y pesado que empuja con fuerza.',
      cd: 0.85, dmg: 28, speed: 250, count: 1, spread: 0.12, pierce: 0, life: 1.6, size: 10, knock: 120,
      vis: { proj: 'rock', trail: 'ember' }, evo: ['Ráfaga de Cohetes', 'atk'] },
    { id: 'rifle-plasma', name: 'Rifle de Plasma', type: 'electric', kind: 'beam',       // 22,1 (Furia Dragón 24)
      desc: 'Un chorro de plasma en línea recta que lo atraviesa todo.',
      cd: 0.95, dmg: 21, radius: 230, width: 26, vis: { beam: 'lightning' },
      evo: ['BFG 9000', 'atk'] },
    { id: 'motosierra', name: 'Motosierra', type: 'steel', kind: 'melee',                // 40 (Golpe Kárate 44)
      desc: 'Corta de cerca y muy fuerte, en un arco estrecho.',
      cd: 0.55, dmg: 22, radius: 55, arc: 1.3, knock: 30, vis: { melee: 'claw' },
      evo: ['Crisol', 'atk'] },
    { id: 'gancho-carne', name: 'Gancho de Carne', type: 'fighting', kind: 'dash',       // 25,3 (Golpe Aéreo 24)
      desc: 'Te enganchas al enemigo y cruzas hasta él golpeando todo el camino.',
      cd: 0.75, dmg: 19, radius: 120, width: 32, knock: 30,
      evo: ['Gancho Ardiente', 'spd'] },
    { id: 'granada', name: 'Granada', type: 'steel', kind: 'meteor',                     // 51,2 (Puño Meteoro 48,6)
      desc: 'Lanzas dos granadas que estallan sobre los enemigos y los empujan.',
      cd: 1.25, dmg: 32, count: 2, radius: 52, knock: 70, vis: { proj: 'rock', trail: 'spark' },
      evo: ['Granada de Racimo', 'cd'] },
    { id: 'eructo-llamas', name: 'Eructo de Llamas', type: 'fire', kind: 'cone',         // 65,3 (Rayo Burbuja 64,6)
      desc: 'Un chorro de llamas desde el hombro, en abanico corto. Quema.',
      cd: 0.75, dmg: 7, count: 7, arc: 1.0, speed: 340, life: 0.45, size: 6, pierce: 1, burn: 1,
      vis: { proj: 'fire', trail: 'ember' }, evo: ['Eructo Infernal', 'def'] },
    { id: 'berserker', name: 'Berserker', type: 'fighting', kind: 'buff',                // los números de Danza Espada
      desc: 'No hace daño: acumula ATAQUE mientras esté activo.',
      cd: 0.85, stat: 'atk', amount: 0.13, dur: 7, stacks: 5 },

    // ---- Cacodemonio (DOOM) ----
    { id: 'rayo-bola', name: 'Rayo Bola', type: 'electric', kind: 'projectile',          // 26,7 (Confusión 22,4; Ascuas 34,6)
      desc: 'Escupe una bola de rayos lenta y grande que atraviesa y frena.',
      cd: 0.9, dmg: 24, speed: 210, count: 1, spread: 0.1, pierce: 3, life: 2.4, size: 11, slow: 0.35,
      vis: { proj: 'ball', trail: 'spark' }, evo: ['Tormenta Infernal', 'def'] },
    { id: 'mordisco-infernal', name: 'Mordisco Infernal', type: 'dark', kind: 'melee',   // 38 (Mordisco 37,8)
      desc: 'Abre la boca entera y muerde lo que tiene delante.',
      cd: 0.5, dmg: 19, radius: 56, arc: 1.6, knock: 60, vis: { melee: 'jaws' },
      evo: ['Fauces del Abismo', 'atk'] },
    { id: 'embestida', name: 'Embestida', type: 'dark', kind: 'dash',                   // 26,3 (Ataque Rápido 26,7)
      desc: 'Se lanza con todo el cuerpo: ancha y corta, empuja mucho.',
      cd: 0.8, dmg: 21, radius: 110, width: 46, knock: 90,
      evo: ['Carga Demoníaca', 'hp'] },
    { id: 'lluvia-bolas', name: 'Lluvia de Bolas', type: 'electric', kind: 'meteor',     // 57,6 (Granizo 60)
      desc: 'Bolas de rayos caen sobre los enemigos cercanos y los frenan.',
      cd: 1.25, dmg: 18, count: 4, radius: 42, slow: 0.3, vis: { proj: 'ball', trail: 'spark' },
      evo: ['Aguacero de Plasma', 'cd'] },
    { id: 'mirada-ojo', name: 'Mirada del Ojo', type: 'dark', kind: 'beam',              // 20 (Rayo Hielo 18,2)
      desc: 'Su único ojo lanza un rayo oscuro que atraviesa y frena.',
      cd: 1.1, dmg: 22, radius: 220, width: 34, slow: 0.3, vis: { beam: 'shadow' },
      evo: ['Ojo del Infierno', 'atk'] },
    { id: 'aura-infernal', name: 'Aura Infernal', type: 'dark', kind: 'aura',            // 16,4 (Tinieblas 18)
      desc: 'Un aura del infierno le rodea: daña y frena algo a lo cercano.',
      cd: 0.55, dmg: 9, radius: 80, slow: 0.2, vis: { aura: 'shadow', rise: true },
      evo: ['Círculo Infernal', 'rgn'] },
    { id: 'pellejo-grueso', name: 'Pellejo Grueso', type: 'dark', kind: 'buff',          // los números de Fortaleza
      desc: 'No hace daño: acumula DEFENSA mientras esté activo.',
      cd: 0.85, stat: 'def', amount: 0.07, dur: 7, stacks: 5 },

    // ---- Kirby (Kirby) ----
    { id: 'bala-estelar', name: 'Bala Estelar', type: 'normal', kind: 'projectile',     // 32,9 (Impactrueno 32,5)
      desc: 'Absorbe a un enemigo y lo escupe convertido en una estrella grande y rápida hacia el más cercano. Estalla contra el primero que toca.',
      cd: 0.7, dmg: 23, speed: 360, count: 1, spread: 0.1, pierce: 0, life: 1.4, size: 10, vis: { proj: 'star', trail: 'spark', pal: 'electric' },
      evo: ['Bala Penetrante', 'mag'] },
    { id: 'copia-cuchillo', name: 'Cuchillo', type: 'steel', kind: 'boomerang',         // 21,2 (Hoja Afilada 22,2)
      desc: 'Lanza una cuchilla en forma de bumerán que vuelve a ti, cortando a la ida y a la vuelta.',
      cd: 0.85, dmg: 18, speed: 330, count: 1, radius: 220, size: 8, vis: { proj: 'crescent', pal: 'steel' },
      evo: ['Cuchillo Chakram', 'cd'] },
    { id: 'copia-espada', name: 'Espada', type: 'fighting', kind: 'melee',              // 35,6 (Garra Metal 36,0)
      desc: 'Tajos rápidos de espada en un arco largo y amplio. Empuja poco.',
      cd: 0.45, dmg: 16, radius: 68, arc: 1.9, knock: 40, vis: { melee: 'claw', pal: 'steel' },
      evo: ['Gran Espada', 'atk'] },
    { id: 'copia-fuego', name: 'Fuego', type: 'fire', kind: 'cone',                     // 68,6 (Lanzallamas 70,0)
      desc: 'Aliento de fuego en un abanico corto y algo más ancho. Quema.',
      cd: 0.7, dmg: 6, count: 8, arc: 1, speed: 360, life: 0.43, size: 6, pierce: 1, burn: 1, vis: { proj: 'fire', trail: 'ember' },
      evo: ['Fuego Dragontino', 'spd'] },
    { id: 'copia-martillo', name: 'Martillo', type: 'normal', kind: 'melee',            // 37,8 (Mordisco 37,8)
      desc: 'Un mazazo con el martillo de madera: lento, corto y brutal. Empuja mucho.',
      cd: 0.9, dmg: 34, radius: 62, arc: 2.2, knock: 120, vis: { melee: 'impact', pal: 'ground' },
      evo: ['Gran Martillo', 'hp'] },
    { id: 'copia-bomba', name: 'Bomba', type: 'fire', kind: 'mine',                     // 26,7 (Disparo Demora 25,5)
      desc: 'Deja dos bombas en el suelo que estallan cuando un enemigo las pisa y lo empujan.',
      cd: 1.2, dmg: 16, count: 2, radius: 58, dur: 7, knock: 60, vis: { proj: 'ball', pal: 'dark' },
      evo: ['Bomba en Cadena', 'xp'] },
    { id: 'superabsorcion', name: 'Superabsorción', type: 'flying', kind: 'aura',       // 15,0 (Nieve Polvo 14,5)
      desc: 'Aspira con todas sus fuerzas: daña y frena a todo lo que tiene cerca.',
      cd: 0.6, dmg: 9, radius: 78, slow: 0.3, vis: { aura: 'wind', inward: true },
      evo: ['Hipernova', 'rgn'] },
    { id: 'maxi-tomate', name: 'Maxi Tomate', type: 'normal', kind: 'buff',             // los números de Acua Aro
      desc: 'No hace daño: se come un Maxi Tomate y acumula REGENERACIÓN de vida.',
      cd: 0.9, stat: 'regen', amount: 1.6, dur: 8, stacks: 4, vis: { buff: 'heart', pal: 'fighting' } },

    // ---- Link (Zelda) ----
    { id: 'espada-maestra', name: 'Espada Maestra', type: 'steel', kind: 'melee',       // 36,0 (Garra Metal 36,0)
      desc: 'Tajo con la Espada Maestra en arco amplio que empuja.',
      cd: 0.5, dmg: 18, radius: 64, arc: 2, knock: 50,
      evo: ['Gran Ataque Circular', 'atk'] },
    { id: 'rayo-espada', name: 'Rayo de Espada', type: 'fairy', kind: 'beam',           // 22,0 (Foco Resplandor 21,9)
      desc: 'La espada lanza un haz de luz en línea recta que atraviesa a todos los enemigos.',
      cd: 1, dmg: 22, radius: 240, width: 26, vis: { beam: 'crescent', pal: 'aura' },
      evo: ['Rayo Celestial', 'hp'] },
    { id: 'arco-hadas', name: 'Arco de las Hadas', type: 'fairy', kind: 'projectile',   // 30,0 (Bola Sombra 28,8)
      desc: 'Una flecha rápida y certera de largo alcance que atraviesa a un enemigo.',
      cd: 0.5, dmg: 15, speed: 520, count: 1, spread: 0.08, pierce: 1, life: 1.1, size: 5, vis: { proj: 'needle' },
      evo: ['Flecha de Luz', 'xp'] },
    { id: 'bumeran', name: 'Bumerán', type: 'flying', kind: 'boomerang',                // 17,0 (Huesomerang 16,8)
      desc: 'Un bumerán que va y vuelve; aturde y frena a lo que golpea.',
      cd: 1, dmg: 17, speed: 320, count: 1, radius: 220, size: 7, slow: 0.5, vis: { proj: 'crescent' },
      evo: ['Bumerán Tornado', 'mag'] },
    { id: 'bomba-mecha', name: 'Bomba de Mecha', type: 'normal', kind: 'mine',          // 25,0 (Disparo Demora 25,5)
      desc: 'Deja una bomba a tus pies: estalla con todo su daño si la pisa un enemigo o, con la mitad, al consumirse la mecha. Empuja.',
      cd: 1.2, dmg: 30, count: 1, radius: 60, dur: 3, knock: 80, vis: { proj: 'ball', pal: 'aura' },
      evo: ['Bomba Remota', 'cd'] },
    { id: 'botas-pegaso', name: 'Botas de Pegaso', type: 'steel', kind: 'dash',         // 25,3 (Golpe Aéreo 24,0)
      desc: 'Sale disparado en línea recta con la espada por delante y arrolla todo lo que encuentra.',
      cd: 0.75, dmg: 19, radius: 120, width: 34, knock: 50, vis: { proj: 'streak', melee: 'claw' },
      evo: ['Epona', 'spd'] },
    { id: 'fuego-din', name: 'Fuego de Din', type: 'fire', kind: 'nova',                // 100,0 (Onda Ígnea 104,0)
      desc: 'Golpea el suelo y una cúpula de fuego se expande a su alrededor. Quema.',
      cd: 1.3, dmg: 13, speed: 220, count: 10, pierce: 1, life: 1, size: 7, burn: 1, vis: { proj: 'fire', trail: 'ember' },
      evo: ['Medallón Bombos', 'atk'] },
    { id: 'escudo-hyliano', name: 'Escudo Hyliano', type: 'steel', kind: 'buff',        // los números de Fortaleza
      desc: 'No hace daño: acumula DEFENSA mientras esté activo.',
      cd: 0.85, stat: 'def', amount: 0.07, dur: 7, stacks: 5, vis: { buff: 'arrow', pal: 'aura' } },

    // ---- Samus (Metroid) ----
    { id: 'rayo-de-poder', name: 'Rayo de Poder', type: 'normal', kind: 'projectile',   // 33,3 (Impactrueno 32,5)
      desc: 'Disparos de energía rapidísimos al enemigo más cercano.',
      cd: 0.36, dmg: 12, speed: 460, count: 1, spread: 0.08, pierce: 0, life: 1.1, size: 5, vis: { proj: 'ball', pal: 'electric', trail: 'spark' },
      evo: ['Rayo Phazon', 'def'] },
    { id: 'lanzamisiles', name: 'Lanzamisiles', type: 'steel', kind: 'projectile',      // 26,7 (Esfera Aural 27,4)
      desc: 'Un misil que persigue al enemigo y lo empuja al estallar.',
      cd: 0.9, dmg: 24, speed: 320, count: 1, spread: 0.1, pierce: 0, life: 1.5, size: 8, knock: 60, homing: 2.5, vis: { proj: 'needle', trail: 'ember' },
      evo: ['Supermisil', 'atk'] },
    { id: 'rayo-de-ondas', name: 'Rayo de Ondas', type: 'electric', kind: 'chain',      // 80,0 (Infortunio 75,6)
      desc: 'Una descarga eléctrica que busca sola al enemigo y salta a los cercanos. Frena un poco.',
      cd: 0.95, dmg: 19, count: 4, radius: 145, slow: 0.25, vis: { beam: 'lightning', pal: 'poison' },
      evo: ['Látigo de Ondas', 'mag'] },
    { id: 'rayo-de-hielo', name: 'Rayo de Hielo', type: 'ice', kind: 'beam',            // 20,0 (Hidrobomba 19,3)
      desc: 'Un disparo helado, lento y fuerte, en línea recta: atraviesa y frena mucho.',
      cd: 1.2, dmg: 24, radius: 220, width: 26, slow: 0.6, vis: { beam: 'shard' },
      evo: ['Difusor de Hielo', 'atk'] },
    { id: 'rayo-de-plasma', name: 'Rayo de Plasma', type: 'fire', kind: 'cone',         // 66,7 (Rayo Burbuja 64,6)
      desc: 'Chorros cortos de energía fundida en abanico estrecho. Quema.',
      cd: 0.75, dmg: 10, count: 5, arc: 0.55, speed: 390, life: 0.4, size: 7, pierce: 1, burn: 1, vis: { proj: 'fire', trail: 'ember' },
      evo: ['Lanzallamas de Plasma', 'cd'] },
    { id: 'bomba-morfosfera', name: 'Bomba de Morfosfera', type: 'ground', kind: 'mine',// 27,5 (Disparo Demora 25,5)
      desc: 'Hecha Morfosfera, deja tres bombas de energía que estallan al pisarlas o, con la mitad de fuerza, al acabarse su tiempo.',
      cd: 1.2, dmg: 11, count: 3, radius: 58, dur: 5, vis: { proj: 'ball', pal: 'aura' },
      evo: ['Bomba de Energía', 'hp'] },
    { id: 'turbosfera', name: 'Turbosfera', type: 'steel', kind: 'dash',                // 24,7 (Golpe Aéreo 24,0)
      desc: 'Hecha Morfosfera, sale disparada hacia el enemigo y arrolla lo que cruza.',
      cd: 0.85, dmg: 21, radius: 120, width: 30, knock: 50, vis: { proj: 'ball', pal: 'fire' },
      evo: ['Hiperesfera', 'spd'] },
    { id: 'rayo-recarga', name: 'Rayo Recarga', type: 'electric', kind: 'buff',         // los números de Danza Espada
      desc: 'No hace daño: acumula ATAQUE mientras esté activo.',
      cd: 0.85, stat: 'atk', amount: 0.13, dur: 7, stacks: 5, vis: { buff: 'ball', pal: 'electric' } },

    // ---- Pac-Man (Pac-Man) ----
    { id: 'waka-waka', name: 'Waka Waka', type: 'dark', kind: 'melee',                  // 35,7 (Garra Metal 36,0)
      desc: 'Abre y cierra la boca y muerde en cuña lo que tiene delante.',
      cd: 0.42, dmg: 15, radius: 58, arc: 1.6, knock: 40, vis: { melee: 'jaws', pal: 'electric' },
      evo: ['Super Pac-Man', 'hp'] },
    { id: 'fruta-bonificacion', name: 'Fruta de Bonificación', type: 'grass', kind: 'projectile',// 31,7 (Pistola Agua 31,8)
      desc: 'Lanza una fruta del arcade (cereza, fresa, naranja…) que empuja un poco.',
      cd: 0.6, dmg: 19, speed: 300, count: 1, spread: 0.12, pierce: 0, life: 1.5, size: 8, knock: 40, vis: { proj: 'ball', pal: 'fighting' },
      evo: ['Llave de Bonificación', 'xp'] },
    { id: 'pildora-poder', name: 'Píldora de Poder', type: 'electric', kind: 'buff',    // los números de Danza Espada
      desc: 'No hace daño: acumula ATAQUE mientras esté activo.',
      cd: 0.85, stat: 'atk', amount: 0.13, dur: 7, stacks: 5, vis: { buff: 'ball', pal: 'normal' } },
    { id: 'combo-fantasmas', name: 'Combo de Fantasmas', type: 'dark', kind: 'chain',   // 75,8 (Infortunio 75,6)
      desc: 'Se come a un enemigo y salta a los siguientes, como los cuatro fantasmas de una píldora. Más daño si están quemados, envenenados o frenados.',
      cd: 0.95, dmg: 18, count: 4, radius: 145, hex: 1.6, vis: { beam: 'jaws', pal: 'electric' },
      evo: ['Tren de Fantasmas', 'mag'] },
    { id: 'boca-riego', name: 'Boca de Riego', type: 'water', kind: 'turret',           // 3,8 (Sustituto 3,5)
      desc: 'Deja una boca de riego que dispara agua sola y empuja a los enemigos.',
      cd: 4, dmg: 15, rate: 0.5, dur: 6, count: 1, range: 280, speed: 300, size: 7, knock: 70, vis: { proj: 'drop', trail: 'drip' },
      evo: ['Géiser', 'def'] },
    { id: 'rodada-turbo', name: 'Rodada Turbo', type: 'normal', kind: 'dash',           // 25,3 (Golpe Aéreo 24,0)
      desc: 'Coge vueltas en el sitio y sale rodando hacia el enemigo, arrollando lo que cruza.',
      cd: 0.75, dmg: 19, radius: 115, width: 34, knock: 50, vis: { proj: 'streak', pal: 'electric' },
      evo: ['Pac-Man Gigante', 'spd'] },
    { id: 'pac-bomba', name: 'Pac-Bomba', type: 'normal', kind: 'nova',                 // 84,6 (Psíquico 88,9)
      desc: 'Estalla a su alrededor y lanza lejos a los enemigos, de vuelta a casa.',
      cd: 1.3, dmg: 11, speed: 260, count: 10, pierce: 1, life: 1, size: 8, knock: 90, vis: { proj: 'impact', pal: 'fire', trail: 'spark' },
      evo: ['Combo 256', 'cd'] },
    { id: 'rastro-fuego', name: 'Rastro de Fuego', type: 'fire', kind: 'trail',         // 30,0 (Rueda Fuego 35,7)
      desc: 'Rueda envuelto en llamas y deja fuego por donde pasa. Quema.',
      cd: 0.3, dmg: 9, radius: 27, dur: 2.8, burn: 1, vis: { proj: 'fire', aura: 'fire' },
      evo: ['Pyro', 'atk'] },

    // ---- Blinky (Pac-Man) ----
    { id: 'pandilla-fantasma', name: 'Pandilla Fantasma', type: 'dark', kind: 'orbit',  // 160,7 (Tornado 150,0)
      desc: 'Pinky, Inky y Clyde giran alrededor de su líder y dañan a quien se acerque.',
      cd: 0.28, dmg: 15, count: 3, radius: 68, speed: 2.5, size: 9, vis: { proj: 'shadow', trail: 'wisp', pal: 'psychic' },
      evo: ['Pac-Mania', 'xp'] },
    { id: 'persecucion', name: 'Persecución', type: 'dark', kind: 'projectile',         // 25,0 (Picotazo Veneno 23,5)
      desc: 'Lanza su sombra roja, que persigue sola al enemigo más cercano.',
      cd: 0.6, dmg: 15, speed: 290, count: 1, spread: 0.1, pierce: 0, life: 2, size: 8, homing: 3, vis: { proj: 'shadow', trail: 'wisp', pal: 'fighting' },
      evo: ['Sombra', 'spd'] },
    { id: 'carga-de-toro', name: 'Carga de Toro', type: 'normal', kind: 'dash',         // 25,0 (Golpe Aéreo 24,0)
      desc: 'Le salen cuernos de toro y cruza en línea recta hasta el enemigo, arrollando y empujando fuerte todo lo que pilla.',
      cd: 0.8, dmg: 20, radius: 120, width: 32, knock: 80, vis: { proj: 'streak', melee: 'impact' },
      evo: ['Superfantasma', 'hp'] },
    { id: 'dispersion', name: 'Dispersión', type: 'dark', kind: 'nova',                 // 80,0 (Burbuja 72,0)
      desc: 'Los fantasmas se dispersan hacia sus esquinas: una ráfaga en todas direcciones que empuja.',
      cd: 1.2, dmg: 12, speed: 250, count: 8, pierce: 1, life: 1.1, size: 8, knock: 50, vis: { proj: 'shadow', trail: 'wisp', pal: 'ghost' },
      evo: ['Cuatro Esquinas', 'cd'] },
    { id: 'vuelta-a-casa', name: 'Vuelta a Casa', type: 'ghost', kind: 'boomerang',     // 21,2 (Hoja Afilada 22,2)
      desc: 'Sus dos ojos salen disparados y vuelven a él a toda velocidad, golpeando a la ida y a la vuelta.',
      cd: 0.85, dmg: 9, speed: 380, count: 2, spread: 0.5, radius: 205, size: 6, vis: { proj: 'ball', pal: 'flying' },
      evo: ['Caja de Regeneración', 'rgn'] },
    { id: 'minifantasmas', name: 'Minifantasmas', type: 'ghost', kind: 'meteor',        // 52,0 (Puño Meteoro 48,6)
      desc: 'Caen fantasmitas del cielo sobre los enemigos cercanos y los frenan.',
      cd: 1.25, dmg: 13, count: 5, radius: 40, slow: 0.3, vis: { proj: 'shadow', trail: 'wisp' },
      evo: ['Platillo Volante', 'atk'] },
    { id: 'toque-fantasma', name: 'Toque Fantasma', type: 'ghost', kind: 'aura',        // 18,0 (Brillo Mágico 18,0)
      desc: 'Tocar a un fantasma sale caro: daña sin parar todo lo que tiene pegado.',
      cd: 0.5, dmg: 9, radius: 70, vis: { aura: 'shadow' },
      evo: ['Game Over', 'def'] },
    { id: 'cruise-elroy', name: 'Cruise Elroy', type: 'dark', kind: 'buff',             // los números de Agilidad
      desc: 'No hace daño: acumula VELOCIDAD mientras esté activo.',
      cd: 0.85, stat: 'spd', amount: 0.1, dur: 7, stacks: 5, vis: { buff: 'arrow', pal: 'fighting' } },

    // ---- Drácula (Castlevania) ----
    { id: 'fuego-infernal', name: 'Fuego Infernal', type: 'fire', kind: 'projectile',   // 31,8 (Pistola Agua 31,8)
      desc: 'Abre la capa y lanza tres bolas de fuego en abanico estrecho. Queman.',
      cd: 0.85, dmg: 9, speed: 300, count: 3, spread: 0.1, pierce: 0, life: 1.5, size: 6, burn: 1, vis: { proj: 'fire', trail: 'ember' },
      evo: ['Infierno Oscuro', 'atk'] },
    { id: 'alas-demoniacas', name: 'Alas Demoníacas', type: 'dark', kind: 'melee',      // 31,7 (Placaje 32,0)
      desc: 'La capa se vuelve alas con púas: un barrido amplio y largo que empuja.',
      cd: 0.6, dmg: 19, radius: 75, arc: 2.5, knock: 60, vis: { melee: 'claw' },
      evo: ['Forma Verdadera', 'hp'] },
    { id: 'enjambre-murcielagos', name: 'Enjambre de Murciélagos', type: 'flying', kind: 'dash',// 24,0 (Golpe Aéreo 24,0)
      desc: 'Se deshace en murciélagos y reaparece junto al enemigo, mordiendo todo lo del camino.',
      cd: 0.75, dmg: 18, radius: 115, width: 44, knock: 20, vis: { proj: 'crescent', pal: 'dark' },
      evo: ['Luna de Murciélagos', 'spd'] },
    { id: 'rayo-fatal', name: 'Rayo Fatal', type: 'dark', kind: 'meteor',               // 50,0 (Puño Meteoro 48,6)
      desc: 'Una columna de energía sube y cae en cinco rayos sobre los enemigos cercanos.',
      cd: 1.2, dmg: 12, count: 5, radius: 40, vis: { proj: 'streak', pal: 'grass' },
      evo: ['Rayo de Destrucción', 'mag'] },
    { id: 'ola-oscuridad', name: 'Ola de Oscuridad', type: 'dark', kind: 'nova',        // 92,3 (Vozarrón 93,9)
      desc: 'Olas de oscuridad en todas direcciones: atraviesan y hacen retroceder.',
      cd: 1.3, dmg: 12, speed: 230, count: 10, pierce: 1, life: 1.1, size: 8, knock: 50, vis: { proj: 'shadow', trail: 'wisp' },
      evo: ['Megiddo Demoníaco', 'atk'] },
    { id: 'robo-almas', name: 'Robo de Almas', type: 'ghost', kind: 'aura',             // 16,4 (Hierba Lazo 16,4)
      desc: 'Las almas de lo que tiene cerca vuelan hacia él: daña sin parar a su alrededor.',
      cd: 0.55, dmg: 9, radius: 80, vis: { aura: 'shadow', inward: true },
      evo: ['Poder de Dominación', 'rgn'] },
    { id: 'guadana-muerte', name: 'Guadaña de la Muerte', type: 'ghost', kind: 'boomerang',// 18,9 (Huesomerang 16,8)
      desc: 'Lanza la guadaña de la Muerte: va y vuelve cortando.',
      cd: 0.95, dmg: 18, speed: 300, count: 1, radius: 220, size: 10, knock: 30, vis: { proj: 'crescent' },
      evo: ['Hoz Llameante', 'def'] },
    { id: 'metamorfosis-oscura', name: 'Metamorfosis Oscura', type: 'dark', kind: 'buff',// los números de Acua Aro
      desc: 'No hace daño: acumula REGENERACIÓN de vida.',
      cd: 0.9, stat: 'regen', amount: 1.6, dur: 8, stacks: 4, vis: { buff: 'drop', pal: 'fighting' } },

    // ---- Ojo de Cthulhu (Terraria) ----
    { id: 'siervo-de-cthulhu', name: 'Siervo de Cthulhu', type: 'psychic', kind: 'projectile',// 25,7 (Esfera Aural 27,4)
      desc: 'De tu pupila nace un Siervo de Cthulhu que vuela solo hacia el enemigo más cercano y lo persigue.',
      cd: 0.7, dmg: 18, speed: 240, count: 1, spread: 0.1, pierce: 0, life: 2.1, size: 9, homing: 2, vis: { proj: 'ball', pal: 'normal', trail: 'wisp' },
      evo: ['Ojos Fantasmales', 'cd'] },
    { id: 'embestida-nocturna', name: 'Embestida Nocturna', type: 'dark', kind: 'dash', // 25,0 (Golpe Aéreo 24,0)
      desc: 'Te lanzas contra el enemigo y arrollas todo lo que cruzas: ancha y larga, empuja.',
      cd: 0.8, dmg: 20, radius: 120, width: 44, knock: 70, vis: { proj: 'streak', pal: 'fighting' },
      evo: ['Escudo de Cthulhu', 'def'] },
    { id: 'dentellada', name: 'Dentellada', type: 'dark', kind: 'melee',                // 42,0 (Golpe Kárate 44,0)
      desc: 'Abres la boca de tu segunda forma y muerdes lo que tienes delante, en arco estrecho. Empuja.',
      cd: 0.5, dmg: 21, radius: 62, arc: 1.6, knock: 80, vis: { melee: 'jaws' },
      evo: ['Espasmatizador', 'atk'] },
    { id: 'embestidas-en-cadena', name: 'Embestidas en Cadena', type: 'dark', kind: 'chain',// 78,0 (Infortunio 75,6)
      desc: 'Embestidas fugaces que saltan de un enemigo al siguiente más cercano: tres seguidas, cada una algo más floja.',
      cd: 1, dmg: 26, count: 3, radius: 145, vis: { beam: 'streak', pal: 'fighting' },
      evo: ['El Ojo de Cthulhu', 'spd'] },
    { id: 'iris-roto', name: 'Iris Roto', type: 'psychic', kind: 'nova',                // 85,7 (Psíquico 88,9)
      desc: 'Giras sobre ti mismo, se te desprende el iris y sus trozos salen en todas direcciones buscando enemigos.',
      cd: 1.4, dmg: 12, speed: 220, count: 10, pierce: 0, life: 1.5, size: 8, homing: 1, vis: { proj: 'shard', pal: 'aura' },
      evo: ['Esferas Fantasmales', 'rgn'] },
    { id: 'presencia-maligna', name: 'Presencia Maligna', type: 'psychic', kind: 'aura',// 15,0 (Nieve Polvo 14,5)
      desc: 'Los enemigos sienten que una presencia maligna los observa: daña y frena algo a lo que tienes cerca.',
      cd: 0.6, dmg: 9, radius: 76, slow: 0.25, vis: { aura: 'ring', inward: true },
      evo: ['Infierno Inminente', 'xp'] },
    { id: 'segunda-forma', name: 'Segunda Forma', type: 'dark', kind: 'buff',           // los números de Danza Dragón
      desc: 'No hace daño: acumula ATAQUE mientras esté activo.',
      cd: 0.7, stat: 'atk', amount: 0.11, dur: 7, stacks: 5, vis: { buff: 'jaws' } },
    // ---- Jefe Maestro (Halo) ----
    { id: 'rifle-de-asalto', name: 'Rifle de Asalto', type: 'normal', kind: 'projectile',  // 30,0 (Pistola Agua 31,8)
      desc: 'Fuego automático y rapidísimo al enemigo más cercano, algo disperso.',
      cd: 0.3, dmg: 9, speed: 440, count: 1, spread: 0.16, pierce: 0, life: 1, size: 4, vis: { proj: 'needle', pal: 'electric' },
      evo: ['Rifle de Batalla', 'cd'] },
    { id: 'aguijoneador', name: 'Aguijoneador', type: 'rock', kind: 'projectile',          // 26,7 (Esfera Aural 27,4)
      desc: 'Dispara dos agujas de cristal rosa que persiguen solas al enemigo.',
      cd: 0.75, dmg: 10, speed: 300, count: 2, spread: 0.25, pierce: 0, life: 1.8, size: 5, homing: 2.5, vis: { proj: 'shard', pal: 'psychic', trail: 'spark' },
      evo: ['Supercombinación', 'mag'] },
    { id: 'granada-de-plasma', name: 'Granada de Plasma', type: 'fire', kind: 'meteor',    // 49,2 (Puño Meteoro 48,6)
      desc: 'Lanza una granada de plasma que se pega al enemigo y estalla con fuerza. Quema.',
      cd: 1.3, dmg: 64, count: 1, radius: 46, burn: 1, vis: { proj: 'ball', pal: 'aura', trail: 'spark' },
      evo: ['Cañón de Combustible', 'atk'] },
    { id: 'culatazo', name: 'Culatazo', type: 'fighting', kind: 'melee',                   // 41,7 (Golpe Kárate 44,0)
      desc: 'Un golpe seco con la culata del rifle, lento y brutal, en arco estrecho. Empuja mucho.',
      cd: 0.6, dmg: 25, radius: 58, arc: 1.6, knock: 120, vis: { melee: 'impact' },
      evo: ['Martillo Gravitatorio', 'hp'] },
    { id: 'espada-de-energia', name: 'Espada de Energía', type: 'fire', kind: 'dash',      // 26,3 (Ataque Rápido 26,7)
      desc: 'Se lanza en estocada hacia el enemigo con la espada de plasma y corta todo lo del camino.',
      cd: 0.8, dmg: 21, radius: 115, width: 28, knock: 30, vis: { proj: 'streak', melee: 'claw', pal: 'aura' },
      evo: ['Espada Duelista', 'spd'] },
    { id: 'rifle-de-precision', name: 'Rifle de Precisión', type: 'steel', kind: 'beam',   // 23,3 (Furia Dragón 24,0)
      desc: 'Un disparo lento y certero que cruza todo el campo en línea recta y atraviesa a todos.',
      cd: 1.5, dmg: 35, radius: 250, width: 20, vis: { beam: 'streak', pal: 'normal' },
      evo: ['Láser Spartan', 'atk'] },
    { id: 'warthog', name: 'Warthog', type: 'ground', kind: 'turret',                      // 3,5 (Sustituto 3,5)
      desc: 'Aparca un Warthog con un marine en la ametralladora, que dispara solo una ráfaga rápida.',
      cd: 4, dmg: 14, rate: 0.35, dur: 5, count: 1, range: 290, speed: 420, size: 5, vis: { proj: 'needle', pal: 'electric' },
      evo: ['Scorpion', 'def'] },
    { id: 'sobreescudo', name: 'Sobreescudo', type: 'electric', kind: 'buff',              // los números de Fortaleza
      desc: 'No hace daño: acumula DEFENSA mientras esté activo.',
      cd: 0.85, stat: 'def', amount: 0.07, dur: 7, stacks: 5, vis: { buff: 'ring', pal: 'aura' } },
    // ---- Kratos (God of War) ----
    { id: 'espadas-del-caos', name: 'Espadas del Caos', type: 'fire', kind: 'melee',     // 30,0 (Látigo Cepa 30,6)
      desc: 'Dos espadas al rojo atadas a cadenas: barren un arco amplio y lejano. Quema.',
      cd: 0.6, dmg: 18, radius: 85, arc: 2.4, knock: 30, burn: 1, vis: { melee: 'claw', pal: 'fire' },
      evo: ['Ciclón del Caos', 'cd'] },
    { id: 'arpon-de-orion', name: 'Arpón de Orión', type: 'fighting', kind: 'boomerang', // 20,0 (Hoja Afilada 22,2)
      desc: 'Lanza una espada encadenada contra el enemigo y la recoge, golpeando a la ida y a la vuelta.',
      cd: 0.85, dmg: 17, speed: 340, count: 1, radius: 225, size: 8, vis: { proj: 'crescent', pal: 'fire', trail: 'ember' },
      evo: ['Espadas de Atenea', 'atk'] },
    { id: 'furia-de-zeus', name: 'Furia de Zeus', type: 'electric', kind: 'projectile',  // 31,3 (Impactrueno 32,5)
      desc: 'Arroja un rayo de Zeus, rápido y lejano, que atraviesa a uno.',
      cd: 0.48, dmg: 15, speed: 460, count: 1, spread: 0.08, pierce: 1, life: 1.2, size: 6, vis: { proj: 'bolt', trail: 'spark' },
      evo: ['Ira de Cronos', 'mag'] },
    { id: 'ira-de-poseidon', name: 'Ira de Poseidón', type: 'water', kind: 'meteor',     // 50,0 (Puño Meteoro 48,6; Granizo 60)
      desc: 'Rayos azules del dios del mar caen sobre los enemigos cercanos y los frenan.',
      cd: 1.2, dmg: 15, count: 4, radius: 42, slow: 0.3, vis: { proj: 'bolt', pal: 'water', trail: 'spark' },
      evo: ['Diluvio de Poseidón', 'spd'] },
    { id: 'mirada-de-medusa', name: 'Mirada de Medusa', type: 'rock', kind: 'beam',      // 17,5 (Rayo Hielo 18,2)
      desc: 'La cabeza de la Gorgona lanza una mirada en línea recta que petrifica: frena muchísimo.',
      cd: 1.2, dmg: 21, radius: 215, width: 28, slow: 0.75, vis: { beam: 'ring', pal: 'grass' },
      evo: ['Cabeza de Euríale', 'def'] },
    { id: 'ejercito-de-hades', name: 'Ejército de Hades', type: 'ghost', kind: 'orbit',  // 150,0 (Tornado 150,0)
      desc: 'Las almas del Inframundo giran a tu alrededor y golpean lo que tocan.',
      cd: 0.28, dmg: 14, count: 3, radius: 70, speed: 2.5, size: 8, vis: { proj: 'shadow', trail: 'wisp' },
      evo: ['Ejército de Esparta', 'hp'] },
    { id: 'terremoto-de-atlas', name: 'Terremoto de Atlas', type: 'ground', kind: 'nova', // 80,0 (Disparo Lodo 70,0; Burbuja 72,0)
      desc: 'Golpea el suelo y salen rocas en todas direcciones que empujan.',
      cd: 1.2, dmg: 12, speed: 210, count: 8, pierce: 0, life: 1.1, size: 9, knock: 70, vis: { proj: 'rock', trail: 'dirt', pal: 'ground' },
      evo: ['Tierra Destructiva', 'xp'] },
    { id: 'ira-de-esparta', name: 'Ira de Esparta', type: 'fighting', kind: 'buff',      // los números de Danza Espada
      desc: 'No hace daño: acumula ATAQUE mientras esté activo.',
      cd: 0.85, stat: 'atk', amount: 0.13, dur: 7, stacks: 5, vis: { buff: 'arrow', pal: 'fire' } }
  ];

  // Geometría de las hojas (G.SPRITE_META): la escribe tools/nico/multiverso/montar.py.
  // <meta montar.py>
  const META = {
    10001: {"s":1,"a":{"Idle":{"w":32,"h":36,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":30.5},"Walk":{"w":44,"h":42,"n":4,"r":8,"d":[6,8,6,8],"ax":21.5,"ay":36.5},"Attack":{"w":40,"h":36,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":30.5},"Shoot":{"w":40,"h":36,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":30.5},"Charge":{"w":32,"h":36,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":30.5},"Hurt":{"w":40,"h":36,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":30.5},"Faint":{"w":40,"h":36,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":30.5}},"sh":1},
    10002: {"s":1,"a":{"Idle":{"w":32,"h":36,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":30.5},"Walk":{"w":48,"h":44,"n":4,"r":8,"d":[6,8,6,8],"ax":23.5,"ay":38.5},"Attack":{"w":40,"h":36,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":30.5},"Shoot":{"w":40,"h":36,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":30.5},"Charge":{"w":32,"h":36,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":30.5},"Hurt":{"w":40,"h":36,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":30.5},"Faint":{"w":40,"h":36,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":30.5}},"sh":1},
    10003: {"s":1,"a":{"Idle":{"w":32,"h":41,"n":4,"r":8,"d":[10,10,10,10],"ax":15.5,"ay":35.5},"Walk":{"w":32,"h":41,"n":4,"r":8,"d":[6,6,6,6],"ax":15.5,"ay":35.5},"Attack":{"w":40,"h":41,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":35.5},"Shoot":{"w":40,"h":41,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":35.5},"Charge":{"w":32,"h":41,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":35.5},"Hurt":{"w":40,"h":41,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":35.5},"Faint":{"w":40,"h":41,"n":4,"r":8,"d":[8,6,6,10],"ax":19.5,"ay":35.5}},"sh":1,"hv":1},
    10004: {"s":1,"a":{"Idle":{"w":32,"h":36,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":30.5},"Walk":{"w":36,"h":36,"n":4,"r":8,"d":[6,6,6,6],"ax":17.5,"ay":30.5},"Attack":{"w":40,"h":36,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":30.5},"Shoot":{"w":40,"h":36,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":30.5},"Charge":{"w":32,"h":36,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":30.5},"Hurt":{"w":40,"h":36,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":30.5},"Faint":{"w":40,"h":36,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":30.5}},"sh":1},
    10005: {"s":1,"a":{"Idle":{"w":32,"h":37,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":31.5},"Walk":{"w":48,"h":45,"n":4,"r":8,"d":[6,8,6,8],"ax":23.5,"ay":39.5},"Attack":{"w":40,"h":37,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":31.5},"Shoot":{"w":40,"h":37,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":31.5},"Charge":{"w":32,"h":37,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":31.5},"Hurt":{"w":40,"h":37,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":31.5},"Faint":{"w":40,"h":37,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":31.5}},"sh":1},
    10006: {"s":1,"a":{"Idle":{"w":32,"h":36,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":30.5},"Walk":{"w":44,"h":42,"n":4,"r":8,"d":[6,8,6,8],"ax":21.5,"ay":36.5},"Attack":{"w":40,"h":36,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":30.5},"Shoot":{"w":40,"h":36,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":30.5},"Charge":{"w":32,"h":36,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":30.5},"Hurt":{"w":40,"h":36,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":30.5},"Faint":{"w":40,"h":36,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":30.5}},"sh":1},
    10007: {"s":1,"a":{"Idle":{"w":32,"h":35,"n":2,"r":8,"d":[30,14],"ax":15.5,"ay":29.5},"Walk":{"w":32,"h":35,"n":4,"r":8,"d":[6,8,6,8],"ax":15.5,"ay":29.5},"Attack":{"w":40,"h":35,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":29.5},"Shoot":{"w":40,"h":35,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":29.5},"Charge":{"w":32,"h":35,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":29.5},"Hurt":{"w":40,"h":35,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":29.5},"Faint":{"w":40,"h":35,"n":4,"r":8,"d":[8,8,8,12],"ax":19.5,"ay":29.5}},"sh":1},
    10008: {"s":1,"a":{"Idle":{"w":32,"h":40,"n":4,"r":8,"d":[10,10,10,10],"ax":15.5,"ay":34.5},"Walk":{"w":32,"h":40,"n":4,"r":8,"d":[6,6,6,6],"ax":15.5,"ay":34.5},"Attack":{"w":40,"h":40,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":34.5},"Shoot":{"w":40,"h":40,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":34.5},"Charge":{"w":32,"h":40,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":34.5},"Hurt":{"w":40,"h":40,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":34.5},"Faint":{"w":40,"h":40,"n":4,"r":8,"d":[6,6,10,14],"ax":19.5,"ay":34.5}},"sh":1,"hv":1},
    10009: {"s":1,"a":{"Idle":{"w":32,"h":36,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":30.5},"Walk":{"w":32,"h":36,"n":4,"r":8,"d":[6,8,6,8],"ax":15.5,"ay":30.5},"Attack":{"w":40,"h":36,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":30.5},"Shoot":{"w":40,"h":36,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":30.5},"Charge":{"w":32,"h":36,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":30.5},"Hurt":{"w":40,"h":36,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":30.5},"Faint":{"w":40,"h":36,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":30.5}},"sh":1},
    10010: {"s":1,"a":{"Idle":{"w":32,"h":39,"n":4,"r":8,"d":[10,10,10,10],"ax":15.5,"ay":33.5},"Walk":{"w":32,"h":39,"n":4,"r":8,"d":[6,6,6,6],"ax":15.5,"ay":33.5},"Attack":{"w":40,"h":39,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":33.5},"Shoot":{"w":40,"h":39,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":33.5},"Charge":{"w":32,"h":39,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":33.5},"Hurt":{"w":40,"h":39,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":33.5},"Faint":{"w":40,"h":39,"n":4,"r":8,"d":[8,6,6,10],"ax":19.5,"ay":33.5}},"sh":1,"hv":1},
    10011: {"s":1,"a":{"Idle":{"w":32,"h":37,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":31.5},"Walk":{"w":48,"h":45,"n":4,"r":8,"d":[6,8,6,8],"ax":23.5,"ay":39.5},"Attack":{"w":40,"h":37,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":31.5},"Shoot":{"w":40,"h":37,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":31.5},"Charge":{"w":32,"h":37,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":31.5},"Hurt":{"w":40,"h":37,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":31.5},"Faint":{"w":40,"h":37,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":31.5}},"sh":1},
    10012: {"s":1,"a":{"Idle":{"w":32,"h":37,"n":2,"r":8,"d":[36,20],"ax":15.5,"ay":31.5},"Walk":{"w":48,"h":45,"n":4,"r":8,"d":[6,8,6,8],"ax":23.5,"ay":39.5},"Attack":{"w":40,"h":37,"n":7,"r":8,"d":[2,2,3,3,2,2,2],"ax":19.5,"ay":31.5},"Shoot":{"w":40,"h":37,"n":5,"r":8,"d":[2,2,3,2,2],"ax":19.5,"ay":31.5},"Charge":{"w":32,"h":37,"n":2,"r":8,"d":[4,4],"ax":15.5,"ay":31.5},"Hurt":{"w":40,"h":37,"n":2,"r":8,"d":[2,8],"ax":19.5,"ay":31.5},"Faint":{"w":40,"h":37,"n":4,"r":8,"d":[8,12,4,10],"ax":19.5,"ay":31.5}},"sh":1},
  };
  // </meta montar.py>

  for (const p of PERSONAJES) {
    if (G.DEX_BY[p.dex] || !META[p.dex]) continue;
    if (!G.SPRITE_META[p.dex]) G.SPRITE_META[p.dex] = META[p.dex];
    const mon = Object.assign({}, p);
    G.DEX.push(mon);
    G.DEX_BY[mon.dex] = mon;
  }

  if (G.Moves) {
    for (const a of ATAQUES) {
      if (G.Moves.BY_ID[a.id]) continue;
      // La escalera de mejoras es la de su forma: la copia de un ataque de esa forma.
      const igual = G.Moves.ALL.find(m => m.kind === a.kind && m.ups);
      if (!igual) continue;
      const m = Object.assign({}, a, { ups: igual.ups, maxLvl: igual.maxLvl });
      delete m.evo;
      G.Moves.ALL.push(m);
      G.Moves.BY_ID[m.id] = m;
      if (a.evo) G.Moves.EVO[m.id] = a.evo;
    }
  }

  const $ = id => document.getElementById(id);
  const lista = () => G.DEX.filter(p => p.mv && G.SPRITE_META[p.dex]);

  /**
   * El cartel del banner (gancho en refresh() de gacha-ui.js, al final, tras las
   * notas de las probabilidades). Los textos van en español: i18n.js los traduce
   * en el DOM. La pestaña dice «Otros mundos» en vez de «Gen 10» desde que se abre
   * el gacha, esté donde esté. En el banner del Multiverso, las probabilidades de
   * upstream (por rareza, con la Épica de la ×10 y el pity de la Legendaria) no
   * valen: cada tirada trae a uno de sus personajes, todos con la misma
   * probabilidad (poolNear() de gacha.js cae siempre en su rareza).
   */
  function cartel(gen) {
    const tab = document.querySelector(`#gacha-gens .gen-tab[data-gen="${GEN}"] small`);
    if (tab) tab.textContent = 'Otros mundos';
    if (gen !== GEN) return;
    const todos = lista();
    const feat = $('gacha-feat');
    if (feat && !feat.children.length) {
      // Los destacados de upstream son tres legendarios a ×2; con menos personajes, y más pequeños, se
      // ven más grandes: hasta ×4 con uno solo (el encaje de estilo.js los deja sin cortar).
      const kmax = Math.max(2, 5 - Math.min(3, todos.length));
      for (const p of todos.slice(0, 3)) {
        feat.appendChild(G.UI.spriteCanvas(p.dex, 170, 190, { lively: true, scale: 2, dir: 1 }));
        if (G.Estilo) G.Estilo.destacado(feat.lastChild, p.dex);
        if (G.Estilo && G.Estilo.animar && kmax > 2) G.Estilo.animar(feat.lastChild, p.dex, { lively: true, kmax, dir: 1 });
      }
    }
    $('banner-title').textContent = BANNER.name;
    // Las sagas, sin repetir y en el orden de la colección (con diez personajes, sus nombres no caben en un móvil).
    $('banner-desc').textContent = 'Personajes de otros mundos que se cuelan en el enjambre: ' +
      [...new Set(todos.map(p => p.serie))].join(', ') + '.';
    $('gacha-pity').textContent = '';
    const rates = $('gacha-rates');
    if (!rates || !todos.length) return;
    const G_ = G.Gacha;
    const pct = x => +(x * 100).toFixed(2) + '%';
    const shiny = G.MODS && G.MODS.probShiny ? G.MODS.probShiny(G_.SHINY_RATE) : G_.SHINY_RATE;
    const rarezas = [...new Set(todos.map(p => p.rarity))];
    const repetido = rarezas.length === 1
      ? `Un repetido da ${premio(GEN, G_.REFUND[rarezas[0]])} Pokémonedas (un shiny repetido, el triple).`
      : 'Los repetidos dan Pokémonedas (los shiny repetidos, el triple).';
    rates.innerHTML = '<h3>Probabilidades</h3>' + todos.map(p => `
      <div><span style="color:${G_.RARITY_COLOR[p.rarity]}">${G.UI.stars(p.rarity, 10)} ${p.name}</span>
      <span>${pct(1 / todos.length)}</span></div>`).join('') +
      `<div><span>${G.Icons.html('shiny', 12)} Shiny</span><span>${pct(shiny)}</span></div>
       <p class="note">· Cada tirada trae a uno de estos personajes, todos con la misma probabilidad.<br>
       · No hay legendarios, así que tampoco pity.<br>${lila() ? `
       · Cada tirada cuesta un ticket ×10, el lila (la ×10, diez).<br>` : ''}
       · ${repetido}<br>
       · Nunca salen de enemigos: sólo se consiguen aquí.</p>`;
  }

  /**
   * La ficha de la colección (gancho en showDetail() de menu.js): si aún no lo
   * tienes, upstream dice «Consíguelo en el banner de X o derrotándolo cuando
   * salga shiny», y un personaje del Multiverso nunca sale de enemigo.
   */
  function ficha(dex) {
    const p = G.DEX_BY[dex], s = G.DB && G.DB.save;
    if (!p || !p.mv || !s || s.owned[dex]) return;
    const nota = document.querySelector('#dex-detail p.center');
    if (nota) nota.innerHTML = 'Aún no lo tienes.<br>Sólo sale en el banner del Multiverso, en el gacha.';
  }

  /** G.MODS.multiversoTicketLila: en este banner se tira con tickets ×10 (los lila). */
  const lila = () => !!(G.MODS && G.MODS.multiversoTicketLila);

  /** Tickets normales que vale un ticket ×10: la ×10 de upstream cuesta 10 tickets o 1 ticket ×10. */
  const TICKETS_POR_LILA = 10;

  /**
   * Las Pokémonedas de un repetido (gancho de una línea en pull() de gacha.js, tras calcular las de
   * upstream): en el banner del Multiverso, con G.MODS.multiversoRepetidoPorCoste, las de su rareza por
   * cada ticket normal que vale su tirada; con multiversoTicketLila, un ticket ×10, que vale 10: 300, y
   * 900 un shiny. Por ticket gastado es lo que daba antes del ticket lila y menos que un banner normal
   * en el que ya todo sale repetido (check.js lo mide). En los demás banners, o sin el ajuste, lo de
   * upstream tal cual.
   */
  function premio(gen, refund) {
    if (gen !== GEN || !(G.MODS && G.MODS.multiversoRepetidoPorCoste)) return refund;
    return refund * (lila() ? TICKETS_POR_LILA : 1);
  }

  /**
   * Lo que gasta una tirada (gancho de una línea en pull() de gacha.js, en vez de su costOf(), que no
   * sabe de banners). En el banner del Multiverso, con multiversoTicketLila, cada tirada cuesta un
   * ticket ×10: la ×1, uno y la ×10, diez; la ×10 «por 1 ticket ×10» no vale aquí (sería una tirada
   * a una décima parte). En los demás banners, o sin el ajuste, el costOf() de upstream tal cual.
   * → { t1, t10 } o null si no te llega.
   */
  function coste(save, n, gen, use, costOf) {
    if (gen !== GEN || !lila()) return costOf(save, n, use);
    if (use === 't10') return null;
    const t10 = (save && save.tickets && save.tickets.t10) || 0;
    return n >= 1 && t10 >= n ? { t1: 0, t10: n } : null;
  }

  /**
   * Los botones de tirar (gancho de una línea al final de refresh() de gacha-ui.js, tras los de
   * upstream): en el banner del Multiverso con el ajuste, el coste en tickets ×10, su estado y sin el
   * tercer botón; en los demás, el tercer botón vuelve a verse y lo demás queda como lo dejó upstream.
   */
  function botones(gen, save) {
    const b3 = $('pull-10b');
    const aqui = gen === GEN && lila();
    if (b3) b3.style.display = aqui ? 'none' : '';
    if (!aqui) return;
    const c1 = $('cost-1'), c10 = $('cost-10'), b1 = $('pull-1'), b10 = $('pull-10');
    if (c1) c1.innerHTML = `${G.Icons.html('ticket10', 18)} 1`;
    if (c10) c10.innerHTML = `${G.Icons.html('ticket10', 18)} 10`;
    if (b1) b1.disabled = !coste(save, 1, gen, 't1');
    if (b10) b10.disabled = !coste(save, 10, gen, 't1');
  }

  return { GEN, BANNER, PERSONAJES, ATAQUES, lista, cartel, ficha, coste, botones, premio };
})();
