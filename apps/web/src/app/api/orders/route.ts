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

        const remoteUrl = "https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders";
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch orders from remote backend");
        }

        const json = await res.json();
        const rawOrders = json.data?.data || json.data || [];

        // Map remote orders to expected local frontend shapes
        const mappedOrders = rawOrders.map((o: any) => ({
            id: o.id.toString(),
            status: o.status?.toUpperCase() || "PENDING",
            validationStatus: o.status === "approved" ? "APPROVED" : "HOLD",
            proposerName: o.proposer_name || "Test Customer",
            cargoDescription: o.description || "General Cargo",
            invoiceValue: parseFloat(o.invoice_value || 0),
            sumInsured: parseFloat(o.total_sum_insured || 0),
            createdAt: o.created_at || new Date().toISOString(),
            policy: {
                id: (o.policy_id || 1).toString(),
                name: "Marine Cargo Policy"
            },
            invoice: o.invoice_id ? {
                id: o.invoice_id.toString(),
                amount: parseFloat(o.total_premium || 0),
                status: "PENDING"
            } : null
        }));

        return NextResponse.json(mappedOrders);
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
        const token = (session?.user as any)?.accessToken;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // 1. Create Draft Order
        const createRes = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!createRes.ok) {
            let errMsg = "Failed to create draft order on remote backend";
            try {
                const errJson = await createRes.json();
                errMsg = errJson.message || errMsg;
            } catch (e) {
                try {
                    const errText = await createRes.text();
                    errMsg = errText.substring(0, 100) || createRes.statusText || errMsg;
                } catch (_) {}
            }
            throw new Error(errMsg);
        }

        const createJson = await createRes.json();
        const orderId = createJson.data.id;

        // 2. Step 1 — Insurable interest
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/1`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                capacity: body.proposerCapacity || "Owner",
                capacity_other: body.proposerCapacityOther || null,
                business_of_sales: body.incoterm || "CIF",
                business_of_sales_other: body.incotermOther || null
            })
        });

        // 3. Step 2 — Cargo details
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/2`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nature_of_cargo: body.cargoNature || "General",
                packaging_method: body.packagingMethod || "Cartons",
                packaging_method_other: body.packagingMethodOther || null,
                total_weight_quantity: `${body.totalWeight || '0'} ${body.weightUnit || 'kg'}`,
                description: body.cargoDescription || "General Cargo"
            })
        });

        // 4. Step 3 — Voyage details
        const originCountryId = body.originCountry?.toLowerCase().includes("kenya") ? 2 : 1;
        const destCountryId = body.destinationCountry?.toLowerCase().includes("kenya") ? 2 : 1;
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/3`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                country_of_origin_id: originCountryId,
                port_of_origin: body.originPort || "Port of Dar es Salaam",
                country_of_destination_id: destCountryId,
                port_of_destination: body.destinationPort || "Port of Dar es Salaam",
                mode_of_transport: body.transportMode || "Sea",
                mode_of_transport_other: null,
                expected_dispatch_date: (body.dispatchDate || body.expectedDispatchDate || "2026-06-15").split("T")[0],
                transhipment_involved: body.transShipment || false,
                transhipment_details: body.transShipmentNote || null
            })
        });

        // 5. Step 4 — Conveyance
        const carrier = body.carrierName?.toLowerCase() || "";
        let shippingLineId = 1;
        if (carrier.includes("msc")) shippingLineId = 2;
        else if (carrier.includes("cma")) shippingLineId = 3;

        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/4`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                vessel_name: body.vesselName || "MV Kilimanjaro",
                shipping_line_id: shippingLineId
            })
        });

        // 6. Step 5 — Insurance & valuation
        let remotePolicyId = 1;
        if (body.policyId) {
            const parsedId = parseInt(body.policyId, 10);
            if (!isNaN(parsedId)) remotePolicyId = parsedId;
        }
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/5`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                insurer_company_id: parseInt(body.insurerCompanyId || body.insurer_company_id || "1", 10),
                policy_id: remotePolicyId,
                invoice_value: body.invoiceValue || 100000,
                currency_id: 1,
                basis_of_valuation: body.valuationBasis || "Invoice value",
                total_sum_insured: body.sumInsured || 110000,
                additional_cover: body.additionalCovers || null
            })
        });

        // 7. Step 6 — Additional info
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/6`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                storage_details: body.storageLocation || null,
                storage_before_or_after_transit: body.storageRequired || false,
                storage_before_location: body.storageLocation || null,
                storage_after_location: null,
                storage_duration: body.storageDuration || null,
                prior_claim: body.claimsHistory || false,
                prior_claim_details: body.claimsDetails || null
            })
        });

        // 8. Step 7 — Review
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/7`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                confirmed: true
            })
        });

        // 9. Step 8 — Declaration
        await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/steps/8`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                proposer_name: body.proposerName || "Test Customer",
                declaration_date: body.declarationDate ? body.declarationDate.split("T")[0] : "2026-05-25",
                signature_acknowledged: 1
            })
        });

        // 10. Submit Order
        const submitRes = await fetch(`https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders/${orderId}/submit`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!submitRes.ok) {
            let errMsg = "Failed to finalize remote order draft";
            try {
                const errJson = await submitRes.json();
                errMsg = errJson.message || errMsg;
            } catch (e) {
                try {
                    const errText = await submitRes.text();
                    errMsg = errText.substring(0, 100) || submitRes.statusText || errMsg;
                } catch (_) {}
            }
            throw new Error(errMsg);
        }

        const submitJson = await submitRes.json();
        const finalOrder = submitJson.data || submitJson;

        // Try getting remote invoice
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
                orderInvoice = invoicesList.find((inv: any) => inv.order_id === orderId || inv.order?.id === orderId);
            }
        } catch (err) {
            console.error("Failed to fetch remote invoices list:", err);
        }

        const mappedOrder = {
            id: finalOrder.id.toString(),
            status: finalOrder.status?.toUpperCase() || "PENDING",
            validationStatus: finalOrder.status === "approved" ? "APPROVED" : "HOLD",
            proposerName: finalOrder.proposer_name,
            cargoDescription: finalOrder.description,
            invoiceValue: parseFloat(finalOrder.invoice_value || 0),
            sumInsured: parseFloat(finalOrder.total_sum_insured || 0),
            createdAt: finalOrder.created_at || new Date().toISOString(),
            policy: {
                id: remotePolicyId.toString(),
                name: "Marine Cargo Policy",
                rate: 1.5
            }
        };

        const mappedInvoice = orderInvoice ? {
            id: orderInvoice.id.toString(),
            orderId: orderId.toString(),
            invoiceNumber: orderInvoice.invoice_number,
            amount: parseFloat(orderInvoice.amount || 0),
            status: orderInvoice.status?.toUpperCase() || "PENDING",
            createdAt: orderInvoice.created_at
        } : {
            id: "temp-inv-id",
            orderId: orderId.toString(),
            invoiceNumber: `INV-${orderId}`,
            amount: (body.sumInsured || 110000) * 0.015,
            status: "PENDING",
            createdAt: new Date().toISOString()
        };

        return NextResponse.json({
            order: mappedOrder,
            invoice: mappedInvoice,
            calculation: {
                premium: mappedInvoice.amount,
                vat: mappedInvoice.amount * 0.18,
                total: mappedInvoice.amount * 1.18
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error("Create order error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
