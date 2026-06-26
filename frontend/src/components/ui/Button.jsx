import React from 'react';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-accent-grad text-white shadow-glow-sm hover:shadow-glow hover:opacity-90',
  ghost:   'bg-white/5 border border-border-soft text-text-primary hover:bg-white/10',
  danger:  'bg-rose text-white hover:brightness-110 shadow-red',
  glass:   'glass text-text-primary hover:bg-white/10',
  success: 'bg-emerald text-white hover:brightness-110 shadow-green',
};

const SIZES = {
  xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-4 py-2 text-sm rounded-xl gap-2',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
};

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 select-none
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <Spinner size={size === 'xs' ? 'xs' : 'sm'} />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
