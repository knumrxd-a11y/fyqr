/* ===== Scene 5.1 "ขึ้นเวที" (SC[9]) =====
   A big paper stage at the back of the square under a proscenium arch, the curtain closed, the stage still dark.
   The buildings round the square light their windows one by one; lanterns and bunting cross the square in the
   colours of the player's score split. The front row of paper people is seen from behind. The guide light (the
   player) floats up the stage stairs.
   Pick: the curtain opens, the stage lights come on, then by major:
     DGA  a giant painting unrolls as the backdrop        DGD  matching flags and signs fold open across the square
     IGD  the square floor becomes a board game, people hop along the squares
     AFX  paper fireworks burst over the stage, a light sweeps the square
     DEN  the crowd raises its hands, sparkles fall, people come up on stage together
   Colour level .85. */
import { THREE, PAL, MAJ, ORDER, tone, mix, shade, rng, card, stand, island, guide, ribbon, quad, torn, ellipse, star, cloud,
  building, person, lampPost, signPost, bunting, motes, beam, Spring, byScore, symbolFor, removePiece, sidePage } from '../shared.js';

const ZST = -4.6, SW = 13, SHGT = 1.5, ARCH_H = 7.6;    // stage front z, width, platform height, arch height

export default {
  id: '5-1',
  cam: { land: { pitch: 33 }, port: { pitch: 31 } },
  build(st, ctx) {
    const level = ctx.colour ?? .85;
    const scores = ctx.scores || { DGD: 2, DGA: 2, AFX: 2, IGD: 2, DEN: 2 };
    const root = new THREE.Group();
    const R = rng(51);
    const scoreCols = byScore(scores, 12, 5).map(m => MAJ[m]);

    /* ---------- the page: the town square ---------- */
    const page = island(st, root, {
      outline: torn(0, -1, 20.5, 11.6, 41, 96), seed: 19, ppu: 24, blurFar: .18, blurNear: .86, blurPx: 4, paint: P => {
        const Rr = rng(10);
        for (let r = 0; r < 12; r++) for (let c = 0; c < 22; c++) { const x = -20 + c * 1.9 + (r % 2) * .95, y = 9 - r * 1.7; if (Rr() < .1) continue; P.layer(P.rect(x, y, 1.75, 1.55), mix(PAL.ground, PAL.groundLt, .35 + Rr() * .55), { shadow: .35, lip: .45 }); }
        P.layer(P.poly(ellipse(0, -1.5, 9.5, 4.6, 40)), mix(PAL.groundDk, PAL.ground, .4), { shadow: .5 });     // the crowd's circle
        P.layer(P.poly(ellipse(0, -1.5, 8.8, 4.1, 40)), mix(PAL.ground, PAL.groundLt, .55), { shadow: .4 });
        for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; P.layer(P.circle(Math.cos(a) * 9.15, -1.5 + Math.sin(a) * 4.35, .18), mix(PAL.cream, PAL.mid, .4), { shadow: .3 }); }
      }
    });
    const top = page.top;

    /* ---------- the guide light = the player: starts at the foot of the stairs, floats up ---------- */
    const G = guide(st, root, { x: 0, y: 2.2, z: ZST + 4.6, size: 1.4, power: 15 });

    /* ---------- the stage: platform skirt + top, stairs, proscenium arch, two curtains, backdrop ---------- */
    const stg = new THREE.Group(); top.add(stg);
    const skirtOut = [[-SW / 2, 0], [SW / 2, 0], [SW / 2, SHGT], [-SW / 2, SHGT]];
    const skirt = card(st, { outline: skirtOut, base: PAL.deep, ppu: 36, seed: 900, paint: P => { for (let i = 0; i < 13; i++) P.layer(P.poly(ellipse(-SW / 2 + .5 + i * 1, SHGT, .5, .32, 12).filter(([, y]) => y <= SHGT)), mix(PAL.dark, PAL.mid, .3), { shadow: .5 }); P.layer(P.rect(-SW / 2, .12, SW, .18), shade(PAL.deep, .8), { shadow: .3 }); } });
    const floor = card(st, { outline: [[-SW / 2, 0], [SW / 2, 0], [SW / 2, 4.2], [-SW / 2, 4.2]], base: mix(PAL.dark, PAL.mid, .55), ppu: 24, seed: 901, paint: P => { for (let i = 0; i < 14; i++) P.layer(P.rect(-SW / 2 + i * .93, 0, .9, 4.2), mix(PAL.dark, PAL.mid, .45 + (i % 2) * .12), { shadow: .2, lip: .3 }); } });
    floor.mesh.rotation.x = -Math.PI / 2; floor.mesh.position.set(0, SHGT, 0);
    const stairsOut = [[-1.6, 0], [1.6, 0], [1.6, .5], [1.3, .5], [1.3, 1], [1, 1], [1, 1.5], [-1, 1.5], [-1, 1], [-1.3, 1], [-1.3, .5], [-1.6, .5]];
    const stairs = card(st, { outline: stairsOut, base: PAL.mid, ppu: 44, seed: 902, paint: P => [.45, .95, 1.45].forEach(y => P.layer(P.rect(-1.6, y, 3.2, .07), mix(PAL.cream, PAL.mid, .4), { shadow: .2 })) });
    stairs.mesh.position.z = 1.6;
    const sk = stand(st, stg, { x: 0, z: ZST, cards: [skirt, floor, stairs], shadowOutline: skirtOut, order: 2, shadow: { len: .3 } });
    // proscenium arch with an opening, on the stage
    const aw = SW - .4, ow = 10.2, oh = 5.4;
    const archOut = [[-aw / 2, 0], [aw / 2, 0], [aw / 2, ARCH_H - .8], [aw * .25, ARCH_H - .3], [0, ARCH_H], [-aw * .25, ARCH_H - .3], [-aw / 2, ARCH_H - .8]];
    const archHole = [[-ow / 2, 0], [ow / 2, 0], [ow / 2, oh - .5]]; for (let i = 1; i < 14; i++) { const a = i / 14 * Math.PI; archHole.push([Math.cos(a) * ow / 2, oh - .5 + Math.sin(a) * .9]); } archHole.push([-ow / 2, oh - .5]);
    const archPaint = (lit) => P => {
      for (let i = 0; i < 7; i++) [-1, 1].forEach(s => P.layer(P.rect(s > 0 ? ow / 2 + .08 : -aw / 2 + .06, .2 + i * .78, (aw - ow) / 2 - .14, .7), shade(PAL.light, i % 2 ? .92 : .84), { shadow: .4, lip: .5 }));
      scoreCols.slice(0, 10).forEach((c, i) => P.layer(P.circle(-ow / 2 + .5 + i * (ow - 1) / 9, oh + .75, .2), lit ? mix(PAL.winLit, c, .45) : shade(tone(c, .5), .7), { shadow: .3 }));
      P.layer(P.poly(star(.62, .28, 5, 0, ARCH_H - .75)), lit ? PAL.guide : mix(PAL.mid, PAL.cream, .3), { shadow: .4 });
    };
    const archC = card(st, { outline: archOut, holes: [archHole], base: mix(PAL.light, PAL.mid, .35), ppu: 36, seed: 903, paint: archPaint(false) });
    const archS = stand(st, stg, { x: 0, y: SHGT, z: ZST - .4, cards: [archC], order: 2.3 });
    // backdrop at the back of the stage
    const bdOut = [[-ow / 2 - .3, 0], [ow / 2 + .3, 0], [ow / 2 + .3, oh + .6], [-ow / 2 - .3, oh + .6]];
    const backdrop = card(st, { outline: bdOut, base: PAL.deep, ppu: 24, seed: 904, paint: P => { for (let i = 0; i < 30; i++) P.layer(P.poly(star(.12, .05, 4, (R() - .5) * ow, .8 + R() * oh)), mix(PAL.deep, PAL.cream, .25), { shadow: 0, lip: 0 }); } });
    stand(st, stg, { x: 0, y: SHGT, z: ZST - 4, cards: [backdrop], order: 2.2 });
    // curtains: pivot on the outer edge, swing open like drapes
    const curtain = (s) => {
      const w = ow / 2 + .2, out = [[0, 0], [s * w, 0], [s * w, oh + .5], [0, oh + .5]].map(([x, y]) => [x, y]);
      for (let i = 1; i < 6; i++) out.splice(1 + 0, 0); // (kept simple: wavy hem is printed)
      const cc = shade(tone('#9C2F4A', .5), .7);
      const c = card(st, { outline: s > 0 ? out : out.map(([x, y]) => [x, y]).reverse(), base: cc, ppu: 30, seed: 905 + (s > 0 ? 1 : 0), paint: P => { for (let i = 0; i < 7; i++) P.layer(P.rect(Math.min(0, s * w) + i * w / 7, 0, w / 14, oh + .5), shade(cc, .82), { shadow: .3, lip: .3 }); P.layer(P.rect(Math.min(0, s * w), oh - .1, w, .5), mix(cc, PAL.cream, .2), { shadow: .4 }); P.layer(P.rect(Math.min(0, s * w), .1, w, .14), PAL.guide, { shadow: .2 }); } });
      const piv = new THREE.Group(); piv.position.set(-s * (ow / 2 + .2), 0, .1); piv.add(c.mesh); archS.group.add(piv);
      return { piv, s, sp: new Spring(0, 3.4, .85) };
    };
    const curtains = [curtain(1), curtain(-1)];
    // stage lights: two beams + a warm stage light (off until the pick)
    const stageLight = new THREE.PointLight('#FFE3B0', 0, 14, 1); stageLight.position.set(0, SHGT + 4, ZST - 1); stg.add(stageLight);
    const spots = [-1, 1].map(s => { const b = beam(st, stg, { x: s * 4.4, y: SHGT + ARCH_H - 1, z: ZST - .2, h: 6.6, w: .5, w2: 3.2, colour: PAL.guide, opacity: 0, tilt: 0 }); b.group.rotation.z = Math.PI - s * .45; return b; });

    /* ---------- buildings round the square: windows light one by one ---------- */
    const blds = [];
    [[-15.6, -6.6, 4.6, 6.4, 'gable', .25], [-11, -8.4, 4.2, 7.4, 'flat', .1], [11, -8.4, 4.2, 7.2, 'step', -.1], [15.6, -6.6, 4.6, 6.2, 'gable', -.25], [-17.6, -1.4, 4, 5.6, 'flat', .9], [17.6, -1.2, 4, 5.8, 'step', -.9]].forEach(([x, z, w, h, roof, yaw], k) => {
      const b = building(st, top, { x, z, yaw, w, h, roof, cols: 3, rows: 3, base: mix(PAL.light, PAL.mid, .35 + (k % 2) * .15), seed: 910 + k, order: 1 + k * .05, lit: 0, litCol: PAL.winLit, ppu: 26, blur: k > 3 ? 1.4 : 0 });
      b.n = 0; b.next = 1.6 + k * .35; blds.push(b);
    });
    st.onUpdate(t => blds.forEach((b, k) => { if (b.n < b.windows && t >= b.next) { b.n++; b.next = t + .32 + ((b.n * 7 + k * 3) % 5) * .08; b.setLit(b.n, b.n % 4 === 0 ? mix(PAL.winLit, scoreCols[(b.n + k) % scoreCols.length], .45) : PAL.winLit); } }));
    const resetWindows = () => blds.forEach((b, k) => { b.n = b.windows; b.setLit(b.n); });

    /* ---------- lanterns and bunting crossing the square (score colours) ---------- */
    const lines = [];
    [[[-9.6, 3.7, 3.6], [-6.5, SHGT + 6.4, ZST - .3], .7], [[9.6, 3.7, 3.6], [6.5, SHGT + 6.4, ZST - .3], .7], [[-15.6, 6.4, -6.6], [-6.5, SHGT + 6.6, ZST - .5], .8], [[15.6, 6.4, -6.6], [6.5, SHGT + 6.6, ZST - .5], .8]].forEach(([a, b, sag], k) => {
      const bt = bunting(st, top, { a, b, sag, n: 9, colours: scoreCols.slice(k * 3).concat(scoreCols.slice(0, k * 3)), level, seed: 930 + k * 20, order: 4 + k * .2 });
      lines.push(bt);
    });
    const lanterns = [];
    [[-8.5, 4.4, 1.4], [-7.4, 5.6, -1.6], [8.5, 4.4, 1.4], [7.4, 5.6, -1.6], [-11.6, 5.4, -6.6], [11.6, 5.4, -6.6]].forEach((p, k) => {
      const col = scoreCols[(k * 5) % scoreCols.length], lo = ellipse(0, 0, .42, .54, 16);
      const c = card(st, { outline: lo, base: mix(PAL.winLit, col, .5), ppu: 60, th: .05, seed: 960 + k, unlit: true, paint: P => { P.layer(P.rect(-.42, .34, .84, .1), shade(col, .55), { shadow: .3 }); P.layer(P.rect(-.42, -.44, .84, .1), shade(col, .55), { shadow: .3 }); P.layer(P.poly(ribbon([[0, -.54], [0, -.85]], .06)), shade(col, .6)); } });
      c.mesh.position.set(...p); top.add(c.mesh); lanterns.push(c); const ph = k * 1.3; st.onUpdate(t => { if (!st.reduce) c.mesh.rotation.z = Math.sin(t * 1.1 + ph) * .07; });
    });

    /* ---------- front row of people seen from behind, a few more around ---------- */
    const crowd = [];
    [[-5.4, 3.2], [-3.6, 3.8], [-1.8, 3.4], [.6, 3.9], [2.4, 3.3], [4.2, 3.8], [5.8, 3.1], [-6.8, 1.6], [7.2, 1.7], [-4.6, 5.6], [-1, 5.8], [2.8, 5.6], [5.6, 5.4]].forEach(([x, z], k) => {
      const p = person(st, top, { x, z, yaw: Math.PI + Math.max(-.4, Math.min(.4, x * .05)), h: 2.4 + (k % 3) * .3, colour: scoreCols[k % scoreCols.length], level: .75, seed: 980 + k, kind: [0, 2][k % 2], order: 5 + k * .04, back: true, twoSided: false });
      // DEN hands: raised arms card hidden behind the head, shown on the pick
      // DEN hands: two raised arms from the shoulders, hidden until the pick
      const H = p.h, armOut = [[-.07 * H, 0], [.07 * H, 0], [.09 * H, .42 * H], [.14 * H, .5 * H], [0, .55 * H], [-.12 * H, .48 * H], [-.08 * H, .42 * H]];
      const arms = new THREE.Group(); arms.visible = false; arms.mesh = arms;
      [-1, 1].forEach(sd => { const c = card(st, { outline: armOut, base: mix(PAL.mid, PAL.light, .4), ppu: 60, seed: 1000 + k, key: 'arm' + (k % 3) + (k % 2), paint: P => P.layer(P.circle(0, .5 * H, .07 * H), PAL.skin, { shadow: .3 }) });
        c.mesh.position.set(sd * .17 * H, .52 * H, -.05); c.mesh.rotation.z = -sd * .32; arms.add(c.mesh); });
      p.group.add(arms); p.arms = arms;
      p.home = [x, z]; p.sx = new Spring(x, 4.5, .8); p.sz = new Spring(z, 4.5, .8); p.sy = new Spring(0, 7, .5); p.yaw0 = p.base.rotation.y;
      crowd.push(p);
    });
    st.onUpdate((t, dt) => crowd.forEach(p => { [p.sx, p.sz, p.sy].forEach(s => st.reduce ? s.snap(s.target) : s.step(dt)); p.base.position.set(p.sx.x, p.sy.x, p.sz.x); }));
    [[-SW / 2 - 1, ZST + 1.4], [SW / 2 + 1, ZST + 1.4], [-9.6, 3.6], [9.6, 3.6]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.4, seed: 1020 + k, order: 3.5, colour: scoreCols[k] }));

    /* ---------- landscape side pages: more of the square, crowds walking in ---------- */
    const wingPeople = [];
    if (st.orient === 'land') {
      const keep = st.lightPos.clone(); st.lightPos.set(0, 5, 3);
      [[-19, 53, 1], [19, 57, -1]].forEach(([x, seed, s], k) => {
        const sp = sidePage(st, root, { x, y: -5, z: 9, rx: 6.2, rz: 4.8, seed, lamp: 6, paint: P => { const Rr = rng(seed); for (let i = 0; i < 70; i++) P.layer(P.rect((Rr() - .5) * 13, (Rr() - .5) * 9, .9, .7), mix(PAL.ground, PAL.groundLt, .3 + Rr() * .5), { shadow: .3, lip: .4 }); } });
        const b = building(st, sp.top, { x: -s * 2.6, z: -2.6, w: 4.6, h: 6.2, roof: k ? 'step' : 'gable', cols: 3, rows: 3, base: mix(PAL.light, PAL.mid, .4), seed: 1030 + k, order: 4.2, lit: 0, ppu: 24 }); b.n = 0; b.next = 2 + k * .4; blds.push(b);
        bunting(st, sp.top, { a: [-6, 4.4, -2], b: [6, 4.2, -1.2], sag: .8, n: 9, colours: scoreCols, level, seed: 1040 + k, order: 4.6 });
        [[1.4, .8], [2.8, 1.8], [.2, 2.4], [3.8, .2], [-1.2, 1.6]].forEach(([px, pz], j) => { const p = person(st, sp.top, { x: s * px, z: pz, yaw: s * -.4, h: 2.2 + (j % 2) * .3, colour: scoreCols[(j + k * 3) % scoreCols.length], level: .7, seed: 1050 + k * 10 + j, kind: j + k, order: 4.8 + j * .05, arms: j % 2 === 0 }); wingPeople.push(p); });
        lampPost(st, sp.top, { x: s * 5.2, z: 1.6, h: 3, seed: 1060 + k, order: 4.7 });
      });
      st.lightPos.copy(keep);
    }

    const life = motes(st, top, { n: 30, box: [[-12, 2, -8], [12, 9, 5]], colours: scoreCols.slice(0, 5).concat([PAL.cream]), size: .17, seed: 61 });

    /* the guide floats up the stairs once the page is open */
    let climbed = false;
    st.onUpdate(t => { if (!climbed && t > 1.5) { climbed = true; G.flyTo(0, SHGT + 3.4, ZST + 2.4); } });

    /* ---------- reaction ---------- */
    let pieces = [], timers = [], extras = [], sweep = null, fw = [], tiles = [];
    const at = (d, fn) => timers.push({ t: st.time + d, fn });
    function clearAll() {
      pieces.forEach(p => removePiece(st, p)); pieces = []; timers = []; fw = []; tiles = [];
      extras.forEach(e => e.parent && e.parent.remove(e)); extras = []; sweep = null;
      curtains.forEach(c => { c.sp.snap(0); c.piv.rotation.y = 0; }); stageLight.k = 0; spots.forEach(b => { b.on = false; b.mat.opacity = 0; });
      archC.reprint(archPaint(false));
      crowd.forEach(p => { p.sx.snap(p.home[0]); p.sz.snap(p.home[1]); p.sy.snap(0); p.base.rotation.y = p.yaw0; p.arms.mesh.visible = false; p.hop = null; });
    }
    function react(m) {
      clearAll();
      curtains.forEach(c => c.sp.target = 1.2); stageLight.k = 1;
      at(.35, () => { spots.forEach(b => { b.on = true; b.mat.color.set(mix(PAL.guide, MAJ[m], .35)); }); archC.reprint(archPaint(true)); });
      G.flyTo(0, SHGT + 3.4, ZST - .4); G.flash(MAJ[m]);
      if (m === 'DGA') {               // a giant painting unrolls from the top of the arch as the backdrop
        const w = ow - .4, h = oh;
        const c = card(st, { outline: [[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]], base: mix(PAL.cream, MAJ.DGA, .12), ppu: 30, seed: 1100, emit: .2, paint: P => {
          const Rr = rng(1101), cols = [MAJ.DGA, '#FFD166', '#4BE3C1', MAJ.DEN, MAJ.AFX, MAJ.DGD];
          P.layer(P.poly([[-w / 2, -h], [w / 2, -h], [w / 2, -h * .45], [w * .2, -h * .6], [-w * .15, -h * .35], [-w / 2, -h * .55]]), tone('#4BA37E', .8), { shadow: .5 });
          P.layer(P.circle(w * .28, -h * .28, 1), '#FFD166', { shadow: .5 });
          for (let k = 0; k < 14; k++) P.layer(P.poly(ellipse(-w / 2 + .6 + Rr() * (w - 1.2), -h + .6 + Rr() * (h - 1.6), .3 + Rr() * .6, .25 + Rr() * .5, 12, .15, k)), cols[k % cols.length], { shadow: .4 });
          P.layer(P.poly(ribbon(quad([-w / 2 + .5, -h * .7], [0, -h * .1], [w / 2 - .5, -h * .75], 12), .22)), shade(MAJ.DGA, .75), { shadow: .4 });
        } });
        const piv = new THREE.Group(); piv.position.set(0, oh + .2, -2.6); piv.add(c.mesh); piv.rotation.x = -Math.PI / 2; archS.group.add(piv); extras.push(piv);
        const s = new Spring(-Math.PI / 2, 4.2, .6); at(.9, () => s.target = 0); st.onUpdate((t, dt) => { if (!piv.parent) return; st.reduce ? s.snap(s.target) : s.step(dt); piv.rotation.x = s.x; });
      } else if (m === 'DGD') {        // matching flags (re-dyed) and signs fold open all round the square
        at(.8, () => lines.forEach((l, k) => l.recolour([MAJ.DGD, mix(MAJ.DGD, PAL.cream, .55)], 1)));
        const pos = [[-8.6, -2.4, 'shield'], [8.6, -2.4, 'shield'], [-10.6, 1.8, 'circle'], [10.6, 1.8, 'circle'], [-6.6, 6, 'rect'], [6.6, 6, 'rect']];
        pos.forEach(([x, z, shape], k) => { const sp = signPost(st, top, { x, z, yaw: -x * .03, shape, w: 1.5, hBoard: 1.1, post: 2.2, colour: MAJ.DGD, level: 1, symbol: symbolFor('DGD'), seed: 1110 + k, order: 6 }); st.reduce ? sp.hinge.snap(1) : sp.hinge.open(.8 + k * .15); pieces.push(sp); });
        at(.6, () => lanterns.forEach(c => c.reprint(null, mix(PAL.winLit, MAJ.DGD, .55))));
      } else if (m === 'IGD') {        // the square becomes a board game; front-row people hop along it
        const path = []; for (let i = 0; i < 9; i++) { const a = Math.PI * (1 - i / 8); path.push([Math.cos(a) * 7.6, -.6 - Math.sin(a) * -2.4 + 1.6]); }
        for (let i = 0; i < 5; i++) path.push([-4 + i * 2, 5.6]);
        path.forEach(([x, z], k) => {
          const col = [MAJ.IGD, '#FFD166', MAJ.DEN, MAJ.DGA][k % 4];
          const c = card(st, { outline: [[-.75, -.75], [.75, -.75], [.75, .75], [-.75, .75]], base: tone(col, 1), ppu: 40, th: .08, seed: 1130 + k, unlit: true, paint: P => { P.layer(P.rect(-.58, -.58, 1.16, 1.16), mix(col, PAL.cream, .3), { shadow: .3 }); if (k % 3 === 0) symbolFor('IGD')(P, 0, 0, .3, shade(col, .6)); } });
          const g = new THREE.Group(); c.mesh.rotation.x = -Math.PI / 2; g.add(c.mesh); g.position.set(x, -.2, z); g.visible = false; top.add(g); extras.push(g);
          const s = new Spring(-.2, 10, .4); at(.6 + k * .09, () => { g.visible = true; s.target = .05; }); st.onUpdate((t, dt) => { if (!g.parent) return; st.reduce ? s.snap(s.target) : s.step(dt); g.position.y = s.x; });
          tiles.push([x, z]);
        });
        [0, 2, 4].forEach((ci, j) => { const p = crowd[ci]; p.hop = { path: tiles.slice(j * 2, j * 2 + 5), i: 0, next: st.time + 1.8 + j * .25 }; });
      } else if (m === 'AFX') {        // fireworks burst over the stage, a light sweeps the square
        const burst = (cx, cy, cz, col, d) => { for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, c = card(st, { outline: star(.32, .13, 5), base: tone(col, 1), ppu: 60, th: .03, seed: 1150 + k, unlit: true, key: 'fw' + col + (k % 2) });
            const g = new THREE.Group(); g.add(c.mesh); g.position.set(cx, cy, cz); g.visible = false; top.add(g); extras.push(g);
            fw.push({ g, a, cx, cy, cz, t0: st.time + d, r: 1.8 + (k % 3) * .4 }); } };
        burst(-6.4, 8.2, ZST - 1.6, MAJ.AFX, .7); burst(6.2, 8.6, ZST - 1.8, '#FFD166', 1.1); burst(-2.4, 9.6, ZST - 2.6, MAJ.DGA, 1.5); burst(3, 9.2, ZST - 2.2, scoreCols[0], 1.9);
        const b = beam(st, top, { x: 0, y: SHGT + ARCH_H - .4, z: ZST - .2, h: 14, w: .7, w2: 5.5, colour: MAJ.AFX, opacity: 0 }); extras.push(b.group);
        sweep = { b, t0: st.time + .8 };
      } else if (m === 'DEN') {        // hands up, sparkles fall, three people come up on stage
        crowd.forEach((p, k) => at(.6 + k * .05, () => { p.arms.mesh.visible = true; if (!st.reduce) p.hinge.kick(1.2); }));
        const sp = motes(st, top, { n: 36, box: [[-9, 1, -6], [9, 10, 5]], colours: [MAJ.DEN, PAL.cream, mix(MAJ.DEN, PAL.cream, .5), '#FFD166'], size: .2, speed: .6, seed: 1170 }); extras.push(sp.mesh || sp.group || sp);
        [[1, -2.4], [3, 0], [5, 2.4]].forEach(([ci, x], j) => { const p = crowd[ci]; at(1.4 + j * .35, () => { p.sx.target = x; p.sz.target = ZST - 1.2; p.sy.target = SHGT; p.base.rotation.y = 0; }); });
      }
      at(2.4, () => { G.flash(MAJ[m]); life.setColours([MAJ[m], PAL.cream, mix(MAJ[m], PAL.cream, .5)]); wingPeople.forEach(p => { if (!st.reduce) p.hinge.kick(1.3); }); });
    }
    st.onUpdate((t, dt) => {
      const due = timers.filter(x => t >= x.t); if (due.length) { timers = timers.filter(x => t < x.t); due.forEach(x => x.fn()); }
      curtains.forEach(c => { st.reduce ? c.sp.snap(c.sp.target) : c.sp.step(dt); c.piv.rotation.y = c.s * c.sp.x; });
      stageLight.intensity += ((stageLight.k ? 16 : 0) * st.openness - stageLight.intensity) * Math.min(1, dt * 3);
      spots.forEach(b => { b.mat.opacity += ((b.on ? .42 : 0) - b.mat.opacity) * Math.min(1, dt * 3); });
      fw.forEach(f => { const u = (t - f.t0) / 1.3; f.g.visible = u > 0 && u < 1.25; if (!f.g.visible) return; const e = 1 - Math.pow(1 - Math.min(1, u), 3); f.g.position.set(f.cx + Math.cos(f.a) * f.r * e, f.cy + Math.sin(f.a) * f.r * e - u * u * .6, f.cz); f.g.rotation.z = u * 3; });
      if (sweep) { const u = t - sweep.t0; sweep.b.mat.opacity = Math.max(0, Math.min(.55, u * .9)); sweep.b.group.rotation.z = Math.PI + Math.sin(u * 1.4) * .75; sweep.b.group.rotation.x = .55; }
      crowd.forEach(p => { if (!p.hop || t < p.hop.next || p.hop.i >= p.hop.path.length) return; const [x, z] = p.hop.path[p.hop.i++]; p.sx.target = x; p.sz.target = z; p.sy.v = st.reduce ? 0 : 3.4; p.base.rotation.y = 0; p.hop.next = t + .45; });
    });

    return {
      root, react,
      frames: {
        focus: st.orient === 'land' ? { min: [-7.6, 0, ZST - 1], max: [7.6, SHGT + ARCH_H - .6, 4.2] } : { min: [-7.4, 0, ZST - 1], max: [7.4, SHGT + ARCH_H, 4.2] },
        wide: st.orient === 'land' ? { min: [-25.2, -5, -9], max: [25.2, 6, 13.8] } : { min: [-20.5, 0, -12.6], max: [20.5, 6, 10.6] }
      },
      reset() { clearAll(); G.home(true); climbed = false; resetWindows(); life.setColours(scoreCols.slice(0, 5).concat([PAL.cream])); }
    };
  }
};
