"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, CheckCircle2, Building2, User, Mail, Smartphone, Globe } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState<"PERSONAL" | "COMPANY">("PERSONAL");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "", // Changed from phoneNumber to phone
        physicalAddress: "",
        postalAddress: "",
        brelaNumber: "",
        tinNumber: "",
        natureOfBusiness: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    // If Personal, we might want to clear or ignore business fields, 
                    // or the backend can handle optional fields as they are nullable.
                    natureOfBusiness: accountType === "PERSONAL" ? null : formData.natureOfBusiness,
                    brelaNumber: accountType === "PERSONAL" ? null : formData.brelaNumber,
                    tinNumber: accountType === "PERSONAL" ? null : formData.tinNumber,
                }),
            });

            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.message || data.error || "Something went wrong");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side: Branding / Benefits */}
            <div className="hidden xl:flex xl:w-[40%] bg-[#0F172A] relative overflow-hidden flex-col justify-between p-16 sticky top-0 h-screen">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-brand-blue/10 to-transparent opacity-50" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.svg" alt="TIIP Logo" className="w-12 h-12 brightness-200" />
                        <span className="text-3xl font-black tracking-tighter text-white">TIIP</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-black text-white leading-tight mb-8">
                        Join the Future of <br />
                        <span className="text-brand-green">Import Assurance.</span>
                    </h1>

                    <div className="space-y-8">
                        {[
                            { title: "Simplified Onboarding", text: "Register your business in minutes and start insuring your cargo instantly." },
                            { title: "Automated Compliance", text: "Our platform ensures every policy meets local TIRA regulations automatically." },
                            { title: "Real-time Tracking", text: "Monitor your cover notes and payment history from a centralized dashboard." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-brand-green shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/10 text-gray-500 text-sm font-medium">
                    &copy; {new Date().getFullYear()} TIIP. All rights reserved.
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full xl:w-[60%] flex flex-col bg-[#F8FAFC] py-12 px-6 sm:px-12 lg:px-20 overflow-y-auto">
                <div className="w-full max-w-2xl mx-auto space-y-10">
                    <div className="space-y-4">
                        <div className="xl:hidden mb-8">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/logo.svg" alt="TIIP Logo" className="w-10 h-10" />
                                <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">TIIP</span>
                            </Link>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Create your TIIP account</h2>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            Join thousands of importers securing their future today.
                        </p>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="bg-gray-100 p-1.5 rounded-[10px] flex relative">
                        <button
                            type="button"
                            onClick={() => setAccountType("PERSONAL")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all duration-300 relative z-10 ${accountType === "PERSONAL"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            PERSONAL
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType("COMPANY")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all duration-300 relative z-10 ${accountType === "COMPANY"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            COMPANY
                        </button>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-[10px] text-sm font-bold border border-red-200 animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Account Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                    <input
                                        name="fullName"
                                        required
                                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input
                                        name="phone"
                                        required
                                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="+255..."
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Info - Only for Company */}
                        {accountType === "COMPANY" && (
                            <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Company Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">BRELA Number</label>
                                        <input
                                            name="brelaNumber"
                                            required
                                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                            value={formData.brelaNumber}
                                            onChange={handleChange}
                                            placeholder="BRELA-XXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">TIN Number</label>
                                        <input
                                            name="tinNumber"
                                            required
                                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                            value={formData.tinNumber}
                                            onChange={handleChange}
                                            placeholder="000-000-000"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Physical Address</label>
                                        <input
                                            name="physicalAddress"
                                            required
                                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-[10px] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                            value={formData.physicalAddress}
                                            onChange={handleChange}
                                            placeholder="Street, City, Country"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nature of Business</label>
                                        <textarea
                                            name="natureOfBusiness"
                                            rows={2}
                                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 resize-none"
                                            value={formData.natureOfBusiness}
                                            onChange={handleChange}
                                            placeholder="Describe your business activities..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-brand-green text-white text-lg font-black rounded-[10px] shadow-xl shadow-brand-green/20 hover:bg-green-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                            >
                                {loading ? "Creating account..." : "Complete Registration"}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <p className="mt-8 text-center text-gray-500 font-bold text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="text-brand-blue hover:text-blue-700 hover:underline transition-colors px-1">
                                    Log in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
