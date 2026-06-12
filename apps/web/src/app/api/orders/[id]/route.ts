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
        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${id}`;
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Order not found" }, { status: res.status });
        }

        const json = await res.json();
        const o = json.data || json;

        // Try getting remote invoice associated with this order
        let orderInvoice: any = null;
        try {
            const invoicesRes = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/invoices", {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (invoicesRes.ok) {
                const invoicesJson = await invoicesRes.json();
                const invoicesList = invoicesJson.data?.data || invoicesJson.data || [];
                orderInvoice = invoicesList.find((inv: any) => inv.order_id === o.id || inv.order?.id === o.id || inv.order_id?.toString() === id.toString());
            }
        } catch (err) {
            console.error("Failed to fetch remote invoices list:", err);
        }

        // Map remote order to local expected structure
        const mappedOrder = {
            id: o.id.toString(),
            status: o.status?.toUpperCase() || "PENDING",
            validationStatus: o.status === "approved" ? "APPROVED" : "HOLD",
            proposerName: o.proposer_name || "Test Customer",
            cargoDescription: o.description || "General Cargo",
            cargoNature: o.nature_of_cargo || "General",
            packagingMethod: o.packaging_method || "Cartons",
            totalWeight: o.total_weight_quantity?.split(" ")[0] || "0",
            weightUnit: o.total_weight_quantity?.split(" ")[1] || "kg",
            originCountry: o.country_of_origin_id === 1 ? "Tanzania" : "Kenya",
            originPort: o.port_of_origin,
            destinationCountry: o.country_of_destination_id === 1 ? "Tanzania" : "Kenya",
            destinationPort: o.port_of_destination,
            transportMode: o.mode_of_transport,
            expectedDispatchDate: o.expected_dispatch_date,
            transShipment: o.transhipment_involved === 1 || o.transhipment_involved === true,
            transShipmentNote: o.transhipment_details,
            vesselName: o.vessel_name,
            carrierName: o.shipping_line_id === 1 ? "Maersk" : o.shipping_line_id === 2 ? "MSC" : "CMA CGM",
            invoiceValue: parseFloat(o.invoice_value || 0),
            currency: "USD",
            valuationBasis: o.basis_of_valuation || "Invoice value",
            sumInsured: parseFloat(o.total_sum_insured || 0),
            storageRequired: o.storage_before_or_after_transit === 1 || o.storage_before_or_after_transit === true,
            storageLocation: o.storage_before_location || o.storage_details,
            storageDuration: o.storage_duration,
            claimsHistory: o.prior_claim === 1 || o.prior_claim === true,
            claimsDetails: o.prior_claim_details,
            acceptTerms: true,
            createdAt: o.created_at || new Date().toISOString(),
            user: {
                id: o.user_id?.toString() || "2",
                email: "customer@marine.test",
                fullName: o.proposer_name || "Test Customer"
            },
            policy: {
                id: (o.policy_id || 1).toString(),
                name: "Marine Cargo Policy",
                rate: 1.5
            },
            invoice: orderInvoice ? {
                id: orderInvoice.id.toString(),
                invoiceNumber: orderInvoice.invoice_number || `INV-${o.id}`,
                amount: parseFloat(orderInvoice.amount || 0),
                status: orderInvoice.status?.toUpperCase() || "PENDING",
                payments: []
            } : null
        };

        return NextResponse.json(mappedOrder);
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
        const token = (session?.user as any)?.accessToken;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        if (!["PENDING", "APPROVED", "ISSUED", "CANCELLED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { id } = await params;
        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${id}/status`;
        
        const res = await fetch(remoteUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                status: status.toLowerCase()
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to update order status" }, { status: res.status });
        }

        return NextResponse.json(data.data || data);
    } catch (error: any) {
        console.error("Update order error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update order" },
            { status: 500 }
        );
    }
}
