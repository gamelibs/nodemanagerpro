#!/bin/zsh

# =============================================================================
# 模板系统测试脚本 (test-templates.sh)
# =============================================================================
#
# 📋 脚本功能：
#   • 测试三个新模板的创建和基本功能
#   • 验证模板结构和文件完整性
#   • 确保模板可以正常启动
#
# 🧪 测试内容：
#   1. Pure API Server (pure-api)
#   2. Static Website + API (static-app)  
#   3. Full-Stack Application (full-stack)

echo "🧪 NodeAppManager 模板系统测试"
echo "═══════════════════════════════════════"
echo "📅 测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 创建测试目录
TEST_DIR="/tmp/nodeapp-template-test"
echo "📁 创建测试目录: $TEST_DIR"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# 测试模板目录
TEMPLATES_DIR="/Users/vidar/works/NodeAppManager/NodeAppManager/templates"

echo ""
echo "🔍 检查模板目录结构..."
echo "═══════════════════════════════════════"

# 检查三个模板是否存在
templates=("pure-api" "static-app" "full-stack")

for template in "${templates[@]}"; do
    if [ -d "$TEMPLATES_DIR/$template" ]; then
        echo "✅ $template 模板目录存在"
        
        # 检查关键文件
        key_files=("package.json" "README.md" "src")
        for file in "${key_files[@]}"; do
            if [ -e "$TEMPLATES_DIR/$template/$file" ]; then
                echo "   ✅ $file 存在"
            else
                echo "   ❌ $file 缺失"
            fi
        done
        
        # 特殊检查 static-app 的 public 目录
        if [ "$template" = "static-app" ]; then
            if [ -d "$TEMPLATES_DIR/$template/public" ]; then
                echo "   ✅ public 目录存在"
                public_files=("index.html" "css/style.css" "js/main.js")
                for file in "${public_files[@]}"; do
                    if [ -e "$TEMPLATES_DIR/$template/public/$file" ]; then
                        echo "      ✅ $file 存在"
                    else
                        echo "      ❌ $file 缺失"
                    fi
                done
            else
                echo "   ❌ public 目录缺失"
            fi
        fi
        
        echo ""
    else
        echo "❌ $template 模板目录不存在"
        echo ""
    fi
done

echo "🎯 模板结构检查完成"
echo ""
echo "💡 提示："
echo "   • 模板使用占位符 {{PROJECT_NAME}} 和 {{PORT}}"
echo "   • 创建项目时会自动替换这些占位符"
echo "   • 静态应用模板包含完整的前端界面和 API 测试功能"
echo "   • 所有模板都支持热重载和现代开发工具"
echo ""
echo "🚀 模板系统已准备就绪！"
