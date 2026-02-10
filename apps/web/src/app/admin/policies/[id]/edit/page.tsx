
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PolicyForm } from "@/components/policies/PolicyForm";
import { PolicyService } from "@/services/policyService";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPolicyPage() {
    const params = useParams();
    const policyId = params?.id as string;
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (policyId) {
            fetchPolicy();
        }
    }, [policyId]);

    const fetchPolicy = async () => {
        try {
            const data = await PolicyService.getById(policyId);
            setPolicy(data);
        } catch (error) {
            console.error("Error fetching policy:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-500 mb-4">Policy not found</p>
                <Link href="/admin/policies" className="text-brand-green hover:underline">
                    Back to Policies
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/admin/policies/${policyId}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-green mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Policy Details
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Edit Insurance Policy
                            </h1>
                            <p className="text-sm text-gray-600">
                                Update coverage scope, rating logic, and risk parameters
                            </p>
                        </div>
                    </div>
                </div>

                <PolicyForm initialData={policy} isEditing={true} />
            </div>
        </div>
    );
}
