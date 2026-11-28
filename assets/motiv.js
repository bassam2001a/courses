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
  window.addEventListener('DOMContentLoaded',function(){
    var el=document.getElementById('daily'); if(!el) return;
    el.innerHTML='<span class="dl">عبارة النهارده</span><span class="dt"></span>'; el.querySelector('.dt').textContent=Motiv.daily(); el.hidden=false;
  });
})();
