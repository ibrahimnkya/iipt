"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Package, 
    FileText, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Plus, 
    Search, 
    Calendar, 
    Shield,
    LayoutGrid,
    List,
    Filter,
    ChevronDown,
    MapPin,
    TrendingUp,
    Eye,
    ArrowUpRight
} from "lucide-react";

interface Order {
    id: string;
    status: string;
    cargoDescription: string;
    sumInsured: number;
    currency: string;
    createdAt: string;
    originPort?: string;
    destinationPort?: string;
    policy: {
        name: string;
        clauseType: string;
    };
    invoice: {
        id: string;
        amount: number;
        status: string;
    } | null;
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
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
            fetchOrders();
        }
    }, [session]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { id: "all", label: "All", count: orders.length },
        { id: "PENDING", label: "Pending", count: orders.filter(o => o.status === "PENDING").length },
        { id: "APPROVED", label: "Approved", count: orders.filter(o => o.status === "APPROVED").length },
        { id: "ISSUED", label: "Issued", count: orders.filter(o => o.status === "ISSUED").length },
        { id: "CANCELLED", label: "Cancelled", count: orders.filter(o => o.status === "CANCELLED").length },
    ];

    const sortOrders = (ordersToSort: Order[]) => {
        const sorted = [...ordersToSort];
        switch (sortBy) {
            case "newest":
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case "oldest":
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case "highest":
                return sorted.sort((a, b) => b.sumInsured - a.sumInsured);
            case "lowest":
                return sorted.sort((a, b) => a.sumInsured - b.sumInsured);
            default:
                return sorted;
        }
    };

    const filteredOrders = sortOrders(
        orders.filter((order) => {
            const matchesStatus = activeStatus === "all" || order.status === activeStatus;
            const matchesSearch = 
                order.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.policy.clauseType.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
    );

    const getStatusConfig = (status: string) => {
        const configs = {
            PENDING: {
                bg: "bg-amber-50",
                border: "border-amber-200",
                text: "text-amber-700",
                icon: Clock,
                dot: "bg-amber-500"
            },
            APPROVED: {
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-700",
                icon: CheckCircle,
                dot: "bg-blue-500"
            },
            ISSUED: {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-700",
                icon: CheckCircle,
                dot: "bg-emerald-500"
            },
            CANCELLED: {
                bg: "bg-gray-50",
                border: "border-gray-200",
                text: "text-gray-700",
                icon: XCircle,
                dot: "bg-gray-500"
            },
        };
        return configs[status as keyof typeof configs] || configs.PENDING;
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading orders...</p>
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
                                Orders
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage and track your insurance requests
                            </p>
                        </div>
                        <Link
                            href="/dashboard/orders/create"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Order
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                                    <p className="text-xl font-bold text-gray-900">{orders.length}</p>
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
                                    <p className="text-xl font-bold text-amber-900">{orders.filter(o => o.status === "PENDING").length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200 bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 font-medium">Approved</p>
                                    <p className="text-xl font-bold text-blue-900">{orders.filter(o => o.status === "APPROVED").length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-emerald-200 bg-emerald-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-700 font-medium">Issued</p>
                                    <p className="text-xl font-bold text-emerald-900">{orders.filter(o => o.status === "ISSUED").length}</p>
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
                                    placeholder="Search by description, policy, or coverage..."
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

                {/* Orders Content */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {orders.length === 0 ? "No orders yet" : "No matching orders"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {orders.length === 0
                                    ? "Create your first insurance order to get started"
                                    : "Try adjusting your filters or search query"}
                            </p>
                            {orders.length === 0 && (
                                <Link
                                    href="/dashboard/orders/create"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Order
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);

                                    return (
                                        <div
                                            key={order.id}
                                            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                                        >
                                            {/* Card Header */}
                                            <div className="p-5 border-b border-gray-100">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                                                {order.cargoDescription}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">{order.policy.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${statusConfig.bg} ${statusConfig.border} border`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                        <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                        <Shield className="w-3 h-3" />
                                                        {order.policy.clauseType}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5">
                                                {/* Sum Insured */}
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Sum Insured</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {order.currency} {order.sumInsured.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span>
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {order.originPort && order.destinationPort && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            <span className="truncate">
                                                                {order.originPort} → {order.destinationPort}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {order.invoice && (
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                                                            order.invoice.status === 'PAID'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-amber-50 text-amber-700'
                                                        }`}>
                                                            <FileText className="w-3 h-3" />
                                                            Invoice: {order.invoice.status}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/orders/${order.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </Link>
                                                    {order.invoice && (
                                                        <Link
                                                            href={`/dashboard/invoices/${order.invoice.id}`}
                                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green/90 transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Link>
                                                    )}
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
                                    {filteredOrders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);

                                        return (
                                            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                                                                {order.cargoDescription}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">{order.policy.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.border} border`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                        <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Sum Insured</p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {order.currency} {order.sumInsured.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                        <Shield className="w-3 h-3" />
                                                        {order.policy.clauseType}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/orders/${order.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </Link>
                                                    {order.invoice && (
                                                        <Link
                                                            href={`/dashboard/invoices/${order.invoice.id}`}
                                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green/90 transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Invoice
                                                        </Link>
                                                    )}
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
                                                    Order
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Coverage
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Sum Insured
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
                                            {filteredOrders.map((order) => {
                                                const statusConfig = getStatusConfig(order.status);

                                                return (
                                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <Package className="w-5 h-5 text-gray-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">
                                                                        {order.cargoDescription}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                        {order.policy.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${statusConfig.bg} ${statusConfig.border} border`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                                <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                                <Shield className="w-3 h-3" />
                                                                {order.policy.clauseType}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900 text-sm">
                                                                {order.currency} {order.sumInsured.toLocaleString()}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={`/dashboard/orders/${order.id}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    View
                                                                    <ArrowUpRight className="w-3 h-3" />
                                                                </Link>
                                                                {order.invoice && (
                                                                    <Link
                                                                        href={`/dashboard/invoices/${order.invoice.id}`}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors"
                                                                    >
                                                                        Invoice
                                                                    </Link>
                                                                )}
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
                                Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of{" "}
                                <span className="font-semibold text-gray-900">{orders.length}</span> orders
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