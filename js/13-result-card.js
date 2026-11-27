/* ===== result: the tribe shown as a collectible card that you can tilt and spin ===== */
(function(){
const st=document.createElement('style');st.textContent=`
.rscene{perspective:900px;display:flex;justify-content:center;margin:6px 0 10px;touch-action:pan-y}
.rcard{--ry:0deg;--rx:0deg;--sh:50%;position:relative;width:min(74vw,290px);aspect-ratio:3/4;transform-style:preserve-3d;transform:rotateY(var(--ry)) rotateX(var(--rx));cursor:grab;filter:drop-shadow(0 18px 24px rgba(0,0,0,.5));-webkit-user-select:none;user-select:none}
.rcard:active{cursor:grabbing}
.rface,.rback{position:absolute;inset:0;border-radius:16px;overflow:hidden;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.rface canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.rback{transform:rotateY(180deg);display:flex;align-items:center;justify-content:center}
.rback canvas{position:absolute;inset:0;width:100%;height:100%}
.rback i{position:relative;font-style:normal;font-size:54px;color:#fff6dc;text-shadow:0 0 22px #ffe9a8}
.rplate{position:absolute;left:6%;right:6%;bottom:4.5%;padding:12px 10px 13px;border-radius:14px;background:#fff;color:#111;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.rplate h2{margin:0;font-size:clamp(17px,5.6vw,23px);line-height:1.25;font-weight:700;color:#111!important}
.rplate small{display:block;margin-top:3px;font-size:11px;color:#666;letter-spacing:.04em}
.rsheen{position:absolute;inset:0;border-radius:16px;pointer-events:none;mix-blend-mode:soft-light;background:linear-gradient(112deg,transparent calc(var(--sh) - 22%),rgba(255,255,255,.75) var(--sh),transparent calc(var(--sh) + 22%))}
@media (prefers-reduced-motion:reduce){.rsheen{display:none}}`;document.head.appendChild(st);
const rgb2=h=>{const c=hx(h);return c};
const mixh=(a,b,t)=>{const A=hx(a),B=hx(b);return A.map((v,i)=>Math.round(v+(B[i]-v)*t))};
function field(x,y,k){return Math.sin(x*.045*k+2*Math.sin(y*.03*k))+Math.sin(y*.05*k+2*Math.sin(x*.035*k+1))+Math.sin((x*.6+y)*.03*k+1.3)}
function pattern(c,w,h,k,dark,light,soft){const im=c.createImageData(w,h),d=im.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=Math.max(0,Math.min(1,(field(x,y,k)-.2)*(soft?1.4:7)+(soft?.5:0)));const i=(y*w+x)*4;d[i]=dark[0]+(light[0]-dark[0])*v;d[i+1]=dark[1]+(light[1]-dark[1])*v;d[i+2]=dark[2]+(light[2]-dark[2])*v;d[i+3]=255}
  c.putImageData(im,0,0)}
function paintFace(cv,ms,key,imgEl){
  const W=300,H=400,d=2;cv.width=W*d;cv.height=H*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);
  const col=ms.map(m=>MJ[m].c),c0=col[0],mid=ms.length>1?mixh(col[0],col[1],.5):hx(c0);
  const dark=mixh('#'+mid.map(v=>v.toString(16).padStart(2,'0')).join(''),'#16181d',.62),light=[246,247,246];
  // frame pattern, crisp
  const t=document.createElement('canvas');t.width=W;t.height=H;const tc=t.getContext('2d');pattern(tc,W,H,1,dark,light,false);c.drawImage(t,0,0);
  // inner window: soft, blurred pattern
  const ix=16,iy=16,iw=W-32,ih=H*.71;c.save();c.beginPath();c.roundRect?c.roundRect(ix,iy,iw,ih,12):c.rect(ix,iy,iw,ih);c.clip();
  const sm=document.createElement('canvas');sm.width=38;sm.height=50;pattern(sm.getContext('2d'),38,50,5.5,mixh('#'+mid.map(v=>v.toString(16).padStart(2,'0')).join(''),'#222831',.7),[236,240,238],true);
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(sm,ix,iy,iw,ih);
  if(imgEl){const r=Math.max(iw/imgEl.width,ih/imgEl.height),w=imgEl.width*r,h=imgEl.height*r;c.drawImage(imgEl,ix+(iw-w)/2,iy+(ih-h)/2,w,h)}
  else{
    const g=c.createRadialGradient(W/2,iy+ih*.58,6,W/2,iy+ih*.58,iw*.62);g.addColorStop(0,'rgba('+hx(c0).join(',')+',.75)');g.addColorStop(1,'rgba('+hx(c0).join(',')+',0)');c.fillStyle=g;c.fillRect(ix,iy,iw,ih);
    // original guide figure + tribe items, drawn in code
    const old=sx,oS=SAT;sx=c;SAT=1;
    for(let i=0;i<14;i++){const a=hash(i,4,2)*6.28,r=40+hash(i,2,9)*95;sparkle(c,W/2+Math.cos(a)*r,iy+ih*.45+Math.sin(a)*r*.8,1.6+hash(i,1,1)*2.4,'#fff6dc')}
    hero(W/2,iy+ih-8,6.2,1,0,0,c0);
    ci('#fff6dc',W/2-11,iy+ih-8-19*6.2,2.4);ci('#fff6dc',W/2+11,iy+ih-8-19*6.2,2.4);
    if(window.__item){if(ms.length>1){window.__item(ms[0],W/2-62,iy+ih-30,3,0,0);window.__item(ms[1],W/2+62,iy+ih-30,3,0,1)}else window.__item(ms[0],W/2+66,iy+ih-34,3.6,0,0)}
    sx=old;SAT=oS}
  const vg=c.createLinearGradient(0,iy+ih*.55,0,iy+ih);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,12,16,.55)');c.fillStyle=vg;c.fillRect(ix,iy,iw,ih);
  c.restore();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(ix,iy,iw,ih,12):c.rect(ix,iy,iw,ih);c.stroke()}
function paintBack(cv,m){const W=300,H=400;cv.width=W;cv.height=H;const c=cv.getContext('2d');const dk=mixh(MJ[m].c,'#14161b',.7);pattern(c,W,H,1.2,dk,mixh(MJ[m].c,'#14161b',.45),false)}
function init(){
  const card=document.getElementById('rcard');if(!card||card.dataset.on)return;card.dataset.on=1;
  const ms=S.result.m,key=ms.join('-');paintFace(card.querySelector('.rface canvas'),ms,key,null);paintBack(card.querySelector('.rback canvas'),ms[0]);
  const im=new Image();im.onload=()=>paintFace(card.querySelector('.rface canvas'),ms,key,im);im.src='images/result-'+key+'.png';
  let ry=reduce?0:172,rx=0,tx=0,ty=0,drag=false,lx=0,ly=0,vx=0,off=0,t0=performance.now();
  card.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.rchars img'))return;drag=true;lx=e.clientX;ly=e.clientY;card.setPointerCapture&&card.setPointerCapture(e.pointerId)});
  card.addEventListener('pointermove',e=>{if(!drag)return;off+=(e.clientX-lx)*.9;ty=Math.max(-22,Math.min(22,ty-(e.clientY-ly)*.3));lx=e.clientX;ly=e.clientY});
  const up=()=>{drag=false};card.addEventListener('pointerup',up);card.addEventListener('pointercancel',up);
  (function loop(now){if(!document.body.contains(card))return;const t=(now-t0)/1000;
    if(!drag){off*=.94;ty*=.92}
    const idle=reduce?0:Math.sin(t*.9)*16,tgt=(t<1.4&&!reduce?0:idle)+off;ry+=(tgt-ry)*(t<1.4?.07:.14);rx+=(ty-rx)*.15;
    card.style.setProperty('--ry',ry.toFixed(2)+'deg');card.style.setProperty('--rx',rx.toFixed(2)+'deg');card.style.setProperty('--sh',(50+Math.sin(ry*Math.PI/180)*70).toFixed(1)+'%');
    requestAnimationFrame(loop)})(t0)}
const _rh=window.resultHTML;
window.resultHTML=function(){let h=_rh.apply(this,arguments);
  h=h.replace(/<h2 class="res-title"([^>]*)>([\s\S]*?)<\/h2>/,(m0,at,title)=>'<div class="rscene"><div class="rcard" id="rcard" role="img" aria-label="การ์ดผลของเธอ: '+title.replace(/<[^>]*>/g,'')+'"><div class="rface"><canvas></canvas><div class="rplate"><h2 class="res-title"'+at+'>'+title+'</h2></div><div class="rsheen"></div></div><div class="rback"><canvas></canvas><i>✦</i></div></div></div>');
  return h};
const _r=window.render;window.render=function(){_r.apply(this,arguments);if(S.stage==='result')setTimeout(init,0)};
})();
