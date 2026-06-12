"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Activity,
    FileText,
    Download,
    RefreshCw,
    Search,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Ship,
    Truck,
    Plane,
    Package,
    FileSpreadsheet,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowUpRight,
    Eye,
    BarChart3
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClaimRecord {
    id: string;
    sadNumber: string;
    hsCode: string;
    clientName: string;
    companyName: string | null;
    policyName: string;
    policyCode: string;
    clauseType: string;
    transportMode: string;
    cargoDescription: string;
    cargoNature: string;
    originPort: string;
    destinationPort: string;
    sumInsured: number;
    currency: string;
    invoiceAmount: number;
    invoiceStatus: string;
    orderStatus: string;
    claimsDetails: string;
    coverType: string;
    createdAt: string;
    dispatchDate: string;
}

interface TransportBreakdownItem {
    mode: string;
    count: number;
    exposure: number;
}

interface PolicyBreakdownItem {
    name: string;
    code: string;
    count: number;
    exposure: number;
}

interface ClaimsData {
    totalOrders: number;
    totalClaimsReported: number;
    totalSumAtRisk: number;
    totalInvoiceExposure: number;
    claimsRate: number;
    statusBreakdown: Record<string, number>;
    transportBreakdown: TransportBreakdownItem[];
    policyBreakdown: PolicyBreakdownItem[];
    timeline: { month: string; claims: number; exposure: number }[];
    claims: ClaimRecord[];
    isDemoData: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTZS = (v: number) =>
    new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        maximumFractionDigits: 0
    }).format(v);

const formatMillions = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
    return v.toLocaleString();
};

const TRANSPORT_ICONS: Record<string, React.ElementType> = {
    SEA:  Ship,
    ROAD: Truck,
    AIR:  Plane
};

const TRANSPORT_COLORS: Record<string, string> = {
    SEA:  "#3B82F6",
    ROAD: "#F97316",
    AIR:  "#A855F7"
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    PENDING:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock        },
    APPROVED:  { label: "Approved",  bg: "bg-blue-50",    text: "text-blue-700",    icon: CheckCircle2 },
    ISSUED:    { label: "Issued",    bg: "bg-indigo-50",  text: "text-indigo-700",  icon: FileText     },
    PAID:      { label: "Paid",      bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", bg: "bg-rose-50",    text: "text-rose-700",    icon: XCircle      }
};

const PIE_COLORS = ["#3B82F6", "#F97316", "#A855F7", "#10B981", "#EF4444"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminClaimsReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data,       setData]       = useState<ClaimsData | null>(null);
    const [isMounted,  setIsMounted]  = useState(false);

    // Filters & Search
    const [searchTerm,       setSearchTerm]       = useState("");
    const [transportFilter,  setTransportFilter]  = useState("ALL");
    const [statusFilter,     setStatusFilter]      = useState("ALL");
    const [expandedClaimId,  setExpandedClaimId]  = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (session?.user?.role !== "ADMIN") router.push("/dashboard");
    }, [status, session, router]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const res = await fetch("/api/admin/reports/claims");
            if (res.ok) setData(await res.json());
            else console.error("Failed to fetch claims reports");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "ADMIN") fetchData();
    }, [session]);

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredClaims = useMemo(() => {
        if (!data?.claims) return [];
        return data.claims.filter(c => {
            const q = searchTerm.toLowerCase();
            const matchSearch =
                c.clientName.toLowerCase().includes(q) ||
                c.policyCode.toLowerCase().includes(q) ||
                c.sadNumber.toLowerCase().includes(q)  ||
                c.cargoDescription.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q);

            const matchTransport =
                transportFilter === "ALL" ||
                c.transportMode.toUpperCase() === transportFilter;

            const matchStatus =
                statusFilter === "ALL" ||
                c.orderStatus.toUpperCase() === statusFilter;

            return matchSearch && matchTransport && matchStatus;
        });
    }, [data, searchTerm, transportFilter, statusFilter]);

    const paginated   = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredClaims.slice(start, start + itemsPerPage);
    }, [filteredClaims, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredClaims.length / itemsPerPage));

    useEffect(() => { setCurrentPage(1); }, [searchTerm, transportFilter, statusFilter]);

    // ── Exports ───────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (!data?.claims) return;
        const headers = [
            "Order ID","SAD Number","HS Code","Client","Company","Policy Code",
            "Clause","Transport Mode","Cargo Description","Cargo Nature",
            "Origin Port","Dest Port","Sum Insured (TZS)","Invoice Amt (TZS)",
            "Order Status","Cover Type","Claim Details","Created At"
        ];
        const rows = filteredClaims.map(c => [
            `"${c.id}"`,`"${c.sadNumber}"`,`"${c.hsCode}"`,
            `"${c.clientName.replace(/"/g,'""')}"`,
            `"${(c.companyName ?? "").replace(/"/g,'""')}"`,
            `"${c.policyCode}"`,`"${c.clauseType}"`,`"${c.transportMode}"`,
            `"${c.cargoDescription.replace(/"/g,'""')}"`,`"${c.cargoNature}"`,
            `"${c.originPort}"`,`"${c.destinationPort}"`,
            c.sumInsured, c.invoiceAmount,
            `"${c.orderStatus}"`,`"${c.coverType}"`,
            `"${c.claimsDetails.replace(/"/g,'""')}"`,
            `"${new Date(c.createdAt).toLocaleDateString()}"`
        ].join(","));

        const csv  = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", `NIIS-T_Claims_Report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = async () => {
        if (!data) return;
        try {
            const { default: jsPDF }    = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc       = new jsPDF("landscape", "mm", "a4");
            const pageWidth = doc.internal.pageSize.width;

            // Header band
            doc.setFillColor(127, 29, 29);
            doc.rect(0, 0, pageWidth, 42, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("NIIS-T — CLAIMS AUDIT REPORT", 15, 17);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(252, 165, 165);
            doc.text("Tanzania Import Insurance Portal — Claims Intelligence & Risk Exposure Summary", 15, 24);
            doc.text(`Generated: ${new Date().toLocaleString()} | Restricted: Administrator Access`, 15, 30);

            // KPI boxes
            const boxes = [
                { label: "CLAIMS REPORTED",   value: String(data.totalClaimsReported)              },
                { label: "CLAIMS RATE",        value: `${data.claimsRate.toFixed(1)}%`              },
                { label: "TOTAL SUM AT RISK",  value: `TZS ${formatMillions(data.totalSumAtRisk)}`  },
                { label: "INVOICE EXPOSURE",   value: `TZS ${formatMillions(data.totalInvoiceExposure)}` }
            ];
            boxes.forEach((b, i) => {
                const x = 15 + i * 72;
                doc.setFillColor(69, 10, 10);
                doc.rect(x, 48, 68, 22, "F");
                doc.setTextColor(252, 165, 165);
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text(b.label, x + 4, 54);
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(13);
                doc.text(b.value, x + 4, 64);
            });

            // Table
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.text("CLAIMS CASE REGISTER", 15, 82);

            autoTable(doc, {
                startY: 87,
                head:   [[
                    "Order ID","Client","Policy Code","Transport","Status",
                    "Cargo Description","Sum Insured","Invoice Amt","Created"
                ]],
                body: filteredClaims.map(c => [
                    c.id.toUpperCase(),
                    c.clientName,
                    c.policyCode,
                    c.transportMode,
                    c.orderStatus,
                    c.cargoDescription.slice(0, 40),
                    formatTZS(c.sumInsured),
                    formatTZS(c.invoiceAmount),
                    new Date(c.createdAt).toLocaleDateString()
                ]),
                theme: "grid",
                headStyles: { fillColor: [127, 29, 29], textColor: [255,255,255], fontSize: 8.5, fontStyle: "bold", halign: "center" },
                styles: { fontSize: 8, cellPadding: 2.5, valign: "middle" },
                didParseCell: (cell) => {
                    if (cell.column.index === 4 && cell.cell.section === "body") {
                        const t = cell.cell.text[0];
                        if (t === "PAID")      cell.cell.styles.textColor = [22, 101, 52];
                        if (t === "CANCELLED") cell.cell.styles.textColor = [153, 27, 27];
                        if (t === "PENDING")   cell.cell.styles.textColor = [146, 64, 14];
                    }
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 12;
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.text(
                "Confidential — For authorised NIIS-T administrators only. Claims data subject to TIRA compliance guidelines.",
                15, finalY
            );

            doc.save(`NIIS-T_Claims_Report_${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (err) {
            console.error("PDF generation error:", err);
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        <ShieldAlert className="w-6 h-6 text-rose-500 absolute inset-0 m-auto" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Loading Claims Intelligence</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Aggregating risk exposure data and claims case registry…
                    </p>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Demo Banner */}
                {data?.isDemoData && (
                    <div className="mb-6 flex items-center justify-between p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Demo Visualisation Mode</h4>
                                <p className="text-xs text-amber-700/90 mt-0.5">
                                    Insufficient live claims data found. Rich demo analytics loaded for demonstration purposes.
                                </p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md tracking-wider">DEMO</span>
                    </div>
                )}

                {/* ── Page Header ──────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Risk & Claims Intelligence
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Claims Analytics & Risk Audit
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Comprehensive view of reported cargo claims, exposure trends, and transport risk patterns.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                            {refreshing ? "Syncing…" : "Sync Records"}
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                            Export CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-rose-700/20"
                        >
                            <Download className="w-4 h-4" />
                            Auditor PDF
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    {/* Total Claims */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-rose-600" />
                            </div>
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                                Active Cases
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Claims Reported</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-rose-700 transition-colors relative z-10">
                            {data?.totalClaimsReported ?? 0}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">
                            Out of {data?.totalOrders ?? 0} total orders
                        </p>
                    </div>

                    {/* Claims Rate */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className={cn(
                                "flex items-center gap-0.5 px-2 py-0.5 text-xs font-bold rounded-full",
                                (data?.claimsRate ?? 0) < 10
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                            )}>
                                {(data?.claimsRate ?? 0) < 10
                                    ? <TrendingDown className="w-3 h-3" />
                                    : <TrendingUp   className="w-3 h-3" />}
                                {(data?.claimsRate ?? 0) < 10 ? "Controlled" : "Elevated"}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Claims Rate</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-orange-700 transition-colors relative z-10">
                            {data?.claimsRate?.toFixed(1) ?? "0.0"}%
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">Industry avg. ≤ 8%</p>
                    </div>

                    {/* Sum at Risk */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                Sum Insured
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Total Sum at Risk</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors relative z-10">
                            TZS {data ? formatMillions(data.totalSumAtRisk) : "0"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">Aggregate insured value</p>
                    </div>

                    {/* Invoice Exposure */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                                Premium Risk
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">Invoice Exposure</p>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors relative z-10">
                            TZS {data ? formatMillions(data.totalInvoiceExposure) : "0"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">Premium billed on claims orders</p>
                    </div>
                </div>

                {/* ── Charts Row 1 ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Monthly Claims Trend Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Monthly Claims Trend</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Number of reported claims & exposure over the last 12 months</p>
                        </div>

                        <div className="h-72">
                            {isMounted && data?.timeline ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.timeline}
                                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                                        barSize={18}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: "#64748B", fontSize: 10 }}
                                            label={{ value: "Claims", angle: -90, position: "insideLeft", style: { fill: "#94A3B8", fontSize: 10 }, offset: 10 }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tickFormatter={v => `${(v / 1_000_000_000).toFixed(0)}B`}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: "#64748B", fontSize: 10 }}
                                        />
                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload?.length) return null;
                                                return (
                                                    <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs space-y-1.5">
                                                        <p className="font-bold text-gray-300">{label}</p>
                                                        <div className="h-px bg-slate-800" />
                                                        <p className="flex items-center justify-between gap-4">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-2 h-2 bg-rose-500 rounded-full" />
                                                                Cases:
                                                            </span>
                                                            <span className="font-bold text-rose-400">{payload[0]?.value}</span>
                                                        </p>
                                                        <p className="flex items-center justify-between gap-4">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                                                                Exposure:
                                                            </span>
                                                            <span className="font-bold text-blue-300">
                                                                TZS {formatMillions(Number(payload[1]?.value ?? 0))}
                                                            </span>
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={v => (
                                                <span className="text-xs font-semibold text-slate-500 ml-1">
                                                    {v === "claims" ? "Claims Count" : "Sum at Risk (TZS)"}
                                                </span>
                                            )}
                                        />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="claims"
                                            name="claims"
                                            fill="#EF4444"
                                            radius={[4, 4, 0, 0]}
                                            opacity={0.85}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="exposure"
                                            name="exposure"
                                            fill="#93C5FD"
                                            radius={[4, 4, 0, 0]}
                                            opacity={0.7}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transport Mode Donut */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Claims by Transport</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Risk distribution across shipping modes</p>
                        </div>

                        <div className="relative h-44 flex-shrink-0">
                            {isMounted && data?.transportBreakdown ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload?.length) return null;
                                                const p = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-800 text-xs space-y-1">
                                                        <p className="font-bold">{p.mode}</p>
                                                        <p className="text-rose-400 font-bold">{p.count} cases</p>
                                                        <p className="text-blue-300">
                                                            TZS {formatMillions(p.exposure)} exposure
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Pie
                                            data={data.transportBreakdown}
                                            dataKey="count"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={4}
                                        >
                                            {data.transportBreakdown.map((entry, i) => (
                                                <Cell key={i} fill={TRANSPORT_COLORS[entry.mode] ?? PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                                </div>
                            )}
                            {/* Centre label */}
                            {data && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                    <span className="text-lg font-black text-slate-800">{data.totalClaimsReported}</span>
                                </div>
                            )}
                        </div>

                        {/* Transport Legend */}
                        <div className="mt-4 space-y-2 flex-1">
                            {data?.transportBreakdown.map((t, idx) => {
                                const Icon  = TRANSPORT_ICONS[t.mode] ?? Package;
                                const color = TRANSPORT_COLORS[t.mode] ?? PIE_COLORS[idx % PIE_COLORS.length];
                                const pct   = data.totalClaimsReported > 0
                                    ? Math.round((t.count / data.totalClaimsReported) * 100)
                                    : 0;
                                return (
                                    <div key={t.mode} className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: color + "20" }}>
                                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-0.5">
                                                <span>{t.mode}</span>
                                                <span>{t.count} cases · {pct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Charts Row 2 ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Policy Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Claims by Policy Type</h3>
                        <p className="text-xs text-gray-500 mb-5">Exposure and case count per insurance product</p>

                        <div className="space-y-4">
                            {data?.policyBreakdown.map((p, idx) => {
                                const color  = PIE_COLORS[idx % PIE_COLORS.length];
                                const maxExp = Math.max(...(data?.policyBreakdown.map(x => x.exposure) ?? [1]));
                                const pct    = maxExp > 0 ? Math.round((p.exposure / maxExp) * 100) : 0;
                                return (
                                    <div key={idx}>
                                        <div className="flex items-start justify-between mb-1.5">
                                            <div className="min-w-0 mr-3">
                                                <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.code}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-extrabold text-slate-900">{p.count} cases</p>
                                                <p className="text-[10px] text-slate-400">TZS {formatMillions(p.exposure)}</p>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Claims by Order Status</h3>
                        <p className="text-xs text-gray-500 mb-5">Claim resolution pipeline at a glance</p>

                        <div className="space-y-3">
                            {Object.entries(data?.statusBreakdown ?? {}).map(([st, count]) => {
                                const cfg   = STATUS_CONFIG[st] ?? { label: st, bg: "bg-gray-50", text: "text-gray-700", icon: Package };
                                const Icon  = cfg.icon;
                                const total = data?.totalClaimsReported ?? 1;
                                const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                                return (
                                    <div key={st} className={cn("flex items-center justify-between p-3.5 rounded-xl border", cfg.bg, "border-transparent")}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cfg.bg)}>
                                                <Icon className={cn("w-4 h-4", cfg.text)} />
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-bold", cfg.text)}>{cfg.label}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">{pct}% of claims</p>
                                            </div>
                                        </div>
                                        <span className={cn("text-2xl font-extrabold", cfg.text)}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Claims Case Register Table ───────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Claims Case Register</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Search, filter, and expand individual claim records
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search client, code, SAD…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-700"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Transport filter */}
                            <div className="relative">
                                <select
                                    value={transportFilter}
                                    onChange={e => setTransportFilter(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Modes</option>
                                    <option value="SEA">Sea Only</option>
                                    <option value="ROAD">Road Only</option>
                                    <option value="AIR">Air Only</option>
                                </select>
                                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="ISSUED">Issued</option>
                                    <option value="PAID">Paid</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-8"></th>
                                    <th className="py-3 px-4">Order / SAD</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Policy</th>
                                    <th className="py-3 px-4 text-center">Transport</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Sum Insured</th>
                                    <th className="py-3 px-4 text-right">Invoice</th>
                                    <th className="py-3 px-4 text-center">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {paginated.length > 0 ? paginated.map((c, idx) => {
                                    const TransIcon = TRANSPORT_ICONS[c.transportMode] ?? Package;
                                    const tColor    = TRANSPORT_COLORS[c.transportMode] ?? "#64748B";
                                    const stCfg     = STATUS_CONFIG[c.orderStatus] ?? STATUS_CONFIG.PENDING;
                                    const StIcon    = stCfg.icon;
                                    const isExpanded = expandedClaimId === c.id;

                                    return (
                                        <>
                                            <tr
                                                key={c.id}
                                                className={cn(
                                                    "hover:bg-rose-50/30 transition-colors cursor-pointer",
                                                    isExpanded && "bg-rose-50/20"
                                                )}
                                                onClick={() => setExpandedClaimId(isExpanded ? null : c.id)}
                                            >
                                                <td className="py-3.5 px-4">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                        isExpanded
                                                            ? "border-rose-500 bg-rose-500"
                                                            : "border-slate-200"
                                                    )}>
                                                        {isExpanded && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="font-extrabold text-slate-800 uppercase text-[10px] tracking-tight">{c.id}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{c.sadNumber}</p>
                                                </td>
                                                <td className="py-3.5 px-4 max-w-[140px]">
                                                    <p className="font-bold text-slate-900 truncate">{c.clientName}</p>
                                                    {c.companyName && (
                                                        <p className="text-[10px] text-slate-400 truncate">{c.companyName}</p>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="font-semibold text-slate-700">{c.policyCode}</p>
                                                    <p className="text-[10px] text-slate-400 max-w-[100px] truncate">{c.clauseType}</p>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide"
                                                        style={{ backgroundColor: tColor + "15", color: tColor }}>
                                                        <TransIcon className="w-3 h-3" />
                                                        {c.transportMode}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border",
                                                        stCfg.bg, stCfg.text, "border-transparent"
                                                    )}>
                                                        <StIcon className="w-2.5 h-2.5" />
                                                        {stCfg.label}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                                    TZS {formatMillions(c.sumInsured)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                                                    {formatTZS(c.invoiceAmount)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center text-slate-500">
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>

                                            {/* Expanded Detail Row */}
                                            {isExpanded && (
                                                <tr key={`${c.id}-expanded`} className="bg-rose-50/30">
                                                    <td colSpan={9} className="px-6 pb-4 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                                            {/* Cargo Info */}
                                                            <div className="bg-white rounded-lg border border-slate-100 p-4">
                                                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Cargo Details</p>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Description</span>
                                                                        <span className="font-bold text-slate-800 text-right max-w-[140px]">{c.cargoDescription}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Nature</span>
                                                                        <span className="font-bold text-slate-800">{c.cargoNature}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">HS Code</span>
                                                                        <span className="font-bold text-slate-800">{c.hsCode}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Cover Type</span>
                                                                        <span className="font-bold text-slate-800">{c.coverType}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Route Info */}
                                                            <div className="bg-white rounded-lg border border-slate-100 p-4">
                                                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Shipment Route</p>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Origin</span>
                                                                        <span className="font-bold text-slate-800">{c.originPort}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Destination</span>
                                                                        <span className="font-bold text-slate-800">{c.destinationPort}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Mode</span>
                                                                        <span className="font-bold text-slate-800">{c.transportMode}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500 font-semibold">Dispatch</span>
                                                                        <span className="font-bold text-slate-800">{new Date(c.dispatchDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Claim Narrative */}
                                                            <div className="bg-rose-50/60 rounded-lg border border-rose-100/60 p-4">
                                                                <p className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                    Claim Narrative
                                                                </p>
                                                                <p className="text-slate-700 font-semibold leading-relaxed text-[11px]">
                                                                    {c.claimsDetails}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={9} className="py-14 text-center text-slate-400">
                                            <AlertCircle className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm font-semibold">No claims match current filters</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredClaims.length > 0 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 text-xs font-semibold text-slate-500">
                            <p>
                                Showing{" "}
                                <span className="font-bold text-slate-800">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.min(currentPage * itemsPerPage, filteredClaims.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-bold text-slate-800">{filteredClaims.length}</span> claims
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-slate-800 font-extrabold">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
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
