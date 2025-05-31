#!/bin/bash

# =============================================================================
# NodeAppManager 智能启动脚本 (smart-start.sh)
# =============================================================================
# 
# 🎯 解决问题：
#   • 确保每次都使用正确的工作目录启动
#   • 防止忘记 cd 到正确目录
#   • 提供统一的启动入口点
#   • 支持从任何位置调用
#
# 🚀 使用方法：
#   从任何位置运行: ./smart-start.sh
#   或者创建别名: alias nam='~/works/NodeAppManager/smart-start.sh'
#
# =============================================================================

# 脚本配置
PROJECT_ROOT="/Users/vidar/works/NodeAppManager"
SCRIPT_NAME="smart-start.sh"
LOG_FILE="$PROJECT_ROOT/logs-monitor/smart-start.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 函数：记录启动日志
log_startup() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$LOG_FILE"
}

# 函数：验证项目目录
validate_project_directory() {
    echo -e "${BLUE}🔍 验证项目目录...${NC}"
    
    if [ ! -d "$PROJECT_ROOT" ]; then
        echo -e "${RED}❌ 错误: 项目目录不存在${NC}"
        echo -e "${RED}   期望路径: $PROJECT_ROOT${NC}"
        log_startup "ERROR: 项目目录不存在 - $PROJECT_ROOT"
        exit 1
    fi
    
    if [ ! -f "$PROJECT_ROOT/start-dev.sh" ]; then
        echo -e "${RED}❌ 错误: start-dev.sh 脚本不存在${NC}"
        echo -e "${RED}   期望路径: $PROJECT_ROOT/start-dev.sh${NC}"
        log_startup "ERROR: start-dev.sh 脚本不存在"
        exit 1
    fi
    
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        echo -e "${RED}❌ 错误: package.json 不存在${NC}"
        echo -e "${RED}   期望路径: $PROJECT_ROOT/package.json${NC}"
        log_startup "ERROR: package.json 不存在"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 项目目录验证通过${NC}"
    log_startup "SUCCESS: 项目目录验证通过"
}

# 函数：显示启动信息
show_startup_info() {
    echo -e "${CYAN}🤖 NodeAppManager 智能启动系统${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}📁 项目路径: ${PROJECT_ROOT}${NC}"
    echo -e "${YELLOW}🕐 启动时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${YELLOW}👤 执行用户: $(whoami)${NC}"
    echo -e "${YELLOW}💻 当前路径: $(pwd)${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
}

# 函数：创建别名配置
create_alias_config() {
    local shell_rc=""
    
    # 检测当前使用的 shell
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_rc="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        shell_rc="$HOME/.bashrc"
    else
        echo -e "${YELLOW}⚠️  未知 shell 类型，跳过别名创建${NC}"
        return
    fi
    
    # 检查别名是否已存在
    if ! grep -q "alias nam=" "$shell_rc" 2>/dev/null; then
        echo -e "${BLUE}🔧 创建便捷别名...${NC}"
        echo "" >> "$shell_rc"
        echo "# NodeAppManager 智能启动别名" >> "$shell_rc"
        echo "alias nam='$PROJECT_ROOT/smart-start.sh'" >> "$shell_rc"
        echo "alias nam-logs='$PROJECT_ROOT/view-logs.sh'" >> "$shell_rc"
        echo "alias nam-stop='pkill -f start-dev.sh && pkill -f electron'" >> "$shell_rc"
        
        echo -e "${GREEN}✅ 别名已添加到 $shell_rc${NC}"
        echo -e "${YELLOW}💡 重新加载终端或运行: source $shell_rc${NC}"
        echo -e "${YELLOW}💡 然后可以使用: nam (启动), nam-logs (查看日志), nam-stop (停止)${NC}"
        
        log_startup "INFO: 别名已创建在 $shell_rc"
    fi
}

# 函数：检查端口占用
check_ports() {
    echo -e "${BLUE}🔍 检查端口占用...${NC}"
    
    local ports=(9966 9967)
    local occupied_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -ti:$port >/dev/null 2>&1; then
            occupied_ports+=($port)
            echo -e "${YELLOW}⚠️  端口 $port 被占用${NC}"
            log_startup "WARNING: 端口 $port 被占用"
        fi
    done
    
    if [ ${#occupied_ports[@]} -gt 0 ]; then
        echo -e "${YELLOW}🔄 正在清理占用的端口...${NC}"
        for port in "${occupied_ports[@]}"; do
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 1
        done
        echo -e "${GREEN}✅ 端口清理完成${NC}"
        log_startup "INFO: 端口清理完成"
    else
        echo -e "${GREEN}✅ 端口检查通过${NC}"
    fi
}

# 函数：确保目录切换
ensure_correct_directory() {
    echo -e "${BLUE}📁 切换到项目目录...${NC}"
    
    local current_dir=$(pwd)
    if [ "$current_dir" != "$PROJECT_ROOT" ]; then
        echo -e "${YELLOW}🔄 从 $current_dir 切换到 $PROJECT_ROOT${NC}"
        cd "$PROJECT_ROOT" || {
            echo -e "${RED}❌ 无法切换到项目目录${NC}"
            log_startup "ERROR: 无法切换到项目目录"
            exit 1
        }
        log_startup "INFO: 目录切换成功 - $current_dir -> $PROJECT_ROOT"
    else
        echo -e "${GREEN}✅ 已在正确的项目目录${NC}"
        log_startup "INFO: 已在正确的项目目录"
    fi
}

# 函数：启动应用
start_application() {
    echo -e "${GREEN}🚀 启动 NodeAppManager...${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    log_startup "INFO: 开始启动应用"
    
    # 确保启动脚本有执行权限
    chmod +x start-dev.sh
    
    # 执行启动脚本
    exec ./start-dev.sh
}

# 函数：处理中断信号
handle_interrupt() {
    echo -e "\n${YELLOW}🛑 收到中断信号，正在清理...${NC}"
    log_startup "INFO: 收到中断信号，开始清理"
    
    # 清理监控进程
    if [ -f "./logs-monitor/monitor.pid" ]; then
        local pid=$(cat "./logs-monitor/monitor.pid")
        kill "$pid" 2>/dev/null || true
        rm "./logs-monitor/monitor.pid" 2>/dev/null || true
    fi
    
    # 清理其他相关进程
    pkill -f "tail.*Electron.*logs" 2>/dev/null || true
    pkill -f "start-dev.sh" 2>/dev/null || true
    
    log_startup "INFO: 清理完成，程序退出"
    exit 0
}

# 主执行函数
main() {
    # 设置中断处理
    trap handle_interrupt INT TERM
    
    # 创建日志目录
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # 记录启动开始
    log_startup "INFO: 智能启动系统开始执行"
    
    # 执行启动流程
    show_startup_info
    validate_project_directory
    create_alias_config
    check_ports
    ensure_correct_directory
    start_application
}

# 检查参数
case "${1:-}" in
    "--help"|"-h")
        echo -e "${CYAN}NodeAppManager 智能启动系统${NC}"
        echo ""
        echo -e "${YELLOW}使用方法:${NC}"
        echo -e "  $0          # 启动应用"
        echo -e "  $0 --help   # 显示帮助"
        echo -e "  $0 --info   # 显示系统信息"
        echo ""
        echo -e "${YELLOW}别名支持:${NC}"
        echo -e "  nam         # 启动应用"
        echo -e "  nam-logs    # 查看日志"
        echo -e "  nam-stop    # 停止应用"
        exit 0
        ;;
    "--info")
        echo -e "${CYAN}NodeAppManager 系统信息${NC}"
        echo -e "项目路径: $PROJECT_ROOT"
        echo -e "日志文件: $LOG_FILE"
        echo -e "当前路径: $(pwd)"
        echo -e "脚本路径: $(readlink -f "$0")"
        exit 0
        ;;
    "")
        # 正常启动
        main
        ;;
    *)
        echo -e "${RED}❌ 未知参数: $1${NC}"
        echo -e "${YELLOW}使用 $0 --help 查看帮助${NC}"
        exit 1
        ;;
esac
