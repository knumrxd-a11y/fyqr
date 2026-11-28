/* ===== the sun: the animated pixel sun (from anim.gif) replaces every round moon =====
   images/sun-sheet.webp holds 120 frames (12 x 10 grid, 176px each, 8 s loop) on black.
   It is drawn with "lighter" blending, so the black disappears and only the light shows.
   - Home page (js/10): replaces the round moon; when you press start it stays in place and fades out.
   - Story pages: the moon pieces of the city art are found by their colour and hidden (js/03), and one sun
     is drawn fixed in the middle of the sky on every page: centred left-right, and at the same height as the
     centre of the five floating items on the item page, so it sits in the empty space between them.
     It stays put while the camera moves, and nothing covers it: it has its own layer (#suncv) on top of the
     city, the towers, the floating rocks and the scene pictures, but still behind the text box.
     Only on the item page (scene 1.2) it sits behind the five floating items.
     Tweak: STORY = its size (x scene scale).
   Tweak: SIZE = sun width on the home page compared with the old moon (1 = same size as the moon disc). */
window.SUN=(function(){
const SIZE=2.6,STORY=58,FR=120,COLS=12,CELL=176,LOOP=8000,MOON=84;
const im=new Image();let ok=false;im.onload=()=>{ok=true};im.src='images/sun-sheet.webp';
function frame(){const f=reduce?0:Math.floor((performance.now()%LOOP)/LOOP*FR)%FR;return[(f%COLS)*CELL,Math.floor(f/COLS)*CELL]}
function put(g,x,y,d,a){const[sx,sy]=frame();g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(im,sx,sy,CELL,CELL,x-d/2,y-d/2,d,d);g.restore()}
/* find the moons in the story city art: pale beige pieces; the big round ones (mostly filled box) get a sun */
(function mark(){
  if(typeof CL==='undefined'||!CL||!CL.comps){setTimeout(mark,200);return}
  CL.comps.forEach(o=>{if(o.base)return;const d=o.co.getContext('2d').getImageData(0,0,o.w,o.h).data;let n=0,r=0,g=0,b=0;
    for(let j=0;j<d.length;j+=4)if(d[j+3]>8){n++;r+=d[j];g+=d[j+1];b+=d[j+2]}
    if(!n)return;r/=n;g/=n;b/=n;
    if(r>130&&Math.abs(r-g)<14&&r-b>15&&r-b<55){o.moon=true;o.round=n/(o.w*o.h)>.6&&o.w>60&&Math.abs(o.w-o.h)<o.w*.25}});
  /* only the moon nearest the middle of the city becomes the sun; the other moons are simply hidden */
  let best=null,bd=1e9;CL.comps.forEach(o=>{if(!o.round)return;const dx=o.x+o.w/2-CL.w/2;if(Math.abs(dx)<bd){bd=Math.abs(dx);best=o}});
  if(best)best.sun=true})();
/* story pages: fixed in the middle of the sky, on its own top layer so nothing in the backdrop covers it.
   The layer uses screen blending, so the black of the sheet disappears against the sky. */
const ss=document.createElement('style');ss.textContent='#suncv{position:absolute;left:0;top:0;pointer-events:none;mix-blend-mode:screen;transform-origin:0 0}body.gal #suncv{display:none}';document.head.appendChild(ss);
const top=document.createElement('canvas');top.id='suncv';if(PT.off('sun'))top.style.display='none';top.setAttribute('aria-hidden','true');
const tg=top.getContext('2d');let drew=0;
/* the item page (scene 1.2) is the one page where the sun sits behind the floating items */
function place(){const st=document.querySelector('.stage');if(!st)return;
  const behind=S.stage==='scene'&&S.si===1&&typeof sc!=='undefined'&&sc.parentNode===st;
  if(behind){if(top.nextSibling!==sc)st.insertBefore(top,sc)}else if(st.lastElementChild!==top)st.appendChild(top)}
const _cd=cityDraw;
cityDraw=function(sec){
  const r=_cd.apply(this,arguments),p0=PT.b();
  if(ok&&typeof sc!=='undefined'&&!PT.off('sun')){place();const tr=top.parentNode.getBoundingClientRect(),dp=DEV.dpr(tr.width,tr.height,2),sr=sc.getBoundingClientRect(),
      x=sr.left-tr.left+SW/2,y=sr.top-tr.top+SY+50*SS,d=STORY*SS*(1+.015*Math.sin(sec*1.1)),
      /* a square of whole device pixels round the largest the sun gets, at the same pixel grid as the full screen */
      side=Math.ceil(STORY*SS*1.02*dp)+12,bx=Math.round(DEV.snap(x-side/2/dp,dp)*dp),by=Math.round(DEV.snap(y-side/2/dp,dp)*dp);
    if(top.width!==side||top.height!==side||top._dp!==dp){top.width=top.height=side;top._dp=dp;top.style.width=top.style.height=(side/dp)+'px'}
    top.style.transform='translate('+(bx/dp)+'px,'+(by/dp)+'px)';
    tg.setTransform(1,0,0,1,0,0);tg.fillStyle='#000';tg.fillRect(0,0,side,side);
    tg.setTransform(dp,0,0,dp,-bx,-by);put(tg,x,y,d,1);drew=performance.now()}
  PT.e('sun',p0);return r};
/* clear the layer when the story city is not being drawn (home page, between screens) */
(function idle(){if(performance.now()-drew>300&&top.width){top.width=0}requestAnimationFrame(idle)})();
return{
  ready(){return ok},
  draw(g,x,y,s,t,a){if(!ok)return false;if(a===undefined)a=1;if(a<=0)return true;put(g,x,y,MOON*SIZE*s*(1+.015*Math.sin(t*1.1)),a);return true},
  drawAt(g,x,y,d,t){if(ok)put(g,x,y,d*(1+.015*Math.sin(t*1.1)),1)}};
})();
