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
    ipcMain.removeHandler('check-port');
    ipcMain.removeHandler('kill-port');
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

  // 检查端口占用状态（别名处理器，与PM2Service兼容）
  ipcMain.handle('check-port', async (_, port: number) => {
    try {
      console.log(`🔍 检查端口 ${port} 占用状态...`);
      
      const command = process.platform === 'win32' 
        ? `netstat -ano | findstr :${port}`
        : `lsof -ti :${port}`;

      try {
        const { stdout } = await execAsync(command);
        
        if (stdout.trim()) {
          return {
            occupied: true,
            available: false,
            pids: stdout.trim().split('\n').filter(pid => pid.trim())
          };
        } else {
          return {
            occupied: false,
            available: true
          };
        }
      } catch (cmdError) {
        return {
          occupied: false,
          available: true
        };
      }
    } catch (error) {
      console.error(`❌ 检查端口 ${port} 占用状态时发生错误:`, error);
      return {
        occupied: false,
        available: true,
        error: error instanceof Error ? error.message : '检查端口时发生错误'
      };
    }
  });

  // 清理端口占用
  ipcMain.handle('kill-port', async (_, port: number) => {
    try {
      console.log(`🛑 开始清理端口 ${port} 的占用进程...`);
      
      if (process.platform === 'win32') {
        // Windows 平台
        try {
          const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
          const lines = stdout.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(parseInt(pid))) {
              await execAsync(`taskkill /F /PID ${pid}`);
              console.log(`✅ 已终止 Windows 进程 PID: ${pid}`);
            }
          }
        } catch (winError) {
          console.log(`⚠️ Windows 端口清理命令执行失败，可能端口未被占用`);
        }
      } else {
        // macOS/Linux 平台
        try {
          // 先获取占用端口的进程PID
          const { stdout: pidOutput } = await execAsync(`lsof -ti :${port}`);
          const pids = pidOutput.trim().split('\n').filter(pid => pid.trim());
          
          if (pids.length > 0) {
            // 依次终止进程
            for (const pid of pids) {
              try {
                // 先尝试温和终止
                await execAsync(`kill ${pid}`);
                console.log(`✅ 已发送终止信号给进程 PID: ${pid}`);
                
                // 等待一段时间后检查进程是否还存在
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                  await execAsync(`kill -0 ${pid}`);
                  // 如果进程还存在，强制终止
                  await execAsync(`kill -9 ${pid}`);
                  console.log(`✅ 已强制终止进程 PID: ${pid}`);
                } catch (checkError) {
                  // 进程已经被终止
                  console.log(`✅ 进程 PID: ${pid} 已成功终止`);
                }
              } catch (killError) {
                console.warn(`⚠️ 终止进程 PID: ${pid} 失败:`, killError);
              }
            }
          } else {
            console.log(`ℹ️ 端口 ${port} 未被占用`);
          }
        } catch (nixError) {
          console.log(`⚠️ Unix/Linux 端口清理命令执行失败，可能端口未被占用`);
        }
      }
      
      // 等待端口释放
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 再次检查端口状态
      const command = process.platform === 'win32' 
        ? `netstat -ano | findstr :${port}`
        : `lsof -ti :${port}`;
        
      try {
        const { stdout } = await execAsync(command);
        if (stdout.trim()) {
          console.log(`⚠️ 端口 ${port} 仍被占用，清理可能不完全`);
          return {
            success: true,
            warning: '端口清理完成，但可能仍有进程占用'
          };
        } else {
          console.log(`✅ 端口 ${port} 清理成功`);
          return {
            success: true
          };
        }
      } catch (checkError) {
        console.log(`✅ 端口 ${port} 清理成功`);
        return {
          success: true
        };
      }
    } catch (error) {
      console.error(`❌ 清理端口 ${port} 时发生错误:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '清理端口时发生错误'
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
