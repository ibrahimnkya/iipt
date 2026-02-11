"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, Shield, MapPin } from "lucide-react";

export default function Footer() {
    const quickLinks = [
        { label: "How it Works", href: "/how-it-works" },
        { label: "Coverage", href: "/coverage" },
        { label: "FAQ", href: "/faq" },
        { label: "About Us", href: "/about" }
    ];

    const legalLinks = [
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Accessibility", href: "/accessibility" }
    ];

    const socialLinks = [
        { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
        { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Youtube, href: "https://youtube.com", label: "YouTube" }
    ];

    return (
        <footer className="bg-gray-900 relative overflow-hidden border-t border-white/10">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
            
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
                        {/* Brand & Description */}
                        <div className="lg:col-span-4 space-y-6">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white leading-none">IIPT</span>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-none mt-1">
                                        Tanzania
                                    </span>
                                </div>
                            </Link>
                            
                            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                                Import Insurance Portal of Tanzania - Your trusted partner for comprehensive import insurance coverage. Fast, secure, and fully compliant with Tanzania regulations.
                            </p>
                            
                            {/* Contact Info */}
                            <div className="space-y-3 pt-2">
                                <a 
                                    href="tel:+255000000000" 
                                    className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
                                >
                                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span>+255 000 000 000</span>
                                </a>
                                <a 
                                    href="mailto:info@iipt.go.tz" 
                                    className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
                                >
                                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span>info@iipt.go.tz</span>
                                </a>
                                <div className="flex items-start gap-3 text-sm text-gray-400">
                                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span>Dar es Salaam, Tanzania</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="lg:col-span-3">
                            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Quick Links</h3>
                            <div className="space-y-3">
                                {quickLinks.map((link, idx) => (
                                    <Link 
                                        key={idx}
                                        href={link.href}
                                        className="block text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div className="lg:col-span-2">
                            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Legal</h3>
                            <div className="space-y-3">
                                {legalLinks.map((link, idx) => (
                                    <Link 
                                        key={idx}
                                        href={link.href}
                                        className="block text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all"
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
                                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Regulated By</h3>
                                <div className="inline-flex items-center gap-3 bg-white/5 px-5 py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <img src="/tira_logo.png" alt="TIRA" className="w-10 h-10 rounded-lg" />
                                    <div>
                                        <p className="text-sm font-bold text-white">TIRA</p>
                                        <p className="text-xs text-gray-400">Tanzania Insurance Regulatory Authority</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Follow Us</h3>
                                <div className="flex gap-3">
                                    {socialLinks.map((social, idx) => {
                                        const Icon = social.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                href={social.href}
                                                aria-label={social.label}
                                                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-blue-600 hover:to-green-600 hover:text-white transition-all hover:scale-110 border border-white/10"
                                            >
                                                <Icon className="w-5 h-5" strokeWidth={2} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} Import Insurance Portal of Tanzania. All rights reserved.
                        </p>
                        <div className="flex items-center gap-8">
                            <Link 
                                href="/sitemap" 
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Sitemap
                            </Link>
                            <Link 
                                href="/privacy" 
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Privacy
                            </Link>
                            <Link 
                                href="/terms" 
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}