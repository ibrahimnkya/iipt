"use client";

import { useEffect, useState } from "react";
import Link from "./Link";
import { Shield, CheckCircle2, ArrowRight, Activity, FileText, Anchor, Compass, Landmark, Building2, Check, Ship, Navigation, MapPin, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Hero() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="relative pt-36 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-[#F1F5F9] font-sans">
            {/* 1. Grid Mesh Backdrop Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* 2. Soft Mesh Ambient Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[650px] h-[650px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column: Text & Content */}
                    <div className="lg:col-span-6 space-y-8 text-left">
                        {/* Trust Badge */}
                        <div
                            className={cn(
                                "inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm transition-all duration-1000 transform",
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            )}
                            style={{ transitionDelay: '100ms' }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-800 tracking-wider uppercase">
                                Active Insurers: NIC Corp • Alliance • Jubilee • Phoenix
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            className={cn(
                                "text-5xl sm:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.08] transition-all duration-1000 transform",
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{ transitionDelay: '250ms' }}
                        >
                            Marine Cargo Insurance,
                            <br />
                            <span className="bg-gradient-to-r from-emerald-600 via-brand-green to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
                                Made Simple.
                            </span>
                        </h1>

                        {/* Description */}
                        <p
                            className={cn(
                                "text-lg text-slate-600 max-w-xl leading-relaxed transition-all duration-1000 transform",
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{ transitionDelay: '400ms' }}
                        >
                            Protect your imported goods with fast, reliable cargo cover from quotation to clearance. Get insured in minutes and keep your shipments moving with confidence.
                        </p>

                        {/* Bullet Indicators */}
                        <div
                            className={cn(
                                "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm font-semibold text-slate-600 transition-all duration-1000 transform",
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{ transitionDelay: '480ms' }}
                        >
                            {[
                                "Instant Cover Notes",
                                "Trusted Local Insurers",
                                "Seamless Customs Integration",
                                "Faster Cargo Clearance"
                            ].map((indicator, idx) => (
                                <div key={idx} className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <span>{indicator}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div
                            className={cn(
                                "flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 transition-all duration-1000 transform",
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{ transitionDelay: '550ms' }}
                        >
                            <Link
                                href="/login"
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white text-base font-extrabold rounded-2xl shadow-lg shadow-brand-green/20 hover:shadow-xl hover:shadow-brand-green/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                            >
                                Get Insured Instantly
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/register/insurer"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-base font-extrabold rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-brand-green/45 hover:text-brand-green hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
                            >
                                Partner as Insurer
                            </Link>
                        </div>

                        {/* Trusted Insurers / Social Proof */}
                        <div
                            className={cn(
                                "pt-8 border-t border-slate-200/60 transition-all duration-1000 transform",
                                isVisible ? "opacity-100" : "opacity-0"
                            )}
                            style={{ transitionDelay: '700ms' }}
                        >
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Supported Underwriters</p>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                {[
                                    { icon: Landmark, name: "NIC Corp" },
                                    { icon: Shield, name: "Alliance" },
                                    { icon: Building2, name: "Jubilee" },
                                    { icon: Compass, name: "Phoenix" }
                                ].map((brand, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer group">
                                        <brand.icon className="w-4 h-4 text-slate-300 group-hover:text-brand-green transition-colors" />
                                        <span className="text-sm font-extrabold tracking-tight">{brand.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Premium Intersecting Mockups */}
                    <div className="lg:col-span-6 relative mt-16 lg:mt-0 flex justify-center lg:justify-end">
                        
                        {/* 1. Main Covernote Card: Real Fiscal Covernote */}
                        <div
                            className={cn(
                                "w-full max-w-[460px] bg-white border border-slate-200/60 rounded-[32px] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.06),0_30px_60px_-30px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)] relative z-20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 transform overflow-hidden",
                                isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"
                            )}
                            style={{ transitionDelay: '850ms' }}
                        >
                            {/* Card Header (Fiscal Title) */}
                            <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <Landmark className="w-4.5 h-4.5 text-emerald-400" />
                                    <div className="text-[10px] font-black tracking-widest uppercase text-slate-300">TIRA Regulatory Cover Note</div>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                    Approved & Sealed
                                </span>
                            </div>

                            <div className="p-6 space-y-4 font-sans">
                                {/* Title block */}
                                <div className="text-center border-b border-slate-100 pb-3">
                                    <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">Certificate of Marine Cargo Insurance</h4>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Pursuant to Section 136 of the Insurance Act of Tanzania</p>
                                </div>

                                {/* Fiscal Data block */}
                                <div className="grid grid-cols-2 gap-3 text-[11px]">
                                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase">Covernote ID</span>
                                        <span className="font-extrabold text-slate-800 truncate block mt-0.5">TIRA/MCN/2026/088329</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase">Tax Reference</span>
                                        <span className="font-extrabold text-slate-800 truncate block mt-0.5">TIRA-TXN-884A29</span>
                                    </div>
                                </div>

                                {/* Insured & Voyage Data */}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 space-y-2.5 text-xs">
                                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                                        <span className="font-bold text-slate-500">Insured Entity</span>
                                        <span className="font-extrabold text-slate-800 truncate max-w-[160px]">East Africa Logistics Ltd</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                                        <span className="font-bold text-slate-500">TIN Number</span>
                                        <span className="font-extrabold text-slate-800">100-288-344</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                                        <span className="font-bold text-slate-500">Cargo & Class</span>
                                        <span className="font-extrabold text-slate-800">Machinery Spares (ICC-A)</span>
                                    </div>
                                    <div className="flex justify-between pb-0.5">
                                        <span className="font-bold text-slate-500">Sum Insured</span>
                                        <span className="font-extrabold text-slate-800">$450,000.00</span>
                                    </div>
                                </div>

                                {/* Fiscal Breakdown Table */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden text-[10px]">
                                    <div className="bg-slate-50 px-3 py-1.5 font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        Premium & Tax Invoice Details
                                    </div>
                                    <div className="p-3 space-y-1.5 text-slate-600 font-medium">
                                        <div className="flex justify-between">
                                            <span>Basic Marine Premium</span>
                                            <span className="font-bold text-slate-800">$675.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>TIRA Regulatory Levy (1%)</span>
                                            <span className="font-bold text-slate-800">$6.75</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Revenue Stamp Duty</span>
                                            <span className="font-bold text-slate-800">$1.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Value Added Tax (18% VAT)</span>
                                            <span className="font-bold text-slate-800">$121.50</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-100 pt-1.5 text-xs text-slate-900 font-black">
                                            <span className="text-brand-green">Total Premium Paid</span>
                                            <span className="text-brand-green">$804.25</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Floating Card: Ship Movement (In Transit Shanghai -> Dar es Salaam) */}
                        <div
                            className={cn(
                                "absolute -top-12 -right-6 bg-white border border-slate-150 rounded-2xl shadow-xl p-4.5 w-[250px] z-30 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 transform animate-float",
                                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            )}
                            style={{ transitionDelay: '1050ms' }}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                                    <span className="text-[10px] font-black text-slate-900 tracking-wider uppercase">Ship Movement</span>
                                </div>
                                <Ship className="w-4 h-4 text-blue-600" />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Vessel Name</div>
                                    <div className="text-xs font-extrabold text-slate-800 mt-0.5">MV MAERSK ADRIATIC</div>
                                </div>

                                {/* Movement Visualizer */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-extrabold text-slate-400 uppercase">
                                        <span>CNSHA (Shanghai)</span>
                                        <span>TZDAR (Dar Port)</span>
                                    </div>
                                    {/* Line with moving boat dot */}
                                    <div className="h-1 bg-slate-100 rounded-full relative w-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-2/3 bg-blue-500" />
                                        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
                                    </div>
                                    <div className="text-[9px] font-extrabold text-blue-600 pt-0.5">Passing Singapore Strait</div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[10px]">
                                    <span className="font-bold text-slate-400">ETA</span>
                                    <span className="font-extrabold text-slate-800">June 08, 2026</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Floating Card: Port Clearance Status (Dar es Salaam Terminal 2) */}
                        <div
                            className={cn(
                                "absolute -bottom-10 -left-6 bg-white border border-slate-150 rounded-2xl shadow-xl p-4 w-[240px] z-30 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 transform animate-float-delayed",
                                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                            )}
                            style={{ transitionDelay: '1250ms' }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-brand-green border border-emerald-100">
                                    <Anchor className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Port Clearance</div>
                                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">Port of Dar es Salaam</div>
                                </div>
                            </div>

                            <div className="space-y-2 text-[10px] bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-400">Customs Status</span>
                                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Pre-Cleared
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-400">TIRA Database</span>
                                    <span className="font-extrabold text-slate-800">Verified & Synced</span>
                                </div>
                                <div className="flex justify-between pt-1.5 border-t border-slate-205/40">
                                    <span className="font-bold text-slate-400">Manifest ID</span>
                                    <span className="font-extrabold text-slate-700">TZ-MANIFEST-883921</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Tiny Floating Indicator: Compliance stamp */}
                        <div
                            className={cn(
                                "absolute top-1/3 -right-6 bg-white/95 backdrop-blur border border-slate-150 rounded-xl shadow-lg p-3 z-30 hover:-translate-y-0.5 transition-all duration-300 transform hidden sm:flex items-center gap-2",
                                isVisible ? "opacity-100" : "opacity-0"
                            )}
                            style={{ transitionDelay: '1400ms' }}
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider">TIRA Portal Linked</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(0.5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(-0.5deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 6s ease-in-out infinite 3s;
                }
            `}</style>
        </section>
    );
}