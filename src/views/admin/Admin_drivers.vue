<template>
  <div class="table-container">
    <!-- 当编辑窗口显示时，增加背景遮罩 -->
    <div v-if="isEditVisible" class="modal-overlay"></div>

    <!-- 编辑窗口对话框：修改某个司机信息 -->
    <el-dialog
        v-model="isEditVisible"
        title="Edit Driver"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetEditForm"
    >
      <el-form :model="editForm">
        <!-- 驾驶员编号，禁止修改 -->
        <el-form-item label="Driver ID" :label-width="formLabelWidth">
          <el-input v-model="editForm.driver_id" disabled></el-input>
        </el-form-item>

        <!-- 驾驶员姓名 -->
        <el-form-item label="Name" :label-width="formLabelWidth">
          <el-input v-model="editForm.driver_name"></el-input>
        </el-form-item>

        <!-- 驾驶员性别 -->
        <el-form-item label="Sex" :label-width="formLabelWidth">
          <el-select v-model="editForm.driver_sex" placeholder="Select sex">
            <!-- 0 - 女；1 - 男 （可根据需求增加其他选项）-->
            <el-option label="Female" value="0"></el-option>
            <el-option label="Male" value="1"></el-option>
          </el-select>
        </el-form-item>

        <!-- 驾驶员电话号码 -->
        <el-form-item label="Tel" :label-width="formLabelWidth">
          <el-input v-model="editForm.driver_tel"></el-input>
        </el-form-item>

        <!-- 驾驶员工资 -->
        <el-form-item label="Wages" :label-width="formLabelWidth">
          <el-input v-model="editForm.driver_wages" type="number"></el-input>
        </el-form-item>

        <!-- 驾驶员是否在职 -->
        <el-form-item label="Working Status" :label-width="formLabelWidth">
          <el-select v-model="editForm.driver_isworking" placeholder="Select status">
            <!-- 0:离职, 1:在职, 2:休息 -->
            <el-option label="离职" value="0"></el-option>
            <el-option label="在职" value="1"></el-option>
            <el-option label="休息" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="isEditVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveEdit">Save</el-button>
      </template>
    </el-dialog>

    <!-- 创建窗口对话框：创建新司机 -->
    <el-dialog
        v-model="isCreateVisible"
        title="Create New Driver"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetCreateForm"
    >
      <el-form :model="createForm">
        <!-- 驾驶员id -->
        <el-form-item label="ID" :label-width="formLabelWidth">
          <el-input v-model="createForm.driver_id"></el-input>
        </el-form-item>

        <!-- 驾驶员姓名 -->
        <el-form-item label="Name" :label-width="formLabelWidth">
          <el-input v-model="createForm.driver_name"></el-input>
        </el-form-item>

        <!-- 驾驶员性别 -->
        <el-form-item label="Sex" :label-width="formLabelWidth">
          <el-select v-model="createForm.driver_sex" placeholder="Select sex">
            <el-option label="Female" value="0"></el-option>
            <el-option label="Male" value="1"></el-option>
          </el-select>
        </el-form-item>

        <!-- 驾驶员电话号码 -->
        <el-form-item label="Tel" :label-width="formLabelWidth">
          <el-input v-model="createForm.driver_tel"></el-input>
        </el-form-item>

        <!-- 驾驶员工资 -->
        <el-form-item label="Wages" :label-width="formLabelWidth">
          <el-input v-model="createForm.driver_wages" type="number"></el-input>
        </el-form-item>

        <!-- 驾驶员是否在职 -->
        <el-form-item label="Working Status" :label-width="formLabelWidth">
          <el-select v-model="createForm.driver_isworking" placeholder="Select status">
            <el-option label="离职" value="0"></el-option>
            <el-option label="在职" value="1"></el-option>
            <el-option label="休息" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="isCreateVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveCreate">Create</el-button>
      </template>
    </el-dialog>

    <!-- 操作栏：搜索、筛选、以及“新建”按钮 -->
    <div class="table-controls">
      <!-- 搜索框：这里简单示例，根据“姓名”或“电话号码”进行搜索 -->
      <el-input
          v-model="filters.keyword"
          placeholder="Search by name or tel"
          style="width: 300px; margin-right: 16px;"
          @input="fetchTableData"
      />

      <!-- 在职状态 筛选框 -->
      <el-select
          v-model="filters.driver_isworking"
          placeholder="Filter by working status"
          style="width: 200px; margin-right: 16px;"
          @change="fetchTableData"
      >
        <el-option label="All" value=""></el-option>
        <el-option label="离职" value="0"></el-option>
        <el-option label="在职" value="1"></el-option>
        <el-option label="休息" value="2"></el-option>
      </el-select>

      <!-- 搜索按钮（可选） -->
      <el-button type="primary" @click="fetchTableData">Search</el-button>

      <!-- 创建按钮 -->
      <!-- 暂时取消-->
      <el-button
          type="primary"
          disabled
          @click="isCreateVisible = true"
          style="margin-left:16px;"
      >
        Create New Driver
      </el-button>
    </div>

    <!-- 表格组件：展示driver_table的数据 -->
    <el-table
        :data="tableData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
    >
      <!-- driver_id 列：只读展示 -->
      <el-table-column prop="driver_id" label="Driver ID" width="150" />

      <!-- 驾驶员姓名 -->
      <el-table-column prop="driver_name" label="Name" width="150" />

      <!-- 性别：0女，1男（可在列上进行格式化显示） -->
      <el-table-column prop="driver_sex" label="Sex" width="140">
        <template #default="{ row }">
          <span v-if="row.driver_sex === 0">Female</span>
          <span v-else-if="row.driver_sex === 1">Male</span>
          <span v-else>Unknown</span>
        </template>
      </el-table-column>

      <!-- 电话号码 -->
      <el-table-column prop="driver_tel" label="Tel" width="200" />

      <!-- 工资 -->
      <el-table-column prop="driver_wages" label="Wages" width="250" />

      <!-- 是否在职：0离职、1在职、2休息 -->
      <el-table-column prop="driver_isworking" label="Working Status" width="170">
        <template #default="{ row }">
          <span v-if="row.driver_isworking === 0">离职</span>
          <span v-else-if="row.driver_isworking === 1">在职</span>
          <span v-else-if="row.driver_isworking === 2">休息</span>
          <span v-else>未定义</span>
        </template>
      </el-table-column>

      <!-- 操作列：编辑按钮 -->
      <el-table-column label="Actions" width="200">
        <template #default="{ row }">
          <el-button size="mini" @click="openEdit(row)">Edit</el-button>
          <!-- 如果需要删除按钮可在此补充 delete -->
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件：用于分页展示 -->
    <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchTableData"
        @current-change="fetchTableData"
        style="margin-top: 16px;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

/**
 * 存放表格数据
 */
const tableData = ref([]);

/**
 * 搜索和筛选条件
 */
const filters = ref({
  keyword: '',            // 搜索关键词(如姓名或电话)
  driver_isworking: '',   // 在职状态（0离职、1在职、2休息）
});

/**
 * 分页数据
 */
const pagination = ref({
  currentPage: 1, // 当前页
  pageSize: 10,   // 每页数量
  total: 0,       // 数据总条数
});

/**
 * 控制“创建”对话框是否可见
 */
const isCreateVisible = ref(false);

/**
 * 创建时的表单字段
 * driver_password 和 driver_avatar 不需要在前台展示
 */
const createForm = ref({
  driver_name: '',
  driver_sex: '0',      // 默认女(0)；也可以根据需要设置成 ''
  driver_tel: '',
  driver_wages: 0,
  driver_isworking: '1' // 默认“在职”
});

/**
 * 控制“编辑”对话框是否可见
 */
const isEditVisible = ref(false);

/**
 * 编辑时的表单字段
 */
const editForm = ref({});

/**
 * 表单标签宽度
 */
const formLabelWidth = '120px';

/**
 * 从后端获取 driver_table 的数据
 */
const fetchTableData = async () => {
  try {
    const prefixURL = localStorage.getItem('prefixURL'); // 使用本地存的后端地址
    const query = new URLSearchParams({
      keyword: filters.value.keyword,
      driver_isworking: filters.value.driver_isworking,
      page: pagination.value.currentPage,
      size: pagination.value.pageSize
    });

    const response = await fetch(`${prefixURL}/admin/drivertable?${query.toString()}`);
    const result = await response.json();
    tableData.value = result.data || [];
    pagination.value.total = result.total || 0;
  } catch (error) {
    console.error('Failed to fetch driver table data:', error);
  }
};

/**
 * 根据行内某些字段动态设置样式
 * 例如：离职(0) -> 某颜色；休息(2) -> 某颜色等
 */
const tableRowClassName = ({ row }) => {
  if (row.driver_isworking === 0) {
    // 离职
    return 'driver-off-row';
  } else if (row.driver_isworking === 2) {
    // 休息
    return 'driver-rest-row';
  }
  return '';
};

/**
 * 打开编辑对话框
 */
const openEdit = (row) => {
  editForm.value = { ...row };
  isEditVisible.value = true;
};

/**
 * 编辑 - 保存
 * 注意：此处使用示例中的 sendChanges 方法，需要结合实际后端API进行调整
 */
const saveEdit = async () => {
  // 先找到原始行，判断是否真的有变更
  const originalRow = tableData.value.find(d => d.driver_id === editForm.value.driver_id);
  if (!originalRow) {
    console.error('Original row not found');
    return;
  }

  // 获取变动字段
  const changes = {};
  for (const key in editForm.value) {
    if (editForm.value[key] !== originalRow[key]) {
      changes[key] = editForm.value[key];
    }
  }

  if (Object.keys(changes).length === 0) {
    console.log('No changes made.');
    isEditVisible.value = false;
    return;
  }

  try {
    // 构建请求，根据需要更新对应字段
    // 示例中仍然使用之前通用的 changeDataRequest 结构

    // 这里仅演示更新 driver_name, driver_sex, driver_tel, driver_wages, driver_isworking
    const changeDataRequest = {
      dataset: 'driver',
      table_name: 'driver_table',
      data_names: [],
      params: [],
      condition: `driver_id = ${editForm.value.driver_id}`,
      token: 'not-need-to-write'
    };

    // 根据 changes 动态塞入 data_names 和 params
    if (changes.driver_name !== undefined) {
      changeDataRequest.data_names.push('driver_name');
      changeDataRequest.params.push(changes.driver_name);
    }
    if (changes.driver_sex !== undefined) {
      changeDataRequest.data_names.push('driver_sex');
      changeDataRequest.params.push(changes.driver_sex);
    }
    if (changes.driver_tel !== undefined) {
      changeDataRequest.data_names.push('driver_tel');
      changeDataRequest.params.push(changes.driver_tel);
    }
    if (changes.driver_wages !== undefined) {
      changeDataRequest.data_names.push('driver_wages');
      changeDataRequest.params.push(changes.driver_wages);
    }
    if (changes.driver_isworking !== undefined) {
      changeDataRequest.data_names.push('driver_isworking');
      changeDataRequest.params.push(changes.driver_isworking);
    }

    // 发送更新请求
    await sendChanges(changeDataRequest, 1);

    // 关闭编辑窗口
    isEditVisible.value = false;

    // 重新获取最新数据
    await fetchTableData();
  } catch (error) {
    console.error('Failed to save driver info:', error);
  }
};

/**
 * 创建 - 保存
 * 需要先插入主表（driver_id 主键一般由数据库自增或其他方式生成）
 */
const saveCreate = async () => {
  try {
    // 构建请求
    const changeDataRequest = {
      dataset: 'driver',
      table_name: 'driver_table',
      data_names: [
        'driver_name',
        'driver_sex',
        'driver_tel',
        'driver_wages',
        'driver_isworking'
      ],
      params: [
        createForm.value.driver_name,
        createForm.value.driver_sex,
        createForm.value.driver_tel,
        createForm.value.driver_wages,
        createForm.value.driver_isworking
      ],
      condition: '', // 插入无需 condition
      token: 'not-need-to-write'
    };

    // 进行插入操作
    await sendChanges(changeDataRequest, 3);

    // 关闭创建窗口
    isCreateVisible.value = false;

    // 刷新表格数据
    await fetchTableData();
  } catch (error) {
    console.error('Failed to create driver:', error);
  }
};

/**
 * 重置创建表单
 */
const resetCreateForm = () => {
  createForm.value = {
    driver_name: '',
    driver_sex: '0',
    driver_tel: '',
    driver_wages: 0,
    driver_isworking: '1'
  };
};

/**
 * 重置编辑表单
 */
const resetEditForm = () => {
  editForm.value = {};
};

/**
 * 通用方法：与后端交互，发送数据库更新、插入、删除等操作
 * - switching = 1: update
 * - switching = 2: delete
 * - switching = 3: insert
 */
const sendChanges = async (changeDataRequest, switching = 1) => {
  // 类型检查
  for (const key in changeDataRequest) {
    if (typeof changeDataRequest[key] !== 'string' && !Array.isArray(changeDataRequest[key])) {
      throw new Error(`Invalid type for ${key}: ${typeof changeDataRequest[key]}`);
    }
  }

  const prefixURL = localStorage.getItem('prefixURL');
  // 手动替换 token
  changeDataRequest.token = localStorage.getItem('jwtToken');

  let url = prefixURL;
  switch (switching) {
    case 1:
      url += '/admin/update';
      break;
    case 2:
      url += '/admin/delete';
      break;
    case 3:
      url += '/admin/insert';
      break;
    default:
      throw new Error('Invalid switching value');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changeDataRequest)
    });
    if (!response.ok) {
      throw new Error(`Error sending changes: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send changes:', error);
    throw error;
  }
};

/**
 * 页面加载时自动获取表格数据
 */
onMounted(() => {
  fetchTableData();
});
</script>

<style scoped>
.table-container {
  padding: 16px;
  margin-left: 225px; /* 可根据实际布局进行调整 */
  margin-top: -10px;   /* 可根据实际布局进行调整 */
  margin-right: -10px;
}

.table-controls {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

/* 表格行样式，根据 driver_isworking 不同可做区分 */
.el-table .driver-off-row {
  background-color: #FFE4E1; /* 例如：离职行，浅红 */
  color: #8B0000;
}

.el-table .driver-rest-row {
  background-color: #FFF8DC; /* 例如：休息行，浅黄色 */
  color: #8B4513;
}

/* 背景遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 弹窗动画 */
.edit-dialog {
  animation: slideIn 0.5s;
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
