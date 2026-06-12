"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Invoice {
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
    paidAt: string | null;
    currentDate: string;
    order: {
        id: string;
        cargoDescription: string;
        sumInsured: number;
        currency: string;
        billOfLadingNumber: string;
        portOfEntry: string;
        policy: {
            name: string;
            clauseType: string;
        };
        user: {
            fullName: string;
            email: string;
            phone: string;
            tinNumber: string;
            brelaNumber: string;
            physicalAddress: string;
        };
    };
}

export default function InvoicePrintPage() {
    const params = useParams();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/invoices/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setInvoice(data);
                }
            } catch (error) {
                console.error("Failed to fetch invoice", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchInvoice();
        }
    }, [params.id]);

    useEffect(() => {
        if (!loading && invoice) {
            // Give a small delay for rendering to finish before printing
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, invoice]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!invoice) return <div>Invoice not found</div>;

    return (
        <div className="bg-white min-h-screen p-12 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="NIIS-T Logo" className="w-12 h-12 object-contain" />
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">NIIS-T</h1>
                        <p className="text-xs text-gray-500 font-medium">National Import Insurance System – Tanzania</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-black text-gray-900 mb-1">INVOICE</h2>
                    <p className="text-gray-500 font-medium">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                </div>
            </div>

            {/* Status & meta */}
            <div className="mb-12">
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${invoice.status === "PAID"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-yellow-50 text-yellow-700 border-yellow-100"
                    }`}>
                    {invoice.status}
                </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Billed To</h3>
                    <div className="text-gray-900 font-medium space-y-1">
                        <p className="font-bold text-lg">{invoice.order.user.fullName}</p>
                        <p>{invoice.order.user.email}</p>
                        <p>{invoice.order.user.phone}</p>
                        <div className="pt-2 text-sm text-gray-600">
                            {invoice.order.user.tinNumber && <p>TIN: {invoice.order.user.tinNumber}</p>}
                            {invoice.order.user.brelaNumber && <p>BRELA: {invoice.order.user.brelaNumber}</p>}
                            <p className="mt-1">{invoice.order.user.physicalAddress}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Invoice Date</h3>
                        <p className="font-bold text-gray-900">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Due Date</h3>
                        <p className="font-bold text-gray-900">
                            {new Date(new Date(invoice.issuedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-12">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="text-left py-4 text-xs font-black uppercase tracking-wider text-gray-900">Description</th>
                            <th className="text-right py-4 text-xs font-black uppercase tracking-wider text-gray-900">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-4">
                                <p className="font-bold text-gray-900">{invoice.order.policy.name}</p>
                                <p className="text-sm text-gray-500">{invoice.order.cargoDescription}</p>
                                <p className="text-xs text-gray-400 mt-1">Clause: {invoice.order.policy.clauseType}</p>
                            </td>
                            <td className="text-right py-4 font-bold text-gray-900">
                                {invoice.order.currency} {invoice.amount.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-900">
                            <td className="pt-4 text-right font-black text-gray-900 uppercase">Total</td>
                            <td className="pt-4 text-right font-black text-2xl text-gray-900">
                                {invoice.order.currency} {invoice.amount.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-500">
                <p>Thank you for your business.</p>
                <p className="mt-1">National Import Insurance System – Tanzania (NIIS-T) &copy; {new Date().getFullYear()}</p>
            </div>

            <style jsx global>{`
                @page {
                    size: A4;
                    margin: 0;
                }
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}
