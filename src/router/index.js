import { createRouter, createWebHistory } from 'vue-router'; // Vue Router 4 的导入方式
import LoginPage from '../views/login.vue'; // 确保路径正确
import HomePage from '../views/HomePage.vue';
import Driver_Page_0 from '@/views/driver_0/driver_Page_0.vue';
import Driver_Page_1 from '@/views/driver_1/driver_Page_1.vue';
import Driver_Info from '@/views/driver_0/driver_Info.vue';
import test_user_map from '@/views/components/Map-user.vue';
import User_main from '@/views/user/user_main.vue';
import User_person from '@/views/user/user_person.vue';
import Admin_home from '@/views/admin/admin_home.vue';
import { validateToken } from '@/auth.js'; // 导入验证函数

const routes = [
    {
        path: '/',
        redirect: '/login', // 访问根路径时重定向到 /login
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
    },
    {
        path: '/home',
        name: 'Home',
        component: HomePage,
    },
    {
        path: '/driver-0',
        name: 'Driver-0',
        component: Driver_Page_0,
    },
    {
        path: '/driverInfo',
        name: 'DriberInfo',
        component: Driver_Info,
    },
    {
        path: '/driver-1',
        name: 'Driver-1',
        component: Driver_Page_1,
    },
    {
        path: '/test-user',
        name: 'test-user',
        component: test_user_map,
    },
    {
        path: '/user-main',
        name: 'user-main',
        component: User_main,
    },
    {
        path: '/user-person',
        name: 'user-person',
        component: User_person,
    },
    {
        path: '/admin_home',
        name: 'admin_home',
        component: Admin_home,
    }
];


const router = createRouter({
    history: createWebHistory(), // 使用 history 模式
    routes,
});


// 添加导航守卫，确保用户只有在登录后才能访问主页
router.beforeEach(async (to, from, next) => {
    if (to.name === 'Login') {
        // 如果用户试图访问登录页面
        const validation = await validateToken(); // 验证令牌
        if (validation.valid) {
            // 如果令牌合法，重定向到主页
            next({ name: 'Home' });
        } else {
            // 如果令牌无效，允许用户停留在登录页
            localStorage.removeItem("jwtToken"); // 清除无效令牌
            next();
        }
    } else if (to.name !== 'Login') {
        // 如果用户试图访问其他页面
        const validation = await validateToken(); // 验证令牌
        if (validation.valid) {
            // 如果令牌合法，继续导航
            next();
        } else {
            // 如果令牌无效，重定向到登录页面
            alert(validation.message || "登录已过期，请重新登录。");
            localStorage.removeItem("jwtToken"); // 清除无效令牌
            next({ name: 'Login' });
        }
    } else {
        next(); // 继续导航
    }
});

export default router;
