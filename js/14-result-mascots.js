/* ===== result: program mascots (DGD/DGA/AFX/IGD/DEN) on the card + program blocks, with motion ===== */
(function(){
const MAS={"DGD": "images/mascot-DGD.webp", "DGA": "images/mascot-DGA.webp", "AFX": "images/mascot-AFX.webp", "IGD": "images/mascot-IGD.webp", "DEN": "images/mascot-DEN.webp"};
const PK={};Object.keys(MJ).forEach(k=>PK[MJ[k].prog]=k);
const st=document.createElement('style');st.textContent=`
.rwin{position:absolute;left:5.3%;top:4%;width:89.4%;height:71%;border-radius:4%/3%;overflow:hidden;background:radial-gradient(ellipse at 50% 62%,var(--mc) 0%,var(--md) 78%);box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)}
.rwin .rays{position:absolute;left:50%;top:62%;width:190%;aspect-ratio:1;margin:-95% 0 0 -95%;background:repeating-conic-gradient(rgba(255,255,255,.22) 0 7deg,transparent 7deg 20deg);-webkit-mask:radial-gradient(circle,#000 8%,transparent 62%);mask:radial-gradient(circle,#000 8%,transparent 62%);animation:rspin 40s linear infinite}
@keyframes rspin{to{transform:rotate(360deg)}}
.rwin .stars{position:absolute;inset:0}
.rwin .stars b{position:absolute;width:var(--s);height:var(--s);background:#fff6dc;clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:rtw 2.4s ease-in-out infinite;animation-delay:var(--d);opacity:0}
@keyframes rtw{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1) rotate(60deg)}}
.rchars{position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-end;transform:translateX(var(--px,0px)) rotate(var(--lean,0deg));transform-origin:50% 100%}
.rchars img.act{animation:var(--an) .8s cubic-bezier(.3,1.4,.5,1) both,rfloat 3.2s ease-in-out .8s infinite}
@keyframes a-jump{0%{transform:scale(1,1)}25%{transform:scale(1.12,.84)}55%{transform:translateY(-26px) scale(.94,1.12) rotate(5deg)}100%{transform:none}}
@keyframes a-spin{0%{transform:perspective(500px) rotateY(0)}100%{transform:perspective(500px) rotateY(720deg)}}
@keyframes a-flip{0%{transform:translateY(0) rotate(0)}40%{transform:translateY(-38px) rotate(-200deg)}100%{transform:translateY(0) rotate(-360deg)}}
@keyframes a-wiggle{0%,100%{transform:rotate(0)}15%{transform:rotate(-9deg) scaleX(1.05)}35%{transform:rotate(8deg) scaleX(.96)}55%{transform:rotate(-6deg)}75%{transform:rotate(4deg)}}
@keyframes a-boing{0%{transform:scale(1)}20%{transform:scale(1.3,.72)}45%{transform:scale(.8,1.25)}70%{transform:scale(1.1,.92)}100%{transform:scale(1)}}
@keyframes a-swing{0%{transform:rotate(0)}20%{transform:rotate(-16deg)}45%{transform:rotate(13deg)}70%{transform:rotate(-7deg)}100%{transform:rotate(0)}}
@keyframes a-zoom{0%{transform:scale(1)}35%{transform:scale(1.28) rotate(-4deg)}100%{transform:scale(1)}}
.rbub{position:absolute;left:50%;top:7%;transform:translate(-50%,0) scale(.5);padding:6px 12px;border-radius:14px;background:#fffaf0;color:#2a2038;font-size:13px;font-weight:600;line-height:1.3;white-space:nowrap;pointer-events:none;opacity:0;box-shadow:0 4px 14px rgba(0,0,0,.3);z-index:3}
.rbub:after{content:"";position:absolute;left:50%;bottom:-5px;width:10px;height:10px;margin-left:-5px;background:#fffaf0;transform:rotate(45deg)}
.rbub.show{animation:rbub 1.5s ease both}
@keyframes rbub{0%{opacity:0;transform:translate(-50%,10px) scale(.5)}15%{opacity:1;transform:translate(-50%,0) scale(1.06)}25%{transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-8px) scale(.96)}}
.rhint{position:absolute;left:0;right:0;bottom:3%;text-align:center;font-size:12px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6);pointer-events:none;animation:rhint 2.2s ease-in-out 2.4s infinite;opacity:0}
@keyframes rhint{0%,100%{opacity:0}50%{opacity:.95}}
.rwin.hype .rays{animation-duration:3s}
.rchars img{display:block;height:92%;width:auto;max-width:96%;object-fit:contain;transform-origin:50% 100%;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45));animation:rpop .8s cubic-bezier(.2,1.4,.4,1) 1.3s both,rfloat 3.2s ease-in-out 2.1s infinite;cursor:pointer;-webkit-tap-highlight-color:transparent}
.rchars.two img{height:74%;max-width:56%;margin:0 -7%}
.rchars.two img:nth-child(2){animation-delay:1.5s,2.4s;margin-bottom:5%}
.rchars img.jump{animation:rjump .6s cubic-bezier(.3,1.6,.5,1) both,rfloat 3.2s ease-in-out .6s infinite}
@keyframes rpop{0%{opacity:0;transform:translateY(40px) scale(.4) rotate(-8deg)}100%{opacity:1;transform:none}}
@keyframes rfloat{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-7px) rotate(1.2deg)}}
@keyframes rjump{0%{transform:scale(1,1)}25%{transform:scale(1.12,.86)}55%{transform:translateY(-22px) scale(.94,1.1) rotate(5deg)}100%{transform:none}}
.rpuff{position:absolute;width:10px;height:10px;pointer-events:none;background:var(--pc);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:rpf .9s ease-out forwards}
@keyframes rpf{to{transform:translate(var(--dx),var(--dy)) rotate(240deg) scale(.2);opacity:0}}
.pmas{position:relative;display:flex;align-items:center;gap:12px;margin:8px 0 0;padding:8px 12px 8px 8px;border-radius:14px;background:linear-gradient(100deg,color-mix(in srgb,var(--mc) 26%,transparent),rgba(255,255,255,.04));border:1px solid color-mix(in srgb,var(--mc) 55%,transparent);overflow:hidden;opacity:0;transform:translateX(-18px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,1.2,.4,1)}
.pmas.in{opacity:1;transform:none}
.pmas img{flex:none;height:92px;width:auto;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));cursor:pointer;animation:rfloat 3.4s ease-in-out infinite;transform-origin:50% 100%;-webkit-tap-highlight-color:transparent}
.pmas img.jump{animation:rjump .6s cubic-bezier(.3,1.6,.5,1) both,rfloat 3.4s ease-in-out .6s infinite}
.pmas span{font-size:14px;line-height:1.5}
.pmas b{display:block;font-size:12px;letter-spacing:.06em;color:var(--mc);text-transform:uppercase}
.pmas:before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.14) 50%,transparent 60%);transform:translateX(-120%);animation:rsw 4.5s ease-in-out 1.5s infinite}
@keyframes rsw{60%,100%{transform:translateX(120%)}}
.rank{display:flex;flex-direction:column;gap:8px}
.rrow{display:flex;align-items:center;gap:10px;padding:6px 12px 6px 8px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);opacity:0;transform:translateX(-14px);transition:opacity .5s ease calc(var(--i)*.12s),transform .5s cubic-bezier(.2,1.2,.4,1) calc(var(--i)*.12s)}
.rrow.top{background:color-mix(in srgb,var(--mc) 22%,transparent);border-color:var(--mc);box-shadow:0 0 18px color-mix(in srgb,var(--mc) 40%,transparent)}
.rank.in .rrow{opacity:1;transform:none}
.rrow:not(.top) img{filter:grayscale(.55) brightness(.85)}
.rrow .rno{flex:none;width:20px;text-align:center;font-weight:700;color:var(--mc)}
.rrow img{flex:none;height:46px;width:auto}
.rrow.top img{height:58px;animation:rfloat 3s ease-in-out infinite}
.rin{flex:1;min-width:0}.rnm{font-size:14px}.rnm b{color:var(--mc)}.rnm small{opacity:.7;font-size:11px}
.rbar{height:7px;border-radius:4px;background:rgba(255,255,255,.1);margin-top:5px;overflow:hidden}
.rbar i{display:block;height:100%;width:0;background:var(--mc);border-radius:4px;transition:width 1s cubic-bezier(.2,.8,.2,1) calc(var(--i)*.12s + .3s)}
.rank.in .rbar i{width:var(--w)}
.rsc{font-weight:700;font-size:18px}.rsc small{font-size:11px;opacity:.6}
@media (prefers-reduced-motion:reduce){.rrow,.rbar i{transition:none!important}.rwin .rays,.rwin .stars b,.rchars img,.pmas img,.pmas:before{animation:none!important}.rwin .stars b{opacity:.8}.pmas{transition:none}}`;
document.head.appendChild(st);
const dk=(h,t)=>{const c=hx(h);return '#'+c.map(v=>Math.round(v*(1-t)+18*t).toString(16).padStart(2,'0')).join('')};
function puff(host,x,y,col){for(let i=0;i<9;i++){const e=document.createElement('i');e.className='rpuff';const a=i/9*6.283+Math.random()*.5,r=34+Math.random()*34;e.style.cssText='left:'+x+'px;top:'+y+'px;--pc:'+col+';--dx:'+Math.cos(a)*r+'px;--dy:'+Math.sin(a)*r+'px';host.appendChild(e);setTimeout(()=>e.remove(),950)}}
const LINES={DGD:['ลองจัดใหม่ดูสิ!','เส้นนี้ต้องเป๊ะ','ไอเดียมาแล้ว!','ขอปรับอีกนิดนะ'],DGA:['สีสดๆ ต้องมา!','วาดต่ออีกนิด','ศิลป์คือชีวิต!','เลอะสีแล้วนะ'],AFX:['ไฟ กล้อง แอ็กชัน!','คัตตัดนี้เจ๋ง','ฉากนี้ต้องว้าว','เก็บอีกเทค!'],IGD:['เลเวลอัป!','ขอเล่นอีกรอบ','ด่านนี้ง่ายมาก','เกมเริ่ม!'],DEN:['ขึ้นเวทีกัน!','เสียงดังๆ เลย','โชว์ต้องดำเนินต่อ','ปรบมือหน่อย!']};
const ACTS=['a-jump','a-spin','a-wiggle','a-flip','a-boing','a-swing','a-zoom'];
function bindAct(img,host,col,k){let n=0,combo=0,ct=0,bt=0;const bub=host.querySelector('.rbub'),hint=host.querySelector('.rhint');
  img.addEventListener('click',e=>{
    const now=performance.now();combo=now-ct<1100?combo+1:1;ct=now;
    const an=ACTS[(n++ +Math.floor(Math.random()*3))%ACTS.length];
    img.classList.remove('act');img.style.setProperty('--an',an);void img.offsetWidth;img.classList.add('act');
    const r=host.getBoundingClientRect();puff(host,e.clientX-r.left,e.clientY-r.top,col);
    if(hint)hint.remove();
    if(bub){const L=LINES[k]||LINES.DGD;bub.textContent=combo>=5?'สุดยอดไปเลย!':L[Math.floor(Math.random()*L.length)];bub.classList.remove('show');void bub.offsetWidth;bub.classList.add('show')}
    if(combo>=5){combo=0;host.classList.add('hype');setTimeout(()=>host.classList.remove('hype'),2200);for(let i=0;i<7;i++)setTimeout(()=>puff(host,r.width*(.15+Math.random()*.7),r.height*(.25+Math.random()*.55),i%2?'#fff6dc':col),i*90)}
    try{sfx('pick')}catch(_){}try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}});
}
function bindJump(img,host,col){img.addEventListener('click',e=>{img.classList.remove('jump');void img.offsetWidth;img.classList.add('jump');const r=host.getBoundingClientRect();puff(host,e.clientX-r.left,e.clientY-r.top,col);try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}});}
const _rh=window.resultHTML;
window.resultHTML=function(){let h=_rh.apply(this,arguments);const rk=rank(10),ms=S.result.m.slice().sort((x,y)=>rk.indexOf(x)-rk.indexOf(y));
  const col=MJ[ms[0]].c;
  const stars=Array.from({length:12},(_,i)=>'<b style="left:'+(6+hash(i,3,1)*88).toFixed(0)+'%;top:'+(6+hash(i,5,2)*70).toFixed(0)+'%;--s:'+(7+hash(i,1,7)*10).toFixed(0)+'px;--d:'+(hash(i,2,3)*2.4).toFixed(2)+'s"></b>').join('');
  const win='<div class="rwin" style="--mc:'+col+';--md:'+dk(col,.72)+'"><div class="rays"></div><div class="stars">'+stars+'</div><div class="rchars">'+[ms[0]].map(m=>'<img src="'+MAS[m]+'" alt="ตัวแทนสาขา '+MJ[m].prog+'" draggable="false">').join('')+'</div><div class="rbub" aria-hidden="true"></div><div class="rhint">แตะเจ้าตัวเล็กดูสิ</div></div>';
  h=h.replace('<div class="rplate">',win+'<div class="rplate">');
  h=h.replace(/<p>เรียนได้ที่ สาขา <b>([^<]+)<\/b><\/p>/g,(m0,pg)=>{const k=PK[pg];if(!k)return m0;const c=MJ[k].c;
    return '<div class="pmas" style="--mc:'+c+'"><span><b>'+k+'</b>เรียนได้ที่ สาขา <b style="display:inline;font-size:inherit;letter-spacing:0;text-transform:none;color:'+c+'">'+pg+'</b></span></div>'});
  const t=scores(10),top=Math.max(1,...Object.values(t));
  const rows=rk.map((k,i)=>'<div class="rrow'+(i===0?' top':'')+'" style="--mc:'+MJ[k].c+';--i:'+i+'"><span class="rno">'+(i+1)+'</span><div class="rin"><div class="rnm"><b>'+k+'</b> <small>'+MJ[k].prog+'</small></div><div class="rbar"><i style="--w:'+(t[k]/top*100).toFixed(0)+'%"></i></div></div><span class="rsc">'+t[k]+'<small>/11</small></span></div>').join('');
  h=h.replace('<div class="block"><h3>ไม่ว่าจะเป็น','<div class="block"><h3>คะแนนแต่ละสาขา เรียงจากมากไปน้อย</h3><div class="rank">'+rows+'</div></div><div class="block"><h3>ไม่ว่าจะเป็น');
  return h};
const _r=window.render;window.render=function(){_r.apply(this,arguments);if(S.stage!=='result')return;
  setTimeout(()=>{const card=document.getElementById('rcard');if(!card)return;const w=card.querySelector('.rwin');if(!w||w.dataset.on)return;w.dataset.on=1;
    const ch=card.querySelector('.rchars'),col=MJ[S.result.m[0]].c;
    ch.querySelectorAll('img').forEach(i=>bindAct(i,w,col,S.result.m.slice().sort((x,y)=>rank(10).indexOf(x)-rank(10).indexOf(y))[0]));
    let tl=0,cl=0,lp=0;w.addEventListener('pointermove',e=>{const r=w.getBoundingClientRect();tl=((e.clientX-r.left)/r.width-.5)*18;const n=performance.now();if((e.buttons||e.pointerType==='touch')&&n-lp>110&&!reduce){lp=n;puff(w,e.clientX-r.left,e.clientY-r.top,Math.random()<.5?col:'#fff6dc')}});w.addEventListener('pointerleave',()=>{tl=0});
    (function loop(){if(!document.body.contains(card))return;const ry=parseFloat(card.style.getPropertyValue('--ry'))||0;cl+=(tl-cl)*.12;ch.style.setProperty('--px',(-ry*.55).toFixed(1)+'px');ch.style.setProperty('--lean',cl.toFixed(2)+'deg');requestAnimationFrame(loop)})();
    if(!reduce)setTimeout(()=>{if(document.body.contains(w)){const r=w.getBoundingClientRect();puff(w,r.width/2,r.height*.55,col);puff(w,r.width*.3,r.height*.7,'#fff6dc');puff(w,r.width*.7,r.height*.7,'#fff6dc')}},1500);
    const rkEl=document.querySelector('.rank');if(rkEl){if('IntersectionObserver' in window){const io2=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io2.disconnect()}}),{threshold:.3});io2.observe(rkEl)}else rkEl.classList.add('in')}
    const pm=[...document.querySelectorAll('.pmas')];
    
    if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.3});pm.forEach(p=>io.observe(p))}else pm.forEach(p=>p.classList.add('in'));
  },0)};
})();
