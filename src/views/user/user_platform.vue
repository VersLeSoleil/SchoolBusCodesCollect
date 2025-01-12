<template>
  <ElContainer class = "homecontainer">
    <!-- 顶部导航栏 -->
    <ElHeader>
          <div class="nav-title">交流平台</div>
            <div class="nav-menu">
                <ElButton @click="make_comment" type="primary" size="large" class="nav-menu-btn" round>评论
                </ElButton>
                <ElButton @click="tomain" type="primary" size="large" class="nav-menu-btn" round>返回乘车页面
                </ElButton>
          </div>
    </ElHeader>
    <ElContainer>
      <ElAside width="250px">
        <div class="announcement-header-container">
          <h2 class="announcement-title">公告栏</h2>
        </div>
        <div v-for="notice in notices" :key="notice.notice_id" class="comment-card">
          <div class = "comment_font">{{ notice.content }}</div>
          <!-- <ElCard style="width: 230px" shadow="hover">{{ announcement.content }}</ElCard> -->
        </div>
      </ElAside>
        <ElMain>
          <div v-for="comment in paginatedComments" :key="comment.comment_id" class="announcement-card">
            <ElCard shadow="hover">
              
              <div class="comment-header">
                <el-avatar :size="48" :src="comment.avatar"></el-avatar>
                <div class="comment-name">{{ comment.studentname }}</div>
              </div>
              <div class="comment-time">评论时间：{{ comment.commenttime }}</div>
              <div class="comment-content">{{ comment.commentcontent }}</div>
            </ElCard>
            <!-- <ElCard shadow="hover">{{ comment.studentname }}</ElCard>
            <ElCard shadow="hover">{{ comment.commenttime }}</ElCard>
            <ElCard shadow="hover">{{ comment.commentcontent }}</ElCard> -->
          </div>
        </ElMain>
    </ElContainer>

    <div class="example-pagination-block">
      <!-- <div class="example-demonstration">When you have few pages</div> -->
      <ElPagination background
        layout="prev, pager, next" 
        :total="comments.length"
        :page-size="pageSize" 
        :current-page="currentpage.value"
        @current-change="changecurrent" />
    </div>
  <!-- <div class="example-pagination-block">
    <div class="example-demonstration">When you have more than 7 pages</div>
    <el-pagination layout="prev, pager, next" :total="1000" />
  </div> -->
  </ElContainer>
  <user_comment @close_WriteComment="close_WriteComment" :visible="CreateCommentVisible" />
</template>

<script setup>
import router from '@/router';
import user_comment from './components/user_comment.vue'
import { ElButton ,ElContainer, ElHeader, ElMain, ElAside, ElPagination,ElCard, ElAvatar } from "element-plus";
import { computed,ref } from 'vue';
const comments = ref([]);
let currentpage = ref(1); // 当前页码
const pageSize = 4; //每页显示的评论数
let CreateCommentVisible = ref(false);
// 示例公告数据
const notices = ref([]);
// const announcements = [
//   {
//     id: 1,
//     content: '请发表友善的评论，营造良好的交流氛围。'
//   },
//   {
//     id: 2,
//     content: '保护个人隐私，不要分享敏感信息。'
//   },
//   {
//     id: 3,
//     content: '感谢您的支持与理解，让我们共同维护社区秩序。'
//   }
// ];
function close_WriteComment(){
  CreateCommentVisible.value = false;
}
async function getComments(){
  //获取评论内容
  try{
      //const apiBaseStore = useApiBaseStore();
      const prefixURL = localStorage.getItem("prefixURL") || 'https://localhost:8888';

      let endpoint = prefixURL + "/getcomments";
      const response = await fetch(endpoint,{
        method: 'GET',
        headers:{'Content-Type':'application/json',},
      });
      const result = await response.json();
      comments.value = result;
    }catch(error){
      console.error('There was an error fetching the data!', error)
    }
}
getComments();
async function getNotices(){
  //获取公告内容
  try{
    const prefixURL = localStorage.getItem("prefixURL") || 'https://localhost:8888';

      let endpoint = prefixURL + "/getnotices";
      const response = await fetch(endpoint,{
        method: 'GET',
        headers:{'Content-Type':'application/json',},
      });
      const result = await response.json();
      notices.value = result;
    }catch(error){
      console.error('There was an error fetching the data!', error)
    }
}
getNotices();
let paginatedComments = computed(()=>{
  const start = (currentpage.value-1)*pageSize;
  const end =start+pageSize;// Math.min(start+pageSize, comments.value.length-1);
  return comments.value.slice(start,end);
})
function tomain(){
    router.push('/user-main');
}
function make_comment(){
  CreateCommentVisible.value = true;
}
function changecurrent(page){
  currentpage.value = page;
}
</script>

<style scoped>
.nav-title {
    font-size: 40px; /* 设置字体大小 */
    font-weight: bold; /* 设置字体加粗 */
    color: #f3fafd;
}
.nav-menu {
        display: flex;
        gap: 20px;
        justify-content: flex-end; /* 将按钮推到右侧 */
}

.el-aside{
    background-color: #f5f8f8;
  }
.nav-menu-btn {
        margin-right: 20px;
        padding: 25px 20px;
        font-size: 17px;
    }
.comment-card {
  border: 1px solid #4760b9;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
}
.comment-header {
  display: flex;
  align-items: center; /* 垂直居中 */
  font-weight: bold;
  margin-bottom: 8px;
  
}
.comment-time {
  color: #999;
  font-size: 12px;
}
.comment-content {
  margin-top: 8px;
}
.user-info {
        display: flex;
        align-items: center;
        gap: 10px;
}
.header {
        /* display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd; */
        display: flex;
        padding: 20px 20px;
        align-items: center;
        justify-content: space-between;
}
.homecontainer{
  height: 100%;
}
.el-header{
     background-color: rgb(88, 207, 231);
     display: flex;
     justify-content: space-between;
     padding-left: 0px;
     align-items:center;
    color:#fff;
    font-size: 20px;
    height: 100px;
    >div{
      display:flex;
      align-items:center;
       >span{
        margin-left: 20px;
       }
    }
  }
  .el-main{
    background-color: #f5f8f8;
  }
  .example-pagination-block + .example-pagination-block {
  margin-top: 10px;
}
.announcement-header-container {
  text-align: center;
  margin-bottom: 10px;
}

.announcement-title {
  font-size: 30px;
  font-weight: bold;
  color: #171717;
}

.announcement-card {
  border: 1px solid #f5f8f8;
  padding: 2px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: #f5f8f8;
}
.comment_font{
  font-size: 20px;
}
.comment-name{
  margin-left: 12px;
}

</style>