#!/bin/bash

# Enterprise Next.js 游戏网站启动脚本
# 支持开发模式和生产模式的PM2启动

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：输出信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    info "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装，请先安装 Node.js 18+。"
        exit 1
    fi
    
    # 检查 npm/pnpm
    if command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
    else
        error "未找到包管理器（npm 或 pnpm）。"
        exit 1
    fi
    
    # 检查 PM2
    if ! command -v pm2 &> /dev/null; then
        info "正在安装 PM2..."
        npm install -g pm2
    fi
    
    info "依赖检查完成。使用包管理器: $PACKAGE_MANAGER"
}

# 安装依赖
install_dependencies() {
    info "安装项目依赖..."
    
    if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
    
    info "依赖安装完成。"
}

# 创建日志目录
create_log_directory() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        info "创建日志目录: logs/"
    fi
}

# 开发模式启动
start_dev() {
    info "启动开发模式..."
    create_log_directory
    
    # 停止可能运行的实例
    pm2 delete ecosystem.config.js 2>/dev/null || true
    
    # 启动开发模式
    pm2 start ecosystem.config.js --only "*-dev"
    pm2 logs
}

# 生产模式启动
start_prod() {
    info "启动生产模式..."
    create_log_directory
    
    # 构建项目
    info "构建项目..."
    if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
        pnpm run build
    else
        npm run build
    fi
    
    # 停止可能运行的实例
    pm2 delete ecosystem.config.js 2>/dev/null || true
    
    # 启动生产模式
    pm2 start ecosystem.config.js --only "*-prod"
    pm2 logs
}

# 停止服务
stop_service() {
    info "停止服务..."
    pm2 delete ecosystem.config.js 2>/dev/null || true
    info "服务已停止。"
}

# 重启服务
restart_service() {
    info "重启服务..."
    pm2 restart ecosystem.config.js 2>/dev/null || {
        warn "未找到运行的服务，将启动新服务..."
        start_dev
    }
}

# 查看状态
show_status() {
    pm2 status
}

# 查看日志
show_logs() {
    pm2 logs
}

# 显示帮助
show_help() {
    echo "Enterprise Next.js 游戏网站启动脚本"
    echo ""
    echo "用法: $0 [COMMAND]"
    echo ""
    echo "命令:"
    echo "  dev      启动开发模式"
    echo "  prod     启动生产模式"
    echo "  stop     停止服务"
    echo "  restart  重启服务"
    echo "  status   查看服务状态"
    echo "  logs     查看服务日志"
    echo "  install  仅安装依赖"
    echo "  help     显示帮助信息"
    echo ""
    echo "例子:"
    echo "  $0 dev      # 开发模式启动"
    echo "  $0 prod     # 生产模式启动"
    echo "  $0 status   # 查看状态"
}

# 主函数
main() {
    case "${1:-dev}" in
        dev)
            check_dependencies
            install_dependencies
            start_dev
            ;;
        prod)
            check_dependencies
            install_dependencies
            start_prod
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        install)
            check_dependencies
            install_dependencies
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
