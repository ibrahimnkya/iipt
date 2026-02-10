"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Users,
    Mail,
    Phone,
    Building,
    Shield,
    Search,
    Download,
    ChevronDown,
    LayoutGrid,
    List,
    UserCheck,
    Key,
    Ban,
    UserPlus,
    Contact,
    ArrowUpRight,
    Settings,
    CheckCircle,
    XCircle,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    phone: string;
    physicalAddress: string;
    brelaNumber: string;
    tinNumber: string;
    natureOfBusiness: string;
    createdAt: string;
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [activeRole, setActiveRole] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetchUsers();
        }
    }, [session]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const roleFilters = [
        { id: "all", label: "All Users", count: users.length },
        { id: "ADMIN", label: "Admins", count: users.filter(u => u.role === "ADMIN").length },
        { id: "USER", label: "Clients", count: users.filter(u => u.role === "USER").length },
    ];

    const sortUsers = (usersToSort: User[]) => {
        const sorted = [...usersToSort];
        switch (sortBy) {
            case "newest":
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case "oldest":
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case "name-asc":
                return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
            case "name-desc":
                return sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
            default:
                return sorted;
        }
    };

    const filteredUsers = sortUsers(
        users.filter((user) => {
            const matchesRole = activeRole === "all" || user.role === activeRole;
            const matchesSearch = 
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.tinNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.brelaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.natureOfBusiness && user.natureOfBusiness.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesRole && matchesSearch;
        })
    );

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === "ADMIN").length,
        clients: users.filter(u => u.role === "USER").length,
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading users...</p>
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
                                Admin - User Directory
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage user accounts and permissions
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm">
                                <UserPlus className="w-4 h-4" />
                                Invite Admin
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Users</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200 bg-purple-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-700 font-medium">Admins</p>
                                    <p className="text-xl font-bold text-purple-900">{stats.admins}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200 bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 font-medium">Clients</p>
                                    <p className="text-xl font-bold text-blue-900">{stats.clients}</p>
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
                                    placeholder="Search by name, email, TIN, or BRELA number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
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

                        {/* Role Filter Pills */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {roleFilters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveRole(filter.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        activeRole === filter.id
                                            ? "bg-brand-green text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {filter.label}
                                    {filter.count > 0 && (
                                        <span className={`ml-1.5 ${
                                            activeRole === filter.id ? "text-white/80" : "text-gray-500"
                                        }`}>
                                            ({filter.count})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Content */}
                {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No users found
                            </h3>
                            <p className="text-sm text-gray-600">
                                Try adjusting your filters or search query
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                                    >
                                        {/* Card Header */}
                                        <div className="p-5 border-b border-gray-100">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                        {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 mb-1">
                                                            {user.fullName}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border",
                                                    user.role === "ADMIN" 
                                                        ? "bg-purple-50 text-purple-700 border-purple-200" 
                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                )}>
                                                    {user.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5">
                                            {/* Registration Info */}
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 font-medium mb-2">Registration Info</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Contact className="w-3 h-3 text-blue-600" />
                                                        <span className="text-sm text-gray-900">TIN: {user.tinNumber}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">BRELA: {user.brelaNumber}</p>
                                                </div>
                                            </div>

                                            {/* Contact & Address */}
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 font-medium mb-2">Contact</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-gray-500" />
                                                        <span className="text-sm text-gray-900">{user.phone}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{user.physicalAddress}</p>
                                                </div>
                                            </div>

                                            {/* Business & Date */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Business Type</p>
                                                <p className="text-sm text-gray-900 mb-2">{user.natureOfBusiness || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">
                                                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                    <UserCheck className="w-4 h-4" />
                                                    Verify
                                                </button>
                                                <button className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                </button>
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
                                                    Identity
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Registration Info
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Contact & Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                                                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">
                                                                    {user.fullName}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Contact className="w-3 h-3 text-blue-600" />
                                                            <div className="font-medium text-gray-700 text-sm">
                                                                TIN: {user.tinNumber}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            BRELA: {user.brelaNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-700 text-sm truncate max-w-[200px]">
                                                            {user.physicalAddress}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {user.phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
                                                                user.role === "ADMIN" 
                                                                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                                            )}>
                                                                {user.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-2">
                                                            Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                                                                title="Verify Account"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Reset Password"
                                                            >
                                                                <Key className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Deactivate"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
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
                                        Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{" "}
                                        <span className="font-semibold text-gray-900">{users.length}</span> users
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Results Footer */}
                        {searchQuery && (
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setSearchQuery("")}
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