"use client";

import { useSession } from "next-auth/react";
import { Building2 } from "lucide-react";

export function InsurerTopbar() {
    const { data: session } = useSession();

    if (session?.user?.role !== "INSURER") {
        return null;
    }

    return (
        <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                    {session.user.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.companyName || "Company Logo"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Building2 className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                        {session.user.companyName || session.user.fullName || "Insurance Company"}
                    </h1>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Insurer Portal
                    </p>
                </div>
            </div>
        </div>
    );
}
