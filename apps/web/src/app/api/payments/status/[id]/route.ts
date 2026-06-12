import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/paymentService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const payment = await PaymentService.getPaymentStatus(id);

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        if (payment.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Return complete payment data including invoice
        return NextResponse.json({
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            provider: payment.provider,
            phoneNumber: payment.phoneNumber,
            transactionId: payment.transactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            invoice: payment.invoice, // Include invoice data for success screen
        });
        
    } catch (error: any) {
        console.error("Payment status error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to check status" },
            { status: 500 }
        );
    }
}