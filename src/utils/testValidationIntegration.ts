/**
 * 测试验证功能集成
 * 用于验证项目导入和选择时的验证流程是否正常工作
 */

import { ProjectValidationService } from '../services/ProjectValidationService';
import type { Project } from '../types';

export async function testValidationIntegration() {
  console.log('🧪 开始测试验证功能集成...');
  
  // 创建测试项目对象
  const testProject: Project = {
    id: 'test-validation-' + Date.now(),
    name: 'TestProject',
    path: '/Users/vidar/works/NodeAppManager', // 使用当前项目路径作为测试
    type: 'node',
    lastOpened: new Date(),
    packageManager: 'npm',
    scripts: [],
    description: '验证集成测试项目'
  };

  try {
    console.log('📋 测试项目信息:', testProject);
    
    // 测试配置验证
    console.log('\n1️⃣ 测试项目配置验证...');
    const configResult = await ProjectValidationService.validateProjectConfiguration(
      testProject.path,
      (message, level) => console.log(`[${level?.toUpperCase()}] ${message}`)
    );
    
    console.log('✅ 配置验证结果:', configResult.success ? '成功' : '失败');
    if (configResult.data) {
      console.log('📦 Package.json存在:', configResult.data.hasPackageJson);
      console.log('🔧 包管理器:', configResult.data.packageManager);
      console.log('📜 脚本数量:', Object.keys(configResult.data.scripts || {}).length);
    }

    // 测试PM2状态检查
    console.log('\n2️⃣ 测试PM2状态检查...');
    const pm2Result = await ProjectValidationService.checkPM2Status(
      testProject,
      (message, level) => console.log(`[${level?.toUpperCase()}] ${message}`)
    );
    
    console.log('✅ PM2状态检查结果:', pm2Result.success ? '成功' : '失败');
    if (pm2Result.data) {
      console.log('🔄 PM2运行状态:', pm2Result.data.isRunning ? '运行中' : '未运行');
    }

    // 测试综合验证
    console.log('\n3️⃣ 测试综合验证...');
    const fullValidationResult = await ProjectValidationService.validateProject(
      testProject,
      (message, level) => console.log(`[${level?.toUpperCase()}] ${message}`)
    );
    
    console.log('✅ 综合验证结果:', fullValidationResult.success ? '成功' : '失败');
    if (fullValidationResult.data) {
      console.log('📋 配置数据:', fullValidationResult.data.configuration?.hasPackageJson ? '有效' : '无效');
      console.log('🔄 PM2数据:', fullValidationResult.data.pm2Status?.isRunning !== undefined ? '有效' : '无效');
    }

    console.log('\n🎉 验证功能集成测试完成！');
    return {
      success: true,
      results: {
        config: configResult.success,
        pm2: pm2Result.success,
        full: fullValidationResult.success
      }
    };

  } catch (error) {
    console.error('❌ 验证功能集成测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 在开发环境中可以调用这个函数进行测试
if (typeof window !== 'undefined' && (window as any).electronAPI) {
  // 将测试函数暴露到全局，方便在控制台调用
  (window as any).testValidationIntegration = testValidationIntegration;
  console.log('🔧 验证集成测试函数已暴露到 window.testValidationIntegration()');
}
