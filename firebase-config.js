/* ====== Firebase 專案設定 ======
   請依照以下步驟取得你自己的設定值：

   1. 前往 https://console.firebase.google.com/ 用 Google 帳號登入
   2. 「新增專案」→ 輸入專案名稱（例如 for-us-cafe）→ 一路下一步建立
   3. 左側選單「建構」→「Firestore Database」→「建立資料庫」
      → 選「以正式版模式啟動」（規則之後會再貼給你）→ 選離你近的地區（asia-east1 台灣可選）
   4. 左側選單「建構」→「Authentication」→「開始使用」
      → 登入方式選「電子郵件/密碼」→ 啟用
      → 到「Users」分頁 →「新增使用者」→ 輸入你自己要用來登入後台的 email／密碼
   5. 回到專案總覽（點左上角齒輪⚙「專案設定」）→ 往下捲到「你的應用程式」
      → 點 </> 網頁圖示 → 輸入應用程式暱稱 → 註冊
      → 會看到一段 firebaseConfig，把裡面的值分別貼到下面對應位置
   6. 回到 Firestore Database →「規則」分頁，貼上這段後「發布」：

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /status/{docId} {
            allow read: if true;
            allow write: if request.auth != null;
          }
        }
      }
*/
const firebaseConfig = {
  apiKey: "AIzaSyCYxekte6izxhEqpLYIbYqUQw1ZUhcoJEc",
  authDomain: "for-us-cafe.firebaseapp.com",
  projectId: "for-us-cafe",
  storageBucket: "for-us-cafe.firebasestorage.app",
  messagingSenderId: "1047769189874",
  appId: "1:1047769189874:web:bc5fa423b91c92d4c8af6b",
  measurementId: "G-K9QRTGMEH1"
};

firebase.initializeApp(firebaseConfig);
