/**
 * FileMaker Export Utility
 * Generates CSV and JSON exports of compliance data for import into FileMaker
 */

/**
 * Helper function to format date for export
 * @param {string|Date|null} date - ISO date string or Date object
 * @returns {string} Formatted date or empty string
 */
function formatDateForExport(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.split('T')[0]; // ISO format YYYY-MM-DD
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return '';
}

/**
 * Helper function to escape CSV values
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const strValue = String(value);
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
}

/**
 * Helper function to get the most recent communication date
 * @param {Array} communications - Array of communication objects
 * @returns {string|null} Most recent communication date
 */
function getLastCommunicationDate(communications) {
  if (!communications || communications.length === 0) return null;
  const dates = communications
    .filter(comm => comm.date)
    .map(comm => new Date(comm.date))
    .sort((a, b) => b - a);
  if (dates.length === 0) return null;
  return dates[0].toISOString().split('T')[0];
}

/**
 * Generate FileMaker-compatible CSV from properties with compliance timing data.
 * @param {Array} properties - property records
 * @param {Object} timingsMap - map of propertyId → computeComplianceTiming result
 * @returns {string} CSV string
 */
export function generateFileMakerCSV(properties, timingsMap) {
  // CSV Header
  const headers = [
    'parcelId',
    'address',
    'buyerName',
    'buyerEmail',
    'programType',
    'dateSold',
    'enforcementLevel',
    'compliance1stAttempt',
    'compliance2ndAttempt',
    'lastContactDate',
    'currentAction',
    'dueDate',
    'daysOverdue',
    'isDueNow',
    'communicationCount',
    'lastCommunicationDate',
  ];

  const rows = [headers.map(escapeCSV).join(',')];

  // Generate data rows
  properties.forEach(prop => {
    const timing = timingsMap[prop.id] || {};
    const communicationCount = prop.communications ? prop.communications.length : 0;
    const lastCommDate = getLastCommunicationDate(prop.communications);

    const row = [
      escapeCSV(prop.parcelId || ''),
      escapeCSV(prop.address || ''),
      escapeCSV(prop.buyerName || ''),
      escapeCSV(prop.buyerEmail || ''),
      escapeCSV(prop.programType || ''),
      escapeCSV(formatDateForExport(prop.dateSold)),
      escapeCSV(prop.enforcementLevel !== undefined ? prop.enforcementLevel : ''),
      escapeCSV(formatDateForExport(prop.compliance1stAttempt)),
      escapeCSV(formatDateForExport(prop.compliance2ndAttempt)),
      escapeCSV(formatDateForExport(lastCommDate)),
      escapeCSV(timing.currentAction || ''),
      escapeCSV(timing.dueDate || ''),
      escapeCSV(timing.daysOverdue !== undefined ? timing.daysOverdue : ''),
      escapeCSV(timing.isDueNow ? 'YES' : 'NO'),
      escapeCSV(communicationCount),
      escapeCSV(formatDateForExport(lastCommDate)),
    ];

    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Generate FileMaker-compatible JSON from properties with compliance timing data.
 * @param {Array} properties - property records
 * @param {Object} timingsMap - map of propertyId → computeComplianceTiming result
 * @returns {string} JSON string (pretty-printed)
 */
export function generateFileMakerJSON(properties, timingsMap) {
  const records = properties.map(prop => {
    const timing = timingsMap[prop.id] || {};
    const communicationCount = prop.communications ? prop.communications.length : 0;
    const lastCommDate = getLastCommunicationDate(prop.communications);

    return {
      parcelId: prop.parcelId || '',
      address: prop.address || '',
      buyerName: prop.buyerName || '',
      buyerEmail: prop.buyerEmail || '',
      programType: prop.programType || '',
      dateSold: formatDateForExport(prop.dateSold) || null,
      enforcementLevel: prop.enforcementLevel !== undefined ? prop.enforcementLevel : null,
      compliance1stAttempt: formatDateForExport(prop.compliance1stAttempt) || null,
      compliance2ndAttempt: formatDateForExport(prop.compliance2ndAttempt) || null,
      lastContactDate: formatDateForExport(lastCommDate) || null,
      currentAction: timing.currentAction || '',
      dueDate: timing.dueDate || null,
      daysOverdue: timing.daysOverdue !== undefined ? timing.daysOverdue : null,
      isDueNow: timing.isDueNow ? true : false,
      communicationCount: communicationCount,
      lastCommunicationDate: formatDateForExport(lastCommDate) || null,
    };
  });

  return JSON.stringify(records, null, 2);
}

/**
 * Generate communication log CSV from all properties
 * @param {Array} properties - property records
 * @returns {string} CSV string
 */
export function generateCommunicationLogCSV(properties) {
  const headers = [
    'date',
    'propertyAddress',
    'parcelId',
    'buyerName',
    'buyerEmail',
    'type',
    'template',
    'action',
    'status',
    'subject',
  ];

  const rows = [headers.map(escapeCSV).join(',')];

  // Collect all communications across all properties
  properties.forEach(prop => {
    if (prop.communications && prop.communications.length > 0) {
      prop.communications.forEach(comm => {
        const row = [
          escapeCSV(formatDateForExport(comm.date)),
          escapeCSV(prop.address || ''),
          escapeCSV(prop.parcelId || ''),
          escapeCSV(prop.buyerName || ''),
          escapeCSV(prop.buyerEmail || ''),
          escapeCSV(comm.type || ''),
          escapeCSV(comm.template || ''),
          escapeCSV(comm.action || ''),
          escapeCSV(comm.status || ''),
          escapeCSV(comm.subject || ''),
        ];
        rows.push(row.join(','));
      });
    }
  });

  return rows.join('\n');
}

/**
 * Trigger a file download in the browser.
 * @param {string} content - file content
 * @param {string} filename - download filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
