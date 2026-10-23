"""Las 8 rotaciones de un personaje a partir de su modelo 3D (sustituye a la rotación de PixelLab; 0 generaciones).

    blender --background --python tools/nico/multiverso/rotar3d.py -- <modelo.glb> <carpeta> [giro_grados]

Escribe <carpeta>/render-<dirección>.png (256x256, fondo transparente); `pixelar.py` los baja a 32 px.
El modelo sale de una imagen de frente con TRELLIS.2 (herramientas/3d-gen, `3dgen.py malla`). La cámara es
ortográfica y mira desde arriba con la inclinación de los sprites de PixelLab («low top-down», ELEVACION grados);
gira alrededor del personaje: «south» es de frente (el personaje mira a la cámara), «east» lo ve de perfil mirando
a la derecha de la pantalla, etc. `giro_grados` corrige hacia dónde mira el modelo si TRELLIS lo deja girado.
Luz: un sol cálido desde arriba y delante y un ambiente suave, para que el pixel art tenga 2-3 tonos por color.
"""
import math
import os
import sys

import bpy

ELEVACION = 30          # grados sobre el horizonte
LADO = 256              # px del render
AMBIENTE = 0.32         # luz del cielo: baja, para que cada color tenga 2-3 tonos
SOL = 4.2
GIRO_SOL = -50          # el sol, de lado y por delante: sombrea un lado de la cara y del cuerpo
DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']


def main():
    args = sys.argv[sys.argv.index('--') + 1:]
    modelo, carpeta = args[0], args[1]
    giro = float(args[2]) if len(args) > 2 else 0.0
    os.makedirs(carpeta, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=modelo)
    objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    # Todo junto bajo un vacío que se puede girar; centrado y con los pies en z = 0.
    raiz = bpy.data.objects.new('raiz', None)
    bpy.context.scene.collection.objects.link(raiz)
    for o in objs:
        o.parent = raiz
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ v.co for o in objs for v in o.data.vertices]
    xs, ys, zs = [p.x for p in pts], [p.y for p in pts], [p.z for p in pts]
    cx, cy, z0, z1 = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, min(zs), max(zs)
    for o in objs:
        o.location.x -= cx
        o.location.y -= cy
        o.location.z -= z0
    alto = z1 - z0
    raiz.rotation_euler[2] = math.radians(giro)

    escena = bpy.context.scene
    escena.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    escena.render.resolution_x = escena.render.resolution_y = LADO
    escena.render.film_transparent = True
    escena.view_settings.view_transform = 'Standard'
    mundo = bpy.data.worlds.new('mundo')
    mundo.use_nodes = True
    mundo.node_tree.nodes['Background'].inputs[0].default_value = (1, 1, 1, 1)
    mundo.node_tree.nodes['Background'].inputs[1].default_value = AMBIENTE
    escena.world = mundo
    sol = bpy.data.objects.new('sol', bpy.data.lights.new('sol', 'SUN'))
    sol.data.energy = SOL
    sol.data.color = (1.0, 0.96, 0.9)
    escena.collection.objects.link(sol)

    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = alto * 1.18
    escena.collection.objects.link(cam)
    escena.camera = cam
    el = math.radians(ELEVACION)
    dist = alto * 6
    centro_z = alto * 0.5
    for i, d in enumerate(DIRS):
        # south: la cámara delante del personaje (en -Y), mirando hacia +Y. Cada dirección gira 45° más.
        az = math.radians(-90 + 45 * i)
        x, y = dist * math.cos(el) * math.cos(az), dist * math.cos(el) * math.sin(az)
        cam.location = (x, y, centro_z + dist * math.sin(el))
        dx, dy, dz = -x, -y, centro_z - cam.location.z
        cam.rotation_euler = (math.atan2(math.hypot(dx, dy), -dz), 0, math.atan2(dy, dx) - math.pi / 2)
        # El sol, siempre desde arriba y algo por delante de la cámara.
        sol.rotation_euler = (math.radians(35), 0, cam.rotation_euler[2] + math.radians(GIRO_SOL))
        escena.render.filepath = os.path.join(carpeta, 'render-%s.png' % d)
        bpy.ops.render.render(write_still=True)
    print('rotar3d: 8 renders en', carpeta)


main()
