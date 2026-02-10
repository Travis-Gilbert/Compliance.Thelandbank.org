import React, { useEffect, useState, useRef } from 'react';
import { Check } from 'lucide-react';

const SECTIONS = [
  { id: 'buyer-info', label: 'Your Info' },
  { id: 'property-details', label: 'Property' },
  { id: 'progress-photos', label: 'Photos' },
  { id: 'documentation', label: 'Documents' },
  { id: 'submit', label: 'Submit' },
];

export default function BuyerProgressSpine({ completedSections = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!elements.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        let topVisible = null;
        let topY = Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            if (rect.top < topY) {
              topY = rect.top;
              topVisible = entry.target;
            }
          }
        });

        if (topVisible) {
          const idx = SECTIONS.findIndex((s) => s.id === topVisible.id);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { threshold: 0.15, rootMargin: '-80px 0px -40% 0px' }
    );

    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Form progress"
      className="hidden lg:flex flex-col items-center gap-0 sticky top-8 self-start pt-4"
    >
      {SECTIONS.map((section, i) => {
        const isActive = i === activeIndex;
        const isCompleted = completedSections.includes(section.id);
        const isLast = i === SECTIONS.length - 1;

        return (
          <div key={section.id} className="flex flex-col items-center">
            {/* Step circle */}
            <button
              type="button"
              onClick={() => handleClick(section.id)}
              className={[
                'w-8 h-8 rounded-full font-mono text-xs flex items-center justify-center transition-all duration-300 relative z-10',
                isActive
                  ? 'bg-accent text-white font-bold shadow-sm'
                  : isCompleted
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'border-2 border-warm-200 text-muted',
              ].join(' ')}
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted && !isActive ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                i + 1
              )}
            </button>

            {/* Label */}
            <span
              className={[
                'text-[10px] mt-1.5 text-center leading-tight transition-colors duration-300',
                isActive ? 'text-text font-medium' : 'text-muted',
              ].join(' ')}
            >
              {section.label}
            </span>

            {/* Connecting line */}
            {!isLast && (
              <div className="w-px h-8 buyer-spine-line my-1" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
