"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Package,
    FileText,
    CreditCard,
    Shield,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Mail,
    Phone,
    MessageCircle,
    Plus,
    Eye,
    Download,
    Search,
    Filter,
    Calendar,
    DollarSign,
    Activity,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalInvoices: 0,
        unpaidInvoices: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
            router.push("/admin");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, invoicesRes] = await Promise.all([
                fetch("/api/orders"),
                fetch("/api/invoices"),
            ]);

            if (ordersRes.ok && invoicesRes.ok) {
                const orders = await ordersRes.json();
                const invoices = await invoicesRes.json();

                setStats({
                    totalOrders: orders.length,
                    pendingOrders: orders.filter((o: any) => o.status === "PENDING").length,
                    totalInvoices: invoices.length,
                    unpaidInvoices: invoices.filter((i: any) => i.status === "UNPAID").length,
                });

                // Combine and sort for recent activity
                const combinedActivity = [
                    ...orders.map((o: any) => ({
                        type: 'order',
                        id: o.id,
                        title: `Order #${o.orderNumber}`,
                        status: o.status,
                        date: new Date(o.createdAt),
                        amount: o.cifValue,
                        currency: o.currency
                    })),
                    ...invoices.map((i: any) => ({
                        type: 'invoice',
                        id: i.id,
                        title: `Invoice #${i.id.slice(0, 8).toUpperCase()}`,
                        status: i.status,
                        date: new Date(i.issuedAt),
                        amount: i.amount,
                        currency: i.order?.currency || 'TZS'
                    }))
                ].sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 6);

                setRecentActivity(combinedActivity);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || (loading && status === "authenticated")) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: Package,
            bgColor: "from-blue-50 to-blue-100/50",
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100",
            borderColor: "border-blue-200",
            trend: "+12.5%",
            trendUp: true
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            icon: Clock,
            bgColor: "from-amber-50 to-amber-100/50",
            iconColor: "text-amber-600",
            iconBg: "bg-amber-100",
            borderColor: "border-amber-200",
            trend: "3 active",
            trendUp: false
        },
        {
            title: "Total Invoices",
            value: stats.totalInvoices,
            icon: FileText,
            bgColor: "from-emerald-50 to-emerald-100/50",
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
            borderColor: "border-emerald-200",
            trend: "+8.3%",
            trendUp: true
        },
        {
            title: "Unpaid Invoices",
            value: stats.unpaidInvoices,
            icon: AlertCircle,
            bgColor: "from-rose-50 to-rose-100/50",
            iconColor: "text-rose-600",
            iconBg: "bg-rose-100",
            borderColor: "border-rose-200",
            trend: stats.unpaidInvoices > 0 ? "Action needed" : "All clear",
            trendUp: false
        },
    ];

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const quickActions = [
        {
            title: "Create Order",
            description: "Submit new insurance order",
            icon: Plus,
            href: "/dashboard/orders/create",
            color: "from-brand-green to-emerald-700"
        },
        {
            title: "View Orders",
            description: "Track your orders",
            icon: Package,
            href: "/dashboard/orders",
            color: "from-blue-500 to-blue-700"
        },
        {
            title: "Pay Invoices",
            description: "Manage payments",
            icon: CreditCard,
            href: "/dashboard/invoices",
            color: "from-purple-500 to-purple-700"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Welcome back, <span className="text-brand-green">{session?.user?.fullName?.split(' ')[0] || session?.user?.name}</span>
                            </h1>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-gray-400" />
                                Here's your insurance portfolio overview
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

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br p-5 shadow-sm hover:shadow-md transition-all"
                                    style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                                >
                                    <div 
                                        className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-100 group-hover:opacity-90 transition-opacity",
                                            action.color
                                        )}
                                    />
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                                    
                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-white mb-0.5">{action.title}</h3>
                                            <p className="text-white/80 text-xs truncate">{action.description}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "bg-gradient-to-br rounded-lg p-6 border shadow-sm hover:shadow-md transition-all group",
                                    card.bgColor,
                                    card.borderColor
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn(
                                        "rounded-lg p-3 transition-transform group-hover:scale-110",
                                        card.iconBg
                                    )}>
                                        <Icon className={cn("w-5 h-5", card.iconColor)} />
                                    </div>
                                    {card.trendUp !== undefined && (
                                        <div className={cn(
                                            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
                                            card.trendUp ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {card.trendUp && <TrendingUp className="w-3 h-3" />}
                                            {card.trend}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        {card.title}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">
                                Recent Activity
                            </h2>
                            <Link
                                href="/dashboard/orders"
                                className="text-sm font-semibold text-brand-green hover:text-brand-green/80 transition-colors flex items-center gap-1 group"
                            >
                                View All
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivity.map((activity, index) => {
                                        const Icon = activity.type === 'order' ? Package : FileText;
                                        return (
                                            <div
                                                key={`${activity.type}-${activity.id}`}
                                                className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                                                onClick={() => router.push(`/dashboard/${activity.type}s`)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                        activity.type === 'order' 
                                                            ? 'bg-blue-100 text-blue-600' 
                                                            : 'bg-emerald-100 text-emerald-600'
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                                {activity.title}
                                                            </p>
                                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                                {formatDate(activity.date)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs text-gray-600">
                                                                {activity.currency} {activity.amount?.toLocaleString()}
                                                            </p>
                                                            <span className={cn(
                                                                "text-xs font-semibold px-2.5 py-1 rounded-full",
                                                                activity.status === 'PENDING' && 'bg-amber-100 text-amber-700',
                                                                (activity.status === 'PAID' || activity.status === 'APPROVED') && 'bg-emerald-100 text-emerald-700',
                                                                activity.status === 'UNPAID' && 'bg-rose-100 text-rose-700'
                                                            )}>
                                                                {activity.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                                    <p className="text-sm text-gray-600 mb-6">Create your first order to get started</p>
                                    <Link
                                        href="/dashboard/orders/create"
                                        className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Order
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Support Card */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <div className="flex items-start gap-3 mb-5">
                                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <HelpCircle className="w-5 h-5 text-brand-green" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">Need Help?</h3>
                                    <p className="text-xs text-gray-600">We're here to assist you</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href="mailto:support@tiips.co.tz"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">Email Support</p>
                                        <p className="text-xs text-gray-500 truncate">support@tiips.co.tz</p>
                                    </div>
                                </a>

                                <a
                                    href="tel:+255123456789"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">Call Us</p>
                                        <p className="text-xs text-gray-500">+255 123 456 789</p>
                                    </div>
                                </a>

                                <Link
                                    href="/dashboard/help"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <MessageCircle className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">Help Center</p>
                                        <p className="text-xs text-gray-500">FAQs & Guides</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-brand-green to-emerald-700 rounded-lg p-6 text-white shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5" />
                                <h3 className="text-base font-bold">Quick Stats</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">This Month</span>
                                    <span className="text-lg font-bold">{stats.totalOrders}</span>
                                </div>
                                <div className="h-px bg-white/20"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">Pending</span>
                                    <span className="text-lg font-bold">{stats.pendingOrders}</span>
                                </div>
                                <div className="h-px bg-white/20"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">Completed</span>
                                    <span className="text-lg font-bold">{stats.totalOrders - stats.pendingOrders}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}