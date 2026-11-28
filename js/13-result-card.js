/* ===== result: the tribe shown as a collage card (cut-and-paste paper, like the IMAGINE CITY logo) =====
   - opens by pasting itself together: newspaper scraps in the major's colour fly in one by one and stick (each a little
     askew, like by hand), then the mascot is pasted on last, then the title as magazine cut-out letters, then two pieces of
     paper tape on the corners, and a short burst of torn scraps. js/21 plays its card-open effect first and hands over here
     (window.cardAssemble), so the card only appears once
   - tap = flip to the other side; drag = turn it by hand (past 55deg it flips); on a computer it also tilts after the mouse
   - no gloss: a hard cardboard shadow slides with the tilt, and the card moves in stop-motion steps (12 frames a second)
   - prefers-reduced-motion: no assembly, no burst, no idle sway; the card is simply there
   The card pictures are made ahead of time, one front and one back per major (tools/make-cards.py from images/frame-1.png
   and frame-2.png). A two-major result uses the major that scored higher. Only transform and opacity are animated. */
(function(){
const st=document.createElement('style');st.textContent=`
.rscene{position:relative;perspective:900px;display:flex;justify-content:center;margin:6px 0 4px;touch-action:pan-y}
.rcard{--ry:0deg;--rx:0deg;position:relative;width:min(74vw,290px);aspect-ratio:297/420;transform-style:preserve-3d;transform:rotateY(var(--ry)) rotateX(var(--rx));cursor:grab;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;outline:none}
.rcard:active{cursor:grabbing}
.rcard:focus-visible .rface,.rcard:focus-visible .rback{outline:2px solid var(--ink);outline-offset:3px}
/* hard cardboard shadow: a flat card-shaped piece behind the card, slid and squeezed with transform only */
.rshadow{position:absolute;left:50%;top:0;width:min(74vw,290px);aspect-ratio:297/420;margin-left:calc(min(74vw,290px) / -2);border-radius:4.04%/2.86%;background:rgba(6,3,18,.55);transform:translate(8px,12px);pointer-events:none;will-change:transform}
/* faces: no filter on .rcard (a filter flattens the 3D); faces may overhang (tape, flying scraps) */
.rface,.rback{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.rimg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;border-radius:4.04%/2.86%}
.rback{transform:rotateY(180deg)}
.rbits{position:absolute;inset:0;pointer-events:none}
.rbit{position:absolute;background-repeat:no-repeat;will-change:transform,opacity}
.rplate{position:absolute;left:5.72%;right:5.72%;top:79.4%;height:14.17%;padding:0 3.5%;display:flex;align-items:center;justify-content:center;text-align:center}
.rplate h2{margin:0;font-family:var(--display);font-size:22px;line-height:1.2;font-weight:500;color:#241b2b!important;width:100%}
.rcut{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.14em .1em;line-height:1.3}
.rc{display:inline-block;font-size:calc(1em * var(--s));font-family:var(--ff);font-weight:var(--fw);background:var(--bg);color:var(--fg);padding:.06em .2em .1em;transform:translateY(var(--dy)) rotate(var(--r));clip-path:var(--cp);white-space:nowrap}
.rsr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* milky paper tape on two corners, both sides */
.rtape{position:absolute;width:31%;height:7.2%;background:linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,0) 60%),rgba(234,226,203,.8);clip-path:polygon(3% 0,97% 0,100% 16%,97% 32%,100% 50%,97% 68%,100% 84%,97% 100%,3% 100%,0 84%,3% 68%,0 50%,3% 32%,0 16%);pointer-events:none}
.rtape.a{left:-8%;top:3.2%;transform:rotate(-37deg)}
.rtape.b{right:-8%;bottom:3.2%;transform:rotate(-37deg)}
.rscrap{position:absolute;left:50%;top:50%;pointer-events:none;background-repeat:no-repeat;will-change:transform,opacity}
.rcard.pre .rimg.f,.rcard.pre .rwin,.rcard.pre .rc,.rcard.pre .rtape{opacity:0}
.rscene.opening .rshadow{opacity:0}
.rscene.opened .rshadow{transition:opacity .6s ease}
.rfliphint{margin:0 0 6px;text-align:center;font-size:12.5px!important;color:var(--mute)}`;document.head.appendChild(st);
const topMajor=()=>{const rk=rank(10);return S.result.m.slice().sort((x,y)=>rk.indexOf(x)-rk.indexOf(y))[0]};
window.cardMajor=topMajor;

/* ---- title as magazine cut-outs ----
   Pieces follow Thai words from Intl.Segmenter, so they read naturally. Inside a word, text is only ever cut between
   grapheme clusters (above/below vowels and tone marks stay on their letter), and only before a leading vowel
   (เ แ โ ใ ไ, which stays with the letter after it) when both sides hold at least two letters: ออก|แบบ, ทำ|ให้, รวม|ใจ.
   A lone bare consonant left by the segmenter (ค|รี|เอ|เตอร์) is joined to the piece after it (ครี|เอ|เตอร์).
   Style per piece is fixed (hash of its index), so the shared story picture matches the page. */
const LEAD=/^[เ-ไ]/,BARE=/^[ก-ฮ]$/;
const seg=(t,g)=>window.Intl&&Intl.Segmenter?[...new Intl.Segmenter('th',{granularity:g}).segment(t)].map(s=>s.segment):(g==='word'?t.split(/(\s+)/):Array.from(t));
function cutText(t){const parts=[];
  for(const w of seg(t,'word')){if(!w.trim())continue;
    const g=seg(w,'grapheme'),cuts=[0];
    for(let i=2;i<=g.length-2;i++)if(LEAD.test(g[i]))cuts.push(i);
    cuts.push(g.length);for(let i=0;i<cuts.length-1;i++)parts.push(g.slice(cuts[i],cuts[i+1]).join(''))}
  const out=[];for(let i=0;i<parts.length;i++){if(BARE.test(parts[i])&&i+1<parts.length){parts[i+1]=parts[i]+parts[i+1];continue}out.push(parts[i])}
  return out}
function cardCut(title,col){
  const P=[['#fbf8ef','#1c1820'],['#1c1820','#fff4d6'],[col,'#15111b'],['#f2c230','#15111b'],['#2fb5a6','#0f1213'],['#e6dcc4','#2a2030']];
  let prev=-1;
  return cutText(title).map((t,i)=>{const h=k=>hash(i+3,k,17);
    let pi=Math.floor(h(1)*P.length);if(pi===prev)pi=(pi+1)%P.length;prev=pi;
    const J=[5,6,7,8,9].map(k=>+(h(k)*6).toFixed(1)),j=k=>J[k-5]+'%';
    return{t,J,bg:P[pi][0],fg:P[pi][1],ff:i%3===1?'"IBM Plex Sans Thai",sans-serif':'Mitr,"IBM Plex Sans Thai",sans-serif',fw:i%3===1?600:500,
      s:+(0.9+h(2)*.22).toFixed(3),r:+((h(3)-.5)*12).toFixed(1),dy:+((h(4)-.5)*.14).toFixed(3),
      cp:'polygon('+j(5)+' '+j(6)+',calc(100% - '+j(7)+') 0,100% calc(100% - '+j(8)+'),'+j(9)+' 100%)'}})}
window.cardCut=cardCut;
function cutHTML(title,col){return '<span class="rsr">'+esc(title)+'</span><span class="rcut" aria-hidden="true">'+cardCut(title,col).map(c=>
  '<span class="rc" style="--bg:'+c.bg+';--fg:'+c.fg+';--ff:'+c.ff.replace(/"/g,"'")+';--fw:'+c.fw+';--s:'+c.s+';--r:'+c.r+'deg;--dy:'+c.dy+'em;--cp:'+c.cp+'">'+esc(c.t)+'</span>').join('')+'</span>'}
/* largest title size whose cut-outs fit the bottom panel */
function fitTitle(card){const box=card.querySelector('.rplate'),h=box&&box.querySelector('h2'),cut=h&&h.querySelector('.rcut');if(!cut||!box.clientWidth)return;
  const W=box.clientWidth-parseFloat(getComputedStyle(box).paddingLeft)*2,H=box.clientHeight-4;
  let s=Math.min(28,W*.13);h.style.fontSize=s+'px';
  while(s>9&&(cut.scrollHeight>H||cut.scrollWidth>W+1)){s-=.5;h.style.fontSize=s+'px'}}

/* ---- the card ---- */
function init(){
  const card=document.getElementById('rcard');if(!card||card.dataset.on)return;card.dataset.on=1;
  const scene=card.parentNode,shadow=scene.querySelector('.rshadow'),k=topMajor(),col=MJ[k].c;
  fitTitle(card);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitTitle(card));
  const onRz=()=>{if(!document.body.contains(card)){removeEventListener('resize',onRz);return}fitTitle(card)};addEventListener('resize',onRz);
  let base=0,ry=0,rx=0,ty=0,hy=0,hx=0,drag=false,moved=0,lx=0,ly=0,off=0,ready=reduce,t0=performance.now(),lastW=-1e9;
  const flip=n=>{base+=n*180;card.setAttribute('aria-pressed',String((((base/180)%2)+2)%2===1))};
  card.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.rchars img'))return;drag=true;moved=0;lx=e.clientX;ly=e.clientY;card.setPointerCapture&&card.setPointerCapture(e.pointerId)});
  card.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;moved+=Math.abs(dx)+Math.abs(dy);off+=dx*.9;ty=Math.max(-22,Math.min(22,ty-dy*.3));lx=e.clientX;ly=e.clientY});
  const up=()=>{if(!drag)return;drag=false;
    if(moved<8)flip(1);else{let n=Math.round(off/180);if(!n&&Math.abs(off)>55)n=Math.sign(off);if(n)flip(n)}
    off=0};
  card.addEventListener('pointerup',up);card.addEventListener('pointercancel',()=>{drag=false;off=0});
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip(1)}});
  /* computer: tilt after the mouse while it is over the card */
  scene.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||drag||reduce)return;const r=card.getBoundingClientRect();
    const mx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2)),my=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));hy=mx*13;hx=-my*9});
  scene.addEventListener('pointerleave',()=>{hy=0;hx=0});
  const calm=()=>{hy=hx=0;ty=0;off=0;drag=false};document.addEventListener('visibilitychange',calm);
  (function loop(now){if(!document.body.contains(card)){document.removeEventListener('visibilitychange',calm);return}const t=(now-t0)/1000;
    if(!drag)ty*=.9;
    const idle=ready&&!reduce?Math.sin(t*.9)*4:0,tgt=base+off+(ready?hy:0)+idle,tgx=ty+(ready?hx:0);
    ry+=(tgt-ry)*(drag?.35:.16);rx+=(tgx-rx)*.16;if(Math.abs(tgt-ry)<.01)ry=tgt;
    /* stop-motion: the card and its shadow move on 12 frames a second (every frame when motion is reduced) */
    if(reduce||now-lastW>=83){lastW=now;
      card.style.setProperty('--ry',ry.toFixed(2)+'deg');card.style.setProperty('--rx',rx.toFixed(2)+'deg');
      if(shadow){const rel=((ry%180)+270)%180-90,c=Math.abs(Math.cos(ry*Math.PI/180));
        shadow.style.transform='translate('+(8-rel*.28).toFixed(1)+'px,'+(12+rx*.5).toFixed(1)+'px) scaleX('+Math.max(.04,c).toFixed(3)+')'}}
    requestAnimationFrame(loop)})(t0);

  /* ---- pasting the card together ---- */
  let done=false;
  function finish(){if(done)return;done=true;card.classList.remove('pre');const f=card.querySelector('.rimg.f');if(f)f.style.opacity='';const b=card.querySelector('.rbits');if(b)b.textContent='';ready=true}
  function assemble(){
    if(done)return;
    if(reduce){finish();return}
    const front=card.querySelector('.rface'),bits=card.querySelector('.rbits'),fimg=card.querySelector('.rimg.f'),src=fimg.getAttribute('src');
    fimg.style.opacity='0';card.classList.remove('pre');
    const W=card.offsetWidth,H=card.offsetHeight,C=3,R=4,ov=.025,order=[...Array(C*R).keys()].sort((a,b)=>hash(a,9,4)-hash(b,9,4));
    const anims=[];let at=0;
    order.forEach((n,i)=>{const c=n%C,r=Math.floor(n/C);
      const x0=Math.max(0,c/C-ov),y0=Math.max(0,r/R-ov),x1=Math.min(1,(c+1)/C+ov),y1=Math.min(1,(r+1)/R+ov),pw=x1-x0,ph=y1-y0;
      const el=document.createElement('i');el.className='rbit';
      el.style.cssText='left:'+x0*100+'%;top:'+y0*100+'%;width:'+pw*100+'%;height:'+ph*100+'%;background-image:url('+src+');background-size:'+(100/pw)+'% '+(100/ph)+'%;background-position:'+(pw<1?x0/(1-pw)*100:0)+'% '+(ph<1?y0/(1-ph)*100:0)+'%';
      bits.appendChild(el);
      const cx=(x0+pw/2-.5)*W,cy=(y0+ph/2-.5)*H,d=Math.hypot(cx,cy)||1,far=150+hash(n,2,8)*90,r0=(hash(n,3,8)-.5)*50,r1=(hash(n,4,8)-.5)*7;
      const dx=cx/d*far+(hash(n,5,8)-.5)*60,dy=cy/d*far-40-hash(n,6,8)*60;el.dataset.r=r1.toFixed(1);
      anims.push(el.animate([{transform:'translate('+dx.toFixed(0)+'px,'+dy.toFixed(0)+'px) rotate('+r0.toFixed(1)+'deg) scale(1.18)',opacity:0},
        {transform:'translate(0,0) rotate('+(r1*1.6).toFixed(1)+'deg) scale(.97)',opacity:1,offset:.72},
        {transform:'rotate('+r1.toFixed(1)+'deg)',opacity:1}],{duration:430,delay:i*75,easing:'cubic-bezier(.2,.8,.3,1.1)',fill:'forwards'}));
      at=i*75+430});
    /* all scraps press flat together, then the real picture takes over (it looks the same, so nothing jumps) */
    setTimeout(()=>{if(!document.body.contains(card))return;
      [...bits.children].forEach(el=>el.animate([{transform:'rotate('+el.dataset.r+'deg)'},{transform:'none'}],{duration:140,easing:'ease-out',fill:'forwards'}));anims.forEach(a=>{try{a.cancel()}catch(_){}});
      setTimeout(()=>{fimg.style.opacity='';bits.textContent=''},150)},at+40);
    /* mascot last of the picture: dropped on and pressed down */
    const win=card.querySelector('.rwin'),t1=at+120;
    if(win)win.animate([{transform:'translateY(-38%) rotate(-7deg) scale(1.1)',opacity:0},{transform:'translateY(2%) rotate(1.5deg) scale(.98)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:480,delay:t1,easing:'cubic-bezier(.2,.9,.3,1.2)',fill:'backwards'});
    /* cut-out letters, one by one */
    const rcs=[...card.querySelectorAll('.rc')],t2=t1+380;
    rcs.forEach((el,i)=>{const r=getComputedStyle(el).getPropertyValue('--r').trim()||'0deg',dy=getComputedStyle(el).getPropertyValue('--dy').trim()||'0em';
      el.animate([{transform:'translateY('+dy+') rotate(calc('+r+' * 3)) scale(1.7)',opacity:0},{transform:'translateY('+dy+') rotate('+r+') scale(.94)',opacity:1,offset:.75},{transform:'translateY('+dy+') rotate('+r+')',opacity:1}],
        {duration:300,delay:t2+i*80,easing:'cubic-bezier(.3,.9,.4,1.2)',fill:'backwards'})});
    /* paper tape on two corners, a little bounce as it sticks; the back gets its tape at the same time */
    const t3=t2+rcs.length*80+180;
    card.querySelectorAll('.rface .rtape').forEach((el,i)=>el.animate([{transform:'translateY(-14px) rotate(-37deg) scale(1.35)',opacity:0},{transform:'rotate(-37deg) scale(.92)',opacity:1,offset:.6},{transform:'rotate(-37deg) scale(1.04)',offset:.82},{transform:'rotate(-37deg)',opacity:1}],
      {duration:380,delay:t3+i*150,easing:'ease-out',fill:'backwards'}));
    const t4=t3+150+380;
    setTimeout(()=>{if(document.body.contains(card)){burst();ready=true}},t4);
    setTimeout(()=>{done=true},t4)}
  /* torn scraps in the major's colour fly off the card for a moment */
  function burst(){if(reduce)return;const W=card.offsetWidth,H=card.offsetHeight,bk='images/card-back-'+k+'.webp';
    for(let i=0;i<18;i++){const el=document.createElement('i');el.className='rscrap';const s=11+hash(i,1,5)*20,a=hash(i,2,5)*6.283;
      const sx=Math.cos(a)*W*.52,sy=Math.sin(a)*H*.52,far=55+hash(i,3,5)*80,dx=Math.cos(a)*far,dy=Math.sin(a)*far-20,rot=(hash(i,4,5)-.5)*540;
      const p=()=>(hash(i,5+Math.floor(Math.random()*9),5)*30).toFixed(0)+'%';
      el.style.cssText='width:'+s+'px;height:'+(s*(.6+hash(i,6,5)*.7)).toFixed(0)+'px;margin:-'+s/2+'px 0 0 -'+s/2+'px;background-image:url('+bk+');background-size:900% 900%;background-position:'+(hash(i,7,5)*100).toFixed(0)+'% '+(hash(i,8,5)*100).toFixed(0)+'%;clip-path:polygon(0 '+p()+','+p()+' 0,100% '+p()+',calc(100% - '+p()+') 100%,'+p()+' calc(100% - '+p()+'))';
      scene.appendChild(el);
      el.animate([{transform:'translate('+sx.toFixed(0)+'px,'+sy.toFixed(0)+'px) rotate(0) scale(.5)',opacity:1},{transform:'translate('+(sx+dx).toFixed(0)+'px,'+(sy+dy+30).toFixed(0)+'px) rotate('+rot.toFixed(0)+'deg) scale(1)',opacity:0}],
        {duration:650+hash(i,9,5)*350,easing:'cubic-bezier(.15,.7,.3,1)'}).onfinish=()=>el.remove()}}
  if(!reduce)card.classList.add('pre');
  window.cardAssemble=assemble;
  /* safety: if js/21 never hands over (e.g. its picture failed), paste the card anyway */
  setTimeout(()=>{if(document.body.contains(card)&&!done&&card.classList.contains('pre')&&!scene.classList.contains('opening'))assemble()},4500);
}
const _rh=window.resultHTML;
window.resultHTML=function(){let h=_rh.apply(this,arguments);
  const k=topMajor(),col=MJ[k].c,tape='<i class="rtape a"></i><i class="rtape b"></i>';
  h=h.replace(/<h2 class="res-title"([^>]*)>([\s\S]*?)<\/h2>/,(m0,at,title)=>{const plain=title.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
    return '<div class="rscene"><div class="rshadow" aria-hidden="true"></div><div class="rcard'+(reduce?'':' pre')+'" id="rcard" role="button" tabindex="0" aria-pressed="false" aria-label="การ์ดผลของเธอ: '+esc(plain)+' (แตะหรือลากเพื่อพลิกการ์ด)"><div class="rface"><img class="rimg f" src="images/card-front-'+k+'.webp" alt="" draggable="false"><div class="rbits"></div><div class="rplate"><h2 class="res-title"'+at+'>'+cutHTML(plain,col)+'</h2></div>'+tape+'</div><div class="rback"><img class="rimg" src="images/card-back-'+k+'.webp" alt="" draggable="false">'+tape+'</div></div></div><p class="rfliphint" aria-hidden="true">แตะหรือลากการ์ดเพื่อพลิกดูอีกด้าน</p><!--rshare-->'});
  return h};
const _r=window.render;window.render=function(){_r.apply(this,arguments);if(S.stage==='result')setTimeout(init,0)};
})();
