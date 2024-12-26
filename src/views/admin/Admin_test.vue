<template>
  <div id="app">
    <div class="container">
      <h1>除法计算器</h1>
      <div class="input-group">
        <label for="a">数字 A:</label>
        <input v-model="a" type="number" id="a" placeholder="请输入第一个数字" />
      </div>
      <div class="input-group">
        <label for="b">数字 B:</label>
        <input v-model="b" type="number" id="b" placeholder="请输入第二个数字" />
      </div>
      <button @click="calculate">计算</button>

      <div v-if="result !== null" class="result">
        <p>结果: {{ result }}</p>
      </div>

      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      a: null,
      b: null,
      result: null,
      errorMessage: null,
    };
  },
  methods: {
    async calculate() {
      // 清空上次的结果和错误信息
      this.result = null;
      this.errorMessage = null;

      if (this.a === null || this.b === null) {
        this.errorMessage = '请输入有效的数字';
        return;
      }

      try {
        const prefixURL = localStorage.getItem("prefixURL"); // 使用本地存的url
        const response = await fetch(
            prefixURL + `/test/divide?a=${this.a}&b=${this.b}`
        );
        if (!response.ok) {
          throw new Error('请求失败，可能是除数为零');
        }
        const data = await response.json();
        this.result = data.result;
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
  },
};
</script>

<style scoped>
.container {
  margin-top: 100px;
  margin-left: 250px;
  max-width: 400px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: #f9f9f9;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

input[type="number"] {
  padding: 8px;
  width: 80%;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}

.result {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.error-message {
  margin-top: 20px;
  font-size: 16px;
  color: red;
}
</style>
