const ITEMS = [
  { key: 'poster',    label: 'A5海報',        type: 'gift' },
  { key: 'ribbon',    label: '絲帶手環',       type: 'gift' },
  { key: 'ticket',    label: '主題票卡',       type: 'gift' },
  { key: 'bag',       label: '手提紙袋',       type: 'gift' },
  { key: 'tearfilm',  label: '撕拉片',         type: 'gift' },
  { key: 'slot-1000', label: '10:00–10:50',   type: 'slot' },
  { key: 'slot-1100', label: '11:00–11:50',   type: 'slot' },
  { key: 'slot-1200', label: '12:00–12:50',   type: 'slot' },
  { key: 'slot-1300', label: '13:00–13:50',   type: 'slot' },
  { key: 'slot-1400', label: '14:00–14:50',   type: 'slot' },
  { key: 'slot-1500', label: '15:00–15:50',   type: 'slot' },
  { key: 'lottery-s', label: 'ARIRANG 泰亨封面黑膠唱片',           type: 'stock' },
  { key: 'lottery-a', label: 'BT21XSNOWPEAK TATA吊飾',           type: 'stock' },
  { key: 'lottery-b', label: '10吋無框畫',           type: 'stock' },
   { key: 'lottery-c', label: 'Q版愛心迷你扇(兩款隨機)',           type: 'stock' },
   { key: 'lottery-d', label: '迷你手幅吊飾',           type: 'stock' },
   { key: 'lottery-e', label: 'Q版造型磁鐵(兩款隨機)',           type: 'stock' },
   { key: 'lottery-f', label: 'Q版造型吊飾(10款隨機)',           type: 'stock' },
   { key: 'lottery-g', label: 'Q版漢堡大頭扇',           type: 'stock' },
   { key: 'lottery-h', label: '便利貼',           type: 'stock' },
  { key: 'merch-1',   label: '60*30 閃粉手幅',      type: 'stock' },
  { key: 'merch-2',   label: '迷你小手幅',      type: 'stock' },
  { key: 'merch-3',   label: 'Q版吊飾組/單購',      type: 'stock' },
  { key: 'merch-4',   label: 'Q版造型磁鐵',      type: 'stock' },
  { key: 'merch-5',   label: '磁吸卡套',      type: 'stock' },
];
const PRESETS = {
  gift: ['供應中', '已發完'],
  slot: ['開放中', '未開放', '已額滿'],
};

const auth = firebase.auth();
const db = firebase.firestore();

const loginCard = document.getElementById('loginCard');
const panel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const whoEl = document.getElementById('who');
const giftGroup = document.getElementById('giftGroup');
const slotGroup = document.getElementById('slotGroup');
const lotteryGroup = document.getElementById('lotteryGroup');
const merchGroup = document.getElementById('merchGroup');

auth.onAuthStateChanged(function(user){
  if(user){
    loginCard.classList.add('hidden');
    panel.classList.remove('hidden');
    whoEl.textContent = user.email;
    startListening();
  } else {
    loginCard.classList.remove('hidden');
    panel.classList.add('hidden');
  }
});

loginForm.addEventListener('submit', function(e){
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('email').value.trim();
  const pw = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, pw).catch(function(err){
    loginError.textContent = '登入失敗，請確認帳號密碼是否正確';
  });
});

document.getElementById('logoutBtn').addEventListener('click', function(){
  auth.signOut();
});

// 單一項目儲存（寫入 Firestore + 更新 UI 狀態）
function saveOne(item, value, savedFlag){
  return db.collection('status').doc(item.key).set({
    value: value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).then(function(){
    if(savedFlag){
      savedFlag.classList.add('show');
      setTimeout(function(){ savedFlag.classList.remove('show'); }, 1800);
    }
  });
}

function buildRow(item){
  const row = document.createElement('div');
  row.className = 'admin-row';
  row.dataset.key = item.key;
  row.dataset.dirty = 'false';

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = item.label;
  row.appendChild(name);

  const current = document.createElement('span');
  current.className = 'current';
  current.textContent = '目前：讀取中…';
  row.appendChild(current);

  const savedFlag = document.createElement('span');
  savedFlag.className = 'saved-flag';
  savedFlag.textContent = '已儲存 ✓';

  if(item.type === 'stock'){
    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.min = '0';
    numInput.placeholder = '剩餘數量';
    numInput.style.width = '90px';
    row.appendChild(numInput);
    numInput.addEventListener('input', function(){ row.dataset.dirty = 'true'; });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = '更新';
    row.appendChild(saveBtn);
    row.appendChild(savedFlag);

    row._getValue = function(){
      const v = numInput.value.trim();
      if(v === '' || isNaN(parseInt(v, 10))) return null;
      return String(parseInt(v, 10));
    };
    row._afterSave = function(){ row.dataset.dirty = 'false'; };

    saveBtn.addEventListener('click', function(){
      const value = row._getValue();
      if(value === null) return;
      saveBtn.disabled = true;
      saveOne(item, value, savedFlag).then(function(){
        saveBtn.disabled = false;
        row._afterSave();
      }).catch(function(err){
        saveBtn.disabled = false;
        alert('儲存失敗：' + err.message);
      });
    });

    return row;
  }

  const select = document.createElement('select');
  PRESETS[item.type].forEach(function(opt){
    const o = document.createElement('option');
    o.value = opt; o.textContent = opt;
    select.appendChild(o);
  });
  const customOpt = document.createElement('option');
  customOpt.value = '__custom__';
  customOpt.textContent = '其他自訂文字…';
  select.appendChild(customOpt);
  row.appendChild(select);

  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.placeholder = '輸入自訂狀態文字';
  customInput.classList.add('hidden');
  row.appendChild(customInput);

  select.addEventListener('change', function(){
    customInput.classList.toggle('hidden', select.value !== '__custom__');
    row.dataset.dirty = 'true';
  });
  customInput.addEventListener('input', function(){ row.dataset.dirty = 'true'; });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = '更新';
  row.appendChild(saveBtn);
  row.appendChild(savedFlag);

  row._getValue = function(){
    const value = select.value === '__custom__' ? customInput.value.trim() : select.value;
    return value || null;
  };
  row._afterSave = function(){ row.dataset.dirty = 'false'; };

  saveBtn.addEventListener('click', function(){
    const value = row._getValue();
    if(value === null) return;
    saveBtn.disabled = true;
    saveOne(item, value, savedFlag).then(function(){
      saveBtn.disabled = false;
      row._afterSave();
    }).catch(function(err){
      saveBtn.disabled = false;
      alert('儲存失敗：' + err.message);
    });
  });

  return row;
}

function renderGroups(){
  ITEMS.filter(function(i){ return i.type === 'gift'; }).forEach(function(item){
    giftGroup.appendChild(buildRow(item));
  });
  ITEMS.filter(function(i){ return i.type === 'slot'; }).forEach(function(item){
    slotGroup.appendChild(buildRow(item));
  });
  ITEMS.filter(function(i){ return i.key.startsWith('lottery-'); }).forEach(function(item){
    lotteryGroup.appendChild(buildRow(item));
  });
  ITEMS.filter(function(i){ return i.key.startsWith('merch-'); }).forEach(function(item){
    merchGroup.appendChild(buildRow(item));
  });
}

// 批次更新：只送出該分類中「有變更（dirty）」的項目
function bulkSave(containerEl, btnEl){
  const rows = Array.prototype.slice.call(containerEl.querySelectorAll('.admin-row[data-dirty="true"]'));
  if(rows.length === 0){
    btnEl.textContent = '沒有變更項目';
    setTimeout(function(){ btnEl.textContent = '全部更新'; }, 1500);
    return;
  }
  btnEl.disabled = true;
  btnEl.textContent = '更新中…';

  const batch = db.batch();
  const toMark = [];
  rows.forEach(function(row){
    const value = row._getValue ? row._getValue() : null;
    if(value === null) return;
    const key = row.dataset.key;
    const ref = db.collection('status').doc(key);
    batch.set(ref, {
      value: value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    toMark.push(row);
  });

  batch.commit().then(function(){
    toMark.forEach(function(row){
      if(row._afterSave) row._afterSave();
      const flag = row.querySelector('.saved-flag');
      if(flag){
        flag.classList.add('show');
        setTimeout(function(){ flag.classList.remove('show'); }, 1800);
      }
    });
    btnEl.disabled = false;
    btnEl.textContent = '已全部更新 ✓';
    setTimeout(function(){ btnEl.textContent = '全部更新'; }, 1800);
  }).catch(function(err){
    btnEl.disabled = false;
    btnEl.textContent = '全部更新';
    alert('批次儲存失敗：' + err.message);
  });
}

document.querySelectorAll('.bulk-save-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    const targetId = btn.getAttribute('data-target');
    const containerEl = document.getElementById(targetId);
    if(containerEl) bulkSave(containerEl, btn);
  });
});

function startListening(){
  if(giftGroup.childElementCount === 0 && slotGroup.childElementCount === 0){
    renderGroups();
  }
  db.collection('status').onSnapshot(function(snapshot){
    snapshot.forEach(function(doc){
      const data = doc.data() || {};
      const row = document.querySelector('.admin-row[data-key="' + doc.id + '"]');
      if(row){
        const current = row.querySelector('.current');
        current.textContent = '目前：' + (data.value || '（未設定）');
      }
    });
  });
}
