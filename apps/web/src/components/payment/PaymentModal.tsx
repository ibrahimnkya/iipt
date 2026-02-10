"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Smartphone, X, ArrowLeft, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfGenerator } from "@/lib/pdfGenerator";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: {
        id: string;
        amount: number;
        currency: string;
    } | null;
    onSuccess: () => void;
}

interface PaymentChannel {
    id: number;
    mobile_channel: string;
    logoUrl: string;
    uts_name: string;
    active: string;
    partnerType?: string; // e.g. "mno"
}

export function PaymentModal({ isOpen, onClose, invoice, onSuccess }: PaymentModalProps) {
    const [step, setStep] = useState<"SELECT" | "DETAILS" | "PROCESSING" | "SUCCESS">("SELECT");
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null); // uts_name
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
    const [channels, setChannels] = useState<PaymentChannel[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successPaymentData, setSuccessPaymentData] = useState<any>(null);

    // Fetch channels on mount
    useEffect(() => {
        if (isOpen) {
            setLoadingChannels(true);
            fetch("/api/payments/channels")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setChannels(data.filter(c => c.active === "yes"));
                    }
                })
                .catch(err => console.error("Failed to fetch channels", err))
                .finally(() => setLoadingChannels(false));

            // Reset state
            setStep("SELECT");
            setSelectedProvider(null);
            setPhone("");
            setError(null);
            setCurrentPaymentId(null);
            setSuccessPaymentData(null);
        }
    }, [isOpen]);

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (step === "PROCESSING" && currentPaymentId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/payments/status/${currentPaymentId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === "SUCCESS") {
                            setSuccessPaymentData(data); // Save full payment data
                            setStep("SUCCESS");
                            onSuccess();
                            clearInterval(interval);
                        } else if (data.status === "FAILED") {
                            setError("Payment failed or was rejected.");
                            // Optional: setStep("DETAILS") to retry
                            clearInterval(interval);
                        }
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 3000); // Poll every 3 seconds
        }

        return () => clearInterval(interval);
    }, [step, currentPaymentId, onSuccess]);

    const handleProviderSelect = (providerId: string) => {
        setSelectedProvider(providerId);
        setStep("DETAILS");
        setError(null);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/payments/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    provider: selectedProvider,
                    phone: phone,
                    amount: invoice.amount,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Payment initiation failed");
            }

            setCurrentPaymentId(data.id);
            setStep("PROCESSING");

        } catch (error: any) {
            console.error("Payment error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateSuccess = async () => {
        if (!currentPaymentId) return;
        try {
            await fetch("/api/dev/simulate-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId: currentPaymentId }),
            });
        } catch (error) {
            console.error("Simulation failed:", error);
        }
    };

    const handleDownloadReceipt = async () => {
        if (invoice && successPaymentData) {
            const fullInvoice = {
                ...invoice,
                status: "PAID",
                issuedAt: new Date().toISOString(),
                // paidAt: successPaymentData.createdAt // could add this
            };

            await PdfGenerator.generateReceipt(fullInvoice as any, successPaymentData);
        }
    };

    const handleClose = () => {
        setStep("SELECT");
        onClose();
    };

    const selectedChannel = channels.find(c => c.uts_name === selectedProvider);

    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white gap-0 rounded-3xl border-0 shadow-2xl" aria-describedby={undefined}>
                <div className="sr-only">
                    <DialogTitle>Payment Modal</DialogTitle>
                </div>
                {/* Header Section */}
                <div className={cn(
                    "relative p-8 pb-6 transition-all duration-500",
                    step === "SUCCESS"
                        ? "bg-gradient-to-br from-emerald-500 to-green-600"
                        : "bg-gradient-to-br from-slate-50 to-slate-100/50"
                )}>
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className={cn(
                            "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            step === "SUCCESS"
                                ? "bg-white/20 hover:bg-white/30 text-white"
                                : "bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Back Button */}
                    {step === "DETAILS" && (
                        <button
                            onClick={() => setStep("SELECT")}
                            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}

                    {/* Title */}
                    <div className="text-center mb-6">
                        <DialogTitle className={cn(
                            "text-2xl font-bold mb-2 transition-colors",
                            step === "SUCCESS" ? "text-white" : "text-slate-900"
                        )}>
                            {step === "SELECT" && "Choose Payment Method"}
                            {step === "DETAILS" && `Pay with ${selectedChannel?.mobile_channel}`}
                            {step === "PROCESSING" && "Confirm Payment"}
                            {step === "SUCCESS" && "Payment Complete!"}
                        </DialogTitle>
                        {step !== "SUCCESS" && (
                            <p className="text-sm font-medium text-slate-500">
                                {step === "SELECT" && "Select your preferred mobile money provider"}
                                {step === "DETAILS" && "Enter your phone number to receive a payment request"}
                                {step === "PROCESSING" && "Check your phone to complete the payment"}
                            </p>
                        )}
                    </div>

                    {/* Amount Display */}
                    {step !== "SUCCESS" && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Amount to Pay
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {invoice?.currency} {invoice?.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-green/30">
                                    <Zap className="w-6 h-6 text-white" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-8 pt-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* SELECT PROVIDER */}
                    {step === "SELECT" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loadingChannels ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {channels.map((provider, index) => (
                                        <button
                                            key={provider.id}
                                            onClick={() => handleProviderSelect(provider.uts_name)}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            className={cn(
                                                "relative group h-32 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-[0.98] border border-slate-200",
                                                selectedProvider === provider.uts_name
                                                    ? "ring-4 ring-brand-green ring-offset-2 border-transparent"
                                                    : "hover:ring-2 hover:ring-brand-green/50 hover:ring-offset-1"
                                            )}
                                        >
                                            {/* Background Image */}
                                            <div className="absolute inset-0 bg-slate-100">
                                                <img
                                                    src={provider.logoUrl}
                                                    alt={provider.mobile_channel}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>

                                            {/* Gradient Overlay - Stronger at bottom for text */}
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300",
                                                selectedProvider === provider.uts_name ? "opacity-80" : "opacity-60 group-hover:opacity-70"
                                            )} />

                                            {/* Content */}
                                            <div className="absolute inset-0 p-4 flex flex-col justify-end items-start text-left">
                                                <span className="font-bold text-white text-lg tracking-wide drop-shadow-md">
                                                    {provider.mobile_channel}
                                                </span>
                                                {provider.partnerType === "mno" && (
                                                    <span className="text-[10px] uppercase font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full mt-1 backdrop-blur-md border border-white/10">
                                                        Mobile Money
                                                    </span>
                                                )}
                                            </div>

                                            {/* Selected Checkmark */}
                                            {selectedProvider === provider.uts_name && (
                                                <div className="absolute top-3 right-3 bg-brand-green text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-300">
                                                    <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Lock className="w-4 h-4" />
                                    <p className="text-xs font-medium">Secured by 256-bit SSL encryption</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PAYMENT DETAILS */}
                    {step === "DETAILS" && selectedChannel && (
                        <form onSubmit={handlePayment} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Selected Provider Badge */}
                            <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md bg-white">
                                    <img src={selectedChannel.logoUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{selectedChannel.mobile_channel}</p>
                                    <p className="text-xs text-slate-500">Mobile Money Payment</p>
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <Smartphone className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-400 font-semibold">+255</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="7XX XXX XXX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-24 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300 text-lg"
                                        required
                                        maxLength={10}
                                    />
                                </div>
                                <div className="flex items-start gap-2 px-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5"></div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        You'll receive a payment request on your phone. Enter your PIN to confirm the transaction.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !phone || phone.length < 9}
                                className="w-full py-4 bg-gradient-to-r from-brand-green to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-green/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all shadow-md shadow-brand-green/20 text-base"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Send Payment Request
                                        <Zap className="w-4 h-4" fill="currentColor" />
                                    </div>
                                )}
                            </button>
                        </form>
                    )}

                    {/* PROCESSING */}
                    {step === "PROCESSING" && selectedChannel && (
                        <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-500">
                            {/* Animated Icon */}
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-brand-green border-t-transparent animate-spin"></div>
                                <div className="absolute inset-3 rounded-full overflow-hidden shadow-lg animate-pulse bg-white p-1">
                                    <img src={selectedChannel.logoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-3 mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Waiting for confirmation</h3>
                                <div className="max-w-[280px] mx-auto">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        We've sent a payment request to
                                    </p>
                                    <p className="text-base font-bold text-brand-green mt-1">
                                        +255 {phone}
                                    </p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                        !
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-bold text-amber-900 mb-1">Action Required</p>
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            Please check your phone and enter your PIN to complete the payment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* DEMO: Simulation Button */}
                            {currentPaymentId && (
                                <button
                                    onClick={handleSimulateSuccess}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
                                >
                                    🛠️ Simulate Agent Approval via USSD
                                </button>
                            )}

                            {/* Loading dots */}
                            <div className="flex items-center justify-center gap-1.5 mt-8">
                                <div className="w-2 h-2 rounded-full bg-brand-green animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 rounded-full bg-brand-green animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 rounded-full bg-brand-green animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === "SUCCESS" && (
                        <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-500">
                            {/* Success Icon with Animation */}
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                {/* Success checkmark */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 animate-in zoom-in-50 duration-700">
                                    <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
                                </div>
                                {/* Outer glow ring */}
                                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/30 to-green-600/30 rounded-full blur-xl animate-pulse"></div>
                            </div>

                            {/* Success Message */}
                            <div className="space-y-2 mb-8">
                                <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
                                <p className="text-slate-600 text-sm max-w-[280px] mx-auto leading-relaxed">
                                    Your payment of <span className="font-bold text-brand-green">{invoice.currency} {invoice.amount.toLocaleString()}</span> has been received successfully.
                                </p>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 mb-6 border border-slate-100">
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Invoice ID
                                        </p>
                                        <p className="text-sm font-bold text-slate-900">#{invoice.id.slice(0, 8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Payment Method
                                        </p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {(() => {
                                                const provider = selectedProvider || "Unknown";
                                                if (provider.toLowerCase().includes('tigo')) return 'YAS';
                                                return provider;
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Amount Paid
                                        </p>
                                        <p className="text-sm font-bold text-slate-900">{invoice.currency} {invoice.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleClose}
                                    className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-slate-900/30 transition-all shadow-md"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={handleDownloadReceipt}
                                    className="w-full py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Download Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
}