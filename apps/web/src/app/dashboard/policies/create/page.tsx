"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PolicyForm } from "@/components/policies/PolicyForm";

export default function CreateInsurerPolicyPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/policies"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-green transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Policies
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Policy</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Define the coverage terms, premiums, and rules for your new insurance product.
                </p>
            </div>

            <PolicyForm />
        </div>
    );
}
