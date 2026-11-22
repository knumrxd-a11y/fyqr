addEventListener('DOMContentLoaded',function(){const b=document.body;let last='';
function sync(){const q=b.classList.contains('qa');const k=q+'';if(k!==last){last=k;setTimeout(()=>dispatchEvent(new Event('resize')),60)}}
new MutationObserver(sync).observe(b,{attributes:true,attributeFilter:['class']});});
