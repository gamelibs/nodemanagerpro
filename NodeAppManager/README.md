# Node App Manager 🚀

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)

> 企业级 Node.js 项目管理桌面应用，基于 Electron + React + PM2 构建

一款专为开发者设计的桌面应用，用于统一管理和监控多个 Node.js 项目。通过集成 PM2 进程管理器，提供项目启动/停止、实时日志查看、性能监控等企业级功能。

## 📚 目录导航

- [✨ 核心特性](#-核心特性)
- [🚀 快速开始](#-快速开始)
  - [环境要求](#环境要求)
  - [安装依赖](#安装依赖)
  - [启动应用](#启动应用)
- [📖 详细文档](#-详细文档)
- [💻 主要功能](#-主要功能)
- [🛠️ 技术栈](#️-技术栈)
- [🔧 开发](#-开发)
- [🤝 贡献](#-贡献)
- [📄 许可证](#-许可证)
- [🔗 快速链接](#-快速链接)

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

📚 **[完整文档索引 - DOCS_INDEX.md](./DOCS_INDEX.md)** - 所有文档快速导航

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

## 📚 相关文档

- [更新日志](./CHANGELOG.md) - 版本更新记录
- [功能完成报告](./FEATURE_COMPLETION_REPORT.md) - 开发进度总结
- [架构说明](./ARCHITECTURE_EXPLANATION.md) - 技术架构详解

## 🔗 快速链接

| 文档类型 | 文件名 | 描述 |
|---------|-------|------|
| 🏠 主要 | [README.md](./README.md) | 项目主页和快速开始 |
| 📖 指南 | [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) | 完整使用指南 |
| 🌍 国际化 | [I18N_FEATURE_UPDATE.md](./I18N_FEATURE_UPDATE.md) | 多语言功能说明 |
| 📊 日志 | [LOGGING_SYSTEM_GUIDE.md](./LOGGING_SYSTEM_GUIDE.md) | 日志系统设计 |
| ⚙️ 服务 | [PM2_INTEGRATION_REPORT.md](./PM2_INTEGRATION_REPORT.md) | PM2集成报告 |

---

**开源协议**: [MIT License](./LICENSE) | **版本**: v2.1.0 | **最后更新**: 2025年5月30日
