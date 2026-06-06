import { PrismaClient } from "@prisma/client";

/**
 * Single PrismaClient instance reused across hot-reloads in dev to avoid
 * exhausting the SQLite connection pool. In production, a fresh instance
 * is created per server boot.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
