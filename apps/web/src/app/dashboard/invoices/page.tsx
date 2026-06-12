"use client";

import { PaymentModal } from "@/components/payment/PaymentModal";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    FileText, 
    CreditCard, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Download, 
    Package,
    Search,
    Calendar,
    Wallet,
    Shield,
    Eye,
    Receipt,
    ChevronDown,
    LayoutGrid,
    List,
    Plus,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Invoice {
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
    paidAt: string | null;
    order: {
        id: string;
        cargoDescription: string;
        sumInsured: number;
        currency: string;
        policy: {
            name: string;
            clauseType: string;
        };
    };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function InvoicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [activeStatus, setActiveStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handlePayClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        fetchInvoices();
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchInvoices();
        }
    }, [session]);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/invoices");
            if (res.ok) {
                const data = await res.json();
                setInvoices(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { id: "all", label: "All", count: invoices.length },
        { id: "UNPAID", label: "Unpaid", count: invoices.filter(i => i.status === "UNPAID").length },
        { id: "PAID", label: "Paid", count: invoices.filter(i => i.status === "PAID").length },
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
                (invoice.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (invoice.order?.cargoDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (invoice.order?.policy?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
    );

    // Calculate statistics
    const stats = {
        total: invoices.length,
        unpaid: invoices.filter(i => i.status === "UNPAID").length,
        paid: invoices.filter(i => i.status === "PAID").length,
        unpaidAmount: invoices.filter(i => i.status === "UNPAID").reduce((sum, inv) => sum + inv.amount, 0),
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            UNPAID: {
                bg: "bg-amber-50/70 border-amber-200/60 text-amber-700",
                badgeBg: "bg-amber-100 text-amber-800 border-amber-200/50",
                dot: "bg-amber-500",
                icon: Clock
            },
            PAID: {
                bg: "bg-emerald-50/70 border-emerald-200/60 text-brand-green",
                badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200/50",
                dot: "bg-emerald-500",
                icon: CheckCircle
            },
            CANCELLED: {
                bg: "bg-slate-55 border-slate-200 text-slate-500",
                badgeBg: "bg-slate-100 text-slate-650 border-slate-200/50",
                dot: "bg-slate-400",
                icon: XCircle
            },
        };
        return configs[status as keyof typeof configs] || configs.UNPAID;
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

                {/* Table list skeleton */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="hidden lg:block overflow-x-auto">
                        <div className="p-6 border-b border-slate-200/80 bg-slate-50/70 flex justify-between">
                            <Skeleton className="h-4 w-48 rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        <div className="divide-y divide-slate-100 p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-9 h-9 rounded-lg" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-56 rounded" />
                                            <Skeleton className="h-3 w-32 rounded" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-28 rounded" />
                                    <Skeleton className="h-4 w-20 rounded" />
                                    <Skeleton className="h-8 w-28 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="block lg:hidden divide-y divide-slate-100 p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3 py-3">
                                <div className="flex justify-between">
                                    <div className="flex gap-2">
                                        <Skeleton className="w-8 h-8 rounded" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4.5 w-36 rounded" />
                                            <Skeleton className="h-3 w-16 rounded" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-5 w-16 rounded" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-8 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
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
                                Premium Invoices
                            </h1>
                            <p className="text-xs sm:text-sm font-semibold text-slate-550 mt-1">
                                Review, pay, and export billing invoices for your import cargo coverage notes
                            </p>
                        </div>
                        <Link
                            href="/dashboard/orders"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-slate-200 active:scale-98 shadow-sm cursor-pointer"
                        >
                            <Package className="w-4 h-4 text-slate-500" />
                            View Orders
                        </Link>
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                        {/* Total Card */}
                        <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/30 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-slate-100 text-slate-650 transition-transform group-hover:scale-110">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    Invoices Billed
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Total Invoices
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {stats.total}
                                </p>
                            </div>
                        </div>

                        {/* Unpaid Card */}
                        <div className="bg-white/80 border border-amber-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-amber-100/20 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-105 text-amber-700 rounded-md">
                                    Due Premium
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Unpaid Invoices
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {stats.unpaid}
                                </p>
                            </div>
                        </div>

                        {/* Paid Card */}
                        <div className="bg-white/80 border border-emerald-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-emerald-100/20 opacity-40 pointer-events-none" />
                            <div className="flex items-start justify-between relative z-10">
                                <div className="rounded-xl p-2.5 bg-emerald-100 text-brand-green transition-transform group-hover:scale-110">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-105 text-emerald-700 rounded-md">
                                    Payments Settled
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Paid Invoices
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {stats.paid}
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
                                    Outstanding Total
                                </span>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Outstanding Balance
                                </p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    Tsh {stats.unpaidAmount.toLocaleString()}
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
                                    placeholder="Search by invoice number, cargo description, or policy..."
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

                {/* Invoices Content */}
                {filteredInvoices.length === 0 ? (
                    <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/20" />
                        <div className="max-w-md mx-auto relative z-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-200">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-2">
                                {invoices.length === 0 ? "No Invoices Yet" : "No Matching Invoices"}
                            </h3>
                            <p className="text-xs text-slate-500 mb-6 font-semibold">
                                {invoices.length === 0
                                    ? "Billing statements will appear here after you create cargo proposals"
                                    : "Try adjusting your filter parameters or search queries"}
                            </p>
                            {invoices.length === 0 && (
                                <Link
                                    href="/dashboard/orders/create"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-brand-green/90 transition-all shadow-sm"
                                >
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                    Create Order
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredInvoices.map((invoice) => {
                                    const statusConfig = getStatusConfig(invoice.status);

                                    return (
                                        <div
                                            key={invoice.id}
                                            className="bg-white/90 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-green/20 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                                        >
                                            {/* Glow Overlay */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

                                            {/* Card Top Details */}
                                            <div className="p-6">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                                                            <Receipt className="w-5 h-5 text-slate-650" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-black text-slate-900 text-sm tracking-tight truncate group-hover:text-brand-green transition-colors">
                                                                Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                                                            </h3>
                                                            <p className="text-[10px] text-slate-550 font-bold truncate mt-0.5">
                                                                Cargo: {invoice.order?.cargoDescription}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border",
                                                        statusConfig.bg
                                                    )}>
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                                                        <span>{invoice.status}</span>
                                                    </div>
                                                </div>

                                                {/* Clauses info */}
                                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200/50 text-slate-700 rounded-lg text-[10px] font-bold">
                                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                        {invoice.order?.policy?.name} ({invoice.order?.policy?.clauseType})
                                                    </span>
                                                </div>

                                                {/* Amount Widget */}
                                                <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 mb-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Premium Due</p>
                                                        <p className="text-xl font-black text-slate-900 mt-0.5">
                                                            {invoice.order?.currency || "USD"} {invoice.amount?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cargo Sum Insured</p>
                                                        <p className="text-xs font-extrabold text-slate-700 mt-1">
                                                            {invoice.order?.currency || "USD"} {invoice.order?.sumInsured?.toLocaleString() ?? "0.00"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="space-y-2 mb-4 border-t border-slate-100 pt-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        <span>
                                                            Issued: {new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {invoice.paidAt && (
                                                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>
                                                                Paid: {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-slate-550 font-semibold">
                                                        <Package className="w-4 h-4 text-slate-400" />
                                                        <span>
                                                            Linked Proposal ID: {invoice.order?.id.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Bottom Actions */}
                                            <div className="px-6 pb-6 pt-0 flex gap-3">
                                                {invoice.status === "UNPAID" ? (
                                                    <button
                                                        onClick={() => handlePayClick(invoice)}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-green hover:bg-brand-green/95 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-98 cursor-pointer shadow-md shadow-brand-green/10"
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        Pay Invoice
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={`/dashboard/invoices/${invoice.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-98 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View Details
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/admin/invoices/${invoice.id}/print`}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-98 cursor-pointer"
                                                    title="Print Invoice"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Link>
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
                                    {filteredInvoices.map((invoice) => {
                                        const statusConfig = getStatusConfig(invoice.status);

                                        return (
                                            <div key={invoice.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Receipt className="w-4.5 h-4.5 text-slate-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                                                Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                                                                {invoice.order?.cargoDescription}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-bold border",
                                                        statusConfig.bg
                                                    )}>
                                                        <span className={cn("w-1 h-1 rounded-full", statusConfig.dot)} />
                                                        <span>{invoice.status}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200/30">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                                                        <p className="text-base font-black text-slate-900">
                                                            {invoice.order?.currency || "USD"} {invoice.amount?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200/50 text-slate-700 rounded-lg text-[9px] font-bold">
                                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                        {invoice.order?.policy?.clauseType}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {invoice.status === "UNPAID" ? (
                                                        <button
                                                            onClick={() => handlePayClick(invoice)}
                                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-green hover:bg-brand-green/90 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                            Pay
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={`/dashboard/invoices/${invoice.id}`}
                                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer border border-slate-200/40"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={`/admin/invoices/${invoice.id}/print`}
                                                        target="_blank"
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer border border-slate-200/40"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        PDF
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
                                                    Invoice Number
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Coverage
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Amount Billed
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    Issued Date
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 tracking-widest text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredInvoices.map((invoice) => {
                                                const statusConfig = getStatusConfig(invoice.status);

                                                return (
                                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                                    <Receipt className="w-4.5 h-4.5 text-slate-650" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-brand-green transition-colors">
                                                                        Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 font-bold truncate max-w-xs mt-0.5">
                                                                        {invoice.order?.cargoDescription}
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
                                                                <span>{invoice.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/50 text-slate-700 rounded-lg text-[10px] font-bold">
                                                                <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                                {invoice.order?.policy?.clauseType}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-extrabold text-slate-900 text-sm">
                                                                {invoice.order?.currency || "USD"} {invoice.amount?.toLocaleString()}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-xs text-slate-650 font-semibold flex items-center gap-1.5">
                                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                                {new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {invoice.status === "UNPAID" && (
                                                                    <button
                                                                        onClick={() => handlePayClick(invoice)}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-green text-white rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-green/90 transition-all shadow-sm shadow-brand-green/10 cursor-pointer"
                                                                    >
                                                                        Pay Now
                                                                    </button>
                                                                )}
                                                                <Link
                                                                    href={`/dashboard/invoices/${invoice.id}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                                                                >
                                                                    View
                                                                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                                                                </Link>
                                                                <Link
                                                                    href={`/admin/invoices/${invoice.id}/print`}
                                                                    target="_blank"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all border border-transparent hover:border-slate-200"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 font-semibold">
                                Showing <span className="font-bold text-slate-900">{filteredInvoices.length}</span> of{" "}
                                <span className="font-bold text-slate-900">{invoices.length}</span> invoices
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

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                invoice={selectedInvoice ? {
                    id: selectedInvoice.id,
                    amount: selectedInvoice.amount,
                    currency: selectedInvoice.order?.currency || "USD"
                } : null}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}