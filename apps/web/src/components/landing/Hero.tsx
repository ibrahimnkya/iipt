"use client";

import Link from "next/link";
import { Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-white to-gray-50">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.04),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.04),transparent_50%)]" />
            
            {/* Decorative Shapes */}
            <div className="absolute top-40 right-10 w-64 h-64 bg-green-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Trust Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                            <Sparkles className="w-4 h-4 text-brand-green" />
                            <span className="text-sm font-semibold text-gray-700">
                                Trusted by 10,000+ Tanzanian Importers
                            </span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="text-center space-y-8 mb-16">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                            Import Insurance
                            <br />
                            <span className="bg-gradient-to-r from-brand-green to-green-600 bg-clip-text text-transparent">
                                Made Simple
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Get compliant coverage for your imported goods in minutes. 
                            Fast, secure, and fully regulated by TIRA.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link 
                                href="/login" 
                                className="group inline-flex items-center justify-center px-8 py-4 bg-brand-green text-white text-lg font-bold rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                Get Insured Now
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/about" 
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-medium">Instant Coverage</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-medium">TIRA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-medium">24/7 Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual - Clean Card Display */}
                    <div className="relative max-w-5xl mx-auto">
                        {/* Main Dashboard Preview */}
                        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                            {/* Header Bar */}
                            <div className="bg-gradient-to-r from-brand-green to-green-600 px-8 py-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Shield className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Your Coverage Dashboard</h3>
                                        <p className="text-green-50 text-sm">Manage all your imports in one place</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                                    <span className="text-white text-sm font-semibold">Active</span>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="p-8 grid md:grid-cols-3 gap-6">
                                {/* Stat Card 1 */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-100">
                                    <div className="text-sm font-semibold text-blue-600 mb-2">Total Coverage</div>
                                    <div className="text-3xl font-black text-gray-900 mb-1">$2.4M</div>
                                    <div className="text-xs text-gray-500">Across 24 shipments</div>
                                </div>

                                {/* Stat Card 2 */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-100">
                                    <div className="text-sm font-semibold text-green-600 mb-2">Active Policies</div>
                                    <div className="text-3xl font-black text-gray-900 mb-1">18</div>
                                    <div className="text-xs text-gray-500">All fully compliant</div>
                                </div>

                                {/* Stat Card 3 */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-100">
                                    <div className="text-sm font-semibold text-purple-600 mb-2">Avg. Processing</div>
                                    <div className="text-3xl font-black text-gray-900 mb-1">3 min</div>
                                    <div className="text-xs text-gray-500">From quote to cover</div>
                                </div>
                            </div>

                            {/* Bottom Section - Recent Activity */}
                            <div className="px-8 pb-8">
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900">Recent Activity</h4>
                                        <span className="text-sm text-gray-500">Last 7 days</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { status: "Approved", item: "Container #12345", time: "2 hours ago", color: "green" },
                                            { status: "Processing", item: "Vehicle Import", time: "5 hours ago", color: "yellow" },
                                            { status: "Completed", item: "Machinery Shipment", time: "1 day ago", color: "blue" }
                                        ].map((activity, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    activity.color === 'green' ? 'bg-green-500' :
                                                    activity.color === 'yellow' ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm text-gray-900">{activity.item}</div>
                                                    <div className="text-xs text-gray-500">{activity.time}</div>
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                    activity.color === 'green' ? 'bg-green-100 text-green-700' :
                                                    activity.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -left-4 top-1/4 hidden lg:block">
                            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Status</div>
                                        <div className="text-sm font-bold text-gray-900">Verified</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-4 top-1/3 hidden lg:block">
                            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float-delayed">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Protection</div>
                                        <div className="text-sm font-bold text-gray-900">Full Coverage</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
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