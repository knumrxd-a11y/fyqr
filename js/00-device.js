/* ===== device check: which graphics chip draws the page, and how many pixels each canvas may use =====
   Read by js/02, 08, 09, 10, 16, 17 (canvas sizes), js/22 (paper scenes) and js/23 (starting quality).
   DEV.gpu (from WEBGL_debug_renderer_info):
     'soft'    drawn in software (SwiftShader, Microsoft Basic Render Driver, llvmpipe ...): no paper scenes, the old
               pictures show instead; quality starts at medium
     'igpu'    a graphics chip built into the processor (Intel, AMD Radeon Vega / Radeon Graphics, phones: Adreno, Mali,
               Apple ...): quality starts at medium (level 2, which looks the same as full: see js/23)
     'dgpu'    a separate graphics card (NVIDIA, AMD Radeon RX / Pro, Intel Arc A): everything exactly as before
     'unknown' the browser does not say: starts at full quality
   Pixel limit (big screens): every full-screen canvas is drawn with at most about 1920x1080 pixels (DEV.dpr).
   Not on 'dgpu', and not with ?quality=high (= the site exactly as before).
   URL: ?gpu=soft | igpu | dgpu pretends to be that kind of device (to test). */
(function(){
const Q=new URLSearchParams(location.search);
let name='',soft=false;
try{
  const c=document.createElement('canvas');
  let gl=c.getContext('webgl',{failIfMajorPerformanceCaveat:true});   // null when the browser would draw in software
  if(!gl){gl=c.getContext('webgl');if(gl)soft=true}
  if(gl){const e=gl.getExtension('WEBGL_debug_renderer_info');name=String(gl.getParameter(e?e.UNMASKED_RENDERER_WEBGL:gl.RENDERER)||'');
    const l=gl.getExtension('WEBGL_lose_context');if(l)l.loseContext()}
}catch(e){}
let gpu='unknown';
if(soft||/swiftshader|basic render|llvmpipe|softpipe|software/i.test(name))gpu='soft';
else if(/nvidia|geforce|quadro|tesla|rtx|gtx|radeon\s*(\(tm\)\s*)?(rx|pro|r9)|firepro|arc\s*(\(tm\)\s*)?a\d/i.test(name))gpu='dgpu';
else if(/intel|radeon|vega|adreno|mali|powervr|apple|xclipse|immortalis|videocore/i.test(name))gpu='igpu';
if(/^(soft|igpu|dgpu)$/.test(Q.get('gpu')))gpu=Q.get('gpu');
/* measuring (only with ?fps=1 or ?perf=1): PT.b() / PT.e(name, t0) add up the CPU time of each drawing layer for the
   meter; ?off=grain,sun,... leaves those layers out, to measure what each one really costs (CPU + GPU) by the fps */
const PON=Q.get('fps')==='1'||Q.has('perf'),POFF=new Set(PON?(Q.get('off')||'').split(',').filter(Boolean):[]);
window.PT={on:PON,acc:{},offs:POFF,off:k=>POFF.has(k),b:()=>PON?performance.now():0,e(k,t0){if(PON)PT.acc[k]=(PT.acc[k]||0)+performance.now()-t0}};
if(POFF.has('blur')){const st=document.createElement('style');st.textContent='#screen,#snd{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}';document.head.appendChild(st)}
const CAP=1920*1080;
window.DEV={gpu,name,cap:gpu!=='dgpu'&&Q.get('quality')!=='high',
  /* the largest offset <= v (CSS px) that is whole in CSS px and in device px at pixel ratio d (for small layers) */
  snap(v,d){let k=Math.floor(v);for(let i=0;i<12;i++,k--){const p=k*d;if(Math.abs(p-Math.round(p))<1e-6)return k}return Math.floor(v*d)/d},
  /* pixel ratio for a canvas of w x h CSS pixels that would like `max` */
  dpr(w,h,max){let d=Math.min(max,devicePixelRatio||1);if(DEV.cap&&w>0&&h>0)d=Math.min(d,Math.max(.5,Math.sqrt(CAP/(w*h))));return d}};
})();
