import { prisma } from "../index";
import { hash } from "bcryptjs";

async function main() {
    const userEmail = "testuser@tiips.com";
    const password = "testuser123";

    console.log(`Hashing password for: ${userEmail}...`);
    const hashedPassword = await hash(password, 12);

    console.log("Creating/Updating test user:", userEmail);

    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            role: "USER",
            password: hashedPassword,
            fullName: "Test User",
        },
        create: {
            email: userEmail,
            role: "USER",
            password: hashedPassword,
            fullName: "Test User",
            phone: "+255123456789",
        },
    });

    console.log("Test user ready:", user);
    console.log(`Login with: ${userEmail} / ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
