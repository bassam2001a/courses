(function(){
  var VER='v76', K='aplus-theme', root=document.documentElement;
  function get(){ try{ return localStorage.getItem(K); }catch(e){ return null; } }
  function sys(){ return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'; }
  function cur(){ return get()||sys(); }
  function apply(t){
    root.setAttribute('data-theme',t);
    var m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content',t==='dark'?'#0b1623':'#0369a1');
    var b=document.getElementById('theme-btn'); if(b){ b.textContent=t==='dark'?'☀ فاتح':'☾ داكن'; b.setAttribute('aria-label',t==='dark'?'الوضع الفاتح':'الوضع الداكن'); }
  }
  apply(cur());
  window.addEventListener('DOMContentLoaded',function(){
    var b=document.createElement('button'); b.id='theme-btn'; b.type='button'; b.className='theme-btn';
    b.onclick=function(){ var n=cur()==='dark'?'light':'dark'; try{ localStorage.setItem(K,n); }catch(e){} apply(n); };
    document.body.appendChild(b); apply(cur());
    var vv=document.createElement('div'); vv.className='ver'; vv.textContent=VER; document.body.appendChild(vv);
    // install (PWA)
    var box=document.getElementById('install-box'); if(!box) return;
    var ev=null, ios=/iphone|ipad|ipod/i.test(navigator.userAgent), standalone=(navigator.standalone===true)||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
    if(standalone) return;
    function show(txt,btn){ box.hidden=false; box.innerHTML='<span class="inst-t">'+txt+'</span>'+(btn?'<button type="button" class="btn primary" id="inst-btn">ثبّت الموقع كتطبيق</button>':''); var ib=document.getElementById('inst-btn'); if(ib) ib.onclick=function(){ if(!ev) return; ev.prompt(); ev.userChoice.then(function(){ ev=null; box.hidden=true; }); }; }
    window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); ev=e; show('ثبّت الموقع على جهازك زي أي تطبيق.',true); });
    window.addEventListener('appinstalled',function(){ box.hidden=true; });
    if(ios) show('على الآيفون: افتح الموقع في Safari، دوس زر المشاركة، وبعدين «إضافة إلى الشاشة الرئيسية».',false);
  });
})();
