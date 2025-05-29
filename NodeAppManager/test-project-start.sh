#!/bin/bash

# 测试项目启动功能
echo "🧪 测试项目启动功能"
echo "══════════════════════"

# 检查NodeAppManager是否运行
if ! curl -s http://localhost:9966 > /dev/null; then
    echo "❌ NodeAppManager 未运行"
    exit 1
fi

# 检查测试项目是否存在
if [ ! -d "/Users/vidar/ovo/test" ]; then
    echo "❌ 测试项目不存在"
    exit 1
fi

# 检查测试项目是否有必要的依赖
cd "/Users/vidar/ovo/test"
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
fi

# 测试项目能否正常启动
echo "🚀 测试项目启动..."
if npm run dev > /dev/null 2>&1 &
then
    PID=$!
    echo "✅ 项目启动成功 (PID: $PID)"
    sleep 3
    
    # 检查端口是否被占用
    if lsof -ti:8000 > /dev/null; then
        echo "✅ 项目正在端口 8000 上运行"
        
        # 测试API响应
        if curl -s http://localhost:8000 > /dev/null; then
            echo "✅ API 响应正常"
        else
            echo "⚠️  API 无响应"
        fi
    else
        echo "❌ 端口 8000 未被占用"
    fi
    
    # 停止测试进程
    kill $PID 2>/dev/null
    echo "🛑 测试进程已停止"
else
    echo "❌ 项目启动失败"
fi

echo ""
echo "🎯 手动测试步骤:"
echo "1. 在浏览器中打开 http://localhost:9966"
echo "2. 在项目列表中找到 'test' 项目"
echo "3. 点击 'Start' 按钮"
echo "4. 观察状态变化和日志输出"
echo "5. 打开 http://localhost:8000 验证项目运行"
echo "6. 点击 'Stop' 按钮停止项目"
