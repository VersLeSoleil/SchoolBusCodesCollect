<script setup>
import {ref, onMounted} from 'vue'; // 引入 Vue Composition API
import {useRouter} from 'vue-router'; // Vue Router 的组合式 API
import axios from 'axios';
import {validateToken} from '@/auth.js'; // 导入令牌验证函数

const router = useRouter(); // 获取路由实例
const message = ref(''); // 定义消息状态

// 验证令牌逻辑
onMounted(async () => {
  const validation = await validateToken(); // 验证令牌
  if (!validation.valid) {
    alert(validation.message); // 如果令牌无效，提示并跳转到登录页面
    router.push('/login');
  }
});

// 登出逻辑
async function handleLogout() {
  const validation = await validateToken(); // 再次验证令牌
  if (!validation.valid) {
    alert(validation.message); // 如果令牌无效，直接跳转到登录页面
    router.push('/login');
    return;
  }

  try {
    await axios.post('http://localhost:8888/api/logout', {}, {
      headers: {
        Authorization: localStorage.getItem('jwtToken'),
      },
    });
    alert('您已成功登出');
    localStorage.removeItem('jwtToken'); // 移除令牌
    router.push('/login'); // 跳转到登录页面
  } catch (error) {
    console.error('登出失败:', error);
    alert('登出失败，请稍后再试');
  }
}

// 跳转到司机页面逻辑
function todriver() {
  router.push('/driver-0'); // 跳转到 `/driver-0`
}

// 跳转到司机页面逻辑
function toAdmin() {
  router.push('/admin_home'); // 跳转
}

</script>

<template>
  <div>
    <h1>欢迎来到首页！</h1>
    <!-- 登出 -->
    <button @click="handleLogout" class="logoutButton">登出</button>
    <!-- 进入司机界面 -->
    <button @click="todriver" class="todriverButton">司机</button>
    <!-- 进入管理员界面 -->
    <button @click="toAdmin" class="toAdminButton">管理员</button>
    <!-- 消息提示 -->
    <p v-if="message">{{ message }}</p>
  </div>
</template>


<style scoped>
.logoutButton {
  margin-right: 10px;
}

.toAdminButton {
  position: absolute;
  top: 40%;
  left: 50%;
  width: 100px;
  height: 52px;
  border-radius: 20px;
  background: linear-gradient(to right, rgb(72, 168, 65), rgb(255, 221, 51));
  color: floralwhite;
}

.todriverButton {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 52px;
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(to right, rgb(113, 65, 168), rgba(44, 114, 241, 1));
  color: floralwhite;
  line-height: 52px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}
</style>
  