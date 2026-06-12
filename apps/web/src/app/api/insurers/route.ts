import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // Return seeded remote-compatible insurer details
        const insurers = [
            {
                id: "1",
                fullName: "Test Insurer",
                email: "insurer@marine.test",
                phone: "+255 123 456 789",
                status: "APPROVED",
                logoUrl: null,
                physicalAddress: "Dar es Salaam, Tanzania",
                brelaNumber: "B-123456",
                tinNumber: "100-200-300",
                natureOfBusiness: "Marine Cargo Insurance",
                createdAt: new Date("2026-05-01").toISOString()
            }
        ];

        return NextResponse.json(insurers);
    } catch (error) {
        console.error("Error fetching insurers:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
