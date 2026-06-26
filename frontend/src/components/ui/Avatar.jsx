import React from 'react';
import { getInitials, colorFromString } from '../../utils/avatar';

const SIZE_MAP = {
  xs:  'w-7 h-7 text-2xs',
  sm:  'w-9 h-9 text-xs',
  md:  'w-11 h-11 text-sm',
  lg:  'w-14 h-14 text-base',
  xl:  'w-20 h-20 text-xl',
};

/**
 * Avatar component with image + initials fallback + optional online dot.
 */
export default function Avatar({ src, name = '', size = 'md', isOnline, className = '' }) {
  const sizeClass  = SIZE_MAP[size] || SIZE_MAP.md;
  const initials   = getInitials(name);
  const bgColor    = colorFromString(name);

  const dotSize = size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover border-2 border-white/10 block`}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      {/* Initials fallback */}
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-text-bright select-none ${src ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>

      {/* Online/offline status dot */}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0.5 right-0.5 ${dotSize} rounded-full border-2 border-abyss
            ${isOnline ? 'bg-emerald' : 'bg-text-faint'}`}
        />
      )}
    </div>
  );
}
