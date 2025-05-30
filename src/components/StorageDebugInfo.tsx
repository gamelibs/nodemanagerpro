import React, { useState, useEffect } from 'react';
import { ProjectService } from '../services/ProjectService';

const StorageDebugInfo: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshInfo = async () => {
    setLoading(true);
    try {
      const info = await ProjectService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('获取存储信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInfo();
  }, []);

  if (!storageInfo) return null;

  return (
    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-400 font-medium">💾 存储状态</h3>
        <button
          onClick={refreshInfo}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded"
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="text-blue-300 font-medium mb-2">文件系统</h4>
          <div className="text-gray-300 space-y-1">
            {storageInfo.fileSystem.success ? (
              <>
                <div>数据目录: <span className="text-green-400">{storageInfo.fileSystem.data?.dataDir}</span></div>
                <div>项目文件: <span className="text-green-400">{storageInfo.fileSystem.data?.projectsFile}</span></div>
                <div>文件存在: <span className={storageInfo.fileSystem.data?.exists ? 'text-green-400' : 'text-yellow-400'}>
                  {storageInfo.fileSystem.data?.exists ? '是' : '否'}
                </span></div>
              </>
            ) : (
              <div className="text-red-400">错误: {storageInfo.fileSystem.error}</div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-blue-300 font-medium mb-2">LocalStorage</h4>
          <div className="text-gray-300 space-y-1">
            <div>有数据: <span className={storageInfo.localStorage.hasData ? 'text-yellow-400' : 'text-green-400'}>
              {storageInfo.localStorage.hasData ? '是 (需迁移)' : '否 (已迁移)'}
            </span></div>
            <div>项目数量: <span className="text-blue-400">{storageInfo.localStorage.projectCount}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDebugInfo;
