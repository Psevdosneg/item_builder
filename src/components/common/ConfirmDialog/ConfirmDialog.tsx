import React, { useEffect } from 'react';
import { Button } from '../Button';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogData {
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmDialogProps {
  dialog: ConfirmDialogData | null;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ dialog }) => {
  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialog.onCancel();
      } else if (e.key === 'Enter') {
        dialog.onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  if (!dialog) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      dialog.onCancel();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.dialog}>
        <p className={styles.message}>{dialog.message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={dialog.onCancel}>
            {dialog.cancelText || 'Cancel'}
          </Button>
          <Button
            variant={dialog.variant || 'danger'}
            onClick={dialog.onConfirm}
          >
            {dialog.confirmText || 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
};
