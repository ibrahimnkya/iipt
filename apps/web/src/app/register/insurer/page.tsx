"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Shield, 
    ArrowRight, 
    CheckCircle2, 
    Building2, 
    Eye, 
    EyeOff, 
    ClipboardList, 
    Lock, 
    ChevronLeft, 
    MapPin, 
    Hash, 
    Briefcase, 
    User, 
    Mail, 
    Smartphone,
    Ship,
    FileText,
    CreditCard,
    Globe
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

export default function InsurerRegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Stepper State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        email: "",
        companyName: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phone: "",
        physicalAddress: "",
        brelaNumber: "",
        tinNumber: "",
        natureOfBusiness: "",
        logoUrl: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = (step: number) => {
        setError("");
        switch (step) {
            case 1:
                if (!formData.companyName || !formData.fullName || !formData.email || !formData.phone) {
                    setError("Please fill in all company details.");
                    return false;
                }
                return true;
            case 2:
                if (!formData.brelaNumber || !formData.tinNumber || !formData.physicalAddress) {
                    setError("Please fill in all official registration details.");
                    return false;
                }
                return true;
            case 3:
                if (!formData.password || !formData.confirmPassword) {
                    setError("Please enter a password.");
                    return false;
                }
                if (formData.password.length < 8) {
                    setError("Password must be at least 8 characters long");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match");
                    return false;
                }
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
        }
    };

    const handleBack = () => {
        setError("");
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(3)) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    role: "INSURER",
                }),
            });

            if (res.ok) {
                router.push("/login?registered=true&pending=true");
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

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-8 relative max-w-sm mx-auto px-1 select-none">
            {/* Background line */}
            <div className="absolute left-6 right-6 top-[18px] h-[2px] bg-slate-100 -z-10" />
            <div 
                className="absolute left-6 top-[18px] h-[2px] bg-brand-blue -z-10 transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 80}%` }}
            />

            {[
                { step: 1, label: "Company", icon: Building2 },
                { step: 2, label: "Official", icon: ClipboardList },
                { step: 3, label: "Security", icon: Lock },
            ].map((s) => {
                const isActive = s.step === currentStep;
                const isCompleted = s.step < currentStep;

                return (
                    <div key={s.step} className="flex flex-col items-center bg-white px-2.5 relative z-10">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                ? "border-brand-blue bg-brand-blue text-white shadow-md shadow-brand-blue/20 scale-105"
                                : isCompleted
                                    ? "border-brand-blue bg-brand-blue text-white"
                                    : "border-slate-100 bg-slate-50 text-slate-400"
                                }`}
                        >
                            {isCompleted ? <CheckCircle2 className="w-4.5 h-4.5" /> : <s.icon className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[9px] font-bold mt-2 uppercase tracking-wider ${isActive ? "text-brand-blue" : "text-slate-400"}`}>
                            {s.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen grainy-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Main Card Container */}
            <div className="w-full max-w-6xl bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[28px] shadow-[0_24px_60px_-15px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[600px] relative z-10">
                
                {/* Left Side: Form (55% width on desktop) */}
                <div className="w-full md:w-[55%] p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-between">
                    
                    {/* Header Logo */}
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

                    {/* Greetings and Step Indicator */}
                    <div className="space-y-4 mb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                Insurer Onboarding
                            </h2>
                            <p className="text-xs font-medium text-slate-455">
                                Register your underwriting agency to issue cargo cover notes and manage claims
                            </p>
                        </div>
                        {renderStepIndicator()}
                    </div>

                    {/* Step Form Wrapper */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 py-3 px-4 rounded-xl text-[11px] font-bold border border-rose-100 animate-in fade-in slide-in-from-top-2 text-center uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Company Details */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Company Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-slate-400" />
                                        Company / Agency Name
                                    </label>
                                    <input
                                        name="companyName"
                                        required
                                        type="text"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="eg. National Insurance Corporation"
                                    />
                                </div>

                                {/* Full Name of representative */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <User className="w-3 h-3 text-slate-400" />
                                        Authorized Representative
                                    </label>
                                    <input
                                        name="fullName"
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="eg. John Doe"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        Official Email Address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="username"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="eg. contact@insurer.co.tz"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <Smartphone className="w-3 h-3 text-slate-400" />
                                        Office Phone
                                    </label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="eg. +255 22 123 4567"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Official Compliance */}
                        {currentStep === 2 && (
                            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* BRELA Registration */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        BRELA Registration Number
                                    </label>
                                    <input
                                        name="brelaNumber"
                                        required
                                        value={formData.brelaNumber}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="BRELA-XXX"
                                    />
                                </div>

                                {/* TIN Number */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        TIN Number
                                    </label>
                                    <input
                                        name="tinNumber"
                                        required
                                        value={formData.tinNumber}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="000-000-000"
                                    />
                                </div>

                                {/* Head Office Physical Address */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        Head Office Address
                                    </label>
                                    <input
                                        name="physicalAddress"
                                        required
                                        value={formData.physicalAddress}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                        placeholder="Street, City, Tanzania"
                                    />
                                </div>

                                {/* Agency Logo upload */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
                                        Agency Logo
                                    </label>
                                    <div className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/50">
                                        <ImageUpload
                                            value={formData.logoUrl}
                                            onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                                            label="Upload Agency Logo"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Security */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" />
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
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
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold ml-1">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" />
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-350 text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation / Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 mt-6 border-t border-slate-100">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="py-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                                    Back
                                </button>
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 py-3.5 bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3.5 bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl active:scale-98 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {loading ? "Registering Agency..." : "Register"}
                                    {!loading && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Footer Toggle */}
                    <p className="mt-8 text-center text-xs text-slate-450 font-bold uppercase tracking-wider">
                        Already registered?{" "}
                        <Link 
                            href="/login" 
                            className="text-brand-blue hover:text-blue-700 transition-colors uppercase tracking-wider ml-1"
                            prefetch={false}
                        >
                            Login
                        </Link>
                    </p>

                </div>

                {/* Right Side: Promo Column (45% width on desktop) */}
                <div className="hidden md:flex md:w-[45%] bg-gradient-to-b from-[#EBF2FE] to-white p-12 flex-col justify-between relative overflow-hidden border-l border-slate-100/50 select-none">
                    
                    {/* Grid background pattern decoration */}
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
                            <Building2 className="w-6 h-6 text-white" />
                        </div>

                        {/* Orbit Icons / Floating Badges */}
                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(-90px, -45px)" }}
                        >
                            <FileText className="w-4 h-4 text-brand-green" />
                        </div>

                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(80px, -70px)" }}
                        >
                            <Ship className="w-4 h-4 text-brand-blue" />
                        </div>

                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(-60px, 85px)" }}
                        >
                            <Shield className="w-4 h-4 text-amber-500" />
                        </div>

                        <div 
                            className="absolute bg-white/80 border border-white/60 p-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                            style={{ transform: "translate(90px, 60px)" }}
                        >
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                        </div>

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
                                Unified Underwriting <br />
                                <span className="text-brand-blue">Agency Portal</span>
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                                Manage premiums, review compliance details, and generate secure import cover certificates.
                            </p>
                        </div>

                        {/* Slider Dot Indicators */}
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-455 transition-all cursor-pointer" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-455 transition-all cursor-pointer" />
                            <div className="w-5 h-1.5 rounded-full bg-brand-blue transition-all" />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
