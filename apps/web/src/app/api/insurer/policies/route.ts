import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "INSURER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const policies = await prisma.insurancePolicy.findMany({
            where: {
                insurerId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        return NextResponse.json(policies);
    } catch (error) {
        console.error("Error fetching insurer policies:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
