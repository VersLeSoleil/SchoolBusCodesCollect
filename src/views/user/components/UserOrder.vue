<template>
  <div class="order-page">
    <h2>个人订单</h2>

    <!-- 区分订单信息和支付信息 -->
    <el-tabs v-model="activeTab" type="card" class="tabs-container">
      <!-- 订单信息 Tab -->
      <el-tab-pane label="订单信息" name="order">
        <el-table v-show="activeTab === 'order'" :data="pagedOrderData" style="width: 100%" border stripe size="large">
          <el-table-column label="订单ID" prop="order_id" width="150" sortable></el-table-column>
          <el-table-column label="学生账号" prop="student_account" width="150"></el-table-column>
          <!-- 这里之后会改成站点名称的，不过现在是硬编码就随便了嗷 -->
          <el-table-column label="上车站点ID" prop="pickup_station_id" width="150"></el-table-column>
          <el-table-column label="下车站点ID" prop="dropoff_station_id" width="150"></el-table-column>
          <el-table-column label="上车时间" prop="pickup_time" width="395"></el-table-column>
          <el-table-column label="状态" prop="status" width="150"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <!-- 如果 is_rated 为 true，则禁用按钮 -->
              <el-button size="large" style="font-size: 20px" type="primary" :disabled="row.is_rated"
                @click="openFeedbackDialog(row)">
                {{ row.is_rated ? '已评价' : '评价' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination :total="orderData.length" :page-size="pageSize" :current-page="currentPage"
          layout="prev, pager, next" @current-change="handlePageChange" size="large" class="pagination"></el-pagination>
      </el-tab-pane>

      <!-- 支付信息 Tab -->
      <el-tab-pane label="支付信息" name="payment">
        <el-table v-show="activeTab === 'payment'" :data="pagedPaymentData" style="width: 100%" border stripe>
          <el-table-column label="支付ID" prop="payment_id" width="150" sortable></el-table-column>
          <el-table-column label="支付金额" prop="payment_amount" width="150"></el-table-column>
          <el-table-column label="支付方式" prop="payment_method" width="150"></el-table-column>
          <el-table-column label="支付时间" prop="payment_time" width="600"></el-table-column>
          <el-table-column label="支付状态" prop="payment_status" width="230"></el-table-column>
        </el-table>
        <el-pagination :total="paymentData.length" :page-size="pageSize" :current-page="currentPage"
          layout="prev, pager, next" @current-change="handlePageChange" class="pagination"></el-pagination>
      </el-tab-pane>
    </el-tabs>

    <!-- 评价对话框 -->
    <el-dialog title="添加评价" v-model="feedbackDialogVisible" width="500px">
      <el-form :model="newFeedback" label-width="80px" size="large">
        <el-form-item label="评分">
          <el-rate v-model="newFeedback.rating"></el-rate>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="newFeedback.feedback_content" placeholder="请输入评价内容" maxlength="200"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    onMounted,
  } from 'vue';
  import {
    ElTable,
    ElTableColumn,
    ElTabs,
    ElTabPane,
    ElPagination,
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElRate,
    ElInput,
  } from 'element-plus';
  import { getUserIDFromToken } from "@/auth.js";
  import axios from 'axios';
  const resizeObserverLoopErr = /ResizeObserver loop limit exceeded/;

  window.addEventListener('error', (e) => {
    if (resizeObserverLoopErr.test(e.message)) {
      e.stopImmediatePropagation();
    }
  });


  // 订单信息数据
  const orderData = ref([]);

  // 支付信息数据
  const paymentData = ref([]);

  // 每页显示数据条数
  const pageSize = 6;
  const currentPage = ref(1);

  // 计算当前页显示的订单信息
  const pagedOrderData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize;
    return orderData.value.slice(startIndex, startIndex + pageSize);
  });

  // 计算当前页显示的支付信息
  const pagedPaymentData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize;
    return paymentData.value.slice(startIndex, startIndex + pageSize);
  });

  // 页码变动时更新页面
  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
  };

  // 当前选中的标签
  const activeTab = ref('order');

  // 评价对话框相关
  const feedbackDialogVisible = ref(false); // 对话框显示状态/
  const newFeedback = ref({
    feedback_id: null,
    student_id: null,
    order_id: null,
    rating: 0,
    feedback_content: '',
    feedback_time: null,
  });

  // 打开评价对话框
  const openFeedbackDialog = (row) => {
    newFeedback.value = {
      feedback_id: Math.floor(Math.random() * 10),
      student_id: row.student_account,
      order_id: row.order_id,
      rating: 0,
      feedback_content: '',
      feedback_time: null,
    };
    feedbackDialogVisible.value = true;
  };

  // 提交评价
  const submitFeedback = async () => {
  // 设置评价时间
  const now = new Date();
const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 将当前时间加上 8 小时，转为中国时区时间
newFeedback.value.feedback_time = chinaTime.toISOString().slice(0, 16).replace('T', ' ');

    console.log(newFeedback.value.feedback_time);
  const prefixURL = localStorage.getItem("prefixURL") || 'http://localhost:8888';

  try {
    // 将评价数据发送到后端
    const response = await axios.post(`${prefixURL}/api/addFeedback`, {
      order_id: newFeedback.value.order_id, // 当前行的 order_id
      student_number: newFeedback.value.student_id, // 当前行的 student_id
      rating: newFeedback.value.rating, // 用户评分
      feedback_content: newFeedback.value.feedback_content, // 用户评价内容
      feedback_time: newFeedback.value.feedback_time, // 时间
    });

    if (response.status === 200) {
      // 将订单的 isRated 字段标记为 true
      const order = orderData.value.find((o) => o.order_id === newFeedback.value.order_id);
      if (order) {
        order.is_rated = true;
      }

      // 关闭对话框
      feedbackDialogVisible.value = false;
    } else {
      console.error("Failed to submit feedback:", response.data);
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
  }
};

const fetchData = async () => {
  const prefixURL = localStorage.getItem("prefixURL") || 'http://localhost:8888';
  const token = localStorage.getItem("jwtToken");
  const userID = getUserIDFromToken(token);

  const params = new URLSearchParams();
  params.append("userID", userID);

  try {
    const response = await axios.post(`${prefixURL}/api/getOrders`, params);
    if (response.data) {
      orderData.value = response.data.orders.map(order => ({
            ...order,
            isRated: order.is_rated,
        })) || [];
      paymentData.value = response.data.payments || [];
      console.log("Fetched orders successfully:", orderData.value);

      
    } else {
      console.error("No order data returned");
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};


  onMounted(() => {
    fetchData();
});
</script>

<style scoped>
  .order-page {
    background-color: #f0f2f5;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  h2 {
    text-align: center;
    color: #409eff;
    margin-bottom: 10px;
    font-size: 35px;
  }

  .tabs-container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 10px;
  }

  .el-table th {
    background-color: #409eff;
    color: white;
  }

  .el-button {
    background-color: #409eff;
    color: white;
    border: none;
  }

  .el-button:hover {
    background-color: #66b1ff;
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
  }

  ::v-deep .cell {
    text-align: center;
    vertical-align: middle;
    font-size: 20px;
    /* padding: 10px; */
    /* border-top: 1px solid #e2e4e8; */
  }

  ::v-deep .el-tabs__item {
    text-align: center;
    font-size: 20px;
  }
</style>