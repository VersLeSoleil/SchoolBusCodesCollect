// main.js
import { createApp } from 'vue'; // Vue 3 的导入方式
import App from './App.vue';
import router from './router'; // 导入路由
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia';
import '@fortawesome/fontawesome-free/css/all.css';
import { VueReCaptcha } from "vue-recaptcha-v3";
import VueApexCharts from 'vue3-apexcharts'


const app = createApp(App);
export const pinia = createPinia() // <-- 先创建并导出


app.use(pinia)
app.use(VueApexCharts)
app.use(ElementPlus)
app.use(router); // 使用路由
app.use(createPinia());  // 注册 Pinia
app.use(VueReCaptcha, { siteKey: '6Lexl4sqAAAAAKNXoHp_PuPCbl-y9t6ZkD2tFI4C' }); // 注册 reCAPTCHA
app.mount('#app'); // 挂载 Vue 应用
