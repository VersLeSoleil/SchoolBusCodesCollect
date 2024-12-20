<template>
    <div class="station-editor">
      <div class="header">
        <h3>站點編輯器</h3>
        <p>可編輯的站點數據</p>
      </div>
  
      <div class="station-list">
        <div v-for="(station, index) in paginatedStations" :key="index" class="station-item">
            <div class="form-group">
            <label>站點名稱:</label>
            <input v-model="station.name" type="text" :placeholder="'請輸入站點名稱'" required />
        </div>
        <div class="form-group">
          <label>位置</label>
          <input v-model="station.position" type="text" :disabled="station.is_used !== 1" required />
        </div>
        <div class="form-group">
            <label>是否正在使用:</label>
            <input v-model="station.is_used" type="checkbox" checked />
        </div>
        <div class="form-group">
            <input v-model="station.note" type="text" placeholder="可選填，備註" />
          </div>
        </div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
        <button @click="nextPage" :disabled="currentPage >= maxPages">下一頁</button>
      </div>
      <div class="footer">
        <button @click="saveChanges">保存變更</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import busStationData from "@/assets/bus_station_data.json";
  
  // 定義參數
  const stationsData = ref([]);
  const currentPage = ref(1);
  const pageSize = 10;
  
  const loadData = async () => {
    // 直接將 bus_station_data.json 的內容加載到 stationsData
    stationsData.value = [...busStationData];
  };
    // 分頁邏輯
    const maxPages = computed(() => Math.ceil(stationsData.value.length / pageSize));
  // 分頁功能
  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
  };
  
  const nextPage = () => {
    if (currentPage.value < maxPages.value) currentPage.value++;
  };
  
  // 計算當前頁顯示的站點
  const paginatedStations = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize;
    return stationsData.value.slice(startIndex, startIndex + pageSize);
  });

  // 保存數據
  const saveChanges = () => {
    // 構建符合要求的 JSON 格式
    const formattedData = stationsData.value.map(station => ({
      position: station.position,
      name: station.name,
      note: station.note || "",  // 如果備註為空，設為空字符串
      is_used: station.is_used,
    }));

    // 模擬保存，這裡將數據儲存到 localStorage 作為替代（如果需要，也可以儲存到其他地方）
    localStorage.setItem('bus_station_data', JSON.stringify(formattedData));

    // 模擬返回保存結果
    alert('數據已保存！');
  };
  
  onMounted(loadData);
  </script>
  
  <style scoped>
.station-editor {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 800px;
  margin: auto;
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

.pagination {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.station-list {
  max-height: 400px;
  overflow-y: auto;
}

.station-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  background-color: #fff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
  
  .station-item input {
    margin: 5px 0;
    padding: 5px;
    font-size: 14px;
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
  }
  
  button:disabled {
    background-color: #ccc;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  