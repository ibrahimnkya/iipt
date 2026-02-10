"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MapPin, MessageSquare, ArrowRight } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                <section className="py-20 bg-[#F8FAFC]">
                    <div className="container mx-auto px-6 text-center space-y-6">
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight">How can we <span className="text-brand-blue leading-tight underline decoration-brand-yellow decoration-4 underline-offset-8">help?</span></h1>
                        <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">
                            Need technical assistance or have questions about your insurance policy? Our support team is available 24/7.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            {/* Contact Form */}
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-gray-900">Send us a message</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Fill out the form below and a TIRA-certified agent will get back to you within 2 hours.
                                    </p>
                                </div>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-brand-green/20 focus:ring-4 focus:ring-brand-green/5 rounded-2xl outline-none transition-all font-bold text-gray-900" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-brand-green/20 focus:ring-4 focus:ring-brand-green/5 rounded-2xl outline-none transition-all font-bold text-gray-900" placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                        <input className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-brand-green/20 focus:ring-4 focus:ring-brand-green/5 rounded-2xl outline-none transition-all font-bold text-gray-900" placeholder="Policy Assistance" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                        <textarea rows={6} className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-brand-green/20 focus:ring-4 focus:ring-brand-green/5 rounded-2xl outline-none transition-all font-bold text-gray-900 resize-none" placeholder="Describe your inquiry..." />
                                    </div>
                                    <button className="w-full py-5 bg-[#0F172A] text-white font-black rounded-3xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group">
                                        Submit Inquiry
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>

                            {/* Info */}
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-gray-900">Reach out directly</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Visit our headquarters or call our authorized TIRA hotline.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { icon: Phone, title: "Call Center", text: "+255 22 213 2537", sub: "Toll-free within Tanzania" },
                                        { icon: Mail, title: "Official Email", text: "info@tira.go.tz", sub: "We usually reply in 24 hours" },
                                        { icon: MapPin, title: "Head Office", text: "PSSSF Commercial Complex", sub: "Ground Floor, Dodoma, Tanzania" },
                                        { icon: MessageSquare, title: "Chat Support", text: "Available 24/7", sub: "Start a live session in-portal" }
                                    ].map((info, i) => (
                                        <div key={i} className="flex gap-6 items-start group">
                                            <div className="w-14 h-14 bg-brand-blue/5 text-brand-blue rounded-2xl flex items-center justify-center shrink-0 border border-brand-blue/10 group-hover:bg-brand-blue group-hover:text-white transition-all">
                                                <info.icon className="w-6 h-6" />
                                            </div>
                                            <div className="pt-1">
                                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{info.title}</h3>
                                                <p className="text-xl font-black text-gray-900 group-hover:text-brand-blue transition-colors">{info.text}</p>
                                                <p className="text-sm font-medium text-gray-500">{info.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-10 bg-brand-green/5 border border-brand-green/10 rounded-[2.5rem] space-y-4">
                                    <h4 className="text-xl font-black text-gray-900">Complaints Handling</h4>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        If you have any grievances regarding an insurance policy or broker service, please contact TIRA Complaints Department directly at <span className="text-brand-green font-black underline">complaints@tira.go.tz</span>.
                                    </p>
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
