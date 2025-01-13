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
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="no-comments">暂无评论</div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApiBaseStore } from '@/stores/network';

// 声明响应式变量
const isVisible = ref(true); // 是否显示评论栏
const comments = ref([]);    // 评论内容
const info="getComment";

const fetchComments = async () => {
  try {
    const apiBaseStore = useApiBaseStore();
    let endpoint = apiBaseStore.baseUrl + "/getDComments";
    console.log('请求的 URL:', endpoint);
    let method = 'POST';
    let requestBody = { info };

    // 发送请求到后端
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),  // 将请求体转为 JSON 格式
    });

    // 如果响应状态不是200，返回错误信息
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);  // 打印返回的 HTML 或其他内容
      alert('请求失败，状态码：' + response.status + ' 错误信息：' + errorText);
      return;
    }

    // 解析响应
    const result = await response.json();

    // 在解析响应后打印数据
    console.log('Response Data:', result);
    

    // 处理成功与否
    if (result && result.comments) {
      // 评论数据成功返回，填充数据
      comments.value = result.comments || [];  // 确保使用 comments 字段
      alert('取得评论数据成功！');
      console.log('评论数据:', comments.value);
    } else {
      // 错误处理
      alert(result.error || '取得评论数据失败！');
    }
  } catch (error) {
    console.error('获取评论数据失败:', error);
    alert('获取评论数据失败，请稍后再试！');
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
