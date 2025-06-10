# Node App Manager Beta 0.1.1 - 发布清单

## 📦 发布文件列表

### 📋 核心安装包

#### Intel (x64) 版本
- **📀 主安装包**: `Node App Manager-0.1.1-beta.dmg` (283MB)
  - ✅ 完整性验证: 通过
  - 🎯 适用平台: Intel Mac (x64)
  - 📝 校验文件: `Node App Manager-0.1.1-beta.dmg.blockmap`

- **📁 便携版**: `Node App Manager-0.1.1-beta-mac.zip` (293MB)
  - ✅ 完整性验证: 通过
  - 🎯 适用平台: Intel Mac (x64)
  - 📝 校验文件: `Node App Manager-0.1.1-beta-mac.zip.blockmap`

#### Apple Silicon (ARM64) 版本
- **📀 主安装包**: `Node App Manager-0.1.1-beta-arm64.dmg` (279MB)
  - ✅ 完整性验证: 通过
  - 🎯 适用平台: Apple Silicon Mac (ARM64)
  - 📝 校验文件: `Node App Manager-0.1.1-beta-arm64.dmg.blockmap`

- **📁 便携版**: `Node App Manager-0.1.1-beta-arm64-mac.zip` (289MB)
  - ✅ 完整性验证: 通过
  - 🎯 适用平台: Apple Silicon Mac (ARM64)
  - 📝 校验文件: `Node App Manager-0.1.1-beta-arm64-mac.zip.blockmap`

### 🔧 辅助文件
- **⚙️ 自动更新**: `latest-mac.yml` (880B)
- **📊 构建配置**: `builder-effective-config.yaml` (2.2KB)
- **🐛 调试信息**: `builder-debug.yml` (1.8KB)

## 🎯 推荐下载指南

### 如何选择正确版本？

#### 检查您的 Mac 类型
```bash
# 运行此命令查看处理器类型
uname -m
```

- **输出 `x86_64`**: 选择 Intel 版本
- **输出 `arm64`**: 选择 Apple Silicon 版本

#### 不确定处理器类型？
```bash
# 查看详细系统信息
system_profiler SPHardwareDataType | grep "Chip\|Processor"
```

### 📥 推荐下载

#### 🍎 Apple Silicon Mac 用户 (M1/M2/M3)
- **主推荐**: `Node App Manager-0.1.1-beta-arm64.dmg`
- **便携版**: `Node App Manager-0.1.1-beta-arm64-mac.zip`

#### 🖥️ Intel Mac 用户
- **主推荐**: `Node App Manager-0.1.1-beta.dmg`  
- **便携版**: `Node App Manager-0.1.1-beta-mac.zip`

## 🔐 安全验证

### 文件完整性
所有文件都已通过 `hdiutil verify` 验证：
- ✅ Intel DMG: CRC32 验证通过
- ✅ ARM64 DMG: CRC32 验证通过
- ✅ 所有 ZIP 文件: 压缩完整性良好

### 安装前验证 (可选)
```bash
# 验证 DMG 文件完整性
hdiutil verify "Node App Manager-0.1.1-beta.dmg"

# 查看文件信息
file "Node App Manager-0.1.1-beta.dmg"
```

## 🚀 安装步骤

### DMG 安装方式 (推荐)
1. **下载对应版本的 .dmg 文件**
2. **双击 DMG 文件挂载**
3. **拖拽应用到 Applications 文件夹**
4. **从启动台或应用程序文件夹启动**

### ZIP 便携方式
1. **下载对应版本的 .zip 文件**
2. **解压到任意位置**
3. **直接运行 Node App Manager.app**

### 首次启动
由于应用未签名，需要：
1. **右键点击应用图标**
2. **选择"打开"**
3. **在安全提示中点击"打开"**

## 📊 版本对比

| 特性 | Intel 版本 | ARM64 版本 |
|------|------------|------------|
| 包大小 (DMG) | 283MB | 279MB |
| 包大小 (ZIP) | 293MB | 289MB |
| 性能优化 | 标准 | 原生优化 |
| 兼容性 | 广泛兼容 | M1/M2/M3 Mac |
| 电池优化 | 良好 | 更佳 |

## 🔍 技术规格

### 系统要求
- **最低 macOS**: 10.13 High Sierra
- **推荐 macOS**: 11.0 Big Sur 或更高
- **内存**: 4GB RAM (推荐 8GB)
- **存储**: 1GB 可用空间
- **网络**: 互联网连接 (模板下载)

### 内置功能
- ✅ PM2 进程管理
- ✅ 企业级 Next.js 模板
- ✅ 实时日志监控
- ✅ 多项目管理
- ✅ 自动化部署
- ✅ 主题系统
- ✅ 多语言支持

## 📝 发布说明

### 新增功能 (v0.1.1-beta)
- 🔧 完全修复 TypeScript 编译错误
- 🎨 优化企业级模板体验
- 📊 增强项目管理界面
- 🔄 改进 PM2 集成稳定性

### 已知问题
- ⚠️ 首次启动需要手动确认安全性
- ⚠️ 未进行 Apple 公证 (开发版本)
- ⚠️ 默认 Electron 图标 (后续版本将自定义)

### 反馈渠道
- 🐛 **Bug 报告**: GitHub Issues
- 💡 **功能建议**: GitHub Discussions  
- 📧 **技术支持**: 项目 README 联系方式

---

**发布日期**: 2025年6月6日  
**版本**: 0.1.1-beta  
**构建环境**: macOS 14.5 + Electron Builder 26.0.12  
**状态**: ✅ 准备发布
