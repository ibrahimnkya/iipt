export * from "@prisma/client";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (globalForPrisma.prisma) {
    // console.log("⚠️ Reusing existing Prisma Client from global scope");
} else {
    console.log("✅ Creating NEW Prisma Client instance (Standard)");
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
