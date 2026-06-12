import "dotenv/config";
import { prisma } from "@tiips/db";


async function main() {
    console.log("Testing Port query...");
    try {
        const ports = await prisma.port.findMany({
            take: 5,
        });
        console.log("Ports found:", ports);
    } catch (error) {
        console.error("Error fetching ports:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
