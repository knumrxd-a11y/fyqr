/* ===== Scene 2.1 "สะพานที่พังครึ่งหนึ่ง" (SC[3]) =====
   A river of layered wavy paper strips drifting slowly, front to back across the page. An arched paper bridge
   broken in the middle: snapped planks hang down into the water, paper scraps float. The guide light (the player)
   waits on the left bank; three grey townspeople wait on the right bank.
   Pick, by major:
     DGA  painted strokes swing across the gap one by one and join into a bridge
     DGD  detour signs fold up along the bank path, stepping stones rise across the river downstream
     IGD  paper gears on both banks turn and the missing span lifts out of the water into place
     AFX  the fallen planks rise from the water and assemble one by one
     DEN  the townspeople line up and pass planks across, then festival flags are strung along the bridge
   Every version ends with the townspeople on the right bank getting their colour back. Colour level .55. */
import { THREE, PAL, MAJ, ORDER, tone, mix, shade, rng, card, stand, island, guide, ribbon, quad, torn, ellipse, cloud,
  building, person, lampPost, signPost, bunting, puff, motes, Spring, removePiece, sidePage, symbolFor } from '../shared.js';

const SPAN = 7, GAP = 2.1, DECK = .8, RISE = 2.3;                 // bridge: x from -SPAN..SPAN, broken |x| < GAP
const deckY = x => DECK + RISE * (1 - (x / SPAN) ** 2);
const slope = x => -2 * RISE * x / (SPAN * SPAN);
const RIVER = x => 0;                                                // river centre x is 0 (it bends in z only slightly)
const riverX = z => Math.sin(z * .16) * 1.1;                         // centreline bends a little
const RW = 4.2;                                                      // half width of the water

export default {
  id: '2-1',
  cam: { land: { pitch: 33 }, port: { pitch: 35 } },
  build(st, ctx) {
    const level = ctx.colour ?? .55;
    const root = new THREE.Group();
    const R = rng(21);
    const water = tone('#4A6FB0', .45), waterDk = shade(water, .62), waterLt = mix(water, PAL.light, .22);
    const riverPts = (off, z0 = -13, z1 = 13) => { const p = []; for (let z = z0; z <= z1; z += 1) p.push([riverX(z) + off, -z]); return p; };

    /* ---------- the page: two banks, the river printed between them ---------- */
    const page = island(st, root, {
      outline: torn(0, 0, 21.5, 12.5, 23, 96), seed: 11, ppu: 24, blurFar: .24, blurNear: .86, blurPx: 4, paint: P => {
        const Rr = rng(8);
        for (let i = 0; i < 380; i++) { const x = (Rr() - .5) * 43, y = (Rr() - .5) * 25, w = .55 + Rr() * .6; if (Math.abs(x - riverX(-y)) < RW + 1) continue; P.layer(P.rect(x, y, w, w * .55), mix(PAL.ground, PAL.groundLt, .45 + Rr() * .55), { shadow: .3, lip: .45 }); }
        // bank paths up to the bridge ends
        P.layer(P.poly(ribbon([[-21, -3], [-14, -1.2], [-9, -.4], [-SPAN - .6, 0]], 2, 2.2)), PAL.groundDk, { shadow: .5 });
        P.layer(P.poly(ribbon([[SPAN + .6, 0], [10, -.6], [15, -2], [21, -4]], 2.2, 2)), PAL.groundDk, { shadow: .5 });
        P.layer(P.poly(ribbon([[-9.5, -.4], [-8.4, -3.6], [-6.6, -6.2], [-4.6, -7.4]], 1.3, 1.1)), mix(PAL.groundDk, PAL.ground, .4), { shadow: .4 });   // riverside path (detour)
        // banks: a darker lip of earth, then the water in three value steps
        P.layer(P.poly(ribbon(riverPts(0), (RW + .9) * 2)), '#3A3450', { shadow: .7 });
        P.layer(P.poly(ribbon(riverPts(0), RW * 2)), waterDk, { shadow: .6 });
        P.layer(P.poly(ribbon(riverPts(-.4), RW * 1.3)), water, { shadow: .3 });
        // stones on the banks
        for (let i = 0; i < 30; i++) { const z = -12 + i * .85, s = i % 2 ? 1 : -1; if (Rr() < .35) continue; P.layer(P.poly(ellipse(riverX(z) + s * (RW + .45 + Rr() * .5), -z + (Rr() - .5) * .4, .3 + Rr() * .25, .2 + Rr() * .12, 10, .1, i)), mix(PAL.dark, PAL.mid, .3 + Rr() * .5), { shadow: .5 }); }
      }
    });
    const top = page.top;

    /* ---------- the guide light = the player, waiting on the left bank ---------- */
    const G = guide(st, root, { x: -9.4, y: 3.6, z: 1.4, power: 21 });

    /* ---------- the river: layered wavy strips drifting, paper scraps floating ---------- */
    const strips = [];
    for (let k = 0; k < 7; k++) {
      const off = -RW + .7 + k * (RW * 2 - 1.4) / 6, w = .55 + (k % 3) * .22, pts = [];
      for (let z = -12; z <= 12; z += .6) pts.push([riverX(z) + off + Math.sin(z * .42 + k * 1.7) * .16, -z]);
      const col = [mix(water, waterLt, .55), mix(waterDk, water, .6), mix(water, waterLt, .25)][k % 3];
      const c = card(st, { outline: ribbon(pts, w), base: col, ppu: 30, th: .03, seed: 300 + k, rim: false, paint: P => P.layer(P.poly(ribbon(pts.map(([a, b]) => [a + .08, b]), w * .3)), mix(col, waterLt, .35), { shadow: .2, lip: .3 }) });
      c.mesh.rotation.x = -Math.PI / 2; c.mesh.position.y = .04 + k * .006; top.add(c.mesh);
      strips.push({ m: c.mesh, ph: k * 1.3, a: .14 + (k % 2) * .08 });
    }
    const scraps = [];
    for (let k = 0; k < 6; k++) {
      const out = [[-.35, -.22], [.3, -.28], [.4, .18], [-.1, .3], [-.38, .12]].map(([a, b]) => [a * (1 + k % 2 * .3), b]);
      const c = card(st, { outline: out, base: [PAL.light, PAL.cream, PAL.mid][k % 3], ppu: 50, th: .03, seed: 320 + k });
      const g = new THREE.Group(); c.mesh.rotation.x = -Math.PI / 2; g.add(c.mesh); top.add(g);
      const z0 = -9 + k * 3.4; scraps.push({ g, z0, x0: riverX(z0) + (k % 2 ? 1.6 : -1.4), ph: k * 2.1 });
    }
    st.onUpdate(t => {
      if (st.reduce) return;
      strips.forEach(s => { s.m.position.x = Math.sin(t * .45 + s.ph) * s.a; s.m.position.z = Math.sin(t * .3 + s.ph) * .35; });
      scraps.forEach(s => { const z = s.z0 + Math.sin(t * .25 + s.ph) * 1.2; s.g.position.set(riverX(z) - riverX(s.z0) + s.x0 + Math.sin(t * .6 + s.ph) * .2, .1 + Math.sin(t * 1.4 + s.ph) * .03, z); s.g.rotation.y = Math.sin(t * .4 + s.ph) * .6; });
    });

    /* ---------- the bridge: two halves (front + back parapet profiles + plank deck), the middle gone ---------- */
    const parapet = .75, under = .6;
    const profile = (x0, x1, broken) => {   // outline of one side panel from x0 to x1 (x1 is the broken end)
      const s = Math.sign(x1 - x0), n = 10, topE = [], botE = [];
      for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; topE.push([x, deckY(x) + parapet]); botE.push([x, Math.max(0, deckY(x) - under - (1 - Math.abs(x) / SPAN) * .2)]); }
      const jag = broken ? [[x1 + s * .15, deckY(x1) + .2], [x1 - s * .1, deckY(x1) - .05], [x1 + s * .08, deckY(x1) - .35]] : [];
      return [[x0 - s * .5, 0], ...botE.slice(0, 1), ...topE, ...jag, ...botE.slice(1).reverse(), [x0 - s * .5, 0]].filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
    };
    const sidePaint = P => {
      for (let x = -SPAN; x <= SPAN; x += .62) P.layer(P.rect(x, deckY(x) - .38, .5, .26), mix(PAL.mid, PAL.light, .35), { shadow: .4, lip: .5 });
      for (let x = -SPAN + .3; x <= SPAN; x += 1.1) P.layer(P.rect(x, deckY(x) + .08, .12, parapet - .1), PAL.dark, { shadow: .4 });
    };
    const plankOut = [[-.25, -1.08], [.25, -1.08], [.25, 1.08], [-.25, 1.08]];
    const plankPaint = P => { P.layer(P.rect(-.18, -.9, .1, 1.8), shade(PAL.light, .9), { shadow: .2, lip: .3 }); P.layer(P.circle(0, -.75, .05), PAL.ink, { shadow: 0, lip: 0 }); P.layer(P.circle(0, .75, .05), PAL.ink, { shadow: 0, lip: 0 }); };
    const plank = (parent, x, opts = {}) => {
      const c = card(st, { outline: plankOut, base: opts.base || mix(PAL.light, PAL.mid, .3), ppu: 40, th: .06, seed: 340, key: 'key' in opts ? opts.key : 'plank', paint: opts.paint || plankPaint });
      const g = new THREE.Group(); c.mesh.rotation.x = -Math.PI / 2; g.add(c.mesh); g.position.set(x, deckY(x) + .02, 0); g.rotation.z = Math.atan(slope(x)); parent.add(g);
      return { g, c };
    };
    const halves = [];
    [[-SPAN, -GAP], [SPAN, GAP]].forEach(([x0, x1], hi) => {
      const out = profile(x0, x1, true);
      const front = card(st, { outline: out, base: mix(PAL.light, PAL.mid, .25), ppu: 40, th: .1, seed: 350 + hi, paint: sidePaint });
      const back = card(st, { outline: out, base: PAL.mid, ppu: 24, th: .1, seed: 352 + hi, paint: sidePaint });
      front.mesh.position.z = 1.1; back.mesh.position.z = -1.1;
      const deck = new THREE.Group(); deck.position.z = 0;
      const n = Math.round(Math.abs(x1 - x0) / .52);
      for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + .5) / n; plank(deck, x); }
      const s = stand(st, top, { x: 0, z: 0, cards: [back, deck, front], shadowOutline: out, order: 2 + hi * .2, shadow: { len: .5, opacity: .45 } });
      halves.push(s);
      // snapped planks hanging into the water from the broken end
      const sgn = Math.sign(x1 - x0);
      [[.0, -.6, 1.05], [.12, .3, 1.3], [-.05, .8, .9]].forEach(([dx, dz, ang], k) => {
        const c = card(st, { outline: [[0, -.25], [2.3, -.22], [2.5, .05], [2.2, .25], [0, .25]], base: mix(PAL.mid, PAL.dark, .2), ppu: 40, th: .06, seed: 360 + hi * 4 + k, paint: P => P.layer(P.rect(.2, -.08, 1.3, .1), shade(PAL.light, .9), { shadow: .2 }) });
        const g = new THREE.Group(); g.position.set(x1 + dx * sgn, deckY(x1) - .05, dz); g.rotation.y = sgn > 0 ? Math.PI : 0; g.rotation.x = 0;
        const hg = new THREE.Group(); hg.rotation.z = -ang; hg.add(c.mesh); c.mesh.position.x = -.05; g.add(hg);
        s.group.add(g); g.position.z = dz; g.position.x = x1 + dx * sgn;
        const ph = k + hi * 2; st.onUpdate(t => { if (!st.reduce) hg.rotation.z = -ang + Math.sin(t * .9 + ph) * .04; });
      });
    });

    /* ---------- the missing span: hidden planks that each version brings into place ---------- */
    const gapN = Math.round(GAP * 2 / .52), gap = [];
    for (let i = 0; i < gapN; i++) {
      const x = -GAP + GAP * 2 * (i + .5) / gapN;
      const g = new THREE.Group(); top.add(g); g.visible = false;
      gap.push({ x, g, u: new Spring(0, 7.5, .55), start: null, delay: 0, plank: null });
    }
    let gapSide = null; // a small parapet over the span (IGD lifts it with the planks)

    /* ---------- banks: grey houses behind, lamps, reeds; the townspeople on the right bank ---------- */
    [[-15.5, -7.6, 5, 4.6, 'gable'], [-10.8, -8.6, 4, 5.4, 'flat'], [-5.6, -9.6, 3.6, 4.2, 'step'], [6.4, -9.6, 3.8, 4.4, 'gable'], [11.2, -8.6, 4.4, 5.6, 'flat'], [16, -7.4, 4.2, 4.6, 'step']].forEach(([x, z, w, h, roof], k) =>
      building(st, top, { x, z, w, h, roof, cols: 2, rows: 2, lit: 1, base: mix(PAL.light, PAL.mid, .55 + (k % 2) * .15), seed: 380 + k, order: 1 + k * .05, blur: 2, ppu: 24 }));
    [[-SPAN - 1.2, 1.6], [SPAN + 1.2, 1.6]].forEach(([x, z], k) => lampPost(st, top, { x, z, h: 3.1, seed: 395 + k, order: 2.6 }));
    const reed = (x, z, k) => { const out = [[-.5, 0], [.5, 0], [.35, .6], [.55, 1.3], [.15, .8], [0, 1.6], [-.15, .9], [-.5, 1.2], [-.35, .5]];
      stand(st, top, { x, z, yaw: (k % 3 - 1) * .2, cards: [card(st, { outline: out, base: tone('#6FA36B', .4), ppu: 44, seed: 400 + k, key: 'reed' + (k % 3), paint: P => P.layer(P.poly(out.map(([a, b]) => [a * .55, b * .8])), tone('#8CC07E', .45), { shadow: .4 }) })], shadowOutline: out, order: 2.8 + k * .02, shadow: { len: .4, opacity: .35, blob: false } }); };
    [[-4.6, 4.2], [-5.2, 7], [-4.4, -4.6], [4.8, 5.4], [5.2, -3.6], [4.6, 8.4]].forEach(([x, z], k) => reed(x + riverX(z) * 0, z, k));
    const folk = [[8.6, -1, -.25, 0], [9.9, .7, -.45, 1], [11.1, -1.3, -.55, 2]].map(([x, z, yaw, k]) => {
      const p = person(st, top, { x, z, yaw, h: 2.5 + (k % 2) * .3, colour: MAJ.DEN, level: .12, seed: 410 + k, kind: k + 1, order: 3 + k * .1, arms: k === 1 });
      p.home = [x, z]; p.sx = new Spring(x, 4, .8); p.sz = new Spring(z, 4, .8); return p;
    });
    st.onUpdate((t, dt) => folk.forEach(p => { if (!p.sx) return; if (st.reduce) { p.sx.snap(p.sx.target); p.sz.snap(p.sz.target); } else { p.sx.step(dt); p.sz.step(dt); } p.base.position.x = p.sx.x; p.base.position.z = p.sz.x; }));

    /* ---------- landscape only: side pages beside the text box ---------- */
    const wings = [];
    if (st.orient === 'land') {
      const keep = st.lightPos.clone(); st.lightPos.set(0, 5, 2);
      // left: the river runs out of the page into a little mooring with a paper boat
      const wl = sidePage(st, root, { x: -21.5, y: -5, z: 9, rx: 7.2, rz: 5.4, seed: 45, lamp: 5, paint: P => {
        P.layer(P.poly(ribbon([[7.5, 1.5], [2, .8], [-2.5, -.6], [-7.5, -1.4]], 4.6, 3.6)), waterDk, { shadow: .6 });
        P.layer(P.poly(ribbon([[7.5, 1.6], [2, .9], [-2.5, -.5], [-7.5, -1.3]], 2, 1.4)), water, { shadow: .3 });
        const Rr = rng(46); for (let i = 0; i < 50; i++) { const x = (Rr() - .5) * 13, y = (Rr() - .5) * 9; if (Math.abs(y - x * .2) < 2.8) continue; P.layer(P.rect(x, y, .5, .3), mix(PAL.ground, PAL.groundLt, Rr()), { shadow: .3, lip: .4 }); } } });
      const boatOut = [[-1.4, .3], [1.4, .3], [1, -.1], [-1, -.1]];
      const boat = card(st, { outline: [[-1.5, .5], [1.5, .5], [1.05, 0], [-1.05, 0]], base: mix(PAL.light, PAL.cream, .2), ppu: 50, seed: 430, paint: P => P.layer(P.rect(-1.2, .3, 2.4, .1), PAL.mid, { shadow: .3 }) });
      const sail = card(st, { outline: [[0, .5], [0, 2.1], [1, .6]], base: PAL.light, ppu: 50, seed: 431 });
      sail.mesh.position.z = .02;
      const bs = stand(st, wl.top, { x: -.6, z: .4, yaw: .2, cards: [boat, sail], shadowOutline: boatOut, order: 4.5, shadow: { len: .4 } });
      st.onUpdate(t => { if (!st.reduce) bs.base.position.y = Math.sin(t * 1.2) * .05; });
      [[-4.6, -2.4, 4.6, 'gable'], [-1, -3, 4, 'flat']].forEach(([x, z, h, roof], k) => building(st, wl.top, { x, z, w: 3.2, h, roof, cols: 2, rows: 2, lit: 1, base: mix(PAL.light, PAL.mid, .55), seed: 440 + k, order: 4.2 + k * .05, ppu: 24 }));
      lampPost(st, wl.top, { x: 3.6, z: -1.6, h: 3, seed: 445, order: 4.6 });
      wl.m = 'left'; wings.push(wl);
      // right: the townspeople's street, more people waiting (they get their colour back too)
      const wr = sidePage(st, root, { x: 21.5, y: -5, z: 9, rx: 7.2, rz: 5.4, seed: 47, lamp: 5, paint: P => {
        P.layer(P.poly(ribbon([[-7.5, 1.6], [-2, .4], [3, -.2], [7.5, .6]], 2.4, 2)), PAL.groundDk, { shadow: .6 });
        const Rr = rng(48); for (let i = 0; i < 60; i++) P.layer(P.rect((Rr() - .5) * 13, (Rr() - .5) * 9, .5, .3), mix(PAL.ground, PAL.groundLt, Rr()), { shadow: .3, lip: .4 }); } });
      [[-3.8, -2.6, 5, 'step'], [.2, -3, 4.4, 'gable'], [4.2, -2.4, 5.2, 'flat']].forEach(([x, z, h, roof], k) => building(st, wr.top, { x, z, w: 3.4, h, roof, cols: 2, rows: 2, lit: 1, base: mix(PAL.light, PAL.mid, .5), seed: 450 + k, order: 4.2 + k * .05, ppu: 24 }));
      [[-3, 1.4], [-1.2, 2.2], [1.6, 1.6], [3.4, 2.6]].forEach(([x, z], k) => {
        const p = person(st, wr.top, { x, z, yaw: -.3 + (k % 2) * .2, h: 2.3 + (k % 2) * .3, colour: MAJ.DEN, level: .12, seed: 460 + k, kind: k + 2, order: 4.4 + k * .06 });
        p.home = null; p.wing = true; folk.push(p);
      });
      wr.m = 'right'; wings.push(wr);
      st.lightPos.copy(keep);
    }

    const life = motes(st, top, { n: 22, box: [[-14, 1.5, -10], [14, 6, 6]], colours: [PAL.cream, mix(PAL.cream, PAL.light, .5)], size: .15, seed: 13 });

    /* ---------- reaction ---------- */
    let pieces = [], timers = [], picked = null, gears = [], spanLift = null, risers = [];
    const at = (dt, fn) => timers.push({ t: st.time + dt, fn });
    const clearAll = () => {
      pieces.forEach(p => removePiece(st, p)); pieces = []; timers = []; gears = []; risers = [];
      gap.forEach(s => { s.g.visible = false; if (s.plank) { s.g.remove(s.plank.g); s.plank = null; } s.u.snap(0); s.start = null; });
      if (spanLift) { spanLift.g.parent.remove(spanLift.g); spanLift = null; }
      folk.forEach(p => { if (p.home) { p.sx.target = p.home[0]; p.sz.target = p.home[1]; p.sx.snap(p.home[0]); p.sz.snap(p.home[1]); } p.recolour(MAJ.DEN, .12, 0); });
    };
    const fillGap = (m, { from, delay = 0, step = .14, paint, base }) => {
      gap.forEach((s, i) => {
        s.plank = plank(s.g, 0, { key: null, base: base || mix(PAL.light, PAL.mid, .2), paint });
        s.plank.g.position.set(0, 0, 0); s.plank.g.rotation.z = 0;
        s.start = from(s, i); s.delay = st.time + delay + i * step; s.u.snap(0); s.u.target = 0; s.g.visible = false;
      });
    };
    const greet = (m, d) => at(d, () => {
      folk.forEach((p, k) => { p.recolour(MAJ[m], 1, .5); if (!st.reduce) p.hinge.kick(1.4 + k * .1); });
      G.flash(MAJ[m]); life.setColours([MAJ[m], PAL.cream, mix(MAJ[m], PAL.cream, .5)]);
    });
    function react(m) {
      clearAll(); picked = m;
      G.flyTo(-SPAN - .4, 3.4, 1.4); G.flash(MAJ[m]);
      if (m === 'DGA') {               // painted strokes swing across the gap, left to right
        const strokes = (k) => P => { P.layer(P.poly(ribbon([[-.2, -.9], [.05, -.2], [-.05, .4], [.2, .9]], .2)), mix(MAJ.DGA, PAL.cream, .45), { shadow: .4 }); P.layer(P.poly(ribbon([[.12, -.8], [.15, .8]], .08)), tone(['#FFD166', '#4BE3C1', '#FFF1B0'][k % 3], .9), { shadow: .3 }); };
        fillGap(m, { from: (s, i) => ({ dx: -.25, dy: .25, rz: 1.9, pivotLeft: true }), delay: .3, step: .2, base: tone(MAJ.DGA, .95), paint: strokes(0) });
        // a fat brush stroke lying along the deck, then drips of colour on the planks
        greet(m, .3 + gapN * .2 + .5);
        G.flyTo(0, 5.6, 2);
      } else if (m === 'DGD') {        // detour signs along the riverside path + stepping stones across downstream
        const sp = [[-9.6, -1.6], [-8.6, -3.8], [-7.2, -5.8], [-5.4, -7]];
        sp.forEach(([x, z], k) => { const s = signPost(st, top, { x, z, yaw: .5 - k * .15, shape: 'arrow', w: 1.3, hBoard: .75, post: 1.7, colour: MAJ.DGD, level: 1, symbol: symbolFor('DGD'), seed: 470 + k, order: 6 }); if (st.reduce) s.hinge.snap(1); else s.hinge.open(.2 + k * .22); pieces.push(s); });
        const zS = -7.4;
        for (let k = 0; k < 6; k++) {
          const x = riverX(zS) - RW + .7 + k * (RW * 2 - 1.4) / 5, out = ellipse(0, 0, .5, .38, 14, .06, k);
          const c = card(st, { outline: out, base: tone(MAJ.DGD, .85), ppu: 50, th: .14, seed: 480 + k, paint: P => P.layer(P.poly(ellipse(0, .05, .3, .2, 12)), mix(MAJ.DGD, PAL.cream, .45), { shadow: .3 }) });
          const g = new THREE.Group(); c.mesh.rotation.x = -Math.PI / 2; g.add(c.mesh); g.position.set(x, -.6, zS + Math.sin(k) * .25); top.add(g);
          risers.push({ g, u: new Spring(0, 7, .5), t0: st.time + 1.1 + k * .16 }); pieces.push({ base: g, hinge: null });
        }
        G.flyTo(-6.2, 3, -5.6);
        at(2.4, () => { G.flyTo(4.6, 3, -6.4); folk.forEach((p, k) => { if (p.home) { p.sx.target = p.home[0] - 1.8 + k * .3; p.sz.target = -3.6 - k * .6; } }); });
        greet(m, 2.6);
      } else if (m === 'IGD') {        // gears turn on both banks, the whole span rises out of the water
        [[-SPAN - .2, -1.9, 1], [SPAN + .2, -1.9, -1]].forEach(([x, z, dir], k) => {
          const teeth = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? .95 : 1.25; teeth.push([Math.cos(a) * r, 1.35 + Math.sin(a) * r]); }
          const hole = ellipse(0, 1.35, .32, .32, 12);
          const c = card(st, { outline: teeth, holes: [hole], base: tone(MAJ.IGD, 1), ppu: 50, th: .1, seed: 490 + k, paint: P => { P.layer(P.circle(0, 1.35, .7), shade(tone(MAJ.IGD, 1), .82), { shadow: .4 }); } });
          const s = stand(st, top, { x, z, yaw: k ? -.3 : .3, cards: [c], shadowOutline: teeth, order: 6 });
          c.mesh.position.y = 0; if (st.reduce) s.hinge.snap(1); else s.hinge.open(.1 + k * .1); pieces.push(s); gears.push({ c, dir });
        });
        const g = new THREE.Group(); top.add(g);
        gap.forEach(s => { const p = plank(g, s.x, { key: null, base: mix(PAL.light, MAJ.IGD, .3), paint: P => { plankPaint(P); P.layer(P.rect(-.25, -.1, .5, .2), tone(MAJ.IGD, 1), { shadow: .3 }); } }); });
        const rail = card(st, { outline: [[-GAP, deckY(GAP) + .1], [0, deckY(0) + .3], [GAP, deckY(GAP) + .1], [GAP, deckY(GAP) + .55], [0, deckY(0) + .8], [-GAP, deckY(GAP) + .55]], base: tone(MAJ.IGD, .9), ppu: 40, seed: 495 });
        rail.mesh.position.z = 1.1; g.add(rail.mesh);
        spanLift = { g, u: new Spring(0, 5.5, .6), t0: st.time + .7 };
        greet(m, 2.4); at(1.4, () => G.flyTo(0, 5.6, 2));
      } else if (m === 'AFX') {        // fallen planks rise from the water and assemble one by one
        fillGap(m, { from: (s, i) => ({ dx: (i % 2 ? .6 : -.5), dy: -deckY(s.x) - .2, rz: (i % 2 ? .8 : -.9), dz: (i % 3 - 1) * 1.2 }), delay: .4, step: .22, base: mix(PAL.light, MAJ.AFX, .3), paint: P => { plankPaint(P); P.layer(P.rect(-.25, .45, .5, .14), tone(MAJ.AFX, 1), { shadow: .3 }); } });
        for (let k = 0; k < 3; k++) at(.3 + k * .45, () => { const p = puff(st, top, { x: -1.2 + k * 1.2, y: .05, z: .4 - k * .4, w: 1.4, h: .8, colour: mix(PAL.cream, MAJ.AFX, .25), seed: 500 + k, order: 6 }); if (st.reduce) p.hinge.snap(1); else p.hinge.open(0); pieces.push(p); });
        greet(m, .4 + gapN * .22 + .6); at(1, () => G.flyTo(0, 5.6, 2));
      } else if (m === 'DEN') {        // townspeople line up at the bridge end and pass planks across, then flags
        folk.forEach((p, k) => { if (p.home) { p.sx.target = SPAN + .9 + k * 1.15; p.sz.target = .5 - (k % 2) * .8; } });
        fillGap(m, { from: (s, i) => ({ dx: SPAN + 1 - s.x, dy: 2.2, rz: .2, dz: .3 }), delay: 1.1, step: .25, base: mix(PAL.light, MAJ.DEN, .25), paint: P => { plankPaint(P); P.layer(P.rect(-.25, -.95, .5, .16), tone(MAJ.DEN, 1), { shadow: .3 }); } });
        at(1.1 + gapN * .25 + .2, () => {
          const cols = ORDER.map(k => MAJ[k]);
          [1.1, -1.1].forEach((z, k) => { const b = bunting(st, top, { a: [-SPAN + .3, deckY(-SPAN + .3) + 1.3, z], b: [SPAN - .3, deckY(SPAN - .3) + 1.3, z], sag: -1.2, n: 11, colours: cols, level: 1, seed: 520 + k, order: 7 });
            b.flags.forEach((f, i) => { if (st.reduce) f.hinge.snap(1); else f.hinge.open(i * .06); }); pieces.push({ base: b.group, hinge: null }); });
        });
        greet(m, 1.1 + gapN * .25 + .5); at(1.6, () => G.flyTo(0, 5.6, 2));
      }
    }
    st.onUpdate((t, dt) => {
      const due = timers.filter(x => t >= x.t); if (due.length) { timers = timers.filter(x => t < x.t); due.forEach(x => x.fn()); }
      gap.forEach(s => {
        if (!s.plank || !s.start) return;
        if (t >= s.delay && s.u.target === 0) { s.u.target = 1; s.g.visible = true; }
        if (st.reduce) s.u.snap(s.u.target); else s.u.step(dt);
        const u = s.u.x, v = 1 - u, f = s.start, x = s.x;
        if (f.pivotLeft) {             // swing in about the left end like a brushstroke being laid
          s.g.position.set(x - .26, deckY(x) + .02, 0); s.g.rotation.z = Math.atan(slope(x)) + v * f.rz; s.plank.g.position.x = .26;
        } else {
          s.g.position.set(x + v * (f.dx || 0), deckY(x) + .02 + v * (f.dy || 0), v * (f.dz || 0)); s.g.rotation.z = Math.atan(slope(x)) + v * (f.rz || 0); s.plank.g.position.x = 0;
        }
      });
      risers.forEach(r => { if (t >= r.t0) r.u.target = 1; if (st.reduce) r.u.snap(r.u.target); else r.u.step(dt); r.g.position.y = -.6 + .68 * r.u.x; });
      if (spanLift) {
        if (t >= spanLift.t0) spanLift.u.target = 1;
        if (st.reduce) spanLift.u.snap(spanLift.u.target); else spanLift.u.step(dt);
        const v = 1 - spanLift.u.x; spanLift.g.position.y = -2.6 * v; spanLift.g.rotation.z = .12 * v;
        if (!st.reduce) gears.forEach(g => { g.ang = (g.ang || 0) + dt * g.dir * 2.4 * Math.min(1, v * 4 + .05); g.c.mesh.rotation.z = g.ang; g.c.mesh.position.set(Math.sin(g.ang) * 1.35, 1.35 - Math.cos(g.ang) * 1.35, 0); });
      }
    });

    return {
      root, react,
      frames: {
        focus: { min: [-10.6, 0, -3.5], max: [11.8, 5.5, 3] },
        wide: st.orient === 'land' ? { min: [-28.5, -5, -15], max: [28.5, 5, 14] } : { min: [-21, 0, -12], max: [21, 5, 9] }
      },
      reset() { clearAll(); picked = null; G.home(true); life.setColours([PAL.cream, mix(PAL.cream, PAL.light, .5)]); }
    };
  }
};
