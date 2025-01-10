<template>
  <div v-if="props.visible" class="popup">
    <div class="popup-content">
      <div class="profile-container">
        <div class="info">
          <h2 class="headline">
              <strong>叫车</strong>
          </h2>
          
          
         
          <div class="form-group">
      <label for="fromLocation">选择出发地点：</label>
      <select v-model="fromLocation" id="fromLocation" class="location-select">
        <option v-for="station in sites" :key="station.name + station.position" :value="station">
          {{ station.name }}
        </option>
      </select>
    </div>

    <!-- 目標地點選擇 -->
    <div class="form-group">
      <label for="toLocation">选择目标地点：</label>
      <select v-model="toLocation" id="toLocation" class="location-select">
        <option v-for="station in sites" :key="station.name + station.position" :value="station">
          {{ station.name }}
        </option>
      </select>
    </div>

          <!-- 發送呼叫請求 -->
          <button @click="sendCallRequest" class="call-btn">发送呼叫请求</button>
        </div>
        <button @click="closePopup" class="closebutton">X</button>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useWebSocketStore } from '@/stores/webSocketStore';
    // 讀取 bus station 數據
    // import busStationsData from '@/assets/bus_station_data.json';
    // 設置出發地點和目標地點
    const fromLocation = ref(null);
    const toLocation = ref(null);

    // 載入站點數據
    // let busStations = null;
    const webSocketStore = useWebSocketStore();
  
        // 使用 computed 來確保 Message 是響應式的
  // const Message = computed(() => webSocketStore.messages);
// 初始化时处理消息队列
// function processMessages() {
//   // 遍历现有的消息队列
//   for (let i = 0; i < Message.value.length; i++) {
//     const message = Message.value[i];

//     // 判断消息类型
//     if (message.type === 'site') {
//       // 处理站点数据
//       busStations = message.Sites;
//       console.log('Processing site message:', message);
//       break; // 如果只需要处理一条符合条件的消息，可以跳出循环
//     } 
//   }
// }

// 在组件初始化时调用
onMounted(() => {
  // processMessages(); // 处理当前的消息队列
});

//   let select_from=ref();
//   let select_carID=ref();
  // 定义 props
  const props = defineProps({
    visible: {
      type: Boolean,
      required: true, 
    },
    getTicket: {
      type: Function,
      required: true, 
    },
    sites: {
      type: Array,
      required: true,
    },
  });
  
  // 定义 emits
  const emit = defineEmits(['close3','openPayment']);


  
  // 关闭弹窗
  function closePopup() {
    emit('close3');
  }

    // 發送呼叫請求
    const sendCallRequest = () => {
      if (!fromLocation.value || !toLocation.value) {
        alert('請選擇出發地和目標地！');
        return;
      }
      const from_location = {
        latitude: fromLocation.value.location.latitude,
        longitude: fromLocation.value.location.longitude,
      }
      const to_location = {
        latitude: fromLocation.value.location.latitude,
        longitude: fromLocation.value.location.longitude,
      }
      // 創建呼叫訊息對象
      const callMessage = {
        type: 'vehicle_call',
        passenger_id: localStorage.getItem("id"),
          from_str: fromLocation.value.name,
          from: from_location,
          to_str: toLocation.value.name,
          to: to_location,
          status: '待接收', // 初始狀態為待接收
          time: new Date().toLocaleString(), // 呼叫時間
      };

      // 将新的呼叫信息添加到 store 中
      webSocketStore.sendMessage(JSON.stringify(callMessage));
      emit('openPayment');
      let a = ref();
      let b = ref();
      let c = ref();
      let d = ref();
      a.value = fromLocation.value.name;
      b.value = toLocation.value.name;
      c.value = "暂未有车辆接收呼叫";
      d.value = 0;
      props.getTicket(a, b, c, d);
      // 清空選擇
      fromLocation.value = null;
      toLocation.value = null;
      console.log('确定功能触发');

    };


  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .popup-content {
    background: #fff;
    padding: 25px;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative; /* 确保 .closebutton 的绝对定位相对于弹窗内容 */
  }
  
  .closebutton {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: #aaa; /* 使用红色主题 */
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
    transition: color 0.3s ease;
    padding: 5px; /* 增加一些内边距，使点击区域更大 */
  }
  .closebutton:hover {
    color: #000; /* 悬停时加深颜色 */
  }
  
  .select1 {
    width: 100%;
    font-size: 18px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    appearance: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
  }
  .select2 {
    width: 100%;
    font-size: 18px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    appearance: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
  }
  .select3 {
    width: 100%;
    font-size: 18px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    appearance: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
  }
  .location-select{
    
    width: 100%;
    font-size: 18px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    appearance: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
  
  }
  .cancel,
  .confirm, 
  .call-btn{
    position: relative;
    left: 35%;
    display: inline-block;
    padding: 10px 20px;
    margin-top: 15px;
    font-size: 18px;
    color: #fff;
    background-color: #05910e;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .cancel:hover,
  .confirm:hover,
  .call-btn:hover {
    background-color: #047b0c;
  }
  
  .cancel:active,
  .confirm:active ,
  .call-btn:active{
    transform: translateY(1px);
  }
  
  .headline {
    background: #05910e;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-family: 'Arial', sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    text-align: center;
  }
  
  .info p {
    margin-bottom: 20px;
  }
  
  .info p strong {
    display: block;
    font-size: 20px;
    margin-bottom: 5px;
  }
  
  .info p select {
    width: calc(100% - 20px); /* Adjust for padding */
  }
  
  @media (max-width: 600px) {
    .popup-content {
      padding: 15px;
    }
  
    .headline {
      font-size: 20px;
      padding: 10px;
    }
  
    .cancel,
    .confirm {
      width: 100%;
      text-align: center;
    }
    .closebutton {
      font-size: 18px; /* 减小字体大小 */
      top: 8px;
      right: 8px;
    }
  }
  
  </style>