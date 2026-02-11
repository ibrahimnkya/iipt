"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo and Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                        <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-gray-900 leading-none">IIPT</span>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none mt-0.5">
                            Tanzania
                        </span>
                    </div>
                    <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block" />
                    <img src="/tira_logo.png" alt="TIRA Logo" className="w-9 h-9 hidden md:block" />
                </Link>

                {/* Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link 
                        href="/about" 
                        className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
                    >
                        About
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link 
                        href="/how-it-works" 
                        className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
                    >
                        How it Works
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link 
                        href="/#faq" 
                        className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
                    >
                        FAQ
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link 
                        href="/contact" 
                        className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
                    >
                        Contact
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                </nav>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3">
                    <Link 
                        href="/login" 
                        className="hidden sm:block px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Login
                    </Link>
                    <Link 
                        href="/login" 
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}