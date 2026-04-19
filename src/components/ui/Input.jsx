import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = ({ label, error, className, icon, ...props }) => {
  return (
    <div className={twMerge('w-full', className)}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={twMerge(
            'w-full py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-gray-900 placeholder:text-gray-400',
            icon ? 'pl-11 pr-4' : 'px-4',
            error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
