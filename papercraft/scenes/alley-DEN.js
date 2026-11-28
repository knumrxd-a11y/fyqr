/* ===== Alley DEN "ย่านบันเทิง: เวทีแห่งตัวตน" =====
   A small stage in the middle of the city, its paper curtain open; a paper MC holds a mic out toward the guide.
   Spots (AL.DEN.o order): 1 a big screen on the stage, the show everyone waits for · 2 a paper crowd in front of
   the stage with spotlights · 3 a translucent virtual character with a streaming mic · 4 fan light sticks
   shining one after another.
   Lead-in: the spotlight on the overhead truss swings to the spot; it lights up in colour while blue paper
   sparkles fall gently. */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, ellipse, star, ribbon, quad, cloud, building, person, lampPost, bunting, beam, motes, Spring } from '../shared.js';
import { alley, L0 } from './alley-kit.js';

const C = MAJ.DEN, Y = '#FFD166', P2 = '#F25AA6', V = '#9A7BFF';
const sk = (lv, c) => lv >= 1 ? c : mix(PAL.light, c, .2 + lv * .4);
const TRUSS = new THREE.Vector3(0, 8.4, 1.4);

export default alley({
  m: 'DEN', id: 'alley-DEN', seed: 79,
  cam: { land: { pitch: 27 }, port: { pitch: 32 } },
  guideAt: [3, 3.1, 4.2],
  pagePaint(P) {
    const R = rng(9);
    for (let i = 0; i < 340; i++) { const x = (R() - .5) * 30, y = (R() - .5) * 18, w = .6 + R() * .5; P.layer(P.rect(x, y, w, w * .6), mix(mix(PAL.ground, C, .1), mix(PAL.groundLt, C, .25), .3 + R() * .6), { shadow: .3, lip: .45 }); }
    P.layer(P.poly(ellipse(-1, 1.4, 11.5, 5.6, 40)), mix(PAL.groundDk, C, .2), { shadow: .5 });       // the show square
    for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2; P.layer(P.circle(-1 + Math.cos(a) * 11.1, 1.4 + Math.sin(a) * 5.3, .16), mix(PAL.cream, C, .3), { shadow: .3 }); }
  },
  dress(st, top, K) {
    // buildings round the square, blue tones, lit
    [[-12.6, -4.4, .6, 5.2], [-9, -8.6, .25, 6.2], [9, -8.6, -.25, 6], [12.6, -4.4, -.6, 5.4]].forEach(([x, z, yaw, h], k) =>
      building(st, top, { x, z, yaw, w: 4.4, h, roof: ['gable', 'flat'][k % 2], cols: 2, rows: 2, base: mix(PAL.light, C, .2), accent: C, awning: tone(C, .85), level: .9, seed: 2010 + k, order: 1 + k * .05, lit: 3, ppu: 24, blur: Math.abs(z) > 8 ? 1.6 : 0 }));
    // an overhead truss across the square with the moving spotlight
    const tr = card(st, { outline: [[-10.4, 8.2], [10.4, 8.2], [10.4, 8.6], [-10.4, 8.6]], base: PAL.dark, ppu: 30, seed: 2020, paint: P => { for (let k = 0; k < 36; k++) P.layer(P.poly(ribbon([[-9 + k * .5, 8.22], [-8.75 + k * .5, 8.58]], .05)), mix(PAL.dark, PAL.mid, .5)); } });
    const legs = [-10.4, 10.4].map((x, k) => { const c = card(st, { outline: [[x - .15, 0], [x + .15, 0], [x + .15, 8.4], [x - .15, 8.4]], base: PAL.dark, ppu: 30, seed: 2021 + k }); return c; });
    const head = card(st, { outline: [[-.45, -.2], [.45, -.2], [.6, .5], [-.6, .5]], base: PAL.dark, ppu: 60, seed: 2023, paint: P => P.layer(P.poly(ellipse(0, .15, .35, .25, 12)), Y) }); head.mesh.position.set(0, 7.6, .1);
    stand(st, top, { x: 0, z: TRUSS.z, cards: [tr, ...legs, head], order: 1.6, shadowOutline: [[-9, 0], [9, 0], [9, .4], [-9, .4]] });
    K.sbeam = beam(st, top, { x: TRUSS.x, y: TRUSS.y, z: TRUSS.z, h: 10, w: .5, w2: 3.6, colour: mix(PAL.guide, C, .3), opacity: .16 });
    K.aim = (to) => { const d = to.clone().sub(TRUSS); const L = d.length(); K.sbeam.group.scale.set(1, L / 10, 1); K.sbeam.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
    K.home = new THREE.Vector3(0, 0, 3.4); K.aim(K.home);
    st.onUpdate((t, dt) => { const b = K.bt; if (!b) return; st.reduce ? b.s.snap(b.s.target) : b.s.step(dt); const u = Math.min(1, b.s.x); b.cur.copy(b.from).lerp(b.to, u); K.aim(b.cur); K.sbeam.mat.opacity = .16 + .26 * u; });
    // the MC holding a mic out toward the guide
    const MC = person(st, top, { x: .8, z: 3.8, yaw: -.35, h: 2.6, colour: C, level: 1, seed: 2030, kind: 1, order: 5, arms: true });
    const mic = card(st, { outline: [[-.06, 0], [.06, 0], [.08, .42], [.16, .5], [.16, .7], [0, .78], [-.16, .7], [-.16, .5], [-.08, .42]], base: PAL.dark, ppu: 80, seed: 2031, paint: P => P.layer(P.poly(ellipse(0, .62, .14, .14, 12)), mix(PAL.mid, PAL.light, .4)) });
    mic.mesh.position.set(.86, 1.5, .08); mic.mesh.rotation.z = -.7; MC.group.add(mic.mesh); K.mc = MC;
    const bow = card(st, { outline: [[-.2, 1.42], [0, 1.5], [.2, 1.42], [.2, 1.62], [0, 1.54], [-.2, 1.62]], base: tone(Y, 1), ppu: 80, seed: 2032 }); bow.mesh.position.z = .06; MC.group.add(bow.mesh);
    bunting(st, top, { a: [-12, 5.2, -4], b: [-3, 6.6, -5.6], sag: .8, n: 7, colours: [C, Y, P2], level: 1, seed: 2035, order: 1.5 });
    bunting(st, top, { a: [12, 5.2, -4], b: [3, 6.6, -5.6], sag: .8, n: 7, colours: [C, V, Y], level: 1, seed: 2036, order: 1.5 });
    [[-10, 2.4], [8.6, 2.6]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.2, seed: 2040 + k, order: 4, colour: C }));
  },
  spots(st, top, K) {
    const out = [];
    /* 1: the small stage, curtain open, with a big screen — the show everyone waits for */
    {
      const sw = 6.6, sx = -5.4;
      const deck = card(st, { outline: [[-sw / 2, 0], [sw / 2, 0], [sw / 2, 1], [-sw / 2, 1]], base: PAL.deep, ppu: 36, seed: 2100, paint: P => { for (let k = 0; k < 7; k++) P.layer(P.poly(ellipse(-sw / 2 + .5 + k * 1, 1, .48, .28, 10).filter(([, y]) => y <= 1)), shade(C, .6), { shadow: .4 }); } });
      const frameO = [[-sw / 2, 1], [sw / 2, 1], [sw / 2, 5.6], [-sw / 2, 5.6]], hole = [[-sw / 2 + .6, 1], [sw / 2 - .6, 1], [sw / 2 - .6, 4.9], [-sw / 2 + .6, 4.9]];
      const frame = card(st, { outline: frameO, holes: [hole], base: mix(PAL.light, C, .3), ppu: 36, seed: 2101, paint: P => { for (let k = 0; k < 9; k++) P.layer(P.circle(-sw / 2 + .5 + k * (sw - 1) / 8, 5.25, .14), mix(PAL.winLit, C, .3)); } });
      const curt = [-1, 1].map(s => { const o = [[s * (sw / 2 - .6), 1], [s * (sw / 2 - 1.5), 1], [s * (sw / 2 - 1.2), 3], [s * (sw / 2 - 1.6), 4.9], [s * (sw / 2 - .6), 4.9]]; const c = card(st, { outline: s > 0 ? o : o.slice().reverse(), base: shade(tone(P2, .7), .8), ppu: 40, seed: 2102 + s, paint: P => { for (let k = 0; k < 4; k++) P.layer(P.rect(s * (sw / 2 - .7 - k * .22) - .05, 1, .1, 3.9), shade(tone(P2, .7), .65)); } }); c.mesh.position.z = .05; return c; });
      const scP = lv => P => { const on = lv >= 1; P.layer(P.rect(-1.9, 1.6, 3.8, 2.6), on ? mix(C, PAL.ink, .3) : mix(PAL.win, C, .2), { shadow: .4 }); if (lv > .5) { P.layer(P.poly(star(.75, .32, 5, -.8, 2.9)), sk(lv, Y)); P.layer(P.rect(.1, 3.3, 1.4, .3), sk(lv, PAL.cream)); P.layer(P.rect(.1, 2.75, 1.1, .24), sk(lv, P2)); P.layer(P.rect(.1, 2.25, .8, .24), sk(lv, V)); } };
      const scr = card(st, { outline: [[-2, 1.5], [2, 1.5], [2, 4.3], [-2, 4.3]], base: PAL.dark, ppu: 44, seed: 2105, paint: scP(L0) }); scr.mesh.position.z = -.6;
      const s = stand(st, top, { x: sx, z: -3.4, yaw: .3, cards: [scr, deck, frame, ...curt], shadowOutline: [[-sw / 2, 0], [sw / 2, 0], [sw / 2, 5.6], [-sw / 2, 5.6]], order: 2 });
      out.push({ st: s, at: [sx + .4, 3, -2.8], tagY: 6.4, guideDx: 2, repaint(lv) { scr.reprint(scP(lv)); scr.mat.emissive.setScalar(lv >= 1 ? .45 : 0); scr.mat.emissiveMap = scr.tex; scr.mat.needsUpdate = true; },
        play(t, dt, u) { scr.mat.emissive.setScalar(.38 + Math.sin(u * 3) * .1); } });
    }
    /* 2: a paper crowd in front of the stage, two little spotlights on stands */
    {
      const ppl = [[-1.2, .2, P2], [-.2, -.4, Y], [.8, .3, C], [-.6, .9, V], [.4, 1.1, P2]].map(([x, z, col], k) => { const p = person(st, top, { x: -1.6 + x, z: .2 + z, yaw: Math.PI + (k - 2) * .1, h: 2.1 + (k % 2) * .3, colour: col, level: L0, seed: 2110 + k, kind: [0, 2][k % 2], order: 3 + k * .05, back: true, arms: k % 2 === 0 }); p.col = col; p.y0 = 0; return p; });
      const lampsO = [[-.12, 0], [.12, 0], [.12, 1.6], [.35, 1.6], [.45, 2.1], [-.45, 2.1], [-.35, 1.6], [-.12, 1.6]];
      const lamps = [[-3.4, -.4], [.2, -.4]].map(([x, z], k) => stand(st, top, { x, z, yaw: k ? -.5 : .5, cards: [card(st, { outline: lampsO, base: PAL.dark, ppu: 50, seed: 2120 + k, paint: P => P.layer(P.poly(ellipse(0, 1.85, .28, .18, 10)), Y) })], shadowOutline: lampsO, order: 3.4 }));
      const lb = lamps.map((l, k) => { const b = beam(st, l.group, { x: 0, y: 2, z: 0, h: 4, w: .3, w2: 2, colour: Y, opacity: 0 }); b.group.rotation.set(-.6, 0, (k ? 1 : -1) * .5); return b; });
      const grp = new THREE.Group(); top.add(grp);
      const anchor = stand(st, top, { x: -1.6, z: .4, cards: [], order: 3 });
      out.push({ st: anchor, at: [-1.6, 2.2, .4], tagY: 3.8, extra: [...ppl.map(p => p.group), ...lamps.map(l => l.group)], repaint(lv) { ppl.forEach(p => p.recolour(p.col, lv >= 1 ? 1 : lv, lv >= 1 ? .4 : 0)); lb.forEach(b => b.mat.opacity = lv >= 1 ? .3 : 0); },
        play(t, dt, u) { ppl.forEach((p, k) => { const v = (u * 2 - k * .2) % 1.4; p.base.position.y = v > 0 && v < .5 ? Math.sin(v / .5 * Math.PI) * .3 : 0; }); lb.forEach((b, k) => b.group.rotation.z = (k ? 1 : -1) * (.5 + Math.sin(u * 1.6 + k) * .3)); },
        reset() { ppl.forEach(p => p.base.position.y = 0); } });
    }
    /* 3: a translucent virtual character with a streaming mic and a ring light */
    {
      const vO = [[-.7, 0], [.7, 0], [.5, 1.3], [.62, 1.5], [.5, 1.6], [.6, 2.2], [.3, 2.75], [0, 2.85], [-.3, 2.75], [-.6, 2.2], [-.5, 1.6], [-.62, 1.5], [-.5, 1.3]];
      const vp = lv => P => { P.layer(P.poly([[-.6, 2.2], [-.3, 2.9], [0, 2.6], [.3, 2.9], [.6, 2.2], [.4, 2.5], [-.4, 2.5]]), sk(lv, V)); P.layer(P.circle(-.2, 2.05, .1), PAL.ink); P.layer(P.circle(.2, 2.05, .1), PAL.ink); P.layer(P.poly(star(.25, .1, 5, 0, .9)), sk(lv, Y)); };
      const vc = card(st, { outline: vO, base: sk(L0, mix(C, PAL.cream, .4)), ppu: 60, seed: 2130, paint: vp(L0), rim: false });
      vc.mat.transparent = true; vc.mat.opacity = .6; vc.mat.depthWrite = false; vc.mesh.renderOrder = 4; vc.mesh.position.set(0, .5, 0);
      const ring = card(st, { outline: ellipse(0, 2.3, 1.4, 1.4, 28), holes: [ellipse(0, 2.3, 1.15, 1.15, 28)], base: sk(L0, PAL.cream), ppu: 50, seed: 2131, unlit: true }); ring.mesh.position.z = -.4;
      const micO = [[-.05, 0], [.05, 0], [.05, 1.3], [.2, 1.35], [.2, 1.75], [-.2, 1.75], [-.2, 1.35], [-.05, 1.3]];
      const mic = card(st, { outline: micO, base: PAL.dark, ppu: 70, seed: 2132, paint: P => P.layer(P.rect(-.16, 1.4, .32, .3), mix(PAL.mid, PAL.light, .4)) }); mic.mesh.position.set(1.1, 0, .2);
      const plat = card(st, { outline: [[-1.5, 0], [1.5, 0], [1.5, .5], [-1.5, .5]], base: mix(PAL.dark, C, .3), ppu: 40, seed: 2133, paint: P => { for (let k = 0; k < 5; k++) P.layer(P.circle(-1.2 + k * .6, .25, .09), sk(.5, C)); } });
      const s = stand(st, top, { x: 2.8, z: -1.8, yaw: -.15, cards: [ring, plat, vc, mic], shadowOutline: [[-1.5, 0], [1.5, 0], [1.5, 3.7], [-1.5, 3.7]], order: 2.3 });
      out.push({ st: s, at: [2.8, 2.2, -1.4], tagY: 4.4, repaint(lv) { vc.reprint(vp(lv), sk(lv, mix(C, PAL.cream, .4))); vc.mat.opacity = lv >= 1 ? .78 : .6; ring.reprint(null, lv >= 1 ? mix(PAL.cream, C, .3) : sk(L0, PAL.cream)); },
        play(t, dt, u) { vc.mesh.position.y = .5 + Math.sin(u * 2.2) * .15; vc.mat.opacity = .7 + Math.sin(u * 5) * .08; }, reset() { vc.mesh.position.y = .5; } });
    }
    /* 4: fans with light sticks — the sticks light one after another */
    {
      const fans = [], sticks = [];
      [[-.9, .2], [0, -.3], [.9, .3], [-.4, .9], [.6, 1]].forEach(([x, z], k) => {
        const p = person(st, top, { x: 6.8 + x, z: .4 + z, yaw: -.5 + (k % 2) * .2, h: 2.1 + (k % 2) * .25, colour: C, level: L0, seed: 2140 + k, kind: k + 1, order: 3 + k * .05, arms: true });
        const col = [C, P2, Y, V, C][k], c = card(st, { outline: [[-.07, 0], [.07, 0], [.07, .75], [-.07, .75]], base: mix(PAL.mid, PAL.light, .3), ppu: 70, seed: 2150 + k, unlit: true });
        c.mesh.position.set(.55 * p.h / 2.6, 1.85 * p.h / 2.6, .08); c.mesh.rotation.z = -.35; p.group.add(c.mesh); c.col = col; fans.push(p); sticks.push(c);
      });
      const anchor = stand(st, top, { x: 6.8, z: .6, cards: [], order: 3 });
      out.push({ st: anchor, at: [6.4, 2.2, .8], tagY: 4, guideDx: -1.8, extra: fans.map(p => p.group), repaint(lv) { fans.forEach(p => p.recolour(C, lv >= 1 ? 1 : lv, lv >= 1 ? .35 : 0)); if (lv < 1) sticks.forEach(c => c.reprint(null, mix(PAL.mid, PAL.light, .3))); },
        play(t, dt, u) { sticks.forEach((c, k) => { const on = u > k * .3; if (on !== c.on) { c.on = on; c.reprint(null, on ? mix(PAL.cream, c.col, .55) : mix(PAL.mid, PAL.light, .3)); } c.mesh.rotation.z = -.35 + (on ? Math.sin(u * 5 + k) * .35 : 0); }); },
        reset() { sticks.forEach(c => { c.on = false; c.mesh.rotation.z = -.35; }); } });
    }
    return out;
  },
  lead(i, K) {   // the truss spotlight swings to the spot
    const s = K.spots[i];
    K.bt = { from: K.bt ? K.bt.cur.clone() : K.home.clone(), to: new THREE.Vector3(s.at[0], 0, s.at[2] + .4), cur: K.home.clone(), s: new Spring(0, 5, .8) }; K.bt.s.target = 1;
    if (!K.st.reduce) K.mc.hinge.kick(1.3);
    return .8;
  },
  after(i, K) {  // blue paper sparkles fall gently over the spot
    const s = K.spots[i];
    const sp = motes(K.st, K.top, { n: 22, box: [[s.at[0] - 2.4, 1.5, s.at[2] - 1.6], [s.at[0] + 2.4, 7, s.at[2] + 1.6]], colours: [K.C, mix(K.C, PAL.cream, .4), K.C], size: .32, speed: .45, seed: 2160 + i });
    K.extras.push(sp.mesh);
  },
  clear(K) { if (!K.sbeam) return; K.bt = null; K.aim(K.home); K.sbeam.mat.opacity = .16; },
  frames: orient => ({
    focus: orient === 'land' ? { min: [-8.6, 0, -4], max: [8.6, 4, 4.2] } : { min: [-8.8, 0, -4.4], max: [8.8, 6, 4.4] },
    wide: orient === 'land' ? { min: [-24.8, -3.6, -9.4], max: [24.8, 6, 11.8] } : { min: [-15.5, 0, -9.8], max: [15.5, 6, 9] }
  })
});
