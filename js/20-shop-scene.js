/* ===== scene 2.3 "ร้านเก่าแก่ที่ใกล้ปิด": the old shops float in to frame the scene =====
   The normal moving city, sky, rocks and sun stay as on every other page. Two cut-out pieces of the shop
   painting (from shop-scene-0.svg and shop-scene-1.svg) slide in from the left and right sides, then bob gently.
   They sit in the backdrop behind the text box and below the sun, and leave the middle of the sky open.
   images/shop-left.webp = ruined street on the left, images/shop-right.webp = the old shops on the right.
   Tweak: SCENE = which story scene (index in SC); sizes and positions are in the CSS below (PC, then phone). */
(function(){
const SCENE=5;
const st=document.createElement('style');st.textContent=`
#shopbg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
#shopbg i{position:absolute;bottom:22%;height:62%;opacity:0;transition:opacity 1.2s ease,transform 1.6s cubic-bezier(.2,.9,.3,1)}
#shopbg b{display:block;width:100%;height:100%;background:center bottom/contain no-repeat;filter:saturate(.8) brightness(1.35) contrast(1.1) drop-shadow(0 0 10px rgba(190,160,255,.35))}
#shopbg .l{aspect-ratio:306/614;left:max(0px,calc(50% - 640px));transform:translateX(-60%)}
#shopbg .r{aspect-ratio:545/614;right:max(0px,calc(50% - 700px));transform:translateX(60%)}
#shopbg .l b{background-image:url(images/shop-left.webp)}
#shopbg .r b{background-image:url(images/shop-right.webp)}
#shopbg.on i{opacity:1;transform:none}
#shopbg.on b{animation:shopbob 7s ease-in-out infinite alternate}
#shopbg.on .r b{animation-duration:8.5s;animation-delay:-3s}
@keyframes shopbob{from{transform:translateY(0)}to{transform:translateY(-2.5%)}}
@media (max-width:600px){#shopbg i{bottom:auto;top:clamp(90px,12dvh,150px);height:clamp(250px,40dvh,380px)}
  #shopbg .l{left:-10%}#shopbg .r{right:-24%}}
@media (prefers-reduced-motion:reduce){#shopbg i{transition:opacity .4s}#shopbg.on b{animation:none}}`;document.head.appendChild(st);
/* the picture is on an inner layer (b) so the slide-in and the bobbing do not fight */
const el=document.createElement('div');el.id='shopbg';el.setAttribute('aria-hidden','true');
el.innerHTML='<i class="l"><b></b></i><i class="r"><b></b></i>';
document.getElementById('cv').after(el);
['images/shop-left.webp','images/shop-right.webp'].forEach(s=>{const p=new Image();p.src=s});
const _r=window.render;window.render=function(){_r.apply(this,arguments);el.classList.toggle('on',S.stage==='scene'&&S.si===SCENE)};
el.classList.toggle('on',S.stage==='scene'&&S.si===SCENE);
})();
