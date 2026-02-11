/**
 * FileMaker ↔ Portal field mapping configuration.
 *
 * This is the single source of truth for translating between Prisma/portal
 * field names and the actual FileMaker layout field names. Update the FM
 * column when you inspect Lucille's layout in FM Data API.
 *
 * Mapping format: { portalField: 'FM_FieldName' }
 *
 * ⚠  FM field names are PLACEHOLDERS based on common land bank conventions.
 *    Run GET /api/filemaker?action=status&meta=true to discover actual field names.
 */

/* ── Property fields ────────────────────────────────────── */

export const PROPERTY_FIELD_MAP = {
  // Identifiers
  parcelId:              'ParcelID',
  address:               'Property_Address',

  // Program
  programType:           'Program_Type',
  dateSold:              'Date_Sold',
  offerType:             'Offer_Type',
  purchaseType:          'Purchase_Type',

  // Compliance dates
  occupancyDeadline:     'Occupancy_Deadline',
  insuranceDueDate:      'Insurance_Due_Date',
  insuranceReceived:     'Insurance_Received',
  occupancyEstablished:  'Occupancy_Established',
  minimumHoldExpiry:     'Minimum_Hold_Expiry',

  // Rehab fields
  dateProofOfInvestProvided: 'Date_Proof_Investment',
  compliance1stAttempt:      'Compliance_1st_Attempt',
  compliance2ndAttempt:      'Compliance_2nd_Attempt',
  lastContactDate:           'Last_Contact_Date',
  scopeOfWorkApproved:       'Scope_Work_Approved',
  buildingPermitObtained:    'Building_Permit_Obtained',
  rehabDeadline:             'Rehab_Deadline',
  percentComplete:           'Percent_Complete',

  // Demo fields
  demoFinalCertDate:     'Demo_Final_Cert_Date',

  // Bond
  bondRequired:          'Bond_Required',
  bondAmount:            'Bond_Amount',

  // VIP
  complianceType:        'Compliance_Type',

  // LISC
  referredToLISC:        'Referred_To_LISC',
  liscRecommendReceived: 'LISC_Recommend_Received',
  liscRecommendSale:     'LISC_Recommend_Sale',

  // Enforcement
  enforcementLevel:      'Enforcement_Level',
  status:                'Compliance_Status',
};

/* ── Buyer fields ───────────────────────────────────────── */

export const BUYER_FIELD_MAP = {
  firstName:     'Buyer_FirstName',
  lastName:      'Buyer_LastName',
  email:         'Buyer_Email',
  phone:         'Buyer_Phone',
  organization:  'Buyer_Organization',
};

/* ── Communication fields ───────────────────────────────── */

export const COMMUNICATION_FIELD_MAP = {
  action:         'Communication_Action',
  channel:        'Communication_Channel',
  recipientEmail: 'Recipient_Email',
  subject:        'Email_Subject',
  bodyText:       'Email_Body',
  status:         'Communication_Status',
  sentAt:         'Date_Sent',
  templateName:   'Template_Name',
};

/* ── Submission fields ──────────────────────────────────── */

export const SUBMISSION_FIELD_MAP = {
  type:            'Submission_Type',
  status:          'Submission_Status',
  confirmationId:  'Confirmation_ID',
  createdAt:       'Date_Submitted',
};

/* ── FM layout names (env-configurable) ─────────────────── */

export function getLayouts() {
  return {
    properties:     process.env.FM_LAYOUT_PROPERTIES     || 'ComplianceProperties',
    buyers:         process.env.FM_LAYOUT_BUYERS          || 'Buyers',
    submissions:    process.env.FM_LAYOUT_SUBMISSIONS     || 'BuyerSubmissions',
    communications: process.env.FM_LAYOUT_COMMUNICATIONS  || 'CommunicationLog',
  };
}

/* ── Converters ─────────────────────────────────────────── */

/**
 * FM date format is MM/DD/YYYY for find queries.
 * Portal uses ISO YYYY-MM-DD or Date objects.
 */
function toFMDate(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

function fromFMDate(value) {
  if (!value) return null;
  // FM returns dates as strings — could be MM/DD/YYYY or ISO
  if (value.includes('/')) {
    const [m, d, y] = value.split('/');
    return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00Z`);
  }
  return new Date(value);
}

function toFMBoolean(value) {
  return value ? 1 : 0;
}

function fromFMBoolean(value) {
  return value === 1 || value === '1' || value === 'Yes' || value === true;
}

/** Date-type fields in the property map */
const DATE_FIELDS = new Set([
  'dateSold', 'occupancyDeadline', 'insuranceDueDate', 'minimumHoldExpiry',
  'dateProofOfInvestProvided', 'compliance1stAttempt', 'compliance2ndAttempt',
  'lastContactDate', 'rehabDeadline', 'demoFinalCertDate',
  'referredToLISC', 'liscRecommendReceived', 'liscRecommendSale',
]);

/** Boolean-type fields in the property map */
const BOOLEAN_FIELDS = new Set([
  'insuranceReceived', 'occupancyEstablished', 'scopeOfWorkApproved',
  'buildingPermitObtained', 'bondRequired',
]);

/**
 * Convert a portal property object → FM fieldData object.
 * Only includes fields that have values (skips null/undefined).
 */
export function toFM(portalObj, fieldMap = PROPERTY_FIELD_MAP) {
  const fm = {};

  for (const [portalKey, fmKey] of Object.entries(fieldMap)) {
    const value = portalObj[portalKey];
    if (value === undefined) continue;

    if (DATE_FIELDS.has(portalKey)) {
      fm[fmKey] = toFMDate(value);
    } else if (BOOLEAN_FIELDS.has(portalKey)) {
      fm[fmKey] = toFMBoolean(value);
    } else {
      fm[fmKey] = value ?? '';
    }
  }

  return fm;
}

/**
 * Convert an FM record's fieldData → portal object.
 * Reverses the field map and applies type conversions.
 */
export function fromFM(fmFieldData, fieldMap = PROPERTY_FIELD_MAP) {
  // Build reverse map: FM_FieldName → portalKey
  const reverseMap = {};
  for (const [portalKey, fmKey] of Object.entries(fieldMap)) {
    reverseMap[fmKey] = portalKey;
  }

  const portal = {};

  for (const [fmKey, value] of Object.entries(fmFieldData)) {
    const portalKey = reverseMap[fmKey];
    if (!portalKey) continue; // skip unmapped FM fields

    if (DATE_FIELDS.has(portalKey)) {
      portal[portalKey] = fromFMDate(value);
    } else if (BOOLEAN_FIELDS.has(portalKey)) {
      portal[portalKey] = fromFMBoolean(value);
    } else if (portalKey === 'enforcementLevel' || portalKey === 'percentComplete') {
      portal[portalKey] = parseInt(value, 10) || 0;
    } else {
      portal[portalKey] = value || null;
    }
  }

  return portal;
}
