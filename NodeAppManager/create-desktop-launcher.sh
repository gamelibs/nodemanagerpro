#!/bin/bash

# =============================================================================
# NodeAppManager 桌面快速启动器创建脚本
# =============================================================================

cd ~/Desktop

echo "🖥️ 创建 NodeAppManager 桌面启动器"
echo "═══════════════════════════════════════"

# 方法1: 创建可执行的启动脚本
create_desktop_script() {
    echo "📝 创建桌面启动脚本..."
    
    cat > ~/Desktop/启动NodeAppManager.command << 'EOF'
#!/bin/bash

# NodeAppManager 桌面快速启动器
PROJECT_ROOT="/Users/vidar/works/NodeAppManager/NodeAppManager"

# 设置终端颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 NodeAppManager 桌面启动器${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

# 检查项目是否存在
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ 项目目录不存在: $PROJECT_ROOT${NC}"
    echo "按任意键退出..."
    read -n 1
    exit 1
fi

# 切换到项目目录
cd "$PROJECT_ROOT"

echo -e "${BLUE}📁 项目路径: $PROJECT_ROOT${NC}"
echo -e "${YELLOW}🕐 启动时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

# 检查是否已在运行
if pgrep -f "start-dev.sh" > /dev/null; then
    echo -e "${YELLOW}⚠️  NodeAppManager 似乎已在运行${NC}"
    echo -e "${BLUE}🌐 访问地址: http://localhost:9966${NC}"
    echo ""
    echo "选择操作:"
    echo "1) 打开浏览器访问应用"
    echo "2) 重新启动应用"
    echo "3) 退出"
    echo ""
    read -p "请输入选择 (1-3): " choice
    
    case $choice in
        1)
            echo -e "${GREEN}🌐 正在打开浏览器...${NC}"
            open "http://localhost:9966"
            exit 0
            ;;
        2)
            echo -e "${YELLOW}🔄 正在重新启动...${NC}"
            pkill -f "start-dev.sh" 2>/dev/null || true
            pkill -f "electron" 2>/dev/null || true
            sleep 2
            ;;
        3|*)
            echo -e "${YELLOW}👋 再见！${NC}"
            exit 0
            ;;
    esac
fi

echo -e "${GREEN}🚀 正在启动 NodeAppManager...${NC}"
echo -e "${YELLOW}💡 启动完成后会自动打开 Electron 窗口${NC}"
echo -e "${YELLOW}💡 也可以在浏览器访问: http://localhost:9966${NC}"
echo -e "${YELLOW}💡 按 Ctrl+C 可以停止服务${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

# 启动应用
exec ./smart-start.sh
EOF
    
    # 添加执行权限
    chmod +x ~/Desktop/启动NodeAppManager.command
    
    echo -e "${GREEN}✅ 启动脚本已创建: ~/Desktop/启动NodeAppManager.command${NC}"
}

# 方法2: 创建 AppleScript 应用
create_applescript_app() {
    echo "🍎 创建 AppleScript 应用..."
    
    cat > /tmp/NodeAppManager.applescript << 'EOF'
on run
    set projectRoot to "/Users/vidar/works/NodeAppManager/NodeAppManager"
    
    -- 检查项目目录是否存在
    try
        tell application "Finder"
            if not (exists folder (POSIX file projectRoot)) then
                display dialog "❌ 项目目录不存在: " & projectRoot with title "NodeAppManager Launcher" with icon stop
                return
            end if
        end tell
    on error
        display dialog "❌ 无法访问项目目录" with title "NodeAppManager Launcher" with icon stop
        return
    end try
    
    -- 检查是否已在运行
    try
        set isRunning to (do shell script "pgrep -f 'start-dev.sh' || pgrep -f 'vite.*9966'")
        
        set userChoice to (display dialog "⚠️ NodeAppManager 似乎已在运行。

您希望：" with title "NodeAppManager Launcher" with icon caution buttons {"取消", "重新启动", "打开浏览器"} default button "打开浏览器")
        
        if button returned of userChoice is "打开浏览器" then
            open location "http://localhost:9966"
            return
        else if button returned of userChoice is "重新启动" then
            try
                do shell script "pkill -f 'start-dev.sh'; pkill -f 'electron'" 
                delay 2
            end try
        else
            return
        end if
        
    on error
        -- 应用未运行，继续启动
    end try
    
    -- 显示启动对话框
    display dialog "🚀 正在启动 NodeAppManager...

这可能需要几分钟时间，请耐心等待。
启动完成后会自动打开应用窗口。" with title "NodeAppManager Launcher" with icon note buttons {"取消", "启动"} default button "启动"
    
    if button returned of result is "取消" then
        return
    end if
    
    -- 在后台启动应用
    try
        do shell script "cd " & quoted form of projectRoot & " && nohup ./smart-start.sh > /dev/null 2>&1 &"
        
        -- 等待启动
        set maxWait to 30
        repeat with i from 1 to maxWait
            delay 2
            try
                do shell script "curl -s http://localhost:9966 > /dev/null"
                -- 启动成功
                display dialog "✅ NodeAppManager 启动成功！

📊 应用已在 Electron 窗口中运行
🌐 也可以在浏览器访问: http://localhost:9966

💡 如需停止，请在终端运行: nam-stop" with title "NodeAppManager Launcher" with icon note buttons {"确定", "打开浏览器"} default button "确定"
                
                if button returned of result is "打开浏览器" then
                    open location "http://localhost:9966"
                end if
                return
            on error
                -- 继续等待
            end try
        end repeat
        
        -- 启动超时
        display dialog "⚠️ 启动可能需要更多时间。

请稍后访问: http://localhost:9966
或使用终端命令: nam-logs 查看日志" with title "NodeAppManager Launcher" with icon caution
        
    on error errorMsg
        display dialog "❌ 启动失败: " & errorMsg with title "NodeAppManager Launcher" with icon stop
    end try
end run
EOF
    
    # 编译 AppleScript
    osacompile -o ~/Desktop/NodeAppManager启动器.app /tmp/NodeAppManager.applescript
    
    echo -e "${GREEN}✅ AppleScript 应用已创建: ~/Desktop/NodeAppManager启动器.app${NC}"
}

# 方法3: 创建 Platypus 应用 (如果安装了 Platypus)
create_platypus_app() {
    if command -v platypus >/dev/null 2>&1; then
        echo "🔧 使用 Platypus 创建原生应用..."
        
        # 创建启动脚本
        cat > /tmp/nodeappmanager_launcher.sh << 'EOF'
#!/bin/bash
cd "/Users/vidar/works/NodeAppManager/NodeAppManager"
exec ./smart-start.sh
EOF
        
        chmod +x /tmp/nodeappmanager_launcher.sh
        
        platypus -a "NodeAppManager" \
                -t "None" \
                -d \
                -R \
                -B \
                -y \
                /tmp/nodeappmanager_launcher.sh \
                ~/Desktop/NodeAppManager.app
                
        echo -e "${GREEN}✅ Platypus 应用已创建: ~/Desktop/NodeAppManager.app${NC}"
    else
        echo -e "${YELLOW}⚠️  Platypus 未安装，跳过此方法${NC}"
    fi
}

# 主执行函数
main() {
    echo -e "${CYAN}正在创建桌面启动器...${NC}"
    echo ""
    
    # 方法1: 创建 .command 脚本
    create_desktop_script
    echo ""
    
    # 方法2: 创建 AppleScript 应用
    create_applescript_app
    echo ""
    
    # 方法3: 尝试创建 Platypus 应用
    create_platypus_app
    echo ""
    
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 桌面启动器创建完成！${NC}"
    echo ""
    echo -e "${YELLOW}📋 可用的启动方式:${NC}"
    echo -e "  1. ${BLUE}双击: 启动NodeAppManager.command${NC}"
    echo -e "  2. ${BLUE}双击: NodeAppManager启动器.app${NC}"
    echo -e "  3. ${BLUE}终端命令: nam${NC}"
    echo ""
    echo -e "${YELLOW}💡 推荐使用 AppleScript 应用，界面更友好！${NC}"
}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 执行主函数
main "$@"
