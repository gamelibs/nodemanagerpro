import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // 自动关闭
    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300);
    }, message.duration || 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [message.id, message.duration, onClose]);

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`
        fixed top-4 right-4 p-4 rounded-lg border shadow-lg max-w-sm z-50
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
      `}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getIcon()}</span>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-white">{message.title}</h4>
          <p className="text-sm text-gray-100 mt-1">{message.message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(message.id), 300);
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="space-y-2 p-4">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className="pointer-events-auto"
            style={{ marginTop: index * 60 }}
          >
            <Toast message={message} onClose={onClose} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Toast管理钩子
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, title, message, type, duration };
    
    setMessages(prev => [...prev, toast]);
  };

  const closeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return {
    messages,
    showToast,
    closeToast,
  };
}
