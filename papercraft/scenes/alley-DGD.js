/* ===== Alley DGD "ย่านดีไซน์: ถนนเอกลักษณ์" =====
   A paper shopping street on both sides, every sign still blank. A paper designer holds a big pencil.
   Spots (AL.DGD.o order): 1 shop sign + logo · 2 app / web screens in a glass case · 3 stacked packaging boxes
   · 4 a big billboard poster. Lead-in: the designer's pencil draws a dotted line to the spot. */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, torn, ellipse, star, ribbon, quad, building, person, lampPost, bunting, beam, popRow, symbolFor, Spring } from '../shared.js';
import { alley, L0, glassCase } from './alley-kit.js';

const C = MAJ.DGD;
const logo = (P, x, y, r, lv) => { const c = tone(C, lv); P.layer(P.circle(x, y, r), lv >= 1 ? PAL.cream : mix(PAL.cream, PAL.light, .5), { shadow: .4 }); symbolFor('DGD')(P, x, y, r * .7, c); };

export default alley({
  m: 'DGD', id: 'alley-DGD', seed: 71,
  cam: { land: { pitch: 30 }, port: { pitch: 31 } },
  guideAt: [1.4, 3.3, 3],
  pagePaint(P, K) {
    const R = rng(3);
    P.layer(P.poly([[-4.2, 9.4], [4.2, 9.4], [2.8, -9], [-2.8, -9]]), mix(PAL.groundDk, C, .22), { shadow: .5 });         // the street
    for (let y = -8; y < 9; y += 1.6) P.layer(P.rect(-.12, y, .24, .8), mix(PAL.cream, C, .25), { shadow: .2, lip: .4 });
    for (let i = 0; i < 300; i++) { const x = (R() - .5) * 30, y = (R() - .5) * 18, w = .6 + R() * .5; if (Math.abs(x) < 3.4 + (9 - y) * .07) continue; P.layer(P.rect(x, y, w, w * .6), mix(mix(PAL.ground, C, .1), mix(PAL.groundLt, C, .3), .3 + R() * .6), { shadow: .3, lip: .45 }); }
    [[-6, 2], [6, 2.4]].forEach(([x, y]) => P.layer(P.poly(ellipse(x, y, 2.4, 1.2, 20)), mix(PAL.ground, C, .16), { shadow: .4 }));   // little plazas in front of spots
  },
  dress(st, top, K) {
    // rows of shops down both sides, signs blank (a pale board), awnings in tones of purple
    const shops = [[-12.4, -4.6, .55, 5.6], [-10, -7.4, .5, 6.4], [-5.6, -8.4, .2, 5.6], [5.6, -8.4, -.2, 6], [10, -7.4, -.5, 6.6], [12.4, -4.6, -.55, 5.4]];
    shops.forEach(([x, z, yaw, h], k) => {
      const b = building(st, top, { x, z, yaw, w: 4.4, h, roof: ['gable', 'flat', 'step'][k % 3], cols: 2, rows: 2, base: mix(PAL.light, C, .2 + (k % 2) * .12), accent: C, awning: K.tone(.75 + (k % 3) * .1), level: .85, seed: 1210 + k, order: 1 + k * .04, lit: 2, ppu: 26, blur: Math.abs(z) > 7 ? 1.6 : 0 });
      const sign = card(st, { outline: [[-1.5, 0], [1.5, 0], [1.5, .7], [-1.5, .7]], base: mix(PAL.cream, PAL.light, .5), ppu: 40, seed: 1220 + k, key: 'blank-sign' });
      sign.mesh.position.set(0, 2.1, .1); b.group.add(sign.mesh);
    });
    building(st, top, { x: 0, z: -9.6, w: 5.4, h: 6.8, roof: 'step', cols: 3, rows: 3, base: mix(PAL.light, C, .3), accent: C, level: .6, seed: 1230, order: .9, lit: 3, ppu: 24, blur: 2 });
    // the designer with a big pencil
    const D = person(st, top, { x: -.9, z: 2.6, yaw: .2, h: 2.6, colour: C, level: 1, seed: 1240, kind: 1, order: 5, arms: true });
    const pencil = card(st, { outline: [[0, 0], [.16, .1], [.16, 1.5], [0, 1.6], [-.16, 1.5], [-.16, .1]], base: '#F3C75A', ppu: 60, seed: 1241, paint: P => { P.layer(P.poly([[0, 0], [.16, .1], [.16, .32], [-.16, .32], [-.16, .1]]), mix(PAL.cream, '#C9A86A', .4), { shadow: .3 }); P.layer(P.poly([[0, 0], [.06, .04], [-.06, .04]]), PAL.ink); P.layer(P.rect(-.16, 1.3, .32, .2), tone('#F25AA6', .7), { shadow: .3 }); } });
    pencil.mesh.position.set(.78, 1.15, .06); pencil.mesh.rotation.z = -.55; D.group.add(pencil.mesh); K.designer = D; K.pencil = pencil;
    // lamps, bunting across the street, planters
    [[-4.2, 1.4], [4.2, 1.4], [-3.6, -5], [3.6, -5]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.4, seed: 1250 + k, order: 4, colour: C }));
    bunting(st, top, { a: [-4.2, 4.2, -5], b: [4.2, 4.2, -5], sag: .7, n: 9, colours: [C, mix(C, PAL.cream, .5)], level: 1, seed: 1255, order: 4.2 });
    [[-1.6, -1.6], [5.2, 5.6], [-5.6, 5.4]].forEach(([x, z], k) => { const out = [[-.4, 0], [.4, 0], [.5, .55], [-.5, .55]], leaf = [[-.7, .5], [-.3, 1.4], [0, 1], [.3, 1.6], [.7, .5]];
      stand(st, top, { x, z, cards: [card(st, { outline: [...out.slice(0, 3), ...leaf.slice().reverse(), out[3]], base: mix(PAL.mid, C, .2), ppu: 50, seed: 1260 + k, key: 'dgd-pot', paint: P => P.layer(P.poly(leaf), tone('#6FA36B', .55), { shadow: .4 }) })], shadowOutline: out, order: 4.5, shadow: { len: .4, blob: false } }); });
  },
  spots(st, top, K) {
    const out = [];
    /* 1: a shop sign + logo, and a blade sign sticking out */
    {
      const shop = building(st, top, { x: -7, z: -1.8, yaw: .45, w: 4.6, h: 5.2, roof: 'gable', cols: 2, rows: 1, base: mix(PAL.light, C, .12), accent: C, level: .5, seed: 1300, order: 2, lit: 1, ppu: 28 });
      const boardOut = [[-2, 0], [2, 0], [2, 1.2], [-2, 1.2]];
      const boardPaint = lv => P => { P.layer(P.rect(-1.85, .12, 3.7, .96), lv >= 1 ? tone(C, 1) : mix(PAL.light, C, lv * .4), { shadow: .4 }); if (lv >= .9) { logo(P, -1.2, .6, .4, lv); for (let k = 0; k < 3; k++) P.layer(P.rect(-.6 + k * .85, .45, .7, .3), mix(C, PAL.cream, .75), { shadow: .3 }); } };
      const board = card(st, { outline: boardOut, base: mix(PAL.light, C, .2), ppu: 50, seed: 1301, paint: boardPaint(L0), emit: 0 });
      const bladeOut = ellipse(0, 0, .55, .55, 18);
      const bladePaint = lv => P => logo(P, 0, 0, .42, lv);
      const blade = card(st, { outline: bladeOut, base: tone(C, L0), ppu: 60, seed: 1302, paint: bladePaint(L0) });
      const arm = card(st, { outline: [[0, -.03], [1.1, -.03], [1.1, .03], [0, .03]], base: PAL.dark, ppu: 40, seed: 1303 });
      const bladeG = new THREE.Group(); bladeG.position.set(2.3, 3, .1); blade.mesh.position.set(.75, -.65, 0); arm.mesh.position.set(-.2, 0, 0); bladeG.add(arm.mesh, blade.mesh); bladeG.rotation.y = -Math.PI / 2 + .3;
      const s = stand(st, top, { x: -7 + Math.sin(.45) * .12, z: -1.8 + Math.cos(.45) * .12, yaw: .45, cards: [board, bladeG], order: 2.2 });
      board.mesh.position.y = 2.15;
      out.push({ st: s, at: [-6.5, 2.8, -.8], tagY: 4.9, extra: [shop.group], guideDx: 1.6,
        repaint(lv) { board.reprint(boardPaint(lv), lv >= 1 ? tone(C, .7) : mix(PAL.light, C, .2)); blade.reprint(bladePaint(lv), tone(C, lv)); board.mat.emissive && board.mat.emissive.setScalar(lv >= 1 ? .25 : 0); },
        play(t, dt, u) { bladeG.rotation.y = -Math.PI / 2 + .3 + Math.sin(u * 3) * .25 * Math.exp(-u * .5); },
        reset() { bladeG.rotation.y = -Math.PI / 2 + .3; } });
      board.mat.emissive = new THREE.Color(0, 0, 0); board.mat.emissiveMap = board.tex;
    }
    /* 2: app / web screens in a glass case */
    {
      const w = 3, h = 2.4, { frame, glass } = glassCase(st, top, { x: -2.8, z: -3.4, w, h, tint: mix(PAL.light, C, .2) });
      const screen = (sx, sy, sw, sh, kind) => { const o = [[sx - sw / 2, sy], [sx + sw / 2, sy], [sx + sw / 2, sy + sh], [sx - sw / 2, sy + sh]];
        const paint = lv => P => { const on = lv >= 1; P.layer(P.rect(sx - sw / 2 + .06, sy + .06, sw - .12, sh - .12), on ? mix(PAL.cream, C, .15) : mix(PAL.win, C, lv * .3), { shadow: .3 });
          if (lv > .3) { P.layer(P.rect(sx - sw / 2 + .12, sy + sh - .3, sw - .24, .16), tone(C, lv), { shadow: .2 }); for (let k = 0; k < (kind ? 3 : 2); k++) P.layer(P.rect(sx - sw / 2 + .14, sy + .18 + k * (sh - .6) / 3, (sw - .28) * (k % 2 ? .6 : 1), (sh - .8) / 4), on ? [tone(C, .8), '#FFD166', '#4BE3C1'][k] : mix(PAL.mid, C, .25), { shadow: .2 }); } };
        const c = card(st, { outline: o, base: PAL.dark, ppu: 70, th: .05, seed: 1320 + kind, paint: paint(L0) }); c.paint = paint; return c; };
      const scr = [screen(-.85, .65, .7, 1.25, 0), screen(.15, .6, 1.15, .95, 1), screen(.95, .7, .55, 1, 2)];
      scr.forEach((c, k) => c.mesh.position.z = -.25 - k * .02);
      const base = card(st, { outline: [[-w / 2 - .1, 0], [w / 2 + .1, 0], [w / 2 + .1, .5], [-w / 2 - .1, .5]], base: mix(PAL.mid, C, .2), ppu: 40, seed: 1325 });
      const s = stand(st, top, { x: -2.8, z: -3.4, yaw: .12, cards: [...scr, base, frame, glass], shadowOutline: [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], order: 2.4 });
      out.push({ st: s, at: [-2.8, 2.2, -3.2], tagY: 3.4, repaint(lv) { scr.forEach(c => { c.reprint(c.paint(lv)); c.mat.emissive = c.mat.emissive || new THREE.Color(); c.mat.emissiveMap = c.tex; c.mat.emissive.setScalar(lv >= 1 ? .55 : 0); c.mat.needsUpdate = true; }); },
        play(t, dt, u) { scr.forEach((c, k) => c.mat.emissive && c.mat.emissive.setScalar(.45 + Math.sin(u * 2 + k) * .12)); } });
    }
    /* 3: stacked packaging boxes (box folds), the top lid opens on the pick */
    {
      const grp = []; const lid = { g: null, s: new Spring(0, 7, .5) };
      const boxPaint = (lv, k) => P => { const c = lv >= 1 ? [tone(C, 1), '#FFD166', '#4BE3C1', tone('#F25AA6', .9)][k % 4] : mix(PAL.light, C, lv * .5); P.layer(P.rect(-.7, .1, 1.4, .8), c, { shadow: .4 }); if (lv >= .9) { P.layer(P.circle(0, .5, .26), PAL.cream, { shadow: .3 }); symbolFor('DGD')(P, 0, .5, .18, shade(c, .7)); } else P.layer(P.rect(-.5, .4, 1, .14), mix(PAL.mid, PAL.light, .5), { shadow: .2 }); };
      const boxes = [[-.8, 0, 0], [.8, 0, 1], [0, 1, 2], [1.5, 0, 3]].map(([bx, row, k]) => {
        const f = card(st, { outline: [[-.8, 0], [.8, 0], [.8, 1], [-.8, 1]], base: mix(PAL.light, C, .2), ppu: 50, seed: 1340 + k, paint: boxPaint(L0, k) });
        const sd = card(st, { outline: [[0, 0], [.9, 0], [.9, 1], [0, 1]], base: shade(mix(PAL.light, C, .2), .8), ppu: 30, seed: 1350 + k }); sd.mesh.rotation.y = Math.PI / 2; sd.mesh.position.set(.79, 0, -.02);
        const tp = card(st, { outline: [[-.8, 0], [.8, 0], [.8, .9], [-.8, .9]], base: shade(mix(PAL.light, C, .2), 1.08), ppu: 30, seed: 1360 + k, rim: false }); tp.mesh.rotation.x = -Math.PI / 2;
        const g = new THREE.Group(); g.position.set(bx, row * 1.02, -row * .25); const tpg = new THREE.Group(); tpg.position.set(0, 1, -.9); tp.mesh.position.set(0, 0, .9); tpg.add(tp.mesh); g.add(f.mesh, sd.mesh, tpg);
        if (k === 2) lid.g = tpg; grp.push(g); return { f, k, sd };
      });
      const s = stand(st, top, { x: 3, z: -3.2, yaw: -.15, cards: grp, shadowOutline: [[-1.6, 0], [2.3, 0], [2.3, 1], [-1.6, 1]], order: 2.4 });
      out.push({ st: s, at: [3.4, 2.4, -3], tagY: 3.7, guideDx: -1.4,
        repaint(lv) { boxes.forEach(b => { b.f.reprint(boxPaint(lv, b.k), lv >= 1 ? mix(PAL.cream, C, .2) : mix(PAL.light, C, .2)); b.sd.reprint(null, lv >= 1 ? shade(tone(C, .9), .8) : shade(mix(PAL.light, C, .2), .8)); }); },
        play(t, dt, u) { lid.s.target = u > .2 ? -1.9 : 0; st.reduce ? lid.s.snap(lid.s.target) : lid.s.step(dt); lid.g.rotation.x = lid.s.x; },
        reset() { lid.s.snap(0); lid.g.rotation.x = 0; } });
    }
    /* 4: a big billboard poster on posts, two lamps on top */
    {
      const bw = 5, bh = 3.2, y0 = 2;
      const posterPaint = lv => P => { const on = lv >= 1;
        P.layer(P.rect(-bw / 2 + .15, y0 + .15, bw - .3, bh - .3), on ? mix(C, PAL.ink, .2) : mix(PAL.light, C, lv * .3), { shadow: .4 });
        if (lv > .3) { P.layer(P.circle(-.9, y0 + bh / 2 + .1, .95), on ? '#FFD166' : mix(PAL.light, C, .35), { shadow: .5 }); P.layer(P.poly(star(.8, .35, 5, -.9, y0 + bh / 2 + .1)), on ? tone('#F25AA6', 1) : mix(PAL.mid, C, .25), { shadow: .4 });
          P.layer(P.rect(.4, y0 + 1.8, 1.7, .38), on ? PAL.cream : mix(PAL.mid, C, .2), { shadow: .3 }); P.layer(P.rect(.4, y0 + 1.2, 1.3, .26), on ? '#4BE3C1' : mix(PAL.mid, C, .2), { shadow: .3 }); P.layer(P.rect(.4, y0 + .6, .9, .26), on ? tone(C, .6) : mix(PAL.mid, C, .2), { shadow: .3 }); } };
      const posts = [-1.6, 1.6].map((x, k) => { const c = card(st, { outline: [[x - .12, 0], [x + .12, 0], [x + .12, y0 + .1], [x - .12, y0 + .1]], base: PAL.dark, ppu: 40, seed: 1370 + k }); c.mesh.position.z = -.08; return c; });
      const poster = card(st, { outline: [[-bw / 2, y0], [bw / 2, y0], [bw / 2, y0 + bh], [-bw / 2, y0 + bh]], base: shade(mix(PAL.light, C, .2), .8), ppu: 36, seed: 1375, paint: posterPaint(L0) });
      const lamps = [-1.4, 1.4].map((x, k) => { const c = card(st, { outline: [[x - .25, y0 + bh], [x + .25, y0 + bh], [x + .35, y0 + bh + .35], [x - .35, y0 + bh + .35]], base: PAL.dark, ppu: 40, seed: 1378 + k }); c.mesh.position.z = .3; return c; });
      const s = stand(st, top, { x: 7, z: -2, yaw: -.45, cards: [...posts, poster, ...lamps], shadowOutline: [[-bw / 2, 0], [bw / 2, 0], [bw / 2, y0 + bh], [-bw / 2, y0 + bh]], order: 2.2 });
      const beams = [-1.4, 1.4].map(x => { const b = beam(st, s.group, { x, y: y0 + bh + .25, z: .45, h: 3, w: .3, w2: 1.8, colour: PAL.guide, opacity: 0 }); b.group.rotation.x = Math.PI - .35; return b; });
      out.push({ st: s, at: [6.5, 3.6, -1], tagY: 6.1, guideDx: -1.6,
        repaint(lv) { poster.reprint(posterPaint(lv)); poster.mat.emissive = poster.mat.emissive || new THREE.Color(); poster.mat.emissiveMap = poster.tex; poster.mat.emissive.setScalar(lv >= 1 ? .3 : 0); poster.mat.needsUpdate = true; beams.forEach(b => b.mat.opacity = lv >= 1 ? .3 : 0); },
        play(t, dt, u) { beams.forEach((b, k) => b.mat.opacity = .26 + Math.sin(u * 4 + k * 2) * .05); } });
    }
    return out;
  },
  lead(i, K) {   // the pencil draws a dotted purple line from the designer to the spot
    const s = K.spots[i], from = [-.2, 3.4], to = [s.at[0], s.at[2] + 1.2], pts = [];
    for (let k = 1; k <= 7; k++) { const t = k / 8; pts.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]); }
    K.pieces.push(...popRow(K.st, K.top, pts, { colour: tone(K.C, 1), seed: 1390 + i, delay: .05, step: .07, size: .5 }));
    if (!K.st.reduce) K.designer.hinge.kick(1.4);
    return .7;
  },
  frames: orient => ({
    focus: orient === 'land' ? { min: [-9.4, 0, -4.6], max: [9.4, 5.4, 3.6] } : { min: [-9.6, 0, -4.6], max: [9.6, 6, 3.6] },
    wide: orient === 'land' ? { min: [-24.8, -3.6, -9.4], max: [24.8, 6, 11.8] } : { min: [-15.5, 0, -9.8], max: [15.5, 6, 9] }
  })
});
