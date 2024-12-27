<script setup>
import MapComponent from '@/views/driver_1/components/MapComponent.vue';
import SafetyAlertButton from '@/views/driver_1/components/SafetyAlertButton.vue';
import SelfScanButton from '@/views/driver_1/components/SelfScanButton.vue';
//import PaymentCount from '@/views/driver_1/components/PaymentCount.vue';
//import CallCount from '@/views/driver_1/components/CallCount.vue';
import ErrorBoundary from '@/views/driver_1/components/ErrorBoundary.vue'; // 通用错误边界组件

//import callSim from '@/views/schoolbus-simulation/components/call-sim.vue';

//import QRCodeScanner from '@/views/driver_1/components/QRCodeScanner.vue'; // 通用错误边界组件
import ShowDrewButton from './components/ShowDrewButton.vue';
import EndWork from './components/EndWork.vue';
import { ref,} from 'vue';

const mapComponent= ref(null);
const endWork = ref(null);

// const toggleStations = () => {
//   mapComponent.value.toggleStations(); // 直接调用 MapComponent 中的方法
// };

// const toggleRoutes = () => {
//   mapComponent.value.toggleRoutes(); // 直接调用 MapComponent 中的方法
// };

const openForm = () => {
  endWork.value.openForm(); // 直接调用 endWork 中的方法
};

const showDriverInfo = () => {
  mapComponent.value.showDriverInfo(); // 直接调用 MapComponent 中的方法
};

</script>

<template>
 <div class="common-layout">
    <el-container style="height: 100%;">
      <el-header class="top-bar" style="background: linear-gradient(to right, rgb(113, 65, 168), rgba(44, 114, 241, 1)); opacity: 50%; display: flex; align-items: center;">
        <span style="font-size: 20px;">在线 <strong>1</strong> 人</span>
        <span style="font-size: 20px;">中山大学 (1号车)</span>
      </el-header>
      <el-container>
        <el-aside width="190px" >
          <el-col gutter="20px">
        <ErrorBoundary>
          <SelfScanButton />
        </ErrorBoundary>
        <ErrorBoundary>
          <SafetyAlertButton />
        </ErrorBoundary>

        <ErrorBoundary>
          <el-button @click="openForm" type="danger" round style="height: 60px; width: 180px; margin: 10px;"><p style="font-size: 20px;">下班</p></el-button>
        </ErrorBoundary>
        <ErrorBoundary>
          <el-button @click="showDriverInfo" type="danger" round style="height: 60px; width: 180px; margin: 10px;"><p style="font-size: 20px;">我的</p></el-button>
        </ErrorBoundary>


        <ErrorBoundary>
          <ShowDrewButton />
        </ErrorBoundary>
        
        
      </el-col>

        </el-aside>
        <el-main>     
          <MapComponent ref="mapComponent"/>
          <EndWork ref="endWork" />     
        </el-main>
      </el-container>
    </el-container>
  </div>

  <div id="app">
    <!-- 顶部栏
    <div class="top-bar">
      <span>在线 <strong>1</strong> 人</span>
      <span>中山大学 (1号车)</span>
    </div> -->

    <!-- 主内容
    <div class="wrapper">
      功能按钮
      <div class="button-container">
        <ErrorBoundary>
          <SelfScanButton />
        </ErrorBoundary>
        <ErrorBoundary>
          <SafetyAlertButton />
        </ErrorBoundary>
        <ErrorBoundary>
          <ShowDrewButton />
        </ErrorBoundary>
      </div>

      <div class="map-container">
        <MapComponent />
      </div>
    </div> -->


    <!-- 信息部分 -->
    <!-- <div class="info-section"> -->
      <!-- <el-row :gutter="50">
        <el-col :span="6">
          <PaymentCount />
        </el-col>
        
        <el-col :span="6">
          <ErrorBoundary>
          <CallCount />
        </ErrorBoundary>
        </el-col>
        <el-col :span="6">
          <ErrorBoundary>
          <callSim />
        </ErrorBoundary>
        </el-col>
        <el-rol :span="6">
          <ErrorBoundary>
          <QRCodeScanner />
        </ErrorBoundary>
        </el-rol>
      </el-row> -->
      <!-- 付款人数 -->
      <!-- <div class="stats-container">
        <PaymentCount />
      </div> -->

      <!-- 呼叫人数 -->
      <!-- <div class="stats-container">
        <ErrorBoundary>
          <CallCount />
        </ErrorBoundary>
      </div>
      <div class="stats-container">
        <ErrorBoundary>
          <callSim />
        </ErrorBoundary>
      </div>
      <div class="stats-container">
        <ErrorBoundary>
          <QRCodeScanner />
        </ErrorBoundary>
      </div> -->
    <!-- </div> -->
  </div>
</template>


<style scoped>
/* 顶部栏样式 */
.top-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #2c3e50;
  color: #fff;
  font-size: 16px;
  align-items: center;
}

/* 外层容器，使用 flex 布局 */
.wrapper {
  display: flex;
  width: 100%;
  height: 60vh;
  /* 满屏高度 */
}

/* 按钮容器，宽度占 20% */
.button-container {
  width: 10%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-start;
}

/* 地图容器样式 */
.map-container {
  width: 90%;
  height: 60vh;
  /* 占屏幕高度的 60% */
  margin: 0;
  overflow: hidden;
  background-color: #f0f0f0;
  position: relative;
  border-bottom: 2px solid #ddd;
}

/* 信息部分样式 */
.info-section {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-container {
  flex: 1;
  text-align: center;
  margin: 0 20px;
}

.stats-container h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.stats-container p {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

/* 底部栏样式 */
.footer-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f8f8;
  border-top: 1px solid #ddd;
}

.footer-bar button {
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin: 0 10px;
  transition: background-color 0.3s;
}

.footer-bar button:hover {
  background-color: #0056b3;
}

/* 驾驶员生成系统样式 */
.driver-section {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
}

.driver-section h1 {
  font-size: 24px;
  color: #4a4a4a;
  margin-bottom: 20px;
}

@media (max-width: 768px) {

  /* 响应式地图高度 */
  .map-container {
    height: 50vh;
  }

  /* 信息部分在小屏幕时调整为垂直布局 */
  .info-section {
    flex-direction: column;
  }

  .stats-container {
    margin: 10px 0;
  }

  .footer-bar button {
    margin: 10px;
    padding: 8px 15px;
  }
}
</style>
