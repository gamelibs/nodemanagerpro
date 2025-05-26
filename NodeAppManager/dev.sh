#!/bin/zsh

# 开发环境启动脚本
cd "$(dirname "$0")"

echo "🚀 启动 NodeAppManager 开发环境..."
echo "📦 模式: Electron + React + Vite + TypeScript"
echo "🌐 端口: 9966 (Vite) + 9967 (HMR)"
echo ""

# 检查端口是否被占用
if lsof -i :9966 >/dev/null 2>&1; then
    echo "⚠️  端口 9966 已被占用，正在终止占用进程..."
    lsof -ti :9966 | xargs kill -9 2>/dev/null
    sleep 2
fi

if lsof -i :9967 >/dev/null 2>&1; then
    echo "⚠️  端口 9967 已被占用，正在终止占用进程..."
    lsof -ti :9967 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发环境
echo "🔥 启动 Vite + Electron 开发环境..."
echo "⏳ 等待 Vite 服务启动后自动打开 Electron..."
npm run electron:dev
