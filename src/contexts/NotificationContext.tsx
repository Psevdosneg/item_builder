import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';
import type { ToastData, ToastType } from '../components/common/Toast';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { ConfirmDialogData } from '../components/common/ConfirmDialog';

interface NotificationContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'primary';
    }
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        variant?: 'danger' | 'primary';
      }
    ) => {
      setConfirmDialog({
        message,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        variant: options?.variant,
        onConfirm: () => {
          onConfirm();
          setConfirmDialog(null);
        },
        onCancel: () => {
          setConfirmDialog(null);
        },
      });
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog dialog={confirmDialog} />
    </NotificationContext.Provider>
  );
};
