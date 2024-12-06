<template>
    <div v-if="props.visible" class="popup">
        <div class="popup-content">
            <div class="profile-container">
                <h2 class="headline">
                    <strong>支付</strong>
                </h2>
                <!-- 横向菜单：使用 ElTabs 实现 -->
                <el-tabs v-model="selectedPaymentMethod" @tab-click="handleTabClick">
                    <el-tab-pane label="微信支付" name="wechat">
                        <img v-if="showQrCode" :src="wechatQrCodeUrl" alt="微信支付二维码" class="qr-code" />
                    </el-tab-pane>
                    <el-tab-pane label="支付宝支付" name="alipay">
                        <img v-if="showQrCode" :src="alipayQrCodeUrl" alt="支付宝支付二维码" class="qr-code" />
                    </el-tab-pane>
                </el-tabs>

                <p>
                    <button @click="cancelPayment" class="cancel-button">取消支付</button>
                    <button @click="confirmPayment" class="confirm-button">支付完成</button>
                </p>
                <button @click="closePopup" class="closebutton">X</button>
            </div>
        </div>
    </div>
</template>
  
  <script setup>
  import { defineProps, defineEmits ,ref} from 'vue';
  import { ElTabs, ElTabPane ,ElMessage} from 'element-plus';
  const selectedPaymentMethod = ref('wechat'); // 默认选择微信支付
  const wechatQrCodeUrl = ref();
  const alipayQrCodeUrl = ref();
  // 定义 props
  const props = defineProps({
    visible: Boolean,
    from: String,
    dest: String,
    carid:String,
  });
  
  // 定义 emits
  const emit = defineEmits(['close2','confirmPay']);
  
  function confirmPayment(){
    emit('confirmPay');
    ElMessage.success("支付成功！");
    closePopup(); // 关闭弹窗
  }
  // 确定逻辑
  function cancelPayment() {
    // 你可以在这里添加确定的具体逻辑
    closePopup(); // 关闭弹窗
  }
  
  // 关闭弹窗
  function closePopup() {
    emit('close2');
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
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
}

.profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.headline {
    margin-bottom: 20px;
    text-align: center;
}

.payment-methods {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.payment-methods li {
    padding: 10px 20px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.payment-methods li.active {
    background-color: #7141A8;
    color: white;
    border-color: #7141A8;
}

.qr-code {
    max-width: 100%;
    height: auto;
}

.cancel-button, .confirm-button {
    padding: 10px 20px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.cancel-button {
    background-color: #ff6f61;
    color: white;
}

.confirm-button {
    background-color: #4caf50;
    color: white;
}

.closebutton {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
}
</style>
  

  