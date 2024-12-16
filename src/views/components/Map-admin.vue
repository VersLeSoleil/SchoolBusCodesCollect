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
    </div>
    <!-- 输入功能卡片 -->
    <div class="input-card" style="width: 200px">
        <!-- 按钮和交互内容 -->
        <div v-if="editingNewRoute" style="margin-left: 10px">
            <button class="btn" @click="endEditing(false)" style="margin-bottom: 5px">结束(不保存)</button>
            <button class="btn" @click="endEditing(true)" style="margin-bottom: 5px">结束(保存到JSON)</button>
        </div>
        <button class="btn" @click="autoLocateCampus" style="margin-bottom: 5px">
            自动定位到校区
        </button>
        <input type="file" @change="handleFileUpload" accept=".json" style="margin-top: 10px" />
    </div>
    <div>
        <h1>车辆信息管理</h1>
        <VehicleForm />
    </div>
    <div id="app">
        <div id="container"></div>
        <!-- 地图外层容器 -->
        <div id="map-wrapper">
            <!-- 顶部覆盖条 -->
            <div class="map-top-bar">
                <ErrorBoundary>
                    <VehicleStatusToggle @status-change="handleStatusChange" />
                    <span class="online-count">在线 {{ onlineCount }} 人</span>
                </ErrorBoundary>
            </div>

            <!-- 地图容器 -->
            <div id="map-container"></div>
        </div>
        <!-- 管理员的功能 -->
        <RouteEditor :polylineEditor="polylineEditor" :polylines="polylines" @add-polyline="addPolyline"
            @remove-polyline="removePolyline" />
    </div>
</template>


<script>
import AMapLoader from "@amap/amap-jsapi-loader";
import busStationData from "@/assets/bus_station_data.json";
import VehicleStatusToggle from "@/views/driver_1/components/VehicleStatusToggle.vue";
import ErrorBoundary from "@/views/driver_1/components/ErrorBoundary.vue";
import RouteEditor from "@/views/driver_1/components/RouteEditor.vue";
import VehicleForm from "@/views/driver_0/components/VehicleForm.vue";
// import { useUserStore } from "@/stores/user";
import { useWebSocketStore } from '@/stores/webSocketStore';
import { computed } from 'vue';

/* global AMap */

export default {
    setup() {
        const webSocketStore = useWebSocketStore();

        // 通过 getter 或直接访问状态
        const driverGpsMessages = computed(() => webSocketStore.driverGpsMessages);

        return {
        driverGpsMessages,
        };
    },
    name: "MapComponent",
    components: {
        VehicleStatusToggle,
        ErrorBoundary,
        VehicleForm,
        RouteEditor,
        // ref,
    },
    data() {
        return {
            map: null, // 地图实例，用于存储高德地图对象
            marker: null, // 当前用户位置的标记
            intervalId: null, // 定时器 ID，用于位置更新
            isMapInitialized: false, // 地图是否已经初始化，用于避免重复初始化
            polylineEditor: null, // 折线编辑器实例，用于编辑路线
            polylines: [], // 路线的折线对象数组，存储所有绘制在地图上的路线
            polyline: null, // 当前正在操作的折线对象
            stationMarkers: [], // 存储所有站点的标记对象，用于显示或隐藏站点
            routesVisible: true, // 是否显示当前绘制的路线，用于控制路线的可见性
            stationsVisible: true, // 是否显示站点，用于控制站点标记的可见性
            editingNewRoute: false, // 是否正在新增路线，用于控制新增路线模式
            newPolyline: null, // 新建的折线对象，用于新增路线时的存储
            editingAllRoutes: false, // 是否正在编辑所有路线，用于控制编辑路线模式
            onlineCount: 1, // 假设初始在线人数
            drivers: [], // 存储从后端获取的驾驶员位置数据
            markers: [], // 存储地图上的标记
            webSocket: null,
            isConnected: false,
        };
    },
    methods: {
        initMap(longitude, latitude) {
            this.map = new AMap.Map("container", {
                zoom: 15,
                center: [longitude, latitude],
            });

            AMap.plugin(
                ["AMap.ToolBar", "AMap.Geolocation", "AMap.Driving", "AMap.PolylineEditor"],
                () => {
                    const toolbar = new AMap.ToolBar();
                    this.map.addControl(toolbar);

                    const geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true,
                        timeout: 10000,
                        buttonOffset: new AMap.Pixel(10, 20),
                        zoomToAccuracy: true,
                    });
                    this.map.addControl(geolocation);

                    geolocation.getCurrentPosition((status, result) => {
                        if (status === "complete") {
                            console.log("定位成功:", result);
                            this.addBusStationMarkers();
                        } else {
                            console.error("定位失败:", result);
                        }
                    });

                    this.polylineEditor = new AMap.PolylineEditor(this.map, this.polyline);
                }
            );

            this.addBusStationMarkers();
            this.loadAndDrawRoutes(); // 加载并绘制路线
            this.isMapInitialized = true;
        },
        /** 自动定位到校区 */
        autoLocateCampus() {
            // 校区的经纬度
            const campusCenter = [113.584845, 22.358088];
            if (!this.map) return;

            this.map.setZoomAndCenter(15, campusCenter); // 设置缩放级别和中心点
            console.log("已定位到校区中心:", campusCenter);
        },
        /** 显示/隐藏现有路线 */
        toggleRoutes() {
            this.routesVisible = !this.routesVisible;
            this.polylines.forEach((polyline) => {
                if (this.routesVisible) {
                    this.map.add(polyline);
                } else {
                    this.map.remove(polyline);
                }
            });
        },
        /** 显示/隐藏站点 */
        toggleStations() {
            this.stationsVisible = !this.stationsVisible;
            this.stationMarkers.forEach((marker) => {
                if (this.stationsVisible) {
                    this.map.add(marker);
                } else {
                    this.map.remove(marker);
                }
            });
        },
        /** 动态加载路线 */
        loadAndDrawRoutes() {
            const context = require.context('@/assets', false, /^\.\/route[0-9]+\.json$/); // 匹配以 route 开头的 JSON 文件
            const routes = [];
            console.log("匹配到的文件:", context.keys());

            context.keys().forEach((fileName) => {
                const fileData = context(fileName);
                console.log("加载的文件内容:", fileName, fileData);

                // 确保文件内容格式正确
                if (Array.isArray(fileData)) {
                    fileData.forEach((route) => {
                        if (route && route.path) {
                            routes.push(route.path);
                        }
                    });
                }
            });

            // 绘制所有路径到地图
            routes.forEach((path, index) => {
                const polyline = new AMap.Polyline({
                    path: path, // 路线点数组
                    strokeColor: this.getRouteColor(index), // 根据索引设置颜色
                    strokeWeight: 6,
                });

                this.map.add(polyline); // 添加到地图
                this.polylines.push(polyline); // 保存到 polylines 数组
                console.log(`绘制路径 ${index + 1} 成功`, path);
            });

            console.log("所有符合条件的路线已加载并绘制");
        },
        /** 添加站点标记 */
        addBusStationMarkers() {
            if (!this.map) return;
            busStationData.forEach((station) => {
                const labelMarker = new AMap.LabelMarker({
                    position: station.position,
                    text: {
                        content: station.name,
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
                this.stationMarkers.push(labelMarker);
                this.map.add(labelMarker);
            });
        },
        /** 路线颜色 */
        getRouteColor(index) {
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']; // 可扩展颜色列表
            return colors[index % colors.length];
        },
        // 管理员的功能
        addPolyline(newPolyline) {
            this.polylines.push(newPolyline); // 添加新路线
        },
        removePolyline(polyline) {
            const index = this.polylines.indexOf(polyline);
            if (index > -1) {
                this.polylines.splice(index, 1); // 移除指定的路线
            }
        },

    /** 更新位置 */
    updateLocation() {
      if (navigator.geolocation) {
        this.intervalId = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { longitude, latitude } = position.coords;

              if (!this.isMapInitialized) {
                this.initMap(longitude, latitude);
              } else if (this.marker) {
                this.marker.setPosition([longitude, latitude]);
              }
            },
            (error) => {
              console.error("无法获取位置", error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
          );
        }, 1000);
      } else {
        console.error("浏览器不支持地理定位");
      }
    },
    // 在地图上显示驾驶员位置
    async updateMarkers() {
      if (!this.map) {
        console.warn("地图未初始化");
        return;
      }
      // 清除旧的标记
      // this.markers.forEach((marker) => this.map.remove(marker));
      this.markers.forEach(marker => this.map.remove(marker));
      this.markers = [];

      // 从响应式的 driverGpsMessages 中读取数据
      const messages = [...this.driverGpsMessages];
      messages.forEach((message) => {
        if (!message.location) return; // 确保 location 存在
        const { location } = message;
        const marker = new AMap.Marker({
          position: [location.longitude, location.latitude],
          map: this.map,
          
        });
        this.markers.push(marker);
      });

      // 清空已处理的消息队列
      this.driverGpsMessages.splice(0, this.driverGpsMessages.length); // 清空队列
    },

    // 定时更新
    startUpdatingMarkers() {
      this.updateMarkers(); // 初始化时更新一次标记
      this.updateInterval = setInterval(() => {
        this.updateMarkers();
      }, 3000); // 每隔三秒更新一次
    },

    // 初始化 WebSocket
    initWebSocket (){        
      const webSocketStore = useWebSocketStore();
      webSocketStore.initWebSocket("ws://localhost:8888/ws");
    },
        // 可以添加其他处理方法，如发送消息
    sendMessage(message) {
      const webSocketStore = useWebSocketStore();
      webSocketStore.sendMessage(message);
    },
  },
  created() {
    const webSocketStore = useWebSocketStore();
    webSocketStore.initWebSocket(); // 初始化 WebSocket
  },
    mounted() {
        window._AMapSecurityConfig = {
            securityJsCode: "bc6f966d4758af8f40837aa7560ada04", // 安全密钥
        };
        AMapLoader.load({
            key: "b97c0e27127e8ce02bbba2c585de79b1", // Web端开发者Key
            version: "2.0",
            plugins: ["AMap.Scale"],
        })
            .then(() => {
                this.updateLocation();
                // 开始定时更新
                this.startUpdatingMarkers();
            })
            .catch((e) => {
                console.log(e);
            });
    },
    beforeUnmount() {
        this.map?.destroy();
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        const webSocketStore = useWebSocketStore();
        webSocketStore.closeWebSocket(); // 关闭 WebSocket 连接
    },
};
</script>

<style scoped>
#container {
  width: 100%;
  height: 500px;
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
  height: 60%;
}
</style>
<style scoped>
/* 地图容器样式 */
#map-wrapper {
  position: relative;
  width: 100%;
  height: 100px;
}

/* 地图顶部覆盖条 */
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

/* 地图容器样式 */
#map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
  /* 底层组件 */
}

/* 输入卡片样式 */
.input-card {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
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
  left: 85%;
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
  height: 700px;
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