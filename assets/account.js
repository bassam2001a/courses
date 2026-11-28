(function(){
  var URL_='https://xqqpvkqewtckstmasxog.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcXB2a3Fld3Rja3N0bWFzeG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NTE2NTgsImV4cCI6MjExMTMyNzY1OH0.y52_JcGbll23y-QCn04P7WI-Jm1xmzCY7ZvSvMgZJ54';
  var KA='aplus-auth-v1', KS='aplus-sync-v1';
  var LK={progress:'aplus-progress-v1',notes:'aplus-notes-v1',quiz:'aplus-quiz-v1',resume:'aplus-resume-v1'};
  var sess=null, meta={dirty:false,at:null}, timer=null, lastPush=0, busy=false;
  try{ sess=JSON.parse(localStorage.getItem(KA)||'null'); }catch(e){}
  try{ meta=JSON.parse(localStorage.getItem(KS)||'null')||meta; }catch(e){}
  var saveMeta=function(){ try{localStorage.setItem(KS,JSON.stringify(meta));}catch(e){} };
  var $=function(id){ return document.getElementById(id); };
  function rd(k){ try{ return JSON.parse(localStorage.getItem(LK[k])||'null'); }catch(e){ return null; } }
  function wr(k,v){ try{ localStorage.setItem(LK[k],JSON.stringify(v)); }catch(e){} }
  function rdS(){ try{ return JSON.parse(localStorage.getItem('aplus-streak-v1')||'null'); }catch(e){ return null; } }
  function local(){ var r=rd('resume')||{last:null,pos:{}}, st=rdS(); if(st&&st.last) r.streak={last:st.last,n:st.n||1}; return {progress:rd('progress')||{},notes:rd('notes')||{},quiz:rd('quiz')||{},resume:r}; }

  function toEmail(kind,id){
    id=String(id||'').trim();
    if(kind==='phone'){ var d=id.replace(/[^0-9]/g,''); if(d.indexOf('0020')===0) d=d.slice(4); else if(d.indexOf('20')===0&&d.length===12) d=d.slice(2); if(d.charAt(0)!=='0'&&d.length===10) d='0'+d; if(d.length<8) throw new Error('رقم الموبايل مش مظبوط.'); return 'p'+d+'@phone.courses-app.dev'; }
    id=id.toLowerCase(); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(id)) throw new Error('الإيميل مش مظبوط.'); return id;
  }
  function nice(m){
    m=String(m||'');
    if(/already|registered/i.test(m)) return 'الحساب ده موجود قبل كده. جرّب تسجّل دخول.';
    if(/invalid login|invalid_credentials/i.test(m)) return 'البيانات غلط (الإيميل/الرقم أو الباسورد).';
    if(/at least|weak|short/i.test(m)) return 'الباسورد لازم يكون 6 حروف أو أرقام على الأقل.';
    if(/rate|too many|limit/i.test(m)) return 'محاولات كتير، استنى شوية وجرّب تاني.';
    if(/network|fetch|failed/i.test(m)) return 'مفيش اتصال بالنت دلوقتي.';
    return m||'حصل خطأ.';
  }
  function api(path,opt,tok){
    opt=opt||{}; var h={apikey:KEY,'Content-Type':'application/json'};
    if(tok) h.Authorization='Bearer '+tok;
    if(opt.headers) for(var k in opt.headers) h[k]=opt.headers[k];
    return fetch(URL_+path,{method:opt.method||'GET',headers:h,body:opt.body,keepalive:!!opt.keepalive}).then(function(r){
      return r.text().then(function(t){ var j=null; try{ j=t?JSON.parse(t):null; }catch(e){} if(!r.ok){ var e=new Error((j&&(j.msg||j.message||j.error_description||j.error))||('HTTP '+r.status)); e.status=r.status; throw e; } return j; });
    });
  }
  function setSess(j){
    sess={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000-60000,uid:j.user&&j.user.id,label:(sess&&sess.label)||''};
    try{localStorage.setItem(KA,JSON.stringify(sess));}catch(e){}
  }
  function token(){
    if(!sess) return Promise.reject(new Error('no session'));
    if(Date.now()<sess.exp) return Promise.resolve(sess.access);
    return api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:sess.refresh})}).then(function(j){ setSess(j); return sess.access; }).catch(function(e){ if(e.status===400||e.status===401){ sess=null; localStorage.removeItem(KA); paint(); } throw e; });
  }
  function pull(){
    return token().then(function(t){ return api('/rest/v1/user_data?select=*&user_id=eq.'+sess.uid,{},t); }).then(function(rows){ return rows&&rows[0]||null; });
  }
  function merge(a,b){ /* a=local, b=remote */
    var o={progress:{},notes:{},quiz:{},resume:{last:null,pos:{}}}, k;
    for(k in (b.progress||{})) if(b.progress[k]) o.progress[k]=true;
    for(k in (a.progress||{})) if(a.progress[k]) o.progress[k]=true;
    var ids={}; for(k in (a.notes||{})) ids[k]=1; for(k in (b.notes||{})) ids[k]=1;
    for(k in ids){ var x=(a.notes||{})[k]||'', y=(b.notes||{})[k]||''; o.notes[k]= !x?y : !y?x : x===y?x : (y+'\n---\n'+x); }
    var qi={}; for(k in (a.quiz||{})) qi[k]=1; for(k in (b.quiz||{})) qi[k]=1;
    for(k in qi){ var p=(a.quiz||{})[k]||{}, q=(b.quiz||{})[k]||{}; o.quiz[k]={score:Math.max(p.score||0,q.score||0),passed:!!(p.passed||q.passed)}; }
    var ra=a.resume||{}, rb=b.resume||{}, newer=((rb.ts||0)>(ra.ts||0))?rb:ra, older=newer===rb?ra:rb;
    o.resume={last:newer.last||older.last||null,ts:newer.ts||older.ts||0,pos:{}};
    for(k in (older.pos||{})) o.resume.pos[k]=older.pos[k];
    for(k in (newer.pos||{})) o.resume.pos[k]=newer.pos[k];
    var sa=ra.streak, sb=rb.streak, sw=!sa?sb:!sb?sa:(sb.last>sa.last?sb:sa.last>sb.last?sa:((sb.n||0)>(sa.n||0)?sb:sa));
    if(sw) o.resume.streak=sw;
    return o;
  }
  function same(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
  function push(state,keep){
    return token().then(function(t){
      return api('/rest/v1/user_data?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},keepalive:keep,
        body:JSON.stringify({user_id:sess.uid,progress:state.progress,notes:state.notes,quiz:state.quiz,resume:state.resume,updated_at:new Date().toISOString()})},t);
    }).then(function(rows){ meta.dirty=false; meta.at=rows&&rows[0]&&rows[0].updated_at||meta.at; saveMeta(); status('تم الحفظ على حسابك ✓'); });
  }
  function status(s){ var e=$('acc-status'); if(e) e.textContent=s||''; }
  function applyLocal(st){ wr('progress',st.progress); wr('notes',st.notes); wr('quiz',st.quiz); var r={}, k; for(k in st.resume) if(k!=='streak') r[k]=st.resume[k]; wr('resume',r); if(st.resume&&st.resume.streak){ try{ localStorage.setItem('aplus-streak-v1',JSON.stringify({last:st.resume.streak.last,n:st.resume.streak.n,broke:0})); }catch(e){} } }
  function sync(first){
    if(!sess||busy) return Promise.resolve(); busy=true; status('بيزامن…');
    return pull().then(function(rem){
      var loc=local();
      if(!rem){ return push(loc); }
      var rs={progress:rem.progress||{},notes:rem.notes||{},quiz:rem.quiz||{},resume:rem.resume||{last:null,pos:{}}};
      if(first||meta.dirty){
        var m=merge(loc,rs);
        var changedLocal=!same(m,loc);
        applyLocal(m);
        return push(m).then(function(){ if(changedLocal) reloadOnce(); });
      }
      if(meta.at!==rem.updated_at){
        applyLocal(rs); meta.at=rem.updated_at; saveMeta();
        if(!same(rs,loc)) reloadOnce();
      }
      status('متزامن ✓');
    }).catch(function(e){ status('مش قادر يزامن دلوقتي'); }).then(function(){ busy=false; });
  }
  function reloadOnce(){ if(sessionStorage.getItem('aplus-rl')==='1'){ sessionStorage.removeItem('aplus-rl'); return; } sessionStorage.setItem('aplus-rl','1'); location.reload(); }
  function dirty(){
    if(!sess) return; meta.dirty=true; saveMeta();
    var wait=Math.max(2500,15000-(Date.now()-lastPush)); if(timer) return;
    timer=setTimeout(function(){ timer=null; lastPush=Date.now(); push(local()).catch(function(){ status('هيتحفظ لما النت يرجع'); }); },wait);
  }
  function flush(){ if(sess&&meta.dirty){ try{ push(local(),true); }catch(e){} } }
  window.addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',function(){ if(document.hidden) flush(); else if(sess&&!meta.dirty) sync(false); });

  function auth(kind,id,pw,mode){
    var email=toEmail(kind,id), body=JSON.stringify({email:email,password:pw});
    var p= mode==='signup' ? api('/auth/v1/signup',{method:'POST',body:body}) : api('/auth/v1/token?grant_type=password',{method:'POST',body:body});
    return p.then(function(j){
      if(!j.access_token){ return api('/auth/v1/token?grant_type=password',{method:'POST',body:body}); }
      return j;
    }).then(function(j){
      sess=null; sess={label:(kind==='phone'?String(id).replace(/[^0-9+]/g,''):email)}; setSess(j); sess.label=(kind==='phone'?String(id).replace(/[^0-9+]/g,''):email); localStorage.setItem(KA,JSON.stringify(sess));
      meta={dirty:true,at:null}; saveMeta();
      return sync(true);
    });
  }
  function logout(){ sess=null; localStorage.removeItem(KA); meta={dirty:false,at:null}; saveMeta(); paint(); }

  function paint(){
    var bar=$('acc'); if(!bar) return;
    if(sess){
      bar.innerHTML='<span class="acc-who">حسابك: <b dir="ltr">'+(sess.label||'')+'</b></span><span class="acc-st" id="acc-status"></span><button class="btn" type="button" id="acc-out">خروج</button>';
      $('acc-out').onclick=function(){ if(confirm('تسجّل خروج؟ التقدم محفوظ على حسابك وهيرجع لما تدخل تاني.')) logout(); };
    } else {
      bar.innerHTML='<span class="acc-who">سجّل حساب عشان تقدمك يتحفظ ويتزامن بين الموبايل واللابتوب.</span><button class="btn primary" type="button" id="acc-in">دخول / حساب جديد</button>';
      $('acc-in').onclick=openModal;
    }
  }
  function openModal(){
    var m=document.createElement('div'); m.className='modal';
    m.innerHTML='<div class="sheet" role="dialog" aria-modal="true"><h2>حسابك</h2>'+
      '<div class="tabs"><button type="button" data-k="email" aria-pressed="true">إيميل</button><button type="button" data-k="phone" aria-pressed="false">رقم موبايل</button></div>'+
      '<label class="f"><span id="lb-id">الإيميل</span><input id="in-id" type="email" inputmode="email" autocomplete="username" dir="ltr"></label>'+
      '<label class="f"><span>الباسورد (6 على الأقل)</span><input id="in-pw" type="password" autocomplete="current-password" dir="ltr"></label>'+
      '<p class="err" id="in-err" hidden></p>'+
      '<div class="acts"><button class="btn primary" type="button" id="b-login">دخول</button><button class="btn" type="button" id="b-signup">حساب جديد</button><button class="btn" type="button" id="b-x">إلغاء</button></div>'+
      '<p class="hint2">من غير كود SMS. لو نسيت الباسورد مفيش استرجاع، فاحفظه. تقدمك الحالي على الجهاز ده هيتنقل لحسابك أول ما تدخل.</p></div>';
    document.body.appendChild(m);
    var kind='email', idI=m.querySelector('#in-id'), pwI=m.querySelector('#in-pw'), err=m.querySelector('#in-err');
    Array.prototype.forEach.call(m.querySelectorAll('.tabs button'),function(b){ b.onclick=function(){ kind=b.getAttribute('data-k'); Array.prototype.forEach.call(m.querySelectorAll('.tabs button'),function(x){ x.setAttribute('aria-pressed',x===b?'true':'false'); }); m.querySelector('#lb-id').textContent= kind==='phone'?'رقم الموبايل':'الإيميل'; idI.type= kind==='phone'?'tel':'email'; idI.inputMode= kind==='phone'?'tel':'email'; idI.value=''; }; });
    function go(mode){
      err.hidden=true; var pw=pwI.value;
      if(pw.length<6){ err.textContent='الباسورد لازم يكون 6 على الأقل.'; err.hidden=false; return; }
      var bs=m.querySelectorAll('.acts button'); Array.prototype.forEach.call(bs,function(b){ b.disabled=true; });
      Promise.resolve().then(function(){ return auth(kind,idI.value,pw,mode); }).then(function(){ m.remove(); paint(); }).catch(function(e){ err.textContent=nice(e.message); err.hidden=false; Array.prototype.forEach.call(bs,function(b){ b.disabled=false; }); });
    }
    m.querySelector('#b-login').onclick=function(){ go('login'); };
    m.querySelector('#b-signup').onclick=function(){ go('signup'); };
    m.querySelector('#b-x').onclick=function(){ m.remove(); };
    m.addEventListener('click',function(e){ if(e.target===m) m.remove(); });
    idI.focus();
  }

  window.AplusSync={dirty:dirty,token:token,url:URL_,key:KEY,uid:function(){return sess&&sess.uid||null;},loggedIn:function(){return !!sess;},login:function(){ if(typeof openModal==='function') openModal(); }};
  document.addEventListener('DOMContentLoaded',function(){ paint(); if(sess) sync(false); });
  if(document.readyState!=='loading'){ paint(); if(sess) sync(false); }
})();
