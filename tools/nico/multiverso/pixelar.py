"""Baja los renders de rotar3d.py a las rotaciones de 32x32 con el aspecto de las de PixelLab (0 generaciones).

    python tools/nico/multiverso/pixelar.py <carpeta_renders> <clave> [--alto 30] [--colores 20]

Escribe tools/nico/multiverso/fuentes/<clave>/rot-<dirección>.png, como `montar.py traer`:
  1. recorta el personaje con el MISMO marco en las 8 (el de la más alta y la más ancha), para que no cambie de tamaño
     al girar, y le sube la saturación y el contraste (PixelLab pinta con colores planos y vivos);
  2. reduce los colores a una paleta común de `colores` para las 8 (k-medias), a resolución alta;
  3. baja a `alto` píxeles (el Jefe Maestro de PixelLab mide 30 de 32) quedándose en cada píxel con el color que más
     se repite en su bloque, sin promediar: así no se emborrona y lo fino (grietas, ruido de la textura) desaparece;
  4. sin píxeles sueltos (ruido de la textura) y contorno de 1 px oscuro por fuera, como el de PixelLab, y los pies en la fila 31.
"""
import os
import sys

import numpy as np
from PIL import Image

DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
FUENTES = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes')
LADO = 32
CONTORNO = (26, 18, 32, 255)
SATURACION = 1.35
CONTRASTE = 1.0
BRILLO = 0.86       # baja los blancos para que se vea la sombra (la piel de Kratos es casi blanca en la textura)


def opcion(nombre, defecto):
    return type(defecto)(sys.argv[sys.argv.index(nombre) + 1]) if nombre in sys.argv else defecto


def kmedias(px, k, vueltas=20, semilla=1):
    rnd = np.random.default_rng(semilla)
    c = px[rnd.choice(len(px), k, replace=False)].astype(float)
    for _ in range(vueltas):
        d = ((px[:, None, :] - c[None]) ** 2).sum(2)
        e = d.argmin(1)
        for j in range(k):
            if (e == j).any():
                c[j] = px[e == j].mean(0)
    return c


def limpiar(l):
    out = l.copy()
    H, W = l.shape[:2]
    for y in range(H):
        for x in range(W):
            if l[y, x, 3] == 0:
                continue
            vec = [tuple(l[yy, xx]) for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))
                   if 0 <= yy < H and 0 <= xx < W and l[yy, xx, 3] > 0]
            if len(vec) >= 3 and tuple(l[y, x]) not in vec:
                out[y, x] = max(set(vec), key=vec.count)
    return out


def main():
    carpeta, clave = sys.argv[1], sys.argv[2]
    alto, ncol = opcion('--alto', 30), opcion('--colores', 20)
    ims = [np.array(Image.open(os.path.join(carpeta, 'render-%s.png' % d)).convert('RGBA')) for d in DIRS]
    # Marco común: la caja que contiene a todos.
    cajas = []
    for a in ims:
        ys, xs = np.where(a[:, :, 3] > 40)
        cajas.append((xs.min(), ys.min(), xs.max(), ys.max()))
    x0 = min(c[0] for c in cajas); y0 = min(c[1] for c in cajas); x1 = max(c[2] for c in cajas); y1 = max(c[3] for c in cajas)
    esc = alto / (y1 - y0 + 1)
    w = int(round((x1 - x0 + 1) * esc))
    # 1. Recorte común y realce: más saturación y contraste, como el pixel art de PixelLab (colores planos y vivos).
    recs = []
    for a in ims:
        r = a[y0:y1 + 1, x0:x1 + 1].astype(float)
        rgb = r[:, :, :3] / 255
        gris = rgb.mean(2, keepdims=True)
        rgb = np.clip(gris + (rgb - gris) * SATURACION, 0, 1)
        rgb = np.clip(((rgb - 0.5) * CONTRASTE + 0.5) * BRILLO, 0, 1)
        r[:, :, :3] = rgb * 255
        recs.append(r)
    # 2. Paleta común a resolución alta (k-medias sobre los opacos de las 8).
    todos = np.concatenate([r[r[:, :, 3] >= 128][:, :3] for r in recs])
    muestra = todos[np.random.default_rng(2).choice(len(todos), min(8000, len(todos)), replace=False)]
    pal = kmedias(muestra, ncol)
    os.makedirs(os.path.join(FUENTES, clave), exist_ok=True)
    ww = min(w, LADO - 2)
    for d, r in zip(DIRS, recs):
        H, W = r.shape[:2]
        idx = ((r[:, :, :3].reshape(-1, 3)[:, None, :] - pal[None]) ** 2).sum(2).argmin(1).reshape(H, W)
        opq = r[:, :, 3] >= 128
        # 3. Cada píxel pequeño: el color que más se repite en su bloque (sin mezclar), si el bloque es casi todo opaco.
        lienzo = np.zeros((LADO, LADO, 4), np.uint8)
        ox, oy = (LADO - ww) // 2, LADO - 1 - alto
        for y in range(alto):
            for x in range(ww):
                ya, yb = int(y * H / alto), max(int((y + 1) * H / alto), int(y * H / alto) + 1)
                xa, xb = int(x * W / ww), max(int((x + 1) * W / ww), int(x * W / ww) + 1)
                bo = opq[ya:yb, xa:xb]
                if bo.mean() < 0.45:
                    continue
                cuenta = np.bincount(idx[ya:yb, xa:xb][bo], minlength=ncol)
                lienzo[oy + y, ox + x] = (*pal[cuenta.argmax()].astype(np.uint8), 255)
        # Sin píxeles sueltos: uno opaco cuyo color no repite ninguno de sus 4 vecinos opacos toma el de la mayoría.
        lienzo = limpiar(lienzo)
        # 4. Contorno por fuera: cada transparente que toca (4 vecinos) un opaco.
        a = lienzo[:, :, 3] > 0
        borde = np.zeros_like(a)
        borde[1:] |= a[:-1]; borde[:-1] |= a[1:]; borde[:, 1:] |= a[:, :-1]; borde[:, :-1] |= a[:, 1:]
        borde &= ~a
        lienzo[borde] = CONTORNO
        Image.fromarray(lienzo).save(os.path.join(FUENTES, clave, 'rot-%s.png' % d), optimize=True)
    print('pixelar: 8 rotaciones de %dx%d (personaje de %d px de alto, %d colores) en fuentes/%s' % (LADO, LADO, alto, ncol, clave))


if __name__ == '__main__':
    main()
