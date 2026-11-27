/* ---------- story camera: the city backdrop pushes in / pans / tilts with each scene ---------- */
const CAMP={v1:[1,0,0,0],v2:[1.06,0,.01,0],v3:[1.1,-.03,.02,.004],v4:[1.28,.05,.05,-.006],v5:[1.2,-.09,.03,.012],v6:[1.42,.1,.09,-.01],v7:[1.15,-.11,-.01,-.016],v8:[1.6,0,.14,0],v10:[1.75,0,.17,0],v11:[1.32,.12,.03,.022],v12:[1.2,-.13,.0,-.012],v13:[1.38,.08,.08,.01],v14:[1.9,0,.2,0],v15:[1.45,0,.11,0],v16:[.96,0,0,0]};
const SCAM={z:1,x:0,y:0,r:0};
function storyCam(){try{const k=sceneKey();if(k[0]==='a'){const mi=ORDER.indexOf(k.slice(1));return[1.32,(mi-2)*.07,.05,(mi-2)*.009]}return CAMP[k]||CAMP.v1}catch(e){return CAMP.v1}}
function draw(t){
  const sec=t/1000,dt=Math.min(.05,Math.max(0,(t-lastT)/1000));lastT=t;
  M.boost+=(M.tb-M.boost)*(1-Math.exp(-dt*4));M.kick*=Math.exp(-dt*6);
  const bo=M.boost,pr=prog(),D=Math.max(W,H);Sb=.12+Math.min(1,pr*1.1)*.88;cam.z+=(.5+bo*16)*dt;
  const amp=reduce?0:.4+bo*6+M.kick*4;
  ctx.save();ctx.translate(amp*(Math.sin(sec*31)+.6*Math.sin(sec*17.3)),amp*(Math.sin(sec*27)+.6*Math.cos(sec*13.1)));
  const sk=ctx.createLinearGradient(0,-40,0,H+40);sk.addColorStop(0,bk('#07061a'));sk.addColorStop(.55,bk('#150f33'));sk.addColorStop(1,bk('#2a1a4a'));
  ctx.fillStyle=sk;ctx.fillRect(-60,-60,W+120,H+120);if(window.AURORA)AURORA.draw(ctx,W,H,.3+.45*Sb);
  for(const n of NEB){const x=n.x*W+Math.sin(sec*.05+n.y*9)*W*.05,y=n.y*H,c=bkA(n.c),rg=ctx.createRadialGradient(x,y,0,x,y,n.r*D);
    rg.addColorStop(0,'rgba('+c+',.3)');rg.addColorStop(1,'rgba('+c+',0)');ctx.fillStyle=rg;ctx.fillRect(-60,-60,W+120,H+120)}
  for(const s of STARS){const sy=((s.y+cam.z*.004*s.z)%1)*H,a=.3+.5*Math.abs(Math.sin(sec*1.2*s.z+s.p));
    ctx.fillStyle='rgba(255,246,220,'+a+')';ctx.fillRect(s.x*W-SCAM.x*W*.25*s.z,sy,s.r,s.r+bo*34*s.z)}
  for(const p of PLN){p.a+=p.sp*dt;p.cur+=(target(p)-p.cur)*(1-Math.exp(-dt*2.8));p.flash*=Math.exp(-dt*3)}
  {const c0=storyCam(),tg=[1+(c0[0]-1)*BG,c0[1]*BG,c0[2]*BG,c0[3]*BG],ke=1-Math.exp(-dt*1.5);SCAM.z+=(tg[0]-SCAM.z)*ke;SCAM.x+=(tg[1]-SCAM.x)*ke;SCAM.y+=(tg[2]-SCAM.y)*ke;SCAM.r+=(tg[3]-SCAM.r)*ke;
   const cx=W/2,cy=H*.4,z=SCAM.z*(1+.018*BG*Math.sin(sec*.35))+bo*.03;
   ctx.save();ctx.translate(cx+SCAM.x*W+(Math.sin(sec*.23)*W*.008*BG),cy+SCAM.y*H);ctx.rotate(SCAM.r+Math.sin(sec*.27)*.006*BG);ctx.scale(z,z);ctx.translate(-cx,-cy);
   cityDraw(sec,bo,pr);ctx.restore()}
  /* sea of clouds */
  for(const c of CLD){const x=(((c.x*W+sec*4*c.z+cam.z*c.z*3-SCAM.x*W*c.z*1.2)%(W*1.3))+W*1.3)%(W*1.3)-W*.15,y=c.y*H+Math.sin(sec*.3+c.x*9)*3,r=c.r*(.6+c.z*.6),col=c.c?bkA('#9a88d0'):bkA('#e9e3d4');
    const cg=ctx.createRadialGradient(x,y,0,x,y,r);cg.addColorStop(0,'rgba('+col+','+(.34*c.z+.1)+')');cg.addColorStop(1,'rgba('+col+',0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
  /* the guiding star */
  const gx=guide.tx!==null?guide.tx:.5+Math.sin(sec*.5)*.05,gy=guide.ty!==null?guide.ty:.1+Math.sin(sec*.9)*.01;
  guide.x+=(gx-guide.x)*.05;guide.y+=(gy-guide.y)*.05;
  const px=guide.x*W+SCAM.x*W*.6,py=guide.y*H+SCAM.y*H*.5,gr=D*.2+bo*70,gg=ctx.createRadialGradient(px,py,0,px,py,gr),gc=bkA('#FFF1B0');
  ctx.globalCompositeOperation='lighter';gg.addColorStop(0,'rgba('+gc+',.55)');gg.addColorStop(1,'rgba('+gc+',0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(px,py,gr,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';
  sparkle(ctx,px,py,8+bo*6,'#FFFBEA');
  if(bo>.05){ctx.strokeStyle='rgba(255,244,214,'+(.35*bo)+')';ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<40;i++){const a=hash(i,1,7)*6.283,r0=((hash(i,2,3)+sec*(.6+bo))%1)*D*.7+30,r1=r0+bo*D*.14*(.4+hash(i,4,5));ctx.moveTo(px+Math.cos(a)*r0,py+Math.sin(a)*r0);ctx.lineTo(px+Math.cos(a)*r1,py+Math.sin(a)*r1)}ctx.stroke()}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=.016;p.x+=p.vx;p.y+=p.vy;p.vy+=.02;
    if(p.life<=0){parts.splice(i,1);continue}
    ctx.fillStyle=p.c;ctx.globalAlpha=Math.max(0,p.life);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();ctx.globalAlpha=1}
  ctx.restore();
  if(!NP)NP=ctx.createPattern(NZ,'repeat');
  if(!reduce&&FR++%3===0)GJ=[Math.floor(R()*200),Math.floor(R()*200)];
  if(!window.PAPER_ON){ctx.save();ctx.translate(GJ[0],GJ[1]);ctx.fillStyle=NP;ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.3;ctx.fillRect(-200,-200,W+400,H+400);ctx.restore()}   // film grain: off while a paper scene (js/22) is up
}
function loop(t){draw(t);requestAnimationFrame(loop)}
