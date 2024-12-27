<template>
  <div v-if="props.visible" class="popup">
    <div class="popup-content">
      <div class="profile-container">
        <div class="info">
          <h2 class="headline">
              <strong>购票</strong>
          </h2>
          
          <p><strong>出发地：</strong>
            <select class="select1" v-model="select_from">
              <option value="" disabled selected>请选择...</option>
              <option v-for="station in busStationData" :key="station.name" :value="station.name">{{ station.name }}</option>
            </select>
          </p>

          <p><strong>目的地：</strong>
            <select class="select1" v-model="select_dest">
              <option value="" disabled selected>请选择...</option>
              <option v-for="station in busStationData" :key="station.name" :value="station.name">{{ station.name }}</option>
            </select>
          </p>
          <p>
            <strong>车牌号：</strong>
            <select class="select3" v-model="select_carID">
              <option value="" disabled selected>请选择...</option>
              <option v-for="work in work_shift" :key="work.car_id" :value="work.car_id">{{ work.car_id }}</option></select>
          </p>
          <p>
              <button @click="cancel" class="cancel">取消</button>
              <button @click="confirm" class="confirm">确定</button>
          </p>
        </div>
        <button @click="closePopup" class="closebutton">X</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import {ref,onMounted,computed} from 'vue';
import busStationData from "@/assets/bus_station_data.json";
let select_from=ref();
let select_dest=ref();
let work_shift = ref();
let select_carID = ref(111);
let driverIDs = computed(() => {
if (!Array.isArray(work_shift.value)) {
        return 0;
}
return work_shift.value
        .filter(work_shift => work_shift.car_id === select_carID.value)
        .map(work_shift => work_shift.driver_id);
    });
// 定义 props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true, 
  },
  getTicket: {
    type: Function,
    required: true, 
  }
});
onMounted(fetchWorkShift);
async function fetchWorkShift() {
  try {
    //const apiBaseStore = useApiBaseStore();
    //let endpoint = apiBaseStore.baseUrl + "/getDriverData"; 
    let endpoint ="http://localhost:8888/getWorkShift";
    let method = 'POST';
    let requestBody = {
        current_time:new Date().toLocaleString()
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
      work_shift.value=result;
      alert('取得工作信息成功！');
    } else {
      // 错误处理
      alert(result.error || '取得工作信息失败！');
    }
  } catch (error) {
    console.error('提交时间失败:', error);
    alert('提交时间失败，请稍后再试！');
  }
}
// 定义 emits
const emit = defineEmits(['close','openPayment']);
// 购票逻辑（这里暂时没有实现具体逻辑）
function cancel() {
  closePopup(); // 关闭弹窗
  // 你可以在这里添加付款的具体逻辑
}
// 确定逻辑
function confirm() {
  console.log('确定功能触发');
  emit('openPayment');
  fetchWorkShift().then(()=>{
    props.getTicket(select_from,select_dest,select_carID, parseInt(driverIDs.value[0]));
  })
}

// 关闭弹窗
function closePopup() {
  emit('close');
}
</script>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative; /* 确保 .closebutton 的绝对定位相对于弹窗内容 */
}

.closebutton {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: #aaa; /* 使用红色主题 */
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
  transition: color 0.3s ease;
  padding: 5px; /* 增加一些内边距，使点击区域更大 */
}
.closebutton:hover {
  color: #000; /* 悬停时加深颜色 */
}

.select1 {
  width: 100%;
  font-size: 18px;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
}
.select2 {
  width: 100%;
  font-size: 18px;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
}
.select3 {
  width: 100%;
  font-size: 18px;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%236c757d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>') no-repeat right 0.75rem center/8px 8px;
}

.cancel,
.confirm {
  position: relative;
  left: 35%;
  display: inline-block;
  padding: 10px 20px;
  margin-top: 15px;
  font-size: 18px;
  color: #fff;
  background-color: #05910e;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel:hover,
.confirm:hover {
  background-color: #047b0c;
}

.cancel:active,
.confirm:active {
  transform: translateY(1px);
}

.headline {
  background: #05910e;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.info p {
  margin-bottom: 20px;
}

.info p strong {
  display: block;
  font-size: 20px;
  margin-bottom: 5px;
}

.info p select {
  width: calc(100% - 20px); /* Adjust for padding */
}

@media (max-width: 600px) {
  .popup-content {
    padding: 15px;
  }

  .headline {
    font-size: 20px;
    padding: 10px;
  }

  .cancel,
  .confirm {
    width: 100%;
    text-align: center;
  }
  .closebutton {
    font-size: 18px; /* 减小字体大小 */
    top: 8px;
    right: 8px;
  }
}

</style>