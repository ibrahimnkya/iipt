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

        // For now, return empty array since we don't have payments table yet
        // This will be populated when the payment feature is fully implemented
        const payments = await prisma.payment.findMany({
            include: {
                invoice: {
                    select: {
                        order: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const validPayments = payments.map(p => ({
            ...p,
            method: "MOBILE_MONEY", // Default to mobile money for now as it is the only implemented method
            paidAt: p.createdAt, // Use createdAt as paidAt for payments
            transactionId: p.transactionId || "N/A"
        }));

        return NextResponse.json(validPayments);
    } catch (error) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}
