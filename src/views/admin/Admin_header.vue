<template>
  <div class="header">
    <div class="title">校园巴士管理员后台</div>
    <div class="user-info">
      <i
          :class="[
          connectionStatusIcon,
          { 'subtleBlink': connectionStatusIcon === 'fas fa-circle' },
          { 'bigBlink': connectionStatusIcon === 'fas fa-times-circle' || connectionStatusIcon === 'fas fa-circle-notch' }
        ]"
          class="status-icon"
      ></i>
      <span>用户名</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const connectionStatus = ref('green');
const isRequesting = ref(false);
const connectionStatusIcon = computed(() => {
  if (connectionStatus.value === 'green') {
    return 'fas fa-circle';
  } else if (connectionStatus.value === 'yellow') {
    return 'fas fa-circle-notch';
  } else {
    return 'fas fa-times-circle';
  }
});

// 模拟心跳包逻辑
let heartbeatInterval;
let times = 0;

const checkConnection = async () => {
  if (isRequesting.value) return;
  isRequesting.value = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const prefixURL = localStorage.getItem("prefixURL");
    const response = await fetch(prefixURL + '/heartbeat', {signal: controller.signal});

    if (response.ok) {
      times = 0;
      connectionStatus.value = 'green';
    } else {
      connectionStatus.value = 'yellow';
    }
  } catch (error) {
    times++;
    if (times === 3) {
      alert('网络连接已丢失，请检查网络设置');
    } else if (times < 2) {
      connectionStatus.value = 'yellow';
    } else {
      connectionStatus.value = 'red';
    }
  } finally {
    clearTimeout(timeoutId);
    isRequesting.value = false;
  }
};

onMounted(() => {
  connectionStatus.value = 'red';
  heartbeatInterval = setInterval(checkConnection, 3000);
  checkConnection();
});

onBeforeUnmount(() => {
  clearInterval(heartbeatInterval);
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  /* 让头部颜色与侧边栏更加呼应 */
  background-color: #3b4c5a;
  color: #fff;
  height: 60px;
  line-height: 60px;
  position: fixed;
  top: 0;
  left: 240px;
  width: calc(100% - 240px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  transition: background-color 0.3s ease;
}

.header:hover {
  background-color: #354553;
}

.title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: transform 0.3s ease;
  user-select: none;
}

.title:hover {
  transform: scale(1.03);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding-right: 20px;
  margin-right: 20px;
}

.user-info:hover {
  transform: scale(1.05);
}

.user-info span {
  margin-left: 8px;
  font-weight: 500;
}

.status-icon {
  font-size: 16px;
  margin-right: 6px;
  transition: transform 0.3s ease, color 0.3s ease;
}

/* 不同状态的颜色 */
.status-icon.fas.fa-circle {
  color: #2ecc71; /* green */
}

.status-icon.fas.fa-circle-notch {
  color: #f39c12; /* yellow */
}

.status-icon.fas.fa-times-circle {
  color: #e74c3c; /* red */
}

/* 更平滑的放大效果 */
.status-icon:hover {
  transform: scale(1.15);
}

/* subtleBlink 动画 */
@keyframes subtleBlink {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.85;
    transform: scale(1.05);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 0.85;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.subtleBlink {
  animation: subtleBlink 2s ease-in-out infinite;
}

/* bigBlink 动画 */
@keyframes bigBlink {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.2);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.bigBlink {
  animation: bigBlink 1.5s ease-in-out infinite;
}
</style>
