"use client";

import { useEffect, useState, useRef } from "react";
import { Clipboard, ShieldCheck, Compass, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const stepItems = [
  {
    num: "01",
    title: "Enter Shipment Details",
    description:
      "Provide basic information about your cargo, shipment value, and destination. Our guided process helps you complete your application in minutes.",
    icon: Clipboard,
    processLabel: "What you'll provide",
    processBullets: [
      "Cargo type and declared value",
      "Origin and destination ports",
      "Shipment date and mode of transport",
    ],
    toolsLabel: "Supported inputs",
    tools: ["Commercial Invoice", "Bill of Lading", "Online Form"],
    visual: {
      label: "Shipment details form",
      bg: "from-emerald-50 to-teal-50",
      accent: "bg-emerald-100",
    },
  },
  {
    num: "02",
    title: "Compare Insurance Options",
    description:
      "Review coverage options and premiums from trusted insurance providers in one place. Choose the policy that best fits your shipment and budget.",
    icon: Compass,
    processLabel: "What you'll compare",
    processBullets: [
      "Premium rates across multiple providers",
      "Coverage scope — all-risk vs named perils",
      "Exclusions and deductible terms",
    ],
    toolsLabel: "Insurance partners",
    tools: ["Licensed Tanzanian Insurers", "Side-by-side view"],
    visual: {
      label: "Quote comparison screen",
      bg: "from-blue-50 to-indigo-50",
      accent: "bg-blue-100",
    },
  },
  {
    num: "03",
    title: "Pay Securely",
    description:
      "Complete payment using mobile money, bank transfer, or other supported methods through our secure, encrypted payment gateway.",
    icon: Wallet,
    processLabel: "Payment methods",
    processBullets: [
      "M-Pesa, Tigo Pesa, Airtel Money",
      "Bank transfer and debit card",
      "Encrypted, PCI-compliant checkout",
    ],
    toolsLabel: "Powered by",
    tools: ["Secure Gateway", "Mobile Money", "Bank Transfer"],
    visual: {
      label: "Secure payment screen",
      bg: "from-violet-50 to-purple-50",
      accent: "bg-violet-100",
    },
  },
  {
    num: "04",
    title: "Receive Instant Coverage",
    description:
      "Your digital marine cargo insurance policy and cover note are generated instantly and made available for download, sharing, and future reference.",
    icon: ShieldCheck,
    processLabel: "What you receive",
    processBullets: [
      "Digital policy document (PDF)",
      "Official cover note for customs",
      "Policy accessible anytime in your portal",
    ],
    toolsLabel: "Delivery format",
    tools: ["Instant Download", "Email Delivery", "Portal Storage"],
    visual: {
      label: "Policy issued confirmation",
      bg: "from-emerald-50 to-green-50",
      accent: "bg-emerald-100",
    },
  },
];

const benefits = [
  { label: "Fully Digital Experience", num: "01" },
  { label: "Multiple Insurance Providers", num: "02" },
  { label: "Instant Policy Issuance", num: "03" },
  { label: "Secure Online Payments", num: "04" },
  { label: "Easy Document Access", num: "05" },
  { label: "Designed for Tanzania", num: "06" },
];

export default function Steps() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [whyVisible, setWhyVisible] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const whyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step"));
            setVisibleSteps((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.15 }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    const whyObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setWhyVisible(true);
      },
      { threshold: 0.1 }
    );
    if (whyRef.current) whyObserver.observe(whyRef.current);

    return () => {
      observer.disconnect();
      whyObserver.disconnect();
    };
  }, []);

  return (
    <section
      id="steps"
      className="relative bg-white text-gray-950 overflow-hidden font-sans border-b border-gray-100"
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none absolute top-[-8%] left-[-4%] w-[500px] h-[500px] rounded-full bg-emerald-200/[0.15] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-8%] right-[-4%] w-[400px] h-[400px] rounded-full bg-teal-300/[0.07] blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── Header ─────────────────────────────── */}
        <div className="py-24 lg:py-28 max-w-2xl">
          <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand-green mb-4">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.06] tracking-tight text-gray-900">
            A seamless journey,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-brand-green">
              from quote to coverage.
            </span>
          </h2>
          <p className="mt-5 text-base text-gray-500 leading-relaxed max-w-xl font-medium">
            NIIS-T makes marine cargo insurance fast, transparent, and completely
            digital — in four steps.
          </p>
        </div>

        {/* ── Step Cards ─────────────────────────── */}
        <div className="space-y-0">
          {stepItems.map((step, idx) => {
            const Icon = step.icon;
            const isReverse = idx % 2 !== 0;
            const isVisible = visibleSteps.has(idx);

            return (
              <div
                key={idx}
                ref={(el) => { stepRefs.current[idx] = el; }}
                data-step={idx}
                className={cn(
                  "relative border-t border-gray-100 py-16 lg:py-20 transition-all duration-700",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
              >
                {/* Ghost number watermark */}
                <span
                  className={cn(
                    "pointer-events-none select-none absolute top-6 text-[140px] lg:text-[180px] font-black leading-none text-gray-100",
                    isReverse ? "left-0" : "right-0"
                  )}
                >
                  {step.num}
                </span>

                <div
                  className={cn(
                    "relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center",
                    isReverse && "lg:[direction:rtl]"
                  )}
                >
                  {/* ── Left / Content ── */}
                  <div className={cn(isReverse && "lg:[direction:ltr]")}>

                    {/* Step badge */}
                    <div className="inline-flex items-center gap-2.5 mb-6 bg-gray-50 border border-gray-200/80 rounded-full py-1.5 pl-1.5 pr-4">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-brand-green" />
                      </div>
                      <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-gray-500">
                        Step {step.num}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-[2rem] font-black tracking-tight text-gray-900 mb-4 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-[15px] text-gray-500 leading-relaxed font-medium mb-8 max-w-prose">
                      {step.description}
                    </p>

                    {/* Sub-process bullets */}
                    <div className="mb-8">
                      <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-gray-400 mb-3">
                        {step.processLabel}
                      </p>
                      <ul className="space-y-2.5">
                        {step.processBullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tools row */}
                    <div>
                      <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-gray-400 mb-3">
                        {step.toolsLabel}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.tools.map((tool, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1.5 bg-[#FAFBFC] border border-gray-200/70 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-gray-600"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Right / Visual ── */}
                  <div className={cn(isReverse && "lg:[direction:ltr]")}>
                    <div
                      className={cn(
                        "relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br",
                        step.visual.bg
                      )}
                    >
                      {/* Step pill inside visual */}
                      <div className="absolute top-4 left-4 z-10 bg-brand-green text-white text-[11px] font-extrabold tracking-widest uppercase rounded-full px-3 py-1">
                        Step {step.num}
                      </div>

                      {/* Decorative pattern */}
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)",
                          backgroundSize: "28px 28px",
                        }}
                      />

                      {/* Center icon illustration */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div
                          className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm border border-white/60",
                            step.visual.accent
                          )}
                        >
                          <Icon className="w-9 h-9 text-brand-green" />
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-2">
                          <span className="text-[13px] font-bold text-gray-700">
                            {step.visual.label}
                          </span>
                        </div>
                      </div>

                      {/* Corner accent */}
                      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-[80px] bg-white/30" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Why Choose NIIS-T ──────────────────── */}
        <div
          ref={whyRef}
          className={cn(
            "py-20 lg:py-24 border-t border-gray-100 transition-all duration-700",
            whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand-green mb-3">
                Why NIIS-T
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Built for Tanzania's{" "}
                <br className="hidden sm:block" />
                import ecosystem.
              </h3>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed font-medium lg:text-right">
              Every feature is designed around how importers in Tanzania actually
              work — from payment to paperwork.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-4 bg-[#FAFBFC] border border-gray-200/60 hover:border-emerald-500/25 hover:bg-white hover:shadow-md hover:scale-[1.02] rounded-2xl p-5 transition-all duration-300 cursor-default"
              >
                <span className="text-[10px] font-black text-gray-300 tracking-widest group-hover:text-emerald-500/60 transition-colors duration-300 shrink-0">
                  {benefit.num}
                </span>
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-snug">
                  {benefit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}