import { PrismaClient } from '@prisma/client';

// This ensures that in development, where hot-reloading might re-run this file,
// you don't create new connections on every reload.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;