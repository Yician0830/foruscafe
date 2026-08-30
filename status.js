/* ====== 即時狀態設定（讀取 Google 試算表） ======
   使用方式：
   1. 開一個新的 Google 試算表
   2. 把分頁（sheet tab）改名為「Status」
   3. 欄位依序填：A欄=key　B欄=label（給自己看，可留空）　C欄=status
      key 請照下面「data-key」的值填寫，例如 poster、ribbon、slot-1000...

      贈品類（gifts.html）：
        平常填「供應中」；要更新時改成任何文字，例如「已發完」，
        網站會顯示你打的文字並變灰。

      預約時段（entry.html）：
        平常填「開放中」→ 顯示一般樣式＋「開放預約中」
        還沒到預約時間就填「未開放」→ 顯示灰階、不可點擊
        額滿就填「已額滿」→ 顯示紅色蓋章效果
        （也可以打其他自訂文字，例如「僅剩2位」，一樣會用蓋章樣式顯示）

   4. 右上角「共用」→ 一般存取權改成「知道連結的使用者」→ 檢視者
   5. 網址列會看到 https://docs.google.com/spreadsheets/d/【這一串】/edit
      把那一串貼到下面 SHEET_ID 的位置
*/
const STATUS_CONFIG = {
  SHEET_ID: 'YOUR_SHEET_ID_HERE',   // ← 貼上你的試算表 ID
  SHEET_NAME: 'Status',              // 分頁名稱，需與試算表一致
  REFRESH_MS: 45000,                 // 每 45 秒自動重新讀取一次
};

function gvizParse(text){
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if(!m) return null;
  try{ return JSON.parse(m[1]); }catch(e){ return null; }
}

async function fetchStatusMap(){
  if(!STATUS_CONFIG.SHEET_ID || STATUS_CONFIG.SHEET_ID === 'YOUR_SHEET_ID_HERE') return null;
  const url = `https://docs.google.com/spreadsheets/d/${STATUS_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(STATUS_CONFIG.SHEET_NAME)}&headers=1`;
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();
  const json = gvizParse(text);
  if(!json || !json.table || !json.table.rows) return null;
  const map = {};
  json.table.rows.forEach(function(row){
    const cells = row.c || [];
    const key = cells[0] && cells[0].v;
    const status = cells[2] && cells[2].v;
    if(key) map[String(key).trim()] = status ? String(status).trim() : '';
  });
  return map;
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

function classifySlot(status, normal){
  const s = (status || '').trim();
  if(!s || s === normal) return { state: 'open', label: '開放預約中' };
  if(s.includes('未開放') || s.includes('尚未')) return { state: 'closed', label: s };
  return { state: 'full', label: s }; // 涵蓋「已額滿」以及任何其他自訂文字
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

function applyStatus(map){
  if(!map) return;
  applyGiftBadges(map);
  applySlotStatus(map);
  const stamp = document.getElementById('statusUpdated');
  if(stamp){
    const now = new Date();
    stamp.textContent = '最後更新：' + now.toLocaleTimeString('zh-TW', { hour12:false });
  }
}

async function refreshStatus(){
  try{
    const map = await fetchStatusMap();
    applyStatus(map);
  }catch(e){ /* 讀取失敗時維持原樣，不影響網站正常顯示 */ }
}

if(document.querySelector('[data-key]')){
  refreshStatus();
  setInterval(refreshStatus, STATUS_CONFIG.REFRESH_MS);
}
