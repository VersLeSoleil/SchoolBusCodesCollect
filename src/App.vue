<template>
  <div id="app">
    <router-view /> <!-- 用于加载路由定义的页面 -->
  </div>

</template>

<script>
import { createPinia } from "pinia";

export default {
  name: "App",
  create() {
    // 初始化 Pinia（确保在项目中已注册 Pinia）
    this.$pinia = createPinia();
    // 禁用浏览器默认滚动恢复
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  },
}

</script>

<style>

</style>
