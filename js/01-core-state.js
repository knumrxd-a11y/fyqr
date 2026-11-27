const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const BG=reduce?.55:1; /* background drift strength: some PCs report "reduce motion" (animations off in Windows), which used to freeze the whole backdrop */
let S=fresh();
function fresh(){return{stage:'intro',si:0,perm:[],picks:Array(11).fill(null),w:{DGD:0,DGA:0,AFX:0,IGD:0,DEN:0},alley:[],ai:0,alleyPick:{},pass:{},dev:false,lock:false,result:null}}
const $s=document.getElementById('screen');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function shuffle(n){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function scores(upto){const t={DGD:0,DGA:0,AFX:0,IGD:0,DEN:0};for(let i=0;i<=upto;i++){if(S.picks[i])t[S.picks[i]]++}return t}
function lastIdx(upto){const l={};for(let i=0;i<=upto;i++){if(S.picks[i])l[S.picks[i]]=i}return l}
function rank(upto){const t=scores(upto),l=lastIdx(upto);return ORDER.slice().sort((a,b)=>t[b]-t[a]||(l[b]??-1)-(l[a]??-1))}
function calcAlleys(){const t=scores(5),r=rank(5);const out=[r[0]];if(t[r[0]]-t[r[1]]<=1)out.push(r[1]);return out}
function calcResult(){
  const t=scores(10),r=rank(10);
  if(t[r[0]]-t[r[1]]>=2)return{kind:'single',m:[r[0]],why:'นำอันดับ 2 ตั้งแต่ 2 แต้มขึ้นไป'};
  if(t[r[2]]<t[r[1]]){const pair=ORDER.filter(k=>k===r[0]||k===r[1]);return{kind:'mix',m:pair,why:'อันดับ 1 กับ 2 ห่างกันไม่เกิน 1 แต้ม'}}
  const S2=ORDER.filter(k=>t[k]>=t[r[1]]);
  const a=S.picks[10],b=S.picks[9];
  const m=S2.includes(a)?a:S2.includes(b)?b:r[0];
  return{kind:'single',m:[m],why:'คะแนนเสมอกัน ใช้คำตอบฉาก 5.2 (แล้ว 5.1) ตัดสิน'}
}
