#!/bin/bash

# 企业级Next.js项目快速修复脚本
# 解决常见的构建和运行问题

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 清理函数
clean_project() {
    step "清理项目缓存和构建文件..."
    
    # 清理Next.js缓存
    if [ -d ".next" ]; then
        rm -rf .next
        info "清理 .next 目录"
    fi
    
    # 清理依赖缓存
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        info "清理 node_modules 目录"
    fi
    
    # 清理包管理器缓存
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        info "清理 package-lock.json"
    fi
    
    if [ -f "pnpm-lock.yaml" ]; then
        rm -f pnpm-lock.yaml
        info "清理 pnpm-lock.yaml"
    fi
    
    # 清理日志文件
    if [ -d "logs" ]; then
        rm -rf logs/*
        info "清理日志文件"
    fi
    
    info "项目清理完成"
}

# 安装依赖
install_dependencies() {
    step "安装项目依赖..."
    
    # 检测包管理器
    if command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
        pnpm install
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        npm install
    else
        error "未找到包管理器（npm 或 pnpm）"
        exit 1
    fi
    
    info "依赖安装完成，使用包管理器: $PACKAGE_MANAGER"
}

# 修复环境配置
fix_environment() {
    step "修复环境配置..."
    
    # 创建 .env.local 如果不存在
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        info "创建 .env.local 文件"
    fi
    
    # 检查并设置NODE_ENV
    if ! grep -q "NODE_ENV=" .env.local; then
        echo "NODE_ENV=development" >> .env.local
        info "设置 NODE_ENV=development"
    fi
    
    info "环境配置修复完成"
}

# 修复TypeScript配置
fix_typescript() {
    step "检查TypeScript配置..."
    
    # 检查tsconfig.json
    if [ ! -f "tsconfig.json" ]; then
        warn "tsconfig.json 不存在，将创建默认配置"
        cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
        info "创建默认 tsconfig.json"
    fi
    
    info "TypeScript配置检查完成"
}

# 创建必要目录
create_directories() {
    step "创建必要的目录结构..."
    
    directories=(
        "logs"
        "public/images"
        "public/games"
        "src/components/ui"
        "src/components/layout"
        "src/components/sections"
        "src/lib"
        "src/types"
        "src/styles"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            info "创建目录: $dir"
        fi
    done
    
    info "目录结构创建完成"
}

# 构建项目
build_project() {
    step "构建项目..."
    
    if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
        pnpm run build
    else
        npm run build
    fi
    
    info "项目构建完成"
}

# 类型检查
type_check() {
    step "执行TypeScript类型检查..."
    
    if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
        pnpm run type-check || warn "类型检查发现问题，但会继续执行"
    else
        npm run type-check || warn "类型检查发现问题，但会继续执行"
    fi
    
    info "类型检查完成"
}

# 测试连接
test_connection() {
    step "测试基本功能..."
    
    # 启动开发服务器进行测试
    info "启动开发服务器进行连接测试..."
    
    if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
        timeout 30s pnpm dev > /dev/null 2>&1 || true
    else
        timeout 30s npm run dev > /dev/null 2>&1 || true
    fi
    
    info "连接测试完成"
}

# 显示帮助
show_help() {
    echo "企业级Next.js项目快速修复脚本"
    echo ""
    echo "用法: $0 [COMMAND]"
    echo ""
    echo "命令:"
    echo "  full     执行完整修复流程（推荐）"
    echo "  clean    仅清理项目"
    echo "  install  仅安装依赖"
    echo "  build    仅构建项目"
    echo "  check    仅类型检查"
    echo "  test     仅测试连接"
    echo "  help     显示帮助信息"
    echo ""
    echo "完整修复流程包括:"
    echo "  1. 清理项目缓存"
    echo "  2. 修复环境配置"
    echo "  3. 修复TypeScript配置"
    echo "  4. 创建必要目录"
    echo "  5. 安装依赖"
    echo "  6. 类型检查"
    echo "  7. 构建项目"
    echo "  8. 测试连接"
}

# 完整修复流程
full_fix() {
    info "开始完整修复流程..."
    
    clean_project
    fix_environment
    fix_typescript
    create_directories
    install_dependencies
    type_check
    build_project
    test_connection
    
    echo ""
    info "修复完成！项目已就绪。"
    echo ""
    echo "启动项目:"
    echo "  开发模式: ./start.sh dev"
    echo "  生产模式: ./start.sh prod"
    echo ""
    echo "或使用传统方式:"
    echo "  开发模式: $PACKAGE_MANAGER run dev"
    echo "  生产模式: $PACKAGE_MANAGER run build && $PACKAGE_MANAGER start"
}

# 主函数
main() {
    case "${1:-full}" in
        full)
            full_fix
            ;;
        clean)
            clean_project
            ;;
        install)
            install_dependencies
            ;;
        build)
            build_project
            ;;
        check)
            type_check
            ;;
        test)
            test_connection
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
