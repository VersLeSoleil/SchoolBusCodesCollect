<template>
    <div class="gps-system">
      <h1 class="header">🚗 GPS 管理系统</h1>

      <!-- 驾驶员管理 -->
      <div class="card">
        <h2>驾驶员管理</h2>
        <div class="form-group">
          <input v-model="driverId" placeholder="请输入驾驶员 ID" class="input" />
          <button @click="createDriver(driverId)" class="btn btn-primary">创建驾驶员</button>
          <button @click="deleteDriver(driverId)" class="btn btn-danger">删除驾驶员</button>
        </div>
      </div>

      <!-- 位置信息更新 -->
      <div class="card">
        <h2>位置信息更新</h2>
        <div class="form-group">
          <input v-model.number="latitude" placeholder="请输入纬度" class="input" />
          <input v-model.number="longitude" placeholder="请输入经度" class="input" />
          <button @click="sendLocationUpdate" class="btn btn-success">更新驾驶员位置</button>
        </div>
      </div>

      <!-- 响应信息 -->
      <div v-if="responseMessage" class="response-message">
        <p>响应消息: {{ responseMessage }}</p>
      </div>

      <!-- 文件上传 -->
      <div class="card">
        <h2>上传 JSON 文件</h2>
        <input type="file" accept=".json" @change="handleFileUpload" class="file-input" />
      </div>

      <!-- 驾驶员位置广播 -->
      <div class="card">
        <h2>实时驾驶员位置广播</h2>
        <ul v-if="driverLocations.length > 0" class="list">
          <li v-for="driver in driverLocations" :key="driver.id" class="list-item">
            ID: {{ driver.id }}, 纬度: {{ driver.latitude }}, 经度: {{ driver.longitude }}
          </li>
        </ul>
        <p v-else>暂无驾驶员位置信息</p>
      </div>

      <!-- 路线管理 -->
      <div class="card">
        <h2>已加载路线</h2>
        <ul v-if="routes.length > 0" class="list">
          <li v-for="(route, index) in routes" :key="route.driverId" class="list-item">
            <p>路线 {{ index + 1 }} - 驾驶员 ID: {{ route.driverId }}</p>
            <div class="actions">
              <button @click="startRoute(route)" :disabled="!route.isPaused" class="btn btn-primary">启动</button>
              <button @click="pauseRoute(route)" :disabled="route.isPaused" class="btn btn-warning">暂停</button>
              <button @click="resumeRoute(route)" :disabled="!route.isPaused" class="btn btn-success">恢复</button>
            </div>
            <p>当前进度: {{ route.pathIndex }} / {{ route.path.length }}</p>
          </li>
        </ul>
        <p v-else>暂无加载的路线</p>
      </div>
    </div>
  </template>


  <script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import axios from "axios";
  import {useApiBaseStore} from "@/stores/network";
  import { useWebSocketStore } from '@/stores/webSocketStore'; // 导入 WebSocket store


  const responseMessage = ref(""); // 响应消息
  const driverId = ref(""); // 驾驶员 ID
  const latitude = ref(0); // 纬度
  const longitude = ref(0); // 经度
  const driverLocations = ref([]); // 存储驾驶员位置的数组
  let webSocket = null; // WebSocket 实例
  let timer = null; // 用于控制路径发送的定时器
  let currentDriverId = 100; // 起始驾驶员 ID
  const routes = ref([]); // 存储所有上传的路径信息
  // 获取 WebSocket Store 实例  
  const webSocketStore = useWebSocketStore();

  // 创建驾驶员并传递位置信息
  const createDriver = async (id = driverId.value) => {
    if (!id) {
      responseMessage.value = "创建失败: 未提供有效的驾驶员 ID";
      console.error("Invalid ID passed to createDriver:", id);
      return;
    }
    console.log("Creating driver with ID:", id);
    try {
      const apiBaseStore = useApiBaseStore();
      const response = await axios.post(apiBaseStore.localBaseUrl + "/create_driver", {
        id: id.toString(), // 确保 id 是字符串
      });
      console.log("Driver created with ID:", id);
      responseMessage.value = `创建成功: ${JSON.stringify(response.data)}`;
    } catch (error) {
      responseMessage.value = `创建失败: ${error.response?.data || error.message}`;
      console.error("Error creating driver:", error.response || error.message);
    }
  };


  // 删除驾驶员
  const deleteDriver = async (id = driverId.value) => {
    if (!id) {
      responseMessage.value = "请输入驾驶员 ID";
      return;
    }
    console.log("Deleting driver with ID:", id);
    try {
      const apiBaseStore = useApiBaseStore();
      const response = await axios.post(apiBaseStore.localBaseUrl + "/delete_driver", {
        id: id.toString(), // 确保 id 是字符串
      });
      console.log("Driver delete with ID:", id);
      responseMessage.value = response.data || "删除成功";
    } catch (error) {
      responseMessage.value = `删除失败: ${error.response?.data || error.message}`;
    }
  };

  // 初始化 WebSocket
  const initWebSocket = () => {
    // 在组件挂载时初始化 WebSocket 连接
    webSocketStore.initWebSocket("ws://localhost:8888/ws");
  };

  // 更新驾驶员位置
  const sendLocationUpdate = () => {
    if (!driverId.value) {
      responseMessage.value = "请输入驾驶员 ID";
      return;
    }
    // 检查 WebSocket 连接状态
    if (!webSocketStore.isConnected) {
      responseMessage.value = "WebSocket 未连接";
      return;
    }
    const location = {
      latitude: latitude.value,
      longitude: longitude.value,
    }
    const message = {
      type: "driver_gps",
      driver_id: driverId.value,
      location: location
    };
    try {
      webSocketStore.sendMessage(JSON.stringify(message)); // 使用 store 的方法发送消息
      responseMessage.value = "位置信息已发送";
    } catch (error) {
      responseMessage.value = `发送位置信息失败: ${error.message}`;
    }
  };

  // 处理文件上传，将路径数据加入队列
  const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) {
          responseMessage.value = "未选择文件";
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target.result);
              if (Array.isArray(data) && data[0]?.path && Array.isArray(data[0].path)) {
                  const newRoute = {
                      path: data[0].path, // 路径数据
                      isPaused: true, // 初始状态为暂停
                      pathIndex: 0, // 路径索引
                      timer: null, // 定时器 ID
                      driverId: currentDriverId++, // 分配唯一的驾驶员 ID
                  };
                  routes.value.push(newRoute);
                  responseMessage.value = `成功加载文件，当前共 ${routes.value.length} 条路线`;
              } else {
                  responseMessage.value = "文件内容格式不正确";
              }
          } catch (error) {
              responseMessage.value = "文件解析失败";
          }
      };
      reader.readAsText(file);
  };

  const startRoute = (route) => {
      if (route.path.length === 0) {
          responseMessage.value = "路径数据为空，无法发送";
          return;
      }
      if (!route.isPaused) {
          responseMessage.value = `路线 ${route.driverId} 已在运行`;
          return;
      }

      // 创建驾驶员
      createDriver(route.driverId);

      // 启动定时器
      route.isPaused = false;
      route.timer = setInterval(() => {
          if (route.pathIndex >= route.path.length) {
              clearInterval(route.timer);
              route.timer = null;
              route.isPaused = true;
              responseMessage.value = `路线 ${route.driverId} 已完成发送`;
              return;
          }
          const [latitude, longitude] = route.path[route.pathIndex];
          sendLocationToBackend(route.driverId, latitude, longitude);
          route.pathIndex++;
      }, 3000);
  };

  const pauseRoute = (route) => {
      if (route.isPaused) {
          responseMessage.value = `路线 ${route.driverId} 已暂停`;
          return;
      }

      clearInterval(route.timer);
      route.timer = null;
      route.isPaused = true;
      responseMessage.value = `路线 ${route.driverId} 已暂停`;
  };

  const resumeRoute = (route) => {
      if (!route.isPaused) {
          responseMessage.value = `路线 ${route.driverId} 已在运行`;
          return;
      }

      startRoute(route);
  };

  // 通过 WebSocket 向后端发送位置
  const sendLocationToBackend = (id, longitude, latitude) => {
    // 检查 WebSocket 连接状态
    if (!webSocketStore.isConnected) {
      responseMessage.value = "WebSocket 未连接";
      return;
    }

    id = id.toString()
    const location = {
      latitude: latitude,
      longitude: longitude,
    }
    const message = {
      type: "driver_gps",
      driver_id: id,
      location: location
    };
    try {
      webSocketStore.sendMessage(JSON.stringify(message)); // 使用 store 的方法发送消息
      responseMessage.value = "位置信息已发送";
    } catch (error) {
      responseMessage.value = `发送位置信息失败: ${error.message}`;
    }
  };

  // 生命周期钩子
  onMounted(() => {
    initWebSocket(); // 初始化 WebSocket 连接
  });

  onBeforeUnmount(() => {
    if (webSocket) {
      webSocket.close();
    }
    if (timer) {
      clearInterval(timer);
    }
  });
  </script>

  <style scoped>
  .gps-system {
    max-width: 800px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }

  .header {
    text-align: center;
    color: #4CAF50;
    font-size: 2rem;
    margin-bottom: 20px;
  }

  .card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }

  .card h2 {
    margin: 0 0 15px;
    font-size: 1.5rem;
    color: #333;
  }

  .form-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .input,
  .file-input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex: 1;
    min-width: 150px;
  }

  .file-input {
    margin-top: 10px;
  }

  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    min-width: 100px;
  }

  .btn-primary {
    background-color: #007bff;
  }

  .btn-success {
    background-color: #28a745;
  }

  .btn-warning {
    background-color: #ffc107;
  }

  .btn-danger {
    background-color: #dc3545;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .response-message {
    margin: 15px 0;
    padding: 10px;
    background-color: #f8f9fa;
    border-left: 4px solid #17a2b8;
    color: #333;
  }

  .list {
    list-style: none;
    padding: 0;
  }

  .list-item {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  </style>

