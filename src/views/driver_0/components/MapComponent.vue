<template>
  <div class="page-container">
    <div id="container" class="map-container"></div>
    <div class="controls-container">
      <!-- <button @click="showDriverInfo" class="showDriverInfoBtn">我的</button> -->
      <driver_Info :visible="dInfoVisible" :content="dInfoContent" @close="closeDInfo" />
      <!-- <button @click="toggleFooterControls" class="showMoreInfoBtn">
        {{ footerVisible ? "收起" : "更多" }}
      </button> -->
    </div>
    <transition name="slide-up">
      <div
        v-show="footerVisible"
        class="footer-controls-container"
      >
        <!-- <button class="btn" @click="toggleRoutes">
          {{ routesVisible ? "隐藏现有路线" : "显示现有路线" }}
        </button> -->
        <!-- <button class="btn toggleButton" @click="toggleStations">
          {{ stationsVisible ? "隐藏站点" : "显示站点" }}
        </button> -->
        <!-- <button class="btn autoLocateButton" @click="autoLocateCampus">
          自动定位到校区
        </button> -->

        <RemarkPlane />

        
      </div>
    </transition>
  </div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";
// import busStationData from "@/assets/bus_station_data.json";
import driver_Info from '@/views/driver_0/components/driver_Info.vue';
import RemarkPlane from "./RemarkPlane.vue";
// import {useApiBaseStore} from "@/stores/network";
import { useWebSocketStore } from '@/stores/webSocketStore';
import { computed, watch, getCurrentInstance } from 'vue';
  
/* global AMap */

export default {
  setup() {
    const webSocketStore = useWebSocketStore();

    // 通过 getter 或直接访问状态
    const driverGpsMessages = computed(() => webSocketStore.driverGpsMessages);
    // 使用 computed 來確保 Message 是響應式的
    const Message = computed(() => webSocketStore.messages);
    // 初始化时处理消息队列
    // 获取当前组件实例
    const { proxy } = getCurrentInstance();
    // 监听 Message 的变化
    // 动态加载路线的 watcher
    
    watch(
      Message, (newMessages) => {
        for (let i = 0; i < newMessages.length; i++) {
          const message = newMessages[i];
          console.log('Processing case_accept message:', message);

          // 判断消息类型
          if (message.type === 'route') {
            proxy.routes = message.routes;
            // 进行相应的处理
            if (!proxy.isMapInitialized)
            {
              setTimeout(() => {
                proxy.loadAndDrawRoutes();
              }, 10000);
            }
          }
          else if (message.type === 'site') {
            proxy.sites = message.sites;
            if (!proxy.isMapInitialized)
            {
              setTimeout(() => {
                proxy.addBusStationMarkers();
              }, 10000);
            }
          }
        }
      },
      { deep: true } // 确保监听数组内部的变化
    );
    return {
      webSocketStore,
      driverGpsMessages,
      Message,
    }
  },
  name: "MapComponent",
  components: {

    driver_Info,
    RemarkPlane,
    // ref,
  },
  data() {
    return {
      map: null, // 地图实例，用于存储高德地图对象
      marker: null, // 当前用户位置的标记
      intervalId: null, // 定时器 ID，用于位置更新
      isMapInitialized: false, // 地图是否已经初始化，用于避免重复初始化
      polylines: [], // 路线的折线对象数组，存储所有绘制在地图上的路线
      stationMarkers: [], // 存储所有站点的标记对象，用于显示或隐藏站点
      routesVisible: true, // 是否显示当前绘制的路线，用于控制路线的可见性
      stationsVisible: true, // 是否显示站点，用于控制站点标记的可见性
      onlineCount: 1, // 假设初始在线人数
      drivers: [], // 存储从后端获取的驾驶员位置数据
      dInfoVisible: false,
      dInfoContent: '', 
      footerVisible: false, // 控制 footer 是否可见
      routes: [], // 存储从后端获取的路线数据
      sites: [], // 存储从后端获取的站点数据
      markers: [], // 存储地图上的标记
    };
  },
  methods: {
    toggleFooterControls() {
      this.footerVisible = !this.footerVisible;
    },
    closeDInfo(){
      this.dInfoVisible=false;
    },
    showDriverInfo(){
      this.dInfoVisible=true;
    },
    initMap(longitude, latitude) {
      this.map = new AMap.Map("container", {
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
      // 清除之前的折线
      if (!this.isMapInitialized) {
        console.warn("地图尚未初始化，无法加载和绘制路线。");
      }
      this.polylines.forEach(polyline => this.map.remove(polyline));
      this.polylines = [];

      if (Array.isArray(this.routes) && this.routes.length > 0) {
        this.routes.forEach((route, index) => {
          const polyline = new AMap.Polyline({
            path: route.path,
            strokeColor: this.getRouteColor(index),
            strokeWeight: 6,
          });

          this.map.add(polyline);
          this.polylines.push(polyline);
          console.log(`绘制路径 ${index + 1} 成功`);
        });
      } else {
        console.warn('Routes 数据为空或不是数组');
      }
      // for (let i = 0; i < this.Message.length; i++) {
      //   const message = this.Message[i];

      //   // 判断消息类型为 'site'
      //   if (message.type === 'route') {
      //     // 提取 Sites 数组
      //     const routes = message.routes;

      //     // 检查是否存在 Sites
      //     if (Array.isArray(routes) && routes.length > 0) {

      //       // 示例：遍历 routes 数组
      //       routes.forEach((route, index) => {

      //         const polyline = new AMap.Polyline({
      //           path: route.path, // 路线点数组
      //           strokeColor: this.getRouteColor(index), // 根据索引设置颜色
      //           strokeWeight: 6,
      //         });

      //         this.map.add(polyline); // 添加到地图
      //         this.polylines.push(polyline); // 保存到 polylines 数组
      //         console.log(`绘制路径 ${index + 1} 成功`);
      //             });

      //       // 如果只需要处理一次，则可以在这里跳出循环
      //       break;
      //     } else {
      //       console.warn('Sites 数据为空或不是数组');
      //     }
      //   }
      // }
    },
    /** 添加站点标记 */
    addBusStationMarkers() {
      if (!this.map) return;
      if (Array.isArray(this.sites) && this.sites.length > 0) {
        this.sites.forEach((site) => {
          // console.log("asdfasdf");
          if (site.is_used == 0) return;
          // console.log("wqeq");
          const labelMarker = new AMap.LabelMarker({
            position:  [site.location.latitude,
                site.location.longitude],
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
          
          this.stationMarkers.push(labelMarker);
          this.map.add(labelMarker);
        });
      } else {
        console.warn('Sites 数据为空或不是数组');
      }
    },
    // addBusStationMarkers() {
    //   if (!this.map) return;
    //   busStationData.forEach((station) => {
    //     const labelMarker = new AMap.LabelMarker({
    //       position: station.position,
    //       text: {
    //         content: station.name,
    //         style: {
    //           fontSize: 15,
    //           fillColor: "#fff",
    //           backgroundColor: "blue",
    //           borderColor: "#ccc",
    //           borderWidth: 2,
    //           padding: [5, 10],
    //         },
    //       },
    //       icon: {
    //         image: require("@/assets/circle-icon.png"),
    //         size: [15, 15],
    //         anchor: "center",
    //       },
    //     });
    //     this.stationMarkers.push(labelMarker);
    //     this.map.add(labelMarker);
    //   });
    // },
    /** 路线颜色 */
    getRouteColor(index) {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']; // 可扩展颜色列表
      return colors[index % colors.length];
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
              // 调用发送位置信息到后端的方法
              // this.sendLocationToBackend(driverId, longitude, latitude);
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
    },
      // 发送位置信息到后端
    // sendLocationToBackend(driverId, longitude, latitude) {
    //   fetch("http://localhost:8888/updateLocation", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       id: driverId,
    //       role: "driver", // 用户角色
    //       latitude,
    //       longitude,
    //       timestamp: new Date().toISOString(), // 时间戳
    //     }),
    //   })
    //     .then((response) => response.text())
    //     .then((data) => console.log("服务器响应:", data))
    //     .catch((error) => console.error("请求错误:", error));
    // },

    // // 获取驾驶员数据
    // async fetchDrivers() {
    //   try {
    //     const apiBaseStore = useApiBaseStore();
    //     const response = await fetch(apiBaseStore.baseUrl + "/drivers");
    //     if (!response.ok) {
    //       throw new Error("网络请求失败");
    //     }
    //     this.drivers = await response.json();

    //     // 验证驾驶员数据是否有效
    //     this.drivers = this.drivers.filter(
    //       driver => typeof driver.latitude === "number" && typeof driver.longitude === "number"
    //     );

    //     this.updateMarkers(); // 更新地图上的标记
    //   } catch (error) {
    //     console.error("获取驾驶员位置失败:", error);
    //   }
    // },

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
      webSocketStore.initWebSocket(localStorage.getItem("webprefixURL"));
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
  height: 100%;
  height: 1300px;
  position: relative;
}

.controls-container {
  position: absolute;
  top: 60px;
  left: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-controls-container {
  position: relative;
  bottom: -50px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 0;
  z-index: 1000;
}

.footer-controls-container-enter-active,
.footer-controls-container-leave-active {
  transition: transform 0.3s;
}

.footer-controls-container-enter {
  transform: translateY(100%);
}

.footer-controls-container-leave-to {
  transform: translateY(100%);
}

.showDriverInfoBtn,
.showMoreInfoBtn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(113, 65, 168, 0.8);
  color: floralwhite;
  font-size: 14px;
}

.btn {
  margin: 0 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  flex-shrink: 0;
}

.btn:hover {
  background-color: #0056b3;
}

.autoLocateButton {
  background-color: #28a745;
}
.toggleButton {
    background-color: #ffc107;
}
</style>
