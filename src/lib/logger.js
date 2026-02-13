/**
 * Structured logging for serverless functions.
 * Outputs JSON lines that can be filtered in Vercel logs.
 *
 * Usage:
 *   import { log } from '../src/lib/logger.js';
 *
 *   log.info('fm_sync_complete', { records: 42, mode: 'delta' });
 *   log.warn('fm_session_expired', { retrying: true });
 *   log.error('fm_sync_failed', { error: err.message });
 *   log.debug('fm_field_mapping', { field: 'ParcelID', value: '4635457003' });
 */

function createEntry(level, event, data = {}) {
  return JSON.stringify({
    level,
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export const log = {
  info: (event, data) => console.log(createEntry('info', event, data)),
  warn: (event, data) => console.warn(createEntry('warn', event, data)),
  error: (event, data) => console.error(createEntry('error', event, data)),
  debug: (event, data) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(createEntry('debug', event, data));
    }
  },
};
