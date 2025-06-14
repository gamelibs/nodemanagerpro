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
            const processInfo = proc && proc[0] ? proc[0] : null;
            resolve({ 
              success: true, 
              processId: processInfo ? processInfo.pm_id : undefined,
              pid: processInfo ? processInfo.pid : undefined,
              processName: config.name
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
      
      // 首先检查进程是否存在
      return new Promise((resolve) => {
        pm2.list((listErr: any, processes: any[]) => {
          if (listErr) {
            console.error('❌ 获取进程列表失败:', listErr.message);
            resolve({ 
              success: false, 
              error: `获取进程列表失败: ${listErr.message}` 
            });
            return;
          }
          
          // 查找对应的进程 - 支持多种匹配方式
          const targetProcess = processes.find(proc => 
            proc.name === projectId || // 直接匹配进程名称
            proc.pm_id === projectId || // 匹配PM2进程ID
            proc.name.endsWith(`-${projectId}`) || // 匹配格式为 ${name}-${id} 的进程名（向后兼容）
            proc.pm_id?.toString() === projectId // 匹配字符串格式的PM2进程ID
          );
          
          if (!targetProcess) {
            console.log(`⚠️ 进程 ${projectId} 不存在，可能已经停止`);
            resolve({ 
              success: true  // 进程不存在视为已停止，返回成功
            });
            return;
          }
          
          console.log(`⏹️ 找到进程 ${targetProcess.name}，状态: ${targetProcess.pm2_env?.status}，开始停止...`);
          
          // 使用找到的进程名称或ID进行停止
          const stopIdentifier = targetProcess.name || targetProcess.pm_id;
          pm2.stop(stopIdentifier, (err: any) => {
            if (err) {
              console.error('❌ PM2 停止失败:', err);
              resolve({ 
                success: false, 
                error: `停止失败: ${err.message}` 
              });
            } else {
              console.log(`✅ PM2 停止成功: ${projectId}`);
              resolve({ success: true });
            }
          });
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
      
      // 首先检查进程是否存在
      return new Promise((resolve) => {
        pm2.list((listErr: any, processes: any[]) => {
          if (listErr) {
            console.error('❌ 获取进程列表失败:', listErr.message);
            resolve({ 
              success: false, 
              error: `获取进程列表失败: ${listErr.message}` 
            });
            return;
          }
          
          // 查找对应的进程
          const targetProcess = processes.find(proc => 
            proc.name === projectId || proc.pm_id === projectId
          );
          
          if (!targetProcess) {
            console.error(`❌ 未找到进程 ${projectId}，当前进程:`, processes.map(p => p.name));
            resolve({ 
              success: false, 
              error: `进程 ${projectId} 不存在，请先启动项目` 
            });
            return;
          }
          
          console.log(`🔄 找到进程 ${projectId}，状态: ${targetProcess.pm2_env?.status}，开始重启...`);
          
          // 使用 PM2 的 restart 命令
          pm2.restart(projectId, (restartErr: any) => {
            if (restartErr) {
              console.error(`❌ 重启进程 ${projectId} 失败:`, restartErr.message);
              resolve({ 
                success: false, 
                error: `重启失败: ${restartErr.message}` 
              });
            } else {
              console.log(`✅ 成功重启进程 ${projectId}`);
              resolve({ 
                success: true 
              });
            }
          });
        });
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '重启失败'
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
            // 检查是否找到了进程
            if (desc && desc.length > 0) {
              console.log('✅ PM2 获取描述成功:', desc[0]?.name, '状态:', desc[0]?.pm2_env?.status);
              resolve({ 
                success: true, 
                status: desc[0] // PM2 describe 返回数组，取第一个元素
              });
            } else {
              console.log('❌ PM2 进程不存在:', projectId);
              resolve({ 
                success: false, 
                error: '进程不存在' 
              });
            }
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
