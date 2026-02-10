"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    summary: React.ReactNode;
    className?: string;
}

export function FormLayout({ children, sidebar, summary, className }: FormLayoutProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 gap-8 min-h-[calc(100vh-120px)]",
            sidebar ? "lg:grid-cols-[280px_1fr_320px]" : "lg:grid-cols-[1fr_320px]",
            className
        )}>
            {/* Left Column: Sidebar (Optional) */}
            {sidebar && (
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                        {sidebar}
                    </div>
                </aside>
            )}

            {/* Middle Column: Main Form */}
            <main className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 mb-8 lg:mb-0">
                {children}
            </main>

            {/* Right Column: Real-time Summary */}
            <aside>
                <div className="sticky top-24">
                    <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl shadow-gray-200">
                        {summary}
                    </div>
                </div>
            </aside>
        </div>
    );
}
