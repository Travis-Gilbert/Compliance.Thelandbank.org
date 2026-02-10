/**
 * Bidirectional mapping between display names (mockData) and rule keys (COMPLIANCE_RULES).
 *
 * mockData uses:  'Featured Homes', 'Ready4Rehab', 'Demolition', 'VIP'
 * Rules use:      'FeaturedHomes',  'Ready4Rehab',  'Demolition', 'VIP'
 */

const DISPLAY_TO_KEY = {
  'Featured Homes': 'FeaturedHomes',
  'Ready4Rehab':    'Ready4Rehab',
  'Demolition':     'Demolition',
  'VIP':            'VIP',
};

const KEY_TO_DISPLAY = Object.fromEntries(
  Object.entries(DISPLAY_TO_KEY).map(([d, k]) => [k, d])
);

/** Convert a display name (e.g. 'Featured Homes') to its rule key ('FeaturedHomes'). */
export const toRuleKey = (displayName) => DISPLAY_TO_KEY[displayName] || displayName;

/** Convert a rule key (e.g. 'FeaturedHomes') to its display name ('Featured Homes'). */
export const toDisplayName = (ruleKey) => KEY_TO_DISPLAY[ruleKey] || ruleKey;

/** All rule keys that exist in COMPLIANCE_RULES. */
export const ALL_PROGRAM_KEYS = Object.keys(DISPLAY_TO_KEY).map((d) => DISPLAY_TO_KEY[d]);

/** All display names. */
export const ALL_PROGRAM_NAMES = Object.keys(DISPLAY_TO_KEY);
