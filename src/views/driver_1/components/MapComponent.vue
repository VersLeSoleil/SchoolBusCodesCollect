<template>
  <div class="page-container">
    <div id="container" class="map-container">
      <div class="info-container">
        <driver_Info :visible="dInfoVisible" :content="dInfoContent" @close="closeDInfo" />
        <button class="btn" @click="toggleRoutes" style="margin-bottom: 5px">
          {{ routesVisible ? '隐藏现有路线' : '显示现有路线' }}
        </button>
        <button class="btn" @click="toggleStations" style="margin-bottom: 5px">
          {{ stationsVisible ? '隐藏站点' : '显示站点' }}
        </button>
      </div>
    </div>
    <!-- <div id="app">
      <div id="container"></div>
      地图外层容器
      <div id="map-wrapper"> -->
        <!-- 顶部覆盖条 -->
        <!-- <div class="map-top-bar">
          <ErrorBoundary>
            <VehicleStatusToggle @status-change="handleStatusChange" />
            <span class="online-count">在线 {{ onlineCount }} 人</span>
          </ErrorBoundary>
        </div> -->
      <!-- </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import AMapLoader from "@amap/amap-jsapi-loader";
// import VehicleStatusToggle from "@/views/driver_1/components/VehicleStatusToggle.vue";
// import ErrorBoundary from "@/views/driver_1/components/ErrorBoundary.vue";

import driver_Info from '@/views/driver_0/components/driver_Info.vue';
// import { useUserStore } from "@/stores/user";
import { useWebSocketStore } from '@/stores/webSocketStore';
import { defineExpose } from 'vue';
// import { useApiBaseStore } from '@/stores/network';

/* global AMap */

// 引入 store
const webSocketStore = useWebSocketStore();

// 响应式数据
const driverGpsMessages = computed(() => webSocketStore.driverGpsMessages);
const Message = computed(() => webSocketStore.messages);

const map = ref(null);
const polylines = ref([]);
const stationMarkers = ref([]);
const markers = ref([]);
const marker = ref(null); // 定义 marker
const routes = ref([]);
const sites = ref([]);

const intervalId = ref(null);
const isMapInitialized = ref(false);

const routesVisible = ref(true);
const stationsVisible = ref(true);

const dInfoVisible = ref(false);
const dInfoContent = ref(null); // 根据需要初始化内容

// const onlineCount = ref(1); // 假设初始在线人数

// 定义辅助方法
const getRouteColor = (index) => {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
  return colors[index % colors.length];
};

// 方法定义
const closeDInfo = () => {
  dInfoVisible.value = false;
};

const showDriverInfo = () => {
  dInfoVisible.value = true;
};

const toggleRoutes = () => {
  routesVisible.value = !routesVisible.value;
  polylines.value.forEach((polyline) => {
    if (routesVisible.value) {
      map.value.add(polyline);
    } else {
      map.value.remove(polyline);
    }
  });
};

const toggleStations = () => {
  stationsVisible.value = !stationsVisible.value;
  stationMarkers.value.forEach((marker) => {
    if (stationsVisible.value) {
      map.value.add(marker);
    } else {
      map.value.remove(marker);
    }
  });
};

const loadAndDrawRoutes = () => {
  // 清除之前的折线
  if (!isMapInitialized.value) {
    console.warn("地图尚未初始化，无法加载和绘制路线。");
  }
  polylines.value.forEach(polyline => map.value.remove(polyline));
  polylines.value = [];

  if (Array.isArray(routes.value) && routes.value.length > 0) {
    routes.value.forEach((route, index) => {
      const polyline = new AMap.Polyline({
        path: route.path,
        strokeColor: getRouteColor(index),
        strokeWeight: 6,
      });

      map.value.add(polyline);
      polylines.value.push(polyline);
      console.log(`绘制路径 ${index + 1} 成功`);
    });
  } else {
    console.warn('Routes 数据为空或不是数组');
  }
  

};

const addBusStationMarkers = () => {
  if (!map.value){
    console.log("safasdfasdf");
    // return;
  } 

  if (Array.isArray(sites.value) && sites.value.length > 0) {
    sites.value.forEach((site) => {
      if (site.is_used == 0) return;
      const labelMarker = new AMap.LabelMarker({
        position:  [site.location.longitude,
        site.location.latitude],
        text: {
          content: site.name,
          style: {
            fontSize: 15,
            fillColor: "#fff",
            backgroundColor: "blue",
            borderColor: "#ccc",
            borderWidth: 2,
            padding: [5, 10],
          },
        },
        icon: {
          image: require("@/assets/circle-icon.png"),
          size: [15, 15],
          anchor: "center",
        },
      });
      
      stationMarkers.value.push(labelMarker);
      map.value.add(labelMarker);
    });
  } else {
    console.warn('Sites 数据为空或不是数组');
  }
};

const initMap = (longitude, latitude) => {
  map.value = new AMap.Map("container", {
    zoom: 15,
    center: [longitude, latitude],
  });

  AMap.plugin(
    ["AMap.Geolocation", "AMap.Driving", "AMap.PolylineEditor"],
    () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        buttonOffset: new AMap.Pixel(10, 20),
        zoomToAccuracy: true,
      });
      map.value.addControl(geolocation);

      geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          console.log("定位成功:", result);
          addBusStationMarkers();
        } else {
          console.error("定位失败:", result);
        }
      });

      // polylineEditor 初始化
      // 需要确保 polyline 已经存在
      // 如果没有 polyline，可以延迟初始化或在需要时初始化
    }
  );
    // 初始化用户位置标记
    // marker.value = new AMap.Marker({
    //   position: [longitude, latitude],
    //   map: map.value,
    // });
    // map.value.add(marker.value);

  addBusStationMarkers();
  loadAndDrawRoutes(); // 加载并绘制路线
  isMapInitialized.value = true;
};

// const autoLocateCampus = () => {
//   const campusCenter = [113.584845, 22.358088];
//   if (!map.value) return;

//   map.value.setZoomAndCenter(15, campusCenter);
//   console.log("已定位到校区中心:", campusCenter);
// };

// const loadLocation = () => {
//   const campusCenter = [113.584845, 22.358088];
//   if (!map.value) return;

//   map.value.setZoomAndCenter(15, campusCenter);
//   console.log("已定位到校区中心:", campusCenter);
// };

// 动态加载路线的 watcher
watch(Message, (newMessages) => {
  for (let i = 0; i < newMessages.length; i++) {
    const message = newMessages[i];
    console.log('Processing case_accept message:', message);

    // 判断消息类型
    if (message.type === 'route') {
      routes.value = message.routes;
      // 进行相应的处理
      if (!isMapInitialized.value)
      {
        setTimeout(() => {
          loadAndDrawRoutes();
        }, 10000);
      }
    }
    else if (message.type === 'site') {
      sites.value = message.sites;
      if (!isMapInitialized.value)
      {
        setTimeout(() => {
          addBusStationMarkers();
        }, 10000);
      }
    }
  }
  // console.log("dsdfas");
  // loadAndDrawRoutes();
  // addBusStationMarkers();
}, { deep: true });

// 位置更新相关方法
const updateLocation = () => {
  const message1 = {
    type: "connections",
    driver_id: localStorage.getItem("id"),
  };
  webSocketStore.sendMessage(JSON.stringify(message1));

  const message2 = {
    type: "car_conn",
    car_id: localStorage.getItem("car_id"),
  };
  webSocketStore.sendMessage(JSON.stringify(message2));

  if (navigator.geolocation) {
    intervalId.value = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          // 转换为高德地图坐标（GCJ-02）
          const gps = [[longitude, latitude]];
          AMap.convertFrom(gps, 'gps', (status, result) => {
            if (result.info === 'ok') {
              const { lng, lat } = result.locations[0];

              if (!isMapInitialized.value) {
                initMap(lng, lat);
              } else if (marker.value) {
                marker.value.setPosition([lng, lat]);
              }

              // 发送转换后的坐标到后端
              sendLocationToBackendWebSocket(lng, lat);
            } else {
              console.error("坐标转换失败", result);
            }
          });
        },
        (error) => {
          console.error("无法获取位置", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }, 3000);
  } else {
    console.error("浏览器不支持地理定位");
  }
};


const sendLocationToBackendWebSocket = async (longitude, latitude) => {
  // const userStore = useUserStore();
  // const driverID = userStore.userAccount;
  // const webSocketStore = useWebSocketStore(); // 已在顶部引入

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    console.error("无效的经纬度数据:", { longitude, latitude });
    return;
  }

  const location = {
    latitude: latitude,
    longitude: longitude,
  };

  const message = {
    type: "driver_gps",
    driver_id: localStorage.getItem("id"),
    location: location,
    car_id: localStorage.getItem("car_id"),
  };

  try {
    webSocketStore.sendMessage(JSON.stringify(message));
    console.log("位置信息已通过 WebSocket 发送:", message);
  } catch (error) {
    console.error("通过 WebSocket 发送数据时出错:", error);
  }
};

const updateMarkers = async () => {
  if (!map.value) {
    console.warn("地图未初始化");
    return;
  }

  markers.value.forEach(marker => map.value.remove(marker));
  markers.value = [];

  const messages = [...driverGpsMessages.value];
  messages.forEach((message) => {
    if (!message.location) return;
    const { location } = message;
    const marker = new AMap.Marker({
      position: [location.longitude, location.latitude],
      map: map.value,
    });
    markers.value.push(marker);
  });

  // const messages = [...driverGpsMessages.value];
  // messages.forEach((message) => {
  //   if (!message.location) return;
  //   const { location } = message;
  //   var gps = [[location.longitude, location.latitude]];
  //   AMap.convertFrom(gps, 'gps', function (status, result) {
  //     if (result.info === 'ok') {
  //       const lnglats = result.locations[0]; // {lng, lat}
  //       const marker = new AMap.Marker({
  //         position: [lnglats.lng, lnglats.lat],
  //         map: map.value,
  //       });
  //       markers.value.push(marker);
  //     }
  //   });
  // });


  // 清空已处理的消息队列
  webSocketStore.clearDriverGpsMessages(); // 假设存在该方法
};

const startUpdatingMarkers = () => {
  updateMarkers(); // 初始化时更新一次标记
  intervalId.value = setInterval(() => {
    updateMarkers();
  }, 3000); // 每隔三秒更新一次
};

// 处理状态变化
// const handleStatusChange = (status) => {
//   console.log("状态已更新为：", status);
//   updateMapStatus(status);
// };

// const updateMapStatus = (status) => {
//   let statusDisplay = document.getElementById("map-status-display");
//   if (!statusDisplay) {
//     const newStatus = document.createElement("div");
//     newStatus.id = "map-status-display";
//     newStatus.style.position = "absolute";
//     newStatus.style.top = "10px";
//     newStatus.style.right = "10px";
//     newStatus.style.background = "rgba(0, 0, 0, 0.5)";
//     newStatus.style.color = "white";
//     newStatus.style.padding = "5px 10px";
//     newStatus.style.borderRadius = "5px";
//     document.body.appendChild(newStatus);
//     newStatus.innerText = `状态：${status === "normal" ? "正常运营" : "试通行"}`;
//   } else {
//     statusDisplay.innerText = `状态：${status === "normal" ? "正常运营" : "试通行"}`;
//   }
// };

// 初始化 WebSocket
const initWebSocket = () => {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.webBaseUrl;
  webSocketStore.initWebSocket(localStorage.getItem("webprefixURL"));
};

// 发送消息
// const sendMessage = (message) => {
//   webSocketStore.sendMessage(message);
// };

// Lifecycle hooks
onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: "bc6f966d4758af8f40837aa7560ada04",
  };
  AMapLoader.load({
    key: "b97c0e27127e8ce02bbba2c585de79b1",
    version: "2.0",
    plugins: ["AMap.Scale"],
  })
    .then(() => {
      updateLocation();
      startUpdatingMarkers();
    })
    .catch((e) => {
      console.log(e);
    });

  // 初始化 WebSocket
  initWebSocket();
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.destroy();
  }
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
  webSocketStore.closeWebSocket();
});

defineExpose({
  showDriverInfo,
  closeDInfo,
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 800px;
}

#map-wrapper {
  position: relative;
  width: 60%;
  height: 60%;
}

/* 输入卡片样式 */
.input-card {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

/* 地图顶部状态栏样式 */
.map-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  /* 半透明背景 */
  padding: 10px;
  z-index: 1000;
  /* 确保覆盖在地图之上 */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-status-bar {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.online-count {
  font-size: 14px;
  color: #007bff;
}

/* 地图容器样式 */
#map-container {
  width: 100%;
  height: 50%;
  z-index: 1;
  /* 底层组件 */
}

/* 按钮样式 */
.btn {
  display: block;
  width: 100%;
  padding: 8px;
  background-color: #007bff;
  color: white;
  text-align: center;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.showDriverInfoButton {
  position: absolute;
  top: 20%;
  left: 1%;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  text-align: center;
  background: rgba(113, 65, 168, 0.5);
  color: floralwhite;
  line-height: 52px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  transform: translate(-50%, -50%);
}

.page-container {
  width: 95%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f3f4f6;
  min-height: 100vh;
}

.page-title {
  color: #4a4a4a;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.map-container {
  position: relative;
  height: 10px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.info-container {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 260px;
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #333;
  z-index: 10;
}

.info-container h4 {
  color: #008a6c;
  font-weight: 600;
}

.info-container p {
  color: #666;
  line-height: 1.6;
}

@media (min-width: 1024px) {
  .map-container {
    height: 600px;
  }
}
</style>
