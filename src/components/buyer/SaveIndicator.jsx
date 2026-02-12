import React from 'react';
import ICONS from '../../icons/iconMap';
import { AppIcon } from '../ui/AppIcon';

export default function SaveIndicator({ show }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-slide-up">
      <div className="flex items-center gap-2 bg-surface border border-border shadow-md rounded-full px-4 py-2">
        <AppIcon icon={ICONS.success} size={14} className="text-accent" />
        <span className="text-xs font-medium text-text">Progress saved</span>
      </div>
    </div>
  );
}
