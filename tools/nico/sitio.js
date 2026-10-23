/* ============ tools/nico/sitio.js — lo que publica GitHub Pages ============
 *   node tools/nico/sitio.js [<carpeta>]      (por defecto, _site en la raíz del repo)
 * Monta en <carpeta> sólo el juego: las páginas, el código, los estilos, los sprites y lo que el juego enlaza (la
 * licencia y los créditos). Las notas de trabajo (CLAUDE.md, PLAN.md),
 * las herramientas y las reglas de Firebase no se publican en la web, aunque el repositorio siga siendo público.
 * Lo usa el workflow .github/workflows/publicar.yml. check.js comprueba que todo lo que cargan las páginas, los
 * estilos y el código está en la lista, y las pruebas E2E pueden jugar contra la carpeta montada (PS_SITIO, en serve.js).
 * Sólo copia ficheros que están en git (como Pages, que publica lo commiteado).
 */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const MARCA = '.sitio-pokeswarm';   // la deja en la carpeta montada: sólo se vacía una carpeta que la tenga

/** Lo publicado: ficheros y carpetas (enteras) de la raíz del repo. */
const SITIO = ['index.html', 'dev.html', '404.html', 'sw.js', 'manifest.webmanifest', 'favicon.ico', 'LICENSE', 'CREDITS.md',
  'contacto', 'js', 'css', 'assets'];

const dentro = f => SITIO.some(s => f === s || f.startsWith(s + '/'));

/** Los ficheros del sitio, relativos a la raíz y con «/»: los de git que caen en SITIO. */
function ficheros(root = ROOT) {
  const git = execFileSync('git', ['ls-files', '-z', '--', ...SITIO], { cwd: root, encoding: 'utf8', maxBuffer: 1e8 });
  return git.split('\0').filter(Boolean).filter(dentro).sort();
}

/** Monta el sitio en `destino` (la vacía antes si ya es un sitio montado) y devuelve { n, bytes }. */
function construir(destino, root = ROOT) {
  destino = path.resolve(root, destino);
  if (!path.relative(destino, root).startsWith('..'))   // la raíz misma o una carpeta que la contiene
    throw new Error('sitio.js: el destino no puede ser la raíz del repo ni una carpeta que la contenga: ' + destino);
  if (fs.existsSync(destino)) {
    const hay = fs.readdirSync(destino);
    if (hay.length && !hay.includes(MARCA)) throw new Error('sitio.js: ' + destino + ' existe y no es un sitio montado (falta ' + MARCA + '): no se vacía');
    fs.rmSync(destino, { recursive: true, force: true });
  }
  fs.mkdirSync(destino, { recursive: true });
  let n = 0, bytes = 0;
  for (const f of ficheros(root)) {
    const de = path.join(root, f), a = path.join(destino, f);
    fs.mkdirSync(path.dirname(a), { recursive: true });
    fs.copyFileSync(de, a);
    n++; bytes += fs.statSync(a).size;
  }
  fs.writeFileSync(path.join(destino, MARCA), 'Sitio montado por tools/nico/sitio.js: se puede borrar.\n');
  return { n, bytes };
}

module.exports = { SITIO, ficheros, construir, dentro };

if (require.main === module) {
  const destino = process.argv[2] || '_site';
  const { n, bytes } = construir(destino);
  console.log(`Sitio montado en ${path.resolve(ROOT, destino)}: ${n} ficheros, ${(bytes / 1048576).toFixed(1)} MB`);
}
