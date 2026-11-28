"""Render every paper scene from the real 3D scene (full quality) into papercraft/fallback/*.webp + index.json.
These pictures replace the 3D scene on devices that cannot run it (js/22-papercraft.js). Needs the site served at :8765.
    python tools/render-paper-fallback.py [s2,s3,...]"""
import base64, io, json, os, sys
from PIL import Image
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'papercraft', 'fallback') + '/'; os.makedirs(OUT, exist_ok=True)
GO = {'s2': '1-3', 's3': '2-1', 's5': '2-3', 's9': '5-1', 's10': '5-2', 'aDGD': 'alley-DGD', 'aDGA': 'alley-DGA', 'aAFX': 'alley-AFX', 'aIGD': 'alley-IGD', 'aDEN': 'alley-DEN'}
ONLY = sys.argv[1].split(',') if len(sys.argv) > 1 else list(GO)
SIZES = {'land': dict(viewport={'width': 1280, 'height': 800}, device_scale_factor=1.5),
         'port': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)}
man = json.load(open(OUT + 'index.json')) if os.path.exists(OUT + 'index.json') else {}
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'])
    for sid in ONLY:
        for o, kw in SIZES.items():
            ctx = b.new_context(**kw); pg = ctx.new_page()
            pg.goto('http://127.0.0.1:8765/index.html?quality=high&paper=1&go=' + GO[sid], wait_until='load', timeout=120000)
            pg.wait_for_function('window.__paper && __paper.active && __paper.active.id === %r' % sid, timeout=90000)
            pg.wait_for_timeout(5000)
            r = pg.evaluate('''(() => { const st = __paper.st; st.render();
                const url = document.getElementById('paper').toDataURL('image/png');
                const W = innerWidth, H = innerHeight, sr = document.getElementById('screen').getBoundingClientRect();
                return { url, dpr: st.renderer.getPixelRatio(), band: [0, 62, W, Math.max(170, sr.top + scrollY - 12)], W, H }; })()''')
            im = Image.open(io.BytesIO(base64.b64decode(r['url'].split(',')[1]))).convert('RGBA')
            bb = im.getchannel('A').point(lambda a: 255 if a > 2 else 0).getbbox()
            pad = 4; x0, y0, x1, y1 = max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad)
            crop = im.crop((x0, y0, x1, y1)); f = '%s-%s.webp' % (sid, o)
            crop.save(OUT + f, 'WEBP', quality=86, method=6)
            d = r['dpr']
            man.setdefault(sid, {})[o] = {'f': f, 'band': r['band'], 'box': [round(x0 / d, 1), round(y0 / d, 1), round((x1 - x0) / d, 1), round((y1 - y0) / d, 1)], 'vw': r['W'], 'vh': r['H']}
            print(sid, o, crop.size, '%d KB' % (os.path.getsize(OUT + f) // 1024), flush=True)
            ctx.close()
    b.close()
json.dump(man, open(OUT + 'index.json', 'w'), indent=1)
