/* ===== Scene 2.3 "ร้านเก่าแก่ที่ใกล้ปิด" (SC[5]) — replaces the 2D shop art of 20-shop-scene.js =====
   A grey alley of three old shophouses, wires strung overhead (after shop-left/right.webp). The middle shop is
   dim: a faded blank sign, its roll-down iron door half closed. The old shop owner stands in front, the guide
   light (the player) floats nearby, a paper cat sleeps on the left shop's awning.
   Pick: the iron door rolls up and the shop lights come on, then by major:
     DGA  paintings unfold across the walls          DGD  a new sign and logo fold down over the old one
     IGD  the pavement turns into game tiles lighting up one by one
     AFX  spotlights and a paper movie camera turn to face the shop
     DEN  paper people fill the alley, flags and festival lanterns light up
   The owner and the cat wake up in colour. Colour level .55. */
import { THREE, PAL, MAJ, ORDER, tone, mix, shade, rng, card, stand, island, guide, ribbon, quad, torn, ellipse, cloud, star,
  building, person, lampPost, signPost, bunting, puff, motes, beam, Spring, removePiece, sidePage, symbolFor } from '../shared.js';

const SW = 5, SH = 7.2, ZS = -2.2;                // shophouse width / height, facade line
const OPEN = { x0: -1.6, x1: 1.6, y0: .3, y1: 3 }; // middle shopfront opening

export default {
  id: '2-3',
  cam: { land: { pitch: 24 }, port: { pitch: 26 } },
  build(st, ctx) {
    const level = ctx.colour ?? .55;
    const root = new THREE.Group();
    const R = rng(23);

    /* ---------- the page: an alley paved with worn slabs, a gutter, kerbs ---------- */
    const page = island(st, root, {
      outline: torn(0, 0, 13.5, 8.6, 31, 84), seed: 17, ppu: 26, blurFar: .2, blurNear: .84, blurPx: 4, paint: P => {
        const Rr = rng(9);
        P.layer(P.rect(-14, -9, 28, 7.6), mix(PAL.ground, PAL.groundDk, .3), { shadow: .4 });
        for (let r = 0; r < 9; r++) for (let c = 0; c < 18; c++) { const x = -13 + c * 1.5 + (r % 2) * .75, y = -.2 - r * 1.05 + 2; if (Rr() < .12) continue; P.layer(P.rect(x, y, 1.38, .94), mix(PAL.ground, PAL.groundLt, .25 + Rr() * .6), { shadow: .35, lip: .45 }); }
        P.layer(P.rect(-14, 1.7, 28, .5), shade(PAL.groundDk, .9), { shadow: .6 });     // kerb under the facades
        P.layer(P.poly(ribbon([[-14, -5.4], [0, -5.2], [14, -5.5]], .35)), '#2E2A42', { shadow: .5 }); // gutter
        P.layer(P.poly(ellipse(1.2, -4, 1.8, .55, 18, .12, 3)), tone('#4A6FB0', .35), { shadow: .4 }); P.layer(P.poly(ellipse(1, -3.9, 1, .22, 14)), mix(tone('#4A6FB0', .35), PAL.cream, .3), { shadow: .2 });
        for (let i = 0; i < 26; i++) P.layer(P.poly(ellipse((Rr() - .5) * 24, -1 - Rr() * 6, .12 + Rr() * .15, .08, 8)), mix(PAL.groundDk, PAL.dark, .5), { shadow: .2, lip: 0 }); // stains
      }
    });
    const top = page.top;

    /* ---------- the guide light = the player, floating beside the shop ---------- */
    const G = guide(st, root, { x: 2.5, y: 3.3, z: 2.6, power: 15 });

    /* ---------- left and right shophouses (closed, grey) ---------- */
    const left = building(st, top, { x: -SW - .1, z: ZS, w: SW, h: SH - .6, roof: 'flat', cols: 3, rows: 2, base: mix(PAL.mid, PAL.dark, .15), seed: 600, order: 1, lit: 1, door: false, d: 2.4, ppu: 30 });
    const right = building(st, top, { x: SW + .1, z: ZS, yaw: 0, w: SW, h: SH + .4, roof: 'step', cols: 3, rows: 3, base: mix(PAL.mid, PAL.light, .25), seed: 610, order: 1.05, lit: 2, door: false, side: false, ppu: 30 });
    // shutters (closed) on the neighbours: printed slats on a card in front
    const shutter = (x, k) => { const out = [[-1.7, .3], [1.7, .3], [1.7, 2.7], [-1.7, 2.7]];
      const c = card(st, { outline: out, base: shade(PAL.mid, .9), ppu: 40, seed: 620 + k, paint: P => { for (let y = .45; y < 2.6; y += .22) P.layer(P.rect(-1.65, y, 3.3, .12), shade(PAL.mid, 1.06), { shadow: .3, lip: .5 }); P.layer(P.rect(-1.7, 2.5, 3.4, .2), PAL.dark, { shadow: .4 }); } });
      return stand(st, top, { x, z: ZS + .08, cards: [c], order: 1.2 + k * .01 }); };
    shutter(-SW - .1, 0); shutter(SW + .1, 1);

    /* ---------- the middle shop: facade with an opening, interior box, iron door, faded sign ---------- */
    const facadeOut = [[-SW / 2, 0], [SW / 2, 0], [SW / 2, SH * .9], [SW * .3, SH * .9], [SW * .3, SH], [-SW * .3, SH], [-SW * .3, SH * .9], [-SW / 2, SH * .9]];
    const hole = [[OPEN.x0, OPEN.y0], [OPEN.x1, OPEN.y0], [OPEN.x1, OPEN.y1], [OPEN.x0, OPEN.y1]];
    const fbase = mix(tone('#B08A62', .5), PAL.light, .35);
    const facade = (lit, col) => P => {
      P.layer(P.rect(-SW / 2, SH * .9 - .35, SW, .35), shade(fbase, .82), { shadow: .6 });
      P.layer(P.rect(-SW / 2, 0, SW, .3), shade(fbase, .78), { shadow: .4 });
      P.layer(P.rect(OPEN.x0 - .2, OPEN.y0, .2, OPEN.y1 - OPEN.y0 + .2), shade(fbase, .8), { shadow: .4 });
      P.layer(P.rect(OPEN.x1, OPEN.y0, .2, OPEN.y1 - OPEN.y0 + .2), shade(fbase, .8), { shadow: .4 });
      [[-1.6, 4.4], [.5, 4.4]].forEach(([x, y], i) => {        // two tall shutters-windows upstairs
        P.layer(P.rect(x - .1, y - .1, 1.3, 1.6), shade(fbase, .72), { shadow: .4, lip: .6 });
        P.layer(P.rect(x, y, 1.1, 1.4), lit ? mix(PAL.winLit, col, .25) : PAL.win, { shadow: .5, lip: lit ? .2 : .6 });
        if (lit) P.glowDot(x + .55, y + .7, 1.2, mix(PAL.winLit, col, .25), .4);
        P.layer(P.rect(x + .52, y, .06, 1.4), shade(fbase, .72), { shadow: 0, lip: 0 });
      });
      for (let i = 0; i < 6; i++) P.layer(P.rect(-SW / 2 + .2 + i * .8, SH * .9 - .7, .5, .18), shade(fbase, .88), { shadow: .3, lip: .4 }); // frieze
      // weathering: peeled patches
      const Rr = rng(4); for (let i = 0; i < 6; i++) P.layer(P.poly(ellipse(-2 + Rr() * 4, 3.3 + Rr() * 3.3, .3 + Rr() * .3, .2, 9, .12, i)), shade(fbase, .9), { shadow: .2, lip: .3 });
    };
    const fc = card(st, { outline: facadeOut, holes: [hole], base: fbase, ppu: 40, seed: 630, paint: facade(false) });
    // interior: back wall with shelves + two side walls + floor, lit by its own small lamp
    const inner = (lit, col) => P => {
      for (let s = 0; s < 3; s++) {
        P.layer(P.rect(-1.5, .9 + s * .7, 3, .1), PAL.dark, { shadow: .5 });
        for (let k = 0; k < 7; k++) { const c = lit ? [col, mix(col, PAL.cream, .5), PAL.cream, '#FFD166'][(k + s) % 4] : mix(PAL.mid, PAL.dark, (k % 3) * .25); P.layer(P.rect(-1.4 + k * .41, 1 + s * .7, .3, .35 + (k % 2) * .12), lit ? tone(c, .9) : c, { shadow: .4 }); }
      }
    };
    const ibase = shade(PAL.mid, .62);
    const back = card(st, { outline: [[-1.7, 0], [1.7, 0], [1.7, 3.1], [-1.7, 3.1]], base: ibase, ppu: 40, seed: 640, paint: inner(false, MAJ.DGD) });
    back.mesh.position.z = -1.5;
    const sideL = card(st, { outline: [[0, 0], [1.5, 0], [1.5, 3.1], [0, 3.1]], base: shade(ibase, .8), ppu: 20, seed: 641 }); sideL.mesh.rotation.y = Math.PI / 2; sideL.mesh.position.set(-1.68, 0, -.02);
    const sideR = card(st, { outline: [[0, 0], [1.5, 0], [1.5, 3.1], [0, 3.1]], base: shade(ibase, .8), ppu: 20, seed: 642 }); sideR.mesh.rotation.y = -Math.PI / 2; sideR.mesh.position.set(1.68, 0, -1.52);
    // iron door: slats on a card behind the facade; it slides up behind the wall above the opening
    const doorOut = [[-1.7, 0], [1.7, 0], [1.7, 2.9], [-1.7, 2.9]];
    const dc = card(st, { outline: doorOut, base: shade(PAL.mid, .95), ppu: 40, seed: 650, paint: P => { for (let y = .1; y < 2.85; y += .2) P.layer(P.rect(-1.68, y, 3.36, .11), shade(PAL.mid, 1.08), { shadow: .3, lip: .5 }); P.layer(P.rect(-1.7, 0, 3.4, .16), PAL.dark, { shadow: .4 }); P.layer(P.rect(-.3, .12, .6, .1), PAL.ink, { shadow: .2 }); } });
    const doorG = new THREE.Group(); doorG.position.set(0, OPEN.y0 + 1.25, -.12); doorG.add(dc.mesh);
    const shop = stand(st, top, { x: 0, z: ZS + .35, cards: [back, sideL, sideR, doorG, fc], shadowOutline: facadeOut, order: 1.1, shadow: { len: .5 } });
    const inLight = new THREE.PointLight('#FFD9A0', 0, 7, 1); inLight.position.set(0, 1.8, -.6); shop.group.add(inLight);
    const doorY = new Spring(OPEN.y0 + 1.25, 3.2, .9);
    // faded sign: a blank board on its own hinge (top edge), DGD swings it away
    const signOut = [[-2.1, 0], [2.1, 0], [2.1, .95], [-2.1, .95]];
    const oldSign = card(st, { outline: signOut, base: shade(tone('#8A6A4A', .4), .9), ppu: 44, seed: 660, paint: P => { P.layer(P.rect(-1.9, .12, 3.8, .7), mix(PAL.cream, PAL.mid, .45), { shadow: .5 }); const Rr = rng(6); for (let i = 0; i < 5; i++) P.layer(P.rect(-1.6 + Rr() * 3, .25 + Rr() * .4, .4 + Rr() * .4, .08), mix(PAL.mid, PAL.light, .7), { shadow: .1, lip: .2 }); } });
    oldSign.mesh.position.y = -.95;
    const signPiv = new THREE.Group(); signPiv.position.set(0, OPEN.y1 + 1.2, .14); signPiv.add(oldSign.mesh); shop.group.add(signPiv);
    const signRot = new Spring(0, 6, .6);

    /* ---------- awning + sleeping cat on the left shop; wires and unlit lanterns overhead ---------- */
    const awn = card(st, { outline: [[-2.2, -1.3], [2.2, -1.3], [2.2, 0], [-2.2, 0]], base: mix(PAL.mid, PAL.light, .35), ppu: 40, seed: 670, paint: P => { for (let i = 0; i < 6; i++) P.layer(P.rect(-2.2 + i * .74, -1.3, .37, 1.3), shade(PAL.mid, .95), { shadow: .3 }); for (let i = 0; i < 12; i++) P.layer(P.poly(ellipse(-2.02 + i * .37, -1.3, .18, .14, 10)), shade(PAL.mid, i % 2 ? .95 : 1.1), { shadow: .3 }); } });
    const awnG = new THREE.Group(); awnG.position.set(0, 3.7, .02); awn.mesh.rotation.x = -1.05; awnG.add(awn.mesh); left.group.add(awnG);
    const catOut = [[-.55, 0], [.5, 0], [.62, .18], [.58, .38], [.66, .58], [.5, .5], [.36, .58], [.32, .38], [.1, .42], [-.3, .36], [-.55, .2]];
    const catPaint = (awake, col) => P => { P.layer(P.poly(ribbon([[-.55, .08], [-.75, .1], [-.8, .3]], .12)), shade(PAL.dark, 1.1), { shadow: .3 }); P.layer(P.poly(ellipse(-.1, .18, .35, .14, 12)), awake ? tone(col, .8) : mix(PAL.mid, PAL.light, .3), { shadow: .3 }); if (awake) { P.layer(P.circle(.42, .4, .04), PAL.ink); P.layer(P.circle(.54, .4, .04), PAL.ink); } else P.layer(P.poly(ribbon([[.39, .4], [.47, .37], [.56, .4]], .04)), PAL.ink); };
    const cat = card(st, { outline: catOut, base: PAL.dark, ppu: 80, seed: 680, paint: catPaint(false) });
    const catG = new THREE.Group(); catG.position.set(-.8, 3.38, .55); catG.add(cat.mesh); left.group.add(catG);
    const catHop = new Spring(0, 9, .4);
    const wires = [[[-7.4, 6.4, ZS + 1.6], [7.4, 6.7, ZS + 1.8], 1], [[-7.4, 5.6, ZS + 2.6], [7.4, 5.4, ZS + 2.4], .7]];
    const lanterns = [];
    wires.forEach(([a, b, sag], wi) => {
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, a[2] + (b[2] - a[2]) * t)); }
      top.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .025, 4), st.flatMat(PAL.ink)));
      if (wi === 0) for (let k = 1; k <= 6; k++) { const t = k / 7, p = new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag - .45, a[2] + (b[2] - a[2]) * t);
        const lo = ellipse(0, 0, .28, .36, 14);
        const c = card(st, { outline: lo, base: mix(PAL.mid, PAL.light, .3), ppu: 60, th: .04, seed: 690 + k, paint: P => { P.layer(P.rect(-.28, .22, .56, .08), PAL.dark, { shadow: .3 }); P.layer(P.rect(-.28, -.3, .56, .08), PAL.dark, { shadow: .3 }); } });
        c.mesh.position.copy(p); top.add(c.mesh); lanterns.push(c); const ph = k; st.onUpdate(tt => { if (!st.reduce) c.mesh.rotation.z = Math.sin(tt * 1.1 + ph) * .06; }); }
    });

    /* ---------- the owner, foreground clutter ---------- */
    const owner = person(st, top, { x: -2.2, z: .4, yaw: .25, h: 2.35, colour: '#C9A86A', level: .2, seed: 700, kind: 2, order: 3 });
    const cane = card(st, { outline: [[-.05, 0], [.05, 0], [.05, 1.4], [.22, 1.55], [.18, 1.62], [-.05, 1.45]], base: PAL.dark, ppu: 60, seed: 701 }); cane.mesh.position.set(.62, 0, .05); owner.group.add(cane.mesh);
    const crate = (x, z, k, s = 1) => { const out = [[-.6 * s, 0], [.6 * s, 0], [.6 * s, .8 * s], [-.6 * s, .8 * s]];
      stand(st, top, { x, z, yaw: (k % 3 - 1) * .25, cards: [card(st, { outline: out, base: mix(PAL.mid, PAL.light, .3), ppu: 44, seed: 710 + k, key: 'crate' + s, paint: P => { P.layer(P.rect(-.55 * s, .1 * s, 1.1 * s, .12 * s), shade(PAL.mid, .85), { shadow: .3 }); P.layer(P.rect(-.55 * s, .55 * s, 1.1 * s, .12 * s), shade(PAL.mid, .85), { shadow: .3 }); } })], shadowOutline: out, order: 3.2 + k * .02, shadow: { len: .5 } }); };
    crate(-6.6, .2, 0); crate(-6.1, .9, 1, .8); crate(6.8, .6, 2); crate(7.4, 1.2, 3, .7);
    const pot = (x, z, k) => { const out = [[-.35, 0], [.35, 0], [.42, .5], [-.42, .5]], leaf = [[-.6, .45], [-.2, 1.3], [0, .9], [.25, 1.5], [.6, .5]];
      stand(st, top, { x, z, cards: [card(st, { outline: [...out.slice(0, 3), ...leaf.slice().reverse().map(([a, b]) => [a * .9, b]), out[3]], base: mix(PAL.mid, PAL.light, .2), ppu: 50, seed: 720 + k, key: 'pot', paint: P => P.layer(P.poly(leaf), tone('#6FA36B', .4), { shadow: .4 }) })], shadowOutline: out, order: 3.3, shadow: { len: .4, blob: false } }); };
    pot(2.3, -.9, 0); pot(-4.1, -.9, 1); pot(4.4, -1, 2);
    const bench = [[-1.1, 0], [-.95, 0], [-.95, .45], [.95, .45], [.95, 0], [1.1, 0], [1.1, .6], [1.05, 1.1], [-1.05, 1.1], [-1.1, .6]];
    stand(st, top, { x: 4.6, z: 3.2, yaw: -.15, cards: [card(st, { outline: bench, base: mix(PAL.mid, PAL.dark, .2), ppu: 50, seed: 724, paint: P => { P.layer(P.rect(-1, .62, 2, .14), shade(PAL.mid, 1.1), { shadow: .3 }); P.layer(P.rect(-1, .86, 2, .14), shade(PAL.mid, 1.1), { shadow: .3 }); } })], shadowOutline: bench, order: 3.4, shadow: { len: .5 } });
    const bike = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 2; bike.push([-.75 + Math.cos(a) * .5, .5 + Math.sin(a) * .5]); }
    const wheel = (cx) => { const o = []; for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 2; o.push([cx + Math.cos(a) * .5, .5 + Math.sin(a) * .5]); } return o; };
    const frame = [[-.75, .45], [-.2, 1.05], [.55, 1.05], [.8, .45], [.68, .42], [.48, .9], [-.12, .9], [-.6, .4]];
    [wheel(-.75), wheel(.8), frame].forEach((o, k) => { const c = card(st, { outline: o, holes: k < 2 ? [o.map(([a, b]) => [(a - (k ? .8 : -.75)) * .75 + (k ? .8 : -.75), (b - .5) * .75 + .5])] : null, base: PAL.dark, ppu: 50, seed: 725 + k }); c.mesh.position.z = k * .03; bike.push(c); });
    stand(st, top, { x: -4.8, z: 3, yaw: .25, cards: bike.slice(17), shadowOutline: [[-1.25, 0], [1.3, 0], [1.3, 1.05], [-1.25, 1.05]], order: 3.4, shadow: { len: .4, blob: false } });
    lampPost(st, top, { x: -8.6, z: -.2, h: 3.6, seed: 730, order: 2.9 });
    lampPost(st, top, { x: 8.6, z: -.2, h: 3.6, seed: 731, order: 2.9 });

    /* ---------- landscape side pages: the alley continues, more closed shops that light up when the shop opens ---------- */
    const wingShops = [];
    if (st.orient === 'land') {
      const keep = st.lightPos.clone(); st.lightPos.set(0, 5, 3);
      [[-18.6, 43], [18.6, 47]].forEach(([x, seed], k) => {
        const sp = sidePage(st, root, { x, y: -5.4, z: 8.4, rx: 6.2, rz: 4.8, seed, lamp: 5, paint: P => {
          const Rr = rng(seed); P.layer(P.rect(-8, -6, 16, 7), mix(PAL.ground, PAL.groundDk, .3), { shadow: .4 });
          for (let i = 0; i < 70; i++) P.layer(P.rect((Rr() - .5) * 13, -5 + Rr() * 6, .9, .6), mix(PAL.ground, PAL.groundLt, .3 + Rr() * .5), { shadow: .3, lip: .4 }); } });
        [[-2.8, 5.6, 'gable'], [2.4, 6.2, 'flat']].forEach(([bx, h, roof], j) => { const b = building(st, sp.top, { x: bx, z: -2.4, w: 4.4, h, roof, cols: 2, rows: 2, base: mix(PAL.light, PAL.mid, .45 + j * .1), seed: 740 + k * 4 + j, order: 4 + j * .05, lit: 0, awning: shade(PAL.mid, .9), ppu: 26 }); wingShops.push(b); });
        lampPost(st, sp.top, { x: k ? 4.6 : -4.6, z: 1.4, h: 3, seed: 750 + k, order: 4.4 });
        const p = person(st, sp.top, { x: k ? -1.8 : 1.6, z: 1.6, yaw: k ? .3 : -.3, h: 2.3, colour: MAJ.DEN, level: .15, seed: 760 + k, kind: k + 1, order: 4.5 }); p.wing = true; wingShops.push(p);
      });
      st.lightPos.copy(keep);
    }

    const life = motes(st, top, { n: 18, box: [[-9, 1, -2], [9, 6, 4]], colours: [PAL.cream, mix(PAL.cream, PAL.light, .5)], size: .13, seed: 25 });

    /* ---------- reaction ---------- */
    let pieces = [], timers = [], extras = [], tiles = [], spots = [], newSign = null;
    const at = (d, fn) => timers.push({ t: st.time + d, fn });
    const track = p => { pieces.push(p); return p; };
    function clearAll() {
      pieces.forEach(p => removePiece(st, p)); pieces = []; timers = []; tiles = []; spots = [];
      extras.forEach(e => e.parent && e.parent.remove(e)); extras = [];
      newSign = null; signRot.snap(0); signPiv.rotation.x = 0;
      doorY.snap(OPEN.y0 + 1.25); doorY.target = OPEN.y0 + 1.25; inLight.intensity = 0; inLight.k = 0;
      fc.reprint(facade(false)); back.reprint(inner(false, MAJ.DGD));
      owner.recolour('#C9A86A', .2, 0); cat.reprint(catPaint(false)); lanterns.forEach(c => c.reprint(P => { P.layer(P.rect(-.28, .22, .56, .08), PAL.dark, { shadow: .3 }); P.layer(P.rect(-.28, -.3, .56, .08), PAL.dark, { shadow: .3 }); }, mix(PAL.mid, PAL.light, .3)));
      wingShops.forEach(b => b.setLit ? b.setLit(0) : b.recolour(MAJ.DEN, .15, 0));
    }
    const mural = (w, h, seed, m) => P => { const Rr = rng(seed), cols = [MAJ[m], '#FFD166', '#4BE3C1', MAJ.DEN, PAL.cream];
      P.layer(P.rect(-w / 2 + .1, .1, w - .2, h - .2), mix(PAL.cream, MAJ[m], .15), { shadow: .4 });
      for (let k = 0; k < 9; k++) P.layer(P.poly(ellipse(-w / 2 + .4 + Rr() * (w - .8), .4 + Rr() * (h - .8), .25 + Rr() * .45, .2 + Rr() * .35, 12, .15, k)), cols[k % 5], { shadow: .4 });
      P.layer(P.poly(ribbon(quad([-w / 2 + .3, .5], [0, h - .2], [w / 2 - .3, .6], 10), .16)), shade(MAJ[m], .7), { shadow: .3 }); };
    function react(m) {
      clearAll();
      doorY.target = OPEN.y1 + 2.2; inLight.k = 1;
      at(.5, () => { fc.reprint(facade(true, MAJ[m])); back.reprint(inner(true, MAJ[m])); });
      G.flyTo(1.2, 3.4, .6); G.flash(MAJ[m]);
      let tEnd = 1.6;
      if (m === 'DGA') {                 // paintings unfold flat across the walls, one after another
        const spots = [[left, -1.2, 3.6, 2.2, 1.6], [left, 1.2, 4.6, 1.6, 1.4], [right, -1, 3.8, 1.8, 2.2], [right, 1.3, 5.6, 1.6, 1.3], [shop, -1.6, 5.6, 1.3, .9], [shop, 1.6, 5.6, 1.3, .9]];
        spots.forEach(([b, x, y, w, h], k) => {
          const c = card(st, { outline: [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], base: PAL.cream, ppu: 50, seed: 800 + k, paint: mural(w, h, 800 + k, m) });
          const g = new THREE.Group(); g.position.set(x - w / 2, y - h / 2, .16); c.mesh.position.x = w / 2; g.add(c.mesh); g.rotation.y = Math.PI / 2; b.group.add(g); extras.push(g);
          const s = new Spring(Math.PI / 2, 8, .5); at(.8 + k * .22, () => s.target = 0); st.onUpdate((t, dt) => { if (!g.parent) return; if (st.reduce) s.snap(s.target); else s.step(dt); g.rotation.y = s.x; });
        });
        tEnd = 2.3;
      } else if (m === 'DGD') {          // the old sign swings up and away, a new sign with a logo folds down
        signRot.target = -1.5;
        const ns = card(st, { outline: signOut, base: tone(MAJ.DGD, 1), ppu: 50, seed: 820, emit: .25, paint: P => { P.layer(P.rect(-1.95, .1, 3.9, .75), mix(MAJ.DGD, PAL.ink, .35), { shadow: .4 }); P.layer(P.circle(-1.35, .47, .3), PAL.cream, { shadow: .4 }); symbolFor('DGD')(P, -1.35, .47, .2, MAJ.DGD); for (let i = 0; i < 3; i++) P.layer(P.rect(-.8 + i * .9, .35, .7, .24), mix(MAJ.DGD, PAL.cream, .7), { shadow: .3 }); } });
        ns.mesh.position.y = -.95; const piv = new THREE.Group(); piv.position.set(0, OPEN.y1 + 1.2, .22); piv.add(ns.mesh); piv.rotation.x = -Math.PI / 2; shop.group.add(piv); extras.push(piv);
        const s = new Spring(-Math.PI / 2, 9, .45); at(.9, () => s.target = 0); st.onUpdate((t, dt) => { if (!piv.parent) return; if (st.reduce) s.snap(s.target); else s.step(dt); piv.rotation.x = s.x; });
        [[-SW - .1, .6], [SW + .1, .6]].forEach(([x, z], k) => { const sp = signPost(st, top, { x: x + (k ? -1.6 : 1.6), z, shape: k ? 'circle' : 'shield', w: 1.1, hBoard: 1, post: 1.6, colour: MAJ.DGD, level: 1, symbol: symbolFor('DGD'), seed: 830 + k, order: 6 }); if (st.reduce) sp.hinge.snap(1); else sp.hinge.open(1.3 + k * .2); track(sp); });
        tEnd = 1.8;
      } else if (m === 'IGD') {          // the pavement turns into game tiles, lighting up one by one toward the shop
        const path = []; for (let i = 0; i < 6; i++) path.push([-6 + i * 1.1, 2.6 - i * .28]); for (let i = 0; i < 6; i++) path.push([.6 + i * 1.1, 1.2 - (i % 2) * .5]);
        path.sort((a, b) => Math.hypot(a[0], a[1] - 0) - Math.hypot(b[0], b[1] - 0)).reverse();
        path.forEach(([x, z], k) => {
          const col = [MAJ.IGD, '#FFD166', MAJ.DEN, MAJ.DGA][k % 4];
          const c = card(st, { outline: [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]], base: tone(col, 1), ppu: 50, th: .08, seed: 840 + k, unlit: true, paint: P => { P.layer(P.rect(-.38, -.38, .76, .76), mix(col, PAL.cream, .35), { shadow: .3 }); if (k % 3 === 0) symbolFor('IGD')(P, 0, 0, .22, shade(col, .6)); } });
          const g = new THREE.Group(); c.mesh.rotation.x = -Math.PI / 2; g.add(c.mesh); g.position.set(x, -.2, z); g.visible = false; top.add(g); extras.push(g);
          const s = new Spring(-.2, 10, .4); at(.8 + k * .12, () => { g.visible = true; s.target = .05; }); st.onUpdate((t, dt) => { if (!g.parent) return; if (st.reduce) s.snap(s.target); else s.step(dt); g.position.y = s.x; });
        });
        tEnd = .8 + path.length * .12 + .2;
      } else if (m === 'AFX') {          // two spotlights and a paper camera on a tripod turn to face the shop
        [[-6.2, 2.4, 1], [6.4, 2.6, -1]].forEach(([x, z, s], k) => {
          const pole = card(st, { outline: [[-.08, 0], [.08, 0], [.08, 2.2], [-.08, 2.2]], base: PAL.dark, ppu: 40, seed: 850 + k });
          const head = card(st, { outline: [[-.45, 1.9], [.45, 1.9], [.6, 2.7], [-.6, 2.7]], base: PAL.dark, ppu: 50, seed: 852 + k, paint: P => P.layer(P.poly(ellipse(0, 2.3, .35, .3, 14)), tone(MAJ.AFX, 1), { shadow: .3 }) });
          head.mesh.position.z = .05;
          const sp = stand(st, top, { x, z, yaw: s * 1.4, cards: [pole, head], shadowOutline: [[-.3, 0], [.3, 0], [.3, 2.7], [-.3, 2.7]], order: 6 });
          if (st.reduce) sp.hinge.snap(1); else sp.hinge.open(.3 + k * .15); track(sp);
          const bm = beam(st, sp.group, { x: 0, y: 2.3, z: 0, h: 9, w: .8, w2: 2.6, colour: MAJ.AFX, opacity: 0, tilt: 0 }); bm.group.rotation.x = -Math.PI / 2 + .25;
          const yaw = new Spring(s * 1.4, 4, .7), tgt = Math.atan2(x, z - (ZS + .5));
          at(1 + k * .2, () => { yaw.target = tgt; bm.on = true; });
          st.onUpdate((t, dt) => { if (!sp.base.parent) return; if (st.reduce) yaw.snap(yaw.target); else yaw.step(dt); sp.base.rotation.y = yaw.x; bm.mat.opacity += ((bm.on ? .35 : 0) - bm.mat.opacity) * Math.min(1, dt * 3); });
        });
        const tri = card(st, { outline: [[-.6, 0], [-.45, 0], [0, 1.3], [.45, 0], [.6, 0], [.08, 1.5], [-.08, 1.5]], base: PAL.dark, ppu: 50, seed: 860 });
        const cam = card(st, { outline: [[-.6, 1.4], [.5, 1.4], [.5, 1.7], [.85, 1.55], [.85, 2.05], [.5, 1.9], [.5, 2.2], [-.6, 2.2]], base: mix(PAL.dark, PAL.mid, .4), ppu: 60, seed: 861, paint: P => { P.layer(P.circle(-.3, 2.5, .32), PAL.dark, { shadow: .4 }); P.layer(P.circle(.2, 2.5, .32), PAL.dark, { shadow: .4 }); P.layer(P.rect(-.5, 1.55, .9, .1), tone(MAJ.AFX, 1), { shadow: .3 }); } });
        const reels = card(st, { outline: [...ellipse(-.3, 2.5, .34, .34, 14)], base: PAL.dark, ppu: 50, seed: 862, paint: P => P.layer(P.circle(-.3, 2.5, .12), tone(MAJ.AFX, 1)) });
        const reels2 = card(st, { outline: [...ellipse(.2, 2.5, .34, .34, 14)], base: PAL.dark, ppu: 50, seed: 863, paint: P => P.layer(P.circle(.2, 2.5, .12), tone(MAJ.AFX, 1)) });
        cam.mesh.position.z = .04; reels.mesh.position.z = .02; reels2.mesh.position.z = .02;
        const cs = stand(st, top, { x: -3.6, z: 2.6, yaw: -2.2, cards: [tri, cam, reels, reels2], shadowOutline: [[-.6, 0], [.6, 0], [.6, 2.2], [-.6, 2.2]], order: 6.2 });
        if (st.reduce) cs.hinge.snap(1); else cs.hinge.open(.5); track(cs);
        const cy = new Spring(-2.2, 4, .7); at(1.3, () => cy.target = -.35);
        st.onUpdate((t, dt) => { if (!cs.base.parent) return; if (st.reduce) cy.snap(cy.target); else cy.step(dt); cs.base.rotation.y = cy.x; });
        tEnd = 2;
      } else if (m === 'DEN') {          // people fill the alley, flags and festival lanterns light up
        const spots = [[-5.8, .9], [-4.6, 1.9], [-3.4, 1.1], [-1, 2.4], [.4, 1.6], [3.8, 2.2], [5, 1.2], [6.2, 2.1], [-6.6, 2.6], [2.4, 2.8]];
        spots.forEach(([x, z], k) => { const p = person(st, top, { x, z, yaw: Math.max(-.5, Math.min(.5, -x * .07)), h: 2.1 + (k % 3) * .3, colour: [MAJ.DEN, MAJ.DGA, '#FFD166', MAJ.IGD][k % 4], level: 1, seed: 870 + k, kind: k, order: 6, arms: k % 3 === 0 }); if (st.reduce) p.hinge.snap(1); else p.hinge.open(.6 + k * .09); track(p); });
        const b = bunting(st, top, { a: [-7.4, 6.2, ZS + 2.1], b: [7.4, 6.4, ZS + 2.3], sag: .8, n: 13, colours: ORDER.map(k => MAJ[k]), level: 1, seed: 880, order: 7 });
        b.flags.forEach((f, i) => { if (st.reduce) f.hinge.snap(1); else f.hinge.open(1 + i * .05); }); extras.push(b.group);
        at(1.2, () => lanterns.forEach((c, k) => at(k * .12, () => c.reprint(P => { P.layer(P.rect(-.28, .22, .56, .08), PAL.dark, { shadow: .3 }); P.layer(P.rect(-.28, -.3, .56, .08), PAL.dark, { shadow: .3 }); P.glowDot(0, 0, .5, PAL.cream, .5); }, mix(PAL.winLit, [MAJ.DEN, MAJ.DGA, '#FFD166'][k % 3], .4)))));
        tEnd = 2.2;
      }
      at(tEnd, () => {
        owner.recolour(MAJ[m], 1, .45); if (!st.reduce) owner.hinge.kick(1.6);
        cat.reprint(catPaint(true, MAJ[m])); catHop.x = 0; catHop.v = 3.2;
        wingShops.forEach((b, k) => at(k * .15, () => b.setLit ? b.setLit(4, mix(PAL.winLit, MAJ[m], .3)) : b.recolour(MAJ[m], 1, .45)));
        G.flash(MAJ[m]); life.setColours([MAJ[m], PAL.cream, mix(MAJ[m], PAL.cream, .5)]);
      });
    }
    st.onUpdate((t, dt) => {
      const due = timers.filter(x => t >= x.t); if (due.length) { timers = timers.filter(x => t < x.t); due.forEach(x => x.fn()); }
      if (st.reduce) { doorY.snap(doorY.target); signRot.snap(signRot.target); catHop.snap(0); } else { doorY.step(dt); signRot.step(dt); catHop.step(dt); }
      doorG.position.y = doorY.x; signPiv.rotation.x = signRot.x;
      catG.position.y = 3.38 + Math.max(0, catHop.x) * .5;
      inLight.k = inLight.k || 0; inLight.intensity += ((inLight.k ? 7 : 1.6) * st.openness - inLight.intensity) * Math.min(1, dt * 2.5);
    });

    return {
      root, react,
      frames: {
        focus: st.orient === 'land' ? { min: [-7.6, 0, -2.6], max: [7.6, 4.8, 3.2] } : { min: [-8, 0, -2.6], max: [8, 7.4, 3] },
        wide: st.orient === 'land' ? { min: [-24.8, -5.4, -9], max: [24.8, 7.4, 13.2] } : { min: [-13.5, 0, -8.6], max: [13.5, 7.4, 8.6] }
      },
      reset() { clearAll(); G.home(true); life.setColours([PAL.cream, mix(PAL.cream, PAL.light, .5)]); }
    };
  }
};
