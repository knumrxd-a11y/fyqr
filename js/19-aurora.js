/* ===== aurora sky: the animated aurora (from anim.gif) as the farthest background layer =====
   images/aurora.mp4 is the GIF turned into a 24 s looping video (1.6 MB instead of 35 MB), with its dark
   background pushed to black. It is drawn right after the sky colour and before everything else, with
   "lighter" blending, so the black vanishes and the city, sun, rocks and stars are all drawn on top of it.
   Used on the home page (js/10) and behind the story scenes (js/04). Tweak the strength where it is called. */
window.AURORA=(function(){
const v=document.createElement('video');v.src='images/aurora.mp4';v.muted=true;v.loop=true;v.playsInline=true;v.autoplay=true;
v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.preload='auto';
v.style.cssText='position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
document.body.appendChild(v);
const go=()=>{const p=v.play();if(p&&p.catch)p.catch(()=>{})};go();
/* some phones block autoplay until the first touch */
['pointerdown','touchstart','keydown'].forEach(e=>addEventListener(e,()=>{if(v.paused)go()},{once:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else if(v.paused)go()});
return{draw(c,W,H,a){
  if(v.readyState<2||!v.videoWidth)return;
  /* cover the upper sky: as wide as the screen and at least 70% of its height, anchored to the top */
  const s=Math.max(W/v.videoWidth,H*.7/v.videoHeight),w=v.videoWidth*s,h=v.videoHeight*s;
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.max(0,Math.min(1,a));c.drawImage(v,(W-w)/2,0,w,h);c.restore()}};
})();
