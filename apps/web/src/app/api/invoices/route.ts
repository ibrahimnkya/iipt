import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InvoiceService } from "@/services/invoiceService";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoices = await InvoiceService.getUserInvoices(session.user.id);

        return NextResponse.json(invoices);
    } catch (error: any) {
        console.error("Get invoices error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch invoices" },
            { status: 500 }
        );
    }
}
