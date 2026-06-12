// Define PolicyData explicitly to avoid dependency on potentially missing DB exports
export interface PolicyData {
    id?: string;
    name: string;
    code: string;
    clauseType: string;
    description?: string | null;
    isActive: boolean;
    cargoTypes?: string[] | null;
    transportModes?: string[] | null;
    incoterms?: string[] | null;
    geoScope: string;
    originPorts?: string[] | null;
    destinationPorts?: string[] | null;
    valuationBasis: string;
    minSumInsured?: number | null;
    maxSumInsured?: number | null;
    currency: string;
    rate: number;
    minPremium?: number | null;
    hazardLoading?: number | null;
    discount?: number | null;
    vat: number;
    additionalCovers?: { name: string; type: "Flat" | "Percentage"; amount: number }[] | null;
    startDate: string | Date;
    endDate?: string | Date | null;
    autoInvoice: boolean;
    autoIssue: boolean;
    manualApproval: boolean; // mapped to requiresManualApproval in API
    internalNotes?: string | null;
}

export const PolicyService = {
    getAll: async () => {
        const response = await fetch("/api/policies");
        if (!response.ok) throw new Error("Failed to fetch policies");
        return await response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`/api/policies/${id}`);
        if (!response.ok) throw new Error("Failed to fetch policy");
        return await response.json();
    },

    create: async (data: any) => {
        const response = await fetch("/api/policies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create policy");
        }
        return await response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`/api/policies/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update policy");
        return await response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`/api/policies/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete policy");
        }
        return await response.json();
    },

    toggleStatus: async (id: string, isActive: boolean) => {
        return PolicyService.update(id, { isActive });
    },

    getInsurerPolicies: async () => {
        const response = await fetch("/api/insurer/policies");
        if (!response.ok) throw new Error("Failed to fetch insurer policies");
        return await response.json();
    }
};
