"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Target, Users, Landmark, CheckCircle2, TrendingUp, Award, Lock } from "lucide-react";

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
                <section className="relative py-20 lg:py-28 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
                    
                    <div className="container mx-auto px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                    Established in Partnership with TIRA
                                </span>
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Transforming Import Insurance{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-brand-green">in Tanzania</span>
                                    <span className="absolute bottom-2 left-0 w-full h-4 bg-green-200/40 -rotate-1" />
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                TIIP is Tanzania's premier digital gateway for import insurance, ensuring every cargo entry is secured and fully compliant with national regulations.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-3xl mx-auto">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="text-3xl font-bold text-brand-blue mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <span className="text-sm font-semibold text-blue-700">Our Story</span>
                                    </div>
                                    
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                        The Digital Transformation of Import Insurance
                                    </h2>
                                    
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Before TIIP, securing import insurance involved fragmented manual processes, lengthy paperwork, and unclear compliance requirements. Working closely with the Tanzania Insurance Regulatory Authority (TIRA), we've streamlined the entire process into a single, secure digital portal.
                                    </p>
                                </div>

                                {/* Features Grid */}
                                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                    {features.map((feature, idx) => {
                                        const Icon = feature.icon;
                                        return (
                                            <div key={idx} className="space-y-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center border border-gray-100">
                                                    <Icon className="w-6 h-6 text-brand-blue" strokeWidth={2} />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">
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
                                <div className="relative bg-gradient-to-br from-gray-900 via-brand-blue to-blue-900 rounded-3xl overflow-hidden shadow-2xl">
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
                                    </div>

                                    <div className="relative p-12 lg:p-16 space-y-8 text-center">
                                        {/* TIRA Logo */}
                                        <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-2xl shadow-xl">
                                            <img src="/tira_logo.png" alt="TIRA Logo" className="w-20 h-20" />
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-4">
                                            <h3 className="text-2xl lg:text-3xl font-bold text-white">
                                                Regulated by TIRA
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed max-w-md mx-auto">
                                                The Tanzania Insurance Regulatory Authority oversees all operations on this portal to ensure fair practice and maximum security for importers.
                                            </p>
                                        </div>

                                        {/* Trust Indicators */}
                                        <div className="flex flex-wrap justify-center gap-4 pt-6">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                <span className="text-sm text-white font-medium">Licensed</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                <span className="text-sm text-white font-medium">Compliant</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                <span className="text-sm text-white font-medium">Secure</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl" />
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-200/30 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 lg:py-28 bg-gray-50">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                Our Core Values
                            </h2>
                            <p className="text-lg text-gray-600">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {values.map((value, idx) => {
                                const Icon = value.icon;
                                return (
                                    <div 
                                        key={idx}
                                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center mb-6">
                                            <Icon className="w-7 h-7 text-brand-blue" strokeWidth={2} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-brand-blue to-blue-700 rounded-3xl p-12 lg:p-16 text-center text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                            
                            <div className="relative z-10 space-y-6">
                                <h2 className="text-3xl lg:text-4xl font-bold">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                                    Join thousands of importers who trust TIIP for their insurance needs.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <a 
                                        href="/login" 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-blue font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        Get Insured Now
                                    </a>
                                    <a 
                                        href="/contact" 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-colors"
                                    >
                                        Contact Us
                                    </a>
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