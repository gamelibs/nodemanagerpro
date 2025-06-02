import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './store/AppContext.tsx'
import { ToastProvider } from './store/ToastContext.tsx'
import { initI18n } from './services/i18n'

// 初始化国际化系统
initI18n('zh');

// 🤖 自动日志监控系统
function initAutoLogMonitoring() {
  // 防止重复初始化
  if ((window as any).logCollectorInitialized) {
    console.log('⚠️ 日志监控已初始化，跳过重复初始化');
    return;
  }
  
  if (typeof window !== 'undefined') {
    console.log('🤖 初始化自动日志监控...');
    
    // 标记已初始化
    (window as any).logCollectorInitialized = true;
    
    // 创建日志收集器
    (window as any).logCollector = {
      logs: [] as any[],
      maxLogs: 1000,
      
      add(type: string, args: any[]) {
        const entry = {
          timestamp: new Date().toISOString(),
          type,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
        };
        
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
          this.logs.shift();
        }
        
        // 发送到主进程记录
        if ((window as any).electronAPI?.invoke) {
          (window as any).electronAPI.invoke('logger:log', {
            level: type.toUpperCase(),
            message: `FRONTEND-${type.toUpperCase()}: ${entry.message}`,
            data: { source: 'frontend-auto-monitor' }
          }).catch(() => {}); // 忽略错误
        }
      }
    };
    
    // 重写控制台方法
    const originalMethods: any = {};
    ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
      originalMethods[method] = (console as any)[method];
      (console as any)[method] = function(...args: any[]) {
        (window as any).logCollector.add(method, args);
        originalMethods[method].apply(console, [`🔍 ${method.toUpperCase()}:`, ...args]);
      };
    });
    
    // 监控错误
    window.addEventListener('error', (event) => {
      (window as any).logCollector.add('error', ['未捕获错误:', event.error?.message || event.message]);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      (window as any).logCollector.add('error', ['未处理Promise拒绝:', event.reason]);
    });
    
    // 提供全局方法
    (window as any).showLogs = function(type?: string) {
      const logs = type ? 
        (window as any).logCollector.logs.filter((log: any) => log.type === type) : 
        (window as any).logCollector.logs;
      console.table(logs);
    };
    
    (window as any).exportLogs = function() {
      return JSON.stringify((window as any).logCollector.logs, null, 2);
    };
    
    console.log('✅ 自动日志监控已激活');
    console.log('💡 使用 showLogs() 查看所有日志');
    console.log('💡 使用 showLogs("error") 查看错误日志');
    console.log('💡 使用 exportLogs() 导出日志数据');
  }
}

// 初始化监控
initAutoLogMonitoring();

// 根据开发/生产环境决定是否使用 StrictMode
const isDevelopment = import.meta.env.MODE === 'development';

const AppComponent = (
  <AppProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AppProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  isDevelopment ? (
    <React.StrictMode>
      {AppComponent}
    </React.StrictMode>
  ) : (
    AppComponent
  )
);
