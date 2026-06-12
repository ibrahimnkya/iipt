"use client";

import { useEffect, useState } from "react";
import {
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    MoreVertical,
    Building2,
    Mail,
    Phone
} from "lucide-react";
import { toast } from "sonner";

interface Insurer {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    logoUrl?: string;
    createdAt: string;
    brelaNumber?: string;
    tinNumber?: string;
}

export default function InsurersPage() {
    const [insurers, setInsurers] = useState<Insurer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

    const fetchInsurers = async () => {
        try {
            const res = await fetch("/api/insurers");
            if (res.ok) {
                const data = await res.json();
                setInsurers(data);
            } else {
                toast.error("Failed to fetch insurers");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsurers();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
        try {
            const res = await fetch(`/api/insurers/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Insurer ${newStatus.toLowerCase()} successfully`);
                fetchInsurers(); // Refresh list
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred");
        }
    };

    const filteredInsurers = insurers.filter(insurer => {
        const matchesSearch =
            insurer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            insurer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            insurer.brelaNumber?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || insurer.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-brand-blue" />
                        Insurers Management
                    </h1>
                    <p className="text-gray-500 mt-2">Manage insurance companies and approvals.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === "ALL" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("PENDING")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${statusFilter === "PENDING" ? "bg-yellow-50 text-yellow-700" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Pending
                    </button>
                    <button
                        onClick={() => setStatusFilter("APPROVED")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === "APPROVED" ? "bg-green-50 text-green-700" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        Approved
                    </button>
                </div>
            </div>

            {/* Sub-header / Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or BRELA..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading insurers...</div>
                ) : filteredInsurers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-bold">No insurers found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredInsurers.map((insurer) => (
                        <div key={insurer.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Status Indicator */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${insurer.status === "APPROVED" ? "bg-green-100 text-green-600" :
                                        insurer.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                                            "bg-red-100 text-red-600"
                                    }`}>
                                    <Building2 className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black text-gray-900 truncate">{insurer.fullName}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${insurer.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                insurer.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-red-100 text-red-700"
                                            }`}>
                                            {insurer.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {insurer.email}
                                        </div>
                                        {insurer.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {insurer.phone}
                                            </div>
                                        )}
                                        {insurer.brelaNumber && (
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                BRELA: {insurer.brelaNumber}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Joined {new Date(insurer.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
                                    {insurer.status === "PENDING" && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(insurer.id, "APPROVED")}
                                                className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(insurer.id, "REJECTED")}
                                                className="flex-1 md:flex-none px-4 py-2 bg-white text-red-600 border border-gray-200 text-sm font-bold rounded-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {insurer.status !== "PENDING" && (
                                        <div className="text-sm font-medium text-gray-400 italic px-4">
                                            {insurer.status === "APPROVED" ? "Active Account" : "Access Denied"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
