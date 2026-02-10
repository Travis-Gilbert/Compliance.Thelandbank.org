/**
 * COMPLIANCE_RULES — deterministic schedule configuration.
 *
 * Each program defines:
 *   scheduleDaysFromClose  – ordered array of { day, action, level }
 *   graceDays              – buffer before a step is considered overdue
 *   requiredUploads        – photo categories the buyer must provide
 *   requiredDocs           – document categories the buyer must provide
 *
 * "day" = calendar days after close date.
 * "action" = the outreach step to take (ATTEMPT_1, ATTEMPT_2, WARNING, DEFAULT_NOTICE).
 * "level"  = recommended enforcement level (1-4).
 */

export const COMPLIANCE_RULES = {
  FeaturedHomes: {
    label: 'Featured Homes',
    cadence: 'monthly',
    scheduleDaysFromClose: [
      { day: 30,  action: 'ATTEMPT_1',      level: 1 },
      { day: 60,  action: 'ATTEMPT_2',      level: 2 },
      { day: 90,  action: 'WARNING',         level: 3 },
      { day: 120, action: 'DEFAULT_NOTICE',  level: 4 },
    ],
    graceDays: 3,
    requiredUploads: [
      'Front Exterior',
      'Rear Exterior',
      'Kitchen',
      'Bathroom',
      'Living Area',
      'Bedroom',
      'Basement',
      'Active Work Area',
    ],
    requiredDocs: ['Permits (if applicable)', 'Contracts (if applicable)'],
  },

  Ready4Rehab: {
    label: 'Ready4Rehab',
    cadence: 'monthly',
    scheduleDaysFromClose: [
      { day: 30,  action: 'ATTEMPT_1',      level: 1 },
      { day: 60,  action: 'ATTEMPT_2',      level: 2 },
      { day: 90,  action: 'WARNING',         level: 3 },
      { day: 120, action: 'DEFAULT_NOTICE',  level: 4 },
    ],
    graceDays: 3,
    requiredUploads: [
      'Front Exterior',
      'Rear Exterior',
      'Kitchen',
      'Bathroom',
      'Living Area',
      'Bedroom',
      'Basement',
      'Active Work Area',
    ],
    requiredDocs: ['Permits (if applicable)', 'Contracts (if applicable)'],
  },

  Demolition: {
    label: 'Demolition',
    cadence: 'milestones',
    scheduleDaysFromClose: [
      { day: 14, action: 'ATTEMPT_1',      level: 1 },
      { day: 30, action: 'WARNING',         level: 3 },
      { day: 45, action: 'DEFAULT_NOTICE',  level: 4 },
    ],
    graceDays: 0,
    requiredUploads: ['Site Before', 'During', 'After'],
    requiredDocs: ['Contractor Agreement', 'Disposal Receipt'],
  },

  VIP: {
    label: 'VIP',
    cadence: 'quarterly',
    scheduleDaysFromClose: [
      { day: 90,  action: 'ATTEMPT_1',      level: 1 },
      { day: 120, action: 'ATTEMPT_2',      level: 2 },
      { day: 150, action: 'WARNING',         level: 3 },
      { day: 180, action: 'DEFAULT_NOTICE',  level: 4 },
    ],
    graceDays: 5,
    requiredUploads: ['Front Exterior', 'Rear Exterior'],
    requiredDocs: ['Insurance Proof'],
  },
};
