import { computeComplianceTiming } from './computeDueNow';
import { toRuleKey } from './programTypeMapper';

/**
 * Fill template variables with property data.
 *
 * @param {Object} template   – template object from emailTemplates.js
 * @param {string} action     – action key (ATTEMPT_1, WARNING, etc.)
 * @param {Object} property   – property record from mockData
 * @param {Date}   [today]    – optional date override
 * @returns {{ subject: string, body: string, missingVars: string[], recipientEmail: string }}
 */
export function renderTemplate(template, action, property, today) {
  const variant = template.variants[action];
  if (!variant) {
    return {
      subject: `[No ${action} variant]`,
      body: `Template "${template.name}" has no variant for action "${action}".`,
      missingVars: [],
      recipientEmail: property.buyerEmail || '',
    };
  }

  // Compute compliance timing to get dueDate and daysOverdue
  const timing = computeComplianceTiming(property, today);

  // Build variable map
  const vars = {
    '{BuyerName}':       property.buyerName || '',
    '{PropertyAddress}': property.address || '',
    '{DueDate}':         timing.dueDate || '',
    '{DaysOverdue}':     String(timing.daysOverdue || 0),
    '{ProgramType}':     timing.programLabel || property.programType || '',
    '{BuyerEmail}':      property.buyerEmail || '',
  };

  // Track missing
  const missingVars = [];
  Object.entries(vars).forEach(([key, val]) => {
    if (!val || val === '0') {
      // DaysOverdue of 0 is valid, don't flag it
      if (key !== '{DaysOverdue}' || val === '') {
        missingVars.push(key);
      }
    }
  });

  // Fill
  let subject = variant.subject;
  let body = variant.body;

  Object.entries(vars).forEach(([key, val]) => {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    subject = subject.replace(regex, val || key);
    body = body.replace(regex, val || key);
  });

  return {
    subject,
    body,
    missingVars,
    recipientEmail: property.buyerEmail || '',
  };
}

/**
 * Find the best matching template for a property + action.
 *
 * @param {Array}  templates  – array of template objects
 * @param {string} programType – display name or rule key
 * @param {string} action      – action key
 * @returns {Object|null} matching template or null
 */
export function findTemplateForAction(templates, programType, action) {
  const ruleKey = toRuleKey(programType);
  return (
    templates.find(
      (t) => t.programTypes.includes(ruleKey) && t.variants[action]
    ) || null
  );
}
