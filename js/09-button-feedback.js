/* ===== button feedback: press, ripple, light flying from the choice up to the scene, colour wash, consequence caption ===== */
(function(){
const st=document.createElement('style');st.textContent=`
.opt{position:relative;overflow:hidden;--pc:#fff6dc}
.opt::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,246,220,.16) 50%,transparent 65%);transform:translateX(-120%);animation:shim 5.5s ease-in-out infinite;animation-delay:calc(var(--i)*.7s + 1.8s);pointer-events:none}
@keyframes shim{0%,70%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.opt:not(:disabled):hover,.opt:not(:disabled):focus-visible{border-color:#fff1c8;box-shadow:0 0 22px rgba(255,236,190,.28);transform:translateY(-2px) scale(1.012)}
.opt:not(:disabled):active{transform:scale(.965);box-shadow:0 0 34px rgba(255,236,190,.5);transition:transform .08s}
.opt.picked:disabled{border-color:var(--pc)!important;box-shadow:0 0 38px var(--pc),inset 0 0 24px rgba(255,255,255,.08)!important}
.opt.picked::after{animation:none;background:linear-gradient(105deg,transparent 20%,var(--pc) 50%,transparent 80%);opacity:.45;transform:translateX(-120%);animation:sweep .9s ease-out forwards}
@keyframes sweep{to{transform:translateX(120%)}}
.fxcap{display:block;margin-top:7px;padding-top:6px;border-top:1px dashed rgba(255,255,255,.25);font-size:.82em;color:var(--pc);opacity:0;transform:translateY(6px);animation:capIn .5s .35s ease forwards}
@keyframes capIn{to{opacity:1;transform:none}}
.opt:disabled:not(.picked){animation:dim .5s ease forwards,fall .9s ease forwards!important}
@keyframes fall{to{transform:translateY(14px) scale(.96);filter:blur(1.5px)}}
#fx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50}
@media (prefers-reduced-motion:reduce){.opt::after{animation:none}.fxcap{animation:none;opacity:1;transform:none}}
`;document.head.appendChild(st);
const fx=document.createElement('canvas');fx.id='fx';document.body.appendChild(fx);const f=fx.getContext('2d');
let FW=0,FH=0,P=[],RG=[],WASH=null;
function rf(){const d=Math.min(1.5,devicePixelRatio||1);FW=innerWidth;FH=innerHeight;fx.width=FW*d;fx.height=FH*d;f.setTransform(d,0,0,d,0,0)}rf();addEventListener('resize',rf);
const rgba=(h,a)=>{const c=hx(h);return 'rgba('+c.join(',')+','+a+')'};
// tap anywhere on an option: instant ripple (before the choice is confirmed)
document.addEventListener('pointerdown',e=>{const o=e.target.closest&&e.target.closest('.opt');if(!o||o.disabled||reduce)return;RG.push({x:e.clientX,y:e.clientY,t:0,c:'#fff1c8',m:1})},true);
function fxPick(i){
  const b=$s.querySelectorAll('.opt')[i];if(!b)return;const m=FXM||(S.stage==='alley'?S.alley[S.ai]:null);if(!m)return;
  const c=MJ[m].c,r=b.getBoundingClientRect(),mi=ORDER.indexOf(m);
  b.style.setProperty('--pc',c);
  const cap=document.createElement('span');cap.className='fxcap';cap.textContent='✦ สีของ '+PNAME[mi]+' ส่องสว่างขึ้นในเมือง';b.appendChild(cap);
  if(reduce)return;
  const sr=sc.getBoundingClientRect(),tx=sr.left+sr.width/2,ty=sr.top+SY+(FOC[SCN.k]||50)*SS,sx0=r.left+r.width/2,sy0=r.top+r.height/2;
  RG.push({x:sx0,y:sy0,t:0,c,m:0},{x:sx0,y:sy0,t:-.12,c,m:0});
  WASH={x:sx0,y:sy0,t:0,c};
  for(let k=0;k<26;k++)P.push({x0:sx0+(Math.random()-.5)*r.width*.6,y0:sy0+(Math.random()-.5)*r.height*.5,tx:tx+(Math.random()-.5)*30,ty:ty+(Math.random()-.5)*20,cx:sx0+(Math.random()-.5)*220,cy:(sy0+ty)/2-Math.random()*90,t:-Math.random()*.35,sp:.85+Math.random()*.5,c:k%4?c:'#fff6dc',z:1.5+Math.random()*2.5});
  if(navigator.vibrate)try{navigator.vibrate(18)}catch(e){}
}
const _mk=mark;window.mark=function(i){_mk(i);fxPick(i)};
let lt=0;
function fl(ms){const dt=Math.min(.05,(ms-lt)/1000||.016);lt=ms;f.clearRect(0,0,FW,FH);
  if(WASH){WASH.t+=dt*1.5;const w=WASH,a=Math.max(0,1-w.t)*.35,g=f.createRadialGradient(w.x,w.y,0,w.x,w.y,Math.max(FW,FH)*Math.min(1,w.t*1.2));g.addColorStop(0,rgba(w.c,a));g.addColorStop(1,rgba(w.c,0));f.fillStyle=g;f.fillRect(0,0,FW,FH);if(w.t>1)WASH=null}
  f.globalCompositeOperation='lighter';
  RG=RG.filter(g=>{g.t+=dt*(g.m?3:1.6);if(g.t<0)return true;if(g.t>1)return false;f.strokeStyle=rgba(g.c,(1-g.t)*.7);f.lineWidth=g.m?1.5:3*(1-g.t)+.5;f.beginPath();f.arc(g.x,g.y,g.t*(g.m?60:150),0,7);f.stroke();return true});
  P=P.filter(p=>{p.t+=dt*p.sp;if(p.t<0)return true;if(p.t>1)return false;const u=p.t,v=1-u,e=u*u*(3-2*u),px=v*v*p.x0+2*v*u*p.cx+u*u*p.tx,py=v*v*p.y0+2*v*u*p.cy+u*u*p.ty;
    for(let k=0;k<5;k++){const w=Math.max(0,u-k*.025),vv=1-w,qx=vv*vv*p.x0+2*vv*w*p.cx+w*w*p.tx,qy=vv*vv*p.y0+2*vv*w*p.cy+w*w*p.ty;f.fillStyle=rgba(p.c,(1-k/5)*.5*(1-u*.3));f.beginPath();f.arc(qx,qy,p.z*(1-k/6)*(1.2-.4*e),0,7);f.fill()}
    if(u>.92){f.fillStyle=rgba(p.c,.5);f.beginPath();f.arc(p.tx,p.ty,p.z*4*(1-u)*12,0,7);f.fill()}return true});
  f.globalCompositeOperation='source-over';requestAnimationFrame(fl)}
requestAnimationFrame(fl);
})();
