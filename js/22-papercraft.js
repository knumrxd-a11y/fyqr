/* ===== papercraft pop-up scenes (three.js) on ten story pages =====
   Scenes 1.3, 2.1, 2.3, 5.1, 5.2 and the five alleys open as paper pop-up dioramas in a transparent layer
   (#paper) over the illustration layer, above the moving city and sky. Every other page stays exactly as it was.
   The scene code lives in papercraft/ (shared.js + scenes/), loaded with import() only when it is needed.
   - On those pages the old 2D vignette (V.v5/v6/v8/v13/v14) is not drawn; on 2.3 the shop pictures (js/20) stay hidden.
   - Picking an answer: doAct(m) also plays the scene's reaction (in an alley: the option chosen, from S.alleyPick).
   - 5.1 / 5.2 colour the city by the player's score so far (scores(10)).
   - Fallback: no WebGL, or the files fail to load -> nothing changes, the old pictures show as before.
   Tweak: SCN_P (which page -> which scene file, and how much colour the town has there). */
(function(){
const SCN_P={2:['1-3-crossroads',.45,'v5'],3:['2-1-broken-bridge',.55,'v6'],5:['2-3-old-shop',.55,'v8'],9:['5-1-on-stage',.85,'v13'],10:['5-2-colour-returns',1,'v14']};
const BASE=new URL('papercraft/',document.baseURI).href;

const css=document.createElement('style');
css.textContent='#paper{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .5s ease}#paper.on{opacity:1}@media (prefers-reduced-motion:reduce){#paper{transition:none}}';
document.head.appendChild(css);
const cv=document.createElement('canvas');cv.id='paper';cv.setAttribute('aria-hidden','true');
document.getElementById('sc').after(cv);

let lib=null,st=null,dead=false,libP=null,cur=null,tok=0,active=null,orient='';
const mods={};
function want(){
  if(S.stage==='scene'&&SCN_P[S.si]){const p=SCN_P[S.si];return{id:'s'+S.si,file:'scenes/'+p[0]+'.js',colour:p[1],vk:p[2],scores:S.si>=9}}
  if(S.stage==='alley'&&S.alley[S.ai]){const m=S.alley[S.ai];return{id:'a'+m,file:'scenes/alley-'+m+'.js',colour:.7,alley:m,vk:null}}
  return null}
function loadLib(){
  if(!libP)libP=import(BASE+'shared.js').then(m=>{lib=m;st=m.createStage(cv);if(!st)throw new Error('no WebGL');return m}).catch(e=>{dead=true;console.warn('papercraft off:',e);throw e});
  return libP}
function loadScene(file){return mods[file]||(mods[file]=import(BASE+file).then(m=>m.default))}

/* the band above the text box: same numbers the scenes were framed with in papercraft/index.html */
function free(){
  const W=innerWidth,H=innerHeight,r=document.getElementById('screen').getBoundingClientRect();
  const top=r.top+scrollY;
  return{W,H,left:0,right:W,top:56,bottom:Math.max(160,top-10),boxLeft:r.left,boxRight:r.right}}

async function sync(){
  const w=want(),id=w?w.id:null;
  if(id===cur)return;
  cur=id;const my=++tok;
  if(!w){active=null;shop();if(st&&st.root){st.close();setTimeout(()=>{if(tok===my)cv.classList.remove('on')},900)}return}
  if(dead)return;
  try{
    await loadLib();const def=await loadScene(w.file);
    if(tok!==my)return;
    mount(def,w);
  }catch(e){if(tok===my){active=null;cv.classList.remove('on')}}
}
function mount(def,w){
  st.layout(free());orient=innerWidth>=innerHeight?'land':'port';
  st.mount(def,{colour:w.colour,alley:w.alley,scores:w.scores?scores(10):undefined});
  active=w;cv.classList.add('on');shop();
  prefetch();
}
/* fetch the next paper scene while this page is read */
function prefetch(){
  if(dead)return;
  if(S.stage==='scene'){for(let k=S.si+1;k<=10;k++)if(SCN_P[k]){loadScene('scenes/'+SCN_P[k][0]+'.js').catch(()=>{});break}}
  if(S.stage==='scene'&&S.si===5||S.stage==='alley')ORDER.forEach(m=>loadScene('scenes/alley-'+m+'.js').catch(()=>{}));
}
function shop(){const el=document.getElementById('shopbg');if(el&&active&&S.stage==='scene'&&S.si===5)el.classList.remove('on')}

/* hide the old 2D vignette on the pages that now have a paper scene (only while the paper scene is up) */
Object.values(SCN_P).forEach(p=>{const k=p[2],f=V[k];V[k]=function(t){if(active&&active.vk===k)return;return f.apply(this,arguments)}});

const _render=window.render;
window.render=function(){_render.apply(this,arguments);shop();sync();
  if(!lib&&!dead&&S.stage==='scene'&&S.si>=1)loadLib().then(prefetch).catch(()=>{})};

const _doAct=window.doAct;
window.doAct=function(m){_doAct.apply(this,arguments);
  if(!active||!st||!st.root)return;
  let i=0;if(S.stage==='alley'&&AL[m]){i=AL[m].o.findIndex(o=>o[1]===S.alleyPick[m]);if(i<0)i=0}
  st.react(m,i)};

let rz=0;
addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{
  if(!st||!active)return;
  const o=innerWidth>=innerHeight?'land':'port';
  if(o!==orient)mount(st.def,active);else st.layout(free())},150)});

/* try-out shortcut: index.html?go=1-3 | 2-1 | 2-3 | 5-1 | 5-2 | alley-DGD (DGA AFX IGD DEN) jumps straight to that page.
   Earlier answers are filled in round the five majors so 5.1 / 5.2 have some colour to show. */
(function(){const go=new URLSearchParams(location.search).get('go');if(!go)return;
  const SI={'1-3':2,'2-1':3,'2-3':5,'5-1':9,'5-2':10},am=/^alley-(DGD|DGA|AFX|IGD|DEN)$/.exec(go),si=am?6:SI[go];if(si===undefined)return;
  const fill=n=>{for(let k=0;k<n;k++){const m=SC[k].o[k%SC[k].o.length][0];S.picks[k]=m;S.w[m]++}};
  if(am){fill(6);S.alley=[am[1]];S.ai=0;S.stage='alley';newPerm(4)}else{fill(si);S.stage='scene';S.si=si;newPerm(5)}
  render()})();

sync();
if(S.stage==='scene'&&S.si>=1)loadLib().then(prefetch).catch(()=>{});
window.__paper={get st(){return st},get active(){return active}};
})();
