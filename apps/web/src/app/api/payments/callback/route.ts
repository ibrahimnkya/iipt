import { NextResponse } from "next/server";
import { prisma } from "@tiips/db";

// Payload interface based on user's request
interface PaymentCallbackPayload {
    user: any;
    amount: string;
    msisdn: string; // phone number
    message: string;
    transid: string; // gateway reference
    clientId: any;
    operator: string; // payment channel
    password: any;
    reference: string;
    utilityref: string; // Invoice ID
    mnoreference: string;
    submerchantAcc: any;
    externalreference: string;
    transactionstatus: string;
}

export async function POST(req: Request) {
    try {
        const body: PaymentCallbackPayload = await req.json();
        console.log("Received payment callback:", body);

        const {
            utilityref: invoiceId, // Mapped from utilityref
            transactionstatus,
            transid, // Gateway transaction ID
            amount,
            operator
        } = body;

        if (!invoiceId) {
            console.error("Callback missing invoiceId (utilityref)");
            return NextResponse.json({ error: "Missing utilityref" }, { status: 400 });
        }

        // 1. Find the invoice and related pending payment
        // We look for a PENDING payment for this invoice.
        // If there are multiple, we might need a better way to match (e.g. if we sent paymentId as reference initially).
        // unique reference? The user said "transid is the payment_reference". 
        // In previous step we sent `payment_reference: invoiceId`. 
        // So `transid` likely equals `invoiceId` too?
        // Let's rely on `invoiceId` to find the invoice first.

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                payments: true,
                order: true
            }
        });

        if (!invoice) {
            console.error(`Invoice not found for callback: ${invoiceId}`);
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // 2. Determine Success/Fail
        // "transactionstatus": "success" -> SUCCESS
        const isSuccess = transactionstatus?.toLowerCase() === "success";

        // 3. Find the specific payment record to update
        // We'll look for the most recent PENDING payment for this invoice
        // Or if we can match by amount?
        const pendingPayment = await prisma.payment.findFirst({
            where: {
                invoiceId: invoiceId,
                status: "PENDING"
            },
            orderBy: { createdAt: "desc" }
        });

        if (!pendingPayment) {
            console.warn(`No PENDING payment found for invoice ${invoiceId}. It might have been already processed.`);
            // If already paid, we just acknowledge
            if (invoice.status === "PAID") {
                return NextResponse.json({ status: "ALREADY_PAID" });
            }
        }

        // 4. Update Database in Transaction
        if (isSuccess) {
            await prisma.$transaction(async (tx) => {
                // Update Invoice
                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        status: "PAID",
                        paidAt: new Date()
                    }
                });

                // Update Order Status to APPROVED
                await tx.order.update({
                    where: { id: invoice.orderId },
                    data: {
                        status: "APPROVED"
                    }
                });

                // Update Payment (if found) or Create new one if for some reason it's missing?
                // Better to update existing if found.
                if (pendingPayment) {
                    await tx.payment.update({
                        where: { id: pendingPayment.id },
                        data: {
                            status: "SUCCESS",
                            transactionId: transid,
                            // metadata could be stored if we had a field for it
                        }
                    });
                } else {
                    // Fallback: Create a new SUCCESS payment record if none matched?
                    // Verify amount first? 
                    // For now, let's create one to be safe if no pending one existed (edge case)
                    await tx.payment.create({
                        data: {
                            userId: invoice.order.userId, // We need userId. Invoice -> Order -> User
                            invoiceId: invoice.id,
                            provider: operator || "unknown",
                            phoneNumber: body.msisdn,
                            amount: parseFloat(amount),
                            status: "SUCCESS",
                            transactionId: transid
                        }
                    });
                }
            });
            console.log(`Payment success for invoice ${invoiceId}`);
        } else {
            console.log(`Payment failed for invoice ${invoiceId}`);
            if (pendingPayment) {
                await prisma.payment.update({
                    where: { id: pendingPayment.id },
                    data: {
                        status: "FAILED",
                        transactionId: transid
                    }
                });
            }
        }

        return NextResponse.json({ status: "OK" });

    } catch (error: any) {
        console.error("Payment callback processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
