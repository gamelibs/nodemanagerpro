import { Toast } from './Toast';
import type { ToastState } from './useToast';

interface ToastContainerProps {
  toasts: ToastState[];
  onHideToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onHideToast 
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onHideToast(toast.id)}
        />
      ))}
    </div>
  );
};
