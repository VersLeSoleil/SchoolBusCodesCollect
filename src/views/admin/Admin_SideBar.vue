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
  { path: '/admin_home/dashboard', title: '仪表盘', icon: 'el-icon-s-home', name: 'Dashboard' }
  ,
  { path: '/admin_home/userspass', title: '学生账户管理', icon: 'el-icon-s-school', name: 'Userspass' }
  ,
  { path: '/empty_site', title: '司机账户管理', icon: 'el-icon-s-school', name: 'School' }
  ,
  { path: '/empty_site', title: '路线管理', icon: 'el-icon-s-school', name: 'School' }
  ,
  { path: '/empty_site', title: '投诉意见处理', icon: 'el-icon-s-school', name: 'School' }
  ,
  { path: '/admin_home/variables', title: '系统设置', icon: 'el-icon-s-school', name: 'School' }

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
