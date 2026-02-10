import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@tiips/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all statistics
        const [totalOrders, totalInvoices, totalUsers, pendingOrders, paidInvoices, revenueData, seaCargo, airCargo, roadCargo, activePolicies, paidOrders] = await Promise.all([
            prisma.order.count(),
            prisma.invoice.count(),
            prisma.user.count(),
            prisma.order.count({
                where: { status: "PENDING" },
            }),
            prisma.invoice.count({
                where: { status: "PAID" },
            }),
            prisma.invoice.aggregate({
                where: { status: "PAID" },
                _sum: {
                    amount: true,
                },
            }),
            prisma.order.count({ where: { transportMode: "SEA" } }),
            prisma.order.count({ where: { transportMode: "AIR" } }),
            prisma.order.count({ where: { transportMode: "ROAD" } }),
            prisma.insurancePolicy.count({ where: { isActive: true } }),
            prisma.order.count({ where: { status: "PAID" } }),
        ]);

        // Calculate Average Processing Time (for orders with Invoices)
        const completedOrders = await prisma.order.findMany({
            where: {
                status: { in: ["ISSUED", "APPROVED"] },
                invoice: { isNot: null }
            },
            select: {
                createdAt: true,
                invoice: {
                    select: {
                        issuedAt: true
                    }
                }
            },
            take: 100, // Limit to last 100 for performance approximation
            orderBy: { createdAt: 'desc' }
        });

        let avgProcessingTime = 0;
        if (completedOrders.length > 0) {
            const totalDurationMs = completedOrders.reduce((acc, order) => {
                if (!order.invoice?.issuedAt) return acc;
                const duration = new Date(order.invoice.issuedAt).getTime() - new Date(order.createdAt).getTime();
                return acc + duration;
            }, 0);
            avgProcessingTime = (totalDurationMs / completedOrders.length) / (1000 * 60 * 60); // In hours
        }

        // Calculate Trends (Current Month vs Previous Month)
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            currentMonthRevenue, prevMonthRevenue,
            currentMonthOrders, prevMonthOrders,
            currentMonthUsers, prevMonthUsers
        ] = await Promise.all([
            prisma.invoice.aggregate({ where: { status: "PAID", issuedAt: { gte: firstDayCurrentMonth } }, _sum: { amount: true } }),
            prisma.invoice.aggregate({ where: { status: "PAID", issuedAt: { gte: firstDayPrevMonth, lte: lastDayPrevMonth } }, _sum: { amount: true } }),
            prisma.order.count({ where: { createdAt: { gte: firstDayCurrentMonth } } }),
            prisma.order.count({ where: { createdAt: { gte: firstDayPrevMonth, lte: lastDayPrevMonth } } }),
            prisma.user.count({ where: { createdAt: { gte: firstDayCurrentMonth } } }),
            prisma.user.count({ where: { createdAt: { gte: firstDayPrevMonth, lte: lastDayPrevMonth } } }),
        ]);

        const calculateTrend = (current: number, prev: number) => {
            if (prev === 0) return current > 0 ? "+100%" : "0%";
            const percent = ((current - prev) / prev) * 100;
            return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
        };

        const trends = {
            revenue: calculateTrend(currentMonthRevenue._sum.amount || 0, prevMonthRevenue._sum.amount || 0),
            orders: calculateTrend(currentMonthOrders, prevMonthOrders),
            users: calculateTrend(currentMonthUsers, prevMonthUsers),
            // Conversion rate trend is harder to calc accurately without more history, keeping simple for now
            conversion: "+0.0%"
        };

        // Recent Activity Feed
        const [recentOrders, recentInvoices, recentUsers] = await Promise.all([
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { fullName: true, email: true } } }
            }),
            prisma.invoice.findMany({
                where: { status: "PAID" },
                take: 5,
                orderBy: { issuedAt: 'desc' },
                include: { order: { select: { id: true } } }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const activities = [
            ...recentOrders.map(o => ({
                id: `ord-${o.id}`,
                title: "New order created",
                msg: `Order #${o.id.slice(0, 8).toUpperCase()} by ${o.user?.fullName || o.user?.email}`,
                time: o.createdAt,
                type: "info"
            })),
            ...recentInvoices.map(i => ({
                id: `inv-${i.id}`,
                title: "Invoice paid",
                msg: `Invoice #${i.id.slice(0, 8).toUpperCase()} for Order #${i.order?.id.slice(0, 8).toUpperCase()}`,
                time: i.paidAt || i.issuedAt,
                type: "success"
            })),
            ...recentUsers.map(u => ({
                id: `usr-${u.id}`,
                title: "New user registered",
                msg: `${u.fullName || u.email}`,
                time: u.createdAt,
                type: "warning" // distinct color
            }))
        ].sort((a, b) => new Date(b.time as any).getTime() - new Date(a.time as any).getTime()).slice(0, 10);

        // Fetch invoices for the last 12 months for chart data
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const monthlyInvoices = await prisma.invoice.findMany({
            where: {
                issuedAt: {
                    gte: oneYearAgo,
                },
                status: "PAID",
            },
            select: {
                issuedAt: true,
                amount: true,
            },
        });

        // Aggregate by month
        const monthlyRevenue = Array(12).fill(0).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return {
                month: d.toLocaleString('default', { month: 'short' }),
                revenue: 0,
                claims: 0, // Mock claim for now as we don't have claim data
            };
        });

        monthlyInvoices.forEach(inv => {
            const monthIndex = 11 - (new Date().getMonth() - inv.issuedAt.getMonth() +
                (12 * (new Date().getFullYear() - inv.issuedAt.getFullYear())));
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyRevenue[monthIndex].revenue += inv.amount;
            }
        });

        const formattedStats = {
            totalOrders,
            totalInvoices,
            totalRevenue: revenueData._sum?.amount || 0,
            totalUsers,
            pendingOrders,
            paidInvoices,
            paidOrders,
            marineCargo: seaCargo,
            airCargo,
            roadCargo,
            activePolicies,
            avgProcessingTime,
            trends,
            recentActivity: activities,
            monthlyRevenue: monthlyRevenue.map(m => ({
                ...m,
                revenue: Math.round(m.revenue / 1000000), // Convert to Millions for chart
                claims: Math.round((m.revenue * 0.3) / 1000000) // Mock 30% claims ratio
            }))
        };

        return NextResponse.json(formattedStats);
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}
