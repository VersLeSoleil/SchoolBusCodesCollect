<template>
  <div class="payment-count-container">
    <h3 class="title">付款人数统计</h3>
    <div class="stats">
      <div class="stat-item">
        <span class="label">当天付款人数:</span>
        <span class="value">{{ currentCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">上次付款人数:</span>
        <span class="value">{{ lastCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">上上次付款人数:</span>
        <span class="value">{{ previousCount }}</span>
      </div>
    </div>
    <button class="clear-button" @click="clearCurrentCount">清空本次付款人数</button>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
  import { useWebSocketStore } from '@/stores/webSocketStore';

  const webSocketStore = useWebSocketStore();

  // 使用 computed 來確保 vehicleCallMessages 是響應式的
  const paymentUserCountMessages = computed(() => webSocketStore.vehicleCallMessages);

// 定义响应式数据
const currentCount = ref(0); // 当前付款人数
const lastCount = ref(0); // 上次付款人数
const previousCount = ref(0); // 上上次付款人数

// 每當 paymentUserCountMessages 發生變化，更新 currentCount
watchEffect(() => {
  // 基於 paymentUserCountMessages 長度來設置當前付款人數
  currentCount.value += paymentUserCountMessages.value.length;

  // // 更新付款人数的歷史數據
  // if (currentCount.value > 0) {
  //   previousCount.value = lastCount.value;
  //   lastCount.value = currentCount.value;
  // }

  // 使用完後清空 paymentUserCountMessages
  webSocketStore.paymentUserCountMessages = []; // 清空數據
});

// 定义方法
const clearCurrentCount = () => {
  try {
    previousCount.value = lastCount.value;
    lastCount.value = currentCount.value;
    currentCount.value = 0;
    console.log("付款人数已清空");
  } catch (error) {
    console.error("清空付款人数失败:", error);
    alert("清空付款人数时发生错误，请稍后再试！");
  }
};
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
