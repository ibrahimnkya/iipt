import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "INSURER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = session.user.accessToken;

        // Fetch remote insurer dashboard summary and policies list
        const [dashboardRes, policiesRes] = await Promise.all([
            fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/insurer/dashboard", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }),
            fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/policies", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            })
        ]);

        let dashboardData = { total_orders: 0, pending_orders: 0, total_revenue: 0 };
        let policies = [];

        if (dashboardRes.ok) {
            const dashboardJson = await dashboardRes.json();
            if (dashboardJson.success && dashboardJson.data) {
                dashboardData = dashboardJson.data;
            }
        }

        if (policiesRes.ok) {
            const policiesJson = await policiesRes.json();
            if (policiesJson.success && policiesJson.data) {
                // Unpack Laravel paginated list or plain array
                policies = Array.isArray(policiesJson.data) 
                    ? policiesJson.data 
                    : (policiesJson.data.data || []);
            }
        }

        const activePolicies = policies.filter((p: any) => p.is_active === true || p.status === "active").length;

        return NextResponse.json({
            policies: {
                total: policies.length,
                active: activePolicies
            },
            orders: {
                total: dashboardData.total_orders,
                pending: dashboardData.pending_orders
            },
            revenue: dashboardData.total_revenue || 0
        });

    } catch (error) {
        console.error("Error fetching insurer stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
