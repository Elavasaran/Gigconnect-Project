import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-brand-50 text-brand-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
  };

  return (
    <span className={twMerge(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
