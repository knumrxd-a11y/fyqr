/* ===== crystal shards floating over the edges of the text box, on every page =====
   A see-through canvas above the card. Shards sit on the left and right borders of #screen
   and may only reach into the card's side padding, so they never cover any text or button.
   They keep travelling up and down along the edge, drift outward and back, and on a pick they are
   blown away from the card (outward only, never over the text) and spring back. Colour follows the background.
   Drawn on two narrow canvases, one strip on each side of the card (with room for the blow and the glow), at the
   same pixel grid as a full-screen canvas: the same pixels as one canvas over the whole screen, a fraction of the work.
   Tweak: PER = px of card height per shard on each side, HT = shard height range in px,
   TRAVEL = speed along the edge, BLOW = how far they fly out on a pick (px). */
(function(){
const PER=220,HT=[44,74],MAXSIDE=4,TRAVEL=[.07,.15],BLOW=[50,130];
const STRIP=[0,1].map(i=>{const c=document.createElement('canvas');c.id=i?'edgerocks2':'edgerocks';c.setAttribute('aria-hidden','true');
  c.style.cssText='position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:4';document.body.appendChild(c);if(PT.off('edge'))c.style.display='none';
  return{c,g:c.getContext('2d'),X:0,Y:0,w:0,h:0,used:false}});
let EW=0,EH=0,ED=1;
function rz(){ED=DEV.dpr(innerWidth,innerHeight,1.5);EW=innerWidth;EH=innerHeight}
rz();addEventListener('resize',rz);
/* place a strip (CSS px box, snapped out to whole device pixels) and clear it; its drawing context works in page px */
function strip(s,x0,y0,x1,y1){const d=ED,X=Math.round(DEV.snap(Math.max(0,x0),d)*d),Y=Math.round(DEV.snap(Math.max(0,y0),d)*d),w=Math.max(0,Math.ceil(Math.min(EW,x1)*d)-X),h=Math.max(0,Math.ceil(Math.min(EH,y1)*d)-Y);
  if(w!==s.w||h!==s.h){s.c.width=s.w=w;s.c.height=s.h=h;s.c.style.width=w/d+'px';s.c.style.height=h/d+'px';s.used=false}
  if(X!==s.X||Y!==s.Y){s.X=X;s.Y=Y;s.c.style.transform='translate('+X/d+'px,'+Y/d+'px)'}
  if(s.used){s.g.setTransform(1,0,0,1,0,0);s.g.clearRect(0,0,w,h);s.used=false}
  s.g.setTransform(d,0,0,d,-X,-Y)}
function blank(){STRIP.forEach(s=>{if(s.used){s.g.setTransform(1,0,0,1,0,0);s.g.clearRect(0,0,s.w,s.h);s.used=false}})}
const IMG=[1,2,3,4,5].map(i=>{const im=new Image();im.src='images/gal-shard-'+i+'.webp';return im});
const R=Array.from({length:MAXSIDE*2},(_,i)=>{const r=k=>hash(i+11,k,23);return{side:i%2,slot:i>>1,img:(i*3)%5,flip:r(1)<.5,jit:r(2),h:HT[0]+r(3)*(HT[1]-HT[0]),ph:r(4)*6.283,sp:.35+r(5)*.3,amp:4+r(6)*5,tilt:(r(7)-.5)*.16,out:.3+r(8)*.2,sv:TRAVEL[0]+r(9)*(TRAVEL[1]-TRAVEL[0]),pv:r(10)*6.283,blow:BLOW[0]+r(11)*(BLOW[1]-BLOW[0]),spin:r(12)<.5?-1:1,bx:0,vx:0,rot:0,vr:0}});
let lt=0;
const el=document.getElementById('screen');
function frame(ms){if(PT.off('edge')){requestAnimationFrame(frame);return}const p0=PT.b();try{frame0(ms)}finally{PT.e('edge',p0)}requestAnimationFrame(frame)}
function frame0(ms){
  const t=ms/1000,dt=Math.min(.05,Math.max(0,t-lt));lt=t;
  const push=reduce?0:Math.min(1,M.boost*1.15+M.kick*.35);
  for(const o of R){o.vx+=((push*o.blow-o.bx)*14-o.vx*5.5)*dt;o.bx+=o.vx*dt;o.vr+=((push*1.4*o.spin-o.rot)*10-o.vr*4.5)*dt;o.rot+=o.vr*dt}
  const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
  if(r.width>0&&r.height>60&&cs.display!=='none'&&parseFloat(cs.opacity)>.05){
    const op=Math.min(1,parseFloat(cs.opacity)||1),padL=parseFloat(cs.paddingLeft)||14,padR=parseFloat(cs.paddingRight)||14,
      n=Math.max(1,Math.min(MAXSIDE,Math.round(r.height/PER)));
    /* strips: outward room for the blow (<= ~140), the sway and the glow; inward only the padding plus the glow */
    strip(STRIP[0],r.left-340,r.top-90,r.left+padL+80,r.bottom+90);strip(STRIP[1],r.right-padR-80,r.top-90,r.right+340,r.bottom+90);
    for(const o of R){
      if(o.slot>=n)continue;const im=IMG[o.img];if(!im.naturalWidth)continue;
      const pad=o.side?padR:padL,
        /* phones: the card nearly touches the screen edge, so the only room is the thin strip from the
           screen edge to the end of the card's padding. Slim the shard to fit that strip so it stays fully visible. */
        room=(o.side?EW-r.right:r.left)+pad-5,k0=im.naturalWidth/im.naturalHeight,
        hh=Math.min(o.h,Math.max(o.h*.6,(room-3)/(k0+Math.abs(o.tilt)))),ww=hh*k0,
        /* how far the shard may reach inside the card: only into the padding, never into text */
        inside=Math.max(0,Math.min(ww*(1-o.out),pad-5)),half=ww/2+hh*Math.abs(o.tilt)*.5,
        tight=room<ww*2.2,
        cx=tight?(o.side?r.right+5-pad+half:r.left+pad-5-half):(o.side?r.right-inside+half:r.left+inside-half),
        /* outward only: a slow breath away from the card plus the blow on a pick (on phones the breath stays on screen) */
        free=Math.max(0,o.side?EW-(cx+half):cx-half),
        sway=(.5+.5*Math.sin(t*o.sp*.7+o.ph))*Math.min(10,tight?free:10)*BG+Math.max(0,o.bx)+hh*.5*Math.abs(Math.sin(o.rot)),
        top=r.top+Math.max(56,r.height*.12),span=r.height-Math.max(56,r.height*.12)-40,
        /* travel along the edge: each shard roams its own stretch of the border and never sits still */
        tt=reduce?0:t,seg=1/n,w=.5+.42*Math.sin(tt*o.sv+o.pv)+.08*Math.sin(tt*o.sv*2.7+o.ph),
        cy=top+span*Math.min(1,Math.max(0,(o.slot-.35+w*1.7)*seg))+Math.sin(t*o.sp+o.ph)*o.amp*BG;
      if(cy<-hh||cy>EH+hh)continue;
      const S2=STRIP[o.side],g=S2.g;S2.used=true;
      g.save();g.translate(cx+(o.side?sway:-sway),cy);g.rotate(o.tilt+Math.sin(t*.4+o.ph)*.08*BG+o.rot);if(o.flip)g.scale(-1,1);
      g.globalAlpha=.92*op;g.drawImage(window.rockTinted?window.rockTinted(o.img):im,-ww/2,-hh/2,ww,hh);
      g.globalCompositeOperation='lighter';const gl=(.2+.1*Math.sin(t*1.3+o.ph))*op*(1+push*.8),gc=window.ROCKTINT?ROCKTINT.c.map(v=>Math.round(v*.5+245*.5)).join(','):'240,244,255',gr=g.createRadialGradient(0,hh*.46,0,0,hh*.46,ww*1.2);
      gr.addColorStop(0,'rgba('+gc+','+gl+')');gr.addColorStop(1,'rgba('+gc+',0)');g.fillStyle=gr;g.fillRect(-ww*1.3,hh*.1,ww*2.6,hh*.8);
      g.restore();g.globalCompositeOperation='source-over';g.globalAlpha=1}
  }else blank()}
requestAnimationFrame(frame);
})();
