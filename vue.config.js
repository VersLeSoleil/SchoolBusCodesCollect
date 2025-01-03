// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })

module.exports = {
  devServer: {
    https: {
      key: './key/sysuschoolbus.top.key',
      cert: './key/sysuschoolbus.top.pem',
    },
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://localhost:8888',
        secure: false,
        changeOrigin: true,
      },
    },
  },
};
