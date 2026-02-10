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
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const isAdmin = session?.user?.role === "ADMIN";
    const [mobileOpen, setMobileOpen] = React.useState(false);

    // Lock body scroll when mobile menu is open
    React.useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileOpen]);

    const userNavItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Orders",
            icon: Package,
            items: [
                { title: "All Orders", url: "/dashboard/orders" },
                { title: "New Order", url: "/dashboard/orders/create" },
            ],
        },
        {
            title: "Invoices",
            icon: FileText,
            items: [
                { title: "All Invoices", url: "/dashboard/invoices" },
                { title: "Unpaid", url: "/dashboard/invoices?filter=unpaid" },
                { title: "Paid", url: "/dashboard/invoices?filter=paid" },
            ],
        },
        {
            title: "Payments",
            icon: CreditCard,
            items: [
                { title: "Payment History", url: "/dashboard/payments" },
                { title: "Pending", url: "/dashboard/payments?filter=pending" },
                { title: "Completed", url: "/dashboard/payments?filter=completed" },
            ],
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
            icon: Shield,
            items: [
                { title: "All Policies", url: "/admin/policies" },
                { title: "Create Policy", url: "/admin/policies/create" },
                { title: "Active Policies", url: "/admin/policies?filter=active" },
            ],
        },
        {
            title: "Declarations",
            icon: Package,
            items: [
                { title: "All Declarations", url: "/admin/declarations" },
                { title: "Pending Review", url: "/admin/declarations?filter=pending" },
                { title: "Approved", url: "/admin/declarations?filter=approved" },
            ],
        },
        {
            title: "Invoices",
            icon: FileText,
            items: [
                { title: "All Invoices", url: "/admin/invoices" },
                { title: "Unpaid", url: "/admin/invoices?filter=unpaid" },
                { title: "Paid", url: "/admin/invoices?filter=paid" },
            ],
        },
        {
            title: "Payments",
            icon: CreditCard,
            items: [
                { title: "All Payments", url: "/admin/payments" },
                { title: "Pending", url: "/admin/payments?filter=pending" },
                { title: "Completed", url: "/admin/payments?filter=completed" },
            ],
        },
        {
            title: "Reports",
            icon: BarChart3,
            items: [
                { title: "Overview", url: "/admin/reports" },
                { title: "Revenue Reports", url: "/admin/reports/revenue" },
                { title: "Claims Reports", url: "/admin/reports/claims" },
            ],
        },
        {
            title: "Users",
            icon: Users,
            items: [
                { title: "All Users", url: "/admin/users" },
                { title: "Add User", url: "/admin/users/create" },
                { title: "Roles & Permissions", url: "/admin/users/roles" },
            ],
        },
        {
            title: "Settings",
            icon: Settings,
            items: [
                { title: "General", url: "/admin/settings" },
                { title: "System Config", url: "/admin/settings/system" },
                { title: "Integrations", url: "/admin/settings/integrations" },
            ],
        },
    ];

    const isActive = (url: string) => {
        if (url === "/dashboard" || url === "/admin") {
            return pathname === url;
        }
        return pathname.startsWith(url);
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    const navItems = isAdmin ? adminNavItems : userNavItems;

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                aria-label="Toggle menu"
            >
                {mobileOpen ? (
                    <X className="w-5 h-5 transition-transform duration-200" />
                ) : (
                    <Menu className="w-5 h-5 transition-transform duration-200" />
                )}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeMobileMenu}
                />
            )}

            <Sidebar
                collapsible="icon"
                {...props}
                className={`
                    floating-sidebar 
                    transition-all duration-300 ease-in-out
                    lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
                    fixed lg:sticky
                    z-40
                    ${mobileOpen ? 'animate-in slide-in-from-left duration-300' : ''}
                `}
            >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-brand-blue/10 to-transparent opacity-50 pointer-events-none rounded-2xl" />

                <SidebarHeader className="relative z-10 px-3 pt-4 pb-3">
                    <SidebarMenu>
                        <SidebarMenuItem className="flex items-center justify-between gap-2">
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="
                                    hover:bg-white/10 
                                    active:bg-white/15
                                    transition-all 
                                    duration-200 
                                    rounded-lg
                                    h-12
                                "
                            >
                                <Link href="/" onClick={closeMobileMenu}>
                                    <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-brand-green/20 border border-brand-green/30">
                                        <Shield className="w-5 h-5 text-brand-green" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-black text-white">TIIPS</span>
                                        <span className="truncate text-xs font-semibold text-gray-400">
                                            {isAdmin ? "Admin Portal" : "Insurance Portal"}
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="relative z-10 px-3 py-2">
                    <SidebarGroup className="mb-4">
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1.5">
                                {navItems.map((item) =>
                                    item.items ? (
                                        <Collapsible
                                            key={item.title}
                                            asChild
                                            defaultOpen={pathname.includes(item.title.toLowerCase()) || 
                                                        item.items.some(subItem => pathname.startsWith(subItem.url))}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        tooltip={item.title}
                                                        className="
                                                            text-gray-400
                                                            hover:text-white
                                                            hover:bg-white/10
                                                            active:bg-white/15
                                                            rounded-lg
                                                            transition-all
                                                            duration-200
                                                            font-medium
                                                            h-10
                                                            group-data-[collapsible=icon]:justify-center
                                                            group-data-[collapsible=icon]:!px-2
                                                            group/trigger
                                                        "
                                                    >
                                                        <item.icon className="size-[18px] flex-shrink-0" />
                                                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-gray-500 group-hover/trigger:text-gray-300 group-data-[collapsible=icon]:hidden flex-shrink-0" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub className="ml-4 mt-1.5 space-y-1 border-l-2 border-white/5 pl-3 group-data-[collapsible=icon]:hidden">
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isActive(subItem.url)}
                                                                    className="
                                                                        text-gray-400
                                                                        hover:text-white
                                                                        hover:bg-white/10
                                                                        active:bg-white/15
                                                                        rounded-lg
                                                                        transition-all
                                                                        duration-200
                                                                        h-9
                                                                        text-sm
                                                                        data-[active=true]:text-brand-green
                                                                        data-[active=true]:bg-brand-green/15
                                                                        data-[active=true]:font-semibold
                                                                        data-[active=true]:shadow-sm
                                                                        relative
                                                                        pl-6
                                                                    "
                                                                >
                                                                    <Link href={subItem.url} onClick={closeMobileMenu}>
                                                                        {/* Active dot indicator */}
                                                                        {isActive(subItem.url) && (
                                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-green rounded-full shadow-[0_0_8px_rgba(61,164,78,0.6)]" />
                                                                        )}
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.url!)}
                                                tooltip={item.title}
                                                className="
                                                    text-gray-400
                                                    hover:text-white
                                                    hover:bg-white/10
                                                    active:bg-white/15
                                                    rounded-lg
                                                    transition-all
                                                    duration-200
                                                    font-medium
                                                    h-10
                                                    data-[active=true]:bg-gradient-to-r
                                                    data-[active=true]:from-brand-green
                                                    data-[active=true]:to-green-600
                                                    data-[active=true]:text-white
                                                    data-[active=true]:shadow-lg
                                                    data-[active=true]:shadow-brand-green/25
                                                    data-[active=true]:font-semibold
                                                    group/item
                                                "
                                            >
                                                <Link href={item.url!} onClick={closeMobileMenu}>
                                                    <item.icon className="size-[18px] group-data-[active=true]/item:text-white transition-colors flex-shrink-0" />
                                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="relative z-10 px-3 pb-4">
                    <SidebarMenu className="space-y-2">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Help & Support"
                                isActive={pathname === '/dashboard/help'}
                                className="
                                    text-gray-400 
                                    hover:text-white 
                                    hover:bg-white/10
                                    active:bg-white/15
                                    rounded-lg 
                                    transition-all 
                                    duration-200 
                                    font-medium
                                    h-10
                                    data-[active=true]:bg-white/10
                                    data-[active=true]:text-white
                                "
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
                                        className="
                                            hover:bg-white/10
                                            active:bg-white/15
                                            text-white
                                            rounded-lg
                                            transition-all
                                            duration-200
                                            border
                                            border-white/10
                                            hover:border-white/20
                                            h-14
                                            mt-2
                                        "
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
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-slate-800 border-slate-700"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            closeMobileMenu();
                                            signOut({ callbackUrl: "/login" });
                                        }}
                                        className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors focus:bg-red-500/10 focus:text-red-300"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </>
    );
}