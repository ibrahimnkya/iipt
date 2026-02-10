import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/orderService";
import { InvoiceService } from "@/services/invoiceService";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const orders = await OrderService.getAllOrders();

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error("Get all orders error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
