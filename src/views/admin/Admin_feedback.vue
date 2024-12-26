<template>
  <div class="feedback-container">


    <!-- 搜索 & 排序容器 -->
    <div class="search-sort-container">
      <input
          v-model="searchTerm"
          class="search-input"
          placeholder="搜索反馈ID、用户ID、学号、联系方式、司机ID、车辆号等..."
      />
      <div class="sort-buttons">
        <button @click="sortBy('order_time')">按时间排序</button>
        <button @click="sortBy('rating')">按评星排序</button>
        <button @click="sortBy('total_spending')">按金额排序</button>
        <button @click="sortByPriority">按优先级排序</button> <!-- 新增 -->
      </div>
    </div>

    <table class="feedback-table">
      <thead>
      <tr>
        <th>反馈ID</th>
        <!-- 新增：用户ID -->
        <th>用户ID</th>
        <th>学生学号</th>
        <th>联系方式</th>
        <th>消费总金额</th>
        <th>司机ID</th>
        <th>车辆号</th>
        <th>订单创建时间</th>
        <th>反馈内容</th>
        <!-- 评价星级 -->
        <th>星级评价</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="feedback in sortedAndFilteredList"
          :key="feedback.feedback_id"
          :class="{ 'priority-row': feedback.priority }"
      >
        <td>{{ feedback.feedback_id }}</td>
        <!-- 渲染用户ID -->
        <td>{{ feedback.user_id }}</td>
        <td>{{ feedback.student_number }}</td>
        <td>{{ feedback.contact }}</td>
        <td :class="getAmountClass(feedback.total_spending)">
          ¥{{ feedback.total_spending }}
        </td>
        <td>{{ feedback.driver_id }}</td>
        <td>{{ feedback.vehicle_number }}</td>
        <td>{{ feedback.order_time }}</td>
        <td>{{ filterFeedbackContent(feedback.feedback_content) }}</td>
        <!-- 星级 -->
        <td class="rating-cell">
          <i
              v-for="starIndex in 5"
              :key="starIndex"
              :class="starIndex <= feedback.rating ? 'fas fa-star' : 'far fa-star'"
              :style="{
              color: starIndex <= feedback.rating ? '#fff' : '#d3d3d3',
              background: starIndex <= feedback.rating ? getStarColor(feedback.rating) : 'none',
              WebkitBackgroundClip: 'text', /* 渐变背景文字裁剪 */
              WebkitTextFillColor: 'transparent'
            }"
          ></i>
        </td>


        <td>
          <!-- 发放优惠券按钮 -->
          <button
              @click="handleCoupon(feedback)"
              class="action-button"
              :disabled="canIssueCoupon(feedback.feedback_content)"
          >
            发放优惠券
          </button>

          <!-- 处理投诉按钮 -->
          <button
              @click="openProcessModal(feedback)"
              class="action-button"
              :disabled="canHandleComplaint(feedback.feedback_content)"
          >
            处理
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 处理投诉的模态框（保持原有内容） -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>处理投诉 - 反馈ID: {{ selectedFeedback.feedback_id }}</h2>
        <p>司机ID: {{ selectedFeedback.driver_id }}</p>
        <p>车辆号: {{ selectedFeedback.vehicle_number }}</p>
        <!-- TODO: 添加更多处理选项 -->
        <button @click="closeProcessModal" class="close-button">关闭</button>
        <button @click="dealWithComplaint" class="deal-button">处理</button>
      </div>
    </div>
  </div>
</template>

<script>
import {computed, onMounted, ref} from 'vue';

export default {
  name: 'FeedbackHandler',
  setup() {
    const feedbackList = ref([]);
    const isModalOpen = ref(false);
    const selectedFeedback = ref({});

    // 搜索关键字
    const searchTerm = ref('');

    // 排序相关
    const sortKey = ref('');
    const sortAscending = ref(true);

    // 判断是否可以发放优惠券
    const canIssueCoupon = (feedbackContent) => {
      const couponKeywords = ['<couponIssued>']; // 可以发放优惠券的关键词
      return couponKeywords.some((keyword) => feedbackContent.includes(keyword));
    };

    // 判断是否可以处理投诉
    const canHandleComplaint = (feedbackContent) => {
      const complaintKeywords = ['<complaintHandled>']; // 可以处理投诉的关键词
      return complaintKeywords.some((keyword) => feedbackContent.includes(keyword));
    };

    const filterFeedbackContent = (content) => {
      const keywordsToHide = ['<couponIssued>', '<complaintHandled>']; // 要隐藏的关键词
      let filteredContent = content;

      keywordsToHide.forEach((keyword) => {
        const regex = new RegExp(keyword, 'g'); // 全局匹配关键词
        filteredContent = filteredContent.replace(regex, ''); // 替换为空字符串
      });

      return filteredContent.trim(); // 去除首尾多余空格
    };




    // 模拟后端数据
    const fetchFeedbackData = async () => {
      try {
        const prefixURL = localStorage.getItem("prefixURL"); // 获取后端地址
        const token = localStorage.getItem("jwtToken"); // 获取 JWT token

        const response = await fetch(`${prefixURL}/admin/feedback/get`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        feedbackList.value = await response.json();

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // 金额样式
    const getAmountClass = (amount) => {
      if (amount < 100) return 'amount-low';
      if (amount >= 100 && amount < 200) return 'amount-medium';
      return 'amount-high';
    };

    // 星级颜色
    const getStarColor = (rating) => {
      switch (rating) {
        case 1:
          return 'linear-gradient(90deg, #FF6F61, #FFD700)'; // 赤红-暗金黄渐变
        case 2:
          return 'linear-gradient(90deg, #FF8C69, #FFD700)'; // 浅红-金黄渐变
        case 3:
          return '#FFD700'; // 纯金黄
        case 4:
          return '#FFC107'; // 明亮金黄
        case 5:
          return '#FFEB3B'; // 高亮金黄
        default:
          return '#d3d3d3'; // 未激活星星
      }
    };



    // 发放优惠券
    const handleCoupon = async (feedback) => {
      try {
        const prefixURL = localStorage.getItem("prefixURL"); // 获取后端地址
        const token = localStorage.getItem("jwtToken"); // 获取 JWT token

        const response = await fetch(`${prefixURL}/admin/feedback/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "coupon",
            feedback_id: feedback.feedback_id,
            other: {}
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);

        }

        // 我知道你很急但你先别急
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await wait(250);

        await fetchFeedbackData();


      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // 打开处理模态框
    const openProcessModal = (feedback) => {
      selectedFeedback.value = feedback;
      isModalOpen.value = true;
    };

    // 关闭处理模态框
    const closeProcessModal = () => {
      isModalOpen.value = false;
      selectedFeedback.value = {};
    };

    // 处理投诉
    const dealWithComplaint = async () => {
      try {
        const prefixURL = localStorage.getItem("prefixURL"); // 获取后端地址
        const token = localStorage.getItem("jwtToken"); // 获取 JWT token

        const response = await fetch(`${prefixURL}/admin/feedback/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "complaint",
            feedback_id: selectedFeedback.value.feedback_id,
            other: {}
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        closeProcessModal();

        // 我知道你很急但你先别急
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await wait(250);

        await fetchFeedbackData();

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // 前端搜索过滤
    const filteredList = computed(() => {
      if (!searchTerm.value.trim()) {
        return feedbackList.value;
      }
      return feedbackList.value.filter((item) => {
        return Object.values(item).some((val) =>
            String(val).includes(searchTerm.value)
        );
      });
    });


    const sortByPriority = () => {
      sortedAndFilteredList.value.sort((a, b) => {
        if (a.priority === b.priority) return 0;
        return a.priority ? -1 : 1; // 优先显示 priority 为 true 的
      });
    };

    // 设置排序字段
    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortAscending.value = !sortAscending.value;
      } else {
        sortKey.value = key;
        sortAscending.value = true;
      }
    };

    // 先搜索后排序
    const sortedAndFilteredList = computed(() => {
      const list = [...filteredList.value];
      if (sortKey.value) {
        list.sort((a, b) => {
          const valA = a[sortKey.value];
          const valB = b[sortKey.value];
          if (valA < valB) return sortAscending.value ? -1 : 1;
          if (valA > valB) return sortAscending.value ? 1 : -1;
          return 0;
        });
      }
      // 默认按优先级排序
      return list.sort((a, b) => (a.priority === b.priority ? 0 : a.priority ? -1 : 1));
    });




    onMounted(() => {
      fetchFeedbackData();
    });

    return {
      feedbackList,
      isModalOpen,
      selectedFeedback,

      // 函数
      getAmountClass,
      getStarColor,
      handleCoupon,
      openProcessModal,
      closeProcessModal,
      dealWithComplaint,

      // 搜索 & 排序
      searchTerm,
      sortKey,
      sortAscending,
      sortBy,
      filteredList,
      sortedAndFilteredList,
      canIssueCoupon,
      canHandleComplaint,
      sortByPriority,
      filterFeedbackContent
    };
  },
};



</script>

<style scoped>
.feedback-container {
  padding: 30px;
  margin-left: 220px;
  margin-top: -10px;   /* 可根据实际布局进行调整 */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

/* 搜索和排序的区域布局 */
.search-sort-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  align-items: center;
  justify-content: space-between;
}

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  padding: 8px;
  margin-right: 10px;
}

.sort-buttons button {
  margin: 5px;
  padding: 8px 12px;
  background-color: #2e86c1;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.sort-buttons button:hover {
  background-color: #21618c;
}

/* 表格样式 */
.feedback-table {
  width: 100%;
  font-size: 10pt;
  border-collapse: collapse;
  animation: fadeIn 1s ease-in-out;
}

.feedback-table th,
.feedback-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.feedback-table th {
  background-color: #f2f2f2;
  color: #333;
}

.action-button {
  margin: 5px;
  padding: 8px 12px;
  background-color: #4caf50;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #45a049;
}

/* 金额不同的高亮区分 */
.amount-low {
  color: #2e86c1;
  font-weight: bold;
}

.amount-medium {
  color: #f1c40f;
  font-weight: bold;
}

.amount-high {
  color: #e74c3c;
  font-weight: bold;
}

/* 星级评分列 */
.rating-cell i {
  font-size: 24px; /* 星星大小 */
  margin-right: 4px; /* 星星之间的间距 */
  transition: all 0.3s ease; /* 平滑渐变效果 */
}






/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.5s;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  position: relative;
  animation: slideIn 0.5s;
}

.close-button {
  margin-right: 10px;
  margin-top: 20px;
  padding: 8px 12px;
  background-color: #e74c3c;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.close-button:hover {
  background-color: #c0392b;
}

.deal-button {
  margin-top: 20px;
  padding: 8px 12px;
  background-color: #48a841;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.deal-button:hover {
  background-color: #3e8838;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-table th,
  .feedback-table td {
    padding: 8px;
  }

  .modal-content {
    width: 90%;
  }
}

.priority-row {
  background-color: #ffe6e6; /* 浅红色背景 */
  animation: fadeIn 0.5s ease-in-out;
}


.priority-row {
  transition: background-color 0.3s ease;
}

.action-button:disabled {
  background-color: #ccc; /* 灰色背景 */
  cursor: not-allowed; /* 禁用状态鼠标样式 */
}


</style>
