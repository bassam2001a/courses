(function(){
  var KEY_R='aplus-resume-v1', KEY_P='aplus-progress-v1', KEY_N='aplus-notes-v1', KEY_Q='aplus-quiz-v1';
  var data = window.APLUS || [], QUIZ = window.QUIZ || {}, PASS = 60;
  var progress = {}, notes = {}, quiz = {}, resume = {last:null,pos:{}};
  try{ var rr=JSON.parse(localStorage.getItem(KEY_R)||'null'); if(rr&&rr.pos) resume=rr; }catch(e){}
  var saveR=function(){ try{localStorage.setItem(KEY_R,JSON.stringify(resume));}catch(e){} if(window.AplusSync)AplusSync.dirty(); };
  var clock=function(s){ s=Math.max(0,Math.floor(s)); var h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+':'+pad(m):m)+':'+pad(x); };
  try{ progress = JSON.parse(localStorage.getItem(KEY_P)||'{}')||{}; }catch(e){ progress={}; }
  try{ notes = JSON.parse(localStorage.getItem(KEY_N)||'{}')||{}; }catch(e){ notes={}; }
  try{ quiz = JSON.parse(localStorage.getItem(KEY_Q)||'{}')||{}; }catch(e){ quiz={}; }
  var saveP=function(){ try{localStorage.setItem(KEY_P,JSON.stringify(progress));}catch(e){} if(window.AplusSync)AplusSync.dirty(); };
  var saveN=function(){ try{localStorage.setItem(KEY_N,JSON.stringify(notes));}catch(e){} if(window.AplusSync)AplusSync.dirty(); };
  var saveQ=function(){ try{localStorage.setItem(KEY_Q,JSON.stringify(quiz));}catch(e){} if(window.AplusSync)AplusSync.dirty(); };
  var fmt=function(s){ var m=Math.round(s/60); if(m<60) return m+' د'; var h=Math.floor(m/60), r=m%60; return h+' س'+(r?' '+r+' د':''); };
  var pad=function(n){ return n<10?('0'+n):(''+n); };
  var iso=function(s){ return String(s).replace(/[A-Za-z][A-Za-z0-9+.#\-\/]*(?: [A-Za-z0-9][A-Za-z0-9+.#\-\/]*)*/g, function(m){ return '\u2066'+m+'\u2069'; }); };
  var esc=function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  var list=document.getElementById('list'), q=document.getElementById('q');
  var fill=document.getElementById('fill'), cnt=document.getElementById('cnt'), pct=document.getElementById('pct');
  var flashEl=document.getElementById('flash');
  var winStart=0, filter='all', flash='', lastResult={id:null,html:''};

  function passed(id){ return !!(quiz[id] && quiz[id].passed); }
  function lockedAt(i){ if(i<=0) return false; var prev=data[i-1]; return !!(QUIZ[prev.id] && !passed(prev.id)); }
  function counts(){ var d=0; data.forEach(function(l){ if(progress[l.id]) d++; }); return {d:d,t:data.length}; }
  function paintProgress(){
    var c=counts(), p=c.t? Math.round(c.d*100/c.t):0, left=document.getElementById('left');
    fill.style.width=p+'%'; cnt.textContent='خلصت '+c.d+' من '+c.t; pct.textContent=p+'%';
    if(left) left.textContent='باقي '+(c.t-c.d)+' درس';
  }
  function setFlash(msg){ flash=msg; if(flashEl){ flashEl.textContent=msg; flashEl.hidden=!msg; } }

  var ytp=null, ytReady=false, curLesson=null, pending=null, tick=null, apiLoading=false;
  function byId(id){ for(var i=0;i<data.length;i++) if(data[i].id===id) return data[i]; return null; }
  function savePos(){
    if(window.AplusMedia&&AplusMedia.active()) return;
    if(!ytp||!ytReady||!curLesson||!ytp.getCurrentTime) return;
    var t=0; try{ t=ytp.getCurrentTime()||0; }catch(e){ return; }
    if(t<3) return;
    resume.pos[curLesson.id]=Math.floor(t); resume.last=curLesson.id; resume.ts=Date.now(); saveR();
  }
  function onState(ev){
    if(ev.data===1){ if(!tick) tick=setInterval(function(){ savePos(); paintResume(); },4000); }
    else { if(tick){ clearInterval(tick); tick=null; } if(ev.data===2) { savePos(); paintResume(); } }
    if(ev.data===0 && curLesson){
      resume.pos[curLesson.id]=0; var i=data.indexOf(curLesson); resume.last=(data[i+1]||curLesson).id; saveR(); paintResume(); render();
    }
  }
  function ensureApi(cb){
    if(window.YT && YT.Player){ cb(); return; }
    var prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=function(){ if(prev) prev(); cb(); };
    if(!apiLoading){ apiLoading=true; var sc=document.createElement('script'); sc.src='https://www.youtube.com/iframe_api'; document.head.appendChild(sc); }
  }
  var QUIZ_GATE_ON=true; /* set to true to require passing the previous lesson's quiz */
  function gatedBy(l){ if(!QUIZ_GATE_ON) return null; var i=data.indexOf(l); if(i<=0) return null; var p=data[i-1]; return (window.QUIZ_GATE&&QUIZ_GATE[p.id]&&QUIZ[p.id]&&!passed(p.id))?p:null; }
  function paintPlayerQuiz(l){
    var pq=document.getElementById('p-quiz'); if(!pq) return;
    pq.innerHTML=''; if(!QUIZ[l.id]) return;
    var b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='حل الاختبار';
    var box=buildQuiz(pq,l,true);
    b.addEventListener('click',function(){ box.hidden=!box.hidden; if(!box.hidden) box.scrollIntoView({behavior:'smooth',block:'center'}); });
    pq.insertBefore(b,pq.firstChild);
  }
  function play(l, startAt){
    var gp=gatedBy(l);
    if(gp){
      setFlash('الأول اتفرج على «'+gp.title+'» وحل اختباره عشان الدرس ده يتفتح.');
      var gb=list.querySelector('[data-id="'+gp.id+'"] .quiz');
      if(gb){ gb.hidden=false; gb.scrollIntoView({behavior:'smooth',block:'center'}); }
      return;
    }
    var pl=document.getElementById('player'); if(!pl) return;
    if(curLesson && curLesson!==l) savePos();
    pl.hidden=false;
    if(startAt==null) startAt=resume.pos[l.id]||0;
    if(startAt>0 && l.dur && startAt>l.dur-15) startAt=0;
    curLesson=l; resume.last=l.id; saveR();
    winStart=data.indexOf(l); render(); paintPlayerQuiz(l);
    document.getElementById('p-title').textContent=pad(l.n)+' · '+l.title;
    document.getElementById('p-open').href='https://www.youtube.com/watch?v='+l.id+(startAt?'&t='+startAt+'s':'');
    pl.scrollIntoView({behavior:'smooth',block:'start'});
    if(window.AplusMedia){
      if(AplusMedia.canPlay(l)){
        try{ if(ytp&&ytReady&&ytp.pauseVideo) ytp.pauseVideo(); }catch(e){}
        AplusMedia.play(l,startAt,{
          save:function(t){ if(t<3) return; resume.pos[l.id]=Math.floor(t); resume.last=l.id; resume.ts=Date.now(); saveR(); paintResume(); var o=document.getElementById('p-open'); if(o) o.href='https://www.youtube.com/watch?v='+l.id+'&t='+Math.floor(t)+'s'; },
          end:function(){ resume.pos[l.id]=0; var i=data.indexOf(l); resume.last=(data[i+1]||l).id; saveR(); paintResume(); render(); }
        });
        paintResume(); return;
      }
      AplusMedia.hide(l);
    }
    ensureApi(function(){
      if(ytp && ytReady){ ytp.loadVideoById({videoId:l.id,startSeconds:startAt}); return; }
      if(ytp){ pending={id:l.id,t:startAt}; return; }
      ytp=new YT.Player('yt',{host:'https://www.youtube-nocookie.com',videoId:l.id,
        playerVars:{rel:0,autoplay:1,start:startAt,playsinline:1,enablejsapi:1,origin:location.origin},
        events:{onReady:function(){ ytReady=true; if(pending){ ytp.loadVideoById({videoId:pending.id,startSeconds:pending.t}); pending=null; } },onStateChange:onState}});
    });
    paintResume();
  }
  window.addEventListener('pagehide', savePos);
  document.addEventListener('visibilitychange', function(){ if(document.hidden) savePos(); });

  function paintResume(){
    var box=document.getElementById('resume'); if(!box) return;
    var l=resume.last&&byId(resume.last);
    if(!l){ box.hidden=true; return; }
    var t=resume.pos[l.id]||0;
    box.hidden=false;
    box.innerHTML='<div><b>آخر درس وقفت عنده</b><br><span>'+pad(l.n)+' · '+esc(l.title)+'</span><br><span class="at">'+(t>0?'وقفت عند '+clock(t)+' من '+clock(l.dur):'ابدأ من أول الدرس')+'</span></div><button class="btn primary" type="button">'+(t>0?'كمّل من '+clock(t):'ابدأ الدرس')+'</button>';
    box.querySelector('button').onclick=function(){ play(l); };
  }

  function buildQuiz(li, l, inPlayer){
    var box=document.createElement('div'); box.className='quiz'; box.hidden=true;
    var qs=QUIZ[l.id].q, gate=!!(window.QUIZ_GATE&&QUIZ_GATE[l.id]), nxt=data[data.indexOf(l)+1];
    var step=0, answers=[];
    function note(){ return '<p class="quiz-note">'+qs.length+' أسئلة من ملخص الدرس. اضغط على الإجابة وهتنقل للسؤال اللي بعده. لازم '+PASS+'% ('+Math.ceil(qs.length*PASS/100)+' من '+qs.length+')'+(gate&&nxt?' عشان يتفتح الدرس اللي بعده وتقدر تعلّم الدرس ده «خلصت».':' عشان تقدر تعلّم الدرس ده «خلصت».')+'</p>'; }
    function showResult(){
      var correct=0, detail='';
      qs.forEach(function(item, i){
        if(answers[i]===item.a) correct++;
        else detail+='<div class="why"><b>س'+(i+1)+':</b> الصح «'+esc(iso(item.o[item.a]))+'» — '+esc(iso(item.w))+'</div>';
      });
      var score=Math.round(correct*100/qs.length), pass=score>=PASS;
      var prevBest=(quiz[l.id]&&quiz[l.id].score)||0;
      quiz[l.id]={score:Math.max(score,prevBest), passed:passed(l.id)||pass};
      saveQ();
      if(pass && !progress[l.id]){ progress[l.id]=true; saveP(); paintProgress(); }
      var html='<div class="res"><b class="'+(pass?'ok':'no')+'">'+score+'% ('+correct+' من '+qs.length+') — '+(pass?'نجحت':'لسه')+'</b>'+detail+'</div>'+
        '<div class="quiz-actions"><button class="btn" type="button" data-act="retry">'+(pass?'أعد الاختبار':'جرّب تاني')+'</button>'+(nxt?'<button class="btn primary" type="button" data-act="next"'+((pass||!gate)?'':' disabled')+'>الدرس التالي ←</button>':'')+'</div>';
      lastResult={id:l.id, html:html};
      box.innerHTML=html;
      bindRes();
      if(pass){
        setFlash('نجحت في اختبار «'+l.title+'» بـ'+score+'% — الدرس اتعلّم «خلصت» تلقائي ✓');
        render();
        if(!inPlayer){ var again=list.querySelector('[data-id="'+l.id+'"] .quiz'); if(again){ again.hidden=false; } }
      }
    }
    function bindRes(){
      var rb=box.querySelector('[data-act=retry]'); if(rb) rb.addEventListener('click', function(){ step=0; answers=[]; lastResult={id:null,html:''}; paint(); });
      var nb=box.querySelector('[data-act=next]'); if(nb) nb.addEventListener('click', function(){ if(nb.disabled) return; play(nxt); });
    }
    function paint(){
      var item=qs[step];
      var html=note()+'<div class="q"><div class="qstep">سؤال '+(step+1)+' من '+qs.length+'<span class="qbar"><i style="width:'+Math.round(step*100/qs.length)+'%"></i></span></div><p>'+esc(iso(item.q))+'</p>';
      item.o.forEach(function(op, oi){ html+='<button type="button" class="qopt" data-o="'+oi+'">'+esc(iso(op))+'</button>'; });
      html+='</div>';
      box.innerHTML=html;
      Array.prototype.forEach.call(box.querySelectorAll('.qopt'), function(b){
        b.addEventListener('click', function(){
          answers[step]=parseInt(b.getAttribute('data-o'),10);
          b.classList.add('sel');
          setTimeout(function(){ step++; if(step>=qs.length) showResult(); else paint(); },180);
        });
      });
    }
    if(lastResult.id===l.id){ box.innerHTML=lastResult.html; bindRes(); }
    else paint();
    li.appendChild(box);
    return box;
  }

  function render(){
    var term=(q.value||'').trim().toLowerCase();
    list.innerHTML=''; var shown=0;
    setFlash(flash);
    var vf=(winStart>0&&!term&&filter==='all')?winStart:0, prevDone=false;
    data.forEach(function(l, i){
      if(i<vf) return;
      if(vf>0&&!prevDone){ prevDone=true; var pr=document.createElement('li'); pr.className='prevrow'; pr.innerHTML='<button type="button" class="btn">⬆ الدروس السابقة ('+Math.min(5,vf)+')</button>'; pr.querySelector('button').addEventListener('click',function(){ winStart=Math.max(0,winStart-5); render(); }); list.appendChild(pr); }
      if(filter==='done' && !progress[l.id]) return;
      if(filter==='todo' && progress[l.id]) return;
      if(term && l.title.toLowerCase().indexOf(term)===-1) return;
      shown++;
      var qz=QUIZ[l.id], qp=passed(l.id);
      var needPass = !!qz && !qp;
      var li=document.createElement('li');
      li.className='lesson'+(progress[l.id]?' done':'')+((curLesson&&curLesson===l&&vf>0)?' now':'');
      li.setAttribute('data-id', l.id);
      var hasNote=!!(notes[l.id]&&notes[l.id].trim());
      var thumb='<img class="thumb" loading="lazy" decoding="async" alt="" width="84" height="47" src="https://i.ytimg.com/vi/'+l.id+'/mqdefault.jpg" onerror="this.style.visibility=\'hidden\'">';
      li.innerHTML =
        '<div class="row">'+
          '<input type="checkbox" aria-label="خلصت الدرس" '+(progress[l.id]?'checked':'')+(needPass?' disabled':'')+'>'+
          thumb+
          '<div class="mid">'+
            '<div class="ttl-line"><span class="num">'+pad(l.n)+'</span>'+
            '<a class="ttl" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+l.id+'">'+esc(l.title)+'</a>'+
            '</div>'+
            '<div class="meta">'+
              '<span class="dur">'+fmt(l.dur)+'</span>'+((resume.pos[l.id]>0)?'<button class="resume-btn" type="button">كمّل من '+clock(resume.pos[l.id])+'</button>':'')+
              '<button class="note-btn'+(hasNote?' has':'')+'" type="button">ملاحظة</button>'+
              ((window.AplusMedia&&AplusMedia.hasPdf(l))?'<button class="pdf-btn" type="button">PDF</button>':'')+
              '<span class="ob ob-v" data-k="v"></span>'+((window.AplusMedia&&AplusMedia.hasPdf(l))?'<span class="ob ob-p" data-k="p"></span>':'')+
              (qz?'<button class="quiz-btn'+(qp?' pass':'')+'" type="button">'+(qp?'اختبار ✓':'اختبار')+'</button>':'')+
            '</div>'+
            (gatedBy(l)?'<div class="lock">🔒 اتفرج على الدرس اللي قبله وحل اختباره الأول.</div>':'')+''+
          '</div>'+
        '</div>'+
        '<div class="note-box" hidden><textarea placeholder="اكتب ملاحظاتك على الدرس ده…">'+esc(notes[l.id]||'')+'</textarea></div>';
      var rb=li.querySelector('.resume-btn'); if(rb) rb.addEventListener('click',function(){ play(l); });
      li.querySelector('.ttl').addEventListener('click', function(ev){ ev.preventDefault(); play(l); });
      var pb=li.querySelector('.pdf-btn'); if(pb) pb.addEventListener('click',function(){ AplusMedia.openPdf(l,setFlash); });
      var chk=li.querySelector('input[type=checkbox]');
      chk.addEventListener('change', function(){
        if(chk.checked) progress[l.id]=true; else delete progress[l.id];
        saveP(); li.classList.toggle('done', !!progress[l.id]); paintProgress();
      });
      var nb=li.querySelector('.note-btn'), box=li.querySelector('.note-box'), ta=box.querySelector('textarea');
      nb.addEventListener('click', function(){ box.hidden=!box.hidden; if(!box.hidden) ta.focus(); });
      var t=null;
      ta.addEventListener('input', function(){
        clearTimeout(t);
        t=setTimeout(function(){
          var v=ta.value;
          if(v.trim()) notes[l.id]=v; else delete notes[l.id];
          saveN(); nb.classList.toggle('has', !!(notes[l.id]&&notes[l.id].trim()));
        },400);
      });
      if(qz){
        var qb=li.querySelector('.quiz-btn'), qbox=buildQuiz(li, l);
        qb.addEventListener('click', function(){ qbox.hidden=!qbox.hidden; if(!qbox.hidden) qbox.scrollIntoView({behavior:'smooth',block:'center'}); });
      }
      list.appendChild(li);
    });
    if(!shown){ var e=document.createElement('li'); e.className='empty'; e.textContent='مفيش دروس مطابقة.'; list.appendChild(e); }    paintOff();
  }


  function paintOff(){
    if(!(window.AplusMedia&&AplusMedia.savedStatus)) return;
    AplusMedia.savedStatus().then(function(m){
      Array.prototype.forEach.call(list.querySelectorAll('.lesson'),function(li){
        var l=byId(li.getAttribute('data-id')); if(!l) return;
        var n=String(l.n), v=li.querySelector('.ob-v'), p=li.querySelector('.ob-p');
        if(v){
          if(!m.hv[n]){ v.className='ob ob-v yt'; v.textContent='يوتيوب فقط (مفيش أوفلاين)'; }
          else if(m.v[n]){ v.className='ob ob-v on'; v.textContent='الفيديو: محفوظ أوفلاين ✓'; }
          else { v.className='ob ob-v off'; v.textContent='الفيديو: مش محفوظ'; }
        }
        if(p){
          if(m.p[n]){ p.className='ob ob-p on'; p.textContent='الملخص: محفوظ ✓'; }
          else { p.className='ob ob-p off'; p.textContent='الملخص: مش محفوظ'; }
        }
      });
    });
  }
  var offT=null;
  window.addEventListener('aplus-offline',function(){ clearTimeout(offT); offT=setTimeout(paintOff,250); });
  q.addEventListener('input', render);
  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function(c){
    c.addEventListener('click', function(){
      filter=c.getAttribute('data-f');
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function(x){ x.setAttribute('aria-pressed', x===c?'true':'false'); });
      render();
    });
  });
  var cont=document.getElementById('cont');
  if(cont) cont.addEventListener('click', function(){
    var l=resume.last&&byId(resume.last);
    if(!l){ for(var i=0;i<data.length;i++){ if(!progress[data[i].id]){ l=data[i]; break; } } }
    if(!l){ alert('خلصت كل الدروس المتاحة 👏'); return; }
    play(l);
  });
  var exp=document.getElementById('export');
  if(exp) exp.addEventListener('click', function(){
    var lines=['ملاحظات كورس CompTIA A+ — '+new Date().toLocaleDateString('ar-EG'),''];
    data.forEach(function(l){ if(notes[l.id]&&notes[l.id].trim()){ lines.push(pad(l.n)+'. '+l.title); lines.push(notes[l.id].trim()); lines.push(''); } });
    if(lines.length<=2){ alert('مفيش ملاحظات لسه.'); return; }
    var blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ملاحظات-كورس-A+.txt'; a.click();
  });
  paintProgress(); paintResume(); render();
})();
