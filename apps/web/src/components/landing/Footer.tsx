"use client";

import Link from "next/link";
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
            
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Main Footer Content */}
                <div className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Brand & Description */}
                        <div className="lg:col-span-4 space-y-5">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">TIIP</span>
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                                Tanzania's trusted import insurance portal. Get compliant coverage for your imported goods in minutes.
                            </p>
                            
                            {/* Contact */}
                            <div className="space-y-2">
                                <a href="tel:+255000000000" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Phone className="w-4 h-4" />
                                    <span>+255 000 000 000</span>
                                </a>
                                <a href="mailto:info@tiip.go.tz" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" />
                                    <span>info@tiip.go.tz</span>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="lg:col-span-5">
                            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                {quickLinks.map((link, idx) => (
                                    <Link 
                                        key={idx}
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Regulatory & Social */}
                        <div className="lg:col-span-3 space-y-5">
                            {/* TIRA Badge */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-3">Regulated By</h3>
                                <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10">
                                    <img src="/tira_logo.png" alt="TIRA" className="w-8 h-8 rounded" />
                                    <div>
                                        <p className="text-xs font-semibold text-white">TIRA</p>
                                        <p className="text-[10px] text-gray-400">Tanzania Insurance</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-3">Follow Us</h3>
                                <div className="flex gap-2">
                                    {socialLinks.map((social, idx) => {
                                        const Icon = social.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                href={social.href}
                                                aria-label={social.label}
                                                className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all"
                                            >
                                                <Icon className="w-4 h-4" />
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
                        <p>
                            © {new Date().getFullYear()} Tanzania Import Insurance Portal. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/sitemap" className="hover:text-white transition-colors">
                                Sitemap
                            </Link>
                            <Link href="/accessibility" className="hover:text-white transition-colors">
                                Accessibility
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}