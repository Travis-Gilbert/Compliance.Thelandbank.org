import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Check, Info } from 'lucide-react';

const SECTIONS = [
  { id: 'compliance-overview', label: 'Compliance', isInfo: true },
  { id: 'buyer-info', label: 'Your Info' },
  { id: 'property-details', label: 'Property' },
  { id: 'progress-photos', label: 'Photos' },
  { id: 'documentation', label: 'Documents' },
  { id: 'submit', label: 'Submit' },
];

export default function BuyerProgressSpine({ completedSections = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showPill, setShowPill] = useState(false);
  const observerRef = useRef(null);

  // Scroll-based progress calculation
  const handleScroll = useCallback(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!elements.length) return;

    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Get positions of first and last section
    const firstTop = elements[0].offsetTop;
    const lastEl = elements[elements.length - 1];
    const lastBottom = lastEl.offsetTop + lastEl.offsetHeight;
    const totalHeight = lastBottom - firstTop;

    if (totalHeight <= 0) return;

    // Calculate continuous progress (0–100)
    const scrolled = scrollY + viewportHeight * 0.3 - firstTop;
    const progress = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
    setScrollProgress(progress);

    // Show pill after scrolling past the hero area
    setShowPill(scrollY > 200);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
    <>
      {/* ── Mobile: Thin scroll progress line at top of viewport ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {/* Track */}
        <div className="h-[3px] bg-warm-200/30 w-full">
          {/* Fill */}
          <div
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* ── Mobile: Floating section pill ──────────────── */}
      <div
        className={[
          'lg:hidden fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
          showPill
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        ].join(' ')}
      >
        <button
          onClick={() => handleClick(SECTIONS[activeIndex]?.id)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-warm-200/60 text-text"
        >
          <span className="text-xs font-heading font-semibold">
            {SECTIONS[activeIndex]?.label || 'Getting Started'}
          </span>
          <span className="text-[10px] font-mono text-muted bg-warm-100 px-1.5 py-0.5 rounded-full">
            {activeIndex + 1}/{SECTIONS.length}
          </span>
        </button>
      </div>

      {/* ── Desktop vertical spine ─────────────────────── */}
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
                ) : section.isInfo ? (
                  <Info className="w-3.5 h-3.5" />
                ) : (
                  SECTIONS.slice(0, i + 1).filter((s) => !s.isInfo).length
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
    </>
  );
}
