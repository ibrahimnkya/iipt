import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const token = (session?.user as any)?.accessToken;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/invoices/${id}`;
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Invoice not found" }, { status: res.status });
        }

        const json = await res.json();
        const inv = json.data || json;

        // Fetch full order details to populate policy, currency, ports, etc.
        let orderDetails = inv.order || {};
        if (inv.order_id) {
            try {
                const orderRes = await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${inv.order_id}`, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (orderRes.ok) {
                    const orderJson = await orderRes.json();
                    orderDetails = orderJson.data || orderJson;
                }
            } catch (err) {
                console.error("Failed to fetch full order details for invoice:", err);
            }
        }

        // Map remote invoice structure to local
        const mappedInvoice = {
            id: inv.id.toString(),
            orderId: (inv.order_id || 1).toString(),
            invoiceNumber: inv.invoice_number,
            amount: parseFloat(inv.amount || 0),
            status: inv.status?.toUpperCase() || "PENDING",
            createdAt: inv.created_at || new Date().toISOString(),
            issuedAt: inv.created_at || new Date().toISOString(),
            paidAt: inv.status?.toUpperCase() === "PAID" ? (inv.updated_at || new Date().toISOString()) : null,
            order: {
                id: (inv.order_id || 1).toString(),
                status: orderDetails.status?.toUpperCase() || "PENDING",
                proposerName: orderDetails.proposer_name || "Customer",
                cargoDescription: orderDetails.description || "Cargo",
                cargoNature: orderDetails.nature_of_cargo || "General",
                originPort: orderDetails.port_of_origin || "Dar es Salaam",
                destinationPort: orderDetails.port_of_destination || "Zanzibar",
                vesselName: orderDetails.vessel_name || "",
                sumInsured: parseFloat(orderDetails.total_sum_insured || 0),
                currency: "USD",
                policy: {
                    name: "Marine Cargo Policy",
                    clauseType: orderDetails.policy_id === 1 ? "Class A" : orderDetails.policy_id === 2 ? "Class B" : "Class C",
                    insurer: {
                        id: "1",
                        fullName: "Test Insurer",
                        companyName: "Phoenix Assurance",
                        logoUrl: "/logo.svg",
                        email: "insurer@marine.test",
                        phone: "+255 123 456 789",
                        physicalAddress: "Dar es Salaam, Tanzania",
                        postalAddress: "P.O. Box 123, Dar es Salaam"
                    }
                }
            },
            payments: inv.payments || []
        };

        return NextResponse.json(mappedInvoice);
    } catch (error: any) {
        console.error("Get invoice error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch invoice" },
            { status: 500 }
        );
    }
}
