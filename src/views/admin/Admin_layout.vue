<!-- src/components/Layout.vue -->
<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <div class="content">
        <router-view />  <!-- 显示子路由的内容 -->
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
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 10px;
  overflow-y: auto;
}
</style>
