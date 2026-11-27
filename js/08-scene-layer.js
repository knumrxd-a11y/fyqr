/* ===== scene layer: one illustrated vignette per storyboard panel, plus an action when you pick ===== */
const sc=document.getElementById('sc');let sx=sc.getContext('2d');if(PT.off('sc'))sc.style.display='none';
const SCN={k:'',p:'',f:1,dn:0,am:null,at:0,al:1,tc:[20,50,58]};
const TINT={v1:'#1c4a52',v2:'#1a4458',v3:'#1c4a52',v4:'#2a4a48',v5:'#1a5a5a',v6:'#2a4a58',v7:'#3a3a58',v8:'#4a4a30',v10:'#4a4a30',v11:'#2a3a6a',v12:'#3a3a58',v13:'#5a4a28',v14:'#5a4a28',v15:'#2a4a58',v16:'#3a2a5a'};
const FOC={v1:40,v2:50,v3:50,v4:55,v5:50,v6:60,v7:58,v8:40,v10:55,v11:44,v12:52,v13:50,v14:48,v15:52,v16:40};
let SAT=.3,SW=0,SH=0,SS=1,SY=48,lt2=0;
function rsc(){const r=sc.getBoundingClientRect(),d=DEV.dpr(r.width,r.height,1.5);SW=r.width;SH=r.height;sc.width=Math.round(SW*d);sc.height=Math.round(SH*d);sx.setTransform(d,0,0,d,0,0);
  const pt=parseFloat(getComputedStyle(document.getElementById('app')).paddingTop)||200;SS=Math.min(Math.max(90,pt-56)/100,SW/180)}
addEventListener('resize',rsc);
const Ca=(h,m)=>{const c=hx(h);if(m===undefined)return mixc(lumc(c),c,SAT);const mx=Math.max(1,...Object.values(S.w)),sh=S.w[ORDER[m]]/mx;return mixc(lumc(c),c,Math.min(1,SAT*.55+sh*.45))};
const K=(h,m)=>rgb(Ca(h,m));
const dk=(c,f)=>'#'+hx(c).map(v=>Math.round(v*f).toString(16).padStart(2,'0')).join('');
const fr=(c,x,y,w,h,m)=>{sx.fillStyle=K(c,m);sx.fillRect(x,y,w,h)};
const ci=(c,x,y,r,m)=>{sx.fillStyle=K(c,m);sx.beginPath();sx.arc(x,y,r,0,7);sx.fill()};
const glow=(x,y,r,c,a,m)=>{const g=sx.createRadialGradient(x,y,0,x,y,r),q=Ca(c,m).map(Math.round).join(',');g.addColorStop(0,'rgba('+q+','+a+')');g.addColorStop(1,'rgba('+q+',0)');sx.fillStyle=g;sx.fillRect(x-r,y-r,r*2,r*2)};
const beam=(x,y,tx,ty,w,c,a,m)=>{const q=Ca(c,m).map(Math.round).join(','),g=sx.createLinearGradient(x,y,tx,ty);g.addColorStop(0,'rgba('+q+','+a+')');g.addColorStop(1,'rgba('+q+',0)');sx.fillStyle=g;sx.beginPath();sx.moveTo(x-2,y);sx.lineTo(x+2,y);sx.lineTo(tx+w,ty);sx.lineTo(tx-w,ty);sx.fill()};
const PEOPLE=['#F25AA6','#4BA3F5','#F59A3B','#3BCB7E'];

function star(x,y,r,t){const p=1+.08*Math.sin(t*2+x);glow(x,y,r*2.8*p,'#FFF1B0',.75);sparkle(sx,x,y,r*p,K('#FFF8DC'));ci('#FFFFFF',x,y,r*.3)}
function hero(x,y,s,dir,t,rot,cape){sx.save();sx.translate(x,y);sx.rotate(rot||0);sx.scale(s*dir,s);const w=Math.sin(t*2.2)*1.6,d=K('#07101c');
  sx.fillStyle=K(cape||'#cfe8d8');sx.beginPath();sx.moveTo(-2.5,-15);sx.quadraticCurveTo(-13+w,-7,-11+w*1.4,1);sx.lineTo(-1.5,0);sx.closePath();sx.fill();
  sx.fillStyle=d;sx.beginPath();sx.moveTo(-3,-15);sx.lineTo(3,-15);sx.lineTo(4.2,0);sx.lineTo(-4.2,0);sx.closePath();sx.fill();
  sx.beginPath();sx.arc(0,-19,4.4,0,7);sx.fill();
  sx.strokeStyle=d;sx.lineWidth=1;sx.lineCap='round';sx.beginPath();sx.moveTo(-2,-22.5);sx.quadraticCurveTo(-5,-27,-8,-25);sx.moveTo(2,-22.5);sx.quadraticCurveTo(5,-27,8,-25);sx.stroke();
  sx.restore()}
function critter(x,y,s,t,cry){sx.save();sx.translate(x,y+Math.sin(t*2+x)*.8);sx.scale(s,s);
  sx.fillStyle=K('#f2f4ee');sx.beginPath();sx.arc(0,-6,6,3.14,0);sx.lineTo(6,0);sx.quadraticCurveTo(3,2,0,0);sx.quadraticCurveTo(-3,2,-6,0);sx.closePath();sx.fill();
  sx.fillStyle=K('#0a1018');sx.beginPath();sx.ellipse(0,-6,4.1,3.2,0,0,7);sx.fill();
  sx.fillStyle=K('#e8fff4');sx.fillRect(-2.2,-6.6,1.2,1.4);sx.fillRect(1,-6.6,1.2,1.4);
  if(cry)for(let i=0;i<2;i++){const q=(t*1.1+i/2)%1;sx.fillStyle='rgba(150,220,255,'+(1-q)+')';sx.fillRect(i?3:-4,-4+q*9,1.1,2.2)}
  sx.restore()}
function planet(x,y,r,h,ring,m){planetG(sx,Ca(h,m),x,y,r,ring)}
function whale(x,y,s,t){sx.save();sx.translate(x,y);sx.scale(s,s);const w=Math.sin(t*1.2)*3;glow(0,0,62,'#7fe8d0',.25);
  sx.fillStyle=K('#2e8f86');sx.beginPath();sx.moveTo(-46,4);sx.bezierCurveTo(-44,-16,-8,-24,22,-12);sx.bezierCurveTo(34,-6,40,-8+w*.4,52,-22+w);sx.bezierCurveTo(50,-8+w*.5,44,0,38,3);sx.bezierCurveTo(46,10,52,20+w,56,28+w);sx.bezierCurveTo(42,22+w*.6,30,12,18,8);sx.bezierCurveTo(-6,18,-34,16,-46,4);sx.fill();
  sx.globalAlpha=.55;sx.fillStyle=K('#c8f5e4');sx.beginPath();sx.moveTo(-40,6);sx.bezierCurveTo(-20,14,0,14,16,8);sx.bezierCurveTo(0,8,-24,6,-40,6);sx.fill();sx.globalAlpha=1;
  ci('#06222a',-34,-3,1.4);sx.fillStyle=K('#237a74');sx.beginPath();sx.moveTo(-8,8);sx.quadraticCurveTo(-4,22,6,24);sx.quadraticCurveTo(2,14,4,8);sx.fill();
  sx.fillStyle=K('#bff7e6');for(let i=0;i<7;i++)sx.fillRect(-30+i*8,-12+Math.sin(i)*3,1.2,1.2);sx.restore()}
function banners(x0,y0,x1,y1,sag,n,t){sx.strokeStyle=K('#9fb8b0');sx.lineWidth=.6;sx.beginPath();for(let i=0;i<=20;i++){const u=i/20;sx[i?'lineTo':'moveTo'](x0+(x1-x0)*u,y0+(y1-y0)*u+Math.sin(u*3.14)*sag)}sx.stroke();
  for(let i=1;i<=n;i++){const u=i/(n+1),x=x0+(x1-x0)*u,y=y0+(y1-y0)*u+Math.sin(u*3.14)*sag,sw=Math.sin(t*2+i)*1.2;sx.fillStyle=K(PCOL[i%5],i%5);sx.beginPath();sx.moveTo(x-3,y);sx.lineTo(x+3,y);sx.lineTo(x+sw,y+8);sx.fill()}}
function dome(x,y,r,t){sx.fillStyle=K('#143a44');sx.beginPath();sx.arc(x,y,r,3.14,0);sx.closePath();sx.fill();sx.strokeStyle=K('#2e7a7a');sx.lineWidth=.6;for(let i=1;i<5;i++){sx.beginPath();sx.ellipse(x,y,r*i/5,r,0,3.14,0);sx.stroke()}
  glow(x,y-r*.3,r*1.3,'#FFE9A8',.3+.12*Math.sin(t*2));sx.fillStyle=K('#FFE9A8');for(let i=0;i<5;i++)sx.fillRect(x-r*.6+i*r*.3,y-r*.3-((i%2)*r*.15),1.6,3)}
function ringE(x,y,rx,ry,t,a){sx.strokeStyle=K('#9fe8d8');sx.globalAlpha=a||.6;sx.lineWidth=.8;sx.beginPath();sx.ellipse(x,y,rx,ry,Math.sin(t*.3)*.05,0,7);sx.stroke();sx.globalAlpha=1}
function hill(x,y,rx,ry,c){sx.fillStyle=K(c||'#06141c');sx.beginPath();sx.ellipse(x,y,rx,ry,0,0,7);sx.fill()}
function rock(x,y,r,t){sx.save();sx.translate(x,y);sx.rotate(t*.1+x);sx.fillStyle=K('#0b1a24');sx.beginPath();sx.moveTo(-r,0);sx.lineTo(-r*.3,-r*.8);sx.lineTo(r*.7,-r*.5);sx.lineTo(r,r*.3);sx.lineTo(0,r*.8);sx.closePath();sx.fill();sx.restore()}

const V={
 v1(t){const y=30+Math.sin(t*1.5)*3,mg=sx.createRadialGradient(34,34,2,34,34,34);mg.addColorStop(0,K('#f4f0d8'));mg.addColorStop(1,K('#7fa6a0'));sx.fillStyle=mg;sx.beginPath();sx.arc(34,34,34,0,7);sx.fill();
  sx.fillStyle='rgba(20,60,70,.22)';[[24,28,6],[44,44,8],[40,22,4]].forEach(a=>{sx.beginPath();sx.arc(a[0],a[1],a[2],0,7);sx.fill()});
  star(-78,16,3,t);isl(sx,K,-72,64+Math.sin(t*.6)*1.5,56,11,.5);isl(sx,K,82,54+Math.sin(t*.5+1)*1.5,44,23,.4);isl(sx,K,-4,74,124,7,.6);
  glow(-2,y,26,'#FFE3A0',.7);ci('#FFF3D0',-2,y,3)},
 v2(t){sx.fillStyle=K('#0b3a42');sx.beginPath();sx.arc(30,170,118,0,7);sx.fill();sx.strokeStyle=K('#b8f0e0');sx.lineWidth=1.2;sx.globalAlpha=.8;sx.beginPath();sx.arc(30,170,118,3.5,5.9);sx.stroke();sx.globalAlpha=1;
  hill(-52,94,60,16);hero(-52,80,1,1,t);const y=26+Math.sin(t*1.4)*3;sx.strokeStyle=K('#d9f5ff');sx.lineWidth=.5;sx.beginPath();sx.moveTo(12,-20);sx.lineTo(12,y);sx.stroke();
  glow(12,y+4,24,'#FFF1B0',.8);ci('#fff',12,y+4,4.5);rock(-18,38,6,t);rock(66,22,5,t);rock(82,60,8,t)},
 v3(t){const P=[[0,10],[-62,30],[62,30],[-36,58],[34,58]];sx.strokeStyle='rgba(180,240,230,.28)';sx.lineWidth=.6;P.forEach(p=>{sx.beginPath();sx.moveTo(0,36);sx.lineTo(p[0],p[1]);sx.stroke()});sx.beginPath();sx.ellipse(0,36,72,34,0,0,7);sx.stroke();
  star(0,36,4.5,t);P.forEach((p,i)=>planet(p[0],p[1]+Math.sin(t*.8+i)*1.6,10+(i%2)*2,PCOL[i],i%2===0,i));hill(0,102,60,14);hero(0,88,.9,1,t)},
 v4(t){isl(sx,K,0,52,130,31,.7);sx.fillStyle=K('#FFE9A8');sx.beginPath();sx.moveTo(-7,52);sx.lineTo(-7,38);sx.arc(0,38,7,3.14,0);sx.lineTo(7,52);sx.fill();glow(0,46,36,'#FFE9A8',.5+.1*Math.sin(t*2));
  sx.fillStyle=K('#2a4a4a');sx.beginPath();sx.moveTo(-28,92);sx.lineTo(28,92);sx.lineTo(8,56);sx.lineTo(-8,56);sx.fill();sx.strokeStyle=K('#7fb8b0');sx.lineWidth=.5;for(let i=0;i<6;i++){const u=i/6,y=92-u*36,hw=28-u*20;sx.beginPath();sx.moveTo(-hw,y);sx.lineTo(hw,y);sx.stroke()}
  const it=(i,f)=>{sx.save();sx.translate(-64+i*32,44+Math.sin(t*1.6+i)*-2.5);f();sx.restore()};
  it(0,()=>{fr('#F25AA6',-5,-6,10,12,1);fr('#fff',-3.5,-4,7,.8)});it(1,()=>{ci('#9A7BFF',0,0,6.5,0);ci('#FFD166',-2,-2,1.2);ci('#4BE3C1',2,0,1.2)});
  it(2,()=>{fr('#3BCB7E',-5,-6,10,12,3);fr('#1d4a30',-3,-4,6,4)});it(3,()=>{fr('#F59A3B',-6,-4,12,8,2);ci('#333',0,0,3)});it(4,()=>{ci('#4BA3F5',0,-3,4,4);fr('#888',-.8,0,1.6,7)});
  hero(-16,92,.85,1,t)},
 v5(t){whale(-14+Math.sin(t*.3)*6,26,.9,t);const T=[-80,-40,0,40,80];T.forEach((x,i)=>{const m=i;sx.strokeStyle=K(PCOL[i],m);sx.globalAlpha=.55;sx.lineWidth=1.2;sx.beginPath();sx.moveTo(-34,82);sx.quadraticCurveTo((x-34)/2,52,x,32);sx.stroke();sx.globalAlpha=1;glow(x,32,12,PCOL[i],.8,m);ci(PCOL[i],x,32,2.2,m)});
  star(56,14,3.5,t);hill(-34,98,40,14);hero(-34,84,.95,1,t)},
 v6(t){isl(sx,K,-64,66,86,41,.5);isl(sx,K,74,68,60,42,.4);fr('#143a44',-78,34,12,32);dome(-72,34,12,t);ringE(-72,30,26,6,t);
  const L=18+SCN.dn*45;sx.strokeStyle=K('#8a7a6a');sx.setLineDash([2,3]);sx.lineWidth=.6;sx.beginPath();sx.moveTo(-21,66);sx.lineTo(42,66);sx.stroke();sx.setLineDash([]);
  fr('#8a7a6a',-22,65,L,2.4);for(let i=0;i<L;i+=8)fr('#6a5a4a',-20+i,67,1.6,6);
  if(SCN.dn<.9){sx.fillStyle=K('#8a7a6a');sx.beginPath();sx.moveTo(-22+L,65);sx.lineTo(-19+L,69);sx.lineTo(-23+L,69);sx.fill()}
  critter(74,68,.8,t);hero(-32,66,.9,1,t);for(let i=0;i<3;i++){const q=(t*.5+i/3)%1;sx.fillStyle='rgba(255,226,160,'+(1-q)*.8+')';sx.fillRect(-22+L,60-q*14+i,1.4,1.4)}},
 v7(t){banners(-96,10,96,10,9,9,t);dome(46,66,22,t);hill(0,104,90,12);critter(42,86,1,t,SCN.dn<.5);hero(-30,86,.95,1,t);
  sx.strokeStyle='rgba(255,255,255,.4)';sx.lineWidth=.8;sx.setLineDash([3,2]);sx.strokeRect(-6,28,24,32);sx.setLineDash([]);
  sx.save();sx.globalAlpha=SCN.al*SCN.dn;ci('#F25AA6',6,44,7,1);ci('#FFD166',2,42,1.5);ci('#FFD166',10,42,1.5);sx.restore()},
 v8(t){const hand=s=>{sx.save();sx.scale(s,1);sx.fillStyle=K('#060d16');sx.beginPath();sx.moveTo(-98,74);sx.bezierCurveTo(-92,44,-70,28,-38,24);sx.bezierCurveTo(-24,18,-14,14,-6,16);sx.bezierCurveTo(-12,24,-20,28,-30,32);sx.bezierCurveTo(-22,36,-12,36,-4,38);sx.bezierCurveTo(-16,44,-30,46,-44,48);sx.bezierCurveTo(-60,62,-70,78,-70,88);sx.lineTo(-98,88);sx.closePath();sx.fill();sx.restore()};
  hand(1);hand(-1);const lv=.45+SCN.dn*.55;glow(0,34,26+lv*32,'#FFF1B0',.4+lv*.5);ci('#FFF6CC',0,34,8+lv*3);star(0,32,5+SCN.dn*4,t);
  rock(-78,16,6,t);rock(80,30,7,t);hero(62,90,.9,-1,t)},
 v10(t){isl(sx,K,0,56,150,3,.8);dome(0,40,18,t);ringE(0,34,40,9,t);beam(0,20,0,-40,6,'#FFE9A8',.5);const o=SCN.dn*24;glow(0,60,50,'#FFE3A0',.12+SCN.dn*.6);
  const door=(s)=>{sx.fillStyle=K('#555f68');sx.beginPath();sx.moveTo(s*(o+1),92);sx.lineTo(s*(o+1),44);sx.quadraticCurveTo(s*(o+1),28,s*(o+19),26);sx.lineTo(s*(o+38),26);sx.lineTo(s*(o+38),92);sx.fill();
    sx.strokeStyle='rgba(0,0,0,.35)';sx.lineWidth=.8;for(let i=0;i<5;i++){sx.beginPath();sx.moveTo(s*(o+4),36+i*11);sx.lineTo(s*(o+35),36+i*11);sx.stroke()}};
  door(-1);door(1);fr('#34343f',-56,92,112,3);hero(-70,92,.8,1,t)},
 v11(t){const bx=-10+Math.sin(t*.7)*14,by=52+Math.cos(t*.9)*4;sx.globalCompositeOperation='lighter';const g=sx.createLinearGradient(-100,100,70,10);g.addColorStop(0,'rgba(180,255,230,0)');g.addColorStop(1,K('#d8fff0'));sx.fillStyle=g;sx.beginPath();sx.moveTo(-100,96);sx.lineTo(-96,86);sx.lineTo(bx+14,by-10);sx.lineTo(bx+16,by+8);sx.fill();sx.globalCompositeOperation='source-over';
  [[-.1,24,.5],[.12,10,.55],[.3,26,.5],[.48,14,.55]].forEach((f,i)=>hero(bx-40+i*18+(f[0]*10),by+22-i*5+Math.sin(t+i)*2,.55,1,t,-.5,PEOPLE[i]));
  hero(bx,by,1.05,1,t,-.5);rock(-60,30,5,t);rock(70,70,6,t+3);rock(40,14,4,t);star(-78,18,3,t)},
 v12(t){isl(sx,K,0,48,150,17,.6);banners(-70,22,70,22,7,6,t);const p=Math.sin(t*4)*2;
  [-1,1].forEach((s,i)=>{isl(sx,K,s*78,46,52,50+i,.5);sx.strokeStyle=K(PCOL[i?4:1],i?4:1);sx.lineWidth=1.4;sx.globalAlpha=.65;sx.beginPath();sx.moveTo(0,80);sx.quadraticCurveTo(s*30,66,s*66,50);sx.stroke();sx.globalAlpha=1;glow(s*70,44,22,PCOL[i?4:1],.5,i?4:1)});
  sx.fillStyle=K('#FFD98A');sx.beginPath();sx.moveTo(-26+p,70);sx.lineTo(-18+p,66);sx.lineTo(-18+p,74);sx.fill();sx.beginPath();sx.moveTo(26-p,70);sx.lineTo(18-p,66);sx.lineTo(18-p,74);sx.fill();
  sx.fillStyle=K('#e9e3d4');sx.globalAlpha=.8;[[-14,92,16],[14,94,18],[0,98,20]].forEach(c=>{sx.beginPath();sx.arc(c[0],c[1],c[2],0,7);sx.fill()});sx.globalAlpha=1;hero(0,88,.9,1,t)},
 v13(t){const lv=.4+SCN.dn*.6;glow(0,46,64,'#FFD98A',.35*lv+.15);sx.strokeStyle=K('#FFE9A8');sx.globalAlpha=.5;sx.lineWidth=.9;sx.beginPath();sx.arc(0,60,40,3.14,0);sx.stroke();sx.globalAlpha=1;
  isl(sx,K,-60,62,60,60,.7);isl(sx,K,0,66,70,61,.8);isl(sx,K,62,62,56,62,.7);
  sx.globalCompositeOperation='lighter';[-56,0,56].forEach((x,i)=>beam(x,60,x+Math.sin(t*1.2+i*2)*18,6,12,['#F25AA6','#4BA3F5','#FFD166'][i],.5*lv,[1,4,undefined][i]));sx.globalCompositeOperation='source-over';
  sx.fillStyle=K('#06141c');sx.beginPath();sx.moveTo(-100,100);sx.lineTo(-100,80);sx.lineTo(-70,80);sx.lineTo(-62,86);sx.lineTo(-56,100);sx.fill();hero(-76,80,.95,1,t)},
 v14(t){const e=SCN.dn;sx.globalCompositeOperation='lighter';sx.strokeStyle='rgba(255,236,170,.35)';sx.lineWidth=1;for(let i=0;i<16;i++){const a=i/16*6.283+t*.15;sx.beginPath();sx.moveTo(Math.cos(a)*14,34+Math.sin(a)*14);sx.lineTo(Math.cos(a)*(60+e*30),34+Math.sin(a)*(60+e*30));sx.stroke()}sx.globalCompositeOperation='source-over';
  star(0,34,9,t);for(let j=0;j<5;j++){const q=(t*.4+j/5)%1;sx.save();sx.globalAlpha=1-q;sx.strokeStyle=K(PCOL[j],j);sx.lineWidth=1.4;sx.beginPath();sx.ellipse(0,34,16+q*70,6+q*26,0,0,7);sx.stroke();sx.restore()}
  hill(0,100,90,16);hero(-14,86,1,1,t);critter(15,87,.9,t)},
 v15(t){isl(sx,K,0,56,150,19,.8);dome(0,40,18,t);ringE(0,34,44,10,t);ringE(0,36,30,6,t+2,.35);beam(0,22,0,-40,6,'#FFE9A8',.5);
  const y=70+Math.sin(t*1.6)*2;sx.fillStyle=K('#fff5d8');sx.fillRect(-8,y-5,16,10);sx.strokeStyle=K('#9a7a3a');sx.lineWidth=.6;sx.strokeRect(-8,y-5,16,10);glow(0,y,20,'#FFE9A8',.5);
  critter(-44,92,1,t);hero(44,92,.9,-1,t)},
 v16(t){sx.strokeStyle='rgba(180,240,230,.3)';sx.lineWidth=.6;sx.beginPath();sx.ellipse(0,36,76,24,0,0,7);sx.stroke();sx.beginPath();sx.ellipse(0,36,40,12,0,0,7);sx.stroke();
  star(0,36,10,t);for(let i=0;i<5;i++){const a=t*.3+i*1.2566;planet(Math.cos(a)*76,36+Math.sin(a)*24,7+Math.sin(a)*2,PCOL[i],i%2===0,i)}
  sx.fillStyle=K('#e9e3d4');sx.globalAlpha=.8;for(let i=-8;i<=8;i++){sx.beginPath();sx.arc(i*12,100+Math.sin(t*.4+i)*2,12+hash(i,2,2)*6,0,7);sx.fill()}sx.globalAlpha=1;hero(0,88,.9,1,t)}
};
function flourish(m,t){const c=PCOL[ORDER.indexOf(m)],mi=ORDER.indexOf(m);
  if(m==='DGA'){sx.lineCap='round';[-1,1].forEach(s=>{[['#F25AA6',0],['#FFD166',8],['#4BE3C1',16]].forEach(a=>{sx.strokeStyle=K(a[0],mi);sx.lineWidth=2.4;sx.beginPath();for(let k=0;k<=12;k++){const u=k/12;sx[k?'lineTo':'moveTo'](s*(60+u*30),36+a[1]+Math.sin(u*6+t)*3)}sx.stroke()})})}
  else if(m==='DGD'){sx.strokeStyle=K(c,mi);sx.lineWidth=1;sx.setLineDash([3,2]);sx.strokeRect(-92,30,32,24);sx.strokeRect(60,34,30,20);sx.setLineDash([]);sx.fillStyle=K(c,mi);sx.fillRect(-88,36,14,3);sx.fillRect(66,40,12,3)}
  else if(m==='IGD'){for(let i=0;i<8;i++){const x=(i<4?-92:62)+(i%4)*8,y=30+((i/4|0)*8)+Math.sin(t*2+i)*2;sx.fillStyle=K(i%3?c:'#CFFFE0',mi);sx.fillRect(x,y,7,7)}}
  else if(m==='AFX'){[-1,1].forEach(s=>{sx.fillStyle=K('#111');sx.fillRect(s*64-14,30,28,12);sx.fillStyle=K('#ddd');for(let k=0;k<5;k++)sx.fillRect(s*64-12+k*5,32,2,2.4)});sx.globalCompositeOperation='lighter';beam(-70,80,-50,10,10,c,.4,mi);beam(70,80,50,10,10,c,.4,mi);sx.globalCompositeOperation='source-over'}
  else{sx.fillStyle=K('#fff');sx.font='13px sans-serif';for(let i=0;i<5;i++)sx.fillText('♪',(i<3?-92+i*14:64+(i-3)*14),44-Math.sin(t*2+i)*4)}}
function alleyD(m,t){return;const mi=ORDER.indexOf(m),c=PCOL[mi];banners(-96,8,96,14,10,10,t);
  glow(0,32,50,c,.4+.1*Math.sin(t*2),mi);sx.strokeStyle=K(c,mi);sx.lineWidth=.8;sx.beginPath();sx.ellipse(0,32,46,16,0,0,7);sx.stroke();sx.beginPath();sx.ellipse(0,32,26,9,0,0,7);sx.stroke();star(0,32,5,t);flourish(m,t);
}
function drawAct(m,p,fx,fy){return;
  const c=MJ[m].c,e=1-Math.pow(1-p,3);sx.save();sx.globalAlpha=p>.8?(1-p)*5:1;
  if(m==='DGA'){sx.lineCap='round';[['#F25AA6',-14],['#FFD166',6],['#4BE3C1',26]].forEach((s,i)=>{const q=Math.min(1,Math.max(0,e*1.6-i*.25));if(q<=0)return;
    sx.strokeStyle=s[0];sx.lineWidth=7;sx.beginPath();for(let k=0;k<=24;k++){const u=k/24*q;sx[k?'lineTo':'moveTo'](fx-45+u*90,fy+s[1]-14+Math.sin(u*7+i)*5)}sx.stroke()})}
  else if(m==='DGD'){const w=76*e,h=46*e;sx.strokeStyle='rgba(154,123,255,.5)';sx.lineWidth=.7;sx.beginPath();sx.moveTo(fx,0);sx.lineTo(fx,100);sx.moveTo(-90,fy);sx.lineTo(90,fy);sx.stroke();
    sx.strokeStyle=c;sx.lineWidth=1.5;sx.setLineDash([4,3]);sx.strokeRect(fx-w/2,fy-h/2,w,h);sx.setLineDash([]);sx.fillStyle=c;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(a=>sx.fillRect(fx+a[0]*w/2-2.5,fy+a[1]*h/2-2.5,5,5));sx.fillStyle='rgba(255,255,255,'+e+')';sx.fillRect(fx-w/2+6,fy-8,w*.55,5);sx.fillRect(fx-w/2+6,fy+2,w*.35,3);sx.fillStyle=c;sx.fillRect(fx+w/2-24,fy+4,16*e,9)}
  else if(m==='IGD'){for(let i=0;i<12;i++){const q=Math.min(1,Math.max(0,e*1.8-i*.08));if(q<=0)continue;sx.fillStyle=i%3?c:'#CFFFE0';sx.fillRect(fx-20+(i%4)*10,fy-16+(i/4|0)*10-(1-q)*(1-q)*70,9,9)}
    sx.strokeStyle=c;sx.lineWidth=1.5;sx.globalAlpha*=1-e;sx.beginPath();sx.arc(fx,fy,10+e*45,0,7);sx.stroke()}
  else if(m==='AFX'){sx.globalCompositeOperation='lighter';glow(fx,fy,15+55*e,c,.7);for(let i=0;i<3;i++){const r=((p*1.2+i/3)%1)*55;sx.strokeStyle='rgba(255,190,90,'+(1-r/55)+')';sx.lineWidth=2;sx.beginPath();sx.arc(fx,fy,r,0,7);sx.stroke()}
    sx.fillStyle='#FFE3A0';for(let i=0;i<16;i++){const a=hash(i,3,9)*6.28,r=e*(12+hash(i,1,1)*42);sx.beginPath();sx.arc(fx+Math.cos(a)*r,fy+Math.sin(a)*r-e*10,1.6,0,7);sx.fill()}}
  else{for(let i=0;i<16;i++){const a=i/16*6.283,r=90*(1-e)+14+(i%3)*5,hop=p>.5?Math.abs(Math.sin(p*14+i))*4:0;sx.fillStyle=i%2?c:'#BFE0FF';sx.beginPath();sx.arc(fx+Math.cos(a)*r*1.3,fy+8+Math.sin(a)*r*.35-hop,3.2,0,7);sx.fill()}
    sx.fillStyle='#fff';sx.font='13px sans-serif';for(let i=0;i<4;i++)sx.fillText('♪',fx-30+i*20,fy-12-e*28-i*3)}
  sx.restore()}
V.v3=function(){};V.v16=function(){};
function sceneKey(){if(S.stage==='scene')return ['v3','v4','v5','v6','v7','v8','v10','v11','v12','v13','v14'][S.si];if(S.stage==='alley')return 'a'+S.alley[S.ai];if(S.stage==='pass')return 'v15';if(S.stage==='result')return 'v16';if(S.stage==='rules')return 'v2';return 'v1'}
function doAct(m){SCN.am=m;SCN.at=performance.now();FXM=m}
let FXM=null;
function drawScene(ms){
  const t=ms/1000,dt=Math.min(.05,Math.max(0,(ms-lt2)/1000));lt2=ms;
  const k=sceneKey();if(k!==SCN.k){SCN.p=SCN.k;SCN.k=k;SCN.f=reduce?1:0;SCN.dn=0;SCN.am=null}
  SCN.f=Math.min(1,SCN.f+dt/.8);const ap=SCN.am?Math.min(1,(performance.now()-SCN.at)/1500):0;
  SCN.dn+=((SCN.am?1:0)-SCN.dn)*(reduce?1:1-Math.exp(-dt*2.5));SAT=Math.min(1,.2+prog()*.7+SCN.dn*.3);
  const tg=hx(k[0]==='a'?dk(MJ[k.slice(1)].c,.55):(TINT[k]||'#1c4a52')),a=reduce?1:1-Math.exp(-dt*3);SCN.tc=SCN.tc.map((v,i)=>v+(tg[i]-v)*a);
  const q=SCN.tc.map(Math.round).join(',');
  /* every vignette but 1.2's items is switched off (js/11), so elsewhere this canvas holds only the tint gradient:
     when its colour (rounded, as drawn) and the canvas size are unchanged, the canvas already shows this frame */
  const only=k!=='v4'&&!(SCN.p==='v4'&&SCN.f<1);
  if(only&&q===SCN.lq&&sc.width===SCN.lw&&sc.height===SCN.lh)return;
  SCN.lq=only?q:'';SCN.lw=sc.width;SCN.lh=sc.height;
  sx.clearRect(0,0,SW,SH);sx.globalCompositeOperation='source-over';
  const paint=(key,al)=>{SCN.al=al;sx.save();sx.globalAlpha=al;sx.translate(SW/2,SY);sx.scale(SS,SS);if(key==='v4'&&window.v4Zoom)v4Zoom();key[0]==='a'?alleyD(key.slice(1),t):V[key](t);sx.restore()};
  if(SCN.p&&SCN.f<1)paint(SCN.p,1-SCN.f);paint(k,SCN.f);
  if(SCN.am&&ap<1&&!reduce){sx.save();sx.translate(SW/2,SY);sx.scale(SS,SS);drawAct(SCN.am,ap,0,FOC[k]||50);sx.restore()}
  sx.globalCompositeOperation='destination-in';const mg=sx.createLinearGradient(0,SY+64*SS,0,SY+106*SS);mg.addColorStop(0,'#000');mg.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=mg;sx.fillRect(0,0,SW,SH);
  sx.globalCompositeOperation='destination-over';const g2=sx.createLinearGradient(0,0,0,SH);
  g2.addColorStop(0,'rgba('+q+',.45)');g2.addColorStop(.6,'rgba('+q+',.18)');g2.addColorStop(1,'rgba('+q+',.1)');sx.fillStyle=g2;sx.fillRect(0,0,SW,SH);sx.globalCompositeOperation='source-over'}
function loop2(t){const p0=PT.b();if(!PT.off('sc'))drawScene(t);PT.e('sc',p0);requestAnimationFrame(loop2)}
rsc();requestAnimationFrame(loop2);
