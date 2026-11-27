/* ===== scene 1.2 "ของติดตัว": five floating items are hotspots; tap one -> camera zooms in -> its card pops up ===== */
(function(){
const XS=[0,59,36.4,-36.4,-59],YS=[18,41.5,79.5,79.5,41.5],MI={DGA:0,DGD:1,IGD:2,AFX:3,DEN:4};
const st=document.createElement('style');st.textContent=`
#screen.items-mode .opt{display:none}#screen.items-mode .opt.show{display:block;animation:cardIn .5s cubic-bezier(.2,.9,.3,1.2) both}
#screen.items-mode .itemhint{display:block}#screen.items-mode.peeking .itemhint,.itemhint{display:none}
#screen.items-mode.peeking .backpeek{display:inline-flex}.backpeek{display:none;align-self:flex-start;margin-top:10px}#screen.items-mode .opt.show{font-size:17px;padding:16px}#screen.items-mode .opt.show::before{content:'แตะเพื่อหยิบชิ้นนี้';display:block;font-size:12px;color:var(--ic,#ffe9a8);margin-bottom:5px}
#pins{position:fixed;inset:0;z-index:5;pointer-events:none}
.pin{position:fixed;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;border:0;background:transparent;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.pin::before,.pin::after{display:none}
.pin::after{animation-delay:1s}@keyframes pr{from{transform:scale(.55);opacity:.9}to{transform:scale(1.35);opacity:0}}
.pin:focus-visible{outline:2px solid #fff;outline-offset:2px}`;document.head.appendChild(st);
const box=document.createElement('div');box.id='pins';document.body.appendChild(box);
let pins=[];
const ITM={"DGD": "images/item-DGD.webp", "DGA": "images/item-DGA.webp", "AFX": "images/item-AFX.webp", "IGD": "images/item-IGD.webp", "DEN": "images/item-DEN.webp"},IMG={};Object.keys(ITM).forEach(k=>{const im=new Image();im.src=ITM[k];IMG[k]=im});
function item(m,x,y,s,t,i){sx.save();sx.translate(x,y+Math.sin(t*1.5+i*1.3)*1.8);sx.scale(s,s);const mi=MI[m];
  {const gp=Math.sin(t*1.8+i*1.3);glow(0,0,18+3*gp,PCOL[mi],.4+.2*gp,mi)}
  const IM=IMG[m];
  if(IM&&IM.naturalWidth){const bx=21,q=bx/Math.max(IM.naturalWidth,IM.naturalHeight),w=IM.naturalWidth*q,h=IM.naturalHeight*q;sx.shadowColor=PCOL[mi];sx.shadowBlur=9+7*Math.sin(t*1.8+i*1.3);sx.rotate(Math.sin(t*1.1+i)*.05);sx.drawImage(IM,-w/2,-h/2,w,h)}
  else if(m==='DGA'){sx.rotate(-.12);fr('#F25AA6',-6,-8,12,16,0);fr('#fff3f8',-4.5,-6,9,12,0);sx.strokeStyle=K('#8a1d57',0);sx.lineWidth=.6;for(let k=0;k<4;k++){sx.beginPath();sx.arc(-6,-6+k*4,1,0,7);sx.stroke()}sx.strokeStyle=K('#d9a0c0',0);sx.lineWidth=.6;sx.beginPath();sx.moveTo(-2,-2);sx.quadraticCurveTo(0,-5,3,-1);sx.stroke();fr('#FFD166',5,-10,1.8,9,0)}
  else if(m==='DGD'){ci('#9A7BFF',0,0,8,1);ci('#2a2250',3,3,2.2,1);ci('#FFD166',-3,-4,1.8,1);ci('#4BE3C1',3,-4,1.8,1);ci('#F25AA6',-5,1,1.8,1);sx.fillStyle=K('#fff');sx.font='bold 6px sans-serif';sx.fillText('Aa',-3,8)}
  else if(m==='IGD'){fr('#3BCB7E',-6,-8,12,16,2);fr('#14452b',-4,-6,8,5,2);fr('#CFFFE0',-3,.5,6,6,2);fr('#14452b',-4,8,8,2,2)}
  else if(m==='AFX'){fr('#2b2b33',-8,-5,16,11,3);fr('#F59A3B',-8,-5,16,2.2,3);ci('#111',0,1,4.6,3);ci('#F59A3B',0,1,3,3);ci('#fff',-1,0,.9,3);ci('#555',-4,-7,2.2,3);ci('#555',2,-7,2.2,3)}
  else{sx.fillStyle=K('#4BA3F5',4);sx.beginPath();sx.arc(0,-4,5.2,0,7);sx.fill();sx.strokeStyle=K('#14304f',4);sx.lineWidth=.5;for(let k=-3;k<=3;k+=2){sx.beginPath();sx.moveTo(-4.5,-4+k);sx.lineTo(4.5,-4+k);sx.stroke()}fr('#888',-1,1,2,8,4);fr('#333',-3,9,6,1.6,4)}
  sx.restore()}
window.__item=item;
V.v4=function(t){
  const sel=SCN.zl,s0=SAT;SAT=1;{sx.save();sx.globalAlpha*=.16*(1-(sel>=0?SCN.zp:0));sx.strokeStyle='#fff4d6';sx.setLineDash([1.5,3.5]);sx.lineWidth=.6;sx.beginPath();sx.ellipse(0,52,62,34,0,0,7);sx.stroke();sx.restore()}for(let i=0;i<5;i++){if(SCN.hid===i)continue;const m=SC[1].o[S.perm[i]]&&SC[1].o[S.perm[i]][0]||'DGA',dim=sel>=0&&sel!==i&&SCN.zp>.3;sx.save();sx.globalAlpha*=dim?.07:1;
    item(m,XS[i],YS[i],1.8+(sel===i?SCN.zp*.2:0),t,i);sx.restore()}SAT=s0};
V.v4.items=true;
/* backdrop only: every other illustrated vignette is switched off (scene 1.2 keeps its five tappable items) */
Object.keys(V).forEach(k=>{if(k!=='v4')V[k]=function(){}});
SCN.zi=-1;SCN.zl=-1;SCN.zp=0;
// zoom transform hook (called from paint)
window.v4Zoom=function(){if(SCN.zl<0||SCN.zp<=0)return;const e=SCN.zp*SCN.zp*(3-2*SCN.zp),zf=SCN.zf>=0?SCN.zf:SCN.zl,i0=Math.max(0,Math.min(3,Math.floor(zf))),ft=Math.max(0,Math.min(1,zf-i0)),px=XS[i0]*(1-ft)+XS[i0+1]*ft,py=YS[i0]*(1-ft)+YS[i0+1]*ft,zm=zoomTarget(),z=1+(zm[0]-1)*e;
  sx.translate(px+e*(0-px),py+e*(zm[1]-py));sx.scale(z,z);sx.translate(-px,-py)};
const ZM={zt:1.6,yt:40};
/* the picked item fills the free space above the card: as wide as ~74% of the screen, as tall as the gap allows, centred in it */
function zoomTarget(){const sr=sc.getBoundingClientRect(),top=Math.max(110,document.getElementById('screen').getBoundingClientRect().top),band=Math.max(110,top-76),cy=76+band/2,yt=(cy-sr.top-SY)/SS,dim=Math.min(SW*.74,band*.94)*.8,zt=Math.max(1.2,Math.min(4,dim/(42*SS)));ZM.zt=zt;ZM.yt=yt;return[zt,yt]}
function sync(){document.getElementById('screen').classList.toggle('peeking',SCN.zi>=0);document.body.classList.toggle('peekmode',SCN.zi>=0)}
function updNav(i){const cc=(()=>{try{return MJ[SC[1].o[S.perm[i]][0]].c}catch(_){return '#ffe9a8'}})(),n=document.querySelector('.inav');if(!n)return;n.style.setProperty('--ic',cc);
  n.querySelectorAll('.idot').forEach((d,j)=>d.classList.toggle('on',j===i));const pv=n.querySelector('.iprev'),nx=n.querySelector('.inext');if(pv)pv.disabled=i<=0;if(nx)nx.disabled=i>=4}
function peek(i,dir){const first=!(SCN.zi>=0);SCN.zi=i;SCN.zl=i;if(first)SCN.zf=i;const o=document.querySelectorAll('#screen .opt');
  o.forEach((b,j)=>{b.classList.remove('sl','sr');b.classList.toggle('show',j===i);if(j===i&&dir){void b.offsetWidth;b.classList.add(dir>0?'sl':'sr')}});
  try{const mk=SC[1].o[S.perm[i]][0],cc=MJ[mk].c;o.forEach((b,j)=>{if(j===i){b.style.borderColor=cc;b.style.boxShadow='0 0 26px '+cc+'66';b.style.setProperty('--ic',cc)}})}catch(_){}updNav(i);sync();sfx('pick')}
function unpeek(){SCN.zi=-1;document.querySelectorAll('#screen .opt').forEach(b=>b.classList.remove('show','sl','sr'));sync()}
/* swipe (or arrows / keys) moves straight to the next item without going back to the overview */
function go(dir){if(S.lock||SCN.zi<0)return;const ni=SCN.zi+dir;if(ni<0||ni>4){const el=document.getElementById('screen');el.classList.remove('nudge');void el.offsetWidth;el.classList.add('nudge');return}peek(ni,dir)}
let SW0=null,SWALLOW=false;
document.addEventListener('pointerdown',e=>{if(SCN.zi<0||S.lock||!document.getElementById('screen').classList.contains('items-mode')||e.target.closest('.backbtn,#snd,#cfm')){SW0=null;return}SW0={x:e.clientX,y:e.clientY,done:false}},true);
document.addEventListener('pointermove',e=>{if(!SW0||SW0.done)return;const dx=e.clientX-SW0.x,dy=e.clientY-SW0.y;if(Math.abs(dx)>46&&Math.abs(dx)>Math.abs(dy)*1.3){SW0.done=true;SWALLOW=true;go(dx<0?1:-1)}},true);
const swEnd=()=>{SW0=null;setTimeout(()=>{SWALLOW=false},350)};document.addEventListener('pointerup',swEnd,true);document.addEventListener('pointercancel',swEnd,true);
document.addEventListener('click',e=>{if(SWALLOW){e.stopPropagation();e.preventDefault();return}const b=e.target.closest&&e.target.closest('.iprev,.inext');if(b){go(b.classList.contains('inext')?1:-1)}},true);
document.addEventListener('keydown',e=>{if(SCN.zi<0)return;if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)});
document.addEventListener('click',e=>{if(e.target.closest('.backpeek'))unpeek()});
const _r=window.render;window.render=function(){_r.apply(this,arguments);
  const el=document.getElementById('screen'),on=S.stage==='scene'&&S.si===1;
  SCN.zi=-1;SCN.zl=-1;SCN.zp=0;SCN.zf=-1;SCN.hid=-1;document.body.classList.remove('peekmode');el.classList.remove('peeking','nudge');el.classList.toggle('items-mode',on);
  if(on){const first=el.querySelector('.opts');if(first){const hint=document.createElement('p');hint.className='itemhint note';hint.textContent='แตะของที่ลอยอยู่ด้านบน เพื่อดูใกล้ ๆ';first.before(hint);const nv=document.createElement('div');nv.className='inav';nv.innerHTML='<button type="button" class="iprev" aria-label="ชิ้นก่อนหน้า">‹</button><span class="idots">'+[0,1,2,3,4].map(()=>'<i class="idot"></i>').join('')+'</span><button type="button" class="inext" aria-label="ชิ้นถัดไป">›</button><small class="swh">ปัดซ้าย–ขวาเพื่อเปลี่ยนชิ้น</small>';first.before(nv);const b=document.createElement('button');b.type='button';b.className='btn ghost backpeek';b.textContent='← ดูของทั้งหมด';first.appendChild(b)}}
  box.innerHTML='';pins=[];
  if(on){for(let i=0;i<5;i++){const b=document.createElement('button');b.type='button';b.className='pin';b.setAttribute('aria-label',SC[1].o[S.perm[i]][1]);b.addEventListener('click',()=>{if(!S.lock)peek(i)});box.appendChild(b);pins.push(b)}}};
function tick(){try{tick0()}catch(e){window.__err=e.message+' '+(e.stack||'').split('\n')[1]}requestAnimationFrame(tick)}
function tick0(){const on=S.stage==='scene'&&S.si===1&&!S.lock,k=SCN.zi>=0?1:0;if(SCN.zi>=0){if(!(SCN.zf>=0))SCN.zf=SCN.zi;SCN.zf+=(SCN.zi-SCN.zf)*(reduce?1:.17)}else if(SCN.zp<=.002){SCN.zf=-1}SCN.zp+=(k-SCN.zp)*(reduce?1:.14);if(SCN.zp<.002&&k===0){SCN.zp=0;SCN.zl=-1}
  pins.forEach((b,i)=>{const show=on&&SCN.zi<0&&SCN.zp<.05&&SCN.k==='v4'&&SCN.f>.9,sr=sc.getBoundingClientRect();b.style.display=show?'block':'none';if(show){b.style.left=(sr.left+SW/2+XS[i]*SS)+'px';b.style.top=(sr.top+SY+(YS[i]+Math.sin(performance.now()/1000*1.5+i*1.3)*1.8)*SS)+'px'}});
  }
requestAnimationFrame(tick);
{const st2=document.createElement('style');st2.textContent=`
.inav{display:none;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin:0 0 4px}
#screen.items-mode.peeking .inav{display:flex}
.inav button{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.08);color:#fff;font-size:22px;line-height:1;cursor:pointer;display:grid;place-items:center;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .12s,opacity .2s}
.inav button:active{transform:scale(.88)}.inav button:disabled{opacity:.25}
.idots{display:flex;gap:7px;align-items:center}
.idot{display:block;width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.28);transition:transform .25s,background .25s,box-shadow .25s}
.idot.on{transform:scale(1.3);background:var(--ic,#ffe9a8);box-shadow:0 0 8px var(--ic,#ffe9a8)}
.swh{flex-basis:100%;text-align:center;font-size:12px;color:var(--mute);opacity:.85}
#screen.items-mode .opt.show.sl,#screen.items-mode .opt.show.sr{animation:swIn .42s cubic-bezier(.2,.9,.3,1.1) both}
#screen.items-mode .opt.show.sl{--sx:80px}#screen.items-mode .opt.show.sr{--sx:-80px}
@keyframes swIn{from{opacity:0;transform:translateX(var(--sx)) scale(.94)}to{opacity:1;transform:none}}
#screen.nudge{animation:nudge .35s ease}
@keyframes nudge{25%{transform:translateX(-9px)}60%{transform:translateX(7px)}100%{transform:none}}
body.peekmode,body.peekmode #app,body.peekmode #screen,body.peekmode #screen *{touch-action:pan-y!important}
.pk-trail{position:fixed;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;z-index:69;pointer-events:none;background:var(--c);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)}
.pk-ring{position:fixed;z-index:68;pointer-events:none;border-radius:50%;border:3px solid var(--c);box-shadow:0 0 24px var(--c),inset 0 0 18px var(--c)}
`;document.head.appendChild(st2)}
/* picking an item: it squashes, pops up, then arcs down and shrinks into the player at the bottom of the screen */
function pickFly(i){
  if(reduce)return;
  const mk=SC[1].o[S.perm[i]][0],src=ITM[mk],col=MJ[mk].c,IM=IMG[mk];if(!src||!IM)return;
  const sr=sc.getBoundingClientRect(),cx=sr.left+SW/2,cy=sr.top+SY+ZM.yt*SS,nat=Math.max(IM.naturalWidth||1,IM.naturalHeight||1),k=21/nat*2*ZM.zt*SS,w=(IM.naturalWidth||nat)*k,h=(IM.naturalHeight||nat)*k;
  const el=document.createElement('img');el.src=src;el.draggable=false;el.alt='';
  el.style.cssText='position:fixed;left:'+(cx-w/2)+'px;top:'+(cy-h/2)+'px;width:'+w+'px;height:'+h+'px;z-index:70;pointer-events:none;filter:drop-shadow(0 0 14px '+col+');transform-origin:50% 50%;backface-visibility:hidden;will-change:transform,opacity;opacity:0';
  document.body.appendChild(el);
  /* one continuous path, driven frame by frame: no keyframe seams, so velocity never jumps */
  const tx=innerWidth/2-cx,ty=innerHeight*.9-cy,c1x=tx*.1,c1y=-h*.5;           /* lift first, then arc down to the player */
  const D=1350,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=v=>{v=cl(v,0,1);return v*v*(3-2*v)},ei=v=>{v=cl(v,0,1);return v*v*v},eo=v=>{v=cl(v,0,1);return 1-Math.pow(1-v,3)};
  const P=u=>{const e=u<.14?0:sm((u-.14)/.86),m=1-e;return[2*m*e*c1x+e*e*tx,2*m*e*c1y+e*e*ty]};
  let t0=0,lastTrail=0,done=false;
  const frame=now=>{
    if(!t0)t0=now;const u=cl((now-t0)/D,0,1),pos=P(u);
    const ant=Math.sin(Math.PI*cl(u/.16,0,1)),pop=Math.sin(Math.PI*cl((u-.1)/.3,0,1)),shr=1-.94*ei(cl((u-.3)/.7,0,1)),
      sx=shr*(1+.1*ant*.6+.1*pop*.7),sy=shr*(1-.09*ant+.12*pop),rot=(-9*Math.sin(Math.PI*cl(u/.85,0,1))+10*sm((u-.5)/.5))*Math.PI/180,
      op=1-sm((u-.82)/.18)*.9;
    el.style.transform='translate3d('+pos[0].toFixed(2)+'px,'+pos[1].toFixed(2)+'px,0) rotate('+rot.toFixed(4)+'rad) scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';el.style.opacity=op.toFixed(3);
    if(u>.2&&u<.92&&now-lastTrail>55){lastTrail=now;const tt=document.createElement('i');tt.className='pk-trail';tt.style.cssText='left:'+(cx+pos[0]+(Math.random()-.5)*h*.3*shr)+'px;top:'+(cy+pos[1]+(Math.random()-.5)*h*.3*shr)+'px;--c:'+(Math.random()<.5?col:'#fff6dc');document.body.appendChild(tt);
      tt.animate([{transform:'scale(1)',opacity:.85},{transform:'translate('+((Math.random()-.5)*20)+'px,'+(8+Math.random()*16)+'px) scale(.1)',opacity:0}],{duration:600,easing:'cubic-bezier(.2,.6,.3,1)'}).onfinish=()=>tt.remove()}
    if(u<1){requestAnimationFrame(frame);return}
    if(done)return;done=true;el.remove();
    const x=innerWidth/2,y=innerHeight*.9;[0,140].forEach(d=>{const g=document.createElement('i');g.className='pk-ring';g.style.cssText='left:'+(x-20)+'px;top:'+(y-20)+'px;width:40px;height:40px;--c:'+col;document.body.appendChild(g);
      g.animate([{transform:'scale(.2)',opacity:.85},{transform:'scale(3.4)',opacity:0}],{duration:800,delay:d,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'}).onfinish=()=>g.remove()});
    try{sfx('finale')}catch(_){}try{navigator.vibrate&&navigator.vibrate([14,40,22])}catch(_){}};
  /* wait until the picture is decoded, then swap it in for the canvas copy in the same frame: no flicker, no hitch */
  const go=()=>requestAnimationFrame(()=>{SCN.hid=i;el.style.opacity=1;try{sfx('pick')}catch(_){}requestAnimationFrame(frame)});
  (el.decode?el.decode():Promise.resolve()).then(go,go);
}
const _mk2=window.mark;window.mark=function(i){try{if(S.stage==='scene'&&S.si===1&&SCN.zi>=0)pickFly(i)}catch(e){}_mk2(i)};
})();
