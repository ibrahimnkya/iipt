import { prisma } from "@tiips/db";

interface CreateInvoiceInput {
    orderId: string;
    sumInsured: number;
    policyRate: number;
}

interface InvoiceCalculation {
    premium: number;
    tiraLevy: number;
    stampDuty: number;
    total: number;
}

export class InvoiceService {
    /**
     * Calculate invoice amounts based on sum insured and policy rate
     */
    static calculateInvoice(sumInsured: number, policyRate: number): InvoiceCalculation {
        const premium = sumInsured * (policyRate / 100);
        const tiraLevy = premium * 0.01; // 1% TIRA levy
        const stampDuty = 1000; // TZS 2,000 stamp duty
        const total = premium + tiraLevy + stampDuty;

        return {
            premium: Math.round(premium * 100) / 100,
            tiraLevy: Math.round(tiraLevy * 100) / 100,
            stampDuty,
            total: Math.round(total * 100) / 100,
        };
    }

    /**
     * Create invoice automatically when order is created
     */
    static async createInvoice(input: CreateInvoiceInput) {
        const calculation = this.calculateInvoice(input.sumInsured, input.policyRate);

        const invoice = await prisma.invoice.create({
            data: {
                orderId: input.orderId,
                amount: calculation.total,
                status: "UNPAID",
            },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                            },
                        },
                        policy: true,
                    },
                },
            },
        });

        return {
            invoice,
            calculation,
        };
    }

    /**
     * Get invoice by ID
     */
    static async getInvoiceById(invoiceId: string) {
        return await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                                phone: true,
                            },
                        },
                        policy: true,
                    },
                },
                payments: true,
            },
        });
    }

    /**
     * Get all invoices for a user
     */
    static async getUserInvoices(userId: string) {
        return await prisma.invoice.findMany({
            where: {
                order: {
                    userId,
                },
            },
            include: {
                order: {
                    include: {
                        policy: true,
                    },
                },
                payments: true,
            },
            orderBy: {
                issuedAt: "desc",
            },
        });
    }

    /**
     * Get all invoices (admin only)
     */
    static async getAllInvoices() {
        return await prisma.invoice.findMany({
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                            },
                        },
                        policy: true,
                    },
                },
                payments: true,
            },
            orderBy: {
                issuedAt: "desc",
            },
        });
    }

    /**
     * Update invoice status
     */
    static async updateInvoiceStatus(invoiceId: string, status: "UNPAID" | "PAID" | "CANCELLED") {
        return await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status,
                paidAt: status === "PAID" ? new Date() : null,
            },
        });
    }
}
