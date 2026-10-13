# Makes the phone-sized copies of the site's pictures in assets/img/m/ (same name, same shape, smaller).
# Phones are given these instead of the originals by scripts/build.js (css/m/*.css and img srcset); laptops and
# desktops keep the originals. Run again after replacing a picture:  python scripts/mobile-images.py
#
# WIDTHS: the width of each phone copy, in pixels. Each is at least ~2.6x the widest the picture is ever drawn on a
# large phone (430 px wide screen), so it stays sharp on high-resolution phone screens. A picture not listed here is
# served at its original size (also the ones a smaller copy would barely shrink, e.g. the paisley tile). Pictures shown full screen when tapped (the couple photos) are left at full size.
import json, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'assets', 'img')
DST = os.path.join(SRC, 'm')
QUALITY = 82  # WebP quality of the phone copies

WIDTHS = {
    'opening-hawa-mahal.webp': 1100,                                     # behind the envelope (cover, ~525 px wide)
    'gate-top.webp': 1300, 'gate-middle.webp': 1300, 'gate-bottom.webp': 1300,
    'gate-mid-a.webp': 1300, 'gate-mid-b.webp': 1300, 'gate-mid-tile.webp': 1300,   # the gate, 494 px on phones (2.6x)
    'flowering-tree.webp': 760, 'couple.webp': 1100, 'flower-bed.webp': 1120,
    'family-bride-v3.webp': 800, 'family-groom-v3.webp': 800, 'family-arch-top.webp': 900,
    'family-arch-middle.webp': 900, 'family-arch-bottom.webp': 900, 'cream-damask.webp': 740,
    'ganesh.webp': 480, 'marigold-garland.webp': 1170, 'rsvp-hawa-mahal.webp': 730, 'lake-palace.webp': 860,
    'peacock.webp': 600, 'rsvp-pillar.webp': 300, 'patrika-platform.webp': 1120,
    'lotus-ornament.webp': 480, 'flower-urn.webp': 480, 'diya-bracket-top.webp': 480, 'garland-right.webp': 240,
    'garland-left.webp': 200,
    'ev-haldi.webp': 480, 'ev-mehndi.webp': 480, 'ev-sangeet.webp': 480, 'ev-phere.webp': 480, 'ev-reception.webp': 480,
    'mihrab-top.webp': 820, 'lotus-plant.webp': 640,
}

def main():
    os.makedirs(DST, exist_ok=True)
    for f in os.listdir(DST):                     # start clean: copies no longer listed are removed
        os.remove(os.path.join(DST, f))
    manifest = {}
    for name, w in sorted(WIDTHS.items()):
        src = os.path.join(SRC, name)
        if not os.path.exists(src):
            print('missing', name); continue
        im = Image.open(src)
        W, H = im.size
        if w >= W:
            continue
        h = round(H * w / W)
        small = im.resize((w, h), Image.LANCZOS)
        small.save(os.path.join(DST, name), 'WEBP', quality=QUALITY, method=6)
        manifest[name] = [w, W]          # phone width, original width (for img srcset)
        print(f'{name}: {W}x{H} {os.path.getsize(src)//1024} KB -> {w}x{h} {os.path.getsize(os.path.join(DST, name))//1024} KB')
    with open(os.path.join(DST, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=1, sort_keys=True)

if __name__ == '__main__':
    main()
