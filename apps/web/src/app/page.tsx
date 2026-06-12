"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Steps from "@/components/landing/Steps";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Steps />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
