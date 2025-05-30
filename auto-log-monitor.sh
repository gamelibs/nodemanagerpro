#!/bin/bash

# NodeAppManager 自动化日志监控启动脚本
# 作用：启动应用的同时自动监控所有日志输出

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🤖 NodeAppManager 自动化监控启动${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

# 创建日志监控目录
MONITOR_DIR="./logs-monitor"
mkdir -p "$MONITOR_DIR"

# 清理之前的日志监控进程
echo -e "${YELLOW}🧹 清理之前的监控进程...${NC}"
pkill -f "tail.*Electron.*logs" 2>/dev/null || true
pkill -f "log-monitor" 2>/dev/null || true

# 函数：启动后端日志监控
start_backend_log_monitor() {
    echo -e "${BLUE}📊 启动后端日志监控...${NC}"
    
    # 创建后端日志监控脚本
    cat > "$MONITOR_DIR/backend-monitor.sh" << 'EOF'
#!/bin/bash
LOG_DIR="$HOME/Library/Application Support/Electron/logs"
echo "🔍 监控后端日志: $LOG_DIR"

# 等待日志文件创建
while [ ! -d "$LOG_DIR" ]; do
    echo "⏳ 等待 Electron 日志目录创建..."
    sleep 2
done

# 监控所有日志文件
tail -F "$LOG_DIR"/*.log 2>/dev/null | while read line; do
    timestamp=$(date '+%H:%M:%S')
    echo "[$timestamp] 🔧 BACKEND: $line"
done
EOF
    
    chmod +x "$MONITOR_DIR/backend-monitor.sh"
    nohup "$MONITOR_DIR/backend-monitor.sh" > "$MONITOR_DIR/backend.log" 2>&1 &
    echo $! > "$MONITOR_DIR/backend-monitor.pid"
}

# 函数：启动前端日志监控注入
start_frontend_log_monitor() {
    echo -e "${BLUE}🌐 准备前端日志监控...${NC}"
    
    # 创建前端日志监控注入脚本
    cat > "$MONITOR_DIR/frontend-inject.js" << 'EOF'
// 前端日志监控自动注入
(function() {
    console.log('🤖 自动日志监控已激活');
    
    // 创建日志收集器
    window.logCollector = {
        logs: [],
        maxLogs: 1000,
        
        add: function(type, args) {
            const entry = {
                timestamp: new Date().toISOString(),
                type: type,
                message: Array.from(args).map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ')
            };
            
            this.logs.push(entry);
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }
            
            // 发送到主进程记录
            if (window.electronAPI && window.electronAPI.invoke) {
                window.electronAPI.invoke('logger:log', {
                    level: type.toUpperCase(),
                    message: `FRONTEND-${type.toUpperCase()}: ${entry.message}`,
                    data: { source: 'frontend-monitor' }
                }).catch(() => {}); // 忽略错误，避免循环
            }
        },
        
        getLogs: function(type = null) {
            return type ? this.logs.filter(log => log.type === type) : this.logs;
        },
        
        exportLogs: function() {
            return JSON.stringify(this.logs, null, 2);
        }
    };
    
    // 重写控制台方法
    const originalMethods = {};
    ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
        originalMethods[method] = console[method];
        console[method] = function(...args) {
            window.logCollector.add(method, args);
            originalMethods[method].apply(console, [`🔍 ${method.toUpperCase()}:`, ...args]);
        };
    });
    
    // 监控错误
    window.addEventListener('error', (event) => {
        window.logCollector.add('error', ['Uncaught Error:', event.error?.message || event.message]);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        window.logCollector.add('error', ['Unhandled Promise Rejection:', event.reason]);
    });
    
    // 提供全局方法
    window.showLogs = function(type) {
        console.table(window.logCollector.getLogs(type));
    };
    
    window.exportLogs = function() {
        const logs = window.logCollector.exportLogs();
        console.log(logs);
        return logs;
    };
    
    console.log('✅ 前端日志监控准备完成');
    console.log('💡 使用 showLogs() 查看日志');
    console.log('💡 使用 exportLogs() 导出日志');
})();
EOF
}

# 函数：启动统一日志查看器
start_unified_log_viewer() {
    echo -e "${PURPLE}📋 启动统一日志查看器...${NC}"
    
    cat > "$MONITOR_DIR/unified-viewer.sh" << 'EOF'
#!/bin/bash
echo "📋 统一日志查看器启动"
echo "══════════════════════════════════"

BACKEND_LOG="./logs-monitor/backend.log"
FRONTEND_LOG="./logs-monitor/frontend.log"

# 创建前端日志占位文件
touch "$FRONTEND_LOG"

echo "🔍 监控文件:"
echo "  📊 后端: $BACKEND_LOG"
echo "  🌐 前端: $FRONTEND_LOG"
echo "══════════════════════════════════"

# 使用不同颜色显示不同来源的日志
(
    tail -F "$BACKEND_LOG" 2>/dev/null | sed 's/^/\x1b[34m[BACKEND]\x1b[0m /' &
    tail -F "$FRONTEND_LOG" 2>/dev/null | sed 's/^/\x1b[32m[FRONTEND]\x1b[0m /' &
    wait
)
EOF
    
    chmod +x "$MONITOR_DIR/unified-viewer.sh"
}

# 函数：创建停止监控脚本
create_stop_script() {
    cat > "$MONITOR_DIR/stop-monitor.sh" << 'EOF'
#!/bin/bash
echo "🛑 停止所有日志监控..."

# 停止后台进程
if [ -f "./logs-monitor/backend-monitor.pid" ]; then
    kill $(cat "./logs-monitor/backend-monitor.pid") 2>/dev/null || true
    rm "./logs-monitor/backend-monitor.pid"
fi

# 清理监控进程
pkill -f "tail.*Electron.*logs" 2>/dev/null || true
pkill -f "log-monitor" 2>/dev/null || true

echo "✅ 监控已停止"
EOF
    
    chmod +x "$MONITOR_DIR/stop-monitor.sh"
}

# 函数：更新启动脚本以包含监控
update_startup_script() {
    echo -e "${GREEN}🔧 更新启动脚本以包含自动监控...${NC}"
    
    # 备份原始启动脚本
    if [ ! -f "start-dev.sh.backup" ]; then
        cp start-dev.sh start-dev.sh.backup
    fi
    
    # 在启动脚本前添加监控启动
    cat > start-dev-with-monitor.sh << 'EOF'
#!/bin/bash

# 启动自动化日志监控
echo "🤖 启动自动化日志监控..."
./auto-log-monitor.sh monitor &

# 启动原始应用
./start-dev.sh

echo "🛑 应用关闭，停止监控..."
./logs-monitor/stop-monitor.sh 2>/dev/null || true
EOF
    
    chmod +x start-dev-with-monitor.sh
}

# 主执行流程
main() {
    case "${1:-start}" in
        "monitor")
            echo -e "${GREEN}🚀 启动监控组件...${NC}"
            start_backend_log_monitor
            start_frontend_log_monitor
            start_unified_log_viewer
            create_stop_script
            
            echo -e "${GREEN}✅ 监控系统已启动${NC}"
            echo -e "${YELLOW}📊 后端日志监控: PID $(cat $MONITOR_DIR/backend-monitor.pid)${NC}"
            echo -e "${YELLOW}🌐 前端监控脚本: $MONITOR_DIR/frontend-inject.js${NC}"
            echo -e "${YELLOW}📋 统一查看器: $MONITOR_DIR/unified-viewer.sh${NC}"
            echo ""
            echo -e "${CYAN}💡 在浏览器开发者工具中运行以下代码启用前端监控:${NC}"
            echo -e "${PURPLE}fetch('./logs-monitor/frontend-inject.js').then(r=>r.text()).then(eval)${NC}"
            ;;
            
        "view")
            echo -e "${BLUE}📋 启动统一日志查看器...${NC}"
            "$MONITOR_DIR/unified-viewer.sh"
            ;;
            
        "stop")
            echo -e "${RED}🛑 停止所有监控...${NC}"
            "$MONITOR_DIR/stop-monitor.sh"
            ;;
            
        "start"|*)
            echo -e "${GREEN}🚀 启动应用并自动监控...${NC}"
            update_startup_script
            
            echo -e "${CYAN}📋 可用命令:${NC}"
            echo -e "  ${GREEN}./auto-log-monitor.sh monitor${NC} - 仅启动监控"
            echo -e "  ${BLUE}./auto-log-monitor.sh view${NC}    - 查看统一日志"
            echo -e "  ${RED}./auto-log-monitor.sh stop${NC}    - 停止监控"
            echo -e "  ${PURPLE}./start-dev-with-monitor.sh${NC}  - 启动应用+监控"
            echo ""
            echo -e "${YELLOW}🎯 建议使用: ./start-dev-with-monitor.sh${NC}"
            ;;
    esac
}

# 执行主函数
main "$@"
