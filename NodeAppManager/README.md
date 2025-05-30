# Node App Manager 🚀

> 企业级 Node.js 项目管理桌面应用，基于 Electron + React + PM2 构建

一款专为开发者设计的桌面应用，用于统一管理和监控多个 Node.js 项目。通过集成 PM2 进程管理器，提供项目启动/停止、实时日志查看、性能监控等企业级功能。

## ✨ 核心特性

- 🚀 **项目管理** - 导入、创建、启动、停止 Node.js 项目
- 📊 **实时监控** - PM2 集成，支持进程守护和自动重启  
- 📋 **日志管理** - 实时日志显示和历史日志查看
- 🎨 **现代化UI** - 基于 Tailwind CSS 的深色主题界面
- ⚡ **热更新** - 开发模式支持实时代码更新
- 🔧 **智能端口** - 自动检测和分配项目端口
- 🌍 **国际化支持** - 完整的中英文双语界面 🆕

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- PM2 (自动安装)

### 安装依赖
```bash
npm install
npm install -g pm2  # 如果尚未安装
```

### 启动应用

#### 🧪 测试环境（推荐首次使用）
```bash
chmod +x start-dev.sh
./start-dev.sh
```
**特点**: 完整初始化、环境检查、依赖安装、详细日志

#### 🚀 生产环境（快速启动）  
```bash
chmod +x run.sh
./run.sh
```
**特点**: 快速启动、跳过检查、性能优先、精简流程

### 停止应用
```bash
# 在终端中按下
Ctrl + C
```

## 📖 详细文档

### 核心文档
- **[PROJECT_GUIDE.md](./PROJECT_GUIDE.md)** - 项目完整使用指南
- **[I18N_FEATURE_UPDATE.md](./I18N_FEATURE_UPDATE.md)** - 国际化功能更新文档 🆕
- **[LOGGING_SYSTEM_GUIDE.md](./LOGGING_SYSTEM_GUIDE.md)** - 日志系统设计文档
- **[PM2_INTEGRATION_REPORT.md](./PM2_INTEGRATION_REPORT.md)** - PM2集成报告
- **[TEMPLATE_REDESIGN_COMPLETION.md](./TEMPLATE_REDESIGN_COMPLETION.md)** - 模板系统文档

### 技术文档
- **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - 项目完成总结
- **[MIGRATION_TEST.md](./MIGRATION_TEST.md)** - 文件系统迁移测试

完整的使用指南、技术架构和开发文档请查看：
**[📚 PROJECT_GUIDE.md](./PROJECT_GUIDE.md)**

包含内容：
- 📋 项目简介和核心特性
- 🏗️ 技术架构说明  
- 📁 详细的项目结构
- 🚀 安装和启动指南
- 💻 功能使用说明
- 🔧 配置和开发指南
- 🐛 故障排除方法

## 💻 主要功能

### 项目管理
- **导入项目**: 选择包含 `package.json` 的 Node.js 项目
- **创建项目**: 基于模板快速创建新项目
- **启动/停止**: 一键控制项目运行状态
- **实时监控**: 绿色/灰色状态指示器

### 日志查看
- **实时日志**: 左侧栏显示项目输出
- **快速访问**: 点击日志中的 URL 直接打开浏览器
- **PM2 集成**: 完整的进程管理和监控

### 界面导航
- **Projects**: 查看和管理所有项目
- **Settings**: 应用设置和系统信息
- **语言切换**: 支持中文/English实时切换 🆕

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **桌面**: Electron + IPC 通信
- **进程管理**: PM2 + 自动重启 + 性能监控

## 🔧 开发

### 启动开发模式
```bash
npm run electron:dev     # 启动 Electron 开发模式
npm run build           # 构建前端
npm run electron:compile # 编译主进程
```

### 项目结构
```
src/
├── components/         # React 组件
├── services/          # 核心服务层  
├── hooks/             # React Hooks
├── store/             # 状态管理
└── types/             # TypeScript 类型
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**让 Node.js 项目管理变得简单高效！** 🎯

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
