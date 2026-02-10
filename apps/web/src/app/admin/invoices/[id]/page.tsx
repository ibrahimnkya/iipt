"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Printer,
    CreditCard,
    Clock,
    CheckCircle2,
    FileText,
    Building2,
    Calendar,
    Globe,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    status: "PAID" | "PENDING" | "OVERDUE";
    issueDate: string;
    dueDate: string;
    customer: {
        name: string;
        address: string;
        email: string;
        tin: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    paymentMethod?: string;
}

export default function AdminInvoiceDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [invoice, setInvoice] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN" && params.id) {
            fetchInvoice();
        }
    }, [session, params.id]);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/admin/invoices/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                // Transform API data to UI structure
                const formattedInvoice = {
                    id: data.id,
                    invoiceNumber: data.id.slice(0, 8).toUpperCase(),
                    status: data.status,
                    issueDate: data.issuedAt,
                    dueDate: new Date(new Date(data.issuedAt).setDate(new Date(data.issuedAt).getDate() + 30)).toISOString(), // Mock 30 days due date
                    customer: {
                        name: data.order.user.fullName,
                        address: data.order.user.physicalAddress || "N/A",
                        email: data.order.user.email,
                        tin: data.order.user.tinNumber || "N/A"
                    },
                    items: [
                        {
                            description: `Insurance Premium - ${data.order.policy.name}`,
                            quantity: 1,
                            unitPrice: data.amount,
                            amount: data.amount
                        }
                    ],
                    subtotal: data.amount / 1.18, // Assuming amount includes VAT
                    taxRate: 18,
                    taxAmount: data.amount - (data.amount / 1.18),
                    total: data.amount,
                    paymentMethod: data.payments?.[0]?.provider || "Pending",
                    currency: data.order.currency || "TZS"
                };
                setInvoice(formattedInvoice);
            } else {
                console.error("Failed to fetch invoice");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async () => {
        if (!confirm("Are you sure you want to mark this invoice as PAID?")) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/invoices/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "PAID" }),
            });

            if (res.ok) {
                fetchInvoice(); // Refresh data
                // Optionally show success toast
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating invoice:", error);
            alert("Error updating invoice");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!invoice) return <div className="p-8 text-center text-gray-500">Invoice not found.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                            <span>Admin</span>
                            <ChevronRight className="w-3 h-3" />
                            <span>Billing</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-900">Document</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">
                            Invoice #{invoice.invoiceNumber}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                    {invoice.status !== "PAID" && (
                        <button
                            onClick={markAsPaid}
                            disabled={updating}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <CreditCard className="w-4 h-4" />
                            )}
                            Mark as Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Main Invoice Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-150 shadow-2xl overflow-hidden">
                <div className="p-12">
                    {/* Invoice Top Section */}
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl ring-8 ring-gray-50">
                                T
                            </div>
                            <h2 className="text-xl font-black text-gray-900">TIIP Administration</h2>
                            <p className="text-sm text-gray-500 font-medium">Official Digital Invoice</p>
                        </div>
                        <div className="text-right">
                            <span className={cn(
                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6",
                                invoice.status === "PAID" ? "bg-green-50 text-green-700 border-green-100" :
                                    invoice.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                        "bg-red-50 text-red-700 border-red-100"
                            )}>
                                {invoice.status === "PAID" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {invoice.status}
                            </span>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document ID</p>
                                <p className="text-lg font-black text-gray-900">#{invoice.invoiceNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Context Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 pb-16 border-b border-gray-50">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Billed To</p>
                            <div className="space-y-1">
                                <p className="font-black text-gray-900">{invoice.customer.name}</p>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{invoice.customer.address}</p>
                                <p className="text-sm text-brand-blue font-bold tracking-tight">{invoice.customer.email}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase mt-2">TIN: {invoice.customer.tin}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Payment Details</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Method</p>
                                        <p className="text-sm font-bold text-gray-900">{invoice.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Currency</p>
                                        <p className="text-sm font-bold text-gray-900">{invoice.currency} - Tanzanian Shilling</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dates</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Date Issued</span>
                                    <span className="font-bold text-gray-900">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Due Date</span>
                                    <span className="font-bold text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mb-16">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                    <th className="text-center py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Qty</th>
                                    <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Unit Price</th>
                                    <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoice.items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-6">
                                            <p className="font-bold text-gray-900">{item.description}</p>
                                            <p className="text-xs text-gray-400 font-medium mt-1">Service Code: INS-GEN-01</p>
                                        </td>
                                        <td className="py-6 text-center font-bold text-gray-500">{item.quantity}</td>
                                        <td className="py-6 text-right font-bold text-gray-700">{invoice.currency} {item.unitPrice.toLocaleString()}</td>
                                        <td className="py-6 text-right font-black text-gray-900">{invoice.currency} {item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Summary Section */}
                    <div className="flex flex-col md:flex-row justify-between gap-12 pt-12 border-t border-gray-100">
                        <div className="max-w-xs">
                            <h3 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-tight">Terms & Notes</h3>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                Payment is expected within 30 days of issue. For any inquiries regarding this document, please contact our financial department at billing@tiips.co.tz.
                            </p>
                            <div className="mt-6 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-brand-green" />
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Digitally Signed & Validated</span>
                            </div>
                        </div>
                        <div className="w-full md:w-80 space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900">{invoice.currency} {invoice.subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-500">Tax (VAT 18%)</span>
                                <span className="text-gray-900">{invoice.currency} {invoice.taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-base font-black text-gray-900">Total Amount</span>
                                <span className="text-2xl font-black text-brand-blue tracking-tighter">
                                    {invoice.currency} {invoice.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Bottom Bar */}
                <div className="bg-gray-50 p-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-150 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TIIPS-FINANCE-DOC-E342</p>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page 1 of 1</p>
                </div>
            </div>

            {/* Support Information */}
            <div className="flex justify-center gap-12 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <p>Support: +255 700 000 000</p>
                <p>Email: help@tiips.co.tz</p>
                <p>Portal: tiips.co.tz</p>
            </div>
        </div>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
