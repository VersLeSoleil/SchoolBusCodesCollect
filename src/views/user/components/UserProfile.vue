<template>
  <div class="profile-container">
    <!-- 用户头像与基本信息 -->
    <div class="user-info-box">
      <ElAvatar :src="userStore.userInfo.avatar" size="large">
        <template #default>
          <span v-if="!userStore.userInfo.avatar">暂无头像</span>
        </template>
      </ElAvatar>
      <ElUpload
        class="avatar-uploader"
        :show-upload-list="false"
        :before-upload="beforeAvatarUpload"
        @change="handleAvatarChange"
      >
        <ElButton type="primary" size="small">上传头像</ElButton>
      </ElUpload>
      <div class="user-info-details">
        <h2>{{ userStore.userInfo.name }}</h2>
        <p>账号名：{{ userStore.userInfo.account }}</p>
      </div>
    </div>

    <!-- 个人资料 -->
    <div class="profile-details">
      <h3>基本信息</h3>
      <ul class="profile-grid">
        <li
          v-for="field in fields"
          :key="field.key"
          class="field-item"
          @mouseover="hoveredField = field.key"
          @mouseleave="hoveredField = ''"
        >
          <div class="field-label">{{ field.label }}: </div>
          <div v-if="editingField === field.key" class="edit-input">
            <ElInput
              v-if="field.key !== 'major'"
              ref="field.key"
              v-model="tempUserInfo[field.key]"
              :placeholder="'请输入' + field.label"
              size="large"
              class="input-large"
            />
            <ElSelect
              v-else
              v-model="tempUserInfo.major"
              placeholder="请选择专业"
              size="large"
              class="input-large-selected"
            >
              <ElOption label="软件工程学院" value="软件工程学院" />
              <ElOption label="计算机学院" value="计算机学院" />
              <ElOption label="人工智能学院" value="人工智能学院" />
              <ElOption label="土木工程学院" value="土木工程学院" />
            </ElSelect>
            <ElButton @click="saveField(field.key)" type="primary" size="large">保存</ElButton>
            <ElButton @click="cancelEditing" type="default" size="large">取消</ElButton>
          </div>
          <div v-else class="field-value">
            {{ userStore.userInfo[field.key] }}
            <ElButton
              v-if="hoveredField === field.key && field.editable"
              @click="startEditing(field.key)"
              type="text"
              class="edit-button"
            >
              编辑
            </ElButton>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import {
    ElInput,
    ElButton,
    ElMessage,
    ElAvatar,
    ElSelect,
    ElOption,
    ElUpload,
} from "element-plus";
import { useUserStore } from "@/stores/userStore"; // 引入 User Store



const userStore = useUserStore();

const tempUserInfo = ref({ ...userStore.userInfo });

const editingField = ref(""); // 当前正在编辑的字段
const hoveredField = ref(""); // 当前鼠标悬停的字段

// 需要展示的字段
const fields = [
    { key: "name", label: "姓名", editable: true },
    { key: "account", label: "账号", editable: false },
    { key: "studentId", label: "学号", editable: false },
    { key: "grade", label: "年级", editable: true },
    { key: "major", label: "专业", editable: true },
    { key: "phone", label: "电话号码", editable: true },
];

// 开始编辑某个字段
function startEditing(field) {
  tempUserInfo.value = { ...userStore.userInfo };
  editingField.value = field;
}

// 保存字段内容
async function saveField(field) {
    if (validateField(field)) {
        try {
            const payload = {
                student_account: userStore.userInfo.account,
                name: tempUserInfo.value.name,
                grade: parseInt(tempUserInfo.value.grade),
                major: tempUserInfo.value.major,
                phone: tempUserInfo.value.phone,
                avatar: userStore.userInfo.avatar.replace('http://localhost:8888', ''), // 移除基础 URL
                user_id: parseInt(userStore.userInfo.user_id),
            };

            console.log("Payload to send:", payload);
            // 发送更新请求
            await userStore.updateUserInfo(payload);

            editingField.value = "";
            hoveredField.value = "";
            ElMessage.success(`${fields.find(f => f.key === field).label} 更新成功！`);
        } catch (error) {
            console.error("更新失败:", error);
            ElMessage.error("更新失败，请稍后重试");
        }
    }
}

// 取消编辑
function cancelEditing() {
    tempUserInfo.value = { ...userStore.userInfo };
    editingField.value = "";
    hoveredField.value = "";
}

// 验证字段
function validateField(field) {
    if (
        field === "name" &&
        !/^[\u4e00-\u9fa5]{1,10}$|^[a-zA-Z\s]{1,30}$|^[\u4e00-\u9fa5a-zA-Z\s]{1,30}$/.test(
            tempUserInfo.value.name
        )
    ) {
        ElMessage.error("姓名应为最多 10 个中文字符或 30 个英文字符");
        return false;
    }
    if (
        field === "grade" &&
        !/^(192[4-9]|19[3-9]\d|20[0-1]\d|202[0-4])$/.test(tempUserInfo.value.grade)
    ) {
        ElMessage.error("年级只能填写 1924 到 2024 之间的数字");
        return false;
    }
    if (
        field === "phone" &&
        (!/^(\+|-|\d|\s){1,20}$/.test(tempUserInfo.value.phone) ||
            (tempUserInfo.value.phone.match(/\s/g) || []).length > 2)
    ) {
        ElMessage.error("电话号码只能包含数字、符号（+、-）和最多两个空格");
        return false;
    }
    return true;
}

// 头像上传前的检查
function beforeAvatarUpload(file) {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error('只能上传图片文件');
        return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        ElMessage.error('头像大小不能超过 2MB');
        return false;
    }
    return true;
}

// 处理头像文件变化
async function handleAvatarChange(file) {
    if (file.status === 'ready' || file.status === 'uploading') {
        await userStore.uploadAvatar(file.raw);
    }
    console.log(file.response);
    if (file.status === 'success') {
        ElMessage.success('头像上传成功');
        // 更新头像 URL
        // userStore.userInfo.avatar 已在 store 中更新
    } else if (file.status === 'error') {
        ElMessage.error('头像上传失败');
    }
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

  .user-info-box {
  display: flex;
  align-items: center;
}

.avatar-uploader {
  margin-left: 20px;
}

.user-info-details {
  margin-left: 20px;
}
</style>