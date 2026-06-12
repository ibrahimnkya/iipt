import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "INSURER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insurerId = session.user.id;

        // 1. Total Policies
        const totalPolicies = await prisma.insurancePolicy.count({
            where: { insurerId },
        });

        const activePolicies = await prisma.insurancePolicy.count({
            where: { insurerId, isActive: true },
        });

        const inactivePolicies = await prisma.insurancePolicy.count({
            where: { insurerId, isActive: false },
        });

        // 2. Total Revenue (Sum of PAID invoices for orders linked to insurer's policies)
        // We need to join Order -> Policy -> Insurer
        // And Order -> Invoice
        const paidInvoices = await prisma.invoice.findMany({
            where: {
                status: "PAID",
                order: {
                    policy: {
                        insurerId: insurerId
                    }
                }
            },
            select: {
                amount: true,
                paidAt: true,
                issuedAt: true,
            }
        });

        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);

        // 3. Claims (Using orders with claimsHistory = true for now as proxy, or if there's a better way)
        const activeClaims = await prisma.order.count({
            where: {
                policy: { insurerId },
                claimsHistory: true,
                // In a real system, we'd have a separate Claim model with status
            }
        });

        // 4. Revenue Trends (Group by Month for last 6 months)
        const revenueTrends = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            const monthRevenue = paidInvoices
                .filter(inv => {
                    const invDate = new Date(inv.paidAt || inv.issuedAt);
                    return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
                })
                .reduce((acc, inv) => acc + inv.amount, 0);

            revenueTrends.push({ name: monthName, revenue: monthRevenue });
        }

        return NextResponse.json({
            totalPolicies,
            activePolicies,
            inactivePolicies,
            totalRevenue,
            activeClaims,
            revenueTrends,
        });

    } catch (error) {
        console.error("Reports API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports data" },
            { status: 500 }
        );
    }
}
