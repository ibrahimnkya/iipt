import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const token = (session?.user as any)?.accessToken;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { invoiceId, provider, amount } = body;

        if (!invoiceId) {
            return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
        }

        // Call remote pay invoice endpoint
        const remoteUrl = `https://marineinsuranceapi.akiliapp.co.tz/api/v1/invoices/${invoiceId.trim()}/pay`;
        const res = await fetch(remoteUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                payment_method: provider || "mobile_money",
                payment_notes: "Paid via Next.js Web App"
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Payment initiation failed" }, { status: res.status });
        }

        // Return expected frontend payment structure
        return NextResponse.json({
            id: (data.data?.id || invoiceId).toString(),
            status: "SUCCESS",
            invoiceId: invoiceId,
            amount: amount,
            provider: provider
        });
    } catch (error: any) {
        console.error("Payment initiation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to initiate payment" },
            { status: 500 }
        );
    }
}