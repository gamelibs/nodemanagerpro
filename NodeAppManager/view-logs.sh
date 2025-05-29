#!/bin/bash

# 实时日志查看器
# 使用方法: ./view-logs.sh

cd "$(dirname "$0")"

echo "📋 NodeAppManager 实时日志查看器"
echo "═══════════════════════════════════════"

LOG_FILE="./logs-monitor/realtime.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️  日志文件不存在: $LOG_FILE"
    echo "💡 请先启动应用: ./start-dev.sh"
    exit 1
fi

echo "🔍 监控日志文件: $LOG_FILE"
echo "🛑 按 Ctrl+C 停止查看"
echo "═══════════════════════════════════════"

# 显示最近的日志并实时跟踪
tail -f "$LOG_FILE" 2>/dev/null | while read line; do
    # 添加颜色编码
    if [[ $line == *"ERROR"* ]]; then
        echo -e "\033[31m$line\033[0m"  # 红色
    elif [[ $line == *"WARN"* ]]; then
        echo -e "\033[33m$line\033[0m"  # 黄色
    elif [[ $line == *"IPC"* ]]; then
        echo -e "\033[36m$line\033[0m"  # 青色
    elif [[ $line == *"PM2"* ]]; then
        echo -e "\033[35m$line\033[0m"  # 紫色
    else
        echo -e "\033[32m$line\033[0m"  # 绿色
    fi
done
