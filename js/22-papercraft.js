/* ===== papercraft pop-up scenes (three.js) on ten story pages =====
   Scenes 1.3, 2.1, 2.3, 5.1, 5.2 and the five alleys open as paper pop-up dioramas in a transparent layer
   (#paper) over the illustration layer, above the moving city and sky. Every other page stays exactly as it was.
   The scene code lives in papercraft/ (shared.js + scenes/), loaded with import().
   - Nothing is built when a page opens: three.js and the NEXT paper scene are loaded and built ahead, in small
     idle-time pieces, while the player reads the page before it (papercraft/shared.js: st.prepare / st.show).
     5.1 / 5.2 colour the city by the score: from page 6 on they are built ahead with a guess (the player's leading
     major), which loads the files and compiles every shader while the question is read; the answer then rebuilds
     them with the real score in idle pieces during the 1.5 s trip, reusing those shaders (the guess is kept until
     the rebuild is done, so its shaders stay compiled). An alley is built for the most likely major the same way.
     If a page opens before its scene is ready, the old picture shows until it is, then the paper scene fades in.
   - On those pages the old 2D vignette (V.v5/v6/v8/v13/v14) is not drawn; on 2.3 the shop pictures (js/20) stay hidden.
   - While a paper scene is up (window.PAPER_ON), #sc is not repainted once its picture is still (nothing changes there).
     Everything else is drawn at full quality; js/23-quality.js lowers quality step by step only on slow devices.
   - Picking an answer: doAct(m) also plays the scene's reaction (in an alley: the option chosen, from S.alleyPick).
   - Devices that cannot show the 3D scenes get a picture of each scene instead, rendered from the real 3D scene at
     full quality (papercraft/fallback/: one for landscape, one for portrait; index.json = where each sits). It floats
     gently and glows in the colour of the major picked. Reasons (the ?fps=1 meter says which): no WebGL2, software
     graphics (DEV.gpu 'soft', js/00-device.js), the files failed to load, or a slow device (under 20 fps for 3 s at
     the lowest automatic quality). Devices that can show 3D always get the 3D scene. ?paper=1 forces 3D even in
     software; ?paper=0 turns the paper scenes off (no 3D, no picture), ?paper=img shows the pictures (to compare).
   - The paper canvas follows the site's pixel limit for big screens (DEV.dpr, js/00-device.js).
   URL: ?fps=1 shows a frame-rate meter, ?batch=0 turns off the draw-call merging, ?paper=0 turns paper scenes off.
   Tweak: SCN_P (which page -> which scene file, and how much colour the town has there). */
(function(){
const SCN_P={2:['1-3-crossroads',.45,'v5'],3:['2-1-broken-bridge',.55,'v6'],5:['2-3-old-shop',.55,'v8'],9:['5-1-on-stage',.85,'v13'],10:['5-2-colour-returns',1,'v14']};
const BASE=new URL('papercraft/',document.baseURI).href,QS=new URLSearchParams(location.search);
const idle=(fn,t)=>window.requestIdleCallback?requestIdleCallback(fn,{timeout:t||800}):setTimeout(fn,60);

const css=document.createElement('style');
css.textContent='#paper{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;visibility:hidden;transition:opacity .5s ease,visibility 0s linear .5s}#paper.on{opacity:1;visibility:visible;transition:opacity .5s ease}@media (prefers-reduced-motion:reduce){#paper,#paper.on{transition:none}}';
document.head.appendChild(css);
const cv=document.createElement('canvas');cv.id='paper';cv.setAttribute('aria-hidden','true');
document.getElementById('sc').after(cv);

let lib=null,st=null,dead=false,libP=null,cur=null,tok=0,active=null,orient='',prep=null,scDirty=false;
window.PAPER_ON=false;
let why='';   // why the paper scenes are off (shown by the ?fps=1 meter)
const off=r=>{dead=true;why=why||r};
const noPic=QS.get('paper')==='0';
if(noPic)off('?paper=0');   // ?paper=0: the site without paper scenes (to compare)
if(QS.get('paper')==='img')off('?paper=img');   // the pictures instead of 3D (to compare)
/* no WebGL2 in this browser at all; a WebGL2 that exists but will not start is caught when the 3D stage is made
   (createStage -> null). A test context here would cost ~1 s on the home page, so none is made. */
if(!dead&&typeof WebGL2RenderingContext==='undefined')off('no WebGL2');
/* in-app browsers (LINE, Instagram, Facebook, Messenger): their web views often break or starve WebGL -> pictures */
if(!dead&&QS.get('paper')!=='1'){const ia=/\bLine\/|Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger/i.exec(navigator.userAgent||'');if(ia)off('in-app browser ('+ia[0].replace(/\/$/,'')+')')}
if(window.DEV&&DEV.gpu==='soft'&&QS.get('paper')!=='1')off('software graphics ('+(DEV.name||'?').slice(0,40)+')');   // drawn in software: far too slow for WebGL scenes
const mods={};
const landNow=()=>innerWidth>=innerHeight?'land':'port';
/* a paper page: id, scene file and build context; the key also carries the score for 5.1 / 5.2 */
function target(stage,si,m){
  if(stage==='scene'&&SCN_P[si]){const p=SCN_P[si],sc=si>=9?scores(10):undefined;return{id:'s'+si,key:'s'+si+(sc?JSON.stringify(sc):''),file:'scenes/'+p[0]+'.js',vk:p[2],ctx:{colour:p[1],scores:sc}}}
  if(stage==='alley'&&m)return{id:'a'+m,key:'a'+m,file:'scenes/alley-'+m+'.js',vk:null,ctx:{colour:.7,alley:m}};
  return null}
const want=()=>target(S.stage,S.si,S.alley[S.ai]);
function loadLib(){
  if(!libP)libP=import(BASE+'shared.js').then(m=>{lib=m;st=m.createStage(cv,{batch:QS.get('batch')!=='0',adapt:()=>false,dpr:m=>window.DEV?DEV.dpr(innerWidth,innerHeight,m):m})/* paper at full resolution (big screens: the pixel limit) */;if(!st){off('no WebGL2');throw new Error('no WebGL2')}st.layout(free());return new Promise(r=>idle(()=>{try{st.warmup()}catch(e){}r(m)},2000))}).catch(e=>{off('files did not load ('+String(e&&e.message||e).slice(0,40)+')');console.warn('papercraft off:',e);throw e});
  return libP}
function loadScene(file){return mods[file]||(mods[file]=import(BASE+file).then(m=>m.default))}

/* the band for the scene: below the progress bar and the sound button, above the question box */
function free(){
  const W=innerWidth,H=innerHeight,r=document.getElementById('screen').getBoundingClientRect();
  return{W,H,left:0,right:W,top:62,bottom:Math.max(170,r.top+scrollY-12),boxLeft:r.left,boxRight:r.right}}

/* ---- build ahead, in idle time ---- */
function prepare(t){
  if(prep&&prep.key===t.key)return prep;
  /* a finished guess (same scene, other score / alley) stays alive until this build is done: its materials keep
     the compiled shader programs, so the rebuild reuses them instead of compiling again during the page change */
  const old=prep&&prep.slot&&prep.orient===landNow()?prep:null;
  if(old){prep=null;old.cancelled=true}else dropPrep();
  const my={key:t.key,t,slot:null,cancelled:false,orient:landNow()};prep=my;
  my.promise=loadLib().then(()=>loadScene(t.file)).then(def=>{
    if(my.cancelled)throw new Error('cancelled');
    st.layout(free());
    return st.prepare(def,t.ctx,{cancelled:()=>my.cancelled,urgent:()=>{const w=want();return !!w&&w.key===my.key}})}).then(slot=>{
    if(my.cancelled){st.discard(slot);throw new Error('cancelled')}
    my.slot=slot;return slot});
  my.promise.catch(()=>{if(prep===my)prep=null});
  if(old){const free=()=>{if(st)st.discard(old.slot)};my.promise.then(free,free)}
  return my}
function dropPrep(){if(!prep)return;prep.cancelled=true;if(prep.slot)st.discard(prep.slot);prep=null}
/* the paper page most likely to come next (after: the answer on this page is already in S) */
function upcoming(after){
  if(S.stage==='intro'||S.stage==='rules'||S.stage==='home')return target('scene',2);
  if(S.stage==='alley'){if(S.ai+1<S.alley.length)return target('alley',0,S.alley[S.ai+1]);return null}
  if(S.stage!=='scene')return null;
  const si=S.si;
  if(si<2)return target('scene',2);
  if(si===2)return target('scene',3);
  if(si===3||si===4)return target('scene',5);
  if(si===5){
    if(after)return target('alley',0,calcAlleys()[0]);
    const vote={},keep=S.picks[5],wk=Object.assign({},S.w);   // which alley each of the five answers would lead to
    try{SC[5].o.forEach(o=>{S.picks[5]=o[0];const a=calcAlleys()[0];vote[a]=(vote[a]||0)+1})}catch(e){}
    S.picks[5]=keep;Object.assign(S.w,wk);
    const best=Object.keys(vote).sort((a,b)=>vote[b]-vote[a])[0];return best?target('alley',0,best):null}
  if(after&&(si===8||si===9))return target('scene',si+1);
  if(si>=6&&si<=9)return guess(si<9?9:10);   // still reading: build 5.1 / 5.2 with a guessed score (files + shaders ready)
  return null}
/* 5.1 / 5.2 as they would be if every answer still open went to the leading major */
function guess(nx){
  const keep=S.picks.slice(),lead=rank(nx-1)[0];
  try{for(let k=0;k<nx;k++)if(!S.picks[k])S.picks[k]=lead;return target('scene',nx)}
  finally{keep.forEach((v,i)=>{S.picks[i]=v})}}
function planNext(after){
  if(dead)return;
  idle(()=>{let t;try{t=upcoming(after)}catch(e){return}if(!t)return;
    const w=want();if(w&&!(active&&active.id===w.id))return;   // this page's own scene is still on its way: leave it be (by id: an answer changes 5.1's score key)
    prepare(t)},after?100:1500)}

/* ---- show / leave ---- */
async function sync(){
  const w=want(),key=w?w.key:null;
  if(key===cur)return;
  cur=key;const my=++tok;
  if(!w){leave(my);return}
  if(dead){fbShow(w);return}
  fbHide();
  /* the 3D scene is late (slow network / device): show its picture meanwhile; the 3D scene replaces it when ready */
  setTimeout(()=>{const n=want();if(tok===my&&!active&&!dead&&n&&n.key===key){FB.late='3D scene not ready after 5 s (picture until it is)';fbShow(w)}},5000);
  let p=prep&&prep.key===w.key?prep:prepare(w);
  try{
    await p.promise;
    if(tok!==my)return;
    if(p.orient!==landNow()){dropPrep();p=prepare(w);await p.promise;if(tok!==my)return}
    showSlot(p,w);
  }catch(e){if(tok===my){active=null;window.PAPER_ON=false;cv.classList.remove('on');
    /* the 3D files or scene failed (not just a newer page change): pictures from now on, so the scene never just disappears */
    if(!(e&&e.message==='cancelled')){off('3D failed to load ('+String(e&&e.message||e).slice(0,60)+')');cur=null;sync()}}}
}
function showSlot(p,w){
  fbHide();orient=landNow();st.layout(free());
  st.show(p.slot);if(prep===p)prep=null;
  active=w;cv.classList.add('on');window.PAPER_ON=true;scDirty=true;shop();
  planNext(false);
}
function leave(my){
  fbHide();active=null;window.PAPER_ON=false;shop();
  if(st&&st.root){st.close();setTimeout(()=>{if(tok===my)cv.classList.remove('on')},900)}
  planNext(false)}
function shop(){const el=document.getElementById('shopbg');if(el&&(active||FB.id)&&S.stage==='scene'&&S.si===5)el.classList.remove('on')}

/* ---- the picture instead of 3D ---- */
const FB={el:null,id:'',man:null,manP:null,glowT:0,late:''};
/* the GPU drops the 3D context (driver reset, memory pressure) -> pictures from now on */
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();off('WebGL context lost');active=null;window.PAPER_ON=false;cv.classList.remove('on');cur=null;sync()});
function fbMan(){return FB.manP||(FB.manP=fetch(BASE+'fallback/index.json').then(r=>r.json()).then(j=>FB.man=j).catch(()=>null))}
function fbPlace(){
  const e=FB.el;if(!e||!FB.id||!FB.man)return;const o=landNow(),m=FB.man[FB.id]&&FB.man[FB.id][o];if(!m)return;
  const B=free(),rb=m.band,k=Math.min((B.right-B.left)/(rb[2]-rb[0]),(B.bottom-B.top)/(rb[3]-rb[1])),
    cx=(B.left+B.right)/2+(m.box[0]+m.box[2]/2-(rb[0]+rb[2])/2)*k,cy=(B.top+B.bottom)/2+(m.box[1]+m.box[3]/2-(rb[1]+rb[3])/2)*k;
  e.style.width=m.box[2]*k+'px';e.style.height=m.box[3]*k+'px';e.style.left=(cx-m.box[2]*k/2)+'px';e.style.top=(cy-m.box[3]*k/2)+'px'}
function fbShow(w){
  if(noPic)return;
  if(!FB.el){const s=document.createElement('style');
    s.textContent='#paperimg{position:absolute;pointer-events:none;opacity:0;transition:opacity .5s ease,filter .5s ease;animation:pfloat 7s ease-in-out infinite}#paperimg.on{opacity:1}'
      +'#paperimg.glow{filter:drop-shadow(0 0 10px var(--gc)) drop-shadow(0 0 26px var(--gc))}'
      +'@keyframes pfloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(.25deg)}}@media (prefers-reduced-motion:reduce){#paperimg{animation:none;transition:none}}';
    document.head.appendChild(s);FB.el=document.createElement('img');FB.el.id='paperimg';FB.el.alt='';FB.el.setAttribute('aria-hidden','true');FB.el.decoding='async';cv.after(FB.el)}
  const my=w.id;FB.id=my;shop();
  fbMan().then(()=>{if(FB.id!==my||!FB.man||!FB.man[my])return;const m=FB.man[my][landNow()];if(!m)return;
    const e=FB.el;e.classList.remove('on','glow');e.onload=()=>{if(FB.id===my){fbPlace();e.classList.add('on')}};e.src=BASE+'fallback/'+m.f;if(e.complete&&e.naturalWidth)e.onload()})}
function fbHide(){FB.id='';FB.late='';if(FB.el)FB.el.classList.remove('on','glow')}
function fbGlow(m){if(!FB.el||!FB.id||!MJ[m])return;FB.el.style.setProperty('--gc',MJ[m].c);FB.el.classList.add('glow');clearTimeout(FB.glowT);FB.glowT=setTimeout(()=>FB.el.classList.remove('glow'),1600)}
/* a device that stays under 20 fps at the lowest automatic quality with a 3D scene up gets the pictures from then on */
(function(){let n=0,t0=0,bad=0;(function f(now){requestAnimationFrame(f);
  if(dead||!active||window.QFORCED||document.hidden){t0=0;bad=0;return}if(!t0){t0=now;n=0;return}n++;if(now-t0<1000)return;
  const fps=n*1000/(now-t0);t0=now;n=0;if((window.QL||0)>=5&&fps<20){if(++bad>=3)goSlow()}else bad=0})(0)})();
function goSlow(){off('slow device (under 20 fps at the lowest quality)');dropPrep();active=null;window.PAPER_ON=false;cv.classList.remove('on');
  if(st){st.frozen=true}cur=null;sync()}

/* hide the old 2D vignette on the pages that now have a paper scene (only while the paper scene is up) */
Object.values(SCN_P).forEach(p=>{const k=p[2],f=V[k];V[k]=function(t){if(active&&active.vk===k)return;return f.apply(this,arguments)}});

/* pause / slow what sits behind the paper scene: #sc is drawn once more (without the vignette), then held */
const _ds=window.drawScene;
window.drawScene=function(ms){
  if(window.PAPER_ON&&!scDirty&&SCN.f>=1&&SCN.k===sceneKey()&&!SCN.am)return;
  const r=_ds.apply(this,arguments);if(SCN.f>=1)scDirty=false;return r};

const _render=window.render;
window.render=function(){_render.apply(this,arguments);shop();sync()};

const _doAct=window.doAct;
window.doAct=function(m){_doAct.apply(this,arguments);
  if(FB.id)fbGlow(m);
  if(active&&st&&st.root){let i=0;if(S.stage==='alley'&&AL[m]){i=AL[m].o.findIndex(o=>o[1]===S.alleyPick[m]);if(i<0)i=0}st.react(m,i)}
  planNext(true)};

let rz=0;
addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{
  if(FB.id){const w=want();if(w){FB.id='';fbShow(w)}}
  if(!st)return;
  const o=landNow();
  if(prep&&prep.orient!==o){const t=prep.t;dropPrep();if(!active)prepare(t)}
  if(!active){st.layout(free());return}
  if(o!==orient){orient=o;st.layout(free());st.mount(st.def,st.ctx);st.layout(free())}else st.layout(free())},150)});

/* try-out shortcut: index.html?go=1-3 | 2-1 | 2-3 | 5-1 | 5-2 | alley-DGD (DGA AFX IGD DEN) jumps straight to that page.
   Earlier answers are filled in round the five majors so 5.1 / 5.2 have some colour to show. */
(function(){const go=new URLSearchParams(location.search).get('go');if(!go)return;
  const SI={'1-3':2,'2-1':3,'2-3':5,'5-1':9,'5-2':10},am=/^alley-(DGD|DGA|AFX|IGD|DEN)$/.exec(go),si=am?6:SI[go];if(si===undefined)return;
  const fill=n=>{for(let k=0;k<n;k++){const m=SC[k].o[k%SC[k].o.length][0];S.picks[k]=m;S.w[m]++}};
  if(am){fill(6);S.alley=[am[1]];S.ai=0;S.stage='alley';newPerm(4)}else{fill(si);S.stage='scene';S.si=si;newPerm(5)}
  render()})();

sync();
if(!active)planNext(false);
window.__paper={get why(){return why},get st(){return st},get active(){return active},get prep(){return prep&&{key:prep.key,ready:!!prep.slot}}};

/* ?fps=1: a small meter in the top-left corner.
   page = frames per second of the whole page (all layers), paper = paper-scene draws per second,
   cpu = ms of JS per paper frame (step + draw call submission), calls = draw calls of the last paper frame,
   dpr = paper pixel ratio, build = ms to build the current paper scene. */
if(new URLSearchParams(location.search).get('fps')==='1'){
  const box=document.createElement('div');box.id='fpsmeter';
  box.style.cssText='position:fixed;left:6px;top:24px;z-index:50;font:12px/1.35 ui-monospace,Consolas,monospace;color:#e8ffe8;background:rgba(0,0,0,.72);padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre';
  document.body.appendChild(box);
  /* refresh rate: the shortest frame gaps are one screen refresh (snapped to the usual rates); kept over 5 s */
  const RATES=[30,48,50,60,72,75,90,100,120,144,165,180,200,240];let hz=0,gaps=[];
  let n=0,t0=performance.now(),lastF=t0,worst=0,p0={renders:0,cpu:0,frames:0};
  (function tick(now){n++;const gp=now-lastF;worst=Math.max(worst,gp);lastF=now;if(gp>2&&gp<60)gaps.push(gp);
    if(now-t0>=1000){const s=(now-t0)/1000,fps=n/s,P=st&&st.perf;
      if(gaps.length>8){const g=gaps.slice().sort((a,b)=>a-b),fast=g[Math.floor(g.length*.1)],r=1000/fast;hz=RATES.reduce((a,b)=>Math.abs(b-r)<Math.abs(a-r)?b:a)}
      if(gaps.length>600)gaps=gaps.slice(-300);
      let txt='page '+fps.toFixed(0)+' fps  screen '+(hz?hz+' Hz':'?')+'  (worst '+worst.toFixed(0)+' ms)';
      if(P&&active){const r=(P.renders-p0.renders)/s,fr=P.frames-p0.frames,cpu=fr?(P.cpu-p0.cpu)/fr:0;
        txt+='\npaper '+r.toFixed(0)+' /s  cpu '+cpu.toFixed(1)+' ms\ncalls '+P.calls+'  tris '+P.tris+'\ndpr '+st.renderer.getPixelRatio().toFixed(2)+'  build '+Math.round(st.buildMs||0)+' ms\nscene '+active.id;
        p0={renders:P.renders,cpu:P.cpu,frames:P.frames}}
      else txt+='\npaper: '+(FB.id?'PICTURE - '+(why||FB.late||'?'):why?'OFF - '+why:'not on this page');
      txt+='\nquality '+(window.QL||0)+(window.QFORCED?' (forced)':' (auto)');
      if(window.DEV)txt+='\ngpu '+DEV.gpu+(DEV.cap?'  1080p cap':'');
      /* CPU ms per frame of each drawing layer (GPU work is not in these numbers: see ?off= in js/00-device.js) */
      if(window.PT){const a=Object.entries(PT.acc).filter(e=>e[1]/n>=.05).sort((x,y)=>y[1]-x[1]);if(a.length)txt+='\ncpu ms/frame: '+a.map(e=>e[0]+' '+(e[1]/n).toFixed(1)).join('  ');PT.acc={}}
      box.textContent=txt;n=0;t0=now;worst=0}
    requestAnimationFrame(tick)})(performance.now());
}
})();
