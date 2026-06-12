import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Return default settings
        const settings = {
            siteName: "NIIS-T",
            siteEmail: "admin@niip.co.tz",
            enableNotifications: true,
            enableEmailAlerts: true,
            maintenanceMode: false,
            autoApproveOrders: false,
            defaultCurrency: "TZS",
            taxRate: 18,
        };

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // In a real implementation, you would save these to a database
        // For now, just return success
        console.log("Settings updated:", body);

        return NextResponse.json({ success: true, settings: body });
    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
