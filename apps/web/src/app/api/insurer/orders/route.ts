import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "INSURER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = session.user.accessToken;

        // Fetch remote insurer dashboard orders
        const res = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/insurer/dashboard/orders", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch insurer orders from remote backend");
        }

        const json = await res.json();
        const rawOrders = json.data?.orders?.data || json.data?.orders || [];

        // Map remote orders to expected local frontend shapes
        const mappedOrders = rawOrders.map((o: any) => ({
            id: o.id.toString(),
            orderNumber: o.sad_number || o.id.toString(),
            status: o.status?.toUpperCase() || "PENDING",
            cifValue: parseFloat(o.invoice_value || 0),
            sumInsured: parseFloat(o.total_sum_insured || 0),
            currency: o.currency || "USD",
            createdAt: o.created_at || new Date().toISOString(),
            policy: {
                id: (o.policy_id || 1).toString(),
                name: o.policy?.name || "Marine Cargo Policy"
            },
            user: {
                fullName: o.user?.name || o.proposer_name || "Test Customer"
            },
            invoice: {
                id: (o.invoice_id || 1).toString(),
                amount: parseFloat(o.total_premium || 0),
                status: o.status === "approved" ? "PAID" : "UNPAID"
            }
        }));

        return NextResponse.json(mappedOrders);
    } catch (error) {
        console.error("Error fetching insurer orders:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
