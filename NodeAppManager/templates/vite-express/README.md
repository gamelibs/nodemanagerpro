# {{PROJECT_NAME}}

Vite + Express 全栈应用 - 前后端同构快速搭建

## 特性

### 前端
- ⚡ Vite 构建工具
- 🔷 TypeScript 支持
- 📱 响应式设计
- 🎨 现代化UI

### 后端
- 🚀 Express.js 框架
- 🔷 TypeScript 支持
- 🌐 CORS 支持
- 📝 环境变量配置
- 🧪 Jest 测试框架

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将同时启动前端和后端开发服务器：
- 前端: http://localhost:5173
- 后端: http://localhost:{{PORT}}

### 单独启动

```bash
# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 运行测试

```bash
npm test
```

## API 端点

- `GET /api/health` - 健康检查
- `GET /api/info` - 应用信息
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户

## 项目结构

```
├── src/                    # 前端源码
│   ├── main.ts            # 入口文件
│   └── style.css          # 样式文件
├── server/                 # 后端源码
│   ├── src/
│   │   └── app.ts         # 服务器主文件
│   └── tsconfig.json      # 后端TS配置
├── dist/                   # 构建输出
│   ├── client/            # 前端构建产物
│   └── server/            # 后端构建产物
├── index.html             # HTML模板
├── vite.config.ts         # Vite配置
└── package.json           # 项目配置
```

## 开发指南

### 添加新的API路由

在 `server/src/app.ts` 中添加新的路由：

```typescript
app.get('/api/your-route', (req, res) => {
  res.json({ message: 'Hello World' });
});
```

### 前端API调用

使用内置的 `fetchAPI` 函数调用后端API：

```typescript
const data = await fetchAPI('/your-route');
```

## 部署

项目支持多种部署方式：

### Vercel
1. 构建项目：`npm run build`
2. 部署到 Vercel

### Heroku
1. 添加 `Procfile`：`web: npm start`
2. 推送到 Heroku

### Docker
添加 `Dockerfile` 进行容器化部署

## 许可证

MIT License
