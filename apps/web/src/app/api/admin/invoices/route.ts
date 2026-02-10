import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InvoiceService } from "@/services/invoiceService";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const invoices = await InvoiceService.getAllInvoices();

        return NextResponse.json(invoices);
    } catch (error: any) {
        console.error("Get all invoices error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch invoices" },
            { status: 500 }
        );
    }
}
