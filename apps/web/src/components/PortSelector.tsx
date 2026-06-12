"use client";

import { useState, useEffect } from "react";
import { Search, Anchor, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Port {
    id: string;
    code: string;
    name: string;
    country: string;
    type: string;
}

interface PortSelectorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const COUNTRIES = [
    { name: "Tanzania", code: "TZ" },
    { name: "Kenya", code: "KE" },
    { name: "China", code: "CN" },
    { name: "India", code: "IN" },
    { name: "United Arab Emirates", code: "AE" },
    { name: "South Africa", code: "ZA" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
    { name: "Japan", code: "JP" },
];

export function PortSelector({ label, value, onChange, placeholder = "Select a port...", className }: PortSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [ports, setPorts] = useState<Port[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPortData, setSelectedPortData] = useState<Port | null>(null);

    // Fetch initial ports or search
    useEffect(() => {
        const fetchPorts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append("search", search);
                if (selectedCountry) params.append("country", selectedCountry);

                const res = await fetch(`/api/ports?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setPorts(data);
                }
            } catch (error) {
                console.error("Failed to fetch ports", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchPorts, 300);
        return () => clearTimeout(debounce);
    }, [search, selectedCountry]);

    // Fetch selected port details on mount if value exists
    useEffect(() => {
        if (value && !selectedPortData) {
            fetch(`/api/ports?search=${value}`)
                .then(res => res.json())
                .then(data => {
                    const found = data.find((p: Port) => p.code === value);
                    if (found) setSelectedPortData(found);
                });
        }
    }, [value, selectedPortData]);

    // Update selected port data when selection changes
    const handleSelect = (port: Port) => {
        onChange(port.code);
        setSelectedPortData(port);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className={cn("space-y-3", className)}>
            <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">{label}</label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-brand-green/20 rounded-3xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <Anchor className={cn("w-5 h-5 transition-colors", selectedPortData ? "text-brand-green" : "text-gray-300")} />
                        <span className={cn("font-bold", selectedPortData ? "text-gray-900" : "text-gray-400")}>
                            {selectedPortData ? `${selectedPortData.name} (${selectedPortData.code})` : placeholder}
                        </span>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-green/10"
                                    placeholder="Search port or code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCountry(null)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        !selectedCountry ? "bg-gray-900 text-white" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                                    )}
                                >
                                    All
                                </button>
                                {COUNTRIES.map(country => (
                                    <button
                                        key={country.code}
                                        onClick={() => setSelectedCountry(country.code)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                            selectedCountry === country.code ? "bg-brand-green text-white" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                                        )}
                                    >
                                        {country.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2">
                            {loading ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
                                </div>
                            ) : ports.length > 0 ? (
                                ports.map(port => (
                                    <button
                                        key={port.code}
                                        onClick={() => handleSelect(port)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all group hover:bg-brand-green/5",
                                            value === port.code && "bg-brand-green/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center group-hover:border-brand-green/20 transition-all">
                                                <Anchor className="w-4 h-4 text-gray-400 group-hover:text-brand-green" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-gray-900">{port.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{port.code}</p>
                                            </div>
                                        </div>
                                        {value === port.code && <div className="w-2 h-2 rounded-full bg-brand-green shadow-lg shadow-green-200" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-400 font-medium italic">No ports discovered...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
