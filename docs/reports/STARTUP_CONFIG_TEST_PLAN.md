# 启动配置增强功能测试计划

## 🎯 测试目标
验证当项目没有 package.json 文件时，启动配置组件能够：
1. 正确显示警告信息
2. 提供生成默认 package.json 的选项
3. 允许用户配置启动文件和启动命令
4. 成功创建包含用户配置的 package.json 文件

## 📋 测试步骤

### 第一步：准备测试项目
已创建测试项目目录：`/tmp/test-startup-config`
- ✅ 包含 `index.js` 文件
- ✅ 包含 `server.js` 文件  
- ✅ 没有 `package.json` 文件

### 第二步：在应用中导入测试项目
1. 打开 NodeAppManager 应用
2. 点击 "➕ 添加项目" 按钮
3. 选择 `/tmp/test-startup-config` 目录
4. 确认项目被成功导入

### 第三步：测试启动配置组件
1. 进入刚导入的测试项目详情页面
2. 查看启动配置部分
3. 验证是否显示：
   - ⚠️ 警告图标和"启动配置"标题
   - "未找到 package.json 文件，无法配置启动参数"的提示
   - "📦 生成默认 package.json" 按钮

### 第四步：测试 package.json 创建功能
1. 点击 "📦 生成默认 package.json" 按钮
2. 验证显示配置表单：
   - 启动文件输入框（默认值应该是 "index.js"）
   - 启动命令输入框（默认值应该是 "node index.js"）
   - 配置预览区域
   - "✅ 创建 package.json" 和 "取消" 按钮

### 第五步：测试不同项目类型的默认配置
测试创建不同项目类型的默认配置：
- **Node/Generic 项目**：启动文件 `index.js`，启动命令 `node index.js`
- **Express 项目**：启动文件 `server.js`，启动命令 `node server.js`
- **React 项目**：启动文件 `src/index.js`，启动命令 `npm start`

### 第六步：测试自定义配置
1. 修改启动文件为 `server.js`
2. 修改启动命令为 `node server.js`
3. 验证预览区域实时更新
4. 点击 "✅ 创建 package.json"

### 第七步：验证文件创建
1. 验证显示成功提示消息
2. 检查 `/tmp/test-startup-config/package.json` 文件是否被创建
3. 验证文件内容是否正确：
   ```json
   {
     "name": "test-startup-config",
     "version": "1.0.0",
     "description": "test-startup-config project",
     "main": "server.js",
     "scripts": {
       "start": "node server.js",
       "dev": "node server.js",
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "keywords": [],
     "author": "",
     "license": "ISC",
     "engines": {
       "node": ">=14.0.0"
     }
   }
   ```

### 第八步：测试后续配置
1. 刷新项目详情页面或重新加载 package 信息
2. 验证启动配置组件现在显示：
   - ✅ 绿色勾号表示已配置
   - 显示当前的启动文件和启动命令
   - 提供编辑功能

## 🔧 技术验证点

### IPC 通信测试
- ✅ `project:createPackageJson` IPC 处理程序已实现
- ✅ 支持传入完整的 package.json 配置对象
- ✅ 正确处理文件已存在的情况
- ✅ 返回适当的成功/错误响应

### 前端组件测试
- ✅ `MissingPackageJsonHandler` 组件已实现
- ✅ 根据项目类型提供智能默认配置
- ✅ 实时预览配置内容
- ✅ 用户体验友好的表单验证

### 错误处理测试
- 测试重复创建 package.json 的情况
- 测试权限不足的情况
- 测试磁盘空间不足的情况
- 测试网络连接问题

## 📊 预期结果
✅ 所有测试用例都应该通过
✅ 用户能够轻松为没有 package.json 的项目创建配置
✅ 创建的 package.json 文件格式正确且包含用户配置
✅ 整个流程用户体验流畅，错误处理完善

## 🚀 测试状态
- [x] 代码实现完成
- [x] 应用程序成功启动
- [ ] 手动测试执行中...
- [ ] 所有测试用例验证
- [ ] 错误场景测试
- [ ] 用户体验评估

## 💡 测试提示
1. 确保在测试前应用程序已成功编译和启动
2. 准备多个不同类型的测试项目目录
3. 注意观察控制台输出和错误信息
4. 验证 IPC 通信日志
5. 检查文件系统权限

---
*测试时间：2025年6月9日*
*测试环境：macOS, NodeAppManager v0.1.1-beta*
