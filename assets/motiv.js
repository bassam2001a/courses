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
  var MILE={10:'أول عشرة في المية خلصت. الأول دايماً أصعب حاجة.',25:'ربع الكورس خلص. كمّل يا هندسة، إنت ماشي صح.',50:'نص الكورس خلص. اللي فاضل زي اللي عدّى.',75:'فاضل ربع واحد. إنت قربت يا باشمهندس.',100:'خلّصت الكورس كله يا باشمهندس بسام. تعبك ماراحش على الأرض.'};
  var KS='aplus-streak-v1';
  function day(d){ d=d||new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function ld(){ try{ return JSON.parse(localStorage.getItem(KS)||'{}')||{}; }catch(e){ return {}; } }
  function mark(){
    var s=ld(), t=day(), y=new Date(); y.setDate(y.getDate()-1);
    if(s.last===t) return;
    s.n=(s.last===day(y))?(s.n||0)+1:1; s.last=t; s.broke=0;
    try{ localStorage.setItem(KS,JSON.stringify(s)); }catch(e){}
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
  function milestone(p){ var k=0; [10,25,50,75,100].forEach(function(m){ if(p>=m) k=m; }); return k?MILE[k]:''; }
  window.Motiv={
    daily:function(){ var d=new Date(); return DAILY[Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)%DAILY.length]; },
    quiz:function(sc){ return (sc>=100&&Math.random()<.5)?'100%. مفيش غلطة ✓':QUIZ[Math.floor(Math.random()*QUIZ.length)].replace('{%}',sc+'%'); },
    mark:mark, streak:streakText, milestone:milestone
  };
  if(!/(^|\/)(index\.html)?$/.test(location.pathname)) mark();
  window.addEventListener('DOMContentLoaded',function(){
    var el=document.getElementById('daily'); if(!el) return;
    el.innerHTML='<span class="dl">عبارة النهارده</span><span class="dt"></span>'; el.querySelector('.dt').textContent=Motiv.daily(); el.hidden=false;
  });
})();
