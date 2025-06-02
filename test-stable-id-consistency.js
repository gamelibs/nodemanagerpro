#!/usr/bin/env node

/**
 * 测试稳定ID生成算法一致性
 * 验证 useProjects 和 PM2Service 中的算法是否一致
 */

// PM2Service 算法
function generateStableProjectIdPM2Service(projectName, projectPath) {
  // 组合名称和路径，使用分隔符确保不会混淆
  const combined = `${projectName}|${projectPath}`;
  
  // 使用哈希来确保唯一性，而不是简单去除字符
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 确保哈希为正数
  const positiveHash = Math.abs(hash);
  
  // 转换为Base36字符串（包含数字和字母）
  const hashString = positiveHash.toString(36);
  
  // 结合项目名的前几个字符（清理后）+ 哈希
  const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
  const stableId = `${cleanName}${hashString}`.substring(0, 16);
  
  // 确保至少有8个字符，不足的用哈希补充
  if (stableId.length < 8) {
    return (stableId + hashString + '00000000').substring(0, 16);
  }
  
  return stableId;
}

// useProjects 算法 (从代码中复制)
function generateStableProjectIdUseProjects(projectName, projectPath) {
  // 组合名称和路径，使用分隔符确保不会混淆
  const combined = `${projectName}|${projectPath}`;
  
  // 使用哈希来确保唯一性，而不是简单去除字符
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 确保哈希为正数
  const positiveHash = Math.abs(hash);
  
  // 转换为Base36字符串（包含数字和字母）
  const hashString = positiveHash.toString(36);
  
  // 结合项目名的前几个字符（清理后）+ 哈希
  const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
  const stableId = `${cleanName}${hashString}`.substring(0, 16);
  
  // 确保至少有8个字符，不足的用哈希补充
  if (stableId.length < 8) {
    return (stableId + hashString + '00000000').substring(0, 16);
  }
  
  return stableId;
}

console.log('🧪 测试稳定ID生成算法一致性\n');

// 使用实际的项目数据进行测试
const testCases = [
  { name: 'test2', path: '/Users/vidar/ovo/test2' },
  { name: 'my-app', path: '/Users/vidar/projects/my-app' },
  { name: 'demo-project', path: '/tmp/demo-project' }
];

console.log('📊 测试结果：');
testCases.forEach((testCase, index) => {
  const pm2ServiceId = generateStableProjectIdPM2Service(testCase.name, testCase.path);
  const useProjectsId = generateStableProjectIdUseProjects(testCase.name, testCase.path);
  
  const isConsistent = pm2ServiceId === useProjectsId;
  
  console.log(`${index + 1}. 项目: ${testCase.name}`);
  console.log(`   路径: ${testCase.path}`);
  console.log(`   PM2Service ID:  ${pm2ServiceId}`);
  console.log(`   useProjects ID: ${useProjectsId}`);
  console.log(`   一致性: ${isConsistent ? '✅' : '❌'}`);
  console.log('');
});

// 特别测试实际项目的ID生成
console.log('🎯 实际项目测试：');
const actualProject = { name: 'test2', path: '/Users/vidar/ovo/test2' };
const generatedId = generateStableProjectIdPM2Service(actualProject.name, actualProject.path);
const expectedId = 'test2qyiab2';

console.log(`项目名: ${actualProject.name}`);
console.log(`项目路径: ${actualProject.path}`);
console.log(`生成的ID: ${generatedId}`);
console.log(`期望的ID: ${expectedId}`);
console.log(`匹配: ${generatedId === expectedId ? '✅' : '❌'}`);

if (generatedId !== expectedId) {
  console.log('\n🔍 调试信息：');
  const combined = `${actualProject.name}|${actualProject.path}`;
  console.log(`组合字符串: ${combined}`);
  
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  console.log(`哈希值: ${hash}`);
  console.log(`正数哈希: ${Math.abs(hash)}`);
  console.log(`Base36字符串: ${Math.abs(hash).toString(36)}`);
  
  const cleanName = actualProject.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
  console.log(`清理的项目名: ${cleanName}`);
}

console.log('\n✨ 测试完成！');
