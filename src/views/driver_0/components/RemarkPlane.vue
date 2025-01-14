<template>
  <div v-if="isVisible" class="comment-bar">
    <div class="comment-bar-header">
      <span class="comment-bar-title">评论</span>
      <button @click="toggleVisibility" class="close-button">-</button>
    </div>
    <div class="comment-bar-content" v-if="comments && comments.length">
      <ul>
        <li v-for="(comment, index) in comments" :key="index">
          <div class="comment">
            <div class="comment-author">{{ comment.student_name }}</div> 
            <div class="comment-body">{{ comment.comment_content }}</div>  
            <el-avatar :size="48" :src="comment.avatar"></el-avatar>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="no-comments">暂无评论</div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
// import { useApiBaseStore } from '@/stores/network';
import axios from 'axios';
import { getUserIDFromToken } from "@/auth.js";
// 声明响应式变量
const isVisible = ref(true); // 是否显示评论栏
const comments = ref([]);    // 评论内容
// const info="getComment";

const fetchComments = async () => {
  const prefixURL = localStorage.getItem("prefixURL") || 'https://localhost:8888';
  const token = localStorage.getItem("jwtToken");
  const userID = getUserIDFromToken(token);

  const params = new URLSearchParams();
  params.append("userID", userID);

  try {
    const response = await axios.post(`${prefixURL}/getcommentsForPlats`, params);
    if (response.data) {
      // 处理 avatar 字段为完整路径
      const processedData = response.data.map(comment => {
        if (comment.avatar) {
          comment.avatar = `${prefixURL}${comment.avatar}`;
        }
        return comment;
      });
// 按 comment_time 降序排序（时间最新的排在最前）
processedData.sort((a, b) => new Date(b.comment_time) - new Date(a.comment_time));

      comments.value = processedData;
      console.log("Received comments data:", comments.value);
      console.log("Received response data:", response.data);
    } else {
      console.error("No comments data returned");
    }
  } catch (error) {
    console.error("Failed to fetch feedback data:", error);
  }
};




// 切换评论栏显示状态
const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};


onMounted(fetchComments);
</script>

<style scoped>
.comment-bar {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 300px;
  max-height: 400px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  overflow-y: auto;
  z-index: 1000;
}

.comment-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
}

.comment-bar-content {
  margin-top: 10px;
}

.comment {
  margin-bottom: 10px;
}

.comment-author {
  font-weight: bold;
}

.comment-body {
  margin-top: 5px;
}

.no-comments {
  text-align: center;
  color: #888;
  font-style: italic;
}
</style>
