// 设置相关的 IPC 处理器
import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

let isSetup = false;

export function setupSettingsIPC() {
  if (isSetup) {
    console.log('🔗 设置IPC处理器已存在，跳过重复设置');
    return;
  }

  // 清除可能存在的旧处理器
  try {
    ipcMain.removeHandler('settings:load');
    ipcMain.removeHandler('settings:save');
  } catch (error) {
    // 忽略移除不存在处理器的错误
  }

  // 获取设置文件路径
  const getSettingsPath = () => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'app-settings.json');
  };

  // 加载设置
  ipcMain.handle('settings:load', async () => {
    console.log('📡 收到 settings:load IPC调用');
    try {
      const settingsPath = getSettingsPath();
      console.log('📁 设置文件路径:', settingsPath);
      
      if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf8');
        const settings = JSON.parse(data);
        console.log('📡 settings:load 成功返回设置');
        return { success: true, data: settings };
      } else {
        console.log('📡 settings:load 设置文件不存在，返回默认设置');
        return { success: true, data: null };
      }
    } catch (error) {
      console.error('📡 settings:load 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '加载设置失败' 
      };
    }
  });

  // 保存设置
  ipcMain.handle('settings:save', async (_, settings) => {
    console.log('📡 收到 settings:save IPC调用');
    try {
      const settingsPath = getSettingsPath();
      const settingsDir = path.dirname(settingsPath);
      
      // 确保目录存在
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
      }
      
      // 保存设置
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('📡 settings:save 成功保存设置');
      return { success: true };
    } catch (error) {
      console.error('📡 settings:save 失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存设置失败' 
      };
    }
  });

  isSetup = true;
  console.log('🔗 设置IPC处理器已设置');
}

/**
 * 从主进程直接加载设置（不通过IPC）
 * 用于启动时读取设置
 */
export async function loadSettingsFromMain() {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'app-settings.json');
    
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(data);
      return { success: true, data: settings };
    } else {
      return { success: true, data: null }; // 设置文件不存在，返回null，使用默认设置
    }
  } catch (error) {
    console.error('从主进程加载设置失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '加载设置失败' 
    };
  }
}
