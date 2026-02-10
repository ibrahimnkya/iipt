"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, PhoneCall, MessageCircle, Mail, HelpCircle } from "lucide-react";

export default function Faq() {
    const [activeFaq, setActiveFaq] = useState<number | null>(0);

    const faqs = [
        {
            question: "What is TIIP and why do I need it?",
            answer: "TIIP stands for Tanzania Import Insurance Portal. It is a government-compliant platform that makes it easy for importers to insure goods coming into Tanzania. According to local regulations, all imports must be insured by local insurance companies."
        },
        {
            question: "Who can use this portal?",
            answer: "TIIP is designed for anyone importing goods into Tanzania. Whether you are an individual importing personal items or a company importing commercial goods, the portal provides a simple and secure way to get insured."
        },
        {
            question: "What types of goods can I insure?",
            answer: "The portal allows you to insure a wide variety of goods, from small packages to large shipments. Common items include containers, vehicles, machinery, electronics, household goods, and raw materials."
        },
        {
            question: "How do I make a payment?",
            answer: "Once you've completed your insurance application and chosen an insurance provider, you can make your payment through the TIIP platform using secure payment channels like bank transfers and mobile money."
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
            href: "tel:+255000000000",
            color: "blue"
        },
        {
            icon: MessageCircle,
            label: "Live Chat",
            description: "Get instant answers",
            action: "Start chat",
            href: "#chat",
            color: "green"
        },
        {
            icon: Mail,
            label: "Email Us",
            description: "We'll respond in 24hrs",
            action: "Send email",
            href: "mailto:support@tiip.go.tz",
            color: "purple"
        }
    ];

    return (
        <section id="faq" className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.03),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.03),transparent_50%)]" />
            
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column - Header & Contact */}
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 lg:self-start">
                        {/* Section Header */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                                <HelpCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">
                                    FAQ
                                </span>
                            </div>
                            
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                Got questions?
                                <br />
                                We've got answers
                            </h2>
                            
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Everything you need to know about the product and how it works. Can't find what you're looking for? Reach out to our team.
                            </p>
                        </div>

                        {/* Contact Cards */}
                        <div className="space-y-4 pt-4">
                            {contactOptions.map((option, idx) => {
                                const Icon = option.icon;
                                const colorClasses = {
                                    blue: "bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-100",
                                    green: "bg-green-50 border-green-100 text-green-600 hover:border-green-200 hover:bg-green-100",
                                    purple: "bg-purple-50 border-purple-100 text-purple-600 hover:border-purple-200 hover:bg-purple-100"
                                };

                                return (
                                    <Link 
                                        key={idx}
                                        href={option.href}
                                        className={`group block bg-white rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${colorClasses[option.color as keyof typeof colorClasses].split(' ').slice(1, 3).join(' ')}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorClasses[option.color as keyof typeof colorClasses].split(' ')[0]}`}>
                                                <Icon className={`w-6 h-6 ${colorClasses[option.color as keyof typeof colorClasses].split(' ')[2]}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {option.label}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {option.description}
                                                </p>
                                                <span className={`inline-flex items-center text-sm font-medium ${colorClasses[option.color as keyof typeof colorClasses].split(' ')[2]} group-hover:underline`}>
                                                    {option.action}
                                                    <ChevronDown className="w-4 h-4 ml-1 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Additional Help */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">
                                <strong className="text-gray-900">Still need help?</strong>
                                <br />
                                Our support team is available Monday to Friday, 8am to 5pm EAT.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>Average response time: 2 hours</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - FAQ Accordion */}
                    <div className="lg:col-span-7">
                        <div className="space-y-3">
                            {faqs.map((faq, idx) => {
                                const isActive = activeFaq === idx;
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className={`bg-white rounded-2xl border-2 transition-all duration-200 ${
                                            isActive 
                                                ? 'border-brand-blue shadow-lg shadow-blue-100' 
                                                : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                                        }`}
                                    >
                                        <button
                                            onClick={() => setActiveFaq(isActive ? null : idx)}
                                            className="w-full flex items-start gap-4 p-6 text-left group"
                                        >
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                                isActive 
                                                    ? 'bg-brand-blue text-white' 
                                                    : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                            }`}>
                                                <span className="text-sm font-bold">{idx + 1}</span>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-lg font-semibold transition-colors ${
                                                    isActive 
                                                        ? 'text-brand-blue' 
                                                        : 'text-gray-900 group-hover:text-brand-blue'
                                                }`}>
                                                    {faq.question}
                                                </h3>
                                            </div>

                                            <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 ${
                                                isActive ? 'rotate-180' : ''
                                            }`}>
                                                <ChevronDown className={`w-5 h-5 transition-colors ${
                                                    isActive ? 'text-brand-blue' : 'text-gray-400'
                                                }`} />
                                            </div>
                                        </button>
                                        
                                        <div className={`overflow-hidden transition-all duration-300 ${
                                            isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                            <div className="px-6 pb-6 pt-2">
                                                <div className="pl-12">
                                                    <div className="border-l-2 border-blue-100 pl-6 py-2">
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

                        {/* Footer CTA */}
                        <div className="mt-8 text-center p-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Still have questions?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Can't find the answer you're looking for? Please reach out to our friendly team.
                            </p>
                            <Link 
                                href="/contact" 
                                className="inline-flex items-center justify-center px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Contact Support
                                <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}