"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    CreditCard,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    ChevronDown,
    Calendar,
    DollarSign,
    TrendingUp,
    Eye,
    ArrowUpRight,
    Receipt,
    LayoutGrid,
    List,
    Package,
    XCircle,
    Wallet
} from "lucide-react";

interface Payment {
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    invoice: {
        id: string;
        order: {
            id: string;
            cargoDescription: string;
            currency: string;
        };
    };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function PaymentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [activeStatus, setActiveStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchPayments();
        }
    }, [session]);

    const fetchPayments = async () => {
        try {
            const res = await fetch("/api/payments");
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { id: "all", label: "All", count: payments.length },
        { id: "PENDING", label: "Pending", count: payments.filter(p => p.status === "PENDING").length },
        { id: "SUCCESS", label: "Completed", count: payments.filter(p => p.status === "SUCCESS").length },
        { id: "FAILED", label: "Failed", count: payments.filter(p => p.status === "FAILED").length },
    ];

    const sortPayments = (paymentsToSort: Payment[]) => {
        const sorted = [...paymentsToSort];
        switch (sortBy) {
            case "newest":
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case "oldest":
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case "highest":
                return sorted.sort((a, b) => b.amount - a.amount);
            case "lowest":
                return sorted.sort((a, b) => a.amount - b.amount);
            default:
                return sorted;
        }
    };

    const filteredPayments = sortPayments(
        payments.filter((payment) => {
            const matchesStatus = activeStatus === "all" || payment.status === activeStatus;
            const matchesSearch =
                payment.invoice.order.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
    );

    // Calculate statistics
    const stats = {
        total: payments.length,
        pending: payments.filter(p => p.status === "PENDING").length,
        completed: payments.filter(p => p.status === "SUCCESS" || p.status === "COMPLETED").length,
        failed: payments.filter(p => p.status === "FAILED").length,
        totalAmount: payments.filter(p => p.status === "SUCCESS" || p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0),
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            PENDING: {
                bg: "bg-yellow-50",
                border: "border-yellow-200",
                text: "text-yellow-700",
                icon: Clock,
                dot: "bg-yellow-500"
            },
            SUCCESS: {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-700",
                icon: CheckCircle,
                dot: "bg-emerald-500"
            },
            COMPLETED: { // Kept for backward compatibility if needed
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-700",
                icon: CheckCircle,
                dot: "bg-emerald-500"
            },
            FAILED: {
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-700",
                icon: XCircle,
                dot: "bg-red-500"
            },
        };
        return configs[status as keyof typeof configs] || configs.PENDING;
    };

    const getMethodIcon = (method: string) => {
        const methodLower = method.toLowerCase();
        if (methodLower.includes("mpesa") || methodLower.includes("m-pesa")) {
            return { icon: Wallet, color: "text-green-600", bg: "bg-green-100" };
        }
        if (methodLower.includes("airtel")) {
            return { icon: Wallet, color: "text-red-600", bg: "bg-red-100" };
        }
        if (methodLower.includes("tigo") || methodLower.includes("yas")) {
            return { icon: Wallet, color: "text-blue-600", bg: "bg-blue-100" };
        }
        return { icon: CreditCard, color: "text-gray-600", bg: "bg-gray-100" };
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Payments
                            </h1>
                            <p className="text-sm text-gray-600">
                                View and manage your payment history
                            </p>
                        </div>
                        <Link
                            href="/dashboard/invoices"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Receipt className="w-4 h-4" />
                            View Invoices
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Payments</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-amber-200 bg-amber-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-700 font-medium">Pending</p>
                                    <p className="text-xl font-bold text-amber-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-emerald-200 bg-emerald-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-700 font-medium">Completed</p>
                                    <p className="text-xl font-bold text-emerald-900">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Paid</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {(stats.totalAmount / 1000).toFixed(0)}K
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods Info
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">M-Pesa</p>
                                    <p className="text-xs text-gray-500">Vodacom M-Pesa</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Airtel Money</p>
                                    <p className="text-xs text-gray-500">Airtel payment</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Tigo Pesa</p>
                                    <p className="text-xs text-gray-500">Tigo payment</p>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Search and Controls Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by description, method, or ID..."
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
                                    <option value="highest">Highest Amount</option>
                                    <option value="lowest">Lowest Amount</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded transition-all ${viewMode === "grid"
                                        ? "bg-white text-brand-green shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded transition-all ${viewMode === "list"
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
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeStatus === filter.id
                                        ? "bg-brand-green text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {filter.label}
                                    {filter.count > 0 && (
                                        <span className={`ml-1.5 ${activeStatus === filter.id ? "text-white/80" : "text-gray-500"
                                            }`}>
                                            ({filter.count})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payments Content */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {payments.length === 0 ? "No payments yet" : "No matching payments"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {payments.length === 0
                                    ? "Your payment history will appear here after you make payments"
                                    : "Try adjusting your filters or search query"}
                            </p>
                            {payments.length === 0 && (
                                <Link
                                    href="/dashboard/invoices"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors"
                                >
                                    <Receipt className="w-4 h-4" />
                                    View Invoices
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredPayments.map((payment) => {
                                    const statusConfig = getStatusConfig(payment.status);
                                    const methodConfig = getMethodIcon(payment.method);
                                    const MethodIcon = methodConfig.icon;

                                    return (
                                        <div
                                            key={payment.id}
                                            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                                        >
                                            {/* Card Header */}
                                            <div className="p-5 border-b border-gray-100">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 ${methodConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                            <MethodIcon className={`w-5 h-5 ${methodConfig.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                                                {payment.invoice.order.cargoDescription}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">{payment.method}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${statusConfig.bg} ${statusConfig.border} border`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                        <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5">
                                                {/* Amount */}
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Payment Amount</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {payment.invoice.order.currency} {payment.amount.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span>
                                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Receipt className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate">
                                                            Invoice: {payment.invoice.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate">
                                                            Order: {payment.invoice.order.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/invoices/${payment.invoice.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Invoice
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === "list" && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {/* Mobile List View */}
                                <div className="block lg:hidden divide-y divide-gray-100">
                                    {filteredPayments.map((payment) => {
                                        const statusConfig = getStatusConfig(payment.status);
                                        const methodConfig = getMethodIcon(payment.method);
                                        const MethodIcon = methodConfig.icon;

                                        return (
                                            <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 ${methodConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                            <MethodIcon className={`w-5 h-5 ${methodConfig.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                                                                {payment.invoice.order.cargoDescription}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">{payment.method}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.border} border`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                        <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {payment.invoice.order.currency} {payment.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-0.5">Date</p>
                                                        <p className="text-xs font-medium text-gray-900">
                                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/invoices/${payment.invoice.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Invoice
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Payment
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Method
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredPayments.map((payment) => {
                                                const statusConfig = getStatusConfig(payment.status);
                                                const methodConfig = getMethodIcon(payment.method);
                                                const MethodIcon = methodConfig.icon;

                                                return (
                                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 ${methodConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                                    <MethodIcon className={`w-5 h-5 ${methodConfig.color}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">
                                                                        {payment.invoice.order.cargoDescription}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                        ID: {payment.id.slice(0, 8)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${statusConfig.bg} ${statusConfig.border} border`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                                <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                                    {payment.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                {payment.method}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900 text-sm">
                                                                {payment.invoice.order.currency} {payment.amount.toLocaleString()}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={`/dashboard/invoices/${payment.invoice.id}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    View
                                                                    <ArrowUpRight className="w-3 h-3" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Results Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{filteredPayments.length}</span> of{" "}
                                <span className="font-semibold text-gray-900">{payments.length}</span> payments
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-sm text-brand-green font-medium hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}