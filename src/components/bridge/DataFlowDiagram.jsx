import React from 'react';
import { AppIcon } from '../ui';
import ICONS from '../../icons/iconMap';

/**
 * DataFlowDiagram — Compact linear data lifecycle visualization
 *
 * 5 stages connected by labeled arrows. Compact cards with icons.
 * DOM-based for crisp text. Horizontal on desktop, vertical on mobile.
 */

const STAGES = [
  {
    id: 'buyer',
    label: 'Buyer Portal',
    detail: 'Compliance updates, photos, and documents',
    icon: ICONS.user,
    color: 'bg-accent',
  },
  {
    id: 'neon',
    label: 'Neon Database',
    detail: 'PostgreSQL cache for instant queries',
    icon: ICONS.database,
    color: 'bg-accent',
  },
  {
    id: 'filemaker',
    label: 'FileMaker Server',
    detail: '30,000+ property records',
    icon: ICONS.database,
    color: 'bg-accent',
  },
  {
    id: 'compliance',
    label: 'Compliance Engine',
    detail: 'Hourly checks flag overdue properties',
    icon: ICONS.shieldCheck,
    color: 'bg-accent',
  },
  {
    id: 'admin',
    label: 'Admin Portal',
    detail: 'Staff reviews and takes action',
    icon: ICONS.dashboard,
    color: 'bg-accent',
  },
];

const CONNECTIONS = [
  { label: 'Submission' },
  { label: 'API Sync' },
  { label: 'Cron Check' },
  { label: 'Review Queue' },
];

/* ── Stage card ───────────────────────────────── */

function StageCard({ stage, index }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step number */}
      <div className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center shadow-sm z-10">
        {index + 1}
      </div>

      {/* Card */}
      <div className="w-full px-3 py-2.5 rounded-md border border-accent/20 bg-accent/5 transition-all duration-150 hover:bg-accent/10">
        <div className="w-7 h-7 rounded bg-accent text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
          <AppIcon icon={stage.icon} size={14} />
        </div>
        <h4 className="text-[11px] font-bold text-text leading-tight mb-0.5">{stage.label}</h4>
        <p className="text-[9px] text-muted leading-snug">{stage.detail}</p>
      </div>
    </div>
  );
}

/* ── Arrow ────────────────────────────────────── */

function FlowArrow({ connection }) {
  return (
    <div className="flex flex-col items-center justify-center px-0.5 self-center">
      <span className="text-[8px] font-semibold text-muted mb-0.5 whitespace-nowrap">{connection.label}</span>
      <div className="flex items-center">
        <div className="w-5 h-[1.5px] bg-accent/30" />
        <div className="w-0 h-0 border-l-[4px] border-l-accent/40 border-y-[2.5px] border-y-transparent" />
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────── */

export default function DataFlowDiagram() {
  return (
    <div className="w-full">
      {/* Desktop — horizontal */}
      <div className="hidden lg:flex items-start justify-center gap-0">
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <div className="w-[130px] flex-shrink-0">
              <StageCard stage={stage} index={i} />
            </div>
            {i < STAGES.length - 1 && <FlowArrow connection={CONNECTIONS[i]} />}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile — vertical */}
      <div className="lg:hidden space-y-1.5">
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <StageCard stage={stage} index={i} />
            {i < STAGES.length - 1 && (
              <div className="flex flex-col items-center py-0.5">
                <div className="h-3 w-[1.5px] bg-accent/30" />
                <div className="w-0 h-0 border-t-[4px] border-t-accent/40 border-x-[2.5px] border-x-transparent" />
                <span className="text-[8px] font-semibold text-muted mt-0.5">{CONNECTIONS[i].label}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Feedback loop */}
      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-accent/5 border border-accent/15">
        <AppIcon icon={ICONS.outreach} size={12} className="text-accent flex-shrink-0" />
        <span className="text-[10px] text-accent font-medium">Email / Token Link</span>
        <span className="text-[9px] text-muted">— compliance notices cycle back to buyers via unique secure links</span>
      </div>
    </div>
  );
}
