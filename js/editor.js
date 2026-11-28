/* ===== content editor: edit data/story.js with a live preview of the game =====
   Opens on its own page (editor.html). The game files are not changed: the preview is
   index.html in an iframe, and the editor swaps the story data inside it, then jumps to
   the screen you are editing. Nothing is saved to the server; "คัดลอก story.js"
   gives you the new file text to put back in data/. Unsaved work is kept in this browser. */
(function(){
const NAMES=['MJ','MIX','SC','AL','PASS'];
const ORIG=JSON.parse(JSON.stringify({MJ,MIX,SC,AL,PASS}));
const ORIG_KEY=JSON.stringify(ORIG);
const LS='imagine-city-editor-draft';
let cur=JSON.parse(ORIG_KEY);
let banner='';
try{
  const d=JSON.parse(localStorage.getItem(LS)||'null');
  if(d&&d.base===ORIG_KEY&&d.cur){cur=d.cur;if(JSON.stringify(cur)!==ORIG_KEY)banner='เปิดงานที่แก้ค้างไว้ครั้งก่อนให้แล้ว (ยังไม่ได้คัดลอกไปใช้)'}
  else if(d)banner='ไฟล์ story.js เปลี่ยนไปจากตอนที่แก้ค้างไว้ จึงเริ่มจากไฟล์ปัจจุบันแทน';
}catch(e){}

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const get=(o,p)=>p.reduce((a,k)=>a==null?undefined:a[k],o);
function set(o,p,v){const last=p[p.length-1];const par=get(o,p.slice(0,-1));if(v===undefined)delete par[last];else par[last]=v}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const col=k=>(cur.MJ[k]||{}).c||'#888';
const prog=k=>(cur.MJ[k]||{}).prog||k;

/* ---------- pages ---------- */
const PAGES=[];
cur.SC.forEach((s,i)=>PAGES.push({id:'sc:'+i,label:ORIG.SC[i].tag+' · '+ORIG.SC[i].title}));
ORDER.forEach(k=>PAGES.push({id:'al:'+k,label:'ย่าน '+k+' · '+ORIG.AL[k].name}));
PAGES.push({id:'pass',label:'บัตรผ่าน (แบบฟอร์ม)'});
ORDER.forEach(k=>PAGES.push({id:'mj:'+k,label:'ผลลัพธ์ '+k+' · '+ORIG.MJ[k].single}));
PAGES.push({id:'mix',label:'ผลลัพธ์แบบผสม 2 สาขา'});
let page=localStorage.getItem(LS+'-page')||PAGES[0].id;if(!PAGES.some(p=>p.id===page))page=PAGES[0].id;
let mixKey=Object.keys(ORIG.MIX)[0];

/* field: {p:path, l:label, t:'text'|'area'|'lines'|'color'|'num', h:hint, opt:true if it may be left empty and removed} */
function groups(id){
  const [kind,key]=id.split(':');
  if(kind==='sc'){const i=+key,s=cur.SC[i],P=['SC',i];
    const g=[{h:'ส่วนหัวของฉาก',f:[{p:[...P,'tag'],l:'ป้ายบนสุด',t:'text'},{p:[...P,'title'],l:'ชื่อฉาก',t:'text'},
      {p:[...P,'chap'],l:'ชื่อบท',t:'text',opt:1,h:'ใส่เฉพาะฉากแรกของบท เว้นว่างได้'},{p:[...P,'intro'],l:'ข้อความเปิดบท',t:'area',opt:1,h:'ใส่เฉพาะฉากแรกของบท เว้นว่างได้'},
      {p:[...P,'q'],l:'คำถาม',t:'area'}]}];
    g.push({h:'ตัวเลือก (ในเกมจริงจะสลับลำดับทุกครั้ง)',f:s.o.map((o,j)=>({p:[...P,'o',j,1],l:prog(o[0]),dot:col(o[0]),t:'area',h:'ข้อนี้ให้คะแนนสาขา '+o[0]}))});
    return g}
  if(kind==='al'){const a=cur.AL[key],P=['AL',key];
    return [{h:'ย่าน '+prog(key),dot:col(key),f:[{p:[...P,'name'],l:'ชื่อย่าน',t:'text'},{p:[...P,'q'],l:'คำถาม',t:'area'}]},
      ...a.o.map((o,j)=>({h:'ตัวเลือกที่ '+(j+1),f:[{p:[...P,'o',j,0],l:'ข้อความตัวเลือก',t:'area'},{p:[...P,'o',j,1],l:'อาชีพที่ขึ้นก่อนในหน้าผลลัพธ์',t:'text'}]}))]}
  if(kind==='pass')return cur.PASS.map((f,i)=>{const P=['PASS',i],fs=[{p:[...P,'t'],l:'คำถาม',t:'text'}];
    if(f.o)fs.push({p:[...P,'o'],l:'ตัวเลือก',t:'lines',h:'บรรทัดละหนึ่งตัวเลือก'});
    if(f.k==='multi')fs.push({p:[...P,'max'],l:'เลือกได้สูงสุดกี่ข้อ',t:'num'});
    return{h:'ข้อ '+(i+1)+' · '+({text:'พิมพ์ตอบ',sel:'เลือก 1 ข้อ',multi:'เลือกได้หลายข้อ'}[f.k]||f.k),f:fs}});
  if(kind==='mj'){const P=['MJ',key];
    return [{h:'ผลลัพธ์ '+key,dot:col(key),f:[{p:[...P,'single'],l:'ชื่อนักเดินทาง (หัวข้อผลลัพธ์)',t:'text'},{p:[...P,'blurb'],l:'คำบรรยาย',t:'area'},
      {p:[...P,'prog'],l:'ชื่อสาขา',t:'text'},{p:[...P,'c'],l:'สีประจำสาขา',t:'color'},{p:[...P,'jobs'],l:'อาชีพที่เกี่ยวข้อง',t:'lines',h:'บรรทัดละหนึ่งอาชีพ'}]}]}
  if(kind==='mix')return [{h:'ชื่อนักเดินทางเมื่อคะแนน 2 สาขาสูสีกัน (คลิกช่องไหน พรีวิวจะแสดงคู่นั้น)',f:Object.keys(cur.MIX).map(k=>({p:['MIX',k],l:k.split('+').map(prog).join(' + '),t:'text',mix:k}))}];
  return [];
}

/* ---------- diff helpers ---------- */
const show=v=>Array.isArray(v)?v.join('\n'):v==null?'':String(v);
function mid(a,b){let p=0;while(p<a.length&&p<b.length&&a[p]===b[p])p++;let s=0;while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s])s++;return{p,s}}
function wasHTML(o,n){o=show(o);n=show(n);if(!o)return '<i>(เดิมไม่มี)</i>';const{p,s}=mid(o,n);return esc(o.slice(0,p))+'<del>'+esc(o.slice(p,o.length-s))+'</del>'+esc(o.slice(o.length-s))}
function diffHTML(o,n){o=show(o);n=show(n);const{p,s}=mid(o,n);const cut=(t,end)=>t.length>40?(end?t.slice(0,40)+'…':'…'+t.slice(-40)):t;
  return esc(cut(o.slice(0,p),0))+'<del>'+esc(o.slice(p,o.length-s))+'</del><ins>'+esc(n.slice(p,n.length-s))+'</ins>'+esc(cut(o.slice(o.length-s),1))}
function changes(){const out=[];
  PAGES.forEach(pg=>groups(pg.id).forEach(g=>g.f.forEach(f=>{const o=get(ORIG,f.p),n=get(cur,f.p);if(!same(o??'',n??''))out.push({pg,f,o,n})})));
  return out}

/* ---------- form ---------- */
function inputHTML(f,v){const id='i_'+f.p.join('_').replace(/[^\w]/g,'_');
  let el;
  if(f.t==='area'||f.t==='lines')el='<textarea id="'+id+'" rows="'+(f.t==='lines'?Math.min(10,Math.max(3,(v||[]).length)):2)+'">'+esc(show(v))+'</textarea>';
  else if(f.t==='color')el='<input type="color" id="'+id+'" value="'+esc(v||'#888888')+'"> <code>'+esc(v||'')+'</code>';
  else if(f.t==='num')el='<input type="text" inputmode="numeric" id="'+id+'" value="'+esc(v??'')+'" style="width:80px">';
  else el='<input type="text" id="'+id+'" value="'+esc(v??'')+'">';
  return '<div class="f" data-p="'+esc(JSON.stringify(f.p))+'"'+(f.mix?' data-mix="'+esc(f.mix)+'"':'')+'><label for="'+id+'">'+(f.dot?'<span class="dot" style="background:'+esc(f.dot)+'"></span> ':'')+esc(f.l)+'</label>'+el+
    (f.h?'<div class="hint">'+esc(f.h)+'</div>':'')+'<div class="was"></div></div>'}
let FIELDS={};
function drawForm(){
  const pg=PAGES.find(p=>p.id===page);FIELDS={};
  let h=(banner?'<div class="banner">'+esc(banner)+'</div>':'')+'<h2>'+esc(pg.label)+'</h2><p class="sub">พิมพ์แก้ทางซ้าย พรีวิวทางขวาจะเปลี่ยนตามทันที ช่องที่แก้แล้วจะมีกรอบสีเหลืองและบอกข้อความเดิมไว้ใต้ช่อง</p>';
  groups(page).forEach(g=>{h+='<div class="grp"><h3>'+(g.dot?'<span class="dot" style="background:'+esc(g.dot)+'"></span>':'')+esc(g.h)+'</h3>';g.f.forEach(f=>{FIELDS[JSON.stringify(f.p)]=f;h+=inputHTML(f,get(cur,f.p))});h+='</div>'});
  $('#form').innerHTML=h;$('#form').scrollTop=0;
  $('#form').querySelectorAll('.f').forEach(markField);
}
function markField(box){
  const f=FIELDS[box.dataset.p];const o=get(ORIG,f.p),n=get(cur,f.p);const chg=!same(o??'',n??'');
  box.classList.toggle('chg',chg);
  box.querySelector('.was').innerHTML=chg?'เดิม: '+wasHTML(o,n)+'<button type="button" class="ghost" data-undo>ใช้ของเดิม</button>':'';
  const code=box.querySelector('code');if(code)code.textContent=n||'';
}
function readField(f,el){
  if(f.t==='lines')return el.value.split('\n').map(s=>s.trim()).filter(Boolean);
  if(f.t==='num'){const n=parseInt(el.value,10);return isNaN(n)?get(ORIG,f.p):n}
  if(f.opt&&!el.value.trim())return undefined;
  return el.value;
}
$('#form').addEventListener('input',e=>{
  const box=e.target.closest('.f');if(!box)return;const f=FIELDS[box.dataset.p];
  set(cur,f.p,readField(f,e.target));markField(box);changed();
});
$('#form').addEventListener('click',e=>{
  if(!e.target.closest('[data-undo]'))return;const box=e.target.closest('.f'),f=FIELDS[box.dataset.p];
  set(cur,f.p,JSON.parse(JSON.stringify(get(ORIG,f.p)??null))??undefined);
  const el=box.querySelector('textarea,input');el.value=f.t==='color'?get(cur,f.p):show(get(cur,f.p));markField(box);changed();
});
$('#form').addEventListener('focusin',e=>{const box=e.target.closest('[data-mix]');if(box&&box.dataset.mix!==mixKey){mixKey=box.dataset.mix;preview(true)}});

/* ---------- changes list / save ---------- */
function changed(){
  try{localStorage.setItem(LS,JSON.stringify({base:ORIG_KEY,cur}))}catch(e){}
  const n=changes().length;$('#chgN').textContent=n;$('#chgBtn').classList.toggle('has',n>0);
  if(!$('#chgPanel').hidden)drawChanges();
  clearTimeout(changed.t);changed.t=setTimeout(()=>preview(false),220);
}
function drawChanges(){
  const list=changes();
  $('#chgList').innerHTML=list.length?list.map((c,i)=>'<div class="ci" data-i="'+i+'"><b>'+esc(c.pg.label)+' · '+esc(c.f.l)+'</b><div>'+diffHTML(c.o,c.n)+'</div></div>').join(''):'<p class="empty">ยังไม่ได้แก้อะไร</p>';
  $('#chgList').onclick=e=>{const ci=e.target.closest('.ci');if(!ci)return;const c=list[+ci.dataset.i];go(c.pg.id);
    if(c.f.mix){mixKey=c.f.mix;preview(true)}
    const box=$('#form').querySelector('.f[data-p="'+CSS.escape(JSON.stringify(c.f.p))+'"]');if(box){box.scrollIntoView({block:'center'});box.querySelector('textarea,input').focus()}};
}
$('#chgBtn').onclick=()=>{const p=$('#chgPanel');p.hidden=!p.hidden;if(!p.hidden)drawChanges()};
$('#chgClose').onclick=()=>{$('#chgPanel').hidden=true};
$('#resetAll').onclick=()=>{const b=$('#resetAll'),n=changes().length;if(!n)return toast('ยังไม่ได้แก้อะไร');
  if(!b.classList.contains('arm')){b.classList.add('arm');b.textContent='กดอีกครั้งเพื่อล้าง '+n+' จุด';clearTimeout(b.t);b.t=setTimeout(()=>{b.classList.remove('arm');b.textContent='ล้างที่แก้ทั้งหมด'},3500);return}
  clearTimeout(b.t);b.classList.remove('arm');b.textContent='ล้างที่แก้ทั้งหมด';
  cur=JSON.parse(ORIG_KEY);banner='';drawForm();changed();toast('กลับไปใช้ข้อความเดิมแล้ว')};

/* ---------- export ---------- */
function str(s){s=String(s);if(s.includes("'")&&!s.includes('"'))return '"'+s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n')+'"';
  return "'"+s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n')+"'"}
const key=k=>/^[A-Za-z_$][\w$]*$/.test(k)?k:str(k);
function lit(v){if(Array.isArray(v))return '['+v.map(lit).join(',')+']';
  if(v&&typeof v==='object')return '{'+Object.keys(v).filter(k=>v[k]!==undefined).map(k=>key(k)+':'+lit(v[k])).join(',')+'}';
  return typeof v==='string'?str(v):String(v)}
function objBody(o,skip){return Object.keys(o).filter(k=>k!==skip&&o[k]!==undefined).map(k=>key(k)+':'+lit(o[k])).join(',')}
function build(){
  const d=cur;let t='const ORDER='+lit(ORDER)+';\nconst MJ={\n';
  t+=Object.keys(d.MJ).map(k=>'  '+key(k)+':{'+objBody(d.MJ[k],'jobs')+',\n    jobs:'+lit(d.MJ[k].jobs)+'}').join(',\n')+'\n};\n';
  t+='const MIX='+lit(d.MIX)+';\n\nconst SC=[\n';
  t+=d.SC.map(s=>{const head=Object.keys(s).filter(k=>k!=='q'&&k!=='o'&&s[k]!==undefined).map(k=>key(k)+':'+lit(s[k])).join(',');
    return ' {'+head+',\n  q:'+lit(s.q)+',\n  o:'+lit(s.o)+'}'}).join(',\n')+'\n];\nconst AL={\n';
  t+=Object.keys(d.AL).map(k=>' '+key(k)+':{'+objBody(d.AL[k],'o')+',\n  o:'+lit(d.AL[k].o)+'}').join(',\n')+'\n};\nconst PASS=[\n';
  t+=d.PASS.map(p=>' '+lit(p)).join(',\n')+'\n];\n';
  return t}
$('#dl').onclick=()=>{
  const txt=build(),ta=$('#outText');ta.value=txt;$('#outPanel').hidden=false;$('#chgPanel').hidden=true;
  const sel=()=>{ta.focus();ta.select()};
  try{navigator.clipboard.writeText(txt).then(()=>toast('คัดลอกแล้ว นำไปวางทับใน data/story.js'),()=>{sel();toast('เลือกข้อความไว้ให้แล้ว กด Ctrl+C / ⌘C เพื่อคัดลอก')})}catch(e){sel();toast('เลือกข้อความไว้ให้แล้ว กด Ctrl+C / ⌘C เพื่อคัดลอก')}
};
$('#outClose').onclick=()=>{$('#outPanel').hidden=true};
window.__buildStory=build;

/* ---------- live preview ---------- */
const frame=$('#frame');let lastShown='';
function preview(jump){
  const w=frame.contentWindow;if(!w||typeof w.render!=='function')return;
  try{
    const g=w.eval('({MJ,MIX,SC,AL,PASS})'),src=w.JSON.parse(JSON.stringify(cur));
    NAMES.forEach(n=>{const T=g[n],F=src[n];if(Array.isArray(T)){T.length=0;F.forEach(x=>T.push(x))}else{Object.keys(T).forEach(k=>delete T[k]);Object.assign(T,F)}});
    const want=page+(page==='mix'?':'+mixKey:'');const keep=!jump&&want===lastShown;const y=keep?w.scrollY:0;lastShown=want;
    w.__edGo={page,mix:mixKey,alleyPick:null};
    w.eval(`(function(p){const [kind,key]=p.page.split(':');S=fresh();S.lock=false;S.dev=false;
      const seq=n=>[...Array(n).keys()];
      if(kind==='sc'){S.stage='scene';S.si=+key;S.perm=seq(SC[S.si].o.length);for(let i=0;i<S.si;i++)S.picks[i]=SC[i].o[0][0]}
      else if(kind==='al'){S.stage='alley';S.alley=[key];S.ai=0;S.perm=seq(AL[key].o.length);for(let i=0;i<6;i++)S.picks[i]=key}
      else if(kind==='pass'){S.stage='pass';for(let i=0;i<11;i++)S.picks[i]=ORDER[i%5]}
      else{const m=kind==='mix'?p.mix.split('+'):[key];
        for(let i=0;i<11;i++)S.picks[i]=m[i%m.length];m.forEach(k=>{if(AL[k]&&AL[k].o[0])S.alleyPick[k]=AL[k].o[0][1]});
        S.stage='result';S.result={kind:kind==='mix'?'mix':'single',m:m,why:'พรีวิว'}}
      var db=document.getElementById('devbox');if(db)db.checked=false;
      render()})(window.__edGo)`);
    const back=()=>w.scrollTo({top:y,behavior:'instant'});back();setTimeout(back,30);
  }catch(e){console.error(e);toast('พรีวิวมีปัญหา ลองกด "โหลดพรีวิวใหม่"')}
}
frame.addEventListener('load',()=>{lastShown='';setTimeout(()=>preview(true),60)});
$('#reload').onclick=()=>{try{frame.contentWindow.location.reload()}catch(e){frame.src='index.html'}};
document.querySelectorAll('input[name=dev]').forEach(r=>r.onchange=()=>{$('#device').classList.toggle('wide',r.value==='wide'&&r.checked);setTimeout(()=>frame.contentWindow&&frame.contentWindow.dispatchEvent(new Event('resize')),50)});

/* ---------- page switch ---------- */
function go(id){page=id;$('#page').value=id;try{localStorage.setItem(LS+'-page',id)}catch(e){}drawForm();preview(true)}
$('#page').innerHTML=PAGES.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.label)+'</option>').join('');
$('#page').onchange=e=>go(e.target.value);
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),2600)}
addEventListener('beforeunload',()=>{try{localStorage.setItem(LS,JSON.stringify({base:ORIG_KEY,cur}))}catch(e){}});

$('#page').value=page;drawForm();changed();
})();
