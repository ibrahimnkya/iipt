
import { PrismaClient } from "@tiips/db";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@tiips.com";
    console.log(`Checking user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    console.log("User found:", user);

    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            role: "ADMIN",
        },
    });

    console.log("User updated to ADMIN and verified:", updatedUser);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
