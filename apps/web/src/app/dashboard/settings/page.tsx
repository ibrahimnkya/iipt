"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Save, Loader2, User, Lock, Eye, EyeOff, Shield, Signature } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("account");
    const [showPassword, setShowPassword] = useState(false);
    const [userRole, setUserRole] = useState("USER");

    // Form Data States
    const [companyData, setCompanyData] = useState({
        companyName: "",
        logoUrl: "",
        phone: "",
        physicalAddress: "",
        tinNumber: "",
        brelaNumber: "",
        natureOfBusiness: "",
        postalAddress: "",
        signature: "",
    });

    const [accountData, setAccountData] = useState({
        fullName: "",
        email: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (session?.user) {
            setUserRole(session.user.role || "USER");
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                setCompanyData({
                    companyName: data.companyName || "",
                    logoUrl: data.logoUrl || "",
                    phone: data.phone || "",
                    physicalAddress: data.physicalAddress || "",
                    tinNumber: data.tinNumber || "",
                    brelaNumber: data.brelaNumber || "",
                    natureOfBusiness: data.natureOfBusiness || "",
                    postalAddress: data.postalAddress || "",
                    signature: data.signature || "",
                });
                setAccountData({
                    fullName: data.fullName || "",
                    email: data.email || "",
                });
            }
        } catch (error) {
            console.error("Failed to load profile details:", error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent, type: "company" | "account") => {
        e.preventDefault();
        setLoading(true);

        const data = type === "company" ? companyData : accountData;

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) throw new Error(responseData.error || "Failed to update profile");

            // Update session with new data
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: type === "account" ? (responseData.fullName || accountData.fullName) : session?.user?.name,
                    email: type === "account" ? (responseData.email || accountData.email) : session?.user?.email,
                    companyName: type === "company" ? (responseData.companyName || companyData.companyName) : session?.user?.companyName,
                    image: type === "company" ? (responseData.logoUrl || companyData.logoUrl) : (session?.user as any).image,
                }
            });

            toast.success("Profile updated successfully");
            fetchProfile();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");

            toast.success("Password updated successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    // Build role tailored navigation tabs list
    const tabs = [
        { id: "account", label: "Account Settings", icon: User },
        ...(userRole !== "ADMIN" ? [
            { id: "company", label: userRole === "INSURER" ? "Insurer Profile" : "Company Profile", icon: Building2 }
        ] : []),
        { id: "security", label: "Security & Passwords", icon: Lock },
    ];

    if (pageLoading) {
        return (
            <div className="space-y-8 pb-12 font-sans bg-transparent">
                {/* Header skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-96 rounded-md mt-1" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation skeleton */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="flex flex-wrap lg:flex-col gap-1.5">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </nav>
                    </aside>

                    {/* Main Settings Content skeleton */}
                    <div className="flex-1">
                        <div className="bg-white/95 border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-5 h-5 rounded-md" />
                                    <Skeleton className="h-4.5 w-40 rounded" />
                                </div>
                                <Skeleton className="h-3.5 w-72 rounded" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-3.5 w-24 rounded" />
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <Skeleton className="h-10 w-32 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden pb-12">
            {/* Background glowing blurred design layers */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Settings
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-slate-550 mt-1">
                        Configure profile fields, passwords, and user-type options
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="flex flex-wrap lg:flex-col gap-1.5">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all w-full md:w-auto lg:w-full cursor-pointer border active:scale-98",
                                        activeTab === tab.id
                                            ? "bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/10"
                                            : "bg-white/80 border-slate-200 text-slate-605 hover:bg-slate-50"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Settings Content */}
                    <div className="flex-1">
                        <div className="bg-white/95 border border-slate-205/80 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                            {/* Account Settings Tab */}
                            {activeTab === "account" && (
                                <form onSubmit={(e) => handleProfileSubmit(e, "account")}>
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <User className="w-4.5 h-4.5 text-slate-500" />
                                            Personal Information
                                        </h3>
                                        <p className="text-xs text-slate-550 font-semibold mt-1">
                                            Update your personal contact details and user credentials.
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Full Name</label>
                                                <input
                                                    name="fullName"
                                                    value={accountData.fullName}
                                                    onChange={handleAccountChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Email Address</label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={accountData.email}
                                                    onChange={handleAccountChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-brand-green text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-green/90 transition-all cursor-pointer active:scale-98 flex items-center gap-2 shadow-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Company Settings Tab (IMPORTER / USER role) */}
                            {activeTab === "company" && userRole === "USER" && (
                                <form onSubmit={(e) => handleProfileSubmit(e, "company")}>
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <Building2 className="w-4.5 h-4.5 text-slate-500" />
                                            Company Profile
                                        </h3>
                                        <p className="text-xs text-slate-550 font-semibold mt-1">
                                            Configure business properties, registration codes, and nature of trade.
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Company Name</label>
                                                <input
                                                    name="companyName"
                                                    value={companyData.companyName}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Enter company name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Phone Number</label>
                                                <input
                                                    name="phone"
                                                    value={companyData.phone}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="+255..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">TIN Number</label>
                                                <input
                                                    name="tinNumber"
                                                    value={companyData.tinNumber}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="9 Digits TIN Number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">BRELA Number</label>
                                                <input
                                                    name="brelaNumber"
                                                    value={companyData.brelaNumber}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Business registration number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Postal Address</label>
                                                <input
                                                    name="postalAddress"
                                                    value={companyData.postalAddress}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="P.O. Box..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Physical Address</label>
                                                <input
                                                    name="physicalAddress"
                                                    value={companyData.physicalAddress}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Street, City, Country"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Nature of Business</label>
                                                <select
                                                    name="natureOfBusiness"
                                                    value={companyData.natureOfBusiness}
                                                    onChange={handleCompanyChange}
                                                    className="appearance-none w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
                                                >
                                                    <option value="">Select Business Sector</option>
                                                    <option value="Manufacturing">Manufacturing</option>
                                                    <option value="Trading & Wholesale">Trading & Wholesale</option>
                                                    <option value="Logistics & Forwarding">Logistics & Forwarding</option>
                                                    <option value="Agriculture">Agriculture</option>
                                                    <option value="Retail">Retail</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Company Logo</label>
                                                <ImageUpload
                                                    value={companyData.logoUrl}
                                                    onChange={(url) => setCompanyData({ ...companyData, logoUrl: url })}
                                                    label="Upload Company Logo"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-brand-green text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-green/90 transition-all cursor-pointer active:scale-98 flex items-center gap-2 shadow-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Insurer Profile Tab (INSURER role) */}
                            {activeTab === "company" && userRole === "INSURER" && (
                                <form onSubmit={(e) => handleProfileSubmit(e, "company")}>
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <Building2 className="w-4.5 h-4.5 text-slate-500" />
                                            Insurer Agency Profile
                                        </h3>
                                        <p className="text-xs text-slate-550 font-semibold mt-1">
                                            Configure insurer branding, statutory identification codes, and cover note digital signatures.
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Insurer Agency Name</label>
                                                <input
                                                    name="companyName"
                                                    value={companyData.companyName}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Enter agency name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Office Phone</label>
                                                <input
                                                    name="phone"
                                                    value={companyData.phone}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Enter office phone"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">TIN Number</label>
                                                <input
                                                    name="tinNumber"
                                                    value={companyData.tinNumber}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Agency TIN"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Postal Address</label>
                                                <input
                                                    name="postalAddress"
                                                    value={companyData.postalAddress}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Agency P.O. Box"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Physical Address</label>
                                                <input
                                                    name="physicalAddress"
                                                    value={companyData.physicalAddress}
                                                    onChange={handleCompanyChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Headquarters location"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Agency Logo</label>
                                                <ImageUpload
                                                    value={companyData.logoUrl}
                                                    onChange={(url) => setCompanyData({ ...companyData, logoUrl: url })}
                                                    label="Upload Logo"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Signature className="w-3.5 h-3.5" />
                                                    Authorized Digital Signature
                                                </label>
                                                <p className="text-[10px] text-slate-450 font-bold mb-2">
                                                    This signature is appended to generated cover notes logged in the TIRA registry.
                                                </p>
                                                <ImageUpload
                                                    value={companyData.signature}
                                                    onChange={(url) => setCompanyData({ ...companyData, signature: url })}
                                                    label="Upload Digital Signature"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-brand-green text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-green/90 transition-all cursor-pointer active:scale-98 flex items-center gap-2 shadow-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Security & Passwords Tab */}
                            {activeTab === "security" && (
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <Lock className="w-4.5 h-4.5 text-slate-500" />
                                            Security Settings
                                        </h3>
                                        <p className="text-xs text-slate-550 font-semibold mt-1">
                                            Update your account password and secure access tokens.
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4 max-w-md">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        name="currentPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        value={passwordData.currentPassword}
                                                        onChange={handlePasswordChange}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                        placeholder="Enter current password"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 cursor-pointer"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">New Password</label>
                                                <input
                                                    name="newPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Enter new password"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Confirm New Password</label>
                                                <input
                                                    name="confirmPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-brand-green text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-green/90 transition-all cursor-pointer active:scale-98 flex items-center gap-2 shadow-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
