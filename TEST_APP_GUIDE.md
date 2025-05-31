# 🧪 应用测试指南

## 📱 如何打开打包好的应用

### 方法一：使用 DMG 文件（推荐）

1. **选择合适的版本**：
   - 如果您使用 **Apple Silicon Mac**（M1/M2/M3）：使用 `Node App Manager-2.1.0-arm64.dmg`
   - 如果您使用 **Intel Mac**：使用 `Node App Manager-2.1.0.dmg`

2. **安装步骤**：
   ```bash
   # 在项目目录中
   cd release/
   
   # 打开 DMG 文件（根据您的 Mac 类型选择）
   open "Node App Manager-2.1.0-arm64.dmg"  # Apple Silicon
   # 或
   open "Node App Manager-2.1.0.dmg"        # Intel Mac
   ```

3. **拖拽安装**：
   - DMG 文件会自动挂载并打开
   - 将 "Node App Manager" 应用拖拽到 "Applications" 文件夹
   - 在启动台或应用程序文件夹中找到应用

### 方法二：使用 ZIP 文件（便携版）

```bash
# 在项目目录中
cd release/

# 解压 ZIP 文件（根据您的 Mac 类型选择）
unzip "Node App Manager-2.1.0-arm64-mac.zip"  # Apple Silicon
# 或
unzip "Node App Manager-2.1.0-mac.zip"        # Intel Mac

# 进入解压后的目录
cd mac/  # 或 mac-arm64/

# 直接运行应用
open "Node App Manager.app"
```

### 方法三：命令行快速测试

```bash
# 在项目目录中，直接测试 ARM64 版本
cd release/ && unzip -q "Node App Manager-2.1.0-arm64-mac.zip" && open mac-arm64/"Node App Manager.app"

# 或测试 Intel 版本
cd release/ && unzip -q "Node App Manager-2.1.0-mac.zip" && open mac/"Node App Manager.app"
```

## ⚠️ 首次运行可能遇到的问题

### 1. 安全警告
**问题**：macOS 显示 "无法打开，因为无法验证开发者"

**解决方法**：
1. 右键点击应用图标
2. 选择 "打开"
3. 在弹出的对话框中点击 "打开"
4. 应用将被添加到安全例外列表中

### 2. 权限请求
**问题**：应用请求访问文件夹权限

**解决方法**：
- 点击 "允许" 或 "OK"
- 这些权限是管理 Node.js 项目所必需的

### 3. 网络权限
**问题**：防火墙询问是否允许网络访问

**解决方法**：
- 选择 "允许"
- 这是为了端口检测和项目服务功能

## 🧪 测试功能清单

### 基础功能测试
- [ ] 应用能正常启动
- [ ] 界面显示正常
- [ ] 语言切换功能（右上角设置）
- [ ] 主页项目列表显示

### 项目管理测试
- [ ] 导入现有项目
- [ ] 创建新项目（基于模板）
- [ ] 项目启动/停止
- [ ] 实时日志查看

### 高级功能测试
- [ ] PM2 进程管理
- [ ] 端口自动检测
- [ ] 项目设置修改
- [ ] 错误处理和提示

## 🔧 测试用的快速命令

```bash
# 快速解压并运行（适合 Apple Silicon Mac）
cd /Users/vidar/works/NodeAppManager/release && \\
unzip -o "Node App Manager-2.1.0-arm64-mac.zip" && \\
open mac-arm64/"Node App Manager.app"

# 如果是 Intel Mac，使用这个命令
cd /Users/vidar/works/NodeAppManager/release && \\
unzip -o "Node App Manager-2.1.0-mac.zip" && \\
open mac/"Node App Manager.app"
```

## 📝 测试反馈

测试完成后，请记录：
1. **启动是否正常**
2. **功能是否可用**
3. **发现的问题**
4. **性能表现**

这将帮助我们确定是否需要修复问题再重新打包正式版本。

---

**提示**：如果遇到任何问题，可以查看终端输出或者重新运行开发版本进行对比测试。
