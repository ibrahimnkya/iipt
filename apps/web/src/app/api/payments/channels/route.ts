
import { NextResponse } from "next/server";
import { PaymentGatewayService } from "@/services/paymentGatewayService";

export const dynamic = 'force-dynamic'; // Ensure this endpoint isn't cached statically

export async function GET() {
    try {
        const channels = await PaymentGatewayService.getChannels();
        return NextResponse.json(channels);
    } catch (error: any) {
        console.error("API GET channels error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch payment channels" },
            { status: 500 }
        );
    }
}
