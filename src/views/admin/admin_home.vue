<script setup>
import { ref } from 'vue';

const message = ref('admin已打开');
</script>

<template>
  <div class="container">
    <h1>{{ message }}</h1>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

h1 {
  font-size: 24px;
  color: #333;
}
</style>
