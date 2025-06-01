import { AppProvider, useApp } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import './App.css';

function AppContent() {
  const { navigation } = useApp();
  const { activeTab } = navigation;

  return (
    <div className="app-container theme-bg-primary">
      {/* 顶部栏 (Header) */}
      <div className="h-16 theme-bg-secondary theme-border-b border-b">
        {/* Header内容由Header组件填充 */}
      </div>
      
      {/* 主体内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'settings' ? (
          // 设置页面 - 全宽布局
          <div className="flex-1 main-content theme-bg-primary">
            {/* 设置页面内容由 SettingsPage 组件填充 */}
          </div>
        ) : (
          <>
            {/* 左边栏 (Sidebar) - 项目列表区域 */}
            <div className="w-80 theme-bg-secondary theme-border-r border-r">
              <div className="p-4 h-full overflow-y-auto">
                {/* 项目列表内容由相应组件填充 */}
              </div>
            </div>
            
            {/* 右边主显示模块区 (Main Content) */}
            <div className="flex-1 main-content theme-bg-primary">
              <div className="p-6 h-full overflow-y-auto">
                {/* 主要内容由相应组件填充 */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
