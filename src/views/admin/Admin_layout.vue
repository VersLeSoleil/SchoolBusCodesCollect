<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Admin_SideBar.vue'
import Header from './Admin_header.vue'
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: hidden;
  /* 对移动端做响应式处理时，可能需要media query将Sidebar隐藏或折叠 */
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 16px;
  overflow-y: auto;
  margin-top: 50px; /* 避免与header重叠 */
  background-color: #f9f9f9; /* 给主内容区淡色背景，突出侧边栏与header */
  min-height: calc(100vh - 60px);
  transition: background-color 0.3s ease;
}

.content:hover {
  background-color: #fefefe;
}
</style>
