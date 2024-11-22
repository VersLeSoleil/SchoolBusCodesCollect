# Stores 模块说明

`stores` 模块是项目中的全局状态管理模块，使用 Pinia 实现状态管理。该模块包含多个存储（store），分别管理不同的全局状态，以支持整个项目的功能。

---

## 文件路径

`src/stores/`

---

## 功能简介

该模块的主要功能包括：
1. **用户状态管理**：通过 `user.js` 管理用户的账号状态。
2. **音频状态管理**：通过 `audioStore.js` 管理音频播放状态。

---

## Stores 文件说明

### **1. `user.js`**
- **作用**：管理用户登录状态。
- **功能**：
  - 保存用户的账号信息。
  - 清除用户的账号信息。
- **示例代码**：
  ```javascript
  import { defineStore } from 'pinia';

  export const useUserStore = defineStore('user', {
      state: () => ({
          userAccount: null, // 用户账号
      }),
      actions: {
          setUserAccount(account) {
              this.userAccount = account; // 更新用户账号
          },
          clearUserAccount() {
              this.userAccount = null; // 清空用户账号
          },
      },
  });
  ```

#### **使用方法**
1. 引入 `useUserStore`：
   ```javascript
   import { useUserStore } from '@/stores/user';
   ```

2. 调用方法：
   ```javascript
   const userStore = useUserStore();

   // 设置用户账号
   userStore.setUserAccount('exampleUser');

   // 获取当前账号
   console.log(userStore.userAccount);

   // 清除用户账号
   userStore.clearUserAccount();
   ```

---

### **2. `audioStore.js`**
- **作用**：管理音频播放状态。
- **功能**：
  - 控制音频播放。
  - 停止当前播放的音频并切换到新的音频。
- **示例代码**：
  ```javascript
  import { defineStore } from 'pinia';

  export const useAudioStore = defineStore('audio', {
      state: () => ({
          currentAudio: null, // 当前播放的音频实例
      }),
      actions: {
          playAudio(audioSrc) {
              // 如果有音频在播放，停止并重置
              if (this.currentAudio && !this.currentAudio.paused) {
                  this.currentAudio.pause();
                  this.currentAudio.currentTime = 0;
              }

              // 播放新的音频
              this.currentAudio = new Audio(audioSrc);
              this.currentAudio.play();
          },
      },
  });
  ```

#### **使用方法**
1. 引入 `useAudioStore`：
   ```javascript
   import { useAudioStore } from '@/stores/audioStore';
   ```

2. 调用方法：
   ```javascript
   const audioStore = useAudioStore();

   // 播放音频
   audioStore.playAudio('audio/example.mp3');
   ```

---

## 模块依赖

- **Pinia**：Vue 官方推荐的状态管理工具。
  - **安装 Pinia**：
    ```bash
    npm install pinia
    ```

- **Audio 对象**：浏览器内置的 `Audio` 构造函数，用于音频播放功能。

---

## 使用方法

1. **在 Vue 项目中引入 Pinia**：  
   在 `main.js` 中注册 Pinia：
   ```javascript
   import { createApp } from 'vue';
   import { createPinia } from 'pinia';
   import App from './App.vue';

   const app = createApp(App);
   app.use(createPinia());
   app.mount('#app');
   ```

2. **在组件中使用 Store**：  
   在 Vue 组件中导入并使用需要的 Store：
   ```javascript
   import { useUserStore } from '@/stores/user';
   const userStore = useUserStore();
   ```

---

## 注意事项

1. **Pinia 的状态是响应式的**：
   - 在组件中使用时，状态会实时更新，无需手动监听。
   - 示例：
     ```javascript
     const userStore = useUserStore();
     console.log(userStore.userAccount); // 响应式状态
     ```

2. **避免直接修改状态**：
   - 请通过 `actions` 修改状态，而不要直接更改 `state`。

3. **音频播放的限制**：
   - 某些浏览器需要用户交互后才能播放音频（例如，必须点击按钮）。

---

## 总结

- **`user.js`**：主要用于管理用户登录信息，包括保存和清除用户账号。
- **`audioStore.js`**：主要用于管理音频播放逻辑，包括播放新的音频和停止当前音频。
