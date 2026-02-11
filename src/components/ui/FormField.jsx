import React from 'react';
import { ChevronDown } from 'lucide-react';

/* ── FormField wrapper ─────────────────────────────── */
export function FormField({ label, required, helper, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-text mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {helper && !error && <p className="text-xs text-muted mt-1">{helper}</p>}
    </div>
  );
}

/* ── TextInput ─────────────────────────────────────── */
export function TextInput({ hasError, error, onChange, className = '', ...props }) {
  const isError = hasError || error;
  return (
    <input
      className={[
        'w-full px-3 py-2 min-h-[44px] text-sm text-text bg-surface-alt',
        'border rounded-md transition-colors',
        'placeholder:text-muted/50',
        isError
          ? 'border-danger ring-1 ring-danger/20'
          : 'border-border-input hover:border-muted/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15',
        'focus:outline-none',
        'disabled:bg-warm-100/60 disabled:text-muted disabled:cursor-not-allowed',
        className,
      ].join(' ')}
      onChange={(e) => onChange && onChange(e.target.value, e)}
      {...props}
    />
  );
}

/* ── SelectInput ───────────────────────────────────── */
export function SelectInput({ hasError, error, options, children, onChange, value, className = '', ...props }) {
  const isError = hasError || error;
  const isPlaceholder = value === '' || value === undefined;
  return (
    <div className="relative">
      <select
        className={[
          'w-full px-3 py-2 min-h-[44px] text-sm bg-surface-alt appearance-none cursor-pointer pr-8',
          'border rounded-md transition-colors',
          isPlaceholder ? 'text-muted/50' : 'text-text',
          isError
            ? 'border-danger ring-1 ring-danger/20'
            : 'border-border-input hover:border-muted/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15',
          'focus:outline-none',
          'disabled:bg-warm-100/60 disabled:text-muted disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        onChange={(e) => onChange && onChange(e.target.value, e)}
        value={value}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                hidden={opt.hidden}
              >
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
    </div>
  );
}
