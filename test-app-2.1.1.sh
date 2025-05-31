#!/bin/bash

# Node App Manager 2.1.1 测试脚本
# 测试修复后的功能

echo "🚀 Node App Manager 2.1.1 功能测试"
echo "=================================="

# 检测系统架构
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    APP_PATH="./release/mac-arm64/Node App Manager.app"
    DMG_PATH="./release/Node App Manager-2.1.1-arm64.dmg"
else
    APP_PATH="./release/mac/Node App Manager.app"
    DMG_PATH="./release/Node App Manager-2.1.1.dmg"
fi

echo "📋 检测到架构: $ARCH"
echo "📱 应用路径: $APP_PATH"

# 检查应用是否存在
if [ -d "$APP_PATH" ]; then
    echo "✅ 应用程序已构建完成"
else
    echo "❌ 应用程序未找到，请先运行 npm run build:mac"
    exit 1
fi

echo ""
echo "🧪 开始功能测试..."
echo ""

# 检查版本信息
echo "📦 版本信息:"
plutil -p "$APP_PATH/Contents/Info.plist" | grep -E "(CFBundleShortVersionString|CFBundleVersion|CFBundleIdentifier)"

echo ""
echo "🔑 权限和签名状态:"
codesign -dv --verbose=4 "$APP_PATH" 2>&1 | head -10

echo ""
echo "📋 应用元数据:"
echo "  - Bundle ID: $(plutil -extract CFBundleIdentifier raw "$APP_PATH/Contents/Info.plist")"
echo "  - 应用名称: $(plutil -extract CFBundleDisplayName raw "$APP_PATH/Contents/Info.plist" 2>/dev/null || echo "Node App Manager")"
echo "  - 版本号: $(plutil -extract CFBundleShortVersionString raw "$APP_PATH/Contents/Info.plist")"

echo ""
echo "🛡️ 权限文件检查:"
if [ -f "$APP_PATH/Contents/MacOS/Node App Manager.entitlements" ]; then
    echo "✅ 发现权限文件"
else
    echo "⚠️  权限文件未找到，检查主可执行文件"
fi

echo ""
echo "🔍 主要修复内容:"
echo "  1. ✅ 修复了i18n国际化初始化问题"
echo "  2. ✅ 添加了文件对话框IPC处理程序"
echo "  3. ✅ 实现了shell操作(打开文件夹、编辑器、浏览器)"
echo "  4. ✅ 更新了macOS权限配置"
echo "  5. ✅ 版本更新至2.1.1"

echo ""
echo "🚀 启动应用程序进行测试..."
echo "   请在应用中测试以下功能:"
echo "   - 语言显示是否统一为中文"
echo "   - 导入项目功能是否正常工作"
echo "   - 快速操作按钮(打开文件夹、编辑器、浏览器)是否正常"
echo ""

# 启动应用
open "$APP_PATH"

echo "✅ 应用已启动，请进行功能测试"
echo ""
echo "💡 测试提示:"
echo "  1. 检查界面语言是否统一为中文"
echo "  2. 尝试导入一个Node.js项目"
echo "  3. 测试项目的快速操作按钮"
echo "  4. 查看是否有错误提示"
echo ""
echo "📝 如果发现问题，请查看控制台输出或应用日志"
