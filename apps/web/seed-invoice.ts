
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding for Payment Test...");

    const email = "testuser123@tiip.co.tz";
    const password = "password";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword // Ensure password is correct
        },
        create: {
            email,
            fullName: "Test User",
            password: hashedPassword,
            role: "USER",
            phone: "0712345678"
        }
    });

    console.log(`👤 User: ${user.email} (${user.id})`);

    // Create Policy
    const polCode = `POL-${Date.now()}`;
    const policy = await prisma.insurancePolicy.create({
        data: {
            name: "Open Cover Policy",
            code: polCode,
            clauseType: "A",
            userId: user.id
        }
    });

    // Create Order
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            policyId: policy.id,
            cargoDescription: "Test Electronics",
            totalWeight: "500",
            incoterm: "CIF",
            cargoNature: "Electronics",
            packagingMethod: "Box",
            transportMode: "SEA",
            dispatchDate: new Date(),
            originPort: "Shanghai",
            destinationPort: "Dar es Salaam",
            invoiceValue: 10000,
            currency: "USD",
            valuationBasis: "CIF",
            sumInsured: 11000,
            status: "APPROVED"
        }
    });

    // Create Invoice (UNPAID)
    const invoice = await prisma.invoice.create({
        data: {
            orderId: order.id,
            amount: 150,
            status: "UNPAID",
            issuedAt: new Date()
        }
    });

    console.log(`📄 Invoice Created: ${invoice.id} (UNPAID)`);
    console.log(`💰 Amount: ${invoice.amount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
