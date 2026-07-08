import React from 'react';


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large'; 
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  size = 'medium',
  disabled,
  ...props
}, ref) => {
  let variantClass = '';
  if (variant === 'primary') {
    variantClass = 'bg-blue-500 text-white hover:bg-blue-600';
  } else if (variant === 'secondary') {
    variantClass = 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50';
  } else if (variant === 'text') {
    variantClass = 'bg-transparent text-blue-500 hover:text-blue-600 p-0';
  }

  let sizeClass = '';
  if (size === 'small') {
    sizeClass = 'h-8 text-sm min-w-[60px] px-3';
  } else if (size === 'large') {
    sizeClass = 'h-11 text-base min-w-[120px] px-6';
  } else {
    sizeClass = 'h-9 text-sm min-w-[100px] px-4';
  }

  const widthClass = fullWidth ? 'w-full' : '';
  const baseClass = 'inline-flex items-center justify-center rounded font-semibold transition-colors outline-none disabled:opacity-30 disabled:cursor-default';

  return (
    <button
      ref={ref}
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className || ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
