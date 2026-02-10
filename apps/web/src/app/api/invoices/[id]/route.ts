import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InvoiceService } from "@/services/invoiceService";

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
        const invoice = await InvoiceService.getInvoiceById(id);

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Check if user owns this invoice (unless admin)
        if (session.user.role !== "ADMIN" && invoice.order.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error("Get invoice error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch invoice" },
            { status: 500 }
        );
    }
}
