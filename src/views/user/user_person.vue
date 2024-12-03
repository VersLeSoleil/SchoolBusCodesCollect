<template>
    <div class="container">
        <!-- 顶部导航栏 -->
        <header class="header">
            <div class="nav-menu">
                <ElButton @click="navigateTo('购票页面')" type="primary" size="large" class="nav-menu-btn" round>购票页面
                </ElButton>
                <ElButton @click="navigateTo('乘车页面')" type="primary" size="large" class="nav-menu-btn2" round>乘车页面
                </ElButton>
            </div>
            <div class="user-info">
                <ElAvatar :src="userInfo.avatar" size="medium" />
                <span class="user-name">{{ userInfo.name }}</span>
                <ElButton @click="handleLogout" type="danger" size="large" round>登出</ElButton>
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
        validateToken
    } from "@/auth.js";
    import {
        ElMenu,
        ElMenuItem,
        ElAvatar,
        ElButton,
        ElMessage,
        ElMessageBox,
    } from "element-plus";
    import "element-plus/dist/index.css";
    import UserProfile from "@/views/user/components/UserProfile.vue"; // 引入 UserProfile 组件
    import UserNotice from "@/views/user/components/UserNotice.vue"; // 引入 UserProfile 组件
    import UserCoupon from "@/views/user/components/UserCoupon.vue"; // 引入 UserCoupon 组件
    import UserOrder from "@/views/user/components/UserOrder.vue"; // 引入 UserOrder 组件
    import UserComment from "@/views/user/components/UserComment.vue"; // 引入 UserComment 组件
    import {
        useApiBaseStore
    } from "@/stores/network"; // 导入令牌验证函数
    import logo from "@/assets/logo.png";

    const router = useRouter();
    const userInfo = ref({
        name: "Richard喵~~~~",
        avatar: logo,
    });
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
        const validation = await validateToken();
        if (!validation.valid) {
            ElMessage.error(validation.message);
            router.push("/login");
        }
    });

    // 切换功能菜单（不跳转，只更新右侧内容）
    function handleMenuClick(item) {
        selectedMenu.value = item;
    }

    // 页面跳转
    function navigateTo(page) {
        if (page === "购票页面") {
            router.push("/404"); // 跳转到购票页面
        } else if (page === "乘车页面") {
            router.push("user-main"); // 跳转到乘车页面
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
            const apiBaseStore = useApiBaseStore();
            await axios.post(apiBaseStore.baseUrl + '/api/logout', {}, {
                headers: {
                    Authorization: localStorage.getItem('jwtToken'),
                },
            });
            ElMessage.success("您已成功登出~");
            localStorage.removeItem('jwtToken'); // 移除令牌
            localStorage.setItem('prefixURL', 'http://121.199.79.24:5793');
            router.push('/login'); // 跳转到登录页面
        } catch (error) {
            if (error !== "cancel") {
                console.error("登出失败:", error);
                ElMessage.error("登出失败，请稍后再试");
            }
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    /* 顶部导航栏 */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
    }

    .nav-menu {
        display: flex;
        gap: 20px;
    }

    .nav-menu-btn {
        margin-right: 20px;
        padding: 25px 20px;
        font-size: 17px;
    }

    .nav-menu-btn2 {
        margin-right: 20px;
        padding: 25px 20px;
        font-size: 17px;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .user-name {
        font-weight: bold;
        margin-right: 10px;
    }

    /* 主内容区域 */
    .main-content {
        display: flex;
        flex: 1;
    }

    /* 左侧菜单 */
    .sidebar {
        width: 250px;
        background-color: #f8f9fa;
        border-right: 1px solid #ddd;
        padding: 20px 0;

        align-items: center;
        /* 居中菜单 */
    }

    /* 菜单项样式 */
    .el-menu-vertical-demo {
        width: 100%;
    }

    /* 菜单项 */
    .el-menu-item {
        font-size: 25px;
        text-align: center;
    }

    .el-menu-item.is-active {
        font-weight: bold;
        color: #409eff;
    }

    /* 右侧内容 */
    .content {
        flex: 1;
        padding: 20px;
    }

    ::v-deep .el-message-box__message {
        font-size: 20px !important;
    }
</style>