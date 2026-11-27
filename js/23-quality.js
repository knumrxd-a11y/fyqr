/* ===== automatic quality: full quality on strong devices, lowered one step at a time only when the page is slow =====
   Level 0 = the site exactly as designed. A device with a graphics chip built into the processor, or one drawing in
   software (js/00-device.js: DEV.gpu 'igpu' / 'soft'), starts at level 2, which looks the same as level 0 (steps 1
   and 2 only change how the same picture is made). A separate graphics card, or an unknown one, starts at level 0.
   Going down (never back up during the visit; one-off hitches such as page changes or loading do not count):
     under 45 fps for 2 s, or under 30 fps for 1 s, or under 20 fps for half a second -> one step down,
     then 1 s to settle before measuring again.
     1  film grain becomes a still layer (same grain, it just stops flickering; blended by the browser, not redrawn)
     2  nebula glows and the sea of clouds are drawn from pre-drawn images instead of new gradients every frame
     3  the background canvas (#cv: sky, city, rocks) redraws at 30 fps
     4  the background canvas renders at 1x pixel ratio
     5  (low) the text box and the sound button lose the frosted-glass blur; the box gets a little more tint instead
   (A paper scene at 0.75 resolution was tried and removed: it blurred the paper visibly on phones.)
   Never touched: colours, aurora, the guiding star, the city, the paper scene, text.
   URL: ?quality=high forces level 0 (also lifts the big-screen pixel limit, js/00-device.js),
        ?quality=medium forces 2, ?quality=low forces 5, ?quality=0..5 forces that level.
   window.QL = current level (read by js/02, js/04, js/22). */
(function(){
const Q=new URLSearchParams(location.search).get('quality'),TOP=5;
window.QL=0;window.QFORCED=false;

/* step 1: the grain as a still layer between the background canvas and the scene layer */
const grain=document.createElement('div');grain.id='qgrain';grain.setAttribute('aria-hidden','true');
grain.style.cssText='position:absolute;inset:0;pointer-events:none;display:none;opacity:.3;mix-blend-mode:overlay;background-size:200px 200px;background-image:url('+NZ.toDataURL()+')';
cv.after(grain);

/* step 2: one pre-drawn radial glow per colour, scaled and faded into place (same shape and colour as the gradients) */
const SPR=new Map();
window.QGLOW=function(c,col,a,x,y,r){
  let s=SPR.get(col);
  if(!s){if(SPR.size>40)SPR.clear();s=document.createElement('canvas');s.width=s.height=256;const g=s.getContext('2d'),rg=g.createRadialGradient(128,128,0,128,128,128);
    rg.addColorStop(0,'rgba('+col+',1)');rg.addColorStop(1,'rgba('+col+',0)');g.fillStyle=rg;g.fillRect(0,0,256,256);SPR.set(col,s)}
  const ga=c.globalAlpha;c.globalAlpha=ga*a;c.drawImage(s,x-r,y-r,r*2,r*2);c.globalAlpha=ga};

/* step 3: the background at 30 fps */
const _draw=window.draw;let odd=0;
window.draw=function(t){if(window.QL>=3&&(odd^=1))return;return _draw.apply(this,arguments)};

/* step 5: no backdrop blur (the most expensive thing on a built-in graphics chip: re-blurred every frame) */
const css=document.createElement('style');
css.textContent='body.q-noblur #screen,body.q-noblur #snd{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'
  +'body.q-noblur #screen{background-color:rgba(14,12,28,.8)!important}body.q-noblur.gal #screen,body.q-noblur.qa #screen{background-color:rgba(14,10,34,.62)!important}';
document.head.appendChild(css);

function setLevel(l){
  const was=window.QL;window.QL=Math.max(0,Math.min(TOP,l));
  grain.style.display=window.QL>=1?'block':'none';
  document.body.classList.toggle('q-noblur',window.QL>=5);
  if((was>=4)!==(window.QL>=4))resize();
  if(window.__paper&&__paper.st&&__paper.st.kick)__paper.st.kick();
}
window.QSET=setLevel;
if(Q==='high'){window.QFORCED=true;setLevel(0);return}
if(Q==='medium'){window.QFORCED=true;setLevel(2);return}
if(Q==='low'){window.QFORCED=true;setLevel(TOP);return}
if(Q!==null&&/^[0-5]$/.test(Q)){window.QFORCED=true;setLevel(+Q);return}
const D=window.DEV&&DEV.gpu;
setLevel(D==='igpu'||D==='soft'?2:0);

/* the monitor: half-second samples; how many low ones in a row it takes depends on how low */
const T0=performance.now();let n=0,s0=0,last=0,gap=0,low45=0,low30=0,wait=0;
(function tick(now){
  requestAnimationFrame(tick);
  if(document.hidden){s0=0;last=0;return}
  if(!s0){s0=now;last=now;n=0;gap=0;return}
  n++;gap=Math.max(gap,now-last);last=now;
  if(now-s0<500)return;
  /* a one-off hitch = one long pause in an otherwise smooth half second (a page change, loading); a device that is
     slow all the time (every frame long) is not a hitch */
  const dur=now-s0,fps=n*1000/dur,hitch=gap>250&&n>1&&(n-1)*1000/(dur-gap)>=45;s0=now;n=0;gap=0;
  if(now-T0<2500||now<wait||hitch)return;                // settling after load / after a step, or a one-off pause
  low45=fps<45?low45+1:0;low30=fps<30?low30+1:0;
  if(window.QL<TOP&&(fps<20||low30>=2||low45>=4)){setLevel(window.QL+1);low45=low30=0;wait=now+1000}
})(performance.now());
})();
