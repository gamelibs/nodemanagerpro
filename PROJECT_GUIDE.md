# Node App Manager 📖

> 企业级 Node.js 项目管理桌面应用，基于 Electron + React + PM2 构建

![Node App Manager](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 📚 目录导航

- [📋 项目简介](#-项目简介)
- [🏗️ 技术架构](#️-技术架构)
- [📁 项目结构](#-项目结构)
- [🚀 快速开始](#-快速开始)
- [📝 日志系统](#-日志系统) 🆕
- [🧪 测试环境 - start-dev.sh](#-测试环境---start-devsh)
- [🚀 生产环境 - run.sh](#-生产环境---runsh)
- [⚖️ 两种方式对比](#️-两种方式对比)
- [🎯 选择建议](#-选择建议)
- [🛑 停止服务](#-停止服务)
- [💻 功能使用](#-功能使用)
- [🌍 国际化功能](#5-语言切换-) 🆕
- [🔧 配置说明](#-配置说明)
- [🛠️ 开发指南](#️-开发指南)
- [🐛 故障排除](#-故障排除)
- [📋 待办功能](#-待办功能)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)
- [👥 作者](#-作者)

## 📋 项目简介

Node App Manager 是一款专为开发者设计的桌面应用，用于统一管理和监控多个 Node.js 项目。通过集成 PM2 进程管理器，提供了项目启动/停止、实时日志查看、性能监控等企业级功能。

### 🌟 核心特性

- **🚀 项目管理** - 导入、创建、启动、停止 Node.js 项目
- **📊 实时监控** - PM2 集成，支持进程守护和自动重启
- **📋 日志管理** - 实时日志显示和历史日志查看
- **🎨 现代化UI** - 基于 Tailwind CSS 的深色主题界面
- **⚡ 热更新** - 开发模式支持实时代码更新
- **🔧 智能端口** - 自动检测和分配项目端口
- **🌍 国际化支持** - 完整的中英文双语界面 🆕

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速构建工具和开发服务器
- **Tailwind CSS** - 实用优先的 CSS 框架

### 桌面应用
- **Electron** - 跨平台桌面应用框架
- **IPC 通信** - 主进程与渲染进程间的安全通信

### 进程管理
- **PM2** - 生产级进程管理器
- **自动重启** - 项目崩溃时自动恢复
- **性能监控** - CPU、内存使用率监控

## 📁 项目结构

```
NodeAppManager/
├── 📋 配置文件
│   ├── package.json              # 项目依赖和脚本配置
│   ├── package-lock.json         # 依赖版本锁定文件
│   ├── tsconfig.json            # TypeScript 编译配置
│   ├── tsconfig.app.json        # 应用 TypeScript 配置
│   ├── tsconfig.electron.json   # Electron TypeScript 配置
│   ├── tsconfig.node.json       # Node.js TypeScript 配置
│   ├── vite.config.ts           # Vite 构建配置
│   ├── tailwind.config.cjs      # Tailwind CSS 配置
│   ├── postcss.config.cjs       # PostCSS 配置
│   ├── eslint.config.js         # ESLint 代码检查配置
│   └── .gitignore               # Git 忽略文件
│
├── 🚀 启动脚本
│   ├── start-dev.sh             # 开发环境启动脚本（完整初始化）
│   ├── run.sh                   # 生产环境启动脚本（快速启动）
│   ├── smart-start.sh           # 智能启动脚本
│   ├── dev.sh                   # 开发模式脚本
│   ├── global-launcher.sh       # 全局启动器
│   ├── create-desktop-launcher.sh # 桌面启动器创建
│   └── fix-cjs-paths.sh         # CJS 路径修复脚本
│
├── ⚡ 应用入口
│   ├── electron-main.ts         # Electron 主进程入口
│   ├── index.html               # 主页面模板
│   └── public/                  # 静态资源
│       └── vite.svg             # Vite 图标
│
├── 📱 源代码 (src/)
│   ├── main.tsx                 # React 应用入口
│   ├── main_test.tsx            # 测试入口文件
│   ├── App.tsx                  # 主应用组件
│   ├── App.css                  # 应用样式
│   ├── index.css                # 全局样式
│   ├── vite-env.d.ts           # Vite 环境类型定义
│   │
│   ├── 🧩 组件 (components/)
│   │   ├── Header.tsx           # 顶部导航栏
│   │   ├── ProjectsPage.tsx     # 项目管理主页面 🆕
│   │   ├── SettingsPage.tsx     # 设置页面 🆕
│   │   ├── ProjectCard.tsx      # 项目卡片组件
│   │   ├── CreateProjectModal.tsx # 创建项目弹窗
│   │   ├── ProjectSettingsModal.tsx # 项目设置弹窗 🆕
│   │   ├── Toast.tsx            # 通知组件
│   │   ├── StatusSyncIndicator.tsx # 状态同步指示器
│   │   ├── StorageDebugInfo.tsx # 存储调试信息
│   │   ├── AppTitleTest.tsx     # 应用标题测试组件
│   │   └── HotReloadTest.tsx    # 热重载测试组件
│   │
│   ├── 🔗 Hooks (hooks/)
│   │   ├── useProjects.ts       # 项目管理逻辑
│   │   ├── useLogs.ts           # 日志管理逻辑
│   │   ├── usePerformance.ts    # 性能监控逻辑 🆕
│   │   └── useTestData.ts       # 测试数据逻辑
│   │
│   ├── 🛠️ 服务层 (services/)
│   │   ├── PM2Service.ts        # PM2 进程管理服务
│   │   ├── PM2ProjectRunner.ts  # PM2 项目运行器
│   │   ├── FileSystemService.ts # 文件系统操作服务
│   │   ├── RendererFileSystemService.ts # 渲染进程文件系统服务
│   │   ├── ProjectService.ts    # 项目管理服务
│   │   ├── ProjectRunner.ts     # 项目运行器
│   │   ├── PortService.ts       # 端口管理服务
│   │   ├── LoggerService.ts     # 日志服务
│   │   ├── RendererLoggerService.ts # 渲染进程日志服务
│   │   ├── SettingsService.ts   # 设置管理服务
│   │   ├── i18n.ts             # 国际化服务 🆕
│   │   ├── i18n_comprehensive.ts # 完整国际化实现 🆕
│   │   ├── i18n_new.ts         # 新国际化实现
│   │   └── i18n.ts.backup      # 国际化备份文件
│   │
│   ├── 🔄 IPC通信 (ipc/)
│   │   ├── pm2IPC.ts           # PM2 主进程处理器
│   │   ├── fileSystemIPC.ts    # 文件系统处理器
│   │   ├── loggerIPC.ts        # 日志处理器
│   │   ├── settingsIPC.ts      # 设置处理器
│   │   ├── portIPC.ts          # 端口处理器
│   │   └── portIPC.cjs         # 端口处理器 (CommonJS)
│   │
│   ├── 🗃️ 状态管理 (store/)
│   │   ├── AppContext.tsx      # 全局应用状态 (含国际化) 🆕
│   │   └── ToastContext.tsx    # 通知系统
│   │
│   ├── 📝 类型定义 (types/)
│   │   └── index.ts            # TypeScript 类型定义
│   │
│   ├── 🎨 资源文件 (assets/)
│   │   └── react.svg           # React 图标
│   │
│   └── 🔧 预加载脚本 (preload/)
│       └── preload.js          # Electron 预加载脚本
│
├── 📊 监控与日志
│   ├── logs-monitor/           # 日志监控目录
│   │   ├── frontend-inject.js  # 前端注入脚本
│   │   ├── realtime.log       # 实时日志
│   │   └── smart-start.log    # 智能启动日志
│   ├── console-monitor.js      # 控制台监控
│   ├── auto-log-monitor.sh     # 自动日志监控脚本
│   └── view-logs.sh           # 日志查看脚本
│
├── 💾 数据存储 (temp/)
│   ├── projects.json           # 项目配置数据
│   └── projects.backup.json   # 项目配置备份
│
├── 📦 项目模板 (templates/)
│   ├── pure-api/               # 纯API项目模板
│   │   ├── package.json        # 依赖配置
│   │   ├── src/app.js         # 应用入口
│   │   ├── tests/app.test.js  # 测试文件
│   │   ├── .env               # 环境变量
│   │   ├── .eslintrc.cjs      # ESLint 配置
│   │   ├── .prettierrc.cjs    # Prettier 配置
│   │   ├── jest.config.js     # Jest 配置
│   │   └── README.md          # 说明文档
│   │
│   ├── static-app/             # 静态应用模板
│   │   ├── package.json        # 依赖配置
│   │   ├── src/app.js         # 应用入口
│   │   ├── public/            # 静态资源
│   │   │   ├── index.html     # 主页面
│   │   │   ├── css/style.css  # 样式文件
│   │   │   └── js/main.js     # 主脚本
│   │   ├── tests/app.test.js  # 测试文件
│   │   └── [配置文件...]       # 其他配置文件
│   │
│   └── full-stack/             # 全栈应用模板
│       ├── package.json        # 依赖配置
│       ├── src/main.ts        # 前端入口
│       ├── src/style.css      # 前端样式
│       ├── server/src/app.ts  # 后端入口
│       ├── server/tsconfig.json # 后端 TypeScript 配置
│       ├── index.html         # 主页面
│       ├── vite.config.ts     # Vite 配置
│       ├── __tests__/app.test.ts # 测试文件
│       └── [配置文件...]       # 其他配置文件
│
├── 🧪 测试文件
│   ├── test/                   # 测试目录
│   ├── test0/                  # 测试目录0
│   ├── test-*.sh              # 各种测试脚本
│   ├── test-*.js              # JavaScript 测试文件
│   └── presdk2/               # 预SDK测试目录
│
├── 📚 文档
│   ├── README.md               # 项目说明文档
│   ├── PROJECT_GUIDE.md        # 详细使用指南
│   ├── I18N_FEATURE_UPDATE.md  # 国际化功能文档 🆕
│   ├── FEATURE_COMPLETION_REPORT.md # 功能完成报告
│   ├── LOGGING_SYSTEM_GUIDE.md # 日志系统指南
│   ├── PM2_INTEGRATION_REPORT.md # PM2集成报告
│   ├── TEMPLATE_REDESIGN_COMPLETION.md # 模板重设计文档
│   ├── COMPLETION_SUMMARY.md   # 完成总结
│   ├── MIGRATION_TEST.md       # 迁移测试文档
│   ├── ARCHITECTURE_EXPLANATION.md # 架构说明
│   ├── AUTO_LOG_MONITOR_GUIDE.md # 自动日志监控指南
│   └── CHANGELOG.md            # 更新日志 🆕
│
└── 📦 构建输出
    └── dist/                   # 构建产物目录
```

### 🏗️ 架构层次说明

#### 1. **前端架构 (Frontend)**
```
React App (Vite + TypeScript)
├── 📱 UI组件层 - components/
├── 🔗 业务逻辑层 - hooks/
├── 🗃️ 状态管理层 - store/
└── 🌍 国际化层 - services/i18n.ts
```

#### 2. **服务层架构 (Services)**
```
核心服务层
├── 🚀 项目管理 - ProjectService + PM2Service
├── 📁 文件系统 - FileSystemService
├── 📊 日志系统 - LoggerService
├── ⚙️ 设置管理 - SettingsService
├── 🔌 端口管理 - PortService
└── 🌍 国际化 - i18n Service
```

#### 3. **进程通信架构 (IPC)**
```
Electron IPC 通信
├── 🔄 主进程处理器 - ipc/*.ts
├── 🔧 预加载脚本 - preload/preload.js
└── 📱 渲染进程服务 - services/Renderer*.ts
```

#### 4. **数据流架构**
```
数据流向
User Action → Component → Hook → Service → IPC → Main Process
     ↓           ↓         ↓       ↓       ↓         ↓
  UI Update ← State ← Hook ← Service ← IPC ← Main Process
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **操作系统**: macOS, Windows, Linux

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd NodeAppManager/NodeAppManager

# 安装依赖
npm install

# 安装 PM2（如果尚未安装）
npm install -g pm2
```

### 📚 应用启动方式

Node App Manager 提供了两种启动方式，分别适用于不同的使用场景：

## 🧪 测试环境 - start-dev.sh

### 使用场景
- **首次启动项目**
- **开发调试阶段**  
- **环境可能不稳定**
- **需要完整的环境初始化**

### 启动命令
```bash
# 给脚本执行权限（首次需要）
chmod +x start-dev.sh

# 启动测试环境
./start-dev.sh
```

### 🔧 测试环境功能特性

#### 📋 完整的启动流程
1. **🧹 环境清理**
   - 自动清理残留的 node/electron 进程
   - 检查并清理端口占用（9966、9967）
   - 确保环境干净，避免冲突

2. **📦 依赖检查与安装**
   - 检查 `node_modules` 目录是否存在
   - 如不存在则自动执行 `npm install`
   - 确保所有依赖包正确安装

3. **⚡ 主进程编译**
   - 执行 `npm run electron:compile`
   - 将 TypeScript 编译为 CommonJS 格式
   - 自动修复模块路径引用

4. **🔥 服务启动**
   - 启动 Vite 开发服务器（端口 9966）
   - 启动 Electron 桌面应用
   - 建立 HMR WebSocket 连接（端口 9967）

#### 🌟 开发特性
- **🔥 热模块替换 (HMR)** - React 组件实时更新
- **🎨 样式实时更新** - TailwindCSS 修改立即生效
- **🔧 TypeScript 实时编译** - 类型检查和代码转换
- **🐛 开发工具支持** - 集成 Electron DevTools
- **📊 PM2 进程管理** - 完整的项目生命周期管理
- **📋 实时日志显示** - 左侧栏显示项目运行状态

#### 💡 适用场景
- ✅ **首次启动** - 自动处理所有初始化工作
- ✅ **开发调试** - 提供完整的开发工具支持
- ✅ **环境问题排查** - 详细的步骤输出便于定位问题
- ✅ **依赖更新后** - 自动重新安装和编译

---

## 🚀 生产环境 - run.sh

### 使用场景
- **环境已经稳定**
- **快速启动需求**
- **生产预览模式**
- **性能优先场景**

### 启动命令
```bash
# 给脚本执行权限（首次需要）
chmod +x run.sh

# 启动生产环境
./run.sh
```

### ⚡ 生产环境功能特性

#### 🚀 高效启动流程
1. **🎯 智能进程管理**
   - 注册信号处理函数（SIGINT/SIGTERM）
   - 优雅的进程清理机制
   - 避免僵尸进程问题

2. **⚡ 快速启动**
   - 直接执行 `npm run electron:dev`
   - 跳过依赖检查（假设环境已就绪）
   - 跳过端口清理（提升启动速度）

3. **🔧 精简特性支持**
   - Vite 热更新 (HMR)
   - React Fast Refresh
   - TypeScript 实时编译
   - TailwindCSS 实时样式更新
   - Electron 开发者工具

#### 🌟 性能优势
- **⚡ 启动速度快** - 减少不必要的检查步骤
- **🎯 资源占用低** - 精简的启动流程
- **🛡️ 稳定性高** - 假设环境已优化配置
- **🔄 自动恢复** - 优雅的错误处理机制

#### 💡 适用场景
- ✅ **快速启动** - 环境稳定时的快速启动
- ✅ **生产预览** - 类生产环境的预览模式
- ✅ **性能测试** - 减少启动开销的性能测试
- ✅ **稳定环境** - 已经过充分测试的稳定环境

---

## ⚖️ 两种方式对比

| 特性 | 🧪 测试环境 (start-dev.sh) | 🚀 生产环境 (run.sh) |
|------|---------------------------|---------------------|
| **启动速度** | 慢（完整初始化） | 快（精简流程） |
| **环境检查** | ✅ 完整检查 | ❌ 跳过检查 |
| **依赖处理** | ✅ 自动安装 | ❌ 假设已安装 |
| **进程清理** | ✅ 详细清理 | ✅ 智能清理 |
| **错误处理** | ✅ 详细提示 | ✅ 优雅处理 |
| **适用场景** | 开发调试、首次启动 | 快速启动、稳定环境 |
| **资源消耗** | 高（完整检查） | 低（精简流程） |

## 🎯 选择建议

### 推荐使用 start-dev.sh 的情况：
- 🆕 **首次使用项目**
- 🔧 **开发调试阶段**
- 📦 **更新依赖后**
- 🐛 **遇到启动问题**
- 🧪 **不确定环境状态**

### 推荐使用 run.sh 的情况：
- ⚡ **需要快速启动**
- 🏆 **环境已经稳定**
- 🚀 **生产预览测试**
- 💪 **性能优先场景**
- 🔄 **频繁重启应用**

## 🛑 停止服务

无论使用哪种启动方式，都可以通过以下方式停止服务：

```bash
# 在终端中按下
Ctrl + C
```

系统会自动清理相关进程，确保干净的退出。
   - React Fast Refresh
   - TypeScript 实时编译
   - TailwindCSS 实时样式更新
   - Electron 开发者工具

**生产模式优势：**
- ⚡ 更快的启动速度
- 🎯 专注于应用运行
- 🛡️ 优化的进程管理
- 🔄 支持优雅退出

#### 手动启动方式

```bash
# 仅启动 Electron 开发模式
npm run electron:dev

# 构建前端并启动 Electron
npm run electron:build

# 仅构建前端
npm run build

# 编译主进程 TypeScript
npm run electron:compile
```

## 💻 功能使用

### 1. 项目导入
1. 点击右上角 **"Import Project"** 按钮
2. 选择包含 `package.json` 的 Node.js 项目文件夹
3. 系统自动检测项目类型和配置
4. 项目将出现在项目列表中

### 2. 创建新项目
1. 点击 **"Create New"** 按钮
2. 选择项目模板（Express 或 Vite+Express）
3. 输入项目名称和路径
4. 系统自动生成项目结构

### 3. 项目管理
- **启动**: 点击项目卡片的 **"Start"** 按钮
- **停止**: 点击 **"Stop"** 按钮
- **查看日志**: 点击 **"Logs"** 按钮，左侧栏将显示实时日志
- **删除**: 点击 🗑️ 图标（仅从列表移除，不删除文件）

### 4. 实时监控
- **状态指示**: 绿色●表示运行中，灰色●表示已停止
- **端口信息**: 显示项目运行端口
- **日志查看**: 左侧栏实时显示项目输出
- **快速访问**: 点击日志中的 URL 直接打开浏览器

### 5. 语言切换 🆕
- **切换界面语言**: 进入 Settings → 通用设置 → 语言
- **支持语言**: 中文（简体）/ English
- **实时切换**: 语言更改立即生效，无需重启应用
- **全面覆盖**: 所有界面文本、错误消息、状态提示均支持双语

### 6. 导航功能
- **Projects**: 查看和管理所有项目
- **Settings**: 应用设置和系统信息

## 🔧 配置说明

### 项目数据存储
项目信息存储在 `temp/projects.json` 文件中：

```json
{
  "projects": [
    {
      "id": "unique-id",
      "name": "项目名称",
      "path": "/path/to/project",
      "type": "express",
      "packageManager": "npm",
      "port": 3000,
      "status": "stopped",
      "lastOpened": "2025-05-27T08:30:00.000Z"
    }
  ]
}
```

### 支持的项目类型
- **Express**: 传统 Express.js 服务器
- **Vite**: 基于 Vite 的现代前端项目
- **Next.js**: 全栈 React 框架（规划中）
- **Nest.js**: 企业级 Node.js 框架（规划中）

### 端口自动分配
系统会自动为项目分配端口：
- Express 项目: 3000-3099
- Vite 项目: 5173-5199
- 其他项目: 8000-8099

## 🛠️ 开发指南

### 添加新功能

1. **组件开发**: 在 `src/components/` 下创建新组件
2. **服务层**: 在 `src/services/` 下添加业务逻辑
3. **状态管理**: 使用 `AppContext` 管理全局状态
4. **类型定义**: 在 `src/types/` 下添加 TypeScript 类型

### IPC 通信模式

```typescript
// 渲染进程调用主进程
const result = await window.electronAPI.pm2.startProject(project);

// 主进程处理器
ipcMain.handle('pm2:start-project', async (event, project) => {
  // 处理逻辑
  return { success: true, processId: 123 };
});
```

### 添加新的项目模板

1. 在 `templates/` 下创建模板文件夹
2. 添加完整的项目结构
3. 在 `CreateProjectModal.tsx` 中添加模板选项
4. 更新项目创建逻辑

## 🐛 故障排除

### 日志查看

- **应用日志**: 左侧栏实时显示项目运行日志
- **PM2 日志**: 通过PM2集成查看进程管理日志
- **开发日志**: 浏览器开发者工具 (Cmd+Option+I)
- **系统日志**: 终端输出的启动和错误信息

### 调试技巧

**前端调试：**
- 在 Electron 窗口中按 `Cmd+Option+I` 打开开发者工具
- 使用 React Developer Tools 检查组件状态
- 查看控制台输出和网络请求

**主进程调试：**
- 查看终端输出的 Electron 主进程日志
- 使用 `console.log` 在主进程代码中输出调试信息
- 检查 IPC 通信的请求和响应

**项目启动问题：**
- 确认项目包含有效的 `package.json` 文件
- 检查项目的 `start` 脚本是否正确配置
- 查看左侧栏的错误日志了解具体问题
- 确认项目依赖已正确安装 (`npm install`)

**性能优化：**
- 使用 PM2 监控项目的 CPU 和内存使用
- 查看项目日志识别性能瓶颈
- 合理配置项目的启动参数

## 📋 待办功能

- [ ] 项目模板商店
- [ ] 环境变量管理
- [ ] Docker 集成
- [ ] 性能监控图表
- [ ] 项目依赖分析
- [ ] 自动化部署
- [ ] 多语言支持

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

- **开发者** - 项目创建和维护

---

**Node App Manager** - 让 Node.js 项目管理变得简单高效！

如需更多帮助，请查看 [issues](../../issues) 或联系开发团队。

## 📝 日志系统

Node App Manager 实现了完整的日志持久化系统，详见 **[日志系统设计文档](./LOGGING_SYSTEM_GUIDE.md)**。

### 🎯 设计原则

**为什么不使用 PM2 管理 Node App Manager 本身？**

- ❌ **架构冲突**: Electron 桌面应用 vs PM2 服务器进程管理
- ❌ **场景不匹配**: 用户手动启动 vs 24/7 自动重启  
- ❌ **复杂性增加**: 不必要的配置开销

**✅ 推荐方案:**
- **开发**: 使用现有的 `start-dev.sh` / `run.sh`
- **生产**: `electron-builder` 打包 + 系统级自启动（可选）

### 📁 日志架构

```
应用日志存储位置:
• macOS: ~/Library/Application Support/NodeHub Pro/logs/
• Windows: %APPDATA%/NodeHub Pro/logs/  
• Linux: ~/.config/NodeHub Pro/logs/

日志层级:
• 主进程 (LoggerService) - Electron 生命周期
• 渲染进程 (RendererLoggerService) - 用户操作
• 项目日志 (PM2ProjectRunner) - 被管理项目
```

### 🔧 核心组件

| 组件 | 文件位置 | 功能 |
|------|----------|------|
| **LoggerService** | `src/services/LoggerService.ts` | 主进程日志服务 |
| **RendererLoggerService** | `src/services/RendererLoggerService.ts` | 渲染进程日志服务 |
| **LoggerIPC** | `src/ipc/loggerIPC.ts` | IPC 通信处理器 |

### 📊 使用示例

```typescript
// 渲染进程中使用
import { RendererLoggerService } from '../services/RendererLoggerService';

const handleProjectStart = async (projectId: string) => {
  try {
    await RendererLoggerService.info('启动项目', { projectId });
    // 项目启动逻辑...
  } catch (error) {
    await RendererLoggerService.error('项目启动失败', error);
  }
};
```

> 📖 **完整文档**: [LOGGING_SYSTEM_GUIDE.md](./LOGGING_SYSTEM_GUIDE.md)
