import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            companyName,
            logoUrl,
            phone,
            physicalAddress,
            fullName,
            email,
            tinNumber,
            brelaNumber,
            natureOfBusiness,
            postalAddress,
            signature
        } = body;

        // specific check if email is being updated to ensure it's not taken by another user
        if (email && email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                companyName,
                logoUrl,
                phone,
                physicalAddress,
                fullName,
                email,
                tinNumber,
                brelaNumber,
                natureOfBusiness,
                postalAddress,
                signature
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 444 });
        }

        // Remove password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
