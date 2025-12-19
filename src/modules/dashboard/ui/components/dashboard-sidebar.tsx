"use client";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { BotIcon, StarIcon, VideoIcon, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";
import { DashboardTrial } from "./dashboard-trial";

const firstSection = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: VideoIcon, label: "Meetings", href: "/meetings" },
  { icon: BotIcon, label: "Agents", href: "/agents" },
];

const secondSection = [
  { icon: StarIcon, label: "Upgrade Plan", href: "/upgrade" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur">
      {/* ================= HEADER ================= */}
      <SidebarHeader className="py-6">
        <Link
          href="/"
          className="group flex items-center gap-3 px-4"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 group-hover:scale-110 transition">
            <Image
              src="/logo.avif"
              height={30}
              width={30}
              alt="MeetFlow"
            />
          </div>

          <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            MeetFlow
          </span>
        </Link>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className="px-2">
        {/* -------- MAIN -------- */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {firstSection.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-11 px-4 rounded-lg transition-all",
                        "hover:bg-accent/70",
                        isActive
                          ? "bg-accent text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className={cn(
                            "size-5 transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />

                        <span
                          className={cn(
                            "text-[14.5px] transition-colors",
                            isActive
                              ? "text-primary font-semibold"
                              : "group-hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </span>

                        {isActive && (
                          <motion.div
                            layoutId="active-bar"
                            className="absolute left-0 h-6 w-1 rounded-r-full bg-primary"
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-4 px-4">
          <Separator />
        </div>

        {/* -------- UPGRADE -------- */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "group h-11 px-4 rounded-lg transition-all",
                        "hover:bg-primary/15 hover:text-foreground",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "text-muted-foreground"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "size-5 transition-colors",
                            isActive
                              ? "text-primary-foreground"
                              : "text-amber-500 group-hover:text-foreground"
                          )}
                        />
                        <span className="text-[14.5px] font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="p-4 bg-accent/5">
        <div className="rounded-xl border bg-card p-2 shadow-sm space-y-2">
          <DashboardTrial />
          <DashboardUserButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
