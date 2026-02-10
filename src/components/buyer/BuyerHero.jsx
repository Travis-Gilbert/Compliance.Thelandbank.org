import React from 'react';

export default function BuyerHero() {
  return (
    <header className="bg-warm-100 border-b-2 border-accent">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:py-10 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl lg:text-[28px] font-bold text-text tracking-tight">
            The Genesee County Land Bank Authority
          </h1>
          <p className="text-sm text-muted mt-1">Compliance Portal</p>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] font-medium uppercase tracking-widest text-muted bg-warm-200/60 px-3 py-1.5 rounded">
          Prototype
        </span>
      </div>
    </header>
  );
}
