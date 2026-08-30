// ---- mobile nav toggle ----
(function(){
  const btn = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if(btn && links){
    btn.addEventListener('click', function(){
      links.classList.toggle('open');
    });
  }
})();

// ---- snowfall ----
(function(){
  const field = document.getElementById('snowfield');
  if(!field) return;
  const count = 22;
  for(let i=0;i<count;i++){
    const f = document.createElement('div');
    f.className = 'snowflake';
    const size = 3 + Math.random()*5;
    const left = Math.random()*100;
    const dur = 9 + Math.random()*10;
    const delay = Math.random()*10;
    const drift = (Math.random()*60-30) + 'px';
    f.style.width = size+'px';
    f.style.height = size+'px';
    f.style.left = left+'%';
    f.style.opacity = 0.4 + Math.random()*0.5;
    f.style.animationDuration = dur+'s';
    f.style.animationDelay = '-'+delay+'s';
    f.style.setProperty('--drift', drift);
    field.appendChild(f);
  }
})();

// ---- countdown (home page only) ----
(function(){
  const d = document.getElementById('cd-d');
  if(!d) return;
  const target = new Date('2026-11-19T10:00:00+08:00').getTime();
  const h = document.getElementById('cd-h');
  const m = document.getElementById('cd-m');
  const s = document.getElementById('cd-s');
  function tick(){
    const now = Date.now();
    let diff = target - now;
    if(diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000)/3600000);
    const mins = Math.floor((diff % 3600000)/60000);
    const secs = Math.floor((diff % 60000)/1000);
    d.textContent = days;
    h.textContent = String(hours).padStart(2,'0');
    m.textContent = String(mins).padStart(2,'0');
    s.textContent = String(secs).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
})();

// ---- stamp rally toggle (decorative demo) ----
document.querySelectorAll('.stamp').forEach(function(el){
  el.addEventListener('click', function(){
    el.classList.toggle('on');
  });
});

// ---- share ----
function shareSite(){
  if(navigator.share){
    navigator.share({ title: document.title, url: location.href });
  } else {
    navigator.clipboard.writeText(location.href);
    alert('連結已複製，快分享給朋友吧！');
  }
}
