import { NextResponse } from "next/server";
import { prisma } from "@tiips/db";

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        return NextResponse.json({ status: "ok", count: userCount });
    } catch (error: any) {
        console.error("DB Test Error:", error);
        return NextResponse.json(
            { status: "error", message: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
