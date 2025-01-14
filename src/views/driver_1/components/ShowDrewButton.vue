<script setup>
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import PaymentCount from '@/views/driver_1/components/PaymentCount.vue';
import CallCount from '@/views/driver_1/components/CallCount.vue';

// 定义响应式变量
const drawer = ref(false);
const direction = ref('btt');

// 方法：处理关闭逻辑
const handleClose = (done) => {
  ElMessageBox.confirm('确认关闭？')
    .then(() => {
      done();
    })
    .catch(() => {});
};



</script>


<template>




  <!-- 主按钮 -->
  <el-button  @click="drawer = true"  type="warning" round style="height: 60px; width: 180px; margin: 10px;"><p style="font-size: 20px;">更多功能</p></el-button>

  <!-- 抽屉 -->
  <el-drawer
    v-model="drawer"
    :direction="direction"
    :modal="false"
    :before-close="handleClose"
    size="40%"
    custom-class="custom-drawer">
    
    <!-- 抽屉标题 -->
    <div class="drawer-title">
      <h2>功能面板</h2>
    </div>

    <!-- 内容区域 -->
    <el-row :gutter="1" class="drawer-content">
      <el-col :span="12" class="content-col">
        <el-card shadow="always" class="content-card">
          <PaymentCount />
        </el-card>
      </el-col>

      <el-col :span="12" class="content-col">
        <el-card shadow="always" class="content-card">
          <CallCount />
        </el-card>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<style scoped>
/* 主按钮样式 */
.el-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 自定义抽屉样式 */
.custom-drawer {
  background-color: #f9f9f9;
  padding: 20px;
}

/* 抽屉标题样式 */
.drawer-title {
  text-align: center;
  margin: 10px 0; /* 减少顶部和底部的外边距 */
  padding: 0; /* 去除内边距 */
}

.drawer-title h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0; /* 去除默认外边距 */
  padding: 5px 0; /* 添加较小的内边距 */
}


.drawer-title h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* 内容区域样式 */
.drawer-content {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 10px;
  height: auto; /* 自动适配内容 */
}


/* 卡片样式 */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  height: auto; /* 自适应高度 */
  max-height: none; /* 确保没有最大高度限制 */
  overflow: visible; /* 确保内容不会被隐藏 */
}

.content-col {
  display: flex;
  justify-content: center;
  align-items: stretch; /* 确保子元素可以撑开 */
  height: auto; /* 自动适应内容高度 */
}


.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}




</style>
