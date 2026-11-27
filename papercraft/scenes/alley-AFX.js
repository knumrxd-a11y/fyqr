/* ===== Alley AFX "ย่านภาพยนตร์: กำแพงแห่งเรื่องราว" =====
   A big wall that is an open-air movie screen, wrapped in paper film strips. A paper director in a hat sits in a
   canvas chair beside a projector. Spots (AL.AFX.o order): 1 a jointed paper puppet · 2 clay on a turntable
   · 3 paper fire, water and smoke · 4 transparent layered sheets.
   Lead-in: the projector swings its beam onto the spot; then the spot comes alive (the puppet waves, the clay
   turns, the fire flares, the layers slide into register). */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, ellipse, star, ribbon, quad, cloud, building, person, lampPost, beam, puff, Spring } from '../shared.js';
import { alley, L0 } from './alley-kit.js';

const C = MAJ.AFX, W = '#4BA3F5', Y = '#FFD166';
const PROJ = new THREE.Vector3(1.2, 1.9, 3.8);
const filmPaint = (len, vertical) => P => { const n = Math.floor(len / .42); for (let k = 0; k < n; k++) { const a = -len / 2 + .12 + k * .42; if (vertical) { P.layer(P.rect(-.32, a, .12, .2), PAL.cream, { shadow: .2, lip: 0 }); P.layer(P.rect(.2, a, .12, .2), PAL.cream, { shadow: .2, lip: 0 }); } else { P.layer(P.rect(a, -.32, .2, .12), PAL.cream, { shadow: .2, lip: 0 }); P.layer(P.rect(a, .2, .2, .12), PAL.cream, { shadow: .2, lip: 0 }); } } };

export default alley({
  m: 'AFX', id: 'alley-AFX', seed: 75,
  cam: { land: { pitch: 29 }, port: { pitch: 30 } },
  guideAt: [-2.4, 3.3, 3.4],
  pagePaint(P) {
    const R = rng(7);
    for (let i = 0; i < 340; i++) { const x = (R() - .5) * 30, y = (R() - .5) * 18, w = .6 + R() * .5; P.layer(P.rect(x, y, w, w * .6), mix(mix(PAL.ground, C, .1), mix(PAL.groundLt, C, .22), .3 + R() * .6), { shadow: .3, lip: .45 }); }
    P.layer(P.poly(ellipse(0, 1.2, 11, 5.4, 36)), mix(PAL.groundDk, C, .16), { shadow: .5 });           // the screening yard
    for (let r = 0; r < 2; r++) for (let k = -4; k <= 4; k++) P.layer(P.rect(k * 1.5 - .5, -3.4 - r * 1.2, 1, .35), mix(PAL.mid, C, .25), { shadow: .4 });   // rows of floor seats (printed)
    P.layer(P.poly(ribbon(quad([-12, -6], [-2, -3.5], [12, -7.5], 12), .9)), PAL.dark, { shadow: .4 }); P.layer(P.poly(ribbon(quad([-12, -6], [-2, -3.5], [12, -7.5], 12), .6)), mix(PAL.dark, C, .3), { shadow: .2 });   // a loose film strip
  },
  dress(st, top, K) {
    // the screen wall, wrapped in film strips
    const sw = 12, sh = 5.8, y0 = .6;
    const screenPaint = (glow) => P => { P.layer(P.rect(-sw / 2 + .5, y0 + .5, sw - 1, sh - 1), glow ? mix(PAL.cream, glow, .35) : mix(PAL.light, PAL.cream, .4), { shadow: .4 }); };
    const scr = card(st, { outline: [[-sw / 2, 0], [sw / 2, 0], [sw / 2, y0 + sh], [-sw / 2, y0 + sh]], base: mix(PAL.mid, C, .25), ppu: 30, seed: 1610, paint: screenPaint(null) });
    const strips = [];
    [[0, y0 + sh - .15, sw + .6, false], [0, y0 + .2, sw + .6, false], [-sw / 2 - .1, y0 + sh / 2, sh + .4, true], [sw / 2 + .1, y0 + sh / 2, sh + .4, true]].forEach(([x, y, len, v], k) => {
      const o = v ? [[-.38, -len / 2], [.38, -len / 2], [.38, len / 2], [-.38, len / 2]] : [[-len / 2, -.38], [len / 2, -.38], [len / 2, .38], [-len / 2, .38]];
      const c = card(st, { outline: o, base: mix(PAL.dark, C, .3), ppu: 40, seed: 1611 + k, paint: filmPaint(len, v) }); c.mesh.position.set(x, y, .08 + k * .01); c.mesh.rotation.z = (k - 1.5) * .015; strips.push(c);
    });
    const ss = stand(st, top, { x: 0, z: -7.2, cards: [scr, ...strips], shadowOutline: [[-sw / 2, 0], [sw / 2, 0], [sw / 2, y0 + sh], [-sw / 2, y0 + sh]], order: 1.2 });
    K.screen = { c: scr, paint: screenPaint };
    // walls on both sides
    [[-11.6, -5.2, .6, 5], [-13, -1, .9, 4.4], [11.6, -5.2, -.6, 5.2], [13, -1, -.9, 4.6]].forEach(([x, z, yaw, h], k) =>
      building(st, top, { x, z, yaw, w: 4, h, roof: ['flat', 'gable'][k % 2], cols: 2, rows: 2, base: mix(PAL.light, C, .2), accent: C, awning: tone(C, .8), level: .9, seed: 1620 + k, order: 1 + k * .05, lit: 2, ppu: 24, blur: 1.2 }));
    // the director in a hat, in a canvas chair, and the projector on a stand
    const D = person(st, top, { x: -1.4, z: 3.6, yaw: .45, h: 2.5, colour: C, level: 1, seed: 1630, kind: 1, order: 5 });
    const hat = card(st, { outline: [[-.55, 2.05], [.55, 2.05], [.55, 2.14], [.32, 2.16], [.3, 2.5], [-.3, 2.5], [-.32, 2.16], [-.55, 2.14]], base: PAL.ink, ppu: 70, seed: 1631, paint: P => P.layer(P.rect(-.3, 2.16, .6, .08), tone(C, 1)) }); hat.mesh.position.z = .05; D.group.add(hat.mesh);
    const chair = card(st, { outline: [[-.8, 0], [-.6, 0], [0, .55], [.6, 0], [.8, 0], [.15, .7], [.8, 1.15], [.8, 1.3], [-.8, 1.3], [-.8, 1.15], [-.15, .7]], base: shade(mix(PAL.light, '#B08A62', .4), .9), ppu: 60, seed: 1632, paint: P => P.layer(P.rect(-.8, 1.1, 1.6, .2), tone(C, .9)) });
    chair.mesh.position.z = .12; D.group.add(chair.mesh); K.director = D;
    const pj = card(st, { outline: [[-.5, 1.4], [.5, 1.4], [.5, 2.2], [-.5, 2.2]], base: PAL.dark, ppu: 60, seed: 1640, paint: P => { P.layer(P.circle(-.25, 2.55, .3), PAL.dark); P.layer(P.circle(.25, 2.55, .3), PAL.dark); P.layer(P.circle(0, 1.8, .2), Y); } });
    const pjo = [[-.5, 1.4], [.5, 1.4], [.5, 2.2], [.55, 2.85], [-.55, 2.85]];
    const reels = card(st, { outline: [...ellipse(-.25, 2.55, .3, .3, 12)], base: PAL.dark, ppu: 50, seed: 1641 }); reels.mesh.position.z = -.02;
    const reels2 = card(st, { outline: [...ellipse(.25, 2.55, .3, .3, 12)], base: PAL.dark, ppu: 50, seed: 1642 }); reels2.mesh.position.z = -.02;
    const tri = card(st, { outline: [[-.5, 0], [-.35, 0], [0, 1.25], [.35, 0], [.5, 0], [.06, 1.42], [-.06, 1.42]], base: PAL.dark, ppu: 50, seed: 1643 });
    const ps = stand(st, top, { x: PROJ.x, z: PROJ.z, yaw: Math.PI, cards: [tri, pj, reels, reels2], shadowOutline: pjo, order: 5.2 });
    K.proj = ps;
    st.onUpdate((t) => { if (!st.reduce) { reels.mesh.rotation.z = t * 2; reels2.mesh.rotation.z = t * 2; } });
    // the beam: a tissue cone pointed from the projector at a target
    K.pbeam = beam(st, top, { x: PROJ.x, y: PROJ.y + .2, z: PROJ.z - .3, h: 10, w: .4, w2: 3.4, colour: mix(PAL.guide, C, .3), opacity: 0 });
    K.aim = (to) => { const d = to.clone().sub(new THREE.Vector3(PROJ.x, PROJ.y + .2, PROJ.z - .3)); const L = d.length(); K.pbeam.group.scale.set(1, L / 10, 1); K.pbeam.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
    K.aim(new THREE.Vector3(0, 3.4, -7)); K.pbeam.mat.opacity = .18;
    st.onUpdate((t, dt) => { const b = K.bt; if (!b) return; st.reduce ? b.aim.snap(b.aim.target) : b.aim.step(dt); const u = Math.min(1, b.aim.x); b.cur.copy(b.from).lerp(b.to, u); K.aim(b.cur); K.pbeam.mat.opacity = .18 + .22 * u; });
    [[-9.4, 2.4], [9.4, 2.4]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.2, seed: 1650 + k, order: 4, colour: C }));
  },
  spots(st, top, K) {
    const out = [], sk = (lv, c) => lv >= 1 ? c : mix(PAL.light, c, lv * .5);
    /* 1: a jointed paper puppet, split pins at the joints; its arm waves */
    {
      const paint = lv => P => { P.layer(P.circle(0, 2.55, .42), sk(lv, '#F6C9A8'), { shadow: .4 }); P.layer(P.poly([[-.5, 1.1], [.5, 1.1], [.4, 2.1], [-.4, 2.1]]), sk(lv, C), { shadow: .4 }); [[-.25, 2.6], [.25, 2.6]].forEach(([x, y]) => P.layer(P.circle(x, y, .07), PAL.ink)); P.layer(P.poly([[-.45, 1.1], [-.1, 1.1], [-.15, .1], [-.42, .1]]), sk(lv, shade(C, .7)), { shadow: .3 }); P.layer(P.poly([[.1, 1.1], [.45, 1.1], [.42, .1], [.15, .1]]), sk(lv, shade(C, .7)), { shadow: .3 }); [[0, 2.1], [-.28, 1.1], [.28, 1.1]].forEach(([x, y]) => P.layer(P.circle(x, y, .07), Y)); };
      const body = card(st, { outline: [[-.5, .05], [.5, .05], [.5, 2.1], [.42, 2.2], [.42, 2.95], [-.42, 2.95], [-.42, 2.2], [-.5, 2.1]], base: sk(L0, C), ppu: 60, seed: 1700, paint: paint(L0) });
      const armO = [[-.12, 0], [.12, 0], [.1, -.95], [-.1, -.95]];
      const armP = lv => P => { P.layer(P.circle(0, -.95, .14), sk(lv, '#F6C9A8')); P.layer(P.circle(0, 0, .06), Y); };
      const arms = [-1, 1].map(s => { const c = card(st, { outline: armO, base: sk(L0, shade(C, .85)), ppu: 60, seed: 1701 + s, paint: armP(L0) }); const g = new THREE.Group(); g.position.set(s * .52, 1.95, .05); g.add(c.mesh); g.rotation.z = s * .25; return { c, g, s }; });
      const rod = card(st, { outline: [[-.03, 2.9], [.03, 2.9], [.03, 4], [-.03, 4]], base: PAL.dark, ppu: 40, seed: 1704 });
      const s = stand(st, top, { x: -6.4, z: -.6, yaw: .45, cards: [rod, body, ...arms.map(a => a.g)], shadowOutline: [[-.5, 0], [.5, 0], [.5, 2.95], [-.5, 2.95]], order: 2.2 });
      out.push({ st: s, at: [-6, 2.2, .2], tagY: 4.6, guideDx: 1.5, repaint(lv) { body.reprint(paint(lv), sk(lv, C)); arms.forEach(a => a.c.reprint(armP(lv), sk(lv, shade(C, .85)))); },
        play(t, dt, u) { const a = arms[1]; a.g.rotation.z = .25 + 2.2 * Math.min(1, u * 2) + Math.sin(u * 7) * .35; arms[0].g.rotation.z = -.25 - Math.sin(u * 3.5) * .15; body.mesh.rotation.z = Math.sin(u * 3.5) * .04; },
        reset() { arms[0].g.rotation.z = -.25; arms[1].g.rotation.z = .25; body.mesh.rotation.z = 0; } });
    }
    /* 2: clay on a turntable — a crossed figure that turns */
    {
      const table = card(st, { outline: [[-1.1, 0], [1.1, 0], [1.1, .7], [-1.1, .7]], base: mix(PAL.mid, C, .2), ppu: 44, seed: 1710 });
      const disc = card(st, { outline: ellipse(0, 0, .9, .9, 24), base: PAL.dark, ppu: 40, seed: 1711, paint: P => P.layer(P.poly(ellipse(0, 0, .7, .7, 24)), mix(PAL.dark, PAL.mid, .4)) }); disc.mesh.rotation.x = -Math.PI / 2; disc.mesh.position.set(0, .72, -.2);
      const fig = lv => P => { P.layer(P.poly(ellipse(0, 1.05, .42, .38, 14)), sk(lv, '#C96A3B'), { shadow: .4 }); P.layer(P.circle(0, 1.6, .26), sk(lv, '#D9875A'), { shadow: .4 }); P.layer(P.circle(-.1, 1.63, .045), PAL.ink); P.layer(P.circle(.1, 1.63, .045), PAL.ink); };
      const f1 = card(st, { outline: ellipse(0, 1.25, .45, .62, 18), base: sk(L0, '#C96A3B'), ppu: 70, seed: 1712, paint: fig(L0) });
      const f2 = card(st, { outline: ellipse(0, 1.25, .45, .62, 18), base: sk(L0, '#C96A3B'), ppu: 70, seed: 1713, paint: fig(L0) }); f2.mesh.rotation.y = Math.PI / 2;
      const spin = new THREE.Group(); spin.position.set(0, 0, -.2); spin.add(f1.mesh, f2.mesh);
      const s = stand(st, top, { x: -2.6, z: -2.4, yaw: .1, cards: [table, disc, spin], shadowOutline: [[-1.1, 0], [1.1, 0], [1.1, 1.9], [-1.1, 1.9]], order: 2.3 });
      out.push({ st: s, at: [-2.6, 1.8, -2], tagY: 3.4, repaint(lv) { [f1, f2].forEach(f => f.reprint(fig(lv), sk(lv, '#C96A3B'))); }, play(t, dt, u) { spin.rotation.y = u * 1.8; disc.mesh.rotation.z = u * 1.8; }, reset() { spin.rotation.y = 0; } });
    }
    /* 3: paper fire, water and smoke */
    {
      const flame = (k) => [[-.5, 0], [.5, 0], [.4, .7], [.55, 1.2], [.2, .95], [.12, 1.6], [-.1, 1.05], [-.35, 1.35], [-.45, .7]].map(([a, b]) => [a * (1 - k * .25), b * (1 - k * .2)]);
      const fp = (lv, k) => P => P.layer(P.poly(flame(k + 1).map(([a, b]) => [a * .6, b * .7])), sk(lv, k ? Y : '#FF6A3D'), { shadow: .3 });
      const fl = [0, 1].map(k => { const c = card(st, { outline: flame(k), base: sk(L0, k ? '#FF6A3D' : C), ppu: 60, seed: 1720 + k, paint: fp(L0, k) }); c.mesh.position.set(-.7 + k * .25, 0, k * .05); return c; });
      const wave = [[-.9, 0], [.9, 0], [.9, .5], [.6, .8], [.3, .55], [0, .85], [-.3, .55], [-.6, .8], [-.9, .5]];
      const wp = lv => P => P.layer(P.poly(wave.map(([a, b]) => [a * .8, b * .6])), sk(lv, mix(W, PAL.cream, .4)), { shadow: .3 });
      const wv = card(st, { outline: wave, base: sk(L0, W), ppu: 60, seed: 1723, paint: wp(L0) }); wv.mesh.position.set(.9, 0, .1);
      const smk = card(st, { outline: cloud(1.3, .8, 3, 9).map(([a, b]) => [a, b + 1.9]), base: sk(L0, PAL.light), ppu: 50, seed: 1724 }); smk.mesh.position.set(.1, 0, -.1);
      const s = stand(st, top, { x: 2.6, z: -2.4, yaw: -.1, cards: [smk, ...fl, wv], shadowOutline: [[-1, 0], [1.6, 0], [1.6, 1.4], [-1, 1.4]], order: 2.3 });
      out.push({ st: s, at: [2.8, 1.8, -2], tagY: 3.6, repaint(lv) { fl.forEach((c, k) => c.reprint(fp(lv, k), sk(lv, k ? '#FF6A3D' : C))); wv.reprint(wp(lv), sk(lv, W)); smk.reprint(null, sk(lv, PAL.light)); fl.forEach(c => { c.mat.emissive.setScalar(lv >= 1 ? .45 : 0); c.mat.emissiveMap = c.tex; c.mat.needsUpdate = true; }); },
        play(t, dt, u) { fl.forEach((c, k) => { c.mesh.position.y = Math.max(0, Math.sin(u * 9 + k * 2)) * .12; c.mesh.rotation.z = Math.sin(u * 6 + k) * .06; }); wv.mesh.position.x = .9 + Math.sin(u * 2.4) * .15; smk.mesh.position.y = (u * .35) % 1.2; },
        reset() { smk.mesh.position.y = 0; } });
    }
    /* 4: transparent layered sheets that slide into register */
    {
      const sheets = [[-.9, W, 0], [.0, C, 1], [.9, Y, 2]].map(([dx, col, k]) => {
        const p = lv => P => { if (k === 0) P.layer(P.poly([[-1, .5], [1, .5], [1, 1.2], [0, 1.6], [-1, 1.3]]), sk(lv, col)); if (k === 1) { P.layer(P.circle(.3, 1.9, .35), sk(lv, col)); } if (k === 2) P.layer(P.poly([[-.5, .5], [-.2, .5], [-.2, 1.5], [-.5, 1.5]]), sk(lv, col)); };
        const c = card(st, { outline: [[-1.2, .3], [1.2, .3], [1.2, 2.5], [-1.2, 2.5]], base: '#FFFFFF', ppu: 44, th: .02, seed: 1730 + k, paint: p(L0), rim: false });
        c.mat.transparent = true; c.mat.opacity = .5; c.mat.depthWrite = false; c.mesh.position.set(dx, 0, -k * .25); c.mesh.renderOrder = 3 + k; c.p = p; c.dx = dx; return c;
      });
      const frame = card(st, { outline: [[-1.3, 0], [-1.15, 0], [-1.15, 2.6], [1.15, 2.6], [1.15, 0], [1.3, 0], [1.3, 2.75], [-1.3, 2.75]], base: PAL.dark, ppu: 40, seed: 1734 });
      const s = stand(st, top, { x: 6.4, z: -.6, yaw: -.45, cards: [frame, ...sheets], shadowOutline: [[-1.3, 0], [1.3, 0], [1.3, 2.75], [-1.3, 2.75]], order: 2.2 });
      const sl = new Spring(1, 4, .75);
      out.push({ st: s, at: [6, 2.2, .2], tagY: 4.3, guideDx: -1.5, repaint(lv) { sheets.forEach(c => { c.reprint(c.p(lv)); c.mat.opacity = lv >= 1 ? .7 : .5; }); },
        play(t, dt, u) { sl.target = 0; st.reduce ? sl.snap(0) : sl.step(dt); sheets.forEach(c => c.mesh.position.x = c.dx * sl.x); }, reset() { sl.snap(1); sheets.forEach(c => c.mesh.position.x = c.dx); } });
    }
    return out;
  },
  lead(i, K) {   // the projector turns its beam onto the spot
    const s = K.spots[i], to = new THREE.Vector3(s.at[0], s.at[1] - .2, s.at[2]);
    K.bt = { from: K.bt ? K.bt.cur.clone() : new THREE.Vector3(0, 3.4, -7), to, cur: new THREE.Vector3(0, 3.4, -7), aim: new Spring(0, 5, .8) }; K.bt.aim.target = 1;
    K.screen.c.reprint(K.screen.paint(K.C));
    if (!K.st.reduce) K.director.hinge.kick(1.2);
    return .9;
  },
  clear(K) { if (!K.pbeam) return; K.bt = null; K.aim(new THREE.Vector3(0, 3.4, -7)); K.pbeam.mat.opacity = .18; K.screen.c.reprint(K.screen.paint(null)); },
  frames: orient => ({
    focus: orient === 'land' ? { min: [-8.6, 0, -6], max: [8.6, 4.2, 4.2] } : { min: [-9, 0, -7.4], max: [9, 6.8, 3.8] },
    wide: orient === 'land' ? { min: [-24.8, -3.6, -9.4], max: [24.8, 6.6, 11.8] } : { min: [-15.5, 0, -9.8], max: [15.5, 6.6, 9] }
  })
});
