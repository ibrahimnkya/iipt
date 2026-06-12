export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = session.user.accessToken;

        // Fetch remote orders
        const ordersRes = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/orders", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (!ordersRes.ok) {
            throw new Error("Failed to fetch dashboard orders from remote backend");
        }

        const ordersJson = await ordersRes.json();
        const rawOrders = ordersJson.data?.data || ordersJson.data || [];

        const totalOrders = rawOrders.length;
        const pendingOrders = rawOrders.filter((o: any) => o.status?.toLowerCase() === "pending").length;
        
        // Sum total premium of approved/issued/submitted orders as revenue
        const totalPremiumPaid = rawOrders
            .filter((o: any) => o.status?.toLowerCase() === "approved" || o.status?.toLowerCase() === "issued" || o.status?.toLowerCase() === "submitted" || o.status?.toLowerCase() === "paid")
            .reduce((sum: number, o: any) => sum + parseFloat(o.total_premium || 0), 0);

        // Cargo distributions
        const marineCargo = rawOrders.filter((o: any) => o.transport_mode?.toLowerCase() === "sea" || o.transport_mode?.toLowerCase() === "marine" || o.transport_mode_id === 1).length;
        const airCargo = rawOrders.filter((o: any) => o.transport_mode?.toLowerCase() === "air" || o.transport_mode_id === 2).length;
        const roadCargo = rawOrders.filter((o: any) => o.transport_mode?.toLowerCase() === "road" || o.transport_mode_id === 3).length;

        const stats = {
            totalPremiumPaid,
            marineCargo,
            airCargo,
            roadCargo,
            totalOrders,
            pendingOrders,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
}
