import React, { useId } from 'react';

interface ProductSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md';
  variant?: 'dark' | 'light';
  id?: string;
}

export const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search products…',
  className = '',
  inputClassName = '',
  size = 'md',
  variant = 'dark',
  id: idProp,
}) => {
  const autoId = useId();
  const inputId = idProp ?? autoId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const sizeClasses =
    size === 'sm'
      ? 'py-2 pl-9 pr-8 text-[11px]'
      : 'py-2.5 pl-10 pr-9 text-xs';

  const variantClasses =
    variant === 'light'
      ? 'bg-white border-zinc-200 text-[#0B0B0B] placeholder:text-zinc-400'
      : 'bg-zinc-900/80 border-zinc-700 text-zinc-200 placeholder:text-zinc-500';

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} role="search">
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <span
        className="material-icons-round absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none"
        aria-hidden
      >
        search
      </span>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full border rounded-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors ${variantClasses} ${sizeClasses} ${inputClassName}`}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#39FF14] transition-colors"
          aria-label="Clear search"
        >
          <span className="material-icons-round text-base">close</span>
        </button>
      )}
    </form>
  );
};
