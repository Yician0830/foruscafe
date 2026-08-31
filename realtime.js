/* ====== 即時狀態同步（訪客頁面：entry.html / gifts.html） ======
   透過 Firestore 的 onSnapshot 即時監聽 status 這個 collection，
   後台一儲存，這裡幾乎是「立即」反應，不需要重新整理頁面。
*/

function classifySlot(status, normal){
  const s = (status || '').trim();
  if(!s || s === normal) return { state: 'open', label: '開放預約中' };
  if(s.includes('未開放') || s.includes('尚未')) return { state: 'closed', label: s };
  return { state: 'full', label: s }; // 涵蓋「已額滿」以及任何其他自訂文字
}

function applyGiftBadges(map){
  document.querySelectorAll('.gift-card[data-key]').forEach(function(el){
    const key = el.getAttribute('data-key');
    const status = map ? map[key] : undefined;
    const normal = el.getAttribute('data-normal') || '';
    let badge = el.querySelector('.status-badge');
    if(!badge){
      badge = document.createElement('span');
      badge.className = 'status-badge';
      el.appendChild(badge);
    }
    if(status && status !== normal){
      el.classList.add('is-alert');
      badge.textContent = status;
    } else {
      el.classList.remove('is-alert');
      badge.textContent = '';
    }
  });
}

function applySlotStatus(map){
  document.querySelectorAll('.slot[data-key]').forEach(function(el){
    const key = el.getAttribute('data-key');
    const normal = el.getAttribute('data-normal') || '開放中';
    const status = map ? map[key] : undefined;
    const result = classifySlot(status, normal);

    el.classList.remove('is-open', 'is-closed', 'is-full');
    el.classList.add('is-' + result.state);

    const labelEl = el.querySelector('.slot-label');
    if(labelEl){
      labelEl.textContent = result.state === 'closed' ? result.label
        : result.state === 'open' ? '開放預約中' : '';
    }

    let stamp = el.querySelector('.stamp');
    if(result.state === 'full'){
      if(!stamp){
        stamp = document.createElement('span');
        stamp.className = 'stamp';
        el.appendChild(stamp);
      }
      stamp.textContent = result.label || '已額滿';
    } else if(stamp){
      stamp.remove();
    }
  });
}

function applyStockBadges(map){
  document.querySelectorAll('.gift-card[data-stock="true"]').forEach(function(el){
    const key = el.getAttribute('data-key');
    const raw = map ? map[key] : undefined;
    const soldoutText = el.getAttribute('data-soldout-text') || '已售完';
    const hideCount = el.getAttribute('data-hide-count') === 'true';
    let badge = el.querySelector('.status-badge');
    if(!badge){
      badge = document.createElement('span');
      badge.className = 'status-badge';
      el.appendChild(badge);
    }
    let stamp = el.querySelector('.stamp');
    const n = (raw === undefined || raw === '') ? null : parseInt(raw, 10);

    if(n === null || isNaN(n)){
      el.classList.remove('is-full');
      if(stamp) stamp.remove();
      badge.textContent = '';
    } else if(n <= 0){
      el.classList.add('is-full');
      if(!stamp){
        stamp = document.createElement('span');
        stamp.className = 'stamp';
        el.appendChild(stamp);
      }
      stamp.textContent = soldoutText;
      badge.textContent = '';
    } else {
      el.classList.remove('is-full');
      if(stamp) stamp.remove();
      badge.textContent = hideCount ? '' : ('剩餘 ' + n + ' 份');
    }
  });
}

function subscribeStatus(){
  const db = firebase.firestore();
  const stampEl = document.getElementById('statusUpdated');
  if(stampEl) stampEl.textContent = '連線中…';

  db.collection('status').onSnapshot(function(snapshot){
    const map = {};
    snapshot.forEach(function(doc){
      const data = doc.data() || {};
      map[doc.id] = (data.value || '').trim();
    });
    applyGiftBadges(map);
    applySlotStatus(map);
    applyStockBadges(map);
    if(stampEl){
      const now = new Date();
      stampEl.textContent = '即時連線中・最後同步 ' + now.toLocaleTimeString('zh-TW', { hour12:false });
    }
  }, function(err){
    console.error('Firestore 讀取失敗', err);
    if(stampEl) stampEl.textContent = '無法連線，顯示預設狀態';
  });
}

if(document.querySelector('[data-key]')){
  subscribeStatus();
}
