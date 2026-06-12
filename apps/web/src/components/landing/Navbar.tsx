"use client";

import { useEffect, useState } from "react";
import Link from "./Link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [activeHash, setActiveHash] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // If we are at the top, clear active section hash
            if (pathname === "/" && window.scrollY < 300) {
                setActiveHash("");
            }
        };

        const observerOptions = {
            root: null,
            rootMargin: "-20% 0px -60% 0px", // Trigger when section is in the middle of viewport
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");
                    if (id) {
                        setActiveHash(`#${id}`);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        if (pathname === "/") {
            const sections = ["steps", "faq"];
            sections.forEach((id) => {
                const el = document.getElementById(id);
                if (el) observer.observe(el);
            });
        }

        const handleHashChange = () => {
            setActiveHash(window.location.hash || "");
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("hashchange", handleHashChange);
        
        // Run hash change handler initially
        handleHashChange();
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("hashchange", handleHashChange);
            observer.disconnect();
        };
    }, [pathname]);

    const isLinkActive = (href: string) => {
        if (href.startsWith("/#")) {
            const hash = href.split("#")[1];
            const active = activeHash.startsWith("#") ? activeHash.slice(1) : activeHash;
            return active === hash;
        }
        return pathname === href;
    };

    return (
        <header
            className={cn(
                "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 font-sans w-full max-w-7xl px-4 sm:px-6 lg:px-8",
                scrolled ? "top-3" : "top-5"
            )}
        >
            <div
                className={cn(
                    "w-full mx-auto px-6 py-3 flex items-center justify-between transition-all duration-350 rounded-2xl border",
                    scrolled
                        ? "bg-white/80 backdrop-blur-xl border-gray-200/60 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05),0_1px_1px_rgba(255,255,255,0.8)]"
                        : "bg-white/40 backdrop-blur-md border-white/20 shadow-sm"
                )}
            >
                {/* Logo & Brand name */}
                <Link href="/" className="flex items-center gap-3 group" prefetch={false}>
                    <img src="/logo.svg" alt="NIIS-T Logo" className="w-11 h-11 object-contain transition-transform group-hover:scale-105" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
                            NIIS-T
                        </span>
                        <span className="text-[9px] font-black text-brand-green tracking-wider uppercase leading-none mt-1">
                            National Import Insurance
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation links */}
                <nav className="hidden md:flex items-center gap-8">
                    {[
                        { href: "/about", label: "About NIIS-T" },
                        { href: "/#steps", label: "How It Works" },
                        { href: "/#faq", label: "Help & FAQ" },
                        { href: "/contact", label: "Contact Us" }
                    ].map((item) => {
                        const isActive = isLinkActive(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "relative text-sm font-semibold transition-colors py-1 group",
                                    isActive ? "text-brand-green font-bold" : "text-gray-600 hover:text-brand-green"
                                )}
                                prefetch={false}
                            >
                                {item.label}
                                <span className={cn(
                                    "absolute bottom-0 left-0 h-0.5 bg-brand-green transition-all duration-300",
                                    isActive ? "w-full" : "w-0 group-hover:w-full"
                                )} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Action buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="px-5 py-2 text-sm font-bold text-gray-700 hover:text-brand-green hover:bg-gray-100/50 rounded-xl transition-all"
                        prefetch={false}
                    >
                        Log In
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 to-brand-green hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-md shadow-brand-green/20 hover:shadow-lg hover:shadow-brand-green/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
                        prefetch={false}
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Mobile Menu trigger */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-700 hover:text-brand-green hover:bg-gray-100 rounded-xl transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <div
                className={cn(
                    "absolute left-4 right-4 mt-3 md:hidden bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl transition-all duration-300 overflow-hidden shadow-xl",
                    mobileMenuOpen ? "max-h-[300px] opacity-100 py-6 px-6" : "max-h-0 opacity-0 py-0 px-6 pointer-events-none"
                )}
            >
                <div className="flex flex-col gap-3">
                    {[
                        { href: "/about", label: "About NIIS-T" },
                        { href: "/#steps", label: "How It Works" },
                        { href: "/#faq", label: "Help & FAQ" },
                        { href: "/contact", label: "Contact Us" }
                    ].map((item) => {
                        const isActive = isLinkActive(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "text-base font-semibold px-4 py-2.5 rounded-xl transition-all border border-transparent",
                                    isActive 
                                        ? "bg-emerald-50 text-brand-green font-bold border-l-4 border-l-brand-green" 
                                        : "text-gray-800 hover:text-brand-green hover:bg-gray-50"
                                )}
                                prefetch={false}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 text-center py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                            prefetch={false}
                        >
                            Log In
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 text-center py-3 text-sm font-extrabold text-white bg-brand-green rounded-xl shadow-md shadow-brand-green/10 transition-all"
                            prefetch={false}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}