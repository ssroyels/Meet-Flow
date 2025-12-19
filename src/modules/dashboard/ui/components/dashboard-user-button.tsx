"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LogOut, User2, CreditCard, Settings, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const DashboardUserButton = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div className="flex items-center gap-3 p-2 animate-pulse">
        <div className="h-9 w-9 rounded-full bg-muted" />
        <div className="space-y-1">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-2 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const fallbackInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const handleLogout = () => {
    authClient.signOut(
      {},
      {
        onSuccess() {
          router.push("/sign-in");
        },
      }
    );
  };

  const openBilling = async () => {
    try {
      await authClient.customer.portal();
    } catch {
      alert("Unable to open billing portal");
    }
  };

  const UserInfo = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-purple-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
        <Avatar className="h-9 w-9 border-2 border-background relative">
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate leading-none mb-1">
          {user?.name ?? "Guest User"}
        </p>
        <p className="text-[11px] text-muted-foreground truncate leading-none">
          {user?.email}
        </p>
      </div>
    </div>
  );

  /* ================= MOBILE VIEW ================= */
  if (isMobile) {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <button className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-accent/50 transition-colors">
            <UserInfo />
            <ChevronUp className="size-4 text-muted-foreground" />
          </button>
        </DrawerTrigger>

        <DrawerContent className="p-2">
          <DrawerHeader className="border-b border-border/50 pb-4">
            <DrawerTitle>
              <UserInfo className="px-2" />
            </DrawerTitle>
          </DrawerHeader>

          <div className="grid grid-cols-1 gap-1 p-2">
            <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-accent transition-all">
              <User2 className="size-4 text-primary" />
              Account Settings
            </button>

            <button
              onClick={openBilling}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-accent transition-all"
            >
              <CreditCard className="size-4 text-primary" />
              Billing & Subscription
            </button>
          </div>

          <DrawerFooter className="pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-200 font-semibold"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  /* ================= DESKTOP VIEW ================= */
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center justify-between gap-2 rounded-xl p-2 transition-all duration-200 hover:bg-primary/5 border border-transparent hover:border-primary/10">
          <UserInfo />
          <ChevronUp className="size-4 text-muted-foreground transition-transform group-hover:translate-y-[-2px]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[240px] p-2 rounded-2xl shadow-xl" align="end" side="top" sideOffset={12}>
        <DropdownMenuLabel className="px-2 py-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Account</span>
        </DropdownMenuLabel>
        
        <DropdownMenuItem className="flex items-center gap-3 rounded-lg py-2.5 cursor-pointer">
          <Settings className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openBilling} className="flex items-center gap-3 rounded-lg py-2.5 cursor-pointer">
          <CreditCard className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Billing Portal</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem 
          onClick={handleLogout} 
          className="flex items-center gap-3 rounded-lg py-2.5 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="size-4" />
          <span className="text-sm font-bold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};