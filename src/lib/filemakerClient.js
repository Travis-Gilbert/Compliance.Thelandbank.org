/**
 * FileMaker Data API client for Vercel serverless functions.
 *
 * Handles session-token auth, request formatting, and FM-specific
 * error codes. Each function invocation logs in fresh (stateless)
 * since Vercel has no persistent memory between requests.
 *
 * Env vars required:
 *   FM_SERVER_URL  — base URL (e.g. https://fm.example.com or Cloudflare Tunnel URL)
 *   FM_DATABASE    — FileMaker database name
 *   FM_USERNAME    — Data API account username
 *   FM_PASSWORD    — Data API account password
 */

const FM_API_VERSION = 'v1';

function getConfig() {
  const server = process.env.FM_SERVER_URL;
  const database = process.env.FM_DATABASE;
  const username = process.env.FM_USERNAME;
  const password = process.env.FM_PASSWORD;

  if (!server || !database || !username || !password) {
    return null;
  }

  // Strip trailing slash from server URL
  const baseUrl = `${server.replace(/\/+$/, '')}/fmi/data/${FM_API_VERSION}/databases/${encodeURIComponent(database)}`;

  return { server, database, username, password, baseUrl };
}

/** Check whether FM env vars are configured */
export function isConfigured() {
  return getConfig() !== null;
}

/* ── Session management ─────────────────────────────────── */

/**
 * Login to FileMaker Data API and receive a session token.
 * Token is valid for 15 minutes after last use.
 */
export async function login() {
  const config = getConfig();
  if (!config) throw new Error('FileMaker not configured — missing FM_* env vars');

  const res = await fetch(`${config.baseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FM login failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.response.token;
}

/** Logout / release session token */
export async function logout(token) {
  const config = getConfig();
  if (!config || !token) return;

  try {
    await fetch(`${config.baseUrl}/sessions/${token}`, {
      method: 'DELETE',
    });
  } catch {
    // Best-effort — don't throw on logout failure
  }
}

/* ── Core request helper ────────────────────────────────── */

/**
 * Make an authenticated request to the FM Data API.
 *
 * @param {string} token   — session token from login()
 * @param {string} method  — HTTP method
 * @param {string} path    — path after /databases/{db}/ (e.g. "layouts/MyLayout/records")
 * @param {object} [body]  — request body (will be JSON-serialized)
 * @returns {object}       — parsed response.response object
 */
async function fmRequest(token, method, path, body = null) {
  const config = getConfig();
  if (!config) throw new Error('FileMaker not configured');

  const url = `${config.baseUrl}/${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  // FM error codes: "0" = OK, anything else = error
  const code = data.messages?.[0]?.code;
  if (code && code !== '0') {
    const msg = data.messages[0].message;
    const err = new Error(`FileMaker error ${code}: ${msg}`);
    err.fmCode = code;
    err.fmMessage = msg;
    throw err;
  }

  return data.response;
}

/* ── CRUD operations ────────────────────────────────────── */

/**
 * Get all records from a layout (paginated).
 *
 * @param {string} token
 * @param {string} layout — FM layout name
 * @param {object} [opts] — { limit, offset, sort }
 */
export async function getRecords(token, layout, opts = {}) {
  const params = new URLSearchParams();
  if (opts.limit) params.set('_limit', opts.limit);
  if (opts.offset) params.set('_offset', opts.offset);
  if (opts.sort) {
    params.set('_sort', JSON.stringify(
      Array.isArray(opts.sort) ? opts.sort : [opts.sort]
    ));
  }

  const qs = params.toString();
  const path = `layouts/${encodeURIComponent(layout)}/records${qs ? `?${qs}` : ''}`;
  return fmRequest(token, 'GET', path);
}

/**
 * Get a single record by FM recordId.
 */
export async function getRecord(token, layout, recordId) {
  const path = `layouts/${encodeURIComponent(layout)}/records/${recordId}`;
  return fmRequest(token, 'GET', path);
}

/**
 * Find records matching a query.
 *
 * @param {string} token
 * @param {string} layout
 * @param {Array<object>} query — FM find criteria, e.g. [{ ParcelID: "41-06-..." }]
 * @param {object} [opts]       — { sort, limit, offset }
 */
export async function findRecords(token, layout, query, opts = {}) {
  const body = { query };
  if (opts.sort) body.sort = Array.isArray(opts.sort) ? opts.sort : [opts.sort];
  if (opts.limit) body.limit = String(opts.limit);
  if (opts.offset) body.offset = String(opts.offset);

  const path = `layouts/${encodeURIComponent(layout)}/_find`;
  return fmRequest(token, 'POST', path, body);
}

/**
 * Create a new record.
 *
 * @param {string} token
 * @param {string} layout
 * @param {object} fieldData — FM field names → values
 * @returns {{ recordId: string, modId: string }}
 */
export async function createRecord(token, layout, fieldData) {
  const path = `layouts/${encodeURIComponent(layout)}/records`;
  return fmRequest(token, 'POST', path, { fieldData });
}

/**
 * Update an existing record.
 *
 * @param {string} token
 * @param {string} layout
 * @param {string} recordId — FM internal record ID
 * @param {object} fieldData — only fields to update
 */
export async function updateRecord(token, layout, recordId, fieldData) {
  const path = `layouts/${encodeURIComponent(layout)}/records/${recordId}`;
  return fmRequest(token, 'PATCH', path, { fieldData });
}

/**
 * Delete a record.
 */
export async function deleteRecord(token, layout, recordId) {
  const path = `layouts/${encodeURIComponent(layout)}/records/${recordId}`;
  return fmRequest(token, 'DELETE', path);
}

/* ── Container field upload ─────────────────────────────── */

/**
 * Upload a file to a container field.
 *
 * @param {string} token
 * @param {string} layout
 * @param {string} recordId
 * @param {string} fieldName — container field name
 * @param {Buffer|Blob} fileData
 * @param {string} filename
 */
export async function uploadToContainer(token, layout, recordId, fieldName, fileData, filename) {
  const config = getConfig();
  if (!config) throw new Error('FileMaker not configured');

  const url = `${config.baseUrl}/layouts/${encodeURIComponent(layout)}/records/${recordId}/containers/${encodeURIComponent(fieldName)}/1`;

  // Build multipart form
  const formData = new FormData();
  const blob = fileData instanceof Blob ? fileData : new Blob([fileData]);
  formData.append('upload', blob, filename);

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FM container upload failed (${res.status}): ${text}`);
  }

  return res.json();
}

/* ── Layout metadata ────────────────────────────────────── */

/**
 * Get field metadata for a layout (useful for mapping validation).
 */
export async function getLayoutMetadata(token, layout) {
  const path = `layouts/${encodeURIComponent(layout)}`;
  return fmRequest(token, 'GET', path);
}

/* ── Convenience: session-scoped operation ──────────────── */

/**
 * Run a callback with an auto-managed FM session.
 * Logs in, passes the token, logs out when done.
 *
 * @param {(token: string) => Promise<T>} callback
 * @returns {Promise<T>}
 *
 * @example
 *   const records = await withSession(async (token) => {
 *     return getRecords(token, 'Properties', { limit: 100 });
 *   });
 */
export async function withSession(callback) {
  const token = await login();
  try {
    return await callback(token);
  } finally {
    await logout(token);
  }
}
