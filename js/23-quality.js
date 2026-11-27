/* ===== automatic quality: full quality everywhere, lowered one step at a time only on slow devices =====
   Every device starts at level 0 = the site exactly as designed. When the page stays under 45 fps for more than
   2 seconds (one-off hitches such as page changes or loading do not count), it goes down ONE step, waits, measures
   again. It never goes back up during the visit.
     1  film grain becomes a still layer (same grain, it just stops flickering; blended by the browser, not redrawn)
     2  nebula glows and the sea of clouds are drawn from pre-drawn images instead of new gradients every frame
     3  the background canvas (#cv: sky, city, rocks) redraws at 30 fps
     4  the background canvas renders at 1x pixel ratio
   (A 5th step, the paper scene at 0.75 resolution, was tried and removed: it blurred the paper visibly on phones.)
   Never touched: colours, aurora, the guiding star, the city, the paper scene, text, the frosted text box.
   URL: ?quality=high forces level 0 (no automatic steps), ?quality=low forces level 4, ?quality=0..4 forces that level.
   window.QL = current level (read by js/02, js/04, js/22). */
(function(){
const Q=new URLSearchParams(location.search).get('quality');
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

function setLevel(l){
  const was=window.QL;window.QL=Math.max(0,Math.min(4,l));
  grain.style.display=window.QL>=1?'block':'none';
  if((was>=4)!==(window.QL>=4))resize();
  if(window.__paper&&__paper.st&&__paper.st.kick)__paper.st.kick();
}
window.QSET=setLevel;
if(Q==='high'){window.QFORCED=true;setLevel(0);return}
if(Q==='low'){window.QFORCED=true;setLevel(4);return}
if(Q!==null&&/^[0-4]$/.test(Q)){window.QFORCED=true;setLevel(+Q);return}

/* the monitor: half-second samples; five low ones in a row (2.5 s) = one step down */
const T0=performance.now();let n=0,s0=0,last=0,gap=0,low=0,wait=0;
(function tick(now){
  requestAnimationFrame(tick);
  if(document.hidden){s0=0;last=0;return}
  if(!s0){s0=now;last=now;n=0;gap=0;return}
  n++;gap=Math.max(gap,now-last);last=now;
  if(now-s0<500)return;
  const fps=n*1000/(now-s0);s0=now;n=0;const hitch=gap>250;gap=0;
  if(now-T0<4000||now<wait||hitch)return;                // settling after load / after a step, or a one-off pause
  if(fps<45){if(++low>=5&&window.QL<4){setLevel(window.QL+1);low=0;wait=now+2000}}
  else low=0;
})(performance.now());
})();
