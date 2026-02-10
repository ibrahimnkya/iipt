
"use client";

import { useRouter } from "next/navigation";
import { X as XIcon } from "lucide-react";
import { PolicyForm } from "@/components/policies/PolicyForm";

export default function CreatePolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Create Insurance Policy
                            </h1>
                            <p className="text-sm text-gray-600">
                                Define coverage scope, rating logic, and risk parameters
                            </p>
                        </div>
                    </div>
                </div>

                <PolicyForm />
            </div>
        </div>
    );
}