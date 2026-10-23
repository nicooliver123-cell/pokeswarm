"""Hojas de los personajes del Multiverso, a partir de lo que dibuja PixelLab.

    python tools/nico/multiverso/montar.py                      monta las hojas de todos
    python tools/nico/multiverso/montar.py traer <clave> <dir>  copia a fuentes/ lo bajado de PixelLab

PixelLab (https://www.pixellab.ai, API v2) dibuja cada personaje mirando al sur y lo
rota a 8 direcciones (create-character-v3), y anima su forma de andar (animación `v3`,
que parte de la rotación y conserva su tamaño; las plantillas por esqueleto lo redibujaban
más pequeño) en 5 direcciones: sur, sureste, este, noreste y norte. Lo que
devuelve (lo pide tools/nico/multiverso/generar.py) se guarda, normalizado, en
tools/nico/multiverso/fuentes/<clave>/ (montar.py traer):

    rot-<dirección>.png    las 8 rotaciones (32x32)
    andar-<dirección>.png  los 4 fotogramas de andar, en fila (si los hay), en celdas de 44x44
    <Anim>-<dirección>.png una animación dibujada aparte (PJ[clave]['propias']), en fila
    s/                     si existe, el variocolor dibujado aparte (los mismos ficheros)

Pac-Man y su fantasma no salen de PixelLab: los dibuja por código tools/nico/multiverso/dibujar.py
en esa misma carpeta, con sus animaciones propias (comer, el faldón, desinflarse, quedarse en ojos).
Si sólo hay pasos al sur, al este y al norte (3 generaciones en vez de 5), las diagonales usan los
del lado: quieto se ve en diagonal y andando, de perfil.

Con eso, este script escribe assets/pokemon/<dex>/{Idle,Walk,Attack,Shoot,Charge,Hurt,Faint}.png
y su variocolor en s/, con el formato de SpriteCollab que lee js/core/sprites.js
(columnas = fotogramas; filas = las 8 direcciones: sur, sureste, este, noreste, norte,
noroeste, oeste, suroeste). Oeste, noroeste y suroeste salen en espejo de este, noreste
y sureste, para que quieto y andando sean el mismo dibujo. Las demás animaciones salen
por código de las rotaciones: respirar (Idle), un impulso hacia delante (Attack y
Shoot; el Slayer, retroceso al disparar), agacharse (Charge), retroceder (Hurt) y
caer de lado (Faint). Según cómo se mueva (PJ[clave]['mov']): los que andan, con sus
pasos; los que flotan se mecen arriba y abajo y su ancla queda por debajo del dibujo para
que la sombra quede en el suelo; Kirby se contonea de lado a lado; los de túnica o capa
hasta el suelo (Drácula) se deslizan subiendo y bajando un píxel.

La geometría (G.SPRITE_META) la escribe en js/data/multiverso.js, entre las marcas
`// <meta montar.py>` y `// </meta montar.py>`. Determinista: volver a ejecutarlo da
los mismos ficheros. Requiere Pillow.

OJO: sw.js guarda assets/pokemon/ para siempre (caché ps-art-v1). Si cambian unas
hojas ya publicadas, hace falta otra carpeta o subir ART en sw.js.
"""
import colorsys
import json
import os
import re
import shutil
import sys

from PIL import Image, ImageOps

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
FUENTES = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes')
MULTIVERSO_JS = os.path.join(RAIZ, 'js', 'data', 'multiverso.js')

DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
ESPEJO = {'west': 'east', 'north-west': 'north-east', 'south-west': 'south-east'}
# Hacia dónde mira cada fila, en píxeles de pantalla (y hacia abajo).
VECTOR = {'south': (0, 1), 'south-east': (1, 1), 'east': (1, 0), 'north-east': (1, -1),
          'north': (0, -1), 'north-west': (-1, -1), 'west': (-1, 0), 'south-west': (-1, 1)}
CELDA = 32             # lo que dibuja PixelLab
ARRIBA, ABAJO = 2, 3   # margen del fotograma por encima y por debajo de la celda
LADO = 4               # margen a los lados en lo que se desplaza (ataques, golpe, caída)


def hsv(rgb):
    r, g, b = (c / 255 for c in rgb)
    return colorsys.rgb_to_hsv(r, g, b)


def rgb(h, s, v):
    return tuple(max(0, min(255, round(c * 255))) for c in colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v))))


def vario_agumon(c):
    """BlackAgumon: la piel naranja y amarilla, gris ceniza; ojos verdes, garras y boca, igual."""
    h, s, v = hsv(c)
    if s > 0.28 and 15 / 360 <= h <= 62 / 360:
        return rgb(225 / 360, 0.12, 0.10 + 0.42 * v)
    return c


def vario_slayer(c):
    """La armadura verde, carmesí; el visor, el arma y el gris de las juntas, igual."""
    h, s, v = hsv(c)
    if s > 0.14 and 62 / 360 <= h <= 170 / 360:
        return rgb(352 / 360, min(1, s * 1.15 + 0.1), v * 0.95)
    return c


def vario_caco(c):
    """El cuerpo rojo, morado; el ojo verde, los dientes y la boca azul, igual."""
    h, s, v = hsv(c)
    if s > 0.3 and (h <= 22 / 360 or h >= 330 / 360):
        return rgb(278 / 360, s * 0.85, v)
    return c


def vario_kirby(c):
    """Keeby, el Kirby amarillo de Kirby's Dream Course: el cuerpo rosa, amarillo; los pies rojos, naranja; el
    rubor, naranja. Los ojos y el contorno azul marino, igual (cortes medidos en su paleta de PixelLab)."""
    h, s, v = hsv(c)
    if not (h >= 300 / 360 or h <= 12 / 360) or s < 0.04:
        return c
    if s > 0.88 and v < 0.62:                                     # sombra más oscura (junto a pies y brazos)
        return rgb(28 / 360, 0.85, 0.45)
    if s > 0.88:                                                  # pies
        return rgb(24 / 360, 0.86, min(1, v * 1.15))
    if (h >= 348 / 360 or h <= 12 / 360) and s > 0.45 and v > 0.9:   # rubor
        return rgb(28 / 360, 0.72, 1.0)
    if s > 0.45:                                                  # sombra del cuerpo
        return rgb(42 / 360, 0.80, min(1, v * 1.05))
    return rgb(48 / 360, min(1, 0.25 + s * 1.3), v)               # cuerpo y brillos


def vario_link(c):
    """Túnica Goron de Ocarina of Time: lo verde (túnica y gorro), rojo; escudo, pelo, piel y espada, igual."""
    h, s, v = hsv(c)
    if s > 0.3 and 75 / 360 <= h <= 165 / 360:
        return rgb(356 / 360, min(1, s * 1.05), min(1, v * 1.08))
    return c


def vario_samus(c):
    """Traje Phazon: lo naranja y amarillo, negro brillante; lo rojo, gris plata oscuro; el visor verde, naranja vivo."""
    h, s, v = hsv(c)
    if s > 0.3 and 80 / 360 <= h <= 170 / 360:              # visor
        return rgb(28 / 360, 0.9, max(v, 0.85))
    if s > 0.35 and 12 / 360 < h <= 62 / 360:               # hombreras, brazos, piernas y cañón
        return rgb(230 / 360, 0.18, 0.06 + 0.30 * v)
    if s > 0.35 and (h <= 12 / 360 or h >= 320 / 360):      # casco (granate, 330-340), pecho y botas
        return rgb(220 / 360, 0.08, 0.22 + 0.40 * v)
    return c


def vario_dracula(c):
    """El Drácula del primer Castlevania (NES, 1986), con la capa roja: la capa negra azulada, carmesí; el forro y
    la casaca carmesí, casi negros (la capa del revés). La cara y el pelo, igual: PixelLab los pinta con el mismo
    blanco azulado y no se pueden separar (la ficha pedía el pelo gris ceniza y la piel gris verdoso). El oro y el
    contorno, igual. Cortes medidos en su paleta: la capa, tono 200-260 con poco brillo; el forro, 320-10 saturado."""
    h, s, v = hsv(c)
    if v < 0.06:                                              # contorno
        return c
    if 200 / 360 <= h <= 260 / 360 and v < 0.32:              # capa
        return rgb(350 / 360, 0.78, min(1, 0.22 + v * 1.5))
    if (h >= 320 / 360 or h <= 10 / 360) and s > 0.6:         # forro y casaca
        return rgb(235 / 360, 0.45, 0.07 + v * 0.3)
    return c


def vario_cthulhu(c):
    """El «Auténtico ojo de Cthulhu» del Señor de la Luna: venas y nervios rojos, verde menta; el iris azul, cian;
    el centro oliva, gris oscuro. La esclerótica y el contorno, igual."""
    h, s, v = hsv(c)
    if s > 0.3 and (h <= 22 / 360 or h >= 330 / 360):
        return rgb(158 / 360, s * 0.85, v)
    if s > 0.3 and 220 / 360 <= h <= 260 / 360:
        return rgb(202 / 360, s, max(v, 0.6))
    if 55 / 360 <= h <= 80 / 360 and v < 0.4:
        return (0x38, 0x35, 0x34)
    return c



def vario_jefe(c):
    """El Jefe Maestro con la armadura azul del multijugador de Halo (la de «Azul» frente a «Rojo»): los verdes oliva de
    la armadura, azul acero. El visor dorado, el traje gris y el rifle, igual."""
    h, s, v = hsv(c)
    if s > 0.25 and 60 / 360 <= h <= 110 / 360:
        return rgb(214 / 360, min(1, s * 1.05), v)
    return c


def vario_kratos(c):
    """Kratos de piel olivácea (God of War: Ascension), la que tenía antes de las cenizas: la piel blanca y gris, morena.
    El tatuaje, el faldón, las espadas y el contorno, igual."""
    h, s, v = hsv(c)
    if s < 0.16 and v > 0.45:
        return rgb(28 / 360, 0.42, v * 0.72)
    return c

# mov: 'anda' (sus pasos de PixelLab o de pasos.py), 'flota' (se mece VUELO px sobre el suelo), 'contonea' (de lado a lado),
# 'desliza' (sube y baja 1 px) o 'rueda' (sus pasos dibujados). disparo: 1 se impulsa hacia delante al disparar,
# -1 retrocede. propias: {Anim: duraciones} de las animaciones dibujadas aparte (<Anim>-<dirección>.png).
PJ = {
    'agumon': {'dex': 10001, 'mov': 'anda', 'sombra': 1, 'disparo': 1, 'vario': vario_agumon},
    'slayer': {'dex': 10002, 'mov': 'anda', 'sombra': 1, 'disparo': -1, 'vario': vario_slayer},
    'caco':   {'dex': 10003, 'mov': 'flota', 'sombra': 1, 'disparo': 1, 'vario': vario_caco},
    # Segundo lote (15-10-2026). Pac-Man y Blinky, dibujados por dibujar.py (con su variocolor en s/).
    'kirby':   {'dex': 10004, 'mov': 'contonea', 'sombra': 1, 'disparo': 1, 'vario': vario_kirby,
                'retoque': {'mechon': 10, 'escala': 0.8}},   # sin el mechón de PixelLab y de su tamaño (es diminuto)
    'link':    {'dex': 10005, 'mov': 'anda', 'sombra': 1, 'disparo': 1, 'vario': vario_link},
    'samus':   {'dex': 10006, 'mov': 'anda', 'sombra': 1, 'disparo': -1, 'vario': vario_samus},
    'pacman':  {'dex': 10007, 'mov': 'rueda', 'sombra': 1, 'disparo': 1, 'vario': None,
                'propias': {'Idle': [30, 14], 'Faint': [8, 8, 8, 12]}},
    'blinky':  {'dex': 10008, 'mov': 'flota', 'sombra': 1, 'disparo': 1, 'vario': None,
                'propias': {'Faint': [6, 6, 10, 14]}},
    'dracula': {'dex': 10009, 'mov': 'desliza', 'sombra': 1, 'disparo': 1, 'vario': vario_dracula},
    'cthulhu': {'dex': 10010, 'mov': 'flota', 'sombra': 1, 'disparo': 1, 'vario': vario_cthulhu,
                'retoque': {'esfera': True}},   # sin los nervios colgando, que PixelLab dibuja como patas
    # Tercer lote (23-10-2026). Sin generaciones de PixelLab para animar: los pasos, de pasos.py (por código).
    'jefe':    {'dex': 10011, 'mov': 'anda', 'sombra': 1, 'disparo': -1, 'vario': vario_jefe},
    # Kratos, sin PixelLab: imagen de FLUX (Workers AI) -> 3D con TRELLIS.2 -> rotar3d.py -> pixelar.py; pasos de pasos.py.
    'kratos':  {'dex': 10012, 'mov': 'anda', 'sombra': 1, 'disparo': 1, 'vario': vario_kratos},
}
VUELO = 7   # píxeles de arte entre el suelo y el que flota


def nitida(img):
    """Sin semitransparencias: el alfa, 0 o 255 (como las hojas de SpriteCollab)."""
    img = img.convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
    return img


def fondo(img):
    """Fila más baja con algo pintado (los pies)."""
    return img.getbbox()[3] - 1


def quitar_mechon(img, ancho_min=10):
    """Quita lo que sobresale encima de la cabeza (filas de menos de `ancho_min` px) y cierra el contorno. Para
    Kirby: PixelLab le dibuja un mechón en punta, como el rizo de Jigglypuff, y Kirby no lo tiene."""
    img = img.copy()
    px = img.load()
    W, H = img.size
    oscuro = lambda c: c[3] and sum(c[:3]) < 260
    def ancho(y):
        xs = [x for x in range(W) if px[x, y][3]]
        return (max(xs) - min(xs) + 1) if xs else 0
    k = next(y for y in range(H) if ancho(y) >= ancho_min)
    linea = next(px[x, y] for y in range(H) for x in range(W) if oscuro(px[x, y]))
    for y in range(k):
        for x in range(W):
            px[x, y] = (0, 0, 0, 0)
    for y in range(k, min(H, k + 3)):                  # las arrugas del mechón dentro de la cabeza
        for x in range(1, W - 1):
            if oscuro(px[x, y]) and px[x - 1, y][3] and not oscuro(px[x - 1, y]) and px[x + 1, y][3] and not oscuro(px[x + 1, y]):
                px[x, y] = px[x - 1, y]
    for x in range(W):
        if px[x, k][3] and not oscuro(px[x, k]):
            px[x, k - 1] = linea
    return img


def reducir(img, f):
    """Reduce el dibujo (vecino más cercano) con los pies en la misma fila y le rehace el contorno de 1 px."""
    caja = img.getbbox()
    cuerpo = img.crop(caja)
    W, H = cuerpo.size
    nw, nh = max(3, round(W * f)), max(3, round(H * f))
    px = cuerpo.load()
    oscuro = lambda c: c[3] and sum(c[:3]) < 260
    linea = next(px[x, y] for y in range(H) for x in range(W) if oscuro(px[x, y]))
    sin = cuerpo.copy()
    ps = sin.load()
    for y in range(H):
        for x in range(W):
            if oscuro(px[x, y]) and any(not (0 <= x + dx < W and 0 <= y + dy < H) or px[x + dx, y + dy][3] == 0
                                        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                ps[x, y] = (0, 0, 0, 0)
    out = Image.new('RGBA', (nw, nh), (0, 0, 0, 0))
    out.alpha_composite(sin.resize((nw - 2, nh - 2), Image.NEAREST), (1, 1))
    po = out.load()
    for x, y in [(x, y) for y in range(nh) for x in range(nw) if po[x, y][3] == 0 and any(
            0 <= x + dx < nw and 0 <= y + dy < nh and po[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]:
        po[x, y] = linea
    celda = Image.new('RGBA', img.size, (0, 0, 0, 0))
    celda.alpha_composite(out, ((caja[0] + caja[2]) // 2 - nw // 2, caja[3] - nh))
    return celda


def recortar_esfera(img):
    """Deja sólo la esfera (su centro y su radio, medidos en las 14 filas de arriba del dibujo) y le cierra el
    contorno. Para el Ojo de Cthulhu: PixelLab le cuelga los nervios como patas, y en Terraria flota (los nervios
    se agitan detrás; en 32 px se leían como un bicho que anda)."""
    img = img.convert('RGBA')
    px = img.load()
    W, H = img.size
    top = img.getbbox()[1]
    filas = [y for y in range(top, top + 14) if any(px[x, y][3] for x in range(W))]
    izq = min(min(x for x in range(W) if px[x, y][3]) for y in filas)
    der = max(max(x for x in range(W) if px[x, y][3]) for y in filas)
    cx, r = (izq + der + 1) / 2, (der + 1 - izq) / 2
    cy = top + r
    oscuro = lambda c: c[3] and sum(c[:3]) < 160
    linea = next(px[x, y] for y in range(H) for x in range(W) if oscuro(px[x, y]))
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    po = out.load()
    for y in range(H):
        for x in range(W):
            if px[x, y][3] and ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2) ** 0.5 <= r - 0.6:
                po[x, y] = px[x, y]
    borde = [(x, y) for y in range(H) for x in range(W) if po[x, y][3] == 0 and any(
        0 <= x + dx < W and 0 <= y + dy < H and po[x + dx, y + dy][3] and not oscuro(po[x + dx, y + dy])
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for p in borde:
        po[p] = linea
    return out


def respirar(img):
    """La mitad de arriba baja un píxel (el pecho se hunde al soltar el aire)."""
    caja = img.getbbox()
    corte = caja[1] + (caja[3] - caja[1]) * 5 // 11
    out = img.copy()
    out.paste((0, 0, 0, 0), (0, 0, img.width, corte + 1))
    out.alpha_composite(img.crop((0, 0, img.width, corte)), (0, 1))
    return out


def tumbar(img, d):
    """De lado en el suelo: girado 90 grados hacia donde mira (o hacia la derecha si mira al frente)."""
    caja = img.getbbox()
    cuerpo = img.crop(caja)
    dx = VECTOR[d][0]
    return cuerpo.transpose(Image.Transpose.ROTATE_270 if dx >= 0 else Image.Transpose.ROTATE_90)


class Marco:
    """El fotograma de una animación: la celda de 32 con `lado` píxeles a cada lado (más si sus dibujos son
    más grandes). El ancla (ax, ay) cae 1,5 px por encima de la fila de los pies, como en SpriteCollab (los pies
    de Charmander acaban 2-3 px por debajo de la suya), así que la sombra queda bajo los pies; en los que flotan,
    VUELO píxeles más abajo."""
    def __init__(self, m, lado=0, celda=CELDA):
        extra = max(0, (celda - CELDA + 1) // 2)
        self.ox, self.oy = lado + extra, ARRIBA + extra
        self.w = CELDA + 2 * self.ox
        self.suelo = self.oy + m.pies + (VUELO if m.flota else 0)
        self.h = self.suelo + ABAJO + 1
        self.ax, self.ay = self.ox + CELDA / 2 - 0.5, self.suelo - 1.5


class Montaje:
    def __init__(self, clave, sub='', pies=None):
        self.clave = clave
        self.cfg = PJ[clave]
        self.flota = self.cfg['mov'] == 'flota'
        self.carpeta = carpeta = os.path.join(FUENTES, clave, sub)
        self.rot = {}
        for d in DIRS:
            src = ESPEJO.get(d)
            self.rot[d] = ImageOps.mirror(self._abrir(carpeta, 'rot-' + src)) if src else self._abrir(carpeta, 'rot-' + d)
        self.andar = {}
        for d in DIRS:
            src = ESPEJO.get(d) or d
            p = os.path.join(carpeta, 'andar-%s.png' % src)
            if os.path.exists(p):
                tira = nitida(Image.open(p))
                n = tira.width // tira.height
                frames = [tira.crop((i * tira.height, 0, (i + 1) * tira.height, tira.height)) for i in range(n)]
                self.andar[d] = [ImageOps.mirror(f) for f in frames] if ESPEJO.get(d) else frames
        # Retoques de lo que dibuja PixelLab (PJ[clave]['retoque']): sólo la esfera, quitar el mechón, reducir.
        ret = self.cfg.get('retoque', {})
        if ret:
            for d in DIRS:
                if ret.get('esfera'):
                    self.rot[d] = recortar_esfera(self.rot[d])
                if ret.get('mechon'):
                    self.rot[d] = quitar_mechon(self.rot[d], ret['mechon'])
                if ret.get('escala'):
                    self.rot[d] = reducir(self.rot[d], ret['escala'])
        # Pasos sólo al sur, al este y al norte: en diagonal, los del lado (el oeste ya es el espejo del este).
        if self.andar:
            for d in DIRS:
                lado = 'east' if 'east' in d else 'west' if 'west' in d else None
                if d not in self.andar and lado in self.andar:
                    self.andar[d] = self.andar[lado]
            assert all(d in self.andar for d in DIRS), (clave, sorted(self.andar))
        # Los pies: la fila más baja de las rotaciones, en la celda de 32 (el variocolor dibujado, los del normal).
        self.pies = pies if pies is not None else max(fondo(self.rot[d]) for d in DIRS)

    def propia(self, anim):
        """Una animación dibujada aparte: <Anim>-<dirección>.png, en fila de celdas cuadradas (oeste, noroeste y
        suroeste, en espejo si no están)."""
        filas = []
        for d in DIRS:
            p = os.path.join(self.carpeta, '%s-%s.png' % (anim, d))
            espejo = not os.path.exists(p) and ESPEJO.get(d)
            if espejo:
                p = os.path.join(self.carpeta, '%s-%s.png' % (anim, ESPEJO[d]))
            tira = nitida(Image.open(p))
            n = tira.width // tira.height
            fs = [tira.crop((i * tira.height, 0, (i + 1) * tira.height, tira.height)) for i in range(n)]
            filas.append([ImageOps.mirror(f) for f in fs] if espejo else fs)
        return filas

    @staticmethod
    def _abrir(carpeta, nombre):
        return nitida(Image.open(os.path.join(carpeta, nombre + '.png')))

    def poner(self, mc, img, dx=0, dy=0):
        """Un fotograma: la celda de PixelLab (o una más grande, con el mismo centro) en su sitio del marco."""
        f = Image.new('RGBA', (mc.w, mc.h), (0, 0, 0, 0))
        f.alpha_composite(img, (mc.ox + (CELDA - img.width) // 2 + dx, mc.oy + (CELDA - img.height) // 2 + dy))
        return f

    def tumbado(self, mc, d):
        t = tumbar(self.rot[d], d)
        f = Image.new('RGBA', (mc.w, mc.h), (0, 0, 0, 0))
        f.alpha_composite(t, ((mc.w - t.width) // 2, mc.suelo + 1 - t.height))
        return f

    def anims(self):
        """{nombre: (marco, [fila de fotogramas por dirección], duraciones en 1/60 s)}"""
        fl, R = self.flota, self.rot
        A = {}
        vec = lambda d, k: (round(VECTOR[d][0] * k), round(VECTOR[d][1] * k * 0.6))
        meca = [0, -1, -2, -1]
        quieto = Marco(self)
        mov = self.cfg['mov']
        if fl and self.andar:
            # Flota con sus propios fotogramas (el faldón del fantasma): los mismos, meciéndose.
            mw = Marco(self, 0, max(f.width for fs in self.andar.values() for f in fs))
            fila = lambda d: [self.poner(mw, self.andar[d][i % len(self.andar[d])], 0, o) for i, o in enumerate(meca)]
            A['Idle'] = (mw, [fila(d) for d in DIRS], [10, 10, 10, 10])
            A['Walk'] = (mw, [fila(d) for d in DIRS], [6, 6, 6, 6])
        elif fl:
            A['Idle'] = (quieto, [[self.poner(quieto, R[d], 0, o) for o in meca] for d in DIRS], [10, 10, 10, 10])
            A['Walk'] = (quieto, [[self.poner(quieto, R[d], 0, o) for o in meca] for d in DIRS], [6, 6, 6, 6])
        elif mov == 'contonea':
            # De lado a lado, subiendo un poco en cada paso (Kirby no tiene piernas que mover).
            mc = Marco(self, 2)
            A['Idle'] = (quieto, [[self.poner(quieto, R[d]), self.poner(quieto, respirar(R[d]))] for d in DIRS], [36, 20])
            A['Walk'] = (mc, [[self.poner(mc, R[d], dx, dy) for dx, dy in [(-1, 0), (0, -1), (1, 0), (0, -1)]] for d in DIRS], [6, 6, 6, 6])
        else:
            A['Idle'] = (quieto, [[self.poner(quieto, R[d]), self.poner(quieto, respirar(R[d]))] for d in DIRS], [36, 20])
            if self.andar:
                n = len(next(iter(self.andar.values())))
                mw = Marco(self, 0, max(f.width for fs in self.andar.values() for f in fs))
                A['Walk'] = (mw, [[self.poner(mw, f) for f in self.andar[d]] for d in DIRS], ([6, 8] * n)[:n])
            else:
                A['Walk'] = (quieto, [[self.poner(quieto, R[d], 0, o) for o in [0, -1, 0, -1]] for d in DIRS], [6, 8, 6, 8])
        mv = Marco(self, LADO)
        empuje = [0, 1, 3, 3, 2, 1, 0]
        A['Attack'] = (mv, [[self.poner(mv, R[d], *vec(d, k)) for k in empuje] for d in DIRS], [2, 2, 3, 3, 2, 2, 2])
        sg = self.cfg['disparo']
        A['Shoot'] = (mv, [[self.poner(mv, R[d], *vec(d, sg * k)) for k in [0, 1, 2, 1, 0]] for d in DIRS], [2, 2, 3, 2, 2])
        A['Charge'] = (quieto, [[self.poner(quieto, respirar(R[d]), 0, -1 if fl else 0) for _ in range(2)] for d in DIRS], [4, 4])
        A['Hurt'] = (mv, [[self.poner(mv, R[d], *vec(d, -2)), self.poner(mv, R[d], *vec(d, -1))] for d in DIRS], [2, 8])
        if fl:
            A['Faint'] = (mv, [[self.poner(mv, R[d]), self.poner(mv, R[d], 0, VUELO // 2), self.poner(mv, R[d], 0, VUELO), self.tumbado(mv, d)]
                               for d in DIRS], [8, 6, 6, 10])
        else:
            A['Faint'] = (mv, [[self.poner(mv, R[d]), self.poner(mv, respirar(R[d]), 0, 1), self.tumbado(mv, d), self.tumbado(mv, d)] for d in DIRS],
                          [8, 12, 4, 10])
        # Las dibujadas aparte sustituyen a las de código (con su marco: con margen las que se desplazan).
        for anim, dur in self.cfg.get('propias', {}).items():
            filas = self.propia(anim)
            assert all(len(f) == len(dur) for f in filas), (self.clave, anim, [len(f) for f in filas], dur)
            mp = Marco(self, LADO if anim in ('Attack', 'Shoot', 'Hurt', 'Faint') else 0, max(f.width for fs in filas for f in fs))
            A[anim] = (mp, [[self.poner(mp, f) for f in fila] for fila in filas], list(dur))
        return A

    def escribir(self):
        dex = self.cfg['dex']
        dst = os.path.join(RAIZ, 'assets', 'pokemon', str(dex))
        os.makedirs(os.path.join(dst, 's'), exist_ok=True)
        meta = {'s': self.cfg['sombra'], 'a': {}, 'sh': 1}
        if self.flota:
            meta['hv'] = 1
        # Variocolor: dibujado aparte (fuentes/<clave>/s/, con la misma geometría) o recoloreado con su función.
        dibujado = os.path.isdir(os.path.join(FUENTES, self.clave, 's'))
        otras = Montaje(self.clave, 's', self.pies).anims() if dibujado else None
        for nombre, (mc, filas, dur) in self.anims().items():
            n = len(dur)
            hoja = Image.new('RGBA', (mc.w * n, mc.h * 8), (0, 0, 0, 0))
            for r, fila in enumerate(filas):
                assert len(fila) == n, (self.clave, nombre, r)
                for i, f in enumerate(fila):
                    hoja.alpha_composite(f, (i * mc.w, r * mc.h))
            hoja.save(os.path.join(dst, nombre + '.png'), optimize=True)
            if dibujado:
                mc2, filas2, dur2 = otras[nombre]
                assert (mc2.w, mc2.h, dur2) == (mc.w, mc.h, dur), (self.clave, nombre, 'el variocolor dibujado no cuadra')
                vario = Image.new('RGBA', hoja.size, (0, 0, 0, 0))
                for r, fila in enumerate(filas2):
                    for i, f in enumerate(fila):
                        vario.alpha_composite(f, (i * mc.w, r * mc.h))
            else:
                vario = hoja.copy()
                px = vario.load()
                cache = {}
                for y in range(vario.height):
                    for x in range(vario.width):
                        c = px[x, y]
                        if c[3]:
                            k = c[:3]
                            if k not in cache:
                                cache[k] = self.cfg['vario'](k)
                            px[x, y] = cache[k] + (c[3],)
            vario.save(os.path.join(dst, 's', nombre + '.png'), optimize=True)
            meta['a'][nombre] = {'w': mc.w, 'h': mc.h, 'n': n, 'r': 8, 'd': dur, 'ax': mc.ax, 'ay': mc.ay}
        print('%s (%d): %s' % (self.clave, dex, ', '.join('%s %d (%dx%d)' % (k, v['n'], v['w'], v['h']) for k, v in meta['a'].items())))
        return dex, meta


def escribir_meta(metas):
    s = open(MULTIVERSO_JS, encoding='utf-8').read()
    a, b = '  // <meta montar.py>\n', '  // </meta montar.py>\n'
    if a not in s or b not in s:
        sys.exit('No encuentro las marcas de la geometría en js/data/multiverso.js')
    cuerpo = '  const META = {\n' + ''.join('    %d: %s,\n' % (dex, json.dumps(m, separators=(',', ':'))) for dex, m in metas) + '  };\n'
    s = s[:s.index(a) + len(a)] + cuerpo + s[s.index(b):]
    open(MULTIVERSO_JS, 'w', encoding='utf-8', newline='\n').write(s)


def traer(clave, origen):
    """Copia a fuentes/<clave>/ lo bajado de PixelLab: las 8 rotaciones (<dirección>.png) y, si las hay, las
    tiras de andar (anim-custom-<acción>-<dirección>.png: los fotogramas de la animación `v3`, en fila, en
    celdas cuadradas con el personaje en el mismo sitio que en su rotación)."""
    dst = os.path.join(FUENTES, clave)
    os.makedirs(dst, exist_ok=True)
    for d in DIRS:
        p = os.path.join(origen, d + '.png')
        if os.path.exists(p):
            nitida(Image.open(p)).save(os.path.join(dst, 'rot-%s.png' % d), optimize=True)
    for f in sorted(os.listdir(origen)):
        m = re.match(r'anim-custom-.*?-(%s)\.png$' % '|'.join(re.escape(d) for d in sorted(DIRS, key=len, reverse=True)), f)
        if not m:
            continue
        tira = nitida(Image.open(os.path.join(origen, f)))
        tira.save(os.path.join(dst, 'andar-%s.png' % m.group(1)), optimize=True)
        print('  andar-%s: %d fotogramas de %dx%d' % (m.group(1), tira.width // tira.height, tira.height, tira.height))


def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'traer':
        traer(sys.argv[2], sys.argv[3])
        return
    metas = [Montaje(c).escribir() for c in PJ if os.path.isdir(os.path.join(FUENTES, c))]
    escribir_meta(metas)


if __name__ == '__main__':
    main()
