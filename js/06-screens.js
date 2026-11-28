/* ---------- screens ---------- */
function meter(){
  const el=document.getElementById('meter');
  const n=S.picks.filter(Boolean).length;
  let cur=-1;if(S.stage==='scene')cur=S.si;
  el.innerHTML=Array.from({length:11},(_,i)=>'<i class="'+(S.picks[i]?'on':i===cur?'now':'')+'"></i>').join('');
}
function optsHTML(list,act){return '<div class="opts">'+S.perm.map((pi,i)=>'<button type="button" class="opt" style="--i:'+i+'" data-act="'+act+'" data-i="'+i+'">'+esc(list[pi])+'</button>').join('')+'</div>'}
function devHTML(){
  if(!S.dev)return '';
  const t=scores(10);
  return '<div class="dev">คะแนน: '+ORDER.map(k=>k+' '+t[k]).join(' · ')+'<br>6 ฉากแรก: '+ORDER.map(k=>k+' '+scores(5)[k]).join(' · ')+(S.alley.length?'<br>ย่าน: '+S.alley.join(' + '):'')+(S.result?'<br>ผล: '+S.result.m.join(' + ')+' ('+S.result.why+')':'')+'</div>';
}
function render(){
  meter();document.body.classList.toggle('gal',S.stage==='intro');document.body.classList.toggle('qa',S.stage==='scene'||S.stage==='alley');
  let h='';
  if(S.stage==='intro'){
    h='<h1 class="intro-logo"><img src="images/intro-logo-720.webp" srcset="images/intro-logo-720.webp 720w,images/intro-logo-1253.webp 1253w" sizes="(max-width:480px) 340px,400px" width="1253" height="638" alt="Imagine City" decoding="async"></h1><h2 class="intro-sub"><img src="images/intro-sub-900.webp" width="900" height="159" alt="คืนสุดท้ายก่อนสีจะหายไป" decoding="async"></h2><div class="tag">Imagine Design Event</div><p>คืนนี้สีสันของ Imagine City กำลังจะหายไปทั้งเมือง และมีเธอเป็นคนเดียวที่ช่วยได้</p><p class="note">♪ มีเพลงประกอบตลอดทาง แนะนำให้เปิดเสียง</p><button type="button" class="btn" data-act="rules">เริ่มเดินทาง</button>';
  }else if(S.stage==='rules'){
    h='<div class="tag">ก่อนออกเดินทาง</div><h2>เหลือเวลาอีกแค่คืนเดียว</h2><p class="lead">Imagine City เคยเป็นเมืองที่เต็มไปด้วยภาพวาด ป้ายไฟ เสียงเพลง และเกมที่ใครก็เล่นได้ แต่ตอนนี้ทุกอย่างซีดเป็นสีเทา ถ้ามีใครขึ้นเวทีในเทศกาล Imagine Design Event แล้วทำให้คนทั้งเมืองกลับมายิ้มได้ สีทั้งหมดก็จะกลับมา</p><p class="lead">เธอตื่นขึ้นกลางจัตุรัสโดยไม่รู้ว่ามาได้ยังไง ตรงหน้ามีดวงไฟดวงเล็ก ๆ ลอยอยู่ มันบอกว่าจะนำทางให้ แต่ต้องให้เธอเป็นคนตัดสินใจเองทุกอย่าง</p><div class="block"><h3>วิธีเล่น</h3><ul class="rules"><li>ไม่มีคำตอบถูกหรือผิด เลือกข้อที่ใกล้ใจเธอที่สุดในตอนนี้</li><li>อย่าคิดนาน ข้อที่นึกถึงก่อนมักเป็นข้อที่ใช่</li><li>เรื่องจะเดินไปเรื่อย ๆ จนถึงคืนเทศกาล แล้วเธอจะรู้ว่าตัวเองเป็นนักเดินทางแบบไหน</li></ul></div><button type="button" class="btn" data-act="begin">ตื่นขึ้นมา</button>';
  }else if(S.stage==='scene'){
    const sc=SC[S.si];
    h='<div class="tag">'+sc.tag+(placeNow()>=0?' · <span style="color:'+PCOL[placeNow()]+'">'+PNAME[placeNow()]+'</span>':'')+'</div>'+(sc.chap?'<p class="intro">'+sc.chap+' · '+sc.intro+'</p>':'')+'<h2>'+sc.title+'</h2><p class="q">'+sc.q+'</p>'+optsHTML(sc.o.map(o=>o[1]),'pick');
  }else if(S.stage==='alley'){
    const m=S.alley[S.ai],a=AL[m];
    h='<div class="tag">บท 3 · ย่านของเธอ'+(S.alley.length>1?' ('+(S.ai+1)+' จาก '+S.alley.length+')':'')+'</div>'+(S.ai===0?'<p class="intro">บทที่ 3 ย่านของเธอ · ดวงไฟพาเธอเดินเข้าไปในย่านที่ใกล้ตัวเธอที่สุด'+(S.alley.length>1?' และเธอลังเลระหว่างสองทาง จึงได้เดินทั้งสองย่าน':'')+'</p>':'')+'<h2 style="color:'+MJ[m].c+'">'+a.name+'</h2><p class="q">'+a.q+'</p>'+optsHTML(a.o.map(o=>o[0]),'alleypick');
  }else if(S.stage==='pass'){
    h='<div class="tag">ประตูสุดท้าย</div><h2>บัตรผ่านนักเดินทาง</h2><p class="lead">ก่อนเธอจะก้าวขึ้นเวทีใหญ่ ผู้เฝ้าประตูขอดูบัตรผ่านสักใบ กรอกเท่าที่สะดวกได้เลย ข้อไหนไม่อยากตอบก็ข้ามได้</p><div class="note">หน้านี้เป็นตัวอย่างสำหรับทดลองเล่น ข้อมูลที่กรอกไม่ถูกส่งหรือบันทึกไว้ที่ไหน</div>';
    PASS.forEach((f,i)=>{
      const id='f_'+f.id;
      h+='<div class="field">';
      if(f.k==='text')h+='<label for="'+id+'">'+(i+1)+'. '+f.t+'</label><input type="text" id="'+id+'" data-f="'+f.id+'" autocomplete="off">';
      else if(f.k==='sel')h+='<label for="'+id+'">'+(i+1)+'. '+f.t+'</label><select id="'+id+'" data-f="'+f.id+'"><option value="">ข้ามข้อนี้</option>'+f.o.map(o=>'<option>'+o+'</option>').join('')+'</select>';
      else h+='<div class="lab">'+(i+1)+'. '+f.t+'</div><div class="chks">'+f.o.map((o,j)=>'<label class="chk"><input type="checkbox" data-m="'+f.id+'" data-max="'+f.max+'" value="'+o+'"> '+o+'</label>').join('')+'</div>';
      h+='</div>';
    });
    h+='<div class="btn-row"><button type="button" class="btn" data-act="finish">ก้าวขึ้นเวที</button><button type="button" class="btn ghost" data-act="finish">ข้ามทั้งหมด</button></div>';
  }else if(S.stage==='result'){
    h=resultHTML();
  }
  h+=devHTML();
  PNEXT=placeNow();$s.classList.remove('leave');$s.style.animation='none';void $s.offsetWidth;$s.style.animation='';
  $s.innerHTML=h;
  if(S.stage!=='intro')scrollTo({top:0,behavior:reduce?'auto':'smooth'});
}
function chipsFor(m){
  const first=[];
  const ap=S.alleyPick[m];
  if(ap)first.push(ap);
  const rest=MJ[m].jobs.filter(j=>!first.some(f=>f.toLowerCase()===j.toLowerCase()));
  return '<div class="chips">'+first.map(j=>'<span class="chip first" style="color:'+MJ[m].c+'">'+esc(j)+'</span>').join('')+rest.map(j=>'<span class="chip">'+esc(j)+'</span>').join('')+'</div>';
}
function resultHTML(){
  const r=S.result,t=scores(10),tot=11;
  const nick=(S.pass.p1||'').trim();
  let title,blurb,color;
  if(r.kind==='single'){const m=r.m[0];title=MJ[m].single;blurb=MJ[m].blurb;color=MJ[m].c}
  else{title=MIX[r.m.join('+')];blurb='บางคนเดินมาตลอดทางโดยเลือกสลับไปมาระหว่างสองแบบ นั่นไม่ใช่เรื่องแปลก ตอนจบจึงเล่าถึงทั้งสองแบบ และโชว์อาชีพจากทั้งสองสาขาให้เลือกดู';color='var(--ink)'}
  let h='<div class="tag">ฉากจบ · เธอคือนักเดินทางแบบไหน'+(nick?' · '+esc(nick):'')+'</div><h2 class="res-title" style="color:'+color+'">'+esc(title)+'</h2><p>'+blurb+'</p>';
  h+='<div class="bar" aria-label="สีที่กลับมาในเมือง">'+ORDER.filter(k=>t[k]>0).map(k=>'<span style="flex:'+t[k]+';background:'+MJ[k].c+'"></span>').join('')+'</div>';
  const rk=rank(10);r.m.slice().sort((x,y)=>rk.indexOf(x)-rk.indexOf(y)).forEach(m=>{
    h+='<div class="block"><h3 style="color:'+MJ[m].c+'">อาชีพที่เกี่ยวข้อง</h3>'+chipsFor(m)+'<div class="note">ตัวสีคืออาชีพที่ขึ้นก่อนจากคำตอบในย่านของเธอ</div><p>เรียนได้ที่ สาขา <b>'+MJ[m].prog+'</b></p></div>';
  });
  h+='<div class="block"><h3>ไม่ว่าจะเป็นนักเดินทางแบบไหน เมืองนี้ยังมีที่ว่างรออยู่</h3><div class="btn-row"><button type="button" class="btn" data-act="subscribe">สมัครสมาชิก</button><button type="button" class="btn ghost" data-act="copy">คัดลอกผลของฉัน</button><button type="button" class="btn ghost" data-act="again">เล่นอีกครั้ง</button></div><div class="note" id="msg" role="status"></div></div>';
  return h;
}
