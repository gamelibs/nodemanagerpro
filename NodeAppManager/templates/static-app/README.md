# {{PROJECT_NAME}}

静态网站 + API 服务器 - 现代网站开发，提供静态文件服务和 API 接口

## 特性

- 🌐 静态网站托管
- 🚀 Express.js API 服务器
- 🎨 现代响应式设计
- 🔧 ES6 模块支持
- 🌐 CORS 支持
- 📝 环境变量配置
- 🧪 Jest 测试框架
- 📏 ESLint 代码检查
- 💅 Prettier 代码格式化
- 🌙 暗色/亮色主题
- 🔗 API 测试界面

## 项目结构

```
src/
  app.js          # Express 服务器主文件
public/
  index.html      # 静态网站首页
  css/
    style.css     # 样式文件
  js/
    main.js       # 前端 JavaScript
tests/
  app.test.js     # 测试文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

服务器启动后：
- 访问 http://localhost:3000 查看静态网站
- 使用内置的 API 测试界面测试接口
- API 端点可通过 /api/* 路径访问

### 生产模式

```bash
npm start
```

### 运行测试

```bash
npm test
```

## API 端点

- `GET /` - 静态网站首页
- `GET /api/health` - 健康检查
- `GET /api/users` - 获取用户列表（示例）

## 开发指南

### 静态文件
- 将 HTML、CSS、JS 文件放在 `public/` 目录下
- 服务器会自动提供静态文件服务
- 支持响应式设计和主题切换

### API 开发
- 在 `src/app.js` 中添加新的 API 路由
- 使用 `/api/` 前缀区分 API 和静态文件
- 支持 JSON 数据交换

## 环境配置

复制 `.env` 文件并根据需要修改配置：

```bash
cp .env.example .env
```

## 项目结构

```
src/
  app.js          # 主应用文件
tests/            # 测试文件
.env              # 环境配置
package.json      # 项目配置
```

## 部署

项目可以部署到任何支持 Node.js 的平台，如：

- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

## 许可证

MIT License
