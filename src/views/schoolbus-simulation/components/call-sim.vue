<template>
    <div class="call-simulation-container">
      <h3>模拟乘客呼叫车辆</h3>
      
      <!-- 出發地點選擇 -->
      <div class="form-group">
        <label for="fromLocation">选择出发地点：</label>
        <select v-model="fromLocation" id="fromLocation" class="location-select">
          <option v-for="station in busStations" :key="station.name" :value="station">
            {{ station.name }}
          </option>
        </select>
      </div>
  
      <!-- 目標地點選擇 -->
      <div class="form-group">
        <label for="toLocation">选择目标地点：</label>
        <select v-model="toLocation" id="toLocation" class="location-select">
          <option v-for="station in busStations" :key="station.name" :value="station">
            {{ station.name }}
          </option>
        </select>
      </div>
  
      <!-- 發送呼叫請求 -->
      <button @click="sendCallRequest" class="call-btn">发送呼叫请求</button>
  
      <!-- 顯示已發送的呼叫訊息 -->
      <div v-if="vehicleCallMessages.length > 0" class="call-messages">
        <h4>已發送的呼叫信息</h4>
        <div v-for="(message, index) in vehicleCallMessages" :key="index" class="call-message">
          <p><strong>出發地：</strong> {{ message.from.name }}</p>
          <p><strong>目標地：</strong> {{ message.to.name }}</p>
          <p><strong>狀態：</strong> {{ message.status }}</p>
        </div>
      </div>
    </div>
</template>
  
<script setup>
    import { ref, computed } from 'vue';
    import { useWebSocketStore } from '@/stores/webSocketStore';
    // 讀取 bus station 數據
    import busStationsData from '@/assets/bus_station_data.json';

    const webSocketStore = useWebSocketStore();

    // 使用 computed 來確保 vehicleCallMessages 是響應式的
    const vehicleCallMessages = computed(() => webSocketStore.vehicleCallMessages);

    // 設置出發地點和目標地點
    const fromLocation = ref(null);
    const toLocation = ref(null);

    // 載入站點數據
    const busStations = busStationsData;

    // 發送呼叫請求
    const sendCallRequest = () => {
            if (!fromLocation.value || !toLocation.value) {
            alert('請選擇出發地和目標地！');
            return;
        }

        // 創建呼叫訊息對象
        const callMessage = {
            from: fromLocation.value,
            to: toLocation.value,
            status: '待接收', // 初始狀態為待接收
            time: new Date().toLocaleString(), // 呼叫時間
        };

        // 将新的呼叫信息添加到 store 中
        webSocketStore.addVehicleCallMessage(callMessage);

        // 清空選擇
        fromLocation.value = null;
        toLocation.value = null;
    };
</script>

<style scoped>
  .call-simulation-container {
    width: 80%;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .location-select {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
  }
  
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
  
  .call-messages {
    margin-top: 30px;
  }
  
  .call-message {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  
  .call-message p {
    margin: 5px 0;
  }
  
  .call-message strong {
    font-weight: bold;
}
</style>
  