<template>
  <div class="construction-container">
    <div class="construction-content">
      <!-- 动态的起重机 -->
      <div class="construction-crane-container">
        <div class="crane"></div>
        <div class="arm"></div>
        <div class="hook"></div>
      </div>

      <h1 class="construction-title">页面建设中</h1>
      <p class="construction-description">
        我们正在构建一个更好的体验！<br />
        请稍后，敬请期待！
      </p>

      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnderConstruction',
  mounted() {
    // 模拟进度条的增加
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(interval);
      }
      this.updateProgress(progress);
    }, 100);
  },
  methods: {
    updateProgress(progress) {
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
    },
  },
};
</script>

<style scoped>
/* 全屏容器，居中对齐所有内容 */
.construction-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f7f7f7;
  flex-direction: column;
  position: relative;
  padding: 0 20px; /* 防止内容过于贴边 */
  box-sizing: border-box;
}

/* 内容区域 */
.construction-content {
  text-align: center;
  font-family: 'Arial', sans-serif;
  max-width: 600px; /* 最大宽度，避免内容过于扩展 */
  width: 100%;
}

/* 起重机容器 */
.construction-crane-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 30px;
  margin-top: 50px; /* 给顶部空间 */
  display: block;
  margin-left: auto;
  margin-right: auto; /* 居中起重机 */
}

/* 起重机主体 */
.crane {
  width: 30px;
  height: 30px;
  background-color: #f39c12;
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  border-radius: 5px;
}

/* 吊臂 */
.arm {
  width: 150px;
  height: 10px;
  background-color: #e74c3c;
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  animation: arm-move 3s linear infinite;
}

/* 吊钩 */
.hook {
  width: 15px;
  height: 15px;
  background-color: #2c3e50;
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  animation: hook-drop 3s linear infinite;
}

/* 吊臂动画 */
@keyframes arm-move {
  0% {
    transform: translateX(-50%) rotate(0deg);
  }
  50% {
    transform: translateX(-50%) rotate(15deg);
  }
  100% {
    transform: translateX(-50%) rotate(0deg);
  }
}

/* 吊钩动画 */
@keyframes hook-drop {
  0% {
    top: 120px;
  }
  50% {
    top: 180px;
  }
  100% {
    top: 120px;
  }
}

/* 标题样式 */
.construction-title {
  font-size: 36px;
  font-weight: bold;
  color: #e74c3c;
  animation: bounce-title 2s infinite;
  margin-bottom: 20px;
}

/* 标题动画 */
@keyframes bounce-title {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

/* 描述文字 */
.construction-description {
  font-size: 18px;
  color: #34495e;
  margin-bottom: 40px;
  line-height: 1.5;
}

/* 进度条容器 */
.progress-container {
  width: 80%;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 100%;
  background-color: #f39c12;
  border-radius: 5px;
  position: relative;
}

/* 填充进度条 */
.progress-fill {
  width: 0;
  height: 100%;
  background-color: #e74c3c;
  border-radius: 5px;
  animation: progress-fill-animation 2s ease-in-out forwards;
}

/* 进度条动画 */
@keyframes progress-fill-animation {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>
