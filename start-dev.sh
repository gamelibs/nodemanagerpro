#!/bin/zsh

# =============================================================================
# NodeAppManager 开发环境启动脚本 (start-dev.sh)
# =============================================================================
#
# 📋 脚本功能：
#   • 完整的开发环境初始化和启动
#   • 自动清理残留进程和端口占用
#   • 检查和安装项目依赖
#   • 编译 TypeScript 主进程代码
#   • 启动 Electron + Vite 开发服务器
#
# 🚀 启动流程：
#   1. 环境清理 - 清理残留进程和端口占用
#   2. 依赖检查 - 自动安装缺失的 node_modules
#   3. 主进程编译 - 编译 TypeScript 到 CommonJS
#   4. 服务启动 - 同时启动 Vite 和 Electron
#
# ⚡ 开发特性：
#   • 热模块替换 (HMR) - React 组件实时更新
#   • TypeScript 实时编译 - 类型检查和转换
#   • TailwindCSS 实时样式更新
#   • Electron 开发者工具支持
#   • PM2 进程管理集成
#
# 🌐 服务端口：
#   • 9966 - Vite 开发服务器
#   • 9967 - HMR WebSocket 服务
#
# 📝 使用方法：
#   chmod +x start-dev.sh && ./start-dev.sh
#
# 🛑 停止服务：
#   按 Ctrl+C 停止所有服务
#
# 💡 提示：
#   • 首次运行会自动安装依赖，可能需要几分钟
#   • 如遇端口占用，脚本会自动清理
#   • 修改前端代码会实时更新，无需重启
#   • 修改主进程代码需要重新运行此脚本
#
# =============================================================================

# NodeAppManager 完整开发环境启动脚本
cd "$(dirname "$0")"

# 🤖 自动启动日志监控系统
start_log_monitoring() {
    echo "🤖 启动自动化日志监控..."
    
    # 创建监控目录
    mkdir -p ./logs-monitor
    
    # 启动后端日志监控
    {
        LOG_DIR="$HOME/Library/Application Support/Electron/logs"
        while [ ! -d "$LOG_DIR" ]; do
            sleep 1
        done
        tail -F "$LOG_DIR"/*.log 2>/dev/null | while read line; do
            echo "[$(date '+%H:%M:%S')] 🔧 BACKEND: $line" >> ./logs-monitor/realtime.log
        done
    } &
    
    # 保存监控进程PID
    echo $! > ./logs-monitor/monitor.pid
    
    # 创建前端日志注入脚本
    cat > ./logs-monitor/frontend-inject.js << 'EOF'
// 自动前端日志监控
console.log('🤖 前端日志监控已激活');
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
console.log = (...args) => { originalLog('🔍 LOG:', ...args); };
console.error = (...args) => { originalError('❌ ERROR:', ...args); };
console.warn = (...args) => { originalWarn('⚠️ WARN:', ...args); };
window.addEventListener('error', e => console.error('未捕获错误:', e.error));
window.addEventListener('unhandledrejection', e => console.error('Promise拒绝:', e.reason));
EOF
    
    echo "✅ 日志监控已启动 (PID: $(cat ./logs-monitor/monitor.pid))"
    echo "💡 前端监控: 在开发者工具运行 fetch('./logs-monitor/frontend-inject.js').then(r=>r.text()).then(eval)"
}

# 清理函数
cleanup_monitoring() {
    if [ -f "./logs-monitor/monitor.pid" ]; then
        kill $(cat "./logs-monitor/monitor.pid") 2>/dev/null || true
        rm "./logs-monitor/monitor.pid" 2>/dev/null || true
    fi
    pkill -f "tail.*Electron.*logs" 2>/dev/null || true
}

# 设置清理陷阱
trap cleanup_monitoring EXIT INT TERM

# 启动监控
start_log_monitoring

echo "🚀 NodeAppManager 开发环境启动"
echo "═══════════════════════════════════════"
echo "📦 技术栈: Electron + React + Vite + TypeScript"
echo "🌐 服务端口: 9966 (Vite) + 9967 (HMR)"
echo "🔥 支持功能: 热模块替换 (HMR) + 实时重载"
echo "🕐 启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "🔄 启动流程："
echo "   1️⃣  清理环境 - 清理残留进程和端口"
echo "   2️⃣  依赖检查 - 确保 node_modules 存在"
echo "   3️⃣  主进程编译 - TypeScript → CommonJS"
echo "   4️⃣  服务启动 - Vite + Electron 同步启动"
echo ""

# 清理可能残留的进程
echo "🧹 清理残留进程..."
pkill -f "vite.*9966" 2>/dev/null || true
pkill -f "electron.*NodeAppManager" 2>/dev/null || true
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
echo "📝 开发指南:"
echo "   • ✅ Vite 服务器启动后会自动打开 Electron 窗口"
echo "   • 🔄 修改 React 组件代码会实时更新"
echo "   • 🎨 修改 TailwindCSS 样式实时生效"
echo "   • 🔧 修改 TypeScript 代码自动编译"
echo "   • 🔄 按 Cmd+R 或 Ctrl+R 可手动刷新"
echo "   • 🛑 按 Ctrl+C 停止所有服务"
echo ""
echo "🌟 集成功能:"
echo "   • 📊 PM2 进程管理 - 项目启动/停止/监控"
echo "   • 📋 实时日志 - 左侧栏显示项目运行日志"
echo "   • 🔍 项目管理 - 导入/创建/管理 Node.js 项目"
echo "   • ⚙️  智能端口分配 - 自动检测和分配端口"
echo ""
echo "🚀 启动中...请稍候"
echo "═══════════════════════════════════════"

# 启动开发服务
npm run electron:dev
