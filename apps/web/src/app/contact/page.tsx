"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MapPin, MessageSquare, ArrowRight, Send, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.04),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.04),transparent_50%)]" />
                    
                    <div className="container mx-auto px-6 text-center space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-2">
                            <MessageSquare className="w-4 h-4 text-brand-green" />
                            <span className="text-sm font-semibold text-gray-700">
                                We're here to help
                            </span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Get in <span className="bg-gradient-to-r from-brand-green to-green-600 bg-clip-text text-transparent">Touch</span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                            Need technical assistance or have questions about your insurance policy? Our support team is available 24/7.
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-500" />
                                <span className="font-semibold">2-hour response time</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="font-semibold">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 max-w-7xl mx-auto">
                            {/* Contact Form */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Send us a message</h2>
                                    <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                        Fill out the form below and a TIRA-certified agent will get back to you within 2 hours.
                                    </p>
                                </div>
                                
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                            <input 
                                                type="text"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 rounded-2xl outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-400" 
                                                placeholder="John Doe" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                            <input 
                                                type="email"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 rounded-2xl outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-400" 
                                                placeholder="john@example.com" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Subject</label>
                                        <input 
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 rounded-2xl outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-400" 
                                            placeholder="Policy Assistance" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Message</label>
                                        <textarea 
                                            rows={6} 
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 rounded-2xl outline-none transition-all font-semibold text-gray-900 resize-none placeholder:text-gray-400" 
                                            placeholder="Describe your inquiry..."
                                        />
                                    </div>
                                    
                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-brand-green text-white font-black text-lg rounded-2xl hover:bg-green-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-green-500/20"
                                    >
                                        <Send className="w-5 h-5" />
                                        Submit Inquiry
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Reach out directly</h2>
                                    <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                        Visit our headquarters or call our authorized TIRA hotline.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { 
                                            icon: Phone, 
                                            title: "Call Center", 
                                            text: "+255 22 213 2537", 
                                            sub: "Toll-free within Tanzania",
                                            href: "tel:+255222132537"
                                        },
                                        { 
                                            icon: Mail, 
                                            title: "Official Email", 
                                            text: "info@iipt.go.tz", 
                                            sub: "We usually reply in 24 hours",
                                            href: "mailto:info@iipt.go.tz"
                                        },
                                        { 
                                            icon: MapPin, 
                                            title: "Head Office", 
                                            text: "PSSSF Commercial Complex", 
                                            sub: "Ground Floor, Dodoma, Tanzania",
                                            href: "#"
                                        },
                                        { 
                                            icon: MessageSquare, 
                                            title: "Chat Support", 
                                            text: "Available 24/7", 
                                            sub: "Start a live session in-portal",
                                            href: "#chat"
                                        }
                                    ].map((info, i) => (
                                        <a 
                                            key={i}
                                            href={info.href}
                                            className="flex gap-5 items-start group p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-green hover:shadow-lg transition-all"
                                        >
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-green-50 text-brand-green rounded-2xl flex items-center justify-center shrink-0 border-2 border-gray-100 group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-white group-hover:scale-110 transition-all">
                                                <info.icon className="w-6 h-6" strokeWidth={2.5} />
                                            </div>
                                            <div className="pt-1">
                                                <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">{info.title}</h3>
                                                <p className="text-xl font-extrabold text-gray-900 group-hover:text-brand-green transition-colors mb-1">{info.text}</p>
                                                <p className="text-sm font-medium text-gray-500">{info.sub}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </main>
            <Footer />
        </div>
    );
}