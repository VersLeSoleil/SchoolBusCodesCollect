import { createRouter, createWebHistory } from 'vue-router'; // Vue Router 4 的导入方式
import LoginPage from '../views/login.vue'; // 确保路径正确
import HomePage from '../views/HomePage.vue';
import Driver_Page_0 from '@/views/driver_0/driver_Page_0.vue';
import Driver_Page_1 from '@/views/driver_1/driver_Page_1.vue';
import Driver_Info from '@/views/driver_0/driver_Info.vue';
// import test_user_map from '@/views/components/Map-user(backup).vue';
import test_admin_map from '@/views/components/Map-admin.vue';
import User_main from '@/views/user/user_main.vue';
import User_person from '@/views/user/user_person.vue';
import User_platform from '@/views/user/user_platform.vue'
import Error404 from '@/views/404.vue';
import Lay_out from '@/views/admin/Admin_layout.vue';
import Registry from '@/views/deprecated/loginRegistry.vue';
import { validateToken } from '@/auth.js'; // 导入验证函数
import simulation from '@/views/schoolbus-simulation/schoolbus-simulation.vue';

import ScannedPage from '@/views/driver_1/components/ScannedPage.vue'; // 通用错误边界组件

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
        path: '/register',
        name: 'Register',
        component: Registry,
    },
    {
        path: '/driver-0',
        name: 'Driver-0',
        component: Driver_Page_0,
        meta: {
            requiredRoles: [0, 2]  // admin 和 driver 都能访问        0是 Admin  1是 Passenger    2是 Driver    ！！！！！
        },
    },
    {
        path: '/driverInfo',
        name: 'DriberInfo',
        component: Driver_Info,
        meta: {
            requiredRoles: [0, 2]  // admin 和 driver 都能访问
        },
    },
    {
        path: '/driver-1',
        name: 'Driver-1',
        component: Driver_Page_1,
        meta: {
            requiredRoles: [0, 2]  // admin 和 driver 都能访问
        },
    },
    // {
    //     path: '/test-user',
    //     name: 'test-user',
    //     component: test_user_map,
    //     meta: {
    //         requiredRoles: [0, 2]  // admin 和 driver 都能访问
    //     },
    // },
    {
        path: '/test-admin',
        name: 'test-admin',
        component: test_admin_map,
        meta: {
            requiredRoles: [0, 1, 2]  // admin 和 driver 都能访问
        },
    },
    {
        path: '/user-main',
        name: 'user-main',
        component: User_main,
        meta: {
            requiredRoles: [0, 1]  // admin 和 Passenger 都能访问
        },
    },
    {
        path: '/user-person',
        name: 'user-person',
        component: User_person,
        meta: {
            requiredRoles: [0, 1]  // admin 和 Passenger 都能访问
        },
    },
    {
        path: '/user-platform',
        name: 'user-platform',
        component: User_platform,
        meta: {
            requiredRoles: [0, 1]  // admin 和 Passenger 都能访问
        },
    },
    {
        path: '/admin_home',
        name: 'admin_home',
        component: Lay_out,
        meta: {
            requiredRoles: [0]  // admin能访问
        },
        children: [{
            path: 'dashboard',
            name: 'Dashboard',
            component: () => import('@/views/admin/Admin_dashboard.vue'),
            meta: { title: 'Dashboard', icon: 'dashboard' }
        },
        {
            path: 'userspass',
            name: 'usersPass',
            component: () => import('@/views/admin/Admin_userspass.vue'),
            meta: { title: 'Usersspass', icon: 'userspass' }
        },
        {
            path: 'variables',
            name: 'variables',
            component: () => import('@/views/admin/Admin_variables.vue'),
            meta: { title: 'Variables', icon: 'variables' }
        },
        {
            path: 'test',
            name: 'test',
            component: () => import('@/views/admin/Admin_test.vue'),
            meta: { title: 'Test', icon: 'test' }
        },
        {
            path: 'feedback',
            name: 'feedback',
            component: () => import('@/views/admin/Admin_feedback.vue'),
            meta: { title: 'Feedback', icon: 'feedback' }
        },
        {
            path: 'drivers',
            name: 'drivers',
            component: () => import('@/views/admin/Admin_drivers.vue'),
            meta: { title: 'Drivers', icon: 'drivers' }
        },
        {
            path: 'car_table',
            name: 'car_table',
            component: () => import('@/views/admin/Admin_car_table.vue'),
            meta: { title: 'Car_table', icon: 'car_table' }
        },
        {
            path: 'manage_routes',
            name: 'manage_routes',
            component: () => import('@/views/components/Map-admin.vue'),
            meta: { title: 'Manage_routes', icon: 'manage_routes' }
        },
        {
            path: 'work_table',
            name: 'work_table',
            component: () => import('@/views/admin/Admin_work_table.vue'),
            meta: { title: 'Work_table', icon: 'work_table' }
        }
        ]
    },
    {
        path: '/404',
        name: 'Error404',
        component: Error404,
        hidden: true,
    },
    {
        path: '/simulation',
        name: 'simulation',
        component: simulation,
    },
    {
        path: '/empty_site',
        name: 'empty_site',
        component: () => import('@/views/empty_site.vue'),
    },
    {
        path: '/scanned',  // 設置一個新的路由處理掃描
        name: 'Scanned',
        component: ScannedPage,  // 用來處理掃描後的頁面
    },
];


const router = createRouter({
    history: createWebHistory(), // 使用 history 模式
    routes,
});


// 添加导航守卫，确保用户只有在登录后才能访问主页
router.beforeEach(async (to, from, next) => {
    // 先检查是否是非法URL，如果是则访问404界面
    const routeExists = router.hasRoute(to.name);
    if (!routeExists) {
        next('/404'); // 重定向到 404 页面
    }
    // URL正常
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
    } else if (to.name !== 'Login' && to.name !== 'Register') {
        // 如果用户试图访问其他页面
        const validation = await validateToken(); // 验证令牌
        if (validation.valid) {
            // 如果令牌合法，继续导航
            const userRole = validation.role; // 获取角色
            console.log(userRole);
            const userData = validation.data; // 获取角色
            console.log(userData);

            // 检查目标路由是否有角色限制
            const requiredRoles = to.meta.requiredRoles || [];
            if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
                next();
            } else {
                next('/404'); // 重定向到 404 页面
            }
            // next();
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
