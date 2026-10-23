"""Redibuja el «2» de assets/fonts/PixelifySans-ps2.ttf (antes PixelifySans.ttf; otro nombre para que el
service worker, que guarda assets/fonts/ para siempre, no siga sirviendo el viejo) para que no se confunda con el «8» (petición de Nico, 22-10-2026).

El original es un 8 con dos muescas: a tamaño de HUD, «28.282» se leía «28.888». El nuevo es un 2 clásico de píxeles:
barra arriba con el gancho a la izquierda, bajada a la derecha, diagonal en tres escalones y base plana. La fuente es
variable (wght 400-700): cada rectángulo tiene su versión normal y su versión 700, y la diferencia va en gvar.
Pixelify Sans es OFL sin nombre reservado, así que se puede modificar (ver assets/fonts/OFL.txt y CREDITS.md).

    python tools/nico/fuente-dos.py          (idempotente: siempre parte de los mismos rectángulos)
"""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables.TupleVariation import TupleVariation

RUTA = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'fonts', 'PixelifySans-ps2.ttf')

# (x1, y1, x2, y2) con wght 400 y con wght 700, con las medidas de los demás dígitos de la fuente.
RECT_400 = [
    (151, 540, 433, 631),   # barra de arriba
    (60, 440, 161, 540),    # gancho de la izquierda
    (423, 350, 525, 540),   # bajada de la derecha
    (333, 260, 433, 350),   # diagonal: escalón 1 (en la rejilla de la fuente: columnas y filas de ~91)
    (242, 170, 333, 260),   # escalón 2
    (151, 78, 242, 170),    # escalón 3
    (60, -12, 525, 88),     # base
]
RECT_700 = [
    (149, 552, 453, 638),
    (61, 416, 188, 552),
    (414, 331, 542, 552),
    (326, 262, 453, 331),
    (237, 194, 364, 262),
    (149, 125, 276, 194),
    (61, -11, 542, 125),
]


def puntos(rects):
    out = []
    for x1, y1, x2, y2 in rects:   # en el sentido de las agujas del reloj, como los demás glifos
        out += [(x1, y1), (x1, y2), (x2, y2), (x2, y1)]
    return out


def main():
    f = TTFont(RUTA)
    pen = TTGlyphPen(None)
    for x1, y1, x2, y2 in RECT_400:
        pen.moveTo((x1, y1)); pen.lineTo((x1, y2)); pen.lineTo((x2, y2)); pen.lineTo((x2, y1)); pen.closePath()
    g = pen.glyph()
    g.flags[0] |= 0x40   # OVERLAP_SIMPLE: los rectángulos se solapan
    f['glyf']['two'] = g
    a, b = puntos(RECT_400), puntos(RECT_700)
    deltas = [(q[0] - p[0], q[1] - p[1]) for p, q in zip(a, b)] + [None, (17, 0), None, None]   # fantasma: ancho 586 -> 603
    f['gvar'].variations['two'] = [TupleVariation({'wght': (0.0, 1.0, 1.0)}, deltas)]
    g.recalcBounds(f['glyf'])
    f['hmtx']['two'] = (f['hmtx']['two'][0], g.xMin)
    f.save(RUTA)
    print('«2» redibujado en', os.path.normpath(RUTA))


if __name__ == '__main__':
    main()
