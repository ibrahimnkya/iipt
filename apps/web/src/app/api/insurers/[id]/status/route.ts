import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Return successful updated insurer mock response
        return NextResponse.json({
            id,
            fullName: "Test Insurer",
            status,
            email: "insurer@marine.test"
        });
    } catch (error) {
        console.error("Error updating insurer status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
