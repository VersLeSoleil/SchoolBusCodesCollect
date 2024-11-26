<!-- src/views/admin/Dashboard.vue -->
<template>
  <div class="dashboard">
    <div class="dashboard-card" v-if="loading">Loading...</div>
    <div class="dashboard-card" v-else>
      <h2>Welcome to the Admin Dashboard</h2>
      <p>This is the main page of the admin panel.</p>
    </div>

    <div class="stats-cards">
      <div class="stat-card" v-for="(item, index) in stats" :key="index">
        <h3>{{ item.title }}</h3>
        <p>{{ item.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 响应式变量
const stats = ref([
  { title: '用户人数', value: 'Loading...' },
  { title: '司机人数', value: 'Loading...' },
  { title: '管理员人数', value: 'Loading...' },
]);

const loading = ref(true); // 控制加载状态

// 获取数据的方法
const fetchStats = async () => {
  try {
    const response = await fetch('http://localhost:8888/admin_home/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    const data = await response.json();

    // 更新 stats 数据
    stats.value = [
      { title: 'Total Users', value: data.total_users },
      { title: 'Total Drivers', value: data.total_drivers },
      { title: 'Total Admins', value: data.total_admins },
    ];
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// 在组件挂载后获取数据
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard {
  padding: 250px;
}

.dashboard-card {
  background: #fff;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  margin-bottom: 40px;
}

.dashboard-card:hover {
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.stat-card {
  background: #fff;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  flex: 1;
  min-width: 240px;
  max-width: 30%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 600;
}

.stat-card p {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}
</style>
