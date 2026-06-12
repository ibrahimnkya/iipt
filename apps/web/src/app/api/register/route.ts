import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            confirmPassword,
            fullName,
            phone,
            physicalAddress,
            brelaNumber,
            tinNumber,
            natureOfBusiness,
            role,
            companyName,
        } = body;

        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: "Missing required fields (Name, Email, and Password are required)" },
                { status: 400 }
            );
        }

        const isInsurer = role === "INSURER";
        const remoteUrl = isInsurer 
            ? "https://marineinsuranceapi.akiliapp.co.tz/api/v1/insurer/register"
            : "https://marineinsuranceapi.akiliapp.co.tz/api/v1/auth/register/customer";

        const payload = isInsurer
            ? {
                  name: companyName || fullName,
                  contact_person_name: fullName,
                  company_email: email,
                  contact_person_phone: phone,
                  registration_number: brelaNumber || "BRELA-TEMP",
                  tin: tinNumber || "TIN-TEMP",
                  address: physicalAddress || "Dar es Salaam, Tanzania",
                  description: natureOfBusiness || "Marine cargo underwriter",
                  password: password,
                  password_confirmation: confirmPassword || password,
              }
            : {
                  name: fullName,
                  email: email,
                  password: password,
                  password_confirmation: confirmPassword || password,
                  phone: phone || "+255700000000",
              };

        const res = await fetch(remoteUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data.message || "Registration failed" },
                { status: res.status }
            );
        }

        // Return a shape consistent with the local frontend expectations
        const mappedUser = {
            id: (data.data?.user?.id || data.data?.id || "temp-id").toString(),
            email: email,
            fullName: fullName,
            role: isInsurer ? "INSURER" : "USER",
            status: isInsurer ? "PENDING" : "APPROVED",
        };

        return NextResponse.json(mappedUser, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
