import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@tiips/db";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                invoice: {
                    include: {
                        order: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map to frontend expectation
        const formattedPayments = payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            method: payment.provider, // Map provider to method
            status: payment.status,
            createdAt: payment.createdAt,
            invoice: {
                id: payment.invoice.id,
                order: {
                    id: payment.invoice.order.id,
                    cargoDescription: payment.invoice.order.cargoDescription,
                    currency: payment.invoice.order.currency
                }
            }
        }));

        return NextResponse.json(formattedPayments);
    } catch (error) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
