<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>Welcome to the Admin Dashboard</h2>
      <p>这里是后台管理的主控制面板</p>
    </div>

    <!-- 原有异步加载卡片 -->
    <div class="original-stats" v-if="loading">
      <div class="loading-spinner">Loading...</div>
    </div>
    <div class="original-stats" v-else>
      <div class="stats-cards">
        <div class="stat-card" v-for="(item, index) in stats" :key="index">
          <h3>{{ item.title }}</h3>
          <p>{{ item.value }}</p>
        </div>
      </div>
    </div>

    <!-- 新增：健康度指数区域（整合系统稳健性数据） -->
    <div class="health-index-section animate-fade-in">
      <h3>系统服务健康度指数</h3>
      <p class="health-desc">综合用户满意度、司机准点率、车次完成率、系统错误率等指标计算得出</p>
      <div class="health-index-content">
        <!-- 左侧：环形图 -->
        <div class="health-index-left">
          <vue-apex-charts type="radialBar" height="250" :options="healthIndexOptions" :series="healthIndexSeries" />
        </div>
        <!-- 中间：评分说明与扣分原因 -->
        <div class="health-index-middle">
          <p class="explanation-title">评分说明</p>
          <ul class="deduction-reasons">
            <p>            用户满意度较上周下降 <span class="highlight">3%</span></p>
            <p>            本周出现 <span class="highlight">2次致命错误</span> 影响得分</p>
            <p>            司机准点率略有下降</p>



          </ul>
        </div>
        <!-- 右侧：综合分数与系统稳健性数据 -->
        <div class="health-index-right">
          <p class="health-score">{{ healthIndexScore }}<span class="score-unit">/100</span></p>
          <p class="health-status">{{ healthIndexStatus }}</p>
          <div class="system-stability-wrapper">
            <h4>系统稳健性(24小时)</h4>
            <div class="stability-cards">
              <div class="stability-card error" v-if="systemErrors > 0">
                <h4>致命错误次数</h4>
                <p>{{ systemErrors }}</p>
                <p class="stability-note">请尽快查看日志！</p>
              </div>
              <div class="stability-card warning">
                <h4>警告次数</h4>
                <p>{{ systemWarnings }}</p>
                <p class="stability-note" v-if="systemWarnings > 10">警告过多，请关注。</p>
              </div>
              <div class="stability-card ok" v-if="systemErrors === 0 && systemWarnings <= 5">
                <h4>系统状态</h4>
                <p>稳定✔</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户满意度展示 -->
    <div class="satisfaction-section">
      <h3>用户满意度</h3>
      <div class="satisfaction-indicator">
        <div class="satisfaction-icon" :style="{ color: satisfactionColor }">
          <span v-html="satisfactionIcon"></span>
        </div>
        <div class="satisfaction-value">{{ userSatisfaction }}%</div>
      </div>
      <p class="satisfaction-desc">最近用户满意度趋势（纯模拟数据）</p>
      <vue-apex-charts type="line" height="200" :options="satisfactionChartOptions" :series="satisfactionSeries"/>
    </div>

    <!-- 活跃用户展示（日报、周报） -->
    <div class="active-users-section">
      <h3>最近活跃用户统计</h3>
      <div class="active-charts">
        <div class="chart-container">
          <h4>日活用户 (DAU)</h4>
          <vue-apex-charts type="area" height="200" :options="dailyActiveOptions" :series="dailyActiveSeries"/>
        </div>
        <div class="chart-container">
          <h4>周活用户 (WAU)</h4>
          <vue-apex-charts type="bar" height="200" :options="weeklyActiveOptions" :series="weeklyActiveSeries"/>
        </div>
      </div>
    </div>

    <!-- 平台收入统计 -->
    <div class="revenue-section">
      <h3>平台收入 (模拟数据)</h3>
      <vue-apex-charts type="bar" height="200" :options="revenueOptions" :series="revenueSeries"/>
      <p class="revenue-desc">最近一周的日收入情况（纯模拟）</p>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useApiBaseStore} from "@/stores/network";
import VueApexCharts from 'vue3-apexcharts';

// 原有数据与逻辑
const apiBaseStore = useApiBaseStore();
const stats = ref([
  {title: '用户人数', value: 'Loading...'},
  {title: '司机人数', value: 'Loading...'},
  {title: '管理员人数', value: 'Loading...'},
]);

const loading = ref(true);
const fetchStats = async () => {
  try {
    const response = await fetch(apiBaseStore.baseUrl + '/admin_home/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    const data = await response.json();
    stats.value = [
      {title: 'Total Users', value: data.total_users},
      {title: 'Total Drivers', value: data.total_drivers},
      {title: 'Total Admins', value: data.total_admins},
    ];
    systemErrors = data.system_errors;
    systemWarnings = data.system_warnings;

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// 用户满意度数据
const userSatisfaction = 72;
const satisfactionColor = userSatisfaction > 80 ? '#2ecc71' : (userSatisfaction > 50 ? '#f1c40f' : '#e74c3c');
const satisfactionIcon = userSatisfaction > 80 ? '😊' : (userSatisfaction > 50 ? '😐' : '😢');
const satisfactionSeries = ref([{name: '满意度', data: [65, 70, 72, 68, 75, 78, 72]}]);
const satisfactionChartOptions = ref({
  chart: {type: 'line', toolbar: {show: false}},
  colors: [satisfactionColor],
  stroke: {width: 3, curve: 'smooth'},
  xaxis: {categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']},
  yaxis: {max: 100, tickAmount: 5},
  dataLabels: {enabled: false},
  grid: {show: true}
});

// 活跃用户数据
const dailyActiveSeries = ref([{name: 'DAU', data: [120, 130, 150, 140, 160, 180, 175]}]);
const dailyActiveOptions = ref({
  chart: {type: 'area', toolbar: {show: false}},
  colors: ['#3498db'],
  xaxis: {categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']},
  dataLabels: {enabled: false},
  stroke: {curve: 'smooth', width: 2},
  fill: {
    type: 'gradient',
    gradient: {shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [20, 100]}
  },
});

const weeklyActiveSeries = ref([{name: 'WAU', data: [800, 850, 820, 900, 950, 1000, 980]}]);
const weeklyActiveOptions = ref({
  chart: {type: 'bar', toolbar: {show: false}},
  colors: ['#9b59b6'],
  xaxis: {categories: ['Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'Week7']},
  dataLabels: {enabled: false},
  plotOptions: {bar: {borderRadius: 4, horizontal: false}}
});

// 收入数据
const revenueSeries = ref([{name: '收入(元)', data: [2000, 2500, 2700, 3000, 2800, 3200, 3500]}]);
const revenueOptions = ref({
  chart: {type: 'bar', toolbar: {show: false}},
  colors: ['#e67e22'],
  xaxis: {categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']},
  dataLabels: {enabled: false},
  plotOptions: {bar: {borderRadius: 4, columnWidth: '45%'}}
});

// 系统稳健性数据
let systemErrors = 0;
let systemWarnings = 0;

// 健康度指数
const healthIndexScore = 85;
let healthIndexStatus = '非常良好';
if (healthIndexScore < 60) healthIndexStatus = '有待改善';
else if (healthIndexScore < 80) healthIndexStatus = '良好';

const healthIndexSeries = ref([healthIndexScore]);
const healthIndexOptions = ref({
  chart: {type: 'radialBar', toolbar: {show: false}},
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 270,
      hollow: {margin: 0, size: '60%', background: '#fff'},
      track: {background: '#e7e7e7', strokeWidth: '100%', margin: 0},
      dataLabels: {show: false}
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: "horizontal",
      shadeIntensity: 0.5,
      gradientToColors: [healthIndexScore > 80 ? '#2ecc71' : (healthIndexScore > 60 ? '#f1c40f' : '#e74c3c')],
      inverseColors: true,
      stops: [0, 100]
    }
  },
  stroke: {lineCap: 'round'},
  labels: ['Health Index']
});


onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard-container {
  margin-left: 220px;
  margin-top: 80px;
  padding: 20px;
  background: #f5f7fa;
  font-family: 'Microsoft Yahei', sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.dashboard-header p {
  font-size: 14px;
  color: #7f8c8d;
}

/* loading样式 */
.loading-spinner {
  text-align: center;
  font-size: 18px;
  color: #999;
  padding: 20px;
}

/* 数据统计卡片 */
.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center; /* 将统计卡片在水平方向居中 */
}

.stat-card {
  background: #fff;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center; /* 卡片内部文字居中 */
  flex: 0 0 240px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #34495e;
}

.stat-card p {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

/* 健康度指数区域 */
.health-index-section {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  padding: 30px;
  margin-top: 50px;
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  opacity: 0;
}

.health-index-section h3 {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.health-desc {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.health-index-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  flex-wrap: wrap;
}

/* 左侧图表区域 */
.health-index-left {

}

.health-index-left:hover {
  transform: scale(1.05);
}

/* 中间说明区域 */
.health-index-middle {
  margin-right: 60px; /* 中间与右侧之间更大的空隙 */
}

.explanation-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
}

.deduction-reasons {
  list-style: none;
  padding: 0;
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.8;
}

.deduction-reasons li {
  position: relative;
  padding-left: 10px;
}

.deduction-reasons li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 4px;
  height: 4px;
  background: #2c3e50;
  border-radius: 50%;
}

.highlight {
  color: #e74c3c;
  font-weight: 600;
}

/* 右侧分数与稳健性 */
.health-index-right {

}

.health-score {
  font-size: 40px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 10px;
  position: relative;
}

.score-unit {
  font-size: 16px;
  font-weight: 400;
  color: #7f8c8d;
  margin-left: 5px;
}

.health-status {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  padding: 5px 10px;
  border-radius: 20px;
  background: rgba(46, 204, 113, 0.1);
  display: inline-block;
  margin-bottom: 20px;
}

/* 系统稳健性（已整合至右侧） */
.system-stability-wrapper {
  text-align: center;
}

.system-stability-wrapper h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.stability-cards {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.stability-card {
  flex: 0 0 100px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  font-size: 12px;
}

.stability-card:hover {
  transform: translateY(-3px);
}

.stability-card h4 {
  margin-bottom: 5px;
  font-size: 12px;
  color: #2c3e50;
}

.stability-card p {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 5px;
}

.stability-note {
  font-size: 10px;
  color: #7f8c8d;
}

.stability-card.error {
  border-left: 3px solid #e74c3c;
}

.stability-card.warning {
  border-left: 3px solid #f1c40f;
}

.stability-card.ok {
  border-left: 3px solid #2ecc71;
}

/* 用户满意度 */
.satisfaction-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.satisfaction-section h3 {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.satisfaction-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.satisfaction-icon {
  font-size: 24px;
  margin-right: 10px;
}

.satisfaction-value {
  font-size: 24px;
  font-weight: 700;
}

.satisfaction-desc {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 10px;
}

/* 活跃用户统计 */
.active-users-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.active-users-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
}

.active-charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-container {
  min-width: 240px;
  flex: 1;
}

.chart-container h4 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

/* 平台收入 */
.revenue-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.revenue-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
}

.revenue-desc {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 10px;
}

/* 响应式微调 */
@media (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    margin-top: 60px;
  }

  .health-index-content {
    flex-direction: column;
    align-items: center;
  }

  .health-index-left,
  .health-index-right {
    margin-bottom: 20px;
  }
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease forwards;
}
</style>
