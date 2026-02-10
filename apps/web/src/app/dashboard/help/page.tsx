"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
    ExternalLink,
    Send,
    CheckCircle2,
    Loader2,
    X,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const categories = [
        { id: "all", label: "All Topics", count: 12 },
        { id: "orders", label: "Orders & Claims", count: 4 },
        { id: "payments", label: "Payments", count: 3 },
        { id: "policies", label: "Policies", count: 3 },
        { id: "general", label: "General", count: 2 },
    ];

    const helpTopics = [
        {
            icon: FileText,
            title: "How to Create an Insurance Order",
            description: "Step-by-step guide to submitting import declarations and creating insurance orders",
            category: "orders",
            time: "5 min read",
            link: "#create-order"
        },
        {
            icon: Book,
            title: "Understanding Your Invoice",
            description: "Learn about premium calculations, TIRA levy, stamp duty, and VAT breakdowns",
            category: "payments",
            time: "4 min read",
            link: "#invoices"
        },
        {
            icon: MessageCircle,
            title: "Payment Methods & Options",
            description: "Complete guide to paying with M-Pesa, Airtel Money, Tigo Pesa, and bank transfers",
            category: "payments",
            time: "3 min read",
            link: "#payment-methods"
        },
        {
            icon: HelpCircle,
            title: "Frequently Asked Questions",
            description: "Common questions about import insurance, coverage, and claims process",
            category: "general",
            time: "6 min read",
            link: "#faqs"
        },
        {
            icon: FileText,
            title: "Policy Coverage Explained",
            description: "Understanding ICC (A), (B), and (C) clauses and what they cover",
            category: "policies",
            time: "7 min read",
            link: "#coverage"
        },
        {
            icon: Clock,
            title: "Claim Submission Process",
            description: "How to file a claim, required documentation, and expected timelines",
            category: "orders",
            time: "5 min read",
            link: "#claims"
        },
        {
            icon: FileText,
            title: "Required Documents Checklist",
            description: "Complete list of documents needed for insurance and claims",
            category: "orders",
            time: "3 min read",
            link: "#documents"
        },
        {
            icon: Book,
            title: "Premium Calculation Breakdown",
            description: "How insurance premiums are calculated based on cargo value and type",
            category: "policies",
            time: "4 min read",
            link: "#premiums"
        },
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Get help via email",
            contact: "support@tiips.co.tz",
            action: "mailto:support@tiips.co.tz",
            actionLabel: "Send Email",
            color: "blue"
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Call us for assistance",
            contact: "+255 123 456 789",
            action: "tel:+255123456789",
            actionLabel: "Call Now",
            color: "green"
        },
        {
            icon: MessageCircle,
            title: "WhatsApp Chat",
            description: "Quick response via WhatsApp",
            contact: "+255 123 456 789",
            action: "https://wa.me/255123456789",
            actionLabel: "Start Chat",
            color: "emerald"
        },
    ];

    const filteredTopics = helpTopics.filter((topic) => {
        const matchesCategory = activeCategory === "all" || topic.category === activeCategory;
        const matchesSearch = 
            topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchQuery.toLowerCase());
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Help & Support
                            </h1>
                            <p className="text-sm text-gray-600">
                                Find answers and get help with your insurance orders
                            </p>
                        </div>
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                            Contact Support
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id as CategoryFilter)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                        activeCategory === category.id
                                            ? "bg-brand-green text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {category.label}
                                    {category.count > 0 && (
                                        <span className={cn(
                                            "ml-1.5",
                                            activeCategory === category.id ? "text-white/80" : "text-gray-500"
                                        )}>
                                            ({category.count})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Contact Methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {contactMethods.map((method, index) => {
                        const Icon = method.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-green hover:shadow-md transition-all group"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                                    method.color === "blue" && "bg-blue-50 group-hover:bg-blue-100",
                                    method.color === "green" && "bg-green-50 group-hover:bg-green-100",
                                    method.color === "emerald" && "bg-emerald-50 group-hover:bg-emerald-100"
                                )}>
                                    <Icon className={cn(
                                        "w-6 h-6",
                                        method.color === "blue" && "text-blue-600",
                                        method.color === "green" && "text-green-600",
                                        method.color === "emerald" && "text-emerald-600"
                                    )} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{method.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                                <p className="text-sm font-semibold text-gray-900 mb-4">{method.contact}</p>
                                <a
                                    href={method.action}
                                    target={method.action.startsWith('http') ? "_blank" : undefined}
                                    rel={method.action.startsWith('http') ? "noopener noreferrer" : undefined}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green/80 transition-colors"
                                >
                                    {method.actionLabel}
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        );
                    })}
                </div>

                {/* Help Topics */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Help Articles</h2>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-sm text-brand-green font-semibold hover:text-brand-green/80"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredTopics.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No articles found
                            </h3>
                            <p className="text-sm text-gray-600">
                                Try adjusting your search or browse all categories
                            </p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTopics.map((topic, index) => {
                                    const Icon = topic.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={topic.link}
                                            className="p-5 rounded-lg border border-gray-200 hover:border-brand-green hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition-colors">
                                                    <Icon className="w-5 h-5 text-brand-green" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors">
                                                            {topic.title}
                                                        </h3>
                                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {topic.description}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {topic.time}
                                                        </div>
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                            {categories.find(c => c.id === topic.category)?.label.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    {filteredTopics.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600 text-center">
                                Showing <span className="font-semibold text-gray-900">{filteredTopics.length}</span> of{" "}
                                <span className="font-semibold text-gray-900">{helpTopics.length}</span> articles
                            </p>
                        </div>
                    )}
                </div>

                {/* Business Hours */}
                <div className="bg-gradient-to-br from-brand-green/5 to-blue-50 rounded-lg p-6 border border-brand-green/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Clock className="w-6 h-6 text-brand-green" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-3">Support Hours</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <span className="font-semibold text-gray-900">Monday - Friday</span>
                                    <span className="text-gray-600">8:00 AM - 5:00 PM EAT</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <span className="font-semibold text-gray-900">Saturday</span>
                                    <span className="text-gray-600">9:00 AM - 1:00 PM EAT</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                * Email and WhatsApp inquiries are monitored 24/7 with responses within 2 hours during business hours
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Form Modal */}
                {showContactForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                            <button
                                onClick={() => setShowContactForm(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
                                <p className="text-sm text-gray-600">
                                    Fill out the form below and we'll get back to you shortly
                                </p>
                            </div>

                            {formSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h4>
                                    <p className="text-sm text-gray-600">
                                        We'll respond to your inquiry within 2 hours during business hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all">
                                            <option>Order Question</option>
                                            <option>Payment Issue</option>
                                            <option>Policy Question</option>
                                            <option>Claim Inquiry</option>
                                            <option>Technical Support</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
                                            placeholder="Describe your question or issue..."
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowContactForm(false)}
                                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50"
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