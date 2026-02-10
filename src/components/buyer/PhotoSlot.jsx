import React, { useRef, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

export default function PhotoSlot({ label, photo, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 600);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-label={`Upload photo for ${label}`}
      />

      {photo ? (
        /* ── Filled state ──────────────────────────────── */
        <div
          className={[
            'relative w-full aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer',
            'border-2 transition-all duration-200',
            justUploaded ? 'border-accent' : 'border-warm-200 hover:border-accent-blue',
          ].join(' ')}
          onClick={handleClick}
        >
          <img
            src={photo.data}
            alt={label}
            className="w-full h-full object-cover"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
              <RefreshCw className="w-3 h-3" />
              Replace
            </span>
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1.5 right-1.5 p-1 bg-white/90 border border-border rounded-full hover:bg-danger-light hover:border-danger transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Remove ${label} photo`}
          >
            <X className="w-3.5 h-3.5 text-text group-hover:text-danger" />
          </button>
        </div>
      ) : (
        /* ── Empty state ───────────────────────────────── */
        <button
          type="button"
          onClick={handleClick}
          className={[
            'w-full aspect-[4/3] rounded-lg',
            'bg-warm-100/50 border-2 border-dashed border-warm-200',
            'hover:border-accent hover:bg-accent-light/20',
            'transition-all duration-200 cursor-pointer',
            'flex flex-col items-center justify-center gap-2',
          ].join(' ')}
        >
          <Camera className="w-5 h-5 text-text/40" />
          <span className="text-xs font-medium text-text/50">Tap to upload</span>
        </button>
      )}

      {/* Slot label badge */}
      <span className="mt-2 text-xs font-mono font-semibold uppercase tracking-wide text-text/60 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
