/* ===== result: the tribe shown as a collectible card: tap or drag to flip between the front and the back ===== */
(function(){
const st=document.createElement('style');st.textContent=`
.rscene{perspective:900px;display:flex;justify-content:center;margin:6px 0 4px;touch-action:pan-y}
.rcard{--ry:0deg;--rx:0deg;--sh:50%;position:relative;width:min(74vw,290px);aspect-ratio:297/420;transform-style:preserve-3d;transform:rotateY(var(--ry)) rotateX(var(--rx));cursor:grab;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;outline:none}
.rcard:active{cursor:grabbing}
.rcard:focus-visible .rface,.rcard:focus-visible .rback{outline:2px solid var(--ink);outline-offset:3px}
/* the shadow sits on each side, not as a filter on .rcard: a filter flattens the 3D, and the back never showed */
.rface,.rback{position:absolute;inset:0;border-radius:4.04%/2.86%;overflow:hidden;box-shadow:0 18px 26px rgba(0,0,0,.45);-webkit-backface-visibility:hidden;backface-visibility:hidden}
.rimg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.rback{transform:rotateY(180deg)}
.rplate{position:absolute;left:5.72%;right:5.72%;top:79.4%;height:14.17%;padding:0 3%;display:flex;align-items:center;justify-content:center;text-align:center}
.rplate h2{margin:0;font-family:var(--display);font-size:22px;line-height:1.2;font-weight:500;color:#241b2b!important;text-wrap:balance}
.rsheen{position:absolute;inset:0;border-radius:4.04%/2.86%;pointer-events:none;mix-blend-mode:soft-light;background:linear-gradient(112deg,transparent calc(var(--sh) - 22%),rgba(255,255,255,.75) var(--sh),transparent calc(var(--sh) + 22%))}
.rfliphint{margin:0 0 6px;text-align:center;font-size:12.5px!important;color:var(--mute)}
@media (prefers-reduced-motion:reduce){.rsheen{display:none}}`;document.head.appendChild(st);
/* the card pictures are made ahead of time, one front and one back per major (tools/make-cards.py from images/frame-1.png
   and frame-2.png): newspaper in the major's colour, cream panels and logo unchanged. A two-major result uses the major
   that scored higher. Front: the major's mascot sits in the top cream panel (js/14) and the result title in the bottom one. */
const topMajor=()=>{const rk=rank(10);return S.result.m.slice().sort((x,y)=>rk.indexOf(x)-rk.indexOf(y))[0]};
window.cardMajor=topMajor;
/* largest title size that fits the bottom panel (two lines at most) */
function fitTitle(card){const box=card.querySelector('.rplate'),h=box&&box.querySelector('h2');if(!h||!box.clientWidth)return;
  let s=Math.min(26,box.clientWidth*.105);h.style.fontSize=s+'px';
  while(s>10&&(h.scrollHeight>box.clientHeight-2||h.scrollWidth>box.clientWidth+1)){s-=.5;h.style.fontSize=s+'px'}}
function init(){
  const card=document.getElementById('rcard');if(!card||card.dataset.on)return;card.dataset.on=1;
  fitTitle(card);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitTitle(card));
  const onRz=()=>{if(!document.body.contains(card)){removeEventListener('resize',onRz);return}fitTitle(card)};addEventListener('resize',onRz);
  /* tap = flip to the other side; drag = turn it by hand, and on release it settles on the nearer side
     (a short flick past 55deg is enough to flip). It opens showing the back, then turns to the front. */
  let base=0,ry=reduce?0:180,rx=0,ty=0,drag=false,moved=0,lx=0,ly=0,off=0,t0=performance.now();
  const flip=n=>{base+=n*180;card.setAttribute('aria-pressed',String((((base/180)%2)+2)%2===1))};
  card.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.rchars img'))return;drag=true;moved=0;lx=e.clientX;ly=e.clientY;card.setPointerCapture&&card.setPointerCapture(e.pointerId)});
  card.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;moved+=Math.abs(dx)+Math.abs(dy);off+=dx*.9;ty=Math.max(-22,Math.min(22,ty-dy*.3));lx=e.clientX;ly=e.clientY});
  const up=()=>{if(!drag)return;drag=false;
    if(moved<8)flip(1);else{let n=Math.round(off/180);if(!n&&Math.abs(off)>55)n=Math.sign(off);if(n)flip(n)}
    off=0};
  card.addEventListener('pointerup',up);card.addEventListener('pointercancel',()=>{drag=false;off=0});
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip(1)}});
  (function loop(now){if(!document.body.contains(card))return;const t=(now-t0)/1000;
    if(!drag)ty*=.92;
    const idle=reduce?0:Math.sin(t*.9)*10,tgt=(t<1.4&&!reduce?0:idle)+base+off;ry+=(tgt-ry)*(t<1.4?.07:drag?.35:.14);rx+=(ty-rx)*.15;
    card.style.setProperty('--ry',ry.toFixed(2)+'deg');card.style.setProperty('--rx',rx.toFixed(2)+'deg');card.style.setProperty('--sh',(50+Math.sin(ry*Math.PI/180)*70).toFixed(1)+'%');
    requestAnimationFrame(loop)})(t0)}
const _rh=window.resultHTML;
window.resultHTML=function(){let h=_rh.apply(this,arguments);
  const k=topMajor();
  h=h.replace(/<h2 class="res-title"([^>]*)>([\s\S]*?)<\/h2>/,(m0,at,title)=>'<div class="rscene"><div class="rcard" id="rcard" role="button" tabindex="0" aria-pressed="false" aria-label="การ์ดผลของเธอ: '+title.replace(/<[^>]*>/g,'')+' (แตะหรือลากเพื่อพลิกการ์ด)"><div class="rface"><img class="rimg" src="images/card-front-'+k+'.webp" alt="" draggable="false"><div class="rplate"><h2 class="res-title"'+at+'>'+title+'</h2></div><div class="rsheen"></div></div><div class="rback"><img class="rimg" src="images/card-back-'+k+'.webp" alt="" draggable="false"></div></div></div><p class="rfliphint" aria-hidden="true">แตะหรือลากการ์ดเพื่อพลิกดูอีกด้าน</p><!--rshare-->');
  return h};
const _r=window.render;window.render=function(){_r.apply(this,arguments);if(S.stage==='result')setTimeout(init,0)};
})();
