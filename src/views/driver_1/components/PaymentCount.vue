<template>
  <div class="payment-count-container">
    <h3 class="title">付款人数统计</h3>
    <div class="stats">
      <div class="stat-item">
        <span class="label">当天付款人数:</span>
        <span class="value">{{ currentCount }}</span>
      </div>
      <!-- <div class="stat-item">
        <span class="label">上次付款人数:</span>
        <span class="value">{{ lastCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">上上次付款人数:</span>
        <span class="value">{{ previousCount }}</span>
      </div> -->
    </div>
    <h3 class="title">车内人数统计</h3>
    <div class="stats">
      <div class="stat-item">
        <span class="label">车内人数:</span>
        <span class="value">{{ personCount }}</span>
      </div>
    </div> 
    <!-- <button class="clear-button" @click="clearCurrentCount">清空本次付款人数</button> -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
  import { useWebSocketStore } from '@/stores/webSocketStore';

const webSocketStore = useWebSocketStore();

// 使用 computed 來確保 vehicleCallMessages 是響應式的
// const paymentUserCountMessages = computed(() => webSocketStore.paymentUserCountMessages);
// 使用 computed 來確保 Message 是響應式的
const Message = computed(() => webSocketStore.messages);


// 定义响应式数据
const currentCount = ref(0); // 当前付款人数
const personCount = ref(0); // 当前车内人数
// const lastCount = ref(0); // 上次车内人数
// const previousCount = ref(0); // 上上次付款人数

// 每當 paymentUserCountMessages 發生變化，更新 currentCount
// watch(paymentUserCountMessages, (newMessages) => {
//   console.log('Processing case_accept message:', newMessages);
//   // 基於 paymentUserCountMessages 長度來設置當前付款人數
//   currentCount.value += newMessages.length;

//   // // 更新付款人数的歷史數據
//   // if (currentCount.value > 0) {
//   //   previousCount.value = lastCount.value;
//   //   lastCount.value = currentCount.value;
//   // }

//   // 使用完後清空 paymentUserCountMessages
//   webSocketStore.paymentUserCountMessages = []; // 清空數據
// });

// 监听 Message 队列的变化
watch(Message, (newMessages) => {
  for (let i = 0; i < newMessages.length; i++) {
    const message = newMessages[i];
    console.log('Processing case_accept message:', message);

    // 判断消息类型
    if (message.type === 'boardingMessage') {
      // 进行相应的处理
      personCount.value += message.boardingCount
          // 处理完后删除该条消息
    webSocketStore.messages.splice(i, 1); // 从队列中移除该条消息
    break; // 如果只需要处理一条符合条件的消息，可以跳出循环
    }
    else if (message.type === 'alightingMessage') {
      personCount.value -= message.alightingCount
          // 处理完后删除该条消息
    webSocketStore.messages.splice(i, 1); // 从队列中移除该条消息
    break; // 如果只需要处理一条符合条件的消息，可以跳出循环
    }
    else if (message.type === 'payment_user_count') {
      currentCount.value += message.count;
          // 处理完后删除该条消息
    webSocketStore.messages.splice(i, 1); // 从队列中移除该条消息
    break; // 如果只需要处理一条符合条件的消息，可以跳出循环
    }
    
  }
}, { deep: true });

</script>

<style scoped>
.payment-count-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.title {
  font-size: 1.5em;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 1.2em;
  color: #555;
}

.value {
  font-size: 1.5em;
  font-weight: bold;
  color: #007bff;
}

.clear-button {
  display: block;
  width: 100%;
  padding: 10px 0;
  font-size: 1em;
  font-weight: bold;
  color: #fff;
  background-color: #ff4d4f;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.clear-button:hover {
  background-color: #d9363e;
}
</style>
