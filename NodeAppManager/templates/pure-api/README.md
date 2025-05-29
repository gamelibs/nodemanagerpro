# {{PROJECT_NAME}}

纯 API 服务器 - 专注于 API 开发，无前端界面

## 特性

- 🚀 Express.js 框架
- 🔧 ES6 模块支持
- 🌐 CORS 支持
- 📝 环境变量配置
- 🧪 Jest 测试框架
- 📏 ESLint 代码检查
- 💅 Prettier 代码格式化

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

### 运行测试

```bash
npm test
```

## API 端点

- `GET /` - API 状态信息
- `GET /api/health` - 健康检查
- `GET /api/users` - 获取用户列表（示例）

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
