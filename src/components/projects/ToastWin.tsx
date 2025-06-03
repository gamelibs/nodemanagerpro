import { useEffect } from 'react';

interface ToastWinProps {
  title: string;
  message: string;
  suggestions?: string[];
  type: 'info' | 'success' | 'error' | 'warning';
  onClose: () => void;
  isVisible?: boolean;
}

export const ToastWin: React.FC<ToastWinProps> = ({
  title,
  message,
  suggestions = [],
  type,
  onClose,
  isVisible = true,
}) => {
  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  // 阻止页面滚动
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isVisible]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          titleColor: 'text-green-800',
          icon: '✅',
          iconBg: 'bg-green-100',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          titleColor: 'text-red-800',
          icon: '❌',
          iconBg: 'bg-red-100',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          titleColor: 'text-blue-800',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
        };
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // 点击背景关闭
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`
          relative max-w-md w-full mx-4 
          ${styles.bg} ${styles.border} border-2 
          rounded-lg shadow-xl 
          animate-modal-enter
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center text-lg`}>
              {styles.icon}
            </div>
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {/* 主要消息 */}
          <div className="text-gray-700 text-sm whitespace-pre-line mb-4">
            {message}
          </div>

          {/* 建议列表 */}
          {suggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">💡 建议解决方案：</h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
