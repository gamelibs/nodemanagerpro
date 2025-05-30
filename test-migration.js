import { ProjectService } from '../src/services/ProjectService';

async function testFileSystemMigration() {
  console.log('🧪 开始测试文件系统迁移...');
  
  try {
    // 测试获取存储信息
    const storageInfo = await ProjectService.getStorageInfo();
    console.log('📊 存储信息:', storageInfo);
    
    // 测试加载项目
    const result = await ProjectService.getAllProjects();
    console.log('📁 加载项目结果:', result);
    
    if (result.success && result.data) {
      console.log(`✅ 成功加载 ${result.data.length} 个项目`);
      result.data.forEach((project: any, index: number) => {
        console.log(`  ${index + 1}. ${project.name} (${project.type})`);
      });
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 执行测试
testFileSystemMigration();
