<template>
  <div class="page-container">
    <div id="container" class="map-container">
      <div class="info-container">
        <button class="btn" @click="toggleRoutes" style="margin-bottom: 5px">
          {{ routesVisible ? '隐藏现有路线' : '显示现有路线' }}
        </button>
        <button class="btn" @click="toggleStations" style="margin-bottom: 5px">
          {{ stationsVisible ? '隐藏站点' : '显示站点' }}
        </button>
      </div>
    </div>
  </div>
</template>
  
  
<script>
import AMapLoader from "@amap/amap-jsapi-loader";
// import busStationData from "@/assets/bus_station_data.json";
// import {useApiBaseStore} from "@/stores/network";
import { useWebSocketStore } from '@/stores/webSocketStore';
import { computed, watch, getCurrentInstance, onMounted } from 'vue';
  
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
            // proxy.$emit("updateSites", message.sites);
            proxy.updateSites();
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

    onMounted(() => {
      for (let i = 0; i < Message.value.length; i++) {
          const message = Message.value[i];
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
            // proxy.$emit("updateSites", message.sites);
            proxy.updateSites();
            if (!proxy.isMapInitialized)
            {
              setTimeout(() => {
                proxy.addBusStationMarkers();
              }, 10000);
            }
          }
        }
    });
    return {
      webSocketStore,
      driverGpsMessages,
      Message,
    }
  },
  name: "user_map",
  components: {
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
    updateSites() {
      this.$emit("updateSites", this.sites);
    },
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
    },
    /** 添加站点标记 */
    addBusStationMarkers() {
      if (!this.map) return;
      if (Array.isArray(this.sites) && this.sites.length > 0) {
        this.sites.forEach((site) => {
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
          
          this.stationMarkers.push(labelMarker);
          this.map.add(labelMarker);
        });
      } else {
        console.warn('Sites 数据为空或不是数组');
      }
    },
    /** 路线颜色 */
    getRouteColor(index) {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']; // 可扩展颜色列表
      return colors[index % colors.length];
    },

    /** 更新位置 */
    updateLocation() {
      const message1 = {
        type: "connections",
        driver_id: localStorage.getItem("id"),
      };
      this.webSocketStore.sendMessage(JSON.stringify(message1));
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
    webSocketStore.initWebSocket(localStorage.getItem("webprefixURL")); // 初始化 WebSocket
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
  /* 地图容器样式 */
  #map-container {
    width: 100%;
    height: 80%;
    z-index: 1;
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
  .page-container {
    width: 95%;
    height:70vx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #ffffff;
  }

  .map-container {
    position: relative;
    height:100%;
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
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
  