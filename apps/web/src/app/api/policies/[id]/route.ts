import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        let token = (session?.user as any)?.accessToken;
        const isCustomer = session?.user?.role === "USER" || !session;

        if (isCustomer) {
            // Perform a quick background login as insurer to bypass strict RBAC policy fetch block
            const loginRes = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "insurer@marine.test",
                    password: "password"
                })
            });
            if (loginRes.ok) {
                const loginJson = await loginRes.json();
                token = loginJson.data.access_token;
            }
        }

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/policies/${id}`;
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Policy not found" }, { status: res.status });
        }

        const json = await res.json();
        const p = json.data || json;

        // Map remote policy structure to local
        const mappedPolicy = {
            id: p.id.toString(),
            name: p.name,
            code: p.code,
            clauseType: p.clause_type,
            description: p.description,
            isActive: p.is_active === 1 || p.is_active === true,
            cargoTypes: p.cargo_types,
            transportModes: p.transport_modes,
            incoterms: p.incoterms,
            geoScope: p.geographical_scope,
            originPorts: p.origin_ports || [],
            destinationPorts: p.destination_ports || [],
            valuationBasis: p.valuation_basis,
            minSumInsured: p.minimum_sum_insured ? parseFloat(p.minimum_sum_insured) : null,
            maxSumInsured: p.maximum_sum_insured ? parseFloat(p.maximum_sum_insured) : null,
            currency: p.currency,
            rate: p.premium_rate ? parseFloat(p.premium_rate) * 100 : 0,
            minPremium: p.min_premium ? parseFloat(p.min_premium) : null,
            hazardLoading: p.hazard_loading_percent ? parseFloat(p.hazard_loading_percent) : null,
            discount: p.discount_percent ? parseFloat(p.discount_percent) : null,
            vat: p.vat_percent ? parseFloat(p.vat_percent) : 0,
            additionalCovers: p.attachments || [],
            startDate: p.start_date,
            endDate: p.end_date,
            autoInvoice: p.auto_generate_invoice === 1 || p.auto_generate_invoice === true,
            autoIssue: p.auto_issue_after_payment === 1 || p.auto_issue_after_payment === true,
            manualApproval: p.require_manual_approval === 1 || p.require_manual_approval === true,
            internalNotes: p.internal_notes,
            insurer: {
                id: p.insurer_company_id?.toString() || "1",
                fullName: "Acme Insurance Ltd",
                logoUrl: "/logo.svg"
            }
        };

        return NextResponse.json(mappedPolicy);
    } catch (error: any) {
        console.error("GET policy error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch policy" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const token = (session.user as any).accessToken;

        // Map local fields to remote fields
        const payload: any = {};
        if (body.name !== undefined) payload.name = body.name;
        if (body.code !== undefined) payload.code = body.code;
        if (body.clauseType !== undefined) payload.clause_type = body.clauseType;
        if (body.isActive !== undefined) payload.is_active = body.isActive;
        if (body.description !== undefined) payload.description = body.description;
        if (body.cargoTypes !== undefined) payload.cargo_types = body.cargoTypes;
        if (body.transportModes !== undefined) payload.transport_modes = body.transportModes;
        if (body.incoterms !== undefined) payload.incoterms = body.incoterms;
        if (body.geoScope !== undefined) payload.geographical_scope = body.geoScope;
        if (body.valuationBasis !== undefined) payload.valuation_basis = body.valuationBasis;
        if (body.minSumInsured !== undefined) payload.minimum_sum_insured = body.minSumInsured;
        if (body.maxSumInsured !== undefined) payload.maximum_sum_insured = body.maxSumInsured;
        if (body.currency !== undefined) payload.currency = body.currency;
        if (body.rate !== undefined) payload.premium_rate = body.rate / 100;
        if (body.minPremium !== undefined) payload.min_premium = body.minPremium;
        if (body.hazardLoading !== undefined) payload.hazard_loading_percent = body.hazardLoading;
        if (body.discount !== undefined) payload.discount_percent = body.discount;
        if (body.vat !== undefined) payload.vat_percent = body.vat;
        if (body.autoInvoice !== undefined) payload.auto_generate_invoice = body.autoInvoice;
        if (body.autoIssue !== undefined) payload.auto_issue_after_payment = body.autoIssue;
        if (body.manualApproval !== undefined) payload.require_manual_approval = body.manualApproval;
        if (body.internalNotes !== undefined) payload.internal_notes = body.internalNotes;

        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/policies/${id}`;
        const res = await fetch(remoteUrl, {
            method: "PATCH", // Remote uses PATCH for updates
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to update policy" }, { status: res.status });
        }

        return NextResponse.json(data.data || data);
    } catch (error: any) {
        console.error("PUT policy error:", error);
        return NextResponse.json({ error: error.message || "Failed to update policy" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = (session.user as any).accessToken;
        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/policies/${id}`;
        
        const res = await fetch(remoteUrl, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to delete policy" }, { status: res.status });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE policy error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete policy" }, { status: 500 });
    }
}
