import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                try {
                    const res = await fetch("https://marineinsuranceapi.akiliapp.co.tz/api/v1/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        })
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.message || "Invalid credentials");
                    }

                    const json = await res.json();

                    if (!json.success || !json.data || !json.data.access_token) {
                        throw new Error("Invalid credentials");
                    }

                    const token = json.data.access_token;
                    const remoteUser = json.data.user;
                    const remoteRole = json.data.role; // e.g. customer, insurer, admin, tira

                    // Map remote role to uppercase frontend compatible role
                    let mappedRole = "USER";
                    if (remoteRole === "admin") mappedRole = "ADMIN";
                    else if (remoteRole === "insurer") mappedRole = "INSURER";
                    else if (remoteRole === "tira") mappedRole = "TIRA";
                    else if (remoteRole === "customer") mappedRole = "USER";

                    return {
                        id: remoteUser.id.toString(),
                        email: remoteUser.email,
                        name: remoteUser.name,
                        role: mappedRole,
                        companyName: remoteUser.company_name || null,
                        image: remoteUser.logo_url || null,
                        accessToken: token
                    };
                } catch (error: any) {
                    console.error("NextAuth authorize remote error:", error);
                    throw new Error(error.message || "Invalid credentials");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.companyName = user.companyName;
                token.picture = user.image;
                token.accessToken = user.accessToken;
            }
            if (trigger === "update" && session?.user) {
                token.companyName = session.user.companyName;
                token.picture = session.user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.companyName = token.companyName;
                session.user.image = token.picture;
                session.user.accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
