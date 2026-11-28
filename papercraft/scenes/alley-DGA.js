/* ===== Alley DGA "ย่านศิลป์: ตรอกจินตนาการ" =====
   A narrow winding lane between painted walls, paper lanterns strung across. An old paper artist holds a
   glowing bottle of paint. Spots (AL.DGA.o order): 1 a big paper character still in sketch · 2 a fantasy
   cityscape on the wall · 3 comic frames, several panels · 4 a shelf of art toys and stickers.
   Lead-in: paint arcs out of the bottle to the spot, which fills with colour and folds up off the wall. */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, ellipse, star, ribbon, quad, cloud, building, person, lampPost, Spring } from '../shared.js';
import { alley, L0 } from './alley-kit.js';

const C = MAJ.DGA, Y = '#FFD166', T = '#4BE3C1', B = '#6C8CFF';
const pencil = mix(PAL.mid, PAL.dark, .35), paper = mix(PAL.cream, C, .06);
/* a print that is a pencil sketch below level 1 and full colour at 1 */
const sk = (lv, col) => lv >= 1 ? col : mix(paper, col, Math.max(0, lv - .3) * .35);
const line = (lv) => lv >= 1 ? shade(C, .5) : pencil;

function panel(st, top, { x, z, yaw, w, h, seed, paint, order, legs = 0, base = paper }) {
  const out = [[-w / 2, legs], [w / 2, legs], [w / 2, legs + h], [-w / 2, legs + h]];
  const c = card(st, { outline: out, base, ppu: 44, seed, paint: paint(L0) });
  const s = stand(st, top, { x, z, yaw, cards: [c], shadowOutline: out, order, shadow: { len: .45 } });
  return { s, c, out };
}

export default alley({
  m: 'DGA', id: 'alley-DGA', seed: 73,
  cam: { land: { pitch: 30 }, port: { pitch: 31 } },
  guideAt: [1.6, 3.2, 3.2],
  pagePaint(P) {
    const R = rng(5), lane = quad([-1.4, 9.4], [3.6, 0], [-1, -9], 16);
    for (let i = 0; i < 340; i++) { const x = (R() - .5) * 30, y = (R() - .5) * 18, w = .5 + R() * .5; P.layer(P.rect(x, y, w, w * .6), mix(mix(PAL.ground, C, .12), mix(PAL.groundLt, C, .25), .3 + R() * .6), { shadow: .3, lip: .45 }); }
    P.layer(P.poly(ribbon(lane, 4.6, 3.2)), mix(PAL.groundDk, C, .2), { shadow: .5 });
    for (let k = 0; k < 30; k++) { const t = k / 30, p = lane[Math.floor(t * 16)]; P.layer(P.poly(ellipse(p[0] + (R() - .5) * 3, p[1] + (R() - .5) * 1, .2 + R() * .2, .14, 9, .1, k)), [C, Y, T, B][k % 4], { shadow: .2, lip: .3 }); }   // paint drips on the lane
  },
  dress(st, top, K) {
    // walls of the lane: low painted houses, leaning in, both sides
    [[-12.6, -3.6, .7, 5.4], [-9.6, -7.6, .45, 6.2], [-4.6, -9.2, .15, 5.2], [4.4, -9.2, -.15, 5.6], [9.6, -7.6, -.45, 6], [12.6, -3.6, -.7, 5]].forEach(([x, z, yaw, h], k) =>
      building(st, top, { x, z, yaw, w: 4.2, h, roof: ['gable', 'step', 'flat'][k % 3], cols: 2, rows: 2, base: mix(PAL.light, [C, Y, T][k % 3], .22), accent: [C, T, Y][k % 3], awning: tone([C, T, Y][k % 3], .8), level: .9, seed: 1410 + k, order: 1 + k * .04, lit: 2, ppu: 26, blur: Math.abs(z) > 8 ? 1.6 : 0 }));
    // the old artist with a glowing paint bottle
    const A = person(st, top, { x: -1.4, z: 2.6, yaw: .25, h: 2.8, colour: C, level: 1, seed: 1420, kind: 2, order: 5, arms: true });
    const bottle = card(st, { outline: [[-.2, 0], [.2, 0], [.24, .4], [.1, .55], [.1, .75], [-.1, .75], [-.1, .55], [-.24, .4]], base: tone(C, 1), ppu: 80, seed: 1421, unlit: true, paint: P => { P.layer(P.poly(ellipse(0, .25, .14, .14, 12)), mix(C, PAL.cream, .6)); P.layer(P.rect(-.1, .62, .2, .13), PAL.cream); } });
    bottle.mesh.position.set(.84, 1.62, .08); bottle.mesh.scale.setScalar(1); A.group.add(bottle.mesh); K.bottle = bottle; K.artist = A;
    const glow = new THREE.PointLight(C, 0, 5, 1); glow.position.set(.72, 1.7, .4); A.group.add(glow); st.onUpdate(t => glow.intensity = 2.2 * st.openness * (1 + Math.sin(t * 2.4) * .15));
    const beard = card(st, { outline: [[-.24, 2.02], [.24, 2.02], [0, 1.64]], base: PAL.cream, ppu: 80, seed: 1422 }); beard.mesh.position.z = .05; A.group.add(beard.mesh);
    // paper lanterns strung across the lane
    [[[-8.6, 5.2, -2.6], [8.6, 5.4, -2.6], 1.1], [[-6.4, 5.6, -6.6], [6.4, 5.6, -6.6], .9]].forEach(([a, b, sag], li) => {
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, a[2])); }
      top.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .025, 4), st.flatMat(PAL.ink)));
      for (let k = 1; k <= 6; k++) { const t = k / 7, col = [C, Y, T, B][(k + li) % 4], c = card(st, { outline: ellipse(0, 0, .3, .4, 14), base: mix(PAL.winLit, col, .5), ppu: 60, th: .04, seed: 1430 + k + li * 10, unlit: true, key: 'dga-lan' + ((k + li) % 4), paint: P => { P.layer(P.rect(-.3, .26, .6, .08), shade(col, .55)); P.layer(P.rect(-.3, -.34, .6, .08), shade(col, .55)); } });
        c.mesh.position.set(a[0] + (b[0] - a[0]) * t, a[1] - Math.sin(t * Math.PI) * sag - .45, a[2]); top.add(c.mesh); const ph = k + li; st.onUpdate(tt => { if (!st.reduce) c.mesh.rotation.z = Math.sin(tt * 1.1 + ph) * .07; }); }
    });
    [[-4.6, 2.4], [5.2, 2.6]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.2, seed: 1450 + k, order: 4, colour: C }));
    // paint pots and brushes by the walls
    [[-3.6, -1.6, C], [-3.1, -1.2, Y], [4.4, -1.4, T]].forEach(([x, z, col], k) => { const out = [[-.32, 0], [.32, 0], [.36, .6], [-.36, .6]];
      stand(st, top, { x, z, cards: [card(st, { outline: out, base: PAL.light, ppu: 60, seed: 1460 + k, paint: P => { P.layer(P.rect(-.36, .42, .72, .2), col, { shadow: .3 }); P.layer(P.poly(ribbon([[0, .5], [.05, .2]], .14)), col, { shadow: .2 }); } })], shadowOutline: out, order: 4.5, shadow: { len: .4, blob: false } }); });
  },
  spots(st, top, K) {
    const out = [];
    /* 1: a big paper character, still a sketch */
    {
      const w = 3, h = 4.2, paint = lv => P => {
        const body = sk(lv, C), skin = sk(lv, '#F6C9A8'), hair = sk(lv, '#5B3A8C'), eye = line(lv);
        P.layer(P.poly(ellipse(0, 1.3, 1.05, 1.15, 20)), body, { shadow: .4 });
        P.layer(P.circle(0, 2.85, .82), skin, { shadow: .4 });
        P.layer(P.poly([[-.9, 3], [.9, 3], [.8, 3.6], [0, 3.85], [-.8, 3.6]]), hair, { shadow: .4 });
        [-1, 1].forEach(s => { P.layer(P.circle(s * .3, 2.8, .12), eye); P.layer(P.poly(ribbon([[s * .9, 1.6], [s * 1.3, 2.2]], .22)), body, { shadow: .3 }); });
        P.layer(P.poly(ribbon(quad([-.25, 2.45], [0, 2.3], [.25, 2.45], 6), .07)), eye);
        P.layer(P.poly(star(.32, .14, 5, 0, 1.4)), sk(lv, Y), { shadow: .3 });
        if (lv < 1) for (let k = 0; k < 6; k++) P.layer(P.poly(ribbon([[-1.3, .3 + k * .65], [-1.1 + (k % 2) * .2, .5 + k * .65]], .03)), pencil);
      };
      const p = panel(st, top, { x: -7, z: -1.6, yaw: .5, w, h, seed: 1500, paint, order: 2.2 });
      out.push({ st: p.s, at: [-6.6, 2.4, -.6], tagY: 4.9, guideDx: 1.6, repaint(lv) { p.c.reprint(paint(lv)); },
        play(t, dt, u) { p.c.mesh.rotation.z = Math.sin(u * 3.2) * .05 * Math.exp(-u * .4); p.c.mesh.position.y = Math.abs(Math.sin(u * 3.2)) * .12 * Math.exp(-u * .4); }, reset() { p.c.mesh.rotation.z = 0; p.c.mesh.position.y = 0; } });
    }
    /* 2: a fantasy cityscape painted across a wall */
    {
      const w = 4, h = 2.8, paint = lv => P => {
        P.layer(P.rect(-w / 2 + .1, .1, w - .2, h - .2), sk(lv, '#3B2E6E'), { shadow: .3 });
        P.layer(P.circle(1.1, 2.1, .38), sk(lv, Y), { shadow: .3 });
        [[-1.6, .9, 1.5], [-.9, .7, 2.1], [-.2, .8, 1.3], [.5, .6, 1.8], [1.3, .7, 1.2]].forEach(([x, w2, hh], k) => { P.layer(P.poly([[x - w2 / 2, .1], [x + w2 / 2, .1], [x + w2 / 2, hh], [x, hh + .45], [x - w2 / 2, hh]]), sk(lv, [C, T, B, '#9A7BFF', Y][k]), { shadow: .4 }); for (let r = 0; r < 3; r++) P.layer(P.rect(x - .1, .35 + r * .35, .2, .16), lv >= 1 ? PAL.winLit : mix(paper, pencil, .3), { shadow: .2, lip: 0 }); });
        P.layer(P.poly(cloud(1.4, .4, 3, 4).map(([a, b]) => [a - .9, b + 2.2])), sk(lv, PAL.cream), { shadow: .3 });
      };
      const p = panel(st, top, { x: -2.6, z: -4.4, yaw: .12, w, h, seed: 1510, paint, order: 2.3, legs: .3 });
      out.push({ st: p.s, at: [-2.6, 2.2, -4], tagY: 3.9, repaint(lv) { p.c.reprint(paint(lv)); p.c.mat.emissive.setScalar(lv >= 1 ? .2 : 0); p.c.mat.emissiveMap = p.c.tex; p.c.mat.needsUpdate = true; },
        play(t, dt, u) { p.c.mat.emissive.setScalar(.18 + Math.sin(u * 2.6) * .06); } });
    }
    /* 3: comic frames — four panels on a board, they pop forward one by one */
    {
      const w = 3.8, h = 2.8, board = card(st, { outline: [[-w / 2, .3], [w / 2, .3], [w / 2, .3 + h], [-w / 2, .3 + h]], base: mix(PAL.light, C, .15), ppu: 30, seed: 1520 });
      const pans = [[-.95, 2.2, 1.7, 1.1], [.95, 2.2, 1.7, 1.1], [-.95, .95, 1.7, 1.1], [.95, .95, 1.7, 1.1]].map(([cx, cy, pw, ph], k) => {
        const paint = lv => P => { const bg = sk(lv, [B, Y, T, C][k]); P.layer(P.rect(cx - pw / 2 + .06, cy - ph / 2 + .06, pw - .12, ph - .12), bg, { shadow: .3 }); P.layer(P.circle(cx - .3 + k * .1, cy - .1, .28), sk(lv, '#F6C9A8'), { shadow: .3 }); P.layer(P.poly(ellipse(cx + .35, cy + .25, .38, .2, 12)), lv >= 1 ? PAL.cream : mix(paper, pencil, .15), { shadow: .2 }); P.layer(P.poly([[cx + .15, cy + .1], [cx + .05, cy - .05], [cx + .25, cy + .08]]), lv >= 1 ? PAL.cream : mix(paper, pencil, .15)); };
        const c = card(st, { outline: [[cx - pw / 2, cy - ph / 2], [cx + pw / 2, cy - ph / 2], [cx + pw / 2, cy + ph / 2], [cx - pw / 2, cy + ph / 2]], base: PAL.ink, ppu: 50, th: .05, seed: 1521 + k, paint: paint(L0) });
        c.mesh.position.z = .06; c.paint = paint; return c;
      });
      const s = stand(st, top, { x: 2.8, z: -4.4, yaw: -.12, cards: [board, ...pans], shadowOutline: [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], order: 2.3 });
      out.push({ st: s, at: [2.8, 2.4, -4], tagY: 4.1, repaint(lv) { pans.forEach(c => c.reprint(c.paint(lv))); },
        play(t, dt, u) { pans.forEach((c, k) => { const v = Math.max(0, u - k * .25); c.mesh.position.z = .06 + Math.max(0, Math.sin(Math.min(v, .6) / .6 * Math.PI)) * .35; }); }, reset() { pans.forEach(c => c.mesh.position.z = .06); } });
    }
    /* 4: a shelf of art toys and stickers, the toys hop */
    {
      const shelf = [[-1.6, 0], [1.6, 0], [1.6, 3], [-1.6, 3]];
      const sc = card(st, { outline: shelf, base: mix(PAL.light, '#B08A62', .3), ppu: 40, seed: 1530, paint: P => { [.1, 1.05, 2].forEach(y => P.layer(P.rect(-1.55, y, 3.1, .12), shade(mix(PAL.light, '#B08A62', .3), .7), { shadow: .4 })); } });
      const stickerPaint = lv => P => { [[-1.1, 2.6, C], [-.4, 2.7, Y], [.5, 2.55, T], [1.15, 2.7, B]].forEach(([x, y, col], k) => { P.layer(P.poly(k % 2 ? star(.22, .1, 5, x, y) : ellipse(x, y, .2, .2, 12)), sk(lv, col), { shadow: .3 }); }); };
      const st2 = card(st, { outline: [[-1.5, 2.25], [1.5, 2.25], [1.5, 2.95], [-1.5, 2.95]], base: mix(PAL.light, '#B08A62', .3), ppu: 60, seed: 1531, paint: stickerPaint(L0) }); st2.mesh.position.z = .04;
      const toys = [[-1, .22, C, 0], [0, .22, Y, 1], [1, .22, T, 2], [-.55, 1.17, B, 3], [.55, 1.17, C, 4]].map(([x, y, col, k]) => {
        const o = k % 2 ? [[-.3, 0], [.3, 0], [.3, .5], [.18, .75], [.28, .9], [.1, .85], [0, .95], [-.1, .85], [-.28, .9], [-.18, .75], [-.3, .5]] : [...ellipse(0, .4, .32, .4, 14)];
        const paint = lv => P => { P.layer(P.circle(0, .55, .2), sk(lv, '#F6C9A8'), { shadow: .3 }); [-1, 1].forEach(s => P.layer(P.circle(s * .08, .58, .04), line(lv))); };
        const c = card(st, { outline: o, base: sk(L0, col), ppu: 70, seed: 1540 + k, paint: paint(L0) });
        const g = new THREE.Group(); g.position.set(x, y, .12); g.add(c.mesh); return { c, g, col, paint, y };
      });
      const s = stand(st, top, { x: 7, z: -1.6, yaw: -.5, cards: [sc, st2, ...toys.map(o => o.g)], shadowOutline: shelf, order: 2.2 });
      out.push({ st: s, at: [6.6, 2.4, -.6], tagY: 4.7, guideDx: -1.6,
        repaint(lv) { st2.reprint(stickerPaint(lv)); toys.forEach(o => o.c.reprint(o.paint(lv), sk(lv, o.col))); },
        play(t, dt, u) { toys.forEach((o, k) => { const v = (u * 1.6 - k * .22) % 2.4; o.g.position.y = o.y + (v > 0 && v < 1 ? Math.sin(v * Math.PI) * .3 : 0); }); }, reset() { toys.forEach(o => o.g.position.y = o.y); } });
    }
    return out;
  },
  lead(i, K) {   // paint arcs out of the bottle to the spot: a string of drops appearing one after another
    const s = K.spots[i], a = new THREE.Vector3(-1.4 + .84, 2.3, 2.7), b = new THREE.Vector3(s.at[0], s.at[1] + .2, s.at[2] + .6);
    const n = 16, cols = [K.C, mix(K.C, '#FFD166', .5), '#FFD166'];
    for (let k = 0; k < n; k++) {
      const t = (k + 1) / (n + 1), p = a.clone().lerp(b, t); p.y += Math.sin(t * Math.PI) * 2.6;
      const c = card(K.st, { outline: ellipse(0, 0, .34, .27, 10, .2, k), base: cols[k % 3], ppu: 60, th: .03, seed: 1560 + k, unlit: true, key: 'drop' + (k % 3) });
      const g = new THREE.Group(); g.position.copy(p); g.add(c.mesh); g.visible = false; K.top.add(g); K.extras.push(g);
      K.at(k * .045, () => g.visible = true); K.at(.9 + k * .03, () => g.visible = false);
    }
    if (!K.st.reduce) K.artist.hinge.kick(1.4);
    return .75;
  },
  frames: orient => ({
    focus: orient === 'land' ? { min: [-9.2, 0, -5], max: [9.2, 5.6, 3.6] } : { min: [-9.4, 0, -5], max: [9.4, 6, 3.6] },
    wide: orient === 'land' ? { min: [-24.8, -3.6, -9.4], max: [24.8, 6, 11.8] } : { min: [-15.5, 0, -9.8], max: [15.5, 6, 9] }
  })
});
