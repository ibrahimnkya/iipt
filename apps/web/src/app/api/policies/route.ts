import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const policies = await prisma.insurancePolicy.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(policies);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, code, clauseType, description, rate,
            cargoTypes, transportModes, incoterms, geoScope, originPorts, destinationPorts,
            valuationBasis, minSumInsured, maxSumInsured, currency,
            minPremium, hazardLoading, discount, vat,
            additionalCovers, startDate, endDate, autoInvoice, autoIssue,
            requiresManualApproval, internalNotes, isActive
        } = body;

        if (!name || !clauseType || rate === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const policy = await prisma.insurancePolicy.create({
            data: {
                name,
                code,
                clauseType,
                description,
                rate,
                cargoTypes,
                transportModes,
                incoterms,
                geoScope,
                originPorts,
                destinationPorts,
                valuationBasis,
                minSumInsured,
                maxSumInsured,
                currency,
                minPremium,
                hazardLoading,
                discount,
                vat,
                additionalCovers,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                autoInvoice,
                autoIssue,
                requiresManualApproval,
                internalNotes,
                isActive: isActive !== undefined ? isActive : true
            },
        });

        return NextResponse.json(policy, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
