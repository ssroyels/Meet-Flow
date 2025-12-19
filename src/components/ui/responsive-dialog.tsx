"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Extra class for outer wrapper if needed */
  className?: string;
  /** Extra class for DialogContent */
  contentClassName?: string;
}

export const ResponsiveDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  contentClassName,
}: ResponsiveDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className={cn("sm:items-center sm:justify-center", className)}>
        <DialogContent
          className={cn(
            // mobile: wide, desktop: max width nice
            "w-[95vw] max-w-md sm:max-w-lg",
            "sm:rounded-xl",
            contentClassName
          )}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {children}
        </DialogContent>
      </div>
    </Dialog>
  );
};
