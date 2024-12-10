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
  import busStationData from "@/assets/bus_station_data.json";
  import { useUserStore } from "@/stores/user";
  
  /* global AMap */
  
  export default {
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
        polylineEditor: null, // 折线编辑器实例，用于编辑路线
        polylines: [], // 路线的折线对象数组，存储所有绘制在地图上的路线
        polyline: null, // 当前正在操作的折线对象
        stationMarkers: [], // 存储所有站点的标记对象，用于显示或隐藏站点
        routesVisible: true, // 是否显示当前绘制的路线，用于控制路线的可见性
        stationsVisible: true, // 是否显示站点，用于控制站点标记的可见性
        editingNewRoute: false, // 是否正在新增路线，用于控制新增路线模式
        newPolyline: null, // 新建的折线对象，用于新增路线时的存储
        onlineCount: 1, // 假设初始在线人数
        drivers: [], // 存储从后端获取的驾驶员位置数据
        markers: [], // 存储地图上的标记
        dInfoVisible: false,
        webSocket: null
      };
    },
    methods: {
      initMap(longitude, latitude) {
        this.map = new AMap.Map("container", {
          zoom: 10,
          center: [longitude, latitude],
        });
  
        AMap.plugin(
          ["AMap.Geolocation", "AMap.Driving", "AMap.PolylineEditor"],
          () => {
            const geolocation = new AMap.Geolocation({
              enableHighAccuracy: true,
              timeout: 10000,
              buttonOffset: new AMap.Pixel(10, 15),
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
      handleStatusChange(status) {
        console.log("状态已更新为：", status);
        // 更新地图上显示的状态
        this.updateMapStatus(status);
      },
      updateMapStatus(status) {
        // 示例：动态在地图上显示当前状态
        const statusDisplay = document.getElementById("map-status-display");
        if (!statusDisplay) {
          const newStatus = document.createElement("div");
          newStatus.id = "map-status-display";
          newStatus.style.position = "absolute";
          newStatus.style.top = "10px";
          newStatus.style.right = "10px";
          newStatus.style.background = "rgba(0, 0, 0, 0.5)";
          newStatus.style.color = "white";
          newStatus.style.padding = "5px 10px";
          newStatus.style.borderRadius = "5px";
          document.body.appendChild(newStatus);
          newStatus.innerText = `状态：${status === "normal" ? "正常运营" : "试通行"}`;
        } else {
          statusDisplay.innerText = `状态：${status === "normal" ? "正常运营" : "试通行"}`;
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
                // 调用发送位置信息到后端的方法
                this.sendLocationToBackendWebSocket(longitude, latitude);
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
      // 发送位置信息到后端
      async sendLocationToBackendWebSocket(longitude, latitude) {
        const userStore = useUserStore(); // 引入全局的 userStore
        const driverID = userStore.userAccount; // 获取全局变量中的 driver_id
  
        // 验证输入参数
        if (typeof longitude !== "number" || typeof latitude !== "number") {
          console.error("无效的经纬度数据:", { longitude, latitude });
          return;
        }
  
        // 检查 WebSocket 是否已连接
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
          console.error("WebSocket 未连接，无法发送数据");
          return;
        }
  
        // 构造消息
        const message = {
          id: driverID,
          latitude,
          longitude,
        };
  
        try {
          this.webSocket.send(JSON.stringify(message));
          console.log("位置信息已通过 WebSocket 发送:", message);
        } catch (error) {
          console.error("通过 WebSocket 发送数据时出错:", error);
        }
      },
  
      // 在地图上显示驾驶员位置
      updateMarkers() {
        // 清除旧的标记
        this.markers.forEach(marker => this.map.remove(marker));
        this.markers = [];
  
        // 根据新的驾驶员数据添加标记
        this.drivers.forEach(driver => {
          const marker = new AMap.Marker({
            position: [driver.longitude, driver.latitude], // 使用驾驶员的经纬度
            map: this.map,
            // icon: require('@/assets/driver-icon.png') // 引用自定义图标
          });
  
          this.markers.push(marker);
        });
      },
      // 初始化 WebSocket
      initWebSocket (){
        this.webSocket = new WebSocket("ws://localhost:8888/ws");
  
        // WebSocket 打开事件
        this.webSocket.onopen = () => {
          console.log("WebSocket 已连接");
        };
  
        // WebSocket 收到消息事件
        this.webSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.drivers = data;
            this.updateMarkers();
          } catch (error) {
            console.error("WebSocket 数据解析失败:", error);
          }
        };
  
        // WebSocket 错误事件
        this.webSocket.onerror = (error) => {
          console.error("WebSocket 错误:", error);
        };
  
        // WebSocket 关闭事件
        this.webSocket.onclose = () => {
          console.log("WebSocket 已关闭");
        };
      }
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
          this.initWebSocket(); // 初始化 WebSocket 连接
          this.updateLocation();
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
  