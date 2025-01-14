
<template>
  <div v-if="isVisible" class="comment-bar">
    <div v-show="isVisible" class="comment-bar-header">
      <span class="comment-bar-title">评论</span>
      <button @click="toggleVisibility" class="close-button">-</button>
    </div>
    <div class="comment-bar-content" v-if="comments && comments.length">
      <ul>
        <li v-for="(comment, index) in comments" :key="index">
          <div class="comment">
            <el-avatar :size="48" :src="comment.avatar"></el-avatar>
            <div class="comment-details">
              <div class="comment-author">{{ comment.student_name }}</div>
              <div class="comment-body">{{ comment.comment_content }}</div>
            </div>
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
import { defineExpose } from 'vue';
import { getUserIDFromToken } from "@/auth.js";
// 声明响应式变量
const isVisible = ref(false); // 是否显示评论栏
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

defineExpose({
  toggleVisibility
});

onMounted(fetchComments);
</script>

<style scoped>
.comment-bar {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 350px;
  max-height: 450px;
  background: linear-gradient(to top, #f9f9f9, #f0f0f0);
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 15px 15px rgba(0, 0, 0, 0.1);
  padding: 15px;
  overflow-y: auto;
  z-index: 1000;
  font-family: 'Arial', sans-serif;
}

/* 标题栏样式 */
.comment-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  background-color: #4CAF50;
  color: white;
  border-radius: 8px;
  padding: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
}

.close-button:hover {
  color: #f1f1f1;
  transition: color 0.2s ease;
}

/* 评论内容区域 */
.comment-bar-content {
  margin-top: 10px;
}

/* 单个评论卡片 */
.comment {
  display: flex;
  align-items: flex-start;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.comment-bar-content ul {
  list-style-type: none; /* 去掉默认的点 */
  padding-left: 0; /* 去掉左边的内边距 */
  margin: 0; /* 去掉默认的外边距 */
}

.comment:hover {
  transform: scale(1.03);
}

/* 头像样式 */
.comment-avatar {
  border-radius: 80%;
  margin-right: 14px;
}

/* 评论细节部分 */
.comment-details {
  display: flex;
  flex-direction: column;
  margin-left: 12px; /* 增加间距，使名字和内容分开 */
  width: 100%;
}

/* 评论作者名字 */
.comment-author {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  font-size: 14px;
}

/* 评论内容文本 */
.comment-body {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

/* 评论区域没有评论时的提示 */
.no-comments {
  text-align: center;
  color: #999;
  font-style: italic;
}

/* 小屏设备适配 */
@media (max-width: 768px) {
  .comment-bar {
    width: 280px;
    max-height: 400px;
    padding: 12px;
  }

  .comment-bar-header {
    font-size: 16px;
  }

  .close-button {
    font-size: 18px;
  }

  .comment {
    padding: 10px;
  }
}
</style>