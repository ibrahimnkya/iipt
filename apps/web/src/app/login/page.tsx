"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    Lock, 
    ArrowRight, 
    CheckCircle2, 
    Eye, 
    EyeOff, 
    Mail, 
    Shield, 
    Ship, 
    FileText, 
    CreditCard, 
    Globe, 
    LockKeyhole 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                const userName = session?.user?.fullName || session?.user?.name || "User";
                toast.success(`Welcome back, ${userName}!`, {
                    description: "You have successfully logged in.",
                    duration: 3000,
                });

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
        <div className="min-h-screen grainy-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Centered Main Card Container */}
            <div className="w-full max-w-5xl bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[28px] shadow-[0_24px_60px_-15px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[580px] relative z-10">
                
                {/* Left Side: Form (55% width on desktop) */}
                <div className="w-full md:w-[55%] p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-between">
                    
                    {/* Brand Logo Header */}
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2.5 group" prefetch={false}>
                            {/* App Logo image asset */}
                            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <img src="/logo.svg" alt="NIIS-T Logo" className="w-9 h-9 object-contain" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-800">
                                NIIS-T
                            </span>
                        </Link>
                    </div>

                    {/* Header Greetings */}
                    <div className="space-y-2 mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                            Login to your account!
                        </h2>
                        <p className="text-xs font-medium text-slate-450 leading-relaxed">
                            Enter your registered email address and password to login!
                        </p>
                    </div>

                    {/* Registration Success Info */}
                    {registered && (
                        <div className="mb-5 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3.5 text-xs font-bold text-brand-green flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-brand-green shrink-0" />
                            <div>
                                <p className="uppercase tracking-wider text-[10px]">Registration successful!</p>
                                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Please sign in below to continue.</p>
                            </div>
                        </div>
                    )}

                    {/* Main Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 py-3 px-4 rounded-xl text-[11px] font-bold border border-rose-100 animate-in fade-in slide-in-from-top-2 text-center uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-355" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="username"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                    placeholder="eg. pixelcot@gmail.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me / Forgot Password */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-xs text-slate-500 font-bold cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/25 transition-all cursor-pointer"
                                />
                                Remember me
                            </label>
                            <Link 
                                href="#" 
                                className="text-xs font-bold text-brand-blue hover:underline transition-all" 
                                prefetch={false}
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-[#0052FF] hover:bg-blue-600 active:scale-98 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                        >
                            {loading ? "Logging in..." : "Login"}
                            {!loading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                        </button>
                    </form>

                    {/* Form Footer */}
                    <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Don&apos;t have an account?{" "}
                        <Link 
                            href="/register" 
                            className="text-brand-blue hover:text-blue-700 transition-colors uppercase tracking-wider ml-1"
                            prefetch={false}
                        >
                            Signup
                        </Link>
                    </p>

                </div>

                {/* Right Side: Promo Column (45% width on desktop) */}
                <div className="hidden md:flex md:w-[45%] bg-gradient-to-b from-[#EBF2FE] to-white p-12 flex-col justify-between relative overflow-hidden border-l border-slate-100/50 select-none">
                    
                    {/* Grid pattern background decoration */}
                    <div className="absolute inset-0 grid-pattern opacity-15 pointer-events-none" />

                    {/* Promo Illustration: Concentric Orbits */}
                    <div className="relative flex-1 flex items-center justify-center min-h-[260px] scale-90 lg:scale-100">
                        {/* Outer Orbit */}
                        <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-blue-250/30 animate-[spin_80s_linear_infinite]" />
                        
                        {/* Middle Orbit */}
                        <div className="absolute w-[170px] h-[170px] rounded-full border border-dashed border-blue-250/40 animate-[spin_50s_linear_infinite_reverse]" />
                        
                        {/* Inner Orbit */}
                        <div className="absolute w-[110px] h-[110px] rounded-full border border-dashed border-blue-250/50 animate-[spin_30s_linear_infinite]" />

                        {/* Central Sphere */}
                        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-brand-blue to-blue-500 flex items-center justify-center shadow-lg shadow-brand-blue/30 scale-105 z-10">
                            <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-25" />
                            <LockKeyhole className="w-6 h-6 text-white" />
                        </div>

                        {/* Orbit Icons / Floating Badges */}
                        {/* Badge 1: TIRA Cover Notes */}
                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(-90px, -45px)" }}
                        >
                            <FileText className="w-4 h-4 text-brand-green" />
                        </div>

                        {/* Badge 2: Cargo / Shipment */}
                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(80px, -70px)" }}
                        >
                            <Ship className="w-4 h-4 text-brand-blue" />
                        </div>

                        {/* Badge 3: Official Security */}
                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(-60px, 85px)" }}
                        >
                            <Shield className="w-4 h-4 text-amber-500" />
                        </div>

                        {/* Badge 4: Secure Payments */}
                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(90px, 60px)" }}
                        >
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                        </div>

                        {/* Badge 5: Global Trade */}
                        <div 
                            className="absolute bg-white/80 border border-white/60 p-1.5 rounded-lg shadow-sm backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(10px, -95px)" }}
                        >
                            <Globe className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                    </div>

                    {/* Bottom Promo Text */}
                    <div className="space-y-4 relative z-10 pt-4 text-center">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                                Secure Your Imports <br />
                                <span className="text-brand-blue">Everywhere</span>
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                                Generate official TIRA cover notes and manage cargo policies directly in one unified portal.
                            </p>
                        </div>

                        {/* Slider Dot Indicators */}
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                            <div className="w-5 h-1.5 rounded-full bg-brand-blue transition-all" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-450 transition-all cursor-pointer" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-450 transition-all cursor-pointer" />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest animate-pulse">Loading NIIS-T...</p>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}