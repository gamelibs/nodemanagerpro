import { useApp } from '../store/AppContext';
import { I18nService } from '../services/i18n';

export default function AppTitleTest() {
  const { i18n } = useApp();
  const { t, language } = i18n;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">应用标题测试</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">当前语言: {language}</label>
          <div className="flex space-x-2">
            <button 
              onClick={() => I18nService.setLanguage('zh')}
              className={`px-3 py-1 rounded ${language === 'zh' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              中文
            </button>
            <button 
              onClick={() => I18nService.setLanguage('en')}
              className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              English
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">应用标题:</label>
          <div className="text-xl font-bold text-blue-600">
            {t('appTitle')}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">应用描述:</label>
          <div className="text-gray-600">
            {t('appDescription')}
          </div>
        </div>
      </div>
    </div>
  );
}
