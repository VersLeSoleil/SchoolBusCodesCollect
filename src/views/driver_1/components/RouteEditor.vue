<template>
  <div>
    <button @click="startNewRoute" v-if="!editingNewRoute">新增路线</button>
    <button @click="endEditing(true)" v-if="editingNewRoute">保存并结束新增</button>
    <button @click="endEditing(false)" v-if="editingNewRoute">取消新增</button>

    <button @click="startEditingRoutes" v-if="!editingAllRoutes">编辑现有路线</button>
    <button @click="endEditingRoutes" v-if="editingAllRoutes">取消编辑</button>
    <button @click="saveEditedPolyline" v-if="editingAllRoutes">保存编辑</button>

    <div v-if="editingAllRoutes">
      <div v-for="(polyline, index) in polylines" :key="index">
        <!-- 将 route_id[index] 传递给 startEditingPolyline -->
        <button @click="startEditingPolyline(polyline, route_id[index])">
          编辑路线 {{ route_id[index] }}
        </button>
        <!-- 删除按钮 -->
        <button @click="deleteRoute(route_id[index])" style="color: red">
          删除路线 {{ route_id[index] }}
        </button>
      </div>
    </div>

  </div>
</template>


<script>
import { useWebSocketStore } from '@/stores/webSocketStore';

export default {
  setup() {
    const webSocketStore = useWebSocketStore();

    return {
      webSocketStore,
    }
  },
  props: {
    polylineEditor: Object,
    polylines: Array,
    route_id: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      editingNewRoute: false,
      editingAllRoutes: false,
      newPolyline: null,
      currentRouteID: 0,
    };
  },
  methods: {
    startNewRoute() {
      if (!this.polylineEditor) return;

      const currentPolyline = this.polylineEditor.getTarget();
      if (currentPolyline) {
        const userConfirmed = window.confirm("当前正在编辑的路线尚未保存，是否新建路线？");
        if (!userConfirmed) {
          console.log("用户取消切换路线");
          return;
        }
        this.editingAllRoutes = false;
        this.polylineEditor.setTarget(null);
      } else {
        this.polylineEditor.setTarget();
        this.polylineEditor.open();
      }
      this.editingNewRoute = true;
    },
    endEditing(save) {
      try {
        this.newPolyline = this.polylineEditor?.getTarget();

        if (!this.newPolyline) {
          console.warn("没有找到新建的路线，可能已经被移除");
          this.editingNewRoute = false;
          return;
        }

        const path = this.newPolyline.getPath();
        this.polylineEditor.setTarget(null);
        this.polylineEditor.close();

        if (save) {
          // 彈出提示框，要求輸入路徑 ID
          let routeID = prompt("請輸入路綫 ID（只能為數字）:");

          // 驗證輸入是否合法
          while (!routeID || isNaN(routeID)) {
            alert("路徑 ID 必須為有效的數字！");
            routeID = prompt("請重新輸入路徑 ID（只能為數字）:");
          }
          const message = {
            type: "update_routes", // 消息類型
            routes: [
              {
                id: parseInt(routeID, 10), // 將路徑 ID 轉為數字類型
                path: path.map((point) => [point.lng, point.lat]), // 路徑點轉換為二維數組 [lng, lat]
              },
            ],
            time: new Date().toISOString(), // 當前時間
          };
          this.webSocketStore.sendMessage(JSON.stringify(message));

          // 使用 $emit 通知父组件添加新路线
          // 更新本地状态
          // this.route_id.push(routeID); // 将新增的 route_id 添加到数组中
          this.$emit("add-polyline", this.newPolyline);
        } else {
          this.polylineEditor.setTarget(null);
          this.polylineEditor.close();
          this.$emit("remove-polyline", this.newPolyline); // 通知父组件删除路线
        }
      } catch (error) {
        console.error("在结束编辑时发生错误:", error);
      } finally {
        this.newPolyline = null;
        this.editingNewRoute = false;
      }
    },
    startEditingRoutes() {
      this.editingAllRoutes = true;
    },
    endEditingRoutes() {
      this.polylineEditor.setTarget(null);
      this.polylineEditor.close();
      this.editingAllRoutes = false;
    },
    saveEditedPolyline() {
      if (!this.polylineEditor) return;

      const targetPolyline = this.polylineEditor.getTarget();
      if (!targetPolyline) return;

      const updatedPath = targetPolyline.getPath();
      const userConfirmed = window.confirm("是否保存编辑后的路线？");
      if (userConfirmed) {
        const message = {
          type: "update_routes", // 消息类型
          routes: [
            {
              id: parseInt(this.currentRouteID, 10), // 使用当前正在编辑的 route_id
              path: updatedPath.map((point) => [point.lng, point.lat]), // 路径点转换为二维数组 [lng, lat]
            },
          ],
          time: new Date().toISOString(), // 当前时间
        };
        this.webSocketStore.sendMessage(JSON.stringify(message));
        alert(`路线 ${this.currentRouteID} 已成功保存！`);
      }
      this.polylineEditor.setTarget(null);
      this.polylineEditor.close();
    },

    startEditingPolyline(polyline, routeID) {
      // 记录当前正在编辑的路线 ID
      console.log("正在编辑的路线 ID:", routeID);

      // 打开 Polyline 编辑器
      this.polylineEditor.setTarget(polyline);
      this.polylineEditor.open();

      // 可以将 routeID 保存到一个变量中以便后续使用
      this.currentRouteID = routeID;
    },
    deleteRoute(routeID) {
      const userConfirmed = window.confirm(`是否确认删除路线 ${routeID}？`);
      if (userConfirmed) {
        // 构造 WebSocket 消息
        const message = {
          type: "delete_route", // 消息类型
          routes: [
            {
              id: routeID,
            },
          ],
          time: new Date().toISOString(), // 当前时间
        };

        // 发送消息到后端
        this.webSocketStore.sendMessage(JSON.stringify(message));

        // 从本地状态中移除该路线
        // const routeIndex = this.route_id.indexOf(routeID);
        // if (routeIndex > -1) {
        //   this.route_id.splice(routeIndex, 1); // 删除 route_id
        //   this.polylines.splice(routeIndex, 1); // 删除对应的 polyline
        // }

        alert(`路线 ${routeID} 已成功删除！`);
      }
    },
  },
};
</script>
