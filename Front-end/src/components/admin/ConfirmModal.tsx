import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  confirmTone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  confirmTone = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmClass =
    confirmTone === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-[#0B0B0B] text-white hover:bg-[#39FF14] hover:text-[#0B0B0B]';

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-sm border border-zinc-200 p-6">
        <h3 className="text-[#0B0B0B] font-black text-lg uppercase tracking-tight mb-2">{title}</h3>
        {description && <p className="text-sm text-zinc-500 mb-6">{description}</p>}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#0B0B0B] disabled:opacity-40"
            disabled={isConfirming}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 ${confirmClass} rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50`}
          >
            {isConfirming ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

