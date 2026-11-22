/* ===== back button: undo the last step, but ask first ===== */
(function(){
const st=document.createElement('style');st.textContent=`
.backbtn{position:absolute;top:12px;right:12px;min-height:36px;padding:6px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:var(--ink);font:inherit;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .2s,transform .1s}
.backbtn:hover{background:rgba(255,255,255,.14)}.backbtn:active{transform:scale(.95)}
#cfm{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(4,8,12,.62);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#cfm.on{display:flex;animation:cfmIn .25s ease-out}
@keyframes cfmIn{from{opacity:0}to{opacity:1}}
#cfm .bx{width:100%;max-width:340px;padding:22px 20px 18px;border-radius:20px;border:1px solid rgba(255,255,255,.14);background:rgba(20,22,28,.96);color:var(--ink);box-shadow:0 20px 60px rgba(0,0,0,.5);animation:cfmPop .35s cubic-bezier(.2,.9,.3,1.2)}
@keyframes cfmPop{from{transform:scale(.9) translateY(10px);opacity:0}to{transform:none;opacity:1}}
#cfm h3{margin:0 0 8px;font-size:18px}#cfm p{margin:0 0 18px;color:var(--mute);font-size:14px;line-height:1.55}
#cfm .row{display:flex;gap:10px}#cfm button{flex:1;min-height:46px;border-radius:999px;font:inherit;font-weight:600;cursor:pointer;border:1px solid var(--line);background:transparent;color:var(--ink)}
#cfm button.ok{background:var(--ink);color:#101014;border:0}
@media (prefers-reduced-motion:reduce){#cfm.on,#cfm .bx{animation:none}}`;document.head.appendChild(st);
const cfm=document.createElement('div');cfm.id='cfm';cfm.setAttribute('role','dialog');cfm.setAttribute('aria-modal','true');cfm.setAttribute('aria-labelledby','cfmT');
cfm.innerHTML='<div class="bx"><h3 id="cfmT">ย้อนกลับไปขั้นก่อนหน้า?</h3><p>คำตอบที่เลือกไว้ในขั้นนั้นจะถูกยกเลิก แล้วเลือกใหม่ได้</p><div class="row"><button type="button" class="no">ยังไม่ย้อน</button><button type="button" class="ok">ตกลง</button></div></div>';
document.body.appendChild(cfm);
const HIST=[],KEEP=['rules','begin','pick','alleypick','finish'];
const _act=window.act;
window.act=function(a,i){
  if(a==='again')HIST.length=0;
  else if(KEEP.includes(a)&&!S.lock&&!(a==='pick'&&S.stage!=='scene')){const s=Object.assign({},S,{lock:false});HIST.push(JSON.stringify(s))}
  return _act.apply(this,arguments)};
function show(){cfm.classList.add('on');cfm.querySelector('.no').focus()}
function hide(){cfm.classList.remove('on')}
function back(){const snap=HIST.pop();if(!snap)return;hide();S=JSON.parse(snap);S.lock=false;sfx('whoosh');M.kick=1;render()}
cfm.querySelector('.no').addEventListener('click',hide);cfm.querySelector('.ok').addEventListener('click',back);
cfm.addEventListener('click',e=>{if(e.target===cfm)hide()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&cfm.classList.contains('on'))hide()});
document.addEventListener('click',e=>{if(e.target.closest('.backbtn')&&!S.lock&&HIST.length)back()});
const _r=window.render;window.render=function(){_r.apply(this,arguments);hide();
  if(HIST.length&&S.stage!=='intro'&&S.stage!=='result'&&!S.lock){const el=document.getElementById('screen'),b=document.createElement('button');b.type='button';b.className='backbtn';b.textContent='← ย้อนกลับ';b.setAttribute('aria-label','ย้อนกลับไปขั้นก่อนหน้า');el.prepend(b)}};
})();
