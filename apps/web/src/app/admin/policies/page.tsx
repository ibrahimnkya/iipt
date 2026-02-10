"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Shield,
    Filter,
    ArrowUpDown,
    AlertCircle,
    ChevronDown,
    LayoutGrid,
    List,
    ArrowUpRight,
    TrendingUp,
    Percent,
    FileText,
    Eye
} from "lucide-react";
import { PolicyService } from "@/services/policyService";
import Link from "next/link";
import { toast } from "sonner";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "grid" | "list";
type SortOption = "name" | "rate-high" | "rate-low" | "newest";

export default function PoliciesPage() {
    const router = useRouter();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [sortBy, setSortBy] = useState<SortOption>("name");

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            setLoading(true);
            const data = await PolicyService.getAll();
            setPolicies(data);
        } catch (error) {
            toast.error("Failed to load policies");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this policy? This action cannot be undone.")) return;

        try {
            await PolicyService.delete(id);
            toast.success("Policy deleted successfully");
            loadPolicies();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete policy");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await PolicyService.toggleStatus(id, !currentStatus);
            toast.success(`Policy ${!currentStatus ? 'activated' : 'deactivated'}`);
            loadPolicies();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const statusFilters = [
        { id: "all", label: "All Policies", count: policies.length },
        { id: "active", label: "Active", count: policies.filter(p => p.isActive).length },
        { id: "inactive", label: "Inactive", count: policies.filter(p => !p.isActive).length },
    ];

    const sortPolicies = (policiesToSort: any[]) => {
        const sorted = [...policiesToSort];
        switch (sortBy) {
            case "name":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case "rate-high":
                return sorted.sort((a, b) => b.rate - a.rate);
            case "rate-low":
                return sorted.sort((a, b) => a.rate - b.rate);
            case "newest":
                return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            default:
                return sorted;
        }
    };

    const filteredPolicies = sortPolicies(
        policies.filter(policy => {
            const matchesSearch =
                policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                filterStatus === "all" ? true :
                filterStatus === "active" ? policy.isActive :
                !policy.isActive;

            return matchesSearch && matchesStatus;
        })
    );

    const stats = {
        total: policies.length,
        active: policies.filter(p => p.isActive).length,
        inactive: policies.filter(p => !p.isActive).length,
        avgRate: policies.length > 0 
            ? (policies.reduce((sum, p) => sum + p.rate, 0) / policies.length).toFixed(2)
            : "0.00",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading policies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Insurance Policies
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage insurance products, rates, and coverage options
                            </p>
                        </div>
                        <Link
                            href="/admin/policies/create"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Policy
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Policies</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-emerald-200 bg-emerald-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-700 font-medium">Active</p>
                                    <p className="text-xl font-bold text-emerald-900">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-700 font-medium">Inactive</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Percent className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Avg Rate</p>
                                    <p className="text-xl font-bold text-blue-900">{stats.avgRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Controls Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by policy name, code, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="rate-high">Highest Rate</option>
                                    <option value="rate-low">Lowest Rate</option>
                                    <option value="newest">Newest First</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded transition-all ${
                                        viewMode === "grid"
                                            ? "bg-white text-brand-green shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded transition-all ${
                                        viewMode === "list"
                                            ? "bg-white text-brand-green shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    title="List view"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setFilterStatus(filter.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        filterStatus === filter.id
                                            ? "bg-brand-green text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {filter.label}
                                    {filter.count > 0 && (
                                        <span className={`ml-1.5 ${
                                            filterStatus === filter.id ? "text-white/80" : "text-gray-500"
                                        }`}>
                                            ({filter.count})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Policies Content */}
                {filteredPolicies.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No policies found
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {searchTerm ? "Try adjusting your search query" : "Create your first insurance policy to get started"}
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/admin/policies/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green/90 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Policy
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredPolicies.map((policy) => (
                                    <div
                                        key={policy.id}
                                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                                    >
                                        {/* Card Header */}
                                        <div className="p-5 border-b border-gray-100">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        policy.isActive ? "bg-emerald-100" : "bg-gray-100"
                                                    }`}>
                                                        <Shield className={`w-5 h-5 ${
                                                            policy.isActive ? "text-emerald-600" : "text-gray-500"
                                                        }`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                                            {policy.name}
                                                        </h3>
                                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 font-mono">
                                                            {policy.code}
                                                        </div>
                                                    </div>
                                                </div>
                                                {policy.isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                                        <span className="text-xs font-semibold text-emerald-700">Active</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5" />
                                                        <span className="text-xs font-semibold text-gray-700">Inactive</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5">
                                            {/* Description */}
                                            {policy.description && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {policy.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Rate Display */}
                                            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                                                <p className="text-xs text-blue-700 font-medium mb-1">Premium Rate</p>
                                                <p className="text-3xl font-bold text-blue-900">
                                                    {policy.rate}<span className="text-lg">%</span>
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/admin/policies/${policy.id}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/policies/${policy.id}`} className="cursor-pointer">
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Policy
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(policy.id, policy.isActive)}
                                                            className="cursor-pointer"
                                                        >
                                                            {policy.isActive ? (
                                                                <>
                                                                    <XCircle className="w-4 h-4 mr-2 text-amber-600" />
                                                                    <span className="text-amber-700">Deactivate</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                                    <span className="text-green-700">Activate</span>
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(policy.id)}
                                                            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List/Table View */}
                        {viewMode === "list" && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Policy Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Code
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Rate
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredPolicies.map((policy) => (
                                                <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                                policy.isActive ? "bg-emerald-100" : "bg-gray-100"
                                                            }`}>
                                                                <Shield className={`w-4 h-4 ${
                                                                    policy.isActive ? "text-emerald-600" : "text-gray-500"
                                                                }`} />
                                                            </div>
                                                            <div className="font-semibold text-gray-900">{policy.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 font-mono">
                                                            {policy.code}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                                            {policy.description || "—"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 font-semibold text-blue-900 text-sm">
                                                            {policy.rate}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {policy.isActive ? (
                                                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                                                <span className="text-xs font-semibold text-emerald-700">Active</span>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5" />
                                                                <span className="text-xs font-semibold text-gray-700">Inactive</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/admin/policies/${policy.id}`}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                View
                                                                <ArrowUpRight className="w-3 h-3" />
                                                            </Link>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/admin/policies/${policy.id}`} className="cursor-pointer">
                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                            Edit Policy
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleToggleStatus(policy.id, policy.isActive)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {policy.isActive ? (
                                                                            <>
                                                                                <XCircle className="w-4 h-4 mr-2 text-amber-600" />
                                                                                <span className="text-amber-700">Deactivate</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                                                <span className="text-green-700">Activate</span>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(policy.id)}
                                                                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <p className="text-sm text-gray-600 text-right">
                                        Showing <span className="font-semibold text-gray-900">{filteredPolicies.length}</span> of{" "}
                                        <span className="font-semibold text-gray-900">{policies.length}</span> policies
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Results Footer */}
                        {searchTerm && (
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-sm text-brand-green font-medium hover:underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}