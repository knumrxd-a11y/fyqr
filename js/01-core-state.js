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
/* result rule:
   - 1st leads 2nd by 2 or more            -> single result (1st)
   - 1st leads 2nd by exactly 1            -> mix of 1st and 2nd (several majors tied 2nd: pick by the answer in 5.2, then 5.1, then the latest answer)
   - several majors tied 1st               -> single result, picked among them by 5.2, then 5.1, then the latest answer */
function tieBreak(group){for(let i=10;i>=0;i--)if(group.includes(S.picks[i]))return S.picks[i];return group[0]}
function calcResult(){
  const t=scores(10),r=rank(10),top=t[r[0]],first=ORDER.filter(k=>t[k]===top);
  if(first.length>1)return{kind:'single',m:[tieBreak(first)],why:'อันดับ 1 เสมอกัน '+first.length+' สาขา ตัดสินด้วยคำตอบฉาก 5.2 → 5.1 → คำตอบล่าสุด'};
  const lead=first[0],sec=t[r[1]];
  if(top-sec>=2)return{kind:'single',m:[lead],why:'อันดับ 1 นำอันดับ 2 ตั้งแต่ 2 แต้มขึ้นไป'};
  const second=ORDER.filter(k=>t[k]===sec),m2=second.length>1?tieBreak(second):second[0];
  return{kind:'mix',m:ORDER.filter(k=>k===lead||k===m2),why:'อันดับ 1 นำอันดับ 2 อยู่ 1 แต้ม จึงเป็นผลผสม'+(second.length>1?' (อันดับ 2 เสมอกัน '+second.length+' สาขา ตัดสินด้วยคำตอบฉาก 5.2 → 5.1 → คำตอบล่าสุด)':'')};
}
