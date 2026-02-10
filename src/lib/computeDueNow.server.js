/**
 * Server-side compliance timing engine.
 *
 * Mirrors computeDueNow.js but works with Prisma DB records
 * (Date objects instead of ISO strings, slightly different field names).
 *
 * Can also accept the same flat object shape from the API routes.
 */

import { COMPLIANCE_RULES } from '../config/complianceRules.js';

/* ── helpers ───────────────────────────────────────────── */
const toDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  return new Date(typeof val === 'string' && !val.includes('T') ? val + 'T00:00:00' : val);
};

const daysBetween = (a, b) => Math.floor((a - b) / (1000 * 60 * 60 * 24));

/* ── program type → rule key mapping ───────────────────── */
const DISPLAY_TO_KEY = {
  'Featured Homes': 'FeaturedHomes',
  'Ready4Rehab': 'Ready4Rehab',
  'Demolition': 'Demolition',
  'VIP': 'VIP',
};
const toRuleKey = (displayName) => DISPLAY_TO_KEY[displayName] || displayName;

/**
 * Compute compliance timing for a single property record.
 *
 * @param {Object}  record  – property record (DB row or API flat object)
 * @param {Date}    [today] – override for testing
 * @returns {Object} timing result or { error }
 */
export function computeComplianceTimingServer(record, today = new Date()) {
  const ruleKey = toRuleKey(record.programType);
  const rules = COMPLIANCE_RULES[ruleKey];
  if (!rules) return { error: `No rules found for programType: ${record.programType}` };

  const closeRaw = record.closeDate || record.dateSold;
  const close = toDate(closeRaw);
  if (!close) return { error: 'Missing closeDate / dateSold' };

  const daysSinceClose = daysBetween(today, close);
  const schedule = rules.scheduleDaysFromClose.slice().sort((a, b) => a.day - b.day);

  // ── Determine completed steps ──────────────────────────
  const completedActions = new Set();

  if (record.compliance1stAttempt) completedActions.add('ATTEMPT_1');
  if (record.compliance2ndAttempt) completedActions.add('ATTEMPT_2');

  // Check communications array (if populated)
  if (record.communications?.length) {
    record.communications.forEach((comm) => {
      if (comm.status === 'sent' && comm.action) {
        completedActions.add(comm.action);
      }
    });
  }

  // ── Walk schedule ──────────────────────────────────────
  const currentScheduleStep =
    [...schedule].reverse().find((s) => daysSinceClose >= s.day) ||
    { day: 0, action: 'NOT_DUE_YET', level: 0 };

  let effectiveStep = currentScheduleStep;
  let actionAlreadySent = false;

  if (currentScheduleStep.action !== 'NOT_DUE_YET') {
    if (completedActions.has(currentScheduleStep.action)) {
      actionAlreadySent = true;
      const nextUncompleted = schedule.find(
        (s) => s.day > currentScheduleStep.day && daysSinceClose >= s.day && !completedActions.has(s.action)
      );
      if (nextUncompleted) {
        effectiveStep = nextUncompleted;
        actionAlreadySent = false;
      }
    }
  }

  const nextStep = schedule.find((s) => s.day > effectiveStep.day && !completedActions.has(s.action)) || null;

  // ── Due date and overdue ───────────────────────────────
  const currentDueDate = new Date(close);
  currentDueDate.setDate(currentDueDate.getDate() + effectiveStep.day);

  const daysOverdue = daysBetween(today, currentDueDate) - (rules.graceDays || 0);
  const isDueNow =
    effectiveStep.action !== 'NOT_DUE_YET' &&
    !actionAlreadySent &&
    daysOverdue >= 0;

  const lastContact = toDate(record.lastContactDate);

  return {
    propertyId: record.id,
    parcelId: record.parcelId,
    address: record.address,
    buyerName: record.buyerName || `${record.buyer?.firstName || ''} ${record.buyer?.lastName || ''}`.trim(),
    buyerEmail: record.buyerEmail || record.buyer?.email || '',
    programType: record.programType,
    programLabel: rules.label,
    daysSinceClose,
    currentAction: effectiveStep.action,
    recommendedEnforcementLevel: effectiveStep.level,
    dueDate: currentDueDate.toISOString().slice(0, 10),
    isDueNow,
    daysOverdue: Math.max(0, daysOverdue),
    actionAlreadySent,
    completedActions: Array.from(completedActions),
    nextAction: nextStep?.action || null,
    nextDueDate: nextStep
      ? new Date(new Date(close).setDate(close.getDate() + nextStep.day)).toISOString().slice(0, 10)
      : null,
    lastContactDate: lastContact?.toISOString().slice(0, 10) || null,
    enforcementLevel: record.enforcementLevel ?? 0,
  };
}

/**
 * Compute compliance timing for multiple records.
 * Returns sorted by daysOverdue desc (most urgent first).
 */
export function computeBatchTiming(records, today = new Date()) {
  return records
    .map((r) => computeComplianceTimingServer(r, today))
    .filter((t) => !t.error)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}
