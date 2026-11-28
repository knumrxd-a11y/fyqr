/* ===== result page: the card opens with the pixel card-flip effect (from card-anim.gif) =====
   images/card-open.webp holds 117 frames (10 per row, 272x336 each, about 3.9 s, from the new anim.gif, lossless) with a transparent background
   blending so only the light shows. It plays once over the result card when the result page opens:
   a card back glows, bursts, shows a card, then dissolves into sparks, and the real result card fades in.
   Its card is scaled to the same size as the result card, and it plays on top of everything so nothing covers it. Tweak: REVEAL = when the real card appears (ms). */
(function(){
const FR=117,COLS=10,CW=272,CH=336,DUR=3900,REVEAL=2700;
/* where the card sits inside one 272x336 frame: centre x/y and height (measured from the sheet) */
const CARD={x:135.5,y:169.5,h:132};
const im=new Image();im.src='images/card-open.webp';
const st=document.createElement('style');st.textContent=`
.rscene{position:relative}
.rscene.opening .rcard{opacity:0;transform:scale(.9)}
.rscene.opened .rcard{transition:opacity .25s ease}
#cardopen{position:fixed;left:0;top:0;pointer-events:none;z-index:60;image-rendering:pixelated}
body.cardopening #edgerocks{opacity:0;transition:opacity .3s}
#edgerocks{transition:opacity .8s}`;document.head.appendChild(st);
function play(){
  const sc0=document.querySelector('.rscene'),card=document.getElementById('rcard');if(!sc0||!card||sc0.dataset.open)return;sc0.dataset.open=1;
  /* no effect (reduced motion, or its picture is not ready): paste the card together straight away (js/13) */
  if(reduce||!im.complete||!im.naturalWidth){window.cardAssemble&&cardAssemble();return}
  sc0.classList.add('opening');
  /* the effect sits on top of everything (fixed layer), so nothing covers or cuts it; the edge rocks step aside
     while it plays. Its card is scaled to the size of the result card (offsetHeight ignores the hide-scale) and
     follows the result card every frame, so it stays in place if the page scrolls. */
  const k=card.offsetHeight/CARD.h,w=CW*k,h=CH*k,c=document.createElement('canvas'),d=Math.min(2,devicePixelRatio||1);
  c.id='cardopen';c.width=Math.round(w*d);c.height=Math.round(h*d);c.style.width=w+'px';c.style.height=h+'px';
  document.body.appendChild(c);document.body.classList.add('cardopening');const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  function follow(){const cr=card.getBoundingClientRect();c.style.transform='translate('+(cr.left+cr.width/2-CARD.x*k)+'px,'+(cr.top+cr.height/2-CARD.y*k)+'px)'}
  follow();
  /* on short screens bring the whole card into view so the effect is not cut by the screen edge */
  {const cr=card.getBoundingClientRect();if(cr.bottom>innerHeight||cr.top<0)card.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'})}
  function end(){c.remove();document.body.classList.remove('cardopening')}
  const t0=performance.now();let shown=false;
  (function tick(now){
    const t=now-t0;if(!document.body.contains(c))return;if(!document.body.contains(card)){end();return}follow();
    /* hand over to the collage card (js/13): the pixel card fades out as the paper scraps start to fly in, so the card appears once */
    if(!shown&&t>=REVEAL){shown=true;sc0.classList.add('opened');sc0.classList.remove('opening');c.style.transition='opacity .3s ease';c.style.opacity='0';window.cardAssemble&&cardAssemble()}
    if(t>=DUR){end();return}
    const f=Math.min(FR-1,Math.floor(t/DUR*FR));g.clearRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';
    g.drawImage(im,(f%COLS)*CW,Math.floor(f/COLS)*CH,CW,CH,0,0,c.width,c.height);
    requestAnimationFrame(tick)})(t0);
}
const _r=window.render;window.render=function(){_r.apply(this,arguments);if(S.stage==='result')setTimeout(play,30)};
})();
