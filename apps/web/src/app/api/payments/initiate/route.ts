import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/paymentService";
import { PaymentGatewayService } from "@/services/paymentGatewayService";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { invoiceId, provider, phone, amount } = body;

        if (!invoiceId || !provider || !phone || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const payment = await PaymentService.initiatePayment(
            session.user.id,
            invoiceId,
            provider,
            phone,
            amount
        );

        // 3. Initiate Push Payment via Gateway
        try {
            // Map internal fields to external API payload
            // provider (e.g. "airtel") -> payment_channel ("Tigo", "Airtel", etc)
            // We need to map the lowercase uts_name to the Capitalized mobile_channel name if required by API,
            // OR just pass what we have if the API is flexible.
            // Based on user request: provider -> payment_channel

            // Simple mapping helper - in real app might need a DB lookup or config
            const channelMap: Record<string, string> = {
                "airtel": "Airtel",
                "tigopesa": "Tigo",
                "halopesa": "Halopesa",
                "azampesa": "Azampesa",
                "mpesa": "M-Pesa"
            };

            const externalChannel = channelMap[provider] || provider;

            // Construct callback URL
            // Assuming NEXT_PUBLIC_APP_URL is set in environment, or fallback to request origin if possible?
            // Next.js server components/routes don't easily give origin without headers.
            // Let's rely on process.env.NEXT_PUBLIC_APP_URL or headers.
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tiips.co.tz"; // Default prod URL or localhost dev tunnel
            const callbackUrl = `${appUrl}/api/payments/callback`;

            await PaymentGatewayService.initiatePushPayment({
                phone_number: phone,
                payment_reference: invoiceId, // User requested invoiceId -> payment_reference
                payment_channel: externalChannel,
                amount: amount,
                callback_url: callbackUrl
            });
            console.log(`🚀 Push payment initiated for ${payment.id} via ${provider} with callback: ${callbackUrl}`);
        } catch (gatewayError: any) {
            console.error(`Failed to initiate push payment via gateway for payment ${payment.id}:`, gatewayError);
            // Depending on requirements, you might want to return an error here
            // or just log it and proceed with the internal payment record.
            // For now, we'll log and let the main flow return the payment object.
        }

        // Return pending payment immediately
        // The frontend will poll for status updates
        return NextResponse.json(payment);
    } catch (error: any) {
        console.error("Payment initiation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to initiate payment" },
            { status: 500 }
        );
    }
}
