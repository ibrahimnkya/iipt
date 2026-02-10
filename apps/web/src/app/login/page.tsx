"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const registered = searchParams.get("registered");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                // Fetch the session to check the role
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                if (session?.user?.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side: Branding / Marketing */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-brand-blue/10 to-transparent opacity-50" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.svg" alt="TIIP Logo" className="w-12 h-12 brightness-200" />
                        <span className="text-3xl font-black tracking-tighter text-white">TIIP</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-black text-white leading-tight mb-6">
                        Secure Your Imports <br />
                        <span className="text-brand-green">with Efficiency.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
                        The most trusted portal for cargo and import insurance in Tanzania. Fast, compliant, and fully digital.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: Shield, title: "Official TIRA Compliance", text: "Fully aligned with Tanzania Insurance Regulatory Authority." },
                            { icon: Lock, title: "Secure Transactions", text: "Your data and payments are protected by high-level encryption." },
                            { icon: CheckCircle2, title: "Instant Cover Notes", text: "Get your insurance certificates immediately after payment." }
                        ].map((feature, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-green border border-white/10">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/10 flex justify-between items-center text-gray-500 text-sm font-medium">
                    <span>&copy; {new Date().getFullYear()} TIIP. Tanzania Inc.</span>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Help</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F8FAFC] p-8 sm:p-12 lg:p-20">
                <div className="w-full max-w-md space-y-12">
                    <div className="space-y-4">
                        <div className="lg:hidden mb-8">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/logo.svg" alt="TIIP Logo" className="w-10 h-10" />
                                <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">TIIP</span>
                            </Link>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Login to your account</h2>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            Welcome back! Please enter your details to access the portal.
                        </p>
                    </div>

                    {registered && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5" />
                            Registration successful! Please sign in.
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 animate-in fade-in slide-in-from-top-2 text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Email address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-[10px] focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Password</label>
                                    <Link href="#" className="text-xs font-bold text-brand-blue hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-6 py-4 pr-12 bg-white border border-gray-200 rounded-[10px] focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-brand-green text-white text-lg font-black rounded-[10px] shadow-2xl shadow-brand-green/30 hover:bg-green-700 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {loading ? "Signing in..." : "Continue"}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>

                            <div className="text-center pt-2">
                                <p className="text-gray-500 font-bold">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/register" className="text-brand-blue hover:text-blue-700 transition-colors">
                                        Join TIIP for free
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-sans font-black text-brand-blue">Loading TIIP...</div>}>
            <LoginForm />
        </Suspense>
    );
}
