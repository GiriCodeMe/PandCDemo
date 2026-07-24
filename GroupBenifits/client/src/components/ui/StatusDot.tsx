import React from 'react';
import clsx from 'clsx';

type DotStatus = 'active' | 'inactive' | 'pending' | 'error';

interface StatusDotProps {
  status: DotStatus;
  label?: string;
  className?: string;
}

const dotClasses: Record<DotStatus, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-300',
  pending: 'bg-amber-400',
  error: 'bg-red-500',
};

export default function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5', className)}>
      <span
        className={clsx('inline-block w-2 h-2 rounded-full flex-shrink-0', dotClasses[status])}
        aria-hidden="true"
      />
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </span>
  );
}
