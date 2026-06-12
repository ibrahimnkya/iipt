"use client";

import { useState, useRef, useCallback } from "react";
import {
    FileText,
    Upload,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    ChevronRight,
    FileImage,
    Ship,
    Receipt,
    Package,
    SkipForward,
    ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────

export interface ExtractedData {
    // Insurable Interest
    incoterm?: string;

    // Cargo
    cargoDescription?: string;
    cargoNature?: string;
    packagingMethod?: string;
    totalWeight?: string;
    weightUnit?: string;

    // Voyage
    originCountry?: string;
    originPort?: string;
    destinationCountry?: string;
    destinationPort?: string;
    transportMode?: string;
    dispatchDate?: string;

    // Conveyance
    vesselName?: string;
    carrierName?: string;

    // Value
    invoiceValue?: string;
    currency?: string;
}

interface DocumentUploadStepProps {
    onExtracted: (data: ExtractedData) => void;
    onSkip: () => void;
}

// ─── Supported document types ─────────────────────────────────────

const DOC_TYPES = [
    {
        id: "invoice",
        label: "Commercial Invoice",
        icon: Receipt,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        desc: "Extracts cargo value, description, incoterms, parties",
    },
    {
        id: "bl",
        label: "Bill of Lading",
        icon: Ship,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        desc: "Extracts vessel, ports, carrier, dispatch date",
    },
    {
        id: "packing",
        label: "Packing List",
        icon: Package,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-200",
        desc: "Extracts cargo nature, weight, packaging method",
    },
];

const ACCEPTED_MIME = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

// ─── OCR Engine ───────────────────────────────────────────────────

/**
 * Runs Tesseract OCR on a canvas element or image URL.
 * Returns the raw recognized text.
 */
async function runTesseract(
    source: HTMLCanvasElement | string,
    onProgress: (msg: string) => void
): Promise<string> {
    // Dynamically import to avoid SSR issues
    const Tesseract = await import("tesseract.js");
    const { createWorker } = Tesseract;

    onProgress("Loading OCR engine...");
    const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
            if (m.status === "recognizing text") {
                onProgress(`Scanning... ${Math.round(m.progress * 100)}%`);
            }
        },
    });

    onProgress("Running OCR...");
    const result = await worker.recognize(source as any);
    await worker.terminate();
    return result.data.text;
}

/**
 * Convert a PDF file to an array of canvas elements (one per page, max 3 pages).
 */
async function pdfToCanvases(
    file: File,
    onProgress: (msg: string) => void
): Promise<HTMLCanvasElement[]> {
    onProgress("Loading PDF...");
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist");
    // Set worker source — use the bundled version
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = Math.min(pdf.numPages, 3); // limit to 3 pages for speed

    const canvases: HTMLCanvasElement[] = [];
    for (let i = 1; i <= pageCount; i++) {
        onProgress(`Rendering page ${i} of ${pageCount}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x for better OCR accuracy
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
        canvases.push(canvas);
    }
    return canvases;
}

// ─── Text Parser ──────────────────────────────────────────────────

// Helper: search through multiple lines for a label then grab the value on same or next line
function findLabelValue(lines: string[], labelPattern: RegExp): string | null {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(labelPattern);
        if (match) {
            // Try to get value after colon/tab on same line
            const afterLabel = line.replace(labelPattern, "").replace(/^[\s:]+/, "").trim();
            if (afterLabel.length > 1) return afterLabel;
            // Otherwise look at next non-empty line
            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                const next = lines[j].trim();
                if (next.length > 1) return next;
            }
        }
    }
    return null;
}

// Helper: clean up a captured value — strip trailing junk
function cleanValue(s: string): string {
    return s
        .replace(/\s+/g, " ")
        .replace(/[,:;]+$/, "")
        .trim();
}

function isValidValue(value: string, fieldName: string): boolean {
    if (!value) return false;
    const lower = value.toLowerCase().trim();
    
    const invalidKeywords = [
        "name", "address", "city", "state", "zip", "phone", "fax", "email", 
        "signature", "date", "consignee", "shipper", "carrier", "vessel", "flight",
        "description", "quantity", "weight", "value", "total", "unit", "pieces",
        "marks", "nos", "packages", "pkg", "pkgs", "carton", "box", "pallet",
        "importer", "exporter", "destination", "origin", "port", "loading", "discharge",
        "page", "bill of lading", "invoice", "commercial invoice"
    ];

    if (invalidKeywords.includes(lower)) {
        return false;
    }

    if (fieldName === "vesselName" && (
        ["city", "state", "zip", "trailer", "seal", "carrier", "commercial invoice"].includes(lower) ||
        lower.includes("seal number") || lower.includes("trailer number")
    )) {
        return false;
    }
    if (fieldName === "carrierName" && ["name", "carrier", "shipping", "company"].includes(lower)) {
        return false;
    }
    if (fieldName === "cargoDescription") {
        if (lower.includes("ltl only") || lower === "of goods qty" || lower.includes("description of goods")) {
            return false;
        }
    }

    return true;
}

function findValidMatch(text: string, patterns: RegExp[], fieldName: string, groupIndex = 1): string | null {
    for (const pattern of patterns) {
        const regex = new RegExp(pattern.source, pattern.flags + "g");
        let match;
        while ((match = regex.exec(text)) !== null) {
            const val = match[groupIndex];
            if (val && isValidValue(val.trim(), fieldName)) {
                return val.trim();
            }
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
        }
    }
    return null;
}

/**
 * Extract structured insurance fields from raw OCR text using multiple strategies.
 * Strategy priority (highest confidence first):
 *   1. Explicit label + value pattern
 *   2. Label on one line, value on next line
 *   3. Positional / contextual pattern
 *   4. Keyword inference
 *   5. Broad fallback (only for numeric fields)
 */
function parseOcrText(rawText: string): ExtractedData {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const t = rawText.replace(/\r?\n/g, " ").replace(/\s{2,}/g, " ");
    const result: ExtractedData = {};

    // --- Country Mapping & Setup ---
    const COUNTRY_MAP: Record<string, string> = {
        "Tanzania": "Tanzania", "TZ": "Tanzania", "TANZANIA": "Tanzania",
        "Kenya": "Kenya", "KE": "Kenya", "KENYA": "Kenya",
        "Uganda": "Uganda", "UG": "Uganda",
        "Rwanda": "Rwanda", "RW": "Rwanda",
        "Burundi": "Burundi", "BI": "Burundi",
        "Ethiopia": "Ethiopia", "ET": "Ethiopia",
        "Mozambique": "Mozambique", "MZ": "Mozambique",
        "Zambia": "Zambia", "ZM": "Zambia",
        "South Africa": "South Africa", "ZA": "South Africa", "RSA": "South Africa",
        "China": "China", "PRC": "China", "CN": "China", "CHINA": "China",
        "India": "India", "IN": "India", "INDIA": "India",
        "Japan": "Japan", "JP": "Japan",
        "Germany": "Germany", "DE": "Germany",
        "United States": "United States", "USA": "United States", "US": "United States", "UNITED STATES": "United States",
        "United Kingdom": "United Kingdom", "UK": "United Kingdom", "GB": "United Kingdom",
        "UAE": "United Arab Emirates", "United Arab Emirates": "United Arab Emirates", "AE": "United Arab Emirates",
        "Singapore": "Singapore", "SG": "Singapore",
        "Netherlands": "Netherlands", "NL": "Netherlands", "Holland": "Netherlands",
        "Belgium": "Belgium", "BE": "Belgium",
        "France": "France", "FR": "France",
        "Italy": "Italy", "IT": "Italy",
        "Turkey": "Turkey", "TR": "Turkey",
        "Pakistan": "Pakistan", "PK": "Pakistan",
        "Bangladesh": "Bangladesh", "BD": "Bangladesh",
        "Vietnam": "Vietnam", "VN": "Vietnam",
        "Malaysia": "Malaysia", "MY": "Malaysia",
        "Indonesia": "Indonesia", "ID": "Indonesia",
        "Australia": "Australia", "AUSTRALIA": "Australia", "AU": "Australia"
    };

    const resolveCountry = (rawVal: string | null): string | undefined => {
        if (!rawVal) return undefined;
        const clean = cleanValue(rawVal).split(/[,/]/)[0].trim();
        for (const countryKey of Object.keys(COUNTRY_MAP)) {
            const regex = new RegExp(`\\b${countryKey}\\b`, 'i');
            if (regex.test(clean)) {
                return COUNTRY_MAP[countryKey];
            }
        }
        return clean;
    };

    // --- Origin Country ---
    const originCountryVal = findValidMatch(t, [
        /(?:country\s+of\s+(?:origin|manufacture|export|exportation)|origin\s+country|exporting\s+country)\s*[:\-]?\s*([A-Za-z][A-Za-z ]{2,30})/i,
        /(?:shipper(?:'s)?\s+country|seller(?:'s)?\s+country|from\s+country)\s*[:\-]\s*([A-Za-z][A-Za-z ]{2,30})/i,
    ], "originCountry");
    if (originCountryVal) {
        result.originCountry = resolveCountry(originCountryVal);
    }

    // --- Destination Country ---
    const destCountryVal = findValidMatch(t, [
        /(?:country\s+of\s+(?:ultimate\s+)?destination|destination\s+country|importing\s+country)\s*[:\-]?\s*([A-Za-z][A-Za-z ]{2,30})/i,
        /(?:consignee(?:'s)?\s+country|buyer(?:'s)?\s+country|to\s+country)\s*[:\-]\s*([A-Za-z][A-Za-z ]{2,30})/i,
    ], "destinationCountry");
    if (destCountryVal) {
        result.destinationCountry = resolveCountry(destCountryVal);
    }

    // 1. INCOTERM
    const incotermVal = findValidMatch(t, [
        /\bINCOTERM[S]?\s*[:\-]?\s*(CIF|CFR|CIP|CPT|DAP|DDP|DPU|EXW|FAS|FCA|FOB)\b/i,
        /\bTRADE\s*TERM[S]?\s*[:\-]?\s*(CIF|CFR|CIP|CPT|DAP|DDP|DPU|EXW|FAS|FCA|FOB)\b/i,
        /\b(CIF|CFR|CIP|CPT|DAP|DDP|DPU|EXW|FAS|FCA|FOB)\s+\w/i,
    ], "incoterm");
    if (incotermVal) {
        result.incoterm = incotermVal.toUpperCase();
    } else {
        const m = t.match(/\b(O?FOB|CIF|CFR|CIP|CPT|DAP|DDP|DPU|EXW|FAS|FCA)\b/i);
        if (m) {
            const val = m[1].toUpperCase();
            result.incoterm = val === "OFOB" ? "FOB" : val;
        }
    }

    // 2. CURRENCY
    const currencyPatterns: RegExp[] = [
        /\bCURRENCY\s*[:\-]?\s*(USD|TZS|TZH|TSH|EUR|GBP|CNY|INR|AED)\b/i,
        /\bCURR\s*[:\-]?\s*(USD|TZS|TZH|TSH|EUR|GBP)\b/i,
        /\b(USD|TZS|TZH|TSH|EUR|GBP|CNY|INR|AED)\b/,
    ];
    const currRaw = findValidMatch(t, currencyPatterns, "currency");
    if (currRaw) {
        const norm = currRaw.toUpperCase();
        result.currency = (norm === "TSH" || norm === "TZH") ? "TZS" : norm;
    } else if (/\bTsh\b|\bTSH\b|\bTZS\b/i.test(t)) {
        result.currency = "TZS";
    } else if (t.includes("$")) {
        result.currency = "USD";
    } else if (t.includes("€")) {
        result.currency = "EUR";
    } else if (t.includes("£")) {
        result.currency = "GBP";
    } else if (result.originCountry === "United States") {
        result.currency = "USD";
    }

    // --- Try Table / Line Item parsing ---
    let tableParsed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineItemRegex = /\b(Box|Carton|Pallet|Case|Bag|Pkg|Ctn|Container|Pcs|Piec)s?\s+([A-Za-z0-9%\s'\-]{5,100})\s+(?:\[?\s*(\d+)\s*\|?\s*([A-Za-z]{2,6})\s*\|?\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?))/i;
        const match = line.match(lineItemRegex);
        if (match) {
            const packType = match[1];
            let desc = match[2].trim();
            const qty = match[3];
            const unit = match[4];
            const weight = match[5];
            const unitVal = match[6];
            const totalVal = match[7];

            const pLower = packType.toLowerCase();
            if (/container/i.test(pLower)) result.packagingMethod = "Containers";
            else if (/pallet/i.test(pLower)) result.packagingMethod = "Pallets";
            else if (/carton|box|case/i.test(pLower)) result.packagingMethod = "Cartons";
            else if (/bag/i.test(pLower)) result.packagingMethod = "Bags";
            else result.packagingMethod = "Other";

            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (
                    nextLine.length > 0 &&
                    !nextLine.includes("TOTAL") &&
                    !nextLine.includes("SIGNATURE") &&
                    !nextLine.includes("DATE") &&
                    !/\b\d{4}\b/.test(nextLine) &&
                    !/\b(Box|Carton|Pallet|Case|Bag|Pkg|Ctn|Container|Pcs|Piec)s?\b/i.test(nextLine)
                ) {
                    const cleanNext = nextLine.replace(/\b(es|pcs|pieces|pcs)\b/gi, "").trim();
                    desc = `${desc} ${cleanNext}`;
                }
            }

            result.cargoDescription = desc.replace(/\s+/g, " ").trim();
            result.totalWeight = weight.replace(/,/g, "");
            result.weightUnit = "KG";
            result.invoiceValue = totalVal.replace(/,/g, "");
            tableParsed = true;
            break;
        }
    }

    // 3. INVOICE VALUE (fallback)
    if (!result.invoiceValue) {
        const currencySym = result.currency ?? "";
        const invoiceValRaw = findValidMatch(t, [
            new RegExp(`(?:total\\s+)?invoice\\s+(?:value|amount)\\s*[:\\-]?\\s*(?:${currencySym}|USD|TZS|EUR|GBP|\\$)?\\s*([\\d,]+(?:\\.\\d{1,2})?)`, "i"),
            /(?:total\\s+)?invoice\\s+(?:value|amount|no\.|number)?\s*[:\-]\s*(?:USD|TZS|EUR|GBP|\$|Tsh)?\s*([\d,]+(?:\.\d{1,2})?)/i,
            /(?:amount\\s+(?:in\\s+words|payable|due)|total\\s+amount)\\s*[:\-]\\s*(?:USD|TZS|EUR|GBP|\\$|Tsh)?\\s*([\\d,]+(?:\\.\\d{1,2})?)/i,
            /(?:USD|TZS|EUR|GBP|Tsh|\$|€|£)\s*([\d,]{4,}(?:\.\d{1,2})?)/i,
            /\bvalue\s*[:\-]\s*([\d,]{4,}(?:\.\d{1,2})?)/i,
        ], "invoiceValue");
        if (invoiceValRaw) {
            const cleaned = invoiceValRaw.replace(/,/g, "");
            const num = parseFloat(cleaned);
            if (!isNaN(num) && num > 0) {
                result.invoiceValue = cleaned;
            }
        }
    }

    // 4. CARGO DESCRIPTION (fallback)
    if (!result.cargoDescription) {
        const descVal = findValidMatch(t, [
            /(?:description\s+of\s+goods?|goods?\s+description|description)[:\s]+([A-Za-z][^.]{10,150})/i,
            /(?:cargo\s+description|nature\s+of\s+cargo|cargo\s+details?)[:\s]+([A-Za-z][^.]{5,150})/i,
            /(?:commodity|product\s+name|item\s+description)[:\s]+([A-Za-z][^.]{5,120})/i,
            /(?:particulars\s+of\s+goods?)[:\s]+([A-Za-z][^.]{5,120})/i,
        ], "cargoDescription");
        if (descVal) {
            result.cargoDescription = cleanValue(descVal).substring(0, 200);
        }

        if (!result.cargoDescription) {
            const lv = findLabelValue(lines, /^(?:description\s+of\s+goods?|goods?\s+description|commodity|cargo\s+description)$/i);
            if (lv && isValidValue(lv, "cargoDescription")) {
                result.cargoDescription = cleanValue(lv).substring(0, 200);
            }
        }
    }

    // 5. CARGO NATURE
    const cargoNatureKeywords: Array<[RegExp, ExtractedData["cargoNature"]]> = [
        [/\bhazardous|dangerous\s+goods?|DG\s+cargo|IMDG|explosive|flammable\b/i, "Hazardous"],
        [/\bperishable|refrigerated?|frozen|chilled|temperature.sensitive|cold.chain\b/i, "Perishable"],
        [/\bfragile|breakable|glass|ceramic|delicate|electronic.+goods\b/i, "Fragile"],
        [/\bbulk\s+cargo|loose\s+bulk|grain|ore\s+cargo|liquid\s+bulk\b/i, "Bulk"],
    ];
    let cargoNatureFound = false;
    for (const [pattern, nature] of cargoNatureKeywords) {
        if (pattern.test(t)) { result.cargoNature = nature; cargoNatureFound = true; break; }
    }
    if (!cargoNatureFound) result.cargoNature = "General";

    // 6. PACKAGING METHOD (fallback)
    if (!result.packagingMethod) {
        const packagingKeywords: Array<[RegExp, ExtractedData["packagingMethod"]]> = [
            [/\b(?:20|40)\s*(?:ft|foot|feet)?\s*container|FCL|LCL|containerized\b/i, "Containers"],
            [/\bpallets?|skids?\b/i, "Pallets"],
            [/\bcartons?|boxes?|cases?|ctn\b/i, "Cartons"],
            [/\bbags?|sacks?|pp\s*bag\b/i, "Bags"],
            [/\bdrums?|barrels?|IBCs?\b/i, "Other"],
        ];
        const packLabelVal = findValidMatch(t, [
            /(?:pack(?:aging)?\s*(?:method|type|mode|form)?)\s*[:\-]\s*([A-Za-z][A-Za-z ]{2,30})/i,
            /(?:no\.\s*of\s*packages?|packages?)\s*[:\-]\s*\d+\s+([A-Za-z]{3,30})/i,
        ], "packagingMethod");
        if (packLabelVal) {
            const pv = packLabelVal.toLowerCase();
            if (/container/i.test(pv)) result.packagingMethod = "Containers";
            else if (/pallet/i.test(pv)) result.packagingMethod = "Pallets";
            else if (/carton|box|case/i.test(pv)) result.packagingMethod = "Cartons";
            else if (/bag/i.test(pv)) result.packagingMethod = "Bags";
            else result.packagingMethod = "Other";
        }
        if (!result.packagingMethod) {
            for (const [pattern, method] of packagingKeywords) {
                if (pattern.test(t)) { result.packagingMethod = method; break; }
            }
        }
    }

    // 7. WEIGHT (fallback)
    if (!result.totalWeight) {
        const weightVal = findValidMatch(t, [
            /(?:gross\s*weight|GW)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(KGS?|KG|MT|M\.?T|TONS?|LBS?)/i,
            /(?:net\s*weight|NW)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(KGS?|KG|MT|M\.?T|TONS?|LBS?)/i,
            /(?:total\s*weight|weight)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(KGS?|KG|MT|M\.?T|TONS?)/i,
            /\bW\/T\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(MT|TONS?|KG)/i,
        ], "totalWeight");
        if (weightVal) {
            const fullWeightMatch = t.match(
                /(?:gross\s*weight|net\s*weight|total\s*weight|weight|GW|NW|W\/T)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(KGS?|KG|MT|M\.?T|TONS?|LBS?)/i
            );
            if (fullWeightMatch) {
                result.totalWeight = fullWeightMatch[1].replace(/,/g, "");
                result.weightUnit = /MT|M\.?T|TONS?/i.test(fullWeightMatch[2]) ? "TONS" : "KG";
            }
        }
    }

    // 8. TRANSPORT MODE
    const transportKeywords: Array<[RegExp, ExtractedData["transportMode"]]> = [
        [/\b(?:air\s*waybill|AWB|flight|by\s+air|airfreight)\b/i, "Air"],
        [/\b(?:bill\s+of\s+lading|B\/L|BL|ocean|by\s+sea|sea\s+freight|marine\s+cargo|ocean\s+freight|vessel)\b/i, "Sea"],
        [/\b(?:CMR|road\s+transport|by\s+road|truck|lorry|road\s+freight)\b/i, "Road"],
        [/\b(?:rail|by\s+rail|railway|train\s+freight)\b/i, "Rail"],
        [/\b(?:multimodal|combined\s+transport|intermodal)\b/i, "Multimodal"],
    ];
    const modeLabel = findValidMatch(t, [
        /(?:mode\s+of\s+transport|transport\s+mode|means\s+of\s+transport)\s*[:\-]\s*([A-Za-z ]{2,30})/i,
        /(?:transport(?:ation)?\s+by)\s*[:\-]?\s*([A-Za-z ]{2,20})/i,
    ], "transportMode");
    if (modeLabel) {
        const ml = modeLabel.toLowerCase();
        if (/air|flight|AWB/i.test(ml)) result.transportMode = "Air";
        else if (/sea|ocean|vessel|B\/L|marine/i.test(ml)) result.transportMode = "Sea";
        else if (/road|truck|lorry/i.test(ml)) result.transportMode = "Road";
        else if (/rail|train/i.test(ml)) result.transportMode = "Rail";
        else if (/multi/i.test(ml)) result.transportMode = "Multimodal";
    }
    if (!result.transportMode) {
        for (const [pattern, mode] of transportKeywords) {
            if (pattern.test(t)) { result.transportMode = mode; break; }
        }
    }

    // 9. VESSEL / FLIGHT NAME
    const vesselVal = findValidMatch(t, [
        /(?:vessel(?:'s)?\s*name|name\s+of\s+vessel|ship(?:'s)?\s*name|M\.?V\.?|S\.?S\.?)\s*[:\-]?\s*([A-Z][A-Za-z0-9 _\-]{2,50})/i,
        /(?:flight\s*(?:no\.?|number|#)?)\s*[:\-]?\s*([A-Z]{2}\s*\d{3,4}[A-Z]?)/i,
        /(?:vessel|flight)\s*[:\-]\s*([A-Za-z0-9 _\-]{3,50})/i,
    ], "vesselName");
    if (vesselVal) {
        result.vesselName = cleanValue(vesselVal);
    }

    // 10. CARRIER NAME
    const carrierVal = findValidMatch(t, [
        /(?:carrier|shipping\s+(?:company|line|agent)|ocean\s+carrier|airline|ocean\s+liner)\s*[:\-]\s*([A-Za-z][A-Za-z0-9 ,&.'()\-]{3,60})/i,
        /(?:shipped\s+by|transported\s+by|carried\s+by)\s*[:\-]?\s*([A-Za-z][A-Za-z0-9 ,&.'()\-]{3,60})/i,
        /(?:issuing\s+carrier|carrier\s+name)\s*[:\-]\s*([A-Za-z][A-Za-z0-9 ,&.'()\-]{3,60})/i,
    ], "carrierName");
    if (carrierVal) {
        result.carrierName = cleanValue(carrierVal).substring(0, 80);
    }

    // 11. ORIGIN PORT
    const originPortVal = findValidMatch(t, [
        /(?:port\s+of\s+(?:loading|origin|departure|export)|loading\s+port|load\s+port|place\s+of\s+(?:receipt|loading))\s*[:\-]\s*([A-Za-z][A-Za-z ,-]{2,50})/i,
        /(?:from\s+port|origin\s+port|departure\s+port)\s*[:\-]\s*([A-Za-z][A-Za-z ,-]{2,50})/i,
        /(?:shipped\s+from|loaded\s+at|laden\s+at)\s*[:\-]?\s*(?:port\s+of\s+)?([A-Za-z][A-Za-z ,]{2,40})/i,
    ], "originPort");
    if (originPortVal) {
        result.originPort = cleanValue(originPortVal).replace(/\s+(port|harbour)$/i, "");
    }

    // 12. DESTINATION PORT
    const destPortVal = findValidMatch(t, [
        /(?:port\s+of\s+(?:discharge|delivery|destination|import)|discharge\s+port|destination\s+port|place\s+of\s+delivery)\s*[:\-]\s*([A-Za-z][A-Za-z ,-]{2,50})/i,
        /(?:to\s+port|destination\s+port|arrival\s+port)\s*[:\-]\s*([A-Za-z][A-Za-z ,-]{2,50})/i,
        /(?:discharged\s+at|delivered\s+to)\s*[:\-]?\s*(?:port\s+of\s+)?([A-Za-z][A-Za-z ,]{2,40})/i,
    ], "destinationPort");
    if (destPortVal) {
        result.destinationPort = cleanValue(destPortVal).replace(/\s+(port|harbour)$/i, "");
    }

    if (!result.originCountry && result.originPort) {
        const portLower = result.originPort.toLowerCase();
        if (/shanghai|beijing|guangzhou|shenzhen|tianjin|qingdao|ningbo/.test(portLower)) result.originCountry = "China";
        else if (/mumbai|nhava|chennai|kolkata|mundra/.test(portLower)) result.originCountry = "India";
        else if (/dubai|jebel\s*ali/.test(portLower)) result.originCountry = "United Arab Emirates";
        else if (/singapore/.test(portLower)) result.originCountry = "Singapore";
        else if (/rotterdam|amsterdam/.test(portLower)) result.originCountry = "Netherlands";
        else if (/hamburg|bremen/.test(portLower)) result.originCountry = "Germany";
        else if (/mombasa/.test(portLower)) result.originCountry = "Kenya";
        else if (/dar\s*es\s*salaam|zanzibar|tanga/.test(portLower)) result.originCountry = "Tanzania";
    }
    if (!result.destinationCountry && result.destinationPort) {
        const portLower = result.destinationPort.toLowerCase();
        if (/dar\s*es\s*salaam|zanzibar|tanga|mtwara/.test(portLower)) result.destinationCountry = "Tanzania";
        else if (/mombasa/.test(portLower)) result.destinationCountry = "Kenya";
        else if (/shanghai|guangzhou|shenzhen/.test(portLower)) result.destinationCountry = "China";
        else if (/dubai|jebel\s*ali/.test(portLower)) result.destinationCountry = "United Arab Emirates";
    }

    // 15. DISPATCH / SHIPMENT DATE
    const datePatterns: RegExp[] = [
        /(?:date\s+of\s+(?:exportation|export|shipment|departure|issue|loading)|shipment\s+date|dispatch\s+date|invoice\s+date|date\s+of\s+invoice)\b(?:[\s\w()#.,:;/\-]{0,120})?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(?:date\s+of\s+(?:shipment|departure|issue|loading)|shipment\s+date|date\s+of\s+b\/?l|on\s+board\s+date|b\/l\s+date|bl\s+date)\s*[:\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(?:invoice\s+date|date\s+of\s+invoice|issued\s+(?:on|date))\s*[:\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(?:shipped\s+on\s+board|loaded\s+on\s+board|dispatch\s+date|departure\s+date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(?:date)\s*[:\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(?:date)[:\s]+(\d{4}[\/\-]\d{2}[\/\-]\d{2})/i,
        /(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i,
    ];

    const MONTH_MAP: Record<string, string> = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };

    for (const pattern of datePatterns) {
        const m = t.match(pattern);
        if (!m) continue;

        if (m[3] && /\d{4}/.test(m[3])) {
            const day = m[1].padStart(2, "0");
            const monthKey = m[2].toLowerCase().substring(0, 3);
            const month = MONTH_MAP[monthKey] ?? "01";
            result.dispatchDate = `${m[3]}-${month}-${day}`;
            break;
        }

        const raw = m[1];
        const parts = raw.split(/[\/\-\.]/);
        if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) {
                year = `20${year}`;
            }

            let month = parts[0];
            let day = parts[1];

            const p0 = parseInt(parts[0], 10);
            const p1 = parseInt(parts[1], 10);

            if (p0 > 12) {
                day = parts[0];
                month = parts[1];
            } else if (p1 > 12) {
                month = parts[0];
                day = parts[1];
            } else if (result.originCountry === "United States") {
                month = parts[0];
                day = parts[1];
            } else {
                day = parts[0];
                month = parts[1];
            }

            result.dispatchDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            break;
        }
    }

    return result;
}

// ─── Main Component ───────────────────────────────────────────────


export default function DocumentUploadStep({
    onExtracted,
    onSkip,
}: DocumentUploadStepProps) {
    const [selectedDocType, setSelectedDocType] = useState<string>("invoice");
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractionStage, setExtractionStage] = useState<string>("");
    const [ocrProgress, setOcrProgress] = useState<number>(0);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [rawText, setRawText] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── File handling ──────────────────────────────────────────────

    const handleFile = useCallback((incoming: File | null) => {
        if (!incoming) return;

        if (!ACCEPTED_MIME.includes(incoming.type)) {
            setError("Unsupported file type. Please upload a PDF, JPG, PNG, or WebP.");
            return;
        }
        if (incoming.size > 20 * 1024 * 1024) {
            setError("File is too large. Maximum size is 20 MB.");
            return;
        }

        setError(null);
        setExtracted(null);
        setRawText("");
        setFile(incoming);

        if (incoming.type.startsWith("image/")) {
            setFilePreviewUrl(URL.createObjectURL(incoming));
        } else {
            setFilePreviewUrl(null);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0] ?? null);
        },
        [handleFile]
    );

    const clearFile = () => {
        setFile(null);
        setFilePreviewUrl(null);
        setExtracted(null);
        setRawText("");
        setError(null);
        setOcrProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── OCR extraction ─────────────────────────────────────────────

    const extractData = async () => {
        if (!file) return;

        setExtracting(true);
        setError(null);
        setExtracted(null);
        setOcrProgress(0);

        const updateStage = (msg: string) => {
            setExtractionStage(msg);
            // crude progress tracking based on stage keywords
            if (msg.includes("Loading OCR")) setOcrProgress(10);
            else if (msg.includes("Rendering")) setOcrProgress(25);
            else if (msg.includes("Running OCR")) setOcrProgress(40);
            else if (msg.includes("Scanning")) {
                const pct = parseInt(msg.match(/(\d+)%/)?.[1] ?? "0");
                setOcrProgress(40 + Math.round(pct * 0.45));
            } else if (msg.includes("Mapping")) setOcrProgress(92);
        };

        try {
            let combinedText = "";

            if (file.type === "application/pdf") {
                // ── PDF path ──────────────────────────────
                const canvases = await pdfToCanvases(file, updateStage);
                const texts: string[] = [];
                for (let i = 0; i < canvases.length; i++) {
                    updateStage(`Scanning page ${i + 1} of ${canvases.length}...`);
                    const pageText = await runTesseract(canvases[i], updateStage);
                    texts.push(pageText);
                }
                combinedText = texts.join("\n\n");
            } else {
                // ── Image path ────────────────────────────
                const imageUrl = URL.createObjectURL(file);
                combinedText = await runTesseract(imageUrl, updateStage);
                URL.revokeObjectURL(imageUrl);
            }

            setRawText(combinedText);

            updateStage("Mapping fields...");
            const parsed = parseOcrText(combinedText);
            setOcrProgress(100);
            setExtracted(parsed);
        } catch (err: any) {
            console.error("OCR error:", err);
            setError(
                err.message ?? "OCR extraction failed. You can skip and fill in manually."
            );
        } finally {
            setExtracting(false);
            setExtractionStage("");
        }
    };

    // ── Helpers ────────────────────────────────────────────────────

    const filledFieldCount = extracted
        ? Object.values(extracted).filter(Boolean).length
        : 0;

    // ── Render ─────────────────────────────────────────────────────

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-slate-100 pb-5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-brand-green" />
                    Auto-fill from Document
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1.5">
                    Upload your shipping document and we'll scan and extract the details for you.
                    You can review and edit everything before submitting.
                </p>
            </div>

            {/* Document type selector */}
            <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Document Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DOC_TYPES.map((dt) => {
                        const Icon = dt.icon;
                        const active = selectedDocType === dt.id;
                        return (
                            <button
                                key={dt.id}
                                type="button"
                                onClick={() => setSelectedDocType(dt.id)}
                                className={cn(
                                    "relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                                    active
                                        ? `${dt.bg} ${dt.border} ring-1 ring-brand-green/5 shadow-md shadow-brand-green/5`
                                        : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-350 hover:shadow-md"
                                )}
                            >
                                <div className={cn("w-8.5 h-8.5 rounded-xl flex items-center justify-center mb-3 border transition-all duration-300", active ? `${dt.bg} ${dt.border} scale-110` : "bg-white border-slate-200 text-slate-400")}>
                                    <Icon className={cn("w-4.5 h-4.5", active ? dt.color : "text-slate-400")} />
                                </div>
                                <p className={cn("text-xs font-bold leading-snug", active ? `${dt.color} font-extrabold` : "text-slate-700")}>
                                    {dt.label}
                                </p>
                                <p className="text-[10px] text-slate-450 font-medium mt-1 leading-relaxed">
                                    {dt.desc}
                                </p>
                                {active && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-green shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Drop zone */}
            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-350 group overflow-hidden",
                        isDragging
                            ? "border-brand-green bg-emerald-50/10 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                            : "border-slate-200/80 hover:border-slate-350 bg-slate-50/40 hover:bg-white hover:shadow-md"
                    )}
                >
                    {isDragging && (
                        <div className="absolute inset-0 bg-brand-green/2 pointer-events-none animate-pulse" />
                    )}
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-sm",
                        isDragging 
                            ? "bg-brand-green/10 border-brand-green/30 text-brand-green scale-110 shadow-emerald-100" 
                            : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-350 group-hover:text-brand-green group-hover:scale-105 group-hover:shadow-sm"
                    )}>
                        <Upload className={cn("w-6 h-6", !isDragging && "group-hover:animate-bounce")} />
                    </div>
                    <div className="text-center z-10">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-800">
                            Drop your document here
                        </p>
                        <p className="text-xs text-slate-450 font-medium mt-1">
                            or <span className="text-brand-green font-bold underline underline-offset-2 group-hover:text-emerald-600">browse files</span>
                            {" "}— PDF, JPG, PNG, WebP up to 20 MB
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />
                </div>
            ) : (
                /* File preview card */
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
                    {/* Preview area */}
                    <div className="relative">
                        {filePreviewUrl ? (
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                                <img
                                    src={filePreviewUrl}
                                    alt="Document preview"
                                    className="w-full h-full object-cover object-top"
                                />
                                {extracting && <ScanOverlay stage={extractionStage} progress={ocrProgress} />}
                                {extracted && !extracting && (
                                    <div className="absolute inset-0 bg-brand-green/10 flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md">
                                            <CheckCircle2 className="w-4 h-4 text-brand-green" />
                                            <span className="text-xs font-bold text-brand-green">
                                                {filledFieldCount} fields extracted
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative h-28 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                    <FileImage className="w-8 h-8 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-600 truncate max-w-[200px]">
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                            {(file.size / 1024).toFixed(0)} KB • PDF Document
                                        </p>
                                    </div>
                                </div>
                                {extracting && <ScanOverlay stage={extractionStage} progress={ocrProgress} />}
                                {extracted && !extracting && (
                                    <div className="absolute inset-0 bg-brand-green/10 flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md">
                                            <CheckCircle2 className="w-4 h-4 text-brand-green" />
                                            <span className="text-xs font-bold text-brand-green">
                                                {filledFieldCount} fields extracted
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Progress bar when extracting */}
                    {extracting && (
                        <div className="h-1 bg-slate-100">
                            <div
                                className="h-full bg-brand-green transition-all duration-500 ease-out"
                                style={{ width: `${ocrProgress}%` }}
                            />
                        </div>
                    )}

                    {/* File meta + actions */}
                    <div className="p-4 flex items-center justify-between gap-3 border-t border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    {(file.size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={clearFile}
                            disabled={extracting}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-all disabled:opacity-40 flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200/60 rounded-2xl">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-rose-700 leading-snug">{error}</p>
                </div>
            )}

            {/* Extracted fields preview */}
            {extracted && !extracting && (
                <ExtractedPreview data={extracted} rawText={rawText} />
            )}

            {/* Actions */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onSkip}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                    <SkipForward className="w-4 h-4" />
                    Skip, fill manually
                </button>

                <div className="flex items-center gap-2.5">
                    {file && !extracted && (
                        <button
                            type="button"
                            onClick={extractData}
                            disabled={extracting}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            {extracting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {extractionStage || "Scanning..."}
                                </>
                            ) : (
                                <>
                                    <ScanLine className="w-4 h-4" />
                                    Scan & Extract
                                </>
                            )}
                        </button>
                    )}

                    {extracted && (
                        <button
                            type="button"
                            onClick={() => onExtracted(extracted)}
                            className="px-6 py-3 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            Use extracted data
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScanOverlay({ stage, progress }: { stage: string; progress: number }) {
    return (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 overflow-hidden select-none">
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            {/* Laser Line */}
            <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981,0_0_5px_#10b981] animate-[sweep_2.5s_ease-in-out_infinite] z-10" />
            
            {/* Laser Glow Area */}
            <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-emerald-500/10 to-transparent animate-[sweep_glow_2.5s_ease-in-out_infinite] pointer-events-none" />

            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.15)] z-20">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-xs font-black text-emerald-100 tracking-wide uppercase">{stage || "Scanning..."}</span>
            </div>
            
            {/* Progress indicator badge */}
            {progress > 0 && (
                <div className="bg-slate-900/80 border border-slate-700/50 px-2 py-1 rounded-lg z-20">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{progress}% scanned</span>
                </div>
            )}
            
            {/* Inject scan keyframe once */}
            <style>{`
                @keyframes sweep {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                }
                @keyframes sweep_glow {
                    0% { top: -64px; opacity: 0; }
                    25% { opacity: 1; }
                    50% { top: 100%; opacity: 0; }
                    75% { opacity: 1; }
                    100% { top: -64px; opacity: 0; }
                }
            `}</style>
        </div>
    );
}

// ─── Extracted fields preview ──────────────────────────────────────

const FIELD_LABELS: Record<keyof ExtractedData, string> = {
    incoterm: "Incoterm",
    cargoDescription: "Cargo Description",
    cargoNature: "Cargo Nature",
    packagingMethod: "Packaging",
    totalWeight: "Weight",
    weightUnit: "Weight Unit",
    originCountry: "Origin Country",
    originPort: "Origin Port",
    destinationCountry: "Destination Country",
    destinationPort: "Destination Port",
    transportMode: "Transport Mode",
    dispatchDate: "Dispatch Date",
    vesselName: "Vessel Name",
    carrierName: "Carrier",
    invoiceValue: "Invoice Value",
    currency: "Currency",
};

function ExtractedPreview({ data, rawText }: { data: ExtractedData; rawText: string }) {
    const [showRaw, setShowRaw] = useState(false);
    const entries = Object.entries(data).filter(([, v]) => v) as [
        keyof ExtractedData,
        string
    ][];

    return (
        <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-green flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-extrabold text-emerald-800">
                            Scan complete — {entries.length} fields found
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            Review below, then click "Use extracted data" to auto-fill the form.
                        </p>
                    </div>
                </div>
                {rawText && (
                    <button
                        type="button"
                        onClick={() => setShowRaw(!showRaw)}
                        className="text-[10px] font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-700 flex-shrink-0"
                    >
                        {showRaw ? "Hide" : "View"} raw text
                    </button>
                )}
            </div>

            {entries.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {entries.map(([key, value]) => (
                        <div key={key} className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/70 block leading-none">
                                {FIELD_LABELS[key] ?? key}
                            </span>
                            <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 py-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs text-emerald-700 font-medium">
                        No structured fields could be parsed automatically.
                        You can view the raw text and fill in manually.
                    </p>
                </div>
            )}

            {showRaw && rawText && (
                <div className="mt-2 bg-white/70 border border-emerald-200/40 rounded-xl p-3 max-h-40 overflow-y-auto">
                    <p className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                        {rawText}
                    </p>
                </div>
            )}
        </div>
    );
}
