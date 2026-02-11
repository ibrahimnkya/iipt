"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, PhoneCall, MessageCircle, Mail, HelpCircle } from "lucide-react";

export default function Faq() {
    const [activeFaq, setActiveFaq] = useState<number | null>(0);

    const faqs = [
        {
            question: "What is IIPT and why do I need it?",
            answer: "IIPT stands for Import Insurance Portal of Tanzania. It is a government-compliant platform that makes it easy for importers to insure goods coming into Tanzania. According to local regulations, all imports must be insured by local insurance companies."
        },
        {
            question: "Who can use this portal?",
            answer: "IIPT is designed for anyone importing goods into Tanzania. Whether you are an individual importing personal items or a company importing commercial goods, the portal provides a simple and secure way to get insured."
        },
        {
            question: "What types of goods can I insure?",
            answer: "The portal allows you to insure a wide variety of goods, from small packages to large shipments. Common items include containers, vehicles, machinery, electronics, household goods, and raw materials."
        },
        {
            question: "How do I make a payment?",
            answer: "Once you've completed your insurance application and chosen an insurance provider, you can make your payment through the IIPT platform using secure payment channels like bank transfers and mobile money."
        },
        {
            question: "How long does it take to get my cover note?",
            answer: "Your cover note is generated instantly once payment is confirmed. You'll receive it via email and can download it directly from your dashboard within minutes."
        },
        {
            question: "Is my data secure on this platform?",
            answer: "Yes, absolutely. We use bank-level encryption and comply with all Tanzania data protection regulations. Your information is stored securely and never shared with third parties without your consent."
        }
    ];

    const contactOptions = [
        {
            icon: PhoneCall,
            label: "Phone Support",
            description: "Mon-Fri from 8am to 5pm",
            action: "Call us now",
            href: "tel:+255000000000"
        },
        {
            icon: MessageCircle,
            label: "Live Chat",
            description: "Get instant answers",
            action: "Start chat",
            href: "#chat"
        },
        {
            icon: Mail,
            label: "Email Us",
            description: "We'll respond in 24hrs",
            action: "Send email",
            href: "mailto:support@iipt.go.tz"
        }
    ];

    return (
        <section id="faq" className="py-24 lg:py-32 bg-white relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.03),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.03),transparent_50%)]" />
            
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
                            <HelpCircle className="w-4 h-4 text-brand-blue" />
                            <span className="text-sm font-semibold text-brand-blue">FAQ</span>
                        </div>
                        
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Frequently Asked Questions
                        </h2>
                        
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to know about the Import Insurance Portal of Tanzania. 
                            Can't find what you're looking for? Contact our team.
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-4 mb-12">
                        {faqs.map((faq, idx) => {
                            const isActive = activeFaq === idx;
                            
                            return (
                                <div 
                                    key={idx} 
                                    className={`bg-white rounded-2xl border-2 transition-all duration-200 ${
                                        isActive 
                                            ? 'border-brand-green shadow-lg shadow-green-100' 
                                            : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <button
                                        onClick={() => setActiveFaq(isActive ? null : idx)}
                                        className="w-full flex items-center gap-4 p-6 text-left group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-lg font-bold transition-colors ${
                                                isActive 
                                                    ? 'text-brand-green' 
                                                    : 'text-gray-900 group-hover:text-brand-green'
                                            }`}>
                                                {faq.question}
                                            </h3>
                                        </div>

                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-brand-green text-white rotate-180' 
                                                : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                        }`}>
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </button>
                                    
                                    <div className={`overflow-hidden transition-all duration-300 ${
                                        isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="px-6 pb-6">
                                            <p className="text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contact Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {contactOptions.map((option, idx) => {
                            const Icon = option.icon;

                            return (
                                <Link 
                                    key={idx}
                                    href={option.href}
                                    className="group block bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:border-brand-green hover:-translate-y-1"
                                >
                                    <div className="text-center space-y-3">
                                        <div className="inline-flex w-14 h-14 rounded-2xl bg-white border-2 border-gray-200 items-center justify-center transition-transform group-hover:scale-110 group-hover:border-brand-green">
                                            <Icon className="w-7 h-7 text-gray-600 group-hover:text-brand-green transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">
                                                {option.label}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {option.description}
                                            </p>
                                            <span className="inline-flex items-center text-sm font-semibold text-brand-green group-hover:underline">
                                                {option.action}
                                                <ChevronDown className="w-4 h-4 ml-1 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-16 text-center p-10 bg-gradient-to-br from-brand-green to-green-600 rounded-3xl shadow-xl">
                        <h3 className="text-2xl font-extrabold text-white mb-3">
                            Still have questions?
                        </h3>
                        <p className="text-green-50 mb-6 max-w-md mx-auto">
                            Can't find the answer you're looking for? Our friendly support team is here to help.
                        </p>
                        <Link 
                            href="/contact" 
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-green font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                        >
                            Contact Support
                            <ChevronDown className="w-5 h-5 ml-2 -rotate-90" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}