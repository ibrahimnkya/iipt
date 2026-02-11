"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, PhoneCall, MessageCircle, Mail, HelpCircle, Clock } from "lucide-react";

export default function Faq() {
    const [activeFaq, setActiveFaq] = useState<number | null>(0);

    const faqs = [
        {
            question: "What is IIPT and why do I need it?",
            answer: "IIPT stands for Import Insurance Portal of Tanzania. It is a government-compliant platform that makes it easy for importers to insure goods coming into Tanzania. According to local regulations, all imports must be insured by local insurance companies to ensure proper protection and compliance."
        },
        {
            question: "Who can use this portal?",
            answer: "IIPT is designed for anyone importing goods into Tanzania. Whether you are an individual importing personal items or a company importing commercial goods, the portal provides a simple, secure, and fast way to get comprehensive insurance coverage."
        },
        {
            question: "What types of goods can I insure?",
            answer: "The portal allows you to insure a wide variety of goods, from small packages to large shipments. Common items include shipping containers, vehicles, machinery, electronics, household goods, raw materials, and commercial products."
        },
        {
            question: "How do I make a payment?",
            answer: "Once you've completed your insurance application and chosen an insurance provider, you can make your payment through the IIPT platform using secure payment channels including bank transfers, mobile money (M-Pesa, Tigo Pesa, Airtel Money), and credit/debit cards."
        },
        {
            question: "How long does it take to get my cover note?",
            answer: "Your cover note is generated instantly once payment is confirmed. You'll receive it via email and can download it directly from your dashboard within minutes. The entire process typically takes less than 5 minutes from start to finish."
        },
        {
            question: "Is my data secure on this platform?",
            answer: "Yes, absolutely. We use bank-level 256-bit encryption and comply with all Tanzania data protection regulations. Your information is stored securely in encrypted databases and never shared with third parties without your explicit consent. We are regularly audited for security compliance."
        }
    ];

    const contactOptions = [
        {
            icon: PhoneCall,
            label: "Phone Support",
            description: "Mon-Fri, 8am - 5pm EAT",
            action: "Call us now",
            href: "tel:+255000000000",
            color: "blue"
        },
        {
            icon: MessageCircle,
            label: "Live Chat",
            description: "Instant responses",
            action: "Start chatting",
            href: "#chat",
            color: "green"
        },
        {
            icon: Mail,
            label: "Email Us",
            description: "Response within 24hrs",
            action: "Send email",
            href: "mailto:support@iipt.go.tz",
            color: "purple"
        }
    ];

    return (
        <section id="faq" className="py-24 lg:py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.05),transparent_50%)]" />
            
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column - Header & Contact */}
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24 lg:self-start">
                        {/* Section Header */}
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-green-50 rounded-full border border-blue-200">
                                <HelpCircle className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                                <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                                    Frequently Asked Questions
                                </span>
                            </div>
                            
                            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                                Got questions?
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    We've got answers
                                </span>
                            </h2>
                            
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Everything you need to know about IIPT and how it works. Can't find what you're looking for? Our support team is here to help.
                            </p>
                        </div>

                        {/* Contact Cards */}
                        <div className="space-y-4 pt-4">
                            {contactOptions.map((option, idx) => {
                                const Icon = option.icon;
                                const colorMap = {
                                    blue: {
                                        bg: "bg-blue-50",
                                        border: "border-blue-200",
                                        text: "text-blue-600",
                                        iconBg: "bg-blue-100",
                                        hover: "hover:border-blue-300 hover:bg-blue-100/50"
                                    },
                                    green: {
                                        bg: "bg-green-50",
                                        border: "border-green-200",
                                        text: "text-green-600",
                                        iconBg: "bg-green-100",
                                        hover: "hover:border-green-300 hover:bg-green-100/50"
                                    },
                                    purple: {
                                        bg: "bg-purple-50",
                                        border: "border-purple-200",
                                        text: "text-purple-600",
                                        iconBg: "bg-purple-100",
                                        hover: "hover:border-purple-300 hover:bg-purple-100/50"
                                    }
                                };
                                
                                const colors = colorMap[option.color as keyof typeof colorMap];

                                return (
                                    <Link 
                                        key={idx}
                                        href={option.href}
                                        className={`group block bg-white rounded-2xl border-2 ${colors.border} p-6 transition-all duration-200 hover:shadow-xl ${colors.hover} hover:-translate-y-1`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                <Icon className={`w-7 h-7 ${colors.text}`} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                                                    {option.label}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {option.description}
                                                </p>
                                                <span className={`inline-flex items-center text-sm font-bold ${colors.text} group-hover:underline`}>
                                                    {option.action}
                                                    <ChevronDown className="w-4 h-4 ml-1 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Additional Help Box */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-7 border border-gray-700 shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-2">Need immediate help?</h3>
                                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                        Our support team is available Monday to Friday, 8:00 AM to 5:00 PM (East Africa Time).
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-semibold text-gray-300">Average response time: 2 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - FAQ Accordion */}
                    <div className="lg:col-span-7">
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => {
                                const isActive = activeFaq === idx;
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className={`bg-white rounded-2xl border-2 transition-all duration-300 ${
                                            isActive 
                                                ? 'border-blue-500 shadow-xl shadow-blue-100' 
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                        }`}
                                    >
                                        <button
                                            onClick={() => setActiveFaq(isActive ? null : idx)}
                                            className="w-full flex items-start gap-4 p-7 text-left group"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                                                isActive 
                                                    ? 'bg-gradient-to-br from-blue-600 to-green-600 text-white shadow-lg' 
                                                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-lg font-bold transition-colors ${
                                                    isActive 
                                                        ? 'text-blue-600' 
                                                        : 'text-gray-900 group-hover:text-blue-600'
                                                }`}>
                                                    {faq.question}
                                                </h3>
                                            </div>

                                            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-transform duration-200 ${
                                                isActive ? 'rotate-180' : ''
                                            }`}>
                                                <ChevronDown className={`w-6 h-6 transition-colors ${
                                                    isActive ? 'text-blue-600' : 'text-gray-400'
                                                }`} strokeWidth={2.5} />
                                            </div>
                                        </button>
                                        
                                        <div className={`overflow-hidden transition-all duration-300 ${
                                            isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                            <div className="px-7 pb-7">
                                                <div className="pl-14">
                                                    <div className="border-l-4 border-blue-200 pl-6 py-1">
                                                        <p className="text-gray-600 leading-relaxed">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-10 text-center p-10 bg-gradient-to-r from-blue-50 via-white to-green-50 rounded-3xl border-2 border-gray-200 shadow-lg">
                            <h3 className="text-2xl font-black text-gray-900 mb-3">
                                Still have questions?
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Can't find the answer you're looking for? Our friendly support team is ready to assist you.
                            </p>
                            <Link 
                                href="/contact" 
                                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:-translate-y-1"
                            >
                                Contact Support
                                <ChevronDown className="w-5 h-5 ml-2 -rotate-90" strokeWidth={3} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}