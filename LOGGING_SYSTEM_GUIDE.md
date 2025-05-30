# Node App Manager 日志系统设计文档 📝

> Node App Manager 完整的日志持久化解决方案

## 📋 概述

Node App Manager 采用分层的日志架构，为桌面应用提供完整的日志持久化功能，包括主进程日志、渲染进程日志以及被管理项目的日志。

## 🏗️ 架构设计

### 日志系统层级

```
┌─────────────────────────────────────────┐
│            用户界面层                    │
│  • Sidebar 日志显示                      │
│  • 日志查看器组件                        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│          渲染进程日志层                  │
│  • RendererLoggerService                │
│  • 组件级日志记录                        │
│  • 用户操作日志                          │
└─────────────────────────────────────────┘
                    │ IPC 通信
┌─────────────────────────────────────────┐
│           主进程日志层                   │
│  • LoggerService                        │
│  • Electron 生命周期日志                 │
│  • IPC 处理器日志                        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│           文件系统层                     │
│  • 按日期滚动的日志文件                  │
│  • 自动清理过期日志                      │
│  • JSON 格式结构化存储                   │
└─────────────────────────────────────────┘
```

## 🎯 为什么不使用 PM2 管理 Node App Manager？

### ❌ 不适合的原因

1. **架构冲突**
   - Node App Manager 是 **Electron 桌面应用**
   - PM2 设计用于 **Node.js 服务器进程**
   - 两者的进程管理模式根本不同

2. **使用场景不匹配**
   - 桌面应用：用户手动启动/关闭
   - 服务器应用：需要 24/7 自动重启
   - PM2 的优势在桌面环境下无法发挥

3. **复杂性增加**
   - 增加不必要的配置复杂度
   - 可能干扰 Electron 正常生命周期
   - 调试和错误排查变得困难

### ✅ 推荐方案

**开发阶段：**
- 使用现有的 `start-dev.sh` 和 `run.sh`
- 利用 Electron 内置的进程管理

**生产部署：**
- 使用 `electron-builder` 打包为安装包
- 系统级自启动（可选）：LaunchAgents(macOS) / Windows Service / systemd

## 📁 日志存储架构

### 存储位置

| 平台 | 日志目录 |
|------|----------|
| **macOS** | `~/Library/Application Support/NodeHub Pro/logs/` |
| **Windows** | `%APPDATA%/NodeHub Pro/logs/` |
| **Linux** | `~/.config/NodeHub Pro/logs/` |

### 文件命名规范

```
logs/
├── app-2025-05-28.log          # 应用主日志（按日期）
├── app-2025-05-27.log          # 前一天日志
├── app-2025-05-26.log          # 更早的日志
└── ...                         # 自动清理 30 天前的日志
```

### 日志格式

每条日志记录为 JSON 格式：

```json
{
  "timestamp": "2025-05-28T10:30:45.123Z",
  "level": "INFO",
  "message": "Electron 应用启动",
  "data": {
    "isDev": true,
    "url": "http://localhost:9966"
  }
}
```

## 🔧 核心组件

### 1. LoggerService (主进程)

**文件位置：** `src/services/LoggerService.ts`

**主要功能：**
- 日志文件的写入和管理
- 按日期自动滚动日志文件
- 自动清理过期日志（默认 30 天）
- 支持多种日志级别（INFO, WARN, ERROR, DEBUG）

**核心方法：**
```typescript
// 记录不同级别的日志
LoggerService.info(message, data?)
LoggerService.warn(message, data?)
LoggerService.error(message, error?)
LoggerService.debug(message, data?)

// 文件管理
LoggerService.getLogDirectory()
LoggerService.getRecentLogFiles(days)
LoggerService.readLogFile(filePath)
```

### 2. RendererLoggerService (渲染进程)

**文件位置：** `src/services/RendererLoggerService.ts`

**主要功能：**
- 通过 IPC 与主进程 LoggerService 通信
- 提供与主进程一致的日志接口
- 同时输出到浏览器控制台和文件

**使用示例：**
```typescript
import { RendererLoggerService } from '../services/RendererLoggerService';

// 在 React 组件中使用
const handleProjectStart = async (projectId: string) => {
  try {
    await RendererLoggerService.info('启动项目', { projectId });
    // 启动逻辑...
    await RendererLoggerService.info('项目启动成功', { projectId });
  } catch (error) {
    await RendererLoggerService.error('项目启动失败', error);
  }
};
```

### 3. LoggerIPC (IPC 处理器)

**文件位置：** `src/ipc/loggerIPC.ts`

**主要功能：**
- 处理渲染进程的日志请求
- 提供日志文件查询接口
- 支持日志文件内容读取

**IPC 频道：**
```typescript
'logger:log'                // 记录日志
'logger:getLogDirectory'    // 获取日志目录
'logger:getRecentLogFiles'  // 获取最近日志文件
'logger:readLogFile'        // 读取日志文件内容
```

## 💻 集成到现有代码

### 主进程集成 (electron-main.ts)

```typescript
// 导入日志服务
const { LoggerService } = require('./src/services/LoggerService.cjs');
const { setupLoggerIPC } = require('./src/ipc/loggerIPC.cjs');

// 初始化日志服务
LoggerService.initialize();

// 应用生命周期日志
app.whenReady().then(() => {
  LoggerService.info('Electron 应用已准备就绪');
  setupLoggerIPC(); // 设置 IPC 处理器
  createWindow();
});

// 窗口创建日志
function createWindow() {
  LoggerService.info('开始创建主窗口');
  // 创建窗口逻辑...
  LoggerService.info('Electron 窗口显示完成');
}
```

### 渲染进程集成示例

```typescript
// 在 React 组件中使用
import { RendererLoggerService } from '../services/RendererLoggerService';

const ProjectCard = ({ project }: { project: Project }) => {
  const handleStart = async () => {
    try {
      await RendererLoggerService.info('用户点击启动项目', { 
        projectId: project.id, 
        projectName: project.name 
      });
      
      // 项目启动逻辑...
      
      await RendererLoggerService.info('项目启动成功', { 
        projectId: project.id 
      });
    } catch (error) {
      await RendererLoggerService.error('项目启动失败', {
        projectId: project.id,
        error: error.message
      });
    }
  };

  return (
    <button onClick={handleStart}>
      启动项目
    </button>
  );
};
```

## 🎛️ 配置选项

### 日志级别控制

```typescript
// 开发模式：记录所有级别
if (process.env.NODE_ENV === 'development') {
  LoggerService.debug('调试信息', debugData);
}

// 生产模式：仅记录 INFO 及以上级别
LoggerService.info('正常信息');
LoggerService.warn('警告信息');
LoggerService.error('错误信息');
```

### 自动清理配置

```typescript
// 修改日志保留天数（默认 30 天）
LoggerService.cleanOldLogs(7); // 保留 7 天
```

## 📊 日志分析和监控

### 日志查看

```typescript
// 获取最近 7 天的日志文件
const logFiles = await RendererLoggerService.getRecentLogFiles(7);

// 读取特定日志文件
const logEntries = await RendererLoggerService.readLogFile(logFiles[0]);

// 解析 JSON 格式的日志
const parsedLogs = logEntries.map(line => {
  try {
    return JSON.parse(line);
  } catch {
    return { raw: line }; // 处理非 JSON 格式的行
  }
});
```

### 错误统计

```typescript
// 统计错误日志
const errorLogs = parsedLogs.filter(log => log.level === 'ERROR');
console.log(`发现 ${errorLogs.length} 个错误`);
```

## 🔍 故障排查

### 常见问题

1. **日志文件未创建**
   - 检查应用是否有写入权限
   - 确认 `LoggerService.initialize()` 已调用

2. **渲染进程日志未记录**
   - 检查 IPC 频道是否正确设置
   - 确认 `setupLoggerIPC()` 已在主进程中调用

3. **日志文件过大**
   - 检查日志清理功能是否正常工作
   - 考虑减少日志记录频率

### 调试技巧

```typescript
// 检查日志目录
const logDir = await RendererLoggerService.getLogDirectory();
console.log('日志目录:', logDir);

// 检查最近的日志文件
const recentFiles = await RendererLoggerService.getRecentLogFiles(1);
console.log('最新日志文件:', recentFiles);
```

## 🚀 最佳实践

### 1. 日志级别使用指南

- **DEBUG**: 详细的调试信息（仅开发模式）
- **INFO**: 正常的程序流程信息
- **WARN**: 警告信息，程序可以继续运行
- **ERROR**: 错误信息，需要关注和处理

### 2. 结构化日志数据

```typescript
// ✅ 好的做法
LoggerService.info('项目启动', {
  projectId: project.id,
  projectName: project.name,
  port: project.port,
  startTime: new Date().toISOString()
});

// ❌ 避免的做法
LoggerService.info(`项目 ${project.name} 在端口 ${project.port} 启动`);
```

### 3. 错误日志记录

```typescript
// ✅ 包含完整的错误信息
try {
  // 操作...
} catch (error) {
  LoggerService.error('操作失败', {
    operation: 'startProject',
    projectId: project.id,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });
}
```

## 📈 性能考虑

### 异步写入
- 日志写入采用异步方式，不阻塞主线程
- 多个日志请求会自动排队处理

### 内存管理
- 日志服务不会在内存中缓存大量日志数据
- 自动清理过期文件，避免磁盘空间过度占用

### 频率控制
- 避免在循环中大量记录日志
- 考虑对高频事件进行采样记录

## 🔮 未来扩展

### 可能的增强功能

1. **日志级别动态配置**
   - 运行时修改日志级别
   - 基于环境变量的配置

2. **日志格式选项**
   - 支持纯文本格式
   - 自定义日志格式模板

3. **远程日志收集**
   - 集成到企业日志系统
   - 支持日志聚合服务

4. **性能监控集成**
   - 记录性能指标
   - 集成到现有监控系统

---

## 📝 总结

Node App Manager 的日志系统为桌面应用提供了企业级的日志持久化功能，通过合理的架构设计和组件分离，确保了系统的可维护性和扩展性。该方案避免了使用 PM2 管理桌面应用的复杂性，采用更适合 Electron 应用的原生解决方案。

**关键优势：**
- 🎯 **架构合理**: 适合 Electron 桌面应用
- 📁 **持久化存储**: 按日期滚动，自动清理
- 🔄 **双向通信**: 主进程和渲染进程完整覆盖
- 🛠️ **易于集成**: 最小化代码侵入
- 🔍 **便于调试**: 结构化日志格式
