"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PolicyForm } from "@/components/policies/PolicyForm";
import { PolicyService, PolicyData } from "@/services/policyService";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

export default function EditInsurerPolicyPage() {
    const params = useParams();
    const policyId = params?.id as string;
    const [policy, setPolicy] = useState<PolicyData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            toast.error("Failed to load policy details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 font-sans bg-transparent">
                {/* Back button link skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-36 rounded" />
                </div>

                {/* Header skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-96 rounded-md" />
                </div>

                {/* Form layout card skeleton */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3.5 w-24 rounded" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Policy not found</h3>
                <p className="text-sm text-gray-500 mb-4">
                    The policy you are trying to edit does not exist or you do not have permission to view it.
                </p>
                <Link
                    href="/dashboard/policies"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Policies
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/policies/${policyId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-green transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Policy Details
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Policy</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Update the configuration for <span className="font-semibold text-gray-900">{policy.name}</span>
                </p>
            </div>

            <PolicyForm initialData={policy} isEditing={true} />
        </div>
    );
}
