import React from 'react';

const VARIANT_STYLES = {
  default: 'bg-surface-alt text-text-secondary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger:  'bg-danger-light text-danger',
  info:    'bg-info-light text-info',
};

const STATUS_TO_VARIANT = {
  compliant:          'success',
  'on-track':         'success',
  completed:          'success',
  watch:              'warning',
  'due-soon':         'warning',
  'needs-attention':  'warning',
  'at-risk':          'danger',
  overdue:            'danger',
  'non-compliant':    'danger',
  default:            'danger',
};

export function StatusPill({ children, variant, status, className = '' }) {
  const resolved = variant || STATUS_TO_VARIANT[status] || 'default';
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide',
        VARIANT_STYLES[resolved] || VARIANT_STYLES.default,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
