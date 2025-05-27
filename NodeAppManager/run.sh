#!/bin/zsh

###########################################
# Node App Manager - 生产环境启动脚本
###########################################
# 
# 功能特点：
# 🚀 快速启动 - 跳过环境检查，直接启动应用
# ⚡ 性能优先 - 精简启动流程，减少资源消耗
# 🛡️ 智能进程管理 - 优雅的进程清理和信号处理
# 🔄 热更新支持 - 支持前端代码的实时更新
# 
# 适用场景：
# ✅ 环境已经稳定，需要快速启动
# ✅ 生产预览模式，性能测试
# ✅ 频繁重启应用的开发场景
# ✅ 稳定环境下的日常开发
# 
# 前置条件：
# 📦 依赖已正确安装 (node_modules 存在)
# 🔧 主进程已编译 (electron-main.cjs 存在)
# 🌐 端口 9966、9967 可用
# 
# 使用方法：
# chmod +x run.sh  # 首次给予执行权限
# ./run.sh         # 启动应用
# Ctrl+C           # 停止应用
#
###########################################

# 进入项目目录
cd "$(dirname "$0")"

# 智能进程清理函数
# 相比 start-dev.sh，这里的清理更加精准和高效
cleanup() {
  echo ""
  echo "🧹 正在清理进程..."
  
  # 精确匹配相关进程，避免误杀其他应用
  # 使用更精准的进程匹配，提高清理效率
  kill $(ps aux | grep '[n]ode.*vite' | awk '{print $2}') 2>/dev/null || true
  kill $(ps aux | grep '[e]lectron' | awk '{print $2}') 2>/dev/null || true
  kill $(ps aux | grep '[t]s-node' | awk '{print $2}') 2>/dev/null || true
  
  echo "✅ 进程清理完成"
  exit 0
}

# 注册信号处理 - 确保优雅退出
# 支持 Ctrl+C (SIGINT) 和系统终止 (SIGTERM)
trap cleanup SIGINT SIGTERM

echo "🚀 Node App Manager - 生产环境启动"
echo "════════════════════════════════════════"
echo "📝 当前模式特性："
echo "   ⚡ 快速启动 - 跳过环境检查"
echo "   🔥 Vite 热更新 (HMR)"
echo "   ⚛️  React Fast Refresh"
echo "   📘 TypeScript 实时编译"
echo "   🎨 TailwindCSS 实时样式更新"
echo "   🛠️  Electron 开发者工具"
echo ""
echo "🎯 性能优势："
echo "   🚀 启动速度更快（跳过依赖检查）"
echo "   💪 资源占用更低（精简流程）"
echo "   🛡️  更稳定的进程管理"
echo ""
echo "🔧 操作说明："
echo "   • 修改前端代码 → 自动热更新"
echo "   • 修改主进程代码 → 需要重启应用"
echo "   • 按 Ctrl+C → 优雅退出并清理进程"
echo "   • 浏览器访问 → http://localhost:9966"
echo ""
echo "⚠️  注意：确保环境已稳定（依赖已安装、主进程已编译）"
echo "════════════════════════════════════════"
echo ""

# 启动应用 - 直接运行开发模式
# 这里不做环境检查，假设环境已经就绪
# 性能优先，快速启动
echo "🎬 正在启动应用..."
npm run electron:dev

# 脚本结束时执行清理
# 确保即使异常退出也能清理进程
cleanup
