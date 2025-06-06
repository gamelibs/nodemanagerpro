#!/bin/bash

# 企业级Next.js项目健康检查脚本
# 检查项目状态、依赖、构建等

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查计数器
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

fail() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_CHECKS++))
}

check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
    ((TOTAL_CHECKS++))
}

# 检查系统依赖
check_system_dependencies() {
    echo ""
    info "检查系统依赖..."
    
    # Node.js 版本检查
    check "检查 Node.js 版本..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            success "Node.js 版本: $NODE_VERSION (>=18.0.0 ✓)"
        else
            fail "Node.js 版本过低: $NODE_VERSION (需要 >=18.0.0)"
        fi
    else
        fail "Node.js 未安装"
    fi
    
    # 包管理器检查
    check "检查包管理器..."
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        success "pnpm 版本: $PNPM_VERSION"
        PACKAGE_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        success "npm 版本: $NPM_VERSION"
        PACKAGE_MANAGER="npm"
    else
        fail "未找到包管理器 (npm 或 pnpm)"
    fi
    
    # PM2 检查
    check "检查 PM2..."
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        success "PM2 版本: $PM2_VERSION"
    else
        warn "PM2 未安装 (如需使用 PM2 部署，请安装)"
    fi
}

# 检查项目文件
check_project_files() {
    echo ""
    info "检查项目文件..."
    
    # 必需文件检查
    essential_files=(
        "package.json"
        "next.config.js"
        "tsconfig.json"
        "tailwind.config.js"
        "postcss.config.js"
    )
    
    for file in "${essential_files[@]}"; do
        check "检查 $file..."
        if [ -f "$file" ]; then
            success "$file 存在"
        else
            fail "$file 缺失"
        fi
    done
    
    # 配置文件检查
    config_files=(
        "ecosystem.config.js"
        ".env.example"
        "start.sh"
        "fix.sh"
    )
    
    for file in "${config_files[@]}"; do
        check "检查 $file..."
        if [ -f "$file" ]; then
            success "$file 存在"
        else
            warn "$file 缺失 (可选)"
        fi
    done
    
    # 目录结构检查
    essential_dirs=(
        "src"
        "public"
        "src/components"
        "src/lib"
        "src/types"
    )
    
    for dir in "${essential_dirs[@]}"; do
        check "检查目录 $dir..."
        if [ -d "$dir" ]; then
            success "目录 $dir 存在"
        else
            fail "目录 $dir 缺失"
        fi
    done
}

# 检查依赖安装
check_dependencies() {
    echo ""
    info "检查项目依赖..."
    
    check "检查 node_modules..."
    if [ -d "node_modules" ]; then
        success "node_modules 目录存在"
        
        # 检查关键依赖
        key_deps=(
            "next"
            "react"
            "typescript"
            "tailwindcss"
        )
        
        for dep in "${key_deps[@]}"; do
            check "检查依赖 $dep..."
            if [ -d "node_modules/$dep" ]; then
                success "依赖 $dep 已安装"
            else
                fail "依赖 $dep 未找到"
            fi
        done
    else
        fail "node_modules 目录不存在，需要运行 npm install 或 pnpm install"
    fi
}

# 检查配置文件语法
check_config_syntax() {
    echo ""
    info "检查配置文件语法..."
    
    # package.json 语法检查
    check "检查 package.json 语法..."
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        success "package.json 语法正确"
    else
        fail "package.json 语法错误"
    fi
    
    # tsconfig.json 语法检查
    check "检查 tsconfig.json 语法..."
    if [ -f "tsconfig.json" ]; then
        if node -e "JSON.parse(require('fs').readFileSync('tsconfig.json', 'utf8'))" 2>/dev/null; then
            success "tsconfig.json 语法正确"
        else
            fail "tsconfig.json 语法错误"
        fi
    fi
    
    # next.config.js 语法检查
    check "检查 next.config.js 语法..."
    if [ -f "next.config.js" ]; then
        if node -c next.config.js 2>/dev/null; then
            success "next.config.js 语法正确"
        else
            fail "next.config.js 语法错误"
        fi
    fi
}

# 检查环境配置
check_environment() {
    echo ""
    info "检查环境配置..."
    
    check "检查环境变量文件..."
    if [ -f ".env.local" ]; then
        success ".env.local 存在"
    elif [ -f ".env" ]; then
        success ".env 存在"
    else
        warn "未找到环境变量文件 (.env.local 或 .env)"
        info "建议从 .env.example 复制创建"
    fi
    
    # 检查重要环境变量
    check "检查 NODE_ENV..."
    if [ -n "$NODE_ENV" ]; then
        success "NODE_ENV: $NODE_ENV"
    else
        warn "NODE_ENV 未设置"
    fi
}

# 检查构建状态
check_build_status() {
    echo ""
    info "检查构建状态..."
    
    check "检查 .next 目录..."
    if [ -d ".next" ]; then
        success ".next 构建目录存在"
        
        # 检查构建ID
        if [ -f ".next/BUILD_ID" ]; then
            BUILD_ID=$(cat .next/BUILD_ID)
            success "构建ID: $BUILD_ID"
        else
            warn "构建ID文件不存在"
        fi
    else
        warn ".next 构建目录不存在 (需要运行 npm run build)"
    fi
}

# 检查端口占用
check_ports() {
    echo ""
    info "检查端口状态..."
    
    # 默认端口检查
    ports=(3000 3001 3002)
    
    for port in "${ports[@]}"; do
        check "检查端口 $port..."
        if lsof -i :$port > /dev/null 2>&1; then
            warn "端口 $port 被占用"
            # 显示占用进程
            PROCESS=$(lsof -i :$port | tail -n +2 | awk '{print $1 " (PID: " $2 ")"}' | head -1)
            echo "      占用进程: $PROCESS"
        else
            success "端口 $port 可用"
        fi
    done
}

# 检查PM2状态
check_pm2_status() {
    echo ""
    info "检查PM2状态..."
    
    if command -v pm2 &> /dev/null; then
        check "检查PM2进程..."
        PM2_PROCESSES=$(pm2 list | grep -E "(online|stopped|errored)" | wc -l)
        if [ "$PM2_PROCESSES" -gt 0 ]; then
            success "发现 $PM2_PROCESSES 个PM2进程"
            echo ""
            pm2 list
        else
            success "无运行中的PM2进程"
        fi
    else
        warn "PM2 未安装，跳过PM2状态检查"
    fi
}

# 运行快速测试
run_quick_test() {
    echo ""
    info "运行快速测试..."
    
    if [ -d "node_modules" ]; then
        check "类型检查..."
        if $PACKAGE_MANAGER run type-check > /dev/null 2>&1; then
            success "TypeScript 类型检查通过"
        else
            warn "TypeScript 类型检查发现问题"
        fi
        
        check "代码风格检查..."
        if $PACKAGE_MANAGER run lint > /dev/null 2>&1; then
            success "ESLint 检查通过"
        else
            warn "ESLint 检查发现问题"
        fi
    else
        warn "跳过测试 (依赖未安装)"
    fi
}

# 生成报告
generate_report() {
    echo ""
    echo "=================================="
    info "健康检查报告"
    echo "=================================="
    echo ""
    echo "总检查项: $TOTAL_CHECKS"
    echo "通过: $PASSED_CHECKS"
    echo "失败: $FAILED_CHECKS"
    echo ""
    
    if [ "$FAILED_CHECKS" -eq 0 ]; then
        success "所有检查项通过！项目状态良好。"
        echo ""
        info "可以使用以下命令启动项目:"
        echo "  开发模式: ./start.sh dev"
        echo "  生产模式: ./start.sh prod"
        echo "  或: $PACKAGE_MANAGER run dev"
    else
        warn "发现 $FAILED_CHECKS 个问题，建议运行修复脚本:"
        echo "  ./fix.sh full"
    fi
    echo ""
}

# 显示帮助
show_help() {
    echo "企业级Next.js项目健康检查脚本"
    echo ""
    echo "用法: $0 [OPTION]"
    echo ""
    echo "选项:"
    echo "  --quick    快速检查 (跳过测试)"
    echo "  --full     完整检查 (默认)"
    echo "  --help     显示帮助信息"
    echo ""
    echo "检查项目:"
    echo "  - 系统依赖 (Node.js, npm/pnpm, PM2)"
    echo "  - 项目文件结构"
    echo "  - 依赖安装状态"
    echo "  - 配置文件语法"
    echo "  - 环境变量配置"
    echo "  - 构建状态"
    echo "  - 端口占用情况"
    echo "  - PM2 运行状态"
    echo "  - 代码质量检查"
}

# 主函数
main() {
    case "${1:-full}" in
        --quick)
            check_system_dependencies
            check_project_files
            check_dependencies
            check_config_syntax
            generate_report
            ;;
        --full|full)
            check_system_dependencies
            check_project_files
            check_dependencies
            check_config_syntax
            check_environment
            check_build_status
            check_ports
            check_pm2_status
            run_quick_test
            generate_report
            ;;
        --help|help|-h)
            show_help
            ;;
        *)
            error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
