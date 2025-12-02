import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === 'success'
      ? 'bg-emerald-500/90 border-emerald-400'
      : type === 'error'
        ? 'bg-rose-500/90 border-rose-400'
        : 'bg-sky-500/90 border-sky-400';

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm ${bgColor} animate-in slide-in-from-right`}
    >
      {message}
    </div>
  );
};

export default Toast;

