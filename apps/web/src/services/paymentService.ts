import { prisma, PaymentStatus } from "@tiips/db";

export class PaymentService {
    /**
     * Initiate a simulated mobile money payment
     */
    static async initiatePayment(userId: string, invoiceId: string, provider: string, phone: string, amount: number) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        if (invoice.status === "PAID") {
            throw new Error("Invoice is already paid");
        }

        const payment = await prisma.payment.create({
            data: {
                userId,
                invoiceId,
                provider,
                phoneNumber: phone,
                amount,
                status: "PENDING",
            },
        });

        return payment;
    }

    /**
     * Check payment status
     */
    static async getPaymentStatus(paymentId: string) {
        return await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                invoice: true, // Include invoice data for SUCCESS response
            },
        });
    }

    /**
     * Update payment status (used by callback)
     */
    static async updatePaymentStatus(
        paymentId: string,
        status: PaymentStatus,
        transactionId?: string
    ) {
        return await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status,
                transactionId,
            },
        });
    }

    /**
     * Simulate a successful callback (Demo only)
     */
    static async simulatePaymentSuccess(paymentId: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: true },
        });

        if (!payment) throw new Error("Payment not found");

        await prisma.$transaction([
            prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: "SUCCESS",
                    transactionId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                },
            }),
            prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                    status: "PAID",
                    paidAt: new Date()
                },
            }),
            prisma.order.update({
                where: { id: payment.invoice.orderId },
                data: {
                    status: "APPROVED" 
                }
            }),
        ]);

        return { success: true };
    }
}