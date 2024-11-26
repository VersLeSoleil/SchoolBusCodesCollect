<!-- src/components/Sidebar.vue -->
<template>
  <div class="sidebar">
    <ul>
      <li v-for="item in menuItems" :key="item.name">
        <router-link :to="item.path" class="menu-item">
          <i :class="item.icon"></i>
          {{ item.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
const menuItems = [
  { path: '/admin_home/dashboard', title: '信息台', icon: 'el-icon-s-home', name: 'Dashboard' }
]
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: #fff;
  padding-top: 20px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 10;
}

.sidebar ul {
  padding: 0;
}

.sidebar li {
  padding: 15px;
  transition: background-color 0.3s ease;
}

.menu-item {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.menu-item i {
  margin-right: 10px;
  font-size: 18px;
}

.menu-item:hover {
  background-color: #1abc9c;
  transform: translateX(10px);
}

.menu-item:active {
  background-color: #16a085;
}
</style>
