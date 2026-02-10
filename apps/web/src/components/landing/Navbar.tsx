"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between font-sans">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.svg" alt="TIIP Logo" className="w-10 h-10" />
                    <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">TIIP</span>
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />
                    <img src="/tira_logo.png" alt="TIRA Logo" className="w-8 h-8 hidden sm:block" />
                </Link>

                <nav className="hidden lg:flex items-center gap-10">
                    <Link href="/about" className="text-sm font-bold text-gray-600 hover:text-brand-green transition-colors">About</Link>
                    <Link href="/#faq" className="text-sm font-bold text-gray-600 hover:text-brand-green transition-colors">FAQ</Link>
                    <Link href="/contact" className="text-sm font-bold text-gray-600 hover:text-brand-green transition-colors">Contact</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block px-6 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 rounded-2xl transition-all">Login</Link>
                    <Link href="/login" className="px-6 py-2.5 text-sm font-black text-white bg-brand-green hover:bg-green-700 rounded-2xl shadow-lg shadow-brand-green/20 transition-all hover:scale-105 active:scale-95">Get Started</Link>
                </div>
            </div>
        </header>
    );
}
