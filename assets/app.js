(function(){
  var KEY_P='aplus-progress-v1', KEY_N='aplus-notes-v1', KEY_Q='aplus-quiz-v1';
  var data = window.APLUS || [], QUIZ = window.QUIZ || {}, PASS = 60;
  var progress = {}, notes = {}, quiz = {};
  try{ progress = JSON.parse(localStorage.getItem(KEY_P)||'{}')||{}; }catch(e){ progress={}; }
  try{ notes = JSON.parse(localStorage.getItem(KEY_N)||'{}')||{}; }catch(e){ notes={}; }
  try{ quiz = JSON.parse(localStorage.getItem(KEY_Q)||'{}')||{}; }catch(e){ quiz={}; }
  var saveP=function(){ try{localStorage.setItem(KEY_P,JSON.stringify(progress));}catch(e){} };
  var saveN=function(){ try{localStorage.setItem(KEY_N,JSON.stringify(notes));}catch(e){} };
  var saveQ=function(){ try{localStorage.setItem(KEY_Q,JSON.stringify(quiz));}catch(e){} };
  var fmt=function(s){ var m=Math.round(s/60); if(m<60) return m+' د'; var h=Math.floor(m/60), r=m%60; return h+' س'+(r?' '+r+' د':''); };
  var pad=function(n){ return n<10?('0'+n):(''+n); };
  var esc=function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  var list=document.getElementById('list'), q=document.getElementById('q');
  var fill=document.getElementById('fill'), cnt=document.getElementById('cnt'), pct=document.getElementById('pct');
  var flashEl=document.getElementById('flash');
  var filter='all', flash='';

  function passed(id){ return !!(quiz[id] && quiz[id].passed); }
  function lockedAt(i){ if(i<=0) return false; var prev=data[i-1]; return !!(QUIZ[prev.id] && !passed(prev.id)); }
  function counts(){ var d=0; data.forEach(function(l){ if(progress[l.id]) d++; }); return {d:d,t:data.length}; }
  function paintProgress(){
    var c=counts(), p=c.t? Math.round(c.d*100/c.t):0;
    fill.style.width=p+'%'; cnt.textContent=c.d+' من '+c.t+' درس'; pct.textContent=p+'%';
  }
  function setFlash(msg){ flash=msg; if(flashEl){ flashEl.textContent=msg; flashEl.hidden=!msg; } }

  function play(l){
    var pl=document.getElementById('player'); if(!pl) return;
    pl.hidden=false;
    document.getElementById('yt').src='https://www.youtube-nocookie.com/embed/'+l.id+'?rel=0&autoplay=1';
    document.getElementById('p-title').textContent=pad(l.n)+' · '+l.title;
    document.getElementById('p-open').href='https://www.youtube.com/watch?v='+l.id;
    pl.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function buildQuiz(li, l){
    var box=document.createElement('div'); box.className='quiz'; box.hidden=true;
    var qs=QUIZ[l.id].q;
    var html='<p class="quiz-note">'+qs.length+' أسئلة على موضوع الدرس من مواضيع امتحان A+ — مش مفرّغة من كلام الفيديو. لازم '+PASS+'% عشان الدرس اللي بعده يتفتح.</p>';
    qs.forEach(function(item, qi){
      html+='<div class="q"><p>'+esc((qi+1)+'. '+item.q)+'</p>';
      item.o.forEach(function(op, oi){
        html+='<label><input type="radio" name="q'+l.id+'-'+qi+'" value="'+oi+'"><span>'+esc(op)+'</span></label>';
      });
      html+='</div>';
    });
    html+='<div class="quiz-actions"><button class="btn primary" type="button" data-act="submit">صحّح</button><span class="res" data-res></span></div>';
    box.innerHTML=html;
    box.querySelector('[data-act=submit]').addEventListener('click', function(){
      var answers=[], missing=false;
      for(var i=0;i<qs.length;i++){
        var sel=box.querySelector('input[name="q'+l.id+'-'+i+'"]:checked');
        if(!sel){ missing=true; answers.push(-1); } else answers.push(parseInt(sel.value,10));
      }
      var res=box.querySelector('[data-res]');
      if(missing){ res.innerHTML='<b class="no">جاوب على كل الأسئلة الأول.</b>'; return; }
      var correct=0, detail='';
      qs.forEach(function(item, i){
        if(answers[i]===item.a) correct++;
        else detail+='<div class="why"><b>س'+(i+1)+':</b> الصح «'+esc(item.o[item.a])+'» — '+esc(item.w)+'</div>';
      });
      var score=Math.round(correct*100/qs.length), pass=score>=PASS;
      var prevBest=(quiz[l.id]&&quiz[l.id].score)||0;
      quiz[l.id]={score:Math.max(score,prevBest), passed:passed(l.id)||pass};
      saveQ();
      res.innerHTML='<b class="'+(pass?'ok':'no')+'">'+score+'% ('+correct+' من '+qs.length+') — '+(pass?'نجحت':'لسه')+'</b>'+(pass?'':' — جرّب تاني')+detail;
      if(pass){
        setFlash('نجحت في اختبار «'+l.title+'» — الدرس اللي بعده اتفتح.');
        render();
        var again=list.querySelector('[data-id="'+l.id+'"] .quiz'); if(again){ again.hidden=false; }
      }
    });
    li.appendChild(box);
    return box;
  }

  function render(){
    var term=(q.value||'').trim().toLowerCase();
    list.innerHTML=''; var shown=0;
    setFlash(flash);
    data.forEach(function(l, i){
      if(filter==='done' && !progress[l.id]) return;
      if(filter==='todo' && progress[l.id]) return;
      if(term && l.title.toLowerCase().indexOf(term)===-1) return;
      shown++;
      var locked=lockedAt(i);
      var li=document.createElement('li');
      li.className='lesson'+(progress[l.id]?' done':'')+(locked?' locked':'');
      li.setAttribute('data-id', l.id);
      var hasNote=!!(notes[l.id]&&notes[l.id].trim());
      var qz=QUIZ[l.id], qp=passed(l.id);
      li.innerHTML =
        '<div class="row">'+
          '<input type="checkbox" aria-label="خلصت الدرس" '+(progress[l.id]?'checked':'')+(locked?' disabled':'')+'>'+
          '<span class="num">'+pad(l.n)+'</span>'+
          (locked
            ? '<span class="ttl">'+esc(l.title)+'</span>'
            : '<a class="ttl" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+l.id+'">'+esc(l.title)+'</a>')+
          '<span class="dur">'+fmt(l.dur)+'</span>'+
          (locked?'':'<button class="note-btn'+(hasNote?' has':'')+'" type="button">ملاحظة</button>')+
          (locked?'':(qz?'<button class="quiz-btn'+(qp?' pass':'')+'" type="button">'+(qp?'اختبار ✓':'اختبار')+'</button>':''))+
        '</div>'+
        (locked?'<div class="lock">🔒 خلّص اختبار الدرس اللي قبله الأول عشان يتفتح.</div>':'')+
        (locked?'':'<div class="note-box" hidden><textarea placeholder="اكتب ملاحظاتك على الدرس ده…">'+esc(notes[l.id]||'')+'</textarea></div>');
      if(!locked){
        li.querySelector('.ttl').addEventListener('click', function(ev){ ev.preventDefault(); play(l); });
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
      }
      list.appendChild(li);
    });
    if(!shown){ var e=document.createElement('li'); e.className='empty'; e.textContent='مفيش دروس مطابقة.'; list.appendChild(e); }
  }

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
    var next=null;
    for(var i=0;i<data.length;i++){ if(!progress[data[i].id] && !lockedAt(i)){ next=data[i]; break; } }
    if(!next){ alert('خلصت كل الدروس المتاحة 👏'); return; }
    var el=list.querySelector('[data-id="'+next.id+'"]');
    if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.outline='2px solid #0b6b5e'; setTimeout(function(){ el.style.outline=''; },1600); }
  });
  var exp=document.getElementById('export');
  if(exp) exp.addEventListener('click', function(){
    var lines=['ملاحظات كورس CompTIA A+ — '+new Date().toLocaleDateString('ar-EG'),''];
    data.forEach(function(l){ if(notes[l.id]&&notes[l.id].trim()){ lines.push(pad(l.n)+'. '+l.title); lines.push(notes[l.id].trim()); lines.push(''); } });
    if(lines.length<=2){ alert('مفيش ملاحظات لسه.'); return; }
    var blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ملاحظات-كورس-A+.txt'; a.click();
  });
  paintProgress(); render();
})();
