import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, Hash } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search or start chat...', onClear }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClear?.(); inputRef.current?.blur(); }
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2.5 rounded-2xl
        transition-all duration-200
        ${focused
          ? 'bg-elevated border border-border-accent shadow-glow-sm'
          : 'bg-overlay border border-border-soft hover:border-border-mid'
        }
      `}
    >
      <Search
        size={15}
        className={`flex-shrink-0 transition-colors duration-150 ${focused ? 'text-electric' : 'text-text-muted'}`}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder-text-muted caret-electric"
      />
      {value && (
        <button
          onClick={() => { onClear?.(); onChange(''); }}
          className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center
                     text-text-muted hover:text-text-primary transition-colors duration-150"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
