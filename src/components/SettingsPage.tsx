import { useApp } from '../store/AppContext';

export default function SettingsPage() {
  const { settings, i18n, navigation } = useApp();
  const { current, updateSetting, resetSettings } = settings;
  const { t } = i18n;
  const { setActiveTab } = navigation;

  // 调试翻译系统
  if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    console.log('SettingsPage - Translation test:', {
      'settings.reset': t('settings.reset'),
      'settings.title': t('settings.title'),
      currentLanguage: current.language,
      tFunction: typeof t
    });
  }

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
            <span>{t('back')}</span>
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
                  <div className="flex bg-gray-800/30 light-theme:bg-gray-100 rounded-xl p-1 border border-gray-700/50 light-theme:border-gray-200 ml-6">
                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] flex items-center justify-center gap-2 ${
                        current.theme === 'dark'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-[1.02]'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 light-theme:text-gray-600 light-theme:hover:text-gray-800 light-theme:hover:bg-gray-200/70'
                      }`}
                    >
                      🌙 {t('theme.dark')}
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] flex items-center justify-center gap-2 ${
                        current.theme === 'light'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-[1.02]'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 light-theme:text-gray-600 light-theme:hover:text-gray-800 light-theme:hover:bg-gray-200/70'
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
                <div className="flex items-center bg-gray-800/30 light-theme:bg-gray-100 rounded-lg p-1 border border-gray-700/50 light-theme:border-gray-200">
                  <button
                    onClick={() => updateSetting('language', 'zh')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[70px] ${
                      current.language === 'zh'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 light-theme:text-gray-600 light-theme:hover:text-gray-800 light-theme:hover:bg-gray-200/70'
                    }`}
                  >
                    {t('language.zh')}
                  </button>
                  <button
                    onClick={() => updateSetting('language', 'en')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[70px] ${
                      current.language === 'en'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 light-theme:text-gray-600 light-theme:hover:text-gray-800 light-theme:hover:bg-gray-200/70'
                    }`}
                  >
                    {t('language.en')}
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 light-theme:focus:ring-offset-white ml-6 ${
                    current.autoStart ? 'bg-blue-600 shadow-lg shadow-blue-600/25' : 'bg-gray-600 light-theme:bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
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
                  className={`settings-toggle ml-6 ${
                    current.devTools ? 'settings-toggle-active' : 'settings-toggle-inactive'
                  }`}
                >
                  <span
                    className={`settings-toggle-thumb ${
                      current.devTools ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'
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
                  className={`settings-toggle ml-6 ${
                    current.notifications.projectStatus ? 'settings-toggle-active' : 'settings-toggle-inactive'
                  }`}
                >
                  <span
                    className={`settings-toggle-thumb ${
                      current.notifications.projectStatus ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'
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
                  className={`settings-toggle ml-6 ${
                    current.notifications.errors ? 'settings-toggle-active' : 'settings-toggle-inactive'
                  }`}
                >
                  <span
                    className={`settings-toggle-thumb ${
                      current.notifications.errors ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'
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
                  className={`settings-toggle ml-6 ${
                    current.projects.creation.autoInstallDeps ? 'settings-toggle-active' : 'settings-toggle-inactive'
                  }`}
                >
                  <span
                    className={`settings-toggle-thumb ${
                      current.projects.creation.autoInstallDeps ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'
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
                  className={`settings-toggle ml-6 ${
                    current.projects.creation.autoOpenBrowser ? 'settings-toggle-active' : 'settings-toggle-inactive'
                  }`}
                >
                  <span
                    className={`settings-toggle-thumb ${
                      current.projects.creation.autoOpenBrowser ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'
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
                  className={`settings-toggle ml-6 ${
                    current.projects.git.enabled ? 'settings-toggle-active' : 'settings-toggle-inactive'
                  }`}
                >
                  <span
                    className={`settings-toggle-thumb ${
                      current.projects.git.enabled ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          {/* 重置设置 */}
          <div className="flex justify-center pt-6">
            <button
              onClick={resetSettings}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 light-theme:text-red-600 light-theme:hover:text-red-700 rounded-xl border border-red-500/30 light-theme:border-red-300 text-sm font-medium transition-all hover:shadow-lg"
            >
              🔄 {current.language === 'zh' ? '重置设置' : 'Reset Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
