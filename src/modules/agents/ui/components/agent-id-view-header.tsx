"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronRightIcon, 
  TrashIcon, 
  PencilIcon, 
  MoreVerticalIcon, 
  CopyIcon,
  ExternalLink,
  Share2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  agentId: string;
  agentName: string;
  onEdit: () => void;
  onRemove: () => void;
}

export const AgentIdViewHeader = ({
  agentId,
  agentName,
  onEdit,
  onRemove,
}: Props) => {
  
  const copyId = () => {
    navigator.clipboard.writeText(agentId);
    toast.success("Agent ID copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between border-b pb-6 mb-2">
      <div className="space-y-2">
        {/* BREADCRUMB SECTION */}
        <Breadcrumb>
          <BreadcrumbList className="sm:gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-muted-foreground hover:text-primary transition-colors">
                <Link href="/agents">My Agents</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRightIcon className="size-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-foreground max-w-[150px] md:max-w-none truncate">
                {agentName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* AGENT META INFO */}
        <div className="flex items-center gap-x-3">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {agentName}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </div>
        </div>
      </div>

      {/* ACTIONS SECTION */}
      <div className="flex items-center gap-x-2">
        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-semibold gap-2"
            onClick={copyId}
          >
            <CopyIcon className="size-4" />
            Copy ID
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-semibold gap-2"
            onClick={onEdit}
          >
            <PencilIcon className="size-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-xl font-semibold gap-2 shadow-lg shadow-destructive/10"
            onClick={onRemove}
          >
            <TrashIcon className="size-4" />
            Delete
          </Button>
        </div>

        {/* MOBILE/TABLET DROPDOWN */}
        <div className="md:hidden ml-auto">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <MoreVerticalIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
              <DropdownMenuItem onClick={copyId} className="flex items-center gap-2 rounded-lg py-2.5">
                <CopyIcon className="size-4 text-muted-foreground" />
                Copy Agent ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 rounded-lg py-2.5">
                <PencilIcon className="size-4 text-muted-foreground" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5">
                <Share2 className="size-4 text-muted-foreground" />
                Share Config
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onRemove} 
                className="flex items-center gap-2 rounded-lg py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive font-bold"
              >
                <TrashIcon className="size-4" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button asChild size="sm" className="hidden sm:flex rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <Link href={`/meetings/create?agentId=${agentId}`} className="gap-2">
                <ExternalLink className="size-4" />
                Launch Agent
            </Link>
        </Button>
      </div>
    </div>
  );
};