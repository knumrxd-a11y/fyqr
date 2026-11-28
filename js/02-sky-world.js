/* ---------- sky world (from the storyboard): floating islands, five orbiting worlds, a sea of clouds, one guiding star ---------- */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let W=0,H=0;
function resize(){const r=cv.getBoundingClientRect(),d=DEV.dpr(r.width,r.height,window.QL>=4?1:innerWidth<600?1.25:1.5);W=r.width;H=r.height;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);if(reduce)draw(0)}
addEventListener('resize',resize);
function rng(s){return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}
const R=rng(11),BLD=[],cam={z:0},M={boost:0,tb:0,kick:0};
let lastT=0,Sb=.12,PCUR=-1,PNEXT=-1,PA=0;
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const rgb=c=>'rgb('+c.map(Math.round).join(',')+')';
const lumc=c=>{const l=(c[0]*.3+c[1]*.59+c[2]*.11)*1.1;return[l,l,l]};
function hash(a,b,c){let h=(a*374761393+b*668265263+c*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return(h>>>0)/4294967296}
const bkc=h=>{const c=hx(h);return mixc(lumc(c),c,Sb)},bk=h=>rgb(bkc(h)),bkA=h=>bkc(h).map(Math.round).join(',');
const guide={x:.5,y:.1,tx:null,ty:null},parts=[];
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;guide.tx=.5+(e.clientX/innerWidth-.5)*.2;guide.ty=.1+(e.clientY/innerHeight-.5)*.05});
function prog(){return S.stage==='result'||S.stage==='pass'?1:S.picks.filter(Boolean).length/11}
function target(b){
  if(S.stage==='result')return 1;
  const m=ORDER[b.m],mx=Math.max(1,...Object.values(S.w));
  const share=S.w[m]/mx;const any=Object.values(S.w).some(v=>v>0);
  return any?Math.min(1,prog()*.42+share*.58):0;
}
const PCOL=['#9A7BFF','#F25AA6','#F59A3B','#3BCB7E','#4BA3F5'],PNAME=['ย่านดีไซน์','ย่านศิลป์','ย่านภาพยนตร์','ย่านเกม','ย่านบันเทิง'],MUR=['#F25AA6','#FFD166','#4BE3C1','#9A7BFF'];
function placeNow(){if(S.stage==='alley')return ORDER.indexOf(S.alley[S.ai]);if(S.stage==='result'&&S.result)return ORDER.indexOf(S.result.m[0]);const p=S.picks.filter(Boolean);return p.length?ORDER.indexOf(p[p.length-1]):-1}
function showPlace(k){}

/* shared shape helpers (used by the sky and by the scene vignettes) */
function sparkle(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.moveTo(x,y-r*1.7);c.quadraticCurveTo(x+r*.18,y-r*.18,x+r*1.7,y);c.quadraticCurveTo(x+r*.18,y+r*.18,x,y+r*1.7);c.quadraticCurveTo(x-r*.18,y+r*.18,x-r*1.7,y);c.quadraticCurveTo(x-r*.18,y-r*.18,x,y-r*1.7);c.fill()}
function isl(c,col,x,y,w,sd,lit){
  const rr=rng(sd+5),h=w*.34;
  c.fillStyle=col('#06222a');c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.lineTo(x+w*.18,y+h*.55);c.lineTo(x+w*.02,y+h);c.lineTo(x-w*.2,y+h*.5);c.closePath();c.fill();
  const n=Math.max(3,Math.floor(w/9));
  for(let i=0;i<n;i++){const bx=x-w/2+(i+.5)*w/n+(rr()-.5)*3,bw=w/n*.7,bh=w*(.09+rr()*.26)*(i%3===1?1.5:1);
    c.fillStyle=col('#0a2f38');c.fillRect(bx-bw/2,y-bh,bw,bh);
    if(rr()<.5){c.beginPath();c.moveTo(bx-bw/2,y-bh);c.lineTo(bx,y-bh-bw*1.4);c.lineTo(bx+bw/2,y-bh);c.fill()}
    if(rr()<lit){c.fillStyle=col('#ffd98a');c.fillRect(bx-1,y-bh*.6,2,2.5)}}
  c.fillStyle=col('#2a7a78');c.fillRect(x-w/2,y-1,w,1.6);
}
function planetG(c,a,x,y,r,ring){
  if(ring){c.strokeStyle=rgb(mixc(a,[255,255,255],.35));c.globalAlpha=.7;c.lineWidth=Math.max(.6,r*.1);c.beginPath();c.ellipse(x,y,r*1.7,r*.45,-.3,3.14,6.28);c.stroke();c.globalAlpha=1}
  const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r*1.05);g.addColorStop(0,rgb(mixc(a,[255,250,230],.5)));g.addColorStop(.65,rgb(a));g.addColorStop(1,rgb(a.map(v=>v*.32)));
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.fillStyle='rgba(8,30,40,.22)';[[.3,.2,.22],[-.35,.35,.16],[.1,-.45,.12]].forEach(k=>{c.beginPath();c.arc(x+k[0]*r,y+k[1]*r,k[2]*r,0,7);c.fill()});
  if(ring){c.strokeStyle=rgb(mixc(a,[255,255,255],.35));c.globalAlpha=.8;c.lineWidth=Math.max(.6,r*.1);c.beginPath();c.ellipse(x,y,r*1.7,r*.45,-.3,0,3.14);c.stroke();c.globalAlpha=1}
}

const STARS=Array.from({length:130},()=>({x:R(),y:R(),r:.5+R()*1.3,p:R()*6.28,z:.2+R()*.8}));
const NEB=[{x:.2,y:.25,r:.6,c:'#5a3aa8'},{x:.85,y:.5,r:.55,c:'#3a4ac0'},{x:.4,y:.85,r:.65,c:'#7a3a9a'}];
const PLN=ORDER.map((k,i)=>{const o={m:i,cur:0,flash:0,a:i/5*6.283,sp:.035+i*.006,r:10+((i*7)%4)*2.5};BLD.push(o);return o});
const ISLS=Array.from({length:7},(_,i)=>({x:R(),y:.2+R()*.42,w:46+R()*90,z:.3+R()*.7,sd:Math.floor(R()*999),sp:(R()<.5?-1:1)*(2+R()*5),lit:R()}));
ISLS.sort((a,b)=>a.z-b.z);
const CLD=Array.from({length:28},()=>({x:R()*1.2-.1,y:.7+R()*.35,r:30+R()*60,z:.3+R()*.7,c:R()<.5?0:1}));
const NZ=document.createElement('canvas');NZ.width=NZ.height=200;
{const g=NZ.getContext('2d'),im=g.createImageData(200,200);for(let i=0;i<im.data.length;i+=4){im.data[i]=im.data[i+1]=im.data[i+2]=R()*255;im.data[i+3]=255}g.putImageData(im,0,0);NZ.im=im}   // NZ.im: the same pixels, for js/23 (no read-back from the canvas)
let NP=null,GJ=[0,0],FR=0;
