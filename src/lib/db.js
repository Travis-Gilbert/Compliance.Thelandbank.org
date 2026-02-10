/**
 * Prisma Client singleton for Vercel serverless functions.
 *
 * In serverless environments each invocation may create a new module scope,
 * so we cache the client on `globalThis` to avoid exhausting connections.
 * Neon's connection pooler (pgbouncer) handles the rest.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/** @type {PrismaClient} */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
