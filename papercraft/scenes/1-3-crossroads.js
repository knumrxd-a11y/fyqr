/* ===== Scene 1.3 "ทางแยกห้าสาย" (SC[2]) =====
   A grey paper plaza at the end of the square. The guide light (the player) floats over it beside a five-armed
   signpost. Five lanes fan out, each through a folded paper archway, each with its own faint colour clue:
   DGA murals on both walls · DGD shop signs and logos · IGD blinking game lights · AFX a projection screen
   and paper smoke · DEN floating notes and a small crowd.
   Pick: that lane goes full colour, paper markers fold up along it one by one, the guide flies in,
   the other lanes dim. Colour level .45 (chapter 1: still a grey city). */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, island, guide, ribbon, quad, torn, cloud, ellipse,
  arch, symbolFor, signPost, building, person, lampPost, puff, motes, beam, popRow, removePiece, dimGroup, sidePage, bunting } from '../shared.js';

const LANES = [                                  // SC[2].o order; angle from straight back (deg), length
  { m: 'DGA', a: -112, len: 19 }, { m: 'DGD', a: -52, len: 16 }, { m: 'IGD', a: 0, len: 14 },
  { m: 'AFX', a: 52, len: 16 }, { m: 'DEN', a: 112, len: 19 }];
const PLAZA = [0, -1];
const R0 = 5.4;                                  // archway radius
const rad = d => d * Math.PI / 180;
const dirOf = a => [Math.sin(rad(a)), -Math.cos(rad(a))];
const at = (l, r) => { const d = dirOf(l.a); return [PLAZA[0] + d[0] * r, PLAZA[1] + d[1] * r]; };
/** yaw for a card lying along direction a, turned to face the camera side */
const along = a => { let y = Math.PI / 2 - rad(a); if (Math.cos(y) < 0) y += Math.PI; return y; };

export default {
  id: '1-3',
  cam: { land: { pitch: 31 }, port: { pitch: 33 } },
  build(st, ctx) {
    const level = ctx.colour ?? .45;
    const root = new THREE.Group();

    /* lane centrelines in world (x, z), slightly bent */
    LANES.forEach((l, i) => {
      const p0 = at(l, 2.6), p2 = at(l, l.len), d = dirOf(l.a), bend = (i - 2) * .5;
      const p1 = [(p0[0] + p2[0]) / 2 - d[1] * bend, (p0[1] + p2[1]) / 2 + d[0] * bend];
      l.pts = quad(p0, p1, p2, 16);
      l.p = r => { const t = Math.max(0, Math.min(1, (r - 2.6) / (l.len - 2.6))) * 16, k = Math.floor(t), f = t - k, A = l.pts[k], B = l.pts[Math.min(16, k + 1)]; return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]; };
      l.side = (r, off) => { const a = l.p(r), b = l.p(r + .5), dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1; return [a[0] - dz / n * off, a[1] + dx / n * off]; };
    });
    const toP = pts => pts.map(([x, z]) => [x, -z]);

    /* ---------- the page ---------- */
    const page = island(st, root, {
      outline: torn(0, 3, 21.5, 12.2, 17, 96), seed: 7, ppu: 24, blurFar: .26, blurNear: .86, blurPx: 4, paint: P => {
        const R = rng(4);
        for (let i = 0; i < 420; i++) { const x = (R() - .5) * 42, y = 3 + (R() - .5) * 24, w = .55 + R() * .6; P.layer(P.rect(x, y, w, w * .55), mix(PAL.ground, PAL.groundLt, .45 + R() * .55), { shadow: .3, lip: .45 }); }
        LANES.forEach(l => {
          const pp = toP(l.pts);
          P.layer(P.poly(ribbon(pp, 2.5, 3.2)), '#3E3A54', { shadow: .5 });
          P.layer(P.poly(ribbon(pp, 1.9, 2.5)), PAL.groundDk, { shadow: .6 });
          for (let k = 1; k < pp.length - 1; k += 2) { const a = pp[k], b = pp[k + 1]; P.layer(P.poly(ribbon([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]], .16)), mix(PAL.cream, PAL.mid, .4), { shadow: .3, lip: .4 }); }
        });
        const cx = PLAZA[0], cy = -PLAZA[1];
        P.layer(P.circle(cx, cy, 4.3), '#4E4A64', { shadow: .8 });
        P.layer(P.circle(cx, cy, 3.6), PAL.groundLt, { shadow: .5 });
        for (let r = 1; r <= 3; r++) { const n = 9 + r * 7; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + r; P.layer(P.circle(cx + Math.cos(a) * r * 1.02, cy + Math.sin(a) * r * 1.02, .2), mix(PAL.groundLt, PAL.light, .28), { shadow: .35, lip: .6 }); } }
        P.layer(P.circle(cx, cy, .75), mix(PAL.groundLt, PAL.cream, .22), { shadow: .5 });
      }
    });
    const top = page.top;

    /* ---------- the guide light = the player, floating over the plaza ---------- */
    const G = guide(st, root, { x: -1.2, y: 4.4, z: .4, power: 18 });

    /* ---------- lane ink overlays (the chosen road soaks up its colour) ---------- */
    const overlays = {};
    LANES.forEach(l => {
      const shape = new THREE.Shape(ribbon(toP(l.pts.slice(0, 15)), 1.9, 2.4).map(([x, y]) => new THREE.Vector2(x, y)));
      const geo = new THREE.ShapeGeometry(shape); geo.rotateX(-Math.PI / 2); geo.translate(0, .02, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: tone(MAJ[l.m], .85), transparent: true, opacity: 0, depthWrite: false }));
      m.renderOrder = 1; top.add(m); overlays[l.m] = m;
    });

    /* ---------- the five-armed signpost ---------- */
    const postOut = [[-.17, 0], [.17, 0], [.17, 5.95], [.32, 6.08], [.32, 6.26], [0, 6.5], [-.32, 6.26], [-.32, 6.08], [-.17, 5.95]];
    const post = card(st, { outline: postOut, base: PAL.mid, ppu: 56, seed: 21, paint: P => { P.layer(P.rect(-.05, .3, .1, 5.5), mix(PAL.mid, PAL.light, .4), { shadow: .4 }); [.9, 5.7].forEach(y => P.layer(P.rect(-.17, y, .34, .22), PAL.dark, { shadow: .6 })); P.layer(P.circle(0, 6.25, .17), PAL.cream, { shadow: .5 }); } });
    const plinth = card(st, { outline: [[-.6, 0], [.6, 0], [.46, .5], [-.46, .5]], base: PAL.dark, ppu: 56, seed: 22, paint: P => P.layer(P.rect(-.5, .08, 1, .14), mix(PAL.dark, PAL.light, .3), { shadow: .4 }) });
    plinth.mesh.position.z = .12;
    const sign = stand(st, top, { x: PLAZA[0] + 2.1, z: PLAZA[1] + .3, yaw: -.08, cards: [post, plinth], shadowOutline: [[-.6, 0], [.6, 0], [.3, 6.4], [-.3, 6.4]], order: 2, shadow: { len: .62 } });
    const ARW = [{ m: 'DGA', s: -1, y: 5.25, L: 2.3 }, { m: 'DGD', s: -1, y: 4.55, L: 2.0 }, { m: 'IGD', s: 1, y: 3.85, L: 2.2 }, { m: 'AFX', s: 1, y: 3.15, L: 2.0 }, { m: 'DEN', s: 1, y: 2.45, L: 2.35 }];
    const arrows = ARW.map((a, i) => {
      const L = a.L, hh = .6, s = a.s, base = i % 2 ? PAL.light : mix(PAL.light, PAL.mid, .45);
      const out = [[-.08, -hh / 2], [L - .34, -hh / 2], [L, 0], [L - .34, hh / 2], [-.08, hh / 2]].map(([x, y]) => [x * s, y]);
      const paint = lv => P => {
        P.layer(P.poly([[.12, -.18], [L - .42, -.18], [L - .16, 0], [L - .42, .18], [.12, .18]].map(([x, y]) => [x * s, y])), mix(base, PAL.dark, .18), { shadow: .6 });
        P.layer(P.rect(Math.min(.25 * s, L * .62 * s), -.06, Math.abs(L * .62 - .25), .12), mix(base, PAL.cream, .5), { shadow: .4 });
        [1, -1].forEach(k => P.layer(P.circle(.2 * s, k * .17, .055), PAL.cream, { shadow: .4 }));
        const c = tone(MAJ[a.m], lv); P.layer(P.circle((L - .62) * s, 0, .2), c, { shadow: .5 }); symbolFor(a.m)(P, (L - .62) * s, 0, .2, mix(c, '#ffffff', .6));
      };
      const c = card(st, { outline: out, base, ppu: 72, seed: 30 + i, paint: paint(level) });
      const hg = new THREE.Group(); hg.position.set(s * .15, a.y, .1 + i * .015); hg.add(c.mesh); sign.group.add(hg);
      const h = st.hinge(hg, { axis: 'y', flat: s * Math.PI / 2, up: -s * .3, order: 2.5 + i * .3 });
      return { ...a, c, h, paint };
    });

    /* ---------- the five lanes: archway + clue, each in its own group (so it can dim) ---------- */
    const lanes = {};
    LANES.forEach((l, i) => {
      const grp = new THREE.Group(); top.add(grp);
      const ap = at(l, R0), yawA = -rad(l.a) * .5;
      const ar = arch(st, grp, { x: ap[0], z: ap[1], yaw: yawA, w: 3.3, h: 3.8, open: 1.9, colour: MAJ[l.m], level, symbol: symbolFor(l.m), seed: 50 + i, order: 3 + Math.abs(i - 2) * .2 });
      const L = { l, grp, arch: ar, clue: [], repaint: [], lights: null };
      lanes[l.m] = L;
      const yaw = along(l.a), R = rng(60 + i);
      if (l.m === 'DGA') {               // murals on both walls
        const mural = (seed, lv) => P => {
          const c = tone(MAJ.DGA, lv), c2 = tone('#FFD166', lv * .8), c3 = tone('#4BE3C1', lv * .7), Rr = rng(seed);
          P.layer(P.rect(-1.75, .2, 3.5, 2.1), mix(PAL.light, PAL.cream, .25), { shadow: .6 });
          for (let k = 0; k < 6; k++) P.layer(P.circle(-1.3 + Rr() * 2.6, .6 + Rr() * 1.5, .25 + Rr() * .3), [c, c2, c3][k % 3], { shadow: .5 });
          P.layer(P.poly(ribbon(quad([-1.5, .5], [0, 2.3], [1.5, .6], 10), .16)), c, { shadow: .4 });
          P.layer(P.poly([[-.4, .3], [.2, .3], [-.1, 1.1]]), c2, { shadow: .4 });
        };
        [[8.4, 2.2], [8.4, -2.2], [12, 2.2]].forEach(([r, off], k) => {
          const p = l.side(r, off), seed = 70 + k;
          const out = [[-2, 0], [2, 0], [2, 2.5], [1.2, 2.75], [-1.2, 2.75], [-2, 2.5]];
          const c = card(st, { outline: out, base: PAL.mid, ppu: 40, seed, paint: mural(seed, level) });
          stand(st, grp, { x: p[0], z: p[1], yaw, cards: [c], shadowOutline: out, order: 4 + k * .1, shadow: { len: .5 } });
          L.repaint.push(lv => c.reprint(mural(seed, lv)));
        });
      } else if (l.m === 'DGD') {        // shop signs and logos
        const shapes = ['circle', 'shield', 'diamond', 'rect', 'circle'];
        [[7.6, 1.9], [9.4, -1.9], [11.2, 1.9], [13, -1.9], [14.6, 1.9]].forEach(([r, off], k) => {
          const p = l.side(r, off);
          const s = signPost(st, grp, { x: p[0], z: p[1], yaw: along(l.a) + (k % 2 ? .4 : -.4), shape: shapes[k], w: 1.5 + R() * .4, hBoard: 1.1, post: 1.8 + R() * .8, colour: k % 2 ? MAJ.DGD : mix(MAJ.DGD, '#ffffff', .2), level, symbol: symbolFor(['DGD', 'DGA', 'DGD', 'IGD', 'DGD'][k]), seed: 80 + k, order: 4 + k * .1 });
          L.repaint.push(lv => s.repaint(lv));
        });
      } else if (l.m === 'IGD') {        // game cabinets with blinking lights
        const lightsPos = [];
        [[9, 2.1], [9, -2.1], [12.5, 2.3], [12.5, -2.3]].forEach(([r, off], k) => {
          const p = l.side(r, off), w = 1.5, h = 2.8;
          const out = [[-w / 2, 0], [w / 2, 0], [w / 2, h * .78], [w * .3, h], [-w * .3, h], [-w / 2, h * .78]];
          const c = card(st, { outline: out, base: PAL.dark, ppu: 44, seed: 90 + k, paint: P => { P.layer(P.rect(-w * .38, h * .38, w * .76, h * .32), PAL.win, { shadow: .5 }); P.layer(P.rect(-w * .4, h * .2, w * .8, h * .1), PAL.mid, { shadow: .4 }); [-.25, .25].forEach(x => P.layer(P.circle(x, h * .25, .09), PAL.cream, { shadow: .3 })); } });
          const yw = k % 2 ? -.5 : .5;
          stand(st, grp, { x: p[0], z: p[1], yaw: yw, cards: [c], shadowOutline: out, order: 4 + k * .1, shadow: { len: .5 } });
          for (let q = 0; q < 6; q++) lightsPos.push({ x: p[0], z: p[1], yaw: yw, lx: -w * .3 + (q % 3) * w * .3, ly: h * .44 + Math.floor(q / 3) * h * .14 });
        });
        // blinking squares: one InstancedMesh (unlit), parented to the page top
        const geo = new THREE.PlaneGeometry(.28, .22), mat = new THREE.MeshBasicMaterial();
        const im = new THREE.InstancedMesh(geo, mat, lightsPos.length); grp.add(im);
        const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), col = new THREE.Color(), PALG = ['#3BCB7E', '#F25AA6', '#FFD166', '#4BA3F5', '#9A7BFF'];
        lightsPos.forEach((p, k) => { const c = Math.cos(p.yaw), s = Math.sin(p.yaw); v.set(p.x + p.lx * c + .06 * s, p.ly, p.z - p.lx * s + .06 * c); q4.setFromEuler(e.set(0, p.yaw, 0)); m4.compose(v, q4, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(k, m4); im.setColorAt(k, col.set(PAL.win)); });
        L.lights = { im, n: lightsPos.length, lv: level, hide: 0 };
        st.onUpdate((t) => {
          const lt = L.lights, step = st.reduce ? 0 : Math.floor(t * 5);
          for (let k = 0; k < lt.n; k++) { const on = ((k * 7 + step * 3) % 5) < 2; im.setColorAt(k, col.set(on ? tone(PALG[(k + step) % 5], lt.lv) : PAL.win).multiplyScalar(lt.dim ?? 1)); }
          im.instanceColor.needsUpdate = true; im.visible = st.openness > .9 && L.cabUp();
        });
        L.cabUp = () => true;
      } else if (l.m === 'AFX') {        // projection screen, projector, paper smoke
        const sp = l.side(12, 0), w = 4.6, h = 3.3;
        const out = [[-w / 2, 0], [-w / 2 + .3, 0], [-w / 2 + .3, .9], [w / 2 - .3, .9], [w / 2 - .3, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]];
        const scr = lv => P => { P.layer(P.rect(-w / 2 + .2, 1.05, w - .4, h - 1.25), mix(PAL.light, PAL.cream, .5), { shadow: .6 }); const c = tone(MAJ.AFX, lv); P.glowDot(0, 2.2, 1.6, c, .55); P.layer(P.circle(-.6, 2.1, .45), c, { shadow: .4 }); P.layer(P.poly([[.1, 1.5], [1.3, 1.5], [.7, 2.7]]), mix(c, PAL.cream, .3), { shadow: .4 }); };
        const sc = card(st, { outline: out, base: PAL.dark, ppu: 40, seed: 110, paint: scr(level) });
        stand(st, grp, { x: sp[0], z: sp[1], yaw: along(l.a) + .9, cards: [sc], shadowOutline: out, order: 4, shadow: { len: .5 } });
        L.repaint.push(lv => sc.reprint(scr(lv)));
        const pp = l.side(8.2, -1.4);
        const proj = card(st, { outline: [[-.5, 0], [.5, 0], [.5, 1.6], [.7, 1.6], [.7, 2.3], [-.7, 2.3], [-.7, 1.6], [-.5, 1.6]], base: PAL.mid, ppu: 48, seed: 111, paint: P => { P.layer(P.circle(.35, 1.95, .22), PAL.ink, { shadow: .4 }); P.layer(P.circle(.35, 1.95, .1), PAL.cream, { shadow: 0 }); } });
        stand(st, grp, { x: pp[0], z: pp[1], yaw: .5, cards: [proj], shadowOutline: [[-.5, 0], [.5, 0], [.5, 2.3], [-.5, 2.3]], order: 4.2 });
        const bm = beam(st, grp, { x: pp[0], y: 1.95, z: pp[1], h: Math.hypot(sp[0] - pp[0], sp[1] - pp[1]), w: .3, w2: 3, colour: tone(MAJ.AFX, level), opacity: .22 });
        const dir = new THREE.Vector3(sp[0] - pp[0], .2, sp[1] - pp[1]).normalize(); bm.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        L.beam = bm;
        [[10.5, 2.6, 1], [13.5, -2.6, 2], [9.8, -2.4, 3]].forEach(([r, off, k]) => { const p = l.side(r, off); puff(st, grp, { x: p[0], z: p[1], w: 1.8 + k * .3, h: 1.1, colour: PAL.light, seed: 120 + k, order: 4.4 + k * .1 }); });
      } else {                           // DEN: crowd + floating notes
        [[8.2, 1.5], [8.8, -1.3], [10.4, .4]].forEach(([r, off], k) => {
          const p = l.side(r, off);
          const pe = person(st, grp, { x: p[0], z: p[1], yaw: .3 - k * .15, h: 2.3 + (k % 3) * .25, colour: MAJ.DEN, level, seed: 140 + k, kind: k, order: 4 + k * .08, arms: k === 2 });
          L.repaint.push(lv => pe.recolour(MAJ.DEN, lv));
        });
        const noteOut = [[-.32, -.12], [-.05, -.3], [.12, -.1], [.12, 1], [.52, .85], [.52, 1.15], [.08, 1.35], [-.08, 1.3], [-.08, .1], [-.2, .2], [-.36, .1]];
        [[7.6, -.4, 3.4], [9.6, 1.6, 4.2], [11.2, -.6, 3.8]].forEach(([r, off, y], k) => {
          const p = l.side(r, off);
          const nc = lv => P => P.layer(P.circle(-.1, -.03, .12), mix(tone(MAJ.DEN, lv), PAL.cream, .4), { shadow: .3, lip: 0 });
          const c = card(st, { outline: noteOut, base: tone(MAJ.DEN, level * .8), ppu: 56, th: .05, seed: 150 + k, paint: nc(level) });
          const n = stand(st, grp, { x: p[0], y, z: p[1], yaw: .2, cards: [c], order: 4.5 + k * .1 });
          L.repaint.push(lv => c.reprint(nc(lv), tone(MAJ.DEN, lv)));
          const ph = k * 1.7; st.onUpdate(t => { if (!st.reduce) n.base.position.y = y + Math.sin(t * 1.1 + ph) * .2; });
        });
      }
    });

    /* ---------- city backdrop + plaza dressing (shared, not in a lane) ---------- */
    const dress = new THREE.Group(); top.add(dress);
    [[-82, 12.5, 'gable', 3.6, 5.4], [-26, 12.5, 'flat', 3.4, 6.4], [26, 12.5, 'step', 3.4, 5.8], [82, 12.5, 'flat', 3.8, 5], [-58, 15.5, 'flat', 3.6, 6.8], [58, 15.5, 'gable', 3.6, 6.2], [0, 15.8, 'step', 3.8, 6.6], [-38, 16.5, 'gable', 3.2, 5.6], [38, 16.5, 'flat', 3.2, 5.4]].forEach(([a, r, roof, w, h], k) => {
      const d = dirOf(a), x = PLAZA[0] + d[0] * r, z = PLAZA[1] + d[1] * r;
      if (z < -14.5 || z > 8 || Math.abs(x) > 20) return;
      building(st, dress, { x, z, yaw: -rad(a) * .35, w, h, d: 2.4, roof, cols: 2 + (k % 2), rows: Math.max(2, Math.floor(h / 2.4)), lit: 2 + (k % 3), seed: 200 + k, blur: r > 14 ? 3 : 1.6, order: 1 + k * .05, base: k % 2 ? mix(PAL.light, PAL.mid, .45) : mix(PAL.light, PAL.mid, .75), ppu: 26 });
    });
    [[-4.6, 2.6], [4.8, 2.4], [-5.2, -5.4], [5.4, -5.6]].forEach(([x, z], k) => lampPost(st, dress, { x, z, h: 3.4, seed: 300 + k, order: 2.2 + k * .05 }));
    [[-7.5, 5], [7.8, 4.6], [-12, 6.2], [12.6, 6], [-2.8, 6.4], [3.4, 6.6], [-16.5, -.5], [17, -.8]].forEach(([x, z], k) => {
      const out = cloud(2 + (k % 3) * .5, 1 + (k % 2) * .3, 3, 400 + k);
      const c = card(st, { outline: out, base: mix(PAL.deep, '#4a6a68', .25), ppu: 36, seed: 400 + k, blur: z > 5 ? 3 : 0, paint: P => { for (let q = 0; q < 6; q++) P.layer(P.circle(-.7 + q * .3, .5 + (q % 2) * .3, .22), mix(PAL.deep, '#6a8a86', .3), { shadow: .4 }); } });
      stand(st, dress, { x, z, yaw: 0, cards: [c], shadowOutline: out, order: 1.5 + k * .03, shadow: { len: .45, opacity: .4 } });
    });

    /* ---------- landscape only: side pages beside the text box (DGA mural alley left, DEN crowd right) ---------- */
    const wings = [];
    if (st.orient === 'land') {
      const keepLight = st.lightPos.clone();
      // left: the DGA lane continues into a mural alley
      const wl = sidePage(st, root, { x: -21.5, y: -5, z: 9, rx: 7.2, rz: 5.4, seed: 41, lamp: 6, paint: P => {
        P.layer(P.poly(ribbon([[7.5, 2.4], [2, 1], [-3, .2], [-7, -.6]], 2.3, 2)), PAL.groundDk, { shadow: .6 });
        const R = rng(42); for (let i = 0; i < 60; i++) P.layer(P.rect((R() - .5) * 13, (R() - .5) * 9, .5, .3), mix(PAL.ground, PAL.groundLt, R()), { shadow: .3, lip: .4 }); } });
      st.lightPos.set(0, 5, 2); wl.m = 'DGA'; wings.push(wl);
      const LA = lanes.DGA, wg = new THREE.Group(); wl.top.add(wg); LA.extra = [wg];
      const mural = (seed, lv) => P => { const c = tone(MAJ.DGA, lv), c2 = tone('#FFD166', lv * .8), c3 = tone('#4BE3C1', lv * .7), Rr = rng(seed);
        P.layer(P.rect(-2.1, .25, 4.2, 2.6), mix(PAL.light, PAL.cream, .25), { shadow: .6 });
        for (let k = 0; k < 7; k++) P.layer(P.circle(-1.6 + Rr() * 3.2, .7 + Rr() * 1.9, .25 + Rr() * .35), [c, c2, c3][k % 3], { shadow: .5 });
        P.layer(P.poly(ribbon(quad([-1.8, .6], [0, 2.8], [1.8, .7], 10), .18)), c, { shadow: .4 }); };
      [[-4.2, -2.4, .25], [.4, -2.9, .1], [4.6, -2.2, -.1], [-2, 2.2, 3.3]].forEach(([x, z, yw], k) => {
        const out = [[-2.4, 0], [2.4, 0], [2.4, 3], [1.5, 3.3], [-1.5, 3.3], [-2.4, 3]], seed = 170 + k;
        const c = card(st, { outline: out, base: PAL.mid, ppu: 36, seed, paint: mural(seed, level) });
        stand(st, wg, { x, z, yaw: yw, cards: [c], shadowOutline: out, order: 5 + k * .1, shadow: { len: .5 } });
        LA.repaint.push(lv => c.reprint(mural(seed, lv)));
      });
      [[-5.6, 1.6], [5.4, .8]].forEach(([x, z], k) => lampPost(st, wg, { x, z, h: 3.2, seed: 180 + k, order: 5.5 }));
      const pots = [[-.8, 1.2, '#F25AA6'], [.1, 1.5, '#FFD166'], [1, 1.1, '#4BE3C1']];
      pots.forEach(([x, z, c], k) => { const out = [[-.32, 0], [.32, 0], [.36, .7], [-.36, .7]]; const pk = lv => P => P.layer(P.rect(-.36, .55, .72, .15), tone(c, lv), { shadow: .3 });
        const cc = card(st, { outline: out, base: PAL.light, ppu: 60, seed: 190 + k, paint: pk(level) }); stand(st, wg, { x, z, cards: [cc], shadowOutline: out, order: 5.6 + k * .05, shadow: { blob: false, len: .5 } }); LA.repaint.push(lv => cc.reprint(pk(lv))); });
      // right: the DEN lane opens onto a little square with a crowd and music
      const wr = sidePage(st, root, { x: 21.5, y: -5, z: 9, rx: 7.2, rz: 5.4, seed: 43, lamp: 6, paint: P => {
        P.layer(P.poly(ribbon([[-7.5, 2.4], [-2, 1], [3, .2], [7, -.6]], 2.3, 2)), PAL.groundDk, { shadow: .6 });
        P.layer(P.circle(1, -.4, 2.8), '#4E4A64', { shadow: .6 });
        const R = rng(44); for (let i = 0; i < 60; i++) P.layer(P.rect((R() - .5) * 13, (R() - .5) * 9, .5, .3), mix(PAL.ground, PAL.groundLt, R()), { shadow: .3, lip: .4 }); } });
      wr.m = 'DEN'; wings.push(wr);
      const LD = lanes.DEN, rg = new THREE.Group(); wr.top.add(rg); LD.extra = [rg];
      const spk = card(st, { outline: [[-.8, 0], [.8, 0], [.8, 2.4], [-.8, 2.4]], base: PAL.dark, ppu: 44, seed: 191, paint: P => { [.7, 1.7].forEach(y => { P.layer(P.circle(0, y, .48), PAL.ink, { shadow: .5 }); P.layer(P.circle(0, y, .2), PAL.mid, { shadow: .3 }); }); } });
      stand(st, rg, { x: 1.2, z: -3, yaw: -.2, cards: [spk], shadowOutline: [[-.8, 0], [.8, 0], [.8, 2.4], [-.8, 2.4]], order: 5 });
      [[-2.6, -.6], [-1.2, .8], [.4, -.2], [1.8, 1.2], [3.2, -.4], [-.2, 2.2], [2.6, 2.6]].forEach(([x, z], k) => {
        const pe = person(st, rg, { x, z, yaw: -.35 + (k % 3) * .2, h: 2.2 + (k % 3) * .3, colour: MAJ.DEN, level, seed: 160 + k, kind: k + 1, order: 5.2 + k * .06, arms: k % 3 === 1 });
        LD.repaint.push(lv => pe.recolour(MAJ.DEN, lv));
      });
      const bt = bunting(st, rg, { a: [-5, 3.8, -2.5], b: [5.5, 3.6, -1.5], sag: .7, n: 9, colours: [MAJ.DEN, null], level, seed: 195, order: 5.8 });
      LD.repaint.push(lv => bt.recolour([MAJ.DEN, null], lv));
      [[-4.8, 2.2], [5.6, 1.6]].forEach(([x, z], k) => lampPost(st, rg, { x, z, h: 3.2, seed: 185 + k, order: 5.5 }));
      st.lightPos.copy(keepLight);
    }
    const life = motes(st, top, { n: 26, box: [[-14, 1.5, -12], [14, 6.5, 4]], colours: [PAL.cream, mix(PAL.cream, PAL.light, .5)], size: .16, seed: 9 });

    /* ---------- reaction ---------- */
    let picked = null, pieces = [];
    const clearPieces = () => { pieces.forEach(p => removePiece(st, p)); pieces = []; };
    function setLane(m, lv, dim) {
      const L = lanes[m]; L.arch.repaint(lv); L.repaint.forEach(f => f(lv)); dimGroup(L.grp, dim); (L.extra || []).forEach(g => dimGroup(g, dim));
      if (L.lights) { L.lights.lv = lv; L.lights.dim = dim; }
      if (L.beam) { L.beam.mat.color.set(tone(MAJ.AFX, lv)); L.beam.mat.opacity = lv > .9 ? .4 : .22; }
    }
    function react(m) {
      pieces.forEach(p => { p.hinge.close(0); p.dead = st.time + .9; });
      picked = m;
      LANES.forEach(l => setLane(l.m, l.m === m ? 1 : level * .6, l.m === m ? 1 : .64));
      wings.forEach(w => { if (w.lamp) { w.boost = w.m === m ? 2.2 : .6; w.lamp.color.set(w.m === m ? mix(PAL.guide, MAJ[m], .35) : PAL.guide); } });
      arrows.forEach(a => a.c.reprint(a.paint(a.m === m ? 1 : level * .6)));
      const a = arrows.find(x => x.m === m); if (a && !st.reduce) a.h.kick(2.2);
      const l = LANES.find(x => x.m === m), L = lanes[m];
      if (!st.reduce) L.arch.hinge.kick(-1.6);
      const pts = []; for (let r = 3.6; r < l.len - 1; r += 1.35) pts.push(l.side(r, (pts.length % 2 ? 1 : -1) * 1.5));
      pieces.push(...popRow(st, top, pts, { colour: MAJ[m], seed: m.charCodeAt(1), delay: .15, step: .08 }));
      const g = at(l, R0 + 2.2); G.flyTo(g[0], 3.3, g[1]); G.flash(MAJ[m]);
      life.setColours([MAJ[m], PAL.cream, mix(MAJ[m], PAL.cream, .5)]);
    }
    st.onUpdate((t, dt) => {
      Object.entries(overlays).forEach(([m, o]) => { const tg = m === picked ? .32 : 0; o.material.opacity += (tg - o.material.opacity) * (st.reduce ? 1 : Math.min(1, dt * 2.2)); });
      const dead = pieces.filter(p => p.dead && t > p.dead); if (dead.length) { dead.forEach(p => removePiece(st, p)); pieces = pieces.filter(p => !dead.includes(p)); }
    });

    return {
      root, react,
      frames: {
        focus: { min: [-7.2, 0, -7.6], max: [7.2, 6.6, 3.2] },
        wide: st.orient === 'land' ? { min: [-28.5, -5, -15], max: [28.5, 5, 14] } : { min: [-21, 0, -15], max: [21, 5, 9] }
      },
      reset() {
        clearPieces(); picked = null; G.home(true);
        wings.forEach(w => { w.boost = 1; if (w.lamp) w.lamp.color.set(PAL.guide); }); LANES.forEach(l => setLane(l.m, level, 1)); arrows.forEach(a => a.c.reprint(a.paint(level)));
        Object.values(overlays).forEach(o => o.material.opacity = 0);
        life.setColours([PAL.cream, mix(PAL.cream, PAL.light, .5)]);
      }
    };
  }
};
