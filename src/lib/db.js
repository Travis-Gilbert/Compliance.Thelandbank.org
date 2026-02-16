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

// Always cache on globalThis. In serverless, this survives warm invocations
// and prevents exhausting the Neon connection pool on cold starts.
// In development, Vite's HMR re-imports modules but globalThis persists.
globalForPrisma.prisma = prisma;

export default prisma;
