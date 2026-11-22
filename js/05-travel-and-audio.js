/* ---------- travel transition ---------- */
function travelThen(fn,d){
  if(reduce){setTimeout(fn,120);return}
  setTimeout(()=>{$s.classList.add('leave');M.tb=1;sfx('whoosh');
    setTimeout(()=>{fn();setTimeout(()=>{M.tb=0},350)},700)},d||450);
}
/* ---------- generative music + sfx (WebAudio, no files) ---------- */
const A={c:null,on:true,step:0,nxt:0},CH=[[57,60,64,67],[53,57,60,65],[48,55,60,64],[55,59,62,67]],hz=n=>440*Math.pow(2,(n-69)/12);
function startAudio(){
  if(A.c){if(A.c.state==='suspended')A.c.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=A.c=new C();A.m=c.createGain();A.m.gain.value=A.on?.55:0;
  const comp=c.createDynamicsCompressor();A.m.connect(comp);comp.connect(c.destination);
  const len=c.sampleRate*2.8,buf=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  A.rv=c.createConvolver();A.rv.buffer=buf;const rg=c.createGain();rg.gain.value=.5;A.rv.connect(rg);rg.connect(A.m);
  A.lp=c.createBiquadFilter();A.lp.type='lowpass';A.lp.frequency.value=900;A.lp.connect(A.m);A.lp.connect(A.rv);
  A.nxt=c.currentTime+.1;setInterval(sched,120);
}
function tone(n,t,dur,type,vol,att,dest){const c=A.c,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=hz(n);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(dest||A.lp);o.start(t);o.stop(t+dur+.1)}
function sched(){
  const c=A.c;if(!c||c.state!=='running')return;
  while(A.nxt<c.currentTime+.35){const s=A.step++,t=A.nxt,ch=CH[Math.floor(s/16)%4],pr=prog();
    A.lp.frequency.setTargetAtTime(700+pr*2600+M.boost*1500,t,.5);
    if(s%16===0){ch.forEach(n=>{tone(n,t,7.5,'triangle',.07,1.6);tone(n,t,7.5,'sine',.05,1.6)});tone(ch[0]-12,t,7,'sine',.16,.3)}
    if(Math.random()<.32+pr*.45){const n=ch[Math.floor(Math.random()*4)]+12*(1+Math.floor(Math.random()*2));tone(n,t,2.2,'sine',.07+pr*.03,.01);tone(n+12,t,1.2,'sine',.025,.01)}
    if(pr>.45&&s%4===2)tone(ch[(s>>2)%4]+24,t,1.6,'triangle',.03,.01);
    A.nxt+=60/74/2}
}
function sfx(k){
  const c=A.c;if(!c||!A.on)return;const t=c.currentTime;
  if(k==='pick'){[880,1318.5,1760].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),u=t+i*.05;o.frequency.value=f;
    g.gain.setValueAtTime(.0001,u);g.gain.exponentialRampToValueAtTime(.12,u+.01);g.gain.exponentialRampToValueAtTime(.0001,u+.9);
    o.connect(g);g.connect(A.m);g.connect(A.rv);o.start(u);o.stop(u+1)})}
  else if(k==='whoosh'){const n=c.sampleRate*1.4,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;
    f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(3200,t+.8);f.frequency.exponentialRampToValueAtTime(400,t+1.3);
    const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.6);g.gain.exponentialRampToValueAtTime(.0001,t+1.35);
    s.connect(f);f.connect(g);g.connect(A.m);g.connect(A.rv);s.start(t)}
  else if(k==='finale'){[0,4,7,12,16].forEach((x,i)=>tone(72+x,t+i*.09,3,'sine',.1,.01,A.m))}
}
const sndBtn=document.getElementById('snd');
sndBtn.addEventListener('click',()=>{startAudio();A.on=!A.on;sndBtn.classList.toggle('off',!A.on);sndBtn.setAttribute('aria-pressed',A.on);
  if(A.c)A.m.gain.setTargetAtTime(A.on?.55:0,A.c.currentTime,.15)});
document.addEventListener('visibilitychange',()=>{if(A.c)document.hidden?A.c.suspend():A.c.resume()});
function burst(m){
  const col=MJ[m].c;
  for(const b of BLD)if(ORDER[b.m]===m)b.flash=1;
  if(reduce){draw(0);return}
  const px=guide.x*W,py=guide.y*H;
  for(let i=0;i<26;i++){const a=Math.random()*6.28,v=.6+Math.random()*1.8;parts.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.8,life:1,r:1.5+Math.random()*2.5,c:col})}
}
