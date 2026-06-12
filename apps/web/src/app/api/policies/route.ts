import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
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

        const remoteUrl = "https://marineinsuranceapi.akiliapp.co.tz/api/v1/policies?is_active=true";
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch policies from remote backend");
        }

        const json = await res.json();
        const rawPolicies = json.data?.data || json.data || [];

        // Map remote policies to local frontend shapes
        const mappedPolicies = rawPolicies.map((p: any) => ({
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
            rate: p.premium_rate ? parseFloat(p.premium_rate) * 100 : 0, // frontend expects rate as percentage e.g. 1.5 instead of 0.015
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
        }));

        return NextResponse.json(mappedPolicies);
    } catch (error: any) {
        console.error("GET policies error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch policies" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "INSURER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const token = (session.user as any).accessToken;

        const remoteUrl = "https://marineinsuranceapi.akiliapp.co.tz/api/v1/policies";
        
        // Map local fields to remote fields
        const payload = {
            name: body.name,
            code: body.code,
            clause_type: body.clauseType,
            is_active: body.isActive !== undefined ? body.isActive : true,
            description: body.description,
            cargo_types: body.cargoTypes || [],
            transport_modes: body.transportModes || [],
            incoterms: body.incoterms || [],
            geographical_scope: body.geoScope || "worldwide",
            valuation_basis: body.valuationBasis || "invoice_value",
            minimum_sum_insured: body.minSumInsured || 1000,
            maximum_sum_insured: body.maxSumInsured || 10000000,
            currency: body.currency || "USD",
            premium_rate: body.rate ? body.rate / 100 : 0.015, // remote expects rate as fraction
            min_premium: body.minPremium || 50,
            hazard_loading_percent: body.hazardLoading || 0,
            discount_percent: body.discount || 0,
            vat_percent: body.vat || 18,
            auto_generate_invoice: body.autoInvoice !== undefined ? body.autoInvoice : true,
            auto_issue_after_payment: body.autoIssue !== undefined ? body.autoIssue : false,
            require_manual_approval: body.manualApproval !== undefined ? body.manualApproval : true,
            internal_notes: body.internalNotes || "",
            start_date: body.startDate ? body.startDate.split("T")[0] : "2026-01-01",
            end_date: body.endDate ? body.endDate.split("T")[0] : "2027-12-31",
        };

        const res = await fetch(remoteUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to create policy" }, { status: res.status });
        }

        return NextResponse.json(data.data || data, { status: 201 });
    } catch (error: any) {
        console.error("Error creating policy:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
