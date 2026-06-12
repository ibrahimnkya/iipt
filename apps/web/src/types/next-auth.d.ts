import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            fullName?: string | null;
            companyName?: string | null;
            image?: string | null;
            phone?: string | null;
            physicalAddress?: string | null;
            accessToken?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        fullName?: string | null; // Added to match session user
        companyName?: string | null;
        image?: string | null;
        phone?: string | null;
        physicalAddress?: string | null;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        companyName?: string | null;
        accessToken?: string;
    }
}
