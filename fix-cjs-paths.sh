#!/bin/bash

# =============================================================================
# CJS 路径修复脚本 (fix-cjs-paths.sh)
# =============================================================================
# 
# 🎯 解决问题：
#   修复编译后的 .cjs 文件中的相对路径引用
#   确保 CommonJS 模块能够正确导入其他模块
#
# 🔧 修复内容：
#   • 将 ./TemplateVariableService 改为 ./TemplateVariableService.cjs
#   • 将相对路径的 .js 扩展名改为 .cjs
#   • 保持绝对路径和 node_modules 引用不变
#
# =============================================================================

echo "🔧 修复 .cjs 文件中的相对路径引用..."

# 修复 FileSystemService.cjs 中的 TemplateVariableService 导入
if [ -f "./dist/src/services/FileSystemService.cjs" ]; then
    sed -i '' 's|require("./TemplateVariableService")|require("./TemplateVariableService.cjs")|g' ./dist/src/services/FileSystemService.cjs
    echo "✅ 修复 FileSystemService.cjs 中的导入路径"
fi

# 修复 IPC 文件中的服务导入
find ./dist/src/ipc -name "*.cjs" -type f -exec sed -i '' 's|require("../services/\([^"]*\)")|require("../services/\1.cjs")|g' {} \;
echo "✅ 修复 IPC 文件中的服务导入路径"

# 修复所有服务文件中的相对路径引用  
find ./dist/src/services -name "*.cjs" -type f -exec sed -i '' 's|require("\./\([^"/.]*\)")|require("./\1.cjs")|g' {} \;
echo "✅ 修复服务文件中的相对导入路径"

echo "✅ 路径修复完成"
