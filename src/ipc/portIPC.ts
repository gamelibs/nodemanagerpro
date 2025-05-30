import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

let isSetup = false;

/**
 * 设置端口检测 IPC 处理器
 */
export function setupPortIPC() {
  if (isSetup) {
    console.log('🔗 端口检测 IPC 处理器已存在，跳过重复设置');
    return;
  }

  // 清除可能存在的旧处理器
  try {
    ipcMain.removeHandler('port:check');
    ipcMain.removeHandler('project:update-port');
  } catch (error) {
    // 忽略移除不存在处理器的错误
  }

  // 检查端口是否被占用
  ipcMain.handle('port:check', async (_, port: number) => {
    try {
      console.log(`🔍 检查端口 ${port} 是否可用...`);
      
      // 使用 lsof 命令检查端口占用 (macOS/Linux)
      // 对于 Windows 可以使用 netstat
      const command = process.platform === 'win32' 
        ? `netstat -ano | findstr :${port}`
        : `lsof -ti :${port}`;

      try {
        const { stdout } = await execAsync(command);
        
        if (stdout.trim()) {
          // 端口被占用，尝试获取进程信息
          let occupiedBy = '未知进程';
          
          if (process.platform !== 'win32') {
            try {
              const pidCommand = `lsof -ti :${port}`;
              const { stdout: pidOutput } = await execAsync(pidCommand);
              const pid = pidOutput.trim().split('\n')[0];
              
              if (pid) {
                const processCommand = `ps -p ${pid} -o comm=`;
                const { stdout: processOutput } = await execAsync(processCommand);
                occupiedBy = processOutput.trim() || `PID: ${pid}`;
              }
            } catch (processError) {
              console.log('获取进程信息失败:', processError);
            }
          }

          console.log(`❌ 端口 ${port} 被占用，占用进程: ${occupiedBy}`);
          return {
            available: false,
            occupiedBy: occupiedBy
          };
        } else {
          console.log(`✅ 端口 ${port} 可用`);
          return {
            available: true
          };
        }
      } catch (cmdError) {
        // 命令执行失败通常意味着端口未被占用
        console.log(`✅ 端口 ${port} 可用 (命令未找到占用进程)`);
        return {
          available: true
        };
      }
    } catch (error) {
      console.error(`❌ 检查端口 ${port} 时发生错误:`, error);
      return {
        available: false,
        error: error instanceof Error ? error.message : '检查端口时发生错误'
      };
    }
  });

  // 更新项目端口配置
  ipcMain.handle('project:update-port', async (_, { projectId, newPort }: { projectId: string, newPort: number }) => {
    try {
      console.log(`🔧 更新项目 ${projectId} 端口为 ${newPort}`);
      
      // 读取项目配置文件
      const projectsFilePath = path.join(process.cwd(), 'temp', 'projects.json');
      
      if (!fs.existsSync(projectsFilePath)) {
        return {
          success: false,
          error: '项目配置文件不存在'
        };
      }

      const projectsData = JSON.parse(fs.readFileSync(projectsFilePath, 'utf-8'));
      
      // 查找并更新项目
      const projectIndex = projectsData.findIndex((p: any) => p.id === projectId);
      if (projectIndex === -1) {
        return {
          success: false,
          error: '未找到指定项目'
        };
      }

      // 更新端口
      projectsData[projectIndex].port = newPort;
      
      // 保存文件
      fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
      
      console.log(`✅ 项目端口更新成功: ${projectId} → ${newPort}`);
      return {
        success: true
      };
      
    } catch (error) {
      console.error(`❌ 更新项目端口失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新端口时发生错误'
      };
    }
  });

  isSetup = true;
  console.log('✅ 端口检测 IPC 处理器设置完成');
}
