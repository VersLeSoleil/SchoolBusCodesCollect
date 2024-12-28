<template>
  <div class="main">
    <div class="bg"></div>
    <div class="container" :class="{ expanded: isRegistering }" :style="{ height: containerHeight + 'px' }">
      <transition-group name="form-transition" tag="div" class="form-wrapper">
        <div class="form-box" :key="formKey">
          <h2>{{ isRegistering ? '注册账户' : '登录' }}</h2>
          <form @submit.prevent="isRegistering ? handleRegister() : handleLogin()">
            <!-- 登录表单 -->
            <div v-if="!isRegistering">
              <!-- 登录表单 -->
              <div v-if="!isRegistering">
                <div class="input-wrapper">
                  <input type="text" placeholder="用户名/邮箱/手机号" class="input" v-model="username"
                         required
                         @input="clearError('username')"
                         @focus="handleInputFocus"
                         @blur="handleInputBlur"
                         :class="{ invalid: errors.username }"/>
                  <span class="error-msg">{{ errors.username }}</span>
                </div>

                <div class="input-wrapper">
                  <input type="password" placeholder="密码" class="input" v-model="password"
                         required
                         @input="clearError('password')"
                         @focus="handleInputFocus"
                         @blur="handleInputBlur"
                         :class="{ invalid: errors.password }"/>
                  <span class="error-msg">{{ errors.password }}</span>
                </div>


                <button class="action-button" @click="handleLogin" :disabled="loading">
                  <span v-if="!loading">登录</span>
                  <span v-else class="spinner"></span>
                </button>
              </div>


            </div>

            <!-- 注册表单 -->
            <div v-else>
              <!-- 选择注册方式 -->
              <div class="form-group">
                <label class = "registrationMethod">注册方式</label>
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
              <div class="input-wrapper">
                <input
                    v-model="form[registrationMethod]"
                    :type="registrationMethod === 'email' ? 'email' : 'tel'"
                    :placeholder="registrationMethod === 'email' ? '请输入邮箱' : '请输入手机号'"
                    class="input"
                    required
                    @input="clearError(registrationMethod)"
                    :class="{ invalid: errors[registrationMethod] }"
                />
                <span v-if="errors[registrationMethod]" class="error-msg">{{ errors[registrationMethod] }}</span>
              </div>

              <!-- 用户名 -->
              <div class="input-wrapper">
                <input
                    v-model="form.username"
                    type="text"
                    placeholder="请输入用户名"
                    class="input"
                    required
                    @input="clearError('username')"
                    :class="{ invalid: errors.username }"
                />
                <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
              </div>

              <!-- 密码 -->
              <div class="input-wrapper">
                <input
                    v-model="form.password"
                    type="password"
                    placeholder="请输入密码"
                    class="input"
                    required
                    @input="clearError('password')"
                    :class="{ invalid: errors.password }"
                />
                <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
              </div>

              <!-- 确认密码 -->
              <div class="input-wrapper">
                <input
                    v-model="form.confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    class="input"
                    required
                    @input="clearError('confirmPassword')"
                    :class="{ invalid: errors.confirmPassword }"
                />
                <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
              </div>

              <button type="submit" class="action-button" :disabled="loading">
                <span v-if="!loading">注册</span>
                <span v-else class="spinner"></span>
              </button>
            </div>
          </form>
          <!-- 切换提示 -->
          <p class="toggle-prompt">
            {{ isRegistering ? '已有账号？' : '没有账号？' }}
            <span class="toggle-link" @click="toggleRegister">{{ isRegistering ? '点击登录' : '点击注册' }}</span>
          </p>
        </div>
      </transition-group>
    </div>
    <div class="server-switch">
      <button
          class="switch-button"
          @click="toggleServerConnection"
          :class="{'blinking': isInputting}"
      >
        {{ isUsingDeployed ? '当前：远程后端服务器' : '当前：本地后端服务器' }}
      </button>
    </div>
  </div>
</template>


<script>
import { nextTick } from "vue";
import axios from "axios";
import { useApiBaseStore } from '@/stores/network';
// import { useUserStore } from "@/stores/user";

export default {
  name: "AuthPage",
  data() {
    return {
      // baseUrl
      isUsingDeployed: true,
      // 登录相关
      username: "",
      password: "",
      errors: {},
      loading: false,
      // 注册相关
      isRegistering: false,
      registrationMethod: 'email',
      form: {
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
      },
      containerHeight: 0,
      formKey: 0, // 用于强制重新渲染
      isInputting: false, // 用于控制是否正在输入
    };
  },
  mounted() {
    this.updateContainerHeight();
    this.setInitialLocalStorage();
  },
  methods: {
    setInitialLocalStorage() {
    const defaultValues = {
      jwtToken: '', 
      prefixURL: 'http://121.199.79.24:5793', // 默认的后端URL
    };
    for (const [key, value] of Object.entries(defaultValues)) {
      // 如果localStorage中没有这个键，则设置初始值
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, value);
      }
    }
    },

    handleInputFocus() {
      this.isInputting = true;
    },
    handleInputBlur() {
      this.isInputting = false;
    },
    // 切换登录/注册状态
    toggleRegister() {
      this.isRegistering = !this.isRegistering;
      this.errors = {};
      this.formKey++; // 更新 key，强制重新渲染
      nextTick(() => {
        this.updateContainerHeight();
      });
    },
    // 更新容器高度
    updateContainerHeight() {
      const formBox = this.$el.querySelector('.form-box');
      if (formBox) {
        this.containerHeight = formBox.offsetHeight;
      }
    },
    // 清除错误信息
    clearError(field) {
      if (this.errors[field]) {
        this.errors[field] = "";
      }
    },
    // 登录处理
    handleLogin() {
      if (this.username === "") {
        this.errors.username = "请输入用户名";
        return;
      }

      if (this.password === "") {
        this.errors.password = "请输入密码";
        return;
      }

      this.loading = true;

      const apiBaseStore = useApiBaseStore();
      axios.post(apiBaseStore.baseUrl + '/api/login', {
            username: this.username,
            password: this.password,
          },
          {
            timeout: 5000,
          })
          .then(response => {
            this.loading = false;
            if (response.data.code === 200) {
              console.log("登陆成功：", response.data.data);
              console.log("数据：", response.data.role);
              // const userStore = useUserStore();
              // userStore.setUserAccount(this.username);
              // console.log(userStore.userAccount)
              // localStorage.setItem('id', this.username);
              localStorage.setItem('jwtToken', response.data.data);

              // 按照role跳转
              if (response.data.role === 0) {
                this.$router.push({
                  name: 'admin_home',
                });
              } else if (response.data.role === 1) {
                this.$router.push({
                  name: 'user-main',
                });
              } else if (response.data.role === 2) {
                this.$router.push({
                  name: 'Driver-0',
                });
              } else {
                throw new Error('未知角色');
              }

            } else {
              alert('登录失败');
              console.log("登陆失败：", response.data.message);
            }
          })
          .catch(error => {
            this.loading = false;
            if (error.response) {
              console.log("服务器错误:", error.response.data);
              this.errors.password = "账号或密码错误";
            } else if (error.request) {
              console.log("请求未收到响应:", error.request);
              alert("登录失败，未收到服务器响应，请检查网络或服务器状态");
            } else {
              console.log("请求配置错误:", error.message);
              alert("登录失败，错误信息：" + error.message);
            }
          });
    },
    // 点击
    toggleServerConnection() {
      const apiBaseStore = useApiBaseStore(); // 引入 apiBaseStore
      if (this.isUsingDeployed) {
        apiBaseStore.switchToLocal();
        localStorage.setItem('prefixURL', apiBaseStore.baseUrl);
        // localStorage.setItem('webprefixURL', apiBaseStore.webBaseUrl);
        // console.log(apiBaseStore.webBaseUrl);
      } else {
        apiBaseStore.switchToDeployed();
        localStorage.setItem('prefixURL', apiBaseStore.baseUrl);
        // localStorage.setItem('webprefixURL', apiBaseStore.webBaseUrl);
        // console.log(apiBaseStore.webBaseUrl);
      }
      
      this.isUsingDeployed = !this.isUsingDeployed;
    },


    // 注册处理
    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }

      try {
        this.loading = true;
        // 触发验证码验证

        let token = ''
        try {
          token = await this.recaptcha();
        }
        catch (e) {
          console.log(e);
          // 不做继续处理
        }


        const apiBaseStore = useApiBaseStore();

        // 表单数据提交
        const response = await axios.post(apiBaseStore.baseUrl + '/api/register', {
          ...this.form, // 用户的表单数据
          recaptchaToken: token, // Google reCAPTCHA Token
        });

        // 处理后端响应
        if (response.status === 200) {
          alert('注册成功！');
          this.isRegistering = false;
          this.username = this.form.username;
          this.password = this.form.password;
          this.form = {
            email: '',
            phone: '',
            username: '',
            password: '',
            confirmPassword: '',
          };
        } else if (response.status === 409) {
          // 用户名已存在
          this.errors.username = '用户名已存在';
        } else if (response.status === 403) {
          // 手机号/邮箱已被注册
          this.errors[this.registrationMethod] = '手机号/邮箱已被注册';
        } else {
          alert('注册失败，请稍后重试');
        }
      } catch (error) {
        // 捕获网络或请求错误
        console.error('注册请求失败:', error);

        if (error.response && error.response.status === 409) {
          // 用户名已存在
          this.errors.username = '用户名已存在';
        } else if (error.response && error.response.status === 403) {
          // 手机号/邮箱已被注册
          this.errors[this.registrationMethod] = '手机号/邮箱已被注册';
        } else {
          alert('注册失败，请检查网络连接');
        }
      } finally {
        this.loading = false;
      }
    },
    // 验证表单数据
    validateForm() {
      let isValid = true;

      // 获取表单字段值
      const emailOrPhone = this.form[this.registrationMethod];
      const username = this.form.username;
      const password = this.form.password;
      const confirmPassword = this.form.confirmPassword;

      // 清除错误信息
      this.errors = {};

      // 验证邮箱或手机号
      if (!emailOrPhone || !this.isValidEmailOrPhone(emailOrPhone)) {
        this.errors[this.registrationMethod] = `请输入有效的${this.registrationMethod === 'email' ? '邮箱地址' : '手机号'}`;
        isValid = false;
      }

      // 验证邮箱或手机号输入前后不能有空格
      if (emailOrPhone.trim() !== emailOrPhone) {
        this.errors[this.registrationMethod] = `${this.registrationMethod === 'email' ? '邮箱' : '手机号'}前后不能有空格`;
        isValid = false;
      }

      // 验证用户名
      if (!username) {
        this.errors.username = '用户名不能为空';
        isValid = false;
      }

      // 验证用户名输入前后不能有空格
      if (username.trim() !== username) {
        this.errors.username = '用户名前后不能有空格';
        isValid = false;
      }

      // 验证密码
      if (!password || password.length < 6) {
        this.errors.password = '密码至少需要6个字符';
        isValid = false;
      }

      // 确认密码
      if (password !== confirmPassword) {
        this.errors.confirmPassword = '两次密码输入不一致';
        isValid = false;
      }

      // 确认密码输入前后不能有空格
      if (confirmPassword.trim() !== confirmPassword) {
        this.errors.confirmPassword = '确认密码前后不能有空格';
        isValid = false;
      }

      return isValid;
    },
    // 验证邮箱或手机号格式
    isValidEmailOrPhone(value) {
      if (this.registrationMethod === 'email') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      } else {
        return /^[1-9]\d{10}$/.test(value);
      }
    },
    // 使用 reCAPTCHA
    async recaptcha() {
      // 确保验证码已加载
      await this.$recaptchaLoaded();
      // 获取验证码 token
      return await this.$recaptcha('register');
    },

  },
};
</script>


<style scoped>
.main {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  align-items: center;
}

.bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #ee7752, #3c6ce7, #23a6d5, #ffdd33);
  background-size: 400% 400%;
  position: absolute;
  animation: gradient 5s ease infinite;
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

.container {
  width: 350px;
  margin: 100px auto;
  position: relative;
  transition: height 0.3s ease;
  align-items: center;
}

.container.expanded {
  width: 400px;
}

.form-wrapper {
  position: relative;
}

.form-box {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.form-transition-enter-active, .form-transition-leave-active {
  transition: opacity 0.3s ease;
}

.form-transition-enter-from, .form-transition-leave-to {
  opacity: 0;
}

.form-transition-enter-to, .form-transition-leave-from {
  opacity: 1;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #fff;
}

.input-wrapper {
  position: relative;
}

.input {
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1); /* 原始背景色 */
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;
  transition: background 0.3s, border 0.3s, transform 0.3s, box-shadow 0.3s;
  position: relative; /* 保证特效层正确定位 */
}

/* 输入框聚焦时的动画效果 */
.input:focus {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05); /* 放大一点 */
  border-color: #23d5ab; /* 边框颜色变化 */
  box-shadow: 0 0 10px rgba(35, 213, 171, 0.7); /* 发光效果 */
}


/* 错误的输入框边框和提示 */
.input.invalid {
  border-color: #e74c3c;
}

.error-msg {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

/* 动态渐变背景的动画 */
@keyframes gradientMove {
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

.action-button {
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

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.action-button:disabled {
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

.toggle-prompt {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  color: #ffffff;
}

.toggle-link {
  color: #23d5ab;
  cursor: pointer;
}

.toggle-link:hover {
  text-decoration: underline;
}

.form-group {
  margin-bottom: 20px;
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
  color: #ffffff;
}

.registrationMethod{
  color: #ffffff;
}

.server-switch {
  position: absolute;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  margin-bottom: 20px;
  animation: fadeIn 1s;
}

.switch-button {
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

@keyframes subtleBlink {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.1); /* 放大一点 */
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.1); /* 再放大一点 */
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}



.switch-button:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.blinking {
  animation: subtleBlink 1s ease-in-out infinite;
}


</style>

