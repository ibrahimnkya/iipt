"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Search,
    Download,
    ChevronDown,
    Eye,
    Mail,
    Printer,
    LayoutGrid,
    List,
    Receipt,
    DollarSign,
    TrendingUp,
    Users,
    ArrowUpRight
} from "lucide-react";

interface Invoice {
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
    paidAt: string | null;
    order: {
        id: string;
        cargoDescription: string;
        currency: string;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        policy: {
            name: string;
        };
    };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function AdminInvoicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
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
            fetchInvoices();
        }
    }, [session]);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/admin/invoices");
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            } else {
                console.error("Failed to fetch invoices");
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { id: "all", label: "All", count: invoices.length },
        { id: "PAID", label: "Paid", count: invoices.filter(i => i.status === "PAID").length },
        { id: "UNPAID", label: "Unpaid", count: invoices.filter(i => i.status === "UNPAID").length },
        { id: "CANCELLED", label: "Cancelled", count: invoices.filter(i => i.status === "CANCELLED").length },
    ];

    const sortInvoices = (invoicesToSort: Invoice[]) => {
        const sorted = [...invoicesToSort];
        switch (sortBy) {
            case "newest":
                return sorted.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
            case "oldest":
                return sorted.sort((a, b) => new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime());
            case "highest":
                return sorted.sort((a, b) => b.amount - a.amount);
            case "lowest":
                return sorted.sort((a, b) => a.amount - b.amount);
            default:
                return sorted;
        }
    };

    const filteredInvoices = sortInvoices(
        invoices.filter((invoice) => {
            const matchesStatus = activeStatus === "all" || invoice.status === activeStatus;
            const matchesSearch = 
                invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.order.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.order.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
    );

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === "PAID").length,
        unpaid: invoices.filter(i => i.status === "UNPAID").length,
        cancelled: invoices.filter(i => i.status === "CANCELLED").length,
        totalRevenue: invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0),
        pendingRevenue: invoices.filter(i => i.status === "UNPAID").reduce((sum, i) => sum + i.amount, 0),
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            PAID: {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-700",
                icon: CheckCircle,
                dot: "bg-emerald-500"
            },
            UNPAID: {
                bg: "bg-amber-50",
                border: "border-amber-200",
                text: "text-amber-700",
                icon: Clock,
                dot: "bg-amber-500"
            },
            CANCELLED: {
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-700",
                icon: XCircle,
                dot: "bg-red-500"
            },
        };
        return configs[status as keyof typeof configs] || configs.UNPAID;
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading invoices...</p>
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
                                Admin - Invoices
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage all customer invoices and payments
                            </p>
                        </div>
                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Receipt className="w-5 h-5 text-gray-600" />
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
                                    <p className="text-xs text-emerald-700 font-medium">Paid</p>
                                    <p className="text-xl font-bold text-emerald-900">{stats.paid}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-amber-200 bg-amber-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-700 font-medium">Unpaid</p>
                                    <p className="text-xl font-bold text-amber-900">{stats.unpaid}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200 bg-red-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-red-700 font-medium">Cancelled</p>
                                    <p className="text-xl font-bold text-red-900">{stats.cancelled}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                                    <p className="text-xl font-bold text-emerald-900">
                                        {(stats.totalRevenue / 1000000).toFixed(2)}M
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
                                    placeholder="Search by invoice ID, customer name, or email..."
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

                {/* Invoices Content */}
                {filteredInvoices.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No invoices found
                            </h3>
                            <p className="text-sm text-gray-600">
                                Try adjusting your filters or search query
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredInvoices.map((invoice) => {
                                    const statusConfig = getStatusConfig(invoice.status);

                                    return (
                                        <div
                                            key={invoice.id}
                                            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                                        >
                                            {/* Card Header */}
                                            <div className="p-5 border-b border-gray-100">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Receipt className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                                Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {invoice.order.user.fullName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${statusConfig.bg} ${statusConfig.border} border`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                        <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                            {invoice.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                                                        {invoice.order.policy.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5">
                                                {/* Customer Info */}
                                                <div className="mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Customer</p>
                                                    <p className="text-sm text-gray-900 font-medium">{invoice.order.user.fullName}</p>
                                                    <p className="text-xs text-gray-500">{invoice.order.user.email}</p>
                                                </div>

                                                {/* Order Description */}
                                                <div className="mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Order</p>
                                                    <p className="text-sm text-gray-900 line-clamp-2">{invoice.order.cargoDescription}</p>
                                                </div>

                                                {/* Amount */}
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Amount</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {invoice.order.currency} {invoice.amount.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Dates */}
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-1">Issued</p>
                                                        <p className="text-xs text-gray-900">
                                                            {new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {invoice.paidAt && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium mb-1">Paid</p>
                                                            <p className="text-xs text-emerald-600 font-medium">
                                                                {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/admin/invoices/${invoice.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </Link>
                                                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Mail className="w-4 h-4" />
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
                                                    Invoice
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Order / Policy
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Status
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
                                            {filteredInvoices.map((invoice) => {
                                                const statusConfig = getStatusConfig(invoice.status);

                                                return (
                                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-gray-900">
                                                                #{invoice.id.slice(0, 8).toUpperCase()}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Ref: {invoice.order.id.slice(0, 8)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">
                                                                {invoice.order.user.fullName}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {invoice.order.user.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-700 max-w-xs truncate">
                                                                {invoice.order.cargoDescription}
                                                            </div>
                                                            <div className="text-xs text-blue-600 font-medium mt-1">
                                                                {invoice.order.policy.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-gray-900 text-sm">
                                                                {invoice.order.currency} {invoice.amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${statusConfig.bg} ${statusConfig.border} border`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                                <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                                    {invoice.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-600">
                                                                {new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                            {invoice.paidAt && (
                                                                <div className="text-xs text-emerald-600 font-medium mt-1">
                                                                    Paid {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={`/admin/invoices/${invoice.id}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    View
                                                                    <ArrowUpRight className="w-3 h-3" />
                                                                </Link>
                                                                <button className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                                                                    <Mail className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <p className="text-sm text-gray-600 text-right">
                                        Showing <span className="font-semibold text-gray-900">{filteredInvoices.length}</span> of{" "}
                                        <span className="font-semibold text-gray-900">{invoices.length}</span> invoices
                                    </p>
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