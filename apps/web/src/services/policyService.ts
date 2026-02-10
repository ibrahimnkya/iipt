
import { InsurancePolicy } from "@tiips/db"; // Assumption: type is available from db package or needs to be inferred

// Define a type if not strictly available from DB package in frontend
export interface PolicyData extends Partial<InsurancePolicy> {
    id?: string;
    // Add other fields as necessary if DB type is strict
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
        if (!response.ok) throw new Error("Failed to create policy");
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
    }
};
