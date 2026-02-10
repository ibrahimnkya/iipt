export * from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}
const connectionString = process.env.DATABASE_URL;
console.log("DB Connection String:", connectionString.replace(/:[^:]+@/, ":****@")); // Mask password for safety

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (globalForPrisma.prisma) {
    console.log("⚠️ Reusing existing Prisma Client from global scope (Connection might be stale)");
} else {
    console.log("✅ Creating NEW Prisma Client instance");
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
