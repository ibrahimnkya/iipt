"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Calculator, Smartphone, CheckCircle2, Download, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Features() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Interactive Calculator Card State
    const [cargoValue, setCargoValue] = useState(25000); // Default $25,000 USD
    const [transportMode, setTransportMode] = useState<"sea" | "air" | "road">("sea");
    
    // Rates from user specs
    const rateMultiplier = transportMode === "sea" ? 0.015 : transportMode === "air" ? 0.022 : 0.018;
    const premiumCost = Math.round(cargoValue * rateMultiplier);
    const taxesCost = Math.round(premiumCost * 0.18); // Taxes & Adjustments (VAT 18%)
    const totalPremium = premiumCost + taxesCost;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} id="features" className="py-28 bg-[#FAFBFC] relative overflow-hidden font-sans border-b border-gray-100">
            {/* Subtle background gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.02),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <div
                        className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-4 transition-all duration-700 transform",
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        )}
                    >
                        <Sparkles className="w-4 h-4 text-brand-green animate-pulse" />
                        <span className="text-xs font-bold text-brand-green tracking-wider uppercase">Portal Capabilities</span>
                    </div>

                    <h2
                        className={cn(
                            "text-4xl sm:text-5xl font-black text-gray-900 tracking-tight transition-all duration-700 transform leading-[1.1]",
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                        style={{ transitionDelay: '150ms' }}
                    >
                        Built for Fast-Moving Trade
                    </h2>
                    
                    <p
                        className={cn(
                            "text-lg text-gray-500 mt-4 leading-relaxed transition-all duration-700 transform font-medium max-w-2xl mx-auto",
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                        style={{ transitionDelay: '300ms' }}
                    >
                        NIIS-T brings insurance, pricing, and payments together in one intelligent platform—helping importers secure cargo cover in seconds, not days.
                    </p>
                </div>

                {/* Features Layout Grid */}
                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* LEFT PANEL: Interactive Rate Simulator */}
                    <div
                        className={cn(
                            "lg:col-span-6 bg-white border border-gray-200/80 rounded-[32px] p-8 shadow-sm flex flex-col justify-between transition-all duration-1000 transform hover:scale-[1.01] hover:shadow-md",
                            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                        )}
                        style={{ transitionDelay: '450ms' }}
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center border border-brand-green/20">
                                    <Calculator className="w-5 h-5 text-brand-green" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Instant Rate Simulator</h3>
                                    <p className="text-xs text-gray-400 font-bold tracking-tight">Real-time dynamic premium breakdowns</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                                Get real-time premium estimates before committing to a policy. Adjust your cargo value and instantly see how pricing changes across transport modes.
                            </p>

                            {/* Cargo Value Slider Card */}
                            <div className="space-y-3.5 bg-gray-50 border border-gray-150 p-6 rounded-2xl">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-gray-500 font-sans">
                                    <span>Cargo Value (USD)</span>
                                    <span className="text-brand-green bg-emerald-50 border border-emerald-100 px-3.5 py-1 rounded-lg text-sm font-black tracking-tight">${cargoValue.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="25000"
                                    max="100000"
                                    step="5000"
                                    value={cargoValue}
                                    onChange={(e) => setCargoValue(Number(e.target.value))}
                                    className="w-full accent-brand-green h-2 bg-gray-255 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 font-black tracking-widest uppercase font-sans">
                                    <span>$25,000</span>
                                    <span>$62,500</span>
                                    <span>$100,000</span>
                                </div>
                            </div>

                            {/* Transport Mode Tabs */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transport Mode Rates</label>
                                <div className="grid grid-cols-3 gap-2.5 font-sans">
                                    {[
                                        { mode: "sea", label: "Sea Cargo", rate: "1.50%" },
                                        { mode: "air", label: "Air Cargo", rate: "2.20%" },
                                        { mode: "road", label: "Road Cargo", rate: "1.80%" }
                                    ].map((choice) => (
                                        <button
                                            key={choice.mode}
                                            onClick={() => setTransportMode(choice.mode as any)}
                                            className={cn(
                                                "flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border text-xs font-bold transition-all duration-300 relative overflow-hidden group",
                                                transportMode === choice.mode
                                                    ? "bg-white border-brand-green text-brand-green shadow-sm ring-1 ring-brand-green/20"
                                                    : "bg-transparent border-gray-200 text-gray-500 hover:bg-white/50"
                                            )}
                                        >
                                            <span className="font-extrabold">{choice.label}</span>
                                            <span className="text-[10px] text-gray-450 mt-1 font-extrabold">{choice.rate}</span>
                                            {transportMode === choice.mode && (
                                                <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-md bg-brand-green" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Premium Summary Breakdown */}
                        <div className="mt-8 bg-gray-50 border border-gray-150 rounded-2xl p-6 space-y-3 font-sans">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Estimate Breakdown</div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-650">
                                <span>Base Premium</span>
                                <span className="text-gray-900">${premiumCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-655 border-b border-gray-200/60 pb-3">
                                <span>Taxes & Adjustments</span>
                                <span className="text-gray-900">${taxesCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-extrabold text-gray-900">Estimated Total</span>
                                <span className="text-xl font-black text-brand-green">${totalPremium.toLocaleString()}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-semibold italic text-center pt-3 border-t border-gray-100">
                                *Transparent pricing. No hidden surprises.*
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Payments & Compliance Cards */}
                    <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                        
                        {/* Right Card 1: Local Payments */}
                        <div
                            className={cn(
                                "bg-white border border-gray-200/80 rounded-[32px] p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start justify-between hover:scale-[1.01] hover:shadow-md transition-all duration-1000 transform flex-1",
                                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                            )}
                            style={{ transitionDelay: '450ms' }}
                        >
                            <div className="space-y-4 max-w-sm flex-1">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-200">
                                    <Smartphone className="w-5 h-5 text-blue-600 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Flexible Local Payments</h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                    Pay for your insurance instantly using trusted Tanzanian payment methods. Built for convenience, speed, and accessibility.
                                </p>
                                <p className="text-[10px] text-gray-450 font-semibold italic pt-2 border-t border-gray-50 font-sans">
                                    *Secure checkout designed for local business workflows.*
                                </p>
                            </div>

                            {/* Wallet Grid */}
                            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-48 shrink-0 font-sans">
                                {[
                                    { wallet: "M-PESA", color: "border-red-100 text-red-600 bg-red-50/40" },
                                    { wallet: "TIGO PESA", color: "border-blue-100 text-blue-600 bg-blue-50/40" },
                                    { wallet: "AIRTEL MONEY", color: "border-rose-100 text-rose-600 bg-rose-50/40" },
                                    { wallet: "BANK TRANSFER", color: "border-emerald-100 text-emerald-600 bg-emerald-50/40" }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className={cn(
                                            "px-3 py-3 border text-[9px] font-black rounded-xl text-center cursor-default tracking-wide uppercase transition-all duration-300 hover:scale-105 hover:shadow-sm", 
                                            item.color
                                        )}
                                    >
                                        {item.wallet}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Card 2: Connected Compliance Flow */}
                        <div
                            className={cn(
                                "bg-white border border-gray-200/80 rounded-[32px] p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start justify-between hover:scale-[1.01] hover:shadow-md transition-all duration-1000 transform flex-1",
                                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                            )}
                            style={{ transitionDelay: '600ms' }}
                        >
                            <div className="space-y-4 max-w-sm flex-1">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-200">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Connected Compliance Flow</h3>
                                <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                                    Every policy generated on NIIS-T is structured to align with Tanzania’s insurance and customs requirements, enabling smooth verification and faster cargo processing at entry points.
                                </p>
                                <p className="text-[10px] text-gray-450 font-semibold italic pt-2 border-t border-gray-50 font-sans">
                                    *Built for reliability across the import ecosystem—without slowing you down.*
                                </p>
                            </div>

                            {/* visual document note preview */}
                            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 w-full sm:w-48 shadow-sm group hover:scale-[1.03] transition-transform duration-500 cursor-pointer shrink-0 font-sans">
                                <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                                    <span className="text-[9px] font-black text-gray-400 tracking-wider">SECURE CERT</span>
                                    <Download className="w-3.5 h-3.5 text-purple-500 group-hover:animate-bounce" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-1.5 w-2/3 bg-gray-200 rounded-full" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full" />
                                    <div className="h-1.5 w-1/2 bg-purple-250 rounded-full" />
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-brand-green bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">TIRA VALID</span>
                                    <span className="text-[8px] font-extrabold text-gray-450 uppercase">PDF • 140KB</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Why It Matters (Checklist Section) ─────────────────── */}
                <div
                    className={cn(
                        "mt-24 pt-16 border-t border-gray-150 transition-all duration-1000 transform",
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                    style={{ transitionDelay: '750ms' }}
                >
                    <div className="max-w-4xl mx-auto font-sans">
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight text-center mb-10">
                            Why It Matters
                        </h3>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-center">
                            {[
                                "Real-time insurance pricing",
                                "Instant digital policy generation",
                                "Multiple local payment options",
                                "Seamless trade workflow integration",
                                "Trusted by import ecosystem stakeholders"
                            ].map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center gap-3 bg-white border border-gray-200/60 p-4.5 rounded-2xl hover:border-emerald-500/25 hover:shadow-sm hover:scale-[1.01] transition-all duration-300"
                                >
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100 text-brand-green">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 leading-snug">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
