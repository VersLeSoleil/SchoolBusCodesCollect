<template>
  <div class="comment-page">
    <h2>评价反馈</h2>

    <!-- 评价表格 -->
    <el-table :data="pagedFeedbackData" style="width: 100%" border stripe size="large">
      <el-table-column label="评价ID" prop="feedback_id" width="130" sortable></el-table-column>
      <el-table-column label="学生账号" prop="student_number" width="130"></el-table-column>
      <el-table-column label="订单ID" prop="order_id" width="130"></el-table-column>
      <el-table-column label="评分" prop="rating" width="160" sortable>
        <template #default="{ row }">
          <el-rate v-model="row.rating" disabled></el-rate>
        </template>
      </el-table-column>
      <el-table-column label="反馈内容" prop="feedback_content" width="550"></el-table-column>
      <el-table-column label="反馈时间" prop="feedback_time" width="238"></el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination :total="feedbackData.length" :page-size="pageSize" :current-page="currentPage"
      layout="prev, pager, next" @current-change="handlePageChange" class="pagination" size="large"></el-pagination>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted
} from 'vue';
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElRate
} from 'element-plus';
import axios from 'axios';
import { getUserIDFromToken } from "@/auth.js";

const feedbackData = ref([]); // 存储从后端获取的评价数据
const pageSize = 6; // 每页显示的条数
const currentPage = ref(1); // 当前页码

// 计算当前页的评价数据
const pagedFeedbackData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  return feedbackData.value.slice(startIndex, startIndex + pageSize);
});

// 页码变动处理
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
};

// 从后端获取评价数据
const fetchFeedbackData = async () => {
  const prefixURL = localStorage.getItem("prefixURL") || 'https://localhost:8888';
  const token = localStorage.getItem("jwtToken");
  const userID = getUserIDFromToken(token);

  const params = new URLSearchParams();
  params.append("userID", userID);

  try {
    const response = await axios.post(`${prefixURL}/api/getFeedback`, params);
    if (response.data) {
      feedbackData.value = response.data || [];
      console.log("Received feedback data:", response.data);
    } else {
      console.error("No feedback data returned");
    }
  } catch (error) {
    console.error("Failed to fetch feedback data:", error);
  }
};

// 在组件挂载时调用数据获取函数
onMounted(() => {
  fetchFeedbackData();
});
</script>

<style scoped>
  .comment-page {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.5s ease-in-out;
  }

  h2 {
    text-align: center;
    color: #409eff;
    margin-bottom: 25px;
    font-size: 35px;
    animation: fadeIn 0.6s ease-in-out;
  }

  .el-table th {
    background-color: #409eff;
    color: white;
    animation: fadeIn 0.6s ease-in-out;
  }

  .el-rate {
    color: #f56c6c;
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
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>