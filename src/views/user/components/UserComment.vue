<template>
  <div class="comment-page">
    <h2>评价反馈</h2>

    <!-- 评价表格 -->
    <el-table :data="pagedFeedbackData" style="width: 100%" border stripe size="large">
      <el-table-column label="评价ID" prop="feedback_id" width="130" sortable></el-table-column>
      <el-table-column label="学生账号" prop="student_id" width="130"></el-table-column>
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
    computed
  } from 'vue';
  import {
    ElTable,
    ElTableColumn,
    ElPagination,
    ElRate
  } from 'element-plus';

  // 硬编码的评价反馈数据
  const feedbackData = ref([{
      feedback_id: 10000001,
      student_id: 22331011,
      order_id: 10000001,
      rating: 5,
      feedback_content: '服务非常好，司机很准时。',
      feedback_time: '2024-11-28 10:00',
    },
    {
      feedback_id: 10000002,
      student_id: 22331012,
      order_id: 10000002,
      rating: 4,
      feedback_content: '车站设施不错，但时间稍微晚了点。',
      feedback_time: '2024-11-28 11:00',
    },
    {
      feedback_id: 10000003,
      student_id: 22331013,
      order_id: 10000003,
      rating: 3,
      feedback_content: '车内卫生需要改进。',
      feedback_time: '2024-11-28 12:00',
    },
    {
      feedback_id: 10000004,
      student_id: 22331014,
      order_id: 10000004,
      rating: 5,
      feedback_content: '很满意，司机态度很好。',
      feedback_time: '2024-11-28 13:00',
    },
    {
      feedback_id: 10000005,
      student_id: 22331015,
      order_id: 10000005,
      rating: 4,
      feedback_content: '总体还行，就是车站稍微挤了些。',
      feedback_time: '2024-11-28 14:00',
    },
    {
      feedback_id: 10000006,
      student_id: 22331016,
      order_id: 10000006,
      rating: 2,
      feedback_content: '时间太晚，等了很久。',
      feedback_time: '2024-11-28 15:00',
    },
    {
      feedback_id: 10000007,
      student_id: 22331017,
      order_id: 10000007,
      rating: 5,
      feedback_content: '很满意的一次服务，值得推荐。',
      feedback_time: '2024-11-28 16:00',
    },
    {
      feedback_id: 10000008,
      student_id: 22331018,
      order_id: 10000008,
      rating: 3,
      feedback_content: '整体还行，车内有异味。',
      feedback_time: '2024-11-28 17:00',
    },
    {
      feedback_id: 10000009,
      student_id: 22331019,
      order_id: 10000009,
      rating: 4,
      feedback_content: '服务不错，但有改进空间。',
      feedback_time: '2024-11-28 18:00',
    },
    {
      feedback_id: 10000010,
      student_id: 22331020,
      order_id: 10000010,
      rating: 5,
      feedback_content: '司机很专业，准时、安全。',
      feedback_time: '2024-11-28 19:00',
    },
  ]);

  // 每页显示的条数
  const pageSize = 6;
  // 当前页码
  const currentPage = ref(1);

  // 计算当前页的评价数据
  const pagedFeedbackData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize;
    return feedbackData.value.slice(startIndex, startIndex + pageSize);
  });

  // 页码变动处理
  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
  };
</script>

<style scoped>
  .comment-page {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  h2 {
    text-align: center;
    color: #409eff;
    margin-bottom: 25px;
    font-size: 35px;
  }

  .el-table th {
    background-color: #409eff;
    color: white;
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
  }
</style>