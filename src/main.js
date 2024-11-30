// main.js
import { createApp } from 'vue'; // Vue 3 的导入方式
import App from './App.vue';
import router from './router'; // 导入路由
import { createPinia } from 'pinia';
import '@fortawesome/fontawesome-free/css/all.css';
import {VueReCaptcha} from "vue-recaptcha-v3";

const app = createApp(App);
app.use(router); // 使用路由
app.use(createPinia());  // 注册 Pinia
app.use(VueReCaptcha, { siteKey: '6Lexl4sqAAAAAKNXoHp_PuPCbl-y9t6ZkD2tFI4C' }); // 注册 reCAPTCHA
app.mount('#app'); // 挂载 Vue 应用
