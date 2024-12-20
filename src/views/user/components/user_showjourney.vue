<template>
    <div v-if="props.visible" class="popup">
        <div class="showjourney-container">
            <button class="close-button" @click="handleclose">×</button>
            <h2 class="myjourney">我的行程</h2>
            <el-table :data="tableData" class="showtable" stripe border height="350">
                <el-table-column label="序号" type="index" width="100"></el-table-column>
                <el-table-column prop="originsite" label="起点" width="120"></el-table-column>
                <el-table-column prop="destinationsite" label="终点" width="120"></el-table-column>
                <el-table-column prop="uptime" label="上车时间" width="180" ></el-table-column>
                <el-table-column prop="downtime" label="下车时间" width="180" ></el-table-column>
                <el-table-column prop="status" label="状态" width="100" ></el-table-column>
            </el-table>
        </div>        
    </div>
</template>

<script setup>
import { defineProps,defineEmits,ref,onMounted } from 'vue';
import { ElTable, ElTableColumn } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true, 
  },
  getjourneyrecord: {
    type: Function,
    required: true,
  }
});
// 定义 emits
const emit = defineEmits(['close_showjourney']);
function handleclose(){
    emit('close_showjourney'); //调用user_main的close_showjourney函数
    const kk = props.getjourneyrecord();
    console.log(kk)
}
//const tableData = ref(props.getjourneyrecord());
const tableData = ref([]);
async function fetchtabledata(){
  //getjourneyrecord返回的是一个promise，而不是数据，需要这样处理
  try {
    const data = await props.getjourneyrecord();
    if (data) {
      tableData.value = data;
    }
    console.log(tableData.value);
    onMounted(() => {
      tableData.value.forEach(item => {
        if (!item.time_down) {
          item.time_down = '空';
        }
      });
    });
  } catch (error) {
    console.error('There was an error fetching the data!', error);
  }
}
onMounted(()=> {
  fetchtabledata();
  // 启动定时器，每隔一段时间（例如5秒）重新获取数据
  setInterval(fetchtabledata, 5000);
});

// const tableData = ref([{
//         origin: '榕园广场',
//         destination: '教学楼',
//         time_up : '2024-1-2 08:01',
//         time_down : '---',
//         state: '进行中'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '榕11',
//         destination: '得一超市',
//         time_up : '2024-3-2 08:01',
//         time_down : '2024-2-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       },{
//         origin: '荔园食堂',
//         destination: '教学楼',
//         time_up : '2024-5-2 08:01',
//         time_down : '2024-7-2 08:20',
//         state: '结束'
//       }]);

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
  z-index: 100;
}

/* .showjourney-container {
    display: flex;
    flex-direction: column;
    align-items: center;
} */
.showjourney-container {
  /* 定义一个固定大小或根据内容自动调整 */
  width: 800px; /* 或者使用百分比宽度 */
  height: 500px; /* 或者不设置高度让其根据内容自动调整 */

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
  align-items: stretch; /* 子元素宽度拉伸至父容器宽度 */
  justify-content: flex-start; /* 子元素从顶部开始排列 */

  position: relative;
}
.close-button {
  /* 设置大小 */
  width: 32px;
  height: 32px;

  /* 去除默认样式 */
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none; /* 移除点击时的默认轮廓 */

  /* 添加图标样式 */
  font-size: 30px;
  line-height: 1;
  color: #000; /* 文字颜色 */

  /* 绝对定位，放置在右上角 */
  position: absolute;
  top: 8px; /* 距离顶部的距离 */
  right: 8px; /* 距离右边的距离 */
}

/* 悬停效果 */
.close-button:hover {
  color: #ff0000; /* 改变鼠标悬停时的颜色 */
}

/* 点击效果 */
.close-button:active {
  transform: scale(0.9); /* 缩小按钮以模拟按下效果 */
}
.showtable{
    margin-top: 20px;
}
.myjourney{
  font-size: 2rem;
  font-weight: bold;
  margin-top: 20px 0; /* 上下外边距 */
  padding: 10px 20px; /* 内边距 */
  color: #fff; /* 文字颜色 */
  background-color: #00b3ff; /* 背景颜色 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影 */
  text-align: center; /* 文字居中 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
}
</style>