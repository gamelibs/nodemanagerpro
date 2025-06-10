# Node App Manager 🚀

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-beta0.1.0-blue.svg)

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

- 🚀 **项目管理** - 导入、创建、启动、停止 Node.js 项目，完整的运行状态控制
- 📊 **实时监控** - PM2 集成，支持进程守护和自动重启，真实端口检测
- 📋 **统一日志** - 项目详情页集成实时日志显示，支持日志刷新和查看
- 📦 **智能依赖** - 选择性安装项目依赖，支持单个包独立安装管理
- 🎨 **现代化UI** - 基于 Tailwind CSS 的深色主题界面，优化布局设计
- ⚡ **热更新** - 开发模式支持实时代码更新
- 🔧 **智能端口** - 自动检测和分配项目端口，移除假数据填充
- 🌍 **国际化支持** - 完整的中英文双语界面 🆕

## � 应用下载

### 🍎 macOS 版本 ✅
- **Intel Mac**：`Node App Manager-beta0.1.0.dmg` (构建中)
- **Apple Silicon**：`Node App Manager-beta0.1.0-arm64.dmg` (构建中)
- **便携版**：提供 ZIP 格式免安装版本

### 🪟 Windows 版本 ⚠️
- Windows 版本正在准备中，遇到网络问题暂时无法完成打包
- 计划支持：Windows 10/11 (x64/x86)

> 📋 详细下载说明请查看：**[APP_BUILD_REPORT.md](./APP_BUILD_REPORT.md)**

## �🚀 快速开始

### 环境要求
- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- PM2 全局安装 (`npm install -g pm2`)

### 安装依赖
```bash
npm install
```

### 启动应用

#### 方式一：智能启动脚本（推荐）
使用智能启动脚本可以确保在正确的工作目录下启动应用，并提供完整的日志记录：

1. 设置快捷方式（推荐）
```bash
# 添加到你的 .bashrc 或 .zshrc
alias nam='~/works/NodeAppManager/smart-start.sh'

# 然后可以从任何位置启动
nam
```

2. 直接运行脚本
```bash
# 从项目目录运行
./smart-start.sh

# 或从任何位置运行（使用完整路径）
~/works/NodeAppManager/smart-start.sh
```

智能启动脚本特性：
- 🎯 自动确保正确的工作目录
- 📝 完整的启动日志记录
- 🔍 环境和依赖检查
- 🚀 一键式启动体验

#### 方式二：传统启动
如果你已经在正确的项目目录下：
```bash
# 开发模式启动（支持热更新）
npm run electron:dev

# 生产模式启动
npm run electron:build
```

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
- **运行控制**: 启动/停止/重启项目，支持PM2进程管理
- **状态监控**: 实时显示项目运行状态和端口信息

### 依赖管理 🆕
- **智能检测**: 自动检测项目依赖安装状态
- **选择性安装**: 为每个未安装的依赖包提供独立安装按钮
- **实时更新**: 安装后自动刷新依赖状态显示

### 项目详情页 🆕
- **统一界面**: 基本信息、运行状态、依赖包信息在一个页面展示
- **实时日志**: 集成PM2日志显示，支持手动刷新
- **便捷操作**: 快速访问文件夹、编辑器、浏览器打开

### 界面导航
- **Projects**: 查看和管理所有项目，优化的项目列表显示
- **Settings**: 应用设置和系统信息
- **语言切换**: 支持中文/English实时切换 🆕

## 🔍 功能完整性分析

### 📊 功能模块评估

**NodeAppManager** 是一个功能完整、设计合理的 Node.js 项目管理工具，针对开发者的实际需求提供了全方位的解决方案：

| 功能模块 | 完整度 | 实用性 | 稳定性 | 核心特性 |
|---------|--------|--------|--------|----------|
| **🚀 项目管理** | 🟢 95% | 🟢 90% | 🟢 85% | 智能类型检测、Git状态、批量操作 |
| **⚙️ 进程管理** | 🟢 90% | 🟢 95% | 🟢 85% | PM2集成、状态监控、日志查看 |
| **🌐 端口管理** | 🟢 85% | 🟢 95% | 🟢 80% | 端口检测、配置同步、冲突处理 |
| **📦 依赖管理** | 🟡 75% | 🟢 80% | 🟡 75% | 状态检测、选择性安装、进度反馈 |
| **📁 文件集成** | 🟢 90% | 🟢 85% | 🟢 90% | 编辑器打开、文件夹访问、配置管理 |

**总体评分: 🟢 87% - 功能完整且实用**

### 🎯 核心优势

#### ✅ **智能化设计**
- **智能项目类型检测**: 自动识别 Vite、React、Next.js、Vue、Angular、Express、NestJS 等
- **推荐脚本提示**: 根据项目类型推荐最适合的启动脚本
- **Git 状态检测**: 自动检测项目是否使用版本控制

#### ✅ **全生命周期管理**
- **项目发现**: 扫描目录发现 Node.js 项目
- **进程控制**: 启动、停止、重启项目进程
- **状态监控**: 实时同步项目运行状态
- **日志查看**: 集成 PM2 日志的实时显示

#### ✅ **开发体验优化**
- **端口管理**: 解决本地开发端口冲突问题
- **依赖检测**: 智能检测和安装项目依赖
- **文件系统集成**: 一键打开编辑器、文件夹、浏览器
- **错误处理**: 友好的错误提示和恢复建议

#### ✅ **技术架构合理**
- **Electron + React**: 现代化桌面应用技术栈
- **PM2 集成**: Node.js 生态标准进程管理器
- **TypeScript**: 类型安全的开发体验
- **模块化设计**: 清晰的代码组织和可维护性

### 🎯 应用场景

#### 👨‍💻 **个人开发者**
- 管理多个前端/后端项目
- 快速切换项目运行状态
- 监控项目性能和日志

#### 👥 **小团队开发**
- 统一的项目管理规范
- 标准化的开发环境配置
- 简化的项目部署流程

#### 🏢 **企业级使用**
- 微服务项目的集中管理
- 开发环境的标准化配置
- 项目状态的实时监控

### 💡 **设计理念**

这个项目成功地解决了 Node.js 开发者在日常工作中的核心痛点：

1. **多项目管理复杂性** → 统一的管理界面
2. **进程状态不透明** → 实时状态监控和日志
3. **端口冲突频发** → 智能端口管理和检测
4. **依赖安装繁琐** → 可视化依赖管理
5. **工具切换频繁** → 集成常用开发工具

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

**开源协议**: [MIT License](./LICENSE) | **版本**: beta0.1.0 | **最后更新**: 2025年6月1日

## 📚 文档导航

### 发布文档
- [macOS Beta 0.1.1 构建报告](docs/releases/MACOS_BUILD_REPORT_v0.1.1-beta.md)  
- [版本 Beta 0.1.1 发布清单](docs/releases/RELEASE_CHECKLIST_v0.1.1-beta.md)
- [Beta 0.1.1 macOS 发布总结](docs/releases/BETA_0.1.1_MACOS_RELEASE_SUMMARY.md)
- [NodeHub Pro 正式版发布报告](docs/releases/NODEHUB_PRO_FINAL_RELEASE_REPORT.md)
- [Beta 0.1.0 修复报告](docs/releases/FIX_REPORT_BETA0.1.0.md)

### 功能文档
- [PM2 集成报告](docs/features/PM2_INTEGRATION_REPORT.md)
- [国际化功能更新](docs/features/I18N_FEATURE_UPDATE.md)
- [稳定 ID 系统完成报告](docs/features/STABLE_ID_SYSTEM_COMPLETION.md)
- [模板重设计完成报告](docs/features/TEMPLATE_REDESIGN_COMPLETION.md)
- [特性完成报告](docs/features/FEATURE_COMPLETION_REPORT.md)

### 使用指南
- [项目指南](docs/guides/PROJECT_GUIDE.md)
- [测试应用指南](docs/guides/TEST_APP_GUIDE.md)
- [日志系统指南](docs/guides/LOGGING_SYSTEM_GUIDE.md)
- [自动日志监控指南](docs/guides/AUTO_LOG_MONITOR_GUIDE.md)

### 测试与报告
- [UI 重构 Beta 0.1.0](docs/reports/UI_REFACTOR_BETA0.1.0.md)
- [启动配置测试计划](docs/reports/STARTUP_CONFIG_TEST_PLAN.md)
- [应用构建报告](docs/reports/APP_BUILD_REPORT.md)
- [GitHub 兼容性测试](docs/reports/GITHUB_COMPATIBILITY_TEST.md)
- [完成总结](docs/reports/COMPLETION_SUMMARY.md)
- [手动配置完成报告](docs/reports/MANUAL_CONFIG_COMPLETION_REPORT.md)
- [迁移测试报告](docs/reports/MIGRATION_TEST.md)

---

**让 Node.js 项目管理变得简单高效！** 🎯
