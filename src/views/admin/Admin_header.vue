<template>
  <div class="header">
    <div class="title">校园巴士管理员后台</div>
    <div class="user-info">
      <i :class="[connectionStatusIcon, { 'subtleBlink': connectionStatusIcon === 'fas fa-circle' },
      {'bigBlink': connectionStatusIcon === 'fas fa-times-circle' || connectionStatusIcon === 'fas fa-circle-notch'}]" class="status-icon" ></i>
      <span>用户名</span>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from 'vue';
import {useApiBaseStore} from "@/stores/network";

// 设置连接状态图标
const connectionStatus = ref('green');  // 默认是绿色，表示正常
const isRequesting = ref(false);  // 用来标记请求是否正在进行
const connectionStatusIcon = computed(() => {
  if (connectionStatus.value === 'green') {
    return 'fas fa-circle';  // 绿色圆点
  } else if (connectionStatus.value === 'yellow') {
    return 'fas fa-circle-notch';  // 黄色圆点
  } else {
    return 'fas fa-times-circle';  // 红色圆点
  }
});

// 定时器变量
let heartbeatInterval;
// 全局超时变量
let times = 0;

const checkConnection = async () => {
  if (isRequesting.value) return;  // 如果当前有请求在进行中，则不发送新的请求

  isRequesting.value = true;  // 标记请求开始

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);  // 设置超时为 2 秒



  try {
    const apiBaseStore = useApiBaseStore();
    // 向服务器发送心跳包（假设 API 路径是 /heartbeat）
    const response = await fetch(apiBaseStore.baseUrl + '/heartbeat', {signal: controller.signal});

    if (response.ok) {
      times = 0;
      connectionStatus.value = 'green';  // 服务器连接正常
    } else {
      connectionStatus.value = 'yellow'; // 其它回复则是网络不佳
    }
  } catch (error) {
    // 错误便是认为网络丢失
    times++;
    if (times === 3) {
      // 如果连续 3 次检查都没有连接，则认为网络已经丢失
      alert('网络连接已丢失，请检查网络设置');
    } else if(times < 2) {
      connectionStatus.value = 'yellow'; // 其它回复则是网络不佳
    } else {
      connectionStatus.value = 'red';
    }
  } finally {
    clearTimeout(timeoutId); // 清除超时定时器
    isRequesting.value = false;  // 标记请求结束
  }
};

onMounted(() => {
  // 页面加载后，开始每隔 1 秒发送一次心跳包
  connectionStatus.value = 'red'
  heartbeatInterval = setInterval(checkConnection, 3000);
  checkConnection();  // 初始化时立即检查连接状态
});

onBeforeUnmount(() => {
  // 组件销毁时，清除定时器
  clearInterval(heartbeatInterval);
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px; /* 适当的 padding 使右侧不那么紧凑 */
  background-color: #34495e;
  color: #fff;
  height: 60px;
  line-height: 60px;
  position: fixed;
  top: 0;
  left: 240px;
  width: calc(100% - 240px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: background-color 0.3s ease;
}

.header:hover {
  background-color: #2c3e50;
}

.title {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
}

.title:hover {
  transform: scale(1.05);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding-right: 65px; /* 给用户名和图标之间适当的间距 */
}

.user-info:hover {
  transform: scale(1.1);
}

.user-info span {
  margin-left: 10px;
  font-weight: 600;
}

.status-icon {
  font-size: 18px;
  margin-right: 10px;
  transition: transform 0.3s ease, color 0.3s ease, font-size 0.3s ease; /* 动画效果 */
}

.status-icon.fas.fa-circle {
  color: #2ecc71; /* 绿色 */
}

.status-icon.fas.fa-circle-notch {
  color: #f39c12; /* 黄色 */
}

.status-icon.fas.fa-times-circle {
  color: #e74c3c; /* 红色 */
}

/* 更平滑的放大效果 */
.status-icon:hover {
  transform: scale(1.2);
}

@keyframes subtleBlink {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.05); /* 放大一点 */
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.05); /* 再放大一点 */
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bigBlink  {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.25); /* 放大一点 */
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.25); /* 再放大一点 */
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.subtleBlink {
  animation: subtleBlink 2s ease-in-out infinite;
}

.bigBlink {
  animation: bigBlink 1.5s ease-in-out infinite;
}

</style>
