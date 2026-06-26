import React from 'react';

/**
 * Unread count badge with gradient background.
 */
export default function Badge({ count, className = '' }) {
  if (!count || count === 0) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5
        rounded-full text-2xs font-bold text-white bg-accent-grad ${className}`}
    >
      {label}
    </span>
  );
}
