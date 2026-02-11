"use client";

import Link from "next/link";
import { Shield, CheckCircle2, FileText, Clock, Zap, Award } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_60%)]" />
            
            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-float-delayed" />

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="space-y-8 lg:pr-8">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-full shadow-md border border-gray-200">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-gray-800">
                                Official Tanzania Import Insurance Portal
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                            Protect Your Imports,{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    Instantly
                                </span>
                                <span className="absolute bottom-2 left-0 w-full h-5 bg-yellow-300/50 -rotate-1 -z-10" />
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                            Get comprehensive insurance coverage for your imported goods in minutes. 
                            Fully compliant with Tanzania regulations, trusted by thousands of importers.
                        </p>

                        {/* Key Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                            {[
                                { icon: Zap, text: "Instant Coverage", color: "blue" },
                                { icon: FileText, text: "100% Compliant", color: "green" },
                                { icon: Award, text: "TIRA Regulated", color: "purple" },
                                { icon: Shield, text: "Secure Platform", color: "indigo" }
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 group">
                                    <div className={`flex-shrink-0 w-11 h-11 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <feature.icon className={`w-5 h-5 text-${feature.color}-600`} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-gray-800 font-bold">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link 
                                href="/login" 
                                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1"
                            >
                                Get Insured Now
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link 
                                href="/about" 
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-800 text-lg font-bold rounded-2xl border-2 border-gray-300 hover:border-blue-400 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            {[
                                "No paperwork hassle",
                                "Instant approval",
                                "24/7 support"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                                    <span className="text-sm font-semibold text-gray-600">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Visual Card */}
                    <div className="relative flex items-center justify-center lg:justify-end">
                        <div className="relative w-full max-w-lg">
                            {/* Main Insurance Card */}
                            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80 text-sm font-semibold mb-1">Import Insurance Portal</p>
                                            <h3 className="text-white text-2xl font-black">IIPT</h3>
                                        </div>
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <Shield className="w-9 h-9 text-white" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-8 space-y-6">
                                    {/* Coverage Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                                            <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Coverage Limit</div>
                                            <div className="text-3xl font-black text-blue-900">$500K</div>
                                            <div className="text-xs text-blue-700 mt-1">Per shipment</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                                            <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">Processing</div>
                                            <div className="text-3xl font-black text-green-900">&lt;5min</div>
                                            <div className="text-xs text-green-700 mt-1">Average time</div>
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-3">
                                        {[
                                            "Comprehensive cargo coverage",
                                            "Real-time tracking & updates",
                                            "Instant digital certificates"
                                        ].map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={2.5} />
                                                <span className="text-sm font-semibold text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Trust Badge */}
                                    <div className="flex items-center justify-center gap-3 pt-4 border-t-2 border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-bold text-gray-700">TIRA Certified</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-bold text-gray-700">Fully Compliant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badges */}
                            <div className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-xl p-4 animate-float border border-gray-100">
                                <Clock className="w-7 h-7 text-blue-600" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -right-6 bottom-1/3 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed border border-gray-100">
                                <FileText className="w-7 h-7 text-green-600" strokeWidth={2.5} />
                            </div>

                            {/* Background Glow */}
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl -z-10" />
                            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-green-300/30 rounded-full blur-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(-2deg); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 4s ease-in-out infinite 2s;
                }
            `}</style>
        </section>
    );
}