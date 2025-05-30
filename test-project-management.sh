#!/bin/bash

# NodeAppManager 项目管理功能测试脚本
echo "🧪 开始测试 NodeAppManager 项目管理功能"
echo "═══════════════════════════════════════════════"

# 测试目录
TEST_BASE_DIR="/Users/vidar/temp/nam-test"
mkdir -p "$TEST_BASE_DIR"

echo "📁 测试目录: $TEST_BASE_DIR"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 检查应用是否运行
if ! curl -s http://localhost:9966 > /dev/null; then
    echo -e "${RED}❌ NodeAppManager 未运行，请先启动应用${NC}"
    exit 1
fi

echo -e "${GREEN}✅ NodeAppManager 正在运行${NC}"
echo ""

# 测试1: 检查现有项目
echo -e "${BLUE}🔍 测试1: 检查现有项目${NC}"
echo "当前项目列表:"
if [ -f "./temp/projects.json" ]; then
    cat "./temp/projects.json" | jq -r '.[] | "- \(.name) (\(.type)) - \(.status)"' 2>/dev/null || echo "无法解析项目数据"
else
    echo "未找到项目数据文件"
fi
echo ""

# 测试2: 创建测试项目目录结构
echo -e "${BLUE}🔍 测试2: 准备测试项目${NC}"

# 创建一个简单的Node.js项目用于测试
TEST_PROJECT_DIR="$TEST_BASE_DIR/test-project-$(date +%s)"
mkdir -p "$TEST_PROJECT_DIR"

cat > "$TEST_PROJECT_DIR/package.json" << EOF
{
  "name": "test-project",
  "version": "1.0.0",
  "description": "测试项目",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \\"测试通过\\""
  },
  "dependencies": {},
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

cat > "$TEST_PROJECT_DIR/index.js" << EOF
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>测试项目运行中！</h1><p>时间: ' + new Date().toLocaleString() + '</p>');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(\`🚀 测试服务器运行在 http://localhost:\${port}\`);
});
EOF

echo -e "${GREEN}✅ 测试项目已创建: $TEST_PROJECT_DIR${NC}"
echo ""

# 测试3: 检查项目模板
echo -e "${BLUE}🔍 测试3: 检查可用模板${NC}"
if [ -d "./templates" ]; then
    echo "可用模板:"
    for template in ./templates/*/; do
        template_name=$(basename "$template")
        if [ -f "$template/package.json" ]; then
            description=$(cat "$template/package.json" | jq -r '.description // "无描述"' 2>/dev/null || echo "无描述")
            echo "- $template_name: $description"
        else
            echo "- $template_name: (无package.json)"
        fi
    done
else
    echo "未找到模板目录"
fi
echo ""

# 测试4: 打开浏览器进行手动测试
echo -e "${BLUE}🔍 测试4: 打开浏览器进行手动测试${NC}"
echo "即将打开浏览器，请手动测试以下功能:"
echo "1. 查看项目列表"
echo "2. 创建新项目"
echo "3. 启动/停止项目"
echo "4. 查看项目设置"
echo "5. 查看日志"
echo ""

read -p "按回车键打开浏览器..."
open "http://localhost:9966"

echo ""
echo -e "${YELLOW}📋 手动测试清单:${NC}"
echo "□ 项目列表正确显示"
echo "□ 创建新项目功能正常"
echo "□ 项目启动功能正常"
echo "□ 项目停止功能正常"
echo "□ 项目设置功能正常"
echo "□ 实时日志功能正常"
echo "□ 界面响应正常"
echo ""

echo -e "${GREEN}✅ 测试脚本完成！${NC}"
echo "请在浏览器中进行手动测试，测试完成后可以删除测试目录:"
echo "rm -rf $TEST_BASE_DIR"
