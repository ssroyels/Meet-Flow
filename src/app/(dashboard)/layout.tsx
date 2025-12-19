"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardNavbar from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
interface Props{
  children:React.ReactNode
}

export default function DashboardLayout({ children }:Props) {
  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <main className="min-h-screen w-full bg-muted p-4">
          <DashboardNavbar/>
          
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
