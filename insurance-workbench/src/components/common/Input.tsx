import React from 'react';


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className,
  fullWidth = false,
  ...props
}, ref) => {
  const containerClass = `flex flex-col mb-4 ${fullWidth ? 'w-full' : ''} ${className || ''}`;
  const inputClass = `h-9 px-2 border-0 border-b border-gray-300 bg-transparent text-gray-900 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors ${error ? 'border-red-500' : ''}`;

  return (
    <div className={containerClass}>
      {label && <label className="text-gray-800 text-sm mb-2">{label}</label>}
      <input
        ref={ref}
        className={inputClass}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
