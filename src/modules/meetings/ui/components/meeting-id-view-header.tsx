"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import {
  ChevronRightIcon,
  TrashIcon,
  PencilIcon,
  MoreVerticalIcon,
  CopyIcon,
  CheckIcon,
  Share2Icon,
  ArrowLeftIcon,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  meetingId: string;
  meetingName: string;
  onEdit: () => void;
  onRemove: () => void;
}

export const MeetingIdViewHeader = ({
  meetingId,
  meetingName,
  onEdit,
  onRemove,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const onCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Meeting link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-x-2">
        {/* Mobile Back Button - Bawaal Feature for UX */}
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className="md:hidden -ml-2 rounded-full"
        >
          <Link href="/meetings">
            <ArrowLeftIcon className="size-5" />
          </Link>
        </Button>

        {/* Breadcrumb Navigation with improved scannability */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                <Link href="/meetings">Meetings</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="hidden md:block">
              <ChevronRightIcon className="size-4 opacity-40" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <div className="flex items-center gap-x-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary md:hidden">
                   <MonitorPlay className="size-4" />
                </div>
                <BreadcrumbLink
                  asChild
                  className="font-black text-xl md:text-2xl text-foreground tracking-tight max-w-[180px] md:max-w-[400px] truncate block"
                >
                  <Link href={`/meetings/${meetingId}`}>{meetingName}</Link>
                </BreadcrumbLink>
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-x-2 self-end md:self-auto">
        {/* Quick Copy Link - Extra Feature */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyLink}
          className="hidden sm:flex rounded-xl font-bold border-border/60 hover:bg-primary/5 transition-all gap-x-2"
        >
          {copied ? (
            <CheckIcon className="size-4 text-emerald-500" />
          ) : (
            <CopyIcon className="size-4" />
          )}
          <span>{copied ? "Copied" : "Copy Link"}</span>
        </Button>

        {/* Share Button - Extra Feature */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl sm:hidden border-border/60"
          onClick={onCopyLink}
        >
          <Share2Icon className="size-4" />
        </Button>

        {/* Enhanced Dropdown Menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-xl bg-muted/50 hover:bg-muted border border-border/40">
              <MoreVerticalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/40">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
              Management
            </DropdownMenuLabel>
            
            <DropdownMenuItem onClick={onEdit} className="rounded-xl cursor-pointer py-2.5">
              <PencilIcon className="size-4 mr-3 text-muted-foreground" />
              <span className="font-semibold">Rename Meeting</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onCopyLink} className="rounded-xl cursor-pointer py-2.5 sm:hidden">
              <CopyIcon className="size-4 mr-3 text-muted-foreground" />
              <span className="font-semibold">Copy Meeting URL</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={onRemove}
              className="rounded-xl cursor-pointer py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors"
            >
              <TrashIcon className="size-4 mr-3" />
              <span className="font-semibold">Archive Meeting</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};