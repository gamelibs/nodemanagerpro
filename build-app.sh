#!/bin/bash

# Node App Manager 打包脚本
# 支持 macOS 和 Windows 平台打包

set -e

echo "🚀 Node App Manager 打包工具"
echo "============================="

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 清理之前的构建
echo ""
echo "🧹 清理之前的构建文件..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "   已删除 dist 目录"
fi

if [ -d "release" ]; then
    rm -rf release
    echo "   已删除 release 目录"
fi

# 安装依赖
echo ""
echo "📦 检查并安装依赖..."
npm install

# 构建前端和 Electron 主进程
echo ""
echo "🔨 构建应用..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"

# 显示打包选项
echo ""
echo "📱 选择打包平台:"
echo "1) macOS (推荐在 Mac 上运行)"
echo "2) Windows (可在 Mac 上交叉编译)"
echo "3) 全平台 (macOS + Windows)"
echo "4) 仅构建，不打包"

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🍎 开始打包 macOS 版本..."
        npm run build:mac
        ;;
    2)
        echo ""
        echo "🪟 开始打包 Windows 版本..."
        npm run build:win
        ;;
    3)
        echo ""
        echo "🌍 开始打包全平台版本..."
        npm run build:all
        ;;
    4)
        echo ""
        echo "✅ 仅构建完成，跳过打包"
        echo "💡 您可以稍后运行以下命令进行打包:"
        echo "   npm run build:mac    # 打包 macOS"
        echo "   npm run build:win    # 打包 Windows"
        echo "   npm run build:all    # 打包全平台"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 打包完成！"
    echo ""
    echo "📁 输出目录: $(pwd)/release"
    echo "📋 包含文件:"
    ls -la release/ 2>/dev/null || echo "   (release 目录为空或不存在)"
    echo ""
    echo "💡 使用建议:"
    echo "   - macOS: 拖拽 .dmg 文件进行安装"
    echo "   - Windows: 运行 .exe 安装程序"
    echo "   - 便携版: 直接运行 portable 版本"
else
    echo ""
    echo "❌ 打包失败"
    echo "💡 常见问题解决:"
    echo "   1. 确保网络连接正常"
    echo "   2. 检查磁盘空间是否充足"
    echo "   3. 在 Mac 上打包 Windows 版本需要额外工具"
    exit 1
fi
