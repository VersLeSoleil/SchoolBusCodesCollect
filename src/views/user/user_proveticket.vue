<template>
  <div v-if="props.visible" class="popup">
    <div class="popup-content">
      <div class="profile-container">
        <div class="info">
          <h2 class="headline">
            <strong>上车凭证</strong>
          </h2>
          <ul class="ticket-details">
            <li><strong>购票人：</strong>张三</li>
            <li><strong>出发地：</strong>{{ from }}</li>
            <li><strong>目的地：</strong>{{ dest }}</li>
            <li><strong>车牌号：</strong>{{ carid }}</li>
            <li><strong>购票时间：</strong>{{ buyTime }}</li>
          </ul>
          <p>
            <button @click="confirmIntoCar" class="confirm-button">确认上车</button>
          </p>
        </div>
        <button @click="closePopup" class="closebutton">X</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
// 定义 props
const props = defineProps({
  visible: Boolean,
  from: String,
  dest: String,
  carid:String,
  buyTime:String
});

// 定义 emits
const emit = defineEmits(['close1']);


// 确定逻辑
function confirmIntoCar() {
  console.log('确定功能触发');
  // 你可以在这里添加确定的具体逻辑
  closePopup(); // 关闭弹窗
}

// 关闭弹窗
function closePopup() {
  emit('close1');
}
</script>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保弹窗在其他元素之上 */
}

.popup-content {
  background: #fff;
  padding: 40px; /* 增加内边距 */
  border-radius: 16px; /* 增大圆角 */
  width: 100%;
  max-width: 500px; /* 增大最大宽度 */
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); /* 增大阴影效果 */
  text-align: center;
  position: relative;
}

.closebutton {
  position: absolute;
  top: 15px; /* 增大顶部间距 */
  right: 15px; /* 增大右侧间距 */
  font-size: 28px; /* 增大字体大小 */
  color: #d73a49; /* 红色主题 */
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
  transition: color 0.3s ease;
  padding: 8px; /* 增加内边距 */
}

.closebutton:hover {
  color: #b02a37; /* 悬停时加深颜色 */
}

.headline {
  background: #d73a49;
  color: #fff;
  padding: 20px; /* 增加内边距 */
  border-radius: 10px; /* 增大圆角 */
  margin-bottom: 30px; /* 增大底部间距 */
  font-family: 'Arial', sans-serif;
  font-size: 32px; /* 增大字体大小 */
  font-weight: bold;
  text-align: center;
}

.ticket-details {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  margin-bottom: 30px; /* 增大底部间距 */
}

.ticket-details li {
  margin-bottom: 15px; /* 增大列表项间距 */
  font-size: 20px; /* 增大字体大小 */
  color: #333;
}

.ticket-details strong {
  display: inline-block;
  width: 100px; /* 增大标签宽度 */
  font-weight: bold;
  color: #d73a49; /* 红色主题 */
}

.confirm-button {
  display: inline-block;
  padding: 16px 32px; /* 增加按钮内边距 */
  font-size: 22px; /* 增大按钮字体大小 */
  color: #fff;
  background-color: #d73a49;
  border: none;
  border-radius: 8px; /* 增大圆角 */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1); /* 增大阴影效果 */
  margin-top: 20px; /* 增加顶部间距 */
}

.confirm-button:hover {
  background-color: #b02a37; /* 悬停时加深颜色 */
  transform: translateY(-3px); /* 悬停时轻微提升 */
}

.confirm-button:active {
  transform: translateY(2px); /* 按下时轻微下沉 */
}

/* 针对小屏幕的调整 */
@media (max-width: 600px) {
  .popup-content {
    padding: 30px; /* 减小内边距 */
    max-width: 90%; /* 增大最大宽度 */
  }

  .headline {
    font-size: 28px; /* 减小字体大小 */
    padding: 15px;
  }

  .ticket-details li {
    font-size: 18px; /* 减小字体大小 */
  }

  .confirm-button {
    width: 100%; /* 按钮全宽 */
    font-size: 18px; /* 减小字体大小 */
  }

  .closebutton {
    font-size: 24px; /* 减小字体大小 */
    top: 10px;
    right: 10px;
  }
}

</style>