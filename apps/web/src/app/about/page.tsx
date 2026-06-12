"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, Heart, Sparkles, CheckCircle2, TrendingUp, HelpCircle, ArrowRight, Layers, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AboutPage() {
    const stats = [
        { value: "10,000+", label: "Importers & Trade Participants" },
        { value: "50+", label: "Insurance Providers & Partners" },
        { value: "99.9%", label: "Platform Availability" },
        { value: "24/7", label: "Digital Access & Support" }
    ];

    const sinekFramework = [
        {
            label: "The Why",
            title: "Our Purpose",
            desc: "We believe securing import insurance should be simple, transparent, and accessible to every importer. We exist to eliminate manual bottlenecks, allowing businesses to move cargo without friction.",
            icon: Heart,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100"
        },
        {
            label: "The How",
            title: "Our Approach",
            desc: "By replacing legacy, paperwork-heavy processes with a seamless B2B gateway. We unify importers, clearing agents, and trusted local insurance providers on one intelligent, secure digital platform.",
            icon: Layers,
            color: "text-blue-600 bg-blue-50 border-blue-100"
        },
        {
            label: "The What",
            title: "Our Solution",
            desc: "A fully online marine cargo insurance gateway. From quotation to clearance, we enable instant rate estimation, secure local payment checkout, and immediate delivery of TIRA cover notes.",
            icon: ShieldCheck,
            color: "text-purple-600 bg-purple-50 border-purple-100"
        }
    ];

    const coreValues = [
        {
            num: "01",
            title: "The WoW Factor",
            subtitle: "Delivering with Class",
            desc: "We don't just issue insurance—we deliver signed cover notes instantly at the click of a button, turning days of legacy paper delays into seconds of clean digital clearance."
        },
        {
            num: "02",
            title: "Challenging the Status Quo",
            subtitle: "Redefining Trade Workflows",
            desc: "We push the boundaries of compliance, logistics, and technology to transition Tanzania’s trade corridors into a modern, paperless, and speed-driven ecosystem."
        },
        {
            num: "03",
            title: "Honesty & Transparency",
            subtitle: "No Hidden Surprises",
            desc: "We believe in complete pricing transparency. Importers can instantly simulate premiums, compare options, and pay exactly what they see—without hidden fees."
        },
        {
            num: "04",
            title: "Constant Evolution",
            subtitle: "Always Improving",
            desc: "As Tanzania's import ecosystem continues to grow, we continuously learn, evolve, and upgrade our systems to build tighter, faster customs and port integrations."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-950">
            <Navbar />
            
            <main>
                {/* ── 1. Hero Header ("Why We Exist") ─────────────────────────────────── */}
                <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-28 overflow-hidden bg-[#FAFBFC]">
                    {/* Subtle grid background */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.25]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                        }}
                    />
                    
                    {/* Ambient Glow Orbs */}
                    <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-200/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-6">
                            
                            {/* Rebranding Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-100/60">
                                <Sparkles className="w-3.5 h-3.5 text-brand-green animate-pulse" />
                                <span className="text-[10px] font-extrabold text-brand-green tracking-wider uppercase">About NIIS-T</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.06]">
                                Why NIIS-T Exists
                            </h1>

                            <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-brand-green bg-clip-text text-transparent tracking-tight max-w-3xl mx-auto">
                                Modernizing marine cargo insurance to keep Tanzania’s import ecosystem moving with absolute speed, clarity, and trust.
                            </p>

                            <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto pt-2">
                                NIIS-T is Tanzania's digital gateway for marine cargo insurance, connecting importers, clearing agents, and insurers through a single trusted platform.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 2. Simon Sinek "Start With Why" Grid ─────────────────────────────── */}
                <section className="py-24 bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
                            {sinekFramework.map((card, idx) => {
                                const Icon = card.icon;
                                return (
                                    <div 
                                        key={idx} 
                                        className="bg-[#FAFBFC] border border-gray-250/70 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-500/15 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
                                    >
                                        <div className="space-y-5">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", card.color)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase block">
                                                    {card.label}
                                                </span>
                                                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                                                    {card.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                                {card.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── 3. Core Values Grid (iPF Style Culture Cards) ──────────────────── */}
                <section className="py-28 bg-[#FAFBFC] border-b border-gray-100 relative">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100/60">
                                <Award className="w-3.5 h-3.5 text-brand-blue" />
                                <span className="text-[10px] font-extrabold text-brand-blue tracking-wider uppercase">Our Shared Values</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                                Built on Shared Principles
                            </h2>
                            <p className="text-sm text-gray-500 font-semibold leading-relaxed max-w-lg mx-auto">
                                Every feature is developed, and every partnership is nurtured, under a set of guiding ethics focused on B2B excellence.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {coreValues.map((val, idx) => (
                                <div 
                                    key={idx}
                                    className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/80 hover:border-emerald-500/25 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group"
                                >
                                    {/* Giant ghost numbering */}
                                    <span className="absolute right-6 top-4 text-[72px] font-black text-gray-50 group-hover:text-emerald-50/70 select-none pointer-events-none transition-colors duration-300">
                                        {val.num}
                                    </span>
                                    
                                    <div className="space-y-4 relative z-10">
                                        <div>
                                            <span className="text-[9px] font-black text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {val.subtitle}
                                            </span>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight mt-3">
                                                {val.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-prose">
                                            {val.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 4. Stats Metrics Grid ─────────────────────────────────────────── */}
                <section className="py-20 bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {stats.map((stat, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-[#FAFBFC] rounded-2xl p-6 shadow-sm border border-gray-250/70 hover:border-emerald-500/20 hover:shadow-md transition-all duration-300 text-center"
                                >
                                    <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-brand-green bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 5. B2B Let's Build Something Great CTA ──────────────────────────── */}
                <section className="py-24 bg-[#FAFBFC]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-brand-green to-emerald-600 rounded-[40px] p-8 sm:p-16 lg:p-20 text-center text-white relative overflow-hidden shadow-xl shadow-brand-green/10">
                            {/* Ambient details */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            
                            <div className="relative z-10 space-y-8">
                                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-green-150">
                                    Trade Confidently
                                </span>
                                
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] max-w-2xl mx-auto">
                                    Ready to Protect Your Next Shipment?
                                </h2>
                                
                                <p className="text-base sm:text-lg text-green-50 max-w-xl mx-auto leading-relaxed font-semibold">
                                    Join thousands of importers who use NIIS-T to secure cargo insurance quickly, manage coverage digitally, and keep their imports moving with confidence.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-xs mx-auto sm:max-w-none">
                                    <a 
                                        href="/login" 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-green font-black text-sm rounded-2xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-md"
                                    >
                                        Get Insured Now
                                    </a>
                                    <a 
                                        href="/contact" 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-black text-sm rounded-2xl border-2 border-white hover:bg-white/10 transition-all"
                                    >
                                        Contact Us
                                    </a>
                                </div>
                                
                                {/* Bullet Checks */}
                                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-[10px] text-green-50 font-black tracking-widest uppercase">
                                    {[
                                        "Instant Digital Cover Notes",
                                        "Licensed Insurance Providers",
                                        "Secure Online Platform",
                                        "Faster Insurance Processing"
                                    ].map((check, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                            <span>{check}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}