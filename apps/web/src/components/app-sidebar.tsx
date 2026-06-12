"use client";

import * as React from "react";
import {
    LayoutDashboard,
    Package,
    FileText,
    CreditCard,
    HelpCircle,
    Shield,
    Users,
    User2,
    BarChart3,
    LogOut,
    ChevronUp,
    ChevronRight,
    Menu,
    X,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAdmin = session?.user?.role === "ADMIN";
    const { openMobile, setOpenMobile } = useSidebar();

    const userNavItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Orders",
            url: "/dashboard/orders",
            icon: Package,
        },
        {
            title: "Invoices",
            url: "/dashboard/invoices",
            icon: FileText,
        },
        {
            title: "Payments",
            url: "/dashboard/payments",
            icon: CreditCard,
        },
    ];

    const adminNavItems = [
        {
            title: "Dashboard",
            url: "/admin",
            icon: LayoutDashboard,
        },
        {
            title: "Policies",
            url: "/admin/policies",
            icon: Shield,
        },
        {
            title: "Declarations",
            url: "/admin/declarations",
            icon: Package,
        },
        {
            title: "Invoices",
            url: "/admin/invoices",
            icon: FileText,
        },
        {
            title: "Payments",
            url: "/admin/payments",
            icon: CreditCard,
        },
        {
            title: "Insurers",
            url: "/admin/insurers",
            icon: Shield,
        },
        {
            title: "Reports",
            url: "/admin/reports",
            icon: BarChart3,
        },
        {
            title: "Users",
            url: "/admin/users",
            icon: Users,
        },
        {
            title: "Settings",
            url: "/admin/settings",
            icon: Settings,
        },
    ];

    const insurerNavItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "My Policies",
            url: "/dashboard/policies",
            icon: Shield,
        },
        {
            title: "Orders",
            url: "/dashboard/orders",
            icon: Package,
        },
        {
            title: "Reports",
            url: "/dashboard/reports",
            icon: BarChart3,
        },
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings,
        },
    ];

    const isActive = (url: string) => {
        if (url === "/dashboard" || url === "/admin") {
            return pathname === url;
        }

        if (url.includes('?')) {
            const [basePath, query] = url.split('?');
            return pathname === basePath && searchParams.toString().includes(query.split('=')[1] || query);
        }

        return pathname === url || pathname.startsWith(url + '/');
    };

    const closeMobileMenu = () => {
        setOpenMobile(false);
    };

    const handleLogout = async () => {
        closeMobileMenu();
        await signOut({ redirect: false });
        router.push("/login");
    };

    const navItems = isAdmin
        ? adminNavItems
        : session?.user?.role === "INSURER"
            ? insurerNavItems
            : userNavItems;

    return (
        <Sidebar
            collapsible="icon"
            {...props}
            className={cn(
                "floating-sidebar border-r border-gray-200/50 bg-[#0F172A]",
                props.className
            )}
        >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-brand-blue/10 to-transparent opacity-50 pointer-events-none rounded-2xl" />

                {/* Fixed Header */}
                <SidebarHeader className="relative z-10 px-3 pt-4 pb-3 flex-shrink-0">
                    <SidebarMenu>
                        <SidebarMenuItem className="flex items-center justify-between gap-2">
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="hover:bg-white/10 active:bg-white/15 transition-all duration-200 rounded-lg h-12"
                            >
                                <Link href="/" onClick={closeMobileMenu}>
                                    <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-brand-green/20 border border-brand-green/30">
                                        <img src="/logo.svg" alt="NIIS-T Logo" className="w-6 h-6" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-black text-white">NIIS-T</span>
                                        <span className="truncate text-xs font-semibold text-gray-400">
                                            {isAdmin ? "Admin Portal" : "Insurance Portal"}
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* Scrollable Content Area */}
                <SidebarContent className="relative z-10 px-3 py-2 flex-1 overflow-y-auto overflow-x-hidden">
                    <SidebarGroup className="mb-4">
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1.5">
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(item.url)}
                                            tooltip={item.title}
                                            className="text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/15 rounded-lg transition-all duration-200 font-medium h-10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-brand-green data-[active=true]:to-green-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-brand-green/25 data-[active=true]:font-semibold group/item"
                                        >
                                            <Link href={item.url} onClick={closeMobileMenu}>
                                                <item.icon className="size-[18px] group-data-[active=true]/item:text-white transition-colors flex-shrink-0" />
                                                <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Fixed Footer */}
                <SidebarFooter className="relative z-10 px-3 pb-4 flex-shrink-0 border-t border-white/5 pt-4">
                    <SidebarMenu className="space-y-2">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Help & Support"
                                isActive={pathname === '/dashboard/help'}
                                className="text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/15 rounded-lg transition-all duration-200 font-medium h-10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                            >
                                <Link href="/dashboard/help" onClick={closeMobileMenu}>
                                    <HelpCircle className="size-[18px]" />
                                    <span className="group-data-[collapsible=icon]:hidden">Help & Support</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="hover:bg-white/10 active:bg-white/15 text-white rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 h-14 mt-2"
                                    >
                                        <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-brand-green/20 text-brand-green border border-brand-green/30 flex-shrink-0">
                                            <User2 className="size-[18px]" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden min-w-0">
                                            <span className="truncate font-semibold text-white">
                                                {session?.user?.fullName || session?.user?.name}
                                            </span>
                                            <span className="truncate text-xs text-gray-400">
                                                {session?.user?.email}
                                            </span>
                                        </div>
                                        <ChevronUp className="ml-auto size-4 text-gray-400 group-data-[collapsible=icon]:hidden flex-shrink-0" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 text-slate-200 z-50"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            closeMobileMenu();
                                            router.push(isAdmin ? '/admin/settings' : '/dashboard/settings');
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white"
                                    >
                                        <Settings className="size-4 text-slate-400" />
                                        Account Settings
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem
                                        onClick={() => {
                                            closeMobileMenu();
                                            router.push('/dashboard/help');
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white"
                                    >
                                        <HelpCircle className="size-4 text-slate-400" />
                                        Support Center
                                    </DropdownMenuItem>
                                    
                                    <div className="h-px bg-white/5 my-1.5"></div>
                                    
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-350 hover:bg-red-500/10 rounded-lg transition-colors focus:bg-red-500/10 focus:text-red-300"
                                    >
                                        <LogOut className="size-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
    );
}