/**
 * /api/access-tokens — manage buyer submission access tokens.
 *
 * POST   — create a token for a property (admin)
 * GET    — list tokens, optional ?propertyId= filter
 * DELETE — revoke a token (soft delete via revokedAt)
 */

import prisma from '../src/lib/db.js';
import { generateToken, defaultExpiration } from '../src/lib/tokenGenerator.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    /* ── GET — list tokens ──────────────────────────────── */
    if (req.method === 'GET') {
      const { propertyId } = req.query;
      const where = {};
      if (propertyId) where.propertyId = propertyId;

      const tokens = await prisma.accessToken.findMany({
        where,
        include: {
          property: { select: { address: true, parcelId: true, programType: true } },
          buyer: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return res.status(200).json(tokens);
    }

    /* ── POST — create a new token ──────────────────────── */
    if (req.method === 'POST') {
      const { propertyId, expirationDays = 30 } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: 'propertyId is required' });
      }

      // Look up property to get buyerId
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, buyerId: true, address: true },
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const token = generateToken(10);
      const expiresAt = defaultExpiration(expirationDays);

      const accessToken = await prisma.accessToken.create({
        data: {
          token,
          propertyId: property.id,
          buyerId: property.buyerId,
          expiresAt,
        },
      });

      // Build the full submission URL
      const appUrl = process.env.APP_URL
        || `https://${req.headers.host}`;
      const url = `${appUrl}/submit?token=${token}`;

      return res.status(201).json({
        id: accessToken.id,
        token: accessToken.token,
        url,
        propertyId: accessToken.propertyId,
        buyerId: accessToken.buyerId,
        expiresAt: accessToken.expiresAt.toISOString(),
        createdAt: accessToken.createdAt.toISOString(),
      });
    }

    /* ── DELETE — revoke a token ────────────────────────── */
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'id query parameter is required' });
      }

      const accessToken = await prisma.accessToken.update({
        where: { id },
        data: { revokedAt: new Date() },
      });

      return res.status(200).json({ success: true, id: accessToken.id, revokedAt: accessToken.revokedAt });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('/api/access-tokens error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
