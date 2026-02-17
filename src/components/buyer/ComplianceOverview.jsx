import React, { useState } from 'react';
import { COMPLIANCE_RULES } from '../../config/complianceRules';
import { ENFORCEMENT_LEVELS } from '../../data/programPolicies';
import { ACTION_LABELS } from '../../data/emailTemplates';
import { AppIcon } from '../ui';
import ICONS from '../../icons/iconMap';

/* ── Map buyer form values to COMPLIANCE_RULES keys ── */
const FORM_TO_RULE_KEY = {
  'featured-homes': 'FeaturedHomes',
  'ready4rehab':    'Ready4Rehab',
  'demolition':     'Demolition',
  'vip':            'VIP',
};

const CADENCE_LABELS = {
  monthly:    'Monthly updates required',
  quarterly:  'Quarterly updates required',
  milestones: 'Milestone-based reporting',
};

/* ── Step color mapping by enforcement level ──────── */
function stepColors(level) {
  const map = {
    1: { bg: 'bg-info-light',    text: 'text-info',    border: 'border-info/30' },
    2: { bg: 'bg-warning-light',  text: 'text-warning', border: 'border-warning/30' },
    3: { bg: 'bg-warning-light',  text: 'text-warning', border: 'border-warning/30' },
    4: { bg: 'bg-danger-light',   text: 'text-danger',  border: 'border-danger/30' },
  };
  return map[level] || map[1];
}

/* ── Variant to Tailwind class mapping ────────────── */
function variantClasses(variant) {
  const map = {
    success: 'bg-success-light text-success',
    info:    'bg-info-light text-info',
    warning: 'bg-warning-light text-warning',
    danger:  'bg-danger-light text-danger',
  };
  return map[variant] || map.info;
}

/* ══════════════════════════════════════════════════════
   ComplianceOverview
   ══════════════════════════════════════════════════════ */
export default function ComplianceOverview({ programType }) {
  const [expanded, setExpanded] = useState(false);

  const ruleKey = FORM_TO_RULE_KEY[programType];
  const rules = ruleKey ? COMPLIANCE_RULES[ruleKey] : null;

  return (
    <div id="compliance-overview" className="scroll-mt-8">
      <div className="bg-warm-100 rounded-xl border border-warm-200 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <AppIcon icon={ICONS.compliance} size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-text">
              Your Compliance Roadmap
            </h2>
          </div>
        </div>

        {/* Intro text */}
        {rules ? (
          <p className="text-sm text-text-secondary mt-3 leading-relaxed max-w-2xl">
            As a <strong className="font-semibold text-text">{rules.label}</strong> program
            buyer, you'll submit regular updates to show progress on your property. Here's
            the timeline the Land Bank follows if updates aren't received.
          </p>
        ) : (
          <p className="text-sm text-text-secondary mt-3 leading-relaxed max-w-2xl">
            Property buyers submit regular progress updates to the Land Bank.
            Select your program type above to see your specific compliance timeline.
          </p>
        )}

        {/* ── Visual timeline ───────────────────────── */}
        {rules && (
          <>
            <div className="flex flex-col md:flex-row gap-3 md:gap-0 mt-6">
              {rules.scheduleDaysFromClose.map((step, i) => {
                const isLast = i === rules.scheduleDaysFromClose.length - 1;
                const c = stepColors(step.level);

                return (
                  <React.Fragment key={i}>
                    <div className={`flex-1 p-3.5 rounded-lg border ${c.border} ${c.bg}`}>
                      <p className={`text-xs font-mono font-semibold ${c.text}`}>
                        Day {step.day}
                      </p>
                      <p className="text-sm font-medium text-text mt-1">
                        {ACTION_LABELS[step.action] || step.action}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        Compliance Level {step.level}
                      </p>
                    </div>
                    {!isLast && (
                      <>
                        {/* Desktop connector */}
                        <div className="hidden md:flex items-center px-1 flex-shrink-0">
                          <div className="w-5 border-t-2 border-dashed border-warm-200" />
                        </div>
                        {/* Mobile connector */}
                        <div className="md:hidden flex justify-center">
                          <div className="h-3 border-l-2 border-dashed border-warm-200" />
                        </div>
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Metadata bar */}
            <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-muted font-mono">
              <span className="inline-flex items-center gap-1.5">
                <AppIcon icon={ICONS.clock} size={12} className="text-muted" />
                {CADENCE_LABELS[rules.cadence] || rules.cadence}
              </span>
              {rules.graceDays > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon icon={ICONS.success} size={12} className="text-muted" />
                  {rules.graceDays}-day grace period
                </span>
              )}
              {rules.graceDays === 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon icon={ICONS.alert} size={12} className="text-danger" />
                  No grace period
                </span>
              )}
            </div>
          </>
        )}

        {/* ── Expandable formal policy ──────────────── */}
        <div className="mt-6 pt-5 border-t border-warm-200/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            <span
              className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}
            >
              <AppIcon icon={ICONS.chevronDown} size={14} />
            </span>
            {expanded ? 'Hide' : 'View'} Full Compliance Policy
          </button>

          {expanded && (
            <div className="mt-5 space-y-3.5 animate-fade-slide-up">
              {rules?.policy && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                    {rules.policy.description}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                    <strong className="font-semibold text-text">After purchase:</strong>{' '}
                    {rules.policy.complianceAfterPurchase}
                  </p>
                  {rules.policy.specialNotes && (
                    <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1 max-w-2xl">
                      {rules.policy.specialNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <p className="text-xs text-muted leading-relaxed max-w-2xl mb-4">
                The Genesee County Land Bank enforces graduated compliance levels.
                Buyers who fall behind on required updates progress through the
                following enforcement levels:
              </p>
              {ENFORCEMENT_LEVELS.map((level) => (
                <div key={level.level} className="flex gap-3 items-start">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${variantClasses(level.variant)}`}
                  >
                    {level.level}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text">{level.label}</p>
                    {level.days && (
                      <p className="text-[10px] font-mono text-muted">{level.days}</p>
                    )}
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {level.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
