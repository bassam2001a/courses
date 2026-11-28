var C='aplus-shell-v77';
var SHELL=['./','aplus.html','index.html','controlexa.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','assets/theme.js?v=77','assets/motiv.js?v=77','network.html','english.html','data/network.js?v=77','data/english.js?v=77','data/quiz-net.js?v=77','data/quiz-eng.js?v=77','assets/styles.css?v=77','assets/account.js?v=77','assets/app.js?v=77','assets/media.js?v=77','data/aplus.js?v=77','data/media.js?v=77','data/quizzes.js?v=77','data/quiz-b1.js?v=77','data/quiz-b2.js?v=77','data/quiz-b3.js?v=77','data/quiz-b4.js?v=77','data/quiz-b5.js?v=77','data/quiz-pdf.js?v=77'];
self.addEventListener('install',function(e){ e.waitUntil(caches.open(C).then(function(c){ return Promise.all(SHELL.map(function(u){ return c.add(u).catch(function(){}); })); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('aplus-shell-')===0&&k!==C; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  var r=e.request; if(r.method!=='GET') return;
  var u=new URL(r.url); if(u.origin!==location.origin) return;
  var nav=r.mode==='navigate';
  e.respondWith(fetch(r).then(function(res){ if(res&&res.ok){ var cp=res.clone(); caches.open(C).then(function(c){ c.put(r,cp); }); } return res; }).catch(function(){ return caches.match(r,{ignoreSearch:false}).then(function(m){ return m||caches.match(r,{ignoreSearch:true}); }).then(function(m2){ return m2||(nav?caches.match('aplus.html'):undefined); }); }));
});
