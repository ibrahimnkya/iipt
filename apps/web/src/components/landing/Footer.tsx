"use client";

import Link from "./Link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, Shield } from "lucide-react";

export default function Footer() {
    const quickLinks = [
        { label: "How it Works", href: "/how-it-works" },
        { label: "Coverage", href: "/coverage" },
        { label: "FAQ", href: "/faq" },
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" }
    ];

    const socialLinks = [
        { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
        { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Youtube, href: "https://youtube.com", label: "YouTube" }
    ];

    return (
        <footer className="bg-gray-900 relative overflow-hidden border-t border-white/10">
            {/* Subtle Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
            
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* Brand & Description */}
                        <div className="lg:col-span-4 space-y-6">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <img src="/logo.svg" alt="NIIS-T Logo" className="w-11 h-11 object-contain transition-transform group-hover:scale-105" />
                                <span className="text-2xl font-black text-white tracking-tight">NIIS-T</span>
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                                National Import Insurance System – Tanzania (NIIS-T) - Your trusted partner for legally compliant marine cargo insurance coverage.
                            </p>
                            
                            {/* Contact */}
                            <div className="space-y-3">
                                <a href="tel:+2552220000" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group" suppressHydrationWarning>
                                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-green transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span>+255 22 220 000</span>
                                </a>
                                <a href="mailto:support@niip.co.tz" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group" suppressHydrationWarning>
                                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-green transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span>support@niip.co.tz</span>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="lg:col-span-5">
                            <h3 className="text-white font-bold text-base mb-5">Quick Links</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                {quickLinks.map((link, idx) => (
                                    <Link 
                                        key={idx}
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-brand-green transition-colors font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Regulatory & Social */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* TIRA Badge */}
                            <div>
                                <h3 className="text-white font-bold text-base mb-4">Regulated By</h3>
                                <div className="inline-flex items-center gap-3 bg-white/5 px-5 py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <img src="/tira_logo.png" alt="TIRA" className="w-10 h-10 rounded" />
                                    <div>
                                        <p className="text-sm font-bold text-white">TIRA</p>
                                        <p className="text-xs text-gray-400">Tanzania Insurance Regulatory Authority</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-white font-bold text-base mb-4">Follow Us</h3>
                                <div className="flex gap-3">
                                    {socialLinks.map((social, idx) => {
                                        const Icon = social.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                href={social.href}
                                                aria-label={social.label}
                                                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white transition-all hover:scale-110"
                                            >
                                                <Icon className="w-5 h-5" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                        <p suppressHydrationWarning>
                            © {new Date().getFullYear()} Import Insurance Portal of Tanzania. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/sitemap" className="hover:text-white transition-colors font-medium">
                                Sitemap
                            </Link>
                            <Link href="/accessibility" className="hover:text-white transition-colors font-medium">
                                Accessibility
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}