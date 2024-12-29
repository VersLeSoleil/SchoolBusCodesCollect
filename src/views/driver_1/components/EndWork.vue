<template>
  <div>
    <!-- 信息填写窗口 -->
    <div v-if="showForm" class="form-modal">
      <div class="form-content">
        <h3>确认下班</h3>
        <form @submit.prevent="submitForm">
          <div class="form-actions">
            <button type="submit"  class="submit-button">下班</button>
            <button type="button" @click="closeForm" class="cancel-button">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {useRouter} from 'vue-router';
import {useApiBaseStore} from "@/stores/network"; // Vue Router 的组合式 API

export default {
  data() {
    return {
      showForm: false, // 控制弹窗显示与否
      formData: {
        driver_id: localStorage.getItem("id"),  // 工号
        route_id: localStorage.getItem("route_id"),       // 路线路径
        car_id: localStorage.getItem("car_id"),       // 车牌号
        car_isusing: "休息",
      },
      router: useRouter(), // 获取路由实例
    };
  },
  methods: {
    // 打开表单
    openForm() {
      this.showForm = true;
    },
    // 关闭表单
    closeForm() {
      this.showForm = false;
      this.resetForm();
    },
    // 重置表单
    resetForm() {
      this.formData = {
        driver_id: localStorage.getItem("id"),
        route_id: localStorage.getItem("route_id"),
        car_id: localStorage.getItem("car_id"),
        car_isusing:"休息",
      };
    },
    // 提交表单
    async submitForm() {
      try {
        const apiBaseStore = useApiBaseStore();
        let endpoint = apiBaseStore.baseUrl + "/end";
        let method = "POST";
        let requestBody = {
            driver_id: this.formData.driver_id,
            car_id: this.formData.car_id,
            route_id: parseInt(this.formData.route_id, 10),
            car_isusing:this.formData.car_isusing
          };

        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        console.log(JSON.stringify(requestBody));
        const result = await response.json();

        if (response.ok) {
          // 信息提交成功
          alert("操作成功！");
          this.router.push('/driver-0'); // 跳转到 `/driver-0`
          // window.location.href = "/driver-1"; // 替换为目标页面路径
        } else {
          // 错误处理
          alert(result.message || "操作失败，请检查输入！");
        }
      } catch (error) {
        console.error("提交失败:", error);
        alert("提交失败，请稍后再试！");
      }
    },
  },
};
</script>

<style scoped>
.form-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.form-item {
  margin-bottom: 15px;
}
.form-item label {
  display: block;
  margin-bottom: 5px;
}
.form-item input,
.form-item select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-actions {
  display: flex;
  justify-content: space-between;
}
.submit-button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.cancel-button {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
