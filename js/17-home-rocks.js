/* ===== home page: big crystal rock columns framing the floating city on both sides =====
   Its own canvas inside .stage, so it is always behind the text card: it can never cover text or the start button.
   Shown only on the home page (body.gal) and fades with it. Each column floats, sways and leans toward the pointer.
   Tweak: PC / PHONE lists = [image, x, y, height, flip, depth]. x is a fraction of the free space beside the
   game column on PC (0 = screen edge, 1 = next to the card), or of screen width on phones; y and height are fractions of screen height. */
(function(){
const SRC={L:'images/gal-left.webp',R:'images/gal-right.webp',S3:'images/gal-shard-3.webp',S1:'images/gal-shard-1.webp',S5:'images/gal-shard-5.webp'},IMG={};
/* the two big cut-outs end in a flat edge: fade their bottom third out so they read as floating */
const FADE={L:1,R:1};
Object.keys(SRC).forEach(k=>{const im=new Image();im.onload=()=>{if(!FADE[k]){IMG[k]=im;return}const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
  x.globalCompositeOperation='destination-out';const gr=x.createLinearGradient(0,im.height*.62,0,im.height);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=gr;x.fillRect(0,0,im.width,im.height);
  c.naturalWidth=im.width;c.naturalHeight=im.height;IMG[k]=c};im.src=SRC[k]});
const MIRROR={L:'R',R:'L'};
const PC=[['L',.42,.33,.58,0,.5],['S3',.84,.64,.40,0,.9],['S5',.16,.76,.30,1,.7],['S1',.72,.13,.14,1,.3]];
const PHONE=[['R',-.02,.30,.42,1,.6],['S3',1.0,.33,.40,0,.6],['S1',.06,.60,.16,0,.3],['S5',.95,.62,.14,1,.3]];
const st=document.createElement('style');st.textContent='#homerocks{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;visibility:hidden;transition:opacity .7s ease,visibility 0s linear .7s}body.gal #homerocks{opacity:1;visibility:visible;transition:opacity .7s ease}';document.head.appendChild(st);
const cvs=document.createElement('canvas');cvs.id='homerocks';cvs.setAttribute('aria-hidden','true');document.querySelector('.stage').appendChild(cvs);
const g=cvs.getContext('2d');let HW=0,HH=0,fade=0,lx=0,ly=0,tx=0,ty=0;
function rz(){const d=DEV.dpr(innerWidth,innerHeight,1.5);HW=innerWidth;HH=innerHeight;cvs.width=Math.round(HW*d);cvs.height=Math.round(HH*d);g.setTransform(d,0,0,d,0,0)}
rz();addEventListener('resize',rz);
addEventListener('pointermove',e=>{tx=(e.clientX/HW-.5)*2;ty=(e.clientY/HH-.5)*2});
function col(c,im,x,y,h,flip,d,t,i){
  const w=h*im.naturalWidth/im.naturalHeight,bob=Math.sin(t*(.35+d*.25)+i*1.7)*(6+10*d)*BG,rot=Math.sin(t*.3+i)*.012*BG;
  c.save();c.translate(x-lx*14*d,y+bob-ly*8*d);c.rotate(rot);if(flip)c.scale(-1,1);
  c.globalAlpha=.75+d*.25;c.drawImage(im,-w/2,-h/2,w,h);
  c.globalCompositeOperation='lighter';const gl=(.16+.08*Math.sin(t*1.1+i))*(.6+d*.4),gr=c.createRadialGradient(0,h*.45,0,0,h*.45,w*.7);
  gr.addColorStop(0,'rgba(240,244,255,'+gl+')');gr.addColorStop(1,'rgba(240,244,255,0)');c.fillStyle=gr;c.fillRect(-w,h*.15,w*2,h*.6);
  c.restore();c.globalCompositeOperation='source-over';c.globalAlpha=1}
function frame(ms){const p0=PT.b();if(!PT.off('home'))frame0(ms);PT.e('home',p0);requestAnimationFrame(frame)}
function frame0(ms){
  const on=document.body.classList.contains('gal');fade=on?1:Math.max(0,fade-.02);
  if(on&&!cvs.width)rz();else if(!on&&fade<=0&&cvs.width){cvs.width=cvs.height=0;return}   // not on the home page: no memory held
  if(on||fade>0){const t=ms/1000;lx+=(tx-lx)*.04;ly+=(ty-ly)*.04;g.clearRect(0,0,HW,HH);
    const wide=HW>=700,list=wide?PC:PHONE,cw=Math.min(460,HW),side=HW/2-cw/2+40;
    list.forEach((p,i)=>{const im=IMG[p[0]];if(!im||!im.naturalWidth)return;const im2=IMG[MIRROR[p[0]]||p[0]]||im;const h=HH*p[3],y=HH*p[2];
      if(wide){col(g,im,side*p[1],y,h,p[4],p[5],t,i);if(im2.naturalWidth)col(g,im2,HW-side*p[1],y+HH*.04,h*.94,MIRROR[p[0]]?p[4]:!p[4],p[5],t,i+7)}
      else col(g,im,HW*p[1],y,h,p[4],p[5],t,i)});
  }}
requestAnimationFrame(frame);
})();
