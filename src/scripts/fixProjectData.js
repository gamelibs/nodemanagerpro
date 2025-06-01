// 修复现有项目数据，添加缺失的 status 和 port 字段
const fs = require('fs');
const path = require('path');

const projectsFilePath = path.join(__dirname, '../../temp/projects.json');

try {
  if (!fs.existsSync(projectsFilePath)) {
    console.log('项目配置文件不存在');
    process.exit(0);
  }

  const projectsData = JSON.parse(fs.readFileSync(projectsFilePath, 'utf-8'));
  let hasChanges = false;

  console.log(`🔍 检查 ${projectsData.length} 个项目...`);

  projectsData.forEach((project, index) => {
    let projectChanged = false;

    // 添加缺失的 status 字段
    if (!project.status) {
      project.status = 'stopped'; // 默认状态为停止
      projectChanged = true;
      console.log(`  ✅ 项目 "${project.name}" 添加 status: stopped`);
    }

    // 添加缺失的 port 字段（如果可以推断）
    if (!project.port) {
      let defaultPort = null;
      
      // 根据项目类型推断默认端口
      switch (project.type) {
        case 'pure-api':
        case 'full-stack':
        case 'node':
          defaultPort = 3000;
          break;
        case 'react':
        case 'vue':
          defaultPort = 5173; // Vite 默认端口
          break;
        default:
          defaultPort = 3000;
      }

      if (defaultPort) {
        project.port = defaultPort;
        projectChanged = true;
        console.log(`  ✅ 项目 "${project.name}" 添加 port: ${defaultPort}`);
      }
    }

    if (projectChanged) {
      hasChanges = true;
    }
  });

  if (hasChanges) {
    // 备份原文件
    const backupPath = path.join(__dirname, '../../temp/projects.backup.json');
    fs.writeFileSync(backupPath, fs.readFileSync(projectsFilePath));
    console.log(`📁 原文件已备份到: ${backupPath}`);

    // 保存修复后的文件
    fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
    console.log(`✅ 项目数据修复完成，已保存到: ${projectsFilePath}`);
  } else {
    console.log('👍 所有项目数据都是完整的，无需修复');
  }

} catch (error) {
  console.error('❌ 修复项目数据时发生错误:', error.message);
  process.exit(1);
}
