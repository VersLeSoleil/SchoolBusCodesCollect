<template>
  <div class="order-page">
    <h2>个人订单</h2>

    <!-- 区分订单信息和支付信息 -->
    <el-tabs v-model="activeTab" type="card" class="tabs-container">
      <!-- 订单信息 Tab -->
      <el-tab-pane label="订单信息" name="order">
        <el-table v-show="activeTab === 'order'" :data="pagedOrderData" style="width: 100%" border stripe size="large">
          <el-table-column label="订单ID" prop="order_id" width="150" sortable></el-table-column>
          <el-table-column label="学生账号" prop="student_id" width="150"></el-table-column>
          <!-- 这里之后会改成站点名称的，不过现在是硬编码就随便了嗷 -->
          <el-table-column label="上车站点ID" prop="pickup_station_id" width="150"></el-table-column>
          <el-table-column label="下车站点ID" prop="dropoff_station_id" width="150"></el-table-column>
          <el-table-column label="上车时间" prop="pickup_time" width="395"></el-table-column>
          <el-table-column label="状态" prop="status" width="150"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <!-- 如果 isRated 为 true，则禁用按钮 -->
              <el-button size="large" style="font-size: 20px" type="primary" :disabled="row.isRated"
                @click="openFeedbackDialog(row)">
                {{ row.isRated ? '已评价' : '评价' }}
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
    computed
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

  const resizeObserverLoopErr = /ResizeObserver loop limit exceeded/;

  window.addEventListener('error', (e) => {
    if (resizeObserverLoopErr.test(e.message)) {
      e.stopImmediatePropagation();
    }
  });


  // 模拟订单信息数据（硬编码），添加 isRated 字段
  const orderData = ref([{
      order_id: 1,
      student_id: 22331011,
      pickup_station_id: 100001,
      dropoff_station_id: 100002,
      pickup_time: '2024-11-29 08:00',
      status: '进行中'
    },
    {
      order_id: 2,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 3,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 4,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 5,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 6,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 7,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 8,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 9,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 10,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },
    {
      order_id: 11,
      student_id: 22331011,
      pickup_station_id: 100003,
      dropoff_station_id: 100004,
      pickup_time: '2024-11-29 09:00',
      status: '完成'
    },

  ]);

  // 模拟支付信息数据（硬编码）
  const paymentData = ref([{
      payment_id: 10000001,
      payment_amount: 50.0,
      payment_method: '微信',
      payment_time: '2024-11-29 07:50',
      payment_status: '成功'
    },
    {
      payment_id: 10000002,
      payment_amount: 60.0,
      payment_method: '支付宝',
      payment_time: '2024-11-29 08:50',
      payment_status: '成功'
    },
  ]);

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
      feedback_id: Math.floor(Math.random() * 90000000 + 10000000),
      student_id: row.student_id,
      order_id: row.order_id,
      rating: 0,
      feedback_content: '',
      feedback_time: null,
    };
    feedbackDialogVisible.value = true;
  };

  // 提交评价
  const submitFeedback = () => {
    // 设置评价时间
    newFeedback.value.feedback_time = new Date().toISOString().slice(0, 16).replace('T', ' ');

    // 将订单的 isRated 字段标记为 true
    const order = orderData.value.find((o) => o.order_id === newFeedback.value.order_id);
    if (order) {
      order.isRated = true;
    }

    // 打印日志
    console.log('提交的评价:', newFeedback.value);
    console.log('更新后的订单数据:', orderData.value);

    // 关闭对话框
    feedbackDialogVisible.value = false;
  };
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