<template>
    <!-- 顶部导航栏 -->
    <header class="header">
            <div class="nav-menu">
                <ElButton @click="toMycenter" type="primary" size="large" class="nav-menu-btn" round>个人中心
                </ElButton>
                <ElButton @click="toSchduel" type="primary" size="large" class="nav-menu-btn" round>行程计划
                </ElButton>
                <ElButton @click="toPlatform" type="primary" size="large" class="nav-menu-btn" round>交流平台
                </ElButton>
            </div>
            <div class="user-info">
                <ElAvatar :src="userInfo.avatar" size="medium" />
                <span class="user-name">{{ userInfo.name }}</span>
                <ElButton @click="handleLogout" type="danger" size="large" round>登出</ElButton>
            </div>
        </header>
    <div class="app-container">  
        <user_map/> 
        <button v-show="buyButtonVisible&&!leaveButtonVisible" @click="showBuyTickt" class="btn buyTicket">购票</button>
        <button v-show="buyButtonVisible&&!leaveButtonVisible" @click="showCallBus" class="btn callBus">叫车</button>
        <button v-show="!buyButtonVisible" @click="showTicket" class="btn ticket">上车凭证</button>
        <button v-show="!buyButtonVisible" @click="confirmTicket" class="btn confirmTicket">确认上车</button>
        <button v-show="leaveButtonVisible" @click="leaveCar" class="btn leaveCar">确认下车</button>
    </div>
    <user_ticket :visible="buyTicketVisible" @close="close" @openPayment="openPayment" :getTicket="getTicket" />
    <User_proveticket :visible="provideTicketVisible" @close1="close1" @confirmInCar="confirmInCar" :from="from" :dest="dest" :carid="carid" :buyTime="buyTime"/>
    <User_callBus :visible="callBusVisible" @close3="close3" @openPayment="openPayment" :getTicket="getTicket"/>
    <User_payment :visible="paymentVisible" @confirmPay="confirmPay" @close2="close2" :from="from" :dest="dest"/>
    <user_showjourney :visible="showjourneyVisible" @close_showjourney="close_showjourney" :getjourneyrecord="getjourneyrecord"/>
</template>

<script setup>
import user_ticket from './user_ticket.vue';
import user_showjourney from './components/user_showjourney.vue';
import router from '@/router';
import { ref, onMounted, computed, watch } from 'vue';
import User_proveticket from './user_proveticket.vue';
import axios from "axios";
import {validateToken} from "@/auth.js";
// import user_map from './user_map.vue';
import user_map from '@/views/components/Map-user.vue';

import {
        ElAvatar,
        ElButton,
        ElMessageBox,
        ElMessage
    } from "element-plus";
import "element-plus/dist/index.css";
import {
        useApiBaseStore
    } from "@/stores/network"; // 导入令牌验证函数
import logo from "@/assets/logo.png";
import User_payment from './user_payment.vue';
import User_callBus from './user_callBus.vue';

import { useWebSocketStore } from '@/stores/webSocketStore';

const webSocketStore = useWebSocketStore();

// 使用 computed 來確保 Message 是響應式的
const Message = computed(() => webSocketStore.messages);

// 监听 Message 队列的变化
watch(Message, (newMessages) => {
  // 遍历消息队列，处理类型为 'case_accept' 的消息
  for (let i = 0; i < newMessages.length; i++) {
    const message = newMessages[i];

    // 判断消息类型
    if (message.type === 'call_accept') {
      // 进行相应的处理
      carid.value = message.car_id
      console.log('Processing case_accept message:', message);

      // 处理完后删除该条消息
      webSocketStore.messages.splice(i, 1); // 从队列中移除该条消息
      break; // 如果只需要处理一条符合条件的消息，可以跳出循环
    }
  }
}, { deep: true });


const userInfo = ref({
        name: "Richard喵~~~~",
        avatar: logo,
});

let journeydata = ref([])
let from = ref("榕园广场");
let dest = ref("教学楼");
let carid = ref("粤C11111");
let buyTime = ref();
let buyButtonVisible = ref(true);
let buyTicketVisible = ref(false);
let provideTicketVisible = ref(false);
let paymentVisible=ref(false);
let leaveButtonVisible=ref(false);
let callBusVisible=ref(false);
let showjourneyVisible = ref(false);
onMounted(async () => {
        const validation = await validateToken();
        if (!validation.valid) {
            ElMessage.error(validation.message);
            router.push("/login");
        }
    });
function showBuyTickt() {
    buyTicketVisible.value = true;
}
function showCallBus(){
    callBusVisible.value=true;
}

function close() {
    buyTicketVisible.value = false;
}
function close_showjourney(){
    showjourneyVisible.value = false;
}
function openPayment(){
    paymentVisible.value=true;
}
function getTicket(value1, value2, value3) {
    from.value = value1;
    dest.value = value2;
    carid.value = value3;
    buyTime.value = new Date().toLocaleString();
    submitOrder();
    // 购票后隐藏购票按钮
}

async function submitOrder() {
  try {
    const apiBaseStore = useApiBaseStore();
    let endpoint = apiBaseStore + "/submitUserOrder";
    let method = "POST";
    let requestBody = {
      order_id: 111111,
      //driver_avatar:user.avatar,
      student_id:21123,
      pickup_station_id:123123,
      dropoff_station_id:1231231,
      pickup_time:buyTime.value,
      status:"待付款",
      payment_id:12321231
    }
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    console.log(JSON.stringify(requestBody));
    const result = await response.json();
    if (response.ok) {
      // 信息提交成功
      alert("操作成功！");
    } else {
      // 错误处理
      alert(result.message || "操作失败，请检查输入！");
    }
   }catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请稍后再试！");
    }
}

function confirmPay(){
    const rawValue = carid.value; // 使用 carid.value 而不是 toRaw(carid)
    let message = {
        type: 'payment_user_count',
        car_id: rawValue._rawValue,
        count: 1, // 付款人数
        time: new Date().toLocaleString(), // 付款时间
    };
        // 将新的呼叫信息添加到 store 中
        webSocketStore.sendMessage(JSON.stringify(message));
    buyButtonVisible.value = false; 
    buyTicketVisible.value=false;
    callBusVisible.value=false;
}

function showTicket() {
    provideTicketVisible.value = true;
}

function close1() {
    provideTicketVisible.value = false;
}
function close2() {
    paymentVisible.value = false;
}
function close3() {
    callBusVisible.value = false;
}
function toMycenter() {
    router.push('/user-person');
}
function toSchduel(){
    showjourneyVisible.value = true;
}
function toPlatform(){
    router.push('/user-platform');
}
async function getjourneyrecord(){
    try{
        const apiBaseStore = useApiBaseStore();
        let endpoint = apiBaseStore.localBaseUrl + "/getjourneyrecord";
        let method = 'GET';
        const response = await fetch(endpoint, {
            method: method,
            headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        journeydata.value = result;
        //console.log(journeydata.value);
        return journeydata.value;
    }catch (error) {
    console.error('There was an error fetching the data!', error)
    }
}

function confirmTicket() {
    buyButtonVisible.value=true;
    leaveButtonVisible.value=true;
    // 这里可以添加其他逻辑，例如确认上车后执行的操作
    console.log(carid);
    const rawValue = carid.value; // 使用 carid.value 而不是 toRaw(carid)
    let message = {
        type: 'boardingMessage',
        car_id: rawValue._rawValue,
        boardingCount: 1, // 
        time: new Date().toLocaleString(), // 
    };
        // 将新的呼叫信息添加到 store 中
        webSocketStore.sendMessage(JSON.stringify(message));
}
function leaveCar(){
    buyButtonVisible.value=true;
    leaveButtonVisible.value=false;

    const rawValue = carid.value; 
    let message = {
        type: 'alightingMessage',
        car_id: rawValue._rawValue,
        alightingCount: 1, // 
        time: new Date().toLocaleString(), // 
    };
        // 将新的呼叫信息添加到 store 中
        webSocketStore.sendMessage(JSON.stringify(message));
}
function confirmInCar(){
    console.log("dafasf");
    console.log(carid);
    const rawValue = carid; // 使用 carid.value 而不是 toRaw(carid)
    let message = {
        type: 'boardingMessage',
        car_id: rawValue._rawValue,
        boardingCount: 1, // 
        time: new Date().toLocaleString(), // 
    };
        // 将新的呼叫信息添加到 store 中
        webSocketStore.sendMessage(JSON.stringify(message));

    buyButtonVisible.value = !buyButtonVisible.value;
    leaveButtonVisible.value=false;


}
async function handleLogout() {
        const validation = await validateToken();
        if (!validation.valid) {
            ElMessage.error(validation.message);
            router.push("/login");
            return;
        }

        // 确认是否登出
        try {
            await ElMessageBox.confirm("确定要登出吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            });
            // 调用后端 API 进行登出操作
            const apiBaseStore = useApiBaseStore();
            await axios.post(apiBaseStore.baseUrl + '/api/logout', {}, {
                headers: {
                    Authorization: localStorage.getItem('jwtToken'),
                },
            });
            ElMessage.success("您已成功登出~");
            localStorage.removeItem('jwtToken'); // 移除令牌
            localStorage.setItem('prefixURL', 'http://121.199.79.24:5793');
            router.push('/login'); // 跳转到登录页面
        } catch (error) {
            if (error !== "cancel") {
                console.error("登出失败:", error);
                ElMessage.error("登出失败，请稍后再试");
            }
        }
    }
</script>

<style scoped>
:global(:root) {
    --primary-color: #7141A8;
    --secondary-color: #5E3691;
    --highlight-color: #FF6F61; /* 更加显眼的颜色 */
    --text-color: floralwhite;
    --font-size: 18px; /* 增大字体大小 */
    --btn-width: 120px; /* 增大按钮宽度 */
    --btn-height: 120px; /* 增大按钮高度 */
    --btn-radius: 50%;
    --shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* 更强的阴影效果 */
    --transition: all 0.3s ease;
    --icon-size: 24px;
    --spacing: 20px;
    --border-color: rgba(255, 255, 255, 0.5); /* 边框颜色 */
    --hover-border-color: rgba(255, 255, 255, 0.8); /* 悬停时的边框颜色 */
    --active-border-color: rgba(255, 255, 255, 1); /* 激活时的边框颜色 */
    --border-width: 2px; /* 边框宽度 */
}
.header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
    }

.nav-menu {
        display: flex;
        gap: 20px;
}

.nav-menu-btn {
        margin-right: 20px;
        padding: 25px 20px;
        font-size: 17px;
    }


    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .user-name {
        font-weight: bold;
        margin-right: 10px;
    }

.app-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: var(--spacing);
    
}


.btn {
    width: var(--btn-width);
    height: var(--btn-height);
    border-radius: var(--btn-radius);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--text-color);
    font-size: var(--font-size);
    font-weight: bold;
    border: var(--border-width) solid var(--border-color); /* 添加边框 */
    cursor: pointer;
    box-shadow: var(--shadow);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: var(--shadow);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
    }
    100% {
        transform: scale(1);
        box-shadow: var(--shadow);
    }
}

.btn:hover {
    background: linear-gradient(135deg, var(--highlight-color), var(--secondary-color)); /* 悬停时改变背景颜色 */
    transform: scale(1.1);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
    border-color: var(--hover-border-color); /* 悬停时改变边框颜色 */
}

.btn:active {
    transform: scale(0.95);
    border-color: var(--active-border-color); /* 激活时改变边框颜色 */
}

.btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: var(--transition);
}

.btn:hover::before {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.btn svg {
    width: var(--icon-size);
    height: var(--icon-size);
    margin-right: 8px;
}

.myCenter {
    margin-top: calc(-1 * var(--spacing));
}

.confirmTicket {
    background: linear-gradient(135deg, var(--highlight-color), var(--secondary-color))!important; /* 确认上车按钮更显眼 */
}

@media (min-width: 768px) {
    .app-container {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
    }

    .myCenter {
        margin-top: 0;
    }
}
</style>