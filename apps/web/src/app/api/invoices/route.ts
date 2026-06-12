import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const token = (session?.user as any)?.accessToken;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const remoteUrl = "https://marineinsuranceapi.akiliapp.co.tz/api/v1/invoices";
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch invoices from remote backend");
        }

        const json = await res.json();
        const rawInvoices = json.data?.data || json.data || [];

        const mappedInvoices = rawInvoices.map((inv: any) => ({
            id: inv.id.toString(),
            orderId: (inv.order_id || 1).toString(),
            invoiceNumber: inv.invoice_number,
            amount: parseFloat(inv.amount || 0),
            status: inv.status?.toUpperCase() || "PENDING",
            createdAt: inv.created_at || new Date().toISOString(),
            order: {
                id: (inv.order_id || 1).toString(),
                status: inv.order?.status?.toUpperCase() || "PENDING",
                proposerName: inv.order?.proposer_name || "Customer",
                cargoDescription: inv.order?.description || "Cargo"
            }
        }));

        return NextResponse.json(mappedInvoices);
    } catch (error: any) {
        console.error("Get invoices error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch invoices" },
            { status: 500 }
        );
    }
}
