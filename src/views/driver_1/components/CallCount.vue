<template>
  <el-card class="vehicle-call-card" shadow="always">
    <div class="header">
      <h3>车辆呼叫列表</h3>
    </div>
    <div class="content">
      <!-- 有呼叫信息时 -->
      <div v-if="vehicleCallMessages.length > 0" class="message-list">
        <div
          v-for="(message, index) in vehicleCallMessages"
          :key="index"
          class="message-item"
          :class="{ accepted: message.isAccepted, completed: message.isCompleted }"
        >
          <p>
            <strong>呼叫信息：</strong>
            从 [{{ message.from_str }}] 到 [{{ message.to_str }}]
          </p>
          <div class="actions">
            <button
              v-if="!message.isAccepted"
              @click="acceptCall(message)"
              class="accept-btn"
            >
              接收呼叫
            </button>
            <span v-else-if="!message.isCompleted" class="status">
              正在前往出发地...
            </span>
            <span v-else class="status completed">
              已完成
            </span>
          </div>
        </div>
      </div>

      <!-- 无呼叫信息时 -->
      <div v-else class="no-messages">
        <p>暂无车辆呼叫信息</p>
      </div>
    </div>
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
/* 主卡片样式 */
.vehicle-call-card {
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
}

/* 卡片标题样式 */
.header h3 {
  font-size: 1.5em;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  letter-spacing: 1px;
}

/* 卡片内容区域 */
.content {
  padding: 10px 0;
}

/* 呼叫信息列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 单个呼叫信息项 */
.message-item {
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.message-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
}

/* 接收呼叫状态 */
.message-item.accepted {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.message-item.completed {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

/* 按钮样式 */
.accept-btn {
  background-color: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.accept-btn:hover {
  background-color: #45a049;
}

/* 状态信息 */
.status {
  font-weight: bold;
  color: #555;
}

.status.completed {
  color: #2196f3;
}

/* 没有呼叫信息时 */
.no-messages {
  text-align: center;
  color: #888;
  font-size: 1.2em;
  padding: 20px;
}
</style>
