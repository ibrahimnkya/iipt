"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    Package,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Download,
    Ship,
    Plane,
    Truck,
    MapPin,
    Calendar,
    Wallet,
    Shield,
    Box,
    Globe,
    AlertCircle,
    ArrowRight,
    User,
    Mail,
    Boxes,
    Weight,
    Container,
    Receipt,
    Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PdfGenerator } from "@/lib/pdfGenerator";

interface Order {
    id: string;
    status: string;
    cargoDescription: string;
    cargoNature: string;
    packagingMethod: string;
    totalWeight: string;
    originPort: string;
    destinationPort: string;
    transportMode: string;
    dispatchDate: string;
    sumInsured: number;
    invoiceValue: number;
    currency: string;
    capacity: string;
    valuationBasis: string;
    createdAt: string;
    updatedAt: string;
    policy: {
        name: string;
        clauseType: string;
        description: string;
    };
    invoice: {
        id: string;
        invoiceNumber: string;
        amount: number;
        status: string;
        dueDate: string;
    } | null;
    user: {
        fullName: string;
        email: string;
    };
}

export default function ViewOrderPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session && params.id) {
            fetchOrder();
        }
    }, [session, params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                router.push("/dashboard/orders");
            }
        } catch (error) {
            console.error("Failed to fetch order:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadOrder = async () => {
        if (order) {
            await PdfGenerator.generateOrderSummary(order as any);
        }
    };

    const handleDownloadInvoice = async () => {
        if (order && order.invoice) {
            // Need to match Invoice interface expected by PdfGenerator
            // The hook data structure: invoice: { id, invoiceNumber, amount, status, dueDate }
            // Expected: id, amount, currency, status, issuedAt, paidAt

            // We need to merge order info to get currency and maybe other missing fields?
            // Order has currency.

            const invoiceData = {
                ...order.invoice,
                currency: order.currency,
                issuedAt: order.createdAt, // approximation if not in invoice object
                paidAt: order.invoice.status === 'PAID' ? new Date().toISOString() : undefined
            };

            await PdfGenerator.generateInvoice(invoiceData as any, order as any);
        }
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            PENDING: {
                label: "Pending Review",
                icon: Clock,
                bgColor: "bg-amber-50",
                textColor: "text-amber-700",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                borderColor: "border-amber-200",
            },
            APPROVED: {
                label: "Approved",
                icon: CheckCircle,
                bgColor: "bg-blue-50",
                textColor: "text-blue-700",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                borderColor: "border-blue-200",
            },
            ISSUED: {
                label: "Policy Issued",
                icon: CheckCircle,
                bgColor: "bg-emerald-50",
                textColor: "text-emerald-700",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                borderColor: "border-emerald-200",
            },
            CANCELLED: {
                label: "Cancelled",
                icon: XCircle,
                bgColor: "bg-red-50",
                textColor: "text-red-700",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
                borderColor: "border-red-200",
            },
        };

        return configs[status as keyof typeof configs] || configs.PENDING;
    };

    const getTransportIcon = (mode: string) => {
        const icons = {
            SEA: Ship,
            AIR: Plane,
            ROAD: Truck,
        };
        return icons[mode as keyof typeof icons] || Ship;
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 -m-8 p-8 font-sans space-y-6">
                {/* Header skeleton */}
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-6 w-32 rounded" />
                            <Skeleton className="h-4 w-48 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-28 rounded-lg" />
                        <Skeleton className="h-10.5 w-28 rounded-lg" />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Status Banner skeleton */}
                    <Skeleton className="h-24 w-full rounded-lg" />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left main block skeleton */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipment Journey Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg animate-pulse" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4.5 w-40 rounded" />
                                        <Skeleton className="h-3 w-32 rounded" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between border-t border-slate-100 pt-6">
                                    <div className="flex flex-col items-center space-y-2 flex-1">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <Skeleton className="h-4 w-24 rounded" />
                                    </div>
                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                    <div className="flex flex-col items-center space-y-2 flex-1">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <Skeleton className="h-4 w-24 rounded" />
                                    </div>
                                </div>
                            </div>

                            {/* Cargo & Financials Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4.5 w-40 rounded" />
                                        <Skeleton className="h-3 w-32 rounded" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                                            <Skeleton className="h-3 w-20 rounded" />
                                            <Skeleton className="h-6 w-32 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right sidebar skeleton */}
                        <div className="space-y-6">
                            {/* Insurance Policy */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="p-5 bg-gray-900 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 bg-slate-800 rounded-lg" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-32 bg-slate-800 rounded" />
                                            <Skeleton className="h-3 w-24 bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-850 pt-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-20 bg-slate-800 rounded" />
                                            <Skeleton className="h-4 w-36 bg-slate-800 rounded" />
                                        </div>
                                        <Skeleton className="h-6 w-16 bg-slate-800 rounded" />
                                    </div>
                                </div>
                                <div className="p-5 bg-gray-50 space-y-2">
                                    <Skeleton className="h-3.5 w-32 rounded" />
                                    <Skeleton className="h-3 w-full rounded" />
                                    <Skeleton className="h-3 w-5/6 rounded" />
                                </div>
                            </div>

                            {/* Invoice details skeleton */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4.5 w-24 rounded" />
                                        <Skeleton className="h-3 w-32 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-24 rounded" />
                                        <Skeleton className="h-8 w-full rounded-md" />
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                        <Skeleton className="h-4 w-16 rounded" />
                                        <Skeleton className="h-5 w-24 rounded" />
                                    </div>
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
                    <p className="text-gray-600 mb-6">
                        This order doesn't exist or you don't have permission to view it.
                    </p>
                    <Link
                        href="/dashboard/orders"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const TransportIcon = getTransportIcon(order.transportMode);

    return (
        <div className="min-h-screen bg-gray-50 -m-8 p-8">
            <div id="order-content" className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/orders"
                            className="w-10 h-10 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Order Details
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">Order ID:</span>
                                <code className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                    {order.id.slice(0, 8).toUpperCase()}
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {order.invoice && (
                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/invoices/${order.invoice.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Receipt className="w-4 h-4" />
                                    View Invoice
                                </Link>
                                <button
                                    onClick={handleDownloadInvoice}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Invoice PDF
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleDownloadOrder}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Order PDF
                        </button>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={cn(
                    "rounded-lg p-5 border",
                    statusConfig.bgColor,
                    statusConfig.borderColor
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            statusConfig.iconBg
                        )}>
                            <statusConfig.icon className={cn("w-6 h-6", statusConfig.iconColor)} />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", statusConfig.textColor)}>
                                {statusConfig.label}
                            </h3>
                            <p className="text-sm text-gray-600 mt-0.5">
                                Last updated: {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipment Journey Card */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-5 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Shipment Journey</h2>
                                        <p className="text-sm text-gray-500">Route and transport information</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Horizontal Journey */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-4">
                                        {/* Origin */}
                                        <div className="flex-1">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center mb-3">
                                                    <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase tracking-wide mb-2">
                                                    Origin Port
                                                </span>
                                                <p className="text-base font-semibold text-gray-900">{order.originPort}</p>
                                            </div>
                                        </div>

                                        {/* Arrow/Transport Mode */}
                                        <div className="flex-shrink-0 flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-0.5 w-12 bg-gray-300"></div>
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                                    <TransportIcon className="w-5 h-5 text-gray-600" />
                                                    <div className="text-left">
                                                        <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Transport Mode</p>
                                                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{order.transportMode} Freight</p>
                                                    </div>
                                                </div>
                                                <div className="h-0.5 w-12 bg-gray-300"></div>
                                            </div>
                                        </div>

                                        {/* Destination */}
                                        <div className="flex-1">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                                                    <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium uppercase tracking-wide mb-2">
                                                    Destination Port
                                                </span>
                                                <p className="text-base font-semibold text-gray-900">{order.destinationPort}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dispatch Date */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dispatch Date</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                                {new Date(order.dispatchDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cargo Information */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-5 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Box className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Cargo Information</h2>
                                        <p className="text-sm text-gray-500">Complete cargo details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                        <FileText className="w-3.5 h-3.5" />
                                        Description
                                    </label>
                                    <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {order.cargoDescription}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            <Package className="w-3.5 h-3.5" />
                                            Cargo Type
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">{order.cargoNature}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            <Weight className="w-3.5 h-3.5" />
                                            Weight/Volume
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">{order.totalWeight}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            <Boxes className="w-3.5 h-3.5" />
                                            Packaging
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">{order.packagingMethod}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            <Container className="w-3.5 h-3.5" />
                                            Capacity
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">{order.capacity}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-5 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Financial Details</h2>
                                        <p className="text-sm text-gray-500">Value and coverage amounts</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <Receipt className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Invoice Value
                                            </label>
                                        </div>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {order.currency === 'USD' || order.currency === 'TZS' ? 'Tsh' : order.currency} {order.invoiceValue.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="p-5 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <label className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                                                Sum Insured
                                            </label>
                                        </div>
                                        <p className="text-2xl font-semibold text-emerald-700">
                                            {order.currency === 'USD' || order.currency === 'TZS' ? 'Tsh' : order.currency} {order.sumInsured.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                        Valuation Basis
                                    </label>
                                    <p className="text-sm font-semibold text-gray-900">{order.valuationBasis}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Insurance Policy */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-5 bg-gray-900 text-white rounded-t-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold">Insurance Policy</h2>
                                        <p className="text-xs text-gray-300">Coverage details</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wide mb-1 block">
                                                Policy Name
                                            </label>
                                            <p className="text-sm font-semibold">{order.policy.name}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wide mb-2 block text-right">
                                                Clause Type
                                            </label>
                                            <span className="inline-block px-3 py-1 bg-white text-gray-900 rounded text-sm font-semibold">
                                                {order.policy.clauseType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                    Coverage Description
                                </label>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {order.policy.description}
                                </p>
                            </div>
                        </div>

                        {/* Invoice Status */}
                        {order.invoice && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-5 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Receipt className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900">Invoice</h2>
                                            <p className="text-xs text-gray-500">Payment information</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                            Invoice Number
                                        </label>
                                        <code className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-mono block break-all">
                                            {order.invoice.invoiceNumber}
                                        </code>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                            Amount
                                        </label>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {order.currency === 'USD' || order.currency === 'TZS' ? 'Tsh' : order.currency} {order.invoice.amount.toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                            Status
                                        </label>
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold",
                                            order.invoice.status === 'PAID'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        )}>
                                            {order.invoice.status === 'PAID' ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Clock className="w-4 h-4" />
                                            )}
                                            {order.invoice.status}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/dashboard/invoices/${order.invoice.id}`}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mt-4"
                                    >
                                        View Invoice
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Order Metadata */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <Activity className="w-5 h-5 text-gray-600" />
                                <h2 className="text-base font-semibold text-gray-900">Order Timeline</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                                            Created By
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">{order.user.fullName}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3" />
                                            {order.user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                                            Created On
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Clock className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                                            Last Updated
                                        </label>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.updatedAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}