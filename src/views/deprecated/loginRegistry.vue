<template>
  <div class="register-container">
    <div class="bg"></div>
    <transition name="fade">
      <div class="register-content">
        <h2>注册账户</h2>
        <form @submit.prevent="handleSubmit" class="register-form">
          <!-- 选择注册方式 -->
          <div class="form-group">
            <label>注册方式</label>
            <div class="input-group">
              <input
                  type="radio"
                  id="email"
                  value="email"
                  v-model="registrationMethod"
                  class="input-radio"
              />
              <label for="email">邮箱</label>
              <input
                  type="radio"
                  id="phone"
                  value="phone"
                  v-model="registrationMethod"
                  class="input-radio"
              />
              <label for="phone">手机号</label>
            </div>
          </div>

          <!-- 邮箱/手机号输入框 -->
          <div class="form-group">
            <label :for="registrationMethod">{{ registrationMethod === 'email' ? '邮箱地址' : '手机号' }}</label>
            <input
                v-model="form[registrationMethod]"
                :type="registrationMethod === 'email' ? 'email' : 'tel'"
                :placeholder="registrationMethod === 'email' ? '请输入邮箱' : '请输入手机号'"
                class="input-field"
                required
                :class="{ invalid: errors[registrationMethod] }"
            />
            <span v-if="errors[registrationMethod]" class="error-msg">{{ errors[registrationMethod] }}</span>
          </div>

          <!-- 用户名 -->
          <div class="form-group">
            <label for="username">用户名</label>
            <input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="input-field"
                required
                :class="{ invalid: errors.username }"
            />
            <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
          </div>

          <!-- 密码 -->
          <div class="form-group">
            <label for="password">密码</label>
            <input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                class="input-field"
                required
                :class="{ invalid: errors.password }"
            />
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <!-- 确认密码 -->
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                class="input-field"
                required
                :class="{ invalid: errors.confirmPassword }"
            />
            <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
          </div>

          <!-- 提交按钮 -->
          <div class="form-group">
            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="!loading">注册</span>
              <span v-else class="spinner"></span>
            </button>
          </div>

          <!-- 登录提示文本 -->
          <p class="login-prompt">
            已有账号？<span class="login-link" @click="goToLogin">点击登录</span>
          </p>
        </form>
      </div>
    </transition>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useReCaptcha } from 'vue-recaptcha-v3';
import axios from 'axios';
import { useRouter } from 'vue-router';
// import {useApiBaseStore} from "@/stores/network";

// 表单数据
const form = ref({
  email: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
});

// 错误信息
const errors = ref({});

// 选中的注册方式，email 或 phone
const registrationMethod = ref('email');

// 加载状态
const loading = ref(false);

// 使用 Vue Router
const router = useRouter();

// 使用 useReCaptcha
const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();

// 验证表单数据
const validateForm = () => {
  let isValid = true;

  // 获取表单字段值
  const emailOrPhone = form.value[registrationMethod.value];
  const username = form.value.username;
  const password = form.value.password;
  const confirmPassword = form.value.confirmPassword;

  // 清除错误信息
  errors.value = {};

  // 验证邮箱或手机号
  if (!emailOrPhone || !isValidEmailOrPhone(emailOrPhone)) {
    errors.value[registrationMethod.value] = `请输入有效的${registrationMethod.value === 'email' ? '邮箱地址' : '手机号'}`;
    isValid = false;
  }

  // 验证邮箱或手机号输入前后不能有空格
  if (emailOrPhone.trim() !== emailOrPhone) {
    errors.value[registrationMethod.value] = `${registrationMethod.value === 'email' ? '邮箱' : '手机号'}前后不能有空格`;
    isValid = false;
  }

  // 验证用户名
  if (!username) {
    errors.value.username = '用户名不能为空';
    isValid = false;
  }

  // 验证用户名输入前后不能有空格
  if (username.trim() !== username) {
    errors.value.username = '用户名前后不能有空格';
    isValid = false;
  }

  // 验证密码
  if (!password || password.length < 6) {
    errors.value.password = '密码至少需要6个字符';
    isValid = false;
  }

  // 确认密码
  if (password !== confirmPassword) {
    errors.value.confirmPassword = '两次密码输入不一致';
    isValid = false;
  }

  // 确认密码输入前后不能有空格
  if (confirmPassword.trim() !== confirmPassword) {
    errors.value.confirmPassword = '确认密码前后不能有空格';
    isValid = false;
  }

  return isValid;
};

// 验证邮箱或手机号格式
const isValidEmailOrPhone = (value) => {
  if (registrationMethod.value === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // 邮箱格式
  } else {
    return /^[1-9]\d{10}$/.test(value); // 手机号格式
  }
};

// 确保验证码已经加载完成并获取 token
const recaptcha = async () => {
  await recaptchaLoaded(); // 确保验证码已加载
  // 获取验证码 token
  return await executeRecaptcha('register');
};

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;
    // 触发验证码验证
    let token = await recaptcha();

    // 表单数据提交
    // const apiBaseStore = useApiBaseStore();
    const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
    let endpoint = `${prefixURL}/api/register`;
    const response = await axios.post(endpoint, {
      ...form.value, // 用户的表单数据
      recaptchaToken: token, // Google reCAPTCHA Token
    });

    // 处理后端响应
    if (response.status === 200) {
      alert('注册成功！');
      await router.push('/login');
    } else if (response.status === 409) {
      // 用户名已存在
      errors.value.username = '用户名已存在';
    } else if (response.status === 403) {
      // 手机号/邮箱已被注册
      errors.value[registrationMethod.value] = '手机号/邮箱已被注册';
    } else {
      alert('注册失败，请稍后重试');
    }
  } catch (error) {
    // 捕获网络或请求错误
    console.error('注册请求失败:', error);

    if (error.response && error.response.status === 409) {
      // 用户名已存在
      errors.value.username = '用户名已存在';
    } else if (error.response && error.response.status === 403) {
      // 手机号/邮箱已被注册
      errors.value[registrationMethod.value] = '手机号/邮箱已被注册';
    } else {
      alert('注册失败，请检查网络连接');
    }
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};
</script>


<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #ff9a9e, #fad0c4, #fad0c4, #ffecd2);
  background-size: 400% 400%;
  position: absolute;
  animation: gradient 15s ease infinite;
  z-index: -1;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.register-content {
  width: 400px;
  margin: 50px auto;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  color: #ffffff;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #fff;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  color: #fff;
  margin-bottom: 8px;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-radio {
  margin-right: 10px;
}

.input-group label {
  margin-right: 20px;
}

.input-field {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;
  transition: background 0.3s, transform 0.3s;
}

.input-field:focus {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.02);
}

.input-field.invalid {
  border: 1px solid red;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.error-msg {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 18px;
  margin-top: 10px;
  transition: background 0.3s;
  position: relative;
}

.submit-btn:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.submit-btn:disabled {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-prompt {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  color: #ffffff;
}

.login-link {
  color: #23d5ab;
  cursor: pointer;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
