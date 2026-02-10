import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            fullName,
            phone,
            postalAddress,
            physicalAddress,
            brelaNumber,
            tinNumber,
            natureOfBusiness,
            signature,
        } = body;

        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                phone,
                postalAddress,
                physicalAddress,
                brelaNumber,
                tinNumber,
                natureOfBusiness,
                signature,
                role: "USER", // Default role
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
