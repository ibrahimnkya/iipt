"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Ship,
    Plane,
    Truck,
    Wallet,
    TrendingUp,
    TrendingDown,
    Package,
    ArrowRight,
    Users,
    ShieldCheck,
    FileText,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity,
    Download,
    Filter,
    Calendar,
    Eye,
    Settings,
    Zap,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
    totalPremiumPaid: number;
    marineCargo: number;
    airCargo: number;
    roadCargo: number;
    totalOrders: number;
    pendingOrders: number;
    totalUsers: number;
    activePolicies: number;
    avgProcessingTime: number;
    monthlyRevenue: { month: string; revenue: number; claims: number }[];
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalPremiumPaid: 0,
        marineCargo: 0,
        airCargo: 0,
        roadCargo: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        activePolicies: 0,
        avgProcessingTime: 0,
        monthlyRevenue: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

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
                setStats({
                    totalPremiumPaid: data.totalRevenue,
                    marineCargo: data.marineCargo,
                    airCargo: data.airCargo,
                    roadCargo: data.roadCargo,
                    totalOrders: data.totalOrders,
                    pendingOrders: data.pendingOrders,
                    totalUsers: data.totalUsers,
                    activePolicies: data.activePolicies,
                    avgProcessingTime: data.avgProcessingTime,
                    monthlyRevenue: data.monthlyRevenue || [],
                });
            } else {
                console.warn("Failed to fetch dashboard stats from /api/admin/reports");
                setError("Failed to load live statistics from the remote REST API.");
            }
        } catch (err) {
            console.warn("Error fetching dashboard stats:", err);
            setError("Could not connect to the statistics API. Please verify your internet or remote server status.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const quickAccessLinks = [
        {
            title: "Policies",
            description: "Manage insurance policies",
            icon: ShieldCheck,
            href: "/admin/policies",
            color: "from-brand-green to-emerald-700",
            count: `${stats.activePolicies} Active`
        },
        {
            title: "Declarations",
            description: "Track import declarations",
            icon: Package,
            href: "/admin/declarations",
            color: "from-blue-500 to-blue-700",
            count: stats.totalOrders.toString()
        },
        {
            title: "Invoices",
            description: "Billing & payments",
            icon: FileText,
            href: "/admin/invoices",
            color: "from-purple-500 to-purple-700",
            count: "Review pending"
        },
        {
            title: "Users",
            description: "User management",
            icon: Users,
            href: "/admin/users",
            color: "from-amber-500 to-amber-700",
            count: stats.totalUsers.toString()
        },
    ];

    const kpiCards = [
        {
            title: "Total Revenue",
            value: `Tsh ${(stats.totalPremiumPaid / 1000000).toFixed(1)}M`,
            change: "+18.4%",
            positive: true,
            icon: Wallet,
            color: "blue"
        },
        {
            title: "Total Orders",
            value: stats.totalOrders,
            change: "+12.3%",
            positive: true,
            icon: Package,
            color: "emerald"
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            change: stats.pendingOrders > 5 ? "High volume" : "Normal",
            positive: stats.pendingOrders <= 5,
            icon: Clock,
            color: "amber"
        },
        {
            title: "Completion Rate",
            value: "94.2%",
            change: "+2.1%",
            positive: true,
            icon: Target,
            color: "purple"
        },
    ];

    const cargoDistribution = [
        {
            label: "Marine Cargo",
            value: stats.marineCargo,
            icon: Ship,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            percentage: stats.totalOrders > 0 ? ((stats.marineCargo / stats.totalOrders) * 100).toFixed(1) : "0"
        },
        {
            label: "Road Cargo",
            value: stats.roadCargo,
            icon: Truck,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            percentage: stats.totalOrders > 0 ? ((stats.roadCargo / stats.totalOrders) * 100).toFixed(1) : "0"
        },
        {
            label: "Air Cargo",
            value: stats.airCargo,
            icon: Plane,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            percentage: stats.totalOrders > 0 ? ((stats.airCargo / stats.totalOrders) * 100).toFixed(1) : "0"
        },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                System operational • Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                <Activity className="w-4 h-4" />
                                Activity Log
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm">
                                <BarChart3 className="w-4 h-4" />
                                Generate Report
                            </button>
                        </div>
                    </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50/80 backdrop-blur border border-red-200 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
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

                {/* Quick Access Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {quickAccessLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={index}
                                href={link.href}
                                className="group relative overflow-hidden rounded-lg bg-gradient-to-br p-5 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-100 group-hover:opacity-90 transition-opacity",
                                            link.color
                                        )}
                                    />
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all ml-auto" />
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-1">{link.title}</h3>
                                        <p className="text-white/80 text-xs mb-2">{link.description}</p>
                                        <p className="text-white/60 text-xs font-semibold">{link.count}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpiCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn(
                                        "rounded-lg p-3 transition-transform group-hover:scale-110",
                                        card.color === "blue" && "bg-blue-100",
                                        card.color === "emerald" && "bg-emerald-100",
                                        card.color === "amber" && "bg-amber-100",
                                        card.color === "purple" && "bg-purple-100"
                                    )}>
                                        <Icon className={cn(
                                            "w-5 h-5",
                                            card.color === "blue" && "text-blue-600",
                                            card.color === "emerald" && "text-emerald-600",
                                            card.color === "amber" && "text-amber-600",
                                            card.color === "purple" && "text-purple-600"
                                        )} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
                                        card.positive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {card.change}
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {card.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">Revenue Analytics</h2>
                                    <p className="text-sm text-gray-600">Monthly premium collection overview</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTimeframe('monthly')}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                            timeframe === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setTimeframe('quarterly')}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                            timeframe === 'quarterly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        Quarterly
                                    </button>
                                    <button
                                        onClick={() => setTimeframe('yearly')}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                            timeframe === 'yearly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {stats.monthlyRevenue.length > 0 ? (
                                <>
                                    {/* Chart */}
                                    <div className="relative h-64 mb-6">
                                        {/* Y-axis */}
                                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-semibold text-gray-500">
                                            <span>200M</span>
                                            <span>150M</span>
                                            <span>100M</span>
                                            <span>50M</span>
                                            <span>0</span>
                                        </div>

                                        {/* Grid */}
                                        <div className="absolute left-14 right-0 top-0 bottom-8 flex flex-col justify-between">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="border-t border-gray-100"></div>
                                            ))}
                                        </div>

                                        {/* Bars */}
                                        <div className="absolute left-14 right-0 top-0 bottom-8 flex items-end justify-between gap-1.5">
                                            {stats.monthlyRevenue.map((data, i) => (
                                                <div key={i} className="flex-1 flex items-end justify-center group">
                                                    <div className="relative flex-1 max-w-[32px]">
                                                        <div
                                                            className="w-full bg-gradient-to-t from-brand-green to-emerald-500 rounded-t-lg hover:from-emerald-600 hover:to-emerald-400 transition-all duration-300 cursor-pointer shadow-sm relative"
                                                            style={{ height: `${Math.min((data.revenue / 200) * 100, 100)}%` }}
                                                        >
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20 pointer-events-none">
                                                                TZS {data.revenue}M
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2">
                                                                    <div className="border-4 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* X-axis */}
                                        <div className="absolute left-14 right-0 bottom-0 h-8 flex items-center justify-between">
                                            {stats.monthlyRevenue.map((data, i) => (
                                                <span key={i} className="text-xs font-semibold text-gray-500 flex-1 text-center">
                                                    {data.month}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                        {[
                                            { label: "Avg Monthly", value: `Tsh ${Math.round(stats.totalPremiumPaid / 12 / 1000000)}M`, trend: "↑ 12.5%" },
                                            { label: "Total YTD", value: `Tsh ${Math.round(stats.totalPremiumPaid / 1000000)}M`, trend: "↑ 18.3%" },
                                            { label: "Loss Ratio", value: "28.5%", trend: "↓ 3.2%" },
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center p-4 rounded-lg bg-gray-50">
                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                                <p className="text-xs font-semibold text-emerald-600">{stat.trend}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">No revenue data available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cargo Distribution */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Cargo Distribution</h3>
                            <div className="space-y-4">
                                {cargoDistribution.map((cargo, index) => {
                                    const Icon = cargo.icon;
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cargo.bgColor)}>
                                                        <Icon className={cn("w-4 h-4", cargo.textColor)} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">{cargo.label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">{cargo.value}</p>
                                                    <p className="text-xs text-gray-500">{cargo.percentage}%</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={cn("h-full bg-gradient-to-r rounded-full transition-all", cargo.color)}
                                                    style={{ width: `${cargo.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-white shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-brand-green" />
                                <h3 className="text-base font-bold">System Overview</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Active Policies</span>
                                    <span className="text-lg font-bold">{stats.activePolicies}</span>
                                </div>
                                <div className="h-px bg-white/10"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Total Users</span>
                                    <span className="text-lg font-bold">{stats.totalUsers}</span>
                                </div>
                                <div className="h-px bg-white/10"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Avg Processing Time</span>
                                    <span className="text-lg font-bold">{stats.avgProcessingTime.toFixed(1)}h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}