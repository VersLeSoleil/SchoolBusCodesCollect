<template>
  <div class="main">
    <!-- 背景 -->
    <div class="bg"></div>
    <!-- 粒子效果容器 -->
    <div class="particles" ref="particlesRef"></div>

    <div class="container">
      <!-- 球体 -->
      <div
          class="sphere"
          :style="sphereStyle"
      ></div>

      <!-- 表单区域 -->
      <div class="form-box" :style="{ width: computedWidth }"> <!-- 动态调整宽度 -->
        <h2>智能执行命令</h2>
        <div class="input-group">
          <textarea
              class="input"
              v-model="inputValue"
              :placeholder="inputPlaceholder"
              @focus="onFocus"
              @input="onInputChange"
              ref="textareaRef"
              rows="1"
          ></textarea>
          <button
              class="mode-toggle-button"
              @click="toggleMode"
              :title="`切换到 ${nextModeLabel}`"
              :aria-label="`切换到 ${nextModeLabel}`"
              v-html="currentModeIcon"
          ></button>
        </div>
        <button
            class="action-button"
            @click="sendRequest"
        >
          提交
        </button>
        <button
            v-if="showReset"
            class="action-button reset-btn"
            @click="resetSphere"
        >
          重置
        </button>

        <!-- 使用 transition 包裹 feedback-section -->
        <transition name="feedback">
          <div class="feedback-section" v-if="isThinking || errorMessage || responseMessage || tableData.length > 0 || (chartOption && mode === 'chart')">
            <p v-if="errorMessage" class="error-msg">
              {{ errorMessage }}
            </p>
            <p v-else-if="isThinking" class="waiting-msg">
              等待中...
            </p>
            <div v-else-if="responseMessage && mode === 'text'" class="ai-reply" style="white-space: pre-wrap;">
              {{ forcedBreakMessage }}
            </div>
            <div v-else-if="responseMessage && mode === 'image'" class="image-result">
              <img :src="responseMessage" alt="生成的图像" />
            </div>
            <div v-else-if="tableData.length > 0 && mode === 'table'" class="table-result">
              <table>
                <thead>
                <tr>
                  <th v-for="(col, index) in tableColumns" :key="index">{{ col }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="chartOption && mode === 'chart'" class="chart-container" ref="chart"></div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
// 如果使用粒子效果库（如 tsparticles），请根据需要导入

export default {
  name: 'IntelligentCommandInterface',
  setup() {
    // ============ 表单相关 ============
    const inputValue = ref('')
    const isThinking = ref(false)
    const errorMessage = ref('')
    const responseMessage = ref('')
    const showReset = ref(false)

    // ============ 模式相关 ============
    const modes = ['text', 'table', 'chart'] // 可扩展模式
    const mode = ref('text') // 默认模式

    // 计算下一个模式的标签和图标（可根据需要自定义图标）
    const modeIcons = {
      text: '<i class="fas fa-font"></i>',
      table: '<i class="fas fa-table"></i>',
      chart: '<i class="fas fa-chart-bar"></i>',
    }

    const modeLabels = {
      text: '表格模式',
      table: '图表模式',
      chart: '文本模式',
    }

    const currentModeIcon = computed(() => modeIcons[mode.value])
    const nextModeLabel = computed(() => modeLabels[mode.value])

    const toggleMode = () => {
      const currentIndex = modes.indexOf(mode.value)
      const nextIndex = (currentIndex + 1) % modes.length
      mode.value = modes[nextIndex]
    }

    // 动态的输入框占位符
    const inputPlaceholder = computed(() => {
      switch (mode.value) {
        case 'text':
          return '请输入文本指令'
        case 'image':
          return '请输入图像生成指令'
        case 'table':
          return '请输入表格生成指令'
        case 'chart':
          return '请输入图表生成指令'
        default:
          return '请输入指令'
      }
    })

    // ============ 图表相关 ============
    const chartOption = ref(null) // 接收后端返回的 chartOption
    const tableData = ref([]) // 初始化为空数组
    const tableColumns = ref(['列1', '列2', '列3']) // 示例列名，根据实际情况调整
    const chart = ref(null) // 对应模板中的 ref="chart"
    let chartInstance = ref(null) // 使用 ref 跟踪 chartInstance

    // ============ 球体动画相关 ============
    const sphereState = ref('noInput')
    const colorAngle = ref(0)
    const animationSpeed = ref(0.05)
    const baseScale = ref(0.1)
    const targetX = ref(0)
    const pulseAmplitude = ref(0)

    // 启动帧循环
    let lastTime = 0
    const animateSphere = (time) => {
      const delta = time - lastTime
      lastTime = time

      colorAngle.value += animationSpeed.value * (delta / 16)
      if (colorAngle.value >= 360) {
        colorAngle.value -= 360
      }

      if (pulseAmplitude.value > 0) {
        const amplitudeFrequency = 0.005
        const sinFactor = pulseAmplitude.value * Math.sin(time * amplitudeFrequency)
        sphereScale.value = baseScale.value + sinFactor * pulseAmplitude.value
      } else {
        sphereScale.value = baseScale.value
      }

      requestAnimationFrame(animateSphere)
    }
    requestAnimationFrame(animateSphere)

    const sphereScale = ref(0.1)
    const sphereStyle = computed(() => {
      return {
        transform: `translateY(${targetX.value}px) scale(${sphereScale.value})`,
        filter: `hue-rotate(${colorAngle.value}deg)`,
        transition: 'transform 0.8s ease',
      }
    })

    // ============ 自动调整输入框高度 ============
    const textareaRef = ref(null)
    const autoResize = () => {
      const textarea = textareaRef.value
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }

    const onInputChange = () => {
      if (inputValue.value.trim() === '') {
        sphereState.value = 'noInput'
      } else {
        sphereState.value = 'typing'
      }
      applySphereState(sphereState.value)
      autoResize()
    }

    const onFocus = () => {
      // 可添加聚焦时的动画或效果
    }

    const applySphereState = (state) => {
      switch (state) {
        case 'noInput':
          animationSpeed.value = 0.02
          baseScale.value = 0.4
          targetX.value = 0
          pulseAmplitude.value = 0.5
          break

        case 'typing':
          animationSpeed.value = 0.2
          baseScale.value = 0.5
          targetX.value = 0
          pulseAmplitude.value = 0.5
          break

        case 'waiting':
          animationSpeed.value = 0.02
          baseScale.value = 1
          targetX.value = 300
          pulseAmplitude.value = 0.7
          break

        case 'answered':
          animationSpeed.value = 0.05
          baseScale.value = 0.7
          targetX.value = 0
          pulseAmplitude.value = 0
          break
      }
    }

    /** 工具函数 */
    /**
     * 将字符串按照指定字符数进行强制换行，并删除多余连续空格。
     * @param {string} str - 原始字符串
     * @param {number} chunkSize - 每隔多少字符插入一次换行
     * @param {number} maxSpaces - 最大允许连续空格数量（默认为 2）
     * @returns {string} - 处理后的字符串
     */
    function forceLineBreak(str, chunkSize = 115, maxSpaces = 2) {
      if (!str) return ''

      // 步骤 1: 删除多余连续空格
      const sanitizedStr = str.replace(new RegExp(` {${maxSpaces + 1},}`, 'g'), ' '.repeat(maxSpaces))

      // 步骤 2: 按 chunkSize 强制分段换行
      const re = new RegExp(`.{1,${chunkSize}}`, 'g')
      const chunks = sanitizedStr.match(re) || []
      return chunks.join('\n')
    }

    /** computed：每次 responseMessage 更新，自动返回“强制换行后”的文本 */
    const forcedBreakMessage = computed(() => forceLineBreak(responseMessage.value))

    // ============ 提交请求 ============
    const sendRequest = async () => {
      isThinking.value = true
      errorMessage.value = ''
      responseMessage.value = ''
      chartOption.value = null // 重置 chartOption
      tableData.value = []
      showReset.value = false

      sphereState.value = 'waiting'
      applySphereState('waiting')

      try {
        // 模拟 API 响应
        // 请根据实际情况取消注释并使用真实 API

        const prefixURL = localStorage.getItem('prefixURL') || ''
        const res = await fetch(`${prefixURL}/admin/ai/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: inputValue.value, mode: mode.value })
        })
        let json = await res.json()


        // // 根据当前模式模拟不同的响应
        // let json = {}
        // if (mode.value === 'text') {
        //   json = { status: 'success', message: null, data: { text: '这是一个测试文本' } }
        // } else if (mode.value === 'image') {
        //   json = { status: 'success', message: null, data: { imageUrl: 'https://via.placeholder.com/150' } }
        // } else if (mode.value === 'table') {
        //   json = {
        //     status: 'success',
        //     message: null,
        //     data: {
        //       tableColumns: ["商品名称", "库存数量", "最后更新时间"],
        //       tableData: [
        //         ["小米手机", 50, "2023-05-01 10:00:00"],
        //         ["华为平板", 120, "2023-05-02 11:30:00"],
        //         ["苹果手表", 30, "2023-05-03 09:20:00"]
        //       ]
        //     }
        //   }
        // } else if (mode.value === 'chart') {
        //   json = {
        //     "status": "success",
        //     "message": null,
        //     "data": {
        //       "chartOption": {
        //         "title": {
        //           "text": "年度销售与利润对比",
        //           "left": "center",
        //           "textStyle": {
        //             "color": "#fff",
        //             "fontSize": 20
        //           }
        //         },
        //         "tooltip": {
        //           "trigger": "axis",
        //           "axisPointer": {
        //             "type": "cross",
        //             "label": {
        //               "backgroundColor": "#6a7985"
        //             }
        //           }
        //         },
        //         "legend": {
        //           "data": ["销售额", "利润"],
        //           "left": "center",
        //           "top": "10%",
        //           "textStyle": {
        //             "color": "#fff"
        //           }
        //         },
        //         "xAxis": {
        //           "type": "category",
        //           "data": ["2023-01", "2023-02", "2023-03", "2023-04", "2023-05", "2023-06"],
        //           "axisLine": { "lineStyle": { "color": "#fff" } },
        //           "axisLabel": { "color": "#fff" }
        //         },
        //         "yAxis": [
        //           {
        //             "type": "value",
        //             "name": "销售额",
        //             "axisLine": { "lineStyle": { "color": "#fff" } },
        //             "axisLabel": { "color": "#fff" }
        //           },
        //           {
        //             "type": "value",
        //             "name": "利润",
        //             "axisLine": { "lineStyle": { "color": "#fff" } },
        //             "axisLabel": { "color": "#fff" },
        //             "position": "right"
        //           }
        //         ],
        //         "series": [
        //           {
        //             "name": "销售额",
        //             "type": "bar",
        //             "data": [150, 200, 250, 300, 350, 400],
        //             "itemStyle": { "color": "#FFDD33" }
        //           },
        //           {
        //             "name": "利润",
        //             "type": "line",
        //             "yAxisIndex": 1,
        //             "data": [30, 40, 50, 60, 70, 80],
        //             "itemStyle": { "color": "#FF6A6A" },
        //             "markPoint": {
        //               "data": [
        //                 { "type": "max", "name": "最大值" },
        //                 { "type": "min", "name": "最小值" }
        //               ]
        //             }
        //           }
        //         ],
        //         "toolbox": {
        //           "show": true,
        //           "orient": "vertical",
        //           "left": "right",
        //           "top": "center",
        //           "feature": {
        //             "dataZoom": { "show": true },
        //             "restore": { "show": true }
        //           }
        //         }
        //       }
        //     }
        //   }
        //
        // }

        if (json.status === 'success') {
          if (mode.value === 'text') {
            responseMessage.value = json.data.text || ''
          } else if (mode.value === 'image') {
            responseMessage.value = json.data.imageUrl || ''
          } else if (mode.value === 'table') {
            tableData.value = json.data.tableData || []
            tableColumns.value = json.data.tableColumns || ['列1', '列2', '列3']
          } else if (mode.value === 'chart') {
            chartOption.value = json.data.chartOption || null // 直接接收 chartOption
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

        if (!errorMessage.value) {
          sphereState.value = 'answered'
          applySphereState('answered')
        }
      }
    }

    // ============ 初始化图表 ============
    const initChart = () => {
      console.log("initChart called")
      console.log("chart.value:", chart.value)
      console.log("chartOption.value:", chartOption.value)

      if (!chartInstance.value && chart.value) {
        try {
          chartInstance.value = echarts.init(chart.value)
          console.log("chartInstance initialized")
        } catch (error) {
          console.error("ECharts initialization failed:", error)
        }
      }

      if (chartInstance.value && chartOption.value) {
        console.log("Setting chart option")
        chartInstance.value.setOption(chartOption.value)
      } else {
        console.log("chartInstance or chartOption is not available")
      }
    }

    // 添加一个 watcher 监听 chart.value 的变化
    watch(chart, async (newVal) => {
      if (newVal && mode.value === 'chart' && chartOption.value) {
        console.log("Chart container is now available")
        await nextTick()
        initChart()
      }
    })

    // 监听 chartOption 的变化
    watch(chartOption, async () => {
      console.log("chartOption changed:", chartOption.value)
      if (chartOption.value && mode.value === 'chart') {
        await nextTick()
        initChart()
      }
    })

    // ============ 重置 ============
    const resetSphere = () => {
      inputValue.value = ''
      errorMessage.value = ''
      responseMessage.value = ''
      chartOption.value = null // 重置 chartOption
      tableData.value = []
      showReset.value = false
      sphereState.value = 'noInput'
      applySphereState('noInput')

      // 销毁现有的 ECharts 实例
      if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
      }

      nextTick(() => {
        autoResize()
      })
    }

    // ============ 首次进入，默认 noInput ============
    applySphereState('noInput')

    // ============ 粒子效果 ============
    const particlesRef = ref(null)
    onMounted(async () => {
      // 初始化粒子效果或其他逻辑
      // 示例：初始化图表（如果有初始数据）
      if (mode.value === 'chart' && chartOption.value) {
        await nextTick()
        initChart()
      } else {
        console.error('Chart container is not mounted or no chart option.')
      }

      // 测试硬编码数据（可选）
      /*
      chartOption.value = {
        title: {
          text: '销售数据',
          left: 'center',
          textStyle: { color: '#fff' }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04'],
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
            data: [120, 150, 90, 200],
            type: 'bar',
            itemStyle: { color: '#FFDD33' }
          }
        ]
      }
      mode.value = 'chart'
      await nextTick()
      // initChart 会由 watcher 自动调用
      */
    })

    // 定义 resize 处理函数
    const handleResize = () => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    }

    // 添加监听器
    window.addEventListener('resize', handleResize)

    // 移除监听器并销毁 ECharts 实例
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      if (chartInstance.value) {
        chartInstance.value.dispose()
      }
    })

    // ============ 定义条件数组和计算属性 ============
    const widthConditions = [
      {
        condition: () => mode.value === 'text' && responseMessage.value.length > 200,
        width: '80%', // 使用百分比代替vw
      },
      {
        condition: () => mode.value === 'image' && responseMessage.value.length > 0,
        width: '70%',
      },
      {
        condition: () => mode.value === 'table' && tableData.value.length > 0,
        width: '90%',
      },
      {
        condition: () => mode.value === 'chart' && chartOption.value,
        width: '85%',
      },
      // 默认条件
      {
        condition: () => true,
        width: '25%', // 默认宽度设为25%
      },
    ]

    const computedWidth = computed(() => {
      for (const condition of widthConditions) {
        if (condition.condition()) {
          return condition.width
        }
      }
      return '25%' // 默认宽度
    })

    return {
      inputValue,
      isThinking,
      errorMessage,
      responseMessage,
      showReset,
      chartOption, // 导出 chartOption
      tableData,
      tableColumns,
      chart,
      sendRequest,
      resetSphere,
      onFocus,
      onInputChange,
      sphereStyle,
      particlesRef,
      textareaRef,
      mode,
      toggleMode,
      currentModeIcon,
      nextModeLabel,
      inputPlaceholder,
      computedWidth, // 导出计算宽度
      forcedBreakMessage
    }
  }
}
</script>

<style scoped>
/* 全局 box-sizing */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 过渡效果 */
.feedback-enter-active,
.feedback-leave-active {
  transition: all 0.5s ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.feedback-enter-to,
.feedback-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.main {
  padding: 30px;
  margin-left: 215px;
  margin-top: -60px;
  margin-right: 10px;
  width: 87.6% !important; /* 使用百分比宽度，避免固定宽度导致布局问题 */
  max-width: 87.6% !important; /* 限制反馈部分的最大宽度 */
  min-height: 100vh; /* 确保最小高度 */
  position: relative;
  display: flex;
  justify-content: center; /* 居中对齐 */
  align-items: flex-start; /* 允许内容向下扩展 */
  transition: all 0.5s ease;
  overflow-y: hidden; /* 启用垂直滚动条 */
}


/* 动态背景 */
.bg {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(
      135deg,
      rgba(15, 32, 39, 0.8),
      rgba(32, 58, 67, 0.8),
      rgba(44, 83, 100, 0.8)
  );
  /* 应用 hue-rotate 动画 */
  animation: hueRotateAnimation 40s linear infinite;
}

/* 定义 hue-rotate 动画 */
@keyframes hueRotateAnimation {
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(360deg);
  }
}

/* ====== 容器 ====== */
.container {
  display: flex;
  flex-direction: column;
  align-items: center; /* 居中对齐子元素 */
  width: 100%; /* 占满父容器宽度 */
  max-width: none; /* 移除最大宽度限制 */
  z-index: 1;
}

/* ====== 球体 ====== */
.sphere {
  width: 120px;
  height: 120px;
  border-radius: 50%;

  background: radial-gradient(circle, #fdd45c, #fa8b0c);
  box-shadow: 0 6px 25px rgba(255, 140, 0, 0.5);
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 50px;
}

/* ====== 表单区域 ====== */
.form-box {
  max-width: 100%; /* 限制反馈部分的最大宽度 */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  width: 25%; /* 默认宽度，与 computedWidth 默认值一致 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  text-align: center;
  margin: 10px auto; /* 使用 auto 左右外边距以居中 */
  transition: width 0.5s ease; /* 平滑过渡宽度 */
}

/* h2 样式 */
h2 {
  color: #fff;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 输入组容器 */
.input-group {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

/* ====== 输入框 ====== */
.input {
  flex: 1; /* 让输入框占据剩余空间 */
  padding: 12px 50px 12px 12px; /* 为按钮留出空间 */
  margin: 10px 0;
  border: 2px solid transparent;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.6);
  color: #333;
  font-size: 16px;
  outline: none;
  transition: border 0.3s, box-shadow 0.3s;
  resize: none;
  overflow: hidden;
  word-wrap: break-word; /* 确保长单词换行 */
}

.input:focus {
  border-color: #ffb347;
  box-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
}

/* 模式切换按钮 */
.mode-toggle-button {
  flex: 0 0 40px; /* 固定宽度 */
  height: 40px;
  margin-left: -50px; /* 将按钮叠加在输入框右侧 */
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #fff;
  transition: color 0.3s;
  z-index: 2; /* 确保按钮在输入框上方 */
}

.mode-toggle-button:hover {
  color: #ffb347;
}

/* 通用按钮样式 */
.action-button {
  width: 100%;
  padding: 12px;
  background-color: #ffb347;
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
  background-color: #fc8d34;
  transform: scale(1.05);
}

.action-button:disabled {
  background-color: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}

/* 重置按钮 */
.reset-btn {
  background-color: #47b6ff;
  margin-top: 0;
}

.reset-btn:hover {
  background-color: #2691e9;
}

/* ====== 图表容器 ====== */
.chart-container {
  max-width: 100%; /* 限制反馈部分的最大宽度 */
  width: 100%; /* 占满反馈区域的宽度 */
  height: 300px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.5s ease; /* 添加过渡效果 */
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
}

/* 添加表格显示动画 */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}


/* 鼠标悬停时的效果 */
.table-result tr:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.table-result table {
  width: 100%; /* 表格占满反馈区域的宽度 */
  border-collapse: collapse;
  table-layout: auto; /* 自动调整列宽 */
  animation: fadeIn 0.5s ease-out;
  opacity: 1;
  overflow-y: hidden; /* 隐藏垂直滚动条 */

}

.table-result th,
.table-result td {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.table-result th {
  background-color: rgba(255, 255, 255, 0.2);
}

.image-result img {
  max-width: 100%; /* 限制反馈部分的最大宽度 */
  width: 100%; /* 图像占满反馈区域的宽度 */
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.feedback-section {
  margin-top: 10px;
  max-width: 100%; /* 限制反馈部分的最大宽度 */
  overflow-x: auto; /* 隐藏水平溢出 */
  overflow-y: hidden; /* 隐藏垂直溢出 */
}

.feedback {
  margin-top: 10px;
  max-width: 100%; /* 限制反馈部分的最大宽度 */
  overflow-x: auto; /* 隐藏水平溢出 */
}

.table-result table {
  max-width: 100%; /* 限制反馈部分的最大宽度 */
  width: 100%; /* 确保表格不会超出父容器 */
  table-layout: fixed; /* 固定表格布局，避免内容撑开 */
  word-wrap: break-word; /* 确保长内容换行 */
  overflow-y: hidden; /* 隐藏垂直滚动条 */
}

.image-result img {
  max-width: 100%; /* 限制图片宽度 */
  height: auto; /* 保持图片比例 */
}

.ai-reply {
  margin-top: 10px;
  /* 如果希望内容在容器宽度 100% 之后自动折行，且不要超出容器边界 */
  max-width: 100% !important;
  max-height: 500px;

  /* 如果你还想给回复一个最大高度并能滚动 */
  overflow-y: auto;
  overflow-x: auto;
}
</style>
