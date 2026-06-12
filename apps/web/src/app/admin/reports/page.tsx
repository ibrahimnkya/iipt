"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    BarChart3,
    TrendingUp,
    Wallet,
    Package,
    FileText,
    Users,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock,
    ShieldCheck,
    RefreshCw,
    CheckCircle,
    XCircle,
    Anchor,
    Truck,
    Plane,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportStats {
    totalOrders: number;
    totalInvoices: number;
    totalRevenue: number;
    totalUsers: number;
    pendingOrders: number;
    paidInvoices: number;
    paidOrders: number;
    marineCargo: number;
    roadCargo: number;
    airCargo: number;
}

export default function AdminReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<ReportStats>({
        totalOrders: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        totalUsers: 0,
        pendingOrders: 0,
        paidInvoices: 0,
        paidOrders: 0,
        marineCargo: 0,
        roadCargo: 0,
        airCargo: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState("30days");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetchStats();
        }
    }, [session]);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/reports");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                console.warn("Failed to fetch reports from /api/admin/reports");
                setError("Failed to load system reports from the remote REST API.");
            }
        } catch (err) {
            console.warn("Error fetching reports:", err);
            setError("Could not connect to the reports API. Please check your network connection.");
        } finally {
            setLoading(false);
        }
    };

    const conversionRate = stats.totalInvoices > 0
        ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)
        : "0.0";

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Admin - System Analytics
                            </h1>
                            <p className="text-sm text-gray-600">
                                Performance metrics and business intelligence
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchStats}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm">
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-200 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-red-900">API Connection Issue</p>
                                    <p className="text-xs text-red-600">{error}</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchStats}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}

                    {/* Period Selector */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 mr-3">Period:</span>
                            <div className="flex gap-2">
                                {[
                                    { id: "7days", label: "Last 7 Days" },
                                    { id: "30days", label: "Last 30 Days" },
                                    { id: "90days", label: "Last 90 Days" },
                                    { id: "year", label: "This Year" }
                                ].map((period) => (
                                    <button
                                        key={period.id}
                                        onClick={() => setSelectedPeriod(period.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                            selectedPeriod === period.id
                                                ? "bg-brand-green text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* High-Performance Metric Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                label: "Total Revenue",
                                value: `TZS ${(stats.totalRevenue / 1000000).toFixed(2)}M`,
                                trend: "+12.5%",
                                positive: true,
                                icon: Wallet,
                                bg: "bg-emerald-50",
                                iconBg: "bg-emerald-100",
                                iconColor: "text-emerald-600",
                                textColor: "text-emerald-900"
                            },
                            {
                                label: "Conversion Rate",
                                value: `${conversionRate}%`,
                                trend: "+4.2%",
                                positive: true,
                                icon: Activity,
                                bg: "bg-blue-50",
                                iconBg: "bg-blue-100",
                                iconColor: "text-blue-600",
                                textColor: "text-blue-900"
                            },
                            {
                                label: "Active Users",
                                value: stats.totalUsers,
                                trend: "+2 new",
                                positive: true,
                                icon: Users,
                                bg: "bg-purple-50",
                                iconBg: "bg-purple-100",
                                iconColor: "text-purple-600",
                                textColor: "text-purple-900"
                            },
                            {
                                label: "Total Orders",
                                value: stats.totalOrders,
                                trend: "+8.1%",
                                positive: true,
                                icon: Package,
                                bg: "bg-amber-50",
                                iconBg: "bg-amber-100",
                                iconColor: "text-amber-600",
                                textColor: "text-amber-900"
                            },
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className={cn("rounded-lg border border-gray-200 p-4", stat.bg)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.iconBg)}>
                                            <Icon className={cn("w-5 h-5", stat.iconColor)} />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold",
                                            stat.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
                                    <p className={cn("text-2xl font-bold", stat.textColor)}>{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Trends & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Financial Performance Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Financial Performance</h2>
                                <p className="text-sm text-gray-500 mt-1">Revenue trends over time</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div>
                                    <span className="text-xs font-medium text-gray-600">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-medium text-gray-600">Target</span>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-[300px] border-b border-l border-gray-100 relative flex items-end justify-between px-2 pb-2">
                            {/* Mock Graph Bars */}
                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="group relative flex flex-col items-center gap-2 w-full max-w-[60px]">
                                    <div className="absolute -top-10 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        TZS {(h * 1.2).toFixed(1)}M
                                    </div>
                                    <div className="w-full bg-gray-50 rounded-t-lg relative" style={{ height: '240px' }}>
                                        <div
                                            className="w-full bg-brand-green rounded-t-lg absolute bottom-0 transition-all duration-700 group-hover:bg-brand-green/80"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">W{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-5">
                            {[
                                { title: "New order created", time: "2 mins ago", type: "success", msg: "Order #ORD-8801" },
                                { title: "Invoice paid", time: "1 hr ago", type: "success", msg: "Invoice #INV-2401" },
                                { title: "Payment failed", time: "3 hrs ago", type: "error", msg: "Insufficient balance" },
                                { title: "New user registered", time: "5 hrs ago", type: "info", msg: "John Doe" },
                                { title: "Policy activated", time: "Yesterday", type: "success", msg: "Marine Cargo ICC(A)" },
                            ].map((act, i) => (
                                <div key={i} className="flex gap-3 relative">
                                    {i !== 4 && <div className="absolute left-[7px] top-6 bottom-0 w-[1px] bg-gray-100"></div>}
                                    <div className={cn(
                                        "w-3.5 h-3.5 rounded-full mt-0.5 border-2 border-white flex-shrink-0",
                                        act.type === "success" ? "bg-emerald-500" :
                                            act.type === "error" ? "bg-red-500" : "bg-blue-500"
                                    )}></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">{act.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{act.msg}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {act.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all">
                            View All Activity
                        </button>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cargo Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Cargo Distribution</h3>
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    label: "Marine Cargo",
                                    val: stats.totalOrders > 0 ? Math.round((stats.marineCargo / stats.totalOrders) * 100) : 0,
                                    color: "bg-blue-500",
                                    icon: Anchor
                                },
                                {
                                    label: "Road Cargo",
                                    val: stats.totalOrders > 0 ? Math.round((stats.roadCargo / stats.totalOrders) * 100) : 0,
                                    color: "bg-orange-500",
                                    icon: Truck
                                },
                                {
                                    label: "Air Cargo",
                                    val: stats.totalOrders > 0 ? Math.round((stats.airCargo / stats.totalOrders) * 100) : 0,
                                    color: "bg-purple-500",
                                    icon: Plane
                                },
                            ].map((c, i) => {
                                const Icon = c.icon;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-gray-500" />
                                                <span>{c.label}</span>
                                            </div>
                                            <span>{c.val}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", c.color)}
                                                style={{ width: `${c.val}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Status Overview */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                            <ShieldCheck className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {/* Total Orders */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Total Orders</p>
                                        <p className="text-xs text-gray-500">All time orders</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    {stats.totalOrders}
                                </span>
                            </div>

                            {/* Pending Orders */}
                            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Pending</p>
                                        <p className="text-xs text-gray-500">Awaiting processing</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-amber-900">
                                    {stats.pendingOrders}
                                </span>
                            </div>

                            {/* Paid Orders */}
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Paid</p>
                                        <p className="text-xs text-gray-500">Completed payments</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-emerald-900">
                                    {stats.paidOrders}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}