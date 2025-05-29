#!/usr/bin/env node

// 简单的测试脚本来验证目录选择功能
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟验证目录功能
function validateDirectory(dirPath) {
  try {
    // 检查路径是否存在
    const exists = fs.existsSync(dirPath);
    
    if (!exists) {
      return { success: false, exists: false, message: '目录不存在' };
    }

    // 检查是否是目录
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      return { success: false, exists: true, message: '路径不是目录' };
    }

    // 检查是否可读写
    try {
      fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (accessError) {
      return { success: false, exists: true, message: '目录不可读写' };
    }

    // 获取绝对路径
    const absolutePath = path.resolve(dirPath);
    
    return { 
      success: true, 
      exists: true, 
      path: absolutePath,
      message: '目录有效' 
    };
  } catch (error) {
    console.error('验证目录失败:', error);
    return { 
      success: false, 
      exists: false, 
      error: error.message 
    };
  }
}

// 测试一些路径
const testPaths = [
  '/Users/vidar',           // 真实路径
  '/Users/example/ovo',     // 假路径
  '/tmp',                   // 系统临时目录
  '/nonexistent',          // 不存在的路径
  __dirname                // 当前目录
];

console.log('🧪 测试目录验证功能:\n');

testPaths.forEach(testPath => {
  const result = validateDirectory(testPath);
  console.log(`路径: ${testPath}`);
  console.log(`结果: ${JSON.stringify(result, null, 2)}\n`);
});

console.log('✅ 目录验证测试完成');
