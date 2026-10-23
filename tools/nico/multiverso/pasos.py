"""Pasos por código: la animación de andar de un personaje del Multiverso a partir de su rotación (0 generaciones).

    python tools/nico/multiverso/pasos.py <clave> <direcciones>     p. ej.  pasos.py jefe east,north

Escribe fuentes/<clave>/andar-<dirección>.png con el mismo formato que la animación de PixelLab (`montar.py traer`):
4 fotogramas en fila, en celdas de 48x48 con la rotación de 32x32 en (8, 8). Sustituye a `generar.py andar` cuando
no quedan generaciones (la cuenta de PixelLab era una prueba de 40 que no se renueva; 23-10-2026).

Cómo anda, a 32 px (la misma pauta que las animaciones de PixelLab del juego, medida en el paso al sur del Jefe):
  0  apoyo: la rotación tal cual
  1  la pierna izquierda (de quien mira) sube 1 px y el cuerpo baja 1 px
  2  apoyo
  3  la pierna derecha sube 1 px y el cuerpo baja 1 px
De perfil (este, oeste) las piernas no se separan a izquierda y derecha: en 1 y 3 los pies se adelantan y se atrasan
1 px en sentidos opuestos. «Piernas» es la franja de abajo del personaje (PIERNAS de su alto, desde los pies).
"""
import os
import sys

import numpy as np
from PIL import Image

FUENTES = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes')
CELDA, SITIO = 48, (8, 8)
PIERNAS = 0.28   # fracción del alto que son piernas
PERFIL = {'east', 'west'}


def caja(a):
    ys, xs = np.where(a[:, :, 3] > 0)
    return xs.min(), ys.min(), xs.max(), ys.max()


def pegar(dst, src, mascara, dx, dy):
    """Copia los píxeles de `src` marcados en `mascara` sobre `dst`, desplazados (dx, dy)."""
    ys, xs = np.where(mascara & (src[:, :, 3] > 0))
    for y, x in zip(ys, xs):
        yy, xx = y + dy, x + dx
        if 0 <= yy < dst.shape[0] and 0 <= xx < dst.shape[1]:
            dst[yy, xx] = src[y, x]


def fotogramas(rot, perfil):
    x0, y0, x1, y1 = caja(rot)
    cadera = int(round(y1 - (y1 - y0 + 1) * PIERNAS))
    medio = (x0 + x1) / 2
    H, W = rot.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    cuerpo = yy < cadera
    izq = (yy >= cadera) & (xx < medio)
    der = (yy >= cadera) & (xx >= medio)
    pies = yy >= y1 - 2   # de perfil: las tres filas de abajo
    out = []
    for f in range(4):
        c = np.zeros_like(rot)
        if f in (0, 2):
            c[:] = rot
        elif not perfil:
            sube, apoya = (izq, der) if f == 1 else (der, izq)
            pegar(c, rot, apoya, 0, 0)
            pegar(c, rot, sube, 0, -1)
            pegar(c, rot, cuerpo, 0, 1)
        else:
            s = 1 if f == 1 else -1
            pegar(c, rot, (yy >= cadera) & ~pies, 0, 0)
            pegar(c, rot, pies & (xx < medio), s, 0)
            pegar(c, rot, pies & (xx >= medio), -s, 0)
            pegar(c, rot, cuerpo, 0, 1)
        celda = np.zeros((CELDA, CELDA, 4), np.uint8)
        celda[SITIO[1]:SITIO[1] + H, SITIO[0]:SITIO[0] + W] = c
        out.append(celda)
    return np.concatenate(out, axis=1)


def main():
    clave, dirs = sys.argv[1], sys.argv[2].split(',')
    base = os.path.join(FUENTES, clave)
    for d in dirs:
        rot = np.array(Image.open(os.path.join(base, 'rot-%s.png' % d)).convert('RGBA'))
        tira = fotogramas(rot, d in PERFIL)
        Image.fromarray(tira).save(os.path.join(base, 'andar-%s.png' % d), optimize=True)
        print('  andar-%s: 4 fotogramas por código' % d)


if __name__ == '__main__':
    main()
