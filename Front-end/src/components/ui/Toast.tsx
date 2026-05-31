import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-4 sm:right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-sm border shadow-lg max-w-sm ${
        isSuccess
          ? 'bg-[#0B0B0B] border-[#39FF14]/40 text-white'
          : 'bg-white border-red-200 text-[#0B0B0B]'
      }`}
    >
      <span
        className={`material-icons-round text-xl shrink-0 ${
          isSuccess ? 'text-[#39FF14]' : 'text-red-500'
        }`}
      >
        {isSuccess ? 'check_circle' : 'error_outline'}
      </span>
      <p className="text-xs font-bold leading-snug flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="material-icons-round text-lg text-zinc-400 hover:text-white shrink-0"
        aria-label="Dismiss"
      >
        close
      </button>
    </div>
  );
};

export default Toast;
