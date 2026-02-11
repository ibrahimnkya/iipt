import { prisma, PaymentStatus } from "@tiips/db";

export class PaymentService {
    /**
     * Initiate a simulated mobile money payment
     */
    static async initiatePayment(userId: string, invoiceId: string, provider: string, phone: string, amount: number) {
        // 1. Validate Invoice existence
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        if (invoice.status === "PAID") {
            throw new Error("Invoice is already paid");
        }

        // 2. Create Pending Payment Record
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

        // 3. Simulate Async Process (In a real app, this would be a request to the MNO gateway)
        // For the demo, we'll just return the payment record. 
        // The frontend will Poll or the simulated webhook will update it.

        return payment;
    }

    /**
     * Check payment status
     */
    static async getPaymentStatus(paymentId: string) {
        return await prisma.payment.findUnique({
            where: { id: paymentId },
        });
    }

    /**
     * Simulate a successful callback (Demo only)
     * This forces a payment to SUCCESS and updates the invoice
     */
    static async simulatePaymentSuccess(paymentId: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: true },
        });

        if (!payment) throw new Error("Payment not found");

        // Transaction Block: Update Payment and Invoice
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
                    status: "PAID",
                    validationStatus: "VALID"
                }
            }),
        ]);

        return { success: true };
    }
}
