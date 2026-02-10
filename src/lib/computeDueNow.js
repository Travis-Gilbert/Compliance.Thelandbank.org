import { COMPLIANCE_RULES } from '../config/complianceRules';
import { toRuleKey } from './programTypeMapper';

/* ── helpers ───────────────────────────────────────────── */
const toDate = (iso) => (iso ? new Date(iso + 'T00:00:00') : null);
const daysBetween = (a, b) => Math.floor((a - b) / (1000 * 60 * 60 * 24));

/**
 * Map action types to the property fields that record when they were sent.
 * When a field is populated, we know that action was already completed.
 */
const ACTION_TO_FIELD = {
  ATTEMPT_1: 'compliance1stAttempt',
  ATTEMPT_2: 'compliance2ndAttempt',
};

/* ── main computation ──────────────────────────────────── */

/**
 * Deterministic compliance timing for a single property record.
 *
 * Now considers existing attempt dates: if compliance1stAttempt is set,
 * ATTEMPT_1 is marked as completed and we look for the next uncompleted step.
 *
 * @param {Object}  record  – property record (from PropertyContext or mockData)
 * @param {Date}    [today] – override for testing
 * @returns {Object} timing result or { error }
 */
export function computeComplianceTiming(record, today = new Date()) {
  const ruleKey = toRuleKey(record.programType);
  const rules = COMPLIANCE_RULES[ruleKey];
  if (!rules) return { error: `No rules found for programType: ${record.programType}` };

  const closeRaw = record.closeDate || record.dateSold;
  const close = toDate(closeRaw);
  if (!close) return { error: 'Missing closeDate / dateSold' };

  const daysSinceClose = daysBetween(today, close);
  const schedule = rules.scheduleDaysFromClose.slice().sort((a, b) => a.day - b.day);

  // ── Determine which steps are already completed ─────────
  const completedActions = new Set();

  // Check property fields for recorded attempt dates
  if (record.compliance1stAttempt) completedActions.add('ATTEMPT_1');
  if (record.compliance2ndAttempt) completedActions.add('ATTEMPT_2');

  // Also check communications array for sent emails
  if (record.communications?.length) {
    record.communications.forEach((comm) => {
      if (comm.status === 'sent' && comm.action) {
        completedActions.add(comm.action);
      }
    });
  }

  // ── Walk schedule: find current step (may be completed) ──
  const currentScheduleStep =
    [...schedule].reverse().find((s) => daysSinceClose >= s.day) ||
    { day: 0, action: 'NOT_DUE_YET', level: 0 };

  // ── Find the next UNCOMPLETED action that is due ─────────
  // If the current step was already completed, look for the next one
  let effectiveStep = currentScheduleStep;
  let actionAlreadySent = false;

  if (currentScheduleStep.action !== 'NOT_DUE_YET') {
    if (completedActions.has(currentScheduleStep.action)) {
      actionAlreadySent = true;
      // Find the next uncompleted step that is also due
      const nextUncompleted = schedule.find(
        (s) => s.day > currentScheduleStep.day && daysSinceClose >= s.day && !completedActions.has(s.action)
      );
      if (nextUncompleted) {
        effectiveStep = nextUncompleted;
        actionAlreadySent = false;
      }
    }
  }

  // ── Find next upcoming step (not yet due) ────────────────
  const nextStep = schedule.find((s) => s.day > effectiveStep.day && !completedActions.has(s.action)) || null;

  // ── Compute due date and overdue status ──────────────────
  const currentDueDate = new Date(close);
  currentDueDate.setDate(currentDueDate.getDate() + effectiveStep.day);

  const daysOverdue = daysBetween(today, currentDueDate) - (rules.graceDays || 0);
  const isDueNow =
    effectiveStep.action !== 'NOT_DUE_YET' &&
    !actionAlreadySent &&
    daysOverdue >= 0;

  return {
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
    lastContactDate: record.lastContactDate || null,
  };
}
