import { NextResponse } from "next/server";

export async function GET() {
    try {
        const remoteUrl = "https://marineinsuranceapi.akiliapp.co.tz/api/v1/countries";
        const res = await fetch(remoteUrl, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch countries from remote API");
        }

        const json = await res.json();
        const countries = json.data || [];

        return NextResponse.json(countries);
    } catch (error: any) {
        console.error("Error fetching countries:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch countries" },
            { status: 500 }
        );
    }
}
