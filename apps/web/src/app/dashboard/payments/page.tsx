"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    CreditCard,
    Clock,
    CheckCircle,
    Search,
    ChevronDown,
    Calendar,
    DollarSign,
    Eye,
    ArrowUpRight,
    Receipt,
    LayoutGrid,
    List,
    Package,
    XCircle,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
                (payment.invoice?.order?.cargoDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (payment.method || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (payment.id || "").toLowerCase().includes(searchQuery.toLowerCase());
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
                bg: "bg-amber-50/70 border-amber-200/60 text-amber-700",
                dot: "bg-amber-500",
                icon: Clock
            },
            SUCCESS: {
                bg: "bg-emerald-50/70 border-emerald-200/60 text-brand-green",
                dot: "bg-emerald-500",
                icon: CheckCircle
            },
            COMPLETED: { // Kept for backward compatibility if needed
                bg: "bg-emerald-50/70 border-emerald-200/60 text-brand-green",
                dot: "bg-emerald-500",
                icon: CheckCircle
            },
            FAILED: {
                bg: "bg-rose-50/70 border-rose-200/60 text-rose-700",
                dot: "bg-rose-550",
                icon: XCircle
            },
        };
        return configs[status as keyof typeof configs] || configs.PENDING;
    };

    const getMethodIcon = (method: string) => {
        const methodLower = (method || "").toLowerCase();
        if (methodLower.includes("mpesa") || methodLower.includes("m-pesa")) {
            return { icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50 border border-emerald-100/50" };
        }
        if (methodLower.includes("airtel")) {
            return { icon: Wallet, color: "text-rose-600", bg: "bg-rose-50 border border-rose-100/50" };
        }
        if (methodLower.includes("tigo") || methodLower.includes("yas")) {
            return { icon: Wallet, color: "text-blue-600", bg: "bg-blue-50 border border-blue-100/50" };
        }
        return { icon: CreditCard, color: "text-slate-600", bg: "bg-slate-55 border border-slate-200/50" };
    };

    if (status === "loading" || loading) {
        return (
            <div className="space-y-8 pb-12 font-sans bg-transparent">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-60 rounded-xl" />
                        <Skeleton className="h-4 w-96 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>

                {/* Stats Cards Grid skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 h-32 flex flex-col justify-between shadow-sm">
                            <div className="flex justify-between items-center">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="w-16 h-5 rounded-md" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-20 rounded-md" />
                                <Skeleton className="h-6 w-24 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Controls Panel skeleton */}
                <div className="bg-white/85 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                        <Skeleton className="h-10 w-full lg:max-w-md rounded-xl" />
                        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                            <Skeleton className="h-10 w-36 rounded-xl" />
                            <Skeleton className="h-10 w-20 rounded-xl" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-8 w-20 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Grid View skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-48 rounded" />
                                        <Skeleton className="h-3 w-32 rounded" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-xl" />
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                                <Skeleton className="h-3 w-24 rounded" />
                                <Skeleton className="h-6 w-36 rounded" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3.5 w-40 rounded" />
                                <Skeleton className="h-3.5 w-48 rounded" />
                            </div>
                            <Skeleton className="h-10 w-full rounded-xl" />
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
                                Payments History
                            </h1>
                            <p className="text-xs sm:text-sm font-semibold text-slate-550 mt-1">
                                View and manage your payment history for premium coverages
                            </p>
                        </div>
                        <Link
                            href="/dashboard/invoices"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-slate-200 active:scale-98 shadow-sm cursor-pointer"
                        >
                            <Receipt className="w-4 h-4 text-slate-500" />
                            View Invoices
                        </Link>
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                        {/* Total Card */}
                        <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/30 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-slate-100 text-slate-650 transition-transform group-hover:scale-110">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    Total Transactions
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Total Payments
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {stats.total}
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
                                    Awaiting Settlement
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Pending Transactions
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {stats.pending}
                                </p>
                            </div>
                        </div>

                        {/* Completed Card */}
                        <div className="bg-white/80 border border-emerald-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-emerald-100/20 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-emerald-100 text-brand-green transition-transform group-hover:scale-110">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-105 text-emerald-700 rounded-md">
                                    Succeeded
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Completed Payments
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {stats.completed}
                                </p>
                            </div>
                        </div>

                        {/* Outstanding Amount Card */}
                        <div className="bg-white/80 border border-slate-200/85 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 to-rose-100/20 opacity-30 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-slate-100 text-slate-655 transition-transform group-hover:scale-110">
                                    <Wallet className="w-5 h-5 text-slate-600" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-150 text-slate-600 rounded-md">
                                    Paid Premium Sum
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Total Paid
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    Tsh {stats.totalAmount.toLocaleString()}
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
                                    placeholder="Search by cargo description, payment method, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                />
                            </div>

                            {/* Options Block */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                                {/* Sort Dropdown */}
                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
                                    >
                                        <option value="newest">Sort: Newest First</option>
                                        <option value="oldest">Sort: Oldest First</option>
                                        <option value="highest">Amount: High to Low</option>
                                        <option value="lowest">Amount: Low to High</option>
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
                                                : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
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

                {/* Payments Content */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/20" />
                        <div className="max-w-md mx-auto relative z-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-200">
                                <CreditCard className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-2">
                                {payments.length === 0 ? "No Payments Yet" : "No Matching Payments"}
                            </h3>
                            <p className="text-xs text-slate-550 mb-6 font-semibold">
                                {payments.length === 0
                                    ? "Your payment history will appear here after you settle cargo invoices"
                                    : "Try adjusting your filters or search query"}
                            </p>
                            {payments.length === 0 && (
                                <Link
                                    href="/dashboard/invoices"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-brand-green/90 transition-all shadow-sm"
                                >
                                    <Receipt className="w-4 h-4 stroke-[3]" />
                                    View Invoices
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredPayments.map((payment) => {
                                    const statusConfig = getStatusConfig(payment.status);
                                    const methodConfig = getMethodIcon(payment.method);
                                    const MethodIcon = methodConfig.icon;

                                    return (
                                        <div
                                            key={payment.id}
                                            className="bg-white/90 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-green/20 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                                        >
                                            {/* Glow Overlay */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

                                            {/* Card Header */}
                                            <div className="p-6 border-b border-slate-100">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105",
                                                            methodConfig.bg
                                                        )}>
                                                            <MethodIcon className={cn("w-5 h-5", methodConfig.color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-black text-slate-900 text-sm tracking-tight truncate group-hover:text-brand-green transition-colors">
                                                                {payment.invoice?.order?.cargoDescription}
                                                            </h3>
                                                            <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                                                                Payment Method: {payment.method}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border flex-shrink-0",
                                                        statusConfig.bg
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                                                        <span>{payment.status}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    {/* Amount Widget */}
                                                    <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 mb-4">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Succeeded</p>
                                                        <p className="text-2xl font-black text-slate-900 mt-0.5">
                                                            {payment.invoice?.order?.currency} {payment.amount.toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* Meta Info */}
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                                                            <Calendar className="w-4 h-4 text-slate-400" />
                                                            <span>
                                                                Paid At: {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-550 font-semibold">
                                                            <Receipt className="w-4 h-4 text-slate-400" />
                                                            <span className="truncate">
                                                                Invoice ID: {payment.invoice?.id?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        {payment.invoice?.order?.id && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-550 font-semibold">
                                                                <Package className="w-4 h-4 text-slate-400" />
                                                                <span className="truncate">
                                                                    Linked Proposal ID: {payment.invoice.order.id.slice(0, 8)}...
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/invoices/${payment.invoice?.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-98 cursor-pointer"
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
                            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                                {/* Mobile List View */}
                                <div className="block lg:hidden divide-y divide-slate-100">
                                    {filteredPayments.map((payment) => {
                                        const statusConfig = getStatusConfig(payment.status);
                                        const methodConfig = getMethodIcon(payment.method);
                                        const MethodIcon = methodConfig.icon;

                                        return (
                                            <div key={payment.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className={cn(
                                                            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border",
                                                            methodConfig.bg
                                                        )}>
                                                            <MethodIcon className={cn("w-4.5 h-4.5", methodConfig.color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                                                {payment.invoice?.order?.cargoDescription}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-550 font-bold truncate mt-0.5">
                                                                {payment.method}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-bold border",
                                                        statusConfig.bg
                                                    )}>
                                                        <span className={cn("w-1 h-1 rounded-full", statusConfig.dot)} />
                                                        <span>{payment.status}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200/30">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid</p>
                                                        <p className="text-base font-black text-slate-900">
                                                            {payment.invoice?.order?.currency} {payment.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                                                        <p className="text-xs font-extrabold text-slate-700 mt-1">
                                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/invoices/${payment.invoice?.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer border border-slate-200/40"
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
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/70 border-b border-slate-200/80">
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Description
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Method
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Amount Succeeded
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Date Paid
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 tracking-widest text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredPayments.map((payment) => {
                                                const statusConfig = getStatusConfig(payment.status);
                                                const methodConfig = getMethodIcon(payment.method);
                                                const MethodIcon = methodConfig.icon;

                                                return (
                                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105",
                                                                    methodConfig.bg
                                                                )}>
                                                                    <MethodIcon className={cn("w-4.5 h-4.5", methodConfig.color)} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-brand-green transition-colors">
                                                                        {payment.invoice?.order?.cargoDescription}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                                                                        Transaction ID: {payment.id.toUpperCase()}
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
                                                                <span>{payment.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-bold text-slate-700">
                                                                {payment.method}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-black text-slate-900 text-sm tracking-tight">
                                                                {payment.invoice?.order?.currency} {payment.amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-semibold text-slate-600">
                                                                {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Link
                                                                href={`/dashboard/invoices/${payment.invoice?.id}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                                                            >
                                                                View Invoice
                                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                                            </Link>
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
                            <p className="text-xs font-semibold text-slate-550">
                                Showing <span className="font-black text-slate-900">{filteredPayments.length}</span> of{" "}
                                <span className="font-black text-slate-900">{payments.length}</span> transaction records
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs font-extrabold text-brand-green hover:underline cursor-pointer"
                                >
                                    Clear search query
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}