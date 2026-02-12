import React from 'react';
import { AppIcon } from './AppIcon';

export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mb-4">
          <AppIcon icon={icon} size={20} className="text-muted" />
        </div>
      )}
      <p className="text-sm font-medium text-text mb-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted max-w-xs">{subtitle}</p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
        >
          {action} &rarr;
        </button>
      )}
    </div>
  );
}
