"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    Shield,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowRight,
    Plus,
    FileText,
    Wallet,
    CheckCircle2,
    Activity,
    Check,
    X,
    Loader2,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Recharts components for analytics
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

export function InsurerDashboardView() {
    const { data: session } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        policies: { total: 0, active: 0 },
        orders: { total: 0, pending: 0 },
        revenue: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes] = await Promise.all([
                fetch("/api/insurer/stats"),
                fetch("/api/insurer/orders")
            ]);

            if (statsRes.ok && ordersRes.ok) {
                const statsData = await statsRes.json();
                const ordersData = await ordersRes.json();

                setStats(statsData);
                setRecentOrders(ordersData);
            }
        } catch (error) {
            console.error("Failed to fetch insurer data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Quick Order Approval handler
    const handleQuickApprove = async (orderId: string, orderNum: string) => {
        try {
            setApprovingId(orderId);
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: "APPROVED" })
            });

            if (res.ok) {
                toast.success(`Proposal Approved`, {
                    description: `Order #${orderNum || orderId.slice(-4)} has been successfully approved. TIRA Cover Note generated.`
                });
                
                // Refresh local states
                setRecentOrders(prev => 
                    prev.map(o => o.id === orderId ? { ...o, status: "APPROVED" } : o)
                );
                setStats(prev => ({
                    ...prev,
                    orders: {
                        ...prev.orders,
                        pending: Math.max(0, prev.orders.pending - 1)
                    }
                }));
            } else {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to approve proposal");
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Approval Failed", {
                description: error.message || "An unexpected error occurred."
            });
        } finally {
            setApprovingId(null);
        }
    };

    // Insurer Analytics Area Chart dataset (mocked realistically based on total revenue)
    const revenueChartData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        
        // Base growth scale
        const premiumScale = stats.revenue > 0 ? stats.revenue / 15 : 450000;
        
        return months.map((m, idx) => ({
            name: m,
            revenue: Math.round(premiumScale * (idx + 1) * (1 + (Math.sin(idx) * 0.15))),
            policies: idx + 2
        }));
    }, [stats.revenue]);

    // Pending proposals list (Action Queue)
    const pendingProposals = useMemo(() => {
        return recentOrders.filter(o => o.status === "PENDING").slice(0, 3);
    }, [recentOrders]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Compiling Insurer Records...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Campaigns",
            value: stats.policies.total,
            icon: Shield,
            bgColor: "from-blue-50/80 to-blue-100/30",
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100",
            borderColor: "border-blue-100",
            subText: `${stats.policies.active} Active Campaign Contracts`,
            sparklineColor: "#2563eb",
            points: "0,15 15,10 30,22 45,5 60,18 75,3 90,12"
        },
        {
            title: "Cargo Orders",
            value: stats.orders.total,
            icon: Package,
            bgColor: "from-amber-50/80 to-amber-100/30",
            iconColor: "text-amber-600",
            iconBg: "bg-amber-100",
            borderColor: "border-amber-100",
            subText: `${stats.orders.pending} Pending Review`,
            sparklineColor: "#d97706",
            points: "0,20 15,18 30,15 45,12 60,20 75,15 90,10"
        },
        {
            title: "Verified Revenue",
            value: `Tsh ${Math.round(stats.revenue).toLocaleString()}`,
            icon: Wallet,
            bgColor: "from-emerald-55 to-emerald-100/30",
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
            borderColor: "border-emerald-100",
            subText: "Total Collected Premium",
            sparklineColor: "#3da44e",
            points: "0,20 15,14 30,10 45,22 60,8 75,5 90,2"
        },
    ];

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Insurer Portfolio Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-blue animate-pulse" />
                        Performance analytics, contract campaigns, and pending custom approvals.
                    </p>
                </div>
                <Link
                    href="/dashboard/policies/create"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-lg active:scale-98 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className={cn(
                                "bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300 relative group overflow-hidden flex flex-col justify-between min-h-[140px]",
                                card.borderColor
                            )}
                        >
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none", card.bgColor)} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className={cn("rounded-xl p-2.5 transition-transform group-hover:scale-110", card.iconBg)}>
                                    <Icon className={cn("w-5 h-5", card.iconColor)} />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-150 text-gray-600 rounded-md">
                                    {card.subText}
                                </span>
                            </div>

                            <div className="mt-4 flex items-end justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                        {card.title}
                                    </p>
                                    <p className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                                        {card.value}
                                    </p>
                                </div>

                                <div className="w-24 h-10 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-full h-full" viewBox="0 0 90 30">
                                        <path
                                            d={card.points}
                                            fill="none"
                                            stroke={card.sparklineColor}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTION QUEUE & ANALYTICS DOUBLE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Revenue Analytics chart (col-span-2) */}
                <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-[360px]">
                    <div>
                        <h2 className="text-base font-black text-gray-900 tracking-tight">Premium Revenue Performance</h2>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Monthly dynamic premium collection trajectory</p>
                    </div>

                    <div className="h-[260px] w-full flex items-center justify-center mt-4">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="insurerColorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e87d1" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#1e87d1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        formatter={(val: any) => [`TZS ${val?.toLocaleString() || '0'}`, "Revenue"]}
                                        contentStyle={{
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue (TZS)"
                                        stroke="#1e87d1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#insurerColorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full bg-gray-50/50 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Loading Analytics Dashboard...
                            </div>
                        )}
                    </div>
                </div>

                {/* Insurer Actions Queue (col-span-1) */}
                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div>
                                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider">Action Queue</h3>
                                <p className="text-[10px] text-gray-400 font-semibold leading-tight">Proposals awaiting approval</p>
                            </div>
                            {pendingProposals.length > 0 && (
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            )}
                        </div>

                        <div className="space-y-3">
                            {pendingProposals.length > 0 ? (
                                pendingProposals.map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-3 bg-gray-50 hover:bg-gray-100/70 border border-gray-150 rounded-xl transition-all relative group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 pr-2">
                                                <h4 className="text-[11px] font-black text-gray-950 truncate leading-snug">
                                                    Order #{order.orderNumber?.slice(-6) || order.id.slice(-6).toUpperCase()}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">
                                                    {order.user?.fullName} &bull; {order.policy?.name || 'Cargo Cover'}
                                                </p>
                                                <span className="text-[10px] text-brand-blue font-bold block mt-1">
                                                    {order.currency} {order.invoice?.amount?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            
                                            {/* Quick Approve Action */}
                                            <button
                                                onClick={() => handleQuickApprove(order.id, order.orderNumber || order.id.slice(-6).toUpperCase())}
                                                disabled={approvingId === order.id}
                                                className="px-2.5 py-1 bg-brand-blue text-white rounded-md text-[10px] font-bold tracking-tight hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer flex-shrink-0"
                                            >
                                                {approvingId === order.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                                    <p className="text-[11px] font-bold text-gray-900">All Proposals Processed</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Your review queue is currently empty.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Link
                        href="/dashboard/orders?filter=pending"
                        className="w-full mt-6 py-2.5 text-center text-[10px] font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/80 rounded-xl transition-all cursor-pointer block"
                    >
                        View Full Queue
                    </Link>
                </div>
            </div>

            {/* RECENT ORDERS TABLE LIST */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-gray-950 tracking-tight">Recent Cargo Declarations</h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">Policy Sales Ledger</p>
                    </div>
                    <Link
                        href="/dashboard/orders"
                        className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer group"
                    >
                        View All Declarations
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {recentOrders.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 group cursor-pointer"
                                onClick={() => router.push(`/dashboard/orders`)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-200 flex items-center justify-center text-gray-500 font-bold group-hover:text-brand-blue group-hover:border-brand-blue/30 transition-all flex-shrink-0">
                                        #{order.orderNumber?.slice(-4) || order.id.slice(-4).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-gray-900 truncate">
                                            {order.policy?.name || 'Marine Cargo Policy'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                            Importer: {order.user?.fullName} &bull; {new Date(order.createdAt).toLocaleDateString("en-GB")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-900">
                                            {order.currency} {order.invoice?.amount?.toLocaleString() || '0'}
                                        </p>
                                        <span className={cn(
                                            "inline-block text-[9px] font-black px-2 py-0.5 rounded uppercase mt-0.5 border",
                                            order.status === 'PENDING' && "bg-amber-50 text-amber-600 border-amber-100",
                                            order.status === 'APPROVED' && "bg-emerald-50 text-brand-green border-emerald-100",
                                            order.status === 'REJECTED' && "bg-red-50 text-red-650 border-red-100",
                                        )}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4.5 h-4.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-gray-550 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-350">
                            <Package className="w-6 h-6 opacity-45" />
                        </div>
                        <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest mb-1">No Declarations Registered</h3>
                        <p className="text-[11px] text-gray-500 font-semibold mb-4">No active or pending proposals have been assigned to your policy catalog.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
