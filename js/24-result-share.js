/* ===== result page: share the card =====
   One button under the card.
   - Phone / tablet (touch screen with the system share sheet): shares a story picture (1080x1920) with the link,
     so it can go to IG, LINE, Facebook and the rest. If the device cannot share files it shares the link only.
   - Computer: saves the story picture and copies the link.
   The picture holds the finished collage card front (frame, mascot, cut-out title, tape; js/13), the title, the nickname from the pass (if any)
   and the link. It is made in the background once the result page is up, so the share sheet opens straight
   away on a tap (iPhone refuses to open it if the page makes the picture first). Tweak: SITE, the layout numbers in story(). */
(function(){
const SITE='https://fyqr.vercel.app',SITE_TXT='fyqr.vercel.app';
const st=document.createElement('style');st.textContent=`
.rshare{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0 0 6px}
.rshare .btn{align-self:center}
.rshare .note{text-align:center;min-height:1.2em}`;document.head.appendChild(st);
const touch=()=>matchMedia('(pointer:coarse)').matches&&!!navigator.share;
const load=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('image '+src));i.src=src});
const rgb=h=>hx(h);
const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'};
function info(){const r=S.result,k=window.cardMajor?cardMajor():r.m[0];
  const title=r.kind==='single'?MJ[r.m[0]].single:MIX[r.m.join('+')];
  return{k,title,nick:(S.pass.p1||'').trim(),col:MJ[k].c}}
/* break text into lines that fit `w` (Thai has no spaces: cut at word boundaries when the browser can find them) */
function lines(g,text,w){
  const parts=window.Intl&&Intl.Segmenter?[...new Intl.Segmenter('th',{granularity:'word'}).segment(text)].map(s=>s.segment):text.split(/(\s+)/);
  const out=[];let cur='';
  for(const p of parts){const t=cur+p;if(cur&&g.measureText(t).width>w){out.push(cur.trim());cur=p.trimStart()}else cur=t}
  if(cur.trim())out.push(cur.trim());return out}
/* largest font (<= max) that fits `text` into a box of w x h in at most `maxLines` lines */
function fitText(g,text,w,h,max,maxLines,weight,family){
  for(let s=max;s>=12;s-=2){g.font=weight+' '+s+'px '+family;const L=lines(g,text,w);
    if(L.length<=maxLines&&L.length*s*1.22<=h&&L.every(l=>g.measureText(l).width<=w))return{s,L}}
  g.font=weight+' 12px '+family;return{s:12,L:lines(g,text,w)}}
async function story(){
  const {k,title,nick,col}=info();
  try{await Promise.all([document.fonts.load('500 64px Mitr'),document.fonts.load('400 34px "IBM Plex Sans Thai"'),document.fonts.load('500 34px "IBM Plex Sans Thai"')])}catch(_){}
  const [front,mascot,logo]=await Promise.all([load('images/card-front-'+k+'.webp'),load('images/mascot-'+k+'.webp'),load('images/intro-logo-1253.webp')]);
  const W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const MITR='Mitr,"IBM Plex Sans Thai",sans-serif',BODY='"IBM Plex Sans Thai","Noto Sans Thai",sans-serif';
  /* night background tinted with the major's colour */
  let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0a0818');gr.addColorStop(.55,mix(col,'#0a0818',.78));gr.addColorStop(1,mix(col,'#0a0818',.55));g.fillStyle=gr;g.fillRect(0,0,W,H);
  const cx=W/2,cw=640,ch=cw*420/297,cy0=400;
  gr=g.createRadialGradient(cx,cy0+ch*.45,40,cx,cy0+ch*.45,760);gr.addColorStop(0,mix(col,'#0a0818',.25).replace('rgb','rgba').replace(')',',.55)'));gr.addColorStop(1,'rgba(10,8,24,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<70;i++){const x=hash(i,3,9)*W,y=hash(i,7,2)*H,r=.8+hash(i,5,5)*2.2;g.globalAlpha=.25+hash(i,1,4)*.6;g.fillStyle=i%5?'#fff6dc':col;g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}
  g.globalAlpha=1;
  /* logo */
  const lw=540,lh=lw*logo.height/logo.width;g.drawImage(logo,cx-lw/2,90,lw,lh);
  /* card front: frame, mascot in the top cream panel, title in the bottom one */
  const x0=cx-cw/2,k1=cw/297;
  /* hard cardboard shadow, as on the page */
  g.save();g.globalAlpha=.55;g.fillStyle='#060312';g.beginPath();g.roundRect?g.roundRect(x0+18,cy0+26,cw,ch,cw*.0404):g.rect(x0+18,cy0+26,cw,ch);g.fill();g.restore();
  g.drawImage(front,x0,cy0,cw,ch);
  const px=x0+17*k1,py=cy0+20*k1,pw=263*k1,ph=275*k1;
  g.save();g.beginPath();g.rect(px,py,pw,ph);g.clip();
  {let mh=ph*.92,mw=mh*mascot.width/mascot.height;if(mw>pw*.96){mw=pw*.96;mh=mw*mascot.height/mascot.width}
   g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=16;g.shadowOffsetY=8;g.drawImage(mascot,px+(pw-mw)/2,py+ph-mh,mw,mh)}
  g.restore();
  /* the title as the same magazine cut-outs as on the page (js/13 cardCut: same pieces, colours and tilt) */
  {const bx=x0+17*k1,by=cy0+333.5*k1,bw=263*k1,bh=59.5*k1,padX=bw*.05,maxW=bw-padX*2,cuts=window.cardCut?cardCut(title,col):[{t:title,bg:'#fbf8ef',fg:'#1c1820',ff:MITR,fw:500,s:1,r:0,dy:0,J:[0,0,0,0,0]}];
   const lay=f=>{const items=cuts.map(c=>{g.font=c.fw+' '+(f*c.s).toFixed(1)+'px '+c.ff;const w=g.measureText(c.t).width+f*c.s*.4;return{c,w,h:f*c.s*1.3}});
     const rows=[];let row=[],rw=0;const gap=f*.1;
     items.forEach(it=>{if(row.length&&rw+gap+it.w>maxW){rows.push({row,rw});row=[];rw=0}rw+=(row.length?gap:0)+it.w;row.push(it)});if(row.length)rows.push({row,rw});
     return{rows,gap,lh:f*1.48}};
   let f=64,L=lay(f);while(f>14&&(L.rows.length*L.lh>bh-10||L.rows.some(r=>r.rw>maxW))){f-=2;L=lay(f)}
   let yy=by+bh/2-(L.rows.length-1)*L.lh/2;g.textAlign='center';g.textBaseline='middle';
   L.rows.forEach(({row,rw})=>{let xx=bx+bw/2-rw/2;row.forEach(it=>{const c=it.c,w=it.w,h=it.h,J=c.J.map(v=>v/100);
       g.save();g.translate(xx+w/2,yy+c.dy*f*c.s);g.rotate(c.r*Math.PI/180);
       g.beginPath();g.moveTo(-w/2+J[0]*w,-h/2+J[1]*h);g.lineTo(w/2-J[2]*w,-h/2);g.lineTo(w/2,h/2-J[3]*h);g.lineTo(-w/2+J[4]*w,h/2);g.closePath();g.fillStyle=c.bg;g.fill();
       g.font=c.fw+' '+(f*c.s).toFixed(1)+'px '+c.ff;g.fillStyle=c.fg;g.fillText(c.t,0,h*.02);g.restore();xx+=w+L.gap});yy+=L.lh})}
  /* paper tape on two corners, as on the page */
  {const tw=cw*.31,th=ch*.072;[[x0+cw*-.08+tw/2,cy0+ch*.032+th/2],[x0+cw*1.08-tw/2,cy0+ch*(1-.032)-th/2]].forEach(([tx,ty2])=>{
    g.save();g.translate(tx,ty2);g.rotate(-37*Math.PI/180);const z=[[.03,0],[.97,0],[1,.16],[.97,.32],[1,.5],[.97,.68],[1,.84],[.97,1],[.03,1],[0,.84],[.03,.68],[0,.5],[.03,.32],[0,.16]];
    g.beginPath();z.forEach(([u,v],i)=>{const X=-tw/2+u*tw,Y=-th/2+v*th;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.fillStyle='rgba(234,226,203,.8)';g.fill();g.restore()})}
  /* under the card: who, the title, the link */
  let y=cy0+ch+90;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#d6d0f0';g.font='400 36px '+BODY;g.fillText(nick?nick+' คือนักเดินทางแบบ':'ฉันคือนักเดินทางแบบ',cx,y);
  y+=74;{const f=fitText(g,title,W-160,150,66,2,'500',MITR);g.fillStyle=mix(col,'#ffffff',.55);f.L.forEach((l,i)=>g.fillText(l,cx,y+i*f.s*1.2));y+=(f.L.length-1)*f.s*1.2}
  y=H-120;g.font='500 34px '+BODY;const lt='เล่นได้ที่ '+SITE_TXT,tw=g.measureText(lt).width+70;
  g.fillStyle='rgba(255,255,255,.12)';g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(cx-tw/2,y-38,tw,76,38):g.rect(cx-tw/2,y-38,tw,76);g.fill();g.stroke();
  g.fillStyle='#fff6dc';g.fillText(lt,cx,y+1);
  return new Promise(ok=>c.toBlob(b=>ok(b),'image/jpeg',.92))}
window.__story=story;
let made=null,madeFor='';
function prepare(){const key=JSON.stringify([S.result&&S.result.m,S.pass.p1||'']);if(!made||madeFor!==key){madeFor=key;made=story().catch(e=>{made=null;throw e})}return made}
function say(t){const m=document.getElementById('rshmsg');if(m)m.textContent=t}
function shareText(){const {title}=info();return 'ฉันคือ “'+title+'” จาก Imagine City: คืนสุดท้ายก่อนสีจะหายไป มาเล่นกัน '+SITE}
function fileName(){return 'imagine-city-'+info().k+'.jpg'}
function download(blob){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=fileName();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
async function copyLink(){try{await navigator.clipboard.writeText(SITE);return true}catch(_){return false}}
let ready=null;
async function onShare(){
  if(touch()){
    /* use the finished picture right away; share() has to run while the tap still counts */
    const blob=ready;let file=null;if(blob)file=new File([blob],fileName(),{type:'image/jpeg'});
    try{
      if(file&&navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],text:shareText()});
      else await navigator.share({title:'Imagine City',text:shareText(),url:SITE});
      say('')}
    catch(e){if(e&&e.name==='AbortError')return;
      try{const b=blob||await prepare();download(b);const ok=await copyLink();say(ok?'บันทึกรูปแล้ว และคัดลอกลิงก์ '+SITE_TXT+' แล้ว':'บันทึกรูปแล้ว ลิงก์คือ '+SITE_TXT)}catch(_){say('แชร์ไม่ได้ในเครื่องนี้ ลิงก์คือ '+SITE_TXT)}}
  }else{
    say('กำลังทำรูป...');
    try{const b=await prepare();download(b);const ok=await copyLink();say(ok?'บันทึกรูปแล้ว และคัดลอกลิงก์ '+SITE_TXT+' แล้ว':'บันทึกรูปแล้ว ลิงก์คือ '+SITE_TXT)}
    catch(_){const ok=await copyLink();say(ok?'ทำรูปไม่ได้ แต่คัดลอกลิงก์ '+SITE_TXT+' แล้ว':'ลิงก์คือ '+SITE_TXT)}
  }}
const _rh=window.resultHTML;
window.resultHTML=function(){const h=_rh.apply(this,arguments);
  const lab=touch()?'แชร์การ์ดของฉัน':'บันทึกรูปและคัดลอกลิงก์';
  return h.replace('<!--rshare-->','<div class="rshare"><button type="button" class="btn" id="rshbtn">'+lab+'</button><div class="note" id="rshmsg" role="status"></div></div>')};
const _r=window.render;window.render=function(){_r.apply(this,arguments);if(S.stage!=='result')return;
  ready=null;const b=document.getElementById('rshbtn');if(!b)return;b.addEventListener('click',onShare);
  setTimeout(()=>{if(document.body.contains(b))prepare().then(x=>{ready=x},()=>{})},4200)};
})();
