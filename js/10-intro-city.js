/* ===== intro: the water city floats. layered cut-outs of the artwork drift, sway and breathe; follows your finger/mouse; tap = ripple; start = fly into the river ===== */
(function(){
const st=document.createElement('style');st.textContent=`#gal{position:absolute;inset:0;width:100%;height:100%;opacity:0;visibility:hidden;transition:opacity .7s ease,visibility 0s linear .7s;pointer-events:none}
body.gal #gal{opacity:1;visibility:visible;transition:opacity .7s ease}body.gal #app{touch-action:pan-y;padding-top:50vh}
body.gal .foot,body.gal .foot button{color:#c9d3d3}`;document.head.appendChild(st);
const gal=document.createElement('canvas');gal.id='gal';gal.setAttribute('aria-hidden','true');document.querySelector('.stage').appendChild(gal);const g=gal.getContext('2d');
const LY={"core": ["images/gal-core.webp", [354, 56, 363, 602]], "left": ["images/gal-left.webp", [101, 30, 296, 628]], "right": ["images/gal-right.webp", [674, 141, 187, 517]], "moon": ["images/gal-moon.webp", [489, 122, 83, 84]], "shards": [["images/gal-shard-1.webp", [940, 59, 40, 108]], ["images/gal-shard-2.webp", [581, 80, 27, 63]], ["images/gal-shard-3.webp", [857, 150, 64, 226]], ["images/gal-shard-4.webp", [453, 152, 23, 58]], ["images/gal-shard-5.webp", [854, 382, 36, 85]]]};
const GL={W:0,H:0,fly:null,fade:0,dark:0,lt:0},CAM={x:0,y:0,tx:0,ty:0,idle:0},SP={y:0,v:0};
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
function rz(){const d=DEV.dpr(innerWidth,innerHeight,1.5);GL.W=innerWidth;GL.H=innerHeight;gal.width=Math.round(GL.W*d);gal.height=Math.round(GL.H*d);g.setTransform(d,0,0,d,0,0)}rz();addEventListener('resize',rz);
/* sprites: city layers fade out at the bottom so the city dissolves into mist instead of being cut off */
const SPR={};let sparks=[];
function load(k,[src,b],fade){const im=new Image();im.onload=()=>{let c=im;
  if(fade){c=document.createElement('canvas');c.width=b[2];c.height=b[3];const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='destination-out';
    const y0=(470-b[1])/b[3],gr=x.createLinearGradient(0,0,0,b[3]);gr.addColorStop(Math.max(0,y0),'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=gr;x.fillRect(0,0,b[2],b[3])}
  SPR[k]={c,x:b[0],y:b[1],w:b[2],h:b[3]};
  if(k==='core'){const x=c.getContext('2d'),dd=x.getImageData(0,0,b[2],b[3]).data,pts=[];
    for(let i=0;i<dd.length;i+=4){if(dd[i+3]>220&&dd[i]*.3+dd[i+1]*.59+dd[i+2]*.11>185)pts.push(i/4)}
    for(let n=0;n<110&&pts.length;n++){const p=pts[Math.floor(Math.random()*pts.length)];sparks.push({x:b[0]+p%b[2],y:b[1]+Math.floor(p/b[2]),ph:Math.random()*6.3,sp:.6+Math.random()*1.6,r:.8+Math.random()*1.8})}}
};im.src=src}
load('core',LY.core,1);load('left',LY.left,1);load('right',LY.right,1);load('moon',LY.moon,0);LY.shards.forEach((s,i)=>load('s'+i,s,0));
const SH=[{d:.55,p:0,a:5,r:.05},{d:.4,p:1.4,a:4,r:.07},{d:1.2,p:2.2,a:7,r:.03},{d:.5,p:3.1,a:4,r:.08},{d:1.0,p:4.3,a:5,r:.05}];
const MIST=document.createElement('canvas');MIST.width=MIST.height=128;{const x=MIST.getContext('2d'),r=x.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(200,225,235,.5)');r.addColorStop(1,'rgba(200,225,235,0)');x.fillStyle=r;x.fillRect(0,0,128,128)}
const STR=Array.from({length:90},()=>({x:Math.random(),y:Math.random()*.85,r:.5+Math.random()*1.2,p:Math.random()*6.3,z:.2+Math.random()*.8}));
const MS=Array.from({length:9},(_,i)=>({x:Math.random(),y:.38+Math.random()*.4,s:.5+Math.random()*.9,v:(.004+Math.random()*.008)*(i%2?1:-1),a:.07+Math.random()*.1,f:i<4}));
const DR=[],RP=[];
/* input: the whole world leans toward the pointer; a tap sends a ripple through the water and a little jolt through the city */
const on=()=>document.body.classList.contains('gal')&&!GL.fly;
function aim(e){CAM.tx=(e.clientX/GL.W-.5)*2;CAM.ty=(e.clientY/GL.H-.4)*1.6;CAM.idle=0}
addEventListener('pointermove',e=>{if(on()&&(e.pointerType==='mouse'||e.buttons))aim(e)});
addEventListener('pointerdown',e=>{if(!on()||e.target.closest('button,input,label,a'))return;aim(e);if(e.clientY<GL.H*.62){RP.push({x:e.clientX,y:e.clientY,t:performance.now()});SP.v-=70;for(let i=0;i<8;i++)DR.push({x:e.clientX+(Math.random()-.5)*30,y:e.clientY+(Math.random()-.5)*20,vx:(Math.random()-.5)*30,vy:-20-Math.random()*40,l:1,r:1+Math.random()*1.5})}},true);
window.galGo=function(cb){if(reduce){cb();return}GL.fly={t0:performance.now(),cb};sfx('whoosh');$s.classList.add('leave')};
window.GL=GL;
function frame(ms){
  const gal_=document.body.classList.contains('gal');
  if(!gal_&&!GL.fade){if(gal.width)gal.width=gal.height=0;requestAnimationFrame(frame);return}   // not on the home page: no memory held
  if(!gal.width)rz();
  if(gal_){GL.fade=1;if(!GL.fly)GL.dark=0}else{GL.fade-=.016;if(GL.fade<0)GL.fade=0}
  const t=ms/1000,dt=Math.min(.05,Math.max(0,(ms-(GL.lt||ms))/1000));GL.lt=ms;const{W,H}=GL;
  let p=0,e=0;
  if(GL.fly){p=Math.min(1,(ms-GL.fly.t0)/1900);e=sm(0,1,p);if(p>.82&&gal_)document.body.classList.remove('gal');if(p>=1){const cb=GL.fly.cb;GL.fly=null;GL.dark=1;cb&&cb()}}
  /* camera: eased toward the pointer, otherwise a slow lazy orbit */
  CAM.idle+=dt;if(CAM.idle>2.5&&!GL.fly){CAM.tx=Math.sin(t*.21)*.55;CAM.ty=Math.cos(t*.16)*.3}
  const k=1-Math.exp(-dt*2.6);CAM.x+=(CAM.tx-CAM.x)*k;CAM.y+=(CAM.ty-CAM.y)*k;
  SP.v+=(-SP.y*38-SP.v*4.2)*dt;SP.y+=SP.v*dt;
  const s=Math.min(W*1.12/880,H*.52/622)*(1+e*1.5),px=540,py=360,
    sx0=W/2+CAM.x*-6*(1-e),sy0=H*.06+(py-34)*s+Math.sin(t*.62)*4*s*(1-e)+SP.y*.12*s*(1-e)-e*H*.02;
  /* sky */
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0820');bg.addColorStop(.55,'#171236');bg.addColorStop(1,'#241a46');g.fillStyle=bg;g.fillRect(0,0,W,H);if(window.AURORA)AURORA.draw(g,W,H,.85);
  for(const q of STR){const a=.25+.55*Math.abs(Math.sin(t*(.5+q.z)+q.p));g.fillStyle='rgba(255,240,215,'+a+')';g.fillRect(q.x*W-CAM.x*q.z*6,q.y*H-CAM.y*q.z*4,q.r,q.r)}
  g.globalCompositeOperation='lighter';
  const M=SPR.moon,mx=sx0+(M?(M.x+M.w/2-px)*s:0)-CAM.x*10*(1-e),my=sy0+(M?(M.y+M.h/2-py)*s:0)-CAM.y*6-Math.sin(t*.45)*5*s-e*H*.2,mr=Math.max(W,H)*(.2+.02*Math.sin(t*.7));
  let gr=g.createRadialGradient(mx,my,0,mx,my,mr);gr.addColorStop(0,'rgba(255,190,120,.42)');gr.addColorStop(.35,'rgba(240,150,90,.14)');gr.addColorStop(1,'rgba(240,150,90,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  /* moonlight falling over the city */
  g.save();g.translate(mx,my);const wob=Math.sin(t*.3)*.04;g.rotate(wob);gr=g.createLinearGradient(0,0,0,H*.7);gr.addColorStop(0,'rgba(255,205,150,.13)');gr.addColorStop(1,'rgba(255,205,150,0)');g.fillStyle=gr;g.beginPath();g.moveTo(-14,0);g.lineTo(14,0);g.lineTo(W*.32,H*.7);g.lineTo(-W*.32,H*.7);g.fill();g.restore();
  g.globalCompositeOperation='source-over';
  /* the sun: animated sprite from js/18-sun.js; falls back to the old moon picture until it has loaded */
  if(window.SUN&&SUN.draw(g,mx,my+e*H*.2,s/(1+e*1.5),t,Math.max(0,1-e*1.8))){}  /* on start: the sun stays put and fades out */
  else if(M){g.save();g.translate(mx,my);g.scale(s*(1+.012*Math.sin(t*1.1)),s*(1+.012*Math.sin(t*1.1)));g.drawImage(M.c,-M.w/2,-M.h/2,M.w,M.h);g.restore()}
  /* back mist */
  const mist=b=>{for(const m of MS){if(m.f!==b)continue;const x=((m.x+t*m.v)%1.4+1.4)%1.4-.2,w=W*(.7*m.s),y=m.y*H+Math.sin(t*.3+m.x*9)*6;g.globalAlpha=m.a*(1-e*.6);g.drawImage(MIST,x*W-w/2,y-w*.2,w,w*.4)}g.globalAlpha=1};
  mist(true);
  /* far shards: each drifts on its own breath */
  SH.forEach((h,i)=>{const S=SPR['s'+i];if(!S)return;const dx=CAM.x*-14*h.d+Math.sin(t*.5+h.p)*3,dy=CAM.y*-8*h.d+Math.sin(t*.8+h.p)*h.a-e*40*h.d;
    g.save();g.translate(sx0+(S.x+S.w/2-px)*s+dx*s*.8,sy0+(S.y+S.h/2-py)*s+dy*s*.8);g.rotate(Math.sin(t*.6+h.p)*h.r);g.scale(s,s);g.globalAlpha=1;g.drawImage(S.c,-S.w/2,-S.h/2,S.w,S.h);g.restore()});
  /* soft water-glow under the city */
  const C=SPR.core;
  g.globalCompositeOperation='lighter';gr=g.createRadialGradient(sx0,sy0+300*s,0,sx0,sy0+300*s,360*s);gr.addColorStop(0,'rgba(120,200,210,'+(.16+.05*Math.sin(t*.9))+')');gr.addColorStop(1,'rgba(120,200,210,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
  /* the city: one group that sways; the two pillar clusters ride slightly apart so it reads as separate floating slabs */
  g.save();g.translate(sx0,sy0);g.rotate(Math.sin(t*.38)*.011+CAM.x*.012);g.scale(s,s);g.translate(-px,-py);
  if(C)g.drawImage(C.c,C.x,C.y);
  const L=SPR.left,R=SPR.right;
  if(L){const ox=CAM.x*-7-e*160,oy=CAM.y*-4+Math.sin(t*.7+1.3)*3.2;g.save();g.translate(250,520);g.rotate(Math.sin(t*.45+.6)*.006);g.translate(-250+ox,-520+oy);g.drawImage(L.c,L.x,L.y);g.restore()}
  if(R){const ox=CAM.x*-9+e*160,oy=CAM.y*-5+Math.sin(t*.66+3.1)*3.6;g.save();g.translate(780,520);g.rotate(Math.sin(t*.41+2.4)*.006);g.translate(-780+ox,-520+oy);g.drawImage(R.c,R.x,R.y);g.restore()}
  /* river glitter: twinkles where the artwork is bright, follows the city */
  g.globalCompositeOperation='lighter';
  for(const q of sparks){const a=Math.pow(Math.max(0,Math.sin(t*q.sp+q.ph)),6);if(a<.04)continue;g.globalAlpha=a*(.7+e);g.fillStyle='#fff6df';const r=q.r*(1+a);g.fillRect(q.x-r*3,q.y-.5,r*6,1);g.fillRect(q.x-.5,q.y-r*3,1,r*6)}
  g.globalAlpha=1;g.restore();g.globalCompositeOperation='source-over';
  /* drops: water falling off the underside of the floating city, and light dust rising */
  if(!reduce&&!GL.fly&&Math.random()<dt*7&&C)DR.push({x:sx0+(Math.random()-.5)*340*s,y:sy0+(612-py)*s,vx:(Math.random()-.5)*6,vy:12+Math.random()*26,l:1,r:.8+Math.random()*1.8,d:1});
  g.globalCompositeOperation='lighter';
  for(let i=DR.length-1;i>=0;i--){const d=DR[i];d.l-=dt*(d.d?.45:.9);d.x+=d.vx*dt+Math.sin(t*2+i)*.1;d.y+=d.vy*dt;if(!d.d)d.vy+=90*dt;if(d.l<=0||d.y>H){DR.splice(i,1);continue}
    g.fillStyle='rgba(190,235,245,'+Math.min(.7,d.l*.7)+')';g.beginPath();g.ellipse(d.x,d.y,d.r*.8,d.r*(d.d?1.9:1.2),0,0,7);g.fill()}
  /* ripples */
  const now=performance.now();
  for(let i=RP.length-1;i>=0;i--){const q=RP[i],u=(now-q.t)/1600;if(u>=1){RP.splice(i,1);continue}
    for(let j=0;j<3;j++){const v=u-j*.12;if(v<=0)continue;g.strokeStyle='rgba(200,240,245,'+(.5*(1-v)*(1-v))+')';g.lineWidth=1.4;g.beginPath();g.ellipse(q.x,q.y,10+v*110,(10+v*110)*.38,0,0,7);g.stroke()}}
  g.globalCompositeOperation='source-over';
  /* front mist slides across the foot of the city */
  mist(false);
  /* keep the card readable */
  const vg=g.createLinearGradient(0,H*.44,0,H);vg.addColorStop(0,'rgba(8,10,24,0)');vg.addColorStop(.5,'rgba(8,10,24,.8)');vg.addColorStop(1,'rgba(8,10,24,.95)');g.fillStyle=vg;g.fillRect(0,H*.44,W,H*.56);
  const dk=GL.dark?1:Math.pow(sm(.62,1,p),1.4);if(dk>0){g.fillStyle='rgba(14,10,34,'+dk+')';g.fillRect(0,0,W,H)}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();
