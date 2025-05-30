import { useState, useEffect } from 'react';

export default function HotReloadTest() {
  const [count, setCount] = useState(0);
  const [testData, setTestData] = useState('');
  const [testResults, setTestResults] = useState<any>({});
  const [isTestingIPC, setIsTestingIPC] = useState(false);
  const [autoTestResults, setAutoTestResults] = useState<string>('');

  // 自动运行一次IPC测试
  useEffect(() => {
    const runAutoTest = async () => {
      setAutoTestResults('🔄 自动运行IPC测试...');
      
      // 等待一秒确保应用完全加载
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        if (typeof window !== 'undefined' && window.electronAPI !== undefined) {
          const dataInfo = await window.electronAPI.invoke('fs:getDataInfo');
          setAutoTestResults(`✅ IPC通信正常！数据目录: ${dataInfo.data?.dataDir || '未知'}`);
          
          // 尝试创建temp目录和文件
          const loadResult = await window.electronAPI.invoke('fs:loadProjects');
          if (loadResult.success) {
            setAutoTestResults(prev => prev + `\n📁 项目加载测试成功，项目数量: ${loadResult.data?.length || 0}`);
          }
        } else {
          setAutoTestResults('⚠️ 不在Electron环境中或IPC未就绪');
        }
      } catch (error) {
        setAutoTestResults(`❌ 自动测试失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    runAutoTest();
  }, []);

  const addTestLocalStorageData = () => {
    const mockProjects = [
      {
        id: 'test-1',
        name: 'Test React App',
        path: '/Users/test/react-app',
        type: 'react',
        status: 'stopped',
        port: 3000,
        lastOpened: new Date().toISOString(),
        packageManager: 'npm',
        scripts: [{ name: 'start', command: 'npm start', description: '启动项目' }],
        description: '测试项目 - 用于验证数据迁移'
      }
    ];
    
    localStorage.setItem('nodeAppManager_projects', JSON.stringify(mockProjects));
    setTestData('已添加测试数据到localStorage');
  };

  const clearLocalStorageData = () => {
    localStorage.removeItem('nodeAppManager_projects');
    setTestData('已清除localStorage数据');
  };

  const checkLocalStorageData = () => {
    const data = localStorage.getItem('nodeAppManager_projects');
    setTestData(data ? `localStorage有数据: ${JSON.parse(data).length} 个项目` : 'localStorage无数据');
  };

  // 测试IPC通信
  const testIPC = async () => {
    setIsTestingIPC(true);
    const results: any = {};

    try {
      // 检查Electron环境
      results.isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
      
      if (results.isElectron) {
        try {
          // 测试获取数据目录信息
          const dataInfo = await window.electronAPI!.invoke('fs:getDataInfo');
          results.dataInfo = dataInfo;
        } catch (error) {
          results.dataInfoError = error instanceof Error ? error.message : String(error);
        }

        try {
          // 测试加载项目
          const projects = await window.electronAPI!.invoke('fs:loadProjects');
          results.loadProjects = projects;
        } catch (error) {
          results.loadProjectsError = error instanceof Error ? error.message : String(error);
        }
      }
    } catch (error) {
      results.generalError = error instanceof Error ? error.message : String(error);
    }

    setTestResults(results);
    setIsTestingIPC(false);
  };

  // 手动测试文件系统IPC
  const testFileSystemIPC = async () => {
    console.log('🔧 手动测试文件系统IPC...');
    
    try {
      // 测试数据目录信息
      console.log('1. 测试获取数据目录信息...');
      if (window.electronAPI) {
        const dataInfo = await window.electronAPI.invoke('fs:getDataInfo');
        console.log('数据目录信息:', dataInfo);
      }
      
      // 测试加载项目
      console.log('2. 测试加载项目...');
      if (window.electronAPI) {
        const loadResult = await window.electronAPI.invoke('fs:loadProjects');
        console.log('加载项目结果:', loadResult);
      }
    } catch (error) {
      console.error('测试失败:', error);
    }
  };

  return (
    <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
      <h3 className="text-green-400 font-medium mb-3">🔥 热重载测试 & IPC调试</h3>
      <div className="space-y-4">
        <div>
          <p className="text-slate-300 mb-2">
            当前计数: <span className="text-blue-400 font-mono text-lg">{count}</span>
          </p>
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              增加
            </button>
            <button
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              减少
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              重置
            </button>
            <button
              onClick={testFileSystemIPC}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              测试文件系统
            </button>
          </div>
        </div>
        
        <div className="border-t border-slate-600 pt-4">
          <h4 className="text-lg font-medium text-white mb-3">🔄 数据迁移测试工具</h4>
          <div className="flex space-x-2 mb-3">
            <button
              onClick={addTestLocalStorageData}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
            >
              添加测试数据
            </button>
            <button
              onClick={clearLocalStorageData}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            >
              清除数据
            </button>
            <button
              onClick={checkLocalStorageData}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
            >
              检查数据
            </button>
          </div>
          {testData && (
            <div className="text-blue-300 text-sm bg-blue-900/30 p-2 rounded mb-2">
              {testData}
            </div>
          )}
          <p className="text-xs text-slate-500">
            💡 添加测试数据后刷新页面，观察数据是否从localStorage迁移到文件系统
          </p>
        </div>
        
        {/* IPC通信测试 */}
        <div className="mt-4 pt-4 border-t border-green-700/50">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-green-300 font-medium">📡 IPC通信测试</h4>
            <button
              onClick={testIPC}
              disabled={isTestingIPC}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded"
            >
              {isTestingIPC ? '测试中...' : '测试IPC'}
            </button>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <div className="bg-black/30 p-3 rounded text-xs font-mono">
              <pre className="text-green-300 whitespace-pre-wrap">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <p className="text-xs text-slate-500">
          💡 修改这个组件的代码，保存后应该可以看到实时更新（保持状态）
        </p>

        {/* 自动IPC测试结果 */}
        <div className="mt-4 pt-4 border-t border-blue-700/50">
          <h4 className="text-blue-300 font-medium mb-2">🔄 自动IPC测试结果</h4>
          <div className="text-blue-100 text-sm bg-blue-900/30 p-2 rounded">
            {autoTestResults}
          </div>
        </div>
      </div>
    </div>
  );
}
