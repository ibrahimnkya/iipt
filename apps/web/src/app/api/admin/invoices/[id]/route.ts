import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@tiips/db";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                tinNumber: true,
                                physicalAddress: true,
                                phone: true
                            }
                        },
                        policy: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                payments: true
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return NextResponse.json(
            { error: "Failed to fetch invoice" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        // Start transaction to update invoice and optionally order
        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.update({
                where: { id: params.id },
                data: {
                    status,
                    paidAt: status === "PAID" ? new Date() : null,
                },
                include: { order: true }
            });

            // If invoice is PAID, update Order status
            if (status === "PAID") {
                await tx.order.update({
                    where: { id: invoice.orderId },
                    data: {
                        status: "PAID",
                        validationStatus: "VALID"
                    }
                });
            }

            return invoice;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating invoice:", error);
        return NextResponse.json(
            { error: "Failed to update invoice" },
            { status: 500 }
        );
    }
}
