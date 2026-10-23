"""Genera con PixelLab los sprites de un personaje del Multiverso (gasta generaciones de la cuenta).

    python tools/nico/multiverso/generar.py crear  <clave> <carpeta>          # 8 rotaciones a 32 px (2 generaciones)
    python tools/nico/multiverso/generar.py andar  <clave> <carpeta> [dirs]   # pasos en 5 direcciones (1 por dirección)
    python tools/nico/multiverso/generar.py bajar  <carpeta>                  # vuelve a bajarlo todo (gratis)

Usa el cliente de herramientas/pixellab (su `pixellab.py` y su token, que no están en este
repositorio; ruta en PIXELLAB_DIR o la de siempre). La cuenta gratuita sólo admite un trabajo
a la vez: este guion espera su turno y lanza una dirección cada vez. La carpeta es de trabajo,
fuera del repositorio: después, `montar.py traer <clave> <carpeta>` copia lo bueno a fuentes/.

- crear: `create-character-v3` desde cero (`DESC[clave]`), mirando al sur, a 32x32 y vista
  «low top-down», con contorno negro; guarda crear.json (el id del personaje) y las 8 rotaciones.
- andar: animación `v3` («walking forward…», 4 fotogramas, sin repetir el de la rotación) en
  sur, sureste, este, noreste y norte; parte de la rotación y conserva su tamaño. Las plantillas
  por esqueleto (`walking-4-frames`) lo redibujan más pequeño y girado: no sirven.
- bajar: el personaje y los fotogramas de sus animaciones, en tiras anim-custom-<acción>-<dir>.png.
"""
import importlib.util
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request

PIXELLAB_DIR = os.environ.get('PIXELLAB_DIR', r'C:\Users\Nico\Desktop\Claude\herramientas\pixellab')
_spec = importlib.util.spec_from_file_location('pixellab', os.path.join(PIXELLAB_DIR, 'pixellab.py'))
pl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pl)

DESC = {
    'agumon': ("Agumon from Digimon: small short stout baby tyrannosaurus dinosaur standing upright, bright yellow-orange skin "
               "of one uniform color with no stripes and no lighter belly, big round head, wide snout with small sharp white teeth, "
               "large round light green eyes, three big white claws on each hand and on each foot, short thick stubby tail, "
               "chibi proportions, cute Pokemon Mystery Dungeon style sprite", 'Agumon'),
    'slayer': ("Doom Slayer from DOOM: armored space marine in bulky olive green power armor with dark grey joints, "
               "green helmet with an orange-gold visor, holding a big double-barreled super shotgun in both hands, "
               "standing upright, chibi proportions with a slightly big head, cute Pokemon Mystery Dungeon style game sprite", 'Doom Slayer'),
    'caco': ("Cacodemon from DOOM: a floating round red demon ball with no arms and no legs, one big green eye in the middle "
             "of its face, a huge wide mouth full of sharp white teeth, small dark red horns on top, blue mouth interior, "
             "hovering in the air, chibi cute Pokemon Mystery Dungeon style game sprite", 'Cacodemon'),
    # Segundo lote (15-10-2026): los prompts salen de estudiar a cada uno (rasgos que lo distinguen a 32 px y qué evitar).
    'kirby': ("Kirby from Nintendo's Kirby series as a 32x32 pixel art game sprite, low top-down 3/4 view, facing south toward the camera, standing still. A perfectly round, soft pink puffball body about 22 px wide (base #F49AC1, shade #D9709F on the lower left, highlight #FFD3E6 on the upper right). NO ears, NO hair curl or forehead tuft, NO tail, NO wings, NO leaves, NO hat, nothing held. Face on the lower half of the front: two tall vertical oval eyes set close together (near-black navy #1A1440, a white glint at the top, deep blue #3A63D8 in the lower part), two small rosy oval blush marks just below the eyes (#FF6F9E), a tiny happy mouth between them. Two short stubby rounded arm nubs on the left and right sides, same pink as the body, no fingers. Two big bright red oval feet (#D8203C, darker #9E1030 underside) sticking out at the bottom like flat slippers: wider than the arms, clearly darker than the body, readable at a glance. Clean 1-px dark plum outline (#5B1E3C, not pure black), simple 3-tone cel shading, transparent background. Avoid: Jigglypuff's big triangular ears and forehead curl, Igglybuff's curl, Clefairy's pointed ears, wings and curly tail, Hoppip's leaves, pink feet the same color as the body, round eyes with large white sclera, anime eyes, any Copy Ability hat or weapon.",
               'Kirby'),
    'link': ("Link, the Hero of Time from The Legend of Zelda: Ocarina of Time (adult version), full-body chibi hero, Pokémon Mystery Dungeon style pixel art, 32x32, low top-down view, facing south toward the viewer, standing. Shapes that must read at 32 px: a long pointed green stocking cap that flops back and down behind his head; blond hair with side bangs framing the face; two long pointed elf ears sticking out sideways past the hair; a short green tunic with a brown leather belt and a diagonal brown strap across the chest; off-white tights and brown knee boots. He is LEFT-handed: the Master Sword (silver blade, blue-violet hilt with small gold wings) in his left hand (on the viewer's right), and the Hylian Shield on his right arm (on the viewer's left): a blue kite shield with a silver rim, a red bird crest and a small gold triangle at the top. Palette: tunic and cap green #3F9B3A, shade #25692A, highlight #7CCB5A; hair #F0C850; skin #F4CFA6; belt and boots #6B3F1E; tights #E9E2CF; shield blue #2A55B5, rim #C9D0DA, crest red #C42A2A; blade #DDE8F2; hilt #4A3FA8; dark outline #1E1A14. Avoid: the blue Champion's Tunic of Breath of the Wild, Toon Link's huge cartoon eyes, child proportions, a cape, a feathered hat, wings, armor plates, a bow covering the shield, any animal features such as a tail or furry ears.",
               'Link'),
    'samus': ("Samus Aran from Metroid Prime in her orange Varia Suit, full-body chibi bounty hunter in powered armor, Pokémon Mystery Dungeon style pixel art, 32x32, low top-down view, facing south toward the viewer, standing. Shapes that must read at 32 px: two huge round orange-yellow shoulder pads, wider than the helmet, with thin dark red ridge stripes; a rounded dark red helmet with a large bright green visor (no face visible); red chest plate; orange upper arms, forearms and legs with dark grey joints; red boots. Her right forearm (on the viewer's left) is a chunky cylindrical orange Arm Cannon with a grey muzzle, held forward at waist height; her left hand (on the viewer's right) is a red-orange armored fist. Palette: armor orange #F08A1C, highlight #FFC24A, shadow #A8520E; red #B8281E, dark red #6E1410; visor green #3CE05A with a #B6FF8A glint; joints #3A3A44; muzzle #7A7F88; dark outline #2A0E08. Avoid: Zero Suit, ponytail or visible hair, blue or purple suit, a cannon on both arms (a round Magmortar-like body), a handheld gun or rifle, cape, wings, tail, mech-robot proportions, an Iron Man faceplate, an oversized head.",
               'Samus Aran'),
    'dracula': ("Count Dracula from Castlevania: Symphony of the Night (Ayami Kojima's design), full body, a tall regal vampire lord standing still and facing south toward the viewer, low top-down view. Pale gaunt face with glowing red eyes, long straight silver-white hair falling past his shoulders, small pointed silver goatee. Huge black cape with a blood-red inner lining, held closed in front; its tall stiff collar flares up and out behind his head in two points. The cape flows all the way down to the ground and completely hides his legs and feet, widening into a triangle at the bottom, so he seems to glide. Between the cape edges: a black and dark-crimson aristocratic coat with gold trim, a white lace jabot and one gold medallion on the chest. Long thin pale hands with dark claws peeking out at his sides. Must read at 32 px: a dark triangular silhouette, red collar lining framing a pale face and white hair, a single gold accent on the chest. Palette: cape black #15111c with purple-grey highlights #3a3046, lining crimson #a3162b, coat crimson #5a0f1c, gold #d9a441, hair #dcdce6, skin #eadfd2, eyes #ff2a2a, 1 px dark outline #0b080e. Pixel art in Pokémon Mystery Dungeon sprite style, crisp pixels, no anti-aliasing, transparent background. Avoid: bat wings, visible legs or feet, fangs, any weapon, whip, scepter, wine glass, top hat, slicked-back black hair or widow's peak, tuxedo, Lords of Shadow armor, Netflix anime look, blood splatter, a red cape exterior, a witch-like hat or ribbon hair (Mismagius, Gothitelle).",
               'Dracula'),
    'cthulhu': ("Eye of Cthulhu from Terraria as a 32x32 pixel-art game sprite, low top-down 3/4 view, facing south toward the viewer, Pokémon Mystery Dungeon style shading with a dark 1-pixel outline. A single giant floating eyeball with no body, no limbs and no eyelids. Round sclera, pure white #f5f5f5 with soft grey shading #d7d7d7, #a0a0a0 and #767676 on the far side, heavily bloodshot: thick red veins #dc1c1c and #b52525 with dark red #8c1e1e cover the back half of the eyeball and converge into 4 or 5 thin wavy red optic-nerve strands (#dc1c1c with pink-red highlights #eb5f5f) trailing BEHIND and slightly above it like a comet tail. On the front, one large iris looking straight at the viewer: a royal-blue outer ring #3731b5 / #545ad8 around an olive-green inner ring #474d21 and a black pupil #141414, with a tiny white glint. The eyeball is about 24 px wide; the strands add about 6 px. Hovering above the ground with a small soft shadow below. Clean readable silhouette at 32 px, big iris so it reads from far away. Avoid: mouth or teeth (that is its second form), eyelids, eyelashes, extra eyes, eyestalks or Beholder look, jellyfish-like tentacles hanging down (Nihilego or Tentacool look), a red ball body (that is DOOM's Cacodemon, already in the game), horns, wings, arms, purple or green skin, cute cartoon face, gore splashes.",
               'Eye of Cthulhu'),
    # Tercer lote (23-10-2026, petición de Nico: «master chief y kratos»; fichas en FICHAS.md).
    'jefe': ("Master Chief (John-117) from Halo: Combat Evolved in his MJOLNIR Mark V armor, full-body chibi super-soldier, Pokémon Mystery Dungeon style pixel art, 32x32, low top-down view, facing south toward the viewer, standing. Shapes that must read at 32 px: a smooth ROUNDED olive-green helmet with a huge reflective gold-orange visor that covers the whole face (no face, no eyes, no mouth visible); bulky but smooth olive-green chest plate and rounded shoulder plates, dark charcoal-grey flexible undersuit visible at the neck, elbows, waist and knees; armored olive-green forearms, thighs and boots. He holds a long matte-black MA5B assault rifle diagonally across his chest with both hands, the barrel pointing down-left, a small glowing blue digital ammo counter on top of the rifle. Palette: armor olive green #6B7A3A, shade #4A5626, highlight #93A35A; undersuit #2E3034, darker #1C1D20; visor gold #E8A82A with an orange shade #B5651A and a pale yellow glint #FFE38A; rifle #1E1F22 with grey edges #4A4C52; ammo counter #4FC3F7; dark outline #14160E. Avoid: the Doom Slayer (already in the game): no ridged or striped helmet, no narrow slit visor, no double-barreled shotgun, no exposed arms or skin, no spikes, no wrist blade, no shoulder cannon; also avoid Halo 4/5/Infinite armor, red or blue armor, a cape, a backpack, wings, a tail, mech-robot proportions, an Iron Man faceplate, an oversized head.",
              'Master Chief'),
    'kratos': ("Kratos, the Ghost of Sparta from the original Greek God of War trilogy (PS2/PS3 era, NOT the bearded Norse version), full-body chibi Spartan warrior, Pokémon Mystery Dungeon style pixel art, 32x32, low top-down view, facing south toward the viewer, standing in a wide fighting stance. Shapes that must read at 32 px: chalk-white ash-pale skin all over his bare muscular torso, arms and head; a completely bald head; a thick bold blood-red tattoo stripe that starts around his left eye (on the viewer's right), runs up over the top of the bald scalp and down the back of the head, and continues down his left shoulder and the left side of his chest and arm; a short black goatee around the mouth (chin only, no full beard, no moustache-only); angry amber eyes under heavy brows. Bare chest, no shirt, no armor plates on the torso. Waist: a wide brown leather belt with a small gold buckle over a short skirt of dark brown leather strips with bronze studs, and a dark red cloth hanging in front. Brown leather bracers on the forearms wrapped with dark metal chains; bronze greaves and sandals. In each hand he holds one of the Blades of Chaos hanging down at his sides: a short curved single-edged blade with a dark iron body and a glowing orange-yellow cutting edge, attached to the chain on his forearm. Palette: skin #E6E2DA, skin shade #B9B3AA; tattoo red #B3121B, dark red #6E0A10; goatee #1E1A18; eyes #F2A33A; leather #5A3A22, dark leather #3A2414; red cloth #7A1414; bronze #A87A3A; chains #6E6A66; blade iron #4A4A50 with glowing edge #FF7A1A and highlight #FFD24A; dark outline #1A0E0A. Avoid: full beard or long hair, the Leviathan Axe or any axe, a round shield, a helmet or Spartan crested helmet, a cape, fur or Norse leather armor, Atreus or a child, tan or brown skin, a blue tattoo, a tattoo on the right side, a red skin color, a sword held overhead, extra weapons on the back, an oversized head, wings, tail.",
           'Kratos'),
}
ANDAR = {
    'agumon': 'walking forward, a small step with each foot, body bobbing slightly, same size and same view',
    'slayer': 'walking forward holding the shotgun, a small step with each foot, body bobbing slightly, same size and same view',
    'link': 'walking forward with sword and shield, a small step with each foot, cap swaying, same size and same view',
    'samus': 'walking forward in power armor, arm cannon held forward, a small step with each foot, same size and same view',
    'jefe': 'walking forward holding the assault rifle across his chest, a small heavy step with each foot, same size and same view',
    'kratos': 'walking forward with a heavy stride, a glowing chained blade hanging in each hand, a small step with each foot, shoulders swaying slightly, same size and same view',
}
TRES = ['south', 'east', 'north']   # pasos en 3 direcciones (las diagonales usan los del lado; montar.py)
CINCO = ['south', 'south-east', 'east', 'north-east', 'north']


def token():
    return pl.get_token(None)


def post(path, body):
    req = urllib.request.Request(pl.BASE + path, data=json.dumps(body).encode(), method='POST',
                                 headers={'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json', 'User-Agent': pl.UA})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def turno(path, body):
    """POST que espera su turno (plan gratuito: un trabajo a la vez)."""
    while True:
        code, r = post(path, body)
        if code == 429 or (isinstance(r, str) and 'concurrent' in r):
            time.sleep(15)
            continue
        if code >= 300:
            sys.exit('PixelLab %s: %s' % (code, str(r)[:500]))
        return r


def crear(clave, carpeta):
    desc, nombre = DESC[clave]
    os.makedirs(carpeta, exist_ok=True)
    r = turno('/create-character-v3', {'description': desc, 'image_size': {'width': 32, 'height': 32}, 'view': 'low top-down',
                                        'template_id': 'mannequin', 'no_background': True, 'outline': 'single color black outline',
                                        'detail': 'medium detail', 'seed': 11, 'name': nombre})
    json.dump(r, open(os.path.join(carpeta, 'crear.json'), 'w'), indent=1)
    pl.poll_character(token(), r['character_id'], carpeta, 900)


def andar(clave, carpeta, dirs):
    cid = json.load(open(os.path.join(carpeta, 'crear.json')))['character_id']
    gid = None
    for d in dirs:
        body = {'character_id': cid, 'mode': 'v3', 'action_description': ANDAR[clave], 'frame_count': 4,
                'keep_first_frame': False, 'directions': [d], 'animation_name': 'v3-andar'}
        if gid:
            body['animation_group_id'] = gid
        r = turno('/characters/animations', body)
        gid = r.get('animation_group_id') or gid
        jid, t0 = r['background_job_ids'][0], time.time()
        while True:
            st = pl.call('GET', '/background-jobs/%s' % jid, token()).get('status')
            if st in ('completed', 'failed', 'cancelled', 'error'):
                print('%s: %s (%.0f s)' % (d, st, time.time() - t0), flush=True)
                break
            time.sleep(6)
    bajar(carpeta)


def bajar(carpeta):
    from PIL import Image
    cid = json.load(open(os.path.join(carpeta, 'crear.json')))['character_id']
    c = pl.poll_character(token(), cid, carpeta, 900)
    for an in c.get('animations') or []:
        for d in an['directions']:
            ims = []
            for url in d['frames']:
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': pl.UA}), timeout=120) as r:
                    ims.append(Image.open(io.BytesIO(r.read())).convert('RGBA'))
            w, h = ims[0].size
            tira = Image.new('RGBA', (w * len(ims), h), (0, 0, 0, 0))
            for i, im in enumerate(ims):
                tira.alpha_composite(im, (i * w, 0))
            accion = (an.get('animation_type') or 'anim').replace('/', '-')
            tira.save(os.path.join(carpeta, 'anim-%s-%s.png' % (accion, d['direction'])))
            print('  %s %s: %d fotogramas de %dx%d' % (accion, d['direction'], len(ims), w, h))


if __name__ == '__main__':
    orden = sys.argv[1] if len(sys.argv) > 1 else ''
    if orden == 'crear':
        crear(sys.argv[2], sys.argv[3])
    elif orden == 'andar':
        andar(sys.argv[2], sys.argv[3], sys.argv[4].split(',') if len(sys.argv) > 4 else CINCO)
    elif orden == 'bajar':
        bajar(sys.argv[2])
    else:
        sys.exit(__doc__)
