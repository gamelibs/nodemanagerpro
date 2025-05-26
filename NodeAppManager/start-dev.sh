#!/bin/zsh

# NodeAppManager 完整开发环境启动脚本
cd "$(dirname "$0")"

echo "🚀 NodeAppManager 开发环境启动"
echo "═══════════════════════════════════════"
echo "📦 技术栈: Electron + React + Vite + TypeScript"
echo "🌐 服务端口: 9966 (Vite) + 9967 (HMR)"
echo "🔥 支持功能: 热模块替换 (HMR) + 实时重载"
echo ""

# 清理可能残留的进程
echo "🧹 清理残留进程..."
pkill -f "node.*vite" 2>/dev/null || true
pkill -f "electron" 2>/dev/null || true
sleep 1

# 清理端口占用
if lsof -i :9966 >/dev/null 2>&1; then
    echo "⚠️  端口 9966 被占用，正在清理..."
    lsof -ti :9966 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -i :9967 >/dev/null 2>&1; then
    echo "⚠️  端口 9967 被占用，正在清理..."
    lsof -ti :9967 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    echo ""
fi

# 预编译 Electron 主进程
echo "⚡ 预编译 Electron 主进程..."
npm run electron:compile

echo ""
echo "🔥 启动开发环境..."
echo "📝 提示:"
echo "   • Vite 服务器启动后会自动打开 Electron 窗口"
echo "   • 修改 React 组件代码会实时更新"
echo "   • 按 Cmd+R 或 Ctrl+R 可手动刷新"
echo "   • 按 Ctrl+C 停止所有服务"
echo ""

# 启动开发服务
npm run electron:dev
