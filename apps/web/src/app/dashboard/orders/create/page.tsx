"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Package,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Ship,
    Plane,
    Truck,
    DollarSign,
    Globe,
    CheckCircle2,
    Shield,
    MapPin,
    Check,
    Info,
    Calendar,
    FileText,
    AlertCircle,
    Sparkles,
    X,
    Box,
    Anchor,
    ChevronRight,
    Building2,
    FileSignature,
    Warehouse,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { title: "Insurable Interest", icon: Building2, description: "Your relationship to cargo" },
    { title: "Cargo Details", icon: Package, description: "Describe your shipment" },
    { title: "Voyage Details", icon: Globe, description: "Origin, destination & transport" },
    { title: "Conveyance", icon: Ship, description: "Vessel & carrier details" },
    { title: "Insurance & Value", icon: Shield, description: "Coverage & valuation" },
    { title: "Additional Info", icon: ClipboardList, description: "Storage & claims history" },
    { title: "Declaration", icon: FileSignature, description: "Review & submit" },
];

const PROPOSER_CAPACITY = ["Owner", "Buyer", "Seller", "Agent", "Other"];
const INCOTERMS = ["CIF", "CFR", "FOB", "Other"];
const CARGO_NATURE_OPTIONS = ["General", "Fragile", "Perishable", "Hazardous", "Bulk"];
const PACKAGING_METHODS = ["Bags", "Cartons", "Pallets", "Containers", "Bulk", "Other"];
const TRANSPORT_MODES = ["Sea", "Air", "Road", "Rail", "Multimodal"];
const VALUATION_BASIS = ["CIF", "Invoice", "Other"];

export default function CreateOrderPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [policies, setPolicies] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        // A. Insurable Interest
        proposerCapacity: "",
        proposerCapacityOther: "",
        incoterm: "CIF",
        incotermOther: "",

        // B. Description of Goods
        cargoNature: "",
        packagingMethod: "",
        packagingMethodOther: "",
        totalWeight: "",
        weightUnit: "KG",
        cargoDescription: "",

        // C. Voyage Details
        originCountry: "",
        originPort: "",
        destinationCountry: "",
        destinationPort: "",
        transportMode: "Sea",
        dispatchDate: "",
        transShipment: false,
        transShipmentNote: "",

        // D. Conveyance Details
        vesselName: "",
        carrierName: "",

        // E. Sum Insured
        invoiceValue: "",
        currency: "TZS",
        valuationBasis: "Invoice",
        valuationBasisOther: "",
        sumInsured: "",

        // F. Insurance Cover Required
        policyId: "",
        coverType: "ICC(A)",
        additionalCovers: "",

        // G. Storage Details
        storageRequired: false,
        storageLocation: "",
        storageDuration: "",

        // H. Claims History
        claimsHistory: false,
        claimsDetails: "",

        // I. Declaration
        proposerName: "",
        acceptTerms: false,
        declarationDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        fetch("/api/policies")
            .then((res) => res.json())
            .then((data) => setPolicies(data))
            .catch((err) => console.error("Failed to fetch policies:", err));
    }, []);

    const selectedPolicy = useMemo(() => {
        return policies.find(p => p.id === formData.policyId);
    }, [policies, formData.policyId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 0: // Insurable Interest
                const capacityValid = formData.proposerCapacity !== "" &&
                    (formData.proposerCapacity !== "Other" || formData.proposerCapacityOther !== "");
                const incotermValid = formData.incoterm !== "" &&
                    (formData.incoterm !== "Other" || formData.incotermOther !== "");
                return capacityValid && incotermValid;

            case 1: // Cargo Details
                return formData.cargoNature !== "" &&
                    formData.packagingMethod !== "" &&
                    (formData.packagingMethod !== "Other" || formData.packagingMethodOther !== "") &&
                    formData.totalWeight !== "" &&
                    formData.cargoDescription !== "";

            case 2: // Voyage Details
                return formData.originCountry !== "" &&
                    formData.originPort !== "" &&
                    formData.destinationCountry !== "" &&
                    formData.destinationPort !== "" &&
                    formData.transportMode !== "" &&
                    formData.dispatchDate !== "" &&
                    (!formData.transShipment || formData.transShipmentNote !== "");

            case 3: // Conveyance Details
                // Optional fields, always valid
                return true;

            case 4: // Insurance & Value
                return formData.invoiceValue !== "" &&
                    formData.valuationBasis !== "" &&
                    (formData.valuationBasis !== "Other" || formData.valuationBasisOther !== "") &&
                    formData.sumInsured !== "" &&
                    formData.policyId !== "";

            case 5: // Additional Info
                return (!formData.storageRequired || (formData.storageLocation !== "" && formData.storageDuration !== "")) &&
                    (!formData.claimsHistory || formData.claimsDetails !== "");

            case 6: // Declaration
                return formData.proposerName !== "" &&
                    formData.acceptTerms;

            default:
                return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep !== STEPS.length - 1) return;

        setLoading(true);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    totalWeight: `${formData.totalWeight} ${formData.weightUnit}`,
                    invoiceValue: parseFloat(formData.invoiceValue),
                    sumInsured: parseFloat(formData.sumInsured),
                }),
            });

            if (res.ok) {
                router.push(`/dashboard/orders`);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to create order");
            }
        } catch (error) {
            console.error("Create order error:", error);
            alert("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Mobile Optimized */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                                    Insurance Proposal Form
                                </h1>
                                <p className="text-xs text-gray-500">
                                    Step {currentStep + 1} of {STEPS.length}
                                </p>
                            </div>
                        </div>
                        {/* Progress indicator on mobile */}
                        <div className="flex-shrink-0 lg:hidden">
                            <div className="text-xs font-medium text-brand-green">
                                {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Responsive Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                    {/* Left Sidebar - Desktop Only, Horizontal on Mobile */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        {/* Desktop Progress Steps */}
                        <div className="hidden lg:block lg:sticky lg:top-24">
                            <h3 className="text-sm font-semibold text-gray-900 mb-6">Progress</h3>
                            <div className="space-y-1">
                                {STEPS.map((step, index) => {
                                    const isCompleted = index < currentStep;
                                    const isCurrent = index === currentStep;
                                    const StepIcon = step.icon;

                                    return (
                                        <div key={index}>
                                            <div className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg transition-all",
                                                isCurrent ? "bg-brand-green/5" : "hover:bg-gray-50"
                                            )}>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                                                    isCompleted
                                                        ? "bg-brand-green text-white"
                                                        : isCurrent
                                                            ? "bg-brand-green text-white"
                                                            : "bg-gray-100 text-gray-400"
                                                )}>
                                                    {isCompleted ? (
                                                        <Check className="w-4 h-4" strokeWidth={2.5} />
                                                    ) : (
                                                        <StepIcon className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        isCurrent ? "text-brand-green" : isCompleted ? "text-gray-900" : "text-gray-400"
                                                    )}>
                                                        {step.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                                                </div>
                                            </div>
                                            {index < STEPS.length - 1 && (
                                                <div className="ml-7 h-8 w-0.5 bg-gray-200">
                                                    <div className={cn(
                                                        "h-full w-full transition-all",
                                                        index < currentStep ? "bg-brand-green" : "bg-transparent"
                                                    )} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Progress Bar */}
                        <div className="lg:hidden bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-900">
                                    {STEPS[currentStep].title}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {currentStep + 1}/{STEPS.length}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-green transition-all duration-300 ease-out"
                                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{STEPS[currentStep].description}</p>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                            <form onSubmit={handleSubmit}>
                                {/* Step 0: Insurable Interest */}
                                {currentStep === 0 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Insurable Interest
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Define your relationship to the cargo
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Capacity of Proposer */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Capacity of Proposer <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                                                    {PROPOSER_CAPACITY.map((capacity) => (
                                                        <button
                                                            key={capacity}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                proposerCapacity: capacity,
                                                                proposerCapacityOther: capacity !== "Other" ? "" : prev.proposerCapacityOther
                                                            }))}
                                                            className={cn(
                                                                "relative px-3 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm font-medium",
                                                                formData.proposerCapacity === capacity
                                                                    ? "border-brand-green bg-brand-green/5 text-brand-green"
                                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                                            )}
                                                        >
                                                            {capacity}
                                                            {formData.proposerCapacity === capacity && (
                                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                {formData.proposerCapacity === "Other" && (
                                                    <input
                                                        type="text"
                                                        name="proposerCapacityOther"
                                                        value={formData.proposerCapacityOther}
                                                        onChange={handleChange}
                                                        placeholder="Specify capacity"
                                                        className="mt-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                )}
                                            </div>

                                            {/* Basis of Sales (Incoterms) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Basis of Sales (Incoterms) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                    {INCOTERMS.map((term) => (
                                                        <button
                                                            key={term}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                incoterm: term,
                                                                incotermOther: term !== "Other" ? "" : prev.incotermOther
                                                            }))}
                                                            className={cn(
                                                                "relative px-3 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm font-medium",
                                                                formData.incoterm === term
                                                                    ? "border-brand-green bg-brand-green/5 text-brand-green"
                                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                                            )}
                                                        >
                                                            {term}
                                                            {formData.incoterm === term && (
                                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                {formData.incoterm === "Other" && (
                                                    <input
                                                        type="text"
                                                        name="incotermOther"
                                                        value={formData.incotermOther}
                                                        onChange={handleChange}
                                                        placeholder="Specify Incoterm"
                                                        className="mt-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Description of Goods */}
                                {currentStep === 1 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Description of Goods
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Tell us about your cargo
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Nature of Cargo */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nature of Cargo <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                                                    {CARGO_NATURE_OPTIONS.map((nature) => (
                                                        <button
                                                            key={nature}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, cargoNature: nature }))}
                                                            className={cn(
                                                                "relative px-3 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm font-medium",
                                                                formData.cargoNature === nature
                                                                    ? "border-brand-green bg-brand-green/5 text-brand-green"
                                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                                            )}
                                                        >
                                                            {nature}
                                                            {formData.cargoNature === nature && (
                                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Packaging Method */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Packaging Method <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                    {PACKAGING_METHODS.map((method) => (
                                                        <button
                                                            key={method}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                packagingMethod: method,
                                                                packagingMethodOther: method !== "Other" ? "" : prev.packagingMethodOther
                                                            }))}
                                                            className={cn(
                                                                "relative px-3 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm font-medium",
                                                                formData.packagingMethod === method
                                                                    ? "border-brand-green bg-brand-green/5 text-brand-green"
                                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                                            )}
                                                        >
                                                            {method}
                                                            {formData.packagingMethod === method && (
                                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                {formData.packagingMethod === "Other" && (
                                                    <input
                                                        type="text"
                                                        name="packagingMethodOther"
                                                        value={formData.packagingMethodOther}
                                                        onChange={handleChange}
                                                        placeholder="Specify packaging method"
                                                        className="mt-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                )}
                                            </div>

                                            {/* Total Weight/Quantity */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Total Weight/Quantity <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-2 sm:gap-3">
                                                    <input
                                                        type="number"
                                                        name="totalWeight"
                                                        value={formData.totalWeight}
                                                        onChange={handleChange}
                                                        required
                                                        step="0.01"
                                                        placeholder="2500"
                                                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                    <select
                                                        name="weightUnit"
                                                        value={formData.weightUnit}
                                                        onChange={handleChange}
                                                        className="w-20 sm:w-24 px-2 sm:px-3 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900 font-medium text-sm"
                                                    >
                                                        <option value="KG">KG</option>
                                                        <option value="MT">MT</option>
                                                        <option value="LBS">LBS</option>
                                                        <option value="CBM">CBM</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Description of Cargo */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description of Cargo <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    name="cargoDescription"
                                                    value={formData.cargoDescription}
                                                    onChange={handleChange}
                                                    required
                                                    rows={4}
                                                    placeholder="Provide a detailed description of your cargo including any special handling requirements..."
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900 placeholder:text-gray-400 resize-none text-sm sm:text-base"
                                                />
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 order-1 sm:order-2"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Voyage Details */}
                                {currentStep === 2 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Voyage Details
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Shipping route and transport information
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Origin */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Country of Origin <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="originCountry"
                                                        value={formData.originCountry}
                                                        onChange={handleChange}
                                                        placeholder="e.g., China"
                                                        required
                                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Port of Origin <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            name="originPort"
                                                            value={formData.originPort}
                                                            onChange={handleChange}
                                                            placeholder="e.g., Shanghai Port"
                                                            required
                                                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Destination */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Country of Destination <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="destinationCountry"
                                                        value={formData.destinationCountry}
                                                        onChange={handleChange}
                                                        placeholder="e.g., Tanzania"
                                                        required
                                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Port of Destination <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            name="destinationPort"
                                                            value={formData.destinationPort}
                                                            onChange={handleChange}
                                                            placeholder="e.g., Dar es Salaam Port"
                                                            required
                                                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mode of Transport */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Mode of Transport <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                                                    {TRANSPORT_MODES.map((mode) => {
                                                        const icons: Record<string, any> = {
                                                            Sea: Ship,
                                                            Air: Plane,
                                                            Road: Truck,
                                                            Rail: Package,
                                                            Multimodal: Globe
                                                        };
                                                        const Icon = icons[mode];

                                                        return (
                                                            <button
                                                                key={mode}
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, transportMode: mode }))}
                                                                className={cn(
                                                                    "relative p-3 sm:p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 text-center",
                                                                    formData.transportMode === mode
                                                                        ? "border-brand-green bg-brand-green/5"
                                                                        : "border-gray-200 bg-white hover:border-gray-300"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
                                                                    formData.transportMode === mode
                                                                        ? "bg-brand-green text-white"
                                                                        : "bg-gray-100 text-gray-600"
                                                                )}>
                                                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                                </div>
                                                                <span className={cn(
                                                                    "text-xs sm:text-sm font-medium",
                                                                    formData.transportMode === mode ? "text-brand-green" : "text-gray-700"
                                                                )}>
                                                                    {mode}
                                                                </span>
                                                                {formData.transportMode === mode && (
                                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Expected Date of Dispatch */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expected Date of Dispatch <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        name="dispatchDate"
                                                        value={formData.dispatchDate}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            {/* Trans-Shipment */}
                                            <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id="transShipment"
                                                        name="transShipment"
                                                        checked={formData.transShipment}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            transShipment: e.target.checked,
                                                            transShipmentNote: e.target.checked ? prev.transShipmentNote : ""
                                                        }))}
                                                        className="mt-1 w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green focus:ring-2"
                                                    />
                                                    <label htmlFor="transShipment" className="flex-1 text-sm text-gray-700 cursor-pointer">
                                                        <span className="font-semibold text-gray-900">Trans-Shipment Involved?</span>
                                                        <p className="text-xs text-gray-500 mt-1">Check if cargo will be transferred between vessels/vehicles</p>
                                                    </label>
                                                </div>
                                                {formData.transShipment && (
                                                    <div className="mt-4">
                                                        <input
                                                            type="text"
                                                            name="transShipmentNote"
                                                            value={formData.transShipmentNote}
                                                            onChange={handleChange}
                                                            placeholder="Specify trans-shipment details (location, vessel, etc.)"
                                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900 text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 order-1 sm:order-2"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Conveyance Details */}
                                {currentStep === 3 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Conveyance Details
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Vessel, flight, or vehicle information
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Info Notice */}
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex gap-3">
                                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-blue-900 font-medium">
                                                            Optional Information
                                                        </p>
                                                        <p className="text-sm text-blue-700 mt-1">
                                                            Provide vessel/carrier details if known. This can be updated later.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vessel/Flight/Truck Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {formData.transportMode === "Sea" ? "Name of Vessel" :
                                                        formData.transportMode === "Air" ? "Flight Number" :
                                                            formData.transportMode === "Road" ? "Truck/Vehicle ID" :
                                                                "Conveyance Name"}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vesselName"
                                                    value={formData.vesselName}
                                                    onChange={handleChange}
                                                    placeholder={
                                                        formData.transportMode === "Sea" ? "e.g., MSC APOLLINE" :
                                                            formData.transportMode === "Air" ? "e.g., ET302" :
                                                                formData.transportMode === "Road" ? "e.g., TZ-1234-ABC" :
                                                                    "Enter if known"
                                                    }
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                />
                                            </div>

                                            {/* Shipping Line/Carrier Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {formData.transportMode === "Sea" ? "Shipping Line Name" :
                                                        formData.transportMode === "Air" ? "Airline Name" :
                                                            "Carrier Name"}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="carrierName"
                                                    value={formData.carrierName}
                                                    onChange={handleChange}
                                                    placeholder={
                                                        formData.transportMode === "Sea" ? "e.g., Maersk Line" :
                                                            formData.transportMode === "Air" ? "e.g., Ethiopian Airlines" :
                                                                "e.g., DHL, FedEx"
                                                    }
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 order-1 sm:order-2"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Sum Insured & Insurance Cover */}
                                {currentStep === 4 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Insurance & Valuation
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Set cargo value and select coverage type
                                            </p>
                                        </div>

                                        <div className="space-y-8">
                                            {/* E. Sum Insured Section */}
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                                                    Sum Insured
                                                </h3>
                                                <div className="space-y-4 sm:space-y-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Invoice Value <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                                <input
                                                                    type="number"
                                                                    name="invoiceValue"
                                                                    value={formData.invoiceValue}
                                                                    onChange={handleChange}
                                                                    required
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Currency <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="currency"
                                                                value={formData.currency}
                                                                onChange={handleChange}
                                                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                            >
                                                                <option value="TZS">TZS - Tanzanian Shilling</option>
                                                                <option value="USD">USD - US Dollar</option>
                                                                <option value="EUR">EUR - Euro</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Basis of Valuation <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {VALUATION_BASIS.map((basis) => (
                                                                        <button
                                                                            key={basis}
                                                                            type="button"
                                                                            onClick={() => setFormData(prev => ({
                                                                                ...prev,
                                                                                valuationBasis: basis,
                                                                                valuationBasisOther: basis !== "Other" ? "" : prev.valuationBasisOther
                                                                            }))}
                                                                            className={cn(
                                                                                "relative px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium",
                                                                                formData.valuationBasis === basis
                                                                                    ? "border-brand-green bg-brand-green/5 text-brand-green"
                                                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                                                            )}
                                                                        >
                                                                            {basis}
                                                                            {formData.valuationBasis === basis && (
                                                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                                                                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {formData.valuationBasis === "Other" && (
                                                                    <input
                                                                        type="text"
                                                                        name="valuationBasisOther"
                                                                        value={formData.valuationBasisOther}
                                                                        onChange={handleChange}
                                                                        placeholder="Specify basis"
                                                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Total Sum Insured <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
                                                                    {formData.currency}
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    name="sumInsured"
                                                                    value={formData.sumInsured}
                                                                    onChange={handleChange}
                                                                    required
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    className="w-full pl-14 sm:pl-16 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                                                                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                                                Typically 110% of invoice value
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* F. Insurance Cover Required */}
                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                                                    Insurance Cover Required
                                                </h3>
                                                <div className="space-y-6">
                                                    {/* Type of Cover */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                                            Select Insurance Policy <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                            {policies.map((policy) => (
                                                                <button
                                                                    key={policy.id}
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({
                                                                        ...prev,
                                                                        policyId: policy.id,
                                                                        coverType: policy.clauseType // Keep for display/logic if needed, or remove if redundant
                                                                    }))}
                                                                    className={cn(
                                                                        "relative p-4 sm:p-5 rounded-lg border-2 transition-all text-left h-full flex flex-col",
                                                                        formData.policyId === policy.id
                                                                            ? "border-brand-green bg-brand-green/5"
                                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start gap-3 sm:gap-4 mb-2">
                                                                        <div className={cn(
                                                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                                                                            formData.policyId === policy.id
                                                                                ? "bg-brand-green text-white"
                                                                                : "bg-gray-100 text-gray-500"
                                                                        )}>
                                                                            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className={cn(
                                                                                "text-sm sm:text-base font-semibold mb-1",
                                                                                formData.policyId === policy.id ? "text-brand-green" : "text-gray-900"
                                                                            )}>
                                                                                {policy.name}
                                                                            </h4>
                                                                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                                                                {policy.clauseType}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <p className="text-xs text-gray-600 line-clamp-3 mt-auto">
                                                                        {policy.description}
                                                                    </p>

                                                                    {formData.policyId === policy.id && (
                                                                        <div className="absolute top-3 right-3 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                                                                            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Additional Covers */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Additional Covers
                                                        </label>
                                                        <textarea
                                                            name="additionalCovers"
                                                            value={formData.additionalCovers}
                                                            onChange={handleChange}
                                                            rows={3}
                                                            placeholder="e.g., War risks, Strikes, Riots, Civil Commotions (SRCC), Theft, Pilferage & Non-Delivery (TPND)..."
                                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900 placeholder:text-gray-400 resize-none text-sm sm:text-base"
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">Optional: Specify any additional coverage requirements</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 order-1 sm:order-2"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Storage & Claims History */}
                                {currentStep === 5 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Additional Information
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Storage requirements and claims history
                                            </p>
                                        </div>

                                        <div className="space-y-8">
                                            {/* G. Storage Details */}
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                                                    Storage Details
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                id="storageRequired"
                                                                name="storageRequired"
                                                                checked={formData.storageRequired}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    storageRequired: e.target.checked,
                                                                    storageLocation: e.target.checked ? prev.storageLocation : "",
                                                                    storageDuration: e.target.checked ? prev.storageDuration : ""
                                                                }))}
                                                                className="mt-1 w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green focus:ring-2"
                                                            />
                                                            <label htmlFor="storageRequired" className="flex-1 text-sm text-gray-700 cursor-pointer">
                                                                <span className="font-semibold text-gray-900">Storage Before/After Transit?</span>
                                                                <p className="text-xs text-gray-500 mt-1">Check if cargo will be stored in a warehouse</p>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {formData.storageRequired && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pl-0 sm:pl-8">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Storage Location <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <Warehouse className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                                    <input
                                                                        type="text"
                                                                        name="storageLocation"
                                                                        value={formData.storageLocation}
                                                                        onChange={handleChange}
                                                                        placeholder="e.g., Dar es Salaam Port Warehouse"
                                                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Storage Duration <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="storageDuration"
                                                                    value={formData.storageDuration}
                                                                    onChange={handleChange}
                                                                    placeholder="e.g., 14 days, 2 weeks"
                                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* H. Claims History */}
                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                                                    Claims History
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="bg-amber-50 rounded-lg p-4 sm:p-5 border border-amber-200">
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                id="claimsHistory"
                                                                name="claimsHistory"
                                                                checked={formData.claimsHistory}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    claimsHistory: e.target.checked,
                                                                    claimsDetails: e.target.checked ? prev.claimsDetails : ""
                                                                }))}
                                                                className="mt-1 w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green focus:ring-2"
                                                            />
                                                            <label htmlFor="claimsHistory" className="flex-1 text-sm text-gray-700 cursor-pointer">
                                                                <span className="font-semibold text-gray-900">Any Marine Cargo Claims in the Past 5 Years?</span>
                                                                <p className="text-xs text-gray-600 mt-1">Check if you have filed any previous claims</p>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {formData.claimsHistory && (
                                                        <div className="pl-0 sm:pl-8">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Claims Details <span className="text-red-500">*</span>
                                                            </label>
                                                            <textarea
                                                                name="claimsDetails"
                                                                value={formData.claimsDetails}
                                                                onChange={handleChange}
                                                                rows={4}
                                                                placeholder="Please provide details: date, nature of loss, claim amount, and outcome..."
                                                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900 placeholder:text-gray-400 resize-none text-sm sm:text-base"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 order-1 sm:order-2"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Declaration */}
                                {currentStep === 6 && (
                                    <div>
                                        <div className="mb-6 sm:mb-8">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                                Declaration
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Review and confirm your proposal
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Summary Card */}
                                            <div className="bg-gradient-to-br from-brand-green/5 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-brand-green/20">
                                                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                            Ready to Submit
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                                            Please review your information and confirm
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600 text-xs">Cargo</p>
                                                        <p className="font-medium text-gray-900">{formData.cargoNature || "—"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 text-xs">Route</p>
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {formData.originPort} → {formData.destinationPort}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 text-xs">Value</p>
                                                        <p className="font-medium text-gray-900">
                                                            {formData.currency} {parseFloat(formData.invoiceValue || "0").toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 text-xs">Cover Type</p>
                                                        <p className="font-medium text-gray-900">{formData.coverType}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Proposer Details */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Name of Proposer <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="proposerName"
                                                    value={formData.proposerName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Full name or company name"
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-gray-900"
                                                />
                                            </div>

                                            {/* Date (auto-filled) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Declaration Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        name="declarationDate"
                                                        value={formData.declarationDate}
                                                        onChange={handleChange}
                                                        disabled
                                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            {/* Declaration Statement */}
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id="acceptTerms"
                                                        name="acceptTerms"
                                                        checked={formData.acceptTerms}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                                        className="mt-1 w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green focus:ring-2"
                                                    />
                                                    <label htmlFor="acceptTerms" className="flex-1 text-sm text-gray-700 cursor-pointer">
                                                        <span className="font-semibold text-gray-900">
                                                            I/We declare that the information given is true and complete.
                                                        </span>
                                                        {" "}I understand that providing false or misleading information may result in claim rejection or policy cancellation. This declaration forms the basis of the insurance contract.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !validateCurrentStep()}
                                                className="px-6 sm:px-8 py-3 bg-brand-green text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Proposal
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}