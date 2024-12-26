<template>
  <div class="table-container">
    <!-- 编辑窗口 -->
    <el-dialog
        v-model="isEditVisible"
        title="Edit Car"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetEditForm"
    >
      <el-form :model="editForm">
        <!-- Car ID (不可编辑) -->
        <el-form-item label="Car ID" :label-width="formLabelWidth">
          <el-input v-model="editForm.car_id" disabled></el-input>
        </el-form-item>
        <!-- 是否停用 -->
        <el-form-item label="Is Using" :label-width="formLabelWidth">
          <el-select v-model="editForm.car_isusing" placeholder="Select status">
            <el-option label="Yes" value="1"></el-option>
            <el-option label="No" value="0"></el-option>
          </el-select>
        </el-form-item>
        <!-- 是否正在使用 -->
        <el-form-item label="Is Working" :label-width="formLabelWidth">
          <el-select v-model="editForm.car_isworking" placeholder="Select status">
            <el-option label="Yes" value="1"></el-option>
            <el-option label="No" value="0"></el-option>
          </el-select>
        </el-form-item>
        <!-- 路线编号 -->
        <el-form-item label="Route ID" :label-width="formLabelWidth">
          <el-input v-model="editForm.route_id" type="number"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEditVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveEdit">Save</el-button>
      </template>
    </el-dialog>

    <!-- 创建窗口 -->
    <el-dialog
        v-model="isCreateVisible"
        title="Create New Car"
        :close-on-click-modal="false"
        custom-class="edit-dialog"
        @close="resetCreateForm"
    >
      <el-form :model="createForm">
        <!-- Car ID -->
        <el-form-item label="Car ID" :label-width="formLabelWidth">
          <el-input v-model="createForm.car_id"></el-input>
        </el-form-item>
        <!-- 是否停用 -->
        <el-form-item label="Is Using" :label-width="formLabelWidth">
          <el-select v-model="createForm.car_isusing" placeholder="Select status">
            <el-option label="Yes" value="1"></el-option>
            <el-option label="No" value="0"></el-option>
          </el-select>
        </el-form-item>
        <!-- 是否正在使用 -->
        <el-form-item label="Is Working" :label-width="formLabelWidth">
          <el-select v-model="createForm.car_isworking" placeholder="Select status">
            <el-option label="Yes" value="1"></el-option>
            <el-option label="No" value="0"></el-option>
          </el-select>
        </el-form-item>
        <!-- 路线编号 -->
        <el-form-item label="Route ID" :label-width="formLabelWidth">
          <el-input v-model="createForm.route_id" type="number"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isCreateVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveCreate">Create</el-button>
      </template>
    </el-dialog>

    <!-- 操作栏 -->
    <div class="table-controls">
      <el-input
          v-model="filters.keyword"
          placeholder="Search by car ID or route"
          style="width: 300px; margin-right: 16px;"
          @input="fetchTableData"
      />
      <el-select
          v-model="filters.car_isusing"
          placeholder="Filter by using status"
          style="width: 200px; margin-right: 16px;"
          @change="fetchTableData"
      >
        <el-option label="All" value=""></el-option>
        <el-option label="Yes" value="1"></el-option>
        <el-option label="No" value="0"></el-option>
      </el-select>
      <el-select
          v-model="filters.car_isworking"
          placeholder="Filter by working status"
          style="width: 200px; margin-right: 16px;"
          @change="fetchTableData"
      >
        <el-option label="All" value=""></el-option>
        <el-option label="Yes" value="1"></el-option>
        <el-option label="No" value="0"></el-option>
      </el-select>
      <el-button type="primary" @click="fetchTableData">Search</el-button>
      <el-button type="primary" @click="isCreateVisible = true">Create New Car</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="car_id" label="Car ID" width="150" />
      <el-table-column prop="car_stime" label="Start Time" width="200" />
      <el-table-column prop="car_isusing" label="Is Using" width="150">
        <template #default="{ row }">{{ row.car_isusing ? "Yes" : "No" }}</template>
      </el-table-column>
      <el-table-column prop="car_isworking" label="Is Working" width="150">
        <template #default="{ row }">{{ row.car_isworking ? "Yes" : "No" }}</template>
      </el-table-column>
      <el-table-column prop="route_id" label="Route ID" width="150" />
      <el-table-column prop="car_passenger" label="Passengers" width="150" />
      <el-table-column label="Actions" width="200">
        <template #default="{ row }">
          <el-button size="mini" @click="openEdit(row)">Edit</el-button>
        </template>
      </el-table-column>
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
import {ref, onMounted} from "vue";

const tableData = ref([]);
const filters = ref({keyword: "", car_isusing: "", car_isworking: ""});
const pagination = ref({currentPage: 1, pageSize: 10, total: 0});

const isCreateVisible = ref(false);
const isEditVisible = ref(false);

const createForm = ref({
  car_id: "",
  car_isusing: 1,
  car_isworking: 1,
  route_id: "",
});

const editForm = ref({});

const formLabelWidth = "120px";

const fetchTableData = async () => {
  try {
    const query = new URLSearchParams({
      keyword: filters.value.keyword,
      car_isusing: filters.value.car_isusing,
      car_isworking: filters.value.car_isworking,
      page: pagination.value.currentPage,
      size: pagination.value.pageSize,
    });
    const prefixURL = localStorage.getItem('prefixURL');

    const response = await fetch(`${prefixURL}/admin/car_table?${query.toString()}`);
    const result = await response.json();
    tableData.value = result.data || [];
    pagination.value.total = result.total || 0;
  } catch (error) {
    console.error('Failed to fetch car table data:', error);
  }
};

const saveCreate = async () => {
  try {
    const changeDataRequest = {
      dataset: 'driver',
      table_name: 'car_table',
      data_names: ['car_id', 'car_isusing', 'car_isworking', 'route_id', 'car_stime', 'car_passenger'],
      params: [
        createForm.value.car_id.toString(),
        createForm.value.car_isusing.toString(),
        createForm.value.car_isworking.toString(),
        createForm.value.route_id.toString(),
        '<time>',
        '0',
      ],
      condition: '',
      token: localStorage.getItem('jwtToken'),
    };

    const prefixURL = localStorage.getItem('prefixURL');
    await fetch(`${prefixURL}/admin/insert`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(changeDataRequest),
    });

    isCreateVisible.value = false;
    await fetchTableData();
  } catch (error) {
    console.error('Failed to create car:', error);
  }
};

const saveEdit = async () => {
  try {
    const originalRow = tableData.value.find((d) => d.car_id === editForm.value.car_id);
    if (!originalRow) {
      console.error('Original row not found');
      return;
    }

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

    const changeDataRequest = {
      dataset: 'driver',
      table_name: 'car_table',
      data_names: Object.keys(changes),
      params: Object.values(changes),
      condition: `car_id = '${editForm.value.car_id}'`,
      token: localStorage.getItem('jwtToken'),
    };

    const prefixURL = localStorage.getItem('prefixURL');
    await fetch(`${prefixURL}/admin/update`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(changeDataRequest),
    });

    isEditVisible.value = false;
    await fetchTableData();
  } catch (error) {
    console.error('Failed to save car info:', error);
  }
};

const openEdit = (row) => {
  editForm.value = {...row};
  isEditVisible.value = true;
};

const resetCreateForm = () => {
  createForm.value = {car_id: "", car_isusing: 1, car_isworking: 1, route_id: ""};
};

const resetEditForm = () => {
  editForm.value = {};
};



onMounted(fetchTableData);
</script>


<style scoped>
.table-container {
  padding: 16px;
  margin-left: 225px; /* 可根据实际布局进行调整 */
  margin-top: -10px;   /* 可根据实际布局进行调整 */
  margin-right: -10px;
}

.table-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
</style>
