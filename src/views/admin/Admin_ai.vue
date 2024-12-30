<template>
  <div class="main">
    <!-- 背景的动态渐变，覆盖整个视窗 -->
    <div class="bg"></div>
    <!-- 粒子效果容器/组件（示例仅给思路，具体写法见 onMounted 或其他库写法） -->
    <div class="particles" ref="particlesRef"></div>

    <div class="container">
      <!-- 球体 -->
      <div
          class="sphere"
          :class="sphereStateClass"
      ></div>

      <!-- 表单区域 -->
      <div class="form-box">
        <h2>智能执行命令</h2>
        <input
            class="input"
            type="text"
            v-model="inputValue"
            placeholder="请输入指令"
            @focus="onFocus"
            @input="onIdle"
        />
        <button
            class="action-button"
            @click="sendRequest"
        >
          提交
        </button>

        <!-- 重置按钮（只有请求结束后出现） -->
        <button
            v-if="showReset"
            class="action-button reset-btn"
            @click="resetSphere"
        >
          重置
        </button>

        <!-- 提示/错误 -->
        <div class="feedback-section">
          <p
              v-if="errorMessage"
              class="error-msg"
          >
            {{ errorMessage }}
          </p>
          <p
              v-else-if="isThinking"
              class="waiting-msg"
          >
            等待中...
          </p>
          <p
              v-else-if="responseMessage && !chartData"
              class="ai-reply"
          >
            AI回复：{{ responseMessage }}
          </p>
        </div>
      </div>

      <!-- 图表容器 -->
      <div
          v-if="chartData"
          ref="chart"
          class="chart-container"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
// eslint-disable-next-line no-unused-vars
import { Engine, Container } from 'tsparticles'  // 用于粒子效果(tsparticles)

export default {
  name: 'IntelligentCommandInterface',
  setup() {
    // ====== 表单相关 ======
    const inputValue = ref('')
    const isThinking = ref(false)
    const errorMessage = ref('')
    const responseMessage = ref('')
    const showReset = ref(false)

    // ====== 图表相关 ======
    const chartData = ref(null)
    // eslint-disable-next-line no-unused-vars
    const chartRef = ref(null)
    let chartInstance = null

    // ====== 球体的状态（idle, waiting, ...） ======
    const sphereState = ref('idle')

    const onIdle = () => {
      if (sphereState.value !== 'idle') {
        sphereState.value = 'idle'
      }
    }

    const onFocus = () => {
      // 这里可以做一些球体的小震动动画
    }

    const sendRequest = async () => {
      isThinking.value = true
      errorMessage.value = ''
      responseMessage.value = ''
      chartData.value = null
      showReset.value = false

      // 球体进入 waiting 状态
      sphereState.value = 'waiting'

      try {
        const prefixURL = localStorage.getItem("prefixURL"); // 获取后端地址

        const res = await fetch(`${prefixURL}/admin/ai/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: inputValue.value })
        })
        const json = await res.json()

        if (json.status === 'success') {
          responseMessage.value = json.data.text || ''
          if (json.data.chartData && json.data.chartData.length > 0) {
            chartData.value = json.data.chartData
            await nextTick()
            initChart()
          }
        } else {
          errorMessage.value = json.message || '后端处理失败'
        }
      } catch (err) {
        console.error(err)
        errorMessage.value = '请求失败，请稍后重试'
      } finally {
        isThinking.value = false
        showReset.value = true
      }
    }

    const chart = ref(null)
    const initChart = () => {
      if (!chart.value) return
      if (!chartInstance) {
        chartInstance = echarts.init(chart.value)
      }

      const option = {
        title: {
          text: '可视化结果',
          left: 'center',
          textStyle: {
            color: '#fff'
          }
        },
        backgroundColor: 'transparent',
        tooltip: {},
        xAxis: {
          type: 'category',
          data: chartData.value.map(d => d.x),
          axisLine: { lineStyle: { color: '#fff' } },
          axisLabel: { color: '#fff' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#fff' } },
          axisLabel: { color: '#fff' }
        },
        series: [
          {
            data: chartData.value.map(d => d.y),
            type: 'bar',
            itemStyle: {
              color: '#FFDD33'
            }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    watch(chartData, () => {
      if (chartData.value && chartInstance) {
        initChart()
      }
    })

    const resetSphere = () => {
      inputValue.value = ''
      errorMessage.value = ''
      responseMessage.value = ''
      chartData.value = null
      showReset.value = false
      sphereState.value = 'idle'
    }

    const sphereStateClass = computed(() => {
      return {
        idle: sphereState.value === 'idle',
        waiting: sphereState.value === 'waiting'
      }
    })

    // ====== 粒子效果 ======
    const particlesRef = ref(null)
    onMounted(() => {
      // 这里可以初始化 tsparticles
      // 具体写法可参考 tsparticles 文档 https://particles.js.org/
    })

    return {
      inputValue,
      isThinking,
      errorMessage,
      responseMessage,
      showReset,
      chartData,
      chart,
      sendRequest,
      resetSphere,
      onIdle,
      onFocus,
      sphereStateClass,
      particlesRef
    }
  }
}
</script>

<style scoped>
/* ====== 整体容器 & 背景 ====== */
.main {
  padding: 30px;
  margin-left: 210px;
  margin-top: -50px;   /* 可根据实际布局进行调整 */
  margin-right: 10px;
  width: 85vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 使用深色渐变背景，搭配亮色球体和浅色表单，突出层次 */
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
}

/* 可在 bg 类里写一些额外的动态渐变或动画（如粒子、光晕等） */
.bg {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* 如果需要动态渐变，可设置动画，这里演示一个淡淡的渐变过渡 */
  background: linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.8), rgba(44,83,100,0.8));
  transition: all 2s ease;
}

/* ====== 容器 ====== */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1; /* 确保在背景和粒子效果之上 */
}

/* ====== 球体 ====== */
.sphere {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  /* 使用更偏亮、金橘色的渐变，让球体更醒目 */
  background: radial-gradient(circle, #fdd45c, #fa8b0c);
  animation: colorShift 6s infinite linear, scalePulse 2s infinite ease-in-out;
  transition: transform 1s ease, background 1s ease;
  box-shadow: 0 6px 25px rgba(255, 140, 0, 0.5); /* 发一点亮光的感觉 */
  margin-bottom: 20px;
}

/* 空闲(idle)状态：居中不变 */
.sphere.idle {
  transform: translateX(0) scale(1);
}

/* 等待(waiting)状态：向右移动、缩放 */
.sphere.waiting {
  transform: translateX(150px) scale(0.7);
  animation: colorShiftSmall 6s infinite linear, scalePulse 2s infinite ease-in-out;
}

/* ====== 色相渐变动画 ====== */
@keyframes colorShift {
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(180deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

@keyframes colorShiftSmall {
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(90deg);
  }
  100% {
    filter: hue-rotate(180deg);
  }
}

/* ====== 脉动动画 ====== */
@keyframes scalePulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

/* ====== 表单区域 ====== */
.form-box {
  /* 让表单有半透明效果，与深色背景形成对比 */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  text-align: center;
  margin-top: 10px;
}

/* 标题 */
h2 {
  color: #fff;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 输入框 */
.input {
  width: 95%;
  padding: 12px;
  margin: 10px 0 10px 0;
  border: 2px solid transparent;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.6);
  color: #333; /* 输入文字用深色，利于阅读 */
  font-size: 16px;
  outline: none;
  transition: border 0.3s, box-shadow 0.3s;
}

/* 输入框聚焦时 */
.input:focus {
  border-color: #ffb347; /* 焦点状态下边框改为暖色调 */
  box-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
}

/* 通用按钮样式 */
.action-button {
  width: 100%;
  padding: 12px;
  background-color: #ffb347; /* 使用与焦点边框同色系，保持视觉统一 */
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 4px 15px rgba(255, 179, 71, 0.3);
}

.action-button:hover {
  background-color: #fc8d34; /* 鼠标悬停时更深一点 */
  transform: scale(1.05);
}

.action-button:disabled {
  background-color: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}

/* 重置按钮可与提交按钮有所区分，也可以保持一致，这里做个小区别 */
.reset-btn {
  background-color: #47b6ff; /* 清爽的蓝色 */
  margin-top: 0;
}
.reset-btn:hover {
  background-color: #2691e9;
}

/* 提示 & 错误信息容器 */
.feedback-section {
  margin-top: 10px;
  min-height: 24px;
}

/* 错误提示信息 */
.error-msg {
  color: #e74c3c;
  font-size: 14px;
}

/* 等待中提示 */
.waiting-msg {
  color: #fff;
  margin-top: 10px;
}

/* AI回复文字 */
.ai-reply {
  color: #fff;
  margin-top: 10px;
}

/* ====== 图表容器 ====== */
.chart-container {
  width: 400px;
  height: 300px;
  margin-top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.1);
}
</style>
