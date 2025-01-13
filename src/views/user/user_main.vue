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
              <ElAvatar :src="userStore.userInfo.avatar" size="medium" />
              <span class="user-name">{{ userStore.userInfo.name }}</span>
              <ElButton @click="handleLogout" type="danger" size="large" round>登出</ElButton>
          </div>
      </header>
  <div class="app-container">  
      <user_map @updateSites="updateSites"/> 
      <button v-show="buyButtonVisible&&!leaveButtonVisible" @click="showBuyTickt" class="btn buyTicket">购票</button>
      <button v-show="buyButtonVisible&&!leaveButtonVisible" @click="showCallBus" class="btn callBus">叫车</button>
      <button v-show="!buyButtonVisible" @click="showTicket" class="btn ticket">上车凭证</button>
      <button v-show="!buyButtonVisible" @click="confirmTicket" class="btn confirmTicket">确认上车</button>
      <button v-show="!buyButtonVisible" @click="cancleTicket" class="btn cancelTicket">取消订单</button>
      <button v-show="leaveButtonVisible" @click="leaveCar" class="btn leaveCar">确认下车</button>
  </div>
  <user_ticket :visible="buyTicketVisible" :sites="sites" @close="close" @openPayment="openPayment" :getTicket="getTicket" />
  <User_proveticket :visible="provideTicketVisible" @close1="close1" @confirmInCar="confirmInCar" :from="from" :dest="dest" :carid="carid" :buyTime="buyTime"/>
  <User_callBus :visible="callBusVisible" :sites="sites" @close3="close3" @openPayment="openPayment" :getTicket="getTicket"/>
  <User_payment :visible="paymentVisible" :confirmPay="confirmPay" @close2="close2" :from="from" :dest="dest"/>
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
import user_map from './user_map.vue';
// import user_map from '@/views/components/Map-user.vue';

import {
      ElAvatar,
      ElButton,
      ElMessageBox,
      ElMessage,
  } from "element-plus";
import "element-plus/dist/index.css";
import {
      useApiBaseStore
  } from "@/stores/network"; // 导入令牌验证函数
import User_payment from './user_payment.vue';
import User_callBus from './user_callBus.vue';
import { useUserStore } from '@/stores/userStore';
const userStore=useUserStore();
//import { getUserIDFromToken } from "@/auth.js";
import { getUserIDFromToken } from "@/auth.js";
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
  if (message.type === 'call_accept' && message.passenger_id === localStorage.getItem("id")) {
    // 进行相应的处理
    carid.value = message.car_id;
    console.log('Processing case_accept message:', message);

    // 处理完后删除该条消息
    webSocketStore.messages.splice(i, 1); // 从队列中移除该条消息
    break; // 如果只需要处理一条符合条件的消息，可以跳出循环
  }
}
}, { deep: true });

let sites = [];
let journeydata = ref([]);
let from = ref("榕园广场");
let dest = ref("教学楼");
let carid = ref("粤C111111");
let buyTime = ref();
let leaveTime=ref();
let driverid=ref();
let buyButtonVisible = ref(true);
let buyTicketVisible = ref(false);
let provideTicketVisible = ref(false);
let paymentVisible=ref(false);
let leaveButtonVisible=ref(false);
let callBusVisible=ref(false);
let showjourneyVisible = ref(false);
let currentOrderID=ref();
let currentPaymentID=ref();
let currentPaymentMethod=ref("微信");
onMounted(async () => {
      const validation = await validateToken();
      if (!validation.valid) {
          ElMessage.error(validation.message);
          router.push("/login");
      }

      const token = localStorage.getItem("jwtToken");
        if (token) {
            const userID = getUserIDFromToken(token); // 解析 token 获取 userID
            if (userID) {
                await userStore.fetchUserInfo(); // 向后端请求用户信息
            } else {
                ElMessage.error("无效的用户令牌");
                router.push("/login"); // 返回登录页
            }
        } else {
            ElMessage.error("未找到用户令牌");
            router.push("/login"); // 返回登录页
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
function getTicket(value1, value2, value3,value4) {
  from.value = value1.value;
  dest.value = value2.value;
  carid.value = value3.value;
  driverid.value=value4.value;
  buyTime.value = formatDateTime(new Date())  // 使用格式化后的当前时间
  submitOrder().then(() => {
    fetchCurrentOrder();
  });
  
}


function cancleTicket(){
  ChangeOrder("2"); //order status = 已取消
  ChangePayment("2"); //payment status = 已退款
  buyButtonVisible.value = true;
  buyTicketVisible.value = false;
  provideTicketVisible.value= false;
  paymentVisible.value=false;
  leaveButtonVisible.value=false;
  callBusVisible.value=false;
  
}


async function fetchCurrentOrder() {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"/getCurrentOrder";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/getCurrentOrder`;
  //let endpoint ="https://localhost:8888/getCurrentOrder";
  let method = 'POST';
  let requestBody = {
    student_account:userStore.userInfo.student_account,
    pickup_time:buyTime.value
  };
  // 发送请求到后端
  const response = await fetch(endpoint, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),  // 将请求体转为 JSON 格式
  });

  // 调试：打印响应状态码和响应内容
  console.log('Response Status:', response.status);
  console.log('Response Headers:', response.headers);
  
  // 如果响应状态不是200，返回错误信息
  if (!response.ok) {
    alert('请求失败，状态码：' + response.status);
    const errorText = await response.text();
    console.log('Error Response:', errorText);  // 打印返回的 HTML 或其他内容
    return;
  }

  // 解析响应
  const result = await response.json();
  console.log('Response Data:', result);

  // 处理成功与否
  if (response.ok) {
    // 司机数据成功返回，填充数据
    currentOrderID.value=result.order_id;

    // alert('取得订单信息成功！');
  } else {
    // 错误处理
    alert(result.error || '取得订单信息失败！');
  }
} catch (error) {
  console.error('提交用户ID失败:', error);
  alert('提交用户ID失败，请稍后再试！');
}
}
async function fetchCurrentPayment() {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/getCurrentPayment`;
  // let endpoint ="https://localhost:8888/getCurrentPayment";
  let method = 'POST';
  let requestBody = {
    order_id:currentOrderID.value,
    payment_time:buyTime.value
  };
  // 发送请求到后端
  const response = await fetch(endpoint, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),  // 将请求体转为 JSON 格式
  });

  // 调试：打印响应状态码和响应内容
  console.log('Response Status:', response.status);
  console.log('Response Headers:', response.headers);
  
  // 如果响应状态不是200，返回错误信息
  if (!response.ok) {
    alert('请求失败，状态码：' + response.status);
    const errorText = await response.text();
    console.log('Error Response:', errorText);  // 打印返回的 HTML 或其他内容
    return;
  }

  // 解析响应
  const result = await response.json();
  console.log('Response Data:', result);

  // 处理成功与否
  if (response.ok) {
    // 司机数据成功返回，填充数据
    currentPaymentID.value=result.payment_id;
    // alert('取得支付信息成功！');
  } else {
    // 错误处理
    alert(result.error || '取得支付信息失败！');
  }
} catch (error) {
  console.error('提交用户ID失败:', error);
  alert('提交用户ID失败，请稍后再试！');
}
}
async function submitOrder() {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"/submitUserOrder";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/submitUserOrder`;
  // let endpoint = "https://localhost:8888" + "/submitUserOrder";
  let method = "POST";
  let requestBody = {
    order_id: null, 
    student_account:userStore.userInfo.student_account,
    driver_id:driverid.value,
    car_id:carid.value,
    pickup_station_id:0,
    dropoff_station_id:0,
    pickup_station_name:from.value,
    dropoff_station_name:dest.value,
    pickup_time:buyTime.value,
    dropoff_time:null,  
    status:"2",
    payment_id:null
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
    // alert("操作成功！");
  } else {
    // 错误处理
    alert(result.message || "操作失败，请检查输入！");
  }
 }catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请稍后再试！");
  }
}
async function ChangeOrder(value) {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"/changeOrder";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/changeOrder`;
  // let endpoint = "https://localhost:8888" + "/changeOrder";
  let method = "POST";
  let requestBody = {
    order_id: currentOrderID.value, 
    student_account:userStore.userInfo.student_account,
    driver_id:driverid.value,
    car_id:carid.value,
    pickup_station_id:0,
    dropoff_station_id:0,
    pickup_time:buyTime.value,
    pickup_station_name:from.value,
    dropoff_station_name:dest.value,
    dropoff_time:null,
    status:value,
    payment_id:currentPaymentID.value
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
    // alert("操作成功！");
  } else {
    // 错误处理
    alert(result.message || "操作失败，请检查输入！");
  }
 }catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请稍后再试！");
  }
}
async function ChangeLeaveTime(value) {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"/changeLeaveTime";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/changeLeaveTime`;
  // let endpoint = "https://localhost:8888" + "/changeLeaveTime";
  let method = "POST";
  let requestBody = {
    order_id:currentOrderID.value, 
    student_account:userStore.userInfo.student_account,
    driver_id:driverid.value,
    car_id:carid.value,
    pickup_station_id:0,
    dropoff_station_id:0,
    pickup_station_name:from.value,
    dropoff_station_name:dest.value,
    pickup_time:buyTime.value,
    dropoff_time:value,
    status:null,
    payment_id:null
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
    // alert("操作成功！");
  } else {
    // 错误处理
    alert(result.message || "操作失败，请检查输入！");
  }
 }catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请稍后再试！");
  }
}
async function submitPayment() {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"/submitUserPayment";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/submitUserPayment`;
  // let endpoint = "https://localhost:8888" + "/submitUserPayment";
  let method = "POST";
  let requestBody = {
    payment_id:null,
    order_id: currentOrderID.value, 
    vehicle_id:carid.value,
    payment_amount:123,
    payment_method:currentPaymentMethod.value,
    payment_time:buyTime.value,
    payment_status:"0"
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
    // alert("操作成功！");
  } else {
    // 错误处理
    alert(result.message || "操作失败，请检查输入！");
  }
 }catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请稍后再试！");
  }
}
async function ChangePayment(value) {
try {
  // const apiBaseStore = useApiBaseStore();
  // let endpoint = apiBaseStore.localBaseUrl+"/changePayment";
  const prefixURL=localStorage.getItem("prefixURL")||'https://localhost:8888';
  let endpoint = `${prefixURL}/changePayment`;
  // let endpoint = "https://localhost:8888" + "/changePayment";
  let method = "POST";
  let requestBody = {
    payment_id:currentPaymentID.value,
    order_id: currentOrderID.value, 
    vehicle_id:carid.value,
    payment_amount:111,
    payment_method:currentPaymentMethod.value,
    payment_time:buyTime.value,
    payment_status:value
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
    // alert("操作成功！");
  } else {
    // 错误处理
    alert(result.message || "操作失败，请检查输入！");
  }
 }catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请稍后再试！");
  }
}
function confirmPay(value){
  let message = {
      type: 'payment_user_count',
      car_id: carid.value,
      count: 1, // 付款人数
      time: formatDateTime(new Date())  // 使用格式化后的当前时间
  };
  console.log("message",message);
      // 将新的呼叫信息添加到 store 中
      webSocketStore.sendMessage(JSON.stringify(message));
      buyButtonVisible.value = false; 
      buyTicketVisible.value=false;
      callBusVisible.value=false;
      currentPaymentMethod=value.value;
      console.log(currentPaymentMethod);
      submitPayment().then(() => {
        fetchCurrentPayment().then(() => {
        ChangeOrder("0"); //oreder status = 进行中
        ChangePayment("1");
  });
  });
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
      const prefixURL = localStorage.getItem("prefixURL") || 'https://localhost:8888';
      // const token = localStorage.getItem("jwtToken");
      // const userID = getUserIDFromToken(token);
      // const params = new URLSearchParams();
      // params.append("userID", userID);
  try{
      //const apiBaseStore = useApiBaseStore();
      //let endpoint = apiBaseStore.localBaseUrl + "/getjourneyrecord";
      let endpoint = prefixURL + "/getjourneyrecord";
      let method = 'GET';
      const response = await fetch(endpoint, {
          method: method,
          headers: {
          'Content-Type': 'application/json',
        },
      });
      //const response = await axios.post(`${prefixURL}/api/getOrders`, params);
      const result = await response.json();
      //const result = response.data;
      journeydata.value = result;
      //console.log(journeydata.value);
      return journeydata.value;
  }catch (error) {
  console.error('There was an error fetching the data!', error)
  }
}
function formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

function confirmTicket() {
  buyButtonVisible.value=true;
  leaveButtonVisible.value=true;
  ChangeOrder("0");  
  // 这里可以添加其他逻辑，例如确认上车后执行的操作
  console.log("carid=",from.value,dest.value);
  // const rawValue = carid.value; // 使用 carid.value 而不是 toRaw(carid)
  let message = {
      type: 'boardingMessage',
      car_id: carid.value,
      boardingCount: 1, // 
      time: formatDateTime(new Date())  // 使用格式化后的当前时间
  };

  // 将新的呼叫信息添加到 store 中
  webSocketStore.sendMessage(JSON.stringify(message));
}
function leaveCar(){
  buyButtonVisible.value=true;
  leaveButtonVisible.value=false;
  leaveTime.value = formatDateTime(new Date())  // 使用格式化后的当前时间
  ChangeOrder("1");
  ChangeLeaveTime(leaveTime.value);
  let message = {
      type: 'alightingMessage',
      car_id: carid.value,
      alightingCount: 1, // 
      time: formatDateTime(new Date())  // 使用格式化后的当前时间
  };
  console.log("message",message);
  // 将新的呼叫信息添加到 store 中
  webSocketStore.sendMessage(JSON.stringify(message));
}
function confirmInCar(){
  buyButtonVisible.value = true;
  leaveButtonVisible.value=true;
  ChangeOrder("0");
  // const rawValue = carid.value; 

}
// function confirmInCar(){
//     console.log("dafasf");
//     console.log(carid);
//     const rawValue = carid; // 使用 carid.value 而不是 toRaw(carid)
//     let message = {
//         type: 'boardingMessage',
//         car_id: rawValue._rawValue,
//         boardingCount: 1, // 
//         time: new Date().toLocaleString(), // 
//     };
//         // 将新的呼叫信息添加到 store 中
//         webSocketStore.sendMessage(JSON.stringify(message));

//     buyButtonVisible.value = !buyButtonVisible.value;
//     leaveButtonVisible.value=false;
// }
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
          localStorage.setItem('prefixURL', 'https://sysuschoolbus.top:5793');
          router.push('/login'); // 跳转到登录页面
      } catch (error) {
          if (error !== "cancel") {
              console.error("登出失败:", error);
              ElMessage.error("登出失败，请稍后再试");
          }
      }
}

function updateSites(newSites) {
  sites = newSites;
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