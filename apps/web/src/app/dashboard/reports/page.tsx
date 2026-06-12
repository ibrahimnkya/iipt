"use client";

import { Shield, Wallet, AlertCircle } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-gray-500 mt-1">Overview of your performance and key metrics.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Total Policies", value: "0", change: "All Time", icon: Shield, color: "text-blue-600 bg-blue-50" },
                    { title: "Total Revenue", value: "0.00 Tsh", change: "Paid Invoices", icon: Wallet, color: "text-green-600 bg-green-50" },
                    { title: "Active Claims", value: "0", change: "Recorded", icon: AlertCircle, color: "text-orange-600 bg-orange-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-gray-400 ml-0">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming Soon Message */}
            <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Advanced Analytics Coming Soon
                    </h3>
                    <p className="text-sm text-gray-600">
                        Detailed charts and insights will be available in the next update.
                    </p>
                </div>
            </div>
        </div>
    );
}
