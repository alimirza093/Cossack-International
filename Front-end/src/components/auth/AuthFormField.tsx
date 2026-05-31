import React from 'react';

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}

const AuthFormField: React.FC<AuthFormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
}) => (
  <div>
    <label htmlFor={id} className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
      {label}
      {!required && <span className="text-zinc-400 font-bold normal-case tracking-normal"> (optional)</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
    />
  </div>
);

export default AuthFormField;
