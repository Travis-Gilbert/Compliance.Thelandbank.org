/**
 * POST /api/submissions — buyer compliance submission.
 *
 * Accepts the form data from BuyerSubmission.jsx:
 *   { propertyId, parcelId, buyerEmail, type, formData, documents }
 *
 * Creates a Submission record and optional Document metadata records.
 * Returns confirmation ID for the buyer.
 */

import prisma from '../src/lib/db.js';
import { isConfigured, withSession, findRecords, createRecord } from '../src/lib/filemakerClient.js';
import {
  toFM,
  PROPERTY_FIELD_MAP,
  BUYER_FIELD_MAP,
  SUBMISSION_FIELD_MAP,
  joinNameForFM,
  getLayouts,
} from '../src/config/filemakerFieldMap.js';
import { rateLimiters, applyRateLimit } from '../src/lib/rateLimit.js';
import { cors } from './_cors.js';
import { validateOrReject } from '../src/lib/validate.js';
import { submissionBody } from '../src/lib/schemas.js';
import { withSentry } from '../src/lib/sentry.js';
import { log } from '../src/lib/logger.js';

export default withSentry(async function handler(req, res) {
  if (cors(req, res, { methods: 'GET, POST, OPTIONS' })) return;

  /* ── GET — list submissions (admin) ──────────────────── */
  if (req.method === 'GET') {
    try {
      const { propertyId, status } = req.query;
      const where = {};
      if (propertyId) where.propertyId = propertyId;
      if (status) where.status = status;

      const submissions = await prisma.submission.findMany({
        where,
        include: {
          property: { select: { address: true, parcelId: true, programType: true } },
          buyer: { select: { firstName: true, lastName: true, email: true } },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return res.status(200).json(submissions);
    } catch (error) {
      log.error('submissions_list_failed', { error: error.message });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /* ── POST — new buyer submission ─────────────────────── */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!(await applyRateLimit(rateLimiters.submission, req, res))) return;

  try {
    const data = validateOrReject(submissionBody, req.body, res);
    if (!data) return;
    const { parcelId, type, formData, documents } = data;

    // Look up property by parcelId
    const property = await prisma.property.findUnique({
      where: { parcelId },
      include: { buyer: true },
    });

    if (!property) {
      return res.status(404).json({ error: `No property found for parcel ${parcelId}` });
    }

    // Create submission + document records in a transaction
    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          type,
          formData,
          status: 'received',
          propertyId: property.id,
          buyerId: property.buyerId,
        },
      });

      // Create document records with optional blob URLs
      if (documents.length > 0) {
        await tx.document.createMany({
          data: documents.map((doc) => ({
            filename: doc.filename,
            mimeType: doc.mimeType || 'application/octet-stream',
            sizeBytes: doc.sizeBytes || 0,
            category: doc.category || 'document',
            slot: doc.slot || null,
            blobUrl: doc.blobUrl || null,
            submissionId: sub.id,
            propertyId: property.id,
          })),
        });
      }

      return sub;
    });

    log.info('submission_created', { confirmationId: submission.confirmationId, parcelId });

    // Fire-and-forget: push to FileMaker if configured
    if (isConfigured()) {
      pushToFileMaker(submission.id, parcelId, property).catch((err) => {
        log.warn('fm_push_failed', { submissionId: submission.id, error: err.message });
      });
    }

    return res.status(201).json({
      success: true,
      confirmationId: submission.confirmationId,
      submissionId: submission.id,
      timestamp: submission.createdAt.toISOString(),
      fmSync: isConfigured() ? 'queued' : 'not_configured',
    });
  } catch (error) {
    log.error('submission_create_failed', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/* ── Fire-and-forget FM push ────────────────────────────── */

async function pushToFileMaker(submissionId, parcelId, property) {
  const layouts = getLayouts();

  await withSession(async (token) => {
    // Build submission fields using the field maps — no hardcoded FM names
    const submissionFields = toFM({
      type: 'progress',
      status: 'received',
      confirmationId: submissionId,
      createdAt: new Date(),
    }, SUBMISSION_FIELD_MAP);

    // Add parcel context
    submissionFields[PROPERTY_FIELD_MAP.parcelId] = parcelId;

    // Add buyer context via toFM() — automatically skips TBD fields
    const buyerFields = toFM({
      email: property.buyer?.email || '',
      fullName: joinNameForFM(
        property.buyer?.firstName,
        property.buyer?.lastName,
      ),
    }, BUYER_FIELD_MAP);
    Object.assign(submissionFields, buyerFields);

    await createRecord(token, layouts.submissions, submissionFields);
    log.info('fm_push_submission_synced', { submissionId });
  });
}
