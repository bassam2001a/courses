(function(){
  var KEY_P='aplus-progress-v1', KEY_N='aplus-notes-v1';
  var data = window.APLUS || [];
  var progress = {}, notes = {};
  try{ progress = JSON.parse(localStorage.getItem(KEY_P)||'{}')||{}; }catch(e){ progress={}; }
  try{ notes = JSON.parse(localStorage.getItem(KEY_N)||'{}')||{}; }catch(e){ notes={}; }
  var saveP = function(){ try{ localStorage.setItem(KEY_P, JSON.stringify(progress)); }catch(e){} };
  var saveN = function(){ try{ localStorage.setItem(KEY_N, JSON.stringify(notes)); }catch(e){} };
  var fmt = function(s){ var m=Math.round(s/60); if(m<60) return m+' د'; var h=Math.floor(m/60), r=m%60; return h+' س'+(r?' '+r+' د':''); };
  var pad = function(n){ return n<10?('0'+n):(''+n); };

  var list=document.getElementById('list'), q=document.getElementById('q');
  var fill=document.getElementById('fill'), cnt=document.getElementById('cnt'), pct=document.getElementById('pct');
  var filter='all';

  function counts(){ var d=0; data.forEach(function(l){ if(progress[l.id]) d++; }); return {d:d,t:data.length}; }
  function paintProgress(){
    var c=counts(), p=c.t? Math.round(c.d*100/c.t):0;
    fill.style.width=p+'%'; cnt.textContent=c.d+' من '+c.t+' درس'; pct.textContent=p+'%';
  }
  function render(){
    var term=(q.value||'').trim().toLowerCase();
    list.innerHTML='';
    var shown=0;
    data.forEach(function(l){
      if(filter==='done' && !progress[l.id]) return;
      if(filter==='todo' && progress[l.id]) return;
      if(term && l.title.toLowerCase().indexOf(term)===-1) return;
      shown++;
      var li=document.createElement('li');
      li.className='lesson'+(progress[l.id]?' done':'');
      li.setAttribute('data-id', l.id);
      var hasNote=!!(notes[l.id]&&notes[l.id].trim());
      li.innerHTML =
        '<div class="row">'+
          '<input type="checkbox" aria-label="خلصت الدرس" '+(progress[l.id]?'checked':'')+'>'+
          '<span class="num">'+pad(l.n)+'</span>'+
          '<a class="ttl" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+l.id+'">'+esc(l.title)+'</a>'+
          '<span class="dur">'+fmt(l.dur)+'</span>'+
          '<button class="note-btn'+(hasNote?' has':'')+'" type="button">ملاحظة</button>'+
        '</div>'+
        '<div class="note-box" hidden><textarea placeholder="اكتب ملاحظاتك على الدرس ده…">'+esc(notes[l.id]||'')+'</textarea></div>';
      var ttlA=li.querySelector('.ttl');
      ttlA.addEventListener('click', function(ev){ ev.preventDefault(); play(l); });
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
      list.appendChild(li);
    });
    if(!shown){ var e=document.createElement('li'); e.className='empty'; e.textContent='مفيش دروس مطابقة.'; list.appendChild(e); }
  }
  function play(l){
    var pl=document.getElementById('player'); if(!pl) return;
    pl.hidden=false;
    var f=document.getElementById('yt');
    f.src='https://www.youtube-nocookie.com/embed/'+l.id+'?rel=0&autoplay=1';
    document.getElementById('p-title').textContent=pad(l.n)+' · '+l.title;
    document.getElementById('p-open').href='https://www.youtube.com/watch?v='+l.id;
    pl.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

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
    for(var i=0;i<data.length;i++){ if(!progress[data[i].id]){ next=data[i]; break; } }
    if(!next){ alert('خلصت كل الدروس 👏'); return; }
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
