import React from 'react';
import { FileText, Image, X } from 'lucide-react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'heic', 'webp'].includes(ext)) {
    return Image;
  }
  return FileText;
}

export default function FileListItem({ name, size, onRemove }) {
  const Icon = getIcon(name);

  return (
    <div className="group flex items-center gap-3 px-4 py-3 bg-warm-100/60 rounded-lg border border-warm-200/60 transition-colors hover:bg-warm-100">
      <Icon className="w-4 h-4 text-accent-blue flex-shrink-0" />
      <div className="min-w-0 flex-grow">
        <p className="text-sm text-text truncate">{name}</p>
        <p className="text-xs text-muted">{formatSize(size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger-light transition-colors flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={`Remove ${name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
