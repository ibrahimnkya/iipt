"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    AlertCircle,
    Info,
    Calendar,
    FileText,
    Shield,
    Wallet,
    Book,
    MessageCircle,
    Package,
    ThumbsUp,
    ThumbsDown,
    ArrowRight,
    MessageSquare,
    Phone,
    Mail,
    Share2,
    Check,
    Search,
    Send,
    X,
    Loader2,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Section {
    heading: string;
    content?: string | string[];
    type?: "text" | "list" | "table" | "alert";
    alertType?: "info" | "warning" | "success";
    tableData?: { headers: string[]; rows: string[][] };
}

interface ArticleContent {
    title: string;
    description: string;
    category: string;
    time: string;
    lastUpdated: string;
    icon: any;
    sections: Section[];
}

export default function HelpArticlePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [activeSection, setActiveSection] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [feedbackValue, setFeedbackValue] = useState<"yes" | "no" | null>(null);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
    const [showContactForm, setShowContactForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormLoading(false);
        setFormSuccess(true);
        setTimeout(() => {
            setShowContactForm(false);
            setFormSuccess(false);
        }, 2000);
    };

    const articles: Record<string, ArticleContent> = {
        "create-order": {
            title: "How to Create an Insurance Order",
            description: "Step-by-step guide to submitting import declarations and creating insurance orders",
            category: "Orders & Claims",
            time: "5 min read",
            lastUpdated: "June 2, 2026",
            icon: FileText,
            sections: [
                {
                    heading: "Introduction",
                    content: "Submit your Import Declaration Form (IDF) details online to instantly retrieve premium quotations and bind coverages under registered policies. Doing this digitally bridges the gap between customs clearance and insurance coverage.",
                    type: "text"
                },
                {
                    heading: "Step 1: Select Insurer & Policy",
                    content: "Navigate to the Create Order page. Choose an active insurer and select a policy. Each policy is tied to a specific coverage class (e.g. ICC Class A, B, or C). Review premium rates before proceeding.",
                    type: "text"
                },
                {
                    heading: "Step 2: Enter Cargo Details",
                    content: "Input your Import Declaration Number (IDF), cargo description, HS Code (Harmonized System code for customs classification), packaging type (crates, pallets, containers), and the weight in kilograms.",
                    type: "text"
                },
                {
                    heading: "Step 3: Financial Details",
                    content: "Specify the FOB (Free on Board) cargo value, freight charges, ancillary costs, and currency. The platform automatically calculates the total CIF (Cost, Insurance, and Freight) value and the premium due.",
                    type: "text"
                },
                {
                    heading: "Step 4: File Attachments",
                    content: "Upload copies of your Proforma Invoice, IDF Document, and Bill of Lading. Clean, legible scanned documents speed up the validation process by the insurer.",
                    type: "text"
                },
                {
                    heading: "Verification Alert",
                    content: "Make sure all details exactly match your customs declaration. Any mismatch in HS Code, cargo weight, or IDF number will cause clearance delays at the port of entry.",
                    type: "alert",
                    alertType: "warning"
                }
            ]
        },
        "invoices": {
            title: "Understanding Your Invoice",
            description: "Learn about premium calculations, TIRA levy, stamp duty, and VAT breakdowns",
            category: "Payments",
            time: "4 min read",
            lastUpdated: "May 28, 2026",
            icon: Book,
            sections: [
                {
                    heading: "Introduction",
                    content: "A comprehensive guide to analyzing premium invoice breakdowns, statutory levies, and tax computations issued on NIIS-T. Every invoice is structured in accordance with TIRA (Tanzania Insurance Regulatory Authority) directives.",
                    type: "text"
                },
                {
                    heading: "Invoice Breakdown Components",
                    content: [
                        "Premium Rate: The baseline coverage percentage based on cargo classification and transit route.",
                        "TIRA Levy: The statutory regulatory charge of 1.5% payable to the Tanzania Insurance Regulatory Authority.",
                        "VAT (Value Added Tax): Standard 18% tax applied to the taxable premium base.",
                        "Stamp Duty: Fixed government transaction stamp fee (currently TZS 1,000)."
                    ],
                    type: "list"
                },
                {
                    heading: "Fee Schedule Comparison",
                    content: "The following table details standard calculations on premium invoices:",
                    type: "table",
                    tableData: {
                        headers: ["Fee Item", "Charge Type", "Standard Rate", "Calculated On"],
                        rows: [
                            ["Base Premium", "Variable Rate", "0.2% - 1.5%", "Cargo CIF Value"],
                            ["TIRA Levy", "Regulatory Fee", "1.5%", "Base Premium"],
                            ["VAT", "Government Tax", "18.0%", "Base Premium + Levy"],
                            ["Stamp Duty", "Statutory Fee", "Fixed TZS 1,000", "Per Invoice Issued"]
                        ]
                    }
                }
            ]
        },
        "payment-methods": {
            title: "Payment Methods & Options",
            description: "Complete guide to paying with M-Pesa, Airtel Money, Tigo Pesa, and bank transfers",
            category: "Payments",
            time: "3 min read",
            lastUpdated: "May 25, 2026",
            icon: MessageCircle,
            sections: [
                {
                    heading: "Mobile Money Channels",
                    content: "Importers can settle invoices instantly using all major Tanzanian mobile network operators. When an invoice is paid via mobile checkout, the system receives an instant callback and automatically generates the TIRA cover note.",
                    type: "text"
                },
                {
                    heading: "M-Pesa Checkout Details",
                    content: [
                        "1. Access your M-Pesa menu via *150*00# or open the M-Pesa App.",
                        "2. Select Option 4: Lipa kwa M-Pesa (Pay by M-Pesa).",
                        "3. Select Pay Biller and enter the Biller Code provided in the checkout popover.",
                        "4. Input the unique reference number of your invoice.",
                        "5. Enter the invoice amount and confirm with your PIN."
                    ],
                    type: "list"
                },
                {
                    heading: "Airtel Money & Tigo Pesa Checkout",
                    content: [
                        "1. Access the operator pay menu or use the operator App.",
                        "2. Select pay biller option and key in the biller code shown in the portal.",
                        "3. Always double check that the Reference number matches the Invoice number shown in checkout.",
                        "4. Confirm transaction to prompt checkout status updates."
                    ],
                    type: "list"
                },
                {
                    heading: "Bank Transfer Option",
                    content: "For invoices exceeding TZS 10,000, bank wire transfers are recommended. Choose 'Bank Transfer' during checkout to get deposit details, then upload the deposit slip for quick manual approval by the operations desk.",
                    type: "text"
                }
            ]
        },
        "faqs": {
            title: "Frequently Asked Questions",
            description: "Common questions about import insurance, coverage, and claims process",
            category: "General",
            time: "6 min read",
            lastUpdated: "June 1, 2026",
            icon: HelpCircle,
            sections: [
                {
                    heading: "General FAQ",
                    content: [
                        "Q: How long does it take to get a cover note? -> A: For mobile money payments, the system receives instant callbacks and issues the signed TIRA cover note within 30 seconds.",
                        "Q: Can I edit an order after submission? -> A: Orders in PENDING state can be modified. Once paid or approved by the insurer, changes require support intervention.",
                        "Q: What is a TIRA Cover Note? -> A: It is a digital certificate of marine cargo insurance logged directly on the Tanzania Insurance Regulatory Authority central database, required for customs clearance.",
                        "Q: What currencies are supported? -> A: You can estimate premiums in USD, EUR, or TZS. Mobile checkouts are automatically converted and billed in TZS equivalent."
                    ],
                    type: "list"
                }
            ]
        },
        "coverage": {
            title: "Policy Coverage Explained",
            description: "Understanding ICC (A), (B), and (C) clauses and what they cover",
            category: "Policies",
            time: "7 min read",
            lastUpdated: "May 15, 2026",
            icon: FileText,
            sections: [
                {
                    heading: "Marine Cargo Insurance Clauses",
                    content: "NIIS-T supports three standardized international cargo clauses (ICC). Select the coverage that suits your transit risk profile. Broad coverage clauses minimize financial liability at a slightly higher premium rate.",
                    type: "text"
                },
                {
                    heading: "ICC Clause Comparison",
                    content: "The table below compares the coverage profiles of the three standard cargo clauses:",
                    type: "table",
                    tableData: {
                        headers: ["Clause", "Coverage Level", "Key Risks Included", "Key Exclusions"],
                        rows: [
                            ["ICC (A)", "All Risks (Broadest)", "Theft, water damage, piracy, collision, general average", "Inherent vice, wear & tear, packaging defect"],
                            ["ICC (B)", "Moderate Risk", "Fire, explosion, sinking, collision, washing overboard", "Theft, piracy, deliberate damage"],
                            ["ICC (C)", "Minimum Risk (Narrow)", "Fire, explosion, derailment, sinking, stranding", "Theft, water damage, loading loss"]
                        ]
                    }
                },
                {
                    heading: "Proactive Cover Advice",
                    content: "Importers carrying valuable machinery, electronics, or perishable goods are highly advised to select ICC (A) policies, while bulk raw commodities might find ICC (C) options sufficient.",
                    type: "alert",
                    alertType: "info"
                }
            ]
        },
        "claims": {
            title: "Claim Submission Process",
            description: "How to file a claim, required documentation, and expected timelines",
            category: "Orders & Claims",
            time: "5 min read",
            lastUpdated: "June 5, 2026",
            icon: Clock,
            sections: [
                {
                    heading: "How to File a Claim",
                    content: "In case of cargo loss, damage, or shortage during transit, file a claim through the portal within 30 days of shipment arrival at the destination port.",
                    type: "text"
                },
                {
                    heading: "Process Steps",
                    content: [
                        "1. Notify your Insurer immediately from the dashboard order view page.",
                        "2. Submit a formal Claim Form detailing the damage or short-landing.",
                        "3. Upload required documentation (Survey report, customs entry, packing lists, and photos of damage).",
                        "4. Insurer validates claims and schedules physical or document surveys.",
                        "5. Claim settlement is approved and issued to your designated bank account."
                    ],
                    type: "list"
                },
                {
                    heading: "Filing Deadline Alert",
                    content: "Failure to notify the insurer or initiate claims within 30 days of port discharge may lead to rejection of your claim under standard policy conditions.",
                    type: "alert",
                    alertType: "warning"
                }
            ]
        },
        "documents": {
            title: "Required Documents Checklist",
            description: "Complete list of documents needed for insurance and claims",
            category: "Orders & Claims",
            time: "3 min read",
            lastUpdated: "May 20, 2026",
            icon: FileText,
            sections: [
                {
                    heading: "Mandatory Clearance Documents",
                    content: "Ensure you have high-quality digital copies of these files before starting the order creation process to guarantee automated processing.",
                    type: "text"
                },
                {
                    heading: "Document Guidelines",
                    type: "table",
                    tableData: {
                        headers: ["Document Name", "Required For", "Allowed Formats", "Importance"],
                        rows: [
                            ["Proforma Invoice", "Order Creation", "PDF, JPEG (Max 5MB)", "Mandatory - Establishes FOB value"],
                            ["Import Declaration Form (IDF)", "Order Creation", "PDF (Max 5MB)", "Mandatory - Verified with TIRA registry"],
                            ["Bill of Lading / Air Waybill", "Claims & Validation", "PDF, PNG", "Mandatory for cargo arrival validation"],
                            ["Packing List", "Claims & Disputes", "PDF, Word", "Optional during order, required for claims"]
                        ]
                    }
                }
            ]
        },
        "premiums": {
            title: "Premium Calculation Breakdown",
            description: "How insurance premiums are calculated based on cargo value and type",
            category: "Policies",
            time: "4 min read",
            lastUpdated: "June 3, 2026",
            icon: BookOpen,
            sections: [
                {
                    heading: "How We Compute Your Cost",
                    content: "Insurance premiums are calculated mathematically based on the CIF (Cost, Insurance, and Freight) value of the import shipment.",
                    type: "text"
                },
                {
                    heading: "The Math Formula",
                    content: [
                        "CIF Value = FOB Value + Freight Charges + Ancillary Costs (10% of FOB)",
                        "Base Premium = CIF Value * Policy Premium Rate (%)",
                        "Total Billed = Base Premium + TIRA Levy (1.5%) + VAT (18%) + Stamp Duty (Fixed)"
                    ],
                    type: "list"
                },
                {
                    heading: "Example Calculation",
                    content: "For a machinery shipment with FOB Tsh 10,000,000 and Freight Tsh 1,500,000 under a 0.5% premium rate policy: CIF becomes Tsh 12,500,000. Base Premium is calculated as Tsh 62,500. TIRA Levy adds Tsh 938, VAT adds Tsh 11,419, and Stamp Duty adds Tsh 1,000.",
                    type: "alert",
                    alertType: "success"
                }
            ]
        }
    };

    const article = articles[id];

    // Compute related articles from the same category or General
    const relatedArticles = Object.entries(articles)
        .filter(([key]) => key !== id)
        .map(([key, value]) => ({ key, ...value }))
        .sort((a, b) => {
            if (a.category === article?.category && b.category !== article?.category) return -1;
            if (a.category !== article?.category && b.category === article?.category) return 1;
            return 0;
        })
        .slice(0, 3);

    // Slug builder helper
    const getSlug = (heading: string) => {
        return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    };

    // Scroll spy hook
    useEffect(() => {
        if (!article) return;

        const observerOptions = {
            root: null,
            rootMargin: "-10% 0px -75% 0px", // Trigger when heading is near the top
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        article.sections.forEach((section) => {
            const slug = getSlug(section.heading);
            const el = document.getElementById(slug);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [article]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSidebarSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sidebarSearchQuery.trim()) {
            router.push(`/dashboard/help?q=${encodeURIComponent(sidebarSearchQuery.trim())}`);
        }
    };

    if (status === "loading") {
        return (
            <div className="space-y-8 pb-12 font-sans bg-transparent">
                {/* Breadcrumb & Navigation Bar skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Skeleton className="h-5 w-72 rounded-md" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-36 rounded-xl" />
                        <Skeleton className="h-10 w-28 rounded-xl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Main Article Details (col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="border-b border-slate-100 pb-6 space-y-4">
                                <div className="flex gap-3">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <Skeleton className="h-6 w-24 rounded-md" />
                                </div>
                                <Skeleton className="h-9 w-3/4 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <div className="flex gap-4 pt-4 border-t border-slate-50">
                                    <Skeleton className="h-3.5 w-16 rounded" />
                                    <Skeleton className="h-3.5 w-36 rounded" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="space-y-3">
                                        <Skeleton className="h-5 w-48 rounded" />
                                        <Skeleton className="h-3.5 w-full rounded" />
                                        <Skeleton className="h-3.5 w-5/6 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Card skeleton */}
                        <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-48 rounded" />
                                <Skeleton className="h-3 w-72 rounded" />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-9 w-24 rounded-xl" />
                                <Skeleton className="h-9 w-24 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar (col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Table of Contents Widget skeleton */}
                        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs space-y-4">
                            <Skeleton className="h-4 w-32 rounded" />
                            <div className="space-y-2.5">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-8 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>

                        {/* Related Articles Widget skeleton */}
                        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs space-y-4">
                            <Skeleton className="h-4 w-28 rounded" />
                            <div className="space-y-3.5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="w-8.5 h-8.5 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5 min-w-0">
                                            <Skeleton className="h-3.5 w-full rounded" />
                                            <Skeleton className="h-3 w-20 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Contact Widget skeleton */}
                        <div className="bg-slate-900 rounded-[24px] p-6 space-y-4">
                            <Skeleton className="h-4 w-32 bg-slate-800 rounded" />
                            <Skeleton className="h-3 w-full bg-slate-800 rounded" />
                            <div className="space-y-2.5">
                                <Skeleton className="h-10 w-full bg-slate-800 rounded-xl" />
                                <Skeleton className="h-10 w-full bg-slate-800 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-transparent relative overflow-hidden pb-12">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6 py-16 relative z-10 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
                        <HelpCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Article Not Found</h1>
                    <p className="text-sm text-slate-550 font-semibold mb-8">
                        The help article you are looking for does not exist or has been moved.
                    </p>
                    <Link
                        href="/dashboard/help"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-green text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-brand-green/90 transition-all shadow-md shadow-brand-green/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Help Center
                    </Link>
                </div>
            </div>
        );
    }

    const ArticleIcon = article.icon;

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden pb-12">
            {/* Background glowing blurred design layers */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                {/* Breadcrumb & Navigation Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Link href="/dashboard/help" className="hover:text-brand-green transition-colors">
                            Help Center
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded-md">
                            {article.category}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-650 truncate max-w-[200px] sm:max-w-[300px]">
                            {article.title}
                        </span>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-brand-green/95 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-green/10 cursor-pointer active:scale-98"
                        >
                            <Send className="w-4 h-4" />
                            Contact Support Team
                        </button>
                        
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all border border-slate-200 shadow-xs cursor-pointer active:scale-98"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-brand-green" />
                                    <span className="text-brand-green">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-4 h-4 text-slate-500" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Main Article Details (col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        <article className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300">
                            {/* Header */}
                            <div className="border-b border-slate-100 pb-6 mb-6">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-brand-green/10 border border-brand-green/5 rounded-xl flex items-center justify-center">
                                        <ArticleIcon className="w-5 h-5 text-brand-green" />
                                    </div>
                                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                                        {article.category}
                                    </span>
                                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-md uppercase tracking-wider">
                                        Verified Guide
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                    {article.title}
                                </h1>
                                <p className="text-sm sm:text-base text-slate-550 font-semibold mt-2 leading-relaxed">
                                    {article.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mt-5 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-350" />
                                        <span>{article.time}</span>
                                    </div>
                                    <span className="text-slate-250">|</span>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-350" />
                                        <span>Last Updated: {article.lastUpdated}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Sections */}
                            <div className="space-y-8">
                                {article.sections.map((section, sIndex) => {
                                    const slug = getSlug(section.heading);
                                    return (
                                        <div key={sIndex} id={slug} className="scroll-mt-24 space-y-4">
                                            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight border-l-4 border-brand-green pl-3.5 uppercase mt-6">
                                                {section.heading}
                                            </h2>

                                            {(!section.type || section.type === "text") && typeof section.content === "string" && (
                                                <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">
                                                    {section.content}
                                                </p>
                                            )}

                                            {section.type === "list" && Array.isArray(section.content) && (
                                                <ul className="space-y-3 pl-1">
                                                    {section.content.map((item, itemIdx) => (
                                                        <li key={itemIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 flex-shrink-0" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {section.type === "alert" && typeof section.content === "string" && (
                                                <div className={cn(
                                                    "flex gap-3 p-4 rounded-xl border mt-4",
                                                    section.alertType === "warning" && "bg-amber-50/70 border-amber-200/50 text-amber-900",
                                                    section.alertType === "success" && "bg-emerald-50/70 border-emerald-200/50 text-emerald-900",
                                                    section.alertType === "info" && "bg-blue-50/70 border-blue-200/50 text-blue-900"
                                                )}>
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {section.alertType === "warning" && <AlertCircle className="w-4 h-4 text-amber-650" />}
                                                        {section.alertType === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                                        {section.alertType === "info" && <Info className="w-4 h-4 text-blue-600" />}
                                                    </div>
                                                    <div className="text-xs font-semibold leading-relaxed">
                                                        {section.content}
                                                    </div>
                                                </div>
                                            )}

                                            {section.type === "table" && section.tableData && (
                                                <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs mt-4 bg-white">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                                                    {section.tableData.headers.map((header, hIdx) => (
                                                                        <th key={hIdx} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                            {header}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {section.tableData.rows.map((row, rIdx) => (
                                                                    <tr key={rIdx} className="hover:bg-slate-50/40 transition-colors">
                                                                        {row.map((cell, cIdx) => (
                                                                            <td key={cIdx} className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                                                                                {cell}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </article>

                        {/* Interactive Feedback Card */}
                        <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 tracking-tight">Was this article helpful?</h4>
                                <p className="text-xs text-slate-550 font-semibold mt-0.5">Let us know how we can improve our documentation.</p>
                            </div>
                            
                            {feedbackValue ? (
                                <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-4 py-2.5 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                    <span className="text-xs font-extrabold uppercase tracking-wider">Thanks for your feedback!</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setFeedbackValue("yes")}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                                    >
                                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                                        <span>Yes, thanks</span>
                                    </button>
                                    <button 
                                        onClick={() => setFeedbackValue("no")}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                                    >
                                        <ThumbsDown className="w-4 h-4 text-rose-600" />
                                        <span>No, not really</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar (col-span-4) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                        
                        {/* Table of Contents Widget */}
                        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                                <span>Table of Contents</span>
                                <BookOpen className="w-4 h-4 text-slate-400" />
                            </h3>
                            <nav className="relative flex flex-col gap-1 pl-1">
                                {article.sections.map((sec, idx) => {
                                    const slug = getSlug(sec.heading);
                                    const isActive = activeSection === slug;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const el = document.getElementById(slug);
                                                if (el) {
                                                    el.scrollIntoView({ behavior: "smooth" });
                                                    setActiveSection(slug);
                                                }
                                            }}
                                            className={cn(
                                                "text-left py-1.5 px-3 rounded-lg text-xs font-bold border-l-2 transition-all cursor-pointer",
                                                isActive
                                                    ? "bg-brand-green/5 border-brand-green text-brand-green font-extrabold"
                                                    : "border-transparent text-slate-550 hover:text-slate-800 hover:bg-slate-50"
                                            )}
                                        >
                                            {sec.heading}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Related Articles Widget */}
                        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                                <span>Related Articles</span>
                                <FileText className="w-4 h-4 text-slate-400" />
                            </h3>
                            <div className="space-y-3.5">
                                {relatedArticles.map((rel) => {
                                    const RelIcon = rel.icon;
                                    return (
                                        <Link
                                            key={rel.key}
                                            href={`/dashboard/help/${rel.key}`}
                                            className="group flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-150 transition-all cursor-pointer"
                                        >
                                            <div className="w-8.5 h-8.5 bg-slate-100 group-hover:bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                                <RelIcon className="w-4 h-4 text-slate-550 group-hover:text-brand-green transition-colors" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs font-black text-slate-900 leading-snug group-hover:text-brand-green transition-colors truncate">
                                                    {rel.title}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                    {rel.category} &bull; {rel.time}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-slate-650 transition-colors self-center opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Fast Support Contact Widget */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[24px] p-6 shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-xs font-black uppercase tracking-widest border-b border-white/10 pb-3 mb-4 text-slate-200">
                                Still Need Help?
                            </h3>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                                If you couldn't find the answers in our articles, our support agents are available.
                            </p>
                            
                            <div className="space-y-3">
                                <a 
                                    href="mailto:support@niip.co.tz"
                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-bold"
                                >
                                    <Mail className="w-4 h-4 text-brand-green" />
                                    <span>support@niip.co.tz</span>
                                </a>
                                <a 
                                    href="tel:+255772193600"
                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-bold"
                                >
                                    <Phone className="w-4 h-4 text-brand-blue" />
                                    <span>+255 772 193 600</span>
                                </a>
                            </div>
                            
                            <div className="text-[9px] text-slate-450 font-bold uppercase tracking-wider text-center mt-6">
                                Mon - Fri: 8:00 AM - 5:00 PM (EAT)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full p-6 relative border border-slate-150 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowContactForm(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Contact Support</h3>
                            <p className="text-xs font-semibold text-slate-550">
                                Send us a message and we'll get back to you shortly
                            </p>
                        </div>

                        {formSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-base font-black text-slate-900 tracking-tight mb-1">Message Sent!</h4>
                                <p className="text-xs text-slate-550 font-semibold leading-relaxed">
                                    We have received your request. An agent will respond within 2 hours during support hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Subject
                                    </label>
                                    <select className="appearance-none w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer">
                                        <option>Order Question</option>
                                        <option>Payment Issue</option>
                                        <option>Policy Question</option>
                                        <option>Claim Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 bottom-3 w-4 h-4 text-slate-550 pointer-events-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
                                        placeholder="Describe your question or issue..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowContactForm(false)}
                                        className="flex-1 px-4 py-3 bg-slate-105 hover:bg-slate-200 text-slate-750 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-98"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-green hover:bg-brand-green/95 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-98 shadow-md shadow-brand-green/10 disabled:opacity-50"
                                    >
                                        {formLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
