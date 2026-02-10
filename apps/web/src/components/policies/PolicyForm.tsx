
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Save,
    Trash2,
    Plus,
    X as XIcon,
    Loader2,
    FileText,
    Shield,
    Package,
    Percent,
    Calendar,
    Anchor,
    Truck,
    Plane,
    Globe,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicyService, PolicyData } from "@/services/policyService"; // Ensure this import path is correct and type exists
import { toast } from "sonner";

const CARGO_TYPES = ["General", "Fragile", "Perishable", "Hazardous", "Bulk"];
const TRANSPORT_MODES = ["Sea", "Air", "Road", "Rail", "Multimodal"];
const INCOTERMS = ["CIF", "CFR", "FOB", "CIP", "CPT", "EXW"];

interface PolicyFormProps {
    initialData?: PolicyData;
    isEditing?: boolean;
}

export function PolicyForm({ initialData, isEditing = false }: PolicyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const defaultState = {
        name: "",
        code: "",
        clauseType: "ICC (A)",
        description: "",
        isActive: true,
        cargoTypes: [] as string[],
        transportModes: [] as string[],
        incoterms: [] as string[],
        geoScope: "Worldwide",
        originPorts: [] as string[],
        destinationPorts: [] as string[],
        valuationBasis: "CIF",
        minSumInsured: 0,
        maxSumInsured: 0,
        currency: "USD",
        rate: 0,
        minPremium: 0,
        hazardousLoading: 0,
        discount: 0,
        vat: 18,
        additionalCovers: [] as { name: string; type: "Flat" | "Percentage"; amount: number }[],
        startDate: "",
        endDate: "",
        autoInvoice: true,
        autoIssue: true,
        manualApproval: false,
        internalNotes: ""
    };

    const [policyForm, setPolicyForm] = useState(defaultState);

    useEffect(() => {
        if (initialData) {
            // Format dates for input fields
            const formattedData = {
                ...defaultState,
                ...initialData,
                startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
                endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
            };
            setPolicyForm(formattedData);
        }
    }, [initialData]);

    const calculatePreview = useMemo(() => {
        const base = 100000;
        const premium = (base * policyForm.rate) / 100;
        const discount = (premium * policyForm.discount) / 100;
        const vat = ((premium - discount) * policyForm.vat) / 100;
        return {
            base,
            premium: premium - discount + vat,
            netPremium: premium - discount,
            vat
        };
    }, [policyForm.rate, policyForm.discount, policyForm.vat]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!policyForm.name || !policyForm.code || !policyForm.clauseType || policyForm.transportModes.length === 0 || policyForm.rate <= 0) {
            toast.error("Please fill all mandatory fields and ensure premium rate is > 0");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && initialData?.id) {
                await PolicyService.update(initialData.id, policyForm);
                toast.success("Policy updated successfully");
                router.push(`/admin/policies/${initialData.id}`);
            } else {
                await PolicyService.create(policyForm);
                toast.success("Policy created successfully");
                router.push("/admin/policies");
            }
            router.refresh();
        } catch (error) {
            console.error("Error saving policy", error);
            toast.error("Failed to save policy");
        } finally {
            setLoading(false);
        }
    };

    const toggleMultiSelect = (field: "cargoTypes" | "transportModes" | "incoterms", value: string) => {
        setPolicyForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const addAdditionalCover = () => {
        setPolicyForm(prev => ({
            ...prev,
            additionalCovers: [...prev.additionalCovers, { name: "", type: "Flat", amount: 0 }]
        }));
    };

    const removeAdditionalCover = (index: number) => {
        setPolicyForm(prev => ({
            ...prev,
            additionalCovers: prev.additionalCovers.filter((_, i) => i !== index)
        }));
    };

    const updateAdditionalCover = (index: number, field: string, value: any) => {
        setPolicyForm(prev => {
            const covers = [...prev.additionalCovers];
            covers[index] = { ...covers[index], [field]: value };
            return { ...prev, additionalCovers: covers };
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                placeholder="e.g., Marine Cargo – ICC (A)"
                                value={policyForm.name}
                                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Code *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                placeholder="e.g., TIIPS-MC-ICC-A"
                                value={policyForm.code}
                                onChange={(e) => setPolicyForm({ ...policyForm, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Clause Type *</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                value={policyForm.clauseType}
                                onChange={(e) => setPolicyForm({ ...policyForm, clauseType: e.target.value })}
                            >
                                <option>ICC (A)</option>
                                <option>ICC (B)</option>
                                <option>ICC (C)</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mt-auto">
                            <span className="text-sm font-medium text-gray-700">Active Status</span>
                            <button
                                onClick={() => setPolicyForm({ ...policyForm, isActive: !policyForm.isActive })}
                                className={cn(
                                    "w-11 h-6 rounded-full transition-all relative",
                                    policyForm.isActive ? "bg-emerald-500" : "bg-gray-300"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow",
                                    policyForm.isActive ? "left-6" : "left-1"
                                )} />
                            </button>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
                                rows={3}
                                placeholder="Brief description of coverage..."
                                value={policyForm.description}
                                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Coverage Scope */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Coverage Scope</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Cargo Types</label>
                            <div className="flex flex-wrap gap-2">
                                {CARGO_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleMultiSelect("cargoTypes", type)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                            policyForm.cargoTypes.includes(type)
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Transport Modes *</label>
                            <div className="flex flex-wrap gap-2">
                                {TRANSPORT_MODES.map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => toggleMultiSelect("transportModes", mode)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                            policyForm.transportModes.includes(mode)
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                        )}
                                    >
                                        {mode === "Sea" && <Anchor className="w-3.5 h-3.5" />}
                                        {mode === "Air" && <Plane className="w-3.5 h-3.5" />}
                                        {mode === "Road" && <Truck className="w-3.5 h-3.5" />}
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-700">Incoterms</label>
                                    <button
                                        onClick={() => setPolicyForm({ ...policyForm, incoterms: INCOTERMS })}
                                        className="text-xs font-semibold text-brand-green hover:text-brand-green/80"
                                    >
                                        Select All
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {INCOTERMS.map(inc => (
                                        <button
                                            key={inc}
                                            onClick={() => toggleMultiSelect("incoterms", inc)}
                                            className={cn(
                                                "py-2 rounded-lg text-xs font-semibold border transition-all",
                                                policyForm.incoterms.includes(inc)
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                            )}
                                        >
                                            {inc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Geographic Scope</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Worldwide", "Restricted"].map(scope => (
                                        <button
                                            key={scope}
                                            onClick={() => setPolicyForm({ ...policyForm, geoScope: scope })}
                                            className={cn(
                                                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all",
                                                policyForm.geoScope === scope
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                            )}
                                        >
                                            {scope === "Worldwide" && <Globe className="w-4 h-4" />}
                                            {scope}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sum Insured & Premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-700" />
                            <h3 className="text-base font-semibold text-gray-900">Sum Insured Rules</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Valuation Basis</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                    value={policyForm.valuationBasis}
                                    onChange={(e) => setPolicyForm({ ...policyForm, valuationBasis: e.target.value })}
                                >
                                    <option>CIF</option>
                                    <option>Invoice Value</option>
                                    <option>Custom Basis</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Sum Insured</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.minSumInsured}
                                        onChange={(e) => setPolicyForm({ ...policyForm, minSumInsured: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Sum Insured</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.maxSumInsured}
                                        onChange={(e) => setPolicyForm({ ...policyForm, maxSumInsured: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                    value={policyForm.currency}
                                    onChange={(e) => setPolicyForm({ ...policyForm, currency: e.target.value })}
                                >
                                    <option>USD</option>
                                    <option>TZS</option>
                                    <option>EUR</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border-2 border-brand-green/20 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-brand-green" />
                            <h3 className="text-base font-semibold text-gray-900">Premium & Rating</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Premium Rate (%) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green"
                                    value={policyForm.rate}
                                    onChange={(e) => setPolicyForm({ ...policyForm, rate: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Premium</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.minPremium}
                                        onChange={(e) => setPolicyForm({ ...policyForm, minPremium: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hazard Loading (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.hazardousLoading}
                                        onChange={(e) => setPolicyForm({ ...policyForm, hazardousLoading: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.discount}
                                        onChange={(e) => setPolicyForm({ ...policyForm, discount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">VAT (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.vat}
                                        onChange={(e) => setPolicyForm({ ...policyForm, vat: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Covers */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Additional Covers</h3>
                        <button
                            onClick={addAdditionalCover}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Cover
                        </button>
                    </div>
                    <div className="space-y-3">
                        {policyForm.additionalCovers.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-sm text-gray-500">No additional covers defined</p>
                            </div>
                        )}
                        {policyForm.additionalCovers.map((cover, idx) => (
                            <div key={idx} className="flex gap-3 items-end p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        placeholder="e.g., War Risk"
                                        value={cover.name}
                                        onChange={(e) => updateAdditionalCover(idx, "name", e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={cover.type}
                                        onChange={(e) => updateAdditionalCover(idx, "type", e.target.value)}
                                    >
                                        <option>Flat</option>
                                        <option>Percentage</option>
                                    </select>
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={cover.amount}
                                        onChange={(e) => updateAdditionalCover(idx, "amount", Number(e.target.value))}
                                    />
                                </div>
                                <button
                                    onClick={() => removeAdditionalCover(idx)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Validity & Controls */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-700" />
                        <h3 className="text-base font-semibold text-gray-900">Validity & Controls</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.startDate}
                                        onChange={(e) => setPolicyForm({ ...policyForm, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        value={policyForm.endDate}
                                        onChange={(e) => setPolicyForm({ ...policyForm, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Auto-generate Invoice", key: "autoInvoice" },
                                    { label: "Auto-issue After Payment", key: "autoIssue" },
                                    { label: "Requires Manual Approval", key: "manualApproval" }
                                ].map(toggle => (
                                    <div key={toggle.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
                                        <button
                                            onClick={() => setPolicyForm({ ...policyForm, [toggle.key]: !policyForm[toggle.key as keyof typeof policyForm] })}
                                            className={cn(
                                                "w-11 h-6 rounded-full transition-all relative",
                                                policyForm[toggle.key as keyof typeof policyForm] ? "bg-brand-green" : "bg-gray-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow",
                                                policyForm[toggle.key as keyof typeof policyForm] ? "left-6" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none h-full min-h-[180px]"
                                placeholder="Internal admin notes..."
                                value={policyForm.internalNotes}
                                onChange={(e) => setPolicyForm({ ...policyForm, internalNotes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="sticky top-20 space-y-6">
                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-green text-white text-base font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isEditing ? "Update Policy" : "Save Policy"}
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-300 text-base font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <XIcon className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>

                    {/* Premium Preview */}
                    <div className="bg-gray-900 rounded-lg p-6 text-white">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Premium Preview</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm opacity-60">
                                <span>Base (100k {policyForm.currency})</span>
                                <span>{calculatePreview.base.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Premium ({policyForm.rate}%)</span>
                                <span>+ {((calculatePreview.base * policyForm.rate) / 100).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-red-400">
                                <span>Discount ({policyForm.discount}%)</span>
                                <span>- {((calculatePreview.base * policyForm.rate * policyForm.discount) / 10000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-blue-400">
                                <span>VAT ({policyForm.vat}%)</span>
                                <span>+ {calculatePreview.vat.toLocaleString()}</span>
                            </div>
                            <div className="pt-3 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-gray-400 uppercase">Total</span>
                                    <span className="text-3xl font-semibold text-emerald-400">{calculatePreview.premium.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validation Warnings */}
                    <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Validation</h4>
                        </div>
                        <div className="space-y-2">
                            {policyForm.cargoTypes.includes("Hazardous") && policyForm.hazardousLoading <= 0 && (
                                <p className="text-xs text-amber-900">• Hazardous cargo without loading defined</p>
                            )}
                            {policyForm.geoScope === "Worldwide" && policyForm.rate < 0.2 && (
                                <p className="text-xs text-amber-900">• Worldwide coverage with low rate ({policyForm.rate}%)</p>
                            )}
                            {policyForm.maxSumInsured === 0 && (
                                <p className="text-xs text-amber-900">• No maximum sum insured defined</p>
                            )}
                            {!policyForm.name && (
                                <p className="text-xs text-amber-900">• Policy name is required</p>
                            )}
                            {!policyForm.code && (
                                <p className="text-xs text-amber-900">• Policy code is required</p>
                            )}
                            {policyForm.transportModes.length === 0 && (
                                <p className="text-xs text-amber-900">• At least one transport mode required</p>
                            )}
                            {policyForm.rate <= 0 && (
                                <p className="text-xs text-amber-900">• Premium rate must be greater than 0</p>
                            )}
                            {policyForm.name && policyForm.code && policyForm.transportModes.length > 0 && policyForm.rate > 0 && !policyForm.cargoTypes.includes("Hazardous") && policyForm.maxSumInsured > 0 && (
                                <p className="text-xs text-emerald-700 font-medium">✓ All required fields completed</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
