import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useToast, ToastContainer } from '../components/projects';
import { ToastWin } from '../components/projects/ToastWin';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  showToastWin: (title: string, message: string, suggestions?: string[], type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, showToast, hideToast, currentToastWin, showToastWin, hideToastWin } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, showToastWin }}>
      {children}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
      {currentToastWin && (
        <ToastWin
          title={currentToastWin.title}
          message={currentToastWin.message}
          suggestions={currentToastWin.suggestions}
          type={currentToastWin.type}
          onClose={hideToastWin}
          isVisible={currentToastWin.isVisible}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
