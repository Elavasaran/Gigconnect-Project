import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hover = true, ...props }) => {
  return (
    <div 
      className={twMerge(
        'bg-white border border-gray-100 rounded-2xl shadow-sm p-6 overflow-hidden',
        hover && 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
