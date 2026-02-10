import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/orderService";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await OrderService.getAllOrders();

        // Map orders to declaration format as requested
        const declarations = orders.map((order: any) => ({
            id: order.id,
            sadNumber: `SAD-2026-${order.id.substring(0, 4).toUpperCase()}`,
            importerName: order.user?.fullName || "N/A",
            goodsDescription: order.cargoDescription,
            value: order.sumInsured,
            status: order.status,
            validationStatus: order.validationStatus,
            gateOutStatus: order.status === "ISSUED" ? "APPROVED" : "PENDING",
            transportMode: order.transportMode,
            hsCode: "8517.12.00", // Placeholder as we don't have HS Code in Order yet
            submittedAt: order.createdAt,
        }));

        return NextResponse.json(declarations);
    } catch (error) {
        console.error("Failed to fetch declarations:", error);
        return NextResponse.json(
            { error: "Failed to fetch declarations" },
            { status: 500 }
        );
    }
}
