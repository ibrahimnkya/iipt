"use client";

import Link from "next/link";
import { Shield, CheckCircle2, FileText, Clock } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative py-16 lg:py-24 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.08),transparent_50%)]" />

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-gray-700">
                                Tanzania's Trusted Import Insurance
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Import with Confidence,{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10">Insure with TIIP</span>
                                <span className="absolute bottom-2 left-0 w-full h-4 bg-brand-yellow/40 -rotate-1" />
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                            Protect your imported goods with comprehensive insurance coverage. 
                            Generate compliant cover notes online in minutes—quick, simple, and fully 
                            aligned with Tanzania regulations.
                        </p>

                        {/* Features List */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: Clock, text: "Instant Coverage" },
                                { icon: FileText, text: "Fully Compliant" },
                                { icon: CheckCircle2, text: "Easy Claims" },
                                { icon: Shield, text: "Secure & Trusted" }
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Link 
                                href="/login" 
                                className="group inline-flex items-center justify-center px-8 py-4 bg-brand-green text-white text-lg font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5"
                            >
                                Get Insured Now
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link 
                                href="/about" 
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center gap-6 pt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>No paperwork</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Instant approval</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>24/7 support</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Visual */}
                    <div className="relative lg:h-[600px] flex items-center justify-center">
                        {/* Main Card */}
                        <div className="relative w-full max-w-md">
                            {/* Background Decorative Elements */}
                            <div className="absolute -top-8 -right-8 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
                            <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-green-200/40 rounded-full blur-3xl" />
                            
                            {/* Main Shield Card */}
                            <div className="relative bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
                                <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-yellow rounded-2xl -rotate-6 opacity-80" />
                                
                                <div className="relative space-y-8">
                                    {/* Shield Icon */}
                                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3">
                                        <Shield className="w-16 h-16 text-white" strokeWidth={2} />
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="text-sm text-gray-500 mb-1">Coverage Amount</div>
                                            <div className="text-2xl font-bold text-gray-900">Up to $500K</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="text-sm text-gray-500 mb-1">Processing Time</div>
                                            <div className="text-2xl font-bold text-green-600">Under 5 min</div>
                                        </div>
                                    </div>

                                    {/* Trust Badge */}
                                    <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span className="text-sm font-medium text-gray-600">
                                            TRA Compliant
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-lg p-3 animate-float">
                                <FileText className="w-6 h-6 text-brand-blue" />
                            </div>
                            <div className="absolute -right-4 top-2/3 bg-white rounded-xl shadow-lg p-3 animate-float-delayed">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 3s ease-in-out infinite 1.5s;
                }
            `}</style>
        </section>
    );
}