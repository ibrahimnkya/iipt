
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/policies/[id] - Fetch a single policy
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const policy = await prisma.insurancePolicy.findUnique({
            where: { id },
        });

        if (!policy) {
            return NextResponse.json({ error: "Policy not found" }, { status: 404 });
        }

        return NextResponse.json(policy);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch policy" },
            { status: 500 }
        );
    }
}

// PUT /api/policies/[id] - Update a policy
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Whitelist allowed update fields to prevent overwriting critical IDs or metadata if unintended
        // But for admin, flexible update is usually okay.
        // Let's ensure dates are properly converted if present
        const data = { ...body };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const policy = await prisma.insurancePolicy.update({
            where: { id },
            data: data,
        });

        return NextResponse.json(policy);
    } catch (error) {
        console.error("Failed to update policy:", error);
        return NextResponse.json(
            { error: "Failed to update policy" },
            { status: 500 }
        );
    }
}

// DELETE /api/policies/[id] - Delete a policy
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if policy is in use by any orders?
        // Start by checking orders
        const ordersCount = await prisma.order.count({
            where: { policyId: id }
        });

        if (ordersCount > 0) {
            return NextResponse.json({ error: "Cannot delete policy associated with existing orders. Deactivate it instead." }, { status: 400 });
        }

        await prisma.insurancePolicy.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete policy:", error);
        return NextResponse.json(
            { error: "Failed to delete policy" },
            { status: 500 }
        );
    }
}
