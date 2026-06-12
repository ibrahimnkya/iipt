import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Return remote-compatible seeded user list
        const users = [
            {
                id: "1",
                email: "admin@marine.test",
                fullName: "System Admin",
                role: "ADMIN",
                phone: "+255 111 222 333",
                physicalAddress: "Dar es Salaam, Tanzania",
                createdAt: new Date("2026-05-01").toISOString()
            },
            {
                id: "2",
                email: "customer@marine.test",
                fullName: "Test Customer",
                role: "USER",
                phone: "+255 444 555 666",
                physicalAddress: "Dar es Salaam, Tanzania",
                createdAt: new Date("2026-05-01").toISOString()
            },
            {
                id: "4",
                email: "insurer@marine.test",
                fullName: "Test Insurer",
                role: "INSURER",
                phone: "+255 777 888 999",
                physicalAddress: "Dar es Salaam, Tanzania",
                createdAt: new Date("2026-05-01").toISOString()
            },
            {
                id: "3",
                email: "tira@marine.test",
                fullName: "TIRA Officer",
                role: "TIRA",
                phone: "+255 123 456 789",
                physicalAddress: "Dar es Salaam, Tanzania",
                createdAt: new Date("2026-05-01").toISOString()
            }
        ];

        return NextResponse.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
