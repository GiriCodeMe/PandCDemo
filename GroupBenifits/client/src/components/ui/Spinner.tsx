import React from 'react';
import clsx from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, { wrapper: string; svg: string }> = {
  sm: { wrapper: 'w-4 h-4', svg: 'w-4 h-4' },
  md: { wrapper: 'w-8 h-8', svg: 'w-8 h-8' },
  lg: { wrapper: 'w-12 h-12', svg: 'w-12 h-12' },
};

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const { wrapper, svg } = sizeClasses[size];
  return (
    <div className={clsx('flex items-center justify-center', wrapper, className)}>
      <svg
        className={clsx('animate-spin text-brand-500', svg)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}
