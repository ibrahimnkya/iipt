import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@tiips/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch dashboard statistics
        const [totalOrders, paidInvoices, orders] = await Promise.all([
            prisma.order.count(),
            prisma.invoice.aggregate({
                where: { status: "PAID" },
                _sum: {
                    amount: true,
                },
            }),
            prisma.order.findMany({
                select: {
                    transportMode: true,
                    status: true,
                },
            }),
        ]);

        // Calculate cargo statistics by transport mode
        const marineCargo = orders.filter(
            (o) => o.transportMode === "SEA" && o.status !== "CANCELLED"
        ).length;
        const airCargo = orders.filter(
            (o) => o.transportMode === "AIR" && o.status !== "CANCELLED"
        ).length;
        const roadCargo = orders.filter(
            (o) => o.transportMode === "ROAD" && o.status !== "CANCELLED"
        ).length;

        const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

        const stats = {
            totalPremiumPaid: paidInvoices._sum.amount || 0,
            marineCargo,
            airCargo,
            roadCargo,
            totalOrders,
            pendingOrders,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
}
