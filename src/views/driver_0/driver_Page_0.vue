<script setup>
import { ref,} from 'vue';
import MapComponent from '@/views/driver_0/components/MapComponent.vue';
import {  Menu as IconMenu ,location} from '@element-plus/icons-vue';
import StartWork from './components/StartWork.vue';


// 使用 `ref` 来创建响应式的变量
const mapComponent = ref(null);
const menuActiveIndex = ref('1');
const startWork = ref(null);
// 打开和关闭菜单时的回调函数
const handleOpen = (key, keyPath) => {
  console.log('Open menu:', key, keyPath);
  menuActiveIndex.value = key;
};

const handleClose = (key, keyPath) => {
  console.log('Close menu:', key, keyPath);
  menuActiveIndex.value = ''; // 重置菜单
};

// 调用 MapComponent 中的方法
const toggleStations = () => {
  mapComponent.value.toggleStations(); // 直接调用 MapComponent 中的方法
};

const toggleRoutes = () => {
  mapComponent.value.toggleRoutes(); // 直接调用 MapComponent 中的方法
};

const autoLocateCampus = () => {
  mapComponent.value.autoLocateCampus(); // 直接调用 MapComponent 中的方法
};

const showDriverInfo = () => {
  mapComponent.value.showDriverInfo(); // 直接调用 MapComponent 中的方法
};

const openForm = () => {
  startWork.value.openForm(); // 直接调用 startWork 中的方法
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
        <el-aside width="250px" >
          <el-menu
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
          >
            <el-sub-menu index="1">
              <template #title>
                <el-icon><location /></el-icon>
                <span style="font-size: 20px;">更多</span>
              </template>

              <el-menu-item index="1-1" @click="openForm" style="font-size: 20px;">上班</el-menu-item> 
              <el-menu-item index="1-2" @click="toggleStations" style="font-size: 20px;">隐藏/显示站点</el-menu-item>
              <el-menu-item index="1-3" @click="toggleRoutes" style="font-size: 20px;">隐藏/显示现有路线</el-menu-item>
              <el-menu-item index="1-4" @click="autoLocateCampus" style="font-size: 20px;">自动定位到校区</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="2" @click="showDriverInfo">
              <el-icon><icon-menu /></el-icon>
              <span style="font-size: 20px;">我的</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>     
            <MapComponent ref="mapComponent"/>    
            <StartWork ref="startWork" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<style scoped>

.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f3f4f6;
  min-height: 100vh;
}

.page-title {
  color: #4a4a4a;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.map-container {
  position: relative;
  height: 700px;
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

/* 顶部栏样式 */
.top-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #2c3e50;
  color: #fff;
  font-size: 14px;
}

/* 地图部分样式 */
.map-section {
  flex: 3;
  border-right: 2px solid #ddd;
}



@media (min-width: 1024px) {
  .map-container {
    height: 600px;
  }
}

</style>
