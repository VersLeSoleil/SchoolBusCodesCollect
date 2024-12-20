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
            <div class="comment-author">{{ comment.author }}</div>
            <div class="comment-body">{{ comment.body }}</div>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="no-comments">暂无评论</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 声明响应式变量
const isVisible = ref(true); // 是否显示评论栏
const comments = ref([]);    // 评论内容

// 模拟从后端获取评论数据
const fetchComments = () => {
  setTimeout(() => {
    comments.value = [
      { author: '张三', body: '这是一条评论内容' },
      { author: '李四', body: '这是另一条评论内容' },
    ];
  }, 1000);
};

// const fetchComments = async () => {
//   try {
//     let endpoint = "http://localhost:8888/getComments"; // 后端接口地址
//     let method = 'POST';
//     let requestBody = {
//       // 假设你传递一些必要的参数，如用户 ID 等
//       user_id: user.id,
//     };

//     // 发送请求到后端
//     const response = await fetch(endpoint, {
//       method: method,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestBody),  // 将请求体转为 JSON 格式
//     });

//     // 调试：打印响应状态码和响应内容
//     console.log('Response Status:', response.status);
//     console.log('Response Headers:', response.headers);
    
//     // 如果响应状态不是200，返回错误信息
//     if (!response.ok) {
//       alert('请求失败，状态码：' + response.status);
//       const errorText = await response.text();
//       console.log('Error Response:', errorText);  // 打印返回的 HTML 或其他内容
//       return;
//     }

//     // 解析响应
//     const result = await response.json();
//     console.log('Response Data:', result);

//     // 处理成功与否
//     if (response.ok) {
//       // 评论数据成功返回，填充数据
//       comments.value = result.comments || [];  // 假设后端返回的数据中有 comments 字段
//       alert('取得评论数据成功！');
//     } else {
//       // 错误处理
//       alert(result.error || '取得评论数据失败！');
//     }
//   } catch (error) {
//     console.error('获取评论数据失败:', error);
//     alert('获取评论数据失败，请稍后再试！');
//   }
// };


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
