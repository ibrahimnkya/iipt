import { NextResponse } from "next/server";
import { prisma } from "@tiips/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        const where: any = {};

        if (search) {
            where.OR = [
                { code: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (category) {
            where.category = category;
        }

        const hsCodes = await prisma.hSCode.findMany({
            where,
            orderBy: { code: "asc" },
            take: 50, // Limit results
        });

        return NextResponse.json(hsCodes);
    } catch (error) {
        console.error("Error fetching HS codes:", error);
        return NextResponse.json(
            { error: "Failed to fetch HS codes" },
            { status: 500 }
        );
    }
}
