var C='aplus-shell-v14';
var SHELL=['./','aplus.html','index.html','assets/styles.css?v=14','assets/account.js?v=14','assets/app.js?v=14','assets/media.js?v=14','data/aplus.js?v=14','data/media.js?v=14','data/quizzes.js?v=14','data/quiz-b1.js?v=14','data/quiz-b2.js?v=14','data/quiz-b3.js?v=14','data/quiz-b4.js?v=14','data/quiz-b5.js?v=14','data/quiz-pdf.js?v=14'];
self.addEventListener('install',function(e){ e.waitUntil(caches.open(C).then(function(c){ return Promise.all(SHELL.map(function(u){ return c.add(u).catch(function(){}); })); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('aplus-shell-')===0&&k!==C; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  var r=e.request; if(r.method!=='GET') return;
  var u=new URL(r.url); if(u.origin!==location.origin) return;
  e.respondWith(fetch(r).then(function(res){ if(res&&res.ok){ var cp=res.clone(); caches.open(C).then(function(c){ c.put(r,cp); }); } return res; }).catch(function(){ return caches.match(r,{ignoreSearch:false}).then(function(m){ return m||caches.match(r,{ignoreSearch:true}); }); }));
});
