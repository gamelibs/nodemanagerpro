#!/bin/bash

# 修复编译后的 .cjs 文件中的相对路径引用
echo "🔧 修复 .cjs 文件中的相对路径引用..."

# 在 dist/src 目录下的所有 .cjs 文件中，将相对路径的文件引用添加 .cjs 扩展名
find ./dist/src -name "*.cjs" -exec sed -i '' 's|require("../services/FileSystemService")|require("../services/FileSystemService.cjs")|g' {} \;
find ./dist/src -name "*.cjs" -exec sed -i '' 's|require("../types/index")|require("../types/index.cjs")|g' {} \;

echo "✅ 路径修复完成"
