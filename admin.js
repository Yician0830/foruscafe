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

let currentValues = {};

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

function buildRow(item){
  const row = document.createElement('div');
  row.className = 'admin-row';
  row.dataset.key = item.key;

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = item.label;
  row.appendChild(name);

  const current = document.createElement('span');
  current.className = 'current';
  current.textContent = '目前：讀取中…';
  row.appendChild(current);

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
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = '更新';
  row.appendChild(saveBtn);

  const savedFlag = document.createElement('span');
  savedFlag.className = 'saved-flag';
  savedFlag.textContent = '已儲存 ✓';
  row.appendChild(savedFlag);

  saveBtn.addEventListener('click', function(){
    const value = select.value === '__custom__' ? customInput.value.trim() : select.value;
    if(!value) return;
    saveBtn.disabled = true;
    db.collection('status').doc(item.key).set({
      value: value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(function(){
      saveBtn.disabled = false;
      savedFlag.classList.add('show');
      setTimeout(function(){ savedFlag.classList.remove('show'); }, 1800);
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
}

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
