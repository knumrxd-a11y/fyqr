/* ===== Alley IGD "ย่านเกม: สนามแห่งการเล่น" =====
   A wide square that is a giant paper board game; a paper game master with a whistle. Spots (AL.IGD.o order):
   1 a rules sign with a big die · 2 game pieces and scenery on a board · 3 a virtual portal, a grid frame
   · 4 a team tent with a cart carrying game boxes out to the players.
   Lead-in: board squares light up in a row from the game master to the spot, which then pops up in colour. */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, ellipse, star, ribbon, quad, cloud, building, person, lampPost, bunting, beam, Spring, symbolFor } from '../shared.js';
import { alley, L0 } from './alley-kit.js';

const C = MAJ.IGD, Y = '#FFD166', P2 = '#4BA3F5', R2 = '#F25AA6', S = 1.3;   // S: board square size
const sk = (lv, c) => lv >= 1 ? c : mix(PAL.light, c, .2 + lv * .4);

export default alley({
  m: 'IGD', id: 'alley-IGD', seed: 77,
  cam: { land: { pitch: 30 }, port: { pitch: 36 } },
  guideAt: [1.6, 3.2, 3.4],
  pagePaint(P) {
    // the whole square is a board: a checker of squares, a winding track of bright squares, start / finish
    for (let r = -7; r <= 7; r++) for (let c = -11; c <= 11; c++) { const x = c * S, y = r * S; P.layer(P.rect(x - S / 2 + .04, y - S / 2 + .04, S - .08, S - .08), (r + c) % 2 ? mix(PAL.ground, C, .16) : mix(PAL.groundLt, C, .26), { shadow: .3, lip: .4 }); }
    const track = []; for (let k = -8; k <= 8; k++) track.push([k * S, Math.round(Math.sin(k * .55) * 1.6) * S - 5 * S]);
    track.forEach(([x, y], k) => { P.layer(P.rect(x - S / 2 + .1, y - S / 2 + .1, S - .2, S - .2), [mix(C, PAL.cream, .3), mix(Y, PAL.cream, .2), mix(P2, PAL.cream, .3), mix(R2, PAL.cream, .3)][k % 4], { shadow: .4 }); if (k % 4 === 0) P.layer(P.poly(star(.32, .14, 5, x, y)), PAL.cream, { shadow: .2 }); });
    P.layer(P.poly(ellipse(0, 2.2, 2.2, 1.3, 20)), mix(PAL.groundDk, C, .25), { shadow: .5 });
  },
  dress(st, top, K) {
    // the square's edges: grandstands (stepped cards) and houses in greens
    [[-12.4, -4, .6, 5], [12.4, -4, -.6, 5.2], [-8.4, -9, .2, 5.6], [8.4, -9, -.2, 6]].forEach(([x, z, yaw, h], k) =>
      building(st, top, { x, z, yaw, w: 4.4, h, roof: ['step', 'gable'][k % 2], cols: 2, rows: 2, base: mix(PAL.light, C, .2), accent: C, awning: tone(C, .85), level: .9, seed: 1810 + k, order: 1 + k * .05, lit: 2, ppu: 24, blur: Math.abs(z) > 8 ? 1.6 : 0 }));
    const standOut = [[-3.4, 0], [3.4, 0], [3.4, .7], [2.6, .7], [2.6, 1.4], [1.8, 1.4], [1.8, 2.1], [-1.8, 2.1], [-1.8, 1.4], [-2.6, 1.4], [-2.6, .7], [-3.4, .7]];
    stand(st, top, { x: 0, z: -9, cards: [card(st, { outline: standOut, base: mix(PAL.light, C, .25), ppu: 40, seed: 1820, paint: P => { [.65, 1.35, 2.05].forEach(y => P.layer(P.rect(-3.4, y, 6.8, .08), PAL.cream, { shadow: .2 })); for (let k = 0; k < 10; k++) P.layer(P.circle(-2.8 + k * .62, .95 + (k % 3) * .7, .18), [C, Y, P2, R2][k % 4], { shadow: .3 }); } })], shadowOutline: standOut, order: 1.2 });
    bunting(st, top, { a: [-10.4, 5.4, -6.4], b: [10.4, 5.4, -6.4], sag: 1.2, n: 13, colours: [C, Y, P2, R2], level: 1, seed: 1825, order: 1.4 });
    // the game master with a whistle and a cap
    const GM = person(st, top, { x: -.6, z: 3.2, yaw: .15, h: 2.6, colour: C, level: 1, seed: 1830, kind: 2, order: 5, arms: true });
    const cap = card(st, { outline: [[-.42, 2.2], [.42, 2.2], [.72, 2.14], [.72, 2.24], [.4, 2.32], [.36, 2.52], [-.36, 2.52], [-.42, 2.3]], base: tone(C, 1), ppu: 70, seed: 1831 }); cap.mesh.position.z = .05; GM.group.add(cap.mesh);
    const whistle = card(st, { outline: [[-.18, 0], [.18, 0], [.18, .22], [.3, .22], [.3, .3], [-.18, .3]], base: Y, ppu: 80, seed: 1832, paint: P => P.layer(P.circle(-.05, .15, .06), PAL.ink) }); whistle.mesh.position.set(.42, 1.75, .07); GM.group.add(whistle.mesh);
    K.gm = GM;
    // players waiting on the start squares
    [[-4.2, 4.2, R2], [3.8, 4.4, P2], [5.4, 3.6, Y]].forEach(([x, z, col], k) => person(st, top, { x, z, yaw: -x * .05, h: 2.2, colour: col, level: .8, seed: 1835 + k, kind: k, order: 5.2 }));
    [[-9.2, 2.2], [9.2, 2.2]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.2, seed: 1840 + k, order: 4, colour: C }));
    // the lit squares used by the lead-in (pooled, one InstancedMesh-free set of flat unlit cards)
    K.tiles = [];
    for (let k = 0; k < 9; k++) { const col = [C, Y, P2, R2][k % 4], c = card(st, { outline: [[-S / 2 + .08, -S / 2 + .08], [S / 2 - .08, -S / 2 + .08], [S / 2 - .08, S / 2 - .08], [-S / 2 + .08, S / 2 - .08]], base: tone(col, 1), ppu: 40, th: .05, seed: 1850 + k, unlit: true, key: 'igd-tile' + (k % 4), paint: P => P.layer(P.rect(-S / 2 + .25, -S / 2 + .25, S - .5, S - .5), mix(col, PAL.cream, .35)) });
      const g = new THREE.Group(); c.mesh.rotation.x = -Math.PI / 2; g.add(c.mesh); g.visible = false; top.add(g); K.tiles.push({ g, s: new Spring(-.2, 10, .4) }); }
    st.onUpdate((t, dt) => K.tiles.forEach(o => { if (!o.g.visible) return; st.reduce ? o.s.snap(o.s.target) : o.s.step(dt); o.g.position.y = o.s.x; }));
  },
  spots(st, top, K) {
    const out = [];
    /* 1: a rules sign (icons, no words) with a big die beside it */
    {
      const sign = [[-1.3, 0], [-1.15, 0], [-1.15, 1.4], [1.15, 1.4], [1.15, 0], [1.3, 0], [1.3, 3.2], [-1.3, 3.2]];
      const sp = lv => P => { P.layer(P.rect(-1.15, 1.5, 2.3, 1.55), sk(lv, mix(PAL.cream, C, .15)), { shadow: .4 }); [[2.75, Y], [2.25, P2], [1.75, R2]].forEach(([y, col], k) => { P.layer(P.circle(-.85, y, .16), sk(lv, col), { shadow: .3 }); P.layer(P.rect(-.55, y - .07, 1.4 - k * .25, .14), lv >= 1 ? shade(C, .6) : mix(PAL.mid, PAL.light, .4), { shadow: .2 }); }); };
      const sc = card(st, { outline: sign, base: sk(L0, C), ppu: 50, seed: 1900, paint: sp(L0) });
      const pips = n => P => { const pts = { 1: [[0, 0]], 5: [[-.35, -.35], [.35, -.35], [0, 0], [-.35, .35], [.35, .35]], 3: [[-.35, -.35], [0, 0], [.35, .35]] }[n]; pts.forEach(([x, y]) => P.layer(P.circle(x, y + .6, .13), PAL.ink)); };
      const df = card(st, { outline: [[-.6, 0], [.6, 0], [.6, 1.2], [-.6, 1.2]], base: sk(L0, PAL.cream), ppu: 60, seed: 1901, paint: pips(5) });
      const ds = card(st, { outline: [[0, 0], [1.2, 0], [1.2, 1.2], [0, 1.2]], base: shade(sk(L0, PAL.cream), .82), ppu: 50, seed: 1902, paint: P => [[.3, .3], [.9, .9]].forEach(([x, y]) => P.layer(P.circle(x, y, .13), PAL.ink)) }); ds.mesh.rotation.y = Math.PI / 2; ds.mesh.position.set(.6, 0, -.02);
      const dt_ = card(st, { outline: [[-.6, 0], [.6, 0], [.6, 1.2], [-.6, 1.2]], base: shade(sk(L0, PAL.cream), 1.08), ppu: 50, seed: 1903, rim: false, paint: P => P.layer(P.circle(0, .6, .13), PAL.ink) }); dt_.mesh.rotation.x = -Math.PI / 2; dt_.mesh.position.set(0, 1.2, 0);
      const die = new THREE.Group(); die.add(df.mesh, ds.mesh, dt_.mesh); die.position.set(1.9, 0, .4); die.rotation.y = -.4;
      const s = stand(st, top, { x: -6.4, z: -.4, yaw: .45, cards: [sc, die], shadowOutline: [[-1.3, 0], [2.6, 0], [2.6, 3.2], [-1.3, 3.2]], order: 2.2 });
      out.push({ st: s, at: [-5.8, 2.4, .4], tagY: 4.7, guideDx: 1.8, repaint(lv) { sc.reprint(sp(lv), sk(lv, C)); df.reprint(pips(5), lv >= 1 ? PAL.cream : sk(L0, PAL.cream)); },
        play(t, dt, u) { const v = Math.min(1, u / 1.1); die.position.y = Math.sin(v * Math.PI) * 1.4; die.rotation.x = v * Math.PI * 2; die.rotation.z = v * Math.PI; }, reset() { die.position.y = 0; die.rotation.set(0, -.4, 0); } });
    }
    /* 2: game pieces and scenery on a small board */
    {
      const board = card(st, { outline: [[-1.8, 0], [1.8, 0], [1.8, .35], [-1.8, .35]], base: sk(L0, C), ppu: 40, seed: 1910 });
      const pawnO = [[-.3, 0], [.3, 0], [.18, .5], [.26, .62], [.12, .7], [.2, .95], [0, 1.08], [-.2, .95], [-.12, .7], [-.26, .62], [-.18, .5]];
      const pieces = [[-1.1, R2, 0], [-.2, Y, 1], [.7, P2, 2]].map(([x, col, k]) => { const a = card(st, { outline: pawnO, base: sk(L0, col), ppu: 70, seed: 1911 + k }), b = card(st, { outline: pawnO, base: sk(L0, col), ppu: 50, seed: 1914 + k }); b.mesh.rotation.y = Math.PI / 2; const g = new THREE.Group(); g.add(a.mesh, b.mesh); g.position.set(x, .35, .1 - k * .2); return { a, b, g, col, x }; });
      const castleO = [[-.6, 0], [.6, 0], [.6, 1.3], [.4, 1.3], [.4, 1.5], [.2, 1.5], [.2, 1.3], [-.2, 1.3], [-.2, 1.5], [-.4, 1.5], [-.4, 1.3], [-.6, 1.3]];
      const cp = lv => P => { P.layer(P.poly([[-.18, .35], [.18, .35], [.18, .7], [0, .85], [-.18, .7]]), PAL.ink); P.layer(P.poly([[.25, 1.5], [.25, 2.1], [.65, 1.95], [.25, 1.8]]), sk(lv, R2)); };
      const castle = card(st, { outline: castleO, base: sk(L0, PAL.light), ppu: 60, seed: 1918, paint: cp(L0) }); castle.mesh.position.set(1.35, .35, -.3);
      const tree = card(st, { outline: [[-.1, 0], [.1, 0], [.1, .4], [.5, .4], [0, 1.4], [-.5, .4], [-.1, .4]], base: sk(L0, C), ppu: 60, seed: 1919 }); tree.mesh.position.set(-1.55, .35, -.35);
      const s = stand(st, top, { x: -2.4, z: -1.8, yaw: .1, cards: [board, castle, tree, ...pieces.map(p => p.g)], shadowOutline: [[-1.8, 0], [1.8, 0], [1.8, 1.8], [-1.8, 1.8]], order: 2.3 });
      out.push({ st: s, at: [-2.4, 1.6, -1.4], tagY: 3.4, repaint(lv) { board.reprint(null, sk(lv, C)); pieces.forEach(p => { p.a.reprint(null, sk(lv, p.col)); p.b.reprint(null, sk(lv, p.col)); }); castle.reprint(cp(lv), sk(lv, PAL.light)); tree.reprint(null, sk(lv, C)); },
        play(t, dt, u) { pieces.forEach((p, k) => { const v = (u * 1.4 - k * .3) % 2; p.g.position.y = .35 + (v > 0 && v < .6 ? Math.sin(v / .6 * Math.PI) * .45 : 0); p.g.position.x = p.x + Math.floor(Math.max(0, u * 1.4 - k * .3) / 2) * 0; }); }, reset() { pieces.forEach(p => p.g.position.y = .35); } });
    }
    /* 3: a virtual portal — a square grid frame with a glowing field */
    {
      const fw = 2.6, fh = 2.9, hole = [[-fw / 2 + .25, .45], [fw / 2 - .25, .45], [fw / 2 - .25, fh - .25], [-fw / 2 + .25, fh - .25]];
      const fp = lv => P => { for (let k = 1; k < 6; k++) { P.layer(P.rect(-fw / 2, k * fh / 6, .25, .05), sk(lv, mix(C, PAL.cream, .4))); P.layer(P.rect(fw / 2 - .25, k * fh / 6, .25, .05), sk(lv, mix(C, PAL.cream, .4))); } };
      const frame = card(st, { outline: [[-fw / 2, .2], [fw / 2, .2], [fw / 2, fh], [-fw / 2, fh]], holes: [hole], base: sk(L0, shade(C, .7)), ppu: 50, seed: 1920, paint: fp(L0) });
      const gc = document.createElement('canvas'); gc.width = gc.height = 128; const g = gc.getContext('2d'); g.strokeStyle = '#ffffff'; g.lineWidth = 3; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 16, 0); g.lineTo(k * 16, 128); g.stroke(); g.beginPath(); g.moveTo(0, k * 16); g.lineTo(128, k * 16); g.stroke(); }
      const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
      const field = new THREE.Mesh(new THREE.PlaneGeometry(fw - .5, fh - .7), new THREE.MeshBasicMaterial({ map: gt, color: mix(C, PAL.cream, .3), transparent: true, opacity: .25, depthWrite: false, blending: THREE.AdditiveBlending }));
      field.position.set(0, (fh + .2) / 2 + .1, -.02); field.renderOrder = 4;
      const legs = card(st, { outline: [[-fw / 2, 0], [-fw / 2 + .3, 0], [-fw / 2 + .3, .3], [fw / 2 - .3, .3], [fw / 2 - .3, 0], [fw / 2, 0], [fw / 2, .25], [-fw / 2, .25]], base: PAL.dark, ppu: 40, seed: 1921 });
      const s = stand(st, top, { x: 2.6, z: -1.8, yaw: -.1, cards: [legs, frame, field], shadowOutline: [[-fw / 2, 0], [fw / 2, 0], [fw / 2, fh], [-fw / 2, fh]], order: 2.3 });
      out.push({ st: s, at: [2.6, 1.8, -1.4], tagY: 3.9, repaint(lv) { frame.reprint(fp(lv), sk(lv, shade(C, .7))); field.material.opacity = lv >= 1 ? .7 : .25; },
        play(t, dt, u) { field.material.opacity = .55 + Math.sin(u * 4) * .2; gt.offset.y = -u * .3; }, reset() { gt.offset.y = 0; } });
    }
    /* 4: a team tent and a cart carrying game boxes out to the players */
    {
      const tentO = [[-1.8, 0], [1.8, 0], [0, 2.6]], door = [[-.55, 0], [.55, 0], [0, 1.4]];
      const tp = lv => P => { for (let k = 0; k < 4; k++) P.layer(P.poly([[-1.8 + k * .9, 0], [-1.35 + k * .9, 0], [0, 2.6]]), sk(lv, k % 2 ? C : PAL.cream), { shadow: .3 }); P.layer(P.poly(star(.3, .13, 5, 0, 1.85)), sk(lv, Y)); };
      const tent = card(st, { outline: tentO, holes: [door], base: sk(L0, mix(C, PAL.cream, .3)), ppu: 44, seed: 1930, paint: tp(L0) });
      const cart = new THREE.Group();
      const cb = card(st, { outline: [[-.8, .3], [.8, .3], [.8, .9], [-.8, .9]], base: sk(L0, '#B08A62'), ppu: 50, seed: 1932 });
      const wheels = [-.5, .5].map((x, k) => { const c = card(st, { outline: ellipse(0, 0, .26, .26, 14), base: PAL.dark, ppu: 50, seed: 1933 + k, paint: P => P.layer(P.circle(0, 0, .08), PAL.cream) }); c.mesh.position.set(x, .28, .05); return c; });
      const boxes = [[-.4, .9, R2], [.3, .9, P2], [-.05, 1.42, Y]].map(([x, y, col], k) => { const c = card(st, { outline: [[-.35, 0], [.35, 0], [.35, .52], [-.35, .52]], base: sk(L0, col), ppu: 60, seed: 1936 + k, paint: P => { P.layer(P.rect(-.35, .2, .7, .1), PAL.cream); } }); c.mesh.position.set(x, y, .03); c.col = col; return c; });
      cart.add(cb.mesh, ...wheels.map(w => w.mesh), ...boxes.map(b => b.mesh)); cart.position.set(1.6, 0, .9);
      const s = stand(st, top, { x: 6.4, z: -.4, yaw: -.45, cards: [tent, cart], shadowOutline: [[-1.8, 0], [2.4, 0], [2.4, 2.6], [-1.8, 2.6]], order: 2.2 });
      const roll = new Spring(0, 3.5, .8);
      out.push({ st: s, at: [5.8, 2.2, .4], tagY: 4.2, guideDx: -1.8, repaint(lv) { tent.reprint(tp(lv), sk(lv, mix(C, PAL.cream, .3))); cb.reprint(null, sk(lv, '#B08A62')); boxes.forEach(b => b.reprint(P => P.layer(P.rect(-.35, .2, .7, .1), PAL.cream), sk(lv, b.col))); },
        play(t, dt, u) { roll.target = 2.6; st.reduce ? roll.snap(2.6) : roll.step(dt); cart.position.z = .9 + roll.x * .55; cart.position.x = 1.6 - roll.x * .5; wheels.forEach(w => w.mesh.rotation.z = -roll.x * 3); },
        reset() { roll.snap(0); cart.position.set(1.6, 0, .9); } });
    }
    return out;
  },
  lead(i, K) {   // squares light up one by one from the game master to the spot
    const s = K.spots[i], a = [-.6, 3.2], b = [s.at[0], s.at[2] + 1.4], n = K.tiles.length, snap = v => Math.round(v / S) * S;
    K.tiles.forEach((o, k) => { const t = (k + 1) / (n + 1); o.g.position.set(snap(a[0] + (b[0] - a[0]) * t), -.2, snap(a[1] + (b[1] - a[1]) * t)); o.s.snap(-.2); o.g.visible = false; K.at(k * .08, () => { o.g.visible = true; o.s.target = .04; }); });
    if (!K.st.reduce) K.gm.hinge.kick(1.6);
    return .1 + n * .08;
  },
  clear(K) { if (K.tiles) K.tiles.forEach(o => { o.g.visible = false; o.s.snap(-.2); }); },
  frames: orient => ({
    focus: orient === 'land' ? { min: [-8.4, 0, -3.4], max: [8.4, 4.4, 4.6] } : { min: [-8.6, 0, -3.4], max: [8.6, 5, 4.6] },
    wide: orient === 'land' ? { min: [-24.8, -3.6, -9.4], max: [24.8, 6, 11.8] } : { min: [-15.5, 0, -9.8], max: [15.5, 6, 9] }
  })
});
