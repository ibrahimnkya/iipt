"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search,
    User2,
    LogOut,
    Activity,
    ChevronDown,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function DashboardTopbar() {
    const { data: session } = useSession();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close profile dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session) return null;

    const userRole = session.user?.role || "IMPORTER";
    const userInitials = session.user?.fullName
        ? session.user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : session.user?.name?.slice(0, 2).toUpperCase() || "US";

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return (
        <div className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/40 px-6 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 font-sans transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.01)]">
            {/* Left side actions */}
            <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Sidebar Toggle Hamburger */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 -ml-2 rounded-xl text-slate-650 hover:bg-slate-100 active:scale-95 transition-all mr-2 flex items-center justify-center cursor-pointer"
                    aria-label="Toggle navigation menu"
                >
                    <Menu className="w-5 h-5 text-slate-700" />
                </button>

                {/* Mobile Logo & Brand */}
                <div className="flex lg:hidden items-center gap-2 select-none flex-shrink-0">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-green/20 border border-brand-green/30">
                        <img src="/logo.svg" alt="NIIS-T Logo" className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-800 text-sm tracking-tight">NIIS-T</span>
                </div>
            </div>

            {/* Search Input Mockup */}
            <div className="hidden md:flex items-center gap-2.5 bg-slate-50/70 border border-slate-200/50 rounded-xl px-3.5 py-1.5 w-80 focus-within:bg-white focus-within:border-brand-green/50 focus-within:ring-4 focus-within:ring-brand-green/5 focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:bg-slate-100/40 hover:border-slate-300/60 transition-all duration-350 shadow-sm group">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-brand-green group-focus-within:scale-105 transition-all duration-300 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search policies, orders, cargo..."
                    className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder:text-slate-400 placeholder:font-medium font-semibold py-0.5"
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 font-mono text-[9px] font-semibold text-slate-400 shadow-sm transition-colors duration-300 group-focus-within:border-slate-300 group-focus-within:text-slate-500">
                    ⌘K
                </kbd>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-4">
                {/* Profile Card & Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className={cn(
                            "flex items-center gap-2.5 p-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full pr-3 transition-all cursor-pointer active:scale-98 shadow-sm hover:shadow",
                            profileOpen && "ring-4 ring-slate-100 border-slate-300 bg-slate-50"
                        )}
                    >
                        <div className="relative w-8.5 h-8.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center overflow-hidden flex-shrink-0 font-bold">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.companyName || "Logo"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-black tracking-tight">{userInitials}</span>
                            )}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-28">
                                {session.user?.companyName || session.user?.fullName?.split(" ")[0] || session.user?.name}
                            </p>
                            {userRole === "ADMIN" && (
                                <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-[5px] text-[7.5px] font-black uppercase tracking-widest leading-none mt-1 scale-95 origin-left shadow-sm shadow-indigo-100">
                                    Admin
                                </span>
                            )}
                            {userRole === "INSURER" && (
                                <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-[5px] text-[7.5px] font-black uppercase tracking-widest leading-none mt-1 scale-95 origin-left shadow-sm shadow-blue-100">
                                    Insurer
                                </span>
                            )}
                            {userRole !== "ADMIN" && userRole !== "INSURER" && (
                                <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-[5px] text-[7.5px] font-black uppercase tracking-widest leading-none mt-1 scale-95 origin-left shadow-sm shadow-green-100">
                                    Importer
                                </span>
                            )}
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", profileOpen && "rotate-180")} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250 z-50">
                            {/* Profile Info Summary */}
                            <div className="p-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green/10 to-brand-green/20 text-brand-green border border-brand-green/25 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {userInitials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                        {session.user?.fullName || session.user?.name}
                                    </p>
                                    <p className="text-[10px] text-slate-550 font-medium truncate leading-tight mt-0.5">
                                        {session.user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Dropdown Items */}
                            <div className="p-2 space-y-0.5">
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group"
                                >
                                    <User2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    Account Profile
                                </Link>

                                <Link
                                    href="/dashboard/help"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group"
                                >
                                    <Activity className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    Support Center
                                </Link>

                                <div className="h-px bg-slate-100 my-1.5 mx-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 text-left cursor-pointer group"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
