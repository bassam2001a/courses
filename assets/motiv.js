(function(){
  var DAILY=[
    'ماتستعجلش يا هندسة. درس النهارده يكفي، والباقي جاي.',
    'نص ساعة مركزة أحسن من ساعتين مشتتة.',
    'كل درس بتخلصه هو حاجة مابقتش محتاج تقلق منها.',
    'مش لازم تبقى متحمس. كفاية تفتح الدرس.',
    'اللي بيذاكر شوية كل يوم بيسبق اللي بيذاكر كتير مرة، يا باشمهندس بسام.',
    'لو مفهمتش حاجة، ارجع لها. ده مش ضعف، ده فهم.',
    'الامتحان آخر الطريق، والطريق بيتمشي خطوة خطوة.',
    'النهارده درس واحد يا هندسة. بكره درس تاني. كده بيخلص.',
    'التعب النهارده هيفرق في أول يوم شغل.',
    'ابدأ بأسهل جزء لو نفسك مش جاية.',
    'مش محتاج تبقى أحسن من حد. كفاية تبقى أحسن من إمبارح.',
    'الفهم أهم من الحفظ، خد وقتك يا باشمهندس.',
    'استراحة خمس دقايق مش تضييع وقت.',
    'اللي فات فات. افتح الدرس اللي قدامك.',
    'غلطة في الكويز دلوقتي أحسن من غلطة في الامتحان.',
    'إنت بدأت فعلاً يا باشمهندس بسام، وده أصعب جزء.',
    'ركز في اللي في إيدك، مش في كام درس فاضل.',
    'يوم مذاكرة وسط، أحسن من يوم مافيهوش مذاكرة.',
    'الشهادة بتتبني من الأيام العادية.',
    'اشرب مية يا هندسة وافتح الدرس.',
    'مش لازم يبقى يوم مثالي. كفاية يبقى فيه درس.',
    'كل اللي بيشتغل في المجال ده بدأ من نفس المكان.',
    'راجع درس قديم النهارده، هتلاقيه أسهل مما فاكر.',
    'ثبّت اللي خدته قبل ما تجري للجديد.',
    'كمّل يا باشمهندس. إنت أقرب مما بتحس.'
  ];
  var QUIZ=[
    'عدّيت الاختبار بـ {%}. الدرس ده بقى بتاعك ✓',
    '{%} يا هندسة. شغل نضيف ✓',
    'نجحت بـ {%}. كمّل على نفس المنوال.',
    '{%} وده بجد. الدرس اتثبت ✓',
    'عدّيت بـ {%} يا باشمهندس بسام. خد نفس وكمّل.',
    '{%}. إنت فاهم الدرس ده ✓',
    'تمام، {%}. الدرس اتحسب ✓',
    'نجحت بـ {%}. الدرس اللي بعده في انتظارك.',
    '{%}. مذاكرتك باينة يا هندسة ✓',
    'عدّيت بـ {%}. كده الدرس خلص ✓'
  ];
  var MILE={
    0:['لسه بدري يا هندسة. درس واحد النهارده وتبقى بدأت.','أول خطوة هي افتح أي درس.','مفيش بداية متأخرة. ابدأ بدرس.','كل اللي خلّص الكورس بدأ بدرس واحد.'],
    10:['أول عشرة في المية خلصت. الأول دايماً أصعب حاجة.','بدأت صح يا باشمهندس. كمّل بنفس الهدوء.','عدّى أول جزء. الباقي أسهل مما تتخيل.','إيقاعك حلو. متوقفش.'],
    25:['ربع الكورس خلص. كمّل يا هندسة، إنت ماشي صح.','ربع الكورس وراك. الباقي زيه.','إنت عدّيت الربع الأول. كمّل بالترتيب.','شغلك ثابت يا باشمهندس بسام. كمّل.'],
    50:['نص الكورس خلص. اللي فاضل زي اللي عدّى.','وصلت للنص يا هندسة. مفيش رجوع.','نص الطريق خلص. كمّل.','اللي خلص أكتر من اللي فاضل.'],
    75:['فاضل ربع واحد. إنت قربت يا باشمهندس.','تلات أرباع الكورس وراك. شدّ حيلك شوية.','قربت جداً يا هندسة. كمّل.','الباقي قليل. ماتبطّأش دلوقتي.'],
    100:['خلّصت الكورس كله يا باشمهندس بسام. تعبك ماراحش على الأرض.','الكورس خلص بالكامل. مبروك يا هندسة.','خلّصت كل الدروس. راجع اللي محتاج مراجعة.']
  };
  var memo={};
  function rnd(list,key){ var k='aplus-motiv-'+key, last=-1; try{ last=+localStorage.getItem(k); if(isNaN(last)) last=-1; }catch(e){}
    var i=Math.floor(Math.random()*list.length); if(list.length>1&&i===last) i=(i+1+Math.floor(Math.random()*(list.length-1)))%list.length;
    try{ localStorage.setItem(k,i); }catch(e){} return list[i]; }
  var KS='aplus-streak-v1';
  function day(d){ d=d||new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function ld(){ try{ return JSON.parse(localStorage.getItem(KS)||'{}')||{}; }catch(e){ return {}; } }
  function mark(){
    var s=ld(), t=day(), y=new Date(); y.setDate(y.getDate()-1);
    if(s.last===t) return;
    s.n=(s.last===day(y))?(s.n||0)+1:1; s.last=t; s.broke=0;
    try{ localStorage.setItem(KS,JSON.stringify(s)); }catch(e){}
    window.addEventListener('DOMContentLoaded',function(){ if(window.AplusSync) AplusSync.dirty(); });
  }
  function streakText(){
    var s=ld(), y=new Date(), n=s.n||0; if(!s.last) return '';
    y.setDate(y.getDate()-1);
    if(s.last!==day() && s.last!==day(y)) return '';
    if(n>=30) return 'شهر كامل ورا بعض';
    if(n>=14) return 'أسبوعين ورا بعض. ده التزام حقيقي';
    if(n>=7) return 'أسبوع كامل ورا بعض';
    if(n>=3) return n+' أيام ورا بعض';
    if(n===2) return 'يومين ورا بعض';
    return 'أول يوم. بكره كمّل';
  }
  function milestone(p){ var k=0; [10,25,50,75,100].forEach(function(m){ if(p>=m) k=m; }); if(!(k in memo)) memo[k]=rnd(MILE[k],'m'+k); return memo[k]; }
  window.Motiv={
    daily:function(){ return rnd(DAILY,'d'); },
    quiz:function(sc){ return (sc>=100&&Math.random()<.5)?'100%. مفيش غلطة ✓':QUIZ[Math.floor(Math.random()*QUIZ.length)].replace('{%}',sc+'%'); },
    mark:mark, streak:streakText, milestone:milestone
  };
  if(!/(^|\/)(index\.html)?$/.test(location.pathname)) mark();
  /* break reminder: 45 minutes of continuous playing */
  var BK='aplus-break-v1', LIMIT=window.__BRK_LIMIT||2700, SNOOZE=600, GAP=300;
  var bs={acc:0,last:0,pend:false}, bnode=null;
  function bload(){ try{ var t0=JSON.parse(localStorage.getItem(BK)||'null'); if(t0&&t0.d===dkey()){ bs=t0; } else if(t0){ bs={acc:0,last:0,pend:false,d:dkey()}; } }catch(e){} }
  var SK='aplus-study-day';
  function dkey(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function sget(){ try{ var o=JSON.parse(localStorage.getItem(SK)||'null'); if(o&&o.d===dkey()) return o.s|0; }catch(e){} return 0; }
  function sadd(n){ try{ localStorage.setItem(SK,JSON.stringify({d:dkey(),s:sget()+n})); }catch(e){} }
  function fmt(sec){ var m=Math.floor(sec/60), h=Math.floor(m/60); m=m%60;
    if(h===0) return m<=1?'دقيقة':(m===2?'دقيقتين':(m<=10?m+' دقايق':m+' دقيقة'));
    var hs=h===1?'ساعة':(h===2?'ساعتين':h+(h<=10?' ساعات':' ساعة'));
    return m?hs+' و'+(m===1?'دقيقة':(m===2?'دقيقتين':(m<=10?m+' دقايق':m+' دقيقة'))):hs; }
  function bsave(){ bs.d=dkey(); try{ localStorage.setItem(BK,JSON.stringify(bs)); }catch(e){} }
  bload();
  function fs(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); }
  function bshow(){
    if(bnode||!document.body) return;
    var nm=Math.random()<.4?' يا هندسة':'';
    bnode=document.createElement('div'); bnode.className='brk'; bnode.setAttribute('role','status');
    bnode.innerHTML='<span class="brk-t"></span><span class="brk-b"><button type="button" class="btn primary" data-a="ok">تمام</button><button type="button" class="btn" data-a="sn">كمّل 10 دقايق</button></span>';
    bnode.querySelector('.brk-t').textContent='بقالك 45 دقيقة بتذاكر'+nm+'. خد استراحة 5 دقايق. ذاكرت النهارده '+fmt(sget())+'.';
    bnode.addEventListener('click',function(e){ var a=e.target.getAttribute&&e.target.getAttribute('data-a'); if(!a) return;
      if(a==='ok') bs.acc=0; else bs.acc=Math.max(0,LIMIT-SNOOZE);
      bs.pend=false; bsave(); bnode.remove(); bnode=null; document.title=document.title.replace(/^⏰ /,''); });
    document.body.appendChild(bnode);
  }
  function btick(){
    bload(); var pl=window.AplusIsPlaying&&window.AplusIsPlaying(), now=Date.now();
    if(pl){ bs.acc+=5; bs.last=now; sadd(5); }
    var onBreak=!!(tend&&!tdone);
    if(onBreak){ if(bnode){ bnode.remove(); bnode=null; } }
    else if(bs.acc>=LIMIT&&!bnode){ if(fs()){ if(!bs.pend){ bs.pend=true; document.title='⏰ '+document.title.replace(/^⏰ /,''); } } else bshow(); }
    else if(bs.pend&&!fs()&&!bnode) bshow();
    bsave();
  }
  document.addEventListener('fullscreenchange',function(){ if(!fs()&&bs.pend&&!bnode) bshow(); });
  if(window.AplusIsPlaying!==undefined||/(aplus|network|english)\.html/.test(location.pathname)) setInterval(btick,5000);

  /* bottom bar: today's study total + break timer */
  var TK='aplus-break-timer', stb=null, tpan=null, tend=0, tdone=false, tint=null;
  try{ tend=+localStorage.getItem(TK)||0; }catch(e){}
  function mmss(ms){ var t=Math.max(0,Math.ceil(ms/1000)), m=Math.floor(t/60), x=t%60; return (m<10?'0':'')+m+':'+(x<10?'0':'')+x; }
  function stbPaint(){
    if(!stb) return;
    var t=sget(); stb.querySelector('.stb-t').textContent=t>=60?'ذاكرت النهارده '+fmt(t):'لسه ما ذاكرتش النهارده';
    var bt=stb.querySelector('.stb-b'); bt.textContent=tend&&!tdone?'☕ '+mmss(tend-Date.now()):'☕ بريك';
  }
  function tstop(){ tend=0; tdone=false; try{ localStorage.removeItem(TK); }catch(e){} document.title=document.title.replace(/^⏰ /,''); stbPaint(); }
  function tpaint(){
    if(!tpan) return;
    var run=tend&&!tdone;
    tpan.querySelector('.tp-n').textContent=tdone?'خلص البريك. يلا نكمل 💪':(run?mmss(tend-Date.now()):'خد بريك كام دقيقة؟');
    tpan.querySelector('.tp-c').hidden=!!(run||tdone);
    tpan.querySelector('[data-a=stop]').hidden=!run;
    tpan.querySelector('[data-a=ok]').hidden=!tdone;
    tpan.querySelector('[data-a=close]').hidden=tdone;
  }
  function tstart(min){ if(bnode){ bnode.remove(); bnode=null; } tend=Date.now()+min*60000; tdone=false; try{ localStorage.setItem(TK,String(tend)); }catch(e){} tpaint(); stbPaint(); }
  function tick1(){
    if(tend&&!tdone&&Date.now()>=tend){ tdone=true; bload(); bs.acc=0; bs.pend=false; bsave();
      try{ if(navigator.vibrate) navigator.vibrate([300,150,300]); }catch(e){}
      try{ var A=window.AudioContext||window.webkitAudioContext, c=new A(), o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); g.gain.value=.15; o.frequency.value=880; o.start(); setTimeout(function(){ o.stop(); c.close(); },500); }catch(e){}
      document.title='⏰ '+document.title.replace(/^⏰ /,''); if(tpan) tpan.hidden=false; }
    stbPaint(); tpaint();
  }
  function stbInit(){
    if(stb||!document.body||!/(aplus|network|english)\.html/.test(location.pathname)) return;
    stb=document.createElement('div'); stb.className='stb';
    stb.innerHTML='<span class="stb-t"></span><button type="button" class="btn stb-b">☕ بريك</button>';
    tpan=document.createElement('div'); tpan.className='stb-p'; tpan.hidden=true; tpan.setAttribute('role','dialog');
    tpan.innerHTML='<div class="tp-n"></div><div class="tp-c"><button type="button" class="btn" data-m="5">5 دقايق</button><button type="button" class="btn" data-m="10">10 دقايق</button><button type="button" class="btn" data-m="15">15 دقيقة</button></div><div class="tp-a"><button type="button" class="btn" data-a="stop">إلغاء البريك</button><button type="button" class="btn primary" data-a="ok">تمام</button><button type="button" class="btn" data-a="close">إغلاق</button></div>';
    document.body.appendChild(tpan); document.body.appendChild(stb); document.body.classList.add('has-stb');
    stb.querySelector('.stb-b').addEventListener('click',function(){ tpan.hidden=!tpan.hidden; tpaint(); });
    tpan.addEventListener('click',function(e){ var m=e.target.getAttribute&&e.target.getAttribute('data-m'), a=e.target.getAttribute&&e.target.getAttribute('data-a');
      if(m) tstart(+m); else if(a==='stop'){ tstop(); tpaint(); } else if(a==='ok'){ tstop(); tpan.hidden=true; } else if(a==='close') tpan.hidden=true; });
    if(tend&&Date.now()>=tend) { tdone=true; bload(); bs.acc=0; bs.pend=false; bsave(); tpan.hidden=false; }
    tpaint(); stbPaint(); tint=setInterval(tick1,1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',stbInit); else stbInit();
  window.Motiv.studyToday=sget; window.Motiv.fmt=fmt;
  window.Motiv.breakNow=function(){ bs.acc=LIMIT; bs.last=Date.now(); btick(); };
  window.addEventListener('DOMContentLoaded',function(){
    var el=document.getElementById('daily'); if(!el) return;
    el.innerHTML='<span class="dl">عبارة النهارده</span><span class="dt"></span>'; el.querySelector('.dt').textContent=Motiv.daily(); el.hidden=false;
  });
})();
