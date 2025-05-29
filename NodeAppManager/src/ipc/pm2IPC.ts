import { ipcMain } from 'electron';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

// 使用 require 导入 PM2 避免 ES modules 问题
const pm2 = require('pm2');

const execAsync = promisify(exec);

let isSetup = false;
let isConnected = false;

/**
 * 设置 PM2 IPC 处理器
 */
export function setupPM2IPC() {
  if (isSetup) {
    console.log('🔗 PM2 IPC 处理器已存在，跳过重复设置');
    return;
  }

  // 清除可能存在的旧处理器
  try {
    ipcMain.removeHandler('pm2:check-installation');
    ipcMain.removeHandler('pm2:install');
    ipcMain.removeHandler('pm2:version');
    ipcMain.removeHandler('pm2:connect');
    ipcMain.removeHandler('pm2:start');
    ipcMain.removeHandler('pm2:stop');
    ipcMain.removeHandler('pm2:restart');
    ipcMain.removeHandler('pm2:delete');
    ipcMain.removeHandler('pm2:list');
    ipcMain.removeHandler('pm2:describe');
    ipcMain.removeHandler('pm2:logs');
    ipcMain.removeHandler('pm2:start-log-stream');
    ipcMain.removeHandler('pm2:stop-log-stream');
  } catch (error) {
    // 忽略移除不存在处理器的错误
  }

  // 检查 PM2 安装状态
  ipcMain.handle('pm2:check-installation', async () => {
    try {
      await execAsync('pm2 --version');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'PM2 未安装' 
      };
    }
  });

  // 安装 PM2
  ipcMain.handle('pm2:install', async () => {
    try {
      console.log('📦 开始安装 PM2...');
      await execAsync('npm install -g pm2');
      console.log('✅ PM2 安装完成');
      return { success: true };
    } catch (error) {
      console.error('❌ PM2 安装失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'PM2 安装失败' 
      };
    }
  });

  // 获取 PM2 版本
  ipcMain.handle('pm2:version', async () => {
    try {
      const { stdout } = await execAsync('pm2 --version');
      return { 
        success: true, 
        version: stdout.trim() 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取版本失败' 
      };
    }
  });

  // 连接到 PM2
  ipcMain.handle('pm2:connect', async () => {
    if (isConnected) {
      return { success: true };
    }

    return new Promise((resolve) => {
      pm2.connect((err: any) => {
        if (err) {
          console.error('❌ PM2 连接失败:', err);
          resolve({ 
            success: false, 
            error: err.message 
          });
        } else {
          isConnected = true;
          console.log('✅ PM2 连接成功');
          resolve({ success: true });
        }
      });
    });
  });

  // 启动项目
  ipcMain.handle('pm2:start', async (_, config) => {
    try {
      await ensureConnected();
      
      return new Promise((resolve) => {
        pm2.start(config, (err: any, proc: any) => {
          if (err) {
            console.error('❌ PM2 启动失败:', err);
            resolve({ 
              success: false, 
              error: err.message 
            });
          } else {
            console.log(`✅ PM2 启动成功: ${config.name}`);
            resolve({ 
              success: true, 
              processId: proc && proc[0] ? proc[0].pm_id : undefined
            });
          }
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '启动失败' 
      };
    }
  });

  // 停止项目
  ipcMain.handle('pm2:stop', async (_, projectId) => {
    try {
      await ensureConnected();
      
      return new Promise((resolve) => {
        pm2.stop(projectId, (err: any) => {
          if (err) {
            console.error('❌ PM2 停止失败:', err);
            resolve({ 
              success: false, 
              error: err.message 
            });
          } else {
            console.log(`✅ PM2 停止成功: ${projectId}`);
            resolve({ success: true });
          }
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '停止失败' 
      };
    }
  });

  // 重启项目
  ipcMain.handle('pm2:restart', async (_, projectId) => {
    try {
      await ensureConnected();
      
      return new Promise((resolve) => {
        // 首先尝试删除现有进程（如果存在）
        pm2.delete(projectId, (deleteErr: any) => {
          // 忽略删除错误（进程可能不存在）
          if (deleteErr) {
            console.log(`⚠️ 删除进程 ${projectId} 时出错（可能不存在）:`, deleteErr.message);
          } else {
            console.log(`🗑️ 成功删除进程 ${projectId}`);
          }
          
          // 无论删除是否成功，都标识需要重新启动
          console.log(`🔄 进程 ${projectId} 需要重新启动`);
          resolve({ 
            success: false, 
            error: `进程需要重新启动`,
            needsStart: true // 标识需要重新启动而不是重启
          });
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '重启失败',
        needsStart: true
      };
    }
  });

  // 删除项目
  ipcMain.handle('pm2:delete', async (_, projectId) => {
    try {
      await ensureConnected();
      
      return new Promise((resolve) => {
        pm2.delete(projectId, (err: any) => {
          if (err) {
            console.error('❌ PM2 删除失败:', err);
            resolve({ 
              success: false, 
              error: err.message 
            });
          } else {
            console.log(`✅ PM2 删除成功: ${projectId}`);
            resolve({ success: true });
          }
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '删除失败' 
      };
    }
  });

  // 获取进程列表
  ipcMain.handle('pm2:list', async () => {
    try {
      await ensureConnected();
      
      return new Promise((resolve) => {
        pm2.list((err: any, list: any) => {
          if (err) {
            console.error('❌ PM2 获取列表失败:', err);
            resolve({ 
              success: false, 
              error: err.message 
            });
          } else {
            resolve({ 
              success: true, 
              processes: list 
            });
          }
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取列表失败' 
      };
    }
  });

  // 获取项目详细信息
  ipcMain.handle('pm2:describe', async (_, projectId) => {
    try {
      await ensureConnected();
      
      return new Promise((resolve) => {
        pm2.describe(projectId, (err: any, desc: any) => {
          if (err) {
            console.error('❌ PM2 获取描述失败:', err);
            resolve({ 
              success: false, 
              error: err.message 
            });
          } else {
            resolve({ 
              success: true, 
              data: desc
            });
          }
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取描述失败' 
      };
    }
  });

  // 获取日志
  ipcMain.handle('pm2:logs', async (_, projectId, lines = 100) => {
    try {
      // 使用 pm2 logs 命令获取日志
      const { stdout } = await execAsync(`pm2 logs ${projectId} --lines ${lines} --nostream`);
      
      // 解析日志内容
      const logs = parseLogOutput(stdout, projectId);
      
      return { 
        success: true, 
        logs 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取日志失败' 
      };
    }
  });

  // 开始日志流
  ipcMain.handle('pm2:start-log-stream', async (event, projectId) => {
    try {
      // 启动 pm2 logs 命令进行实时日志流
      const logProcess = spawn('pm2', ['logs', projectId, '--raw'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      logProcess.stdout?.on('data', (data) => {
        const logData = {
          message: data.toString(),
          timestamp: new Date(),
          process: projectId,
          type: 'out' as const
        };
        event.sender.send('pm2:log-data', logData);
      });

      logProcess.stderr?.on('data', (data) => {
        const logData = {
          message: data.toString(),
          timestamp: new Date(),
          process: projectId,
          type: 'err' as const
        };
        event.sender.send('pm2:log-data', logData);
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '启动日志流失败' 
      };
    }
  });

  // 停止日志流
  ipcMain.handle('pm2:stop-log-stream', async (_, _projectId) => {
    // 在实际实现中，这里需要管理日志流的生命周期
    return { success: true };
  });

  isSetup = true;
  console.log('✅ PM2 IPC 处理器设置完成');
}

/**
 * 确保 PM2 已连接
 */
async function ensureConnected(): Promise<void> {
  if (!isConnected) {
    return new Promise((resolve, reject) => {
      pm2.connect((err: any) => {
        if (err) {
          reject(new Error(`PM2 连接失败: ${err.message}`));
        } else {
          isConnected = true;
          resolve();
        }
      });
    });
  }
}

/**
 * 解析 PM2 日志输出
 */
function parseLogOutput(output: string, projectId: string) {
  const lines = output.split('\n').filter(line => line.trim());
  const logs = [];

  for (const line of lines) {
    // PM2 日志格式示例: 2024-05-27T10:30:45: PM2 | App [project-id] online
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    const timestamp = timestampMatch ? new Date(timestampMatch[1]) : new Date();
    
    // 检测日志级别
    let level: 'info' | 'warn' | 'error' | 'success' = 'info';
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('err')) {
      level = 'error';
    } else if (line.toLowerCase().includes('warn')) {
      level = 'warn';
    } else if (line.toLowerCase().includes('success') || line.toLowerCase().includes('online')) {
      level = 'success';
    }

    logs.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      projectId,
      timestamp,
      level,
      message: line,
      source: 'stdout' as const
    });
  }

  return logs;
}

/**
 * 断开 PM2 连接
 */
export function disconnectPM2() {
  if (isConnected) {
    pm2.disconnect();
    isConnected = false;
    console.log('📡 PM2 连接已断开');
  }
}
