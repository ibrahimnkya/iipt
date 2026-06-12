"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Settings as SettingsIcon,
    Save,
    Bell,
    Shield,
    Database,
    Mail,
    Globe,
    Lock,
    History,
    CreditCard,
    Cpu,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Building,
    Users,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const [settings, setSettings] = useState({
        siteName: "NIIS-T",
        siteEmail: "admin@niip.co.tz",
        enableNotifications: true,
        enableEmailAlerts: true,
        maintenanceMode: false,
        autoApproveOrders: false,
        defaultCurrency: "TZS",
        taxRate: 18,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        setTimeout(() => {
            setSaved(true);
            setLoading(false);
            setTimeout(() => setSaved(false), 3000);
        }, 1200);
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "general", label: "General", icon: Globe },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "system", label: "System", icon: Cpu },
        { id: "history", label: "History", icon: History },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                Admin - System Settings
                            </h1>
                            <p className="text-sm text-gray-600">
                                Configure platform settings and preferences
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {saved && (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Settings Saved</span>
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                                        activeTab === tab.id
                                            ? "bg-brand-green text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
                    {/* General Settings */}
                    {activeTab === "general" && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">General Settings</h2>
                                <p className="text-sm text-gray-600">
                                    Configure basic platform information and defaults
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Platform Name
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Support Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={settings.siteEmail}
                                                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Default Currency
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                value={settings.defaultCurrency}
                                                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="TZS">TZS - Tanzanian Shilling</option>
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            VAT Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.taxRate}
                                            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Settings</h2>
                                <p className="text-sm text-gray-600">
                                    Control how the system communicates with users
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div 
                                    onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                                    className={cn(
                                        "flex items-center justify-between p-5 rounded-lg border cursor-pointer transition-all",
                                        settings.enableNotifications 
                                            ? "bg-blue-50 border-blue-200" 
                                            : "bg-white border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center",
                                            settings.enableNotifications ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Push Notifications</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                In-app alerts for real-time events
                                            </p>
                                        </div>
                                    </div>
                                    <button className={cn(
                                        "w-11 h-6 rounded-full transition-all relative",
                                        settings.enableNotifications ? "bg-blue-600" : "bg-gray-300"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                            settings.enableNotifications ? "left-6" : "left-1"
                                        )} />
                                    </button>
                                </div>

                                <div 
                                    onClick={() => setSettings({ ...settings, enableEmailAlerts: !settings.enableEmailAlerts })}
                                    className={cn(
                                        "flex items-center justify-between p-5 rounded-lg border cursor-pointer transition-all",
                                        settings.enableEmailAlerts 
                                            ? "bg-blue-50 border-blue-200" 
                                            : "bg-white border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center",
                                            settings.enableEmailAlerts ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Email Alerts</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Automated email notifications and reports
                                            </p>
                                        </div>
                                    </div>
                                    <button className={cn(
                                        "w-11 h-6 rounded-full transition-all relative",
                                        settings.enableEmailAlerts ? "bg-blue-600" : "bg-gray-300"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                            settings.enableEmailAlerts ? "left-6" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === "security" && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">Security Settings</h2>
                                <p className="text-sm text-gray-600">
                                    Configure security and access controls
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Security Notice</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Changes to security settings may affect system access. Please review carefully before saving.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Enhanced security for admin accounts
                                            </p>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                            Configure
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">Password Policy</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Set requirements for user passwords
                                            </p>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                            Configure
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Settings */}
                    {activeTab === "system" && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">System Settings</h2>
                                <p className="text-sm text-gray-600">
                                    Critical system controls and automation
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className={cn(
                                    "p-5 rounded-lg border",
                                    settings.maintenanceMode 
                                        ? "bg-red-50 border-red-200" 
                                        : "bg-white border-gray-200"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center",
                                                settings.maintenanceMode ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"
                                            )}>
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Maintenance Mode</p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Temporarily disable public access
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                                settings.maintenanceMode 
                                                    ? "bg-red-600 text-white hover:bg-red-700" 
                                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            {settings.maintenanceMode ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setSettings({ ...settings, autoApproveOrders: !settings.autoApproveOrders })}
                                    className={cn(
                                        "flex items-center justify-between p-5 rounded-lg border cursor-pointer transition-all",
                                        settings.autoApproveOrders 
                                            ? "bg-emerald-50 border-emerald-200" 
                                            : "bg-white border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center",
                                            settings.autoApproveOrders ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Auto-Approve Orders</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Automatically approve verified partner orders
                                            </p>
                                        </div>
                                    </div>
                                    <button className={cn(
                                        "w-11 h-6 rounded-full transition-all relative",
                                        settings.autoApproveOrders ? "bg-emerald-600" : "bg-gray-300"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                            settings.autoApproveOrders ? "left-6" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History/Audit Log */}
                    {activeTab === "history" && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">Change History</h2>
                                <p className="text-sm text-gray-600">
                                    View recent configuration changes
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { action: "VAT rate updated to 18%", user: "Admin NIIS-T", time: "2 days ago" },
                                    { action: "Email alerts enabled", user: "Admin NIIS-T", time: "5 days ago" },
                                    { action: "Default currency changed to TZS", user: "System", time: "1 week ago" },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                <History className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    By {log.user} • {log.time}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                                            Verified
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Version Info */}
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center">
                                <Cpu className="w-6 h-6 text-brand-green" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">NIIS-T Version</p>
                                <p className="text-xl font-bold text-gray-900">2.4.0-pro</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">Environment</p>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Production
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}