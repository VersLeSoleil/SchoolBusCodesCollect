<template>
  <div class="station-editor">
    <div class="header">
      <h3>站點編輯器</h3>
      <p>管理站點數據</p>
    </div>

    <transition-group name="fade" tag="div" class="station-list">
      <div
        v-for="(station, index) in paginatedStations"
        :key="index"
        class="station-item"
      >
        <div class="form-group">
          <label>站點名稱:</label>
          <input
            v-model="station.name"
            type="text"
            :disabled="!isEditing"
            placeholder="請輸入站點名稱"
            required
          />
          <span v-if="isEditing && !station.name" class="error-message">站點名稱不能為空！</span>
        </div>
        <div class="form-group">
          <label>位置</label>
          <label>緯度</label>
          <input
            v-model="station.location.longitude"
            type="text"
            :disabled="!isEditing"
            required
          />
          <span v-if="isEditing && !station.location.longitude" class="error-message">緯度不能為空！</span>
          <label>經度</label>
          <input
            v-model="station.location.latitude"
            type="text"
            :disabled="!isEditing"
            required
          />
          <span v-if="isEditing && !station.location.latitude" class="error-message">經度不能為空！</span>
        </div>
        <div class="form-group">
          <label>是否正在使用:</label>
          <input
            v-model="station.is_used"
            type="checkbox"
            :true-value="1"
            :false-value="0"
            :disabled="!isEditing"
          />
        </div>
        <div class="form-group">
          <input
            v-model="station.note"
            type="text"
            placeholder="可選填，備註"
            :disabled="!isEditing"
          />
        </div>
      </div>
    </transition-group>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
      <button @click="nextPage" :disabled="currentPage >= maxPages">下一頁</button>
    </div>

    <div class="footer">
      <button @click="toggleEdit" v-if="!isEditing">修改站點</button>
      <button @click="saveChanges" v-if="isEditing">保存變更</button>
      <button @click="cancelChanges" v-if="isEditing">取消修改</button>
      <button @click="addStation" v-if="isEditing">新增站點</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, watch } from 'vue';
import { useWebSocketStore } from '@/stores/webSocketStore';

const webS = useWebSocketStore();

const props = defineProps({
  sites: {
    type: Array,
    required: true,
  },
});

const stationsData = ref([]);
const originalData = ref([]);
const currentPage = ref(1);
const pageSize = 5;
const isEditing = ref(false);

// 初始化數據
watch(
  () => props.sites,
  (newSites) => {
    stationsData.value = JSON.parse(JSON.stringify(newSites)); // 深拷貝數據
    originalData.value = JSON.parse(JSON.stringify(newSites)); // 保存原始數據
  },
  { immediate: true, deep: true }
);

// 分頁邏輯
const maxPages = computed(() => Math.ceil(stationsData.value.length / pageSize));

const paginatedStations = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  return stationsData.value.slice(startIndex, startIndex + pageSize);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < maxPages.value) {
    currentPage.value++;
  }
};

// 切換修改模式
const toggleEdit = () => {
  isEditing.value = true;
};

// 保存修改
const saveChanges = async () => {
  // 遍歷所有站點，驗證必填字段
  for (const station of stationsData.value) {
    if (!station.name) {
      alert('站點名稱不能為空！');
      isEditing.value = true;
      return; // 終止保存
    }
    if (!station.location.latitude) {
      alert('緯度不能為空！');
      isEditing.value = true;
      return; // 終止保存
    }
    if (!station.location.longitude) {
      alert('經度不能為空！');
      isEditing.value = true;
      return; // 終止保存
    }
  }
  try {

    // 構造 WebSocket 消息數據
    const message = {
      type: 'update_sites', // 消息類型
      sites: stationsData.value.map((station, index) => ({
        id: index + 1, // 如果無 ID，默認為 0
        name: station.name,
        location: {
          longitude: parseFloat(station.location.latitude),
          latitude: parseFloat(station.location.longitude),
        },
        site_passenger: station.site_passenger || 0, // 默認為 0
        is_used: station.is_used,
        site_note: station.note || '', // 如果備註為空，設為空字符串
      })),
      time: new Date().toISOString(), // 當前時間
    };

    webS.sendMessage(JSON.stringify(message));

    // 如果所有驗證通過，保存數據
    isEditing.value = false;
    alert('修改已保存，數據已同步到服務器！');
  } catch (error) {
    console.error('保存失敗：', error);
    alert('保存失敗，請稍後再試！');
    isEditing.value = true; // 恢復到編輯模式
  }
};

// 取消修改
const cancelChanges = () => {
  stationsData.value = JSON.parse(JSON.stringify(originalData.value)); // 恢復到原始數據
  isEditing.value = false;
  alert('修改已取消！');
};

// 新增站點
const addStation = () => {
  const newStation = {
    id: Date.now(),
    name: '',
    location: { longitude: '', latitude: '' },
    is_used: 0,
    note: '',
  };
  stationsData.value.push(newStation);
  currentPage.value = maxPages.value; // 跳轉到最後一頁
};
</script>

<style scoped>
.station-editor {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 800px;
  margin: auto;
  animation: fadeIn 0.5s ease-in-out;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h3 {
  font-size: 24px;
  margin: 0;
}

.header p {
  font-size: 14px;
  color: #666;
}

.station-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.station-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  background-color: #fff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.5s ease-in-out;
}

.station-item .form-group {
  margin-bottom: 10px;
}

.station-item .form-group label {
  font-size: 14px;
  color: #333;
}

.station-item .form-group input {
  padding: 8px;
  font-size: 14px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.station-item .form-group input:disabled {
  background-color: #f0f0f0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  animation: fadeIn 0.5s ease-in-out;
}

.footer {
  margin-top: 20px;
  text-align: center;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
  transition: background-color 0.3s ease-in-out;
}

button:disabled {
  background-color: #ccc;
}

button:hover {
  background-color: #0056b3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}


@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
