"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    RefreshCw,
    Search,
    Filter,
    ShieldCheck,
    FileText,
    CheckCircle,
    Clock,
    ArrowRight,
    X,
    FileSpreadsheet,
    Percent,
    AlertCircle,
    Activity,
    ChevronLeft,
    ChevronRight,
    Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamic Recharts import for Next.js SSR friendliness
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";

interface RevenueData {
    grossRevenue: number;
    pendingRevenue: number;
    netPremium: number;
    tiraLevy: number;
    stampDuty: number;
    gatewayBreakdown: { name: string; count: number; volume: number }[];
    timeline: { month: string; year: number; index: number; revenue: number; unpaid: number }[];
    transactions: {
        id: string;
        orderId: string;
        clientName: string;
        policyName: string;
        policyCode: string;
        status: "PAID" | "UNPAID";
        grossAmount: number;
        netPremium: number;
        tiraLevy: number;
        stampDuty: number;
        provider: string;
        transactionId: string;
        paidAt: string | null;
        issuedAt: string;
    }[];
    isDemoData: boolean;
}

export default function AdminRevenueReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<RevenueData | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [gatewayFilter, setGatewayFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedPeriod, setSelectedPeriod] = useState("12months");
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Mounted check to prevent hydration mismatch for Recharts
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    const fetchRevenueStats = async () => {
        try {
            setRefreshing(true);
            const res = await fetch("/api/admin/reports/revenue");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                console.error("Failed to fetch revenue reports");
            }
        } catch (error) {
            console.error("Error fetching revenue stats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetchRevenueStats();
        }
    }, [session]);

    // Format currency to TZS format
    const formatTZS = (value: number) => {
        return new Intl.NumberFormat("en-TZ", {
            style: "currency",
            currency: "TZS",
            maximumFractionDigits: 0
        }).format(value);
    };

    // Filter and search transactions
    const filteredTransactions = useMemo(() => {
        if (!data?.transactions) return [];
        
        return data.transactions.filter(tx => {
            const matchesSearch = 
                tx.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.policyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGateway = 
                gatewayFilter === "ALL" || 
                tx.provider.toUpperCase() === gatewayFilter.toUpperCase();

            const matchesStatus = 
                statusFilter === "ALL" || 
                tx.status.toUpperCase() === statusFilter.toUpperCase();

            return matchesSearch && matchesGateway && matchesStatus;
        });
    }, [data, searchTerm, gatewayFilter, statusFilter]);

    // Pagination slice
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, gatewayFilter, statusFilter]);

    // Format carrier labels beautifully
    const getGatewayColor = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("azam")) return "#009FE3"; // Azam Blue
        if (lower.includes("mpesa") || lower.includes("m-pesa")) return "#E61C24"; // Vodacom Red
        if (lower.includes("tigo")) return "#0033A0"; // Tigo Blue
        if (lower.includes("airtel")) return "#E31837"; // Airtel Red
        return "#64748B"; // Bank Transfer / Slate Gray
    };

    // Export to CSV Function
    const handleExportCSV = () => {
        if (!data?.transactions) return;

        const headers = [
            "Invoice ID",
            "Order ID",
            "Client Name",
            "Policy Name",
            "Policy Code",
            "Status",
            "Gross Amount (TZS)",
            "Net Premium (TZS)",
            "TIRA Levy (1%) (TZS)",
            "Stamp Duty (TZS)",
            "Payment Gateway",
            "Transaction Reference",
            "Issued Date",
            "Paid Date"
        ];

        const csvRows = [
            headers.join(","), // Header row
            ...filteredTransactions.map(tx => [
                `"${tx.id}"`,
                `"${tx.orderId}"`,
                `"${tx.clientName.replace(/"/g, '""')}"`,
                `"${tx.policyName.replace(/"/g, '""')}"`,
                `"${tx.policyCode}"`,
                `"${tx.status}"`,
                tx.grossAmount,
                tx.netPremium,
                tx.tiraLevy,
                tx.stampDuty,
                `"${tx.provider}"`,
                `"${tx.transactionId}"`,
                `"${new Date(tx.issuedAt).toLocaleDateString()}"`,
                tx.paidAt ? `"${new Date(tx.paidAt).toLocaleDateString()}"` : "N/A"
            ].join(","))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `NIIS-T_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export to PDF Function using jsPDF + jsPDF-AutoTable
    const handleExportPDF = async () => {
        if (!data) return;

        try {
            // Dynamically import jsPDF to remain SSR safe
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF("landscape", "mm", "a4");
            const pageWidth = doc.internal.pageSize.width;
            
            // Branded PDF Header
            doc.setFillColor(15, 23, 42); // Dark slate header background
            doc.rect(0, 0, pageWidth, 42, "F");

            // Branded text
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("NIIS-T - REVENUE AUDIT REPORT", 15, 18);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(203, 213, 225); // Slate 300
            doc.text("Tanzania Import Insurance Portal - Financial intelligence & Compliance Report", 15, 25);
            doc.text(`Generated on: ${new Date().toLocaleString()} | Administrator Access`, 15, 30);

            // PDF Stats Summary boxes
            doc.setFillColor(30, 41, 59); // Inner boxes
            doc.rect(15, 48, 60, 20, "F");
            doc.rect(82, 48, 60, 20, "F");
            doc.rect(149, 48, 60, 20, "F");
            doc.rect(216, 48, 66, 20, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text("GROSS REVENUE", 20, 53);
            doc.text("NET PREMIUM", 87, 53);
            doc.text("TIRA LEVY (1%)", 154, 53);
            doc.text("STAMP DUTY", 221, 53);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(formatTZS(data.grossRevenue), 20, 62);
            doc.text(formatTZS(data.netPremium), 87, 62);
            doc.text(formatTZS(data.tiraLevy), 154, 62);
            doc.text(formatTZS(data.stampDuty), 221, 62);

            // Invoice Grid header
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("REVENUE TRANSACTION AUDIT LOG", 15, 78);

            // Setup table data
            const tableHeaders = [
                ["Invoice ID", "Client Name", "Policy Code", "Status", "Gateway", "Net Premium", "TIRA Levy", "Gross TZS", "Paid Date"]
            ];

            const tableRows = filteredTransactions.map(tx => [
                tx.id.toUpperCase(),
                tx.clientName,
                tx.policyCode,
                tx.status,
                tx.provider,
                formatTZS(tx.netPremium),
                formatTZS(tx.tiraLevy),
                formatTZS(tx.grossAmount),
                tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : "N/A"
            ]);

            // Draw AutoTable
            autoTable(doc, {
                startY: 83,
                head: tableHeaders,
                body: tableRows,
                theme: "grid",
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: "bold",
                    halign: "center"
                },
                styles: {
                    fontSize: 8.5,
                    cellPadding: 3,
                    valign: "middle"
                },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 55 },
                    3: { halign: "center" },
                    4: { halign: "center" },
                    5: { halign: "right" },
                    6: { halign: "right" },
                    7: { halign: "right" }
                },
                didParseCell: function(dataCell) {
                    if (dataCell.column.index === 3 && dataCell.cell.section === "body") {
                        if (dataCell.cell.text[0] === "PAID") {
                            dataCell.cell.styles.textColor = [22, 101, 52]; // Green text
                        } else {
                            dataCell.cell.styles.textColor = [153, 27, 27]; // Red text
                        }
                    }
                }
            });

            // Footer notes
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "italic");
            doc.text("Confidential document. Produced for administrative financial reconciliation & auditing purposes under TIRA regulations.", 15, finalY);
            
            // Save file
            doc.save(`NIIS-T_Revenue_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Error creating PDF: ", error);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <Coins className="w-6 h-6 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Retrieving Financial Analytics</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Connecting to secured treasury records and compiling TIRA audit summaries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            {/* Upper Grid Layout Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                {/* Demo Banner */}
                {data?.isDemoData && (
                    <div className="mb-6 flex items-center justify-between p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-amber-100/80 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Demo Data Layer Active</h4>
                                <p className="text-xs text-amber-700/90 mt-0.5">
                                    Low invoice volume detected in current workspace database. Seeding state-of-the-art interactive visualization graphics for representation.
                                </p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md tracking-wider">DEMO</span>
                    </div>
                )}

                {/* Header Action Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            System Financial Intelligence
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Revenue Analytics & Auditing
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Real-time tracking of Premium collections, TIRA Levies, and payment carrier metrics.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={fetchRevenueStats}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 active:scale-98 transition-all shadow-sm disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-gray-500", refreshing && "animate-spin")} />
                            {refreshing ? "Updating..." : "Sync Records"}
                        </button>

                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                        <button 
                            onClick={handleExportCSV}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 active:scale-98 transition-all shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            Export CSV
                        </button>

                        <button 
                            onClick={handleExportPDF}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg active:scale-98 transition-all shadow-md shadow-emerald-600/10"
                        >
                            <Download className="w-4 h-4" />
                            Auditor PDF
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                    
                    {/* Gross Revenue */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-80 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <Coins className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                14.2%
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Gross Collected</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors relative z-10">
                            {data ? formatTZS(data.grossRevenue) : "N/A"}
                        </h3>
                    </div>

                    {/* Net Premium */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-80 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Coins className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                12.8%
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Net Premium</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors relative z-10">
                            {data ? formatTZS(data.netPremium) : "N/A"}
                        </h3>
                    </div>

                    {/* TIRA Levy */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-80 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <Percent className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                                1.0% Levy
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">TIRA collections</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-700 transition-colors relative z-10">
                            {data ? formatTZS(data.tiraLevy) : "N/A"}
                        </h3>
                    </div>

                    {/* Stamp Duty */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl opacity-80 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold rounded-full uppercase">
                                Flat Fee
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Stamp Duties</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors relative z-10">
                            {data ? formatTZS(data.stampDuty) : "N/A"}
                        </h3>
                    </div>

                    {/* Pending Revenue */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-80 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">
                                <ArrowDownRight className="w-3 h-3" />
                                3.1%
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Unpaid Backlog</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors relative z-10">
                            {data ? formatTZS(data.pendingRevenue) : "N/A"}
                        </h3>
                    </div>
                </div>

                {/* Grid Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Left: Monthly Trend Dual-Axis Recharts Area & Line */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Revenue Performance Curve</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Dual-axis premium growth versus outstanding unpaid invoices</p>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-1.5 rounded-lg text-xs font-semibold">
                                <button
                                    onClick={() => setSelectedPeriod("12months")}
                                    className={cn("px-2.5 py-1 rounded-md transition-all", selectedPeriod === "12months" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900")}
                                >
                                    Last 12 M
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod("6months")}
                                    className={cn("px-2.5 py-1 rounded-md transition-all", selectedPeriod === "6months" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900")}
                                >
                                    Last 6 M
                                </button>
                            </div>
                        </div>

                        {/* Recharts Container */}
                        <div className="h-72 w-full mt-2 relative">
                            {isMounted && data?.timeline ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart 
                                        data={selectedPeriod === "6months" ? data.timeline.slice(-6) : data.timeline}
                                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                                            </linearGradient>
                                            <linearGradient id="colorUnpaid" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis 
                                            dataKey="month" 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }}
                                        />
                                        <YAxis 
                                            tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                                            tickLine={false} 
                                            axisLine={false} 
                                            tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }}
                                        />
                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs font-medium space-y-1.5">
                                                            <p className="font-bold text-gray-300">{label}</p>
                                                            <div className="h-px bg-slate-800 my-1"></div>
                                                            <p className="flex items-center justify-between gap-4">
                                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Collected:</span>
                                                                <span className="font-bold text-emerald-400">{formatTZS(Number(payload[0].value))}</span>
                                                            </p>
                                                            <p className="flex items-center justify-between gap-4">
                                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>Unpaid:</span>
                                                                <span className="font-bold text-amber-400">{formatTZS(Number(payload[1].value))}</span>
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend 
                                            verticalAlign="top" 
                                            height={36} 
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={(value) => <span className="text-xs font-semibold text-slate-500 ml-1.5 capitalize">{value === "revenue" ? "Premium Collected" : "Outstanding Backlog"}</span>}
                                        />
                                        <Area 
                                            name="revenue" 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#10B981" 
                                            strokeWidth={2.5} 
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)" 
                                        />
                                        <Area 
                                            name="unpaid" 
                                            type="monotone" 
                                            dataKey="unpaid" 
                                            stroke="#F59E0B" 
                                            strokeWidth={1.5} 
                                            strokeDasharray="4 4"
                                            fillOpacity={1} 
                                            fill="url(#colorUnpaid)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                                    <p className="text-sm font-semibold text-slate-400">Processing graph visualization...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Payment Carrier Share Donut */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Payment Gateway Share</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Premium volume and carrier transactions percentage split</p>
                        </div>

                        {/* Recharts Pie Donut */}
                        <div className="h-48 w-full my-4 relative flex items-center justify-center">
                            {isMounted && data?.gatewayBreakdown ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const payloadData = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-800 text-xs font-medium space-y-1">
                                                            <p className="font-bold text-gray-300">{payloadData.name}</p>
                                                            <p className="text-emerald-400 font-bold">{formatTZS(payloadData.value)}</p>
                                                            <p className="text-gray-400 text-[10px]">{payloadData.count} Successful payments</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Pie
                                            data={data.gatewayBreakdown.filter(item => item.volume > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="volume"
                                        >
                                            {data.gatewayBreakdown.filter(item => item.volume > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getGatewayColor(entry.name)} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-32 h-32 rounded-full border-8 border-slate-100 animate-pulse"></div>
                            )}

                            {/* Donut Center Label */}
                            {data && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Audited</span>
                                    <span className="text-sm font-black text-slate-800 mt-0.5">
                                        TZS {(data.grossRevenue / 1000000).toFixed(1)}M
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Custom Legend for Carriers */}
                        <div className="space-y-1.5 mt-2">
                            {data?.gatewayBreakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getGatewayColor(item.name) }}></div>
                                        <span className="text-slate-600">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-800 font-bold">{formatTZS(item.volume)}</span>
                                        <span className="text-slate-400 text-[10px] ml-1.5">
                                            ({data.grossRevenue > 0 ? ((item.volume / data.grossRevenue) * 100).toFixed(0) : 0}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Audit log Table Control Section */}
                <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm mb-6">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Reconciliation Log</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Search and double-audit invoice entries, policy code mappings, and stamps</p>
                        </div>

                        {/* Search and Filters grid */}
                        <div className="flex flex-wrap items-center gap-3">
                            
                            {/* Search bar */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search invoice, client, code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Gateway selector */}
                            <div className="relative">
                                <select
                                    value={gatewayFilter}
                                    onChange={(e) => setGatewayFilter(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Gateways</option>
                                    <option value="M-PESA">M-Pesa Only</option>
                                    <option value="AZAM PAY">Azam Pay Only</option>
                                    <option value="TIGO PESA">Tigo Pesa Only</option>
                                    <option value="AIRTEL MONEY">Airtel Money Only</option>
                                    <option value="BANK TRANSFER">Bank Transfers</option>
                                </select>
                                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PAID">Paid Only</option>
                                    <option value="UNPAID">Unpaid Only</option>
                                </select>
                                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4 font-black">Invoice Reference</th>
                                    <th className="py-3 px-4">Client Name</th>
                                    <th className="py-3 px-4">Policy Code</th>
                                    <th className="py-3 px-4">Gateway</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Net Premium</th>
                                    <th className="py-3 px-4 text-right">TIRA (1%)</th>
                                    <th className="py-3 px-4 text-right">Gross Total</th>
                                    <th className="py-3 px-4 text-center">Paid Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-extrabold text-slate-800 uppercase tracking-tight">{tx.id}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{tx.transactionId}</div>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[150px] truncate">{tx.clientName}</td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-700">{tx.policyCode}</div>
                                                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{tx.policyName}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getGatewayColor(tx.provider) }}></span>
                                                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide">{tx.provider}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide",
                                                    tx.status === "PAID" 
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                                        : "bg-amber-50 text-amber-700 border border-amber-100"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-semibold text-slate-600">{formatTZS(tx.netPremium)}</td>
                                            <td className="py-3.5 px-4 text-right font-semibold text-indigo-600">{formatTZS(tx.tiraLevy)}</td>
                                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatTZS(tx.grossAmount)}</td>
                                            <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                                                {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : "N/A"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-slate-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm font-semibold">No records match current filters</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination control row */}
                    {filteredTransactions.length > 0 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 text-xs font-semibold text-slate-500">
                            <p>
                                Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
                                </span>{" "}
                                of <span className="font-bold text-slate-800">{filteredTransactions.length}</span> audit logs
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                <span className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-slate-800 font-extrabold">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
