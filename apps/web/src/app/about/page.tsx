"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Target, Users, Landmark, CheckCircle2, TrendingUp, Award, Lock, Sparkles } from "lucide-react";

export default function AboutPage() {
    const features = [
        { 
            icon: Shield, 
            title: "Regulated Platform", 
            text: "Directly monitored and regulated by TIRA to ensure compliance and security." 
        },
        { 
            icon: Target, 
            title: "Precision & Accuracy", 
            text: "Automated calculations for premiums, taxes, and compliance requirements." 
        },
        { 
            icon: Users, 
            title: "Trusted Network", 
            text: "Connecting importers with verified and licensed insurance providers." 
        },
        { 
            icon: Landmark, 
            title: "Fully Authorized", 
            text: "Recognized by Customs and Revenue authorities across Tanzania." 
        }
    ];

    const stats = [
        { value: "10K+", label: "Active Importers" },
        { value: "50+", label: "Insurance Partners" },
        { value: "99.9%", label: "Uptime" },
        { value: "24/7", label: "Support" }
    ];

    const values = [
        {
            icon: Lock,
            title: "Security First",
            description: "Bank-level encryption and data protection for all transactions and sensitive information."
        },
        {
            icon: TrendingUp,
            title: "Continuous Innovation",
            description: "Constantly improving our platform to serve importers better and faster."
        },
        {
            icon: Award,
            title: "Transparency",
            description: "Clear pricing, no hidden fees, and full compliance with all regulations."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            <main>
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.04),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.04),transparent_50%)]" />
                    
                    <div className="container mx-auto px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                                <Sparkles className="w-4 h-4 text-brand-green" />
                                <span className="text-sm font-semibold text-gray-700">
                                    Established in Partnership with TIRA
                                </span>
                            </div>

                            {/* Heading */}
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                                Transforming Import Insurance{" "}
                                <span className="bg-gradient-to-r from-brand-green to-green-600 bg-clip-text text-transparent">
                                    in Tanzania
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                IIPT is Tanzania's premier digital gateway for import insurance, ensuring every cargo entry is secured and fully compliant with national regulations.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-brand-green hover:shadow-md transition-all">
                                        <div className="text-4xl font-black bg-gradient-to-r from-brand-green to-green-600 bg-clip-text text-transparent mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-600">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-24 lg:py-32 bg-white">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
                                        <span className="text-sm font-bold text-brand-blue">Our Story</span>
                                    </div>
                                    
                                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                                        The Digital Transformation of Import Insurance
                                    </h2>
                                    
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Before IIPT, securing import insurance involved fragmented manual processes, lengthy paperwork, and unclear compliance requirements. Working closely with the Tanzania Insurance Regulatory Authority (TIRA), we've streamlined the entire process into a single, secure digital portal.
                                    </p>
                                </div>

                                {/* Features Grid */}
                                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                    {features.map((feature, idx) => {
                                        const Icon = feature.icon;
                                        return (
                                            <div key={idx} className="space-y-3 group">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center border-2 border-gray-100 group-hover:border-brand-green group-hover:shadow-lg transition-all">
                                                    <Icon className="w-7 h-7 text-brand-green" strokeWidth={2.5} />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {feature.text}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Visual */}
                            <div className="relative">
                                <div className="relative bg-gradient-to-br from-gray-900 via-brand-blue to-blue-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
                                    </div>

                                    <div className="relative p-12 lg:p-16 space-y-8 text-center">
                                        {/* TIRA Logo */}
                                        <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-2xl shadow-2xl">
                                            <img src="/tira_logo.png" alt="TIRA Logo" className="w-20 h-20" />
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-4">
                                            <h3 className="text-3xl lg:text-4xl font-extrabold text-white">
                                                Regulated by TIRA
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed max-w-md mx-auto text-lg">
                                                The Tanzania Insurance Regulatory Authority oversees all operations on this portal to ensure fair practice and maximum security for importers.
                                            </p>
                                        </div>

                                        {/* Trust Indicators */}
                                        <div className="flex flex-wrap justify-center gap-3 pt-6">
                                            <div className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <span className="text-sm text-white font-bold">Licensed</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <span className="text-sm text-white font-bold">Compliant</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <span className="text-sm text-white font-bold">Secure</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
                                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-green-200/30 rounded-full blur-3xl" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                                <Award className="w-4 h-4 text-brand-green" />
                                <span className="text-sm font-semibold text-gray-700">
                                    Our Principles
                                </span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                                Our Core Values
                            </h2>
                            <p className="text-xl text-gray-600">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {values.map((value, idx) => {
                                const Icon = value.icon;
                                return (
                                    <div 
                                        key={idx}
                                        className="bg-white rounded-3xl p-10 shadow-sm border-2 border-gray-100 hover:border-brand-green hover:shadow-xl transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-gray-100 group-hover:border-brand-green group-hover:scale-110 transition-all">
                                            <Icon className="w-8 h-8 text-brand-green" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed text-lg">
                                            {value.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 lg:py-32">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="max-w-5xl mx-auto bg-gradient-to-br from-brand-green to-green-600 rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                            
                            <div className="relative z-10 space-y-8">
                                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-xl text-green-50 max-w-2xl mx-auto leading-relaxed">
                                    Join thousands of importers who trust IIPT for their insurance needs. Fast, secure, and fully compliant.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <a 
                                        href="/login" 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-green font-black text-lg rounded-2xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
                                    >
                                        Get Insured Now
                                    </a>
                                    <a 
                                        href="/contact" 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-black text-lg rounded-2xl border-2 border-white hover:bg-white/10 transition-all"
                                    >
                                        Contact Us
                                    </a>
                                </div>
                                
                                {/* Trust Indicators */}
                                <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-green-50">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                        <span className="font-semibold">No Hidden Fees</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                        <span className="font-semibold">Instant Coverage</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                        <span className="font-semibold">TIRA Regulated</span>
                                    </div>
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