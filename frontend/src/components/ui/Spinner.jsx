import React from 'react';

const SIZE_MAP = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border-white/20 border-t-white animate-spin ${SIZE_MAP[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
