# SchoolBusCodesCollect  
校园巴士前端项目

## 安装步骤  

### 1. 进入项目文件夹  
首先，通过终端进入项目根目录：  
```bash
cd SchoolBusCodesCollect
```

### 2. 安装依赖  
运行以下命令以下载项目所需的所有依赖：  
```bash
npm install
```  
**提示**：如果安装过程中未自动安装 `pinia`，请手动运行以下命令单独安装：  
```bash
npm install pinia
```

### 3. 启动前端开发服务器  
执行以下命令启动前端开发环境：  
```bash
npm run serve
```

---

## 后端部分  
请确保先安装后端项目代码，可通过以下仓库获取：  
[AdminSchoolBus 后端仓库](https://github.com/Cortantse/AdminSchoolBus)

---

## 注意事项  
- 请确保你的开发环境中已正确安装以下工具：  
  - **Node.js**  
  - **Go**  
- 在开发过程中，如果遇到依赖相关的问题，可以尝试以下步骤：  
  1. 删除 `node_modules` 文件夹：  
     ```cmd
     rmdir /s /q node_modules
     ```
  2. 清理 npm 缓存：  
     ```bash
     npm cache clean --force
     ```
  3. 重新安装依赖：  
     ```bash
     npm install
     ```

---

通过以上步骤，你将成功启动校园巴士前端项目并进入开发环境！ 🎉