"""Build the result-card pictures (front and back, one per major) from the two sample frames.

    python tools/make-cards.py            (run from the project folder; needs Pillow + numpy)

Sources (in images/):
  frame-1.png   front sample (Frame 1): newspaper frame, two cream panels, a sample mascot in the top panel
  frame-2.png   back sample (Frame 2): newspaper all over, IMAGINE CITY logo + "คืนสุดท้ายก่อนสีจะหายไป" in the middle
  intro-logo-1253.webp, intro-sub-900.webp   the logo and the title line in high resolution

Output (in images/): card-front-<MAJOR>.webp and card-back-<MAJOR>.webp, SCALE x the sample size.
  - the newspaper is gradient-mapped to the major's colour (dark ink -> major colour -> light paper), so the print and
    paper grain stay as clear as in the pink sample; no CSS hue-rotate
  - front: both cream panels are repainted plain cream (the sample mascot is removed; the page puts each major's own
    mascot and the title on top). Cream never changes colour
  - back: the logo and the title line are pasted back in high resolution at the spot they sit in the sample, so they
    are sharp and keep their own colours
A sharper result needs a larger export of the two frames (same layout): drop them in as frame-1.png / frame-2.png
and set SAMPLE_W to their width; every position below is in sample pixels of the 297 x 420 frame.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, '..', 'images')
MAJORS = {'DGD': '#9A7BFF', 'DGA': '#F25AA6', 'AFX': '#F59A3B', 'IGD': '#3BCB7E', 'DEN': '#4BA3F5'}
SAMPLE_W = 297          # width the positions below are measured in
SCALE = 3               # output = 891 x 1260: sharp at 290 css px on 3x phone screens
CREAM = (255, 240, 197)
# cream panels in Frame 1 (x0, y0, x1, y1, corner radius), sample px
PANELS = [(17, 20, 280, 295, 2), (17, 333.5, 280, 393, 2)]
# logo and title line in Frame 2 (x, y, width), sample px - found by matching the high-res pictures to the sample
LOGO = ('intro-logo-1253.webp', 28, 119, 240)
SUB = ('intro-sub-900.webp', 41, 241, 216)


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float) / 255


def lum(rgb):
    return rgb[..., 0] * .299 + rgb[..., 1] * .587 + rgb[..., 2] * .114


def recolour(rgb, colour, mid):
    """gradient map: luminance 0 -> deep ink, `mid` (the sample's paper tone) -> the colour, 1 -> light paper"""
    # stops fitted so the pink (DGA) card matches the sample's ink / paper / highlight tones (10th, 50th, 90th percentile)
    c = hexrgb(colour) * .94
    dark = c * .02 / .94
    light = c + (1 - c) * .75
    y = lum(rgb)[..., None]
    lo = dark + (c - dark) * np.clip(y / mid, 0, 1)
    hi = c + (light - c) * np.clip((y - mid) / (1 - mid), 0, 1)
    return np.where(y <= mid, lo, hi)


def load(name):
    return Image.open(os.path.join(IMG, name)).convert('RGBA')


def up(im):
    k = SCALE * SAMPLE_W / im.width
    big = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=2))


def paste(base, name, x, y, w):
    k = SCALE * SAMPLE_W / 297
    im = load(name)
    W = round(w * k)
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    base.alpha_composite(im, (round(x * k), round(y * k)))


def build():
    trim = lambda im: im.crop(im.getchannel('A').getbbox())   # Frame 2 comes with an empty strip under the card
    f1, f2 = up(trim(load('frame-1.png'))), up(trim(load('frame-2.png')))
    k = SCALE * SAMPLE_W / 297
    # the sample's own paper tone: median luminance of the newspaper on the back
    a2 = np.asarray(f2).astype(float) / 255
    mid = float(np.median(lum(a2[..., :3])[a2[..., 3] > .9]))
    a1 = np.asarray(f1).astype(float) / 255
    from PIL import ImageDraw
    for key, colour in MAJORS.items():
        for side, arr in (('front', a1), ('back', a2)):
            rgb = recolour(arr[..., :3], colour, mid)
            out = np.dstack([rgb, arr[..., 3:]])
            im = Image.fromarray(np.uint8(np.clip(out, 0, 1) * 255 + .5), 'RGBA')
            if side == 'front':
                d = ImageDraw.Draw(im)
                for x0, y0, x1, y1, r in PANELS:
                    d.rounded_rectangle([x0 * k, y0 * k, x1 * k - 1, y1 * k - 1], radius=r * k, fill=CREAM + (255,))
            else:
                paste(im, *LOGO)
                paste(im, *SUB)
            p = os.path.join(IMG, 'card-%s-%s.webp' % (side, key))
            im.save(p, 'WEBP', quality=80, alpha_quality=90, method=6)
            print(p, im.size, os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    build()
