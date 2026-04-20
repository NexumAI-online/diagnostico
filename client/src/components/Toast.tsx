import React, { useEffect, useState } from 'react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
  onClose?: () => void;
  autoDismiss?: number;
}

const icons = {
  success: (
    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9 16H3L12 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
};

const borderColors = {
  success: 'border-success/30',
  error: 'border-error/30',
  warning: 'border-yellow-400/30',
  info: 'border-blue-400/30',
};

export function Toast({ type, message, visible, onClose, autoDismiss = 5000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      if (autoDismiss > 0) {
        const timer = setTimeout(() => {
          setShow(false);
          onClose?.();
        }, autoDismiss);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [visible, autoDismiss, onClose]);

  if (!show) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${borderColors[type]} animate-slide-down`}
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <p className="text-sm text-gray-200 flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
