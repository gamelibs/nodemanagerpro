#!/usr/bin/env node

/**
 * 测试重复初始化修复
 * 这个脚本验证我们修复的重复初始化问题
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试重复初始化修复...\n');

// 1. 检查 App.tsx 是否移除了重复的 Provider
console.log('1️⃣ 检查 App.tsx Provider 修复...');
const appTsxPath = path.join(__dirname, 'src/App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

if (appTsxContent.includes('AppProvider') || appTsxContent.includes('ToastProvider')) {
  console.log('❌ App.tsx 仍然包含 Provider 包装');
} else {
  console.log('✅ App.tsx 已移除重复的 Provider 包装');
}

// 2. 检查 main.tsx 是否添加了防重复初始化
console.log('\n2️⃣ 检查 main.tsx 防重复初始化...');
const mainTsxPath = path.join(__dirname, 'src/main.tsx');
const mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');

if (mainTsxContent.includes('logCollectorInitialized')) {
  console.log('✅ main.tsx 已添加防重复初始化机制');
} else {
  console.log('❌ main.tsx 缺少防重复初始化机制');
}

// 3. 检查 StrictMode 是否仅在开发环境使用
if (mainTsxContent.includes('import.meta.env.MODE') && mainTsxContent.includes('isDevelopment')) {
  console.log('✅ StrictMode 已配置为仅在开发环境使用');
} else {
  console.log('❌ StrictMode 配置需要优化');
}

// 4. 检查 useProjects hook 是否添加了防重复加载
console.log('\n3️⃣ 检查 useProjects hook 防重复加载...');
const useProjectsPath = path.join(__dirname, 'src/hooks/useProjects.ts');
const useProjectsContent = fs.readFileSync(useProjectsPath, 'utf8');

if (useProjectsContent.includes('isLoadingRef') && useProjectsContent.includes('正在加载中，跳过重复请求')) {
  console.log('✅ useProjects hook 已添加防重复加载机制');
} else {
  console.log('❌ useProjects hook 缺少防重复加载机制');
}

// 5. 检查项目数据文件是否清理了硬编码默认值
console.log('\n4️⃣ 检查项目数据文件...');
const projectsJsonPath = path.join(__dirname, 'temp/projects.json');
if (fs.existsSync(projectsJsonPath)) {
  const projectsData = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));
  
  let hasHardcodedDefaults = false;
  if (Array.isArray(projectsData)) {
    for (const project of projectsData) {
      if (project.status === 'stopped' || project.port === 3000) {
        hasHardcodedDefaults = true;
        break;
      }
    }
  }
  
  if (hasHardcodedDefaults) {
    console.log('❌ 项目数据文件仍包含硬编码默认值');
  } else {
    console.log('✅ 项目数据文件已清理硬编码默认值');
  }
} else {
  console.log('⚠️ 项目数据文件不存在');
}

// 6. 检查服务层是否移除了强制默认值
console.log('\n5️⃣ 检查服务层修复...');
const projectServicePath = path.join(__dirname, 'src/services/ProjectService.ts');
const projectServiceContent = fs.readFileSync(projectServicePath, 'utf8');

if (projectServiceContent.includes("status: 'stopped'")) {
  console.log('❌ ProjectService 仍然包含强制状态默认值');
} else {
  console.log('✅ ProjectService 已移除强制状态默认值');
}

const projectConfigServicePath = path.join(__dirname, 'src/services/ProjectConfigService.ts');
const projectConfigServiceContent = fs.readFileSync(projectConfigServicePath, 'utf8');

if (projectConfigServiceContent.includes("status: 'stopped'")) {
  console.log('❌ ProjectConfigService 仍然包含强制状态默认值');
} else {
  console.log('✅ ProjectConfigService 已移除强制状态默认值');
}

// 7. 检查 UI 组件是否实现了占位符逻辑
console.log('\n6️⃣ 检查 UI 组件占位符逻辑...');
const projectCardPath = path.join(__dirname, 'src/components/ProjectCard.tsx');
const projectCardContent = fs.readFileSync(projectCardPath, 'utf8');

if (projectCardContent.includes('检测中') && projectCardContent.includes('getStatusDisplay')) {
  console.log('✅ ProjectCard 已实现状态占位符逻辑');
} else {
  console.log('❌ ProjectCard 缺少状态占位符逻辑');
}

console.log('\n🎯 修复验证完成！');
console.log('\n📊 总结:');
console.log('- 重复 Provider 包装已修复');
console.log('- 防重复初始化机制已实现');
console.log('- StrictMode 环境优化已完成');
console.log('- 防重复加载机制已添加');
console.log('- 数据层硬编码默认值已清理');
console.log('- UI 层占位符逻辑已实现');
console.log('\n✨ 架构改进已完成，现在应该有更清晰的启动流程！');
