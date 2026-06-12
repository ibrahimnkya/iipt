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
    ArrowUpRight,
    ArrowRight,
    ShieldAlert,
    Anchor,
    ArrowLeftRight,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
            // Use different API endpoint based on user role
            const endpoint = session?.user?.role === "INSURER"
                ? "/api/insurer/orders"
                : "/api/orders";

            const res = await fetch(endpoint);
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
                (order.cargoDescription?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (order.policy?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (order.policy?.clauseType?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
    );

    const getStatusConfig = (status: string) => {
        const configs = {
            PENDING: {
                bg: "bg-amber-50/70 border-amber-200/60 text-amber-700",
                badgeBg: "bg-amber-100 text-amber-800 border-amber-200/50",
                dot: "bg-amber-500",
                icon: Clock
            },
            APPROVED: {
                bg: "bg-blue-50/70 border-blue-200/60 text-brand-blue",
                badgeBg: "bg-blue-100 text-blue-800 border-blue-200/50",
                dot: "bg-blue-500",
                icon: CheckCircle
            },
            ISSUED: {
                bg: "bg-emerald-50/70 border-emerald-200/60 text-brand-green",
                badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200/50",
                dot: "bg-emerald-500",
                icon: ShieldCheck
            },
            CANCELLED: {
                bg: "bg-slate-50/75 border-slate-200 text-slate-500",
                badgeBg: "bg-slate-100 text-slate-650 border-slate-200/50",
                dot: "bg-slate-400",
                icon: XCircle
            },
        };
        return configs[status as keyof typeof configs] || configs.PENDING;
    };

    if (status === "loading" || loading) {
        return (
            <div className="space-y-8 pb-12 font-sans bg-transparent">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-60 rounded-xl" />
                        <Skeleton className="h-4 w-80 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>

                {/* Filter Controls skeleton */}
                <div className="bg-white/80 border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Skeleton className="h-10 w-full sm:max-w-xs rounded-xl" />
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>

                {/* Grid of Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-[260px] flex flex-col justify-between shadow-sm">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4.5 w-32 rounded-md" />
                                    <Skeleton className="h-5.5 w-20 rounded-md" />
                                </div>
                                <Skeleton className="h-5 w-44 rounded-md" />
                                <div className="space-y-1.5 pt-2">
                                    <Skeleton className="h-3 w-full rounded-md" />
                                    <Skeleton className="h-3 w-full rounded-md" />
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16 rounded-md" />
                                    <Skeleton className="h-4.5 w-24 rounded-md" />
                                </div>
                                <Skeleton className="h-8.5 w-24 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden pb-12">
            {/* Background glowing blurred design layers */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Cargo Insurance Proposals
                            </h1>
                            <p className="text-xs sm:text-sm font-semibold text-slate-550 mt-1">
                                {session?.user?.role === "INSURER"
                                    ? "Verify and manage cargo proposals submitted to your policy queues"
                                    : "Manage, track and verify your marine cargo insurance requests"}
                            </p>
                        </div>
                        {session?.user?.role !== "INSURER" && (
                            <Link
                                href="/dashboard/orders/create"
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-green text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-brand-green/95 transition-all shadow-md shadow-brand-green/20 hover:shadow-lg active:scale-98 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                New Proposal
                            </Link>
                        )}
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                        {/* Total Card */}
                        <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/30 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-slate-100 text-slate-650 transition-transform group-hover:scale-110">
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    Total proposals
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Total Orders
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {orders.length}
                                </p>
                            </div>
                        </div>

                        {/* Pending Card */}
                        <div className="bg-white/80 border border-amber-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-amber-100/20 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-105 text-amber-700 rounded-md">
                                    Awaiting Review
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Pending Approval
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {orders.filter(o => o.status === "PENDING").length}
                                </p>
                            </div>
                        </div>

                        {/* Approved Card */}
                        <div className="bg-white/80 border border-blue-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-blue-100/20 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-blue-100 text-brand-blue transition-transform group-hover:scale-110">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-105 text-blue-700 rounded-md">
                                    Ready to Issue
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Approved Proposals
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {orders.filter(o => o.status === "APPROVED").length}
                                </p>
                            </div>
                        </div>

                        {/* Issued Card */}
                        <div className="bg-white/80 border border-emerald-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-emerald-100/20 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-emerald-100 text-brand-green transition-transform group-hover:scale-110">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-105 text-emerald-700 rounded-md">
                                    Policies Active
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Issued Cover Notes
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {orders.filter(o => o.status === "ISSUED").length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Controls Panel */}
                    <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all duration-300">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by cargo description, policy clauses, coverage basis..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-55/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                />
                            </div>

                            {/* Options block */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                                {/* Sort Dropdown */}
                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 bg-slate-55/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
                                    >
                                        <option value="newest">Sort: Newest First</option>
                                        <option value="oldest">Sort: Oldest First</option>
                                        <option value="highest">Value: High to Low</option>
                                        <option value="lowest">Value: Low to High</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550 pointer-events-none" />
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={cn(
                                            "p-2 rounded-lg transition-all cursor-pointer",
                                            viewMode === "grid"
                                                ? "bg-white text-brand-green shadow-sm"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                        title="Grid view"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "p-2 rounded-lg transition-all cursor-pointer",
                                            viewMode === "list"
                                                ? "bg-white text-brand-green shadow-sm"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                        title="List view"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                            {statusFilters.map((filter) => {
                                const isActive = activeStatus === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveStatus(filter.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer border",
                                            isActive
                                                ? "bg-brand-green text-white border-brand-green shadow-sm shadow-brand-green/10"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <span>{filter.label}</span>
                                        <span className={cn(
                                            "text-[10px] font-extrabold px-1.5 py-0.5 rounded-md",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-200/70 text-slate-500"
                                        )}>
                                            {filter.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Orders Content */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/20" />
                        <div className="max-w-md mx-auto relative z-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-200">
                                <Package className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-2">
                                {orders.length === 0 ? "No Proposals Yet" : "No Matching Proposals"}
                            </h3>
                            <p className="text-xs text-slate-500 mb-6 font-semibold">
                                {orders.length === 0
                                    ? "Create your first cargo insurance request to start tracking coverage"
                                    : "Try adjusting your filter parameters or search queries"}
                            </p>
                            {orders.length === 0 && (
                                <Link
                                    href="/dashboard/orders/create"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-brand-green/90 transition-all shadow-sm"
                                >
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                    New Order
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <div
                                            key={order.id}
                                            className="bg-white/90 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-green/20 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                                        >
                                            {/* Glow overlay */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

                                            {/* Card Top / Details */}
                                            <div className="p-6">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-5 h-5 text-slate-650" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-black text-slate-900 text-sm tracking-tight truncate group-hover:text-brand-green transition-colors">
                                                                {order.cargoDescription}
                                                            </h3>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                                ID: {order.id.slice(0, 8)}...
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border",
                                                        statusConfig.bg
                                                    )}>
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                                                        <span>{order.status}</span>
                                                    </div>
                                                </div>

                                                {/* Routing Visualizer */}
                                                {order.originPort && order.destinationPort && (
                                                    <div className="flex items-center justify-between bg-slate-55/60 border border-slate-200/40 rounded-xl p-3 mb-4">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Origin</span>
                                                            <span className="text-xs font-extrabold text-slate-800 truncate">{order.originPort}</span>
                                                        </div>
                                                        <div className="flex-1 flex items-center justify-center px-3">
                                                            <div className="w-full flex items-center justify-between relative">
                                                                <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-slate-200 -translate-y-1/2" />
                                                                <MapPin className="w-3.5 h-3.5 text-slate-350 relative z-10 bg-white px-0.5" />
                                                                <ArrowRight className="w-3 h-3 text-brand-green relative z-10 bg-white px-0.5" />
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400 relative z-10 bg-white px-0.5" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col min-w-0 items-end">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Destination</span>
                                                            <span className="text-xs font-extrabold text-slate-800 truncate">{order.destinationPort}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Policy Clauses & Invoicing Tags */}
                                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200/50 text-slate-700 rounded-lg text-[10px] font-bold">
                                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                        {order.policy?.name} ({order.policy?.clauseType})
                                                    </span>
                                                    {order.invoice && (
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                                                            order.invoice.status === 'PAID'
                                                                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100'
                                                                : 'bg-amber-50/80 text-amber-700 border-amber-105'
                                                        )}>
                                                            <FileText className="w-3.5 h-3.5" />
                                                            Invoice: {order.invoice.status}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Value details */}
                                                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sum Insured</span>
                                                        <p className="text-xl font-black text-slate-900 mt-0.5">
                                                            {order.currency || "USD"} {order.sumInsured?.toLocaleString() ?? "0.00"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Created Date</span>
                                                        <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Actions */}
                                            <div className="px-6 pb-6 pt-0 flex gap-3">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-98 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Details
                                                </Link>
                                                {order.invoice && (
                                                    <Link
                                                        href={`/dashboard/invoices/${order.invoice.id}`}
                                                        className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-98 cursor-pointer shadow-md shadow-brand-green/10"
                                                        title="View Invoice Detail"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === "list" && (
                            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                                {/* Mobile View (Stacked Cards) */}
                                <div className="block lg:hidden divide-y divide-slate-100">
                                    {filteredOrders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);

                                        return (
                                            <div key={order.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-4.5 h-4.5 text-slate-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                                                {order.cargoDescription}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{order.policy?.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-bold border",
                                                        statusConfig.bg
                                                    )}>
                                                        <span className={cn("w-1 h-1 rounded-full", statusConfig.dot)} />
                                                        <span>{order.status}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-4 bg-slate-55/40 p-2.5 rounded-lg border border-slate-200/30">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sum Insured</p>
                                                        <p className="text-base font-black text-slate-900">
                                                            {order.currency || "USD"} {order.sumInsured?.toLocaleString() ?? "0.00"}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200/50 text-slate-700 rounded-lg text-[9px] font-bold">
                                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                        {order.policy?.clauseType}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/orders/${order.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer border border-slate-200/40"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </Link>
                                                    {order.invoice && (
                                                        <Link
                                                            href={`/dashboard/invoices/${order.invoice.id}`}
                                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-green hover:bg-brand-green/90 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
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
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/70 border-b border-slate-200/80">
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Proposal Description
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Coverage Clauses
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Sum Insured
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Created Date
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 tracking-widest text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredOrders.map((order) => {
                                                const statusConfig = getStatusConfig(order.status);

                                                return (
                                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                                    <Package className="w-4.5 h-4.5 text-slate-650" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-brand-green transition-colors">
                                                                        {order.cargoDescription}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                                        {order.policy?.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border",
                                                                statusConfig.bg
                                                            )}>
                                                                <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                                                                <span>{order.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/50 text-slate-700 rounded-lg text-[10px] font-bold">
                                                                <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                                {order.policy?.clauseType}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-extrabold text-slate-900 text-sm">
                                                                {order.currency || "USD"} {order.sumInsured?.toLocaleString() ?? "0.00"}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-xs text-slate-650 font-semibold flex items-center gap-1.5">
                                                                <Calendar className="w-4 h-4 text-slate-400" />
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
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                                                                >
                                                                    View Details
                                                                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                                                                </Link>
                                                                {order.invoice && (
                                                                    <Link
                                                                        href={`/dashboard/invoices/${order.invoice.id}`}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-green text-white rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-green/90 transition-all shadow-sm shadow-brand-green/10"
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 font-semibold">
                                Showing <span className="font-bold text-slate-900">{filteredOrders.length}</span> of{" "}
                                <span className="font-bold text-slate-900">{orders.length}</span> orders
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs text-brand-green font-extrabold uppercase tracking-widest hover:underline cursor-pointer"
                                >
                                    Clear search filters
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}