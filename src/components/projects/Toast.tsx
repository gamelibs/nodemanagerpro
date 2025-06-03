import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
  isVisible?: boolean;
  isExiting?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 2000, // 减少默认显示时间到2秒
  isVisible = true,
  isExiting = false
}) => {
  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration, isVisible]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getAnimationClass = () => {
    if (isExiting) {
      return 'animate-toast-exit';
    }
    if (isVisible) {
      return 'animate-toast-enter';
    }
    return 'opacity-0';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-3 rounded-lg shadow-lg ${getTypeStyles()} transition-all duration-300 ${getAnimationClass()}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{message}</span>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 ml-2 bg-transparent border-none p-0 cursor-pointer text-lg leading-none"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
