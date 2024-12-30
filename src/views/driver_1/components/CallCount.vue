<template>
  <!-- <el-card class="container"> -->
  <el-card  style=" height: 330px;width: 300px;background-color: transparent;">
    <el-col :align="middle">
      <h3>车辆呼叫列表</h3>
    <div v-if="vehicleCallMessages.length > 0" class="message-list">
      接收呼叫
      <div 
        v-for="(message, index) in vehicleCallMessages" 
        :key="index" 
        class="message-item" 
        :class="{ accepted: message.isAccepted, completed: message.isCompleted }"
      >
        <p>
          <strong>呼叫信息：</strong> 从 
          [{{ message.from_str }}] 
          到 
          [{{ message.to_str }}]
        </p>
        <button 
          v-if="!message.isAccepted" 
          @click="acceptCall(message)"
          class="accept-btn"
        >
          接收呼叫
        </button>
        <span v-else-if="!message.isCompleted" class="status">正在前往出发地...</span>
        <span v-else class="status">已完成</span>
      </div>
    </div>
    <div v-else>
      <p>暂无车辆呼叫信息</p>
    </div>
    </el-col>
    
  </el-card>

</template>

<script setup>
import { computed, watch } from 'vue';
import { useWebSocketStore } from '@/stores/webSocketStore';

const webSocketStore = useWebSocketStore();

// 使用 computed 來確保 vehicleCallMessages 是響應式的
const vehicleCallMessages = computed(() => webSocketStore.vehicleCallMessages);
const Message = computed(() => webSocketStore.messages);

// 动态加载路线的 watcher
watch(Message, (newMessages) => {
  for (let i = 0; i < newMessages.length; i++) {
    const message = newMessages[i];
    console.log('Processing case_accept message:', message);

    // 判断消息类型
    if (message.type === 'call_accept') {
      const index = webSocketStore.vehicleCallMessages.findIndex(
        (msg) => msg.passenger_id === message.passenger_id
      );
      if (index !== -1) {
        webSocketStore.vehicleCallMessages.splice(index, 1); // 移除消息
      }
    }
  }
}, { deep: true });

  // 接收呼叫：點擊按鈕並發送接收確認
const acceptCall = (message) => {
  duplicateMessage(message);
  message.isAccepted = true;
  console.log(`接收呼叫: 从 ${message.from.latitude}, ${message.from.longitude} 到 ${message.to.latitude}, ${message.to.longitude}`);

  // 發送接收消息到後端
  const payload = {
      type: 'call_accept',
      driver_id: localStorage.getItem("id"),
      car_id: localStorage.getItem("car_id"),
      passenger_id: message.passenger_id,
      status: 'accepted',
    };
    webSocketStore.sendMessage(JSON.stringify(payload));

    // 模擬駕駛員前往出發地點的過程
    simulateDriverArrival(message);
};

// 复制消息并设置为已接收状态
const duplicateMessage = (message) => {
  // 深拷贝原始消息
  const newMessage = JSON.parse(JSON.stringify(message));

  // 修改新消息的状态为已接收
  newMessage.isAccepted = true;

  // 将新消息添加到列表中
  webSocketStore.vehicleCallMessages.push(newMessage);

  console.log("复制了一条消息:", newMessage);
};

// 模擬駕駛員到達出發地點
const simulateDriverArrival = (message) => {
  setTimeout(() => {
    console.log("驾驶员已到达出发地:", message.from);
    message.isCompleted = true;
    const index = webSocketStore.vehicleCallMessages.findIndex(
      (msg) => msg.passenger_id === message.passenger_id
    );
    if (index !== -1) {
      webSocketStore.vehicleCallMessages.splice(index, 1); // 移除消息
    }
    console.log("呼叫已完成");
  }, 5000); // 模擬 5 秒後到達
};
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
}

h3 {
  margin-bottom: 20px;
  color: #333;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.message-item.accepted {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.message-item.completed {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.accept-btn {
  background-color: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.accept-btn:hover {
  background-color: #45a049;
}

.status {
  font-weight: bold;
  color: #555;
}
</style>
