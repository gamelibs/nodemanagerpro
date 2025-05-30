import { useState, useEffect } from 'react';

interface StatusSyncIndicatorProps {
  lastSync?: Date;
  isLoading?: boolean;
}

export default function StatusSyncIndicator({ lastSync, isLoading }: StatusSyncIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSync) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSync.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);

      if (diffSecs < 60) {
        setTimeAgo(`${diffSecs}秒前`);
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}分钟前`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}小时前`);
      } else {
        setTimeAgo(lastSync.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastSync]);

  if (!lastSync && !isLoading) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 light-theme:text-gray-400">
      <div className={`w-1.5 h-1.5 rounded-full ${
        isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
      }`}></div>
      <span>
        {isLoading ? '同步中...' : `状态更新于 ${timeAgo}`}
      </span>
    </div>
  );
}
