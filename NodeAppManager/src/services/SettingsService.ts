import { RendererFileSystemService } from './RendererFileSystemService';
import type { AppSettings } from '../types';

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'zh',
  autoStart: false,
  minimizeToTray: true,
  devTools: false, // 默认关闭开发者工具
  notifications: {
    projectStatus: true,
    errors: true,
  },
  projects: {
    defaultPath: '/Users',
    portRange: {
      express: { start: 3000, end: 3099 },
      vite: { start: 5173, end: 5199 },
      other: { start: 8000, end: 8099 },
    },
    defaultPackageManager: 'npm',
  },
};

/**
 * 设置服务类
 * 负责管理应用设置的读取、保存和更新
 */
export class SettingsService {
  private static cachedSettings: AppSettings | null = null;

  /**
   * 加载设置
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      // 如果有缓存，直接返回
      if (this.cachedSettings) {
        return this.cachedSettings;
      }

      // 检查是否在Electron环境中
      if (RendererFileSystemService.isInElectron()) {
        const result = await window.electronAPI!.invoke('settings:load');
        
        if (result.success && result.data) {
          const settings = result.data;
          this.cachedSettings = { ...DEFAULT_SETTINGS, ...settings };
          return this.cachedSettings!
        }
      } else {
        // 在开发环境中，使用localStorage作为降级方案
        const stored = localStorage.getItem('app-settings');
        if (stored) {
          const settings = JSON.parse(stored);
          this.cachedSettings = { ...DEFAULT_SETTINGS, ...settings };
          return this.cachedSettings!
        }
      }

      // 如果没有找到设置文件，返回默认设置
      this.cachedSettings = DEFAULT_SETTINGS;
      return this.cachedSettings;
    } catch (error) {
      console.error('加载设置失败:', error);
      this.cachedSettings = DEFAULT_SETTINGS;
      return this.cachedSettings;
    }
  }

  /**
   * 保存设置
   */
  static async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      // 更新缓存
      this.cachedSettings = settings;

      // 检查是否在Electron环境中
      if (RendererFileSystemService.isInElectron()) {
        const result = await window.electronAPI!.invoke('settings:save', settings);
        return result.success;
      } else {
        // 在开发环境中，使用localStorage作为降级方案
        localStorage.setItem('app-settings', JSON.stringify(settings));
        return true;
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  }

  /**
   * 更新特定设置项
   */
  static async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<boolean> {
    try {
      const currentSettings = await this.loadSettings();
      const newSettings = { ...currentSettings, [key]: value };
      return await this.saveSettings(newSettings);
    } catch (error) {
      console.error('更新设置失败:', error);
      return false;
    }
  }

  /**
   * 重置为默认设置
   */
  static async resetToDefaults(): Promise<boolean> {
    try {
      this.cachedSettings = null;
      return await this.saveSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('重置设置失败:', error);
      return false;
    }
  }

  /**
   * 获取默认设置
   */
  static getDefaultSettings(): AppSettings {
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * 验证设置有效性
   */
  static validateSettings(settings: any): settings is AppSettings {
    try {
      return (
        typeof settings === 'object' &&
        settings !== null &&
        ['dark', 'light'].includes(settings.theme) &&
        ['zh', 'en'].includes(settings.language) &&
        typeof settings.autoStart === 'boolean' &&
        typeof settings.minimizeToTray === 'boolean' &&
        typeof settings.notifications === 'object' &&
        typeof settings.projects === 'object'
      );
    } catch {
      return false;
    }
  }
}
