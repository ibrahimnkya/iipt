import { NextResponse } from "next/server";
import { prisma } from "@tiips/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const country = searchParams.get("country");
        const type = searchParams.get("type");

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
            ];
        }

        if (country) {
            where.country = country;
        }

        if (type) {
            where.type = type;
        }

        const ports = await prisma.port.findMany({
            where,
            orderBy: { name: "asc" },
            take: 50, // Limit results for performance
        });

        return NextResponse.json(ports);
    } catch (error) {
        console.error("Error fetching ports:", error);
        return NextResponse.json(
            { error: "Failed to fetch ports" },
            { status: 500 }
        );
    }
}
