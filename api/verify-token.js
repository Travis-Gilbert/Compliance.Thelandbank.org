/**
 * GET /api/verify-token?token=xxx
 *
 * Called by the buyer's browser when /submit?token=xxx loads.
 * Validates the token and returns property + buyer data for form pre-fill.
 */

import prisma from '../src/lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token parameter is required' });
    }

    // Look up token with property and buyer data
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      include: {
        property: {
          select: {
            id: true,
            parcelId: true,
            address: true,
            programType: true,
            dateSold: true,
          },
        },
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Token doesn't exist
    if (!accessToken) {
      return res.status(404).json({ valid: false, error: 'Invalid access link' });
    }

    // Token has been revoked
    if (accessToken.revokedAt) {
      return res.status(403).json({ valid: false, error: 'This access link has been revoked' });
    }

    // Token has expired
    if (new Date() > accessToken.expiresAt) {
      return res.status(403).json({ valid: false, error: 'This access link has expired' });
    }

    // Token is valid — return pre-fill data
    return res.status(200).json({
      valid: true,
      property: {
        id: accessToken.property.id,
        parcelId: accessToken.property.parcelId,
        address: accessToken.property.address,
        programType: accessToken.property.programType,
        dateSold: accessToken.property.dateSold
          ? accessToken.property.dateSold.toISOString().slice(0, 10)
          : null,
      },
      buyer: {
        firstName: accessToken.buyer.firstName,
        lastName: accessToken.buyer.lastName,
        email: accessToken.buyer.email || '',
      },
      tokenId: accessToken.id,
    });
  } catch (error) {
    console.error('GET /api/verify-token error:', error);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}
