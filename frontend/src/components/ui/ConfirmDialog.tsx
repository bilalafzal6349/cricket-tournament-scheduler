import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className={`${styles.bg} p-4 rounded-lg flex gap-3 ${styles.text}`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${styles.icon}`} />
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
