<template>
  <div class="table-container">
    <!-- 操作栏：搜索 -->
    <div class="table-controls">
      <!-- 关键词搜索，可自定义搜索逻辑(例如同时搜索 driver_id, car_id 等) -->
      <el-input
          v-model="filters.keyword"
          placeholder="Search by Driver ID / Car ID / Route ID / etc."
          style="width: 300px; margin-right: 16px;"
          @input="fetchTableData"
      />
      <el-button type="primary" @click="fetchTableData">Search</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%">
      <!-- 开始时间 -->
      <el-table-column
          prop="work_stime"
          label="Start Time"
          width="160"
      />
      <!-- 结束时间 -->
      <el-table-column
          prop="work_etime"
          label="End Time"
          width="160"
      />
      <!-- 驾驶员编号 -->
      <el-table-column
          prop="driver_id"
          label="Driver ID"
          width="120"
      />
      <!-- 线路编号 -->
      <el-table-column
          prop="route_id"
          label="Route ID"
          width="100"
      />
      <!-- 车牌号 -->
      <el-table-column
          prop="car_id"
          label="Car ID"
          width="140"
      />
      <!-- 意见反馈 -->
      <el-table-column
          prop="remark"
          label="Remark"
          min-width="200"
      />
      <!-- 路径记录 -->
      <el-table-column
          prop="record_route"
          label="Record Route"
          min-width="250"
      />
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchTableData"
        @current-change="fetchTableData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 表格数据
const tableData = ref([]);

// 过滤条件，这里只给了一个 keyword，可自行扩展
const filters = ref({
  keyword: "",
});

// 分页对象
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

/**
 * 获取 work_table 数据的函数
 * 在此根据你的实际后端接口编写逻辑。
 * 以下仅做示例：
 */
const fetchTableData = async () => {
  try {
    // 将搜索、分页等信息拼接到 query 参数中
    const query = new URLSearchParams({
      keyword: filters.value.keyword,
      page: pagination.value.currentPage,
      size: pagination.value.pageSize,
    });

    // 假设在 localStorage 存有后端服务器的 prefixURL
    const prefixURL = localStorage.getItem("prefixURL");

    // 发起请求获取数据
    const response = await fetch(`${prefixURL}/admin/work_table?${query.toString()}`);
    const result = await response.json();

    // 假设接口返回的数据结构为 { data: [...], total: 100 }
    tableData.value = result.data || [];
    pagination.value.total = result.total || 0;
  } catch (error) {
    console.error("Failed to fetch work_table data:", error);
  }
};

// 组件挂载时，自动获取一次数据
onMounted(() => {
  fetchTableData();
});
</script>

<style scoped>
.table-container {
  padding: 16px;
  margin-left: 225px; /* 根据实际布局需求进行调整 */
  margin-top: -10px;
  margin-right: -10px;
}

.table-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
</style>
