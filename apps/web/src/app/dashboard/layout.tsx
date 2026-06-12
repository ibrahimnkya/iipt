import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { ReactNode, Suspense } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
                <Suspense fallback={<div className="w-64 bg-[#0F172A]" />}>
                    <AppSidebar />
                </Suspense>
                <SidebarInset className="flex-1 overflow-hidden flex flex-col">
                    <DashboardTopbar />
                    <main className="flex-1 overflow-auto">
                        <div className="w-full max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 pt-4">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}