import { useApp } from '../store/AppContext';

export default function SettingsPage() {
  const { settings, i18n } = useApp();
  const { current, updateSetting, resetSettings } = settings;
  const { t } = i18n;

  return (
    <div className="p-8 h-full overflow-auto">
      {/* 页面容器 */}
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
            <span className="text-white text-2xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold theme-text-primary">{t('settings.title')}</h1>
            <p className="text-sm theme-text-muted mt-1">{t('settings.description')}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* 应用设置 */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#1A2332] light-theme:from-white light-theme:to-gray-50 p-6 rounded-xl border border-slate-700 theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">🎨</span>
              <span>{t('settings.app.title')}</span>
            </h2>
            
            {/* 主题设置 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-slate-600 theme-border last:border-b-0">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.theme')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.app.themeDesc')}</p>
                </div>
                <div className="flex bg-slate-700/50 light-theme:bg-gray-200 rounded-xl p-1 ml-6">
                  <button
                    onClick={() => updateSetting('theme', 'dark')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                      current.theme === 'dark'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200 light-theme:text-gray-600 light-theme:hover:text-gray-800'
                    }`}
                  >
                    🌙 {t('theme.dark')}
                  </button>
                  <button
                    onClick={() => updateSetting('theme', 'light')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                      current.theme === 'light'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200 light-theme:text-gray-600 light-theme:hover:text-gray-800'
                    }`}
                  >
                    ☀️ {t('theme.light')}
                  </button>
                </div>
              </div>
              
              {/* 语言设置 */}
              <div className="flex items-center justify-between py-4 border-b border-slate-600 theme-border last:border-b-0">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.language')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.app.languageDesc')}</p>
                </div>
                <div className="flex bg-slate-700/50 light-theme:bg-gray-200 rounded-xl p-1 ml-6">
                  <button
                    onClick={() => updateSetting('language', 'zh')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                      current.language === 'zh'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200 light-theme:text-gray-600 light-theme:hover:text-gray-800'
                    }`}
                  >
                    🇨🇳 中文
                  </button>
                  <button
                    onClick={() => updateSetting('language', 'en')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                      current.language === 'en'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200 light-theme:text-gray-600 light-theme:hover:text-gray-800'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              </div>

              {/* 自动启动 */}
              <div className="flex items-center justify-between py-4 border-b border-slate-600 theme-border last:border-b-0">
                <div className="flex-1">
                  <label className="text-base font-medium theme-text-primary block mb-1">{t('settings.app.autoStart')}</label>
                  <p className="text-sm theme-text-muted">{t('settings.app.autoStartDesc')}</p>
                </div>
                <button
                  onClick={() => updateSetting('autoStart', !current.autoStart)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-6 ${
                    current.autoStart ? 'bg-indigo-600' : 'bg-gray-600 light-theme:bg-gray-300'
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
                    current.devTools ? 'bg-indigo-600' : 'bg-gray-600 light-theme:bg-gray-300'
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
          <div className="bg-gradient-to-br from-[#1E293B] to-[#1A2332] light-theme:from-white light-theme:to-gray-50 p-6 rounded-xl border border-slate-700 theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">🔔</span>
              <span>{t('settings.notifications.title')}</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-slate-600 theme-border last:border-b-0">
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
                    current.notifications.projectStatus ? 'bg-indigo-600' : 'bg-gray-600 light-theme:bg-gray-300'
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
                    current.notifications.errors ? 'bg-indigo-600' : 'bg-gray-600 light-theme:bg-gray-300'
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

          {/* 应用信息 */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#1A2332] light-theme:from-white light-theme:to-gray-50 p-6 rounded-xl border border-slate-700 theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">ℹ️</span>
              <span>{t('settings.about.title')}</span>
            </h2>
            <div className="space-y-3 text-base theme-text-secondary">
              <p>• {t('settings.about.description')}</p>
              <p>• {t('settings.about.features1')}</p>
              <p>• {t('settings.about.features2')}</p>
            </div>
          </div>

          {/* 技术栈 */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#1A2332] light-theme:from-white light-theme:to-gray-50 p-6 rounded-xl border border-slate-700 theme-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-6 flex items-center space-x-2">
              <span className="text-lg">🛠️</span>
              <span>{t('settings.about.techStack')}</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Electron', 'React', 'TypeScript', 'Vite', 'PM2', 'Tailwind CSS'].map(tech => (
                <span key={tech} className="px-4 py-2 bg-indigo-600/20 text-indigo-300 light-theme:bg-indigo-100 light-theme:text-indigo-700 rounded-lg text-sm font-medium border border-indigo-500/30 light-theme:border-indigo-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>

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
