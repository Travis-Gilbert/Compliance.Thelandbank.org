import React from 'react';

const VARIANT_BORDER = {
  default: '',
  success: 'border-l-[3px] border-l-success',
  warning: 'border-l-[3px] border-l-warning',
  danger:  'border-l-[3px] border-l-danger',
  info:    'border-l-[3px] border-l-info',
};

export function Card({
  children,
  variant = 'default',
  title,
  subtitle,
  padding = 'p-5',
  className = '',
  ...props
}) {
  return (
    <div
      className={[
        'bg-surface rounded-lg border border-border shadow-sm',
        VARIANT_BORDER[variant] || '',
        padding,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-heading text-base font-semibold text-text">{title}</h3>}
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
