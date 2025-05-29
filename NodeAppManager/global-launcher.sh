#!/bin/bash

# =============================================================================
# NodeAppManager 全局启动器 (global-launcher.sh)
# =============================================================================
# 
# 🎯 作用：从任何位置启动 NodeAppManager，无需记忆路径
# 📋 安装后可以通过 'nam' 命令从任何地方启动
#
# =============================================================================

# 项目路径配置
PROJECT_ROOT="/Users/vidar/works/NodeAppManager/NodeAppManager"
LAUNCHER_NAME="nam"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 函数：安装全局启动器
install_global_launcher() {
    echo -e "${CYAN}🚀 安装 NodeAppManager 全局启动器${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    # 检查项目目录
    if [ ! -d "$PROJECT_ROOT" ]; then
        echo -e "${RED}❌ 项目目录不存在: $PROJECT_ROOT${NC}"
        exit 1
    fi
    
    # 检查 smart-start.sh
    if [ ! -f "$PROJECT_ROOT/smart-start.sh" ]; then
        echo -e "${RED}❌ smart-start.sh 不存在${NC}"
        exit 1
    fi
    
    # 创建全局启动脚本
    local global_script="/usr/local/bin/$LAUNCHER_NAME"
    
    echo -e "${BLUE}📝 创建全局启动脚本...${NC}"
    
    # 需要管理员权限
    sudo tee "$global_script" > /dev/null << EOF
#!/bin/bash
# NodeAppManager 全局启动器
# 自动生成于: $(date)

PROJECT_ROOT="$PROJECT_ROOT"

# 验证项目存在
if [ ! -d "\$PROJECT_ROOT" ]; then
    echo "❌ NodeAppManager 项目不存在: \$PROJECT_ROOT"
    exit 1
fi

# 切换到项目目录并启动
cd "\$PROJECT_ROOT"
exec ./smart-start.sh "\$@"
EOF
    
    # 添加执行权限
    sudo chmod +x "$global_script"
    
    echo -e "${GREEN}✅ 全局启动器已安装: $global_script${NC}"
    
    # 创建别名配置
    create_shell_aliases
    
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 安装完成！${NC}"
    echo ""
    echo -e "${YELLOW}📋 可用命令:${NC}"
    echo -e "  ${GREEN}nam${NC}           # 从任何地方启动 NodeAppManager"
    echo -e "  ${BLUE}nam --help${NC}    # 显示帮助信息"
    echo -e "  ${BLUE}nam --info${NC}    # 显示系统信息"
    echo ""
    echo -e "${YELLOW}📋 别名命令:${NC}"
    echo -e "  ${GREEN}nam-logs${NC}      # 查看实时日志"
    echo -e "  ${RED}nam-stop${NC}      # 停止应用"
    echo ""
    echo -e "${YELLOW}💡 使用示例:${NC}"
    echo -e "  ${CYAN}cd ~/Desktop && nam${NC}     # 从桌面启动"
    echo -e "  ${CYAN}cd /tmp && nam${NC}          # 从任何目录启动"
}

# 函数：创建 shell 别名
create_shell_aliases() {
    echo -e "${BLUE}🔧 配置 shell 别名...${NC}"
    
    # 检测并配置不同的 shell
    local shells=("$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile")
    
    for shell_rc in "${shells[@]}"; do
        if [ -f "$shell_rc" ]; then
            # 检查是否已存在别名
            if ! grep -q "# NodeAppManager 全局别名" "$shell_rc" 2>/dev/null; then
                echo "" >> "$shell_rc"
                echo "# NodeAppManager 全局别名" >> "$shell_rc"
                echo "alias nam-logs='$PROJECT_ROOT/view-logs.sh'" >> "$shell_rc"
                echo "alias nam-stop='pkill -f start-dev.sh && pkill -f electron && echo \"🛑 NodeAppManager 已停止\"'" >> "$shell_rc"
                echo "alias nam-status='ps aux | grep -E \"(start-dev|electron|vite)\" | grep -v grep'" >> "$shell_rc"
                
                echo -e "${GREEN}✅ 别名已添加到: $(basename "$shell_rc")${NC}"
            fi
        fi
    done
}

# 函数：卸载全局启动器
uninstall_global_launcher() {
    echo -e "${YELLOW}🗑️  卸载 NodeAppManager 全局启动器${NC}"
    
    local global_script="/usr/local/bin/$LAUNCHER_NAME"
    
    if [ -f "$global_script" ]; then
        sudo rm "$global_script"
        echo -e "${GREEN}✅ 全局启动器已删除${NC}"
    else
        echo -e "${YELLOW}⚠️  全局启动器不存在${NC}"
    fi
    
    # 移除别名（用户需要手动处理）
    echo -e "${YELLOW}💡 请手动从 shell 配置文件中移除别名：${NC}"
    echo -e "   ${CYAN}vi ~/.zshrc${NC} (或 ~/.bashrc)"
    echo -e "   删除 '# NodeAppManager 全局别名' 相关行"
}

# 函数：显示状态
show_status() {
    echo -e "${CYAN}📊 NodeAppManager 全局启动器状态${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    local global_script="/usr/local/bin/$LAUNCHER_NAME"
    
    echo -e "${YELLOW}项目路径:${NC} $PROJECT_ROOT"
    echo -e "${YELLOW}全局命令:${NC} $global_script"
    
    if [ -f "$global_script" ]; then
        echo -e "${GREEN}✅ 全局启动器已安装${NC}"
    else
        echo -e "${RED}❌ 全局启动器未安装${NC}"
    fi
    
    if [ -d "$PROJECT_ROOT" ]; then
        echo -e "${GREEN}✅ 项目目录存在${NC}"
    else
        echo -e "${RED}❌ 项目目录不存在${NC}"
    fi
    
    # 检查进程状态
    echo ""
    echo -e "${YELLOW}📋 当前运行状态:${NC}"
    if pgrep -f "start-dev.sh" > /dev/null; then
        echo -e "${GREEN}✅ NodeAppManager 正在运行${NC}"
    else
        echo -e "${YELLOW}⏸️  NodeAppManager 未运行${NC}"
    fi
}

# 主执行逻辑
case "${1:-install}" in
    "install")
        install_global_launcher
        ;;
    "uninstall")
        uninstall_global_launcher
        ;;
    "status")
        show_status
        ;;
    "--help"|"-h")
        echo -e "${CYAN}NodeAppManager 全局启动器管理${NC}"
        echo ""
        echo -e "${YELLOW}使用方法:${NC}"
        echo -e "  $0 install     # 安装全局启动器 (默认)"
        echo -e "  $0 uninstall   # 卸载全局启动器"
        echo -e "  $0 status      # 显示状态信息"
        echo -e "  $0 --help      # 显示此帮助"
        echo ""
        echo -e "${YELLOW}安装后可用命令:${NC}"
        echo -e "  nam            # 从任何地方启动 NodeAppManager"
        echo -e "  nam-logs       # 查看实时日志"
        echo -e "  nam-stop       # 停止应用"
        echo -e "  nam-status     # 查看运行状态"
        ;;
    *)
        echo -e "${RED}❌ 未知操作: $1${NC}"
        echo -e "${YELLOW}使用 $0 --help 查看帮助${NC}"
        exit 1
        ;;
esac
