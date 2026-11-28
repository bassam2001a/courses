(function(){
  var V=window.APLUS_VIDEOS||{}, P=window.APLUS_PDFS||{};
  var CACHE='aplus-vid-v1', KOK='aplus-off-ok-v1';
  var allRun=false, allStop=false, lastSt='', cur=null, blobUrl=null, act=false, lastSave=0, hooks=null, busy=false;
  function S(){ return window.AplusSync; }
  function $(id){ return document.getElementById(id); }
  function mv(){ return $('mv'); }
  function ytEl(){ return document.getElementById('yt'); }
  function key(l){ return '/offline/'+V[l.n]; }
  function unlocked(){ var s=S(); try{ var v=localStorage.getItem(KOK); return !!v && (!s||!s.uid()||v===s.uid()||!s.loggedIn()); }catch(e){ return false; } }
  function hasCache(){ return !!(window.caches); }
  function getSaved(l){
    if(!hasCache()||!V[l.n]) return Promise.resolve(null);
    return caches.open(CACHE).then(function(c){ return c.match(key(l)); }).then(function(r){ return r?r.blob():null; }).catch(function(){ return null; });
  }
  function isSaved(l){ if(!hasCache()||!V[l.n]) return Promise.resolve(false); return caches.open(CACHE).then(function(c){ return c.match(key(l)); }).then(function(r){ return !!r; }).catch(function(){ return false; }); }
  function sign(path){
    var s=S(); if(!s||!s.loggedIn()) return Promise.reject(new Error('login'));
    if(path.indexOf('2:')===0){
      return s.token().then(function(t){
        return fetch(s.url+'/functions/v1/sign2',{method:'POST',headers:{apikey:s.key,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({path:path.slice(2)})});
      }).then(function(r){ return r.json().then(function(j){ if(!r.ok||!j.url){ var e=new Error((j&&j.error)||('HTTP '+r.status)); e.status=r.status; throw e; } return j.url; }); });
    }
    return s.token().then(function(t){
      return fetch(s.url+'/storage/v1/object/sign/videos/'+path,{method:'POST',headers:{apikey:s.key,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({expiresIn:21600})});
    }).then(function(r){ return r.json().then(function(j){ if(!r.ok||!j.signedURL){ var e=new Error((j&&(j.message||j.error))||('HTTP '+r.status)); e.status=r.status; throw e; } return s.url+'/storage/v1'+j.signedURL; }); });
  }
  function canPlay(l){ if(!V[l.n]) return false; var s=S(); return !!(s&&s.loggedIn()) || (unlocked()&&hasCache()); }
  function hasPdf(l){ return !!P[l.n]; }
  function say(msg){ var f=$('flash'); if(f){ f.textContent=msg; f.hidden=!msg; } }
  function pkey(l){ return '/offline/pdf/'+P[l.n]; }
  function getPdfSaved(l){
    if(!hasCache()||!P[l.n]) return Promise.resolve(null);
    return caches.open(CACHE).then(function(c){ return c.match(pkey(l)); }).then(function(r){ return r?r.blob():null; }).catch(function(){ return null; });
  }
  function fetchPdf(l){
    return sign(P[l.n]).then(function(u){ return fetch(u); }).then(function(r){ if(!r.ok){ var e=new Error('HTTP '+r.status); e.status=r.status; throw e; } return r.blob(); })
      .then(function(b){ var pb=new Blob([b],{type:'application/pdf'}); if(hasCache()) caches.open(CACHE).then(function(c){ return c.put(pkey(l),new Response(pb,{headers:{'Content-Type':'application/pdf'}})); }).then(chg).catch(function(){}); return pb; });
  }
  function canPreview(){ return !!navigator.pdfViewerEnabled && !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent); }
  function openBlob(w,b,title){
    if(w||!canPreview()){ var u0=URL.createObjectURL(b); if(w){ try{ w.location.href=u0; return; }catch(e){} } var a=document.createElement('a'); a.href=u0; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ if(!document.hidden) location.href=u0; },1200); return; }
    var u=URL.createObjectURL(b), o=document.createElement('div'); o.className='pdfov';
    o.innerHTML='<div class="pdfov-bar"><b>'+(title||'ملخص الدرس')+'</b><span><a class="btn primary" target="_blank" rel="noopener" href="'+u+'">فتح كامل ↗</a><button type="button" class="btn">إغلاق ✕</button></span></div><iframe title="PDF" src="'+u+'#view=FitH"></iframe>';
    o.querySelector('button').onclick=function(){ o.remove(); setTimeout(function(){ try{ URL.revokeObjectURL(u); }catch(e){} },60000); };
    document.body.appendChild(o);
  }
  function openPdf(l,flash){
    var s=S(), say2=flash||say;
    var w=canPreview()?null:window.open('about:blank','_blank');
    getPdfSaved(l).then(function(b){
      if(b && unlocked() && (navigator.onLine===false || !s || !s.loggedIn())){ openBlob(w,b,'PDF · '+l.n); return; }
      if(!s||!s.loggedIn()){ if(w) w.close(); if(b) say2('ادخل كود الأوفلاين مرة وإنت أونلاين عشان الملخصات المحفوظة تفتح.'); else { say2('سجّل دخول الأول عشان تفتح ملخص الـPDF.'); if(s&&s.login) s.login(); } return; }
      if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(function(){});
      return fetchPdf(l).then(function(pb){ openBlob(w,pb,'PDF · '+l.n); }).catch(function(e){
        if(b && unlocked()){ openBlob(w,b,'PDF · '+l.n); return; }
        if(w) w.close();
        say2(e.status===400||e.status===403||e.status===404?'الحساب ده مش متفعّل لملفات الـPDF.':(navigator.onLine===false?'مفيش نت، والـPDF ده مش محفوظ. افتحه مرة وإنت أونلاين.':'مقدرتش أفتح الـPDF، جرّب تاني.'));
      });
    });
  }
  function savePdfs(){
    if(busy) return; var s=S();
    gate().then(function(){
      busy=true; var ks=Object.keys(P), done=0, fail=0;
      if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(function(){});
      return ks.reduce(function(p,k){ return p.then(function(){
        var l={n:+k}; st('بحمّل الملخصات '+done+' من '+ks.length);
        return getPdfSaved(l).then(function(b){ if(b){ done++; return; } return fetchPdf(l).then(function(){ done++; }).catch(function(){ fail++; }); });
      }); }, Promise.resolve()).then(function(){ busy=false; st('اتحفظ '+done+' ملخص'+(fail?' (فشل '+fail+')':'')+' ✓'); });
    }).catch(function(e){ busy=false; if(e&&e.message==='login'){ st('سجّل دخول الأول.'); if(S()&&S().login) S().login(); } });
  }

  function fetchVideoBlob(l,onp){
    return sign(V[l.n]).then(function(u){ return fetch(u); }).then(function(r){
      if(!r.ok){ var e=new Error('HTTP '+r.status); e.status=r.status; throw e; }
      var tot=+r.headers.get('content-length')||0, got=0, parts=[], rd=r.body&&r.body.getReader?r.body.getReader():null;
      if(!rd) return r.blob();
      return (function pump(){ return rd.read().then(function(x){ if(x.done) return new Blob(parts,{type:'video/mp4'}); parts.push(x.value); got+=x.value.length; if(tot&&onp) onp(Math.round(got*100/tot)); return pump(); }); })();
    });
  }
  function saveAll(mode){
    if(busy) return;
    if(!hasCache()){ st('المتصفح ده مش بيدعم الحفظ.'); return; }
    gate().then(function(){
      busy=true; allRun=true; allStop=false;
      var wl=null; try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(function(x){ wl=x; }).catch(function(){}); }catch(e){}
      if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(function(){});
      var pk=Object.keys(P).map(Number).sort(function(a,b){return a-b;}), vk=Object.keys(V).map(Number).sort(function(a,b){return a-b;});
      if(mode==='v') pk=[]; if(mode==='p') vk=[];
      var total=pk.length+vk.length, done=0, fail=0, skipped=0, full=false;
      function ref(){ var l=cur; if(l) paintExtra(l,lastSt); }
      st('بجهّز الحفظ…'); ref();
      function one(kind,n){
        if(allStop||full) return Promise.resolve();
        var l={n:n}, isV=kind==='v', label=(isV?'فيديو ':'ملخص ')+n;
        var chk=isV?isSaved(l):getPdfSaved(l).then(function(b){ return !!b; });
        return chk.then(function(have){
          if(have){ done++; skipped++; return; }
          st('بحمّل '+label+' ('+(done+fail+1)+' من '+total+')…');
          var job=isV?fetchVideoBlob(l,function(pc){ st('بحمّل '+label+' '+pc+'% ('+(done+fail+1)+' من '+total+')'); }).then(function(b){ return caches.open(CACHE).then(function(c){ return c.put(key(l),new Response(b,{headers:{'Content-Type':'video/mp4'}})); }); }):fetchPdf(l);
          return job.then(function(){ done++; }).catch(function(e){
            if(e&&(e.name==='QuotaExceededError'||/quota/i.test(e.message||''))){ full=true; return; }
            fail++;
          });
        });
      }
      var seq=pk.map(function(n){ return ['p',n]; }).concat(vk.map(function(n){ return ['v',n]; }));
      return seq.reduce(function(p,it){ return p.then(function(){ return one(it[0],it[1]); }); }, Promise.resolve()).then(function(){
        busy=false; allRun=false; if(wl){ try{ wl.release(); }catch(e){} }
        var msg=full?'المساحة على الجهاز خلصت. اتحفظ '+done+' من '+total+'. امسح حاجة وكمّل (الضغط تاني بيكمّل من حيث وقف).'
          :allStop?'وقفت. اتحفظ '+done+' من '+total+'. اضغط تاني عشان تكمّل.'
          :'اتحفظ '+done+' من '+total+(fail?' (فشل '+fail+'، اضغط تاني يكمّل الباقي)':'')+(skipped?' · منهم '+skipped+' كانوا محفوظين':'')+' ✓';
        st(msg); ref(); if(!cur) say(msg);
      });
    }).catch(function(e){ busy=false; allRun=false; if(e&&e.message==='login'){ st('سجّل دخول الأول.'); if(S()&&S().login) S().login(); } });
  }

  function savedStatus(){
    var out={v:{},p:{},hv:{},hp:{}};
    Object.keys(V).forEach(function(n){ out.hv[n]=1; }); Object.keys(P).forEach(function(n){ out.hp[n]=1; });
    if(!hasCache()) return Promise.resolve(out);
    return caches.open(CACHE).then(function(c){
      var jobs=[]; Object.keys(V).forEach(function(n){ jobs.push(c.match(key({n:+n})).then(function(r){ if(r) out.v[n]=1; })); });
      Object.keys(P).forEach(function(n){ jobs.push(c.match(pkey({n:+n})).then(function(r){ if(r) out.p[n]=1; })); });
      return Promise.all(jobs);
    }).then(function(){ return out; }).catch(function(){ return out; });
  }
  function hide(){
    var v=mv(); if(v){ try{ v.pause(); }catch(e){} v.hidden=true; v.removeAttribute('src'); v.load&&v.load(); }
    var y=ytEl(); if(y) y.style.display='';
    if(blobUrl){ try{ URL.revokeObjectURL(blobUrl); }catch(e){} blobUrl=null; }
    act=false; cur=null; var x=$('p-extra'); if(x) x.innerHTML='';
  }
  function active(){ return act; }
  function flushPos(){ var v=mv(); if(act&&v&&hooks&&cur){ hooks.save(v.currentTime||0); } }
  function play(l,startAt,h){
    var v=mv(); if(!v) return;
    cur=l; hooks=h; act=true; lastSave=0;
    var y=ytEl(); if(y) y.style.display='none';
    v.hidden=false;
    if(blobUrl){ try{ URL.revokeObjectURL(blobUrl); }catch(e){} blobUrl=null; }
    var go=function(src){
      v.src=src;
      var st=startAt||0, d=l.dur||0; if(st>0&&d&&st>d-15) st=0;
      var once=function(){ v.removeEventListener('loadedmetadata',once); if(st>0){ try{ v.currentTime=st; }catch(e){} } var pr=v.play(); if(pr&&pr.catch) pr.catch(function(){}); };
      v.addEventListener('loadedmetadata',once);
      v.load();
    };
    v.ontimeupdate=function(){ var n=Date.now(); if(n-lastSave>4000){ lastSave=n; flushPos(); } };
    v.onpause=function(){ flushPos(); };
    v.onended=function(){ if(hooks) hooks.end(); };
    v.onerror=function(){ if(!act) return; say('الفيديو مش بيشتغل. تأكد من النت أو افتحه على يوتيوب.'); };
    paintExtra(l);
    getSaved(l).then(function(b){
      if(b&&unlocked()){ blobUrl=URL.createObjectURL(b); go(blobUrl); return; }
      return sign(V[l.n]).then(go).catch(function(e){
        say(e.status===400||e.status===403||e.status===404?'الحساب ده مش متفعّل للفيديوهات الخاصة. افتح الدرس على يوتيوب.':'مقدرتش أحمّل الفيديو. افتحه على يوتيوب أو جرّب تاني.');
      });
    });
  }
  function paintExtra(l,msg){
    var x=$('p-extra'); if(!x) return;
    isSaved(l).then(function(saved){
      if(!cur||cur!==l) return;
      x.innerHTML='<button class="btn" type="button" id="p-off">'+(saved?'محفوظ أوفلاين ✓ (مسح)':'حفظ للأوفلاين')+'</button>'+(P[l.n]?'<button class="btn" type="button" id="p-pdf">ملخص PDF</button>':'')+(allRun?'<button class="btn" type="button" id="p-stop">إيقاف الحفظ ✕</button>':'<button class="btn primary" type="button" id="p-allvid">حفظ كل الفيديوهات أوفلاين</button><button class="btn primary" type="button" id="p-allpdf">حفظ كل الملخصات (PDF) أوفلاين</button>')+'<span class="off-st" id="p-st">'+(msg||(allRun?lastSt:''))+'</span>';
      $('p-off').onclick=function(){ saved?removeSaved(l):saveOffline(l); };
      var pb=$('p-pdf'); if(pb) pb.onclick=function(){ openPdf(l); };
      var ap=$('p-allpdf'); if(ap) ap.onclick=function(){ saveAll('p'); };
      var aa=$('p-allvid'); if(aa) aa.onclick=function(){ saveAll('v'); };
      var sp=$('p-stop'); if(sp) sp.onclick=function(){ allStop=true; st('بوقّف بعد الملف الحالي…'); };
    });
  }
  function chg(){ try{ window.dispatchEvent(new Event('aplus-offline')); }catch(e){} }
  function st(t){ lastSt=t||''; var e=$('p-st'); if(e) e.textContent=lastSt; }
  function removeSaved(l){ caches.open(CACHE).then(function(c){ return c.delete(key(l)); }).then(function(){ chg(); paintExtra(l,'اتمسحت النسخة المحفوظة.'); }); }
  function gate(){
    return new Promise(function(res,rej){
      if(unlocked()){ res(); return; }
      var s=S(); if(!s||!s.loggedIn()){ rej(new Error('login')); return; }
      var m=document.createElement('div'); m.className='mdl';
      m.innerHTML='<div class="box"><h3>كود الحفظ الأوفلاين</h3><p>اكتب الكود عشان تفتح وضع الحفظ على الجهاز.</p><input id="off-code" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="الكود"><div class="msg" id="off-msg"></div><div class="acts"><button class="btn primary" id="off-ok" type="button">تأكيد</button><button class="btn" id="off-x" type="button">إلغاء</button></div></div>';
      document.body.appendChild(m);
      var inp=m.querySelector('#off-code'), msg=m.querySelector('#off-msg');
      function close(){ m.remove(); }
      m.querySelector('#off-x').onclick=function(){ close(); rej(new Error('cancel')); };
      function submit(){
        var code=inp.value.replace(/\D/g,''); if(!code){ msg.textContent='اكتب الكود.'; return; }
        msg.textContent='…';
        s.token().then(function(t){ return fetch(s.url+'/rest/v1/rpc/check_offline_code',{method:'POST',headers:{apikey:s.key,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({code:code})}); })
          .then(function(r){ return r.json().then(function(j){ if(r.ok&&j===true){ try{ localStorage.setItem(KOK,s.uid()); }catch(e){} close(); res(); } else { msg.textContent=(r.ok?'الكود غلط.':'مش متفعّل على الحساب ده.'); } }); })
          .catch(function(){ msg.textContent='مشكلة في الاتصال.'; });
      }
      m.querySelector('#off-ok').onclick=submit; inp.addEventListener('keydown',function(e){ if(e.key==='Enter') submit(); }); inp.focus();
    });
  }
  function saveOffline(l){
    if(busy) return;
    if(!hasCache()){ st('المتصفح ده مش بيدعم الحفظ.'); return; }
    gate().then(function(){
      busy=true; st('بحمّل…');
      if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(function(){});
      return sign(V[l.n]).then(function(u){ return fetch(u); }).then(function(r){
        if(!r.ok) throw new Error('HTTP '+r.status);
        var tot=+r.headers.get('content-length')||0, got=0, parts=[], rd=r.body&&r.body.getReader?r.body.getReader():null;
        if(!rd) return r.blob();
        return (function pump(){ return rd.read().then(function(x){ if(x.done) return new Blob(parts,{type:'video/mp4'}); parts.push(x.value); got+=x.value.length; if(tot) st('بحمّل '+Math.round(got*100/tot)+'%'); return pump(); }); })();
      }).then(function(b){ return caches.open(CACHE).then(function(c){ return c.put(key(l),new Response(b,{headers:{'Content-Type':'video/mp4'}})); }); })
      .then(function(){ busy=false; chg(); paintExtra(l,'اتحفظ على الجهاز ✓'); })
      .catch(function(e){ busy=false; st('فشل الحفظ. جرّب تاني.'); });
    }).catch(function(e){ if(e&&e.message==='login'){ st('سجّل دخول الأول.'); if(S()&&S().login) S().login(); } });
  }
  window.addEventListener('pagehide',flushPos);
  window.addEventListener('offline',function(){ say('انت أوفلاين. الموقع والاختبارات والتقدم شغالين، والفيديوهات والملخصات المحفوظة بس هي اللي تفتح.'); });
  window.addEventListener('online',function(){ say(''); });
  window.AplusMedia={savedStatus:savedStatus,canPlay:canPlay,play:play,hide:hide,active:active,hasPdf:hasPdf,openPdf:openPdf};
})();
