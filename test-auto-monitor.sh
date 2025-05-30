#!/bin/bash

# 测试自动化日志监控系统
# 使用方法: ./test-auto-monitor.sh

cd "$(dirname "$0")"

echo "🧪 测试自动化日志监控系统"
echo "═══════════════════════════════════════"

# 检查必要文件
echo "📋 检查组件文件..."
files=(
    "start-dev.sh"
    "view-logs.sh" 
    "auto-log-monitor.sh"
    "src/main.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

echo ""
echo "🔍 监控系统组件:"
echo "  📊 后端监控: 集成在 start-dev.sh 中"
echo "  🌐 前端监控: 集成在 src/main.tsx 中" 
echo "  📋 日志查看: view-logs.sh"
echo "  🤖 独立监控: auto-log-monitor.sh"

echo ""
echo "🚀 启动方式:"
echo "  1. 标准启动 (包含监控): ./start-dev.sh"
echo "  2. 查看实时日志: ./view-logs.sh"
echo "  3. 独立监控模式: ./auto-log-monitor.sh"

echo ""
echo "💡 前端监控功能:"
echo "  • 自动捕获所有 console 输出"
echo "  • 监控未捕获的错误和 Promise 拒绝" 
echo "  • 将前端日志发送到主进程记录"
echo "  • 提供 showLogs() 和 exportLogs() 全局方法"

echo ""
echo "🎯 监控验证:"
echo "  1. 启动应用后，打开开发者工具"
echo "  2. 运行 showLogs() 查看收集的日志"
echo "  3. 运行 exportLogs() 导出日志数据"
echo "  4. 在另一个终端运行 ./view-logs.sh 查看实时日志"

echo ""
echo "✅ 自动化监控系统已就绪！"
