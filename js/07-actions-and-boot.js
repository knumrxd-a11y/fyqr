/* ---------- actions ---------- */
function newPerm(n){S.perm=shuffle(n)}
function act(a,i){
  if(a==='rules'){startAudio();if(S.stage==='intro'&&window.galGo){if(S.lock)return;S.lock=true;galGo(()=>{S.lock=false;S.stage='rules';M.kick=1;render()})}else{S.stage='rules';M.kick=1;render()}}
  else if(a==='begin'){if(S.lock)return;S.lock=true;travelThen(()=>{S.lock=false;S.stage='scene';S.si=0;newPerm(5);render()})}
  else if(a==='pick'){
    if(S.lock)return;S.lock=true;
    const o=SC[S.si].o[S.perm[i]];S.picks[S.si]=o[0];S.w[o[0]]++;burst(o[0]);doAct(o[0]);
    mark(i);
    travelThen(()=>{S.lock=false;
      if(S.si===5){S.alley=calcAlleys();S.ai=0;S.stage='alley';newPerm(4)}
      else if(S.si===10){S.stage='pass'}
      else{S.si++;newPerm(5)}
      render()},1500);
  }
  else if(a==='alleypick'){
    if(S.lock)return;S.lock=true;
    const m=S.alley[S.ai],o=AL[m].o[S.perm[i]];S.alleyPick[m]=o[1];burst(m);doAct(m);mark(i);
    travelThen(()=>{S.lock=false;
      if(S.ai+1<S.alley.length){S.ai++;newPerm(4)}else{S.stage='scene';S.si=6;newPerm(5)}
      render()},1500);
  }
  else if(a==='finish'){if(S.lock)return;
    PASS.forEach(f=>{
      if(f.k==='multi'){S.pass[f.id]=[...$s.querySelectorAll('input[data-m="'+f.id+'"]:checked')].map(x=>x.value)}
      else{const el=$s.querySelector('[data-f="'+f.id+'"]');if(el)S.pass[f.id]=el.value}
    });
    S.lock=true;travelThen(()=>{S.result=calcResult();S.stage='result';S.lock=false;burst(S.result.m[0]);sfx('finale');render()});
  }
  else if(a==='again'){S=fresh();document.getElementById('devbox').checked=false;render()}
  else if(a==='subscribe'){msg('ตัวอย่างสำหรับทดลองเล่น: ตอนส่งงานจริงปุ่มนี้จะเชื่อมกับช่องทางสมัครของคณะ')}
  else if(a==='copy'){
    const r=S.result;const title=r.kind==='single'?MJ[r.m[0]].single:MIX[r.m.join('+')];
    const txt='ฉันคือ “'+title+'” จาก Imagine City: คืนสุดท้ายก่อนสีจะหายไป';
    (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>msg('คัดลอกแล้ว: '+txt),()=>msg('คัดลอกไม่ได้ในหน้านี้ ข้อความคือ: '+txt));
  }
}
function mark(i){sfx('pick');M.kick=1;const b=$s.querySelectorAll('.opt');b.forEach((x,j)=>{x.disabled=true;if(j===i)x.classList.add('picked')})}
function msg(t){const m=document.getElementById('msg');if(m)m.textContent=t}
$s.addEventListener('click',e=>{startAudio();const b=e.target.closest('[data-act]');if(b)act(b.dataset.act,+b.dataset.i)});
$s.addEventListener('change',e=>{
  const c=e.target;if(c.dataset&&c.dataset.m){const max=+c.dataset.max;const on=$s.querySelectorAll('input[data-m="'+c.dataset.m+'"]:checked');if(on.length>max){c.checked=false}}
});
document.getElementById('devbox').addEventListener('change',e=>{S.dev=e.target.checked;render()});
document.getElementById('restart').addEventListener('click',()=>act('again'));

function boot(saved){
  if(saved&&saved.stage){S=Object.assign(fresh(),saved);S.lock=false;document.getElementById('devbox').checked=!!S.dev}
  resize();render();
  requestAnimationFrame(loop);
}
window.claude?.hot?.snapshot?.(()=>JSON.parse(JSON.stringify(S)));
if(window.claude?.hot?.ready)window.claude.hot.ready(boot);else boot(window.claude?.hot?.data??{});
