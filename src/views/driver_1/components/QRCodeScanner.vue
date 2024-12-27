<template>
    <div>
      <canvas id="QRCode_header" style="width: 280px; height: 280px"></canvas>
    </div>
         <!-- 發送呼叫請求 -->
         <button @click="sendPayRequest" class="call-btn">付款</button>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import QRCode from 'qrcode'
    import { useWebSocketStore } from '@/stores/webSocketStore';
    import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
              console.log(userStore.userAccount)
    const webSocketStore = useWebSocketStore();

  
  // 定義變量來存儲二維碼內容
  const qrUrl = ref("https://www.baidu.com/")
  // 狀態：檢測二維碼是否被掃描
const scanned = ref(false)
  
  onMounted(() => {
    getQRCode()
  })
  
  const getQRCode = () => {
    qrUrl.value = window.location.origin + '/scanned'

    const opts = {
      errorCorrectionLevel: "H", // 容錯級別
      type: "image/png", // 二維碼類型
      quality: 0.3, // 二維碼質量
      margin: 0, // 二維碼邊距
      width: 280, // 寬度
      height: 280, // 高度
      text: qrUrl.value, // 二維碼內容
      color: {
        dark: "#333333", // 前景色
        light: "#fff", // 背景色
      },
    }
  
    const msg = document.getElementById("QRCode_header")
  
    // 使用 QRCode 庫生成二維碼並顯示
    QRCode.toCanvas(msg, qrUrl.value, opts, (error) => {
      if (error) {
        console.error("二維碼加載失敗:", error)
        alert("二維碼加載失敗") // 你也可以使用更符合項目的方式處理錯誤
      } else {
        console.log("二維碼生成成功")
      }
    })
      // 偵測 URL 是否被訪問
  if (window.location.pathname === '/scanned') {
    scanned.value = true  // 如果訪問的是 '/scanned' 路徑，則表示二維碼被掃描
    console.log('二維碼被掃描！')
  }
  }

  const sendPayRequest = () => {

        // 創建呼叫訊息對象
        const callMessage = {
            id: "3456"
        };

        // 将新的呼叫信息添加到 store 中
        webSocketStore.addPaymentUserCountMessage(callMessage);
        console.log("daddfsd");
    };
  </script>
  
  <style scoped>
  .call-btn {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
  
  .call-btn:hover {
    background-color: #45a049;
  }
  </style>
  