"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Download,
    DollarSign,
    Calendar,
    AlertCircle,
    CreditCard,
    Package,
    Shield,
    MapPin,
    Receipt,
    Printer,
    Share2,
    Mail,
    Building2,
    Phone,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfGenerator } from "@/lib/pdfGenerator";

interface Payment {
    id: string;
    amount: number;
    provider?: string; // Mapped from backend
    paymentMethod?: string; // Legacy/Frontend
    createdAt?: string; // Mapped from backend
    paymentDate?: string; // Legacy/Frontend
    transactionId: string;
    status: string;
}

interface Invoice {
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
    paidAt: string | null;
    order: {
        id: string;
        cargoDescription: string;
        cargoNature: string;
        originPort: string;
        destinationPort: string;
        sumInsured: number;
        currency: string;
        policy: {
            name: string;
            clauseType: string;
        };
    };
    payments: Payment[];
}

export default function InvoiceDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await fetch(`/api/invoices/${params.id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch invoice");
                }
                const data = await response.json();
                setInvoice(data);
            } catch (error) {
                console.error("Error fetching invoice:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchInvoice();
        }
    }, [params.id]);

    const handleDownloadPDF = async () => {
        if (invoice) {
            // Transform invoice data to match PdfGenerator interface
            const invoiceData = {
                ...invoice,
                currency: invoice.order.currency // Ensure currency is at top level
            };

            // Transform order data to match PdfGenerator interface if needed
            // The generated PdfGenerator expects (invoice, order)
            await PdfGenerator.generateInvoice(invoiceData as any, invoice.order as any);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-2 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 text-sm">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Invoice Not Found</h2>
                    <p className="text-slate-600 text-sm mb-6">The invoice you're looking for doesn't exist.</p>
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Invoices
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = {
        UNPAID: {
            label: "Unpaid",
            icon: Clock,
            color: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-200"
        },
        PAID: {
            label: "Paid",
            icon: CheckCircle,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200"
        },
        OVERDUE: {
            label: "Overdue",
            icon: XCircle,
            color: "text-red-700",
            bg: "bg-red-50",
            border: "border-red-200"
        },
        CANCELLED: {
            label: "Cancelled",
            icon: XCircle,
            color: "text-slate-700",
            bg: "bg-slate-50",
            border: "border-slate-200"
        }
    }[invoice.status] || {
        label: invoice.status,
        icon: Clock,
        color: "text-slate-700",
        bg: "bg-slate-50",
        border: "border-slate-200"
    };

    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingBalance = invoice.amount - totalPaid;

    return (
        <div className="min-h-screen bg-slate-50 -m-8 p-8">
            {/* Header Actions */}
            <div className="max-w-5xl mx-auto mb-6 no-print">
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Invoices
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-all"
                            title="Print Invoice"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Invoice Card */}
            <div id="invoice-content" className="max-w-5xl mx-auto bg-white shadow-sm border border-slate-200">
                {/* Invoice Header */}
                <div className="px-12 pt-12 pb-8 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-8">
                        {/* Company Info */}
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 flex bg-transparent items-center justify-center  overflow-hidden">
                                    <img src="/logo.svg" alt="TIIP Logo" className="w-full h-full object-contain" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">TIIP Insurance</h1>
                                    <p className="text-sm text-slate-600">Transport & Cargo Insurance</p>
                                </div>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                                <p>Dar es Salaam, Tanzania</p>
                                <p>+255 123 456 789</p>
                                <p>support@tiips.co.tz</p>
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-slate-900 mb-1">INVOICE</h2>
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold border mb-4",
                                statusConfig.bg,
                                statusConfig.color,
                                statusConfig.border
                            )}>
                                <statusConfig.icon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Invoice Number</p>
                                    <p className="font-mono font-semibold text-slate-900">
                                        INV-{invoice.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Date Issued</p>
                                    <p className="font-semibold text-slate-900">
                                        {new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {invoice.paidAt && (
                                    <div>
                                        <p className="text-slate-500 text-xs mb-1">Date Paid</p>
                                        <p className="font-semibold text-slate-900">
                                            {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill To</p>
                            <div className="text-sm">
                                <p className="font-semibold text-slate-900 mb-1">
                                    {session?.user?.name || "Customer Name"}
                                </p>
                                <p className="text-slate-600">{session?.user?.email || "customer@email.com"}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Order Details</p>
                            <div className="text-sm text-slate-600">
                                <p>Order ID: <span className="font-mono font-medium">{invoice.order.id.slice(0, 8)}</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Body */}
                <div className="px-12 py-8">
                    {/* Shipment Summary */}
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Shipment Information
                        </h3>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Cargo Description</p>
                                    <p className="text-slate-900 font-medium">{invoice.order.cargoDescription}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Cargo Type</p>
                                    <p className="text-slate-900 font-medium">{invoice.order.cargoNature}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Origin</p>
                                    <p className="text-slate-900 font-medium">{invoice.order.originPort}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Destination</p>
                                    <p className="text-slate-900 font-medium">{invoice.order.destinationPort}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-8">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-y border-slate-200">
                                    <th className="text-left py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="text-right py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Coverage
                                    </th>
                                    <th className="text-right py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="py-4">
                                        <p className="font-medium text-slate-900 mb-0.5">Marine Cargo Insurance Premium</p>
                                        <p className="text-sm text-slate-600">{invoice.order.policy.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Clause Type: {invoice.order.policy.clauseType}
                                        </p>
                                    </td>
                                    <td className="py-4 text-right text-sm text-slate-600">
                                        {invoice.order.currency} {invoice.order.sumInsured.toLocaleString()}
                                    </td>
                                    <td className="py-4 text-right font-semibold text-slate-900">
                                        {invoice.order.currency} {invoice.amount.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-80">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium text-slate-900">
                                        {invoice.order.currency} {invoice.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tax</span>
                                    <span className="font-medium text-slate-900">{invoice.order.currency} 0.00</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t-2 border-slate-900">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                                        Total
                                    </span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {invoice.order.currency} {invoice.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            {totalPaid > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-700 font-medium">Amount Paid</span>
                                        <span className="font-semibold text-emerald-700">
                                            {invoice.order.currency} {totalPaid.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                                        <span className="text-sm font-semibold text-slate-900">Balance Due</span>
                                        <span className="text-xl font-bold text-slate-900">
                                            {invoice.order.currency} {remainingBalance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment History */}
                    {invoice.payments.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                Payment History
                            </h3>
                            <div className="space-y-3">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 border border-slate-200 rounded">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 mb-0.5">
                                                {(() => {
                                                    const provider = payment.provider || payment.paymentMethod || 'Unknown Method';
                                                    if (provider.toLowerCase().includes('tigo')) return 'YAS';
                                                    return provider;
                                                })()}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(payment.createdAt || payment.paymentDate || new Date()).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })} • {payment.transactionId}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-slate-900">
                                                {invoice.order.currency} {payment.amount.toLocaleString()}
                                            </p>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${payment.status === 'SUCCESS' || payment.status === 'COMPLETED'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : payment.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terms & Payment Info */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                                    Payment Information
                                </h3>
                                <div className="text-slate-600 space-y-1">
                                    <p><span className="font-medium">Bank:</span> CRDB Bank Tanzania</p>
                                    <p><span className="font-medium">Account:</span> 0123456789</p>
                                    <p><span className="font-medium">Swift:</span> TIIPTZ</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                                    Terms & Conditions
                                </h3>
                                <div className="text-slate-600 space-y-1">
                                    <p>Payment due within 30 days</p>
                                    <p>Coverage begins upon payment receipt</p>
                                    <p>Reference invoice number on payment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-12 py-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <p>This is a computer-generated invoice</p>
                        <p>www.tiip.co.tz</p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            {remainingBalance > 0 && (
                <div className="max-w-5xl mx-auto mt-6 flex justify-end no-print">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded hover:bg-slate-800 transition-all">
                        <CreditCard className="w-4 h-4" />
                        Pay {invoice.order.currency} {remainingBalance.toLocaleString()}
                    </button>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    body {
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    #invoice-content {
                        box-shadow: none;
                        border: none;
                    }
                }
            `}</style>
        </div>
    );
}