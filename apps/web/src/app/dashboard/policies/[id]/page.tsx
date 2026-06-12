"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Shield,
    Edit,
    Trash2,
    Globe,
    Package,
    Percent,
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
    Anchor,
    Truck,
    Plane,
    Wallet,
    AlertTriangle,
    Clock,
    Settings,
    Download,
    Eye,
    Copy,
    Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PolicyService } from "@/services/policyService";

interface InsurancePolicy {
    id: string;
    name: string;
    code: string;
    clauseType: string;
    description?: string;
    rate: number;
    isActive: boolean;
    cargoTypes?: string[];
    transportModes?: string[];
    incoterms?: string[];
    geoScope: string;
    originPorts?: string[];
    destinationPorts?: string[];
    valuationBasis: string;
    minSumInsured?: number;
    maxSumInsured?: number;
    currency: string;
    minPremium?: number;
    hazardousLoading?: number;
    discount?: number;
    vat: number;
    additionalCovers?: { name: string; type: "Flat" | "Percentage"; amount: number }[];
    startDate: string;
    endDate?: string;
    autoInvoice: boolean;
    autoIssue: boolean;
    requiresManualApproval: boolean;
    internalNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function InsurerPolicyDetailsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const policyId = params?.id as string;

    const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

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
            toast.error("Error loading policy details");
            router.push("/dashboard/policies");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!policy) return;

        try {
            await PolicyService.toggleStatus(policyId, !policy.isActive);
            setPolicy({ ...policy, isActive: !policy.isActive });
            toast.success(`Policy ${!policy.isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error("Error updating policy:", error);
            toast.error("Failed to update policy status");
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await PolicyService.delete(policyId);
            toast.success("Policy deleted successfully");
            router.push("/dashboard/policies");
        } catch (error) {
            console.error("Error deleting policy:", error);
            toast.error("Error deleting policy");
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const calculatePremiumExample = (baseValue: number) => {
        if (!policy) return { total: 0, breakdown: [] };

        const premium = (baseValue * policy.rate) / 100;
        const discountAmount = (premium * (policy.discount || 0)) / 100;
        const netPremium = premium - discountAmount;
        const vatAmount = (netPremium * policy.vat) / 100;
        const total = netPremium + vatAmount;

        return {
            total,
            breakdown: [
                { label: "Base Premium", value: premium },
                ...(discountAmount > 0 ? [{ label: "Discount", value: -discountAmount }] : []),
                { label: "Net Premium", value: netPremium },
                { label: "VAT", value: vatAmount },
            ],
        };
    };

    if (status === "loading" || loading) {
        return (
            <div className="space-y-6 font-sans bg-transparent">
                {/* Header Action Bar skeleton */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-48 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                </div>

                {/* Blue Gradient Banner skeleton */}
                <div className="bg-slate-200 animate-pulse rounded-xl p-6 sm:p-8 mb-6 h-36">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/40 rounded-lg p-4 flex flex-col justify-between">
                                <Skeleton className="h-3.5 w-16 rounded bg-slate-300" />
                                <Skeleton className="h-7 w-24 rounded bg-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left main block skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <Skeleton className="h-5 w-40 rounded" />
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-3 w-24 rounded" />
                                            <Skeleton className="h-4.5 w-36 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Coverage Scope */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <Skeleton className="h-5 w-36 rounded" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Skeleton className="h-3 w-20 rounded" />
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3].map((s) => (
                                            <Skeleton key={s} className="h-7 w-24 rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Skeleton className="h-3 w-24 rounded" />
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2].map((s) => (
                                            <Skeleton key={s} className="h-7 w-20 rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar skeleton */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-lg p-6 space-y-6">
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32 bg-slate-800 rounded" />
                                <Skeleton className="h-3 w-48 bg-slate-800 rounded" />
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-20 bg-slate-800 rounded" />
                                        <Skeleton className="h-4 w-16 bg-slate-800 rounded" />
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16 bg-slate-800 rounded" />
                                    <Skeleton className="h-3 w-12 bg-slate-800 rounded" />
                                </div>
                                <Skeleton className="h-7 w-28 bg-slate-800 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Policy Not Found</h2>
                    <p className="text-sm text-gray-600 mb-6">The policy you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/dashboard/policies"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Policies
                    </Link>
                </div>
            </div>
        );
    }

    const premiumExample = calculatePremiumExample(100000);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/policies"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{policy.name}</h1>
                        <p className="text-xs text-gray-500 font-mono">{policy.code}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn(
                        "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold",
                        policy.isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-red-50 border-red-200 text-red-700"
                    )}>
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            policy.isActive ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        {policy.isActive ? "Active" : "Inactive"}
                    </div>

                    <button
                        onClick={handleToggleActive}
                        className={cn(
                            "hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border",
                            policy.isActive
                                ? "bg-white text-red-600 border-red-200 hover:bg-red-50"
                                : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        )}
                    >
                        {policy.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <Link
                        href={`/dashboard/policies/${policyId}/edit`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                    </Link>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 mb-6 text-white shadow-lg">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <p className="text-xs text-blue-100 mb-1">Premium Rate</p>
                            <p className="text-2xl font-bold">{policy.rate}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <p className="text-xs text-blue-100 mb-1">Currency</p>
                            <p className="text-2xl font-bold">{policy.currency}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <p className="text-xs text-blue-100 mb-1">VAT Rate</p>
                            <p className="text-2xl font-bold">{policy.vat}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <p className="text-xs text-blue-100 mb-1">Clause Type</p>
                            <p className="text-lg font-bold truncate">{policy.clauseType}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1.5">Clause Type</p>
                                        <p className="text-sm font-semibold text-gray-900">{policy.clauseType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1.5">Valuation Basis</p>
                                        <p className="text-sm font-semibold text-gray-900">{policy.valuationBasis}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1.5">Currency</p>
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm font-semibold text-gray-900">{policy.currency === 'USD' || policy.currency === 'TZS' ? 'Tsh' : policy.currency}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1.5">Geographic Scope</p>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm font-semibold text-gray-900">{policy.geoScope}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coverage Scope */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">Coverage Scope</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {policy.cargoTypes && policy.cargoTypes.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-3">Cargo Types</p>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.cargoTypes.map((type) => (
                                                <span key={type} className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                                                    <Package className="w-3 h-3 mr-1.5" />
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {policy.transportModes && policy.transportModes.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-3">Transport Modes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.transportModes.map((mode) => (
                                                <span key={mode} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                                                    {mode === "Sea" && <Anchor className="w-3.5 h-3.5" />}
                                                    {mode === "Air" && <Plane className="w-3.5 h-3.5" />}
                                                    {mode === "Road" && <Truck className="w-3.5 h-3.5" />}
                                                    {mode}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {policy.additionalCovers && policy.additionalCovers.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">Additional Covers</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {policy.additionalCovers.map((cover, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{cover.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{cover.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {cover.type === "Percentage"
                                                            ? `${cover.amount}%`
                                                            : `${policy.currency === 'USD' || policy.currency === 'TZS' ? 'Tsh' : policy.currency} ${cover.amount.toLocaleString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Premium Calculator */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Premium Calculator</h4>
                                </div>
                                <p className="text-xs text-gray-400 mb-6">Example for {policy.currency === 'USD' || policy.currency === 'TZS' ? 'Tsh' : policy.currency} 100,000 cargo value</p>
                                <div className="space-y-3 mb-6">
                                    {premiumExample.breakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className={cn("text-sm", item.value < 0 ? "text-red-400" : "text-gray-300")}>{item.label}</span>
                                            <span className={cn("font-semibold text-sm", item.value < 0 ? "text-red-400" : "text-white")}>
                                                {item.value < 0 ? "- " : ""}
                                                {policy.currency === 'USD' || policy.currency === 'TZS' ? 'Tsh' : policy.currency} {Math.abs(item.value).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase mb-1">Total Premium</p>
                                            <p className="text-xs text-gray-500">inc. VAT</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-emerald-400">
                                                {policy.currency === 'USD' || policy.currency === 'TZS' ? 'Tsh' : policy.currency} {premiumExample.total.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Policy?</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            This action cannot be undone. This will permanently delete the policy <span className="font-semibold">{policy.name}</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                disabled={deleting}
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={deleting}
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Policy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
