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
    DollarSign,
    AlertTriangle,
    Clock,
    Settings,
    Download,
    Eye,
    Copy,
    Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    manualApproval: boolean;
    internalNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function PolicyDetailsPage() {
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
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN" && policyId) {
            fetchPolicy();
        }
    }, [session, policyId]);

    const fetchPolicy = async () => {
        try {
            const res = await fetch(`/api/policies/${policyId}`);
            if (res.ok) {
                const data = await res.json();
                setPolicy(data);
            } else {
                toast.error("Failed to fetch policy");
                router.push("/admin/policies");
            }
        } catch (error) {
            console.error("Error fetching policy:", error);
            toast.error("Error loading policy");
            router.push("/admin/policies");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!policy) return;

        try {
            const res = await fetch(`/api/policies/${policyId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !policy.isActive }),
            });

            if (res.ok) {
                setPolicy({ ...policy, isActive: !policy.isActive });
                toast.success(`Policy ${!policy.isActive ? 'activated' : 'deactivated'} successfully`);
            } else {
                toast.error("Failed to update policy status");
            }
        } catch (error) {
            console.error("Error updating policy:", error);
            toast.error("Error updating policy status");
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/policies/${policyId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Policy deleted successfully");
                router.push("/admin/policies");
            } else {
                toast.error("Failed to delete policy");
            }
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading policy details...</p>
                </div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Policy Not Found</h2>
                    <p className="text-sm text-gray-600 mb-6">The policy you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/admin/policies"
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
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/policies"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-green transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                                        {policy.name}
                                    </h1>
                                    <p className="text-xs text-gray-500 font-mono">{policy.code}</p>
                                </div>
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
                                href={`/admin/policies/${policyId}/edit`}
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
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 mb-6 text-white shadow-lg">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{policy.name}</h2>
                                <p className="text-blue-100 text-sm font-mono mb-3">{policy.code}</p>
                                {policy.description && (
                                    <p className="text-blue-50 text-sm max-w-2xl leading-relaxed">{policy.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

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
                                            <DollarSign className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm font-semibold text-gray-900">{policy.currency}</p>
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
                                {/* Cargo Types */}
                                {policy.cargoTypes && policy.cargoTypes.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-3">Cargo Types</p>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.cargoTypes.map((type) => (
                                                <span
                                                    key={type}
                                                    className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200"
                                                >
                                                    <Package className="w-3 h-3 mr-1.5" />
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transport Modes */}
                                {policy.transportModes && policy.transportModes.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-3">Transport Modes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.transportModes.map((mode) => (
                                                <span
                                                    key={mode}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200"
                                                >
                                                    {mode === "Sea" && <Anchor className="w-3.5 h-3.5" />}
                                                    {mode === "Air" && <Plane className="w-3.5 h-3.5" />}
                                                    {mode === "Road" && <Truck className="w-3.5 h-3.5" />}
                                                    {mode}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Incoterms */}
                                {policy.incoterms && policy.incoterms.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-3">Supported Incoterms</p>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.incoterms.map((term) => (
                                                <span
                                                    key={term}
                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold"
                                                >
                                                    {term}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Premium & Rating */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Percent className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">Premium & Rating</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Premium Rate</p>
                                        <p className="text-2xl font-bold text-blue-900">{policy.rate}%</p>
                                    </div>
                                    {policy.minPremium && policy.minPremium > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 font-medium mb-1">Min Premium</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {policy.currency} {policy.minPremium.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {policy.discount && policy.discount > 0 && (
                                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                            <p className="text-xs text-red-700 font-medium mb-1">Discount</p>
                                            <p className="text-lg font-bold text-red-900">{policy.discount}%</p>
                                        </div>
                                    )}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 font-medium mb-1">VAT Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{policy.vat}%</p>
                                    </div>
                                </div>

                                {policy.hazardousLoading && policy.hazardousLoading > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            <p className="text-sm text-amber-900 font-medium">
                                                Hazardous Cargo Loading: <span className="font-bold">{policy.hazardousLoading}%</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sum Insured Limits */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-4 h-4 text-gray-700" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">Sum Insured Limits</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 font-medium mb-2">Minimum Sum Insured</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {policy.minSumInsured && policy.minSumInsured > 0
                                                ? `${policy.currency} ${policy.minSumInsured.toLocaleString()}`
                                                : "No minimum"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 font-medium mb-2">Maximum Sum Insured</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {policy.maxSumInsured && policy.maxSumInsured > 0
                                                ? `${policy.currency} ${policy.maxSumInsured.toLocaleString()}`
                                                : "No maximum"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Covers */}
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
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{cover.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{cover.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {cover.type === "Percentage" 
                                                            ? `${cover.amount}%` 
                                                            : `${policy.currency} ${cover.amount.toLocaleString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validity Period */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">Validity Period</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                            <p className="text-xs text-emerald-700 font-medium">Start Date</p>
                                        </div>
                                        <p className="text-sm font-semibold text-emerald-900">
                                            {new Date(policy.startDate).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {policy.endDate && (
                                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-red-600" />
                                                <p className="text-xs text-red-700 font-medium">End Date</p>
                                            </div>
                                            <p className="text-sm font-semibold text-red-900">
                                                {new Date(policy.endDate).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Automation Settings */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Settings className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">Automation Settings</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                                policy.autoInvoice ? "bg-emerald-100" : "bg-gray-200"
                                            )}>
                                                {policy.autoInvoice ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">Auto-generate Invoice</span>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                                            policy.autoInvoice 
                                                ? "bg-emerald-100 text-emerald-700" 
                                                : "bg-gray-200 text-gray-600"
                                        )}>
                                            {policy.autoInvoice ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                                policy.autoIssue ? "bg-emerald-100" : "bg-gray-200"
                                            )}>
                                                {policy.autoIssue ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">Auto-issue After Payment</span>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                                            policy.autoIssue 
                                                ? "bg-emerald-100 text-emerald-700" 
                                                : "bg-gray-200 text-gray-600"
                                        )}>
                                            {policy.autoIssue ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                                policy.manualApproval ? "bg-amber-100" : "bg-gray-200"
                                            )}>
                                                {policy.manualApproval ? (
                                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">Requires Manual Approval</span>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                                            policy.manualApproval 
                                                ? "bg-amber-100 text-amber-700" 
                                                : "bg-gray-200 text-gray-600"
                                        )}>
                                            {policy.manualApproval ? "Required" : "Not Required"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Internal Notes */}
                        {policy.internalNotes && (
                            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-semibold text-amber-900">Internal Notes</h3>
                                </div>
                                <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{policy.internalNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Sticky */}
                    <div className="space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Premium Calculator */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                        Premium Calculator
                                    </h4>
                                </div>
                                <p className="text-xs text-gray-400 mb-6">
                                    Example for {policy.currency} 100,000 cargo value
                                </p>

                                <div className="space-y-3 mb-6">
                                    {premiumExample.breakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className={cn(
                                                "text-sm",
                                                item.value < 0 ? "text-red-400" : "text-gray-300"
                                            )}>
                                                {item.label}
                                            </span>
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                item.value < 0 ? "text-red-400" : "text-white"
                                            )}>
                                                {item.value < 0 ? "- " : ""}
                                                {policy.currency} {Math.abs(item.value).toLocaleString()}
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
                                                {policy.currency} {premiumExample.total.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                    <h4 className="text-sm font-semibold text-gray-900">Quick Actions</h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                        <Download className="w-4 h-4" />
                                        Export Policy
                                    </button>
                                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        View History
                                    </button>
                                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                        <Copy className="w-4 h-4" />
                                        Duplicate Policy
                                    </button>
                                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                        Share Policy
                                    </button>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                    <h4 className="text-sm font-semibold text-gray-900">Metadata</h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1.5">Policy ID</p>
                                        <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-2 rounded border border-gray-200">
                                            {policy.id}
                                        </p>
                                    </div>
                                    {policy.createdAt && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1.5">Created</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <p className="text-xs text-gray-900">
                                                    {new Date(policy.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {policy.updatedAt && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1.5">Last Updated</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <p className="text-xs text-gray-900">
                                                    {new Date(policy.updatedAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Policy</h3>
                                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-900">
                                    Are you sure you want to delete <strong>{policy.name}</strong>? All associated data will be permanently removed from the system.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? (
                                        <span className="inline-flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </span>
                                    ) : (
                                        "Delete Policy"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}