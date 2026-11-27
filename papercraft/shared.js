/* ===== Imagine City papercraft: shared kit (read papercraft/SPEC.md and PLAN.md first) =====
   One small three.js stage + reusable paper pieces. Every scene in papercraft/scenes/ builds on this.
   Cheap on purpose (event phones): no shadow maps, no post-processing, ONE draw call per card
   (the card's cut sides sample an ink swatch in its own print). Shadows are baked blurred silhouettes
   lying on the page; depth of field is baked blur in the prints of far / near pieces.
   There is NO hero: the guide light (#FFF1B0) stands in for the player in every scene. */
import * as THREE from './vendor/three.min.js';   // vendor/three.module.js + three.core.js (r187) minified with esbuild
export { THREE };

/* ---------- palette (SPEC.md section 3) ---------- */
export const PAL = {
  bg: '#0a0818',
  ground: '#46425C', groundLt: '#545069', groundDk: '#36324A',
  light: '#BDB9C8', mid: '#9591A6', dark: '#6C687F', deep: '#4E4A62',
  ink: '#1E1A30', edge: '#2B2440', cream: '#EDE6D3',
  shadow: '#1A1438', guide: '#FFF1B0', fill: '#8C88C8',
  skin: '#B4AEC2', hair: '#3A3450', win: '#2E2A42', winLit: '#F3E2A8'
};
export const ORDER = ['DGD', 'DGA', 'AFX', 'IGD', 'DEN'];
export const MAJ = { DGD: '#9A7BFF', DGA: '#F25AA6', AFX: '#F59A3B', IGD: '#3BCB7E', DEN: '#4BA3F5' };
export const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const TAU = Math.PI * 2;

/* ---------- colour + random helpers ---------- */
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
/** a colour pulled toward its own grey: sat 0 = grey, 1 = full colour (the city's colour is draining away) */
export const tone = (h, sat) => { const c = hx(h), l = c[0] * .3 + c[1] * .59 + c[2] * .11; return toHex(c.map(v => l + (v - l) * sat)); };
export const shade = (h, f) => toHex(hx(h).map(v => v * f));
export function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/** split n items between the majors in proportion to scores (for 5.1 / 5.2 score presets) */
export function byScore(scores, n, seed = 1) {
  const R = rng(seed), tot = ORDER.reduce((s, m) => s + (scores[m] || 0), 0) || 1, out = [];
  ORDER.forEach(m => { const k = Math.round(n * (scores[m] || 0) / tot); for (let i = 0; i < k; i++) out.push(m); });
  while (out.length < n) out.push(ORDER.reduce((a, b) => (scores[a] || 0) >= (scores[b] || 0) ? a : b));
  out.length = n;
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/* ---------- outlines (units, y up, base on y = 0) ---------- */
export function ellipse(cx, cy, rx, ry, n = 24, jitter = 0, seed = 1) {
  const r = rng(seed), p = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + (r() - .5) * jitter; p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return p;
}
/** torn-paper edge: low wobble + small tears */
export function torn(cx, cy, rx, ry, seed = 1, n = 84) {
  const r = rng(seed), ph = [r() * 6, r() * 6, r() * 6], p = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const k = 1 + .04 * Math.sin(a * 3 + ph[0]) + .028 * Math.sin(a * 7 + ph[1]) + .018 * Math.sin(a * 13 + ph[2]) + (r() - .5) * .02;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return p;
}
/** a thick strip along a polyline (lanes, ribbons, strings) */
export function ribbon(pts, w, w2 = w) {
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const hw = (w + (w2 - w) * i / Math.max(1, pts.length - 1)) / 2;
    L.push([p[0] - dy * hw, p[1] + dx * hw]); R.push([p[0] + dy * hw, p[1] - dx * hw]);
  });
  return L.concat(R.reverse());
}
export function quad(a, c, b, n = 10) { const p = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; p.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return p; }
export function star(r1, r2, n = 5, cx = 0, cy = 0, rot = Math.PI / 2) { const p = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + rot, r = i % 2 ? r2 : r1; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
/** rounded-top lobes (clouds, smoke, bushes): base on y=0 */
export function cloud(w, h, lobes = 4, seed = 1) {
  const R = rng(seed), p = [[-w / 2, 0], [w / 2, 0]], n = lobes * 6;
  for (let i = 0; i <= n; i++) { const t = i / n, x = w / 2 - t * w, k = Math.abs(Math.sin(t * Math.PI * lobes)) * .28 + .72; p.push([x, Math.sin(t * Math.PI) * h * k * (.92 + R() * .08) + h * .12]); }
  return p;
}
export function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; }

/* ---------- printing: every card is a small layered paper collage ---------- */
/* L = direction TOWARD the guide light in print space (x right, y down). Lit edges get a pale lip,
   layers drop a short navy shadow away from it. */
const PAD = 4;
function printer(outline, ppu, L, seed) {
  const bb = bbox(outline);
  const W = Math.max(12, Math.ceil(bb.w * ppu) + PAD * 2), H = Math.max(12, Math.ceil(bb.h * ppu) + PAD * 2);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const X = x => (x - bb.x0) * ppu + PAD, Y = y => (bb.y1 - y) * ppu + PAD;
  const P = {
    g, W, H, s: ppu, X, Y, bb, canvas: cv, rnd: rng(seed),
    poly(pts) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(X(q[0]), Y(q[1])) : p.moveTo(X(q[0]), Y(q[1]))); p.closePath(); return p; },
    circle(x, y, r) { const p = new Path2D(); p.arc(X(x), Y(y), r * ppu, 0, TAU); return p; },
    rect(x, y, w, h) { return P.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); },
    /** one cut layer: short soft shadow away from the light + pale lip on the lit edges */
    layer(path, fill, o = {}) {
      const sh = o.shadow ?? 1, lip = o.lip ?? 1, d = .1 * ppu * sh;
      g.save();
      if (sh) { g.shadowColor = 'rgba(16,10,40,.55)'; g.shadowBlur = .09 * ppu * sh; g.shadowOffsetX = -L.x * d; g.shadowOffsetY = -L.y * d; }
      g.fillStyle = fill; g.fill(path, o.rule || 'nonzero'); g.restore();
      if (lip) P.lip(path, .08 * ppu * lip, o.lipColor);
    },
    lip(path, w, col = 'rgba(255,244,200,.30)') {
      const q = new Path2D(); q.rect(-W, -H, W * 3, H * 3); q.addPath(path, new DOMMatrix([1, 0, 0, 1, -L.x * w, -L.y * w]));
      g.save(); g.clip(path); g.fillStyle = col; g.fill(q, 'evenodd'); g.restore();
    },
    fibre(amount = 1) {
      const n = Math.round(W * H / 70 * amount);
      for (let i = 0; i < n; i++) {
        const lt = P.rnd() < .5; g.fillStyle = lt ? 'rgba(255,250,235,.05)' : 'rgba(20,14,40,.06)';
        const l = 1 + P.rnd() * 3; g.save(); g.translate(P.rnd() * W, P.rnd() * H); g.rotate(P.rnd() * 3.14); g.fillRect(0, 0, l, .8); g.restore();
      }
    },
    /** soft glow painted into the print (lit windows, lamps): not a light, just warm ink */
    glowDot(x, y, r, col, a = .5) { const gr = g.createRadialGradient(X(x), Y(y), 0, X(x), Y(y), r * ppu); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(X(x) - r * ppu, Y(y) - r * ppu, r * ppu * 2, r * ppu * 2); g.restore(); }
  };
  P.outline = P.poly(outline);
  return P;
}
/** soft blur baked into a print (tilt-shift stand-in). downscale-upscale: works in every browser, costs ~nothing */
export function bakeBlur(cv, px) {
  if (!px) return;
  const k = Math.max(1, px), w = Math.max(2, Math.round(cv.width / k)), h = Math.max(2, Math.round(cv.height / k));
  const t = document.createElement('canvas'); t.width = w; t.height = h; const tg = t.getContext('2d');
  tg.imageSmoothingQuality = 'high'; tg.drawImage(cv, 0, 0, w, h);
  const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(t, 0, 0, cv.width, cv.height);
}

function canvasTex(cv, st) {
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(4, st.renderer.capabilities.getMaxAnisotropy()); return t;
}

/* ---------- card: one printed, cut, slightly thick sheet ----------
   outline in units (y up, base y=0), paint(P) prints the collage on top of the base sheet.
   holes: list of outlines cut out (doors, arches). key: cache the print + geometry for identical pieces.
   Returns { mesh, outline, P, tex, mat, reprint(paint) }. */
const EMPTY_GEO = new THREE.BufferGeometry();
EMPTY_GEO.userData.keep = true;
export function card(st, o) {
  const { outline, paint, base = PAL.light, ppu = 48, th = .07, seed = 1, blur = 0, edge = PAL.edge, rim = true, fibre = 1, holes = null, key = null, unlit = false, emit = 0 } = o;
  if (key && st._cache.has(key)) { const c = st._cache.get(key), m2 = new THREE.Mesh(c.mesh.geometry, c.mat); c.meshes.push(m2); return { ...c, mesh: m2, shared: true }; }
  const P = printer(outline, ppu, st.L, seed);
  const holePaths = holes ? holes.map(h => P.poly(h)) : [];
  let baseCol = base;
  const draw = (pnt) => {
    const g = P.g; g.clearRect(0, 0, P.W, P.H); P.rnd = rng(seed);
    g.fillStyle = baseCol; g.fillRect(0, 0, P.W, P.H);
    if (fibre) P.fibre(fibre);
    pnt && pnt(P);
    if (rim) { // the cut edge: thin ink line at the silhouette (and round holes) + pale lip on the lit side
      g.save(); g.clip(P.outline); g.lineWidth = .075 * ppu; g.strokeStyle = PAL.ink; g.stroke(P.outline); holePaths.forEach(h => g.stroke(h)); g.restore();
      P.lip(P.outline, .07 * ppu, 'rgba(255,244,200,.26)');
    }
    bakeBlur(P.canvas, blur);
    g.fillStyle = edge; g.fillRect(0, 0, PAD, PAD);               // ink swatch the cut sides sample
  };
  const tex = canvasTex(P.canvas, st);
  let painted = false;
  const doPaint = () => { if (painted) return; painted = true; draw(paint); tex.needsUpdate = true; };
  if (st._jobs) st._jobs.push(doPaint); else doPaint();   // preparing: painting happens later, in idle-time slices
  const makeGeo = () => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    if (holes) holes.forEach(h => shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 4 });
    geo.translate(0, 0, -th / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv, nrm = geo.attributes.normal;
    const su = (PAD / 2) / P.W, sv = 1 - (PAD / 2) / P.H;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(nrm.getZ(i)) > .5) uv.setXY(i, P.X(pos.getX(i)) / P.W, 1 - P.Y(pos.getY(i)) / P.H);
      else uv.setXY(i, su, sv);
    }
    geo.clearGroups();
    return geo;
  };
  const mat = unlit ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshLambertMaterial({ map: tex });
  if (emit && !unlit) { mat.emissive = new THREE.Color(1, 1, 1).multiplyScalar(emit); mat.emissiveMap = tex; }   // festive paper that reads at night
  // preparing: the extruded sheet is cut later too (meshes start on an empty geometry; nothing is drawn before it is done)
  const mesh = new THREE.Mesh(st._jobs ? EMPTY_GEO : makeGeo(), mat), meshes = [mesh];
  if (st._jobs) st._jobs.push(() => { const g = makeGeo(); meshes.forEach(m => { m.geometry = g; }); });
  const c = { mesh, meshes, outline, P, tex, mat, reprint(pnt, nb) { painted = true; if (nb) baseCol = nb; draw(pnt); tex.needsUpdate = true; } };
  if (key) st._cache.set(key, c);
  return c;
}

/* ---------- hinge: everything paper moves by rotating about a crease ---------- */
export class Hinge {
  constructor(obj, { axis = 'x', flat = -Math.PI / 2, up = 0, onMove = null } = {}) {
    Object.assign(this, { obj, axis, flat, up, onMove, x: 0, v: 0, target: 0, delay: 0, w0: 12.5, z: .55 }); this.apply();
  }
  open(delay = 0) { this.target = 1; this.delay = delay; this.w0 = 12.5; this.z = .55; }   // ~12 % overshoot, still by ~0.9 s
  close(delay = 0) { this.target = 0; this.delay = delay; this.w0 = 11; this.z = .85; }    // softer, one small slap
  snap(x) { this.x = this.target = x; this.v = 0; this.delay = 0; this.apply(); }
  kick(v) { this.v += v; }
  step(dt) {
    if (this.delay > 0) { this.delay -= dt; return; }
    const a = -this.w0 * this.w0 * (this.x - this.target) - 2 * this.z * this.w0 * this.v;
    this.v += a * dt; this.x += this.v * dt;
    if (this.target === 0 && this.x < 0 && !this.island) { this.x = -this.x * .25; this.v = -this.v * .25; }
    this.apply();
  }
  get settled() { return this.delay <= 0 && Math.abs(this.x - this.target) < .002 && Math.abs(this.v) < .02; }
  apply() { this.obj.rotation[this.axis] = this.flat + (this.up - this.flat) * this.x; this.onMove && this.onMove(Math.max(0, Math.min(1.2, this.x))); }
}

/* ---------- springs for anything else that moves (positions, colours, flips) ---------- */
export class Spring {
  constructor(x = 0, w0 = 8, z = .7) { this.x = x; this.v = 0; this.target = x; this.w0 = w0; this.z = z; }
  step(dt) { const a = -this.w0 * this.w0 * (this.x - this.target) - 2 * this.z * this.w0 * this.v; this.v += a * dt; this.x += this.v * dt; return this.x; }
  snap(x) { this.x = this.target = x; this.v = 0; }
}

/* ---------- baked shadows ---------- */
function blobTex(st) {
  if (st._blob) return st._blob;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(26,20,56,1)'); gr.addColorStop(.55, 'rgba(26,20,56,.55)'); gr.addColorStop(1, 'rgba(26,20,56,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (st._blob = canvasTex(c, st));
}
/** shadow of a standing card, lying on the page, falling away from the guide light.
    Lives in the card's BASE group (position + yaw), not its hinge. Call .set(upright 0..1). */
export function groundShadow(st, outline, { away = [0, -1], len = .8, opacity = .5, contact = .55, blob = true } = {}) {
  const bb = bbox(outline), grp = new THREE.Group();
  const W = 48, H = 72, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const sx = W / (bb.w * 1.3), x0 = (W - bb.w * sx) / 2;
  const tex = canvasTex(c, st);
  const paintShadow = () => {
    g.fillStyle = 'rgb(26,20,56)'; g.beginPath();
    outline.forEach(([x, y], i) => { const px = x0 + (x - bb.x0) * sx, py = H - 4 - (Math.max(0, y) / Math.max(.01, bb.y1)) * (H - 8); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill();
    bakeBlur(c, 3); bakeBlur(c, 2.5);
    g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    tex.needsUpdate = true;
  };
  if (st._jobs) st._jobs.push(paintShadow); else paintShadow();
  const w = bb.w * 1.3, cx = (bb.x0 + bb.x1) / 2;
  const geo = new THREE.PlaneGeometry(w, 1); geo.rotateX(-Math.PI / 2); geo.translate(cx, .012, -.5);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false });
  const sh = new THREE.Mesh(geo, mat); sh.matrixAutoUpdate = false; sh.renderOrder = 1; grp.add(sh);
  let bl = null;
  if (blob) {
    bl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex(st), transparent: true, opacity: contact, depthWrite: false }));
    bl.scale.set(bb.w * 1.15 + .3, 1, .7); bl.position.set(cx, .014, 0); bl.renderOrder = 2; grp.add(bl);
  }
  const L = len * bb.y1; let a = away[0], b = away[1]; const n = Math.hypot(a, b) || 1; a /= n; b /= n;
  grp.set = (u) => {
    const k = Math.max(.001, u) * L;
    sh.matrix.set(1, 0, -a * k, 0, 0, 1, 0, 0, 0, 0, -b * k, 0, 0, 0, 0, 1);
    mat.opacity = opacity * Math.min(1, u * 1.4); if (bl) bl.material.opacity = contact * Math.min(1, u * 1.6);
  };
  grp.set(0);
  return grp;
}
/** direction on the page (base frame of a piece at pos with yaw) pointing away from the light */
export function awayFrom(lightPos, pos, yaw = 0) {
  const dx = pos.x - lightPos.x, dz = pos.z - lightPos.z, c = Math.cos(-yaw), s = Math.sin(-yaw);
  return [dx * c + dz * s, -dx * s + dz * c];
}

/* ====================================================================================
   REUSABLE PIECES. Every one returns a "piece" { base, group, hinge, ... } from stand().
   ==================================================================================== */

/** standing piece = base group (pos, yaw) > hinge group > card(s). Adds ground shadow + registers the hinge. */
export function stand(st, parent, { x = 0, y = 0, z = 0, yaw = 0, cards = [], shadowOutline, order = 0, shadow = {}, axis = 'x', flat, up = 0 }) {
  const base = new THREE.Group(); base.position.set(x, y, z); base.rotation.y = yaw; parent.add(base);
  const hg = new THREE.Group(); base.add(hg); cards.forEach(c => hg.add(c.mesh || c));
  let sh = null;
  if (shadowOutline) { sh = groundShadow(st, shadowOutline, { away: awayFrom(st.lightPos, base.position, yaw), ...shadow }); base.add(sh); }
  const h = st.hinge(hg, { order, axis, flat: flat ?? -Math.PI / 2, up, onMove: u => sh && sh.set(Math.sin(Math.min(1, u) * Math.PI / 2)) });
  return { base, hinge: h, group: hg, shadow: sh, cards };
}

/** floating page / island: a thick board with a torn edge, printed on top. Opens like a book page
    (hinged at its front edge, swings down from edge-on to the camera). outline: custom plan in (x, -z). */
export function island(st, parent, { rx = 9, rz = 6, outline = null, seed = 3, paint, ppu = 24, th = .3, blurFar = .3, blurNear = .8, blurPx = 4, side = false }) {
  const out = outline || torn(0, 0, rx, rz, seed);
  const bb = bbox(out);
  if (!side && !st._page) st._page = { min: [bb.x0, -th * 2.2, -bb.y1], max: [bb.x1, 0, -bb.y0] };   // world box of the main page (open pose)
  const c = card(st, {
    outline: out, base: PAL.ground, ppu, th, seed, fibre: 1.2, edge: '#231d36',
    paint: P => {
      paint && paint(P);
      // baked tilt-shift: the far (top of print) and near (bottom) rows go soft
      const g = P.g, t = document.createElement('canvas'); t.width = P.W; t.height = P.H; const tg = t.getContext('2d');
      tg.drawImage(P.canvas, 0, 0); bakeBlur(t, blurPx);
      tg.globalCompositeOperation = 'destination-in'; const gr = tg.createLinearGradient(0, 0, 0, P.H);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(blurFar, 'rgba(0,0,0,0)'); gr.addColorStop(blurNear, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.9)');
      tg.fillStyle = gr; tg.fillRect(0, 0, P.W, P.H); g.drawImage(t, 0, 0);
    }
  });
  c.mesh.rotation.x = -Math.PI / 2; c.mesh.position.y = -th / 2;
  const front = -bb.y0;   // world z of the front edge
  const pivot = new THREE.Group(); pivot.position.set(0, 0, front); parent.add(pivot);
  const inner = new THREE.Group(); inner.position.z = -front; pivot.add(inner); inner.add(c.mesh);
  const under = new THREE.Mesh(c.mesh.geometry, new THREE.MeshLambertMaterial({ color: '#211b33' })); c.meshes.push(under);
  under.rotation.x = -Math.PI / 2; under.position.set(.15, -th * 1.6 - .06, .12); under.scale.set(1.012, 1.018, 1); inner.add(under);
  const h = st.hinge(pivot, { axis: 'x', flat: Math.PI - st.pitch, up: 0, order: -1 });
  h.island = true;
  return { pivot, top: inner, hinge: h, card: c, outline: out };
}

/** landscape only: a smaller floating page beside the text box (left or right), lower and nearer than the
    main page, with its own soft warm lamp so it is not left in the dark. Returns the island + its group. */
export function sidePage(st, root, { x = -19, y = -4, z = 10, rx = 6, rz = 5, seed = 31, paint, lamp = 5, yaw = 0 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; g.userData.sidePage = true; root.add(g);
  const isl = island(st, g, { rx, rz, seed, paint, ppu: 26, blurFar: .2, blurNear: .9, blurPx: 3, side: true });
  isl.boost = 1;
  if (lamp) { const l = new THREE.PointLight(PAL.guide, 0, 0, 1); l.position.set(0, 5, 2); g.add(l); isl.lamp = l; st.onUpdate((t, dt) => { isl.k = (isl.k ?? 1) + (isl.boost - (isl.k ?? 1)) * Math.min(1, dt * 3); l.intensity = lamp * st.openness * isl.k; }); }
  isl.group = g;
  return isl;
}

/** the guide light: a cream paper star with a warm glow. It IS the key light AND the player's marker.
    flyTo(x, y, z) moves it on a spring; home() brings it back; flash(hex) tints it briefly. */
export function guide(st, parent, { x = 0, y = 4.5, z = 2, size = 1.3, power = 14 } = {}) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); parent.add(grp);
  const pts = star(.44 * size, .19 * size);
  const st1 = card(st, { outline: pts, base: '#FFF6D6', ppu: 90, th: .06, seed: 91, unlit: true, edge: '#E8D79A', paint: P => P.layer(P.poly(pts.map(([a, b]) => [a * .55, b * .55])), '#FFFBEA', { shadow: .3 }) });
  grp.add(st1.mesh);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const g = gc.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,241,176,.95)'); gr.addColorStop(.22, 'rgba(255,241,176,.4)'); gr.addColorStop(1, 'rgba(255,241,176,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(gc, st), color: PAL.guide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 }));
  glow.scale.setScalar(3.6 * size); grp.add(glow);
  const light = new THREE.PointLight(PAL.guide, 0, 0, 1); grp.add(light);
  st.lightPos.copy(grp.position); // shadows of pieces built after this fall away from here
  const home = grp.position.clone(), tgt = home.clone(), base = new THREE.Color(PAL.guide), tint = new THREE.Color();
  const sx = new Spring(home.x, 3.2, .8), sy = new Spring(home.y, 3.2, .8), sz = new Spring(home.z, 3.2, .8);
  const G = { group: grp, light, glow, star: st1, power, level: 0, pulse: 0, pulseCol: new THREE.Color(PAL.guide), boost: 1 };
  st.onUpdate((t, dt) => {
    G.level = st.reduce ? st.openness : G.level + (st.openness - G.level) * Math.min(1, dt * 4);
    sx.target = tgt.x; sy.target = tgt.y; sz.target = tgt.z;
    if (st.reduce) { sx.snap(tgt.x); sy.snap(tgt.y); sz.snap(tgt.z); } else { sx.step(dt); sy.step(dt); sz.step(dt); }
    const bob = st.reduce ? 0 : Math.sin(t * 1.3) * .12;
    grp.position.set(sx.x, sy.x + bob + (1 - G.level) * 2.2, sz.x);
    if (!st.reduce) st1.mesh.rotation.y = Math.sin(t * .7) * .35;
    G.pulse = Math.max(0, G.pulse - dt / 1.6);
    tint.copy(base).lerp(G.pulseCol, Math.sin(Math.min(1, G.pulse) * Math.PI / 2) * .55);
    light.color.copy(tint); glow.material.color.copy(tint);
    light.intensity = G.power * G.level * G.boost * (1 + G.pulse * .25);
    glow.material.opacity = .85 * G.level;
    st1.mesh.visible = G.level > .02;
  });
  G.flash = (hex) => { G.pulseCol.set(hex); G.pulse = 1; };
  G.flyTo = (x, y, z) => { tgt.set(x, y, z); };
  G.home = (snap) => { tgt.copy(home); if (snap) { sx.snap(home.x); sy.snap(home.y); sz.snap(home.z); } };
  return G;
}

/** a paper townsperson (not the hero): head + body in one cut card, scarf / coat accent.
    colour: accent hex (toned by level); back: seen from behind (no face). Turn with piece.base.rotation.y */
export function person(st, parent, { x = 0, z = 0, yaw = 0, h = 2.6, colour = null, level = .3, seed = 1, back = false, order = 0, kind = 0, shadow = true, arms = false, twoSided = false }) {
  const R = rng(seed * 7 + 3), bw = h * (.36 + R() * .08), tw = h * (.22 + R() * .05), sh = h * .58, r = h * (.15 + R() * .02), cy = sh + r * .95;
  const out = [[-bw / 2, 0], [bw / 2, 0], [tw / 2, sh * .86], [tw * .38, sh], [r * .45, sh]];
  for (let i = 0; i <= 14; i++) { const a = -0.95 + i / 14 * (Math.PI + 1.9); out.push([Math.cos(a) * r, cy + Math.sin(a) * r]); }
  out.push([-r * .45, sh], [-tw * .38, sh], [-tw / 2, sh * .86]);
  if (arms) { out.splice(3, 0, [tw / 2 + h * .12, sh * 1.18], [tw / 2 + h * .2, sh * 1.12], [tw / 2 + .06, sh * .72]); }
  const coat0 = [PAL.mid, PAL.dark, mix(PAL.mid, PAL.light, .5), PAL.deep][kind % 4], backDefault = back; let coat = coat0;
  const acc = colour ? tone(colour, level) : mix(PAL.light, PAL.cream, .3);
  const paint = (accent, back = backDefault) => P => {
    P.layer(P.poly([[-bw * .42, 0], [bw * .42, 0], [tw * .4, sh * .82], [-tw * .4, sh * .82]]), shade(coat, .9), { shadow: .4 });
    P.layer(P.poly(ribbon([[-tw * .5, sh * .88], [0, sh * .8], [tw * .5, sh * .88]], h * .07)), accent, { shadow: .5 }); // scarf
    P.layer(P.circle(0, cy, r * .98), back ? PAL.hair : PAL.skin, { shadow: .3 });
    if (!back) {
      P.layer(P.poly([[-r, cy + r * .1], [r, cy + r * .1], [r * .8, cy + r * .8], [0, cy + r * 1.02], [-r * .8, cy + r * .8]]), PAL.hair, { shadow: .3 });
      [-1, 1].forEach(s => P.layer(P.circle(s * r * .36, cy - r * .12, r * .11), PAL.ink, { shadow: 0, lip: 0 }));
    } else P.layer(P.poly([[-r * .7, cy - r * .3], [r * .7, cy - r * .3], [r * .5, cy - r * .7], [-r * .5, cy - r * .7]]), shade(PAL.hair, .85), { shadow: .2 });
    [.3, .5].forEach(y => P.layer(P.circle(0, sh * y, h * .025), PAL.cream, { shadow: .2, lip: 0 }));
  };
  const c = card(st, { outline: out, base: coat, ppu: 54, seed: seed + 400, paint: paint(acc) });
  const cards = [c];
  let cb = null;   // two-sided: a back print (hair, no face) glued behind, so a figure can turn round
  if (twoSided) { cb = card(st, { outline: out.map(([a, b]) => [-a, b]), base: coat, ppu: 40, seed: seed + 401, paint: paint(acc, true) }); cb.mesh.rotation.y = Math.PI; cb.mesh.position.z = -.075; cards.push(cb); }
  const p = stand(st, parent, { x, z, yaw, cards, shadowOutline: shadow ? out : null, order, shadow: { len: .6, opacity: .42, blob: true } });
  p.card = c; p.h = h;
  /* coatMix > 0 also tints the coat ("getting their colour back"), 0 restores the grey coat */
  p.recolour = (hex, lv = 1, coatMix = 0) => { const a = hex ? tone(hex, lv) : acc; coat = coatMix && hex ? mix(coat0, tone(hex, lv), coatMix) : coat0; c.reprint(paint(a), coat); if (cb) cb.reprint(paint(a, true), coat); };
  return p;
}

/** building facade with a side wall (and flat roof): a box fold. windows lit per index via setLit().
    back: { colour } makes the facade two-sided (grey front / coloured back) for flip(). */
export function building(st, parent, { x = 0, z = 0, yaw = 0, w = 4, h = 6, d = 2.5, roof = 'flat', cols = 3, rows = 3, base = PAL.light, level = 0, accent = null, seed = 1, order = 0, lit = 0, litCol = PAL.winLit, door = true, awning = null, blur = 0, side = true, back = null, ppu = 30 }) {
  const R = rng(seed * 13 + 1);
  const out = roof === 'gable' ? [[-w / 2, 0], [w / 2, 0], [w / 2, h * .82], [0, h], [-w / 2, h * .82]]
    : roof === 'step' ? [[-w / 2, 0], [w / 2, 0], [w / 2, h * .9], [w * .3, h * .9], [w * .3, h], [-w * .3, h], [-w * .3, h * .9], [-w / 2, h * .9]]
    : [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]];
  const top = roof === 'flat' ? h : h * (roof === 'gable' ? .82 : .9);
  const wins = []; const ww = w / (cols * 1.7 + .7), wh = Math.min(ww * 1.35, (top - 1.4) / (rows * 1.55));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) wins.push([-w / 2 + ww * .85 + c * ww * 1.7, 1.5 + r * wh * 1.55, ww, wh]);
  const order0 = wins.map((_, i) => i).sort(() => R() - .5);
  let nLit = lit, colLit = litCol;
  const facade = (front) => P => {
    const acc = accent ? tone(accent, front ? level : 1) : null;
    P.layer(P.rect(-w / 2, top - .35, w, .35), shade(base, .82), { shadow: .6 });                  // cornice
    P.layer(P.rect(-w / 2, 0, w, .3), shade(base, .78), { shadow: .4 });                            // plinth
    if (roof === 'gable') P.layer(P.poly([[-w / 2, top], [w / 2, top], [0, h]]), shade(base, .7), { shadow: .5 });
    wins.forEach(([wx, wy, a, b], i) => {
      const on = front ? order0.indexOf(i) < nLit : true;
      P.layer(P.rect(wx - .07, wy - .07, a + .14, b + .14), shade(base, .72), { shadow: .4, lip: .6 });
      P.layer(P.rect(wx, wy, a, b), on ? (front ? colLit : mix(acc || colLit, PAL.cream, .35)) : PAL.win, { shadow: .5, lip: on ? .2 : .6 });
      if (on) P.glowDot(wx + a / 2, wy + b / 2, a * 1.1, front ? colLit : (acc || colLit), .35);
      P.layer(P.rect(wx + a / 2 - .03, wy, .06, b), shade(base, .72), { shadow: 0, lip: 0 });
    });
    if (door) { P.layer(P.poly([[-.45, .3], [.45, .3], [.45, 1.25], [0, 1.45], [-.45, 1.25]]), PAL.win, { shadow: .6 }); P.layer(P.circle(.25, .8, .06), PAL.cream, { shadow: .2, lip: 0 }); }
    if (acc && (awning || !front)) P.layer(P.poly([[-w * .42, 1.42], [w * .42, 1.42], [w * .48, 1.05], [-w * .48, 1.05]]), acc, { shadow: .8 });
    else if (awning) P.layer(P.poly([[-w * .42, 1.42], [w * .42, 1.42], [w * .48, 1.05], [-w * .48, 1.05]]), awning, { shadow: .8 });
  };
  const fBase = back ? base : base;
  const f = card(st, { outline: out, base: fBase, ppu, seed, blur, paint: facade(true) });
  const cards = [f];
  let bk = null;
  if (back) { bk = card(st, { outline: out, base: mix(base, back.colour, back.mix ?? .62), ppu, seed: seed + 1, blur, emit: back.emit ?? .22, paint: facade(false) }); bk.mesh.rotation.y = Math.PI; bk.mesh.position.z = -.08; cards.push(bk); }
  let sd = null;
  if (side) {
    const so = [[0, 0], [d, 0], [d, top], [0, top]];
    sd = card(st, { outline: so, base: shade(base, .8), ppu: ppu * .7, seed: seed + 2, blur, paint: P => { for (let r = 0; r < rows; r++) P.layer(P.rect(d * .35, 1.5 + r * wh * 1.55, d * .3, wh), PAL.win, { shadow: .4, lip: .5 }); } });
    sd.mesh.rotation.y = Math.PI / 2; sd.mesh.position.set(w / 2 - .03, 0, -.04); cards.push(sd);
    if (roof === 'flat') { const rf = card(st, { outline: [[-w / 2, 0], [w / 2, 0], [w / 2, d], [-w / 2, d]], base: shade(base, .62), ppu: ppu * .5, seed: seed + 3, blur, rim: false }); rf.mesh.rotation.x = -Math.PI / 2; rf.mesh.position.set(0, top - .02, -.02); cards.push(rf); }
  }
  const p = stand(st, parent, { x, z, yaw, cards, shadowOutline: out, order, shadow: { len: .55, opacity: .45 } });
  p.front = f; p.back = bk; p.sideCard = sd; p.w = w; p.h = h; p.windows = wins.length;
  p.setLit = (n, col) => { nLit = n; if (col) colLit = col; f.reprint(facade(true)); };
  return p;
}

/** folded archway with an opening (lane gates, stage frames). clue: a colour band + symbol on the lintel */
export function arch(st, parent, { x = 0, z = 0, yaw = 0, w = 3, h = 3.6, open = 1.7, colour = null, level = .4, symbol = null, seed = 1, order = 0, base = PAL.light, ppu = 44, blur = 0 }) {
  const out = [[-w / 2, 0], [w / 2, 0], [w / 2, h * .8], [w * .3, h], [-w * .3, h], [-w / 2, h * .8]];
  const ow = open / 2, oh = h * .62, hole = [[-ow, 0], [ow, 0], [ow, oh - ow * .4]];
  for (let i = 1; i < 10; i++) { const a = i / 10 * Math.PI; hole.push([Math.cos(a) * ow, oh - ow * .4 + Math.sin(a) * ow * .9]); }
  hole.push([-ow, oh - ow * .4]);
  const paint = (lv) => P => {
    for (let i = 0; i < 5; i++) [-1, 1].forEach(s => P.layer(P.rect(s * (ow + .08) + (s < 0 ? -(w / 2 - ow - .16) : 0), .2 + i * (oh / 5), w / 2 - ow - .16, oh / 5 - .1), shade(base, i % 2 ? .9 : .84), { shadow: .4, lip: .5 }));
    const c = colour ? tone(colour, lv) : PAL.mid;
    P.layer(P.poly([[-w / 2 + .1, h * .8 - .5], [w / 2 - .1, h * .8 - .5], [w / 2 - .1, h * .8 - .15], [w * .3, h - .12], [-w * .3, h - .12], [-w / 2 + .1, h * .8 - .15]]), c, { shadow: .6 });
    P.layer(P.circle(0, h * .82, .32), mix(c, PAL.cream, .55), { shadow: .5 });
    if (symbol) symbol(P, 0, h * .82, .3, shade(c, .7));
  };
  const c = card(st, { outline: out, holes: [hole], base, ppu, seed, blur, paint: paint(level) });
  const p = stand(st, parent, { x, z, yaw, cards: [c], shadowOutline: out, order, shadow: { len: .5, opacity: .42 } });
  p.card = c; p.repaint = (lv) => c.reprint(paint(lv));
  return p;
}

/** text-free symbol marks for each major (drawn inside a circle of radius r) */
export function symbolFor(m) {
  return (P, x, y, r, col) => {
    const s = r / .3, L = (pts) => pts.map(([a, b]) => [x + a * s, y + b * s]);
    if (m === 'DGA') P.layer(P.poly(ribbon(L([[-.16, -.12], [-.02, .02], [.16, .12]]), .08 * s)), col, { shadow: 0, lip: 0 });
    else if (m === 'DGD') { P.layer(P.rect(x - .14 * s, y - .12 * s, .17 * s, .17 * s), col, { shadow: 0, lip: 0 }); P.layer(P.circle(x + .06 * s, y + .05 * s, .09 * s), col, { shadow: 0, lip: 0 }); }
    else if (m === 'IGD') { P.layer(P.rect(x - .16 * s, y - .05 * s, .32 * s, .1 * s), col, { shadow: 0, lip: 0 }); P.layer(P.rect(x - .05 * s, y - .16 * s, .1 * s, .32 * s), col, { shadow: 0, lip: 0 }); }
    else if (m === 'AFX') { P.layer(P.poly(L([[-.12, -.14], [.16, 0], [-.12, .14]])), col, { shadow: 0, lip: 0 }); }
    else { P.layer(P.circle(x - .06 * s, y - .09 * s, .07 * s), col, { shadow: 0, lip: 0 }); P.layer(P.rect(x, y - .09 * s, .045 * s, .25 * s), col, { shadow: 0, lip: 0 }); P.layer(P.rect(x, y + .11 * s, .14 * s, .05 * s), col, { shadow: 0, lip: 0 }); }
  };
}

/** blank sign on a post (no letters): shape 'rect' | 'circle' | 'diamond' | 'arrow' | 'shield' */
export function signPost(st, parent, { x = 0, z = 0, yaw = 0, shape = 'rect', w = 1.6, hBoard = 1, post = 2.4, colour = null, level = .3, symbol = null, seed = 1, order = 0, base = PAL.light }) {
  const by = post, cx = 0, cy = by + hBoard / 2, hw = w / 2, hh = hBoard / 2;
  const board = shape === 'circle' ? ellipse(cx, cy, hw, hh, 22) : shape === 'diamond' ? [[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]]
    : shape === 'arrow' ? [[-hw, cy - hh], [hw * .55, cy - hh], [hw, cy], [hw * .55, cy + hh], [-hw, cy + hh]]
    : shape === 'shield' ? [[-hw, cy + hh], [hw, cy + hh], [hw, cy - hh * .2], [0, cy - hh], [-hw, cy - hh * .2]]
    : [[-hw, cy - hh], [hw, cy - hh], [hw, cy + hh], [-hw, cy + hh]];
  const pole = [[-.1, 0], [.1, 0], [.1, by + .05], [-.1, by + .05]];
  const pc = card(st, { outline: pole, base: PAL.dark, ppu: 40, seed: seed + 5 });
  const paint = (lv) => P => {
    const c = colour ? tone(colour, lv) : PAL.mid;
    P.layer(P.poly(board.map(([a, b]) => [cx + (a - cx) * .78, cy + (b - cy) * .72])), c, { shadow: .6 });
    if (symbol) symbol(P, cx, cy, Math.min(hw, hh) * .5, mix(c, PAL.cream, .7));
  };
  const bc = card(st, { outline: board, base, ppu: 56, seed, paint: paint(level) }); bc.mesh.position.z = .06;
  const p = stand(st, parent, { x, z, yaw, cards: [pc, bc], shadowOutline: [[-hw * .7, 0], [hw * .7, 0], [hw * .7, by + hBoard], [-hw * .7, by + hBoard]], order, shadow: { len: .5, opacity: .4, blob: false } });
  p.board = bc; p.repaint = (lv) => bc.reprint(paint(lv));
  return p;
}

/** lamp post with a paper lantern (cream, unlit material = it glows in the print) */
export function lampPost(st, parent, { x = 0, z = 0, yaw = 0, h = 3.6, colour = null, seed = 1, order = 0, lit = true }) {
  const pole = [[-.09, 0], [.09, 0], [.07, h], [-.07, h]];
  const pc = card(st, { outline: [[-.3, 0], [.3, 0], [.12, .35], [.09, h], [-.09, h], [-.12, .35]], base: PAL.dark, ppu: 40, seed, key: 'lamp-pole-' + h });
  const lo = ellipse(0, h + .35, .3, .38, 16);
  const lc = card(st, { outline: lo, base: lit ? (colour ? mix(PAL.winLit, colour, .35) : PAL.winLit) : PAL.mid, ppu: 60, seed: seed + 1, unlit: lit, paint: P => { P.layer(P.rect(-.3, h + .3, .6, .08), shade(PAL.dark, .9), { shadow: .3 }); P.layer(P.rect(-.12, h + .7, .24, .1), PAL.dark, { shadow: .3 }); } });
  lc.mesh.position.z = .03;
  return stand(st, parent, { x, z, yaw, cards: [pc, lc], shadowOutline: pole, order, shadow: { len: .45, opacity: .38, blob: false } });
}

/** bunting: a string between two points (world, on parent) with triangle flags that drop down on hinges */
export function bunting(st, parent, { a, b, sag = .8, n = 9, colours = null, level = .4, seed = 1, order = 0, size = .5 }) {
  const grp = new THREE.Group(); parent.add(grp);
  const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, a[2] + (b[2] - a[2]) * t)); }
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .03, 4), st.flatMat(PAL.ink)); grp.add(tube);
  const flags = [], R = rng(seed);
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, pz = a[2] + (b[2] - a[2]) * t;
    const col = colours ? colours[(i - 1) % colours.length] : null;
    const out = [[-size * .5, 0], [size * .5, 0], [0, -size * 1.1]];
    const mk = (lv) => P => P.layer(P.circle(0, -size * .35, size * .12), PAL.cream, { shadow: .3, lip: 0 });
    const c = card(st, { outline: out, base: col ? tone(col, level) : (i % 2 ? PAL.light : PAL.mid), ppu: 44, th: .04, seed: seed + i, paint: mk(level), emit: col ? .4 * level : 0 });
    const base = new THREE.Group(); base.position.set(px, py, pz); base.rotation.y = Math.atan2(-(b[2] - a[2]), b[0] - a[0]); grp.add(base);
    const hg = new THREE.Group(); hg.add(c.mesh); base.add(hg);
    const h = st.hinge(hg, { order: order + i * .1, flat: -Math.PI / 2, up: 0 });
    const ph = R() * 6;
    st.onUpdate(t => { if (!st.reduce && h.settled) hg.rotation.x = Math.sin(t * 1.4 + ph) * .06; });
    flags.push({ c, hinge: h, col });
  }
  return { group: grp, flags, recolour(cols, lv = 1) { flags.forEach((f, i) => { const col = cols[i % cols.length]; f.c.reprint(P => P.layer(P.circle(0, -size * .35, size * .12), PAL.cream, { shadow: .3, lip: 0 }), col ? tone(col, lv) : (i % 2 ? PAL.light : PAL.mid)); }); } };
}

/** smoke / cloud puffs: layered lobed cards, slow drift */
export function puff(st, parent, { x = 0, y = 0, z = 0, w = 2, h = 1.2, colour = PAL.light, seed = 1, order = 0, layers = 2 }) {
  const cards = [];
  for (let i = 0; i < layers; i++) { const c = card(st, { outline: cloud(w * (1 - i * .18), h * (1 - i * .15), 3 + i, seed + i), base: shade(colour, 1 - i * .08 + .04), ppu: 36, th: .05, seed: seed + i, paint: P => P.layer(P.poly(cloud(w * .6, h * .5, 3, seed + 9).map(([a, b]) => [a, b + h * .15])), mix(colour, PAL.cream, .3), { shadow: .3 }) }); c.mesh.position.set(i * .15, 0, -i * .12); cards.push(c); }
  const p = stand(st, parent, { x, y, z, cards, order });
  const ph = rng(seed)() * 6; st.onUpdate(t => { if (!st.reduce) p.base.position.y = y + Math.sin(t * .6 + ph) * .12; });
  return p;
}

/** life: small paper flakes drifting and turning (one InstancedMesh = one draw call) */
export function motes(st, parent, { n = 24, box = [[-8, 1, -6], [8, 6, 4]], colours = [PAL.cream], size = .14, speed = .25, seed = 3 }) {
  const geo = new THREE.PlaneGeometry(size, size * 1.4); const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  const im = new THREE.InstancedMesh(geo, mat, n); parent.add(im);
  const R = rng(seed), D = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
  for (let i = 0; i < n; i++) { D.push({ p: [box[0][0] + R() * (box[1][0] - box[0][0]), box[0][1] + R() * (box[1][1] - box[0][1]), box[0][2] + R() * (box[1][2] - box[0][2])], ph: R() * 6, sp: .6 + R() * .8 }); im.setColorAt(i, col.set(colours[i % colours.length])); }
  const M = { mesh: im, visibleLevel: 1, setColours(cs) { for (let i = 0; i < n; i++) im.setColorAt(i, col.set(cs[i % cs.length])); im.instanceColor.needsUpdate = true; } };
  st.onUpdate((t) => {
    D.forEach((d, i) => {
      const k = st.reduce ? 0 : t * speed * d.sp;
      v.set(d.p[0] + Math.sin(k + d.ph) * .6, d.p[1] + Math.sin(k * .7 + d.ph * 2) * .4, d.p[2] + Math.cos(k * .8 + d.ph) * .4);
      e.set(k * 1.3 + d.ph, k + d.ph, 0); q.setFromEuler(e);
      m4.compose(v, q, one.set(st.openness, st.openness, st.openness)); im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  return M;
}

/** a soft beam of tissue paper (stage lights, the colour beam in 5.2): two crossed translucent strips */
export function beam(st, parent, { x = 0, y = 0, z = 0, h = 14, w = 1.6, w2 = 3, colour = PAL.guide, opacity = .45, tilt = 0 }) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 128);
  const gx = g.createLinearGradient(0, 0, 32, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.3, 'rgba(0,0,0,0)'); gx.addColorStop(.7, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, 32, 128);
  const tex = canvasTex(c, st);
  const geo = new THREE.BufferGeometry(); const p = [-w / 2, 0, 0, w / 2, 0, 0, w2 / 2, h, 0, -w2 / 2, h, 0]; geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); geo.setIndex([0, 1, 2, 0, 2, 3]);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: colour, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.z = tilt; parent.add(grp);
  const a = new THREE.Mesh(geo, mat), b = new THREE.Mesh(geo, mat); b.rotation.y = Math.PI / 2; grp.add(a, b); a.renderOrder = b.renderOrder = 5;
  return { group: grp, mat };
}

/** reaction helper: small coloured paper markers popping up along a list of points */
export function popRow(st, parent, pts, { colour, seed = 5, delay = 0, step = .09, size = .7 }) {
  const R = rng(seed), out = [];
  pts.forEach(([x, z], k) => {
    const h = size * (.8 + R() * .4), shp = k % 3 === 0 ? [[-.24, 0], [.24, 0], [0, h]] : k % 3 === 1 ? [[-.2, 0], [.2, 0], [.2, h * .7], [0, h], [-.2, h * .7]] : ellipse(0, h * .5, .22, h * .5, 12);
    const c = card(st, { outline: shp, base: colour, ppu: 44, th: .05, seed: seed + k, paint: P => P.layer(P.circle(0, h * .45, .08), PAL.cream, { shadow: .4 }) });
    const s = stand(st, parent, { x, z, yaw: R() * .5 - .25, cards: [c], shadowOutline: shp, shadow: { len: .6, opacity: .4, blob: false } });
    if (st.reduce) s.hinge.snap(1); else s.hinge.open(delay + k * step);
    out.push(s);
  });
  return out;
}

/** take a standing piece out of the scene and free its GPU memory (cached prints are kept) */
export function removePiece(st, s) {
  if (s.base.parent) s.base.parent.remove(s.base);
  st.hinges = st.hinges.filter(h => h !== s.hinge);
  const keep = new Set([...st._cache.values()].map(c => c.mat));
  s.base.traverse(n => {
    if (n.geometry && !n.geometry.userData.keep) n.geometry.dispose();
    [].concat(n.material || []).forEach(m => { if (keep.has(m) || st._flat.has(m)) return; if (m.map && m.map !== st._blob) m.map.dispose(); m.dispose(); });
  });
}
/** fade a group toward grey ("other lanes dim"): multiplies material colour, k 1 = normal, ~.5 = dim */
export function dimGroup(group, k) { group.traverse(n => { if (n.isMesh && n.material && n.material.color && n.material.blending !== THREE.AdditiveBlending && !n.material.isMeshBasicMaterial) n.material.color.setScalar(k); }); }

/* ---------- batching: plain cards are drawn through a few BatchedMeshes ----------
   Every card print goes into texture atlas pages; cards that share a kind (lit / unlit / ground shadow) and a page
   are drawn in ONE draw call. The original meshes stay in the scene graph (on layer 1, so the camera skips them) and
   keep driving everything: each frame their world matrix, colour, opacity and visibility are copied to their
   instance. A card whose material is changed in a way an instance cannot follow (new texture, emissive, opacity on
   an opaque card...) is handed back to normal drawing ("ejected"). A reprinted card is re-copied into its atlas page;
   a card reprinted very often is ejected too. */
const ATLAS_G = 4;                         // gutter around each print (mip-map bleed)
const HIDDEN_LAYER = 1;
const kindOf = (n) => {
  if (!n.isMesh || n.isBatchedMesh || n.isInstancedMesh || n.isSkinnedMesh) return null;
  const m = n.material, g = n.geometry;
  if (!m || Array.isArray(m) || !g || !g.attributes.position || !g.attributes.uv || !g.attributes.normal) return null;
  if (g.morphAttributes && Object.keys(g.morphAttributes).length) return null;
  if (n.layers.mask !== 1 || Object.prototype.hasOwnProperty.call(n, 'onBeforeRender')) return null;
  if (Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile') || m.alphaMap || m.envMap || m.lightMap || m.aoMap || m.vertexColors || m.polygonOffset || m.side === THREE.BackSide) return null;
  if (m.blending !== THREE.NormalBlending || !m.depthTest) return null;
  const t = m.map;
  if (t && (!(t.image && t.image.getContext) || t.repeat.x !== 1 || t.repeat.y !== 1 || t.offset.x || t.offset.y || t.rotation || !t.flipY)) return null;
  if (m.isMeshLambertMaterial && !m.transparent && m.opacity === 1 && m.depthWrite) {
    const e = m.emissive;
    if (m.emissiveMap ? (m.emissiveMap !== t || e.r !== e.g || e.g !== e.b) : (e.r || e.g || e.b)) return null;
    return m.side === THREE.DoubleSide ? 'litD' : 'lit';
  }
  if (m.isMeshBasicMaterial && !m.transparent && m.opacity === 1 && m.depthWrite) return m.side === THREE.DoubleSide ? 'unlitD' : 'unlit';
  if (m.isMeshBasicMaterial && m.transparent && !m.depthWrite && (n.renderOrder === 1 || n.renderOrder === 2) && m.side === THREE.FrontSide) return 'shade';
  return null;
};
const matSig = m => [m.map, m.emissiveMap, m.emissive ? m.emissive.r + m.emissive.g * 2 + m.emissive.b * 3 : 0, m.transparent, m.transparent ? 0 : m.opacity, m.side, m.depthWrite, m.blending];
const sameSig = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; };

class Batcher {
  constructor(st, root) {
    this.st = st; this.root = root; this.items = []; this.regions = []; this.pages = []; this.batches = [];
    this.group = new THREE.Group(); this.group.name = 'paper-batches'; this.ejected = 0; this.size = 2048;
  }
  /** returns a list of small tasks (run them in order, any number per frame) */
  plan() {
    const st = this.st, S = this.size = Math.min(2048, st.renderer.capabilities.maxTextureSize || 2048);
    const byTex = new Map(); let white = null;
    this.root.traverse(n => {
      const kind = kindOf(n); if (!kind) return;
      const m = n.material, t = m.map;
      let reg = t ? byTex.get(t) : white;
      if (!reg) {
        reg = t ? { tex: t, w: t.image.width, h: t.image.height, emit: 0 } : { white: true, w: 8, h: 8, emit: 0 };
        if (reg.w + 2 * ATLAS_G > S || reg.h + 2 * ATLAS_G > S) reg.bad = true;
        reg.id = this.regions.length; this.regions.push(reg);
        if (t) byTex.set(t, reg); else white = reg;
      }
      if (reg.bad) return;
      if (m.emissiveMap) reg.emit = Math.max(reg.emit, m.emissive.r);
      this.items.push({ mesh: n, mat: m, kind, reg, sig: matSig(m), dead: false, vis: null, m: new Float32Array(16).fill(NaN), c: [NaN, NaN, NaN, NaN] });
    });
    // shelf packing, tallest first
    const regs = this.regions.filter(r => !r.bad).sort((a, b) => b.h - a.h);
    let page = null, x = 0, y = 0, shelf = 0;
    const newPage = () => { page = { regs: [], emit: false }; this.pages.push(page); x = 0; y = 0; shelf = 0; };
    newPage();
    regs.forEach(r => {
      const w = r.w + 2 * ATLAS_G, h = r.h + 2 * ATLAS_G;
      if (x + w > S) { x = 0; y += shelf; shelf = 0; }
      if (y + h > S) newPage();
      r.page = page; r.x = x + ATLAS_G; r.y = y + ATLAS_G; page.regs.push(r); if (r.emit) page.emit = true;
      x += w; shelf = Math.max(shelf, h);
    });
    const tasks = [];
    this.pages.forEach(pg => {
      tasks.push(() => {
        pg.cv = document.createElement('canvas'); pg.cv.width = pg.cv.height = S; pg.g = pg.cv.getContext('2d');
        if (pg.emit) { pg.ecv = document.createElement('canvas'); pg.ecv.width = pg.ecv.height = S; pg.eg = pg.ecv.getContext('2d'); pg.eg.fillStyle = '#000'; pg.eg.fillRect(0, 0, S, S); }
      });
      for (let i = 0; i < pg.regs.length; i += 16) { const part = pg.regs.slice(i, i + 16); tasks.push(() => part.forEach(r => this.blit(r))); }
      tasks.push(() => {
        const mk = cv => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, st.renderer.capabilities.getMaxAnisotropy()); return t; };
        pg.tex = mk(pg.cv); if (pg.emit) pg.etex = mk(pg.ecv);
      });
    });
    // one BatchedMesh per (kind, page)
    const groups = new Map();
    this.items.forEach(it => { const k = it.kind + '|' + this.pages.indexOf(it.reg.page); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });
    groups.forEach((list, k) => tasks.push(() => this.makeBatch(list, k.split('|')[0], list[0].reg.page)));
    return tasks;
  }
  blit(r) {
    const pg = r.page, g = pg.g, G = ATLAS_G;
    if (r.white) { g.fillStyle = '#fff'; g.fillRect(r.x - G, r.y - G, r.w + 2 * G, r.h + 2 * G); r.ver = 0; return; }
    const img = r.tex.image;
    g.clearRect(r.x - G, r.y - G, r.w + 2 * G, r.h + 2 * G);
    g.drawImage(img, r.x - G, r.y - G, r.w + 2 * G, r.h + 2 * G); g.drawImage(img, r.x, r.y);
    if (pg.eg) {
      const e = pg.eg; e.globalCompositeOperation = 'source-over'; e.fillStyle = '#000'; e.fillRect(r.x - G, r.y - G, r.w + 2 * G, r.h + 2 * G);
      if (r.emit) { e.drawImage(img, r.x - G, r.y - G, r.w + 2 * G, r.h + 2 * G); e.drawImage(img, r.x, r.y); e.fillStyle = 'rgba(0,0,0,' + (1 - Math.pow(Math.min(1, r.emit), 1 / 2.2)) + ')'; /* strength is linear light, the canvas is sRGB */ e.fillRect(r.x - G, r.y - G, r.w + 2 * G, r.h + 2 * G); }
    }
    r.ver = r.tex.version;
  }
  geomFor(g, r, cache) {
    const key = g.uuid + '|' + r.id; if (cache.has(key)) return cache.get(key);
    const src = g.index ? g.toNonIndexed() : g, n = src.attributes.position.count, S = this.size;
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', src.attributes.position.clone()); out.setAttribute('normal', src.attributes.normal.clone());
    const uv = src.attributes.uv, a = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      if (r.white) { a[i * 2] = (r.x + 4) / S; a[i * 2 + 1] = 1 - (r.y + 4) / S; continue; }
      a[i * 2] = (r.x + uv.getX(i) * r.w) / S; a[i * 2 + 1] = 1 - (r.y + (1 - uv.getY(i)) * r.h) / S;
    }
    out.setAttribute('uv', new THREE.BufferAttribute(a, 2));
    if (src !== g) src.dispose();
    cache.set(key, out); return out;
  }
  makeBatch(list, kind, pg) {
    const cache = new Map(); let verts = 0;
    list.forEach(it => { const gg = this.geomFor(it.mesh.geometry, it.reg, cache); if (!gg.userData.counted) { gg.userData.counted = true; verts += gg.attributes.position.count; } it.geo = gg; });
    let mat;
    const side = kind.endsWith('D') ? THREE.DoubleSide : THREE.FrontSide;
    if (kind.startsWith('lit')) { mat = new THREE.MeshLambertMaterial({ map: pg.tex, side }); if (pg.etex) { mat.emissiveMap = pg.etex; mat.emissive.setRGB(1, 1, 1); } }
    else if (kind === 'shade') mat = new THREE.MeshBasicMaterial({ map: pg.tex, transparent: true, depthWrite: false });
    else mat = new THREE.MeshBasicMaterial({ map: pg.tex, side });
    const b = new THREE.BatchedMesh(list.length, verts, 0, mat);
    b.frustumCulled = false; b.perObjectFrustumCulled = true; b.sortObjects = true;
    if (kind === 'shade') b.renderOrder = 1;
    const ids = new Map(), white = new THREE.Vector4(1, 1, 1, 1);
    list.forEach(it => {
      let gid = ids.get(it.geo); if (gid === undefined) { gid = b.addGeometry(it.geo); ids.set(it.geo, gid); }
      it.b = b; it.id = b.addInstance(gid); b.setColorAt(it.id, white);
      it.mesh.layers.set(HIDDEN_LAYER);
    });
    cache.forEach(g => g.dispose());          // the batch keeps its own copy of the vertices
    this.batches.push(b); this.group.add(b);
  }
  /** send only this print's rectangle to the GPU (a whole 2048 page would stall weak GPUs); falls back to a full upload */
  upload(r, tex, cv) {
    const R = this.st.renderer, gl = R.getContext(), pr = R.properties.get(tex), G = ATLAS_G;
    if (!pr.__webglTexture || !gl.texSubImage2D || tex.version === 0) { tex.needsUpdate = true; return; }
    const x = r.x - G, y = r.y - G, w = r.w + 2 * G, h = r.h + 2 * G;
    const sub = Batcher._sub || (Batcher._sub = document.createElement('canvas'));
    if (sub.width !== w || sub.height !== h) { sub.width = w; sub.height = h; }
    const g = sub.getContext('2d'); g.clearRect(0, 0, w, h); g.drawImage(cv, x, y, w, h, 0, 0, w, h);
    const S = R.state;
    S.bindTexture(gl.TEXTURE_2D, pr.__webglTexture);
    S.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); S.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    S.pixelStorei(gl.UNPACK_ALIGNMENT, 4); S.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, this.size - y - h, gl.RGBA, gl.UNSIGNED_BYTE, sub);
    if (tex.generateMipmaps && tex.minFilter !== THREE.LinearFilter && tex.minFilter !== THREE.NearestFilter) gl.generateMipmap(gl.TEXTURE_2D);
  }
  eject(it) { if (it.dead) return; it.dead = true; if (it.b) it.b.setVisibleAt(it.id, false); it.mesh.layers.set(0); this.ejected++; }
  /** copy matrices / colours / visibility from the originals; returns true if anything changed */
  sync(sceneRef) {
    let ch = false;
    const now = performance.now(), v4 = Batcher._v4 || (Batcher._v4 = new THREE.Vector4());
    for (const r of this.regions) {
      if (r.bad || r.white || !r.page || !r.page.tex || r.tex.version === r.ver) continue;
      r.hits = (r.hits || []).filter(t => now - t < 4000); r.hits.push(now);
      if (r.hits.length > 5) { r.bad = true; this.items.forEach(it => it.reg === r && this.eject(it)); ch = true; continue; }
      this.blit(r); this.upload(r, r.page.tex, r.page.cv); if (r.page.etex) this.upload(r, r.page.etex, r.page.ecv); ch = true;
    }
    for (const it of this.items) {
      if (it.dead || !it.b) continue;
      const n = it.mesh, m = n.material;
      if (m !== it.mat || !sameSig(matSig(m), it.sig)) { this.eject(it); ch = true; continue; }
      let vis = n.visible && m.visible, o = n.parent, att = false;
      while (o) { if (!o.visible) vis = false; if (o === sceneRef) { att = true; break; } o = o.parent; }
      vis = vis && att;
      if (vis !== it.vis) { it.b.setVisibleAt(it.id, vis); it.vis = vis; ch = true; }
      if (!vis) continue;
      const e = n.matrixWorld.elements, a = it.m;
      for (let i = 0; i < 16; i++) if (a[i] !== e[i]) { a.set(e); it.b.setMatrixAt(it.id, n.matrixWorld); ch = true; break; }
      const c = m.color, al = it.kind === 'shade' ? m.opacity : 1, q = it.c;
      if (q[0] !== c.r || q[1] !== c.g || q[2] !== c.b || q[3] !== al) { q[0] = c.r; q[1] = c.g; q[2] = c.b; q[3] = al; it.b.setColorAt(it.id, v4.set(c.r, c.g, c.b, al)); ch = true; }
    }
    return ch;
  }
  get count() { return this.items.filter(it => !it.dead && it.b).length; }
  dispose() {
    this.batches.forEach(b => { b.geometry.dispose(); b.material.dispose(); b.dispose && b.dispose(); });
    this.pages.forEach(p => { p.tex && p.tex.dispose(); p.etex && p.etex.dispose(); });
    this.group.removeFromParent();
  }
}

/** run small tasks in idle time, budget ms per slice (a task may return a promise) */
export function runTasks(tasks, { budget = 7, cancelled = null, label = 'paper-task', urgent = null } = {}) {   // urgent(): the page is waiting, go faster
  return new Promise((resolve, reject) => {
    let i = 0, spent = 0;
    const sched = () => (urgent && urgent() ? setTimeout(slice, 0) : window.requestIdleCallback ? requestIdleCallback(slice, { timeout: 120 }) : setTimeout(slice, 16));
    function slice() {
      if (cancelled && cancelled()) { reject(new Error('cancelled')); return; }
      const t0 = performance.now();
      try {
        while (i < tasks.length) {
          const ti = performance.now();
          const r = tasks[i++]();
          if (performance.now() - ti > 30) try { performance.measure(label + '#' + (i - 1), { start: ti }); } catch (e) {}
          if (r && r.then) { spent += performance.now() - t0; r.then(sched, reject); return; }
          if (performance.now() - t0 > (urgent && urgent() ? 24 : budget)) break;
        }
      } catch (e) { reject(e); return; }
      spent += performance.now() - t0;
      if (i >= tasks.length) resolve(spent); else sched();
    }
    sched();
  });
}

/* ====================================================================================
   THE STAGE: renderer, camera framing (landscape / portrait), clock, open / close
   A scene is built into a SLOT (its own hinges, updaters, caches, batches). mount() builds and shows at once
   (the gallery); prepare() builds in small idle-time pieces while another page is up, show() swaps it in.
   ==================================================================================== */
const SLOT_KEYS = ['_cache', '_flat', '_blob', '_page', 'hinges', 'updaters', 'time', 'openness', 'api', 'def', 'ctx', 'L', 'lightPos', 'pitch', 'orient', 'root', 'buildMs', 'prepMs', 'state', 'busyUntil', 'batch', 'content'];
export function createStage(canvas, opts = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  const mobile = matchMedia('(pointer:coarse)').matches || innerWidth < 600;
  const dprMax = Math.min(mobile ? 1.25 : 1.5, devicePixelRatio || 1), dprMin = Math.min(dprMax, .75);
  renderer.setPixelRatio(dprMax);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.capabilities.getMaxAnisotropy();   // first call is slow on some drivers: do it now, not in a scene build
  const useBatch = opts.batch !== false;

  const scene = new THREE.Scene(); scene.matrixWorldAutoUpdate = false;
  const camera = new THREE.PerspectiveCamera(28, 1, .5, 600);
  const hemi = new THREE.HemisphereLight(PAL.fill, PAL.shadow, 1.0); scene.add(hemi);
  const front = new THREE.DirectionalLight('#B8B2E8', .55); front.position.set(.2, .6, 1); scene.add(front); // frontal fill ~0.3 of key

  const st = {
    THREE, scene, camera, renderer, mobile, reduce: REDUCE, hemi, front,
    L: { x: -.6, y: -.8 }, pitch: 30 * Math.PI / 180, yaw: 0,
    lightPos: new THREE.Vector3(-2, 5, 3), hinges: [], updaters: [], time: 0, openness: 0, frozen: false,
    root: null, def: null, api: null, free: null, orient: 'land', batch: null, _page: null,
    _cache: new Map(), _flat: new Set(), _blob: null, _jobs: null,
    flatMat(col) { const m = new THREE.MeshLambertMaterial({ color: col }); st._flat.add(m); return m; },
    hinge(obj, o) { const h = new Hinge(obj, o); h.order = o.order || 0; st.hinges.push(h); return h; },
    onUpdate(fn) { st.updaters.push(fn); }
  };
  /* perf counters (read by the ?fps=1 meter on the site) */
  st.perf = { renders: 0, cpu: 0, frames: 0, calls: 0, tris: 0, dpr: dprMax, ticks: 0 };

  /* ---- camera framing ----
     scene.frames = { focus: {min,max}, wide: {min,max} } (world boxes of the settled pose)
     landscape: focus fits the band above the text box; wide fills the screen width (uses both sides of the box)
     portrait : focus fits the band above the text box, nothing important outside it
     Both: the WHOLE main page, from the top of its tallest piece to the front edge of the paper, stays inside
     the band (free.top .. free.bottom), so the island never sinks behind the text box or runs into the top bar.
     scene.cam = { land: { pitch, yaw, fov }, port: { ... } } (degrees) */
  const projBox = (b, W, H) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const v = new THREE.Vector3();
    for (let i = 0; i < 8; i++) { v.set(i & 1 ? b.max[0] : b.min[0], i & 2 ? b.max[1] : b.min[1], i & 4 ? b.max[2] : b.min[2]).project(camera); const px = (v.x + 1) / 2 * W, py = (1 - v.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
  };
  st.layout = (free) => {
    st.free = free;
    const W = free.W, H = free.H; renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.clearViewOffset();
    if (!st.api) { camera.updateProjectionMatrix(); return; }
    st.orient = W >= H ? 'land' : 'port';
    const fr = st.api.frames, cam = (st.api.cam && st.api.cam[st.orient]) || {};
    st.pitch = (cam.pitch ?? 30) * Math.PI / 180; st.yaw = (cam.yaw ?? 0) * Math.PI / 180; camera.fov = cam.fov ?? 28;
    camera.updateProjectionMatrix();
    const f = fr.focus, wd = fr.wide || f;
    const tgt = new THREE.Vector3((f.min[0] + f.max[0]) / 2, (f.min[1] + f.max[1]) / 2, (f.min[2] + f.max[2]) / 2);
    const dir = new THREE.Vector3(Math.sin(st.yaw) * Math.cos(st.pitch), Math.sin(st.pitch), Math.cos(st.yaw) * Math.cos(st.pitch));
    let d = 80;
    const place = () => { camera.position.copy(tgt).addScaledVector(dir, d); camera.lookAt(tgt); camera.updateMatrixWorld(); };
    const band = { w: (free.right - free.left), h: (free.bottom - free.top) };
    const fitF = cam.fillFocus || (st.orient === 'land' ? [.9, .9] : [.96, .92]);
    // top = focus or the tallest piece, bottom = the front edge of the main page (when known)
    const topBox = st.content || f, pageBox = st._page || f;
    const span = () => { const a = projBox(topBox, W, H), a2 = projBox(f, W, H), b = projBox(pageBox, W, H); return { y0: Math.min(a.y0, a2.y0), y1: Math.max(b.y1, a2.y1) }; };
    for (let i = 0; i < 10; i++) {
      place(); const pf = projBox(f, W, H), sp = span();
      let k = Math.max(pf.w / (band.w * fitF[0]), pf.h / (band.h * fitF[1]), (sp.y1 - sp.y0) / (band.h * .97));
      if (st.orient === 'land') { const pw = projBox(wd, W, H); k = Math.max(k, pw.w / (W * (cam.fillWide || .96))); }
      d *= k;
    }
    // vertical: the page span centred in the band; landscape: wide must not run off the bottom
    let oy = 0;
    for (let i = 0; i < 8; i++) {
      place(); const sp = span(), pw = projBox(wd, W, H);
      oy = (sp.y0 + sp.y1) / 2 - (free.top + free.bottom) / 2;
      if (st.orient === 'land' && pw.y1 - oy > H - 6) { d *= 1.05; continue; }
      break;
    }
    place(); const pf = projBox(f, W, H), pw = projBox(wd, W, H), sp = span();
    oy = (sp.y0 + sp.y1) / 2 - (free.top + free.bottom) / 2;
    const ox = st.orient === 'land' ? (pw.x0 + pw.x1) / 2 - W / 2 : (pf.x0 + pf.x1) / 2 - (free.left + free.right) / 2;
    camera.setViewOffset(W, H, ox, oy, W, H);
    st.px = pf.h / Math.max(1e-3, f.max[1] - f.min[1] + (f.max[2] - f.min[2]) * Math.sin(st.pitch)); // ~px per unit (info)
    draw();
  };

  function disposeTree(o) {
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) [].concat(n.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    });
  }
  /* ---- slots ---- */
  const enter = (slot) => { const saved = {}; SLOT_KEYS.forEach(k => { saved[k] = st[k]; st[k] = slot[k]; }); return saved; };
  const leave = (slot, saved) => { SLOT_KEYS.forEach(k => { slot[k] = st[k]; st[k] = saved[k]; }); };
  function newSlot(def, ctx) {
    const lay = st.free && st.free.W >= st.free.H ? 'land' : (st.free ? 'port' : st.orient);
    const cam = def.cam && def.cam[lay];
    return { _cache: new Map(), _flat: new Set(), _blob: null, _page: null, hinges: [], updaters: [], time: 0, openness: 0, api: null, def, ctx,
      L: { x: -.6, y: -.8 }, lightPos: new THREE.Vector3(-2, 5, 3), pitch: ((cam && cam.pitch) ?? 30) * Math.PI / 180,   // island opens edge-on to THIS pitch
      orient: lay, root: null, buildMs: 0, prepMs: 0, state: null, busyUntil: 0, batch: null, content: null };
  }
  /** build the scene's objects now; painting, atlas and batches become tasks */
  function buildSlot(def, ctx) {
    const slot = newSlot(def, ctx), saved = enter(slot);
    st._jobs = [];
    const t0 = performance.now();
    try { st.api = def.build(st, ctx); st.root = st.api.root; }
    finally { slot.jobs = st._jobs; st._jobs = null; st.buildMs = performance.now() - t0; leave(slot, saved); try { performance.measure('paper-build', { start: t0 }); } catch (e) {} }
    const tasks = slot.jobs.slice();
    tasks.push(() => {   // the height of the tallest piece on the main page in its open pose (for the framing)
      const hs = slot.hinges, keep = hs.map(h => [h.x, h.v]);
      hs.forEach(h => { h.x = 1; h.apply(); });
      slot.root.updateMatrixWorld(true);
      const box = new THREE.Box3(), tmp = new THREE.Box3();
      const walk = (o) => {
        if (o.userData.sidePage) return;
        if (o.isMesh && o.material && o.material.map && !o.material.transparent && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); box.union(tmp); }
        o.children.forEach(walk);
      };
      walk(slot.root);
      hs.forEach((h, i) => { h.x = keep[i][0]; h.v = keep[i][1]; h.apply(); });
      slot.content = box.isEmpty() ? null : { min: box.min.toArray(), max: box.max.toArray() };
    });
    if (useBatch) { slot.batch = new Batcher(st, slot.root); tasks.push(() => { tasks.push(...slot.batch.plan()); }); }
    slot.tasks = tasks;
    return slot;
  }
  const runAll = (tasks) => { for (let i = 0; i < tasks.length; i++) tasks[i](); };   // tasks may grow while running
  /** prepare a scene in idle time; resolves with a slot for show(). opts.cancelled() stops it */
  st.prepare = (def, ctx = {}, o = {}) => new Promise((resolve, reject) => {
    const go = () => {
      let slot;
      try { slot = buildSlot(def, ctx); } catch (e) { reject(e); return; }
      const tasks = slot.tasks;
      // GPU side last: upload the atlas pages, compile the shaders with this scene's lights
      const gpu = () => {
        const extra = [];
        if (slot.batch) slot.batch.pages.forEach(p => { extra.push(() => p.tex && renderer.initTexture(p.tex)); if (p.etex) extra.push(() => renderer.initTexture(p.etex)); });
        // warm the shaders by really drawing each material once into one pixel (ANGLE / D3D compiles at the first
        // draw, compile() alone does not help); one material per task, so no single long pause
        const lights = [new THREE.HemisphereLight(), new THREE.DirectionalLight()];
        slot.root.traverse(n => { if (n.isLight && !n.isHemisphereLight) lights.push(n.clone()); });
        const seen = new Set(), reps = [];
        slot.root.updateMatrixWorld(true);
        slot.root.traverse(n => {
          if (!(n.isMesh || n.isPoints || n.isLine || n.isSprite) || !n.material || n.layers.mask !== 1) return;
          [].concat(n.material).forEach(m => { const k = m.uuid + (n.isInstancedMesh ? 'i' : '') + (n.isSkinnedMesh ? 's' : ''); if (!seen.has(k)) { seen.add(k); reps.push(n); } });
        });
        const tmp = new THREE.Scene(); tmp.add(...lights);
        // browsers with parallel shader compiling (Chrome / Edge / Firefox on desktop): compile everything off the main thread first
        if (renderer.extensions.has('KHR_parallel_shader_compile') && renderer.compileAsync) extra.push(() => {
          const all = new THREE.Scene(); all.add(...lights.map(l => l.clone()));
          const proxies = reps.filter(n => !n.isInstancedMesh && !n.isSkinnedMesh).map(n => n.isSprite ? new THREE.Sprite(n.material) : new n.constructor(n.geometry, n.material));
          proxies.forEach(o => all.add(o));
          const bs = slot.batch ? slot.batch.batches.map(b => [b, b.parent]) : []; bs.forEach(([b]) => all.add(b));
          const back = () => { bs.forEach(([b, par]) => par && par.add(b)); proxies.forEach(o => o.removeFromParent()); };
          return renderer.compileAsync(all, camera).then(back, back);
        });
        const pix = (o) => {
          renderer.setScissorTest(true); renderer.setScissor(0, 0, 1, 1);
          tmp.add(o); try { renderer.render(tmp, camera); } finally { tmp.remove(o); renderer.setScissorTest(false); st._dirty = true; }
        };
        reps.forEach(n => extra.push(() => {
          if (n.isInstancedMesh || n.isSkinnedMesh) return;
          const o = n.isSprite ? new THREE.Sprite(n.material) : new n.constructor(n.geometry, n.material);
          o.frustumCulled = false; o.renderOrder = n.renderOrder; pix(o);
        }));
        if (slot.batch) slot.batch.batches.forEach(b => extra.push(() => {
          const par = b.parent, pc = b.perObjectFrustumCulled; b.perObjectFrustumCulled = false;
          pix(b); b.perObjectFrustumCulled = pc; if (par) par.add(b);
        }));
        extra.push(() => { if (st.root) kick(); });
        return extra;
      };
      const t0 = performance.now();
      runTasks(tasks, { cancelled: o.cancelled, urgent: o.urgent })   // (the batch plan appends to `tasks` while it runs)
        .then(spent => runTasks(gpu(), { cancelled: o.cancelled, urgent: o.urgent, label: 'paper-gpu' }).then(s2 => { slot.prepMs = spent + s2; slot.prepWall = performance.now() - t0; resolve(slot); }))
        .catch(e => { st.discard(slot); reject(e); });
    };
    window.requestIdleCallback ? requestIdleCallback(go, { timeout: 400 }) : setTimeout(go, 30);
  });
  /** swap a prepared slot in and open it */
  st.show = (slot) => {
    const t0 = performance.now();
    if (st.root) { scene.remove(st.root); if (st.batch) st.batch.dispose(); disposeTree(st.root); }
    SLOT_KEYS.forEach(k => { st[k] = slot[k]; });
    scene.add(st.root); if (st.batch) scene.add(st.batch.group);
    if (st.free) st.layout(st.free);
    st.open();
    try { performance.measure('paper-show', { start: t0 }); } catch (e) {}
  };
  st.discard = (slot) => { if (!slot || !slot.root || slot.root === st.root) return; if (slot.batch) slot.batch.dispose(); disposeTree(slot.root); };
  /** build a scene module and show it at once: def.build(st, ctx) -> { root, frames, cam, react(m, i), reset() } */
  st.mount = (def, ctx = {}) => {
    if (st.root) { scene.remove(st.root); if (st.batch) st.batch.dispose(); disposeTree(st.root); st.root = null; st.batch = null; }
    const t0 = performance.now(), slot = buildSlot(def, ctx);
    const b0 = slot.buildMs; runAll(slot.tasks); slot.prepMs = performance.now() - t0 - b0;
    st.show(slot);
  };
  st.open = () => {
    st.time = 0; st.state = 'open';
    const hs = st.hinges.filter(h => !h.island && !h.manual).sort((a, b) => a.order - b.order);
    st.hinges.filter(h => h.island).forEach(h => { h.snap(0); h.open(0); h.z = .8; h.w0 = 7.5; });
    hs.forEach((h, i) => { h.snap(0); h.open(.42 + Math.min(1.4, i * .045)); });
    st.hinges.filter(h => h.manual).forEach(h => h.snap(h.rest ?? 0));
    if (st.reduce) st.hinges.forEach(h => h.snap(h.manual ? (h.rest ?? 0) : 1));
    kick();
  };
  st.close = () => {
    st.state = 'close';
    const hs = st.hinges.filter(h => !h.island).sort((a, b) => b.order - a.order);
    hs.forEach((h, i) => h.close(Math.min(.7, i * .025)));
    st.hinges.filter(h => h.island).forEach(h => { h.close(.35 + Math.min(.7, hs.length * .025)); h.z = 1; h.w0 = 8; });
    if (st.reduce) st.hinges.forEach(h => h.snap(0));
    kick();
  };
  st.replay = () => { st.api && st.api.reset && st.api.reset(); st.open(); };
  st.busyUntil = 0;
  st.react = (m, i) => { if (st.api && st.api.react) { st.api.react(m, i); st.busyUntil = st.time + 3; kick(); } };

  function step(dt) {
    st.time += dt;
    const sub = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / sub;
    for (let k = 0; k < sub; k++) st.hinges.forEach(x => x.step(h));
    const isl = st.hinges.find(x => x.island); st.openness = isl ? Math.max(0, Math.min(1, isl.x)) : 1;
    st.updaters.forEach(fn => fn(st.time, dt));
  }
  /* what changed since the last draw: batched cards (Batcher.sync) + everything drawn on its own */
  const sigs = new WeakMap(); let lastCount = -1;
  function looseChanged() {
    let ch = false, count = 0;
    scene.traverseVisible(o => {
      let s;
      if (o.isLight) s = o.intensity * 7.1 + o.color.r + o.color.g * 3 + o.color.b * 5 + o.position.x * 11 + o.position.y * 13 + o.position.z * 17;
      else if ((o.isMesh || o.isPoints || o.isSprite || o.isLine) && !o.isBatchedMesh && o.layers.test(camera.layers)) {
        const m = o.material; if (!m || Array.isArray(m)) return;
        s = (m.opacity || 0) * 11 + (m.color ? m.color.r + m.color.g * 3 + m.color.b * 5 : 0) + (m.emissive ? m.emissive.r * 31 : 0) + m.version * 13 + (m.map ? m.map.version * 17 + m.map.offset.x * 19 + m.map.offset.y * 23 : 0);
        const a = o.geometry && o.geometry.attributes; if (a) for (const k in a) s += a[k].version * 29;
      } else return;
      count++;
      const e = o.matrixWorld.elements; for (let i = 0; i < 16; i++) s += e[i] * (i + 1.37);
      if (sigs.get(o) !== s) { sigs.set(o, s); ch = true; }
    });
    if (count !== lastCount) { lastCount = count; ch = true; }
    return ch;
  }
  function sync() { scene.updateMatrixWorld(); return st.batch ? st.batch.sync(scene) : false; }
  function render() { renderer.render(scene, camera); st.perf.renders++; st.perf.calls = renderer.info.render.calls; st.perf.tris = renderer.info.render.triangles; }
  function draw() { sync(); render(); }
  st.render = draw;

  /* adaptive resolution: if the frame rate stays under 45 (30-fps mode: under 26), lower the pixel ratio
     step by step down to 0.75; raise it again slowly when there is headroom. opts.adapt() / opts.lowest() gate it. */
  let aT = 0, aTicks = 0, aCool = 0, aGood = 0;
  function adapt(ms, target) {
    // the site's quality system (js/23) decides when the paper scene may lower its resolution (last step only)
    if (opts.lowest && opts.lowest()) { if (renderer.getPixelRatio() !== dprMin) setDpr(dprMin); return; }
    if (opts.adapt && !opts.adapt()) { if (renderer.getPixelRatio() !== dprMax) setDpr(dprMax); aT = 0; return; }
    if (!aT) { aT = ms; aTicks = 0; return; }
    aTicks++;
    if (ms - aT < 1000) return;
    const fps = aTicks * 1000 / (ms - aT); aT = ms; aTicks = 0;
    if (ms < aCool) return;
    const lowAt = target >= 60 ? 45 : 26, cur = renderer.getPixelRatio();
    if (fps < lowAt && cur > dprMin + .01) { setDpr(Math.max(dprMin, cur - .15)); aCool = ms + 1500; aGood = 0; }
    else if (fps >= target * .95 && cur < dprMax - .01) { if (++aGood >= 6) { setDpr(Math.min(dprMax, cur + .1)); aGood = 0; aCool = ms + 2500; } }
    else aGood = 0;
  }
  function setDpr(v) { renderer.setPixelRatio(v); st.perf.dpr = v; if (st.free) st.layout(st.free); }

  /* clock: draws only while visible and only when something changed; 60 fps while things move,
     30 fps on phones and once everything has settled */
  let raf = 0, last = 0;
  const settled = () => st.hinges.every(h => h.settled);
  function frame(ms) {
    raf = 0; if (st.frozen || document.hidden || !st.root) return;
    const quiet = settled() && st.time > st.busyUntil;
    const fps = (mobile || quiet) ? 30 : 60;
    if (last && ms - last < 1000 / fps - 2) { raf = requestAnimationFrame(frame); return; }
    const dt = last ? Math.min(.05, Math.max(0, (ms - last) / 1000)) : 0; last = ms;
    const c0 = performance.now();
    step(dt);
    let ch = sync(); ch = looseChanged() || ch;
    if (ch || !quiet || st._dirty) { render(); st._dirty = false; }
    st.perf.cpu += performance.now() - c0; st.perf.frames++;
    adapt(ms, fps);
    if (st.reduce && quiet && !ch) return; // nothing moves: stop drawing
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !st.frozen) { last = 0; raf = requestAnimationFrame(frame); } }
  st.kick = kick;
  /* the first draw of a new WebGL context is slow on some drivers (ANGLE / D3D11 sets itself up): do it early, with
     the basic paper material, so it happens while the reader is still on an earlier page */
  st.warmup = () => {
    const t0 = performance.now(), tmp = new THREE.Scene();
    tmp.add(new THREE.HemisphereLight(), new THREE.DirectionalLight());
    const g = new THREE.PlaneGeometry(1, 1), o = new THREE.Mesh(g, new THREE.MeshLambertMaterial()); o.frustumCulled = false; tmp.add(o);
    renderer.setScissorTest(true); renderer.setScissor(0, 0, 1, 1);
    try { renderer.render(tmp, camera); } finally { renderer.setScissorTest(false); g.dispose(); o.material.dispose(); st._dirty = true; }
    try { performance.measure('paper-warmup', { start: t0 }); } catch (e) {}
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

  /* deterministic capture: restart then step a fixed clock */
  st.seek = (T) => { st.frozen = true; st.api && st.api.reset && st.api.reset(); st.open(); for (let t = 0; t < T; t += 1 / 60) step(1 / 60); draw(); };
  st.advance = (T) => { st.frozen = true; for (let t = 0; t < T; t += 1 / 60) step(1 / 60); draw(); };
  st.resume = () => { st.frozen = false; kick(); };
  st.stats = () => ({ calls: st.perf.calls, tris: st.perf.tris, textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries, buildMs: Math.round(st.buildMs), prepMs: Math.round(st.prepMs || 0), batched: st.batch ? st.batch.count : 0, ejected: st.batch ? st.batch.ejected : 0, dpr: renderer.getPixelRatio(), orient: st.orient });
  return st;
}
