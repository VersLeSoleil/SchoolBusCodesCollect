<template>
  <div class="table-container">
    <!-- 当编辑窗口显示时，增加背景遮罩 -->
    <div v-if="isEditVisible" class="modal-overlay"></div>

    <!-- 编辑窗口对话框 -->
    <el-dialog
        v-model="isEditVisible"
        title="Edit User"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetEditForm"
    >
      <el-form :model="editForm">
        <el-form-item label="User ID" :label-width="formLabelWidth">
          <el-input v-model="editForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="Aliases" :label-width="formLabelWidth">
          <el-input v-model="editForm.aliases" disabled></el-input>
        </el-form-item>
        <el-form-item label="Account Type" :label-width="formLabelWidth">
          <el-select v-model="editForm.accountType">
            <el-option label="Admin" value="admin"></el-option>
            <el-option label="User" value="user"></el-option>
            <el-option label="Driver" value="driver"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Account Status" :label-width="formLabelWidth">
          <el-select v-model="editForm.accountStatus">
            <el-option label="Active" value="active"></el-option>
            <el-option label="Locked" value="locked"></el-option>
            <el-option label="Suspended" value="suspended"></el-option>
            <el-option label="Deleted" value="deleted"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Unlock Time" :label-width="formLabelWidth">
          <el-date-picker
              v-model="editForm.unlockTime"
              type="datetime"
              placeholder="Select Date and Time"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEditVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveEdit">Save</el-button>
      </template>
    </el-dialog>

    <!-- 创建窗口对话框 -->
    <el-dialog
        v-model="isCreateVisible"
        title="Create New User"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetCreateForm"
    >
      <el-form :model="createForm">
        <el-form-item label="Aliases" :label-width="formLabelWidth">
          <el-input v-model="createForm.aliases"></el-input>
        </el-form-item>
        <el-form-item label="Account Type" :label-width="formLabelWidth">
          <el-select v-model="createForm.accountType">
            <el-option label="Admin" value="admin"></el-option>
            <el-option label="User" value="user"></el-option>
            <el-option label="Driver" value="driver"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Account Status" :label-width="formLabelWidth">
          <el-select v-model="createForm.accountStatus">
            <el-option label="Active" value="active"></el-option>
            <el-option label="Locked" value="locked"></el-option>
            <el-option label="Suspended" value="suspended"></el-option>
            <el-option label="Deleted" value="deleted"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Unlock Time" :label-width="formLabelWidth">
          <el-date-picker
              v-model="createForm.unlockTime"
              type="datetime"
              placeholder="Select Date and Time"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isCreateVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveCreate">Create</el-button>
      </template>
    </el-dialog>


    <div class="table-controls">
      <!-- 搜索框：用于根据关键词搜索用户 -->
      <el-input
          v-model="filters.keyword"
          placeholder="Search by keyword"
          style="width: 300px; margin-right: 16px;"
          @input="fetchTableData"
      />
      <!-- 筛选框：根据账户类型筛选 -->
      <el-select
          v-model="filters.accountType"
          placeholder="Filter by account type"
          style="width: 200px; margin-right: 16px;"
          @change="fetchTableData"
      >
        <el-option label="All" value=""></el-option>
        <el-option label="Admin" value="admin"></el-option>
        <el-option label="User" value="user"></el-option>
        <el-option label="Driver" value="driver"></el-option>
      </el-select>
      <!-- 筛选框：根据账户状态筛选 -->
      <el-select
          v-model="filters.accountStatus"
          placeholder="Filter by account status"
          style="width: 200px; margin-right: 16px;"
          @change="fetchTableData"
      >
        <el-option label="All" value=""></el-option>
        <el-option label="Active" value="active"></el-option>
        <el-option label="Locked" value="locked"></el-option>
        <el-option label="Suspended" value="suspended"></el-option>
        <el-option label="Deleted" value="deleted"></el-option>
      </el-select>
      <!-- 搜索按钮 -->
      <el-button type="primary" @click="fetchTableData">Search</el-button>
      <!-- 创建按钮 -->
      <el-button type="primary" @click="isCreateVisible = true" style="margin-left:16px;">Create New Account</el-button>

    </div>

    <!-- 表格组件：展示用户信息 -->
    <el-table
        :data="tableData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
    >
      <!-- 用户ID列 -->
      <el-table-column prop="id" label="User ID" width="120" />
      <!-- 用户别名列 -->
      <el-table-column prop="aliases" label="User Aliases" />
      <!-- 账户类型列 -->
      <el-table-column prop="accountType" label="Account Type" width="150" />
      <!-- 账户状态列 -->
      <el-table-column prop="accountStatus" label="Account Status" width="150" />
      <!-- 解锁时间列 -->
      <el-table-column prop="unlockTime" label="Unlock Time" width="200" />
      <!-- 注册时间列 -->
      <el-table-column prop="registrationTime" label="Registration Time" width="200" />
      <!-- 操作列：增加编辑按钮 -->
      <el-table-column label="Actions" width="150">
        <template #default="{ row }">
          <el-button size="mini" @click="openEdit(row)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件：支持分页展示 -->
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
import {ref} from 'vue';


const tableData = ref([]);

const filters = ref({
  keyword: '', // 搜索关键词
  accountType: '', // 账户类型筛选条件
  accountStatus: '', // 账户状态筛选条件
});

const pagination = ref({
  currentPage: 1, // 当前页码
  pageSize: 10, // 每页显示条数
  total: 0, // 数据总条数
});

const isCreateVisible = ref(false);
const createForm = ref({
  aliases: '',
  accountType: 'user',   // 默认为 user 或按需指定
  accountStatus: 'active', // 默认为 active 或按需指定
  unlockTime: null
});


// 控制编辑窗口显示的变量
const isEditVisible = ref(false);
const editForm = ref({});
const formLabelWidth = "120px";

// 从后端获取表格数据
const fetchTableData = async () => {
  const prefixURL = localStorage.getItem("prefixURL"); // 使用本地存的url
  const response = await fetch(
      prefixURL +
      `/admin/table?keyword=${filters.value.keyword}&accountType=${filters.value.accountType}&accountStatus=${filters.value.accountStatus}&page=${pagination.value.currentPage}&size=${pagination.value.pageSize}`
  );
  const result = await response.json();
  tableData.value = result.data; // 更新表格数据
  pagination.value.total = result.total; // 更新总条数
};

// 行样式逻辑，根据账户状态动态设置样式
const tableRowClassName = ({ row }) => {
  if (row.accountStatus === 'locked') {
    return 'locked-row'; // 锁定账户行样式
  } else if (row.accountStatus === 'suspended') {
    return 'suspended-row'; // 暂停账户行样式
  } else if (row.accountStatus === 'deleted') {
    return 'deleted-row'; // 删除账户行样式
  }
  return '';
};

// 打开编辑窗口，将当前行数据复制到编辑表单中
const openEdit = (row) => {
  editForm.value = { ...row };
  isEditVisible.value = true;
};


/**
 * 发送数据库请求到后端。
 * @param changeDataRequest - 更新请求的数据。
 * @throws {Error} - 如果任何更新请求失败，将抛出错误。
 */
// eslint-disable-next-line no-unused-vars
let changeDataRequest = {
  dataset: "exampleDataset",
  table_name: "users",
  data_names: ["name", "age", "address"],
  params: ["param1", "param2"],
  condition: "age > 30",
  token: "your-token-here"
};
// eslint-disable-next-line no-unused-vars
const sendChanges = async (changeDataRequest, switching = 1) => {
  // 检查所有元素，不得有非string或string[]类型的元素
  for (const key in changeDataRequest) {
    if (typeof changeDataRequest[key] !== 'string' && !Array.isArray(changeDataRequest[key])) {
      throw new Error(`Invalid type for ${key}: ${typeof changeDataRequest[key]}`);
    }
  }


  const prefixURL = localStorage.getItem("prefixURL"); // 使用本地存的url
  // 手动替换token
  changeDataRequest.token = localStorage.getItem('jwtToken')

  // 根据switching选择功能
  let url = prefixURL;
  switch (switching) {
    case 1:
      url += "/admin/update";
      break;
    case 2:
      url += "/admin/delete";
      break;
    case 3:
      url += "/admin/insert";
      break;
    default:
      throw new Error("Invalid switching value");
  }

  try {
    // 更新主用户表
    const userResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changeDataRequest),
    });

    if (!userResponse.ok) {
      throw new Error(`Error updating user: ${userResponse.statusText}`);
    }

  } catch (error) {
    console.error("Failed to send changes:", error);
    throw error; // 让调用者处理错误
  }
};



/**
 * 保存编辑内容，并根据需要更新相关表。
 */
const saveEdit = async () => {
  // 找到原始行数据
  const originalRow = tableData.value.find(row => row.id === editForm.value.id);

  if (!originalRow) {
    console.error("Original row not found");
    return;
  }

  // 检测哪些字段被修改
  const changes = {};
  for (const key in editForm.value) {
    if (editForm.value[key] !== originalRow[key]) {
      changes[key] = editForm.value[key];
    }
  }

  // 如果没有任何修改，则无需保存
  if (Object.keys(changes).length === 0) {
    console.log("No changes made.");
    isEditVisible.value = false;
    return;
  }


  try {
    // 查询三个表是不是都要更新
    // 主表
    if (changes['accountType'] || changes['accountStatus']) {
      // 预处理数据，user_type为string的int，不然会无法marsel
      // 2024/12/19 21:30:07 Error occurs in login/api.ChangeDataRequest: json: cannot unmarshal number into Go struct field changeDataRequest.params of type string
      let usertype = '0';
      if (editForm.value.accountType === "admin") {
        usertype = '0';
      } else if (editForm.value.accountType === "user") {
        usertype = '1';
      } else if (editForm.value.accountType === "driver") {
        usertype = '2';
      }

      // 更新主用户表
      changeDataRequest = {
        dataset: "admin",
        table_name: "userspass",
        data_names: ["user_type", "user_status"],
        params: [usertype, editForm.value.accountStatus],
        condition: "user_id = " + editForm.value.id,
        token: "not-need-to-write"
      }
      await sendChanges(changeDataRequest);
    }

    // 解锁表
    if (changes['unlockTime']) {
      // 要先删除时间
      // type deleteDataRequest struct {
      //   Dataset   string `json:"dataset"`
      //   TableName string `json:"table_name"`
      //   Condition string `json:"condition"`
      //   Token     string `json:"token"`
      // }
      let deleteDataRequest = {
        dataset: "admin",
        table_name: "userslocked",
        condition: "user_id = " + editForm.value.id,
        token: "not-need-to-write"
      }
      await sendChanges(deleteDataRequest, 2);
      // 删除完时间后插入新的时间
      let addDataRequest = {
        dataset: "admin",
        table_name: "userslocked",
        data_names: ["user_id", "user_locked_time"],
        params: [editForm.value.id, formatDateForMySQL(editForm.value.unlockTime)],
        token: "not-need-to-write"
      }
      await sendChanges(addDataRequest, 3);
    }

    // 可选：显示成功通知


    // 关闭编辑窗口
    isEditVisible.value = false;
  } catch (error) {
    console.error("Failed to save edits:", error);
    // 可选：显示错误通知

  } finally {
    await fetchTableData(); // 重新加载表格数据
  }
};

const formatDateForMySQL = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


const saveCreate = async () => {
  // 根据 createForm 的数据构建新增请求
  // 和编辑类似，但switching选择3代表insert
  let usertype = '0';
  if (createForm.value.accountType === "admin") {
    usertype = '0';
  } else if (createForm.value.accountType === "user") {
    usertype = '1';
  } else if (createForm.value.accountType === "driver") {
    usertype = '2';
  }

  // 首先插入主用户表数据(userspass)
  let insertMainRequest = {
    dataset: "admin",
    table_name: "userspass",
    data_names: ["aliases", "user_type", "user_status"],
    params: [createForm.value.aliases, usertype, createForm.value.accountStatus],
    token: "not-need-to-write"
  }

  async function fetchNewlyCreatedUserId() {

  }

  try {
    await sendChanges(insertMainRequest, 3);

    // 如果有unlockTime，则插入到 userslocked 表
    if (createForm.value.unlockTime) {
      const newUserId = await fetchNewlyCreatedUserId(); // 需要你自己实现：从后端获得新插入用户的ID
      let addDataRequest = {
        dataset: "admin",
        table_name: "userslocked",
        data_names: ["user_id", "user_locked_time"],
        params: [newUserId, formatDateForMySQL(createForm.value.unlockTime)],
        token: "not-need-to-write"
      }
      await sendChanges(addDataRequest, 3);
    }

    isCreateVisible.value = false;
    await fetchTableData();
  } catch (error) {
    console.error("Failed to create user:", error);
  }
};

// 重置创建表单
const resetCreateForm = () => {
  createForm.value = {
    aliases: '',
    accountType: 'user',
    accountStatus: 'active',
    unlockTime: null
  };
};


// 重置编辑表单
const resetEditForm = () => {
  editForm.value = {};
};

// 初始化数据加载
fetchTableData();
</script>

<style>
.table-container {
  padding: 16px;
  margin-left: 225px;
  margin-top: 50px;
}

.table-controls {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.el-table .locked-row {
  background-color: #FFE4E1; /* Locked 背景色 */
  color: #8B0000; /* Locked 文本色 */
}

.el-table .suspended-row {
  background-color: #FFF8DC; /* Suspended 背景色 */
  color: #8B4513; /* Suspended 文本色 */
}

.el-table .deleted-row {
  background-color: #F0F8FF; /* Deleted 背景色 */
  color: #4682B4; /* Deleted 文本色 */
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
  animation: slideIn 0.3s;
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
