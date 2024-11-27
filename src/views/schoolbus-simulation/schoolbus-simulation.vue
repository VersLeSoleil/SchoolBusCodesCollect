<script setup>
import MapComponent from '@/views/driver_1/components/MapComponent.vue';
import driverSimulation from '@/views/schoolbus-simulation/components/driver-simulation.vue';



</script>

<template>
  <div id="app">
    <!-- 主内容 -->
    <div class="wrapper">
      <div class="map-container">
        <MapComponent />
      </div>
    </div>
    <!-- 其他内容 -->
    <div class="driver-section">
      <driverSimulation />
    </div>
  </div>
</template>


<style scoped>
/* 外层容器，使用 flex 布局 */
.wrapper {
  display: flex;
  width: 100%;
  height: 60vh;
  /* 满屏高度 */
}

/* 地图容器样式 */
.map-container {
  width: 100%;
  height: 60vh;
  /* 占屏幕高度的 60% */
  margin: 0;
  overflow: hidden;
  background-color: #f0f0f0;
  position: relative;
  border-bottom: 2px solid #ddd;
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

}
</style>
