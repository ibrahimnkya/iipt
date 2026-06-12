"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    HelpCircle,
    Mail,
    Phone,
    MessageCircle,
    FileText,
    Book,
    Search,
    Clock,
    ChevronRight,
    ChevronDown,
    Send,
    CheckCircle2,
    Loader2,
    X,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryFilter = "all" | "orders" | "payments" | "policies" | "general";

export default function HelpPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
    const [showContactForm, setShowContactForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            if (q) {
                setSearchQuery(q);
            }
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const categories = [
        { id: "all", label: "All Topics", count: 8 },
        { id: "orders", label: "Orders & Claims", count: 3 },
        { id: "payments", label: "Payments", count: 2 },
        { id: "policies", label: "Policies", count: 2 },
        { id: "general", label: "General", count: 1 },
    ];

    const helpTopics = [
        {
            icon: FileText,
            title: "How to Create an Insurance Order",
            description: "Step-by-step guide to submitting import declarations and creating insurance orders",
            category: "orders",
            time: "5 min read",
            link: "/dashboard/help/create-order"
        },
        {
            icon: Book,
            title: "Understanding Your Invoice",
            description: "Learn about premium calculations, TIRA levy, stamp duty, and VAT breakdowns",
            category: "payments",
            time: "4 min read",
            link: "/dashboard/help/invoices"
        },
        {
            icon: MessageCircle,
            title: "Payment Methods & Options",
            description: "Complete guide to paying with M-Pesa, Airtel Money, Tigo Pesa, and bank transfers",
            category: "payments",
            time: "3 min read",
            link: "/dashboard/help/payment-methods"
        },
        {
            icon: HelpCircle,
            title: "Frequently Asked Questions",
            description: "Common questions about import insurance, coverage, and claims process",
            category: "general",
            time: "6 min read",
            link: "/dashboard/help/faqs"
        },
        {
            icon: FileText,
            title: "Policy Coverage Explained",
            description: "Understanding ICC (A), (B), and (C) clauses and what they cover",
            category: "policies",
            time: "7 min read",
            link: "/dashboard/help/coverage"
        },
        {
            icon: Clock,
            title: "Claim Submission Process",
            description: "How to file a claim, required documentation, and expected timelines",
            category: "orders",
            time: "5 min read",
            link: "/dashboard/help/claims"
        },
        {
            icon: FileText,
            title: "Required Documents Checklist",
            description: "Complete list of documents needed for insurance and claims",
            category: "orders",
            time: "3 min read",
            link: "/dashboard/help/documents"
        },
        {
            icon: Book,
            title: "Premium Calculation Breakdown",
            description: "How insurance premiums are calculated based on cargo value and type",
            category: "policies",
            time: "4 min read",
            link: "/dashboard/help/premiums"
        },
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Get help via email support system",
            contact: "support@niip.co.tz",
            action: "mailto:support@niip.co.tz",
            actionLabel: "Send Email",
            color: "blue"
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Call us directly for assistance",
            contact: "+255 123 456 789",
            action: "tel:+255123456789",
            actionLabel: "Call Now",
            color: "green"
        },
        {
            icon: MessageCircle,
            title: "WhatsApp Chat",
            description: "Quick response live chat channel",
            contact: "+255 123 456 789",
            action: "https://wa.me/255123456789",
            actionLabel: "Start Chat",
            color: "emerald"
        },
    ];

    const filteredTopics = helpTopics.filter((topic) => {
        const matchesCategory = activeCategory === "all" || topic.category === activeCategory;
        const matchesSearch = 
            (topic.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (topic.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormLoading(false);
        setFormSuccess(true);
        setTimeout(() => {
            setShowContactForm(false);
            setFormSuccess(false);
        }, 2000);
    };

    if (status === "loading") {
        return (
            <div className="space-y-8 pb-12 font-sans bg-transparent">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 rounded-xl" />
                        <Skeleton className="h-4 w-96 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>

                {/* Search & Filters Panel skeleton */}
                <div className="bg-white/85 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-8 w-24 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Quick Contact Methods Grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between h-[210px]">
                            <div className="space-y-3">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <Skeleton className="h-4.5 w-32 rounded" />
                                <Skeleton className="h-3.5 w-full rounded" />
                                <Skeleton className="h-3.5 w-24 rounded" />
                            </div>
                            <Skeleton className="h-4 w-28 rounded" />
                        </div>
                    ))}
                </div>

                {/* Help Topics Container skeleton */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-105">
                        <Skeleton className="h-4 w-48 rounded" />
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="p-5 rounded-xl border border-slate-200/60 flex items-start gap-4 h-[130px]">
                                    <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="h-4 w-40 rounded" />
                                            <Skeleton className="w-4 h-4 rounded" />
                                        </div>
                                        <Skeleton className="h-3 w-full rounded" />
                                        <div className="flex gap-3">
                                            <Skeleton className="h-3.5 w-16 rounded" />
                                            <Skeleton className="h-3.5 w-12 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden pb-12">
            {/* Background glowing blurred design layers */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Help & Support
                            </h1>
                            <p className="text-xs sm:text-sm font-semibold text-slate-550 mt-1">
                                Find answers and get help with your cargo insurance coverages
                            </p>
                        </div>
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-green hover:bg-brand-green/95 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-green/10 active:scale-98 cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            Contact Support
                        </button>
                    </div>

                    {/* Search & Filters Panel */}
                    <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all duration-300">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                            {categories.map((category) => {
                                const isActive = activeCategory === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id as CategoryFilter)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer border",
                                            isActive
                                                ? "bg-brand-green text-white border-brand-green shadow-sm shadow-brand-green/10"
                                                : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                                        )}
                                    >
                                        <span>{category.label}</span>
                                        {category.count > 0 && (
                                            <span className={cn(
                                                "text-[10px] font-extrabold px-1.5 py-0.5 rounded-md",
                                                isActive
                                                    ? "bg-white/20 text-white"
                                                    : "bg-slate-200/70 text-slate-500"
                                            )}>
                                                {category.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Contact Methods Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {contactMethods.map((method, index) => {
                        const Icon = method.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white/90 border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-green/20 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                            >
                                {/* Glow Overlay */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

                                <div>
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 border border-transparent",
                                        method.color === "blue" && "bg-blue-50 border-blue-100/50 text-blue-600",
                                        method.color === "green" && "bg-emerald-50 border-emerald-100/50 text-emerald-600",
                                        method.color === "emerald" && "bg-emerald-50 border-emerald-100/50 text-emerald-600"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-slate-900 text-sm tracking-tight mb-1">{method.title}</h3>
                                    <p className="text-xs text-slate-550 font-semibold mb-3">{method.description}</p>
                                    <p className="text-xs font-extrabold text-slate-700 mb-4">{method.contact}</p>
                                </div>
                                <a
                                    href={method.action}
                                    target={method.action.startsWith('http') ? "_blank" : undefined}
                                    rel={method.action.startsWith('http') ? "noopener noreferrer" : undefined}
                                    className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brand-green hover:text-brand-green/80 transition-colors"
                                >
                                    {method.actionLabel}
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        );
                    })}
                </div>

                {/* Help Topics Container */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden mb-8 shadow-sm">
                    <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
                        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Help Articles & Guides</h2>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-xs font-extrabold text-brand-green hover:underline cursor-pointer"
                            >
                                Clear search query
                            </button>
                        )}
                    </div>

                    {filteredTopics.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-2">
                                No articles found
                            </h3>
                            <p className="text-xs text-slate-550 font-semibold">
                                Try adjusting your search query or browse other categories
                            </p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredTopics.map((topic, index) => {
                                    const Icon = topic.icon;
                                    return (
                                        <Link
                                            key={index}
                                            href={topic.link}
                                            className="p-5 rounded-xl border border-slate-205/60 hover:border-brand-green/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex items-start gap-4"
                                        >
                                            <div className="w-10 h-10 bg-brand-green/10 border border-brand-green/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition-colors">
                                                <Icon className="w-5 h-5 text-brand-green" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                                    <h3 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-brand-green transition-colors">
                                                        {topic.title}
                                                    </h3>
                                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-green group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                </div>
                                                <p className="text-xs text-slate-550 font-semibold mb-3 line-clamp-2">
                                                    {topic.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {topic.time}
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-extrabold uppercase tracking-wider">
                                                        {categories.find(c => c.id === topic.category)?.label.split(' ')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    {filteredTopics.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                            <p className="text-xs font-semibold text-slate-550 text-center">
                                Showing <span className="font-black text-slate-900">{filteredTopics.length}</span> of{" "}
                                <span className="font-black text-slate-900">{helpTopics.length}</span> articles
                            </p>
                        </div>
                    )}
                </div>

                {/* Business Hours Panel */}
                <div className="bg-gradient-to-br from-brand-green/5 to-brand-blue/5 rounded-2xl p-6 border border-brand-green/10 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
                            <Clock className="w-5 h-5 text-brand-green" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 text-sm tracking-tight mb-3"> NIIS Help Desk Hours</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="flex items-center justify-between p-3.5 bg-white/95 rounded-xl border border-slate-200/50 shadow-xs">
                                    <span className="font-extrabold text-slate-700">Monday - Friday</span>
                                    <span className="font-semibold text-slate-550">8:00 AM - 5:00 PM EAT</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-white/95 rounded-xl border border-slate-200/50 shadow-xs">
                                    <span className="font-extrabold text-slate-700">Saturday</span>
                                    <span className="font-semibold text-slate-550">9:00 AM - 1:00 PM EAT</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-500 mt-4 leading-relaxed">
                                * Email and WhatsApp inquiries are monitored 24/7 with typical responses within 2 hours during standard business hours.
                            </p>
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
        </div>
    );
}