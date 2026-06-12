import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.toLowerCase();
        const country = searchParams.get("country")?.toUpperCase();
        const type = searchParams.get("type");

        const remoteUrl = "https://marineinsuranceapi.akiliapp.co.tz/api/v1/ports";
        const res = await fetch(remoteUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch ports from remote API");
        }

        const json = await res.json();
        const rawPorts = json.data || [];

        // Map remote port structure to expected local structure
        let ports = rawPorts.map((port: any) => ({
            id: port.id.toString(),
            code: port.code,
            name: port.name,
            country: port.country_id === 1 ? "TZ" : port.country_id === 2 ? "KE" : "TZ",
            type: "Sea"
        }));

        // Apply filters locally for exact same behavior
        if (search) {
            ports = ports.filter((port: any) => 
                port.name.toLowerCase().includes(search) || 
                port.code.toLowerCase().includes(search)
            );
        }

        if (country) {
            ports = ports.filter((port: any) => port.country === country);
        }

        if (type) {
            ports = ports.filter((port: any) => port.type === type);
        }

        return NextResponse.json(ports);
    } catch (error: any) {
        console.error("Error fetching ports:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch ports" },
            { status: 500 }
        );
    }
}
