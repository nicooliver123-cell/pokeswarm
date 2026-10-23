# PokéSwarm

**Roguelite de hordas Pokémon.** Tú y tu compañero contra el enjambre: elige a tu
Pokémon, aguanta oleadas cada vez más grandes, sube de nivel, evoluciona tus
ataques, entra en las grietas a por legendarios y caza shinies. En el navegador
y en el móvil, solo o con amigos.

<p align="center"><img src=".github/capturas/partida.webp" width="100%" alt="Una partida a los 4 minutos: tu Pokémon en medio de la horda, con un jefe y disparos enemigos marcados en rojo"></p>

> **Jugar:** https://nicooliver123-cell.github.io/pokeswarm/
> Fallos, sugerencias y retiradas de contenido: [avisos del repositorio](https://github.com/nicooliver123-cell/pokeswarm/issues).

**Estado (13-10-2026):** se juega entero, solo o en grupo. Las cuentas, los
amigos, el ranking y el cooperativo acaban de estrenar servidor propio y el
cooperativo todavía no se ha probado entre dos casas: si algo falla, cuéntalo en
los avisos.

Es un juego hecho por fans, **gratuito y sin ánimo de lucro**: sin anuncios ni
compras. Pokémon no es nuestro (ver [Marca](#marca)).

## Cómo se juega

Entra con una cuenta o como invitado, elige tu primer compañero (uno de los
29 iniciales) y a la mazmorra. Tu Pokémon ataca solo con su movimiento
activo; tú te mueves, esquivas y eliges qué aprender al subir de nivel.

| En el PC | Acción |
|---|---|
| `W` `A` `S` `D` o flechas | Moverse |
| `1` a `4`, o clic en el icono | Elegir el ataque activo |
| `Q` / `E` | Ataque anterior / siguiente |
| `Esc` o `P` | Pausa |
| `1` a `3` | Elegir carta al subir de nivel |
| `Tab` | Recorrer los menús |

**En el móvil**, en horizontal: pon el dedo en cualquier sitio y arrastra para
moverte (el joystick aparece donde tocas), toca un ataque para cambiarlo y el
botón de arriba a la derecha para pausar. En vertical te pide girar el móvil.

En una partida hay **jefes**, **grietas** con un legendario en una arena aparte
(siempre se abre una antes de los 2 minutos, para que consigas el **vínculo** y
fusiones movimientos), **climas** que potencian unos tipos y debilitan otros,
**altares**, **cofres**, **trampas** y **objetos**; fuera de ella, **misiones**
y **logros** que dan tickets y monedas, y el **gacha**, donde un Pokémon repetido
desbloquea su siguiente evolución. Los tickets que ganas cuentan doble, los shiny
salen un 50 % más a menudo, los enemigos no se curan y los Pokémon más grandes que
manejas se encogen para que esquivar les cueste lo mismo que a los demás.

<p align="center"><img src=".github/capturas/menu.webp" width="70%" alt="El menú principal con el compañero elegido"></p>

### Opciones

- **Instalar como app**: «Añadir a pantalla de inicio» o el botón de instalar
  del navegador.
- **Estilo** (Ajustes > Gráficos): Clásico, en pixel art, o Dex, con menús de
  Rotom-Dex y letra redondeada. Y **píxel nítido**, para que cada píxel del
  dibujo mida lo mismo en tu pantalla.
- **Plegables y tabletas**: también se juega en vertical, y el HUD se aparta del
  pliegue de la pantalla.
- **Pantalla dividida** (Ajustes > Controles): el juego en una mitad y los mandos
  en la otra, como en una consola de dos pantallas; en un plegable, la división
  cae en la bisagra.

## Cooperativo

Hasta 4 jugadores en la misma partida: cread cada uno una cuenta, añadid vuestros
apodos en **Amigos**, cread una **sala** e invitad. Los navegadores se conectan
directamente entre sí (cada uno puede llegar a ver la IP del otro: juega en grupo
sólo con gente que conozcas); si no pueden, el juego va por su servidor, con algo
más de retraso.

El guardado de un invitado vive sólo en su navegador: si borras los datos del
sitio, se pierde. Con cuenta, se guarda en la nube.

## Créditos

- **Sprites:** [PMD SpriteCollab](https://github.com/PMDCollab/SpriteCollab) y
  sus artistas, con licencia
  [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). La lista
  completa de autores está en [CREDITS.md](CREDITS.md).
- **Datos de los Pokémon:** [PokeAPI](https://pokeapi.co/).
- **Fuentes:** Pixelify Sans (estilo Clásico) y M PLUS Rounded 1c (estilo Dex),
  las dos con la [SIL Open Font License 1.1](https://openfontlicense.org/)
  (`assets/fonts/`).
- **Música y sonidos:** generados por el propio juego.

## Marca

Pokémon y todos los nombres y personajes relacionados son marcas y propiedad de
Nintendo, Creatures Inc., GAME FREAK y The Pokémon Company. PokéSwarm es un
proyecto de fans sin ánimo de lucro, no afiliado, patrocinado ni aprobado por
ellos.

## Licencia

PokéSwarm es un proyecto personal de Nico, inspirado en **PokéSurvivor**,
el juego de fans de **JPTER78**, y desarrollado a partir de su código, publicado
con licencia MIT; su aviso de copyright se conserva en [LICENSE](LICENSE). El código es MIT; los
sprites, las fuentes y los datos tienen sus propias licencias. Todo está en
[LICENSE](LICENSE) y [CREDITS.md](CREDITS.md).

## Desarrollo

HTML y JavaScript sin dependencias, sobre Canvas. Se edita `dev.html` (carga los
scripts sueltos), y `index.html` y `js/app.min.js` se generan con
`node tools/build.js --privado`. Cada push pasa `node tools/nico/check.js` en
GitHub Actions y, si va bien, publica en GitHub Pages sólo los ficheros del juego
(`tools/nico/sitio.js`). Las reglas del proyecto están en [CLAUDE.md](CLAUDE.md),
los pendientes en [PLAN.md](PLAN.md) y las pruebas (`npm test`) en
[tools/nico/README.md](tools/nico/README.md).
