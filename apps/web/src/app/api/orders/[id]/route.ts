import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/orderService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const order = await OrderService.getOrderById(id);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user owns this order (unless admin)
        if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Get order error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch order" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        if (!["PENDING", "APPROVED", "ISSUED", "CANCELLED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { id } = await params;
        const order = await OrderService.updateOrderStatus(id, status);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Update order error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update order" },
            { status: 500 }
        );
    }
}
