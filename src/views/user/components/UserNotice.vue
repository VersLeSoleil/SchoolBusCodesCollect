<template>
  <div class="user-notice">
    <h2 class="title">乘客须知</h2>
    <p class="intro">
      欢迎乘坐本次列车，以下是一些重要的乘车须知，请务必遵守：
    </p>
    <ul class="notice-list">
      <li>请提前检查您的车票，确保车次、座位号和日期无误。</li>
      <li>在车站候车时，请保持秩序，注意广播通知。</li>
      <li>上车时请携带有效身份证明及车票，工作人员会进行检票。</li>
      <li>列车内请勿大声喧哗，保持安静以便其他乘客休息。</li>
      <li>请注意随身物品，确保贵重物品妥善保管。</li>
      <li>不得在车厢内吸烟，请遵守车内禁烟规定。</li>
      <li>请按照车站指示和工作人员指引上下车。</li>
      <li>若有任何不适，请及时告知车上工作人员。</li>
    </ul>
    <p class="thanks">
      感谢您的配合，祝您旅途愉快！
    </p>
    <!-- 添加发布日期 -->
    <p class="date">发布日期: 2024年11月29日</p>
  </div>
</template>

<script setup>
</script>

<style scoped>
  .user-notice {
    padding: 60px;
    background-color: #f5f5f5;
    border-radius: 10px;
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Arial', sans-serif;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .title {
    text-align: center;
    font-size: 35px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .intro {
    text-align: center;
    font-size: 25px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .notice-list {
    font-size: 20px;
    line-height: 1.8;
    list-style-type: decimal;
    margin-left: 20px;
    color: #444;
  }

  .notice-list li {
    margin-bottom: 15px;
  }

  .thanks {
    text-align: center;
    font-size: 20px;
    color: #333;
    margin-top: 30px;
    font-weight: bold;
  }

  .date {
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 16px;
    color: #888;
  }
</style>