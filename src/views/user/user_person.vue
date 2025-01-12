<template>
    <div class="container">
        <!-- 顶部导航栏 -->
        <header class="header">
            <div class="nav-menu">
                <ElButton @click="navigateTo('购票页面')" type="primary" size="large" class="nav-menu-btn" round>
                    <i class="el-icon-tickets"></i> 购票页面
                </ElButton>
                <ElButton @click="navigateTo('乘车页面')" type="primary" size="large" class="nav-menu-btn2" round>
                    <i class="el-icon-truck"></i> 乘车页面
                </ElButton>
            </div>
            <div class="user-info">
                <ElAvatar :src="userStore.userInfo.avatar" size="medium" />
                <span class="user-name">{{ userStore.userInfo.name }}</span>
                <ElButton @click="handleLogout" type="danger" size="large" round>
                    登出
                </ElButton>
            </div>
        </header>

        <main class="main-content">
            <!-- 左侧功能菜单 -->
            <aside class="sidebar">
                <ElMenu default-active="个人资料" @select="handleMenuClick" class="el-menu-vertical-demo">
                    <ElMenuItem v-for="item in menuItems" :key="item" :index="item">
                        {{ item }}
                    </ElMenuItem>
                </ElMenu>
            </aside>

            <!-- 右侧功能内容 -->
            <section class="content">
                <!-- 如果当前选中的是“个人资料”，渲染 UserProfile 组件 -->
                <UserProfile v-if="selectedMenu === '个人资料'" />
                <UserOrder v-else-if="selectedMenu === '查看个人订单'" />
                <UserCoupon v-else-if="selectedMenu === '优惠券/乘车券'" />
                <UserComment v-else-if="selectedMenu === '评价和反馈'" />
                <UserNotice v-else-if="selectedMenu === '乘客须知'" />
            </section>
        </main>
    </div>
</template>

<script setup>
    import {
        ref,
        onMounted
    } from "vue";
    import {
        useRouter
    } from "vue-router";
    import axios from "axios";
    import {
        ElMenu,
        ElMenuItem,
        ElAvatar,
        ElButton,
        ElMessage,
        ElMessageBox,
    } from "element-plus";
    import "element-plus/dist/index.css";
    import UserProfile from "@/views/user/components/UserProfile.vue";
    import UserNotice from "@/views/user/components/UserNotice.vue";
    import UserCoupon from "@/views/user/components/UserCoupon.vue";
    import UserOrder from "@/views/user/components/UserOrder.vue";
    import UserComment from "@/views/user/components/UserComment.vue";
    import {
        useUserStore
    } from "@/stores/userStore";
    import {
        validateToken,
        getUserIDFromToken
    } from "@/auth.js";

    const router = useRouter();
    const userStore = useUserStore();
    useUserStore.userInfo = '';

    const selectedMenu = ref("个人资料"); // 当前选中的菜单项
    const menuItems = [
        "个人资料",
        "查看个人订单",
        "优惠券/乘车券",
        "评价和反馈",
        "乘客须知",
    ];

    // 验证令牌逻辑
    onMounted(async () => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            const userID = getUserIDFromToken(token); // 解析 token 获取 userID
            if (userID) {
                await userStore.fetchUserInfo(); // 向后端请求用户信息
            } else {
                ElMessage.error("无效的用户令牌");
                router.push("/login"); // 返回登录页
            }
        } else {
            ElMessage.error("未找到用户令牌");
            router.push("/login"); // 返回登录页
        }
    });

    // 切换功能菜单（不跳转，只更新右侧内容）
    function handleMenuClick(item) {
        selectedMenu.value = item;
    }

    // 页面跳转
    function navigateTo(page) {
        if (page === "购票页面") {
            router.push("/404"); // 跳转到购票页面，示例请自行修改为正确路径
        } else if (page === "乘车页面") {
            router.push("user-main"); // 跳转到乘车页面，示例请自行修改为正确路径
        }
    }

    // 登出逻辑
    async function handleLogout() {
        const validation = await validateToken();
        if (!validation.valid) {
            ElMessage.error(validation.message);
            router.push("/login");
            return;
        }

        // 确认是否登出
        try {
            await ElMessageBox.confirm("确定要登出吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            });

            // 调用后端 API 进行登出操作
            const prefixURL = localStorage.getItem("prefixURL") || "https://localhost:8888";
            await axios.post(`${prefixURL}/api/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
            });
            ElMessage.success("您已成功登出~");
            localStorage.removeItem("jwtToken"); // 移除令牌
            localStorage.setItem('prefixURL', 'https://sysuschoolbus.top:5793');
            router.push("/login"); // 跳转到登录页面
        } catch (error) {
            if (error !== "cancel") {
                console.error("登出失败:", error);
                ElMessage.error("登出失败，请稍后再试");
            }
        }
    }
</script>

<style scoped>
    /* 容器整体 */
    .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        /* 更加柔和的渐变，可根据喜好调整颜色 */
        background: linear-gradient(to bottom, #eef7fe 0%, #ffffff 70%);
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    }

    /* 顶部导航栏 */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.7);
        /* 增加一点阴影，让顶栏更有层次 */
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(8px);
        /* 半透明背景时建议加上模糊效果 */
    }

    .nav-menu {
        display: flex;
        gap: 15px;
    }

    .nav-menu-btn,
    .nav-menu-btn2 {
        padding: 25px 30px;
        font-size: 16px;
        border-radius: 25px;
        transition: all 0.3s;
    }

    .nav-menu-btn:hover,
    .nav-menu-btn2:hover {
        transform: translateY(-2px) scale(1.05);
        background-color: #409eff;
        color: white;
    }

    /* 用户信息 */
    .user-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .user-name {
        font-weight: bold;
        font-size: 18px;
    }

    /* 主内容区域 */
    .main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
        /* 进入时淡入动画 */
        animation: fadeIn 0.6s ease-in-out;
    }

    /* 左侧菜单 */
    .sidebar {
        width: 250px;
        /* 或者 min-width: 250px; */
        flex-shrink: 0;
        /* 阻止侧边栏收缩 */
        background-color: #f8f9fa;
        border-right: 1px solid #ddd;
        padding: 20px 0;
        transition: background-color 0.3s;

    }

    .el-menu-item {
        padding: 10px 20px;
        font-size: 50px;
        text-align: center;
        /* 文字居中 */
        display: flex;
        justify-content: center;
        /* 水平居中 */
        align-items: center;
        /* 垂直居中 */
        transition: background-color 0.3s, color 0.3s;

        /* 通过 transform 偏移文字向左 */
        transform: translateX(-10px);
        /* 偏移 10px，可以调整 */
    }

    /* 悬停时背景稍变深 */
    .sidebar:hover {
        background-color: #eef2f6;
    }

    .el-menu-vertical-demo {
        width: 100%;
        font-size: 16px;
        background: transparent;
        /* 用自身的背景，去掉默认 */
        border-right: none;
        /* 去掉默认边框 */
    }

    .el-menu-item {
        font-size: 25px;
        text-align: center;
        transition: all 0.3s;
        /* 加点内边距让内容更舒适 */
        padding: 10px 0;
    }

    .el-menu-item:hover {
        transform: scale(1.05);
        color: #409eff;
        background-color: #f1faff;
        /* 悬停时给一点浅色背景 */
    }

    ::v-deep .el-menu-item.is-active {
        font-weight: bold;
        color: #409eff;
        background-color: #ecf5ff;
    }

    /* 右侧内容 */
    .content {
        flex: 1;
        padding: 20px;
        animation: fadeIn 0.5s ease-in-out;
        /* 内容区可以增加一点浅色背景或卡片样式 */
        background-color: #ffffff;
        margin: 20px;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
    }

    ::v-deep .el-message-box__message {
        font-size: 20px !important;
    }

    /* 动画效果 */
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