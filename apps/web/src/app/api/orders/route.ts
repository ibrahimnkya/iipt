import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/orderService";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await OrderService.getUserOrders(session.user.id);

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error("Get orders error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            console.log("POST /api/orders - Unauthorized: No session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("POST /api/orders - Request Body:", JSON.stringify(body, null, 2));

        // Basic validation logging
        if (!body.policyId) console.log("Missing policyId");
        if (!body.userId && !session.user.id) console.log("Missing userId");

        const result = await OrderService.createOrder({
            ...body,
            userId: session.user.id,
            invoiceValue: typeof body.invoiceValue === 'string' ? parseFloat(body.invoiceValue) : body.invoiceValue,
            sumInsured: typeof body.sumInsured === 'string' ? parseFloat(body.sumInsured) : body.sumInsured,
            dispatchDate: new Date(body.dispatchDate),
            declarationDate: new Date(body.declarationDate || new Date()),
        });

        console.log("Order created successfully:", result.order.id);
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error("Create order error full object:", error);
        console.error("Create order error message:", error.message);
        console.error("Create order error stack:", error.stack);
        if (error.code) console.error("Prisma Error Code:", error.code);
        if (error.meta) console.error("Prisma Error Meta:", error.meta);

        return NextResponse.json(
            {
                error: error.message || "Failed to create order",
                details: error.meta || error.code || "No additional details"
            },
            { status: 500 }
        );
    }
}
