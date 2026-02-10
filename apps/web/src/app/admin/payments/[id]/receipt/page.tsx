"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Printer,
    CheckCircle2,
    QrCode,
    Calendar,
    Hash,
    Building,
    CreditCard,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentReceipt {
    id: string;
    receiptNumber: string;
    transactionId: string;
    paidAt: string;
    amount: number;
    method: "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
    provider: string;
    payer: {
        name: string;
        email: string;
    };
    description: string;
}

export default function AdminReceiptPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetchReceipt();
        }
    }, [session]);

    const fetchReceipt = async () => {
        // Mocking for demo purposes
        const demoReceipt: PaymentReceipt = {
            id: params.id as string,
            receiptNumber: `RCP-102${(params.id as string).slice(-1) || '4'}`,
            transactionId: "TXN-MPESA-8821092",
            paidAt: "2026-01-20T14:30:00Z",
            amount: 18260500,
            method: "MOBILE_MONEY",
            provider: "M-Pesa",
            payer: {
                name: "Kibo Traders Ltd",
                email: "finance@kibotraders.co.tz"
            },
            description: "Full Premium Payment for Invoice #INV-2026-001"
        };

        setTimeout(() => {
            setReceipt(demoReceipt);
            setLoading(false);
        }, 600);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Receipt not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            {/* Header Actions - Hidden when printing */}
            <div className="flex justify-between items-center print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Payments
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                        title="Print Receipt"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* Receipt Card */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Payment Successful</h2>
                    <p className="text-emerald-100 text-sm">Your transaction has been completed</p>
                </div>

                {/* Receipt Content */}
                <div className="p-8">
                    {/* Amount Section */}
                    <div className="bg-gray-50 rounded-lg p-6 text-center mb-8 border border-gray-200">
                        <p className="text-sm font-medium text-gray-600 mb-2">Amount Paid</p>
                        <h3 className="text-4xl font-semibold text-gray-900">
                            TZS {receipt.amount.toLocaleString()}
                        </h3>
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-4 mb-8">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Transaction Details</h4>
                        
                        <div className="flex items-start justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Hash className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Receipt Number</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{receipt.receiptNumber}</span>
                        </div>

                        <div className="flex items-start justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Hash className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Transaction ID</span>
                            </div>
                            <span className="text-sm font-mono font-semibold text-gray-900">{receipt.transactionId}</span>
                        </div>

                        <div className="flex items-start justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Date & Time</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-gray-900 block">
                                    {new Date(receipt.paidAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(receipt.paidAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Payment Method</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-gray-900 block">{receipt.provider}</span>
                                <span className="text-xs text-gray-500">{receipt.method.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div className="flex items-start justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Paid By</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-gray-900 block">{receipt.payer.name}</span>
                                <span className="text-xs text-gray-500">{receipt.payer.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
                        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">Description</p>
                        <p className="text-sm text-blue-900">
                            {receipt.description}
                        </p>
                    </div>

                    {/* QR Code Section */}
                    <div className="border-t border-gray-200 pt-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 p-3 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                <QrCode className="w-full h-full text-gray-900" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900 mb-1">Verification Code</p>
                                <p className="text-xs text-gray-500 max-w-xs">
                                    Scan this QR code or visit tiips.co.tz/verify/{receipt.transactionId} to verify this receipt
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>TIIPS Payment System</span>
                        <span>© {new Date().getFullYear()} All rights reserved</span>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    nav, footer, aside, .print\\:hidden {
                        display: none !important;
                    }
                    @page {
                        margin: 0.5cm;
                    }
                }
            `}</style>
        </div>
    );
}