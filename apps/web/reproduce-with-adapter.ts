
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // Load local env first
dotenv.config({ path: ".env" }); // Fallback to root env

async function main() {
    const connectionString = process.env.DATABASE_URL;
    console.log("Connection String:", connectionString?.replace(/:[^:]+@/, ":****@"));

    if (!connectionString) {
        throw new Error("DATABASE_URL missing");
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        console.log("Connected successfully via Adapter!");

        // Try to select just one order to check basic read
        const count = await prisma.order.count();
        console.log("Order count:", count);

        // Try to create a dummy order (simplified to fail fast if column missing)
        // We just want to see if it throws the specific "Column not found" error
        // We won't actually commit this if we error out, but let's try a raw query first
        // actually raw query might bypass the model validation, let's use the model.

        // Let's inspect the model definition prisma thinks it has
        // (Not easy at runtime)

        // Let's try to select the column specifically
        try {
            // We can't select specific columns easily without finding a record?
            // actually findFirst with select
            const order = await prisma.order.findFirst({
                select: {
                    id: true,
                    valuationBasisOther: true
                }
            });
            console.log("Selected order:", order);
        } catch (e: any) {
            console.error("Select failed:", e.message);
        }

    } catch (e: any) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
