import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = (session.user as any).accessToken;

        const res = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/payments", {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch payments from remote backend");
        }

        const json = await res.json();
        const rawPayments = json.data?.data || json.data || [];

        // Map to frontend expectation
        const formattedPayments = rawPayments.map((p: any) => ({
            id: p.id.toString(),
            amount: parseFloat(p.amount || 0),
            method: p.payment_method || "bank_transfer", // Map payment_method to method
            status: p.status?.toUpperCase() || "SUCCESS",
            createdAt: p.created_at || new Date().toISOString(),
            invoice: {
                id: (p.invoice_id || 1).toString(),
                order: {
                    id: (p.order_id || 1).toString(),
                    cargoDescription: p.order?.description || "General Cargo",
                    currency: p.order?.currency || "USD"
                }
            }
        }));

        return NextResponse.json(formattedPayments);
    } catch (error: any) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
