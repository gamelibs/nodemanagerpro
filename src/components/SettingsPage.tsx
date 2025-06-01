import { useApp } from '../store/AppContext';

export default function SettingsPage() {
  const { settings, i18n, navigation } = useApp();
  const { current, updateSetting, resetSettings } = settings;
  const { t } = i18n;
  const { setActiveTab } = navigation;

  return (
    <div className="p-8 h-full overflow-auto">
      {/* 页面容器 */}
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="text-2xl font-bold theme-text-primary">{t('settings.title')}</h1>
              <p className="text-sm theme-text-muted mt-1">{t('settings.description')}</p>
            </div>
          </div>
          
          {/* 返回按钮 */}
          <button
            onClick={() => setActiveTab('projects')}
            className="px-4 py-2 theme-bg-secondary hover:theme-bg-tertiary border theme-border rounded-lg text-sm flex items-center space-x-2 transition-colors"
          >
            <span>←</span>
            <span>{current.language === 'zh' ? '返回' : 'Back'}</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* 应用设置 */}
          <div className="theme-bg-secondary p-6 rounded-xl border theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-3">
              <span>🎨</span>
              <span>{t('settings.app.title')}</span>
            </h2>              {/* 主题设置 */}
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b theme-border-b last:border-b-0">
                  <div className="flex-1">
                    <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.theme')}</label>
                    <p className="text-sm theme-text-muted">{t('settings.app.themeDesc')}</p>
                  </div>
                  <div className="flex bg-slate-700/50 light-theme:bg-gray-200 rounded-xl p-1 ml-6">
                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                        current.theme === 'dark'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-300 light-theme:text-gray-600 light-theme:hover:text-gray-800'
                      }`}
                    >
                      🌙 {t('theme.dark')}
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                        current.theme === 'light'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-300 light-theme:text-gray-600 light-theme:hover:text-gray-800'
                      }`}
                    >
                      ☀️ {t('theme.light')}
                    </button>
                  </div>
                </div>
              
              {/* 语言设置 */}
              <div className="flex items-center justify-between py-4 border-b theme-border-b last:border-b-0">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.language')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.app.languageDesc')}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateSetting('language', 'zh')}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      current.language === 'zh'
                        ? 'theme-text-primary font-medium'
                        : 'theme-text-muted hover:theme-text-primary'
                    }`}
                  >
                    中文
                  </button>
                  <span className="text-sm theme-text-muted">|</span>
                  <button
                    onClick={() => updateSetting('language', 'en')}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      current.language === 'en'
                        ? 'theme-text-primary font-medium'
                        : 'theme-text-muted hover:theme-text-primary'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* 自动启动 */}
              <div className="flex items-center justify-between py-4 border-b theme-border-b last:border-b-0">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.autoStart')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.app.autoStartDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('autoStart', !current.autoStart)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.autoStart ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.autoStart ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 开发者工具 */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.devTools')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.app.devToolsDesc')}</p>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !current.devTools;
                    updateSetting('devTools', newValue);
                    
                    // 如果启用，立即打开开发者工具
                    if (newValue && window.electronAPI) {
                      try {
                        await window.electronAPI.invoke('dev-tools:toggle');
                      } catch (error) {
                        console.warn('Failed to toggle dev tools:', error);
                      }
                    }
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.devTools ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.devTools ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div className="theme-bg-secondary p-6 rounded-xl border theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">🔔</span>
              <span>{t('settings.notifications.title')}</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b theme-border-b last:border-b-0">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.notifications.projectStatus')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.notifications.projectStatusDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', { 
                    ...current.notifications, 
                    projectStatus: !current.notifications.projectStatus 
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.notifications.projectStatus ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.notifications.projectStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.notifications.errors')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.notifications.errorsDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', { 
                    ...current.notifications, 
                    errors: !current.notifications.errors 
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.notifications.errors ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.notifications.errors ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 项目管理设置 */}
          <div className="theme-bg-secondary p-6 rounded-xl border theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">📁</span>
              <span>{t('settings.projects.title')}</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b theme-border-b">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.projects.autoInstallDeps')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.projects.autoInstallDepsDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('projects', { 
                    ...current.projects, 
                    creation: {
                      ...current.projects.creation,
                      autoInstallDeps: !current.projects.creation.autoInstallDeps 
                    }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.projects.creation.autoInstallDeps ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.projects.creation.autoInstallDeps ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b theme-border-b">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.projects.autoOpenBrowser')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.projects.autoOpenBrowserDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('projects', { 
                    ...current.projects, 
                    creation: {
                      ...current.projects.creation,
                      autoOpenBrowser: !current.projects.creation.autoOpenBrowser 
                    }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.projects.creation.autoOpenBrowser ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.projects.creation.autoOpenBrowser ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b theme-border-b">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.projects.maxConcurrentProjects')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.projects.maxConcurrentProjectsDesc')}</p>
                </div>
                <div className="flex items-center space-x-2 ml-6">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={current.projects.runtime.maxConcurrentProjects}
                    onChange={(e) => updateSetting('projects', { 
                      ...current.projects, 
                      runtime: {
                        ...current.projects.runtime,
                        maxConcurrentProjects: parseInt(e.target.value) || 1
                      }
                    })}
                    className="w-20 px-3 py-1 theme-bg-primary theme-text-primary border theme-border rounded-lg text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.projects.gitIntegration')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.projects.gitIntegrationDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('projects', { 
                    ...current.projects, 
                    git: {
                      ...current.projects.git,
                      enabled: !current.projects.git.enabled
                    }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.projects.git.enabled ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.projects.git.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 性能监控设置 */}
          <div className="theme-bg-secondary p-6 rounded-xl border theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">📊</span>
              <span>{t('settings.monitoring.title')}</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b theme-border-b">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.monitoring.enablePerformanceMonitoring')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.monitoring.enablePerformanceMonitoringDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('projects', { 
                    ...current.projects, 
                    monitoring: {
                      ...current.projects.monitoring,
                      enabled: !current.projects.monitoring.enabled
                    }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.projects.monitoring.enabled ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.projects.monitoring.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b theme-border-b">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.monitoring.alertOnHighCPU')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.monitoring.alertOnHighCPUDesc')}</p>
                </div>
                <div className="flex items-center space-x-2 ml-6">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={current.projects.monitoring.cpuThreshold}
                    onChange={(e) => updateSetting('projects', { 
                      ...current.projects, 
                      monitoring: {
                        ...current.projects.monitoring,
                        cpuThreshold: parseInt(e.target.value) || 80
                      }
                    })}
                    className="w-20 px-3 py-1 theme-bg-primary theme-text-primary border theme-border rounded-lg text-center"
                  />
                  <span className="text-sm theme-text-secondary">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.monitoring.autoCleanupLogs')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.monitoring.autoCleanupLogsDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('projects', { 
                    ...current.projects, 
                    monitoring: {
                      ...current.projects.monitoring,
                      autoCleanupLogs: !current.projects.monitoring.autoCleanupLogs
                    }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.projects.monitoring.autoCleanupLogs ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.projects.monitoring.autoCleanupLogs ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 编辑器集成设置 */}
          <div className="theme-bg-secondary p-6 rounded-xl border theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">💻</span>
              <span>{t('settings.editor.title')}</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b theme-border-b">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.editor.defaultEditor')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.editor.defaultEditorDesc')}</p>
                </div>
                <select
                  value={current.projects.editor.defaultEditor}
                  onChange={(e) => updateSetting('projects', { 
                    ...current.projects, 
                    editor: {
                      ...current.projects.editor,
                      defaultEditor: e.target.value as any
                    }
                  })}
                  className="px-3 py-2 theme-bg-primary theme-text-primary border theme-border rounded-lg ml-6"
                >
                  <option value="vscode">VS Code</option>
                  <option value="webstorm">WebStorm</option>
                  <option value="atom">Atom</option>
                  <option value="sublime">Sublime Text</option>
                  <option value="vim">Vim</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.editor.openProjectOnCreate')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.editor.openProjectOnCreateDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('projects', { 
                    ...current.projects, 
                    editor: {
                      ...current.projects.editor,
                      openProjectOnCreate: !current.projects.editor.openProjectOnCreate
                    }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.projects.editor.openProjectOnCreate ? 'btn-primary' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      current.projects.editor.openProjectOnCreate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 开发者调试工具 - 仅在开发模式下显示 */}
          {window.electronAPI?.isDev && (
            <div className="theme-bg-secondary p-6 rounded-xl border theme-border shadow-lg">
              <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-3">
                <span>🛠️</span>
                <span>{t('settings.debugTools.title')}</span>
              </h2>
              <p className="text-sm theme-text-muted mb-6">{t('settings.debugTools.description')}</p>
              
              <div className="space-y-6">
                {/* 调试工具已移除 - 如需添加新的调试工具，请在此处添加 */}
                <div className="border theme-border rounded-lg p-4">
                  <h3 className="text-lg font-medium theme-text-primary mb-2 flex items-center space-x-2">
                    <span>�</span>
                    <span>{t('settings.debugTools.title')}</span>
                  </h3>
                  <p className="text-sm theme-text-muted">调试工具功能已整合到项目详情页面中。</p>
                </div>
              </div>
            </div>
          )}

          {/* 重置设置 */}
          <div className="flex justify-center pt-6">
            <button
              onClick={resetSettings}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 light-theme:text-red-600 light-theme:hover:text-red-700 rounded-xl border border-red-500/30 light-theme:border-red-300 text-sm font-medium transition-all hover:shadow-lg"
            >
              🔄 {t('settings.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
