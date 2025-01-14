<template>
  <div class="dashboard-page">

    <!-- 顶部标题，可替代原先的 dashboard-header -->
    <header class="dashboard-topbar">
      <h1>管理后台首页</h1>
      <p>欢迎来到管理面板</p>
    </header>

    <!-- 主内容区域 -->
    <main class="dashboard-content">

      <!-- 1. 统计概览卡片（用户数、司机数、管理员数等） -->
      <section class="overview-section">
        <div class="loading" v-if="loading">Loading stats...</div>
        <div class="stats-cards" v-else>
          <div class="stat-card" v-for="(item, index) in stats" :key="index">
            <h3>{{ item.title }}</h3>
            <p>{{ item.value }}</p>
          </div>
        </div>
      </section>

      <!-- 2. 健康度指数 + 系统稳健性(整合到一个卡片) -->
      <section class="health-system-section" v-if="!loading">
        <article class="health-card">
          <header>
            <h2>系统服务健康度</h2>
          </header>
          <div class="health-content">
            <!-- 环形图 -->
            <div class="health-chart">
              <vue-apex-charts
                  type="radialBar"
                  height="200"
                  :options="healthIndexOptions"
                  :series="healthIndexSeries"
              />
            </div>
            <!-- 分数与状态 -->
            <div class="health-score-block">
              <div class="score-display">
                <span class="big-score">{{ healthIndexScore }}</span>
                <span class="score-text">/100</span>
              </div>
              <div class="health-status">
                {{ healthIndexStatus }}
              </div>
            </div>
          </div>

          <!-- 扣分原因 + 系统稳健性 -->
          <div class="health-extra">
            <div class="deduction-reasons-card">
              <h4>扣分原因</h4>
              <ul>
                <li v-for="(reason, idx) in deductionReasons" :key="idx">
                  {{ reason.description }}
                  <span v-if="reason.highlight" class="highlight">{{ reason.highlight }}</span>
                </li>
              </ul>
            </div>
            <div class="system-stability-card">
              <h4>系统稳健性 (24h)</h4>
              <div class="stability-items">
                <div class="stability-item error" v-if="systemErrors > 0">
                  <h5>致命错误</h5>
                  <p>{{ systemErrors }}</p>
                </div>
                <div class="stability-item warning">
                  <h5>警告次数</h5>
                  <p>{{ systemWarnings }}</p>
                </div>
                <div class="stability-item ok" v-if="systemErrors === 0 && systemWarnings <= 5">
                  <h5>状态</h5>
                  <p>稳定✔</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- 3. 用户满意度与活跃用户两个图表并排展示 -->
      <section class="charts-row" v-if="!loading">
        <!-- 左侧：用户满意度 -->
        <article class="chart-card satisfaction-card">
          <h3>用户满意度</h3>
          <div class="satisfaction-indicator">
            <span class="icon" :style="{ color: satisfactionColor }" v-html="satisfactionIcon"></span>
            <span class="value">{{ userSatisfaction }}%</span>
          </div>
          <vue-apex-charts
              type="line"
              height="200"
              :options="satisfactionChartOptions"
              :series="satisfactionSeries"
          />
        </article>

        <!-- 右侧：活跃用户 -->
        <article class="chart-card activeusers-card">
          <h3>活跃用户统计</h3>
          <div class="active-charts-group">
            <div class="chart-box">
              <h4>最近七日(Daily)</h4>
              <vue-apex-charts
                  type="area"
                  height="150"
                  :options="dailyActiveOptions"
                  :series="dailyActiveSeries"
              />
            </div>
            <div class="chart-box">
              <h4>最近12小时(Hourly)</h4>
              <vue-apex-charts
                  type="bar"
                  height="150"
                  :options="weeklyActiveOptions"
                  :series="weeklyActiveSeries"
              />
            </div>
          </div>
        </article>
      </section>

      <!-- 4. 平台收入统计 -->
      <section class="revenue-section" v-if="!loading">
        <div class="revenue-card">
          <h3>平台收入</h3>
          <vue-apex-charts
              type="bar"
              height="200"
              :options="revenueOptions"
              :series="revenueSeries"
          />
          <p class="desc">最近一周的日收入情况</p>
        </div>
      </section>

    </main>

  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import VueApexCharts from 'vue3-apexcharts';


const stats = ref([
  {title: '用户人数', value: 'Loading...'},
  {title: '司机人数', value: 'Loading...'},
  {title: '管理员人数', value: 'Loading...'},
]);

const deductionReasons = ref([]);

const loading = ref(true);
const fetchStats = async () => {
  try {
    const prefixURL = localStorage.getItem("prefixURL"); // 使用本地存的url
    const response = await fetch(prefixURL + '/admin_home/dashboard');
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

    healthIndexSeries.value = [data.health_index_score];

    healthIndexScore = data.health_index_score;

    lastSevenDays = data.last_seven_days;
    lastTwentyFourHours = data.last_twenty_four_hours;
    lastSevenDays[6] = '今天';

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 1
    userSatisfaction = data.user_satisfaction;
    satisfactionColor = userSatisfaction > 80 ? '#2ecc71' : (userSatisfaction > 50 ? '#f1c40f' : '#e74c3c');
    satisfactionIcon = userSatisfaction > 80 ? '😊' : (userSatisfaction > 50 ? '😐' : '😢');
    await wait(100);
    satisfactionSeries.value = [{name: '满意度', data: data.user_satisfaction_series}]
    satisfactionChartOptions.value = {
      chart: {type: 'line', toolbar: {show: false}},
      colors: [satisfactionColor],
      stroke: {width: 3, curve: 'smooth'},
      xaxis: {categories: lastSevenDays},
      yaxis: {max: 100, tickAmount: 5},
      dataLabels: {enabled: false},
      grid: {show: true}
    };

    deductionReasons.value = data.deduction_reasons;

    healthIndexStatus = '非常良好';
    if (healthIndexScore < 60) healthIndexStatus = '有待改善';
    else if (healthIndexScore < 80) healthIndexStatus = '良好';

    // 2
    dailyActiveSeries.value =  [{name: 'DAU', data: data.daily_active_series}];
    // 我知道你很急但你先别急

    await wait(100);

    dailyActiveOptions = ref({
      chart: {type: 'area', toolbar: {show: false}},
      colors: ['#3498db'],
      xaxis: {categories: lastSevenDays},
      dataLabels: {enabled: false},
      stroke: {curve: 'smooth', width: 2},
      fill: {
        type: 'gradient',
        gradient: {shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [20, 100]}
      },
    })


    // // 3
    weeklyActiveSeries.value = [{name: 'HAU', data: data.weekly_active_series}];
    // 我知道你很急但你先别急
    await wait(100);
    weeklyActiveOptions.value = {
      chart: {type: 'bar', toolbar: {show: false}},
      colors: ['#9b59b6'],
      xaxis: {categories: lastTwentyFourHours},
      dataLabels: {enabled: false},
      plotOptions: {bar: {borderRadius: 4, horizontal: false}}
    };


    // // 4
    revenueSeries.value = [{name: '收入(元)', data: data.revenue_series}];
    // 我知道你很急但你先别急
    await wait(100);
    revenueOptions.value = {
      chart: {type: 'bar', toolbar: {show: false}},
      colors: ['#e67e22'],
      xaxis: {categories: lastSevenDays},
      dataLabels: {enabled: false},
      plotOptions: {bar: {borderRadius: 4, columnWidth: '45%'}}
    };



  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// 用户满意度数据
let userSatisfaction = 100;
let lastSevenDays = ['六天前', '五天前', '四天前', '三天前', '两天前', '一天前', '当天'];
let lastTwentyFourHours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',  '11:00'];


let satisfactionColor = userSatisfaction > 80 ? '#2ecc71' : (userSatisfaction > 50 ? '#f1c40f' : '#e74c3c');
let satisfactionIcon = userSatisfaction > 80 ? '😊' : (userSatisfaction > 50 ? '😐' : '😢');
let satisfactionSeries = ref([{name: '满意度', data: [65, 70, 72, 68, 75, 78, 72]}]);
let satisfactionChartOptions = ref({
  chart: {type: 'line', toolbar: {show: false}},
  colors: [satisfactionColor],
  stroke: {width: 3, curve: 'smooth'},
  xaxis: {categories: lastSevenDays},
  yaxis: {max: 100, tickAmount: 5},
  dataLabels: {enabled: false},
  grid: {show: true}
});

// 活跃用户数据
let dailyActiveSeries = ref([{name: 'DAU', data: [120, 130, 150, 140, 160, 180, 175]}]);
let dailyActiveOptions = ref({
  chart: {type: 'area', toolbar: {show: false}},
  colors: ['#3498db'],
  xaxis: {categories: lastSevenDays},
  dataLabels: {enabled: false},
  stroke: {curve: 'smooth', width: 2},
  fill: {
    type: 'gradient',
    gradient: {shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [20, 100]}
  },
});

let weeklyActiveSeries = ref([{name: 'WAU', data: [800, 850, 820, 900, 950, 1000, 980, 1, 2, 3, 44, 1]}]);
let weeklyActiveOptions = ref({
  chart: {type: 'bar', toolbar: {show: false}},
  colors: ['#9b59b6'],
  xaxis: {categories: lastTwentyFourHours},
  dataLabels: {enabled: false},
  plotOptions: {bar: {borderRadius: 4, horizontal: false}}
});

// 收入数据
let revenueSeries = ref([{name: '收入(元)', data: [2000, 2500, 2700, 3000, 2800, 3200, 3500]}]);
let revenueOptions = ref({
  chart: {type: 'bar', toolbar: {show: false}},
  colors: ['#e67e22'],
  xaxis: {categories: lastSevenDays},
  dataLabels: {enabled: false},
  plotOptions: {bar: {borderRadius: 4, columnWidth: '45%'}}
});

// 系统稳健性数据
let systemErrors = 0;
let systemWarnings = 0;

// 健康度指数
let healthIndexScore = 100;
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

const saveScrollPosition = () => {
  localStorage.setItem('scrollPosition', window.scrollY);
};



onMounted(async () => {
  await fetchStats();
  // 页面加载后恢复滚动位置
  const savedPosition = localStorage.getItem('scrollPosition');
  if (savedPosition) {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await wait(50);
    window.scrollTo(0, parseInt(savedPosition, 10));
  }

  window.addEventListener('beforeunload', saveScrollPosition);
});

// 路由钩子代替 onUnmounted
onBeforeUnmount(() => {
  saveScrollPosition();
  window.removeEventListener('beforeunload', saveScrollPosition);
});
</script>


<style scoped>
/* 页面根容器 */
.dashboard-page {
  background: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: 200px;
  margin-top: -20px;
  margin-right: -10px;
}

/* 顶部标题 */
.dashboard-topbar {
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  text-align: center;
  margin-left: 550px;
  margin-right: 550px;
  margin-top: 10px;
}
.dashboard-topbar h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #2c3e50;
}
.dashboard-topbar p {
  font-size: 14px;
  color: #7f8c8d;
}

/* 主内容区域 */
.dashboard-content {
  flex: 1;
  padding: 20px;
}

/* Loading 状态 */
.loading {
  text-align: center;
  font-size: 16px;
  color: #999;
  margin: 20px 0;
}

/* 1. 统计概览卡片 */
.overview-section {
  margin-bottom: 20px;
}
.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
.stat-card {
  background: #fff;
  padding: 20px;
  width: 220px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}
.stat-card h3 {
  font-size: 16px;
  color: #34495e;
  margin-bottom: 10px;
}
.stat-card p {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

/* 2. 健康度 + 系统稳健性 */
.health-system-section {
  margin-bottom: 20px;
  margin-left: 250px;
  margin-right: 250px;
}
.health-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.health-card header h2 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}
.health-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.health-chart {
  flex: 0 0 200px;
  text-align: center;
}
.health-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.score-display {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}
.big-score {
  font-size: 40px;
  font-weight: 700;
  color: #2c3e50;
  margin-right: 5px;
}
.score-text {
  font-size: 16px;
  color: #7f8c8d;
}
.health-status {
  font-size: 14px;
  background: rgba(46,204,113,0.1);
  padding: 4px 10px;
  border-radius: 16px;
  color: #2c3e50;
}
/* 扣分原因 + 稳健性 */
.health-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
.deduction-reasons-card,
.system-stability-card {
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
  flex: 0 0 280px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.deduction-reasons-card h4,
.system-stability-card h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #34495e;
}
.deduction-reasons-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1.8;
}
.deduction-reasons-card li {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 6px;
}
.highlight {
  color: #e74c3c;
  margin-left: 5px;
}
.system-stability-card .stability-items {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.stability-item {
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border-radius: 6px;
  padding: 10px;
  flex: 0 0 80px;
  text-align: center;
}
.stability-item.error {
  border-left: 4px solid #e74c3c;
}
.stability-item.warning {
  border-left: 4px solid #f1c40f;
}
.stability-item.ok {
  border-left: 4px solid #2ecc71;
}
.stability-item h5 {
  font-size: 12px;
  color: #34495e;
  margin-bottom: 5px;
}
.stability-item p {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}

/* 3. 用户满意度 & 活跃用户图表并排 */
.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}
.chart-card {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  padding: 20px;
}
.chart-card h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #34495e;
}
.satisfaction-card .satisfaction-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.satisfaction-indicator .icon {
  font-size: 24px;
  margin-right: 10px;
}
.satisfaction-indicator .value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}
.active-charts-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}
.chart-box {
  flex: 1;
}
.chart-box h4 {
  font-size: 14px;
  margin-bottom: 5px;
  color: #7f8c8d;
}

/* 4. 收入统计 */
.revenue-section {
  margin-bottom: 20px;
}
.revenue-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  padding: 20px;
}
.revenue-card h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #34495e;
}
.revenue-card .desc {
  margin-top: 10px;
  font-size: 12px;
  color: #7f8c8d;
}

/* 响应式 */
@media (max-width: 768px) {
  .health-content {
    flex-direction: column;
  }
  .health-extra {
    flex-direction: column;
  }
  .charts-row {
    flex-direction: column;
  }
  .active-charts-group {
    flex-direction: column;
  }
}
</style>

