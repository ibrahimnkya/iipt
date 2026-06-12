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
    Wallet,
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
    ChevronRight,
    Building2,
    FileSignature,
    Warehouse,
    ClipboardList,
    User,
    ShoppingCart,
    Users,
    HelpCircle,
    AlertTriangle,
    Anchor,
    Box,
    FileCode,
    Receipt,
    Percent,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import DocumentUploadStep, { ExtractedData } from "./DocumentUploadStep";

// Steps configuration
const STEPS = [
    { title: "Upload Document", icon: FileText, description: "Auto-fill from invoice or B/L" },
    { title: "Insurable Interest", icon: Building2, description: "Your relationship to cargo" },
    { title: "Cargo Details", icon: Package, description: "Describe your shipment" },
    { title: "Voyage Details", icon: Globe, description: "Origin, destination & transport" },
    { title: "Conveyance", icon: Ship, description: "Vessel & carrier details" },
    { title: "Insurance & Value", icon: Shield, description: "Coverage & valuation" },
    { title: "Additional Info", icon: ClipboardList, description: "Storage & claims history" },
    { title: "Declaration", icon: FileSignature, description: "Review & submit" },
];

const PROPOSER_CAPACITY = [
    { name: "Owner", icon: User, desc: "Legal owner of the goods" },
    { name: "Buyer", icon: ShoppingCart, desc: "Purchasing party of shipment" },
    { name: "Seller", icon: Building2, desc: "Supplier or exporting party" },
    { name: "Agent", icon: Users, desc: "Authorized clearing/trade representative" },
    { name: "Other", icon: HelpCircle, desc: "Other custom capacity roles" }
];

const INCOTERMS = [
    { name: "CIF", desc: "Cost, Insurance & Freight (Seller handles freight, you cover insurance)" },
    { name: "CFR", desc: "Cost & Freight (Seller handles freight, no cargo cover)" },
    { name: "FOB", desc: "Free On Board (Seller covers until loaded on vessel)" },
    { name: "Other", desc: "Other custom international trade arrangements" }
];

const CARGO_NATURE_OPTIONS = [
    { name: "General", icon: Box, desc: "Dry standard cargo (clothing, equipment)" },
    { name: "Fragile", icon: AlertTriangle, desc: "Glass, electronics, ceramics (high care)" },
    { name: "Perishable", icon: Calendar, desc: "Foods, pharmaceuticals (temp-sensitive)" },
    { name: "Hazardous", icon: AlertCircle, desc: "Chemicals, gas, batteries (regulated)" },
    { name: "Bulk", icon: Anchor, desc: "Loose grains, ore, liquids (unpackaged)" }
];

const PACKAGING_METHODS = [
    { name: "Bags", icon: Box, desc: "Sacks, fabric, or paper bags" },
    { name: "Cartons", icon: Box, desc: "Cardboard boxes or cases" },
    { name: "Pallets", icon: Warehouse, desc: "Stacked crates on wooden/plastic grids" },
    { name: "Containers", icon: Ship, desc: "Standardized shipping container loads" },
    { name: "Bulk", icon: Anchor, desc: "Loose bulk load cargo" },
    { name: "Other", icon: HelpCircle, desc: "Other custom packaging types" }
];

const VALUATION_BASIS = [
    { name: "CIF", desc: "Cost, Insurance & Freight (Invoice + 10% standard)" },
    { name: "Invoice", desc: "Base cargo invoice value only" },
    { name: "Other", desc: "Other custom valuation agreements" }
];

// Defined missing constant to resolve ReferenceError
const TRANSPORT_MODES = ["Sea", "Air", "Road", "Rail", "Multimodal"];

export default function CreateOrderPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [aiPrefilledFields, setAiPrefilledFields] = useState<string[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedData, setSubmittedData] = useState<{
        orderId: string;
        invoiceNumber?: string;
        sumInsured?: number;
        totalPremium?: number;
        currency?: string;
        insurerName?: string;
    } | null>(null);
    const [policies, setPolicies] = useState<any[]>([]);
    const [insurers, setInsurers] = useState<any[]>([]);
    const [selectedInsurerId, setSelectedInsurerId] = useState<string>("");
    const [countries, setCountries] = useState<any[]>([]);
    const [ports, setPorts] = useState<any[]>([]);
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
        declarationDate: typeof window !== "undefined" ? new Date().toISOString().split('T')[0] : "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        // Fetch policies
        fetch("/api/policies")
            .then((res) => res.json())
            .then((data) => setPolicies(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Failed to fetch policies:", err);
                setPolicies([]);
            });

        // Fetch insurers
        fetch("/api/insurers?status=APPROVED")
            .then((res) => res.json())
            .then((data) => setInsurers(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Failed to fetch insurers:", err);
                setInsurers([]);
            });

        // Fetch countries
        fetch("/api/countries")
            .then((res) => res.json())
            .then((data) => setCountries(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Failed to fetch countries:", err);
                setCountries([]);
            });

        // Fetch ports
        fetch("/api/ports")
            .then((res) => res.json())
            .then((data) => setPorts(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Failed to fetch ports:", err);
                setPorts([]);
            });
    }, []);

    // Prefill form from Rate Simulator query params
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const cargoVal = params.get("value");
            const mode = params.get("mode");

            if (cargoVal || mode) {
                setFormData(prev => ({
                    ...prev,
                    ...(cargoVal ? { invoiceValue: cargoVal } : {}),
                    ...(mode ? { transportMode: mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase() } : {})
                }));
            }
        }
    }, []);

    // Auto-calculate Sum Insured based on Policy & Invoice Value
    useEffect(() => {
        if (!formData.invoiceValue || !formData.policyId) return;

        const policy = Array.isArray(policies) ? policies.find(p => p.id === formData.policyId) : null;
        if (!policy) return;

        const val = parseFloat(formData.invoiceValue);
        if (isNaN(val)) return;

        let calculatedSum = val;
        const basis = formData.valuationBasis;
        if (basis === "CIF") {
            calculatedSum = val * 1.1; // 110%
        } else {
            calculatedSum = val;
        }

        setFormData(prev => ({
            ...prev,
            sumInsured: calculatedSum.toFixed(2)
        }));

    }, [formData.invoiceValue, formData.valuationBasis, formData.policyId, policies]);

    const activePolicy = useMemo(() => {
        return Array.isArray(policies) ? policies.find(p => p.id === formData.policyId) : undefined;
    }, [formData.policyId, policies]);

    const activeInsurer = useMemo(() => {
        return Array.isArray(insurers) ? insurers.find(i => i.id === selectedInsurerId) : undefined;
    }, [selectedInsurerId, insurers]);

    // Live billing calculator for side panel preview
    const liveEstimate = useMemo(() => {
        const val = parseFloat(formData.invoiceValue);
        if (isNaN(val) || val <= 0) return null;

        let calculatedSum = val;
        if (formData.valuationBasis === "CIF") {
            calculatedSum = val * 1.1;
        }

        let rate = 1.5; // default Sea premium rate
        if (activePolicy && typeof activePolicy.rate === "number") {
            rate = activePolicy.rate;
        } else {
            const mode = formData.transportMode.toLowerCase();
            if (mode === "sea") rate = 1.5;
            else if (mode === "air") rate = 2.2;
            else if (mode === "road") rate = 1.8;
            else if (mode === "rail") rate = 1.6;
            else if (mode === "multimodal") rate = 2.0;
        }

        let basePremium = (calculatedSum * rate) / 100;
        if (activePolicy && typeof activePolicy.minPremium === "number" && basePremium < activePolicy.minPremium) {
            basePremium = activePolicy.minPremium;
        }

        const vatRate = activePolicy && typeof activePolicy.vat === "number" ? activePolicy.vat : 18;
        const vat = (basePremium * vatRate) / 100;
        const stampDuty = 2000; // Flat stamp duty/fee
        const regulatoryLevy = basePremium * 0.005; // 0.5%
        const total = basePremium + vat + stampDuty + regulatoryLevy;

        return {
            sumInsured: calculatedSum,
            rate,
            basePremium,
            vat,
            stampDuty,
            regulatoryLevy,
            total
        };
    }, [formData.invoiceValue, formData.valuationBasis, formData.transportMode, activePolicy]);

    const filteredOriginPorts = useMemo(() => {
        if (!formData.originCountry || !Array.isArray(ports)) return [];
        const isKenya = formData.originCountry.toLowerCase().includes("kenya");
        const code = isKenya ? "KE" : "TZ";
        return ports.filter(p => p.country === code);
    }, [ports, formData.originCountry]);

    const filteredDestPorts = useMemo(() => {
        if (!formData.destinationCountry || !Array.isArray(ports)) return [];
        const isKenya = formData.destinationCountry.toLowerCase().includes("kenya");
        const code = isKenya ? "KE" : "TZ";
        return ports.filter(p => p.country === code);
    }, [ports, formData.destinationCountry]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (name === "policyId") {
            const policy = Array.isArray(policies) ? policies.find(p => p.id === value) : null;
            if (policy) {
                setFormData(prev => ({
                    ...prev,
                    policyId: value,
                    valuationBasis: policy.valuationBasis || "Invoice"
                }));
                return;
            }
        }

        if (name === "originCountry") {
            setFormData(prev => ({
                ...prev,
                originCountry: value,
                originPort: ""
            }));
            return;
        }

        if (name === "destinationCountry") {
            setFormData(prev => ({
                ...prev,
                destinationCountry: value,
                destinationPort: ""
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleExtracted = (data: ExtractedData) => {
        const updatedFields: string[] = [];
        const newFormData = { ...formData };

        if (data.incoterm) {
            newFormData.incoterm = data.incoterm;
            updatedFields.push("incoterm");
        }
        if (data.cargoDescription) {
            newFormData.cargoDescription = data.cargoDescription;
            updatedFields.push("cargoDescription");
        }
        if (data.cargoNature) {
            newFormData.cargoNature = data.cargoNature;
            updatedFields.push("cargoNature");
        }
        if (data.packagingMethod) {
            newFormData.packagingMethod = data.packagingMethod;
            updatedFields.push("packagingMethod");
        }
        if (data.totalWeight) {
            newFormData.totalWeight = data.totalWeight;
            updatedFields.push("totalWeight");
        }
        if (data.weightUnit) {
            newFormData.weightUnit = data.weightUnit;
            updatedFields.push("weightUnit");
        }
        if (data.originCountry) {
            newFormData.originCountry = data.originCountry;
            updatedFields.push("originCountry");
        }
        if (data.originPort) {
            newFormData.originPort = data.originPort;
            updatedFields.push("originPort");
        }
        if (data.destinationCountry) {
            newFormData.destinationCountry = data.destinationCountry;
            updatedFields.push("destinationCountry");
        }
        if (data.destinationPort) {
            newFormData.destinationPort = data.destinationPort;
            updatedFields.push("destinationPort");
        }
        if (data.transportMode) {
            newFormData.transportMode = data.transportMode;
            updatedFields.push("transportMode");
        }
        if (data.dispatchDate) {
            newFormData.dispatchDate = data.dispatchDate;
            updatedFields.push("dispatchDate");
        }
        if (data.vesselName) {
            newFormData.vesselName = data.vesselName;
            updatedFields.push("vesselName");
        }
        if (data.carrierName) {
            newFormData.carrierName = data.carrierName;
            updatedFields.push("carrierName");
        }
        if (data.invoiceValue) {
            newFormData.invoiceValue = data.invoiceValue;
            updatedFields.push("invoiceValue");
        }
        if (data.currency) {
            newFormData.currency = data.currency;
            updatedFields.push("currency");
        }

        setFormData(newFormData);
        setAiPrefilledFields(updatedFields);
        toast.success("Document data applied!", {
            description: `Auto-filled ${updatedFields.length} fields. Please review them.`,
            duration: 4000,
        });

        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSkipUpload = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
            case 0: // Upload Document
                return true;

            case 1: // Insurable Interest
                const capacityValid = formData.proposerCapacity !== "" &&
                    (formData.proposerCapacity !== "Other" || formData.proposerCapacityOther !== "");
                const incotermValid = formData.incoterm !== "" &&
                    (formData.incoterm !== "Other" || formData.incotermOther !== "");
                return capacityValid && incotermValid;

            case 2: // Cargo Details
                return formData.cargoNature !== "" &&
                    formData.packagingMethod !== "" &&
                    (formData.packagingMethod !== "Other" || formData.packagingMethodOther !== "") &&
                    formData.totalWeight !== "" &&
                    formData.cargoDescription !== "";

            case 3: // Voyage Details
                return formData.originCountry !== "" &&
                    formData.originPort !== "" &&
                    formData.destinationCountry !== "" &&
                    formData.destinationPort !== "" &&
                    formData.transportMode !== "" &&
                    formData.dispatchDate !== "" &&
                    (!formData.transShipment || formData.transShipmentNote !== "");

            case 4: // Conveyance Details
                return true;

            case 5: // Insurance & Value
                return formData.invoiceValue !== "" &&
                    formData.valuationBasis !== "" &&
                    (formData.valuationBasis !== "Other" || formData.valuationBasisOther !== "") &&
                    formData.sumInsured !== "" &&
                    selectedInsurerId !== "" &&
                    formData.policyId !== "";

            case 6: // Additional Info
                return (!formData.storageRequired || (formData.storageLocation !== "" && formData.storageDuration !== "")) &&
                    (!formData.claimsHistory || formData.claimsDetails !== "");

            case 7: // Declaration
                return formData.proposerName !== "" && formData.acceptTerms;

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
                    insurerCompanyId: selectedInsurerId,
                    totalWeight: `${formData.totalWeight} ${formData.weightUnit}`,
                    invoiceValue: parseFloat(formData.invoiceValue),
                    sumInsured: parseFloat(formData.sumInsured),
                }),
            });

            if (res.ok) {
                const result = await res.json();
                
                // Store the response data for our premium modal
                setSubmittedData({
                    orderId: result.order?.id || "N/A",
                    invoiceNumber: result.invoice?.invoiceNumber || "N/A",
                    sumInsured: result.order?.sumInsured || parseFloat(formData.sumInsured || "0"),
                    totalPremium: result.invoice?.amount || 0,
                    currency: formData.currency || "TZS",
                    insurerName: activeInsurer?.fullName || "Selected Insurer"
                });
                
                setShowSuccessModal(true);
            } else {
                let errMsg = "An unexpected error occurred. Please try again.";
                try {
                    const error = await res.json();
                    errMsg = error.error || error.message || errMsg;
                } catch (e) {
                    try {
                        const errText = await res.text();
                        errMsg = errText.substring(0, 100) || res.statusText || errMsg;
                    } catch (_) {}
                }
                toast.error("Failed to Create Order", {
                    description: errMsg,
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error("Create order error:", error);
            toast.error("Failed to Create Order", {
                description: "An unexpected error occurred. Please try again.",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="space-y-6 font-sans bg-transparent pb-12">
                {/* Header with Glassmorphism skeleton */}
                <div className="bg-white/80 border-b border-slate-200/60 p-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-40 rounded" />
                            <Skeleton className="h-3 w-48 rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded" />
                </div>

                {/* Horizontal Stepper skeleton */}
                <div className="max-w-3xl mx-auto px-4 pt-6">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10" />
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex flex-col items-center gap-2 bg-transparent z-10">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-3.5 w-16 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form card container skeleton */}
                <div className="max-w-3xl mx-auto px-4 mt-8">
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-5 space-y-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="h-5 w-48 rounded" />
                            </div>
                            <Skeleton className="h-4 w-72 rounded" />
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3.5 w-24 rounded" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                            <Skeleton className="h-10 w-24 rounded-xl" />
                            <Skeleton className="h-10 w-28 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 relative overflow-hidden font-sans pb-12 grainy-bg">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 grid-pattern pointer-events-none opacity-[0.3]" />
            
            {/* Background glowing blurred design layers */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Glassmorphism */}
            <div className="bg-white/70 backdrop-blur-md border-b border-slate-200/40 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 hover:border-slate-350 active:scale-95 transition-all duration-200 flex-shrink-0 border border-slate-200/80 bg-white cursor-pointer shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                                    Insurance Proposal Form
                                </h1>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green/70 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green shadow-[0_0_8px_rgba(61,164,78,0.5)]"></span>
                                    </span>
                                    <span>Step {currentStep + 1} of {STEPS.length} &bull; {STEPS[currentStep].title}</span>
                                </div>
                            </div>
                        </div>
                        {/* Progress indicator badge */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                                <span>Completion:</span>
                                <span className="text-brand-green font-extrabold">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout - Stepper, Form, Live Estimate Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Stepper Column (3 cols) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Desktop Progress Stepper */}
                        <div className="hidden lg:block bg-white/85 backdrop-blur-sm border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-5 sticky top-24 transition-all duration-300">
                            <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-4 pb-2 border-b border-slate-100 flex items-center justify-between font-sans">
                                <span>Sections Checklist</span>
                                <span className="text-brand-green font-extrabold">{currentStep + 1}/{STEPS.length}</span>
                            </h3>
                            <div className="space-y-1">
                                {STEPS.map((step, index) => {
                                    const isCompleted = index < currentStep;
                                    const isCurrent = index === currentStep;
                                    const StepIcon = step.icon;

                                    return (
                                        <div key={index} className="relative">
                                            <div className={cn(
                                                "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 border",
                                                isCurrent 
                                                    ? "bg-brand-green/[0.03] shadow-[0_2px_8px_rgba(61,164,78,0.04)] border-brand-green/20 scale-[1.01]" 
                                                    : "hover:bg-slate-50/50 border-transparent"
                                            )}>
                                                <div className={cn(
                                                    "w-8.5 h-8.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 border text-xs",
                                                    isCompleted
                                                        ? "bg-brand-green border-brand-green text-white shadow-sm shadow-emerald-100/50"
                                                        : isCurrent
                                                            ? "bg-brand-green text-white shadow-[0_4px_12px_rgba(61,164,78,0.25)] border-brand-green"
                                                            : "bg-slate-50 border-slate-200/80 text-slate-400"
                                                )}>
                                                    {isCompleted ? (
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    ) : (
                                                        <StepIcon className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-[9px] font-bold tracking-wider uppercase leading-none",
                                                        isCurrent ? "text-brand-green" : isCompleted ? "text-slate-500" : "text-slate-400"
                                                    )}>
                                                        Step 0{index + 1}
                                                    </p>
                                                    <p className={cn(
                                                        "text-xs font-bold truncate mt-1.5",
                                                        isCurrent ? "text-slate-900 font-extrabold" : isCompleted ? "text-slate-600 font-semibold" : "text-slate-400"
                                                    )}>
                                                        {step.title}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < STEPS.length - 1 && (
                                                <div className="ml-[17px] h-3.5 w-0.5 my-0.5 bg-slate-200/60 rounded-full" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Stepper Card */}
                        <div className="lg:hidden bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green">
                                    Step {currentStep + 1} of {STEPS.length}
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                    {STEPS[currentStep].title}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-105 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-green transition-all duration-300 ease-out shadow-sm shadow-brand-green/20"
                                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{STEPS[currentStep].description}</p>
                        </div>
                    </div>

                    {/* Middle Form Column (6 cols) */}
                    <div className="lg:col-span-6 min-w-0 w-full">
                        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_45px_-10px_rgba(0,0,0,0.05)] p-6 sm:p-8 lg:p-10 transition-all duration-300">
                            <form onSubmit={handleSubmit}>
                                
                                {/* Step 0: Document Upload */}
                                {currentStep === 0 && (
                                    <DocumentUploadStep
                                        onExtracted={handleExtracted}
                                        onSkip={handleSkipUpload}
                                    />
                                )}

                                {/* Step 1: Insurable Interest */}
                                {currentStep === 1 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Insurable Interest
                                             </h2>
                                             <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                 Specify your legal relationship to the shipment goods to establish insurable capacity.
                                             </p>
                                         </div>

                                         <div className="space-y-6">
                                             {/* Capacity of Proposer */}
                                             <div className="space-y-3">
                                                 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                     Capacity of Proposer <span className="text-rose-500">*</span>
                                                 </label>
                                                 <div className="relative">
                                                     <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                     <select
                                                         name="proposerCapacity"
                                                         value={formData.proposerCapacity}
                                                         onChange={(e) => {
                                                             const val = e.target.value;
                                                             setFormData(prev => ({
                                                                 ...prev,
                                                                 proposerCapacity: val,
                                                                 proposerCapacityOther: val !== "Other" ? "" : prev.proposerCapacityOther
                                                             }));
                                                         }}
                                                         required
                                                         className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                     >
                                                         <option value="">Select Capacity</option>
                                                         {PROPOSER_CAPACITY.map((cap) => (
                                                             <option key={cap.name} value={cap.name}>
                                                                 {cap.name} ({cap.desc})
                                                             </option>
                                                         ))}
                                                     </select>
                                                 </div>
                                                 {formData.proposerCapacity === "Other" && (
                                                     <input
                                                         type="text"
                                                         name="proposerCapacityOther"
                                                         value={formData.proposerCapacityOther}
                                                         onChange={handleChange}
                                                         placeholder="Specify proposer capacity details"
                                                         className="mt-3 w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold placeholder-slate-450 text-sm shadow-inner"
                                                     />
                                                 )}
                                             </div>

                                             {/* Basis of Sales (Incoterms) */}
                                             <HighlightedIfAi filled={aiPrefilledFields.includes("incoterm")}>
                                                 <div className="space-y-3">
                                                     <div className="flex items-center justify-between">
                                                         <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                             Basis of Sales (Incoterms) <span className="text-rose-500">*</span>
                                                         </label>
                                                         {aiPrefilledFields.includes("incoterm") && <AiFilledBadge />}
                                                     </div>
                                                     <div className="relative">
                                                         <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                         <select
                                                             name="incoterm"
                                                             value={formData.incoterm}
                                                             onChange={(e) => {
                                                                 const val = e.target.value;
                                                                 setFormData(prev => ({
                                                                     ...prev,
                                                                     incoterm: val,
                                                                     incotermOther: val !== "Other" ? "" : prev.incotermOther
                                                                 }));
                                                             }}
                                                             required
                                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                         >
                                                             <option value="">Select Incoterm</option>
                                                             {INCOTERMS.map((term) => (
                                                                 <option key={term.name} value={term.name}>
                                                                     {term.name} - {term.desc}
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     {formData.incoterm === "Other" && (
                                                         <input
                                                             type="text"
                                                             name="incotermOther"
                                                             value={formData.incotermOther}
                                                             onChange={handleChange}
                                                             placeholder="Specify Incoterm details"
                                                             className="mt-3 w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 text-sm shadow-inner"
                                                         />
                                                     )}
                                                 </div>
                                             </HighlightedIfAi>
                                         </div>

                                         {/* Navigation */}
                                         <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                             <button
                                                 type="button"
                                                 onClick={prevStep}
                                                 className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                             >
                                                 <ArrowLeft className="w-4 h-4" />
                                                 Back
                                             </button>
                                             <button
                                                 type="button"
                                                 onClick={nextStep}
                                                 disabled={!validateCurrentStep()}
                                                 className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                             >
                                                 Continue
                                                 <ChevronRight className="w-4 h-4" />
                                             </button>
                                         </div>
                                     </div>
                                 )}

                                {/* Step 2: Description of Goods */}
                                {currentStep === 2 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Description of Goods
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                Provide specific details regarding the cargo description, weight, and packaging methods.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Nature of Cargo */}
                                            <HighlightedIfAi filled={aiPrefilledFields.includes("cargoNature")}>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Nature of Cargo <span className="text-rose-500">*</span>
                                                        </label>
                                                        {aiPrefilledFields.includes("cargoNature") && <AiFilledBadge />}
                                                    </div>
                                                    <div className="relative">
                                                        <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        <select
                                                            name="cargoNature"
                                                            value={formData.cargoNature}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                        >
                                                            <option value="">Select Cargo Nature</option>
                                                            {CARGO_NATURE_OPTIONS.map((nature) => (
                                                                 <option key={nature.name} value={nature.name}>
                                                                     {nature.name} - {nature.desc}
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                 </div>
                                             </HighlightedIfAi>

                                             {/* Packaging Method */}
                                             <HighlightedIfAi filled={aiPrefilledFields.includes("packagingMethod")}>
                                                 <div className="space-y-3">
                                                     <div className="flex items-center justify-between">
                                                         <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                             Packaging Method <span className="text-rose-500">*</span>
                                                         </label>
                                                         {aiPrefilledFields.includes("packagingMethod") && <AiFilledBadge />}
                                                     </div>
                                                     <div className="relative">
                                                         <Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                         <select
                                                             name="packagingMethod"
                                                             value={formData.packagingMethod}
                                                             onChange={(e) => {
                                                                 const val = e.target.value;
                                                                 setFormData(prev => ({
                                                                     ...prev,
                                                                     packagingMethod: val,
                                                                     packagingMethodOther: val !== "Other" ? "" : prev.packagingMethodOther
                                                                 }));
                                                             }}
                                                             required
                                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                         >
                                                             <option value="">Select Packaging Method</option>
                                                             {PACKAGING_METHODS.map((method) => (
                                                                 <option key={method.name} value={method.name}>
                                                                     {method.name} - {method.desc}
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     {formData.packagingMethod === "Other" && (
                                                         <input
                                                             type="text"
                                                             name="packagingMethodOther"
                                                             value={formData.packagingMethodOther}
                                                             onChange={handleChange}
                                                             placeholder="Specify packaging method details"
                                                             className="mt-3 w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 text-sm shadow-inner"
                                                         />
                                                     )}
                                                 </div>
                                             </HighlightedIfAi>

                                             {/* Total Weight & Quantity */}
                                             <HighlightedIfAi filled={aiPrefilledFields.includes("totalWeight") || aiPrefilledFields.includes("weightUnit")}>
                                                 <div className="space-y-3">
                                                     <div className="flex items-center justify-between">
                                                         <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                             Total Gross Weight <span className="text-rose-500">*</span>
                                                         </label>
                                                         {(aiPrefilledFields.includes("totalWeight") || aiPrefilledFields.includes("weightUnit")) && <AiFilledBadge />}
                                                     </div>
                                                     <div className="flex gap-2">
                                                         <div className="flex-1">
                                                             <input
                                                                 type="number"
                                                                 name="totalWeight"
                                                                 value={formData.totalWeight}
                                                                 onChange={handleChange}
                                                                 required
                                                                 placeholder="0.00"
                                                                 className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 text-sm shadow-inner"
                                                             />
                                                         </div>
                                                         <div className="w-28">
                                                             <select
                                                                 name="weightUnit"
                                                                 value={formData.weightUnit}
                                                                 onChange={handleChange}
                                                                 className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                             >
                                                                 <option value="KG">KG</option>
                                                                 <option value="TONS">TONS</option>
                                                             </select>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </HighlightedIfAi>

                                             {/* Detailed Description */}
                                             <HighlightedIfAi filled={aiPrefilledFields.includes("cargoDescription")}>
                                                 <div className="space-y-3">
                                                     <div className="flex items-center justify-between">
                                                         <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                             Detailed Cargo Description <span className="text-rose-500">*</span>
                                                         </label>
                                                         {aiPrefilledFields.includes("cargoDescription") && <AiFilledBadge />}
                                                     </div>
                                                     <textarea
                                                         name="cargoDescription"
                                                         value={formData.cargoDescription}
                                                         onChange={handleChange}
                                                         rows={4}
                                                         required
                                                         placeholder="Provide detailed description of the cargo (e.g. 500 bags of grade-1 basmati rice, electronics, mechanical components...)"
                                                         className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 text-sm shadow-inner resize-none leading-relaxed"
                                                     />
                                                 </div>
                                             </HighlightedIfAi>
                                         </div>

                                         {/* Navigation */}
                                         <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                             <button
                                                 type="button"
                                                 onClick={prevStep}
                                                 className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                             >
                                                 <ArrowLeft className="w-4 h-4" />
                                                 Back
                                             </button>
                                             <button
                                                 type="button"
                                                 onClick={nextStep}
                                                 disabled={!validateCurrentStep()}
                                                 className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                             >
                                                 Continue
                                                 <ChevronRight className="w-4 h-4" />
                                             </button>
                                         </div>
                                     </div>
                                 )}

                                {/* Step 3: Voyage Details */}
                                {currentStep === 3 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Voyage Details
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                Shipping route, conveyance mode, and transport timeframes.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Origin country/port */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <HighlightedIfAi filled={aiPrefilledFields.includes("originCountry")}>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Country of Origin <span className="text-rose-500">*</span>
                                                            </label>
                                                            {aiPrefilledFields.includes("originCountry") && <AiFilledBadge />}
                                                        </div>
                                                        <select
                                                            name="originCountry"
                                                            value={formData.originCountry}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                        >
                                                            <option value="" className="text-slate-400">Select Country</option>
                                                            {countries.map((c) => (
                                                                <option key={c.id} value={c.name}>
                                                                    {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </HighlightedIfAi>

                                                <HighlightedIfAi filled={aiPrefilledFields.includes("originPort")}>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Port of Origin <span className="text-rose-500">*</span>
                                                            </label>
                                                            {aiPrefilledFields.includes("originPort") && <AiFilledBadge />}
                                                        </div>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            <select
                                                                name="originPort"
                                                                value={formData.originPort}
                                                                onChange={handleChange}
                                                                required
                                                                disabled={!formData.originCountry}
                                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed shadow-sm"
                                                            >
                                                                <option value="" className="text-slate-400">Select Port</option>
                                                                {filteredOriginPorts.map((p) => (
                                                                    <option key={p.id} value={p.name}>
                                                                        {p.name} ({p.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </HighlightedIfAi>
                                            </div>

                                            {/* Destination country/port */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <HighlightedIfAi filled={aiPrefilledFields.includes("destinationCountry")}>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Country of Destination <span className="text-rose-500">*</span>
                                                            </label>
                                                            {aiPrefilledFields.includes("destinationCountry") && <AiFilledBadge />}
                                                        </div>
                                                        <select
                                                            name="destinationCountry"
                                                            value={formData.destinationCountry}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                        >
                                                            <option value="" className="text-slate-400">Select Country</option>
                                                            {countries.map((c) => (
                                                                <option key={c.id} value={c.name}>
                                                                    {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </HighlightedIfAi>

                                                <HighlightedIfAi filled={aiPrefilledFields.includes("destinationPort")}>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Port of Destination <span className="text-rose-500">*</span>
                                                            </label>
                                                            {aiPrefilledFields.includes("destinationPort") && <AiFilledBadge />}
                                                        </div>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            <select
                                                                name="destinationPort"
                                                                value={formData.destinationPort}
                                                                onChange={handleChange}
                                                                required
                                                                disabled={!formData.destinationCountry}
                                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed shadow-sm"
                                                            >
                                                                <option value="" className="text-slate-400">Select Port</option>
                                                                {filteredDestPorts.map((p) => (
                                                                    <option key={p.id} value={p.name}>
                                                                        {p.name} ({p.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </HighlightedIfAi>
                                            </div>

                                            {/* Mode of Transport */}
                                            <HighlightedIfAi filled={aiPrefilledFields.includes("transportMode")}>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Mode of Transport <span className="text-rose-500">*</span>
                                                        </label>
                                                        {aiPrefilledFields.includes("transportMode") && <AiFilledBadge />}
                                                    </div>
                                                    <div className="relative">
                                                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        <select
                                                            name="transportMode"
                                                            value={formData.transportMode}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                        >
                                                            <option value="">Select Transport Mode</option>
                                                            {TRANSPORT_MODES.map((mode) => (
                                                                <option key={mode} value={mode}>
                                                                    {mode}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </HighlightedIfAi>

                                            {/* Expected Dispatch Date */}
                                            <HighlightedIfAi filled={aiPrefilledFields.includes("dispatchDate")}>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Expected Dispatch Date <span className="text-rose-500">*</span>
                                                        </label>
                                                        {aiPrefilledFields.includes("dispatchDate") && <AiFilledBadge />}
                                                    </div>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 pointer-events-none" />
                                                        <input
                                                            type="date"
                                                            name="dispatchDate"
                                                            value={formData.dispatchDate}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                            </HighlightedIfAi>

                                            {/* Transshipment involved */}
                                            <div className="pt-2">
                                                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                                                    <div className="flex items-start gap-3.5">
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
                                                            className="mt-1 w-4.5 h-4.5 text-brand-green border-slate-300 rounded focus:ring-brand-green cursor-pointer"
                                                        />
                                                        <label htmlFor="transShipment" className="flex-1 text-xs sm:text-sm text-slate-700 cursor-pointer font-bold leading-snug">
                                                            Is Trans-shipment Involved?
                                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Check if the cargo will change vessels or carriers during transit.</p>
                                                        </label>
                                                    </div>
                                                </div>

                                                {formData.transShipment && (
                                                    <div className="mt-4 animate-in fade-in duration-250">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Trans-shipment Port Details <span className="text-rose-500">*</span>
                                                        </label>
                                                        <textarea
                                                            name="transShipmentNote"
                                                            value={formData.transShipmentNote}
                                                            onChange={handleChange}
                                                            rows={2}
                                                            required
                                                            placeholder="Describe trans-shipment hubs, ports, or routing deviations..."
                                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 text-sm shadow-inner resize-none leading-relaxed"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Conveyance Details */}
                                {currentStep === 4 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Conveyance Details
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                Specify vessel names or carrier identifiers for customs clearance (optional).
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <HighlightedIfAi filled={aiPrefilledFields.includes("vesselName")}>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Vessel Name
                                                        </label>
                                                        {aiPrefilledFields.includes("vesselName") && <AiFilledBadge />}
                                                    </div>
                                                    <div className="relative">
                                                        <Ship className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            name="vesselName"
                                                            value={formData.vesselName}
                                                            onChange={handleChange}
                                                            placeholder="e.g. MV Ever Given"
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </HighlightedIfAi>

                                            <HighlightedIfAi filled={aiPrefilledFields.includes("carrierName")}>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Carrier / Shipping Line Name
                                                        </label>
                                                        {aiPrefilledFields.includes("carrierName") && <AiFilledBadge />}
                                                    </div>
                                                    <div className="relative">
                                                        <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            name="carrierName"
                                                            value={formData.carrierName}
                                                            onChange={handleChange}
                                                            placeholder="e.g. Maersk, MSC, Ocean Network Express"
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </HighlightedIfAi>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Insurance Cover & Valuation */}
                                {currentStep === 5 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Insurance & Valuation
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                Select active insurers, policies, and specify shipment valuations.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Insurer Selection */}
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Select Insurer Company <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {insurers.map((insurer) => {
                                                        const active = selectedInsurerId === insurer.id;
                                                        return (
                                                            <button
                                                                key={insurer.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, policyId: "" })); // reset policy
                                                                    setSelectedInsurerId(insurer.id);
                                                                }}
                                                                className={cn(
                                                                    "relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 text-center cursor-pointer bg-slate-50/50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm",
                                                                    active && "border-brand-blue bg-blue-50/5 text-brand-blue ring-1 ring-brand-blue/10 shadow-sm"
                                                                )}
                                                            >
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-250 flex items-center justify-center font-bold text-slate-500 overflow-hidden shadow-inner flex-shrink-0">
                                                                    {insurer.logoUrl ? (
                                                                        <img src={insurer.logoUrl} alt={insurer.fullName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        insurer.fullName?.substring(0, 2).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <span className={cn(
                                                                    "text-xs font-bold leading-tight line-clamp-2",
                                                                    active ? "text-brand-blue" : "text-slate-800"
                                                                )}>
                                                                    {insurer.fullName || "Insurer"}
                                                                </span>
                                                                {active && (
                                                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(30,135,209,0.6)]" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Policy Selection */}
                                            {selectedInsurerId && (
                                                <div className="space-y-3 animate-in fade-in duration-250">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Select Insurance Policy <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                        {policies.filter(p => p.insurer?.id === selectedInsurerId).map((policy) => {
                                                            const active = formData.policyId === policy.id;
                                                            return (
                                                                <button
                                                                    key={policy.id}
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({
                                                                        ...prev,
                                                                        policyId: policy.id,
                                                                        coverType: policy.clauseType,
                                                                        valuationBasis: policy.valuationBasis || prev.valuationBasis
                                                                    }))}
                                                                    className={cn(
                                                                        "relative p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-md flex flex-col justify-between min-h-[110px]",
                                                                        active && "border-brand-green bg-brand-green/5 ring-1 ring-brand-green/10"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start gap-3 mb-2">
                                                                        <div className={cn(
                                                                            "w-8.5 h-8.5 rounded-lg flex items-center justify-center flex-shrink-0 border",
                                                                            active 
                                                                                ? "bg-brand-green border-brand-green text-white shadow-sm"
                                                                                : "bg-slate-100 border-slate-200 text-slate-500"
                                                                        )}>
                                                                            <Shield className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <h4 className={cn(
                                                                                "text-xs font-bold leading-snug",
                                                                                active ? "text-brand-green font-extrabold" : "text-slate-900"
                                                                            )}>
                                                                                {policy.name}
                                                                            </h4>
                                                                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1">
                                                                                {policy.clauseType}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-2 mt-2">
                                                                        <span>Premium Rate:</span>
                                                                        <span className="text-slate-700">{policy.rate}%</span>
                                                                    </div>
                                                                    {active && (
                                                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-green" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Value inputs */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                                                <HighlightedIfAi filled={aiPrefilledFields.includes("invoiceValue") || aiPrefilledFields.includes("currency")}>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Cargo Invoice Value <span className="text-rose-500">*</span>
                                                            </label>
                                                            {(aiPrefilledFields.includes("invoiceValue") || aiPrefilledFields.includes("currency")) && <AiFilledBadge />}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1 relative">
                                                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                <input
                                                                    type="number"
                                                                    name="invoiceValue"
                                                                    value={formData.invoiceValue}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder="0.00"
                                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm shadow-inner"
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <select
                                                                    name="currency"
                                                                    value={formData.currency}
                                                                    onChange={handleChange}
                                                                    className="w-full px-3 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                                >
                                                                    <option value="TZS">TZS</option>
                                                                    <option value="USD">USD</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </HighlightedIfAi>

                                                <div className="space-y-3">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Valuation Basis <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        name="valuationBasis"
                                                        value={formData.valuationBasis}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm cursor-pointer shadow-sm"
                                                    >
                                                        {VALUATION_BASIS.map((basis) => (
                                                            <option key={basis.name} value={basis.name}>
                                                                {basis.name} - {basis.name === "CIF" ? "Invoice + 10%" : "Base Invoice"}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Sum Insured Result */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-green shadow-sm">
                                                        <ShieldCheck className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider leading-none">Calculated Sum Insured</p>
                                                        <p className="text-xs text-slate-500 font-medium mt-1">Automatic assessment based on valuation basis</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-slate-550 mr-1">Tsh</span>
                                                    <span className="text-sm font-black text-slate-850">
                                                        {formData.sumInsured ? parseFloat(formData.sumInsured).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Additional Covers Info */}
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Additional Covers Required
                                                </label>
                                                <textarea
                                                    name="additionalCovers"
                                                    value={formData.additionalCovers}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    placeholder="e.g. War & Strikes risks (SRCC), Theft, Pilferage & Non-Delivery (TPND)..."
                                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm resize-none placeholder-slate-400 leading-relaxed"
                                                />
                                                <p className="text-[9px] text-slate-400 font-bold">Optional: Specify custom cover extensions.</p>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Storage Details & Claims History */}
                                {currentStep === 6 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Additional Risk Information
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                Transit warehouse storage details and previous claims records.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* G. Storage Details */}
                                            <div className="space-y-4">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    Storage Details
                                                </h3>
                                                
                                                <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                                                    <div className="flex items-start gap-3.5">
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
                                                            className="mt-1 w-4.5 h-4.5 text-brand-green border-slate-300 rounded focus:ring-brand-green cursor-pointer flex-shrink-0"
                                                        />
                                                        <label htmlFor="storageRequired" className="flex-1 text-xs sm:text-sm text-slate-700 cursor-pointer font-bold leading-normal">
                                                            Storage Before or After Transit?
                                                            <p className="text-[10px] text-slate-405 font-medium mt-0.5">Check if the cargo will undergo storage in custom warehouses or facilities outside the transit voyage.</p>
                                                        </label>
                                                    </div>
                                                </div>

                                                {formData.storageRequired && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-7 animate-in fade-in duration-250">
                                                        <div className="space-y-3">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Storage Location <span className="text-rose-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                                <input
                                                                    type="text"
                                                                    name="storageLocation"
                                                                    value={formData.storageLocation}
                                                                    onChange={handleChange}
                                                                    placeholder="e.g. Dar es Salaam Port ICD"
                                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                Storage Duration (Days) <span className="text-rose-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="storageDuration"
                                                                value={formData.storageDuration}
                                                                onChange={handleChange}
                                                                placeholder="e.g. 14 Days"
                                                                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* H. Claims History */}
                                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    Prior Claims History
                                                </h3>

                                                <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                                                    <div className="flex items-start gap-3.5">
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
                                                            className="mt-1 w-4.5 h-4.5 text-brand-green border-slate-300 rounded focus:ring-brand-green cursor-pointer flex-shrink-0"
                                                        />
                                                        <label htmlFor="claimsHistory" className="flex-1 text-xs sm:text-sm text-slate-700 cursor-pointer font-bold leading-normal">
                                                            Any prior marine cargo claims?
                                                            <p className="text-[10px] text-slate-405 font-medium mt-0.5">Check if you have filed any shipping or transit claims in the past 3 years.</p>
                                                        </label>
                                                    </div>
                                                </div>

                                                {formData.claimsHistory && (
                                                    <div className="pl-0 sm:pl-7 animate-in fade-in duration-250 space-y-3">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Describe Claims Details <span className="text-rose-500">*</span>
                                                        </label>
                                                        <textarea
                                                            name="claimsDetails"
                                                            value={formData.claimsDetails}
                                                            onChange={handleChange}
                                                            rows={2}
                                                            required
                                                            placeholder="Detail past claims: Date, Insurer, Claim amount, Cause of loss..."
                                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm resize-none placeholder-slate-400 leading-relaxed"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateCurrentStep()}
                                                className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 7: Declaration Review & Submit */}
                                {currentStep === 7 && (
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-100 pb-5">
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                Review & Submit Proposal
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">
                                                Double-check the declarations and billing estimates before finalizing.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Summary Docket Receipt */}
                                            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden">
                                                {/* Docket header info */}
                                                <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-brand-green text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-green/10">
                                                            <Receipt className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-slate-800">Proposal Summary Docket</h3>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">NIIS-T DIGITAL COVER APPLICATION</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">Date Created</p>
                                                        <p className="text-xs text-slate-600 font-bold mt-0.5">{formData.declarationDate || "Today"}</p>
                                                    </div>
                                                </div>

                                                {/* Docket Grid Details */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Declarant Name</span>
                                                        <p className="font-extrabold text-slate-700 mt-0.5">{formData.proposerName || "Not Provided"}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Capacity / Incoterm</span>
                                                        <p className="font-extrabold text-slate-700 mt-0.5">{formData.proposerCapacity || "Owner"} ({formData.incoterm || "CIF"})</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cargo & Packaging</span>
                                                        <p className="font-extrabold text-slate-700 mt-0.5">{formData.cargoNature || "General"} &bull; {formData.packagingMethod || "Cartons"}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Weight</span>
                                                        <p className="font-extrabold text-slate-700 mt-0.5">{formData.totalWeight ? `${formData.totalWeight} ${formData.weightUnit}` : "—"}</p>
                                                    </div>
                                                    <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Transit Route</span>
                                                        <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                                            <span>{formData.originPort || "Origin Port"} ({formData.originCountry})</span>
                                                            <span className="text-slate-400 font-medium">&rarr;</span>
                                                            <span>{formData.destinationPort || "Destination Port"} ({formData.destinationCountry})</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Embedded Invoice calculations inside Docket */}
                                                {liveEstimate && (
                                                    <div className="mt-5 pt-4 border-t border-slate-200 bg-slate-100/50 -mx-5 -mb-5 px-5 py-4">
                                                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2.5">Application Cost Estimate</h4>
                                                        <div className="space-y-1.5 text-xs">
                                                            <div className="flex justify-between text-slate-500 font-semibold">
                                                                <span>Invoice Valuation:</span>
                                                                <span>Tsh {parseFloat(formData.invoiceValue).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-slate-500 font-semibold">
                                                                <span>Premium Rate:</span>
                                                                <span>{liveEstimate.rate}%</span>
                                                            </div>
                                                            <div className="flex justify-between text-slate-750 font-bold border-t border-dashed border-slate-200 pt-1.5 mt-1.5">
                                                                <span>Estimated Policy Premium:</span>
                                                                <span>Tsh {liveEstimate.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Proposer Declarant Input */}
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Name of Proposer / Declarant <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="proposerName"
                                                    value={formData.proposerName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Provide full legal name or registered company name"
                                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all duration-300 text-slate-900 font-semibold text-sm shadow-sm"
                                                />
                                            </div>

                                            {/* Declaration Date */}
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Declaration Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        name="declarationDate"
                                                        value={formData.declarationDate}
                                                        onChange={handleChange}
                                                        disabled
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 font-semibold text-sm disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            {/* Terms of Declaration Checkbox */}
                                            <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 sm:p-5">
                                                <div className="flex items-start gap-3.5">
                                                    <input
                                                        type="checkbox"
                                                        id="acceptTerms"
                                                        name="acceptTerms"
                                                        checked={formData.acceptTerms}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1 w-5 h-5 text-brand-green border-slate-300 rounded focus:ring-brand-green cursor-pointer flex-shrink-0"
                                                    />
                                                    <label htmlFor="acceptTerms" className="flex-1 text-xs text-slate-605 cursor-pointer font-bold leading-relaxed">
                                                        <span className="text-slate-800 font-extrabold block mb-0.5">Legal Declaration Confirmation</span>
                                                        I/We declare that the information provided is complete and correct to the best of my knowledge. I understand that any false declarations may invalidate this contract and lead to claim rejections.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit / Navigation */}
                                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            
                                            <button
                                                type="submit"
                                                disabled={loading || !validateCurrentStep()}
                                                className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Submitting Proposal...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Proposal
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>                    {/* Right Live Estimate Panel Column (3 cols) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Live Quote Estimate Side Widget */}
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-24 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-brand-green" />
                                <span>Live Quote Estimate</span>
                            </h3>

                            {liveEstimate ? (
                                <div className="space-y-5">
                                    {/* Selected Carrier / Insurer Badge */}
                                    {activeInsurer && (
                                        <div className="flex items-center gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-200/50 shadow-sm animate-in fade-in duration-200">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/50 flex items-center justify-center font-bold text-xs text-slate-650 overflow-hidden flex-shrink-0">
                                                {activeInsurer.logoUrl ? (
                                                    <img src={activeInsurer.logoUrl} alt={activeInsurer.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    activeInsurer.fullName?.substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Selected Carrier</p>
                                                <p className="text-xs text-slate-800 font-extrabold truncate mt-1">{activeInsurer.fullName}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dotted Voyage Visualizer */}
                                    {formData.originCountry && formData.destinationCountry && (
                                        <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/50 shadow-sm space-y-2.5 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                                                <span>Origin</span>
                                                <span>Transit</span>
                                                <span>Destination</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-1.5 py-1">
                                                <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm max-w-[65px] truncate text-center">
                                                    {formData.originPort ? formData.originPort.substring(0, 4).toUpperCase() : formData.originCountry.substring(0, 3).toUpperCase()}
                                                </span>
                                                <div className="flex-1 relative flex items-center justify-center">
                                                    <div className="absolute left-0 right-0 h-[1.5px] bg-dashed border-t border-dashed border-slate-300" />
                                                    <div className="relative z-10 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-green shadow-sm animate-[bounce_1.5s_infinite]">
                                                        {formData.transportMode === "Air" ? (
                                                            <Plane className="w-3.5 h-3.5 animate-pulse" />
                                                        ) : formData.transportMode === "Road" ? (
                                                            <Truck className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Ship className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm max-w-[65px] truncate text-center">
                                                    {formData.destinationPort ? formData.destinationPort.substring(0, 4).toUpperCase() : formData.destinationCountry.substring(0, 3).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cost breakdown */}
                                    <div className="space-y-2.5 bg-slate-50/60 p-4 rounded-xl border border-slate-200/50 shadow-sm text-xs">
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>Valuation Basis:</span>
                                            <span className="text-slate-800 font-bold">{formData.valuationBasis}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>Sum Insured:</span>
                                            <span className="text-slate-800 font-semibold">Tsh {liveEstimate.sumInsured.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>Base Premium:</span>
                                            <span className="text-slate-800 font-semibold">Tsh {liveEstimate.basePremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>VAT ({activePolicy?.vat ?? 18}%):</span>
                                            <span className="text-slate-800 font-semibold">Tsh {liveEstimate.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>Stamp Duty & Levy:</span>
                                            <span className="text-slate-800 font-semibold">Tsh {(liveEstimate.stampDuty + liveEstimate.regulatoryLevy).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="border-t border-slate-200/60 pt-3 mt-3 flex justify-between items-baseline">
                                            <span className="text-xs font-bold text-slate-900">Total Premium:</span>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-brand-green mr-1 font-sans">Tsh</span>
                                                <span className="text-base font-black text-brand-green tracking-tight font-mono">
                                                    {liveEstimate.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-[10px] text-slate-400 font-bold leading-normal text-center">
                                        *Estimates are calculated live based on current policy rates.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 bg-white rounded-xl border border-slate-200/50 shadow-inner">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
                                        <Coins className="w-5 h-5 animate-pulse text-slate-350" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-700">Calculate Quote Premium</h4>
                                    <p className="text-[11px] text-slate-400 font-semibold leading-normal mt-1.5">
                                        Enter an invoice value and select a policy to view a real-time invoice calculation breakdown here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Submission Success Modal */}
            {showSuccessModal && submittedData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Glassmorphic Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                        onClick={() => {
                            setShowSuccessModal(false);
                            router.push("/dashboard/orders");
                        }}
                    />
                    
                    {/* Modal Content Card */}
                    <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 p-6 space-y-6">
                        {/* Upper success pattern */}
                        <div className="text-center space-y-3 pt-4">
                            <div className="relative w-16 h-16 mx-auto bg-gradient-to-tr from-brand-green to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 scale-100 hover:scale-105 transition-transform duration-300">
                                <Check className="w-8 h-8 stroke-[3]" />
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    Proposal Submitted!
                                </h3>
                                <p className="text-xs font-semibold text-slate-500">
                                    Your order proposal has been successfully processed.
                                </p>
                            </div>
                        </div>
                        
                        {/* Premium Summary Receipt */}
                        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                            {/* Dotted lines/cut texture at top & bottom */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 to-transparent bg-repeat-x bg-[size:10px_4px]" />
                            
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Order Reference</span>
                                <span className="font-extrabold text-slate-800 font-mono bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-sm">
                                    #{submittedData.orderId}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Invoice Number</span>
                                <span className="font-extrabold text-slate-800 font-mono bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-sm">
                                    {submittedData.invoiceNumber}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Insurer</span>
                                <span className="font-extrabold text-slate-700">
                                    {submittedData.insurerName}
                                </span>
                            </div>
                            
                            <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Sum Insured</span>
                                <span className="font-extrabold text-slate-700">
                                    {submittedData.currency} {submittedData.sumInsured?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            
                            <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
                                <span className="text-xs font-bold text-slate-900">Total Premium</span>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-brand-green mr-1">{submittedData.currency}</span>
                                    <span className="text-base font-black text-brand-green">
                                        {submittedData.totalPremium?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push("/dashboard/orders");
                                }}
                                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 text-center shadow-sm cursor-pointer hover:text-slate-800 active:scale-98"
                            >
                                Go to Orders
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push("/dashboard/invoices");
                                }}
                                className="w-full py-3 px-4 bg-brand-green hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 text-center shadow-sm cursor-pointer shadow-brand-green/10 hover:shadow-md active:scale-98"
                            >
                                View Invoices
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// AI Prefill Helper Components
function AiFilledBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-805 border border-emerald-200 shadow-sm animate-pulse duration-1000">
            <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
            AI PRE-FILLED
        </span>
    );
}

function HighlightedIfAi({ filled, children }: { filled: boolean; children: React.ReactNode }) {
    return (
        <div className={cn(
            "transition-all duration-300 rounded-2xl",
            filled ? "ring-2 ring-emerald-500/20 bg-emerald-50/10 p-1 -m-1" : ""
        )}>
            {children}
        </div>
    );
}

// Simple Coins fallback icon definition
function Coins({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="8" cy="8" r="6" />
            <circle cx="18" cy="18" r="4" />
            <path d="M12 18a6 6 0 0 0-6-6" />
        </svg>
    );
}