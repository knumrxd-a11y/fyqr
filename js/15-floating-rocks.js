/* ===== small crystal rock shards floating in the backdrop =====
   Uses the same shard art as the intro (images/gal-shard-*.webp): pale columns with a glowing underside.
   Phone: they hang around the city towers. PC: they float in the dark space on both sides of the game card.
   Far shards are drawn behind the towers, near ones in front.
   - Motion: each shard drifts in a slow loop, bobs, sways and turns on its own rhythm.
   - Pick a choice: the scene rushes forward and the shards are blown outward from the centre,
     then spring back to their own spots.
   - Colour: the shards take on the colour of the sky behind them (grey at first, then the colour of
     the district you are in), so they always match the background. Shared as window.ROCKTINT.
   Tweak: COUNT = how many (phone / PC), SIZE = height as a fraction of screen height (min / max),
   DRIFT = how far they wander (px), BLOW = how far they fly on a pick (px). */
(function(){
const COUNT={phone:10,pc:16},SIZE=[.045,.1],DRIFT=[4,10],BLOW=[90,260],TRAVEL=[.05,.11];
const SRC=[1,2,3,4,5].map(i=>'images/gal-shard-'+i+'.webp'),IMG=SRC.map(s=>{const im=new Image();im.src=s;return im});
const MAX=Math.max(COUNT.phone,COUNT.pc);
const ROCKS=Array.from({length:MAX},(_,i)=>{const r=k=>hash(i+3,k,57);return{
  img:i%5,flip:r(1)<.5,u:r(2),v:r(3),side:i%2,sz:r(4),d:.12+r(5)*.88,ph:r(6)*6.283,sp:.3+r(7)*.35,amp:DRIFT[0]+r(8)*(DRIFT[1]-DRIFT[0]),tilt:(r(9)-.5)*.35,
  blow:BLOW[0]+r(10)*(BLOW[1]-BLOW[0]),spinDir:r(11)<.5?-1:1,ox:0,oy:0,vx:0,vy:0,rot:0,vr:0,
  /* travel: each shard keeps wandering across its whole area on two slow, unrelated waves, so it never settles in one spot */
  su:TRAVEL[0]+r(12)*(TRAVEL[1]-TRAVEL[0]),sv:TRAVEL[0]*.8+r(13)*(TRAVEL[1]-TRAVEL[0])*.8,pu:r(14)*6.283,pv:r(15)*6.283}});
const T0=performance.now();
function wander(o){const t=reduce?0:(performance.now()-T0)/1000,
  u=.5+.38*Math.sin(t*o.su+o.pu)+.12*Math.sin(t*o.su*2.3+o.pv),v=.5+.38*Math.sin(t*o.sv+o.pv)+.12*Math.sin(t*o.sv*1.9+o.pu);
  return[Math.min(1,Math.max(0,reduce?o.u:u)),Math.min(1,Math.max(0,reduce?o.v:v))]}
function place(o,W,H){
  const wide=W>=700,col=Math.min(460,W),[u,v]=wander(o);
  if(wide){const gap=col/2+30,edge=W/2-gap,x0=o.side?W/2+gap:W*.03;return[x0+u*(edge-W*.03),H*(.08+v*.78)]}
  /* phone: the whole width of the sky above the card */
  return[W*(.05+u*.9),H*(.06+v*.3)]}

/* ---- colour that follows the background ---- */
const TINT={c:[150,140,190],a:.25};window.ROCKTINT=TINT;
function tintTarget(){
  const base=bkc('#8a7cc8');                        /* the sky's lavender, grey at the start and richer as colour returns */
  let pi=-1;try{pi=placeNow()}catch(e){}
  if(pi<0)return{c:base,a:.22+Sb*.2};
  const dc=hx(PCOL[pi]),k=.25+Sb*.55;              /* lean toward the district colour as the city regains colour */
  return{c:base.map((v,i)=>v+(dc[i]-v)*k),a:.3+Sb*.25}}
window.rockTinted=i=>tinted(i);
let lastT=0;
function stepTint(dt){const tg=tintTarget(),e=1-Math.exp(-dt*2);TINT.c=TINT.c.map((v,i)=>v+(tg.c[i]-v)*e);TINT.a+=(tg.a-TINT.a)*e}
/* tinted copy of each shard image, refreshed only when the colour has moved */
const TC=IMG.map(()=>({cv:document.createElement('canvas'),key:''}));
function tinted(i){const im=IMG[i];if(!im.naturalWidth)return im;const t=TC[i],key=TINT.c.map(v=>Math.round(v/3)).join(',')+'|'+Math.round(TINT.a*30);
  if(t.key===key)return t.cv;t.key=key;const c=t.cv;c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');
  x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba('+TINT.c.map(Math.round).join(',')+','+TINT.a+')';x.fillRect(0,0,c.width,c.height);return c}

/* ---- blown outward when the scene rushes forward, then spring back ---- */
function physics(o,dt,W,H){
  const[x0,y0]=place(o,W,H),push=Math.min(1,M.boost*1.15+M.kick*.35),dx=x0-W/2,dy=y0-H*.4,len=Math.hypot(dx,dy)||1,
    k=reduce?0:push*o.blow*(.6+o.d*.6),tx=dx/len*k,ty=dy/len*k-push*18;
  o.vx+=((tx-o.ox)*14-o.vx*5.5)*dt;o.vy+=((ty-o.oy)*14-o.vy*5.5)*dt;o.ox+=o.vx*dt;o.oy+=o.vy*dt;
  o.vr+=((push*1.6*o.spinDir-o.rot)*10-o.vr*4.5)*dt;o.rot+=o.vr*dt}
function shard(c,o,sec,W,H){
  const im=IMG[o.img];if(!im.naturalWidth)return;
  const[x0,y0]=place(o,W,H),d=o.d,
    hh=Math.max(22,Math.min(130,H*(SIZE[0]+o.sz*(SIZE[1]-SIZE[0]))*(.7+d*.5))),ww=hh*im.naturalWidth/im.naturalHeight,
    /* a slow figure-eight drift plus a quicker bob */
    x=x0+(Math.sin(sec*o.sp*.5+o.ph)*o.amp+Math.sin(sec*o.sp*1.3+o.ph*2)*o.amp*.25)*BG-SCAM.x*W*(d-.4)*.5+o.ox,
    y=y0+(Math.sin(sec*o.sp+o.ph*1.4)*o.amp*.7+Math.sin(sec*o.sp*2.1+o.ph)*o.amp*.2)*BG-SCAM.y*H*(d-.4)*.3+o.oy;
  c.save();c.translate(x,y);c.rotate(o.tilt+(Math.sin(sec*o.sp*.8+o.ph)*.12+Math.sin(sec*.21+o.ph)*.08)*BG+o.rot);if(o.flip)c.scale(-1,1);
  const sc=1+Math.sin(sec*o.sp*1.1+o.ph)*.04*BG;c.scale(sc,sc);
  c.globalAlpha=.6+d*.4;c.drawImage(tinted(o.img),-ww/2,-hh/2,ww,hh);
  /* glowing underside, in the same colour */
  c.globalCompositeOperation='lighter';const gl=(.2+.1*Math.sin(sec*1.3+o.ph))*(1+Math.min(1,M.boost)*.8),gc=TINT.c.map(v=>Math.round(v*.5+245*.5)).join(','),
    gr=c.createRadialGradient(0,hh*.46,0,0,hh*.46,ww*1.1);
  gr.addColorStop(0,'rgba('+gc+','+gl+')');gr.addColorStop(1,'rgba('+gc+',0)');c.fillStyle=gr;c.fillRect(-ww*1.2,hh*.1,ww*2.4,hh*.8);
  c.restore();
}
/* scene 1.2 (pick an item): keep every shard clear of the five floating items and their zoomed view */
function itemZone(){
  if(!(S.stage==='scene'&&S.si===1)||typeof sc==='undefined')return null;
  if(SCN.zi>=0||SCN.zp>.05)return{x0:-1e4,x1:1e4,y0:-1e4,y1:1e4};   /* zoomed in on one item: no shards at all */
  const sr=sc.getBoundingClientRect(),cr=cv.getBoundingClientRect(),cx=sr.left-cr.left+SW/2,top=sr.top-cr.top+SY;
  return{x0:cx-95*SS,x1:cx+95*SS,y0:top-15*SS,y1:top+110*SS}}
function hits(z,o,W,H){if(!z)return false;const[x,y]=place(o,W,H),m=H*SIZE[1]*.7;return x>z.x0-m*.4&&x<z.x1+m*.4&&y>z.y0-m&&y<z.y1+m}
function layer(front,sec){
  const n=W>=700?COUNT.pc:COUNT.phone,dp=cv.width/W,z=itemZone();
  ctx.save();ctx.setTransform(dp,0,0,dp,0,0);
  for(let i=0;i<n;i++){const o=ROCKS[i];if((o.d>=(W>=700?.5:.3))===front&&!hits(z,o,W,H))shard(ctx,o,sec,W,H)}
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
const _cd=cityDraw;
cityDraw=function(sec){
  if(window.PAPER_ON){lastT=sec;return _cd.apply(this,arguments)}   // a paper scene (js/22) covers them: skip
  const dt=Math.min(.05,Math.max(0,sec-lastT));lastT=sec;stepTint(dt);
  const n=W>=700?COUNT.pc:COUNT.phone;for(let i=0;i<n;i++)physics(ROCKS[i],dt,W,H);
  layer(false,sec);
  _cd.apply(this,arguments);
  layer(true,sec);
};
})();
