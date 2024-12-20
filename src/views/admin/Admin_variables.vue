<template>
  <div class="table-container">
    <!-- 当编辑窗口显示时，增加背景遮罩 -->
    <div v-if="isEditVisible" class="modal-overlay"></div>

    <!-- 编辑窗口对话框 -->
    <el-dialog
        v-model="isEditVisible"
        title="Edit System Variable"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetEditForm"
    >
      <el-form :model="editForm">
        <el-form-item label="Variable Key" :label-width="formLabelWidth">
          <el-input v-model="editForm.key" disabled></el-input>
        </el-form-item>
        <el-form-item label="Variable Name" :label-width="formLabelWidth">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Variable Value" :label-width="formLabelWidth">
          <el-input v-model="editForm.value"></el-input>
        </el-form-item>
        <el-form-item label="Description" :label-width="formLabelWidth">
          <el-input
              type="textarea"
              v-model="editForm.description"
              :autosize="{ minRows: 2, maxRows: 5 }"
          ></el-input>
        </el-form-item>
        <el-form-item label="Type" :label-width="formLabelWidth">
          <el-select v-model="editForm.type">
            <el-option
                v-for="option in variableTypes"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEditVisible = false" class="cancel-btn">Cancel</el-button>
        <el-button type="primary" class="save-btn" @click="saveEdit">Save</el-button>
      </template>
    </el-dialog>

    <div class="table-controls">
      <!-- 搜索框：根据关键词搜索系统变量 -->
      <el-input
          v-model="filters.keyword"
          placeholder="Search by keyword"
          class="search-input"
          @input="filterData"
      />
      <!-- 类型筛选框 -->
      <el-select
          v-model="filters.type"
          placeholder="Filter by variable type"
          class="type-filter"
          @change="filterData"
      >
        <el-option label="All" value=""></el-option>
        <el-option
            v-for="option in variableTypes"
            :key="option.value"
            :label="option.label"
            :value="option.value"
        ></el-option>
      </el-select>
      <!-- 搜索按钮 -->
      <el-button type="primary" class="search-btn" @click="filterData">Search</el-button>
    </div>

    <!-- 表格组件：展示系统变量 -->
    <el-table
        :data="displayData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
    >
      <!-- 变量Key -->
      <el-table-column prop="key" label="Key" width="180" />
      <!-- 变量名称 -->
      <el-table-column prop="name" label="Name" />
      <!-- 变量值 -->
      <el-table-column prop="value" label="Value" />
      <!-- 变量类型 -->
      <el-table-column prop="type" label="Type" width="180" />
      <!-- 描述 -->
      <el-table-column prop="description" label="Description" />
      <!-- 最后修改时间 -->
      <el-table-column prop="lastModified" label="Last Modified" width="200" />
      <!-- 最后修改人 -->
      <el-table-column prop="lastModifiedBy" label="Last ModifiedBy" width="200" />
      <!-- 操作列：编辑按钮 -->
      <el-table-column label="Actions" width="120">
        <template #default="{ row }">
          <el-button size="mini" class="edit-btn" @click="openEdit(row)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="filterData"
        @current-change="filterData"
        class="pagination-control"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const formLabelWidth = "120px";

const variableTypes = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
];

// 硬编码一些示例数据
const tableData = ref([
  { key: 'expiration_hours_admin', name: '管理员token过期时间', value: 'Number', description: '确认生成管理员登录token后token什么时候过期', type: 'Number', lastModified: '2024-12-20 10:00:00', lastModifiedBy: '7'},
  { key: 'expiration_hours_driver', name: '驾驶员token过期时间', value: 'Number', description: '确认生成驾驶员登录token后token什么时候过期', type: 'Number', lastModified: '2024-12-20 10:00:00', lastModifiedBy: '7' },
  { key: 'expiration_hours_passenger', name: '乘客token过期时间', value: 'Number', description: '确认生成乘客登录token后token什么时候过期', type: 'Number', lastModified: '2024-12-20 10:00:00', lastModifiedBy: '7' },
  ]);

const filters = ref({
  keyword: '',
  type: '',
});

const pagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: tableData.value.length,
});

const isEditVisible = ref(false);
const editForm = ref({});

// 根据filters和pagination计算当前展示的数据
const displayData = computed(() => {
  let filtered = tableData.value.filter(item => {
    const matchKeyword = filters.value.keyword ?
        (item.key.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
            item.name.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
            item.value.toLowerCase().includes(filters.value.keyword.toLowerCase())) : true;
    const matchType = filters.value.type ? (item.type === filters.value.type) : true;
    return matchKeyword && matchType;
  });

  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  pagination.value.total = filtered.length;
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return filtered.slice(start, end);
});

const filterData = () => {
  // 根据筛选条件更新displayData (displayData是computed自动更新)
};

// eslint-disable-next-line no-unused-vars
const tableRowClassName = ({ row }) => {
  // 这里你可以根据row的条件来返回不同的类名以实现定制样式
  return 'cool-row';
};

const openEdit = (row) => {
  editForm.value = { ...row };
  isEditVisible.value = true;
};

const saveEdit = () => {
  // 简化处理：直接在前端更新数据（实际上应发送请求到后端）
  const index = tableData.value.findIndex(item => item.key === editForm.value.key);
  if (index !== -1) {
    tableData.value[index] = { ...editForm.value, lastModified: new Date().toISOString().slice(0,19).replace('T',' ') };
  }
  isEditVisible.value = false;
};

const resetEditForm = () => {
  editForm.value = {};
};
</script>

<style scoped>
.table-container {
  padding: 30px;
  margin-left: 220px;
  margin-top: 40px;


  color: #eee;

  transition: background 0.5s ease;

  /* 关键样式：隐藏子容器本身的滚动条 */
  overflow: hidden;
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
  scrollbar-width: none; /* for Firefox */
}



.table-controls {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.search-input,
.type-filter {
  margin-right: 16px;
}

.search-input .el-input__inner,
.type-filter .el-input__inner {
  background: rgba(255,255,255,0.1);
  border: 1px solid #555;
  color: #fff;
}

.search-btn {
  background: #409eff;
  border: none;
}

.search-btn:hover {
  background: #66b1ff;
}

.el-table {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.3);
  transition: box-shadow 0.3s ease;
}

.el-table:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.el-table th {
  background: rgba(0,0,0,0.3);
  color: #eee;
}

.cool-row:hover {
  background: rgba(255,255,255,0.1) !important;
  transition: background 0.3s ease;
}

.edit-btn {
  background: #67c23a;
  border: none;
  color: #fff;
}
.edit-btn:hover {
  background: #85ce61;
}

.pagination-control {
  margin-top: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 弹窗动画与样式 */
.edit-dialog {
  animation: slideIn 0.3s;
  border-radius: 10px !important;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  background: #2a2f56 !important;
  color: #eee;
}

.el-dialog__body {
  background: rgba(255,255,255,0.05);
}

.el-form-item__label {
  color: #fff;
}

.el-input__inner {
  background: rgba(0,0,0,0.2);
  color: #fff;
  border: 1px solid #555;
}

.el-select .el-input__inner {
  background: rgba(0,0,0,0.2);
}

.cancel-btn {
  background: #909399;
  border: none;
  color: #fff;
}
.cancel-btn:hover {
  background: #a6a9ad;
}

.save-btn {
  background: #409eff;
  border: none;
  color: #fff;
}
.save-btn:hover {
  background: #66b1ff;
}

@keyframes slideIn {
  from {
    transform: translateY(-20%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
