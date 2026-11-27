/* ===== Scene 5.2 "สีกลับมาแล้ว" (SC[10]) — the last scene before the result =====
   The whole paper city from high up, the stage in the middle. Every building is a two-sided card:
   grey front, coloured back. A wave of colour spreads out from the stage; buildings flip from grey to colour
   one by one, near to far; the colours split by the player's scores (sectors, like a pie). Paper townspeople
   turn round to face the stage as the wave reaches them. The guide light floats over the stage, the brightest
   it has been. Pick: a beam of that major's colour shoots from the stage into the sky and every piece of paper
   hops once together. Colour level 1. */
import { THREE, PAL, MAJ, ORDER, tone, mix, shade, rng, card, stand, island, guide, ribbon, torn, ellipse, cloud, bbox,
  arch, building, person, lampPost, bunting, motes, beam, Spring, byScore, symbolFor, star } from '../shared.js';

const T0 = 1.7, SPEED = .16;              // wave starts at T0, reaches radius r at T0 + r*SPEED
const rad = d => d * Math.PI / 180;

export default {
  id: '5-2',
  cam: { land: { pitch: 47 }, port: { pitch: 50, fillFocus: [.98, .94] } },
  build(st, ctx) {
    const scores = ctx.scores || { DGD: 2, DGA: 2, AFX: 2, IGD: 2, DEN: 2 };
    const root = new THREE.Group();
    const R = rng(52);
    const sectorCol = a => { // angle (deg, 0 = back, clockwise) -> major, contiguous sectors sized by score
      const tot = ORDER.reduce((s, m) => s + (scores[m] || 0), 0) || 1; let acc = 0, u = (((a + 360) % 360) / 360);
      for (const m of ORDER) { acc += (scores[m] || 0) / tot; if (u <= acc + 1e-6) return m; } return ORDER[ORDER.length - 1];
    };
    const ISL = torn(0, 0, 21.5, 15.5, 23, 110);

    /* ---------- the city page: avenues from the stage + two ring roads ---------- */
    const roads = P => {
      for (let k = 0; k < 6; k++) { const a = rad(k * 60); P.layer(P.poly(ribbon([[Math.sin(a) * 3.6, Math.cos(a) * 3.6], [Math.sin(a) * 24, Math.cos(a) * 24]], 2.2)), PAL.groundDk, { shadow: .5 }); }
      [7.4, 15].forEach(r => { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; pts.push([Math.cos(a) * r, Math.sin(a) * r * .98]); } P.layer(P.poly(ribbon(pts, 1.9)), PAL.groundDk, { shadow: .5 }); });
      P.layer(P.circle(0, 0, 4.4), '#4E4A64', { shadow: .8 }); P.layer(P.circle(0, 0, 3.8), PAL.groundLt, { shadow: .5 });
    };
    const page = island(st, root, {
      outline: ISL, seed: 29, ppu: 22, blurFar: .2, blurNear: .9, blurPx: 3, paint: P => {
        const Rr = rng(5); for (let i = 0; i < 520; i++) { const x = (Rr() - .5) * 43, y = (Rr() - .5) * 31, w = .5 + Rr() * .6; P.layer(P.rect(x, y, w, w * .55), mix(PAL.ground, PAL.groundLt, .45 + Rr() * .55), { shadow: .3, lip: .45 }); }
        roads(P);
        for (let k = 0; k < 6; k++) { const a = rad(k * 60); for (let r = 5; r < 22; r += 1.4) P.layer(P.poly(ribbon([[Math.sin(a) * r, Math.cos(a) * r], [Math.sin(a) * (r + .6), Math.cos(a) * (r + .6)]], .14)), mix(PAL.cream, PAL.mid, .4), { shadow: .2, lip: .3 }); }
      }
    });
    const top = page.top;

    /* ---------- colour wash revealed by the wave (ink soaking into the page) ---------- */
    const bb = bbox(ISL), PW = bb.w, PH = bb.h, CW = 512, CH = Math.round(512 * PH / PW);
    const wc = document.createElement('canvas'); wc.width = CW; wc.height = CH; const wg = wc.getContext('2d');
    const WX = x => (x - bb.x0) / PW * CW, WY = y => (bb.y1 - y) / PH * CH;
    const islPath = new Path2D(); ISL.forEach(([x, y], i) => i ? islPath.lineTo(WX(x), WY(y)) : islPath.moveTo(WX(x), WY(y))); islPath.closePath();
    wg.save(); wg.clip(islPath);
    for (let a = 0; a < 360; a += 6) {  // pie of sector colours, soft
      const m = sectorCol(a), a0 = rad(a - 90 - 3.5), a1 = rad(a - 90 + 6 + 3.5);
      wg.fillStyle = mix(MAJ[m], PAL.ground, .35); wg.beginPath(); wg.moveTo(WX(0), WY(0)); wg.arc(WX(0), WY(0), CW, a0, a1); wg.closePath(); wg.fill();
    }
    wg.globalAlpha = .9; wg.fillStyle = mix(PAL.guide, PAL.cream, .4); wg.beginPath(); wg.arc(WX(0), WY(0), 4.2 / PW * CW, 0, 7); wg.fill();
    wg.restore();
    const mc = document.createElement('canvas'); mc.width = 256; mc.height = Math.round(256 * PH / PW); const mg = mc.getContext('2d');
    const washTex = new THREE.CanvasTexture(wc); washTex.colorSpace = THREE.SRGBColorSpace;
    const maskTex = new THREE.CanvasTexture(mc);
    const wash = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: washTex, alphaMap: maskTex, transparent: true, opacity: .55, depthWrite: false }));
    wash.position.set((bb.x0 + bb.x1) / 2, .018, -(bb.y0 + bb.y1) / 2); wash.renderOrder = 1; top.add(wash);
    let lastR = -1;
    const drawMask = r => {
      if (Math.abs(r - lastR) < .05) return; lastR = r;
      const k = mc.width / PW; mg.fillStyle = '#000'; mg.fillRect(0, 0, mc.width, mc.height);
      if (r > 0) { const cx = (0 - bb.x0) * k, cy = (bb.y1 - 0) * k, gr = mg.createRadialGradient(cx, cy, 0, cx, cy, r * k); gr.addColorStop(0, '#fff'); gr.addColorStop(Math.max(0, 1 - 2.2 / Math.max(r, 2.2)), '#fff'); gr.addColorStop(1, '#000'); mg.fillStyle = gr; mg.fillRect(0, 0, mc.width, mc.height); }
      maskTex.needsUpdate = true;
    };
    drawMask(0);

    /* ---------- the guide, brightest of the story, over the stage ---------- */
    const G = guide(st, root, { x: 0, y: 8.2, z: .8, size: 1.7, power: 22 });

    /* ---------- the stage: a drum (front skirt + top disc), steps, a striped arch, bunting ---------- */
    const stg = new THREE.Group(); top.add(stg);
    const skirt = [[-3.2, 0], [3.2, 0], [3.2, 1.2], [-3.2, 1.2]];
    const sk = card(st, { outline: skirt, base: PAL.dark, ppu: 44, seed: 501, paint: P => { for (let i = 0; i < 9; i++) P.layer(P.poly(ellipse(-2.85 + i * .71, 1.2, .36, .3, 12).filter(([, y]) => y <= 1.2)), MAJ[ORDER[i % 5]], { shadow: .5 }); P.layer(P.rect(-3.2, .1, 6.4, .2), shade(PAL.dark, .8), { shadow: .4 }); } });
    const topDisc = card(st, { outline: ellipse(0, 0, 3.2, 2.4, 32), base: mix(PAL.mid, PAL.dark, .3), ppu: 40, seed: 502, paint: P => { P.layer(P.poly(ellipse(0, 0, 2.6, 1.9, 32)), mix(PAL.mid, PAL.guide, .25), { shadow: .4 }); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; P.layer(P.circle(Math.cos(a) * 2.25, Math.sin(a) * 1.62, .16), MAJ[ORDER[i % 5]], { shadow: .3 }); } P.layer(P.poly(star(.9, .4)), mix(PAL.guide, PAL.mid, .2), { shadow: .4 }); } });
    topDisc.mesh.rotation.x = -Math.PI / 2; topDisc.mesh.position.set(0, 1.18, -2.3);
    sk.mesh.add(topDisc.mesh);
    stand(st, stg, { x: 0, z: 2.3, cards: [sk], shadowOutline: skirt, order: 2, shadow: { len: .3 } });
    const steps = [[-1, 0], [1, 0], [1, .4], [.8, .4], [.8, .8], [-.8, .8], [-.8, .4], [-1, .4]];
    stand(st, stg, { x: 0, z: 3.1, cards: [card(st, { outline: steps, base: PAL.mid, ppu: 50, seed: 503, paint: P => P.layer(P.rect(-1, .38, 2, .06), PAL.cream, { shadow: .2 }) })], order: 2.1 });
    const stripes = P => { ORDER.forEach((m, i) => P.layer(P.rect(-3.4 + i * 1.36, 5, 1.36, .55), MAJ[m], { shadow: .5 })); };
    const archOut = [[-3.6, 0], [3.6, 0], [3.6, 5.6], [0, 6.6], [-3.6, 5.6]];
    const hole = [[-2.6, 0], [2.6, 0], [2.6, 3.6]]; for (let i = 1; i < 12; i++) { const a = i / 12 * Math.PI; hole.push([Math.cos(a) * 2.6, 3.6 + Math.sin(a) * 1.2]); } hole.push([-2.6, 3.6]);
    const ac = card(st, { outline: archOut, holes: [hole], base: mix(PAL.light, PAL.mid, .55), ppu: 36, seed: 504, paint: P => { stripes(P); P.layer(P.circle(0, 5.85, .42), PAL.guide, { shadow: .5 }); } });
    stand(st, stg, { x: 0, z: -1.6, cards: [ac], shadowOutline: archOut, order: 1.8, shadow: { len: .35 } });
    const flagCols = byScore(scores, 10, 7);
    const bt1 = bunting(st, stg, { a: [-3.5, 5.4, -1.6], b: [-8.5, 3, 3.5], sag: .6, n: 6, colours: flagCols.slice(0, 5), level: 1, seed: 510, order: 6 });
    const bt2 = bunting(st, stg, { a: [3.5, 5.4, -1.6], b: [8.5, 3, 3.5], sag: .6, n: 6, colours: flagCols.slice(5), level: 1, seed: 520, order: 6 });
    [[-8.5, 3.5], [8.5, 3.5]].forEach(([x, z], k) => lampPost(st, stg, { x, z, h: 3, seed: 530 + k, order: 5.8 }));

    /* ---------- two-sided buildings in rings, flipping grey -> colour with the wave ---------- */
    const blds = [];
    const rings = [{ r: 10, per: 1, h: [3.2, 4.2], off: [0] }, { r: 13.4, per: 2, h: [4, 5.4], off: [-11, 11] }, { r: 17.4, per: 2, h: [4.8, 6.4], off: [-9, 9] }];
    rings.forEach((ring, ri) => {
      for (let k = 0; k < 6; k++) ring.off.forEach((o, oi) => {
        const a = k * 60 + 30 + o + (R() - .5) * 5, x = Math.sin(rad(a)) * ring.r, z = -Math.cos(rad(a)) * ring.r * .92;
        if (Math.abs(x) > 19.5 || Math.abs(z) > 14) return;
        const m = sectorCol(a), w = 3 + R() * 1.1, h = ring.h[0] + R() * (ring.h[1] - ring.h[0]);
        const b = building(st, top, { x, z, yaw: -x * .02, w, h, roof: ['flat', 'gable', 'step'][Math.floor(R() * 3)], cols: 2, rows: Math.max(2, Math.floor(h / 2)), lit: 1, side: false, back: { colour: MAJ[m] }, base: mix(PAL.light, PAL.mid, .5 + R() * .3), seed: 600 + blds.length, order: 3 + ri * .5 + k * .03, accent: MAJ[m], level: .15, ppu: 24, blur: z > 7 ? 1.8 : (ri === 2 || z < -10 ? 2.2 : 0) });
        b.m = m; b.r = Math.hypot(x, z); b.flip = new Spring(0, 9, .5); b.yaw0 = b.base.rotation.y; blds.push(b);
      });
    });

    /* ---------- townspeople along the streets: turn to face the stage when the wave reaches them ---------- */
    const folk = [];
    [[7.4, 15], [7.4, 75], [7.4, 140], [7.4, 205], [7.4, 260], [7.4, 320], [11.3, 40], [11.3, 110], [11.3, 175], [11.3, 240], [11.3, 300], [15.2, 20], [15.2, 95], [15.2, 160], [15.2, 270], [15.2, 335]].forEach(([r, a], k) => {
      const x = Math.sin(rad(a)) * r + (R() - .5), z = -Math.cos(rad(a)) * r * .95;
      if (Math.abs(x) > 19.5 || Math.abs(z) > 14) return;
      const yaw0 = (R() - .5) * 2.4 + (R() < .4 ? Math.PI : 0), m = sectorCol(a);
      const p = person(st, top, { x, z, yaw: yaw0, h: 2.7 + R() * .5, colour: MAJ[m], level: .2, seed: 700 + k, kind: k, order: 4 + k * .03, twoSided: true, arms: k % 4 === 0 });
      p.m = m; p.r = r; p.yaw0 = yaw0; p.yawT = Math.atan2(-x, -z); p.turn = new Spring(yaw0, 6, .6); p.turned = false;
      folk.push(p);
    });

    /* ---------- life: paper flakes taking the colours ---------- */
    const life = motes(st, top, { n: 34, box: [[-16, 2, -12], [16, 9, 10]], colours: [PAL.cream], size: .2, seed: 77 });

    /* ---------- the wave ---------- */
    let tw = 0;                                   // time since open (on the stage clock)
    const flipAll = (snapTo) => blds.forEach(b => { b.flip.snap(snapTo); b.base.rotation.y = b.yaw0 + Math.PI * snapTo; b.started = snapTo > 0; });
    st.onUpdate((t, dt) => {
      tw = t;
      const r = st.reduce ? (t > T0 ? 99 : 0) : Math.max(0, (t - T0) / SPEED);
      drawMask(Math.min(26, r));
      blds.forEach(b => {
        if (!b.started && r >= b.r) { b.started = true; b.flip.target = 1; }
        if (st.reduce) b.flip.snap(b.flip.target); else b.flip.step(dt);
        b.base.rotation.y = b.yaw0 + Math.PI * b.flip.x; if (b.shadow) b.shadow.rotation.y = -Math.PI * b.flip.x;
      });
      folk.forEach(p => {
        if (!p.turned && r >= p.r + 1.5) { p.turned = true; p.turn.target = p.yawT; p.recolour(MAJ[p.m], 1); }
        if (st.reduce) p.turn.snap(p.turn.target); else p.turn.step(dt);
        p.base.rotation.y = p.turn.x; if (p.shadow) p.shadow.rotation.y = p.yaw0 - p.turn.x;
      });
      if (r > 3 && !life.coloured) { life.coloured = true; life.setColours([...new Set(byScore(scores, 10, 3))].map(m => MAJ[m]).concat([PAL.cream])); }
      G.boost = 1 + Math.min(1, Math.max(0, (t - T0) / 2)) * .35;
    });

    /* ---------- reaction: a beam of the chosen colour from the stage + every piece hops once ---------- */
    let bm = null, bmo = new Spring(0, 5, .9);
    function react(m) {
      if (!bm) { bm = beam(st, top, { x: 0, y: 1.2, z: 0, h: 46, w: 2.6, w2: 7.5, colour: MAJ[m], opacity: 0 }); }
      bm.mat.color.set(MAJ[m]); bmo.snap(0); bmo.target = .75;
      if (!st.reduce) st.hinges.forEach(h => { if (!h.island) h.kick(1.6 + (h.order % 1) * .4); });
      G.flash(MAJ[m]);
      life.setColours([MAJ[m], mix(MAJ[m], PAL.cream, .5), PAL.cream]);
    }
    st.onUpdate((t, dt) => { if (bm) { if (st.reduce) bmo.snap(bmo.target); else bmo.step(dt); bm.mat.opacity = Math.max(0, bmo.x); bm.group.visible = bmo.x > .01; } });

    return {
      root, react,
      frames: {
        focus: st.orient === 'land' ? { min: [-6.5, 0, -4], max: [6.5, 9, 5] } : { min: [-9.5, 0, -9.5], max: [9.5, 8, 7.5] },
        wide: { min: [-21.5, 0, -15.5], max: [21.5, 6, 15.5] }
      },
      reset() {
        flipAll(0); lastR = -1; drawMask(0);
        folk.forEach(p => { p.turned = false; p.turn.snap(p.yaw0); p.base.rotation.y = p.yaw0; p.recolour(MAJ[p.m], .2); });
        life.coloured = false; life.setColours([PAL.cream]); if (bm) { bmo.snap(0); bm.mat.opacity = 0; bm.group.visible = false; }
        G.home(true);
      }
    };
  }
};
