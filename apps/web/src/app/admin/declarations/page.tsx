"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FileText,
    Search,
    Download,
    Eye,
    ShieldAlert,
    CheckCircle,
    Clock,
    Plane,
    Ship,
    Truck,
    ChevronDown,
    RefreshCw,
    LayoutGrid,
    List,
    AlertCircle,
    Package,
    Wallet,
    TrendingUp
} from "lucide-react";

interface Declaration {
    id: string;
    sadNumber: string;
    importerName: string;
    hsCode: string;
    goodsDescription: string;
    value: number;
    validationStatus: "VALID" | "HOLD";
    gateOutStatus: "PENDING" | "APPROVED" | "NA";
    transportMode: string;
    submittedAt: string;
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function AdminDeclarationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [declarations, setDeclarations] = useState<Declaration[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [activeStatus, setActiveStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetchDeclarations();
        }
    }, [session]);

    const fetchDeclarations = async () => {
        try {
            const res = await fetch("/api/admin/declarations");
            if (res.ok) {
                const data = await res.json();
                setDeclarations(data);
            } else {
                console.error("Failed to fetch declarations");
            }
        } catch (error) {
            console.error("Error fetching declarations:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { id: "all", label: "All", count: declarations.length },
        { id: "VALID", label: "Valid", count: declarations.filter(d => d.validationStatus === "VALID").length },
        { id: "HOLD", label: "On Hold", count: declarations.filter(d => d.validationStatus === "HOLD").length },
        { id: "APPROVED", label: "Gate-Out Ready", count: declarations.filter(d => d.gateOutStatus === "APPROVED").length },
    ];

    const sortDeclarations = (declarationsToSort: Declaration[]) => {
        const sorted = [...declarationsToSort];
        switch (sortBy) {
            case "newest":
                return sorted.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            case "oldest":
                return sorted.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
            case "highest":
                return sorted.sort((a, b) => b.value - a.value);
            case "lowest":
                return sorted.sort((a, b) => a.value - b.value);
            default:
                return sorted;
        }
    };

    const filteredDeclarations = sortDeclarations(
        declarations.filter((dec) => {
            let matchesStatus = true;
            if (activeStatus === "VALID") matchesStatus = dec.validationStatus === "VALID";
            else if (activeStatus === "HOLD") matchesStatus = dec.validationStatus === "HOLD";
            else if (activeStatus === "APPROVED") matchesStatus = dec.gateOutStatus === "APPROVED";
            
            const matchesSearch = 
                dec.sadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dec.importerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dec.hsCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dec.goodsDescription.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesStatus && matchesSearch;
        })
    );

    const stats = {
        total: declarations.length,
        valid: declarations.filter(d => d.validationStatus === "VALID").length,
        hold: declarations.filter(d => d.validationStatus === "HOLD").length,
        gateOutReady: declarations.filter(d => d.gateOutStatus === "APPROVED").length,
        totalValue: declarations.reduce((sum, d) => sum + d.value, 0),
    };

    const getTransportIcon = (mode: string) => {
        switch (mode) {
            case "AIR": return { icon: Plane, color: "text-blue-600", bg: "bg-blue-100" };
            case "SEA": return { icon: Ship, color: "text-cyan-600", bg: "bg-cyan-100" };
            case "ROAD": return { icon: Truck, color: "text-orange-600", bg: "bg-orange-100" };
            default: return { icon: Package, color: "text-gray-600", bg: "bg-gray-100" };
        }
    };

    const getValidationConfig = (status: string) => {
        if (status === "VALID") {
            return {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-700",
                icon: CheckCircle,
                dot: "bg-emerald-500"
            };
        }
        return {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-700",
            icon: ShieldAlert,
            dot: "bg-red-500"
        };
    };

    const getGateOutConfig = (status: string) => {
        const configs = {
            APPROVED: {
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-700",
                icon: CheckCircle,
                dot: "bg-blue-500"
            },
            PENDING: {
                bg: "bg-amber-50",
                border: "border-amber-200",
                text: "text-amber-700",
                icon: Clock,
                dot: "bg-amber-500"
            },
            NA: {
                bg: "bg-gray-50",
                border: "border-gray-200",
                text: "text-gray-700",
                icon: AlertCircle,
                dot: "bg-gray-500"
            },
        };
        return configs[status as keyof typeof configs] || configs.NA;
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading declarations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Import Declarations
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage and review SAD submissions
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchDeclarations}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-emerald-200 bg-emerald-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-700 font-medium">Valid</p>
                                    <p className="text-xl font-bold text-emerald-900">{stats.valid}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200 bg-red-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-red-700 font-medium">On Hold</p>
                                    <p className="text-xl font-bold text-red-900">{stats.hold}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200 bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 font-medium">Gate-Out</p>
                                    <p className="text-xl font-bold text-blue-900">{stats.gateOutReady}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Value</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        Tsh {(stats.totalValue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Controls Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by SAD number, importer, HS code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Value</option>
                                    <option value="lowest">Lowest Value</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded transition-all ${
                                        viewMode === "grid"
                                            ? "bg-white text-brand-green shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded transition-all ${
                                        viewMode === "list"
                                            ? "bg-white text-brand-green shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    title="List view"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveStatus(filter.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        activeStatus === filter.id
                                            ? "bg-brand-green text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {filter.label}
                                    {filter.count > 0 && (
                                        <span className={`ml-1.5 ${
                                            activeStatus === filter.id ? "text-white/80" : "text-gray-500"
                                        }`}>
                                            ({filter.count})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Declarations Content */}
                {filteredDeclarations.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No declarations found
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Try adjusting your filters or search query
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredDeclarations.map((dec) => {
                                    const validationConfig = getValidationConfig(dec.validationStatus);
                                    const gateOutConfig = getGateOutConfig(dec.gateOutStatus);
                                    const transportConfig = getTransportIcon(dec.transportMode);
                                    const TransportIcon = transportConfig.icon;

                                    return (
                                        <div
                                            key={dec.id}
                                            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                                        >
                                            {/* Card Header */}
                                            <div className="p-5 border-b border-gray-100">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 ${transportConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                            <TransportIcon className={`w-5 h-5 ${transportConfig.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                                SAD {dec.sadNumber}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">{dec.importerName}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                                                        HS: {dec.hsCode}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                        {dec.transportMode}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5">
                                                {/* Goods Description */}
                                                <div className="mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Goods Description</p>
                                                    <p className="text-sm text-gray-900 line-clamp-2">{dec.goodsDescription}</p>
                                                </div>

                                                {/* Value */}
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Declared Value</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        Tsh {dec.value.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Statuses */}
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-1">Validation</p>
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${validationConfig.bg} ${validationConfig.border} border`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${validationConfig.dot}`} />
                                                            <span className={`text-xs font-semibold ${validationConfig.text}`}>
                                                                {dec.validationStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-1">Gate-Out</p>
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${gateOutConfig.bg} ${gateOutConfig.border} border`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${gateOutConfig.dot}`} />
                                                            <span className={`text-xs font-semibold ${gateOutConfig.text}`}>
                                                                {dec.gateOutStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date */}
                                                <div className="text-xs text-gray-600 mb-4">
                                                    Submitted: {new Date(dec.submittedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* List/Table View */}
                        {viewMode === "list" && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    SAD Number
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Importer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    HS Code
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Goods
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Value
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Validation
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Gate-Out
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredDeclarations.map((dec) => {
                                                const validationConfig = getValidationConfig(dec.validationStatus);
                                                const gateOutConfig = getGateOutConfig(dec.gateOutStatus);
                                                const transportConfig = getTransportIcon(dec.transportMode);
                                                const TransportIcon = transportConfig.icon;

                                                return (
                                                    <tr key={dec.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-gray-900">
                                                                {dec.sadNumber}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {new Date(dec.submittedAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">
                                                                {dec.importerName}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                                <TransportIcon className={`w-3 h-3 ${transportConfig.color}`} />
                                                                <span>{dec.transportMode}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-sm font-semibold text-blue-600">
                                                                {dec.hsCode}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-700 max-w-xs truncate">
                                                                {dec.goodsDescription}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-gray-900 text-sm">
                                                                Tsh {dec.value.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${validationConfig.bg} ${validationConfig.border} border`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${validationConfig.dot}`} />
                                                                <span className={`text-xs font-semibold ${validationConfig.text}`}>
                                                                    {dec.validationStatus}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${gateOutConfig.bg} ${gateOutConfig.border} border`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${gateOutConfig.dot}`} />
                                                                <span className={`text-xs font-semibold ${gateOutConfig.text}`}>
                                                                    {dec.gateOutStatus}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-sm font-medium transition-colors">
                                                                View
                                                                <Eye className="w-3 h-3" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span>Risk Engine Active</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Showing <span className="font-semibold text-gray-900">{filteredDeclarations.length}</span> of{" "}
                                            <span className="font-semibold text-gray-900">{declarations.length}</span> declarations
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Footer */}
                        {searchQuery && (
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-sm text-brand-green font-medium hover:underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}