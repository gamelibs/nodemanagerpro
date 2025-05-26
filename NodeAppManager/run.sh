#!/bin/zsh

# 进入项目目录
cd "$(dirname "$0")"

# 清理进程
cleanup() {
  echo "🧹 正在清理进程..."
  # 找到并杀死相关进程
  kill $(ps aux | grep '[n]ode.*vite' | awk '{print $2}') 2>/dev/null || true
  kill $(ps aux | grep '[e]lectron' | awk '{print $2}') 2>/dev/null || true
  kill $(ps aux | grep '[t]s-node' | awk '{print $2}') 2>/dev/null || true
  exit 0
}

# 注册清理函数
trap cleanup SIGINT SIGTERM

echo "🚀 正在启动 Electron + Vite 开发模式..."
echo "📝 特性说明："
echo "   ✅ Vite 热更新 (HMR)"
echo "   ✅ React Fast Refresh"
echo "   ✅ TypeScript 实时编译"
echo "   ✅ TailwindCSS 实时样式更新"
echo "   ✅ Electron 开发者工具"
echo ""
echo "🔧 使用方法："
echo "   - 修改前端代码会自动热更新"
echo "   - 修改 Electron 主进程代码需要重启应用"
echo "   - 按 Ctrl+C 退出开发模式"
echo ""

# 启动 Electron 开发模式（即时预览，热更新）
npm run electron:dev

# 脚本结束时也执行清理
cleanup
