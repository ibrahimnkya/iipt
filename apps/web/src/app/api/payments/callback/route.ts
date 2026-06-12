import { NextResponse } from "next/server";
import { prisma } from "@tiips/db";
import { log } from "console";

interface PaymentCallbackPayload {
    user: any;
    amount: string;
    msisdn: string;
    message: string;
    transid: string;
    clientId: any;
    operator: string;
    password: any;
    reference: string;
    utilityref: string; // Invoice ID
    mnoreference: string;
    submerchantAcc: any;
    externalreference: string;
    transactionstatus: string;
    // additionalProperties?: {
    //     parcel_transaction_uuid?: string;
    //     parcel_payment?: string;
    //     paymentReference?: string;
    // };
}

// export async function POST(req: Request) {
//     const startTime = Date.now();

//     try {
//         const body: PaymentCallbackPayload = await req.json();
//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.log("🔔 PAYMENT CALLBACK RECEIVED");
//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.log("📦 Payload:", JSON.stringify(body, null, 2));

//         const {
//             utilityref: invoiceId,
//             transactionstatus,
//             transid,
//             amount,
//             operator,
//             msisdn
//         } = body;

//         // Validate required fields
//         if (!invoiceId) {
//             console.error("❌ Missing invoiceId (utilityref)");
//             return NextResponse.json({ error: "Missing utilityref" }, { status: 400 });
//         }

//         // Find invoice with related data
//         const invoice = await prisma.invoice.findUnique({
//             where: { id: invoiceId },
//             include: {
//                 payments: {
//                     orderBy: { createdAt: "desc" }
//                 },
//                 order: true
//             }
//         });

//         if (!invoice) {
//             console.error(`❌ Invoice not found: ${invoiceId}`);
//             return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
//         }

//         console.log(`📋 Invoice found: ${invoice.id}`);
//         console.log(`   Current Status: ${invoice.status}`);
//         console.log(`   Amount: ${invoice.amount} ${invoice.order.currency}`);

//         // Check if already paid
//         if (invoice.status === "PAID") {
//             console.log(`⚠️  Invoice already PAID - ignoring callback`);
//             return NextResponse.json({
//                 status: "ALREADY_PAID",
//                 message: "Invoice already processed"
//             });
//         }

//         // Determine success/failure
//         const isSuccess = transactionstatus?.toLowerCase() === "success";
//         console.log(`💳 Transaction Status: ${transactionstatus} → ${isSuccess ? "✅ SUCCESS" : "❌ FAILED"}`);

//         // Find PENDING payment
//         const pendingPayment = invoice.payments.find(p => p.status === "PENDING");

//         if (!pendingPayment) {
//             console.warn(`⚠️  No PENDING payment found for invoice ${invoiceId}`);
//             console.log(`   Existing payments: ${invoice.payments.map(p => `${p.id}:${p.status}`).join(", ")}`);
//         } else {
//             console.log(`🔍 Found PENDING payment: ${pendingPayment.id}`);
//         }

//         // Process payment
//         if (isSuccess) {
//             console.log(`🔄 Processing SUCCESS payment...`);

//             const result = await prisma.$transaction(async (tx) => {
//                 // Update Invoice
//                 const updatedInvoice = await tx.invoice.update({
//                     where: { id: invoiceId },
//                     data: {
//                         status: "PAID",
//                         paidAt: new Date()
//                     }
//                 });

//                 // Update Order
//                 await tx.order.update({
//                     where: { id: invoice.orderId },
//                     data: {
//                         status: "APPROVED"
//                     }
//                 });

//                 let payment;
//                 if (pendingPayment) {
//                     // Update existing PENDING payment
//                     payment = await tx.payment.update({
//                         where: { id: pendingPayment.id },
//                         data: {
//                             status: "SUCCESS",
//                             transactionId: transid,
//                             provider: operator,
//                             updatedAt: new Date()
//                         }
//                     });
//                 } else {
//                     // Create new payment record (fallback)
//                     payment = await tx.payment.create({
//                         data: {
//                             userId: invoice.order.userId,
//                             invoiceId: invoice.id,
//                             provider: operator || "unknown",
//                             phoneNumber: msisdn,
//                             amount: parseFloat(amount),
//                             status: "SUCCESS",
//                             transactionId: transid
//                         }
//                     });
//                 }

//                 return { invoice: updatedInvoice, payment };
//             });

//             const processingTime = Date.now() - startTime;
//             console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//             console.log("✅ PAYMENT SUCCESS PROCESSED");
//             console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//             console.log(`   Invoice: ${result.invoice.id} → ${result.invoice.status}`);
//             console.log(`   Payment: ${result.payment.id} → ${result.payment.status}`);
//             console.log(`   Order: ${invoice.orderId} → APPROVED`);
//             console.log(`   Transaction ID: ${transid}`);
//             console.log(`   Processing Time: ${processingTime}ms`);
//             console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//             return NextResponse.json({
//                 status: "OK",
//                 message: "Payment processed successfully",
//                 data: {
//                     invoiceId: invoiceId,
//                     paymentId: result.payment.id,
//                     transactionId: transid
//                 }
//             });

//         } else {
//             // Payment FAILED
//             console.log(`🔄 Processing FAILED payment...`);

//             if (pendingPayment) {
//                 await prisma.payment.update({
//                     where: { id: pendingPayment.id },
//                     data: {
//                         status: "FAILED",
//                         transactionId: transid,
//                         updatedAt: new Date()
//                     }
//                 });
//                 console.log(`❌ Payment ${pendingPayment.id} marked as FAILED`);
//             }

//             const processingTime = Date.now() - startTime;
//             console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//             console.log("❌ PAYMENT FAILURE PROCESSED");
//             console.log(`   Processing Time: ${processingTime}ms`);
//             console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//             return NextResponse.json({
//                 status: "OK",
//                 message: "Payment failure recorded"
//             });
//         }

//     } catch (error: any) {
//         const processingTime = Date.now() - startTime;
//         console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.error("💥 CALLBACK ERROR");
//         console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.error("Error:", error.message);
//         console.error("Stack:", error.stack);
//         console.error(`Processing Time: ${processingTime}ms`);
//         console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//         return NextResponse.json({
//             error: error.message || "Internal server error"
//         }, { status: 500 });
//     }
// }

export async function POST(req: Request) {

    const body: PaymentCallbackPayload = await req.json();

    console.log("Callback body:", body);

    const {
        utilityref,
        transactionstatus,
        transid,
    } = body;

    if (!utilityref) {
        throw new Error("utilityref missing in callback");
    }

    const payment = await prisma.payment.findFirst({
        where: {
            invoiceId: utilityref.trim(),
        },
        include: { invoice: true },
    });

    console.log("Found Payment");
    console.log(payment);

    if (!payment) throw new Error("Payment not found");

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCESS",
                transactionId: utilityref
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

    return NextResponse.json({
        id: payment.id
    });
}