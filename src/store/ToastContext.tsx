import React, { createContext, useContext, useCallback, useState } from 'react';
import { ToastContent, ToastViewport, type ToastType } from '../components/ui/Toast';
import * as Toast from '@radix-ui/react-toast';

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (description: string, title?: string) => void;
  showError: (description: string, title?: string) => void;
  showWarning: (description: string, title?: string) => void;
  showInfo: (description: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      ...message,
      id,
      duration: message.duration || 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((description: string, title?: string) => {
    showToast({ type: 'success', description, title });
  }, [showToast]);

  const showError = useCallback((description: string, title?: string) => {
    showToast({ type: 'error', description, title });
  }, [showToast]);

  const showWarning = useCallback((description: string, title?: string) => {
    showToast({ type: 'warning', description, title });
  }, [showToast]);

  const showInfo = useCallback((description: string, title?: string) => {
    showToast({ type: 'info', description, title });
  }, [showToast]);

  const contextValue: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastContent
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
            onOpenChange={(open) => {
              if (!open) {
                removeToast(toast.id);
              }
            }}
          />
        ))}
        <ToastViewport />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};
