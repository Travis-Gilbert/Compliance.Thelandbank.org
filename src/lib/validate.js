/**
 * Zod validation wrapper for API routes.
 *
 * Usage:
 *   const data = validateOrReject(schema, req.body, res);
 *   if (!data) return; // 400 already sent
 */

import { z } from 'zod';

/**
 * Validate data against a zod schema.
 * @param {z.ZodSchema} schema
 * @param {unknown} data
 * @returns {{ data: T, error: null } | { data: null, error: string }}
 */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, error: null };
  }

  const messages = result.error.issues.map(
    (i) => `${i.path.join('.')}: ${i.message}`
  );
  return { data: null, error: `Validation failed: ${messages.join('; ')}` };
}

/**
 * Validate and return 400 on failure. Returns parsed data or null.
 * If null is returned, the response has already been sent.
 */
export function validateOrReject(schema, data, res) {
  const { data: parsed, error } = validate(schema, data);
  if (error) {
    res.status(400).json({ error });
    return null;
  }
  return parsed;
}
