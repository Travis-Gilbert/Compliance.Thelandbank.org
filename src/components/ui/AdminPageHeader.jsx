import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumb,
  stagger = 0,
}) {
  return (
    <div
      className="mb-8 animate-fade-slide-up"
      style={stagger ? { animationDelay: `${stagger}ms` } : undefined}
    >
      {/* Optional breadcrumb / back link */}
      {breadcrumb && (
        <Link
          to={breadcrumb.to}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {breadcrumb.label}
        </Link>
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="flex-shrink-0 p-2 bg-warm-100 rounded-lg mt-0.5">
              <Icon className="w-5 h-5 text-accent" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-heading text-lg sm:text-xl font-semibold text-text tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-warm-200 mt-6" />
    </div>
  );
}
