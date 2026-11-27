/* ===== Alley kit (chapter 3) — the structure every alley shares =====
   An alley is the major's own district, in its colour. Four SPOTS stand in it, one per option of AL[m].o, in that
   order, left to right. Each spot carries a little floating paper tag with 1-4 dots (no text) so the four option
   buttons map onto the scene. The host character and the guide light (the player) stand at the front.
   Pick option i: the alley's own LEAD-IN runs (paint flowing, a projector beam, board squares, a spotlight...),
   then spot i folds down and back up in full colour and lights up; the other three dim. Then spot i PLAYS
   (its own little motion) and the guide settles beside it.
   On the site: doAct(m) only sends the major; read the chosen option from S.alleyPick (see SPEC.md 12).

   A scene file calls  alley({ m, seed, ... })  and returns its default export. */
import { THREE, PAL, MAJ, tone, mix, shade, rng, card, stand, island, guide, torn, ellipse, star, ribbon, quad,
  building, person, lampPost, bunting, motes, removePiece, dimGroup, sidePage, popRow } from '../shared.js';

export const L0 = .42;          // colour level of a spot before it is picked (the alley is in colour, the spots wait)

/** a floating paper tag with n dots, hung above a spot */
export function dotTag(st, parent, { x, y, z, n, colour }) {
  const w = .34 + n * .3, out = [[-w / 2, -.28], [w / 2, -.28], [w / 2, .28], [0, .42], [-w / 2, .28]];
  const paint = lv => P => { for (let k = 0; k < n; k++) P.layer(P.circle(-w / 2 + .32 + k * .3, 0, .1), lv >= 1 ? PAL.cream : tone(colour, Math.max(.6, lv)), { shadow: .3 }); };
  const c = card(st, { outline: out, base: mix(PAL.cream, colour, .22), ppu: 70, th: .04, seed: 1700 + n, paint: paint(L0) });
  const g = new THREE.Group(); g.position.set(x, y, z); g.add(c.mesh); parent.add(g);
  const ph = n * 1.7; st.onUpdate(t => { if (!st.reduce) { g.position.y = y + Math.sin(t * 1.2 + ph) * .08; c.mesh.rotation.y = Math.sin(t * .6 + ph) * .25; } });
  return { g, c, set(lv) { c.reprint(paint(lv), lv >= 1 ? tone(colour, 1) : mix(PAL.cream, colour, .22)); } };
}

/** the shared alley scene.
    cfg: { m, id, seed, cam, outline, pagePaint(P), guideAt:[x,y,z], dress(st, top, K), spots(st, top, K) -> [spot x4],
           lead(i, K) -> seconds before the spot activates, wing(st, top, side, K), frames(orient) }
    spot: { st: stand-like {base, hinge, group}, at:[x,y,z] (guide goes here), tagY, repaint(lv), play?(t, dt, u), reset?(), extra?: [groups] } */
export function alley(cfg) {
  const m = cfg.m, C = MAJ[m];
  return {
    id: cfg.id, cam: cfg.cam || { land: { pitch: 30 }, port: { pitch: 32 } },
    build(st, ctx) {
      const root = new THREE.Group();
      const K = { st, m, C, root, R: rng(cfg.seed), timers: [], pieces: [], extras: [], level: ctx.colour ?? .7 };
      K.at = (d, fn) => K.timers.push({ t: st.time + d, fn });
      K.tone = lv => tone(C, lv);
      const page = island(st, root, { outline: cfg.outline || torn(0, -.4, 15.5, 9.4, cfg.seed, 90), seed: cfg.seed, ppu: 24, blurFar: .2, blurNear: .86, blurPx: 4, paint: P => cfg.pagePaint(P, K) });
      K.top = page.top;
      K.G = guide(st, root, { x: cfg.guideAt[0], y: cfg.guideAt[1], z: cfg.guideAt[2], power: cfg.power ?? 16 });
      cfg.dress(st, K.top, K);
      K.spots = cfg.spots(st, K.top, K);
      K.spots.forEach((s, i) => { s.tag = dotTag(st, K.top, { x: s.at[0], y: s.tagY ?? s.at[1] + 1.6, z: s.at[2], n: i + 1, colour: C }); });
      // one warm-coloured light that goes to the picked spot
      K.spotLight = new THREE.PointLight(mix(PAL.guide, C, .35), 0, 9, 1); K.top.add(K.spotLight); K.spotLight.k = 0;
      // landscape: two side pages that continue the alley
      K.wings = [];
      if (st.orient === 'land') {
        const keep = st.lightPos.clone(); st.lightPos.set(0, 5, 3);
        [[-1, -18.6], [1, 18.6]].forEach(([side, x], k) => {
          const sp = sidePage(st, root, { x, y: -3.6, z: 7, rx: 6.2, rz: 4.8, seed: cfg.seed + 40 + k, lamp: 5, paint: P => { const Rr = rng(cfg.seed + 50 + k); for (let i = 0; i < 70; i++) P.layer(P.rect((Rr() - .5) * 13, (Rr() - .5) * 9, .8, .5), mix(PAL.ground, mix(PAL.groundLt, C, .12), .3 + Rr() * .6), { shadow: .3, lip: .4 }); (cfg.wingPaint || (() => {}))(P, side, K); } });
          sp.side = side; K.wings.push(sp);
          (cfg.wing || defaultWing)(st, sp.top, side, K);
        });
        st.lightPos.copy(keep);
      }
      K.life = motes(st, K.top, { n: 24, box: [[-12, 1.5, -7], [12, 7, 5]], colours: [mix(C, PAL.cream, .5), PAL.cream], size: .15, seed: cfg.seed + 9 });

      let picked = -1, playing = null;
      function setAll(i) {
        K.spots.forEach((s, k) => {
          const on = k === i;
          s.repaint(i < 0 ? L0 : on ? 1 : L0 * .7);
          [s.st.group, ...(s.extra || [])].forEach(g => dimGroup(g, i < 0 || on ? 1 : .6));
          s.tag.set(i < 0 ? L0 : on ? 1 : L0 * .6);
        });
      }
      function clear() {
        K.pieces.forEach(p => removePiece(st, p)); K.pieces = []; K.timers = [];
        K.extras.forEach(e => e.parent && e.parent.remove(e)); K.extras = [];
        K.spots.forEach(s => s.reset && s.reset());
        picked = -1; playing = null; K.spotLight.k = 0; setAll(-1);
        K.wings.forEach(w => { w.boost = 1; if (w.lamp) w.lamp.color.set(PAL.guide); });
        cfg.clear && cfg.clear(K);
      }
      function react(mm, i = 0) {
        clear(); picked = i; const s = K.spots[i];
        const d = cfg.lead ? cfg.lead(i, K) : .2;
        K.G.flash(C);
        K.at(d, () => {
          setAll(i);
          if (!st.reduce) { s.st.hinge.close(0); K.at(.32, () => s.st.hinge.open(0)); }
          K.spotLight.position.set(s.at[0], s.at[1] + 1.6, s.at[2] + 1.4); K.spotLight.k = 1;
          K.G.flyTo(s.at[0] + (s.guideDx ?? 1.2), s.at[1] + 1.4, s.at[2] + 1.2);
          playing = { s, t0: st.time + .45 };
          K.wings.forEach(w => { w.boost = 1.8; if (w.lamp) w.lamp.color.set(mix(PAL.guide, C, .35)); });
          K.life.setColours([C, mix(C, PAL.cream, .5), PAL.cream]);
          cfg.after && cfg.after(i, K);
        });
      }
      st.onUpdate((t, dt) => {
        const due = K.timers.filter(x => t >= x.t); if (due.length) { K.timers = K.timers.filter(x => t < x.t); due.forEach(x => x.fn()); }
        K.spotLight.intensity += ((K.spotLight.k ? 9 : 0) * st.openness - K.spotLight.intensity) * Math.min(1, dt * 3);
        if (playing && t >= playing.t0 && playing.s.play) playing.s.play(t, dt, t - playing.t0);
      });
      return {
        root, react,
        frames: cfg.frames(st.orient),
        reset() { clear(); K.G.home(true); K.life.setColours([mix(C, PAL.cream, .5), PAL.cream]); }
      };
    }
  };
}

/** default wing: two small shophouses with awnings in the major's colour, a lamp, two passers-by */
export function defaultWing(st, top, side, K) {
  [[-2.6, 5.4, 'gable'], [2.2, 6, 'flat']].forEach(([x, h, roof], j) => building(st, top, { x: x * -side, z: -2.4, w: 4, h, roof, cols: 2, rows: 2, base: mix(PAL.light, K.C, .18), accent: K.C, level: .7, awning: K.tone(.7), seed: K.R() * 1e4 | 0, order: 4 + j * .05, lit: 2, ppu: 24 }));
  lampPost(st, top, { x: side * 4.8, z: 1.4, h: 3, seed: 1790 + side, order: 4.4, colour: K.C });
  [[-1.2, 1.6], [1.6, 2]].forEach(([x, z], j) => person(st, top, { x: x * -side, z, yaw: side * .3, h: 2.3 + j * .2, colour: K.C, level: .8, seed: 1795 + j + side, kind: j + 1, order: 4.6 }));
}

/** helpers used by several alleys */
export const glassCase = (st, parent, { x, z, w = 2.6, h = 2, d = 1.2, order = 3, tint = PAL.light }) => {
  const frame = card(st, { outline: [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], holes: [[[-w / 2 + .14, .5], [w / 2 - .14, .5], [w / 2 - .14, h - .14], [-w / 2 + .14, h - .14]]], base: shade(tint, .7), ppu: 44, seed: 1800 });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - .28, h - .64), new THREE.MeshBasicMaterial({ color: mix(PAL.cream, '#BFE3FF', .5), transparent: true, opacity: .14, depthWrite: false }));
  glass.position.set(0, (h + .36) / 2, .05); glass.renderOrder = 4;
  return { frame, glass };
};
