"use strict";
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    FileText,
    Loader2,
    Shield,
    AlertTriangle,
    Eye
} from "lucide-react";
import { PolicyService } from "@/services/policyService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsurerPoliciesPage() {
    const router = useRouter();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            const data = await PolicyService.getInsurerPolicies();
            setPolicies(data);
        } catch (error) {
            console.error("Error loading policies:", error);
            toast.error("Failed to load policies");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this policy?")) return;

        try {
            await PolicyService.delete(id);
            toast.success("Policy deleted successfully");
            loadPolicies();
        } catch (error) {
            console.error("Error deleting policy:", error);
            toast.error("Failed to delete policy");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await PolicyService.toggleStatus(id, !currentStatus);
            toast.success(`Policy ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadPolicies();
        } catch (error) {
            console.error("Error updating policy status:", error);
            toast.error("Failed to update policy status");
        }
    };

    const filteredPolicies = policies.filter(policy => {
        const matchesSearch =
            policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && policy.isActive) ||
            (statusFilter === "INACTIVE" && !policy.isActive);

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="space-y-6 font-sans bg-transparent">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 rounded-xl" />
                        <Skeleton className="h-4.5 w-72 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>

                {/* Filters skeleton */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 w-full sm:w-36 rounded-lg" />
                </div>

                {/* Policies Grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between h-[230px] shadow-sm">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4.5 w-32 rounded" />
                                            <Skeleton className="h-3 w-16 rounded" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-md" />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3.5 w-12 rounded" />
                                        <Skeleton className="h-3.5 w-8 rounded" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3.5 w-16 rounded" />
                                        <Skeleton className="h-3.5 w-12 rounded" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3.5 w-16 rounded" />
                                        <Skeleton className="h-3.5 w-6 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <Skeleton className="h-3.5 w-24 rounded" />
                                <div className="flex gap-2">
                                    <Skeleton className="w-7 h-7 rounded-md" />
                                    <Skeleton className="w-7 h-7 rounded-md" />
                                    <Skeleton className="w-7 h-7 rounded-md" />
                                    <Skeleton className="w-7 h-7 rounded-md" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Policies</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your insurance policy offerings</p>
                </div>
                <Link
                    href="/dashboard/policies/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Policy
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Policies Grid */}
            {filteredPolicies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No policies found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {searchQuery ? "Try adjusting your search filters" : "Get started by creating your first policy"}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/dashboard/policies/create"
                            className="text-brand-green font-medium hover:underline"
                        >
                            Create a new policy
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPolicies.map((policy) => (
                        <div
                            key={policy.id}
                            className="group bg-white rounded-xl border border-gray-200 hover:border-brand-green/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                        >
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 line-clamp-1" title={policy.name}>
                                                {policy.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono">{policy.code}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 rounded-md text-xs font-semibold border",
                                        policy.isActive
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                    )}>
                                        {policy.isActive ? "Active" : "Inactive"}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Rate</span>
                                        <span className="font-semibold text-gray-900">{policy.rate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Clause</span>
                                        <span className="font-medium text-gray-900">{policy.clauseType}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Orders</span>
                                        <span className="font-medium text-gray-900">
                                            {policy._count?.orders || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    Created {new Date(policy.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Link
                                        href={`/dashboard/policies/${policy.id}`}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={`/dashboard/policies/${policy.id}/edit`}
                                        className="p-2 text-gray-400 hover:text-brand-green hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Edit Policy"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleToggleStatus(policy.id, policy.isActive)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            policy.isActive
                                                ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                : "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"
                                        )}
                                        title={policy.isActive ? "Deactivate" : "Activate"}
                                    >
                                        {policy.isActive ? (
                                            <XCircle className="w-4 h-4" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(policy.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Policy"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
