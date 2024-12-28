<template>
  <div class="user-coupon">
    <!-- 选择过滤条件：显示当前选中的过滤条件 -->
    <div class="filter-dropdown">
      <el-dropdown @command="filterCoupons" size="large">
        <span class="el-dropdown-link">
          {{ selectedFilter }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="all">全部</el-dropdown-item>
            <el-dropdown-item command="unused">未使用</el-dropdown-item>
            <el-dropdown-item command="expired">已过期</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="乘车券" name="ride-coupon">
        <!-- 乘车券展示 -->
        <div v-if="activeTab === 'ride-coupon'" class="coupon-container">
          <div class="coupon-card" v-for="coupon in filteredRideCoupons" :key="coupon.ride_coupon_id">
            <div class="coupon-header">
              <span class="coupon-id">乘车券ID: {{ coupon.ride_coupon_id }}</span>
              <span :class="['status', getStatusClass(coupon.use_status)]">{{ coupon.use_status }}</span>
            </div>
            <div class="coupon-body">
              <p>有效期: {{ coupon.expiry_date }}</p>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="优惠券" name="discount-coupon">
        <!-- 优惠券展示 -->
        <div v-if="activeTab === 'discount-coupon'" class="coupon-container">
          <div class="coupon-card" v-for="coupon in filteredDiscountCoupons" :key="coupon.coupon_id">
            <div class="coupon-header">
              <span class="coupon-id">优惠券ID: {{ coupon.coupon_id }}</span>
              <span :class="['status', getStatusClass(coupon.use_status)]">{{ coupon.use_status }}</span>
            </div>
            <div class="coupon-body">
              <p>折扣金额: ¥{{ coupon.discount_amount }}</p>
              <p>有效期: {{ coupon.expiry_date }}</p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
} from "vue";
import {
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElTabs,
  ElTabPane
} from "element-plus";
import {
  ArrowDown
} from '@element-plus/icons-vue';
import axios from "axios";
import { getUserIDFromToken } from "@/auth.js";

const rideCoupons = ref([]);
const discountCoupons = ref([]);

const filters = ref({
  unused: false,
  expired: false,
});

const selectedFilter = ref("全部");
const activeTab = ref("ride-coupon");

const filteredRideCoupons = computed(() => {
  let filtered = rideCoupons.value;
  if (filters.value.unused) {
    filtered = filtered.filter(coupon => coupon.use_status === "未使用");
  }
  if (filters.value.expired) {
    filtered = filtered.filter(coupon => isExpired(coupon.expiry_date));
  }
  return filtered.sort((a, b) => {
    if (a.use_status === "未使用" && b.use_status !== "未使用") return -1;
    if (a.use_status !== "未使用" && b.use_status === "未使用") return 1;
    return new Date(a.expiry_date) - new Date(b.expiry_date);
  });
});

const filteredDiscountCoupons = computed(() => {
  let filtered = discountCoupons.value;
  if (filters.value.unused) {
    filtered = filtered.filter(coupon => coupon.use_status === "未使用");
  }
  if (filters.value.expired) {
    filtered = filtered.filter(coupon => isExpired(coupon.expiry_date));
  }
  return filtered.sort((a, b) => {
    if (a.use_status === "未使用" && b.use_status !== "未使用") return -1;
    if (a.use_status !== "未使用" && b.use_status === "未使用") return 1;
    return new Date(a.expiry_date) - new Date(b.expiry_date);
  });
});

function isExpired(expiryDate) {
  return new Date(expiryDate) < new Date();
}

function getStatusClass(status) {
  if (status === "未使用") {
    return "unused";
  } else if (status === "已使用") {
    return "used";
  } else if (status === "已过期") {
    return "expired";
  }
  return "";
}

function handleTabClick(tab) {
  console.log("切换标签页:", tab.label);
}

function filterCoupons(command) {
  if (command === "all") {
    filters.value.unused = false;
    filters.value.expired = false;
    selectedFilter.value = "全部";
  } else if (command === "unused") {
    filters.value.unused = true;
    filters.value.expired = false;
    selectedFilter.value = "未使用";
  } else if (command === "expired") {
    filters.value.unused = false;
    filters.value.expired = true;
    selectedFilter.value = "已过期";
  }
}

onMounted(async () => {
  const prefixURL = localStorage.getItem("prefixURL") || 'http://localhost:8888';
  const token = localStorage.getItem("jwtToken");
  const userID = getUserIDFromToken(token);

  const params = new URLSearchParams();
  params.append("userID", userID);

  try {
    const response = await axios.post(`${prefixURL}/api/getUserCoupons`, params);
    if (response.data) {
      rideCoupons.value = response.data.rideCoupons || [];
      discountCoupons.value = response.data.discountCoupons || [];
      console.log("Coupon data fetched successfully", response.data);
    } else {
      console.error("No coupon data returned");
    }
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
  }
});
</script>

<style scoped>
.user-coupon {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in-out;
}

.filter-dropdown {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.coupon-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: space-between;
}

/* 不改变大小，只改美观性 */
.coupon-card {
  position: relative; /* 为伪元素定位做准备 */
  background: linear-gradient(135deg, #f0f7ff, #d4e6f1);
  border-radius: 15px;
  width: calc(33.333% + 80px);
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
  overflow: hidden;
  box-sizing: border-box; /* 确保装饰不改变外部尺寸 */
  animation: fadeIn 0.6s ease-in-out; 
}

/* 给卡片添加一些更精致的装饰：票券侧面圆形切口 */
.coupon-card::before,
.coupon-card::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: #f5f5f5;
  border-radius: 50%;
  transform: translateY(-50%);
}

.coupon-card::before {
  left: -10px;
}

.coupon-card::after {
  right: -10px;
}

/* 给卡片添加轻微的内层装饰背景 */
.coupon-card::after {
  box-shadow: inset 0 0 30px rgba(255,255,255,0.2);
}

.coupon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 增加一条半透明分割线作为装饰，不改变布局 */
  border-bottom: 1px dashed rgba(255,255,255,0.4);
  padding-bottom: 8px; /* 保持原有间距不变 */
  position: relative;
}

/* 在ID前增加一个小装饰图案，不改变布局，仅作视觉点缀 */
.coupon-id::before {
  content: "🎫";
}

.coupon-id {
  font-size: 35px;
  font-weight: bold;
  color: #333;
}

.status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 19px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0,0,0,0.1);
}

.unused {
  background-color: #6dbd42;
}

.used {
  background-color: #ed5565;
}

.expired {
  background-color: #858585;
}

.coupon-body p {
  font-size: 20px;
  color: #666;
  /* 在文字前增加小图标，提升识别性 */
}

.coupon-body p:first-child::before {
  content: "⏰ ";
}

.coupon-body p:nth-child(2)::before {
  content: "💰 ";
}

/* 保留您指定的字体大小相关修改 */
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

::v-deep .el-icon--right {
  margin-left: 8px;
  width: 30px;
}

.el-dropdown-item {
  padding: 10px;
  font-size: 16px;
}

::v-deep .el-tabs__item {
  font-size: 25px;
}

::v-deep .el-dropdown-link {
  font-size: 25px !important;
}

::v-deep .el-dropdown-menu__item {
  font-size: 20px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
