import { useState, useCallback, useRef } from 'react';

export type ToastType = 'info' | 'success' | 'error' | 'warning'; 

export interface ToastState {
  message: string;
  type: ToastType;
  id: string;
  isVisible: boolean;
  isExiting: boolean;
}


export const useToast = () => {
  const [currentToast, setCurrentToast] = useState<ToastState | null>(null);
  const [toastQueue, setToastQueue] = useState<ToastState[]>([]);
  const processingRef = useRef(false);

  // 处理队列中的下一个Toast
  const processNextToast = useCallback(() => {
    if (processingRef.current) return;
    
    setToastQueue(prev => {
      if (prev.length === 0) {
        processingRef.current = false;
        return prev;
      }
      
      const [nextToast, ...remaining] = prev;
      processingRef.current = true;
      
      // 显示Toast
      setCurrentToast({ ...nextToast, isVisible: true, isExiting: false });
      
      // 1.5秒后开始退出动画
      setTimeout(() => {
        setCurrentToast(prev => prev ? { ...prev, isExiting: true } : null);
        
        // 退出动画完成后清除当前Toast
        setTimeout(() => {
          setCurrentToast(null);
          processingRef.current = false;
          
          // 使用微任务队列避免递归调用
          Promise.resolve().then(() => {
            if (!processingRef.current) {
              processNextToast();
            }
          });
        }, 150); // 动画完成时间
      }, 1500); // 显示时间
      
      return remaining;
    });
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // 使用更可靠的 ID 生成方法，避免重复
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastState = { 
      message, 
      type, 
      id, 
      isVisible: false, 
      isExiting: false 
    };
    
    setToastQueue(prev => {
      const updatedQueue = [...prev, newToast];
      
      // 如果当前没有显示Toast且没在处理中，立即处理
      if (!processingRef.current && prev.length === 0) {
        // 使用微任务队列，避免在状态更新过程中直接调用
        Promise.resolve().then(() => processNextToast());
      }
      
      return updatedQueue;
    });
  }, [processNextToast]);

  const hideToast = useCallback((id: string) => {
    if (currentToast?.id === id) {
      setCurrentToast(prev => prev ? { ...prev, isExiting: true } : null);
      
      setTimeout(() => {
        setCurrentToast(null);
        processingRef.current = false;
        
        // 使用微任务队列避免递归调用
        Promise.resolve().then(() => {
          if (!processingRef.current) {
            processNextToast();
          }
        });
      }, 150);
    } else {
      // 从队列中移除
      setToastQueue(prev => prev.filter(toast => toast.id !== id));
    }
  }, [currentToast, processNextToast]);

  const clearAllToasts = useCallback(() => {
    setCurrentToast(null);
    setToastQueue([]);
    processingRef.current = false;
  }, []);

  // 为了兼容现有的ToastContainer组件，返回当前Toast作为数组
  const visibleToasts = currentToast ? [currentToast] : [];

  return {
    toasts: visibleToasts,
    showToast,
    hideToast,
    clearAllToasts,
    currentToast,
    queueLength: toastQueue.length
  };
};
