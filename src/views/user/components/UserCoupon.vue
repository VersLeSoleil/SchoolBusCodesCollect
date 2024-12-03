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
    computed
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

  // 硬编码的乘车券数据
  const rideCoupons = ref([{
      ride_coupon_id: 1000001,
      expiry_date: "2024-12-31 23:59",
      use_status: "未使用",
    },
    {
      ride_coupon_id: 1000002,
      expiry_date: "2024-11-25 12:00",
      use_status: "已过期",
    },
    {
      ride_coupon_id: 1000003,
      expiry_date: "2025-01-01 10:00",
      use_status: "未使用",
    },
  ]);

  // 硬编码的优惠券数据
  const discountCoupons = ref([{
      coupon_id: 1000001,
      discount_amount: 50.00,
      expiry_date: "2024-12-31 23:59",
      use_status: "未使用",
    },
    {
      coupon_id: 1000002,
      discount_amount: 20.00,
      expiry_date: "2024-11-25 12:00",
      use_status: "已过期",
    },
    {
      coupon_id: 1000003,
      discount_amount: 10.00,
      expiry_date: "2025-01-01 10:00",
      use_status: "未使用",
    },
  ]);

  // 过滤条件
  const filters = ref({
    unused: false,
    expired: false,
  });

  // 当前选中的过滤条件文本
  const selectedFilter = ref("全部"); // 这里默认全部

  // 当前选中的标签页
  const activeTab = ref("ride-coupon");

  // 根据选择的过滤条件，计算过滤后的乘车券列表
  const filteredRideCoupons = computed(() => {
    let filtered = rideCoupons.value;

    if (filters.value.unused) {
      filtered = filtered.filter(coupon => coupon.use_status === "未使用");
    }

    if (filters.value.expired) {
      filtered = filtered.filter(coupon => isExpired(coupon.expiry_date));
    }

    // 先按使用状态排序，未使用的排在前面，再按过期时间排序
    return filtered.sort((a, b) => {
      if (a.use_status === "未使用" && b.use_status !== "未使用") {
        return -1;
      }
      if (a.use_status !== "未使用" && b.use_status === "未使用") {
        return 1;
      }
      return new Date(a.expiry_date) - new Date(b.expiry_date);
    });
  });

  // 根据选择的过滤条件，计算过滤后的优惠券列表
  const filteredDiscountCoupons = computed(() => {
    let filtered = discountCoupons.value;

    if (filters.value.unused) {
      filtered = filtered.filter(coupon => coupon.use_status === "未使用");
    }

    if (filters.value.expired) {
      filtered = filtered.filter(coupon => isExpired(coupon.expiry_date));
    }

    return filtered.sort((a, b) => {
      if (a.use_status === "未使用" && b.use_status !== "未使用") {
        return -1;
      }
      if (a.use_status !== "未使用" && b.use_status === "未使用") {
        return 1;
      }
      return new Date(a.expiry_date) - new Date(b.expiry_date);
    });
  });

  // 检查是否过期
  function isExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
  }

  // 为每个券动态生成状态类
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

  // 标签页点击事件
  function handleTabClick(tab) {
    console.log("切换标签页:", tab.label);
  }

  // 过滤函数
  function filterCoupons(command) {
    if (command === "all") {
      filters.value.unused = false;
      filters.value.expired = false;
      selectedFilter.value = "全部"; // 更新显示文本为 "全部"
    } else if (command === "unused") {
      filters.value.unused = true;
      filters.value.expired = false;
      selectedFilter.value = "未使用"; // 更新显示文本为 "未使用"
    } else if (command === "expired") {
      filters.value.unused = false;
      filters.value.expired = true;
      selectedFilter.value = "已过期"; // 更新显示文本为 "已过期"
    }
  }
</script>

<style scoped>
  .user-coupon {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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

  .coupon-card {
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
  }

  .coupon-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }

  .coupon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    font-size: 14px;
    color: #666;
  }

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
</style>