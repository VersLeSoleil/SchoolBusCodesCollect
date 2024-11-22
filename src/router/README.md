# 路由模块说明

`router/index.js` 是项目的路由配置文件，使用 Vue Router 4 实现了页面导航。该文件定义了应用的所有路由规则，并通过 `createRouter` 创建路由实例，供 Vue 应用使用。

---

## 文件路径

`src/router/index.js`

---

## 功能简介

1. **路由模式**：使用 `createWebHistory` 设置为 HTML5 的 History 模式，使 URL 更加美观且无哈希符号（`#`）。
2. **页面导航**：定义了项目中所有页面的路径、名称及其对应的组件。
3. **重定向功能**：访问根路径 `/` 时，会自动重定向到 `/login` 登录页面。

---

## 路由配置详情

以下是当前配置的路由规则列表：

### **1. 根路径**
- **路径**：`/`
- **功能**：自动重定向到 `/login`。
- **配置**：
  ```javascript
  {
      path: '/',
      redirect: '/login',
  }
  ```

---

### **2. 登录页面**
- **路径**：`/login`
- **名称**：`Login`
- **组件**：`LoginPage`（`../views/login.vue`）
- **功能**：提供用户登录功能。
- **配置**：
  ```javascript
  {
      path: '/login',
      name: 'Login',
      component: LoginPage,
  }
  ```

---

### **3. 首页**
- **路径**：`/home`
- **名称**：`Home`
- **组件**：`HomePage`（`../views/HomePage.vue`）
- **功能**：用户登录后进入的主界面。
- **配置**：
  ```javascript
  {
      path: '/home',
      name: 'Home',
      component: HomePage,
  }
  ```

---

### **4. Driver 页面 0**
- **路径**：`/driver-0`
- **名称**：`Driver-0`
- **组件**：`Driver_Page_0`（`@/views/driver_0/driver_Page_0.vue`）
- **功能**：司机相关功能的第一个页面。
- **配置**：
  ```javascript
  {
      path: '/driver-0',
      name: 'Driver-0',
      component: Driver_Page_0,
  }
  ```

---

### **5. Driver 信息页面**
- **路径**：`/driverInfo`
- **名称**：`DriverInfo`
- **组件**：`Driver_Info`（`@/views/driver_0/driver_Info.vue`）
- **功能**：展示司机的详细信息。
- **配置**：
  ```javascript
  {
      path: '/driverInfo',
      name: 'DriverInfo',
      component: Driver_Info,
  }
  ```

---

### **6. Driver 页面 1**
- **路径**：`/driver-1`
- **名称**：`Driver-1`
- **组件**：`Driver_Page_1`（`@/views/driver_1/driver_Page_1.vue`）
- **功能**：司机相关功能的第二个页面。
- **配置**：
  ```javascript
  {
      path: '/driver-1',
      name: 'Driver-1',
      component: Driver_Page_1,
  }
  ```

---

### **7. 测试地图页面**
- **路径**：`/test-user`
- **名称**：`test-user`
- **组件**：`test_user_map`（`@/views/components/Map-user.vue`）
- **功能**：用于测试地图功能的页面。
- **配置**：
  ```javascript
  {
      path: '/test-user',
      name: 'test-user',
      component: test_user_map,
  }
  ```

---

### **8. 用户主页面**
- **路径**：`/user-main`
- **名称**：`user-main`
- **组件**：`User_main`（`@/views/user/user_main.vue`）
- **功能**：用户登录后的主界面。
- **配置**：
  ```javascript
  {
      path: '/user-main',
      name: 'user-main',
      component: User_main,
  }
  ```

---

### **9. 用户个人信息页面**
- **路径**：`/user-person`
- **名称**：`user-person`
- **组件**：`User_person`（`@/views/user/user_person.vue`）
- **功能**：展示用户的个人信息。
- **配置**：
  ```javascript
  {
      path: '/user-person',
      name: 'user-person',
      component: User_person,
  }
  ```

---

## 路由模式

该文件中使用了 **HTML5 History 模式**：
```javascript
history: createWebHistory()
```
### **特点**
1. URL 更加美观，无需 `#` 符号。
2. 需要服务器支持（确保后端服务器正确处理页面刷新）。

---

## 注意事项

1. **路径和组件的正确性**：  
   - 确保所有组件的导入路径正确。
   - 页面文件通常存放在 `views` 文件夹中，并以 `.vue` 结尾。

2. **路由模式支持**：  
   如果项目部署在非根目录下（如 `example.com/app/`），需要在 `router/index.js` 中配置 `base` 参数：
   ```javascript
   createWebHistory('/app/')
   ```

3. **重定向配置**：  
   访问根路径 `/` 时会自动跳转到 `/login` 页面，确保登录页面正常运行。

---
