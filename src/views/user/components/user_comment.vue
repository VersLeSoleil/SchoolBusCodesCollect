<template>
    <div v-if="props.visible" class="popup">
        <div class="container">
            <ElInput v-model="commentarea" style="width: 400px" :rows="9" type="textarea" placeholder="请评论~" class="input"/>
            <div class="button-container">
                <button class="confirm-button" @click="handleconfirm">确认</button>
                <button class="close-button" @click="handleclose">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {defineEmits, defineProps, ref} from 'vue'
import { ElInput } from "element-plus";
//import {useApiBaseStore} from "@/stores/network"; // 导入令牌验证函数
// import { ElMessage } from 'element-plus';
import { useUserStore } from "@/stores/userStore"; // 引入 User Store
import {

        onMounted
    } from "vue";

    import {

        ElMessage,

    } from "element-plus";
    import {
        useRouter
    } from "vue-router";
    const router = useRouter();
    import { getUserIDFromToken } from "@/auth.js";
const userStore = useUserStore();
// const tempUserInfo = ref({ ...userStore.userInfo });
const emit = defineEmits(['close_showjourney']);
const commentarea = ref('');
const props = defineProps({
  visible: {
    type: Boolean,
    required: true, 
  }
});

function formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

async function submitComment(){
    const prefixURL = localStorage.getItem("prefixURL") || 'https://localhost:8888';
    if(commentarea.value == ''){
        ElMessage.error("请输入评论内容");
        return;
    }
    try{
        //const apiBaseStore = useApiBaseStore();
        let endpoint = prefixURL + "/submitUserComment";
        let requestBody = {
            studentname :  userStore.userInfo.name,
            commentcontent: commentarea.value,
            commenttime : formatDateTime(new Date()),  // 使用格式化后的当前时间
            avatar : userStore.userInfo.avatar.replace(prefixURL, ''),
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        if (response.ok) {
        // 信息提交成功

        ElMessage.success("评论成功");
        emit('update_comments');
        emit('close_WriteComment'); //调用user_platform的close_WriteComment函数
        
        } else {
        // 错误处理

        ElMessage.error(result.message || "操作失败，请检查输入！");
        }
    }catch (error) {
      ElMessage.error("提交失败，请稍后再试！");
    }
}
function handleclose(){
    emit('close_WriteComment'); //调用user_platform的close_WriteComment函数
}
function handleconfirm(){
    //alert(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() + " " + new Date().toLocaleTimeString(),);
    submitComment();
    commentarea.value = '';
    
}

onMounted(async () => {
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
            // ElMessage.error("未找到用户令牌");
            router.push("/login"); // 返回登录页
        }
    });

</script>

<style scoped>
.container {
  /* 定义一个固定大小或根据内容自动调整 */
  width: 450px; /* 或者使用百分比宽度 */
  height: 300px; /* 或者不设置高度让其根据内容自动调整 */
  /* 设置边框以形成框的外观 */
  border: 1px solid #ccc;
  /* 给予一些内边距，使得内部元素不会紧贴边界 */
  padding: 15px;
  /* 设置背景颜色 */
  background-color: #88e1de;
  /* 可选：圆角边框 */
  border-radius: 8px;
  /* 可选：阴影效果增加立体感 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 使用Flexbox布局来方便地对齐内部元素 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 子元素水平居中 */
  justify-content: flex-start; /* 子元素从顶部开始排列 */
  position: relative;
}
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
  z-index: 100;
}
.confirm-button, .close-button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
}
.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}
.input{
    margin-top: 30px;
}
</style>