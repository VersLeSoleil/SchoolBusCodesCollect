<script setup>
    import {ref,defineProps,defineEmits} from 'vue';
    defineProps(['dInfoVisible']);
    let isVisible=ref('dInfoVisible');
    const emit = defineEmits(['close']);
    const closepopup = () => {
     emit('close');
    };
</script>

<template>
    <div v-if="isVisible" class="popup">
      <div class="popup-content">
        <div class="profile-container">
          <div class="info">
            <h2 class="headline">
                <strong >购票</strong>
            </h2>
            <p>
              <strong>车牌号：</strong>
            </p>
            <p>
              <strong>出发地：</strong>
            </p>
            <p>
              <strong>目的地：</strong>
            </p>
            <p>
                <button @click="buy" class="buy">付款</button>
                <button @click="confirm" class="confirm">确定</button>
            </p>
          </div>
          <button @click="closepopup" class="closebutton">X</button>
        </div>
      </div>
    </div>
</template>

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
  width: 600px;
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

.buy{
    position: relative;
    left: 210px;
    font-size: 25px;
    color: #aaa;
    cursor: pointer;
}
.confirm{
    position: relative;
    left: 260px;
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
      font-size: 30px;
      font-weight: bold;
      /* 其他字体属性 */
    }

</style>