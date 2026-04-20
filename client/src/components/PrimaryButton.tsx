import React from 'react';

interface PrimaryButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  loadingText?: string;
}

export function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  loadingText = 'Cargando…',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-xl font-semibold text-sm
    transition-all duration-200
    ${fullWidth ? 'w-full' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'}
  `;

  const variantClasses =
    variant === 'primary'
      ? 'text-white shadow-lg'
      : 'border border-accent text-accent bg-transparent hover:bg-accent/10';

  const primaryStyle =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #F239FF 0%, #8943E3 100%)',
          boxShadow: '0 0 24px rgba(242,57,255,0.35)',
        }
      : undefined;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses}`}
      style={primaryStyle}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
}
