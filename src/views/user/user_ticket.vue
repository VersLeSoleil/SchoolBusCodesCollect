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
              <option value="option1">榕园广场</option>
              <option value="option2">荔园广场</option>
              <option value="option3">教学楼</option></select></p>

          <p><strong>目的地：</strong>
            <select class="select1" v-model="select_dest">
              <option value="" disabled selected>请选择...</option>
              <option value="option1">榕园广场</option>
              <option value="option2">荔园广场</option>
              <option value="option3">教学楼</option></select></p>
          <p>
            <strong>车牌号：</strong>
            <select class="select3" v-model="select_carID">
              <option value="" disabled selected>请选择...</option>
              <option value="option1">粤C11111</option>
              <option value="option2">粤C11112</option>
              <option value="option3">粤C11113</option></select>
          </p>
          <p>
              <button @click="buy" class="buy">付款</button>
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
// 定义 props
const props = defineProps({
  visible: Boolean
});

// 定义 emits
const emit = defineEmits(['close']);

// 购票逻辑（这里暂时没有实现具体逻辑）
function buy() {
  console.log('付款功能触发');
  // 你可以在这里添加付款的具体逻辑
}

// 确定逻辑
function confirm() {
  console.log('确定功能触发');
  // 你可以在这里添加确定的具体逻辑
  closePopup(); // 关闭弹窗
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
  border-radius: 30px;
  width: 500px;
  max-width: 90%;
  position: relative;
}
.closebutton {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 16px;
    color: #aaa;
    cursor: pointer;
}
.select1{
    position: relative;
    left: 10%;
    font-size: 40px;
}
.select2{
    position: relative;
    left: 10%;
    font-size: 40px;
}
.select3{
    position: relative;
    left: 10%;
    font-size: 40px;
}
.buy{
    position: relative;
    left: 35%;
    font-size: 25px;
    color: #aaa;
    cursor: pointer;
}
.confirm{
    position: relative;
    left: 40%;
    font-size: 25px;
    color: #aaa;
    cursor: pointer;
}

.headline{
    background: #05910e;
    padding: 25px;
    border-radius: 30px;
    position: relative;
    font-family: 'Arial', sans-serif;
    font-size: 25px;
    font-weight: bolder;
    color: #7c2905;
    text-align: center;
}

.info p strong {
      font-family: 'Arial', sans-serif;
      font-size: 40px;
      font-weight: bold;
      position: relative;
      left: 8%;
      /* 其他字体属性 */
    }

</style>