
// import { OrderService } from "./src/services/orderService.ts";
import { prisma } from "@tiips/db";

async function main() {
    console.log("Starting reproduction script...");

    // const userId = "224c3208-8780-4ce5-9779-9366e9ee7589";
    // const policyId = "1283e7a9-9988-4e6e-8d01-9c45e015efda"; // ICC A

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found in database");
        return;
    }
    const userId = user.id;
    console.log("Using user:", user.email);

    const policy = await prisma.insurancePolicy.findFirst({ where: { isActive: true } });
    if (!policy) {
        console.error("No active policy found");
        return;
    }
    const policyId = policy.id;
    console.log("Using policy:", policy.name);

    try {
        console.log("Attempting to create order...");

        const order = await prisma.order.create({
            data: {
                userId,
                policyId,
                status: "PENDING",
                incoterm: "CIF",
                cargoDescription: "Test Cargo",
                cargoNature: "General",
                packagingMethod: "Container",
                weightUnit: "KG",
                totalWeight: "1000",
                originPort: "TZDAR",
                destinationPort: "TZZNZ",
                originCountry: "Tanzania",
                destinationCountry: "Zanzibar",
                transportMode: "Sea",
                dispatchDate: new Date(),
                transShipment: false,
                invoiceValue: 10000,
                currency: "USD",
                valuationBasis: "CIF",
                sumInsured: 11000,
                storageRequired: false,
                claimsHistory: false,
                proposerName: "Test User",
                proposerCapacity: "Owner",
                coverType: "ICC(A)",
                declarationDate: new Date(),
                acceptTerms: true,
                // Optional fields explicitly null or undefined if needed
                proposerCapacityOther: null,
                additionalCovers: null,
                incotermOther: null,
                packagingMethodOther: null,
                transShipmentNote: null,
                vesselName: "Test Vessel",
                carrierName: "Test Carrier",
                valuationBasisOther: null,
                storageLocation: null,
                storageDuration: null,
                claimsDetails: null,
            },
        });
        console.log("Order created successfully:", order.id);

        // Calculate invoice
        const policyRate = 0.5; // Dummy rate
        const premium = 11000 * (policyRate / 100);
        const tiraLevy = premium * 0.01;
        const stampDuty = 2000;
        const total = premium + tiraLevy + stampDuty;

        const invoice = await prisma.invoice.create({
            data: {
                orderId: order.id,
                amount: total,
                status: "UNPAID",
            },
        });
        console.log("Invoice created successfully:", invoice.id);

    } catch (error: any) {
        console.error("Error creating order:", error);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error meta:", error.meta);
        if (error.cause) console.error("Error cause:", error.cause);
    } finally {
        await prisma.$disconnect();
    }
}

main();
