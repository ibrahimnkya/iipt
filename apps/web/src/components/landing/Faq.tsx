"use client";

import { useState, useEffect, useRef } from "react";
import Link from "./Link";
import { ChevronDown, PhoneCall, MessageCircle, Mail, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Faq() {
    const [activeFaq, setActiveFaq] = useState<number | null>(0);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

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

    const faqs = [
        {
            question: "What is NIIS-T and why do I legally need it?",
            answer: "NIIS-T is the National Import Insurance System – Tanzania. According to Tanzanian local insurance laws (specifically regulating the marine industry), all goods imported into Tanzania must be insured locally by an underwriter licensed under the Tanzania Insurance Regulatory Authority (TIRA). NIIS-T automates this process directly with state databases."
        },
        {
            question: "How long does it take to generate my TIRA cover note?",
            answer: "Your official regulatory TIRA cover note is generated instantly (in under 3 minutes) once payment is completed. It is instantly registered in Tanzanian customs databases and also emailed to you as a signed PDF ready to print."
        },
        {
            question: "What secure payment channels are supported?",
            answer: "We support major secure payment mechanisms in East Africa, including all key mobile money wallets (M-Pesa, Tigo-Pesa, Airtel Money, Halopesa) as well as secure direct bank transfers."
        },
        {
            question: "Can I manage declarations for multiple cargo classes?",
            answer: "Yes. Our declaration wizard supports all major import classifications under Tanzanian shipping laws, including Sea Cargo (ICC-A/B/C), Air Cargo, and Road Cross-border Transit."
        },
        {
            question: "How do I make a claim in the future?",
            answer: "If your cargo experiences damage or loss, you can lodge a digitized claim directly through your NIIS-T customer dashboard. Select your policy, upload transit documents/photos, and your assigned underwriter will process it immediately."
        }
    ];

    const contactOptions = [
        {
            icon: PhoneCall,
            label: "Phone Support",
            description: "Mon-Sat from 8am to 6pm",
            action: "Call Toll-Free",
            href: "tel:+2552220000",
            color: "bg-blue-50 border-blue-100 text-blue-600 shadow-blue-500/5 hover:border-blue-400"
        },
        {
            icon: MessageCircle,
            label: "WhatsApp Chat",
            description: "Instant agents online",
            action: "Start Chat",
            href: "https://wa.me/2552220000",
            color: "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-500/5 hover:border-emerald-400"
        },
        {
            icon: Mail,
            label: "Official Support Desk",
            description: "Responses in under 12 hours",
            action: "Send Email",
            href: "mailto:support@niip.co.tz",
            color: "bg-purple-50 border-purple-100 text-purple-600 shadow-purple-500/5 hover:border-purple-400"
        }
    ];

    return (
        <section ref={sectionRef} id="faq" className="py-24 bg-white relative overflow-hidden font-sans">
            {/* Ambient Background blur */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_40%,rgba(59,130,246,0.02),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_70%,rgba(34,197,94,0.02),transparent_50%)]" />
            
            <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div 
                        className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-4 transition-all duration-700 transform",
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        )}
                        style={{ transitionDelay: '100ms' }}
                    >
                        <HelpCircle className="w-4 h-4 text-brand-blue" />
                        <span className="text-xs font-bold text-brand-blue tracking-wider uppercase">Faq & Help Center</span>
                    </div>
                    
                    <h2 
                        className={cn(
                            "text-4xl sm:text-5xl font-black text-gray-900 tracking-tight transition-all duration-700 transform",
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                        style={{ transitionDelay: '250ms' }}
                    >
                        Answering Your Questions
                    </h2>
                    
                    <p 
                        className={cn(
                            "text-lg text-gray-600 max-w-xl mx-auto mt-4 leading-relaxed transition-all duration-700 transform",
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                        style={{ transitionDelay: '400ms' }}
                    >
                        Everything you need to know about Tanzanian import insurance compliance and the NIIS-T digital workflow.
                    </p>
                </div>

                {/* FAQ Accordions Grid */}
                <div className="space-y-4 mb-16">
                    {faqs.map((faq, idx) => {
                        const isActive = activeFaq === idx;
                        const delay = `${450 + (idx * 100)}ms`;
                        
                        return (
                            <div 
                                key={idx} 
                                className={cn(
                                    "bg-white rounded-3xl border transition-all duration-500 overflow-hidden transform",
                                    isActive 
                                        ? 'border-brand-green/45 shadow-[0_12px_30px_rgba(34,197,94,0.06)]' 
                                        : 'border-gray-200/80 hover:border-gray-300 hover:shadow-sm',
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                )}
                                style={{ transitionDelay: delay }}
                            >
                                <button
                                    onClick={() => setActiveFaq(isActive ? null : idx)}
                                    className="w-full flex items-center justify-between gap-4 p-6 text-left group"
                                >
                                    <h3 className={cn(
                                        "text-base font-extrabold transition-colors leading-snug",
                                        isActive 
                                            ? 'text-brand-green' 
                                            : 'text-gray-900 group-hover:text-brand-green'
                                    )}>
                                        {faq.question}
                                    </h3>

                                    <div className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                                        isActive 
                                            ? 'bg-brand-green text-white rotate-180 shadow-md shadow-brand-green/20' 
                                            : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                    )}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </button>
                                
                                <div className={cn(
                                    "transition-all duration-300 ease-in-out overflow-hidden",
                                    isActive ? 'max-h-96 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'
                                )}>
                                    <div className="p-6 bg-gray-50/50">
                                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Highly-styled Floating Contact Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-16">
                    {contactOptions.map((option, idx) => {
                        const Icon = option.icon;
                        const delay = `${950 + (idx * 100)}ms`;

                        return (
                            <Link 
                                key={idx}
                                href={option.href}
                                className={cn(
                                    "group block bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm transition-all duration-500 hover:shadow-lg hover:border-brand-green hover:-translate-y-0.5 transform",
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                )}
                                style={{ transitionDelay: delay }}
                            >
                                <div className="space-y-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm", option.color)}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-sm text-gray-900 mb-0.5">{option.label}</h3>
                                        <p className="text-[11px] text-gray-400 font-bold mb-3">{option.description}</p>
                                        <span className="inline-flex items-center text-xs font-black text-brand-green tracking-wide uppercase group-hover:underline">
                                            {option.action}
                                            <ChevronDown className="w-3.5 h-3.5 ml-1 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Premium Footer CTA panel */}
                <div 
                    className={cn(
                        "text-center p-8 sm:p-12 bg-gradient-to-br from-gray-900 via-gray-950 to-brand-green/80 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-1000 transform",
                        isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"
                    )}
                    style={{ transitionDelay: '1200ms' }}
                >
                    {/* decorative glows */}
                    <div className="absolute right-[-10%] top-[-20%] w-[250px] h-[250px] bg-brand-green/20 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="relative z-10 max-w-md mx-auto space-y-6">
                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                            Have Custom Shipping Parameters?
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 font-semibold leading-relaxed">
                            Our support staff coordinate with TIRA and port brokers to resolve complex geographical risks or high-value cargo declarations.
                        </p>
                        <div className="pt-2">
                            <Link 
                                href="/contact" 
                                className="inline-flex items-center justify-center gap-1.5 px-6 py-3.5 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-200 shadow-md shadow-brand-green/20 hover:scale-105 active:scale-95"
                            >
                                Contact Transit Desk
                                <ChevronDown className="w-4 h-4 -rotate-90" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}