<template>
  <div class="profile-container">
    <!-- 用户头像与基本信息 -->
    <div class="user-info-box">
      <ElAvatar :src="userInfo.avatar" size="large" />
      <div class="user-info-details">
        <h2>{{ userInfo.name }}</h2>
        <p>账号名：{{ userInfo.account }}</p>
      </div>
    </div>

    <!-- 个人资料 -->
    <div class="profile-details">
      <h3>基本信息</h3>
      <ul class="profile-grid">
        <li v-for="field in fields" :key="field.key" class="field-item" @mouseover="hoveredField = field.key"
          @mouseleave="hoveredField = ''">
          <div class="field-label">{{ field.label }}: </div>
          <div v-if="editingField === field.key" class="edit-input">
            <ElInput v-if="field.key !== 'major'" ref="field.key" v-model="tempUserInfo[field.key]"
              :placeholder="'请输入' + field.label" size="large" class="input-large" />
            <ElSelect v-else v-model="tempUserInfo.major" placeholder="请选择专业" size="large" class="input-large-selected">
              <ElOption label="软件工程学院" value="软件工程学院" />
              <ElOption label="计算机学院" value="计算机学院" />
              <ElOption label="人工智能学院" value="人工智能学院" />
              <ElOption label="土木工程学院" value="土木工程学院" />
            </ElSelect>
            <ElButton @click="saveField(field.key)" type="primary" size="large">保存</ElButton>
            <ElButton @click="cancelEditing" type="default" size="large">取消</ElButton>
          </div>
          <div v-else class="field-value">
            {{ userInfo[field.key] }}
            <ElButton v-if="hoveredField === field.key && field.editable" @click="startEditing(field.key)" type="text"
              class="edit-button">
              编辑
            </ElButton>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import {
    ref,
    nextTick
  } from "vue";
  import {
    ElInput,
    ElButton,
    ElMessage,
    ElAvatar,
    ElSelect,
    ElOption
  } from "element-plus";
  import logo from "@/assets/logo.png";

  // 用户信息
  const userInfo = ref({
    avatar: logo,
    name: "HissCC",
    account: "Richard",
    studentId: "22331011",
    grade: "1924",
    major: "软件工程学院",
    phone: "12345678901",
  });

  // 临时存储用户信息用于编辑时修改
  const tempUserInfo = ref({
    ...userInfo.value
  });

  // 控制编辑状态
  const editingField = ref(""); // 当前正在编辑的字段
  const hoveredField = ref(""); // 当前鼠标悬停的字段
  const elInputRefs = ref({}); // 存储每个输入框的引用

  // 需要展示的字段
  const fields = [{
      key: "name",
      label: "姓名",
      editable: true
    },
    {
      key: "account",
      label: "账号",
      editable: false
    },
    {
      key: "studentId",
      label: "学号",
      editable: false
    },
    {
      key: "grade",
      label: "年级",
      editable: true
    },
    {
      key: "major",
      label: "专业",
      editable: true
    },
    {
      key: "phone",
      label: "电话号码",
      editable: true
    },
  ];

  // 开始编辑某个字段
  function startEditing(field) {
    editingField.value = field;
    tempUserInfo.value[field] = userInfo.value[field];

    // 等待 DOM 更新完成后，将输入框聚焦
    nextTick(() => {
      const inputRef = elInputRefs.value[field];
      if (inputRef && inputRef.focus) {
        inputRef.focus(); // 调用 Element Plus 输入框的 focus 方法
      }
    });
  }

  // 保存字段内容
  function saveField(field) {
    if (validateField(field)) {
      userInfo.value[field] = tempUserInfo.value[field];
      editingField.value = "";
      hoveredField.value = "";
      ElMessage.success(`${field} 更新成功！`);
    }
  }

  // 取消编辑
  function cancelEditing() {
    tempUserInfo.value = {
      ...userInfo.value
    };
    editingField.value = "";
    hoveredField.value = "";
  }

  // 验证字段
  function validateField(field) {
    if (field === "name" && (!/^[\u4e00-\u9fa5]{1,10}$|^[a-zA-Z\s]{1,30}$|^[\u4e00-\u9fa5a-zA-Z\s]{1,30}$/.test(
        tempUserInfo.value.name))) {
      ElMessage.error("姓名应为最多 10 个中文字符或 30 个英文字符");
      return false;
    }
    if (field === "grade" && (!/^(192[4-9]|19[3-9]\d|20[0-1]\d|202[0-4])$/.test(tempUserInfo.value.grade))) {
      ElMessage.error("年级只能填写 1924 到 2024 之间的数字");
      return false;
    }
    if (field === "phone" && (!/^(\+|-|\d|\s){1,20}$/.test(tempUserInfo.value.phone) || (tempUserInfo.value.phone.match(
        /\s/g) || []).length > 2)) {
      ElMessage.error("电话号码只能包含数字、符号（+、-）和最多两个空格");
      return false;
    }
    return true;
  }
</script>

<style scoped>
  /* 用户头像与基本信息框 */
  .user-info-box {
    display: flex;
    align-items: center;
    padding: 30px;
    margin-bottom: 15px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .user-info-box .user-info-details {
    margin-left: 20px;
  }

  .user-info-box h2 {
    margin: 0;
    font-weight: bold;
    font-size: 2rem;
  }

  .user-info-box p {
    margin: 8px 0 0;
    font-size: 1.4rem;
    color: #666;
  }

  /* 个人资料样式 */
  .profile-details {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .profile-details h3 {
    font-size: 2.5rem;
    margin-bottom: 30px;
  }

  .profile-grid {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    row-gap: 30px;
    column-gap: 15px;
  }

  .field-item {
    display: contents;
  }

  .field-label {
    font-weight: bold;
    font-size: 1.6rem;
    align-self: center;
    margin-bottom: 0;
  }

  .field-value {
    font-size: 1.6rem;
    align-self: center;
    display: flex;
    align-items: center;
  }

  .edit-button {
    margin-left: 40px;
    color: #409eff;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
    font-size: 20;
  }

  .edit-button:hover {
    color: #66b1ff;
  }

  .edit-input {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* 使输入框变大 */
  .input-large {
    width: 500px;
    font-size: 25px;
  }


  .input-large-selected {
    width: 500px;
    font-size: 25px;
  }

  .input-large-selected .el-input__inner {
    font-size: 25px;
  }

  .el-select-dropdown .el-select-dropdown__item {
    font-size: 23px;
  }

  .el-select .el-input__inner {
    font-size: 20px !important;
  }

  ::v-deep .el-select__selected-item {
    font-size: 23px !important;
  }
</style>