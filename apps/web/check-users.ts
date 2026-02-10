
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("Checking users in database...");
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL missing");

    // Log masked connection string
    console.log("Using DB:", connectionString.replace(/:[^:]+@/, ":****@"));

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
            }
        });

        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(e => console.error(e));
