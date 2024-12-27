<script setup>
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import PaymentCount from '@/views/driver_1/components/PaymentCount.vue';
import CallCount from '@/views/driver_1/components/CallCount.vue';
import callSim from '@/views/schoolbus-simulation/components/call-sim.vue';
import QRCodeScanner from '@/views/driver_1/components/QRCodeScanner.vue'; // 通用错误边界组件

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
    <el-button  @click="drawer = true"  type="warning" round style="height: 60px; width: 180px; margin: 10px;"><p style="font-size: 20px;">更多功能</p></el-button>
    <el-drawer
    
    v-model="drawer" 
    :direction="direction"
    :modal="false"
    :before-close="handleClose"
    size="40%">
    
    <el-row :gutter="50">
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
        
      </el-row>
  </el-drawer>
 </template>

<style scoped>
.self-scan-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.self-scan-btn:hover {
  background-color: #0056b3;
}
</style>