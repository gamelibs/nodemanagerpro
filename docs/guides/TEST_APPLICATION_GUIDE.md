# Node App Manager 应用测试指南

## 🎯 测试目标
验证已打包的 Node App Manager 应用是否能正常运行和提供预期功能。

## 📦 已生成的应用包
- **macOS Intel (x64)**: `Node App Manager-2.1.0.dmg` 和 `.zip`
- **macOS Apple Silicon (ARM64)**: `Node App Manager-2.1.0-arm64.dmg` 和 `.zip`
- **当前运行中**: macOS ARM64 版本 (已启动并运行)

## ✅ 基础功能测试清单

### 1. 应用启动验证
- [x] 应用能够成功启动
- [x] 应用进程正常运行
- [ ] UI界面正常显示

### 2. 核心功能测试
请在应用中验证以下功能：

#### 项目管理功能
- [ ] 创建新的Node.js项目
- [ ] 导入现有项目
- [ ] 项目列表显示
- [ ] 项目信息编辑

#### 启动和运行功能
- [ ] 启动项目 (npm start/yarn start)
- [ ] 开发模式运行 (npm run dev)
- [ ] 停止运行中的项目
- [ ] 查看项目运行状态

#### 终端和日志功能
- [ ] 内置终端功能
- [ ] 实时日志显示
- [ ] 命令执行
- [ ] 错误信息显示

#### 模板功能
- [ ] 使用预设模板创建项目
- [ ] 模板选择界面
- [ ] 模板参数配置

### 3. 性能和稳定性测试
- [ ] 应用响应速度正常
- [ ] 内存使用合理
- [ ] 长时间运行稳定性
- [ ] 多项目同时管理

### 4. 系统集成测试
- [ ] 文件系统访问权限
- [ ] 网络连接功能
- [ ] 系统通知
- [ ] 应用菜单功能

## 🔧 常见问题排查

### 应用无法启动
```bash
# 检查应用权限
ls -la "/Users/vidar/works/NodeAppManager/release/mac-arm64/Node App Manager.app"

# 查看系统日志
console --predicate 'eventMessage contains "Node App Manager"' --info --last 5m
```

### 功能异常
```bash
# 检查应用进程
ps aux | grep -i "node app manager" | grep -v grep

# 查看应用数据目录
ls -la ~/Library/Application\ Support/Node\ App\ Manager/
```

## 📊 测试结果记录

### 环境信息
- **测试设备**: Apple Silicon Mac
- **macOS版本**: [填写]
- **应用版本**: 2.1.0 (ARM64)
- **测试时间**: [填写]

### 测试结果
| 功能模块 | 状态 | 备注 |
|---------|------|------|
| 应用启动 | ✅ 通过 | 进程正常运行 |
| UI显示 | [ ] | |
| 项目管理 | [ ] | |
| 启动运行 | [ ] | |
| 终端日志 | [ ] | |
| 模板功能 | [ ] | |
| 系统集成 | [ ] | |

### 发现的问题
- [记录遇到的问题]

### 改进建议
- [记录改进建议]

## 🚀 后续步骤

根据测试结果：

1. **如果功能正常**: 可以考虑：
   - 修改版本号为正式版本 (如 1.0.0)
   - 添加应用图标
   - 配置代码签名
   - 准备Windows版本

2. **如果有问题**: 需要：
   - 修复发现的问题
   - 重新打包测试
   - 验证修复效果

## 📋 快速测试命令

```bash
# 启动应用
open "/Users/vidar/works/NodeAppManager/release/mac-arm64/Node App Manager.app"

# 检查运行状态
ps aux | grep -i "node app manager" | grep -v grep

# 查看应用信息
/usr/bin/mdls "/Users/vidar/works/NodeAppManager/release/mac-arm64/Node App Manager.app"

# 关闭应用 (如需要)
pkill -f "Node App Manager"
```

---
**测试完成后，请填写测试结果并提供反馈，以便决定是否需要重新打包或进行其他调整。**
