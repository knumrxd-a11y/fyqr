/* ---------- city art: gray night city; each tower regains the colour of its district ---------- */
const CITYSRC='images/city.webp';
let CL=null;const CI=new Image();
function hueOf(c){const[r,g,b]=c.map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return(h*60+360)%360}
CI.onload=()=>{const w=CI.width,h=CI.height,mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c},sc0=mk(),sg=sc0.getContext('2d');sg.drawImage(CI,0,0);
  const d=sg.getImageData(0,0,w,h).data,gr=mk(),gx=gr.getContext('2d'),gi=gx.createImageData(w,h),TH=ORDER.map(k=>hueOf(hx(MJ[k].c)));
  const L=Array.from({length:6},()=>{const c=mk(),g=c.getContext('2d');return{c,g,i:g.createImageData(w,h)}});
  for(let p=0;p<d.length;p+=4){const a=d[p+3];if(!a)continue;const r=d[p],g=d[p+1],b=d[p+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),lum=(r*.3+g*.59+b*.11)*.78;
    gi.data[p]=gi.data[p+1]=gi.data[p+2]=lum;gi.data[p+3]=a;
    let k=5;if(mx&&(mx-mn)/mx>.28){const hh=hueOf([r,g,b]);let best=1e9;TH.forEach((t,i)=>{const e=Math.min(Math.abs(hh-t),360-Math.abs(hh-t));if(e<best){best=e;k=i}})}
    const q=L[k].i.data;q[p]=r;q[p+1]=g;q[p+2]=b;q[p+3]=a}
  gx.putImageData(gi,0,0);L.forEach(l=>l.g.putImageData(l.i,0,0));CL={gr,L,w,h};try{CL.comps=buildComps(d,w,h,TH)}catch(e){CL.comps=null}};
/* split the collage into its separate pieces (towers, shards, moons...) so each can drift on its own depth */
function buildComps(d,w,h,TH){
  const N=w*h,cls=new Uint8Array(N).fill(255);
  for(let q=0;q<N;q++){const o=q*4;if(d[o+3]<8)continue;const r=d[o],g=d[o+1],b=d[o+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);let k=5;
    if(mx&&(mx-mn)/mx>.28){const hh=hueOf([r,g,b]);let best=1e9;TH.forEach((t,i)=>{const e=Math.min(Math.abs(hh-t),360-Math.abs(hh-t));if(e<best){best=e;k=i}})}cls[q]=k}
  const gw=(w+1)>>1,gh=(h+1)>>1;let gc=new Uint8Array(gw*gh).fill(255);
  for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const cnt=[0,0,0,0,0,0];let n=0;for(let j=0;j<2;j++)for(let i=0;i<2;i++){const xx=x*2+i,yy=y*2+j;if(xx<w&&yy<h){const v=cls[yy*w+xx];if(v<6){cnt[v]++;n++}}}
    if(n>=2){let bk=0;for(let i=1;i<6;i++)if(cnt[i]>cnt[bk])bk=i;gc[y*gw+x]=bk}}
  for(let it=0;it<3;it++){const nx=gc.slice();for(let y=1;y<gh-1;y++)for(let x=1;x<gw-1;x++){const i=y*gw+x;if(gc[i]===255)continue;const cnt=[0,0,0,0,0,0];for(let j=-1;j<=1;j++)for(let k2=-1;k2<=1;k2++){const v=gc[i+j*gw+k2];if(v<6)cnt[v]++}
    let bk=gc[i];for(let k3=0;k3<6;k3++)if(cnt[k3]>cnt[bk])bk=k3;nx[i]=bk}gc=nx}
  const lab=new Int32Array(gw*gh).fill(-1),area=[],sy=[],ck=[],qu=new Int32Array(gw*gh);let nl=0;
  for(let i0=0;i0<gw*gh;i0++){if(gc[i0]===255||lab[i0]>=0)continue;let a=0,sum=0,qh=0,qt=0;qu[qt++]=i0;lab[i0]=nl;
    while(qh<qt){const i=qu[qh++],x=i%gw,y=(i/gw)|0;a++;sum+=y;
      if(x>0&&lab[i-1]<0&&gc[i-1]===gc[i0]){lab[i-1]=nl;qu[qt++]=i-1}if(x<gw-1&&lab[i+1]<0&&gc[i+1]===gc[i0]){lab[i+1]=nl;qu[qt++]=i+1}
      if(y>0&&lab[i-gw]<0&&gc[i-gw]===gc[i0]){lab[i-gw]=nl;qu[qt++]=i-gw}if(y<gh-1&&lab[i+gw]<0&&gc[i+gw]===gc[i0]){lab[i+gw]=nl;qu[qt++]=i+gw}}
    area.push(a);sy.push(sum/a*2);ck.push(gc[i0]);nl++}
  const order=area.map((a,i)=>i).filter(i=>area[i]>=45).sort((a,b)=>area[b]-area[a]).slice(0,44),map=new Int32Array(nl).fill(0);order.forEach((li,j)=>map[li]=j+1);
  const nc=order.length+1,minx=new Int32Array(nc).fill(1e9),miny=new Int32Array(nc).fill(1e9),maxx=new Int32Array(nc).fill(-1),maxy=new Int32Array(nc).fill(-1),cnt=new Int32Array(nc),own=new Uint8Array(N);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=y*w+x;if(cls[q]===255)continue;const cx=x>>1,cy=y>>1;let l=lab[cy*gw+cx];
    if(l<0){outer:for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const xx=cx+i,yy=cy+j;if(xx>=0&&yy>=0&&xx<gw&&yy<gh&&lab[yy*gw+xx]>=0){l=lab[yy*gw+xx];break outer}}}
    const id=l<0?0:map[l];own[q]=id;cnt[id]++;if(x<minx[id])minx[id]=x;if(x>maxx[id])maxx[id]=x;if(y<miny[id])miny[id]=y;if(y>maxy[id])maxy[id]=y}
  const comps=[],maxA=Math.max(...order.map(l=>area[l]));
  for(let id=0;id<nc;id++){if(!cnt[id])continue;const bw=maxx[id]-minx[id]+1,bh=maxy[id]-miny[id]+1,mk=()=>{const c=document.createElement('canvas');c.width=bw;c.height=bh;return c},gr=mk(),co=mk(),gg=gr.getContext('2d'),cg=co.getContext('2d'),gi=gg.createImageData(bw,bh),ci2=cg.createImageData(bw,bh);
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){const q=(y+miny[id])*w+x+minx[id];if(own[q]!==id||cls[q]===255)continue;const o=q*4,t=(y*bw+x)*4,lum=(d[o]*.3+d[o+1]*.59+d[o+2]*.11)*.78;
      gi.data[t]=gi.data[t+1]=gi.data[t+2]=lum;gi.data[t+3]=d[o+3];ci2.data[t]=d[o];ci2.data[t+1]=d[o+1];ci2.data[t+2]=d[o+2];ci2.data[t+3]=d[o+3]}
    gg.putImageData(gi,0,0);cg.putImageData(ci2,0,0);
    const li=id?order[id-1]:-1,ar=id?area[li]/maxA:1,cyc=(miny[id]+bh/2)/h,k=id?ck[li]:5,dep=id?Math.max(.08,Math.min(1,.12+.5*cyc+.45*Math.sqrt(ar)+(Math.sin(id*12.9898)*.5)*.18)):.5;
    comps.push({k,x:minx[id],y:miny[id],w:bw,h:bh,gr,co,d:dep,ph:id*1.913,amp:id?3+16*(1-Math.sqrt(ar)):2,rot:id?.004+.02*(1-Math.sqrt(ar)):0,base:!id})}
  comps.sort((a,b)=>a.d-b.d);return comps}
CI.src=CITYSRC;
function cityBox(W,H,bo,fx){const w=CL.w,h=CL.h,s=Math.min(W*1.25/w,H*.56/h)*(1+bo*.07),bw=w*s,bh=h*s;return{s,bw,bh,x:W/2-bw/2+(guide.x-.5)*W*.05*fx,y:H*.62-bh}}
function cityDraw(sec,bo,pr){
  if(!CL)return;const c=ctx,B=cityBox(W,H,bo,1),fl=Math.sin(sec*.4)*3,y=B.y+fl;
  const gl=c.createRadialGradient(W/2,y+B.bh*.5,0,W/2,y+B.bh*.5,B.bw*.7);gl.addColorStop(0,'rgba(120,90,220,.28)');gl.addColorStop(1,'rgba(120,90,220,0)');c.fillStyle=gl;c.fillRect(0,0,W,H);
  if(CL.comps){const s=B.s;
    for(const o of CL.comps){const d=o.d,ph=o.ph,ox=Math.sin(sec*.27+ph)*o.amp*s*.8+SCAM.x*W*(d-.5)*.7+(guide.x-.5)*W*.05*(d-.3),oy=Math.sin(sec*.41+ph*1.7)*o.amp*s+SCAM.y*H*(d-.5)*.45,zc=1+(SCAM.z-1)*(d-.5)*.55+bo*.04*d,
      kc=o.k<5?Math.min(1,PLN[o.k].cur+PLN[o.k].flash*.4):Math.min(1,pr*.95),fl=o.k<5?PLN[o.k].flash:0;
      c.save();c.translate(B.x+(o.x+o.w/2)*s+ox,y+(o.y+o.h/2)*s+oy);c.rotate(Math.sin(sec*.3+ph)*o.rot);c.scale(zc,zc);
      const dw=o.w*s,dh=o.h*s;c.drawImage(o.gr,-dw/2,-dh/2,dw,dh);
      if(kc>.01){c.globalAlpha=kc;c.drawImage(o.co,-dw/2,-dh/2,dw,dh)}
      if(fl>.05){c.globalCompositeOperation='lighter';c.globalAlpha=fl*.45;c.drawImage(o.co,-dw/2,-dh/2,dw,dh)}
      c.restore()}
    c.globalCompositeOperation='source-over';c.globalAlpha=1}
  else{
  c.drawImage(CL.gr,B.x,y,B.bw,B.bh);
  PLN.forEach((p,i)=>{const a=Math.min(1,p.cur+p.flash*.4);if(a<.01)return;c.globalAlpha=a;c.drawImage(CL.L[i].c,B.x,y,B.bw,B.bh)});
  c.globalAlpha=Math.min(1,pr*.95);c.drawImage(CL.L[5].c,B.x,y,B.bw,B.bh);
  c.globalCompositeOperation='lighter';PLN.forEach((p,i)=>{if(p.flash>.05){c.globalAlpha=p.flash*.45;c.drawImage(CL.L[i].c,B.x,y,B.bw,B.bh)}});
  c.globalCompositeOperation='source-over';c.globalAlpha=1}
  const f=c.createLinearGradient(0,y+B.bh*.62,0,y+B.bh+8);f.addColorStop(0,'rgba(10,7,26,0)');f.addColorStop(1,'rgba(10,7,26,.97)');c.fillStyle=f;c.fillRect(-W,y+B.bh*.62,W*3,H*3);
}
function cityBack(g,W,H){if(!CL)return;const B=cityBox(W,H,0,0);g.save();g.globalAlpha=.55;g.drawImage(CL.gr,B.x,B.y,B.bw,B.bh);const f=g.createLinearGradient(0,B.y+B.bh*.6,0,B.y+B.bh+8);f.addColorStop(0,'rgba(10,7,26,0)');f.addColorStop(1,'rgba(10,7,26,1)');g.globalAlpha=1;g.fillStyle=f;g.fillRect(0,B.y+B.bh*.6,W,H);g.restore()}
