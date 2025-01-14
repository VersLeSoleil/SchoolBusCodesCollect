<template>
  <div>
    <!-- 侧边栏折叠/展开按钮 -->
    <div class="toggle-button" @click="toggleSidebar">
      <i :class="sidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
    </div>

    <!-- 侧边栏容器 -->
    <transition name="sidebar-fade">
      <div class="sidebar" v-show="!sidebarCollapsed">
        <ul class="menu-list">
          <!-- 遍历最外层 menuItems -->
          <li
              v-for="(item, index) in menuItems"
              :key="item.name"
              class="menu-item-wrapper"
          >
            <!-- 如果没有 children，就直接是一个 router-link -->
            <div
                v-if="!item.children"
                class="menu-item"
                @click="goRoute(item.path)"
            >
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </div>

            <!-- 如果有 children -->
            <div
                v-else
                class="menu-item"
                @click="toggleSubmenu(index)"
            >
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
              <i
                  class="submenu-arrow"
                  :class="submenuOpen[index] ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
              ></i>
            </div>

            <!-- 子菜单展开区域 -->
            <transition name="slide-bounce">
              <ul v-if="item.children && submenuOpen[index]" class="submenu">
                <li
                    v-for="(child) in item.children"
                    :key="child.name"
                    @click.stop="goRoute(child.path)"
                    class="submenu-item"
                >
                  <i :class="child.icon || 'el-icon-menu'"></i>
                  <span>{{ child.title }}</span>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 模拟菜单数据
const menuItems = [
  {
    path: '/admin_home/dashboard',
    title: '仪表盘',
    icon: 'el-icon-s-home',
    name: 'Dashboard'
  },
  {
    path: '',
    title: '学生管理',
    icon: 'el-icon-user',
    name: 'Userspass',
    children: [
      {path: '/admin_home/userspass', title: '学生列表', icon: 'el-icon-document', name: 'UserList'},
      {path: '/admin_home/feedback', title: '投诉意见处理', icon: 'el-icon-bell', name: 'Feedback'},
      {path: '/admin_home/usersorders', title: '订单查看', icon: 'el-icon-bell', name: 'UsersOrders'},
    ]
  },
  {
    path: '',
    title: '司机与车辆管理',
    icon: 'el-icon-truck',
    name: 'Drivers',
    children: [
      {path: '/admin_home/drivers', title: '司机列表', icon: 'el-icon-s-custom', name: 'DriverList'},
      {path: '/admin_home/work_table', title: '司机工作表', icon: 'el-icon-s-order', name: 'WorkTable'},
      {path: '/admin_home/car_table', title: '车辆管理', icon: 'el-icon-s-operation', name: 'car_table'}
    ]
  },
  {
    path: '',
    title: '路线管理',
    icon: 'el-icon-map-location',
    name: 'Route',
    children: [
      {path: '/admin_home/routes/list', title: '路线列表', icon: 'el-icon-view', name: 'RouteList'},
      {path: '/admin_home/manage_routes', title: '编辑路线', icon: 'el-icon-edit', name: 'RouteEdit'}
    ]
  },
  {
    path: '',
    title: '系统设置',
    icon: 'el-icon-map-location',
    name: 'Route',
    children: [
      {path: '/admin_home/variables', title: '变量管理', icon: 'el-icon-s-tools', name: 'SystemSettings'},
    ]
  },
  {
    path: '/admin_home/ai',
    title: '智能助手',
    icon: 'el-icon-s-opportunity',
    name: 'TestTools'
  }
]

const sidebarCollapsed = ref(false)
const submenuOpen = ref([])
const router = useRouter()

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleSubmenu = (index) => {
  submenuOpen.value[index] = !submenuOpen.value[index]
}

const goRoute = (path) => {
  if (path) {
    router.push(path)
  }
}

// 初始化 submenuOpen
submenuOpen.value = menuItems.map(() => false)
</script>

<style scoped>
/* ============================= */
/* 1. 更柔和的侧边栏背景和更精简的渐变 */
/* ============================= */
.sidebar {
  width: 240px;
  /* 使用更柔和的渐变（苹果风格更倾向纯色/微渐变） */
  background: linear-gradient(135deg, #2f3e4d, #3b4c5a);
  color: #fff;
  padding-top: 60px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  opacity: 0.98; /* 稍微提升透明度，让背景更通透 */
  transition: all 0.3s ease; /* 当折叠时给点平滑过渡 */
}

/* ============================= */
/* 2. 新增 sidebar-fade 过渡 */
/* ============================= */
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

/* ============================= */
/* 3. 子菜单动画 slide-bounce 保留 */
/* ============================= */
.slide-bounce-enter-active {
  animation: bounce-in 0.4s forwards;
}

.slide-bounce-leave-active {
  animation: bounce-out 0.4s forwards;
}

.slide-bounce-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-bounce-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  30% {
    transform: translateY(5px);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* ============================= */
/* 4. 折叠按钮样式 */
/* ============================= */
.toggle-button {
  position: fixed;
  top: 15px;
  left: 15px;
  color: #fff;
  cursor: pointer;
  z-index: 999;
  font-size: 20px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.toggle-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1);
}

/* ============================= */
/* 5. 菜单列表整体样式 */
/* ============================= */
.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 给每个菜单项更大一些的间距，使其更易读 */
.menu-item-wrapper {
  margin-bottom: 10px;
}

/* 主菜单样式 */
.menu-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 25px;
  transition: background-color 0.2s ease, transform 0.2s ease;
  position: relative;
  font-size: 14px;
}

.menu-item i {
  margin-right: 12px;
  font-size: 18px;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.menu-item:active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 子菜单箭头与旋转 */
.submenu-arrow {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.el-icon-arrow-down {
  transform: rotate(90deg);
}

/* 子菜单样式 */
.submenu {
  background-color: rgba(255, 255, 255, 0.05);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  margin-left: 8px;
  padding: 5px 0;
}

/* 子菜单每一项 */
.submenu-item {
  padding: 8px 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease, transform 0.2s ease;
  font-size: 13px;
}

.submenu-item i {
  margin-right: 8px;
  font-size: 16px;
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(3px);
}

.submenu-item:active {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
